// About hero holographic video (original HolographicVideo, three) — laid across the whole hero at 16:9 contain and overlaps the mist with lighten.
// Cursor reaction (original values): 10 past cursor positions (shifted one slot every frame, strength .83^i, radius .8) produce fluid distortion .062 and color split .025 — .45s power2.out on entering, .6s power2.inOut on leaving.
// Cursor speed energy (per-frame movement × 25, rises .25 · falls .05 per frame) boosts rainbow sheen .64 · edge color split ×(1+.76E) · scanlines · opacity ×(1+.2E). Parallax .088 follows at .05 per frame.
// Video content is a placeholder — a rainbow orb on a black background drawn with a shader (when a real video is added, replace the picture() slot with a texture).
(() => {
  const THREE = window.THREE, PS = window.PS;
  const host = document.querySelector("[data-holo]");
  if (!THREE || !PS || !host) return;
  // On phones (≤768) the original has one poster without a canvas — the copy also draws just one
  const still = PS.reduce || matchMedia("(max-width: 768px)").matches;
  const root = host.closest("section") || host;
  const N = 10;

  const FRAG = `
    precision highp float;
    #define PI 3.14159265
    uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime; uniform float uClip; uniform float uHover; uniform float uEnergy; uniform float uReact;
    uniform vec2 uTrail[${N}]; uniform vec3 uPal[5];
    varying vec2 vUv;
    vec2 g2(vec2 p){ float a = fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.7) * 6.2831853; return vec2(cos(a), sin(a)); }
    float gn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      float a = dot(g2(i), f), b = dot(g2(i + vec2(1, 0)), f - vec2(1, 0)), c = dot(g2(i + vec2(0, 1)), f - vec2(0, 1)), d = dot(g2(i + vec2(1, 1)), f - vec2(1, 1));
      return 1.4 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y); }
    vec3 pal(float t){ t = clamp(t, 0.0, 1.0) * 4.0;
      vec3 c = mix(uPal[0], uPal[1], clamp(t, 0.0, 1.0)); c = mix(c, uPal[2], clamp(t - 1.0, 0.0, 1.0));
      c = mix(c, uPal[3], clamp(t - 2.0, 0.0, 1.0)); return mix(c, uPal[4], clamp(t - 3.0, 0.0, 1.0)); }
    // Placeholder video — like the original video, an iridescent blob looping every 4s (diameter ≈ .69 of frame height). The top left edge glows green and teal, and,
    // The rim distorts, the light direction wavers, and orange light rises and fades on the left. It changes a lot even when the video is still, so cursor response gets buried, same as the original
    vec3 picture(vec2 uv){
      vec2 px = uv * uRes;
      float fh = min(uRes.y, uRes.x * 9.0 / 16.0);
      vec2 fp = (px - uRes * 0.5) / fh;
      if (abs(fp.x) > 0.8889 || abs(fp.y) > 0.5) return vec3(0.0);
      float ph = uClip * PI * 0.5;
      vec2 c = fp - vec2(-0.03 + 0.03 * sin(ph), 0.02 + 0.02 * cos(ph));
      float ang = atan(c.y, c.x);
      float r = length(c) / (0.345 * (1.0 + 0.12 * sin(2.0 * ang + ph) + 0.07 * sin(3.0 * ang - 2.0 * ph)));
      vec2 n = c / max(length(c), 1e-4);
      float la = 2.1 + 0.6 * sin(ph);
      float lit = max(dot(n, vec2(cos(la), sin(la))), 0.0);
      float inside = smoothstep(1.02, 0.8, r);
      vec2 wp = fp - vec2(-0.2, -0.03);
      vec3 warm = uPal[1] * 0.55 * exp(-dot(wp, wp) / 0.018) * pow(0.5 + 0.5 * sin(ph - 1.2), 2.0);
      float flow = ang * 2.0 + r * 9.0 - ph * 2.0 + gn(c * 3.5 + vec2(sin(ph), cos(ph)) * 0.6) * 1.6;
      float bands = 0.5 + 0.5 * sin(flow);
      float lines = pow(1.0 - abs(sin(flow * 0.5 + 0.7)), 14.0);
      float cap = pow(lit, 2.0) * smoothstep(0.2, 0.9, r);
      float rim = exp(-pow((r - 0.95) / 0.09, 2.0));
      vec3 capCol = mix(uPal[2], uPal[3], pow(lit, 5.0) * 0.6);
      vec3 rimCol = mix(uPal[4], uPal[0], 0.5 + 0.5 * sin(ang * 1.5 + 1.0));
      return inside * (capCol * 1.25 * cap * (0.75 + 0.25 * bands) + mix(uPal[4], uPal[2], lit) * lines * 0.16 * (0.25 + lit))
           + rim * mix(rimCol * 0.22, capCol * 0.8, pow(lit, 1.5)) + warm;
    }
    void main(){
      vec2 fromC = (vUv - 0.5) * uRes;
      float r = clamp(length(fromC) / length(uRes * 0.5), 0.0, 1.0);
      vec2 dir = normalize(fromC + 1e-4);
      vec2 par = (uMouse - 0.5) * 0.088 * (1.0 - r * 0.4);
      vec2 bar = -dir * 0.13 * uReact * pow(r, 1.6) * 0.18;
      vec2 asp = vec2(uRes.x / uRes.y, 1.0);
      float tot = 0.0;
      for (int i = 0; i < ${N}; i++) {
        float f = 1.0 - smoothstep(0.0, 0.8, length((vUv - uTrail[i]) * asp));
        tot += f * f * pow(0.83, float(i));
      }
      float hov = clamp(tot, 0.0, 1.0) * uHover;
      vec2 nuv = vUv * 2.8 + vec2(uTime * 0.33, -uTime * 0.33 * 0.7);
      vec2 fl = vec2(gn(nuv), gn(nuv + vec2(13.7, 9.1)));
      vec2 uv = vUv + bar + par + fl * 0.062 * (1.0 + 0.04 * uEnergy) * hov;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
      vec2 off = dir * 0.04 * r * r * (1.0 + 0.76 * uEnergy) + fl * 0.025 * (1.0 + 1.5 * uEnergy) * hov;
      vec3 col = vec3(picture(uv + off).r, picture(uv).g, picture(uv - off).b);
      vec3 sheen = pal(0.5 + 0.5 * gn(vUv * 3.45 + vec2(uTime * 0.188, -uTime * 0.188 * 1.2)));
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, col * 0.4 + sheen * 1.5, min(smoothstep(0.05, 0.7, lum) * 0.64 * uReact * uEnergy, 1.0));
      col *= mix(1.0, sin(vUv.y * uRes.y * (PI / 5.6)) * 0.5 + 0.5, 0.14 * uReact);
      // The original overlays the fog with lighten — even when the header is pinned and the blend context breaks, dark areas must not cover the fog, so opacity follows brightness (premultiplied alpha)
      vec3 o = col * min(0.86 * uReact, 1.0);
      gl_FragColor = vec4(o, clamp(max(max(o.r, o.g), o.b), 0.0, 1.0));
    }`;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.append(renderer.domElement);
  const trail = Array.from({ length: N }, () => new THREE.Vector2(0.5, 0.5));
  const U = {
    uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uTime: { value: 0 }, uClip: { value: 0 },
    uHover: { value: 0 }, uEnergy: { value: 0 }, uReact: { value: 1 }, uTrail: { value: trail },
    // Original gloss palette order (magenta, red, green, cyan, blue) — the noise midpoint is green, so over a green head the gloss only changes the grain
    uPal: { value: ["--site-magenta", "--site-red", "--site-green", "--site-cyan", "--site-electric"].map((n) => new THREE.Vector3(...PS.cssColor(n))) },
  };
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG,
  })));
  const cam = new THREE.Camera();
  renderer.compile(scene, cam);
  const size = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    U.uRes.value.set(w, h);
  };
  size();
  addEventListener("resize", () => { size(); if (still) renderer.render(scene, cam); });
  if (still) { renderer.render(scene, cam); return; }

  const P = { x: 0.5, y: 0.5 }, F = { x: 0.5, y: 0.5 }, B = { x: 0.5, y: 0.5 }, hover = { v: 0 };
  let energy = 0;
  const at = (e) => {
    const b = host.getBoundingClientRect();
    P.x = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
    P.y = Math.min(1, Math.max(0, 1 - (e.clientY - b.top) / b.height));
  };
  root.addEventListener("mousemove", at);
  root.addEventListener("mouseenter", (e) => { at(e); B.x = P.x; B.y = P.y; gsap.to(hover, { v: 1, duration: 0.45, ease: "power2.out", overwrite: true }); });
  root.addEventListener("mouseleave", () => gsap.to(hover, { v: 0, duration: 0.6, ease: "power2.inOut", overwrite: true }));

  let on = true, raf = 0, last = 0;
  // The original moves values per frame (60fps basis) — converted to frame counts so speed stays the same at any refresh rate
  const ease = (a, f) => 1 - Math.pow(1 - a, f);
  const loop = (t) => {
    const f = last ? Math.min(3, (t - last) / (1000 / 60)) : 1;
    last = t;
    F.x += (P.x - F.x) * ease(0.05, f); F.y += (P.y - F.y) * ease(0.05, f);
    for (let i = N - 1; i > 0; i--) trail[i].copy(trail[i - 1]);
    trail[0].set(F.x, F.y);
    const d = Math.hypot(P.x - B.x, P.y - B.y) / f;
    B.x = P.x; B.y = P.y;
    const target = Math.min(d * 25, 1);
    energy += (target - energy) * ease(target > energy ? 0.25 : 0.05, f);
    U.uMouse.value.set(F.x, F.y);
    U.uTime.value += 0.01 * f;
    U.uClip.value = (U.uClip.value + f / 60) % 4;
    U.uHover.value = hover.v;
    U.uEnergy.value = energy;
    U.uReact.value = 1 + 0.2 * energy;
    renderer.render(scene, cam);
    raf = on ? requestAnimationFrame(loop) : 0;
  };
  new IntersectionObserver(([en]) => {
    on = en.isIntersecting;
    if (on && !raf) { last = 0; raf = requestAnimationFrame(loop); }
  }).observe(host);
})();
