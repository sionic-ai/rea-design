// About droplet — the original is a still image (concept01.webp), so use a droplet that doesn’t move
(() => {
  document.querySelector(".rc-concept__shape").setAttribute("d", TD.blob(71, { rot: -20, stretch: 0.85, jitter: 0.1, box: [0, 0, 100, 100] }));
})();
