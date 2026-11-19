(() => {
  // A pixel icon drawn with cells (path·rect) lights up one cell at a time in random order, then every few seconds a group of cells flickers very briefly, and occasionally the whole thing switches off and on.
  // Cells around the mouse’s path stay erased for a few seconds — an icon like a broken pixel screen
  const pick = (a, b) => a + Math.random() * (b - a);
  const pickInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const segDist = (px, py, ax, ay, bx, by) => {
    const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
    const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)) : 0;
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };

  kfFx.register("pixel-icon-glitch", (el, { options, reduce, hover, scroller }) => {
    const cells = [...el.querySelectorAll("path, rect")];
    if (!cells.length) return;
    if (reduce) { gsap.set(cells, { opacity: 1 }); return () => gsap.set(cells, { clearProps: "opacity,pointerEvents" }); }
    const o = {
      order: +(options.order ?? 0.03), on: +(options.on ?? 0.05), rest: +(options.rest ?? 2),
      every: [+(options["every-min"] ?? 3), +(options["every-max"] ?? 6)], fullChance: +(options.full ?? 0.1), fullOrder: 0.01, fullHold: +(options["full-hold"] ?? 0.4),
      blink: 0.01, few: [+(options["few-min"] || 8), +(options["few-max"] || 50)], again: [1, 2], slowChance: 0.8, hold: [0.2, 1],
      reach: +(options.reach ?? 10), hide: [+(options["hide-min"] ?? 1), +(options["hide-max"] ?? 4)],
    };
    const enter = options.enter || "scroll";
    const wiped = new Set(), alive = () => cells.filter((c) => !wiped.has(c));
    const timers = new Set(), tls = new Set();
    const later = (s, fn) => { const d = gsap.delayedCall(s, () => { timers.delete(d); fn(); }); timers.add(d); return d; };
    const track = (tl) => { tls.add(tl); tl.eventCallback("onComplete", () => tls.delete(tl)); return tl; };

    const wipe = (c) => {
      wiped.add(c);
      gsap.killTweensOf(c);
      gsap.set(c, { opacity: 0, pointerEvents: "none" });
      later(pick(...o.hide), () => { wiped.delete(c); gsap.set(c, { opacity: 1, pointerEvents: "" }); });
    };
    let prev = null;
    const sweep = (e) => {
      if (e.pointerType !== "mouse") return;
      const a = prev || { x: e.clientX, y: e.clientY }, b = (prev = { x: e.clientX, y: e.clientY });
      for (const c of alive()) {
        const r = c.getBoundingClientRect();
        if (segDist(r.left + r.width / 2, r.top + r.height / 2, a.x, a.y, b.x, b.y) <= o.reach + Math.max(r.width, r.height) / 2) wipe(c);
      }
    };
    const leave = () => (prev = null);

    const shake = () => {
      const tl = track(gsap.timeline());
      if (Math.random() < o.fullChance) {
        const row = gsap.utils.shuffle(alive()), backAt = o.blink + row.length * o.fullOrder + o.fullHold;
        row.forEach((c, i) => {
          tl.set(c, { opacity: 0 }, o.blink + i * o.fullOrder);
          tl.call(() => !wiped.has(c) && gsap.set(c, { opacity: 1 }), null, backAt + o.blink + i * o.fullOrder);
        });
      } else {
        gsap.utils.shuffle(alive()).slice(0, pickInt(...o.few)).forEach((c) => {
          const stay = Math.random() < o.slowChance ? pick(...o.hold) : o.hold[0], n = pickInt(...o.again);
          for (let k = 0; k <= n; k++) tl.set(c, { opacity: k % 2 ? 1 : 0 }, o.blink + k * (o.blink + stay));
          tl.call(() => !wiped.has(c) && gsap.set(c, { opacity: 1 }), null, o.blink + n * (o.blink + stay));
        });
      }
    };
    let running = false;
    const loop = () => { shake(); later(pick(...o.every), loop); };
    const run = () => {
      if (running) return;
      running = true;
      if (hover) { el.addEventListener("pointermove", sweep); el.addEventListener("pointerleave", leave); }
      later(o.rest, loop);
    };
    const show = () => {
      const tl = track(gsap.timeline({ onComplete: run }));
      gsap.utils.shuffle([...cells]).forEach((c, i) => tl.set(c, { opacity: 1 }, i * o.order + o.on));
    };

    let st = null;
    if (enter === "none") run();
    else {
      gsap.set(cells, { opacity: 0 });
      if (enter === "load") show();
      else { gsap.registerPlugin(ScrollTrigger); st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 85%", once: true, onEnter: show }); }
    }
    return () => {
      st?.kill();
      timers.forEach((d) => d.kill());
      tls.forEach((t) => t.kill());
      el.removeEventListener("pointermove", sweep);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(cells);
      gsap.set(cells, { clearProps: "opacity,pointerEvents" });
    };
  });
})();
