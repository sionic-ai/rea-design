// Hero — loader (percent 36 · 72 · 100) → wordmark rising → header rising from the bottom → WebGL work rows spin two rounds and stop.
// After that, wheel, drag or arrow keys step one cell at a time (critically damped spring). The board bulges toward the center with speed, and the area around the cursor over a photo swells like a lens.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portrait = matchMedia("(orientation: portrait) and (max-width: 1024px)");
  const hero = document.querySelector(".o-hero");
  const top = hero.querySelector(".o-top");
  const bar = hero.querySelector(".o-nav__bar");
  const bottom = hero.querySelector(".o-bottom");
  const letters = [...hero.querySelectorAll(".o-word .o-letter svg")];
  const C = { gap: 0.5, small: 0.64, mobActive: 0.75, stops: [36, 72], steps: [1.45, 1.45, 1.45], maxLoad: 5, spin: 3.6, turn2From: 1, turn2Cut: 0.8, loops: 2, topDur: 1.6, topAt: 0.7, listDelay: 0.4, infoEarly: 1.5, infoDelay: 0.4, dim: 0.7, wheel: 1.6, bendDesk: 0.12, bendMob: 0.14, bendMobEdge: 0.1, lens: 0.32, lensR: 0.17, volume: 0.3 };

  const works = [...document.querySelectorAll("[data-work-item]")].map((li) => ({
    li, num: li.dataset.num, name: li.dataset.name, ind: li.dataset.ind, svc: li.dataset.svc, label: li.querySelector("a").dataset.label, tex: null, aspect: 1.5,
  }));
  const W = works.length;
  const wrap = (v) => ((v % W) + W) % W;

  // Skin variables to the rgb the canvas uses
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const t = document.createElement("i");
    t.style.color = `var(${name})`;
    document.body.append(t);
    const c = getComputedStyle(t).color;
    t.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const fontOf = () => getComputedStyle(root).getPropertyValue("--kf-font-sans").trim();

  // Photo slot — draw different light and composition per scene on the same 3:2 panel and write what the photo is
  const paint = (w, i) => {
    const cv = document.createElement("canvas");
    cv.width = 900; cv.height = 600;
    const g = cv.getContext("2d");
    const base = rgbOf("--kf-raised"), mid = rgbOf("--kf-dim"), hi = rgbOf("--kf-ink"), acc = rgbOf("--kf-accent");
    const grad = g.createLinearGradient(0, 0, 900 * (i % 2), 600);
    grad.addColorStop(0, i === 0 ? acc : base);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, base);
    g.fillStyle = grad; g.fillRect(0, 0, 900, 600);
    g.globalAlpha = 0.18; g.fillStyle = hi;
    if (i === 0) { g.beginPath(); g.moveTo(0, 600); g.lineTo(520, 120); g.lineTo(900, 300); g.lineTo(900, 600); g.fill(); }
    if (i === 1) g.fillRect(380, 230, 140, 140);
    if (i === 2) for (let k = 0; k < 80; k++) g.fillRect((k * 197) % 900, (k * 131) % 600, 3, 3);
    if (i === 3) { g.beginPath(); g.ellipse(450, 260, 90, 130, 0, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = hi;
    g.font = `500 26px ${fontOf()}`;
    g.textAlign = "center";
    const parts = w.label.split(" · ");
    parts.forEach((p, k) => g.fillText(p, 450, 300 - (parts.length - 1) * 18 + k * 36));
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    w.tex = tex;
  };

  /* ── Screen panel ─────────────────────────────────────── */
  const stage = hero.querySelector(".o-stage");
  const rule = hero.querySelector(".o-rule");
  const info = hero.querySelector(".o-info");
  const fields = [...info.querySelectorAll(".o-field")];
  const keys = ["num", "svc", "ind"];
  const names = info.querySelector(".o-names");
  let pct = null;
  if (bar) {
    pct = document.createElement("div");
    pct.className = "o-pct o-xs";
    pct.innerHTML = "<span>0%</span>";
    bar.append(pct);
  }

  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" }); } catch { renderer = null; }
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const target = new THREE.WebGLRenderTarget(2, 2, { samples: 4 });
  const plane = new THREE.PlaneGeometry(1, 1, 24, 24);
  const blank = new THREE.DataTexture(new Uint8Array([34, 34, 34, 255]), 1, 1);
  blank.needsUpdate = true;
  if (renderer) { renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.LinearSRGBColorSpace; stage.append(renderer.domElement); }

  // Vertex: scale k that bulges toward the center depending on the plate’s vertical position s (center 0, ±1 at half the screen width) = 1 / (1 − z)
  const VERT = `
    uniform float uWarp, uCy, uVW, uMob, uA, uB;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 p = modelMatrix * vec4(position, 1.0);
      float s = clamp((p.y - uCy) / (uVW * 0.5), -1.0, 1.0);
      float w = abs(uWarp);
      float z = uMob > 0.5 ? exp(-s * s * 4.0) * w * uA - s * s * w * uB : exp(-s * s * 5.0) * uWarp * uA;
      float k = 1.0 / (1.0 - clamp(z, -0.5, 0.5));
      p.x *= k;
      p.y = uCy + (p.y - uCy) * k;
      gl_Position = projectionMatrix * viewMatrix * p;
    }`;
  // Piece: cropped to fill the plate ratio, resting plates are grayscale with contrast pressed to .88 and then multiplied by opacity
  const FRAG = `
    uniform sampler2D uTex;
    uniform vec2 uSize;
    uniform float uImgA, uGray, uOp;
    varying vec2 vUv;
    void main() {
      float a = uSize.x / uSize.y;
      vec2 fit = a > uImgA ? vec2(1.0, uImgA / a) : vec2(a / uImgA, 1.0);
      vec4 c = texture2D(uTex, (vUv - 0.5) * fit + 0.5);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(c.rgb, vec3(l), uGray);
      c.rgb = mix(c.rgb, 0.5 + (c.rgb - 0.5) * 0.88, uGray);
      gl_FragColor = vec4(c.rgb * uOp, uOp);
    }`;
  // Lens: pulls everything within the radius around the cursor toward it, magnifies it, and brightens it by the same amount
  const lens = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tMap: { value: target.texture }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: 1 }, uAmt: { value: 0 }, uRad: { value: C.lensR } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform sampler2D tMap; uniform vec2 uMouse; uniform float uAspect, uAmt, uRad; varying vec2 vUv;
      void main() {
        vec2 d = vUv - uMouse; d.x *= uAspect;
        float c = smoothstep(uRad, 0.0, length(d));
        c = c * c * (3.0 - 2.0 * c);
        vec4 col = texture2D(tMap, mix(vUv, uMouse, c * uAmt));
        col.rgb += col.rgb * c * uAmt * 0.3;
        gl_FragColor = col;
      }`,
    depthTest: false, depthWrite: false, transparent: true,
  }));
  const post = new THREE.Scene();
  post.add(lens);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const meshes = [];
  const addMesh = () => {
    const m = new THREE.Mesh(plane, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: blank }, uSize: { value: new THREE.Vector2(1, 1) }, uImgA: { value: 1 }, uGray: { value: 1 }, uOp: { value: 0.5 }, uWarp: { value: 0 }, uCy: { value: 0 }, uVW: { value: 1000 }, uMob: { value: 0 }, uA: { value: C.bendDesk }, uB: { value: C.bendMobEdge } },
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    }));
    m.frustumCulled = false;
    scene.add(m);
    meshes.push(m);
  };

  /* ── Size ───────────────────────────────────────── */
  let VW = 1, VH = 1, em = 16, mobile = false, cy = 0, big = 1, bigH = 1, smallW = 1, smallH = 1, gap = 8, around = 4, lineH = 18, nameH = 14, rowsN = 4;
  const rows = [];
  const measure = () => {
    const r = hero.getBoundingClientRect();
    VW = Math.max(1, r.width); VH = Math.max(1, r.height);
    em = parseFloat(getComputedStyle(root).fontSize) || 16;
    mobile = portrait.matches;
    hero.classList.toggle("is-mobile", mobile);
    gap = C.gap * em;
    if (mobile) big = VW * C.mobActive;
    else big = ((VW - 2 * em - 11 * em) / 12) * 4 + em * 3;
    bigH = (big * 2) / 3;
    smallW = smallH = big * C.small;
    cy = (top.offsetTop + top.offsetHeight + VH) / 2;
    around = Math.ceil(VH / (smallH + gap)) + 2;
    while (meshes.length < around * 2 + 1) addMesh();
    rule.style.top = info.style.top = cy + "px";
    const fs = parseFloat(getComputedStyle(fields[0]).fontSize) || 14;
    rowsN = Math.min(W, 4);
    names.style.height = (rowsN + 0.25) * fs + "px";
    nameH = fs;
    lineH = fields[0].offsetHeight || fs * 1.25;
    if (renderer) {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(VW, VH, false);
      target.setSize(Math.round(VW * dpr), Math.round(VH * dpr));
      Object.assign(cam, { left: -VW / 2, right: VW / 2, top: VH / 2, bottom: -VH / 2 });
      cam.updateProjectionMatrix();
      lens.material.uniforms.uAspect.value = VW / VH;
    }
    lastKey = ""; lastPost = ""; lastInfo = null;
  };

  /* ── State ───────────────────────────────────────── */
  let A = 0, goal = 0, vel = 0, smooth = 0.45, mode = "intro", lift = 0, warp = 0, speedAvg = 0, prevA = 0, hideBelow = null, lastIdx = -1;
  let lastKey = "", lastPost = "", lastInfo = null, boxes = [];
  const settle = (x) => { const a = Math.min(1, Math.abs(x)); return 1 - a * a * (3 - 2 * a); };
  // Critically damped spring — follows so it reaches goal within smooth seconds
  const damp = (cur, to, dt) => {
    const om = 2 / smooth, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x), ch = cur - to, tmp = (vel + om * ch) * dt;
    vel = (vel - om * tmp) * ex;
    return to + (ch + tmp) * ex;
  };
  const layout = () => {
    const c = Math.round(A), list = [];
    for (let v = c - around; v <= c + around; v++) {
      const d = v - A, a = settle(d);
      list.push({ v, d, a, w: smallW + (big - smallW) * a, h: smallH + (bigH - smallH) * a, y: 0 });
    }
    const mid = around, m = list[mid], n = m.d > 0 ? list[mid - 1] : list[mid + 1];
    m.y = m.d * ((m.h + n.h) / 2 + gap);
    for (let i = mid + 1; i < list.length; i++) list[i].y = list[i - 1].y + (list[i - 1].h + list[i].h) / 2 + gap;
    for (let i = mid - 1; i >= 0; i--) list[i].y = list[i + 1].y - (list[i + 1].h + list[i].h) / 2 - gap;
    return list;
  };
  const hit = (x, y) => { for (const b of boxes) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.v; return null; };
  const go = (v) => { if (mode === "intro") return; goal = v; smooth = Math.min(0.8, 0.34 + 0.08 * Math.abs(v - A)); };

  // Number, service and industry cells: two lines stacked and rolled by each piece’s share
  const rollFields = (a) => {
    const f = Math.floor(a);
    fields.forEach((el, k) => {
      const spans = el._sp || (el._sp = [...el.querySelectorAll(".o-track > span")]);
      spans.forEach((s, j) => {
        const g = f + j, off = g - a;
        if (s._v !== g) { s._v = g; s.textContent = works[wrap(g)][keys[k]]; }
        s.style.transform = `translate3d(0,${(off * lineH).toFixed(2)}px,0)`;
        s.style.opacity = Math.max(0, 1 - Math.abs(off)).toFixed(3);
      });
    });
  };
  const buildRows = () => {
    names.innerHTML = "";
    rows.length = 0;
    for (let i = 0; i < rowsN + 2; i++) {
      const r = document.createElement("div");
      r.className = "o-row";
      r.innerHTML = "<span></span>";
      r.addEventListener("click", () => { if (mode !== "intro" && r._v != null) go(r._v); });
      names.append(r);
      rows.push(r);
    }
  };
  const rollNames = (a) => {
    const f = Math.floor(a);
    rows.forEach((r, i) => {
      const v = f - 1 + i, off = v - a;
      if (r._v !== v) { r._v = v; r.firstChild.textContent = works[wrap(v)].name; }
      r.style.transform = `translate3d(0,${(off * nameH).toFixed(2)}px,0)`;
      r.firstChild.style.opacity = (0.22 + 0.78 * Math.max(0, 1 - Math.abs(off))).toFixed(3);
    });
  };

  // A click on every turn — one sine (pitch 1.07x per cell) and a short noise, only after the first touch
  let audio = null, lastTick = 0;
  const wake = () => { try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch {} };
  ["pointerdown", "keydown", "click", "touchend"].forEach((t) => addEventListener(t, wake, { passive: true, capture: true }));
  const tick = (i) => {
    if (!audio || audio.state !== "running") return;
    const now = performance.now();
    if (now - lastTick < 45) return;
    lastTick = now;
    const t = audio.currentTime, f = 110 * Math.pow(1.07, i % 6);
    const lp = audio.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = 0.5; lp.connect(audio.destination);
    const o = audio.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(f * 1.7, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
    const g = audio.createGain(); g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(C.volume, t + 0.004); g.gain.exponentialRampToValueAtTime(1e-3, t + 0.09);
    o.connect(g); g.connect(lp); o.start(t); o.stop(t + 0.1);
    const n = Math.floor(audio.sampleRate * 0.02), buf = audio.createBuffer(1, n, audio.sampleRate), ch = buf.getChannelData(0);
    for (let k = 0; k < n; k++) ch[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / n, 4);
    const src = audio.createBufferSource(); src.buffer = buf;
    const bp = audio.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500 * Math.pow(1.07, i % 6); bp.Q.value = 0.8;
    const ng = audio.createGain(); ng.gain.setValueAtTime(C.volume * 0.25, t); ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.025);
    src.connect(bp); bp.connect(ng); ng.connect(lp); src.start(t);
  };

  /* ── Every frame ───────────────────────────────────── */
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, px: 0.5, py: 0.5, speed: 0, in: false };
  let lensAmt = 0;
  const frame = () => {
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    if (mode === "free") A = damp(A, goal, dt);
    const idx = Math.round(A);
    if (idx !== lastIdx) { if ((lastIdx !== -1 || mode !== "intro") && W) tick(wrap(idx)); lastIdx = idx; }
    const v = (A - prevA) / Math.max(dt * 60, 1e-3);
    prevA = A;
    speedAvg += (v - speedAvg) * 0.16;
    const c = Math.max(-1.5, Math.min(1.5, speedAvg * 30));
    const want = Math.abs(c) > 1e-3 ? Math.sign(c) * Math.pow(Math.abs(c), 1.85) * 0.46 : 0;
    warp += (want - warp) * 0.07;
    const shown = mode === "free" ? A : 0;
    if (!mobile && W && (lastInfo === null || Math.abs(shown - lastInfo) > 1e-5)) { rollNames(shown); rollFields(shown); lastInfo = shown; }
    if (!renderer) return;
    const key = [A.toFixed(4), warp.toFixed(4), lift.toFixed(2), hideBelow, VW, VH, cy, mobile].join("|");
    if (key !== lastKey) {
      lastKey = key;
      const list = W ? layout() : [];
      boxes = [];
      const bend = mobile ? C.bendMob : C.bendDesk;
      meshes.forEach((m, i) => {
        const it = list[i];
        if (!it) { m.visible = false; return; }
        const w = works[wrap(it.v)], u = m.material.uniforms, y = cy + it.y + lift;
        m.visible = y + it.h / 2 > -40 && y - it.h / 2 < VH + 40 && (hideBelow === null || it.v >= hideBelow);
        m.position.set(0, VH / 2 - y, 0);
        m.scale.set(it.w, it.h, 1);
        u.uTex.value = w.tex || blank;
        u.uImgA.value = w.aspect;
        u.uSize.value.set(it.w, it.h);
        u.uGray.value = 1 - it.a;
        u.uOp.value = C.dim + (1 - C.dim) * it.a;
        u.uWarp.value = warp;
        u.uCy.value = VH / 2 - cy - lift;
        u.uVW.value = VW;
        u.uMob.value = mobile ? 1 : 0;
        u.uA.value = bend;
        boxes.push({ v: it.v, x: (VW - it.w) / 2, y: y - it.h / 2, w: it.w, h: it.h });
      });
    }
    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;
    const moved = Math.hypot(mouse.px - mouse.tx, mouse.py - mouse.ty);
    mouse.px = mouse.tx; mouse.py = mouse.ty;
    mouse.speed += (moved - mouse.speed) * 0.1;
    const over = mouse.in && !mobile && mode === "free" && hit(mouse.tx * VW, (1 - mouse.ty) * VH) != null;
    lensAmt += ((over ? C.lens : 0) - lensAmt) * 0.08;
    const sp = Math.min(mouse.speed, 0.05), L = lens.material.uniforms;
    L.uMouse.value.set(mouse.x, mouse.y);
    L.uAmt.value = Math.min(0.6, lensAmt + (over ? sp * 4 : 0));
    L.uRad.value = C.lensR + sp * 1.5;
    const pk = key + "|" + L.uMouse.value.x.toFixed(4) + "|" + L.uMouse.value.y.toFixed(4) + "|" + L.uAmt.value.toFixed(4) + "|" + L.uRad.value.toFixed(4);
    if (pk === lastPost) return;
    lastPost = pk;
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(post, postCam);
  };

  /* ── Interaction ── */
  let wheelSum = 0, wheelTimer = 0, wheelFrom = 0;
  hero.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (mode === "intro") return;
    const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? VH : 1);
    if (!wheelTimer) wheelFrom = Math.round(goal);
    wheelSum += d;
    smooth = 0.42;
    goal = wheelFrom + wheelSum / ((bigH + gap) * C.wheel);
    clearTimeout(wheelTimer);
    // Once still for 140ms, snap to the nearest cell — under .12 cell, stay in place
    wheelTimer = setTimeout(() => {
      const l = goal - wheelFrom, s = Math.sign(l), n = Math.abs(l) < 0.12 ? 0 : Math.max(1, Math.round(Math.abs(l)));
      goal = wheelFrom + s * n;
      smooth = 0.36 + 0.04 * Math.min(n, 6);
      wheelSum = 0; wheelTimer = 0;
    }, 140);
  }, { passive: false });
  addEventListener("keydown", (e) => {
    if (mode === "intro") return;
    if (e.key === "ArrowDown" || e.key === "PageDown") { go(Math.round(goal) + 1); e.preventDefault(); }
    if (e.key === "ArrowUp" || e.key === "PageUp") { go(Math.round(goal) - 1); e.preventDefault(); }
  });
  let drag = null;
  hero.addEventListener("pointerdown", (e) => {
    if (mode === "intro" || e.target.closest("a, button, .o-names")) return;
    drag = { y: e.clientY, p: goal, t: performance.now(), v: 0, ly: e.clientY, moved: false, id: e.pointerId };
  });
  addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / VW;
    mouse.ty = 1 - (e.clientY - r.top) / VH;
    mouse.in = e.pointerType === "mouse" && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (mode !== "intro") hero.classList.toggle("is-hover-card", mouse.in && hit(e.clientX - r.left, e.clientY - r.top) != null && !e.target.closest?.("a, button"));
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y;
    if (Math.abs(dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const now = performance.now(), dtm = Math.max(1, now - drag.t);
    drag.v = drag.v * 0.7 + ((drag.ly - e.clientY) / dtm) * 0.3;
    drag.ly = e.clientY; drag.t = now;
    smooth = 0.16;
    goal = drag.p - dy / (bigH + gap);
  }, { passive: true });
  const release = () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved) return;
    let i = Math.round(goal + (d.v * 260) / (bigH + gap));
    if (i === Math.round(d.p) && Math.abs(goal - d.p) > 0.12) i += Math.sign(goal - d.p);
    goal = i;
    smooth = 0.38 + 0.04 * Math.min(6, Math.abs(i - A));
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  hero.addEventListener("click", (e) => {
    if (mode === "intro" || e.target.closest("a, button, .o-names")) return;
    const r = hero.getBoundingClientRect(), v = hit(e.clientX - r.left, e.clientY - r.top);
    if (v == null) return;
    if (v === Math.round(goal) && Math.abs(A - v) < 0.05) works[wrap(v)].li.querySelector("a").click();
    else go(v);
  });

  /* ── Entrance ───────────────────────────────────── */
  const lenis = window.oLenis;
  const free = () => { hideBelow = null; mode = "free"; goal = A = Math.round(A); lenis?.start(); };
  const navText = [...bar.querySelectorAll(".o-xs, .o-nav__link")].filter((el) => !el.querySelector(".o-xs, .o-nav__link"));
  let soft = false;
  try { soft = sessionStorage.getItem("o-soft") === "1"; sessionStorage.removeItem("o-soft"); } catch {}

  const start = () => {
    works.forEach(paint);
    measure();
    buildRows();
    lenis?.stop();
    const tracks = fields.map((f) => f.querySelector(".o-track"));
    const rowSpans = rows.map((r) => r.firstChild);
    const navLines = navText.flatMap((el) => window.oLines(el));
    gsap.set(top, { y: VH - 2 * em - top.offsetHeight });
    gsap.set(letters, { y: 0, yPercent: 100, rotationX: 60 });
    gsap.set(bar, { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(navLines, { yPercent: 110, opacity: 0 });
    gsap.set(navText, { visibility: "visible" });
    gsap.set(bottom, { opacity: 0 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set([...tracks, ...rowSpans], { yPercent: 110 });
    const loops = W * C.loops;
    const below = VH + bigH + smallH;
    lift = below; A = -loops; prevA = A; hideBelow = -loops - 1;
    root.classList.remove("o-boot");
    gsap.ticker.add(frame);
    if (reduce || !W || soft) {
      gsap.set(top, { y: 0 });
      gsap.set(bar, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set([...navLines, ...tracks, ...rowSpans], { yPercent: 0, opacity: 1 });
      gsap.set(rule, { scaleX: 1 });
      gsap.set(bottom, { opacity: 1 });
      lift = 0; A = 0; prevA = 0;
      pct?.remove();
      free();
      if (reduce) gsap.set(letters, { yPercent: 0, rotationX: 0 });
      else gsap.to(letters, { yPercent: 0, rotationX: 0, duration: 1.4, ease: "expo.out", stagger: 0.035 });
      return;
    }
    const born = performance.now(), load = { p: 0 }, label = pct?.firstChild;
    const show = () => {
      gsap.set(bar, { clipPath: `inset(0% ${(100 - load.p).toFixed(2)}% 0% 0%)` });
      if (label?.isConnected) { label.textContent = Math.round(load.p) + "%"; pct.style.left = `calc(${load.p.toFixed(2)}% - ${label.offsetWidth + 0.5 * em}px)`; }
    };
    const wait = () => {
      if (works.some((w) => !w.tex) && (performance.now() - born) / 1000 < C.maxLoad) return gsap.delayedCall(0.1, wait);
      finish();
    };
    gsap.timeline({ onComplete: wait })
      .to(load, { p: C.stops[0], duration: C.steps[0], ease: "expo.inOut", onUpdate: show })
      .to(load, { p: C.stops[1], duration: C.steps[1], ease: "expo.inOut", onUpdate: show });
    function finish() {
      const tl = gsap.timeline({ onComplete: free }), g = C.steps[2];
      tl.to(load, { p: 100, duration: g, ease: "expo.inOut", onUpdate: show }, 0);
      tl.to(letters, { yPercent: 0, rotationX: 0, duration: 1.4, ease: "expo.out", stagger: 0.035 }, g);
      if (label) tl.to(label, { yPercent: -110, duration: 0.5, ease: "power3.in", onComplete: () => pct.remove() }, g);
      tl.to(navLines, { yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.08 }, g + 0.1);
      // Line spin — wind a 3.6-second portion in 2.8 seconds, but from 1 second on wind .8 seconds more smoothly, so the second turn speeds up then settles
      const cut = Math.max(0, Math.min(C.turn2Cut, C.spin - C.turn2From - 0.1)), Q = C.spin - cut, J = Math.min(C.turn2From, Q - 0.1), P = g + C.listDelay;
      const io = gsap.parseEase("power3.inOut");
      const shape = (t) => (t <= J ? t : t + cut * ((x) => x * x * (3 - 2 * x))(Math.min(1, (t - J) / (Q - J))));
      tl.add(() => (mode = "intro"), P);
      tl.to({ y: below }, { y: 0, duration: 1.4, ease: "power3.out", onUpdate() { lift = this.targets()[0].y; } }, P);
      const spin = { t: 0 };
      tl.to(spin, { t: Q, duration: Q, ease: "none", onUpdate: () => (A = -loops * (1 - io(Math.min(1, shape(spin.t) / C.spin)))) }, P);
      tl.to(top, { y: 0, duration: C.topDur, ease: "power3.inOut" }, P + C.topAt);
      const R = g + Q - C.infoEarly + C.infoDelay;
      tl.to(rule, { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, R);
      const seq = [tracks[0], tracks[1], ...rowSpans.slice(1, 1 + rowsN), tracks[2]].filter(Boolean);
      tl.to(seq, { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: (j) => (j < 2 ? j * 0.2 : j < seq.length - 1 ? 0.4 + (j - 2) * 0.04 : 0.6) }, R + 0.15);
      tl.set(rowSpans, { yPercent: 0 }, R + 1.2);
      tl.to(bottom, { opacity: 1, duration: 0.8, ease: "power2.out" }, R + 1.1);
    }
  };
  let resizeT = 0;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(measure, 120); });
  portrait.addEventListener("change", measure);
  Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
