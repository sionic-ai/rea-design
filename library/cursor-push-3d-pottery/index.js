(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ICONS = window.cgIcons;
  const SERIES = window.cgSeries;

  const pile = document.querySelector(".cg-pile");
  const enter = document.querySelector(".cg-enter");
  const ja = enter.querySelector(".cg-enter__ja");
  const en = enter.querySelector(".cg-enter__en");
  const prev = document.querySelector('[data-step="-1"]');
  const next = document.querySelector('[data-step="1"]');
  let at = Math.max(0, SERIES.findIndex((s) => s.key === document.body.dataset.series));

  // The loader lifts when physics is loaded and the first round runs (the original lifts once the whole scan model is downloaded)
  window.cgReady = new Promise((done) => {
    pile.addEventListener("fx:ready", done, { once: true });
    setTimeout(done, 8000);
  });

  const icon = (box, key) => { box.innerHTML = ICONS[key]; };
  const fill = (btn, s) => {
    if (!s) { btn.hidden = true; return; }
    btn.hidden = false;
    icon(btn.querySelector("[data-icon]"), s.key);
    btn.querySelector(".cg-step__title").textContent = s.en;
  };
  // Original: the leaving button·symbol stays faded for .6s, swaps in 1.1s after the advance (measured), and comes back in over .6s
  const fadeSwap = (el, change) => {
    if (reduce) { change(); return; }
    if (!el.hidden) {
      el.classList.remove("is-entering");
      el.classList.add("is-leaving");
    }
    setTimeout(() => {
      change();
      el.classList.remove("is-leaving", "is-entering");
      // Hidden buttons are pinned at opacity 0 — a hidden element whose animation has stopped returns to opacity 1 and flashes once when shown again
      el.style.opacity = el.hidden ? "0" : "";
      if (!el.hidden) el.classList.add("is-entering");
    }, 1100);
  };

  const paint = (i, first) => {
    const s = SERIES[i];
    document.body.dataset.series = s.key;
    enter.href = `list.html?series=${s.key}`;
    if (first) {
      icon(enter.querySelector("[data-icon]"), s.key);
      ja.textContent = s.ja;
      en.textContent = s.enter;
      fill(prev, SERIES[i - 1]);
      fill(next, SERIES[i + 1]);
      // The original camera divides the Product stage distance 5 at fov 50 by the aspect ratio (landscape screens: ratio × .6, portrait screens: × 2.1) — 5.21 at 1440×900.
      // With a closer wide view, shapes pushed forward by the cursor sphere swell much larger, widening the reaction area
      const aspect = innerWidth / innerHeight;
      const z = 5 / (aspect * (aspect >= 1 ? 0.6 : 2.1));
      pile.setAttribute("data-fx-pile-gather-push", `set: ${s.key}; fov: 50; z: ${z.toFixed(2)}`);
      return;
    }
    fadeSwap(enter, () => {
      icon(enter.querySelector("[data-icon]"), s.key);
      ja.textContent = s.ja;
      en.textContent = s.enter;
    });
    [[prev, SERIES[i - 1]], [next, SERIES[i + 1]]].forEach(([btn, t]) => {
      if (btn.hidden && !t) return;
      fadeSwap(btn, () => fill(btn, t));
    });
    pile.dispatchEvent(new CustomEvent("fx:set", { detail: { set: s.key } }));
    window.cgMarkSeries && window.cgMarkSeries(s.key);
  };

  const go = (i) => {
    if (i === at || i < 0 || i >= SERIES.length) return;
    at = i;
    paint(at, false);
  };
  paint(at, true);
  document.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => go(at + Number(b.dataset.step))));
  document.addEventListener("cg:series", (e) => go(SERIES.findIndex((s) => s.key === e.detail.key)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(at + 1);
    if (e.key === "ArrowLeft") go(at - 1);
  });

  // On phones, swipe sideways to turn pages (the original PageLayout swipe) — the stage is a single screen with no scroll, so there is nothing to block
  const stage = document.querySelector(".cg-stage");
  let sx = null, sy = 0;
  stage.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } });
  stage.addEventListener("pointerup", (e) => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(at + (dx < 0 ? 1 : -1));
  });

  // On screens without a precise pointer, the original uses a path of three overlapping waves (speed 6) as the cursor position instead of a finger, so the sphere stirs the pile by itself.
  // The part receives the cursor only through the window pointermove, so feed that path with the same event — attached before the part’s tick so it overwrites finger movement every frame
  if (!reduce && !matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const PATH_X = [[0.5, 4.2, 0, Math.sin], [0.3, 7.8, 2.1, Math.sin], [0.2, 3, 4.2, Math.cos]];
    const PATH_Y = [[0.5, 4.8, 0, Math.cos], [0.3, 6.6, 1.5, Math.sin], [0.2, 3.6, 3.7, Math.cos]];
    const along = (terms, t) => terms.reduce((sum, [amp, freq, phase, wave]) => sum + amp * wave(t * freq + phase), 0);
    gsap.ticker.add((time) => {
      const b = pile.getBoundingClientRect();
      const x = along(PATH_X, time), y = along(PATH_Y, time);
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: b.left + ((x + 1) / 2) * b.width, clientY: b.top + ((1 - y) / 2) * b.height, pointerType: "touch" }));
    });
  }
})();
