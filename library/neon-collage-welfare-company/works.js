// Creative work — photo strip above (slick continuous flow: 10s linear · no pause · three cells, one on phone), swapping the pinned photo (when a text paragraph is half in view, it crossfades in .35s)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.jQuery && jQuery.fn.slick) jQuery(".creative-slider").slick({ speed: reduce ? 0 : 10000, autoplay: !reduce, autoplaySpeed: 0, cssEase: "linear", infinite: true, slidesToShow: 3, slidesToScroll: 1, arrows: false, dots: false, pauseOnHover: false, pauseOnFocus: false, responsive: [{ breakpoint: 641, settings: { slidesToShow: 1 } }] });
  document.querySelectorAll(".col__grid").forEach((grid) => {
    const cur = grid.querySelector(".g-cur"), next = grid.querySelector(".g-next");
    const boxes = grid.querySelectorAll(".text-box[data-img]");
    if (!cur || !next || !boxes.length) return;
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const label = en.target.dataset.img;
      if (cur.dataset.label === label) return;
      next.dataset.label = label;
      next.style.opacity = 1;
      setTimeout(() => { cur.dataset.label = label; next.style.opacity = 0; }, 350);
    }), { threshold: 0.5 });
    boxes.forEach((b) => io.observe(b));
  });
})();
