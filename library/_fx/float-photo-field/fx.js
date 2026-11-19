// Photo constellation: each photo frame scattered on the board gets a different depth — scroll parallax (50~100 per frame, every third one ×.25),
// Moves ±50px opposite the mouse (lagging, with a different .005~.0125 share per cell), levitates over 15~35s. Cells seen first rise from below the screen at .2x scale in 2s expo.out, staggered by .2 — hero of a reference site
(() => {
  const seeded = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  kfFx.register("float-photo-field", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const rnd = seeded(+(options.seed ?? 7) * 7919);
    const push = +(options.push ?? 50), lo = +(options.speed ?? 50), span = +(options.spread ?? 50);
    const cells = items.map((item, i) => {
      let speed = rnd() * span + lo;
      if (i % 3 === 0) speed *= 0.25;
      const media = item.querySelector('[data-fx-part="media"]') || item.firstElementChild || item;
      const float = item.querySelector('[data-fx-part="float"]');
      if (float && !reduce) { float.style.animationDuration = `${(rnd() * 20 + 15).toFixed(1)}s`; float.style.animationDelay = `${(rnd() * 0.2).toFixed(2)}s`; }
      return { item, media, speed, ease: rnd() * 0.02 + 0.01 + (i % 2 === 0 ? 0.0025 : -0.0025), x: 0.5, y: 0.5 };
    });
    if (reduce) return () => {};
    const aim = { x: 0.5, y: 0.5 };
    let seen = true, raf = 0, dead = false;
    const paint = () => {
      const vh = innerHeight;
      cells.forEach((c) => {
        const r = c.item.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (vh + r.height)));
        const s = c.speed * 0.5;
        c.item.style.setProperty("--fx-par", `${(s + (-s - s) * p).toFixed(1)}px`);
      });
    };
    const tick = () => {
      if (dead) return;
      if (seen) cells.forEach((c) => {
        c.x += (aim.x - c.x) * c.ease * 0.5;
        c.y += (aim.y - c.y) * c.ease * 0.5;
        c.media.style.transform = `translate(${((1 - c.x) * push * 2 - push).toFixed(2)}px, ${((1 - c.y) * push * 2 - push).toFixed(2)}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    const move = (e) => { if (seen) { aim.x = e.clientX / innerWidth; aim.y = e.clientY / innerHeight; } };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(el);
    addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    if (hover) { document.addEventListener("mousemove", move); tick(); }
    paint();
    let intro = null;
    if (options.intro !== "off") {
      const vh = innerHeight;
      const first = cells.filter((c) => c.item.getBoundingClientRect().top < vh).map((c) => c.item.querySelector('[data-fx-part="intro"]') || c.item);
      if (first.length) intro = gsap.fromTo(first, { y: vh, opacity: 0, scale: 0.2 }, { y: 0, opacity: 1, scale: 1, duration: +(options.dur ?? 2), ease: kfFx.ease(options.ease || "expo.out", "expo.out"), stagger: +(options.each ?? 0.2), delay: +(options.delay ?? 0) });
    }
    return () => {
      dead = true; cancelAnimationFrame(raf); io.disconnect();
      removeEventListener("scroll", paint); removeEventListener("resize", paint); document.removeEventListener("mousemove", move);
      intro?.kill();
      cells.forEach((c) => { c.media.style.transform = ""; c.item.style.removeProperty("--fx-par"); });
    };
  });
})();
