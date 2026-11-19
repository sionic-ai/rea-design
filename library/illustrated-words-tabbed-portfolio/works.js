// Thumbnail video restarts from the beginning on each hover and stops on leave — it covers only after it has actually started playing so an empty panel doesn’t flash
document.addEventListener("DOMContentLoaded", () => {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  for (const card of document.querySelectorAll(".g-card")) {
    const video = card.querySelector(".g-card__clip video");
    if (!video) continue;
    const clip = video.parentElement;
    video.addEventListener("playing", () => clip.classList.add("shown"));
    video.addEventListener("pause", () => clip.classList.remove("shown"));
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch" || still.matches) return;
      video.currentTime = 0;
      video.play().catch(() => {});
    });
    card.addEventListener("pointerleave", () => video.pause());
  }
});
