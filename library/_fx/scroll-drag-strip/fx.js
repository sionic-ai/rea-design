(() => {
  // The original hangs a new gsap.to(x) on every scroll (overlaps overwrite) so the band follows scroll .5s late. It follows again using the stopped spot (lastX) as the base, so
  // A band moved by hand doesn’t jump back to its start position on scroll.
  kfFx.register("scroll-drag-strip", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const box = scroller || null;
    const top = () => (box ? box.scrollTop : scrollY);
    const full = () => (box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - innerHeight);
    const dur = +(options.dur ?? 0.5);
    const rate = +(options.rate ?? 1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const clamp = options.clamp === "1";
    let maxX = 0, lastX = 0, dragging = false, drag = null;

    const target = () => {
      const p = full() > 0 ? Math.min(1, Math.max(0, top() / full())) : 0;
      const x = lastX - maxX * p * rate;
      return clamp ? Math.max(-maxX, Math.min(0, x)) : x;
    };
    const follow = () => { if (!dragging && !reduce) gsap.to(track, { x: target(), duration: dur, ease, overwrite: true }); };
    const measure = () => {
      maxX = Math.max(0, track.scrollWidth - el.clientWidth);
      drag?.applyBounds({ minX: -maxX, maxX: 0 });
      if (!dragging) gsap.set(track, { x: target() });
    };

    if (window.Draggable && options.drag !== "0") {
      const inertia = !!window.InertiaPlugin && options.inertia === "1";
      [drag] = Draggable.create(track, {
        type: "x",
        bounds: { minX: -maxX, maxX: 0 },
        inertia,
        onPress: () => { dragging = true; gsap.killTweensOf(track); },
        // If pressed without dragging, the original leaves the follow-along stopped — always release it on letting go
        onRelease() { if (!inertia || !this.isThrowing) { dragging = false; lastX = gsap.getProperty(track, "x") + maxX * Math.min(1, top() / Math.max(1, full())) * rate; } },
        onThrowComplete: () => { dragging = false; lastX = gsap.getProperty(track, "x") + maxX * Math.min(1, top() / Math.max(1, full())) * rate; },
      });
    }

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(track);
    measure();
    const on = box || window;
    on.addEventListener("scroll", follow, { passive: true });
    return () => {
      on.removeEventListener("scroll", follow);
      ro.disconnect();
      drag?.kill();
      gsap.killTweensOf(track);
      gsap.set(track, { clearProps: "transform" });
    };
  });
})();
