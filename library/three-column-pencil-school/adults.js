// Photo strip — original page-working-adults: Splide loop · AutoScroll speed .5 · only while visible
(() => {
  const el = document.querySelector(".ky-ad-strip");
  if (!el || !window.Splide) return;
  const X = (window.splide && window.splide.Extensions) || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Splide(el, { type: "loop", drag: false, autoWidth: true, arrows: false, pagination: false, gap: "1.2rem", pauseOnHover: false, pauseOnFocus: false,
    autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false, pauseOnFocus: false }, intersection: { inView: { autoScroll: !reduce }, outView: { autoScroll: false } } })
    .mount({ AutoScroll: X.AutoScroll, Intersection: X.Intersection });
})();
