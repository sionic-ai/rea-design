// Endless card grid: clones the cards into a grid one row and one column larger than the screen, and each frame eases 5% toward the distance received from wheel (.6) and drag (1.2)
// Each tile wraps by the panel size to tile endlessly in all directions. Vertical speed per column is 1·1·.9 so they drift apart, and each column starts offset by .33 cell.
// Cards shrink down to .5 according to movement strength, then once movement stops (120ms) they return 2% at a time — a Studio Work page (Infinite Grid)
(() => {
  kfFx.register("infinite-card-grid", (wrap, { options, reduce, hover }) => {
    const list = wrap.querySelector('[data-fx-part="list"]') || wrap;
    const items = [...list.querySelectorAll('[data-fx-part="item"]')].map((n) => n.cloneNode(true));
    if (!items.length) return;
    const wheelK = +(options.wheel ?? 0.6), dragK = +(options.drag ?? 1.2), lerp = +(options.lerp ?? 0.05);
    const minScale = +(options["min-scale"] ?? 0.5), scaleLerp = +(options["scale-lerp"] ?? 0.02), xToY = +(options["x-to-y"] ?? 0.2);
    const speeds = (options.speeds || "1,1,0.9").split(",").map(Number), stagger = +(options.offset ?? 0.33);
    // intro: on first open the panel flies in from the lower right by panel height × intro and settles (Brand 3 · 2.5s expo.out). 0 means none
    const intro = +(options.intro ?? 0), lead = { x: 0, y: 0 };
    let introTween = null;
    const keep = list.innerHTML;
    let cards = [], els = [], size = {}, pos = {}, scl = { c: 1, t: 1 }, scaleTimer = 0, alive = true;
    const wrapV = (v, s) => ((v % s) + s) % s;
    const build = () => {
      // Hidden until everything is laid out, then appears in .5s on the next frame (original status loading → idle)
      wrap.dataset.state = "loading";
      void wrap.offsetWidth; // Compute the hidden state once so the next frame’s reveal gets a transition
      list.innerHTML = "";
      const probe = items[0].cloneNode(true);
      probe.style.cssText = "position:absolute;visibility:hidden";
      wrap.append(probe);
      const r = probe.getBoundingClientRect();
      probe.remove();
      size.w = r.width; size.h = r.height;
      if (!size.w || !size.h) return;
      const cols = Math.max(1, Math.ceil(wrap.clientWidth / size.w) + 2);
      const rows = Math.max(Math.ceil(wrap.clientHeight / size.h) + 2, Math.ceil(items.length / cols));
      size.W = cols * size.w; size.H = rows * size.h;
      list.style.width = `${size.W}px`; list.style.height = `${size.H}px`;
      const cc = Math.floor(cols / 2), cr = Math.floor(rows / 2);
      cards = []; els = [];
      const frag = document.createDocumentFragment();
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
        const it = items[(row * 17 + col * 31) % items.length].cloneNode(true);
        it.style.position = "absolute"; it.style.left = "0"; it.style.top = "0";
        if (cards.length >= items.length) it.setAttribute("aria-hidden", "true");
        cards.push({ bx: col * size.w, by: row * size.h, sy: (col - cc) * size.h * stagger, k: speeds[col % speeds.length], x: gsap.quickSetter(it, "x", "px"), y: gsap.quickSetter(it, "y", "px") });
        els.push(it.querySelector('[data-fx-part="card"]') || it);
        frag.append(it);
      }
      list.append(frag);
      pos.sx = wrap.clientWidth / 2 - cc * size.w - size.w / 2;
      pos.sy = wrap.clientHeight / 2 - cr * size.h - size.h / 2;
      pos.x = pos.tx = pos.sx; pos.y = pos.ty = pos.sy;
      if (intro && !reduce && !introTween) {
        lead.x = lead.y = intro * wrap.clientHeight;
        introTween = gsap.to(lead, { x: 0, y: 0, duration: +(options["intro-dur"] ?? 2.5), ease: kfFx.ease(options["intro-ease"] || "expo.out", "expo.out") });
      }
      draw();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (alive) wrap.dataset.state = "idle"; }));
    };
    const draw = () => {
      if (!alive || !cards.length) return;
      const k = reduce ? 1 : lerp;
      pos.x += (pos.tx - pos.x) * k; pos.y += (pos.ty - pos.y) * k;
      scl.c += (scl.t - scl.c) * (reduce ? 1 : scaleLerp);
      const ox = size.w, oy = size.h, dy = pos.y + lead.y - pos.sy;
      for (const c of cards) {
        c.x(wrapV(c.bx + pos.x + lead.x + ox, size.W) - ox);
        c.y(wrapV(c.by + pos.sy + c.sy + dy * c.k + oy, size.H) - oy);
      }
      if (!reduce) gsap.set(els, { scale: scl.c });
    };
    const push = (dx, dy, wheel) => {
      const k = wheel ? wheelK : dragK;
      const mx = gsap.utils.clamp(-80, 80, dx * k), my = gsap.utils.clamp(-80, 80, dy * k);
      const s = gsap.utils.clamp(0, 1, Math.max(Math.abs(mx), Math.abs(my)) / 80);
      scl.t = gsap.utils.interpolate(1, minScale, s);
      clearTimeout(scaleTimer);
      scaleTimer = setTimeout(() => (scl.t = 1), 120);
      const ax = wheel ? -mx : mx, ay = wheel ? -my : my;
      pos.tx += ax; pos.ty += ay + ax * xToY;
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    wrap.addEventListener("wheel", (e) => { e.preventDefault(); push(e.deltaX, e.deltaY, true); }, { signal: ac.signal, passive: false });
    let last = null;
    wrap.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" && !hover) return;
      last = { x: e.clientX, y: e.clientY };
      wrap.setPointerCapture?.(e.pointerId);
      wrap.dataset.state = "dragging";
    }, on);
    wrap.addEventListener("pointermove", (e) => {
      if (!last) return;
      push(e.clientX - last.x, e.clientY - last.y, false);
      last = { x: e.clientX, y: e.clientY };
    }, on);
    const up = () => { last = null; wrap.dataset.state = "idle"; };
    wrap.addEventListener("pointerup", up, on);
    wrap.addEventListener("pointercancel", up, on);
    let rt = 0;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 200); });
    ro.observe(wrap);
    build();
    gsap.ticker.add(draw);
    return () => { alive = false; introTween?.kill(); delete wrap.dataset.state; ac.abort(); ro.disconnect(); clearTimeout(rt); clearTimeout(scaleTimer); gsap.ticker.remove(draw); list.innerHTML = keep; list.style.width = list.style.height = ""; };
  });
})();
