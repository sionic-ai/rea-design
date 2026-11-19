// News list row — fills twelve rows of the same type (the original is twelve items per page from the server)
(() => {
  const list = document.getElementById("ky-news-list");
  if (!list) return;
  const cats = ["Category 1", "Category 2", "Category 3"];
  const shots = ["Event poster · Colorful graphic", "School emblem logo panel · Blue background", "Hands-on activity photo · smiling student", "Conference presentation scene · Lectern"];
  list.innerHTML = Array.from({ length: 12 }, (_, i) => `
    <li class="ky-cardcol">
      <a class="ky-cardcol__link" href="news.html" aria-label="News ${i + 1}"></a>
      <div class="ky-cardcol__thum"><div class="wf-img" data-label="${shots[i % shots.length]} · Landscape 4:3"></div></div>
      <div class="ky-cardcol__main">
        <p class="ky-cardcol__meta"><time class="ky-slab">0000.00.00</time><a class="ky-cardcol__cat" href="news.html">${cats[i % 3]}</a></p>
        <p class="ky-cardcol__title"><span>${i % 3 === 1 ? "Your news title goes here" : "Your news headline goes here. A slot for a long headline that wraps to two lines"}</span></p>
        <span class="ky-cardcol__icon" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2 1v8l7-4Z"/></svg></span>
      </div>
    </li>`).join("");
})();
