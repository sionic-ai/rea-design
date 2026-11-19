// One 3D desk scene — original values: notebook 210×297, hero camera radius 760·45°·FOV 30, mouse drift lerp .02,
// After opening, camera radius 720 · 75° (2s smoothstep), color cycle 1.8s, loader confetti 1.2s cubic-bezier(.3,0,.3,1)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const W = 210, H = 297, R0 = 760, ROT0 = Math.PI / 4, R1 = 720, ROT1 = Math.PI / 2.4, FOV = 30, SHIFT_Y = -126.75;
  const isPC = () => innerWidth >= 768;
  const smooth = (t) => t * t * (3 - 2 * t);
  const view = document.getElementById("view");
  const pal = { frame: ky.palette("frame"), desk: ky.palette("desk"), wall: ky.palette("wall"), front: ky.palette("front") };
  const kf = (n) => ky.color(n).hex;
  const INK = kf("--kf-ink"), PAPER = kf("--kf-surface"), DESK = kf("--kf-bg"), WALL = kf("--kf-raised");

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  view.append(renderer.domElement);
  const world = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 1, 1e4);
  const flat = (hex, side = THREE.FrontSide) => new THREE.MeshBasicMaterial({ color: hex, side });

  // Camera: like the original xg, position and gaze move separately on time curves, and mouse push is added to position only
  const camState = {
    pos: new THREE.Vector3(), target: new THREE.Vector3(), fromPos: null, fromTarget: null, t0: 0, dur: 0,
    fov: FOV, shiftY: 0, offset: new THREE.Vector3(), want: new THREE.Vector3(),
  };
  const rLanding = () => R0 / Math.max(1, (innerHeight / innerWidth) * 0.6);
  const rotLanding = () => ROT0 / Math.max(1, (innerHeight / innerWidth) * 0.6);
  const landingPos = () => new THREE.Vector3(W / 2, rLanding() * Math.cos(rotLanding()), rLanding() * Math.sin(rotLanding()));
  camState.pos.copy(landingPos());
  camState.target.set(W / 2, 30, 0);
  const applyShift = () => {
    const pr = renderer.getPixelRatio(), w = innerWidth * pr, h = innerHeight * pr;
    const r = (-Math.min(innerWidth, innerHeight) / (1.5 * SHIFT_Y)) * 0.5;
    cam.setViewOffset(w, h, 0, (camState.shiftY + 0.25 * camState.offset.y) * pr * r, w, h);
  };
  const setFov = (f) => { camState.fov = f; cam.fov = f * Math.max(1, innerHeight / innerWidth); cam.updateProjectionMatrix(); };
  const moveCam = (pos, target, dur) => {
    camState.fromPos = curPos.clone(); camState.fromTarget = curTarget.clone();
    camState.pos.copy(pos); camState.target.copy(target); camState.t0 = performance.now() / 1000; camState.dur = dur;
  };
  const curPos = camState.pos.clone(), curTarget = camState.target.clone();
  const updateCam = () => {
    if (camState.fromPos) {
      const k = Math.min(1, (performance.now() / 1000 - camState.t0) / camState.dur), e = smooth(k);
      curPos.lerpVectors(camState.fromPos, camState.pos, e);
      curTarget.lerpVectors(camState.fromTarget, camState.target, e);
      if (k >= 1) camState.fromPos = null;
    } else { curPos.copy(camState.pos); curTarget.copy(camState.target); }
    camState.offset.lerp(camState.want, 0.02);
    cam.position.copy(curPos).add(camState.offset);
    cam.lookAt(curTarget);
    applyShift();
  };
  // Same as the original updateCameraFromMousePosition — x ±800 · .3, only in the lower half y grows by a power of 1.2 and z is pulled in
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const fromMouse = () => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const i = 800 * Math.min(1, Math.max(-1, (mouse.x - cx) / cx)) * Math.max(1, (cy / cx) * 0.7);
    const n = 320 * Math.min(1, Math.max(-1, (mouse.y - cy) / cy));
    const s = n > 50 && !opened ? Math.pow(n - 50, 1.2) + 50 : 0.2 * (n - 50) + 50;
    const a = n > 50 ? -(n - 50) : 0;
    camState.want.set(0.3 * i, 0.3 * s, 0.3 * a);
  };

  // ── Desk, back line, wall (original box sizes and positions as is)
  const deskMat = flat(DESK), wallMat = flat(WALL);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(5000, 1, 1000), deskMat); desk.position.set(0, -0.5, 150); world.add(desk);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(5000, 0.5, 0.5), flat(INK)); edge.position.set(0, 0, -350); world.add(edge);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1e4, 1e4, 1), wallMat); wall.position.set(0, 0, -4000); world.add(wall);

  // ── Drawing art — flat outlined illustration (canvas). Redrawn at the same place·size·feel instead of the original image files
  const C = (i) => pal.frame[i].hex, F = (i) => pal.front[i].hex;
  const canvasTex = (w, h, draw) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const g = cv.getContext("2d"); g.lineJoin = g.lineCap = "round"; g.lineWidth = 6; g.strokeStyle = INK;
    draw(g, w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const shape = (g, fill, path) => { g.beginPath(); path(g); g.fillStyle = fill; g.fill(); g.stroke(); };
  const ell = (x, y, rx, ry, rot = 0) => (g) => g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  const ART = {
    plant: [1180, 1218, (g, w, h) => {
      shape(g, C(4), ell(w * .4, h * .56, w * .36, h * .3));
      shape(g, F(4), ell(w * .4, h * .5, w * .28, h * .2));
      [[.3, .45], [.45, .52], [.36, .6], [.52, .43]].forEach(([x, y]) => shape(g, F(1), ell(w * x, h * y, w * .05, h * .03, .3)));
      shape(g, C(6), (p) => { p.moveTo(w * .38, h * .55); p.lineTo(w * .4, h * .3); p.lineTo(w * .44, h * .55); });
      shape(g, C(2), (p) => { p.moveTo(w * .4, h * .52); p.bezierCurveTo(w * .1, h * .4, w * .12, h * .1, w * .3, h * .05); p.bezierCurveTo(w * .46, h * .12, w * .48, h * .35, w * .4, h * .52); });
      shape(g, C(2), (p) => { p.moveTo(w * .42, h * .48); p.bezierCurveTo(w * .55, h * .2, w * .8, h * .05, w * .92, h * .12); p.bezierCurveTo(w * .9, h * .32, w * .7, h * .46, w * .42, h * .48); });
    }],
    apple: [672, 427, (g, w, h) => {
      shape(g, C(7), ell(w * .5, h * .58, w * .38, h * .38));
      shape(g, F(5), (p) => { p.moveTo(w * .5, h * .25); p.lineTo(w * .48, h * .05); p.lineTo(w * .54, h * .05); p.lineTo(w * .54, h * .25); });
      shape(g, C(2), (p) => { p.moveTo(w * .52, h * .22); p.bezierCurveTo(w * .62, h * .02, w * .85, h * .02, w * .9, h * .12); p.bezierCurveTo(w * .8, h * .26, w * .62, h * .3, w * .52, h * .22); });
    }],
    photo: [927, 650, (g, w, h) => {
      g.save(); g.translate(w * .45, h * .45); g.rotate(-.3);
      shape(g, PAPER, (p) => p.rect(-w * .32, -h * .32, w * .64, h * .62));
      shape(g, C(1), (p) => p.rect(-w * .28, -h * .28, w * .56, h * .54));
      shape(g, C(2), ell(-w * .05, h * .1, w * .2, h * .14));
      shape(g, C(6), ell(w * .12, h * .14, w * .14, h * .1));
      shape(g, PAPER, ell(0, -h * .12, w * .07, h * .05));
      g.restore();
      g.lineWidth = 10; g.strokeStyle = C(4); g.beginPath(); g.ellipse(w * .78, h * .66, w * .1, h * .07, 0, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 6; g.strokeStyle = INK;
      shape(g, kf("--kf-dim"), (p) => { p.moveTo(w * .7, h * .72); p.lineTo(w * .92, h * .9); p.lineTo(w * .88, h * .95); p.lineTo(w * .66, h * .78); });
      shape(g, F(5), ell(w * .68, h * .8, w * .07, h * .05, .6));
    }],
    cup: [597, 524, (g, w, h) => {
      shape(g, F(4), (p) => { p.moveTo(w * .12, h * .35); p.lineTo(w * .18, h * .9); p.quadraticCurveTo(w * .5, h * 1.02, w * .82, h * .9); p.lineTo(w * .88, h * .35); });
      shape(g, C(1), ell(w * .5, h * .35, w * .38, h * .22));
      shape(g, F(4), ell(w * .5, h * .35, w * .34, h * .19));
      shape(g, pal.desk[5].hex, ell(w * .5, h * .36, w * .3, h * .16));
      shape(g, C(5), (p) => { p.moveTo(w * .3, h * .34); p.bezierCurveTo(w * .5, h * .22, w * .7, h * .48, w * .62, h * .36); p.lineTo(w * .4, h * .42); });
    }],
    donut: [834, 502, (g, w, h) => {
      shape(g, PAPER, ell(w * .5, h * .6, w * .48, h * .38));
      shape(g, F(0), ell(w * .55, h * .52, w * .34, h * .3));
      shape(g, F(4), (p) => { p.ellipse(w * .55, h * .5, w * .3, h * .25, 0, 0, Math.PI * 2); });
      shape(g, PAPER, ell(w * .58, h * .46, w * .1, h * .08));
      [[.4, .5], [.7, .6], [.62, .3]].forEach(([x, y]) => shape(g, F(1), ell(w * x, h * y, w * .04, h * .025, .5)));
    }],
    notes: [1029, 928, (g, w, h) => {
      g.save(); g.translate(w * .45, h * .55);
      [[C(2), -.3], [C(7), -.15], [F(1), .05]].forEach(([c, r], i) => { g.save(); g.rotate(r); shape(g, c, (p) => p.rect(-w * .34 + i * 10, -h * .3, w * .62, h * .55)); g.restore(); });
      g.rotate(.18); shape(g, PAPER, (p) => p.rect(-w * .3, -h * .18, w * .56, h * .36));
      g.beginPath(); g.moveTo(-w * .3, -h * .18); g.lineTo(-w * .02, h * .05); g.lineTo(w * .26, -h * .18); g.stroke();
      g.restore();
      shape(g, F(5), (p) => { p.moveTo(w * .05, h * .55); p.lineTo(w * .5, h * .22); p.lineTo(w * .55, h * .27); p.lineTo(w * .1, h * .6); });
    }],
  };
  // Original landing.json position and scale (PC · phone). The notebook’s bottom-left corner is the origin, so add half the width and height.
  const STICK = [
    ["cup", [265, -83, .23], [175, 30, .2]], ["donut", [225, 60, .2], [100, 155, .22]], ["notes", [-225, 20, .2], [-110, 180, .2]],
    ["photo", [200, -245, .27], [180, -140, .24]], ["plant", [-250, -250, .25], [-210, -200, .25]], ["apple", [-50, -340, .3], [200, -380, .3]],
  ];
  const landing = new THREE.Group(); world.add(landing);
  const stickers = STICK.map(([name, pc, sp]) => {
    const [w, h, draw] = ART[name];
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(Math.round(w / 2), Math.round(h / 2), draw), transparent: true }));
    const holder = new THREE.Group(); holder.add(sprite); landing.add(holder);
    return { sprite, holder, w, h, pc, sp };
  });
  const placeStickers = () => stickers.forEach((s) => {
    const [x, z, k] = isPC() ? s.pc : s.sp;
    s.sprite.scale.set(k * s.w, k * s.h, 1);
    s.sprite.position.set(0, (s.h * k) / 2, 0);
    s.holder.position.set(x + W / 2, 0, z + H / 2);
  });
  placeStickers();

  // ── Notebook — rests closed on the right half (0…210), then the cover turns about the spine (0) ──
  const book = new THREE.Group(); world.add(book);
  const coverTex = canvasTex(420, 594, (g, w, h) => {
    g.fillStyle = pal.wall[1].hex; g.fillRect(0, 0, w, h);
    g.fillStyle = C(1); g.globalAlpha = .55; g.fillRect(0, 0, w * .1, h); g.globalAlpha = 1;
    g.strokeStyle = C(1); g.lineWidth = 2; g.globalAlpha = .45;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(w * .4, h * (.35 + i * .045)); g.lineTo(w * .95, h * (.35 + i * .045)); g.stroke(); }
    g.globalAlpha = 1; g.font = `700 ${Math.round(w * .2)}px ${getComputedStyle(document.body).fontFamily}`;
    g.lineWidth = 8; g.strokeStyle = C(1); g.fillStyle = pal.wall[1].hex; g.strokeText("Note", w * .2, h * .86); g.fillText("Note", w * .2, h * .86);
  });
  const blockMat = [flat(PAPER), flat(PAPER), flat(PAPER), flat(INK), flat(PAPER), flat(PAPER)];
  const block = new THREE.Mesh(new THREE.BoxGeometry(W, 6, H), blockMat); block.position.set(W / 2, 3, H / 2); book.add(block);
  const pageGeo = (segs) => { const geo = new THREE.PlaneGeometry(W, H, segs, 1); geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, H / 2); return geo; };
  // A bend that turns later the farther it is from the spine as the page turns — the original is physics that drags the apex, the copy takes the same path in a shader
  const flipMat = (front, back) => {
    const m = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uP: { value: 0 }, uFront: { value: new THREE.Color(front) }, uBack: { value: new THREE.Color(back) }, uMap: { value: null }, uHasMap: { value: 0 } },
      vertexShader: `uniform float uP; varying vec2 vUv; varying float vFace;
        void main(){ vUv = uv; vec3 p = position; float r = p.x / ${W.toFixed(1)};
          float a = uP * 3.14159265 * (1.0 + 0.0) - sin(uP * 3.14159265) * 0.55 * r * r;
          float lift = sin(uP * 3.14159265) * 18.0 * r;
          vec3 q = vec3(cos(a) * p.x, sin(a) * p.x + p.y + lift * 0.2, p.z);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0); }`,
      fragmentShader: `uniform vec3 uFront; uniform vec3 uBack; uniform sampler2D uMap; uniform float uHasMap; varying vec2 vUv;
        void main(){ vec3 c = gl_FrontFacing ? uFront : uBack;
          if (gl_FrontFacing && uHasMap > .5) { vec4 t = texture2D(uMap, vUv); c = mix(c, t.rgb, t.a); }
          gl_FragColor = vec4(c, 1.0); }`,
    });
    return m;
  };
  const coverMat = flipMat(PAPER, pal.wall[1].hex); coverMat.uniforms.uMap.value = coverTex; coverMat.uniforms.uHasMap.value = 1;
  coverMat.uniforms.uFront.value.set(pal.wall[1].hex);
  const cover = new THREE.Mesh(pageGeo(24), coverMat); cover.position.y = 6.2; book.add(cover);
  const leftPage = new THREE.Mesh(pageGeo(1), flat(PAPER, THREE.DoubleSide)); leftPage.rotation.z = Math.PI; leftPage.position.y = 6.05; leftPage.visible = false; book.add(leftPage);
  const leftBlock = new THREE.Mesh(new THREE.BoxGeometry(W, 6, H), blockMat); leftBlock.position.set(-W / 2, 3, H / 2); leftBlock.visible = false; book.add(leftBlock);
  const rightPage = new THREE.Mesh(pageGeo(1), flat(PAPER, THREE.DoubleSide)); rightPage.position.y = 6.05; book.add(rightPage);
  const turner = new THREE.Mesh(pageGeo(24), flipMat(PAPER, PAPER)); turner.position.y = 6.3; turner.visible = false; book.add(turner);
  const fans = Array.from({ length: 5 }, (_, n) => {
    const mesh = new THREE.Mesh(pageGeo(24), flipMat(pal.front[0].hex, pal.frame[0].hex)); mesh.position.y = 6.25 - n * 0.02; mesh.visible = false; book.add(mesh);
    return { mesh, t0: -1, dur: 1400 };
  });
  book.position.z = -H / 2;

  // ── Hero circle button (original 3D icon) — every 1.8s it swaps color and turns half a turn on Y
  const startBtn = new THREE.Group(), spinner = new THREE.Group(); startBtn.add(spinner);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 4, 48), flat(C(0)));
  disc.rotation.x = Math.PI / 2; spinner.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(34, 1.1, 8, 64), flat(INK)); rim.position.z = 2.1; spinner.add(rim);
  const triShape = new THREE.Shape(); triShape.moveTo(-6, -10); triShape.lineTo(10, 0); triShape.lineTo(-6, 10); triShape.closePath();
  const tri = new THREE.Mesh(new THREE.ShapeGeometry(triShape), flat(INK)); tri.position.z = 2.2; spinner.add(tri);
  const tri2 = tri.clone(); tri2.position.z = -2.2; tri2.rotation.y = Math.PI; spinner.add(tri2);
  startBtn.position.set(W + 48, 36, 60); world.add(startBtn);
  let btnSpin = 0, btnSpinFrom = 0, btnSpinT = -1;
  const spinButton = (hex) => { disc.material.color.set(hex); btnSpinFrom = btnSpin; btnSpin += Math.PI; btnSpinT = performance.now(); };

  // ── Hand cursor (original hand_icon 3D) — follows the cursor spot on the desk
  const hand = new THREE.Group();
  const hs = new THREE.Shape();
  hs.moveTo(-9, -14); hs.lineTo(-11, 2); hs.lineTo(-13, 10); hs.quadraticCurveTo(-11, 13, -9, 10); hs.lineTo(-7, 4); hs.lineTo(-7, 16);
  hs.quadraticCurveTo(-5, 19, -3, 16); hs.lineTo(-3, 6); hs.lineTo(-2, 19); hs.quadraticCurveTo(0, 22, 2, 19); hs.lineTo(2, 6);
  hs.lineTo(4, 17); hs.quadraticCurveTo(6, 20, 8, 17); hs.lineTo(8, 5); hs.lineTo(10, 11); hs.quadraticCurveTo(12, 13, 13, 10); hs.lineTo(11, -4); hs.quadraticCurveTo(8, -14, 2, -14); hs.closePath();
  const handFill = new THREE.Mesh(new THREE.ShapeGeometry(hs), flat(C(0))); handFill.position.z = .4; hand.add(handFill);
  const handLine = new THREE.Mesh(new THREE.ShapeGeometry(hs), flat(INK)); handLine.scale.setScalar(1.14); hand.add(handLine);
  hand.scale.setScalar(1.3); hand.visible = false; world.add(hand);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -14), hit = new THREE.Vector3();

  // ── Models rising from the unfolded face — original scene json positions and frames (24fps) as basic shapes
  const KIND = {
    book: () => new THREE.BoxGeometry(34, 9, 46), file: () => new THREE.BoxGeometry(24, 40, 34), liner: () => new THREE.CylinderGeometry(5, 5, 34, 16),
    human: () => new THREE.CapsuleGeometry(7, 22, 4, 12), eraser: () => new THREE.BoxGeometry(14, 7, 22), plane: () => new THREE.ConeGeometry(10, 30, 3),
    building: () => new THREE.BoxGeometry(30, 70, 30), car: () => new THREE.BoxGeometry(34, 14, 18), chair: () => new THREE.BoxGeometry(22, 30, 22),
    deskT: () => new THREE.BoxGeometry(70, 26, 40), shelf: () => new THREE.BoxGeometry(60, 50, 16), tree: () => new THREE.ConeGeometry(16, 44, 12),
  };
  const CHAPTERS = [
    { line: "Your first scene line here — where the copy was born", items: [["book", -66, -59, 41, 1], ["book", -13, 61, 40, 3], ["liner", 2, 133, 55, 7], ["file", 86, -65, 49, 4], ["human", 30, 54, 42, 2], ["eraser", 90, 49, 58, 0], ["plane", -20, 0, 70, 6], ["plane", -150, -40, 64, 5]] },
    { line: "Your second scene in one line — streets and buildings", items: [["building", -161, 123, 71, 4], ["building", 161, 124, 75, 1], ["building", -108, -72, 57, 2], ["building", -77, -134, 49, 6], ["building", 116, -136, 56, 3], ["car", 0, 0, 38, 7], ["human", 10, 128, 43, 0]] },
    { line: "Third scene in one line — furniture that works.", items: [["chair", -51, 111, 45, 3], ["chair", 22, 0, 31, 1], ["deskT", -62, -56, 50, 5], ["human", -14, 111, 60, 2], ["shelf", 0, -81, 38, 4], ["shelf", 94, -124, 59, 6], ["chair", 164, 117, 38, 7]] },
    { line: "Your fourth scene here, one line — a gathering space", items: [["deskT", 125, -54, 25, 4], ["human", 72, 16, 18, 2], ["human", -70, -98, 28, 3], ["chair", -186, -91, 15, 5], ["chair", -66, -87, 36, 1], ["book", 89, -120, 9, 7], ["tree", 150, 90, 22, 2]] },
    { line: "Your fifth scene line here — Building Tomorrow Together", items: [["building", 160, -120, 1, 1], ["building", -170, -110, 1, 5], ["deskT", 120, 39, 1, 4], ["liner", -102, 63, 1, 7], ["human", 23, -113, 1, 2], ["human", -42, -11, 1, 3], ["human", 6, -67, 1, 6], ["tree", -150, 100, 1, 2]] },
  ];
  // The original model fills the unfolded face, so the default shape is scaled up 1.8x
  const POP = 1.8;
  const popRoot = new THREE.Group(); book.add(popRoot);
  let pops = [];
  const buildChapter = (i) => {
    popRoot.clear(); pops = [];
    const ch = CHAPTERS[i], minF = Math.min(...ch.items.map((it) => it[3]));
    ch.items.forEach(([kind, x, z, f, ci]) => {
      const geo = KIND[kind](); geo.computeBoundingBox(); const hgt = geo.boundingBox.max.y - geo.boundingBox.min.y;
      geo.translate(0, -geo.boundingBox.min.y, 0);
      const m = new THREE.Mesh(geo, flat(i % 2 ? F(ci) : C(ci)));
      const line = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })); line.scale.setScalar(1.06); m.add(line);
      m.position.set(x, 6.3, z + H / 2); m.scale.set(POP, 0.001, POP);
      if (kind === "plane") m.rotation.z = Math.PI / 2;
      popRoot.add(m);
      pops.push({ m, at: ((f - minF) / 24) * 1000, h: hgt });
    });
  };
  let popStart = -1;

  // ── State
  let interactive = false, colorIndex = 0, cycling = true, opened = false, chapter = 0, flipT = -1, flipDir = 1, coverT = -1, colorFade = null;
  const deskFrom = new THREE.Color(), wallFrom = new THREE.Color(), deskTo = new THREE.Color(), wallTo = new THREE.Color();
  const fadeColors = (i, dur) => {
    deskFrom.copy(deskMat.color); wallFrom.copy(wallMat.color); deskTo.set(pal.desk[i].hex); wallTo.set(pal.wall[i].hex);
    colorFade = { t0: performance.now(), dur };
  };
  const setPages = (i) => {
    leftPage.material.color.set(pal.front[i].hex); rightPage.material.color.set(pal.frame[i].hex);
    hand.children[0].material.color.set(pal.frame[i].hex);
  };

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight;
    if (!opened) { camState.pos.copy(landingPos()); camState.shiftY = isPC() ? 0 : -50; }
    setFov(camState.fov);
    placeStickers();
    document.getElementById("intro").style.setProperty("--swipew", innerWidth);
    document.getElementById("intro").style.setProperty("--swipeh", innerHeight);
  };
  addEventListener("resize", resize);
  resize();
  updateCam();
  // Build shaders up front at setup, since compiling on the first gesture freezes the screen
  renderer.compile(world, cam);

  const frame = (now) => {
    requestAnimationFrame(frame);
    updateCam();
    if (btnSpinT >= 0) { const k = Math.min(1, (now - btnSpinT) / 600); spinner.rotation.y = btnSpinFrom + (btnSpin - btnSpinFrom) * smooth(k); if (k >= 1) btnSpinT = -1; }
    if (!opened) startBtn.quaternion.copy(cam.quaternion);
    if (coverT >= 0) {
      const k = Math.min(1, (now - coverT) / 1400); coverMat.uniforms.uP.value = smooth(k);
      if (k >= 1) { coverT = -1; cover.visible = false; leftPage.visible = leftBlock.visible = true; }
    }
    fans.forEach((f) => { if (f.mesh.visible && f.t0 >= 0) f.mesh.material.uniforms.uP.value = smooth(Math.min(1, Math.max(0, (now - f.t0) / f.dur))); });
    if (flipT >= 0) {
      const k = Math.min(1, (now - flipT) / 1000), e = smooth(k);
      turner.material.uniforms.uP.value = flipDir > 0 ? e : 1 - e;
      if (k >= 1) { flipT = -1; turner.visible = false; setPages(chapter); }
    }
    if (colorFade) {
      const k = Math.min(1, (now - colorFade.t0) / colorFade.dur);
      deskMat.color.copy(deskFrom).lerp(deskTo, k); wallMat.color.copy(wallFrom).lerp(wallTo, k);
      if (k >= 1) colorFade = null;
    }
    if (popStart >= 0) {
      const t = now - popStart;
      pops.forEach((p) => { const k = Math.min(1, Math.max(0, (t - p.at) / 420)); const s = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 6) : 1; p.m.scale.y = Math.max(0.001, s * POP); });
    }
    renderer.render(world, cam);
  };
  requestAnimationFrame(frame);

  // ── Mouse — camera drift and hand cursor
  const canvas = renderer.domElement;
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (!interactive) return;
    fromMouse();
    if (touch || e.pointerType !== "mouse") return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    if (ray.ray.intersectPlane(floor, hit)) { hand.position.copy(hit); hand.quaternion.copy(cam.quaternion); hand.visible = e.target === canvas; canvas.classList.toggle("is-hand", hand.visible); }
  }, { passive: true });
  canvas.addEventListener("pointerleave", () => { hand.visible = false; });
  camState.want.set(0, 0, 0);

  // ── Loader — logo .6s → confetti every 1.8s, and like the original shows Loading dots if not done after 4s. Only a few images to load, so it checks three confetti pieces and then clears
  const intro = document.getElementById("intro"), introBG = document.getElementById("introBG"), sheet = introBG.querySelector(".introBGsheet");
  const logo = document.getElementById("introLogo"), loading = document.getElementById("loading");
  const startCycle = () => {
    sheet.style.backgroundColor = pal.frame[colorIndex % 8].hex;
    introBG.classList.add("is-animate");
    introBG.addEventListener("animationend", () => { introBG.style.backgroundColor = pal.frame[colorIndex % 8].hex; introBG.classList.remove("is-animate"); });
    ky.tip(0);
    spinButton(pal.frame[0].hex);
    setInterval(() => {
      if (!cycling) return;
      colorIndex++;
      sheet.style.backgroundColor = pal.frame[colorIndex % 8].hex;
      void introBG.offsetWidth; introBG.classList.add("is-animate");
      ky.tip(colorIndex % 8, 1);
      spinButton(pal.frame[colorIndex % 8].hex);
    }, 1800);
  };
  setTimeout(() => document.getElementById("remarks").classList.add("is-shown"), 50);
  let dots = 0;
  const dotTimer = setTimeout(() => {
    loading.classList.add("is-shown");
    const iv = setInterval(() => { loading.classList.remove(`is-step${(dots % 4) + 1}`); dots++; loading.classList.add(`is-step${(dots % 4) + 1}`); }, 200);
    intro.addEventListener("animationend", () => clearInterval(iv), { once: true });
  }, 4000);
  requestAnimationFrame(() => logo.classList.add("is-shown"));
  logo.addEventListener("transitionend", () => {
    startCycle();
    setTimeout(() => { clearTimeout(dotTimer); intro.classList.add("is-hide"); document.getElementById("logoLT").classList.add("is-shown"); }, reduce ? 0 : 5400);
  }, { once: true });
  intro.addEventListener("animationend", (e) => { if (e.animationName === "ky-slash") intro.remove(); });

  // ── Open notebook
  const titleIntro = document.getElementById("titleIntro");
  titleIntro.addEventListener("pointerenter", () => titleIntro.classList.add("is-hover"));
  titleIntro.addEventListener("pointerleave", () => titleIntro.classList.remove("is-hover"));
  const pager = document.getElementById("pager"), prevB = pager.querySelector(".prev"), nextB = pager.querySelector(".next");
  const chapterLine = document.getElementById("chapter");
  const showChapter = (i) => {
    chapterLine.querySelector("p").textContent = CHAPTERS[i].line;
    chapterLine.classList.add("is-shown");
    buildChapter(i); popStart = performance.now();
    prevB.disabled = i === 0; nextB.disabled = i === CHAPTERS.length - 1;
  };
  const open = () => {
    if (opened) return;
    opened = true; cycling = false;
    document.body.classList.add("is-opened");
    titleIntro.remove();
    world.remove(startBtn);
    ky.tip(0, 1);
    fadeColors(0, 2000);
    // In the original the head title comes down after the press handling (scene prep) — measured, 434ms after the press
    setTimeout(() => document.getElementById("titleRT").classList.add("is-shown"), reduce ? 0 : 280);
    // Start (original nextToBeginning) — the camera approaches the notebook over 2s, and five pages flip like a fan behind the cover at .2s intervals (5.14s)
    moveCam(new THREE.Vector3(70, 230, 360), new THREE.Vector3(10, 20, 10), reduce ? 0.01 : 2);
    coverT = performance.now() + 300;
    setPages(0);
    fans.forEach((f, n) => { f.mesh.visible = true; f.t0 = performance.now() + (reduce ? 0 : 500 + n * 200); f.dur = 1400 + n * 120; });
    setTimeout(() => { landing.visible = false; }, reduce ? 0 : 900);
    // After that (original setDefaultCameraPosition) — radius 720 and 75° over 2s, with view and push on the same curve
    setTimeout(() => {
      const fov0 = camState.fov, shift0 = camState.shiftY, t0 = performance.now();
      moveCam(new THREE.Vector3(0, R1 * Math.cos(ROT1), R1 * Math.sin(ROT1)), new THREE.Vector3(0, 0, 0), reduce ? 0.01 : 2);
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / (reduce ? 10 : 2000)), e = smooth(k);
        camState.shiftY = shift0 + (SHIFT_Y * (isPC() ? 0.95 : 1.7) - shift0) * e;
        setFov(fov0 + (fov0 / Math.max(1, (innerHeight / innerWidth) * 0.6) - fov0) * e);
        if (k < 1) requestAnimationFrame(step);
      };
      step();
      fans.forEach((f) => { f.mesh.visible = false; });
      showChapter(0);
      interactive = true;
      mouse.x = innerWidth / 2; mouse.y = innerHeight / 2; fromMouse();
      pager.classList.add("is-shown");
      document.querySelector(".modalopenbutton").classList.remove("is-hidden");
    }, reduce ? 0 : 5143);
  };
  titleIntro.addEventListener("click", open);
  titleIntro.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  // On PC pages are turned by clicking as in the original (right side → next, left side → previous). Turn buttons only on touch screens
  canvas.addEventListener("click", (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    if (!opened) { if (ray.intersectObject(startBtn, true).length) open(); return; }
    const hitPage = ray.intersectObjects([rightPage, leftPage], false)[0];
    if (hitPage) flip(hitPage.object === rightPage ? 1 : -1);
  });
  const flip = (dir) => {
    const next = chapter + dir;
    if (!opened || flipT >= 0 || next < 0 || next >= CHAPTERS.length) return;
    flipDir = dir;
    turner.material.uniforms.uFront.value.set(pal.frame[chapter].hex);
    turner.material.uniforms.uBack.value.set(pal.front[next].hex);
    turner.visible = true; flipT = performance.now();
    chapter = next;
    if (dir > 0) rightPage.material.color.set(pal.frame[next].hex); else leftPage.material.color.set(pal.front[next].hex);
    ky.tip(next, dir);
    fadeColors(next, 1000);
    showChapter(next);
  };
  nextB.addEventListener("click", () => flip(1));
  prevB.addEventListener("click", () => flip(-1));
  addEventListener("keydown", (e) => { if (e.key === "ArrowRight") flip(1); if (e.key === "ArrowLeft") flip(-1); });

  // ── Menu dialog
  const dialog = document.querySelector(".ky-menu");
  document.querySelector(".modalopenbutton").addEventListener("click", () => dialog.showModal());
  dialog.querySelector(".ky-menu__close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".ky-menu__back").addEventListener("click", () => location.reload());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
})();
