// A 1px vertical line fixed at the screen left — draws a 9px tick at each page heading (h1·h2) position, and a 7px square dot moves down the line by the fraction scrolled down the page,
// The number on the line counts 000 to 100. Ticks the dot has passed lengthen to 16px and darken (.16s). Height is re-measured even if fonts and images arrive late
(() => {
  kfFx.register("signal-rail-scroll", (el, { options, scroller }) => {
    const heads = options.heads || "h1, h2";
    const area = scroller || document.scrollingElement;
    const scope = el.closest("[data-fx-scroller]") || document;
    let track = el.querySelector('[data-fx-part="track"]'), dot = el.querySelector('[data-fx-part="dot"]'), count = el.querySelector('[data-fx-part="count"]');
    const made = [];
    if (!track) { track = document.createElement("span"); track.dataset.fxPart = "track"; el.append(track); made.push(track); }
    if (!dot) { dot = document.createElement("span"); dot.dataset.fxPart = "dot"; track.append(dot); made.push(dot); }
    if (!count && options.count !== "off") { count = document.createElement("span"); count.dataset.fxPart = "count"; el.append(count); made.push(count); }
    let marks = [], h = 0, raf = 0;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const room = () => (scroller ? scroller.scrollHeight - scroller.clientHeight : area.scrollHeight - innerHeight);
    const measure = () => {
      const H = scroller ? scroller.scrollHeight : area.scrollHeight;
      const base = scroller ? scroller.getBoundingClientRect().top - scroller.scrollTop : -scrollY;
      marks = [...scope.querySelectorAll(heads)].filter((n) => !el.contains(n)).map((n) => (n.getBoundingClientRect().top - base) / H);
      h = track.clientHeight;
      track.querySelectorAll('[data-fx-part="tick"]').forEach((t) => t.remove());
      marks.forEach((m) => {
        const t = document.createElement("span");
        t.dataset.fxPart = "tick";
        t.style.top = `${m * 100}%`;
        track.insertBefore(t, dot);
      });
    };
    const paint = () => {
      raf = 0;
      const r = room(), p = r > 0 ? Math.min(1, Math.max(0, top() / r)) : 0;
      dot.style.transform = `translate3d(0, ${p * h}px, 0)`;
      if (count) count.textContent = String(Math.round(p * 100)).padStart(3, "0");
      track.querySelectorAll('[data-fx-part="tick"]').forEach((t, i) => t.toggleAttribute("data-passed", (marks[i] ?? 1) <= p));
    };
    const ask = () => { raf ||= requestAnimationFrame(paint); };
    const refresh = () => { measure(); ask(); };
    const ro = new ResizeObserver(refresh);
    ro.observe(scroller || document.body);
    ro.observe(track);
    const src = scroller || window;
    src.addEventListener("scroll", ask, { passive: true });
    refresh();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      src.removeEventListener("scroll", ask);
      track.querySelectorAll('[data-fx-part="tick"]').forEach((t) => t.remove());
      dot.style.removeProperty("transform");
      made.forEach((n) => n.remove());
    };
  });
})();
