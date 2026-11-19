// Shared by all sections — smooth scroll (ScrollSmoother) · phone drawer · Hero video and sound button · sub-section header graphic · photo slider (Swiper) · brush heart graphic.
// The original uses Alpine components (heroBanner, pageHero, imageSlider, sloganSlider) and GSAP 3, so the same values were carried over by hand.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original Li.create({ smooth: 1, effects: true }) — photos carrying data-speed flow separately
  if (!reduce && document.getElementById("smooth-wrapper")) ScrollSmoother.create({ smooth: 1, effects: true });

  // ---------- Brush heart (red and teal petals, two) — the same SVG goes behind the slogan section and in the subsection headers ----------
  const PETAL_RED = "M392 500C330 470 180 450 100 410C40 380 10 320 15 250C20 190 50 165 95 158C150 145 230 140 290 175C345 210 365 280 378 350C386 410 395 470 392 500Z";
  const PETAL_MINT = "M392 500C380 430 370 330 400 240C430 150 480 80 560 40C630 10 700 5 740 30C780 60 790 130 785 190C780 250 740 310 690 350C620 400 500 450 392 500Z";
  // Brush grain — horizontal noise is layered lightly only inside the petals. The same drawing is inserted several times, so each filter name is made separate per insertion
  const BRUSH = (id) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.11" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.25" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in" result="s"/><feComponentTransfer in="s" result="t"><feFuncA type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="t"/></feMerge></filter>`;
  const petals = (red, mint, id) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 515" preserveAspectRatio="xMidYMid meet"><defs>${BRUSH(id)}</defs><g filter="url(#${id})"><path style="fill:${red}" d="${PETAL_RED}"/><path style="fill:${mint};fill-opacity:.94" d="${PETAL_MINT}"/></g></svg>`;
  document.querySelectorAll("[data-om-art]").forEach((el, i) => {
    el.innerHTML = petals("var(--site-petal-red)", "var(--site-petal-mint)", `om-brush-${i}`).replace("<svg ", '<svg aria-hidden="true" ');
  });

  // ---------- Subpage header — in the original, pageHero gets loaded from a script placed at the end. On a first visit it is already painted while the script downloads,
  // The picture grows and appears over 3s and the title rises 1s later over 2s (measured 2.6s), but when arriving from within the same site the script is cached and attaches before the first paint,
  // Lands straight in the end state. A one-line script in the head handles that branch before first paint, so here only the first visit is attached two frames later ----------
  const hero = document.querySelector(".om-phero");
  if (hero && !hero.classList.contains("is-loaded")) {
    if (reduce) hero.classList.add("is-loaded");
    else requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-loaded")));
  }

  // ---------- Phone drawer — original x-transition .3s ease-out entering · .3s ease-in leaving, closes when the window scrolls ----------
  const burger = document.querySelector(".om-burger");
  const drawer = document.querySelector(".om-drawer");
  if (burger && drawer) {
    let open = false, timer = 0;
    const set = (v) => {
      if (v === open) return;
      open = v;
      burger.setAttribute("aria-expanded", String(v));
      burger.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      clearTimeout(timer);
      if (v) {
        drawer.classList.remove("is-closing");
        drawer.classList.add("is-shown");
        drawer.getBoundingClientRect();
        drawer.classList.add("is-open");
      } else {
        drawer.classList.remove("is-open");
        drawer.classList.add("is-closing");
        timer = setTimeout(() => drawer.classList.remove("is-shown", "is-closing"), 300);
      }
    };
    burger.addEventListener("click", (e) => { e.preventDefault(); set(!open); });
    addEventListener("scroll", () => set(false), { passive: true });
  }

  // ---------- Hero video — picks the panel for landscape or portrait screens (window resize delayed .25s), sound on and off ----------
  const film = document.querySelector(".om-hero");
  if (film) {
    const video = film.querySelector("video");
    const side = () => (innerHeight < innerWidth ? "landscape" : "portrait");
    let now = side();
    if (video) video.src = video.dataset[now];
    let wait = 0;
    addEventListener("resize", () => {
      clearTimeout(wait);
      wait = setTimeout(() => {
        const next = side();
        if (next !== now && video) { now = next; video.src = video.dataset[now]; }
      }, 250);
    });
    const off = film.querySelector('[data-audio="off"]'), on = film.querySelector('[data-audio="on"]');
    const sound = (v) => {
      if (video) video.muted = !v;
      off?.setAttribute("aria-pressed", String(!v));
      on?.setAttribute("aria-pressed", String(v));
    };
    off?.addEventListener("click", () => sound(false));
    on?.addEventListener("click", () => sound(true));
  }

  // ---------- Photo slider: original imageSlider (autoplay, control, loop): 1s transition · auto-advance every 5s once all are visible ----------
  document.querySelectorAll("[data-om-slider]").forEach((box) => {
    const el = box.querySelector(".swiper");
    if (!el) return;
    const [auto, control, loop] = box.dataset.omSlider.split(",").map((s) => s.trim() === "true");
    const swiper = new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: 10,
      speed: 1000,
      loop,
      keyboard: { enabled: true, onlyInViewport: true },
      autoplay: auto && !reduce ? { delay: 5000, disableOnInteraction: false } : false,
      navigation: control ? { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") } : false,
      mousewheel: { enabled: true, forceToAxis: true, releaseOnEdges: true },
      slidesOffsetBefore: 20,
      slidesOffsetAfter: 10,
      slideToClickedSlide: true,
      breakpoints: { 1024: { slidesOffsetBefore: 0, slidesOffsetAfter: 10 } },
      // The original loads only four — Navigation · Autoplay · Keyboard · Mousewheel — and doesn’t rename buttons — so the bundle’s A11y is turned off
      a11y: { enabled: false },
    });
    if (!auto || reduce) return;
    swiper.autoplay.stop();
    // Original x-intersect.full — each time it crosses threshold .99 (just overlapping), autoplay turns on and advances one slide
    new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && swiper.enabled) { swiper.autoplay.start(); swiper.slideNext(); }
    }), { threshold: 0.99 }).observe(box);
  });

  // ---------- Slogan photo strip — original sloganSlider: autoplay delay 1ms · slide duration = Section count × 500ms · linear, can’t be pushed by hand ----------
  document.querySelectorAll("[data-om-slogan] .swiper").forEach((el) => {
    const n = el.querySelectorAll(".swiper-slide").length;
    if (!n) return;
    new Swiper(el, {
      loop: true,
      slidesPerView: "auto",
      spaceBetween: 10,
      speed: n * 500,
      allowTouchMove: false,
      autoplay: reduce ? false : { delay: 1, disableOnInteraction: false },
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      a11y: { enabled: false },
    });
  });
})();
