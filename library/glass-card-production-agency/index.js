// First page — each time the hero video cut changes, the logo at bottom right switches to the next (the original moves data-active following the video timeline)
(() => {
  const brand = document.querySelector("[data-hero-brand]");
  if (!brand || window.DS.reduce) return;
  const items = [...brand.children];
  let k = 0;
  setInterval(() => {
    items[k].dataset.active = "false";
    k = (k + 1) % items.length;
    items[k].dataset.active = "true";
  }, 3200);
})();
