// First page: blob edge filtering and the Splide gallery. Stickers·word sets·speech bubbles·the bottom-pinned panel are driven by parts (sticker-pop-reveal · random-pop-stagger · bottom-pin-cover).
// Original gallery: loop · autoplay 4000 · speed 2000 · perPage 2 · focus left · padding 8rem/10em (750 or less: 1 slide centered, 6rem)
(() => {
  // Filter that blurs the stain edges like watercolor — slot for the original stain image
  document.body.insertAdjacentHTML("beforeend", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="ss-water"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter></svg>');
  const gal = document.querySelector(".hm-gal__slider");
  if (gal && window.Splide) {
    new Splide(gal, {
      type: "loop",
      autoplay: true,
      interval: 4000,
      speed: 2000,
      perPage: 2,
      focus: "left",
      updateOnMove: true,
      drag: false,
      arrows: false,
      pagination: false,
      pauseOnHover: false,
      pauseOnFocus: false,
      padding: { left: "8rem", right: "10em" },
      breakpoints: { 750: { perPage: 1, focus: "center", padding: "6rem" } },
    }).mount();
  }
})();
