// Home page: Hero parallelogram strip, mist clouds, four ridgelines (rise at load, each layer at a different speed on scroll), product photo strip, entrance where photos around concentric circles approach, company photo fade.
// Original values: strip 1px/frame (Embla AutoScroll) · concentric circles at inView -30%: photo .4s easeOut (stagger .1) → title·text .3s (stagger .2) → mushroom .4s 0→1 · fade slideshow 4s (Embla Fade + Autoplay, duration 90).
(() => {
  const { reduced } = HS;

  // Fog cloud — pale mint on top, melting into white below
  document.querySelectorAll("[data-cloud]").forEach((el, i) => {
    const flip = i ? "scale(-1,1) translate(-792,0)" : "";
    el.innerHTML = `<svg viewBox="0 0 792 295" style="width:100%;height:100%;overflow:visible" aria-hidden="true"><defs><linearGradient id="hs-cl${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--site-green-89)"/><stop offset=".55" stop-color="var(--site-green-97)"/><stop offset="1" stop-color="var(--kf-bg)"/></linearGradient></defs><path transform="${flip}" d="M0 295V170c38-40 90-58 140-46 24-50 84-82 150-70 40-44 120-50 168-6 48-20 108-6 136 40 50-8 110 16 140 64 26 8 46 28 58 52v91z" fill="url(#hs-cl${i})"/></svg>`;
  });

  // Four Hero ridgelines — the back ones pale, the front ones dark. The bottom color of the front layer matches the News section green, so there is no seam
  const MV = [
    { seed: 3, top: 0.04, amp: 0.3, fill: ["var(--site-green-86)", "var(--site-green-97-2)", 0.9, 0], speed: -0.02 },
    { seed: 17, top: 0.24, amp: 0.3, fill: ["var(--site-green-47)", "var(--site-green-75)", 1, 0.7], speed: -0.05 },
    { seed: 29, top: 0.42, amp: 0.26, fill: ["var(--site-green-40)", "var(--site-green-59)", 1, 1], speed: -0.08 },
    { seed: 43, top: 0.6, amp: 0.2, fill: ["var(--site-green-41-2)", "var(--kf-accent)", 1, 1], speed: -0.11, fadeTo: 250 },
  ];
  document.querySelectorAll("[data-mv-ridge]").forEach((el) => HS.ridge(el, [MV[+el.dataset.mvRidge]]));

  // Ridge beneath the concentric circles — moves from a white background to a green surface derived from the mission
  const ab = document.querySelector(".about__ridges");
  ab && HS.ridge(ab, [
    { seed: 61, top: 0.04, amp: 0.3, fill: ["var(--site-green-92-2)", "var(--kf-bg)", 1, 0], speed: -0.02 },
    { seed: 71, top: 0.2, amp: 0.3, fill: ["var(--site-green-77)", "var(--site-green-92-3)", 1, 0.5], speed: -0.05 },
    { seed: 83, top: 0.4, amp: 0.3, fill: ["var(--site-green-50)", "var(--site-green-66)", 1, 0.9], speed: -0.08 },
    { seed: 97, top: 0.62, amp: 0.24, fill: ["var(--site-green-42)", "var(--kf-accent)", 1, 1], speed: -0.1, fadeTo: 300 },
  ], { w: 1440, h: 327 });

  // ---------- Photo strip · company switch: same Embla 8 as the original (AutoScroll · Fade + Autoplay) ----------
  // The band is draggable (flows again on release), and speed follows the original breakpoints as is: 1px per frame (≥1280) · .9 (769~1279) · .5 (phone)
  const flow = { breakpoints: { "(width >= 1280px)": { speed: 1 }, "(769px <= width < 1280px)": { speed: 0.9 }, "(width < 769px)": { speed: 0.5 } }, playOnInit: true, startDelay: 0, stopOnInteraction: false, stopOnFocusIn: false, stopOnMouseEnter: false, active: !reduced };
  const mv = document.querySelector(".mv__frame");
  mv && EmblaCarousel(mv, { loop: true, dragFree: false, align: "start", container: ".mv__track" }, [EmblaCarouselAutoScroll(flow)]);
  // Like the original, the product strip appends one more set at a time until there are nine cells so the loop never breaks
  const intro = document.querySelector(".intro__marquee");
  const introList = intro?.querySelector(".intro__track");
  if (introList) {
    const base = [...introList.children];
    while (introList.children.length < 9) base.forEach((n) => introList.append(n.cloneNode(true)));
    EmblaCarousel(intro, { loop: true, dragFree: false, skipSnaps: true, container: introList }, [EmblaCarouselAutoScroll(flow)]);
  }
  const caps = ["Your first photo caption line here", "Your second photo caption here", "Your third photo caption line here", "Your fourth photo caption here", "Your fifth photo caption here"];
  const cap = document.querySelector("[data-fade-cap]");
  document.querySelectorAll("[data-fade]").forEach((el) => {
    const api = EmblaCarousel(el, { loop: true, dragFree: false, skipSnaps: true, duration: 90 }, [
      EmblaCarouselFade(),
      EmblaCarouselAutoplay({ playOnInit: true, stopOnInteraction: false, stopOnFocusIn: false, stopOnMouseEnter: false, active: !reduced }),
    ]);
    if (el.dataset.fade !== "center" || !cap) return;
    const say = () => (cap.textContent = caps[api.selectedScrollSnap() % caps.length]);
    api.on("select", say).on("init", say);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Loading: white screen → ridge rises from below → the misty site photo clears
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from("[data-mv-ridge]", { y: 140, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 0)
      .from("[data-cloud]", { y: 80, opacity: 0, duration: 1.2, ease: "expo.out" }, 0.1)
      .from(".mv__frame", { opacity: 0, duration: 1.2, ease: "power1.out" }, 0.35)
      .fromTo(".mv__fog", { opacity: 0.6 }, { opacity: 0, duration: 1.8, ease: "power1.out" }, 0.35);

    // Concentric ring: four photos approach from outside, and the title, text and mushroom pieces pop out
    // The original is a Motion animate sequence — same values in GSAP, curves exactly Motion’s easeOut(0,0,.58,1) and easeInOut(.42,0,.58,1)
    const { easeOut, easeInOut } = HS;
    const at = gsap.timeline({ paused: true, defaults: { ease: easeOut, duration: 0.4 } });
    at.from(".about__img.is-1", { x: 80, y: 60, opacity: 0 }, 0.2)
      .from(".about__img.is-2", { x: -80, y: 80, opacity: 0 }, "<0.1")
      .from(".about__img.is-3", { x: 70, y: -40, opacity: 0 }, "<0.1")
      .from(".about__img.is-4", { x: -80, y: -40, opacity: 0 }, "<0.1")
      .from(".about__h, .about__txt", { y: 60, opacity: 0, duration: 0.3, ease: easeInOut, stagger: 0.2 }, "<0.1")
      .from(".about__mush.is-1", { y: 30, scale: 0, opacity: 0 }, "-=0.5")
      .from(".about__mush.is-2", { y: 30, scale: 0, opacity: 0 }, "<0.1")
      .from(".about__mush.is-3", { y: 30, scale: 0, opacity: 0 }, "<0.1")
      .from(".about__mush.is-4", { y: 30, scale: 0, opacity: 0 }, "<0.1");
    ScrollTrigger.create({ trigger: ".about__in", start: "top 70%", once: true, onEnter: () => at.play() });

    // Greeting map and product hill follow along slowly
    gsap.to(".msg__map", { y: -60, ease: "none", scrollTrigger: { trigger: ".msg", start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
