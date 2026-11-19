(() => {
  // Shape is based on a 300×300 sheet — head chevron four points, body eight points, evenly sampled and mixed with the same counts
  const SHAPES = {
    down: ["M120 160 L180 220 L240 160", "M60 75 H150 Q180 75 180 105 V220"],
    normal: ["M175 80 L245 150 L175 220", "M55 150 H245"],
    up: ["M120 140 L180 80 L240 140", "M60 225 H150 Q180 225 180 195 V80"],
  };
  const NS = "http://www.w3.org/2000/svg";
  let poses = null;
  const sampleAll = () => {
    if (poses) return poses;
    const svg = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.append(p);
    document.body.append(svg);
    const sample = (d, n) => {
      p.setAttribute("d", d);
      const L = p.getTotalLength();
      return Array.from({ length: n }, (_, i) => { const q = p.getPointAtLength((L * i) / (n - 1)); return { x: q.x, y: q.y }; });
    };
    poses = Object.fromEntries(Object.entries(SHAPES).map(([k, [h, b]]) => [k, { head: sample(h, 4), body: sample(b, 8) }]));
    svg.remove();
    return poses;
  };
  const toD = (pts) => pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(2)},${q.y.toFixed(2)}`).join("");
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // Midway along the path each line bends sideways and straightens out — the body’s second point most (.14), the chevron the opposite way
  const mix = (a, b, t, part, k) => a.map((q, i) => {
    const dx = b[i].x - q.x, dy = b[i].y - q.y, len = Math.max(Math.hypot(dx, dy), 1e-4);
    const strength = part === "body" ? (i === 1 ? 0.14 : 0.03) : i === 1 ? 0.08 : 0.05;
    const sign = i === 1 ? (part === "body" ? 1 : -1) : part === "head" && i === 0 ? 1 : -1;
    const bend = Math.min(len * strength, 16) * Math.sin(Math.PI * t) * sign * k;
    return { x: q.x + dx * t + (-dy / len) * bend, y: q.y + dy * t + (dx / len) * bend };
  });

  kfFx.register("arrow-bend-morph", (el, { options, reduce }) => {
    const head = el.querySelector('[data-fx-part="head"]'), body = el.querySelector('[data-fx-part="body"]');
    if (!head || !body) return;
    const P = sampleAll();
    const dur = +(options.dur ?? 0.42) * 1000, k = +(options.bend ?? 1);
    let shape = P[el.dataset.shape] ? el.dataset.shape : P[options.shape] ? options.shape : "down";
    let pose = P[shape], raf = 0;
    const apply = (ps) => { head.setAttribute("d", toD(ps.head)); body.setAttribute("d", toD(ps.body)); };
    apply(pose);
    const to = (next) => {
      if (!P[next] || next === shape) return;
      shape = next;
      if (el.dataset.shape !== next) el.dataset.shape = next;
      cancelAnimationFrame(raf);
      if (reduce || dur <= 0) return apply((pose = P[next]));
      const from = pose, goal = P[next], t0 = performance.now();
      const step = (now) => {
        const t = Math.min((now - t0) / dur, 1), e = ease(t);
        pose = { head: mix(from.head, goal.head, e, "head", k), body: mix(from.body, goal.body, e, "body", k) };
        apply(pose);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const onEvent = (e) => to(e.detail);
    el.addEventListener("fx:shape", onEvent);
    const mo = new MutationObserver(() => to(el.dataset.shape));
    mo.observe(el, { attributes: true, attributeFilter: ["data-shape"] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); el.removeEventListener("fx:shape", onEvent); };
  });
})();
