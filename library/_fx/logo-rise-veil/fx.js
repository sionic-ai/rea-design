(() => {
  // Original shy common.js: after load wait an extra 1800ms − elapsed time, then lift, lift at 2500ms even if load never arrives. display none 800ms after lifting
  const born = performance.now();
  kfFx.register("logo-rise-veil", (el, { options, reduce }) => {
    const min = +(options.min ?? 1.8) * 1000;
    const max = +(options.max ?? 2.5) * 1000;
    const fade = +(options.fade ?? 0.8);
    const vars = {
      "--fx-fade": `${fade}s`,
      "--fx-rise": options.rise != null ? `${+options.rise}px` : null,
      "--fx-dur": options.dur != null ? `${+options.dur}s` : null,
      "--fx-delay": options.delay != null ? `${+options.delay}s` : null,
      "--fx-hold": options.hold != null ? `${+options.hold}s` : null,
      "--fx-out": options.out != null ? `${+options.out}s` : null,
      "--fx-veil-ease": options.ease ? (/^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease) : null,
    };
    for (const [k, v] of Object.entries(vars)) if (v != null) el.style.setProperty(k, v);
    const timers = [];
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      el.classList.add("is-fx-hidden");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      timers.push(setTimeout(() => el.classList.add("is-fx-gone"), fade * 1000));
    };
    // after — extra seconds to wait after load before the curtain lifts (regardless of when it was opened). Brand: lifts at load + 2s over 2s
    const after = options.after != null ? +options.after * 1000 : null;
    const onLoad = () => timers.push(setTimeout(hide, after != null ? after : Math.max(0, min - (performance.now() - born))));
    const off = () => {
      timers.forEach(clearTimeout);
      removeEventListener("load", onLoad);
      el.classList.remove("is-fx-hidden", "is-fx-gone");
      Object.keys(vars).forEach((k) => el.style.removeProperty(k));
    };
    if (reduce) { hide(); return off; }
    if (document.readyState === "complete") onLoad();
    else addEventListener("load", onLoad, { once: true });
    timers.push(setTimeout(hide, Math.max(0, (after != null && options.max == null ? after + 6000 : max) - (performance.now() - born))));
    return off;
  });
})();
