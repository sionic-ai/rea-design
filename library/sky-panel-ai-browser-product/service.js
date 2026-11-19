// Feature intro — use-case cards and the benchmark motion ship with index.js. The cursor in the depth mode menu repeatedly picks the fourth row
(() => {
  const c = document.querySelector(".as-ultra .as-cursor");
  if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true })
    .fromTo(c, { x: 50, y: -90 }, { x: 0, y: 0, duration: 1, ease: "power2.inOut" })
    .to(c, { scale: 0.85, duration: 0.13, ease: "power1.out", yoyo: true, repeat: 1 })
    .to(c, { x: 50, y: -90, duration: 1, ease: "power2.inOut" }, "+=0.8");
  ScrollTrigger.create({ trigger: c.closest(".as-ultra__art"), start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
})();
