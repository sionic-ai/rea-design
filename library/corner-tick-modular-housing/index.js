/* Front page: opening a series box crossfades the background photo to that series, and pressing a closing room name changes the photo (.65s) */
(() => {
  document.addEventListener("tk:built", () => {
    const bgs = [...document.querySelectorAll(".tk-series__bgs .wf-img")];
    const accs = [...document.querySelectorAll(".tk-series__box .tk-acc")];
    accs.forEach((a, i) => a.querySelector(".tk-acc__btn").addEventListener("click", () => {
      const on = accs.findIndex((x) => x.classList.contains("is-open"));
      bgs.forEach((b, k) => b.classList.toggle("is-active", k === (on < 0 ? i : on)));
    }));
  });
  const fin = document.querySelector("[data-finish]");
  fin.querySelectorAll("[data-spot]").forEach((b) => b.addEventListener("click", () => {
    const card = fin.querySelector(`[data-spot-card="${b.dataset.spot}"]`), on = !b.classList.contains("is-on");
    fin.querySelectorAll("[data-spot]").forEach((x) => x.classList.remove("is-on"));
    fin.querySelectorAll("[data-spot-card]").forEach((x) => x.classList.remove("is-on"));
    b.classList.toggle("is-on", on); card.classList.toggle("is-on", on);
  }));
})();
