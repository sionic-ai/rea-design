// The panel moves only by translate and scale from a center transform-origin — even when zoomed, the bounds calculation grows only by (scale−1)/2 of the panel size
(() => {
  const easeOutQuad = (t) => 1 - (1 - t) ** 2;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  // zoom-ease takes cubic-bezier(x1,y1,x2,y2) — the curve is used as is, the way CSS ease is used
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = (t) => ((ax * t + bx) * t + cx) * t, fy = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => { let t = x; for (let i = 0; i < 8; i++) { const d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= (fx(t) - x) / d; } return fy(Math.min(1, Math.max(0, t))); };
  };
  kfFx.register("zoom-pan-board", (el, { options, reduce }) => {
    const vp = el.querySelector("[data-fx-part=viewport]") || el;
    const board = el.querySelector("[data-fx-part=board]");
    if (!board) return;
    const map = el.querySelector("[data-fx-part=map]");
    const ind = el.querySelector("[data-fx-part=indicator]");
    const zin = el.querySelector("[data-fx-part=zoom-in]");
    const zout = el.querySelector("[data-fx-part=zoom-out]");
    const num = (k, d) => +(options[k] ?? d);
    const GLIDE = num("glide", 0.8) * 1000, FLY = num("fly", 1) * 1000, ZDUR = num("zoom-dur", 0.3) * 1000;
    const STEP = num("zoom-step", 0.2), MIN = num("min", 0.5), MAX = num("max", 1.4), GAP = num("gap", 50);
    const [fx, fy] = String(options.focus || "").split(",").map(Number);
    const WHEEL_Y = options.wheel === "y", WSPD = num("wheel-speed", 1);
    const STEPS = options.steps ? String(options.steps).split(",").map((t) => t.trim()) : null;
    const ZEASE = options["zoom-ease"] === "ease" ? bezier(0.25, 0.1, 0.25, 1)
      : options["zoom-ease"] ? bezier(...String(options["zoom-ease"]).split(",").map(Number)) : easeInOutCubic;
    const phone = matchMedia("(max-width: 767px)");
    let W = 0, H = 0, vw = 0, vh = 0, fit = MIN;
    let x = 0, y = 0, s = phone.matches ? num("phone-scale", 0.8) : 1;
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    let raf = 0, dragging = false, pinch = null, mapDrag = null, zTarget = null;
    let sx = 0, sy = 0, lx = 0, ly = 0, vx = 0, vy = 0;

    const locked = () => el.classList.contains("is-locked");
    const clampS = (v) => Math.min(MAX, Math.max(Math.max(MIN, fit), v));
    const measure = () => {
      W = board.offsetWidth; H = board.offsetHeight; vw = vp.clientWidth; vh = vp.clientHeight;
      if (W && H) fit = Math.max(vw / W, vh / H);
    };
    const bounds = () => {
      const h = (s - 1) / 2;
      minX = vw - W - h * W; minY = vh - H - h * H; maxX = h * W; maxY = h * H;
    };
    // Translation value that puts a point (px, py) of the plate at the window’s (cx, cy)
    const toward = (cx, cy, px, py, sc) => ({ x: cx - W / 2 - (px - W / 2) * sc, y: cy - H / 2 - (py - H / 2) * sc });
    const focus = () => toward(vw / 2, vh / 2, Number.isFinite(fx) ? fx : W / 2, Number.isFinite(fy) ? fy : H / 2, s);
    const paintMap = () => {
      if (!map || !ind || !W) return;
      const mw = map.clientWidth, mh = map.clientHeight;
      const iw = mw * Math.min(1, vw / (W * s)), ih = mh * Math.min(1, vh / (H * s));
      const px = minX === maxX ? 0 : (x - maxX) / (minX - maxX), py = minY === maxY ? 0 : (y - maxY) / (minY - maxY);
      ind.style.width = `${iw}px`;
      ind.style.height = `${ih}px`;
      ind.style.transform = `translate3d(${(mw - iw) * px}px, ${(mh - ih) * py}px, 0)`;
    };
    const paintZoom = () => {
      if (zin) zin.disabled = s >= MAX - 1e-3;
      if (zout) zout.disabled = s <= clampS(MIN) + 1e-3;
    };
    const place = (nx, ny) => {
      x = Math.min(maxX, Math.max(minX, nx));
      y = Math.min(maxY, Math.max(minY, ny));
      board.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      paintMap();
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; zTarget = null; };
    const tween = (dur, step, done) => {
      stop();
      if (reduce || dur <= 0) { step(1); done?.(); return; }
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        step(p);
        if (p < 1) raf = requestAnimationFrame(tick); else { raf = 0; done?.(); }
      };
      raf = requestAnimationFrame(tick);
    };
    // When the board size arrives late (CSS attached later on a page transition), snap to the first position the moment the initial size is obtained.
    let placed = false;
    const reset = (recenter) => {
      measure();
      if (!W || !H) return;
      s = clampS(s); bounds();
      if (recenter || !placed) { const f = focus(); x = f.x; y = f.y; placed = true; }
      place(x, y); paintZoom();
    };
    const zoomAt = (ns, cx, cy) => {
      ns = clampS(ns);
      if (ns === s) return;
      const r = vp.getBoundingClientRect();
      const px = W / 2 + (cx - r.left - x - W / 2) / s, py = H / 2 + (cy - r.top - y - H / 2) / s;
      s = ns; bounds();
      const t = toward(cx - r.left, cy - r.top, px, py, s);
      place(t.x, t.y); paintZoom();
    };
    const zoomTo = (target) => {
      const from = s; target = clampS(target);
      if (target === s) return;
      tween(ZDUR, (p) => { s = from + (target - from) * ZEASE(p); bounds(); place(x, y); paintZoom(); }, () => { zTarget = null; });
      if (raf) zTarget = target;
    };
    const flyTo = (tx, ty) => {
      const fx0 = x, fy0 = y;
      tween(FLY, (p) => { const e = easeInOutCubic(p); place(fx0 + (tx - fx0) * e, fy0 + (ty - fy0) * e); });
    };
    // On release, the speed eases down to 0 over the glide with easeOutQuad — an axis that hits an edge stops at once
    const glide = () => {
      if (GLIDE <= 0) return;
      let ix = vx, iy = vy;
      const t0 = performance.now();
      stop();
      const tick = (now) => {
        const k = 1 - easeOutQuad(Math.min(1, (now - t0) / GLIDE));
        const dx = ix * k, dy = iy * k;
        if (Math.abs(dx) <= 0.1 && Math.abs(dy) <= 0.1) { raf = 0; return; }
        const nx = x + dx, ny = y + dy;
        if (nx > maxX || nx < minX) ix = 0;
        if (ny > maxY || ny < minY) iy = 0;
        place(nx, ny);
        raf = requestAnimationFrame(tick);
      };
      if (!reduce) raf = requestAnimationFrame(tick);
    };

    const down = (cx, cy) => { dragging = true; stop(); sx = cx - x; sy = cy - y; lx = cx; ly = cy; vx = vy = 0; el.classList.add("is-dragging"); };
    const move = (cx, cy) => { vx = (cx - lx) * s; vy = (cy - ly) * s; lx = cx; ly = cy; place(cx - sx, cy - sy); };
    const up = () => { if (!dragging) return; dragging = false; el.classList.remove("is-dragging"); glide(); };
    const mapPoint = (cx, cy) => {
      const r = map.getBoundingClientRect();
      const mw = map.clientWidth, mh = map.clientHeight, iw = ind.offsetWidth, ih = ind.offsetHeight;
      const px = Math.min(Math.max(cx - r.left - mapDrag.ox, 0), mw - iw), py = Math.min(Math.max(cy - r.top - mapDrag.oy, 0), mh - ih);
      place(maxX + (mw - iw ? px / (mw - iw) : 0) * (minX - maxX), maxY + (mh - ih ? py / (mh - ih) : 0) * (minY - maxY));
    };

    const onDown = (e) => {
      if (e.button !== 0 || locked() || e.target.closest("a, button, [data-fx-part=map]")) return;
      e.preventDefault();
      down(e.clientX, e.clientY);
    };
    const onMapDown = (e) => {
      if (locked()) return;
      e.preventDefault(); e.stopPropagation(); stop();
      const ir = ind.getBoundingClientRect();
      const inside = e.clientX >= ir.left && e.clientX <= ir.right && e.clientY >= ir.top && e.clientY <= ir.bottom;
      mapDrag = { ox: inside ? e.clientX - ir.left : ir.width / 2, oy: inside ? e.clientY - ir.top : ir.height / 2 };
      ind.classList.add("is-dragging");
      mapPoint(e.clientX, e.clientY);
    };
    const onMove = (e) => {
      if (mapDrag) { e.preventDefault(); mapPoint(e.clientX, e.clientY); return; }
      if (dragging) { e.preventDefault(); move(e.clientX, e.clientY); }
    };
    const onUp = () => { if (mapDrag) { mapDrag = null; ind.classList.remove("is-dragging"); return; } up(); };
    const onWheel = (e) => {
      e.preventDefault();
      if (locked()) return;
      stop();
      if (e.ctrlKey) zoomAt(s * Math.exp(-e.deltaY * 0.005), e.clientX, e.clientY);
      else place(x - (WHEEL_Y ? 0 : e.deltaX) * WSPD, y - e.deltaY * WSPD);
    };
    const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const onTouchStart = (e) => {
      if (locked()) return;
      if (e.target.closest("a, button")) return;
      e.preventDefault();
      if (e.touches.length > 1) { dragging = false; stop(); pinch = { d: dist(e.touches[0], e.touches[1]), s }; return; }
      if (!pinch) down(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e) => {
      if (pinch && e.touches.length > 1) {
        e.preventDefault();
        const [a, b] = e.touches;
        if (pinch.d) zoomAt(pinch.s * (dist(a, b) / pinch.d), (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        return;
      }
      if (dragging && e.touches.length === 1) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }
    };
    const onTouchEnd = (e) => {
      if (pinch && e.touches.length < 2) { pinch = null; if (e.touches.length === 1) down(e.touches[0].clientX, e.touches[0].clientY); return; }
      if (e.touches.length === 0) up();
    };
    const onClick = (e) => {
      const a = e.target.closest("[data-fx-part=goto]");
      if (!a || !el.contains(a)) return;
      e.preventDefault();
      const id = (a.getAttribute("href") || "#").slice(1);
      if (!id) { const f = focus(); flyTo(f.x, f.y); return; }
      const t = board.querySelector(`#${CSS.escape(id)}`);
      if (!t) return;
      let l = 0, tp = 0, n = t;
      while (n && n !== board) { l += n.offsetLeft; tp += n.offsetTop; n = n.offsetParent; if (n && !board.contains(n)) break; }
      const left = W / 2 + (l - W / 2) * s, top = H / 2 + (tp - H / 2) * s, right = W / 2 + (l + t.offsetWidth - W / 2) * s;
      const tx = a.dataset.side === "right" ? vw - GAP - right : -left + GAP;
      flyTo(tx, GAP - top);
    };
    // With steps, the ± buttons step through that scale list one at a time — fit is the scale covering the whole window, mid is halfway between fit and 1
    const stepVals = () => STEPS.map((t) => (t === "fit" ? fit : t === "mid" ? (fit + 1) / 2 : +t)).filter(Number.isFinite).sort((a, b) => a - b);
    const zIn = () => { if (!STEPS) return zoomTo((zTarget ?? s) + STEP); const n = stepVals().find((v) => v > (zTarget ?? s) + 1e-3); if (n != null) zoomTo(n); };
    const zOut = () => { if (!STEPS) return zoomTo((zTarget ?? s) - STEP); const n = stepVals().reverse().find((v) => v < (zTarget ?? s) - 1e-3); if (n != null) zoomTo(n); };
    const ro = new ResizeObserver(() => reset(false));

    vp.addEventListener("mousedown", onDown);
    vp.addEventListener("wheel", onWheel, { passive: false });
    vp.addEventListener("touchstart", onTouchStart, { passive: false });
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", onUp);
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("touchend", onTouchEnd);
    el.addEventListener("click", onClick);
    ind?.addEventListener("mousedown", onMapDown);
    zin?.addEventListener("click", zIn);
    zout?.addEventListener("click", zOut);
    ro.observe(vp); ro.observe(board);
    reset(true);
    el.kfBoardHome = () => { const f = focus(); flyTo(f.x, f.y); };

    return () => {
      stop(); ro.disconnect();
      vp.removeEventListener("mousedown", onDown);
      vp.removeEventListener("wheel", onWheel);
      vp.removeEventListener("touchstart", onTouchStart);
      removeEventListener("mousemove", onMove);
      removeEventListener("mouseup", onUp);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("click", onClick);
      ind?.removeEventListener("mousedown", onMapDown);
      zin?.removeEventListener("click", zIn);
      zout?.removeEventListener("click", zOut);
      delete el.kfBoardHome;
      board.style.transform = "";
      if (ind) { ind.style.cssText = ""; }
    };
  });
})();
