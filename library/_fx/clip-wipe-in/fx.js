(() => {
  // batch — panels entering in the same frame are gathered top then left in order and delayed by batch seconds each (max 6 panels) (reference-site IntersectionObserver wave)
  let pending = [], queued = false;
  const flush = () => {
    queued = false;
    const list = pending;
    pending = [];
    list
      .map((p) => ({ p, r: p.el.getBoundingClientRect() }))
      .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)
      .forEach(({ p }, n) => p.play(Math.min(n, 6) * p.step));
  };
  const enqueue = (p) => { pending.push(p); if (!queued) { queued = true; requestAnimationFrame(flush); } };

  kfFx.register("clip-wipe-in", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const r = options.radius ? +options.radius : 16;
      // Length · curve · start position are options — the brand dotted divider turns on at 80% of the screen in 1s power1.out, opacity too (fade: 1)
      const dur = +(options.dur ?? 1), ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut"), fade = options.fade === "1" || options.fade === "true";
      // from — the side where the cut face starts opening (default left). zoom — inner [data-fx-part="zoom"] settles down together from that multiple to 1. delay — postponement (seconds)
      const shut = { left: "0 100% 0 0", right: "0 0 0 100%", top: "0 0 100% 0", bottom: "100% 0 0 0" }[options.from] || "0 100% 0 0";
      const zoom = +(options.zoom ?? 1), delay = +(options.delay ?? 0), inner = zoom !== 1 ? el.querySelectorAll('[data-fx-part="zoom"]') : [];
      // Some sites run opacity and inner zoom with a different length and curve than the open (Brand: open 1.3s, opacity 1.5s ease, photo 1.5s ease .08s later)
      const fadeDur = +(options["fade-dur"] ?? dur), fadeEase = options["fade-ease"] ? kfFx.ease(options["fade-ease"], "power1.inOut") : ease;
      const zoomDur = +(options["zoom-dur"] ?? dur), zoomEase = options["zoom-ease"] ? kfFx.ease(options["zoom-ease"], "power1.inOut") : ease, zoomDelay = delay + +(options["zoom-delay"] ?? 0);
      // zoom-y — the inside settles together at this % of its own height (negative is up) (Brand B −6)
      const zoomY = +(options["zoom-y"] ?? 0), step = options.batch != null ? +options.batch : null;
      const from = { clipPath: `inset(${shut} round ${r}px)` }, to = { clipPath: `inset(0 0% 0 0 round ${r}px)` };
      const zFrom = zoomY ? { scale: zoom, yPercent: zoomY } : { scale: zoom }, zTo = zoomY ? { scale: 1, yPercent: 0 } : { scale: 1 };
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const st = { scroller, trigger: el, start: options.start || "top bottom-=100px", once: true };
        if (step == null) {
          gsap.fromTo(el, from, { ...to, duration: dur, delay, ease, scrollTrigger: st });
          if (fade) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: fadeDur, delay, ease: fadeEase, scrollTrigger: st });
          if (inner.length) gsap.fromTo(inner, zFrom, { ...zTo, duration: zoomDur, delay: zoomDelay, ease: zoomEase, scrollTrigger: st });
          return;
        }
        gsap.set(el, from);
        if (fade) gsap.set(el, { opacity: 0 });
        if (inner.length) gsap.set(inner, zFrom);
        // On entering, the panel emits fx:in(detail.delay) — so things like labels outside the panel can float up with the same delay
        const play = (extra) => !signal.aborted && fxCtx.add(() => {
          gsap.to(el, { ...to, duration: dur, delay: delay + extra, ease });
          if (fade) gsap.to(el, { opacity: 1, duration: fadeDur, delay: delay + extra, ease: fadeEase });
          if (inner.length) gsap.to(inner, { ...zTo, duration: zoomDur, delay: zoomDelay + extra, ease: zoomEase });
          el.dispatchEvent(new CustomEvent("fx:in", { bubbles: true, detail: { delay: delay + extra } }));
        });
        ScrollTrigger.create({ ...st, onEnter: () => { if (!signal.aborted) enqueue({ el, play, step }); } });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
