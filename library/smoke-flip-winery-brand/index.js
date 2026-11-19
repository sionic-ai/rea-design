// Home: stem model·point cloud flight·three tagline sets·six smoke boundaries·cropped photo·floating grapes·three people.
// Original values: first title 1.5s (after 1.2/1.4s) · letter-spacing .1em→0, label 1s after .3s .7em→0 · stem contrast 10→1 3s power3.inOut after 1.6s
// · Stem (ogl): camera fov 45 (0,0,1), entrance y -.1→0 · z .9→1 over 3s power2.out after .2s, scroll z +.1 · y -.2,
//   Mouse lerp .05 rotates y-axis -.05 · x-axis -.02, point light lerp .1 at (mouse x, -mouse y×.6+.3, .2) · intensity 50 · size .1, directional light (0,1,1)
// · point cloud (ogl): scroll picks from a 312-image flow, and a flow map (decay .8·strength .3·radius .4) ripples it ×.05 · range 7499px + black curtain 150svh
// · tagline steps 150/200/250svh, photo inset 20%→0 · contrast 6→1 · letter title 1.6s power2.inOut random .1 · cropped photo .6s power2.inOut · team photo parallax -40%→40%.
(() => {
  const { Renderer, Camera, Transform, Program, Mesh, Geometry, Triangle, Flowmap, Vec2, Vec3, Texture } = OGL;

  // ---------- Stem model: carve vertically split bark grain into a curved tube ----------
  // Value noise (3D) — base for shell grooves and bumps
  const hash = (x, y, z) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const vnoise = (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const l = (a, b, t) => a + (b - a) * t;
    const c = (i, j, k) => hash(xi + i, yi + j, zi + k);
    return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w) * 2 - 1;
  };
  // Vertical grooves (ridge noise stretched lengthwise) + large bumps + fine grain
  const bark = (a, s) => {
    const x = Math.cos(a) * 1.6, y = Math.sin(a) * 1.6;
    let ridge = 0, amp = 0.55, f = 1;
    for (let k = 0; k < 4; k++) {
      ridge += amp * Math.pow(1 - Math.abs(vnoise(x * f * 3.2, y * f * 3.2, s * f * 0.9)), 2);
      f *= 2.1;
      amp *= 0.5;
    }
    const knot = Math.max(0, vnoise(x * 0.9 + 9, y * 0.9, s * 0.45) - 0.25) * 1.6;
    return { h: ridge * 0.75 + knot * 0.6, knot };
  };
  const buildBranch = (gl, mobile) => {
    // A stem lying in an S from the lower left (front) to the upper right (back) — position and thickness from the original hero
    const P = [
      [-0.42, -0.78, 0.16], [-0.36, -0.6, 0.12], [-0.25, -0.3, 0.08], [-0.1, 0, -0.02],
      [0.02, 0.25, -0.15], [0.2, 0.55, -0.35], [0.28, 0.82, -0.5], [0.3, 0.95, -0.6],
    ];
    const cr = (t) => {
      const n = P.length - 3, i = Math.min(n - 1, Math.floor(t * n)), u = t * n - i;
      const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
      return p1.map((_, k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u));
    };
    const SEG = mobile ? 240 : 480, RAD = mobile ? 64 : 96;
    const pos = new Float32Array((SEG + 1) * (RAD + 1) * 3);
    const out = new Float32Array((SEG + 1) * (RAD + 1) * 3);
    const hgt = new Float32Array((SEG + 1) * (RAD + 1));
    const along = new Float32Array((SEG + 1) * (RAD + 1));
    let up = [0, 0, 1];
    const sub = (a, b) => a.map((v, i) => v - b[i]);
    const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
    let len = 0, prev = cr(0);
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const c = cr(t);
      len += Math.hypot(...sub(c, prev));
      prev = c;
      const tan = nrm(sub(cr(Math.min(1, t + 0.002)), cr(Math.max(0, t - 0.002))));
      const n1 = nrm(crs(up, tan)), n2 = nrm(crs(tan, n1));
      up = n2;
      // Thick at the base, thinning toward the top, swelling here and there
      const r0 = 0.078 * (1 - 0.45 * t) * (1 + 0.12 * Math.sin(t * 17.0) + 0.07 * Math.sin(t * 41.0 + 1.3));
      for (let j = 0; j <= RAD; j++) {
        const a = (j / RAD) * Math.PI * 2;
        const b = bark(a, len * 14);
        const r = r0 * (0.84 + 0.26 * b.h);
        const k = i * (RAD + 1) + j;
        for (let q = 0; q < 3; q++) {
          out[k * 3 + q] = n1[q] * Math.cos(a) + n2[q] * Math.sin(a);
          pos[k * 3 + q] = c[q] + out[k * 3 + q] * r;
        }
        hgt[k] = Math.min(1, Math.max(0, b.h * 0.8 - 0.05));
        along[k] = t;
      }
    }
    // Face direction = Cross product of neighboring cell differences (the perimeter wraps around and connects)
    const nor = new Float32Array(pos.length);
    const at = (i, j) => ((Math.min(SEG, Math.max(0, i)) * (RAD + 1) + ((j + RAD) % RAD)) * 3);
    for (let i = 0; i <= SEG; i++)
      for (let j = 0; j <= RAD; j++) {
        const a = at(i + 1, j), b = at(i - 1, j), c = at(i, j + 1), d = at(i, j - 1);
        const du = [pos[a] - pos[b], pos[a + 1] - pos[b + 1], pos[a + 2] - pos[b + 2]];
        const dv = [pos[c] - pos[d], pos[c + 1] - pos[d + 1], pos[c + 2] - pos[d + 2]];
        let n = nrm(crs(dv, du));
        const k = (i * (RAD + 1) + j) * 3;
        // Face the outside of the tube — flip the face that points against the circumference direction
        if (n[0] * out[k] + n[1] * out[k + 1] + n[2] * out[k + 2] < 0) n = n.map((v) => -v);
        nor.set(n, k);
      }
    const idx = new Uint16Array(SEG * RAD * 6);
    let o = 0;
    for (let i = 0; i < SEG; i++)
      for (let j = 0; j < RAD; j++) {
        const a = i * (RAD + 1) + j, b = a + RAD + 1;
        idx.set([a, a + 1, b, b, a + 1, b + 1], o);
        o += 6;
      }
    return new Geometry(gl, {
      position: { size: 3, data: pos },
      normal: { size: 3, data: nor },
      height: { size: 1, data: hgt },
      along: { size: 1, data: along },
      index: { data: idx },
    });
  };
  const BRANCH_VERT = /* glsl */ `attribute vec3 position, normal; attribute float height, along;
uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
varying vec3 vN, vW; varying float vH, vT;
void main(){
  vec4 w = modelMatrix * vec4(position, 1.);
  vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vH = height; vT = along;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
  // Rough metal shell (Cook-Torrance): one directional light plus one point light following the mouse, grooves dark and ridges bright
  const BRANCH_FRAG = /* glsl */ `precision highp float;
uniform vec3 cameraPosition, u_dir, u_dir_color, u_point, u_point_color, u_base;
uniform float u_point_int, u_point_size, u_rough, u_metal;
varying vec3 vN, vW; varying float vH, vT;
const float PI = 3.14159265;
float ggx(float a, float nh){ float a2 = a * a, f = (nh * a2 - nh) * nh + 1.; return a2 / (PI * f * f); }
float smith(float nl, float nv, float r){
  float r2 = r * r;
  return (2. * nl / (nl + sqrt(r2 + (1. - r2) * nl * nl))) * (2. * nv / (nv + sqrt(r2 + (1. - r2) * nv * nv)));
}
vec3 shade(vec3 N, vec3 V, vec3 L, vec3 albedo){
  vec3 H = normalize(L + V);
  float nl = clamp(dot(N, L), .001, 1.), nv = clamp(abs(dot(N, V)), .001, 1.), nh = clamp(dot(N, H), 0., 1.), vh = clamp(dot(V, H), 0., 1.);
  vec3 f0 = mix(vec3(.04), albedo, u_metal);
  vec3 F = f0 + (vec3(clamp(max(f0.r, max(f0.g, f0.b)) * 25., 0., 1.)) - f0) * pow(1. - vh, 5.);
  vec3 diff = (1. - F) * albedo * (1. - u_metal) / PI;
  vec3 spec = F * smith(nl, nv, u_rough) * ggx(u_rough, nh) / (4. * nl * nv);
  return nl * (diff + spec);
}
void main(){
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);
  vec3 albedo = pow(u_base, vec3(2.2)) * mix(.03, .8, smoothstep(.12, .9, vH));
  vec3 col = shade(N, V, normalize(u_dir), albedo) * u_dir_color;
  vec3 pl = u_point - vW;
  float d = length(pl);
  col += shade(N, V, pl / d, albedo) * u_point_color * u_point_int / (1. + d * d / (u_point_size * u_point_size));
  // The top edge fades into darkness
  col *= smoothstep(.98, .6, vT);
  gl_FragColor = vec4(pow(col, vec3(1. / 2.2)), 1.);
}`;

  MW.page.home = (c) => {
    const { reduced, touch, isMobile } = MW;
    const $ = (s, r = c) => r.querySelector(s);
    const $$ = (s, r = c) => [...r.querySelectorAll(s)];
    const offs = [];

    // ---------- Hero: grapevine stem ----------
    const branch = $(".mw-branch");
    const bc = branch.querySelector("canvas");
    {
      const renderer = new Renderer({ canvas: bc, dpr: Math.min(devicePixelRatio, 1), antialias: true, alpha: true });
      const gl = renderer.gl;
      const camera = new Camera(gl, { fov: 45 });
      camera.position.set(0, 0, 1);
      camera.lookAt([0, 0, 0]);
      const scene = new Transform();
      const holder = new Transform();
      holder.setParent(scene);
      if (isMobile) holder.position.set(0, 0, -1);
      const ink = MW.rgb("--kf-ink");
      const point = new Vec3(0, 0, 0.5);
      const program = new Program(gl, {
        vertex: BRANCH_VERT,
        fragment: BRANCH_FRAG,
        uniforms: {
          u_dir: { value: new Vec3(0, 1, 1) },
          u_dir_color: { value: ink.map((v) => v * 0.8) },
          u_point: { value: point },
          u_point_color: { value: ink },
          u_point_int: { value: 50 },
          u_point_size: { value: 0.1 },
          u_base: { value: ink },
          u_rough: { value: 0.62 },
          u_metal: { value: 0.35 },
        },
      });
      new Mesh(gl, { geometry: buildBranch(gl, isMobile), program }).setParent(holder);
      branch.classList.add("is-drawn");
      const resize = () => {
        renderer.setSize(innerWidth, innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      };
      resize();
      MW.on(window, "resize", resize);
      // Original reveal: camera returns into place from below and front
      gsap.fromTo(camera.position, { y: -0.1, z: 0.9 }, { y: 0, z: 1, duration: reduced ? 0 : 3, ease: "power2.out", delay: 0.2 });
      const mouse = new Vec2(), lm = new Vec2();
      if (!isMobile) MW.on(window, "mousemove", (e) => mouse.set(gsap.utils.mapRange(0, gl.canvas.width, -1, 1, e.clientX), gsap.utils.mapRange(0, gl.canvas.height, -1, 1, e.clientY)));
      // Original c-branch progress (Branch) runs from #hero (200vh) top 1% to bottom top
      ScrollTrigger.create({
        trigger: $("#hero"),
        start: "top 1%",
        end: "bottom top",
        onUpdate: (st) => {
          if (gsap.isTweening(camera.position)) return;
          camera.position.z = 1 + st.progress * 0.1;
          camera.position.y = -st.progress * 0.2;
        },
      });
      let vis = true;
      const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
      io.observe(bc);
      MW.tick(() => {
        if (!vis) return;
        if (!isMobile && !reduced) {
          lm.x += (mouse.x - lm.x) * 0.05;
          lm.y += (mouse.y - lm.y) * 0.05;
          holder.rotation.y = lm.x * -0.05;
          holder.rotation.x = lm.y * -0.02;
          point.x += (mouse.x - point.x) * 0.1;
          point.y += (-mouse.y * 0.6 + 0.3 - point.y) * 0.1;
          point.z = 0.2;
        }
        renderer.render({ scene, camera });
      });
      offs.push(() => (io.disconnect(), gl.getExtension("WEBGL_lose_context")?.loseContext()));
    }
    branch.dataset.target = "#hero";
    MW.progressCss(branch, { start: "top 1%", end: "bottom top" });
    MW.progressCss($(".mw-hero__bg"));

    MW.heroTitle(c);

    // ---------- Dot cloud flight ----------
    // The original loads 312 pre-rendered 16:9 frames (1920×1080) picked by scroll and set with cover — same flow (sparse stars → thickening dust →
    // Close-up grape rows → pulling back, two walled vineyard tiers · left field · dot-covered ground · two-rut track road come together at the end) as
    // Redrawn as dots for each 16:9 section with the same shader (cover · brightness = Carried by (opacity, flow map ripple)
    const pc = $(".mw-points__canvas");
    const frame = document.createElement("canvas");
    frame.width = 1600;
    frame.height = 900;
    const pg = frame.getContext("2d");
    const dense = innerWidth < 768 ? 0.6 : 1;
    let s2 = 3;
    const r2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    const pts = [];
    // Last section’s position (section ratio 0~1). size is the dot size at 1600 width, late is how late they gather (foreground, length last)
    const add = (count, place, opt = {}) => {
      for (let i = 0; i < Math.round(count * dense); i++) {
        const [u, v] = place();
        const big = r2() < (opt.big || 0);
        pts.push({
          su: r2(), sv: 0.04 + r2() * 0.92, u, v,
          size: big ? 3.5 + r2() * 4 : (opt.size || 1.6) * (0.7 + r2() * 0.7),
          round: big,
          b: (opt.b || 0.75) * (0.55 + r2() * 0.45),
          d: (opt.late || 0) + r2() * 0.08,
          tw: r2() * 6.28,
          star: r2() < 0.25 ? 2.4 + r2() * 2.4 : 1.2 + r2() * 1.2,
        });
      }
    };
    const box = (u0, u1, v0, v1) => () => [u0 + r2() * (u1 - u0), v0 + r2() * (v1 - v0)];
    // Vertical-grain grape rows: gap between rows, row thickness ±w
    const rows = (u0, u1, v0, v1, gap, w) => () => {
      const k = Math.floor(r2() * ((u1 - u0) / gap));
      return [u0 + k * gap + (r2() - 0.5) * w, v0 + r2() * (v1 - v0)];
    };
    // Road: center line at 0.61, widening toward the bottom. The two wheel tracks are empty, the center and side bands are bright
    const pathHalf = (v) => 0.035 + Math.max(0, v - 0.5) * 0.07;
    const inRut = (u, v) => { const q = Math.abs(u - 0.613) / pathHalf(v); return v > 0.5 && q > 0.28 && q < 0.72; };
    add(260, box(0, 1, 0, 0.11), { size: 2, big: 0.2, b: 0.9 });
    add(3400, box(0, 0.3, 0.14, 0.5), { size: 1.6, b: 0.85 });
    add(700, box(0, 0.3, 0.35, 0.405), { size: 1.8, b: 1 });
    // Bottom left: only just outside the ground edge (diagonal) is dark, and beyond it are sparse dots and bold dots
    add(1400, () => {
      let u, v;
      do { v = 0.5 + r2() * 0.5; u = r2() * 0.34; } while (Math.abs(u - (0.31 - (v - 0.5) * 0.28)) < 0.045 || u > 0.34 - (v - 0.5) * 0.28);
      return [u, v];
    }, { size: 1.7, big: 0.1, b: 0.8, late: 0.06 });
    add(1300, () => { const a = r2() * Math.PI, rr = Math.sqrt(r2()); return [0.68 + Math.cos(a) * 0.17 * rr, 0.2 - Math.sin(a) * 0.075 * rr]; }, { size: 1.7, b: 0.85 });
    add(2600, rows(0.34, 0.72, 0.17, 0.3, 0.0165, 0.004), { size: 1.6, b: 0.8, late: -0.04 });
    add(500, box(0.34, 0.72, 0.17, 0.3), { size: 1.4, b: 0.55 });
    add(3200, box(0.6, 1, 0.19, 0.5), { size: 1.5, b: 0.7 });
    add(900, rows(0.62, 1, 0.22, 0.42, 0.024, 0.005), { size: 1.4, b: 0.6 });
    add(2700, rows(0.32, 0.62, 0.3, 0.46, 0.021, 0.005), { size: 1.8, b: 0.9, late: -0.04 });
    add(700, () => [0.28 + r2() * 0.72, 0.475 + r2() * 0.025], { size: 1.6, b: 0.9, late: 0.03 });
    add(10500, () => {
      let u, v;
      do { v = 0.5 + r2() * 0.5; u = 0.2 + r2() * 0.8; } while (u < 0.34 - (v - 0.5) * 0.28 || (inRut(u, v) && r2() < 0.88));
      return [u, v];
    }, { size: 2, big: 0.03, b: 1, late: 0.07 });
    add(1500, () => {
      const v = 0.52 + r2() * 0.48, h = pathHalf(v), side = [-1, 0, 1][Math.floor(r2() * 3)];
      return [0.613 + side * h + (r2() - 0.5) * h * 0.3, v];
    }, { size: 2, b: 1, late: 0.1 });
    const FRAMES = 312;
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const cl = (v) => Math.max(0, Math.min(1, v));
    // The order in which stars appear — the original has four or five in the first 30 frames, a dozen or so by 90, hundreds up to 150, and from 190 it thickens like dust. Stars that appear earlier are bigger and brighter.
    const order = pts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(r2() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((idx, k) => {
      const o = pts[idx];
      o.rank = k / pts.length;
      if (k < 40) (o.star = k < 3 ? 9 + r2() * 9 : 3.5 + r2() * 3.5), (o.b = 0.85 + r2() * 0.15);
    });
    const N = pts.length;
    const shownAt = (p) =>
      p < 0.1 ? (4 * p) / 0.1 / N
      : p < 0.3 ? (4 + (11 * (p - 0.1)) / 0.2) / N
      : p < 0.5 ? (15 + (285 * (p - 0.3)) / 0.2) / N
      : p < 0.62 ? 300 / N + (0.22 - 300 / N) * ((p - 0.5) / 0.12)
      : 0.22 + 0.78 * ease(cl((p - 0.62) / 0.2));
    const drawFrame = (n) => {
      const W = frame.width, H = frame.height;
      pg.fillStyle = "#000"; /* Not skin: black and white mask whose brightness the shader reads as opacity */
      pg.fillRect(0, 0, W, H);
      const p = n / (FRAMES - 1);
      const shown = shownAt(p);
      // Camera pulls back from close to the grape row — centered on (0.55, 0.3) on the sheet, 2.8x (220 cards) → 1.4x (250) → 1x (280)
      const zoom = 1 + 1.8 * (1 - ease(cl((p - 0.6) / 0.3)));
      const fu = 0.55, fv = 0.3;
      pg.fillStyle = "#fff"; /* Not skin: black-and-white mask */
      for (let i = 0; i < pts.length; i++) {
        const o = pts[i];
        if (o.rank >= shown && p < 0.53 + o.d) continue;
        const m = ease(cl((p - 0.53 - o.d) / 0.2));
        const tu = fu + (o.u - fu) * zoom, tv = fv + (o.v - fv) * zoom;
        const X = (o.su + (tu - o.su) * m) * W, Y = (o.sv + (tv - o.sv) * m) * H;
        if (X < -8 || X > W + 8 || Y < -8 || Y > H + 8) continue;
        // Sparkles fixed per section like a pre-drawn section (by section number, not by time). Dust that has not gathered yet is faint
        const a = o.b * (0.75 + 0.25 * Math.sin(n * 0.35 + o.tw)) * (o.rank < 0.0006 ? 1 : 0.55 + 0.45 * m);
        const s = (o.round ? o.size : (1 - m) * o.star + m * o.size) * (1 + (zoom - 1) * 0.35 * m);
        pg.globalAlpha = a;
        if (o.round || (m < 0.5 && o.star > 2.4)) {
          pg.beginPath();
          pg.arc(X, Y, s / 2, 0, 6.2832);
          pg.fill();
        } else pg.fillRect(X, Y, s, s);
      }
      pg.globalAlpha = 1;
    };
    {
      const renderer = new Renderer({ canvas: pc, dpr: Math.min(devicePixelRatio, 1), antialias: true });
      const gl = renderer.gl;
      const flowmap = new Flowmap(gl, { dissipation: 0.8, alpha: 0.3, falloff: 0.4 });
      const tex = new Texture(gl, { generateMipmaps: false, flipY: true });
      const program = new Program(gl, {
        vertex: /* glsl */ `attribute vec2 uv, position; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
        fragment: /* glsl */ `precision highp float;
uniform sampler2D t_video, t_flow; uniform vec3 u_color; uniform vec2 u_resolution, u_texture_size; varying vec2 vUv;
void main(){
  vec3 flow = texture2D(t_flow, vUv).rgb;
  vec2 ratio = vec2(min((u_resolution.x / u_resolution.y) / (u_texture_size.x / u_texture_size.y), 1.), min((u_resolution.y / u_resolution.x) / (u_texture_size.y / u_texture_size.x), 1.));
  vec2 uv = vUv * ratio + (1. - ratio) * .5;
  float a = dot(texture2D(t_video, uv + flow.xy * .05).rgb, vec3(.299, .587, .114));
  gl_FragColor = vec4(u_color * a, a);
}`,
        uniforms: {
          t_video: { value: tex },
          t_flow: flowmap.uniform,
          u_color: { value: MW.rgb("--kf-ink") },
          u_resolution: { value: [1, 1] },
          u_texture_size: { value: [frame.width, frame.height] },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      let cur = -1, prog = 0;
      const size = () => {
        const r = pc.parentElement.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        pc.style.width = pc.style.height = "";
        program.uniforms.u_resolution.value = [r.width, r.height];
        flowmap.aspect = r.width / r.height;
      };
      size();
      MW.on(window, "resize", size);
      const mouse = new Vec2(-1), vel = new Vec2(-1);
      const flowDue = MW.flowClock();
      let last = null;
      const move = (e) => {
        const p = e.changedTouches ? e.changedTouches[0] : e;
        if (!p) return;
        const r = pc.getBoundingClientRect();
        const y = p.clientY - r.top;
        mouse.set(p.clientX / gl.renderer.width, 1 - y / gl.renderer.height);
        const now = performance.now();
        if (!last) last = { x: p.clientX, y, t: now };
        const dt = Math.max(10.4, now - last.t);
        vel.set(-(p.clientX - last.x) / dt, -(y - last.y) / dt);
        last = { x: p.clientX, y, t: now };
      };
      // Original: touch devices listen to touchstart · touchmove only, otherwise mousemove only (phone width turns both off)
      if (!isMobile && !reduced) {
        if ("ontouchstart" in window) (MW.on(window, "touchstart", move, { passive: true }), MW.on(window, "touchmove", move, { passive: true }));
        else MW.on(window, "mousemove", move);
      }
      // The original c-points is a repeating scroll item, so is-inview is added while inside the range
      ScrollTrigger.create({ trigger: $("#pointsSequenceTarget"), start: "top center", end: "bottom bottom", toggleClass: { targets: pc.parentElement, className: "is-inview" }, onUpdate: (st) => (prog = st.progress) });
      let vis = false;
      const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
      io.observe(pc);
      MW.tick(() => {
        if (!vis) return;
        const n = Math.max(0, Math.min(FRAMES - 1, Math.floor(prog * (FRAMES - 1))));
        if (n !== cur) {
          cur = n;
          drawFrame(n);
          tex.image = frame;
          tex.needsUpdate = true;
        }
        if (!reduced && flowDue()) {
          flowmap.mouse.copy(mouse);
          flowmap.velocity.lerp(vel, vel.len() ? 0.15 : 0.1);
          flowmap.update();
        }
        renderer.render({ scene: mesh });
      });
      offs.push(() => (io.disconnect(), gl.getExtension("WEBGL_lose_context")?.loseContext()));
    }
    $(".mw-points__overlay").dataset.target = "#pointsOverlayTarget";
    MW.progressCss($(".mw-points__overlay"), { start: "top bottom", end: "bottom bottom" });

    // ---------- Tagline ----------
    $$(".mw-tagline").forEach((tg) => {
      const wrap = $(".mw-tagline__image-wrap", tg);
      ScrollTrigger.create({ trigger: tg, start: "top -50%", end: "bottom top", toggleClass: { targets: wrap, className: "is-inview" } });
      $$(".mw-tagline__image, .mw-tagline__ring, .mw-tagline__white", tg).forEach((el) => MW.progressCss(el));
      $$("[data-step]", tg).forEach((box) => {
        const step = c.querySelector(box.dataset.step);
        const anims = $$(".mw-split", box).map((el) => MW.splitIn(el));
        if (reduced) return;
        // Original SplitTitle.trigger: on enter, restores outside values and starts from the beginning, on leave, unconditionally playHide (even mid-appearance)
        const show = () => anims.forEach((a) => (a.enter ? a.enter() : a.tl.restart(true)));
        const hide = () => anims.forEach((a) => a.hide.restart(true));
        ScrollTrigger.create({ trigger: step, start: "top bottom", end: "bottom bottom", toggleClass: { targets: box, className: "is-inview" }, onEnter: show, onEnterBack: show, onLeave: hide, onLeaveBack: hide });
      });
    });

    // ---------- Smoke boundary (original shader1~6) ----------
    $$(".mw-shader-wrap").forEach(MW.scrollShader);

    // ---------- Three-line text (original TriText: each text has its own range top bottom ~ bottom top, repeating) ----------
    $$(".mw-tri .mw-split").forEach((el) => MW.splitOnScroll(el, { repeat: true }));

    // ---------- Cropped photos, grape berries, parallax ----------
    $$(".mw-clip__item").forEach((it) => {
      ScrollTrigger.create({ trigger: it, start: "top 95%", end: "bottom 5%", toggleClass: "is-inview" });
    });
    $$("[data-from][data-to]").forEach((el) => !reduced && MW.parallax(el));
    $$(".mw-fancy").forEach(MW.fancy);
    $$(".mw-contrast").forEach((el) => {
      MW.progressCss(el, { start: "top bottom", end: "top 25%" });
      // Original photos are loaded lazily when near the screen and get a class — placeholders also get is-loaded once on first entry
      const img = el.querySelector(".mw-img");
      img && ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => img.classList.add("is-loaded") });
    });

    // ---------- Three people ----------
    $$(".mw-member").forEach((m) => {
      const img = $(".mw-member__image", m);
      if (img.dataset.target) MW.progressCss(img);
      const h = $("h3", m);
      h.classList.add("mw-anim-simple");
      ScrollTrigger.create({ trigger: h, start: "top 85%", onEnter: () => h.classList.add("is-inview") });
      $$(".mw-split", m).forEach((el) => MW.splitOnScroll(el, { start: "top 85%" }));
    });

    return () => offs.forEach((f) => f());
  };
})();
