(() => {
  // Amount past the band (−1~1): + when it leaves below, − when it passes above. 0 when inside the band
  const offset = (top, bottom, a, b) => (top > b ? Math.min(1, (top - b) / (1 - b)) : bottom < a ? -Math.min(1, (a - bottom) / a) : 0);
  const pair = (v, d) => (v == null ? d : String(v).trim().split(/[\s,]+/).map(Number));

  kfFx.register("band-tilt-sink", (el, { options, reduce, scroller }) => {
    const part = el.querySelector(':scope > [data-fx-part="content"]') || el;
    if (reduce) return;
    const [a, b] = pair(options.band, [0.4, 0.6]);
    const [rx0, rx1] = pair(options.rx, [-2, 8]), [ry0, ry1] = pair(options.ry, [10, 15]);
    const Y = +(options.y ?? 150), dMin = +(options.min ?? 0.1), dMax = +(options.max ?? 0.6), delay = +(options.delay ?? 0.3);
    const rx = rx0 + Math.random() * (rx1 - rx0), ry = ry0 + Math.random() * (ry1 - ry0);
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    let tween = null, st = null, intro = null;
    const update = () => {
      const r = el.getBoundingClientRect(), v = view();
      const o = offset((r.top - v.top) / v.height, (r.bottom - v.top) / v.height, a, b);
      tween?.kill();
      tween = gsap.to(part, { y: o * Y, rotateX: o * rx, rotateY: -o * ry * 0.5, duration: dMin + (1 - Math.abs(o)) * (dMax - dMin), ease: "power2.out" });
    };
    const watch = () => {
      st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom+=300", end: "bottom top-=300", onUpdate: update, onEnter: update, onEnterBack: update });
      update();
    };
    const r = el.getBoundingClientRect(), v = view();
    if (r.top < v.top + v.height && r.bottom > v.top) {
      gsap.set(part, { y: Y, rotateX: rx, rotateY: -ry * 0.5, opacity: 0 });
      intro = gsap.to(part, { y: 0, rotateX: 0, rotateY: 0, opacity: 1, duration: dMax, ease: "power2.out", delay, onComplete: watch });
    } else watch();
    return () => { intro?.kill(); tween?.kill(); st?.kill(); gsap.set(part, { clearProps: "transform,opacity" }); };
  });
})();
