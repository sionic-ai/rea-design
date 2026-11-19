(() => {
  // The wobble that plays on release is a default animation and would run once right on open — enable it only after the first touch (if look: intro, from the start like the original)
  kfFx.register("elastic-pop-hover", (el, { options }) => {
    if (options.scale != null) el.style.setProperty("--fx-scale", +options.scale);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.back != null) el.style.setProperty("--fx-back", `${+options.back}s`);
    const ready = () => el.classList.add("fx-epop-ready");
    el.addEventListener("pointerenter", ready, { once: true });
    el.addEventListener("pointerdown", ready, { once: true });
    return () => {
      el.removeEventListener("pointerenter", ready);
      el.removeEventListener("pointerdown", ready);
      el.classList.remove("fx-epop-ready");
      ["--fx-scale", "--fx-dur", "--fx-back"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
