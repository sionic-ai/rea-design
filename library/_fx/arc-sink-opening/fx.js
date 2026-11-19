(() => {
  // Original top.js: on load the logo .show (blur·sepia → sharp, opacity .7s·blur 1s) → at 1.5s the cover .end — clip-path circle(100% at 50% 100%) is
  // Lifts away while settling down in 2.3s cubic-bezier(.33,.06,.17,.98) with circle(100% at 50% 280%), then becomes transparent and hidden when done
  kfFx.register("arc-sink-opening", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    const hold = +(options.hold ?? 1.5), dur = +(options.dur ?? 2.3);
    const from = options.from || "100%", to = options.to || "280%", size = options.size || "100%";
    const ease = options.ease || "0.33,0.06,0.17,0.98";
    const lock = options.lock === "true";
    const root = document.documentElement;
    const say = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const timers = [];
    el.style.setProperty("--fx-clip-from", `circle(${size} at 50% ${from})`);
    el.style.setProperty("--fx-clip-to", `circle(${size} at 50% ${to})`);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-ease", `cubic-bezier(${ease})`);
    if (reduce) {
      el.classList.add("is-end");
      say("fx:open");
      say("fx:done");
      return () => el.classList.remove("is-end");
    }
    if (lock) root.style.overflow = "hidden";
    const go = () => {
      logo?.classList.add("is-show");
      timers.push(setTimeout(() => {
        el.classList.add("is-end");
        if (lock) root.style.overflow = "";
        say("fx:open");
      }, hold * 1000));
      timers.push(setTimeout(() => say("fx:done"), (hold + dur) * 1000));
    };
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
    return () => {
      removeEventListener("load", go);
      timers.forEach(clearTimeout);
      if (lock) root.style.overflow = "";
      el.classList.remove("is-end");
      logo?.classList.remove("is-show");
    };
  });
})();
