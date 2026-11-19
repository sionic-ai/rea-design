// Draw product cell groups and the maker list as placeholders — data-grid="Group name:cell count|…", data-names="Line Count"
(() => {
  const looks = ["Part cutout on a gray background", "Part seen from above at an angle", "Bundle of two or three parts", "Small Metal Part"];
  document.querySelectorAll("[data-grid]").forEach((box) => {
    box.outerHTML = box.dataset.grid.split("|").map((g, gi, all) => {
      const [name, n] = g.split(":");
      return `<div class="pr-stock${gi === all.length - 1 ? " is-last" : ""}"><h3 class="pr-stock__hl">${name}</h3><div class="pr-stock__list">${Array.from({ length: +n }, (_, i) => `<div class="pr-stock__item"><div class="pr-stock__img tk-ph wf-img" data-label="${looks[(gi + i) % looks.length]} · 4:3"></div><p class="pr-stock__ttl">Product name ${String(i + 1).padStart(2, "0")}</p></div>`).join("")}</div></div>`;
    }).join("");
  });
  document.querySelectorAll("[data-names]").forEach((ul) => {
    const en = ul.classList.contains("is-en");
    ul.innerHTML = Array.from({ length: +ul.dataset.names }, (_, i) => `<li>${en ? `Maker Name ${String(i + 1).padStart(2, "0")}` : `Manufacturer name ${String(i + 1).padStart(2, "0")}`}</li>`).join("") + "<li>Others…</li>";
  });
})();
