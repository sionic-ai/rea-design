// Header video — first a still image and a play button, once pressed, it plays in place along with the control bar
(() => {
  const film = document.querySelector(".bx-film");
  if (!film) return;
  const v = film.querySelector("video");
  film.querySelector(".bx-film__play").addEventListener("click", () => {
    film.classList.add("is-playing");
    v.controls = true;
    v.play().catch(() => {});
  });
})();
