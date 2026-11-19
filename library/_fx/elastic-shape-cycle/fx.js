// In each overlapped section a triangle + circle mask (mask-size 0→100%) opens with a spring, the photo slowly grows, then the mask closes in reverse with a spring.
// Two glyph pieces fly in from preset outside positions, stuttering in steps, stick on at a tilt, and return with the same steps. Sections take turns every every seconds.
(() => {
  // "x y rotation" — x·y are % of the section box, rotation in degrees
  const triple = (s, d) => { const v = String(s || d).trim().split(/[\s,]+/).map(Number); return { left: `${v[0] || 0}%`, top: `${v[1] || 0}%`, rotation: v[2] || 0 }; };
  kfFx.register("elastic-shape-cycle", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = +options.every || 7, open = +(options.open ?? 1), close = +(options.close ?? 1);
    const zoom = +(options.zoom ?? 1.05), step = +options.steps || 6, back = +options["back-steps"] || 4;
    const ease = options.ease || "elastic.out(1, 0.9)", closeEase = options["close-ease"] || "elastic.in(1, 0.9)";
    const parts = slides.map((s) => ({ s, mask: s.querySelector('[data-fx-part="mask"]') || s, pic: s.querySelector('[data-fx-part="pic"]'), glyphs: [...s.querySelectorAll('[data-fx-part="glyph"]')] }));
    const clear = () => parts.forEach((p) => {
      gsap.killTweensOf([p.mask, p.pic, ...p.glyphs].filter(Boolean));
      gsap.set(p.mask, { clearProps: "maskSize,webkitMaskSize" });
      if (p.pic) gsap.set(p.pic, { clearProps: "transform" });
      if (p.glyphs.length) gsap.set(p.glyphs, { clearProps: "left,top,transform,visibility" });
    });
    if (reduce) { gsap.set(parts[0].mask, { maskSize: "100%" }); return clear; }
    const build = ({ mask, pic, glyphs }) => {
      const tl = gsap.timeline({ paused: true });
      const shut = every - 1 - close;
      if (glyphs.length) tl.set(glyphs, { visibility: "visible" }, 0);
      tl.fromTo(mask, { maskSize: "0%" }, { maskSize: "100%", duration: open, ease }, 0);
      glyphs.forEach((g) => {
        const from = triple(g.dataset.from, "0 -15 -90"), to = triple(g.dataset.to, "50 50 0");
        tl.fromTo(g, from, { ...to, duration: 1, ease: `steps(${step})` }, 0);
        tl.to(g, { ...from, duration: 0.5, ease: `steps(${back})` }, shut + 0.5);
      });
      if (pic) tl.fromTo(pic, { scale: 1 }, { scale: zoom, duration: every - 1, ease: "none" }, 0);
      tl.to(mask, { maskSize: "0%", duration: close, ease: closeEase }, shut);
      if (glyphs.length) tl.set(glyphs, { visibility: "hidden" }, shut + 1);
      return tl;
    };
    let tls = [], at = 0, timer = 0, started = false;
    const play = (i) => { at = i; tls[i].restart(); };
    const start = () => {
      stop();
      tls = parts.map(build);
      play(0);
      timer = setInterval(() => play((at + 1) % parts.length), every * 1000);
    };
    function stop() { clearInterval(timer); tls.forEach((t) => t.pause(0).kill()); tls = []; }
    const go = () => { if (!started) { started = true; start(); } };
    // If wait is given, starts when an event of that name (such as loader end) fires on window
    const wait = options.wait;
    if (wait) addEventListener(wait, go); else go();
    const vis = () => { if (!started) return; document.visibilityState === "visible" ? start() : stop(); };
    document.addEventListener("visibilitychange", vis);
    return () => { if (wait) removeEventListener(wait, go); document.removeEventListener("visibilitychange", vis); stop(); clear(); };
  });
})();
