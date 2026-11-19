// Clicking a same-origin link makes the new page reveal as if burning outward from the clicked spot. The screen is divided into an 8px cell field, and each cell gets a threshold of distance from the clicked spot + noise × scatter,
// Cells whose progress passes the threshold switch to the new page (the clip-path of the View Transition new view), and the band just before the threshold is painted in ember color. 1.1s sine.inOut.
// Without View Transition or on file://, the old page is covered by rolling the same field into the background color (.66s power2.inOut), then on the new page it rolls again to clear (.85s power1.inOut).
(() => {
  const NAME = "burn-through-nav", KEY = "kf-fx-burn-through-nav";
  const canVT = () => "CSSViewTransitionRule" in window && location.protocol !== "file:";
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");
  const host = () => document.querySelector(`[data-fx~="${NAME}"]`);
  const opts = (el) => {
    const o = {};
    for (const p of ((el && el.getAttribute(`data-fx-${NAME}`)) || "").split(";")) { const i = p.indexOf(":"); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }
    return {
      dur: +(o.dur ?? 1.1), cell: +(o.cell || 8), spray: +(o.spray ?? 0.06), band: +(o.band ?? 0.035), warp: +(o.warp ?? 0.34), tail: +(o.tail ?? 0.12),
      cover: +(o.cover ?? 0.66), uncover: +(o.uncover ?? 0.85),
    };
  };
  const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const p2InOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const p1InOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2) * 0.5 + t * 0.5;
  const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
  // Cell field: threshold = Distance from the pressed spot (in screen-height units) + slow wave noise (0~1) × warp + cell grain × spray.
  // Progress runs from -spray-.02 to ‹farthest corner + .75 × warp + spray + .04› (original range as is)
  const field = (o, origin, seed) => {
    const w = innerWidth, h = innerHeight, gx = Math.ceil(w / o.cell), gy = Math.ceil(h / o.cell);
    const ox = origin.x * w, oy = origin.y * h;
    const far = Math.max(...[[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => Math.hypot(x - ox, y - oy))) / h;
    const f = new Float32Array(gx * gy);
    for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
      const u = ((i + 0.5) * o.cell) / h, v = ((j + 0.5) * o.cell) / h;
      const n = 0.5 + 0.25 * Math.sin(u * 7.3 + seed) * Math.cos(v * 6.1 - seed) + 0.25 * Math.sin((u + v) * 4.7 + seed * 2);
      f[j * gx + i] = Math.hypot(u * h - ox, v * h - oy) / h + n * o.warp + (hash(i, j, seed) - 0.5) * o.spray;
    }
    return { f, gx, gy, cell: o.cell, lo: -o.spray - 0.02, hi: far + 0.75 * o.warp + o.spray + 0.04 };
  };
  const pathOf = (F, p) => {
    let d = "";
    for (let j = 0; j < F.gy; j++) {
      let run = -1;
      for (let i = 0; i <= F.gx; i++) {
        const on = i < F.gx && F.f[j * F.gx + i] < p;
        if (on && run < 0) run = i;
        if (!on && run >= 0) { d += `M${run * F.cell} ${j * F.cell}h${(i - run) * F.cell}v${F.cell}h${-(i - run) * F.cell}Z`; run = -1; }
      }
    }
    return d;
  };
  const colorOf = (css) => { const i = document.createElement("i"); i.style.cssText = `display:none;color:${css}`; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c; };
  const layer = () => {
    const cv = document.createElement("canvas");
    cv.className = "fx-btn";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    const cx = cv.getContext("2d");
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cv, cx };
  };
  // Ember band: cells whose threshold is just ahead of progress (inside the band) — the nearer the front, the brighter the ember, the further back the more accent color. Cells already passed cool to the accent color over the tail (tail .12) and fade.
  const ember = (L, F, p, band, hot, red, char, mode, cool = 0.12) => {
    L.cx.clearRect(0, 0, innerWidth, innerHeight);
    for (let j = 0; j < F.gy; j++) for (let i = 0; i < F.gx; i++) {
      const v = F.f[j * F.gx + i];
      if (mode === "cover") { if (v < p) { L.cx.fillStyle = char; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); } else if (v < p + band) { L.cx.fillStyle = (p + band - v) / band > 0.5 ? hot : red; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); } continue; }
      if (mode === "uncover") { if (v >= p + band) { L.cx.fillStyle = char; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); } else if (v >= p) { L.cx.fillStyle = (v - p) / band < 0.5 ? hot : red; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); } continue; }
      if (v >= p && v < p + band) { L.cx.fillStyle = (p + band - v) / band > 0.5 ? hot : red; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); }
      else if (v < p && v > p - cool) { L.cx.globalAlpha = (1 - (p - v) / cool) * 0.6; L.cx.fillStyle = red; L.cx.fillRect(i * F.cell, j * F.cell, F.cell, F.cell); L.cx.globalAlpha = 1; }
    }
  };
  const tween = (sec, ease, step) => new Promise((done) => {
    const t0 = performance.now();
    const go = (now) => { const t = sec > 0 ? Math.min(1, (now - t0) / (sec * 1000)) : 1; step(ease(t)); t < 1 ? requestAnimationFrame(go) : done(); };
    requestAnimationFrame(go);
  });
  const take = () => { try { const v = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); return v; } catch { return null; } };

  let decided = false, fired = false, revealed = null;
  function arrive(vt) {
    if (decided) return;
    decided = true;
    const el = host(), o = opts(el), got = take();
    if (!el || reduceQ.matches || !got) { if (vt) vt.skipTransition(); return; }
    const hot = colorOf("var(--kf-accent-soft)"), red = colorOf("var(--kf-accent)"), char = colorOf("var(--kf-bg)");
    if (vt && got.mode === "vt") {
      const F = field(o, got.origin, 0), L = layer();
      L.cv.classList.add("is-named");
      const root = document.documentElement;
      root.classList.add("fx-btn-burn");
      let anim = null;
      vt.ready.then(() => {
        anim = root.animate([{ clipPath: "inset(50%)" }, { clipPath: "inset(50%)" }], { pseudoElement: "::view-transition-new(root)", duration: 1e9, fill: "forwards" });
        return tween(o.dur, sineInOut, (e) => {
          const p = F.lo + (F.hi + o.tail - F.lo) * e, d = pathOf(F, p);
          const cp = d ? `path(evenodd, "${d}")` : "inset(50%)";
          anim.effect.setKeyframes([{ clipPath: cp }, { clipPath: cp }]);
          ember(L, F, p, o.band, hot, red, char, "burn", o.tail);
        });
      }).catch(() => {}).finally(() => { anim?.cancel(); L.cv.remove(); root.classList.remove("fx-btn-burn"); el.dispatchEvent(new CustomEvent("fx:burn-end", { bubbles: true })); });
      return;
    }
    if (got.mode === "cover") {
      const F = field(o, got.origin, 100), L = layer();
      L.cv.classList.add("is-on");
      ember(L, F, F.lo, o.band, hot, red, char, "uncover");
      tween(o.uncover, p1InOut, (e) => ember(L, F, F.lo + (F.hi + o.band - F.lo) * e, o.band, hot, red, char, "uncover")).then(() => L.cv.remove());
    }
  }
  addEventListener("pagereveal", (e) => { fired = true; revealed = e.viewTransition || null; if (host()) arrive(revealed); });

  kfFx.register(NAME, (el, { reduce }) => {
    if (!decided && (fired || !("onpagereveal" in window))) arrive(fired ? revealed : null);
    let busy = false;
    const ac = new AbortController();
    el.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0] || a.closest('[data-fx-part="plain"]')) return;
      if (reduce) return;
      const origin = e.detail ? { x: e.clientX / innerWidth, y: e.clientY / innerHeight } : { x: 0.5, y: 0.5 };
      if (canVT()) { try { sessionStorage.setItem(KEY, JSON.stringify({ mode: "vt", origin })); } catch {} return; }
      e.preventDefault();
      if (busy) return;
      busy = true;
      const o = opts(el), F = field(o, origin, 0), L = layer();
      const hot = colorOf("var(--kf-accent-soft)"), red = colorOf("var(--kf-accent)"), char = colorOf("var(--kf-bg)");
      L.cv.classList.add("is-on");
      tween(o.cover, p2InOut, (t) => ember(L, F, F.lo + (F.hi + o.band - F.lo) * t, o.band, hot, red, char, "cover")).then(() => {
        try { sessionStorage.setItem(KEY, JSON.stringify({ mode: "cover", origin })); } catch {}
        location.href = url.href;
      });
    }, { signal: ac.signal });
    addEventListener("pageshow", (e) => { if (e.persisted) { busy = false; document.querySelectorAll(".fx-btn").forEach((c) => c.remove()); } }, { signal: ac.signal });
    return () => ac.abort();
  });
})();
