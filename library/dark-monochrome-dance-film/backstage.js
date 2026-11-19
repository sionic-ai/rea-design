/* Backstage — four Pixi (4.6.2) photos. Original backstageCanvas values: transition 1.6s quint.inOut, displacement scale (0, 60), noise raised to .34 with steps(12) over .8s then down to .03 over .8s.
   Photos, displacement pattern and noise filter are our own (canvas-drawn placeholder photos, value-noise pattern, hand-written shader) */
(() => {
  const BB = (window.BB = window.BB || {});
  BB.pages = BB.pages || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const NOISE_FRAG = `precision mediump float;
    varying vec2 vTextureCoord; uniform sampler2D uSampler; uniform float uSeed; uniform vec4 uLevel;
    float r2(vec2 p){ return fract(sin(dot(p, vec2(12.9898 + uSeed, 78.233 + uSeed))) * 43758.5453 + uSeed); }
    void main(){ vec4 c = texture2D(uSampler, vTextureCoord); float n = r2(vTextureCoord) * 2.0 - 1.0; gl_FragColor = c + uLevel * n * c.a; }`;
  const GRAY_FRAG = `precision mediump float;
    varying vec2 vTextureCoord; uniform sampler2D uSampler; uniform float uStrength;
    void main(){ vec4 c = texture2D(uSampler, vTextureCoord); float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      gl_FragColor = vec4(mix(vec3(g) * c.a, c.rgb, uStrength), c.a); }`;

  // Placeholder photo — a still life (two ellipses) drawn with base, surface and text skin variables + a label. The photo itself doesn’t use original colors
  function photo(i, w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d"), bg = BB.css("--kf-surface"), mid = BB.css("--kf-raised"), ink = BB.css("--kf-ink"), dim = BB.css("--kf-dim");
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, mid); grd.addColorStop(1, bg);
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.12; g.fillStyle = ink;
    for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(w * (0.15 + 0.14 * k), h * (0.2 + ((k * 37 + i * 11) % 60) / 100), w * 0.18, h * 0.1, -0.5, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 0.75; g.fillStyle = ink;
    const sx = w * (0.38 + 0.06 * (i % 2)), sy = h * 0.42;
    g.beginPath(); g.ellipse(sx, sy, w * 0.13, h * 0.12, -0.35 + i * 0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(sx + w * 0.16, sy - h * 0.06, w * 0.12, h * 0.11, -0.25 + i * 0.15, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1; g.fillStyle = dim;
    g.font = `500 ${Math.round(h * 0.018)}px ${BB.css("--kf-font-mono")}`;
    g.textAlign = "center";
    g.fillText(`Site photo ${i + 1} · Still life of props on a film-set floor · angled from above · teal shade · landscape 16:9`, w / 2, h * 0.3);
    return c;
  }
  // Displacement pattern — 512px tiling value noise (stands in for the original backstage-texture.jpg)
  function dispMap() {
    const n = 512, c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d"), img = g.createImageData(n, n);
    let s = 3;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const cells = 16, grid = Array.from({ length: cells * cells }, rnd);
    const at = (x, y) => grid[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const fx = (x / n) * cells, fy = (y / n) * cells, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const v = (at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx) * (1 - sy) + (at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx) * sy;
      const k = (y * n + x) * 4, b = Math.round(v * 255);
      img.data[k] = b; img.data[k + 1] = 255 - b; img.data[k + 2] = b; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  class BackstageCanvas {
    constructor(el) {
      this.el = el;
      this.isAnimating = false; this.isTextHover = false; this.isStopped = true;
      this.slide = { current: 1, total: 4 };
      this.config = { duration: 1.6, scaleX: 0, scaleY: 60, noise: 0.34, ease: "quint.inOut" };
      this.wrap = $(".backstage-slider-wrap");
      this.prevBtn = $(".js-prev"); this.nextBtn = $(".js-next");
      this.videoBtn = $(".js-backstage-movies");
      this.textArea = $$(".backstage-slider-txt._right");
      this.pag = $("#js-backstage-slides-pagination");
      this.isVideoWatching = false;
    }
    init() {
      const w = (this.width = innerWidth), h = (this.height = innerHeight);
      this.renderer = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: false, resolution: Math.min(devicePixelRatio || 1, 2), autoResize: true });
      this.renderer.view.className = "backstage-slider-canvas";
      this.el.prepend(this.renderer.view);
      this.stage = new PIXI.Container();
      this.container = new PIXI.Container();
      this.stage.addChild(this.container);
      this.noiseLevel = { r: 0.03, g: 0.03, b: 0.03, a: 0 };
      this.levelArr = new Float32Array([0.03, 0.03, 0.03, 0]);
      this.noise = new PIXI.Filter(null, NOISE_FRAG, { uSeed: { type: "f", value: 0 }, uLevel: { type: "v4", value: this.levelArr } });
      this.gray = new PIXI.Filter(null, GRAY_FRAG, { uStrength: { type: "f", value: 1 } });
      this.container.filters = [this.noise];
      const dtex = PIXI.Texture.fromCanvas(dispMap());
      dtex.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
      this.images = []; this.disp = [];
      for (let i = 0; i < 4; i++) {
        const spr = new PIXI.Sprite(PIXI.Texture.fromCanvas(photo(i, 1280, 720)));
        this.cover(spr);
        spr.visible = i === 0;
        spr.originalX = spr.x;
        const ds = new PIXI.Sprite(dtex);
        ds.renderable = false;
        ds.scale.set(2);
        this.stage.addChild(ds);
        const f = new PIXI.filters.DisplacementFilter(ds, 0);
        f.scale.x = 0; f.scale.y = 0;
        spr.filters = [f];
        this.disp.push(f);
        this.images.push(spr);
        this.container.addChild(spr);
      }
      this.mask = new PIXI.Graphics();
      this.stage.addChild(this.mask);
      this.pts = Object.assign({}, [w / 2, h / 2, w / 2, h / 2, w / 2, h / 2, w / 2, h / 2]);
      this.drawMask();
      this.container.mask = this.mask;
      this.raf = () => {
        this.noise.uniforms.uSeed = (this.noise.uniforms.uSeed + 0.1) % 1;
        const L = this.levelArr; L[0] = this.noiseLevel.r; L[1] = this.noiseLevel.g; L[2] = this.noiseLevel.b; L[3] = this.noiseLevel.a; this.noise.uniforms.uLevel = L;
        this.isVideoPlay && this.updateSeek();
        this.renderer.render(this.stage);
      };
      this.start();
      this.events();
      this.clipIn(0);
    }
    cover(spr) {
      const tw = spr.texture.width, th = spr.texture.height, s = Math.max(this.width / tw, this.height / th);
      spr.scale.set(s);
      spr.x = (this.width - tw * s) / 2; spr.y = (this.height - th * s) / 2;
    }
    drawMask() { const p = this.pts; this.mask.clear(); this.mask.beginFill(0xffffff, 1); this.mask.drawPolygon([p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]]); this.mask.endFill(); }
    start() { if (!this.isStopped) return; this.isStopped = false; gsap.ticker.add(this.raf); }
    stop() { this.isStopped = true; gsap.ticker.remove(this.raf); }
    clipIn(delay = 0) {
      this.isAnimating = true;
      const w = innerWidth, h = innerHeight, cx = w / 2, cy = h / 2, D = BB.D;
      const steps = [[0, 0, cx, cy, cx, cy, cx, cy], [0, 0, w, 0, cx, cy, cx, cy], [0, 0, w, 0, w, h, cx, cy], [0, 0, w, 0, w, h, 0, h]];
      const p = this.pts, up = () => this.drawMask();
      const tl = gsap.timeline({ delay, onComplete: () => {
        this.container.mask = null;
        this.mask.clear();
        BB.objs.bg && !BB.objs.bg.isStopped && BB.objs.bg.stop();
        this.container.filters = [this.noise, this.gray];
        this.isAnimating = false;
        gsap.set(".g-center-line", { transformOrigin: "100% 50%", scaleX: 0 });
      } });
      [0.1, 0.2, 0.3, 0.3].forEach((d, k) => tl.to(p, { ...Object.fromEntries(steps[k].map((v, j) => [j, v])), duration: D(1), ease: "quint.out", onUpdate: up }, D(d)));
    }
    clipOut() {
      const w = innerWidth, h = innerHeight, cy = h / 2, D = BB.D;
      this.pts = Object.assign({}, [0, 0, w, 0, w, h, 0, h]);
      this.drawMask();
      this.container.mask = this.mask;
      gsap.to(this.pts, { 0: 0, 1: cy, 2: w, 3: cy, 4: w, 5: cy, 6: 0, 7: cy, duration: D(1), ease: "quint.inOut", onUpdate: () => this.drawMask() });
    }
    updatePagination(dir, n) { BB.anim.updatePagination(this.pag, dir, n); }
    turn(dir) {
      if (this.isAnimating || this.isVideoWatching) return;
      this.isAnimating = true;
      const D = BB.D, c = this.config, t = this.slide.current, i = dir === "next" ? (t % 4) + 1 : ((t + 2) % 4) + 1;
      gsap.fromTo(this.noiseLevel, { r: 0.03, g: 0.03, b: 0.03, a: 0 }, { r: c.noise, g: c.noise, b: c.noise, a: 1, duration: D(c.duration / 2), ease: "steps(12)" });
      gsap.to(this.noiseLevel, { r: 0.03, g: 0.03, b: 0.03, a: 0, duration: D(c.duration / 2), ease: "quint.out", delay: D(c.duration / 2) });
      const cur = this.images[t - 1], nxt = this.images[i - 1], sgn = dir === "next" ? 1 : -1;
      cur.visible = true; this.container.addChildAt(cur, Math.min(1, this.container.children.length - 1));
      nxt.visible = true; this.container.addChildAt(nxt, 0);
      gsap.fromTo(cur, { alpha: 1 }, { alpha: 0, duration: D(c.duration), ease: c.ease });
      gsap.fromTo(this.disp[t - 1].scale, { x: 0, y: 0 }, { x: sgn * c.scaleX, y: sgn * c.scaleY, duration: D(c.duration), ease: c.ease });
      gsap.fromTo(nxt, { alpha: 0 }, { alpha: 1, duration: D(c.duration), ease: c.ease });
      gsap.fromTo(this.disp[i - 1].scale, { x: sgn * c.scaleX, y: sgn * c.scaleY }, { x: 0, y: 0, duration: D(c.duration), ease: c.ease, onComplete: () => { cur.visible = false; this.isAnimating = false; } });
      this.updatePagination(dir, i);
      // The old text panel blurs out (blur 0→10px) over 1.8s quint.out and exits, 1.2s later the new panel swaps in, title words enter at random and body text enters .3s late over 1s
      const oldT = $(`[data-slider-txt="${t}"]`), newT = $(`[data-slider-txt="${i}"]`), o = { b: 0 };
      gsap.set(newT, { alpha: 0, clearProps: "filter" });
      gsap.to(oldT, { alpha: 0, duration: D(1.8), ease: "quint.out" });
      gsap.fromTo(o, { b: 0 }, { b: 10, duration: D(1.8), ease: "quint.out", onUpdate: () => gsap.set(oldT, { filter: `blur(${o.b}px)` }), onComplete: () => gsap.set(oldT, { clearProps: "filter,opacity" }) });
      BB.wait(1200, () => {
        gsap.set(oldT, { display: "none", alpha: 0, overwrite: "auto" }); oldT.classList.remove("is-visible");
        gsap.set(newT, { display: "block", alpha: 1 }); newT.classList.add("is-visible");
        gsap.set($(".ttl", newT), { autoAlpha: 1 });
        BB.anim.randomFadeIn(newT, ".ttl .words", 0);
        gsap.fromTo($(".txt", newT), { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(0.3) });
        const k = i - 1; scrollers[k] && (scrollers[k].refresh(), scrollers[k].scrollTo(0, 0));
      });
      this.slide.current = i;
    }
    pad(n) { return String(Math.floor(n)).padStart(2, "0"); }
    fmt(s) { return `${this.pad(s / 60)}:${this.pad(s % 60)}`; }
    updateSeek() {
      const v = this.video;
      if (!v || !v.duration) return;
      gsap.to("#js-backstage-seekbar", { scaleX: v.currentTime / v.duration, duration: 0.1 });
      $("#js-backstage-movies-current").textContent = this.fmt(v.currentTime);
      if (!this.seeking) $("#js-backstage-drag-seekbar").value = Math.round((v.currentTime / v.duration) * 1000);
    }
    watch() {
      if (this.isAnimating || this.isVideoWatching) return;
      this.isVideoWatching = true;
      const D = BB.D;
      if (!this.video) {
        this.video = document.createElement("video");
        this.video.src = "media/film.mp4"; this.video.muted = true; this.video.playsInline = true; this.video.loop = false;
        this.video.addEventListener("loadedmetadata", () => { $("#js-backstage-movies-duration").textContent = this.fmt(this.video.duration); });
        this.video.addEventListener("ended", () => this.close());
        this.vSprite = new PIXI.Sprite(PIXI.Texture.fromVideo(this.video));
        this.vSprite.texture.baseTexture.autoPlay = false;
      }
      const fit = () => { const vw = this.video.videoWidth || 704, vh = this.video.videoHeight || 396, s = Math.max(this.width / vw, this.height / vh); this.vSprite.scale.set(s); this.vSprite.x = (this.width - vw * s) / 2; this.vSprite.y = (this.height - vh * s) / 2; };
      this.video.readyState >= 1 ? fit() : this.video.addEventListener("loadedmetadata", fit, { once: true });
      // Original onWatchVideo — jumps with noise .34 (steps 12) like a transition, the current photo smears out with displacement 60 and the video comes in at 1.6s
      const c = this.config, cur = this.images[this.slide.current - 1], f = this.disp[this.slide.current - 1];
      gsap.fromTo(this.noiseLevel, { r: 0.03, g: 0.03, b: 0.03, a: 0 }, { r: c.noise, g: c.noise, b: c.noise, a: 1, duration: D(c.duration / 2), ease: "steps(12)" });
      gsap.to(this.noiseLevel, { r: 0, g: 0, b: 0, a: 0, duration: D(c.duration / 2), ease: "quint.out", delay: D(c.duration / 2) });
      this.vSprite.alpha = 0;
      this.container.addChildAt(this.vSprite, 0);
      gsap.fromTo(cur, { alpha: 1 }, { alpha: 0, duration: D(c.duration), ease: c.ease });
      gsap.fromTo(f.scale, { x: 0, y: 0 }, { x: c.scaleX, y: c.scaleY, duration: D(c.duration), ease: c.ease });
      gsap.to(this.vSprite, { alpha: 1, duration: D(c.duration), ease: c.ease });
      this.video.currentTime = 0;
      this.video.play().catch(() => {});
      this.isVideoPlay = true;
      BB.anim.setAttractors("disable", $(".backstage-slider-wrap"));
      BB.anim.setAttractors("enable", $(".backstage-movies-control-wrap"));
      BB.anim.setAttractors("enable", $(".backstage-movies-close-btn-wrap"));
      const ui = [".menu-btn", ".detail-header-ttl", ".detail-back-to-home", ".backstage-slider-txt-wrap.is-visible", ".backstage-slider-nav", ".backstage-slider-overlay", ".backstage-slider .center-line", "#js-backstage-slides-pagination", ".backstage-movies-btn-wrap"];
      gsap.to(ui, { autoAlpha: 0, duration: D(0.5), onComplete: () => gsap.set(ui, { display: "none" }) });
      gsap.to([".backstage-movies-control-wrap", ".backstage-movies-close-btn-wrap"], { autoAlpha: 1, pointerEvents: "auto", duration: D(0.8), delay: D(0.5) });
      BB.objs.cursor && (BB.objs.cursor.update(), BB.objs.cursor.morphDefault(0.5));
    }
    close() {
      if (!this.isVideoWatching) return;
      const D = BB.D;
      this.isVideoPlay = false;
      this.video.pause();
      const cur = this.images[this.slide.current - 1], f = this.disp[this.slide.current - 1], c = this.config;
      cur.visible = true;
      gsap.fromTo(cur, { alpha: 0 }, { alpha: 1, duration: D(c.duration), ease: c.ease });
      gsap.fromTo(f.scale, { x: c.scaleX, y: c.scaleY }, { x: 0, y: 0, duration: D(c.duration), ease: c.ease });
      gsap.to(this.noiseLevel, { r: 0.03, g: 0.03, b: 0.03, a: 0, duration: D(0.35), ease: "steps(12)" });
      gsap.to(this.vSprite, { alpha: 0, duration: D(0.8), onComplete: () => { this.container.removeChild(this.vSprite); this.isVideoWatching = false; } });
      gsap.to([".backstage-movies-control-wrap", ".backstage-movies-close-btn-wrap"], { autoAlpha: 0, pointerEvents: "none", duration: D(0.5) });
      const ui = [".menu-btn", ".detail-header-ttl", ".detail-back-to-home", ".backstage-slider-txt-wrap.is-visible", ".backstage-slider-nav", ".backstage-slider-overlay", ".backstage-slider .center-line", "#js-backstage-slides-pagination", ".backstage-movies-btn-wrap"];
      gsap.set(ui, { display: "" });
      gsap.to(ui, { autoAlpha: 1, duration: D(1), delay: D(0.5) });
      BB.anim.setAttractors("enable", $(".backstage-slider-wrap"));
      BB.anim.setAttractors("disable", $(".backstage-movies-control-wrap"));
      BB.anim.setAttractors("disable", $(".backstage-movies-close-btn-wrap"));
      BB.objs.cursor && BB.objs.cursor.morphDefault(0.5);
    }
    togglePlay() {
      const b = $("#js-backstage-movies-play-toggle-btn");
      if (this.video.paused) { this.video.play().catch(() => {}); this.isVideoPlay = true; b.classList.remove("is-paused"); }
      else { this.video.pause(); this.isVideoPlay = false; b.classList.add("is-paused"); }
    }
    events() {
      this.onPrev = () => this.turn("prev");
      this.onNext = () => this.turn("next");
      this.onWheel = (e) => { if (this.isAnimating || this.isTextHover || this.isVideoWatching || Math.abs(e.deltaY) <= 10) return; e.deltaY > 0 ? this.turn("next") : this.turn("prev"); };
      this.onKey = (e) => {
        if (BB.flags.isGlobalMenu) return;
        if (e.keyCode === 37 || e.keyCode === 38) this.turn("prev");
        if (e.keyCode === 39 || e.keyCode === 40) this.turn("next");
        if (e.keyCode === 27) this.close();
      };
      this.enter = () => { this.isTextHover = true; };
      this.leaveT = () => { this.isTextHover = false; };
      this.onResize = () => {
        this.width = innerWidth; this.height = innerHeight;
        this.renderer.resize(this.width, this.height);
        this.images.forEach((s) => this.cover(s));
      };
      this.prevBtn.addEventListener("click", this.onPrev);
      this.nextBtn.addEventListener("click", this.onNext);
      this.videoBtn.addEventListener("click", () => this.watch());
      $("#js-backstage-movies-close-btn").addEventListener("click", () => this.close());
      $("#js-backstage-movies-play-toggle-btn").addEventListener("click", () => this.togglePlay());
      const seek = $("#js-backstage-drag-seekbar");
      seek.addEventListener("input", () => { this.seeking = true; if (this.video && this.video.duration) this.video.currentTime = (seek.value / 1000) * this.video.duration; });
      seek.addEventListener("change", () => { this.seeking = false; });
      this.textArea.forEach((t) => { t.addEventListener("mouseenter", this.enter); t.addEventListener("mouseleave", this.leaveT); });
      this.wrap.addEventListener("wheel", this.onWheel, { passive: true });
      if (BB.isMobile) {
        this.hammer = new Hammer(this.wrap, { touchAction: "pan-x pan-y" });
        this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
        this.hammer.on("swipeup swipeleft", () => !this.isTextHover && this.turn("next"));
        this.hammer.on("swipedown swiperight", () => !this.isTextHover && this.turn("prev"));
      }
      document.addEventListener("keydown", this.onKey);
      addEventListener("resize", this.onResize);
    }
    destroy() {
      this.stop();
      this.prevBtn.removeEventListener("click", this.onPrev);
      this.nextBtn.removeEventListener("click", this.onNext);
      this.wrap.removeEventListener("wheel", this.onWheel);
      this.hammer && this.hammer.destroy();
      document.removeEventListener("keydown", this.onKey);
      removeEventListener("resize", this.onResize);
      this.video && this.video.pause();
      this.renderer.destroy(true);
    }
  }

  let scrollers = [];
  BB.pages.backstage = {
    before() {
      BB.vars.currentIndex = 2;
      BB.anim.split(".backstage-slider-txt .ttl", "words");
      gsap.set([".detail-back-to-home", ".backstage-slider-overlay", ".backstage-slider-txt .ttl .words", ".backstage-slider-txt .txt", ".backstage-slider-nav", ".backstage-movies-btn-wrap", "#js-backstage-slides-pagination .num"], { autoAlpha: 0 });
      gsap.set(".backstage-slider .center-line", { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set("#js-backstage-slides-pagination .line", { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set(["#js-backstage-slides-pagination .left", "#js-backstage-slides-pagination .right"], { y: "100%" });
      gsap.set("#js-backstage-slides-pagination .total", { y: "-100%" });
      BB.objs.backstage = new BackstageCanvas($("#js-backstage-slider"));
    },
    init() {
      const D = BB.D, e = 1.2;
      BB.anim.detailsTitleIn();
      gsap.set("#js-backstage-slides-pagination .num", { autoAlpha: 1 });
      gsap.fromTo(".detail-back-to-home", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1) });
      gsap.fromTo(".backstage-slider-overlay", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(e) });
      gsap.fromTo(".backstage-slider .center-line", { scaleX: 0 }, { scaleX: 1, duration: D(1), delay: D(1.45), ease: "quint.inOut" });
      gsap.fromTo("#js-backstage-slides-pagination .line", { scaleX: 0, alpha: 1, transformOrigin: "50% 50%" }, { scaleX: 1, duration: D(1), delay: D(1.7), ease: "quint.out" });
      gsap.to(["#js-backstage-slides-pagination .left", "#js-backstage-slides-pagination .right", "#js-backstage-slides-pagination .total"], { y: "0%", duration: D(1), delay: D(1.85), ease: "quint.out", clearProps: "all" });
      const first = $('[data-slider-txt="1"]');
      gsap.set(".backstage-slider-txt .ttl", { autoAlpha: 1 });
      BB.anim.randomFadeIn(first, ".ttl .words", 1.7);
      gsap.fromTo($(".txt", first), { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(1.85) });
      gsap.fromTo([".backstage-slider-nav", ".backstage-movies-btn-wrap"], { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(2.05) });
      scrollers = $$(".backstage-slider-txt._right .txt").map((t) => new IScroll(t, { snap: false, useTransition: false, momentum: false, bounce: false, mouseWheel: true, scrollbars: "custom" }));
      BB.anim.setAttractors("disable", $(".backstage-movies-control-wrap"));
      BB.anim.setAttractors("disable", $(".backstage-movies-close-btn-wrap"));
      BB.objs.backstage.init();
    },
    out(old) {
      const D = BB.D, A = BB.anim, bg = BB.objs.bg;
      bg.isStopped && bg.start();
      bg.fadeOut(false, 2, 0);
      bg.hidePoints(false, 2, 0);
      BB.objs.backstage.close();
      BB.objs.backstage.clipOut();
      A.randomFadeOut(old, ".backstage-slider-txt-wrap.is-visible .ttl .words", 0);
      A.blurFadeOut([old.querySelector(".detail-back-to-home"), old.querySelector(".backstage-slider-nav"), old.querySelector(".backstage-movies-btn-wrap"), old.querySelector(".backstage-slider-txt-wrap.is-visible .txt")], true, 0);
      A.detailsTitleOut(0);
      gsap.to(old.querySelector(".backstage-slider-overlay"), { autoAlpha: 0, duration: D(1), ease: "none" });
      gsap.to(["#js-backstage-slides-pagination .left", "#js-backstage-slides-pagination .right"], { y: "100%", duration: D(0.65), ease: "quint.out" });
      gsap.to("#js-backstage-slides-pagination .total", { y: "-100%", duration: D(0.65), ease: "quint.out" });
      gsap.to("#js-backstage-slides-pagination .line", { scaleX: 0, alpha: 0, duration: D(1), ease: "quint.out" });
      gsap.fromTo(old.querySelector(".backstage-slider .center-line"), { transformOrigin: "100% 50%" }, { scaleX: 0, duration: D(1), ease: "quint.inOut" });
    },
    destroy() {
      scrollers.forEach((s) => s.destroy());
      scrollers = [];
      BB.objs.backstage && BB.objs.backstage.destroy();
      BB.objs.backstage = null;
    },
  };
})();
