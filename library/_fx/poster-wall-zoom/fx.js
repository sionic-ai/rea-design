// Poster wall — while passing the section (tall cell) --fx-frame is tied to scroll from 0→1 (scrub 1.2), and the mouse position is converted to a screen ratio (−1~1) and approaches 5% each time it moves
(() => {
  kfFx.register("poster-wall-zoom", (el, { options, reduce, hover, scroller }) => {
    if (!window.gsap) return;
    const track = el.closest("[data-fx-part=track]") || el;
    let trig = null;
    if (reduce || !window.ScrollTrigger) el.style.setProperty("--fx-frame", options.rest ?? "1");
    else trig = gsap.to(el, { "--fx-frame": 1, ease: "none", scrollTrigger: { trigger: track, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: +(options.scrub ?? 1.2) } });
    let px = 0, py = 0;
    const k = +(options.follow ?? 0.05);
    const move = (e) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      px = gsap.utils.interpolate(px, (e.clientX / innerWidth) * 2 - 1, k);
      py = gsap.utils.interpolate(py, (e.clientY / innerHeight) * 2 - 1, k);
      el.style.setProperty("--fx-px", px);
      el.style.setProperty("--fx-py", py);
    };
    if (hover && !reduce) addEventListener("pointermove", move);
    return () => {
      removeEventListener("pointermove", move);
      trig?.scrollTrigger?.kill();
      trig?.kill();
      ["--fx-frame", "--fx-px", "--fx-py"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
