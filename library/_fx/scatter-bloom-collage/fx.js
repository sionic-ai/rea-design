// Scattered photo collection — when the board enters 72% of the screen, the pieces bloom in shuffled order staggered by .08 over .9s (from .1 scale, or sliding in 64px from the side, up to their own opacity).
// During scroll, bigger pieces flow upward more (140~320px, narrow screens 48~110px) (scrub .55), and the center text also flows 72px. Following the mouse, each piece shakes separately by strength × 14px over .85s power3.out (Brand legacy).
(() => {
  kfFx.register("scatter-bloom-collage", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const content = el.querySelector('[data-fx-part="content"]');
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const dur = +(options.dur ?? 0.9), each = +(options.each ?? 0.08), from = +(options.from ?? 0.1), shift = +(options.shift ?? 64), mouse = +(options.mouse ?? 14);
    const frames = items.map((it) => it.firstElementChild || it);
    const alpha = (it) => +(it.dataset.opacity ?? 1);
    if (reduce) { frames.forEach((f, i) => gsap.set(f, { autoAlpha: alpha(items[i]) })); return; }
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" }, (ctx) => {
      const wide = ctx.conditions.wide;
      const seen = el.getBoundingClientRect().top < 0.72 * innerHeight;
      if (seen) frames.forEach((f, i) => gsap.set(f, { autoAlpha: alpha(items[i]), scale: 1, x: 0 }));
      else {
        frames.forEach((f, i) => {
          const side = items[i].dataset.revealFrom || "center", grow = items[i].dataset.scale !== "false";
          gsap.set(f, { autoAlpha: 0, scale: grow ? from : 1, x: side === "left" ? -shift : side === "right" ? shift : 0 });
        });
        const tl = gsap.timeline({ paused: true });
        gsap.utils.shuffle(frames.map((_, i) => i)).forEach((k, n) => {
          tl.to(frames[k], { autoAlpha: alpha(items[k]), scale: 1, x: 0, duration: dur, ease }, n * each);
        });
        ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 72%", once: true, onEnter: () => tl.play() });
      }
      const widths = items.map((it) => it.offsetWidth || 1), lo = Math.min(...widths), hi = Math.max(...widths);
      const [min, max] = wide ? [+(options.min ?? 140), +(options.max ?? 320)] : [+(options["min-narrow"] ?? 48), +(options["max-narrow"] ?? 110)];
      frames.forEach((f, i) => {
        const s = hi <= lo ? max : min + gsap.utils.clamp(0, 1, (widths[i] - lo) / (hi - lo)) * (max - min);
        gsap.fromTo(f, { y: 0.45 * s }, { y: -s, ease: "none", scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: 0.55, invalidateOnRefresh: true } });
      });
      if (content) {
        const m = wide ? +(options.content ?? 72) : 28;
        gsap.fromTo(content, { y: 0.35 * m }, { y: -m, ease: "none", scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: 0.55, invalidateOnRefresh: true } });
      }
      if (!hover || !mouse) return;
      const movers = items.map((it) => {
        const p = { x: 0, y: 0 }, k = +(it.dataset.mouse ?? 1);
        const draw = () => (it.style.translate = `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`);
        return { k, x: gsap.quickTo(p, "x", { duration: 0.85, ease: "power3.out", onUpdate: draw }), y: gsap.quickTo(p, "y", { duration: 0.85, ease: "power3.out", onUpdate: draw }) };
      });
      // Follow only when the board is on screen — no reason for an invisible board to wiggle at every gesture elsewhere
      let near = false;
      const io = new IntersectionObserver(([e]) => (near = !!e?.isIntersecting));
      io.observe(el);
      const move = (e) => {
        if (!near) return;
        const nx = (e.clientX / innerWidth - 0.5) * 2, ny = (e.clientY / innerHeight - 0.5) * 2;
        movers.forEach((m) => { m.x(nx * mouse * m.k); m.y(ny * mouse * m.k); });
      };
      addEventListener("pointermove", move, { passive: true });
      return () => { io.disconnect(); removeEventListener("pointermove", move); items.forEach((it) => (it.style.translate = "")); };
    });
    return () => mm.revert();
  });
})();
