// One row per wheel tick: the one-line list and the center image strip move together. When the center row changes it fires fx:pick, and pressing the center row or image fires fx:open.
(() => {
  kfFx.register("wheel-row-reel", (el, { options, reduce }) => {
    const list = el.querySelector('[data-fx-part="list"]');
    const rows = list ? [...list.querySelectorAll('[data-fx-part="row"]')] : [];
    if (!rows.length) return;
    const win = el.querySelector('[data-fx-part="window"]'), media = win ? [...win.querySelectorAll('[data-fx-part="media"]')] : [];
    const ROW = +(options.row || 23) || 23, EASE = reduce ? 1 : +(options.ease || 0.09) || 0.09, GAP = +(options.gap ?? -0.2), CENTER = +(options.center ?? 0.5), START = +(options.start ?? 3);
    el.style.setProperty("--fx-row", ROW + "px");
    let track = null;
    if (win && media.length) {
      track = document.createElement("div");
      track.className = "fx-wrr-track";
      win.append(track);
      media.forEach((m, i) => { m.style.top = `calc(${i} * (100% + ${GAP * 100}%))`; track.append(m); });
    }
    const MAX = (rows.length - 1) * ROW, clamp = (v) => Math.max(0, Math.min(MAX, v));
    let current = reduce ? 0 : Math.min(START, rows.length - 1) * ROW, target = 0, active = -1, raf = 0, prev = null, dirty = true;
    const fire = (name, i) => el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { index: i, row: rows[i] } }));
    const setActive = (i) => {
      if (i === active) return;
      active = i;
      rows.forEach((r, k) => r.classList.toggle("is-on", k === i));
      media.forEach((m, k) => m.classList.toggle("is-on", k === i));
      fire("fx:pick", i);
    };
    const step = (dir) => { target = clamp(Math.round(target / ROW) * ROW + dir * ROW); };
    // Wheel: filter out the inertia tail so one gesture moves just one line
    let lastT = -Infinity, lastStep = -Infinity, winT = -Infinity, winAbs = 0, prevAbs = 0;
    const onWheel = (e) => {
      const abs = Math.abs(e.deltaY), now = e.timeStamp, gap = now - lastT;
      lastT = now;
      if (abs < 4) return;
      if (now - winT >= 80) { prevAbs = winAbs; winAbs = abs; winT = now; } else if (abs > winAbs) winAbs = abs;
      if (!(gap > 120) && !(abs > prevAbs * 0.9)) return;
      if (now - lastStep < 200) return;
      lastStep = now;
      step(e.deltaY > 0 ? 1 : -1);
    };
    let y0 = null, yLast = null, t0 = 0;
    const onTS = (e) => { if (e.touches.length > 1) { y0 = null; return; } y0 = yLast = e.touches[0].clientY; t0 = clamp(Math.round(target / ROW) * ROW); };
    const onTM = (e) => { if (y0 === null) return; yLast = e.touches[0].clientY; const dy = y0 - yLast; target = Math.abs(dy) <= 6 ? clamp(t0) : clamp(t0 + Math.max(-ROW, Math.min(ROW, (dy - Math.sign(dy) * 6) * 0.5))); };
    const onTE = () => { if (y0 === null) return; const dy = y0 - (yLast ?? y0); target = clamp(t0 + (dy > 16 ? 1 : dy < -16 ? -1 : 0) * ROW); y0 = yLast = null; };
    const onKey = (e) => {
      if (e.key === "ArrowDown") { step(1); e.preventDefault(); }
      else if (e.key === "ArrowUp") { step(-1); e.preventDefault(); }
      else if (e.key === "Enter" && active >= 0) fire("fx:open", active);
    };
    const onClick = (e) => {
      const r = e.target.closest('[data-fx-part="row"]'), m = e.target.closest('[data-fx-part="media"]');
      if ((r && rows.indexOf(r) === active) || (m && media.indexOf(m) === active)) fire("fx:open", active);
    };
    const opacityFor = (d) => (d <= 1 ? 1 - 0.2 * d : d <= 2 ? 0.8 - 0.3 * (d - 1) : d <= 3 ? 0.5 - 0.3 * (d - 2) : Math.max(0.1, 0.2 - 0.1 * (d - 3)));
    const onResize = () => { dirty = true; };
    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.05) current = target;
      if (dirty || current !== prev) {
        dirty = false; prev = current;
        list.style.transform = `translate3d(0,${el.clientHeight * CENTER - ROW / 2 - current}px,0)`;
        rows.forEach((r, k) => { r.style.opacity = opacityFor(Math.abs(k * ROW - current) / ROW); });
        if (track) {
          const p = current / ROW, stride = win.clientHeight * (1 + GAP);
          track.style.transform = `translate3d(0,${-p * stride}px,0)`;
          media.forEach((m, k) => {
            const v = m.querySelector("video");
            if (!v) return;
            if (Math.abs(k - p) < 0.5 && !reduce) { if (v.paused) { const pr = v.play(); if (pr) pr.catch(() => {}); } } else if (!v.paused) v.pause();
          });
        }
        setActive(Math.round(clamp(current) / ROW));
      }
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTS, { passive: true });
    el.addEventListener("touchmove", onTM, { passive: true });
    el.addEventListener("touchend", onTE);
    el.addEventListener("click", onClick);
    addEventListener("keydown", onKey);
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel); el.removeEventListener("touchstart", onTS); el.removeEventListener("touchmove", onTM); el.removeEventListener("touchend", onTE); el.removeEventListener("click", onClick);
      removeEventListener("keydown", onKey); removeEventListener("resize", onResize);
      rows.forEach((r) => { r.classList.remove("is-on"); r.style.opacity = ""; });
      list.style.transform = "";
      if (track) { media.forEach((m) => { m.classList.remove("is-on"); m.style.top = ""; win.append(m); }); track.remove(); }
      el.style.removeProperty("--fx-row");
    };
  });
})();
