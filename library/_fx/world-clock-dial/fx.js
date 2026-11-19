(() => {
  kfFx.register("world-clock-dial", (el, { options, reduce }) => {
    const hour = el.querySelector('[data-fx-part="hour"]');
    const min = el.querySelector('[data-fx-part="min"]');
    if (!hour || !min) return;
    const sec = el.querySelector('[data-fx-part="sec"]');
    const ampm = el.querySelector('[data-fx-part="ampm"]');
    // The date text is hard to keep inside the pin panel, so look up to the panel just above (the parent)
    const find = (k) => el.querySelector(`[data-fx-part="${k}"]`) || (el.parentElement && el.parentElement.querySelector(`[data-fx-part="${k}"]`));
    const parts = ["year", "month", "date", "day"].map((k) => [k, find(k)]).filter(([, n]) => n);
    const zone = +(options.zone ?? 9);
    const lag = +(options.lag ?? 0);
    const days = String(options.days || "Sun,Mon,Tue,Wed,Thu,Fri,Sat").split(",");
    const every = reduce ? 60000 : +options.every || 10;
    const tick = () => {
      const t = new Date(Date.now() + (new Date().getTimezoneOffset() + zone * 60) * 60000);
      const h = (24 + t.getHours() + lag) % 24;
      const m = t.getMinutes();
      const s = t.getSeconds();
      hour.style.transform = `rotate(${(h / 12) * 360 + (m / 60) * 30}deg)`;
      min.style.transform = `rotate(${(m / 60) * 360}deg)`;
      if (sec) sec.style.transform = `rotate(${(s / 60) * 360}deg)`;
      if (ampm) ampm.textContent = h > 12 ? "PM" : "AM";
      for (const [k, n] of parts) n.textContent = k === "year" ? t.getFullYear() : k === "month" ? t.getMonth() + 1 : k === "date" ? t.getDate() : days[t.getDay()] || "";
    };
    tick();
    const id = setInterval(tick, every);
    return () => {
      clearInterval(id);
      for (const n of [hour, min, sec]) if (n) n.style.transform = "";
    };
  });
})();
