/* Service detail — sketch panel lines are drawn in order (guides → text → dots → pen), tap a question to open */
(() => {
  const { mm } = window.mtShared;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const sheet = document.querySelector("[data-sheet]");
    if (sheet) {
      const q = gsap.utils.selector(sheet);
      gsap.timeline({ delay: 0.5 })
        .from(q(".mt-sk-guide"), { drawSVG: "0% 0%", duration: 0.9, stagger: 0.12, ease: "power2.inOut" })
        .from(q(".mt-sk-mark"), { drawSVG: "0% 0%", duration: 1.2, ease: "power2.inOut" }, "-=.3")
        .from(q(".mt-sk-dot"), { scale: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(3)" }, "-=.2")
        .from(q(".mt-sk-pen"), { x: 30, y: -30, autoAlpha: 0, duration: 0.7 }, "-=.3");
    }
  });
  document.querySelectorAll("[data-faq] .mt-faq-q").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"))));
  document.querySelectorAll(".mt-places").forEach((ul) => ul.querySelectorAll(".mt-place").forEach((p) => p.addEventListener("click", () => ul.querySelectorAll(".mt-place").forEach((o) => o.classList.toggle("is-on", o === p)))));
})();
