(() => {
  kfFx.register("inner-parallax", (el, { options, reduce, scroller }) => {
    if (!el.childNodes.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const force = +options.force || 4, min = +(options.min ?? 1025);
    // travel is a px number, or a window-width share like ‹30vw› — pushes a strip tied to window width (brand: parent + 30vw) by the same share when the width changes
    const travelRaw = String(options.travel ?? "0"), unit = /vw$/.test(travelRaw.trim()) ? "vw" : "px";
    const travel = parseFloat(travelRaw) || 0, fromScale = +(options["from-scale"] ?? 1);
    // shift — set the inner to grow% height aligned to the top and push it from −shift% to +shift% of its own height (Corp site: 110% · 10)
    const shift = +(options.shift ?? 0), frame = +(options.frame ?? 0);
    // from — gives the start position (%) separately. When given, it moves even if shift is 0 (the end position = shift)
    const hasFrom = options.from != null;
    const inner = document.createElement("div");
    inner.className = "fx-inner-parallax";
    inner.append(...el.childNodes);
    el.append(inner);
    el.style.setProperty("--fx-force", force);
    if (travel) el.style.setProperty("--fx-travel", `${travel}${unit}`);
    if ((shift || hasFrom) && options.grow) el.style.setProperty("--fx-grow", `${+options.grow}%`);
    const mm = gsap.matchMedia();
    if (!reduce) mm.add(`(min-width: ${min}px)`, () => {
      if (shift || frame || hasFrom) {
        // scale — Covers by scale without enlarging the inside · frame — the cell itself also moves (Brand: frame ±m% · inner ±m×.25% · inner 1+m×.01)
        const sc = options.scale != null ? +options.scale : 0;
        const st = () => ({ trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: true });
        if (!sc) inner.classList.add("is-pct");
        else gsap.set(inner, { scale: sc });
        // Brand: 140% height from −28.571% → 0 — the photo fit to the bottom comes down until it fits the top
        const start = hasFrom ? +options.from : -shift;
        if (shift || hasFrom) gsap.fromTo(inner, { yPercent: start }, { yPercent: shift, ease: "none", scrollTrigger: st() });
        if (frame) gsap.fromTo(el, { yPercent: -frame }, { yPercent: frame, ease: "none", scrollTrigger: st() });
        return () => inner.classList.remove("is-pct");
      }
      inner.classList.add(travel ? "is-px" : "is-on");
      if (travel) {
        // STUDIO view() type — the translate and scale properties move, not transform
        gsap.fromTo(inner, { "--fx-y": `${-travel / 2}${unit}`, "--fx-sc": fromScale }, { "--fx-y": `${travel / 2}${unit}`, "--fx-sc": 1, ease: "none", scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: true } });
        return () => inner.classList.remove("is-px");
      }
      const v = () => (el.getBoundingClientRect().height / force) * (Math.min(innerWidth, 1440) / 1440);
      gsap.fromTo(inner, { y: () => -v() / 2 }, { y: () => v() / 2, ease: "none", scrollTrigger: { trigger: el, scroller, start: "clamp(top bottom)", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      return () => inner.classList.remove("is-on");
    });
    return () => {
      mm.revert();
      el.append(...inner.childNodes);
      inner.remove();
      el.style.removeProperty("--fx-force");
      el.style.removeProperty("--fx-travel");
      el.style.removeProperty("--fx-grow");
    };
  });
})();
