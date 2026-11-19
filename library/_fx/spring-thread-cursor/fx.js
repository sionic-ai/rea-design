// Cursor trail: trails strands of size nodes chase the cursor with springs, and later nodes chase earlier ones (damping, tension), drawn curved.
// Values from the Brand original canvas (friction .5 · dampening .1 · tension .98 · per-strand spring .4 + i/10 × .025, thickness 1, 20% line)
(() => {
  kfFx.register("spring-thread-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const minW = +(options.min ?? 1121);
    const conf = {
      trails: +options.trails || 10, size: +options.size || 10,
      friction: +(options.friction ?? 0.5), dampening: +(options.dampening ?? 0.1), tension: +(options.tension ?? 0.98),
      alpha: +(options.alpha ?? 0.2), width: +(options.width ?? 1),
    };
    const canvas = el.tagName === "CANVAS" ? el : el.appendChild(document.createElement("canvas"));
    if (canvas !== el) canvas.className = "fx-spring-thread-cursor__canvas";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const mouse = { x: 0, y: 0 };
    let lines = [], raf = 0, started = false, color = "";
    const fit = () => {
      canvas.width = Math.max(1, innerWidth - 20);
      canvas.height = innerHeight;
      color = getComputedStyle(el).color;
    };
    const makeLine = (spring) => {
      const nodes = Array.from({ length: conf.size }, () => ({ x: mouse.x, y: mouse.y, vx: 0, vy: 0 }));
      return { spring: spring + 0.1 * Math.random() - 0.02, friction: conf.friction + 0.01 * Math.random() - 0.002, nodes };
    };
    const step = (l) => {
      let s = l.spring, n = l.nodes[0];
      n.vx += (mouse.x - n.x) * s; n.vy += (mouse.y - n.y) * s;
      for (let i = 0; i < l.nodes.length; i++) {
        n = l.nodes[i];
        if (i > 0) {
          const p = l.nodes[i - 1];
          n.vx += (p.x - n.x) * s; n.vy += (p.y - n.y) * s;
          n.vx += p.vx * conf.dampening; n.vy += p.vy * conf.dampening;
        }
        n.vx *= l.friction; n.vy *= l.friction;
        n.x += n.vx; n.y += n.vy;
        s *= conf.tension;
      }
    };
    const draw = (l) => {
      const N = l.nodes;
      let x = N[0].x, y = N[0].y, i = 1;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (; i < N.length - 2; i++) {
        x = 0.5 * (N[i].x + N[i + 1].x); y = 0.5 * (N[i].y + N[i + 1].y);
        ctx.quadraticCurveTo(N[i].x, N[i].y, x, y);
      }
      ctx.quadraticCurveTo(N[i].x, N[i].y, N[i + 1].x, N[i + 1].y);
      ctx.stroke();
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (innerWidth < minW) return;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = conf.alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = conf.width;
      for (const l of lines) { step(l); draw(l); }
      ctx.globalAlpha = 1;
    };
    const move = (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (started) return;
      started = true;
      lines = Array.from({ length: conf.trails }, (_, i) => makeLine(0.4 + (i / conf.trails) * 0.025));
      tick();
    };
    fit();
    addEventListener("resize", fit);
    document.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
      document.removeEventListener("pointermove", move);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (canvas !== el) canvas.remove();
    };
  });
})();
