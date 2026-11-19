(() => {
  // When a name row passes the center band of the screen, switch on its paired background (it must linger briefly to change). A name with interaction or focus raised wins before the center one
  kfFx.register("center-name-backdrop", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const drops = [...el.querySelectorAll('[data-fx-part="backdrop"]')];
    if (!items.length || !drops.length) return;
    const dwell = reduce ? 0 : +(options.dwell ?? 90);
    const line = +(options.line ?? 50);
    let center = 0, hover = -1, shown = -1, pending = -1, timer = 0;
    const render = () => {
      const i = hover >= 0 ? hover : center;
      if (i === shown) return;
      shown = i;
      items.forEach((it, k) => it.classList.toggle("is-fx-active", k === i));
      drops.forEach((d, k) => d.classList.toggle("is-fx-active", k === i % drops.length));
    };
    const propose = (i) => {
      if (i === center || i === pending) return;
      pending = i;
      clearTimeout(timer);
      const take = () => { center = pending; pending = -1; render(); };
      if (!dwell) take(); else timer = setTimeout(take, dwell);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) propose(items.indexOf(e.target)); }), {
      root: scroller || null,
      rootMargin: `-${line}% 0px -${100 - line}% 0px`,
      threshold: 0,
    });
    items.forEach((it) => io.observe(it));
    const ac = new AbortController(), signal = ac.signal;
    items.forEach((it, i) => {
      const on = () => { hover = i; render(); }, off = () => { hover = -1; render(); };
      it.addEventListener("mouseenter", on, { signal });
      it.addEventListener("mouseleave", off, { signal });
      it.addEventListener("focusin", on, { signal });
      it.addEventListener("focusout", off, { signal });
    });
    render();
    return () => {
      ac.abort();
      io.disconnect();
      clearTimeout(timer);
      [...items, ...drops].forEach((n) => n.classList.remove("is-fx-active"));
    };
  });
})();
