(() => {
  // A strip alternating upright bars (bar) and diagonally joined plates (diag) is built one at a time from the left cell — bars rise from the floor (scaleY 0→1),
  // The diagonal panel opens from the left edge toward the right (clip-path). The original (Brand) chains .18s per cell at .13s intervals
  // Looks like one band being drawn, and only the last bar settles down slowly over 1s
  const pts = (s) => (s.match(/polygon\((.*)\)/)?.[1] || "").split(",").map((p) => p.trim());

  kfFx.register("zigzag-ribbon-build", (el, { options, reduce }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="bar"], [data-fx-part="diag"]')];
    // Hidden so a band fully built in one frame before fx.css attaches doesn’t show through — released here (the band stays even if this is removed)
    el.classList.add("fx-zigzag-built");
    if (!parts.length || reduce) return;
    const start = +(options.start ?? 0.8);
    const each = +(options.each ?? 0.13);
    const dur = +(options.dur ?? 0.18);
    const last = +(options.last ?? 1);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    const lastEase = kfFx.ease(options["last-ease"] || "0.23,1,0.32,1", "expo.out");

    const tl = gsap.timeline();
    parts.forEach((p, i) => {
      const at = start + i * each;
      const isLast = i === parts.length - 1;
      const d = isLast ? last : dur;
      const e = isLast ? lastEase : ease;
      if (p.dataset.fxPart === "bar") {
        tl.fromTo(p, { opacity: 0, scaleY: 0, transformOrigin: "50% 100%" }, { opacity: 1, scaleY: 1, duration: d, ease: e, immediateRender: true }, at);
      } else {
        const end = getComputedStyle(p).clipPath;
        const q = pts(end);
        if (q.length !== 4) {
          tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: d, ease: e, immediateRender: true }, at);
          return;
        }
        const from = `polygon(${q[0]}, ${q[0]}, ${q[3]}, ${q[3]})`;
        tl.fromTo(p, { opacity: 0, clipPath: from }, { opacity: 1, clipPath: end, duration: d, ease: e, immediateRender: true }, at);
      }
    });
    return () => { tl.kill(); gsap.set(parts, { clearProps: "opacity,transform,clipPath" }); };
  });
})();
