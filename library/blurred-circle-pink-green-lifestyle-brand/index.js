// First page motion. As in the original, attach ScrollTrigger to the positions of the empty cells (.pm-sp) and follow with scrub 1 —
// Start=A trigger that ends is an instant switch, but scrub 1 catches up over 1 second so the change is smooth.
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const CREAM = css("--kf-surface");
  const INK = css("--kf-accent");
  const st = (trigger, start, end, extra = {}) => ({ trigger, start, end, invalidateOnRefresh: true, scrub: 1, ...extra });

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    const { pc, reduce } = conditions;

    if (reduce) {
      document.body.classList.add("is-reduced");
      gsap.set(".pm-story__frame-img", { width: "101%", height: "100%" });
      gsap.set(".pm-story__img", { scale: 1 });
      gsap.set(".pm-story__item--1 .pm-story__jp, .pm-story__item--1 .pm-story__eng", { autoAlpha: 1 });
      qa(".pm-story__item--1 .pm-story__jp p").forEach((p) => p.classList.add("is-active"));
      gsap.set(".pm-story__bottom, .pm-story__bottom-sp, .pm-wave__logo .pm-mark", { "--m": "400%" });
      gsap.set(".pm-slide__frame", { width: pc ? "43%" : "79%", height: pc ? "43%" : "62%" });
      return;
    }

    pm.story(q(".pm-story"), pc);
    gsap.to(".pm-story__frame", { opacity: 0, duration: 3, scrollTrigger: st('[data-out="4"]', "top top", "bottom bottom") });

    // ── Overlapping ellipses: blurred circle 0 → 250% (400% on phone) ──
    gsap.to(pc ? ".pm-story__bottom" : ".pm-story__bottom-sp", { "--m": pc ? "250%" : "400%", duration: 1, scrollTrigger: st(".pm-sp--bottom", "top bottom", "bottom bottom") });

    // ── Wavy text band (scrub 5) and two-line wordmark ──
    gsap.to(pc ? ".pm-wave svg.u-pc textPath" : ".pm-wave svg.u-sp textPath", {
      attr: { startOffset: pc ? "-50%" : "-55%" },
      ease: "power1.out",
      scrollTrigger: { trigger: ".pm-wave", start: "top bottom", end: pc ? "bottom center" : "bottom top", scrub: 5 },
    });
    gsap.to(".pm-wave__logo .pm-mark", { "--m": pc ? "350%" : "400%", duration: 1, scrollTrigger: st(".pm-wave__logo .pm-mark", "top bottom", "top top") });
    gsap.to(".pm-wave__logo", { filter: "blur(4px)", duration: 3, scrollTrigger: st(".pm-slide", pc ? "top bottom" : "top center", "top top") });

    // ── Full photo → 43% box, inner 1 → 1.5, background pink → cream, then a vertical line wipe ──
    gsap.to(".pm-slide__frame", { width: pc ? "43%" : "79%", height: pc ? "43%" : "62%", duration: 1, scrollTrigger: st(".pm-slide__sp", "top bottom", "bottom bottom") });
    gsap.to(".pm-slide__img", { scale: 1.5, duration: 1, scrollTrigger: st(".pm-slide__sp", "top bottom", "bottom bottom") });
    gsap.to(document.body, { backgroundColor: CREAM, duration: 3, scrollTrigger: st(".pm-slide__sp", "top bottom", "bottom bottom") });
    gsap.to(".pm-slide__caption", { color: INK, duration: 2, scrollTrigger: st(".pm-slide__sp", "top 90%", "top 90%") });
    gsap.to(".pm-slide__line", {
      left: "100%",
      duration: 1,
      scrollTrigger: { trigger: ".pm-slide__sp-line", start: "top center", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, toggleClass: { targets: ".pm-slide__line", className: "is-active" } },
    });
    gsap.to(".pm-slide__vis", { clipPath: "inset(0% 0% 0% 100%)", duration: 1, scrollTrigger: { trigger: ".pm-slide__sp-line", start: "top center", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });

    // ── Journal strip rises slightly earlier ──
    gsap.to(".pm-topics", { y: pc ? "-10vh" : "-5vh", duration: 1, scrollTrigger: st(".pm-topics", "top bottom", "top top") });

    return () => { gsap.set(document.body, { clearProps: "backgroundColor" }); };
  });

  // ── Center gallery (original Swiper 8.4.7): the same sheets joined 20 times, starting in the middle, and when entering the last two sets it quietly returns to the center.
  //    Only the center slide is full and two on each side get placeholder classes (is-prev · is-next · …-2). 1.2 seconds, every 8 seconds, only when 40% of the panel is visible ──
  const wrap = q(".pm-gallery__track");
  const N = wrap.children.length;
  const REPEAT = 20;
  wrap.innerHTML = wrap.innerHTML.repeat(REPEAT);
  const CENTER = Math.floor((N * REPEAT) / 2);
  const mark = (sw) => sw.slides.forEach((el, i) => {
    const d = i - sw.activeIndex;
    el.classList.toggle("is-active", d === 0);
    el.classList.toggle("is-prev", d === -1);
    el.classList.toggle("is-next", d === 1);
    el.classList.toggle("is-prev-2", d === -2);
    el.classList.toggle("is-next-2", d === 2);
  });
  const reset = (sw) => {
    const buffer = N * 2;
    if (sw.activeIndex >= sw.slides.length - buffer || sw.activeIndex <= buffer) { sw.slideTo(CENTER, 0, false); mark(sw); }
  };
  const gallery = new Swiper(q(".pm-gallery__inner"), {
    slidesPerView: "auto", centeredSlides: true, loop: false, initialSlide: CENTER, speed: 1200, grabCursor: true, watchSlidesProgress: true,
    autoplay: { delay: 8000, disableOnInteraction: false },
    navigation: { prevEl: q(".pm-gallery [data-prev]"), nextEl: q(".pm-gallery [data-next]") },
    breakpoints: { 0: { spaceBetween: 12 }, 768: { spaceBetween: 24 } },
    on: {
      init(sw) { mark(sw); sw.autoplay.stop(); },
      slideChange: mark,
      slideChangeTransitionEnd(sw) { mark(sw); reset(sw); },
      resize(sw) { sw.update(); mark(sw); },
    },
  });
  if (!pm.reduce) new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? gallery.autoplay.start() : gallery.autoplay.stop())), { threshold: 0.4 }).observe(q(".pm-gallery"));

  // ── Journal (original insta-swiper): 2.9 slides at a time (2.15 below 1024), endless, Swiper default 0.3s ──
  pm.slider(q(".pm-topics__viewport"), { slidesPerView: 3, loop: true, breakpoints: { 1024: { slidesPerView: 2.9 }, 0: { slidesPerView: 2.15 } } });
})();
