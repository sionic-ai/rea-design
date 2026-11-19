(() => {
  // The frame margin around the photo panel pinned to the screen clears away and darkens on scroll, while passing the text track above it, the stacked photos switch one after another
  kfFx.register("sticky-unframe-dim", (el, { options, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const frame = el.querySelector('[data-fx-part="frame"]');
    const track = el.querySelector('[data-fx-part="track"]');
    if (!stage || !frame || !track) return;
    gsap.registerPlugin(ScrollTrigger);
    const layers = [...frame.querySelectorAll('[data-fx-part="layer"]')];
    const lines = [...track.querySelectorAll('[data-fx-part="line"]')];
    const inset = +(options.inset ?? 26), dim = +(options.dim ?? 40), rise = +(options.y ?? 50);
    // The original gives no curve for brightness and photo overlap, so it uses the GSAP default (power1.out) — only frames and text lines use none
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const sc = scroller ? { scroller } : {};
    const mm = gsap.matchMedia();
    mm.add({ move: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      if (conditions.still) {
        gsap.set(frame, { clipPath: "inset(0px 0px 0px 0px)" });
        if (layers.length) gsap.set(layers, { opacity: (i) => (i === layers.length - 1 ? 1 : 0), filter: `brightness(${dim}%)` });
        return;
      }
      const range = { trigger: stage, start: "center center", endTrigger: track, end: "top top", scrub: true, invalidateOnRefresh: true, ...sc };
      gsap.fromTo(frame, { clipPath: `inset(${inset}px ${inset}px ${inset}px ${inset}px)` }, { clipPath: "inset(0px 0px 0px 0px)", ease: "none", scrollTrigger: range });
      if (layers.length) gsap.fromTo(layers, { filter: "brightness(100%)" }, { filter: `brightness(${dim}%)`, ease, scrollTrigger: { ...range } });
      lines.forEach((t) => gsap.fromTo(t, { y: rise, opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: t, start: "top 90%", end: "bottom 70%", scrub: true, ...sc } }));
      // With n photos, split the text range into n−1 segments and each segment lets the next photo float up overlapping — only the last one waits until the range end reaches the screen center
      if (layers.length > 1) {
        const n = layers.length - 1;
        gsap.set(layers, { opacity: (i) => (i ? 0 : 1) });
        layers.forEach((l, i) => {
          if (!i) return;
          gsap.to(l, { opacity: 1, ease, scrollTrigger: { trigger: track, start: `${((i - 1) / n) * 100}% top`, end: i === n ? "bottom center" : `${(i / n) * 100}% top`, scrub: true, ...sc } });
        });
      }
    });
    // When fonts or photos arrive late and the text section length changes, re-measure the chunk positions
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    ro.observe(track);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mm.revert(); };
  });
})();
