// Work detail: once the document is fully open, the name tag on the hero photo rises from 160% below in .3s and fades in over .2s (project-title-load-in)
(() => {
  const { E } = window.msMotion;
  const tag = document.querySelector(".ms-dhero__name");
  if (!tag) return;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(tag, { yPercent: 160, opacity: 0 });
    const play = () => gsap.timeline()
      .to(tag, { yPercent: 0, duration: 0.3, ease: E.outQuad }, 0)
      .to(tag, { opacity: 1, duration: 0.2, ease: E.outQuad }, 0);
    if (document.readyState === "complete") play(); else addEventListener("load", play, { once: true });
  });
})();
