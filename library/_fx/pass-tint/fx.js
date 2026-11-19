(() => {
  kfFx.register("pass-tint", (el, { options, scroller }) => {
    const items = [...el.querySelectorAll("[data-fx-part=item]")];
    if (!items.length) return;
    const line = +(options.line ?? 0.3);
    const view = scroller || window;
    let at = -1, raf = 0;
    const set = (k) => {
      if (k === at) return;
      at = k;
      const it = items[k];
      if (it) {
        el.setAttribute("data-tint", it.dataset.key || String(k));
        const c = getComputedStyle(it).getPropertyValue("--fx-color").trim();
        c ? el.style.setProperty("--fx-tint", c) : el.style.removeProperty("--fx-tint");
      } else {
        el.removeAttribute("data-tint");
        el.style.removeProperty("--fx-tint");
      }
      el.querySelectorAll("[data-fx-part=rows]").forEach((set) =>
        [...set.querySelectorAll("[data-fx-part=row]")].forEach((r, j) => r.classList.toggle("is-active", j === k)));
      el.dispatchEvent(new CustomEvent("fx:tint", { detail: { index: k } }));
    };
    // Like the original, the cell passing the line position of the screen height is Now — in a gap between cells, return to the resting background
    const check = () => {
      raf = 0;
      const top = scroller ? scroller.getBoundingClientRect().top : 0, h = scroller ? scroller.clientHeight : innerHeight;
      const y = top + h * line;
      set(items.findIndex((it) => { const r = it.getBoundingClientRect(); return r.top < y && r.bottom > y; }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    view.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    check();
    return () => {
      view.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      el.removeAttribute("data-tint");
      el.style.removeProperty("--fx-tint");
      el.querySelectorAll("[data-fx-part=row]").forEach((r) => r.classList.remove("is-active"));
    };
  });
})();
