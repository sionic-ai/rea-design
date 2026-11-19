(() => {
  const pair = (v, d) => {
    const p = String(v ?? d).split(",").map(Number);
    return p.length === 2 && p.every(Number.isFinite) ? p : String(d).split(",").map(Number);
  };
  kfFx.register("sticky-window-grow", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    gsap.registerPlugin(ScrollTrigger);
    const shade = el.querySelector('[data-fx-part="shade"]');
    const fv = el.querySelector('[data-fx-part="fv"]');
    const copy = el.querySelector('[data-fx-part="copy"]');
    const intro = el.querySelector('[data-fx-part="intro"]');
    const spacer = el.querySelector('[data-fx-part="spacer"]');
    const top = el.querySelector('[data-fx-part="piece"][data-at="top"]');
    const narrow = matchMedia("(max-width: 990px)");
    const pick = (k, d) => (narrow.matches && options[k + "-narrow"] != null ? options[k + "-narrow"] : options[k] ?? d);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.ease) el.style.setProperty("--fx-ease", options.ease.includes(",") ? `cubic-bezier(${options.ease})` : options.ease);

    // Text color flip and intro text switch on past a threshold (.6s) rather than scroll-scrubbed like the original, and switch off when leaving the panel in between
    const observers = [];
    const watch = (target, margin, cls) => {
      if (!spacer || !target) return;
      const io = new IntersectionObserver(([e]) => target.classList.toggle(cls, e.isIntersecting), { root: scroller || null, rootMargin: `0px 0px ${margin} 0px` });
      io.observe(spacer);
      observers.push(io);
    };
    watch(copy, options.flip ?? "-25%", "is-flip");
    watch(intro, options.intro ?? "-50%", "is-in");

    const mm = gsap.matchMedia();
    if (reduce) {
      gsap.set(stage, { scaleX: 1, scaleY: 1, y: 0 });
      if (shade) gsap.set(shade, { opacity: 1 });
    } else {
      mm.add({ narrow: "(max-width: 990px)", wide: "(min-width: 991px)" }, () => {
        const [sx, sy] = pair(pick("from"), "0.29,0.275");
        const lift = +(pick("lift") ?? -7), x0 = +(pick("x") ?? 0), x1 = +(pick("x-end") ?? 0);
        const [g0, g1] = pair(pick("grow"), "0,0.5"), [s0, s1] = pair(pick("shade"), "0,0.75");
        const [f0, f1] = pair(pick("fade"), "0,0.3"), [p0, p1] = pair(pick("piece"), "0.0138,0.5958");
        const pieceFrom = +(pick("piece-from") ?? -17.7084);
        // Progress 1 = From when the section’s top edge touches the top of the screen until its bottom edge touches the bottom of the screen (original view() contain range)
        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.fromTo(stage, { scaleX: sx, scaleY: sy, x: x0, y: lift }, { scaleX: 1, scaleY: 1, x: x1, y: 0, duration: g1 - g0 }, g0);
        if (shade) tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: s1 - s0 }, s0);
        if (fv) tl.fromTo(fv, { opacity: 1 }, { opacity: 0, duration: f1 - f0 }, f0);
        if (top && p1 > p0) tl.fromTo(top, { y: () => (pieceFrom * innerHeight) / 100 }, { y: 0, duration: p1 - p0 }, p0);
        tl.set({}, {}, 1);
        ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: true, animation: tl, invalidateOnRefresh: true });
      });
    }
    return () => {
      mm.revert();
      observers.forEach((o) => o.disconnect());
      copy?.classList.remove("is-flip");
      intro?.classList.remove("is-in");
      for (const x of [stage, shade, fv, top]) if (x) gsap.set(x, { clearProps: "transform,opacity" });
      ["--fx-dur", "--fx-ease"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
