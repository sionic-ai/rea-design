(() => {
  // Original header script: scrolling down adds -fix (hidden), scrolling up adds -show after a delay. Hide and show are reduced to a single is-fx-gone
  kfFx.register("hide-on-scroll", (el, { options, scroller }) => {
    const box = scroller && scroller !== window ? scroller : null;
    const top = () => (box ? box.scrollTop : scrollY);
    const full = () => (box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - innerHeight);
    const delay = +(options.delay ?? 300);
    // step — scroll that moves less than this is not read as a direction (reference site 5px). top — within this height it gets is-fx-top and is always visible (transparent header bar at the very top)
    const step = +(options.step ?? 0), topAt = options.top != null ? +options.top : null;
    let last = top(), up = false, waiting = false, t = 0;
    if (topAt != null) el.classList.toggle("is-fx-top", last <= topAt);
    const on = () => {
      const mark = options.after ? document.querySelector(options.after) : null;
      const y = top();
      if (topAt != null) {
        el.classList.toggle("is-fx-top", y <= topAt);
        if (y <= topAt) { el.classList.remove("is-fx-gone"); clearTimeout(t); waiting = false; last = y; return; }
      }
      if (step && Math.abs(y - last) < step) return;
      // Giving offset as 25vh reads it as a ratio of window height (opx — a quarter of the window height)
      const vh = (v) => (/vh$/.test(v) ? ((box ? box.clientHeight : innerHeight) * parseFloat(v)) / 100 : +v);
      const off = mark ? mark.getBoundingClientRect().bottom + y - (box ? box.getBoundingClientRect().top : 0) : options.offset != null ? vh(options.offset) : el.offsetHeight;
      if (y > last) {
        up = false; clearTimeout(t); waiting = false;
        el.classList.toggle("is-fx-gone", y > off && (options.end === "hide" || y < full() - 1));
      } else {
        up = true;
        if (y <= 0) el.classList.remove("is-fx-gone");
        else if (!waiting) { waiting = true; t = setTimeout(() => { if (up) el.classList.remove("is-fx-gone"); waiting = false; }, delay); }
      }
      last = y;
    };
    const target = box || window;
    target.addEventListener("scroll", on, { passive: true });
    return () => { target.removeEventListener("scroll", on); clearTimeout(t); el.classList.remove("is-fx-gone", "is-fx-top"); };
  });
})();
