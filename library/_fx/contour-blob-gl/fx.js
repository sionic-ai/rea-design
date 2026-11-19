// Stand one WebGL 3D object in the center of the panel and draw contour stripes on its surface — five spots on the sphere surface (circle, rounded triangle, rounded square, ellipse, circle)
// Warp the distance field with noise (.165 × size .42) and draw a line every .064 spacing, each ring’s thickness breathes ±16% as it slowly flows outward.
// When the cursor comes within 420px of the object’s screen center, the line thickens .109 → .274 (.08 per frame), dragging spins it (sensitivity 2.2 · follow .35) and releasing stops it with ×.955.
// Shapes are sphere, front-facing six-pointed star balloon (star), and a rippling blob — they blend and switch over 1.05s cubic in-out on the fx:shape event.
// A shader rebuilt after measuring the numbers of the original stage object — line color is --kf-accent, and the gaps between lines are empty so the panel background shows through.
(() => {
  const NOISE = `
    float cb_h(vec3 p){ p = fract(p * 0.1031 + vec3(0.37, 0.53, 0.19)); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
    float cb_n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(cb_h(i), cb_h(i + vec3(1,0,0)), f.x), mix(cb_h(i + vec3(0,1,0)), cb_h(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(cb_h(i + vec3(0,0,1)), cb_h(i + vec3(1,0,1)), f.x), mix(cb_h(i + vec3(0,1,1)), cb_h(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float cb_fbm(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ v += a * cb_n(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= 0.52; } return v; }`;
  const VERT = `
    uniform float uFrom; uniform float uTo; uniform float uMorph; uniform float uTime;
    varying vec3 vDir; varying vec3 vN; varying vec3 vV;
    ${NOISE}
    vec3 shapePos(float k, vec3 d){
      if (k < 0.5) return d;
      if (k < 1.5){ float s = 1.0 + 0.12 * cos(6.0 * atan(d.y, d.x)) * (0.35 + 0.65 * (1.0 - abs(d.z))); return vec3(d.x * s, d.y * s * 1.19, d.z * 0.8) * 0.97; }
      return d * (1.0 + (cb_n(d * 1.5 + vec3(0.0, uTime * 0.12, 0.0)) - 0.5) * 0.32) * 0.95;
    }
    vec3 morphPos(vec3 d){ return mix(shapePos(uFrom, d), shapePos(uTo, d), uMorph); }
    void main(){
      vec3 d = normalize(position); vec3 p = morphPos(d);
      vec3 up = abs(d.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
      vec3 t1 = normalize(cross(up, d)); vec3 t2 = cross(d, t1);
      vec3 n = normalize(cross(morphPos(normalize(d + t1 * 0.01)) - p, morphPos(normalize(d + t2 * 0.01)) - p));
      if (dot(n, d) < 0.0) n = -n;
      vec4 w = modelMatrix * vec4(p, 1.0);
      vDir = d; vN = normalize(mat3(modelMatrix) * n); vV = cameraPosition - w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const FRAG = `
    uniform vec3 uLine; uniform float uSpacing; uniform float uWidth; uniform float uIdle;
    varying vec3 vDir; varying vec3 vN; varying vec3 vV;
    ${NOISE}
    mat2 rot(float a){ float s = sin(a); float c = cos(a); return mat2(c, -s, s, c); }
    vec2 onPlane(vec3 p, vec3 c){ vec3 up = abs(c.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
      vec3 u = normalize(cross(up, c)); vec3 v = cross(c, u); vec3 q = p - c * dot(p, c); return vec2(dot(q, u), dot(q, v)); }
    vec3 drift(vec3 b, float t, float rate, float ph){ vec3 ax = normalize(vec3(sin(ph * 1.7), cos(ph * 2.3), sin(ph * 0.9 + 1.1)));
      vec3 tg = normalize(cross(ax, b)); vec3 bt = cross(b, tg); float w = t * rate + ph; return normalize(b + tg * sin(w) * 0.26 + bt * cos(w * 0.73 + ph) * 0.26); }
    float dTri(vec2 p, float r, float cr){ const float k = 1.7320508; float s = r - cr; p.x = abs(p.x) - s; p.y += s / k;
      if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5; p.x -= clamp(p.x, -2.0 * s, 0.0); return -length(p) * sign(p.y) - cr; }
    float dBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    float blend(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
    float field(vec3 p, float t){
      vec3 q = p * 0.42;
      vec3 off = vec3(cb_fbm(q + vec3(3.1, 0.4, 7.7) + t * vec3(0.31, -0.17, 0.23)), cb_fbm(q + vec3(-6.2, 4.4, 1.9) + t * vec3(-0.19, 0.27, 0.13)),
                      cb_fbm(q + vec3(5.3, -8.1, 2.6) + t * vec3(0.11, 0.21, -0.29))) - 0.5;
      vec3 w = normalize(p + off * 0.165);
      float d = length(onPlane(w, drift(normalize(vec3(0.6, 0.5, 0.62)), t, 0.41, 0.0))) - 0.35;
      d = blend(d, dTri(rot(0.4 + t * 0.11) * onPlane(w, drift(normalize(vec3(-0.55, 0.4, 0.73)), t, 0.29, 1.9)), 0.4, 0.08), 0.12);
      d = blend(d, dBox(rot(-0.25 - t * 0.08) * onPlane(w, drift(normalize(vec3(-0.6, -0.55, 0.58)), t, 0.53, 3.4)), vec2(0.3, 0.22), 0.09), 0.12);
      vec2 e = rot(0.9 + t * 0.13) * onPlane(w, drift(normalize(vec3(0.5, -0.6, -0.62)), t, 0.35, 5.0));
      d = blend(d, (length(e / vec2(0.42, 0.22)) - 1.0) * 0.22, 0.12);
      d = blend(d, length(onPlane(w, drift(normalize(vec3(0.0, 0.15, -1.0)), t, 0.47, 2.6))) - 0.3, 0.12);
      return d;
    }
    void main(){
      vec3 N = normalize(vN); float facing = dot(N, normalize(vV));
      float coord = field(normalize(vDir), uIdle) / (uSpacing * (1.0 + sin(uIdle * 0.6) * 0.09)) - uIdle * 0.35;
      float s = abs(fract(coord) - 0.5); float aa = fwidth(coord) * 0.65;
      float lw = max(0.0, uWidth + (cb_fbm(N * 4.0 + vec3(9.1, -2.7, 4.4)) - 0.5) * 0.03) * (1.0 + sin(floor(coord) * 0.9 - uIdle * 1.3) * 0.16);
      float line = (1.0 - smoothstep(lw - aa, lw + aa, s)) * smoothstep(-0.3, 0.45, facing);
      gl_FragColor = vec4(uLine, line);
    }`;
  const SHAPES = { sphere: 0, star: 1, blob: 2 };

  kfFx.register("contour-blob-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const spacing = num("spacing", 0.064) || 0.064;
    const width = num("width", 0.109), boost = num("boost", 0.165), reach = num("reach", 420) || 420;
    const sens = num("drag", 2.2), damp = num("damp", 0.955), size = num("size", 0.8) || 0.8, morphDur = num("morph", 1.05);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-cbg";
    el.prepend(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 10);
    const ink = () => {
      const probe = document.createElement("i");
      probe.style.cssText = "display:none;color:var(--kf-accent)";
      el.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      const cv = document.createElement("canvas").getContext("2d");
      cv.fillStyle = c; cv.fillRect(0, 0, 1, 1);
      const d = cv.getImageData(0, 0, 1, 1).data;
      return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
    };
    const start = SHAPES[options.shape] ?? 0;
    const U = {
      uFrom: { value: start }, uTo: { value: start }, uMorph: { value: 0 }, uTime: { value: 0 },
      uLine: { value: ink() }, uSpacing: { value: spacing }, uWidth: { value: width }, uIdle: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, transparent: true });
    const geo = new THREE.SphereGeometry(1, 160, 112);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    renderer.compile(scene, camera);

    let W = 1, H = 1;
    const fit = () => {
      W = el.clientWidth || 1; H = el.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      // Distance where the diameter is a share of the panel’s short side times size
      const t = Math.tan(THREE.MathUtils.degToRad(15));
      camera.position.z = 2 / (size * 2 * t * Math.min(1, camera.aspect));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();

    const rot = { x: 0, y: 0, vx: 0, vy: 0 };
    const ptr = { in: false, x: 0, y: 0, down: false, id: null, lx: 0, ly: 0 };
    const morph = { p: 1, active: false };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.in = true;
      if (!ptr.down || e.pointerId !== ptr.id) return;
      const dx = e.clientX - ptr.lx, dy = e.clientY - ptr.ly;
      ptr.lx = e.clientX; ptr.ly = e.clientY;
      rot.vy = THREE.MathUtils.lerp(rot.vy, (dx / W) * Math.PI * sens, 0.35);
      rot.vx = THREE.MathUtils.lerp(rot.vx, (dy / H) * Math.PI * sens, 0.35);
      rot.y += rot.vy;
      rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -1.2, 1.2);
      if (reduce) draw(0);
    };
    const onDown = (e) => { ptr.down = true; ptr.id = e.pointerId; ptr.lx = e.clientX; ptr.ly = e.clientY; rot.vx = rot.vy = 0; canvas.setPointerCapture?.(e.pointerId); };
    const onUp = (e) => { if (e.pointerId !== ptr.id) return; ptr.down = false; canvas.releasePointerCapture?.(e.pointerId); };
    const onLeave = () => { ptr.in = false; };
    const onShape = (e) => {
      const to = SHAPES[e.detail] ?? +e.detail;
      if (!(to >= 0 && to <= 2) || to === U.uTo.value) return;
      U.uFrom.value = morph.active ? U.uTo.value : U.uTo.value;
      U.uTo.value = to;
      morph.p = reduce || morphDur <= 0 ? 1 : 0;
      morph.active = morph.p < 1;
      U.uMorph.value = morph.active ? 0 : 1;
      if (!morph.active) { U.uFrom.value = to; U.uMorph.value = 0; }
      if (reduce) draw(0);
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    el.addEventListener("fx:shape", onShape);

    const ease = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
    let last = 0, raf = 0, clock = 0;
    const draw = (dt) => {
      clock += dt;
      if (morph.active) {
        morph.p = Math.min(1, morph.p + dt / morphDur);
        U.uMorph.value = ease(morph.p);
        if (morph.p >= 1) { morph.active = false; U.uFrom.value = U.uTo.value; U.uMorph.value = 0; }
      }
      if (!ptr.down) {
        const k = Math.pow(damp, dt * 60);
        rot.vy *= k; rot.vx *= k;
        if (Math.abs(rot.vy) < 2e-5) rot.vy = 0;
        if (Math.abs(rot.vx) < 2e-5) rot.vx = 0;
        rot.y += rot.vy;
        rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -1.2, 1.2);
      }
      mesh.rotation.set(rot.x, rot.y, 0);
      // If the cursor is within reach px of the object’s screen center, the line thickens by boost
      const near = hover && ptr.in ? THREE.MathUtils.clamp(1 - Math.hypot(ptr.x - W / 2, ptr.y - H / 2) / reach, 0, 1) : 0;
      U.uWidth.value = reduce ? width : THREE.MathUtils.lerp(U.uWidth.value, width + boost * near, 1 - Math.pow(1 - 0.08, Math.max(dt, 1 / 60) * 60));
      U.uTime.value = clock;
      U.uIdle.value = reduce ? 0 : clock * 0.15;
      renderer.render(scene, camera);
    };
    const loop = (now) => {
      const dt = last ? Math.min(0.1, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    if (reduce) draw(0); else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("fx:shape", onShape);
      geo.dispose(); mat.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
