// About us: redraws the original’s three-field graphic (three overlapping lime-green circles, vertical field names · English · items) in the same composition, and puts a logo set in the ideals cell.
(() => {
  const fields = [
    { cx: 250, cy: 150, v: [176, 82], en: [262, 106], items: [[236, 140], [236, 166], [236, 192]], name: "Field", en_t: "Field One", list: ["Item one", "Item 2", "Item 3"] },
    { cx: 150, cy: 315, v: [62, 280], en: [96, 302], items: [[100, 342]], name: "Field", en_t: "Field Two", list: ["Item one"] },
    { cx: 350, cy: 315, v: [292, 270], en: [338, 302], items: [[342, 342], [342, 368], [342, 394]], name: "Field", en_t: "Field Three", list: ["Item one", "Item 2", "Item 3"] },
  ];
  const venn = `
    <svg class="ab-venn" viewBox="0 0 500 465" role="img" aria-label="Circle diagram of three overlapping fields">
      ${fields.map((f) => `<circle cx="${f.cx}" cy="${f.cy}" r="150" fill="var(--site-venn)" fill-opacity=".55"/>`).join("")}
      ${fields
        .map(
          (f, i) => `
        <text x="${f.v[0]}" y="${f.v[1]}" font-size="14" fill="var(--kf-accent)" style="writing-mode: vertical-rl" letter-spacing="3">${f.name}${i + 1}</text>
        <text x="${f.en[0]}" y="${f.en[1]}" style="font-family: var(--kf-font-en, var(--kf-font-display))" font-size="15" fill="var(--kf-dim)" letter-spacing=".5" text-decoration="underline">${f.en_t}</text>
        ${f.list.map((t, j) => `<text x="${f.items[j][0]}" y="${f.items[j][1]}" font-size="12" fill="var(--kf-ink)" letter-spacing="2.5">${t}</text>`).join("")}`
        )
        .join("")}
    </svg>`;
  window.EC.page("about", {
    build(box) {
      box.querySelectorAll("[data-venn]").forEach((el) => (el.innerHTML = venn));
      box.querySelectorAll("[data-logo-set]").forEach((el) => (el.innerHTML = window.EC.icons.logoSet));
    },
  });
})();
