// Photo collection — the Hero Korean subtitle goes from blur 30px over 1s (the English gradient-sweep-title turns white from the right over 2s), and the header line turns white over the Hero,
// As each section enters, turns on its name (0% top ~ 90% center) and the background to that section’s color (top top ~ bottom top). The original’s GSAP default curve is none on this page
(() => {
  const { reduced } = window.TW;
  gsap.defaults({ ease: "none" });
  const header = document.querySelector(".tw-header");
  const kv = document.querySelector(".tw-gallery__kv");
  const ja = document.querySelector(".tw-gallery__kv-ja");
  const wrap = document.querySelector(".tw-gallery__wrap");

  if (!reduced) gsap.fromTo(ja, { filter: "blur(30px)" }, { filter: "blur(0px)", duration: 1 });

  ScrollTrigger.create({ trigger: kv, start: "0% 1%", end: "90% top", toggleClass: { targets: header, className: "is-gallery" } });
  document.querySelectorAll(".tw-gsec").forEach((sec) => {
    const cls = `is-section${sec.dataset.sectionId}`;
    ScrollTrigger.create({ trigger: sec, start: "0% top", end: "90% center", toggleClass: { targets: sec, className: "is-active" } });
    ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom top",
      onEnter: () => wrap.classList.add(cls),
      onLeave: () => wrap.classList.remove(cls),
      onEnterBack: () => wrap.classList.add(cls),
      onLeaveBack: () => wrap.classList.remove(cls),
    });
  });
})();
