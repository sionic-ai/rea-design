// About reveal (original AboutReveal) — the photo opens from the bottom scaling 1.3 → 1 (1.5s expo.out), the big sentence’s words rise from 100% below (1.5s expo.out),
// Body and quote words each darken from .2 → 1 while passing 85% → 75% of the screen (scrub .3).
(() => {
  const root = document.querySelector(".mc-about");
  if (!root) return;
  document.querySelector(".mc-dial")?.dispatchEvent(new CustomEvent("fx:dial", { detail: { to: "about" } }));
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(root.querySelectorAll(".wf-img"), { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
    gsap.set(root.querySelectorAll(".word"), { opacity: 1, yPercent: 0 });
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(root.querySelectorAll(".wf-img"), { clipPath: "inset(0% 0% 100% 0%)", scale: 1.3 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.5, ease: "expo.out" });
    gsap.fromTo(root.querySelectorAll(".mc-about__lead .word"), { yPercent: 100 }, { yPercent: 0, duration: 1.5, ease: "expo.out" });
    root.querySelectorAll(".mc-about__body .word").forEach((w) => gsap.fromTo(w, { opacity: 0.2 }, { opacity: 1, scrollTrigger: { trigger: w, start: "top 85%", end: "top 75%", scrub: 0.3, invalidateOnRefresh: true } }));
  });
  document.addEventListener("fx:page-leave", () => mm.revert(), { once: true });
})();
