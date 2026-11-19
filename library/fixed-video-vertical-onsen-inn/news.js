// Side column shared by the news list and post detail (category and by-year accordion). Load it before shared.js so the accordion buttons get the same handle.
(() => {
  const side = document.querySelector("[data-kz-side]");
  if (!side) return;
  const cats = ["All (00)", "Notice (00)", "Meals (0)", "About the Media (00)", "Celebration prep (0)"];
  const years = [["0004 article", 6], ["0003 article", 7], ["0002 article", 4], ["0001 article", 6]];
  side.innerHTML = `<section class="kz-side"><h2 class="kz-side__h">Category</h2>
      <ul class="kz-side__list">${cats.map((c) => `<li><a href="news.html">${c}</a></li>`).join("")}</ul></section>
    <section class="kz-side"><h2 class="kz-side__h">Storage</h2>
      <div class="kz-side__arch">${years.map(([y, n]) => `<div><button type="button" class="kz-acc kz-side__acc">${y}</button>
        <ol>${Array.from({ length: n }, (_, i) => `<li><a href="news.html">${y.slice(0, 5)} ${String(12 - i).padStart(2, "0")}Month (0)</a></li>`).join("")}</ol></div>`).join("")}</div></section>`;
})();
