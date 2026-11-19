/* Work log — body panel lifts in .5s and title letters light up at .1s intervals, a brush pass reveals the photo, the field picker changes only the chosen dot */
(() => {
  if (!window.gsap) return;
  document.addEventListener("DOMContentLoaded", () => {
    const t = new SplitText(".js-fv-title", { type: "chars", charsClass: "cChar" });
    if (Tanu.reduce) { gsap.set([".js-page", ...t.chars], { opacity: 1 }); return; }
    Tanu.fonts().then(() => {
      const tl = gsap.timeline();
      tl.to(".js-page", { opacity: 1, duration: 0.5, ease: "sine.out" })
        .to(t.chars, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" });
      Tanu.registerEntrance?.(tl);
    });
    Tanu.reveal();
  });
})();
