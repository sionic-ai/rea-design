// Contact — only the hero title letter reveal hangs on the first reveal, the rest use the shared reveal (once when visible)
(() => {
  const EG = window.EG;
  const head = EG.charReveal(document.querySelector(".eg-contact__title"));
  EG.onIntro(() => (matchMedia("(prefers-reduced-motion: reduce)").matches ? head.progress(1) : head.play()));
})();
