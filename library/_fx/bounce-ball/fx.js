(() => {
  // The time for one rise and fall of height h is proportional to √(h/base height) — each bounce shrinks the height by bounciness, and once on the ground it rests (if loop) then starts over
  const plan = (o) => {
    const ref = Math.max(1, o.dropIn ? o.drop : o.height);
    const air = (h) => o.dur * Math.sqrt(h / ref);
    const steps = [];
    let h = o.dropIn ? o.drop * o.bounciness : o.height;
    if (o.dropIn) steps.push({ fall: true, h: o.drop, air: air(o.drop) / 2 });
    if (o.bounciness >= 0.985) {
      steps.push({ h: o.dropIn ? o.drop : o.height, air: air(o.dropIn ? o.drop : o.height) });
      if (o.gap > 0) steps.push({ rest: o.gap });
    } else {
      for (let n = 0; h > 0.5 && n < 60; n++, h *= o.bounciness) steps.push({ h, air: air(h) });
      steps.push({ rest: o.restAfter });
    }
    // The first drop plays only once — repeating starts from the bounce after it
    const intro = o.dropIn ? steps.slice(0, 1) : [];
    const body = o.dropIn ? steps.slice(1) : steps;
    const len = (list) => list.reduce((s, x) => s + (x.rest ?? x.air), 0);
    return { ref, intro, introLen: len(intro), body, bodyLen: Math.max(1e-4, len(body)) };
  };

  kfFx.register("bounce-ball", (el, { options, reduce }) => {
    const num = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const o = {
      dropIn: options.from !== "floor",
      drop: Math.max(0, num("drop", 240)),
      height: Math.max(0, num("height", 160)),
      dur: Math.max(0.05, num("dur", 0.7)),
      bounciness: Math.min(1, Math.max(0, num("bounciness", 0.6))),
      gap: num("gap", 0.06),
      restAfter: Math.max(0, num("rest", 0.8)),
      squash: num("squash", 0.18),
      delay: num("delay", 0),
      from: num("opacity", 1),
      fade: num("fade", 0.4),
      loop: options.loop !== "false",
      blink: Math.max(0.02, num("blink", 0.3)),
    };
    const colors = (options.colors || "").split(",").map((s) => s.trim()).filter(Boolean);
    const p = plan(o);
    gsap.set(el, { transformOrigin: "50% 100%" });
    if (reduce) {
      gsap.set(el, { y: 0, opacity: 1, ...(colors[0] && { backgroundColor: colors[0] }) });
      return () => gsap.set(el, { clearProps: "transform,opacity,backgroundColor,transformOrigin" });
    }
    const pose = (t) => {
      let list = p.body, at;
      if (t < p.introLen) { list = p.intro; at = t; }
      else at = o.loop ? (t - p.introLen) % p.bodyLen : Math.min(t - p.introLen, p.bodyLen - 1e-4);
      let step = list[list.length - 1], local = 0;
      for (let i = 0, acc = 0; i < list.length; i++) {
        const d = list[i].rest ?? list[i].air;
        if (at < acc + d || i === list.length - 1) { step = list[i]; local = at - acc; break; }
        acc += d;
      }
      if (!step || step.rest != null) return { y: 0, sx: 1, sy: 1 };
      const k = Math.min(1, Math.max(0, local / step.air));
      const y = step.fall ? step.h * (1 - k * k) : step.h * 4 * k * (1 - k);
      // Squashes only for 14% just before and after hitting the ground — harder the greater the height
      const edge = 0.14;
      let near = 0;
      if (!step.fall && k < edge) near = 1 - k / edge;
      if (k > 1 - edge) near = Math.max(near, 1 - (1 - k) / edge);
      const s = o.squash * Math.sqrt(step.h / p.ref) * near;
      return { y: -y, sx: 1 + s * 0.6, sy: 1 - s };
    };
    let clock = 0, last = null, shown = -1;
    const start0 = o.dropIn ? -o.drop : 0;
    gsap.set(el, { y: start0, opacity: o.from, ...(colors[0] && { backgroundColor: colors[0] }) });
    const tick = (time) => {
      const now = time * 1000;
      if (last == null) last = now;
      clock += Math.max(1, now - last) / 1000;
      last = now;
      if (colors.length > 1) {
        const c = Math.floor(clock / o.blink) % colors.length;
        if (c !== shown) { shown = c; el.style.backgroundColor = colors[c]; }
      }
      const t = clock - o.delay;
      if (t < 0) return;
      const a = o.fade > 0 ? Math.min(1, t / o.fade) : 1;
      const q = pose(t);
      gsap.set(el, { y: q.y, scaleX: q.sx, scaleY: q.sy, opacity: o.from + (1 - o.from) * a });
      if (!o.loop && colors.length < 2 && t > p.introLen + p.bodyLen && a >= 1) gsap.ticker.remove(tick);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); gsap.set(el, { clearProps: "transform,opacity,backgroundColor,transformOrigin" }); };
  });
})();
