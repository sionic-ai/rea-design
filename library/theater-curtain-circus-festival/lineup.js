// Cast page: flowing head cast strip (wave) · date pill filtering · pill strip sticks to the screen bottom · wall that sags per column
(() => {
  // Pill group: a white panel slides behind the chosen pill in .6s main (the FAQ strip uses it too)
  PP.pills = (group) => {
    const mark = group.querySelector("[data-pills-mark]");
    const place = (p, instant) => {
      group.querySelectorAll(".pp-pills__pill").forEach((x) => x.classList.toggle("is-active", x === p));
      if (!mark || !p) return;
      gsap.to(mark, { x: p.offsetLeft, width: p.offsetWidth, duration: instant || PP.reduced ? 0 : 0.6, ease: "main", overwrite: true });
    };
    const ro = new ResizeObserver(() => place(group.querySelector(".pp-pills__pill.is-active"), true));
    ro.observe(group);
    place(group.querySelector(".pp-pills__pill.is-active"), true);
    return { place, off: () => ro.disconnect() };
  };

  // Header cast strip: flows at a default 2rem/s, speeds up by scroll speed × 6 (follow .15s · release .6s, max 250rem/s)
  // Cards bob up and down ±2rem (up to 3rem when faster) in a wave five cards long. Dragging follows the hand and releasing throws at the release speed
  const DRIFT = { speed: 2, scroll: 6, follow: 0.15, settle: 0.6, throw: 250, cards: 5, height: 2, boost: 0.15, most: 3 };
  const heads = (root) => {
    const sec = root.querySelector("[data-headliners]");
    const track = root.querySelector("[data-heads-track]");
    if (!sec || !track) return null;
    const count = 10;
    track.innerHTML = Array.from({ length: count }, (_, i) => `<div class="pp-heads__item">${PPC.artist(i * 3 + 1)}</div>`).join("");
    const base = [...track.children];
    const rem = (n) => n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    let loop = 0, items = [];
    const fill = () => {
      while (track.children.length > base.length) track.lastElementChild.remove();
      loop = base.length > 1 ? (base[1].offsetLeft - base[0].offsetLeft) * base.length : 0;
      while (loop > 0 && track.scrollWidth < loop + innerWidth * 1.2) base.forEach((b) => { const c = b.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelectorAll("a").forEach((a) => (a.tabIndex = -1)); track.append(c); });
      items = [...track.children].map((el) => ({ el, at: el.offsetLeft, w: el.offsetWidth, y: null }));
    };
    fill();
    let d = 0, v = 0, dir = -1, drag = null, shownX = null, lastScroll = scrollY;
    const tick = (time, dms) => {
      const dt = Math.min(dms || 16, 100) / 1000;
      if (!dt) return;
      const sv = PP.lenis ? PP.lenis.velocity : scrollY - lastScroll;
      lastScroll = scrollY;
      if (sv) dir = sv > 0 ? -1 : 1;
      const B = rem(DRIFT.speed);
      if (!drag) {
        const want = PP.reduced ? 0 : dir * Math.min(rem(DRIFT.throw), B * (1 + (Math.abs(sv) / innerHeight / dt) * DRIFT.scroll));
        const faster = Math.abs(want) > Math.abs(v) || want * v < 0;
        v += (want - v) * (1 - Math.exp(-dt / (faster ? DRIFT.follow : DRIFT.settle)));
        d += v * dt;
      }
      d = loop > 0 ? ((d % loop) - loop) % loop : 0;
      const x = Math.round(d * 10) / 10;
      if (x !== shownX) track.style.transform = `translate3d(${(shownX = x)}px,0,0)`;
      const Q = (loop / base.length) * DRIFT.cards;
      const F = PP.reduced ? 0 : rem(Math.min(DRIFT.most, DRIFT.height + DRIFT.boost * Math.max(0, Math.abs(v) / B - 1)));
      for (const it of items) {
        const at = it.at + d;
        if (at + it.w < 0 || at > innerWidth) continue;
        const y = Math.round(Math.sin(((at + it.w / 2) / Q) * Math.PI * 2) * F * 10) / 10;
        if (y !== it.y) it.el.style.translate = `0 ${(it.y = y)}px`;
      }
    };
    const io = new IntersectionObserver(([e]) => gsap.ticker[e.isIntersecting ? "add" : "remove"](tick), { rootMargin: "25% 0px" });
    io.observe(sec);
    track.addEventListener("dragstart", (e) => e.preventDefault());
    track.addEventListener("pointerdown", (e) => { if (e.button === 0) drag = { from: d, start: e.clientX, last: e.clientX, at: e.timeStamp }; });
    track.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!track.hasPointerCapture(e.pointerId) && Math.abs(e.clientX - drag.start) > 4) track.setPointerCapture(e.pointerId);
      d = drag.from + e.clientX - drag.start;
      const s = (e.timeStamp - drag.at) / 1000;
      if (s > 0) v += ((e.clientX - drag.last) / s - v) * 0.5;
      drag.last = e.clientX; drag.at = e.timeStamp;
    });
    const up = (e) => {
      if (!drag) return;
      if (e.timeStamp - drag.at > 80) v = 0;
      drag = null;
      const cap = rem(DRIFT.throw);
      v = PP.reduced ? 0 : gsap.utils.clamp(-cap, cap, v);
      if (v) dir = Math.sign(v);
    };
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    const ro = new ResizeObserver(fill);
    ro.observe(sec);
    return () => { io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); };
  };

  // Discovery wall: choosing a date pill sends the visible cards out to main in .4s, and new cards stand 0 → 1x (.6s softBounce) at .08s intervals
  const finder = (root) => {
    const sec = root.querySelector("[data-finder]");
    const wall = root.querySelector("[data-finder-wall]");
    if (!sec || !wall) return null;
    const all = Array.from({ length: 32 }, (_, i) => PPC.artist(i));
    const days = ["Gold", "Earth", "Day"];
    const mq = matchMedia("(min-width: 992px)");
    let day = "all";
    const build = (pop) => {
      const cols = mq.matches ? 4 : 2;
      const list = all.filter((_, i) => day === "all" || days[i % 3] === day);
      wall.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      wall.innerHTML = Array.from({ length: cols }, (_, c) => `<div class="pp-lineup__col" data-fx-part="item">${list.filter((_, i) => i % cols === c).join("")}</div>`).join("");
      if (!pop || PP.reduced) return ScrollTrigger.refresh();
      const seen = [...wall.querySelectorAll(".pp-artist")].filter((a) => { const r = a.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      gsap.fromTo(seen, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "softBounce", stagger: 0.08, clearProps: "scale,opacity", onComplete: () => ScrollTrigger.refresh() });
    };
    build(false);
    const groups = [...sec.querySelectorAll("[data-pills]")].map(PP.pills);
    const [dayPills, viewPills] = groups;
    sec.querySelectorAll("[data-pills]")[0].addEventListener("click", (e) => {
      const p = e.target.closest(".pp-pills__pill");
      if (!p || p.dataset.day === day) return;
      day = p.dataset.day;
      dayPills.place(p);
      const seen = [...wall.querySelectorAll(".pp-artist")].filter((a) => { const r = a.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      if (PP.reduced || !seen.length) return build(true);
      gsap.to(seen, { scale: 0.6, opacity: 0, duration: 0.4, ease: "main", stagger: 0.04, onComplete: () => build(true) });
    });
    sec.querySelectorAll("[data-pills]")[1].addEventListener("click", (e) => { const p = e.target.closest(".pp-pills__pill"); if (p) viewPills.place(p); });
    // Pill bar: after passing the section head, it sticks to the bottom center of the screen and releases when the wall ends
    const bar = sec.querySelector("[data-finder-bar]");
    const st = ScrollTrigger.create({ trigger: bar, start: "bottom 80px", endTrigger: wall, end: "bottom bottom", onToggle: (s) => bar.toggleAttribute("data-docked", s.isActive) });
    const re = () => build(false);
    mq.addEventListener("change", re);
    return () => { st.kill(); mq.removeEventListener("change", re); groups.forEach((g) => g.off()); };
  };

  PP.page("lineup", (root) => {
    const offs = [heads(root), finder(root)];
    return () => offs.forEach((f) => f?.());
  });
})();
