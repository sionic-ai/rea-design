// Framer appear (appear · onInView): once an element is visible past the threshold (half by default), it settles into place from 0 opacity and 10px below with a damped spring (stiffness 400 · damping 30 · mass 1).
// The spring runs as a GSAP curve stretching the analytic solution x(t) to the length until it settles — so the duration comes from stiffness·damping (400/30/1 gives about .5s, slight overshoot then settle)
(() => {
  const springOf = (k, c, m) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x;
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t)); }
    else if (z === 1) x = (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    else { const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1)); x = (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1); }
    let T = 0.02;
    for (let t = 0.02; t < 4; t += 0.01) if (Math.abs(1 - x(t)) > 0.002) T = t + 0.01;
    const end = x(T);
    return { duration: T, ease: (p) => (p >= 1 ? 1 : x(p * T) / end) };
  };
  kfFx.register("spring-appear", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap) return;
    const sp = springOf(+(options.k || 400), +(options.c || 30), +(options.m || 1));
    const from = { opacity: +(options.opacity ?? 0), y: +(options.y ?? 10), x: +(options.x ?? 0), scale: +(options.scale ?? 1) };
    gsap.set(el, from);
    let tw;
    const io = new IntersectionObserver((ents) => {
      if (!ents.some((e) => e.isIntersecting)) return;
      io.disconnect();
      tw = gsap.to(el, { opacity: 1, y: 0, x: 0, scale: 1, duration: sp.duration, ease: sp.ease, delay: +(options.delay ?? 0) });
    }, { root: scroller || null, threshold: +(options.amount ?? 0.5) });
    // on: document event name — visibility is checked only after receiving that signal (font or loader finished). If absent, right on attach
    const watch = () => io.observe(el);
    if (options.on) document.addEventListener(options.on, watch, { once: true });
    else watch();
    return () => { if (options.on) document.removeEventListener(options.on, watch); io.disconnect(); tw?.kill(); gsap.set(el, { clearProps: "opacity,transform" }); };
  });
})();
