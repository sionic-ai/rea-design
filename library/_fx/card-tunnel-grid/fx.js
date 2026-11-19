(() => {
  // Card grid shader — tiles a card bundle (atlas) endlessly across one full-screen quad, and the faster it goes, the more the gaps widen and it bends like a tunnel pulling toward the center.
  // On first open it swells with a fisheye (lens) and releases on receiving fx:release
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }";
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uSheet;
    uniform vec2 uShift, uCount, uView, uSheetGrid;
    uniform float uGapPx, uSpread, uSink, uLens, uCards, uStep;
    uniform vec3 uGapInk, uHot, uCold;
    vec2 fisheye(vec2 p) {
      float r = length(p) / 0.5;
      return p * (0.9 / (1.0 + r * r));
    }
    void main() {
      vec2 p = vUv - 0.5;
      p = mix(p, fisheye(p), uLens);
      p *= 1.0 - uSink * 0.3 * length(p) * 2.0;
      vec2 g = (p + 0.5) * uCount + uShift;
      vec2 cell = floor(g);
      vec2 tile = uView / uCount;
      float gap = uGapPx / min(tile.x, tile.y) + uSpread * 0.09;
      vec2 q = (fract(g) - 0.5) / (1.0 - 2.0 * gap) + 0.5;
      vec3 col = uGapInk;
      if (q.x >= 0.0 && q.x <= 1.0 && q.y >= 0.0 && q.y <= 1.0) {
        float zoom = cell == uHot.xy ? uHot.z : (cell == uCold.xy ? uCold.z : 1.0);
        q = (q - 0.5) / zoom + 0.5;
        float k = mod(cell.x + cell.y * uStep, uCards);
        float cx = mod(k, uSheetGrid.x), cy = floor(k / uSheetGrid.x);
        col = texture2D(uSheet, vec2((cx + q.x) / uSheetGrid.x, (uSheetGrid.y - 1.0 - cy + q.y) / uSheetGrid.y)).rgb;
      }
      gl_FragColor = vec4(col * (1.0 - uSink * 0.2), 1.0);
    }`;
  const CELL = 512;
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
  // Keep the same card from landing in neighboring cells — row spacing coprime with the card count
  const strideFor = (n) => { if (n <= 1) return 1; const s = Math.max(7, Math.ceil(n / 3)); for (let i = s; i < n * 2; i++) if (gcd(i, n) === 1) return i; return s; };
  const ratio = (s) => { const [w, h] = String(s || "3:2").split(":").map(Number); return w > 0 && h > 0 ? w / h : 1.5; };

  // Placeholder card — small text above and below on a white panel, and the center photo slot (86%) states what photo goes there. If there is an img child, fit that photo into the slot
  function paintCard(ctx, x, y, size, part, css) {
    const v = (n, d) => css.getPropertyValue(n).trim() || d;
    const font = v("--kf-font-sans", "sans-serif");
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
    ctx.fillStyle = v("--kf-bg", "white"); /* Not skin: fallback value used only when no variable exists */
    ctx.fillRect(x, y, size, size);
    const img = part.tagName === "IMG" && part.complete && part.naturalWidth ? part : null;
    const r = img ? img.naturalWidth / img.naturalHeight : ratio(part.dataset.shape);
    const box = size * 0.867;
    const w = r >= 1 ? box : box * r, h = r >= 1 ? box / r : box;
    const px = x + (size - w) / 2, py = y + (size - h) / 2;
    if (img) ctx.drawImage(img, px, py, w, h);
    else {
      ctx.fillStyle = v("--kf-surface", "gainsboro"); /* Not skin: fallback */
      ctx.fillRect(px, py, w, h);
      ctx.strokeStyle = v("--kf-line", "silver"); /* Not skin: fallback */
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + w, py + h); ctx.moveTo(px + w, py); ctx.lineTo(px, py + h); ctx.stroke();
      const label = part.dataset.label || "";
      if (label) {
        ctx.fillStyle = v("--kf-dim", "gray"); /* Not skin: fallback */
        ctx.font = `500 ${Math.round(size * 0.034)}px ${font}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const words = label.split(" · ");
        words.forEach((t, i) => ctx.fillText(t, x + size / 2, py + h / 2 + (i - (words.length - 1) / 2) * size * 0.05, w * 0.9));
      }
    }
    ctx.fillStyle = v("--kf-ink", "black"); /* Not skin: fallback */
    ctx.font = `400 ${Math.round(size * 0.027)}px ${font}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (part.dataset.top) ctx.fillText(part.dataset.top, x + size / 2, y + size * 0.04);
    if (part.dataset.bottom) ctx.fillText(part.dataset.bottom, x + size / 2, y + size * 0.96);
    ctx.restore();
  }

  kfFx.register("card-tunnel-grid", (el, { options, reduce, hover }) => {
    const canvas = el.tagName === "CANVAS" ? el : el.querySelector("canvas");
    const parts = [...el.querySelectorAll('[data-fx-part="card"]')];
    const T = window.THREE;
    if (!canvas || !parts.length || !T) return;
    const css = getComputedStyle(el);
    const rows = +(options.rows || 3);
    const drift = +(options.drift ?? 0.003);
    const friction = +(options.friction ?? 0.95);
    const dragK = +(options.drag ?? 0.002), touchK = +(options.touch ?? 0.005), wheelK = +(options.wheel ?? 0.0002);
    const lift = +(options.hover ?? 1.07);
    const n = parts.length, cols = Math.ceil(Math.sqrt(n)), sheetRows = Math.ceil(n / cols);

    const sheet = document.createElement("canvas");
    sheet.width = cols * CELL; sheet.height = sheetRows * CELL;
    const sctx = sheet.getContext("2d");
    const paint = () => parts.forEach((p, i) => paintCard(sctx, (i % cols) * CELL, Math.floor(i / cols) * CELL, CELL, p, css));
    paint();
    const tex = new T.CanvasTexture(sheet);
    tex.minFilter = tex.magFilter = T.LinearFilter;

    const renderer = new T.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    // Pass the gap color to the shader as painted on screen (sRGB) — THREE.Color converts to linear and comes out darker.
    const inkOf = (name) => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = css.getPropertyValue(name).trim() || "gainsboro"; /* Not skin: fallback */
      c.fillRect(0, 0, 1, 1);
      const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
      return new T.Vector3(r / 255, g / 255, b / 255);
    };
    const gapInk = inkOf("--kf-surface");
    const u = {
      uSheet: { value: tex }, uShift: { value: new T.Vector2() }, uCount: { value: new T.Vector2(rows, rows) }, uView: { value: new T.Vector2() },
      uSheetGrid: { value: new T.Vector2(cols, sheetRows) }, uGapPx: { value: +(options.gap ?? 2) }, uSpread: { value: 0 }, uSink: { value: 0 },
      uLens: { value: options.lens === "1" ? 1 : 0 }, uCards: { value: n }, uStep: { value: strideFor(n) }, uGapInk: { value: gapInk },
      uHot: { value: new T.Vector3(-9999, -9999, 1) }, uCold: { value: new T.Vector3(-9999, -9999, 1) },
    };
    const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG }));
    scene.add(mesh);

    const size = () => {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      u.uView.value.set(w, h);
      const a = w / h;
      u.uCount.value.set(a > 1 ? rows * a : rows, a > 1 ? rows : rows / a);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const shift = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, last = { x: 0, y: 0 }, down = { x: 0, y: 0 };
    let dragging = false, locked = u.uLens.value > 0, busy = false, spread = 0, sink = 0;
    const hot = { x: -9999, y: -9999, s: 1 }, cold = { x: -9999, y: -9999, s: 1 };
    let hotTw, coldTw;
    const sync = () => { u.uHot.value.set(hot.x, hot.y, hot.s); u.uCold.value.set(cold.x, cold.y, cold.s); };

    // Screen point → cell (null if in a gap). Warp is ignored and measured on the straight grid (the original picks it the same way)
    const cellAt = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      const gx = ((cx - r.left) / r.width) * u.uCount.value.x + shift.x;
      const gy = (1 - (cy - r.top) / r.height) * u.uCount.value.y + shift.y;
      const x = Math.floor(gx), y = Math.floor(gy), g = spread * 0.09;
      const qx = (gx - x - 0.5) / (1 - g * 2) + 0.5, qy = (gy - y - 0.5) / (1 - g * 2) + 0.5;
      return qx < 0 || qx > 1 || qy < 0 || qy > 1 ? null : { x, y };
    };
    const letGo = () => {
      if (hot.x === -9999) return;
      hotTw?.kill(); coldTw?.kill();
      Object.assign(cold, hot);
      coldTw = gsap.to(cold, { s: 1, duration: 0.3, ease: "power2.out", onUpdate: sync, onComplete: () => { cold.x = cold.y = -9999; sync(); } });
      hot.x = hot.y = -9999; hot.s = 1; sync();
    };
    const aim = (cx, cy) => {
      if (busy || locked || dragging || !hover) return letGo();
      const c = cellAt(cx, cy);
      if (!c) return letGo();
      if (c.x === hot.x && c.y === hot.y) return;
      letGo();
      hot.x = c.x; hot.y = c.y; hot.s = 1;
      hotTw = gsap.to(hot, { s: lift, duration: 0.4, ease: "power2.out", onUpdate: sync });
    };

    const onDown = (e) => { if (locked || busy) return; dragging = true; canvas.classList.add("is-drag"); last.x = e.clientX; last.y = e.clientY; vel.x = vel.y = 0; letGo(); };
    const onMove = (e) => {
      if (!dragging) return aim(e.clientX, e.clientY);
      vel.x = -(e.clientX - last.x) * dragK; vel.y = (e.clientY - last.y) * dragK;
      shift.x += vel.x; shift.y += vel.y; last.x = e.clientX; last.y = e.clientY;
    };
    const onUp = () => { dragging = false; canvas.classList.remove("is-drag"); };
    const onLeave = () => { onUp(); letGo(); };
    const onWheel = (e) => { e.preventDefault(); if (locked) return; vel.x += e.deltaX * wheelK; vel.y -= e.deltaY * wheelK; };
    // Touch dragging is this part’s whole job, so block page scroll — if the board is shorter than the screen height, the page scrolls from outside it.
    const onTouchStart = (e) => {
      if (locked || busy) return;
      e.preventDefault();
      const t = e.touches[0]; dragging = true; last.x = down.x = t.clientX; last.y = down.y = t.clientY; vel.x = vel.y = 0;
    };
    const onTouchMove = (e) => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      vel.x = -(t.clientX - last.x) * touchK; vel.y = (t.clientY - last.y) * touchK;
      shift.x += vel.x; shift.y += vel.y; last.x = t.clientX; last.y = t.clientY;
    };
    const onTouchEnd = (e) => {
      dragging = false;
      const t = e.changedTouches[0];
      if (Math.hypot(t.clientX - down.x, t.clientY - down.y) < 10) onClick({ clientX: t.clientX, clientY: t.clientY });
    };
    const onClick = (e) => {
      if (busy || locked) return;
      const c = cellAt(e.clientX, e.clientY);
      if (!c) return;
      const k = ((c.x + c.y * u.uStep.value) % n + n) % n;
      const r = canvas.getBoundingClientRect(), cw = r.width / u.uCount.value.x, ch = r.height / u.uCount.value.y;
      const rect = { x: r.left + (c.x - shift.x) * cw, y: r.top + r.height - (c.y + 1 - shift.y) * ch, w: cw, h: ch };
      const one = document.createElement("canvas");
      one.width = one.height = CELL;
      one.getContext("2d").drawImage(sheet, (k % cols) * CELL, Math.floor(k / cols) * CELL, CELL, CELL, 0, 0, CELL, CELL);
      vel.x = vel.y = 0;
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true, detail: { index: k, rect, image: one.toDataURL("image/jpeg", 0.9), href: parts[k].dataset.href || "", part: parts[k] } }));
    };
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("click", onClick);

    // What the caller invokes — fx:release (release the fisheye and start accepting interaction) · fx:busy (pause during the open sequence on/off)
    const onRelease = (e) => {
      const d = e.detail || {};
      gsap.to(u.uLens, { value: 0, duration: d.dur ?? 1, ease: d.ease || "power3.out", delay: d.delay ?? 0, onComplete: () => { locked = false; } });
    };
    const onBusy = (e) => { busy = !!(e.detail ?? true); };
    el.addEventListener("fx:release", onRelease);
    el.addEventListener("fx:busy", onBusy);

    const tick = () => {
      if (!busy && !locked && !reduce) {
        shift.x += drift;
        if (!dragging) { shift.x += vel.x; shift.y += vel.y; vel.x *= friction; vel.y *= friction; }
        const speed = Math.hypot(vel.x, vel.y);
        spread += (Math.min(speed * 20, 1) - spread) * 0.1;
        sink += (Math.min(speed * 15, 1) - sink) * 0.08;
      }
      u.uShift.value.set(shift.x, shift.y);
      u.uSpread.value = spread;
      u.uSink.value = sink;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    // Repaint card text when fonts arrive late
    document.fonts?.ready.then(() => { paint(); tex.needsUpdate = true; });

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      hotTw?.kill(); coldTw?.kill();
      gsap.killTweensOf(u.uLens);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onClick);
      el.removeEventListener("fx:release", onRelease);
      el.removeEventListener("fx:busy", onBusy);
      mesh.geometry.dispose(); mesh.material.dispose(); tex.dispose(); renderer.dispose();
    };
  });
})();
