// One particle swarm gathers into a different shape per section: tiger profile → scatter → ring (spin and dive) → bracelet → tiger (three finishes) → ruby polyhedron → three beads → tiger face.
// The original particle image (webp) · shader are not used. The tiger silhouette is newly drawn on a canvas to pick points, and the gem is made by formula.
(() => {
  const T = THREE, TG = window.TG, reduce = TG.reduce;
  const mobile = innerWidth < 768;
  const N = mobile ? 14000 : 26000;
  const canvas = document.querySelector(".tg-webgl");
  const renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 100);
  const fit = () => Math.max(1, 1.55 / (innerWidth / innerHeight));
  camera.position.set(0, 0, 9.2 * fit());

  // ── Building shapes ──
  const rnd = Math.random;
  // Pick points from the filled cells of the silhouette drawn on canvas (a tone function gives each cell a color number)
  const fromCanvas = (w, h, draw, width, tone, depth = 0.18) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const x = cv.getContext("2d", { willReadFrequently: true });
    draw(x, w, h);
    const d = x.getImageData(0, 0, w, h).data;
    const pos = new Float32Array(N * 3), tn = new Float32Array(N), s = width / w;
    for (let i = 0, guard = 0; i < N && guard < N * 80; guard++) {
      const px = rnd() * w, py = rnd() * h, o = ((py | 0) * w + (px | 0)) * 4;
      if (d[o + 3] < 128) continue;
      pos[i * 3] = (px - w / 2) * s; pos[i * 3 + 1] = (h / 2 - py) * s; pos[i * 3 + 2] = (rnd() - 0.5) * depth;
      tn[i] = tone(d[o], d[o + 1], d[o + 2]); i++;
    }
    return { pos, tn };
  };
  // The silhouette is white, where bright gold should be painted, like eyes and nose, the red channel is lowered as a mark
  const toneByMark = (r, g) => (g < 120 ? (rnd() < 0.8 ? 2 : 4) : r < 200 ? 1 : rnd() < 0.12 ? 1 : rnd() < 0.05 ? 3 : 0);
  const tigerSide = (mirror) => fromCanvas(480, 240, (x, w, h) => {
    if (mirror) { x.translate(w, 0); x.scale(-1, 1); }
    x.fillStyle = "white"; /* Not skin: silhouette marker for picking points */
    x.beginPath(); x.ellipse(230, 128, 120, 46, -0.05, 0, 7); x.fill();
    x.beginPath(); x.moveTo(320, 100); x.quadraticCurveTo(352, 70, 372, 78); x.lineTo(392, 116); x.quadraticCurveTo(360, 132, 330, 150); x.fill();
    x.beginPath(); x.arc(378, 86, 30, 0, 7); x.fill();
    x.beginPath(); x.ellipse(408, 98, 18, 13, 0.2, 0, 7); x.fill();
    x.beginPath(); x.moveTo(360, 64); x.lineTo(366, 42); x.lineTo(378, 58); x.fill();
    x.beginPath(); x.moveTo(384, 58); x.lineTo(394, 40); x.lineTo(400, 64); x.fill();
    const leg = (x0, top, dx) => { x.beginPath(); x.moveTo(x0 - 11, top); x.lineTo(x0 + 11, top); x.lineTo(x0 + 8 + dx, 218); x.lineTo(x0 - 12 + dx, 222); x.closePath(); x.fill(); x.beginPath(); x.ellipse(x0 - 2 + dx, 222, 15, 7, 0, 0, 7); x.fill(); };
    leg(300, 140, 14); leg(330, 140, -8); leg(150, 138, -16); leg(178, 140, 10);
    x.lineWidth = 15; x.lineCap = "round"; x.strokeStyle = "white"; /* Not skin: silhouette marker for picking points */
    x.beginPath(); x.moveTo(118, 112); x.bezierCurveTo(70, 96, 52, 150, 28, 168); x.stroke();
    // Stripes are painted with red marks — points picked from that cell turn ruby
    x.strokeStyle = "rgb(255,40,40)"; /* Not skin: stripe placeholder (ruby) */ x.lineWidth = 7;
    for (let k = 0; k < 11; k++) { const sx = 130 + k * 19; x.beginPath(); x.moveTo(sx, 88); x.quadraticCurveTo(sx + 12, 120, sx - 4, 150 + (k % 3) * 6); x.stroke(); }
    for (const [hx, hy] of [[362, 70], [372, 104], [392, 74]]) { x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx + 10, hy + 8); x.stroke(); }
    x.fillStyle = "rgb(120,255,255)"; /* Not skin: eye position marker (bright gold) */
    x.beginPath(); x.ellipse(386, 80, 6, 3, 0.2, 0, 7); x.fill();
  }, 6.2, toneByMark);
  const tigerFace = () => fromCanvas(480, 260, (x) => {
    x.fillStyle = "white"; /* Not skin: silhouette marker for picking points */
    x.beginPath(); x.ellipse(240, 140, 210, 110, 0, 0, 7); x.fill();
    x.beginPath(); x.arc(78, 48, 36, 0, 7); x.arc(402, 48, 36, 0, 7); x.fill();
    // Forehead and cheek stripes are red marks (ruby dots), eyes left empty, only pupils and nose in bright gold
    x.strokeStyle = "rgb(255,40,40)"; /* Not skin: stripe placeholder (ruby) */ x.lineWidth = 11; x.lineCap = "round";
    for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(240 + k * 24, 42); x.quadraticCurveTo(240 + k * 32, 72, 240 + k * 15, 96); x.stroke(); }
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(240 + side * (125 + k * 20), 118 + k * 12); x.quadraticCurveTo(240 + side * (155 + k * 18), 150 + k * 8, 240 + side * (205 + k * 2), 150 + k * 16); x.stroke(); }
    x.globalCompositeOperation = "destination-out";
    x.beginPath(); x.ellipse(165, 128, 44, 18, 0.18, 0, 7); x.ellipse(315, 128, 44, 18, -0.18, 0, 7); x.fill();
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "rgb(120,255,255)"; /* Not skin: eye and nose position markers (light gold) */
    x.beginPath(); x.arc(165, 128, 9, 0, 7); x.arc(315, 128, 9, 0, 7); x.fill();
    x.beginPath(); x.moveTo(212, 172); x.lineTo(268, 172); x.lineTo(240, 200); x.fill();
  }, 5.2, toneByMark, 0.3);
  // Ring: major radius R, elliptical cross section (a along the circumference, b height). The middle band is ruby, the edges bright gold
  const torus = (R, a, b, ruby) => {
    const pos = new Float32Array(N * 3), tn = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const u = rnd() * Math.PI * 2, v = rnd() * Math.PI * 2, k = 0.85 + rnd() * 0.15;
      const r = R + Math.cos(v) * a * k;
      pos[i * 3] = Math.cos(u) * r; pos[i * 3 + 1] = Math.sin(u) * r; pos[i * 3 + 2] = Math.sin(v) * b * k;
      const band = Math.abs(Math.sin(v));
      tn[i] = ruby(u, v, band);
    }
    return { pos, tn };
  };
  const ring = torus(1.3, 0.34, 0.13, (u, v, band) => (band < 0.35 ? (rnd() < 0.7 ? 2 : 4) : rnd() < 0.25 ? 1 : 0));
  const bangle = (() => {
    const s = torus(1.25, 0.16, 0.42, (u, v, band) => (Math.sin(u * 14 + v) > 0.45 ? 2 : band > 0.9 ? 1 : 0));
    // Tilted as if hanging on the wrist
    const e = new T.Euler(1.05, 0.25, 0.2), m = new T.Matrix4().makeRotationFromEuler(e), p = new T.Vector3();
    for (let i = 0; i < N; i++) { p.fromArray(s.pos, i * 3).applyMatrix4(m); p.toArray(s.pos, i * 3); }
    return s;
  })();
  const ruby = (() => {
    const pos = new Float32Array(N * 3), tn = new Float32Array(N);
    const ico = new T.IcosahedronGeometry(1.35, 0), P = ico.attributes.position, edges = [];
    for (let f = 0; f < P.count; f += 3) for (let e = 0; e < 3; e++) edges.push([f + e, f + ((e + 1) % 3)]);
    const a = new T.Vector3(), b = new T.Vector3();
    for (let i = 0; i < N; i++) {
      const q = rnd();
      if (q < 0.4) { const [i0, i1] = edges[(rnd() * edges.length) | 0]; a.fromBufferAttribute(P, i0); b.fromBufferAttribute(P, i1); a.lerp(b, rnd()); tn[i] = rnd() < 0.6 ? 4 : 2; }
      else if (q < 0.5) { a.fromBufferAttribute(P, (rnd() * P.count) | 0).multiplyScalar(rnd()); tn[i] = 4; }
      else if (q < 0.85) { a.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(1.05 + rnd() * 0.2); tn[i] = 2; }
      else if (q < 0.9) { a.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(rnd() * 0.35); tn[i] = 3; }
      else { a.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(9); tn[i] = 2; }
      a.toArray(pos, i * 3);
    }
    return { pos, tn };
  })();
  const beads = (() => {
    const pos = new Float32Array(N * 3), tn = new Float32Array(N), a = new T.Vector3();
    const C = [[-3.4, 0.15, 2], [0, 0, 3], [3.4, -0.1, 4], [6.8, 0.2, 2]];
    for (let i = 0; i < N; i++) {
      if (rnd() < 0.82) {
        const c = C[(rnd() * C.length) | 0];
        a.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(1.15 * Math.cbrt(0.55 + rnd() * 0.45));
        a.x += c[0]; a.y += c[1]; tn[i] = c[2] === 3 ? (rnd() < 0.85 ? 3 : 1) : rnd() < 0.7 ? c[2] : 4;
      } else { const x = -7 + rnd() * 16; a.set(x, 0.55 * Math.sin(x * 0.7) + x * 0.06 + (rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.2); tn[i] = 1; }
      a.toArray(pos, i * 3);
    }
    return { pos, tn };
  })();
  const SHAPES = { tiger: tigerSide(false), tiger2: tigerSide(true), ring, bangle, ruby, beads, face: tigerFace() };

  // ── Dots ──
  const geo = new T.BufferGeometry();
  const aA = new Float32Array(N * 3), aB = new Float32Array(N * 3), aTone = new Float32Array(N * 2), aRand = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const d = new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.4 + rnd()); aRand.set([d.x, d.y, d.z, rnd()], i * 4); }
  geo.setAttribute("position", new T.BufferAttribute(aA, 3));
  geo.setAttribute("aB", new T.BufferAttribute(aB, 3));
  geo.setAttribute("aTone", new T.BufferAttribute(aTone, 2));
  geo.setAttribute("aRand", new T.BufferAttribute(aRand, 4));
  const col = (v) => new T.Color().setRGB(...TG.rgb(v).map((n) => n / 255), T.SRGBColorSpace);

  // ── Cursor handprint ── a 192×128 board where light stains the spot the cursor passed and cools with a 0.7s time constant. Each dot reads the value at its own spot and brightens
  const trail = (() => {
    const W = 192, H = 128, heat = new Float32Array(W * H), bytes = new Uint8Array(W * H);
    const tex = new T.DataTexture(bytes, W, H, T.RedFormat);
    tex.minFilter = tex.magFilter = T.LinearFilter; tex.needsUpdate = true;
    let last = 0, peak = 0, wipeAt = 0, px = 0, py = 0, had = false, ang = 0, speed = 0;
    const clear = () => { if (peak || had) { heat.fill(0); bytes.fill(0); tex.needsUpdate = true; } peak = 0; had = false; speed = 0; };
    // box = [x, y, width, height] (the area the plate covers), radius in the same unit. gain converts cursor speed (units/sec) into 0..1
    const paint = (time, box, x, y, radius, gain, on) => {
      const dt = last ? time - last : 1 / 30;
      if (dt < 1 / 30) return peak;
      last = time;
      const u = (x - box[0]) / box[2], v = (y - box[1]) / box[3], hit = on && u >= 0 && u <= 1 && v >= 0 && v <= 1;
      if (!hit && !peak) { had = false; return 0; }
      const cool = Math.exp(-dt / 0.7), ease = 1 - Math.exp(-Math.min(dt, 0.1) * 12);
      for (let i = 0; i < heat.length; i++) heat[i] *= cool;
      let vel = 0;
      if (hit && had) {
        const dx = x - px, dy = y - py; vel = Math.hypot(dx, dy) / Math.max(dt, 0.001);
        if (vel > 0.08) { const a = Math.atan2(dy, dx); ang += Math.atan2(Math.sin(a - ang), Math.cos(a - ang)) * ease; }
      }
      speed += (Math.min(1, vel * gain) - speed) * ease;
      if (hit) {
        px = x; py = y; had = true; wipeAt = time + 5;
        // Ellipse elongated in the direction of travel (up to 35% longer when fast, 85% on the sides), breathing ±7%
        const r = radius * (1 + 0.07 * Math.sin(time * 1.1)), ra = r * (1 + speed * 0.35), rb = r * 0.85, reach = ra * 1.65;
        const cx = Math.cos(ang), sy = Math.sin(ang), fill = 1 - Math.exp(-Math.min(dt, 0.1) * 9);
        const i0 = Math.max(0, Math.floor(((x - reach - box[0]) / box[2]) * W)), i1 = Math.min(W - 1, Math.ceil(((x + reach - box[0]) / box[2]) * W));
        const j0 = Math.max(0, Math.floor(((y - reach - box[1]) / box[3]) * H)), j1 = Math.min(H - 1, Math.ceil(((y + reach - box[1]) / box[3]) * H));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const dx = box[0] + ((i + 0.5) / W) * box[2] - x, dy = box[1] + ((j + 0.5) / H) * box[3] - y;
          const a = (dx * cx + dy * sy) / ra, b = (dy * cx - dx * sy) / rb, q = a * a + b * b;
          if (q > 2.6) continue;
          const k = j * W + i;
          heat[k] += (1 - heat[k]) * fill * Math.exp(-q * 1.5) * (1 - q / 2.6);
        }
      } else had = false;
      if (time > wipeAt) heat.fill(0);
      peak = 0;
      for (let i = 0; i < heat.length; i++) { if (heat[i] > peak) peak = heat[i]; bytes[i] = Math.round(heat[i] * 255); }
      if (peak < 0.001) { heat.fill(0); bytes.fill(0); peak = 0; }
      tex.needsUpdate = true;
      return peak;
    };
    return { tex, paint, clear };
  })();

  const uniforms = {
    uTrail: { value: trail.tex }, uTrailBox: { value: new T.Vector4(-3.1, -1.55, 6.2, 3.1) }, uTouch: { value: 0 }, uTrailScreen: { value: 0 },
    uPointer: { value: new T.Vector2() }, uSweep: { value: 0 },
    uMix: { value: 0 }, uScatter: { value: 1 }, uOpacity: { value: 0 }, uTime: { value: 0 }, uBirth: { value: 0 },
    uSize: { value: (mobile ? 3.4 : 3.0) * renderer.getPixelRatio() }, uEnamel: { value: 0 }, uPave: { value: 0 }, uVariant: { value: 0 },
    uGold: { value: col("--kf-accent") }, uGoldHi: { value: col("--kf-accent-text") }, uRuby: { value: col("--site-ruby") }, uCream: { value: col("--kf-ink") }, uDeep: { value: col("--site-burgundy") },
  };
  const mat = new T.ShaderMaterial({
    // Keep canvas alpha at 0 and only add color. The transparent canvas becomes additive compositing over the page, so no dark ring stays around the dots
    uniforms, transparent: true, depthWrite: false, blending: T.CustomBlending,
    blendEquation: T.AddEquation, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor,
    vertexShader: `
      attribute vec3 aB; attribute vec2 aTone; attribute vec4 aRand;
      uniform float uMix, uScatter, uTime, uSize, uBirth, uEnamel, uPave, uVariant;
      uniform vec3 uGold, uGoldHi, uRuby, uCream, uDeep;
      uniform sampler2D uTrail; uniform vec4 uTrailBox; uniform float uTouch, uTrailScreen, uSweep; uniform vec2 uPointer;
      varying vec3 vCol; varying float vGlint;
      vec3 tone(float t) {
        if (t < .5) return uGold; if (t < 1.5) return uGoldHi; if (t < 2.5) return uRuby; if (t < 3.5) return uCream;
        return mix(uRuby, uCream, .45);
      }
      void main() {
        float t = mix(aTone.x, aTone.y, step(.5, uMix));
        vec3 c = tone(t);
        // Finish: enamel turns the body deep red, pavé gives a cream sparkle — only on the tiger of the finish section
        c = mix(c, mix(uDeep * 1.6, uGoldHi, step(.5, t)), uEnamel * uVariant);
        c = mix(c, uCream, uPave * uVariant * .75);
        vec3 p = mix(position, aB, uMix);
        float sc = uScatter + (1. - uBirth);
        p += aRand.xyz * sc * 3.2 + vec3(sin(uTime * .3 + aRand.w * 6.28), cos(uTime * .25 + aRand.w * 9.), 0.) * .04 * (1. + sc * 4.);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        // Handprint: the first section reads the board from the tiger’s own spot (position.xy), interludes from the screen position. Edges are broken up with ripples so they don’t look like round smudges
        vec2 tuv = mix((position.xy - uTrailBox.xy) / uTrailBox.zw, gl_Position.xy / max(.01, gl_Position.w) * .5 + .5, uTrailScreen);
        float ripple = sin(position.x * 9. + uTime * .5) * sin(position.y * 11. - uTime * .4) * .1 * (1. - uTrailScreen);
        float touch = smoothstep(.10, .60, texture2D(uTrail, tuv).r - ripple) * uTouch;
        float spark = pow(max(0., sin(uTime * 1.5 + aRand.w * 240.)), 24.);
        // First section: only the gold dots lift to bright gold (ruby keeps its own color), and sparkles increase where touched
        c = mix(c, uGoldHi * 1.4, touch * (1. - step(1.5, t)) * (1. - uTrailScreen));
        c *= 1. + touch * mix(.45 + spark * 1.8, .8 + spark * 1.8, uTrailScreen);
        c += vec3(1., .72, .42) * touch * uTrailScreen * (.8 + spark * step(.975, aRand.w) * 5.5);
        // Interlude: the area around the cursor (cursor×3 spot) is 70% brighter
        vec2 wp = (modelMatrix * vec4(p, 1.)).xy - uPointer * 3.;
        c *= 1. + .7 * exp(-dot(wp, wp) * .45) * uSweep;
        float glint = step(.94 - uPave * uVariant * .06 - touch * .05, aRand.w);
        // The sparkle only slowly rises and falls in brightness, size unchanged — if large light dots pulsed, the whole screen would always look like it was heaving
        float tw = .7 + .3 * sin(uTime * (.8 + aRand.w * 1.5) + aRand.w * 40.);
        vGlint = glint * tw;
        gl_PointSize = uSize * (1. + glint * 6.) * (1. + touch * .35) * (6. / -mv.z);
        vCol = c * (.8 + .35 * tw);
      }`,
    fragmentShader: `
      uniform float uOpacity; varying vec3 vCol; varying float vGlint;
      void main() {
        vec2 q = gl_PointCoord - .5; float d = length(q);
        float core = smoothstep(.5, .0, d);
        float a = mix(pow(core, 1.6), pow(core, 3.) * 1.4, vGlint);
        gl_FragColor = vec4(vCol * a * uOpacity * (1. + vGlint * 1.5), 0.);
      }`,
  });
  const points = new T.Points(geo, mat);
  points.frustumCulled = false;
  const group = new T.Group(); group.add(points); scene.add(group);

  // Dot light at the touch-trace spot spreads widely around it (in the original the post-process bloom grows with touch strength) — a panel of tiger-spot density × the touch trace spread wide and added
  const HALO = 1.7, heroBoxV = uniforms.uTrailBox.value.clone();
  const density = (() => {
    const W = 48, H = 24, n = new Float32Array(W * H), d = new Uint8Array(W * H), p = SHAPES.tiger.pos;
    for (let i = 0; i < N; i++) {
      const x = Math.floor(((p[i * 3] - heroBoxV.x) / heroBoxV.z) * W), y = Math.floor(((p[i * 3 + 1] - heroBoxV.y) / heroBoxV.w) * H);
      if (x >= 0 && x < W && y >= 0 && y < H) n[y * W + x]++;
    }
    const top = Math.max(...n) * 0.45;
    for (let i = 0; i < n.length; i++) d[i] = Math.min(255, Math.round((n[i] / top) * 255));
    const t = new T.DataTexture(d, W, H, T.RedFormat); t.minFilter = t.magFilter = T.LinearFilter; t.needsUpdate = true;
    return t;
  })();
  const haloU = { uTrail: uniforms.uTrail, uDensity: { value: density }, uBox: { value: heroBoxV }, uGlow: { value: 0 }, uOpacity: uniforms.uOpacity };
  const halo = new T.Mesh(new T.PlaneGeometry(heroBoxV.z + HALO * 2, heroBoxV.w + HALO * 2), new T.ShaderMaterial({
    uniforms: haloU, transparent: true, depthWrite: false, depthTest: false, blending: T.CustomBlending,
    blendEquation: T.AddEquation, blendSrc: T.OneFactor, blendDst: T.OneFactor, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor,
    vertexShader: `uniform vec4 uBox; varying vec2 vT; void main() { vT = (position.xy - uBox.xy) / uBox.zw; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `
      uniform sampler2D uTrail, uDensity; uniform vec4 uBox; uniform float uGlow, uOpacity; varying vec2 vT;
      float lit(vec2 q) { vec2 in01 = step(vec2(0.), q) * step(q, vec2(1.)); return texture2D(uTrail, q).r * texture2D(uDensity, q).r * in01.x * in01.y; }
      void main() {
        float g = lit(vT) * .5;
        for (int k = 0; k < 10; k++) {
          float a = float(k) * .6283;
          vec2 dir = vec2(cos(a), sin(a));
          g += lit(vT + dir * .45 / uBox.zw) * .9 + lit(vT + dir * .95 / uBox.zw) * .7 + lit(vT + dir * 1.5 / uBox.zw) * .45;
        }
        g = 1. - exp(-g * .28);
        gl_FragColor = vec4(vec3(1., .66, .3) * g * uGlow * uOpacity, 0.);
      }`,
  }));
  halo.frustumCulled = false; halo.renderOrder = -1; group.add(halo);

  let curA = "", curB = "";
  const use = (a, b) => {
    if (a === curA && b === curB) return;
    if (a !== curA) { aA.set(SHAPES[a].pos); geo.attributes.position.needsUpdate = true; for (let i = 0; i < N; i++) aTone[i * 2] = SHAPES[a].tn[i]; }
    if (b !== curB) { aB.set(SHAPES[b].pos); geo.attributes.aB.needsUpdate = true; for (let i = 0; i < N; i++) aTone[i * 2 + 1] = SHAPES[b].tn[i]; }
    geo.attributes.aTone.needsUpdate = true;
    curA = a; curB = b;
  };
  use("tiger", "ring");

  // ── Scroll → scene ──
  const zt = (a, b, t) => { const n = Math.min(1, Math.max(0, (t - a) / (b - a))); return n * n * (3 - 2 * n); };
  // Measured late so it reflects the offset at that spot even if the collection pin (index.js) is created afterward
  const st = (id, start, end) => ScrollTrigger.create({ trigger: `#${id}`, start, end, refreshPriority: -1 });
  const S = {
    hero: st("hero", "top top", "bottom bottom"), manifesto: st("manifesto", "top bottom", "bottom top"),
    macro: st("macro", "top bottom", "bottom top"), cuff: st("cuff", "top top", "bottom bottom"),
    variants: st("variants", "top bottom", "bottom top"), ruby: st("follow-the-light", "top top", "bottom bottom"),
    beads: st("in-the-atelier", "top top", "bottom bottom"), closing: st("closing-tiger", "top bottom", "bottom bottom"),
    lookbook: st("lookbook", "top bottom", "bottom top"),
  };
  TG.particles = { uniforms, S };
  const cam = new T.Vector3(), rot = new T.Euler();

  // ── Cursor ── mouse only (the original ignores touch too). Doesn’t listen if reduced motion is on ──
  const ptr = { ndc: new T.Vector2(), on: false, seen: false };
  const ZERO = new T.Vector2(), view = new T.Vector2(), light = new T.Vector2(), mouse = new T.Vector3(), hitAt = new T.Vector3();
  const ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 0, 1), 0), heroBox = [-3.1, -1.55, 6.2, 3.1], screenBox = [0, 0, 0, 0];
  let presence = 0, trailMode = "", prevT = 0;
  if (!reduce) {
    addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; ptr.ndc.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2); ptr.on = true; });
    addEventListener("pointerout", (e) => { if (!e.relatedTarget) ptr.on = ptr.seen = false; });
    addEventListener("blur", () => { ptr.on = ptr.seen = false; });
  }
  const pointerStep = (time) => {
    const u = uniforms, dt = Math.min(0.1, Math.max(0, time - prevT)); prevT = time;
    const hero = curA === "tiger", inter = (curA === "ruby" || curA === "beads") && u.uOpacity.value > 0.003;
    const mode = hero ? "hero" : inter ? "inter" : "";
    if (mode !== trailMode) { trail.clear(); trailMode = mode; ptr.seen = false; haloU.uGlow.value = 0; }
    halo.visible = hero && haloU.uGlow.value > 0.001;
    view.lerp(inter && ptr.on ? ptr.ndc : ZERO, 1 - Math.exp(-dt * 7));
    if (ptr.on) light.lerp(ptr.ndc, 1 - Math.exp(-dt * 12));
    presence += ((ptr.on ? 1 : 0) - presence) * (1 - Math.exp(-dt * 9));
    u.uSweep.value = inter ? 1 : 0; u.uPointer.value.copy(light);
    if (hero) {
      // Ask only while all the tigers are gathered, before they scatter. Cursor is z=0 moves to a spot above the panel and follows at 12/s
      const ready = ptr.on && u.uBirth.value > 0.75 && u.uMix.value < 0.02 && u.uScatter.value < 0.01;
      if (ptr.on) {
        ray.setFromCamera(ptr.ndc, camera);
        if (ray.ray.intersectPlane(plane, hitAt)) { if (!ptr.seen) { mouse.copy(hitAt); ptr.seen = true; } mouse.lerp(hitAt, 1 - Math.exp(-dt * 12)); }
      }
      // Original radius .85 · speed share .25 are based on field of view 42 — matched to the screen size of the copy’s field of view 35 as .70 and .30
      // Bloom strength is reduced as the panel value already decays — multiplying the top value again cools it twice and fades faster than the original (0.7s time constant)
      const peak = trail.paint(time, heroBox, mouse.x, mouse.y, 0.7, 0.3, ready && ptr.seen);
      haloU.uGlow.value = Math.min(1, peak / 0.2) * (1 - u.uMix.value) * (1 - u.uScatter.value);
      u.uTrailBox.value.fromArray(heroBox); u.uTrailScreen.value = 0; u.uTouch.value = u.uBirth.value * (1 - u.uMix.value);
    } else if (inter) {
      // The interlude is placed in screen space (height 8 units) — radius 2.08 is 26% of the screen height
      const a = innerWidth / innerHeight;
      screenBox[0] = -4 * a; screenBox[1] = -4; screenBox[2] = 8 * a; screenBox[3] = 8;
      trail.paint(time, screenBox, light.x * 4 * a, light.y * 4, 2.08, 0.1, ptr.on && presence > 0.01);
      u.uTrailBox.value.fromArray(screenBox); u.uTrailScreen.value = 1; u.uTouch.value = presence;
    } else u.uTouch.value = 0;
  };

  const state = () => {
    const y = scrollY, u = uniforms, f = fit();
    const inR = (s) => y >= s.start - 1 && y <= s.end + 1;
    rot.set(0, 0, 0); u.uVariant.value = 0;
    if (y <= S.hero.end) {
      const m = S.hero.progress, g = zt(0.42, 0.83, m);
      use("tiger", "ring");
      u.uMix.value = g; u.uScatter.value = zt(0.1, 0.64, m) * (1 - g); u.uOpacity.value = 1 - zt(0.96, 1, m) * 0.55;
      cam.set(-0.18 * Math.sin(m * Math.PI), 0.08 * g, (6 - 0.7 * g) * f);
    } else if (y < S.macro.start) {
      use("ring", "ring"); u.uMix.value = 0; u.uScatter.value = 0; u.uOpacity.value = 0.45;
      cam.set(0, 0.08, 5.3 * f); rot.set(0.12 * Math.sin(u.uTime.value * 0.2), u.uTime.value * 0.08, 0);
    } else if (y <= S.macro.end) {
      const m = S.macro.progress, a = zt(0.12, 0.59, m), g = zt(0.58, 0.78, m), p = zt(0.78, 0.98, m);
      use("ring", "ring"); u.uMix.value = 0;
      u.uScatter.value = (1 - zt(0, 0.12, m)) * 0.6; u.uOpacity.value = zt(0, 0.12, m) * (1 - zt(0.9, 1, m));
      cam.set(0.08 * g, 0.05 * g, (6.2 - 3.2 * g - 4 * p) * f); rot.set(Math.sin(a * Math.PI * 2) * 0.24, Math.PI * 2 * a, 0);
    } else if (inR(S.cuff)) {
      const p = S.cuff.progress, k = Math.min(1, p / 0.68), as = zt(0.01, 0.22, k), turn = zt(0.28, 0.73, k), dive = zt(0.78, 1, k);
      const l = mobile ? Math.max(1.2, 1.05 / (innerWidth / innerHeight)) : Math.max(1, 1.55 / (innerWidth / innerHeight));
      use("bangle", "bangle"); u.uMix.value = 0;
      u.uScatter.value = Math.max(1 - as, zt(0.8, 1, k)); u.uOpacity.value = zt(0, 0.065, k) * (1 - zt(0.94, 1, k));
      cam.set(mobile ? 0 : -1.15 * l * (1 - dive), mobile ? -0.72 * l * (1 - dive) : 0.04, (7.5 - dive * 5.7) * l * 0.82);
      rot.set(Math.sin(turn * Math.PI * 2) * 0.32, Math.PI * 2 * turn, Math.sin(turn * Math.PI * 2) * 0.12);
    } else if (inR(S.variants)) {
      const m = S.variants.progress, x = m * 3.8, h = 2.8 * 0.6;
      const p = x < h ? x / 2.8 : x < h + 1 ? 0.6 : (x - 1) / 2.8;
      use("tiger2", "tiger2"); u.uMix.value = 0; u.uVariant.value = 1;
      u.uScatter.value = 1 - zt(0.32, 0.52, p); u.uOpacity.value = zt(0, 0.25, p) * (1 - zt(0.8, 1, p));
      cam.set(0, 0.18 + 0.35, (6.5 - 0.6 * Math.sin(p * Math.PI)) * Math.max(1, 1.02 / (innerWidth / innerHeight)));
      rot.set(0, (p - 0.5) * 0.22 * (1 - zt(0.66, 1, p)), 0);
      document.querySelector(".tg-variants__stage").style.opacity = String(1 - zt(0.64, 0.79, p));
    } else if (inR(S.ruby)) {
      const p = S.ruby.progress;
      use("ruby", "ruby"); u.uMix.value = 0;
      u.uScatter.value = Math.max(1 - zt(0, 0.14, p), zt(0.86, 1, p)); u.uOpacity.value = zt(0, 0.04, p) * (1 - zt(0.95, 1, p));
      // The viewpoint is pushed toward the cursor: .55/.38 at the front, .2/.1 toward the end
      const q = zt(0.6, 1, p);
      cam.set(view.x * (0.55 - 0.35 * q), view.y * (0.38 - 0.28 * q), (5.6 - 1.4 * zt(0.3, 0.8, p)) * f); rot.set(0.35 * Math.sin(p * 3), p * Math.PI * 1.5, 0.1);
    } else if (inR(S.beads)) {
      const p = S.beads.progress;
      use("beads", "beads"); u.uMix.value = 0;
      u.uScatter.value = Math.max(1 - zt(0, 0.14, p), zt(0.9, 1, p)); u.uOpacity.value = zt(0, 0.04, p) * (1 - zt(0.95, 1, p));
      // In the original the camera path is 16 with a cursor share of 2/1.1 — fit to the copy’s path of 7.2 as .9/.5
      cam.set(-2.4 + p * 7.2 + view.x * 0.9, 0.1 + view.y * 0.5, 4.6 * f); rot.set(0, 0, -0.06);
    } else if (y >= S.closing.start) {
      const p = S.closing.progress;
      use("face", "face"); u.uMix.value = 0;
      u.uScatter.value = Math.max(1 - zt(0.18, 0.45, p), zt(0.82, 0.98, p) * 0.8); u.uOpacity.value = zt(0.12, 0.3, p) * (1 - zt(0.9, 1, p) * 0.7);
      cam.set(0, 0.3, (5.4 - 0.5 * zt(0.3, 0.8, p)) * f);
    } else u.uOpacity.value = 0;
  };

  // Hero: when the loader opens, particles are born (1.8s power2.out) and the camera approaches from 9.2→6 over 2.6s power3.out
  const entrance = gsap.timeline({ paused: true });
  entrance.to(uniforms.uBirth, { value: 1, duration: reduce ? 0 : 1.8, ease: "power2.out" }, 0)
    .to(TG.introCam = { z: 9.2 }, { z: 6, duration: reduce ? 0 : 2.6, ease: "power3.out" }, 0)
    .fromTo(".tg-hero__copy", { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 1.1, ease: "power2.out" }, 0.35);
  TG.onReveal.push(() => entrance.play());

  // Closing button: the color changes over 1.5s power2.inOut
  const btns = [...document.querySelectorAll(".tg-variants__btn")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((o) => { o.classList.toggle("is-active", o === b); o.setAttribute("aria-pressed", String(o === b)); });
    gsap.to(uniforms.uEnamel, { value: b.dataset.variant === "enamel" ? 1 : 0, duration: 1.5, ease: "power2.inOut" });
    gsap.to(uniforms.uPave, { value: b.dataset.variant === "pave" ? 1 : 0, duration: 1.5, ease: "power2.inOut" });
  }));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener("resize", resize); resize();
  // Putting up the shader and handprint panel on the first cursor move freezes the screen — load it ahead when building
  renderer.compile(scene, camera); renderer.initTexture(trail.tex);
  gsap.ticker.add((time) => {
    if (!reduce) uniforms.uTime.value = time;
    state();
    if (!reduce) pointerStep(time);
    // At the very top of the first section, the incoming camera wins
    if (scrollY <= 2 && TG.introCam.z > 6.01) cam.z = TG.introCam.z * fit();
    camera.position.lerp(cam, 0.18); camera.lookAt(0, cam.y * 0.5, 0);
    group.rotation.x += (rot.x - group.rotation.x) * 0.18; group.rotation.y += (rot.y - group.rotation.y) * 0.18; group.rotation.z += (rot.z - group.rotation.z) * 0.18;
    canvas.style.visibility = uniforms.uOpacity.value > 0.003 ? "visible" : "hidden";
    // The interlude is an opaque stage that covers the previous section’s particles, and interlude particles rise above that stage
    canvas.classList.toggle("is-over", (curA === "ruby" || curA === "beads") && uniforms.uOpacity.value > 0.003);
    if (uniforms.uOpacity.value > 0.003) renderer.render(scene, camera);
  });
})();
