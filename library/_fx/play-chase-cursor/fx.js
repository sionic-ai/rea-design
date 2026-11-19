(() => {
  kfFx.register("play-chase-cursor", (el, { options, reduce, hover }) => {
    const disc = el.querySelector('[data-fx-part="disc"]');
    if (!disc) return;
    const play = () => el.dispatchEvent(new CustomEvent("fx:play", { bubbles: true }));
    if (!hover) {
      disc.addEventListener("click", play);
      return () => disc.removeEventListener("click", play);
    }
    const lerp = +(options.lerp ?? 0.08), dx = +(options.dx ?? 20), dy = +(options.dy ?? -20);
    const inDur = +(options.in ?? 0.4), outDur = +(options.out ?? 0.2);
    const cur = { x: 0, y: 0 }, to = { x: 0, y: 0 };
    let last = 0, placed = false;
    const move = (e) => {
      to.x = e.clientX; to.y = e.clientY;
      if (!placed) { cur.x = to.x; cur.y = to.y; placed = true; }
    };
    // Clamp the time between frames to 1ms so it never stops even if it comes out 0 or less, then convert to one 60fps frame and multiply
    const tick = (time) => {
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16.667;
      last = now;
      const k = reduce ? 1 : 1 - Math.pow(1 - lerp, dt / 16.667);
      cur.x += (to.x - cur.x) * k;
      cur.y += (to.y - cur.y) * k;
      disc.style.transform = `translate(${cur.x + dx - disc.offsetWidth / 2}px, ${cur.y + dy - disc.offsetHeight / 2}px)`;
    };
    const enter = () => gsap.to(disc, { opacity: 1, duration: reduce ? 0 : inDur, ease: "power1.out", overwrite: "auto" });
    const leave = () => gsap.to(disc, { opacity: 0, duration: reduce ? 0 : outDur, ease: "power1.out", overwrite: "auto" });
    addEventListener("pointermove", move);
    gsap.ticker.add(tick);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", play);
    return () => {
      removeEventListener("pointermove", move);
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", play);
      gsap.killTweensOf(disc);
      gsap.set(disc, { clearProps: "opacity,transform" });
    };
  });
})();
