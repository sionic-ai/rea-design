// Home page — original Hero variant sequence: initial → after 1.5s a slight pulse (button 1.035x, .3s tween) → after .4s default (1x, stiffness 400 · damping 60 spring).
// The pulse runs on the --pulse variable — if GSAP touches scale directly it erases the CSS hover scale(1.06)
(() => {
  if (!window.gsap) return;
  const pill = document.querySelector(".gu-pill");
  if (!pill) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ delay: 1.5 });
    tl.fromTo(pill, { "--pulse": 1 }, { "--pulse": 1.035, duration: 0.3, ease: window.CustomEase ? "gu-tween" : "sine.inOut" })
      .to(pill, { "--pulse": 1, duration: 0.9, ease: window.CustomEase ? "gu-stiff" : "power3.out" }, 0.4);
    return () => tl.kill();
  });
})();
