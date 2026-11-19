// Work bundle: grid cells ↔ name rows hover-react to each other (on leave, the state clears after .5s), and the grid/list buttons below switch the view (a blur veil covers then lifts over .49s).
(() => {
  const pj = document.querySelector("[data-pj]");
  if (!pj) return;
  pj.querySelectorAll(".pj-name").forEach((n, i) => n.style.setProperty("--i", i));
  const pair = (el) => pj.querySelector(`${el.classList.contains("pj-cell") ? ".pj-name" : ".pj-cell"}[data-rel="${el.dataset.rel}"]`);
  const timers = new WeakMap();
  pj.querySelectorAll(".pj-cell, .pj-name").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const t = pair(el); if (!t) return;
      clearTimeout(timers.get(t));
      t.classList.remove("is-leave"); t.classList.add("is-hover");
    });
    el.addEventListener("mouseleave", () => {
      const t = pair(el); if (!t) return;
      t.classList.add("is-leave");
      timers.set(t, setTimeout(() => t.classList.remove("is-hover", "is-leave"), 500));
    });
  });
  const root = document.documentElement;
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    if (b.classList.contains("is--active")) return;
    document.querySelectorAll("[data-view]").forEach((x) => x.classList.toggle("is--active", x === b));
    root.classList.add("js-transition--start");
    setTimeout(() => {
      pj.classList.toggle("view--grid", b.dataset.view === "grid");
      pj.classList.toggle("view--list", b.dataset.view === "list");
      scrollTo(0, 0); window.GC.syncPhat();
      setTimeout(() => root.classList.remove("js-transition--start"), 150);
    }, window.GC.reduce ? 0 : 700);
  }));
})();
