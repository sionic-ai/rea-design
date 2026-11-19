/* One article: bold the table-of-contents row of the current section (the last h2 whose head has passed 140px above the screen top) */
(() => {
  const toc = document.querySelector("[data-toc]");
  if (!toc) return;
  const links = [...toc.querySelectorAll("a")];
  const heads = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  let busy = false;
  const f = () => {
    busy = false;
    let cur = -1;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) cur = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === cur));
  };
  addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(f); } }, { passive: true });
  f();
})();
