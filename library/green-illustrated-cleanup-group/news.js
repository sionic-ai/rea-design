/* News list — the original has 16 rows (date · category pill · title · arrow). Picking a category keeps only that category */
(() => {
  const list = document.querySelector(".gb-newslist.is-page");
  if (!list) return;
  const CAT = [
    { name: "#Category 1", c: "var(--site-tohoku)" },
    { name: "#Category 2", c: "var(--kf-ink)" },
    { name: "#Category 3", c: "var(--site-kansai)" },
  ];
  const TITLES = [
    "Your one-line news title here ~ long enough for a subtitle",
    "Your award News title here",
    "Your caution notice news title here — a long title that runs onto two lines",
    "”Your guide material name here”",
    "Your interview article title here",
    "Your office closure notice here",
    "Your certificate issuance notice title here",
    "Your headline announcing an event here",
  ];
  const pick = [0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 2];
  let html = "";
  pick.forEach((k, i) => {
    html += `<li data-cat="${k}"><a href="news.html"><span class="gb-newslist__date">0000.00.00</span><span class="gb-newslist__cat" style="--c: ${CAT[k].c}">${CAT[k].name}</span><span class="gb-newslist__title">${TITLES[i % TITLES.length]}</span></a></li>`;
  });
  list.innerHTML = html;

  const select = document.querySelector(".gb-dropdown");
  select && select.addEventListener("change", () => {
    const k = select.selectedIndex - 1;
    list.querySelectorAll("li").forEach((li) => { li.hidden = k >= 0 && +li.dataset.cat !== k; });
  });
})();
