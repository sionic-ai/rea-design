// First page: opening (once on first visit — Lottie 5s, video slot after 2s, fades out over .5s at the end) → hero intro (photo 1.1→1 · text · header 1s power2.inOut) →
// Four-photo crossfade (Swiper fade loop 1s, advancing every 6s after the opening) · staff cards (size .68→1 toward the center, Swiper loop 3s autoplay) · business circle graphic
(() => {
  const { load, anims, reduce } = window.mgShared;
  const loaderEl = document.querySelector(".mg-loader"), mvEl = document.querySelector(".mv");
  const done = () => dispatchEvent(new Event("mgLoaderComplete"));
  let loaderDone = false;
  const onLoaderDone = (fn) => (loaderDone ? fn() : addEventListener("mgLoaderComplete", fn, { once: true }));
  addEventListener("mgLoaderComplete", () => (loaderDone = true), { once: true });

  // Opening
  if (loaderEl) {
    if (sessionStorage.getItem("mg-loading") || reduce) {
      loaderEl.classList.add("is-already", "is-hidden");
      setTimeout(done, 0);
    } else {
      sessionStorage.setItem("mg-loading", "1");
      mvEl?.classList.add("is-before-enter");
      const a = load(loaderEl.querySelector(".mg-loader__lottie"), { rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      let completed = false;
      const complete = () => {
        if (completed) return;
        completed = true;
        mvEl?.classList.remove("is-before-enter");
        loaderEl.classList.add("is-fadeout");
        setTimeout(() => { loaderEl.classList.add("is-hidden"); done(); }, 500);
      };
      a?.play();
      setTimeout(() => { loaderEl.querySelector(".mg-loader__video").style.display = "block"; }, 2000);
      a?.addEventListener("complete", complete);
      setTimeout(complete, 5600);
    }
  }

  // Four hero photos — on switching, the leaving slide scales to 1.1 and the new slide goes from 1.1 to 1 (css 1000ms), and each slide’s line Lottie plays from the start
  const mvSwiper = document.querySelector(".mv__wrapper");
  if (mvSwiper && window.Swiper) {
    mvSwiper.style.setProperty("--mv-zoom-duration", "1000ms");
    const playLines = (sw) => {
      sw.el.querySelectorAll(".mv__line").forEach((l) => anims.get(l)?.stop());
      setTimeout(() => sw.slides[sw.activeIndex]?.querySelectorAll(".mv__line").forEach((l) => anims.get(l)?.goToAndPlay(0, true)), 0);
    };
    let leaveTimer = 0, last = -1;
    const markLeave = (sw) => { clearTimeout(leaveTimer); leaveTimer = setTimeout(() => sw.slides.forEach((s) => +s.dataset.swiperSlideIndex === sw.realIndex && s.classList.add("is-leaving")), 4500); };
    const sw = new Swiper(mvSwiper, {
      loop: true, effect: "fade", fadeEffect: { crossFade: true }, speed: 1000, allowTouchMove: false, threshold: 10,
      autoplay: false,
      on: {
        afterInit(s) { s.el.querySelectorAll(".mv__line").forEach((l) => anims.has(l) || load(l)); dispatchEvent(new CustomEvent("mgMvReady")); },
        slideChange(s) {
          if (last === s.realIndex) return;
          last = s.realIndex; clearTimeout(leaveTimer);
          const prev = s.slides[s.previousIndex], now = s.slides[s.activeIndex];
          if (prev && prev !== now) prev.classList.add("is-leaving");
          if (now) { now.classList.remove("is-leaving"); const img = now.querySelector(".mv__img"); if (img) { img.style.transition = "none"; img.style.transform = "scale(1.1)"; img.offsetWidth; requestAnimationFrame(() => { img.style.transition = ""; img.style.transform = ""; }); } }
          playLines(s);
        },
        slideChangeTransitionEnd(s) { s.slides.forEach((sl) => { const img = sl.querySelector(".mv__img"); if (!img) return; img.style.transition = "none"; sl.classList.remove("is-leaving"); img.style.transform = ""; img.offsetWidth; requestAnimationFrame(() => (img.style.transition = "")); }); markLeave(s); },
      },
    });
    // Hero intro after the opening — photo 1.1 and transparent → 1, text .2s later, header and MENU button 1s later from 40px above
    onLoaderDone(() => {
      if (reduce) return;
      const active = sw.slides[sw.activeIndex]?.querySelector(".mv__img");
      const tl = gsap.timeline();
      if (active) tl.fromTo(active, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power2.inOut", onStart() { gsap.set(this.targets(), { transition: "none" }); }, clearProps: "transform,opacity,transition" }, 0);
      tl.fromTo(".mv__inner", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.inOut" }, 0.2);
      tl.fromTo(".mg-header, .mg-menuBtn", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.inOut", clearProps: "transform,opacity" }, 1);
      tl.add(() => playLines(sw), 0);
      markLeave(sw);
      // Advances exactly every 6s (original: times of 6000·n − 1000ms, starting 1s after the opening)
      setTimeout(() => { const t0 = performance.now(); let n = 1; const tick = () => setTimeout(() => { sw.slideNext(); n++; tick(); }, Math.max(0, t0 + 6000 * n - 1000 - performance.now())); tick(); }, 1000);
    });
  }

  // Staff card — the timeline progress is set by where the card’s center dot sits on the screen in % (wide screens .68× · photo pushed 100%, narrow .5×)
  const cs = document.querySelector(".cs__slider");
  if (cs && window.Swiper) {
    const mq = matchMedia("(max-width: 950px)");
    let swiper = null, tick = null;
    const build = (narrow) => {
      const kill = () => cs.querySelectorAll(".swiper-slide").forEach((s) => { s._tl?.kill(); s._tl = null; });
      const make = (s) => { kill(); const sc = narrow ? 0.5 : 0.68, x = narrow ? 0 : 100; s.slides.forEach((sl) => { const m = sl.querySelector(".cs__motion"), im = sl.querySelector(".cs__image"); if (!m || !im) return; sl._tl = gsap.timeline({ paused: true }).fromTo(m, { scale: sc, yPercent: 0 }, { duration: 1, scale: 1, xPercent: 0, yPercent: 0, ease: "sine.out" }).fromTo(im, { xPercent: x, opacity: 1, rotation: 0 }, { duration: 1, opacity: 1, xPercent: 0, rotation: 0, ease: "linear" }, "<").to(m, { duration: 1, scale: sc, xPercent: 0, yPercent: 0, ease: "power1.in" }).to(im, { duration: 1, opacity: 1, xPercent: 0, rotation: 0, ease: "power1.out" }, "<"); }); };
      const follow = () => swiper?.slides.forEach((sl) => { const c = sl.querySelector(".cs__core"); if (!c || !sl._tl) return; const p = Math.min(1, Math.max(0, c.getBoundingClientRect().left / document.documentElement.clientWidth)); sl._tl.progress(p); sl.classList.toggle("is-center", p > 0.4 && p < 0.65); });
      const ensure = (s) => { if (s.slides.some((sl) => !sl._tl && sl.querySelector(".cs__motion"))) make(s); follow(); };
      let voiceTimer = 0;
      swiper = new Swiper(cs, {
        slidesPerView: narrow ? 1 : "auto", centeredSlides: true, watchSlidesProgress: true, touchEventsTarget: "container", spaceBetween: narrow ? 0 : "-4%",
        ...(narrow ? {} : { breakpoints: { 1200: { slidesPerView: "auto", spaceBetween: "-5.5%" }, 1600: { slidesPerView: "auto", spaceBetween: "-7%" } } }),
        speed: 1000, touchRatio: 0.8, loop: true, loopedSlides: 5, loopAdditionalSlides: 2,
        autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false },
        navigation: { nextEl: cs.querySelector(".cs__next"), prevEl: cs.querySelector(".cs__prev") },
        pagination: { el: cs.querySelector(".cs__pagination"), clickable: false }, threshold: 10, keyboard: { enabled: true, onlyInViewport: true },
        on: {
          init(s) { make(s); tick = () => follow(); gsap.ticker.add(tick); s.slides.forEach((sl) => sl.addEventListener("click", (e) => { if (e.target.closest("a, button")) return; if (sl.classList.contains("swiper-slide-prev")) s.slidePrev(); if (sl.classList.contains("swiper-slide-next")) s.slideNext(); })); },
          afterInit(s) { s.el.querySelectorAll(".cs__lottie").forEach((l) => anims.has(l) || load(l)); },
          slideChange() { const ls = cs.querySelectorAll(".cs__lottie"); ls.forEach((l) => anims.get(l)?.stop()); clearTimeout(voiceTimer); voiceTimer = setTimeout(() => ls.forEach((l) => anims.get(l)?.goToAndPlay(0, true)), 1000); },
          slideChangeTransitionEnd: ensure, breakpoint: ensure,
          beforeDestroy() { gsap.ticker.remove(tick); kill(); },
        },
      });
      // Auto-advance only while the section is on screen
      new IntersectionObserver((es) => es.forEach((e) => { if (!swiper?.autoplay || reduce) return; e.isIntersecting ? swiper.autoplay.start() : swiper.autoplay.stop(); }), { threshold: 0 }).observe(cs.closest(".mg-section") || cs);
    };
    const rebuild = () => { swiper?.destroy(true, true); swiper = null; build(mq.matches); };
    build(mq.matches);
    mq.addEventListener("change", rebuild);
  }

  // Business circles — background circle (css variable) · logo 1.2s, three businesses from .65s in .25s steps (once when the top edge touches the bottom of the screen)
  const wd = document.querySelector(".wd");
  if (wd && !reduce) {
    // Centering is left to a negative margin in css and GSAP moves from xPercent 0 (the original -50% handled centering based on left)
    const tl = gsap.timeline({ scrollTrigger: { trigger: wd, start: "top bottom", once: true } });
    tl.fromTo(wd, { "--wd-scale": 0, "--wd-opacity": 0 }, { "--wd-scale": 1, "--wd-opacity": 1, duration: 1.2, ease: "power2.out" }, 0)
      .fromTo(wd.querySelector(".wd__logo"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out", transformOrigin: "50% 50%" }, 0)
      .fromTo(wd.querySelectorAll(".wd__item"), { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power2.out", stagger: 0.25 }, 0.65);
  }
})();
