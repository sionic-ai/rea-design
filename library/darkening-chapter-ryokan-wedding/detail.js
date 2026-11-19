// Click a photo group to open it large with PhotoSwipe 5.4.1 — original options kept (loop off, first-slide preload off, no open/close animation).
// Instead of the original photo files, draws placeholder images of the same ratio on a canvas and passes them in. Colors are read from skin variables.
(() => {
  const items = [...document.querySelectorAll(".nm-det__item")];
  if (!items.length || typeof PhotoSwipeLightbox === "undefined") return;
  const css = getComputedStyle(document.documentElement);
  const paint = (a) => {
    const w = +a.dataset.w / 2, h = +a.dataset.h / 2;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = css.getPropertyValue(`--site-ph-${a.dataset.tone || "warm"}`).trim() || css.getPropertyValue("--kf-raised").trim();
    g.fillRect(0, 0, w, h);
    g.strokeStyle = css.getPropertyValue("--kf-line").trim();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = css.getPropertyValue("--kf-ink").trim();
    g.font = "16px " + css.getPropertyValue("--kf-font-sans").trim(); g.textAlign = "center";
    g.fillText(a.querySelector("[data-label]")?.dataset.label || "", w / 2, h / 2);
    a.href = c.toDataURL("image/png");
    a.dataset.pswpWidth = w; a.dataset.pswpHeight = h;
  };
  items.forEach(paint);
  const lightbox = new PhotoSwipeLightbox({
    gallery: ".nm-det__gal",
    children: ".nm-det__item",
    loop: false,
    preloadFirstSlide: false,
    showHideAnimationType: "none",
    closeTitle: "Close",
    zoomTitle: "Zoom in",
    arrowPrevTitle: "Previous photo",
    arrowNextTitle: "Next photo",
    errorMsg: "Failed to load the photo",
    pswpModule: PhotoSwipe,
  });
  lightbox.on("openingAnimationEnd", () => setTimeout(() => document.body.classList.add("pswp_img_show"), 50));
  lightbox.on("close", () => document.body.classList.remove("pswp_img_show"));
  lightbox.init();
})();
