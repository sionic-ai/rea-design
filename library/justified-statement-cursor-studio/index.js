/* First page — draws the case and award rows, and attaches shared settings to the shuffle text (before fx-core scans) */
(() => {
  const SA = window.SA;
  const CASES = [
    ["Author", "Client Name 01", "is-serif", "White bird on dark background · Portrait 3:4", "is-dark"],
    ["Real Estate Developer", "Logo 02", "is-mono", "White screen with a logo · portrait 3:4", ""],
    ["Illustrator", "Client 03", "is-serif", "Leaning doll cutout · portrait 3:4", ""],
    ["Clock face designer", "LOGO", "is-bold", "Phone with pink screen · Portrait 3:4", ""],
    ["Production Studio", "Brand Logo", "is-wide", "Laptop with dark screen · portrait 3:4", "is-dark"],
    ["Illustrator", "Client Name", "is-serif", "Blue sneaker illustration · landscape", ""],
  ];
  document.querySelector("[data-case-list]").innerHTML = CASES.map(([cat, name, look, label, dark], i) => `
    <a class="sa-case" href="detail.html" data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar">
      <span class="sa-case__no sa-mono">A — ${i + 1}</span>
      <span class="sa-case__cat sa-mono">${cat}</span>
      <span class="sa-case__name ${look}" data-label="${look === "is-serif" ? "Your client English name here" : "Your client English logo text"}"><span data-fx="text-scramble" data-scr-hover>${name}</span></span>
      <span class="sa-case__img sa-ph ${dark}" data-fx-part="thumb" data-label="${label}"></span>
      <span class="sa-case__go" aria-hidden="true">→</span>
      <span class="sa-case__k sa-mono" style="grid-area:k1">Major Awards</span><span class="sa-case__v sa-mono" style="grid-area:v1">Award 1: Site of the Day<br>About 2<br>About 3</span>
      <span class="sa-case__small sa-mono">${name}</span>
      <span class="sa-case__k sa-mono" style="grid-area:k2">Work scope</span><span class="sa-case__v sa-mono" style="grid-area:v2">Art Direction<br>Web design<br>Web development</span>
    </a>`).join("");
  const AWARDS = [["Award Name 1", "Today’s sites × 4"], ["Award Name 1", "Notable sites × 7"], ["Design award 2", "Award — App design"], ["Design award 3", "Bronze award — Interface design"], ["Design award 4", "Best app design"], ["About media 1", "× 6"], ["About media 1", "Main page"], ["About media 2", "× 6"], ["About media 3", "Introduced"], ["About media 4", "Introduced"]];
  document.querySelector("[data-award-list]").innerHTML = AWARDS.map(([a, b]) => `
    <a class="sa-award" href="#" data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar"><span class="sa-bold">${a}</span><span class="sa-mono">${b}</span><span class="sa-award__img sa-ph" data-fx-part="thumb" data-label="Trophy and badge photo · Square"></span></a>`).join("");
  // Text that is written in, blending from blank over 400ms when first seen — the header part right on load, lower sections when visible
  // Header text is written in sequence right on load (clock·city .15s, label delayed .25s) — all written within the loader’s 767ms measured from the original
  document.querySelectorAll("[data-scr]").forEach((el) => el.setAttribute("data-fx-text-scramble", `${el.closest(".sa-intro") ? `on: load; delay: ${el.classList.contains("sa-intro__label") ? .25 : .15}; ` : "start: top 90%; "}${SA.SCRAMBLE}`));
  // Work row: on hover the large name appears immediately and is written with a 400ms blank-cell shuffle, and hides immediately on leave (original s-a-3-case-study-hover)
  document.querySelectorAll("[data-scr-hover]").forEach((el) => {
    el.setAttribute("data-fx-text-scramble", `on: load; ${SA.SCRAMBLE}`);
    el.removeAttribute("data-fx");
    const row = el.closest(".sa-case");
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) { el.setAttribute("data-fx", "text-scramble"); return; }
    row.addEventListener("pointerenter", () => { row.classList.add("is-on"); el.setAttribute("data-fx", "text-scramble"); });
    row.addEventListener("pointerleave", () => { row.classList.remove("is-on"); el.removeAttribute("data-fx"); });
  });
})();
