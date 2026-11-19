// Pricing: monthly/yearly toggle (the switch knob slides across in .15s and the price and billing text change instantly), comparison table row fill
(() => {
  const sw = document.querySelector(".am-switch");
  const opts = [...document.querySelectorAll("[data-bill]")];
  const set = (year) => {
    sw.setAttribute("aria-checked", String(year));
    opts.forEach((o) => o.setAttribute("aria-pressed", String((o.dataset.bill === "year") === year)));
    document.querySelectorAll("[data-price]").forEach((p) => (p.textContent = year ? p.dataset.year : p.dataset.month));
    document.querySelectorAll("[data-per]").forEach((p) => (p.textContent = year ? "Billed annually" : "Billed monthly"));
  };
  if (sw) {
    sw.addEventListener("click", () => set(sw.getAttribute("aria-checked") !== "true"));
    opts.forEach((o) => o.addEventListener("click", () => set(o.dataset.bill === "year")));
    set(true);
  }
  const rows = document.querySelector("[data-rows]");
  if (rows) {
    // [name, Pro, Business] — 1 is check only, 2 is check + unlimited, 0 is blank
    const R = [[2, 2], [2, 2], [2, 2], [2, 2], [1, 1], [1, 1], [2, 2], [1, 1], [1, 1], [1, 1], [1, 1], [0, 1], [0, 1], [0, 1]];
    const cell = (v) => (v === 2 ? "<span><i>✓</i>Unlimited</span>" : v === 1 ? "<span><i>✓</i></span>" : "<span></span>");
    rows.innerHTML = R.map((r, i) => `<div class="am-compare__row"><span>Your comparison item $ here{String(i + 1).padStart(2, "0")}</span>${cell(r[0])}${cell(r[1])}</div>`).join("");
  }
})();
