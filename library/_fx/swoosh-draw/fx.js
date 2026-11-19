(() => {
  // A thick, round-ended curve is drawn with stroke-dashoffset, lingers briefly, then continues in the same direction and exits.
  // Shape ([data-fx-part=shape] If there are several svg, they cycle in turn, if only one, it draws once and stops.
  kfFx.register("swoosh-draw", (el, { options, reduce }) => {
    const shapes = [...el.querySelectorAll('[data-fx-part="shape"]')].filter((s) => s.querySelector("path"));
    if (!shapes.length) return;
    const draw = +(options.draw ?? 1.2), hold = +(options.hold ?? 5.9), wipe = +(options.wipe ?? 1.2), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.645,0.045,0.355,1", "power3.inOut");
    const loop = options.loop !== "off" && shapes.length > 1;
    const len = (p) => p.getTotalLength();
    shapes.forEach((s) => { const p = s.querySelector("path"), L = len(p); gsap.set(p, { attr: { "stroke-dasharray": L, "stroke-dashoffset": L } }); s.style.visibility = "hidden"; });
    let i = 0, tl = null;
    if (reduce) { const p = shapes[0].querySelector("path"); shapes[0].style.visibility = ""; gsap.set(p, { attr: { "stroke-dashoffset": 0 } }); return () => {}; }
    const run = () => {
      const s = shapes[i], p = s.querySelector("path"), L = len(p);
      s.style.visibility = "";
      gsap.set(p, { attr: { "stroke-dasharray": L, "stroke-dashoffset": L } });
      tl = gsap.timeline({ delay: tl ? 0 : delay })
        .to(p, { attr: { "stroke-dashoffset": 0 }, duration: draw, ease });
      if (!loop) return;
      tl.fromTo(p, { attr: { "stroke-dashoffset": L * 2 } }, { attr: { "stroke-dashoffset": L }, duration: wipe, ease, immediateRender: false }, `+=${Math.max(0, hold - draw)}`)
        .call(() => { s.style.visibility = "hidden"; i = (i + 1) % shapes.length; run(); });
    };
    run();
    return () => { tl?.kill(); shapes.forEach((s) => { s.style.visibility = ""; gsap.set(s.querySelector("path"), { clearProps: "all" }); }); };
  });
})();
