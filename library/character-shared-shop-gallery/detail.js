// Product detail: the thumbnail strip is a window showing only three photos like the original — if the chosen photo is outside the window, shift the window and redraw the strip.
// The big photo switches instantly as in the original (no fade), and arrows wrap from end to start and from start to end
(() => {
  const main = document.querySelector("[data-main-img]");
  const list = document.querySelector("[data-thumbs]");
  const photos = list.dataset.photos.trim().split("\n").map((l) => l.split("|"));
  const WIN = 3;
  let at = 0, from = 0;
  const draw = () => {
    list.innerHTML = photos.slice(from, from + WIN).map(([label, short], k) =>
      `<button class="dt-gallery__thumb${from + k === at ? " is-active" : ""}" type="button" data-i="${from + k}" aria-label="${short}"><span class="wf-img" data-label="${short}"></span></button>`).join("");
  };
  const show = (i) => {
    at = (i + photos.length) % photos.length;
    main.dataset.label = photos[at][0];
    if (at < from || at >= from + WIN) { from = Math.min(Math.max(0, at - (at >= from + WIN ? WIN - 1 : 0)), photos.length - WIN); draw(); return; }
    list.querySelectorAll(".dt-gallery__thumb").forEach((t) => t.classList.toggle("is-active", +t.dataset.i === at));
  };
  draw();
  list.addEventListener("click", (e) => { const t = e.target.closest("[data-i]"); if (t) show(+t.dataset.i); });
  document.querySelector("[data-thumb-prev]").addEventListener("click", () => show(at - 1));
  document.querySelector("[data-thumb-next]").addEventListener("click", () => show(at + 1));
})();
