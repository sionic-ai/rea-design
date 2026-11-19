// Hero — original hero_split: raises two-panel text groups with .8s power1.out, and when progress passes half turns on the neon sign
(() => {
  const hero = document.getElementById("ev-hero");
  if (!hero || !window.gsap) return;
  const text = hero.querySelectorAll(".ev-hero__text");
  const neon = hero.querySelector(".ev-hero__neon");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    let lit = false;
    gsap.timeline()
      .to(text, {
        opacity: 1, duration: 0.8, ease: "power1.out",
        onUpdate() { if (!lit && this.progress() >= 0.5) { lit = true; neon?.classList.add("is-on"); } },
      })
      .add(() => hero.classList.add("is-active"), "<+0.5");
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(text, { opacity: 1 }); neon?.classList.add("is-on"); });
})();
