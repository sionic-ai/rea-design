// One point cloud changes shape as you scroll — scattered starfield → upper body → globe → map → double helix sliding sideways → tunnel → box around text.
// Shape coordinates are baked into attributes once and the blending is done by the vertex shader — moving 40k-odd points in JS every frame would drop the frame rate.
(() => {
  const VERT = `
    uniform float uTime, uSize, uPixelRatio, uFormation, uM1, uM2, uM3, uM4, uM5;
    uniform float uRing, uRingRadius, uWaveWidth, uWaveAmp, uTunnelDepth, uSlide, uTurb;
    uniform float uGlow, uGlowRadius, uAspect, uPortrait, uGlobeScale, uGlobeY, uMapScale, uMapY;
    uniform vec4 uRect;
    uniform vec2 uPointer;
    attribute vec3 aOrigin, aGlobe, aMap;
    attribute vec2 aSeed;
    attribute float aWaveX, aWaveCurve, aWaveJitter, aIsRung, aRungT, aDelay, aSize, aPhase, aLuma;
    varying float vAlpha;
    const float TAU = 6.28318530718;
    const float SLOTS = 20.0;

    vec2 coil(float ang, float r) {
      vec2 a = vec2(sin(ang), cos(ang)) * r;
      return mix(mix(a, -a, aWaveCurve), mix(a, -a, aRungT), aIsRung);
    }

    void main() {
      float slot = floor(aSeed.x * SLOTS);
      float inRing = step(aSeed.y, 0.02);
      float ringOn = uRing * inRing;
      float delay = mix(aDelay, slot / SLOTS * 0.15, ringOn);
      float t = clamp((uFormation - delay) / max(1.0 - delay, 0.001), 0.0, 1.0);
      float eOut = 1.0 - pow(1.0 - t, 3.0);
      float eInOut = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
      float e = mix(eOut, eInOut, ringOn);
      // While the ring floats, the other dots are held at their scattered spots — if the upper body forms behind the ring first, the loader gets buried
      float form = mix(e * (1.0 - uRing), e, inRing);

      float sw = (1.0 - form) * 1.4;
      float cs = cos(sw), sn = sin(sw);
      vec3 origin = vec3(aOrigin.x * cs - aOrigin.z * sn, aOrigin.y, aOrigin.x * sn + aOrigin.z * cs);

      float jit = 1.0 + uTurb * 3.0;
      float r = uWaveAmp * (0.85 + aWaveJitter * 0.15 * jit);
      vec2 yz = coil(aWaveX * 13.0 + uTime * 0.6 + uSlide * 2.4 + aWaveJitter * 0.12 * jit, r);
      vec3 helix = vec3(aWaveX * uWaveWidth - uSlide * uWaveWidth * 0.15, yz);

      float spin = mix(uTime * 0.6, 1.1, smoothstep(0.5, 1.0, uM4));
      vec3 tunnel = vec3(coil(aWaveX * 13.0 + spin + aWaveJitter * 0.12 * jit, r * 1.5), aWaveX * uTunnelDepth * 2.4);

      // Split the rectangle’s perimeter by length ratio and by the centers of four equal parts — splitting a wide block’s perimeter by length alone leaves the short sides looking sparse
      float w = max(uRect.y - uRect.x, 0.0001), h = max(uRect.z - uRect.w, 0.0001);
      float per = 2.0 * (w + h);
      float top = mix(w / per, 0.25, 0.5), side = mix(h / per, 0.25, 0.5);
      float u = fract(aWaveX + 0.5 + top * 0.5);
      vec2 oxy;
      if (u < top) oxy = vec2(mix(uRect.x, uRect.y, u / top), uRect.z);
      else if (u < top + side) oxy = vec2(uRect.y, mix(uRect.z, uRect.w, (u - top) / side));
      else if (u < top * 2.0 + side) oxy = vec2(mix(uRect.y, uRect.x, (u - top - side) / top), uRect.w);
      else oxy = vec2(uRect.x, mix(uRect.w, uRect.z, (u - top * 2.0 - side) / side));
      vec2 hj = vec2(fract(sin(u * 127.1 + 7.3) * 43758.5453), fract(sin(u * 269.5 + 3.7) * 24634.6345)) * 2.0 - 1.0;
      float pad = 0.06 * max(w, h);
      vec3 frame = vec3(oxy + hj * pad * 0.4, hj.x * pad * 0.5);

      vec3 globe = vec3(aGlobe.x, aGlobe.y - uGlobeY, aGlobe.z) * uGlobeScale + vec3(0.0, uGlobeY, 0.0);
      vec3 map = vec3(aMap.x, aMap.y - uMapY, aMap.z) * uMapScale + vec3(0.0, uMapY, 0.0);
      vec3 shape = mix(position, globe, uM1);
      shape = mix(shape, map, uM2);
      shape = mix(shape, helix, uM3);
      shape = mix(shape, tunnel, uM4);
      shape = mix(shape, frame, uM5);

      float ang = slot / SLOTS * TAU;
      vec3 ring = vec3(cos(ang + uTime * 1.2), sin(ang + uTime * 1.2), 0.0) * uRingRadius;
      float pulse = pow(0.5 + 0.5 * sin(uTime - ang), 2.0);

      vec3 p = mix(origin, mix(shape, ring, ringOn), form);
      p.z += sin(uTime * 0.7 + aPhase) * 0.012 * form;
      // While the ring floats, the stars go behind it — a star hanging in front of the camera swells large and hides the ring
      float bg = uRing * (1.0 - inRing);
      p.z = mix(p.z, min(p.z, -uRingRadius * 0.8), bg);

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;

      vec2 d = gl_Position.xy / max(gl_Position.w, 0.001) - uPointer;
      d.x *= uAspect;
      float glow = smoothstep(uGlowRadius, 0.0, length(d)) * uGlow * form;
      float tw = 0.82 + 0.18 * sin(uTime * 1.4 + aPhase * 3.0);
      vAlpha = (0.16 + 0.84 * aLuma) * (1.0 + glow) * tw * smoothstep(0.0, 0.12, t);
      vAlpha *= mix(1.0, 1.4, bg);
      vAlpha *= mix(1.0, mix(1.0, step(aSeed.y, 0.35), uPortrait), bg);
      vAlpha *= mix(1.0, mix(0.15, 2.2, pulse), ringOn);
      float grow = (1.0 + (1.0 - form) * 0.7) * mix(1.0, 1.05, bg) * mix(1.0, mix(0.1, 4.5, pulse), ringOn);
      gl_PointSize = min(uSize * aSize * grow * uPixelRatio / max(-mv.z, 0.001), 48.0 * uPixelRatio);
    }`;

  const FRAG = `
    uniform vec3 uColor;
    uniform float uExposure;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(uColor, min(smoothstep(0.5, 0.05, d) * vAlpha * uExposure, 1.0));
      #include <colorspace_fragment>
    }`;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;

  // Upper body silhouette — twelve bands of (bottom edge y, half width, dot share). Only head · neck · shoulder proportions were measured, the face is painted by our own calculation
  const BUST_TOP = 0.874;
  const BUST = [
    [-0.989, 1.06, 7628], [-0.834, 0.99, 6519], [-0.679, 0.83, 4735], [-0.523, 0.5, 2580],
    [-0.368, 0.32, 1994], [-0.213, 0.42, 2690], [-0.057, 0.51, 3214], [0.098, 0.58, 3639],
    [0.253, 0.58, 3790], [0.408, 0.55, 3405], [0.563, 0.48, 2652], [0.719, 0.32, 1154],
  ];
  const BAND = (BUST_TOP - BUST[0][0]) / BUST.length;

  function halfWidth(y) {
    const pts = BUST.map(([y0, w]) => [y0 + BAND / 2, w * 0.94]);
    pts.unshift([BUST[0][0], 1.06]);
    pts.push([BUST_TOP, 0.1]);
    for (let i = 1; i < pts.length; i++) if (y <= pts[i][0]) {
      const k = (y - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return lerp(pts[i - 1][1], pts[i][1], smooth(clamp(k, 0, 1)));
    }
    return 0.1;
  }

  // Curly hair spikes — 40 strands on the half circle above the head, each with a set length, and points scattered along that strand
  const SPIKES = Array.from({ length: 40 }, (_, j) => ({ a: (Math.PI * (j + 0.5)) / 40 + (Math.random() - 0.5) * 0.05, len: 0.04 + 0.09 * Math.random() }));

  // Dot order runs top→bottom — the globe dots are also top→bottom, so during the change same-height dots pair up and it passes as if sliced into horizontal bands
  const byHeight = (pos, extra) => {
    const n = pos.length / 3, idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => pos[b * 3 + 1] - pos[a * 3 + 1]);
    const p2 = new Float32Array(pos.length), e2 = extra ? new Float32Array(n) : null;
    idx.forEach((from, to) => { p2.set(pos.subarray(from * 3, from * 3 + 3), to * 3); if (e2) e2[to] = extra[from]; });
    return { pos: p2, extra: e2 };
  };

  function bust(n) {
    const pos = new Float32Array(n * 3), luma = new Float32Array(n);
    const total = BUST.reduce((s, b) => s + b[2], 0);
    for (let i = 0; i < n; i++) {
      let pick = Math.random() * total, b = 0;
      while (pick > BUST[b][2] && b < BUST.length - 1) pick -= BUST[b++][2];
      const y = BUST[b][0] + Math.random() * BAND;
      const hair = clamp((y - 0.18) / 0.3, 0, 1);
      let w = halfWidth(y);
      if (hair > 0) w *= 1 + hair * 0.06 * Math.abs(Math.sin(y * 47 + Math.random() * 0.6));
      const s = Math.random() * 2 - 1;
      let x = s * w;
      let yy = y;
      if (hair > 0.3 && Math.random() < 0.14) {
        const sp = SPIKES[Math.floor(Math.random() * SPIKES.length)];
        // Clumped curls rather than straight spikes — gathered as small lumps near strand ends
        const base = 0.92, along = sp.len * (0.35 + 0.65 * Math.random());
        x = Math.cos(sp.a) * (0.56 * base + along) + (Math.random() - 0.5) * 0.07;
        yy = 0.3 + Math.sin(sp.a) * (0.55 * base + along) + (Math.random() - 0.5) * 0.06;
      }
      const body = clamp((-0.45 - y) / 0.2, 0, 1);
      const round = Math.sqrt(Math.max(0, 1 - s * s));
      const zc = lerp(-0.31, 0.09, body), depth = lerp(0.45, 0.22, body);
      pos[i * 3] = x;
      pos[i * 3 + 1] = yy;
      pos[i * 3 + 2] = zc + depth * round;
      let l = 0.22 + 0.5 * round * (0.75 + 0.25 * Math.sign(-s + 0.3)) + 0.28 * Math.random();
      const eye = Math.min(Math.hypot(Math.abs(x) - 0.2, y - 0.2), 1);
      if (eye < 0.08 && hair < 0.4) l *= 0.45 + eye * 4;
      if (Math.abs(x) < 0.05 && y > -0.06 && y < 0.16) l = Math.min(1, l * 1.25);
      if (hair > 0.5) l = 0.25 + 0.55 * Math.random();
      luma[i] = clamp(l, 0, 1);
    }
    const sorted = byHeight(pos, luma);
    return { pos: sorted.pos, luma: sorted.extra };
  }

  // Map slot: one slanted peninsula and two islands we drew (width 1.43 · height 1.87, same height as the upper body).
  const LAND = [
    [-0.7, 0.93], [-0.45, 0.9], [-0.18, 0.82], [0.02, 0.64], [0.0, 0.46], [0.12, 0.27], [0.34, 0.07], [0.6, -0.1],
    [0.7, -0.28], [0.56, -0.41], [0.41, -0.37], [0.3, -0.55], [0.16, -0.63], [0.05, -0.5], [-0.06, -0.29],
    [-0.25, -0.1], [-0.41, 0.14], [-0.56, 0.35], [-0.72, 0.55], [-0.73, 0.78],
  ];
  const inside = (x, y) => {
    let hit = false;
    for (let i = 0, j = LAND.length - 1; i < LAND.length; j = i++) {
      const [xi, yi] = LAND[i], [xj, yj] = LAND[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit || ((x + 0.45) / 0.13) ** 2 + ((y + 0.47) / 0.09) ** 2 < 1 || ((x - 0.08) / 0.07) ** 2 + ((y + 0.86) / 0.07) ** 2 < 1;
  };
  function landmass(n) {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let x, y;
      do { x = Math.random() * 1.46 - 0.74; y = Math.random() * 1.88 - 0.95; } while (!inside(x, y));
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * 0.175;
    }
    return byHeight(pos).pos;
  }

  kfFx.register("point-cloud-scroll-morph", (el, { options, reduce }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const coarse = matchMedia("(pointer: coarse)").matches;
    const step = Math.max(1, Math.round(1 / (num("coarse", 0.6) || 1)));
    const n = Math.max(1000, Math.ceil(Math.round(num("count", 44000)) / (coarse ? step : 1)));
    const fill = num("fill", 0.9), widthFill = num("width-fill", 0.92), formationDur = num("formation", 2.8);
    const turn = num("turn", 0.16), maxTurn = num("max-turn", 0.22), idle = num("idle", 0.12);
    const follow = num("follow", 0.35), settle = num("settle", 1.1), glowAmt = num("glow", 2);
    const start = num("start", 1), each = num("each", 1) || 1, slideLen = num("slide", 2.5) || 1;
    const scrollScale = num("scroll-scale", 0.2), scrollRotate = num("scroll-rotate", -0.6);
    const globeR = num("globe-radius", 0.42), globeSpin = num("globe-spin", 0.06), mapOffset = num("map-offset", -0.04);
    const camDist = 3;

    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; el.appendChild(canvas); }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { if (made) canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const { pos, luma } = bust(n);
    let maxY = -Infinity, minY = Infinity, minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1];
      if (y > maxY) maxY = y; if (y < minY) minY = y; if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
    const G = Math.max(maxY - minY, 0.001), X = Math.max(maxX - minX, 0.001), V = (maxY + minY) / 2;
    const map = landmass(n);
    let mapMin = Infinity, mapMax = -Infinity;
    for (let i = 0; i < n; i++) { const y = map[i * 3 + 1]; if (y < mapMin) mapMin = y; if (y > mapMax) mapMax = y; }
    const mapY = (mapMin + mapMax) / 2;

    const origin = new Float32Array(n * 3), globe = new Float32Array(n * 3), seed = new Float32Array(n * 2);
    const delay = new Float32Array(n), size = new Float32Array(n), phase = new Float32Array(n);
    const waveX = new Float32Array(n), waveCurve = new Float32Array(n), waveJit = new Float32Array(n), isRung = new Float32Array(n), rungT = new Float32Array(n);
    const v = new THREE.Vector3();
    const golden = Math.PI * (3 - Math.sqrt(5)), gr = G * globeR;
    for (let i = 0; i < n; i++) {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      if (v.lengthSq() === 0) v.set(0, 1, 0);
      v.normalize().multiplyScalar(2 + 4.5 * Math.random());
      origin.set([v.x, v.y, v.z], i * 3);
      const yy = 1 - (i / Math.max(n - 1, 1)) * 2, rr = Math.sqrt(Math.max(1 - yy * yy, 0)), a = golden * i;
      globe.set([Math.cos(a) * rr * gr, yy * gr + V, Math.sin(a) * rr * gr], i * 3);
      seed[i * 2] = Math.random();
      seed[i * 2 + 1] = Math.random();
      delay[i] = 0.55 * Math.random();
      size[i] = 0.5 + 0.35 * luma[i] + 1.4 * Math.random() ** 3;
      phase[i] = Math.random() * Math.PI * 2;
    }
    // Spiral positions follow a shuffled order — one in six goes to a rung linking the two strands (24 cells), the rest alternate between the two strands
    const order = new Uint32Array(n).map((_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const gap = 1 / Math.max(n - 1, 1);
    for (let k = 0; k < n; k++) {
      const i = order[k];
      waveJit[i] = Math.random() * 2 - 1;
      if (k % 6 === 0) {
        const slot = Math.floor(Math.random() * 24);
        waveX[i] = (slot + 0.5) / 24 - 0.5 + (Math.random() - 0.5) / 48;
        isRung[i] = 1;
        rungT[i] = Math.random();
      } else {
        waveX[i] = k * gap - 0.5 + (Math.random() - 0.5) * gap;
        waveCurve[i] = k % 2;
      }
    }

    const geo = new THREE.BufferGeometry();
    const attr = (name, arr, w) => geo.setAttribute(name, new THREE.BufferAttribute(arr, w));
    attr("position", pos, 3); attr("aOrigin", origin, 3); attr("aGlobe", globe, 3); attr("aMap", map, 3); attr("aSeed", seed, 2);
    attr("aWaveX", waveX, 1); attr("aWaveCurve", waveCurve, 1); attr("aWaveJitter", waveJit, 1); attr("aIsRung", isRung, 1); attr("aRungT", rungT, 1);
    attr("aDelay", delay, 1); attr("aSize", size, 1); attr("aPhase", phase, 1); attr("aLuma", luma, 1);

    const ink = () => getComputedStyle(el).getPropertyValue("--fx-dot").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim() || "white";
    const U = {
      uTime: { value: 0 }, uSize: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() }, uFormation: { value: reduce ? 1 : 0 },
      uM1: { value: 0 }, uM2: { value: 0 }, uM3: { value: 0 }, uM4: { value: 0 }, uM5: { value: 0 },
      uRing: { value: 0 }, uRingRadius: { value: 0.07 * X }, uRect: { value: new THREE.Vector4() },
      uWaveWidth: { value: 0 }, uTunnelDepth: { value: 0 }, uWaveAmp: { value: 0.12 * G }, uSlide: { value: 0 }, uTurb: { value: 0 },
      uColor: { value: new THREE.Color(ink()) }, uExposure: { value: num("exposure", 0.5) }, uPointer: { value: new THREE.Vector2() },
      uGlow: { value: 0 }, uGlowRadius: { value: num("glow-radius", 1) }, uAspect: { value: 1 }, uPortrait: { value: 0 },
      uGlobeScale: { value: 1 }, uGlobeY: { value: V }, uMapScale: { value: 1 }, uMapY: { value: mapY },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const scene = new THREE.Scene(), group = new THREE.Group(), camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    group.add(new THREE.Points(geo, mat));
    scene.add(group);
    camera.position.z = camDist;

    let baseScale = 1, viewH = 1, viewW = 1;
    const resize = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camDist;
      viewW = viewH * (r.width / r.height);
      const tall = r.width < r.height;
      const byH = (fill * viewH) / G, byW = (widthFill * viewW) / X;
      baseScale = tall ? byH : Math.min(byH, byW);
      U.uWaveWidth.value = (3.354 * viewH) / baseScale;
      U.uTunnelDepth.value = (0.2 * viewH) / baseScale;
      U.uSize.value = clamp((r.height / 900) * 5.5, 2.4, 7);
      U.uAspect.value = r.width / r.height;
      U.uPortrait.value = tall ? 1 : 0;
      U.uGlobeScale.value = tall ? 0.6 : 1;
      U.uMapScale.value = tall ? 0.7 : 1;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    renderer.compile(scene, camera);

    const state = { ring: 0, tunnel: 0, frame: 0, rect: null };
    const onState = (e) => Object.assign(state, e.detail || {});
    el.addEventListener("fx:state", onState);
    const themeObs = new MutationObserver(() => U.uColor.value.set(ink()));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });

    const pTarget = new THREE.Vector2(), pSmooth = new THREE.Vector2();
    let pIn = 0, pActive = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) { pIn = 0; return; }
      pTarget.set(x * 2 - 1, -(y * 2 - 1));
      pIn = 1;
    };
    const onLeave = () => { pIn = 0; };
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const a = new THREE.Vector3(), b = new THREE.Vector3(), look = new THREE.Vector3();
    const soft = (x, lim) => lim * Math.tanh(x / lim);
    let last = performance.now(), prevScroll = scrollY, turb = 0, globeAng = 0, raf = 0, shown = false;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.02);
      last = now;
      const sc = scrollY, vh = innerHeight;
      turb += (clamp(Math.abs(sc - prevScroll) / Math.max(dt, 0.001) / 2400, 0, 1) - turb) * (1 - Math.exp(-dt / 0.15));
      prevScroll = sc;
      U.uTurb.value = turb;
      const time = (U.uTime.value += dt);
      const kf = 1 - Math.exp(-dt / Math.max(follow, 0.001)), ks = 1 - Math.exp(-dt / Math.max(settle, 0.001));
      pSmooth.lerp(pTarget, kf);
      pSmooth.x = clamp(pSmooth.x, -1, 1);
      pSmooth.y = clamp(pSmooth.y, -1, 1);
      pActive += (pIn - pActive) * (reduce ? 1 : pIn > pActive ? kf : ks);

      const form = U.uFormation.value;
      const T = clamp(sc / vh, 0, 1);
      const m1 = smooth(clamp((sc / vh - start) / each, 0, 1));
      const m2 = smooth(clamp((sc / vh - start - each) / each, 0, 1));
      const m3 = smooth(clamp((sc / vh - start - 2 * each) / each, 0, 1));
      const slide = clamp(Math.max(0, sc / vh - start - 3 * each) / slideLen, 0, 1);
      U.uM1.value = m1; U.uM2.value = m2; U.uM3.value = m3; U.uSlide.value = slide;
      U.uM4.value = state.tunnel; U.uRing.value = state.ring; U.uM5.value = state.frame;
      const away = Math.max(state.tunnel, state.frame), onGlobe = m1 * (1 - m2);
      globeAng = (globeAng + dt * globeSpin * Math.PI * 2 * onGlobe) % (Math.PI * 2);

      const idleY = Math.sin(0.16 * time) * idle, idleX = -(Math.sin(0.11 * time + 1.4) * idle * 0.4);
      group.rotation.y = (soft(lerp(idleY, pSmooth.x * turn, pActive) * form, maxTurn) + scrollRotate * T * (1 - m1) + globeAng * onGlobe) * (1 - away);
      group.rotation.x = soft(lerp(idleX, -pSmooth.y * turn * 0.6, pActive) * form, maxTurn * 0.6) * (1 - away);
      group.rotation.z = 0.35 * m3 * (1 - away);
      U.uPointer.value.copy(pSmooth);
      U.uGlow.value = glowAmt * pActive;
      if (form < 1) U.uFormation.value = Math.min(form + dt / formationDur, 1);

      const s = baseScale * (1 + T * scrollScale * (1 - m1)) * (1 + 0.6 * slide);
      group.scale.setScalar(s);
      const yBust = -viewH / 2 - minY * s;
      const yShape = -lerp(lerp(V, mapY, m2), 0, m3) * s + mapOffset * m2 * (1 - m3) * viewH;
      group.position.set(lerp(-0.22 * m3 * viewW, 0, state.ring), lerp(lerp(yBust, yShape, m1), 0, state.ring), 0);
      const orbit = (Math.PI / 7) * slide * (1 - away), dist = camDist * (1 - 0.15 * slide);
      camera.position.set(lerp(Math.sin(orbit) * dist, group.position.x, away), lerp(0, group.position.y, away), Math.cos(orbit) * dist);
      look.set(0, 0, 0).lerp(group.position, Math.max(slide, away));
      camera.lookAt(look);

      const rc = state.rect;
      if (rc && state.frame > 0.001) {
        const depth = Math.abs(camera.position.z - group.position.z);
        const hh = 2 * Math.tan((camera.fov * Math.PI) / 360) * depth, ww = hh * camera.aspect, tall = innerWidth < innerHeight;
        const px = rc.width * (tall ? 0.08 : 0.1), py = rc.height * (tall ? 1 : 1.05);
        a.set(camera.position.x + ((rc.left - px) / innerWidth - 0.5) * ww, camera.position.y - ((rc.top - py) / innerHeight - 0.5) * hh, group.position.z);
        b.set(camera.position.x + ((rc.left + rc.width + px) / innerWidth - 0.5) * ww, camera.position.y - ((rc.top + rc.height + py) / innerHeight - 0.5) * hh, group.position.z);
        group.updateMatrixWorld();
        group.worldToLocal(a);
        group.worldToLocal(b);
        U.uRect.value.set(a.x, b.x, a.y, b.y);
      }
      if (document.hidden) return;
      renderer.render(scene, camera);
      if (!shown) { shown = true; el.classList.add("is-live"); }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObs.disconnect();
      el.removeEventListener("fx:state", onState);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.classList.remove("is-live");
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (made) canvas.remove();
    };
  });
})();
