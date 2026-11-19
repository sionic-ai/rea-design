// Motion for each home section — values as in the original (language cards · weight breathing · circular photo strip · record row photo panel · contact field photo)
(() => {
  const VR = window.VR;
  const { isSp, isTouch, rand } = VR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const seen = (el, on, off, margin = "0% 0%") => new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? on() : off?.())), { rootMargin: margin, threshold: 0 }).observe(el);

  // ── Hero slogan (PC): placed over the lower part of the photo and sent down as you scroll ──
  const catchPc = {
    init() {
      if (isSp) return;
      this.el = $("#vr-kv-catch");
      this.txt = $(".vr-catch__txt", this.el);
      this.img = $(".vr-kv__img-pc");
      this.place();
      addEventListener("resize", () => this.place());
    },
    place() {
      const r = this.img.getBoundingClientRect();
      const e = this.txt.offsetHeight;
      const top = Math.min(innerHeight - 23 - 0.3175 * e, r.top + r.height - 23 - 0.5 * e);
      const h = r.top + r.height - 23 + 0.5 * e - top;
      this.el.style.top = `${top}px`;
      this.el.style.height = `${h}px`;
      ScrollTrigger.getById("vr-catch")?.kill();
      if (h - e > 0) gsap.to(this.txt, { y: h - e, ease: "none", scrollTrigger: { trigger: this.el, start: `top ${top}px`, end: "center 70%", scrub: 0.1, id: "vr-catch" } });
      this.el.classList.add("-show");
    },
  };

  // ── Hero news band: flows only while visible ──
  const topic = { init() { const it = $("#vr-topic-item"); if (it && !VR.reduce) seen($("#vr-topic"), () => it.classList.add("-slide"), () => it.classList.remove("-slide")); } };

  // ── Phone hero: two images drawn as a triangle-shard plate, shards scatter from the bottom and vanish with an edge glow, revealing the next image (1.5s, starting after 3s, resting 4.5s) ──
  const kvSp = {
    init() {
      if (!isSp || !window.THREE) return;
      const box = $("#vr-kv-gl");
      const T = THREE;
      this.box = box;
      this.w = box.offsetWidth; this.h = box.offsetHeight;
      this.renderer = new T.WebGLRenderer({ antialias: false, alpha: false });
      this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
      this.renderer.setSize(this.w, this.h);
      box.append(this.renderer.domElement);
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(70, this.w / this.h, 0.001, 1000);
      this.camera.position.set(0, 0, 2);
      this.camera.fov = (360 / Math.PI) * Math.atan(1 / 2);
      this.camera.updateProjectionMatrix();
      this.tex = [this.texture("Key Visual 1", 0), this.texture("Key Visual 2", 1)];
      this.index = 0; this.p = { v: 0 };
      const geo = this.grid(24);
      this.matA = this.material(this.tex[0]);
      this.matB = this.material(this.tex[1]);
      this.front = new T.Mesh(geo, this.matA);
      this.back = new T.Mesh(geo, this.matB);
      this.back.position.z = -1e-4;
      this.front.scale.set(this.w / this.h, 1, 1); this.back.scale.set(this.w / this.h, 1, 1);
      this.scene.add(this.front, this.back);
      this.render();
      box.classList.add("-ready");
      if (!VR.reduce) gsap.delayedCall(3, () => this.next());
    },
    texture(label, n) {
      const c = document.createElement("canvas");
      c.width = 590; c.height = 883;
      const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, VR.css(n ? "--kf-accent" : "--kf-contrast-bg"));
      g.addColorStop(1, VR.css(n ? "--kf-contrast-bg" : "--kf-accent"));
      x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = VR.css("--kf-ink"); x.font = `700 40px ${VR.css("--kf-font-sans")}`; x.textAlign = "center";
      x.fillText(label, c.width / 2, c.height / 2);
      x.font = `400 22px ${VR.css("--kf-font-sans")}`;
      x.fillText(n ? "Person gaming under neon · portrait 2:3" : "Two hooded people behind a wire fence · portrait 2:3", c.width / 2, c.height / 2 + 40);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      return t;
    },
    // A triangle grid staggered into hexagons — each piece’s vanish order (lower goes first + noise) is stored on the vertices
    grid(cols) {
      const T = THREE, pos = [], uv = [], ord = [], bary = [];
      const r = 2 / cols, s = (r * Math.sqrt(3)) / 2, rows = Math.ceil(2 / s);
      const push = (x, y) => { pos.push(x - 1, y - 1, 0); uv.push(x / 2, y / 2); };
      for (let m = 0; m < rows; m++) {
        const y = m * s, off = m % 2 ? -r / 2 : 0;
        for (let k = 0; k <= cols; k++) {
          const x = k * r + off;
          const o1 = Math.min(1, Math.max(0, y / 2 + (2 * (Math.sin(k * 1.7 + m * 2.3) * 0.5 + Math.random())) / cols));
          push(x, y); push(x + r / 2, y + s); push(x - r / 2, y + s); ord.push(o1, o1, o1); bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
          const o2 = Math.min(1, Math.max(0, y / 2 + (2 * (Math.sin((k + 1) * 1.7 + m * 2.3) * 0.5 + Math.random())) / cols));
          push(x, y); push(x + r, y); push(x + r / 2, y + s); ord.push(o2, o2, o2); bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(new Float32Array(pos), 3));
      g.setAttribute("uv", new T.BufferAttribute(new Float32Array(uv), 2));
      g.setAttribute("order", new T.BufferAttribute(new Float32Array(ord), 1));
      g.setAttribute("bary", new T.BufferAttribute(new Float32Array(bary), 3));
      return g;
    },
    material(tex) {
      return new THREE.ShaderMaterial({
        extensions: { derivatives: true },
        transparent: true, depthTest: false, depthWrite: false,
        uniforms: { uP: { value: 0 }, uTex: { value: tex } },
        vertexShader: `
          uniform float uP; attribute float order; attribute vec3 bary;
          varying vec2 vUv; varying float vFade; varying float vEdge; varying vec3 vBary;
          void main() {
            vUv = uv; vBary = bary;
            float late = 1.0 - order;
            vFade = clamp((uP - late * 0.6) / 0.4, 0.0, 1.0);
            vEdge = clamp((uP - clamp(late - 0.1, 0.0, 1.0) * 0.9) / 0.1, 0.0, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform sampler2D uTex; varying vec2 vUv; varying float vFade; varying float vEdge; varying vec3 vBary;
          void main() {
            vec3 d = fwidth(vBary);
            vec3 line = smoothstep(d * 0.85, d * -0.15, vBary);
            float edge = max(max(line.x, line.y), line.z);
            vec4 t = texture2D(uTex, vUv);
            gl_FragColor = vec4(t.rgb + vec3(edge) * vEdge, 1.0 - vFade);
          }`,
      });
    },
    next() {
      if (this.busy) return;
      this.busy = true;
      this.index++;
      gsap.to(this.p, {
        v: 1, duration: 1.5, ease: "none",
        onUpdate: () => { this.matA.uniforms.uP.value = this.p.v; this.render(); },
        onComplete: () => {
          this.busy = false; this.p.v = 0;
          this.matA.uniforms.uP.value = 0;
          this.matA.uniforms.uTex.value = this.tex[this.index % 2];
          this.matB.uniforms.uTex.value = this.tex[(this.index + 1) % 2];
          this.render();
          gsap.delayedCall(4.5, () => this.next());
        },
      });
    },
    render() { this.renderer.render(this.scene, this.camera); },
  };

  // ── ABOUT: language buttons light up the lead letters flickering in a shuffled order, and fly that language’s card in from beyond the right edge to pin it on top ──
  const about = {
    init() {
      this.el = $("#vr-about");
      this.type = "en";
      this.lead = $("#vr-lead");
      this.imgs = $$(".vr-lead-img", this.lead);
      this.letters = {};
      ["en", "ja", "zh", "ko"].forEach((k) => {
        this.letters[k] = [];
        $$(`.${k}`, this.lead).forEach((sp) => {
          const t = sp.textContent;
          sp.textContent = "";
          [...t].forEach((ch) => {
            if (/\s/.test(ch)) { sp.append(ch); return; }
            const i = document.createElement("i");
            i.textContent = ch;
            sp.append(i);
            this.letters[k].push(i.style);
          });
        });
      });
      this.cards = Object.fromEntries($$(".vr-greet", this.el).map((c) => [c.dataset.lang, c]));
      this.order = ["zh", "ko", "ja", "en"].map((k) => this.cards[k]);
      this.btns = $$(".vr-about__lang li", this.el);
      this.btns.forEach((li) => VR.btn(li, () => this.change(li.dataset.lang)));
      Object.entries(this.cards).forEach(([k, card]) => {
        const inner = $(".inner", card);
        VR.btn(inner,
          () => { if (this.type !== k) { this.cardOut(inner); this.change(k); } },
          () => this.type !== k && this.cardIn(inner),
          () => this.type !== k && this.cardOut(inner));
      });
      this.cursor();
    },
    cursor() { Object.entries(this.cards).forEach(([k, c]) => { $(".inner", c).style.cursor = k === this.type ? "auto" : "pointer"; }); },
    cardIn(el) { if (!isSp) gsap.to(el, { duration: 0.1, ease: "power4.out", scale: 1.02 }); },
    cardOut(el) { if (!isSp) gsap.to(el, { duration: 0.1, ease: "power4.out", scale: 1 }); },
    change(k) {
      if (this.type === k) return;
      this.type = k;
      this.btns.forEach((b) => b.classList.toggle("-current", b.dataset.lang === k));
      this.lead.classList.remove("-show-en", "-show-ja", "-show-zh", "-show-ko");
      this.lead.classList.add(`-show-${k}`);
      const gap = k === "en" ? 0.008 : k === "ja" ? 0.015 : 0.02;
      const list = shuffle(this.letters[k]);
      list.forEach((s) => { s.visibility = VR.reduce ? "visible" : "hidden"; });
      if (!VR.reduce) {
        let n = -1;
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          n++;
          const s = list[n];
          if (!s) { clearInterval(this.timer); return; }
          s.visibility = "visible";
          gsap.delayedCall(0.015, () => { s.visibility = "hidden"; });
          gsap.delayedCall(0.035, () => { s.visibility = "visible"; });
          if (n >= list.length - 1) clearInterval(this.timer);
        }, gap * 1000);
      }
      const a = rand(0, 0.12), b = rand(0.12, 0.24), first = Math.random() > 0.5;
      gsap.fromTo(this.imgs[0], { scaleY: 0 }, { delay: first ? a : b, duration: 0.17, ease: "power4.inOut", scaleY: 1 });
      gsap.fromTo(this.imgs[1], { scaleY: 0 }, { delay: first ? b : a, duration: 0.17, ease: "power4.inOut", scaleY: 1 });
      gsap.to(Object.values(this.cards), { delay: 0.37, duration: 0.3, ease: "expo.out", x: "0%", y: "0%" });
      this.fly(this.cards[k]);
      this.cursor();
    },
    fly(card) {
      const P = isSp
        ? { en: ["5%", "-5%", "0%", "0%"], ja: ["-10%", "20%", "0%", "0%"], zh: ["0%", "0%", "0%", "0%"], ko: ["-10%", "30%", "0%", "0%"] }
        : { en: ["7%", "0%", "38%", "20%"], ja: ["-18%", "15%", "-50%", "-10%"], zh: ["10%", "25%", "-25%", "20%"], ko: ["10%", "0%", "45%", "-26%"] };
      const [yOut, yIn, x, y] = P[this.type];
      gsap.killTweensOf(card);
      gsap.to(card, {
        duration: 0.3, ease: "power4.out", x: `-=${innerWidth}`, y: yOut,
        onComplete: () => {
          const i = this.order.indexOf(card);
          if (i > -1) this.order.splice(i, 1);
          this.order.push(card);
          this.order.forEach((c, z) => { c.style.zIndex = z; });
          gsap.fromTo(card, { x: "100vw", y: yIn }, { duration: 0.5, ease: "expo.out", x, y });
          gsap.fromTo(card, { skewX: "-10deg", skewY: "0deg", scaleX: 1.3 }, { duration: 0.5, ease: "power1.out", skewX: "0deg", skewY: "0deg", scaleX: 1 });
        },
      });
    },
  };

  // ── FOLLOW: link text weight breathes at an .85s tempo, and on hover becomes 700 · -10° ──
  const follow = {
    init() {
      this.spans = $$(".vr-follow dd span");
      this.weight = 300;
      this.calls = [];
      this.spans.forEach((sp) => {
        sp.isHover = false;
        sp.addEventListener("mouseenter", () => { sp.isHover = true; gsap.killTweensOf(sp); gsap.to(sp, { duration: 0.25, ease: "power4.out", fontWeight: 700, skewX: -10 }); });
        sp.addEventListener("mouseleave", () => { sp.isHover = false; gsap.killTweensOf(sp); gsap.to(sp, { duration: 0.25, ease: "power4.out", fontWeight: this.weight, skewX: 0 }); });
      });
      if (!VR.reduce) seen($("#vr-follow"), () => this.start(), () => this.stop());
      this.stickers();
    },
    stop() { this.calls.forEach((c) => c.kill()); this.calls = []; },
    start() {
      this.stop();
      const beat = 0.85, steps = [
        () => { this.weight = Math.floor(rand(500, 650)); this.exe(); },
        () => { this.weight = Math.floor(rand(300, 400)); this.exe(); },
        () => { if (Math.random() > 0.7) this.start(); else { this.weight = Math.floor(rand(500, 600)); this.exe(); } },
        () => { this.weight = 450; this.exe(); },
        () => { this.weight = 300; this.exe(); },
        () => { if (Math.random() > 0.5) this.start(); else { this.weight = 400; this.exe(); } },
        () => this.start(),
      ];
      steps.forEach((fn, i) => this.calls.push(gsap.delayedCall(i * beat, fn)));
    },
    exe() { this.spans.forEach((sp) => !sp.isHover && gsap.to(sp, { duration: 0.3, ease: "power4.out", fontWeight: this.weight })); },
    // Six stickers: in the order [3,0,2,4,1,5] they stick one by one at .6s intervals starting after 1s, then restart from the beginning once all are stuck
    stickers() {
      const imgs = $$(".vr-sticker"), order = [3, 0, 2, 4, 1, 5].map((i) => imgs[i]);
      if (!order[0]) return;
      if (VR.reduce) { order.forEach((s) => { s.style.visibility = "visible"; }); return; }
      const run = () => {
        order.forEach((s) => { s.style.visibility = "hidden"; });
        let t = 1;
        order.forEach((s) => { gsap.delayedCall(t, () => { s.style.visibility = "visible"; }); t += 0.6; });
        gsap.delayedCall(t, run);
      };
      run();
    },
  };

  // ── GALLERY: the circular photo band flows in the scroll direction (adds acceleration) and follows the pointer when dragged. Hovering a cell expands it into a square ──
  const gallery = {
    init() {
      this.el = $("#vr-gallery-items");
      this.c1 = $(".vr-gallery__container", this.el);
      this.c2 = this.c1.cloneNode(true);
      this.el.append(this.c2);
      this.per = 0; this.maxSp = 0.05; this.maxPc = 0.03; this.mov = isSp ? this.maxSp : this.maxPc;
      this.a1 = 0; this.a2 = 0; this.stock = scrollY; this.drag = false; this.diff = 0; this.lastX = 0; this.winPer = 1;
      const down = isTouch ? "touchstart" : "mousedown", move = isTouch ? "touchmove" : "mousemove", up = isTouch ? "touchend" : "mouseup";
      const pt = (e) => (isTouch ? e.changedTouches[0] : e);
      this.el.addEventListener(down, (e) => { this.drag = true; this.lastX = pt(e).clientX; this.diff = 0; this.winPer = isTouch ? 1 : 1200 / innerWidth; }, { passive: true });
      this.el.addEventListener(move, (e) => { if (!this.drag) return; const x = pt(e).clientX; this.diff = (x - this.lastX) * this.winPer; this.lastX = x; }, { passive: true });
      this.el.addEventListener(up, () => { this.drag = false; this.diff = 0; });
      if (!isTouch) this.el.addEventListener("mouseleave", () => { this.drag = false; this.diff = 0; });
      this.items = $$(".vr-gallery__item", this.el);
      this.items.forEach((it) => {
        if (isTouch) VR.btn(it, () => {
          const open = it.classList.contains("-open");
          this.reset();
          if (!open) { it.classList.add("-open"); it.parentNode.classList.add("-open"); }
        }, null, null, "start");
        else VR.btn(it, () => {},
          () => { it.classList.add("-open"); it.parentNode.classList.add("-open"); },
          () => { it.classList.remove("-open"); it.parentNode.classList.remove("-open"); });
      });
      addEventListener("scroll", () => {
        const y = scrollY, dir = y < this.stock ? "up" : "down";
        this.a1 = y - this.stock; this.stock = y;
        this.mov = (dir === "down" ? 1 : -1) * (isSp ? this.maxSp : this.maxPc);
      }, { passive: true });
      this.tick = () => this.render();
      if (!VR.reduce) seen(this.el, () => gsap.ticker.add(this.tick), () => gsap.ticker.remove(this.tick), "30% 0%");
    },
    reset() { [this.c1, this.c2].forEach((c) => c.classList.remove("-open")); this.items.forEach((i) => i.classList.remove("-open")); },
    render() {
      if (this.drag) this.per += 0.1 * this.diff;
      else { this.a2 += 0.25 * (this.a1 - this.a2); this.per += this.mov + 0.025 * this.a2; this.a1 *= 0.3; }
      if (this.per < -100) this.per = 0; else if (this.per > 0) this.per = -100;
      this.c1.style.transform = this.c2.style.transform = `translate3d(${this.per}%,0,0)`;
    },
  };

  // ── ARCHIVE: +MORE expands a row, on PC hovering a row tilts its text -20° and that row’s photo plate follows the mouse at .2 per step (next photo every 2s) ──
  const archive = {
    init() {
      this.inner = $("#vr-vcc-inner");
      this.inner2 = $(".vr-vcc__inner2", this.inner);
      this.more = $("#vr-vcc-more");
      this.rows = $$(".vr-vcc__row");
      VR.btn(this.more, () => this.showMore());
      if (isSp) return;
      this.wrap = $("#vr-vcc-img");
      this.shots = $$(".vr-vcc__shot", this.wrap);
      this.rx = this.ry = this.cx = this.cy = 0;
      this.tick = () => {
        this.rx += 0.2 * (this.cx - this.rx); this.ry += 0.2 * (this.cy - this.ry);
        this.wrap.style.transform = `translate3d(${this.rx}px, ${this.ry}px, 0)`;
      };
      this.inner.addEventListener("mouseenter", () => { this.wrap.classList.add("-show"); gsap.ticker.add(this.tick); });
      this.inner.addEventListener("mouseleave", () => { this.wrap.classList.remove("-show"); gsap.ticker.remove(this.tick); });
      this.inner.addEventListener("mousemove", (e) => { const r = this.inner.getBoundingClientRect(); this.cx = e.clientX - r.left; this.cy = e.clientY - r.top; });
      this.rows.forEach((row) => {
        const divs = $$("div", row);
        row.addEventListener("mouseenter", () => { this.idx = 0; this.slide(); gsap.killTweensOf(divs); gsap.to(divs, { duration: 0.07, ease: "expo.out", skewX: -20 }); });
        row.addEventListener("mouseleave", () => { gsap.killTweensOf(divs); gsap.to(divs, { duration: 0.1, ease: "power3.out", skewX: 0 }); this.call?.kill(); });
      });
    },
    slide() {
      this.shots.forEach((s) => s.classList.remove("-show"));
      this.shots[this.idx % this.shots.length].classList.add("-show");
      this.call?.kill();
      if (!VR.reduce) this.call = gsap.delayedCall(2, () => { this.idx++; this.slide(); });
    },
    showMore() {
      this.more.classList.add("-hide");
      this.inner.style.maxHeight = `${this.inner2.clientHeight}px`;
      this.rows.forEach((r) => { r.style.display = "block"; });
      gsap.delayedCall(0.05, () => { this.inner.style.maxHeight = `${this.inner2.clientHeight}px`; ScrollTrigger.refresh(); });
    },
  };

  // ── CONTACT: two bands flow only while visible, and hovering the mail field makes three photos pop out with parallax (on phones it repeats automatically) ──
  const contact = {
    init() {
      const tickers = $$(".vr-contact__ticker");
      if (!VR.reduce) seen($("#vr-contact"), () => tickers.forEach((t) => t.classList.add("-slide")), () => tickers.forEach((t) => t.classList.remove("-slide")));
      this.imgs = $$(".vr-contact__img");
      const area = $("#vr-contact-area");
      VR.btn(area, () => {}, () => this.enter(), () => this.out());
      if (isSp && !VR.reduce) this.loop();
    },
    enter() {
      const [a, b, c] = this.imgs;
      gsap.set(a, { delay: 0, rotate: 3 });
      gsap.set(a, { delay: 0.2, rotate: -4 });
      gsap.set(b, { delay: 0.1, y: "-10%", visibility: "visible" });
      gsap.set(b, { delay: 0.25, y: "-6.7%" });
      gsap.set(c, { delay: 0.2, y: "3%", rotate: 3, visibility: "visible" });
      gsap.set(c, { delay: 0.35, y: "1%", rotate: 0 });
    },
    out() {
      const [a, b, c] = this.imgs;
      gsap.killTweensOf(this.imgs);
      gsap.set(c, { delay: 0, visibility: "hidden" });
      gsap.set(b, { delay: 0.12, visibility: "hidden" });
      gsap.set(a, { delay: 0.24, rotate: 0 });
    },
    loop() {
      this.enter();
      const t = rand(1, 2);
      gsap.delayedCall(t, () => this.out());
      gsap.delayedCall(t + rand(0.8, 3), () => this.loop());
    },
  };

  // ── Title photo parallax (tied to scroll, scrub .1) ──
  const titles = () => {
    const g = isSp ? { y0: 30, y1: -3 } : { y0: 40, y1: -15 };
    gsap.fromTo(".vr-gallery__title-img", { yPercent: g.y0, rotate: 10 }, { yPercent: g.y1, rotate: -3, ease: "power1.out", scrollTrigger: { trigger: ".vr-gallery__title", scrub: 0.1 } });
    gsap.fromTo(".vr-gallery__title-img .wf-img", { scale: 2 }, { scale: 1, ease: "power2.out", scrollTrigger: { trigger: ".vr-gallery__title-img", start: "top bottom", end: "center center", scrub: 0.1 } });
    gsap.fromTo(".vr-vcc__title-img1 .wf-img", { scale: 1.1, yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".vr-vcc__title", scrub: 0.1 } });
    gsap.fromTo(".vr-vcc__title-img2 .wf-img", { scale: 1.1, yPercent: 5 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: ".vr-vcc__title", scrub: 0.1 } });
    gsap.fromTo(".vr-vcc__title-img", { yPercent: 80, rotate: 1.94 + 6 }, isSp
      ? { yPercent: 0, rotate: 1.94, ease: "power2.out", scrollTrigger: { trigger: ".vr-vcc__title", start: "top bottom", end: "center center", scrub: 0.1 } }
      : { yPercent: -15, rotate: 1.94, ease: "power2.out", scrollTrigger: { trigger: ".vr-vcc__title", scrub: 0.1 } });
  };

  VR.boot(() => {
    catchPc.init();
    topic.init();
    kvSp.init();
    about.init();
    follow.init();
    gallery.init();
    archive.init();
    contact.init();
    titles();
  });
})();
