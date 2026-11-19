/* Raccoon transmission — body panel .5s → title letters .1s apart .35s → face eyes .5s → speech bubble steps(3) in the spot cleared for it */
(() => {
  if (!window.gsap) return;
  document.addEventListener("DOMContentLoaded", () => {
    const t = new SplitText(".js-fv-title", { type: "chars", charsClass: "cChar" });
    const eye = document.querySelector(".js-fv-logo-eye"), bubble = document.querySelector(".js-fv-fukidashi");
    if (Tanu.reduce) { gsap.set([".js-page", ...t.chars, eye, bubble], { opacity: 1 }); return; }
    gsap.set(t.chars, { opacity: 0 });
    gsap.set(eye, { opacity: 0 });
    gsap.set(bubble, { x: -20, y: -15, rotation: -5, opacity: 0 });
    Tanu.fonts().then(() => {
      const tl = gsap.timeline();
      tl.to(".js-page", { opacity: 1, duration: 0.5, ease: "sine.out" })
        .to(t.chars, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" })
        .to(eye, { opacity: 1, duration: 0.5, ease: "power4.out" }, "<")
        .to(bubble, { opacity: 1, duration: 0.2, ease: "none" })
        .to(bubble, { x: 0, y: 0, rotation: 0, duration: 0.35, ease: "steps(3)" }, "<");
      Tanu.registerEntrance?.(tl);
    });
    Tanu.tegaki();
  });
})();
