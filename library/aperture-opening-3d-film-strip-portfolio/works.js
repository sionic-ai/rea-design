/* Contact sheet: cells drop in from the top in order (1.4s expo.out, .06s per row), wheel and drag roll it up and down (.0022). Pressing a cell triggers a color ripple · small ripples */
(() => {
  const app = document.querySelector(".hc-app");
  if (!app || !window.THREE) { hc.loader(); return; }
  const sheet = hcStrip.create(app, { mode: "sheet", count: 52, photos: 13, focus: false });
  hc.loader(() => sheet.intro());
})();
