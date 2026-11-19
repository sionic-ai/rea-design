/* One work — the header table rises late, and on a pinned stage at the end of the text section green light fills up from below with scroll */
TB.page("detail", (S, root) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cl = (v) => Math.max(0, Math.min(1, v));
  S.ready(() => root.querySelectorAll(".tb-in").forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : +(el.dataset.delay || 0), ease: "power2.out" })));
  root.querySelectorAll(".td-stat, .td-step, .td-feat, .td-shot").forEach((el) => {
    if (reduce) return;
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  const glow = root.querySelector(".td-body__sticky");
  if (!glow) return;
  if (reduce) return void glow.style.setProperty("--fx-reveal", "0.55");
  ScrollTrigger.create({ trigger: ".td-body__stage", start: "top bottom", end: "bottom bottom", scrub: true, onUpdate: (s) => glow.style.setProperty("--fx-reveal", (0.55 * cl(s.progress)).toFixed(3)) });
});
