// Color orb (original MainGL · LowerKvGL — three shader metaballs): the original shader isn’t used, it is redrawn with our own shader.
// Blob graphics (.v-blob) are only given position and size and hidden — movement follows exactly as the timelines in index.js and shared.js move and scale the graphic.
// Each frame, read each element’s position, size and color and paint them as metaballs that pull toward each other and melt together, and while the mass shrinks to .45×, four small balls per ball scatter and return.
// Hero is a world of 33 balls like the original — in the opening scene (index.js drives the V.open value) the logo SDF swells, the center ball swallows the logo,
// Step 1: six balls are pushed out from the center, the remaining balls swell in order of distance and turn from round to triangular, while the world goes from 2.5x → 1x and rotates 90° into place.
(() => {
  const T = window.THREE;
  if (!T) return;
  // 33 Hero balls (original layout values): [x, y, radius, color, phone x, phone y] — one unit = Half of the screen’s long edge, up on y, item 0 is the center ball.
  // Slots 0~4 hold copy block boxes (teal · red · purple · yellow · yellow2) so read the boxes, from slot 5 on, place at original scale
  const WORLD = [
    [0, 0, 0.45, "teal"], [-0.84, 0.61, 0.25, "red"], [-1.5, -0.13, 0.3, "purple"], [-0.82, -0.81, 0.45, "yellow"], [0.45, 0.75, 0.25, "yellow"],
    [0.9, -0.26, 0.3, "red"], [0.28, -0.8, 0.25, "purple"],
    [-0.3, 1.1, 0.3, "purple", 0, 1.3], [-1.8, 0.95, 0.45, "purple"], [-2.1, -0.55, 0.25, "teal"], [1.2, 0.45, 0.3, "teal"], [1.15, -1, 0.3, "teal"],
    [1, 1.4, 0.3, "red"], [1.7, 0.9, 0.25, "yellow"], [2.3, 0.25, 0.45, "red"], [1.7, -0.4, 0.3, "purple"], [2.1, -1.5, 0.25, "red"],
    [-1, 1.6, 0.3, "teal"], [-2.4, 0.25, 0.25, "yellow"], [-1.75, -1.2, 0.25, "red"], [-0.5, -1.6, 0.25, "teal"], [0.7, -1.6, 0.25, "yellow"],
    [-2.5, 1.5, 0.3, "red"], [-3, 0.85, 0.3, "teal"], [-2.5, -1.45, 0.3, "yellow"], [-2.85, -0.75, 0.3, "purple"], [-3.5, 0, 0.45, "red"],
    [-3.5, 1.5, 0.25, "purple"], [-3.5, -1.5, 0.25, "teal"], [2.5, -0.8, 0.25, "yellow"],
    [2.3, 1.45, 0.25, "purple"], [2.9, 1, 0.3, "teal"], [3.3, 0.2, 0.25, "purple"],
  ];
  const ANCHORS = ["teal", "red", "purple", "yellow", "yellow2"];
  // The value after the opening scene ends — also this spot when there is no opening scene (reduced motion · before the second visit).
  const FINAL = { logo: 1, logoRot: 1, center: 1, level1: 1, other: 1, tri: 1, shift: 1, zoom: 0, turn: 0, fade: 1 };

  // On the hero the phone scene moves the outer box (.v-kv__b) and the focus shift scales the inner image. Subpage headers place the image directly
  const kv = document.querySelector(".v-kv__stage");
  if (kv) field(kv, ANCHORS.map((n) => kv.querySelector(`.v-kv__b[data-b="${n}"]`)).filter(Boolean), true);
  const sub = document.querySelector(".v-subhero");
  if (sub) field(sub, [...sub.querySelectorAll(":scope > .v-blob")], false);

  // Bake the SDF from our placeholder logo (the pebble of the header logo) — same ratio as the original logo SDF (.41 × .32 of the panel, centered) and same slope (edge .5, ±4 per 1 panel unit)
  function logoSdf() {
    const S = 256, path = document.querySelector(".v-logo__blob");
    const vb = path?.ownerSVGElement?.viewBox.baseVal;
    if (!path || !vb) return null;
    const box = path.getBBox(), cv = document.createElement("canvas");
    cv.width = cv.height = S;
    const g = cv.getContext("2d", { willReadFrequently: true });
    const sc = Math.min((0.41 * S) / box.width, (0.32 * S) / box.height);
    g.translate(S / 2, S / 2);
    g.scale(sc, sc);
    g.translate(-(box.x + box.width / 2), -(box.y + box.height / 2));
    g.fill(new Path2D(path.getAttribute("d")));
    const px = g.getImageData(0, 0, S, S).data, inside = new Uint8Array(S * S);
    for (let i = 0; i < S * S; i++) inside[i] = px[i * 4 + 3] > 127 ? 1 : 0;
    // Distance to the nearest opposite pixel for inside and outside each (squared distance transform done twice, horizontally and vertically)
    const edt = (on) => {
      const INF = 1e10, d = new Float64Array(S * S), f = new Float64Array(S), v = new Int32Array(S), z = new Float64Array(S + 1), o = new Float64Array(S);
      for (let i = 0; i < S * S; i++) d[i] = inside[i] === on ? 0 : INF;
      const pass = (get, set) => {
        for (let q = 0; q < S; q++) f[q] = get(q);
        let k = 0;
        v[0] = 0; z[0] = -INF; z[1] = INF;
        for (let q = 1; q < S; q++) {
          let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
          while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
          k++; v[k] = q; z[k] = s; z[k + 1] = INF;
        }
        k = 0;
        for (let q = 0; q < S; q++) { while (z[k + 1] < q) k++; o[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
        for (let q = 0; q < S; q++) set(q, o[q]);
      };
      for (let x = 0; x < S; x++) pass((q) => d[q * S + x], (q, val) => (d[q * S + x] = val));
      for (let y = 0; y < S; y++) pass((q) => d[y * S + q], (q, val) => (d[y * S + q] = val));
      return d;
    };
    const toOut = edt(0), toIn = edt(1), data = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, dist = inside[i] ? Math.sqrt(toOut[i]) : -Math.sqrt(toIn[i]);
      // Flips the plate upside down (texture v runs bottom to top)
      data[((S - 1 - y) * S + x) * 4 + 3] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + (4 * dist) / S)));
    }
    const tex = new T.DataTexture(data, S, S, T.RGBAFormat);
    tex.minFilter = tex.magFilter = T.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  function field(stage, anchors, world) {
  if (!anchors.length) return;
  const NA = anchors.length, N = world ? WORLD.length : NA, SAT = 4;
  const sdf = world ? logoSdf() : null;

  // Paint one dot of a CSS color (oklch and color-mix included) on a canvas and read it back as rgb — change the skin and the ball color changes with it
  const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  probe.style.display = "none";
  stage.append(probe);
  const rgbOf = (tone) => {
    probe.style.color = `var(--site-${tone})`;
    dot.clearRect(0, 0, 1, 1);
    dot.fillStyle = getComputedStyle(probe).color;
    dot.fillRect(0, 0, 1, 1);
    const d = dot.getImageData(0, 0, 1, 1).data;
    return new T.Vector3(d[0] / 255, d[1] / 255, d[2] / 255);
  };
  const tones = {};
  ["teal", "yellow", "red", "purple"].forEach((t) => (tones[t] = rgbOf(t)));

  const canvas = document.createElement("canvas");
  canvas.className = "v-kv__gl";
  canvas.setAttribute("aria-hidden", "true");
  stage.prepend(canvas);
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
  // Original ratio .85 — draw at a slightly lower pixel density
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * 0.85);
  renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uni = {
    uRes: { value: new T.Vector2(1, 1) },
    uBall: { value: Array.from({ length: N }, () => new T.Vector4()) },
    uCol: { value: Array.from({ length: N }, () => new T.Vector3()) },
    uSeed: { value: Array.from({ length: N }, (_, i) => i * 1.7 + 0.4) },
    uScatter: { value: 0 },
    uTime: { value: 0 },
    uTri: { value: 1 },
    uAlpha: { value: 1 },
    uLogo: { value: new T.Vector3() },
    uLogoM: { value: new T.Vector4() },
    uSdf: { value: sdf },
  };
  const mat = new T.ShaderMaterial({
    uniforms: uni,
    transparent: true,
    premultipliedAlpha: true,
    vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      #define N ${N}
      #define NA ${NA}
      #define SAT ${SAT}
      #define LOGO ${sdf ? 1 : 0}
      uniform vec2 uRes;
      uniform vec4 uBall[N];
      uniform vec3 uCol[N];
      uniform float uSeed[N];
      uniform float uScatter;
      uniform float uTime;
      uniform float uTri;
      uniform float uAlpha;
      uniform vec3 uLogo;
      uniform vec4 uLogoM;
      uniform sampler2D uSdf;
      // Field of one ball: a three-lobed ball with its edge distorted by angle — as in the original, a triangle wave where the radius cycles between .7 and 1x (the average equals the cell size),
      // When tri is 0 it is a round ball (the original opening scene’s round ball → triangular ball)
      float ball(vec2 p, vec2 c, vec2 r, float seed, float tri) {
        vec2 d = (p - c) / r;
        float q = dot(d, d);
        vec2 n = d * inversesqrt(q + 1e-6);
        // Use direction components instead of angles: cos(2a+s) and cos(3a+φ) — no atan or sin computed per pixel
        float c2 = n.x * n.x - n.y * n.y, s2 = 2.0 * n.x * n.y;
        float c3 = n.x * (4.0 * n.x * n.x - 3.0), s3 = n.y * (3.0 - 4.0 * n.y * n.y);
        float ph = uTime * 0.3 - seed * 1.3;
        float wob = 1.0 + tri * (0.07 * (c2 * cos(seed) - s2 * sin(seed)) + 0.176 * (c3 * cos(ph) - s3 * sin(ph)));
        float v = 1.0 / (q / (wob * wob) + 1e-4);
        // If the value grows endlessly at the center, the color weight (value²) overflows and dots appear — kept inside the boundary (1), so the shape is unchanged
        v = min(v, 30.0);
        return v * v;
      }
      void main() {
        vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
        float field = 0.0, wsum = 0.0;
        vec3 col = vec3(0.0);
        for (int i = 0; i < N; i++) {
          vec4 b = uBall[i];
          if (b.z < 1.0) continue;
          float f = ball(p, b.xy, b.zw, uSeed[i], i == 0 ? 1.0 : uTri);
          float w = f * f;
          field += f; col += uCol[i] * w; wsum += w;
          // Small scattering balls — pop out around the big ball only while it moves
          if (i < NA && uScatter > 0.001) for (int k = 0; k < SAT; k++) {
            float fk = float(k);
            float ang = uSeed[i] * 2.3 + fk * 1.5708 + uTime * 0.15;
            float dist = (1.05 + 0.22 * fk) * uScatter;
            vec2 c = b.xy + vec2(cos(ang), sin(ang)) * b.zw * dist;
            vec2 r = b.zw * (0.22 + 0.05 * mod(fk, 2.0)) * uScatter;
            if (r.x < 1.0) continue;
            float fs = ball(p, c, r, uSeed[i] + fk, 1.0);
            float ws = fs * fs;
            field += fs; col += uCol[i] * ws; wsum += ws;
          }
        }
        #if LOGO
        // Logo SDF — sticks to the center ball position and rotates and grows with the world. Added twice so the edge (.5) lands on the ball boundary (1)
        if (uLogo.z > 0.5) {
          vec2 d = p - uLogo.xy;
          vec2 t = vec2(dot(uLogoM.xy, d), dot(uLogoM.zw, d)) + 0.5;
          if (t.x > 0.0 && t.y > 0.0 && t.x < 1.0 && t.y < 1.0) {
            float lf = 2.0 * smoothstep(0.0, 1.0, texture2D(uSdf, t).a);
            float lw = lf * lf;
            field += lf; col += uCol[0] * lw; wsum += lw;
          }
        }
        #endif
        float edge = fwidth(field) * 1.2 + 1e-4;
        float a = smoothstep(1.0 - edge, 1.0 + edge, field) * uAlpha;
        gl_FragColor = vec4(col / max(wsum, 1e-6) * a, a);
      }`,
  });
  scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
  stage.classList.add("is-gl");
  // First child inside the cell (the cell itself if the image is the cell)
  const blobOf = (a) => (a.classList.contains("v-blob") ? a : a.querySelector(".v-blob") || a);

  // World → screen: original scale (one unit = long side half) and the sideways shift at the end of the opening scene — on desktop, world 0,0 sits at (.33, -.06) units like the original.
  // On phones the copy’s cell layout differs from the original world, so world 0,0 is pinned to the center ball cell (so only the top ball 7 shows on screen, like the original phone).
  // Radius follows the original ball boundary (exp(-(d/r)^4) = .5 at .91r times the triangular average .85 gives .78r) and moves there
  let map = null;
  const fit = () => {
    if (!world) return;
    const W = stage.clientWidth, H = stage.clientHeight, Uc = Math.max(W, H) / 2, t = anchors[0];
    map = W <= 820
      ? { U: Uc, ax: t.offsetLeft + t.offsetWidth / 2, ay: t.offsetTop + t.offsetHeight / 2, k: 0.78 }
      : { U: Uc, ax: W / 2 + 0.33 * Uc, ay: H / 2 + 0.06 * Uc, k: 0.78 };
  };
  const size = () => {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    uni.uRes.value.set(r.width * renderer.getPixelRatio(), r.height * renderer.getPixelRatio());
    fit();
  };
  new ResizeObserver(size).observe(stage);
  size();

  // Size and position are read from the blob drawing (.v-blob) — focus moves change the drawing’s scale, and the phone scene moves the outer cell (.v-kv__b)
  const blobs = anchors.map(blobOf);
  const P = Array.from({ length: N }, () => [0, 0, 0, 0]), C = Array.from({ length: N }, () => new T.Vector3());
  const ss = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const read = () => {
    const s = stage.getBoundingClientRect(), pr = renderer.getPixelRatio();
    let shrink = 0, scale = 0;
    blobs.forEach((b, i) => {
      const r = b.getBoundingClientRect(), k = +gsap.getProperty(b, "scale") || 0;
      P[i] = [r.left - s.left + r.width / 2, r.top - s.top + r.height / 2, r.width / 2, r.height / 2];
      C[i].copy(tones[b.dataset.tone] || tones.teal);
      shrink = Math.max(shrink, 1 - k);
      scale += k / NA;
    });
    // As the mass shrinks 1 → .45 (0 → 1), small balls scatter
    uni.uScatter.value = Math.min(1, Math.max(0, shrink / 0.55));
    canvas.style.opacity = getComputedStyle(anchors[0]).opacity;
    if (world && map) {
      const W = s.width, H = s.height, Uc = Math.max(W, H) / 2, sp = W <= 820, o = window.V?.open || FINAL;
      // Remaining balls stand at world positions and breathe at the same scale as the mass
      for (let i = NA; i < N; i++) {
        const [x, y, r, tone, xs, ys] = WORLD[i], ux = sp && xs != null ? xs : x, uy = sp && ys != null ? ys : y;
        const rr = r * map.U * map.k * scale;
        P[i] = [map.ax + map.U * ux, map.ay - map.U * uy, rr, rr];
        C[i].copy(tones[tone]);
      }
      // Opening scene — apply the original MainGL’s world transform in reverse to the screen position: from the end position c push by (1-shift)·D, divide by 1+1.5·zoom, rotate 90°·turn.
      // D is set so the center ball sits at the logo spot at first (desktop screen center, 40% height on phone)
      const toC = (q) => [(q[0] - W / 2) / Uc, -(q[1] - H / 2) / Uc];
      const k = 1 + 1.5 * o.zoom, ca = Math.cos((Math.PI / 2) * o.turn), sa = Math.sin((Math.PI / 2) * o.turn);
      const c0 = toC(P[0]), start = sp ? [0.5, 0] : [0, 0], D = [start[0] - c0[0], start[1] - c0[1]];
      const m = 1 - o.shift, z0 = [c0[0] + m * D[0], c0[1] + m * D[1]], opening = o.shift < 1;
      // After the opening scene, the logo shrinks with the center ball slot and follows it down as it moves
      const follow = anchors[0].offsetWidth ? Math.max((2 * P[0][2]) / anchors[0].offsetWidth, 1e-3) : 1;
      for (let i = 0; i < N; i++) {
        const c = toC(P[i]);
        let x = c[0] + m * D[0], y = c[1] + m * D[1], g = 1;
        if (i === 0) g = o.center;
        else if (i < 7) { x = z0[0] + (x - z0[0]) * o.level1; y = z0[1] + (y - z0[1]) * o.level1; g = o.level1; }
        else g = ss(0, 1, o.other * 2.5 - Math.min(1, Math.hypot(WORLD[i][0], WORLD[i][1]) / 2.5));
        // Balls beside the center ball (within .2~.3 units) come out attached in the center ball’s color
        if (i && opening) C[i].lerpVectors(C[0], C[i], ss(0.2, 0.3, Math.hypot(x - z0[0], y - z0[1])));
        const rx = (P[i][2] * g) / k, ry = (P[i][3] * g) / k;
        P[i] = [W / 2 + ((ca * x - sa * y) / k) * Uc, H / 2 - ((sa * x + ca * y) / k) * Uc, rx, ry];
        // World balls more than three radii off screen add nothing to the field, so they’re skipped when drawing
        if (i >= NA && (P[i][0] + 3 * rx < 0 || P[i][0] - 3 * rx > W || P[i][1] + 3 * ry < 0 || P[i][1] - 3 * ry > H)) P[i][2] = P[i][3] = 0;
      }
      // Logo: original plate size 1/(.86 + 10·(1-logo)) unit, own rotation 180°·logoRot + 90° stacked on the world rotation
      if (sdf) {
        const L = 0.86 + 10 * (1 - o.logo);
        const b = ((180 * o.logoRot + 90 - 90 * o.turn) * Math.PI) / 180, sc = (L * k) / (Uc * pr * follow);
        uni.uLogo.value.set(P[0][0] * pr, P[0][1] * pr, o.logo > 0.001 ? 1 : 0);
        uni.uLogoM.value.set(Math.cos(b) * sc, Math.sin(b) * sc, Math.sin(b) * sc, -Math.cos(b) * sc);
      }
      uni.uTri.value = o.tri;
      uni.uAlpha.value = Math.min(1, Math.max(0, o.logo)) * o.fade;
    }
    for (let i = 0; i < N; i++) {
      uni.uBall.value[i].set(P[i][0] * pr, P[i][1] * pr, P[i][2] * pr, P[i][3] * pr);
      uni.uCol.value[i].copy(C[i]);
    }
  };
  let on = true;
  new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(stage);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Draws at most 45 frames per second like the original MainGL
  let last = -1;
  const tick = (t) => {
    // The hero starts drawing only after index.js sets the opening scene value (V.open) — drawing earlier flashes the fully built world once
    if (!on || (world && document.readyState === "loading")) return;
    if (last >= 0 && t - last < 1 / 45) return;
    last = t;
    uni.uTime.value = reduce ? 0 : t;
    read();
    renderer.render(scene, camera);
  };
  // Shaders are precompiled when the world is built — compiling on the opening scene’s first frame would freeze the screen
  renderer.compile(scene, camera);
  gsap.ticker.add(tick);
  }
})();
