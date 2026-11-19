// Site frame — PC smooth scroll (pins the panel and follows by 20% of the remaining distance each frame), blinking bitmap title, phone menu, back to top,
// And 30 fixed-background 3D button glyphs (drifting by the scroll amount and glitching briefly on each scroll)
(() => {
  const isSp = matchMedia("(max-width: 899px)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  gsap.registerPlugin(ScrollTrigger);
  const VR = (window.VR = { isSp, isTouch, rand, css, reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, listeners: [] });

  // Original button detection — touch devices listen only to touchstart and touchend (cancelled if moved over 20px), while on PC a press counts on mouseup after mousedown (cancelled if the pointer leaves in between).
  // timing: "start" Fires the instant the surface is pressed. On touch devices it doesn’t respond to mouse click (same as the original)
  VR.btn = (el, onClick, onEnter = null, onLeave = null, timing = "end") => {
    if (!el) return;
    const START = isTouch ? "touchstart" : "mousedown", END = isTouch ? "touchend" : "mouseup";
    let sx = 0, sy = 0, moved = false, left = false;
    el.style.cursor = "pointer";
    el.addEventListener(START, (e) => {
      moved = false; left = false;
      if (isTouch) { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }
      if (timing === "start") onClick(e);
    }, { passive: true });
    if (isTouch) el.addEventListener("touchmove", (e) => { const t = e.changedTouches[0]; if (Math.abs(sx - t.clientX) > 20 || Math.abs(sy - t.clientY) > 20) moved = true; }, { passive: true });
    el.addEventListener(END, (e) => { if (!moved && !left && timing === "end") onClick(e); });
    el.addEventListener("mouseenter", () => onEnter?.());
    el.addEventListener("mouseleave", () => { left = true; onLeave?.(); });
  };

  // PC: fix #vr-container, set the body height to the content height, then have it follow via translate (the original’s own scroll panel, lerp .2)
  const scroll = {
    y: 0, yPer: 0, contH: 0, lerp: VR.reduce ? 1 : 0.2,
    init() {
      this.el = document.getElementById("vr-container");
      if (isSp) return;
      this.resize();
      new ResizeObserver(() => this.resize()).observe(this.el);
      addEventListener("resize", () => this.resize());
      gsap.ticker.add(() => this.render());
    },
    resize() {
      const h = this.el.clientHeight;
      document.body.style.height = `${h}px`;
      this.contH = Math.max(0, h - innerHeight);
    },
    render() {
      const t = this.contH ? scrollY / this.contH : 0;
      this.yPer += (t - this.yPer) * this.lerp;
      if (Math.abs(t - this.yPer) < 1e-5) this.yPer = t;
      this.y = -this.yPer * this.contH;
      this.el.style.transform = `translate3d(0,${this.y}px,0)`;
    },
    to(y, dur = 1) {
      const o = { v: scrollY };
      gsap.to(o, { v: y, duration: VR.reduce ? 0 : dur, ease: "power3.inOut", onUpdate: () => scrollTo(0, o.v) });
    },
  };
  VR.scroll = scroll;
  VR.docY = (el) => el.getBoundingClientRect().top - (isSp ? 0 : scroll.y) + (isSp ? scrollY : 0);

  // Big title: each letter stacks a normal letter and a bitmap letter, and a random letter is swapped 2~6 times at 1/45s each
  const blink = {
    init() {
      document.querySelectorAll(".js-blink span").forEach((span) => {
        const text = span.textContent;
        span.textContent = "";
        span.chars = [...text].map((ch) => {
          if (/\s/.test(ch)) { span.append(ch); return null; }
          const i = document.createElement("i"), s = document.createElement("strong"), e = document.createElement("em");
          s.textContent = ch; e.textContent = ch;
          i.append(s, e);
          span.append(i);
          VR.btn(i, () => {}, () => this.flick(i));
          i.style.cursor = "auto";
          return i;
        }).filter(Boolean);
        if (!VR.reduce) this.loop(span);
      });
    },
    loop(span) {
      this.flick(span.chars[Math.floor(rand(0, span.chars.length))]);
      gsap.delayedCall(isSp ? rand(0.15, 1.3) : rand(1.5, 3.5), () => this.loop(span));
    },
    flick(i) {
      if (!i || VR.reduce) return;
      const s = i.firstChild.style, e = i.lastChild.style, step = 1 / 45, n = Math.floor(rand(2, 7));
      let t = 0;
      for (let k = 0; k < n; k++) {
        gsap.delayedCall(t, () => { s.visibility = "hidden"; e.visibility = "visible"; });
        t += step;
        gsap.delayedCall(t, () => { s.visibility = "visible"; e.visibility = "hidden"; });
        t += step;
      }
    },
  };

  // Phone menu: on open, panel height becomes screen height, on close it lifts over .35s with -hide then cleans up. Tapping a menu item closes it, then .35s later scrolls to that section over 1s
  const navSp = {
    init() {
      this.el = document.getElementById("vr-navsp");
      this.toggle = document.getElementById("vr-navsp-toggle");
      if (!this.el) return;
      VR.btn(this.toggle.querySelector(".vr-navsp__open"), () => this.show());
      VR.btn(this.toggle.querySelector(".vr-navsp__close"), () => this.hide());
      this.el.querySelectorAll("[data-target]").forEach((li) => VR.btn(li, () => {
        this.hide();
        const t = document.getElementById(li.dataset.target);
        gsap.delayedCall(0.35, () => scroll.to(VR.docY(t) - (isSp ? (40 / 750) * innerWidth : 50), 1));
      }));
    },
    show() { this.el.classList.add("-show"); this.toggle.classList.add("-close"); this.el.style.height = `${innerHeight}px`; },
    hide() {
      this.el.classList.add("-hide"); this.toggle.classList.add("-back");
      gsap.delayedCall(0.35, () => { this.el.classList.remove("-show", "-hide"); this.toggle.classList.remove("-back", "-close"); this.el.style.height = "0px"; });
    },
  };

  // Back to top: stack two images vertically and roll them up by -50% on each hover (.6 expo.out)
  const pagetop = {
    init() {
      const el = document.getElementById("vr-pagetop");
      if (!el) return;
      const inner = el.querySelector(".vr-pagetop__inner");
      VR.btn(el, () => scroll.to(0, 1), () => gsap.fromTo(inner, { y: 0 }, { duration: 0.6, ease: "expo.out", y: "-50%" }));
    },
  };

  // Hero menu: on hover it shifts 7px and tilts -12° (.07 expo.out), on release it returns at .05 then relaxes the tilt over .1 power3.out
  const kvNav = {
    init() {
      document.querySelectorAll(".vr-kv__nav li").forEach((li) => {
        const span = li.querySelector("span");
        VR.btn(li,
          () => scroll.to(VR.docY(document.getElementById(li.dataset.target)) - (isSp ? (50 / 750) * innerWidth : 50), 1),
          () => { gsap.killTweensOf(span); gsap.to(span, { duration: 0.07, ease: "expo.out", x: 7, skewX: -12 }); },
          () => {
            gsap.killTweensOf(span);
            gsap.to(span, { duration: 0.05, ease: "expo.out", x: 0 });
            gsap.to(span, { duration: 0.1, delay: 0.05, ease: "power3.out", skewX: 0 });
          });
      });
    },
  };

  // Background 3D: scatters 30 thinly extruded pad button glyphs (ring · A · B · O · + · □ · △ · X · Y) wearing placeholder textures, and
  // Raises the group by the distance scrolled down the document (PC 5000 × progress, phone 4000). On each scroll, a 0 to .15s digital glitch
  const glyphs = {
    init() {
      this.el = document.getElementById("vr-bg");
      if (!this.el || !window.THREE) return;
      const T = THREE;
      this.canvas = document.createElement("canvas");
      this.el.prepend(this.canvas);
      this.ww = innerWidth; this.wh = innerHeight; this.stockWH = 0;
      this.stage();
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(45, this.ww / this.wh, 0.1, 3000);
      this.camera.position.set(0, 0, 200);
      this.renderer = new T.WebGLRenderer({ alpha: true, antialias: true, precision: isTouch ? "highp" : "lowp", canvas: this.canvas });
      this.renderer.outputEncoding = T.sRGBEncoding;
      this.renderer.setPixelRatio(isTouch ? Math.min(2, devicePixelRatio) : 1);
      this.renderer.setSize(this.ww, this.wh);
      this.renderer.autoClear = false;
      this.composer = new T.EffectComposer(this.renderer);
      this.composer.addPass(new T.RenderPass(this.scene, this.camera));
      this.glitch = new T.ShaderPass(T.DigitalGlitch);
      this.glitch.uniforms.tDisp.value = this.heightmap(isSp ? 96 : 256);
      this.glitch.uniforms.byp.value = 1;
      this.glitch.renderToScreen = true;
      this.composer.addPass(this.glitch);
      this.running = false;
      this.wrap = new T.Group();
      this.scene.add(this.wrap);
      const mats = Array.from({ length: 10 }, (_, i) => new T.MeshBasicMaterial({ side: T.DoubleSide, map: this.texture(i) }));
      const shapes = this.shapes();
      const ring = shapes.circle;
      const pieces = ["A", "B", "O", "cross", "square", "triangle", "X", "Y"];
      for (let i = 0; i < 30; i++) {
        const g = new T.Group();
        g.add(new T.Mesh(shapes[pieces[i % pieces.length]], mats[i % 9]));
        g.add(new T.Mesh(ring, mats[9]));
        g.scale.set(200, 200, 200);
        g.rotation.set((rand(-360, 360) * Math.PI) / 180, (rand(-360, 360) * Math.PI) / 180, (rand(-360, 360) * Math.PI) / 180);
        g.position.set(rand(-150, 150), -300 * i, isSp ? rand(-500, -100) : rand(-500, 0));
        this.wrap.add(g);
      }
      addEventListener("scroll", () => this.kick(rand(0, 0.15)), { passive: true });
      addEventListener("resize", () => this.resize());
      gsap.ticker.add(() => this.render());
    },
    // Stand-in for the original photo texture — a neon-striped plate painted in the accent and skin colors
    texture(i) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      // The original pieces wear neon photos and glow glass-like bright — set as a rainbow plate mixing white text color, accent color and pale apricot.
      const cols = [css("--kf-ink"), css("--kf-accent"), css("--kf-raised"), css("--kf-accent-soft")];
      const g = x.createLinearGradient(0, 0, 128, 128);
      g.addColorStop(0, cols[i % 4]);
      g.addColorStop(0.5, cols[0]);
      g.addColorStop(1, cols[(i + 1) % 4]);
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      x.globalAlpha = 0.25; x.fillStyle = cols[(i + 2) % 4];
      for (let k = -128; k < 256; k += 24) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 10, 0); x.lineTo(k - 118, 128); x.lineTo(k - 128, 128); x.fill(); }
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      return t;
    },
    // Extrude our shapes at the same silhouette and thickness as the original model (floor around .6, thickness .02~.04) — laid flat on the XZ plane
    shapes() {
      const T = THREE, S = (fn) => { const s = new T.Shape(); fn(s); return s; };
      const ring = (r1, r2) => S((s) => { s.absarc(0, 0, r1, 0, Math.PI * 2, false); const h = new T.Path(); h.absarc(0, 0, r2, 0, Math.PI * 2, true); s.holes.push(h); });
      const bar = (s, x1, y1, x2, y2, w) => { const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, dx = Math.cos(a) * w / 2, dy = Math.sin(a) * w / 2; s.moveTo(x1 + dx, y1 + dy); s.lineTo(x2 + dx, y2 + dy); s.lineTo(x2 - dx, y2 - dy); s.lineTo(x1 - dx, y1 - dy); s.closePath(); };
      const multi = (list) => list.map((fn) => S(fn));
      const ext = (shape, depth) => {
        const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -depth / 2, 0);
        return geo;
      };
      return {
        circle: ext(ring(0.3, 0.26), 0.04),
        O: ext(ring(0.24, 0.17), 0.04),
        A: ext(multi([(s) => bar(s, -0.2, -0.28, 0, 0.28, 0.1), (s) => bar(s, 0.2, -0.28, 0, 0.28, 0.1), (s) => bar(s, -0.1, -0.05, 0.1, -0.05, 0.08)]), 0.04),
        B: ext(multi([(s) => bar(s, -0.15, -0.29, -0.15, 0.29, 0.1), (s) => { s.absarc(-0.02, 0.14, 0.15, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-0.02, 0.06); s.absarc(-0.02, 0.14, 0.07, Math.PI / 2, -Math.PI / 2, true); s.closePath(); }, (s) => { s.absarc(0, -0.14, 0.16, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, -0.06); s.absarc(0, -0.14, 0.08, Math.PI / 2, -Math.PI / 2, true); s.closePath(); }]), 0.04),
        cross: ext(multi([(s) => bar(s, -0.3, 0, 0.3, 0, 0.12), (s) => bar(s, 0, -0.3, 0, 0.3, 0.12)]), 0.04),
        square: ext(S((s) => { s.moveTo(-0.24, -0.24); s.lineTo(0.24, -0.24); s.lineTo(0.24, 0.24); s.lineTo(-0.24, 0.24); s.closePath(); const h = new T.Path(); h.moveTo(-0.17, -0.17); h.lineTo(-0.17, 0.17); h.lineTo(0.17, 0.17); h.lineTo(0.17, -0.17); h.closePath(); s.holes.push(h); }), 0.04),
        triangle: ext(S((s) => { s.moveTo(0, 0.3); s.lineTo(0.3, -0.22); s.lineTo(-0.3, -0.22); s.closePath(); const h = new T.Path(); h.moveTo(0, 0.17); h.lineTo(-0.19, -0.16); h.lineTo(0.19, -0.16); h.closePath(); s.holes.push(h); }), 0.04),
        X: ext(multi([(s) => bar(s, -0.24, -0.3, 0.24, 0.3, 0.11), (s) => bar(s, 0.24, -0.3, -0.24, 0.3, 0.11)]), 0.04),
        Y: ext(multi([(s) => bar(s, -0.24, 0.3, 0, 0, 0.11), (s) => bar(s, 0.24, 0.3, 0, 0, 0.11), (s) => bar(s, 0, 0.02, 0, -0.32, 0.11)]), 0.04),
      };
    },
    heightmap(n) {
      const d = new Float32Array(n * n * 3);
      for (let i = 0; i < n * n; i++) { const v = Math.random(); d[i * 3] = d[i * 3 + 1] = d[i * 3 + 2] = v; }
      const t = new THREE.DataTexture(d, n, n, THREE.RGBFormat, THREE.FloatType);
      t.needsUpdate = true;
      return t;
    },
    kick(sec) {
      if (VR.reduce) return;
      this.running = true;
      this.off?.kill();
      this.off = gsap.delayedCall(sec, () => { this.running = false; });
    },
    stage() {
      this.ww = innerWidth; this.wh = innerHeight;
      if (isSp) { if (this.stockWH < this.wh) this.stockWH = this.wh; this.wh = this.stockWH; }
      this.canvas.style.height = `${this.wh}px`;
    },
    resize() {
      this.stage();
      this.camera.aspect = this.ww / this.wh;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.ww, this.wh);
      this.composer.setSize(this.ww, this.wh);
    },
    render() {
      if (isSp) this.wrap.position.y = 4000 * (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
      else this.wrap.position.y = 5000 * scroll.yPer;
      const u = this.glitch.uniforms;
      u.seed.value = Math.random() * 1.8;
      if (this.running) {
        u.byp.value = 0;
        u.amount.value = Math.random() / 10;
        u.angle.value = 0;
        u.distortion_x.value = THREE.MathUtils.randFloat(-10, 10);
        u.distortion_y.value = isSp ? THREE.MathUtils.randFloat(-10, 10) : 0;
        u.seed_x.value = isSp ? THREE.MathUtils.randFloat(-0.1, 0.1) : THREE.MathUtils.randFloat(-0.5, 0.5);
        u.seed_y.value = isSp ? THREE.MathUtils.randFloat(-0.1, 0.1) : 0;
      } else u.byp.value = 1;
      this.composer.render();
    },
  };

  VR.boot = (pageInit) => {
    const mm = gsap.matchMedia();
    mm.add({ still: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      if (VR.booted) return;
      VR.booted = true;
      VR.reduce = ctx.conditions.still;
      scroll.lerp = VR.reduce ? 1 : 0.2;
      scroll.init();
      blink.init();
      navSp.init();
      pagetop.init();
      kvNav.init();
      glyphs.init();
      pageInit?.();
      ScrollTrigger.refresh();
    });
  };
})();
