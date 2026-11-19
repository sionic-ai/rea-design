// Instead of the system cursor, one dot (radius 3.2) and one accent chevron — the chevron wanders like a bird 32~54px around the dot, changing direction every 0.7~1.4s.
// Hovering over a link or button, four chevrons fly to that element’s four corners (14px outside, only halfway to the neighbor if a neighboring button is close) to become brackets and the dot becomes the accent color.
(() => {
  const HIT = "a, button, label, select, summary, [data-cursor]";
  const CORNERS = [-0.75 * Math.PI, -0.25 * Math.PI, 0.25 * Math.PI, 0.75 * Math.PI];
  const turnTo = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

  kfFx.register("chevron-cursor", (el, { reduce, hover }) => {
    if (reduce || !hover || !matchMedia("(pointer: fine)").matches) return;
    const cv = document.createElement("canvas");
    cv.className = "fx-cursor-canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) { cv.remove(); return; }
    const probe = document.createElement("i");
    probe.className = "fx-cursor-probe";
    document.body.append(probe);
    const root = document.documentElement;
    root.classList.add("fx-cursor-on");

    let mx = -100, my = -100, inside = false, typing = false, target = null, onHit = false;
    let gap = { l: 14, t: 14, r: 14, b: 14 };
    const marks = CORNERS.map(() => ({ x: -100, y: -100, ang: Math.PI / 2, alpha: 0 }));
    let wander = Math.random() * Math.PI * 2, reach = 40, nextTurn = 0, vx = 0, vy = 0, dotLead = 0, raf = 0, last = performance.now(), sy = scrollY;

    // Spreads only up to half the gap − 1.5px between neighbors so the brackets don’t overlap
    const gapsFor = (t) => {
      const r = t.getBoundingClientRect(), g = { l: 14, t: 14, r: 14, b: 14 }, half = (d) => Math.max(0, d / 2 - 1.5);
      document.querySelectorAll(HIT).forEach((o) => {
        if (o === t || o.contains(t) || t.contains(o)) return;
        const q = o.getBoundingClientRect();
        if (!q.width || !q.height) return;
        const rowish = q.top < r.bottom + 23 && q.bottom > r.top - 23, colish = q.left < r.right + 23 && q.right > r.left - 23;
        if (rowish && q.left >= r.right) g.r = Math.min(g.r, half(q.left - r.right));
        if (rowish && q.right <= r.left) g.l = Math.min(g.l, half(r.left - q.right));
        if (colish && q.top >= r.bottom) g.b = Math.min(g.b, half(q.top - r.bottom));
        if (colish && q.bottom <= r.top) g.t = Math.min(g.t, half(r.top - q.bottom));
      });
      return g;
    };
    const look = (node) => {
      typing = !!node?.closest?.('input, textarea, [contenteditable="true"]');
      const hit = typing ? null : node?.closest?.(HIT);
      onHit = !!hit && el.contains(hit);
      let next = null;
      if (onHit && hit.dataset.cursor !== "view") {
        const r = hit.getBoundingClientRect();
        next = r.width < 0.9 * innerWidth || r.height < 0.8 * innerHeight ? hit : null;
      }
      if (next && next !== target) gap = gapsFor(next);
      target = next;
    };
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      cv.width = innerWidth * d; cv.height = innerHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (target) gap = gapsFor(target);
    };
    const colorOf = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };

    function frame(now) {
      const dt = Math.min(Math.max(0.001, (now - last) / 1000), 0.05);
      last = now;
      const k = (f) => 1 - Math.pow(1 - f, 60 * dt);
      if (scrollY !== sy) { sy = scrollY; if (inside) look(document.elementFromPoint(mx, my)); }
      if (target && !target.isConnected) target = null;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (!inside) { raf = 0; return; }
      if (!typing) {
        const ink = colorOf("var(--fx-cursor-ink, var(--kf-ink))"), lead = colorOf("var(--fx-cursor-lead, var(--kf-accent))");
        const box = target?.getBoundingClientRect();
        if (box) {
          const pts = [[box.left - gap.l, box.top - gap.t], [box.right + gap.r, box.top - gap.t], [box.right + gap.r, box.bottom + gap.b], [box.left - gap.l, box.bottom + gap.b]];
          marks.forEach((m, i) => {
            const f = k(0.28);
            m.x += (pts[i][0] - m.x) * f; m.y += (pts[i][1] - m.y) * f;
            m.ang += turnTo(m.ang, CORNERS[i]) * k(0.25);
            m.alpha += (1 - m.alpha) * k(0.3);
          });
          vx = vy = 0;
        } else {
          if (now > nextTurn) { wander += (Math.random() - 0.5) * Math.PI * 1.4; reach = 32 + 22 * Math.random(); nextTurn = now + 700 + 700 * Math.random(); }
          const head = marks[0], gx = mx + Math.cos(wander) * reach, gy = my + Math.sin(wander) * reach;
          vx += (gx - head.x) * 0.012 * dt * 60; vy += (gy - head.y) * 0.012 * dt * 60;
          const damp = Math.pow(0.86, 60 * dt);
          vx *= damp; vy *= damp;
          head.x += vx * dt * 60; head.y += vy * dt * 60;
          head.ang += turnTo(head.ang, Math.hypot(vx, vy) > 0.4 ? Math.atan2(vy, vx) : Math.PI / 2) * k(0.15);
          head.alpha += (1 - head.alpha) * k(0.3);
          for (let i = 1; i < 4; i++) {
            const m = marks[i], f = k(0.22);
            m.x += (mx - m.x) * f; m.y += (my - m.y) * f;
            m.ang += turnTo(m.ang, head.ang) * f;
            m.alpha += (0 - m.alpha) * k(0.3);
          }
        }
        ctx.lineWidth = 2.4; ctx.lineCap = "square"; ctx.lineJoin = "miter";
        [1, 2, 3, 0].forEach((i) => {
          const m = marks[i];
          if (m.alpha < 0.02) return;
          const back = m.ang + Math.PI;
          ctx.globalAlpha = m.alpha;
          ctx.beginPath();
          ctx.strokeStyle = i === 0 ? lead : ink;
          ctx.moveTo(m.x + 9 * Math.cos(back - Math.PI / 4), m.y + 9 * Math.sin(back - Math.PI / 4));
          ctx.lineTo(m.x, m.y);
          ctx.lineTo(m.x + 9 * Math.cos(back + Math.PI / 4), m.y + 9 * Math.sin(back + Math.PI / 4));
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
        dotLead += ((onHit ? 1 : 0) - dotLead) * k(0.3);
        ctx.beginPath();
        ctx.fillStyle = dotLead > 0.5 ? lead : ink;
        ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      if (!inside) marks.forEach((m) => { m.x = e.clientX; m.y = e.clientY; });
      inside = el === document.body || el === root || el.contains(e.target);
      mx = e.clientX; my = e.clientY;
      look(e.target);
      if (!raf && inside) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const onOut = (e) => { if (!e.relatedTarget) inside = false; };
    size();
    addEventListener("resize", size);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
      root.classList.remove("fx-cursor-on");
      cv.remove(); probe.remove();
    };
  });
})();
