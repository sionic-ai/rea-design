// Smoke curtain: Brand smoke shader values — fbm 7 layers (amplitude .5 · frequency 1 · gain .45), two domain warps, edge smoothstep .1,
// Flow map decay .99, strength 1, radius .3, push ×.05, mouse velocity = -travel/time (min 10.4ms) · follow .15 (.1 when it stops), canvas pixel ratio ≤1 · long side 1800.
(() => {
  const VERT = "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}";
  const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D t_flow, t_start, t_end;
uniform vec2 u_res, u_start_size, u_end_size;
uniform float u_time, u_progress, u_alpha, u_seed, u_amp, u_has_start, u_has_end, u_clear;
uniform vec3 u_from, u_to, u_light;
vec2 grad(vec2 p){ float h = fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453) * 6.2831853; return vec2(cos(h), sin(h)); }
float snoise(vec2 p){
  const float F = .366025404, G = .211324865;
  vec2 i = floor(p + (p.x + p.y) * F), a = p - i + (i.x + i.y) * G;
  vec2 o = a.x > a.y ? vec2(1., 0.) : vec2(0., 1.), b = a - o + G, c = a - 1. + 2. * G;
  vec3 w = max(.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.); w = w * w; w = w * w;
  return 70. * dot(w, vec3(dot(a, grad(i)), dot(b, grad(i + o)), dot(c, grad(i + 1.))));
}
float fbm(vec2 p){
  float v = 0., amp = u_amp, f = 1.;
  for (int k = 0; k < 7; k++) { v += amp * snoise(p * f); f *= 2.; amp *= .45; }
  return v / max((1. - pow(.45, 7.)) / .55, .5);
}
vec2 cover(vec2 uv, vec2 size){
  float sa = u_res.x / u_res.y, ia = size.x / size.y;
  uv -= .5;
  if (sa > ia) uv.y /= sa / ia; else uv.x /= ia / sa;
  return uv + .5;
}
void main(){
  vec3 flow = texture2D(t_flow, vUv).rgb;
  float asp = u_res.x / u_res.y;
  vec2 c = vUv - .5;
  if (asp > 1.) c.x *= asp; else c.y /= asp;
  vec2 uv = (c + .5) * .5 + flow.xy * .05;
  float t = u_time;
  vec2 nd = vec2(snoise(vec2(u_seed, u_seed * .1)), snoise(vec2(u_seed, 123.456 + u_seed * .1)));
  vec2 dir = normalize(mix(vec2(.707), nd / max(length(nd), .2), .7));
  vec2 drift = dir * t * .5;
  float n1 = fbm(uv + drift + vec2(cos(t * .7 + u_seed), sin(t * .9 + u_seed)) * .3 + u_seed * .1);
  float n2 = fbm(uv + vec2(43.235, 21.123) + u_seed * .1 - drift * .8 + vec2(sin(t * .5 + u_seed), cos(t * .3 + u_seed)) * .2);
  float n = fbm(uv + vec2(n1, n2) * 2. + u_seed * .05);
  n = pow(max(n * .5 + .5, 0.), 1.5) * 2. - 1.;
  float m;
  if (u_progress <= 1.) {
    float cut = mix(1., -1., u_progress);
    m = smoothstep(cut - .1, cut + .1, (1. - vUv.y) + n);
    if (u_progress <= .001) m = 0.;
  } else {
    float cut = mix(-1., 1., u_progress - 1.);
    m = smoothstep(cut - .1, cut + .1, vUv.y + n);
  }
  vec3 a = u_from, b = u_to;
  if (u_has_start > .5) a = mix(u_from, texture2D(t_start, cover(vUv + flow.xy * .05, u_start_size)).rgb, 1. - m);
  if (u_has_end > .5) b = mix(u_to, texture2D(t_end, cover(vUv + flow.xy * .05, u_end_size)).rgb, m);
  vec3 col; float base;
  if (u_clear > .5) { col = b; base = m; } else { col = mix(a, b, m); base = 1.; }
  if (u_alpha > 1.) { float over = u_alpha - 1.; col = clamp(mix(col * (1. + over * 1.5), u_light, over * .5), 0., 1.); }
  float ac = mix(2., -2., min(u_alpha, 1.));
  gl_FragColor = vec4(col, smoothstep(ac - .5, ac + .5, n * 2.) * base);
}`;

  // Paint the skin variables (including color mixing and oklch) and read them as [r,g,b]
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (v) => {
    const el = document.createElement("i");
    el.style.color = v.startsWith("--") ? `var(${v})` : v;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  let scrollVelocity = 0, lastY = scrollY, lastT = performance.now();

  kfFx.register("smoke-veil", (el, { options, reduce, hover, scroller }) => {
    if (!window.OGL || !window.gsap) return;
    const { Renderer, Program, Mesh, Triangle, Flowmap, Vec2, Texture } = OGL;
    const onHover = options.on === "hover";
    if (onHover && !hover) return;
    const from = options.from || (onHover ? "transparent" : "--kf-bg");
    const to = options.to || "--kf-ink";
    const max = +(options.max ?? 1);
    const alpha0 = +(options.alpha ?? 1);
    const fill = +(options.fill ?? 0.9);
    const dur = reduce ? 0 : +(options.dur ?? 1.6);
    const speed = +(options.speed ?? (onHover ? 0.05 : 0.01));

    const stage = document.createElement("div");
    stage.className = "fx-smoke-veil__stage" + (onHover ? " -hover" : "");
    stage.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    stage.append(canvas);
    el.prepend(stage);

    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 1), antialias: true, alpha: true });
    const gl = renderer.gl;
    const flowmap = new Flowmap(gl, { dissipation: 0.99, alpha: 1, falloff: 0.3 });
    const empty = new Texture(gl);
    const imgTex = (part) => {
      const img = el.querySelector(`[data-fx-part="${part}"]`);
      if (!img) return null;
      const t = new Texture(gl, { generateMipmaps: false });
      t.size = [1, 1];
      const set = () => img.naturalWidth && ((t.image = img), (t.size = [img.naturalWidth, img.naturalHeight]));
      img.complete ? set() : img.addEventListener("load", set, { once: true });
      return t;
    };
    const st = imgTex("start-image"), et = imgTex("end-image");
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      uniforms: {
        t_flow: flowmap.uniform,
        t_start: { value: st || empty },
        t_end: { value: et || empty },
        u_res: { value: [1, 1] },
        u_start_size: { value: [1, 1] },
        u_end_size: { value: [1, 1] },
        u_time: { value: 0 },
        u_progress: { value: 0 },
        u_alpha: { value: options.fade === "on" ? 0 : alpha0 },
        u_seed: { value: Math.random() * 1000 },
        u_amp: { value: 0.5 },
        u_has_start: { value: st ? 1 : 0 },
        u_has_end: { value: et ? 1 : 0 },
        u_clear: { value: from === "transparent" ? 1 : 0 },
        u_from: { value: from === "transparent" ? [0, 0, 0] : rgb(from) },
        u_to: { value: rgb(to) },
        u_light: { value: rgb("--kf-contrast-bg") },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;
    const state = { progress: 0 };

    let bcr = stage.getBoundingClientRect();
    const resize = () => {
      bcr = stage.getBoundingClientRect();
      if (!bcr.width || !bcr.height) return;
      const asp = bcr.width / bcr.height;
      let w = bcr.width, h = bcr.height;
      if (w > 1800) (w = 1800), (h = 1800 / asp);
      if (h > 1800) (h = 1800), (w = 1800 * asp);
      renderer.setSize(w, h);
      canvas.style.width = canvas.style.height = "";
      flowmap.aspect = asp;
      u.u_res.value = [w, h];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const mouse = new Vec2(0, 0), vel = new Vec2(-1, -1);
    let last = null;
    const move = (e) => {
      const r = stage.getBoundingClientRect();
      const x = e.clientX - (onHover ? r.left : 0), y = e.clientY - r.top;
      mouse.set(x / (bcr.width || 1), 1 - y / (bcr.height || 1));
      const now = performance.now();
      if (!last) last = { x, y, t: now };
      const dt = Math.max(10.4, now - last.t);
      vel.set(-(x - last.x) / dt, -(y - last.y) / dt);
      last = { x, y, t: now };
    };
    if (hover) addEventListener("mousemove", move, { passive: true });

    const kills = [];
    if (onHover) {
      const enter = () => gsap.to(state, { progress: fill, duration: dur, ease: "power2.out", overwrite: true });
      const leave = () => gsap.to(state, { progress: 0, duration: dur, ease: "power1.out", overwrite: true });
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      kills.push(() => (el.removeEventListener("pointerenter", enter), el.removeEventListener("pointerleave", leave), gsap.killTweensOf(state)));
    } else if (window.ScrollTrigger) {
      const mm = gsap.matchMedia();
      mm.add("all", () => {
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start: options.start || "top top",
          end: options.end || "bottom bottom",
          onUpdate: (s) => (state.progress = s.progress * max),
        });
        if (options.fade === "on")
          ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "top top", onUpdate: (s) => (u.u_alpha.value = s.progress * alpha0) });
      });
      kills.push(() => mm.revert());
    }

    let visible = false, cleared = false, mult = 1;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(stage);
    const t0 = performance.now();
    const tick = () => {
      if (!visible) return;
      if (onHover && state.progress <= 0) {
        if (cleared) return;
        cleared = true;
      } else cleared = false;
      if (st && st.size) u.u_start_size.value = st.size;
      if (et && et.size) u.u_end_size.value = et.size;
      u.u_time.value = reduce ? 0 : ((performance.now() - t0) / 1000) * speed;
      u.u_progress.value = state.progress;
      if (options.velocity === "on") {
        const now = performance.now(), y = scroller ? scroller.scrollTop : scrollY;
        scrollVelocity = (y - lastY) / Math.max(1, now - lastT) * 16;
        lastY = y;
        lastT = now;
        mult += (1 + Math.abs(scrollVelocity) * 0.05 * state.progress * 2 - mult) * 0.05;
        u.u_amp.value = Math.min(1.5, 0.5 * mult);
      }
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(vel, vel.len() ? 0.15 : 0.1);
      flowmap.update();
      renderer.render({ scene: mesh });
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      kills.forEach((k) => k());
      io.disconnect();
      ro.disconnect();
      removeEventListener("mousemove", move);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      stage.remove();
    };
  });
})();
