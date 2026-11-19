// News list — category buttons filter the post cards, and the remaining cards float up in a 60ms sequence
(() => {
  const OL = (window.OL = window.OL || { pages: {} });
  OL.page("news", (root) => {
    const items = [...root.querySelectorAll(".ol-news__item")];
    const btns = [...root.querySelectorAll(".ol-filters__group [data-filter]")];
    const pick = (f) => {
      btns.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === f));
      let k = 0;
      items.forEach((it) => {
        const show = f === "*" || it.dataset.cat === f;
        it.classList.toggle("is-gone", !show);
        it.classList.remove("is-in");
        if (show) { it.style.setProperty("--k", k++); void it.offsetWidth; it.classList.add("is-in"); }
      });
      OL.lenis && OL.lenis.resize();
      ScrollTrigger.refresh();
    };
    const onClick = (e) => {
      const b = e.target.closest("[data-filter]");
      if (b) pick(b.dataset.filter);
      const d = e.target.closest(".ol-filters__drop");
      if (d) d.setAttribute("aria-expanded", String(d.getAttribute("aria-expanded") !== "true"));
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  });
})();
