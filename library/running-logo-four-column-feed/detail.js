// Work detail — the sound button on the video cell (original ”Video Sound”: press to turn sound on or off)
(() => {
  document.querySelectorAll(".b-sound").forEach((b) => b.addEventListener("click", () => {
    const v = b.parentElement.querySelector("video");
    if (!v) return;
    const on = b.getAttribute("aria-pressed") !== "true";
    v.muted = !on;
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? "Sound Off" : "Sound On";
  }));
})();
