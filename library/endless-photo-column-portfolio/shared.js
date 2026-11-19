// Spans multiple pages — the About curtain (header ”About”, footer on phone), the shop legal notice curtain, smooth scroll (original Lenis 1.3.8 defaults).
// Pages only swap the wrapper (vt-swap-page) so this file runs just once — interaction is delegated to the document so it reaches new wrappers too.
// The About overlay sits on a css transition like the original (.5s cubic-bezier(.4,0,.2,1)) with GSAP pushing opacity over .2s power3.out, so it fills in slightly after the press.
(() => {
  const about = () => document.querySelector("[data-about]");
  const setAbout = (open) => {
    const el = about();
    if (!el) return;
    el.classList.toggle("is-open", open);
    el.setAttribute("aria-hidden", open ? "false" : "true");
    gsap.to(el, { opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", duration: 0.2, ease: "power3.out" });
  };
  const setLegal = (key) => document.querySelectorAll("[data-legal]").forEach((p) => {
    const open = p.getAttribute("data-legal") === key;
    p.classList.toggle("is-open", open);
    p.setAttribute("aria-hidden", open ? "false" : "true");
  });
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-about-toggle]")) { setAbout(!about()?.classList.contains("is-open")); return; }
    const lo = t.closest("[data-legal-open]");
    if (lo) { setLegal(lo.getAttribute("data-legal-open")); return; }
    if (t.closest("[data-legal]")) { setLegal(null); return; }
    if (t.closest("[data-about]") && !t.closest(".cd-about__links a")) setAbout(false);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setAbout(false); setLegal(null); } });

  if (window.Lenis) {
    const lenis = new Lenis();
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
})();
