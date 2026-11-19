// Client logo wall: the original’s same three (0.165.0) instanced plane, rebuilt with our shader — 10×6 cells, cell .75 + gap .03, field of view 30°, camera z 5.5↔2.5.
// Convex bend that pushes z back the farther an edge is from the apex (z -= Bend × r² × 6, bend .4 · phone .55), cursor dome (strength .15 · radius 1.5 cells), cell tilt · logo parallax,
// From fragments to a halftone panel (125 cells) ↔ on hover a white background + gray logo. Drag inertia (.0032 · follow 20 · damping 5.5), .85 scale while dragging, and the intro sliding in row by row are all original values.
(() => {
  const { reduced, rgb, font } = PP;
  const canvas = document.querySelector(".cl__grid");
  const hint = document.querySelector("[data-hint]");
  const pre = document.querySelector("#preloader");
  const loadingLine = pre?.querySelector("[data-loading-line]");
  const loadingText = pre?.querySelector("[data-loading-text]");
  const navItems = [...document.querySelectorAll(".pp-logo, .pp-drop, .pp-nav__group > *, .pp-menu-toggle")];
  const header = document.querySelector(".pp-header");

  const COLS = 10, ROWS = 6, TILE = 0.75, GAP = 0.03, STEP = TILE + GAP;
  const WORLD_W = COLS * STEP, WORLD_H = ROWS * STEP;
  const MIN_Z = 2.5, MAX_Z = 5.5;
  const baseDistortion = () => (innerWidth > 900 ? 0.4 : 0.55);
  const POINTER_SENSITIVITY = 0.0032, VELOCITY_FOLLOW = 20, VELOCITY_DECAY = 5.5, CLICK_MOVE = 6;
  const MIN_CARD_SCALE = 0.85, CARD_SCALE_LERP = 0.08, SCALE_HOLD_MS = 55;
  const BEND_STRENGTH = 0.15, BEND_REACH = STEP * 1.5;
  const LOGO_PARALLAX_MAX = 0.08, LOGO_PARALLAX_SPEED = 0.065, LOGO_MOVEMENT_SCALE = -0.1;
  const LOGO_PARALLAX_FOLLOW = 9.5, LOGO_PARALLAX_RETURN = 6.5, LOGO_SCALE_FOLLOW = 7.5;

  // ── Loading: the target % is bound under an expo.inOut 1.5s (after .4s) curve, and the on-screen number follows with a 70ms time constant
  const loaderEase = gsap.parseEase("expo.inOut");
  const startedAt = performance.now();
  let loaderTarget = 0, loaderShown = 0, loaderPrev = startedAt, loaderRaf = 0, loaderDone = false;
  const drawLoader = (p) => {
    const v = Math.max(0, Math.min(100, p));
    if (loadingLine) loadingLine.style.transform = `scaleX(${v / 100})`;
    if (loadingText) loadingText.textContent = `${Math.round(v)}%`;
  };
  const tickLoader = (now) => {
    loaderRaf = 0;
    const elapsed = Math.max(0, Math.min(1, (now - startedAt - 400) / 1500));
    const target = reduced ? loaderTarget : Math.min(loaderTarget, loaderEase(elapsed) * 100);
    const k = reduced ? 1 : 1 - Math.exp(-Math.max(1, now - loaderPrev) / 70);
    loaderPrev = now;
    loaderShown += (target - loaderShown) * k;
    if (Math.abs(target - loaderShown) < 0.08) loaderShown = target;
    drawLoader(loaderShown);
    if (loaderShown < loaderTarget || (!reduced && elapsed < 1)) loaderRaf = requestAnimationFrame(tickLoader);
  };
  const setLoader = (v) => {
    loaderTarget = Math.max(loaderTarget, Math.max(0, Math.min(100, v)));
    if (!loaderRaf) { loaderPrev = performance.now(); loaderRaf = requestAnimationFrame(tickLoader); }
  };
  if (pre) {
    if (header) header.inert = true;
    gsap.fromTo(pre.querySelectorAll(".cl-preloader__label"), { yPercent: 100 }, { yPercent: 0, duration: reduced ? 0 : 1.5, delay: reduced ? 0 : 0.4, ease: "expo.out" });
  }

  let introStarted = !pre, introTime = 0, interacted = false;
  const rowOffsets = Array.from({ length: ROWS }, (_, i) => ({ val: (i % 2 ? 1 : -1) * WORLD_W * 1.5 }));
  const beginIntro = () => {
    if (introStarted) return;
    introStarted = true;
    introTime = 0;
    if (reduced) rowOffsets.forEach((o) => (o.val = 0));
  };
  const showHint = () => { if (!interacted) hint?.classList.add("is-visible"); };
  const dismissHint = () => { interacted = true; hint?.classList.remove("is-visible"); };
  const finishLoader = () => {
    if (loaderDone) return;
    loaderDone = true;
    setLoader(100);
    if (!pre) { beginIntro(); showHint(); return; }
    const settle = () => {
      if (Math.abs(100 - loaderShown) >= 0.1) return requestAnimationFrame(settle);
      drawLoader(100);
      const dur = reduced ? 0 : 1.4, at = reduced ? 0 : 0.25, end = at + dur;
      gsap.timeline({
        onComplete: () => {
          pre.remove();
          if (header) header.inert = false;
          gsap.set(navItems, { clearProps: "transform,opacity,visibility,clipPath,transition" });
          showHint();
        },
      })
        .to(".cl-preloader__content", { autoAlpha: 0, duration: reduced ? 0 : 0.28, ease: "power2.inOut" }, at)
        .call(beginIntro, [], 0)
        .to(".cl-preloader__shutter.is-top", { yPercent: -100, duration: dur, ease: "power2.inOut" }, at)
        .to(".cl-preloader__shutter.is-bottom", { yPercent: 100, duration: dur, ease: "power2.inOut" }, at)
        .call(() => (pre.style.pointerEvents = "none"), [], end)
        .fromTo(navItems, { transition: "none", autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0 : 0.6, stagger: reduced ? 0 : 0.04, ease: "power2.out" }, end);
    };
    settle();
  };

  // ── Logo placeholder: instead of the original logo art, a different shape·letter mark per cell. Drawn in one color on a transparent background like a real logo
  const MARKS = ["circle", "word", "tri", "star", "bars", "diamond", "ring", "word2", "cross", "wave", "badge", "word3"];
  const names = MARKS.map((_, i) => `Client Name ${String(i + 1).padStart(2, "0")}`);
  const sans = font("--kf-font-sans"), display = font("--kf-font-display");
  const drawMark = (c, kind, s, color) => {
    c.save();
    c.fillStyle = c.strokeStyle = color;
    c.lineWidth = s * 0.05;
    const r = s * 0.28;
    switch (kind) {
      case "circle": c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); break;
      case "ring": c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.lineWidth = s * 0.08; c.stroke(); break;
      case "tri": c.beginPath(); c.moveTo(-r, r * 0.8); c.lineTo(0, -r); c.lineTo(r, r * 0.8); c.closePath(); c.fill(); break;
      case "diamond": c.beginPath(); c.moveTo(0, -r * 1.2); c.lineTo(r * 0.8, 0); c.lineTo(0, r * 1.2); c.lineTo(-r * 0.8, 0); c.closePath(); c.fill(); break;
      case "star": c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); break;
      case "bars": for (let k = 0; k < 4; k++) c.fillRect(-r + k * r * 0.55, -r * 0.6, r * 0.3, r * 1.2); break;
      case "cross": c.fillRect(-r, -r * 0.2, r * 2, r * 0.4); c.fillRect(-r * 0.2, -r, r * 0.4, r * 2); break;
      case "wave": c.beginPath(); for (let x = -r * 1.2; x <= r * 1.2; x += 2) c.lineTo(x, Math.sin((x / r) * 3) * r * 0.35); c.lineWidth = s * 0.07; c.stroke(); break;
      case "badge": c.beginPath(); c.ellipse(0, 0, r * 1.2, r * 0.75, 0, 0, Math.PI * 2); c.lineWidth = s * 0.06; c.stroke(); c.font = `800 ${s * 0.12}px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LOGO", 0, 0); break;
      default: {
        const t = kind === "word" ? "LOGO" : kind === "word2" ? "BRAND" : "MARK";
        c.font = kind === "word3" ? `italic 400 ${s * 0.19}px ${display}` : `800 ${s * (kind === "word2" ? 0.17 : 0.19)}px ${sans}`;
        c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(t, 0, 0);
      }
    }
    c.restore();
  };

  // ── three Panel
  const css = (n) => `rgb(${rgb(n).join(",")})`;
  const v3 = (n) => new THREE.Vector3(...rgb(n).map((x) => x / 255));
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(css("--site-wall-bg"));
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
  camera.position.z = MAX_Z;

  const vertexShader = /* glsl */ `
    uniform vec2 uScroll; uniform float uDistortion; uniform float uAspect; uniform float uDragScale;
    uniform float uHoveredTile; uniform vec2 uHoverTilt; uniform vec2 uBendCursor; uniform vec2 uLogoCursor;
    uniform float uLogoMotion; uniform vec2 uGridLogoOffset; uniform float uGridLogoScale;
    uniform float uBendAmount; uniform float uBendStrength; uniform float uBendReach;
    attribute vec2 aOffset; attribute vec2 aAtlasCell; attribute float aIndex; attribute float aInvert; attribute float aHover;
    varying vec3 vNormal; varying vec2 vUv; varying vec2 vAtlasCell; varying float vInvert; varying float vHover;
    varying vec2 vLogoOffset; varying float vLogoScale;
    void main() {
      vec2 centre = aOffset + uScroll;
      float isHovered = 1.0 - step(0.5, abs(aIndex - uHoveredTile));
      vec2 tilt = uHoverTilt * isHovered * aHover;
      vec3 p = vec3(position.xy * uDragScale * (1.0 + aHover * 0.018) + centre, dot(position.xy, tilt) + aHover * 0.012);
      // Push cells around the cursor outward — Gaussian dome
      vec2 d = p.xy - uBendCursor;
      float reach = max(uBendReach, 0.0001);
      p.xy += d * uBendStrength * uBendAmount * exp(-dot(d, d) / (reach * reach));
      // Convex bend of the whole panel: the closer to the screen edge, the further back
      vec2 n2 = vec2(p.x / (uAspect * 3.5), p.y / 3.5);
      p.z -= uDistortion * dot(n2, n2) * 6.0;
      vNormal = normalMatrix * normalize(vec3(-n2 * uDistortion * 2.0 - tilt, 1.0));
      vUv = uv; vAtlasCell = aAtlasCell; vInvert = aInvert; vHover = aHover;
      // Logo parallax: the closer a cell is to the cursor, the more its logo shifts toward the cursor, and if the panel moves fast, away from it
      vec2 ld = (uLogoCursor - centre) / uBendReach;
      float near = exp(-dot(ld, ld) * 0.7);
      float depth = 0.82 + 0.18 * fract(aIndex * 0.618034);
      vLogoOffset = ld / (1.0 + length(ld)) * near * depth * uLogoMotion * 0.065 + uGridLogoOffset * depth;
      vLogoScale = 1.0 + uLogoMotion * (near * 0.018 + aHover * 0.025) + uGridLogoScale * depth;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const fragmentShader = /* glsl */ `
    uniform sampler2D uAtlas; uniform sampler2D uHalftone; uniform vec2 uGrid; uniform float uInset; uniform float uEmissive; uniform vec3 uHoverBg;
    varying vec3 vNormal; varying vec2 vUv; varying vec2 vAtlasCell; varying float vInvert; varying float vHover;
    varying vec2 vLogoOffset; varying float vLogoScale;
    void main() {
      vec2 edge = min(vUv, 1.0 - vUv);
      float mask = smoothstep(0.0, 0.16, min(edge.x, edge.y));
      vec2 uv = (vUv - 0.5 - vLogoOffset * mask) / vLogoScale + 0.5;
      vec2 cell = clamp(uv, 0.0, 1.0) * (1.0 - 2.0 * uInset) + uInset;
      vec3 dots = texture2D(uHalftone, (cell + vAtlasCell) / uGrid).rgb;
      vec4 raw = texture2D(uAtlas, (((cell - 0.5) / 1.025 + 0.5) + vAtlasCell) / uGrid);
      float lum = dot(raw.rgb, vec3(0.299, 0.587, 0.114));
      lum = mix(lum, 1.0 - lum, vInvert);
      vec3 hoverCol = mix(uHoverBg, vec3(lum), raw.a);
      float light = max(dot(normalize(vNormal), normalize(vec3(0.4, 0.6, 1.0))), 0.0) * 0.6 + 0.4;
      gl_FragColor = vec4(mix(dots, hoverCol * (light + uEmissive), smoothstep(0.0, 1.0, vHover)), 1.0);
    }`;

  // ── Logo canvas (original cell size 512, margin 3/32) → halftone canvas (original calculation: 125 cells, cell radius .22+.36×coverage, 2×2 samples)
  const layout = (() => {
    const cols = Math.ceil(Math.sqrt(MARKS.length)), rows = Math.ceil(MARKS.length / cols);
    const small = innerWidth <= 600 || matchMedia("(pointer: coarse)").matches;
    const max = (small ? 4 : 8) * 1024 * 1024;
    const size = Math.min(512, Math.floor(renderer.capabilities.maxTextureSize / Math.max(cols, rows)), Math.floor(Math.sqrt(max / (cols * rows))));
    return { cols, rows, size: Math.max(16, Math.floor(size / 16) * 16) };
  })();
  const makeAtlas = () => {
    const c = document.createElement("canvas");
    c.width = layout.cols * layout.size;
    c.height = layout.rows * layout.size;
    return c;
  };
  const invertOf = [];
  const buildRaw = () => {
    const c = makeAtlas(), ctx = c.getContext("2d", { willReadFrequently: true });
    const ink = css("--site-paper-ink"), s = layout.size;
    MARKS.forEach((kind, i) => {
      const x = (i % layout.cols) * s, y = Math.floor(i / layout.cols) * s;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, s, s); ctx.clip();
      ctx.translate(x + s / 2, y + s / 2);
      drawMark(ctx, kind, s - s * (3 / 32) * 2, ink);
      ctx.restore();
      // As in the original, flip if the logo is bright — if the skin gives dark ink it stays, if light ink it is flipped so the halftone coverage comes out the same
      const d = ctx.getImageData(x, y, s, s).data;
      let sum = 0, n = 0;
      for (let p = 0; p < d.length; p += 4 * 97) if (d[p + 3] > 20) { sum += 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]; n++; }
      invertOf[i] = n ? sum / n > 128 : false;
      setLoader(((i + 1) / MARKS.length) * 90);
    });
    return c;
  };
  const buildHalftone = (raw) => {
    const c = makeAtlas(), ctx = c.getContext("2d");
    const rctx = raw.getContext("2d", { willReadFrequently: true });
    const s = layout.size, dotCount = 125, edgeW = (dotCount / s) * 0.5, offs = [0.25, 0.75];
    const bg = rgb("--site-halftone-deep"), bgInk = rgb("--site-halftone-ink"), logoInk = rgb("--site-halftone-on");
    const dist = new Float32Array(s * s * 4);
    for (let y = 0, k = 0; y < s; y++) for (let x = 0; x < s; x++) for (const oy of offs) for (const ox of offs) {
      const dx = ((((x + ox) * dotCount) / s) % 1) - 0.5, dy = ((((y + oy) * dotCount) / s) % 1) - 0.5;
      dist[k++] = Math.hypot(dx, dy);
    }
    MARKS.forEach((_, i) => {
      const x = (i % layout.cols) * s, y = Math.floor(i / layout.cols) * s;
      const tile = rctx.getImageData(x, y, s, s), px = tile.data;
      for (let p = 0; p < px.length; p += 4) {
        let lum = (px[p] * 0.299 + px[p + 1] * 0.587 + px[p + 2] * 0.114) / 255;
        if (invertOf[i]) lum = 1 - lum;
        const cover = (1 - Math.max(0, Math.min(1, (lum - 0.5) * 1.6 + 0.5))) * (px[p + 3] / 255);
        const radius = 0.22 + 0.36 * cover;
        let dot = 0;
        for (let q = 0; q < 4; q++) {
          const e = Math.max(0, Math.min(1, (radius + edgeW - dist[p + q]) / (2 * edgeW)));
          dot += e * e * (3 - 2 * e) * 0.25;
        }
        for (let ch = 0; ch < 3; ch++) {
          const inkC = bgInk[ch] + (logoInk[ch] - bgInk[ch]) * cover;
          px[p + ch] = bg[ch] + (inkC - bg[ch]) * dot;
        }
        px[p + 3] = 255;
      }
      ctx.putImageData(tile, x, y);
    });
    setLoader(98);
    return c;
  };
  const texture = (c) => {
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return t;
  };

  // ── Panel build
  const count = COLS * ROWS;
  const offsets = new Float32Array(count * 2), hoverValues = new Float32Array(count);
  let material, offsetAttr, hoverAttr;
  const buildGrid = (rawTex, dotTex) => {
    const geo = new THREE.PlaneGeometry(TILE, TILE);
    const cells = new Float32Array(count * 2), index = new Float32Array(count), inv = new Float32Array(count);
    for (let r = 0, i = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++, i++) {
      offsets[i * 2] = (c - COLS / 2 + 0.5) * STEP;
      offsets[i * 2 + 1] = (r - ROWS / 2 + 0.5) * STEP;
      const logo = (r * COLS + c) % MARKS.length;
      cells[i * 2] = logo % layout.cols;
      cells[i * 2 + 1] = layout.rows - 1 - Math.floor(logo / layout.cols);
      index[i] = i;
      inv[i] = invertOf[logo] ? 1 : 0;
    }
    offsetAttr = new THREE.InstancedBufferAttribute(offsets, 2);
    hoverAttr = new THREE.InstancedBufferAttribute(hoverValues, 1);
    geo.setAttribute("aOffset", offsetAttr);
    geo.setAttribute("aAtlasCell", new THREE.InstancedBufferAttribute(cells, 2));
    geo.setAttribute("aIndex", new THREE.InstancedBufferAttribute(index, 1));
    geo.setAttribute("aInvert", new THREE.InstancedBufferAttribute(inv, 1));
    geo.setAttribute("aHover", hoverAttr);
    material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uScroll: { value: new THREE.Vector2() }, uDistortion: { value: baseDistortion() }, uAspect: { value: 1 },
        uAtlas: { value: rawTex }, uHalftone: { value: dotTex }, uGrid: { value: new THREE.Vector2(layout.cols, layout.rows) },
        uInset: { value: 1.5 / layout.size }, uEmissive: { value: 0.3 }, uHoverBg: { value: v3("--site-paper") },
        uHoveredTile: { value: -1 }, uDragScale: { value: 1 }, uHoverTilt: { value: hoverTilt },
        uBendCursor: { value: bendCursor }, uLogoCursor: { value: logoCursor }, uLogoMotion: { value: 0 },
        uGridLogoOffset: { value: gridLogoOffset }, uGridLogoScale: { value: 0 },
        uBendAmount: { value: 0 }, uBendStrength: { value: BEND_STRENGTH }, uBendReach: { value: BEND_REACH },
      },
    });
    const mesh = new THREE.InstancedMesh(geo, material, count);
    const id = new THREE.Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, id);
    scene.add(mesh);
    resize();
  };

  // ── Motion state
  const scroll = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, targetVel = { x: 0, y: 0 };
  const drag = { active: false, x: 0, y: 0, sx: 0, sy: 0, moved: false, pressed: -1 };
  const pointer = { x: 0, y: 0, inside: false };
  const ndc = new THREE.Vector2(), world = new THREE.Vector3(), ray = new THREE.Raycaster();
  const hoverTilt = new THREE.Vector2(), targetTilt = new THREE.Vector2();
  const bendCursor = new THREE.Vector2(), bendTarget = new THREE.Vector2(), logoCursor = new THREE.Vector2();
  const gridLogoOffset = new THREE.Vector2(), gridLogoTarget = new THREE.Vector2();
  let gridLogoScale = 0, gridLogoScaleTarget = 0, logoMotion = 0, bendAmount = 0, bendAmountTarget = 0;
  let dragScale = 1, targetDragScale = 1, lastScaleMove = -Infinity;
  let currentZ = MAX_Z, targetZ = MAX_Z, distortion = baseDistortion(), targetDistortion = distortion;
  let hovered = -1, popupOpen = false, last = performance.now();

  const toWorld = (cx, cy) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -(((cy - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    ray.ray.at(-ray.ray.origin.z / ray.ray.direction.z, world);
    return world;
  };
  const tileAt = (cx, cy) => {
    if (!material) return -1;
    const w = toWorld(cx, cy), half = (TILE * dragScale) / 2;
    for (let i = 0; i < count; i++) {
      const x = offsets[i * 2] + scroll.x, y = offsets[i * 2 + 1] + scroll.y;
      if (Math.abs(w.x - x) <= half && Math.abs(w.y - y) <= half) return i;
    }
    return -1;
  };
  const moveScale = (dx, dy, k) => {
    if (reduced || popupOpen) return;
    const s = Math.min(1, (Math.max(Math.abs(dx), Math.abs(dy)) * k) / 80);
    if (!s) return;
    targetDragScale = 1 - (1 - MIN_CARD_SCALE) * s;
    lastScaleMove = performance.now();
  };
  const idleCursor = () => (canvas.style.cursor = hovered >= 0 ? "pointer" : "grab");

  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    Object.assign(drag, { active: true, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, pressed: tileAt(e.clientX, e.clientY) });
    canvas.style.cursor = "grabbing";
    targetVel.x = targetVel.y = 0;
    hovered = -1;
    if (material) material.uniforms.uHoveredTile.value = -1;
  });
  addEventListener("pointermove", (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      const tx = e.clientX - drag.sx, ty = e.clientY - drag.sy;
      drag.moved = tx * tx + ty * ty > CLICK_MOVE * CLICK_MOVE;
      if (drag.moved) dismissHint();
    }
    if (drag.moved) moveScale(dx, dy, 1.2);
    targetVel.x = dx * POINTER_SENSITIVITY;
    targetVel.y = -dy * POINTER_SENSITIVITY;
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = (e) => {
    if (!drag.active) return;
    drag.active = false;
    if (e.type === "pointerup" && !drag.moved && drag.pressed >= 0 && tileAt(e.clientX, e.clientY) === drag.pressed) openPopup(drag.pressed % MARKS.length);
    drag.pressed = -1;
    idleCursor();
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  addEventListener("pointerup", endDrag);
  addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.inside = true; });
  canvas.addEventListener("pointerleave", () => {
    pointer.inside = false;
    hovered = -1;
    if (material) material.uniforms.uHoveredTile.value = -1;
    if (!drag.active) idleCursor();
  });
  canvas.addEventListener("wheel", dismissHint, { once: true, passive: true });
  canvas.addEventListener("wheel", (e) => {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvas.clientHeight : 1;
    moveScale(e.deltaX * unit, e.deltaY * unit, 0.6);
    targetZ = Math.max(MIN_Z, Math.min(MAX_Z, targetZ + e.deltaY * 0.005));
  }, { passive: true });
  // Two-finger spread: camera over the same range
  let pinch0 = null, pinchZ = null;
  const spread = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  canvas.addEventListener("touchstart", (e) => { if (e.touches.length >= 2) { drag.active = false; pinch0 = spread(e.touches); pinchZ = targetZ; } }, { passive: true });
  canvas.addEventListener("touchmove", (e) => { if (e.touches.length >= 2 && pinch0) { drag.active = false; targetZ = Math.max(MIN_Z, Math.min(MAX_Z, pinchZ * (pinch0 / spread(e.touches)))); } }, { passive: true });
  canvas.addEventListener("touchend", (e) => { if (e.touches.length < 2) pinch0 = null; }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    if (!popupOpen) targetDistortion = baseDistortion();
    if (material) material.uniforms.uAspect.value = w / h;
  };
  addEventListener("resize", resize);
  resize();

  const updateHover = () => {
    if (drag.active || popupOpen || !material || !pointer.inside) {
      targetTilt.set(0, 0);
      if (hovered !== -1) { hovered = -1; if (material) material.uniforms.uHoveredTile.value = -1; }
      return;
    }
    const w = toWorld(pointer.x, pointer.y), half = (TILE * dragScale) / 2;
    let next = -1;
    for (let i = 0; i < count; i++) {
      const x = offsets[i * 2] + scroll.x, y = offsets[i * 2 + 1] + scroll.y;
      if (Math.abs(w.x - x) <= half && Math.abs(w.y - y) <= half) {
        next = i;
        if (!reduced) targetTilt.set(((w.x - x) / half) * 0.035, ((w.y - y) / half) * 0.035);
        break;
      }
    }
    if (next < 0) targetTilt.set(0, 0);
    if (hovered === next) return;
    hovered = next;
    material.uniforms.uHoveredTile.value = hovered;
    if (!drag.active) idleCursor();
  };

  const frame = () => {
    requestAnimationFrame(frame);
    if (!material) return;
    const now = performance.now(), dt = Math.min(Math.max(0, now - last) / 1000, 0.05);
    last = now;
    const u = material.uniforms;
    if (introStarted) {
      introTime += dt;
      rowOffsets.forEach((o, r) => { if (introTime > r * 0.08) o.val += (0 - o.val) * (1 - Math.exp(-4.5 * dt)); });
    }
    const follow = 1 - Math.exp(-VELOCITY_FOLLOW * dt);
    vel.x += (targetVel.x - vel.x) * follow;
    vel.y += (targetVel.y - vel.y) * follow;
    if (!drag.active) { const d = Math.exp(-VELOCITY_DECAY * dt); targetVel.x *= d; targetVel.y *= d; }

    if (!reduced && !popupOpen) {
      const speed = Math.hypot(vel.x, vel.y);
      let m = Math.max(0, Math.min(1, speed / LOGO_PARALLAX_SPEED));
      m = m * m * (3 - 2 * m);
      if (speed > 0.00001) gridLogoTarget.set(-vel.x, -vel.y).normalize().multiplyScalar(LOGO_PARALLAX_MAX * m);
      else gridLogoTarget.set(0, 0);
      gridLogoScaleTarget = LOGO_MOVEMENT_SCALE * m;
    } else { gridLogoTarget.set(0, 0); gridLogoScaleTarget = 0; }
    gridLogoOffset.lerp(gridLogoTarget, 1 - Math.exp(-(gridLogoTarget.lengthSq() > 0.000001 ? LOGO_PARALLAX_FOLLOW : LOGO_PARALLAX_RETURN) * dt));
    gridLogoScale += (gridLogoScaleTarget - gridLogoScale) * (1 - Math.exp(-LOGO_SCALE_FOLLOW * dt));
    u.uGridLogoScale.value = gridLogoScale;

    if (now - lastScaleMove > SCALE_HOLD_MS || popupOpen || reduced) targetDragScale = 1;
    dragScale += (targetDragScale - dragScale) * (reduced ? 1 : 1 - Math.pow(1 - CARD_SCALE_LERP, dt * 60));
    if (Math.abs(targetDragScale - dragScale) < 0.0001) dragScale = targetDragScale;
    u.uDragScale.value = dragScale;

    scroll.x = (((scroll.x + vel.x) % WORLD_W) + WORLD_W) % WORLD_W;
    scroll.y = (((scroll.y + vel.y) % WORLD_H) + WORLD_H) % WORLD_H;

    const camFollow = 1 - Math.exp(-5 * dt);
    currentZ += (targetZ - currentZ) * camFollow;
    camera.position.z = currentZ;
    distortion += (targetDistortion - distortion) * camFollow;
    u.uDistortion.value = distortion;

    if (pointer.inside && !popupOpen) {
      const w = toWorld(pointer.x, pointer.y);
      bendTarget.set(w.x, w.y);
      bendAmountTarget = drag.active ? 0.35 : 1;
    } else bendAmountTarget = 0;
    bendCursor.lerp(bendTarget, 1 - Math.pow(1 - 0.12, dt * 60));
    logoCursor.lerp(bendTarget, 1 - Math.exp(-4.2 * dt));
    logoMotion += ((!reduced && pointer.inside && !drag.active && !popupOpen ? 1 : 0) - logoMotion) * (1 - Math.exp(-5 * dt));
    u.uLogoMotion.value = logoMotion;
    bendAmount += (bendAmountTarget - bendAmount) * (1 - Math.pow(1 - 0.08, dt * 60));
    u.uBendAmount.value = reduced ? 0 : bendAmount;

    // Spin the panel around: fold cell centers into world width and height so they always cover the screen, adding the row intro push
    const hw = WORLD_W / 2, hh = WORLD_H / 2;
    for (let r = 0, i = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++, i++) {
      const wx = ((((c - COLS / 2 + 0.5) * STEP + scroll.x + hw) % WORLD_W) + WORLD_W) % WORLD_W - hw;
      const wy = ((((r - ROWS / 2 + 0.5) * STEP + scroll.y + hh) % WORLD_H) + WORLD_H) % WORLD_H - hh;
      offsets[i * 2] = wx - scroll.x + rowOffsets[r].val;
      offsets[i * 2 + 1] = wy - scroll.y;
    }
    offsetAttr.needsUpdate = true;
    u.uScroll.value.set(scroll.x, scroll.y);

    updateHover();
    const hf = reduced ? 1 : 1 - Math.exp(-8 * dt);
    for (let i = 0; i < count; i++) hoverValues[i] += ((i === hovered ? 1 : 0) - hoverValues[i]) * hf;
    hoverAttr.needsUpdate = true;
    hoverTilt.lerp(targetTilt, 1 - Math.exp(-9 * dt));
    renderer.render(scene, camera);
  };

  // ── Drawer: when opened the warp flattens to 0 and the logo parallax settles, when closed it returns
  const popup = document.querySelector(".cl-popup");
  const popupLogo = popup.querySelector("[data-popup-logo]");
  const openPopup = (idx) => {
    popupOpen = true;
    targetDistortion = 0;
    gridLogoTarget.set(0, 0);
    gridLogoScaleTarget = 0;
    popup.querySelector("[data-popup-name]").textContent = names[idx];
    popupLogo.innerHTML = "<canvas></canvas>";
    const pc = popupLogo.firstChild, r = popupLogo.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    const w = r.width || 300, h = r.height || 300;
    pc.width = w * d; pc.height = h * d;
    const c = pc.getContext("2d");
    c.scale(d, d); c.translate(w / 2, h / 2);
    drawMark(c, MARKS[idx], w * 1.4, css("--kf-ink"));
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
  };
  const closePopup = () => {
    if (!popupOpen) return;
    popupOpen = false;
    targetDistortion = baseDistortion();
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
  };
  popup.querySelector(".cl-popup__close").addEventListener("click", closePopup);
  popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
  addEventListener("keydown", (e) => e.key === "Escape" && closePopup());

  // Draw after the type loads so glyph markers don’t get fixed to a fallback font
  setLoader(0);
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    const raw = buildRaw();
    buildGrid(texture(raw), texture(buildHalftone(raw)));
    frame();
    requestAnimationFrame(finishLoader);
  }).catch(finishLoader);
})();
