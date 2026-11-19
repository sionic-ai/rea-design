// Work page — a moving delivery-control app mockup. On a 3D city built with three(r128), five deliveries run along the roads (30x speed),
// Late cars are painted red and chosen cars neon. Moving through the four screens (map, depot, load assignment, auto rules) with the left rail makes the camera fly.
// Values (grid 6, camera distance and angle, 1.15/1.9s power3.inOut, blocks rising by distance over 2.4s power2.out …) were measured from the original and carried over.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => RM.matches;
  const mobile = () => matchMedia("(max-width: 960px)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtT = (ms) => { const d = new Date(ms); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}Hour ${pad2(Math.round(m % 60))}Minute` : `${Math.max(0, Math.round(m))}Minute`);
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const ICONS = {
    map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15",
    truck: "M2 6.5h11v9.5H2z M13 9.5h4.2l3.8 4.2V16h-8 M4.5 18.5a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0 M15.5 18.5a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0",
    box: "M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5z M3 7.5l9 4.5 9-4.5 M12 12v9",
    flow: "M4 4h5v5H4z M15 15h5v5h-5z M6.5 9v3.5a2 2 0 0 0 2 2H17.5V15",
    search: "M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13 M20 20l-4.6-4.6",
    bell: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2z M10 20.5a2 2 0 0 0 4 0",
    upload: "M12 15.5V4 M7 9l5-5 5 5 M4 20h16",
    check: "M5 12.5l4.5 4.5L19 7.5",
    alert: "M12 8.5v5 M12 16.8v.01 M10.3 3.9L2.6 17.5a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    bolt: "M13 2.5L4.5 14H11l-1 7.5L18.5 10H12z",
    send: "M4 12l16-8-6 16-3-7z M11 13l9-9",
    pin: "M12 21s-7-6.4-7-11.8a7 7 0 0 1 14 0C19 14.6 12 21 12 21z M12 9.2v.01",
    link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    wrench: "M14.5 6.5a4 4 0 0 0 5 5L11 20l-3-3 8.5-8.5a4 4 0 0 0-2-2z",
    back: "M19 12H5 M11 6l-6 6 6 6",
    trash: "M4 7h16 M9 7V4.5h6V7 M6 7l1 13h10l1-13",
    minus: "M6 12h12",
    plus: "M12 6v12 M6 12h12",
    file: "M6 3h8l4 4v14H6z M14 3v4h4",
    clip: "M8.5 12.5l6-6a3 3 0 0 1 4.2 4.2l-8 8a5 5 0 0 1-7-7l7-7",
  };
  const ic = (k, cls = "ct-i is-s") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;
  const paintIcons = (root = document) => $$("svg[data-i]", root).forEach((s) => {
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = `<path d="${ICONS[s.dataset.i]}"/>`;
    s.removeAttribute("data-i");
  });
  paintIcons();

  /* ---------- Placeholder data — paths (grid coordinates) · speed · delay ranges follow the original mockup layout ---------- */
  const GRID = 6;
  const HUBS = {
    base: { name: "Hub Base", g: [0, 0] },
    north: { name: "Hub North", g: [-2, -4] },
    harbor: { name: "Hub Harbor", g: [4, -3] },
    airport: { name: "Hub Airport", g: [4, 4] },
    east: { name: "Hub East", g: [-4, 3] },
  };
  const DRIVERS = {};
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1].forEach((on, i) => {
    const k = `d${pad2(i + 1)}`;
    DRIVERS[k] = { key: k, name: `Driver ${pad2(i + 1)}`, online: !!on };
  });
  const STREETS = ["Street A", "Street B", "Street C", "Street D", "Street E", "Street F", "Ring Road", "Street H", "Street I", "Street J", "Street K"];
  const SHIP_SEED = [
    { id: "SH-0101", customer: "Customer 01", from: "base", to: "harbor", path: [[0, 0], [0, -1], [2, -1], [2, -3], [4, -3]], driver: "d02", vehicle: "DV-0010", model: "semi-dry", vname: "Box truck", cargo: "Packed cargo, 00 pallets", trip: 46, p: 0.34 },
    { id: "SH-0102", customer: "Customer 02", from: "north", to: "airport", path: [[-2, -4], [-2, 1], [1, 1], [1, 4], [4, 4]], driver: "d03", vehicle: "BX-0035", model: "box", vname: "Box truck", cargo: "Parts box 0 items", trip: 58, p: 0.2, delay: { u0: 0.4, u1: 0.6, where: "Ring Road", why: "Identity" } },
    { id: "SH-0103", customer: "Customer 03", from: "harbor", to: "east", path: [[4, -3], [4, 0], [-1, 0], [-1, 3], [-4, 3]], driver: "d04", vehicle: "FB-0031", model: "semi-flatbed", vname: "Reputation", cargo: "00 shelf sets", trip: 64, p: 0.1 },
    { id: "SH-0104", customer: "Customer 04", from: "airport", to: "base", path: [[4, 4], [4, 2], [0, 2], [0, 0]], driver: "d05", vehicle: "VN-0002", model: "van", vname: "Cargo van", cargo: "00 temperature log boxes", trip: 34, p: 0.62 },
    { id: "SH-0105", customer: "Customer 05", from: "east", to: "north", path: [[-4, 3], [-4, -1], [-2, -1], [-2, -4]], driver: "d06", vehicle: "TX-0008", model: "semi-reefer", vname: "Freezer truck", cargo: "Chilled food pallets 00", trip: 40, p: 0.83 },
  ];
  const YARD_SEED = [
    ["DV-0002", "Box truck", "semi-dry", "loading", "Bay 1", "d07", [-18, -8]], ["TX-0021", "Freezer truck", "semi-reefer", "available", "Bay 2", "d01", [-9, -8]],
    ["FB-0044", "Reputation", "semi-flatbed", "available", "Bay 3", "d08", [0, -8]], ["TX-0030", "Freezer truck", "semi-reefer", "service", "Bay 4", "d09", [9, -8]],
    ["DV-0018", "Box truck", "semi-dry", "available", "Bay 5", "d10", [18, -8]], ["BX-0032", "Box truck", "box", "service", "Dock 1", "d11", [-20, 7]],
    ["BX-0040", "Box truck", "box", "available", "Dock 2", "d12", [-12, 7]], ["VN-0018", "Cargo van", "van", "repair", "Workshop", "d13", [-4, 7]],
    ["VN-0025", "Cargo van", "van", "available", "Row B", "d14", [4, 7]], ["BX-0047", "Box truck", "box", "available", "Row B", "d15", [12, 7]],
    ["VN-0031", "Cargo van", "van", "loading", "Dock 3", "d16", [20, 7]],
  ].map(([id, name, model, status, loc, driver, slot]) => ({ id, name, model, status, loc, driver, slot, cap: model.startsWith("semi") ? "00,000 kg" : model === "box" ? "0,000 kg" : "000 kg", serviced: "Month 00 Day 00" }));
  const VSTATUS = { available: ["Ready to use", "is-ok"], loading: ["Loading", "is-volt"], service: ["Finishing maintenance", "is-warn"], repair: ["Under repair", "is-alert"], dispatched: ["Departed", ""] };
  const RULES = [
    { id: "late", on: true, when: "When delivery looks like it will be late", thr: 15, tail: "Minutes or more", then: "Text the recipient the new arrival time", runs: 2 },
    { id: "hub", on: true, when: "When the car reaches the arrival hub", then: "Send the unloading checklist to the hub team", runs: 5 },
    { id: "pod", on: true, when: "When delivery is complete", then: "Ask the driver for proof of receipt", runs: 5 },
    { id: "repair", on: false, when: "When your car is marked for repair", then: "Move the next load to the next empty car", runs: 0 },
  ];
  const RULE_NAME = { late: "Delay Text", hub: "Unloading Checklist", pod: "Proof of Receipt", repair: "Repair reassignment" };
  const rule = (id) => RULES.find((r) => r.id === id);
  const SLOW = 0.35;
  const S = { view: "", speed: 30, simNow: Date.now(), selShip: "SH-0101", selVeh: "TX-0021", side: "detail", chat: null, shipFilter: "all", vehFilter: "all", ships: [], yard: YARD_SEED, log: [], unread: 0, chats: {}, nextShip: 106, collapsed: false, lastPing: performance.now(), autoReady: false };

  /* ---------- Make the 3D color from the skin — by ratio between background·surface·ink·accent ---------- */
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const col = (n) => new THREE.Color(css(n) || 0x888888);
  const mix = (a, b, k) => a.clone().lerp(b, k);
  let P = null;
  const palette = () => {
    const bg = col("--kf-bg"), raised = col("--kf-raised"), ink = col("--kf-ink"), dim = col("--kf-dim"), acc = col("--kf-accent"), red = col("--kf-danger");
    return {
      bg, ink, acc, ground: mix(bg, ink, 0.05), block: mix(raised, bg, 0.4), plate: mix(raised, bg, 0.8), body: mix(raised, bg, 0.55),
      dark: mix(bg, ink, 0.36), glass: mix(bg, ink, 0.23), remain: mix(dim, bg, 0.15), trav: mix(bg, ink, 0.22), pad: mix(raised, bg, 0.1),
      stall: mix(raised, bg, 0.05), hemiGround: mix(bg, ink, 0.21), delay: mix(red, raised, 0.15),
      sel: [acc, mix(acc, ink, 0.25), mix(acc, ink, 0.12)], late: [mix(red, raised, 0.55), mix(red, raised, 0.2), mix(red, raised, 0.38)],
    };
  };

  /* ---------- 3D ---------- */
  const stage = $("#stage"), canvas = $("#gl");
  let GL = false, renderer, scene, camera, hemi, sun, net, yardG, blocks, blockData = [];
  const hubs = [], pickNet = [], pickYard = [], vehicles = [];
  const YO = new THREE.Vector3(140, 0, 0);
  const M = {};
  const cache = new Map();
  // Rounded-corner box — pushes out a rounded rectangle and trims the corners (the shadow settles softly)
  const rbox = (w, h, d, r) => {
    const key = [w, h, d, r].join("|");
    if (cache.has(key)) return cache.get(key);
    r = Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01);
    const b = r * 0.55, cw = w - 2 * b, ch = h - 2 * b, cr = Math.max(r - b, 0.005), x = -cw / 2, y = -ch / 2;
    const s = new THREE.Shape();
    s.moveTo(x + cr, y); s.lineTo(x + cw - cr, y); s.quadraticCurveTo(x + cw, y, x + cw, y + cr); s.lineTo(x + cw, y + ch - cr);
    s.quadraticCurveTo(x + cw, y + ch, x + cw - cr, y + ch); s.lineTo(x + cr, y + ch); s.quadraticCurveTo(x, y + ch, x, y + ch - cr); s.lineTo(x, y + cr); s.quadraticCurveTo(x, y, x + cr, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(d - 2 * b, 0.01), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 5 });
    g.center();
    cache.set(key, g);
    return g;
  };
  const wheel = (r, w) => { const key = `w${r}|${w}`; if (!cache.has(key)) { const g = new THREE.CylinderGeometry(r, r, w, 20); g.rotateX(Math.PI / 2); cache.set(key, g); } return cache.get(key); };
  const part = (geo, mat, x, y, z, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.z = rz; m.castShadow = true; m.receiveShadow = true; return m; };

  // Vehicle: cab + cargo (tower, freezer, flatbed load, box) + wheels. Length: semi 12.8, box 8.4, van 5.6
  function makeVehicle(kind) {
    const mats = { body: new THREE.MeshStandardMaterial({ color: P.body, roughness: 0.84 }), dark: new THREE.MeshStandardMaterial({ color: P.dark, roughness: 0.92 }), glass: new THREE.MeshStandardMaterial({ color: P.glass, roughness: 0.35 }) };
    const g = new THREE.Group(), B = mats.body, D = mats.dark, G = mats.glass;
    let wheels, wr, wz, len, height;
    if (kind.startsWith("semi")) {
      g.add(part(rbox(11.8, 0.34, 1.5, 0.08), D, 0.4, 0.88, 0));
      g.add(part(rbox(2.3, 2.5, 2.45, 0.36), B, 4.0, 2.15, 0));
      g.add(part(rbox(1.3, 1.25, 2.35, 0.32), B, 5.8, 1.45, 0));
      g.add(part(rbox(0.08, 0.95, 2.05, 0.03), G, 5.16, 2.72, 0));
      g.add(part(rbox(0.22, 0.9, 2.1, 0.06), D, 6.46, 1.35, 0));
      if (kind === "semi-flatbed") {
        g.add(part(rbox(8.6, 0.34, 2.5, 0.08), B, -2.0, 1.3, 0));
        g.add(part(rbox(2.4, 1.3, 2.2, 0.14), B, -4.6, 2.12, 0));
        g.add(part(rbox(2.4, 1.0, 2.2, 0.14), B, -1.8, 1.97, 0));
        g.add(part(rbox(1.6, 1.5, 2.1, 0.14), B, 0.6, 2.22, 0));
        height = 3.4;
      } else {
        g.add(part(rbox(8.6, 2.9, 2.55, 0.18), B, -2.0, 2.6, 0));
        for (let k = 0; k < 5; k++) g.add(part(rbox(0.06, 2.7, 2.6, 0.02), D, -5.6 + k * 1.8, 2.6, 0));
        if (kind === "semi-reefer") g.add(part(rbox(0.42, 1.3, 1.9, 0.12), D, 2.5, 2.95, 0));
        height = 4.05;
      }
      wheels = [5.6, 3.6, 2.7, -4.7, -5.6]; wr = 0.52; wz = 1.02; len = 12.8;
    } else if (kind === "box") {
      g.add(part(rbox(7.6, 0.3, 1.4, 0.06), D, 0.3, 0.75, 0));
      g.add(part(rbox(2.0, 2.2, 2.2, 0.34), B, 2.55, 1.85, 0));
      g.add(part(rbox(0.9, 1.05, 2.1, 0.28), B, 3.95, 1.25, 0));
      g.add(part(rbox(0.08, 0.85, 1.85, 0.03), G, 3.56, 2.35, 0));
      g.add(part(rbox(5.4, 2.85, 2.4, 0.2), B, -1.3, 2.47, 0));
      wheels = [3.5, -2.3, -3.2]; wr = 0.48; wz = 0.98; len = 8.4; height = 3.9;
    } else {
      g.add(part(rbox(4.6, 2.25, 2.05, 0.42), B, -0.5, 1.55, 0));
      g.add(part(rbox(1.3, 1.15, 1.95, 0.36), B, 2.1, 1.0, 0));
      g.add(part(rbox(1.05, 0.08, 1.78, 0.03), G, 1.78, 1.95, 0, -0.62));
      g.add(part(rbox(0.12, 0.45, 1.6, 0.05), D, 2.76, 0.9, 0));
      wheels = [1.9, -2.0]; wr = 0.42; wz = 0.92; len = 5.6; height = 2.7;
    }
    wheels.forEach((x) => [wz, -wz].forEach((z) => { g.add(part(wheel(wr, 0.36), D, x, wr, z)); g.add(part(wheel(wr * 0.5, 0.4), B, x, wr, z)); }));
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(len, height, 2.8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
    proxy.position.set(0, height / 2, 0);
    g.add(proxy);
    const v = { group: g, mats, kind, len, height, proxy, tint: "none" };
    vehicles.push(v);
    return v;
  }
  const tint = (v, state) => {
    v.tint = state;
    const c = state === "sel" ? P.sel : state === "red" ? P.late : [P.body, P.dark, P.glass];
    v.mats.body.color.copy(c[0]); v.mats.dark.color.copy(c[1]); v.mats.glass.color.copy(c[2]);
  };

  const gridPt = (i, j) => new THREE.Vector3(i * GRID, 0, j * GRID);
  // Round the corners of right-angle paths with radius 1.5
  function buildCurve(g) {
    const pts = g.map(([i, j]) => gridPt(i, j)), path = new THREE.CurvePath(), R = 1.5;
    let cur = pts[0].clone();
    for (let k = 1; k < pts.length; k++) {
      const c = pts[k];
      if (k < pts.length - 1) {
        const n = pts[k + 1], a = c.clone().add(cur.clone().sub(c).normalize().multiplyScalar(R)), b = c.clone().add(n.clone().sub(c).normalize().multiplyScalar(R));
        path.add(new THREE.LineCurve3(cur, a));
        path.add(new THREE.QuadraticBezierCurve3(a, c.clone(), b));
        cur = b;
      } else path.add(new THREE.LineCurve3(cur, c.clone()));
    }
    return path;
  }
  // Path tube: passed parts faint, remaining parts a 1.6 unit dash flowing at 2.2 units per second, delay sections in red. The path is drawn at first with uReveal
  function routeMaterial(s) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uProg: { value: s.p }, uTime: { value: 0 }, uLen: { value: s.len }, uReveal: { value: 0 }, uD0: { value: s.delay ? s.delay.u0 : -1 }, uD1: { value: s.delay ? s.delay.u1 : -1 },
        uTrav: { value: P.trav.clone() }, uRemain: { value: P.remain.clone() }, uDelay: { value: P.delay.clone() }, uAlpha: { value: 0.9 }, uFlow: { value: reduce() ? 0 : 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `varying vec2 vUv;
        uniform float uProg, uTime, uLen, uReveal, uD0, uD1, uAlpha, uFlow;
        uniform vec3 uTrav, uRemain, uDelay;
        void main(){
          float u = vUv.x;
          if (u > uReveal) discard;
          bool ahead = u >= uProg;
          vec3 c = ahead ? uRemain : uTrav;
          float a = uAlpha;
          if (ahead && u >= uD0 && u <= uD1) c = uDelay;
          if (ahead) { float dash = fract((u * uLen - uTime * 2.2 * uFlow) / 1.6); a *= mix(0.45, 1.0, step(0.42, dash)); }
          else a *= 0.75;
          gl_FragColor = vec4(c, a);
        }`,
    });
  }
  function buildRoute(s, idx) {
    const seg = Math.max(160, Math.round(s.len * 5)), mat = routeMaterial(s);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(s.curve, seg, 0.14, 8, false), mat);
    tube.position.y = 0.2 + idx * 0.006; tube.renderOrder = 4;
    const halo = new THREE.Mesh(new THREE.TubeGeometry(s.curve, seg, 0.3, 8, false), new THREE.MeshBasicMaterial({ color: P.ink, transparent: true, opacity: 0.34, depthWrite: false }));
    halo.position.y = 0.16; halo.renderOrder = 3; halo.visible = false;
    const truck = makeVehicle(s.model);
    truck.group.scale.setScalar(0.26);
    truck.proxy.scale.set(1.6, 2.2, 2.2);
    truck.proxy.userData.pick = { type: "ship", id: s.id };
    pickNet.push(truck.proxy);
    net.add(tube, halo, truck.group);
    s.g3 = { tube, halo, mat, truck };
  }

  function initGL() {
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); }
    catch (e) { $("#glOff").hidden = false; canvas.style.display = "none"; return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 1, 600);
    hemi = new THREE.HemisphereLight(0xffffff, P.hemiGround, 0.78);
    sun = new THREE.DirectionalLight(0xffffff, 0.72);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -46, right: 46, top: 46, bottom: -46, near: 1, far: 160 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    scene.add(hemi, sun, sun.target);
    M.ground = new THREE.MeshStandardMaterial({ color: P.ground, roughness: 1 });
    M.block = new THREE.MeshStandardMaterial({ color: P.block, roughness: 0.9 });
    M.plate = new THREE.MeshStandardMaterial({ color: P.plate, roughness: 1 });
    M.wall = new THREE.MeshStandardMaterial({ color: P.block, roughness: 0.9 });
    M.stall = new THREE.MeshBasicMaterial({ color: P.stall });
    M.pad = new THREE.MeshStandardMaterial({ color: P.pad, roughness: 0.8 });
    M.pin = new THREE.MeshStandardMaterial({ color: P.ink, roughness: 0.6 });
    M.ring = new THREE.MeshBasicMaterial({ color: P.ink, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
    scene.background = P.bg.clone();
    scene.fog = new THREE.Fog(P.bg.clone(), 110, 260);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), M.ground);
    ground.rotation.x = -Math.PI / 2; ground.position.x = 70; ground.receiveShadow = true;
    scene.add(ground);
    net = new THREE.Group(); yardG = new THREE.Group(); yardG.position.copy(YO);
    scene.add(net, yardG);
    buildCity(); buildHubs(); buildYard();
    return true;
  }
  // 10×10 blocks: one cell is whole, two halves, or four pieces, one per column is left empty as a park, and the center (within 15) sometimes gets a tall building
  function buildCity() {
    const R = rng(7), size = GRID - 1.9, list = [];
    const plates = new THREE.InstancedMesh(rbox(1, 1, 1, 0.12), M.plate, 100);
    plates.receiveShadow = true;
    const dm = new THREE.Object3D();
    let pi = 0;
    for (let bi = -5; bi < 5; bi++) for (let bj = -5; bj < 5; bj++) {
      const cx = (bi + 0.5) * GRID, cz = (bj + 0.5) * GRID;
      dm.position.set(cx, 0.06, cz); dm.scale.set(size + 0.5, 0.12, size + 0.5); dm.updateMatrix();
      plates.setMatrixAt(pi++, dm.matrix);
      const dist = Math.hypot(cx, cz);
      if (R() < 0.1) continue;
      const sp = R();
      const cells = sp < 0.35 ? [[0, 0, 1, 1]] : sp < 0.7 ? [[-0.25, 0, 0.5, 1], [0.25, 0, 0.5, 1]] : [[-0.25, -0.25, 0.5, 0.5], [0.25, -0.25, 0.5, 0.5], [-0.25, 0.25, 0.5, 0.5], [0.25, 0.25, 0.5, 0.5]];
      cells.forEach(([ox, oz, sw, sd]) => {
        if (cells.length > 1 && R() < 0.18) return;
        const tall = dist < 15 && R() < 0.16;
        const h = tall ? 2.4 + R() * 1.8 : 0.45 + Math.pow(R(), 1.8) * 1.5;
        list.push({ x: cx + ox * size, z: cz + oz * size, w: size * sw - 0.5, d: size * sd - 0.5, h, delay: dist / 42 + R() * 0.12 });
      });
    }
    const geo = rbox(1, 1, 1, 0.1).clone();
    geo.translate(0, 0.5, 0);
    blocks = new THREE.InstancedMesh(geo, M.block, list.length);
    blocks.castShadow = true; blocks.receiveShadow = true;
    blockData = list;
    setBlocks(reduce() ? 1 : 0);
    net.add(plates, blocks);
  }
  const dmB = new THREE.Object3D();
  // Blocks rise from the center outward by distance, .55 long each (1 − (1 − t)³)
  function setBlocks(k) {
    blockData.forEach((b, i) => {
      const l = clamp((k * 1.55 - b.delay) / 0.55, 0, 1), e = 1 - Math.pow(1 - l, 3);
      dmB.position.set(b.x, 0.12, b.z); dmB.scale.set(b.w, Math.max(0.001, b.h * e), b.d); dmB.updateMatrix();
      blocks.setMatrixAt(i, dmB.matrix);
    });
    blocks.instanceMatrix.needsUpdate = true;
  }
  function buildHubs() {
    const ringGeo = new THREE.RingGeometry(1.05, 1.3, 48);
    Object.entries(HUBS).forEach(([k, h]) => {
      const p = gridPt(...h.g);
      const pad = part(new THREE.CylinderGeometry(1.15, 1.15, 0.16, 40), M.pad, p.x, 0.08, p.z);
      const pin = part(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 10), M.pin, p.x, 1.3, p.z);
      const cap = part(new THREE.SphereGeometry(0.28, 20, 14), M.pin, p.x, 2.65, p.z);
      const ring = new THREE.Mesh(ringGeo, M.ring.clone());
      ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, 0.18, p.z);
      cap.userData.pick = pad.userData.pick = { type: "hub", id: k };
      pickNet.push(cap, pad);
      net.add(pad, pin, cap, ring);
      hubs.push({ k, ring, pos: new THREE.Vector3(p.x, 3.3, p.z) });
    });
  }
  // Parking lot: one slab with bay rows and cones, a car parked in each bay
  function buildYard() {
    const plate = part(rbox(64, 0.24, 34, 0.4), M.plate, 0, 0.12, 0);
    plate.castShadow = false;
    yardG.add(plate);
    for (let x = -12; x <= 28; x += 3.2) { const d = part(new THREE.BoxGeometry(1.6, 0.02, 0.16), M.stall, x, 0.25, -0.4); d.castShadow = false; yardG.add(d); }
    [[-9, -0.8], [5.5, -0.6], [17, -0.4], [26, 13]].forEach(([x, z]) => { yardG.add(part(new THREE.ConeGeometry(0.34, 0.95, 18), M.wall, x, 0.72, z)); });
    yardG.add(part(rbox(10, 5, 7, 0.3), M.wall, -26, 2.6, 11));
    S.yard.forEach((v) => {
      const ry = v.slot[1] < 0 ? Math.PI / 2 : -Math.PI / 2;
      const L = v.model.startsWith("semi") ? 14 : 10, W = 3.6;
      const st = new THREE.Group();
      st.position.set(v.slot[0], 0.25, v.slot[1]); st.rotation.y = ry;
      [W / 2, -W / 2].forEach((z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.02, 0.14), M.stall); m.position.z = z; st.add(m); });
      yardG.add(st);
      const veh = makeVehicle(v.model);
      veh.group.position.set(v.slot[0], 0.24, v.slot[1]); veh.group.rotation.y = ry;
      veh.group.scale.setScalar(0.62);
      veh.proxy.userData.pick = { type: "veh", id: v.id };
      pickYard.push(veh.proxy);
      yardG.add(veh.group);
      v.g3 = veh;
      veh.height *= 0.62;
    });
  }
  function applyTheme() {
    if (!GL) return;
    P = palette();
    scene.background.copy(P.bg); scene.fog.color.copy(P.bg);
    hemi.groundColor.copy(P.hemiGround);
    M.ground.color.copy(P.ground); M.block.color.copy(P.block); M.plate.color.copy(P.plate); M.wall.color.copy(P.block);
    M.stall.color.copy(P.stall); M.pad.color.copy(P.pad); M.pin.color.copy(P.ink);
    hubs.forEach((h) => h.ring.material.color.copy(P.ink));
    S.ships.forEach((s) => { if (!s.g3) return; s.g3.mat.uniforms.uTrav.value.copy(P.trav); s.g3.mat.uniforms.uDelay.value.copy(P.delay); s.g3.halo.material.color.copy(P.ink); });
    vehicles.forEach((v) => tint(v, v.tint));
  }

  /* ---------- Camera: spherical coordinates orbiting the target. The view is nudged so the gap between panels becomes the center of the map ---------- */
  const VIEWS3D = {
    live: { t: [0, 0, 1.5], r: 86, pol: 0.8, az: -0.42 },
    yard: { t: [140, 0, -1], r: 64, pol: 0.92, az: -0.5 },
    loads: { t: null, r: 54, pol: 0.9, az: -0.64 },
    auto: { t: [0, 0, 0], r: 104, pol: 0.6, az: -0.12 },
  };
  const rig = { tx: 0, tz: 1.5, r: 150, pol: 0.35, az: -0.9, uAz: 0, uPol: 0, zoom: 1, fx: 0, fz: 0, ox: 0, oy: 0, oxT: 0, oyT: 0 };
  let camTween = null;
  const yardById = (id) => S.yard.find((v) => v.id === id);
  const shipById = (id) => S.ships.find((s) => s.id === id);
  const viewTarget = (view) => {
    if (view === "loads") { const y = yardById(S.selVeh); return [YO.x + y.slot[0], 0, YO.z + y.slot[1]]; }
    return VIEWS3D[view].t;
  };
  // When flying far (over 60) it backs off by 46 for 1.9s then settles, and when close 1.15s — both power3.inOut
  function goCam(view, instant) {
    if (!GL) return;
    const v = VIEWS3D[view], t = viewTarget(view);
    const st = { tx: rig.tx, tz: rig.tz, r: rig.r, pol: rig.pol, az: rig.az, uAz: rig.uAz, uPol: rig.uPol, zoom: rig.zoom };
    const far = Math.hypot(t[0] - rig.tx, t[2] - rig.tz) > 60;
    const set = (k) => {
      rig.tx = lerp(st.tx, t[0], k); rig.tz = lerp(st.tz, t[2], k);
      rig.r = lerp(st.r, v.r, k) + (far ? Math.sin(k * Math.PI) * 46 : 0);
      rig.pol = lerp(st.pol, v.pol, k) - (far ? Math.sin(k * Math.PI) * 0.2 : 0);
      rig.az = lerp(st.az, v.az, k); rig.uAz = lerp(st.uAz, 0, k); rig.uPol = lerp(st.uPol, 0, k); rig.zoom = lerp(st.zoom, 1, k);
    };
    camTween && camTween.kill();
    if (instant || reduce()) { set(1); return; }
    const o = { k: 0 };
    camTween = gsap.to(o, { k: 1, duration: far ? 1.9 : 1.15, ease: "power3.inOut", onUpdate: () => set(o.k) });
  }
  function offsets() {
    if (mobile()) { rig.oxT = 0; rig.oyT = 0; return; }
    const side = parseFloat(getComputedStyle(document.body).getPropertyValue("--side")) || 364, rail = 76, gap = 18;
    const sheetH = S.collapsed ? 64 : $("#sheet").offsetHeight;
    rig.oxT = (side + gap - (rail + gap)) / 2;
    rig.oyT = (sheetH + gap) / 2 - 20;
  }
  function resize() {
    if (!GL) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    offsets();
    camera.updateProjectionMatrix();
  }

  /* ---------- Drag to spin · wheel pull · pick ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let drag = null, hover = null;
  const pickAt = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const list = S.view === "live" || S.view === "auto" ? pickNet : pickYard;
    const hit = ray.intersectObjects(list, false)[0];
    return hit ? hit.object.userData.pick : null;
  };
  function bindPointer() {
    canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, az: rig.uAz, pol: rig.uPol, moved: false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; canvas.classList.add("is-grab"); }
        rig.uAz = clamp(drag.az - dx * 0.005, -0.9, 0.9);
        rig.uPol = clamp(drag.pol - dy * 0.003, -0.3, 0.22);
        return;
      }
      hover = pickAt(e);
      canvas.classList.toggle("is-point", !!hover);
    });
    const end = (e) => {
      if (!drag) return;
      canvas.classList.remove("is-grab");
      if (!drag.moved) { const p = pickAt(e); if (p) onPick(p); }
      drag = null;
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", () => { drag = null; canvas.classList.remove("is-grab"); });
    canvas.addEventListener("pointerleave", () => { hover = null; canvas.classList.remove("is-point"); });
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); rig.zoom = clamp(rig.zoom * Math.exp(e.deltaY * 0.0012), 0.6, 1.4); }, { passive: false });
  }
  function onPick(p) {
    if (p.type === "ship") { if (S.view !== "live") setView("live"); selectShip(p.id); }
    else if (p.type === "veh") { if (yardById(p.id).status !== "dispatched") selectVeh(p.id); }
    else if (p.type === "hub") {
      if (p.id === "base") setView("yard");
      else { const n = S.ships.filter((s) => s.to === p.id).length, o = S.ships.filter((s) => s.from === p.id).length; toast({ icon: "pin", title: HUBS[p.id].name, body: `Car arriving now ${n} · Departing Car ${o}` }); }
    }
  }

  /* ---------- Map labels: hub name, chosen vehicle, late vehicle ---------- */
  const labelsEl = $("#labels"), tags = new Map(), vt = new THREE.Vector3();
  const tag = (key, cls) => { let t = tags.get(key); if (!t) { t = document.createElement("div"); labelsEl.appendChild(t); tags.set(key, t); } t._cls = `ct-tag ${cls}`; return t; };
  const show = (t, on) => { const c = t._cls + (on ? " is-on" : ""); if (t.className !== c) t.className = c; };
  const place = (t, world) => {
    vt.copy(world).project(camera);
    const vis = vt.z < 1 && Math.abs(vt.x) < 1.1 && Math.abs(vt.y) < 1.1, w = stage.clientWidth, h = stage.clientHeight;
    t.style.transform = `translate(${((vt.x + 1) / 2 * w).toFixed(1)}px,${((1 - vt.y) / 2 * h).toFixed(1)}px) translate(-50%,-100%)`;
    return vis;
  };
  function updateLabels() {
    const used = new Set(), netOn = S.view === "live" || S.view === "auto", yardOn = S.view === "yard" || S.view === "loads";
    if (netOn) {
      hubs.forEach((h) => { const t = tag(`hub-${h.k}`, "is-hub"); if (!t.textContent) t.textContent = HUBS[h.k].name; show(t, place(t, h.pos)); used.add(`hub-${h.k}`); });
      S.ships.forEach((s) => {
        if (!s.g3) return;
        const sel = s.id === S.selShip, late = lateMin(s) >= 5, hov = hover && hover.type === "ship" && hover.id === s.id;
        if (!sel && !late && !hov) return;
        const key = `ship-${s.id}`, t = tag(key, sel ? "is-volt" : late ? "is-red" : "");
        const txt = s.state === "delivered" ? `${s.id}  Arrival` : late ? `${s.id}  ${lateMin(s)}Minutes late` : `${s.id}  Arrival ${fmtT(eta(s))}`;
        if (t.textContent !== txt) t.textContent = txt;
        vt.copy(s.g3.truck.group.position); vt.y += 1.8;
        show(t, place(t, vt.clone())); used.add(key);
      });
    }
    if (yardOn) {
      S.yard.forEach((v) => {
        const sel = v.id === S.selVeh, rep = v.status === "repair", hov = hover && hover.type === "veh" && hover.id === v.id;
        if (!sel && !rep && !hov) return;
        const key = `veh-${v.id}`, t = tag(key, sel ? "is-volt" : rep ? "is-red" : "");
        const html = sel ? `<span class="ct-dot">${ic("check", "")}</span>Pus` : rep ? `<span class="ct-dot">${ic("alert", "")}</span>Under repair` : `${v.name} ${v.id}`;
        if (t._h !== html) { t.innerHTML = html; t._h = html; }
        show(t, place(t, new THREE.Vector3(v.slot[0], v.g3.height + 1.1 + v.g3.group.position.y, v.slot[1]).add(YO))); used.add(key);
      });
    }
    tags.forEach((t, k) => { if (!used.has(k)) show(t, false); });
  }

  /* ---------- Simulated run ---------- */
  const extra = (s) => { if (!s.delay || s.state !== "moving") return 0; const rem = Math.max(0, s.delay.u1 - Math.max(s.p, s.delay.u0)); return rem * s.trip * (1 / SLOW - 1); };
  const remainingMin = (s) => (s.state === "delivered" ? 0 : (1 - s.p) * s.trip + extra(s));
  const eta = (s) => S.simNow + remainingMin(s) * 60000;
  const lateMin = (s) => (s.state === "delivered" ? 0 : Math.round(s.lost + extra(s)));
  const status = (s) => {
    if (s.state === "delivered") return ["Arrival", "is-ok"];
    const l = lateMin(s);
    return l >= 5 ? [`${l}Minutes late`, "is-alert"] : remainingMin(s) <= 15 ? ["Arriving soon", "is-volt"] : ["On time", "is-ok"];
  };
  const manhattan = (a, b) => { const p = [a]; if (a[0] !== b[0]) p.push([b[0], a[1]]); if (a[1] !== b[1]) p.push([b[0], b[1]]); return p; };
  const viaName = (path) => { const m = path[Math.floor(path.length / 2)]; return STREETS[(m[0] + m[1] + 11) % STREETS.length]; };
  function addShipment(d) {
    const s = Object.assign({ state: "moving", lost: 0, notified: false, pop: 1, hold: 0 }, d);
    s.curve = buildCurve(s.path); s.len = s.curve.getLength(); s.via = viaName(s.path);
    s.departAt = S.simNow - s.p * s.trip * 60000;
    if (s.delay && s.p > s.delay.u0) s.lost = (Math.min(s.p, s.delay.u1) - s.delay.u0) * s.trip * (1 / SLOW - 1);
    S.ships.push(s);
    if (GL) buildRoute(s, S.ships.length - 1);
    return s;
  }
  function sim(dt) {
    const simMin = (dt * S.speed) / 60;
    S.simNow += dt * 1000 * S.speed;
    S.ships.forEach((s) => {
      if (s.state === "moving") {
        let f = 1;
        if (s.delay && s.p >= s.delay.u0 && s.p <= s.delay.u1) { f = SLOW; s.lost += simMin * (1 - SLOW); }
        s.p = Math.min(1, s.p + (simMin * f) / s.trip);
        const r = rule("late");
        if (S.autoReady && r.on && !s.notified && lateMin(s) >= r.thr) { s.notified = true; s.notifiedAt = S.simNow; fire("late", `${s.customer} New arrival time at ${fmtT(eta(s))} Sent by text message`, s.id); }
        if (s.p >= 1) { s.state = "delivered"; s.hold = 5; arrive(s); }
      } else if (s.state === "delivered") {
        s.hold -= dt;
        if (s.hold <= 0) {
          Object.assign(s, { state: "moving", p: 0, lost: 0, notified: false, departAt: S.simNow, pop: 0 });
          if (!reduce()) gsap.to(s, { pop: 1, duration: 0.6, ease: "back.out(2)" }); else s.pop = 1;
        }
      }
    });
  }
  function arrive(s) {
    if (rule("hub").on) fire("hub", `${HUBS[s.to].name} To hub team ${s.id} Send the unloading checklist`, s.id, true);
    if (rule("pod").on) fire("pod", `${DRIVERS[s.driver].name} To ${s.id} Requested proof of acquisition`, s.id, true);
  }
  function fire(id, text, ship, quiet) {
    rule(id).runs++;
    S.log.unshift({ t: S.simNow, rule: id, text, ship, fresh: true });
    S.log = S.log.slice(0, 40);
    S.unread++;
    renderLog(); renderRules(); updateBell();
    if (!quiet || S.view === "auto") toast({ icon: "bolt", title: "Processed automatically", body: text, action: ship ? { label: "View", fn: () => { setView("live"); selectShip(ship); } } : null });
    if (S.selShip === ship && S.view === "live" && S.side === "detail") renderDetail();
  }

  /* ---------- Per frame ---------- */
  let last = performance.now(), introK = reduce() ? 1 : 0, uiAcc = 0, pingAcc = 0, introDone = false;
  function updateTrucks(t) {
    S.ships.forEach((s) => {
      if (!s.g3) return;
      const { truck, mat, halo } = s.g3, sel = s.id === S.selShip;
      const pos = s.curve.getPointAt(clamp(s.p, 0, 1)), tan = s.curve.getTangentAt(clamp(s.p, 0.0001, 0.9999));
      truck.group.position.set(pos.x, 0, pos.z);
      truck.group.rotation.y = Math.atan2(-tan.z, tan.x);
      const appear = clamp((introK - 0.55) / 0.3, 0, 1) * s.pop;
      truck.group.scale.setScalar(0.26 * Math.max(0.001, appear) * (sel ? 1.15 : 1));
      const want = sel ? "sel" : lateMin(s) >= 5 ? "red" : "none";
      if (truck.tint !== want) tint(truck, want);
      const u = mat.uniforms;
      u.uProg.value = s.p; u.uTime.value = t; u.uReveal.value = clamp(introK * 1.5 - 0.35, 0, 1) * 1.001;
      u.uRemain.value.copy(sel ? P.acc : P.remain); u.uAlpha.value = sel ? 1 : 0.78;
      halo.visible = sel && introK > 0.6;
    });
    S.yard.forEach((v) => {
      const g = v.g3;
      if (!g) return;
      const sel = v.id === S.selVeh, hov = hover && hover.type === "veh" && hover.id === v.id;
      const want = sel ? "sel" : v.status === "repair" ? "red" : "none";
      if (g.tint !== want) tint(g, want);
      g.group.position.y = lerp(g.group.position.y, hov && !sel ? 0.59 : 0.24, 0.15);
      g.group.visible = v.status !== "dispatched";
    });
  }
  // The target is pulled 30% toward the chosen car (22·15% for the garage), and the view is pushed into the gaps between boards — followed with 1 − .02^dt
  function updateRig(dt) {
    let fx = 0, fz = 0;
    if (S.view === "live") { const s = shipById(S.selShip); if (s && s.g3) { const p = s.g3.truck.group.position; fx = p.x * 0.3; fz = p.z * 0.3; } }
    else if (S.view === "yard") { const v = yardById(S.selVeh); if (v) { fx = v.slot[0] * 0.22; fz = v.slot[1] * 0.15; } }
    const k = 1 - Math.pow(0.02, dt);
    rig.fx = lerp(rig.fx, fx, k); rig.fz = lerp(rig.fz, fz, k); rig.ox = lerp(rig.ox, rig.oxT, k); rig.oy = lerp(rig.oy, rig.oyT, k);
    const boost = camera.aspect < 1.1 ? 1.45 : 1;
    const R = rig.r * rig.zoom * boost, pol = clamp(rig.pol + rig.uPol, 0.25, 1.25), az = rig.az + rig.uAz, tx = rig.tx + rig.fx, tz = rig.tz + rig.fz;
    camera.position.set(tx + R * Math.sin(pol) * Math.sin(az), R * Math.cos(pol), tz + R * Math.sin(pol) * Math.cos(az));
    camera.lookAt(tx, 0, tz);
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.setViewOffset(w, h, rig.ox, rig.oy, w, h);
    camera.updateProjectionMatrix();
    sun.position.set(tx + 26, 52, tz + 20); sun.target.position.set(tx, 0, tz); sun.target.updateMatrixWorld();
  }
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    sim(dt);
    if (GL) {
      if (!introDone) { setBlocks(introK); if (introK >= 1) introDone = true; }
      updateTrucks(t);
      hubs.forEach((h, i) => {
        if (reduce()) { h.ring.scale.setScalar(1.3); h.ring.material.opacity = 0.22; return; }
        const ph = (t * 0.45 + i * 0.21) % 1;
        h.ring.scale.setScalar(1 + ph * 2.2);
        h.ring.material.opacity = 0.42 * (1 - ph) * clamp(introK * 2 - 1, 0, 1);
      });
      updateRig(dt);
      renderer.render(scene, camera);
      updateLabels();
    }
    uiAcc += dt; if (uiAcc > 0.25) { uiAcc = 0; uiTick(); }
    pingAcc += dt;
    if (pingAcc > 4) { pingAcc = 0; S.lastPing = now; const d = $("#liveDot"); d.classList.remove("is-ping"); void d.offsetWidth; d.classList.add("is-ping"); }
    requestAnimationFrame(frame);
  }

  /* ---------- Panels ---------- */
  const TITLES = { live: "Live Map", yard: "Depot Yard", loads: "New Load", auto: "Automations" };
  const SHEETS = { live: "Deliveries in transit", yard: "Garage vehicles", loads: "New Load Assignment", auto: "Auto Rules" };
  const FILTERS = { live: [["all", "Entire"], ["late", "Delay"], ["soon", "Arriving soon"]], yard: [["all", "Entire"], ["available", "Ready to use"], ["service", "Maintenance · Repair"]], loads: [], auto: [] };
  function kpis() {
    const moving = S.ships.filter((s) => s.state === "moving"), late = moving.filter((s) => lateMin(s) >= 5).length, soon = moving.filter((s) => remainingMin(s) <= 15).length;
    const today = RULES.reduce((a, r) => a + r.runs, 0);
    const html = `<div class="ct-kpi ct-panel"><b>${moving.length}</b>In service</div><div class="ct-kpi ct-panel ${late ? "is-alert" : ""}"><b>${late}</b>Running late</div><div class="ct-kpi ct-panel"><b>${soon}</b>Arrive within 15 min</div><div class="ct-kpi ct-panel"><b>${today}</b>Automated Today</div>`;
    const el = $("#kpis");
    if (el._h !== html) { el.innerHTML = html; el._h = html; }
  }
  function uiTick() {
    $("#fleetClock").textContent = fmtT(S.simNow);
    const ago = Math.round((performance.now() - S.lastPing) / 1000);
    $("#updated").textContent = ago < 2 ? "Location Just Updated" : `${ago}Update position from seconds before`;
    if (S.view === "live") { updateShipLive(); kpis(); if (S.side === "detail") updateDetailLive(); }
  }
  const filteredShips = () => S.ships.filter((s) => S.shipFilter === "all" || (S.shipFilter === "late" ? lateMin(s) >= 5 : s.state === "moving" && remainingMin(s) <= 15));
  function renderShipCards() {
    const list = filteredShips();
    $("#shipCards").innerHTML = list.length ? list.map((s) => `
      <article class="ct-card ${s.id === S.selShip ? "is-sel" : ""}" data-ship="${s.id}">
        <button class="ct-card__hit" type="button" data-act="sel-ship" data-id="${s.id}" aria-pressed="${s.id === S.selShip}"><span class="ct-sr">${s.id} View on map</span></button>
        <div class="ct-card__top"><div><h3>${s.id}</h3><p class="ct-muted">${esc(s.customer)}</p></div><span class="ct-chip" data-status></span></div>
        <div class="ct-route"><i></i><span>${HUBS[s.from].name}</span><i class="is-to"></i><span>${HUBS[s.to].name}</span></div>
        <div class="ct-prog" data-prog><div class="ct-prog__track"><div class="ct-prog__fill"></div></div><div class="ct-prog__run"><span class="ct-prog__truck">${ic("truck", "")}</span></div></div>
        <div class="ct-card__foot"><div><span class="ct-k">Estimated arrival</span><strong class="ct-big" data-eta></strong></div><div class="ct-r"><span class="ct-k">Time Left</span><strong data-left></strong></div></div>
      </article>`).join("") : '<p class="ct-empty">No deliveries match this filter right now.</p>';
    updateShipLive();
  }
  function updateShipLive() {
    $$("#shipCards [data-ship]").forEach((card) => {
      const s = shipById(card.dataset.ship);
      if (!s) return;
      const [lbl, cls] = status(s), chip = card.querySelector("[data-status]");
      if (chip.textContent !== lbl) { chip.textContent = lbl; chip.className = `ct-chip ${cls}`; }
      card.classList.toggle("is-late", lateMin(s) >= 5);
      card.querySelector("[data-prog]").style.setProperty("--p", s.p.toFixed(4));
      card.querySelector("[data-eta]").textContent = s.state === "delivered" ? "Footer" : fmtT(eta(s));
      card.querySelector("[data-left]").textContent = s.state === "delivered" ? "Arrival" : fmtMin(remainingMin(s));
    });
  }
  function selectShip(id, fromUser = true) {
    S.selShip = id; S.side = "detail";
    $$("#shipCards .ct-card").forEach((c) => { const on = c.dataset.ship === id; c.classList.toggle("is-sel", on); c.querySelector(".ct-card__hit").setAttribute("aria-pressed", on); });
    const c = $(`#shipCards [data-ship="${id}"]`);
    if (c && fromUser) c.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest", inline: "nearest" });
    if (S.view === "live") { renderDetail(); showPane("detail"); }
  }
  function renderDetail() {
    const el = $("#paneDetail");
    if (S.view === "yard" || S.view === "loads") return renderVehDetail();
    const s = shipById(S.selShip);
    if (!s) { el.innerHTML = ""; return; }
    const d = DRIVERS[s.driver];
    el.innerHTML = `
      <div class="ct-ph"><div class="is-grow"><h2>${s.id}</h2><p>${esc(s.customer)}</p></div><span class="ct-chip" data-d-status></span></div>
      <div class="ct-pane__scroll">
        <div class="ct-eta"><div><span class="ct-k">Estimated arrival</span><strong data-d-eta></strong></div><div class="ct-r" data-d-left></div></div>
        <div data-d-insight></div>
        <ol class="ct-stops" data-d-stops></ol>
        <dl class="ct-facts"><dt>Cargo</dt><dd>${esc(s.cargo)}</dd><dt>Vehicle</dt><dd>${s.vname} ${s.vehicle}</dd><dt>Route</dt><dd>${s.via} Diesel</dd></dl>
      </div>
      <div class="ct-pane__foot">
        <div class="ct-drv"><div class="ct-ava is-sm">${initials(d.name)}<span class="ct-st ${d.online ? "" : "is-off"}"></span></div><div class="is-grow"><b>${d.name}</b><small>${d.online ? "Connecting" : "Not connected, replies by text"}</small></div><button class="ct-btn" type="button" data-act="chat" data-driver="${d.key}">${ic("send")}Message</button></div>
        <button class="ct-btn is-lg" type="button" data-act="share" data-id="${s.id}">${esc(s.customer)} Copy tracking link to</button>
      </div>`;
    el._ship = s.id;
    updateDetailLive(true);
  }
  function updateDetailLive() {
    const s = shipById(S.selShip), el = $("#paneDetail");
    if (!s || el._ship !== s.id) return;
    const [lbl, cls] = status(s), chip = el.querySelector("[data-d-status]");
    chip.textContent = lbl; chip.className = `ct-chip ${cls}`;
    el.querySelector("[data-d-eta]").textContent = s.state === "delivered" ? "Arrival" : fmtT(eta(s));
    el.querySelector("[data-d-left]").innerHTML = s.state === "delivered" ? "Waiting for the next load" : `${fmtMin(remainingMin(s))} Left over<br>${Math.round((1 - s.p) * s.len * 0.85 * 10) / 10} km`;
    const late = lateMin(s), r = rule("late");
    let ins = "";
    if (late >= 5) {
      const auto = s.notified ? `${ic("check")}<span>${esc(s.customer)} At ${fmtT(s.notifiedAt)} A new time was sent to this.</span>`
        : r.on ? `${ic("bolt")}<span>${r.thr}Late by over min: ${esc(s.customer)} A text message is sent automatically to</span>`
        : `${ic("bolt")}<span>Delay text is turned off.</span>`;
      ins = `<div class="ct-insight"><h3>Over plan ${late}Minutes late</h3><p>${s.delay ? `${s.delay.where} Of ${s.delay.why} Because of this, it is running at 1/3 of its usual speed.` : "We are moving more slowly than planned."} Originally arriving by ${fmtT(s.departAt + s.trip * 60000)}.</p><div class="ct-auto">${auto}</div></div>`;
    }
    const insEl = el.querySelector("[data-d-insight]");
    if (insEl._h !== ins) { insEl.innerHTML = ins; insEl._h = ins; }
    const stops = [
      { n: "Loss of voice", w: HUBS[s.from].name, t: fmtT(s.departAt), done: true },
      { n: `${s.via} Past`, w: "Stopover", t: fmtT(s.departAt + (0.5 * s.trip + (s.p > 0.5 ? s.lost : 0)) * 60000), done: s.p >= 0.5 },
      { n: "Shipping", w: HUBS[s.to].name, t: s.state === "delivered" ? "Footer" : fmtT(eta(s)), done: s.state === "delivered" },
    ];
    const nowI = stops.findIndex((x) => !x.done);
    const sh = stops.map((x, i) => `<li class="${x.done ? "is-done" : ""} ${i === nowI ? "is-now" : ""}"><span class="ct-pt"></span><div><b>${esc(x.n)}</b><small>${esc(x.w)}</small></div><time>${x.t}</time></li>`).join("");
    const st = el.querySelector("[data-d-stops]");
    if (st._h !== sh) { st.innerHTML = sh; st._h = sh; }
  }

  // Garage vehicle card — image is a separate shot of the same 3D car
  const THUMBS = {};
  function makeThumbs() {
    let tr;
    try { tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return; }
    tr.setPixelRatio(1); tr.setSize(480, 250); tr.shadowMap.enabled = true; tr.shadowMap.type = THREE.PCFSoftShadowMap;
    const ts = new THREE.Scene();
    ts.add(new THREE.HemisphereLight(0xffffff, P.hemiGround, 0.8));
    const dl = new THREE.DirectionalLight(0xffffff, 0.7);
    dl.position.set(8, 16, 10); dl.castShadow = true; dl.shadow.mapSize.set(1024, 1024);
    Object.assign(dl.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
    ts.add(dl);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.18 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    ts.add(floor);
    const cam = new THREE.PerspectiveCamera(22, 480 / 250, 0.5, 200);
    ["semi-dry", "semi-reefer", "semi-flatbed", "box", "van"].forEach((k) => {
      const v = makeVehicle(k);
      vehicles.pop();
      v.mats.body.color.copy(mix(P.body, P.ink, 0.06)); v.mats.dark.color.copy(mix(P.dark, P.ink, 0.1));
      ts.add(v.group);
      cam.position.set(v.len * 0.45, v.len * 0.3 + 1.5, v.len * 1.25);
      cam.lookAt(0, v.height * 0.42, 0);
      tr.render(ts, cam);
      THUMBS[k] = tr.domElement.toDataURL("image/png");
      ts.remove(v.group);
    });
    tr.dispose();
    tr.forceContextLoss && tr.forceContextLoss();
  }
  const filteredYard = () => S.yard.filter((v) => v.status !== "dispatched" && (S.vehFilter === "all" || (S.vehFilter === "available" ? v.status === "available" : v.status === "service" || v.status === "repair")));
  function renderVehCards() {
    $("#vehCards").innerHTML = filteredYard().map((v) => {
      const [lbl, cls] = VSTATUS[v.status];
      return `<article class="ct-card ct-vcard ${v.id === S.selVeh ? "is-sel" : ""}" data-veh="${v.id}">
        <button class="ct-card__hit" type="button" data-act="sel-veh" data-id="${v.id}"><span class="ct-sr">${v.id} Choosing</span></button>
        <div class="ct-card__top"><div><h3>${v.name} ${v.id}</h3><p>${v.loc}</p></div><span class="ct-chip ${cls}">${lbl}</span></div>
        <div class="ct-thumb">${THUMBS[v.model] ? `<img src="${THUMBS[v.model]}" alt="">` : ""}</div>
        <dl class="ct-specs"><dt>Loading</dt><dd>${v.cap}</dd><dt>Maintenance</dt><dd>${v.serviced}</dd><dt>Article</dt><dd>${DRIVERS[v.driver].name}</dd></dl>
        <div class="ct-vacts"><button class="ct-btn is-grow" type="button" data-act="assign" data-id="${v.id}">Assign to this car</button><button class="ct-btn" type="button" data-act="repair" data-id="${v.id}" aria-label="Repair Indicator">${ic("wrench")}</button></div>
      </article>`;
    }).join("");
  }
  function selectVeh(id) {
    S.selVeh = id;
    $$("#vehCards .ct-card").forEach((c) => c.classList.toggle("is-sel", c.dataset.veh === id));
    $(`#vehCards [data-veh="${id}"]`)?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest", inline: "nearest" });
    if (S.view === "loads") { $("#fVeh").value = id; summary(); goCam("loads"); }
    renderVehDetail();
  }
  function renderVehDetail() {
    const v = yardById(S.selVeh), el = $("#paneDetail");
    if (!v) return;
    const [lbl, cls] = VSTATUS[v.status], d = DRIVERS[v.driver];
    el._ship = null;
    el.innerHTML = `<div class="ct-ph"><div class="is-grow"><h2>${v.name} ${v.id}</h2><p>${v.loc}</p></div><span class="ct-chip ${cls}">${lbl}</span></div>
      <div class="ct-pane__scroll"><div class="ct-thumb" style="height:150px">${THUMBS[v.model] ? `<img src="${THUMBS[v.model]}" alt="">` : ""}</div>
        <dl class="ct-facts"><dt>Loading</dt><dd>${v.cap}</dd><dt>Final tune-up</dt><dd>${v.serviced}</dd><dt>Location</dt><dd>${v.loc}</dd></dl></div>
      <div class="ct-pane__foot"><div class="ct-drv"><div class="ct-ava is-sm">${initials(d.name)}<span class="ct-st ${d.online ? "" : "is-off"}"></span></div><div class="is-grow"><b>${d.name}</b><small>${d.online ? "Connecting" : "Not connected"}</small></div><button class="ct-btn" type="button" data-act="chat" data-driver="${d.key}">${ic("send")}Message</button></div>
        <button class="ct-btn is-lg is-primary" type="button" data-act="assign" data-id="${v.id}">Assign luggage to this car</button></div>`;
  }
  function toggleRepair(id) {
    const v = yardById(id);
    v.status = v.status === "repair" ? "available" : "repair";
    if (v.status === "repair" && rule("repair").on) fire("repair", `${v.id} Moves its next load to the next empty vehicle`, null);
    renderVehCards(); renderVehDetail();
  }

  // Auto rule
  function renderRules() {
    $("#ruleCards").innerHTML = RULES.map((r) => `
      <article class="ct-card ct-rule ${r.on ? "" : "is-off"}" data-rule="${r.id}">
        <div class="ct-rule__top"><span class="ct-chip ${r.on ? "is-ok" : ""}">${r.on ? "On" : "Off"}</span><button class="ct-switch" type="button" role="switch" aria-checked="${r.on}" data-act="rule" data-id="${r.id}" aria-label="${RULE_NAME[r.id]} Turn on and off"></button></div>
        <p class="ct-when">In cases like this</p>
        <p class="ct-txt">${r.when}${r.thr != null ? ` <span class="ct-stepper"><button type="button" data-act="thr" data-d="-5" aria-label="Cut 5 min">${ic("minus", "ct-i is-s")}</button><output>${r.thr}</output><button type="button" data-act="thr" data-d="5" aria-label="Add 5 min">${ic("plus", "ct-i is-s")}</button></span> ${r.tail}` : ""}</p>
        <div class="ct-then"><b>Like this</b>${r.then}</div>
        <p class="ct-runs">Today ${r.runs}Handled No.</p>
      </article>`).join("");
    sheetMeta();
  }
  function renderLog() {
    const li = (e) => `<li class="${e.fresh ? "is-new" : ""}"><div class="ct-lh"><span>${RULE_NAME[e.rule]}</span><time>${fmtT(e.t)}</time></div>${esc(e.text)}</li>`;
    $("#logList").innerHTML = S.log.map(li).join("");
    $("#bellList").innerHTML = S.log.slice(0, 4).map(li).join("") || '<li>None yet</li>';
    S.log.forEach((e) => { e.fresh = false; });
  }
  function updateBell() {
    const b = $("#bellBadge");
    b.hidden = !S.unread;
    b.textContent = S.unread;
  }

  // Dialogue
  function openChat(k) {
    S.side = "chat"; S.chat = k;
    const d = DRIVERS[k];
    if (!S.chats[k]) S.chats[k] = [{ me: false, text: "On my way. I’ll let you know when I arrive.", t: S.simNow - 9 * 60000 }, { me: true, text: "Sounds good. Please tell us right away if you get stuck.", t: S.simNow - 7 * 60000 }];
    $("#paneChat").innerHTML = `<div class="ct-ph"><button class="ct-icon-btn" type="button" data-act="chat-back" aria-label="Back">${ic("back", "ct-i")}</button><div class="ct-ava is-sm">${initials(d.name)}<span class="ct-st ${d.online ? "" : "is-off"}"></span></div><div class="is-grow"><h2>${d.name}</h2><p>${d.online ? "Connecting" : "Replies by text"}</p></div></div>
      <div class="ct-msgs" id="msgs">${S.chats[k].map(msg).join("")}</div>
      <form class="ct-composer" id="composer"><input id="msgIn" autocomplete="off" placeholder="Write a message" aria-label="Message"><button class="ct-qa" type="submit" aria-label="Send">${ic("send", "ct-i")}</button></form>`;
    showPane("chat");
    const box = $("#msgs");
    box.scrollTop = box.scrollHeight;
  }
  const msg = (m) => `<div class="ct-msg ${m.me ? "is-me" : "is-them"}"><div class="ct-bub">${esc(m.text)}</div><time>${fmtT(m.t)}</time></div>`;
  function pushMsg(m) {
    S.chats[S.chat].push(m);
    const box = $("#msgs");
    if (!box) return;
    box.insertAdjacentHTML("beforeend", msg(m));
    if (!reduce()) gsap.from(box.lastElementChild, { y: 10, opacity: 0, duration: 0.3, ease: "power3.out" });
    box.scrollTop = box.scrollHeight;
  }
  function showPane(p) {
    $("#paneDetail").hidden = p !== "detail";
    $("#paneChat").hidden = p !== "chat";
    $("#paneLog").hidden = p !== "log";
  }

  // Luggage allocation
  S.files = [{ name: "file_name_01.pdf", size: 120, done: 20, state: "up" }, { name: "file_name_02.pdf", size: 94, done: 94, state: "done" }];
  function renderFiles() {
    $("#files").innerHTML = S.files.map((f, i) => `<div class="ct-file"><span class="ct-file__doc"><b>PDF</b></span><div style="min-width:0"><p class="ct-file__name">${esc(f.name)}</p><p class="ct-file__meta">${f.state === "done" ? `<span class="is-ok">${ic("check")}</span>${f.size} KB · Upload` : `<span class="ct-spin">${ic("clip")}</span>${f.done} / ${f.size} KB`}</p></div><button class="ct-icon-btn" type="button" data-act="rm-file" data-i="${i}" aria-label="Erase">${ic("trash")}</button>${f.state === "done" ? "" : `<span class="ct-file__bar"><i style="--p:${(f.done / f.size).toFixed(3)}"></i></span>`}</div>`).join("");
  }
  function fillSelects() {
    const hubOpts = Object.entries(HUBS).map(([k, h]) => `<option value="${k}">${h.name}</option>`).join("");
    $("#fFrom").innerHTML = hubOpts; $("#fTo").innerHTML = hubOpts;
    $("#fFrom").value = "base"; $("#fTo").value = "harbor";
    $("#fVeh").innerHTML = S.yard.filter((v) => v.status !== "dispatched").map((v) => `<option value="${v.id}">${v.name} ${v.id}</option>`).join("");
    $("#fVeh").value = S.selVeh;
  }
  function summary() { $("#assignSummary").innerHTML = `<b>${$("#fVeh").selectedOptions[0]?.textContent || ""}</b> This ${HUBS[$("#fFrom").value].name} From ${HUBS[$("#fTo").value].name} Toward`; }

  function sheetMeta() {
    const m = { live: `${S.ships.filter((s) => s.state === "moving").length}Cases in operation`, yard: `${filteredYard().length}Large`, loads: "", auto: `${RULES.filter((r) => r.on).length}Items on` };
    $("#sheetMeta").textContent = m[S.view] || "";
  }
  function renderTools() {
    const key = S.view === "yard" ? "vehFilter" : "shipFilter";
    $("#tools").innerHTML = FILTERS[S.view].map(([k, t]) => `<button type="button" data-act="filter" data-k="${k}" aria-pressed="${S[key] === k}">${t}</button>`).join("");
    $("#tools").hidden = !FILTERS[S.view].length;
  }
  function setView(v) {
    if (S.view === v) return;
    S.view = v;
    document.body.dataset.view = v;
    $("#viewTitle").textContent = TITLES[v];
    $("#sheetTitle").textContent = SHEETS[v];
    $$(".ct-rail__btn").forEach((b) => (b.dataset.viewGo === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
    $$(".ct-sec").forEach((s) => s.classList.toggle("is-on", s.dataset.for === v));
    $("#bellPop").hidden = true;
    renderTools();
    if (v === "live") { renderShipCards(); S.side = "detail"; renderDetail(); showPane("detail"); }
    else if (v === "yard") { renderVehCards(); renderVehDetail(); showPane("detail"); }
    else if (v === "loads") { fillSelects(); summary(); renderVehDetail(); showPane("detail"); }
    else { renderRules(); S.unread = 0; updateBell(); renderLog(); showPane("log"); }
    sheetMeta();
    requestAnimationFrame(() => { offsets(); });
    goCam(v);
  }

  // Notification — 4.5s
  function toast({ icon, title, body, action }) {
    const t = document.createElement("div");
    t.className = "ct-toast";
    t.innerHTML = `<span class="ct-ti">${ic(icon)}</span><div class="ct-tb"><b>${esc(title)}</b><span>${esc(body)}</span></div>${action ? `<button type="button">${action.label}</button>` : ""}`;
    if (action) t.querySelector("button").addEventListener("click", () => { action.fn(); t.remove(); });
    $("#toasts").appendChild(t);
    if (!reduce()) gsap.from(t, { y: 16, opacity: 0, duration: 0.4, ease: "power3.out" });
    setTimeout(() => { if (reduce()) return t.remove(); gsap.to(t, { opacity: 0, y: 8, duration: 0.3, onComplete: () => t.remove() }); }, 4500);
  }

  /* ---------- Press ---------- */
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-view-go]");
    if (go) return setView(go.dataset.viewGo);
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const a = b.dataset.act;
    if (a === "sel-ship") selectShip(b.dataset.id, false);
    else if (a === "sel-veh") selectVeh(b.dataset.id);
    else if (a === "filter") { if (S.view === "yard") { S.vehFilter = b.dataset.k; renderVehCards(); } else { S.shipFilter = b.dataset.k; renderShipCards(); } renderTools(); sheetMeta(); }
    else if (a === "chat") openChat(b.dataset.driver);
    else if (a === "chat-back") { S.side = "detail"; renderDetail(); showPane("detail"); }
    else if (a === "share") { navigator.clipboard?.writeText(`${location.href.split("#")[0]}#${b.dataset.id}`).catch(() => {}); toast({ icon: "link", title: "Link copied", body: `${b.dataset.id} Tracking Link` }); }
    else if (a === "assign") { S.selVeh = b.dataset.id; setView("loads"); selectVeh(b.dataset.id); }
    else if (a === "repair") toggleRepair(b.dataset.id);
    else if (a === "rule") { const r = rule(b.dataset.id); r.on = !r.on; renderRules(); }
    else if (a === "thr") { const r = rule("late"); r.thr = clamp(r.thr + +b.dataset.d, 5, 60); renderRules(); }
    else if (a === "rm-file") { S.files.splice(+b.dataset.i, 1); renderFiles(); }
  });
  $("#handle").addEventListener("click", () => {
    S.collapsed = !S.collapsed;
    $("#sheet").classList.toggle("is-collapsed", S.collapsed);
    $("#handle").setAttribute("aria-expanded", String(!S.collapsed));
    offsets();
  });
  $$("[data-speed]").forEach((b) => b.addEventListener("click", () => { S.speed = +b.dataset.speed; $$("[data-speed]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
  $("#bellBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const p = $("#bellPop");
    p.hidden = !p.hidden;
    $("#bellBtn").setAttribute("aria-expanded", String(!p.hidden));
    if (!p.hidden) { S.unread = 0; updateBell(); }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id === "composer") {
      e.preventDefault();
      const i = $("#msgIn"), text = i.value.trim();
      if (!text) return;
      i.value = "";
      pushMsg({ me: true, text, t: S.simNow });
      setTimeout(() => pushMsg({ me: false, text: "Confirmed.", t: S.simNow }), 1200);
    } else if (e.target.id === "loadForm") {
      e.preventDefault();
      const from = $("#fFrom").value, to = $("#fTo").value, veh = yardById($("#fVeh").value);
      $$(".ct-field").forEach((f) => f.classList.remove("is-err"));
      if (from === to) { $("#fTo").closest(".ct-field").classList.add("is-err"); return; }
      const s = addShipment({ id: `SH-0${S.nextShip++}`, customer: $("#fCust").value || "Customer", from, to, path: manhattan(HUBS[from].g, HUBS[to].g), driver: veh.driver, vehicle: veh.id, model: veh.model, vname: veh.name, cargo: "New luggage", trip: 40, p: 0 });
      s.pop = 0;
      if (!reduce()) gsap.to(s, { pop: 1, duration: 0.6, ease: "back.out(2)" }); else s.pop = 1;
      veh.status = "dispatched";
      toast({ icon: "check", title: "Luggage assigned", body: `${s.id} · ${veh.id}` });
      setView("live");
      selectShip(s.id);
    }
  });
  ["fFrom", "fTo", "fVeh"].forEach((id) => $(`#${id}`).addEventListener("change", () => { if (id === "fVeh") selectVeh($("#fVeh").value); summary(); }));
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((n) => drop.addEventListener(n, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((n) => drop.addEventListener(n, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
  drop.addEventListener("drop", (e) => { [...(e.dataTransfer?.files || [])].forEach((f) => S.files.push({ name: f.name, size: Math.max(1, Math.round(f.size / 1024)), done: 0, state: "up" })); renderFiles(); });
  $("#fileIn").addEventListener("change", (e) => { [...e.target.files].forEach((f) => S.files.push({ name: f.name, size: Math.max(1, Math.round(f.size / 1024)), done: 0, state: "up" })); renderFiles(); });
  setInterval(() => {
    let ch = false;
    S.files.forEach((f) => { if (f.state === "up") { f.done = Math.min(f.size, f.done + Math.ceil(f.size / 25)); if (f.done >= f.size) f.state = "done"; ch = true; } });
    if (ch && S.view === "loads") renderFiles();
  }, 400);

  // Search: / to focus, up and down to select, Enter
  const si = $("#search"), res = $("#results");
  let hits = [], hi = 0;
  const doSearch = (q) => {
    q = q.trim().toLowerCase();
    if (!q) { res.hidden = true; si.setAttribute("aria-expanded", "false"); return; }
    hits = [
      ...S.ships.filter((s) => `${s.id} ${s.customer}`.toLowerCase().includes(q)).map((s) => ({ t: s.id, s: s.customer, go: () => { setView("live"); selectShip(s.id); } })),
      ...S.yard.filter((v) => `${v.id} ${v.name}`.toLowerCase().includes(q)).map((v) => ({ t: v.id, s: v.name, go: () => { setView("yard"); selectVeh(v.id); } })),
      ...Object.values(DRIVERS).filter((d) => d.name.toLowerCase().includes(q)).map((d) => ({ t: d.name, s: "Article", go: () => openChat(d.key) })),
    ].slice(0, 8);
    hi = 0;
    res.innerHTML = hits.length ? hits.map((h, i) => `<button type="button" data-hit="${i}" class="${i === 0 ? "is-hi" : ""}"><span>${esc(h.t)}</span><span class="ct-rs">${esc(h.s)}</span></button>`).join("") : '<p class="ct-empty">No matching results</p>';
    res.hidden = false;
    si.setAttribute("aria-expanded", "true");
  };
  const pickHit = (i) => { const h = hits[i]; if (!h) return; h.go(); si.value = ""; doSearch(""); si.blur(); };
  si.addEventListener("input", () => doSearch(si.value));
  si.addEventListener("blur", () => setTimeout(() => doSearch(""), 150));
  res.addEventListener("mousedown", (e) => { const b = e.target.closest("[data-hit]"); if (b) { e.preventDefault(); pickHit(+b.dataset.hit); } });
  si.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!hits.length) return; hi = (hi + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; $$("#results [data-hit]").forEach((b, i) => b.classList.toggle("is-hi", i === hi)); }
    else if (e.key === "Enter") { e.preventDefault(); pickHit(hi); }
    else if (e.key === "Escape") { si.value = ""; doSearch(""); si.blur(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); si.focus(); }
    if (e.key === "Escape") $("#bellPop").hidden = true;
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".ct-bell-wrap")) $("#bellPop").hidden = true; });
  addEventListener("resize", resize);
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);

  /* ---------- Start ---------- */
  P = palette();
  GL = typeof THREE !== "undefined" && initGL();
  SHIP_SEED.forEach((d) => addShipment(Object.assign({}, d)));
  const n0 = S.simNow;
  S.log = [
    { t: n0 - 16 * 60000, rule: "pod", text: "Requested proof of handover for SH-0099 from Driver 05" },
    { t: n0 - 17 * 60000, rule: "hub", text: "Sent the SH-0099 unloading checklist to the Hub Base team" },
    { t: n0 - 38 * 60000, rule: "late", text: `New arrival time for Customer 04 ${fmtT(n0 - 20 * 60000)} Sent by text message` },
    { t: n0 - 64 * 60000, rule: "pod", text: "Requested proof of handover for SH-0098 from Driver 06" },
  ];
  if (GL) { makeThumbs(); bindPointer(); resize(); }
  renderFiles(); renderLog(); updateBell(); kpis();
  $("#fleetClock").textContent = fmtT(S.simNow);
  setView("live");
  document.body.dataset.ready = "1";
  setTimeout(() => { S.autoReady = true; }, 3800);
  if (GL) {
    if (reduce()) { introK = 1; goCam("live", true); }
    else {
      Object.assign(rig, { r: 170, pol: 0.3, az: -1.0 });
      goCam("live");
      const o = { k: 0 };
      gsap.to(o, { k: 1, duration: 2.4, ease: "power2.out", onUpdate: () => { introK = o.k; } });
    }
    // Shaders are baked before the first frame — baking on the first cursor move freezes the screen
    renderer.compile(scene, camera);
  }
  if (!reduce()) {
    gsap.from(".ct-rail", { x: -24, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.9 });
    gsap.from(".ct-top > *", { y: -14, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 1.0 });
    gsap.from(".ct-kpi", { y: -10, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 1.5 });
    gsap.from(".ct-sheet", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", delay: 1.2, clearProps: "transform,opacity" });
    gsap.from(".ct-side", { x: 40, opacity: 0, duration: 0.8, ease: "power3.out", delay: 1.3, clearProps: "transform,opacity" });
  }
  requestAnimationFrame((t) => { last = t; requestAnimationFrame(frame); });
})();
