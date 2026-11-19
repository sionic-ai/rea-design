// Guide — on wide screens keeps the table of contents stuck until the end of the body (original legal__toc: 80px from the top, released at the body bottom)
(() => {
  const toc = document.querySelector(".gd-toc"), main = document.querySelector(".gd-main");
  const rpx = (x) => (x * document.body.clientWidth) / 1440;
  gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: toc, start: () => "top-=" + rpx(80) + " top", endTrigger: main, end: () => "bottom+=" + (innerHeight - toc.offsetHeight - rpx(80)) + " bottom", pin: true, pinType: window.scSmoother ? "transform" : "fixed", pinSpacing: false });
  });
  document.querySelectorAll(".sc-pulldown select").forEach((s) => s.addEventListener("change", () => (s.previousElementSibling.textContent = s.selectedOptions[0].textContent)));
})();
