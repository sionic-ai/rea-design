(() => {
  // The overlap growth and the push (% of card width) are set by the number of neighbor cards (1~4) — a table obtained by measuring a reference carousel
  const SPREAD = { 1: 2, 2: 1, 3: 0.2, 4: 0.2 }, SHIFT = { 1: 84, 2: 58, 3: 10, 4: 0 };
  kfFx.register("stack-carousel", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const md = matchMedia("(min-width: 768px)");
    const num = (k, d) => +(options[k] ?? d);
    const pick = () => ({
      step: md.matches ? num("scale-md", num("scale", 0.2)) : num("scale", 0.2),
      side: Math.max(1, Math.min(4, md.matches ? num("side-md", num("side", 2)) : num("side", 2))),
    });
    function stack({ swiper, on }) {
      on("beforeInit", () => {
        Object.assign(swiper.params, { watchSlidesProgress: true, centeredSlides: true });
        Object.assign(swiper.originalParams, { watchSlidesProgress: true, centeredSlides: true });
      });
      on("progress", () => {
        const { step, side } = pick(), n = swiper.slides.length;
        for (let i = 0; i < n; i += 1) {
          const s = swiper.slides[i], p = s.progress, a = Math.abs(p);
          const mult = a > 1 ? 0.3 * (a - 1) * SPREAD[side] + 1 : 1;
          s.style.transform = `translateX(${p * mult * SHIFT[side]}%) scale(${1 - a * step})`;
          s.style.zIndex = n - Math.abs(Math.round(p));
          s.style.opacity = a > side + 1 ? 0 : 1;
        }
      });
      on("setTransition", (_s, d) => { swiper.slides.forEach((s) => { s.style.transitionDuration = `${d}ms`; }); });
    }
    const gap = num("gap", 0), gapMd = num("gap-md", gap);
    const swiper = new Swiper(track, {
      modules: [stack],
      loop: options.loop !== "false",
      speed: reduce ? 0 : num("speed", 500),
      slidesPerView: "auto",
      grabCursor: true,
      spaceBetween: gap,
      breakpoints: { 768: { spaceBetween: gapMd } },
      navigation: part("next") && part("prev") ? { nextEl: part("next"), prevEl: part("prev") } : false,
      pagination: part("dots") ? { el: part("dots"), clickable: true } : false,
    });
    const onMq = () => swiper.update();
    md.addEventListener("change", onMq);
    return () => { md.removeEventListener("change", onMq); swiper.destroy(true, true); };
  });
})();
