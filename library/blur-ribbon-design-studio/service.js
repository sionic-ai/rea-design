// Services and pricing — header entrance, ribbon stage (our three.js strip + SVG loops and paths + 12 technologies), service drawer, pricing switch, opening questions
(() => {
  const { touch, split } = MD;
  const E = MD.ease();
  const blur = (px) => (touch ? {} : { filter: `blur(${px}px)` });
  const clear = touch ? {} : { filter: "blur(0px)" };
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const sm = (v) => v * v * (3 - 2 * v);
  const lerp = (a, b, t) => a + (b - a) * t;

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".sv-hero");
    gsap.set(hero, { opacity: 0, y: 40, ...blur(8) });
    MD.onReveal(() => {
      gsap.to(hero, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.1 });
      const chars = document.querySelectorAll(".sv-hero__h .fx-wp-char");
      if (chars.length) gsap.fromTo(chars, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: E, stagger: 0.02, delay: 0.25 });
    });
  });

  // ── Ribbon stage ─────────────────────────────────────────────
  // Progress p (0→1, 672vh): 0~.18 the twisted ribbon rotates along the tilt and heading table while color blotches melt to white and vanish · .04~.165 eight ring lines appear then gather into a single ring ·
  // .18~.29 the ring grows wider than the screen and its front edge becomes a horizontal line (road) · .29~.83 12 skills pass along the road from right to left · .83~.93 ring again · .9~ closing sentence
  const sec = document.querySelector(".sv-rt"), stage = sec.querySelector(".sv-rt__stage");
  const canvas = sec.querySelector(".sv-rt__gl"), svg = sec.querySelector(".sv-rt__rings");
  const stops = [...sec.querySelectorAll(".sv-stop")], cap = sec.querySelector(".sv-rt__cap");
  const KNOTS = [[0, 22, 0], [0.04, 22, 0], [0.11, 17, 12], [0.18, 10, 28], [0.34, 11, 36], [0.38, 17, 98], [0.42, 15, 160], [0.58, 16, 168], [0.62, 15, 250], [0.66, 8, 330], [0.82, 9, 338], [0.91, 22, 350], [1, 28, 360]];
  const pose = (p) => { let i = 0; while (i < KNOTS.length - 2 && p > KNOTS[i + 1][0]) i++; const [t0, e0, a0] = KNOTS[i], [t1, e1, a1] = KNOTS[i + 1], t = sm(range(p, t0, t1)); return [lerp(e0, e1, t), lerp(a0, a1, t)]; };

  // Turn the skin color into an rgb the renderer can read — the canvas resolves values like oklch too
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (v) => {
    const tmp = document.createElement("i"); tmp.style.color = `var(${v})`; document.body.append(tmp);
    const c = getComputedStyle(tmp).color; tmp.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data; return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  const NS = "http://www.w3.org/2000/svg";
  const rings = Array.from({ length: 8 }, (_, i) => { const e = document.createElementNS(NS, "ellipse"); e.dataset.j = i; svg.append(e); return e; });
  const route = document.createElementNS(NS, "ellipse"); route.setAttribute("class", "sv-route"); svg.append(route);
  const JIT = rings.map((_, i) => ({ rx: 1 + Math.sin(i * 1.7) * 0.18, ry: 1 + Math.cos(i * 2.3) * 0.25, rot: Math.sin(i * 0.9) * 14, dy: Math.cos(i * 1.3) * 0.06 }));

  let W = 0, H = 0, p = 0, target = 0, gl = null;
  const size = () => { W = stage.clientWidth; H = stage.clientHeight; gl?.resize(); };

  if (window.THREE && !MD.reduce) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, 5.2);
      const N = 240, M = 10, R = 1, w = 0.62, pos = [], uv = [], idx = [];
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2, phi = th / 2, rx = Math.cos(th), rz = Math.sin(th);
        for (let j = 0; j <= M; j++) {
          const s = (j / M - 0.5) * w, dx = rx * Math.cos(phi), dy = Math.sin(phi), dz = rz * Math.cos(phi);
          pos.push(rx * R + dx * s, dy * s, rz * R + dz * s); uv.push(i / N, j / M);
        }
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      const uniforms = { uC1: { value: rgb("--site-peach") }, uC2: { value: rgb("--site-rose") }, uC3: { value: rgb("--site-lilac") }, uBase: { value: rgb("--kf-surface") }, uDiss: { value: 0 }, uAlpha: { value: 1 }, uTime: { value: 0 } };
      const mat = new THREE.ShaderMaterial({
        uniforms, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uC1, uC2, uC3, uBase; uniform float uDiss, uAlpha, uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
          float fbm(vec2 p){ float a = .5, s = 0.; for(int k = 0; k < 4; k++){ s += a * n2(p); p *= 2.03; a *= .5; } return s; }
          void main(){
            float u = vUv.x;
            vec3 grad = u < .5 ? mix(uC1, uC2, smoothstep(.0, .5, u)) : mix(uC2, uC3, smoothstep(.5, 1., u));
            float n = fbm(vec2(u * 9., vUv.y * 2.2) + uTime * .05);
            float mask = smoothstep(uDiss, uDiss + .06, n);
            vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
            float lam = .72 + .28 * abs(dot(N, normalize(vec3(.3, .8, .6))));
            float rim = pow(1. - abs(dot(N, vV)), 2.5);
            vec3 col = mix(uBase * .97, grad, mask) * lam + rim * .08;
            gl_FragColor = vec4(col, uAlpha);
          }`,
      });
      const band = new THREE.Mesh(geo, mat);
      scene.add(band);
      renderer.compile(scene, camera);
      gl = {
        resize: () => { renderer.setSize(W, H, false); camera.aspect = W / Math.max(1, H); camera.updateProjectionMatrix(); },
        draw: (q, t) => {
          const [el, az] = pose(q);
          band.rotation.set(THREE.MathUtils.degToRad(el), THREE.MathUtils.degToRad(az) + 0.35, THREE.MathUtils.degToRad(-12));
          band.scale.setScalar(Math.min(1.25, W / H / 1.25));
          uniforms.uDiss.value = lerp(-0.1, 0.95, sm(range(q, 0.015, 0.15)));
          uniforms.uAlpha.value = 1 - sm(range(q, 0.12, 0.18));
          uniforms.uTime.value = t;
          canvas.style.opacity = uniforms.uAlpha.value > 0.001 ? "1" : "0";
          if (uniforms.uAlpha.value > 0.001) renderer.render(scene, camera);
        },
      };
    } catch (e) { gl = null; }
  }

  const draw = (t) => {
    const ringIn = sm(range(p, 0.04, 0.11)), merge = sm(range(p, 0.11, 0.165));
    const tape = sm(range(p, 0.18, 0.29)) * (1 - sm(range(p, 0.83, 0.93)));
    const [el, az] = pose(p);
    const baseRx = W * 0.34, baseRy = Math.max(6, H * 0.34 * Math.sin(((el + 6) * Math.PI) / 180) * 1.6);
    const rx = lerp(baseRx, W * 1.7, tape), ry = lerp(baseRy, H * 0.26, tape), cy = lerp(H * 0.5, H * 0.56 - H * 0.26, tape), rot = lerp(-6 + Math.sin((az * Math.PI) / 180) * 4, 0, tape);
    rings.forEach((e, i) => {
      const j = JIT[i], k = i === 0 ? 1 : 1 - merge, show = i === 0 ? ringIn : ringIn * (1 - merge);
      e.setAttribute("cx", W / 2); e.setAttribute("cy", cy + j.dy * H * k);
      e.setAttribute("rx", rx * lerp(1, j.rx, k)); e.setAttribute("ry", ry * lerp(1, j.ry, k));
      e.setAttribute("transform", `rotate(${rot + j.rot * k} ${W / 2} ${cy})`);
      e.style.opacity = (i === 0 ? show * (1 - tape) : show).toFixed(3);
    });
    route.setAttribute("cx", W / 2); route.setAttribute("cy", cy); route.setAttribute("rx", rx); route.setAttribute("ry", ry);
    route.setAttribute("transform", `rotate(${rot} ${W / 2} ${cy})`);
    route.style.opacity = tape.toFixed(3);
    // Skills — cells spaced 360px apart start off the right edge of the screen and travel off the left edge over .29~.83. Passing the screen center, the dot gets a ring and ”touches”
    const travel = range(p, 0.29, 0.83), slot = Math.max(360, W * 0.25), span = W * 0.95 + (stops.length - 1) * slot + W * 0.2;
    stops.forEach((s, i) => {
      const x = W * 0.95 + i * slot - travel * span;
      const dx = (x - W / 2) / rx, y = cy + ry * Math.sqrt(Math.max(0, 1 - dx * dx));
      const fadeIn = clamp((W + 40 - x) / 160), fadeOut = clamp((x + 200) / 160);
      s.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      s.style.opacity = (tape * fadeIn * fadeOut).toFixed(3);
      const reached = x < W * 0.5;
      if (reached !== s.classList.contains("is-reached")) s.classList.toggle("is-reached", reached);
    });
    cap.style.opacity = sm(range(p, 0.9, 0.96)).toFixed(3);
    gl?.draw(p, t);
  };

  let live = false;
  new IntersectionObserver((en) => (live = en[0].isIntersecting), { rootMargin: "100px" }).observe(stage);
  size();
  addEventListener("resize", () => { size(); draw(gsap.ticker.time); });
  if (MD.reduce) {
    p = 0.5; draw(0);
  } else {
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", onUpdate: (s) => (target = s.progress), onRefresh: (s) => (target = p = s.progress) });
    gsap.ticker.add((t) => { if (!live) return; p += (target - p) * 0.12; draw(t); });
    draw(0);
  }

  // ── Service drawer — pressing a row slides it in from the right in .5s (.4s on close) with cubic-bezier(.32,.72,0,1), and the scrim fades in .3s. Inner cells lift their blur at .06 intervals
  const drawer = document.getElementById("svDrawer"), num = drawer.querySelector(".sv-drawer__num"), title = drawer.querySelector("#svDrawerH");
  let saved = 0;
  const open = (btn) => {
    num.textContent = btn.querySelector("em").textContent;
    title.textContent = btn.querySelector("span").textContent.trim();
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); drawer.inert = false;
    saved = scrollY; document.documentElement.style.overflow = "hidden";
    if (!MD.reduce) gsap.fromTo(drawer.querySelectorAll(".sv-reveal"), { opacity: 0, y: 16, ...blur(8) }, { opacity: 1, y: 0, ...clear, duration: 0.6, ease: E, stagger: 0.06, delay: 0.12 });
  };
  const close = () => { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); drawer.inert = true; document.documentElement.style.overflow = ""; if (scrollY !== saved) scrollTo(0, saved); };
  document.querySelectorAll("[data-svc]").forEach((b) => b.addEventListener("click", () => open(b)));
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-svc-close]")) close(); if (e.target.closest("[data-gt-open]")) close(); });
  addEventListener("keydown", (e) => e.key === "Escape" && drawer.classList.contains("is-open") && close());

  // ── Two pricing tiers — pill moves to the next cell in 250ms, value changes
  document.querySelectorAll(".sv-switch").forEach((sw) => {
    const price = sw.closest(".sv-plan").querySelector(".sv-price-num");
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tier]"); if (!b) return;
      const second = b.dataset.tier === "1";
      sw.classList.toggle("is-b", second);
      sw.querySelectorAll("[data-tier]").forEach((x) => x.classList.toggle("is-on", x === b));
      if (price) price.textContent = second ? price.dataset.b : price.dataset.a;
    });
  });

  // ── Question — only one opens
  const qs = [...document.querySelectorAll(".sv-q:not(.is-ask)")];
  qs.forEach((q) => q.querySelector("button").addEventListener("click", () => {
    const on = !q.classList.contains("is-open");
    qs.forEach((o) => { o.classList.toggle("is-open", o === q && on); o.querySelector("button").setAttribute("aria-expanded", String(o === q && on)); });
  }));
})();
