// When the current cell changes in the band, swap the left title, category and number. The title column aligns to the left of the Services menu text
(() => {
  const title = document.querySelector(".b-works__title"), cat = document.querySelector(".b-works__cat"), num = document.querySelector(".b-works__count span");
  const fit = () => {
    const a = document.querySelector('.b-nav [data-nav="services"]');
    if (a) document.documentElement.style.setProperty("--svc-left", `${Math.round(a.getBoundingClientRect().left + 15)}px`);
  };
  fit();
  addEventListener("resize", fit);
  // Clicking a cell in the strip clicks that cell’s link to run the site transition (white curtain)
  document.addEventListener("fx:select", (e) => { e.preventDefault(); e.detail.item?.click(); });
  document.addEventListener("fx:active", (e) => {
    const it = e.detail.item;
    if (!it) return;
    title.innerHTML = it.dataset.title;
    cat.textContent = it.dataset.cat;
    num.textContent = String(e.detail.index + 1).padStart(2, "0");
  });
})();
