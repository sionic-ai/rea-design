// First page only: hero screen wheel and 3D markers in the Work section
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const whenReady = (fn) => (root.hasAttribute("data-ready") ? fn() : addEventListener("dz:ready", fn, { once: true }));

  // ── Screen wheel ─────────────────────────
  const SHOTS = [
    "Laptop · Dark background", "Cafe home screen · green table", "Orange poster screen", "Blue government site",
    "Plant café · laptop", "Three mobile screens", "Laptop with black stand", "White background dashboard",
    "Menu board screen · Dark brown", "Photo grid view", "Event schedule screen", "History screen",
    "Horizontal banner strip", "Map screen", "Booking form screen", "Login screen",
  ];
  const wheel = document.querySelector(".dz-wheel");
  const track = wheel.querySelector(".dz-wheel__track");
  const N = 8;
  track.innerHTML = Array.from({ length: N }, (_, i) => `
    <div class="dz-wheel__tile">
      <div class="dz-wheel__face"><div class="wf-img" data-label="Work screen ${String(i + 1).padStart(2, "0")} · ${SHOTS[i]} · 16:10"></div></div>
      <div class="dz-wheel__face dz-wheel__face--back"><div class="wf-img" data-label="Work screen ${String(i + 9).padStart(2, "0")} · ${SHOTS[i + 8]} · 16:10"></div></div>
    </div>`).join("");
  const tiles = track.querySelectorAll(".dz-wheel__tile");
  const rig = wheel.querySelector(".dz-wheel__rig");
  const auto = wheel.querySelector(".dz-wheel__auto");
  tiles.forEach((t, i) => gsap.set(t, { yPercent: -50, rotationY: (360 / N) * i }));

  whenReady(() => {
    wheel.setAttribute("data-ready", "");
    if (reduce.matches) return;
    gsap.to(auto, { rotationY: 360, duration: 18, repeat: -1, ease: "none" });
    if (!fine.matches) return;
    const rz = gsap.quickTo(rig, "rotation", { duration: 0.7, ease: "power2.out" });
    const rx = gsap.quickTo(rig, "rotationX", { duration: 0.7, ease: "power2.out" });
    const ry = gsap.quickTo(track, "rotationY", { duration: 0.7, ease: "power2.out" });
    let spin = 14;
    addEventListener("pointermove", (e) => {
      const w = Math.max(document.documentElement.clientWidth, 1);
      const h = Math.max(innerHeight, 1);
      rz(gsap.utils.mapRange(0, w, -10, 10, gsap.utils.clamp(0, w, e.clientX)));
      rx(gsap.utils.mapRange(0, h, 16, -16, gsap.utils.clamp(0, h, e.clientY)));
    }, { passive: true });
    addEventListener("wheel", (e) => ry((spin += e.deltaY / 14)), { passive: true });
  });

  // ── 3D markers ───────────────────────
  const sec = document.querySelector(".dz-work");
  const host = sec.querySelector(".dz-mark");
  const slots = [...sec.querySelectorAll("[data-mark-slot]")];
  const desk = matchMedia("(min-width: 900px)");
  if (!window.THREE || !desk.matches || reduce.matches || !slots.length) return;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const room = new THREE.RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(room);
  scene.environment = envRT.texture;
  room.dispose();

  const cam = new THREE.OrthographicCamera(-28, 28, 28, -28, 0.1, 200);
  cam.position.z = 90;
  const group = new THREE.Group();
  scene.add(group);

  // Resolve the skin variable into rgb that canvas and three accept
  const probe = document.createElement("i");
  probe.style.display = "none";
  host.appendChild(probe);
  // oklch and color-mix keep that form even as computed values, which three can’t read, so paint it on 1px and read it back as sRGB
  const px1 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  px1.canvas.width = px1.canvas.height = 1;
  const paint = (v) => {
    probe.style.color = v;
    px1.clearRect(0, 0, 1, 1);
    px1.fillStyle = getComputedStyle(probe).color;
    px1.fillRect(0, 0, 1, 1);
    const [r, g, b] = px1.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Draws the case screen placeholder on a canvas and applies it to the marker surface — when using a real photo, use an image texture instead of this canvas (coverAspect fits the ratio)
  const drawCover = (c, i, label) => {
    const g = c.getContext("2d");
    const tone = ["var(--kf-ink)", "color-mix(in oklab, var(--kf-ink) 80%, var(--kf-accent))", "color-mix(in oklab, var(--kf-ink) 88%, var(--kf-accent-text))"][i % 3];
    const bg = g.createLinearGradient(0, 0, c.width, c.height);
    bg.addColorStop(0, paint(tone));
    bg.addColorStop(1, paint("oklch(from var(--kf-ink) calc(l * .92) c h)"));
    g.fillStyle = bg;
    g.fillRect(0, 0, 960, 1200);
    g.fillStyle = paint("var(--kf-raised)");
    g.fillRect(150, 300, 660, 420);
    g.fillStyle = paint(["color-mix(in oklab, var(--kf-accent) 45%, var(--kf-dim))", "color-mix(in oklab, var(--kf-accent) 60%, var(--kf-raised))", "var(--kf-accent)"][i % 3]);
    g.fillRect(180, 400, 600, 260);
    g.fillStyle = paint("var(--kf-ink)");
    g.fillRect(180, 330, 240, 22);
    g.fillRect(560, 330, 220, 22);
    g.fillStyle = paint("color-mix(in oklab, var(--kf-ink) 80%, var(--kf-bg))");
    g.fillRect(110, 720, 740, 30);
    g.fillStyle = paint("var(--kf-bg)");
    g.font = `500 34px ${getComputedStyle(root).getPropertyValue("--kf-font-mono")}`;
    g.textAlign = "center";
    label.split(" · ").forEach((line, k) => g.fillText(line, 480, 880 + k * 48));
  };
  const covers = slots.map((slot, i) => {
    const c = document.createElement("canvas");
    c.width = 960;
    c.height = 1200;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.userData = { draw: () => { drawCover(c, i, slot.querySelector(".wf-img")?.dataset.label || `Work ${i + 1}`); tex.needsUpdate = true; } };
    return tex;
  });
  const coverAspect = (t) => t.image.width / t.image.height;

  // Front and back face base grain: a diagonal paper color brightest at the top right — the body color is multiplied
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = 256;
  grainCanvas.height = 320;
  const faceTex = new THREE.CanvasTexture(grainCanvas);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.repeat.set(1 / 32, 1 / 40);
  const drawFace = () => {
    const g = grainCanvas.getContext("2d");
    const grad = g.createLinearGradient(230, 10, 22, 310);
    grad.addColorStop(0, paint("oklch(from var(--site-paper) calc(l + (1 - l) * .3) c h)"));
    grad.addColorStop(0.48, paint("var(--site-paper)"));
    grad.addColorStop(1, paint("color-mix(in oklab, var(--site-paper) 88%, var(--kf-accent-text))"));
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 320);
    faceTex.needsUpdate = true;
  };

  const U = {
    uLamp: { value: new THREE.Vector3() },
    uLampTint: { value: new THREE.Color() },
    uFrom: { value: covers[0] },
    uTo: { value: covers[0] },
    uAspect: { value: new THREE.Vector2(1, 1) },
    uTurn: { value: new THREE.Vector3() },
    uCover: { value: 0 },
  };
  // Using marker coordinates (32 wide · 40 tall, center 0), one case image is split across three bars. Each bar moves on to the next case on its own turn
  const COVER = `
    uniform sampler2D uFrom;
    uniform sampler2D uTo;
    uniform vec2 uAspect;
    uniform vec3 uTurn;
    uniform float uCover;
    varying vec2 vMark;
    vec2 fitMark(vec2 p, float aspect) {
      vec2 st = p / vec2(32.0, 40.0);
      st *= aspect > 0.8 ? vec2(0.8 / aspect, 1.0) : vec2(1.0, aspect / 0.8);
      return st + 0.5;
    }
    vec3 coverAt(vec2 p, float lod) {
      float turn = p.y > 7.0 ? uTurn.x : (p.y < -7.0 ? uTurn.z : uTurn.y);
      vec3 a = texture2D(uFrom, fitMark(p, uAspect.x), lod).rgb;
      vec3 b = texture2D(uTo, fitMark(p, uAspect.y), lod).rgb;
      return mix(a, b, turn);
    }`;
  // Brushed metal: long grain along the bar length, a single beam of light toward the lamp
  const BRUSH = `
    uniform vec3 uLamp;
    uniform vec3 uLampTint;
    varying vec3 vAlong;
    float hash12(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    float vnoise(vec2 p) {
      vec2 c = floor(p), f = fract(p);
      vec2 w = f * f * (3.0 - 2.0 * f);
      float a = hash12(c), b = hash12(c + vec2(1.0, 0.0)), d = hash12(c + vec2(0.0, 1.0)), e = hash12(c + vec2(1.0));
      return mix(mix(a, b, w.x), mix(d, e, w.x), w.y);
    }
    float brushGrain() { return 0.6 * vnoise(vMark * vec2(0.22, 9.0)) + 0.4 * vnoise(vMark * vec2(0.5, 23.0)); }
    float lampStreak(vec3 viewPos) {
      vec3 toLamp = uLamp - viewPos;
      vec3 h = normalize(normalize(toLamp) + vec3(0.0, 0.0, 1.0));
      float t = dot(normalize(vAlong), h);
      float sinTH = sqrt(max(1.0 - t * t, 0.0));
      float falloff = 1.0 / (1.0 + dot(toLamp.xy, toLamp.xy) / 520.0);
      return (pow(sinTH, 260.0) + 0.14 * pow(sinTH, 28.0)) * falloff;
    }`;

  const faceMat = new THREE.MeshPhysicalMaterial({ map: faceTex, metalness: 0.72, roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.16, envMapIntensity: 0.1 });
  faceMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = `varying vec2 vMark;\nvarying vec3 vAlong;\n${sh.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
      vMark = position.xy;
      vAlong = (modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz;`);
    sh.fragmentShader = `${COVER}\n${BRUSH}\n${sh.fragmentShader}`.replace("#include <opaque_fragment>", `
      vec3 spec = min(max(outgoingLight - totalDiffuse, vec3(0.0)), vec3(0.12));
      float grain = brushGrain();
      vec3 body = diffuseColor.rgb * 0.68;
      if (uCover > 0.0) body = mix(body, coverAt(vMark, 0.0), uCover);
      outgoingLight = body * (1.0 + mix(0.1, 0.04, uCover) * (grain - 0.5)) + spec * 0.22;
      outgoingLight += uLampTint * lampStreak(-vViewPosition) * (0.7 + 0.3 * grain);
      #include <opaque_fragment>`);
  };
  // Side faces blur-inherit the front image and get darker toward the back
  const sideMat = new THREE.MeshPhysicalMaterial({ metalness: 0.25, roughness: 0.48, clearcoat: 0.48, clearcoatRoughness: 0.24, envMapIntensity: 0.5 });
  sideMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = `varying vec2 vMark;\nvarying float vDepth;\n${sh.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>
      vMark = position.xy;
      vDepth = position.z;`);
    sh.fragmentShader = `${COVER}\nvarying float vDepth;\n${sh.fragmentShader}`.replace("#include <color_fragment>", `#include <color_fragment>
      if (uCover > 0.0) {
        vec3 rim = coverAt(vMark * 0.94, 4.5);
        float front = smoothstep(-2.4, 2.65, vDepth);
        diffuseColor.rgb = mix(diffuseColor.rgb, rim * mix(0.22, 1.15, front * front), uCover);
      }`);
  };

  // Three bars: panels with a semicircular right end, each shifted 3.2 more to the right going down (same shape as shared.js MARK)
  const BARS = [[0, 26, 28], [3.2, 32, 14], [6.4, 28, 0]];
  const geos = [];
  const bars = BARS.map(([x0, x1, y0]) => {
    const s = new THREE.Shape();
    const r = 6, y1 = y0 + 12;
    s.moveTo(x0 + 1.4, y0);
    s.lineTo(x1 - r, y0);
    s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(x0 + 1.4, y1);
    s.quadraticCurveTo(x0, y1, x0, y1 - 1.4);
    s.lineTo(x0, y0 + 1.4);
    s.quadraticCurveTo(x0, y0, x0 + 1.4, y0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 4, steps: 1, bevelEnabled: true, bevelThickness: 0.65, bevelSize: 0.5, bevelSegments: 4, curveSegments: 16 });
    geo.translate(-16, -20, -2);
    geo.computeBoundingBox();
    geos.push(geo);
    const cy = geo.boundingBox.getCenter(new THREE.Vector3()).y;
    const mesh = new THREE.Mesh(geo, [faceMat, sideMat]);
    mesh.castShadow = true;
    mesh.position.y = -cy;
    const pivot = new THREE.Group();
    pivot.position.y = cy;
    pivot.add(mesh);
    group.add(pivot);
    return { pivot, y: cy, tiltX: 0, tiltY: 0, lift: 0, slide: 0, spin: 0, swing: 0, trail: new THREE.Vector2() };
  });

  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.17 });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), shadowMat);
  shadowPlane.position.z = -6;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xfff0d9, 1.2);
  key.position.set(-15, 40, 25);
  scene.add(key);
  const lamp = new THREE.PointLight(0xffe7c6, 230, 75, 2);
  lamp.position.set(-8, 28, 18);
  scene.add(lamp);
  const caster = new THREE.DirectionalLight(0xfff8ef, 0.55);
  caster.position.set(-7, 12, 55);
  caster.castShadow = true;
  caster.shadow.mapSize.set(1024, 1024);
  Object.assign(caster.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 });
  caster.shadow.blurSamples = 16;
  caster.shadow.radius = 5;
  caster.shadow.normalBias = 0.02;
  scene.add(caster);
  const rim = new THREE.DirectionalLight(0xdbe8ff, 0.65);
  rim.position.set(22, -10, 25);
  scene.add(rim);

  // Body color follows the marker box’s text color (accent text color — brown on paper boards, apricot on ink boards)
  const tint = () => {
    const c = new THREE.Color(getComputedStyle(host).color);
    faceMat.color.copy(c).multiplyScalar(0.7);
    sideMat.color.copy(c).multiplyScalar(0.65);
    U.uLampTint.value.copy(c).lerp(new THREE.Color(1, 1, 1), 0.7).multiplyScalar(0.8);
    shadowMat.color.set(paint("color-mix(in oklab, var(--kf-ink) 80%, var(--kf-accent-text))"));
    drawFace();
    covers.forEach((t) => t.userData.draw());
  };
  tint();
  new MutationObserver(tint).observe(root, { attributes: true, attributeFilter: ["data-theme", "style"] });

  const resize = () => {
    const w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    const a = w / h;
    Object.assign(cam, { left: -28 * a, right: 28 * a });
    cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  new ResizeObserver(resize).observe(host);

  // Section where the case changes: each piece turns once for 1.5s after a 260ms delay (cubic inOut), and at 30~70% of it the face image blends into the next case
  const SPAN = 1500 + 260 * (bars.length - 1);
  let shown = 0, target = 0;
  const showAt = (a) => {
    const i0 = Math.min(Math.floor(a), covers.length - 1);
    const i1 = Math.min(i0 + 1, covers.length - 1);
    const f = a - i0;
    U.uFrom.value = covers[i0];
    U.uTo.value = covers[i1];
    U.uAspect.value.set(coverAspect(covers[i0]), coverAspect(covers[i1]));
    const turn = bars.map((b, k) => {
      const n = Math.min(1, Math.max(0, (f * SPAN - 260 * k) / 1500));
      const e = n < 0.5 ? 4 * n * n * n : 1 - (-2 * n + 2) ** 3 / 2;
      b.spin = e * Math.PI * 2;
      const m = Math.min(1, Math.max(0, (e - 0.3) / 0.4));
      return m * m * (3 - 2 * m);
    });
    U.uTurn.value.fromArray(turn);
  };

  const REST = { x: -0.18, y: -0.28 };
  let baseX = REST.x, baseY = REST.y, swayY = 0, swayX = 0;
  const trailDir = new THREE.Vector2();
  const ptr = new THREE.Vector2(), ptrS = new THREE.Vector2();
  const lampRest = new THREE.Vector2(-9, 24), lampAt = lampRest.clone();
  let active = 0, activeS = 0;
  addEventListener("pointermove", (e) => {
    if (!fine.matches) return;
    const i = e.clientX / Math.max(innerWidth, 1) - 0.5;
    const r = e.clientY / Math.max(innerHeight, 1) - 0.5;
    baseY = REST.y + 0.5 * i;
    baseX = REST.x - 0.35 * r;
    const b = host.getBoundingClientRect();
    const s = 56 / Math.max(b.height, 1);
    ptr.set(gsap.utils.clamp(-44, 44, (e.clientX - b.left - b.width / 2) * s), gsap.utils.clamp(-44, 44, -(e.clientY - b.top - b.height / 2) * s));
    active = 1;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { baseX = REST.x; baseY = REST.y; active = 0; });

  let rects = [];
  const measure = () => {
    const s = sec.getBoundingClientRect();
    rects = slots.map((el) => { const r = el.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, h: r.height }; });
  };
  new ResizeObserver(measure).observe(sec);
  measure();
  const easeTravel = (e, t) => {
    if (e <= 0) return 0;
    if (e >= t) return t;
    const r = Math.min(220, t / 2), n = t / (t - r);
    return e < r ? (n * e * e) / (2 * r) : e > t - r ? t - (n * (t - e) ** 2) / (2 * r) : n * (e - r / 2);
  };
  let prev = null;
  const drift = { across: 0, down: 0, scroll: 0 };
  const follow = () => {
    const top = sec.getBoundingClientRect().top;
    const e = innerHeight / 2 - top;
    let a = 0;
    for (let t = 0; t < rects.length - 1 && !(e < rects[t].y); t++) {
      const dy = rects[t + 1].y - rects[t].y;
      const nx = Math.abs(rects[t + 1].x - rects[t].x) / dy;
      const i = Math.min(1, Math.max(0.5, 1.5 * nx));
      const s = Math.min(1, Math.max(0, (i / Math.max(nx, 0.001) - 1) / 0.5));
      const o = Math.min(1, Math.max(0, ((e - rects[t].y) / dy - (1 - i) / 2) / i));
      a = t + o + s * (o * o * (3 - 2 * o) - o);
    }
    const A = rects[Math.min(Math.floor(a), rects.length - 1)];
    const B = rects[Math.min(Math.floor(a) + 1, rects.length - 1)];
    const f = a - Math.floor(a);
    const size = (A.h + (B.h - A.h) * f) * 1.288;
    const x = A.x + (B.x - A.x) * f;
    const y = rects[0].y + easeTravel(e - rects[0].y, rects[rects.length - 1].y - rects[0].y);
    host.style.width = `${size}px`;
    host.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
    target = a;
    if (prev) {
      drift.across += (x - prev.x - drift.across) * 0.25;
      drift.down += (y + top - prev.y - drift.down) * 0.25;
      drift.scroll += (prev.top - top - drift.scroll) * 0.25;
      swayY = gsap.utils.clamp(-0.5, 0.5, 0.05 * drift.across);
      swayX = gsap.utils.clamp(-0.4, 0.4, 0.012 * drift.scroll);
      const k = 56 / Math.max(host.clientHeight, 1);
      trailDir.set(drift.across * k, -drift.down * k);
    }
    prev = { x, y: y + top, top };
  };

  const thick = (r) => 6 * Math.abs(Math.cos(r)) + 2.65 * Math.abs(Math.sin(r));
  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting), { rootMargin: "50% 0px" }).observe(sec);
  gsap.ticker.add((time) => {
    if (!visible) return;
    const ms = time * 1000;
    follow();
    U.uCover.value = Math.min(1, U.uCover.value + 0.03);
    shown += (target - shown) * 0.06;
    showAt(shown);
    // On screens with no hover, the marker slowly looks around on its own
    const idle = fine.matches ? 0 : 0.14 * Math.sin(0.00045 * ms);
    if (!fine.matches) { ptr.set(16 * Math.sin(0.0007 * ms), 20 * Math.sin(0.0011 * ms)); active = 1; }
    swayY *= 0.94;
    swayX *= 0.94;
    group.rotation.x += (baseX + 0.5 * swayX - group.rotation.x) * 0.035;
    group.rotation.y += (baseY + idle + swayY - group.rotation.y) * 0.035;
    group.rotation.z = 0.035 * Math.sin(0.00065 * ms);
    group.position.y = 0.5 * Math.sin(0.0008 * ms);
    lampAt.lerp(active ? ptrS : lampRest, 0.05);
    U.uLamp.value.set(lampAt.x - cam.position.x, lampAt.y - cam.position.y, 26 - cam.position.z);
    ptrS.lerp(ptr, 0.045);
    activeS += (active - activeS) * 0.035;
    bars.forEach((b, k) => {
      const dy = ptrS.y - b.y;
      const near = Math.exp(-(dy * dy) / 130) * activeS;
      const rate = 0.03 + 0.04 * near;
      b.swing += (swayX * (1 + 0.4 * k) - b.swing) * (0.09 - 0.02 * k);
      // Pieces are dragged in one step late, opposite to the direction of motion (top pieces first when going down)
      const order = trailDir.y > 0 ? k : bars.length - 1 - k;
      b.trail.x += (gsap.utils.clamp(-3, 3, -1.5 * trailDir.x * k) - b.trail.x) * 0.18;
      b.trail.y += (gsap.utils.clamp(-3, 3, -1.5 * trailDir.y * order) - b.trail.y) * 0.18;
      b.tiltX += (-(0.7 * Math.atan2(dy, 34)) * activeS - b.tiltX) * rate;
      b.tiltY += (0.55 * Math.atan2(ptrS.x, 48) * activeS - b.tiltY) * rate;
      b.lift += (5 * near - b.lift) * rate;
      b.slide += (near * (ptrS.x / 28) * 2.6 - b.slide) * rate;
      b.pivot.rotation.set(b.tiltX + b.swing + b.spin, b.tiltY, 0);
    });
    // Spread tilted pieces up and down from the center piece so they don’t overlap
    const mid = bars[1];
    bars.forEach((b) => {
      const push = b === mid ? 0 : Math.max(0, thick(b.tiltX + b.swing + b.spin) + thick(mid.tiltX + mid.swing + mid.spin) + 1.6 + 0.5 * Math.abs(b.lift - mid.lift) - Math.abs(b.y - mid.y));
      b.pivot.position.set(b.slide + b.trail.x, b.y + Math.sign(b.y - mid.y) * push + b.trail.y, b.lift);
    });
    renderer.render(scene, cam);
  });

  resize();
  sec.setAttribute("data-mark", "");
  host.setAttribute("data-ready", "");
})();
