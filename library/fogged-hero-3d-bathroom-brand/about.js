// About only. Original values: photo scale 1.08 · yPercent −2→6 scrub (top bottom→bottom top) · header photo 1.15→1 1.2s power3.out ·
// text line opacity .33→1 scrub, .1 stagger per line (top 80%→bottom 40%) · memo y24 1s power2.out · person line y24 .8s power2.out .15 stagger · column horizontal push scrub
(() => {
  const { reduced } = window.FL;
  if (reduced) return;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-par]").forEach((box) => {
      const inner = box.querySelector("[data-par-in]");
      gsap.fromTo(inner, { scale: 1.08, yPercent: -2 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
    gsap.from(".ab-band", { scale: 1.15, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".ab-band", start: "top 90%", once: true } });
    gsap.fromTo(".ab-lines > span", { opacity: 0.33 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: ".ab-lines", start: "top 80%", end: "bottom 40%", scrub: true } });
    document.querySelectorAll("[data-note]").forEach((n) => gsap.fromTo(n, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 85%", once: true } }));
    gsap.fromTo("[data-row]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15, scrollTrigger: { trigger: ".ab-list", start: "top 80%", once: true } });
  });
  // On phones, push the column slabs sideways with a finger (no snapping)
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
    const track = document.querySelector(".ab-range__track"), pin = document.querySelector(".ab-range__pin");
    gsap.fromTo(track, { x: 0 }, { x: () => -Math.max(0, track.scrollWidth - pin.clientWidth), ease: "none", scrollTrigger: { trigger: ".ab-range", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
  });
})();
