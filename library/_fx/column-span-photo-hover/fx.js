(() => {
  kfFx.register("column-span-photo-hover", (el, { options, hover }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!cols.length || !hover) return;
    // On narrow screens (650px or less by default) the cells stack vertically and are turned off, same as the original
    const min = +(options.min ?? 650);
    const infoOf = (c) => c.querySelector('[data-fx-part="info"]');
    const reset = () => {
      photos.forEach((p) => p.classList.remove("is-on"));
      cols.forEach((c) => { c.classList.remove("is-active"); const i = infoOf(c); if (i) i.classList.remove("is-off"); });
    };
    const on = (idx) => {
      if (innerWidth <= min) return;
      reset();
      cols[idx].classList.add("is-active");
      if (photos[idx]) photos[idx].classList.add("is-on");
      cols.forEach((c, i) => { const info = infoOf(c); if (info && i !== idx) info.classList.add("is-off"); });
    };
    const offs = cols.map((c, i) => {
      const enter = () => on(i);
      const leave = () => { if (innerWidth > min) reset(); };
      c.addEventListener("mouseenter", enter);
      c.addEventListener("mouseleave", leave);
      c.addEventListener("focus", enter);
      c.addEventListener("blur", leave);
      return () => { c.removeEventListener("mouseenter", enter); c.removeEventListener("mouseleave", leave); c.removeEventListener("focus", enter); c.removeEventListener("blur", leave); };
    });
    return () => { offs.forEach((f) => f()); reset(); };
  });
})();
