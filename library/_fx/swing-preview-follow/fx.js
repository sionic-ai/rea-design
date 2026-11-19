// The tilt comes from the horizontal speed of the lagging card itself — when the cursor stops the card closes in and slows, so it settles on its own
(() => {
  kfFx.register("swing-preview-follow", (el, { options, reduce, hover }) => {
    const card = el.querySelector('[data-fx-part="card"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!card || !items.length || !hover || innerWidth < 992) return;
    const visuals = [...card.querySelectorAll('[data-fx-part="visual"]')];
    const lerp = +(options.lerp ?? 0.1) || 0.1, k = +(options.tilt ?? 1.5), max = +(options.max ?? 12);
    const ac = new AbortController();
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, t = { x: m.x, y: m.y };
    let lastX = m.x, rot = 0, raf = 0;
    addEventListener("mousemove", (e) => { t.x = e.clientX; t.y = e.clientY; }, { signal: ac.signal });
    const place = () => {
      card.style.translate = `calc(${m.x}px - 50%) calc(${m.y}px - 50%)`;
      card.style.rotate = `${rot}deg`;
    };
    const tick = () => {
      m.x += (t.x - m.x) * lerp;
      m.y += (t.y - m.y) * lerp;
      const want = reduce ? 0 : Math.max(-max, Math.min(max, (m.x - lastX) * k));
      rot += (want - rot) * lerp;
      lastX = m.x;
      place();
      raf = requestAnimationFrame(tick);
    };
    // look: quick — card chases the cursor with GSAP quickTo (.7s power3), and tilt follows the last horizontal movement × .6 (±8°) over .9s.
    // When the cursor stops, the tilt stays at that value (as in the original — measured anew only when there is movement)
    const quick = options.look === "quick" && window.gsap && !reduce;
    const qs = [];
    if (quick) {
      const st = { rot: 0 }, qk = +(options.tilt ?? 0.6), qmax = +(options.max ?? 8), qd = +(options.dur ?? 0.7);
      const sync = () => { rot = st.rot; place(); };
      const qx = gsap.quickTo(m, "x", { duration: qd, ease: "power3", onUpdate: sync });
      const qy = gsap.quickTo(m, "y", { duration: qd, ease: "power3", onUpdate: sync });
      const qr = gsap.quickTo(st, "rot", { duration: qd + 0.2, ease: "power3", onUpdate: sync });
      qs.push(m, st);
      let lx = null;
      el.addEventListener("pointermove", (e) => {
        qx(e.clientX); qy(e.clientY);
        if (lx !== null) qr(Math.max(-qmax, Math.min(qmax, (e.clientX - lx) * qk)));
        lx = e.clientX;
      }, { signal: ac.signal });
      el.addEventListener("pointerenter", (e) => { m.x = e.clientX; m.y = e.clientY; place(); gsap.to(card, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out", overwrite: "auto" }); }, { signal: ac.signal });
      el.addEventListener("pointerleave", () => gsap.to(card, { opacity: 0, scale: 0.85, duration: 0.5, ease: "expo.out", overwrite: "auto" }), { signal: ac.signal });
      gsap.set(card, { opacity: 0, scale: 0.85 });
      gsap.set(visuals, { clipPath: "inset(0% 0% 100% 0%)", scale: 1.15 });
      qs.push(card, ...visuals);
    } else if (reduce) { addEventListener("mousemove", () => { m.x = t.x; m.y = t.y; place(); }, { signal: ac.signal }); } else tick();
    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => {
        el.classList.add("fx-on");
        visuals.forEach((v, j) => v.classList.toggle("fx-on", j === i));
        if (quick) visuals.forEach((v, j) => gsap.to(v, { clipPath: j === i ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: j === i ? 1 : 1.15, duration: 0.8, ease: "expo.out" }));
      }, { signal: ac.signal });
      if (!quick) it.addEventListener("mouseleave", () => visuals[i]?.classList.remove("fx-on"), { signal: ac.signal });
    });
    el.addEventListener("mouseleave", () => el.classList.remove("fx-on"), { signal: ac.signal });
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      qs.forEach((o) => gsap.killTweensOf(o));
      el.classList.remove("fx-on");
      visuals.forEach((v) => v.classList.remove("fx-on"));
      if (quick) gsap.set([card, ...visuals], { clearProps: "opacity,transform,clipPath" });
      card.style.translate = "";
      card.style.rotate = "";
    };
  });
})();
