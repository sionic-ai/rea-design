// Moves a row of cells overflowing horizontally (scroll-snap when pushed by hand) one cell at a time with prev · next buttons.
// Stretching the duration to match the distance (300 + 300·√(distance/total width) ms) is as in the original — so one step or all the way feels like the same speed.
(() => {
  kfFx.register("snap-row-step", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const base = +(options.base ?? 0.3), span = +(options.span ?? 0.3);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    const items = () => [...track.children].filter((c) => c.offsetWidth > 0);
    const pitch = () => { const a = items(); return a.length > 1 ? a[1].offsetLeft - a[0].offsetLeft : (a[0]?.offsetWidth || track.clientWidth); };
    const maxX = () => Math.max(0, track.scrollWidth - track.clientWidth);
    let tween = null, index = 0;
    const mark = () => {
      const x = track.scrollLeft;
      prev?.toggleAttribute("data-off", x <= 1);
      next?.toggleAttribute("data-off", x >= maxX() - 1);
    };
    const go = (to) => {
      const p = pitch(); if (!p) return;
      const n = items().length;
      index = Math.max(0, Math.min(n - 1, to));
      const from = track.scrollLeft, x = Math.min(maxX(), index * p);
      const dur = reduce ? 0 : base + span * Math.sqrt(Math.abs(x - from) / (track.scrollWidth || 1));
      tween?.kill();
      track.style.scrollSnapType = "none";
      const o = { v: from };
      tween = gsap.to(o, { v: x, duration: dur, ease, onUpdate: () => { track.scrollLeft = o.v; }, onComplete: () => { track.style.scrollSnapType = ""; mark(); } });
      el.dispatchEvent(new CustomEvent("fx:step", { detail: { index } }));
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    const here = () => Math.round(track.scrollLeft / (pitch() || 1));
    prev?.addEventListener("click", () => go(here() - 1), on);
    next?.addEventListener("click", () => go(Math.min(here() + 1, Math.ceil(maxX() / (pitch() || 1)))), on);
    el.addEventListener("fx:prev", () => go(here() - 1), on);
    el.addEventListener("fx:next", () => go(here() + 1), on);
    track.addEventListener("scroll", mark, { passive: true, signal: ac.signal });
    // Keep a horizontal wheel at the line end from leaking into the browser back gesture (original)
    track.addEventListener("wheel", (e) => {
      const x = track.scrollLeft;
      if ((x <= 0 && e.deltaX < 0) || (x >= maxX() - 1 && e.deltaX > 0)) e.preventDefault();
    }, { passive: false, signal: ac.signal });
    const ro = "ResizeObserver" in window ? new ResizeObserver(mark) : null;
    ro?.observe(track);
    mark();
    return () => { ac.abort(); ro?.disconnect(); tween?.kill(); track.style.scrollSnapType = ""; prev?.removeAttribute("data-off"); next?.removeAttribute("data-off"); };
  });
})();
