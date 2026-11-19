// Home page motion — original Loading.js (first screen sequence) · IndexKv.js (parallax) · IndexIntroSlider.js (keen-slider free-snap + scroll bar) ·
// IndexCourseTween.js (title height → --heading-height) · IndexCreatureBookSlider.js (Swiper creative 1s · 4s autoplay · click for next)
(() => {
  const { reduce } = window.KS;
  const kv = document.getElementById("ks-kv");
  const page = document.getElementById("page");
  const header = document.querySelector(".ks-head");
  const objs = kv.querySelector(".ks-kv__objs");
  const circle = kv.querySelector(".ks-kv__circle");
  const main = kv.querySelector(".ks-kv__person");
  const copy = kv.querySelector(".ks-kv__copy");
  const bubbles = kv.querySelector(".ks-kv__bubbles");
  const first = gsap.utils.toArray(".load-first .obj__in");
  const last = gsap.utils.toArray(".load-last .obj__in");

  // ── Hero sequence (every time it opens — original is-opening version) ──
  if (reduce) {
    gsap.set(page, { opacity: 1 });
    document.body.classList.add("is-loading-end");
  } else {
    gsap.set([first, last], { x: 100, opacity: 0 });
    gsap.set([objs, bubbles], { filter: "blur(20px)" });
    gsap.set(circle, { scale: 0, opacity: 0 });
    gsap.set(main, { y: 50, scale: 0.8, opacity: 0 });
    gsap.set(copy, { y: 20, opacity: 0 });
    gsap.set(header, { y: -50, opacity: 0 });
    gsap.to(page, { opacity: 1, duration: 0.5 });
    const run = () =>
      gsap.timeline()
        .to(first, { x: 0, opacity: 1, duration: 4, ease: "back.out(2)" }, 0)
        .to(last, { x: 0, opacity: 1, duration: 4, ease: "back.out(2)" }, "<2")
        .to([objs, bubbles], { filter: "blur(0px)", duration: 2 }, "<")
        .to(circle, { scale: 1, opacity: 1, duration: 1.5, ease: "back.inOut(2)" }, "<1")
        .to(main, { y: 0, scale: 1, opacity: 1, duration: 0.5 }, "<0.5")
        .to(copy, { y: 0, opacity: 1, duration: 1, clearProps: "transform,opacity" }, "<0.5")
        .to(header, { y: 0, opacity: 1, duration: 1 }, "<")
        .call(() => document.body.classList.add("is-loading-end"), null, "<");
    if (document.readyState === "complete") run();
    else addEventListener("load", run, { once: true });
  }

  // ── Parallax: person y 80 (20% top → bottom top, scrub 1), copy disappears then (2s transition), fish panel y -40 ──
  const parallax = () => {
    if (reduce) return;
    gsap.to(kv.querySelector(".ks-kv__main"), {
      y: 80,
      scrollTrigger: {
        trigger: kv, start: "20% top", end: "bottom top", scrub: 1,
        onEnter: () => { copy.style.opacity = 0; copy.style.transform = "translate3d(0, 20px, 0)"; },
        onLeaveBack: () => { copy.style.opacity = 1; copy.style.transform = "translate3d(0, 0, 0)"; },
      },
    });
    gsap.to(objs, { y: -40, scrollTrigger: { trigger: kv, start: "top top", end: "bottom top", scrub: 1 } });
  };
  if (document.readyState === "complete") parallax();
  else addEventListener("load", parallax, { once: true });

  // ── Feature cards: keen-slider free-snap, scrollbar width = 1/page count, slot = Progress ──
  const cardsEl = document.getElementById("ks-cards");
  if (window.KeenSlider && cardsEl) {
    cardsEl.classList.add("keen-slider");
    const slides = [...cardsEl.children];
    slides.forEach((s) => s.classList.add("keen-slider__slide"));
    const drag = document.createElement("span");
    drag.className = "ks-scrollbar__drag";
    new KeenSlider(cardsEl, {
      slides: { perView: "auto" },
      mode: "free-snap",
      created: (s) => {
        drag.style.width = `${(1 / slides.length) * 100}%`;
        s.container.parentElement.querySelector(".ks-scrollbar")?.append(drag);
      },
      detailsChanged: (s) => {
        const p = Math.min(1, Math.max(0, s.track.details.progress));
        drag.style.left = `${p * 100}%`;
        drag.style.transform = `translateX(${-p * 100}%)`;
      },
    });
  }

  // ── Course: title height becomes where the panel sticks ──
  const course = document.getElementById("ks-course");
  const title = course.querySelector(".ks-course__hgroup");
  let t = 0;
  new ResizeObserver((es) => { clearTimeout(t); t = setTimeout(() => { for (const e of es) course.style.setProperty("--heading-height", `${e.borderBoxSize[0].blockSize}px`); ScrollTrigger.refresh(); }, 100); }).observe(title);

  // ── creature field guide: sections doubled for Swiper creative, autoplay 4s only while visible, click goes next. On advance the previous section’s card rose up (x 50) then settled back ──
  const book = () => {
    const el = document.querySelector(".ks-book__swiper");
    if (!window.Swiper || !el) return;
    el.querySelectorAll(".swiper-slide").forEach((s) => el.querySelector(".swiper-wrapper").append(s.cloneNode(true)));
    const prevAnim = () => {
      const prev = el.querySelector(".swiper-slide-prev");
      if (!prev) return;
      const card = prev.querySelector(".card");
      gsap.timeline().set(prev, { zIndex: 30 }, "hide").to(card, { x: 50 }, "hide").to(prev, { zIndex: 0 }, "<").to(card, { x: 0 }, "show");
    };
    const sw = new Swiper(el, {
      slidesPerView: 1, loop: true, effect: "creative", speed: 1000, allowTouchMove: false, loopAdditionalSlides: 1,
      autoplay: { delay: 4000, waitForTransition: false, disableOnInteraction: false },
      creativeEffect: { next: { translate: ["-7.3%", "4.2%", 0], rotate: [0, 0, -12], opacity: 1 }, prev: { translate: ["19%", "14.5%", 0], rotate: [0, 0, 11], opacity: 1 } },
      on: { slideChangeTransitionStart: prevAnim, init: (s) => s.slideTo(5) },
    });
    sw.autoplay.stop();
    el.addEventListener("click", () => sw.slideNext());
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !reduce ? sw.autoplay.start() : sw.autoplay.stop()))).observe(el);
  };
  if (document.readyState === "complete") book();
  else addEventListener("load", book, { once: true });
})();
