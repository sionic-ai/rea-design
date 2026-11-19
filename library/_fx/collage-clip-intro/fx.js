// A scattered photo collage rises from below, clipped, starting with the leftmost on screen. When the photos are almost all up, the ring is drawn and the face shapes follow upward.
// Photo order follows the left edge on screen, not DOM order — so it flows left to right even if the layout changes
(() => {
  const SHUT = "inset(100% 0% 0% 0%)", OPEN = "inset(0% 0% 0% 0%)";
  kfFx.register("collage-clip-intro", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const shapes = [...el.querySelectorAll('[data-fx-part="shape"]')];
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    const strokes = rings.flatMap((r) => [...r.querySelectorAll("circle, path, ellipse")]);
    if (!photos.length && !shapes.length && !rings.length) return;
    const all = [...photos, ...shapes, ...rings];
    // Passing an empty list to GSAP gives a ‹target not found› warning — pass only what exists.
    const put = (list, vars) => { if (list.length) gsap.set(list, vars); };
    const clear = () => { put(all, { clearProps: "clipPath,opacity,visibility" }); put(strokes, { clearProps: "strokeDasharray,strokeDashoffset" }); };
    if (reduce) {
      put([...photos, ...shapes], { clipPath: OPEN });
      put([...shapes, ...rings], { autoAlpha: 1 });
      return clear;
    }
    const dur = +(options.dur ?? 1), each = +(options.each ?? 0.08), gap = +(options.gap ?? 0.3);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const ringDur = +(options["ring-dur"] ?? 1.1), ringEase = kfFx.ease(options["ring-ease"] || "power2.inOut", "power2.inOut");
    const lag = +(options["shape-lag"] ?? 0.15), shapeEach = +(options["shape-each"] ?? 0.15);
    const lengthOf = (s) => (typeof s.getTotalLength === "function" ? s.getTotalLength() : 0) || 0;
    photos.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    put(photos, { clipPath: SHUT });
    put([...shapes, ...rings], { autoAlpha: 0 });
    put(shapes, { clipPath: SHUT });
    strokes.forEach((s) => { const L = lengthOf(s); gsap.set(s, { strokeDasharray: `0 ${L + 1}`, strokeDashoffset: 0 }); });
    const tl = gsap.timeline({ paused: true, defaults: { ease } });
    if (photos.length) tl.fromTo(photos, { clipPath: SHUT }, { clipPath: OPEN, duration: dur, stagger: each }, 0);
    const at = each * Math.max(photos.length - 1, 0) + gap;
    if (rings.length) {
      tl.set(rings, { autoAlpha: 1 }, at);
      strokes.forEach((s) => {
        const L = lengthOf(s);
        tl.to(s, { strokeDasharray: `${L} 0.1`, duration: ringDur, ease: ringEase }, at);
      });
    }
    if (shapes.length) {
      tl.set(shapes, { autoAlpha: 1 }, at + lag);
      tl.fromTo(shapes, { clipPath: SHUT }, { clipPath: OPEN, duration: dur, stagger: shapeEach }, at + lag);
    }
    // after: <Event name> Waits until a preceding scene, such as the first entry curtain, signals it is done (starts anyway after limit seconds).
    // gate: <html class> — Waits only when that class is present (for in-site navigation where no curtain appears, go straight on load)
    let started = false, timer = 0;
    const go = () => { if (started) return; started = true; clearTimeout(timer); tl.play(); };
    const after = options.after;
    const wait = after && (!options.gate || document.documentElement.classList.contains(options.gate));
    const onLoad = () => go();
    if (wait) {
      window.addEventListener(after, go, { once: true });
      timer = setTimeout(go, +(options.limit ?? 6) * 1000);
    } else if (document.readyState === "complete") go();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      clearTimeout(timer);
      if (after) window.removeEventListener(after, go);
      window.removeEventListener("load", onLoad);
      tl.kill();
      clear();
    };
  });
})();
