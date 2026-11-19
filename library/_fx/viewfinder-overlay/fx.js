// Camera viewfinder — four fixed corner brackets, center aim and REC indicator are overlaid on the page with inverted blending.
// Draws children in if there are none. If the top option element is down on screen (by its height), shrink it under the viewfinder and fit in .5s.
(() => {
  kfFx.register("viewfinder-overlay", (el, { options, reduce }) => {
    const made = [];
    if (!el.querySelector('[data-fx-part="corner"]')) {
      for (let i = 1; i <= 4; i++) {
        const c = document.createElement("span");
        c.dataset.fxPart = "corner";
        c.dataset.key = String(i);
        el.append(c);
        made.push(c);
      }
    }
    if (!el.querySelector('[data-fx-part="center"]')) {
      const c = document.createElement("span");
      c.dataset.fxPart = "center";
      el.append(c);
      made.push(c);
    }
    if (options.rec !== "off" && !el.querySelector('[data-fx-part="rec"]')) {
      const r = document.createElement("span");
      r.dataset.fxPart = "rec";
      r.textContent = "REC";
      el.append(r);
      made.push(r);
    }
    const bar = options.top ? document.querySelector(options.top) : null;
    let ro = null, onScroll = null;
    if (bar) {
      const fit = () => {
        const b = bar.getBoundingClientRect();
        const shown = b.bottom > 1 && getComputedStyle(bar).opacity !== "0";
        el.style.setProperty("--fx-top", shown ? `${Math.round(b.bottom)}px` : "0px");
      };
      onScroll = () => requestAnimationFrame(fit);
      addEventListener("scroll", onScroll, { passive: true });
      bar.addEventListener("transitionend", fit);
      ro = new ResizeObserver(fit);
      ro.observe(bar);
      fit();
      if (reduce) el.style.transitionDuration = "0s";
    }
    return () => {
      made.forEach((n) => n.remove());
      if (onScroll) removeEventListener("scroll", onScroll);
      ro?.disconnect();
      el.style.removeProperty("--fx-top");
      el.style.removeProperty("transition-duration");
    };
  });
})();
