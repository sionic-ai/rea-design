// Record: big title · night bars (grow from below at .02s stagger from the left, .6s power2.out) · gold-rimmed card (shared.js TT.night) · record rows
(() => {
  TT.games();
  TT.rows();
  TT.reveal();
  if (TT.reduced) return;
  const bars = document.querySelectorAll("[data-bar]");
  gsap.set(bars, { scaleY: 0 });
  ScrollTrigger.create({ trigger: "[data-chart]", start: "top 80%", once: true, onEnter: () => gsap.to(bars, { scaleY: 1, duration: 0.6, stagger: 0.02, ease: "power2.out" }) });
  TT.night();
})();
