(() => {
  kfFx.register("rtl-scroll-track", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const step = +(options.step ?? 400), page = +(options.page ?? 3);
    const dur = reduce ? 0 : +(options.dur ?? 0.4), fling = +(options.fling ?? 15), settle = reduce ? 0 : +(options.settle ?? 0.3);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    // Original RtlScroller ends finger inertia with the velocity default curve swing (0.5 − cos(πp)/2) — the same formula as GSAP sine.inOut
    const swing = "sine.inOut";
    let pos = 0, max = 0, tw = null;
    const measure = () => { max = Math.max(0, track.scrollWidth - el.clientWidth); pos = Math.min(pos, max); gsap.set(track, { x: pos }); };
    const clamp = (v) => Math.min(max, Math.max(0, v));
    const emit = () => el.dispatchEvent(new CustomEvent("fx:move", { detail: { pos, max } }));
    const to = (v, d = 0, e = "none") => {
      pos = clamp(v);
      tw?.kill();
      if (!d) { gsap.set(track, { x: pos }); emit(); return; }
      tw = gsap.to(track, { x: pos, duration: d, ease: e, onUpdate: emit });
    };
    el.fxTrackTo = to;

    // Wheel — vertical deltaY is mapped straight to horizontal position (the original does it instantly in 1ms). The right end is the start, further left is later
    const onWheel = (e) => { e.preventDefault(); const d = e.deltaY || e.deltaX; if (d) to(pos + d); };
    const keyMap = { ArrowRight: -1, ArrowUp: -1, ArrowLeft: 1, ArrowDown: 1, PageUp: -page, PageDown: page };
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      const k = keyMap[e.key];
      if (!k) return;
      e.preventDefault();
      to(pos + k * step, dur, ease);
    };
    // Anchor — put the right edge of that section at the right edge of the screen
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (!target || !track.contains(target)) return;
      e.preventDefault();
      const r = target.getBoundingClientRect(), box = el.getBoundingClientRect();
      to(pos - (r.left - box.left) + (box.width - r.width), dur, ease);
    };
    // Finger — follows, and on release goes the last movement × 15 further and stops in .3s
    let sx = 0, sp = 0, lx = 0, accel = 0, dragging = false;
    const down = (e) => { if (e.pointerType === "mouse") return; dragging = true; sx = lx = e.clientX; sp = pos; accel = 0; tw?.kill(); };
    const move = (e) => { if (!dragging) return; to(sp - (sx - e.clientX)); accel = fling * (e.clientX - lx); lx = e.clientX; };
    const up = () => { if (!dragging) return; dragging = false; to(pos + accel, settle, swing); accel = 0; };

    el.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    const ro = new ResizeObserver(measure);
    ro.observe(el); ro.observe(track);
    measure();

    return () => {
      tw?.kill(); ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      delete el.fxTrackTo;
      gsap.set(track, { clearProps: "transform" });
    };
  });
})();
