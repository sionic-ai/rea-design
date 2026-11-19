// The cylinder radius is set by line height and angle — the distance where two neighboring lines neither overlap nor spread apart
(() => {
  kfFx.register("drum-roll", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), ang = +options.angle || 26, every = +options.every || 2;
      const lines = [...el.children], n = lines.length;
      if (n < 2) return;
      const h = lines[0].offsetHeight || 40, radius = h / (2 * Math.sin((ang * Math.PI) / 360)), o = { v: 0 };
      const render = () => lines.forEach((li, k) => {
        let d = (((k - o.v) % n) + n) % n;
        if (d > n / 2) d -= n;
        const a = Math.max(-90, Math.min(90, d * ang)), r = (a * Math.PI) / 180;
        gsap.set(li, { y: radius * Math.sin(r), z: radius * (Math.cos(r) - 1), rotationX: -a, autoAlpha: Math.max(0, Math.cos(r)) ** 2 });
      });
      render();
      if (reduce) return;
      const tl = gsap.fromTo(o, { v: 0 }, { v: n, duration: n * beat * every, ease: "none", repeat: -1, paused: true, onUpdate: render });
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
