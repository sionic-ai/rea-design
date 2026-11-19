/* Work list — draws in the lines and attaches the shuffle settings */
(() => {
  const SA = window.SA;
  const CASES = [["Author", "Client Name 01", "White bird on dark background · Portrait 3:4", "is-dark"], ["Real Estate Developer", "Client 02", "White screen with a logo · portrait 3:4", ""], ["Illustrator", "Client 03", "Sparkling shard art · portrait 3:4", ""], ["Clock face designer", "Client 04", "Black wristwatch · portrait 3:4", "is-dark"], ["Production Studio", "Client 05", "Laptop with dark screen · portrait 3:4", "is-dark"], ["Illustrator", "Client Name 06", "Blue sneaker illustration · Portrait 3:4", ""]];
  document.querySelector("[data-case-list]").insertAdjacentHTML("beforeend", CASES.map(([cat, name, label, dark], i) => `
    <a class="wk-row" href="detail.html" data-hover-host data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar">
      <span class="sa-mono wk-row__cat">${cat}</span><span class="sa-mono wk-row__no">A — ${i + 1}</span>
      <span class="wk-row__imgbox"><span class="wk-row__img sa-ph ${dark}" data-label="${label}"></span><img class="wk-row__hover sa-ph-plain" data-hover-show src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='210' height='315'/%3E" data-label="${name} Another scene · portrait 2:3" alt="${name} Another scene · portrait 2:3"></span><span class="wk-row__src sa-ph ${dark}" data-fx-part="thumb" data-label="${label}"></span>
      <span class="sa-mono wk-row__k">Major Awards</span><span class="sa-mono wk-row__v">Award 1: Site of the Day<br>About 2<br>About 3</span>
      <span class="sa-serif wk-row__name" data-label="Your client English name here">${name}</span>
      
      <span class="sa-mono wk-row__k is-b">Work scope</span><span class="sa-mono wk-row__v is-b">Art Direction<br>Web design<br>Web development</span>
    </a>`).join(""));
  const ARCH = Array.from({ length: 10 }, (_, i) => [`${2025 - i}`, `Your work $ here{i + 1}`, ["Website", "App", "Branding", "E-commerce"][i % 4]]);
  document.querySelector("[data-archive]").innerHTML = ARCH.map(([y, n, t]) => `
    <a class="wk-arow" href="#" data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar"><span class="sa-mono">${y}</span><span class="sa-bold">${n}</span><span class="sa-mono">${t}</span><span class="sa-mono wk-arow__go">Example →</span><span class="wk-arow__img sa-ph" data-fx-part="thumb" data-label="${n} Screen · Landscape 4:3"></span></a>`).join("");
  document.querySelectorAll("[data-scr]").forEach((el) => el.setAttribute("data-fx-text-scramble", `on: load; delay: .35; ${SA.SCRAMBLE}`));
})();
