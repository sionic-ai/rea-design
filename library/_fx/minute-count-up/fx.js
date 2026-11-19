(() => {
  // A time label like ”18:00” first stands at the time back minutes earlier (17:30), then when it enters the screen it fills up one minute at a time after the delay —
  // The fewer minutes remain, the shorter the interval (60 − remaining minutes ms), and the last 3 minutes add 90ms to stop slowly (the original’s hotel bar concept clock)
  const fmt = (d, pad) => `${pad ? String(d.getHours()).padStart(2, "0") : d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  kfFx.register("minute-count-up", (el, { options, reduce, scroller }) => {
    const target = (el.dataset.time || el.textContent).trim();
    const m = target.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return;
    const pad = m[1].length === 2 && m[1][0] === "0";
    const at = new Date(); at.setHours(+m[1], +m[2], 0, 0);
    const back = Math.max(1, Math.round(+(options.back || 30)));
    const delay = +(options.delay ?? 0.3), slow = +(options.slow ?? 90), tail = Math.round(+(options.tail ?? 3));
    const was = el.textContent;
    let left = back, timer = null, io = null;
    const show = (k) => { el.textContent = fmt(new Date(at - k * 60000), pad); };
    if (reduce) { show(0); return () => { el.textContent = was; }; }
    show(back);
    const step = () => {
      show(left);
      left--;
      if (left < 0) return;
      timer = setTimeout(step, left <= tail ? 60 - left + slow : 60 - left);
    };
    const start = () => { if (timer || left < back) return; timer = setTimeout(step, delay * 1000); };
    io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { root: scroller || null, threshold: 0 });
    io.observe(el);
    el.addEventListener("fx:show", start);
    return () => { io.disconnect(); clearTimeout(timer); el.removeEventListener("fx:show", start); el.textContent = was; };
  });
})();
