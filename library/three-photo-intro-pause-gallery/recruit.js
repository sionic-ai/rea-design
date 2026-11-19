// Daily schedule — when a row head touches the screen center (forward or backward), swaps the left photo to that row’s photo in .5s (original Recruit)
(() => {
  const box = document.querySelector("[data-day-image]");
  if (!box) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const imgs = [...box.children];
  const show = (n) => imgs.forEach((im, i) => { im.classList.toggle("is-on", i === n); gsap.to(im, { opacity: i === n ? 1 : 0, duration: reduce ? 0 : 0.5, overwrite: true }); });
  document.querySelectorAll("[data-day-item]").forEach((it, i) => ScrollTrigger.create({ trigger: it, start: "top center", end: "top top", onEnter: () => show(i), onEnterBack: () => show(i) }));
  show(0);
})();
