// Clinic About — clicking a gallery photo opens a modaal photo window (click backdrop to close, vertical scrollbar hidden while open). Same as original basic.js, but shows a placeholder panel instead of a photo.
(() => {
  const { reduce } = window.kfMk;
  jQuery(".gallery").modaal({
    type: "inline",
    overlay_close: true,
    animation_speed: reduce ? 0 : 300,
    before_open: () => jQuery("html").css("overflow-y", "hidden"),
    after_close: () => jQuery("html").css("overflow-y", "scroll"),
  });
})();
