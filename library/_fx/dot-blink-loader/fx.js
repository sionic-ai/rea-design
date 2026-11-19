// The curtain lifts once the fonts, images and minimum wait are all ready — the curtain must be in the HTML from the start so the body doesn’t show through in the first paint
(() => {
  kfFx.register("dot-blink-loader", (el, { options, reduce }) => {
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    dots.forEach((d, i) => d.style.setProperty("--fx-i", i));
    const fade = +(options.fade ?? 0.5), min = +(options.min ?? 0.25) * 1000, fontWait = +(options.fonts ?? 3) * 1000;
    el.style.setProperty("--fx-fade", fade + "s");
    if (options.cycle) el.style.setProperty("--fx-cycle", +options.cycle + "s");
    const timers = [];
    let off = false;
    const done = () => { if (!off) el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const lift = () => {
      if (off) return;
      el.classList.add("fx-done");
      timers.push(setTimeout(done, reduce ? 0 : fade * 1000));
    };
    if (reduce) lift();
    else {
      const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
      const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(fontWait)]);
      const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
      Promise.all([fonts, loaded, wait(min)]).then(lift);
    }
    return () => {
      off = true;
      timers.forEach(clearTimeout);
      el.classList.remove("fx-done");
      dots.forEach((d) => d.style.removeProperty("--fx-i"));
      el.style.removeProperty("--fx-fade");
      el.style.removeProperty("--fx-cycle");
    };
  });
})();
