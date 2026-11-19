(() => {
  // Each time the pointer enters, the next slide of the photo cell fills up from the bottom, height 0 → 100%, covering the current one (the current one stays underneath).
  // The inner image is attached to the cell bottom and does not move, only the clipped height grows. Pointers entering while it rises are ignored, and releasing does not rewind.
  kfFx.register("rise-swap-hover", (el, { options, reduce, hover }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length) return;
    const delay = +(options.delay ?? 0.1);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    let c = 0, busy = false, wait = 0, safety = 0, raf = 0;
    photos.forEach((p, i) => { p.classList.toggle("is-current", i === 0); p.classList.remove("is-back"); });
    // The original adds -loaded after all photos come in, so the first one also fills once
    raf = requestAnimationFrame(() => el.classList.add("is-loaded"));
    const done = () => { busy = false; clearTimeout(safety); };
    const enter = (e) => {
      if (reduce || !hover || busy || photos.length < 2 || (e.pointerType && e.pointerType !== "mouse")) return;
      busy = true;
      const prev = photos[c];
      c = (c + 1) % photos.length;
      const next = photos[c];
      photos.forEach((p) => p !== prev && p.classList.remove("is-back", "is-current"));
      prev.classList.remove("is-current");
      prev.classList.add("is-back");
      wait = setTimeout(() => {
        next.classList.add("is-current");
        const dur = parseFloat(getComputedStyle(next).animationDuration) || 0.7;
        safety = setTimeout(done, (dur + 0.1) * 1000);
      }, delay * 1000);
    };
    const end = (e) => { if (e.target.matches?.('[data-fx-part="photo"].is-current')) done(); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("animationend", end);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(wait); clearTimeout(safety);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("animationend", end);
      el.classList.remove("is-loaded");
      photos.forEach((p) => p.classList.remove("is-current", "is-back"));
      ["--fx-dur", "--fx-ease"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
