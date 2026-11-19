// Home — funnel photo row (992px and up), service list direction cover (desktop interaction · below that, center row auto)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------- Funnel: from the panel top edge downward it shrinks 1 → .65x (curve p^1.25 · strength .35), and is pulled up by the amount it shrank so it gets denser ----------
  $$("[data-funnel]").forEach((track) => {
    const view = track.parentElement, items = Array.from(track.children);
    const strength = 0.35, minS = 0.65, curve = 1.25;
    const scaleAt = (p) => Math.max(minS, Math.min(1, 1 - Math.pow(Math.max(0, p), curve) * strength));
    // Length stacking the shrunk share (1 − size) from the panel’s top edge (0), pulled up by that amount
    const pulled = (p) => (p <= 0 ? 0 : p <= 1 ? (strength * Math.pow(p, curve + 1)) / (curve + 1) : strength / (curve + 1) + (1 - minS) * (p - 1));
    const prev = items.map(() => ({ s: 1, o: 0 }));
    let on = false, raf = null;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vr = view.getBoundingClientRect();
      if (vr.height <= 0) return;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const base = r.top + r.height / 2 - prev[i].o;
        const p = (base - vr.top) / vr.height;
        const s = scaleAt(p), o = -vr.height * pulled(p);
        if (Math.abs(s - prev[i].s) < 5e-4 && Math.abs(o - prev[i].o) < 0.05) return;
        prev[i].s = s; prev[i].o = o;
        it.style.setProperty("--funnel-scale", s.toFixed(4));
        it.style.setProperty("--funnel-y", `${o.toFixed(2)}px`);
      });
    };
    const wide = matchMedia("(min-width: 992px)");
    const sync = () => {
      const want = wide.matches && !reduce;
      if (want === on) return;
      on = want;
      if (on) raf = requestAnimationFrame(tick);
      else { cancelAnimationFrame(raf); items.forEach((it, i) => { it.style.removeProperty("--funnel-scale"); it.style.removeProperty("--funnel-y"); prev[i] = { s: 1, o: 0 }; }); }
    };
    wide.addEventListener("change", sync);
    sync();
    new IntersectionObserver(([e]) => { if (!on) return; if (e.isIntersecting && !raf) raf = requestAnimationFrame(tick); else if (!e.isIntersecting) { cancelAnimationFrame(raf); raf = null; } }).observe(view);
  });

  // ---------- Directional cover — entering the upper half of the row covers from above, the lower half from below, and it clears out toward the side it left ----------
  const MAP = { top: "translateY(-100%)", bottom: "translateY(100%)" };
  const rows = $$("[data-dl-item]");
  const side = (e, el) => { const r = el.getBoundingClientRect(); return e.clientY - r.top < r.height / 2 ? "top" : "bottom"; };
  const desk = matchMedia("(min-width: 992px)");
  let lastY = scrollY, dir = "down", active = null;
  const pick = () => {
    const line = innerHeight * 0.5;
    let best = null, d = Infinity;
    rows.forEach((row) => {
      const r = row.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return;
      const k = Math.abs(r.top + r.height / 2 - line);
      if (k < d) { d = k; best = row; }
    });
    return best;
  };
  const setOn = (row, on) => {
    const tile = row.querySelector("[data-dl-tile]");
    tile.style.transformOrigin = `center ${on ? (dir === "down" ? "top" : "bottom") : dir === "down" ? "bottom" : "top"}`;
    tile.style.transform = `scaleY(${on ? 1 : 0})`;
    row.setAttribute("data-dl-active", String(on));
  };
  const onScroll = () => {
    const y = scrollY;
    if (y !== lastY) { dir = y > lastY ? "down" : "up"; lastY = y; }
    if (desk.matches) return;
    const next = pick();
    if (next === active) return;
    if (active) setOn(active, false);
    if (next) setOn(next, true);
    active = next;
  };
  rows.forEach((row) => {
    const tile = row.querySelector("[data-dl-tile]");
    row.addEventListener("mouseenter", (e) => {
      if (!desk.matches) return;
      tile.style.transition = "none";
      tile.style.transform = MAP[side(e, row)];
      void tile.offsetHeight;
      tile.style.transition = "";
      tile.style.transform = "translate(0%, 0%)";
    });
    row.addEventListener("mouseleave", (e) => { if (desk.matches) tile.style.transform = MAP[side(e, row)]; });
  });
  const mode = () => {
    active = null;
    rows.forEach((row) => { const t = row.querySelector("[data-dl-tile]"); t.style.transform = desk.matches ? "" : "scaleY(0)"; t.style.transformOrigin = ""; row.removeAttribute("data-dl-active"); });
    onScroll();
  };
  desk.addEventListener("change", mode);
  addEventListener("scroll", onScroll, { passive: true });
  mode();
})();
