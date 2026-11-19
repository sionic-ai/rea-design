// The faster the scroll, the denser the blur layers on the band at the bottom of the screen, clearing when it stops — the original stacks Lenis speed with a different multiplier per layer
(() => {
  const CAP = [0.05, 0.16, 0.22, 0.35, 0.55];
  const GAIN = [0.003, 0.005, 0.007, 0.009, 0.011];
  kfFx.register("velocity-edge-blur", (el, { options, reduce }) => {
    if (reduce) return;
    if (options.height) el.style.setProperty("--fx-height", options.height);
    if (options.bottom) el.style.setProperty("--fx-bottom", options.bottom);
    const gain = +(options.gain ?? 1), settle = +(options.settle ?? 150);
    const band = document.createElement("div");
    band.className = "fx-band";
    band.innerHTML = '<i class="fx-layer"></i>'.repeat(5);
    el.append(band);
    // The original draws the value array reversed — the weakest blur layer (3px) gets the largest cap (.55), and the 75px layer gets .05
    const layers = [...band.children].reverse();
    const val = CAP.map(() => 0);
    let timer = 0, fade = null, lastY = scrollY, lastT = 0;
    const draw = () => layers.forEach((l, i) => { l.style.opacity = val[i]; });
    const push = (v) => {
      const r = Math.abs(v) * gain;
      fade?.kill();
      for (let i = 0; i < 5; i++) val[i] = Math.min(val[i] + r * GAIN[i], CAP[i]);
      draw();
      clearTimeout(timer);
      timer = setTimeout(() => { fade = gsap.to(val, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, duration: 0.8, ease: "power1.out", onUpdate: draw }); }, settle);
    };
    const onLenis = (l) => push(l.velocity);
    const onScroll = () => {
      const now = performance.now();
      if (!lastT) lastT = now;
      const dt = Math.max(1, now - lastT);
      push(((scrollY - lastY) / dt) * 16.7);
      lastY = scrollY; lastT = now;
    };
    let bound = null;
    const bind = () => {
      if (window.lenis?.on) { window.lenis.on("scroll", onLenis); bound = window.lenis; }
      else addEventListener("scroll", onScroll, { passive: true });
    };
    // The page script may create Lenis later in the same bundle — wait one frame, then pick
    const raf = requestAnimationFrame(bind);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      fade?.kill();
      bound?.off?.("scroll", onLenis);
      removeEventListener("scroll", onScroll);
      band.remove();
      el.style.removeProperty("--fx-height");
      el.style.removeProperty("--fx-bottom");
    };
  });
})();
