// On PC, the title group sticks to the top of the screen and the back-to-list button sticks to the bottom, following to the end of the body
(() => {
  const { ctx, rpx } = window.NL;
  if (ctx !== "pc") return;
  const art = document.querySelector(".nl-article");
  ScrollTrigger.create({ trigger: ".nl-article__header", start: () => "top-=" + rpx(30) + " top", endTrigger: art, end: () => "bottom-=" + rpx(30) + " bottom", pin: true, pinSpacing: false });
  ScrollTrigger.create({ trigger: ".nl-article__back", start: () => "bottom+=" + rpx(30) + " bottom", endTrigger: art, end: "bottom bottom", pin: true, pinSpacing: false });
})();
