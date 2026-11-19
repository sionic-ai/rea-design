(() => {
  kfFx.register("velocity-reel", (el, { options, reduce, scroller }) => {
    const track = el.querySelector("[data-fx-part=track]");
    if (!track || !track.children.length) return;
    const twin = [...track.children].map((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); return k; });
    twin.forEach((k) => track.appendChild(k));
    if (reduce) return () => twin.forEach((k) => k.remove());
    const base = +(options.base ?? 14), boost = +(options.boost ?? 26);
    const set = gsap.quickSetter(track, "y", "px");
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let y = 0, last = pos();
    const tick = (t, dt) => {
      const p = pos(), lv = (window.lenis || window.Fm?.lenis || window.Em?.lenis)?.velocity;
      const v = lv != null ? Math.abs(lv) : Math.abs(p - last) / Math.max(1, dt / 16.67);
      last = p;
      const k = (scroller ? scroller.clientWidth : innerWidth) / 1440;
      const half = track.offsetHeight / 2 || 1;
      y = (y + ((base + v * boost) * k * Math.max(1, dt)) / 1000) % half;
      set(-y);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); twin.forEach((k) => k.remove()); gsap.set(track, { clearProps: "transform" }); };
  });
})();
