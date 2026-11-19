(() => {
  // is-on two frames after attaching — if added in the same frame the cover shape isn’t drawn and lifts at once.
  // At at (cover starts to lift) fx:reveal fires (the consumer hooks the next motion such as a wordmark reveal), at hide it hides and fires fx:done.
  kfFx.register("twin-veil-loader", (el, { options, reduce }) => {
    const sec = (v, d) => {
      const o = options[v.replace("--fx-", "")];
      const s = o != null ? String(o) : getComputedStyle(el).getPropertyValue(v).trim();
      if (!s) return d;
      return parseFloat(s) * (s.endsWith("ms") ? 1 : 1000);
    };
    const at = sec("--fx-at", 3500);
    const hide = sec("--fx-hide", 4800);
    if (options.at != null) el.style.setProperty("--fx-at", `${+options.at}s`);
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    let raf = 0;
    const timers = [];
    const start = () => {
      if (reduce) {
        el.classList.add("is-on", "is-done");
        fire("fx:reveal");
        fire("fx:done");
        return;
      }
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          el.classList.add("is-on");
          timers.push(setTimeout(() => fire("fx:reveal"), at));
          timers.push(setTimeout(() => { el.classList.add("is-done"); fire("fx:done"); }, Math.max(at, hide)));
        });
      });
    };
    const ac = new AbortController();
    if (options.wait === "load" && document.readyState !== "complete") addEventListener("load", start, { once: true, signal: ac.signal });
    else start();
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      el.classList.remove("is-on", "is-done");
    };
  });
})();
