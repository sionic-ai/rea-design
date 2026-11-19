// A fixed badge ends up positioned relative to an ancestor if that ancestor has a transform (entrance motion) — move it to body when it sticks and put it back in place when it detaches.
// Follow runs like the original, by the follow share of the remaining distance each frame, same speed regardless of frame length (deltaRatio)
(() => {
  kfFx.register("cursor-swap-badge", (el, { options, reduce, hover }) => {
    const badge = el.querySelector('[data-fx-part="badge"]');
    if (!badge || !hover) return;
    const home = badge.parentNode, next = badge.nextSibling;
    badge.classList.add("fx-cursor-swap");
    document.body.append(badge);
    const k = Math.min(1, Math.max(0.01, +(options.follow ?? 0.5)));
    const setX = gsap.quickSetter(badge, "x", "px"), setY = gsap.quickSetter(badge, "y", "px");
    const mouse = { x: 0, y: 0 };
    let pos = null, running = false;
    const tick = () => {
      const t = reduce ? 1 : 1 - Math.pow(1 - k, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * t;
      pos.y += (mouse.y - pos.y) * t;
      setX(pos.x);
      setY(pos.y);
    };
    const move = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const enter = (e) => {
      move(e);
      if (!pos) { pos = { ...mouse }; tick(); }
      badge.classList.add("is-on");
      if (!running) { running = true; gsap.ticker.add(tick); document.addEventListener("mousemove", move); }
    };
    const leave = () => {
      badge.classList.remove("is-on");
      running = false;
      gsap.ticker.remove(tick);
      document.removeEventListener("mousemove", move);
    };
    const up = () => badge.classList.remove("is-on");
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mouseup", up);
    return () => {
      leave();
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mouseup", up);
      badge.classList.remove("fx-cursor-swap");
      gsap.set(badge, { clearProps: "transform" });
      if (home.isConnected) home.insertBefore(badge, next && next.parentNode === home ? next : null);
      else badge.remove();
    };
  });
})();
