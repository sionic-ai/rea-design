(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  // Work data — placeholders. en is the English client (Latin title typeface slot), jp is the work title
  const WORKS = [
    { en: "CLIENT NAME", jp: "Your work title one here", cat: "ENTERTAINMENT", d: "MONTH 0000", c: "UI/UX, WEB DEVELOPMENT", label: "Idol group photo · pastel outfits · portrait" },
    { en: "BRAND NAME", jp: "Your work title two", cat: "ENTERTAINMENT", d: "MONTH 0000", c: "UI/UX, WEB DEVELOPMENT", label: "Night market neon sign · Pink glow · Portrait" },
    { en: "EVENT NAME", jp: "Your work title three", cat: "ENTERTAINMENT", d: "MONTH 0000", c: "UI/UX, WEB DEVELOPMENT", label: "Bold character lettering · primary colors · portrait" },
    { en: "FESTIVAL NAME", jp: "Your work title four", cat: "ENTERTAINMENT", d: "MONTH 0000", c: "UI/UX, WEB DEVELOPMENT", label: "Festival poster · sky-blue background · portrait" },
    { en: "SPORTS BRAND", jp: "Your work title five here", cat: "BRANDING", d: "0000", c: "UI/UX, WEB DEVELOPMENT", label: "Badminton player · blue background · portrait" },
    { en: "MAKER NAME", jp: "Your work title six here", cat: "FOOD & BEVERAGE", d: "0000", c: "UI/UX, WEB DEVELOPMENT", label: "White home appliance · white background · portrait" },
    { en: "CAR MAKER", jp: "Your work title seven here", cat: "AUTOMOTIVE", d: "0000", c: "MOVIE, ART DIRECTION", label: "Off-road car · sunset · portrait" },
    { en: "COSME BRAND", jp: "Your work title eight here", cat: "COSMETICS", d: "0000", c: "CREATIVE DIRECTION", label: "Cosmetic bottle · soft light · portrait" },
  ];
  const N = WORKS.length;
  const pad = (n) => String(n).padStart(2, "0");

  // Skin value → sRGB that the canvas reads
  const solid = (css) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    probe.style.color = css;
    document.body.append(probe);
    const got = getComputedStyle(probe).color;
    probe.remove();
    return got;
  };
  // Photo slot — two color bands with only the hue rotated from the accent + diagonal + label (portrait 496:734)
  const paint = (i, label) => {
    const c = document.createElement("canvas");
    c.width = 496; c.height = 734;
    const g = c.getContext("2d");
    const grd = g.createLinearGradient(0, 0, 496, 734);
    grd.addColorStop(0, solid(`oklch(from var(--kf-accent) 0.72 0.12 calc(h + ${i * 47}))`));
    grd.addColorStop(1, solid(`oklch(from var(--kf-accent) 0.4 0.1 calc(h + ${i * 47 + 120}))`));
    g.fillStyle = grd;
    g.fillRect(0, 0, 496, 734);
    const ink = solid("oklch(from var(--kf-ink) 1 0 0)");
    // A fine grid instead of photo grain — so distortion shows when the panel swells and bends (a smooth band looks the same even when bent)
    g.globalAlpha = 0.16;
    g.strokeStyle = ink;
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 12; x < 496; x += 24) { g.moveTo(x, 0); g.lineTo(x, 734); }
    for (let y = 12; y < 734; y += 24) { g.moveTo(0, y); g.lineTo(496, y); }
    g.stroke();
    // Fine grain — each cell needs its own brightness, like a photo, for the warp and bulge to show on screen
    const dark = solid("var(--kf-contrast-bg)");
    for (let k = 0; k < 9000; k++) {
      g.globalAlpha = 0.12 + Math.random() * 0.22;
      g.fillStyle = Math.random() < 0.5 ? ink : dark;
      g.fillRect(Math.random() * 496, Math.random() * 734, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    g.globalAlpha = 0.35;
    g.strokeStyle = ink;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(496, 734); g.moveTo(496, 0); g.lineTo(0, 734); g.stroke();
    g.globalAlpha = 0.9;
    g.fillStyle = ink;
    g.font = `500 15px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono").trim()}`;
    g.textAlign = "center";
    g.fillText(label, 248, 372);
    return c;
  };

  const cv = $("[data-wk-gl]");
  const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });

  // Card plane cut into 36×44 pieces and bent — the faster it is flicked (speed ×5, max 1), the more it bulges forward like a cylinder by 70 horizontal·30 vertical, with a wave pulled 16 toward progress.
  // The panel itself flips 90° per cell and travels a horizontal-axis ring (one cell 360°/7). Camera 800 ahead, 1 = 1px
  const VS = `
    attribute vec2 aPos; attribute vec2 aUv;
    uniform vec2 uSize; uniform float uRing, uR, uDist, uRot, uVel, uHover, uFlipU; uniform mat4 uProj; uniform vec2 uUvScale, uUvOff;
    varying vec2 vUv; varying float vShade; varying vec2 vLoc;
    void main() {
      vec3 p = vec3(aPos * uSize, 0.0);
      vLoc = aPos * uSize;
      float bx = aPos.x * 2.0, by = aPos.y * 2.0;
      float speed = clamp(abs(uVel) * 5.0, 0.0, 1.0);
      p.z += (1.0 - bx * bx) * 70.0 * speed + (1.0 - by * by) * 30.0 * speed;
      p.y += sin(bx * 3.14159) * 16.0 * clamp(uVel * 5.0, -1.0, 1.0);
      p.z += (1.0 - bx * bx) * (1.0 - by * by) * 40.0 * uHover;
      p.xy *= 1.0 + 0.02 * uHover;
      float c = cos(uRot), s = sin(uRot);
      vec3 r = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
      r.z += uR;
      float cr = cos(uRing), sr = sin(uRing);
      vec3 w = vec3(r.x, r.y * cr - r.z * sr, r.y * sr + r.z * cr);
      w.z -= uDist + uR;
      vShade = 0.72 + 0.28 * abs(cos(uRot)) - 0.06 * speed * abs(bx);
      vec2 uv = aUv;
      uv.x = mix(uv.x, 1.0 - uv.x, uFlipU);
      vUv = uv * uUvScale + uUvOff;
      gl_Position = uProj * vec4(w, 1.0);
    }`;
  // RGB splits by ±.004 according to speed, and the 16px rounded corners are cut with a distance field
  const FS = `
    precision highp float;
    uniform sampler2D uTex; uniform float uOpa, uVel; uniform vec2 uSize;
    varying vec2 vUv; varying float vShade; varying vec2 vLoc;
    void main() {
      float split = clamp(uVel * 0.15, -0.004, 0.004);
      vec3 col = vec3(texture2D(uTex, vUv + vec2(split, 0.0)).r, texture2D(uTex, vUv).g, texture2D(uTex, vUv - vec2(split, 0.0)).b) * vShade;
      vec2 q = abs(vLoc) - (uSize * 0.5 - vec2(16.0));
      float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 16.0;
      gl_FragColor = vec4(col, uOpa * (1.0 - smoothstep(0.0, 1.5, sd)));
    }`;
  const shader = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const SEGX = 36, SEGY = 44, pos = [], uv = [], idxs = [];
  for (let y = 0; y <= SEGY; y++) for (let x = 0; x <= SEGX; x++) { pos.push(x / SEGX - 0.5, y / SEGY - 0.5); uv.push(x / SEGX, y / SEGY); }
  for (let y = 0; y < SEGY; y++) for (let x = 0; x < SEGX; x++) { const a = y * (SEGX + 1) + x, b = a + 1, c = a + SEGX + 1, d = c + 1; idxs.push(a, b, c, b, d, c); }
  const buf = (data, name, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); };
  buf(pos, "aPos", 2); buf(uv, "aUv", 2);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idxs), gl.STATIC_DRAW);
  const U = {};
  ["uSize", "uRing", "uR", "uDist", "uRot", "uVel", "uHover", "uProj", "uUvScale", "uUvOff", "uFlipU", "uTex", "uOpa"].forEach((k) => { U[k] = gl.getUniformLocation(prog, k); });
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const TEX = WORKS.map((w, i) => {
    const t = gl.createTexture(), img = paint(i, w.label);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
    return { tex: t, w: img.width, h: img.height };
  });

  const DIST = 800, STEP = (2 * Math.PI) / 7, proj = new Float32Array(16);
  let CH = 0, CW = 0, RAD = 0;
  const measure = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    CH = Math.round(innerHeight * 0.7); CW = Math.round((CH * 496) / 734);
    RAD = ((CH + innerHeight * 0.13) / Math.sin(STEP)) * 1.15;
    const f = 1 / Math.tan(Math.atan(innerHeight / 2 / DIST)), near = 1, far = 20000, nf = 1 / (near - far);
    proj.fill(0);
    proj[0] = f / (innerWidth / innerHeight); proj[5] = f; proj[10] = (far + near) * nf; proj[11] = -1; proj[14] = 2 * far * near * nf;
    gl.uniformMatrix4fv(U.uProj, false, proj);
  };

  // Screen text — when it changes, after 140ms the new text rises again from below
  const bar = $("[data-wk-bar]"), meta = $("[data-wk-meta]"), mid = $("[data-wk-mid]");
  const txt = (k) => document.querySelector(`[data-wk="${k}"]`);
  const thumbs = $("[data-wk-thumbs]"), track = thumbs.querySelector(".track");
  WORKS.forEach((w, i) => {
    const a = document.createElement("a");
    a.href = "#";
    a.innerHTML = `<span class="wf-img" data-label="${w.label}"></span>`;
    a.addEventListener("click", (e) => { e.preventDefault(); go(i); });
    track.append(a);
  });
  const tEls = [...track.children];
  let idx = 0;
  const slide = () => { const el = tEls[idx]; if (el) track.style.transform = `translateX(${thumbs.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)}px)`; };
  const fill = (w) => { txt("en").textContent = w.en; txt("jp").textContent = w.jp; txt("cat").textContent = w.cat; txt("d").textContent = w.d; txt("c").textContent = w.c; };
  fill(WORKS[0]);
  txt("cnt").textContent = `(01/${pad(N)})`;
  tEls[0].classList.add("on");

  let p = 0, pT = 0, vel = 0, hover = 0, hoverT = 0;
  const clampI = (v) => (v < 0 ? 0 : v > N - 1 ? N - 1 : v);
  const sync = () => {
    const i = clampI(Math.round(pT)) | 0;
    if (i === idx) return;
    idx = i;
    const w = WORKS[idx];
    txt("cnt").textContent = `(${pad(idx + 1)}/${pad(N)})`;
    txt("prg").style.width = ((idx / (N - 1)) * 100).toFixed(1) + "%";
    bar.classList.remove("in"); meta.classList.remove("in");
    setTimeout(() => { fill(w); requestAnimationFrame(() => { bar.classList.add("in"); meta.classList.add("in"); }); }, 140);
    tEls.forEach((t, k) => t.classList.toggle("on", k === idx));
    slide();
  };
  const go = (i) => { pT = clampI(i); sync(); };
  const step = (n) => { pT = clampI(Math.round(pT) + n); sync(); };

  let mode = "gallery", wLock = 0;
  addEventListener("wheel", (e) => {
    if (mode === "index") return;
    e.preventDefault();
    const d = e.deltaY + e.deltaX;
    if (Math.abs(d) < 2) return;
    const now = performance.now();
    if (now - wLock < 340) return;
    wLock = now;
    step(d > 0 ? 1 : -1);
  }, { passive: false });
  let dragging = false, x0 = 0, y0 = 0, p0 = 0, moved = 0;
  cv.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; x0 = e.clientX; y0 = e.clientY; p0 = pT; try { cv.setPointerCapture(e.pointerId); } catch (err) { /* Ignore grab failure */ } });
  cv.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - x0, dy = e.clientY - y0; moved = Math.max(moved, Math.hypot(dx, dy)); pT = clampI(p0 - (dx + dy) / 520); });
  const endDrag = () => { if (!dragging) return; dragging = false; pT = clampI(Math.round(pT)); sync(); };
  cv.addEventListener("pointerup", endDrag);
  cv.addEventListener("pointercancel", endDrag);
  cv.addEventListener("click", () => { if (moved < 8) (window.ikGo || ((h) => { location.href = h; }))(mid.getAttribute("href"), WORKS[idx].en); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mode === "index") { setMode("gallery"); return; }
    if (mode === "index") return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") step(1);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") step(-1);
  });

  // When the cursor is over a card, the ring grows and the panel swells
  let mx = innerWidth / 2, my = innerHeight / 2;
  const ring = document.querySelector(".ik-cur.is-ring");
  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    const inside = mode === "gallery" && Math.abs(mx - innerWidth / 2) < CW / 2 && Math.abs(my - innerHeight / 2) < CH / 2;
    hoverT = inside ? 1 : 0;
    if (ring) ring.classList.toggle("on", inside);
  }, { passive: true });

  // List view
  const list = $("[data-wk-list]"), preview = $("[data-wk-preview]"), pvimg = $("[data-wk-pvimg]"), pvlabel = $("[data-wk-pvlabel]");
  let pvOn = false;
  WORKS.forEach((w, i) => {
    const r = document.createElement("a");
    r.className = "wk-row";
    r.href = "detail.html";
    r.dataset.t = w.en;
    r.style.setProperty("--i", i);
    r.innerHTML = `<span class="no">${pad(i + 1)}</span><span class="ti"><b>${w.en}</b><em>${w.jp}</em></span><span class="ca">${w.cat}</span><span class="yr">${w.d}</span><i class="sweep"></i><span class="arw">↗</span>`;
    r.addEventListener("pointerenter", () => { pvimg.setAttribute("data-label", w.label); pvlabel.textContent = `(${pad(i + 1)}) ${w.cat}`; pvOn = true; preview.classList.add("on"); });
    list.append(r);
  });
  list.addEventListener("pointerleave", () => { pvOn = false; preview.classList.remove("on"); });
  const views = [...document.querySelectorAll("[data-wk-view]")];
  const setMode = (m) => {
    if (m === mode) return;
    mode = m;
    document.body.classList.toggle("idx", m === "index");
    views.forEach((b) => b.classList.toggle("on", b.dataset.wkView === m));
    if (m === "index") {
      const rows = [...list.children];
      rows.forEach((r) => { r.style.animation = "none"; });
      void list.offsetWidth;
      rows.forEach((r) => { r.style.animation = ""; });
      $("[data-wk-index]").scrollTop = 0;
    } else { pvOn = false; preview.classList.remove("on"); }
  };
  views.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.wkView)));
  // Touch and narrow screens can’t operate the gallery, so it starts as a list
  if (matchMedia("(hover: none)").matches || innerWidth <= 820) setMode("index");

  let pvx = innerWidth / 2, pvy = innerHeight / 2;
  const loop = () => {
    hover += (hoverT - hover) * 0.12;
    if (mode === "index") {
      const px = pvx;
      pvx += (mx + 150 - pvx) * 0.16; pvy += (my - pvy) * 0.16;
      const rz = Math.max(-10, Math.min(10, (pvx - px) * 0.14));
      preview.style.transform = `translate(${pvx - preview.offsetWidth / 2}px,${pvy - preview.offsetHeight / 2}px) scale(${pvOn ? 1 : 0.92}) rotate(${rz.toFixed(2)}deg)`;
      requestAnimationFrame(loop);
      return;
    }
    const prev = p;
    p += (pT - p) * (reduce ? 1 : 0.085);
    vel += (p - prev - vel) * 0.25;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uSize, CW, CH);
    gl.uniform1f(U.uVel, vel);
    gl.uniform1f(U.uR, RAD);
    gl.uniform1f(U.uDist, DIST);
    gl.uniform1i(U.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    const order = [];
    for (let i = 0; i < N; i++) { const dd = i - p; if (Math.abs(dd) < 3) order.push({ i, d: dd }); }
    order.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const cardAR = CW / CH;
    order.forEach((o) => {
      const t = TEX[o.i], ad = Math.abs(o.d), opa = Math.max(0, 1 - ad * 0.45);
      if (opa <= 0.002) return;
      const imgAR = t.w / t.h;
      let sx = 1, sy = 1, ox = 0, oy = 0;
      if (imgAR > cardAR) { sx = cardAR / imgAR; ox = (1 - sx) / 2; } else { sy = imgAR / cardAR; oy = (1 - sy) / 2; }
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform2f(U.uUvScale, sx, sy);
      gl.uniform2f(U.uUvOff, ox, oy);
      gl.uniform1f(U.uRing, o.d * STEP);
      const rot = Math.PI * 0.5 * o.d;
      gl.uniform1f(U.uRot, rot);
      gl.uniform1f(U.uFlipU, Math.cos(rot) < 0 ? 1 : 0);
      gl.uniform1f(U.uHover, ad < 0.5 ? hover : 0);
      gl.uniform1f(U.uOpa, opa);
      gl.drawElements(gl.TRIANGLES, idxs.length, gl.UNSIGNED_SHORT, 0);
    });
    requestAnimationFrame(loop);
  };
  measure();
  slide();
  addEventListener("resize", () => { measure(); slide(); }, { passive: true });
  requestAnimationFrame(loop);
})();
