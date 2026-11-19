/* Home — four-section paging (wheel · swipe · arrow keys · title tap) and a drag band. Original homeSlider · homeDragger values as is */
(() => {
  const BB = (window.BB = window.BB || {});
  BB.pages = BB.pages || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  class HomeSlider {
    constructor() {
      this.isAnimating = false;
      this.total = 4;
      this.current = BB.vars.currentIndex || 1;
      this.wrap = $("#js-home-slides");
      this.pag = $("#js-home-slides-pagination");
      this.video = $("#js-home-movie");
      this.scrollDown = $(".home-scroll-down");
      this.scrollBtn = $(".home-scroll-down .scroll-down-btn");
      this.title = $(".home-ttl .ttl");
    }
    slide(n) { return $(`[data-home-section="${n}"]`); }
    setSlide(mode, from, to) {
      const show = (a, b) => {
        if (a) { gsap.set(a, { display: "none" }); a.classList.remove("is-visible"); }
        if (b) { gsap.set(b, { display: "block" }); b.classList.add("is-visible"); }
      };
      if (mode === "all") { $$(".home-slide-wrap").forEach((e) => { gsap.set(e, { display: "none" }); e.classList.remove("is-visible"); }); BB.wait(1, () => show(null, to)); }
      else show(from, to);
    }
    setAttractors(state, root) { BB.anim.setAttractors(state, root); }
    setPagination(n) {
      const w = $(".num-wrap", this.pag), cur = $(".is-current", this.pag);
      cur && cur.remove();
      const s = document.createElement("span");
      s.textContent = n; s.className = "is-current";
      w.appendChild(s);
    }
    updatePagination(dir, n) { BB.anim.updatePagination(this.pag, dir, n); }
    blur(el, to, dur) {
      const o = { amount: to ? 10 : 0 };
      gsap.fromTo(o, { amount: to ? 10 : 0 }, { amount: to ? 0 : 10, duration: BB.D(dur), ease: "quint.out", onUpdate: () => gsap.set(el, { filter: `blur(${o.amount}px)` }), onComplete: () => gsap.set(el, { clearProps: "filter" }) });
    }
    updateScrollDown(state) {
      BB.anim.setAttractors(state, this.scrollDown);
      if (state === "enable") { this.scrollDown.classList.remove("is-hidden"); gsap.to(this.scrollDown, { autoAlpha: 1, duration: BB.D(1), ease: "quint.out" }); this.blur(this.scrollDown, true, 1); }
      else { this.scrollDown.classList.add("is-hidden"); gsap.to(this.scrollDown, { autoAlpha: 0, duration: BB.D(1), ease: "quint.out" }); this.blur(this.scrollDown, false, 1); }
    }
    link(slide) { return $(".home-section-link", slide) || $(".home-movies-link", slide); }
    before(dir, n, old) {
      if (BB.isDesktop && BB.flags.isArrowHovered) BB.objs.cursor.morphDefault(0.5);
      this.link(old).classList.remove("is-visible");
      if (n === 3 && dir === "prev") this.updateScrollDown("enable");
      if (n === 4) { if (dir === "next") this.updateScrollDown("disable"); BB.objs.cursor.morphDefault(0.5); }
    }
    fadeBtn(el, delay) {
      const D = BB.D;
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.65), delay: D(delay), onComplete: () => this.setAttractors("enable", el.closest(".home-slide-wrap")) });
      BB.wait(1000 * D(delay) + 250, () => el.classList.add("is-visible"));
    }
    after(dir, n, slide, bgDelay = 0) {
      const D = BB.D, link = this.link(slide), sub = $(".sub-ttl", slide), line = $(".home-section-ttl .line", slide);
      gsap.set(slide, { alpha: 1 });
      gsap.set(link, { autoAlpha: 0 });
      BB.anim.maskTextIn($(".home-section-ttl-wrap", slide), 0);
      if (n < 4) {
        BB.objs.bg.fadeIn(true, n, bgDelay);
        BB.anim.randomFadeIn(slide, ".home-section-description-txt .words", 0.5);
        if (n > 1) {
          gsap.fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.5), ease: "sine.inOut", delay: D(0.1) });
          gsap.fromTo(line, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: D(1), ease: "quint.out", delay: D(0.5), clearProps: "all" });
        }
        this.fadeBtn(link, 0.9);
        this.video && this.video.pause();
      } else {
        const wrap = $("#js-home-movie-wrap"), w = wrap.clientWidth, h = wrap.clientHeight;
        gsap.fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.5), ease: "sine.inOut", delay: D(0.1) });
        gsap.fromTo(line, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: D(1), ease: "quint.out", delay: D(0.5), clearProps: "all" });
        gsap.fromTo(wrap, { clip: `rect(${h / 2}px, ${w}px, ${h / 2}px, 0px)` }, { clip: `rect(0px, ${w}px, ${h}px, 0px)`, duration: D(1), ease: "quint.inOut", delay: D(0.9), clearProps: "clip" });
        this.fadeBtn(link, 1.3);
        if (this.video) { this.video.currentTime = 0; this.video.play().catch(() => {}); }
      }
    }
    go(dir, target) {
      if (this.isAnimating) return;
      const t = this.current, i = target != null ? target : dir === "next" ? t + 1 : t - 1;
      if (i < 1 || i > this.total || i === t) return;
      this.isAnimating = true;
      const from = this.slide(t), to = this.slide(i);
      BB.objs.bg.fadeOut(true, t, 0);
      this.setAttractors("disable", from);
      gsap.set(from, { clearProps: "filter" });
      gsap.to(from, { alpha: 0, duration: BB.D(1), ease: "quint.out" });
      this.blur(from, false, 1);
      this.updatePagination(dir, i);
      this.before(dir, i, from);
      if (target === 1 && t === 4) this.updateScrollDown("enable");
      BB.wait(target === 1 ? 900 : 700, () => {
        this.setSlide("normal", from, to);
        this.setAttractors("enable", to);
        this.after(dir, i, to);
        this.current = i; BB.vars.currentIndex = i;
      });
      BB.wait(1800, () => { this.isAnimating = false; });
    }
    init() {
      this.wheel = (e) => {
        const d = e.deltaY;
        if (this.isAnimating || Math.abs(d) <= 10) return;
        d > 0 ? this.go("next") : this.go("prev");
      };
      this.key = (e) => {
        if (BB.flags.isGlobalMenu) return;
        if (e.keyCode === 37 || e.keyCode === 38) this.go("prev");
        if (e.keyCode === 39 || e.keyCode === 40) this.go("next");
      };
      this.click = () => this.go("next");
      this.intro = () => this.current !== 1 && this.go("prev", 1);
      this.scrollBtn.addEventListener("click", this.click);
      this.title.addEventListener("click", this.intro);
      if (BB.isDesktop) this.wrap.addEventListener("wheel", this.wheel, { passive: true });
      else {
        this.hammer = new Hammer(this.wrap, { touchAction: "pan-x pan-y" });
        this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
        this.hammer.on("swipeup swipeleft", () => this.go("next"));
        this.hammer.on("swipedown swiperight", () => this.go("prev"));
      }
      document.addEventListener("keydown", this.key);
    }
    destroy() {
      this.wrap.removeEventListener("wheel", this.wheel);
      this.hammer && this.hammer.destroy();
      this.scrollBtn.removeEventListener("click", this.click);
      this.title.removeEventListener("click", this.intro);
      document.removeEventListener("keydown", this.key);
    }
  }

  // Drag — grab and push the screen and the section-name strip follows 3x faster than the hand over .5s, and on release it snaps to the nearest section in .75s
  class HomeDragger {
    constructor() {
      this.isAnimating = false; this.isLinkHover = false;
      this.links = $$(".js-no-drag");
      this.area = $(".home");
      this.el = $(".home-dragger-scroller");
      this.x = 0;
    }
    measure() { this.elW = this.el.clientWidth; this.secW = $(".home-dragger-section").clientWidth; }
    textIn() {
      const D = BB.D;
      gsap.killTweensOf(".home-dragger-section-ttl .inner");
      gsap.fromTo(".home-dragger-section-ttl .top .inner", { y: "60%" }, { y: "0%", duration: D(1), ease: "quint.out" });
      gsap.fromTo(".home-dragger-section-ttl .bottom .inner", { y: "-60%" }, { y: "0%", duration: D(1), ease: "quint.out" });
    }
    fadeIn() {
      gsap.set(".home-dragger-sections", { autoAlpha: 1 });
      gsap.to(["#js-home-slides", "#js-home-slides-pagination", ".home-scroll-down"], { autoAlpha: 0, duration: BB.D(0.25), ease: "none" });
      this.textIn();
    }
    textOut(kind, n) {
      const D = BB.D;
      if (kind === "same") {
        gsap.to(["#js-home-slides", "#js-home-slides-pagination"], { autoAlpha: 1, duration: D(0.45), ease: "none" });
        gsap.to(".home-dragger-section-ttl .top .inner", { y: "60%", duration: D(1), ease: "quint.out", clearProps: "all" });
        gsap.to(".home-dragger-section-ttl .bottom .inner", { y: "-60%", duration: D(1), ease: "quint.out", clearProps: "all", onComplete: () => gsap.set(".home-dragger-sections", { autoAlpha: 0 }) });
        if (n !== 4) gsap.to(".home-scroll-down", { autoAlpha: 1, duration: D(0.45), ease: "none" });
      } else {
        gsap.to(".home-dragger-section-ttl .top .inner", { y: "60%", duration: D(1), ease: "quint.out", clearProps: "all" });
        gsap.to(".home-dragger-section-ttl .bottom .inner", { y: "-60%", duration: D(1), ease: "quint.out", clearProps: "all" });
        gsap.killTweensOf(`.home-dragger-section._${n} .inner`);
        gsap.to(`.home-dragger-section._${n} .inner`, { y: "0%", duration: D(0.45), ease: "quint.out" });
        gsap.to(`.home-dragger-section._${n} .top .inner`, { y: "60%", duration: D(1), delay: D(0.65), ease: "quint.inOut", clearProps: "all" });
        gsap.to(`.home-dragger-section._${n} .bottom .inner`, { y: "-60%", duration: D(1), delay: D(0.65), ease: "quint.inOut", clearProps: "all", onComplete: () => gsap.set(".home-dragger-sections", { autoAlpha: 0 }) });
        if (n !== 4) gsap.to(".home-scroll-down", { autoAlpha: 1, duration: D(0.45), delay: D(1), ease: "none" });
      }
    }
    fadeOut(n, changed) {
      if (!changed) return;
      const S = BB.objs.slider, D = BB.D;
      gsap.set(["#js-home-slides", "#js-home-slides-pagination"], { autoAlpha: 1 });
      if (n === 4) S.updateScrollDown("disable");
      else if ($(".home-scroll-down").classList.contains("is-hidden")) S.updateScrollDown("enable");
      BB.objs.bg.fadeOut(true, BB.vars.currentIndex, 0);
      BB.vars.currentIndex = n;
      const slide = S.slide(n);
      S.link(slide).classList.remove("is-visible");
      S.current = n;
      S.setPagination(n);
      S.setSlide("all", null, slide);
      S.setAttractors("enable", slide);
      BB.wait(1, () => S.after("next", n, slide, 0.5));
      gsap.set("#js-home-slides-pagination .line", { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set(["#js-home-slides-pagination .left", "#js-home-slides-pagination .right"], { y: "100%" });
      gsap.set("#js-home-slides-pagination .total", { y: "-100%" });
      gsap.fromTo("#js-home-slides-pagination .line", { scaleX: 0, alpha: 1, transformOrigin: "50% 50%" }, { scaleX: 1, duration: D(1), delay: D(0.5), ease: "quint.out" });
      gsap.to(["#js-home-slides-pagination .left", "#js-home-slides-pagination .right", "#js-home-slides-pagination .total"], { y: "0%", duration: D(1), delay: D(0.65), ease: "quint.out", clearProps: "all" });
    }
    moveTo(k) {
      const n = k + 1, D = BB.D;
      gsap.killTweensOf(this.el);
      if (BB.vars.currentIndex === n) {
        BB.objs.bg.slowOut(n);
        gsap.to(this.el, { x: this.x, duration: D(0.35), ease: "quint.out", onComplete: () => { this.x = -this.secW * k; this.isAnimating = false; this.fadeOut(n, false); } });
        this.textOut("same", n);
      } else {
        gsap.to(this.el, { x: -this.secW * k, duration: D(0.75), ease: "quint.out", onComplete: () => { this.x = -this.secW * k; this.isAnimating = false; this.fadeOut(n, true); } });
        this.textOut("other", n);
      }
    }
    init() {
      this.measure();
      this.down = (e) => {
        if (e.button !== 0 || BB.flags.isArrowHovered || this.isAnimating || this.isLinkHover || BB.flags.isGlobalMenu || BB.objs.slider.isAnimating) return;
        this.dragging = true;
        this.lastX = e.clientX;
        this.x = -(BB.vars.currentIndex - 1) * this.secW;
        gsap.killTweensOf(this.el);
        gsap.set(this.el, { x: this.x });
        BB.objs.bg.slowIn(BB.vars.currentIndex);
        BB.objs.cursor.enableDragging();
        this.fadeIn();
      };
      this.move = (e) => {
        if (!BB.flags.isGrabbing || !this.dragging || this.isAnimating) return;
        this.x += 3 * (e.clientX - this.lastX);
        const min = -this.elW + 1.5 * innerWidth - (innerWidth - this.secW) / 2;
        this.x = Math.min(0, Math.max(min, this.x));
        gsap.to(this.el, { x: this.x, duration: 0.5 });
        this.lastX = e.clientX;
      };
      this.up = () => {
        if (!this.dragging || this.isAnimating) return;
        this.dragging = false;
        this.isAnimating = true;
        this.moveTo(Math.abs(Math.round(-this.x / this.secW)));
        BB.objs.cursor.disableDragging();
      };
      this.out = () => {
        if (!this.dragging) return;
        this.dragging = false;
        gsap.to(".home-dragger-sections", { autoAlpha: 0, duration: 0.5, ease: "none" });
        gsap.to(["#js-home-slides", "#js-home-slides-pagination", ".home-scroll-down"], { autoAlpha: 1, duration: 0.5 });
        BB.objs.cursor.disableDragging();
      };
      this.lin = () => { this.isLinkHover = true; };
      this.lout = () => { this.isLinkHover = false; };
      this.resize = () => this.measure();
      this.area.addEventListener("mousedown", this.down);
      this.area.addEventListener("mousemove", this.move);
      this.area.addEventListener("mouseup", this.up);
      this.links.forEach((l) => { l.addEventListener("mouseenter", this.lin); l.addEventListener("mouseleave", this.lout); });
      document.documentElement.addEventListener("mouseleave", this.out);
      addEventListener("resize", this.resize);
    }
    destroy() {
      this.area.removeEventListener("mousedown", this.down);
      this.area.removeEventListener("mousemove", this.move);
      this.area.removeEventListener("mouseup", this.up);
      this.links.forEach((l) => { l.removeEventListener("mouseenter", this.lin); l.removeEventListener("mouseleave", this.lout); });
      document.documentElement.removeEventListener("mouseleave", this.out);
      removeEventListener("resize", this.resize);
    }
  }

  BB.pages.home = {
    before() {
      const A = BB.anim;
      A.split(".home-section-ttl .js-chars", "chars");
      A.split(".home-section-description-txt", "words,chars");
      A.split(".home-section-ttl-inner .sub-ttl", "chars");
      BB.objs.slider = new HomeSlider();
      // Menu Movies (index.html#movies) opens at the fourth section — returning from a subpage, it goes to that section’s own index as in the original (About 1, Backstage 2, Credits 3)
      if (location.hash === "#movies") BB.vars.currentIndex = 4;
      BB.objs.slider.current = BB.vars.currentIndex || 1;
      BB.objs.slider.init();
      if (BB.isDesktop) { BB.objs.dragger = new HomeDragger(); BB.objs.dragger.init(); }
      const n = BB.vars.currentIndex || 1, slide = BB.objs.slider.slide(n);
      BB.objs.slider.setPagination(n);
      BB.objs.slider.setSlide("all", null, slide);
      BB.anim.setAttractors("enable", slide);
      gsap.set([".home-ttl", ".home-scroll-down", "#js-home-slides-pagination .num"], { autoAlpha: 0 });
      gsap.set("#js-home-slides-pagination .line", { scaleX: 0, transformOrigin: "50% 50%" });
      gsap.set(["#js-home-slides-pagination .left", "#js-home-slides-pagination .right"], { y: "100%" });
      gsap.set("#js-home-slides-pagination .total", { y: "-100%" });
      const wrap = $("#js-home-movie-wrap");
      const ml = $(".home-movies-link a");
      ml.addEventListener("mouseenter", () => wrap.classList.add("is-color"));
      ml.addEventListener("mouseleave", () => { if (!BB.flags.isTransition) wrap.classList.remove("is-color"); });
      ml.addEventListener("click", (e) => e.preventDefault());
    },
    init() {
      const D = BB.D, n = BB.vars.currentIndex || 1, S = BB.objs.slider, slide = S.slide(n), link = S.link(slide), A = BB.anim;
      gsap.set("#js-home-slides-pagination .num", { autoAlpha: 1 });
      gsap.set(slide, { alpha: 1 });
      gsap.set(link, { autoAlpha: 0 });
      A.homeTitleIn();
      A.maskTextIn($(".home-section-ttl-wrap", slide), 0);
      A.randomFadeIn(slide, ".home-section-description-txt .words", 0.5);
      gsap.fromTo("#js-home-slides-pagination .line", { scaleX: 0, alpha: 1, transformOrigin: "50% 50%" }, { scaleX: 1, duration: D(1), delay: D(0.5), ease: "quint.out" });
      gsap.to(["#js-home-slides-pagination .left", "#js-home-slides-pagination .right", "#js-home-slides-pagination .total"], { y: "0%", duration: D(1), delay: D(0.65), ease: "quint.out", clearProps: "all" });
      if (n !== 1) {
        gsap.fromTo($(".sub-ttl", slide), { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.5), ease: "sine.inOut", delay: D(0.1) });
        gsap.fromTo($(".home-section-ttl .line", slide), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: D(1), ease: "quint.out", delay: D(0.5), clearProps: "all" });
      }
      if (n !== 4) gsap.fromTo(".home-scroll-down", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(0.5), ease: "none" });
      else { S.video.play().catch(() => {}); }
      S.fadeBtn(link, 0.9);
      BB.objs.bg.hidePoints(false, n, 0.15);
      BB.objs.bg.fadeIn(false, n, 0.15);
    },
    out(old) {
      const D = BB.D, A = BB.anim, n = BB.vars.currentIndex || 1, slide = old.querySelector(`.home-slide-${n}`);
      A.maskTextOut($(".home-section-ttl-wrap", slide), 0);
      A.homeTitleOut(0);
      gsap.fromTo(".g-center-line", { transformOrigin: "100% 50%" }, { scaleX: 0, duration: D(1), ease: "quint.inOut" });
      gsap.to(["#js-home-slides-pagination .left", "#js-home-slides-pagination .right"], { y: "100%", duration: D(0.65), ease: "quint.out" });
      gsap.to("#js-home-slides-pagination .total", { y: "-100%", duration: D(0.65), ease: "quint.out" });
      gsap.to("#js-home-slides-pagination .line", { scaleX: 0, alpha: 0, duration: D(1), ease: "quint.out" });
      const subLine = $(".home-section-ttl._sub .line", slide), sub = $(".sub-ttl", slide);
      subLine && gsap.to(subLine, { scaleX: 0, transformOrigin: "100% 50%", duration: D(1), ease: "quint.inOut" });
      sub && gsap.to(sub, { autoAlpha: 0, duration: D(0.65), ease: "none" });
      if (n < 4) {
        A.randomFadeOut(slide, ".home-section-description-txt .words", 0);
        A.blurFadeOut([$(".home-section-link", slide), ".home-scroll-down"], true, 0);
        BB.objs.bg.fadeOut(false, n, 0);
      } else {
        A.blurFadeOut([$(".home-movies-link", slide)], false, 0);
        const mw = $("#js-home-movie-wrap"), w = mw.clientWidth, h = mw.clientHeight;
        gsap.fromTo(mw, { clip: `rect(0px, ${w}px, ${h}px, 0px)` }, { clip: `rect(${h / 2}px, ${w}px, ${h / 2}px, 0px)`, duration: D(1), ease: "quint.inOut" });
      }
    },
    destroy() {
      BB.objs.slider && BB.objs.slider.destroy();
      BB.objs.dragger && BB.objs.dragger.destroy();
      BB.objs.slider = BB.objs.dragger = null;
    },
  };
})();
