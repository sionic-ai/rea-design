(() => {
  // When line art enters the screen, each group draws at the same time and the lines inside a group draw in order, while fill areas darken over the same duration
  kfFx.register("stroke-draw-in", (el, { options, reduce, scroller }) => {
    const groups = [...el.querySelectorAll('[data-fx-part="group"]')];
    const sets = (groups.length ? groups : [el]).map((g) => [...g.querySelectorAll("path, line, polyline, circle, ellipse")].filter((p) => !p.closest('[data-fx-part="fill"]') && typeof p.getTotalLength === "function"));
    const lines = sets.flat();
    if (!lines.length) return;
    const fills = [...el.querySelectorAll('[data-fx-part="fill"]')];
    if (reduce) return;
    const dur = +(options.dur ?? 1.5), each = +(options.each ?? 0.2);
    lines.forEach((p) => { const len = p.getTotalLength() || 1; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    if (fills.length) gsap.set(fills, { fillOpacity: 0 });
    const tl = gsap.timeline({ paused: true });
    sets.forEach((s) => s.length && tl.to(s, { strokeDashoffset: 0, duration: dur, stagger: each }, 0));
    if (fills.length) tl.to(fills, { fillOpacity: 1, duration: dur }, 0);
    const st = ScrollTrigger.create({ trigger: options.trigger ? el.closest(options.trigger) || el : el, scroller, start: options.start || "center center+=25%", once: true, onEnter: () => tl.play() });
    return () => {
      st.kill(); tl.kill();
      lines.forEach((p) => { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; });
      if (fills.length) gsap.set(fills, { clearProps: "fillOpacity" });
    };
  });
})();
