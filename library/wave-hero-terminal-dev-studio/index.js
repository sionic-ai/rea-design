// Home: terminal loader (video progress → %, log, cells), title rippling with cursor waves, logo and text strip, number card images following the cursor, two glass orbs turning on scroll (three.js), founder photo cover peeling away
(() => {
  const { reduced } = AG;
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  // ───── Title ripple — runs one more copy of the same height field as the panel ripple (_fx water-ripple-cover) (half the panel resolution · damping .96 · radius .06 · strength .35),
  // For 1.8 seconds after the last cursor move, each frame reads a 64×36 gradient map and ripples the title letters with SVG displacement (6px). The part gives no height field, so it runs separately here
  const hero = document.querySelector(".ag-hero"), title = hero?.querySelector(".ag-hero__title");
  if (title && window.THREE && !reduced) {
    const T = THREE, MW = 64, MH = 36, HOLD = 1800;
    const VS = "varying vec2 v_uv; void main(){ v_uv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
    const SIM = `precision highp float;
    uniform sampler2D u_prev; uniform vec2 u_res, u_mouse; uniform int u_add; varying vec2 v_uv;
    void main(){
      vec2 t = 1.0 / u_res;
      vec4 here = texture2D(u_prev, v_uv);
      float around = texture2D(u_prev, v_uv - vec2(t.x, 0.0)).r + texture2D(u_prev, v_uv + vec2(t.x, 0.0)).r
                   + texture2D(u_prev, v_uv - vec2(0.0, t.y)).r + texture2D(u_prev, v_uv + vec2(0.0, t.y)).r;
      float next = (around * 0.5 - here.g) * 0.96;
      if (u_add == 1) next += 0.35 * smoothstep(0.06, 0.0, distance(v_uv, u_mouse));
      gl_FragColor = vec4(next, here.r, 0.0, 1.0);
    }`;
    // Store tilt as 0~1 — .5 is the resting position
    const SLOPE = `precision highp float;
    uniform sampler2D u_h; uniform vec2 u_res; varying vec2 v_uv;
    void main(){
      vec2 t = 1.0 / u_res;
      vec2 s = vec2(texture2D(u_h, v_uv - vec2(t.x, 0.0)).r - texture2D(u_h, v_uv + vec2(t.x, 0.0)).r,
                    texture2D(u_h, v_uv - vec2(0.0, t.y)).r - texture2D(u_h, v_uv + vec2(0.0, t.y)).r);
      gl_FragColor = vec4(clamp(s * 1.5 + 0.5, 0.0, 1.0), 0.5, 1.0);
    }`;
    const renderer = new T.WebGLRenderer({ canvas: document.createElement("canvas"), antialias: false, alpha: false });
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.PlaneGeometry(2, 2);
    const pass = (frag, uniforms) => { const material = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: frag, uniforms }); const scene = new T.Scene(); scene.add(new T.Mesh(quad, material)); return { material, scene }; };
    const sim = pass(SIM, { u_prev: { value: null }, u_res: { value: new T.Vector2() }, u_mouse: { value: new T.Vector2(-1, -1) }, u_add: { value: 0 } });
    const slope = pass(SLOPE, { u_h: { value: null }, u_res: { value: new T.Vector2() } });
    const rt = (w, h, type) => new T.WebGLRenderTarget(w, h, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, type });
    const small = rt(MW, MH, T.UnsignedByteType);
    let a, b;
    const calm = () => { for (const t of [a, b]) { renderer.setRenderTarget(t); renderer.clear(); } renderer.setRenderTarget(null); };

    const px = new Uint8Array(MW * MH * 4), map = document.createElement("canvas");
    map.width = MW; map.height = MH;
    const mc = map.getContext("2d"), pic = mc.createImageData(MW, MH), row = MW * 4;
    // The GPU serves rows from the bottom up, so load them in reverse
    const toUrl = () => { for (let r = 0; r < MH; r++) pic.data.set(px.subarray((MH - 1 - r) * row, (MH - r) * row), r * row); mc.putImageData(pic, 0, 0); return map.toDataURL(); };
    for (let i = 0; i < px.length; i += 4) px.set([128, 128, 128, 255], i);
    const flat = toUrl();

    const NS = "http://www.w3.org/2000/svg";
    const svgEl = (n, at = {}) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); return e; };
    const filter = svgEl("filter", { id: "ag-title-water", filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" });
    const feMap = svgEl("feImage", { result: "map", preserveAspectRatio: "none", href: flat });
    filter.append(feMap, svgEl("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale: 6, xChannelSelector: "R", yChannelSelector: "G" }));
    const svg = svgEl("svg", { "aria-hidden": "true" });
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    const defs = svgEl("defs");
    defs.append(filter); svg.append(defs); document.body.append(svg);
    // Lay the map across the whole board (shifted back by the title space), and cull an area 30px larger than the board
    const place = () => {
      const h = hero.getBoundingClientRect(), t = title.getBoundingClientRect(), dx = t.left - h.left, dy = t.top - h.top;
      Object.entries({ x: -dx, y: -dy, width: h.width, height: h.height }).forEach(([k, v]) => feMap.setAttribute(k, v));
      Object.entries({ x: -dx - 30, y: -dy - 30, width: h.width + 60, height: h.height + 60 }).forEach(([k, v]) => filter.setAttribute(k, v));
    };
    const size = () => {
      const r = hero.getBoundingClientRect(), w = Math.max(2, Math.floor(Math.floor(r.width) / 2)), h = Math.max(2, Math.floor(Math.floor(r.height) / 2));
      a?.dispose(); b?.dispose();
      a = rt(w, h, T.HalfFloatType); b = rt(w, h, T.HalfFloatType);
      calm();
      sim.material.uniforms.u_res.value.set(w, h);
      slope.material.uniforms.u_res.value.set(w, h);
      place();
    };
    size();
    // Pre-build the shader so it isn’t first built on the first cursor movement
    renderer.setRenderTarget(a); renderer.compile(sim.scene, cam);
    renderer.setRenderTarget(small); renderer.compile(slope.scene, cam);
    renderer.setRenderTarget(null);
    new ResizeObserver(size).observe(hero);
    new ResizeObserver(place).observe(title);

    let until = 0, live = false, visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
    gsap.ticker.add(() => {
      if (!live || !visible) return;
      sim.material.uniforms.u_prev.value = a.texture;
      renderer.setRenderTarget(b);
      renderer.render(sim.scene, cam);
      sim.material.uniforms.u_add.value = 0;
      [a, b] = [b, a];
      if (performance.now() < until) {
        slope.material.uniforms.u_h.value = a.texture;
        renderer.setRenderTarget(small);
        renderer.render(slope.scene, cam);
        renderer.readRenderTargetPixels(small, 0, 0, MW, MH, px);
        feMap.setAttribute("href", toUrl());
      } else {
        // After 1.8 seconds only a bit over 1% of the plate wave remains — spin the map flat and rest
        feMap.setAttribute("href", flat);
        live = false;
        calm();
      }
      renderer.setRenderTarget(null);
    });
    const move = (e) => {
      const r = hero.getBoundingClientRect(), p = e.touches ? e.touches[0] : e;
      sim.material.uniforms.u_mouse.value.set((p.clientX - r.left) / r.width, 1 - (p.clientY - r.top) / r.height);
      sim.material.uniforms.u_add.value = 1;
      until = performance.now() + HOLD;
      live = true;
    };
    hero.addEventListener("mousemove", move, { passive: true });
    hero.addEventListener("touchmove", move, { passive: true });
    title.style.filter = "url(#ag-title-water)";
  }

  // ───── Band — flows left at 80px per second by one set width, then loops back seamlessly (original pn speed 80)
  document.querySelectorAll("[data-marquee]").forEach((track) => {
    if (reduced) return;
    const set = track.firstElementChild;
    let x = 0, w = set.getBoundingClientRect().width, on = true;
    new ResizeObserver(() => (w = set.getBoundingClientRect().width)).observe(set);
    new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(track);
    const speed = 80;
    gsap.ticker.add((_, dt) => {
      if (!on || !w) return;
      x -= (speed * Math.min(dt, 50)) / 1000;
      if (-x >= w) x += w;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    });
  });

  // ───── Social strip — flips one card at a time
  const social = document.querySelector("[data-social]");
  document.querySelectorAll(".ag-social__arrows button").forEach((b) => b.addEventListener("click", () => {
    const step = social.firstElementChild.getBoundingClientRect().width + 16;
    social.scrollBy({ left: +b.dataset.dir * step, behavior: reduced ? "auto" : "smooth" });
  }));

  // ───── Number card image — when the cursor enters a card, a 160px image floats up in place (.4s) and follows the cursor by .08 each frame.
  // Horizontally only from the card center to 80px inside the right edge, narrowed by the square root of the cursor share. At phone width (767px or less) it doesn’t follow
  const wide = matchMedia("(min-width: 768px)");
  if (!reduced) document.querySelectorAll(".ag-stat").forEach((card) => {
    const img = card.querySelector(".ag-stat__img");
    if (!img) return;
    let cx = 0, cy = 0, x = 0, y = 0, raf = 0;
    const aim = (r) => {
      const mid = r.width * 0.5, end = r.width - 80;
      return [mid + Math.sqrt(Math.min(1, Math.max(0, cx / r.width))) * (end - mid), Math.min(Math.max(cy, 0), r.height)];
    };
    const put = () => { img.style.left = `${x}px`; img.style.top = `${y}px`; };
    const at = (e) => { const r = card.getBoundingClientRect(); cx = e.clientX - r.left; cy = e.clientY - r.top; return r; };
    const follow = () => {
      const [tx, ty] = aim(card.getBoundingClientRect());
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      put();
      raf = requestAnimationFrame(follow);
    };
    card.addEventListener("mouseenter", (e) => {
      if (!wide.matches) return;
      [x, y] = aim(at(e));
      put();
      card.classList.add("is-hover");
      raf ||= requestAnimationFrame(follow);
    });
    card.addEventListener("mousemove", at);
    card.addEventListener("mouseleave", () => { cancelAnimationFrame(raf); raf = 0; card.classList.remove("is-hover"); });
  });

  // ───── Founder photo — a white cover lifts away upward (height .9s cubic-bezier(.16,1,.3,1))
  if (!reduced) document.querySelectorAll(".ag-person__veil").forEach((v) => {
    ScrollTrigger.create({ trigger: v.parentElement, start: "top 90%", once: true, onEnter: () => gsap.to(v, { height: 0, duration: 0.9, ease: AG.ease("0.16,1,0.3,1") }) });
  });
  else document.querySelectorAll(".ag-person__veil").forEach((v) => v.remove());

  // ───── Two glass marbles — circling each other twice over the share of scroll through the services section. Camera 35°·(0,0,6), exposure 1.5, physical material (clear coat) · shadows
  const canvas = document.querySelector(".ag-spheres");
  if (canvas && window.THREE) {
    const T = THREE;
    const host = canvas.parentElement, section = canvas.closest(".ag-services");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.1, 100);
    cam.position.set(0, 0, 6);
    const col = (n) => new T.Color(css(n) || "white");
    // Reflection environment — bake a bright hemisphere room and two color balls once and reuse them
    const pm = new T.PMREMGenerator(renderer);
    const env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(10, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({ color: col("--kf-surface"), side: T.BackSide })));
    const ball = (c, x, y, z) => { const m = new T.Mesh(new T.SphereGeometry(3, 16, 16), new T.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); env.add(m); };
    ball(col("--kf-accent-soft"), -6, 3, -1);
    ball(col("--kf-raised"), 6, -1, -2);
    env.add(new T.HemisphereLight(col("--kf-bg"), col("--kf-raised"), 0.9));
    scene.environment = pm.fromScene(env, 0.04).texture;
    pm.dispose();
    scene.add(new T.AmbientLight(col("--kf-bg"), 0.35));
    const key = new T.DirectionalLight(col("--kf-bg"), 2.8);
    key.position.set(-3, 5, 3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.002;
    Object.assign(key.shadow.camera, { near: 0.1, far: 20, left: -3, right: 3, top: 3, bottom: -3 });
    scene.add(key);
    const fillL = new T.DirectionalLight(col("--kf-bg"), 2.4); fillL.position.set(3, 4, 4); scene.add(fillL);
    const mat = (r, c, e) => new T.MeshPhysicalMaterial({ color: col("--kf-bg"), metalness: 0.1, roughness: r, clearcoat: c, clearcoatRoughness: 0.12, envMapIntensity: e, ior: 1.6 });
    const big = new T.Mesh(new T.SphereGeometry(1, 96, 96), mat(0.15, 0.75, 0.85));
    const small = new T.Mesh(new T.SphereGeometry(0.72, 96, 96), mat(0.12, 0.8, 0.95));
    [big, small].forEach((m) => { m.castShadow = m.receiveShadow = true; scene.add(m); });
    // Bead color — passes through the three gradient colors by scroll progress
    const tints = ["--site-grad-a", "--kf-accent", "--site-grad-c"].map((n) => { const v = getComputedStyle(section).getPropertyValue(n).trim(); const c = document.createElement("canvas").getContext("2d"); c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255); });
    const tint = new T.Color(), white = col("--kf-bg");
    const size = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(host);
    size();
    let visible = false;
    const draw = () => {
      const b = section.getBoundingClientRect(), k = Math.min(1, Math.max(0, (innerHeight - b.top) / (section.offsetHeight + innerHeight)));
      const a = k * Math.PI * 2 * 2;
      big.position.set(Math.cos(a + Math.PI) * 1.15 + 0.2, Math.sin(a + Math.PI) * 0.45, Math.sin(a) * 0.5 - 1.2);
      small.position.set(Math.cos(a) * 1.15 + 0.2, Math.sin(a) * 0.45, -Math.sin(a) * 0.5 - 1.2);
      big.rotation.y = 0.5 + a * 0.3; small.rotation.y = -0.7 - a * 0.3;
      const seg = k * 2, i = Math.min(1, Math.floor(seg));
      tint.copy(tints[i]).lerp(tints[i + 1], seg - i);
      big.material.color.copy(white).lerp(tint, 0.4);
      small.material.color.copy(white).lerp(tint, 0.5);
      renderer.render(scene, cam);
    };
    gsap.ticker.add(() => visible && draw());
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) canvas.classList.add("is-on"); }).observe(host);
    draw();
  }
})();
