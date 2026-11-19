// Career story — original CareerStoryModal: on open, the backdrop goes 0→1 (.5s linear), the panel goes .9× and transparent → 1 (.5s power2.out), and the globe drawing below makes one turn in 30s (linear, repeating).
// Close (✕, Start, backdrop) runs the same timeline in reverse and stops the rotation once fully closed. Lenis is paused while open. It reopens with the About button.
(() => {
  const modal = document.querySelector(".cs-modal");
  if (!modal || !window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spin = gsap.timeline({ repeat: -1, paused: true }).to(modal.querySelector(".cs-modal__planet .mb-d"), { rotate: 360, duration: 30, ease: "none" });
  const tl = gsap.timeline({ paused: true, onReverseComplete: () => { spin.pause(); gsap.set(modal, { pointerEvents: "none", opacity: 0 }); } })
    .set(modal, { pointerEvents: "auto", opacity: 1 })
    .from(modal.querySelector(".cs-modal__inner"), { scale: 0.9, opacity: 0, duration: 0.5, ease: "power2.out" })
    .from(modal.querySelector(".cs-modal__veil"), { opacity: 0, duration: 0.5, ease: "none" }, 0);
  const open = () => { modal.setAttribute("aria-hidden", "false"); tl.timeScale(1).play(); if (!reduce) spin.play(); window.mbLenis?.stop(); };
  const close = () => { modal.setAttribute("aria-hidden", "true"); tl.reverse(); window.mbLenis?.start(); };
  modal.querySelectorAll("[data-cs-close]").forEach((b) => b.addEventListener("click", close));
  document.querySelectorAll("[data-cs-open]").forEach((b) => b.addEventListener("click", open));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") close(); });
  if (reduce) tl.progress(1); else open();
  if (reduce) { modal.setAttribute("aria-hidden", "false"); }
})();
