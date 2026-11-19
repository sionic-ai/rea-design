// Repeating rows on subpages — four service features, twelve News items
(() => {
  const FEAT = [["Good quality, closer to you", "Dress hem spread like waves · top-down composition"], ["Many designs that give ”love” a shape", "Light pink dresses on hangers · window light"], ["A silhouette that looks beautiful for your body type", "Hands adjusting a dress waist · close-up"], ["00 stores nationwide, the same peace of mind everywhere", "Customer walking into the store entrance · dark corridor"]];
  const f = document.querySelector("[data-features]");
  if (f) f.innerHTML = FEAT.map(([t, l], i) => `<li class="p-service-feature__list__item anim fade-up"><div class="num"><span>${String(i + 1).padStart(2, "0")}</span></div><div class="image wf-img wf-r-4x3" data-label="${l} · Landscape 4:3"></div><dl class="summary"><dt>$ here{t}</dt><dd>Your feature write-up goes here in about three lines. Say in order what you insist on and what benefits the customer.</dd></dl></li>`).join("");

  const n = document.querySelector("[data-news-list]");
  if (n) {
    const CATS = ["Notice", "Collection", "Campaign", "Column", "Notice", "Collection"];
    const PIC = ["Props spread on a table · overhead view", "Four dress illustrations · white background", "Smiling Bride · By the Window", "Two tuxedos · studio", "Bride in white kimono · garden", "Hand holding a magazine cover · white background"];
    n.innerHTML = Array.from({ length: 12 }, (_, i) => `<li class="p-news-list__item anim fade-up"><a href="#"><figure class="image zoom"><span class="wf-img wf-r-3x2" data-label="${PIC[i % 6]} · Landscape 3:2"></span></figure><div class="txt"><div class="info"><time class="lv-label">2026.${String(9 - Math.floor(i / 2)).padStart(2, "0")}.${String(28 - i * 2).padStart(2, "0")}</time><span class="cat lv-sans">${CATS[i % 6]}</span></div><p class="title">News title in one or two lines. If long, it is cut at two lines.</p></div></a></li>`).join("");
  }
})();
