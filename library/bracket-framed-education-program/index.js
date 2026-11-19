// Home: wordmark letter splitting (original span structure) · news strip duplicated by width to flow endlessly, and it folds after 300px of scroll
(() => {
  let i = 0;
  document.querySelectorAll(".mv [data-chars]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span style="--index:${i++}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });

  const news = document.querySelector(".news"), ticker = news.querySelector(".news-ticker");
  const list = ticker.querySelector(".news-ticker-list"), item = list.querySelector(".news-ticker-item");
  const fill = () => {
    const have = list.children.length, w = item.clientWidth, box = ticker.clientWidth;
    const need = Math.ceil(box / w) + 1;
    for (let k = have; k < need; k++) list.append(item.cloneNode(true));
    ticker.style.setProperty("--size", String(Math.floor((100 * w) / box) / 100));
    ticker.style.setProperty("--total-items", String(Math.max(need, have)));
  };
  document.fonts.ready.then(fill);
  let hidden = false;
  const onScroll = () => {
    const h = scrollY >= 300;
    if (h !== hidden) news.classList.toggle("is-hidden", (hidden = h));
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
})();
