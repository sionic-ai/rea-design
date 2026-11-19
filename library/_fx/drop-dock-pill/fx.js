(() => {
  // A pill stuck to the bottom (this element) stays hidden normally, and when the bottom edge of the panel chosen by past rises to 8px above the screen bottom, it drops from the from button spot into the pill spot
  // After stretching (.94·1.1), squashing (1.16·.8) and rebounding (.95·1.06) it stops (.72s). The from button stays hidden meanwhile. When lifted again the pill returns to the button position in .32s
  kfFx.register("drop-dock-pill", (el, { options, reduce }) => {
    const src = options.from ? document.querySelector(options.from) : null;
    const past = options.past ? document.querySelector(options.past) : null;
    if (!src || !past) return;
    const dur = +(options.dur ?? 0.72) * 1000, back = +(options.back ?? 0.32) * 1000;
    let on = false, flight = null;
    const size = () => { el.style.width = `${src.offsetWidth}px`; el.style.height = `${src.offsetHeight}px`; };
    size();
    const fly = (show) => {
      flight?.cancel();
      flight = null;
      const a = src.getBoundingClientRect();
      if (show) {
        src.style.visibility = "hidden";
        el.classList.add("fx-ddp-on");
        if (reduce || dur <= 0) return;
        const b = el.getBoundingClientRect();
        flight = el.animate([
          { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)`, easing: "cubic-bezier(.55,0,.9,.45)" },
          { transform: "translate(0, 0) scale(.94, 1.1)", offset: 0.62, easing: "cubic-bezier(.2,.8,.2,1)" },
          { transform: "translate(0, 3px) scale(1.16, .8)", offset: 0.74, easing: "cubic-bezier(.3,0,.3,1)" },
          { transform: "translate(0, -4px) scale(.95, 1.06)", offset: 0.87, easing: "cubic-bezier(.3,0,.3,1)" },
          { transform: "none" },
        ], { duration: dur });
      } else {
        const done = () => { el.classList.remove("fx-ddp-on"); src.style.visibility = ""; flight = null; };
        if (reduce || back <= 0) return done();
        const b = el.getBoundingClientRect();
        flight = el.animate([{ transform: "none" }, { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }], { duration: back, easing: "cubic-bezier(.4,0,.2,1)" });
        flight.onfinish = done;
      }
      el.dispatchEvent(new CustomEvent(show ? "fx:dock" : "fx:undock"));
    };
    let raf = 0;
    const check = () => {
      raf = 0;
      const bottom = past.getBoundingClientRect().bottom, vh = innerHeight;
      const want = on ? bottom < vh + 8 : bottom < vh - 8;
      if (want !== on) { on = want; fly(on); }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(check); };
    addEventListener("scroll", queue, { passive: true });
    const onResize = () => { size(); queue(); };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(size);
    ro.observe(src);
    queue();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", queue);
      removeEventListener("resize", onResize);
      ro.disconnect();
      flight?.cancel();
      el.classList.remove("fx-ddp-on");
      src.style.visibility = "";
      el.style.removeProperty("width");
      el.style.removeProperty("height");
    };
  });
})();
