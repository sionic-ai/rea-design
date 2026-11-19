// The whole stage tilts in perspective toward the mouse — uses the window-wide mouse position, and each frame follows 1 − follow^frame of the remaining distance
(() => {
  kfFx.register("cursor-stage-tilt", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const max = +(options.max ?? 0.9), per = +(options.perspective ?? 900), sc = +(options.scale ?? 1.025), follow = +(options.follow ?? 0.92);
    const aim = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const move = (e) => { aim.x = (e.clientX / innerWidth - 0.5) * 2; aim.y = (e.clientY / innerHeight - 0.5) * 2; };
    const leave = () => { aim.x = 0; aim.y = 0; };
    const tick = () => {
      const k = 1 - Math.pow(follow, gsap.ticker.deltaRatio());
      cur.x += (aim.x - cur.x) * k; cur.y += (aim.y - cur.y) * k;
      el.style.transform = `perspective(${per}px) rotateX(${-(max * cur.y)}deg) rotateY(${max * cur.x}deg) scale(${sc})`;
    };
    addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    gsap.ticker.add(tick);
    return () => {
      removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      gsap.ticker.remove(tick);
      el.style.removeProperty("transform");
    };
  });
})();
