// Three layers of wave hills at the section borders — six points (horizontal 0·305·610·914·1219·1524) each rise and fall by sine (amplitude 30), and the center point also sways 8 sideways,
// Those points are joined and painted with a Catmull-Rom curve. Back, middle, front layers: base height 80·90·100, speed .2·.25·.5, phase 0·1.4·1.4, width multiplier 1·1.5·1.5 (original values).
// At 1279px and below, stretch the frequency by .8x and draw at only 30fps. Pause when off screen
(() => {
  const W = 1524, B = 160;
  const LAYERS = [
    { k: "back", base: 80, speed: 0.2, phase: 0, scale: 1 },
    { k: "middle", base: 90, speed: 0.25, phase: 1.4, scale: 1.5 },
    { k: "front", base: 100, speed: 0.5, phase: 1.4, scale: 1.5 },
  ];
  const XS = [0, 305, 610, 914, 1219, 1524];
  kfFx.register("wave-hills", (el, { options, reduce }) => {
    const amp = +(options.amp ?? 30), rate = +(options.rate ?? 1);
    const narrowQ = matchMedia("(max-width: 1279px)");
    el.insertAdjacentHTML("beforeend", LAYERS.map((l) => `<svg data-fx-part="${l.k}" viewBox="0 0 ${W} ${B}" preserveAspectRatio="none" aria-hidden="true"><path/></svg>`).join(""));
    const svgs = [...el.querySelectorAll(':scope > svg[data-fx-part]')].slice(-3);
    const paths = svgs.map((s) => s.firstElementChild);
    const shape = (l, time, narrow) => {
      const t = time * 0.0015 * rate, f = 0.004 * l.scale * (narrow ? 0.8 : 1);
      const m = XS.map((x, i) => {
        const ph = x * f - t * l.speed + l.phase;
        return { x: x + (i === 0 || i === XS.length - 1 ? 0 : Math.cos(ph + i * 0.8) * 8), y: l.base + Math.sin(ph) * amp };
      });
      let d = `M${m[0].x},${m[0].y.toFixed(1)}`;
      for (let i = 0; i < m.length - 1; i++) {
        const p0 = m[i - 1] || m[i], p1 = m[i], p2 = m[i + 1], p3 = m[i + 2] || p2;
        d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }
      return d + ` L${W},${B} L0,${B} Z`;
    };
    const draw = (time) => LAYERS.forEach((l, i) => paths[i].setAttribute("d", shape(l, time, narrowQ.matches)));
    draw(0);
    if (reduce) return () => svgs.forEach((s) => s.remove());
    let raf = 0, last = 0, seen = true;
    const loop = (time) => {
      raf = requestAnimationFrame(loop);
      if (!seen || (narrowQ.matches && time - last < 33)) return;
      last = time;
      draw(time);
    };
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); svgs.forEach((s) => s.remove()); };
  });
})();
