// Mouse eyes — a fixed panel follows 40% of the remaining distance to the cursor every frame, and over links and buttons the front eye becomes an arrow via fx-hover.
// Hidden over areas given as hide (footer etc.) — Brand (.mouse-stalker)
(() => {
  kfFx.register("eye-stalker", (el, { options, hover }) => {
    if (!hover) return;
    const lerp = +(options.lerp ?? .4);
    const targets = options.targets || "a, button, [data-stalker]";
    const hide = options.hide || "";
    // skip — places in targets where the previous eye should not change (a button the cursor did not react to in the original)
    const skip = options.skip || "";
    const s = { x: innerWidth / 2, y: innerHeight / 2 }, m = { ...s };
    let raf = 0, seen = false, last = 0;
    // 40% per frame — if frames drop, it narrows by that much more so it lands in the same place as at 60fps
    const tick = (now) => {
      const dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      const k = 1 - Math.pow(1 - lerp, dt / 16.667);
      s.x += (m.x - s.x) * k;
      s.y += (m.y - s.y) * k;
      el.style.transform = `translate3d(${Math.round(s.x * 10) / 10}px, ${Math.round(s.y * 10) / 10}px, 0px)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      m.x = e.clientX; m.y = e.clientY;
      if (!seen) { seen = true; s.x = m.x; s.y = m.y; }
      const t = e.target instanceof Element ? e.target : null;
      el.classList.toggle("fx-on", !(hide && t && t.closest(hide)));
      el.classList.toggle("fx-hover", !!(t && t.closest(targets) && !(skip && t.closest(skip))));
    };
    const leave = () => el.classList.remove("fx-on", "fx-hover");
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      el.classList.remove("fx-on", "fx-hover");
      el.style.transform = "";
    };
  });
})();
