/* 3D stage — instead of the original’s models and textures, basic shapes and procedural shaders give the same composition, camera and light.
   Scenes: arch (jungle stone arch → scatter → ring → vortex gate) · crystal (crystal over wireframe terrain) · streams (light beams → gather into streams)
         flower (glowing lily) · hand (hand reaching out as rays of light) · interior (waves of light inside crystal)
   shared.js calls AeStage.view(name, progress) every frame, and the stage draws only that scene. */
(() => {
  const host = document.querySelector("[data-stage]");
  if (!host || !window.THREE) return;
  const T = THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 1);
  host.appendChild(renderer.domElement);
  const fadeEl = document.querySelector(".ae-fade");

  const cam = new T.PerspectiveCamera(42, 1, 0.05, 200);
  const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  // Light color is derived from the skin’s accent color — resolve the variable (including color-mix and oklch) to one canvas pixel and read it, keep the same saturation, rotate the hue and set the lightness
  const ACC = (() => {
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const sw = Object.assign(document.createElement("i"), { hidden: true });
    sw.style.color = "var(--kf-accent)";
    document.documentElement.append(sw);
    g.fillStyle = getComputedStyle(sw).color;
    sw.remove();
    g.fillRect(0, 0, 1, 1);
    const [r, gg, b] = g.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, gg / 255, b / 255, T.SRGBColorSpace);
  })();
  const tone = (dh, l, s) => {
    const hsl = ACC.getHSL({}, T.SRGBColorSpace);
    return new T.Color().setHSL(hsl.h + dh / 360, s ?? hsl.s, l, T.SRGBColorSpace);
  };
  const css = (c, a = 1) => {
    const h = c.getHex(T.SRGBColorSpace);
    return `rgba(${h >> 16}, ${(h >> 8) & 255}, ${h & 255}, ${a})`;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Original first-scene camera curve landingCameraEase — three cubic Béziers (M0,0 C.07,.03 .16,.115 .204,.15 C.215,.28 .42,.68 .491,.75 C.62,.88 .8,.97 1,1) solved for x to get y
  const landingEase = (() => {
    const segs = [[0, 0, 0.07, 0.03, 0.16, 0.115, 0.204, 0.15], [0.204, 0.15, 0.215, 0.28, 0.42, 0.68, 0.491, 0.75], [0.491, 0.75, 0.62, 0.88, 0.8, 0.97, 1, 1]];
    const bz = (a, b, c, d, t) => ((1 - t) ** 3) * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
    return (x) => {
      const g = segs.find((q) => x <= q[6]) || segs[2];
      let lo = 0, hi = 1, t = 0.5;
      for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (bz(g[0], g[2], g[4], g[6], t) < x) lo = t; else hi = t; }
      return bz(g[1], g[3], g[5], g[7], t);
    };
  })();
  // Entrance staging values — the default is fully awake (a page reached by skipping or passing through the entrance gate)
  const entry = { fog: 0.045, sun: 1, spot: 1, angle: 1, shafts: 1, fov: 0, drift: 0 };

  // Patterns with soft edges (halo · pollen · light shafts) are baked once on a canvas
  const glowTex = (inner, outer = "transparent", stops) => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner); (stops || []).forEach(([o, col]) => gr.addColorStop(o, col)); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  };
  const sprite = (tex, scale, color = 0xffffff, opacity = 1) => {
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, color, transparent: true, opacity, blending: T.AdditiveBlending, depthWrite: false }));
    s.scale.set(scale, scale, 1); return s;
  };
  const screenQuad = (frag, uniforms) => {
    const m = new T.ShaderMaterial({
      uniforms: Object.assign({ uTime: { value: 0 }, uRes: { value: new T.Vector2(1, 1) }, uP: { value: 0 } }, uniforms),
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: frag, depthWrite: false, depthTest: false, transparent: true,
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), m); mesh.frustumCulled = false; return mesh;
  };
  const NOISE = `
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
      return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0., a = .5; for(int i=0;i<5;i++){ s += a*vn(p); p = p*2.03 + 7.1; a *= .5; } return s; }`;

  /* ---------------- arch: a stone arch in the jungle ---------------- */
  const arch = (() => {
    const scene = new T.Scene();
    scene.background = new T.Color(0x020302);
    scene.fog = new T.FogExp2(0x020302, 0.045);
    const amb = new T.AmbientLight(0x22301e, 2.2); scene.add(amb);
    const sun = new T.DirectionalLight(0xffd9a0, 1.8); sun.position.set(4, 9, 3); scene.add(sun);
    const spot = new T.SpotLight(0xffe2b0, 60, 18, 0.5, 0.8, 1.4); spot.position.set(3.5, 9, 4); spot.target.position.set(0, 2.2, 0); scene.add(spot, spot.target);
    const blue = new T.PointLight(ACC, 0, 14, 1.6); blue.position.set(0, 2.7, 1.2); scene.add(blue);

    const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: 0x0b0d08, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; scene.add(ground);

    // Back background rock
    const rockMat = new T.MeshStandardMaterial({ color: 0x1c1d15, roughness: 1, flatShading: true });
    [[-6, 1.5, -5, 3.2], [6.5, 1.2, -4, 3], [-3.5, 0.6, -8, 4], [3, 0.8, -9, 4.5], [-8, 0.5, -1.5, 2]].forEach(([x, y, z, s]) => {
      const r = new T.Mesh(new T.IcosahedronGeometry(s, 1), rockMat); r.position.set(x, y, z); r.scale.y = 0.7; r.rotation.set(rnd(), rnd() * 3, 0); scene.add(r);
    });

    // Arch stones: two pillars + a semicircle. Each stone remembers three positions: arch, scattered, ring
    // The original hero arch is dark gray-green mossy stone (compared by shooting the original at the same scroll share after entry)
    const stoneMats = [0x45473a, 0x3b3d31, 0x4f5142].map((c) => new T.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true, emissive: 0x0a3a66, emissiveIntensity: 0 }));
    const mossMat = new T.MeshStandardMaterial({ color: 0x5c7a4a, roughness: 0.8, side: T.DoubleSide });
    const mossGeo = new T.CircleGeometry(0.07, 5);
    const runeMat = new T.LineBasicMaterial({ color: 0x8fd6ff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
    const stones = [], R = 1.35, C = new T.Vector3(0, 3.05, 0);
    const homes = [];
    for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) homes.push({ p: new T.Vector3(sx * R, 0.3 + i * 0.5, 0), r: 0, w: 0.62, h: 0.46 });
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); homes.push({ p: new T.Vector3(Math.cos(a) * R, C.y + Math.sin(a) * R, 0), r: a - Math.PI / 2, w: 0.42, h: 0.6 }); }
    homes.forEach((hm, i) => {
      const geo = new T.BoxGeometry(hm.w * (0.9 + rnd() * 0.2), hm.h * (0.9 + rnd() * 0.15), 0.62 + rnd() * 0.15, 2, 2, 1);
      const pos = geo.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setXYZ(k, pos.getX(k) * (0.93 + rnd() * 0.14), pos.getY(k) * (0.93 + rnd() * 0.14), pos.getZ(k));
      geo.computeVertexNormals();
      const m = new T.Mesh(geo, stoneMats[i % 3]);
      for (let k = 0, n = Math.floor(rnd() * 4); k < n; k++) { const l = new T.Mesh(mossGeo, mossMat); l.position.set((rnd() - 0.5) * hm.w, (rnd() - 0.5) * hm.h, 0.34); l.rotation.z = rnd() * 6; m.add(l); }
      // Shining gold: a few bent lines on the front face
      const pts = [];
      for (let k = 0; k < 4; k++) {
        let x = (rnd() - 0.5) * hm.w * 0.8, y = (rnd() - 0.5) * hm.h * 0.8;
        for (let j = 0; j < 3; j++) { const nx = x + (rnd() - 0.5) * 0.25, ny = y + (rnd() - 0.5) * 0.25; pts.push(x, y, 0.33, nx, ny, 0.33); x = nx; y = ny; }
      }
      const lg = new T.BufferGeometry(); lg.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
      m.add(new T.LineSegments(lg, runeMat));
      const dir = new T.Vector3(hm.p.x * 0.7 + (rnd() - 0.5) * 1.6, (hm.p.y - 2.2) * 0.35 + (rnd() - 0.3) * 1.2, 0.2 + rnd() * 1.3);
      const ringA = (i / homes.length) * Math.PI * 2 + Math.PI / 2;
      stones.push({
        m, home: { p: hm.p.clone(), r: new T.Euler(0, 0, hm.r) },
        scatter: { p: hm.p.clone().add(dir), r: new T.Euler(rnd() * 3, rnd() * 3, rnd() * 3) },
        ring: { p: new T.Vector3(Math.cos(ringA) * (2.55 + rnd() * 0.25), C.y - 0.35 + Math.sin(ringA) * (2.55 + rnd() * 0.25), 0.2 + (rnd() - 0.5) * 0.4), r: new T.Euler(rnd() * 0.6, rnd() * 0.6, ringA) },
        lag: rnd() * 0.25,
      });
      scene.add(m);
    });

    // Fern / broad leaf: leaf-shaped panels fanned out like a fan
    const leafShape = new T.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.22, 0.55, 0, 1.2); leafShape.quadraticCurveTo(-0.22, 0.55, 0, 0);
    const leafGeo = new T.ShapeGeometry(leafShape, 6);
    const leafMat = new T.MeshStandardMaterial({ color: 0x3a4d33, roughness: 0.8, side: T.DoubleSide });
    const fern = (x, z, s, n) => {
      const g = new T.Group();
      for (let i = 0; i < n; i++) {
        const l = new T.Mesh(leafGeo, leafMat); const a = (i / n) * Math.PI * 2 + rnd();
        l.rotation.set(-0.9 - rnd() * 0.5, a, 0, "YXZ"); l.scale.setScalar(s * (0.7 + rnd() * 0.5)); g.add(l);
      }
      g.position.set(x, 0, z); scene.add(g); return g;
    };
    [[-2.2, 1.6, 1.3, 11], [-1.4, 2.4, 0.9, 9], [2.1, 1.2, 1.1, 10], [1.4, 2.8, 0.7, 8], [-3.6, 0.2, 1.4, 12], [3.6, 0.5, 1.2, 10], [0.5, 3.6, 0.6, 7], [-0.8, 0.6, 0.8, 8]].forEach((f) => fern(...f));

    // Light beam coming from the upper right
    const shaftTex = (() => {
      const c = document.createElement("canvas"); c.width = 64; c.height = 256; const g = c.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, "transparent"); gr.addColorStop(0.5, "rgba(255,226,170,1)"); gr.addColorStop(1, "transparent"); /* Not skin: sunlight color of the jungle scene (art content) */
      g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
      const fade = g.createLinearGradient(0, 0, 0, 256); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)"); /* Not skin: eraser mask uses only opacity */
      g.globalCompositeOperation = "destination-out"; g.fillStyle = fade; g.fillRect(0, 0, 64, 256);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    })();
    const shafts = [];
    [[1.6, 0.5, 0.22], [2.3, 0.35, 0.16], [2.9, 0.6, 0.12]].forEach(([x, w, o]) => {
      const s = new T.Mesh(new T.PlaneGeometry(w, 9), new T.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: o, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      s.position.set(x, 6, -0.6); s.rotation.z = 0.42; scene.add(s); shafts.push(s);
    });

    // Firefly
    const fly = new T.BufferGeometry(), fp = [];
    for (let i = 0; i < 70; i++) fp.push((rnd() - 0.5) * 12, rnd() * 5, (rnd() - 0.5) * 6);
    fly.setAttribute("position", new T.Float32BufferAttribute(fp, 3));
    const flies = new T.Points(fly, new T.PointsMaterial({ color: 0x5fc4ff, size: 0.04, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false }));
    scene.add(flies);

    // Swirl gate
    const vortexMat = new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      fragmentShader: NOISE + `
        varying vec2 vUv; uniform float uTime, uOpacity;
        void main(){
          vec2 q = vUv - .5; float r = length(q) * 2.; float a = atan(q.y, q.x);
          float sw = a + 2.6 * log(r + .08) - uTime * .9;
          vec2 st = vec2(cos(sw), sin(sw)) * (1.4 + r * 2.2);
          float n = fbm(st + vec2(uTime * .15, 0.));
          float streak = smoothstep(.35, .85, n);
          vec3 deep = vec3(.02, .1, .9), mid = vec3(.25, .45, 1.), hi = vec3(.85, .92, 1.);
          vec3 col = mix(deep, mid, smoothstep(.1, .7, r));
          col = mix(col, hi, streak * smoothstep(.15, .6, r));
          col += vec3(.2, .5, 1.) * pow(1. - r, 3.) * .8;
          float alpha = smoothstep(1., .82, r) * uOpacity;
          gl_FragColor = vec4(col, alpha);
        }`,
      transparent: true, depthWrite: false,
    });
    const vortex = new T.Mesh(new T.CircleGeometry(2.25, 72), vortexMat); vortex.position.copy(C).add(new T.Vector3(0, -0.35, 0.1)); scene.add(vortex);
    const halo = sprite(glowTex(css(tone(14.9, 0.651), 0.9), "transparent", [[0.45, css(tone(22.8, 0.559), 0.35)]]), 9.5, 0xffffff, 0);
    halo.position.copy(vortex.position); scene.add(halo);

    const qa = new T.Quaternion(), qb = new T.Quaternion();
    const place = (s, a, b, t) => {
      s.m.position.lerpVectors(a.p, b.p, t);
      qa.setFromEuler(a.r); qb.setFromEuler(b.r); s.m.quaternion.slerpQuaternions(qa, qb, t);
    };
    return {
      scene, camera: cam,
      update(p, time) {
        const push = ease(span(p, 0, 0.06)), sc = span(p, 0.05, 0.2), rg = span(p, 0.2, 0.3), hold = ease(span(p, 0.33, 0.85)), dive = ease(span(p, 0.85, 0.97));
        stones.forEach((s) => {
          const ls = ease(clamp((sc - s.lag) / (1 - s.lag))), lr = ease(clamp((rg - s.lag * 0.6) / (1 - s.lag * 0.6)));
          if (rg > 0) place(s, s.scatter, s.ring, lr); else place(s, s.home, s.scatter, ls);
        });
        const glow = clamp(sc * 1.6) * (0.6 + 0.4 * rg);
        runeMat.opacity = glow; stoneMats.forEach((m) => (m.emissiveIntensity = glow * 0.3));
        vortexMat.uniforms.uTime.value = time; vortexMat.uniforms.uOpacity.value = ease(span(p, 0.24, 0.33));
        halo.material.opacity = ease(span(p, 0.22, 0.33)) * 0.85;
        spot.intensity = 60 * (1 - rg) * entry.spot;
        spot.angle = lerp(0.15, 0.5, entry.angle);
        sun.intensity = 1.8 * entry.sun;
        scene.fog.density = entry.fog;
        blue.intensity = glow * 4 + halo.material.opacity * 18;
        amb.color.setRGB(lerp(0.13, 0.05, rg), lerp(0.19, 0.1, rg), lerp(0.12, 0.35, rg));
        shafts.forEach((s, i) => (s.material.opacity = (0.22 - i * 0.05) * (1 - rg) * entry.shafts));
        flies.rotation.y = time * 0.02;
        // In the original the arch stands far away at about 1/3 of screen height, then approaches after becoming a ring
        const z = lerp(lerp(lerp(13, 11.2, push), 6.4, hold), 0.6, dive);
        cam.fov = lerp(42, 30, dive) + entry.fov; cam.updateProjectionMatrix();
        cam.position.set(mouse.sx * 0.35, lerp(1.9, 2.1, push) + rg * 0.55 - mouse.sy * 0.2 - entry.drift, z);
        cam.lookAt(0, lerp(2.3, 2.7, rg), 0);
      },
    };
  })();

  /* ---------------- crystal: a crystal floating over a wireframe terrain ---------------- */
  const crystal = (() => {
    const scene = new T.Scene();
    scene.background = new T.Color(0x000105);
    scene.fog = new T.Fog(0x000105, 8, 34);
    scene.add(new T.AmbientLight(0x0a1530, 1));
    const core = new T.PointLight(ACC, 30, 12, 1.4); core.position.set(0, 0.7, 0.8); scene.add(core);
    const rim = new T.DirectionalLight(0x6f8fff, 1.2); rim.position.set(-4, 5, -6); scene.add(rim);

    // Terrain: dots + sparse lines. A peak rises at the back right
    const W = 46, D = 22, NX = 180, NZ = 90, height = (x, z) => {
      const n = Math.sin(x * 0.55) * Math.cos(z * 0.7) * 0.35 + Math.sin(x * 1.3 + z * 0.9) * 0.18 + Math.sin(x * 2.7 - z * 1.9) * 0.08;
      const peak = Math.exp(-((x - 4.5) ** 2 + (z + 4) ** 2) / 3) * 3.2 + Math.exp(-((x - 8) ** 2 + (z + 6) ** 2) / 4) * 2.6 + Math.exp(-((x + 9) ** 2 + (z + 7) ** 2) / 6) * 1.4;
      return n + peak + Math.max(0, -z - 2) * 0.12;
    };
    const pts = [], cols = [], c = new T.Color();
    for (let i = 0; i <= NX; i++) for (let j = 0; j <= NZ; j++) {
      const x = (i / NX - 0.5) * W, z = -(j / NZ) * D + 2.5, y = height(x, z);
      if (Math.abs(x) < 1.4 && z > -1.5) continue;
      pts.push(x, y - 2, z);
      const t = clamp(y / 3.2); c.setRGB(lerp(0.05, 0.75, t * t), lerp(0.3, 0.85, t), lerp(0.85, 0.35, t)); cols.push(c.r, c.g, c.b);
    }
    const tg = new T.BufferGeometry(); tg.setAttribute("position", new T.Float32BufferAttribute(pts, 3)); tg.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    scene.add(new T.Points(tg, new T.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 1, blending: T.AdditiveBlending, depthWrite: false })));
    const lp = [];
    for (let j = 0; j <= NZ; j += 6) for (let i = 0; i < NX; i++) {
      const x0 = (i / NX - 0.5) * W, x1 = ((i + 1) / NX - 0.5) * W, z = -(j / NZ) * D + 2.5;
      lp.push(x0, height(x0, z) - 2, z, x1, height(x1, z) - 2, z);
    }
    const lgeo = new T.BufferGeometry(); lgeo.setAttribute("position", new T.Float32BufferAttribute(lp, 3));
    scene.add(new T.LineSegments(lgeo, new T.LineBasicMaterial({ color: 0x1b3d7a, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false })));

    // Crystal: hexagonal bipyramid. Glowing map pattern inside
    const gem = new T.Group(); gem.position.set(0, 0.55, 0); gem.rotation.z = -0.14; scene.add(gem);
    const prof = [new T.Vector2(0, -2.15), new T.Vector2(1.05, -0.95), new T.Vector2(1.18, 0.75), new T.Vector2(0.55, 1.75), new T.Vector2(0, 1.95)];
    const shell = new T.Mesh(new T.LatheGeometry(prof, 6), new T.MeshStandardMaterial({ color: 0x1c2846, metalness: 0.45, roughness: 0.22, flatShading: true, emissive: 0x081633, emissiveIntensity: 0.6 }));
    gem.add(shell);
    const mapTex = (() => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d");
      const gr = g.createRadialGradient(128, 128, 8, 128, 128, 120); gr.addColorStop(0, css(tone(-2.3, 0.875))); gr.addColorStop(0.45, css(tone(8.4, 0.592))); gr.addColorStop(1, css(tone(21.1, 0.157), 0));
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, r = rnd() * 80; g.fillStyle = css(tone(-7.5, 0.892), 0.08 + rnd() * 0.2); g.fillRect(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 6 + rnd() * 22, 4 + rnd() * 14); }
      const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t;
    })();
    // Draw the inner light last without a depth test so the shell’s front face doesn’t hide it
    const inner = sprite(mapTex, 2.3, 0xffffff, 1); inner.position.set(0, 0.05, 0); inner.material.depthTest = false; inner.renderOrder = 5; gem.add(inner);
    const aura = sprite(glowTex(css(ACC, 0.5)), 5.2, 0xffffff, 0.8); aura.material.depthTest = false; aura.renderOrder = 4; gem.add(aura);
    const front = new T.DirectionalLight(0x9fb8ff, 0.9); front.position.set(1, 1, 8); scene.add(front);
    // Light reflected on water
    const refl = sprite(glowTex(css(tone(8.1, 0.651), 0.5)), 3, 0xffffff, 0.5); refl.scale.set(1.4, 4.2, 1); refl.position.set(0, -3.4, 1.5); scene.add(refl);

    const state = { spin: 0, target: 0, drag: 0, hue: 0.57, hueT: 0.57, morph: 0 };
    return {
      scene, camera: cam, state,
      update(p, time) {
        state.spin += (state.target + state.drag - state.spin) * 0.08;
        state.hue += (state.hueT - state.hue) * 0.06;
        gem.rotation.y = state.spin + (reduce ? 0 : time * 0.12);
        gem.position.y = 0.55 + (reduce ? 0 : Math.sin(time * 0.8) * 0.06);
        const pulse = reduce ? 1 : 0.9 + Math.sin(time * 1.7) * 0.1;
        inner.material.color.setHSL(state.hue, 0.7, 0.62); aura.material.color.setHSL(state.hue, 0.8, 0.6); core.color.setHSL(state.hue, 0.85, 0.6);
        core.intensity = 30 * pulse * (1 + state.morph * 2); aura.material.opacity = 0.8 * pulse + state.morph;
        inner.scale.setScalar(2.4 * (1 + state.morph * 1.5));
        cam.fov = 42; cam.updateProjectionMatrix();
        cam.position.set(mouse.sx * 0.6, 0.65 - mouse.sy * 0.25 + p * 0.6, lerp(9, 8.4, p) - state.morph * 6);
        cam.lookAt(0, 0.35, 0);
      },
    };
  })();

  /* ---------------- streams: light beams flowing in from the left → gather upward into a flower stem ---------------- */
  const streams = (() => {
    const scene = new T.Scene();
    // The three light-beam colors (dark stripe · white light where they overlap · sparkle) are made by rotating only the hue of the skin’s accent color — the shader paints the received values as they are
    const srgb = (c) => { const o = c.getRGB({}, T.SRGBColorSpace); return new T.Vector3(o.r, o.g, o.b); };
    const quad = screenQuad(NOISE + `
      varying vec2 vUv; uniform float uTime, uP; uniform vec2 uRes; uniform vec3 uDeep, uWhite, uSpark;
      void main(){
        vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 q = vec2(uv.x * asp, uv.y);
        float gather = smoothstep(.0, 1., uP);
        float acc = 0.; vec3 col;
        for (int i = 0; i < 22; i++) {
          float fi = float(i), k = fract(sin(fi * 12.9898) * 43758.5453);
          float reach = mix(.36, .2, gather) + k * .3;
          float x = q.x / asp;
          float env = smoothstep(reach + .25, reach - .15, x);
          float amp = (.04 + k * .16) * (.4 + x * 1.6) * (1. - gather * .7);
          float y = .48 + sin(x * (4. + k * 9.) + uTime * (.4 + k * .5) + fi * 1.7) * amp + sin(x * (11. + k * 7.) + fi * 2.) * .025 * x;
          float bend = gather * smoothstep(.15, .75, x);
          float d = abs(uv.y - (y + bend * bend * 1.1));
          float w = .0018 + k * .0012;
          float line = w / (d + w) * env;
          acc += line;
        }
        col = uDeep * acc * .9 + uWhite * pow(acc, 2.) * .08;
        float sp = step(.996, h21(floor(uv * uRes / 2.) + floor(uTime * 3.))) * smoothstep(.75, .1, uv.x) * .6;
        col += uSpark * sp;
        gl_FragColor = vec4(col, 1.);
      }`, { uDeep: { value: srgb(tone(12.1, 0.551)) }, uWhite: { value: srgb(tone(-3.9, 0.85)) }, uSpark: { value: srgb(tone(6.1, 0.7)) } });
    scene.add(quad);
    return {
      scene, camera: ortho,
      update(p, time) { quad.material.uniforms.uTime.value = time; quad.material.uniforms.uP.value = p; quad.material.uniforms.uRes.value.set(innerWidth, innerHeight); },
    };
  })();

  /* ---------------- flower: lily on a light-beam stem ---------------- */
  const flower = (() => {
    const scene = new T.Scene();
    scene.background = new T.Color(0x000000);
    scene.add(new T.AmbientLight(0x8fa7b5, 1.3));
    const key = new T.PointLight(0xdff6ff, 18, 10, 1.5); key.position.set(0, 0.4, 2); scene.add(key);
    const root = new T.Group(); root.position.set(2.15, 0.55, 0); scene.add(root);

    // Stardust
    const sg = new T.BufferGeometry(), sp = [];
    for (let i = 0; i < 260; i++) sp.push((rnd() - 0.5) * 22, (rnd() - 0.5) * 13, -3 - rnd() * 6);
    sg.setAttribute("position", new T.Float32BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0x9fb0b8, size: 0.03, transparent: true, opacity: 0.6 })));

    // Stem: a thin white tube plus two layers of wide glow tubes
    const curve = new T.CatmullRomCurve3([new T.Vector3(-0.25, -6, 0.4), new T.Vector3(0.25, -3.6, 0.2), new T.Vector3(0.35, -1.6, 0), new T.Vector3(0.05, -0.2, 0)]);
    const stemCore = new T.Mesh(new T.TubeGeometry(curve, 80, 0.045, 8), new T.MeshBasicMaterial({ color: 0xffffff }));
    const stemGlow = new T.Mesh(new T.TubeGeometry(curve, 80, 0.12, 12), new T.MeshBasicMaterial({ color: 0x9fe8d8, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false }));
    root.add(stemCore, stemGlow);
    for (let i = 0; i < 6; i++) {
      const off = curve.getPoints(40).map((v, k) => v.clone().add(new T.Vector3(Math.sin(k * 0.3 + i) * 0.07 * (1 - k / 40), 0, Math.cos(k * 0.3 + i) * 0.07)));
      root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(off), 60, 0.01, 4), new T.MeshBasicMaterial({ color: 0xe8fff8, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })));
    }
    const stemBloom = sprite(glowTex(css(tone(-38.9, 0.745, 0.615), 0.35)), 3.2, 0xffffff, 0.5); stemBloom.scale.set(2.2, 9, 1); stemBloom.position.set(0.15, -3.6, -0.2); root.add(stemBloom);

    // Petals: bend the plate into pointed leaves. Only one is blue
    const petalGeo = (() => {
      const g = new T.PlaneGeometry(1, 1, 10, 24), a = g.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const u = a.getX(i), v = a.getY(i) + 0.5;
        const w = Math.sin(Math.PI * Math.pow(v, 0.7)) * 0.95 * (1 - v * 0.2);
        a.setXYZ(i, u * w, v * 2.3, -Math.pow(v, 2) * 0.7 + Math.abs(u) * w * 0.35);
      }
      g.computeVertexNormals(); return g;
    })();
    const white = new T.MeshStandardMaterial({ color: 0xdfe8ee, emissive: 0x6f8a98, emissiveIntensity: 0.6, transparent: true, opacity: 0.72, side: T.DoubleSide, depthWrite: false, roughness: 0.4 });
    const blueM = new T.MeshStandardMaterial({ color: tone(1, 0.504, 0.676), emissive: tone(0.5, 0.304, 0.858), emissiveIntensity: 0.7, transparent: true, opacity: 0.88, side: T.DoubleSide, depthWrite: false, roughness: 0.4 });
    const head = new T.Group(); head.rotation.set(1.05, 0, -0.35); root.add(head);
    const petals = [];
    for (let i = 0; i < 6; i++) {
      const m = new T.Mesh(petalGeo, i === 2 ? blueM : white);
      const g = new T.Group(); g.rotation.set(0, (i / 6) * Math.PI * 2, 0); m.rotation.x = -(0.9 + (i % 2) * 0.25); g.add(m); head.add(g); petals.push(m);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3, end = new T.Vector3(Math.cos(a) * 0.55, 1.15 + rnd() * 0.25, Math.sin(a) * 0.55);
      const st = new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(), new T.Vector3(end.x * 0.3, 0.8, end.z * 0.3), end), 16, 0.012, 5), new T.MeshBasicMaterial({ color: 0xf2fbff }));
      const an = new T.Mesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff })); an.scale.set(0.6, 1.8, 0.6); an.position.copy(end);
      head.add(st, an);
    }
    const bloom = sprite(glowTex(css(tone(-6.9, 0.931), 0.55)), 6, 0xffffff, 0.6); root.add(bloom);
    const tint = new T.Color(), whiteC = new T.Color(0xdfe8ee), blueC = tone(-1.1, 0.569, 0.791);
    return {
      scene, camera: cam,
      update(p, time, extra = {}) {
        const grow = ease(span(p, 0, 0.35)), rev = extra.reveal || 0;
        // In portrait the text flows below, so the flower goes top center
        if (cam.aspect < 1) root.position.set(0.7, 2.2, 0); else root.position.set(2.15, 0.55, 0);
        head.scale.setScalar(lerp(0.2, 1, grow));
        head.rotation.z = -0.35 + (reduce ? 0 : Math.sin(time * 0.5) * 0.03);
        head.rotation.x = 1.05 + (reduce ? 0 : Math.sin(time * 0.4) * 0.04);
        petals.forEach((m, i) => (m.rotation.x = -(0.9 + (i % 2) * 0.25) - (1 - grow) * 0.9));
        tint.copy(whiteC).lerp(blueC, rev); white.color.copy(tint); white.emissive.copy(tint).multiplyScalar(0.45);
        stemGlow.material.color.set(rev > 0.5 ? 0x7fd0ff : 0x9fe8d8);
        bloom.material.opacity = 0.6 * grow;
        cam.fov = 42; cam.updateProjectionMatrix();
        cam.position.set(mouse.sx * 0.5, lerp(-1.8, 0, grow) - mouse.sy * 0.3, 8);
        cam.lookAt(0, lerp(-1.4, 0.2, grow), 0);
      },
    };
  })();

  /* ---------------- hand: reaches out with a warm beam of light coming in from the right ---------------- */
  const hand = (() => {
    const scene = new T.Scene();
    const beam = screenQuad(NOISE + `
      varying vec2 vUv; uniform float uTime, uP; uniform vec2 uRes;
      void main(){
        vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 q = vec2(uv.x * asp, uv.y);
        vec2 a = vec2(1.05 * asp, .62), b = vec2(-.1 * asp, .12);
        vec2 ab = b - a; float t = clamp(dot(q - a, ab) / dot(ab, ab), 0., 1.);
        float d = length(q - (a + ab * t));
        float w = mix(.05, .32, t);
        float core = exp(-pow(d / w, 2.));
        float reach = smoothstep(uP * 1.25, uP * 1.25 - .35, t);
        vec3 warm = mix(vec3(1., .93, .82), vec3(.55, .32, .12), smoothstep(.0, .95, t));
        float grain = h21(uv * uRes + floor(uTime * 24.)) * .18;
        vec3 col = warm * core * reach * (1.15 - t * .5) + grain * core * reach * .4;
        gl_FragColor = vec4(col, 1.);
      }`);
    beam.renderOrder = -1; scene.add(beam);
    const s3 = new T.Scene();
    s3.add(new T.AmbientLight(0x3a2416, 0.6));
    const sun = new T.DirectionalLight(0xffd6a6, 3.2); sun.position.set(5, 2.5, 3); s3.add(sun);
    const back = new T.DirectionalLight(0x8a5020, 0.8); back.position.set(-3, -2, -2); s3.add(back);
    const skin = new T.MeshStandardMaterial({ color: 0xcaa07c, roughness: 0.5 });
    const arm = new T.Group(); s3.add(arm);
    const fore = new T.Mesh(new T.CylinderGeometry(0.27, 0.42, 4.6, 24), skin); fore.position.y = -2.3; arm.add(fore);
    const wrist = new T.Mesh(new T.SphereGeometry(0.29, 20, 12), skin); wrist.scale.set(1, 1.3, 0.7); arm.add(wrist);
    const palm = new T.Mesh(new T.SphereGeometry(0.5, 28, 18), skin); palm.scale.set(0.9, 1.0, 0.32); palm.position.y = 0.48; arm.add(palm);
    const fingers = [];
    const seg = (len) => new T.Mesh(new T.CapsuleGeometry(0.058, len, 4, 10), skin);
    [[-0.3, 0.42, 0.78], [-0.1, 0.46, 0.9], [0.1, 0.45, 0.84], [0.29, 0.4, 0.66]].forEach(([x, y, L], i) => {
      const f = new T.Group(); f.position.set(x, 0.45 + y, 0); arm.add(f);
      let parent = f; const joints = [];
      [L * 0.45, L * 0.32, L * 0.24].forEach((l) => {
        const j = new T.Group(); parent.add(j); const s = seg(l); s.position.y = l / 2 + 0.06; j.add(s);
        const next = new T.Group(); next.position.y = l + 0.1; j.add(next); joints.push(j); parent = next;
      });
      f.rotation.z = (x) * -0.5; fingers.push({ joints, spread: x });
    });
    const thumb = new T.Group(); thumb.position.set(0.36, 0.3, 0.08); thumb.rotation.z = -0.65; arm.add(thumb);
    const tj = []; let tp = thumb;
    [0.32, 0.26].forEach((l) => { const j = new T.Group(); tp.add(j); const s = seg(l); s.scale.setScalar(1.15); s.position.y = l / 2 + 0.06; j.add(s); const n = new T.Group(); n.position.y = l + 0.1; j.add(n); tj.push(j); tp = n; });
    arm.rotation.set(0.35, -0.9, -0.62);
    return {
      scene, s3, camera: cam,
      update(p, time, extra = {}) {
        const rise = ease(span(extra.handoff != null ? extra.handoff : 1, 0.35, 1));
        const open = extra.handoff != null ? 0 : ease(span(p, 0, 0.6));
        arm.scale.setScalar(cam.aspect < 1 ? 0.95 : 1.25);
        beam.material.uniforms.uTime.value = time; beam.material.uniforms.uRes.value.set(innerWidth, innerHeight);
        beam.material.uniforms.uP.value = extra.handoff != null ? span(extra.handoff, 0.1, 0.8) : 1;
        arm.position.set(lerp(-0.5, 0.05, rise) + (reduce ? 0 : Math.sin(time * 0.6) * 0.03), lerp(-8, -1.15, rise) + open * 0.3, 0);
        fingers.forEach((f, i) => f.joints.forEach((j, k) => (j.rotation.x = lerp(0.55 + k * 0.3, 0.12 + k * 0.08, open) + (reduce ? 0 : Math.sin(time * 1.3 + i) * 0.03))));
        tj.forEach((j, k) => (j.rotation.x = lerp(0.5, 0.1, open) + k * 0.1));
        cam.fov = 40; cam.updateProjectionMatrix(); cam.position.set(mouse.sx * 0.3, 0.2 - mouse.sy * 0.15, 7.5); cam.lookAt(0.6, 0.1, 0);
      },
    };
  })();

  /* ---------------- interior: not edited — blue-gray wave light, edges split into a rainbow ---------------- */
  const interior = (() => {
    const scene = new T.Scene();
    const quad = screenQuad(`
      varying vec2 vUv; uniform float uTime; uniform vec2 uRes;
      float caust(vec2 p, float t){
        float c = 0.;
        for (int i = 0; i < 4; i++){ float fi = float(i);
          p += vec2(sin(p.y * 1.7 + t * .6 + fi), cos(p.x * 1.5 - t * .5 + fi * 1.3)) * .55;
          c += .5 / (abs(sin(p.x * 1.1 + t * .3) * sin(p.y * 1.3 - t * .25)) * 9. + .6); }
        return c;
      }
      void main(){
        vec2 q = vUv * vec2(uRes.x / uRes.y, 1.) * 3.2;
        float t = uTime * .35;
        float r = caust(q + vec2(.05, .01), t), g = caust(q, t), b = caust(q - vec2(.05, .01), t);
        vec3 base = mix(vec3(.3, .34, .4), vec3(.52, .56, .62), vUv.y * .6 + .2);
        vec3 c = base + pow(vec3(r, g, b) * .3, vec3(2.6)) * vec3(1.15, 1., 1.2);
        c = mix(c, vec3(.3, .35, .42), smoothstep(.2, .9, length(vUv - vec2(.15, .55))) * .25);
        gl_FragColor = vec4(c, 1.);
      }`);
    scene.add(quad);
    return { scene, camera: ortho, update(p, time) { quad.material.uniforms.uTime.value = time; quad.material.uniforms.uRes.value.set(innerWidth, innerHeight); } };
  })();

  const scenes = { arch, crystal, streams, flower, hand, interior };
  let current = { name: null, p: 0, extra: {}, fade: 0 };
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    // In portrait widen the view so the crystal and flower aren’t cropped
    cam.zoom = innerWidth < innerHeight ? 0.62 : 1; cam.updateProjectionMatrix();
  };
  addEventListener("resize", resize); resize();

  const t0 = performance.now();
  const frame = () => {
    const time = reduce ? 4 : (performance.now() - t0) / 1000;
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
    if (fadeEl) fadeEl.style.opacity = current.fade.toFixed(3);
    const s = scenes[current.name];
    if (!s) return;
    s.update(current.p, time, current.extra);
    if (s === hand) { renderer.autoClear = true; renderer.render(hand.scene, ortho); renderer.autoClear = false; renderer.clearDepth(); renderer.render(hand.s3, cam); renderer.autoClear = true; }
    else renderer.render(s.scene, s.camera);
  };
  if (window.gsap) gsap.ticker.add(frame); else { const loop = () => { frame(); requestAnimationFrame(loop); }; loop(); }
  // Shaders are pre-baked per scene while the entrance gate counts numbers — baking for the first time at entry would freeze the main thread for about 1s and skip the whole .9s the loader takes to lift
  (async () => {
    for (const s of Object.values(scenes)) {
      try {
        if (s === hand) { await renderer.compileAsync(hand.scene, ortho); await renderer.compileAsync(hand.s3, cam); }
        else await renderer.compileAsync(s.scene, s.camera);
      } catch {}
    }
  })();

  window.AeStage = {
    view(name, p, extra = {}, fade = 0) { current = { name, p, extra, fade }; },
    // Original useLandingEntry("full") Values: fog .095 → 3s power2.out · sunlight 0 → 1.6s · the ground rises from −.4 over 2.85s (after .15) and the view holds +11° for .15s then releases over 2.85s (both landingCameraEase) ·
    // light pillar 0 → 1.2s power2.inOut · light width .15 → .8s power2.out (both after .15) · light rays 0 → 1.1s sine.out (after .45). onArrive is called at 2.3s (when the menu bar appears)
    landingEntry(onArrive) {
      if (reduce) return onArrive && onArrive();
      Object.assign(entry, { fog: 0.095, sun: 0, spot: 0, angle: 0, shafts: 0, fov: 11, drift: -0.4 });
      gsap.timeline({ defaults: { ease: "none" } })
        .to(entry, { fog: 0.045, duration: 3, ease: "power2.out" }, 0)
        .to(entry, { sun: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(entry, { drift: 0, duration: 2.85, ease: landingEase }, 0.15)
        .to(entry, { fov: 0, duration: 2.85, ease: landingEase }, 0.15)
        .to(entry, { spot: 1, duration: 1.2, ease: "power2.inOut" }, 0.15)
        .to(entry, { angle: 1, duration: 0.8, ease: "power2.out" }, 0.15)
        .to(entry, { shafts: 1, duration: 1.1, ease: "sine.out" }, 0.45)
        .call(() => onArrive && onArrive(), null, 2.3);
    },
    crystal: crystal.state,
  };
})();
