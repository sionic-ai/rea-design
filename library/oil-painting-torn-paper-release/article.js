// Autumn build — a pinned mesh graph. For each section (data-focus) the camera moves to a different large node and closes in, and the background spreads to the section color (data-color).
// The original draws graph-data (thousands of nodes and lines) in WebGL — here we build our own graph of the same shape and draw it on a canvas with the same motion.
(() => {
  const html = document.documentElement;
  const { reduce, color } = window.ED;
  const cv = document.querySelector(".f-graph");
  const g = cv.getContext("2d");
  const secs = [...document.querySelectorAll("[data-color]")];
  const focusSecs = [...document.querySelectorAll("[data-focus]")];
  const sideItems = [...document.querySelectorAll(".f-side li")];
  const pal = {};
  const readPal = () => { for (const k of ["blue", "violet", "orange", "green", "magenta", "ink"]) pal[k] = color(`--site-fall-${k}`); pal.light = color("--kf-contrast-ink"); pal.dark = color("--kf-contrast-bg"); };
  readPal();

  // Graph — six large nodes (one per section), each with 40~70 small nodes spreading like a star, and a few lines crossing between them
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const hubs = [[0, 0], [900, -500], [-700, 600], [1300, 700], [-1100, -700], [300, 1300]].map(([x, y]) => ({ x, y, r: 6, hub: true }));
  const nodes = [...hubs];
  const edges = [];
  hubs.forEach((h, hi) => {
    const n = 40 + Math.floor(rnd() * 30);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = 60 + rnd() ** .7 * 520;
      const nd = { x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d, r: 1.2 + rnd() * 2.4, ph: rnd() * 6.28, label: rnd() < .08 ? `Bar ${hi + 1}-${i}` : "" };
      nodes.push(nd);
      edges.push([h, nd, .18 + rnd() * .2]);
      if (rnd() < .25) { const sub = { x: nd.x + (rnd() - .5) * 120, y: nd.y + (rnd() - .5) * 120, r: 1, ph: rnd() * 6.28 }; nodes.push(sub); edges.push([nd, sub, .14]); }
    }
  });
  for (let i = 0; i < 60; i++) { const a = nodes[Math.floor(rnd() * nodes.length)], b = nodes[Math.floor(rnd() * nodes.length)]; edges.push([a, b, .06]); }
  hubs.forEach((h, i) => (h.label = `Large Section ${i + 1}`));

  // Opening — on the first view a dark graph panel covers nearly the whole screen, at .65s a big center node appears, and until 1.9s the nodes sprout evenly outward while the camera pulls back (3.2x → 1).
  // Then the panel shrinks into place and the left column enters (CSS is-intro). Measured times are based on the original’s first paint
  const GROW_AT = 650, GROW_END = 1900;
  const t0 = performance.now();
  const introSkip = reduce || scrollY > 100 || (location.hash && location.hash !== "#f-1");
  if (introSkip) html.classList.remove("is-intro");
  else setTimeout(() => html.classList.remove("is-intro"), GROW_END);
  const reach = Math.max(...nodes.map((n) => Math.hypot(n.x, n.y)));
  const heroEl = document.querySelector(".f-hero"), panel = document.querySelector(".f-hero__graph");

  const cam = { x: 0, y: 0, z: .55 };
  const focusZoom = [.55, 1.05, 1.15, 1.0, 1.1, .9];
  // Cursor: the original mesh reacts to cursor speed, not cursor position. A passing cursor pushes nearby nodes away (radius 265 · inner 24 · strength 2 · big node .6 · drag 1.45 ·
  // Below 24px/s is ignored · blocked at 1800px/s, cools off in .04s when stopped — length is min(width,height)/741 times), lines the cursor crosses bounce like strings (3.1Hz · damping .15 · .2 of the crossing speed · amplitude up to 14px)
  const REPEL = { radius: 265, inner: 24, force: 2, hubs: .6, carry: 1.45, gate: 24, max: 1800, fade: .04, home: 10, drag: 3.2 };
  const PLUCK = { omega: Math.PI * 2 * 3.1, damping: .15, brush: .2, limit: 14 };
  const ptr = { x: 0, y: 0, vx: 0, vy: 0, at: 0, moved: false, on: false };
  const plucked = new Set();
  const crossing = (ax, ay, bx, by, cx, cy, dx, dy) => {
    const rx = bx - ax, ry = by - ay, sx = dx - cx, sy = dy - cy, den = rx * sy - ry * sx;
    if (Math.abs(den) < 1e-6) return false;
    const u = ((cx - ax) * sy - (cy - ay) * sx) / den, v = ((cx - ax) * ry - (cy - ay) * rx) / den;
    return u >= 0 && u <= 1 && v >= 0 && v <= 1;
  };
  if (!reduce) {
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const dt = (e.timeStamp - ptr.at) / 1000, px = ptr.x, py = ptr.y, fresh = ptr.on && dt > 0 && dt < .08;
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.at = e.timeStamp; ptr.on = true;
      if (!fresh || (px === ptr.x && py === ptr.y)) return;
      const step = Math.max(dt, .008);
      ptr.vx = (ptr.x - px) / step; ptr.vy = (ptr.y - py) / step; ptr.moved = true;
      const top = PLUCK.limit * PLUCK.omega;
      for (const ed of edges) {
        const a = ed[0], b = ed[1];
        if (a.sx === undefined || b.sx === undefined || !a.vis || !b.vis) continue;
        if (!crossing(px, py, ptr.x, ptr.y, a.sx, a.sy, b.sx, b.sy)) continue;
        const len = Math.hypot(b.sx - a.sx, b.sy - a.sy) || 1, nx = -(b.sy - a.sy) / len, ny = (b.sx - a.sx) / len;
        const st = ed[3] || (ed[3] = { x: 0, y: 0, vx: 0, vy: 0 });
        const along = st.vx * nx + st.vy * ny, want = Math.max(-top, Math.min(top, along + (ptr.vx * nx + ptr.vy * ny) * PLUCK.brush));
        st.vx += (want - along) * nx; st.vy += (want - along) * ny;
        plucked.add(ed);
      }
    }, { passive: true });
    addEventListener("pointerout", (e) => { if (!e.relatedTarget) ptr.on = false; });
  }
  let lastT = 0;

  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
  addEventListener("resize", size); size();

  const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgba = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const frame = (now) => {
    const t = now / 1000;
    // Background — the color of the section across the screen center, mixed in by its share as the next section rises from below
    const mid = H * .5;
    let bg = pal.blue;
    for (let i = 0; i < secs.length; i++) {
      const r = secs[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        const cur = pal[secs[i].dataset.color];
        const next = secs[i + 1] ? pal[secs[i + 1].dataset.color] : cur;
        const k = clamp((mid - (r.bottom - H * .35)) / (H * .35), 0, 1);
        bg = mixc(cur, next, k * k * (3 - 2 * k));
        break;
      }
    }
    // Camera — between the current major beat and the next, by scroll share
    let fi = 0, fk = 0;
    for (let i = 0; i < focusSecs.length; i++) { const r = focusSecs[i].getBoundingClientRect(); if (r.top <= mid) { fi = i; const nx = focusSecs[i + 1]; fk = nx ? clamp((mid - r.top) / (nx.getBoundingClientRect().top - r.top), 0, 1) : 0; } }
    const a = hubs[fi], b = hubs[Math.min(hubs.length - 1, fi + 1)];
    const e = fk < .6 ? 0 : (fk - .6) / .4;
    const ee = e * e * (3 - 2 * e);
    const tx = a.x + (b.x - a.x) * ee , ty = a.y + (b.y - a.y) * ee;
    const tz = (focusZoom[fi] + (focusZoom[Math.min(5, fi + 1)] - focusZoom[fi]) * ee) * (1 + fk * .25 * (1 - ee));
    const k = reduce ? 1 : .06;
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (tz - cam.z) * k;

    const grow = introSkip ? 1 : clamp((now - t0 - GROW_AT) / (GROW_END - GROW_AT), 0, 1);
    const growE = grow;
    // Even before sprouting, the big center node is floating from the start and breathing softly (the small dot of the original first image)
    const R = growE * reach;
    // In the original first scene the camera is right up close, so nodes look like big squares (about 25px). Pull back from five times.
    const zoom = 1 + (1 - growE) * 4;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = rgba(bg); g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * .62, H * .55, 0, W * .62, H * .55, Math.max(W, H) * .6);
    glow.addColorStop(0, rgba(mixc(bg, pal.light, .1))); glow.addColorStop(1, rgba(bg, 0));
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // While the hero is visible the mesh stays only inside the dark panel, and its center is the panel center too. Once the panel passes above the screen it returns to full screen (.62)
    const hr = heroEl.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    const hv = pr.width > 0 ? clamp(hr.bottom / H, 0, 1) : 0;
    const ox = W * .62 + (pr.left + pr.width / 2 - W * .62) * hv, oy = H * .5 + (pr.top + pr.height / 2 - H * .5) * hv;
    const z = cam.z * zoom;
    const P = (n) => [ox + (n.x - cam.x) * z + (n.ox || 0), oy + (n.y - cam.y) * z + (n.oy || 0)];
    const dt = Math.min(.05, Math.max(0, t - lastT)); lastT = t;
    if (!reduce && dt > 0) {
      const unit = clamp(Math.min(pr.width || W, pr.height || H) / 741, .4, 3);
      if (!ptr.moved) { const f = Math.exp(-dt / REPEL.fade); ptr.vx *= f; ptr.vy *= f; }
      ptr.moved = false;
      const sp = Math.hypot(ptr.vx, ptr.vy), push = ptr.on && sp > REPEL.gate * unit;
      const A = REPEL.radius * unit, T = REPEL.inner * unit, y = Math.min(sp, REPEL.max * unit), mx = push ? ptr.vx / sp : 0, my = push ? ptr.vy / sp : 0;
      for (const n of nodes) {
        if (push && n.sx !== undefined && n.vis) {
          const cx = n.sx - ptr.x, cy = n.sy - ptr.y, d = Math.hypot(cx, cy);
          if (d > T && d < A) {
            const L = 1 - (d - T) / (A - T), k = L * L * REPEL.force * (n.hub ? REPEL.hubs : 1) * (1 - Math.max(0, (cx * mx + cy * my) / d));
            n.vx = (n.vx || 0) + (cx / d * k * y + mx * y * k * REPEL.carry) * dt;
            n.vy = (n.vy || 0) + (cy / d * k * y + my * y * k * REPEL.carry) * dt;
          }
        }
        if (n.vx || n.vy || n.ox || n.oy) {
          n.vx = (n.vx || 0) + (-REPEL.home * (n.ox || 0) - REPEL.drag * (n.vx || 0)) * dt;
          n.vy = (n.vy || 0) + (-REPEL.home * (n.oy || 0) - REPEL.drag * (n.vy || 0)) * dt;
          n.ox = (n.ox || 0) + n.vx * dt; n.oy = (n.oy || 0) + n.vy * dt;
          if (Math.abs(n.ox) + Math.abs(n.oy) < .02 && Math.abs(n.vx) + Math.abs(n.vy) < .5) n.ox = n.oy = n.vx = n.vy = 0;
        }
      }
      const w2 = PLUCK.omega * PLUCK.omega, c2 = 2 * PLUCK.damping * PLUCK.omega;
      for (const ed of plucked) {
        const st = ed[3];
        for (let left = dt; left > 0; left -= .004) {
          const h = Math.min(.004, left);
          st.vx += (-w2 * st.x - c2 * st.vx) * h; st.vy += (-w2 * st.y - c2 * st.vy) * h;
          st.x += st.vx * h; st.y += st.vy * h;
        }
        if (Math.abs(st.x) + Math.abs(st.y) < .05 && Math.abs(st.vx) + Math.abs(st.vy) < 1) { st.x = st.y = st.vx = st.vy = 0; plucked.delete(ed); }
      }
    }
    // Dark panels are painted on the canvas first and the mesh over them — so nodes look bright on the panel, like the original
    // On phone there is no plate (display:none) — so it draws to the full screen then
    const inPanel = hr.bottom > 0 && pr.width > 0;
    if (inPanel) { g.fillStyle = rgba(mixc(bg, pal.dark, .72)); g.fillRect(pr.left, pr.top, pr.width, pr.height); }
    g.save();
    if (inPanel) { g.beginPath(); g.rect(pr.left, pr.top, pr.width, pr.height); g.rect(0, hr.bottom, W, Math.max(0, H - hr.bottom)); g.clip(); }
    g.lineWidth = 1;
    const shown = (n) => Math.hypot(n.x, n.y) <= R;
    for (const n of nodes) { n.vis = shown(n); if (n.vis) { const q = P(n); n.sx = q[0]; n.sy = q[1]; } }
    for (const [n1, n2, al, st] of edges) {
      if (!n1.vis || !n2.vis) continue;
      const x1 = n1.sx, y1 = n1.sy, x2 = n2.sx, y2 = n2.sy;
      if ((x1 < -50 && x2 < -50) || (x1 > W + 50 && x2 > W + 50) || (y1 < -50 && y2 < -50) || (y1 > H + 50 && y2 > H + 50)) continue;
      g.strokeStyle = rgba(pal.light, al); g.beginPath(); g.moveTo(x1, y1);
      // A bounced line bends in the middle by that amount — a quadratic curve’s vertex is half the control point shift, so it is doubled
      if (st && (st.x || st.y)) g.quadraticCurveTo((x1 + x2) / 2 + st.x * 2, (y1 + y2) / 2 + st.y * 2, x2, y2); else g.lineTo(x2, y2);
      g.stroke();
    }
    g.font = "400 9px " + getComputedStyle(document.body).getPropertyValue("--kf-font-mono");
    for (const n of nodes) {
      if (!n.vis) continue;
      const x = n.sx, y = n.sy;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const tw = n.hub ? 1 : .55 + .45 * Math.sin(t * 1.6 + n.ph);
      const r = n.r * Math.max(.7, z) * (n.hub ? 1 / zoom : 1 + (zoom - 1) * .6);
      if (n.hub) {
        const gr = 40 * z * (1 + .06 * Math.sin(t * 3.1 + n.x));
        const hg = g.createRadialGradient(x, y, 0, x, y, gr);
        hg.addColorStop(0, rgba(pal.light, .55)); hg.addColorStop(1, rgba(pal.light, 0));
        g.fillStyle = hg; g.beginPath(); g.arc(x, y, gr, 0, 7); g.fill();
      }
      g.fillStyle = rgba(pal.light, tw);
      g.fillRect(x - r, y - r, r * 2, r * 2);
      if (n.label) { g.fillStyle = rgba(pal.light, .75); g.fillText(n.label, x + r + 4, y + 3); }
    }
    g.restore();
    html.classList.toggle("is-past-hero", scrollY > H * .6);
    sideItems.forEach((li, i) => li.classList.toggle("is-active", i === fi));
  };
  if (reduce) { const f = () => frame(performance.now()); f(); addEventListener("scroll", f, { passive: true }); addEventListener("resize", f); }
  else { const loop = (now) => { frame(now); requestAnimationFrame(loop); }; frame(performance.now()); requestAnimationFrame(loop); }

  // Floating ring — dwelling 140ms in one area opens that view (not pinned), leaving the box for 180ms · dwelling 120ms on the opposite side (beyond 56%/44%) resets it in place. Clicking pins it and a ”Back” button appears
  document.querySelectorAll("[data-surf]").forEach((box) => {
    const stage = box.querySelector(".f-surf__stage");
    const trigs = [...box.querySelectorAll("[data-to]")];
    let pinned = false, tIn = 0, tOut = 0, tSide = 0;
    // Packet — 1.66s after entering view it reaches the first channel, then the next channel every .317s (in order 1·3·2·4·5). A reached channel flashes --focus to 1 for .37s and then returns,
    // Otherwise packets come and go and ripple very slightly — as in the original, written as inline values every frame while in view
    const chans = [...box.querySelectorAll(".f-surf__chans li")];
    const order = [0, 2, 1, 3, 4];
    let chanRaf = 0, chanFrom = 0;
    const chanFrame = (now) => {
      const e = now - chanFrom - 1660;
      chans.forEach((c, i) => {
        let f = .71 + .004 * Math.sin(now / 180 + i * 1.7);
        if (e >= 0) {
          const k = order.indexOf(i), p = ((e - k * 317) % (order.length * 317) + order.length * 317) % (order.length * 317) / 370;
          if (e >= k * 317 && p < 1) f += (1 - .71) * (p < .25 ? p / .25 : (1 - p) / .75);
        }
        c.style.setProperty("--focus", f.toFixed(3));
      });
      chanRaf = requestAnimationFrame(chanFrame);
    };
    const go = (v, pin = false) => {
      clearTimeout(tIn); clearTimeout(tOut); clearTimeout(tSide); tSide = 0;
      if (v !== box.dataset.view) {
        cancelAnimationFrame(chanRaf);
        if (v === "agentic") { chanFrom = performance.now(); if (reduce) chans.forEach((c) => c.style.setProperty("--focus", ".71")); else chanRaf = requestAnimationFrame(chanFrame); }
      }
      pinned = v !== "rest" && pin;
      box.dataset.view = v;
      box.classList.toggle("is-pinned", pinned);
      box.classList.remove("is-away");
      trigs.forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.to === v)));
    };
    trigs.forEach((b) => {
      const zone = b.parentElement, v = b.dataset.to;
      zone.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse" || pinned) return; clearTimeout(tIn); tIn = setTimeout(() => go(v), 140); });
      zone.addEventListener("pointerleave", () => clearTimeout(tIn));
      zone.addEventListener("click", () => (box.dataset.view === v && pinned ? go("rest") : go(v, true)));
    });
    box.addEventListener("pointerenter", () => { clearTimeout(tOut); box.classList.remove("is-away"); });
    box.addEventListener("pointerleave", (e) => { clearTimeout(tIn); box.classList.add("is-away"); if (e.pointerType !== "mouse" || pinned || box.dataset.view === "rest") return; tOut = setTimeout(() => go("rest"), 180); });
    stage.addEventListener("pointermove", (e) => {
      const v = box.dataset.view;
      if (pinned || v === "rest") return;
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (!(v === "data" ? x > .56 : x < .44)) { clearTimeout(tSide); tSide = 0; return; }
      if (!tSide) tSide = setTimeout(() => { tSide = 0; if (!pinned) go("rest"); }, 120);
    });
    box.addEventListener("focusout", (e) => { if (!pinned && box.dataset.view !== "rest" && !box.contains(e.relatedTarget)) go("rest"); });
    box.querySelector(".f-surf__back").addEventListener("click", () => go("rest"));
  });
  const tip = document.createElement("span");
  tip.className = "f-tip"; tip.setAttribute("aria-hidden", "true");
  document.body.append(tip);
  let tipT = 0;
  document.querySelectorAll("[data-tip]").forEach((a) => {
    a.addEventListener("mouseenter", () => {
      clearTimeout(tipT);
      const r = a.getBoundingClientRect();
      tip.textContent = a.dataset.tip;
      tip.style.left = `${r.left + r.width / 2}px`; tip.style.top = `${r.top}px`;
      tip.classList.remove("is-off"); tip.classList.add("is-on");
    });
    a.addEventListener("mouseleave", () => { tip.classList.replace("is-on", "is-off"); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove("is-off"), 760); });
  });
  document.querySelectorAll(".f-hnav").forEach((a) => a.addEventListener("click", (e) => { const t = document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault(); window.ED.scrollTo(t); }));

  document.querySelectorAll(".f-side a").forEach((a) => a.addEventListener("click", (e) => { const t = document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault(); window.ED.scrollTo(t); }));
})();
