// Comparison table rows are drawn from the group’s data-rows (Name|Price1|Price2|Price3;…”, y is the check). The monthly / yearly buttons roll the Pro price figures
(() => {
  document.querySelectorAll(".p-group[data-rows]").forEach((g) => {
    g.dataset.rows.split(";").forEach((row) => {
      const [name, ...cells] = row.split("|");
      const r = document.createElement("div");
      r.className = "p-row";
      r.innerHTML = `<span>${name}</span>${cells.map((c) => (c === "y" ? '<span><i class="yes" aria-label="Included"></i></span>' : c === "—" ? '<span class="no">—</span>' : `<span>${c}</span>`)).join("")}`;
      g.append(r);
    });
  });
  const pro = document.querySelector(".p-pro");
  document.querySelectorAll(".p-toggle button").forEach((b, _, all) => b.addEventListener("click", () => {
    all.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    if (pro) pro.dataset.value = b.dataset.period === "year" ? "450" : "540";
  }));
})();
