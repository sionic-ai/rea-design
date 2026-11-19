(() => {
  // Bottom strip — the car runs along the strip by the scroll progress ratio (within screen width − car width), and the pattern shifts backward by the same distance.
  // Only while moving more than 3px is is-fx-moving set, is-fx-left · is-fx-right by direction, and at both ends it stops with is-fx-start · is-fx-end.
  kfFx.register("scroll-car-strip", (el, { options, scroller }) => {
    const car = el.querySelector('[data-fx-part="car"]');
    if (!car) return;
    const bg = el.querySelector('[data-fx-part="bg"]');
    const sel = options.scroller;
    const box = (sel && document.querySelector(sel)) || scroller || null;
    const axis = options.axis || (box && box.scrollWidth > box.clientWidth ? "x" : box ? "x" : "y");
    const threshold = +(options.min ?? 150);
    const edge = +(options.edge ?? 5);
    let before = 0, now = 0, limit = 0;
    const cls = (k, on) => el.classList.toggle(k, on);

    const read = () => {
      if (box) {
        now = axis === "x" ? box.scrollLeft : box.scrollTop;
        limit = axis === "x" ? box.scrollWidth - box.clientWidth : box.scrollHeight - box.clientHeight;
      } else {
        now = scrollY;
        limit = document.documentElement.scrollHeight - innerHeight;
      }
    };
    const noscroll = () => {
      ["is-fx-start", "is-fx-end", "is-fx-moving", "is-fx-left", "is-fx-right"].forEach((k) => cls(k, false));
      cls("is-fx-noscroll", true);
      car.style.transform = "";
      if (bg) bg.style.backgroundPosition = "";
    };
    const ends = () => {
      const atEnd = now >= limit - edge, atStart = now < edge;
      cls("is-fx-end", atEnd);
      cls("is-fx-start", atStart);
      if (atEnd || atStart) cls("is-fx-moving", false);
      return atEnd || atStart;
    };
    const draw = () => {
      if (limit < threshold) return noscroll();
      cls("is-fx-noscroll", false);
      const w = el.clientWidth || innerWidth;
      const p = Math.min(1, Math.max(0, now / limit));
      // The original holds the car in place while it touches the end
      if (!(now < edge || now >= limit - edge)) {
        const x = p * (w - car.offsetWidth);
        car.style.transform = `translateX(${x}px)`;
        if (bg) bg.style.backgroundPosition = `${-x}px 0`;
      }
      if (Math.abs(now - before) > 3) {
        cls("is-fx-moving", true);
        cls("is-fx-right", now > before);
        cls("is-fx-left", now < before);
      } else cls("is-fx-moving", false);
      ends();
      before = now;
    };
    const onScroll = () => { read(); draw(); };
    // For a canvas that does not scroll directly (fake scroll such as smooth-scrollbar), the consumer fires fx:scroll (detail offset·limit)
    const onFx = (e) => { now = +e.detail.offset || 0; limit = +e.detail.limit || 0; draw(); };
    const target = box || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("fx:scroll", onFx);
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    onScroll();
    return () => {
      target.removeEventListener("scroll", onScroll);
      el.removeEventListener("fx:scroll", onFx);
      ro.disconnect();
      car.style.transform = "";
      if (bg) bg.style.backgroundPosition = "";
      ["is-fx-start", "is-fx-end", "is-fx-moving", "is-fx-left", "is-fx-right", "is-fx-noscroll"].forEach((k) => cls(k, false));
    };
  });
})();
