// Photo crossfade — the original (homeFunc) turns on the first slide at window load and moves to the next one every N seconds. The motion is done by CSS transitions and
// Here only the markers are swapped: next section is-act, current section is-out, and sections turned off earlier lose all markers.
(() => {
  kfFx.register("zoom-fade-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = Math.max(0.5, +(options.every ?? 10)) * 1000;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.from != null) el.style.setProperty("--fx-from", String(+options.from));
    if (options.to != null) el.style.setProperty("--fx-to", String(+options.to));
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    let n = 0, timer = 0;
    const next = () => {
      slides.forEach((s) => s.classList.contains("is-out") && s.classList.remove("is-act", "is-out"));
      slides[n].classList.add("is-out");
      n = (n + 1) % slides.length;
      slides[n].classList.add("is-act");
      timer = setTimeout(next, every);
    };
    const start = () => {
      slides[0].classList.add("is-act");
      if (!reduce && slides.length > 1) timer = setTimeout(next, every);
    };
    // The original turns on the first section after all images have come in (window load) — before that, the zoom would end on an empty plate
    let waiting = false;
    if (document.readyState === "complete") start();
    else { waiting = true; addEventListener("load", start, { once: true }); }
    return () => {
      clearTimeout(timer);
      if (waiting) removeEventListener("load", start);
      slides.forEach((s) => s.classList.remove("is-act", "is-out"));
      ["--fx-dur", "--fx-from", "--fx-to", "--fx-ease"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
