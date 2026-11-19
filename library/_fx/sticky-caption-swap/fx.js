// A one-line caption pinned at the center of a long work row switches immediately to the data-* text of the item sufficiently in view (default 40%).
(() => {
  kfFx.register("sticky-caption-swap", (el, { options }) => {
    const cap = el.querySelector('[data-fx-part="caption"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!cap || !items.length) return;
    const ratio = +(options.ratio ?? 0.4);
    const slots = [...cap.querySelectorAll("[data-key]")];
    const link = cap.querySelector('[data-fx-part="link"]');
    const set = (item) => {
      slots.forEach((s) => {
        const v = item.dataset[s.dataset.key];
        if (v == null) return;
        if (s.dataset.key === "title") s.innerHTML = v;
        else s.textContent = v;
      });
      const href = item.dataset.href || item.querySelector("a[href]")?.getAttribute("href");
      if (link && href) link.setAttribute("href", href);
      cap.dispatchEvent(new CustomEvent("fx:swap", { bubbles: true, detail: { item } }));
    };
    set(items[0]);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && set(e.target)), { threshold: ratio });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  });
})();
