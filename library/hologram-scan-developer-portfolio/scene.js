// One three canvas behind the screen — a workshop on a beige panel (a figure sitting and coding) → a figure on a blue lab pedestal scanned as a hologram from bottom to top → a dozing figure in a pile of boxes in the Contact section.
// The original models and shaders are not used, and the same scene and motion are built with basic shapes (rounded box, capsule, sphere) and our shaders. Material colors are image content, so they sit outside the Skin variables (marked per line).
(() => {
  const canvas = document.querySelector(".dv-canvas");
  if (!canvas || !window.THREE) return;
  const T = THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const probe = document.createElement("canvas").getContext("2d");
  const cssColor = (name) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255).convertSRGBToLinear();
  };
  const C = {
    bg: cssColor("--kf-bg"),
    raised: cssColor("--kf-raised"),
    accent: cssColor("--kf-accent"),
    lab: cssColor("--site-lab"),
    labDeep: cssColor("--site-lab-deep"),
    holo: cssColor("--site-holo"),
  };
  const P = {
    plate: 0xf3eadc, // not a skin: room floor·wall clay color
    white: 0xf6f5f2, // not clothing: white plastic of desk and chair
    wood: 0xd7b089, // not clothing: wooden legs
    screen: 0x3a3947, // not clothing: monitor bezel
    metal: 0x9a9aa3, // not clothing: chair leg metal
    skin: 0xf2c4a2, // Not clothing: skin
    hair: 0x7a5034, // not clothing: hair
    shirt: 0x3d3c3f, // not clothing: T-shirt
    pants: 0x26262a, // not the outfit: pants
    shoe: 0xf1f1f1, // Not clothing: shoes
    sole: 0x55555c, // Not clothing: sole
    rug1: 0xf09a2c, // not clothing: orange outside the rug
    rug2: 0xf5b847, // not a skin: center of the rug
    rug3: 0xf6d86a, // not clothing: yellow inside the rug
    cork: 0x9a7b62, // not a skin: cork board
    note: 0xb9d0ec, // not clothing: light blue memo paper
    paper: 0xf4f2ec, // not a skin: white memo paper
    pin: 0xe26068, // not clothing: thumbtack
    book1: 0xa9adb4, // Not skin: gray book
    book2: 0xf2a33a, // Not skin: orange book
    leaf: 0x8cc63f, // not skin: leaf
    pot: 0xf2f0ea, // not clothing: flowerpot
    box: 0xd9a66b, // Not skin: cardboard box
    tape: 0xe9c48f, // not a skin: box tape
    navy: 0x15265a, // not a skin: pedestal body
    black: 0x1d1d22, // not skin: eyes
  };

  // Matte like clay — draw a sphere lit from the upper left on a canvas and use it as a matcap
  const matcap = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(100, 86, 6, 128, 128, 140);
    grad.addColorStop(0, "#ffffff"); // Not skin: matcap light intensity
    grad.addColorStop(0.45, "#f3f3f3"); // Not skin: matcap light intensity
    grad.addColorStop(0.85, "#cfcfcf"); // Not skin: matcap light intensity
    grad.addColorStop(1, "#a8a8a8"); // Not skin: matcap light intensity
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  })();
  const mats = new Map();
  const M = (hex) => { if (!mats.has(hex)) mats.set(hex, new T.MeshMatcapMaterial({ color: hex, matcap })); return mats.get(hex); };

  // Rounded box: extrudes a rounded rectangle at a bevel
  const rbox = (w, h, d, r = 0.06) => {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const x = w / 2 - r, y = h / 2 - r, q = Math.min(x, y) * 0.5;
    const s = new T.Shape();
    s.moveTo(-x + q, -y);
    s.lineTo(x - q, -y);
    s.quadraticCurveTo(x, -y, x, -y + q);
    s.lineTo(x, y - q);
    s.quadraticCurveTo(x, y, x - q, y);
    s.lineTo(-x + q, y);
    s.quadraticCurveTo(-x, y, -x, y - q);
    s.lineTo(-x, -y + q);
    s.quadraticCurveTo(-x, -y, -x + q, -y);
    const g = new T.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
    g.translate(0, 0, -Math.max(0.001, d - 2 * r) / 2);
    g.computeVertexNormals();
    return g;
  };
  const mesh = (geo, hex, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, typeof hex === "number" ? M(hex) : hex); m.position.set(x, y, z); return m; };
  const cap = (r, len) => new T.CapsuleGeometry(r, len, 6, 12);

  // ── Person: big-head, child-like proportions (standing height 2.6). An axis group per joint, so sitting, standing, dozing and arm-folding change by rotation alone ──
  function person(material = null) {
    const m = (hex) => material ? material(hex) : M(hex);
    const root = new T.Group(), hips = new T.Group();
    hips.position.y = 1.05;
    root.add(hips);
    const torso = new T.Group();
    hips.add(torso);
    torso.add(mesh(cap(0.4, 0.42), m(P.shirt), 0, 0.5, 0));
    torso.children[0].scale.set(1, 1, 0.78);
    const neck = new T.Group();
    neck.position.y = 1.05;
    torso.add(neck);
    const head = new T.Group();
    head.position.y = 0.42;
    neck.add(head);
    const skull = mesh(new T.SphereGeometry(0.56, 32, 24), m(P.skin));
    skull.scale.set(1, 0.95, 0.94);
    head.add(skull);
    const hair = mesh(new T.SphereGeometry(0.6, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.56), m(P.hair), 0, 0.04, -0.03);
    hair.rotation.x = -0.32;
    head.add(hair);
    const fringe = mesh(new T.SphereGeometry(0.3, 20, 14), m(P.hair), 0.08, 0.36, 0.3);
    fringe.scale.set(1.5, 0.55, 0.9);
    fringe.rotation.z = -0.25;
    head.add(fringe);
    [-0.2, 0.2].forEach((x) => {
      head.add(mesh(new T.SphereGeometry(0.055, 12, 10), m(P.black), x, -0.02, 0.5));
      const ear = mesh(new T.SphereGeometry(0.11, 12, 10), m(P.skin), x * 2.8, -0.02, 0);
      ear.scale.set(0.6, 1, 0.8);
      head.add(ear);
    });
    const limb = (parent, x, y, upper, lower, r, colU, colL, len = 0.42) => {
      const a = new T.Group();
      a.position.set(x, y, 0);
      parent.add(a);
      a.add(mesh(cap(r, len), m(colU), 0, -len / 2 - r * 0.6, 0));
      const b = new T.Group();
      b.position.y = -len - r * 0.4;
      a.add(b);
      b.add(mesh(cap(r * 0.9, len * 0.95), m(colL), 0, -len / 2 - r * 0.4, 0));
      return { a, b };
    };
    const armL = limb(torso, -0.5, 0.86, 0, 0, 0.13, P.shirt, P.skin, 0.36);
    const armR = limb(torso, 0.5, 0.86, 0, 0, 0.13, P.shirt, P.skin, 0.36);
    const legL = limb(hips, -0.2, 0, 0, 0, 0.17, P.pants, P.pants, 0.42);
    const legR = limb(hips, 0.2, 0, 0, 0, 0.17, P.pants, P.pants, 0.42);
    [legL, legR].forEach((l) => {
      const shoe = new T.Group();
      shoe.position.y = -0.62;
      l.b.add(shoe);
      shoe.add(mesh(rbox(0.36, 0.2, 0.56, 0.09), m(P.shoe), 0, 0, 0.1));
      shoe.add(mesh(rbox(0.38, 0.06, 0.58, 0.03), m(P.sole), 0, -0.1, 0.1));
    });
    const parts = { root, hips, torso, neck, head, armL, armR, legL, legR };
    root.userData.parts = parts;
    return root;
  }
  // Pose: [torso x, neck x, left arm shoulder x·z, elbow x, right arm …, leg hip x, knee x, hip height]
  const POSE = {
    stand: { torso: 0, neck: 0, arm: [0.05, 0.12, -0.12], leg: [0, 0], hipY: 1.05 },
    sit: { torso: 0.08, neck: 0.12, arm: [-0.95, 0.18, -0.75], leg: [-1.5, 1.45], hipY: 0.95 },
    sleep: { torso: 0.32, neck: 0.55, arm: [-0.45, 0.25, -1.25], leg: [-1.25, 0.55], hipY: 0.34 },
    fold: { torso: 0, neck: -0.05, arm: [-0.55, 0.42, -1.95], leg: [0, 0], hipY: 1.05 },
  };
  const pose = (p, a, b = a, t = 0) => {
    const k = p.userData.parts, A = POSE[a], B = POSE[b], L = (x, y) => x + (y - x) * t;
    k.hips.position.y = L(A.hipY, B.hipY);
    k.torso.rotation.x = L(A.torso, B.torso);
    k.neck.rotation.x = L(A.neck, B.neck);
    [[k.armL, 1], [k.armR, -1]].forEach(([arm, s]) => {
      arm.a.rotation.x = L(A.arm[0], B.arm[0]);
      arm.a.rotation.z = s * L(A.arm[1], B.arm[1]);
      arm.b.rotation.x = L(A.arm[2], B.arm[2]);
      arm.b.rotation.y = -s * L(a === "fold" ? 0.9 : 0, b === "fold" ? 0.9 : 0);
    });
    [k.legL, k.legR].forEach((leg) => { leg.a.rotation.x = L(A.leg[0], B.leg[0]); leg.b.rotation.x = L(A.leg[1], B.leg[1]); });
  };

  // ── Studio: on a beige board (floor · back wall · side wall) sit a rug · desk · two monitors · chair · figure · cork board · shelf · plant ──
  const codeTex = (seed) => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 160;
    const g = c.getContext("2d");
    g.fillStyle = "#2b2b36"; // Not skin: screen background
    g.fillRect(0, 0, 256, 160);
    const hues = ["#f5a35b", "#c9a3f0", "#9fd67c", "#f0d36b", "#79b8f2", "#e9e9e9"]; // Not skin: code text line color
    let r = seed;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let y = 14; y < 150; y += 9) { const x = 18 + Math.floor(rnd() * 3) * 10; g.fillStyle = hues[Math.floor(rnd() * hues.length)]; g.fillRect(x, y, 40 + rnd() * 140, 4); }
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };
  function room() {
    const g = new T.Group();
    // Floor and walls match the background color (no lighting) — like the original, no room edges show and only the objects float
    const wall = new T.MeshBasicMaterial({ color: C.bg });
    g.add(mesh(new T.BoxGeometry(14, 0.5, 14), wall, 0, -0.25, 0));
    g.add(mesh(new T.BoxGeometry(14, 9, 0.5), wall, 0, 4.5, -7));
    g.add(mesh(new T.BoxGeometry(0.5, 9, 14), wall, -7, 4.5, 0));
    [[7.6, P.rug1, 0.02], [5.8, P.rug2, 0.05], [4.2, P.rug3, 0.08]].forEach(([s, c, y]) => g.add(mesh(rbox(s, 0.06, s, 0.6), c, 0.6, y, 0.8)));
    const desk = new T.Group();
    desk.position.set(0.4, 0, -2.6);
    desk.add(mesh(rbox(5.4, 0.22, 2.3, 0.1), P.white, 0, 2.1, 0));
    [[-2.4, -0.9], [2.4, -0.9], [-2.4, 0.9], [2.4, 0.9]].forEach(([x, z]) => desk.add(mesh(new T.CylinderGeometry(0.09, 0.07, 2, 12), P.wood, x, 1, z)));
    [[-1.2, 0.18, 11], [1.3, -0.12, 29]].forEach(([x, ry, seed]) => {
      const mon = new T.Group();
      mon.position.set(x, 3.25, -0.35);
      mon.rotation.y = ry;
      mon.add(mesh(rbox(2.2, 1.4, 0.14, 0.07), P.screen));
      const scr = new T.Mesh(new T.PlaneGeometry(2.02, 1.24), new T.MeshBasicMaterial({ map: codeTex(seed) }));
      scr.position.z = 0.075;
      mon.add(scr);
      mon.add(mesh(new T.BoxGeometry(0.12, 0.9, 0.12), P.screen, 0, -0.95, -0.05));
      mon.add(mesh(rbox(0.7, 0.06, 0.45, 0.03), P.screen, 0, -1.38, 0));
      desk.add(mon);
    });
    desk.add(mesh(rbox(1.3, 0.05, 0.45, 0.02), P.white, 0.2, 2.24, 0.45));
    const cup = mesh(new T.CylinderGeometry(0.16, 0.14, 0.34, 16), P.book1, -2.1, 2.38, 0.3);
    desk.add(cup);
    [[0xf2a33a, 0.06], [0xe26068, -0.06]].forEach(([c, x]) => { const p = mesh(new T.CylinderGeometry(0.03, 0.03, 0.6, 8), c, -2.1 + x, 2.6, 0.3); p.rotation.z = x * 3; desk.add(p); }); // Not skin: pencil color
    const spk = new T.Group();
    spk.position.set(2.3, 2.5, 0.3);
    spk.add(mesh(rbox(0.5, 0.6, 0.4, 0.08), P.book2));
    spk.add(mesh(new T.CylinderGeometry(0.15, 0.15, 0.05, 20), P.screen, 0, 0, 0.2).rotateX(Math.PI / 2));
    desk.add(spk);
    g.add(desk);
    const chair = new T.Group();
    chair.position.set(0.3, 0, -0.4);
    chair.rotation.y = 0.12;
    chair.add(mesh(rbox(1.6, 0.18, 1.5, 0.08), P.white, 0, 1.35, 0));
    const back = mesh(rbox(1.6, 1.7, 0.16, 0.08), P.white, 0, 2.2, 0.75);
    back.rotation.x = 0.12;
    chair.add(back);
    const leg = mesh(new T.TorusGeometry(0.7, 0.05, 8, 24, Math.PI), P.metal, 0, 0.62, 0);
    leg.rotation.set(Math.PI / 2, 0, 0);
    chair.add(leg);
    chair.add(mesh(new T.CylinderGeometry(0.05, 0.05, 0.75, 8), P.metal, 0, 0.95, 0));
    g.add(chair);
    const who = person();
    who.position.set(0.3, 0.42, -0.5);
    who.rotation.y = Math.PI;
    pose(who, "sit");
    g.add(who);
    const board = new T.Group();
    board.position.set(1.6, 6.2, -6.7);
    board.add(mesh(rbox(4.2, 2.8, 0.16, 0.12), P.wood));
    board.add(mesh(new T.PlaneGeometry(3.8, 2.4), P.cork, 0, 0, 0.09));
    [[-1, 0.3, P.note, 0.08], [1.1, -0.35, P.paper, -0.12]].forEach(([x, y, c, rz]) => {
      const n = mesh(new T.PlaneGeometry(1, 1.2), c, x, y, 0.1);
      n.rotation.z = rz;
      board.add(n);
      board.add(mesh(new T.SphereGeometry(0.16, 14, 10), P.pin, x - 0.15, y + 0.4, 0.22));
    });
    g.add(board);
    const shelf = new T.Group();
    shelf.position.set(-3.2, 6.6, -6.5);
    shelf.add(mesh(rbox(2.4, 0.16, 0.8, 0.05), P.wood));
    shelf.add(mesh(rbox(0.32, 1.1, 0.7, 0.05), P.book1, -0.8, 0.63, 0));
    shelf.add(mesh(rbox(0.4, 1.0, 0.7, 0.05), P.book2, -0.4, 0.58, 0));
    shelf.add(mesh(new T.CylinderGeometry(0.3, 0.26, 0.5, 18), P.pot, 0.55, 0.33, 0));
    shelf.add(mesh(cap(0.14, 0.3), P.leaf, 0.55, 0.85, 0));
    g.add(shelf);
    const plant = new T.Group();
    plant.position.set(5.3, 0, 3.6);
    plant.add(mesh(new T.CylinderGeometry(0.75, 0.6, 1.3, 22), P.pot, 0, 0.65, 0));
    for (let i = 0; i < 6; i++) { const l = mesh(new T.SphereGeometry(0.5, 14, 10), P.leaf, Math.cos(i) * 0.4, 1.9 + (i % 2) * 0.4, Math.sin(i) * 0.4); l.scale.set(0.5, 1.6, 0.18); l.rotation.set(Math.sin(i) * 0.6, i, Math.cos(i) * 0.6); plant.add(l); }
    g.add(plant);
    return { g, who, chair, spk };
  }

  // ── Lab: a figure standing on a pedestal (navy body · teal light ring · light beam rising up). The figure is a hologram below the scan height ──
  const holoUniforms = { uScan: { value: -10 }, uHolo: { value: C.holo }, uTime: { value: 0 } };
  const holoMat = (hex) => new T.ShaderMaterial({
    transparent: true,
    uniforms: { ...holoUniforms, uColor: { value: new T.Color(hex) }, uMatcap: { value: matcap } },
    vertexShader: `varying vec3 vN;varying vec3 vW;varying vec3 vV;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(normalMatrix*normal);vec4 mv=viewMatrix*w;vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uScan;uniform vec3 uHolo;uniform vec3 uColor;uniform float uTime;uniform sampler2D uMatcap;varying vec3 vN;varying vec3 vW;varying vec3 vV;
void main(){vec3 cl=uColor*texture2D(uMatcap,vN.xy*.495+.5).rgb;
float rim=pow(1.-max(dot(vN,vV),0.),1.6);float lines=.55+.45*step(.5,fract(vW.y*14.-uTime*.6));
vec3 holo=uHolo*(.35+rim*1.4)*lines;float a=.38+rim*.62;
float edge=smoothstep(.06,0.,abs(vW.y-uScan));
if(vW.y<uScan){gl_FragColor=vec4(holo+uHolo*edge*1.5,a);}else{gl_FragColor=vec4(cl+uHolo*edge*1.2,1.);}
#include <colorspace_fragment>
}`,
  });
  function lab() {
    const g = new T.Group();
    const base = new T.Group();
    base.add(mesh(new T.CylinderGeometry(1.3, 1.5, 0.5, 48), P.navy, 0, -0.25, 0));
    const ring = new T.Mesh(new T.TorusGeometry(1.24, 0.05, 10, 64), new T.MeshBasicMaterial({ color: C.holo }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    base.add(ring);
    const disk = new T.Mesh(new T.CircleGeometry(1.16, 48), new T.MeshBasicMaterial({ color: C.holo, transparent: true, opacity: 0.35 }));
    disk.rotation.x = -Math.PI / 2;
    disk.position.y = 0.012;
    base.add(disk);
    const beam = new T.Mesh(new T.CylinderGeometry(1.1, 1.18, 3.6, 48, 1, true), new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending,
      uniforms: { uHolo: holoUniforms.uHolo, uTime: holoUniforms.uTime },
      vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "uniform vec3 uHolo;uniform float uTime;varying vec2 vU;void main(){float a=pow(1.-vU.y,2.2)*.42*(.8+.2*sin(vU.x*60.+uTime*2.));gl_FragColor=vec4(uHolo*a,a);}",
    }));
    beam.position.y = 1.8;
    base.add(beam);
    // Number plate in front of the pedestal — scan % as three digits
    const numC = document.createElement("canvas");
    numC.width = 256; numC.height = 96;
    const numT = new T.CanvasTexture(numC);
    numT.colorSpace = T.SRGBColorSpace;
    const num = new T.Mesh(new T.PlaneGeometry(1.1, 0.41), new T.MeshBasicMaterial({ map: numT, transparent: true }));
    num.position.set(0, -0.26, 1.42);
    base.add(num);
    const holoHex = `#${C.holo.clone().convertLinearToSRGB().getHexString()}`;
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-pixel").trim() || "monospace";
    const drawNum = (n) => {
      const x = numC.getContext("2d");
      x.clearRect(0, 0, 256, 96);
      x.fillStyle = holoHex;
      x.font = `72px ${font}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(String(n).padStart(3, "0"), 128, 52);
      numT.needsUpdate = true;
    };
    drawNum(0);
    g.add(base);
    const who = person(holoMat);
    pose(who, "stand");
    g.add(who);
    return { g, who, drawNum };
  }

  // ── Contact section: a pile of cardboard boxes and a figure dozing astride one of them (stands up and folds arms at scroll end) ──
  function boxes() {
    const g = new T.Group();
    const add = (w, h, d, x, y, z, ry) => {
      const b = new T.Group();
      b.position.set(x, y + h / 2, z);
      b.rotation.y = ry;
      b.add(mesh(rbox(w, h, d, 0.05), P.box));
      b.add(mesh(new T.BoxGeometry(w * 0.22, 0.012, d + 0.01), P.tape, 0, h / 2 + 0.005, 0));
      g.add(b);
    };
    add(1.6, 1.2, 1.4, 2.5, 0, -1.4, 0.3);
    add(1.3, 1.0, 1.2, 2.7, 1.2, -1.5, 0.1);
    add(1.4, 1.1, 1.3, 4.1, 0, -0.4, -0.25);
    add(1.0, 0.8, 0.9, 3.3, 0, 1.0, 0.6);
    add(1.2, 0.9, 1.1, -0.6, 0, -2.0, -0.15);
    const papers = [[0.4, 1.8, 0.4], [-1.6, 0.6, -0.5], [3.2, 1.6, 1.0]];
    const paperMat = new T.MeshBasicMaterial({ color: P.paper });
    papers.forEach(([x, z, r]) => { const p = mesh(new T.PlaneGeometry(0.5, 0.7), paperMat, x, 0.01, z); p.rotation.set(-Math.PI / 2, 0, r); g.add(p); });
    const who = person();
    who.position.set(0.6, 0, 0.6);
    pose(who, "sleep");
    g.add(who);
    return { g, who };
  }

  // ── Stage ──
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, 0.05, 200);
  const rig = new T.Group();
  rig.add(camera);
  scene.add(rig);
  const R = room(), L = lab(), B = boxes();
  R.g.position.set(-2, 0, 0);
  L.g.position.set(2.6, -10.5, 8.5);
  B.g.position.set(1.2, -40, 0);
  scene.add(R.g, L.g, B.g);
  // Anchor points (relative to the character) where the info box and snoring letters attach — moved to screen coordinates to place the [data-anchor] element there
  const anchors = {};
  [["head", L.who, -0.7, 2.7, 0], ["chest", L.who, -0.95, 1.55, 0], ["side", L.who, 0.85, 2.05, 0], ["sleep", B.who, 0.55, 2.45, 0.2]].forEach(([k, parent, x, y, z]) => {
    const o = new T.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    anchors[k] = o;
  });
  const anchorEls = [...document.querySelectorAll("[data-anchor]")];
  const av = new T.Vector3();
  const glow = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uA: { value: C.lab }, uB: { value: C.labDeep } },
    vertexShader: "varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 uA;uniform vec3 uB;varying vec2 vU;void main(){float d=distance(vU,vec2(.5,.45));gl_FragColor=vec4(mix(uA*1.25,uB,smoothstep(0.,.55,d)),1.);\n#include <colorspace_fragment>\n}",
  }));
  glow.position.set(2.6, -8, -8);
  glow.scale.setScalar(1.8);
  scene.add(glow);
  // Lab floor grid — faint around the pedestal
  const grid = new T.GridHelper(36, 36, C.holo, C.holo);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  grid.material.depthWrite = false;
  grid.position.set(2.6, -10.5 - 0.5, 8.5);
  scene.add(grid);

  // Camera positions: studio (looking down at an angle from the room side) → lab (figure from the front) · Contact (box pile)
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const shots = {
    room: { pos: V(11.4, 10.75, 13.5), at: V(-5.4, 3.4, -1.6) },
    lab: { pos: V(2.6, -8.6, 16.9), at: V(2.6, -9.25, 8.5) },
    contact: { pos: V(0.6, -36.4, 10.2), at: V(1.6, -38.9, 0) },
  };
  const state = { intro: 0, scan: 0, contactIn: 0, contactOut: 0, wake: 0 };
  window.dvScene = { state };

  const tmpP = new T.Vector3(), tmpA = new T.Vector3();
  const easeIO = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const mouse = { x: 0, y: 0 }, ndc = new T.Vector2(2, 2), par = new T.Vector2();
  const fine = matchMedia("(hover: hover)").matches && !reduce;
  if (fine) addEventListener("pointermove", (e) => {
    mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  }, { passive: true });
  // Original distance to the point the camera looks at (landscape: Studio 10.44 · Lab 9.77 · Contact 9.22, portrait 16.28·14.07·12.08) —
  // Shifts the parallax by the ratio to the copy’s camera distance so it tilts by the same angle on screen. The copy studio is shot from 2.3x farther away, so using the original value 1 as is tilted only half as much.
  const origDist = { land: [10.44, 9.77, 9.22], port: [16.28, 14.07, 12.08] };
  // Like the original, when the ray picks the box around the speaker (widened by .15) the cursor becomes a black circle, and pressing toggles sound on·off
  const ray = new T.Raycaster(), hitBox = new T.Box3(), hitAt = new T.Vector3();
  const hover = { on: false };
  window.dvScene.hover = hover;
  window.addEventListener("click", (e) => {
    if (!fine || e.target.closest?.(".dv-sound")) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (pick()) document.querySelector(".dv-sound")?.click();
  });
  function pick() {
    if (ndc.x > 1 || state.contactIn > 0.001) return false;
    hitBox.setFromObject(R.spk).expandByScalar(0.15);
    ray.setFromCamera(ndc, camera);
    return !!ray.ray.intersectBox(hitBox, hitAt);
  }
  let lastNum = -1;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new T.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    holoUniforms.uTime.value = t;
    const contact = state.contactIn > 0.001;
    if (!contact) {
      const k = easeIO(Math.min(1, Math.max(0, state.intro)));
      tmpP.lerpVectors(shots.room.pos, shots.lab.pos, k);
      tmpA.lerpVectors(shots.room.at, shots.lab.at, k);
      scene.background = k < 0.02 ? C.bg : C.lab;
      glow.visible = grid.visible = k >= 0.02;
      R.g.scale.setScalar(1 - 0.15 * k);
      R.chair.rotation.y = 0.12 - 1.1 * (1 - Math.pow(1 - Math.min(1, state.intro / 0.6), 4));
      R.who.rotation.y = Math.PI + R.chair.rotation.y - 0.12;
      // Scan: from the toes (0 above the pedestal) to above the top of the head (2.75)
      holoUniforms.uScan.value = L.g.position.y + (state.scan * 2.95) - 0.05;
      const n = Math.floor(state.scan * 100);
      if (n !== lastNum) { L.drawNum(n); lastNum = n; }
      L.g.rotation.y = Math.sin(t * 0.4) * 0.04;
    } else {
      tmpP.copy(shots.contact.pos);
      tmpA.copy(shots.contact.at);
      tmpP.y += (1 - state.contactIn) * 4;
      scene.background = C.raised;
      glow.visible = grid.visible = false;
      const up = state.wake;
      pose(B.who, "sleep", "fold", easeIO(up));
      B.who.position.x = 0.6 + 0.4 * easeIO(up);
      B.who.position.z = 0.6 + 0.8 * easeIO(up);
      B.who.position.y = up > 0 ? 0 : Math.sin(t * 1.6) * 0.012;
    }
    // On portrait screens, step back so the whole scene fits
    if (camera.aspect < 1) tmpP.sub(tmpA).multiplyScalar(Math.pow(1 / camera.aspect, contact ? 0.5 : 0.65 - 0.5 * easeIO(Math.min(1, Math.max(0, state.intro))))).add(tmpA);
    // Mouse parallax (original units): moves 6% of the remaining distance toward the cursor × deltaRatio per step. If a single step is .05 or more, that frame does not move on that axis (the original skips it rather than clamping)
    if (fine) {
      const dr = gsap.ticker.deltaRatio();
      const sx = (mouse.x - par.x) * 0.06 * dr, sy = (-mouse.y - par.y) * 0.06 * dr;
      if (Math.abs(sx) < 0.05) par.x += sx;
      if (Math.abs(sy) < 0.05) par.y += sy;
      const od = origDist[camera.aspect < 1 ? "port" : "land"];
      const k = contact ? 1 : easeIO(Math.min(1, Math.max(0, state.intro)));
      const s = tmpP.distanceTo(tmpA) / (contact ? od[2] : od[0] + (od[1] - od[0]) * k);
      rig.position.set(par.x * s, par.y * s, 0);
    }
    camera.position.copy(tmpP);
    camera.lookAt(tmpA);
    camera.updateMatrixWorld();
    if (fine) {
      const on = pick();
      if (on !== hover.on) { hover.on = on; document.documentElement.style.cursor = on ? "pointer" : ""; }
    }
    const w = canvas.clientWidth, h = canvas.clientHeight;
    anchorEls.forEach((el) => {
      const o = anchors[el.dataset.anchor];
      if (!o) return;
      o.getWorldPosition(av).project(camera);
      el.style.transform = `translate(${((av.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-av.y * 0.5 + 0.5) * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);
})();
