// Project detail — the right vertical tab sticks 20px above the screen bottom and follows, stopping at the breadcrumb below (pc)
(() => {
  const { rpx } = window.rbSite;
  const tab = document.querySelector(".rb-sticky-tab");
  const stop = document.querySelector(".rb-crumb--foot") || document.querySelector(".rb-footer");
  if (!tab || !stop) return;
  gsap.matchMedia().add("(min-width: 768px)", () => {
    ScrollTrigger.create({ trigger: tab, start: () => "bottom bottom-=" + rpx(20), endTrigger: stop, end: () => "bottom+=" + rpx(20) + " bottom", pin: true, pinSpacing: false });
  });
})();
