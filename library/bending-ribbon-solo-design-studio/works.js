// Work list — card panels are filled with each work’s brand color, and in every row the cards rise from 18% below with a 1.2s reveal
(() => {
  const TONES = ["#d6201a", "#2f6b1f", "#1d1b2a", "#1b3d8f", "#2b1458", "#181818", "#d9b52c"]; /* Not skin: brand color (content) */
  document.querySelectorAll(".wk").forEach((w, i) => w.querySelector(".wk__frame").style.setProperty("--wk-tone", TONES[i % TONES.length]));
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const cards = gsap.utils.toArray(".wk");
    gsap.set(cards, { yPercent: 18, autoAlpha: 0 });
    const st = ScrollTrigger.batch(cards, { start: "clamp(top 85%)", once: true, onEnter: (b) => gsap.to(b, { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: "reveal", stagger: 0.08 }) });
    return () => st.forEach((s) => s.kill());
  });
  document.querySelector("[data-top]")?.addEventListener("click", (e) => { e.preventDefault(); window.mlLenis ? window.mlLenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); });
})();
