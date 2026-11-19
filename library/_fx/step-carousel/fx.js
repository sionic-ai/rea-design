// A row of cards narrower than the board width is pushed one cell at fixed intervals and loops endlessly — one set is cloned behind it, and on reaching the first cell of the clone set it returns to the start position with no transition.
// Pauses while hovered (on hover), prev/next buttons move one step, the play button stops the spin and turns it back on. Pauses off-screen.
(() => {
  kfFx.register("step-carousel", (el, { options, reduce, hover }) => {
    const track = el.querySelector(':scope [data-fx-part="track"]');
    if (!track) return;
    const slides = [...track.children].filter((n) => n.matches('[data-fx-part="slide"]'));
    if (slides.length < 2) return;
    const every = +(options.every || 3000);
    const dur = +(options.dur ?? 600);
    const ease = options.ease || "cubic-bezier(0.4, 0.4, 0, 1)";
    const clones = slides.map((s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.inert = true; return c; });
    track.append(...clones);
    const ac = new AbortController();
    let i = 0, playing = !reduce && options.auto !== "0", hovered = false, seen = true, timer = 0;
    const step = () => (slides[1].offsetLeft - slides[0].offsetLeft) || slides[0].offsetWidth;
    const place = (anim) => {
      track.style.transition = anim && !reduce ? `transform ${dur}ms ${ease}` : "none";
      track.style.transform = `translate3d(${-i * step()}px, 0, 0)`;
    };
    const go = (d) => {
      if (i + d < 0) { i = slides.length; place(false); track.offsetWidth; }
      i += d;
      place(true);
    };
    track.addEventListener("transitionend", (e) => {
      if (e.target !== track) return;
      if (i >= slides.length) { i -= slides.length; place(false); }
    }, { signal: ac.signal });
    const tick = () => { if (playing && !hovered && seen) go(1); };
    const restart = () => { clearInterval(timer); timer = setInterval(tick, every); };
    restart();
    if (hover && options.hover !== "0") {
      el.addEventListener("pointerenter", () => { hovered = true; }, { signal: ac.signal });
      el.addEventListener("pointerleave", () => { hovered = false; restart(); }, { signal: ac.signal });
    }
    // view — runs only while the panel is visible by this much (fraction) or more (default 0 = If even slightly visible)
    const view = Math.min(1, Math.max(0, +(options.view ?? 0)));
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting && e.intersectionRatio >= view; }, { threshold: view ? [0, view] : 0 });
    io.observe(el);
    const prev = el.querySelector(':scope [data-fx-part="prev"]');
    const next = el.querySelector(':scope [data-fx-part="next"]');
    const toggle = el.querySelector(':scope [data-fx-part="toggle"]');
    prev?.addEventListener("click", () => { go(-1); restart(); }, { signal: ac.signal });
    next?.addEventListener("click", () => { go(1); restart(); }, { signal: ac.signal });
    const mark = () => {
      el.toggleAttribute("data-playing", playing);
      toggle?.setAttribute("aria-pressed", String(playing));
    };
    toggle?.addEventListener("click", () => { playing = !playing; mark(); restart(); }, { signal: ac.signal });
    mark();
    const ro = new ResizeObserver(() => place(false));
    ro.observe(track);
    place(false);
    return () => {
      ac.abort(); clearInterval(timer); io.disconnect(); ro.disconnect();
      clones.forEach((c) => c.remove());
      track.style.removeProperty("transition"); track.style.removeProperty("transform");
      el.removeAttribute("data-playing");
    };
  });
})();
