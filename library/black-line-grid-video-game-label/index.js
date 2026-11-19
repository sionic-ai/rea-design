// As in the original, play the second video when the loader starts to lift (1s after load) — veil-fade-loader fires fx:play
document.addEventListener("fx:play", () => {
  ["pl-top-video", "pl-top-video-sp"].forEach((id) => document.getElementById(id)?.play().catch(() => {}));
});
