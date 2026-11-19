// Work list — twelve store cards of the same type (only the image labels differ) and filter pills
(() => {
  const grid = document.querySelector("[data-grid]");
  const shots = [
    ["Warm living room with a furniture shop on screen", "build"], ["Black-and-white bedroom with a store screen on a round rug", "run"], ["Dark indoor court and shoe store screen", "run"],
    ["Skin close-up with a gold ring product card", "build"], ["Resort booking calendar screen and pool photo", "build"], ["Spice jar product screen · light gray", "platform"],
    ["Shelf and logo on a rough wall · Dark brown", "run"], ["Sculpted lamp and detail card", "build"], ["Data card on blue screen", "platform"],
    ["Black-and-white profile photo with generous whitespace", "build"], ["Green forest map app screen", "platform"], ["Purple dashboard card", "platform"],
  ];
  const out = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9 9 3M4 3h5v5"/></svg>';
  grid.innerHTML = shots.map(([pic, kind], i) => `
    <div data-kind="${kind}"><a class="p-card" href="detail.html" data-fx="glass-peek-card">
      <div class="p-card__media" data-fx-part="media">
        <div data-fx-part="base" class="p-card__thumb d-ph is-dark" data-label="Photo: ${pic} · Landscape 4:3.4"></div>
        <span class="p-card__logo">Trademark ${i + 1}</span>
        <div class="p-card__over" data-fx-part="veil"><div data-fx-part="peek" class="p-card__hover d-ph" data-label="Shop screen capture · Landscape 4:3"></div></div>
        <div class="p-card__feat" data-fx-part="tags"><span class="d-tag">Design</span><span class="d-tag">Production</span><span class="d-tag">Payment</span><span class="d-tag">Analysis</span></div>
      </div>
      <div class="p-card__row"><div class="d-ph p-card__mini" data-label="Product cutout"></div><div><h3>Work name ${i + 1}</h3><p class="p-card__desc" data-fx-part="desc">Your two-line description of the shop goes here. What it makes.</p><p class="p-card__tags" data-fx-part="meta"><span class="d-tag">Industry Name</span><span class="d-tag is-brand">${kind === "run" ? "Operations" : kind === "platform" ? "Platform" : "Production"} ${out}</span></p></div></div>
    </a></div>`).join("");
  window.DS.watch();

  const box = document.querySelector(".w-filter");
  const btn = box.querySelector("[data-filter-btn]");
  btn.addEventListener("click", (e) => { e.stopPropagation(); const on = !box.classList.contains("is-open"); box.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on); });
  document.addEventListener("click", () => { box.classList.remove("is-open"); btn.setAttribute("aria-expanded", false); });
  box.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    box.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    grid.querySelectorAll("[data-kind]").forEach((c) => c.classList.toggle("is-hidden", b.dataset.f !== "all" && c.dataset.kind !== b.dataset.f));
    btn.firstChild.textContent = `${b.textContent} `;
  }));
})();
