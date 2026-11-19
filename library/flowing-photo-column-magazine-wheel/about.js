// About the company — four head lines stay fixed to the screen and exit off-screen left and right alternately (expo.inOut, tied to scroll), the pledge section also stays fixed, then the title and lines float up in turn
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const words = [...document.querySelectorAll(".cm-cover__words")];
  const logo = document.querySelector(".cm-cover__logo");
  const half = () => innerWidth / 2;
  gsap.timeline({ scrollTrigger: { trigger: ".cm-cover", start: "top top", end: "+=1000", scrub: true, pin: true } })
    .to(words[0], { opacity: 0, x: () => -half(), ease: "expo.inOut" })
    .to(logo, { opacity: 0, x: () => half(), ease: "expo.inOut" }, 0.1)
    .to(words[1], { opacity: 0, x: () => -half(), ease: "expo.inOut" }, 0.2)
    .to(words[2], { opacity: 0, x: () => half(), ease: "expo.inOut" }, 0.3);
  const st = document.querySelector(".cm-statement");
  ScrollTrigger.create({ trigger: st, start: "top top", end: "+=1000", pin: true, scrub: true });
  const lines = [...st.querySelectorAll(".line")];
  gsap.set([".cm-statement .cm-section__title", ".cm-statement__title"], { opacity: 0, y: 30 });
  gsap.set(lines, { opacity: 0, y: 20 });
  gsap.timeline({ scrollTrigger: { trigger: ".cm-statement .cm-section", start: "top top+=50%" } })
    .to([".cm-statement .cm-section__title", ".cm-statement__title"], { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 })
    .to(lines, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "expo.out" }, "-=0.2");
})();
