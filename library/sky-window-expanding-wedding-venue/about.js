// About: the cover photo descends 25% slower than the scroll, and past the cover the MENU pill returns in a dark color.
// Section cover: the photo window widens from 3rem (phone 1.5rem) inside out to the edges, the inside goes 1.1→1, and the photo drops 25%.
(() => {
  const { isSP, reduced } = window.SL;
  const sp = isSP();
  const rpx = (t) => (t * window.innerWidth) / (sp ? 375 : 1440);
  const toggle = document.querySelector(".sl-menu__toggle");
  ScrollTrigger.create({
    trigger: ".sl-fcover__fv", start: "top top", end: () => `bottom top+=${rpx(42)}`,
    onLeave: () => toggle.classList.add("is-invert"), onEnterBack: () => toggle.classList.remove("is-invert"),
  });
  if (reduced) {
    document.querySelectorAll(".sl-scover__eyecatch").forEach((e) => (e.style.clipPath = "inset(0px)"));
    return;
  }
  gsap.fromTo(".sl-fcover__bg-container", { yPercent: 0 }, { yPercent: 25, ease: "none", scrollTrigger: { trigger: ".sl-fcover__bg", start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  document.querySelectorAll(".sl-scover").forEach((c) => {
    const title = c.querySelector(".sl-scover__title");
    const eye = c.querySelector(".sl-scover__eyecatch");
    const box = c.querySelector(".sl-scover__container");
    const edge = sp ? 15 : 30;
    ScrollTrigger.create({
      trigger: eye, start: () => `top+=${rpx(edge)} bottom`, endTrigger: title, end: "top top",
      onUpdate: (s) => { const e = rpx(edge * (1 - s.progress)) + "px"; eye.style.clipPath = `inset(${e} ${e} ${e} ${e})`; },
    });
    gsap.fromTo(box, { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: eye, start: "top bottom", endTrigger: title, end: "top top", scrub: true, invalidateOnRefresh: true } });
    gsap.fromTo(box.firstElementChild, { yPercent: 0 }, { yPercent: 25, ease: "none", scrollTrigger: { trigger: eye, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });
})();
