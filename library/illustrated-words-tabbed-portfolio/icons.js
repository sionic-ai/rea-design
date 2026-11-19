// 3D line drawing beside word links — as in the original, white faces on a three orthographic camera (±140 cells) and a shader draws the edge ink lines in screen px.
// There are three scenes: map (a three-panel folding screen), book (when opened, a fused cube rises up) and tool (a window shrinks to a phone and expands as two boards pop out), and,
// Values (spring tension and friction, angle, size, index delay) were measured from the original and carried over. Shaders and shapes were written anew.
// shared.js loads three late, then loads this file and calls it with gIcons.create(canvas, shape).
(() => {
  const T = window.THREE, Spring = window.gSpring;
  const HALF = 140;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const deg = Math.PI / 180;

  // Use the skin’s background and ink on the canvas as is — skins written in oklch or color-mix are painted once on a 2D canvas and read back as sRGB
  function cssColor(name) {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new T.Vector3(r / 255, g / 255, b / 255);
  }

  /* ── Shader Fragment ── */
  // Lines are measured in screen px: how much a pixel d px inside the edge falls within a band of width w, for the center line, how much falls within |d| ≤ w/2.
  const LINE = `
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uLine;
float edgeBand(float d, float w) { return clamp(w + 0.5 - d, 0.0, 1.0) * step(-0.5, d); }
float midLine(float d) { return clamp(0.5 * uLine + 0.5 - abs(d), 0.0, 1.0); }
float pxTo(float v) { return v / max(length(vec2(dFdx(v), dFdy(v))), 1e-6); }`;

  // Box: in cell coordinates (-.5~.5), measure px to the corner along each of the face’s two tangent axes. If a neighboring face is visible, take half a line (the neighbor takes the other half),
  // If a neighbor turns away and shows an outline, it counts as on. Sides touching another object get a half line, and when panels of the same sheet press together and read as one mass there is no line (uSeam 1·2)
  const BOX_VERT = `
varying vec3 vBox;
varying vec3 vNorm;
varying vec3 vFace;
varying vec2 vUv;
void main() {
  vBox = position;
  vNorm = normal;
  vUv = uv;
  vFace = vec3(normalMatrix[0].z, normalMatrix[1].z, normalMatrix[2].z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
  const BOX_INK = `
uniform vec3 uSeamLo;
uniform vec3 uSeamHi;
varying vec3 vBox;
varying vec3 vNorm;
varying vec3 vFace;
float boxInk() {
  vec3 rate = sqrt(dFdx(vBox) * dFdx(vBox) + dFdy(vBox) * dFdy(vBox));
  float ink = 0.0;
  for (int a = 0; a < 3; a++) {
    if (abs(vNorm[a]) > 0.5) continue;
    float side = vBox[a] >= 0.0 ? 1.0 : -1.0;
    float seam = side > 0.0 ? uSeamHi[a] : uSeamLo[a];
    float w = side * vFace[a] > 0.0 ? 0.5 * uLine : uLine;
    w = seam < 1.0 ? mix(w, 0.5 * uLine, seam) : mix(0.5 * uLine, 0.0, seam - 1.0);
    ink = max(ink, edgeBand((0.5 - abs(vBox[a])) / max(rate[a], 1e-6), w));
  }
  return ink;
}`;
  const BOX_FRAG = `${LINE}${BOX_INK}
void main() { gl_FragColor = vec4(mix(uPaper, uInk, boxInk()), 1.0); }`;

  // Map panel: contour lines on the printed side (-x). Paper coordinates continue past the panel, a noise field flows toward +x, and the reveal sweeps from the left
  const MAP_FRAG = `${LINE}${BOX_INK}
uniform float uPanel;
uniform float uTime;
uniform float uWipe;
varying vec2 vUv;
float rnd(vec2 p) { return fract(sin(dot(p, vec2(41.37, 289.13))) * 18337.531); }
vec2 slope(vec2 p) { float a = 6.2831853 * rnd(p); return vec2(cos(a), sin(a)); }
float waves(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = dot(slope(i), f), b = dot(slope(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(slope(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), d = dot(slope(i + 1.0), f - 1.0);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main() {
  vec2 paper = vec2((uPanel + vBox.z + 0.5) * 0.62, (vBox.y + 0.5) * 1.0);
  float level = (waves((paper - vec2(uTime * 0.00018, 0.0)) * 1.45) + 0.7 * paper.y) * 5.0;
  float contour = midLine(abs(fract(level - 0.5) - 0.5) / max(length(vec2(dFdx(level), dFdy(level))), 1e-6));
  vec2 room = min(vBox.zy + 0.5, 0.5 - vBox.zy) * vec2(0.62, 1.0);
  float inMargin = step(0.07, min(room.x, room.y));
  float shown = step(paper.x, uWipe * 1.96);
  float printed = step(vNorm.x, -0.5);
  gl_FragColor = vec4(mix(uPaper, uInk, max(boxInk(), contour * inMargin * shown * printed)), 1.0);
}`;

  // Melted-together cube: marches rays in book space to find a smooth union (smin) of five boxes, and where it belongs to a box, uses the box’s edges,
  // The melted neck draws a line where it turns away (normal perpendicular to the screen) and an edge where it meets the side face, and rays that miss become a half line outside the outline
  const MELT_VERT = `
varying vec3 vLocal;
varying vec3 vRay;
void main() {
  vLocal = position;
  vRay = normalize((inverse(modelViewMatrix) * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
  const MELT_FRAG = `${LINE}
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec4 uCubes[5];
uniform float uMelt;
uniform float uPxView;
uniform vec3 uPageA;
uniform vec3 uPageB;
varying vec3 vLocal;
varying vec3 vRay;
float cubeDist(vec3 p, vec4 c) { vec3 q = abs(p - c.xyz) - vec3(c.w); return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float soft(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float blob(vec3 p) { float d = cubeDist(p, uCubes[0]); for (int i = 1; i < 5; i++) d = soft(d, cubeDist(p, uCubes[i]), uMelt); return d; }
vec2 onScreen(vec3 v) { return (modelViewMatrix * vec4(v, 0.0)).xy / uPxView; }
vec3 gradAt(vec3 p) {
  vec2 e = vec2(0.001, -0.001);
  return normalize(e.xyy * blob(p + e.xyy) + e.yyx * blob(p + e.yyx) + e.yxy * blob(p + e.yxy) + e.xxx * blob(p + e.xxx));
}
void main() {
  vec3 dir = normalize(vRay);
  float t = 0.0, near = 1e3, nearT = 0.0;
  bool hit = false;
  for (int i = 0; i < 80; i++) {
    float d = blob(vLocal + dir * t);
    if (d < near) { near = d; nearT = t; }
    if (d < 1e-4) { hit = true; break; }
    t += d;
    if (t > 3.0) break;
  }
  float pxUnit = length(onScreen(vec3(1.0, 0.0, 0.0)));
  vec3 at = vLocal + dir * (hit ? t : nearT);
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(at, 1.0);
  gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;
  // Derivatives are taken outside the branch — even if each ray hits or misses differently, they are measured together with neighboring pixels
  vec3 n = gradAt(at);
  float facing = dot(n, -dir);
  float turnPx = pxTo(abs(facing));
  float above = min(dot(at, uPageA), dot(at, uPageB));
  float abovePx = pxTo(above);
  if (!hit) {
    float fringe = clamp(0.5 * uLine + 0.5 - near * pxUnit, 0.0, 1.0);
    if (fringe <= 0.0) discard;
    gl_FragColor = vec4(uInk, fringe);
    return;
  }
  float surface = blob(at), owned = 0.0, ink = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 c = uCubes[i];
    float own = 1.0 - smoothstep(0.0, 0.3 / pxUnit, cubeDist(at, c) - surface);
    if (own <= 0.0) continue;
    owned = max(owned, own);
    vec3 gap = c.w - abs(at - c.xyz);
    int f = gap.x < gap.y ? (gap.x < gap.z ? 0 : 2) : (gap.y < gap.z ? 1 : 2);
    for (int k = 0; k < 3; k++) {
      if (k == f) continue;
      vec3 ek = vec3(0.0), eu = vec3(0.0);
      ek[k] = 1.0;
      eu[3 - f - k] = 1.0;
      vec2 sk = onScreen(ek), su = onScreen(eu);
      float px = gap[k] * abs(sk.x * su.y - sk.y * su.x) / max(length(su), 1e-6);
      ink = max(ink, own * edgeBand(px, 0.5 * uLine));
    }
  }
  ink = max(ink, (1.0 - owned) * edgeBand(turnPx, 0.5 * uLine));
  ink = max(ink, edgeBand(abovePx, uLine));
  gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
}`;

  // Window·phone panel: a vertex shader stretches and shrinks a rounded rectangle with uHalf·uRadius. The front and back caps are rounded-rectangle outlines,
  // The side wall is where the rim meeting the lid and the rounded corner turn around. On the screen side (-x), a window title bar or a phone island · home bar
  const SLAB_VERT = `
uniform vec2 uHalf;
uniform float uRadius;
uniform float uDepth;
attribute vec2 aCorner;
attribute vec2 aDir;
attribute float aSide;
attribute float aWall;
varying vec3 vP;
varying vec3 vN;
varying float vWall;
void main() {
  vec2 p = aCorner * (uHalf - uRadius) + aDir * uRadius;
  vP = vec3(aSide * uDepth * 0.5, p.y, p.x);
  vN = aWall > 0.5 ? vec3(0.0, aDir.y, aDir.x) : vec3(aSide, 0.0, 0.0);
  vWall = aWall;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vP, 1.0);
}`;
  const SLAB_FRAG = `${LINE}
uniform mat3 normalMatrix;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uDepth;
uniform float uTitle;
uniform float uDesktop;
varying vec3 vP;
varying vec3 vN;
varying float vWall;
float roundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float faces(vec3 n) { return (normalMatrix * n).z; }
void main() {
  vec2 p = vP.zy;
  // Values that derivatives rely on are measured outside the branch
  float outline = pxTo(-roundBox(p, uHalf, uRadius));
  float rim = pxTo(uDepth * 0.5 - abs(vP.x));
  float turn = faces(normalize(vN));
  float turnRate = length(vec2(dFdx(turn), dFdy(turn)));
  float title = pxTo(p.y - (uHalf.y - uTitle));
  float island = pxTo(roundBox(p - vec2(0.0, uHalf.y - 0.075), vec2(0.07, 0.02), 0.02));
  float homeBar = pxTo(length(vec2(max(abs(p.x) - 0.08, 0.0), p.y + uHalf.y - 0.065)));
  float ink;
  if (vWall > 0.5) {
    float capSeen = faces(vec3(sign(vP.x), 0.0, 0.0));
    ink = edgeBand(rim, capSeen > 0.0 ? 0.5 * uLine : uLine);
    if (turnRate > 1e-6) ink = max(ink, edgeBand(abs(turn) / turnRate, uLine));
    ink = max(ink, uDesktop * midLine(title));
  } else {
    vec2 q = abs(p) - uHalf + uRadius;
    vec2 out2 = sign(p) * (min(q.x, q.y) > 0.0 ? normalize(q) : (q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0)));
    ink = edgeBand(outline, faces(vec3(0.0, out2.y, out2.x)) > 0.0 ? 0.5 * uLine : uLine);
    if (vP.x < 0.0) {
      ink = max(ink, uDesktop * midLine(title));
      ink = max(ink, (1.0 - uDesktop) * max(midLine(island), midLine(homeBar)));
    }
  }
  gl_FragColor = vec4(mix(uPaper, uInk, ink), 1.0);
}`;

  /* ── Stage: orthographic ±140, pivot tilted to π/4 · π/4 for an isometric-like view ── */
  function stage(canvas) {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    const camera = new T.OrthographicCamera(-HALF, HALF, HALF, -HALF, 1, 1000);
    camera.position.z = 500;
    const scene = new T.Scene();
    const pivot = new T.Group();
    pivot.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    scene.add(pivot);
    const shared = { uPaper: { value: cssColor("--kf-bg") }, uInk: { value: cssColor("--kf-ink") }, uLine: { value: 1 }, uPxView: { value: 1 } };
    const owned = [];
    const keep = (x) => (owned.push(x), x);
    const unit = keep(new T.BoxGeometry(1, 1, 1));
    const material = (fragmentShader, uniforms = {}, extra = {}) => keep(new T.ShaderMaterial({
      vertexShader: BOX_VERT, fragmentShader, ...extra,
      uniforms: { ...shared, uSeamLo: { value: new T.Vector3() }, uSeamHi: { value: new T.Vector3() }, ...uniforms },
    }));
    const sizes = () => {
      shared.uLine.value = renderer.getPixelRatio();
      shared.uPxView.value = (2 * HALF) / (camera.zoom * (canvas.width || 2 * HALF));
    };
    return {
      pivot, shared, keep, material,
      inked: () => material(BOX_FRAG),
      box(size, at = [0, 0, 0], mat) {
        const m = new T.Mesh(unit, mat || material(BOX_FRAG));
        m.scale.set(...size);
        m.position.set(...at);
        return m;
      },
      zoom(z) { if (camera.zoom !== z) { camera.zoom = z; camera.updateProjectionMatrix(); sizes(); } },
      resize() { renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); sizes(); },
      render() { renderer.render(scene, camera); },
      warm() { renderer.compileAsync(scene, camera).catch(() => {}); },
      dispose() { for (const x of owned) x.dispose(); renderer.dispose(); renderer.forceContextLoss(); },
    };
  }

  /* ── Book: at rest a lying book, on hover it stands up on a shelf (300/35) and opens (14°·166°), and five cubes rise from the spine gap 90ms apart (300/19) ── */
  const PAGE = [0.82, 0.08, 0.66];
  const CUBES = [
    { half: 0.125, bob: 1.3, phase: 0, order: 3 },
    { half: 0.105, bob: 1.7, phase: 2, order: 2 },
    { half: 0.088, bob: 1.5, phase: 4, order: 4 },
    { half: 0.075, bob: 1.9, phase: 1, order: 0 },
    { half: 0.062, bob: 1.4, phase: 3, order: 1 },
  ];
  // After rising, it swaps position on a 7s loop (1s each of sine.inOut at .8, 2.4, 3.8 and 5.4s) — the last position is the first, so it connects seamlessly
  const HOME = [[-0.21, 0.33, -0.18], [-0.07, 0.34, 0.19], [0.3, 0.34, 0.17], [-0.03, 0.67, -0.1], [0.25, 0.67, -0.1]];
  const MOVES = [
    [0.8, [[-0.2, 0.34, -0.12], [0.1, 0.71, -0.1], [0.27, 0.34, 0.14], [-0.19, 0.53, -0.12], [0.26, 0.48, 0.14]]],
    [2.4, [[-0.08, 0.38, -0.04], [0.08, 0.4, 0.06], [0.16, 0.34, -0.06], [-0.04, 0.56, 0.02], [0.1, 0.56, -0.02]]],
    [3.8, [[-0.18, 0.35, -0.08], [0, 0.37, 0.04], [0.3, 0.36, 0.17], [-0.06, 0.66, -0.04], [0.06, 0.66, 0.02]]],
    [5.4, HOME],
  ];
  function book(st) {
    const holder = new T.Group();
    st.pivot.add(holder);
    const mats = [st.inked(), st.inked()];
    const leaves = mats.map((m, i) => new T.Group().add(st.box(PAGE, [0, (i ? 1 : -1) * PAGE[1] / 2, PAGE[2] / 2], m)));
    holder.add(...leaves);
    const proxy = st.keep(new T.BoxGeometry(1.02, 0.98, 0.72));
    proxy.translate(0, 0.47, 0);
    const cubes = CUBES.map(() => new T.Vector4());
    const melt = st.keep(new T.ShaderMaterial({
      vertexShader: MELT_VERT, fragmentShader: MELT_FRAG, transparent: true,
      uniforms: { ...st.shared, uCubes: { value: cubes }, uMelt: { value: 0.1 }, uPageA: { value: new T.Vector3(0, 1, 0) }, uPageB: { value: new T.Vector3(0, -1, 0) } },
    }));
    const blob = new T.Mesh(proxy, melt);
    holder.add(blob);
    const loopPos = HOME.map(([x, y, z]) => ({ x, y, z }));
    const loop = gsap.timeline({ paused: true, defaults: { duration: 1, ease: "sine.inOut" } });
    for (const [at, list] of MOVES) list.forEach(([x, y, z], i) => loop.to(loopPos[i], { x, y, z }, at));
    const stand = new Spring(0, { tension: 300, friction: 35 }), open = new Spring(0, { tension: 300, friction: 35 });
    const rise = CUBES.map(() => new Spring(0, { tension: 300, friction: 19 }));
    let held = 0, clock = 0;
    return {
      frame(dt, { lit, reduced }) {
        const anyUp = rise.some((s) => s.value > 0.1);
        const openTo = (lit && stand.value > 0.9) || (anyUp && open.target === 1) ? 1 : 0;
        const standTo = lit || (open.value > 0.05 && stand.target === 1) ? 1 : 0;
        if (open.target !== openTo) open.to(openTo);
        if (stand.target !== standTo) stand.to(standTo);
        const rising = lit && open.value > 0.5;
        held = rising ? held + dt : 0;
        rise.forEach((s, i) => { const to = rising && held >= 90 * CUBES[i].order ? 1 : 0; if (s.target !== to) s.to(to); });
        if (reduced) { for (const s of [stand, open, ...rise]) s.set(lit ? 1 : 0); held = lit ? 90 * CUBES.length : 0; }
        let busy = false;
        for (const s of [stand, open, ...rise]) busy = s.advance(dt) || busy;
        const up = Math.max(0, ...rise.map((s) => s.value));
        clock = reduced ? 2100 : up > 0.001 ? clock + dt : 0;
        const sec = clock / 1000, blend = smooth(0, 0.4, sec);
        loop.time(sec % 7);
        const o = clamp01(open.value);
        const [lo0, hi0] = [mats[0].uniforms.uSeamLo.value, mats[0].uniforms.uSeamHi.value];
        const lo1 = mats[1].uniforms.uSeamLo.value;
        lo0.z = lo1.z = o;
        hi0.y = lo1.y = 2 - smooth(0, 0.15, o);
        const base = Math.PI - (Math.PI / 2) * stand.value;
        const a = base - (Math.PI / 2 - 14 * deg) * open.value, b = base + (166 * deg - Math.PI / 2) * open.value;
        leaves[0].rotation.x = -a;
        leaves[1].rotation.x = -b;
        melt.uniforms.uPageA.value.set(0, Math.cos(-a), Math.sin(-a));
        melt.uniforms.uPageB.value.set(0, -Math.cos(-b), -Math.sin(-b));
        st.pivot.scale.setScalar(48 + 12 * o);
        holder.position.set(0, -0.165 * (Math.sin(a) + Math.sin(b)) - 0.15 * up, -0.165 * (Math.cos(a) + Math.cos(b)));
        CUBES.forEach((c, i) => {
          const n = rise[i].value, [hx, hy, hz] = HOME[i], m = loopPos[i];
          const x = hx + (m.x - hx) * blend, z = hz + (m.z - hz) * blend;
          const y = hy + (m.y - hy) * blend + 0.02 * Math.sin((2 * Math.PI * sec) / c.bob + c.phase) * blend;
          cubes[i].set(x, -c.half + (y + c.half) * n, z * n, c.half);
        });
        blob.visible = up > 0.03;
        return busy || (lit && !reduced);
      },
    };
  }

  /* ── Map: three folded panels unfold like a folding screen (28°) and rotate (22°→45°), and near full unfold (.75~1) contour lines sweep out from the left ── */
  const PANEL = [0.05, 1, 0.62];
  function map(st) {
    const holder = new T.Group();
    st.pivot.add(holder);
    st.pivot.scale.setScalar(48);
    const time = { value: 0 }, wipe = { value: 0 };
    const mats = [0, 1, 2].map((i) => st.material(MAP_FRAG, { uPanel: { value: i }, uTime: time, uWipe: wipe }));
    const seams = mats.map((m, i) => {
      const lo = m.uniforms.uSeamLo.value, hi = m.uniforms.uSeamHi.value;
      lo.z = +(i > 0);
      hi.z = +(i < 2);
      return [lo, hi];
    });
    const panels = mats.map((m) => st.box(PANEL, [0, 0, 0], m));
    const shut = st.box([3 * PANEL[0], PANEL[1], PANEL[2]]);
    holder.add(...panels, shut);
    const unfold = new Spring(0);
    const lay = (e) => {
      const turns = [28 * deg * e, Math.PI * (1 - e) - 28 * deg * e, 28 * deg * e];
      const pts = [[0, 0]];
      for (const a of turns) { const [x, z] = pts.at(-1); pts.push([x + PANEL[2] * Math.sin(a), z + PANEL[2] * Math.cos(a)]); }
      const mid = [(pts[0][0] + pts[3][0]) / 2, (pts[0][1] + pts[3][1]) / 2];
      holder.rotation.y = 22 * deg + 23 * deg * e;
      const thick = Math.max(1e-4, PANEL[0] * (1 - smooth(0, 0.5, e)));
      const glue = 2 * (1 - smooth(0, 0.1, e));
      seams[0][1].x = seams[1][0].x = seams[1][1].x = seams[2][0].x = glue;
      panels.forEach((m, i) => {
        const a = turns[i], stack = i * thick * Math.max(0, 1 - e);
        m.scale.x = thick;
        m.position.set(pts[i][0] + (PANEL[2] / 2) * Math.sin(a) + stack - mid[0], 0, pts[i][1] + (PANEL[2] / 2) * Math.cos(a) - mid[1]);
        m.rotation.y = a;
        m.visible = e > 0;
      });
      shut.position.set(PANEL[0] - mid[0], 0, PANEL[2] / 2 - mid[1]);
      shut.visible = e <= 0;
    };
    return {
      frame(dt, { lit, reduced }) {
        const to = lit ? 1 : 0;
        if (unfold.target !== to) unfold.to(to);
        if (reduced) unfold.set(to);
        const busy = unfold.advance(dt);
        const shown = smooth(0.75, 1, unfold.value);
        if (reduced) time.value = 1200; else if (shown > 0) time.value += dt;
        wipe.value = shown;
        lay(Math.max(0, (unfold.value - 0.04) / 0.96));
        return busy || (lit && !reduced);
      },
    };
  }

  /* Tool: the window (.9×.72) shrinks to a phone (.47×.96) and back, repeating (400/40), and two panels come forward 60ms apart (900/36) */
  const DESK = { w: 0.9, h: 0.72, margin: 0.1, radius: 0.03, head: 0.17, foot: 0 };
  const PHONE = { w: 0.47, h: 0.96, margin: 0.1, radius: 0.08, head: 0.13, foot: 0.12 };
  const OUT = 0.07, IN = -0.04, CARD = 0.06;
  const squeezeTl = (() => {
    const s = { v: 0 };
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.9, ease: "sine.inOut" } })
      .to(s, { v: 1, duration: 0.55, ease: "power2.inOut" }, 0.15).to(s, { v: 0 }, 2.3).to(s, { v: 1 }, 4.8);
    return (ms) => { const t = ms / 1000; tl.time(t < 0.7 ? t : 0.7 + ((t - 0.7) % 5)); return s.v; };
  })();
  const mix = gsap.utils.interpolate(DESK, PHONE);
  // Positions of the two panels [center y, center z, height, width] — on phone two rows top and bottom, in a window two columns left and right
  function cardsFor({ w, h, margin, head, foot }, phone) {
    const top = h / 2 - head - margin, bottom = -h / 2 + foot + margin, left = -w / 2 + margin, right = w / 2 - margin;
    if (phone) { const rh = (top - bottom - 0.1) / 2; return [[top - rh / 2, 0, rh, right - left], [bottom + rh / 2, 0, rh, right - left]]; }
    const cw = (right - left - 0.12) / 2;
    return [[(top + bottom) / 2, left + cw / 2, top - bottom, cw], [(top + bottom) / 2, right - cw / 2, top - bottom, cw]];
  }
  function slabGeometry() {
    const ring = [];
    for (const [cx, cy, q] of [[1, 1, 0], [-1, 1, 1], [-1, -1, 2], [1, -1, 3]]) {
      for (let i = 0; i <= 8; i++) { const a = ((q + i / 8) * Math.PI) / 2; ring.push([cx, cy, Math.cos(a), Math.sin(a)]); }
    }
    const corner = [], dir = [], side = [], wall = [];
    const put = (p, s, w) => { corner.push(p[0], p[1]); dir.push(p[2], p[3]); side.push(s); wall.push(w); };
    const centre = [0, 0, 0, 0];
    ring.forEach((p, i) => {
      const q = ring[(i + 1) % ring.length];
      put(centre, -1, 0); put(p, -1, 0); put(q, -1, 0);
      put(centre, 1, 0); put(q, 1, 0); put(p, 1, 0);
      put(p, -1, 1); put(p, 1, 1); put(q, -1, 1);
      put(q, -1, 1); put(p, 1, 1); put(q, 1, 1);
    });
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(side.length * 3), 3));
    g.setAttribute("aCorner", new T.Float32BufferAttribute(corner, 2));
    g.setAttribute("aDir", new T.Float32BufferAttribute(dir, 2));
    g.setAttribute("aSide", new T.Float32BufferAttribute(side, 1));
    g.setAttribute("aWall", new T.Float32BufferAttribute(wall, 1));
    return g;
  }
  function tools(st) {
    const holder = new T.Group();
    holder.rotation.y = Math.PI / 2;
    st.pivot.add(holder);
    st.pivot.scale.setScalar(64);
    const slabMat = st.keep(new T.ShaderMaterial({
      vertexShader: SLAB_VERT, fragmentShader: SLAB_FRAG, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      uniforms: { ...st.shared, uHalf: { value: new T.Vector2(DESK.w / 2, DESK.h / 2) }, uRadius: { value: DESK.radius }, uDepth: { value: 0.08 }, uTitle: { value: DESK.head }, uDesktop: { value: 1 } },
    }));
    const slab = new T.Mesh(st.keep(slabGeometry()), slabMat);
    slab.frustumCulled = false;
    const cards = [st.box([CARD, 1, 1]), st.box([CARD, 1, 1])];
    holder.add(slab, ...cards);
    const squeeze = new Spring(0, { tension: 400, friction: 40 });
    const out = cards.map(() => new Spring(IN, { tension: 900, friction: 36 }));
    const push = new Spring(0, { tension: 1600, friction: 64 });
    const rects = cards.map(() => [0, 0, 0, 0].map(() => new Spring(0, { tension: 576, friction: 34 })));
    let phone = false, phoneCards = false, switchAt = -1, onFor = 0, offFor = 0, wasLit = false, placed = false;
    return {
      frame(dt, { lit, reduced }) {
        if (lit && !wasLit) onFor = squeeze.value > 0.05 ? 150 + 550 * squeeze.value : 0;
        if (!lit && wasLit) squeeze.to(squeeze.value);
        wasLit = lit;
        if (lit) { onFor += dt; offFor = 0; } else offFor += dt;
        let busy = false;
        out.forEach((s, i) => {
          const to = lit ? (onFor >= i * 60 ? OUT : IN) : offFor >= (1 - i) * 30 ? IN : s.target;
          if (s.target !== to) { s.config.friction = to === OUT ? 36 : 60; s.to(to); }
          if (reduced) s.set(lit ? OUT : IN);
          busy = s.advance(dt) || busy;
        });
        const allIn = out.every((s) => s.value <= 0);
        if (lit && !reduced) squeeze.to(squeezeTl(onFor));
        else if (allIn && squeeze.target !== 0) squeeze.to(0);
        if (reduced) squeeze.set(lit ? 1 : 0);
        busy = squeeze.advance(dt) || busy;
        const f = clamp01(squeeze.value), now = mix(f);
        slabMat.uniforms.uHalf.value.set(now.w / 2, now.h / 2);
        slabMat.uniforms.uRadius.value = now.radius;
        slabMat.uniforms.uTitle.value = now.head;
        slabMat.uniforms.uDesktop.value = 1 - clamp01((f - 0.25) / 0.5);
        // Panel layout is phone below width .66 and window above .7 — if a panel is out, push the second panel .1 more and switch the layout after 50ms
        if (phone ? now.w > 0.7 : now.w < 0.66) {
          phone = !phone;
          if (allIn || reduced) phoneCards = phone; else { push.to(0.1); switchAt = onFor + 50; }
        }
        if (switchAt >= 0 && (onFor >= switchAt || !lit)) { phoneCards = phone; switchAt = -1; }
        const goal = cardsFor(now, phoneCards);
        let settled = true;
        rects.forEach((list, i) => list.forEach((s, k) => {
          if (s.target !== goal[i][k]) s.to(goal[i][k]);
          if (!placed || reduced || out[i].value <= -0.039) s.set(goal[i][k]);
          busy = s.advance(dt) || busy;
          if (Math.abs(s.value - goal[i][k]) > 0.03) settled = false;
        }));
        if (switchAt < 0 && settled && push.target !== 0) push.to(0);
        if (reduced) push.set(0);
        busy = push.advance(dt) || busy;
        cards.forEach((m, i) => {
          const [cy, cz, h, w] = rects[i].map((s) => s.value), o = out[i].value + (i === 1 ? push.value : 0);
          m.scale.set(CARD, Math.max(0.001, h), Math.max(0.001, w));
          m.visible = out[i].value > -0.039;
          m.position.set(-0.04 - o + CARD / 2, cy, cz);
        });
        placed = true;
        return busy || (lit && !reduced);
      },
    };
  }

  const SCENES = { map, book, tools };
  window.gIcons = {
    create(canvas, shape) {
      const st = stage(canvas);
      const scene = SCENES[shape](st);
      st.warm();
      return {
        resize: () => st.resize(),
        frame(dt, opts) { st.zoom(opts.zoom); const busy = scene.frame(dt, opts); st.render(); return busy; },
        dispose: () => st.dispose(),
      };
    },
  };
})();
