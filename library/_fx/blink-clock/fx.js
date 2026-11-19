// A hand-less text clock — places ”Place 03:00 AM” in the corner of the hero photo, rewrites the time every second, and only the colon blinks on and off.
// The original site attaches and only shows the text on the first tick 1 second later, so the default is the same (wait: 0 shows it immediately)
(() => {
  kfFx.register("blink-clock", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const h = part("hour"), m = part("min"), colon = part("colon"), period = part("period");
    if (!h || !m) return;
    const h12 = options.hour12 !== "off";
    const every = +options.every || 1;
    const wait = reduce ? 0 : +(options.wait ?? every);
    const blink = options.blink !== "off" && !reduce;
    // With tz, the current time in that city (like Asia/Tokyo) — without it, the viewer’s own time (as in the original)
    const fmt = options.tz ? new Intl.DateTimeFormat("en-US", { timeZone: options.tz, hour: "numeric", minute: "numeric", hourCycle: "h23" }) : null;
    const now = () => {
      if (!fmt) { const d = new Date(); return [d.getHours(), d.getMinutes()]; }
      const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
      return [+p.hour % 24, +p.minute];
    };
    let on = true;
    const tick = () => {
      const [hh, mm] = now();
      const shown = h12 ? hh % 12 || 12 : hh;
      h.textContent = String(shown).padStart(2, "0");
      m.textContent = String(mm).padStart(2, "0");
      if (period) period.textContent = h12 ? (hh >= 12 ? "PM" : "AM") : "";
      if (colon) colon.classList.toggle("is-off", blink && !on);
      on = !on;
      el.classList.add("is-live");
    };
    let timer = null;
    const start = setTimeout(() => { tick(); timer = setInterval(tick, every * 1000); }, wait * 1000);
    return () => { clearTimeout(start); clearInterval(timer); el.classList.remove("is-live"); colon?.classList.remove("is-off"); };
  });
})();
