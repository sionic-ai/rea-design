// Splits the screen into a grid of big cells (4 columns × 22.125rem, phone 2 columns × half screen) and flickers each cell black. A cell’s start time is its distance from the pointer spot (.55) + random (.45) × 1.7s.
// One cell’s step: for 0~.3e, black and clear five times (e = .8~1.3 random), switches to the new page at .75, goes black twice more at .82 and .97, ends at 1.05.
// The transition is a cross-document View Transition — on the new document side, the cell canvas (live new state) and the new screen mask are drawn every frame. If unsupported or file://,
// Covers and leaves like the original’s alternate route (2.45s) and walks in on the new page (2.2s). On first open, the cell covering the whole screen clears at the same pace (loader).
(() => {
  const KEY = "kf-fx-tile-flicker-nav";
  const NAME = "tile-flicker-nav";
  const steps = (e) => [[0, 1, 0], [0.07 * e, 0, 0], [0.15 * e, 1, 0], [0.22 * e, 0, 0], [0.3 * e, 1, 0], [0.75, 0, 1], [0.82, 1, 1], [0.9, 0, 1], [0.97, 1, 1], [1.05, 0, 1]];
  const at = (tile, t) => {
    const n = t - tile.start;
    if (n < 0) return { black: 0, next: 0, local: n };
    let s = tile.steps[0];
    for (const x of tile.steps) if (n >= x[0]) s = x;
    return { black: s[1], next: s[2], local: n };
  };
  const phoneQ = matchMedia("(max-width: 767px)");
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");
  const canVT = () => "CSSViewTransitionRule" in window && location.protocol !== "file:";

  let stage = null, decided = false, revealed = null, fired = false;
  const host = () => document.querySelector(`[data-fx~="${NAME}"]`);
  const optsOf = (el) => {
    const o = {};
    for (const p of ((el && el.getAttribute(`data-fx-${NAME}`)) || "").split(";")) {
      const i = p.indexOf(":");
      if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim();
    }
    return o;
  };
  const conf = (o) => ({
    cols: +(o.cols || 4), colsPhone: +(o["cols-phone"] || 2), row: +(o.row || 22.125),
    spread: +(o.spread ?? 1.7), dur: +(o.dur ?? 2.95), cover: +(o.cover ?? 2.45), reveal: +(o.reveal ?? 2.2),
    phone: +(o.phone ?? 0.6), wait: +(o.wait ?? 1.2), intro: o.intro !== "0", look: o.look || "",
  });

  // The color to paint comes from the skin — canvas can’t read variables, so paint one dot and sample it
  const colorOf = (css) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:${css}`;
    document.body.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return c;
  };

  function makeStage() {
    if (stage) return stage;
    const cv = document.createElement("canvas");
    cv.className = "fx-tfn";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const cx = cv.getContext("2d");
    const mk = document.createElement("canvas"), mx = mk.getContext("2d");
    const root = document.documentElement;
    let tiles = [], dpr = 1, clipNow = "", raf = 0, ink = "", red = "", c = conf(optsOf(host()));
    const SC = 1 / 8;
    const layout = (pt) => {
      c = conf(optsOf(host()));
      dpr = Math.min(devicePixelRatio || 1, 2);
      const w = innerWidth, h = Math.max(innerHeight, Math.round(cv.getBoundingClientRect().height));
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      mk.width = Math.ceil(w * SC); mk.height = Math.ceil(h * SC);
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16, phone = phoneQ.matches;
      const cols = phone ? c.colsPhone : c.cols, tw = w / cols, th = phone ? Math.ceil(h / 2) : c.row * rem;
      const rows = Math.ceil(h / th);
      const far = Math.max(...[[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => Math.hypot(x - pt.x, y - pt.y)));
      tiles = [];
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const x = k * tw, y = r * th, d = Math.hypot(x + tw / 2 - pt.x, y + th / 2 - pt.y) / far;
        tiles.push({ x, y, w: tw, h: th, start: (d * 0.55 + Math.random() * 0.45) * c.spread, steps: steps(0.8 + Math.random() * 0.5) });
      }
      if (tiles.length) tiles[Math.floor(Math.random() * tiles.length)].red = true;
      ink = colorOf(c.look === "ink" ? "var(--kf-ink)" : "var(--kf-bg)");
      red = colorOf("var(--kf-accent)");
    };
    const setClip = (p) => { if (p !== clipNow) { clipNow = p; root.style.setProperty("--fx-tfn-clip", `path('${p || "M0 0"}')`); } };
    const clear = () => { cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, cv.width / dpr, cv.height / dpr); };
    const fill = (t, color) => { cx.fillStyle = color; cx.fillRect(t.x, t.y, t.w + 1, t.h + 1); };
    // One transition scene: the cell where the new page opened goes to the mask (PC) or path (phone), and the cell with the black step goes to the canvas
    const frame = (time, mode, phone) => {
      clear();
      mx.clearRect(0, 0, mk.width, mk.height);
      mx.fillStyle = "#fff"; /* Not skin: mask alpha channel */
      let path = "";
      for (const t of tiles) {
        let { black, next, local } = at(t, time);
        if (mode === "cover") black = local >= 0 && (next || black);
        if (mode === "reveal") next = 1;
        if (next && mode === "all") {
          if (phone) path += `M${t.x} ${t.y}h${t.w + 1}v${t.h + 1}h${-t.w - 1}Z`;
          else mx.fillRect(t.x * SC, t.y * SC, t.w * SC + 1, t.h * SC + 1);
        }
        if (black) fill(t, t.red && local < 0.3 ? red : ink);
      }
      if (mode === "all") phone ? setClip(path) : root.style.setProperty("--fx-tfn-mask", `url(${mk.toDataURL()})`);
    };
    const introFrame = (time) => {
      clear();
      for (const t of tiles) {
        const { black, local } = at(t, time);
        if (local >= 0.75 && !black) continue;
        fill(t, t.red && local >= 0.75 ? red : ink);
      }
    };
    const run = (from, to, sec, draw) => new Promise((done) => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const step = (now) => {
        const p = sec > 0 ? Math.min(1, Math.max(0, (now - t0) / (sec * 1000))) : 1;
        draw(from + (to - from) * p);
        if (p < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });
    const off = () => {
      cancelAnimationFrame(raf);
      cv.classList.remove("is-active", "is-named");
      clear();
      root.style.removeProperty("--fx-tfn-mask");
      root.style.removeProperty("--fx-tfn-clip");
      root.style.removeProperty("--fx-tfn-hold");
      clipNow = "";
    };
    const scale = () => (phoneQ.matches ? c.phone : 1);
    const lastEnd = () => Math.max(...tiles.map((t) => t.start + t.steps[t.steps.length - 1][0]));
    stage = {
      cv, layout, off, frame, introFrame, run, scale, lastEnd, get c() { return c; }, get tiles() { return tiles; },
      remove() { off(); cv.remove(); stage = null; },
    };
    return stage;
  }

  const center = () => ({ x: innerWidth / 2, y: innerHeight / 2 });
  const takePoint = () => {
    try { const v = JSON.parse(sessionStorage.getItem(`${KEY}:pt`) || "null"); sessionStorage.removeItem(`${KEY}:pt`); return v; } catch { return null; }
  };

  // Arrival: if it came by View Transition, cell transition, if it came by covering and leaving, walking, if opened for the first time, loader
  function arrive(vt) {
    if (decided) return;
    decided = true;
    const el = host();
    if (!el || reduceQ.matches) { if (vt) vt.skipTransition(); return; }
    const s = makeStage(), root = document.documentElement;
    const mode = sessionStorage.getItem(KEY), pt = takePoint();
    sessionStorage.removeItem(KEY);
    // If arrival is by a link or back navigation rather than a tile flip, end the View Transition right away and skip the loader too
    if (mode === "plain" || (vt && !pt)) { if (vt) vt.skipTransition(); return; }
    if (vt) {
      s.layout(pt);
      const phone = phoneQ.matches, sec = s.c.dur * s.scale();
      root.style.setProperty("--fx-tfn-hold", `${(sec + 0.25).toFixed(2)}s`);
      s.cv.classList.add("is-active", "is-named");
      s.frame(0, "all", phone);
      root.classList.add("fx-tfn-nav");
      el.dispatchEvent(new CustomEvent("fx:nav-start", { bubbles: true }));
      vt.ready
        .then(() => s.run(0, s.c.dur, sec, (t) => s.frame(t, "all", phone)))
        .then(() => { if (phone) vt.skipTransition(); })
        .catch(() => {})
        .finally(() => vt.finished.catch(() => {}).then(() => { s.off(); root.classList.remove("fx-tfn-nav"); el.dispatchEvent(new CustomEvent("fx:nav-end", { bubbles: true })); }));
      return;
    }
    if (mode === "cover") {
      s.layout(pt || center());
      s.tiles.forEach((t) => (t.start -= 0.75));
      s.cv.classList.add("is-active");
      s.frame(0, "reveal");
      s.run(0, s.c.reveal, s.c.reveal * s.scale(), (t) => s.frame(t, "reveal")).then(() => s.off());
      return;
    }
    if (!s.c.intro) return;
    s.layout(center());
    s.cv.classList.add("is-active");
    s.introFrame(0);
    root.classList.add("fx-tfn-intro");
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
    Promise.all([document.fonts?.ready, Promise.race([loaded, new Promise((r) => setTimeout(r, s.c.wait * 1000))])])
      .then(() => new Promise((r) => setTimeout(r, 150)))
      .then(() => { const end = s.lastEnd(); return s.run(0.75, end, end - 0.75, (t) => s.introFrame(t)); })
      .then(() => {
        root.classList.add("fx-tfn-reveal");
        root.classList.remove("fx-tfn-intro");
        setTimeout(() => root.classList.remove("fx-tfn-reveal"), 2000);
        s.off();
        el.dispatchEvent(new CustomEvent("fx:intro-end", { bubbles: true }));
      });
  }

  addEventListener("pagereveal", (e) => { fired = true; revealed = e.viewTransition || null; if (host()) arrive(revealed); });
  addEventListener("pageshow", (e) => { if (e.persisted && stage) stage.off(); });

  kfFx.register(NAME, (el, { reduce }) => {
    if (!decided && (fired || !("onpagereveal" in window))) arrive(fired ? revealed : null);
    let busy = false;
    const ac = new AbortController();
    el.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0]) return;
      if (a.closest('[data-fx-part="plain"]')) { try { sessionStorage.setItem(KEY, "plain"); } catch {} return; }
      const pt = e.detail ? { x: e.clientX, y: e.clientY } : center();
      try { sessionStorage.setItem(`${KEY}:pt`, JSON.stringify(pt)); } catch {}
      if (reduce || canVT()) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      const s = makeStage();
      s.layout(pt);
      s.cv.classList.add("is-active");
      s.run(0, s.c.cover, s.c.cover * s.scale(), (t) => s.frame(t, "cover")).then(() => {
        sessionStorage.setItem(KEY, "cover");
        location.href = url.href;
      });
    }, { signal: ac.signal });
    return () => { ac.abort(); if (stage && !document.querySelector(`[data-fx~="${NAME}"]`)) stage.remove(); };
  });
})();
