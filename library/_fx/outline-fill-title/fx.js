(() => {
  // Title (SVG <text> Self data-fx-part="glyph") when it reaches 70% of the screen (once) the outline is drawn in a pale color in .7s, then for .7s the outline and inside fill with the text color.
  // When the content starts filling, fade items in the same Section (scope) come in from transparent and up items from 24px below, together over .7s. If the text isn’t SVG, the title itself enters with fade.
  const resolve = (el, value) => {
    const probe = document.createElement("span");
    probe.style.color = value;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  kfFx.register("outline-fill-title", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = (options.scope && el.closest(options.scope)) || el;
    const glyphs = [...el.querySelectorAll('text, [data-fx-part="glyph"]')];
    const fades = [...(glyphs.length ? [] : [el]), ...scope.querySelectorAll('[data-fx-part="fade"]')];
    const ups = [...scope.querySelectorAll('[data-fx-part="up"]')];
    if (reduce || (!glyphs.length && !fades.length && !ups.length)) return;
    const startColor = resolve(el, getComputedStyle(el).getPropertyValue("--fx-stroke-start").trim() || "color-mix(in oklab, currentColor 35%, transparent)");
    const endColor = resolve(el, getComputedStyle(el).getPropertyValue("--fx-fill").trim() || "currentColor");
    const dur = +(options.dur ?? 0.7), ease = options.ease || "power2.out";
    if (glyphs.length) gsap.set(glyphs, { stroke: "transparent", fill: "transparent" });
    if (fades.length) gsap.set(fades, { opacity: 0 });
    if (ups.length) gsap.set(ups, { opacity: 0, y: 24 });
    let tl = null;
    const st = ScrollTrigger.create({
      trigger: el, start: options.start || "top 70%", once: true, ...(scroller && { scroller }),
      onEnter: () => {
        tl = gsap.timeline();
        if (glyphs.length) {
          tl.to(glyphs, { stroke: startColor, fill: "transparent", duration: dur, ease });
          tl.addLabel("fill");
          tl.to(glyphs, { stroke: endColor, fill: endColor, duration: dur, ease });
        } else tl.addLabel("fill", dur);
        if (fades.length) tl.to(fades, { opacity: 1, duration: dur, ease }, "fill");
        if (ups.length) tl.to(ups, { opacity: 1, y: 0, duration: dur, ease }, "fill");
      },
    });
    return () => {
      st.kill(); tl && tl.kill();
      // If detached after the whole element is already gone, no target remains — passing an empty array makes GSAP raise ”target not found”
      const left = [...glyphs, ...fades, ...ups].filter((n) => n.isConnected);
      if (left.length) gsap.set(left, { clearProps: "stroke,fill,opacity,transform" });
    };
  });
})();
