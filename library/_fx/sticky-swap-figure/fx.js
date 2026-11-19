// The picture panel in the middle of the section sticks to the screen center and follows, and for each cell made by dividing the section by the number of items, the picture in the panel changes to that item’s (each-city js-sticky)
(() => {
  kfFx.register("sticky-swap-figure", (el, { options, scroller }) => {
    const fig = el.querySelector('[data-fx-part="figure"]');
    if (!fig) return;
    const groups = [...fig.querySelectorAll('[data-fx-part="slides"]')];
    const home = fig.parentNode, next = fig.nextSibling;
    const rail = document.createElement("div");
    rail.setAttribute("data-fx-part", "rail");
    el.prepend(rail);
    rail.append(fig);
    const narrow = +(options.narrow ?? 1080);
    const view = scroller || window;
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const box = () => (scroller ? scroller.getBoundingClientRect().top : 0);
    let last = -1;
    const update = () => {
      const hide = narrow && innerWidth <= narrow;
      rail.style.display = hide ? "none" : "";
      if (hide) return;
      const eh = fig.offsetHeight, ph = el.offsetHeight;
      el.style.setProperty("--fx-fig-h", `${eh}px`);
      // Original column split: the distance the screen center has passed ”section top + half the plate”, column k = Section height / number of items, the i-th starts at k·i − k/2 and lasts k
      const top = el.getBoundingClientRect().top - box();
      const d = vh() / 2 - (top + eh / 2);
      groups.forEach((g) => {
        const kids = [...g.children];
        if (!kids.length) return;
        const k = ph / kids.length;
        let on = Math.floor((d + k / 2) / k);
        on = Math.max(0, Math.min(kids.length - 1, on));
        if (g === groups[0] && on === last) return;
        kids.forEach((c, i) => c.classList.toggle("is-fx-on", i === on));
        if (g === groups[0]) last = on;
      });
    };
    const force = () => { last = -1; update(); };
    view.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", force);
    const ro = new ResizeObserver(force);
    ro.observe(el); ro.observe(fig);
    force();
    return () => {
      view.removeEventListener("scroll", update);
      removeEventListener("resize", force);
      ro.disconnect();
      groups.forEach((g) => [...g.children].forEach((c) => c.classList.remove("is-fx-on")));
      if (home && home.isConnected) home.insertBefore(fig, next && next.parentNode === home ? next : null);
      rail.remove();
      el.style.removeProperty("--fx-fig-h");
    };
  });
})();
