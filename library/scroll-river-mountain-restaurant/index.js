// Home: hero · menu band · facility photos use the same Swiper 11.1.14 as the original (same options), the concept map uses lottie-web 5.12.2,
// Double parallax, fixed background, widening photo and footer zoom use GSAP, arrow cursor over the slider.
(() => {
  const still = document.documentElement.classList.contains("sn-still");
  const touch = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const $ = (s) => document.querySelector(s);
  const river = $(".sn-river");

  // ---------- Swiper — original options as they are ----------
  const top = new Swiper(".swiper-top", { loop: true, speed: 3000, allowTouchMove: true, autoplay: false, effect: "fade", fadeEffect: { crossFade: true } });
  const menu = new Swiper(".swiper-menu", { loop: true, slidesPerView: "auto", speed: 1000, autoplay: { delay: 4000, disableOnInteraction: false }, freeMode: false });
  const facOpts = (n, allowTouchMove) => ({
    loop: true, slidesPerView: "auto", centeredSlides: true, effect: "fade", speed: 2000, allowTouchMove, preventInteractionOnTransition: false,
    autoplay: { delay: 4000, disableOnInteraction: false }, fadeEffect: { crossFade: true },
    navigation: { nextEl: `.swiper-facilities${n} .swiper-button-next`, prevEl: `.swiper-facilities${n} .swiper-button-prev` },
  });
  const fac1 = new Swiper(".swiper-facilities1", facOpts(1, true));
  const fac2 = new Swiper(".swiper-facilities2", facOpts(2, false));

  // Auto-advance stays paused, then from 1s after load runs only while in view (Hero when over half visible — the photo zoom also pauses and runs together)
  const zoomImgs = [...document.querySelectorAll(".sn-top__slide .wf-img")];
  const zoom = (run) => zoomImgs.forEach((el) => (el.style.animationPlayState = run ? "running" : "paused"));
  const autos = [
    { swiper: top, el: $(".sn-top"), hero: true },
    { swiper: menu, el: $(".swiper-menu") },
    { swiper: fac1, el: $(".swiper-facilities1") },
    { swiper: fac2, el: $(".swiper-facilities2") },
  ];
  autos.forEach((a) => a.swiper.autoplay.stop());
  zoom(false);
  if (!still) {
    document.addEventListener("sn:loaded", () => setTimeout(() => {
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        const a = autos.find((x) => x.el === en.target);
        const on = en.isIntersecting && (!a.hero || en.intersectionRatio > 0.5);
        on ? a.swiper.autoplay.start() : a.swiper.autoplay.stop();
        if (a.hero) zoom(on);
      }), { rootMargin: "50px", threshold: [0, 1] });
      autos.forEach((a) => io.observe(a.el));
    }, 1000));
    gsap.to(".sn-top__slides .swiper-wrapper", { scale: 1.3, ease: "none", scrollTrigger: { trigger: ".sn-top", start: "10% top", end: "bottom top", scrub: 0 } });
  }

  // ---------- Video — autoplay, loop, muted like the original (with reduced motion it stops on the first scene) ----------
  document.querySelectorAll("video").forEach((v) => {
    if (still) { v.removeAttribute("autoplay"); v.pause(); } else v.play().catch(() => {});
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Double parallax. The frame moves ±(15+5n)px, the inner photo ±(10+5n)px. An overlapping photo (Over) moves the frame ±(30+10n)px. The inner photo is enlarged by the sum of both distances (original formula).
    const pair = (sel, frame, inner) => document.querySelectorAll(sel).forEach((el, i) => {
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 };
      gsap.fromTo(el, { y: -frame(i) }, { y: frame(i), ease: "none", scrollTrigger: st });
      const img = el.querySelector(".wf-img");
      if (!img) return;
      img.style.height = `calc(100% + ${2 * frame(i) + 2 * inner(i)}px)`;
      gsap.fromTo(img, { y: -inner(i) }, { y: inner(i), ease: "none", scrollTrigger: { ...st } });
    });
    pair(".js-parallax", (i) => 15 + 5 * i, (i) => 10 + 5 * i);
    pair(".js-parallaxOver", (i) => 30 + 10 * i, (i) => 10 + 5 * i);

    gsap.to(".sn-concept__back .wf-img", { y: 150, ease: "none", scrollTrigger: { trigger: ".sn-concept", start: "top bottom", end: "bottom top", scrub: 1.5 } });
    gsap.fromTo(".sn-footer__back .wf-img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".sn-footer", start: "top bottom", end: "center center", scrub: 0 } });

    // Widening photo — below 1000px the original increases the side margins and photo height together
    const sec = $(".sn-img");
    const inner = sec.querySelector(".sn-img__inner");
    const box = sec.querySelector(".sn-img__img");
    const narrow = innerWidth <= 1000;
    if (narrow) {
      gsap.set(inner, { padding: "0 5.3vw", display: "flex", alignItems: "center" });
      gsap.set(box, { height: "89.4vw" });
      gsap.to(inner, { padding: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "60% bottom", scrub: true } });
      gsap.to(box, { height: "100lvh", ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "60% bottom", scrub: 0.3 } });
    } else {
      gsap.to(inner, { padding: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "60% bottom", scrub: 0.3 } });
    }
    gsap.to(box.querySelector(".wf-img"), { scale: narrow ? 1.8 : 1.5, ease: "power1.in", scrollTrigger: { trigger: sec, start: "45% bottom", end: "bottom top", scrub: 0.3 } });
  });

  // ---------- Concept — when the section is visible the fixed background appears, and when the map image is visible the river line hides briefly ----------
  const back = $(".sn-concept__back");
  new IntersectionObserver(([en]) => back.classList.toggle("is-active", en.isIntersecting), { threshold: 0.1 }).observe($(".sn-concept"));
  const fig = $(".sn-figure");
  new IntersectionObserver(([en]) => river.classList.toggle("is-hidden", en.isIntersecting), { threshold: 0.1 }).observe(fig);

  // ---------- Map illustration Lottie — when visible (10%) it plays once from the start, and when out of view it pauses and resets to the start. Reloads the phone version when crossing 1000px ----------
  const figBox = fig.querySelector(".sn-figure__lottie");
  let figAnim = null, figIo = null;
  const mountFigure = () => {
    figAnim?.destroy();
    figIo?.disconnect();
    const sp = innerWidth <= 1000;
    figAnim = lottie.loadAnimation({ container: figBox, renderer: "svg", loop: false, autoplay: false, animationData: structuredClone(sp ? window.snFigure.sp : window.snFigure.pc) });
    figAnim.snSp = sp;
    if (still) { fig.classList.add("is-anim"); figAnim.goToAndStop(figAnim.totalFrames - 1, true); return; }
    figIo = new IntersectionObserver(([en]) => {
      fig.classList.toggle("is-anim", en.isIntersecting);
      en.isIntersecting ? figAnim.play() : figAnim.stop();
    }, { threshold: 0.1 });
    figIo.observe(fig);
  };
  mountFigure();
  let figTimer;
  addEventListener("resize", () => {
    clearTimeout(figTimer);
    figTimer = setTimeout(() => { if ((innerWidth <= 1000) !== figAnim.snSp) mountFigure(); }, 250);
  });

  // ---------- Arrow cursor — only above 1000px and when not touch. Over the menu strip it points right, over facility photos it switches direction by the left/right half, and on press it goes that way ----------
  const cursor = $(".sn-cursor");
  const menuEl = $(".swiper-menu");
  const facWraps = [[fac1, ".swiper-facilities1 .swiper-wrapper"], [fac2, ".swiper-facilities2 .swiper-wrapper"]].map(([sw, sel]) => [sw, $(sel)]);
  const move = (e) => { cursor.style.left = `${e.clientX - 30}px`; cursor.style.top = `${e.clientY - 12}px`; };
  const show = (left) => { cursor.style.opacity = "1"; cursor.classList.toggle("is-left", left); };
  const hide = () => (cursor.style.opacity = "0");
  const isLeft = (el, e) => { const r = el.getBoundingClientRect(); return e.clientX - r.left < r.width / 2; };
  let wired = false;
  const wire = () => {
    const out = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting || hide()));
    [menuEl, ...facWraps.map(([, el]) => el)].forEach((el) => out.observe(el));
    menuEl.addEventListener("mouseenter", () => show(false));
    menuEl.addEventListener("mouseleave", hide);
    menuEl.addEventListener("click", () => menu.slideNext());
    facWraps.forEach(([sw, el]) => {
      el.addEventListener("mousemove", (e) => show(isLeft(el, e)));
      el.addEventListener("mouseleave", hide);
      el.addEventListener("click", (e) => (isLeft(el, e) ? sw.slidePrev() : sw.slideNext()));
    });
  };
  const setupCursor = () => {
    if (innerWidth > 1000 && !touch()) {
      document.addEventListener("mousemove", move);
      if (!wired) { wire(); wired = true; }
      cursor.style.display = "block";
    } else {
      document.removeEventListener("mousemove", move);
      cursor.style.display = "none";
    }
  };
  setupCursor();
  addEventListener("resize", setupCursor);
})();
