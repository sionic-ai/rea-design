// Service — pricing tabs swap the name, value and line list, and the promise box and Q&A open and close with grid-rows .5s
(() => {
  const tiers = [
    { name: "Fee 1", days: "Opens within 00 business days", price: "0,000 won", rows: ["00 pages", "000 products", "0 Store Features", "0 integrations", "All sales tracking"] },
    { name: "Fee 2", days: "Opens within 00 business days", price: "0,000 won", rows: ["00 pages", "000 products", "0 Store Features", "0 integrations", "Mail flow", "One Sales Report"] },
    { name: "Fee 3", days: "Opens within 00 business days", price: "0,000 won", rows: ["00 pages", "0,000 products", "00 store features", "0 integrations", "Second Market", "Custom Design Included"] },
  ];
  const box = document.querySelector("[data-tabs]");
  if (box) {
    const nm = box.querySelector("[data-r=name]"), pr = box.querySelector("[data-r=price]"), rows = box.querySelector("[data-r=rows]"), key = box.querySelector("[data-r=key]");
    const keep = [...rows.querySelectorAll("li")].slice(-2).map((li) => li.outerHTML).join("");
    box.querySelectorAll("[data-tier]").forEach((b) => b.addEventListener("click", () => {
      const t = tiers[+b.dataset.tier];
      box.querySelectorAll("[data-tier]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      nm.innerHTML = `${t.name}<i>${t.days}</i>`;
      pr.textContent = t.price;
      rows.innerHTML = t.rows.map((r) => `<li>${r}</li>`).join("") + keep;
      if (key) key.textContent = `${t.name}, ${t.days}`;
    }));
  }
  document.querySelectorAll("[data-acc]").forEach((a) => {
    const hd = a.querySelector(".sv-prom-hd");
    hd.addEventListener("click", () => { const on = a.dataset.open !== "1"; a.dataset.open = on ? "1" : "0"; hd.setAttribute("aria-expanded", on); });
  });
  // A details element closes instantly, so on close remove open .5s later, after grid-rows has fully shrunk
  document.querySelectorAll(".sv-q").forEach((d) => {
    const s = d.querySelector("summary");
    s.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) { d.classList.remove("is-open"); setTimeout(() => { if (!d.classList.contains("is-open")) d.open = false; }, window.DS.reduce ? 0 : 500); }
      else { d.open = true; requestAnimationFrame(() => d.classList.add("is-open")); }
    });
  });
})();
