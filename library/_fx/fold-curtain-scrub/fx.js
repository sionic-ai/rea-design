// Opens and covers the panel (video section) attached to the screen like a theater curtain — draws the panel’s clip-path as a polygon with a pleated bottom edge.
// Half-round bulge at each fold (depth = of the fold width .3), with progress the bulge sways 1.75 times by .4 and each fold is .12 later. Fold positions are uneven by .02 via sin.
// reveal: the fold sagging above lifts and the panel is revealed from the bottom · cover: a round-headed fold rises from below and covers the panel
(() => {
  const K = { uneven: 0.02, depth: 0.3, bounce: 0.4, swings: 1.75, lag: 0.12, sway: 0.035, step: 3 };
  const TAU = Math.PI * 2;
  const fold = (w, h, folds, drift) => {
    const r = (K.depth * w) / folds / h, o = r * (1 + K.bounce);
    const s = Math.max(8, Math.ceil(w / folds / K.step));
    const cos = Array.from({ length: s + 1 }, (_, u) => -Math.cos((Math.PI * u) / s));
    const warp = (c) => c + K.uneven * Math.sin(TAU * 1.5 * c);
    const unwarp = (k) => { let p = k; for (let n = 0; n < 3; n++) p -= (warp(p) - k) / (1 + K.uneven * TAU * 1.5 * Math.cos(TAU * 1.5 * p)); return p; };
    return (rise, cover) => {
      const up = rise < 1, m = up ? rise : cover, v = drift * m;
      const pt = (x, k, p) => {
        const n = r * (1 + K.bounce * Math.sin(TAU * (K.swings * m - K.lag * k))) * Math.sqrt(Math.max(0, 1 - p * p));
        const b = (1 + o) * m + K.sway * Math.sin(Math.PI * m) * Math.sin(TAU * (0.6 * x - 0.5 * m)) + (up ? -n : n - o);
        return `${(x * (w + 2) - 1).toFixed(1)}px ${(h * (1 - b)).toFixed(1)}px,`;
      };
      const first = warp(0) * folds + v, last = warp(1) * folds + v;
      const k0 = drift ? Math.floor(first) : 0, k1 = drift ? Math.floor(last) : folds - 1;
      let d = pt(0, k0, 2 * (first - k0) - 1);
      for (let k = k0; k < last; k++) for (let j = 1; j <= s; j++) {
        const x = k + (1 + cos[j]) / 2;
        if (x <= first) continue;
        if (x >= last) break;
        d += pt(unwarp((x - v) / folds), k, cos[j]);
      }
      d += pt(1, k1, 2 * (last - k1) - 1);
      const y = up ? h + 1 : -1;
      return `polygon(${d}${w + 1}px ${y}px,-1px ${y}px)`;
    };
  };

  kfFx.register("fold-curtain-scrub", (el, { options, reduce, scroller }) => {
    const screen = el.querySelector('[data-fx-part="screen"]');
    if (!screen) return;
    const mode = options.mode || "cover";
    const length = +(options.length ?? 1);
    const reveal = mode !== "cover", cover = mode !== "reveal";
    // hold — scroll length (in screen heights) a fully opened panel stays before being covered, in both
    const hold = reveal && cover ? +(options.hold ?? 0) : 0;
    const total = length * ((reveal ? 1 : 0) + (cover ? 1 : 0)) + hold;
    el.style.setProperty("--fx-length", String(total));
    if (reduce) return () => el.style.removeProperty("--fx-length");
    const drift = +(options.drift ?? 0);
    let path = null;
    const measure = () => {
      const wide = matchMedia("(min-width: 992px)").matches;
      path = fold(screen.clientWidth || 1, screen.clientHeight || 1, Math.max(1, +(wide ? options.folds || 8 : options.narrow || options.folds || 4)), drift);
    };
    measure();
    const ro = new ResizeObserver(() => { measure(); draw(st.progress); });
    // Splits the progress (0~1) while the plate is stuck: the first part opens, the latter part covers
    const draw = (p) => {
      const at = p * (total || 1);
      const a = reveal ? Math.min(1, at / length) : 1;
      const b = cover ? Math.max(0, Math.min(1, (at - (reveal ? length + hold : 0)) / length)) : 0;
      el.dataset.curtainPhase = a < 1 ? "reveal" : b > 0 ? "cover" : "open";
      screen.style.clipPath = a <= 0 ? "polygon(0 0, 0 0, 0 0)" : a < 1 || b > 0 ? (b >= 1 ? "polygon(0 0, 0 0, 0 0)" : path(a, b)) : "none";
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom bottom", onUpdate: (s) => draw(s.progress), onRefresh: (s) => draw(s.progress) });
    draw(st.progress);
    ro.observe(screen);
    return () => {
      st.kill();
      ro.disconnect();
      screen.style.clipPath = "";
      delete el.dataset.curtainPhase;
      el.style.removeProperty("--fx-length");
    };
  });
})();
