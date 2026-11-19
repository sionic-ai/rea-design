// News row — the first page’s Latest News and the news list share the same type
(() => {
  const CATS = [["Service", "Media"], ["Company"], ["Service", "Wedding"], ["Company", "Press release"], ["Service", "Media"], ["Company", "Information"]];
  window.pdNewsItem = (i) => {
    const cats = CATS[i % CATS.length];
    return `<li class="pd-news-item pd-fade"><div class="pd-news-item__row"><a class="pd-news-item__cover" href="#" aria-label="Open News"></a>
      <div class="pd-news-item__fig"><div class="wf-img pd-news-item__img" data-label="News photo ${i + 1} · Store interior · Landscape 3:2"></div></div>
      <div class="pd-news-item__txt"><ul class="pd-news-item__hash">${cats.map((c) => `<li><a class="pd-hash" href="#">${c}</a></li>`).join("")}${i === 3 ? '<li><span class="pd-hash is-new">NEW</span></li>' : ""}</ul>
        <p class="pd-news-item__title">Your news title goes here, running from one line to two ${String(i + 1).padStart(2, "0")}</p></div>
      <time class="pd-news-item__date pd-en">2026/0${(i % 9) + 1}/${String(28 - i).padStart(2, "0")}</time></div></li>`;
  };
})();
