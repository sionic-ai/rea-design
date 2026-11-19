(() => {
  // The needle points left at 0s (270° clockwise from north) and turns clockwise — if a dot is at (x%, y%) of the panel, it is delayed by the time to reach that angle so it pops in the same revolution
  const at = (x, y, sweep) => (((Math.atan2(x - 50, 50 - y) * 180 / Math.PI - 270) % 360 + 360) % 360) / 360 * sweep;

  kfFx.register("radar-sweep", (el, { options }) => {
    const sweep = +(options.sweep ?? 10) || 10;
    el.style.setProperty("--fx-sweep", `${sweep}s`);

    const dish = document.createElement("div");
    dish.className = "fx-radar-sweep__dish";
    dish.setAttribute("aria-hidden", "true");
    const arm = document.createElement("div");
    arm.className = "fx-radar-sweep__arm";
    for (let i = 0; i < 4; i++) {
      const ring = document.createElement("div");
      ring.className = "fx-radar-sweep__ring";
      arm.append(ring);
    }
    dish.append(arm);
    el.prepend(dish);

    const dots = [];
    const place = () => {
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;
      el.querySelectorAll('[data-fx-part="blip"]').forEach((blip) => {
        const r = blip.getBoundingClientRect();
        const x = ((r.left - box.left) / box.width) * 100;
        const y = ((r.top - box.top) / box.height) * 100;
        blip.style.setProperty("--fx-radar-sweep-at", `${at(x, y, sweep).toFixed(2)}s`);
      });
    };
    el.querySelectorAll('[data-fx-part="blip"]').forEach((blip) => {
      const dot = document.createElement("span");
      dot.className = "fx-radar-sweep__dot";
      dot.setAttribute("aria-hidden", "true");
      blip.prepend(dot);
      dots.push(dot);
    });
    place();

    el.dataset.radarLive = "false";
    const io = new IntersectionObserver(([e]) => { el.dataset.radarLive = String(e.isIntersecting); }, { threshold: 0.2 });
    io.observe(el);
    const ro = new ResizeObserver(place);
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      dish.remove();
      dots.forEach((d) => d.remove());
      delete el.dataset.radarLive;
      el.style.removeProperty("--fx-sweep");
      el.querySelectorAll('[data-fx-part="blip"]').forEach((b) => b.style.removeProperty("--fx-radar-sweep-at"));
    };
  });
})();
