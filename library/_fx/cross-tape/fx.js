(() => {
  // Two bands cross in an X (front band -tilt°, back band +tilt°) and flow in opposite directions. Inside each band every row repeats its content in two copies to loop endlessly,
  // Speeds are px/s measured at 1440 width, scaled in proportion to the panel width — text line 36.7, thick band (data-key="band") 148.5. Stops when off-screen
  kfFx.register("cross-tape", (el, { options, reduce }) => {
    const strips = [...el.querySelectorAll(':scope > [data-fx-part="strip"]')];
    if (!strips.length) return;
    const tilt = +(options.tilt ?? 3.6);
    const thin = +(options.thin ?? 36.7), band = +(options.band ?? 148.5);
    el.style.setProperty("--fx-tilt", `${tilt}deg`);
    const rows = [];
    strips.forEach((strip, si) => strip.querySelectorAll('[data-fx-part="row"]').forEach((row) => {
      if (!row.firstElementChild && !row.textContent.trim()) return;
      const track = document.createElement("div");
      track.className = "fx-cross-tape__track";
      track.innerHTML = row.innerHTML + row.innerHTML;
      track.setAttribute("aria-hidden", "true");
      const keep = row.innerHTML;
      row.innerHTML = "";
      row.append(track);
      rows.push({ row, track, keep, dir: si % 2 ? 1 : -1, speed: row.dataset.key === "band" ? band : thin, x: 0, half: 0 });
    }));
    const measure = () => rows.forEach((r) => { r.half = r.track.scrollWidth / 2; if (r.dir > 0) r.x = -r.half; });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let on = false;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(el);
    const tick = (time, dt) => {
      if (!on || reduce) return;
      const k = el.clientWidth / 1440;
      rows.forEach((r) => {
        if (!r.half) return;
        r.x += r.dir * r.speed * k * (Math.max(1, dt) / 1000);
        if (r.x <= -r.half) r.x += r.half;
        if (r.x > 0) r.x -= r.half;
        r.track.style.transform = `translate3d(${r.x}px, 0, 0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      el.style.removeProperty("--fx-tilt");
      rows.forEach((r) => (r.row.innerHTML = r.keep));
    };
  });
})();
