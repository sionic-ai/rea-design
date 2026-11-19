// About shape-character strip — original MotionsSlide: once all six are loaded, after .1s they roll in at .6 → 1x in 4 steps (.4s), and .8s after four stand, Lottie runs.
// The strip is react-fast-marquee speed 40: the distance one set (minimum strip width) travels = One set width ÷ 40px/s (51.84s at the original 1440 = 24vw × 6 ÷ 40)
(() => {
  const band = document.querySelector(".ab-band");
  if (!band || !window.ID?.rollIn) return;
  const stage = window.ID.rollIn([...band.querySelectorAll("[data-shape]")], {
    onRolled: (n) => n === 4 && setTimeout(() => stage.enable(), 800),
  });
  const run = band.querySelector(".ab-band__run"), track = band.querySelector(".ab-band__track");
  const dur = () => run.style.setProperty("--dur", `${track.offsetWidth / 40}s`);
  new ResizeObserver(dur).observe(run);
  dur();
})();
