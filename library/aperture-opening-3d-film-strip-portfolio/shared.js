/* Shared by all pages — photo slot drawing, aperture loader, menu, page transition.
   Original loader numbers: body diameter min(w,h)×.3, one rotation 1.15 − 1.07×progress^3.2 sec (gets faster), ring opening 0~.34 cubic-out · .34~.66 held open · .66~1 cubic-in,
   Rotation = Cell×.35 + (1−open)×.95, zoom 1.1 − .08×turn, bright 1.35 for the first .2.
   Ending: open .7s expo.out → 1.1s later the opening·body scale ×1.25·×1.3 along the screen diagonal, rotation −1.4, zoom 1.6 (1.5s expo.inOut), after .45s fade .675s */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  /* If a variable contains color-mix() it comes out as a literal string that canvas · three can’t read — paint it on an element and take the computed rgb */
  let probe = null;
  const color = (n) => {
    if (!probe) { probe = document.createElement("i"); probe.style.display = "none"; document.documentElement.append(probe); }
    probe.style.color = `var(${n})`;
    return getComputedStyle(probe).color;
  };

  /* ── Photo slot: draws a bust silhouette of a person on canvas. Colors stand in for the photo content ── */
  const TONES = [["#c9d6d8", "#2b2b2b", "#d9b39b"], ["#d8d2c4", "#3b2a22", "#e2bfa6"], ["#cfd8cf", "#1f1f1f", "#c99a7d"], ["#e0cfcf", "#5a3b2c", "#e8c4ad"], ["#c7cfdc", "#262626", "#b98c6f"], ["#ddd6c8", "#7a5a3a", "#efcfb6"], ["#d4dccf", "#151515", "#a87a5c"]]; /* Not skin: subject colors of the photo placeholder (background · hair · skin) — photo content that makes the grayscale ↔ color transition visible */
  function portrait(i, w = 600, h = 400, label = "Person upper body · Front · Solid background") {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const [bg, hair, skin] = TONES[i % TONES.length];
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, bg);
    grad.addColorStop(1, hair === "#151515" ? bg : skin); /* Not skin: same photo content */
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const cx = w * (0.38 + ((i * 37) % 25) / 100), s = h / 400;
    g.fillStyle = hair;
    g.beginPath(); g.ellipse(cx, h * 0.92, 150 * s, 110 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = skin;
    g.fillRect(cx - 22 * s, h * 0.5, 44 * s, 70 * s);
    g.beginPath(); g.ellipse(cx, h * 0.4, 62 * s, 78 * s, ((i % 5) - 2) * 0.06, 0, Math.PI * 2); g.fill();
    g.fillStyle = hair;
    g.beginPath(); g.ellipse(cx, h * 0.31, 70 * s, 52 * s, 0, Math.PI, 0); g.fill();
    if (i % 3 === 0) { g.beginPath(); g.ellipse(cx - 48 * s, h * 0.42, 22 * s, 66 * s, 0.1, 0, Math.PI * 2); g.ellipse(cx + 48 * s, h * 0.42, 22 * s, 66 * s, -0.1, 0, Math.PI * 2); g.fill(); }
    if (label) {
      g.font = `500 ${Math.round(13 * s)}px ${css("--kf-font-mono") || "monospace"}`;
      g.fillStyle = hair;
      g.globalAlpha = 0.55;
      g.fillText(`${label} · 3:2`, 16 * s, h - 16 * s);
      g.globalAlpha = 1;
    }
    return c;
  }

  /* ── Menu ─────────────────────────────── */
  const btn = document.querySelector(".hc-menu-btn"), menu = document.querySelector(".hc-menu"), veil = document.querySelector(".hc-veil");
  function setMenu(open) {
    if (!btn || !menu) return;
    btn.setAttribute("aria-expanded", String(open));
    veil && veil.classList.toggle("is-open", open);
    /* Original values — opening: panel y −16 · scaleY .72 → .5s expo.out (origin top right), menu rows y 18 → .45s power3.out · stagger .055 · .07 later.
       On close: line y −10 .18s power2.in · stagger .028, panel y −12·scaleY .78 .3s power2.in · .06 later. With reduced motion, durations ×.3 */
    const k = reduce ? 0.3 : 1;
    const links = menu.querySelectorAll(":scope > a:not(.hc-menu__sign)");
    if (open) {
      gsap.fromTo(menu, { autoAlpha: 0, y: -16, scaleY: 0.72 }, { autoAlpha: 1, y: 0, scaleY: 1, duration: 0.5 * k, ease: "expo.out", transformOrigin: "top right", overwrite: true });
      gsap.fromTo(links, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 * k, ease: "power3.out", stagger: 0.055 * k, delay: 0.07 * k, overwrite: true });
    } else {
      gsap.to(links, { y: -10, opacity: 0, duration: 0.18 * k, stagger: 0.028 * k, ease: "power2.in", overwrite: true });
      gsap.to(menu, { y: -12, scaleY: 0.78, autoAlpha: 0, duration: 0.3 * k, ease: "power2.in", delay: 0.06 * k, overwrite: true });
    }
  }
  menu && menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  btn && btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  veil && veil.addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".hc-menu a").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  /* ── Page transition: like a film advancing one frame, the screen slides up, blurs and flickers (original 1.1s · frame gap .11 · blur · flicker .14) ── */
  const adv = document.querySelector(".hc-advance");
  const gate = adv && adv.querySelector(".hc-advance__gate");
  const app = () => document.querySelector(".hc-page") || document.querySelector(".hc-app");
  function leave(href) {
    if (!adv || reduce) { location.href = href; return; }
    sessionStorage.setItem("hc-advance", "1");
    setMenu(false);
    /* Original: after the press it stays still about .36s preparing the next page (measured 359~422ms), cuts off in 33ms, and the new page winds in over ~1.03s */
    const tl = gsap.timeline({ delay: 0.33, onComplete: () => { location.href = href; } });
    tl.set(adv, { visibility: "visible" });
    tl.fromTo(gate, { yPercent: -100, height: "100vh" }, { yPercent: 0, duration: 0.08, ease: "none" });
  }
  function arrive() {
    if (!adv || reduce) return;
    gsap.set(adv, { visibility: "visible" });
    gsap.set(gate, { height: "" });
    const tl = gsap.timeline({ onComplete: () => gsap.set(adv, { visibility: "hidden" }) });
    tl.fromTo(gate, { yPercent: 0, height: "100vh" }, { yPercent: -100, height: "11vh", duration: 1.2, ease: "power2.out" }, 0);
    tl.fromTo(app(), { yPercent: 60, filter: "blur(6px)" }, { yPercent: 0, filter: "blur(0px)", duration: 1.2, ease: "power2.out", clearProps: "filter,transform" }, 0);
    tl.fromTo(app(), { opacity: 0.86 }, { opacity: 1, duration: 0.05, repeat: 7, yoyo: true, ease: "none" }, 0.1);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^[a-z]+:/i.test(href) || !href.endsWith(".html")) return;
    e.preventDefault();
    leave(href);
  });

  /* ── Aperture loader ───────────────────────── */
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uRes; uniform float uBody; uniform float uOpen; uniform float uRot; uniform float uBlur;
    uniform sampler2D uTex; uniform float uZoom; uniform float uBright; uniform float uClear; uniform float uFade;
    const int BLADES = 7;
    void main() {
      vec2 p = vUv * uRes - 0.5 * uRes;
      float r = length(p);
      float aa = 1.0 + uBlur;
      // Open hole: a heptagon made by seven blades — for each edge, the max outward distance must be less than 0 to count as inside
      float inside = -1e5, seam = 1e5;
      for (int i = 0; i < BLADES; i++) {
        float a0 = uRot + float(i) * 6.2831853 / float(BLADES);
        vec2 n = vec2(cos(a0), sin(a0));
        float d = dot(p, n) - uOpen * 0.901;
        inside = max(inside, d);
        // Blade seam: a line extending the edge outward (one direction only)
        vec2 t = vec2(-n.y, n.x);
        vec2 v = n * uOpen * 0.901 + t * uOpen * 0.434;
        if (dot(p - v, t) > 0.0) seam = min(seam, abs(dot(p - v, n)));
      }
      float open = 1.0 - smoothstep(-aa, aa, inside);
      float body = 1.0 - smoothstep(uBody - 1.5, uBody + 1.5, r);
      float phi = atan(p.y, p.x);
      float sheen = pow(0.5 + 0.5 * cos(phi - 0.9 - uRot * 0.6), 3.0);
      vec3 blade = vec3(0.055 + 0.07 * sheen * smoothstep(0.0, uBody, r));
      blade *= 1.0 - 0.75 * (1.0 - smoothstep(0.5, 1.4 + uBlur, seam));
      blade += 0.14 * (1.0 - smoothstep(0.0, 1.6 + uBlur, abs(inside + 1.2))) * (1.0 - open);
      float ring = 1.0 - smoothstep(0.0, 1.5, abs(r - uBody + 1.0));
      vec2 uv = p / (uBody * 2.0 * uZoom) + 0.5;
      vec3 img = texture2D(uTex, uv).rgb;
      float l = dot(img, vec3(0.299, 0.587, 0.114));
      l = mix(l, l * l * (3.0 - 2.0 * l), 0.6);
      vec3 col = mix(blade, vec3(l) * uBright, open);
      col = col * body + ring * 0.06 * (1.0 - uClear);
      // Only the inside of the hole turns transparent — at the end the hole is larger than the screen so the site behind shows entirely
      float alpha = 1.0 - open * uClear;
      gl_FragColor = vec4(col * alpha * uFade, alpha);
    }`;
  function loader(onReveal) {
    const box = document.querySelector(".hc-loader");
    const ready = (arrived = false) => { document.body.classList.add("is-ready"); onReveal && onReveal({ arrived }); };
    if (!box || !window.THREE || reduce || sessionStorage.getItem("hc-advance")) {
      box && box.remove();
      document.body.classList.add("is-booted");
      const arrived = !!sessionStorage.getItem("hc-advance");
      sessionStorage.removeItem("hc-advance");
      ready(arrived);
      if (!reduce) arrive();
      return;
    }
    box.classList.add("is-on");
    document.body.classList.add("is-booted");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    box.prepend(renderer.domElement);
    const tex = Array.from({ length: 11 }, (_, i) => { const t = new THREE.CanvasTexture(portrait(i, 512, 512, "")); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; });
    const u = { uRes: { value: new THREE.Vector2() }, uBody: { value: 100 }, uOpen: { value: 0 }, uRot: { value: 0 }, uBlur: { value: 0 }, uTex: { value: tex[0] }, uZoom: { value: 1 }, uBright: { value: 1 }, uClear: { value: 0 }, uFade: { value: 0 } };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false }));
    mesh.frustumCulled = false;
    const scene = new THREE.Scene(); scene.add(mesh);
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let W = 0, H = 0, body = 100, final = false;
    const size = () => { W = innerWidth; H = innerHeight; renderer.setSize(W, H); u.uRes.value.set(W * dpr, H * dpr); body = Math.min(W, H) * 0.3 * dpr; if (!final) u.uBody.value = body; };
    size();
    addEventListener("resize", size);
    renderer.compile(scene, cam);
    const outC = (x) => 1 - (1 - x) ** 3, inC = (x) => x ** 3;
    const T = (x) => (x < 0.34 ? outC(x / 0.34) : x < 0.66 ? 1 : 1 - inC((x - 0.66) / 0.34));
    const RUN = 3.4;
    const st = { prog: 0, loop: 0, frame: 0, prevOpen: 0 };
    let last = performance.now(), raf = 0;
    gsap.to(u.uFade, { value: 1, duration: 0.7, ease: "power2.out" });
    function step(now) {
      raf = requestAnimationFrame(step);
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = now;
      if (!final) {
        st.prog = Math.min(1, st.prog + dt / RUN);
        const per = 1.15 - 1.07 * st.prog ** 3.2;
        st.loop += dt / per;
        if (st.loop >= 1) {
          if (st.prog >= 1) { finish(); }
          else { st.loop -= 1; st.frame = (st.frame + 1) % 10; u.uTex.value = tex[st.frame]; }
        }
        if (!final) {
          const a = T(st.loop);
          u.uOpen.value = a * u.uBody.value * 0.94;
          u.uRot.value = st.frame * 0.35 + (1 - a) * 0.95;
          u.uBlur.value = Math.min(6, (Math.abs(a - st.prevOpen) / Math.max(dt, 1e-4)) * 0.9) * dpr;
          st.prevOpen = a;
          u.uZoom.value = 1.1 - 0.08 * st.loop;
          u.uBright.value = 1 + 0.35 * Math.max(0, 1 - st.loop / 0.2) * (st.loop < 0.34 ? 1 : 0);
        }
      }
      renderer.render(scene, cam);
    }
    function finish() {
      final = true;
      const diag = Math.hypot(W, H) * dpr * 0.5;
      u.uBlur.value = 0; u.uBright.value = 1; u.uTex.value = tex[10]; u.uZoom.value = 1.12;
      const tl = gsap.timeline({ onComplete: done });
      tl.fromTo(u.uOpen, { value: 0 }, { value: u.uBody.value * 0.94, duration: 0.7, ease: "expo.out" }, 0);
      tl.to(u.uRot, { value: u.uRot.value - 0.95, duration: 0.7, ease: "expo.out" }, 0);
      tl.fromTo(u.uBright, { value: 1.35 }, { value: 1, duration: 0.5, ease: "power2.out" }, 0);
      tl.to(u.uZoom, { value: 1.04, duration: 1.5, ease: "power1.out" }, 0);
      const s = 1.1, a = 1.5;
      tl.call(() => box.classList.add("is-opening"), null, s);
      tl.to(u.uOpen, { value: diag * 1.25, duration: a, ease: "expo.inOut" }, s);
      tl.to(u.uBody, { value: diag * 1.3, duration: a, ease: "expo.inOut" }, s);
      tl.to(u.uRot, { value: "-=1.4", duration: a, ease: "expo.inOut" }, s);
      tl.to(u.uZoom, { value: 1.6, duration: a, ease: "expo.inOut" }, s);
      tl.to(u.uClear, { value: 1, duration: a * 0.45, ease: "power2.inOut" }, s + a * 0.3);
      tl.call(ready, null, s + a * 0.42);
    }
    function done() {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      tex.forEach((t) => t.dispose());
      mesh.geometry.dispose(); mesh.material.dispose(); renderer.dispose();
      box.remove();
    }
    raf = requestAnimationFrame(step);
  }

  /* ── Cursor (original #imlec) — only on light panels of precise-pointer devices. An 8px dot follows at 10 per second, and over a photo cell a 140px empty ring + cell number,
     Fades out in .2s when leaving the canvas (header line, menu) ── */
  const appEl = document.querySelector(".hc-app");
  if (appEl && matchMedia("(pointer: fine)").matches && !document.body.classList.contains("is-dark")) {
    appEl.classList.add("has-cursor");
    const cur = document.createElement("div");
    cur.className = "hc-cursor is-hidden";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="hc-cursor__ring"></div><div class="hc-cursor__label"></div>';
    document.body.append(cur);
    const label = cur.querySelector(".hc-cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, px = x, py = y, inside = false, t0 = performance.now();
    /* As in the original, the target moves only over the canvas — over the header line·menu it stays in place and disappears */
    addEventListener("pointermove", (e) => { inside = !!e.target.closest(".hc-app"); if (inside) { px = e.clientX; py = e.clientY; } });
    document.documentElement.addEventListener("pointerleave", () => { inside = false; });
    const step = (now) => {
      requestAnimationFrame(step);
      const dt = Math.min((now - t0) / 1000, 0.05);
      t0 = now;
      const k = reduce ? 1 : 1 - Math.exp(-dt * 10);
      x += (px - x) * k; y += (py - y) * k;
      cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const loupe = document.body.classList.contains("is-onfilm") && !document.body.classList.contains("is-focus");
      cur.classList.toggle("is-loupe", loupe);
      cur.classList.toggle("is-hidden", !inside);
      if (loupe && label.textContent !== document.body.dataset.frame) label.textContent = document.body.dataset.frame || "";
    };
    requestAnimationFrame(step);
  }

  window.hc = { portrait, loader, setMenu, reduce, css, color };
})();
