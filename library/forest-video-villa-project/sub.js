(() => {
  const { pill } = window.NH;
  const list = document.querySelector("[data-news-list]");
  if (!list) return;
  const ROWS = [
    ["2026.03.10", "SEASIDE", "A villa has begun accepting reservations (simultaneous press release)"],
    ["2026.02.27", "SEASIDE", "Launched a website for a villa"],
    ["2026.01.28", "RIVERSIDE", "A villa has been picked for the magazine ‹Magazine Name›’s top 10 single-house stays with a sauna"],
    ["2025.02.05", "RIVERSIDE", "You have started a booking for one villa"],
    ["2025.01.31", "", "We launched the website"],
  ];
  list.innerHTML = ROWS.map(([d, t, s]) => `<article><a class="n-newsRow n-lineLink" data-hold="0.7" href="article.html"><span class="n-newsRow__meta en-label-l"><span class="n-newsRow__date">${d}</span><span class="n-newsRow__tag">${t}</span></span><span class="n-newsRow__title ja-body-s">${s}</span><span class="n-newsRow__go">${pill}</span><span class="n-lineLink__base"></span><span class="n-lineLink__run"></span></a></article>`).join("");
})();
