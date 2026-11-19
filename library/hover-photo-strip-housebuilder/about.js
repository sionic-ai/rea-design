// Concept — one build-case strip and a video window
(() => {
  document.querySelector("[data-strip-one]").innerHTML = window.nj.strip({ name: "A home that brings the garden into daily life", isNew: true, area: "Area Name", shots: [["v", "Pendant light over dining table · gray plaster wall · portrait"], ["v", "Entrance sliding door · portrait"], ["v", "Round dining table and chairs · Portrait"], ["h", "Large restaurant · gray floor · landscape"], ["v", "Kitchen cabinet · Vertical"], ["s", "Living room sofa corner · narrow portrait"], ["v", "Window chair · portrait"]] });
  const modal = document.querySelector("[data-video-modal]");
  const video = modal.querySelector("video");
  document.querySelector("[data-video-open]").addEventListener("click", () => { modal.classList.add("is-open"); video.play().catch(() => {}); });
  modal.querySelectorAll("[data-video-close]").forEach((el) => el.addEventListener("click", () => { modal.classList.remove("is-open"); video.pause(); }));
})();
