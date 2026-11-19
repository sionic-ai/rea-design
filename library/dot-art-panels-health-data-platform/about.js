// About — dot grid over the video card (square-dot panel bright in the center), pressing opens the video spot with GLightbox (same library, same settings as the original)
(() => {
  const cv = document.querySelector("[data-dot-grid]");
  const draw = () => {
    if (!cv) return;
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    cv.width = r.width * d; cv.height = r.height * d;
    const ctx = cv.getContext("2d");
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-bg");
    const gx = r.width / 15, gy = r.height / 9;
    for (let i = 4; i < 12; i++) for (let j = 2; j < 8; j++) {
      const fall = 1 - Math.hypot((i - 7.5) / 4.5, (j - 4.5) / 3.5);
      ctx.globalAlpha = Math.max(0.15, Math.min(0.9, fall + 0.25));
      ctx.fillRect(i * gx, j * gy, 3, 3);
    }
  };
  draw();
  addEventListener("resize", draw);

  // Original [lightbox="comp"]: touchNavigation·loop·autoplayVideos true, selector .lightbox
  const link = document.querySelector("[data-lightbox]");
  if (link && typeof GLightbox !== "undefined") {
    link.classList.add("glightbox");
    GLightbox({ selector: ".glightbox", touchNavigation: true, loop: true, autoplayVideos: true });
  }
})();
