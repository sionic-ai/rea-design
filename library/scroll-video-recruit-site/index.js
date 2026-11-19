// First page: black veil on and off after the greeting, ‹SCROLL TO CONTENTS› removed, white backdrop laid behind the hero, guide ribbon tab pinned.
// Original top.js — curtain: .mv__txt top bottom-=20% ~ bottom center-=On for 20% · scroll marker: drops out at hero bottom bottom (phone top top)
// White background: About section top center+=25% (phone top center-=10%) onward · Tap: top top+=From head height to card end bottom top+=(Header + Tabs)
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const veil = document.querySelector("[data-veil]");
  const txt = document.querySelector(".mv__txt");
  const body = document.querySelector(".mv__body");
  const cue = document.querySelector(".scrollcue");
  const bg = document.querySelector("[data-top-bg]");
  const about = document.querySelector(".about");
  const head = () => document.querySelector(".w-head")?.offsetHeight || 0;
  const narrow = () => innerWidth <= 896;

  if (veil && txt) {
    ScrollTrigger.create({ trigger: txt, start: "top 80%", end: "bottom 30%", toggleClass: { targets: veil, className: "is-show" } });
  }
  if (cue && body) {
    ScrollTrigger.create({ trigger: body, start: () => (narrow() ? "top top" : "bottom bottom"), end: "+=100%", invalidateOnRefresh: true, onEnter: () => cue.classList.add("is-hide"), onLeaveBack: () => cue.classList.remove("is-hide") });
  }
  if (bg && about) {
    ScrollTrigger.create({ trigger: about, start: () => (narrow() ? "top 40%" : "top 75%"), end: "+=5000%", invalidateOnRefresh: true, toggleClass: { targets: bg, className: "is-show" } });
  }
  document.querySelectorAll("[data-guide]").forEach((outer) => {
    const tag = outer.querySelector("[data-tag]");
    if (!tag) return;
    ScrollTrigger.create({
      trigger: tag, start: () => `top top+=${head()}`, endTrigger: outer, end: () => `bottom top+=${head() + tag.offsetHeight}`,
      pin: true, pinSpacing: false, invalidateOnRefresh: true,
    });
  });
})();
