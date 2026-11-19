(() => {
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  kfFx.register("dim-preview-board", (el, { options, reduce, hover, scroller }) => {
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    const shots = () => [...el.querySelectorAll('[data-fx-part="shot"]')];
    const cap = el.querySelector('[data-fx-part="caption"]'), sub = el.querySelector('[data-fx-part="caption-sub"]'), capBox = el.querySelector('[data-fx-part="caption-box"]');
    const step = +(options.step ?? 0.028) * 1000, jitter = +(options.jitter ?? 0.025) * 1000, life = +(options.life ?? 0.064) * 1000;
    const chars = options.chars || UPPER, capOut = +(options["caption-dur"] ?? 0.4) * 1000;
    const near = options.zone === "near", center = options.touch !== "off";
    let active = null, raf = 0, clear = 0, resting = false;

    const pick = () => chars[Math.floor(Math.random() * chars.length)];
    // Big name: from blank, each letter (step × order + 0 to jitter) later shuffles through Latin letters for life, then settles on its own letter
    const write = (title, note) => {
      cancelAnimationFrame(raf); clearTimeout(clear);
      if (!cap) return;
      const lines = [[cap, [...title]], [sub, [...(note || "")]]].filter(([n]) => n);
      if (reduce) { lines.forEach(([n, c]) => (n.textContent = c.join(""))); return; }
      const starts = lines.map(([, c]) => c.map((ch, i) => step * i + Math.random() * jitter));
      const t0 = performance.now();
      const frame = (now) => {
        const t = now - t0;
        let done = true;
        lines.forEach(([n, c], k) => {
          n.textContent = c.map((ch, i) => {
            if (/\s/.test(ch)) return ch;
            const a = t - starts[k][i];
            if (a < 0) { done = false; return ""; }
            if (a < life) { done = false; return pick(); }
            return ch;
          }).join("");
        });
        if (!done) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const show = (item, idle = false) => {
      if (item === active && idle === resting) return;
      active = item;
      resting = idle && !!item;
      const key = item?.dataset.key;
      items().forEach((n) => { n.classList.toggle("is-active", !idle && n === item); n.classList.toggle("is-dim", !idle && !!item && n !== item); });
      shots().forEach((s) => { s.classList.toggle("is-on", !!item && s.dataset.key === key); s.classList.toggle("is-idle", idle && s.dataset.key === key); });
      el.classList.toggle("is-on", !!item);
      if (item) {
        capBox?.classList.add("is-on");
        write(item.dataset.title || item.querySelector('[data-fx-part="name"]')?.textContent.trim() || "", item.dataset.sub || "");
      } else {
        capBox?.classList.remove("is-on");
        cancelAnimationFrame(raf);
        clear = setTimeout(() => { if (cap) cap.textContent = ""; if (sub) sub.textContent = ""; }, capOut);
      }
    };

    // zone: near — the nearest case lights up wherever you are within the list strip (original Brand: even in the left margin the first column case lights up)
    const nearest = (x, y) => {
      let best = null, bd = Infinity;
      for (const n of items()) {
        const r = n.getBoundingClientRect();
        if (y < r.top - 40 || y > r.bottom + 60) continue;
        const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom), d = dx * dx + dy * dy * 4;
        if (d < bd) { bd = d; best = n; }
      }
      return best;
    };
    const onMove = (e) => {
      const b = el.getBoundingClientRect();
      if (e.clientY < b.top || e.clientY > b.bottom) { if (active && !resting) show(null); return; }
      const hit = near ? nearest(e.clientX, e.clientY) : e.target.closest?.('[data-fx-part="item"]') || null;
      if (hit || !resting) show(hit);
    };
    const onLeave = () => { if (!resting) show(null); };

    // Devices without hover: the last work crossing the −120px line at screen center turns on (original brand phone list)
    const box = scroller || window;
    const onScroll = () => {
      const line = innerHeight / 2 - 120;
      let pickd = null;
      for (const n of items()) { if (n.getBoundingClientRect().top <= line) pickd = n; else break; }
      const b = el.getBoundingClientRect();
      if (b.bottom < line || b.top > innerHeight) pickd = null;
      show(pickd);
    };
    const onShow = (e) => show(items().find((n) => n.dataset.key === e.detail?.key) || null, !!e.detail?.idle);
    const onHide = () => show(null);
    el.addEventListener("fx:show", onShow);
    el.addEventListener("fx:hide", onHide);

    // center-below: windows narrower than this width (px) turn on following the center line even when a hand is present (original Brand 1024 and below)
    const below = +(options["center-below"] ?? 0);
    let mode = "";
    const bind = () => {
      const next = !hover || innerWidth < below ? (center ? "center" : "") : "hover";
      if (next === mode) return;
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("scroll", onScroll);
      mode = next;
      show(null);
      if (mode === "hover") { addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave); }
      else if (mode === "center") { box.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
    };
    bind();
    if (below) addEventListener("resize", bind);
    return () => {
      removeEventListener("resize", bind);
      cancelAnimationFrame(raf); clearTimeout(clear);
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("scroll", onScroll);
      el.removeEventListener("fx:show", onShow);
      el.removeEventListener("fx:hide", onHide);
      items().forEach((n) => n.classList.remove("is-active", "is-dim"));
      shots().forEach((s) => s.classList.remove("is-on", "is-idle"));
      el.classList.remove("is-on");
      capBox?.classList.remove("is-on");
    };
  });
})();
