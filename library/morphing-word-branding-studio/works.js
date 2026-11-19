// Category filter — keep only the chosen category and switch to a two-column grid. ?filter in the URL= Leave it in
(() => {
  const btns = document.querySelectorAll("[data-filter]"), wrap = document.querySelector("[data-bento]"), empty = document.querySelector("[data-empty]"), items = document.querySelectorAll("[data-bento] [data-tags]");
  const pick = (f) => {
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
    let n = 0;
    items.forEach((it) => { const on = f === "all" || (it.dataset.tags || "").split(" ").includes(f); it.hidden = !on; if (on) n++; });
    wrap?.classList.toggle("is-filtered", f !== "all");
    if (empty) empty.hidden = n > 0;
    const u = new URL(location.href);
    f === "all" ? u.searchParams.delete("filter") : u.searchParams.set("filter", f);
    history.replaceState(null, "", u);
  };
  btns.forEach((b) => b.addEventListener("click", () => pick(b.dataset.filter || "all")));
  document.querySelector("[data-reset]")?.addEventListener("click", () => pick("all"));
  const q = new URLSearchParams(location.search).get("filter");
  if (q && [...btns].some((b) => b.dataset.filter === q)) pick(q);
})();
