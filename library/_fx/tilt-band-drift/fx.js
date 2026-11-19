// For each band, repeat the first child (one pattern cell) by band width + flow distance to make a single row, and alternate the tilt and flow direction in band order.
// The original shifted the position of the band’s background pattern — if it doesn’t match the pattern’s cell distance it jumps once per loop, same as the original, so lines are not cut in one-cell units
(() => {
  kfFx.register("tilt-band-drift", (el, { options }) => {
    const bands = [...el.querySelectorAll('[data-fx-part="band"]')].filter((b) => b.firstElementChild);
    if (!bands.length) return;
    const dist = +(options.dist ?? 400);
    const tilts = String(options.tilt ?? "-10 14").trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
    const first = options.first == null ? null : +options.first;
    el.style.setProperty("--fx-dist", `${dist}px`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.h != null) el.style.setProperty("--fx-h", `${+options.h}px`);

    const made = bands.map((band, i) => {
      const unit = band.firstElementChild;
      const row = document.createElement("span");
      row.className = "fx-tbd__row";
      row.setAttribute("aria-hidden", "true");
      unit.replaceWith(row);
      row.append(unit);
      const rot = i === 0 && first != null ? first : tilts.length ? tilts[(first != null ? i - 1 : i) % tilts.length] : 0;
      band.style.setProperty("--fx-rot", `${rot}deg`);
      band.style.setProperty("--fx-way", i % 2 === 0 ? "reverse" : "normal");
      const fill = () => {
        const need = band.clientWidth + dist + unit.offsetWidth;
        for (let k = 0; k < 400 && row.scrollWidth < need; k++) row.append(unit.cloneNode(true));
      };
      fill();
      const ro = new ResizeObserver(fill);
      ro.observe(band);
      return { band, row, unit, ro };
    });

    return () => made.forEach(({ band, row, unit, ro }) => {
      ro.disconnect();
      row.replaceWith(unit);
      band.style.removeProperty("--fx-rot");
      band.style.removeProperty("--fx-way");
    });
  });
})();
