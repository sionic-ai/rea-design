// Curved card row — the karma-brand recommended reel layout formula in CSS 3D. While pinned, the center slot moves along and cards curve and flow sideways and back
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const eoc = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  kfFx.register("curve-reel-scrub", (root, { options, reduce, scroller }) => {
    const stage = root.querySelector('[data-fx-part="stage"]') || root;
    const cards = [...root.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const per = +(options.per ?? 60), exit = +(options.exit ?? 0.8), k = +(options.lerp ?? 0.18);
    const n = cards.length;
    const st = cards.map(() => ({ x: 0, y: 0, z: -6, r: Math.PI, s: 0 }));
    let p = 0, lead = 0, unit = 1;
    const measure = () => { unit = (cards[0].offsetWidth || 1) / 0.78; stage.style.perspective = `${3.6 * unit}px`; };
    const ro = new ResizeObserver(measure);
    ro.observe(cards[0]);
    measure();
    const tick = () => {
      const e = clamp(p, 0, 1), inPin = e > 0.001 && e < 0.999, l0 = clamp(lead, 0, 1), leadOnly = !inPin && e < 0.999 && l0 > 0.001;
      const ci = inPin ? clamp(e / exit, 0, 1) * Math.max(0, n - 1) : 0;
      const dd = inPin ? smooth(0, 1.2 / n, e) : 0, f0 = lerp(3, 1.9, dd), h0 = lerp(4, 2.7, dd);
      cards.forEach((c, i) => {
        let a = inPin || leadOnly ? 1 : 0;
        if (leadOnly) a = eoc((l0 - 0.07 * i) / 0.3);
        else if (inPin && e > exit) a = 1 - eoc(((e - exit) / (1 - exit) - (n - 1 - i) * 0.07) / 0.3);
        const off = i - ci, l = Math.abs(off), fade = 1 - smooth(f0, h0, l);
        const tx = Math.sign(off) * (0.78 * l + l * l * 0.18), ty = -0.04 * l, tz = -0.52 * l - (1 - fade) * 4, tr = -0.32 * off;
        const ts = Math.max(0.1, 1 - 0.12 * l) * fade * clamp(a / 0.15, 0, 1);
        const s = st[i];
        s.x = lerp(s.x, lerp(0, tx, a), k); s.y = lerp(s.y, lerp(0, ty, a), k); s.z = lerp(s.z, lerp(tz - 6, tz, a), k);
        s.r = lerp(s.r, lerp(Math.PI, tr, a), k); s.s = lerp(s.s, ts, k);
        c.style.transform = `translate(-50%, -50%) translate3d(${s.x * unit}px, ${-s.y * unit}px, ${s.z * unit}px) rotateY(${s.r}rad) scale(${Math.max(0, s.s)})`;
        c.style.zIndex = String(Math.round(100 - 10 * l));
        c.style.visibility = s.s > 0.002 ? "visible" : "hidden";
      });
    };
    const a = ScrollTrigger.create({ trigger: root, scroller, start: "top 50%", end: "top top", scrub: 0.3, onUpdate: (s) => (lead = s.progress) });
    const b = ScrollTrigger.create({ trigger: root, scroller, start: "top top", end: `+=${per * n}%`, pin: true, pinSpacing: true, scrub: 0.3, onUpdate: (s) => (p = s.progress) });
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      a.kill(); b.kill(true);
      stage.style.perspective = "";
      cards.forEach((c) => { c.style.transform = ""; c.style.zIndex = ""; c.style.visibility = ""; });
    };
  });
})();
