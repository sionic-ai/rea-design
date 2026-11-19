// Hero photo crossfade — original homeFunc: first slide on at window load, next slide every 10s. The active slide gets is-act (1.4→1.25x · opaque, 2s),
// The section turning off gets is-act + is-out (fades to transparent in place over 2s), and sections that turned off earlier have all marks removed and return to 1.4x without a transition.
(() => {
  const slides = [...document.querySelectorAll(".np-movie .np-slide")];
  if (!slides.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EVERY = 10000;
  let n = 0, timer = 0;

  const next = () => {
    slides.forEach((s) => s.classList.contains("is-out") && s.classList.remove("is-act", "is-out"));
    slides[n].classList.add("is-out");
    n = (n + 1) % slides.length;
    slides[n].classList.add("is-act");
    timer = setTimeout(next, EVERY);
  };
  const start = () => {
    slides[0].classList.add("is-act");
    if (!reduce) timer = setTimeout(next, EVERY);
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
  addEventListener("pagehide", () => clearTimeout(timer));
})();
