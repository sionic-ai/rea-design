(() => {
  // Six rolls roll in and stand in place: only the entrance is GSAP, interaction is CSS (.4s bouncy curve)
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(".sp-pick__row li", { xPercent: -140, rotation: -300, opacity: 0, duration: 0.85, ease: "power3.out", stagger: 0.05, delay: 0.9 });
    gsap.from(".sp-pick__title", { yPercent: 30, opacity: 0, duration: 0.7, ease: "back.out(1.9)", delay: 0.8 });
  });
})();
