/* Work list — entrance (title·button .8s, video 1.2→1x 2.4s)·video header 10s cycle with a progress bar·list/grid filter (swap after .3s) */
(() => {
  const { reduce } = window.PG;
  window.PG.enter((tl) => {
    if (!tl) return;
    tl.from("[data-load-title]", { opacity: 0, duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-tabs]", { opacity: 0, duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-bg]", { opacity: 0, scale: 1.2, duration: 2.4, ease: "power2.out" }, "<10%");
  });

  const titles = [...document.querySelectorAll(".wh__item")];
  const bgs = [...document.querySelectorAll(".wh__bg-item")];
  const bars = [...document.querySelectorAll(".wh__bar i")];
  const CYCLE = 10000;
  let cur = 0, timer;
  const activate = (i) => {
    i %= titles.length;
    titles.forEach((t) => t.classList.remove("is-active"));
    bgs.forEach((b) => b.classList.remove("is-active"));
    bars.forEach((b) => { b.style.transitionDuration = "0s"; b.style.width = "0%"; b.style.opacity = "0"; });
    titles[i]?.classList.add("is-active");
    bgs[i]?.classList.add("is-active");
    const bar = bars[i];
    if (bar && !reduce) {
      bar.style.opacity = "1";
      void bar.offsetWidth;
      bar.style.transitionDuration = `${CYCLE / 1000}s`;
      requestAnimationFrame(() => { bar.style.width = "100%"; });
    }
    cur = i;
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => activate(cur + 1), CYCLE);
  };
  titles.forEach((t, i) => t.addEventListener("mouseenter", () => { if (i !== cur) activate(i); }));
  if (titles.length) activate(0);

  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const buttons = group.querySelectorAll("[data-filter-target]");
    const views = group.querySelectorAll("[data-filter-name]");
    const set = (el, on) => { el.setAttribute("data-filter-status", on ? "active" : "not-active"); el.setAttribute("aria-hidden", on ? "false" : "true"); };
    buttons.forEach((btn) => btn.addEventListener("click", () => {
      if (btn.getAttribute("data-filter-status") === "active") return;
      const target = btn.getAttribute("data-filter-target");
      views.forEach((v) => {
        const on = v.getAttribute("data-filter-name") === target;
        if (v.getAttribute("data-filter-status") === "active") v.setAttribute("data-filter-status", "transition-out");
        setTimeout(() => { set(v, on); if (on) ScrollTrigger.refresh(); }, 300);
      });
      buttons.forEach((b) => { const on = b === btn; b.setAttribute("data-filter-status", on ? "active" : "not-active"); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    }));
  });

  document.addEventListener("DOMContentLoaded", () => window.PG.bindCursor());
})();
