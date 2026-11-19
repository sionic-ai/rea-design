// Vertical work row — only the center one is large and in color, the ones above and below are .64 scale with grayscale .7. Advance one slot at a time by wheel, drag or arrows and settle with a critically damped spring. Loops endlessly.
(() => {
  kfFx.register("snap-reel-spring", (el, { options, reduce }) => {
    const src = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    const N = src.length;
    if (!N) return;
    const size = +(options.size ?? 0.3) || 0.3, ratio = +(options.ratio ?? 2 / 3) || 2 / 3, small = +(options.small ?? 0.64), dim = +(options.dim ?? 0.7), wheelK = +(options.wheel ?? 1.6) || 1.6;
    const wrap = (v) => ((v % N) + N) % N;
    src.forEach((s) => (s.hidden = true));
    const pool = [];
    let big = 1, bigH = 1, sm = 1, gap = 8, around = 2, H = 1;
    const measure = () => {
      const r = el.getBoundingClientRect();
      H = Math.max(1, r.height);
      big = r.width * size; bigH = big * ratio; sm = big * small;
      gap = 0.5 * (parseFloat(getComputedStyle(el).fontSize) || 16);
      around = Math.ceil(H / (sm + gap)) + 1;
      while (pool.length < around * 2 + 1) {
        const slot = document.createElement("div");
        slot.className = "fx-reel-slot";
        slot.setAttribute("data-fx-part", "slot");
        el.append(slot);
        pool.push(slot);
      }
      last = null;
    };
    let A = 0, goal = 0, vel = 0, smooth = 0.45, last = null, raf = 0, prev = performance.now(), idx = 0;
    const settle = (x) => { const a = Math.min(1, Math.abs(x)); return 1 - a * a * (3 - 2 * a); };
    const damp = (cur, to, dt) => {
      const om = 2 / smooth, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x), ch = cur - to, tmp = (vel + om * ch) * dt;
      vel = (vel - om * tmp) * ex;
      return to + (ch + tmp) * ex;
    };
    const draw = () => {
      const c = Math.round(A), list = [];
      for (let v = c - around; v <= c + around; v++) { const d = v - A, a = settle(d); list.push({ v, d, a, w: sm + (big - sm) * a, h: sm + (bigH - sm) * a, y: 0 }); }
      const m = list[around], n = m.d > 0 ? list[around - 1] : list[around + 1];
      m.y = m.d * ((m.h + n.h) / 2 + gap);
      for (let i = around + 1; i < list.length; i++) list[i].y = list[i - 1].y + (list[i - 1].h + list[i].h) / 2 + gap;
      for (let i = around - 1; i >= 0; i--) list[i].y = list[i + 1].y - (list[i + 1].h + list[i].h) / 2 - gap;
      pool.forEach((slot, i) => {
        const it = list[i];
        if (!it) { slot.style.visibility = "hidden"; return; }
        if (slot._v !== it.v) { slot._v = it.v; slot.replaceChildren(...[...src[wrap(it.v)].cloneNode(true).childNodes]); }
        slot.style.visibility = "";
        slot.style.width = it.w.toFixed(1) + "px";
        slot.style.height = it.h.toFixed(1) + "px";
        slot.style.transform = `translate(-50%, ${(H / 2 + it.y - it.h / 2).toFixed(2)}px)`;
        slot.style.filter = `grayscale(${(1 - it.a).toFixed(3)})`;
        slot.style.opacity = (dim + (1 - dim) * it.a).toFixed(3);
        slot.classList.toggle("is-active", it.a > 0.5);
      });
      const now = wrap(Math.round(A));
      if (now !== idx) { idx = now; el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: idx } })); }
    };
    const frame = (t) => {
      const dt = Math.min(Math.max(1, t - prev) / 1000, 0.05);
      prev = t;
      A = reduce ? goal : damp(A, goal, dt);
      if (last === null || Math.abs(A - last) > 1e-4) { draw(); last = A; }
      raf = requestAnimationFrame(frame);
    };
    const go = (v) => { goal = v; smooth = Math.min(0.8, 0.34 + 0.08 * Math.abs(v - A)); };
    let sum = 0, timer = 0, from = 0;
    const onWheel = (e) => {
      e.preventDefault();
      if (!timer) from = Math.round(goal);
      sum += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? H : 1);
      smooth = 0.42;
      goal = from + sum / ((bigH + gap) * wheelK);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const l = goal - from, n = Math.abs(l) < 0.12 ? 0 : Math.max(1, Math.round(Math.abs(l)));
        goal = from + Math.sign(l) * n; smooth = 0.36 + 0.04 * Math.min(n, 6); sum = 0; timer = 0;
      }, 140);
    };
    let drag = null;
    const down = (e) => { drag = { y: e.clientY, p: goal, t: performance.now(), v: 0, ly: e.clientY, moved: false, id: e.pointerId }; };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.y;
      if (Math.abs(dy) > 6) drag.moved = true;
      if (!drag.moved) return;
      const t = performance.now(), dt = Math.max(1, t - drag.t);
      drag.v = drag.v * 0.7 + ((drag.ly - e.clientY) / dt) * 0.3; drag.ly = e.clientY; drag.t = t;
      smooth = 0.16; goal = drag.p - dy / (bigH + gap);
    };
    const up = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      let i = Math.round(goal + (d.v * 260) / (bigH + gap));
      if (i === Math.round(d.p) && Math.abs(goal - d.p) > 0.12) i += Math.sign(goal - d.p);
      goal = i; smooth = 0.38 + 0.04 * Math.min(6, Math.abs(i - A));
    };
    const key = (e) => {
      if (e.key === "ArrowDown") { go(Math.round(goal) + 1); e.preventDefault(); }
      if (e.key === "ArrowUp") { go(Math.round(goal) - 1); e.preventDefault(); }
    };
    const click = (e) => {
      const slot = e.target.closest?.(".fx-reel-slot");
      if (slot && slot._v != null && slot._v !== Math.round(goal)) { e.preventDefault(); go(slot._v); }
    };
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    const ro = new ResizeObserver(() => { measure(); draw(); });
    ro.observe(el);
    measure(); draw();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    el.addEventListener("click", click);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); ro.disconnect();
      el.removeEventListener("wheel", onWheel); el.removeEventListener("pointerdown", down); el.removeEventListener("keydown", key); el.removeEventListener("click", click);
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      pool.forEach((s) => s.remove());
      src.forEach((s) => (s.hidden = false));
    };
  });
})();
