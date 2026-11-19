(() => {
  kfFx.register("frame-flip-loop", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (!frames.length) return;
    const every = +options.every || 800, pop = options.pop === "on", fade = options.hide === "opacity";
    let i = 0, timer = null;
    const show = () => {
      // hide: with opacity, keep the space and only change opacity — changing display would also change the computed values of inner shapes
      frames.forEach((f, n) => { if (fade) f.style.opacity = n === i ? "1" : "0"; else f.style.display = n === i ? "block" : "none"; });
      // Original Elastic panel only — pops up at .95 each time it changes
      if (pop && window.gsap) gsap.fromTo(frames[i], { scale: 0.95 }, { scale: 1, duration: 1.5, ease: "elastic.out(1.2, 0.4)" });
    };
    show();
    if (reduce || frames.length < 2) return () => frames.forEach((f) => { f.style.display = ""; f.style.opacity = ""; });
    const start = () => { if (!timer) timer = setInterval(() => { i = (i + 1) % frames.length; show(); }, every); };
    const stop = () => { clearInterval(timer); timer = null; };
    // Don’t advance off-screen — dozens run at once on a page
    // run: always keeps advancing even offscreen — for things that must look like they have always been running, like the footer art
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    if (options.run === "always") start(); else io.observe(el);
    return () => { stop(); io.disconnect(); frames.forEach((f) => { f.style.display = ""; f.style.opacity = ""; }); if (window.gsap) gsap.set(frames, { clearProps: "transform" }); };
  });
})();
