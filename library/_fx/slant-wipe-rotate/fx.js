(() => {
  // The original moves only two classes (show_active · show_next) and a CSS keyframe handles the reveal — since the reveal attached to the current section starts after the delay
  // At the moment of switching, the current section is still visible with the next one laid underneath. The caller uses fx:slide to run the next section’s entrance (graph drawing, etc.).
  kfFx.register("slant-wipe-rotate", (el, { options, reduce }) => {
    const slides = [...el.children].filter((n) => n.getAttribute("data-fx-part") === "slide");
    if (slides.length < 2) return;
    const every = (+options.every || 7.6) * 1000;
    const first = +(options.first ?? (options.every || 7.6)) * 1000;
    const dur = +(options.dur ?? 1.6), delay = +(options.delay ?? 1), slant = +(options.slant ?? 7);
    el.style.setProperty("--fx-dur", dur + "s");
    el.style.setProperty("--fx-delay", delay + "s");
    el.style.setProperty("--fx-slant", slant + "%");
    if (options.ease) el.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    if (reduce) return () => ["--fx-dur", "--fx-delay", "--fx-slant", "--fx-ease"].forEach((p) => el.style.removeProperty(p));
    let i = -1, timer = 0, playing = options.start !== "wait";
    const step = () => {
      const cur = i < 0 ? 0 : (i + 1) % slides.length;
      const next = (cur + 1) % slides.length;
      slides.forEach((s, k) => { s.dataset.state = k === cur ? "wipe" : k === next ? "next" : "rest"; });
      i = cur;
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: next, prev: cur } }));
      timer = setTimeout(step, every);
    };
    const play = () => { if (timer) return; playing = true; timer = setTimeout(step, first); };
    const goNow = () => { clearTimeout(timer); timer = 0; step(); };
    const pause = () => { clearTimeout(timer); timer = 0; };
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:go", goNow);
    el.addEventListener("fx:pause", pause);
    if (playing) play();
    return () => {
      pause();
      el.removeEventListener("fx:play", play);
      el.removeEventListener("fx:go", goNow);
      el.removeEventListener("fx:pause", pause);
      slides.forEach((s) => delete s.dataset.state);
      ["--fx-dur", "--fx-delay", "--fx-slant", "--fx-ease"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
