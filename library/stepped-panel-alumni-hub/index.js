// First page motion. Values are straight from the original top.js — scattered positions are px based on 1424px (376px on phones) multiplied by the screen-width ratio.
// Original’s ease:"ease" is not a GSAP name, so it runs on the default power1.out — that result is used as is.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "power1.out";

  // ── Hero slider — same Swiper 8.4 settings as the original: one at a time · speed 0 · overlap swap (crossFade off) · rewind at the end · 6s autoplay.
  // On each change the progress bar refills, the new slide image covers through a cropped window in 1.2s (is-animate-enter), and the text lifts in and out. The yellow curtain on the first slide lifts after 6s ──
  (() => {
    const mv = $(".mv");
    const bar = $(".mv__progress-bar", mv);
    const restartBar = () => { if (!bar) return; bar.classList.remove("is-running"); void bar.offsetWidth; bar.classList.add("is-running"); };
    const images = (sw) => sw.slides.forEach((slide, i) => {
      const img = $(".mv__image > *", slide);
      if (!img) return;
      if (i === sw.activeIndex) { img.classList.remove("is-animate-enter", "is-animate-leave"); void img.offsetWidth; img.classList.add("is-animate-enter"); }
      else { img.classList.remove("is-animate-enter"); img.classList.add("is-animate-leave"); }
    });
    const contents = (sw) => sw.slides.forEach((slide, i) => {
      const box = $(".mv__content", slide);
      if (!box) return;
      if (i === sw.activeIndex) { box.classList.remove("is-enter", "is-leave"); void box.offsetWidth; box.classList.add("is-enter"); }
      else { box.classList.remove("is-enter"); box.classList.add("is-leave"); }
    });
    new Swiper($(".mv-slider", mv), {
      slidesPerView: 1, speed: 0, rewind: true, effect: "fade", fadeEffect: { crossFade: false },
      autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false },
      navigation: { prevEl: $(".mv__prev", mv), nextEl: $(".mv__next", mv) },
      pagination: { el: $(".mv__pagination", mv), type: "fraction" },
      on: {
        afterInit(sw) { contents(sw); setTimeout(() => mv.classList.remove("is-mask"), reduce ? 0 : 6000); },
        autoplayStart(sw) { restartBar(); images(sw); },
        slideChangeTransitionStart(sw) {
          restartBar(); images(sw); contents(sw);
          setTimeout(() => { if (sw.autoplay.paused) { sw.autoplay.paused = false; sw.autoplay.run(); } }, sw.params.speed + 100);
        },
        autoplayStop() { bar?.classList.remove("is-running"); },
      },
    });
  })();

  // ── About mosaic — per-cell Swiper crossfade (1.5s, endless). Every 1.5s one random cell (not the one just before) is advanced to the next photo ──
  const mosaic = (() => {
    const cells = $$(".js-what-swiper").map((el) => new Swiper(el, { slidesPerView: 1, loop: true, effect: "fade", fadeEffect: { crossFade: true }, speed: 1500, allowTouchMove: false }));
    let timer, cur = 0;
    const pick = (not) => { if (cells.length <= 1) return 0; let n; do n = Math.floor(Math.random() * cells.length); while (n === not); return n; };
    const stop = () => { clearTimeout(timer); timer = undefined; };
    const tick = () => { timer = setTimeout(() => { cells[cur].slideNext(); cur = pick(cur); tick(); }, 1500); };
    return {
      start() { stop(); if (!reduce) tick(); },
      stop,
      reset() { stop(); cur = 0; cells.forEach((sw) => sw.slideToLoop(0, 0, false)); },
    };
  })();

  // ── Topic carousel — only at 768 and up, same Swiper as the original: slide width is its own size, centered, .6s, endless loop, 4s autoplay ──
  const carousel = (() => {
    let sw = null;
    return {
      init() {
        if (sw) return;
        sw = new Swiper(".topics-slider", { slidesPerView: "auto", centeredSlides: true, speed: 600, loop: true, watchOverflow: false, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false }, navigation: { prevEl: ".topics-list__prev", nextEl: ".topics-list__next" } });
      },
      destroy() { sw?.destroy(true, true); sw = null; },
    };
  })();

  // Like the original, scattered values are in px and are re-measured in proportion to screen width
  const spread = (sel, pts, k) => Object.entries(pts).forEach(([c, [x, y]]) => gsap.set(`${sel} ${c}`, { x: x * k(), y: y * k() }));
  const gather = (tl, sel, list, dur) => list.forEach((c) => tl.to(`${sel} ${c}`, { x: 0, y: 0, duration: dur, ease: EASE }, 0));

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", sp: "(max-width: 767px) and (prefers-reduced-motion: no-preference)", rm: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, sp, rm } = ctx.conditions;
    if (rm) {
      $(".what__inner").classList.add("show");
      $(".join__content-inner").classList.add("show");
      $(".hero .title").classList.add("show");
      return;
    }
    const mid = innerWidth < 1081;
    const kPC = () => innerWidth / 1424;
    const kSP = () => innerWidth / 376;

    // ── About: ① photos gather while the hero scrolls up ② the section stays pinned while text rises, then exits upward together with the title ──
    if (pc) spread(".what", { ".js-img1": [-110, -186], ".js-img2": [130, -126], ".js-img3": [-110, 154], ".js-img4": [200, 125] }, kPC);
    else spread(".what", { ".js-img1": [-221, -200], ".js-img2": [124, -289], ".js-img3": [-169, -131], ".js-img4": [170, 150] }, kSP);
    gsap.set(".what .blk-text", { y: innerHeight * 0.5 });
    const trig = $(pc ? ".mv" : ".what-trigger");
    const lift = -(trig.offsetHeight / 2 - $("#header").offsetHeight);
    const tl1 = gsap.timeline({ scrollTrigger: {
      trigger: trig, start: "top top", endTrigger: ".js-what", end: "top top", scrub: 0.5,
      onLeave: () => { mosaic.stop(); tl1.progress(1); }, onEnterBack: () => mosaic.start(), onLeaveBack: () => { mosaic.reset(); tl1.progress(0); },
    } });
    tl1.to(".what .what__visual", { y: lift, duration: 5, ease: EASE }, 0);
    gather(tl1, ".what", [".js-img1", ".js-img2", ".js-img3", ".js-img4"], 5);
    const B = pc ? 1500 : 400, lead = 0.4, rise = 3, out = 3, g = lead + rise;
    const total = pc ? g + out : g;
    const tl2 = gsap.timeline({ scrollTrigger: {
      trigger: ".js-what", start: "top top", end: `+=${Math.round((B * total) / g)}`, scrub: 0.5, pin: true,
      onEnter: () => { mosaic.start(); $(".what__inner").classList.add("show"); },
      onLeaveBack: () => { mosaic.stop(); $(".what__inner").classList.remove("show"); },
    } });
    tl2.to(".what .blk-text", { y: 0, duration: rise, ease: EASE }, lead);
    if (pc) {
      const Y = 500 * kPC();
      tl2.to(".what .what__title", { top: `-=${Y}`, duration: out, ease: EASE }, ">").to(".what .blk-text", { y: -Y, duration: out, ease: EASE }, "<");
    }

    // ── Topic carousel only at 768 and up ──
    if (pc) carousel.init();

    // ── Community staircase board ──
    if (sp) {
      spread(".join", { ".js-join-block1": [-49, -40], ".js-join-block2": [192, 68], ".js-join-block3": [-80, 269], ".js-join-block5": [-80, 19], ".js-join-block6": [80, 200], ".js-join-block7": [-80, 90], ".js-join-block8": [-80, 168] }, kSP);
      gsap.set(".join .js-join-block4", { x: 80, y: 267 * kSP() });
    } else spread(".join", { ".js-join-block1": [-424, -456], ".js-join-block2": [250, -184], ".js-join-block3": [-110, 117], ".js-join-block4": [0, 188], ".js-join-block5": [-60, -183], ".js-join-block6": [60, -60] }, kPC);
    const range = () => sp ? [`${Math.round(350 * kSP())}px top`, `+=${Math.round(500 * kSP())}`]
      : mid ? ["-250px top", "+=800"] : [`${Math.round(250 * kPC())}px top`, `+=${Math.round(1050 * kPC())}`];
    const [js, je] = range();
    const joinIn = $(".join__content-inner");
    const tl3 = gsap.timeline({ scrollTrigger: { trigger: ".topics-list__inner", start: js, end: je, scrub: 2, onLeave: () => tl3.progress(1), onLeaveBack: () => tl3.progress(0) } });
    gather(tl3, ".join", [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `.js-join-block${n}`), 15);
    tl3.call(() => joinIn.classList.add("show"), [], ">").call(() => joinIn.classList.remove("show"), [], 0);

    // ── Final mosaic ──
    if (sp) spread(".hero", { ".square01": [-51, -76], ".square02": [90, -16], ".square03": [110, 34], ".square04": [-49, 154], ".square05": [-20, 134], ".square06": [0, 254], ".img01": [-30, -66], ".img02": [-39, 13], ".img03": [30, -135], ".img04": [10, 144], ".img05": [20, 54] }, kSP);
    else spread(".hero", { ".square01": [-271, -341], ".square02": [218, 20], ".square03": [-140, 150], ".square04": [-190, 210], ".square05": [-60, 60], ".img01": [-182, -61], ".img02": [-61, 9], ".img03": [49, -191], ".img04": [-1, 289], ".img05": [60, 239] }, kPC);
    const heroTitle = $(".hero .title");
    const tl4 = gsap.timeline({ scrollTrigger: { trigger: ".js-hero-pin", start: js, end: je, scrub: 2, onLeave: () => tl4.progress(1), onLeaveBack: () => tl4.progress(0) } });
    gather(tl4, ".hero", [".square01", ".square02", ".square03", ".square04", ".square05", ".square06", ".img01", ".img02", ".img03", ".img04", ".img05"], 10);
    tl4.call(() => heroTitle.classList.add("show"), [], ">").call(() => heroTitle.classList.remove("show"), [], 0);

    return () => { mosaic.reset(); if (pc) carousel.destroy(); };
  });
})();
