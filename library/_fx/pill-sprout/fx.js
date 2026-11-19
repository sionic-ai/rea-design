(() => {
  // Velocity 1.x [tension, friction] spring — a path solved to the end with RK4 is stretched to the given length and read as progress → value (the original feel intact)
  const springPath = (tension, friction) => {
    const accel = (s) => -s.tension * s.x - s.friction * s.v;
    const evalD = (s0, dt, d) => { const s = { x: s0.x + d.dx * dt, v: s0.v + d.dv * dt, tension: s0.tension, friction: s0.friction }; return { dx: s.v, dv: accel(s) }; };
    const step = (s, dt) => {
      const a = { dx: s.v, dv: accel(s) }, b = evalD(s, dt * 0.5, a), c = evalD(s, dt * 0.5, b), d = evalD(s, dt, c);
      s.x += (a.dx + 2 * (b.dx + c.dx) + d.dx) / 6 * dt;
      s.v += (a.dv + 2 * (b.dv + c.dv) + d.dv) / 6 * dt;
      return s;
    };
    const run = (dt, collect) => {
      const s = { x: -1, v: 0, tension, friction }, path = [0];
      let lapsed = 0;
      for (let i = 0; i < 4000; i++) {
        step(s, dt); path.push(1 + s.x); lapsed += 16;
        if (!(Math.abs(s.x) > 1e-4 && Math.abs(s.v) > 1e-4)) break;
      }
      return collect ? path : lapsed;
    };
    return (durationMs) => {
      const path = run((run(0.016, false) / durationMs) * 0.016, true);
      return (p) => (p >= 1 ? 1 : path[(p * (path.length - 1)) | 0]);
    };
  };

  kfFx.register("pill-sprout", (el, { options, reduce, hover, scroller }) => {
    const bgs = [...el.querySelectorAll('[data-fx-part="bg"]')];
    const arrow = el.querySelector('[data-fx-part="arrow"]');
    const label = el.querySelector('[data-fx-part="label"]');
    if (!bgs.length) return;
    const tension = +(options.tension ?? 800), friction = +(options.friction ?? 30);
    const pop = +(options.pop ?? 1.15), springDur = +(options.spring ?? 0.6);
    const delay = +(options.delay ?? 0);
    const on = String(options.on || "scroll");
    const E = {
      sineIn: kfFx.ease("0.47,0,0.745,0.715", "sine.in"),
      quartInOut: kfFx.ease("0.77,0,0.175,1", "power3.inOut"),
      quartOut: kfFx.ease("0.165,0.84,0.44,1", "power3.out"),
      back: kfFx.ease("0.175,0.885,0.32,1.275", "back.out(1.7)"),
      cubicOut: kfFx.ease("0.215,0.61,0.355,1", "power2.out"),
    };
    const parts = [...bgs, arrow, label].filter(Boolean);

    let tl = null, st = null;
    const build = () => {
      const W = el.offsetWidth, H = el.offsetHeight;
      if (!W || !H) return null;
      const t = gsap.timeline({ paused: true });
      // If the background is layered (outer rim, inner panel), each layer goes from the point at its own height to its own width — the original btnsetB has two layers, 80 and 72
      bgs.forEach((bg) => {
        const h = bg.offsetHeight, w = bg.offsetWidth;
        gsap.set(bg, { width: h, scale: 0, transformOrigin: `${h / 2}px ${h / 2}px` });
        t.to(bg, { scale: 1, duration: 0.2, ease: E.sineIn }, 0.2);
        t.to(bg, { width: w, duration: 0.3, ease: E.quartInOut }, 0.4);
      });
      if (arrow) {
        const ax = arrow.offsetLeft + arrow.offsetWidth / 2;
        gsap.set(arrow, { x: H / 2 - ax, scale: 0 });
        t.to(arrow, { scale: 1, duration: 0.2, ease: E.sineIn }, 0.26);
        t.to(arrow, { x: 0, duration: 0.3, ease: E.quartInOut }, 0.46);
      }
      if (label) {
        gsap.set(label, { scale: 0 });
        t.to(label, { scale: 1, duration: 0.3, ease: E.back }, 0.76);
      }
      return t;
    };
    const show = () => { if (tl && !tl.isActive() && tl.progress() === 0) gsap.delayedCall(delay, () => tl.play()); };

    // on: none: everything is visible from the start and only interaction reactions remain (original video skip button)
    if (!reduce && on !== "none") {
      tl = build();
      if (tl) {
        if (on === "load") show();
        else if (on === "scroll") st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 90%", once: true, onEnter: show });
        el.addEventListener("fx:show", show);
      }
    }

    // On hover, instantly 1.15x — the original swells at length 0 and returns only by spring
    const spring = springPath(tension, friction)(springDur * 1000);
    const enter = () => {
      el.classList.add("fx-pill-sprout-on");
      gsap.killTweensOf(el, "scale");
      gsap.set(el, { scale: pop });
      gsap.to(el, { scale: 1, duration: springDur, ease: spring });
    };
    const leave = () => {
      el.classList.remove("fx-pill-sprout-on");
      gsap.killTweensOf(el, "scale");
      gsap.to(el, { scale: 1, duration: 0.3, ease: E.cubicOut });
    };
    const target = (options.area && el.closest(options.area)) || el;
    if (hover && !reduce) { target.addEventListener("pointerenter", enter); target.addEventListener("pointerleave", leave); }
    target.addEventListener("focusin", enter);
    target.addEventListener("focusout", leave);

    return () => {
      st?.kill(); tl?.kill();
      el.removeEventListener("fx:show", show);
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", leave);
      target.removeEventListener("focusin", enter);
      target.removeEventListener("focusout", leave);
      el.classList.remove("fx-pill-sprout-on");
      gsap.set([el, ...parts], { clearProps: "transform,width,scale" });
    };
  });
})();
