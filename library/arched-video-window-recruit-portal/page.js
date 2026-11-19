// Corporate home — after loading finishes, one first-strip copy that fits the width swings for .4s (swing(= fades in with sine.inOut) (original jQuery fadeIn default)
(() => {
  const show = () => {
    const el = document.querySelector(innerWidth <= 768 ? ".pg-mv__copy.is-sp" : ".pg-mv__copy.is-pc");
    if (!el) return;
    el.style.display = "block";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.inOut" });
  };
  if (document.readyState === "complete") show(); else addEventListener("load", show, { once: true });
})();
