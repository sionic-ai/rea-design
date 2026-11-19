// Product list (original script-snippet-product-features-carousel): once the strip comes within 200px of the screen, Swiper is set up at that point —
// Nonstop, one cell per 6s (delay 0), gap between cells 20 (56 on wide screens) and 2.2 cells (3.8 on wide screens), and the second row band flows in reverse.
(() => {
  const { NM } = window;
  const strip = ["Person sleeping under a white duvet on a bed", "Person sitting on a duvet", "Window bed and nightstand", "Painting of night sky and snow-capped mountain", "Mattress quilting close-up", "Person with their face buried in a pillow", "Pressing the mattress by hand", "Morning curtains and bedroom"];
  document.querySelectorAll(".nm-deco .swiper-wrapper").forEach((w) => (w.innerHTML = strip.map((s) => `<div class="swiper-slide"><div class="nm-ph"><div class="wf-img" data-label="${s} · Portrait 4:5"></div></div></div>`).join("")));
  const shots = ["Front", "Beside", "Above", "Corner", "Quilting", "Folded State", "Box", "Hand feel"];
  document.querySelectorAll(".ls__slider .swiper-wrapper").forEach((w, k) => (w.innerHTML = shots.map((s) => `<div class="swiper-slide"><div class="nm-ph"><div class="wf-img" data-label="Product ${k + 1} ${s} Cut · square"></div></div></div>`).join("")));

  NM.page = () => {
    if (!window.Swiper) return;
    const io = new IntersectionObserver((es, ob) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      new Swiper(e.target, {
        loop: true, speed: 6000, allowTouchMove: false,
        autoplay: NM.reduced ? false : { delay: 0, reverseDirection: e.target.hasAttribute("data-reverse") },
        spaceBetween: 20, slidesPerView: 2.2, breakpoints: { 750: { spaceBetween: 56, slidesPerView: 3.8 } },
      });
      ob.unobserve(e.target);
    }), { rootMargin: "200px 0px" });
    document.querySelectorAll(".ls__slider").forEach((s) => io.observe(s));
  };
})();
