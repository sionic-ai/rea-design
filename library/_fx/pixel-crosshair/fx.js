// Center crosshair — on enter the square grows with size-in (20px) and turns turn (90°), .05s later the fill unfolds by clip-path and the letters go from below (100%) to 0,
// On leave it returns to size-out (10px)·0°, and the text exits upward (-100%) then returns to the lower position (.8s/.75s power3.out — Brand AnimatePixel).
// Two kinds of targets: the document’s [data-crosshair="Character"] fx:crosshair fired when the pointer is over the element, or at document if there is no element, like a WebGL panel { on, label }.
(() => {
  kfFx.register("pixel-crosshair", (el, { options, reduce, hover }) => {
    const box = el.querySelector('[data-fx-part="box"]');
    const fill = el.querySelector('[data-fx-part="fill"]');
    const label = el.querySelector('[data-fx-part="label"]');
    if (!box) return;
    const text = label?.firstElementChild || null;
    const sizeIn = +(options["size-in"] ?? 20), sizeOut = +(options["size-out"] ?? 10), turn = +(options.turn ?? 90);
    const dur = reduce ? 0 : +(options.dur ?? 0.8), fillDur = reduce ? 0 : +(options["fill-dur"] ?? 0.75), fillDelay = reduce ? 0 : +(options["fill-delay"] ?? 0.05);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    let on = false;
    const show = (words) => {
      if (text && words != null) text.textContent = words;
      if (on) return;
      on = true;
      gsap.to(box, { width: sizeIn, height: sizeIn, rotate: turn, duration: dur, ease, overwrite: "auto" });
      if (fill) gsap.to(fill, { clipPath: "inset(0%)", duration: fillDur, delay: fillDelay, ease, overwrite: "auto" });
      if (text) gsap.fromTo(text, { yPercent: 100 }, { yPercent: 0, duration: dur, ease, overwrite: "auto" });
    };
    const hide = (words) => {
      if (text && words === "") text.textContent = "";
      if (!on) return;
      on = false;
      gsap.to(box, { width: sizeOut, height: sizeOut, rotate: 0, duration: dur, ease, overwrite: "auto" });
      if (fill) gsap.to(fill, { clipPath: "inset(100%)", duration: fillDur, delay: fillDelay, ease, overwrite: "auto" });
      if (text) gsap.to(text, { yPercent: -100, duration: dur, ease, overwrite: "auto", onComplete: () => gsap.set(text, { yPercent: 100 }) });
    };
    const ac = new AbortController(), sig = { signal: ac.signal };
    if (text) gsap.set(text, { yPercent: 100 });
    document.addEventListener("fx:crosshair", (e) => (e.detail?.on ? show(e.detail.label) : hide(e.detail?.label)), sig);
    if (hover) {
      document.addEventListener("pointerover", (e) => {
        const t = e.target.closest?.("[data-crosshair]");
        if (t) show(t.getAttribute("data-crosshair"));
      }, sig);
      document.addEventListener("pointerout", (e) => {
        const t = e.target.closest?.("[data-crosshair]");
        if (t && !t.contains(e.relatedTarget)) hide();
      }, sig);
    }
    return () => { ac.abort(); gsap.killTweensOf([box, fill, text].filter(Boolean)); gsap.set([box, fill, text].filter(Boolean), { clearProps: "all" }); };
  });
})();
