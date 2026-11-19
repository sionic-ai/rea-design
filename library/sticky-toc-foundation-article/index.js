// Photo enlargement (shares one Bootstrap modal) and in-place video playback
(() => {
  const modal = document.getElementById("mf-photo");
  if (modal) {
    const body = modal.querySelector(".modal-body");
    const caption = modal.querySelector(".modal-caption");
    // The original has one modal per photo — opening look and values are the same, the markup is reduced to one
    modal.addEventListener("show.bs.modal", (e) => {
      const fig = e.relatedTarget;
      const art = fig?.firstElementChild;
      body.replaceChildren();
      if (art) {
        const copy = art.cloneNode(true);
        copy.removeAttribute("id");
        body.append(copy);
      }
      caption.textContent = fig?.dataset.caption || "";
    });
    modal.addEventListener("hidden.bs.modal", () => body.replaceChildren());

    document.querySelectorAll('.mf-fig[data-bs-toggle="modal"]').forEach((fig) => {
      fig.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        fig.click();
      });
    });
  }

  const movie = document.querySelector(".mf-movie");
  const cover = movie?.querySelector(".mf-movie__cover");
  const video = movie?.querySelector(".mf-movie__video");
  if (movie && cover && video) {
    cover.addEventListener("click", () => {
      video.hidden = false;
      movie.classList.add("is-playing");
      video.play().catch(() => {});
      video.focus({ preventScroll: true });
    });
  }
})();
