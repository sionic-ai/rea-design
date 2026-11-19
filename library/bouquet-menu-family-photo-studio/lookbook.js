// Gallery — index buttons scroll smoothly to that section, and when 40% of a section is visible its button lights up (original IntersectionObserver threshold .4)
(() => {
  const tabs = [...document.querySelectorAll(".sv-tab")];
  const secs = tabs.map((t) => document.querySelector(t.dataset.target)).filter(Boolean);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = (i) => tabs.forEach((t, j) => t.classList.toggle("is-active", i === j));
  tabs.forEach((t, i) => t.addEventListener("click", (e) => {
    e.preventDefault();
    secs[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    on(i);
  }));
  const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) on(secs.indexOf(en.target)); }), { threshold: 0.4 });
  secs.forEach((s) => io.observe(s));
})();
