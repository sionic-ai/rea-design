// Endless row where the card row slides one slot at a time with prev/next buttons — the advance of the STUDIO carousel (sd-carousel).
// All cards move together ∓100% over .6s cubic-bezier(.58,.21,.41,.96), and when they arrive the front (back) card is sent to the opposite end and the position is reset to 0.
// One more slide is set up on the left in advance (the row starts one cell to the left) so no empty spot shows when going back — a row centered like on a phone always has both sides filled.
// Cards rotate with css order only, without touching document order — tab movement, screen reading and hover order start from the first visible card
(() => {
  kfFx.register("step-loop-carousel", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const slides = () => [...track.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (slides().length < 2) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.6) * 1000;
    const ease = options.ease || "cubic-bezier(0.58, 0.21, 0.41, 0.96)";
    const wait = reduce ? 0 : +(options.delay ?? 0) * 1000;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const ac = new AbortController();
    // every — advances to the next slot by itself every that many seconds (pressing restarts the count from then). Brand feature card row 5s
    const every = reduce ? 0 : +(options.every ?? 0);
    let busy = false, queued = 0, timer = 0, auto = 0;
    const restart = () => { clearInterval(auto); if (every > 0) auto = setInterval(() => go(1), every * 1000); };
    // head = Card number at the far-left (hidden ”back card”) slot — at first the last card
    let head = slides().length - 1;
    const place = () => {
      const list = slides(), n = list.length;
      head = ((head % n) + n) % n;
      list.forEach((s, i) => (s.style.order = String((i - head + n) % n)));
    };
    place();
    const first = () => slides().find((s) => s.style.order === "0") || slides()[0];
    const ro = new ResizeObserver(() => el.style.setProperty("--fx-slide-w", `${first().offsetWidth}px`));
    ro.observe(slides()[0]);
    el.classList.add("fx-slc-ready");

    const settle = (dir) => {
      const list = slides();
      list.forEach((s) => { s.style.transition = "none"; s.style.transform = ""; });
      head += dir;
      place();
      void track.offsetWidth;
      list.forEach((s) => (s.style.transition = ""));
      busy = false;
      if (queued) { const d = queued; queued = 0; go(d); }
    };
    const go = (dir) => {
      if (busy) { queued = dir; return; }
      busy = true;
      slides().forEach((s) => {
        s.style.transition = dur ? `transform ${dur}ms ${ease} ${wait}ms` : "none";
        s.style.transform = `translateX(${dir > 0 ? -100 : 100}%)`;
      });
      el.dispatchEvent(new CustomEvent("fx:step", { detail: { dir } }));
      timer = setTimeout(() => settle(dir), dur + (dur ? wait : 0));
    };
    prev?.addEventListener("click", () => { go(-1); restart(); }, { signal: ac.signal });
    next?.addEventListener("click", () => { go(1); restart(); }, { signal: ac.signal });
    // start: view — auto-advance is counted from when the board first enters the screen (the Studio carousel wakes when first seen, and after that keeps running even off-screen — Brand reviews row)
    let wake = null;
    if (options.start === "view" && every > 0) {
      wake = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { wake.disconnect(); restart(); } });
      wake.observe(el);
    } else restart();
    // pause: hover. The carousel stops auto advancing on mouseenter and resumes counting on mouseleave (Brand site header news strip)
    if (options.pause === "hover") {
      el.addEventListener("mouseenter", () => clearInterval(auto), { signal: ac.signal });
      el.addEventListener("mouseleave", restart, { signal: ac.signal });
    }
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    }, { signal: ac.signal });

    return () => {
      ac.abort(); ro.disconnect(); wake?.disconnect(); clearTimeout(timer); clearInterval(auto);
      slides().forEach((s) => { s.style.transition = ""; s.style.transform = ""; s.style.order = ""; });
      el.classList.remove("fx-slc-ready");
      el.style.removeProperty("--fx-slide-w");
    };
  });
})();
