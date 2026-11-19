(() => {
  // Brush-script SVG title: when the block top touches the bottom edge of the screen (once), letter outlines are drawn as strokes (dashoffset dash→0), then from the split point the stroke disappears and the fill comes in.
  // The original’s draw effect is a single CSS keyframe (3s linear, 0~60% stroke, 60~100% fill), so both segments are straight curves
  const resolve = (el, value) => {
    const probe = document.createElement("span");
    probe.style.color = value;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  kfFx.register("brush-draw-fill", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const glyphs = [...el.querySelectorAll('text, path, [data-fx-part="glyph"]')];
    if (!glyphs.length) return;
    const color = resolve(el, getComputedStyle(el).getPropertyValue("--fx-fill").trim() || "currentColor");
    if (reduce) { gsap.set(glyphs, { fill: color, stroke: "transparent" }); return () => { const left = glyphs.filter((n) => n.isConnected); if (left.length) gsap.set(left, { clearProps: "fill,stroke" }); }; }
    const dur = +(options.dur ?? 3), split = Math.min(0.99, Math.max(0.01, +(options.split ?? 0.6))), dash = +(options.dash ?? 1000);
    const width = +(options.width ?? 1);
    const ease = kfFx.ease(options.ease || "none", "none");
    gsap.set(glyphs, { fill: "transparent", stroke: "transparent", strokeWidth: 0, strokeDasharray: dash, strokeDashoffset: dash });
    // The per-letter stroke Type (School original: 24 strokes at .05s each, drawn over 1s, filled from .6s later over .7s, stroke kept) is opened up with draw · fill-at · fill-dur · stagger · keep.
    // If not given it is the same as before — all draw dur×split together, then fill dur×(1−split) while erasing the line
    const draw = options.draw != null ? +options.draw : dur * split;
    const fillDur = options["fill-dur"] != null ? +options["fill-dur"] : dur * (1 - split);
    const fillAt = options["fill-at"] != null ? +options["fill-at"] : draw;
    const drawEase = options["draw-ease"] ? kfFx.ease(options["draw-ease"], "power1.out") : ease;
    const fillEase = options["fill-ease"] ? kfFx.ease(options["fill-ease"], "sine.in") : ease;
    const stagger = +(options.stagger ?? 0), delay = +(options.delay ?? 0), keep = options.keep === "true";
    let tl = null;
    const play = () => {
      tl?.kill();
      tl = gsap.timeline({ delay });
      tl.set(glyphs, { stroke: color, strokeWidth: width, strokeDashoffset: dash, fill: "transparent" }, 0);
      glyphs.forEach((g, i) => {
        const at = i * stagger;
        tl.to(g, { strokeDashoffset: 0, duration: draw, ease: drawEase }, at);
        tl.to(g, { ...(!keep && { stroke: "transparent", strokeWidth: 0 }), fill: color, duration: fillDur, ease: fillEase }, at + fillAt);
      });
    };
    // wait: true means it is not triggered by scroll and only waits for fx:show (the first-screen title after the loader lifts)
    const st = options.wait === "true" ? null : ScrollTrigger.create({ trigger: el, start: options.start || "top bottom", once: options.once !== "false", onEnter: play, ...(scroller && { scroller }) });
    el.addEventListener("fx:show", play);
    return () => {
      st?.kill(); tl?.kill();
      el.removeEventListener("fx:show", play);
      const left = glyphs.filter((n) => n.isConnected);
      if (left.length) gsap.set(left, { clearProps: "fill,stroke,strokeWidth,strokeDasharray,strokeDashoffset" });
    };
  });
})();
