// Lifting has two conditions (min time · signal to wait for) — lifts only once when both have arrived
(() => {
  kfFx.register("gradient-wipe-loader", (el, { options, reduce }) => {
    const emit = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    if (reduce) { emit("fx:closing"); emit("fx:done"); return; }
    const sp = innerWidth < 768;
    const wipe = +(sp ? options.wipe_sp ?? 3.6 : options.wipe ?? 3.9), hold = +(options.hold ?? 2.2);
    const vars = { "--fx-wipe": wipe, "--fx-reveal": +(options.reveal ?? 3.3), "--fx-focus": +(options.focus ?? 1), "--fx-focus-delay": +(options.focus_delay ?? 0.6) };
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, `${v}s`));
    const timers = [];
    let held = false, waited = !options.wait;
    const close = () => {
      if (!held || !waited || el.classList.contains("is-closing")) return;
      el.classList.add("is-closing");
      emit("fx:closing");
      timers.push(setTimeout(() => { el.setAttribute("aria-hidden", "true"); emit("fx:done"); }, wipe * 1000));
    };
    const onWait = () => { waited = true; close(); };
    if (options.wait) {
      document.addEventListener(options.wait, onWait, { once: true });
      timers.push(setTimeout(onWait, +(options.wait_max ?? 10) * 1000));
    }
    el.classList.add("is-start");
    timers.push(setTimeout(() => { held = true; close(); }, hold * 1000));
    return () => {
      timers.forEach(clearTimeout);
      if (options.wait) document.removeEventListener(options.wait, onWait);
      el.classList.remove("is-start", "is-closing");
      Object.keys(vars).forEach((k) => el.style.removeProperty(k));
    };
  });
})();
