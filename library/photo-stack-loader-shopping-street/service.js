// Support program — the pinned finger logo is bound to scroll and fades out while the text below rises (original fv__logo 1 → 0)
(() => {
  window.siteMM.add("(prefers-reduced-motion: no-preference)", () => {
    if (!document.querySelector(".fv__logo")) return;
    gsap.fromTo(".fv__logo", { opacity: 1 }, { opacity: 0, scrollTrigger: { trigger: ".lead", start: "top 90%", end: "20% bottom", scrub: true } });
  });
})();
