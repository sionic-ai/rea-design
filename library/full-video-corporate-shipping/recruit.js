// Careers — tabs switch the sea and land lists, a dark band follows along the row, split photo hover
(() => {
  const OL = (window.OL = window.OL || { pages: {} });
  OL.page("recruit", (root) => {
    const offs = [];
    const on = (el, ev, fn) => { el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
    const lists = root.querySelector(".ol-career__lists");
    const hl = root.querySelector(".ol-career__hl");
    if (lists && hl) {
      root.querySelectorAll(".ol-career__tabs [data-view]").forEach((b) => on(b, "click", () => {
        root.querySelectorAll(".ol-career__tabs [data-view]").forEach((x) => { const a = x === b; x.classList.toggle("is-active", a); x.setAttribute("aria-selected", String(a)); });
        root.querySelectorAll(".ol-career__list").forEach((l) => {
          const show = l.dataset.view === b.dataset.view;
          l.hidden = !show;
          l.classList.remove("is-in");
          if (show) { void l.offsetWidth; l.classList.add("is-in"); }
        });
      }));
      let cur = null;
      const move = (row) => {
        if (cur) cur.classList.remove("is-hl");
        cur = row;
        if (!row) { hl.classList.remove("is-on"); return; }
        const r = row.getBoundingClientRect(), b = lists.getBoundingClientRect();
        const first = !hl.classList.contains("is-on");
        hl.style.transition = first ? "none" : "";
        hl.style.top = `${r.top - b.top}px`;
        hl.style.height = `${r.height}px`;
        if (first) { void hl.offsetWidth; hl.style.transition = ""; }
        hl.classList.add("is-on");
        row.classList.add("is-hl");
      };
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        on(lists, "mouseover", (e) => { const row = e.target.closest(".ol-career__item"); if (row && row !== cur) move(row); });
        on(lists, "mouseleave", () => move(null));
      }
    }
    const md = root.querySelector(".ol-md__wrap");
    if (md) {
      md.querySelectorAll("[data-side]").forEach((c) => {
        on(c, "mouseenter", () => { md.classList.toggle("is-left", c.dataset.side === "left"); md.classList.toggle("is-right", c.dataset.side === "right"); });
      });
      on(md, "mouseleave", () => md.classList.remove("is-left", "is-right"));
    }
    return () => offs.forEach((f) => f());
  });
})();
