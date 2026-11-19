// The original hangs the same schedule on both font ready and window load and whichever comes first wins — here it is hooked once, on whichever comes first
(() => {
  kfFx.register("dots-collapse-loader", (el, { options, reduce }) => {
    const dots = el.querySelector('[data-fx-part="dots"]');
    const num = (k, d) => +(options[k] ?? d) * 1000;
    const textAt = num("text-at", 0.5), at = num("at", 1.2), doneAt = num("done", 1.9), hideAt = num("hide", 3.4), beat = Math.max(50, num("beat", 0.4));
    el.style.setProperty("--fx-text-dur", +(options["text-dur"] ?? 0.9) + "s");
    el.style.setProperty("--fx-dur", +(options.dur ?? 1.2) + "s");
    const timers = [];
    let off = false, started = false, n = 0;
    const done = () => { if (!off) el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce) { el.classList.add("fx-hidden"); timers.push(setTimeout(done, 0)); }
    const tick = dots ? setInterval(() => { n = (n + 1) % 4; dots.textContent = ".".repeat(n); }, beat) : 0;
    const start = () => {
      if (started || off || reduce) return;
      started = true;
      timers.push(setTimeout(() => el.classList.add("fx-text-off"), textAt));
      timers.push(setTimeout(() => el.classList.add("fx-lift"), at));
      timers.push(setTimeout(done, doneAt));
      timers.push(setTimeout(() => { el.classList.add("fx-hidden"); clearInterval(tick); }, hideAt));
    };
    document.fonts?.ready.then(start);
    if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
    return () => {
      off = true;
      timers.forEach(clearTimeout);
      clearInterval(tick);
      removeEventListener("load", start);
      el.classList.remove("fx-text-off", "fx-lift", "fx-hidden");
      el.style.removeProperty("--fx-text-dur");
      el.style.removeProperty("--fx-dur");
      if (dots) dots.textContent = "";
    };
  });
})();
