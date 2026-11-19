/* News list — pressing a category re-lays out only that category (the original fetches that address and swaps it in), View More appends the next batch.
   Newly laid lines are delayed .05s each, is-visible after .1s (turns on over 1.2s) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wrap = $(".js-entries");
  if (!wrap) return;
  const items = $(".js-entries__items", wrap), more = $(".js-entries__more", wrap);
  const all = $$(".js-entries__entry", items).map((n) => n.cloneNode(true));
  const show = (nodes) => nodes.forEach((n, i) => {
    n.classList.remove("is-visible");
    n.style.transitionDelay = `${0.05 * i}s`;
    items.appendChild(n);
    setTimeout(() => n.classList.add("is-visible"), 100);
  });
  $$(".js-entries__filter", wrap).forEach((f) => f.addEventListener("click", (e) => {
    e.preventDefault();
    if (f.classList.contains("active")) return;
    $$(".js-entries__filter", wrap).forEach((o) => o.classList.remove("active"));
    f.classList.add("active");
    items.innerHTML = "";
    const cat = f.dataset.cat;
    show(all.filter((n) => !cat || n.dataset.cat === cat).map((n) => n.cloneNode(true)));
    ScrollTrigger.refresh();
  }));
  more?.addEventListener("click", (e) => {
    e.preventDefault();
    more.style.visibility = "hidden";
    show(all.slice(0, 3).map((n) => n.cloneNode(true)));
    ScrollTrigger.refresh();
  });
})();
