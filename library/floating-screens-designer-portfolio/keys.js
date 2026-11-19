// Three keycaps — the original draws three rounded cubes in WebGL (three r186 · physics cannon-es 0.20). The header logo and the CONTACT footer use the same keycaps.
// Color is a difference blend layer, so it is painted with white keycaps and black text — on a bright background it appears as dark keycaps with background-colored text, and on a dark skin the opposite.
// Original values: corner .125 · smoothness 6 · logo view x-15.54° y-98.61° z-5.57° · FOV 54° · gap .15 · logo hover one step (90°) .3s power3.inOut gap .08 ·
// Footer: when it reaches 50% of the screen, throws up from below the bottom (depth .25·height .6·aim y.1·spread 1.8·touch .8·rotation 1.5 turns/s·seed 3) ·
// Gravity 30 · bounce .35 · friction .35 · damping .01/.05, on touching the floor .15/.4 · fixed step of 1/120s · when grabbed and dragged it lifts by 1 cell and follows (force 60), and when released it moves at most 40 cells/s.
(() => {
if (!window.THREE || !window.CANNON) return;

const LETTERS = ["A", "B", "C"];
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DEG = Math.PI / 180;

// One text face — the same character on all six faces (so it reads the same while turning)
const faceTexture = (letter, shade) => {
  const n = 256, cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const x = cv.getContext("2d");
  x.fillStyle = css("--site-blend-ink");
  x.fillRect(0, 0, n, n);
  x.globalAlpha = shade;
  x.fillStyle = css("--site-blend-clear");
  x.fillRect(0, 0, n, n);
  x.globalAlpha = 1;
  x.fillStyle = css("--site-blend-clear");
  x.textAlign = "center"; x.textBaseline = "middle";
  x.font = `800 ${Math.round(n * 0.46)}px ${css("--kf-font-display")}`;
  x.fillText(letter, n / 2, n / 2 + n * 0.03);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};
// Side faces are painted slightly darker so the 3D reads (on the blend layer they become slightly lighter ink). Order is +x −x +y −y +z −z
const SHADES = [0, 0.1, 0.06, 0.16, 0.03, 0.1];
// Rounded cube (corner .125 · smoothness 6) — points of a finely divided box are pulled to an inner box, then pushed back out by the radius. The face group (6-face material) stays as the plain box
const roundedBox = (size, radius, smooth) => {
  const g = new THREE.BoxGeometry(size, size, size, smooth * 2, smooth * 2, smooth * 2);
  const pos = g.attributes.position, nor = g.attributes.normal, inner = size / 2 - radius, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(THREE.MathUtils.clamp(v.x, -inner, inner), THREE.MathUtils.clamp(v.y, -inner, inner), THREE.MathUtils.clamp(v.z, -inner, inner));
    const d = v.sub(c);
    if (d.lengthSq() < 1e-12) d.fromBufferAttribute(nor, i);
    d.normalize();
    nor.setXYZ(i, d.x, d.y, d.z);
    pos.setXYZ(i, c.x + d.x * radius, c.y + d.y * radius, c.z + d.z * radius);
  }
  return g;
};
const geometry = roundedBox(1, 0.125, 6);
const cubeMaterials = LETTERS.map((l) => SHADES.map((s) => new THREE.MeshBasicMaterial({ map: faceTexture(l, s) })));
const makeCube = (i) => new THREE.Mesh(geometry, cubeMaterials[i]);

const fit = (renderer, canvas) => {
  const r = canvas.getBoundingClientRect();
  renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
  return r;
};

// ── Header logo ──
function logo(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "logo-gl";
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  host.classList.add("is-gl");
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(54, 1, 0.1, 100);
  const view = new THREE.Euler(-15.54 * DEG, -98.61 * DEG, -5.57 * DEG);
  const cubes = LETTERS.map((_, i) => {
    const pivot = new THREE.Group(), m = makeCube(i);
    m.rotation.copy(view);
    pivot.add(m);
    pivot.position.x = (i - 1) * 1.15;
    scene.add(pivot);
    return { pivot, turn: 0 };
  });
  const draw = () => {
    const r = fit(renderer, canvas);
    cam.aspect = r.width / Math.max(1, r.height);
    // The three-column row (3.3) steps back to fit the logo box width (1/1.5 of the canvas)
    cam.position.z = (3.3 * 1.5) / 2 / Math.tan((cam.fov * DEG) / 2) / cam.aspect;
    cam.updateProjectionMatrix();
    cubes.forEach((c) => (c.pivot.rotation.y = c.turn));
    renderer.render(scene, cam);
  };
  draw();
  addEventListener("resize", draw);
  document.fonts.ready.then(() => { cubeMaterials.flat().forEach((m) => (m.map.needsUpdate = true)); draw(); });
  if (reduce || !matchMedia("(pointer: fine)").matches) return;
  // On entering, one step forward, on leaving, one step back — reset to 0 after a full turn (same letter on every face)
  const turn = (dir) => cubes.forEach((c, i) => {
    const to = dir * 90 * DEG, back = Math.abs(c.turn) > 0.001 && Math.sign(c.turn) !== Math.sign(to), end = back ? 0 : to;
    gsap.to(c, { turn: end, duration: 0.3 * Math.max(0.2, Math.abs(end - c.turn) / (90 * DEG)), ease: "power3.inOut", delay: back ? 0 : i * 0.08, overwrite: true, onUpdate: draw, onComplete: () => { c.turn = 0; draw(); } });
  });
  const hover = document.querySelector(".blend-layer .site-header__logo");
  hover.addEventListener("pointerenter", () => turn(1));
  hover.addEventListener("pointerleave", () => turn(-1));
}

// ── CONTACT footer ──
function footer(stage) {
  const canvas = stage.querySelector(".keycaps");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  const P = { fov: 20, gravity: 30, bounce: 0.35, friction: 0.35, depth: 0.25, height: 0.6, aimX: 0, aimY: 0.1, spread: 1.8, reach: 0.8, spin: 1.5, seed: 3, stagger: 0.12, lift: 1, maxSpeed: 40, at: 0.5 };
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(P.fov, 1, 0.1, 400);
  const meshes = LETTERS.map((_, i) => { const m = makeCube(i); m.visible = false; scene.add(m); return m; });
  let rand = P.seed >>> 0;
  const rnd = () => {
    rand = (rand + 1831565813) >>> 0;
    let e = rand;
    e = Math.imul(e ^ (e >>> 15), e | 1);
    e ^= e + Math.imul(e ^ (e >>> 7), e | 61);
    return ((e ^ (e >>> 14)) >>> 0) / 4294967296;
  };

  const G = { SOLID: 1, ENTRY: 2, CUBE: 4, GROUND: 8 };
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, -P.gravity) });
  world.allowSleep = true;
  world.defaultContactMaterial.friction = P.friction;
  world.defaultContactMaterial.restitution = P.bounce;
  const plane = (x, y, z, rx, ry, group) => {
    const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), collisionFilterGroup: group });
    b.position.set(x, y, z); b.quaternion.setFromEuler(rx, ry, 0); world.addBody(b); return b;
  };
  plane(0, 0, 0, 0, 0, G.GROUND);
  const walls = { left: plane(0, 0, 0, 0, Math.PI / 2, G.SOLID), right: plane(0, 0, 0, 0, -Math.PI / 2, G.SOLID), bottom: plane(0, 0, 0, -Math.PI / 2, 0, G.SOLID), top: plane(0, 0, 0, Math.PI / 2, 0, G.SOLID) };
  const ceiling = plane(0, 0, 0, Math.PI, 0, G.SOLID);
  const REST = 0.5;
  const bodies = LETTERS.map(() => new CANNON.Body({
    mass: 1, shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)), linearDamping: 0.01, angularDamping: 0.05,
    collisionFilterGroup: G.CUBE, collisionFilterMask: G.SOLID | G.CUBE,
  }));
  bodies.forEach((b) => { b.sleepSpeedLimit = 0.12; b.sleepTimeLimit = 0.3; });

  // How many px one floor cell (one keycap side) is on screen — about 140px on the original 1440 screen
  const unitPx = () => 140 * Math.max(1, innerWidth / 1536) * (matchMedia("(max-width: 1023.98px)").matches ? 0.62 : 1);
  const view = { W: 1, H: 1, camZ: 10, bounds: null };
  const layout = () => {
    const r = fit(renderer, canvas), u = unitPx();
    view.W = r.width; view.H = r.height;
    view.camZ = r.height / u / 2 / Math.tan((P.fov * DEG) / 2);
    cam.aspect = r.width / Math.max(1, r.height); cam.position.set(0, 0, view.camZ); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    const hw = r.width / u / 2 - 0.75, hh = r.height / u / 2 - 0.75;
    view.bounds = { minX: -hw, maxX: hw, minY: -hh, maxY: hh };
    walls.left.position.x = -hw; walls.right.position.x = hw; walls.bottom.position.y = -hh; walls.top.position.y = hh;
    ceiling.position.z = REST + (view.camZ - REST) * 0.6;
    bodies.forEach((b) => { b.position.x = THREE.MathUtils.clamp(b.position.x, -hw + 0.5, hw - 0.5); b.position.y = THREE.MathUtils.clamp(b.position.y, -hh + 0.5, hh - 0.5); b.wakeUp(); });
  };

  // Thrown up from deep below the floor, passing over the top (height .6) and landing on the floor — at first it rises up through the floor
  let thrownAt = null;
  const launch = () => {
    const { camZ, bounds } = view, g = P.gravity;
    const top = REST + (camZ - REST) * (P.height / (1 + P.height)), from = camZ - (camZ - REST) / P.depth;
    const vz = Math.sqrt(2 * g * Math.max(0.01, top - from)), flight = vz / g + Math.sqrt((2 * Math.max(0.01, top - REST)) / g);
    const cx = (bounds.minX + bounds.maxX) / 2, cy = (bounds.minY + bounds.maxY) / 2, sx = (bounds.maxX - bounds.minX) / 2, sy = (bounds.maxY - bounds.minY) / 2;
    bodies.forEach((b, i) => {
      const k = i - 1, ax = cx + P.aimX * sx + k * P.spread, ay = cy + P.aimY * sy;
      b.position.set(0, 0, from);
      b.velocity.set((ax / flight) * P.reach, (ay / flight) * P.reach, vz);
      b.quaternion.setFromEuler(rnd() * Math.PI * 2, rnd() * Math.PI * 2, rnd() * Math.PI * 2);
      const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - z * z), w = P.spin * Math.PI * 2;
      b.angularVelocity.set(s * Math.cos(a) * w, s * Math.sin(a) * w, z * w);
      b.added = false; b.landed = false;
    });
  };
  const settleAll = () => bodies.forEach((b, i) => {
    b.position.set((i - 1) * 1.6, 0.2 * (i - 1), REST); b.quaternion.setFromEuler(0, 0, (i - 1) * 0.3);
    b.collisionFilterMask = G.SOLID | G.CUBE | G.GROUND; world.addBody(b); b.added = b.landed = true;
  });

  const advance = (t) => bodies.forEach((b, i) => {
    if (!b.added && t >= i * P.stagger) { world.addBody(b); b.added = true; }
    // It only collides with the floor after punching up through it and starting to come down
    if (!(b.collisionFilterMask & G.GROUND) && b.velocity.z < 0 && b.position.z > REST + 0.25) b.collisionFilterMask |= G.GROUND;
    if (!b.landed && b.collisionFilterMask & G.GROUND && b.position.z < REST + 0.4) { b.landed = true; b.linearDamping = 0.15; b.angularDamping = 0.4; }
  });
  const rescue = () => {
    const B = view.bounds;
    bodies.forEach((b) => {
      if (!b.landed) return;
      if (b.position.z < REST - 1 || b.position.x < B.minX - 1 || b.position.x > B.maxX + 1 || b.position.y < B.minY - 1 || b.position.y > B.maxY + 1) {
        b.position.set(0, 0, REST + 2); b.velocity.set(0, 0, 0); b.angularVelocity.set(0, 0, 0); b.wakeUp();
      }
    });
  };

  // ── Drag ──
  let drag = null, dragged = false;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const onPlane = (x, y, z) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const t = (z - ray.ray.origin.z) / ray.ray.direction.z;
    return t > 0 ? ray.ray.origin.clone().addScaledVector(ray.ray.direction, t) : null;
  };
  const hit = (x, y) => {
    const r = canvas.getBoundingClientRect(), v = new THREE.Vector3();
    let best = null, bestD = Infinity;
    bodies.forEach((b) => {
      if (!b.added) return;
      v.set(b.position.x, b.position.y, b.position.z).project(cam);
      const sx = r.left + ((v.x + 1) / 2) * r.width, sy = r.top + ((1 - v.y) / 2) * r.height;
      const px = r.height / (2 * Math.max(0.01, view.camZ - b.position.z) * Math.tan((P.fov * DEG) / 2));
      const d = Math.hypot(x - sx, y - sy);
      if (d < 0.75 * px && d < bestD) { best = b; bestD = d; }
    });
    return best;
  };
  const grab = (b, x, y) => {
    const z = REST + P.lift, at = onPlane(x, y, b.position.z) || b.position;
    const joint = new CANNON.Body({ mass: 0, collisionFilterGroup: 0, collisionFilterMask: 0 });
    joint.position.set(at.x, at.y, z);
    world.addBody(joint);
    const c = new CANNON.PointToPointConstraint(b, b.pointToLocalFrame(new CANNON.Vec3(at.x, at.y, at.z)), joint, new CANNON.Vec3(), 60);
    world.addConstraint(c);
    b.wakeUp();
    drag = { b, joint, c, z };
  };
  const release = () => {
    if (!drag) return;
    world.removeConstraint(drag.c); world.removeBody(drag.joint);
    const v = drag.b.velocity.length();
    if (v > P.maxSpeed) drag.b.velocity.scale(P.maxSpeed / v, drag.b.velocity);
    drag = null;
  };
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const foot = stage.closest("footer");
  foot.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !live) return;
    const b = hit(e.clientX, e.clientY);
    if (!b) return;
    e.preventDefault(); dragged = true; grab(b, e.clientX, e.clientY); foot.style.cursor = "grabbing";
  });
  addEventListener("pointermove", (e) => {
    if (drag) {
      const p = onPlane(e.clientX, e.clientY, drag.z);
      if (p) { const B = view.bounds; drag.joint.position.set(THREE.MathUtils.clamp(p.x, B.minX, B.maxX), THREE.MathUtils.clamp(p.y, B.minY, B.maxY), drag.z); drag.b.wakeUp(); }
      return;
    }
    if (fine.matches && live) foot.style.cursor = hit(e.clientX, e.clientY) ? "grab" : "";
  }, { passive: true });
  const up = () => { if (!drag) return; release(); foot.style.cursor = fine.matches ? "grab" : ""; setTimeout(() => (dragged = false)); };
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
  foot.addEventListener("click", (e) => { if (dragged) { dragged = false; e.preventDefault(); e.stopPropagation(); } }, true);

  let live = false, carry = 0, last = 0, visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);
  new ResizeObserver(layout).observe(stage);
  layout();
  const render = () => {
    bodies.forEach((b, i) => {
      meshes[i].visible = b.added;
      meshes[i].position.set(b.position.x, b.position.y, b.position.z);
      meshes[i].quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
    });
    renderer.render(scene, cam);
  };
  if (reduce) { settleAll(); live = true; render(); return; }
  gsap.ticker.add((time) => {
    const r = foot.getBoundingClientRect();
    if (thrownAt === null && r.top < innerHeight * P.at && r.bottom > 0) { thrownAt = time; launch(); live = true; last = time; }
    if (!live || !visible) { last = time; return; }
    advance(time - thrownAt);
    carry += Math.min(0.1, time - last);
    last = time;
    let n = 0;
    while (carry >= 1 / 120 && n < 8) { world.step(1 / 120); carry -= 1 / 120; n++; }
    if (n === 8) carry = 0;
    rescue();
    render();
  });
}

const head = document.querySelector(".blend-layer .site-header__logo");
if (head) logo(head);
const stage = document.querySelector(".footer__stage");
if (stage) footer(stage);
})();
