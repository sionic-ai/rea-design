// Endless Polaroid wall. Uses the original settings as they are: FOV 45 · camera z 5, 6 columns on desktop · 3 columns on phone (at 820px), cell height 1.1x,
// Photo width .5~.7 × 1.1 of the cell, sway .5, three depth layers (gap 1.2, wrapping within ±3), each horizontal full turn shifts the vertical by .382 turn,
// Border .035 · below 2.2x, hover lifts .12 · scales .16 (speed 9), press goes to distance 3.2 at 80% of the screen (.95s), inertia .92 · follow 1−.0015^dt,
// On entry the camera approaches from 6 behind over 1.8s power1.inOut, and the wall rises from 4 below over 3.2s power2.out.
// Added from the original settings: unoverlap photos (120 push-outs, margin .15), photo color correction (brightness 1.04 · saturation .94 · warmth .05, hover 1.06x),
// Six rising glass bubbles (pop on press and grow back), depth of field (focus z 1.68, focal length 3, bokeh 2.4 — our shader).
(() => {
  const T = THREE;
  const sr = window.sr;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("[data-canvas]");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(new T.Color(...sr.rgb("--kf-bg")), 1);
  const scene = new T.Scene();
  const FOV = 45, CAM_Z = 5;
  const camera = new T.PerspectiveCamera(FOV, 1, 0.1, 120);

  // ── Background: noise where light sky blue, white and light purple slowly blend (where the original Solar Flare preset sits) ──
  const bg = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      uT: { value: 0 }, uAspect: { value: 1 }, uFocus: { value: 0 },
      uLow: { value: new T.Color(...sr.rgb("--site-noise-low")) }, uHigh: { value: new T.Color(...sr.rgb("--site-noise-high")) },
      uLilac: { value: new T.Color(...sr.rgb("--site-lilac")) }, uVeil: { value: new T.Color(...sr.rgb("--site-lilac-veil")) },
      uPinkLow: { value: new T.Color(...sr.rgb("--site-slide-low")) }, uPinkHigh: { value: new T.Color(...sr.rgb("--site-slide-high")) },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float uT; uniform float uAspect; uniform float uFocus; uniform vec3 uLow, uHigh, uLilac, uVeil, uPinkLow, uPinkHigh;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
        return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for(int k=0;k<5;k++){ v += a*n(p); p *= 2.03; a *= .5; } return v; }
      void main(){
        vec2 p = vec2(vUv.x * uAspect, vUv.y) * 1.6;
        float a = fbm(p + vec2(uT*.03, -uT*.02));
        float b = fbm(p*1.7 - vec2(uT*.02, uT*.035) + a);
        // Light sky blue ↔ white noise (original BG_NOISE_LOW · HIGH) with pale purple-gray spreading from the end color.
        vec3 c = mix(uLow, uHigh, smoothstep(.25, .75, a));
        c = mix(c, uLilac, smoothstep(.3, .85, b) * .6);
        c = mix(c, uVeil, .25);
        // The zoomed screen uses the original slide background (SLIDE_BG_NOISE_LOW↔HIGH)
        vec3 pink = mix(uPinkLow, uPinkHigh, smoothstep(.3, .8, a));
        c = mix(c, pink * .97, uFocus);
        gl_FragColor = vec4(c, 1.);
      }`,
  }));
  bg.renderOrder = -10;
  bg.frustumCulled = false;
  scene.add(bg);

  // ── Photo placeholder: a gray panel labeled with what the photo shows (original photos are not used) ──
  // Most original photos are portrait shots taken on phones, so many portrait ratios are used
  const MEDIA = [
    [3 / 4, "Full-body animal · window natural light · portrait 3:4"], [3 / 4, "Animal face close-up · Soft indoor light · Portrait 3:4"],
    [9 / 16, "Animal on a bed · low angle · vertical 9:16"], [3 / 4, "Animal lying on the floor · white rug · portrait 3:4"],
    [4 / 3, "Animal in a cage · seen from above · landscape 4:3"], [3 / 4, "Animal hiding under a chair · shade · portrait 3:4"],
    [2 / 3, "Animal from behind · curtain backlight · portrait 2:3"], [9 / 16, "Animal lying on a sofa · afternoon sunlight · vertical 9:16"],
    [3 / 4, "Animal looking out the window · overcast day · portrait 3:4"], [1, "Moment of playing with a toy · blurry photo · square"],
    [3 / 4, "Sleeping animal · under a blanket · portrait 3:4"], [4 / 3, "Two side by side · living room · landscape 4:3"],
  ];
  const makeTex = ([a, label], i) => {
    const W = 512, H = Math.round(W / a);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grd = g.createLinearGradient(0, 0, W, H);
    const tint = [["--site-ph-1a", "--site-ph-1b"], ["--site-ph-2a", "--site-ph-2b"], ["--site-ph-3a", "--site-ph-3b"]][i % 3].map(sr.css);
    grd.addColorStop(0, tint[0]); grd.addColorStop(1, tint[1]);
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.strokeStyle = sr.css("--site-ph-line"); g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
    const lines = label.split(" · ");
    g.font = `500 30px ${sr.font("--kf-font-mono")}`;
    const lw = Math.max(...lines.map((l) => g.measureText(l).width)) + 36, lh = 40;
    g.fillStyle = tint[0];
    g.fillRect((W - lw) / 2, H / 2 - (lines.length * lh) / 2 - 12, lw, lines.length * lh + 24);
    g.fillStyle = sr.css("--site-ph-ink"); g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((l, k) => g.fillText(l, W / 2, H / 2 + (k - (lines.length - 1) / 2) * lh));
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.NoColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  };
  const textures = MEDIA.map(makeTex);

  const shadowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(64, 64, 10, 64, 64, 64);
    const sc = sr.css("--site-shadow");
    r.addColorStop(0, sc); r.addColorStop(1, sc.replace(/[\d.]+\)$/, "0)"));
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.colorSpace = T.NoColorSpace; return t;
  })();

  const BORDER = 0.035, BORDER_BOTTOM = 2.2, HOVER_ZOOM = 0.16, HOVER_LIFT = 0.12, HOVER_SPEED = 9;
  const tileVert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  // Color grading uses the original settings (PHOTO_BRIGHTNESS 1.04 · CONTRAST 1 · SATURATION .94 · WARMTH .05) — warmth first, then brightness, contrast, saturation
  const GRADE = { warmth: 0.05, brightness: 1.04, contrast: 1, saturation: 0.94 };
  const tileFrag = `varying vec2 vUv; uniform sampler2D uTex; uniform float uAlpha, uHover, uWH, uPhotoA, uFrame; uniform vec3 uFrameCol;
    void main(){
      float bx = ${BORDER.toFixed(3)} * uFrame, byT = bx * uWH, byB = bx * ${BORDER_BOTTOM.toFixed(1)} * uWH;
      vec2 p = (vUv - vec2(bx, byB)) / vec2(1. - 2. * bx, 1. - byT - byB);
      vec3 col = uFrameCol;
      if (p.x >= 0. && p.x <= 1. && p.y >= 0. && p.y <= 1.) {
        float boxA = (1. - 2. * bx) / (1. - byT - byB) * uWH;
        vec2 sc = boxA > uPhotoA ? vec2(1., uPhotoA / boxA) : vec2(boxA / uPhotoA, 1.);
        vec2 q = (p - .5) * sc * (1. - ${HOVER_ZOOM.toFixed(2)} * uHover) + .5;
        col = texture2D(uTex, q).rgb * (1. + uHover * .06);
        col += vec3(${GRADE.warmth.toFixed(3)}, ${(GRADE.warmth * 0.35).toFixed(4)}, ${(-GRADE.warmth).toFixed(3)}) * .15;
        col *= ${GRADE.brightness.toFixed(3)};
        col = (col - .5) * ${GRADE.contrast.toFixed(3)} + .5;
        col = mix(vec3(dot(col, vec3(.299, .587, .114))), col, ${GRADE.saturation.toFixed(3)});
      }
      gl_FragColor = vec4(col, uAlpha);
    }`;
  const plane = new T.PlaneGeometry(1, 1, 1, 1);
  const frameCol = new T.Color(...sr.rgb("--site-frame"));
  const shadowMat = new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.2 });

  // Same hash as the original makeGrid — same wall even after refresh
  const hash = (t) => { const e = 43758.5453 * Math.sin(12.9898 * t); return e - Math.floor(e); };
  let grid = null;
  const tiles = [];
  const wrap = (v, s) => ((v % s) + s) % s;
  const view = { w: 1, h: 1, vW: 1, vH: 1, mobile: false };
  const COUNT = 72;

  // One panel = 1.4x screen width, cell = Panels/columns count, cell height ×1.1. Photo width .5~.7 of the cell, sway .5.
  // Lay the board two across and two down, with the right set offset half a board down to stagger (as in the original)
  // Overlap relaxation (120 relaxation steps of the original makeGrid): two overlapping tiles are pushed apart by half along the less overlapped axis. The margin is 15% of the smaller size,
  // The push share shrinks from 1 at the start to .6 at the end (.5 downward), measured by the distance wound at the panel end. Stops early if there is no overlapping pair
  const near = (d, span) => wrap(d + span / 2, span) - span / 2;
  const relax = (items, spanX, spanY, margin) => {
    for (let step = 0; step < 120; step++) {
      let moved = false;
      const k = Math.max(0.5, 1 - (step / 120) * 0.4);
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        const dx = near(a.x - b.x, spanX), dy = near(a.y - b.y, spanY);
        const ox = (a.w + b.w) / 2 + margin * Math.min(a.w, b.w) - Math.abs(dx);
        const oy = (a.h + b.h) / 2 + margin * Math.min(a.h, b.h) - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (ox < oy) {
          const sx = Math.abs(dx) < 1e-4 ? (hash(i + j + step) > 0.5 ? 1 : -1) : Math.sign(dx);
          const push = (ox / 2) * sx * k;
          a.x = wrap(a.x + push, spanX); b.x = wrap(b.x - push, spanX);
        } else {
          const sy = Math.abs(dy) < 1e-4 ? (hash(i * j + step) > 0.5 ? 1 : -1) : Math.sign(dy);
          const push = (oy / 2) * sy * k;
          a.y = -wrap(-(a.y + push), spanY); b.y = -wrap(-(b.y - push), spanY);
        }
      }
      if (!moved) break;
    }
  };

  const buildGrid = () => {
    tiles.forEach((t) => { scene.remove(t.group); t.mat.dispose(); });
    tiles.length = 0;
    const n = view.mobile ? 3 : 6;
    const rows = Math.ceil(COUNT / n);
    const o = Math.max(view.vW * 1.1, 1.4 * view.vW), u = o / n, rh = u * 1.1, l = Math.max(rows * rh, 8);
    grid = { spanX: 2 * o, spanY: 2 * l, count: COUNT, first: [] };
    const base = [];
    for (let e = 0; e < COUNT; e++) {
      const a = Math.floor(e / n), f = ((e % n) + Math.floor(hash(a + 17) * n)) % n;
      const mi = e % MEDIA.length, asp = MEDIA[mi][0];
      const w = u * (0.5 + hash(e + 1) * 0.2), h = w / asp;
      base.push({
        bi: e, mi, w, h,
        x: wrap((f + 0.5) * u + (hash(e + 71) - 0.5) * u * 0.5, o),
        y: -wrap((a + 0.5) * rh + (hash(e + 97) - 0.5) * rh * 0.5, l),
        depth: (Math.floor(3 * hash(31 * e)) - 1) * 1.2,
        date: `0000.${String(1 + (e * 7) % 12).padStart(2, "0")}.${String(1 + (e * 13) % 28).padStart(2, "0")}`,
      });
    }
    relax(base, o, l, 0.15);
    for (const it of base) for (const [k, dx] of [[0, 0], [1, o]]) for (const dy of [0, l]) {
      const mat = new T.ShaderMaterial({
        vertexShader: tileVert, fragmentShader: tileFrag, transparent: true, side: T.DoubleSide,
        uniforms: { uTex: { value: textures[it.mi] }, uAlpha: { value: 0 }, uHover: { value: 0 }, uWH: { value: it.w / it.h }, uFrame: { value: 1 }, uPhotoA: { value: MEDIA[it.mi][0] }, uFrameCol: { value: frameCol } },
      });
      const mesh = new T.Mesh(plane, mat);
      mesh.scale.set(it.w, it.h, 1);
      const shadow = new T.Mesh(plane, shadowMat);
      shadow.scale.set(it.w * 1.5, it.h * 1.35, 1);
      shadow.position.set(0.04, -0.07, -0.06);
      const group = new T.Group();
      group.add(shadow, mesh);
      scene.add(group);
      const tile = { ...it, group, mesh, mat, x: it.x + dx, y: it.y - dy - k * l / 2, hover: 0 };
      mesh.userData.tile = tile;
      tiles.push(tile);
      if (!grid.first[it.bi]) grid.first[it.bi] = tile;
    }
  };

  // ── Floating light particles (original 50, phone 30, size 5, near z −10 behind the wall) ──
  const particles = (() => {
    const n = innerWidth < 820 ? 30 : 50, spread = innerWidth < 820 ? 22 : 40;
    const pos = new Float32Array(n * 3), seedA = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = -10 + (Math.random() - 0.5) * 15;
      seedA[i] = Math.random() * 6.28;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new T.BufferAttribute(seedA, 1));
    // The original lets grain show over photos too through depth-of-field blur, so turn off the depth test and draw it on top
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false,
      uniforms: { uT: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uCol: { value: new T.Color(...sr.rgb("--site-particle-glow")) }, uGlow: { value: new T.Color(...sr.rgb("--site-particle")) } },
      vertexShader: `attribute float aSeed; uniform float uT; uniform float uPx; varying float vA;
        void main(){ vec3 p = position; p.y += mod(uT * .6 * .25 + aSeed * 3., 40.) - 20.; p.x += sin(uT * .3 + aSeed) * .6;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = 8. * uPx * (18. / -mv.z); vA = .55 + .45 * sin(uT * 1.3 + aSeed * 4.); }`,
      fragmentShader: `varying float vA; uniform vec3 uCol, uGlow; void main(){ float d = length(gl_PointCoord - .5);
          float core = smoothstep(.5, .1, d); float glow = smoothstep(.5, .0, d) * .2;
          vec3 c = mix(uCol, uGlow, core);
          gl_FragColor = vec4(mix(c, vec3(1.), core * .5), (core + glow) * vA); }`,
    });
    const pts = new T.Points(geo, mat);
    pts.renderOrder = 20;
    scene.add(pts);
    return mat;
  })();

  // ── Six rising glass bubbles (original values): move up a band 1.6× the viewport height at .045 of viewport height per second while wrapping, and sway left and right at .6rad/s by 5% of the width.
  //    The first two sit in front of the photo (z .35 + .1·z), the rest between photos (.6·z). Size is screen height × .075 × (.6~1.3).
  //    after entry waits .5s then appears over 1.4s power2.out, on press bursts in .2s power2.in then regrows .8s later over 1.2s power2.out
  const bubbles = (() => {
    const seeds = Array.from({ length: 6 }, (_, i) => ({ x: (hash(7 * i + 1) - 0.5) * 2, z: (hash(7 * i + 2) - 0.5) * 2, seed: hash(7 * i + 3), phase: hash(7 * i + 4) * Math.PI * 2, scale: 0.6 + 0.7 * hash(7 * i + 5), pop: 1, popped: false }));
    const mesh = new T.InstancedMesh(new T.SphereGeometry(1, 64, 64), sr.glass(T, sr.GLASS.bubble, "--site-glass"), seeds.length);
    mesh.frustumCulled = false;
    mesh.visible = false;
    mesh.renderOrder = 15;
    scene.add(mesh);
    const show = { v: 0 };
    const o3 = new T.Object3D();
    return {
      mesh,
      start: () => (reduced ? (show.v = 1) : gsap.to(show, { v: 1, duration: 1.4, delay: 0.5, ease: "power2.out", overwrite: true })),
      pop: (i) => {
        const b = seeds[i];
        if (!b || b.popped) return;
        b.popped = true;
        gsap.timeline().to(b, { pop: 0, duration: 0.2, ease: "power2.in" }).to(b, { pop: 1, duration: 1.2, delay: 0.8, ease: "power2.out", onComplete: () => { b.popped = false; } });
      },
      update: (time, hide) => {
        const k = show.v * (1 - hide);
        mesh.visible = k > 0.01;
        if (!mesh.visible) return;
        const H = view.vH, W = view.vW, band = 1.6 * H;
        seeds.forEach((b, i) => {
          o3.position.set(b.x * W * 0.42 + Math.sin(0.6 * time + b.phase) * W * 0.05, wrap(b.seed * band + 0.045 * time * H, band) - band / 2, i < 2 ? 0.35 + 0.1 * b.z : 0.6 * b.z);
          o3.scale.setScalar(Math.max(1e-4, 0.075 * H * b.scale * k * b.pop));
          o3.updateMatrix();
          mesh.setMatrixAt(i, o3.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
  })();

  // ── Depth of field (our shader). Original settings: focus is z = Layer gap 1.2 × (2 × DOF_FOCUS 1.2 − 1) = 1.68, focal length 3, bokeh 2.4.
  //    Blur circle = smoothstep(0, 3, |distance from camera − distance to focus|), radius is bokeh × 8px. In the zoomed view, the focus moves to 3.2 in front of the camera.
  //    So a sharp front photo doesn’t bleed into the blurry back, each sample gets weight from its own blur circle
  const dof = (() => {
    const depthTexture = new T.DepthTexture(1, 1);
    const target = new T.WebGLRenderTarget(1, 1, { depthTexture, samples: 4 });
    const mat = new T.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: { tColor: { value: target.texture }, tDepth: { value: depthTexture }, uTexel: { value: new T.Vector2(1, 1) }, uNear: { value: camera.near }, uFar: { value: camera.far }, uFocus: { value: 3.32 }, uRange: { value: 3 }, uRadius: { value: 19.2 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: `varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform vec2 uTexel; uniform float uNear, uFar, uFocus, uRange, uRadius;
        float dist(vec2 uv){ float z = texture2D(tDepth, uv).r * 2. - 1.; return 2. * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
        float coc(vec2 uv){ return smoothstep(0., uRange, abs(dist(uv) - uFocus)); }
        void main(){
          float c = coc(vUv);
          vec3 sum = texture2D(tColor, vUv).rgb; float wsum = 1.;
          if (c > .01) for (int i = 0; i < 32; i++) {
            float fi = float(i), r = sqrt((fi + .5) / 32.), a = fi * 2.39996323;
            vec2 uv = vUv + vec2(cos(a), sin(a)) * r * c * uRadius * uTexel;
            float w = clamp(coc(uv) * 1.5, 0., 1.);
            sum += texture2D(tColor, uv).rgb * w; wsum += w;
          }
          gl_FragColor = vec4(sum / wsum, 1.);
        }`,
    });
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    const post = new T.Scene();
    post.add(quad);
    const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return {
      size: (w, h) => {
        const pr = renderer.getPixelRatio();
        target.setSize(Math.round(w * pr), Math.round(h * pr));
        mat.uniforms.uTexel.value.set(1 / (w * pr), 1 / (h * pr));
        mat.uniforms.uRadius.value = 2.4 * 8 * pr;
      },
      render: (focusZ) => {
        mat.uniforms.uFocus.value = camera.position.z - focusZ;
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(post, postCam);
      },
    };
  })();
  const FOCUS_Z = 1.2 * (2 * 1.2 - 1), FOCUS_OPEN_Z = CAM_Z - 3.2;

  // ── Input: wheel · drag · arrow keys. As in the original, the target value moves and the actual value follows at 1−.0015^dt ──
  const input = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, dragging: false, px: 0, py: 0, moved: 0 };
  const pointer = new T.Vector2(9, 9);
  const ray = new T.Raycaster();
  let pxToWorld = 0.005;
  // Enlarged view paging (original values): one wheel tick sets the paging target += deltaY × .006 (world), inertia .93, snaps to the nearest section once more than 400ms have passed since release and it slows
  // (1 − .01^dt) snap, the real position follows with (1 − .0008^dt). While advancing it shrinks to .92x then stops, and 200ms later returns with (1 − .02^dt)
  const focus = { tile: null, amount: { v: 0 }, index: 0, slide: { v: 0 }, tgt: 0, cur: 0, vel: 0, last: 0, moved: 0, shrink: 1, shown: -1 };

  addEventListener("wheel", (e) => {
    e.preventDefault();
    if (focus.tile) {
      focus.tgt += 0.006 * e.deltaY;
      focus.last = performance.now();
      return;
    }
    if (!sr.entered) return;
    // The original moves the wheel by .0042 times regardless of screen size (only dragging is divided by screen height, px to world)
    input.ty += 0.0042 * e.deltaY;
    input.tx -= 0.0042 * e.deltaX;
  }, { passive: false });
  canvas.addEventListener("pointerdown", (e) => {
    if (focus.tile) return;
    // Pressing a bubble pops it and does not start a drag
    if (bubbles.mesh.visible) {
      const r = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObject(bubbles.mesh, false)[0];
      if (hit && hit.instanceId !== undefined) { bubbles.pop(hit.instanceId); return; }
    }
    input.dragging = true; input.moved = 0;
    input.px = e.clientX; input.py = e.clientY; input.vx = input.vy = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("is-drag");
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!input.dragging) return;
    const dx = (e.clientX - input.px) * pxToWorld, dy = (e.clientY - input.py) * pxToWorld;
    input.moved += Math.abs(e.clientX - input.px) + Math.abs(e.clientY - input.py);
    input.tx += dx; input.ty -= dy; input.vx = dx; input.vy = -dy;
    input.px = e.clientX; input.py = e.clientY;
  });
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(tiles.filter((tl) => tl.group.visible).map((tl) => tl.mesh), false)[0];
    return hit ? hit.object.userData.tile : null;
  };
  const endDrag = (e) => {
    if (!input.dragging) return;
    input.dragging = false;
    canvas.classList.remove("is-drag");
    if (input.moved < 6 && sr.entered) openFocus(pick(e));
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", () => pointer.set(9, 9));
  // Cursor parallax (original values): follows the pointer at −1 to 1 relative to the window with (1 − .01^dt), moves the camera by (.16x, .12y) and tilts it by (.02y, .03x)rad.
  // As in the original, input is received on the whole window, including while dragging or touching
  const look = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!reduced) addEventListener("pointermove", (e) => { look.x = (e.clientX / innerWidth) * 2 - 1; look.y = 1 - (e.clientY / innerHeight) * 2; });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && focus.tile) return closeFocus();
    if (focus.tile) {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (dir) { focus.tgt = Math.round(focus.tgt / slideStep()) * slideStep() + dir * slideStep(); focus.last = performance.now(); }
      return;
    }
    const k = { ArrowDown: [0, 0.42], ArrowUp: [0, -0.42], ArrowRight: [0.42, 0], ArrowLeft: [-0.42, 0], PageDown: [0, 1.68], PageUp: [0, -1.68] }[e.key];
    if (k) { e.preventDefault(); input.tx -= k[0]; input.ty += k[1]; }
  });
  addEventListener("sr:back", () => closeFocus());
  // Dragging the bar sets the grid to the vertical winding at that spot and the zoom view to the photo at that index (original rule). On release the zoom view settles on the nearest slide
  sr.onBar = (d) => {
    if (focus.tile) { focus.tgt = (d * (grid.count - 1) - focus.index) * slideStep(); focus.last = performance.now(); return; }
    input.ty = -(1 - d) * grid.spanY;
  };

  // ── Zoom: the pressed photo sheds its border and grows to 80% of screen height at a distance of 3.2 in front of the camera, and the neighboring photos line up on both sides ──
  const slideStep = () => {
    const visH = 2 * Math.tan((FOV * Math.PI) / 360) * 3.2, visW = visH * camera.aspect;
    return view.mobile ? visW * 0.86 : visH * 0.8 * 0.82;
  };
  const stepSlide = (dt) => {
    const now = performance.now(), step = slideStep();
    focus.tgt += focus.vel;
    focus.vel *= Math.pow(0.93, 60 * dt);
    const nearest = Math.round(focus.tgt / step) * step;
    if (now - focus.last > 400 && Math.abs(focus.vel) < 0.005) focus.tgt += (nearest - focus.tgt) * (1 - Math.pow(0.01, dt));
    focus.cur += (focus.tgt - focus.cur) * (1 - Math.pow(8e-4, dt));
    focus.slide.v = focus.index + focus.cur / step;
    const moving = Math.abs(focus.cur - Math.round(focus.cur / step) * step) >= 0.02;
    if (moving) focus.moved = now;
    const settled = !moving && now - focus.moved > 200;
    focus.shrink += ((focus.amount.v > 0.95 && !settled ? 0.92 : 1) - focus.shrink) * (1 - Math.pow(0.02, dt));
    const n = grid.count, i = Math.round(focus.slide.v);
    if (i !== focus.shown) { focus.shown = i; sr.focus(true, grid.first[((i % n) + n) % n].date); }
  };
  const openFocus = (tile) => {
    if (!tile) return;
    focus.tile = tile;
    focus.index = tile.bi;
    focus.slide.v = tile.bi;
    focus.tgt = focus.cur = focus.vel = 0;
    focus.shrink = 1;
    focus.shown = tile.bi;
    gsap.to(focus.amount, { v: 1, duration: 0.95, ease: "power3.out", overwrite: true });
    sr.focus(true, tile.date);
  };
  const closeFocus = () => {
    if (!focus.tile) return;
    gsap.to(focus.amount, { v: 0, duration: 0.95, ease: "power2.out", overwrite: true, onComplete: () => { focus.tile = null; } });
    sr.focus(false);
  };
  const slideTile = (tl) => {
    if (!focus.tile) return null;
    const owner = tl.bi === focus.tile.bi ? focus.tile : grid.first[tl.bi];
    if (owner !== tl) return null;
    const n = grid.count;
    let d = tl.bi - focus.slide.v;
    d -= Math.round(d / n) * n;
    return Math.abs(d) > 3.5 ? null : d;
  };

  // ── Entry ──
  const intro = { travel: reduced ? 0 : -4, show: reduced ? 1 : 0, started: reduced };
  if (reduced) bubbles.start();

  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const mobile = w < 820;
    view.vH = 2 * Math.tan((FOV * Math.PI) / 360) * CAM_Z;
    view.vW = view.vH * camera.aspect;
    pxToWorld = view.vH / h;
    bg.material.uniforms.uAspect.value = camera.aspect;
    dof.size(w, h);
    if (!grid || mobile !== view.mobile || Math.abs(view.w - w) > 40) {
      view.mobile = mobile; view.w = w;
      buildGrid();
      // Original start position: desktop (.2, 1.8) · phone (2.2, .9)
      const [sx, sy] = mobile ? [2.2, 0.9] : [0.2, 1.8];
      input.x = input.tx = sx; input.y = input.ty = sy;
    }
  };
  addEventListener("resize", resize);
  resize();

  let hovered = null;
  const slideAt = new T.Vector3();
  const smooth =(a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
  // THREE.Clock prints a deprecation warning in r185 — measure the time between frames directly
  let lastNow = 0;
  let t = 0;

  const frame = () => {
    const now = performance.now();
    const dt = lastNow ? Math.min(Math.max(1, now - lastNow) / 1000, 1 / 30) : 0;
    lastNow = now;
    t += dt;
    if (!intro.started && sr.intro.enter > 0.001) {
      intro.started = true;
      gsap.to(intro, { travel: 0, duration: 3.2, ease: "power2.out" });
      gsap.to(intro, { show: 1, duration: 1.8, ease: "power2.out" });
      bubbles.start();
    }
    if (focus.tile) stepSlide(dt);
    if (!input.dragging && !focus.tile) {
      input.tx += input.vx; input.ty += input.vy;
      const d = Math.pow(0.92, 60 * dt);
      input.vx *= d; input.vy *= d;
    }
    const f = 1 - Math.pow(0.0015, dt);
    const lx = input.x, ly = input.y;
    input.x += (input.tx - input.x) * f;
    input.y += (input.ty - input.y) * f;
    // Bar: motion speed = Distance per frame ÷ dt ÷ 18 (original), progress is the vertical wrap position in the grid and, in zoom, which slide number it is
    const speed = dt ? Math.min(Math.hypot(input.x - lx, input.y - ly) / dt / 18, 1) : 0;
    const nAll = grid.count;
    sr.bar(
      focus.tile ? wrap(focus.slide.v, nAll) / Math.max(1, nAll - 1) : 1 - wrap(-input.y, grid.spanY) / grid.spanY,
      input.dragging || Math.hypot(input.vx, input.vy) > 0.001 || speed > 0.001 || (!!focus.tile && Math.abs(focus.tgt - focus.cur) > 0.01),
      !!focus.tile,
    );

    const lk = 1 - Math.pow(0.01, dt);
    look.sx += (look.x - look.sx) * lk;
    look.sy += (look.y - look.sy) * lk;
    camera.position.set(0.16 * look.sx, 0.12 * look.sy, CAM_Z + 6 * (1 - sr.intro.zoom));
    camera.rotation.set(0.02 * look.sy, 0.03 * look.sx, 0);
    camera.updateMatrixWorld();

    // Hover detection
    ray.setFromCamera(pointer, camera);
    const hit = focus.tile || input.dragging || !sr.entered ? null : ray.intersectObjects(tiles.map((tl) => tl.mesh), false)[0];
    hovered = hit ? hit.object.userData.tile : null;
    canvas.classList.toggle("is-hover", !!hovered && !input.dragging);

    const hx = grid.spanX / 2, hy = grid.spanY / 2;
    const fa = focus.amount.v;
    for (const tl of tiles) {
      tl.hover += ((tl === hovered ? 1 : 0) - tl.hover) * Math.min(dt * HOVER_SPEED, 1);
      const A = tl.x + input.x;
      const R = wrap(A, grid.spanX);
      const U = Math.round((A - R) / grid.spanX) * 0.382 * grid.spanY;
      const gx = R - hx;
      const gy = wrap(tl.y + input.y - U + intro.travel, grid.spanY) - hy;
      const gz = wrap(tl.depth + 3, 6) - 3;
      // Fade out at depths too close to or too far from the winding seam (original edge and depth fade)
      const ex = 1 - smooth(Math.max(view.vW * 0.5 + tl.w, hx * 0.75), hx - 0.02, Math.abs(gx));
      const ey = 1 - smooth(Math.max(view.vH * 0.5 + tl.h, hy * 0.75), hy - 0.02, Math.abs(gy));
      const ez = gz >= 0 ? 1 - smooth(2.4, 2.94, gz) : smooth(-2.94, -2.55, gz);
      let alpha = ex * ey * ez * intro.show;
      const g = tl.group;
      g.position.set(gx, gy, gz + HOVER_LIFT * tl.hover);
      // Like the original, the photo always faces the same way as the tilted camera
      g.quaternion.copy(camera.quaternion);
      g.scale.setScalar(1);
      const d = fa > 0 ? slideTile(tl) : null;
      if (d !== null) {
        const visH = 2 * Math.tan((FOV * Math.PI) / 360) * 3.2, visW = visH * camera.aspect;
        const fill = view.mobile ? Math.min((visW * 0.8) / tl.w, (visH * 0.8) / tl.h) : (visH * 0.8) / tl.h;
        const step = view.mobile ? visW * 0.86 : visH * 0.8 * 0.82;
        // The zoom line is attached to the camera so it stays in place on screen even when the camera moves by parallax (original focusPos = camera + front × 3.2)
        g.position.lerp(camera.localToWorld(slideAt.set(d * step, 0.12, -3.2)), fa);
        g.scale.setScalar((1 + (fill - 1) * fa) * (1 + (focus.shrink - 1) * fa));
        g.renderOrder = 10;
        alpha = alpha * (1 - fa) + fa * Math.max(0, 1 - Math.max(0, Math.abs(d) - 1.6) / 1.4);
        tl.mat.uniforms.uFrame.value = 1 - fa;
        g.children[0].visible = false;
      } else {
        alpha *= 1 - fa;
        g.renderOrder = 0;
        tl.mat.uniforms.uFrame.value = 1;
      }
      tl.mat.uniforms.uAlpha.value = alpha;
      tl.mat.uniforms.uHover.value = tl.hover;
      if (d === null) g.children[0].visible = alpha > 0.02;
      g.visible = alpha > 0.002;
    }
    // The original redraws background noise only 20 times per second (BG_UPDATE_FPS 20) — time is cut into 20fps steps
    bg.material.uniforms.uT.value = Math.floor(t * 20) / 20;
    bg.material.uniforms.uFocus.value = fa;
    particles.uniforms.uT.value = t;
    bubbles.update(t, fa);
    dof.render(FOCUS_Z + (FOCUS_OPEN_Z - FOCUS_Z) * fa);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
