(() => {
  // A single dot = "x y phase direction"(Line) or "x y cx cy phase direction"(curve), commas between points. x·y are ratios of panel width·height, so off-panel (-.1·1.1) is allowed
  const parse = (s) =>
    String(s || "")
      .split(",")
      .map((p) => p.trim().split(/\s+/).map(Number))
      .filter((a) => a.length >= 2 && a.every((n) => Number.isFinite(n)));

  kfFx.register("wiggle-line-draw", (el, { options, reduce }) => {
    const curve = options.curve === "1" || options.curve === "true";
    const shapes = {
      pc: parse(options.pts),
      sp: parse(options["pts-sp"]),
      toPc: parse(options.to),
      toSp: parse(options["to-sp"]),
    };
    if (shapes.pc.length < 2) return;
    if (shapes.sp.length !== shapes.pc.length) shapes.sp = shapes.pc;
    if (shapes.toPc.length !== shapes.pc.length) shapes.toPc = null;
    if (!shapes.toSp || shapes.toSp.length !== shapes.sp.length) shapes.toSp = shapes.toPc && shapes.sp === shapes.pc ? shapes.toPc : null;

    const mq = matchMedia(`(max-width: ${+(options.bp ?? 768)}px)`);
    const widthPc = +(options.width ?? 0.045), widthSp = +(options["width-sp"] ?? 0.064);
    const ampPc = +(options.amp ?? 40), ampSp = +(options["amp-sp"] ?? 15);
    const speed = +(options.speed ?? 0.4);
    const minW = +(options["min-width"] ?? 0);
    const colorVar = options.color || "--kf-raised";
    const on = options.on || "load";
    const dur = +(options.dur ?? 3.6), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");

    let canvas = el.querySelector(":scope > canvas");
    const made = !canvas;
    if (made) canvas = el.appendChild(document.createElement("canvas"));
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = { p: on === "drawn" || reduce ? 0 : -1, o: 1, m: 0, mt: 0 };
    let color = "", dpr = 1, w = 0, h = 0, seen = true, running = false, stopped = false, held = false;
    const tweens = new Set();
    const keep = (t) => { tweens.add(t); t.eventCallback("onComplete", () => tweens.delete(t)); return t; };
    const kill = () => { tweens.forEach((t) => t.kill()); tweens.clear(); };

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const wide = !mq.matches && minW > 0;
      canvas.style.width = wide ? `${Math.max(el.clientWidth, minW)}px` : "";
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      color = getComputedStyle(el).getPropertyValue(colorVar).trim() || getComputedStyle(el).color;
      draw(reduce ? 0 : gsap.ticker.time);
    };

    // Takes phase (in π units) and direction and moves a small ellipse per dot — width is half the height
    const wob = (o, d, t, amp) => {
      const a = (t * speed + o * Math.PI) * d;
      return [Math.cos(a) * amp * 0.5, Math.sin(a) * amp];
    };

    function points(t) {
      const sp = mq.matches;
      const from = sp ? shapes.sp : shapes.pc;
      const to = sp ? shapes.toSp : shapes.toPc;
      const amp = reduce ? 0 : sp ? ampSp : ampPc;
      const m = state.m;
      const out = [];
      from.forEach((a, i) => {
        const b = to ? to[i] : a;
        const lerp = (k) => a[k] + ((b[k] ?? a[k]) - a[k]) * m;
        const oi = curve ? 4 : 2;
        const [dx, dy] = wob(a[oi] ?? 0, a[oi + 1] ?? 1, t, amp);
        const p = { x: w * lerp(0) + dx, y: h * lerp(1) + dy };
        if (curve && i > 0) { p.cx = w * lerp(2) + dx; p.cy = h * lerp(3) + dy; }
        out.push(p);
      });
      return out;
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (state.o <= 0 || !w) return;
      const pts = points(t);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = w * (mq.matches ? widthSp : widthPc);
      ctx.strokeStyle = color;
      ctx.globalAlpha = state.o;
      ctx.beginPath();
      let len = 0;
      pts.forEach((p, i) => {
        if (!i) return ctx.moveTo(p.x, p.y);
        const q = pts[i - 1];
        if (curve) {
          // The previous point’s outgoing handle is that point’s incoming handle flipped across the point — it joins without a kink
          const c1x = i === 1 ? q.x : 2 * q.x - q.cx, c1y = i === 1 ? q.y : 2 * q.y - q.cy;
          ctx.bezierCurveTo(c1x, c1y, p.cx, p.cy, p.x, p.y);
        } else ctx.lineTo(p.x, p.y);
        len += Math.hypot(p.x - q.x, p.y - q.y) * (curve ? 1.1 : 1);
      });
      ctx.setLineDash([len, len]);
      ctx.lineDashOffset = -len * state.p;
      ctx.stroke();
      ctx.restore();
    }

    const tick = (t) => {
      if (state.mt !== state.m) state.m += (state.mt - state.m) * 0.4;
      if (Math.abs(state.mt - state.m) < 1e-4) state.m = state.mt;
      draw(t);
    };
    const run = (yes) => {
      yes = yes && seen && !stopped && !held && !reduce;
      if (yes === running) return;
      running = yes;
      if (yes) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };

    const api = {
      draw(d = {}) {
        kill(); stopped = false; state.o = 1; run(true);
        return keep(gsap.fromTo(state, { p: d.from ?? -1 }, { p: 0, duration: d.dur ?? dur, ease: d.ease ? kfFx.ease(d.ease, d.ease) : ease, delay: d.delay ?? 0 }));
      },
      erase(d = {}) {
        kill(); run(true);
        return keep(gsap.fromTo(state, { p: d.from ?? 0 }, { p: 1, duration: d.dur ?? 1.8, ease: d.ease ? kfFx.ease(d.ease, d.ease) : "power4.out" }));
      },
      pulse(d = {}) {
        kill(); stopped = false; state.o = 1; run(true);
        const tl = gsap.timeline();
        tl.fromTo(state, { p: -1 }, { p: 0, duration: d.in ?? 2.4, ease: "power4.out" });
        tl.to(state, { p: 1, duration: d.out ?? 2, ease: "power4.inOut" }, `>-=${d.overlap ?? 1}`);
        tl.eventCallback("onComplete", () => { stopped = true; run(false); draw(gsap.ticker.time); });
        return keep(tl);
      },
      fade(d = {}) {
        kill();
        return keep(gsap.to(state, { o: 0, duration: d.dur ?? 0.4, onUpdate: () => draw(gsap.ticker.time), onComplete: () => { stopped = true; run(false); } }));
      },
      morph(v) { state.mt = Math.min(1, Math.max(0, +v || 0)); if (!running) tick(gsap.ticker.time); },
      // Pause drawing while another board covers it (the drawing is cleared) — resume rippling when visible again
      hold(yes) { held = !!yes; el.style.visibility = held ? "hidden" : ""; run(!held); },
    };
    el.kfWiggleLine = api;

    const evs = {
      "fx:draw": (e) => api.draw(e.detail || {}),
      "fx:erase": (e) => api.erase(e.detail || {}),
      "fx:pulse": (e) => api.pulse(e.detail || {}),
      "fx:fade": (e) => api.fade(e.detail || {}),
      "fx:morph": (e) => api.morph(e.detail?.value ?? e.detail),
      "fx:hold": (e) => api.hold(e.detail ?? true),
    };
    for (const k in evs) el.addEventListener(k, evs[k]);

    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; run(seen); }, { rootMargin: "10% 0px" });
    io.observe(el);
    const ro = new ResizeObserver(() => size());
    ro.observe(el);
    mq.addEventListener?.("change", size);
    size();

    let st = null;
    if (!reduce && options.scrub && window.ScrollTrigger) {
      const trig = document.querySelector(options.scrub) || el;
      // Past the end it erases, and it only draws again after returning all the way to the very start (above the start point) — while moving back and forth in between it stays erased
      let drawn = true;
      st = ScrollTrigger.create({
        trigger: trig,
        start: options.start || "top top-=1px",
        end: options.end || "bottom 20%",
        scrub: true,
        onUpdate: (s) => api.morph(s.progress),
        onLeave: () => { if (options.leave === "erase" && drawn) { drawn = false; api.erase({ dur: +(options["erase-dur"] ?? 1.8) }); } },
        onLeaveBack: () => { if (options.leave === "erase" && !drawn) { drawn = true; api.draw({ dur: +(options["back-dur"] ?? 2.4), ease: "power4.out" }); } },
      });
    }

    if (reduce) { stopped = true; draw(0); }
    else if (on === "load") { run(true); api.draw({ delay }); }
    else if (on === "drawn") run(true);
    else if (on === "enter") {
      const io2 = new IntersectionObserver(([en]) => { if (en.isIntersecting) { api.draw({ delay }); io2.disconnect(); } }, { rootMargin: `0px 0px -${+(options.margin ?? 10)}% 0px` });
      io2.observe(el);
      evs.__io2 = io2;
    } else run(true);

    return () => {
      kill(); run(false); io.disconnect(); ro.disconnect(); evs.__io2?.disconnect(); st?.kill();
      mq.removeEventListener?.("change", size);
      for (const k in evs) if (k.startsWith("fx:")) el.removeEventListener(k, evs[k]);
      delete el.kfWiggleLine;
      el.style.visibility = "";
      if (made) canvas.remove(); else { canvas.style.width = ""; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    };
  });
})();
