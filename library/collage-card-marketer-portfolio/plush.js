// Right-side envelope doll sticker: a convex envelope doll drawn in three rises from the screen bottom after the Hero, looks around, flips and jumps into place,
// Hops each time the section below changes, and when landing on an accent background it flips in the air into the opposite skin (cream body, accent heart).
// Pressing it slips into the mailbox slot and back out. Original values: camera fov 24, distance 11, tilt yaw −.34, pitch .12, roll .03,
// Hop .72s (press .14 · jump .72 · landing), enter 1.94s, exit .55s, flip .6s, x 40 · y 28px toward the pointer, wobbles after 3s idle, gap insert 2.16s.
(() => {
  if (!window.THREE) return;
  const T = THREE, TAU = Math.PI * 2;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const backOut = (e) => 1 + 2.70158 * (e - 1) ** 3 + 1.70158 * (e - 1) ** 2;
  const inOut = (e) => (e < .5 ? 4 * e * e * e : 1 - (-2 * e + 2) ** 3 / 2);
  const spring = (x, v, to, k, damp, dt) => { v += (-k * (x - to) - damp * v) * dt; return [x + v * dt, v]; };
  const vpScale = () => Math.min(1.5, Math.max(1, .4 + .6 * innerWidth / 1440));

  // Paints skin variables on a canvas and reads sRGB — skins written in color-mix or oklch are received as the same value
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssRGB = (name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = v || "transparent"; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]];
  };
  const toColor = ([r, g, b]) => new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  const lift = ([r, g, b], k) => [r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k];

  // Envelope outline: a rounded rectangle 3.5 wide · 2.44 tall · .5 corners. The convex face attaches at 0 at the edge and swells to .44 toward the center.
  const HW = 1.75, HH = 1.22, CR = .5, PUFF = .44, SOFT = .4;
  const sdf = (x, y) => { const qx = Math.abs(x) - (HW - CR), qy = Math.abs(y) - (HH - CR); return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - CR; };
  const surf = (x, y) => PUFF * (1 - Math.exp(-Math.max(0, -sdf(x, y)) / SOFT)) ** .7;
  // Front cover seam: a V descending from the two top corners to the bottom center (0, −.18) and short lines to the two bottom corners, slightly darkened.
  const segD = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
  const seam = (x, y, front) => {
    if (!front) return 1 - .18 * Math.exp(-((x / .045) ** 2)) * (Math.abs(y) < HH - .25);
    const d = Math.min(segD(x, y, -HW + .3, HH - .3, 0, -.18), segD(x, y, HW - .3, HH - .3, 0, -.18), segD(x, y, -HW + .35, -HH + .35, -.55, -.5), segD(x, y, HW - .35, -HH + .35, .55, -.5));
    return 1 - .2 * Math.exp(-((d / .05) ** 2));
  };

  const RINGS = 44, SEGS = 180;
  const rim = (() => {
    const pts = [];
    for (let i = 0; i < SEGS; i++) {
      const a = i / SEGS * TAU, c = Math.cos(a), s = Math.sin(a);
      let lo = 0, hi = 3;
      for (let k = 0; k < 28; k++) { const m = (lo + hi) / 2; sdf(c * m, s * m) < 0 ? (lo = m) : (hi = m); }
      pts.push([c * lo, s * lo]);
    }
    return pts;
  })();
  const shell = (side) => {
    const pos = [], nor = [], col = [], idx = [], e = .002;
    const put = (x, y) => {
      const z = surf(x, y) * side;
      const n = new T.Vector3(-(surf(x + e, y) - surf(x - e, y)) / (2 * e) * side, -(surf(x, y + e) - surf(x, y - e)) / (2 * e) * side, 1).normalize().multiplyScalar(side);
      pos.push(x, y, z); nor.push(n.x, n.y, n.z);
      const k = seam(x, y, side > 0); col.push(k, k, k);
    };
    put(0, 0);
    for (let r = 1; r <= RINGS; r++) { const f = 1 - (1 - r / RINGS) ** 1.6; for (const [x, y] of rim) put(x * f, y * f); }
    const at = (r, s) => (r === 0 ? 0 : 1 + (r - 1) * SEGS + (s % SEGS));
    const tri = (a, b, c) => (side > 0 ? idx.push(a, b, c) : idx.push(a, c, b));
    for (let s = 0; s < SEGS; s++) tri(at(0, 0), at(1, s), at(1, s + 1));
    for (let r = 1; r < RINGS; r++) for (let s = 0; s < SEGS; s++) { const a = at(r, s), b = at(r, s + 1), c = at(r + 1, s), d = at(r + 1, s + 1); tri(a, c, b); tri(b, c, d); }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  };
  const heartGeo = () => {
    const s = new T.Shape(), k = .23;
    s.moveTo(0, -.9 * k);
    s.bezierCurveTo(-.35 * k, -.6 * k, -1.05 * k, -.15 * k, -1 * k, .35 * k);
    s.bezierCurveTo(-.95 * k, .85 * k, -.3 * k, 1 * k, 0, .5 * k);
    s.bezierCurveTo(.3 * k, 1 * k, .95 * k, .85 * k, 1 * k, .35 * k);
    s.bezierCurveTo(1.05 * k, -.15 * k, .35 * k, -.6 * k, 0, -.9 * k);
    const g = new T.ExtrudeGeometry(s, { depth: .02, bevelEnabled: true, bevelThickness: .12, bevelSize: .09, bevelSegments: 14, curveSegments: 40 });
    g.translate(0, 0, -.01); g.computeVertexNormals();
    return g;
  };
  let geoCache = null;
  const geos = () => (geoCache ??= { front: shell(1), back: shell(-1), heart: heartGeo() });

  const plush = (skin) => {
    const g = new T.Group(), G = geos();
    const body = new T.MeshPhysicalMaterial({ color: toColor(skin.body), roughness: .66, vertexColors: true, sheen: 1, sheenRoughness: .42, sheenColor: toColor(skin.sheen) });
    const heart = new T.MeshPhysicalMaterial({ color: toColor(skin.heart), roughness: .36, clearcoat: .45, clearcoatRoughness: .4, sheen: .6, sheenColor: toColor(skin.heartSheen) });
    for (const geo of [G.front, G.back]) { const m = new T.Mesh(geo, body); m.receiveShadow = true; g.add(m); }
    const h = new T.Mesh(G.heart, heart);
    h.position.set(0, -.08, surf(0, -.08) + .06); h.castShadow = true; h.receiveShadow = true;
    g.add(h);
    return g;
  };

  const studio = (canvas) => {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.toneMapping = T.NeutralToneMapping;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.VSMShadowMap;
    const scene = new T.Scene();
    // Not skin: studio reflector lighting the doll — three white panels and a warm floor panel in a gray room (light strength and position are original values)
    const room = new T.Scene(), pm = new T.PMREMGenerator(renderer);
    room.background = new T.Color(0x8a8784); // Not skin: studio room wall
    const panel = (w, h, x, y, z, k, c = 0xffffff) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); room.add(m); };
    panel(8, 6, -4, 6, 6, 3.2); panel(5, 8, 7, 1, 2, 1.6); panel(10, 3, 0, 8, -2, 1.4); panel(12, 12, 0, -7, 2, .9, 0xf7e7da); // Not skin: reflector light
    const env = pm.fromScene(room, .04).texture;
    pm.dispose(); room.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
    scene.environment = env; scene.environmentIntensity = .9;
    const key = new T.DirectionalLight(0xffffff, 1.5); // Not skin: white daylight
    key.position.set(-2.4, 4.2, 5); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -5e-4; key.shadow.normalBias = .025; key.shadow.radius = 14; key.shadow.blurSamples = 24;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .5, far: 14 });
    scene.add(key);
    const fill = new T.DirectionalLight(0xfff4ec, .8); // Not clothing: warm backlight
    fill.position.set(4, 1.2, -2.5); scene.add(fill);
    const cam = new T.PerspectiveCamera(24, 1, .1, 50); cam.position.set(0, 0, 11);
    const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return false; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); return true; };
    return { renderer, scene, cam, fit };
  };

  // Two sets stuck back to back: front (accent body · background heart) and back (background body · accent heart), and flip 0→1 turns half a revolution so the back set comes to the front
  const rig = (canvas) => {
    const { renderer, scene, cam, fit } = studio(canvas);
    const acc = cssRGB("--kf-accent"), bg = cssRGB("--kf-bg");
    const red = { body: acc, sheen: lift(acc, .62), heart: bg, heartSheen: lift(bg, 1) };
    const cream = { body: bg, sheen: lift(bg, 1), heart: acc, heartSheen: lift(acc, .62) };
    const outer = new T.Group(), inner = new T.Group();
    outer.position.y = -.45; inner.position.y = .45; outer.add(inner); scene.add(outer);
    const a = plush(red), b = plush(cream), back = new T.Group();
    a.rotation.set(.12, -.34, .03); b.rotation.set(.12, -.34, .03);
    back.rotation.y = Math.PI; back.add(b); inner.add(a, back);
    fit();
    const ro = new ResizeObserver(fit); ro.observe(canvas);
    return {
      set({ rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, flip = 0 }) {
        outer.rotation.set(rx, ry, rz); outer.scale.set(sx, sy, sx); inner.rotation.y = flip * Math.PI;
        const front = Math.cos(flip * Math.PI) >= 0; a.visible = front; b.visible = !front;
      },
      render: () => renderer.render(scene, cam),
    };
  };

  const init = () => {
    const btn = document.querySelector(".wr-sticker"), slot = document.querySelector(".wr-sticker-slot");
    if (!btn || !slot) return;
    const canvas = btn.querySelector("canvas");
    // Build the scene the first time it is seen — baking surfaces and reflectors right on open blocks the main thread and delays the head entrance and interaction response (the original also builds the rig when visible).
    let r3 = null;
    const ensure = () => { if (r3 === null) { try { r3 = rig(canvas); } catch { r3 = false; } } return r3; };
    const top = document.querySelector("main > section"), foot = document.querySelector(".wr-footer");
    const content = document.getElementById("smooth-content");
    const acc = cssRGB("--kf-accent"), bgc = cssRGB("--kf-bg");
    let A = 0, W = 0, H = 0;
    const size = () => {
      A = (innerWidth >= 810 ? 84 : 64) * vpScale(); W = A / .61; H = .8 * W;
      Object.assign(btn.style, { width: `${W}px`, height: `${H}px` });
      Object.assign(slot.style, { width: `${1.08 * A}px`, height: `${Math.max(5, .05 * A)}px` });
    };
    size();
    const scrollY = () => (WR.smoother ? WR.smoother.scrollTop() : window.scrollY);
    // Painted background right below: skips the doll, head, cursor and loading strip
    const under = (x, y) => {
      for (const el of document.elementsFromPoint(x, y)) {
        if (btn.contains(el) || el.closest(".wr-header, .wr-cursor, .wr-pre, .wr-sticker-slot")) continue;
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (m?.length >= 3 && (m.length === 3 || m[3] > .8)) return m;
      }
      return bgc;
    };
    const onAccent = (c) => Math.hypot(c[0] - acc[0], c[1] - acc[1], c[2] - acc[2]) < 90;
    const sections = () => [...content.children].flatMap((c) => (c.tagName === "MAIN" ? [...c.children] : [c])).filter((el) => el.offsetHeight > 40);
    const sectionAt = (y) => sections().findIndex((el) => { const b = el.getBoundingClientRect(); return b.top <= y && b.bottom > y; });

    const s = { t: 0, last: performance.now(), sy: scrollY(), vel: 0, still: 0, appear: 0, hopT: -1, section: -1, hopFlip: null, introT: -1, exitT: -1, introTarget: 0,
      flip: 0, flipFrom: 0, flipTo: 0, flipT: 1, inverted: false, wigT: 9, tiltX: 0, tiltY: 0, tiltXV: 0, tiltYV: 0, ptr: null, fx: 0, fy: 0, fxV: 0, fyV: 0,
      cuteT: 9, nextCute: 3, postT: -1, postAt: [0, 0], lastX: 0, lastY: 0, frame: 0, visible: false };
    const wiggle = () => { if (!reduced) s.wigT = 0; };
    const endPost = () => { s.postT = -1; btn.style.clipPath = ""; slot.style.opacity = "0"; };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, Math.max(0, (now - s.last) / 1000)); s.last = now; s.t += dt;
      const y = scrollY(), dy = y - s.sy; s.sy = y;
      s.vel += ((dt ? dy / dt : 0) - s.vel) * Math.min(1, 10 * dt);
      s.still = Math.abs(dy) > .5 ? 0 : s.still + dt;
      const show = WR.ready && !document.body.classList.contains("menu-open") && (!top || top.getBoundingClientRect().bottom < .25 * innerHeight) && !(foot && foot.getBoundingClientRect().top < innerHeight);
      const hop = !reduced;
      if (show !== s.visible) {
        if (s.postT >= 0) endPost();
        s.visible = show; btn.dataset.visible = String(show); btn.inert = !show;
        if (hop) { s.introT = show ? 0 : -1; s.exitT = show ? -1 : 0; s.hopT = -1; s.hopFlip = null; } else if (show) wiggle();
      }
      s.appear = hop ? (show || s.exitT >= 0 ? 1 : 0) : +show;
      if (s.appear < .01 && !show) { btn.style.transform = "translate3d(-999px,0,0)"; return; }
      const vp = vpScale(), X0 = innerWidth - A / 2 - 28 * vp, Y0 = .64 * innerHeight, OFF = innerHeight + .6 * H, live = reduced ? 0 : 1;
      let x = X0, yy = Y0 + 5 * live * vp * Math.sin(s.t * TAU / 3.6), rx = 0, ry = 0, rz = 0, sx = 1, sy = 1;
      const sec = sectionAt(yy);
      if (sec !== s.section) {
        const busy = s.introT >= 0 || s.exitT >= 0 || s.postT >= 0;
        if (s.section !== -1 && sec !== -1 && hop && s.hopT < 0 && !busy) s.hopT = 0;
        s.section = sec;
      }
      if (s.hopT >= 0) {
        const p = s.hopT / .72;
        if (p < .14) sy = 1 - .16 * Math.sin(Math.PI * p / .14);
        else if (p < .86) {
          const q = (p - .14) / .72;
          yy -= .7 * H * Math.sin(Math.PI * q); sy = 1 + .12 * Math.cos(Math.PI * q) * (q < .5 ? 1 : .4); rz = -.25 * Math.sin(TAU * q);
          if (s.hopFlip) s.flip = s.hopFlip[0] + (s.hopFlip[1] - s.hopFlip[0]) * inOut(q);
        } else if (s.hopFlip) { s.flip = s.hopFlip[1]; s.hopFlip = null; s.flipT = 1; s.flipTo = s.flip; }
        if (p >= .86 && s.hopT - dt < .6192) wiggle();
        sx = 1 / Math.sqrt(sy); s.hopT += dt; if (s.hopT > .72) s.hopT = -1;
      }
      if (s.introT >= 0) {
        const e = s.introT, ty = innerHeight - .32 * A, x1 = X0 + .12 * A, ty2 = ty + 10 * vp;
        x = x1; rx = 0; ry = 0; rz = 0; sx = 1; sy = 1;
        if (e < .42) { yy = OFF + (ty - OFF) * backOut(e / .42); s.flip = 0; }
        else if (e < 1.06) { const q = (e - .42) / .64; yy = ty - 4 * vp * Math.sin(Math.PI * q); rz = .2 * Math.sin(TAU * q); ry = -.4 * Math.sin(TAU * q); }
        else if (e < 1.22) { const q = (e - 1.06) / .16; yy = ty + (ty2 - ty) * (1 - (1 - q) ** 2); sy = 1 - .18 * q; s.introTarget = +onAccent(under(X0, Y0 + .1 * A)); }
        else if (e < 1.94) { const q = (e - 1.22) / .72; x = x1 + (X0 - x1) * q; yy = ty2 + (Y0 - ty2) * q - .2 * innerHeight * Math.sin(Math.PI * q); sy = 1 + .16 * Math.cos(Math.PI * q) * (q < .5 ? 1 : .45); rz = -.18 * Math.sin(TAU * q); s.flip = (2 + s.introTarget) * inOut(q); }
        else { x = X0; yy = Y0; s.flip = s.introTarget; s.flipTo = s.flip; s.flipT = 1; s.inverted = s.introTarget === 1; s.section = sectionAt(yy); s.introT = -1; wiggle(); }
        sx = 1 / Math.sqrt(sy); if (s.introT >= 0) s.introT += dt;
      } else if (s.exitT >= 0) {
        const e = s.exitT / .55; rx = 0; ry = 0; sx = 1; sy = 1; rz = 0;
        if (e < .32) { const q = e / .32; yy = Y0 - 36 * vp * Math.sin(Math.PI * q); sy = 1 + .1 * Math.sin(Math.PI * q); }
        else { const q = (e - .32) / .68; yy = Y0 + (OFF - Y0) * q * q; rz = .55 * q; sy = 1 + .12 * q; }
        sx = 1 / Math.sqrt(sy); s.exitT += dt; if (e >= 1) { s.exitT = -1; s.appear = 0; }
      }
      const busy = s.introT >= 0 || s.exitT >= 0 || s.postT >= 0;
      if (!busy && ++s.frame % 6 === 0) {
        const red = onAccent(under(clamp(x, 2, innerWidth - 2), yy + .1 * A));
        if (red !== s.inverted) {
          s.inverted = red;
          if (!hop) { s.flipFrom = s.flip; s.flipTo = +red; s.flipT = 1; s.flip = s.flipTo; }
          else { s.hopFlip = [s.flip, +red]; if (s.hopT < 0) s.hopT = 0; }
        }
      }
      if (s.flipT < 1 && !s.hopFlip) {
        s.flipT = Math.min(1, s.flipT + dt / .6); s.flip = s.flipFrom + (s.flipTo - s.flipFrom) * inOut(s.flipT);
        const k = Math.sin(Math.PI * s.flipT); sy *= 1 + .06 * k; yy -= 10 * vp * k;
      }
      let gx = 0, gy = 0;
      if (s.ptr && !busy && !reduced) { const dx = s.ptr[0] - x, dy2 = s.ptr[1] - yy, r = 220 * vp; gx = dx / (Math.abs(dx) + r); gy = dy2 / (Math.abs(dy2) + r); }
      [s.fx, s.fxV] = spring(s.fx, s.fxV, gx, 60, 11, dt); [s.fy, s.fyV] = spring(s.fy, s.fyV, gy, 60, 11, dt);
      x += 40 * s.fx * vp; yy += 28 * s.fy * vp; rz -= .08 * s.fx;
      if (!busy && !reduced && s.hopT < 0 && s.still > s.nextCute) { s.cuteT = 0; s.nextCute = s.still + 4.5; }
      if (s.cuteT < 1.3) {
        const e = s.cuteT; let k = 1;
        if (e < .12) k = 1 - .12 * Math.sin(Math.PI / 2 * e / .12);
        else if (e < .42) { const q = (e - .12) / .3; yy -= 16 * vp * Math.sin(Math.PI * q); k = 1 + .1 * Math.cos(Math.PI * q) * (q < .5); ry += .35 * Math.sin(Math.PI * q); }
        else { const q = e - .42; rz += .16 * Math.exp(-3.6 * q) * Math.sin(5 * TAU * q); k = 1 - .1 * Math.exp(-10 * q); }
        sy *= k; sx *= 1 / Math.sqrt(k); s.cuteT += dt;
      }
      if (s.wigT < 1.1) {
        const e = s.wigT, d = Math.exp(-4.2 * e), w = 4.2 * TAU * e;
        rz += .2 * d * Math.sin(w); ry += .12 * d * Math.sin(w + .9);
        const k = 1 - .11 * Math.exp(-8 * e) * Math.cos(3 * TAU * e); sy *= k; sx *= 1 / Math.sqrt(k); s.wigT += dt;
      }
      [s.tiltX, s.tiltXV] = spring(s.tiltX, s.tiltXV, .35 * gy, 90, 12, dt); [s.tiltY, s.tiltYV] = spring(s.tiltY, s.tiltYV, .5 * gx, 90, 12, dt);
      rx += s.tiltX; ry += s.tiltY;
      if (s.postT >= 0) {
        const t = s.postT, [px, py] = s.postAt, slotY = py + .62 * A, out2 = (e) => 1 - (1 - e) ** 2;
        let off = 0, k = 1, tip = -1.2;
        if (t < .12) { k = 1 - .15 * Math.sin(Math.PI / 2 * t / .12); tip = 0; }
        else if (t < .42) { const e = (t - .12) / .3; off = -.45 * A * out2(e); k = .85 + .25 * out2(e); tip = -1.2 * inOut(e); }
        else if (t < .76) { const e = (t - .42) / .34; off = -.45 * A + 1.75 * A * e * e; k = 1.1 - .1 * e; }
        else if (t < 1.46) off = 1.3 * A;
        else if (t < 1.86) { const e = (t - 1.46) / .4; off = 1.3 * A - 1.6 * A * out2(e); tip = -1.2 * (1 - backOut(Math.min(1, 1.15 * e))); }
        else if (t < 2.16) { const e = (t - 1.86) / .3; off = -.3 * A * (1 - e * e); tip = 0; }
        else { endPost(); wiggle(); }
        if (s.postT >= 0) {
          x = px; yy = py + off; rx = tip; ry = 0; rz = 0; sy = k; sx = 1 / Math.sqrt(k);
          const cut = yy + H / 2 - slotY;
          btn.style.clipPath = cut > 0 ? `inset(0 0 ${cut}px 0)` : "";
          const open = t < .2 ? backOut(t / .2) : t > 1.95 ? Math.max(0, 1 - ((t - 1.95) / .22) ** 2) : 1;
          const gulp = 1 + 1.6 * Math.exp(-(((t - .72) / .05) ** 2)) + 1.2 * Math.exp(-(((t - 1.5) / .05) ** 2));
          slot.style.transform = `translate3d(${px - .54 * A}px, ${slotY - slot.offsetHeight / 2}px, 0) scale(${Math.max(.001, open)}, ${gulp})`;
          slot.style.opacity = "1";
          s.postT += dt;
        }
      }
      s.lastX = x; s.lastY = yy;
      btn.style.transform = `translate3d(${x - W / 2}px, ${yy - H / 2}px, 0) scale(${s.appear})`;
      const r = ensure();
      if (r) { r.set({ rx, ry, rz, sx, sy, flip: s.flip }); r.render(); }
    };
    btn.addEventListener("click", () => {
      if (reduced || !s.visible || s.postT >= 0 || s.introT >= 0 || s.exitT >= 0) return;
      s.postT = 0; s.postAt = [s.lastX, s.lastY]; s.wigT = 9; s.cuteT = 9;
    });
    const rest = () => { s.still = 0; s.nextCute = 3; };
    addEventListener("pointermove", (e) => { rest(); if (e.pointerType !== "touch") s.ptr = [e.clientX, e.clientY]; }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => (s.ptr = null));
    for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"]) addEventListener(ev, rest, { passive: true });
    addEventListener("resize", size);
    let raf = 0;
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) { s.last = performance.now(); raf = requestAnimationFrame(frame); } });
    raf = requestAnimationFrame(frame);
  };
  WR.whenReady(init);
})();
