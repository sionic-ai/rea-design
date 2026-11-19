(() => {
  kfFx.register("border-frame-open", (el, { options, reduce }) => {
    const STATES = ["is-open", "is-out", "is-done"];
    if (reduce) { el.classList.add(...STATES); return () => el.classList.remove(...STATES); }
    const sec = (k, d) => Math.max(0, +(options[k] ?? d));
    const delay = sec("delay", 1.8), dur = sec("dur", 2.5), grow = sec("grow", 4);
    const out = sec("out", 4), outDur = sec("out-dur", 0.4), reveal = sec("reveal", 4.2), revealDur = sec("reveal-dur", 1);
    const lock = options.lock === "on";
    el.style.setProperty("--fx-dur", dur + "s");
    el.style.setProperty("--fx-grow", grow + "s");
    el.style.setProperty("--fx-out-dur", outDur + "s");
    el.style.setProperty("--fx-reveal-dur", revealDur + "s");

    const root = document.documentElement;
    const mark = (s) => el.classList.add("is-" + s);
    const unlock = () => { if (lock) { root.style.overflow = ""; document.body.style.overflow = ""; } };
    const timers = [];
    const at = (s, fn) => timers.push(setTimeout(fn, s * 1000));

    // The original starts at load, after images are all downloaded — waits while showing the logo
    const start = () => {
      if (lock) { scrollTo(0, 0); root.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
      at(delay, () => { mark("open"); el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true })); });
      at(out, () => mark("out"));
      at(reveal, () => { mark("done"); unlock(); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); });
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });

    return () => {
      removeEventListener("load", start);
      timers.forEach(clearTimeout);
      unlock();
      el.classList.remove(...STATES);
      ["--fx-dur", "--fx-grow", "--fx-out-dur", "--fx-reveal-dur"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
