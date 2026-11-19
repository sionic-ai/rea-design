// Subpage shared — when an open-spot row expands, its height opens in .52s, and the quote vertical line uses the line drawing in shared.js
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".nk-role").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".nk-role__body");
    sum.addEventListener("click", (e) => {
      if (reduce || !window.gsap) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.52, ease: window.nkEase, onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height,opacity" }); window.ScrollTrigger?.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.52, ease: window.nkEase, onComplete: () => window.ScrollTrigger?.refresh() });
      }
    });
  });
})();
