(() => {
  // Original Brand barcodeHoverEffect: as the cursor moves over the panel, one bar every 25ms, in the row holding the cursor (panel height ÷ 3) a bar 5~100px wide is centered on the cursor and erased 2 seconds later.
  // Bars that overlap on the same row are not raised. On touch devices a dot wandering inside the panel (each step ±.6rad wobble, 5% per step) draws every 120ms.
  // look: auto is the original barcodeAutoEffect — regardless of the pointer, every 150ms it lights a 10~150px wide bar on one of two rows and turns it off over .5s after 2 seconds.
  kfFx.register("barcode-cursor-stripes", (el, { options, reduce, hover }) => {
    const auto = /look:\s*auto/.test(el.getAttribute("data-fx-barcode-cursor-stripes") || "");
    const rows = +(options.rows || (auto ? 2 : 3));
    const min = +(options.min ?? (auto ? 10 : 5)), max = +(options.max ?? (auto ? 150 : 100));
    const life = +(options.life ?? 2000), throttle = +(options.throttle ?? 25), every = +(options.every || (auto ? 150 : 120));
    const wrap = document.createElement("div");
    wrap.className = "fx-barcode-wrap";
    wrap.setAttribute("aria-hidden", "true");
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(wrap);
    const live = [], timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const put = (x, y, fade) => {
      const r = el.getBoundingClientRect(), rh = r.height / rows, row = Math.floor(y / rh);
      if (row < 0 || row >= rows) return;
      const w = Math.random() * (max - min) + min, left = x - w / 2;
      if (live.some((s) => s.row === row && !(s.x + s.w < left || s.x > left + w))) return;
      const d = document.createElement("i");
      d.className = "fx-barcode-bar";
      d.style.cssText = `width:${w}px;height:${rh}px;transform:translate(${left}px,${row * rh}px)` + (fade ? ";opacity:0" : "");
      wrap.append(d);
      const s = { x: left, w, row };
      live.push(s);
      if (fade) requestAnimationFrame(() => (d.style.opacity = "1"));
      later(() => {
        const gone = () => { d.remove(); live.splice(live.indexOf(s), 1); };
        if (fade) { d.style.opacity = "0"; later(gone, 500); } else gone();
      }, life);
    };
    let iv = 0, last = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < throttle) return;
      last = now;
      const r = el.getBoundingClientRect();
      put(e.clientX - r.left, e.clientY - r.top, false);
    };
    const visible = () => { const r = el.getBoundingClientRect(); return r.width && r.top < innerHeight && r.bottom > 0 ? r : null; };
    if (reduce) { /* Do not float the bar */ }
    else if (auto) {
      iv = setInterval(() => { const r = visible(); if (r) put(Math.random() * r.width, (Math.floor(Math.random() * rows) + 0.5) * (r.height / rows), true); }, every);
    } else if (hover) el.addEventListener("mousemove", onMove);
    else {
      const p = { x: Math.random() * 100, y: Math.random() * 100, a: Math.random() * Math.PI * 2 };
      iv = setInterval(() => {
        const r = visible();
        if (!r) return;
        p.a += 1.2 * (Math.random() - 0.5); p.x += 5 * Math.cos(p.a); p.y += 5 * Math.sin(p.a);
        if (p.x < 5 || p.x > 95) p.a = Math.PI - p.a;
        if (p.y < 5 || p.y > 95) p.a = -p.a;
        put((p.x / 100) * r.width, (p.y / 100) * r.height, false);
      }, every);
    }
    return () => { clearInterval(iv); timers.forEach(clearTimeout); el.removeEventListener("mousemove", onMove); wrap.remove(); };
  });
})();
