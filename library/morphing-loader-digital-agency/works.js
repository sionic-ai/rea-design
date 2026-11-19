// Work · News lists: pressing a filter keeps only matching cards, and the remaining cards rise again from 40px below over .6s (opacity linear · position power2.out) with .1 offset (after the original FacetWP refresh)
(() => {
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const filters = $$(".an-filter");
  const grid = document.querySelector(".an-work-archive__grid, .an-archive__grid");
  if (!filters.length || !grid) return;
  const items = [...grid.children];
  const tagsOf = (it) => $$(".an-work__service, .an-tag", it).map((t) => t.textContent.trim());
  filters.forEach((f) => f.addEventListener("click", () => {
    // Clicking an already-active filter again does nothing, like the original
    if (f.classList.contains("is-on")) return;
    filters.forEach((x) => x.classList.toggle("is-on", x === f));
    const want = f.dataset.filter, all = f === filters[0];
    const shown = items.filter((it) => { const ok = all || tagsOf(it).includes(want); it.hidden = !ok; return ok; });
    ScrollTrigger.refresh();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !shown.length) return;
    gsap.set(shown, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(shown, { start: "top 85%", once: true, onEnter: (els) => {
      gsap.to(els, { autoAlpha: 1, duration: 0.6, ease: "none", stagger: 0.1, overwrite: "auto" });
      gsap.to(els, { y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, overwrite: "auto" });
    } });
  }));
})();
