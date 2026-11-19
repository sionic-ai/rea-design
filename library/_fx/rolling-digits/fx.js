// Each digit slot has a 0~9 vertical strip, and when the value changes the strip rises by that digit’s height — only the changed digits roll, the rest stay put.
// Slots are counted and held from the right. Even when the digit count grows, a new ones-place strip must not appear, so that it looks like rolling.
// Elements with the same key share a single value (where the same row is laid twice like a marquee, both copies must roll with the same number)
(() => {
  const shared = new Map();
  const fmt = (v, dec) => (dec != null ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"));

  kfFx.register("rolling-digits", (el, { options, reduce }) => {
    const dec = options.decimals == null ? null : +options.decimals;
    const dur = +(options.dur ?? 0.7);
    const ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(0.22, 1, 0.36, 1)";
    const start = parseFloat(el.dataset.value ?? el.textContent.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(start)) return;
    const suffix = options.suffix ?? "";
    const before = el.innerHTML;
    el.textContent = "";
    const sr = document.createElement("span");
    sr.className = "fx-rd__sr";
    const row = document.createElement("span");
    row.className = "fx-rd__row";
    row.setAttribute("aria-hidden", "true");
    el.append(sr, row);
    el.style.setProperty("--fx-rd-dur", `${reduce ? 0 : dur}s`);
    el.style.setProperty("--fx-rd-ease", ease);

    const cols = new Map();
    const render = (v) => {
      const s = fmt(v, dec), chars = s.split("");
      sr.textContent = s + suffix;
      const keep = new Set();
      const nodes = chars.map((ch, i) => {
        const key = `${/\d/.test(ch) ? "d" : "s"}${chars.length - i}`;
        keep.add(key);
        let n = cols.get(key);
        if (!/\d/.test(ch)) {
          if (!n) { n = document.createElement("span"); n.className = "fx-rd__sep"; cols.set(key, n); }
          n.textContent = ch;
          return n;
        }
        if (!n) {
          n = document.createElement("span");
          n.className = "fx-rd__digit";
          const strip = document.createElement("span");
          strip.className = "fx-rd__strip";
          for (let d = 0; d < 10; d++) { const c = document.createElement("span"); c.textContent = d; strip.append(c); }
          n.append(strip);
          cols.set(key, n);
        }
        n.firstChild.style.transform = `translateY(-${+ch}em)`;
        return n;
      });
      for (const [k, n] of cols) if (!keep.has(k)) { n.remove(); cols.delete(k); }
      // If the slot layout is the same, don’t re-insert — moving elements cuts off running transitions so the strip jumps instead of rolling
      const now = [...row.children];
      if (now.length !== nodes.length || nodes.some((n, i) => now[i] !== n)) {
        row.replaceChildren(...nodes);
        if (suffix) row.append(suffix);
      }
    };
    render(start);

    // Changing data-value makes it roll — the path by which an external script feeds in values
    const mo = new MutationObserver(() => { const v = parseFloat(el.dataset.value); if (Number.isFinite(v)) render(v); });
    mo.observe(el, { attributes: true, attributeFilter: ["data-value"] });

    // live — once visible, it rises by step every (.4~2.2) × live ms (a number ticker strip)
    const live = +(options.live ?? 0), step = +(options.step ?? 1);
    let unlive = null;
    if (live > 0 && !reduce) {
      const key = options.key || null;
      let g = key && shared.get(key);
      if (!g) {
        g = { value: start, subs: new Set(), timer: 0, seen: 0 };
        if (key) shared.set(key, g);
      }
      const sub = (v) => render(v);
      g.subs.add(sub);
      const kick = () => {
        if (g.timer) return;
        const next = () => { g.timer = setTimeout(() => { g.value += step; g.subs.forEach((f) => f(g.value)); next(); }, live * (0.4 + 1.8 * Math.random())); };
        next();
      };
      render(g.value);
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { kick(); io.disconnect(); } }, { threshold: 0.1 });
      io.observe(el);
      unlive = () => {
        io.disconnect();
        g.subs.delete(sub);
        if (!g.subs.size) { clearTimeout(g.timer); g.timer = 0; if (key) shared.delete(key); }
      };
    }
    return () => { mo.disconnect(); unlive?.(); el.innerHTML = before; el.style.removeProperty("--fx-rd-dur"); el.style.removeProperty("--fx-rd-ease"); };
  });
})();
