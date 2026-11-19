// Donation page — the round fund logo makes one full turn while passing through the section (same curve as the donation section on the first page)
(() => {
  if (!window.gsap || window.RC.reduce) return;
  const io = window.CustomEase ? CustomEase.create("rc-wf-io", "0.42,0,0.58,1") : "power1.inOut";
  gsap.to(".rc-fund__logo", { rotate: 360, ease: io, scrollTrigger: { trigger: ".rc-fund", start: "top bottom", end: "bottom top", scrub: 0.5 } });
})();
