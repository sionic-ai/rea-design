// Turns a full-screen image panel with WebGL — a circular boundary spreading from the center outward, mixed with fine noise (sparkle), fills in the next image.
// Artwork is a child [data-fx-part=slide](img·canvas) is where it reads from. When a transition starts and ends, fx:slide-start and fx:slide-end are fired on the element so side devices like a list can follow along
(() => {
  const VERT = "varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `precision highp float;
uniform sampler2D uA; uniform sampler2D uB; uniform vec2 uRes; uniform vec2 uImg;
uniform float uP; uniform float uT; uniform float uZoom; uniform float uFreq;
varying vec2 vUv;
vec2 cover(vec2 uv){ float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y; vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0); return (uv - 0.5) * s + 0.5; }
vec3 grad(vec3 p){ p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453) * 2.0 - 1.0; }
float corner(vec3 i, vec3 f, vec3 o){ return dot(grad(i + o), f - o); }
float noise(vec3 p){
  vec3 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = mix(corner(i, f, vec3(0,0,0)), corner(i, f, vec3(1,0,0)), u.x), b = mix(corner(i, f, vec3(0,1,0)), corner(i, f, vec3(1,1,0)), u.x);
  float c = mix(corner(i, f, vec3(0,0,1)), corner(i, f, vec3(1,0,1)), u.x), d = mix(corner(i, f, vec3(0,1,1)), corner(i, f, vec3(1,1,1)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}
void main(){
  float breathe = (sin(uT * 0.2) + 1.0) * 0.5;
  vec2 uv = vUv * (1.0 - uZoom * breathe);
  uv.y += uZoom * breathe;
  vec2 c = cover(uv);
  vec2 warped = c + noise(vec3(c * 0.75, uT * 0.01));
  float edge = noise(vec3(warped * uFreq, sin(uT))) + distance(c, vec2(0.5)) * 2.0 - 3.0 * uP + 1.5;
  float k = 1.0 - smoothstep(0.2, 0.8, clamp(edge, 0.0, 1.0));
  gl_FragColor = mix(texture2D(uA, c), texture2D(uB, c), k);
}`;
  kfFx.register("noise-dissolve-slides", (el, { options, reduce }) => {
    const T = window.THREE;
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!T || !slides.length) return;
    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(document.createElement("canvas"));
    const auto = +(options.auto ?? 3), dur = +(options.dur ?? 1.5), userDur = +(options["user-dur"] ?? 1.3);
    const ease = kfFx.ease(options.ease || "power1.inOut", "power1.inOut");
    const narrow = matchMedia("(max-width: 834px)");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const tex = slides.map((s) => {
      const t = s.tagName === "IMG" ? new T.Texture(s) : new T.CanvasTexture(s);
      // The shader does no color space conversion, so it reads image values as they are and outputs them as they are (decoding as sRGB makes it darker)
      t.colorSpace = T.NoColorSpace;
      if (s.tagName !== "IMG" || s.complete) t.needsUpdate = true;
      else s.addEventListener("load", () => (t.needsUpdate = true), { once: true });
      return t;
    });
    const u = {
      uA: { value: tex[0] }, uB: { value: tex[Math.min(1, tex.length - 1)] }, uRes: { value: new T.Vector2(1, 1) }, uImg: { value: new T.Vector2(2048, 1152) },
      uP: { value: 0 }, uT: { value: 0 }, uZoom: { value: 0.13 }, uFreq: { value: +(options.grain ?? 200) },
    };
    const scene = new T.Scene(), cam = new T.Camera();
    const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG }));
    scene.add(mesh);
    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      u.uRes.value.set(w, h);
      // The original uses a 2048×1152 image with zoom breathing .13 for wide screens, and a 1024×1920 image with .2 for narrow screens
      u.uImg.value.set(...(narrow.matches ? [1024, 1920] : [2048, 1152]));
      u.uZoom.value = reduce ? 0 : narrow.matches ? +(options["zoom-narrow"] ?? 0.2) : +(options.zoom ?? 0.13);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let index = 0, busy = false, timer = 0, started = !options.wait;
    const t0 = performance.now();
    // While waiting (covered by the opening curtain) only the first scene is drawn and not redrawn every frame — drawing the covered screen continuously makes the curtain’s motion drop frames
    const draw = () => { u.uT.value = reduce ? 0 : (performance.now() - t0) / 1000; renderer.render(scene, cam); };
    const run = () => gsap.ticker.add(draw);
    if (started) run();
    else draw();
    const schedule = () => { clearTimeout(timer); if (started && auto > 0 && !reduce) timer = setTimeout(() => go(1), auto * 1000); };
    const go = (dir = 1, d = dur, e = ease) => {
      if (busy || tex.length < 2) return;
      busy = true;
      clearTimeout(timer);
      const next = (index + dir + tex.length) % tex.length;
      u.uA.value = tex[index];
      u.uB.value = tex[next];
      u.uP.value = 0;
      el.dispatchEvent(new CustomEvent("fx:slide-start", { detail: { from: index, to: next, dir, dur: d } }));
      gsap.to(u.uP, { value: 1, duration: reduce ? 0 : d, ease: e, onComplete: () => {
        index = next;
        u.uA.value = tex[index];
        u.uP.value = 0;
        busy = false;
        el.dispatchEvent(new CustomEvent("fx:slide-end", { detail: { index } }));
        schedule();
      } });
    };
    el.fxSlides = { go: (dir) => go(dir, userDur, kfFx.ease(options["user-ease"] || "power1.inOut", "power1.inOut")), get index() { return index; }, count: tex.length };
    const onWheel = (e) => { if (busy) return; const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY); el.fxSlides.go((dx ? e.deltaX : e.deltaY) > 0 ? 1 : -1); };
    let sx = 0, sy = 0, down = false;
    const onDown = (e) => { down = true; sx = e.clientX; sy = e.clientY; };
    const onUp = (e) => {
      if (!down) return;
      down = false;
      const dx = e.clientX - sx, dy = e.clientY - sy, m = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(m) > 40) el.fxSlides.go(m < 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    const begin = () => { started = true; run(); schedule(); };
    if (options.wait) document.addEventListener(options.wait, begin, { once: true });
    schedule();
    return () => {
      clearTimeout(timer);
      gsap.ticker.remove(draw);
      gsap.killTweensOf(u.uP);
      ro.disconnect();
      if (options.wait) document.removeEventListener(options.wait, begin);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      tex.forEach((t) => t.dispose());
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
      delete el.fxSlides;
    };
  });
})();
