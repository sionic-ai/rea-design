// First page: window Hero. Progress of a two-screen-height block (0 when its top touches the screen bottom, 1 when its bottom passes the screen top)
// Passing it as --progress, CSS grows the window and darkens it over the .35→.65 range. Four photos crossfade for 1.8s every 4s starting after 8 seconds.
(() => {
  const mv = document.querySelector(".i-mv");
  if (!mv) return;

  ScrollTrigger.create({
    trigger: mv,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => mv.style.setProperty("--progress", self.progress.toFixed(4)),
    onRefresh: (self) => mv.style.setProperty("--progress", self.progress.toFixed(4)),
  });

  const slides = [...mv.querySelectorAll(".i-mv__slides li")];
  if (brand.reduce || slides.length < 2) return;
  let index = 0, visible = true;
  const next = () => {
    if (!visible) return;
    slides[index].classList.remove("is-active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("is-active");
  };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(mv);
  setTimeout(() => { next(); setInterval(next, 4000); }, 8000);
})();
