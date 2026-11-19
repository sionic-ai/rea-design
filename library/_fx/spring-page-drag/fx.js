(() => {
  // Original (site-builder code component Carousel): a photo box that advances one at a time. Dragging horizontally follows the hand (only .08 beyond either end), and on release, if dragged more than 18% of the width or
  // Flicking over 300px/s goes to the next or previous section, otherwise returns in place — the path is a spring (stiffness 480 · damping 46 · mass .9) and inherits the release velocity.
  // On wide screens, hovering shows side arrows in .2s, and on narrow screens (below 810px) a bottom dot pill replaces the arrows
  kfFx.register("spring-page-drag", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const slides = [...track.children];
    const n = slides.length;
    if (n < 2) return;
    const k = +(options.k || 480), c = +(options.c || 46), m = +(options.m || 0.9);
    const gap = +(options.gap ?? 0), elastic = +(options.elastic ?? 0.08), cut = +(options.cut ?? 0.18), fling = +(options.fling ?? 300);
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]'), dots = el.querySelector('[data-fx-part="dots"]');
    let w = el.clientWidth, i = 0, x = 0, v = 0, goal = 0, raf = 0, last = 0;
    const pos = (j) => -j * (w + gap);
    const paint = () => { track.style.transform = `translate3d(${x}px,0,0)`; };
    const mark = () => {
      prev?.toggleAttribute("disabled", i === 0);
      next?.toggleAttribute("disabled", i === n - 1);
      dots?.querySelectorAll("i").forEach((d, j) => d.classList.toggle("is-fx-on", j === i));
    };
    const run = (now) => {
      const dt = Math.min(0.064, Math.max(0.001, (now - (last || now)) / 1000 || 0.016));
      last = now;
      for (let t = 0; t < dt; t += 0.001) { const a = (-k * (x - goal) - c * v) / m; v += a * 0.001; x += v * 0.001; }
      paint();
      if (Math.abs(v) < 2 && Math.abs(x - goal) < 0.3) { x = goal; v = 0; paint(); raf = 0; return; }
      raf = requestAnimationFrame(run);
    };
    const go = (j, vel = v) => {
      i = Math.max(0, Math.min(n - 1, j)); goal = pos(i); v = vel; mark();
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: i } }));
      if (reduce) { x = goal; v = 0; paint(); return; }
      if (!raf) { last = 0; raf = requestAnimationFrame(run); }
    };
    track.style.display = "flex";
    track.style.gap = `${gap}px`;
    const size = () => { w = el.clientWidth; slides.forEach((s) => { s.style.flex = `0 0 ${w}px`; s.style.width = `${w}px`; }); x = goal = pos(i); paint(); };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    if (dots && !dots.childElementCount) for (let j = 0; j < n; j++) dots.append(document.createElement("i"));
    mark();
    // Dragging — vertical pushes are passed to the page (touch-action: pan-y)
    let down = null, moved = false, hist = [];
    const onDown = (e) => {
      if (e.button > 0 || e.target.closest('[data-fx-part="prev"],[data-fx-part="next"]')) return;
      down = { x: e.clientX, y: e.clientY, from: x, id: e.pointerId }; moved = false; hist = [{ t: performance.now(), x }];
      cancelAnimationFrame(raf); raf = 0; v = 0;
    };
    const onMove = (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      if (!moved) { if (Math.abs(dx) < 3) return; if (Math.abs(e.clientY - down.y) > Math.abs(dx)) { down = null; return; } moved = true; el.setPointerCapture?.(e.pointerId); el.classList.add("is-fx-drag"); }
      let nx = down.from + dx;
      const min = pos(n - 1), max = 0;
      if (nx > max) nx = max + (nx - max) * elastic; else if (nx < min) nx = min + (nx - min) * elastic;
      x = nx; paint();
      const now = performance.now(); hist.push({ t: now, x }); hist = hist.filter((h) => now - h.t < 100);
    };
    const onUp = (e) => {
      if (!down || (e.pointerId !== undefined && e.pointerId !== down.id)) return;
      const was = moved; el.classList.remove("is-fx-drag");
      const off = x - down.from; down = null;
      if (!was) return;
      const h0 = hist[0], h1 = hist[hist.length - 1];
      const vel = h1 && h0 && h1.t > h0.t ? ((h1.x - h0.x) / (h1.t - h0.t)) * 1000 : 0;
      const lim = w * cut;
      if (off < -lim || vel < -fling) go(i + 1, vel); else if (off > lim || vel > fling) go(i - 1, vel); else go(i, vel);
    };
    // After dragging, releasing the hand shouldn’t click the link under the cursor
    const onClick = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    const onPrev = (e) => { e.preventDefault(); e.stopPropagation(); go(i - 1, 0); };
    const onNext = (e) => { e.preventDefault(); e.stopPropagation(); go(i + 1, 0); };
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    el.addEventListener("dragstart", (e) => e.preventDefault());
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true); prev?.removeEventListener("click", onPrev); next?.removeEventListener("click", onNext);
      track.style.transform = ""; slides.forEach((s) => { s.style.flex = ""; s.style.width = ""; });
    };
  });
})();
