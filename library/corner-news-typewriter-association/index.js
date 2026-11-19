(() => {
  window.tNewsRows(document.querySelector(".t-news"), 5);

  const CARDS = [
    ["Your member news title here — typeface release news", "Member Name Inc.", ["Release"], "2026.09.17", "New typeface specimen · large pink letters · white background · 4:3"],
    ["Member news title, one line here", "Member name", ["Event"], "2026.08.31", "Color-strip grid poster · rainbow gradient · 4:3"],
    ["Your member news title here", "Member name", ["Event"], "2026.08.27", "Sky-blue background · blue glass silhouette · 4:3"],
    ["Your member News title, second edition", "Member name", ["Event"], "2026.08.24", "Purple backdrop · white English logo · 4:3"],
  ];
  document.querySelector(".t-cards").innerHTML = CARDS.map(([t, n, tags, d, pic]) =>
    `<article class="t-card"><a class="t-card__link t-ul" href="index.html"><div class="t-card__img wf-img" data-label="${pic}"></div><div class="t-card__body"><div class="t-card__head"><h3 class="t-card__title"><span class="t-ul__line">${t}</span></h3><p class="t-card__name">${n}</p></div><div class="t-card__meta"><ul class="t-tags">${tags.map((x) => `<li><span class="t-tag">${x}</span></li>`).join("")}</ul><time class="t-date">${d}</time></div></div></a></article>`).join("");

  // Member flow — six rows, twelve names per row (mix names with photos, text-only names, and names with an affiliation line)
  const NAMES = ["Member Name", "Given Family", "Studio Member", "Designer Name", "Type Director", "Member Name"];
  const rows = document.querySelector(".t-tick__rows");
  rows.innerHTML = Array.from({ length: 6 }, (_, r) => {
    const items = Array.from({ length: 12 }, (_, i) => {
      const k = (r * 12 + i) % 7;
      const pic = k % 3 !== 2 ? '<span class="t-tick__pic wf-img" data-label="Member face · black and white · circular"></span>' : "";
      const group = k % 2 === 0 ? '<span class="t-tick__group" data-label="One-line English affiliation">Studio Name Ltd.</span>' : "";
      return `<span class="t-tick__item">${pic}<span class="t-tick__profile"><span class="t-tick__name" data-label="Member English name">${NAMES[(r + i) % NAMES.length]} ${String(r * 12 + i + 1).padStart(2, "0")}</span>${group}</span></span>`;
    }).join("");
    return `<div class="t-tick__row" data-fx="marquee" data-fx-marquee="rate: 60; pause: none${r % 2 ? "; dir: right" : ""}">${items}</div>`;
  }).join("");
  const ready = () => rows.classList.add("is-ready");
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]).then(() => requestAnimationFrame(ready));
})();
