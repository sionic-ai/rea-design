/* Things spanning between pages — own scroll (horizontal infinite·vertical), WebGL stage (fov 50·1px=1 unit · one post-processed sheet),
   Placeholder photo images, line-split reveal, splash, barba transition.
   Values are taken as-is from the original bundle. */
(() => {
  const PY = (window.PY = window.PY || {});
  PY.pages = PY.pages || {};
  PY.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  PY.isMobile = () => innerWidth < 680;
  PY.params = { mode: 0, modeChangePow: 0 };
  PY.dynamic = { home: "grid", about: "top" };
  const html = document.documentElement;
  const css = (name) => getComputedStyle(html).getPropertyValue(name).trim();

  /* Skin variables as color strings the canvas can use — the browser resolves expressions like color-mix too */
  const probe = document.createElement("i");
  probe.style.display = "none";
  PY.color = (name) => {
    if (!probe.isConnected) document.body.append(probe);
    probe.style.color = `var(${name})`;
    return getComputedStyle(probe).color;
  };

  /* Custom scroll — each wheel notch (120) × speed moves the target, and every frame it follows with ease .125.
     Power pow0 = Cumulative wheel difference of the last three (max 3)/3 → follows with pow1 (.9s) · pow2 (1s) power1.out */
  class Scroller {
    constructor(o) {
      this.o = o;
      this.dir = o.dir || "vr";
      this.infinite = !!o.infinite;
      this.speed = o.speed || 100;
      if (this.dir === "vr") this.speed *= innerHeight / innerWidth;
      this.ease = o.ease ?? 0.125;
      this.delta1 = 0; this.delta2 = 0; this.x = 0; this.y = 0;
      this.power = { hist: [], total: 0, max: 3, pow0: { value: 0 }, pow1: { value: 0, duration: 0.9 }, pow2: { value: 0, duration: 1 } };
      this.touch = { active: false, ratio: o.touchRatio ?? 1.8, start: 0, startDelta: 0, moved: false };
      this.wrap = o.wrap; this.content = o.content;
      this.sections = Array.from(o.sections || []);
      this.stopped = false;
      this.measure();
      this.onWheel = this.onWheel.bind(this);
      this.onDown = this.onDown.bind(this); this.onMove = this.onMove.bind(this); this.onUp = this.onUp.bind(this);
      this.onResize = () => this.measure();
      addEventListener("wheel", this.onWheel, { passive: true });
      addEventListener("resize", this.onResize);
      if (o.drag) {
        this.wrap.addEventListener("pointerdown", this.onDown);
        addEventListener("pointermove", this.onMove);
        addEventListener("pointerup", this.onUp);
        addEventListener("pointercancel", this.onUp);
      }
      this.tick = this.tick.bind(this);
      gsap.ticker.add(this.tick);
    }
    measure() {
      if (this.dir === "vr") this.speed = (this.o.speed || 100) * innerHeight / innerWidth;
      this.sections.forEach((s) => { s.style.transform = "none"; });
      const cr = this.content.getBoundingClientRect();
      this.rects = this.sections.map((s) => {
        const r = s.getBoundingClientRect();
        return { left: r.left - cr.left, top: r.top - cr.top, width: r.width, height: r.height };
      });
      this.size = this.dir === "hr"
        ? this.rects.reduce((a, r) => Math.max(a, r.left + r.width), 0)
        : this.content.scrollHeight;
      this.tick();
    }
    max() { return Math.max(0, this.size - (this.dir === "hr" ? innerWidth : innerHeight)); }
    onWheel(e) {
      if (this.stopped) return;
      const d = -(e.deltaX || 0) / 120 + -(e.deltaY || 0) / 120;
      this.kick(-d * this.speed, Math.abs(d));
    }
    kick(dist, amount) {
      if (this.scrollTween) { this.scrollTween.kill(); this.scrollTween = null; }
      this.delta1 += dist;
      this.power.total += amount;
      const h = this.power.hist;
      if (h.length > 2) {
        h.shift(); h.push(this.power.total);
        this.power.pow0.value = Math.min(Math.abs(h[0] - h[2]), this.power.max) / this.power.max;
        gsap.to(this.power.pow1, { duration: this.power.pow1.duration, ease: "power1.out", value: this.power.pow0.value, overwrite: true });
        gsap.to(this.power.pow2, { duration: this.power.pow2.duration, ease: "power1.out", value: this.power.pow0.value, overwrite: true });
      } else h.push(this.power.total);
      this.dirSign = dist > 0 ? 1 : -1;
      clearTimeout(this.doneTimer);
      this.doneTimer = setTimeout(() => {
        this.power.pow0.value = 0;
        gsap.to(this.power.pow1, { duration: this.power.pow1.duration, value: 0, overwrite: true });
        gsap.to(this.power.pow2, { duration: this.power.pow2.duration, value: 0, overwrite: true });
      }, 30);
      this.settleLater();
    }
    settleLater() {
      clearTimeout(this.afterTimer);
      if (this.o.onSettle) this.afterTimer = setTimeout(() => { if (!this.touch.active) this.o.onSettle(this); }, 500);
    }
    onDown(e) {
      if (e.button !== 0 || e.target.closest("a,button,input,label")) return;
      this.touch.active = true; this.touch.moved = false;
      this.touch.start = this.dir === "hr" ? e.clientX : e.clientY;
      this.touch.last = this.touch.start;
    }
    onMove(e) {
      if (!this.touch.active) return;
      const p = this.dir === "hr" ? e.clientX : e.clientY;
      const d = this.touch.last - p;
      this.touch.last = p;
      if (Math.abs(p - this.touch.start) > 4) { this.touch.moved = true; PY.drag = true; html.classList.add("is-dragging"); }
      if (d) this.kick(d * this.touch.ratio, Math.abs(d) / 120);
    }
    onUp() {
      if (!this.touch.active) return;
      this.touch.active = false;
      this.settleLater();
      html.classList.remove("is-dragging");
      setTimeout(() => { PY.drag = false; }, 200);
    }
    scrollTo(to, duration = 1.5, delay = 0, ease = "power2.out") {
      if (this.scrollTween) this.scrollTween.kill();
      if (PY.reduce) { this.delta1 = to; return; }
      this.scrollTween = gsap.to(this, { delta1: to, duration, delay, ease, onComplete: () => { this.scrollTween = null; } });
    }
    tick() {
      if (!this.rects) return;
      const lerp = PY.reduce ? 1 : this.ease;
      if (this.infinite) {
        this.x += (this.delta1 - this.x) * lerp;
        if (Math.abs(this.x) < 0.001) this.x = 0;
      } else {
        this.delta1 = Math.min(Math.max(this.delta1, 0), this.max());
        this.delta2 += (this.delta1 - this.delta2) * lerp;
        this.x = this.delta2;
      }
      const pos = this.x;
      if (this.dir === "hr") {
        const W = this.size, vw = innerWidth, pad = vw / 2;
        const left = this.infinite ? ((pos % W) + W) % W : pos;
        this.sections.forEach((s, i) => {
          const r = this.rects[i];
          let x = -left;
          if (this.infinite) {
            if (x < -r.width - r.left - pad) x += W;
            if (r.left + x - vw > pad) x -= W;
          }
          r.screen = r.left + x;
          /* Cells that fall outside half the screen width are moved away to 9999px — same as the original */
          const on = r.screen + r.width > -pad && r.screen - r.width < vw + pad;
          s.style.transform = on ? `translate3d(${x}px,0,0)` : "translate3d(9999px,0,0)";
        });
      } else {
        this.content.style.transform = `translate3d(0,${-pos}px,0)`;
      }
      this.o.onUpdate?.(this);
    }
    destroy() {
      gsap.ticker.remove(this.tick);
      removeEventListener("wheel", this.onWheel);
      removeEventListener("resize", this.onResize);
      this.wrap.removeEventListener("pointerdown", this.onDown);
      removeEventListener("pointermove", this.onMove);
      removeEventListener("pointerup", this.onUp);
      removeEventListener("pointercancel", this.onUp);
      clearTimeout(this.doneTimer); clearTimeout(this.afterTimer);
      gsap.killTweensOf([this, this.power.pow1, this.power.pow2]);
    }
  }
  PY.Scroller = Scroller;

  /* Mouse — panel coordinates (ease .05), cursor coordinates (ease .1), motion strength (√speed, ease .1) */
  class Mouse {
    constructor() {
      this.mouse = { x: 0, y: 0, ax: 0, ay: 0 };
      this.cursor = { x: 0.5, y: 0.5, ax: 0.5, ay: 0.5 };
      this.pow = 0; this.last = performance.now(); this.lx = 0; this.ly = 0;
      this.onMove = (e) => {
        this.mouse.x = e.clientX / innerWidth * 2 - 1;
        this.mouse.y = -e.clientY / innerHeight * 2 + 1;
        this.cursor.x = e.clientX / innerWidth;
        this.cursor.y = 1 - e.clientY / innerHeight;
      };
      addEventListener("mousemove", this.onMove);
    }
    update() {
      const m = this.mouse, c = this.cursor;
      m.ax += (m.x - m.ax) * 0.05; m.ay += (m.y - m.ay) * 0.05;
      c.ax += (c.x - c.ax) * 0.1; c.ay += (c.y - c.ay) * 0.1;
      const now = performance.now(), dt = Math.max(1, now - this.last) / 1000;
      const v = Math.hypot(m.x - this.lx, m.y - this.ly) / dt;
      this.pow += (Math.min(Math.pow(v, 0.5), 1) - this.pow) * 0.1;
      this.lx = m.x; this.ly = m.y; this.last = now;
    }
    destroy() { removeEventListener("mousemove", this.onMove); }
  }

  /* WebGL stage — a fov 50 perspective camera like the original, at z  = Placed at h/2/tan(25°), 1 unit = 1px, draw the scene on a single sheet, then overlay one post-processing layer */
  PY.stage = (host, post) => {
    const dpr = Math.min(devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight);
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 10000);
    const place = () => {
      const dist = innerHeight / 2 / Math.tan((50 * Math.PI) / 360);
      camera.position.set(0, 0, dist);
      camera.far = dist + innerWidth * 2;
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    place();
    const target = new THREE.WebGLRenderTarget(innerWidth * dpr, innerHeight * dpr);
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMat = new THREE.ShaderMaterial({
      uniforms: Object.assign({ tDiffuse: { value: target.texture } }, post.uniforms),
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: post.fragment,
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
    const mouse = new Mouse();
    const st = { renderer, scene, camera, post: postMat, mouse, dpr, time: 0 };
    st.render = () => {
      mouse.update();
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    };
    st.resize = () => {
      renderer.setSize(innerWidth, innerHeight);
      target.setSize(innerWidth * dpr, innerHeight * dpr);
      place();
    };
    addEventListener("resize", st.resize);
    /* Precompile when setting up the shader — compiling for the first time on the first cursor move freezes the screen */
    st.warm = () => { renderer.compile(scene, camera); renderer.compile(postScene, postCam); };
    st.destroy = () => {
      removeEventListener("resize", st.resize);
      mouse.destroy();
      scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
      postMat.dispose(); target.dispose();
      renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
    };
    return st;
  };

  /* Noise plate — instead of the original noise3.jpg, four layers of value noise are baked on a canvas (the grain of the spread around the mouse) */
  let noiseTex = null;
  PY.noise = () => {
    if (noiseTex) return noiseTex;
    const n = 256, c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d"), img = g.createImageData(n, n);
    const rnd = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const val = (x, y, f) => {
      const xi = Math.floor(x * f), yi = Math.floor(y * f), xf = x * f - xi, yf = y * f - yi;
      const w = (t) => t * t * (3 - 2 * t);
      const a = rnd(xi % f, yi % f), b = rnd((xi + 1) % f, yi % f), cc = rnd(xi % f, (yi + 1) % f), d = rnd((xi + 1) % f, (yi + 1) % f);
      return a + (b - a) * w(xf) + (cc - a) * w(yf) + (a - b - cc + d) * w(xf) * w(yf);
    };
    /* Stretched to use the full 0~1 range like the original noise image — if the range is narrow, the circle around the cursor is cut off at half its radius */
    const raw = new Float32Array(n * n);
    let lo = 1, hi = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const u = x / n, v = y / n;
      const s = val(u, v, 4) * 0.5 + val(u, v, 8) * 0.25 + val(u, v, 16) * 0.15 + val(u, v, 32) * 0.1;
      raw[y * n + x] = s; lo = Math.min(lo, s); hi = Math.max(hi, s);
    }
    for (let i = 0; i < n * n; i++) {
      const k = i * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.round(((raw[i] - lo) / (hi - lo || 1)) * 255);
      img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    noiseTex = new THREE.CanvasTexture(c);
    noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
    return noiseTex;
  };

  /* Placeholder photo — draws a subject shape (interior · person · landscape) per category in skin colors. Swap only the texture when a real photo goes in */
  PY.paintPhoto = (kind, seed, aspect, size = 320) => {
    const w = aspect >= 1 ? size : Math.round(size * aspect), h = aspect >= 1 ? Math.round(size / aspect) : size;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const C = {
      sky: PY.color("--site-photo-sky"), deep: PY.color("--site-photo-deep"), warm: PY.color("--site-photo-warm"),
      wood: PY.color("--site-photo-wood"), skin: PY.color("--site-photo-skin"), cloth: PY.color("--site-photo-cloth"),
      surface: PY.color("--kf-surface"), ink: PY.color("--kf-ink"), accent: PY.color("--kf-accent"), dim: PY.color("--kf-dim"),
    };
    const r = (k) => { const s = Math.sin(seed * 91.7 + k * 37.3) * 10000; return s - Math.floor(s); };
    const lin = (a, b, y0 = 0, y1 = h) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; };
    if (kind === "landscape") {
      const hz = h * (0.45 + r(1) * 0.2);
      g.fillStyle = lin(C.surface, C.sky, 0, hz); g.fillRect(0, 0, w, hz);
      g.fillStyle = C.deep;
      g.beginPath(); g.moveTo(0, hz);
      for (let i = 0; i <= 6; i++) g.lineTo((w / 6) * i, hz - h * (0.08 + r(i + 2) * 0.22));
      g.lineTo(w, hz); g.closePath(); g.fill();
      g.fillStyle = lin(C.accent, C.ink, hz, h); g.fillRect(0, hz, w, h - hz);
      g.globalAlpha = 0.25; g.fillStyle = C.surface;
      for (let i = 0; i < 6; i++) g.fillRect(r(i + 9) * w, hz + (h - hz) * r(i + 15), w * 0.3, 1.5);
      g.globalAlpha = 1;
    } else if (kind === "portrait") {
      g.fillStyle = lin(r(3) > 0.5 ? C.sky : C.warm, r(8) > 0.5 ? C.deep : C.wood); g.fillRect(0, 0, w, h);
      const cx = w * (0.4 + r(4) * 0.2), cy = h * 0.42, hr = Math.min(w, h) * 0.17;
      g.fillStyle = C.cloth;
      g.beginPath(); g.ellipse(cx, h * 1.02, w * 0.42, h * 0.42, 0, Math.PI, 0); g.fill();
      g.fillStyle = C.skin;
      g.beginPath(); g.ellipse(cx, cy, hr * 0.85, hr, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = C.ink;
      g.beginPath(); g.ellipse(cx, cy - hr * 0.35, hr * 0.92, hr * 0.7, 0, Math.PI, 0); g.fill();
    } else {
      g.fillStyle = lin(C.warm, C.wood); g.fillRect(0, 0, w, h);
      const wx = w * (0.15 + r(5) * 0.4), wy = h * 0.12;
      g.fillStyle = C.surface; g.fillRect(wx, wy, w * 0.34, h * 0.42);
      g.strokeStyle = C.wood; g.lineWidth = 3; g.strokeRect(wx, wy, w * 0.34, h * 0.42);
      g.beginPath(); g.moveTo(wx + w * 0.17, wy); g.lineTo(wx + w * 0.17, wy + h * 0.42); g.stroke();
      g.fillStyle = C.wood; g.fillRect(0, h * 0.68, w, h * 0.32);
      g.fillStyle = C.cloth; g.fillRect(w * (0.55 + r(6) * 0.2) - w * 0.12, h * 0.5, w * 0.24, h * 0.2);
      g.fillStyle = C.accent; g.beginPath(); g.arc(w * (0.2 + r(7) * 0.6), h * 0.62, Math.min(w, h) * 0.06, 0, Math.PI * 2); g.fill();
    }
    /* Film texture — needs fine patterns like a photo so the refraction (±.003) and noise circle are visible */
    const grain = Math.round((w * h) / 30);
    for (let i = 0; i < grain; i++) {
      g.globalAlpha = 0.1 + r(i * 0.37 + 11) * 0.18;
      g.fillStyle = i % 2 ? C.ink : C.surface;
      const s = 1 + Math.round(r(i * 0.53 + 3) * (size / 320));
      g.fillRect(r(i * 1.17 + 5) * w, r(i * 0.91 + 7) * h, s, s);
    }
    /* Fine strokes — short marks like hair, branches, fabric grain */
    g.lineWidth = Math.max(1, size / 512);
    for (let i = 0, n = Math.round((w * h) / 260); i < n; i++) {
      const x = r(i * 0.71 + 13) * w, y = r(i * 0.83 + 17) * h, a = r(i * 0.29 + 19) * Math.PI, l = (4 + r(i * 0.61 + 23) * 12) * (size / 320);
      g.globalAlpha = 0.18 + r(i * 0.47 + 29) * 0.25;
      g.strokeStyle = i % 3 ? C.ink : C.surface;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.globalAlpha = 1;
    return new THREE.CanvasTexture(c);
  };

  /* Line-split rise — words grouped by line, each line rises 1.5em from below (.1s between lines) */
  PY.split = (root) => {
    root.querySelectorAll("[data-py-split]").forEach((el) => {
      if (el.classList.contains("is-split")) return;
      const text = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      const words = text.map((w) => { const s = document.createElement("span"); s.textContent = w; el.append(s, " "); return s; });
      const lines = [];
      let top = null;
      words.forEach((s) => { const t = s.offsetTop; if (top === null || Math.abs(t - top) > 2) { lines.push([]); top = t; } lines[lines.length - 1].push(s.textContent); });
      el.textContent = "";
      lines.forEach((ws, i) => {
        const l = document.createElement("span"); l.className = "py-line";
        const inner = document.createElement("span"); inner.textContent = ws.join(" ");
        inner.style.transitionDelay = `${i * 0.1}s`;
        l.append(inner); el.append(l);
      });
      el.classList.add("is-split");
    });
    requestAnimationFrame(() => requestAnimationFrame(() => root.querySelectorAll("[data-py-split]").forEach((el) => el.classList.add("is-shown"))));
  };

  /* Splash exit — text swap · photo window opens · panel lifts away. The first load (home) and the end-of-about transition use the same one */
  PY.splashOut = (splash, tl, at = 0) => {
    const m = PY.isMobile();
    const q = (s) => splash.querySelectorAll(s);
    tl.to(q(".py-splash__title .in span"), { top: "-14vw", duration: 0.5, ease: "power1.in", stagger: 0.05 }, at);
    tl.to(q(".py-splash__title .out span"), { top: "0vh", duration: 0.9, ease: "power3.out", stagger: 0.05 }, "<0.2");
    tl.to(q(".py-splash h1"), { marginTop: "-30vh", duration: 2, ease: "power4.inOut" }, "<0.2");
    const inner = q(".py-splash__front-inner"), wrap = q(".py-splash__front-wrap"), front = q(".py-splash__front");
    if (m) {
      tl.to(inner, innerWidth > innerHeight ? { width: "130%", duration: 1.8, ease: "power2.inOut" } : { height: "120%", duration: 1.8, ease: "power2.inOut" }, "<");
      tl.fromTo(wrap, { clipPath: "inset(30vh 25vw 30vh 25vw)" }, { clipPath: "inset(0vh 0vw 0vh 0vw)", duration: 1.8, ease: "expo.inOut" }, "<");
    } else {
      tl.to(inner, { width: "130%", duration: 1.8, ease: "power2.inOut" }, "<");
      tl.fromTo(wrap, { clipPath: "inset(22vh 38vw 22vh 38vw)" }, { clipPath: "inset(0vh 0vw 0vh 0vw)", duration: 1.8, ease: "expo.inOut" }, "<");
      tl.to(front, { y: "-10vh", duration: 2, ease: "expo.inOut" }, "<");
    }
    tl.fromTo(splash, { clipPath: "inset(0vw 0vw 0vw 0vw)" }, { clipPath: "inset(0vw 0vw 100vh 0vw)", duration: 1.8, ease: "expo.inOut" }, "<");
    return tl;
  };

  /* Header bar — underline on the current page link */
  PY.markNav = (ns) => {
    document.querySelectorAll(".py-header [data-to]").forEach((a) => a.classList.toggle("is-nav", a.dataset.to === ns));
  };

  /* If the css·js the next page uses are not attached yet, attach them and wait until they have all loaded */
  const ensureAssets = (htmlText) => {
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const waits = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const href = new URL(l.getAttribute("href"), location.href).href;
      if ([...document.styleSheets].some((s) => s.href === href)) return;
      const n = document.createElement("link"); n.rel = "stylesheet"; n.href = href;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    doc.querySelectorAll("script[src][data-page-script]").forEach((s) => {
      const src = new URL(s.getAttribute("src"), location.href).href;
      if ([...document.scripts].some((x) => x.src === src)) return;
      const n = document.createElement("script"); n.src = src;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.body.append(n);
    });
    return Promise.all(waits);
  };

  const start = (ns, container, first) => {
    PY.markNav(ns);
    PY.current = PY.pages[ns];
    PY.current?.init(container, { first });
  };

  const boot = () => {
    const container = document.querySelector('[data-barba="container"]');
    const ns = container.dataset.barbaNamespace;
    start(ns, container, true);
    if (typeof barba === "undefined") return;
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el }) => !el || el.target === "_blank" || el.hasAttribute("data-barba-prevent"),
      transitions: [{
        name: "py-lift",
        async leave() {},
        async enter({ current, next }) {
          await ensureAssets(next.html);
          const from = current.namespace, to = next.namespace;
          const oldEl = current.container, newEl = next.container;
          html.classList.add("is-transition");
          PY.transitioning = true;
          oldEl.classList.add("is-old"); newEl.classList.add("is-new");
          const oldPage = PY.current;
          const bottom = from === "about" && PY.dynamic.about === "bottom";
          PY.fromBottom = bottom;
          start(to, newEl, false);
          /* When entering About, the new panel rises from transparent 150ms later over 1s (delay .5) — original enter hook */
          if (to === "about") {
            gsap.set(newEl, { opacity: 0 });
            setTimeout(() => gsap.fromTo(newEl, { opacity: 0 }, { opacity: 1, duration: PY.reduce ? 0 : 1, delay: PY.reduce ? 0 : 0.5 }), 150);
          }
          const tl = gsap.timeline();
          const dur = PY.reduce ? 0.01 : 1;
          if (bottom) {
            const sp = oldEl.querySelector(".py-splash");
            PY.splashOut(sp, tl, 0);
            tl.to(oldEl, { y: "-10vh", clipPath: "inset(0vh 0vw 100vh 0vw)", duration: 2, ease: "expo.inOut" }, "<");
            tl.fromTo(newEl.querySelector(".py-cover"), { opacity: 0.5 }, { opacity: 0, duration: 1 }, "<");
            tl.call(() => PY.current?.onArrive?.(3), null, "<-0.25");
          } else {
            tl.to(oldEl.querySelector(".py-cover"), { opacity: 0.5, duration: 1 * dur, ease: "power1.out" }, 0);
            tl.to(oldEl, { y: PY.isMobile() ? "-5vh" : "-10vh", clipPath: "inset(0vh 0vw 100vh 0vw)", duration: 1.8 * dur, ease: "expo.inOut" }, 0);
            tl.from(newEl, { y: "15vh", duration: 2 * dur, ease: "expo.inOut", clearProps: "transform" }, 0);
            tl.call(() => PY.current?.onArrive?.(), null, 0);
          }
          setTimeout(() => { if (to !== "home") html.classList.remove("l-dark"); }, 1200);
          await tl.then();
          oldPage?.destroy?.();
          html.classList.remove("is-transition");
          PY.transitioning = false;
          newEl.classList.remove("is-new");
        },
      }],
    });
  };
  /* Set up after load, once fonts and images are all in, like the original */
  if (document.readyState === "complete") boot();
  else addEventListener("load", boot, { once: true });
})();
