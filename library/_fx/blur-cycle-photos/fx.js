(() => {
  // "10-30" Same range option — a single number is used as is
  const range = (s, d) => { const [a, b] = String(s ?? d).split("-").map(Number); return [a, Number.isFinite(b) ? b : a]; };
  const rand = ([a, b]) => Math.random() * (b - a) + a;
  kfFx.register("blur-cycle-photos", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length) return;
    const first = range(options.first, "10-30"), next = range(options.next, "20-40"), wait = range(options.delay, "1-5");
    const gap = +(options.gap ?? 0.5) * 1000;
    const timers = new Set(), offs = [];
    photos.forEach((p) => {
      const shots = [...p.querySelectorAll('[data-fx-part="shot"]')];
      shots.forEach((s, i) => s.classList.toggle("is-fx-on", i === shots.length - 1));
      if (reduce) { p.classList.add("is-fx-still"); return; }
      p.style.setProperty("--fx-dur", `${rand(first)}s`);
      p.style.setProperty("--fx-delay", `${rand(wait)}s`);
      p.classList.add("is-fx-cycle");
      // When one cycle (blurry → clear → blurry) ends, rest for gap and move to the next photo, with a new length drawn from the next range
      const onEnd = (e) => {
        if (e.target !== p) return;
        p.classList.remove("is-fx-cycle");
        const t = setTimeout(() => {
          timers.delete(t);
          if (shots.length > 1) {
            const k = shots.findIndex((s) => s.classList.contains("is-fx-on"));
            shots.forEach((s, i) => s.classList.toggle("is-fx-on", i === (k + 1) % shots.length));
          }
          p.style.setProperty("--fx-dur", `${rand(next)}s`);
          p.style.setProperty("--fx-delay", "0s");
          void p.offsetWidth;
          p.classList.add("is-fx-cycle");
        }, gap);
        timers.add(t);
      };
      p.addEventListener("animationend", onEnd);
      offs.push(() => { p.removeEventListener("animationend", onEnd); p.classList.remove("is-fx-cycle", "is-fx-still"); p.style.removeProperty("--fx-dur"); p.style.removeProperty("--fx-delay"); });
    });
    return () => { timers.forEach(clearTimeout); offs.forEach((f) => f()); };
  });
})();
