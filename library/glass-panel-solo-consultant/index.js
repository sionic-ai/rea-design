// Motion unique to the first page — philosophy section (original t-1022102a background -20em · IX2 a-6/a-13 text on/off)
document.addEventListener("va:ready", ({ detail: { mm } }) => {
  const phil = document.querySelector(".va-phil");
  if (!phil) return;
  mm.add({ d: "(min-width: 480px)", m: "(max-width: 479px)" }, (ctx) => {
    if (ctx.conditions.d) {
      gsap.fromTo(".va-phil__bg", { y: 0 }, { y: "-20em", ease: "none", scrollTrigger: { trigger: phil, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    }
    // Share of one post passing through the screen: 40% off → 55% on → 65% hold → 80% moves down 20em and turns off (the last post stays on, at 30em at 100%)
    phil.querySelectorAll("[data-step]").forEach((el) => {
      const last = el.dataset.step === "last";
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.closest(".va-phil__step"), start: "top bottom", end: "bottom top", scrub: true } });
      tl.set(el, { opacity: 0, y: 0 }, 0)
        .to(el, { opacity: 1, duration: 0.15, ease: "none" }, 0.4)
        .to(el, { y: last ? "30em" : "20em", duration: last ? 0.6 : 0.4, ease: "none" }, 0.4);
      if (!last) tl.to(el, { opacity: 0, duration: 0.15, ease: "none" }, 0.65).to({}, { duration: 0.2 }, 0.8);
    });
  });
});
