// Home — auto-advancing step panel, price table rows appearing, drag-to-flip doctor cards, auto-advancing reviews, signup box image swap
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Step panel: while visible, advances to the next step every 6 seconds while the ring fills. Clicking a step button starts from that step ----
  const stage = document.querySelector(".p-stage");
  if (stage) {
    const DUR = 6000;
    const C = 2 * Math.PI * 10.9;
    const steps = [...stage.querySelectorAll(".p-stage__step")];
    const pics = [...stage.querySelectorAll(".p-stage__pic")];
    const copies = [...stage.querySelectorAll(".p-stage__copy")];
    let active = 0;
    let t0 = performance.now();
    let seen = false;
    const bits = [...stage.querySelectorAll(".p-stage__bits")].map((g) => [...g.children]);
    const show = (i) => {
      active = (i + steps.length) % steps.length;
      steps.forEach((s, k) => {
        s.classList.toggle("is-active", k === active);
        s.setAttribute("aria-selected", String(k === active));
        s.querySelector(".p-ring-fill").setAttribute("stroke-dashoffset", (k < active ? 0 : C).toFixed(3));
      });
      pics.forEach((p, k) => p.classList.toggle("is-active", k === active));
      // The outgoing item only fades out, while the incoming one is first placed at the lower, blurred position and then rises
      const incoming = [copies[active], ...(bits[active] || [])];
      [...copies, ...bits.flat()].forEach((el) => {
        el.classList.remove("is-active");
        el.classList.toggle("is-enter", incoming.includes(el));
      });
      void stage.offsetWidth;
      incoming.forEach((el) => { el.classList.remove("is-enter"); el.classList.add("is-active"); });
      stage.dataset.tone = copies[active].dataset.tone || "light";
      t0 = performance.now();
    };
    steps.forEach((s, k) => s.addEventListener("click", () => { if (k !== active) show(k); }));
    new IntersectionObserver((en) => { seen = en[0].isIntersecting; }, { threshold: 0.3 }).observe(stage);
    show(0);
    if (!reduce) {
      let paused = 0;
      gsap.ticker.add(() => {
        const now = performance.now();
        if (!seen) { if (!paused) paused = now; return; }
        if (paused) { t0 += now - paused; paused = 0; }
        const r = Math.min(1, (now - t0) / DUR);
        steps[active].querySelector(".p-ring-fill").setAttribute("stroke-dashoffset", (C * (1 - r)).toFixed(3));
        if (r >= 1) show(active + 1);
      });
    }
  }

  // ---- Value table: when the first row is 15% visible, each row is delayed by .1s ----
  const member = document.querySelector(".p-member");
  if (member && !reduce) {
    const rows = [...member.querySelectorAll("[data-row]")];
    member.classList.add("is-armed");
    void member.offsetHeight;
    const io = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return;
      rows.forEach((r, i) => setTimeout(() => r.classList.add("is-visible"), i * 100));
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(rows[0]);
  }

  // ---- Doctor card row: drag past 60px for one step, resist like rubber at the ends ----
  const viewport = document.querySelector(".p-docs__viewport");
  if (viewport) {
    const list = viewport.querySelector(".p-docs__list");
    const cards = [...list.children];
    const THRESHOLD = 60;
    let idx = 0;
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    const maxIdx = () => Math.max(0, Math.ceil((list.scrollWidth - viewport.clientWidth) / Math.max(1, step())));
    const maxShift = () => Math.max(0, list.scrollWidth - viewport.clientWidth);
    const base = () => Math.min(idx * step(), maxShift());
    const clampDrag = (pos) => {
      const lo = -maxShift();
      if (pos > 0) return pos * 0.3;
      if (pos < lo) return lo + (pos - lo) * 0.3;
      return pos;
    };
    const goTo = (i, animate) => {
      idx = Math.max(0, Math.min(maxIdx(), i));
      list.style.transition = animate ? "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
      list.style.transform = `translateX(${-base()}px)`;
    };
    let down = false, startX = 0, dragX = 0;
    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; startX = e.pageX; dragX = 0;
      viewport.classList.add("is-down");
      list.style.transition = "none";
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      dragX = e.pageX - startX;
      list.style.transform = `translateX(${clampDrag(-base() + dragX)}px)`;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      viewport.classList.remove("is-down");
      if (dragX < -THRESHOLD) goTo(idx + 1, true);
      else if (dragX > THRESHOLD) goTo(idx - 1, true);
      else goTo(idx, true);
    });
    let tx = 0, ty = 0, tdx = 0, horiz = null;
    viewport.addEventListener("touchstart", (e) => { tx = e.touches[0].pageX; ty = e.touches[0].pageY; tdx = 0; horiz = null; list.style.transition = "none"; }, { passive: true });
    viewport.addEventListener("touchmove", (e) => {
      const dx = e.touches[0].pageX - tx, dy = e.touches[0].pageY - ty;
      if (horiz === null && Math.abs(dx) + Math.abs(dy) > 6) horiz = Math.abs(dx) > Math.abs(dy);
      if (!horiz) return;
      tdx = dx;
      list.style.transform = `translateX(${clampDrag(-base() + tdx)}px)`;
    }, { passive: true });
    viewport.addEventListener("touchend", () => {
      if (tdx < -THRESHOLD) goTo(idx + 1, true);
      else if (tdx > THRESHOLD) goTo(idx - 1, true);
      else goTo(idx, true);
    });
    viewport.addEventListener("dragstart", (e) => e.preventDefault());
    addEventListener("resize", () => goTo(idx, false));
  }

  // ---- Reviews: next card every 8 seconds (.75s), the current bar fills straight in the meantime. Click a bar to jump to that card, dragging also advances ----
  const voices = document.querySelector(".p-voices");
  if (voices) {
    const track = voices.querySelector(".p-voices__track");
    const segs = [...voices.querySelectorAll(".p-voices__seg")];
    const count = voices.querySelector(".p-voices__count");
    const cards = [...track.children];
    const DURATION = 8000;
    let idx = 0, timer = 0, started = 0;
    const width = () => cards[0].getBoundingClientRect().width;
    const paint = () => {
      track.style.transform = `translateX(${-idx * width()}px)`;
      count.textContent = `${idx + 1} / ${cards.length}`;
      segs.forEach((s, k) => {
        s.classList.toggle("is-active", k === idx);
        const f = s.querySelector("i");
        f.style.transition = "none";
        f.style.width = k < idx ? "100%" : "0%";
      });
    };
    const run = () => {
      clearTimeout(timer);
      if (reduce) return;
      const f = segs[idx].querySelector("i");
      void f.offsetWidth;
      f.style.transition = `width ${DURATION}ms linear`;
      f.style.width = "100%";
      started = performance.now();
      timer = setTimeout(() => go(idx + 1), DURATION);
    };
    const go = (i) => {
      idx = (i + cards.length) % cards.length;
      paint();
      run();
    };
    segs.forEach((s, k) => s.addEventListener("click", () => go(k)));
    let sx = 0, dragging = false, moved = false;
    const vp = voices.querySelector(".p-voices__viewport");
    vp.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; dragging = true; moved = false; sx = e.pageX; });
    addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.pageX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.style.transition = "none"; }
      if (moved) track.style.transform = `translateX(${-idx * width() + dx}px)`;
    });
    addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      if (!moved) return;
      const dx = e.pageX - sx;
      go(dx < -60 ? idx + 1 : dx > 60 ? idx - 1 : idx);
    });
    vp.addEventListener("dragstart", (e) => e.preventDefault());
    new IntersectionObserver((en) => { if (en[0].isIntersecting && !started) go(0); }, { threshold: 0.2 }).observe(voices);
    paint();
    addEventListener("resize", paint);
  }

})();
