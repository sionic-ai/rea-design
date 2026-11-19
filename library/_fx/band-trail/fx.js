(() => {
  kfFx.register("band-trail", (el, { options, reduce, hover }) => {
    const photos = [...el.querySelectorAll(':scope > [data-fx-part="photo"]')];
    if (reduce || !photos.length) return;
    // If no size is given, pick by window width (over 1000px 275 · over 600 200 · below that 150).
    const fixed = options.size != null ? +options.size : 0, hold = +(options.hold ?? 1) * 1000;
    const layer = document.createElement("div");
    layer.className = "fx-band-trail";
    layer.setAttribute("aria-hidden", "true");
    el.append(layer);
    const S = { mode: null, size: 0, offset: 0, gap: 150, max: 24, rect: null, dirty: true, seen: false, raf: 0, lastT: 0, next: 0,
      client: { x: 0, y: 0 }, mouse: { x: 0, y: 0 }, lag: { x: 0, y: 0 }, last: { x: 0, y: 0 }, has: false, moved: 0, phase: 0 };
    const pool = [], live = [], fresh = [];
    const free = (it) => { it.anim?.cancel(); it.anim = null; it.state = "free"; it.el.className = "fx-band-trail__img is-free"; };
    // Band i opens later by its distance from the center (|i − 4.5|), and closing starts from the outer bands
    const make = () => {
      const img = document.createElement("div");
      img.className = "fx-band-trail__img is-free";
      for (let i = 0; i < 10; i++) {
        const band = document.createElement("div");
        band.className = "fx-band-trail__band";
        band.style.cssText = `--i:${i};--dm:${Math.abs(i - 4.5)};--de:${4.5 - Math.abs(i - 4.5)}`;
        img.append(band);
      }
      layer.append(img);
      const it = { el: img, anim: null, state: "free", outAt: 0, freeAt: 0 };
      pool.push(it);
      return it;
    };
    const spawn = (now) => {
      let it = pool.find((p) => p.state === "free");
      if (!it) {
        if (pool.length < S.max) it = make();
        else { it = live.shift(); const k = fresh.indexOf(it); if (k > -1) fresh.splice(k, 1); }
      }
      const src = photos[S.next++ % photos.length];
      it.el.querySelectorAll(".fx-band-trail__band").forEach((band) => { const c = src.cloneNode(true); c.removeAttribute("data-fx-part"); band.replaceChildren(c); });
      it.anim?.cancel();
      it.el.className = "fx-band-trail__img is-reset";
      it.anim = it.el.animate([
        { transform: `translate3d(${S.lag.x - S.offset}px, ${S.lag.y - S.offset}px, 0)` },
        { transform: `translate3d(${S.mouse.x - S.offset}px, ${S.mouse.y - S.offset}px, 0)` },
      ], { duration: 1000, easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fill: "forwards" });
      it.state = "pending";
      it.outAt = now + hold;
      live.push(it);
      fresh.push(it);
    };
    const follow = (now, dt) => {
      if (!S.has) { S.lag.x = S.last.x = S.mouse.x; S.lag.y = S.last.y = S.mouse.y; S.has = true; }
      const k = 1 - Math.pow(0.9, dt / 16.667);
      S.lag.x += (S.mouse.x - S.lag.x) * k;
      S.lag.y += (S.mouse.y - S.lag.y) * k;
      if (Math.hypot(S.mouse.x - S.last.x, S.mouse.y - S.last.y) > S.gap) { spawn(now); S.last.x = S.mouse.x; S.last.y = S.mouse.y; }
    };
    const inside = () => S.client.x >= S.rect.left && S.client.x <= S.rect.right && S.client.y >= S.rect.top && S.client.y <= S.rect.bottom;
    const frame = (now) => {
      S.raf = 0;
      const dt = S.lastT ? Math.min(Math.max(1, now - S.lastT), 50) : 16.667;
      S.lastT = now;
      fresh.forEach((it) => { it.el.classList.remove("is-reset"); it.el.classList.add("is-in"); it.state = "in"; });
      fresh.length = 0;
      if (S.mode === "auto") {
        S.phase += (dt / 1000) * 0.85;
        const x0 = S.offset, x1 = Math.max(x0, S.rect.width - S.size + S.offset), y0 = S.offset, y1 = Math.max(y0, S.rect.height - S.size + S.offset);
        const ox = (x1 - x0) / 2, oy = (y1 - y0) / 2;
        S.mouse.x = x0 + ox + ox * Math.sin(S.phase + 0.6);
        S.mouse.y = y0 + oy + oy * Math.sin(1.37 * S.phase);
        follow(now, dt);
      } else if (S.mode === "mouse" && S.moved) {
        if (!S.rect || S.dirty) { S.rect = el.getBoundingClientRect(); S.dirty = false; }
        S.mouse.x = S.client.x - S.rect.left;
        S.mouse.y = S.client.y - S.rect.top;
        if (inside()) follow(now, dt); else S.has = false;
      }
      for (let i = 0; i < live.length; i++) {
        const it = live[i];
        if (it.state === "in" && now >= it.outAt) { it.state = "out"; it.freeAt = now + 1112; it.el.classList.remove("is-in"); it.el.classList.add("is-out"); }
        if (it.state === "out" && now >= it.freeAt) { free(it); live.splice(i, 1); i--; }
      }
      const idle = S.mode === "mouse" && !live.length && now - S.moved > 200;
      if (S.seen && !document.hidden && S.mode !== "off" && !idle) S.raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!S.raf && S.seen && !document.hidden && S.mode && S.mode !== "off") { S.lastT = 0; S.raf = requestAnimationFrame(frame); } };
    const fit = () => {
      S.rect = el.getBoundingClientRect(); S.dirty = false;
      const w = innerWidth, size = fixed || (w > 1000 ? 275 : w > 600 ? 200 : 150);
      const mode = w > 1000 && hover ? "mouse" : options.touch === "off" ? "off" : "auto";
      let changed = false;
      if (size !== S.size) { S.size = size; S.offset = 0.3181818181818182 * size; S.gap = options.gap != null ? +options.gap : (size / 275) * 150; layer.style.setProperty("--fx-size", `${size}px`); changed = true; }
      if (mode !== S.mode) { S.mode = mode; S.max = +options.max || (mode === "auto" ? 12 : 24); S.moved = 0; changed = true; }
      if (changed) { cancelAnimationFrame(S.raf); S.raf = 0; fresh.length = 0; live.forEach(free); live.length = 0; S.has = false; }
      kick();
    };
    // Watches the cursor across the whole window and draws only while inside the board box, so the trail continues even over the header line and buttons floating above the board.
    const move = (e) => {
      if (S.mode !== "mouse") return;
      S.rect = el.getBoundingClientRect(); S.dirty = false;
      S.client.x = e.clientX; S.client.y = e.clientY;
      if (!inside()) { S.has = false; return; }
      S.moved = performance.now();
      kick();
    };
    const onScroll = () => (S.dirty = true);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => { S.seen = e.isIntersecting; if (S.seen) { S.dirty = true; kick(); } else { cancelAnimationFrame(S.raf); S.raf = 0; } });
    io.observe(el);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("scroll", onScroll);
      io.disconnect(); ro.disconnect();
      cancelAnimationFrame(S.raf);
      pool.forEach((it) => it.anim?.cancel());
      layer.remove();
    };
  });
})();
