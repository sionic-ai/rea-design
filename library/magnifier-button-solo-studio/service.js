/* Service — title measuring box, line drawings stroke in over 1.1s when visible, row by row (80ms stagger) */
(() => {
  const { mm } = window.mtShared;
  document.querySelectorAll("[data-measured]").forEach((m) => {
    const h = m.querySelector("h1"), out = m.querySelector("[data-mbox-size]");
    const size = () => { if (out) out.textContent = `${Math.round(h.offsetWidth)} × ${Math.round(h.offsetHeight)}`; };
    size();
    window.addEventListener("resize", size);
    requestAnimationFrame(() => m.classList.add("is-on"));
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-sketch]").forEach((row) => {
      const lines = row.querySelectorAll(".mt-svc-icon svg *");
      gsap.fromTo(lines, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.1, stagger: 0.08, ease: "power2.inOut", scrollTrigger: { trigger: row, start: "top 80%", once: true } });
    });
  });
})();
