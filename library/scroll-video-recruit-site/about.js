// The road so far: era tabs stick below the header row and follow to the timeline end, and the tab of the era straddling screen center lights orange.
// The last sentence stays pinned while the sky photo passes. Original history.js — tab: top top+=From head height to timeline bottom bottom ·
// On: period box top center ~ bottom center (when entering and returning) · closing sentence: PC top top ~ photo bottom bottom+=10%, phone top top+=Head ~ bottom bottom-=5%
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const head = () => document.querySelector(".w-head")?.offsetHeight || 0;
  const nav = document.querySelector(".his-nav");
  const main = document.querySelector(".his-main");
  const links = [...document.querySelectorAll(".his-nav__link")];
  if (nav && main) {
    ScrollTrigger.create({ trigger: nav, start: () => `top top+=${head()}`, endTrigger: main, end: "bottom bottom", pin: true, invalidateOnRefresh: true });
  }
  const light = (id) => links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  document.querySelectorAll(".his-year[id]").forEach((box) => {
    ScrollTrigger.create({ trigger: box, start: "top center", end: "bottom center", onEnter: () => light(box.id), onEnterBack: () => light(box.id) });
  });
  const txt = document.querySelector("[data-foot-txt]");
  const img = document.querySelector("[data-foot-img]");
  if (txt && img) {
    const mm = gsap.matchMedia();
    mm.add("(max-width: 896px)", () => {
      ScrollTrigger.create({ trigger: txt, start: () => `top top+=${head()}`, endTrigger: img, end: "bottom bottom-=5%", pin: true, pinSpacing: false, invalidateOnRefresh: true });
    });
    mm.add("(min-width: 897px)", () => {
      ScrollTrigger.create({ trigger: txt, start: "top top", endTrigger: img, end: "bottom bottom+=10%", pin: true, pinSpacing: false });
    });
  }
})();
