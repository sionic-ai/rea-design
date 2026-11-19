// Cards are scattered in a jittered grid across an endless panel in every direction (fixed random position, size and tilt per cell), and you look around by dragging or pushing with the wheel.
// On release it glides with inertia cooling by .92 per frame, zooms around the cursor with ctrl+wheel or buttons, and when the cursor is near a screen edge the board slowly drifts that way.
// Original values (Agency work panel): cell 308×412 · jitter .16 · column stagger .85 · card 220 wide · size .72~1.08 · tilt ±6° · friction .92 · zoom .6~2 (wheel .0016)
// · cursor parallax 40px · edge flow 13 (center 50% rests) · initially .965 → 1 · transparent → 1 in .7s expo.out.
(() => {
  const hash = (a, b, c, seed) => {
    let h = seed ^ Math.imul(a | 0, 0x27d4eb2f);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) ^ Math.imul(b | 0, 0x165667b1);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) ^ Math.imul(c | 0, 0x9e3779b1);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  kfFx.register("scatter-pan-board", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const SEED = +(options.seed ?? 1337), CW = +(options["cell-w"] || 308), CH = +(options["cell-h"] || 412), JIT = +(options.jitter ?? 0.16), DRIFT = +(options.drift ?? 0.85);
    const S0 = +(options["scale-min"] ?? 0.72), S1 = +(options["scale-max"] ?? 1.08), ROT = +(options.rotate ?? 6), FRICTION = +(options.friction ?? 0.92);
    const ZMIN = +(options["zoom-min"] ?? 0.6), ZMAX = +(options["zoom-max"] ?? 2), ZSPEED = +(options["zoom-speed"] ?? 0.0016), PARA = +(options.parallax ?? 40), EDGE = +(options.edge ?? 13), DEAD = +(options["edge-dead"] ?? 0.5);
    const par = document.createElement("div"), camEl = document.createElement("div");
    par.dataset.fxPart = "parallax"; camEl.dataset.fxPart = "camera";
    par.append(camEl);
    el.append(par);
    items.forEach((it) => (it.hidden = true));
    const cam = { x: 0, y: 0, z: 1 }, vel = { x: 0, y: 0 }, flow = { x: 0, y: 0 }, mouse = { x: 0.5, y: 0.5, in: false }, pp = { x: 0, y: 0 };
    const pool = new Map();
    let W = el.clientWidth, H = el.clientHeight;
    const cell = (i, j) => {
      const col = (hash(i, 0, 6, SEED) - 0.5) * DRIFT * CH;
      const pick = Math.floor(hash(i, j, 1, SEED) * items.length);
      return {
        key: `${i},${j}`, item: items[(pick + ((i * 7 + j * 3) % items.length) + items.length) % items.length],
        x: i * CW + CW / 2 + (hash(i, j, 2, SEED) - 0.5) * JIT * CW, y: j * CH + CH / 2 + col + (hash(i, j, 3, SEED) - 0.5) * JIT * CH,
        s: S0 + (S1 - S0) * hash(i, j, 4, SEED), r: -ROT + 2 * ROT * hash(i, j, 5, SEED),
      };
    };
    const layout = () => {
      const hw = W / (2 * cam.z) + CW, hh = H / (2 * cam.z) + CH;
      const i0 = Math.floor((cam.x - hw) / CW), i1 = Math.floor((cam.x + hw) / CW), j0 = Math.floor((cam.y - hh) / CH), j1 = Math.floor((cam.y + hh) / CH);
      const want = new Set();
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const c = cell(i, j);
        want.add(c.key);
        if (pool.has(c.key)) continue;
        const node = c.item.cloneNode(true);
        node.hidden = false;
        node.dataset.fxPart = "tile";
        node.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%) rotate(${c.r}deg) scale(${c.s})`;
        camEl.append(node);
        pool.set(c.key, node);
      }
      for (const [k, n] of pool) if (!want.has(k)) { n.remove(); pool.delete(k); }
    };
    const place = () => {
      camEl.style.transform = `translate(${W / 2 - cam.x * cam.z}px, ${H / 2 - cam.y * cam.z}px) scale(${cam.z})`;
      par.style.transform = `translate(${pp.x.toFixed(2)}px, ${pp.y.toFixed(2)}px)`;
    };
    layout(); place();
    if (reduce) return () => { par.remove(); items.forEach((it) => (it.hidden = false)); };
    gsap.fromTo(par, { opacity: 0, scale: 0.965 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out", clearProps: "opacity,scale" });

    let drag = null, raf = 0, last = 0;
    const onDown = (e) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: false, t: performance.now() };
      vel.x = vel.y = 0;
      el.dataset.pressed = "";
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width; mouse.y = (e.clientY - r.top) / r.height; mouse.in = true;
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y, now = performance.now(), dt = Math.max(1, now - drag.t);
      if (!drag.moved && Math.hypot(dx, dy) < 3) return;
      if (!drag.moved) { drag.moved = true; el.dataset.dragging = ""; try { el.setPointerCapture(e.pointerId); } catch {} }
      cam.x -= dx / cam.z; cam.y -= dy / cam.z;
      vel.x = (-dx / cam.z) * (16.67 / dt); vel.y = (-dy / cam.z) * (16.67 / dt);
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    };
    const onUp = () => { if (!drag) return; const moved = drag.moved; drag = null; delete el.dataset.pressed; requestAnimationFrame(() => delete el.dataset.dragging); if (!moved) vel.x = vel.y = 0; };
    const onClickCapture = (e) => { if (el.dataset.dragging !== undefined) { e.preventDefault(); e.stopPropagation(); } };
    const zoomAt = (k, cx, cy) => {
      const r = el.getBoundingClientRect(), px = cx - r.left - W / 2, py = cy - r.top - H / 2;
      const wx = cam.x + px / cam.z, wy = cam.y + py / cam.z;
      cam.z = Math.min(ZMAX, Math.max(ZMIN, cam.z * k));
      cam.x = wx - px / cam.z; cam.y = wy - py / cam.z;
    };
    const onWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) { zoomAt(Math.exp(-e.deltaY * ZSPEED), e.clientX, e.clientY); return; }
      cam.x += e.deltaX / cam.z; cam.y += e.deltaY / cam.z;
    };
    const onLeave = () => (mouse.in = false);
    const onZoom = (e) => { const b = e.target.closest('[data-fx-part="zoom"]'); if (!b) return; gsap.to(cam, { z: Math.min(ZMAX, Math.max(ZMIN, cam.z * (b.dataset.dir === "in" ? 1.25 : 0.8))), duration: 0.5, ease: "expo.out" }); };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(3, Math.max(0.2, (now - (last || now)) / 16.67));
      last = now;
      if (!drag) { cam.x += vel.x * dt; cam.y += vel.y * dt; const f = Math.pow(FRICTION, dt); vel.x *= f; vel.y *= f; }
      // The edge flow approaches the target speed by .09 per frame — even if the cursor moves to the center or leaves, it keeps flowing for about 1 second and then stops
      const push = (v) => (Math.abs(v) > DEAD ? Math.sign(v) * ((Math.min(1, Math.abs(v)) - DEAD) / (1 - DEAD)) ** 2 : 0);
      const on = hover && mouse.in && !drag;
      const ftx = on ? push((mouse.x - 0.5) * 2) * EDGE : 0, fty = on ? push((mouse.y - 0.5) * 2) * EDGE : 0, k = 1 - Math.pow(0.91, dt);
      flow.x += (ftx - flow.x) * k; flow.y += (fty - flow.y) * k;
      if (Math.abs(flow.x) < 0.01 && !ftx) flow.x = 0;
      if (Math.abs(flow.y) < 0.01 && !fty) flow.y = 0;
      cam.x += (flow.x * dt) / cam.z; cam.y += (flow.y * dt) / cam.z;
      const tx = hover && mouse.in ? -(mouse.x - 0.5) * 2 * PARA : 0, ty = hover && mouse.in ? -(mouse.y - 0.5) * 2 * PARA : 0;
      pp.x += (tx - pp.x) * 0.08; pp.y += (ty - pp.y) * 0.08;
      layout(); place();
    };
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => { W = el.clientWidth; H = el.clientHeight; });
    ro.observe(el);
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("click", onZoom);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave); el.removeEventListener("wheel", onWheel); el.removeEventListener("click", onClickCapture, true); el.removeEventListener("click", onZoom);
      par.remove(); pool.clear(); items.forEach((it) => (it.hidden = false)); gsap.killTweensOf(cam);
    };
  });
})();
