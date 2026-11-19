// One wheel (direction only) · one horizontal swipe (after the axis differs by over 10px, threshold px) · next/prev buttons · dots advance one slide at a time, and the next input is ignored for lock ms.
// The flip count rises and falls endlessly and is exported as --fx-count — used to scroll the background by that amount (in the original, clicking the current dot also drops count by one).
(() => {
  kfFx.register("wheel-slide-pager", (el, { options }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    const total = slides.length;
    if (total < 2) return;
    const lock = +(options.lock ?? 1000), threshold = +(options.threshold ?? 40);
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const syncs = [...el.querySelectorAll('[data-fx-part="sync"]')];
    const st = { current: 0, prev: total - 1, next: 1 % total, count: 0, history: 0, busy: false, moved: false };
    const ac = new AbortController(), on = { signal: ac.signal };
    const timers = [];
    const render = () => {
      const { current, prev, next, history } = st;
      slides.forEach((s, i) => {
        const side = i === current ? 0 : i === next || (current < i && prev !== i) ? 1 : -1;
        s.style.setProperty("--fx-side", side);
        s.classList.toggle("is-move", st.moved && (i === current || i === history));
        s.classList.toggle("is-current", i === current);
      });
      [dots, ...syncs.map((g) => [...g.children])].forEach((list) => list.forEach((n, i) => n.classList.toggle("is-current", i === current)));
      el.style.setProperty("--fx-count", st.count);
      el.style.setProperty("--fx-total", total - 1);
      el.dataset.current = current;
    };
    const emit = (dir) => el.dispatchEvent(new CustomEvent("fx:slide", { bubbles: true, detail: { index: st.current, count: st.count, dir } }));
    const hold = () => { st.busy = true; timers.push(setTimeout(() => { st.busy = false; el.dispatchEvent(new CustomEvent("fx:slide-end", { bubbles: true })); }, lock)); };
    const step = (dir) => {
      if (st.busy) return;
      st.moved = true;
      st.count += dir;
      st.history = st.current;
      st.current = (st.current + dir + total) % total;
      st.prev = (st.current - 1 + total) % total;
      st.next = (st.current + 1) % total;
      render(); emit(dir); hold();
    };
    const goTo = (t) => {
      st.moved = true;
      const dir = st.current >= t ? -1 : 1;
      st.count += dir;
      st.history = st.current;
      st.current = t;
      st.prev = (t - 1 + total) % total;
      st.next = (t + 1) % total;
      render(); emit(dir);
    };
    el.addEventListener("wheel", (e) => { e.preventDefault(); if (!st.busy && e.deltaY) step(e.deltaY > 0 ? 1 : -1); }, { passive: false, signal: ac.signal });
    let sx = 0, sy = 0, touching = false, axis = null, swiped = false;
    el.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; touching = true; axis = null; swiped = false; }, { passive: true, signal: ac.signal });
    el.addEventListener("touchmove", (e) => {
      if (!touching || swiped || st.busy) return;
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (!axis) axis = Math.abs(dx) > Math.abs(dy) + 10 ? "x" : Math.abs(dy) > Math.abs(dx) + 10 ? "y" : null;
      if (axis === "x" && Math.abs(dx) >= threshold) { swiped = true; step(dx < 0 ? 1 : -1); }
    }, { passive: true, signal: ac.signal });
    el.addEventListener("touchend", () => { touching = false; axis = null; swiped = false; }, on);
    el.addEventListener("click", (e) => {
      const t = e.target instanceof Element ? e.target.closest('[data-fx-part="next"], [data-fx-part="prev"], [data-fx-part="dot"]') : null;
      if (!t || !el.contains(t)) return;
      if (t.dataset.fxPart === "dot") goTo(dots.indexOf(t));
      else step(t.dataset.fxPart === "next" ? 1 : -1);
    }, on);
    render();
    return () => {
      ac.abort(); timers.forEach(clearTimeout);
      slides.forEach((s) => { s.style.removeProperty("--fx-side"); s.classList.remove("is-move", "is-current"); });
      [dots, ...syncs.map((g) => [...g.children])].forEach((list) => list.forEach((n) => n.classList.remove("is-current")));
      el.style.removeProperty("--fx-count"); el.style.removeProperty("--fx-total"); delete el.dataset.current;
    };
  });
})();
