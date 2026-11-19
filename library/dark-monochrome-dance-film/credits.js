/* Credits — widens smooth-scrolling (2.3.12) so each data-speed piece follows separately rather than the whole band (original creditsScroller).
   Set direction so the vertical wheel runs horizontally "vertical horizontal" Set as is (the original desktop setting). Cast cards wind up .1s each at 60ms intervals on hover */
(() => {
  const BB = (window.BB = window.BB || {});
  BB.pages = BB.pages || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  let Scroller = null;
  const makeClass = () => {
    if (Scroller || !window.Smooth) return Scroller;
    Scroller = class CreditsScroller extends window.Smooth {
      constructor(opt) {
        super(opt);
        this.dom.lists = opt.lists; this.dom.speeds = opt.speeds; this.dom.canvas = opt.canvas; this.dom.line = opt.line;
        this.dragArea = opt.dragArea;
        this.getCache = this.getCache.bind(this);
      }
      init() { super.init(); this.events(); }
      resize() { this.resizing = true; this.reset(); super.resize(); this.getCache(); this.resizing = false; }
      getCache() {
        this.cache = []; this.speeds = []; this.wrapperWidth = 0;
        this.dom.lists.forEach((t) => { this.wrapperWidth += t.clientWidth; });
        this.dom.speeds.forEach((t) => this.speeds.push({ x: 0, ease: +t.getAttribute("data-speed") }));
        this.dom.section.style.width = this.vars.width + "px";
        this.vars.bounding = this.wrapperWidth + this.dom.lists.length - this.vars.width;
      }
      reset() {
        this.dom.canvas.forEach((t) => { t.style[this.prefix] = this.getTransform(0); });
        this.dom.speeds.forEach((t) => { t.style[this.prefix] = this.getTransform(0); });
        this.dom.line.style[this.prefix] = "scale3d(0, 1, 1)";
      }
      run() { super.run(); this.custom(); }
      custom() {
        if (!this.cache || this.resizing) return;
        const cur = this.vars.current;
        this.dom.speeds.forEach((t, i) => {
          const n = this.speeds[i];
          n.x += (cur - n.x) * (BB.reduce ? 1 : n.ease);
          if (n.x <= 0.001) n.x = 0;
          t.style[this.prefix] = this.getTransform(-n.x);
        });
        const p = cur / Math.max(1, this.wrapperWidth - this.vars.width);
        this.dom.line.style[this.prefix] = `scale3d(${p}, 1, 1)`;
        const end = p > 0.99;
        if (end !== this.atEnd && !this.rotation) {
          this.atEnd = end;
          this.rotation = true;
          gsap.to(".credits-scroll-down .scroll-down-btn .svg-icon", { rotation: end ? 180 : 0, duration: BB.D(end ? 0.85 : 0.65), ease: end ? "quint.inOut" : "quint.out", onComplete: () => { this.rotation = false; } });
        }
      }
      events() {
        this.onClick = () => {
          let v = this.vars.current + this.wrapperWidth / 10;
          if (this.vars.current / (this.wrapperWidth - this.vars.width) > 0.99) v = 0;
          super.scrollTo(v);
        };
        this.down = (e) => { if (BB.isMobile || e.button !== 0) return; this.startX = this.curX = e.clientX; this.dragging = true; BB.flags.isArrowHovered || BB.objs.cursor.enableDragging(); };
        this.move = (e) => {
          if (BB.isMobile || !this.dragging || !BB.flags.isGrabbing) return;
          this.startX = e.clientX;
          super.scrollTo(this.vars.current - 10 * (this.startX - this.curX));
          this.curX = this.startX;
        };
        this.up = () => { if (!this.dragging) return; this.dragging = false; BB.flags.isArrowHovered || BB.objs.cursor.disableDragging(); };
        this.clickElem = $(".credits-scroll-down .scroll-down-btn");
        this.clickElem.addEventListener("click", this.onClick);
        this.dragArea.addEventListener("mousedown", this.down);
        this.dragArea.addEventListener("mousemove", this.move);
        addEventListener("mouseup", this.up);
      }
      destroy() {
        this.clickElem.removeEventListener("click", this.onClick);
        this.dragArea.removeEventListener("mousedown", this.down);
        this.dragArea.removeEventListener("mousemove", this.move);
        removeEventListener("mouseup", this.up);
        super.destroy();
      }
    };
    return Scroller;
  };

  // Cast card — video drawn on a canvas, on hover it advances +.1s every 60ms (up to 4s), on leave it rewinds at -.1s. Cursor position drives rotationX and skewX (.5s)
  class CastVideo {
    constructor(el) {
      this.el = el;
      this.duration = +el.getAttribute("data-duration") || 1;
      this.box = $(".video-translate", el);
      this.inner = $(".video-inner", el);
    }
    init() {
      this.video = document.createElement("video");
      this.video.src = this.el.getAttribute("data-src");
      this.video.muted = true; this.video.playsInline = true; this.video.preload = "auto";
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.box.appendChild(this.canvas);
      this.video.addEventListener("loadedmetadata", () => { this.aspect = this.video.videoHeight / this.video.videoWidth; this.size(); this.video.currentTime = 0.01; });
      this.video.addEventListener("seeked", () => this.draw());
      this.enter = () => this.play();
      this.leave = () => this.rewind();
      this.mv = (e) => this.tilt(e);
      if (BB.isDesktop) { this.el.addEventListener("mouseenter", this.enter); this.el.addEventListener("mouseleave", this.leave); this.el.addEventListener("mousemove", this.mv); }
      this.rs = () => this.size();
      addEventListener("resize", this.rs);
    }
    size() {
      if (!this.aspect) return;
      const w = this.box.clientWidth, h = Math.max(this.box.clientHeight, Math.round(w * this.aspect));
      this.canvas.width = Math.round(h / this.aspect); this.canvas.height = h;
      this.draw();
    }
    draw() { if (this.video.readyState >= 2) this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height); }
    step(dir) {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        const t = this.video.currentTime + dir * 0.1;
        if ((dir > 0 && t >= this.duration) || (dir < 0 && t <= 0)) { this.video.currentTime = dir > 0 ? Math.min(this.duration, this.video.duration || this.duration) : 0; clearInterval(this.timer); return; }
        this.video.currentTime = t;
      }, 60);
    }
    play() { if (this.hovered) return; this.hovered = true; this.step(1); }
    rewind() {
      gsap.killTweensOf(this.canvas);
      gsap.to(this.canvas, { rotationX: 0, skewX: 0, duration: 0.5 });
      if (!this.hovered) return;
      this.hovered = false;
      this.step(-1);
    }
    tilt(e) {
      const r = this.inner.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, a = 20 * (y / r.height - 0.5);
      gsap.to(this.canvas, { rotationX: -a, skewX: 20 * (x / r.width - 0.5) * 0.3, transformOrigin: "50% 100%", xPercent: -50, yPercent: -50, left: "50%", top: "50%", duration: 0.5 });
    }
    destroy() {
      clearInterval(this.timer);
      this.el.removeEventListener("mouseenter", this.enter); this.el.removeEventListener("mouseleave", this.leave); this.el.removeEventListener("mousemove", this.mv);
      removeEventListener("resize", this.rs);
      this.video.removeAttribute("src"); this.video.load();
    }
  }

  let casts = [];
  BB.pages.credits = {
    before() {
      BB.vars.currentIndex = 3;
      gsap.set([".detail-back-to-home", ".credits-scroll-down", ".cast-img-wrap .cast-role", ".cast-img-wrap .cast-name", ".credits-ttl .ttl", ".credits-job .job", ".credits-job .name-lists"], { autoAlpha: 0 });
      $$(".cast-img-wrap .video-clip").forEach((c) => { const w = c.clientWidth || 480, h = c.clientHeight || 300; gsap.set(c, { autoAlpha: 1, clip: `rect(${h / 2}px, ${w}px, ${h / 2}px, 0px)` }); });
      casts = $$(".js-video-canvas").map((el) => { const c = new CastVideo(el); c.init(); return c; });
      const C = makeClass();
      if (C) {
        BB.objs.credits = new C({
          preload: false, native: false, ease: BB.isMobile ? 0.2 : 0.1,
          direction: "vertical horizontal",
          section: $("#js-credits-scroller"), listener: $(".credits"), noscrollbar: true,
          lists: $$(".js-credits-list"), speeds: $$("[data-speed]", $("#js-credits-lists")),
          canvas: $$(".video-translate"), line: $("#js-credits-scroller-line"), dragArea: $(".credits"),
        });
      }
    },
    init() {
      const D = BB.D;
      BB.anim.detailsTitleIn();
      gsap.fromTo(".detail-back-to-home", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1) });
      [[1, 0.25, 0.65, 0.75], [2, 0.35, 0.75, 0.85]].forEach(([n, d1, d2, d3]) => {
        const vc = $(`.js-credits-list._cast._${n} .video-clip`);
        gsap.to(vc, { clip: `rect(0px, ${vc.clientWidth}px, ${vc.clientHeight}px, 0px)`, duration: D(1), delay: D(d1), ease: "quint.inOut", onComplete: () => gsap.set(vc, { clearProps: "clip" }) });
        gsap.to(`.js-credits-list._cast._${n} .cast-role`, { autoAlpha: 1, duration: D(0.65), delay: D(d2), ease: "none" });
        gsap.to(`.js-credits-list._cast._${n} .cast-name`, { autoAlpha: 1, duration: D(0.65), delay: D(d3), ease: "none" });
      });
      gsap.fromTo(".credits-ttl .ttl", { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: D(0.65), delay: D(0.85), ease: "quint.out" });
      gsap.fromTo(".credits-job .job", { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: D(0.65), delay: D(0.95), ease: "quint.out" });
      gsap.fromTo(".credits-job .name-lists", { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: D(0.65), delay: D(1.05), ease: "quint.out" });
      gsap.fromTo(".credits-scroll-down", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(1) });
      BB.objs.credits && BB.objs.credits.init();
      BB.objs.bg.showPoints(false, 3, 0.1);
    },
    out(old) {
      const D = BB.D, A = BB.anim;
      BB.objs.bg.fadeOut(false, 3, 0);
      BB.objs.bg.hidePoints(false, 3, 0);
      A.blurFadeOut([old.querySelector(".detail-back-to-home"), old.querySelector(".credits-scroll-down")], true, 0);
      A.detailsTitleOut(0);
      gsap.to(old.querySelectorAll(".credits-ttl .ttl, .credits-job .job, .credits-job .name-lists, .cast-role, .cast-name"), { autoAlpha: 0, duration: D(0.65), ease: "none" });
      gsap.fromTo(".g-center-line", { transformOrigin: "100% 50%" }, { scaleX: 0, duration: D(1), ease: "quint.inOut" });
      old.querySelectorAll(".js-video-canvas .video-clip").forEach((c) => { const w = c.clientWidth, h = c.clientHeight; gsap.fromTo(c, { clip: `rect(0px, ${w}px, ${h}px, 0px)` }, { clip: `rect(${h / 2}px, ${w}px, ${h / 2}px, 0px)`, duration: D(1), ease: "quint.inOut" }); });
    },
    destroy() {
      casts.forEach((c) => c.destroy());
      casts = [];
      BB.objs.credits && BB.objs.credits.destroy();
      BB.objs.credits = null;
    },
  };
})();
