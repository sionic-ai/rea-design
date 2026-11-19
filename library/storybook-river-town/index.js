/* Hero — original opening(): when the white curtain finishes lifting (transitionend) the slide advance is turned on (autoplay after 1.5s), and once seen it is skipped via sessionStorage.
   Wheel and touch scroll are blocked until the curtain lifts. Swiper fade 1.5s · hold 2.5s, when it returns to the first slide the mascot rides on, and on the fourth it jumps in. */
(() => {
  const fv = document.querySelector(".p-top-fv");
  if (!fv || !window.Swiper) return;
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const played = !!sessionStorage.getItem("nbOpeningPlayed");
  const skip = played || reduce || !!(location.hash && document.querySelector(location.hash));
  const sprite = fv.querySelector(".p-top-fv__sprite");
  const block = (e) => e.preventDefault();

  const swiper = new Swiper(fv.querySelector(".p-top-fv__sliders"), {
    slidesPerView: 1, effect: "fade", speed: 1500, loop: false, allowTouchMove: false, fadeEffect: { crossFade: true },
    autoplay: { delay: 2500, disableOnInteraction: false },
    pagination: { el: ".p-top-fv__pagination", type: "bullets", renderBullet: (i, cls) => `<span class="${cls}"><span class="fill"></span></span>` },
    on: { init() { this.autoplay.stop(); } },
  });
  swiper.on("slideChange", () => {
    const t = swiper.realIndex;
    sprite.classList.toggle("first-active", t === 0);
    sprite.classList.toggle("last-active", t === 3);
    fv.querySelectorAll(".swiper-pagination-bullet").forEach((b, n) => {
      const fill = b.querySelector(".fill");
      b.classList.toggle("was-active", n < t);
      fill.style.animation = "none";
      if (n < t) fill.style.transform = "scaleX(1)";
      else if (n === t) { void fill.offsetWidth; fill.style.animation = "sliderPagination 4s linear forwards"; }
      else fill.style.transform = "scaleX(0)";
    });
  });

  const start = () => {
    if (!reduce) setTimeout(() => swiper.autoplay.start(), 1500);
    html.classList.add("change");
    document.removeEventListener("touchmove", block);
    document.removeEventListener("wheel", block);
  };
  if (skip) { html.classList.add("skip"); start(); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { html.classList.add("active"); io.disconnect(); } }));
  io.observe(document.body);
  document.addEventListener("touchmove", block, { passive: false });
  document.addEventListener("wheel", block, { passive: false });
  let done = false;
  fv.querySelector(".p-top-fv__chara").addEventListener("transitionend", (e) => {
    if (done || e.target !== e.currentTarget) return;
    done = true;
    start();
    sessionStorage.setItem("nbOpeningPlayed", "true");
  });
})();
