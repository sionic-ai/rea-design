// Stage (data-fx-part="stage") Pill and square shapes fall and pile up with matter-js physics — first five at once, then one every 3 seconds up to ten.
// Picker button (data-fx-part="pick") each carries one of four colors × two shapes at random, and pressing drops that color and shape, stops auto-drop, and the button colors reshuffle.
// Hand icon (data-fx-part="cursor") moves between buttons over 2s expo.inOut pointing at where to press, and the erase (data-fx-part="clear") clears away everything that has fallen.
(() => {
  const TONES = ["1", "2", "3", "4"];
  const SHAPES = ["round", "rect"];
  kfFx.register("shape-pick-drop", (el, { options, reduce, hover }) => {
    const M = window.Matter;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    if (!M) return;
    const narrow = +options.narrow || 1024;
    const wide = () => innerWidth > narrow;
    const zone = options.zone || "right";
    const gravity = () => (wide() ? +(options.gravity ?? 3) : +(options["gravity-m"] ?? 1.4));
    const first = +(options.first ?? 5), max = +(options.max ?? 10), every = +(options.every ?? 3);
    const size = () => (wide() ? +(options.size ?? 0.18) : +(options["size-m"] ?? 0.28));
    const start = options.start || "load", delay = +(options.delay ?? 0.2);
    const picks = [...el.querySelectorAll('[data-fx-part="pick"]')];
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const clear = el.querySelector('[data-fx-part="clear"]');
    const blocks = [...el.querySelectorAll('[data-fx-part="block"]')];
    const ac = new AbortController(), signal = ac.signal;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pickOf = (list) => list[Math.floor(Math.random() * list.length)];

    const engine = M.Engine.create();
    const world = engine.world;
    world.gravity.x = 0;
    world.gravity.y = gravity();
    let w = stage.clientWidth, h = stage.clientHeight;
    const render = M.Render.create({
      element: stage, engine,
      options: { wireframes: false, background: "transparent", width: w, height: h, pixelRatio: Math.min(devicePixelRatio || 1, 2) },
    });
    render.canvas.classList.add("fx-shape-drop__canvas");
    render.canvas.setAttribute("aria-hidden", "true");
    // If the physics board blocks wheel and touch, the page can’t scroll over it — dragging is left to the mouse hand only
    const mouse = M.Mouse.create(render.canvas);
    ["mousewheel", "DOMMouseScroll", "wheel"].forEach((t) => render.canvas.removeEventListener(t, mouse.mousewheel));
    if (!hover) ["touchstart", "touchmove", "touchend"].forEach((t) => {
      render.canvas.removeEventListener(t, mouse.mousedown);
      render.canvas.removeEventListener(t, mouse.mousemove);
      render.canvas.removeEventListener(t, mouse.mouseup);
    });
    const drag = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: +(options.stiffness ?? 0.5), render: { visible: false } } });
    M.Composite.add(world, drag);
    render.mouse = mouse;

    const tone = { color: "1", shape: "round" };
    const fill = (t) => {
      const v = getComputedStyle(el).getPropertyValue(`--fx-shape-${t}`).trim();
      return v || getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
    };
    // The canvas may not accept color-mix·oklch text, so it paints one dot and reads it as rgb
    const px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    const rgb = (c) => {
      const i = document.createElement("i");
      i.style.cssText = `display:none;color:${c}`;
      el.append(i);
      const got = getComputedStyle(i).color;
      i.remove();
      if (!px) return got;
      px.clearRect(0, 0, 1, 1);
      px.fillStyle = got;
      px.fillRect(0, 0, 1, 1);
      const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    const wall = (x, y, ww, hh) => M.Bodies.rectangle(x, y, ww, hh, { isStatic: true, friction: 0.5, frictionAir: 0.01, render: { fillStyle: "transparent" }, label: "fx-wall" });
    const walls = () => {
      M.Composite.allBodies(world).filter((b) => b.isStatic).forEach((b) => M.Composite.remove(world, b));
      const left = zone === "right" && wide() ? w / 2 - 40 : -10;
      const list = [
        wall((left + w) / 2, h, w - left, 20),
        wall(w, h / 2, wide() ? 50 : 20, h),
        wall(left, h / 2, 20, h),
      ];
      const box = stage.getBoundingClientRect();
      blocks.forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.width && r.height) list.push(wall(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width, r.height));
      });
      M.Composite.add(world, list);
    };
    const body = () => {
      const bw = size() * w, bh = bw / 2;
      const x = zone === "right" && wide() ? rnd(w / 2 + 50, w - 50) : rnd(50, w - 50);
      return M.Bodies.rectangle(x, -200, bw, bh, {
        density: 0.2, friction: 1.2, frictionAir: 0.01, restitution: 0.4,
        chamfer: { radius: tone.shape === "round" ? bh / 2 : 6 },
        render: { fillStyle: rgb(fill(tone.color)) },
        angle: Math.random() * 1800 - 90,
        label: "fx-shape",
      });
    };
    const shuffle = () => { tone.color = pickOf(TONES); tone.shape = pickOf(SHAPES); };
    const drop = () => M.Composite.add(world, body());

    const calls = [];
    let auto = true, left = max, loop = null, cursorLoop = null;
    const deal = () => {
      const c = [], s = [];
      let tries = 4;
      const roll = () => {
        tries--;
        picks.forEach((_, i) => { c[i] = pickOf(TONES); s[i] = pickOf(SHAPES); });
        if (picks.length > 1 && c[1] === c[0] && s[1] === s[0] && tries > 0) roll();
      };
      roll();
      calls.push(gsap.delayedCall(0.4, () => picks.forEach((p, i) => { p.dataset.tone = c[i]; p.dataset.shape = s[i]; })));
      if (picks.length && !reduce) gsap.timeline().to(picks, { scale: 0.9, duration: 0.4, ease: "expo.inOut" }).to(picks, { scale: 1, duration: 0.4, ease: "expo.inOut" });
    };
    const autoAdd = () => {
      drop();
      left--;
      loop = gsap.delayedCall(every, () => { shuffle(); if (auto && left > 0) autoAdd(); });
    };
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      for (let i = 0; i < first; i++) { drop(); shuffle(); }
      if (reduce) return;
      autoAdd();
      if (cursor) cursorLoop = gsap.to(cursor, { "--x": 1, duration: 2, ease: "expo.inOut", repeat: -1, yoyo: true });
    };

    picks.forEach((p, i) => {
      p.addEventListener("click", () => {
        auto = false;
        tone.color = p.dataset.tone || "1";
        tone.shape = p.dataset.shape || "round";
        drop();
        deal();
      }, { signal });
      p.addEventListener("pointerenter", () => {
        if (reduce) return;
        gsap.to(p, { scale: 0.95, duration: 0.2, ease: "expo.inOut" });
        cursorLoop?.pause();
        if (cursor) gsap.to(cursor, { "--x": i, duration: 1.2, ease: "expo.inOut" });
      }, { signal });
      p.addEventListener("pointerleave", () => { if (!reduce) gsap.to(p, { scale: 1, duration: 0.2, ease: "expo.inOut" }); }, { signal });
    });
    clear?.addEventListener("click", (e) => {
      e.preventDefault();
      M.Composite.allBodies(world).filter((b) => !b.isStatic).forEach((b) => M.Composite.remove(world, b));
    }, { signal });

    const resize = () => {
      const nw = stage.clientWidth, nh = stage.clientHeight;
      if (!nw || !nh) return;
      const k = nw / w;
      w = nw;
      h = nh;
      world.gravity.y = gravity();
      M.Render.setSize(render, w, h);
      M.Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: w, y: h } });
      if (k !== 1) M.Composite.allBodies(world).filter((b) => !b.isStatic).forEach((b) => { M.Body.scale(b, k, k); M.Body.setPosition(b, { x: b.position.x * k, y: b.position.y * k }); });
      walls();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    walls();
    deal();
    M.Render.run(render);
    M.Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: w, y: h } });
    const runner = M.Runner.create();
    M.Runner.run(runner, engine);
    if (start === "event") el.addEventListener("fx:play", show, { signal });
    else calls.push(gsap.delayedCall(delay, show));

    return () => {
      ac.abort();
      ro.disconnect();
      calls.forEach((c) => c.kill());
      loop?.kill();
      cursorLoop?.kill();
      M.Runner.stop(runner);
      M.Render.stop(render);
      M.Engine.clear(engine);
      M.Mouse.clearSourceEvents?.(mouse);
      render.canvas.remove();
      if (picks.length) gsap.set(picks, { clearProps: "transform" });
      cursor?.style.removeProperty("--x");
    };
  });
})();
