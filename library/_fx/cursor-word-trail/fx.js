(() => {
  // The original (Brand) has a single full-screen Konva stage with two layers, a trail layer and a word layer, and receives the window’s mousemove.
  // The part uses the same screen-fixed stage but draws only over the element it’s attached to — it retracts in .2s when leaving the element or reaching a quiet spot (link, button).
  const catmull = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  };

  kfFx.register("cursor-word-trail", (el, { options, reduce, hover, scroller }) => {
    if (reduce || !hover || typeof Konva === "undefined" || typeof gsap === "undefined") return;
    const fromParts = [...el.querySelectorAll('[data-fx-part="word"]')].map((n) => n.textContent.trim()).filter(Boolean);
    const words = (options.words ? options.words.split(",").map((w) => w.trim()).filter(Boolean) : fromParts);
    const chance = +(options.chance ?? 0.2);
    const spread = +(options.spread ?? 30);
    const gapMin = +(options.gap ?? 200), gapMax = +(options["gap-max"] ?? 400);
    const hold = +(options.hold ?? 0.3), fade = +(options.fade ?? 0.7);
    const calm = options.calm || "a, button";
    const css = getComputedStyle(el);
    const ink = css.getPropertyValue("--fx-ink").trim() || css.getPropertyValue("--kf-ink").trim();
    const face = css.getPropertyValue("--fx-font").trim() || css.getPropertyValue("--kf-font-sans").trim();
    const size = +(options.size ?? 10);

    const box = document.createElement("div");
    box.setAttribute("data-fx-part", "trail-stage");
    box.setAttribute("aria-hidden", "true");
    el.append(box);
    const stage = new Konva.Stage({ container: box, width: innerWidth, height: innerHeight });
    const trailLayer = new Konva.Layer({ listening: false }), textLayer = new Konva.Layer({ listening: false });
    stage.add(trailLayer);
    stage.add(textLayer);

    const T = { segs: [], tw: new Map(), ctrl: [], buf: [], last: null, move: null, dy: 0, spawn: { v: 1 } };
    const W = { texts: [], tw: new Map(), lastAt: 0, gap: 0 };
    const dropSeg = (line) => {
      const i = T.segs.indexOf(line);
      if (i !== -1) T.segs.splice(i, 1);
      const p = T.tw.get(line);
      if (p) gsap.killTweensOf(p);
      T.tw.delete(line);
      line.destroy();
    };
    const addSeg = (pts) => {
      const line = new Konva.Line({ points: pts, stroke: ink, strokeWidth: 1, lineCap: "round", lineJoin: "round", opacity: T.spawn.v });
      trailLayer.add(line);
      T.segs.push(line);
      const p = { o: T.spawn.v };
      T.tw.set(line, p);
      gsap.to(p, { o: 0, duration: fade, delay: hold, ease: "power2.out", onUpdate: () => { line.opacity(p.o); trailLayer.batchDraw(); }, onComplete: () => dropSeg(line) });
      if (T.segs.length > 512) dropSeg(T.segs[0]);
    };
    const drawLatest = () => {
      const n = T.ctrl.length;
      if (n < 2) return;
      const p0 = T.ctrl[Math.max(0, n - 3)], p1 = T.ctrl[n - 2], p2 = T.ctrl[n - 1];
      const pts = [p1.x, p1.y];
      for (let i = 1; i <= 5; i++) { const q = catmull(p0, p1, p2, p2, i / 5); pts.push(q.x, q.y); }
      addSeg(pts);
      if (T.ctrl.length > 32) T.ctrl = T.ctrl.slice(-4);
    };
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dy = T.dy, mv = T.move;
      T.dy = 0; T.move = null;
      if (dy) {
        T.segs.forEach((l) => { const p = l.points(); for (let i = 1; i < p.length; i += 2) p[i] -= dy; l.points(p); });
        T.ctrl = T.ctrl.map((p) => ({ x: p.x, y: p.y - dy }));
        T.buf = T.buf.map((p) => ({ x: p.x, y: p.y - dy }));
        if (T.ctrl.length && T.last) { T.buf = [T.last]; T.ctrl.push(T.last); const keep = T.spawn.v; T.spawn.v = 0; drawLatest(); T.spawn.v = keep; }
      }
      if (mv) {
        T.buf.push(mv);
        if (T.buf.length > 5) T.buf.shift();
        const s = T.buf.reduce((o, p) => ({ x: o.x + p.x, y: o.y + p.y }), { x: 0, y: 0 });
        T.ctrl.push({ x: s.x / T.buf.length, y: s.y / T.buf.length });
        drawLatest();
      }
      if (dy || mv) trailLayer.batchDraw();
    };
    raf = requestAnimationFrame(loop);

    const spawnWord = (x, y) => {
      const t = new Konva.Text({ x: x + (Math.random() * 2 - 1) * spread, y: y + (Math.random() * 2 - 1) * spread, text: words[(Math.random() * words.length) | 0], fontFamily: face, fontStyle: "500", fontSize: size, fill: ink, opacity: 0 });
      t.x(t.x() - t.width() / 2);
      textLayer.add(t);
      W.texts.push(t);
      const p = { o: 0 };
      W.tw.set(t, p);
      gsap.to(p, { o: 1, duration: 0.2, ease: "power2.out", onUpdate: () => { t.opacity(p.o); textLayer.batchDraw(); }, onComplete: () => {
        gsap.to(p, { o: 0, duration: 0.8, delay: 0.8, ease: "power2.out", onUpdate: () => { t.opacity(p.o); textLayer.batchDraw(); }, onComplete: () => {
          const i = W.texts.indexOf(t);
          if (i !== -1) W.texts.splice(i, 1);
          W.tw.delete(t);
          t.destroy();
        } });
      } });
    };
    const clearAll = () => {
      T.tw.forEach((p) => gsap.killTweensOf(p)); T.tw.clear(); T.segs.forEach((l) => l.destroy()); T.segs = []; trailLayer.batchDraw();
      W.tw.forEach((p) => gsap.killTweensOf(p)); W.tw.clear(); W.texts.forEach((t) => t.destroy()); W.texts = []; textLayer.batchDraw();
    };

    let quiet = true;
    const goQuiet = () => {
      if (quiet) return;
      quiet = true;
      gsap.killTweensOf(T.spawn); gsap.to(T.spawn, { v: 0, duration: 0.2, ease: "power2.out" });
      gsap.killTweensOf(box); gsap.to(box, { opacity: 0, duration: 0.2, onComplete: clearAll });
    };
    const wake = () => {
      if (!quiet) return;
      quiet = false;
      gsap.killTweensOf(T.spawn); gsap.to(T.spawn, { v: 1, duration: 0.2, ease: "power2.out" });
      gsap.killTweensOf(box); gsap.to(box, { opacity: 1, duration: 0.2 });
    };
    const onMove = (e) => {
      const inCalm = !!e.target.closest?.(calm);
      inCalm ? goQuiet() : wake();
      T.move = { x: e.clientX, y: e.clientY };
      T.last = T.move;
      if (quiet || !words.length || Math.random() > chance || Date.now() - W.lastAt < W.gap) return;
      W.lastAt = Date.now();
      W.gap = gapMin + Math.random() * (gapMax - gapMin);
      spawnWord(e.clientX, e.clientY);
    };
    const src = scroller || window;
    let prevY = scroller ? scroller.scrollTop : scrollY;
    const onScroll = () => {
      const y = scroller ? scroller.scrollTop : scrollY, dy = y - prevY;
      prevY = y;
      T.dy += dy;
      W.texts.forEach((t) => t.y(t.y() - dy));
      textLayer.batchDraw();
    };
    const onResize = () => stage.size({ width: innerWidth, height: innerHeight });
    gsap.set(box, { opacity: 0 });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", goQuiet);
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", goQuiet);
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      gsap.killTweensOf(box); gsap.killTweensOf(T.spawn);
      clearAll();
      stage.destroy();
      box.remove();
    };
  });
})();
