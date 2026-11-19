(() => {
  // Adds is-lifted to the next frame that attaches to run the CSS transition — on the same frame the initial look is never drawn and it vanishes at once.
  // wait: with load, it lifts only after even the pictures have arrived (the original lifts right at DOMContentLoaded). When all have lifted, fx:done.
  kfFx.register("lift-veil-loader", (el, { options, reduce }) => {
    const ms = (v, d) => {
      const s = getComputedStyle(el).getPropertyValue(v).trim();
      return s ? parseFloat(s) * (s.endsWith("ms") ? 1 : 1000) : d;
    };
    let raf = 0, timer = 0;
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const lift = () => {
      if (reduce) {
        el.classList.add("is-lifted");
        done();
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          el.classList.add("is-lifted");
          timer = setTimeout(done, ms("--fx-hide", 1200) + 200);
        });
      });
    };
    const ac = new AbortController();
    if (options.wait === "load" && document.readyState !== "complete") addEventListener("load", lift, { once: true, signal: ac.signal });
    else lift();
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.classList.remove("is-lifted");
    };
  });
})();
