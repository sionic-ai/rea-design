(() => {
  // Stacked photo panels fade (1.5s) to the next sheet at a steady tempo (default 5.5s) — the new sheet turns on top (the old one stays beneath, then hides behind),
  // The photo in the active section slowly zooms to 1.05x for the length of the beat, and inactive sections return to normal size after the fade ends.
  kfFx.register("fade-zoom-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = Math.max(0.5, +(options.every || 5.5)), fade = +(options.fade ?? 1.5), zoom = +(options.zoom ?? 1.05);
    el.style.setProperty("--fx-fade", fade + "s");
    el.style.setProperty("--fx-every", every + "s");
    el.style.setProperty("--fx-zoom", zoom);
    // look: out — the active section retreats straight from zoom× to 1 over zoom-dur seconds (Brand 1.3 → 1, 9s)
    if (options["zoom-dur"] != null) el.style.setProperty("--fx-zoom-dur", +options["zoom-dur"] + "s");
    // look: pan means a lit section flows straight sideways by pan over pan-dur seconds (Brand slick hero 15s · −8% · photo width 110%)
    if (options.pan != null) el.style.setProperty("--fx-pan", options.pan);
    // pan-from is where the flow starts (Brand −35px → 0 — flows to the right)
    if (options["pan-from"] != null) el.style.setProperty("--fx-pan-from", options["pan-from"]);
    if (options["pan-dur"] != null) el.style.setProperty("--fx-pan-dur", +options["pan-dur"] + "s");
    if (options["pan-width"] != null) el.style.setProperty("--fx-pan-width", options["pan-width"]);
    // curve is the fade · approach curve of look: in (brand has both linear — fade 2s · approach 7.5s)
    if (options.curve) el.style.setProperty("--fx-curve", options.curve);
    // zoom-curve is the pull-back curve of look: out (default linear — Brand uses ease-in-out 9.5s)
    if (options["zoom-curve"]) el.style.setProperty("--fx-zoom-curve", options["zoom-curve"]);
    // beat is the whole beat in which sections change (seconds) — where the fade is longer than the beat and they overlap while fading out (Brand 6.5s beat · 8.5s fade) can’t be written as every + fade
    const beat = options.beat != null ? Math.max(0.5, +options.beat) : every + fade;
    let i = 0, timer = 0, hide = 0;
    const show = (n) => {
      const prev = slides[i];
      i = (n + slides.length) % slides.length;
      slides.forEach((s) => s.classList.remove("is-prev"));
      if (prev !== slides[i]) { prev.classList.remove("is-active"); prev.classList.add("is-prev"); }
      slides[i].classList.add("is-active");
      clearTimeout(hide);
      hide = setTimeout(() => prev.classList.remove("is-prev"), fade * 1000);
    };
    // first: fade — turns on the first section from transparent with a fade too — like Brand, if is-active attaches right after the body is swapped, it attaches before the first style calculation and turns on without a fade
    if (options.first === "fade" && !reduce) void slides[0].offsetWidth;
    slides[0].classList.add("is-active");
    if (!reduce && slides.length > 1) timer = setInterval(() => show(i + 1), beat * 1000);
    const next = () => show(i + 1), prev = () => show(i - 1);
    el.addEventListener("fx:next", next);
    el.addEventListener("fx:prev", prev);
    return () => { clearInterval(timer); clearTimeout(hide); el.removeEventListener("fx:next", next); el.removeEventListener("fx:prev", prev); slides.forEach((s) => s.classList.remove("is-active", "is-prev")); ["--fx-fade", "--fx-every", "--fx-zoom", "--fx-zoom-dur", "--fx-pan", "--fx-pan-dur", "--fx-pan-width", "--fx-pan-from", "--fx-curve", "--fx-zoom-curve"].forEach((k) => el.style.removeProperty(k)); };
  });
})();
