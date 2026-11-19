// First page reveal: intro text rises line by line (when entering a band excluding the bottom 10% of the screen) in .15s steps, and the hand-drawn line is drawn .8s after that,
// When the About section is 20% visible, four hand-drawn arrows appear, and the archive when it enters the central 60% band of the screen — the exact IntersectionObserver numbers of the original top.js
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const text = document.querySelector(".about__text");
  const items = text ? [...text.querySelectorAll(":scope > .line-group, :scope > .line")] : [];
  items.forEach((item, i) => {
    const base = i * 0.15;
    const line = item.classList.contains("line") ? item : item.querySelector(".line");
    if (line) line.style.transitionDelay = `${base}s`;
    item.querySelectorAll(".scribble.draw").forEach((p) => p.style.setProperty("--draw-delay", `${base + 0.8}s`));
  });

  const about = document.querySelector(".about");
  const archive = [...document.querySelectorAll(".archive__top, .archive__content")];
  const logo = document.querySelector(".about__logo");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-show"));
    about?.classList.add("is-show");
    logo?.classList.add("is-show");
    archive.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  const once = (cls, opts) => new IntersectionObserver((entries, io) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(cls);
      io.unobserve(e.target);
    });
  }, opts);

  const lines = once("is-show", { rootMargin: "0px 0px -10% 0px", threshold: 0 });
  items.forEach((el) => lines.observe(el));
  if (logo) lines.observe(logo);
  if (about) once("is-show", { threshold: 0.2 }).observe(about);
  const arc = once("is-inview", { rootMargin: "-20% 0px", threshold: 0 });
  archive.forEach((el) => arc.observe(el));
})();
