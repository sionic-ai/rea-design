/* Workspace scene — original values:
   On the desktop photo panel, dragging pulls the next (drag left) or previous section over with a diagonal clip-path following the hand while the inner photo shifts 60px, and on release it finishes the transition in .75s sine.inOut (if moved under 10px, it goes by the half that was pressed).
   PREV·NEXT tags follow the cursor height inside the plate with lerp .2. Below 1024px it becomes Swiper (free drag, 4px gap, dot pagination).
   In the left contents list, when a space row passes the center of the screen that item gets is-active (the small photo expands to 3em), and passed items get is-over and are pushed up. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  class Slider {
    constructor(el) {
      this.el = el;
      this.main = $$(".c-slider__item--main .c-slider__slide", el);
      this.next = $$(".c-slider__item--next .c-slider__slide", el);
      this.max = this.main.length - 1;
      this.current = 0; this.nextI = 1; this.prev = this.max;
      this.progressX = 0; this.animating = false; this.dragging = false; this.startX = 0;
      this.tips = $$(".c-slider__tip", el);
      this.tipY = 0;
      this.main[0].classList.add("is-current"); this.next[0].classList.add("is-current");
      this.main[0].style.zIndex = 2; this.next[0].style.zIndex = 2;
      this.updateText(); this.reset();
      this.on = {
        enter: () => el.classList.add("is-active"),
        leave: (e) => { if (this.dragging) { el.classList.remove("is-active"); this.end(e); } },
        start: (e) => this.start(e), move: (e) => this.move(e), end: (e) => this.end(e),
      };
      el.addEventListener("mouseenter", this.on.enter, { passive: true });
      el.addEventListener("mouseleave", this.on.leave, { passive: true });
      el.addEventListener("mousedown", this.on.start, { passive: true });
      el.addEventListener("mousemove", this.on.move, { passive: true });
      el.addEventListener("mouseup", this.on.end, { passive: true });
      el.addEventListener("touchstart", this.on.start, { passive: true });
      el.addEventListener("touchmove", this.on.move, { passive: true });
      el.addEventListener("touchend", this.on.end, { passive: true });
    }
    pair(i) { return [this.main[i], this.next[i]]; }
    child(i) { return this.pair(i).map((s) => $(".c-slider__child", s)); }
    reset() {
      this.progressX = 0; this.animating = false; this.dragging = false;
      this.pair(this.current).forEach((s) => { s.classList.add("is-current"); s.style.zIndex = 1; });
      this.pair(this.prev).forEach((s) => (s.style.zIndex = 2));
      this.pair(this.nextI).forEach((s) => (s.style.zIndex = 2));
      gsap.set(this.pair(this.prev), { clipPath: "polygon(0% 0%, -20% 0%, 0% 100%, 0% 100%)" });
      gsap.set(this.pair(this.nextI), { clipPath: "polygon(120% 0%, 100% 0%, 100% 100%, 100% 100%)" });
    }
    updateText(i = this.current) {
      const n = this.max + 1;
      const nx = $(".c-slider__control--next .c-slider__pager", this.el), pv = $(".c-slider__control--prev .c-slider__pager", this.el);
      if (nx) nx.textContent = `${i + 1 <= this.max ? i + 2 : 1} - ${n}`;
      if (pv) pv.textContent = `${i - 1 >= 0 ? i : n} - ${n}`;
    }
    finish(dir) {
      this.pair(this.current).forEach((s) => { s.style.zIndex = 0; s.classList.remove("is-current"); });
      const step = (v) => (dir > 0 ? (v + 1 <= this.max ? v + 1 : 0) : (v - 1 >= 0 ? v - 1 : this.max));
      this.current = step(this.current); this.nextI = step(this.nextI); this.prev = step(this.prev);
      this.reset();
    }
    goNext() {
      if (this.animating) return;
      this.animating = true; this.updateText(this.nextI);
      gsap.set(this.child(this.nextI), { x: 60 + 60 * this.progressX });
      gsap.to(this.child(this.current), { duration: 0.75, ease: "sine.inOut", x: -60 });
      gsap.to(this.child(this.nextI), { duration: 0.75, ease: "sine.inOut", x: 0 });
      gsap.to(this.pair(this.nextI), { duration: 0.75, ease: "sine.inOut", clipPath: "polygon(-10% 0%, 100% 0%, 100% 100%, 0% 100%)", onComplete: () => this.finish(1) });
    }
    goPrev() {
      if (this.animating) return;
      this.animating = true; this.updateText(this.prev);
      gsap.set(this.child(this.prev), { x: 60 * this.progressX - 60 });
      gsap.to(this.child(this.current), { duration: 0.75, ease: "sine.inOut", x: 60 });
      gsap.to(this.child(this.prev), { duration: 0.75, ease: "sine.inOut", x: 0 });
      gsap.to(this.pair(this.prev), { duration: 0.75, ease: "sine.inOut", clipPath: "polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)", onComplete: () => this.finish(-1) });
    }
    x(e) { return e.clientX ?? (e.touches?.[0] || e.changedTouches?.[0])?.clientX ?? 0; }
    start(e) { if (this.dragging) return; this.dragging = true; html.classList.add("is-dragging"); this.startX = this.x(e); }
    move(e) {
      if (!this.dragging || this.animating) return;
      AD.lenis.stop();
      this.progressX = (this.x(e) - this.startX) / innerWidth;
      const p = this.progressX;
      if (p > 0) gsap.set(this.pair(this.prev), { clipPath: `polygon(0% 0%, ${120 * p - 20}% 0%, ${100 * p}% 100%, 0% 100%)` });
      else gsap.set(this.pair(this.nextI), { clipPath: `polygon(${120 + 120 * p}% 0%, 100% 0%, 100% 100%, ${100 + 100 * p}% 100%)` });
      gsap.set(this.child(this.prev), { x: 60 * p - 60 });
      gsap.set(this.child(this.nextI), { x: 60 + 60 * p });
    }
    end(e) {
      if (!this.dragging) return;
      this.dragging = false;
      const x = this.x(e), dx = x - this.startX;
      if (dx < -10) this.goNext(); else if (dx > 10) this.goPrev(); else if (x > innerWidth / 2) this.goNext(); else this.goPrev();
      AD.lenis.start();
      html.classList.remove("is-dragging");
    }
    render() {
      if (!this.el.classList.contains("is-active")) return;
      const top = this.el.getBoundingClientRect().top;
      this.tipY = lerp(this.tipY, mouse.y - top, 0.2);
      gsap.set(this.tips, { y: this.tipY });
    }
    destroy() {
      const el = this.el;
      el.removeEventListener("mouseenter", this.on.enter); el.removeEventListener("mouseleave", this.on.leave);
      el.removeEventListener("mousedown", this.on.start); el.removeEventListener("mousemove", this.on.move); el.removeEventListener("mouseup", this.on.end);
      el.removeEventListener("touchstart", this.on.start); el.removeEventListener("touchmove", this.on.move); el.removeEventListener("touchend", this.on.end);
    }
  }

  let sliders = [], carousels = [], tick = null;
  AD.view("works", {
    init(root) {
      sliders = $$(".c-slider", root).map((el) => new Slider(el));
      tick = () => sliders.forEach((s) => s.render());
      if (matchMedia("(any-hover: hover)").matches) gsap.ticker.add(tick);
      if (window.Swiper) carousels = $$(".c-carousel", root).map((el) => new Swiper(el, {
        loop: false, freeMode: true, spaceBetween: 4, slidesPerView: "auto",
        pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
        breakpoints: { 1024: { freeMode: false } },
      }));
    },
    triggers(root) {
      if (!AD.isPc()) return;
      const navi = $$(".l-list-view__navi-item", root);
      $$(".l-list-view__item", root).forEach((item, i) => {
        const activate = () => { $(".l-list-view__navi-item.is-active", root)?.classList.remove("is-active"); navi[i]?.classList.add("is-active"); };
        AD.triggers.push(ScrollTrigger.create({
          trigger: item, start: "top center", end: "bottom center",
          onEnter: () => { activate(); navi[i]?.classList.add("is-over"); },
          onEnterBack: activate,
          onLeaveBack: () => navi[i]?.classList.remove("is-over"),
        }));
      });
    },
    destroy() {
      tick && gsap.ticker.remove(tick);
      sliders.forEach((s) => s.destroy()); sliders = [];
      carousels.forEach((c) => c.destroy(true, true)); carousels = [];
    },
  });
})();
