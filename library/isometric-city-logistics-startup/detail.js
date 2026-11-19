// News detail: pressing the copy-link button shows a Copied speech bubble for 1.5s, then it fades away.
(() => {
  const tip = document.querySelector(".dt__tip");
  let t;
  document.querySelector("[data-copy]").addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href).catch(() => {});
    tip.classList.add("is-on");
    clearTimeout(t);
    t = setTimeout(() => tip.classList.remove("is-on"), 1500);
  });
})();
