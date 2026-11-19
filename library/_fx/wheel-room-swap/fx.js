(() => {
  kfFx.register("wheel-room-swap", (el, { options, reduce, hover }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const thumbs = [...el.querySelectorAll('[data-fx-part="thumb"]')];
    const strip = el.querySelector('[data-fx-part="strip"]');
    const stage = el.querySelector('[data-fx-part="stage"]');
    const label = el.querySelector('[data-fx-part="label"]');
    const per = +options.per || 280;
    const n = slides.length;
    let at = Math.max(0, Math.min(n - 1, +(options.start ?? 0)));
    if (options.start === "random") at = Math.floor(Math.random() * n);

    // Tile the thumbnails in several sets of the item count (so they look endless) and push relative to the middle set’s cell
    const mid = Math.floor(Math.max(1, Math.round(thumbs.length / n)) / 2);
    const tone = (i) => getComputedStyle(slides[i]).getPropertyValue("--fx-tone").trim();
    const restart = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
    const place = () => {
      if (!strip || !thumbs.length) return;
      const t = thumbs[at + mid * n] || thumbs[at], box = strip.parentElement.getBoundingClientRect();
      const y = box.height / 2 - (t.offsetTop + t.offsetHeight / 2);
      strip.style.transform = `translateY(${y}px)`;
    };
    // The new panel opens from the center with clip (.7s · .2s later), while the previous panel stays behind and grows 1.2x (.9s). The panel color becomes the room background (.45s)
    const go = (i, first = false) => {
      i = ((i % n) + n) % n;
      if (i === at && !first) return;
      const prev = at;
      at = i;
      slides.forEach((s, k) => { s.classList.remove("is-top", "is-back"); s.hidden = !(k === at || (!first && k === prev)); });
      // intro: open — the first panel also starts by opening from the center (the original Brand first section)
      if (reduce || (first && options.intro !== "open")) slides[at].classList.add("is-still");
      else if (first) restart(slides[at], "is-top");
      else { slides[prev].classList.remove("is-still"); restart(slides[prev], "is-back"); restart(slides[at], "is-top"); slides[at].classList.remove("is-still"); }
      thumbs.forEach((t, k) => t.classList.toggle("is-on", k % n === at));
      const c = tone(at);
      if (c) el.style.backgroundColor = c;
      place();
      arm();
      el.dispatchEvent(new CustomEvent("fx:change", { bubbles: true, detail: { index: at, count: n, first } }));
    };
    // auto: advances to the next panel by itself every N seconds (original brand 5s) — restarts counting when advanced by hand, and pauses while zoomed in
    const auto = +(options.auto ?? 0) * 1000;
    let timer = 0;
    function arm() {
      clearTimeout(timer);
      if (auto > 0 && !reduce && !el.classList.contains("is-zoom")) timer = setTimeout(() => go(at + 1), auto);
    }

    // Wheel: one panel per notch (deltaY 280) — even a small roll goes to the next panel in that direction (original ceil · floor snapping), and a long roll goes several panels
    let acc = 0, idle = 0;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const was = acc;
      acc += e.deltaY / per;
      const dir = Math.sign(acc - was);
      const step = dir > 0 ? Math.ceil(acc - 0.001) : Math.floor(acc + 0.001);
      clearTimeout(idle);
      idle = setTimeout(() => (acc = 0), 220);
      if (step !== 0) { acc -= step; go(at + step); }
    };
    const onKey = (e) => {
      if (/^(ArrowDown|ArrowRight|PageDown)$/.test(e.key)) { e.preventDefault(); go(at + 1); }
      else if (/^(ArrowUp|ArrowLeft|PageUp)$/.test(e.key)) { e.preventDefault(); go(at - 1); }
    };
    let y0 = null;
    const onDown = (e) => { y0 = e.touches[0].clientY; };
    const onUp = (e) => { if (y0 === null) return; const d = y0 - e.changedTouches[0].clientY; y0 = null; if (Math.abs(d) > 40) go(at + Math.sign(d)); };
    const onThumb = (e) => { const t = e.target.closest('[data-fx-part="thumb"]'); if (t) go(thumbs.indexOf(t) % n); };

    // Zoom: clicking the panel toggles is-zoom. A cursor label follows the cursor over the panel (appears in .25s)
    const onZoom = () => { el.classList.toggle("is-zoom"); arm(); if (el.classList.contains("is-zoom")) clearTimeout(timer); if (label) label.textContent = el.classList.contains("is-zoom") ? label.dataset.out || "Zoom Out" : label.dataset.in || "Zoom"; };
    const onMove = (e) => {
      if (!label) return;
      const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const inside = e.clientX >= s.left && e.clientX <= s.right && e.clientY >= s.top && e.clientY <= s.bottom;
      label.classList.toggle("is-on", inside || el.classList.contains("is-zoom"));
      label.style.translate = `${e.clientX - r.left}px ${e.clientY - r.top}px`;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchend", onUp, { passive: true });
    strip?.addEventListener("click", onThumb);
    stage?.addEventListener("click", onZoom);
    if (hover) el.addEventListener("pointermove", onMove);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    go(at, true);
    return () => {
      clearTimeout(idle);
      clearTimeout(timer);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchend", onUp);
      strip?.removeEventListener("click", onThumb);
      stage?.removeEventListener("click", onZoom);
      el.removeEventListener("pointermove", onMove);
      slides.forEach((s) => { s.hidden = false; s.classList.remove("is-top", "is-back", "is-still"); });
      el.classList.remove("is-zoom");
      el.style.removeProperty("background-color");
    };
  });
})();
