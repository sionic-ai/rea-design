// Each section-head strip gets a number tab of (number of preceding strips + 1), stacked so later strips sit on top — when the next section rises, the strip with one more tab covers the previous strip.
(() => {
  kfFx.register("note-band-stack", (el, { options }) => {
    const bands = [...el.children].filter((c) => c.dataset.fxPart === "band");
    if (!bands.length) return;
    const base = +(options.z ?? 100);
    const tilt = [-2, -8, -14, 4, -6];
    const made = [];
    bands.forEach((b, i) => {
      b.style.zIndex = String(base + i);
      if (b.querySelector('[data-fx-part="note"]')) return;
      for (let k = 0; k <= i; k++) {
        const n = document.createElement("span");
        n.dataset.fxPart = "note";
        n.textContent = String(k + 1).padStart(2, "0");
        n.style.setProperty("--fx-i", k);
        n.style.setProperty("--fx-k", k % 2);
        n.style.setProperty("--fx-r", `${tilt[k % tilt.length]}deg`);
        b.append(n);
        made.push(n);
      }
    });
    return () => { made.forEach((n) => n.remove()); bands.forEach((b) => (b.style.zIndex = "")); };
  });
})();
