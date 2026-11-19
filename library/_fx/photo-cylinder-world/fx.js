(() => {
  // Photo tiles are stacked vertically on each column of the cylinder’s inner face (CSS 3D — translate3d + rotateY) so you can look around.
  // It spins on its own at spin° per second and drifts up drift px at a time, the head turns look° toward the cursor and tilts up and down, and if the cursor stays outside 78% of the width for .45s it is pushed that way at up to edge°/s.
  // Drag and horizontal wheel carry inertia (.04× per second). When hovering a tile, rotation stops, that tile comes forward 70px and the label follows the cursor.
  // As you scroll the panel chosen by open (1 when the panel’s top edge has risen 90% of the screen), tiles scatter outward from the screen center. At first they fly in from 500px behind, nearest columns first.
  // Via the fx:world event every frame { open, time } signals this — the consuming side uses that value to show the center text and button. Pause and resume with fx:pause and fx:play.
  const RATIOS = [1.33, 1, 0.8, 1.6, 1.25, 0.75];
  kfFx.register("photo-cylinder-world", (el, { options, reduce, hover }) => {
    const src = [...el.querySelectorAll(':scope > [data-fx-part="tile"]')];
    if (!src.length) return;
    src.forEach((s) => (s.hidden = true));
    const world = document.createElement("div");
    world.className = "fx-pcw-world";
    el.prepend(world);
    const chip = document.createElement("span");
    chip.className = "fx-pcw-chip";
    chip.setAttribute("aria-hidden", "true");
    el.append(chip);
    const openEl = options.open ? document.querySelector(options.open) : null;
    const base = { W: +(options.width || 250), R: +(options.radius || 900), Z: +(options.push ?? 540), P: +(options.focal || 1100), GAP: +(options.gap ?? 34) };
    const SPIN = +(options.spin ?? 7), DRIFT = +(options.drift ?? 22), LOOK = +(options.look ?? 24), EDGE = +(options.edge ?? 14);
    const suffix = options.suffix ?? " · case study";
    let paused = false;
    const still = () => reduce || paused;

    let cfg = { ...base }, tiles = [], cols = [];
    function build() {
      world.textContent = "";
      tiles = [];
      cols = [];
      const narrow = innerWidth < 760, k = Math.max(1, innerWidth / 1440);
      cfg = narrow ? { W: Math.round(base.W * 0.6), R: Math.round(base.R * 0.622), Z: Math.round(base.Z * 0.611), P: Math.round(base.P * 0.691), GAP: Math.round(base.GAP * 0.647) }
        : { W: Math.round(base.W * Math.min(k, 1.35)), R: Math.round(base.R * k), Z: Math.round(base.Z * k), P: Math.round(base.P * k), GAP: Math.round(base.GAP * Math.min(k, 1.35)) };
      world.style.perspective = `${cfg.P}px`;
      const n = Math.max(3, Math.round(360 / (((cfg.W + cfg.GAP + 14) / cfg.R) * 180 / Math.PI)));
      const height = narrow ? Math.max(1100, innerHeight * 2.4) : 2300 * k;
      const cells = [];
      for (let c = 0; c < n; c++) {
        let y = 0, r = c * 2;
        while (y < height) { const h = Math.round(cfg.W / RATIOS[r % RATIOS.length]); r++; cells.push({ c, y, h }); y += h + cfg.GAP; }
        cols.push({ phi: (360 / n) * c, L: y, off: (c * 173) % 400 });
      }
      cells.forEach((cell, i) => {
        const from = src[(i * 7) % src.length];
        const a = from.cloneNode(true);
        a.hidden = false;
        a.removeAttribute("data-fx-part");
        a.classList.add("fx-pcw-tile");
        a.tabIndex = -1;
        a.draggable = false;
        a.style.width = `${cfg.W}px`;
        a.style.height = `${cell.h}px`;
        const name = from.dataset.name || "";
        a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { overTile = true; hot = a; if (name) chipOn(name, e); } });
        a.addEventListener("pointerleave", () => { overTile = false; if (hot === a) hot = null; chipOff(); });
        a.addEventListener("click", (e) => { if (dragDist > 6) e.preventDefault(); });
        world.append(a);
        tiles.push({ el: a, col: cell.c, y: cell.y, h: cell.h, shown: false, lift: 0 });
      });
    }

    let rot = 0, vel = 0, act = 1, overTile = false, auto = reduce ? 0 : SPIN, drift = 0, movedAt = -1e9;
    let yaw = 0, pitch = 0, yawT = 0, pitchT = 0, px = 0, inside = false, edge = 0, hot = null, dragging = false, dragDist = 0, lastX = 0;
    let axis = 0, downX = 0, downY = 0, touch = false, vw = innerWidth, vh = innerHeight;
    const memo = new WeakMap();
    const put = (node, k, v) => { let m = memo.get(node); if (!m) memo.set(node, (m = {})); if (m[k] !== v) { m[k] = v; node.style[k] = v; } };
    const chipOn = (name, e) => { chip.textContent = `${name}${suffix}`; chip.classList.add("on"); chipMove(e); };
    const chipMove = (e) => (chip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`);
    const chipOff = () => chip.classList.remove("on");

    const onPause = () => { paused = true; auto = 0; };
    const onPlay = () => { paused = false; auto = still() ? 0 : SPIN; };
    const down = (e) => { dragging = true; dragDist = 0; lastX = downX = e.clientX; downY = e.clientY; vel = 0; touch = e.pointerType !== "mouse"; axis = touch ? 0 : 1; };
    const look = (e) => {
      if (e.pointerType !== "mouse" || reduce) return;
      px = (e.clientX / vw) * 2 - 1;
      if (!dragging) { yawT = px * LOOK; pitchT = (e.clientY / vh) * 2 - 1; }
      inside = true;
      movedAt = performance.now();
      if (hot) chipMove(e);
    };
    const leave = () => { inside = false; yawT = 0; pitchT = 0; edge = 0; chipOff(); };
    const wheel = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !reduce) { vel -= e.deltaX * 0.9; e.preventDefault(); } };
    const drag = (e) => {
      if (!dragging) return;
      if (!axis) {
        const dx = Math.abs(e.clientX - downX), dy = Math.abs(e.clientY - downY);
        if (dx + dy < 8) return;
        axis = dx > dy * 1.2 ? 1 : -1;
        lastX = e.clientX;
      }
      if (axis < 0) return;
      const d = e.clientX - lastX;
      lastX = e.clientX;
      dragDist += Math.abs(d);
      if (dragDist > 6 && !world.hasPointerCapture(e.pointerId)) { try { world.setPointerCapture(e.pointerId); } catch {} world.classList.add("grab"); }
      rot += d * 0.09;
      vel += (d * 6 - vel) * (touch ? 0.35 : 1);
    };
    const up = () => { dragging = false; world.classList.remove("grab"); };
    let rt = 0;
    const resize = () => {
      if (innerWidth === vw && Math.abs(innerHeight - vh) < 160 && matchMedia("(pointer: coarse)").matches) return;
      clearTimeout(rt);
      rt = setTimeout(() => { const flip = innerWidth < 760 !== vw < 760; vw = innerWidth; vh = innerHeight; if (flip) build(); }, 120);
    };
    el.addEventListener("fx:pause", onPause);
    el.addEventListener("fx:play", onPlay);
    world.addEventListener("pointerdown", down);
    world.addEventListener("pointermove", drag);
    world.addEventListener("pointerup", up);
    world.addEventListener("pointercancel", up);
    if (hover) { el.addEventListener("pointermove", look); el.addEventListener("pointerleave", leave); }
    el.addEventListener("wheel", wheel, { passive: false });
    addEventListener("resize", resize);
    build();

    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (v) => v * v * (3 - 2 * v);
    const hash = (i) => { const s = Math.sin(i * 78.233) * 43758.5453; return s - Math.floor(s); };
    let t0 = performance.now(), last = t0, gEase = 0, raf = 0, alive = true;
    function frame(now) {
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const t = (now - t0) / 1000;
      const ref = (openEl || el).getBoundingClientRect();
      const target = openEl ? clamp(-ref.top / (vh * 0.9)) : 0;
      gEase = reduce || Math.abs(target - gEase) < 5e-4 ? target : gEase + (target - gEase) * (1 - Math.exp(-dt / 0.1));
      const G = gEase;
      const box = el.getBoundingClientRect();
      if (box.bottom > 0 && box.top < vh) {
        if (!dragging) {
          vel *= 0.04 ** dt;
          act += ((overTile ? 0 : now - movedAt < 900 ? 0.35 : 1) - act) * (1 - 0.05 ** dt);
          const pushing = inside && now - movedAt > 450 && Math.abs(px) > 0.78 && !overTile;
          edge += ((pushing ? Math.sign(px) * EDGE * Math.min(1, (Math.abs(px) - 0.78) / 0.2) : 0) - edge) * (1 - 0.02 ** dt);
          rot += (auto * act + vel + edge) * dt;
        }
        if (!still()) drift += DRIFT * act * dt;
        const e = 1 - 4e-4 ** dt;
        yaw += (yawT - yaw) * e;
        pitch += (pitchT - pitch) * e;
        put(world, "perspectiveOrigin", `50% ${(50 + pitch * 9).toFixed(2)}%`);
        const turn = rot - yaw, lift = -pitch * 70, { R, Z, P, W } = cfg, narrow = innerWidth < 760;
        for (let i = 0; i < tiles.length; i++) {
          const tl = tiles[i], col = cols[tl.col];
          const s = (((col.phi + turn) % 360) + 540) % 360 - 180;
          let show = Math.abs(s) <= 82 && G < 1, alpha = 1;
          if (show) {
            const rad = (s * Math.PI) / 180;
            let x = R * Math.sin(rad);
            const zz = Z - R * Math.cos(rad);
            let y = (((tl.y + col.off - drift) % col.L) + col.L) % col.L - col.L / 2 + tl.h / 2 + lift;
            if (Math.abs(y) > (narrow ? col.L / 2 + 200 : (1000 * R) / 900)) show = false;
            else {
              const a = P / (P - zz), sx = x * a, sy = y * a, dist = Math.hypot(sx, sy);
              const ang = dist < 40 ? hash(i + 13) * Math.PI * 2 : Math.atan2(sy, sx);
              const open = smooth(clamp((G - Math.min(1, dist / 900) * 0.3) / 0.7));
              if (open > 0.995) show = false;
              else {
                const push = ((Math.max(0, Math.hypot(vw, vh) / 1.7 - dist) + 250) / a) * open;
                const order = Math.abs(s) / 82 + Math.abs(y) / 1400;
                const intro = reduce ? 1 : 1 - (1 - clamp((t - 0.1 - order * 0.9) / 0.9)) ** 3;
                x += Math.cos(ang) * push;
                y += Math.sin(ang) * push;
                tl.lift += (+(tl.el === hot && G < 0.2) - tl.lift) * (1 - 0.001 ** dt);
                const z = zz - (1 - intro) * 500 + 160 * open + tl.lift * 70;
                if (z > P * 0.7) show = false;
                alpha = intro * Math.min(1, (P * 0.7 - z) / 250);
                if (show) tl.el.style.transform = `translate3d(${(x - W / 2).toFixed(1)}px,${(y - tl.h / 2).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(-s).toFixed(2)}deg)`;
              }
            }
          }
          if (show !== tl.shown) { tl.shown = show; tl.el.style.visibility = show ? "visible" : "hidden"; }
          if (show) put(tl.el, "opacity", alpha.toFixed(3));
        }
      }
      el.dispatchEvent(new CustomEvent("fx:world", { detail: { open: G, time: t } }));
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      el.removeEventListener("fx:pause", onPause);
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("pointermove", look);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("wheel", wheel);
      removeEventListener("resize", resize);
      world.remove();
      chip.remove();
      src.forEach((s) => (s.hidden = false));
    };
  });
})();
