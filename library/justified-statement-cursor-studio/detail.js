/* Work detail — draws in other work rows and attaches the mixing settings */
(() => {
  const SA = window.SA;
  document.querySelector("[data-more]").innerHTML = ["Client 02", "Client 03", "Client Name 04"].map((n, i) => `
    <a class="dt-mrow" href="detail.html" data-hover-host data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar"><span class="sa-mono">A — ${i + 2}</span><span class="sa-serif" data-label="Another case client English name here">${n}</span><img class="dt-mrow__thumb sa-ph-plain" data-hover-hide src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='95' height='143'/%3E" data-label="${n} Main image · portrait 2:3" alt="${n} Main image · portrait 2:3"><img class="dt-mrow__hover sa-ph-plain" data-hover-show src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='95' height='143'/%3E" data-label="${n} Another picture · portrait 2:3" alt="${n} Another picture · portrait 2:3"><span class="dt-mrow__src sa-ph" data-fx-part="thumb" data-label="${n} Main image · portrait 3:4"></span><span class="sa-mono dt-mrow__go">→</span></a>`).join("");
  // The detail heading text is not shuffled on load, like the original (measured loader 83ms)
  document.querySelectorAll("[data-scr]").forEach((el) => el.removeAttribute("data-fx"));
})();
