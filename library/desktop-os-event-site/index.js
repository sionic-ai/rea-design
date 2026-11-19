// Motion of a single desktop — icon dragging, selection box, gravity mode, secret folder. Windows and modals call G in shared.js.
(() => {
  gsap.registerPlugin(Draggable);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const area = $("[data-drag-area]");
  const items = $$("[data-drag-item]");
  const selection = new Set();
  const select = (el, on) => { el.classList.toggle("is-selected", on); on ? selection.add(el) : selection.delete(el); };
  const clearSel = () => [...selection].forEach((el) => select(el, false));

  // ── File window: clones a frame per icon and fills in the title and photo label ──
  const tpl = $("#g-gif-tpl");
  const makeGif = (key, title, label) => {
    if ($(`[data-window="${key}"]`)) return;
    const win = tpl.content.firstElementChild.cloneNode(true);
    win.dataset.window = key;
    $("[data-window-title]", win).textContent = title;
    $(".wf-img", win).dataset.label = label;
    document.body.insertBefore(win, $("[data-window='txt']"));
    G.win.register(win);
  };
  items.filter((el) => /^gif-/.test(el.dataset.openWindow)).forEach((el) => {
    makeGif(el.dataset.openWindow, el.dataset.title, $(".wf-img", el).dataset.label.replace("Square", "Inside window, landscape 4:3"));
  });
  const mystery = $("[data-mystery-card]");
  makeGif(mystery.dataset.finalWindow, mystery.dataset.finalTitle, mystery.dataset.finalLabel);

  // ── Icons: wide screens drag (press 1.03x · shadow, release back.out(3)), phones only tap to open ──
  let topZ = 10 + items.length;
  items.forEach((el, i) => {
    el.style.zIndex = 10 + i;
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); G.win.open(el.dataset.openWindow, el); } });
  });
  const openFor = (el) => G.win.open(el.dataset.openWindow, el);
  const tapToOpen = (el) => {
    let dx = 0, dy = 0;
    const down = (e) => { dx = e.clientX; dy = e.clientY; };
    const up = (e) => { if (Math.hypot(e.clientX - dx, e.clientY - dy) <= 6) openFor(el); };
    el.addEventListener("pointerdown", down, true);
    el.addEventListener("pointerup", up, true);
    return () => { el.removeEventListener("pointerdown", down, true); el.removeEventListener("pointerup", up, true); };
  };

  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    const offs = items.map(tapToOpen);
    const drags = items.map((el) => Draggable.create(el, {
      type: "x,y", bounds: area, dragResistance: 0.05, minimumMovement: 3,
      cursor: "grab", activeCursor: "grabbing",
      onPress() {
        el.style.zIndex = ++topZ;
        if (!el.hasAttribute("data-select-none")) el.classList.add("is-selected");
        gsap.to(el, { scale: 1.03, filter: "drop-shadow(0px 12px 16px rgba(0,0,0,0.07))", duration: 0.15, ease: "power2.out" });
      },
      onRelease() {
        if (!selection.has(el)) el.classList.remove("is-selected");
        gsap.to(el, { scale: 1, filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))", duration: 0.35, ease: "back.out(3)" });
      },
    })[0]);
    return () => { offs.forEach((f) => f()); drags.forEach((d) => d.kill()); };
  });
  mm.add("(max-width: 767px)", () => {
    const offs = items.map(tapToOpen);
    return () => offs.forEach((f) => f());
  });

  // ── Selection box: drawn when dragging over 4px on empty background, and icons it overlaps become selected (shift adds) ──
  if (!matchMedia("(pointer: coarse)").matches) {
    const box = $("[data-select-box]");
    let sx = 0, sy = 0, on = false, shown = false, add = false;
    const move = (e) => {
      if (!on) return;
      if (!shown && Math.hypot(e.clientX - sx, e.clientY - sy) < 4) return;
      if (!shown) { shown = true; box.style.opacity = "1"; }
      const l = Math.min(sx, e.clientX), t = Math.min(sy, e.clientY), w = Math.abs(e.clientX - sx), h = Math.abs(e.clientY - sy);
      Object.assign(box.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
      items.filter((el) => !el.hasAttribute("data-select-none")).forEach((el) => {
        const r = el.getBoundingClientRect();
        const hit = !(r.right < l || r.left > l + w || r.bottom < t || r.top > t + h);
        if (hit) select(el, true); else if (!add) select(el, false);
      });
    };
    const end = () => {
      if (!on) return;
      on = false;
      removeEventListener("pointermove", move, true);
      removeEventListener("pointerup", end, true);
      document.body.style.userSelect = "";
      if (!shown) return;
      shown = false;
      gsap.to(box, { opacity: 0, duration: 0.12, ease: "power2.out", onComplete: () => { box.style.width = box.style.height = "0px"; } });
    };
    area.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("[data-drag-item], [data-window], button, a") || document.body.classList.contains("is-crazy")) return;
      on = true; shown = false; add = e.shiftKey;
      sx = e.clientX; sy = e.clientY;
      if (!add) clearSel();
      document.body.style.userSelect = "none";
      addEventListener("pointermove", move, true);
      addEventListener("pointerup", end, true);
    });
  }

  // ── Gravity mode: icons and open windows become Matter bodies and pour down (gravity 1.4 · restitution .35), and when turned off they return to place in 1.25–2.25 seconds proportional to distance ──
  (function gravity() {
    const toggle = $("[data-gravity-toggle]");
    if (!toggle || !matchMedia("(min-width: 768px)").matches || typeof Matter === "undefined") return;
    const { Engine, Bodies, Composite, Mouse, MouseConstraint, Query } = Matter;
    const STEP = 1000 / 60;
    let state = "idle", engine, mouse, grab, tick, parts = [], bodies = [];
    const visible = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0; };

    function on() {
      if (state !== "idle") return;
      const els = [...items, ...$$("[data-window]")].filter(visible);
      if (!els.length) return;
      state = "active";
      toggle.classList.add("is-active");
      document.body.classList.add("is-crazy");
      clearSel();
      engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = 1.4;
      const a = area.getBoundingClientRect(), T = 400, cx = a.left + a.width / 2, cy = a.top + a.height / 2;
      Composite.add(engine.world, [
        Bodies.rectangle(cx, a.bottom + T / 2, a.width + T * 2, T, { isStatic: true }),
        Bodies.rectangle(cx, a.top - T / 2, a.width + T * 2, T, { isStatic: true }),
        Bodies.rectangle(a.left - T / 2, cy, T, a.height + T * 2, { isStatic: true }),
        Bodies.rectangle(a.right + T / 2, cy, T, a.height + T * 2, { isStatic: true }),
      ]);
      parts = els.map((el) => {
        const r = el.getBoundingClientRect();
        const p = {
          el, w: r.width, h: r.height, left: r.left, top: r.top, css: el.style.cssText,
          x0: gsap.getProperty(el, "x"), y0: gsap.getProperty(el, "y"), rot0: gsap.getProperty(el, "rotation"),
          drag: Draggable.get(el), set: gsap.quickSetter(el, "css"),
        };
        p.drag && p.drag.disable();
        Object.assign(el.style, { transformOrigin: "50% 50%", pointerEvents: "none", filter: "none" });
        p.body = Bodies.rectangle(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, {
          angle: (p.rot0 * Math.PI) / 180,
          chamfer: { radius: Math.min(r.width, r.height) * 0.15, qualityMax: 4 },
          restitution: 0.35, friction: 0.1,
        });
        Composite.add(engine.world, p.body);
        return p;
      });
      bodies = parts.map((p) => p.body);
      mouse = Mouse.create(document.body);
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
      grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
      Composite.add(engine.world, grab);
      tick = (time, delta) => {
        const dt = Math.min(delta || STEP, 50);
        const n = Math.max(1, Math.ceil(dt / STEP - 0.05));
        for (let i = 0; i < n; i++) Engine.update(engine, Math.min(dt / n, STEP));
        for (const p of parts) {
          if (p.body.isSleeping) continue;
          p.set({ x: p.x0 + p.body.position.x - p.w / 2 - p.left, y: p.y0 + p.body.position.y - p.h / 2 - p.top, rotation: (p.body.angle * 180) / Math.PI });
        }
        const holding = grab && grab.body;
        document.body.classList.toggle("is-grabbing", !!holding);
        document.body.classList.toggle("is-grab", !holding && Query.point(bodies, mouse.position).length > 0);
      };
      requestAnimationFrame(() => requestAnimationFrame(() => state === "active" && gsap.ticker.add(tick)));
    }

    function off() {
      if (state !== "active") return;
      state = "restoring";
      toggle.classList.remove("is-active");
      document.body.classList.remove("is-crazy", "is-grab", "is-grabbing");
      gsap.ticker.remove(tick);
      Composite.remove(engine.world, grab);
      const d = parts.map((p) => Math.hypot(p.x0 - gsap.getProperty(p.el, "x"), p.y0 - gsap.getProperty(p.el, "y")));
      const lo = Math.min(...d), span = Math.max(...d) - lo || 1;
      gsap.to(parts.map((p) => p.el), {
        x: (i) => parts[i].x0, y: (i) => parts[i].y0, rotation: (i) => parts[i].rot0,
        duration: (i) => 1.25 + ((d[i] - lo) / span) * (2.25 - 1.25),
        ease: "power4.out", stagger: 0.03,
        onComplete: () => {
          parts.forEach((p) => { p.el.style.cssText = p.css; p.drag && (p.drag.enable(), p.drag.update()); });
          parts = []; bodies = [];
          ["mousedown", "mousemove", "mouseup", "touchstart", "touchmove", "touchend"].forEach((t) => {
            const fn = { mousedown: mouse.mousedown, mousemove: mouse.mousemove, mouseup: mouse.mouseup, touchstart: mouse.mousedown, touchmove: mouse.mousemove, touchend: mouse.mouseup }[t];
            mouse.element.removeEventListener(t, fn);
          });
          Composite.clear(engine.world, false); Engine.clear(engine);
          engine = mouse = grab = null;
          state = "idle";
        },
      });
    }
    toggle.addEventListener("click", () => (state === "idle" ? on() : off()));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && state === "active") { e.stopImmediatePropagation(); off(); } }, true);
  })();

  // ── Secret folder: each press teleports to a different cell of the 4×3 grid (.14s vanish → .3s back.out(2)), the file opens on the fifth press ──
  (function mysteryFolder() {
    const card = mystery, grid = $("[data-mystery-grid]"), view = card.closest("[data-view]");
    const texts = $$(".g-mystery__text span", card);
    const MAX = texts.length;
    let step = 1, busy = false;
    const show = (n) => texts.forEach((t, i) => t.classList.toggle("is-shown", i === n - 1));
    const reset = () => { gsap.killTweensOf(card); gsap.set(card, { x: 0, y: 0, scale: 1, autoAlpha: 1 }); busy = false; step = 1; show(1); };
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      if (busy) return;
      if (step >= MAX) return G.win.open(card.dataset.finalWindow, card);
      step++;
      const g = grid.getBoundingClientRect(), r = card.getBoundingClientRect();
      const cw = g.width / 4, ch = g.height / 3;
      const bx = r.left + r.width / 2 - g.left - gsap.getProperty(card, "x");
      const by = r.top + r.height / 2 - g.top - gsap.getProperty(card, "y");
      const here = Math.floor((r.top + r.height / 2 - g.top) / ch) * 4 + Math.floor((r.left + r.width / 2 - g.left) / cw);
      const cells = Array.from({ length: 12 }, (_, i) => i).filter((i) => i !== here);
      const to = cells[Math.floor(Math.random() * cells.length)];
      const tx = (to % 4) * cw + cw / 2 - bx, ty = Math.floor(to / 4) * ch + ch / 2 - by;
      busy = true;
      const n = step;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(card, { autoAlpha: 0, scale: 0.85, duration: reduce ? 0 : 0.14, ease: "power2.in" })
        .set(card, { x: tx, y: ty })
        .add(() => show(n))
        .to(card, { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 0.3, ease: "back.out(2)" });
    });
    card.closest("[data-window]").addEventListener("window:closed", reset);
    card.closest("[data-window]").addEventListener("view:change", (e) => { if (e.detail !== view.dataset.view) reset(); });
  })();
})();
