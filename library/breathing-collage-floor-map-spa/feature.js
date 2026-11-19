// Ski section — decoration burst (1.2s ease-out), Hero blur clears, section appears, center carousel (starts 8s autoplay when visible), color blobs drift ±20px every 4s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("(min-width: 768px)");
  gsap.registerPlugin(ScrollTrigger);

  // Decorations start at 0 scale from the center and move to their set positions over 1.2s — phone uses a screen-width ratio, 768 and up uses px
  const vw = (p) => innerWidth * (p / 100);
  const posSp = [[37.333, -45.333], [37.333, 21.333], [-38.933, -2.667], [-34.667, -42.667], [35.2, -1.333], [-28.267, 26.667], [-18.667, -13.333]];
  const posPc = [[180, -360], [420, 130], [580, -200], [-450, 130], [-310, -110], [430, -250], [-360, -340], [590, 210], [-610, 250], [-530, -180]];
  const burst = (els, pos) => els.forEach((el, i) => {
    const [x, y] = pos[i];
    const to = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`;
    if (reduce) { el.style.transform = to; el.style.opacity = 1; return; }
    el.animate([{ transform: "translate(-50%, -50%) translate(0px, 0px) scale(0)", opacity: 0 }, { transform: to, opacity: 1 }], { duration: 1200, easing: "ease-out", fill: "forwards" });
  });
  burst([...document.querySelectorAll(".js-deco-sp")], posSp.map(([x, y]) => [vw(x), vw(y)]));
  burst([...document.querySelectorAll(".js-deco-pc")], posPc);

  const hero = document.querySelector(".ft-hero");
  const reveals = document.querySelectorAll("[data-ft-reveal]");
  if (reduce) { hero.classList.add("is-shown"); reveals.forEach((el) => el.classList.add("is-shown")); }
  else gsap.matchMedia().add("all", () => {
    ScrollTrigger.create({ trigger: hero, start: "top center", once: true, onEnter: () => hero.classList.add("is-shown") });
    reveals.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-shown") }));
  });

  // Carousel — starts once half visible, then advances every 8s
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting && e.target.swiper && !e.target.dataset.started) { e.target.dataset.started = "1"; e.target.swiper.autoplay.start(); }
  }), { threshold: 0.5 });
  document.querySelectorAll(".ft-swiper").forEach((el) => {
    const s = new Swiper(el, {
      loop: true,
      speed: 500,
      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 18,
      pagination: { el: el.querySelector(".ft-swiper__pagination"), clickable: true },
      navigation: { nextEl: el.querySelector(".ft-swiper__next"), prevEl: el.querySelector(".ft-swiper__prev") },
      breakpoints: { 1024: { spaceBetween: 40 } },
      autoplay: { delay: 8000, disableOnInteraction: false },
    });
    s.autoplay.stop();
    if (!reduce) io.observe(el);
  });

  // Color blobs — every 4s to any spot within ±20px (motion is CSS transform 4s ease-in-out)
  if (!reduce) {
    const movers = document.querySelectorAll(".js-move");
    const move = () => movers.forEach((el) => {
      const r = () => Math.floor(Math.random() * 41) - 20;
      el.style.transform = `translate(${r()}px, ${r()}px)`;
    });
    setInterval(move, 4000);
  }
})();
