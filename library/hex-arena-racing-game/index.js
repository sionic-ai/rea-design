// Game screen — the original uses Bullet3 physics with a real car model, but here it is a basic-shape car with hand-built sliding car physics
// Gives the same composition (menu: dark garage from the front / game: camera following obliquely from above), the same hexagon arena, the same smoke and the same elimination flow.
(() => {
  const AR = window.AR;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const header = $(".ar-header"), footer = $(".ar-footer"), menu = $(".ar-menu");
  const medals = $(".ar-header__medals"), scoreBox = $(".ar-header__score"), pauseBtn = $(".ar-header__pause");
  const gauges = $(".ar-gauges"), pickupsHud = $(".ar-pickups"), joystick = $(".ar-joystick");
  const wasted = $(".ar-wasted"), session = $(".ar-session");

  // Skin variables (oklch / color-mix expressions) can’t be read by three — paint the computed color onto a 1×1 canvas and read it back as rgb
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  const pctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssRgb = (name) => {
    probe.style.color = `var(${name})`;
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = getComputedStyle(probe).color;
    pctx.fillRect(0, 0, 1, 1);
    return [...pctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const cssColor = (name) => { const [r, g, b] = cssRgb(name); return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace); };

  // ── Renderer · scene ─────────────────────
  const canvas = $(".ar-scene__canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = cssColor("--kf-bg");
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 400);

  const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x101018, .9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-14, 30, 10);
  scene.add(sun, sun.target);

  // ── Hex arena: each plane changes the cell color (--site-plane) and edge color (--site-plane-edge) (original stage settings). On change, a circle spreads from where it sits and paints the new color ──
  const HEX = 10, ARENA = 62;
  const plane = () => [cssColor("--site-plane"), cssColor("--site-plane-edge")];
  const [cell0, edge0] = plane();
  const groundU = {
    uCellA: { value: cell0 }, uEdgeA: { value: edge0 },
    uCellB: { value: cell0.clone() }, uEdgeB: { value: edge0.clone() },
    uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0 }, uCar: { value: new THREE.Vector2() },
    uSize: { value: HEX }, uLine: { value: .012 }, uArena: { value: ARENA }, uLight: { value: 1 }, uPool: { value: 0 },
  };
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(ARENA * 2.4, ARENA * 2.4).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: groundU,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `
        uniform vec3 uCellA, uEdgeA, uCellB, uEdgeB; uniform vec2 uCenter, uCar; uniform float uRadius, uSize, uLine, uArena, uLight, uPool;
        varying vec3 vW;
        float hexDist(vec2 p){ p = abs(p); return max(dot(p, normalize(vec2(1., 1.7320508))), p.x); }
        void main(){
          vec2 uv = vW.xz / uSize;
          const vec2 s = vec2(1., 1.7320508);
          vec2 a = mod(uv, s) - s * .5, b = mod(uv - s * .5, s) - s * .5;
          vec2 gv = dot(a, a) < dot(b, b) ? a : b;
          vec2 id = uv - gv;
          float d = hexDist(gv);
          float aa = fwidth(d) * 1.2;
          float edge = smoothstep(.5 - uLine - aa, .5 - uLine, d);
          float t = step(distance(vW.xz, uCenter), uRadius);
          float n = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 cell = mix(uCellA, uCellB, t) * (.82 + .32 * n);
          vec3 c = mix(cell, mix(uEdgeA, uEdgeB, t), edge);
          float lit = 1. - smoothstep(8., 60., distance(vW.xz, uCar));
          // In the menu (garage) the floor is nearly off, lighting only the two puddles the headlights reach
          c *= mix(.07, .45 + .75 * lit, uLight);
          vec2 q1 = (vW.xz - vec2(-1.6, 7.5)) / vec2(2.6, 4.2), q2 = (vW.xz - vec2(1.6, 7.5)) / vec2(2.6, 4.2);
          c += uPool * .22 * (exp(-dot(q1, q1)) + exp(-dot(q2, q2)));
          c *= 1. - smoothstep(uArena - 1.5, uArena, length(vW.xz));
          gl_FragColor = vec4(c, 1.);
          #include <colorspace_fragment>
        }`,
    })
  );
  scene.add(ground);

  // Black hex holes scattered across the arena — fall in and you are out. Cell center coordinates are picked from the same grid as the shader
  const hexCenter = (i, j, k) => new THREE.Vector2((i + .5 * k) * HEX, (j + .5 * k) * 1.7320508 * HEX);
  const holes = [hexCenter(2, 0, 1), hexCenter(-3, 0, 0), hexCenter(1, -2, 1), hexCenter(-2, 1, 1), hexCenter(3, 1, 0), hexCenter(-1, -1, 0)];
  const holeGeo = new THREE.CylinderGeometry(HEX * .52, HEX * .52, .3, 6);
  const holeMat = new THREE.MeshBasicMaterial({ color: cssColor("--kf-bg") });
  const rimMat = new THREE.LineBasicMaterial({ color: cssColor("--kf-accent") });
  holes.forEach((h) => {
    const m = new THREE.Mesh(holeGeo, holeMat);
    m.position.set(h.x, -.12, h.y);
    const rim = new THREE.LineSegments(new THREE.EdgesGeometry(holeGeo), rimMat);
    rim.position.copy(m.position);
    scene.add(m, rim);
  });

  // ── Car: silver body, black wheels, lit headlights, orange character in the driver’s seat ──
  const car = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: .35, roughness: .38 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x15161a, metalness: .2, roughness: .6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1a2330, metalness: .6, roughness: .15 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, .7, 4.2), metal);
  body.position.y = .75;
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.1, .25, 1.4), metal);
  hood.position.set(0, 1.18, 1.25);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, .6, 1.6), glass);
  cabin.position.set(0, 1.35, -.35);
  const driver = new THREE.Mesh(new THREE.CapsuleGeometry(.38, .7, 4, 10), new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: .5 }));
  driver.position.set(0, 2.0, -.3);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 });
  const eyeGeo = new THREE.SphereGeometry(.17, 12, 10);
  [-.16, .16].forEach((x) => { const e = new THREE.Mesh(eyeGeo, eyeMat); e.position.set(x, .45, .28); driver.add(e); });
  car.add(body, hood, cabin, driver);
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(.48, .48, .42, 18).rotateZ(Math.PI / 2);
  [[-1.12, 1.35], [1.12, 1.35], [-1.12, -1.35], [1.12, -1.35]].forEach(([x, z]) => {
    const w = new THREE.Mesh(wheelGeo, dark);
    w.position.set(x, .48, z);
    car.add(w);
    wheels.push(w);
  });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfffbe0 });
  [-.72, .72].forEach((x) => {
    const l = new THREE.Mesh(new THREE.CircleGeometry(.16, 16), lampMat);
    l.position.set(x, .85, 2.111);
    car.add(l);
  });
  // Headlight beam: a semi-transparent cone spreading forward (additive blending)
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beams = [-.72, .72].map((x) => {
    const b = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 24, 1, true).translate(0, -4.5, 0).rotateX(-Math.PI / 2 - .12), beamMat);
    b.position.set(x, .85, 2.15);
    car.add(b);
    return b;
  });
  const headLight = new THREE.SpotLight(0xfff3d0, 60, 30, .55, .6, 1.4);
  headLight.position.set(0, 1, 2.2);
  headLight.target.position.set(0, 0, 10);
  car.add(headLight, headLight.target);
  // Round smudge under the car instead of a shadow
  const blobTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(0,0,0,.75)"); r.addColorStop(1, "rgba(0,0,0,0)"); // Not a Skin: shadow blotch under the car (translucent black)
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.position.y = .02;
  scene.add(car, blob);

  // Menu garage: dark wall with theme color spreading behind the car
  const garageTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d"), r = g.createRadialGradient(128, 150, 10, 128, 128, 128);
    r.addColorStop(0, "rgba(255,255,255,.55)"); r.addColorStop(.6, "rgba(255,255,255,.12)"); r.addColorStop(1, "rgba(255,255,255,0)"); // Not skin: alpha mask — color comes from the material color
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const garage = new THREE.Mesh(new THREE.PlaneGeometry(70, 40), new THREE.MeshBasicMaterial({ map: garageTex, color: edge0.clone(), transparent: true, opacity: .28, depthWrite: false }));
  garage.position.set(0, 6, -18);
  scene.add(garage);

  // ── Like box: thumb drawing on the side of a theme-color box. Picking it up raises the likes and the judging gauge ──
  const thumbTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 128, 128); // Not a skin: multiply mask — the material color shows through as is on a white background
    g.fillStyle = "#111"; // Not skin: the thumb art is stamped with the material color pressed darker
    g.beginPath(); g.rect(22, 56, 18, 46); g.fill();
    g.beginPath(); g.moveTo(46, 102); g.lineTo(46, 56); g.lineTo(64, 24); g.quadraticCurveTo(76, 22, 74, 36); g.lineTo(70, 52); g.lineTo(100, 52);
    g.quadraticCurveTo(110, 54, 108, 64); g.lineTo(102, 94); g.quadraticCurveTo(100, 102, 90, 102); g.closePath(); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const likeMat = new THREE.MeshStandardMaterial({ color: edge0.clone(), map: thumbTex, emissive: edge0.clone(), emissiveIntensity: .35, roughness: .4 });
  const likes = [];
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), likeMat);
    m.userData.phase = Math.random() * 6;
    scene.add(m);
    likes.push(m);
  }
  const onHole = (x, z, pad = .82) => holes.some((h) => Math.hypot(x - h.x, z - h.y) < HEX * .5 * pad);
  const placeLike = (m) => {
    let x, z;
    do { const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * (ARENA - 12); x = Math.cos(a) * r; z = Math.sin(a) * r; } while (onHole(x, z, 1.2));
    m.position.set(x, 1.2, z);
    m.scale.setScalar(1);
    m.visible = true;
  };

  // ── White smoke: puffs from the rear wheels when sliding or accelerating ──
  const smokeTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.5, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)"); // Not skin: alpha mask — color comes from the material color
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const puffs = [];
  for (let i = 0; i < 160; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.visible = false;
    scene.add(s);
    puffs.push({ s, life: 0, max: 1, v: new THREE.Vector3() });
  }
  let puffIdx = 0;
  const puff = (x, y, z, size) => {
    const p = puffs[puffIdx++ % puffs.length];
    p.s.position.set(x, y, z);
    p.s.visible = true;
    p.life = 0;
    p.max = 1.1 + Math.random() * .6;
    p.size = size;
    p.v.set((Math.random() - .5) * 1.5, 1.2 + Math.random(), (Math.random() - .5) * 1.5);
  };

  // ── Car physics (hand-built arcade): rolls well forward and back, slides sideways yet holds ──
  const S = { x: 0, z: 0, y: 0, vy: 0, h: 0, vx: 0, vz: 0, nitro: 0, falling: false, dist: 0, t0: 0, score: 0, picks: [0, 0, 0], g: [50, 50, 50, 50] };
  const keys = {};
  const touch = { x: 0, y: 0, drive: false };
  let mode = "idle"; // idle (intro) · menu · game · wasted · session
  let paused = false;

  const resetCar = () => {
    Object.assign(S, { x: 0, z: 0, y: 0, vy: 0, h: 0, vx: 0, vz: 0, nitro: 0, falling: false, dist: 0, t0: performance.now(), score: 0, picks: [0, 0, 0], g: [50, 50, 50, 50] });
    likes.forEach(placeLike);
    updateHud();
  };

  const step = (dt) => {
    const steer = (keys.ArrowLeft || keys.KeyA ? 1 : 0) - (keys.ArrowRight || keys.KeyD ? 1 : 0) - touch.x;
    let throttle = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? .6 : 0) + (touch.drive ? 1 : 0) + Math.max(0, -touch.y);
    throttle = Math.max(-.6, Math.min(1, throttle));
    const boosting = (keys.ShiftLeft || keys.ShiftRight) && S.nitro > 0;
    if (boosting) S.nitro = Math.max(0, S.nitro - dt);
    const fx = Math.sin(S.h), fz = Math.cos(S.h), rx = fz, rz = -fx;
    let vf = S.vx * fx + S.vz * fz, vl = S.vx * rx + S.vz * rz;
    const grounded = S.y <= 0 && !S.falling;
    if (grounded) {
      vf += throttle * (boosting ? 46 : 26) * dt;
      vf *= Math.exp(-.7 * dt);
      const drifting = Math.abs(steer) > .1 && Math.abs(vf) > 12;
      vl *= Math.exp(-(drifting ? 1.6 : 7) * dt);
      S.h += steer * 2.5 * dt * Math.max(-1, Math.min(1, vf / 14));
      const maxV = boosting ? 42 : 30;
      vf = Math.max(-12, Math.min(maxV, vf));
      if ((drifting && Math.abs(vl) > 3) || boosting || (Math.abs(throttle) > .5 && Math.abs(vf) < 6)) {
        [-1.1, 1.1].forEach((side) => puff(S.x - fx * 1.6 + rx * side, .5, S.z - fz * 1.6 + rz * side, drifting ? 3.2 : 2.2));
      }
    }
    S.vx = fx * vf + rx * vl;
    S.vz = fz * vf + rz * vl;
    S.x += S.vx * dt;
    S.z += S.vz * dt;
    S.dist += Math.hypot(S.vx, S.vz) * dt;
    // Falls if outside the arena or over a hole
    if (!S.falling && S.y <= 0 && (Math.hypot(S.x, S.z) > ARENA - 1 || onHole(S.x, S.z))) S.falling = true;
    if (S.falling || S.y > 0) {
      S.vy -= 30 * dt;
      S.y += S.vy * dt;
      if (!S.falling && S.y <= 0) { S.y = 0; S.vy = 0; }
    }
    if (S.falling && S.y < -7 && mode === "game") goWasted();

    car.position.set(S.x, S.y, S.z);
    car.rotation.y = S.h;
    car.rotation.z = THREE.MathUtils.lerp(car.rotation.z, -vl * .012, .2);
    wheels.forEach((w) => { w.rotation.x += vf * dt / .48; });
    wheels[0].rotation.y = wheels[1].rotation.y = steer * .35;
    blob.visible = !S.falling;
    blob.position.set(S.x, .02, S.z);
    blob.rotation.y = S.h;

    likes.forEach((m) => {
      if (!m.visible) return;
      if (Math.hypot(m.position.x - S.x, m.position.z - S.z) < 2.4 && S.y < 2) {
        m.visible = false;
        S.score += 1;
        S.picks[0] += 1;
        if (S.score % 3 === 0) S.picks[1] += 1;
        if (S.score % 4 === 0) { S.picks[2] += 1; S.nitro += 2; }
        const gi = Math.floor(Math.random() * 4);
        S.g[gi] = Math.min(99, S.g[gi] + 6 + Math.floor(Math.random() * 6));
        updateHud();
        play("pick");
        setTimeout(() => placeLike(m), 2500);
      }
    });
    return Math.abs(vf);
  };

  // ── HUD ─────────────────────────────
  const scoreEl = $(".ar-header__score-value");
  const speedFront = $(".ar-speed__front");
  const multEl = $(".ar-speed__mult");
  const pickEls = $$(".ar-pickup b");
  const gaugeEls = $$(".ar-gauge");
  const fpsEl = $(".ar-fps b");
  const nitroCtl = $$(".ar-footer__control")[3];
  function updateHud() {
    scoreEl.textContent = S.score;
    S.picks.forEach((v, i) => { pickEls[i].textContent = v; });
    gaugeEls.forEach((g, i) => {
      g.querySelector("b").textContent = S.g[i];
      g.querySelector(".ar-gauge__front").setAttribute("stroke-dasharray", `${S.g[i]} 100`);
    });
    nitroCtl.classList.toggle("is-off", S.nitro <= 0);
  }
  let lastSpeedUi = -1;
  const speedUi = (v) => {
    const pct = Math.min(1, v / 42);
    const k = Math.round(pct * 20);
    if (k === lastSpeedUi) return;
    lastSpeedUi = k;
    speedFront.setAttribute("stroke-dasharray", `${(pct * 75).toFixed(1)} 100`);
    const m = (1 + pct * 1.5).toFixed(1).split(".");
    multEl.innerHTML = `<small>x</small>${m[0]}<small>.${m[1]}</small>`;
  };

  // ── Screen state ───────────────────────────
  const shown = (el, on) => el.classList.toggle("is-shown", on);
  const setMode = (m) => {
    mode = m;
    const inGame = m === "game" || m === "wasted";
    menu.hidden = m !== "menu";
    gauges.hidden = pickupsHud.hidden = !inGame;
    scoreBox.hidden = !(inGame || m === "session");
    pauseBtn.hidden = m !== "game";
    medals.classList.toggle("is-hidden", m !== "menu");
    showStick(m === "game");
    groundU.uLight.value = m === "menu" || m === "idle" ? 0 : 1;
    groundU.uPool.value = m === "menu" || m === "idle" ? 1 : 0;
    hemi.intensity = m === "menu" || m === "idle" ? .25 : .9;
    sun.intensity = m === "menu" || m === "idle" ? .5 : 2.2;
    garage.visible = beams[0].visible = beams[1].visible = m === "menu";
    headLight.visible = m === "menu";
    if (m === "menu") {
      Object.assign(S, { x: 0, z: 0, y: 0, vy: 0, h: 0, vx: 0, vz: 0, falling: false });
      car.position.set(0, 0, 0);
      car.rotation.set(0, 0, 0);
    }
  };

  const toMenu = () => {
    setMode("menu");
    shown(header, true);
    shown(footer, true);
    if (!AR.reduce) {
      gsap.fromTo(".ar-menu__info > *", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: .6, ease: "expo.out", stagger: .04 });
      gsap.fromTo(".ar-board", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: .6, ease: "expo.out", delay: .1 });
    }
  };
  const startGame = (force) => {
    if (force !== true && mode !== "menu" && mode !== "session") return;
    AR.lines(() => {
      session.hidden = true;
      resetCar();
      setMode("game");
      camPos.copy(gameCamTarget());
    });
  };
  const backToMenu = () => AR.lines(() => { session.hidden = true; wasted.hidden = true; toMenu(); });

  $(".ar-menu__play").addEventListener("click", () => startGame());
  $(".ar-header__logo").addEventListener("click", () => mode !== "menu" && mode !== "idle" && backToMenu());
  $$(".ar-session__action").forEach((b) => b.addEventListener("click", () => (b.dataset.action === "again" ? startGame(true) : backToMenu())));
  pauseBtn.addEventListener("click", () => { paused = !paused; pauseBtn.classList.toggle("is-on", paused); });

  addEventListener("keydown", (e) => {
    if (AR.modalOpen()) return;
    keys[e.code] = true;
    if (mode === "menu" && e.code === "Enter") startGame();
    if (mode === "game" && e.code === "Space" && S.y <= 0 && !S.falling) S.vy = 11;
    if ((mode === "game" || mode === "session") && e.code === "KeyR") startGame(true);
    if ((mode === "game" || mode === "session") && e.code === "Escape") backToMenu();
    if (mode === "game" && e.code.startsWith("Arrow")) e.preventDefault();
  });
  addEventListener("keyup", (e) => { keys[e.code] = false; });
  addEventListener("blur", () => Object.keys(keys).forEach((k) => (keys[k] = false)));

  // Phone joystick: nipplejs 0.10.2 with the same settings as the original — dragging the circle (154px) fixed 67px from the bottom-left of the left panel sets direction, and while the big circle on the right is pressed it runs.
  const stick = nipplejs.create({
    zone: $(".ar-joystick__left"), mode: "static", position: { bottom: "67px", left: "67px" },
    color: "color-mix(in oklab, var(--kf-ink) 82%, transparent)", size: 154, threshold: .08, fadeTime: 120,
    dataOnly: false, restOpacity: 1, catchDistance: 200, maxNumberOfNipples: 1,
  });
  stick.on("move", (e, d) => { touch.x = d.vector.x; touch.y = -d.vector.y; });
  stick.on("end", () => { touch.x = touch.y = 0; });
  // Like the original, it floats up in .3s only while running, and when clearing, visibility is turned off after everything has disappeared
  let stickOn = false;
  const showStick = (on) => {
    if (on === stickOn) return;
    stickOn = on;
    gsap.set(joystick, { visibility: "visible" });
    gsap.to(joystick, { opacity: on ? 1 : 0, ease: "power1.inOut", duration: .3, overwrite: true, onComplete: () => on || gsap.set(joystick, { visibility: "hidden" }) });
  };
  const driveBtn = $(".ar-joystick__button--drive");
  driveBtn.addEventListener("pointerdown", () => { touch.drive = true; driveBtn.classList.add("is-pressed"); });
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) => driveBtn.addEventListener(t, () => { touch.drive = false; driveBtn.classList.remove("is-pressed"); }));
  $(".ar-joystick__button--back").addEventListener("click", backToMenu);
  $(".ar-joystick__button--nitro").addEventListener("click", () => { if (S.nitro > 0) { keys.ShiftLeft = true; setTimeout(() => (keys.ShiftLeft = false), 900); } });

  // ── Sound: howler like the original. Choosing On continues the background track (original first track volume .175) and plays effects on pickup and drop-out.
  //    Songs and sound effects are not the original files but placeholder sounds in the same spot (media/). Since it uses html5 audio, it isn’t blocked by XHR even when opened via file:// ──
  const snd = {
    music: new Howl({ src: ["media/track-1.mp3"], loop: true, volume: .175, preload: false, html5: true }),
    pick: new Howl({ src: ["media/sfx-pick.mp3"], volume: .5, preload: false, html5: true }),
    wasted: new Howl({ src: ["media/sfx-wasted.mp3"], volume: .6, preload: false, html5: true }),
  };
  const play = (k) => { if (AR.soundOn) snd[k].play(); };
  const setSound = (on) => {
    AR.soundOn = on;
    $(".ar-sound-toggle").classList.toggle("is-off", !on);
    if (on) {
      Object.values(snd).forEach((h) => h.state() === "unloaded" && h.load());
      if (!snd.music.playing()) snd.music.play();
    } else snd.music.pause();
  };
  $(".ar-sound-toggle").addEventListener("click", () => setSound(!AR.soundOn));

  // ── Eliminated → report card ───────────────────────
  const smoke = $(".ar-wasted__smoke"), sctx = smoke.getContext("2d");
  const word = $(".ar-wasted__word");
  let slow = 1;
  function goWasted() {
    if (mode !== "game") return;
    setMode("wasted");
    wasted.hidden = false;
    play("wasted");
    smoke.width = innerWidth; smoke.height = innerHeight;
    const [br, bgc, bb] = cssRgb("--kf-bg"), [dr, dg, db] = cssRgb("--kf-danger");
    const blobs = Array.from({ length: 26 }, () => ({ x: innerWidth * (.2 + Math.random() * .6), y: innerHeight * (.3 + Math.random() * .4), r: 20 + Math.random() * 60, g: 120 + Math.random() * 220 }));
    const t0 = performance.now();
    const drawSmoke = () => {
      if (wasted.hidden) return;
      const t = (performance.now() - t0) / 1000;
      sctx.clearRect(0, 0, smoke.width, smoke.height);
      sctx.fillStyle = `rgba(${br},${bgc},${bb},${Math.min(.75, t * .9)})`;
      sctx.fillRect(0, 0, smoke.width, smoke.height);
      blobs.forEach((b, i) => {
        const r = b.r + b.g * (1 - Math.exp(-t * 1.6));
        const g = sctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0, `rgba(${dr},${Math.min(255, dg + 15 + (i % 3) * 20)},${Math.min(255, db + 5 + (i % 4) * 10)},${.55 * Math.exp(-t * .4)})`);
        g.addColorStop(1, `rgba(${dr},${dg},${db},0)`);
        sctx.fillStyle = g;
        sctx.beginPath(); sctx.arc(b.x + Math.sin(t + i) * 10, b.y - t * 12, r, 0, Math.PI * 2); sctx.fill();
      });
      requestAnimationFrame(drawSmoke);
    };
    drawSmoke();
    slow = .3;
    const spans = word.children;
    gsap.timeline()
      .fromTo(word, { xPercent: 140, skewX: -24, scaleX: 1.6 }, { xPercent: 0, skewX: 0, scaleX: 1, duration: 1, ease: "expo.out" })
      .fromTo(spans[1], { x: 40 }, { x: -8, duration: .5, ease: "expo.out" }, .1)
      .fromTo(spans[2], { x: -50 }, { x: 10, duration: .5, ease: "expo.out" }, .15)
      .add(() => {
        slow = 1;
        showSession();
      }, 2.6);
  }
  function showSession() {
    setMode("session");
    const secs = Math.round((performance.now() - S.t0) / 1000);
    session.querySelector('[data-stat="score"]').textContent = S.score * 10;
    session.querySelector('[data-stat="likes"]').textContent = S.score;
    session.querySelector('[data-stat="distance"]').textContent = `${Math.round(S.dist)} M`;
    session.querySelector('[data-stat="time"]').textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
    session.hidden = false;
    gsap.timeline()
      .fromTo(session, { opacity: 0 }, { opacity: 1, duration: .5, ease: "power1.inOut" })
      .to(wasted, { opacity: 0, duration: .4, onComplete: () => { wasted.hidden = true; gsap.set(wasted, { opacity: 1 }); } }, 0)
      .fromTo(".ar-session__title, .ar-session__col, .ar-session__actions", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "expo.out", stagger: .06 }, .1);
  }

  // ── Panel color change ─────────────────────────
  addEventListener("ar:theme", (e) => {
    const [cell, edge] = plane();
    groundU.uCellB.value.copy(cell);
    groundU.uEdgeB.value.copy(edge);
    groundU.uCenter.value.set(S.x, S.z);
    gsap.fromTo(groundU.uRadius, { value: 0 }, { value: ARENA * 2.2, duration: 1.5, ease: "power1.inOut", onComplete: () => {
      groundU.uCellA.value.copy(groundU.uCellB.value);
      groundU.uEdgeA.value.copy(groundU.uEdgeB.value);
      groundU.uRadius.value = 0;
    } });
    gsap.to(likeMat.color, { r: edge.r, g: edge.g, b: edge.b, duration: 1.5 });
    likeMat.emissive.copy(edge);
    garage.material.color.copy(edge);
  });

  // ── Camera ───────────────────────────
  const camPos = new THREE.Vector3(0, 3, 10);
  const camLook = new THREE.Vector3(0, 1, 0);
  const gameCamTarget = () => new THREE.Vector3(S.x, 24 + S.y * .3, S.z - 17);
  let mx = 0, my = 0;
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    // In phone portrait, widen the field of view so the area around the car shows
    camera.fov = camera.aspect < 1 ? 58 : 40;
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  // ── Ring ─────────────────────────────────
  let last = performance.now(), fpsAcc = 0, fpsN = 0;
  const loop = (now) => {
    const raw = Math.min(.05, (now - last) / 1000);
    last = now;
    fpsAcc += raw; fpsN++;
    if (fpsAcc > .5) { fpsEl.textContent = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
    const dt = paused ? 0 : raw * slow;
    let speed = 0;
    if (mode === "game" || mode === "wasted") speed = step(dt);
    if (mode === "game") speedUi(speed);

    const t = now / 1000;
    likes.forEach((m) => {
      if (!m.visible) return;
      m.rotation.y += dt * 1.4;
      m.position.y = 1.2 + Math.sin(t * 2 + m.userData.phase) * .25;
    });
    puffs.forEach((p) => {
      if (!p.s.visible) return;
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) { p.s.visible = false; return; }
      p.s.position.addScaledVector(p.v, dt);
      p.s.scale.setScalar(p.size * (1 + k * 2.4));
      p.s.material.opacity = .85 * (1 - k);
    });

    if (mode === "menu" || mode === "idle") {
      // Garage: the car’s front seen slightly from above, turning a little toward the mouse. The car trembles faintly as if the engine is running
      camPos.lerp(new THREE.Vector3(mx * 2.2 - 1.4, 4.4 - my * .8, 13.5), .05);
      camLook.lerp(new THREE.Vector3(-1.4, 1.3, 0), .1);
      car.position.y = Math.sin(t * 38) * .012;
      car.rotation.y = Math.PI * .02;
      groundU.uCar.value.set(0, 0);
    } else {
      const target = gameCamTarget();
      camPos.lerp(target, mode === "wasted" ? .02 : .08);
      camLook.lerp(new THREE.Vector3(S.x, Math.max(-4, S.y), S.z), mode === "wasted" ? .04 : .15);
      groundU.uCar.value.set(S.x, S.z);
      sun.position.set(S.x - 14, 30, S.z + 10);
      sun.target.position.set(S.x, 0, S.z);
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  setMode("idle");
  resetCar();
  requestAnimationFrame(loop);

  // When the intro ends, go to the garage menu. A URL ending in #game, #wasted or #session goes straight to that scene (for checking when pulled out)
  AR.onSoundConfirmed = (on) => {
    setSound(on);
    toMenu();
    AR.startThemeCycle();
    const h = location.hash.slice(1);
    if (h === "game" || h === "wasted" || h === "session") {
      session.hidden = true;
      resetCar();
      setMode("game");
      camPos.copy(gameCamTarget());
      S.vz = 18;
      keys.KeyW = true;
      setTimeout(() => { keys.KeyW = false; keys.KeyA = true; }, 900);
      setTimeout(() => { keys.KeyA = false; }, 1700);
      if (h !== "game") setTimeout(() => { S.falling = true; S.vy = 2; }, 1800);
    }
  };
})();
