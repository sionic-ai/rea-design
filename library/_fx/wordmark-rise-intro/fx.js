(() => {
  // The moment the loader plate lifts, the hero (drop) settles from the top of the document into place, and the wordmark (rise) rises from below while hidden by its own band
  kfFx.register("wordmark-rise-intro", (el, { options, reduce }) => {
    const root = document.documentElement;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const sheet = part("sheet"), drop = part("drop"), band = part("band"), rise = part("rise");
    const num = (k, d) => +(options[k] ?? d);
    const enter = num("enter", 300), min = num("min", 1100), hold = num("hold", 400), slide = num("slide", 760);
    const curtain = num("curtain", 1250), dropDur = num("drop", 1.1), riseDur = num("rise", 1.6), extra = num("settle", 600);
    if (options.ease) el.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    el.style.setProperty("--fx-drop-dur", dropDur + "s");
    el.style.setProperty("--fx-rise-dur", riseDur + "s");
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let done = false;
    const emit = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.remove("is-fx-intro", "is-fx-intro-in", "is-fx-loading");
      root.classList.remove("is-fx-preload");
      el.style.removeProperty("--fx-lift");
      el.style.removeProperty("--fx-rise");
      emit("fx:intro-done");
      dispatchEvent(new Event("resize"));
    };
    if (reduce || (!drop && !rise && !sheet)) {
      sheet?.remove();
      finish();
      return () => {};
    }
    const started = performance.now();
    // Measure the document-based hero top position and the distance to drop the wordmark to the band bottom, both in their initial state
    const measure = () => {
      const had = el.classList.contains("is-fx-intro");
      el.classList.remove("is-fx-intro");
      const lift = drop ? drop.getBoundingClientRect().top + scrollY : 0;
      const gap = band && rise ? band.getBoundingClientRect().bottom - rise.getBoundingClientRect().top + 8 : 0;
      if (had) el.classList.add("is-fx-intro");
      if (lift > 0) el.style.setProperty("--fx-lift", lift + "px");
      if (gap > 0) el.style.setProperty("--fx-rise", gap + "px");
    };
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    measure();
    el.classList.add("is-fx-intro", "is-fx-loading");
    emit("fx:intro-start");
    const onResize = () => { if (!done) measure(); };
    addEventListener("resize", onResize);
    if (sheet) later(() => sheet.classList.add("is-fx-entering"), enter);
    const settle = () => {
      let left = [drop, rise].filter(Boolean);
      later(finish, Math.max(dropDur, riseDur) * 1000 + extra);
      left.forEach((n) => n.addEventListener("transitionend", function end(e) {
        if (e.target !== n || e.propertyName !== "transform") return;
        n.removeEventListener("transitionend", end);
        left = left.filter((m) => m !== n);
        if (!left.length) finish();
      }));
    };
    const go = () => later(() => {
      measure();
      if (sheet) {
        sheet.classList.remove("is-fx-entering");
        sheet.classList.add("is-fx-leaving");
        later(() => { sheet.style.display = "none"; root.classList.remove("is-fx-preload"); }, curtain);
      } else root.classList.remove("is-fx-preload");
      later(() => { el.classList.add("is-fx-intro-in"); settle(); }, slide);
    }, Math.max(0, min - (performance.now() - started)) + hold);
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      removeEventListener("resize", onResize);
      removeEventListener("load", go);
      sheet?.classList.remove("is-fx-entering", "is-fx-leaving");
      if (sheet) sheet.style.display = "none";
      finish();
      el.style.removeProperty("--fx-drop-dur");
      el.style.removeProperty("--fx-rise-dur");
      el.style.removeProperty("--fx-ease");
    };
  });
})();
