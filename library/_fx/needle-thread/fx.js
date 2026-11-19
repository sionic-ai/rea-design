(() => {
  // Original (About section thread on a personal portfolio site): the dotted line (6 9) is drawn bound to scroll (scrub 1.2) from when the section top hits 12% of the screen until its bottom hits 60%,
  // A needle (ellipse 2.5×4) follows its end (hidden for the first 1% and last 6%). Once the needle passes the signature height, the signature is written from the left —
  // The needle turns on at .4s, rests .25s, then sweeps across over 2.2s with power1.inOut, revealing.
  kfFx.register("needle-thread", (el, { options, reduce, scroller }) => {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const svg = el.querySelector(':scope > [data-fx-part="thread"]');
    const path = svg?.querySelector('[data-fx-part="path"]');
    if (!svg || !path || !path.getTotalLength) return;
    const needle = svg.querySelector('[data-fx-part="needle"]');
    const sign = el.querySelector('[data-fx-part="sign"]');
    const vb = svg.viewBox.baseVal;
    const VW = vb?.width || 1000, VH = vb?.height || 1000;
    const fixNeedle = () => {
      const r = svg.getBoundingClientRect();
      if (needle && r.width && r.height) needle.setAttribute("rx", 2.5 * (VW / r.width)), needle.setAttribute("ry", 4 * (VH / r.height));
    };
    let L = path.getTotalLength();
    path.style.strokeDasharray = options.dash || "6 9";
    if (reduce) {
      path.style.strokeDashoffset = 0;
      if (needle) needle.style.opacity = 0;
      if (sign) sign.style.clipPath = "none";
      return () => { path.style.removeProperty("stroke-dasharray"); path.style.removeProperty("stroke-dashoffset"); if (sign) sign.style.removeProperty("clip-path"); };
    }
    fixNeedle();
    path.style.strokeDashoffset = L;
    if (needle) gsap.set(needle, { opacity: 0 });
    // Where in the panel (0 to VH) the signature starts — wake it once the needle passes there
    const signY = () => {
      if (!sign) return Infinity;
      const a = sign.getBoundingClientRect(), b = svg.getBoundingClientRect();
      return b.height ? ((a.top - b.top) / b.height) * VH : Infinity;
    };
    let woke = !sign, at = signY();
    const wake = sign && gsap.timeline({ paused: true })
      .fromTo(sign, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: +(options.dur ?? 2.2), ease: "power1.inOut" }, 0.4 + 0.25);
    const state = { p: 0 };
    const tw = gsap.to(state, {
      p: 1, ease: "none",
      scrollTrigger: { trigger: el, scroller, start: options.start || "top 12%", end: options.end || "bottom 60%", scrub: +(options.scrub ?? 1.2) },
      onUpdate: () => {
        const p = state.p;
        path.style.strokeDashoffset = L * (1 - p);
        const pt = path.getPointAtLength(L * p);
        if (needle) gsap.set(needle, { attr: { cx: pt.x, cy: pt.y }, opacity: p <= 0.01 || p > 0.94 ? 0 : 1 });
        if (!woke && pt.y >= at) { woke = true; wake.play(); }
      },
    });
    const ro = new ResizeObserver(() => { fixNeedle(); L = path.getTotalLength(); at = signY(); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      tw.scrollTrigger?.kill(); tw.kill(); wake?.kill();
      path.style.removeProperty("stroke-dasharray"); path.style.removeProperty("stroke-dashoffset");
      if (sign) gsap.set(sign, { clearProps: "clipPath" });
      if (needle) gsap.set(needle, { clearProps: "opacity" });
    };
  });
})();
