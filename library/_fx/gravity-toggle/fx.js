// Pieces in the plate become Matter bodies with one switch and spill onto the floor, and switching off sends them flying back into place.
// The switch may also sit outside the panel (menu bar), so it can also be called on this element with fx:toggle·fx:on·fx:off events
(() => {
  const MOUSE = ["mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend", "mousewheel", "DOMMouseScroll"];

  kfFx.register("gravity-toggle", (el, { options, reduce, hover }) => {
    if (typeof Matter === "undefined") return;
    const { Engine, Bodies, Composite, Mouse, MouseConstraint } = Matter;
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const ac = new AbortController(), on = { signal: ac.signal };
    const O = {
      gravity: +(options.gravity ?? 1.4), bounce: +(options.bounce ?? 0.35), friction: +(options.friction ?? 0.1),
      grab: +(options.grab ?? 0.2), backMin: +(options["back-min"] ?? 1.25), backMax: +(options["back-max"] ?? 2.25),
      stagger: +(options.stagger ?? 0.03),
    };
    const backEase = kfFx.ease(options.ease || "power4.out", "power4.out");
    const STEP = 1000 / 60;
    let state = "idle", engine = null, mouse = null, grab = null, parts = [];
    const shown = (n) => { const r = n.getBoundingClientRect(); return getComputedStyle(n).visibility !== "hidden" && r.width > 0 && r.height > 0; };
    const sync = (v) => { el.classList.toggle("fx-gravity", v); q("toggle").forEach((t) => t.setAttribute("aria-pressed", String(v))); };

    const tick = (time, delta) => {
      const dt = Math.min(Math.max(1, delta || STEP), 50), n = Math.max(1, Math.ceil(dt / STEP - 0.05));
      for (let i = 0; i < n; i++) Engine.update(engine, dt / n);
      for (const p of parts) {
        if (p.body.isSleeping) continue;
        p.set({ x: p.x0 + p.body.position.x - p.w / 2 - p.left, y: p.y0 + p.body.position.y - p.h / 2 - p.top, rotation: (p.body.angle * 180) / Math.PI });
      }
      el.classList.toggle("fx-grabbing", !!grab?.body);
    };
    const unmouse = () => {
      if (!mouse) return;
      const fn = { mousedown: mouse.mousedown, mousemove: mouse.mousemove, mouseup: mouse.mouseup, touchstart: mouse.mousedown, touchmove: mouse.mousemove, touchend: mouse.mouseup, mousewheel: mouse.mousewheel, DOMMouseScroll: mouse.mousewheel };
      MOUSE.forEach((t) => mouse.element.removeEventListener(t, fn[t]));
      mouse = null;
    };
    const teardown = () => {
      gsap.ticker.remove(tick);
      unmouse();
      if (engine) { Composite.clear(engine.world, false); Engine.clear(engine); }
      engine = grab = null;
    };

    function start() {
      if (state !== "idle") return;
      const els = q("body").filter(shown);
      if (!els.length) return;
      state = "active"; sync(true);
      // Origin at the plate’s top left — walls and objects move together when the page scrolls
      const a = el.getBoundingClientRect(), T = 400;
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = O.gravity;
      Composite.add(engine.world, [
        Bodies.rectangle(a.width / 2, a.height + T / 2, a.width + T * 2, T, { isStatic: true }),
        Bodies.rectangle(a.width / 2, -T / 2, a.width + T * 2, T, { isStatic: true }),
        Bodies.rectangle(-T / 2, a.height / 2, T, a.height + T * 2, { isStatic: true }),
        Bodies.rectangle(a.width + T / 2, a.height / 2, T, a.height + T * 2, { isStatic: true }),
      ]);
      parts = els.map((n) => {
        const r = n.getBoundingClientRect();
        const p = {
          el: n, w: r.width, h: r.height, left: r.left - a.left, top: r.top - a.top, css: n.style.cssText,
          x0: gsap.getProperty(n, "x"), y0: gsap.getProperty(n, "y"), rot0: gsap.getProperty(n, "rotation"),
          set: gsap.quickSetter(n, "css"),
        };
        Object.assign(n.style, { transformOrigin: "50% 50%", pointerEvents: "none" });
        p.body = Bodies.rectangle(p.left + r.width / 2, p.top + r.height / 2, r.width, r.height, {
          angle: (p.rot0 * Math.PI) / 180,
          chamfer: { radius: Math.min(r.width, r.height) * 0.15, qualityMax: 4 },
          restitution: O.bounce, friction: O.friction,
        });
        Composite.add(engine.world, p.body);
        return p;
      });
      // On phones we skip the throw-around effect — Matter’s touch handle blocks scrolling
      if (hover) {
        mouse = Mouse.create(el);
        mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
        grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: O.grab, render: { visible: false } } });
        Composite.add(engine.world, grab);
      }
      if (reduce) {
        // With reduced motion, show only the pile already settled on the floor
        for (let i = 0; i < 240; i++) Engine.update(engine, STEP);
        tick(0, 0);
        return;
      }
      gsap.ticker.add(tick);
    }

    function stop() {
      if (state !== "active") return;
      state = "restoring"; sync(false);
      gsap.ticker.remove(tick);
      el.classList.remove("fx-grabbing");
      const d = parts.map((p) => Math.hypot(p.x0 - gsap.getProperty(p.el, "x"), p.y0 - gsap.getProperty(p.el, "y")));
      const lo = Math.min(...d), span = Math.max(...d) - lo || 1;
      const done = () => {
        parts.forEach((p) => { p.el.style.cssText = p.css; });
        parts = []; teardown(); state = "idle";
      };
      gsap.to(parts.map((p) => p.el), {
        x: (i) => parts[i].x0, y: (i) => parts[i].y0, rotation: (i) => parts[i].rot0,
        duration: (i) => (reduce ? 0 : O.backMin + ((d[i] - lo) / span) * (O.backMax - O.backMin)),
        ease: backEase, stagger: reduce ? 0 : O.stagger, onComplete: done,
      });
    }

    const toggle = () => (state === "idle" ? start() : stop());
    el.addEventListener("fx:toggle", toggle, on);
    el.addEventListener("fx:on", start, on);
    el.addEventListener("fx:off", stop, on);
    q("toggle").forEach((t) => t.addEventListener("click", (e) => { e.stopPropagation(); toggle(); }, on));

    return () => {
      ac.abort(); teardown();
      gsap.killTweensOf(parts.map((p) => p.el));
      parts.forEach((p) => { if (p.el.isConnected) p.el.style.cssText = p.css; });
      parts = []; state = "idle"; el.classList.remove("fx-gravity", "fx-grabbing");
    };
  });
})();
