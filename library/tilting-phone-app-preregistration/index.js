/* Loader (original WAAPI order as is) · reveal (ScrollMagic triggerHook .8) · What background scrub · Solutions horizontal pin · Outline phone tilt · swiper paging */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Loader */
  const loader = $(".nt-loader");
  const done = () => { loader.classList.add("is-gone"); body.classList.add("is-loaded"); ScrollTrigger.refresh(); };
  /* Original starts the sequence at window load — only the ink-black panel shows, then the copy turns on after load */
  const play = () => {
    const catchEl = $(".nt-loader__catch", loader), icon = $(".nt-loader__icon", loader);
    const white = $(".nt-loader__bg.is-white", loader), black = $(".nt-loader__bg.is-black", loader);
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
    const keep = { fill: "forwards" };
    catchEl.animate({ opacity: 1 }, { ...keep, duration: 500 });
    catchEl.animate({ filter: "blur(2px)" }, { ...keep, delay: 1800, duration: 300 });
    catchEl.animate({ color: ink }, { ...keep, delay: 2100, duration: 100 });
    icon.animate({ opacity: 1 }, { ...keep, delay: 2100, duration: 100 });
    white.animate({ opacity: 1 }, { ...keep, delay: 2100, duration: 100 });
    catchEl.animate({ filter: "blur(0px)" }, { ...keep, delay: 2200, duration: 100 });
    catchEl.animate({ opacity: 0 }, { ...keep, delay: 3300, duration: 400 });
    white.animate({ transform: "translateY(-100%)" }, { ...keep, delay: 3300, duration: 900, easing: "cubic-bezier(0.86, 0, 0.07, 1)" });
    black.animate({ transform: "translateY(-100%)" }, { ...keep, delay: 3600, duration: 900, easing: "cubic-bezier(0.86, 0, 0.07, 1)" });
    setTimeout(done, 4600);
  };
  if (reduce) done();
  else if (document.readyState === "complete") play();
  else addEventListener("load", play, { once: true });

  /* Reveal: action fires when the element’s top edge reaches 80% of the screen — original ScrollMagic triggerHook .8 */
  const ups = $$(".nt-up");
  if (reduce) ups.forEach((el) => el.classList.add("is-in"));
  else {
    const controller = new ScrollMagic.Controller();
    ups.forEach((el) => new ScrollMagic.Scene({ triggerElement: el, triggerHook: 0.8 }).on("enter", () => el.classList.add("is-in")).addTo(controller));
  }

  /* swiper: loop per phone, the whole screen acts as the Next button — the red circle sticks to the first cell and moves along with it */
  $$(".nt-mock__swiper").forEach((el) => {
    new Swiper(el, { slidesPerView: 1, loop: true, navigation: { nextEl: $(".swiper-button-next", el) } });
  });

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    /* What: photo card background position 0% → 100% (the photo slot moves a plate with generous room above and below) */
    const card = $("[data-what-bg]");
    gsap.fromTo($(".nt-what__photo", card), { yPercent: 0 }, { yPercent: -27, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

    /* Solutions: pin the section and move the card list left by (list width + window width/5 - section width) */
    const sol = $(".nt-sol__pin"), list = $("[data-sol-list]");
    const dist = () => list.scrollWidth + innerWidth / 5 - sol.clientWidth;
    gsap.to(list, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sol, start: "top top", end: () => `+=${dist()}`, scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
    gsap.fromTo(".nt-sol__top", { y: () => -innerHeight * 0.2, boxShadow: "0px 30px 50px rgba(0, 0, 0, 0.8)" }, { y: 0, boxShadow: "0px 30px 50px rgba(0, 0, 0, 0)", ease: "none", scrollTrigger: { trigger: sol, start: "top bottom", end: "top 5%", scrub: true, invalidateOnRefresh: true } });
    gsap.fromTo(".nt-sol__bottom", { y: () => -innerHeight * 0.3, yPercent: -100 }, { y: 0, yPercent: 0, ease: "none", scrollTrigger: { trigger: sol, start: "top bottom", end: "top 5%", scrub: true, invalidateOnRefresh: true } });

    /* Outline: while card i’s bottom edge moves from screen center → top, phone i goes -5vh, 5° and transparent, and the number turns on while the card’s bottom edge is between screen bottom and top */
    const mocks = $$("[data-mocks] > .nt-mock"), cards = $$("[data-outline-card]"), idx = $$("[data-outline-index] li");
    mocks.forEach((m, i) => gsap.set(m, { zIndex: mocks.length - i }));
    cards.slice(0, -1).forEach((c, i) => gsap.to(mocks[i], { y: () => -innerHeight * 0.05, rotate: 5, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: c, start: "bottom center", end: "bottom top", scrub: true, invalidateOnRefresh: true } }));
    cards.forEach((c, i) => ScrollTrigger.create({ trigger: c, start: "bottom bottom", end: "bottom top", toggleClass: { targets: idx[i], className: "is-active" } }));
  });

  /* Phone (768 and below): like the original, one phone above each feature card — when wider, goes back to the fixed right column */
  mm.add("(max-width: 768px)", () => {
    const stack = $("[data-mocks]");
    const pairs = $$("[data-mocks] > .nt-mock").map((m, i) => [m, $$("[data-outline-card]")[i]]);
    pairs.forEach(([m, c]) => c && c.prepend(m));
    return () => pairs.forEach(([m]) => stack.append(m));
  });
})();
