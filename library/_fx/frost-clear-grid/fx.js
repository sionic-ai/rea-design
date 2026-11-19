// The frost veil over the card image is lifted after a random delay once the card becomes visible. Keeping only the hovered card clear is handled by fx.css.
(() => {
  kfFx.register("frost-clear-grid", (el, { options, reduce, scroller }) => {
    const min = +(options.min ?? 80), max = +(options.max ?? 680);
    const timers = new Set(), seen = new WeakSet();
    const clear = (card) => card.classList.add("is-clear");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const t = setTimeout(() => { timers.delete(t); clear(e.target); }, min + Math.floor(Math.random() * Math.max(0, max - min)));
      timers.add(t);
    }), { root: scroller || null, rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    const watch = () => el.querySelectorAll('[data-fx-part="card"]').forEach((c) => { if (seen.has(c)) return; seen.add(c); if (reduce) clear(c); else io.observe(c); });
    // Also catches new cards on screens (apps) where the list is filled in later
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true, subtree: true });
    watch();
    return () => {
      io.disconnect(); mo.disconnect();
      timers.forEach(clearTimeout);
      el.querySelectorAll('[data-fx-part="card"]').forEach((c) => c.classList.remove("is-clear"));
    };
  });
})();
