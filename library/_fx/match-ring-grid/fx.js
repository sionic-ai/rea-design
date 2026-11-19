// A panel where the product grid flies and gathers into three big center spots + an inner circle + an outer circle according to score (data-score).
// At first (no scores) it’s a plain grid so it scrolls vertically inside the panel, and after the first sort you drag the whole panel (inertia · bounce) to look around, push it with the wheel, and get parallax opposite the cursor.
// Positions are invisible circles sized by screen (center plate = Calculated from screen width 62.67vw, phone 100vw) — each product moves with a single translate + scale.
(() => {
  const parse = (s) => String(s).split(",").map(Number);

  kfFx.register("match-ring-grid", (el, { options, reduce, hover }) => {
    const wrap = el.querySelector('[data-fx-part="wrap"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!wrap || !items.length) return;

    const mainCount = +(options.main ?? 3);
    const ratio = +(options.ratio ?? 0.44);
    const fly = +(options.fly ?? 1);
    const flyEase = `cubic-bezier(${options["fly-ease"] || "0.42,0,0.21,1"})`;
    const parallax = +(options.parallax ?? 10);
    const panDur = +(options["pan-dur"] ?? 0.6);
    const panEase = parse(options["pan-ease"] || "0.42,0,0.21,1");
    const power = +(options.power ?? 0.35);
    const timeConstant = +(options.time ?? 300);
    const bounceStiffness = +(options["bounce-stiffness"] ?? 300);
    const bounceDamping = +(options["bounce-damping"] ?? 35);
    const elastic = +(options.elastic ?? 0.1);
    const M = window.Motion;

    // Parallax layer (box) per product > Two fly layers — create them if missing
    const made = [];
    const layers = items.map((it) => {
      let box = it.querySelector('[data-fx-part="box"]');
      if (!box) {
        box = document.createElement("div");
        box.setAttribute("data-fx-part", "box");
        box.append(...it.childNodes);
        it.append(box);
        made.push([it, box]);
      }
      let flyEl = box.querySelector('[data-fx-part="fly"]');
      if (!flyEl) {
        flyEl = document.createElement("div");
        flyEl.setAttribute("data-fx-part", "fly");
        flyEl.append(...box.childNodes);
        box.append(flyEl);
        made.push([box, flyEl]);
      }
      return { it, box, fly: flyEl };
    });

    el.style.setProperty("--fx-fly", `${reduce ? 0 : fly}s`);
    el.style.setProperty("--fx-fly-ease", flyEase);
    let sorted = false;
    const pan = { x: 0, y: 0 };
    let bounds = { left: 0, right: 0, top: 0, bottom: 0 };
    const applyPan = () => { wrap.style.translate = `${pan.x}px ${pan.y}px`; };
    const mvX = M?.motionValue ? M.motionValue(0) : null;
    const mvY = M?.motionValue ? M.motionValue(0) : null;
    const unsubs = [];
    if (mvX) {
      unsubs.push(mvX.on("change", (v) => { pan.x = v; applyPan(); }));
      unsubs.push(mvY.on("change", (v) => { pan.y = v; applyPan(); }));
    }
    const setPan = (x, y) => {
      if (mvX) { mvX.stop(); mvY.stop(); mvX.set(x); mvY.set(y); } else { pan.x = x; pan.y = y; applyPan(); }
    };
    const tweenPan = (x, y, dur, ease) => {
      if (mvX) {
        if (!mvX.isAnimating()) M.animate(mvX, x, { duration: dur, ease });
        if (!mvY.isAnimating()) M.animate(mvY, y, { duration: dur, ease });
      } else gsap.to(pan, { x, y, duration: dur, ease: kfFx.ease(ease.join(","), "power2.inOut"), onUpdate: applyPan });
    };
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    // Invisible circles — three center slots (35% width · folds onto a second row), inner circle (panel 1.25×), outer circle (1.6×)
    const geometry = () => {
      const W = el.clientWidth, H = el.clientHeight, vw = W / 100;
      const desk = W >= 1024, tab = W >= 768;
      const S = desk ? 62.6667 * vw : W;
      const top = desk ? -(S - H) / 2 : (H - S) / 2;
      const left = (W - S) / 2;
      const cx = left + S / 2, cy = top + S / 2;
      const mainW = (desk || tab ? 0.35 : 0.4) * S;
      const mainH = desk ? 18 * vw : tab ? 28.6667 * vw : mainW;
      const ring = (scale, size) => ({ R: (scale * S) / 2 - size / 2, size });
      return {
        W, H, S, cx, cy, top, mainW, mainH,
        first: ring(desk ? 1.25 : tab ? 1.15 : 1.3, desk ? 10.6667 * vw : tab ? 18.6667 * vw : 24 * vw),
        second: ring(desk ? 1.6 : tab ? 1.5 : 1.7, desk ? 5.3333 * vw : tab ? 10.6667 * vw : 16 * vw),
      };
    };
    const slotsFor = (n) => {
      const g = geometry();
      const out = [];
      const boxTop = g.top + 0.5 * g.S - 0.6 * 0.6 * g.S;
      const perRow = Math.max(1, Math.floor(1 / (g.mainW / g.S)));
      const mains = Math.min(mainCount, n);
      const rows = Math.ceil(mains / perRow);
      const lineH = Math.max(g.mainH, (0.6 * g.S) / Math.max(rows, 1));
      for (let i = 0; i < mains; i++) {
        const row = Math.floor(i / perRow), inRow = Math.min(perRow, mains - row * perRow), col = i % perRow;
        const rowLeft = g.cx - (inRow * g.mainW) / 2;
        out.push({ ring: "main", left: rowLeft + col * g.mainW, top: boxTop + row * lineH, w: g.mainW });
      }
      const rest = n - mains;
      const firstN = Math.min(rest, Math.round(rest * ratio));
      for (const [name, count, r] of [["first", firstN, g.first], ["second", rest - firstN, g.second]]) {
        for (let i = 0; i < count; i++) {
          const a = (i * 2 * Math.PI) / count;
          out.push({ ring: name, left: g.cx + r.R * Math.cos(a) - r.size / 2, top: g.cy + r.R * Math.sin(a) - r.size / 2, w: r.size });
        }
      }
      return out;
    };

    const ranking = () => layers
      .map((l, i) => ({ l, i, s: parseFloat(l.it.dataset.score) || 0 }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map((x) => x.l);

    const layout = (first) => {
      const order = ranking();
      const slots = slotsFor(order.length);
      const size = Math.max(...slots.map((s) => s.w));
      const wr = wrap.getBoundingClientRect(), er = el.getBoundingClientRect();
      const wx = wr.left - pan.x - er.left, wy = wr.top - pan.y - er.top;
      let minL = Infinity, maxR = -Infinity, minT = Infinity, maxB = -Infinity;
      order.forEach((l, rank) => {
        const s = slots[rank];
        const cell = l.box.getBoundingClientRect();
        const cx = cell.left - wr.left, cy = cell.top - wr.top;
        const x = Math.round(s.left - wx - cx), y = Math.round(s.top - wy - cy);
        const scale = s.w / size;
        if (first || !l.fly.style.width) {
          const start = cell.width / size;
          l.fly.style.transition = "none";
          l.fly.style.width = `${size}px`;
          l.fly.style.height = `${size}px`;
          l.fly.style.transform = `translate(0px, 0px) scale(${start})`;
          l.fly.getBoundingClientRect();
          l.fly.style.transition = "";
        }
        l.box.setAttribute("data-ring", s.ring);
        l.it.setAttribute("data-rank", rank + 1);
        l.fly.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        minL = Math.min(minL, s.left); maxR = Math.max(maxR, s.left + s.w);
        minT = Math.min(minT, s.top); maxB = Math.max(maxB, s.top + s.w);
      });
      const W = el.clientWidth, H = el.clientHeight;
      bounds = { left: Math.min(0, W - 40 - maxR), right: Math.max(0, 40 - minL), top: Math.min(0, 0.75 * H - maxB), bottom: Math.max(0, 40 - minT) };
      tweenPan(clamp(pan.x, bounds.left, bounds.right), clamp(pan.y, bounds.top, bounds.bottom), panDur, panEase);
    };

    const sort = () => {
      const first = !sorted;
      if (first) {
        sorted = true;
        el.scrollTop = 0;
        // On phones where the board sat in the page flow the window is scrolled — scroll to the top before the board becomes a single screen
        if (scrollY > 0) scrollTo(0, 0);
        el.classList.add("is-fx-sorted");
      }
      layout(first);
    };
    const onSort = () => sort();
    el.addEventListener("fx:sort", onSort);
    const onReset = () => {
      sorted = false;
      el.classList.remove("is-fx-sorted");
      setPan(0, 0);
      layers.forEach((l) => { l.fly.style.transform = ""; l.fly.style.width = ""; l.fly.style.height = ""; l.box.removeAttribute("data-ring"); l.it.removeAttribute("data-rank"); });
    };
    el.addEventListener("fx:reset", onReset);
    const ro = new ResizeObserver(() => { if (sorted) layout(false); });
    ro.observe(el);

    // Drag — outside the panel it follows only 10%, and on release it glides with inertia (power .35 · 300ms) and bounces to a stop at the end
    let drag = null, moved = false;
    const history = [];
    const onDown = (e) => {
      if (!sorted || e.button > 0 || e.target.closest("button, input, label, [data-nodrag]")) return;
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
      moved = false;
      history.length = 0;
      history.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      mvX?.stop(); mvY?.stop();
    };
    const rubber = (v, a, b) => (v < a ? a + (v - a) * elastic : v > b ? b + (v - b) * elastic : v);
    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      if (!moved) { moved = true; el.classList.add("is-fx-dragging"); try { el.setPointerCapture(e.pointerId); } catch {} }
      history.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      while (history.length > 2 && performance.now() - history[0].t > 100) history.shift();
      setPan(rubber(drag.px + dx, bounds.left, bounds.right), rubber(drag.py + dy, bounds.top, bounds.bottom));
    };
    const onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      el.classList.remove("is-fx-dragging");
      if (!moved) return;
      setTimeout(() => { moved = false; }, 100);
      const a = history[0], b = history[history.length - 1];
      const dt = Math.max(1, b.t - a.t) / 1000;
      const vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt;
      if (M?.animate) {
        const common = { type: "inertia", power, timeConstant, bounceStiffness, bounceDamping, restDelta: 1, restSpeed: 10 };
        M.animate(mvX, pan.x, { ...common, velocity: vx, min: bounds.left, max: bounds.right });
        M.animate(mvY, pan.y, { ...common, velocity: vy, min: bounds.top, max: bounds.bottom });
      } else {
        const tx = clamp(pan.x + vx * power, bounds.left, bounds.right), ty = clamp(pan.y + vy * power, bounds.top, bounds.bottom);
        gsap.to(pan, { x: tx, y: ty, duration: (timeConstant / 1000) * 3, ease: "expo.out", onUpdate: applyPan });
      }
    };
    // A press after turning it off doesn’t pick a product
    const onClickCapture = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } };
    const onWheel = (e) => {
      if (!sorted || e.ctrlKey) return;
      e.preventDefault();
      setPan(clamp(pan.x - e.deltaX, bounds.left, bounds.right), clamp(pan.y - e.deltaY, bounds.top, bounds.bottom));
    };
    // Cursor parallax — screen width and height are mapped to −10~10px and pushed the opposite way. Each ring has a different transition length so outer ones follow later (fx.css)
    const onPointerMove = (e) => {
      if (!sorted || drag || e.pointerType === "touch") return;
      const W = innerWidth, H = innerHeight;
      const px = -((e.clientX / W) * 2 - 1) * parallax, py = -((e.clientY / H) * 2 - 1) * parallax;
      layers.forEach((l) => { l.box.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`; });
    };
    const onLeave = () => layers.forEach((l) => { l.box.style.transform = ""; });

    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });
    if (hover && !reduce) {
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerleave", onLeave);
    }
    if (reduce) el.classList.add("is-fx-reduce");

    return () => {
      ro.disconnect();
      unsubs.forEach((u) => u());
      mvX?.stop(); mvY?.stop();
      el.removeEventListener("fx:sort", onSort);
      el.removeEventListener("fx:reset", onReset);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onLeave);
      el.classList.remove("is-fx-sorted", "is-fx-dragging", "is-fx-reduce");
      el.style.removeProperty("--fx-fly");
      el.style.removeProperty("--fx-fly-ease");
      wrap.style.translate = "";
      layers.forEach((l) => {
        l.box.style.transform = ""; l.box.removeAttribute("data-ring");
        l.fly.style.transform = ""; l.fly.style.width = ""; l.fly.style.height = ""; l.fly.style.transition = "";
        l.it.removeAttribute("data-rank");
      });
      for (const [outer, inner] of made.reverse()) { inner.before(...inner.childNodes); inner.remove(); void outer; }
    };
  });
})();
