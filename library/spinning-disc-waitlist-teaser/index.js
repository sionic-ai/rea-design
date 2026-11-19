// 3D stage — values of the original three scene were measured and rebuilt with our own shapes · our own shaders (the original CD model · environment photo · light image are not used).
//  · camera FOV 25°·z 28, orbit dragged horizontally only (damping .06), fog 25~40
//  · CD: size 3, initial y rotation 2.1, inner tilt (-.75, -.5, -.5). Spins .5 rad per second (+2 rad while pressed)
//    the data face is mirror metal with an angular rainbow (rainbow band read as sin(-r·.4 + angle·5)·cos(r·.2 + angle·4.5)), the brand face is a white panel rough only where printed
//  · Five lasers: circle 20 high on top (radius = aims at a drifting target (10~30 depending on mouse x). If it hits the CD, a reflection line and light card appear along the normal at that spot
//  · While held (0→1 with .05 friction) the lasers gather into a single line from -2 to 2, drive straight down onto the CD, and the circle spins fast
//  · At the end the screen is adjusted once more with levels (max 1.1) · saturation 1.1
(() => {
  const THREE = window.THREE;
  const canvas = document.querySelector(".d-gl");
  const ui = document.querySelector(".d-ui");
  if (!THREE || !canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Skin color to a three color — paint the variable and take the computed rgb
  const swatch = document.createElement("i");
  swatch.style.cssText = "position:absolute;visibility:hidden";
  document.body.append(swatch);
  const cssColor = (v) => { swatch.style.color = `var(${v})`; return getComputedStyle(swatch).color; };
  const tColor = (v) => new THREE.Color().setStyle(cssColor(v));
  const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const pr = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pr);
  const scene = new THREE.Scene();
  const bg = tColor("--kf-bg");
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 25, 40);
  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
  camera.position.set(0, 0, 28);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

  // Rainbow band — the very color of CD diffraction light, so it stays regardless of skin
  const iriCanvas = document.createElement("canvas");
  iriCanvas.width = 256; iriCanvas.height = 4;
  const ig = iriCanvas.getContext("2d"), grad = ig.createLinearGradient(0, 0, 256, 0);
  [[0, "#8d9196"], [0.2, "#d8f6ff"], [0.36, "#86cfe0"], [0.5, "#9aa7e8"], [0.62, "#c3c4de"], [0.8, "#e9eef2"], [1, "#8d9196"]].forEach(([o, c]) => grad.addColorStop(o, c)); // Not skin: CD diffraction rainbow colors
  ig.fillStyle = grad; ig.fillRect(0, 0, 256, 4);
  const iriTex = new THREE.CanvasTexture(iriCanvas);
  iriTex.wrapS = iriTex.wrapT = THREE.RepeatWrapping;
  iriTex.colorSpace = THREE.SRGBColorSpace;

  // Label face art — uses only two values, white (print) and black (bare face). The shader picks roughness, metalness and rainbow strength from the red value
  const label = document.createElement("canvas");
  label.width = label.height = 1024;
  const lg = label.getContext("2d");
  lg.fillStyle = "#000"; lg.fillRect(0, 0, 1024, 1024); // Not skin: value read by the shader (0=Plain face)
  lg.fillStyle = "#fff"; lg.strokeStyle = "#fff"; // Not skin: value read by the shader (1=Print)
  lg.textAlign = "center";
  lg.font = `800 118px ${font}`;
  lg.fillText("Brand.fm", 512, 265);
  const bloom = (cx, cy, r) => { for (let a = 0; a < 6; a++) { lg.beginPath(); lg.ellipse(cx + Math.cos((a * Math.PI) / 3) * r, cy + Math.sin((a * Math.PI) / 3) * r, r * 0.55, r * 0.3, (a * Math.PI) / 3, 0, Math.PI * 2); lg.fill(); } };
  bloom(250, 520, 34); bloom(774, 520, 30);
  lg.lineWidth = 6; lg.beginPath(); lg.arc(512, 512, 205, 0, Math.PI * 2); lg.stroke();
  [[700, 300], [728, 240], [756, 170]].forEach(([y, w]) => lg.fillRect(512 - w / 2, y, w, 10));
  lg.beginPath(); lg.roundRect(452, 790, 120, 26, 13); lg.fill();
  const labelTex = new THREE.CanvasTexture(label);
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const discMaterial = (opts) => {
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.9, envMap: env, envMapIntensity: 1.5, ...opts }); // Not skin: shader base white (for light calculation)
    mat.envMapRotation.y = 1.2;
    mat.userData.uRot = { value: new THREE.Vector3() };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uRot = mat.userData.uRot;
      sh.uniforms.uIri = { value: iriTex };
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uRot;\nvarying vec3 vDisc;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvDisc = position; float cR = cos(uRot.y), sR = sin(uRot.y); vDisc.xy = mat2(cR, sR, -sR, cR) * vDisc.xy;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uRot;\nuniform sampler2D uIri;\nvarying vec3 vDisc;\nfloat dRand(vec2 n){ return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453); }\nfloat dNoise(vec2 n){ vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n)); return mix(mix(dRand(b), dRand(b + vec2(1.0, 0.0)), f.x), mix(dRand(b + vec2(0.0, 1.0)), dRand(b + vec2(1.0)), f.x), f.y); }")
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(vec3(0.9), vec3(1.0), diffuseColor.r);")
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nfloat dIri = 1.0;\n#ifdef USE_MAP\nroughnessFactor = mix(0.0, 0.7, sampledDiffuseColor.r);\ndIri = 1.0 - sampledDiffuseColor.r;\n#endif")
        .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n#ifdef USE_MAP\nmetalnessFactor = mix(0.4, 0.7, sampledDiffuseColor.r);\n#endif")
        .replace("#include <opaque_fragment>", `#include <opaque_fragment>
          float dAng = mod(atan(vDisc.y, vDisc.x), 2.0 * PI) / (2.0 * PI);
          float dVal = sin(-uRot.y * 0.4 + dAng * 5.0) * cos(uRot.y * 0.2 + dAng * 4.5);
          vec2 dJit = vec2(dNoise(vDisc.xy * 500.0) - 0.5) * 0.033;
          vec3 dCol = texture2D(uIri, vec2(dVal, 0.5) + dJit).rgb;
          float dMask = smoothstep(0.0, 0.1, dAng) - smoothstep(0.9, 1.0, dAng);
          gl_FragColor.rgb += dMask * dIri * (dCol - 0.25);`);
    };
    return mat;
  };

  // CD — radius 1 (hole .13, transparent middle .13~.3), thickness .03
  const cd = new THREE.Group();
  cd.scale.setScalar(3);
  cd.rotation.y = 2.1;
  cd.position.y = 0.75;
  scene.add(cd);
  const inner = new THREE.Group();
  inner.rotation.set(-0.75, -0.5, -0.5);
  cd.add(inner);
  const dataMat = discMaterial({});
  const labelMat = discMaterial({ map: labelTex });
  const dataFace = new THREE.Mesh(new THREE.RingGeometry(0.3, 1, 160, 1).rotateY(Math.PI), dataMat);
  dataFace.position.z = -0.015;
  const labelFace = new THREE.Mesh(new THREE.RingGeometry(0.3, 1, 160, 1), labelMat);
  labelFace.position.z = 0.015;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.03, 160, 1, true).rotateX(Math.PI / 2), dataMat);
  const hubMat = new THREE.MeshStandardMaterial({ color: tColor("--kf-raised"), roughness: 0.15, metalness: 0.2, envMap: env, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 96, 1, false).rotateX(Math.PI / 2), hubMat);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.13, 64), new THREE.MeshBasicMaterial({ color: bg, transparent: true, opacity: 0.85 }));
  hole.position.z = 0.016;
  const holeBack = hole.clone(); holeBack.position.z = -0.016; holeBack.rotation.y = Math.PI;
  inner.add(dataFace, labelFace, rim, hub, hole, holeBack);
  // Hit-test loops (front and back) — with skeleton view on they show as blue and red
  const hitFront = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.99, 32, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.FrontSide, visible: false })); // Not skin: skeleton view marker color
  hitFront.position.z = 0.01;
  const hitBack = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.99, 32, 1).rotateZ(Math.PI), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.BackSide, visible: false })); // Not skin: skeleton view marker color
  hitBack.position.z = -0.02;
  inner.add(hitFront, hitBack);
  const hitMeshes = [hitFront, hitBack];

  // Laser
  const N = 5, accent = tColor("--kf-accent");
  const beamGeo = new THREE.CylinderGeometry(0.017, 0.017, 100).translate(0, 50, 0).rotateX(Math.PI / 2);
  const glowGeo = new THREE.CylinderGeometry(0.04, 0.04, 100).translate(0, 50, 0).rotateX(Math.PI / 2);
  const beamMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 });
  const glowMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, N), glows = new THREE.InstancedMesh(glowGeo, glowMat, N);
  const refl = new THREE.InstancedMesh(beamGeo, beamMat, N), reflGlows = new THREE.InstancedMesh(glowGeo, glowMat, N);
  glows.renderOrder = reflGlows.renderOrder = 2;
  [beams, glows, refl, reflGlows].forEach((m) => { m.frustumCulled = false; scene.add(m); });
  // Light card at the hit spot: blurred ellipse 1.7 wide by .43 tall
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 256; glowCanvas.height = 64;
  const gg = glowCanvas.getContext("2d"), rg = gg.createRadialGradient(128, 32, 0, 128, 32, 128);
  rg.addColorStop(0, cssColor("--kf-raised")); rg.addColorStop(0.25, cssColor("--kf-accent")); rg.addColorStop(1, "rgba(0,0,0,0)"); // Not skin: light edge transparency
  gg.setTransform(1, 0, 0, 0.25, 0, 24); gg.fillStyle = rg; gg.fillRect(0, -128, 256, 512);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const quadGlowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const quadWireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }); // Not skin: skeleton view marker color
  const quads = new THREE.InstancedMesh(new THREE.PlaneGeometry(2 * 0.85, 0.5 * 0.85), quadGlowMat, N);
  quads.renderOrder = 3; quads.frustumCulled = false;
  scene.add(quads);
  const arrows = Array.from({ length: N }, () => { const a = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.75, 0xffffff, 0.2, 0.2); a.visible = false; scene.add(a); return a; }); // Not skin: skeleton view marker color

  const lasers = Array.from({ length: N }, (_, i) => ({ angle: (i / N) * Math.PI * 2, dummy: new THREE.Object3D(), target: new THREE.Vector3(), length: 100, rDummy: new THREE.Object3D(), hit: false }));
  const ray = new THREE.Raycaster(), dir = new THREE.Vector3(), nm = new THREE.Matrix3(), tmp = new THREE.Vector3(), q = new THREE.Object3D();
  const lerp = (a, b, t) => a + (b - a) * t;
  const remap = (v, a, b, c, d, clamp) => { let t = (v - a) / (b - a); if (clamp) t = Math.min(1, Math.max(0, t)); return c + (d - c) * t; };

  // Mouse and press — each frame it follows (target − current) × .05 × ms × .16 (original friction .05)
  const mouse = { x: 0, y: 0 }, mouseS = { x: 0, y: 0 };
  let down = 0, downS = 0, T = 0, debug = false;
  canvas.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1; });
  canvas.addEventListener("pointerdown", () => (down = 1));
  addEventListener("pointerup", () => (down = 0));
  addEventListener("pointercancel", () => (down = 0));

  const updateLasers = (dt) => {
    T += dt * 0.05;
    lasers.forEach((L, i) => {
      const t = i + 1;
      const radius = lerp(remap(mouseS.x, -1, 1, 10, 30, true), 20, downS);
      L.angle += dt * 0.05 + dt * downS * 4;
      const lineX = remap(t, 0, N + 1, -2, 2);
      L.dummy.position.set(radius * Math.sin(L.angle), 20, radius * Math.cos(L.angle)).lerp(tmp.set(lineX, 20, 0), downS);
      L.target.set(2 * Math.sin(0.537 * T * t + 3816.2372 * t), 5 * Math.sin(T * t + 83737.7463 * t) + mouseS.y * 10, 2 * Math.cos(0.823646 * T * t + 7361.836 * t)).lerp(tmp.set(lineX, 0, 0), downS);
      L.dummy.lookAt(L.target);
      L.dummy.updateMatrixWorld();
      ray.set(L.dummy.position, L.dummy.getWorldDirection(dir));
      const hits = ray.intersectObjects(hitMeshes, false);
      if (hits.length) {
        const h = hits[0], n = h.face.normal.clone().applyMatrix3(nm.getNormalMatrix(h.object.matrixWorld)).normalize();
        L.length = h.distance;
        L.rDummy.position.copy(h.point);
        L.rDummy.lookAt(tmp.copy(h.point).add(n));
        L.rDummy.scale.setScalar(1);
        L.hit = true;
        q.position.copy(h.point).addScaledVector(n, 0.03);
        q.quaternion.copy(L.rDummy.quaternion);
        q.scale.setScalar(1);
        arrows[i].position.copy(h.point); arrows[i].setDirection(n); arrows[i].visible = debug;
      } else {
        L.length = 100; L.hit = false;
        L.rDummy.scale.setScalar(0);
        q.scale.setScalar(0);
        arrows[i].visible = false;
      }
      L.rDummy.updateMatrix();
      q.updateMatrix();
      quads.setMatrixAt(i, q.matrix);
      L.dummy.scale.set(1, 1, L.length / 100);
      L.dummy.updateMatrix();
      beams.setMatrixAt(i, L.dummy.matrix); glows.setMatrixAt(i, L.dummy.matrix);
      refl.setMatrixAt(i, L.rDummy.matrix); reflGlows.setMatrixAt(i, L.rDummy.matrix);
    });
    [beams, glows, refl, reflGlows, quads].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  };

  // Final picks: level (0 · 1 · 1.1) and saturation 1.1
  const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });
  const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: rt.texture }, uLevels: { value: new THREE.Vector3(0, 1, 1.1) }, uSat: { value: 1.1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 uLevels; uniform float uSat; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        vec3 col = min(max(c.rgb - vec3(uLevels.x), vec3(0.0)) / (vec3(uLevels.z) - vec3(uLevels.x)), vec3(1.0));
        col = pow(col, vec3(1.0 / uLevels.y));
        float lum = dot(col, vec3(0.2125, 0.7154, 0.0721));
        gl_FragColor = vec4(mix(vec3(lum), col, uSat), 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  }));
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  post.frustumCulled = false;
  postScene.add(post);

  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    rt.setSize(Math.round(w * pr), Math.round(h * pr));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    controls.target.set(0, w < 400 ? -1 : 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  const render = () => {
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  };
  const frame = (dt) => {
    const h = Math.min(dt * 1000, 50) * 0.05 * 0.16;
    mouseS.x += (mouse.x - mouseS.x) * h; mouseS.y += (mouse.y - mouseS.y) * h;
    downS += (down - downS) * h;
    cd.rotation.y -= dt * 0.5 + downS * dt * 2;
    dataMat.userData.uRot.value.set(cd.rotation.x, cd.rotation.y, cd.rotation.z);
    labelMat.userData.uRot.value.copy(dataMat.userData.uRot.value);
    cd.updateMatrixWorld(true);
    updateLasers(dt);
    controls.update();
    render();
    sound(dt);
  };

  // Sound — prepared on the first press, and while the laser hits the CD each laser rings its set note (D♭4·F♯4·B3·B4·D♭5). The original background music file isn’t used
  let audio = null, muted = false;
  const NOTES = [277.18, 369.99, 246.94, 493.88, 554.37];
  const initAudio = () => {
    removeEventListener("pointerdown", initAudio);
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx(), master = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 1200; filter.Q.value = 4;
    master.gain.value = 0.06;
    filter.connect(master).connect(ctx.destination);
    const voices = NOTES.map((f) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.value = 0; o.connect(g).connect(filter); o.start(); return { g, on: false }; });
    audio = { ctx, master, filter, voices, t: 0 };
    document.dispatchEvent(new CustomEvent("d:audio"));
  };
  addEventListener("pointerdown", initAudio);
  document.addEventListener("d:mute", (e) => { muted = e.detail.muted; if (audio) audio.master.gain.setTargetAtTime(muted ? 0 : 0.06, audio.ctx.currentTime, 0.05); });
  const sound = (dt) => {
    if (!audio) return;
    audio.t += dt;
    audio.filter.frequency.value = 1200 * Math.pow(2, Math.sin(audio.t * Math.PI) * 1.5);
    lasers.forEach((L, i) => {
      const v = audio.voices[i];
      if (L.hit && !v.on) v.g.gain.setTargetAtTime(1, audio.ctx.currentTime, 0.02);
      if (!L.hit && v.on) v.g.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.25);
      v.on = L.hit;
    });
  };

  // Skeleton view — fit rings, normal arrows, light card borders
  const sw = document.getElementById("d-debug");
  sw?.addEventListener("change", () => {
    debug = sw.checked;
    hitFront.material.visible = hitBack.material.visible = debug;
    quads.material = debug ? quadWireMat : quadGlowMat;
    if (reduce) { updateLasers(0); render(); }
  });

  let last = 0, raf = 0;
  const loop = (now) => {
    const dt = last ? Math.min(0.1, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!reduce && !raf) { last = 0; raf = requestAnimationFrame(loop); } });
  if (reduce) {
    updateLasers(0); controls.update(); render();
    controls.addEventListener("change", render);
    addEventListener("resize", render);
  } else raf = requestAnimationFrame(loop);

  // When the scene is fully up, retire the spinning wheel and raise the card — notify after the card parts attach (one frame after the document is fully read)
  const ready = () => requestAnimationFrame(() => setTimeout(() => {
    ui.querySelector(":scope > .d-spin")?.classList.add("is-off");
    ui.dispatchEvent(new CustomEvent("fx:ready"));
  }, 0));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
