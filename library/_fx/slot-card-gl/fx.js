// Draw one card on a WebGL board fixed to the screen, and at spots in the document (data-fx-part="slot") follow along in scroll order.
// Once each slot has a pose (tilt·turn·spin·spread·gone·shadow), slot size, position and pose are blended with smoothstep while passing between two sections, and
// Via points tilt extra by sin(πt). The card is cols×rows pieces: spread pulls them apart, and gone sends the even pieces flying far.
// On the first section it tilts toward the mouse and the cell under the cursor glows, and on the sparkle section cells sparkle on their own.
(() => {
  const TAU = Math.PI * 2;
  const KEYS = ["tilt", "turn", "spin", "spread", "gone", "shadow"];
  const smooth = (t) => t * t * (3 - 2 * t);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const hash = (n) => { const t = Math.sin(n * 127.1 + 311.7) * 43758.5453; return t - Math.floor(t); };
  const parse = (s) => {
    const o = {};
    for (const part of (s || "").split(";")) {
      const i = part.indexOf(":");
      if (i <= 0) continue;
      const v = part.slice(i + 1).trim().replace(/tau/g, String(TAU));
      o[part.slice(0, i).trim()] = /^[-+*.\d\s]+$/.test(v) ? v.split("*").reduce((a, b) => a * Number(b), 1) : v;
    }
    return o;
  };

  kfFx.register("slot-card-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const markers = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (!markers.length) return;
    const cols = parseInt(options.cols, 10) || 3, rows = parseInt(options.rows, 10) || 2;
    const ratio = Number(options.ratio ?? 773 / 512) || 1.51;
    const cellCols = parseInt(options["cell-cols"], 10) || 6;
    const narrowQ = matchMedia(`(max-width: ${parseInt(options.narrow, 10) || 1024}px)`);
    const desktop = hover && !narrowQ.matches;
    const css = getComputedStyle(document.documentElement);
    const color = (name, fb) => (css.getPropertyValue(name).trim() || fb);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-scg__gl";
    canvas.setAttribute("aria-hidden", "true");
    el.appendChild(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); }
    catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 20000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(-0.6, 1, 1.4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(1, -0.4, 0.8);
    scene.add(rim);
    // Reflection forming at the cursor — a point light placed close in front of the card follows the cursor, so the bright spot on the surface moves with it.
    const spot = new THREE.PointLight(0xffffff, 0, 0, 0);
    scene.add(spot);

    // Card art — left ink panel · center vertical stripes · right accent-color cell grid · name line top left · number bottom left.
    const TW = 1024, TH = Math.round(1024 / ratio);
    const cell = (0.955 - 0.79) * TW / cellCols;
    const cellRows = Math.max(4, Math.floor((0.86 * TH) / cell));
    const cellX0 = 0.79 * TW, cellY0 = (TH - cellRows * cell) / 2;
    const base = cellRows * cellCols;
    const pattern = Array.from({ length: base }, (_, i) => {
      const r = hash(i * 3.17 + 9), c = i % cellCols;
      const bias = 0.25 + c / cellCols * 0.45;
      return r < bias ? (r < bias * 0.45 ? 1 : 0.55) : 0;
    });
    const glow = new Float32Array(base), want = new Float32Array(base), spark = new Float32Array(base);
    const mapCv = document.createElement("canvas"), emCv = document.createElement("canvas");
    mapCv.width = emCv.width = TW; mapCv.height = emCv.height = TH;
    const mctx = mapCv.getContext("2d"), ectx = emCv.getContext("2d");
    const ink = color("--fx-card-face", "") || color("--kf-bg", "black"), paper = color("--kf-ink", "white");
    let accent = color("--fx-card-accent", "") || color("--kf-accent", paper);
    const drawBase = () => {
      mctx.fillStyle = ink; mctx.fillRect(0, 0, TW, TH);
      mctx.fillStyle = paper;
      for (let b = 0; b < 8; b++) { mctx.globalAlpha = 0.025 * (1 - b / 8); mctx.fillRect(0, 0, TW * (1 - b / 8), TH * (1 - b / 8)); }
      for (let x = 0.3 * TW, n = 0; x < 0.77 * TW; x += 7, n++) { mctx.globalAlpha = n % 2 ? 0.05 : 0.12; mctx.fillRect(Math.round(x), 0, 3, TH); }
      mctx.globalAlpha = 0.12;
      [[0.06, 0.1, 0.15], [0.06, 0.15, 0.11], [0.06, 0.2, 0.13]].forEach(([x, y, w]) => mctx.fillRect(x * TW, y * TH, w * TW, 0.022 * TH));
      mctx.globalAlpha = 0.16;
      const px = 0.012 * TW;
      [[0, 0, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]].forEach((row, ry) => row.forEach((on, rx) => {
        if (!on) return;
        mctx.fillRect(0.06 * TW + rx * px, 0.78 * TH + ry * px, px, px);
        mctx.fillRect(0.06 * TW + (rx + 6) * px, 0.78 * TH + ry * px, px, px);
      }));
      mctx.globalAlpha = 1;
      for (let i = 0; i < base; i++) {
        const c = i % cellCols, r = Math.floor(i / cellCols);
        if (!pattern[i]) continue;
        mctx.globalAlpha = pattern[i];
        mctx.fillStyle = accent;
        mctx.fillRect(cellX0 + c * cell + 1, cellY0 + r * cell + 1, cell - 2, cell - 2);
      }
      mctx.globalAlpha = 1;
    };
    const drawGlow = () => {
      ectx.clearRect(0, 0, TW, TH);
      for (let i = 0; i < base; i++) {
        const v = Math.max(glow[i], spark[i]);
        if (v < 0.004) continue;
        const c = i % cellCols, r = Math.floor(i / cellCols);
        ectx.globalAlpha = Math.min(1, v);
        ectx.fillStyle = pattern[i] ? accent : paper;
        ectx.fillRect(cellX0 + c * cell, cellY0 + r * cell, cell, cell);
      }
      ectx.globalAlpha = 1;
    };
    drawBase(); drawGlow();
    const map = new THREE.CanvasTexture(mapCv), emap = new THREE.CanvasTexture(emCv);
    map.colorSpace = emap.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = emap.anisotropy = 4;

    const W = 1, H = 1 / ratio, D = 0.022;
    const front = new THREE.MeshStandardMaterial({ map, emissiveMap: emap, emissive: 0xffffff, emissiveIntensity: 1.4, roughness: 0.4, metalness: 0.3 });
    const side = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.6, metalness: 0.3 });
    const back = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.7, metalness: 0.15 });
    const stage = new THREE.Group(), pose = new THREE.Group();
    stage.add(pose); scene.add(stage);
    const pieces = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const pw = W / cols, ph = H / rows;
      const geo = new THREE.BoxGeometry(pw * 0.998, ph * 0.998, D);
      const uv = geo.attributes.uv;
      const u0 = i / cols, v0 = 1 - (j + 1) / rows;
      for (let k = 16; k < 20; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v0 + uv.getY(k) / rows);
      uv.needsUpdate = true;
      const mesh = new THREE.Mesh(geo, [side, side, side, side, front, back]);
      const seat = new THREE.Vector3(-W / 2 + pw * (i + 0.5), H / 2 - ph * (j + 0.5), 0);
      const n = pieces.length;
      const head = seat.clone().setZ(0);
      if (head.lengthSq() < 1e-6) head.set(Math.cos(n), Math.sin(n), 0);
      head.normalize();
      const sx = Math.abs(head.x) > 0.001 ? Math.sign(head.x) : n % 2 ? 1 : -1;
      const piece = {
        mesh, seat, cell: { u0, v0, i, j },
        spread: new THREE.Vector3(sx * W * (0.5 + 0.2 * Math.abs(head.x) + 0.15 * hash(n * 37 + 2)), head.y * H * (0.6 + 0.5 * hash(n * 37 + 3)), W * 0.08 * (hash(n * 37 + 5) - 0.5)),
        spreadTurn: new THREE.Vector3(0.55 * (hash(n * 37 + 6) - 0.5) * 2, 0.7 * (hash(n * 37 + 7) - 0.5) * 2, 0.5 * (hash(n * 37 + 8) - 0.5) * 2),
        lost: n % 2 === 0,
        fly: head.clone().multiplyScalar(W * (4.5 + hash(n * 37 + 9))).setZ(W * (0.5 * (hash(n * 37 + 10) - 0.5) * 2 - 0.2)),
        flyTurn: new THREE.Vector3(2.4 * (hash(n * 37 + 11) - 0.5) * 2, 3.2 * (hash(n * 37 + 12) - 0.5) * 2, 2.4 * (hash(n * 37 + 13) - 0.5) * 2),
        entry: head.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.5 * (hash(n * 37 + 14) - 0.5) * 2).normalize().multiplyScalar(2.2 * W * (1 + 0.25 * hash(n * 37 + 15))).setZ(0.5 * W * (hash(n * 37 + 16) - 0.5) * 2),
        entrySpin: new THREE.Vector3(1.8 * (hash(n * 37 + 17) - 0.5) * 2, 1.8 * (hash(n * 37 + 18) - 0.5) * 2, 1.8 * (hash(n * 37 + 19) - 0.5) * 2),
        release: 0.7 * hash(n * 37 + 22),
        off: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Vector3(), rotVel: new THREE.Vector3(),
      };
      pose.add(mesh);
      pieces.push(piece);
    }
    // Shadow — a blurred plate beneath the card
    const sh = document.createElement("canvas");
    sh.width = 256; sh.height = 128;
    const sctx = sh.getContext("2d");
    const img = sctx.createImageData(256, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 256; x++) {
      const d = Math.hypot((x - 128) / 120, (y - 64) / 56), v = Math.round(255 * Math.exp(-d * d * 2.6) * (d < 1 ? 1 : 0));
      const o = (y * 256 + x) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = v; img.data[o + 3] = 255;
    }
    sctx.putImageData(img, 0, 0);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false, opacity: 0 });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.3, H * 0.9), shadowMat);
    shadow.position.set(0, -H * 0.62, -W * 0.35);
    shadow.renderOrder = -1;
    stage.add(shadow);

    // Section — reads the position markers in document order. If a marker has data-follow, it uses that element’s position (when several sections share one position)
    const chapters = markers.map((m) => {
      const section = m.closest(m.dataset.chapter || "[data-hold], article, section, header") || m.parentElement;
      const span = (m.dataset.span || "0,1").split(",").map(Number);
      return {
        m, section, span,
        follow: m.dataset.follow ? () => document.querySelector(m.dataset.follow) : () => m,
        pose: parse(m.dataset.pose), via: parse(m.dataset.via), leave: parse(m.dataset.leave),
        sparkle: m.hasAttribute("data-sparkle"), glowHover: m.hasAttribute("data-hover-glow"), ride: m.hasAttribute("data-ride"),
        last: null,
      };
    });
    const holdOf = (s) => {
      const v = narrowQ.matches && s.dataset.holdNarrow !== undefined ? s.dataset.holdNarrow : s.dataset.hold;
      return Math.max(0, Number(v) || 0) / 100;
    };
    const range = (ch) => {
      const host = ch.section.parentElement?.classList.contains("pin-spacer") ? ch.section.parentElement : ch.section;
      const top = host.getBoundingClientRect().top + scrollY;
      const len = holdOf(ch.section) * innerHeight;
      return [top + len * ch.span[0], top + len * ch.span[1]];
    };
    const locate = (y) => {
      const live = chapters.filter((c) => c.m.isConnected);
      if (!live.length) return null;
      let prevEnd = 0;
      for (let n = 0; n < live.length; n++) {
        const [s, e] = range(live[n]);
        if (y <= e) {
          if (n === 0 || y >= s) return { from: live[n], to: live[n], t: 0 };
          return { from: live[n - 1], to: live[n], t: s > prevEnd ? clamp01((y - prevEnd) / (s - prevEnd)) : 1 };
        }
        prevEnd = e;
      }
      const l = live[live.length - 1];
      return { from: l, to: l, t: 0 };
    };
    const rectOf = (ch) => {
      const t = ch.follow();
      if (t) {
        const b = t.getBoundingClientRect();
        if (b.width >= 1) { ch.last = { x: b.left + b.width / 2, y: b.top + b.height / 2 + scrollY, w: b.width }; return { x: ch.last.x, y: ch.last.y - scrollY, w: b.width }; }
      }
      return ch.last ? { x: ch.last.x, y: ch.last.y - scrollY, w: ch.last.w } : null;
    };

    let vw = 0, vh = 0;
    const resize = () => {
      vw = innerWidth; vh = innerHeight;
      renderer.setSize(vw, vh, false);
      canvas.style.width = vw + "px"; canvas.style.height = vh + "px";
      camera.aspect = vw / vh;
      camera.position.set(0, 0, (vh / 2) / Math.tan((camera.fov * Math.PI) / 360));
      camera.near = 1; camera.far = camera.position.z * 4;
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener("resize", resize);
    try { renderer.compile(scene, camera); } catch {}

    const cur = { tilt: 0, turn: 0, spin: 0, spread: 0, gone: 0, shadow: 0 };
    const ptr = { x: 0, y: 0, ex: 0, ey: 0, on: false, cx: 0, cy: 0 };
    const onMove = (e) => { if (e.pointerType !== "mouse") return; ptr.x = e.clientX / vw * 2 - 1; ptr.y = e.clientY / vh * 2 - 1; ptr.cx = e.clientX; ptr.cy = e.clientY; ptr.on = true; };
    const onLeave = () => { ptr.x = 0; ptr.y = 0; ptr.on = false; };
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

    const flyIn = desktop && !reduce && options.fly !== "off";
    let playAt = flyIn && options.wait === "on" ? null : 0;
    const onPlay = () => { if (playAt === null) playAt = clock; };
    el.addEventListener("fx:play", onPlay);
    if (flyIn) pieces.forEach((p) => { p.off.copy(p.entry); p.rot.copy(p.entrySpin); });
    const K = 30, C = 2 * Math.sqrt(30);
    let clock = 0, last = performance.now(), raf = 0, drawnOff = false, spawn = 0;
    const tmp = new THREE.Vector3();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now; clock += dt;
      const nextAccent = color("--fx-card-accent", "") || color("--kf-accent", accent);
      if (nextAccent !== accent) { accent = nextAccent; drawBase(); map.needsUpdate = true; }
      const at = locate(scrollY);
      if (!at) { renderer.clear(); return; }
      let { from, to, t } = at;
      if (reduce && from !== to) { if (t < 0.5) to = from; else from = to; t = 0; }
      const a = rectOf(from), b = from === to ? a : rectOf(to);
      let r = a && b ? { x: a.x + (b.x - a.x) * smooth(t), y: a.y + (b.y - a.y) * smooth(t), w: a.w + (b.w - a.w) * smooth(t) } : a || b;
      if (a && b && from !== to && to.ride && !reduce) r = t < 0.5 ? a : b;
      const k = smooth(t);
      for (const key of KEYS) { const p0 = from.pose[key] ?? 0, p1 = to.pose[key] ?? 0; cur[key] = p0 + (p1 - p0) * k; }
      if (from !== to && !reduce) {
        const s = Math.sin(Math.PI * t);
        cur.tilt += (to.via.tilt ?? 0) * s; cur.turn += (to.via.turn ?? 0) * s; cur.spin += (to.via.spin ?? 0) * s;
        cur.spread += (from.leave.spread ?? 0) * s;
      }
      if (!r) { renderer.clear(); return; }
      if (r.y + r.w < -40 || r.y - r.w > vh + 40) { if (!drawnOff) { renderer.clear(); drawnOff = true; } return; }
      drawnOff = false;

      ptr.ex += (ptr.x - ptr.ex) * (1 - Math.exp(-3.5 * dt));
      ptr.ey += (ptr.y - ptr.ey) * (1 - Math.exp(-3.5 * dt));
      stage.position.set(r.x - vw / 2, -(r.y - vh / 2), 0);
      stage.scale.setScalar(r.w);
      pose.rotation.set(cur.tilt + (desktop ? ptr.ey * 0.15 : 0), cur.spin + (desktop ? ptr.ex * 0.2 : 0), cur.turn, "YXZ");
      shadowMat.opacity = clamp01(cur.shadow) * 0.38;
      // Light reflection — like the original, the main light follows the cursor so the bright band on the card face moves (follow τ ≈ .29s)
      if (desktop) {
        key.position.set(-0.6 + ptr.ex * 1.8, 1 - ptr.ey * 1.6, 1.4);
        spot.position.set(ptr.ex * vw / 2, -ptr.ey * vh / 2, r.w * 0.35);
        spot.intensity = ptr.on ? 1.6 : 0;
      }
      shadow.position.x = -ptr.ex * 0.05;

      const go = playAt !== null;
      pieces.forEach((p) => {
        if (flyIn) {
          if (go && clock - playAt >= p.release) {
            p.vel.addScaledVector(p.off, -K * dt).addScaledVector(p.vel, -C * dt); p.off.addScaledVector(p.vel, dt);
            p.rotVel.addScaledVector(p.rot, -K * dt).addScaledVector(p.rotVel, -C * dt); p.rot.addScaledVector(p.rotVel, dt);
          }
        }
        const lost = p.lost ? cur.gone : 0;
        tmp.copy(p.seat).addScaledVector(p.spread, cur.spread).addScaledVector(p.fly, lost).add(p.off);
        p.mesh.position.copy(tmp);
        p.mesh.rotation.set(p.spreadTurn.x * cur.spread + p.flyTurn.x * lost + p.rot.x, p.spreadTurn.y * cur.spread + p.flyTurn.y * lost + p.rot.y, p.spreadTurn.z * cur.spread + p.flyTurn.z * lost + p.rot.z);
        p.mesh.visible = lost < 0.98;
      });

      // Cell light — on the first section the cell under the cursor is 1 · neighbors .3, on the sparkle section 5 cells per second for .9s
      want.fill(0);
      if (from === to && from.glowHover && desktop && ptr.on && !reduce) {
        stage.updateMatrixWorld();
        ndc.set(ptr.x, -ptr.y);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(pieces.map((p) => p.mesh), false)[0];
        if (hit && hit.uv) {
          const u = hit.uv.x * TW, v = (1 - hit.uv.y) * TH;
          const c = Math.floor((u - cellX0) / cell), rr = Math.floor((v - cellY0) / cell);
          if (c >= 0 && c < cellCols && rr >= 0 && rr < cellRows) {
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const cc = c + dx, ry = rr + dy;
              if (cc < 0 || cc >= cellCols || ry < 0 || ry >= cellRows) continue;
              want[ry * cellCols + cc] = dx || dy ? 0.3 : 1;
            }
          }
        }
      }
      const sparkleOn = !reduce && (from === to ? from.sparkle : (k < 0.15 ? from.sparkle : k > 0.85 ? to.sparkle : false));
      if (sparkleOn) for (spawn += dt * 5; spawn >= 1; spawn--) spark[Math.floor(Math.random() * base)] = 1;
      let dirty = false;
      const up = 1 - Math.exp(-18 * dt), down = 1 - Math.exp(-2.4 * dt);
      for (let i = 0; i < base; i++) {
        const before = glow[i] + spark[i];
        glow[i] += (want[i] - glow[i]) * (want[i] > glow[i] ? up : down);
        if (glow[i] < 0.004) glow[i] = 0;
        spark[i] = Math.max(0, spark[i] - dt / 0.9);
        if (Math.abs(glow[i] + spark[i] - before) > 0.002) dirty = true;
      }
      if (dirty) { drawGlow(); emap.needsUpdate = true; }
      renderer.render(scene, camera);
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);
    start();

    return () => {
      stop();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", vis);
      el.removeEventListener("fx:play", onPlay);
      pieces.forEach((p) => p.mesh.geometry.dispose());
      [front, side, back, shadowMat].forEach((m) => m.dispose());
      map.dispose(); emap.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
