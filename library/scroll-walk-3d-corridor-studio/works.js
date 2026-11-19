// Work list — when a card reaches 90% down the screen it rises from 40px below in 1.1s (original lerp .09, Lenis is body data-lerp).
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cards = document.querySelectorAll(".ap-project");
  gsap.set(cards, { y: 40, opacity: 0 });
  window.AP.whenReady(() => ScrollTrigger.batch(cards, {
    start: "top 90%", once: true,
    onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.08 }),
  }));
})();
