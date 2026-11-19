// Next-year edition home — once all images arrive, is-anim goes on the hero (four layered images sharpen over 1.5s from 8px blur, delayed .25·.75·1.25s, the front image floats up over 1s at 1.75s, and props pop out from 1.875s at .125s intervals),
// Card · anniversary paper get is-visible when seen. The menu sticker slides to that cell in .5s power4.out (lifted 40px above)
(() => {
  const MR = window.MR;
  gsap.registerPlugin(ScrollToPlugin);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { rootMargin: "-20% 0px" });
  document.querySelectorAll(".ed-concept, .ed-anniversary, .ed-content").forEach((el) => (MR.reduce ? el.classList.add("is-visible") : io.observe(el)));
  document.querySelectorAll('.ed-nav a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    e.preventDefault();
    gsap.to(window, { duration: MR.reduce ? 0 : 0.5, scrollTo: { y: t, offsetY: 40 }, ease: "power4.out" });
  }));
  MR.loaded(() => document.querySelector(".ed-visual").classList.add("is-anim"));
})();
