/* Spans multiple pages — original values:
   Lenis 1.0.27 (lerp .1), parallax (scrub .5 by data-speed), is-visible when the section is 15% above the screen bottom, js-easing-fade turned on after .1s,
   When the footer reaches the bottom 20% of the screen the header hides, and clicking a link fades the body over .6s and navigates .5s later.
   Menu drawer: hovering an item switches the left photo to that item’s (1.05x over 2.4s), and the hidden circle cursor follows with .2s power1.out.
   The guest room photo strip is .5px per frame, and the photo plate (WebGL) mixes displacement every 3 seconds with 1.5s power2.out, starting 2 seconds after it reaches the screen. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const BK = (window.BK = { reduce, fine });
  const rem = () => parseFloat(getComputedStyle(html).fontSize) || 10;
  gsap.registerPlugin(ScrollTrigger);

  // ───── Smooth scroll ─────
  // The Lenis 1.0.27 UMD global name is lowercase lenis
  const LenisCtor = window.Lenis || window.lenis;
  const lenis = (BK.lenis = new LenisCtor({ lerp: reduce ? 1 : 0.1, duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 4) }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───── Parallax ─────
  if (!reduce) $$(".js-parallax").forEach((el) => {
    const y = el.dataset.y || el.dataset.speed;
    if (y) gsap.to(el, { y: +y, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } });
  });

  // ───── When a section enters, add is-visible (original rootMargin 0 0 −15%) — already passed ones get it immediately ─────
  const se = (el) => {
    if (el.getBoundingClientRect().top + scrollY <= scrollY) return el.classList.add("is-visible");
    const io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }), { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
  };
  BK.se = se;
  $$("[data-se]").forEach(se);
  const foot = $(".footer");
  if (foot) se(foot);
  gsap.delayedCall(0.1, () => $$(".js-easing-fade, .js-easing-blur").forEach((n) => n.classList.add("is-visible")));

  // ───── Header — hides upward when the footer reaches 20% from the screen bottom ─────
  if (foot) new IntersectionObserver((list) => list.forEach((e) => $("#header")?.classList.toggle("is-hidden", e.isIntersecting)), { rootMargin: "0px 0px -80% 0px" }).observe(foot);

  // ───── Menu drawer ─────
  const drawer = (BK.drawer = {
    open: false,
    toggle(v = !this.open) {
      this.open = v;
      html.classList.toggle("drawerMenu-open", v);
      $$(".header__menu").forEach((b) => b.setAttribute("aria-expanded", String(v)));
      v ? lenis.stop() : lenis.start();
    },
  });
  $$(".header__menu").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); drawer.toggle(); }));
  addEventListener("keydown", (e) => e.key === "Escape" && drawer.open && drawer.toggle(false));
  if (fine) {
    const bgs = $$(".drawerMenu__img .bg");
    const page = document.body.dataset.page;
    const cur = { index: "home", about: "about", product: "product", news: "news", article: "news" }[page];
    bgs.forEach((b) => b.classList.toggle("is-current", b.dataset.key === cur));
    $$(".drawerMenu .m-gnav .item").forEach((it) => {
      it.addEventListener("mouseenter", () => bgs.forEach((b) => b.classList.toggle("is-on", b.dataset.key === it.dataset.key)));
      it.addEventListener("mouseleave", () => bgs.forEach((b) => b.classList.remove("is-on")));
    });
  }

  // ───── Smooth inner links (original .ss — stops 10 lines of text above, .5s straight) ─────
  $$(".js-ss").forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    lenis.scrollTo(t, { offset: -10 * rem(), duration: 0.5, easing: (x) => x });
  }));

  // ───── On navigation the body blurs — next document loads .5s after the press ─────
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^(mailto|tel):/.test(href) || a.origin !== location.origin) return;
    e.preventDefault();
    drawer.open && drawer.toggle(false);
    if (reduce) return void (location.href = a.href);
    $$(".js-bodyChange").forEach((n) => n.classList.add("is-hidden"));
    setTimeout(() => { location.href = a.href; }, 500);
  });
  addEventListener("pageshow", (e) => e.persisted && $$(".js-bodyChange").forEach((n) => n.classList.remove("is-hidden")));

  // ───── Hidden circle cursor ─────
  if (fine && !reduce) {
    const ptr = $(".pointer"), cur = $(".pointer__cursor", ptr);
    const sx = sessionStorage.getItem("bk-x"), sy = sessionStorage.getItem("bk-y");
    if (sx && sy) gsap.set(ptr, { x: +sx, y: +sy });
    let over = false;
    addEventListener("mousemove", (e) => {
      gsap.to(ptr, { duration: 0.2, ease: "power1.out", x: e.clientX, y: e.clientY, overwrite: "auto" });
      sessionStorage.setItem("bk-x", e.clientX);
      sessionStorage.setItem("bk-y", e.clientY);
      if (over && !e.target.closest("a, button, label")) { over = false; cur.classList.remove("is-mouseon", "is-mouseon_icon", "is-mouseon_circle"); cur.innerHTML = ""; }
    }, { passive: true });
    const kinds = { viewroom: "is-mouseon_viewroom", nextback: "is-mouseon_nextback" };
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("a, button, label");
      if (!t || t.contains(e.relatedTarget)) return;
      over = true;
      const k = kinds[t.dataset.cursor];
      if (k) { cur.classList.add(k); cur.innerHTML = `<span class="txt">${t.dataset.cursorText || ""}</span>`; } else cur.classList.add("is-mouseon");
    });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest("a, button, label");
      if (!t || t.contains(e.relatedTarget)) return;
      over = false;
      const k = kinds[t.dataset.cursor];
      if (k) { cur.classList.remove(k); cur.innerHTML = ""; } else cur.classList.remove("is-mouseon");
    });
    document.addEventListener("mousedown", (e) => e.target.closest("a, button, label") && cur.classList.add("is-mousedown"));
    document.addEventListener("mouseup", () => cur.classList.remove("is-mousedown"));
  }

  // ───── Sound button (only one of the two videos has sound) ─────
  $$(".js-sound").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const v = $(b.dataset.target);
    if (!v) return;
    $$(".js-sound").forEach((o) => { if (o !== b) { o.classList.remove("on"); const ov = $(o.dataset.target); if (ov) ov.muted = true; } });
    v.play().catch(() => {});
    v.muted = !v.muted;
    b.classList.toggle("on", !v.muted);
  }));

  // ───── Room photo strip — four more are chained on, moving .5px per frame as one frame, and when the third group leaves the panel it returns to the start position (−2 groups) ─────
  $$(".bk-cabin__slide").forEach((box) => {
    const wrap = $(".loopWrap", box), group = $(".loopGroup", wrap);
    if (!group) return;
    for (let i = 0; i < 4; i++) wrap.append(group.cloneNode(true));
    const items = $$(".loopGroup", wrap);
    let x = -2 * items[2].offsetWidth;
    wrap.style.transform = `translate3d(${x}px,0,0)`;
    if (reduce) return;
    gsap.ticker.add(() => { x -= 0.5; wrap.style.transform = `translate3d(${x}px,0,0)`; });
    new IntersectionObserver((list) => list.forEach((e) => { if (!e.isIntersecting) x = -2 * items[2].offsetWidth; }), { root: box }).observe(items[2]);
  });

  // ───── Photo plate — blends into the next photo with a displacement shader (our shader, our displacement pattern) ─────
  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const FRAG = [
    "uniform float progress; uniform float intensity; uniform sampler2D texture1; uniform sampler2D texture2; uniform sampler2D displacement; uniform vec4 resolution; varying vec2 vUv;",
    "mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }",
    "void main(){",
    "  vec2 uv = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);",
    "  vec2 d = texture2D(displacement, uv).rg;",
    "  vec4 a = texture2D(texture1, uv + rot(-0.785398) * d * intensity * progress);",
    "  vec4 b = texture2D(texture2, uv + rot(2.356194) * d * intensity * (1.0 - progress));",
    "  gl_FragColor = mix(a, b, progress);",
    "}",
  ].join("\n");
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  // Photo-slot art — a plate made from the skin’s base and ink colors with a label written on it (instead of the original photos)
  const photo = (label, i) => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    const ink = css("--kf-ink") || "currentColor", bg = css("--kf-bg") || "currentColor", dim = css("--kf-dim") || ink;
    const grad = g.createLinearGradient(0, 0, 512 * (i % 2 ? 1 : 0.3), 512);
    grad.addColorStop(0, i % 2 ? ink : dim);
    grad.addColorStop(1, i % 2 ? dim : bg);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    g.globalAlpha = 0.18;
    for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(80 + ((k * 151 + i * 97) % 360), 60 + ((k * 89 + i * 53) % 400), 30 + ((k * 37) % 90), 0, 7); g.fillStyle = k % 2 ? bg : ink; g.fill(); }
    g.globalAlpha = 1;
    g.fillStyle = i % 2 ? bg : ink;
    g.font = `500 22px ${css("--kf-font-sans") || "serif"}`;
    g.textAlign = "center";
    g.fillText(label, 256, 260);
    return c;
  };
  const dispMap = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d"), img = g.createImageData(256, 256);
    const n = (x, y, s) => Math.sin(x * s + Math.sin(y * s * 1.7) * 2.1) * 0.5 + Math.sin(y * s * 0.8 + Math.cos(x * s * 1.3) * 1.7) * 0.5;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4, v = n(x, y, 0.045) * 0.6 + n(x + 40, y - 20, 0.11) * 0.4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(127 + 120 * v);
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  };
  class Mix {
    constructor(el) {
      this.el = el;
      this.labels = (el.dataset.labels || "Photo").split("|");
      this.current = 0;
      this.running = false;
    }
    build() {
      const T = window.THREE;
      this.renderer = new T.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      this.renderer.setClearColor(new T.Color(css("--kf-bg") || "#eeeeee"), 1); /* Not skin: default GL background used only when the skin variable is empty */
      this.el.appendChild(this.renderer.domElement);
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(70, 1, 0.001, 1000);
      this.camera.position.set(0, 0, 2);
      this.textures = this.labels.map((l, i) => new T.CanvasTexture(photo(l, i)));
      const disp = new T.CanvasTexture(dispMap());
      disp.wrapS = disp.wrapT = T.RepeatWrapping;
      this.material = new T.ShaderMaterial({
        side: T.DoubleSide,
        uniforms: { progress: { value: 0 }, intensity: { value: 1 }, texture1: { value: this.textures[0] }, texture2: { value: this.textures[1 % this.textures.length] }, displacement: { value: disp }, resolution: { value: new T.Vector4(1, 1, 1, 1) } },
        vertexShader: VERT, fragmentShader: FRAG,
      });
      this.plane = new T.Mesh(new T.PlaneGeometry(1, 1, 2, 2), this.material);
      this.scene.add(this.plane);
      this.renderer.compile(this.scene, this.camera);
      this.resize();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.el);
      this.tick = () => this.renderer.render(this.scene, this.camera);
      gsap.ticker.add(this.tick);
    }
    resize() {
      const w = this.el.offsetWidth || 1, h = this.el.offsetHeight || 1;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      const z = this.camera.position.z;
      this.camera.fov = (180 / Math.PI) * 2 * Math.atan(1 / (2 * z));
      this.plane.scale.set(this.camera.aspect, 1, 1);
      const ia = 1;
      const a = h / w > ia ? (w / h) * ia : 1, b = h / w > ia ? 1 : h / w / ia;
      this.material.uniforms.resolution.value.set(w, h, a, b);
      this.camera.updateProjectionMatrix();
    }
    next() {
      if (this.running || this.textures.length < 2) return;
      this.running = true;
      const n = this.textures.length, nx = this.textures[(this.current + 1) % n];
      this.material.uniforms.texture2.value = nx;
      gsap.to(this.material.uniforms.progress, {
        value: 1, duration: 1.5, ease: "power2.out",
        onComplete: () => { this.current = (this.current + 1) % n; this.material.uniforms.texture1.value = nx; this.material.uniforms.progress.value = 0; this.running = false; },
      });
    }
  }
  BK.collage = (root = document) => {
    const intro = $(".bk-around__intro", root);
    if (!intro || !window.THREE) return;
    const mixes = $$(".item__img[id]", intro).map((el) => new Mix(el));
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      intro.classList.add("is-visible");
      mixes.forEach((m) => { try { m.build(); } catch (err) { m.failed = true; } });
      if (reduce) return;
      setTimeout(() => { mixes.forEach((m) => !m.failed && m.next()); setInterval(() => mixes.forEach((m) => !m.failed && m.next()), 3000); }, 2000);
    };
    // Original: the panel stands up when the section head touches the top edge of the screen (rootMargin 0 0 −100%)
    const target = intro.closest("section") || intro;
    const io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { start(); io.disconnect(); } }), { rootMargin: "0px 0px -100% 0px" });
    io.observe(target);
    if (target.getBoundingClientRect().top <= 0) start();
  };
})();
