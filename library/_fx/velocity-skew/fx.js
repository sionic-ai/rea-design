// The element bends sideways around its right center axis with skewY as scroll speed grows — target tilt = −speed × .25 (clipped at ±10°), and the current tilt follows .12 of the remaining difference each frame.
// Speed is ScrollTrigger velocity ÷ 60 (px per frame, same unit as the original Lenis velocity), cooled by .9 each frame. Even with many attached elements, one tick drives them all
(() => {
  const els = new Set();
  let tick = null, st = null, vel = 0, cur = 0, k = 0.25, max = 10, follow = 0.12;
  const start = () => {
    if (tick) return;
    st = ScrollTrigger.create({ onUpdate: (s) => { vel = s.getVelocity(); } });
    tick = () => {
      const v = vel / 60;
      vel *= 0.9;
      const target = gsap.utils.clamp(-max, max, -v * k);
      const next = cur + (target - cur) * follow;
      if (Math.abs(next) < 0.01 && Math.abs(target) < 0.01) { if (cur !== 0) { cur = 0; els.forEach((e) => gsap.set(e, { skewY: 0 })); } return; }
      cur = next;
      els.forEach((e) => gsap.set(e, { skewY: cur }));
    };
    gsap.ticker.add(tick);
  };
  const stop = () => { if (!tick) return; gsap.ticker.remove(tick); st?.kill(); tick = st = null; cur = vel = 0; };

  kfFx.register("velocity-skew", (el, { options, reduce }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    k = +(options.gain ?? 0.25);
    max = +options.max || 10;
    follow = +options.follow || 0.12;
    gsap.set(el, { transformOrigin: options.origin || "right center", force3D: true });
    els.add(el);
    start();
    return () => { els.delete(el); gsap.set(el, { clearProps: "transform,transformOrigin" }); if (!els.size) stop(); };
  });
})();
