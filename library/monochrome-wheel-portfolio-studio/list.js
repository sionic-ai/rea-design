/* Work list — cells rise 10% from below when visible, the filter button opens and closes the left filter panel */
(() => {
  const TT = window.TT;
  let io = null, off = null;
  TT.modules.ProjectsList = {
    init() {
      const grid = document.querySelector(".p-projects-index");
      if (!grid) return;
      // Cells rise in column order, 60ms apart, and are reset when they leave the bottom of the screen (they rise again when it comes back down).
      const items = Array.from(grid.querySelectorAll(".c-column-item"));
      const cols = () => getComputedStyle(grid).gridTemplateColumns.split(" ").length || 1;
      const timers = new Set();
      const show = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains("is-visible")) return;
        const t = setTimeout(() => { timers.delete(t); e.target.classList.add("is-visible"); }, (items.indexOf(e.target) % cols()) * 60);
        timers.add(t);
      }), { rootMargin: "0px 0px -5% 0px" });
      const reset = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && e.boundingClientRect.top > 0) e.target.classList.remove("is-visible"); }), { threshold: 0 });
      items.forEach((el) => { show.observe(el); reset.observe(el); });
      io = { disconnect: () => { show.disconnect(); reset.disconnect(); timers.forEach(clearTimeout); } };
      const btn = document.querySelector(".p-projects-filter-button"), panel = document.querySelector(".p-projects-filter-panel");
      if (!btn || !panel) return;
      const set = (open) => {
        panel.dataset.state = open ? "open" : "closed";
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        grid.classList.toggle("is-filter-open", open);
        btn.classList.toggle("is-open", open);
        TT.bus.dispatchEvent(new Event("ui:sound:click"));
      };
      const toggle = () => set(panel.dataset.state !== "open");
      const close = () => set(false);
      const chip = (e) => { const c = e.target.closest(".p-projects-filter-panel__chip"); if (c) { c.classList.toggle("-active"); TT.bus.dispatchEvent(new Event("ui:sound:click")); } };
      btn.addEventListener("click", toggle);
      panel.querySelector(".is-close")?.addEventListener("click", close);
      panel.addEventListener("click", chip);
      btn.addEventListener("mouseenter", () => TT.bus.dispatchEvent(new Event("ui:sound:hover")));
      // Button under the filter panel — pulled toward the cursor by up to 10px (distance × .4)
      const mags = Array.from(panel.querySelectorAll(".p-projects-filter-panel__bottom-filter-btn")).map((b) => TT.magnet(b, b, 10));
      off = () => { btn.removeEventListener("click", toggle); panel.querySelector(".is-close")?.removeEventListener("click", close); panel.removeEventListener("click", chip); mags.forEach((f) => f()); };
    },
    destroy() { io?.disconnect(); io = null; off?.(); off = null; },
  };
})();
