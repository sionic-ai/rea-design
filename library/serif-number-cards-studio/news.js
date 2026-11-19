// Post list: when a row enters the screen it rises from 24px below in .4s (back.out instead of the Framer entrance spring)
(() => {
  if (window.DS.reduced) return;
  gsap.utils.toArray(".jr").forEach((r) => gsap.from(r, { y: 24, opacity: 0, duration: 0.4, ease: "back.out(1.2)", scrollTrigger: { trigger: r, start: "top 95%", once: true } }));
})();
