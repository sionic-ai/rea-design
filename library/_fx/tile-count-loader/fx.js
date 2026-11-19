(() => {
  // Digits are built from tiles of 3 columns × 8 rows — per row, which cells light up (0·1·2). The form of the original countdown 3 → 2 → 1
  const DIGITS = {
    1: [[1], [0, 1], [1], [1], [1], [1], [1], [0, 1, 2]],
    2: [[0, 1, 2], [2], [2], [0, 1, 2], [0], [0], [0], [0, 1, 2]],
    3: [[0, 1, 2], [2], [2], [0, 1, 2], [2], [2], [2], [0, 1, 2]],
  };
  const TILES = 24;

  kfFx.register("tile-count-loader", (el, { options, reduce }) => {
    if (reduce) { el.dispatchEvent(new CustomEvent("fx:done")); el.hidden = true; return () => { el.hidden = false; }; }

    const base = +(options.base ?? 1600);
    const k = () => (base ? Math.min(1.6, Math.max(0.64, innerWidth / base)) : 1);
    const colGap = +(options.col ?? 144), rowGap = +(options.row ?? 72);
    const tw = +(options.tile ?? 130), th = +(options["tile-h"] ?? 60);
    const countS = +(options.count ?? 0.36), holdMs = +(options.hold ?? 90), gatherS = +(options.gather ?? 0.46);
    const growS = +(options.grow ?? 1.96), minLoops = Math.max(1, +(options.loops ?? 1) || 1);
    const until = options.until || "load";
    const target = options.target ? document.querySelector(options.target) : null;
    const countEase = kfFx.ease("0.65,0,0.35,1", "power2.inOut");

    const field = document.createElement("div");
    const veil = document.createElement("div");
    field.className = "fx-tiles";
    veil.className = "fx-tiles__veil";
    field.setAttribute("aria-hidden", "true");
    field.append(veil);
    const anchors = Array.from({ length: TILES }, () => {
      const a = document.createElement("span");
      const t = document.createElement("span");
      a.className = "fx-tiles__anchor";
      t.className = "fx-tiles__tile";
      a.append(t);
      field.append(a);
      return a;
    });
    const tiles = anchors.map((a) => a.firstChild);
    el.append(field);

    const place = (i, digit) => {
      const row = Math.floor(i / 3), r = i % 3, on = DIGITS[digit][row] || [1];
      return { x: ((on[r % on.length] ?? 1) - 1) * colGap * k(), y: (row - 3.5) * rowGap * k() };
    };

    const live = new Set(), timers = new Set();
    let dead = false;
    const wait = (ms) => new Promise((res) => { const id = setTimeout(() => { timers.delete(id); res(); }, ms); timers.add(id); });
    const tween = (targets, vars) => new Promise((res) => { const t = gsap.to(targets, { ...vars, onComplete: () => { live.delete(t); res(); } }); live.add(t); });
    const ready = until === "load"
      ? (document.readyState === "complete" ? Promise.resolve() : new Promise((res) => addEventListener("load", res, { once: true })))
      : new Promise((res) => { addEventListener(until, res, { once: true }); const id = setTimeout(res, 9000); timers.add(id); });

    gsap.set(tiles, { width: tw * k(), height: th * k(), autoAlpha: 0 });
    gsap.set(anchors, { x: 0, y: 0 });

    (async () => {
      let loaded = false;
      ready.then(() => { loaded = true; });
      el.dataset.loaderState = "intro";
      await wait(+(options.delay ?? 0) * 1000);
      if (dead) return;
      el.dataset.loaderState = "loading";
      gsap.set(tiles, { autoAlpha: 1 });
      await tween(anchors, { x: 0, y: (i) => (Math.floor(i / 3) - 3.5) * rowGap * k(), duration: gatherS, ease: "power3.inOut", stagger: { each: 0.006, from: "center" } });
      await wait(180);
      let loops = 0;
      do {
        for (const d of [3, 2, 1]) {
          if (dead) return;
          await tween(anchors, { x: (i) => place(i, d).x, y: (i) => place(i, d).y, duration: countS, ease: countEase, stagger: { each: 0.004, from: "random" } });
          await wait(holdMs);
        }
        loops++;
      } while (!dead && (!loaded || loops < minLoops));
      if (dead) return;

      // Gathers, then the first tile grows to the target (or the top band of the screen if none) and becomes a surface — the rest of the order is set by the receiver of fx:assemble at the same 0s
      el.dataset.loaderState = "assembling";
      el.dispatchEvent(new CustomEvent("fx:assemble"));
      const box = () => (target ? target.getBoundingClientRect() : { top: 0, height: th * k() * 3.72, width: innerWidth });
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => { live.delete(tl); el.dataset.loaderState = "done"; el.dispatchEvent(new CustomEvent("fx:done")); } });
      live.add(tl);
      tl.to(anchors, { x: 0, y: 0, duration: gatherS, ease: countEase, stagger: { each: 0.006, from: "edges" } }, 0)
        .set(tiles.slice(1), { autoAlpha: 0 }, gatherS)
        .to(tiles[0], { width: () => box().width, height: () => box().height, duration: growS, ease: "power4.inOut" }, gatherS)
        .to(anchors[0], { y: () => box().top + box().height / 2 - innerHeight / 2, duration: growS, ease: "power4.inOut" }, gatherS)
        .to(veil, { autoAlpha: 0, duration: 0.82, ease: "power2.out" }, gatherS + 1.06)
        .set(tiles[0], { autoAlpha: 0 }, gatherS + growS);
    })();

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      live.forEach((t) => t.kill());
      field.remove();
      delete el.dataset.loaderState;
    };
  });
})();
