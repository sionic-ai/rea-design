// Photo lookbook: the row goes 0→1 as it enters from the bottom of the screen (scrub 1, first 1/1.2 range), and when leaving upward goes 1→0 with the row fixed (no gaps)
window.yf.scene((mm) => {
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".yf-sg__row").forEach((row) => {
      const imgs = row.querySelectorAll(".yf-sg__img");
      if (!imgs.length) return;
      gsap.timeline({ scrollTrigger: { trigger: row, start: "top bottom", end: "bottom bottom-=10%", scrub: 1 } })
        .fromTo(imgs, { scale: 0 }, { scale: 1, duration: 1 / 1.2, ease: "none" })
        .to({}, { duration: 1 - 1 / 1.2 });
      gsap.fromTo(imgs, { scale: 1 }, { scale: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: row, start: "top top", end: "bottom top", pin: true, pinSpacing: false, scrub: 1 } });
    });
  });
});

// Mood button: switches the panel color between cream ↔ ink + lime
(() => {
  const btn = document.querySelector(".yf-mood");
  const main = document.querySelector(".yf-sub--photo");
  btn?.addEventListener("click", () => {
    const alt = main.dataset.mood !== "alt";
    main.dataset.mood = alt ? "alt" : "default";
    btn.setAttribute("aria-pressed", alt);
  });
})();
