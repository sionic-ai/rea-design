(() => {
  kfFx.register("logo-blur-loader", (el, { options, reduce }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const each = +(options.each ?? 0.3), dur = +(options.dur ?? 1.5), hold = +(options.hold ?? 2.7), out = +(options.out ?? 1);
    const stack = document.createElement("div");
    stack.className = "fx-lb-stack";
    stack.append(...layers);
    el.append(stack);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-hold", `${hold}s`);
    el.style.setProperty("--fx-out", `${out}s`);
    if (options.blur != null) el.style.setProperty("--fx-blur", `${+options.blur}px`);
    // Delaying the first piece and the curve are options — for fuji-gen one logo is .1s late at 1s power4.out, the cover 1.5s power1.out
    const delay = +(options.delay ?? 0);
    layers.forEach((n, i) => n.style.setProperty("--fx-d", `${delay + i * each}s`));
    const css = (c) => (/^-?[\d.]+\s*,/.test(c) ? `cubic-bezier(${c})` : c);
    if (options.ease) el.style.setProperty("--fx-ease", css(options.ease));
    if (options["out-ease"]) el.style.setProperty("--fx-out-ease", css(options["out-ease"]));
    const timers = [];
    if (reduce) el.classList.add("fx-lb-out", "fx-lb-done");
    else {
      el.classList.add("fx-lb-wait");
      // Remove after drawing one frame so the transition starts from the initial state
      let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => { el.classList.remove("fx-lb-wait"); el.classList.add("fx-lb-out"); })));
      timers.push(() => cancelAnimationFrame(raf));
      const t = setTimeout(() => el.classList.add("fx-lb-done"), (hold + out) * 1000 + 50);
      timers.push(() => clearTimeout(t));
    }
    return () => {
      timers.forEach((f) => f());
      el.classList.remove("fx-lb-wait", "fx-lb-out", "fx-lb-done");
      el.prepend(...layers);
      stack.remove();
      layers.forEach((n) => n.style.removeProperty("--fx-d"));
      for (const k of ["--fx-dur", "--fx-hold", "--fx-out", "--fx-blur", "--fx-ease", "--fx-out-ease"]) el.style.removeProperty(k);
    };
  });
})();
