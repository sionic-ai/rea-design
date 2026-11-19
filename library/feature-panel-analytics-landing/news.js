// News list — the center blog name is hidden before the category and search row sticks to the header, and appears in .3s once stuck
(() => {
  const bar = document.querySelector(".mp-bloghead");
  if (!bar) return;
  document.body.classList.add("nw-bar-rest");
  const mark = document.createElement("i");
  bar.before(mark);
  new IntersectionObserver(([e]) => document.body.classList.toggle("nw-bar-rest", e.isIntersecting || e.boundingClientRect.top > 0)).observe(mark);
})();
