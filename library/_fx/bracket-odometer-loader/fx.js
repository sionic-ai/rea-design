(() => {
  const WHEEL_TURN = 0.4;
  const PHASES = { boot: 0.06, bytes: 0.6, fonts: 0.04, build: 0.18, settle: 0.12 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const pulseDuration = (from, to) => clamp(0.3 + 0.9 * (to - from), 0.3, 0.8);
  const wheelTurn = (f) => clamp((f - (1 - WHEEL_TURN)) / WHEEL_TURN, 0, 1);
  // The wheel rolls to the next digit only during the last 40% — the higher digit follows by the carry count when the lower digit passes 9
  const wheels = (value) => {
    const v = clamp(value, 0, 100), whole = Math.floor(v);
    const ones = (whole % 10) + wheelTurn(v - whole);
    const tens = (Math.floor(whole / 10) % 10) + Math.max(0, ones - 9);
    const hundreds = Math.floor(whole / 100) + Math.max(0, tens - 9);
    return [hundreds, tens, ones];
  };

  kfFx.register("bracket-odometer-loader", (el, { options, reduce }) => {
    const min = +(options.min ?? 2.2), hold = +(options.hold ?? 0.1), auto = String(options.auto ?? "true") !== "false";
    const made = [];
    const add = (tag, cls, parent = el) => { const n = document.createElement(tag); n.className = cls; n.setAttribute("aria-hidden", "true"); parent.appendChild(n); made.push(n); return n; };
    const corners = ["tl", "tr", "bl", "br"].map((c) => { const n = add("span", "fx-bol-corner"); n.dataset.corner = c; return n; });
    const bar = add("span", "fx-bol-bar");
    const percent = add("p", "fx-bol-percent");
    const strip = (cells, extra = "") => {
      const w = document.createElement("span"); w.className = `fx-bol-wheel${extra}`;
      const s = document.createElement("span"); s.className = "fx-bol-strip";
      cells.forEach((c) => { const t = document.createElement("span"); t.textContent = c; s.appendChild(t); });
      w.appendChild(s); percent.appendChild(w); return s;
    };
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const strips = [strip([" ", "1"], " fx-bol-wheel--hundreds"), strip(digits), strip(digits)];
    const sign = document.createElement("span"); sign.className = "fx-bol-sign"; sign.textContent = "%"; percent.appendChild(sign);

    let path = { offsets: [] };
    const frame = () => {
      const r = bar.getBoundingClientRect(), bw = r.width || 1, cx = r.left + bw / 2, cy = r.top + r.height / 2;
      // On the original 1440 screen, the brackets tighten to a box 1.41 times × .87 times the bar width
      const w = bw * 1.41, h = bw * 0.87, box = { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 };
      path.offsets = corners.map((c) => {
        const cr = c.getBoundingClientRect(), k = c.dataset.corner;
        const tx = k[1] === "l" ? box.l - cr.left : box.r - cr.right;
        const ty = k[0] === "t" ? box.t - cr.top : box.b - cr.bottom;
        return { x: tx, y: ty };
      });
    };
    const paint = (v) => {
      bar.style.transform = `scaleX(${v})`;
      corners.forEach((c, i) => { const o = path.offsets[i]; c.style.transform = o ? `translate(${o.x * v}px, ${o.y * v}px)` : "none"; });
      const w = wheels(v * 100);
      strips.forEach((s, i) => { s.style.transform = `translateY(${(-100 * w[i]) / s.children.length}%)`; });
    };
    corners.forEach((c) => { c.style.transform = "none"; });
    frame();

    const phases = { boot: 1, bytes: 0, fonts: 0, build: 0, settle: 0 };
    let external = null;
    const target = () => {
      if (external != null) return external >= 1 ? 1 : Math.floor(Math.min(0.99, external) * 100) / 100;
      let sum = 0; for (const k in PHASES) sum += PHASES[k] * phases[k];
      return sum >= 0.999 ? 1 : Math.min(0.99, Math.floor(sum * 100 + 1e-6) / 100);
    };
    const timers = [];
    const later = (s, fn) => timers.push(setTimeout(fn, s * 1000));
    if (auto) {
      const ready = () => { phases.bytes = 1; later(0.2, () => { phases.build = 1; }); };
      if (document.readyState === "complete") ready(); else addEventListener("load", ready, { once: true });
      if (document.readyState !== "loading") phases.bytes = Math.max(phases.bytes, 0.5);
      else document.addEventListener("DOMContentLoaded", () => { phases.bytes = Math.max(phases.bytes, 0.5); }, { once: true });
      (document.fonts?.ready || Promise.resolve()).then(() => { phases.fonts = 1; });
      later(min * 0.35, () => { phases.bytes = Math.max(phases.bytes, 0.55); });
      later(min, () => { phases.settle = 1; });
    }
    const onProgress = (e) => { external = Math.max(external ?? 0, clamp(+e.detail || 0, 0, 1)); };
    el.addEventListener("fx:progress", onProgress);

    let rest = 0, from = 0, to = 0, start = 0, dur = 0, moving = false, raf = 0, finished = false;
    const finish = () => {
      finished = true;
      later(hold, () => {
        el.setAttribute("data-done", "");
        el.dispatchEvent(new CustomEvent("fx:loaded", { bubbles: true }));
        later(reduce ? 0 : 0.45, () => {
          el.setAttribute("data-flash", "");
          el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
          later(reduce ? 0 : 0.7, () => { el.style.visibility = "hidden"; el.dispatchEvent(new CustomEvent("fx:gone", { bubbles: true })); });
        });
      });
    };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (finished) return;
      if (moving) {
        const t = clamp((now - start) / (dur * 1000), 0, 1);
        paint(from + (to - from) * smootherstep(t));
        if (t >= 1) { moving = false; rest = to; if (rest >= 1) { cancelAnimationFrame(raf); finish(); return; } }
        return;
      }
      const goal = target();
      if (goal <= rest) return;
      if (reduce) { rest = goal; paint(rest); if (rest >= 1) { cancelAnimationFrame(raf); finish(); } return; }
      from = rest; to = goal; dur = pulseDuration(from, to); start = now; moving = true;
    };
    paint(0);
    raf = requestAnimationFrame(tick);
    const onResize = () => { corners.forEach((c) => { c.style.transform = "none"; }); frame(); paint(moving ? from : rest); };
    addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      removeEventListener("resize", onResize);
      el.removeEventListener("fx:progress", onProgress);
      made.forEach((n) => n.remove());
      el.removeAttribute("data-done");
      el.removeAttribute("data-flash");
      el.style.visibility = "";
    };
  });
})();
