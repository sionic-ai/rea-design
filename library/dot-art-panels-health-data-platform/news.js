// News list — lay out twelve cards and filter them by category buttons and the search field (same place as the original Finsweet filter). When filtered, the remaining cards rise in .3s
(() => {
  const grid = document.querySelector("[data-grid]");
  if (!grid || !window.zhCard) return;
  const posts = Array.from({ length: 12 }, (_, i) => window.zhPosts[i % window.zhPosts.length]);
  grid.innerHTML = posts.map((p, i) => `<div class="nw-item" data-tags="${p[0]} ${p[1]}">${window.zhCard(p, i)}</div>`).join("");
  window.zhButtons(grid);
  const total = document.querySelector("[data-total]");
  const items = [...grid.children];
  let tag = "", q = "";
  const apply = () => {
    const shown = items.filter((el) => {
      const ok = (!tag || el.dataset.tags.includes(tag)) && (!q || el.textContent.includes(q));
      el.hidden = !ok;
      return ok;
    });
    total.textContent = String(shown.length).padStart(2, "0");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.fromTo(shown, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 });
    ScrollTrigger.refresh();
  };
  document.querySelectorAll("[data-chips] button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("[data-chips] button").forEach((x) => x.classList.toggle("is-on", x === b));
    tag = b.dataset.tag;
    apply();
  }));
  document.querySelector("[data-search]")?.addEventListener("input", (e) => { q = e.target.value.trim(); apply(); });
  total.textContent = String(items.length).padStart(2, "0");
})();
