// Guide map pin — when the panel is visible the pin drops from above and settles with a bounce, and after a moment speech bubbles pop out one by one in a set order.
// Pressing a pin opens or closes its speech bubble, pressing the plate closes it — after a press the cycle stops and restarts from the beginning after resume seconds.
(() => {
  kfFx.register("pin-balloon-tour", (el, { options, reduce }) => {
    const pins = [...el.querySelectorAll('[data-fx-part="pin"]')];
    if (!pins.length) return;
    const start = +(options.start ?? 1.5), each = +(options.each ?? 0.1);
    const first = +(options.first ?? 4), cycle = +(options.cycle || 6), resume = +(options.resume ?? 10);
    const order = String(options.order || "").split(",").map((s) => parseInt(s, 10) - 1).filter((i) => pins[i]);
    const tour = order.length ? order : pins.map((_, i) => i);
    const timers = new Set();
    const later = (fn, s) => { const t = setTimeout(() => { timers.delete(t); fn(); }, Math.max(0, s * 1000)); timers.add(t); };
    const clear = () => { timers.forEach(clearTimeout); timers.clear(); };
    const born = performance.now();

    const open = (pin) => pins.forEach((p) => p.classList.toggle("is-open", p === pin));
    const run = (k) => { open(pins[tour[k]]); later(() => run((k + 1) % tour.length), cycle); };
    const restart = () => { clear(); later(() => run(0), resume); };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const i = pins.indexOf(e.target), own = e.target.dataset.delay;
        const wait = Math.max(0, start - (performance.now() - born) / 1000) + (own != null ? +own : i * each);
        if (reduce) e.target.classList.add("is-in");
        else setTimeout(() => e.target.classList.add("is-in"), wait * 1000);
      });
    }, { threshold: 0.3 });
    pins.forEach((p) => io.observe(p));

    const onPin = (e) => {
      const pin = e.target.closest('[data-fx-part="pin"]');
      if (!pin || !pins.includes(pin)) return;
      e.stopPropagation();
      if (e.target.closest('[data-fx-part="balloon"]')) {
        if (!e.target.closest("a")) { open(null); restart(); }
        return;
      }
      open(pin.classList.contains("is-open") ? null : pin);
      restart();
    };
    const onBoard = () => { open(null); restart(); };
    el.addEventListener("click", onPin, true);
    el.addEventListener("click", onBoard);
    if (!reduce) later(() => run(0), first);

    return () => {
      clear(); io.disconnect();
      el.removeEventListener("click", onPin, true);
      el.removeEventListener("click", onBoard);
      pins.forEach((p) => p.classList.remove("is-in", "is-open"));
    };
  });
})();
