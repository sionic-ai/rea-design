// First page — fixed scene and slider values of the original main2.js as they are.
// At 1025px and up: Hero stays pinned + map grows 41.14vw→100vw (100vh scrub) · past 20px is-active (sides drop away in .5s) · About section object-position 35%→100%
//             experience pin (+150vh) mask 100%→1000% · photo .58→1 (first 10vh) · is-active after 35vh passes
// At 1024px and below: About parachute y −400 scrub · Experience pinned (100vh) mask · photo rail y ±100 scrub
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const img = $(".hm-map img");
  if (img && window.tsMapSrc) img.src = window.tsMapSrc();

  const slider = (sel, opts, panel) => {
    const rootEl = $(sel);
    if (!rootEl || !window.Swiper) return null;
    const box = rootEl.querySelector(".swiper-container") || rootEl;
    const pag = rootEl.querySelector(".swiper-pagination");
    const n = box.querySelectorAll(".swiper-slide").length;
    const on = pag ? window.tsFractionOn(rootEl) : {};
    if (panel) on.slideChange = function () { panel(this.slides[this.activeIndex]); };
    const sw = new Swiper(box, {
      loop: true, loopedSlides: n, simulateTouch: true, speed: 500,
      autoplay: opts.autoplay === false || reduce ? false : { delay: 5000, disableOnInteraction: false },
      ...(pag ? { pagination: window.tsFraction(pag) } : {}),
      ...opts, on,
    });
    rootEl.querySelector(".hm-prev")?.addEventListener("click", () => sw.slidePrev());
    rootEl.querySelector(".hm-next")?.addEventListener("click", () => sw.slideNext());
    return sw;
  };

  const evPanel = $(".hm-event__panel");
  const showEvent = (slide) => {
    if (!slide || !evPanel) return;
    evPanel.querySelector(".ts-tags").innerHTML = (slide.dataset.tags || "").split(" ").map((t) => `<span>${t}</span>`).join("");
    evPanel.querySelector(".hm-event__txt").textContent = slide.dataset.txt || "";
  };

  document.addEventListener("DOMContentLoaded", () => {
    slider(".hm-event", { spaceBetween: 40, slidesPerView: "auto", centeredSlides: true, autoHeight: false, breakpoints: { 1023: { spaceBetween: 15 } } }, showEvent);
    slider(".hm-special", { spaceBetween: 0, slidesPerView: "auto", centeredSlides: true, autoHeight: true, breakpoints: { 767: { spaceBetween: 30, slidesPerView: 1 } } });
    slider(".hm-exp-list", { spaceBetween: 40, slidesPerView: 3, autoHeight: true, autoplay: false, breakpoints: { 1023: { spaceBetween: 30, slidesPerView: 1 } } });
    slider(".hm-menu", { spaceBetween: 30, slidesPerView: "auto", centeredSlides: true, autoHeight: true, breakpoints: { 1023: { spaceBetween: 10 } } });
  });

  const scenes = ({ scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const mm = gsap.matchMedia();
    const intro = $(".hm-intro"), about = $(".hm-about"), exp = $(".hm-exp"), body = $(".hm-exp__body");
    const st = (o) => ({ scroller, invalidateOnRefresh: true, ...o });

    mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create(st({ trigger: intro, start: "top top", end: "bottom bottom", pin: ".hm-stage", pinSpacing: false }));
      gsap.to(".hm-map", { left: 0, marginLeft: 0, width: "100vw", ease: "none", scrollTrigger: st({ trigger: intro, start: "top top", end: () => "+=" + innerHeight, scrub: true }) });
      ScrollTrigger.create(st({ trigger: intro, start: "top+=20 top", end: "bottom top", toggleClass: { targets: intro, className: "is-active" } }));
      gsap.to(img, { objectPosition: "50% 100%", ease: "none", scrollTrigger: st({ trigger: intro, start: () => "top+=" + innerHeight * 1.5 + " top", end: "bottom bottom", scrub: true }) });
      ScrollTrigger.create(st({ trigger: about, start: "top 70%", onEnter: () => about.classList.add("is-active"), onLeaveBack: () => about.classList.remove("is-active") }));

      gsap.to(".hm-exp__mv", { "--ms": "1000%", ease: "none", scrollTrigger: st({ trigger: exp, start: "top top", end: "bottom+=50% top", pin: true, scrub: true }) });
      gsap.fromTo(".hm-exp__img", { scale: 0.58 }, { scale: 1, ease: "none", scrollTrigger: st({ trigger: exp, start: "top top", end: "bottom-=90% top", scrub: true }) });
      ScrollTrigger.create(st({ trigger: exp, start: "top top", end: "bottom-=65% top", onLeave: () => body.classList.add("is-active"), onEnterBack: () => body.classList.remove("is-active") }));
    });

    mm.add("(max-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      about.classList.add("is-active");
      gsap.to(".hm-about__bg", { y: -400, ease: "none", scrollTrigger: st({ trigger: about, start: "top bottom", end: "bottom top", scrub: true }) });
      gsap.to(".hm-exp__mv", { "--ms": "1000%", ease: "none", scrollTrigger: st({ trigger: exp, start: "top top", end: "bottom top", pin: true, scrub: true }) });
      gsap.fromTo(".hm-exp__img", { scale: 0.58 }, { scale: 1, ease: "none", scrollTrigger: st({ trigger: exp, start: "top top", end: "bottom-=80% top", scrub: true }) });
      ScrollTrigger.create(st({ trigger: exp, start: "top top", end: "bottom-=65% top", onLeave: () => body.classList.add("is-active"), onEnterBack: () => body.classList.remove("is-active") }));
      gsap.to(".hm-rail.is-left", { y: 100, ease: "none", scrollTrigger: st({ trigger: ".hm-gallery", start: "top-=100% top", end: "bottom+=100% top", scrub: true }) });
      gsap.to(".hm-rail.is-right", { y: -100, ease: "none", scrollTrigger: st({ trigger: ".hm-gallery", start: "top-=100% top", end: "bottom+=100% top", scrub: true }) });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      about.classList.add("is-active");
      body.classList.add("is-active");
    });
  };

  (window.tsReady || Promise.resolve({ scroller: window })).then(scenes);
})();
