// Entry door: keep the curtain as is, sink only the text into the curtain color, then lift the curtain — the order of text vanishing into darkness before the page is revealed is the charm of this part.
// Like the original, the cursor is the word ”enter” instead of an arrow — the color is read from the skin and drawn as a data URI (to avoid hardcoding color in css).
(() => {
  kfFx.register("ink-sink-gate", (el, { options, reduce }) => {
    const ink = el.querySelector(':scope > [data-fx-part="ink"]');
    const ac = new AbortController();
    const sec = (k, d) => +(options[k] ?? d);
    const wait = sec("wait", 0.05), show = sec("show", 1), sink = sec("ink", 1), hold = sec("hold", 1), fade = sec("fade", 1.5);
    el.style.setProperty("--fx-show", `${show}s`);
    el.style.setProperty("--fx-ink", `${sink}s`);
    el.style.setProperty("--fx-fade", `${fade}s`);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    const label = options.label ?? "enter";
    if (label) {
      const css = getComputedStyle(el);
      const color = css.getPropertyValue("--kf-contrast-ink").trim() || css.color;
      const font = (css.getPropertyValue("--kf-font-sans").trim() || "sans-serif").replace(/"/g, "'");
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='20'><text x='0' y='15' font-size='15' font-family="${font}" fill='${color}'>${label}</text></svg>`;
      el.style.cursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 0 15, pointer`;
    }
    const lock = options.lock === "1" || options.lock === "true";
    if (lock) document.documentElement.style.overflow = "hidden";
    const timers = [];
    const later = (fn, s) => timers.push(setTimeout(fn, reduce ? 0 : s * 1000));
    if (ink) later(() => el.classList.add("is-shown"), wait);
    else el.classList.add("is-shown");
    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      el.classList.add("is-sunk");
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
      later(() => {
        el.classList.add("is-gone");
        if (lock) document.documentElement.style.removeProperty("overflow");
        el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      }, hold);
    };
    el.addEventListener("click", close, { signal: ac.signal });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, { signal: ac.signal });
    return () => {
      ac.abort();
      timers.forEach(clearTimeout);
      el.classList.remove("is-shown", "is-sunk", "is-gone");
      el.style.removeProperty("cursor");
      ["--fx-show", "--fx-ink", "--fx-fade", "--fx-ease"].forEach((k) => el.style.removeProperty(k));
      if (lock) document.documentElement.style.removeProperty("overflow");
    };
  });
})();
