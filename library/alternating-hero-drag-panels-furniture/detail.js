// Size-fit table detail — same Swiper 11.2.3 as the original: the large photo changes by overlapping (fade crossFade, no loop), small photos are 5 cells (over 780px, 10 cells · 4px).
// Pressing a tab (deck image tab, bridge text tab → the bridge image tab inside it) lights only the cells in the same row, and .1s later re-measures the slider size inside
(() => {
  const mains = [];
  if (window.Swiper) {
    document.querySelectorAll(".sg-swset").forEach((set) => {
      const thumbs = new Swiper(set.querySelector(".sg-swset__thumbs"), { watchSlidesProgress: true, slidesPerView: 5, spaceBetween: 0, breakpoints: { 780: { slidesPerView: 10, spaceBetween: 4 } }, loop: false });
      const main = new Swiper(set.querySelector(".sg-swset__main"), { loop: false, spaceBetween: 0, effect: "fade", fadeEffect: { crossFade: true }, thumbs: { swiper: thumbs } });
      mains.push([main, thumbs]);
    });
  }
  document.querySelectorAll(".sg-tab[data-tab]").forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(t.dataset.tab);
    if (!target) return;
    t.closest("ul").querySelectorAll(".sg-tab").forEach((x) => x.classList.toggle("is-active", x === t));
    [...target.parentElement.children].forEach((p) => p.classList.toggle("is-active", p === target));
    setTimeout(() => mains.forEach(([m, th]) => { if (target.contains(m.el)) { m.update(); th.update(); } }), 100);
  }));
})();
