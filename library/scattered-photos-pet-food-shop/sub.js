// Shared by subpages. The section heading fades in (original .gsap_title opacity 0 → 1), and product detail links a Splide large photo (loop) with thumbnails (nav)
(() => {
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const title = document.querySelector(".in-pagehead h1");
  if (title) gsap.to(title, { opacity: 1, duration: REDUCE ? 0 : 0.6, ease: "none", delay: REDUCE ? 0 : 0.1 });
  const main = document.getElementById("in-main-slide"), thumbs = document.getElementById("in-thumb-slide");
  if (main && thumbs && window.Splide) {
    const m = new Splide(main, { type: "loop", arrows: true, pagination: false, speed: REDUCE ? 0 : 400 });
    const t = new Splide(thumbs, { perPage: 8, gap: 12, isNavigation: true, pagination: false, arrows: false, speed: REDUCE ? 0 : 400 });
    m.sync(t);
    m.mount();
    t.mount();
  }
})();
