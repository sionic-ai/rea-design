// Like the original, the hero video plays the landscape version on wide screens (1024px and up) and the portrait version below that. It swaps when the window width crosses the threshold.
(() => {
  const video = document.querySelector(".bu-hero__video");
  const wide = matchMedia("(min-width: 1024px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const pick = () => {
    if (!video) return;
    const src = wide.matches ? video.dataset.wide : video.dataset.tall;
    if (video.getAttribute("src") !== src) video.src = src;
  };
  pick();
  wide.addEventListener("change", pick);
  // With reduced motion, set auto-playing videos (hero, part cards) to the first scene
  if (reduce.matches) for (const v of document.querySelectorAll("video[autoplay]")) { v.autoplay = false; v.pause(); }
})();
