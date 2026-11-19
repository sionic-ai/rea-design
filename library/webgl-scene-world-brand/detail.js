// Character ID card — a portrait plate with torn paper edges stands over a background shader where red light flows diagonally.
// The original loads OrbitControls but comments out the line that creates it, so the character doesn’t react to the cursor (0% even when swept across) — the panel doesn’t move with the cursor either.
// ?c=Swap three characters (original akeloo·aisa·nora) with 0·1·2 and show them, > The button turns to the next
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const step = (n = 1) => window.mpLoader?.step(n);
  const CHARS = [
    { name: "CHARA ONE", kana: "Your 【Item】 here", num: 1, hue: 0.55 },
    { name: "CHARA TWO", kana: "Your 【 Two 】 here", num: 2, hue: 0.08 },
    { name: "CHARA THREE", kana: "Your 【 Three 】 here", num: 3, hue: 0.8 },
  ];
  const idx = Math.max(0, Math.min(2, +(new URLSearchParams(location.search).get("c") ?? 0) || 0));
  const ch = CHARS[idx];
  $("[data-name]").textContent = ch.name;
  $("[data-kana]").textContent = ch.kana;
  $("[data-num]").textContent = ch.num;
  $(".dt-next").href = `detail.html?c=${(idx + 1) % 3}`;
  document.title = `${ch.name} — Your brand name here`;

  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (n) => {
    const el = document.createElement("i");
    el.style.color = `var(${n})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };
  const C = { accent: rgb("--kf-accent"), hot: rgb("--kf-accent-text"), bg: rgb("--kf-bg"), ink: rgb("--kf-ink"), paper: rgb("--kf-contrast-bg") };
  const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-heavy").trim();

  const canvas = $(".dt-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(devicePixelRatio * 0.5);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 3;

  const bgMat = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { time: { value: 0 }, a: { value: C.accent }, b: { value: C.hot }, c: { value: C.bg } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform float time; uniform vec3 a, b, c;
      void main(){ float d = vUv.x * 0.7 + vUv.y * 0.6; float s = sin(d * 3.0 - time * 0.25) * 0.5 + 0.5;
        vec3 col = mix(mix(c, a, 0.75), mix(a, b, 0.35), smoothstep(0.2, 0.9, s * (0.6 + vUv.y * 0.5)));
        gl_FragColor = vec4(col, 1.0); }`,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -1;
  scene.add(bg);

  // Portrait image — sky-blue background with a hatted figure silhouette (placeholder). Edges are torn by shader noise. Pressing a color swatch chip repaints the background in that chip’s color.
  const pc = document.createElement("canvas");
  pc.width = 512; pc.height = 640;
  const ctx = pc.getContext("2d");
  const draw = (sky) => {
    const g = ctx.createLinearGradient(0, 0, 0, 640);
    g.addColorStop(0, `#${sky.clone().offsetHSL(0, 0, 0.1).getHexString()}`);
    g.addColorStop(1, `#${sky.getHexString()}`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 640);
    ctx.fillStyle = `#${C.bg.clone().lerp(C.accent, 0.2).getHexString()}`;
    ctx.beginPath(); ctx.moveTo(60, 640); ctx.quadraticCurveTo(256, 380, 452, 640); ctx.fill();
    ctx.fillStyle = `#${C.paper.clone().lerp(C.accent, 0.25).getHexString()}`;
    ctx.beginPath(); ctx.ellipse(256, 330, 105, 135, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `#${new THREE.Color().setHSL((ch.hue + 0.5) % 1, 0.8, 0.55).getHexString()}`;
    ctx.beginPath(); ctx.ellipse(256, 230, 130, 95, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(126, 225, 260, 30);
    ctx.fillStyle = `#${C.ink.getHexString()}`;
    ctx.font = `700 18px ${font}`;
    ctx.fillText("3D character portrait · sky-blue background · portrait 4:5", 18, 620);
  };
  draw(new THREE.Color().setHSL(ch.hue, 0.75, 0.6));
  const tex = new THREE.CanvasTexture(pc);
  tex.colorSpace = THREE.SRGBColorSpace;
  document.querySelectorAll("[data-chip]").forEach((li) => li.addEventListener("click", () => {
    const c = getComputedStyle(li).backgroundColor;
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    draw(new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255));
    tex.needsUpdate = true;
  }));
  let beat = 0;
  $(".dt-like").addEventListener("click", (e) => { const b = e.currentTarget; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); beat = 1; });
  step(3);
  const photoMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide,
    uniforms: { map: { value: tex }, seed: { value: idx * 13.1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec2 vUv; uniform sampler2D map; uniform float seed;
      float h(float x){ return fract(sin(x * 91.7 + seed) * 43758.5); }
      float n(float x){ float i = floor(x), f = fract(x); return mix(h(i), h(i + 1.0), f * f * (3.0 - 2.0 * f)); }
      void main(){ float e = 0.035;
        float l = e * (0.4 + n(vUv.y * 22.0)) , r = 1.0 - e * (0.4 + n(vUv.y * 19.0 + 7.0));
        float b = e * (0.4 + n(vUv.x * 25.0 + 3.0)), t = 1.0 - e * (0.4 + n(vUv.x * 17.0 + 11.0));
        if (vUv.x < l || vUv.x > r || vUv.y < b || vUv.y > t) discard;
        gl_FragColor = texture2D(map, vUv); }`,
  });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.56, 1, 1), photoMat);
  photo.position.set(0.15, 0.05, 0);
  photo.rotation.z = -0.06;
  scene.add(photo);
  step(2);

  const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); photo.position.x = innerWidth < 960 ? 0 : 0.15; };
  resize();
  addEventListener("resize", resize);
  let first = false;
  const t0 = performance.now();
  gsap.ticker.add(() => {
    const t = (performance.now() - t0) / 1000;
    bgMat.uniforms.time.value = reduce ? 0 : t;
    beat *= 0.9;
    photo.scale.setScalar(1 + beat * 0.06);
    renderer.render(scene, camera);
    if (!first) { first = true; step(4); }
  });
})();
