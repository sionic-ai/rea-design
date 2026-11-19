// About section — a photo unfolding from a text window, a photo wiped upward on a sticky panel, a 4-cell mosaic with a different tempo per cell
document.addEventListener("sz:ready", () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const copy = document.querySelector(".about-hero__copy");
  setTimeout(() => copy.classList.add("is-animated"), reduce ? 0 : 1200);

  // On first open the photo opens left to right inside the text window over 1.5s. If the page is already scrolled past 30% when it opens (refresh), open immediately
  const outer = document.querySelector(".about-movie__image-outer");
  const openMovie = (retry = 0) => {
    if (scrollY > 0 || retry > 10) {
      if (scrollY > innerHeight * 0.3) outer.classList.add("is-visible");
      else setTimeout(() => outer.classList.add("is-animated"), reduce ? 0 : 1300);
    } else requestAnimationFrame(() => openMovie(retry + 1));
  };
  requestAnimationFrame(() => openMovie());

  // First cropped face of the photo = The inner window of the two-line wordmark box (top 16.5% · right 51% · bottom 17% · left 16%) converted to the photo panel ratio
  const windowInset = () => {
    const parent = document.querySelector(".about-movie").getBoundingClientRect();
    const logo = document.querySelector(".about-hero__logo").getBoundingClientRect();
    const t = logo.top + logo.height * 0.165, b = logo.bottom - logo.height * 0.17;
    const l = logo.left + logo.width * 0.16, rr = logo.right - logo.width * 0.51;
    const pct = (v) => +(v * 100).toFixed(2);
    return `inset(${pct((t - parent.top) / parent.height)}% ${pct((parent.right - rr) / parent.width)}% ${pct((parent.bottom - b) / parent.height)}% ${pct((l - parent.left) / parent.width)}%)`;
  };

  const mqPortrait = matchMedia("(orientation: portrait)");
  let mm;
  const setup = () => {
    mm && mm.revert();
    mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".about-movie__image", { clipPath: windowInset() }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".about-logo", start: "top 95%", end: "top 30%", scrub: true } });
      gsap.fromTo(".about-movie__cover-inner", { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: ".about-logo", start: "top 20%", end: "bottom 100%", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(".about-movie__cover", { opacity: 1 }, { opacity: 0, duration: 0.01, scrollTrigger: { trigger: ".about-lead", start: "bottom 0", toggleActions: "play none none reverse" } });
      ScrollTrigger.create({ trigger: ".about-logo", start: "top 0", toggleClass: { targets: ".about-logo__logo", className: "is-visible" } });

      document.querySelectorAll(".about-article").forEach((block) => {
        const inners = block.querySelectorAll(".about-article__text-inner");
        const wipe = block.querySelector(".about-article__image-item.wipe-up");
        const wrap = block.querySelector(".about-article__image");
        const portrait = mqPortrait.matches;
        const trig = portrait ? wrap : inners[1];
        if (!wipe || !trig) return;
        gsap.to(wipe, { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: { trigger: trig, start: portrait ? "top 0" : "top 100%", end: portrait ? "bottom 100%" : "top 30%", scrub: true } });
        block.querySelectorAll(".about-article__image-item > .wf-img").forEach((img, i) => {
          gsap.to(img, { scale: 1.1, ease: "none", scrollTrigger: { trigger: wrap, start: i === 0 ? "top bottom" : "center bottom", end: i === 0 ? "center 30%" : "bottom top", scrub: 1.2 } });
        });
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      document.querySelector(".about-logo__logo").classList.add("is-visible");
    });
  };
  setup();
  mqPortrait.addEventListener("change", setup);

  // 4-cell mosaic — each cell takes its direction and reverse via data and flips every 3s over .6s
  const shows = [];
  const showcase = () => {
    shows.forEach((s) => s.destroy(true, true));
    shows.length = 0;
    document.querySelectorAll(".about-showcase__swiper").forEach((el) => {
      shows.push(new Swiper(el, {
        direction: el.dataset.direction || "horizontal",
        loop: true,
        speed: +(el.dataset.speed || 600),
        autoplay: reduce ? false : { delay: +(el.dataset.delay || 3000), reverseDirection: el.dataset.reverse === "true" },
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: false,
        touchStartPreventDefault: false,
      }));
    });
  };
  showcase();
  let w = innerWidth, t;
  addEventListener("resize", () => {
    if (innerWidth === w) return;
    w = innerWidth;
    clearTimeout(t);
    t = setTimeout(() => { setup(); showcase(); ScrollTrigger.refresh(); }, 300);
  });
});
