// Sets up only one of the day scene or night scene by the viewer’s time — the original hides the day plate before 6 o’clock and otherwise hides the night plate (once on open).
// Only the art board changes while the skin (theme) stays as it is, so this differs from daynight-theme-switch, which changes data-theme.
(() => {
  const isNight = (h, from, to) => (from < to ? h >= from && h < to : h >= from || h < to);
  kfFx.register("hour-scene-swap", (el, { options }) => {
    const from = +(options.from ?? 0);
    const to = +(options.to ?? 6);
    const forced = options.hour === undefined || options.hour === "" ? null : +options.hour;
    const every = +(options.every ?? 0);
    const set = () => {
      const h = forced ?? new Date().getHours();
      const mode = isNight(h, from, to) ? "night" : "day";
      if (el.classList.contains(`fx-hour-${mode}`)) return;
      el.classList.remove("fx-hour-day", "fx-hour-night");
      el.classList.add(`fx-hour-${mode}`);
      el.dispatchEvent(new CustomEvent("fx:hour", { bubbles: true, detail: { mode, hour: h } }));
    };
    set();
    const id = every > 0 ? setInterval(set, every * 1000) : 0;
    return () => { if (id) clearInterval(id); el.classList.remove("fx-hour-day", "fx-hour-night"); };
  });
})();
