(() => {
  // Original mist field effect: a version that renders a 3D noise cloud by ray marching (resolution .5 · max 520k pixels · speed .35 · tint · accent .45 · five palettes).
  // The part layers two domain-warp fbm passes like depth to give the same grain — a marble like a central iris (form), stage light shafts (shafts), a cursor tail (radius .1),
  // Inhale · vortex · rise in the last section (fx:mood event detail {inhale, swirl, lift, end}), rises from the background over the first 2s power1.out.
  const FRAG = `
    precision highp float;
    uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec2 uVel; uniform float uTravel;
    uniform vec3 uBg; uniform vec3 uTint; uniform vec3 uPal[5]; uniform float uAccent; uniform float uForm; uniform float uShafts;
    uniform vec3 uFx; uniform float uEnd; uniform float uDim;
    varying vec2 vUv;
    float h31(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vnoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
    void main(){
      float asp = uRes.x / uRes.y;
      vec2 uv = (vUv - 0.5) * vec2(asp, 1.0);
      vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
      float t = uTime;
      float sw = uFx.y * 1.6 * exp(-dot(uv, uv) * 1.4);
      uv = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * uv;
      uv *= 1.0 + uFx.x * 0.35 * exp(-dot(uv, uv));
      vec3 p = vec3(uv * 1.35 + (uMouse - 0.5) * 0.06, t * 0.06);
      p.y -= uTravel * 0.35;
      vec2 dm = uv - m;
      float wake = exp(-dot(dm, dm) / 0.02);
      p.xy -= uVel * wake * 0.25;
      vec2 q = vec2(fbm(p + vec3(0.0, 0.0, t * 0.05)), fbm(p + vec3(5.2, 1.3, -t * 0.04)));
      float d1 = fbm(p + vec3(q * 1.8, 0.0));
      float d2 = fbm(p * 0.55 + vec3(q.yx * 1.2, 3.7) + vec3(0.0, 0.0, t * 0.03));
      float dens = smoothstep(0.32, 0.92, d1 * 0.62 + d2 * 0.55);
      float r = length(uv * vec2(1.0, 1.08));
      float orb = smoothstep(0.62, 0.12, r) * (0.55 + 0.45 * smoothstep(0.05, 0.3, r));
      float ring = exp(-pow((r - 0.33) / 0.07, 2.0));
      dens = mix(dens, max(dens, orb * (0.6 + 0.6 * d1) + ring * 0.35 * d2), uForm);
      dens += wake * 0.35 * (0.4 + d1);
      if (uShafts > 0.0) {
        vec2 o = uv - vec2(0.0, 0.95);
        float ang = atan(o.x, -o.y);
        float rays = pow(abs(sin(ang * 5.0 + 0.6 + sin(t * 0.07) * 0.3)), 18.0) + 0.6 * pow(abs(sin(ang * 3.0 - 0.4)), 26.0);
        dens += rays * smoothstep(1.9, 0.2, length(o)) * uShafts * (0.35 + d2 * 0.9);
      }
      float sel = fbm(vec3(uv * 0.6 + 7.0, t * 0.02)) * 4.999;
      int k = int(floor(sel));
      vec3 pc = uPal[0];
      if (k == 1) pc = uPal[1]; else if (k == 2) pc = uPal[2]; else if (k == 3) pc = uPal[3]; else if (k == 4) pc = uPal[4];
      vec3 cloud = mix(uTint, pc, uAccent * smoothstep(0.35, 0.95, d2) * 0.8);
      cloud = mix(cloud, mix(uPal[1], uPal[0], d1), uEnd * 0.55 * smoothstep(0.2, 0.8, d2));
      cloud = mix(cloud, mix(uPal[4], uPal[0], smoothstep(-0.4, 0.6, uv.x)), uFx.z * 0.3);
      vec3 col = uBg + cloud * pow(dens, 1.6) * (0.42 + uEnd * 0.25 + uFx.z * 0.2);
      col *= mix(1.0, smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(asp * 0.8, 1.0))), 0.6);
      gl_FragColor = vec4(mix(uBg, col, uDim), 1.0);
    }`;

  kfFx.register("mist-orb-bg", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" }); } catch { return; }
    el.appendChild(renderer.domElement);
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.appendChild(probe);
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    px.canvas.width = px.canvas.height = 1;
    const rgb = (v) => { probe.style.color = `var(${v})`; px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return new T.Vector3(d[0] / 255, d[1] / 255, d[2] / 255); };
    const U = {
      uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uVel: { value: new T.Vector2() }, uTravel: { value: 0 },
      uBg: { value: rgb("--fx-mist-bg") }, uTint: { value: rgb("--fx-mist-tint") }, uPal: { value: [1, 2, 3, 4, 5].map((i) => rgb(`--fx-mist-${i}`)) },
      uAccent: { value: +(options.accent ?? 0.45) }, uForm: { value: +(options.form ?? 1) }, uShafts: { value: +(options.shafts ?? 0) * 0.85 },
      uFx: { value: new T.Vector3() }, uEnd: { value: 0 }, uDim: { value: 0 },
    };
    const geo = new T.PlaneGeometry(2, 2);
    const mat = new T.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG, depthTest: false });
    const scene = new T.Scene();
    scene.add(new T.Mesh(geo, mat));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const res = +(options.resolution ?? 0.5), maxPx = +(options.max || 520000), speed = +(options.speed ?? 0.35);
    let pr = res;
    const size = () => {
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      pr = Math.min(res, Math.sqrt(maxPx / (w * h)));
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      U.uRes.value.set(w * pr, h * pr);
      if (reduce) renderer.render(scene, cam);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0 };
    const move = (e) => { const b = el.getBoundingClientRect(); mouse.tx = (e.clientX - b.left) / Math.max(1, b.width); mouse.ty = 1 - (e.clientY - b.top) / Math.max(1, b.height); };
    addEventListener("pointermove", move, { passive: true });
    const mood = (e) => {
      const d = e.detail || {};
      gsap.to(U.uFx.value, { x: +(d.inhale ?? 0), y: +(d.swirl ?? 0), z: +(d.lift ?? 0), duration: 0.8, ease: "power2.out", overwrite: true });
      if (d.end !== undefined) U.uEnd.value = +d.end;
    };
    el.addEventListener("fx:mood", mood);
    const intro = gsap.to(U.uDim, { value: 1, duration: reduce ? 0 : +(options.intro ?? 2), ease: "power1.out", onUpdate: () => reduce && renderer.render(scene, cam) });
    let last = 0, raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(loop); });
    io.observe(el);
    function loop(now) {
      raf = 0;
      if (!last) last = now;
      const dt = Math.max(1, now - last) / 1000;
      last = now;
      const k = 1 - Math.exp(-Math.min(dt, 0.05) * 6);
      const nx = mouse.x + (mouse.tx - mouse.x) * k, ny = mouse.y + (mouse.ty - mouse.y) * k;
      mouse.vx = mouse.vx * 0.9 + ((nx - mouse.x) / dt) * 0.004;
      mouse.vy = mouse.vy * 0.9 + ((ny - mouse.y) / dt) * 0.004;
      mouse.x = nx; mouse.y = ny;
      U.uMouse.value.set(nx, ny);
      U.uVel.value.set(mouse.vx, mouse.vy);
      U.uTime.value += Math.min(dt, 0.05) * speed * 2.2;
      U.uTravel.value += (scrollY / innerHeight - U.uTravel.value) * 0.08;
      renderer.render(scene, cam);
      if (visible) raf = requestAnimationFrame(loop);
    }
    if (reduce) renderer.render(scene, cam);
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      intro.kill();
      gsap.killTweensOf(U.uFx.value);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", move);
      el.removeEventListener("fx:mood", mood);
      geo.dispose(); mat.dispose(); renderer.dispose();
      renderer.domElement.remove();
      probe.remove();
    };
  });
})();
