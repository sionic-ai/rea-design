// Endless winding column row: columns of equal height stand side by side, and each frame follows the distance received from wheel and drag by 7.5%
// Columns that left the screen wrap around to the opposite side by the full row width. Clicking a column brings only that column to the center and spreads it wide (.75s expo.out)
// The right column is pushed by the widened width. Collapse with Esc · outside click · close (.75s 0.5,0,0,1), with ← · → while open, collapse and then open the neighboring column — brand-brand
(() => {
  kfFx.register("wrap-column-reel", (host, { options, reduce }) => {
    const track = host.querySelector('[data-fx-part="track"]') || host;
    const items = [...track.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const probe = host.querySelector('[data-fx-part="probe"]');
    const lerp = reduce ? 1 : +(options.lerp ?? 0.075);
    const wheelK = +(options.wheel ?? 1), dragK = +(options.drag ?? 1), momentum = +(options.momentum ?? 500);
    const dur = reduce ? 0 : +(options.dur ?? 0.75), out = reduce ? 0 : +(options.out ?? dur);
    const openEase = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const closeEase = kfFx.ease(options["out-ease"] || "0.5,0,0,1", "power3.inOut");
    const ratio = +(options.ratio ?? 0.7), phoneRatio = +(options["phone-ratio"] ?? 0.9), phone = +(options.phone ?? 700);

    let vw = 0, widths = [], base = [], wraps = [], total = 0;
    let x = 0, target = 0, last = 0, moving = false, locked = false;
    let open = -1, closing = -1, pending = -1, grow = 0, delta = 0, tween = null;
    let drag = null, dragDist = 0;

    const openWidth = () => {
      const w = probe?.offsetWidth;
      if (w > 0) return w;
      return Math.round(vw * (vw < phone ? phoneRatio : ratio));
    };
    const measure = () => {
      vw = host.getBoundingClientRect().width;
      items.forEach((el) => { gsap.set(el, { clearProps: "width" }); el.style.position = "absolute"; el.style.top = "0"; el.style.left = "0"; });
      widths = items.map((el) => el.getBoundingClientRect().width);
      let acc = 0;
      base = widths.map((w) => { const b = acc; acc += w; return b; });
      total = acc;
      wraps = items.map(() => 0);
      // Pillars far from the screen are not moved every frame, so their initial position is set once
      items.forEach((el, i) => gsap.set(el, { x: x + base[i], force3D: true }));
    };
    const centerOf = (i, w) => (vw - w) / 2 - base[i] - wraps[i];

    const tick = (now) => {
      const dt = last ? Math.max(1, now * 1000 - last) : 16.667;
      last = now * 1000;
      // The original moves by lerp per 60fps frame — corrected by frame length so it follows at the same speed on any refresh rate
      const k = lerp >= 1 ? 1 : 1 - Math.pow(1 - lerp, dt / 16.667);
      x += (target - x) * k;
      const now_moving = !locked && Math.abs(x - target) > 0.5;
      if (now_moving !== moving) { moving = now_moving; host.classList.toggle("is-fx-moving", moving); }
      const held = open !== -1 ? open : closing;
      const edge = held !== -1 ? x + base[held] + wraps[held] + widths[held] / 2 : -Infinity;
      const widest = Math.max(...widths), slack = Math.max(0, total - vw - widest);
      for (let i = 0; i < items.length; i++) {
        let p = x + base[i] + wraps[i];
        const w = widths[i];
        if (p > vw + slack) { wraps[i] -= total; p -= total; }
        else if (p < -(w + slack)) { wraps[i] += total; p += total; }
        const shift = held !== -1 && i !== held && p >= edge ? grow * delta : 0;
        const at = p + shift;
        if (at > -w * 2 && at < vw + w * 2) gsap.set(items[i], { x: at, force3D: true });
        items[i].classList.toggle("is-fx-inview", at < vw && at + w > 0);
      }
    };

    const emit = (type, index) => host.dispatchEvent(new CustomEvent(type, { detail: { index, item: items[index] } }));
    const expand = (i) => {
      if (dragDist > 5) return;
      if (closing !== -1) { pending = i; return; }
      if (open !== -1) { collapse(); return; }
      open = i;
      delta = openWidth() - widths[i];
      locked = true;
      gsap.killTweensOf(items[i], "width");
      target = centerOf(i, widths[i] + delta);
      const st = { p: 0 };
      tween?.kill();
      tween = gsap.to(st, { p: 1, duration: dur, ease: openEase,
        onUpdate: () => { grow = st.p; gsap.set(items[i], { width: widths[i] + delta * st.p }); },
        onComplete: () => { grow = 1; } });
      items[i].classList.add("is-fx-open");
      host.classList.add("is-fx-has-open");
      emit("fx:open", i);
    };
    const collapse = () => {
      if (open === -1) return;
      tween?.kill();
      const i = open, st = { p: grow };
      locked = false; open = -1; closing = i;
      items[i].classList.remove("is-fx-open");
      host.classList.remove("is-fx-has-open");
      tween = gsap.to(st, { p: 0, duration: out, ease: closeEase,
        onUpdate: () => {
          grow = st.p;
          const w = widths[i] + delta * st.p;
          gsap.set(items[i], { width: w });
          target = x = centerOf(i, w);
        },
        onComplete: () => {
          gsap.set(items[i], { clearProps: "width" });
          grow = 0; closing = -1;
          if (pending !== -1) { const n = pending; pending = -1; dragDist = 0; expand(n); }
        } });
      emit("fx:close", i);
    };

    const ac = new AbortController(), on = { signal: ac.signal };
    host.style.touchAction = "none";
    host.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (locked) return;
      target -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * wheelK;
    }, { signal: ac.signal, passive: false });
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = e.timeStamp - drag.t || 1;
      // On phone, make the row flow even with a vertical swipe — if vertical is larger, use the vertical distance as horizontal
      const d = vw < phone && e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) ? dy : dx;
      target += d * dragK;
      drag.v = d / dt; drag.x = e.clientX; drag.y = e.clientY; drag.t = e.timeStamp;
      dragDist += Math.abs(d);
    };
    const up = () => {
      if (!drag) return;
      target += drag.v * momentum;
      drag = null;
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
    };
    host.addEventListener("pointerdown", (e) => {
      dragDist = 0;
      if (open !== -1) { if (!items[open].contains(e.target)) collapse(); return; }
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, v: 0 };
      addEventListener("pointermove", move, on);
      addEventListener("pointerup", up, on);
      addEventListener("pointercancel", up, on);
    }, on);
    items.forEach((el, i) => el.addEventListener("click", (e) => {
      if (e.target.closest('[data-fx-part="close"]')) { e.stopPropagation(); pending = -1; collapse(); return; }
      if (open !== i) expand(i);
    }, on));
    host.addEventListener("fx:close", (e) => { if (e.target === host && !e.detail) { pending = -1; collapse(); } }, on);
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") { pending = -1; collapse(); return; }
      if (open === -1) return;
      const n = items.length;
      if (e.key === "ArrowRight") { e.preventDefault(); pending = (open + 1) % n; collapse(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); pending = (open - 1 + n) % n; collapse(); }
    }, on);

    const resize = () => {
      const i = open;
      tween?.kill();
      if (closing !== -1) { gsap.set(items[closing], { clearProps: "width" }); closing = -1; grow = 0; }
      measure();
      if (i !== -1) {
        delta = openWidth() - widths[i];
        gsap.set(items[i], { width: widths[i] + delta });
        grow = 1;
        x = target = centerOf(i, widths[i] + delta);
      }
    };
    let rt = 0, first = true;
    const ro = new ResizeObserver(() => { if (first) { first = false; return; } clearTimeout(rt); rt = setTimeout(resize, 200); });
    measure();
    tick(0);
    ro.observe(host);
    gsap.ticker.add(tick);
    return () => {
      ac.abort(); up(); ro.disconnect(); clearTimeout(rt); tween?.kill();
      gsap.ticker.remove(tick);
      host.style.touchAction = "";
      host.classList.remove("is-fx-moving", "is-fx-has-open");
      items.forEach((el) => {
        el.classList.remove("is-fx-open", "is-fx-inview");
        gsap.set(el, { clearProps: "x,width,transform" });
        el.style.position = el.style.top = el.style.left = "";
      });
    };
  });
})();
