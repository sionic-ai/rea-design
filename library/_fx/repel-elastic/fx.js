(() => {
  kfFx.register("repel-elastic", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (reduce || !items.length) return;
    const base = items.map((it) => { const r = parseFloat(getComputedStyle(it).rotate) || 0; it.style.rotate = "0deg"; gsap.set(it, { rotation: r }); return r; });
    const dur = +(options.dur ?? 0.45), back = +(options.back ?? 1.2);
    const set = () => innerWidth <= 767
      ? { R: +(options.radius ?? 460) * 260 / 460, D: +(options.push ?? 380) * 110 / 380, rot: +(options.rot ?? 30) * 12 / 30, gr: +(options.grow ?? 0.2) / 2 }
      : { R: +(options.radius ?? 460), D: +(options.push ?? 380), rot: +(options.rot ?? 30), gr: +(options.grow ?? 0.2) };
    const centre = (it) => { const x = +gsap.getProperty(it, "x") || 0, y = +gsap.getProperty(it, "y") || 0, b = it.getBoundingClientRect(); return { x: b.left + b.width / 2 - x, y: b.top + b.height / 2 - y }; };
    const push = (mx, my) => {
      const { R, D, rot, gr } = set();
      items.forEach((it, i) => {
        const c = centre(it), d = Math.hypot(mx - c.x, my - c.y);
        if (d < R) {
          const a = Math.atan2(my - c.y, mx - c.x), f = Math.pow((R - d) / R, 1.6);
          gsap.to(it, { x: -Math.cos(a) * f * D, y: -Math.sin(a) * f * D, rotation: base[i] - Math.cos(a) * f * rot, scale: 1 + f * gr, duration: dur, ease: "power4.out", overwrite: "auto" });
        } else gsap.to(it, { x: 0, y: 0, rotation: base[i], scale: 1, duration: back, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
      });
    };
    const rest = () => items.forEach((it, i) => gsap.to(it, { x: 0, y: 0, rotation: base[i], scale: 1, duration: back, ease: "elastic.out(1, 0.35)", overwrite: "auto" }));
    let inside = false;
    const m = { x: 0, y: 0 };
    const at = () => (inside ? m : { x: innerWidth / 2, y: innerHeight / 2 });
    const ac = new AbortController();
    if (hover) {
      el.addEventListener("mousemove", (e) => { inside = true; m.x = e.clientX; m.y = e.clientY; push(m.x, m.y); }, { signal: ac.signal });
      el.addEventListener("mouseleave", () => { inside = false; const p = at(); push(p.x, p.y); }, { signal: ac.signal });
    }
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onUpdate: () => { const p = at(); push(p.x, p.y); }, onLeave: rest, onLeaveBack: rest });
    return () => { ac.abort(); st.kill(); items.forEach((it, i) => { gsap.killTweensOf(it); gsap.set(it, { clearProps: "transform" }); it.style.rotate = base[i] ? `${base[i]}deg` : ""; }); };
  });
})();
