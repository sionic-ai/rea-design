// The point cloud gathers and scatters into a different shape per section (sphere, wave plane, torus, twisted tube, concentric rings, cube, heart).
// Shape coordinates are baked into attributes once at the start, and the vertex shader handles shuffling and rotating — moving 3,000-odd dots in JS every frame drops the frame rate on phones.
(() => {
  const VERT = `
    attribute vec3 aSphere; attribute vec2 aGrid; attribute vec3 aTorus; attribute vec3 aTube;
    attribute vec2 aRing; attribute vec3 aCube; attribute vec2 aHeart; attribute vec3 aStart; attribute vec2 aCell;
    uniform float uT, uMorph, uSvc, uApr, uPlan, uWhy, uTeam, uEp, uAmp, uPulse, uSize, uScale;
    uniform float uSpin, uTspin, uAspin, uPspin, uCspin;
    vec3 yaw(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c); }
    void main() {
      vec3 f = mix(yaw(aSphere, uSpin), vec3(aGrid, sin(aGrid.x * .006 + uT * .4) * uAmp + cos(aGrid.y * .009 + uT * .32) * uAmp * .5), uMorph);
      f += (yaw(aTorus, uTspin) - f) * uSvc;
      float ph = 8.16814 * aCell.x + uAspin, c = cos(ph), s = sin(ph);
      f += (vec3(aTube.x, aTube.y * c - aTube.z * s, aTube.y * s + aTube.z * c) - f) * uApr;
      vec2 r = aRing * (1. + .05 * sin(aCell.y * .5 - uT * 1.1));
      float pc = cos(uPspin), ps = sin(uPspin);
      f += (vec3(r.x * pc - r.y * ps, r.x * ps + r.y * pc, 0.) - f) * uPlan;
      f += (yaw(aCube, uCspin) - f) * uWhy;
      f += (vec3(aHeart * uPulse, 0.) - f) * uTeam;
      vec4 mv = modelViewMatrix * vec4(mix(aStart, f, uEp), 1.);
      gl_PointSize = uSize * uScale / -mv.z;
      gl_Position = projectionMatrix * mv;
    }`;
  // The original dot pattern (1 at the center → .85 at half the radius → 0 at the edge, a round glow) is drawn by calculation without an image
  const FRAG = `
    uniform vec3 uColor; uniform float uOpacity;
    void main() {
      float d = length(gl_PointCoord - .5) * 2.;
      if (d > 1.) discard;
      float a = d < .5 ? mix(1., .85, d * 2.) : mix(.85, 0., (d - .5) * 2.);
      gl_FragColor = vec4(uColor, a * uOpacity);
    }`;

  const SHAPES = ["sphere", "grid", "torus", "tube", "rings", "cube", "heart"];

  // Dots filling the inside of the heart curve evenly — treat the curve as a polygon and pick points by an inside test (360-cell grid, original size ratio as is)
  const heartPoly = (() => {
    const pts = [];
    for (let a = 0; a <= Math.PI * 2 + 0.02; a += 0.01) {
      const hx = 16 * Math.sin(a) ** 3;
      const hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      pts.push([hx * 9.6, hy * 9.6]);
    }
    return pts;
  })();
  const insideHeart = (x, y) => {
    let inside = false;
    for (let i = 0, j = heartPoly.length - 1; i < heartPoly.length; j = i++) {
      const [xi, yi] = heartPoly[i], [xj, yj] = heartPoly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  kfFx.register("particle-shape-morph", (el, { options, reduce }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(Object.assign(document.createElement("canvas"), { ariaHidden: "true" }));
    const made = !canvas.hasAttribute("data-fx-part");
    if (made) canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      if (made) canvas.remove();
      return;
    }
    const size = () => [el.clientWidth || innerWidth, el.clientHeight || innerHeight];
    let [W, H] = size();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 1, 6000);
    camera.position.set(0, 0, +(options.distance ?? 720));

    const small = Math.min(W, H) < 760 || matchMedia("(pointer: coarse)").matches;
    const COLS = +options.cols || (small ? 44 : 78), ROWS = +options.rows || (small ? 26 : 44), N = COLS * ROWS;
    const R = +(options.radius ?? 298) * (small ? 0.7 : 1);
    const CN = Math.max(2, Math.round(Math.cbrt(N)));
    const GA = Math.PI * (3 - Math.sqrt(5)), TAU = Math.PI * 2;
    const buf = (k) => new Float32Array(N * k);
    const a = { aSphere: buf(3), aGrid: buf(2), aTorus: buf(3), aTube: buf(3), aRing: buf(2), aCube: buf(3), aHeart: buf(2), aStart: buf(3), aCell: buf(2) };
    for (let i = 0; i < N; i++) {
      const col = i % COLS, row = (i / COLS) | 0;
      const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(Math.max(0, 1 - y * y)), phi = i * GA;
      a.aSphere.set([Math.cos(phi) * rr * R, y * R, Math.sin(phi) * rr * R], i * 3);
      a.aGrid.set([(col / (COLS - 1) - 0.5) * 1560, (row / (ROWS - 1) - 0.5) * 860], i * 2);
      const u = (col / COLS) * TAU, v = (row / (ROWS - 1)) * TAU, ring = 300 + 116 * Math.cos(v);
      a.aTorus.set([Math.cos(u) * ring, 116 * Math.sin(v), Math.sin(u) * ring], i * 3);
      a.aTube.set([(col / (COLS - 1) - 0.5) * 1760, Math.cos(v) * 150, Math.sin(v) * 75], i * 3);
      const rad = (0.14 + 0.86 * (row / (ROWS - 1))) * 560;
      a.aRing.set([Math.cos(u) * rad, Math.sin(u) * rad], i * 2);
      const ix = i % CN, iy = ((i / CN) | 0) % CN, iz = ((i / (CN * CN)) | 0) % CN;
      a.aCube.set([(ix / (CN - 1) - 0.5) * 560, (iy / (CN - 1) - 0.5) * 560, (iz / (CN - 1) - 0.5) * 560], i * 3);
      let hx, hy;
      do { hx = (Math.random() - 0.5) * 340; hy = (Math.random() - 0.5) * 340; } while (!insideHeart(hx, hy));
      a.aHeart.set([hx * 1.28, hy * 1.28], i * 2);
      a.aStart.set([(Math.random() * 2 - 1) * 1350, (Math.random() * 2 - 1) * 840, (Math.random() * 2 - 1) * 560], i * 3);
      a.aCell.set([col / (COLS - 1), row], i * 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(a.aSphere, 3));
    for (const k in a) geo.setAttribute(k, new THREE.BufferAttribute(a[k], k === "aGrid" || k === "aRing" || k === "aHeart" || k === "aCell" ? 2 : 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2000);

    const U = {};
    for (const k of "uT uMorph uSvc uApr uPlan uWhy uTeam uEp uAmp uPulse uSize uScale uSpin uTspin uAspin uPspin uCspin uOpacity".split(" ")) U[k] = { value: 0 };
    U.uColor = { value: new THREE.Color() };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);
    renderer.compile(scene, camera);

    // Dot color is read from the skin — light sections use --fx-dot (default text color), dark sections use --fx-dot-dark (default opposite stage text color)
    const probe = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    const rgbOf = (name, fallback) => {
      const v = getComputedStyle(el).getPropertyValue(name).trim() || getComputedStyle(document.documentElement).getPropertyValue(fallback).trim();
      const i = document.createElement("i");
      i.style.cssText = `display:none;color:${v}`;
      el.append(i);
      const c = getComputedStyle(i).color;
      i.remove();
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = c;
      probe.fillRect(0, 0, 1, 1);
      const d = probe.getImageData(0, 0, 1, 1).data;
      return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
    };
    let light = rgbOf("--fx-dot", "--kf-ink"), dark = rgbOf("--fx-dot-dark", "--kf-contrast-ink");

    const darkSet = new Set((options.dark || "torus tube cube heart").split(/[\s,]+/));
    const grid = new Set(["grid", "torus", "tube", "rings", "cube", "heart"]);
    let shape = SHAPES.includes(options.shape) ? options.shape : "sphere";
    const k = +(options.lerp ?? 0.05), km = +(options["morph-lerp"] ?? 0.06), intro = +(options.intro ?? 2);
    const s = { morph: 0, svc: 0, apr: 0, plan: 0, why: 0, team: 0, col: 0 };
    const goal = () => ({ morph: grid.has(shape) ? 1 : 0, svc: +(shape === "torus"), apr: +(shape === "tube"), plan: +(shape === "rings"), why: +(shape === "cube"), team: +(shape === "heart"), col: +darkSet.has(shape) });
    const spins = { uSpin: 0.16, uTspin: 0.1, uAspin: 0.22, uPspin: 0.05, uCspin: 0.14 };
    const lerp = (x, y, t) => x + (y - x) * t;

    const t0 = performance.now();
    let last = t0, introDone = reduce || intro <= 0;
    const draw = (now, snap) => {
      const t = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0, now - last) / 1000);
      last = now;
      const g = goal();
      for (const key in s) s[key] = snap ? g[key] : lerp(s[key], g[key], key === "morph" ? km : k);
      if (!reduce) for (const key in spins) U[key].value += spins[key] * dt;
      let ep = 1;
      if (!introDone) {
        const raw = (now - t0) / (intro * 1000);
        if (raw >= 1) introDone = true;
        else ep = 1 - (1 - raw) ** 3;
      }
      const hb = (t * 1.05) % 1;
      U.uT.value = reduce ? 0 : t;
      U.uMorph.value = s.morph; U.uSvc.value = s.svc; U.uApr.value = s.apr; U.uPlan.value = s.plan; U.uWhy.value = s.why; U.uTeam.value = s.team;
      U.uEp.value = ep;
      U.uAmp.value = s.morph * 95;
      U.uPulse.value = 1 + 0.05 * (Math.exp(-(((hb - 0.1) * 9) ** 2)) + 0.55 * Math.exp(-(((hb - 0.28) * 9) ** 2)));
      U.uSize.value = 2.4 - 0.4 * s.morph + 0.35 * s.svc + 0.2 * s.apr;
      U.uOpacity.value = (0.92 - 0.1 * s.morph) * (0.25 + 0.75 * ep);
      U.uScale.value = (H * ratio) / 2;
      U.uColor.value.copy(light).lerp(dark, s.col);
      group.rotation.x = s.morph * -0.42 + s.svc * 0.16 + s.apr * 0.27 + (s.plan + s.team) * 0.42;
      group.position.y = s.svc * -70;
      renderer.render(scene, camera);
    };

    let raf = 0, seen = true;
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const run = () => { if (!raf && seen && !document.hidden && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    if (reduce) draw(performance.now(), true);
    else run();

    const onShape = (e) => {
      const next = e.detail && e.detail.shape;
      if (!SHAPES.includes(next)) return;
      shape = next;
      if (reduce) draw(performance.now(), true);
    };
    el.addEventListener("fx:shape", onShape);
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; seen ? run() : halt(); });
    io.observe(el);
    const onVis = () => (document.hidden ? halt() : run());
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
      [W, H] = size();
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      light = rgbOf("--fx-dot", "--kf-ink");
      dark = rgbOf("--fx-dot-dark", "--kf-contrast-ink");
      if (reduce) draw(performance.now(), true);
    });
    ro.observe(el);

    return () => {
      halt();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("fx:shape", onShape);
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (made) canvas.remove();
    };
  });
})();
