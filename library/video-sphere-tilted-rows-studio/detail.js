// Work detail: sound pill — the original shows ‹Sound on› when muted (can be turned on) and ‹Sound off› when on. Since this is a placeholder video, only the text flips.
(() => {
  document.querySelectorAll("[data-sound]").forEach((b) => {
    let muted = true;
    b.addEventListener("click", () => {
      muted = !muted;
      b.textContent = "Sound " + (muted ? "on" : "off");
      b.setAttribute("aria-pressed", String(!muted));
    });
  });
})();
