(() => {
  // Page header: the title rises from below and a sky-blue underline spreads from the center (original is-tween, .3s · delayed .25s)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = [...document.querySelectorAll("[data-tween]")];
  if (reduce) els.forEach((el) => el.classList.add("is-in"));
  else requestAnimationFrame(() => requestAnimationFrame(() => els.forEach((el) => el.classList.add("is-in"))));
  // Back-to-top button at the end of the text: 1s expo.inOut
  document.querySelectorAll("[data-pagetop-local]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (reduce || !window.ScrollToPlugin) { scrollTo(0, 0); return; }
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, { duration: 1, ease: "expo.inOut", scrollTo: { y: 0, autoKill: false } });
  }));
})();
