// First page (original pageTopLoad). Scroll is locked until the hero is fully open.
// Loading turns off in .15s (delay .15) → first sheet from y100 · -8° over 1.2s (delay .3) easeOutQuart → the remaining eight sheets at .18s intervals
//   From the frame position (top 120→50 · sides ±200→60 · ±5°) .7s easeOutCubic, the photo turns on at .25s → the last card rises from 60 below after 1.35s with .2s easeInQuart · 1s easeOutQuart
//   covers the screen (.8s easeOutQuart, phone 1s) → tagline white strip .5s easeInOutQuart (delay .1/.3) · curtain .9s easeOutQuart (delay .8/1) · slick fade 1.2s every 4 seconds · header .8s (delay 1.2, phone .6s delay .9)
// Two sections below: once past 100px below the screen edge, text·graphics rise from y50 (phone 30) over 1.5s easeOutCubic, and dandelion fluff flies in diagonally. The recruit photo strip is infiniteslide at 40px per second (phone 30).
(() => {
  const { TP } = window;
  const $ = window.jQuery;

  // The original site rewrites infiniteslide to start right away if load has already passed — the npm version only starts on load, so we call just the load handler that was attached a moment ago
  TP.infinite = (el, opts) => {
    const had = (($._data(window, "events") || {}).load || []).slice();
    $(el).infiniteslide(opts);
    if (document.readyState !== "complete") return;
    (($._data(window, "events") || {}).load || []).filter((h) => !had.includes(h)).forEach((h) => {
      $(window).off("load", h.handler);
      h.handler.call(window, $.Event("load"));
    });
  };

  TP.page("home", {
    selfReveal: true,
    ready(box) {
      const { reduced, isSP, ease, head, loading } = TP;
      const sp = isSP();
      const hero = box.querySelector(".hm-main");
      const firsts = [...hero.querySelectorAll(".hm-first__i")];
      const last = hero.querySelector(".hm-last");
      const $slide = $(hero.querySelector(".hm-slide"));
      const spans = [...hero.querySelectorAll(".hm-copy span")];
      const masks = [...hero.querySelectorAll(".hm-mask")];
      const tweens = [];
      const later = (t) => (tweens.push(t), t);

      const slick = () =>
        $slide.slick({ fade: true, speed: 1200, easing: "ease-out", autoplay: !reduced, autoplaySpeed: 4000, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, slidesToShow: 1, draggable: false, accessibility: false, swipe: false, swipeToSlide: false, touchMove: false });

      const lock = () => { document.body.classList.add("tp-noscroll"); document.body.style.top = "0px"; };
      const unlock = () => { document.body.classList.remove("tp-noscroll"); document.body.style.top = ""; };

      function open() {
        last.classList.add("is-active");
        gsap.set(hero.querySelector(".hm-first"), { opacity: 0 });
        spans.forEach((s, i) => later(gsap.to(s, { height: s.firstElementChild.offsetHeight, duration: 0.5, delay: i ? 0.3 : 0.1, ease: ease.inOutQuart })));
        masks.forEach((m, i) => later(gsap.to(m, { height: 0, duration: 0.9, delay: i ? 1 : 0.8, ease: ease.outQuart })));
        slick();
        later(gsap.to(head, { opacity: 1, duration: sp ? 0.6 : 0.8, delay: sp ? 0.9 : 1.2, ease: ease.outQuad }));
        unlock();
      }
      function stack() {
        const top = [120, 110, 100, 90, 80, 70, 60, 50];
        const left = [-200, 180, -160, 140, -120, 100, -80, 60];
        firsts.slice(1).forEach((w, k) => {
          gsap.set(w, { marginTop: top[k], marginLeft: left[k], rotation: k % 2 ? 5 : -5 });
          later(gsap.to(w.querySelector("figure"), { opacity: 1, duration: 0.25, delay: k * 0.18, ease: ease.outCubic }));
          later(gsap.to(w, { marginTop: 0, marginLeft: 0, rotation: 0, duration: 0.7, delay: k * 0.18, ease: ease.outCubic }));
        });
        gsap.set(last, { marginBottom: -60 });
        later(
          gsap.timeline({ delay: 0.18 * 7.5 })
            .to(last, { opacity: 1, marginBottom: -30, duration: 0.2, ease: ease.inQuart })
            .to(last, { marginBottom: 0, duration: 1, ease: ease.outQuart, onComplete: open })
        );
      }

      if (reduced) {
        last.classList.add("is-active");
        gsap.set(last, { opacity: 1 });
        gsap.set(hero.querySelector(".hm-first"), { opacity: 0 });
        spans.forEach((s) => gsap.set(s, { height: "auto" }));
        gsap.set(masks, { height: 0 });
        gsap.set([box, head], { opacity: 1 });
        gsap.set(loading, { display: "none" });
        slick();
      } else {
        lock();
        gsap.to(loading, { opacity: 0, duration: 0.15, delay: 0.15, ease: "none", onComplete: () => gsap.set(loading, { display: "none" }) });
        gsap.set(box, { opacity: 1 });
        later(gsap.fromTo(firsts[0].querySelector("figure"), { y: 100, rotation: -8 }, { opacity: 1, y: 0, rotation: 0, duration: 1.2, delay: 0.3, ease: ease.outQuart, onComplete: stack }));
      }

      // Two lower cards — original delay: wide screen about (text 0·image1 .3·image2 .6)·policy (text .3·photo1 .6·photo2 .9), phone about (.3·0·.6)·policy (.6·.3·.9)
      const mm = gsap.matchMedia();
      mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { pc, reduce } = ctx.conditions;
        const about = box.querySelector(".hm-about");
        const policy = box.querySelector(".hm-policy");
        const parts = box.querySelectorAll(".hm-common .hm-pic, .hm-common .hm-img, .hm-common .hm-txt");
        if (reduce) return void gsap.set(parts, { opacity: 1, y: 0 });
        gsap.set(parts, { opacity: 0, y: pc ? 50 : 30 });
        const up = (el, delay) => el && gsap.to(el, { opacity: 1, y: 0, duration: 1.5, delay, ease: ease.outCubic });
        const fly = (el, from, delay) => el && gsap.fromTo(el, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.5, delay, ease: ease.outCubic });
        const d = pc ? { a: [0, 0.3, 0.6], p: [0.3, 0.6, 0.9] } : { a: [0.3, 0, 0.6], p: [0.6, 0.3, 0.9] };
        ScrollTrigger.create({
          trigger: about, start: "top bottom-=100", once: true,
          onEnter: () => TP.tick(() => {
            up(about.querySelector(".hm-txt"), d.a[0]);
            up(about.querySelector(".hm-pic1"), d.a[1]);
            up(about.querySelector(".hm-pic2"), d.a[2]);
            fly(about.querySelector(".hm-fluff"), { x: 100, y: -60, rotation: -60 }, 0.9);
          }),
        });
        ScrollTrigger.create({
          trigger: policy, start: "top bottom-=100", once: true,
          onEnter: () => TP.tick(() => {
            up(policy.querySelector(".hm-txt"), d.p[0]);
            up(policy.querySelector(".hm-img1"), d.p[1]);
            up(policy.querySelector(".hm-img2"), d.p[2]);
            fly(policy.querySelector(".hm-fluff"), { x: -100, y: -60, rotation: 60 }, 2.1);
          }),
        });
      });

      TP.infinite(box.querySelector(".hm-recruit__slide"), { speed: sp ? 30 : 40, responsive: true, pauseonhover: false, direction: "left", clone: 2 });

      return () => {
        tweens.forEach((t) => t.kill());
        mm.revert();
        unlock();
        if ($slide.hasClass("slick-initialized")) $slide.slick("unslick");
      };
    },
  });
})();
