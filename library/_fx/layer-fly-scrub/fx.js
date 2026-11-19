(() => {
  // Moving through the layered image scene, each layer grows by its set amount and flies outward — like a camera walking into a forest (Brand hero).
  // The section height is the scroll length and the inner stage sticks with sticky. Layer targets are in data-to="scale: 2; x: 100%; y: 50%"
  kfFx.register("layer-fly-scrub", (el, { options, reduce, scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!layers.length || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const curve = (v, d) => (!v ? d : /^[\d.\s,-]+$/.test(v) ? kfFx.ease(v, d) : v);
    const st = { trigger: el, start: options.start || "top top", end: options.end || "bottom bottom", scrub: options.scrub != null && options.scrub !== "true" ? +options.scrub : true, ...(scroller && { scroller }) };
    const parse = (s) => {
      const o = {};
      for (const part of (s || "").split(";")) {
        const i = part.indexOf(":");
        if (i < 1) continue;
        const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
        o[k === "alpha" ? "autoAlpha" : k] = /^-?[\d.]+$/.test(v) ? +v : v;
      }
      return o;
    };
    const tws = layers.map((l) => gsap.to(l, { ...parse(l.dataset.to), ease: curve(options.ease, "none"), scrollTrigger: st }));
    // cover — over the same range, the overlay covering the stage darkens 0→1 (original white overlay power1.in)
    const cover = el.querySelector('[data-fx-part="cover"]');
    if (cover) tws.push(gsap.fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, ease: curve(options["cover-ease"], "power1.in"), scrollTrigger: st }));
    return () => tws.forEach((t) => { t.scrollTrigger?.kill(); t.revert(); });
  });
})();
