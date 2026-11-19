// Subpages — the work cover follows the cursor (original data-tilting: (cursor − cell bottom-right) × .02, 150ms linear on enter · 700ms linear on leave),
// Category collapse (height 300ms cubic-bezier(0,0,.58,1)), notification tabs (only the chosen row floats up from below in 1s), work gallery (click a thumbnail and the large image swaps by overlapping)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover)").matches;

  if (!reduce && fine) document.querySelectorAll(".yg-card").forEach((card) => {
    const img = card.querySelector(".yg-card__img");
    if (!img) return;
    let rect = null;
    card.addEventListener("mouseenter", () => { rect = card.getBoundingClientRect(); img.style.transition = "transform 150ms linear"; });
    card.addEventListener("mousemove", (e) => {
      if (!rect) return;
      requestAnimationFrame(() => { img.style.transform = `translate(${(e.clientX - rect.width - rect.left) * 0.02}px, ${(e.clientY - rect.height - rect.top) * 0.02}px)`; });
    });
    card.addEventListener("mouseleave", () => { rect = null; img.style.transition = "transform 700ms linear"; requestAnimationFrame(() => { img.style.transform = "translate(0, 0)"; }); });
  });

  document.querySelectorAll("[data-accordion]").forEach((acc) => {
    const btn = acc.querySelector("button");
    btn.addEventListener("click", () => { const open = acc.classList.toggle("is-open"); btn.setAttribute("aria-expanded", String(open)); });
  });

  const rows = [...document.querySelectorAll(".yg-info__rows--all .yg-row")];
  document.querySelectorAll(".yg-tab").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll(".yg-tab").forEach((t) => t.classList.toggle("is-on", t === tab));
    const want = tab.dataset.tab, list = rows[0]?.parentElement;
    if (!list) return;
    list.style.transition = "none";
    list.style.opacity = "0";
    setTimeout(() => {
      rows.forEach((r) => { r.hidden = want !== "all" && r.querySelector(".yg-row__kind").textContent !== want; r.classList.remove("yg-list-enter"); void r.offsetWidth; if (!reduce) r.classList.add("yg-list-enter"); });
      list.style.opacity = "";
    }, 30);
  }));

  const mains = [...document.querySelectorAll(".yg-gallery__main")];
  document.querySelectorAll(".yg-thumb").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".yg-thumb").forEach((x) => x.classList.toggle("is-on", x === t));
    mains.forEach((m, i) => m.classList.toggle("is-on", i === +t.dataset.i));
  }));
})();
