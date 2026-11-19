// Word lines laid over a monospace character grid jump together to one of the preset layouts on every beat (never the same as the last one), and at the same moment every character shuffles from blank → random character → its own character.
// When it leaves the screen (another view turns on via display:none) or scrolls out, the beat stops, when visible again it shifts once right on the spot and resumes counting.
(() => {
  kfFx.register("shuffle-relayout", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    // data-at="Cell row, cell row, …" — One comma is one placement. If rows have different placement counts, only up to the smallest count is used
    const at = rows.map((r) => (r.getAttribute("data-at") || "0 0").split(",").map((p) => p.trim().split(/\s+/).map(Number)));
    const layouts = Math.max(1, Math.min(...at.map((a) => a.length)));
    const parts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const texts = (parts.length ? parts : rows).filter((t) => t.textContent.trim());
    const original = texts.map((t) => t.textContent);
    const every = +(options.every ?? 7), dur = +(options.dur ?? 2.5), delay = +(options.delay ?? 0);
    const chars = options.chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ", empty = options.empty ?? "_";
    const wide = matchMedia(`(min-width: ${+options.from || 769}px)`);
    const Shuffle = window.ShuffleText;
    let current = -1, timer, first = true, seen = false;
    const runs = [];

    const place = (n) => {
      el.classList.toggle("fx-relayout", wide.matches);
      rows.forEach((r, i) => {
        const [col, line] = at[i][n] || [0, 0];
        r.style.setProperty("--fx-col", col);
        r.style.setProperty("--fx-line", line);
      });
      el.setAttribute("data-layout", n + 1);
      el.classList.remove("fx-wait");
    };
    const shuffle = () => {
      if (!Shuffle) return;
      runs.splice(0).forEach((s) => s.stop());
      texts.forEach((t, i) => {
        t.textContent = original[i];
        const s = new Shuffle(t);
        s.sourceRandomCharacter = chars;
        s.emptyCharacter = empty;
        s.duration = Math.max(1, dur * 1000);
        s.start();
        runs.push(s);
      });
    };
    // A layout identical to the previous one is redrawn — so the spots always look changed every round
    const tick = () => {
      let n = Math.floor(Math.random() * layouts);
      if (layouts > 1) while (n === current) n = Math.floor(Math.random() * layouts);
      current = n;
      place(n);
      shuffle();
      timer = setTimeout(tick, every * 1000);
    };
    const resume = () => {
      clearTimeout(timer);
      if (first) { first = false; timer = setTimeout(tick, delay * 1000); } else tick();
    };

    if (reduce) { place(0); return () => { el.classList.remove("fx-relayout"); el.removeAttribute("data-layout"); rows.forEach((r) => r.style.removeProperty("--fx-col")); rows.forEach((r) => r.style.removeProperty("--fx-line")); }; }

    el.classList.add("fx-wait");
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !seen) { seen = true; resume(); }
      else if (!e.isIntersecting && seen) { seen = false; clearTimeout(timer); }
    });
    io.observe(el);
    const onWide = () => { if (current >= 0) place(current); };
    wide.addEventListener("change", onWide);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      wide.removeEventListener("change", onWide);
      runs.forEach((s) => s.stop());
      texts.forEach((t, i) => { t.textContent = original[i]; });
      el.classList.remove("fx-wait", "fx-relayout");
      el.removeAttribute("data-layout");
      rows.forEach((r) => { r.style.removeProperty("--fx-col"); r.style.removeProperty("--fx-line"); });
    };
  });
})();
