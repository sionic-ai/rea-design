// Garden surround art — the original is a still image (garden.png), so it’s drawn with two layers of static droplets
(() => {
  document.querySelector(".ab-garden__blob").setAttribute("d", TD.blob(51, { rot: 80, stretch: 0.78, jitter: 0.12, box: [80, 90, 230, 300] }));
  document.querySelector(".ab-garden__ring").setAttribute("d", TD.blob(57, { rot: 84, stretch: 0.84, jitter: 0.07, box: [56, 40, 288, 410] }));
})();
// On reduced-motion screens, hold the video on its first frame
if (TD.reduced) document.querySelectorAll(".ab-movie").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
