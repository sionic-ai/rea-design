// Case header first entrance (firstViewAnimation): the photo shrinks from 1.1x over 2 seconds, then category → client name → summary (diagonal mask, 2.5 seconds) in order.
(() => {
  const q = (k) => document.querySelector(`[data-pp-first="${k}"]`);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set([q("subTitle"), q("title"), q("text")], { opacity: 1, maskPosition: "0%" });
    gsap.set(q("image"), { scale: 1 });
    return;
  }
  // As in the original, it starts after window load (EventController.waitLoad)
  window.ppShared.loaded.then(() => gsap.timeline()
    .to(q("image"), { duration: 2, scale: 1 })
    .to(q("subTitle"), { opacity: 1, duration: 1 })
    .to(q("title"), { opacity: 1, duration: 1 })
    .to(q("text"), { opacity: 1, duration: 2.5, maskPosition: "0%", webkitMaskPosition: "0%" }));
})();
