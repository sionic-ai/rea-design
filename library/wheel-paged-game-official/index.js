// Per-section staging on the hero page — switched on and off with KJ.onSection(next section, previous section) from shared.js
(() => {
  const KJ = window.KJ;
  const isSp = KJ.isSp;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ── Two Hero banners: hold 3s, then swap over .4s ──
  const banner = {
    init() {
      const a = $("#kj-banner-a"), b = $("#kj-banner-b");
      if (!a || !b) return;
      gsap.set(a, { opacity: 0 });
      gsap.set(b, { autoAlpha: 0 });
      this.tl = gsap.timeline({ repeat: -1, paused: true })
        .to(a, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "+=3")
        .to(b, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "<")
        .to(b, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "+=3")
        .to(a, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "<");
      this.ready = false;
      addEventListener("kj:kvready", () => { this.ready = true; if (sections.current === 0) this.inview(); });
    },
    inview() { if (this.tl && this.ready && !this.playing && !KJ.reduce) { this.playing = true; this.tl.play(); } },
    outview() { if (this.tl && this.playing) { this.playing = false; this.tl.pause(); } },
  };

  // ── Trailer: three videos on one plate, and at each end blends into the next with smudge, color split and flash ──
  // The video slot is a placeholder video (15 seconds) drawn on a canvas at the same 16:9 ratio, and that canvas is uploaded as the texture as is
  const CLIP_SEC = 15;
  class PlaceholderClip {
    constructor(n) {
      this.n = n;
      this.canvas = document.createElement("canvas");
      this.canvas.width = 640; this.canvas.height = 360;
      this.ctx = this.canvas.getContext("2d");
      this.t = 0; this.playing = false; this.last = 0; this.onEnded = null;
      this.draw();
    }
    play() { this.playing = true; this.last = performance.now(); }
    pause() { this.playing = false; }
    reset() { this.t = 0; this.draw(); }
    tick(now) {
      if (!this.playing) return;
      const dt = Math.max(0, Math.min(100, now - this.last)) / 1000;
      this.last = now;
      this.t += dt;
      if (this.t >= CLIP_SEC) { this.t = CLIP_SEC; this.playing = false; this.draw(); this.onEnded?.(); return; }
      this.draw();
    }
    draw() {
      const { ctx, canvas: c } = this;
      const ink = css("--kf-ink"), line = css("--kf-line"), bg = css("--kf-bg"), accent = css("--kf-accent");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = line;
      const off = (this.t * 40 + this.n * 90) % 160;
      for (let x = -160; x < c.width + 160; x += 80) {
        ctx.beginPath(); ctx.moveTo(x + off, 0); ctx.lineTo(x + off + 40, 0); ctx.lineTo(x + off - 120, c.height); ctx.lineTo(x + off - 160, c.height); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
      ctx.fillStyle = ink;
      ctx.font = `700 120px ${css("--kf-font-display") || "sans-serif"}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`0${this.n + 1}`, c.width / 2, c.height / 2 - 16);
      ctx.font = `400 18px ${css("--kf-font-mono") || "monospace"}`;
      ctx.fillText(`Trailer video ${this.n + 1} · 16:9 · ${CLIP_SEC}Second`, c.width / 2, c.height / 2 + 64);
      ctx.fillStyle = accent; ctx.fillRect(0, c.height - 6, (this.t / CLIP_SEC) * c.width, 6);
    }
  }

  const VERT = `
    attribute vec3 position; attribute vec2 uv;
    uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  // Six round blobs travel across the panel according to transition progress p (0→1, 1s linear), and only the blob areas switch to the next video first.
  // While passing, push the three colors separately (horizontal wave .02 + blot .02, direction offset by 120° over time), flashing brightest at the center.
  const FRAG = `
    precision mediump float;
    uniform sampler2D uFrom; uniform sampler2D uTo;
    uniform float uP; uniform float uClock; uniform float uAspect; uniform float uVideoAspect;
    varying vec2 vUv;
    const float PI = 3.14159265;
    float hash(vec2 q) { return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }
    float vnoise(vec2 q) {
      vec2 i = floor(q), f = fract(q); vec2 w = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
    }
    vec2 fitCover(vec2 st) {
      float k = uAspect / uVideoAspect;
      return k > 1.0 ? vec2(st.x, (st.y - 0.5) / k + 0.5) : vec2((st.x - 0.5) * k + 0.5, st.y);
    }
    vec2 keepInside(vec2 st) {
      vec2 edge = smoothstep(vec2(0.49), vec2(0.5), abs(st - 0.5));
      return mix(st, sign(st - 0.5) * 0.5 + 0.5, edge);
    }
    void main() {
      vec2 st = fitCover(vUv);
      float wave = sin(uP * PI) * (1.0 - cos(uP * PI));
      float field = 0.0;
      for (int k = 0; k < 6; k++) {
        float fk = float(k);
        vec2 c = vec2(0.5 + cos(uP * (1.0 + fk * 0.2) + fk * PI * 0.5) * 0.3,
                      0.5 + sin(uP * (0.8 + fk * 0.2) + fk * PI * 0.5) * 0.3);
        float r = 0.15 + vnoise(vec2(fk + uP * 0.5)) * 0.1;
        vec2 d = st - c;
        field += (r * r) / max(dot(d, d), 1e-4);
      }
      float blob = smoothstep(0.8, 1.2, field) * wave;
      blob = mix(blob, blob + vnoise(st * 2.0 + uP) * 0.1, 0.1);
      vec2 sr = st, sg = st, sb = st;
      bool moving = uP > 0.01 && uP < 0.99;
      if (moving) {
        float sway = sin(st.y * 2.0 + uP) * 0.02 * wave;
        float push = blob * 0.02;
        vec2 dr = vec2(sway + push * cos(uClock), push * sin(uClock));
        vec2 dg = vec2(sway + push * cos(uClock + PI * 0.2), push * sin(uClock + PI * 0.2));
        vec2 db = vec2(sway + push * cos(uClock - PI * 0.2), push * sin(uClock - PI * 0.2));
        sr = keepInside(st + dr); sg = keepInside(st + dg); sb = keepInside(st + db);
        if (any(lessThan(min(min(sr, sg), sb), vec2(0.0))) || any(greaterThan(max(max(sr, sg), sb), vec2(1.0)))) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return;
        }
      }
      vec3 a = vec3(texture2D(uFrom, sr).r, texture2D(uFrom, sg).g, texture2D(uFrom, sb).b);
      vec3 b = vec3(texture2D(uTo, sr).r, texture2D(uTo, sg).g, texture2D(uTo, sb).b);
      vec3 col = mix(a, b, max(uP, blob));
      if (moving) col *= (1.0 + sin(uP * PI)) * (2.0 - abs(uP - 0.5) * 2.0);
      gl_FragColor = vec4(col, 1.0);
    }`;

  class TrailerGL {
    constructor() {
      this.canvas = $("#kj-canvas");
      this.wrap = $("#kj-trailer-stage");
      this.clips = [0, 1, 2].map((n) => new PlaceholderClip(n));
      this.current = 0;
      this.busy = false;
      this.running = false;
      this.next = () => {};
      const w = this.wrap.clientWidth, h = this.wrap.clientHeight;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
      this.renderer.setClearColor(0);
      this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
      this.renderer.setSize(w, h, false);
      this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 1000);
      this.camera.position.set(0, 0, 10);
      this.scene = new THREE.Scene();
      this.textures = this.clips.map((c) => { const t = new THREE.CanvasTexture(c.canvas); t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; return t; });
      this.material = new THREE.RawShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, side: THREE.DoubleSide,
        uniforms: {
          uFrom: { value: this.textures[0] }, uTo: { value: this.textures[0] },
          uP: { value: 0 }, uClock: { value: 0 }, uAspect: { value: w / h }, uVideoAspect: { value: 16 / 9 },
        },
      });
      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), this.material);
      this.scene.add(this.mesh);
      this.clips.forEach((c, i) => { c.onEnded = () => { this.next(); this.transition(i, (i + 1) % 3); }; });
      new ResizeObserver(() => this.resize()).observe(this.wrap);
    }
    resize() {
      const w = this.wrap.clientWidth, h = this.wrap.clientHeight;
      if (!w || !h) return;
      this.renderer.setSize(w, h, false);
      this.material.uniforms.uAspect.value = w / h;
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.PlaneGeometry(w, h, 1, 1);
      Object.assign(this.camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      this.camera.updateProjectionMatrix();
      this.render();
    }
    render() { this.renderer.render(this.scene, this.camera); }
    loop() {
      if (!this.running) return;
      const now = performance.now();
      this.clips.forEach((c) => c.tick(now));
      this.textures.forEach((t) => { t.needsUpdate = true; });
      this.material.uniforms.uClock.value += 0.01;
      this.render();
      requestAnimationFrame(() => this.loop());
    }
    transition(from, to) {
      if (this.busy) return;
      this.busy = true;
      const u = this.material.uniforms;
      u.uFrom.value = this.textures[from]; u.uTo.value = this.textures[to];
      this.clips[from].pause();
      gsap.to(u.uP, {
        value: 1, duration: 1, ease: "none",
        onComplete: () => {
          this.current = to; u.uP.value = 0;
          this.clips[from].reset();
          if (!KJ.reduce) this.clips[to].play();
          u.uFrom.value = u.uTo.value = this.textures[to];
          this.busy = false;
        },
      });
    }
    play(i) { if (!KJ.reduce) this.clips[i].play(); if (!this.running) { this.running = true; this.loop(); } }
    pause(i) { this.running = false; this.clips[i].pause(); }
  }

  const trailer = {
    init() {
      this.wrap = $("#trailer");
      this.items = $$(".kj-trailer-video-item");
      this.frame = isSp ? $("#kj-trailer-frame-sp") : $("#kj-trailer-frame-pc");
      this.vtitle = $("#kj-trailer-vtitle");
      this.shuffle = KJ.shuffle(this.vtitle, { duration: 600, empty: " " });
      // As in the original, the title slot stays empty, on entry the shuffle fills it from blank up to the first video title
      this.shuffle.setText(this.items[0]?.dataset.title || "");
      this.current = 0;
      this.gl = new TrailerGL();
      gsap.set(this.frame, { scale: 1.04 });
      this.thumb = new Swiper("#kj-trailer-thumb", {
        loop: true, slidesPerView: "auto", centeredSlides: true, slideToClickedSlide: false,
        navigation: { nextEl: "#kj-thumb-down", prevEl: "#kj-thumb-up" },
        // The original config has virtual but the bundle lacks the Virtual module, so it just runs as a ring slide — removed to behave the same
        spaceBetween: KJ.remToPx(1), speed: 1100,
        breakpoints: { 769: { slidesPerView: 3, direction: "vertical", spaceBetween: KJ.remToPx(2) } },
        on: {
          slideChangeTransitionStart: (sw) => {
            const t = sw.realIndex % 3;
            this.gl.transition(this.current, t);
            const item = this.items[t];
            if (item) { this.shuffle.setText(item.dataset.title || ""); this.shuffle.start(); }
            $$(".kj-trailer-video-item.is-active").forEach((el) => el.classList.remove("is-active"));
            item?.classList.add("is-active");
            gsap.timeline().to(this.frame, { scale: 1.02, duration: 0.4, ease: "power2.inOut" }).to(this.frame, { scale: 1, duration: 0.4, ease: "power2.inOut" }, "+=0.2");
            this.current = t;
          },
        },
      });
      this.wrap.addEventListener("click", (ev) => {
        const slide = ev.target.closest(".kj-trailer-thumb-item");
        if (!slide || this.thumb.animating) return;
        const r = parseInt(slide.getAttribute("data-swiper-slide-index") || "0", 10);
        if (r !== this.thumb.realIndex) this.thumb.slideToLoop(r, this.thumb.params.speed);
      });
      addEventListener("resize", () => { this.thumb.params.spaceBetween = KJ.remToPx(isSp ? 1 : 2); this.thumb.update(); }, { passive: true });
      this.gl.next = () => this.thumb.slideNext();
      this.gl.render();
    },
    inview() {
      this.gl.play(this.current);
      if (this.wrap.classList.contains("is-active")) return;
      this.wrap.classList.add("is-active");
      KJ.titleIn("trailer");
      gsap.to("#kj-trailer-stage", { opacity: 1, scale: 1, duration: 0.6, delay: 0.1, ease: "power2.out" });
      gsap.to(this.vtitle, { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.4, onStart: () => { this.frame?.classList.add("is-active"); this.shuffle.start(); } });
      gsap.to(this.frame, { scale: 1, duration: 0.3, ease: "power1.out", delay: 0.4 });
      gsap.to("#kj-trailer-play", { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out", delay: 0.4, onComplete: () => $("#kj-trailer-play").classList.add("is-active") });
      gsap.timeline()
        .to(".kj-trailer-thumb-item.swiper-slide-active", { opacity: 1, duration: 0.6, ease: "power1.out", delay: isSp ? 0.5 : 0.4 })
        .to([".kj-trailer-thumb-item.swiper-slide-prev", ".kj-trailer-thumb-item.swiper-slide-next"], { opacity: 1, duration: 0.6, ease: "power1.out" }, "-=0.5")
        .to(".kj-trailer-arrow", { opacity: 1, duration: 0.6, ease: "power1.out", onComplete: () => $$(".kj-trailer-thumb-item").forEach((el) => el.classList.add("is-show")) }, "-=0.4");
    },
    pause() { this.gl.pause(this.current); },
  };

  // Video modal — the original embeds a video player window. Here a placeholder of the same size
  const trailerModal = {
    init() {
      const modal = $("#kj-trailer-modal"), box = $("#kj-trailer-modal-video");
      $$(".kj-trailer-video-item").forEach((it) => it.addEventListener("click", () => {
        KJ.scroll?.disable();
        box.innerHTML = `<div class="wf-img wf-video" data-label="External video player · 16:9 · autoplays when opened (${it.dataset.id})"></div>`;
        gsap.timeline().set(modal, { display: "flex", scale: 0.94 }).to(modal, { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out" }).set(modal, { pointerEvents: "auto" });
      }));
      $("#kj-trailer-modal-close")?.addEventListener("click", () => {
        KJ.scroll?.enable();
        gsap.timeline().set(modal, { pointerEvents: "none" })
          .to(modal, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => { box.innerHTML = ""; } })
          .set(modal, { display: "none" });
      });
    },
  };

  // ── Concept: background brightness 200%→100%, text lines light up at .03s intervals ──
  const concept = {
    inview() {
      const wrap = $("#concept");
      if (wrap.classList.contains("is-active")) return;
      wrap.classList.add("is-active");
      gsap.fromTo(".kj-concept-bg", { filter: "brightness(200%)" }, { filter: "brightness(100%)", duration: 0.6, ease: "power1.out", delay: 0.3 });
      gsap.to(".kj-concept-text", { opacity: 1, duration: 0.6, ease: "power2.inOut", stagger: 0.03, delay: 0.1 });
    },
  };

  // ── Story: three-panel picture accordion (hover on desktop, tap + 3.5s auto on phone) ──
  const story = {
    init() {
      this.wrap = $("#story");
      this.list = $("#kj-story-list");
      this.images = $$(".kj-story-image");
      this.items = $$(".kj-story-item");
      this.box = $("#kj-story-images");
      this.current = 0;
      this.timer = null;
      const off = () => this.box.classList.contains("is-disabled");
      if (!isSp) {
        this.items.forEach((it, i) => it.addEventListener("mouseenter", () => {
          if (off()) return;
          this.images[this.current]?.classList.remove("is-active");
          this.images[i].classList.add("is-active");
          this.setText(i, this.current);
          this.current = i;
        }));
        this.list.addEventListener("mouseleave", () => {
          if (off() || this.current === 0) return;
          this.images[this.current].classList.remove("is-active");
          this.images[0].classList.add("is-active");
          this.setText(0, this.current);
          this.current = 0;
        });
        this.images.forEach((im, i) => {
          im.addEventListener("mouseenter", () => {
            if (off()) return;
            $(".kj-story-image.is-active")?.classList.remove("is-active");
            im.classList.add("is-active");
            this.setText(i, this.current);
            this.current = i;
          });
          im.addEventListener("mouseleave", () => { if (!off()) im.classList.remove("is-active"); });
        });
        this.box.addEventListener("mouseleave", () => {
          if (off()) return;
          this.images[0].classList.add("is-active");
          this.setText(0, this.current);
          this.current = 0;
        });
      } else {
        this.items.forEach((it, i) => it.addEventListener("click", () => {
          if (off()) return;
          this.clearSp(this.current);
          it.classList.add("is-active", "is-active-line");
          this.images[i].classList.add("is-active");
          this.current = i;
          this.nextSp();
        }));
      }
    },
    setText(e, t) { this.items[t].classList.remove("is-active"); this.items[e].classList.add("is-active"); },
    clearSp(i) { this.items[i].classList.remove("is-active", "is-active-line"); this.images[i].classList.remove("is-active"); },
    nextSp() {
      clearTimeout(this.timer);
      if (KJ.reduce) return;
      this.timer = setTimeout(() => {
        const e = (this.current + 1) % this.items.length;
        this.clearSp(this.current);
        this.items[e].classList.add("is-active", "is-active-line");
        this.images[e].classList.add("is-active");
        this.current = e;
        this.nextSp();
      }, 3500);
    },
    outview() {
      this.box.classList.add("is-disabled");
      this.items[this.current].classList.remove("is-active");
      this.images[this.current].classList.remove("is-active");
      if (isSp) { this.items[this.current].classList.remove("is-active-line"); clearTimeout(this.timer); }
      this.items[0].classList.add("is-active");
      this.images[0].classList.add("is-active");
      this.current = 0;
    },
    inview() {
      if (this.wrap.classList.contains("is-active")) {
        if (isSp) { this.items[0].classList.add("is-active-line"); this.nextSp(); }
        this.box.classList.remove("is-disabled");
        return;
      }
      this.wrap.classList.add("is-active");
      gsap.set(this.box, { xPercent: -80 });
      gsap.to(this.box, { xPercent: 0, duration: 1.2, ease: KJ.ease.out });
      const first = this.images[0];
      gsap.to(this.images, {
        duration: 0.25, opacity: 1, ease: "power1.out",
        stagger: {
          each: 0.15, from: "end",
          onStart() { this.targets()[0].classList.add("is-active"); },
          onComplete() { const t = this.targets()[0]; if (t !== first) t.classList.remove("is-active"); },
        },
      });
      gsap.to(".kj-story-item", {
        opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.3, stagger: -0.1,
        onComplete: () => { if (isSp) { this.items[0].classList.add("is-active-line"); this.nextSp(); } this.box.classList.remove("is-disabled"); },
      });
      KJ.titleIn("story", { reveal: 0.8 });
    },
  };

  // Story modal — three scenes advance automatically along a 4s progress ring, and the image changes as a mask sweeps to the left
  const storyModal = {
    init() {
      this.modal = $("#kj-story-modal");
      this.slides = $$(".kj-story-slide");
      this.imgs = $$(".kj-story-slide-img");
      this.texts = $$(".kj-story-slide-text");
      this.keys = $$(".kj-story-keyword");
      this.navs = $$(".kj-story-nav");
      this.current = 0; this.busy = false; this.tl = null; this.progress = null;
      this.navs.forEach((n) => {
        const c = n.querySelector(".--bar"), r = parseFloat(c.getAttribute("r")), len = 2 * Math.PI * r;
        c.setAttribute("stroke-dasharray", `${len} ${len}`);
        c.setAttribute("stroke-dashoffset", String(len));
        c.setAttribute("transform", `rotate(-90 ${c.getAttribute("cx")} ${c.getAttribute("cy")})`);
      });
      this.layout();
      $$(".kj-story-more").forEach((b) => b.addEventListener("click", () => this.open()));
      $$(".kj-story-image").forEach((b) => b.addEventListener("click", () => this.open()));
      $$(".kj-story-close").forEach((b) => b.addEventListener("click", () => this.close()));
      $(".kj-story-prev")?.addEventListener("click", () => !this.busy && this.goTo(this.current === 0 ? this.slides.length - 1 : this.current - 1));
      $(".kj-story-next")?.addEventListener("click", () => !this.busy && this.goTo((this.current + 1) % this.slides.length));
    },
    layout() {
      this.slides.forEach((s, i) => {
        gsap.set(s, { zIndex: i === 0 ? 3 : 1, visibility: i === 0 ? "visible" : "hidden" });
        gsap.set(this.imgs[i], { maskPosition: i === 0 ? "0% 0%" : "100% 0%", scale: i === 0 ? 1 : 1.4 });
        gsap.set([this.texts[i], this.keys[i]], { opacity: i === 0 ? 1 : 0 });
      });
    },
    mark(i) {
      this.navs.forEach((n) => n.classList.remove("is-active"));
      const n = this.navs[i];
      if (!n) return;
      n.classList.add("is-active");
      const c = n.querySelector(".--bar");
      gsap.set(c, { strokeDashoffset: 2 * Math.PI * parseFloat(c.getAttribute("r")) });
    },
    run() {
      this.progress?.kill();
      const c = this.navs[this.current]?.querySelector(".--bar");
      if (!c || KJ.reduce) return;
      this.progress = gsap.timeline({ onComplete: () => { if (!this.busy) { const n = (this.current + 1) % this.slides.length; this.slide(this.current, n); this.current = n; } } })
        .to(c, { strokeDashoffset: 0, duration: 4, ease: "none" });
    },
    slide(e, t) {
      if (this.busy) return;
      this.busy = true;
      this.progress?.kill();
      this.navs.forEach((n) => n.classList.remove("is-active"));
      this.tl?.kill();
      const a = this.slides[e], b = this.slides[t];
      this.tl = gsap.timeline({ onComplete: () => { this.busy = false; this.tl = null; this.mark(t); this.run(); } })
        .set(a, { zIndex: 2 }).set(b, { zIndex: 3, visibility: "visible" })
        .set(this.imgs[t], { maskPosition: "-100% 0%", scale: 1.4 })
        .to(this.imgs[e], { maskPosition: "200% 0%", ease: "power2.inOut", duration: 1, onComplete: () => gsap.set(a, { visibility: "hidden" }) }, 0)
        .to(this.imgs[t], { maskPosition: "0% 0%", scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .to([this.keys[e], this.texts[e]], { opacity: 0, duration: 0.9, ease: "power2.inOut" }, 0)
        .to([this.keys[t], this.texts[t]], { opacity: 1, duration: 0.9, ease: "power2.inOut", delay: 0.1 }, 0);
    },
    goTo(i) {
      if (i === this.current || this.busy) return;
      this.slide(this.current, i);
      this.current = i;
    },
    open() {
      KJ.scroll?.disable();
      this.modal.classList.add("is-active");
      this.progress?.kill(); this.tl?.kill(); this.busy = false;
      this.current = 0; this.layout(); this.mark(0);
      gsap.set(this.imgs[0], { scale: 1.4, opacity: 0 });
      gsap.set([this.keys[0], this.texts[0]], { opacity: 0 });
      gsap.timeline().set(this.modal, { visibility: "visible" }).to(this.modal, { opacity: 1, duration: 0.3, ease: "power1.inOut", onComplete: () => this.run() });
      gsap.timeline().to(this.imgs[0], { scale: 1, opacity: 1, duration: 0.6, ease: "power1.out" }).to([this.keys[0], this.texts[0]], { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.6");
      gsap.timeline().set("#kj-story-modal-bg", { display: "block", pointerEvents: "auto" }).to("#kj-story-modal-bg", { opacity: 0.8, duration: 0.3 });
    },
    close() {
      KJ.scroll?.enable();
      this.modal.classList.remove("is-active");
      this.progress?.kill();
      gsap.timeline().to([this.modal, "#kj-story-modal-bg"], { opacity: 0, duration: 0.3 }).set(this.modal, { visibility: "hidden" }).set("#kj-story-modal-bg", { display: "none" });
    },
  };

  // ── Characters: keen-slider endless rotating carousel. The farther from center, the shorter the image height, and after stopping it advances one step every .6s ──
  const character = {
    init() {
      this.wrap = $("#character");
      this.list = $("#kj-character-slide");
      this.count = $$(".kj-character__item").length;
      this.current = 0; this.center = 0; this.timer = null; this.stopped = true;
      const scaleAll = (s) => {
        const det = s.track.details.slides;
        s.slides.forEach((el, i) => {
          const c = 0.99 - Math.abs(det[i].distance - this.center) / (isSp ? 10 : 3);
          const img = el.querySelector(".kj-character-item-image"), name = el.querySelector(".kj-character-item-name");
          if (img && name) img.style.height = `${(this.list.clientHeight - name.clientHeight) * Math.abs(c)}px`;
        });
      };
      this.slider = new KeenSlider(this.list, {
        initial: 0,
        slides: { perView: "auto", origin: "center", spacing: 10 },
        mode: "free-snap", loop: true,
        defaultAnimation: { duration: 2000 },
        updated: (s) => { const d = s.track.details.slides[s.track.details.rel]?.distance; if (d) this.center = d; },
        created: (s) => { const d = s.track.details.slides[s.track.details.rel]?.distance; if (d) { this.center = d; scaleAll(s); } },
        detailsChanged: (s) => scaleAll(s),
        dragStarted: () => this.clear(),
        animationEnded: (s) => { if (!this.stopped) { this.current = s.track.details.rel; this.next(); } },
      });
    },
    clear() { clearTimeout(this.timer); this.timer = null; },
    next() {
      this.clear();
      if (KJ.reduce) return;
      const e = (this.current + 1) % (this.count * 2);
      if (e === this.count + 1) { this.slider.moveToIdx(0, true, { duration: 0 }); this.current = 0; }
      this.timer = setTimeout(() => { this.current = e; this.slider.moveToIdx(this.current); }, 600);
    },
    stop() { this.stopped = true; this.slider.moveToIdx(this.current, true, { duration: 0 }); this.clear(); },
    start() { this.stopped = false; this.next(); },
    inview(slideMode) {
      this.clear();
      this.stopped = false;
      if (this.wrap.classList.contains("is-active")) {
        this.list.classList.remove("is-disabled");
        if (slideMode) gsap.delayedCall(1, () => this.next());
        return;
      }
      this.wrap.classList.add("is-active");
      KJ.titleIn("character", { cover: 0.3 });
      gsap.from(".kj-character-item-image", { height: this.list.clientHeight * 0.5, duration: 0.6, ease: "power1.out", delay: 0.25 });
      gsap.to(".kj-character__cut", { opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.25, onComplete: () => { this.list.classList.remove("is-disabled"); if (slideMode) this.next(); } });
    },
    outview() { this.stop(); this.list.classList.add("is-disabled"); },
  };

  // Toggle single line / show all
  const display = {
    mode: "slide", busy: false, row: 0, shown: false,
    init() {
      this.slideBtn = $("#kj-display-slide"); this.allBtn = $("#kj-display-all");
      this.slideList = $("#kj-character-slide"); this.allList = $("#kj-character-all");
      this.nav = $("#kj-all-nav"); this.prev = $("#kj-all-prev"); this.nextBtn = $("#kj-all-next");
      if (isSp) gsap.set(this.nav, { opacity: 0, pointerEvents: "none" });
      this.slideBtn.addEventListener("click", () => !this.busy && this.change("slide"));
      this.allBtn.addEventListener("click", () => !this.busy && this.change("all"));
      if (isSp) { this.prev.addEventListener("click", () => this.scrollRow(-1)); this.nextBtn.addEventListener("click", () => this.scrollRow(1)); }
    },
    rowH() { return this.allList.querySelector(".kj-character__all-item:not(.--empty)")?.offsetHeight ?? 0; },
    scrollRow(d) {
      if (this.busy) return;
      this.row = Math.max(0, Math.min(this.row + d, 1));
      gsap.to(".kj-character__all-list", { y: -this.row * this.rowH(), duration: 0.3, ease: KJ.ease.half });
      this.navState();
    },
    btn(b, off) { b.disabled = off; gsap.set(b, { opacity: off ? 0.3 : 1 }); },
    navState() { this.btn(this.prev, this.row <= 0); this.btn(this.nextBtn, this.row >= 1); },
    change(mode) {
      this.busy = true; this.mode = mode;
      const half = KJ.ease.half;
      if (mode === "slide") {
        this.slideBtn.classList.add("is-active"); this.allBtn.classList.remove("is-active");
        if (isSp) { this.btn(this.prev, true); this.btn(this.nextBtn, true); gsap.to(this.nav, { opacity: 0, pointerEvents: "none", duration: 0.4, ease: half }); }
        gsap.to(this.slideList, { opacity: 1, visibility: "visible", duration: 0.4, scale: 1, ease: half, onComplete: () => { character.start(); this.busy = false; } });
        gsap.to(this.allList, { opacity: 0, duration: 0.4, scale: 0.9, ease: half, onComplete: () => gsap.set(this.allList, { visibility: "hidden" }) });
      } else {
        this.allBtn.classList.add("is-active"); this.slideBtn.classList.remove("is-active");
        if (isSp) {
          if (!this.shown) { this.shown = true; this.row = 1; gsap.set(".kj-character__all-list", { y: -this.row * this.rowH() }); }
          this.navState();
          gsap.to(this.nav, { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: half });
        }
        character.stop();
        gsap.to(this.allList, { opacity: 1, visibility: "visible", duration: 0.4, scale: 1, ease: half, onComplete: () => { this.busy = false; } });
        gsap.to(this.slideList, { opacity: 0, duration: 0.4, scale: 0.9, ease: half, onComplete: () => gsap.set(this.slideList, { visibility: "hidden" }) });
      }
    },
  };

  // Character detail modal — the image opens from top to bottom with a light streak following down, and the name · voice actor · birthday turn on staggered
  const detail = {
    init() {
      this.modal = $("#kj-character-detail");
      this.item = $("#kj-detail-item");
      this.index = 0;
      $$(".kj-character-item").forEach((el) => el.addEventListener("click", () => this.open(parseInt(el.dataset.index || "0", 10))));
      $(".kj-detail-close")?.addEventListener("click", () => this.close());
      $(".kj-detail-prev")?.addEventListener("click", () => this.change(-1));
      $(".kj-detail-next")?.addEventListener("click", () => this.change(1));
    },
    fill(i) {
      const n = String(i + 1).padStart(2, "0");
      $("#kj-detail-name").textContent = `Person ${n}`;
      $(".kj-detail-sub").textContent = `CHARACTER ${n}`;
    },
    reset() {
      const r = this.item;
      gsap.set(r.querySelector(".kj-detail-image"), { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" });
      gsap.set(r.querySelector(".kj-detail-line"), { top: 0, opacity: 0 });
      gsap.set(r.querySelector(".kj-detail-cv"), { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" });
      gsap.set(r.querySelectorAll(".kj-detail-name, .kj-detail-sub, .kj-detail-birth, .kj-detail-text, .kj-detail-likes, .kj-detail-video > .wf-img"), { opacity: 0 });
      gsap.set(r.querySelector(".kj-detail-play"), { opacity: 0, scale: 0.8 });
      gsap.set(r.querySelector(".kj-detail-vframe"), { opacity: 0, scale: 1.04 });
    },
    animate() {
      const r = this.item, q = (s) => r.querySelector(s);
      gsap.timeline()
        .set(r, { pointerEvents: "auto" })
        .set(q(".kj-detail-line"), { opacity: 1 })
        .to(q(".kj-detail-image"), { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.8, ease: "power2.out" }, "start")
        .to(q(".kj-detail-line"), { top: "100%", duration: 0.8, ease: "power2.out", onComplete: () => gsap.set(q(".kj-detail-line"), { opacity: 0 }) }, "start")
        .to(q(".kj-detail-video > .wf-img"), { opacity: 1, duration: 0.6, ease: "power1.out" }, "start")
        .to(q(".kj-detail-text"), { opacity: 1, duration: 0.4, ease: "power2.out", onStart: () => gsap.to(q(".kj-detail-sub"), { opacity: 1, duration: 0.4, ease: "power2.out" }) }, "start+=0.1")
        .to(q(".kj-detail-likes"), { opacity: 1, duration: 0.4, ease: "power2.out" }, "start+=0.2")
        .to(q(".kj-detail-play"), { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, "start+=0.2")
        .to(q(".kj-detail-vframe"), { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, "start+=0.3")
        .to(q(".kj-detail-cv"), { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.4, ease: "power2.out" }, "start+=0.3")
        .to(q(".kj-detail-name"), { opacity: 1, duration: 0.6, ease: "power2.out" }, "start+=0.4")
        .to(q(".kj-detail-birth"), { opacity: 1, duration: 0.4, ease: "power2.out" }, "start+=0.4");
    },
    open(i) {
      character.stop();
      KJ.scroll?.disable();
      this.index = i;
      this.fill(i);
      this.modal.classList.add("is-active");
      this.reset();
      gsap.timeline().set(this.modal, { display: isSp ? "flex" : "block" }).to(this.modal, { opacity: 1, duration: 0.3, ease: "power1.inOut", onComplete: () => this.animate() });
      gsap.timeline().set("#kj-character-detail-bg", { display: "block", pointerEvents: "auto" }).to("#kj-character-detail-bg", { opacity: 0.8, duration: 0.3 });
    },
    change(d) {
      const n = character.count;
      this.index = (this.index + d + n) % n;
      gsap.timeline().to(this.item, { opacity: 0, ease: "power1.out", duration: 0.2 })
        .add(() => { this.fill(this.index); this.reset(); })
        .to(this.item, { opacity: 1, ease: "power1.inOut", duration: 0.1, onComplete: () => this.animate() });
    },
    close() {
      KJ.scroll?.enable();
      this.modal.classList.remove("is-active");
      if (display.mode === "slide") character.start();
      gsap.timeline().set("#kj-character-detail-bg", { pointerEvents: "none" })
        .to([this.modal, "#kj-character-detail-bg"], { opacity: 0, duration: 0.3 })
        .set([this.modal, "#kj-character-detail-bg"], { display: "none" });
    },
  };

  // ── System: video cells slide up and down, the description box folds into a diamond, and the 8×8 cells behind blink in diagonal order ──
  const system = {
    init() {
      this.wrap = $("#system");
      this.visual = $$(".kj-system-visual-item");
      this.texts = $$(".kj-system-text-item");
      this.current = 0; this.busy = false;
      const pc = $("#kj-blocks-pc"), sp = $("#kj-blocks-sp");
      pc.innerHTML = '<span class="kj-block-pc"></span>'.repeat(64);
      sp.innerHTML = '<span class="kj-block-sp"></span>'.repeat(65);
      $("#kj-system-prev").addEventListener("click", () => this.step(-1));
      $("#kj-system-next").addEventListener("click", () => this.step(1));
    },
    step(d) {
      if (this.busy) return;
      const e = this.current, n = this.visual.length;
      this.go(e, (e + d + n) % n, d < 0 ? "prev" : "next");
    },
    goTo(i) { if (this.busy || i === this.current || i < 0 || i >= this.visual.length) return; this.go(this.current, i, "next"); },
    go(e, t, dir) {
      this.busy = true;
      this.current = t;
      const out = dir === "prev" ? "100%" : "-100%", inn = dir === "prev" ? "-100%" : "100%";
      gsap.timeline().fromTo(this.visual[e], { y: 0 }, { y: out, duration: 0.6, ease: "power2.out" }, "start").fromTo(this.visual[t], { y: inn }, { y: 0, duration: 0.6, ease: "power2.out" }, "start");
      const prev = $$(".kj-system-ctrl-prev"), next = $$(".kj-system-ctrl-next");
      gsap.timeline().fromTo([prev[e], next[e]], { y: 0 }, { y: out, duration: 0.6, ease: "power2.out" }, "start").fromTo([prev[t], next[t]], { y: inn }, { y: 0, duration: 0.6, ease: "power2.out" }, "start");
      if (isSp) {
        const tt = $$(".kj-system-title-item-sp");
        gsap.timeline().fromTo(tt[e], { y: 0 }, { y: out, duration: 0.6, ease: "power2.out" }, "start").fromTo(tt[t], { y: inn }, { y: 0, duration: 0.6, ease: "power2.out" }, "start");
      }
      this.blocks();
      gsap.timeline().to(".kj-system-text-frame", { scale: 1.02, duration: 0.3, ease: "power2.inOut" }).to(".kj-system-text-frame", { scale: 1, duration: 0.3, ease: "power2.inOut" }, "+=0.2");
      const diamond = "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)";
      gsap.timeline().set(this.texts[t], { zIndex: 2 })
        .fromTo(this.texts[e], { clipPath: diamond }, { clipPath: "polygon(150% 50%, 150% 50%, 50% 150%, 50% 150%)", duration: 0.6, ease: "power2.inOut" })
        .set(this.texts[e], { clipPath: diamond, zIndex: 0 })
        .set(this.texts[t], { zIndex: 3 });
    },
    blocks() {
      const tl = gsap.timeline({ onComplete: () => { this.busy = false; } });
      if (isSp) {
        const box = $("#kj-blocks-sp"), rows = parseInt(box.dataset.row, 10), cols = parseInt(box.dataset.col, 10);
        $$(".kj-block-sp").forEach((b, o) => {
          const d = (Math.floor(o / rows) + (o % cols)) * 0.015;
          tl.to(b, { opacity: 1, duration: 0.2, ease: "power2.out", delay: d }, 0).to(b, { opacity: 0, duration: 0.2, ease: "power2.inOut", delay: d }, 0.2);
        });
      } else {
        $$(".kj-block-pc").forEach((b, s) => {
          const d = (Math.floor(s / 8) + (s % 8)) * 0.02;
          tl.to(b, { opacity: 1, duration: 0.2, ease: "power2.out", delay: d }, 0).to(b, { opacity: 0, duration: 0.2, ease: "power2.inOut", delay: d }, 0.2);
        });
      }
    },
    play() {
      if (this.wrap.classList.contains("is-active")) return;
      this.wrap.classList.add("is-active");
      KJ.titleIn("system");
      if (isSp) gsap.to("#kj-system-title-sp", { opacity: 1, delay: 0.8, duration: 0.6, ease: "power1.out" });
      gsap.to("#kj-system-visual", { opacity: 1, scale: 1, duration: isSp ? 0.7 : 0.6, ease: "power2.out", delay: 0.1 });
      gsap.to(".kj-system-text-contents", { opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.4 });
      gsap.to(isSp ? "#kj-system-frame-sp" : "#kj-system-frame-pc", { scale: 1, opacity: 1, duration: 0.3, ease: "power1.out", delay: 0.4 });
      gsap.to("#kj-system-controller", { opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.4 });
    },
    pause() {},
  };

  // View-all modal — lines rise from 60% below at .07s intervals and underlines are drawn. Pressing goes to that feature
  const systemModal = {
    init() {
      this.modal = $("#kj-system-modal");
      this.items = $$(".kj-system-detail-item");
      this.reset();
      new SimpleBar($("#kj-system-modal-contents"), { autoHide: false });
      $("#kj-system-modal-open")?.addEventListener("click", () => this.open());
      this.items.forEach((it) => it.addEventListener("click", () => { system.goTo(parseInt(it.dataset.index, 10)); this.close(); }));
      $$(".kj-system-modal-close").forEach((b) => b.addEventListener("click", () => this.close()));
    },
    reset() { gsap.set(".kj-system-detail-inner", { opacity: 0, yPercent: 60 }); this.items.forEach((it) => it.classList.remove("is-active")); },
    open() {
      KJ.scroll?.disable();
      this.items.forEach((it, i) => gsap.delayedCall((i + 1) * 0.07, () => it.classList.add("is-active")));
      gsap.to(".kj-system-detail-inner", { opacity: 1, yPercent: 0, duration: 0.4, ease: "power2.out", stagger: 0.07, delay: 0.1 });
      gsap.timeline().set(this.modal, { display: "flex", scale: 0.94 }).to(this.modal, { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out", onComplete: () => this.modal.classList.add("is-active") });
      gsap.timeline().set("#kj-system-modal-bg", { display: "block", pointerEvents: "auto" }).to("#kj-system-modal-bg", { opacity: 0.8, duration: 0.3 });
    },
    close() {
      KJ.scroll?.enable();
      this.modal.classList.remove("is-active");
      gsap.timeline().to([this.modal, "#kj-system-modal-bg"], { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => this.reset() })
        .set([this.modal, "#kj-system-modal-bg"], { display: "none" });
    },
  };

  // ── Campaign: the number counts up 0→100, a CLEAR! stamp lands, and the DRAG circle follows the hand over a draggable card row ──
  const campaign = {
    init() {
      this.wrap = $("#campaign");
      new Swiper("#kj-campaign-slide", { loop: false, spaceBetween: 0, freeMode: { enabled: true, momentumVelocityRatio: isSp ? 2 : 1 }, slidesPerView: "auto" });
      if (!isSp) {
        const drug = $("#kj-campaign-drug"), list = $("#kj-campaign-list");
        list.addEventListener("pointermove", (ev) => {
          const p = drug.parentElement.getBoundingClientRect(), r = drug.getBoundingClientRect();
          gsap.set(drug, { x: ev.clientX - p.left - r.width / 2, y: ev.clientY - p.top - r.height / 2 });
        });
      }
    },
    inview() {
      if (this.wrap.classList.contains("is-active")) return;
      this.wrap.classList.add("is-active");
      gsap.set(".kj-campaign-item", { scale: 1.1, opacity: 0 });
      KJ.titleIn("campaign");
      gsap.to("#kj-campaign-100-title", { scale: isSp ? 1.05 : 1.1, duration: 0.5, ease: "power1.inOut" });
      gsap.to("#kj-campaign-lead", { opacity: 1, delay: 0.4, duration: 0.8, ease: "power2.out" });
      gsap.to(".kj-campaign-item", { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 });
      const num = $("#kj-campaign-100-number");
      gsap.set(num, { innerHTML: "0" });
      gsap.to(num, { opacity: 1, duration: 0.4, ease: "power1.inOut", delay: 0.2 });
      gsap.to(num, {
        innerHTML: parseInt(num.dataset.count || "100", 10), duration: 0.4, ease: "none", snap: { innerHTML: 1 }, delay: 0.2,
        onComplete: () => {
          gsap.to("#kj-campaign-100-text", { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
          gsap.to("#kj-campaign-100-title", { scale: 1, duration: 0.2, ease: "power2.out" });
          gsap.to("#kj-campaign-100-clear", { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", delay: 0.1 });
          gsap.to(".kj-campaign-100-inner", {
            opacity: 1, filter: "brightness(100%)", scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.04,
            onComplete: () => { if (!isSp) $("#kj-campaign-drug").classList.add("is-active"); },
          });
          gsap.to(".kj-campaign-item-inner", { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.3, stagger: 0.06 });
        },
      });
    },
  };

  // ── Specs: row underlines are drawn at .08s intervals and the text rises 15px from below. The neighboring account card has its border drawn while the English text settles into place ──
  const spec = {
    init() {
      this.pc = $$("#kj-x-title-pc span").map((el) => KJ.shuffle(el, { empty: "" }));
      this.sp = $$("#kj-x-title-sp span").map((el) => KJ.shuffle(el, { empty: "" }));
    },
    inviewPc() {
      const wrap = $("#last");
      if (wrap.classList.contains("is-active")) return;
      wrap.classList.add("is-active");
      $("#kj-x-frame-pc")?.classList.add("is-active");
      gsap.to("#kj-x-contents-pc", { opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.3, onStart: () => this.pc.forEach((s) => s.start()) });
      KJ.titleIn("spec");
      $$("#last .kj-spec-item").forEach((el, i) => gsap.delayedCall(i * 0.08, () => el.classList.add("is-active")));
      gsap.to("#last .kj-spec-text", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2, stagger: 0.06 });
    },
    inviewSp() {
      const wrap = $("#spec");
      if (wrap.classList.contains("is-active")) return;
      wrap.classList.add("is-active");
      KJ.titleIn("spec-sp");
      $$("#spec .kj-spec-item").forEach((el, i) => gsap.delayedCall(i * 0.04, () => el.classList.add("is-active")));
      gsap.to("#spec .kj-spec-text", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.04 });
    },
    inviewX() {
      const wrap = $("#x");
      if (wrap.classList.contains("is-active")) return;
      wrap.classList.add("is-active");
      $("#kj-x-frame-sp")?.classList.add("is-active");
      gsap.to("#kj-x-contents-sp", { opacity: 1, duration: 0.6, ease: "power1.out", delay: 0.3, onStart: () => this.sp.forEach((s) => s.start()) });
    },
  };

  const sections = { current: 0 };
  KJ.onSection = (e, t) => {
    if (e === 0) banner.inview();
    if (t === 0 && e !== 0) banner.outview();
    if (e === 1) trailer.inview(); else trailer.pause();
    if (e === 2) concept.inview();
    if (e === 3) story.inview();
    if (t === 3) story.outview();
    if (t === 4) character.outview();
    if (e === 4) character.inview(display.mode === "slide");
    if (t === 5) system.pause();
    if (e === 5) system.play();
    if (e === 6) campaign.inview();
    if (e === 7) (isSp ? spec.inviewSp() : spec.inviewPc());
    if (e === 8 && isSp) spec.inviewX();
    sections.current = e;
  };

  KJ.onBoot = () => {
    banner.init();
    trailer.init();
    trailerModal.init();
    story.init();
    storyModal.init();
    character.init();
    display.init();
    detail.init();
    system.init();
    systemModal.init();
    campaign.init();
    spec.init();
    // Original runs the loader after receiving three trailer videos. The placeholder video is ready right away
    KJ.loader.start();
  };
  KJ.boot();
})();
