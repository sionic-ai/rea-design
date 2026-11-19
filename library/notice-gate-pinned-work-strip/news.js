// News list — when 20% of the list is visible, each row turns on from 30px below over .6s at .2s intervals
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".ft-news__list").forEach((list) => {
    const items = list.querySelectorAll("li");
    if (reduce) return items.forEach((li) => li.classList.add("is-show"));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      items.forEach((li, i) => setTimeout(() => li.classList.add("is-show"), i * 200));
      io.unobserve(e.target);
    }), { threshold: 0.2 });
    io.observe(list);
  });
})();
