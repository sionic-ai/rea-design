// Work list — original ProjectsArchive: the ”Find by category” curtain turns on at .2s and off at .25s, and chips turn black in .15s when pressed
(() => {
  const dlg = document.querySelector(".filter-dialog");
  if (!dlg) return;
  const fade = (from, to, ms) => dlg.animate([{ opacity: from }, { opacity: to }], { duration: ms }).finished;
  document.querySelector(".filter-open")?.addEventListener("click", () => { dlg.showModal(); fade(0, 1, 200); });
  const close = () => fade(1, 0, 250).then(() => dlg.close());
  dlg.querySelector(".filter-dialog__apply")?.addEventListener("click", close);
  dlg.querySelector(".filter-dialog__reset")?.addEventListener("click", () => dlg.querySelectorAll(".filter-btn.is-on").forEach((b) => b.classList.remove("is-on")));
  dlg.querySelectorAll(".filter-btn").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-on")));
})();
