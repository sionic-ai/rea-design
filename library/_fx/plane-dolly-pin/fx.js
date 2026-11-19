(() => {
  // The camera flies into depth on a pinned section — boards stand at data-z (negative, px) depth, and while scrolling down the section the world board is
  // Pulls forward by (1 − (1 − a)²) × distance (default 2000px) (a = Section progress / arrival point .765, .52 on narrow screens). Panels that pass the camera vanish within 180px
  // Rearmost panel ([data-fx-part=hero]) fills the remainder. Just before the arrival point (.74, .49 on narrow screens) the name ([data-fx-part=title]) rises from 28px below over .07
  // On devices with hover, the world tilts ±1.25° (horizontal) ∓.9° (vertical) toward the cursor, following with 1.2s power2.out
  kfFx.register("plane-dolly-pin", (el, { options, reduce, hover, scroller }) => {
    const world = el.querySelector('[data-fx-part="world"]');
    if (!world || !window.gsap || !window.ScrollTrigger) return;
    const num = (k, d) => +(options[k] ?? d);
    const dist = num("dist", 2000), fade = num("fade", 180), rise = num("rise", 28), titleSpan = num("title-span", 0.07);
    const wide = { cam: num("arrive", 0.765), ti: num("title-at", 0.74) }, narrow = { cam: num("arrive-narrow", 0.52), ti: num("title-at-narrow", 0.49) };
    const tiltX = num("tilt-x", 2.5), tiltY = num("tilt-y", 1.8);
    const nq = matchMedia(`(max-width: ${num("narrow", 1023)}px)`);
    const title = el.querySelector('[data-fx-part="title"]');
    const planes = [...world.querySelectorAll("[data-z]")].map((p) => ({ el: p, z: parseFloat(p.dataset.z) || 0, hero: p.matches('[data-fx-part="hero"]') }));
    const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    planes.forEach((p) => gsap.set(p.el, { z: p.z }));
    if (reduce) { gsap.set(world, { z: dist }); planes.forEach((p) => { if (!p.hero) p.el.style.opacity = "0"; }); return () => { gsap.set([world, ...planes.map((p) => p.el)], { clearProps: "transform,opacity" }); }; }
    if (title) gsap.set(title, { opacity: 0, y: rise });
    let move = null;
    if (hover) {
      const rx = gsap.quickTo(world, "rotationX", { duration: 1.2, ease: "power2.out" }), ry = gsap.quickTo(world, "rotationY", { duration: 1.2, ease: "power2.out" });
      move = (e) => { const b = el.getBoundingClientRect(); if (b.top > 0 || b.bottom < innerHeight) return; ry((e.clientX / innerWidth - 0.5) * tiltX); rx((e.clientY / innerHeight - 0.5) * -tiltY); };
      addEventListener("mousemove", move, { passive: true });
    }
    const paint = (p) => {
      const c = nq.matches ? narrow : wide, a = clamp(p / c.cam), s = (1 - (1 - a) * (1 - a)) * dist;
      gsap.set(world, { z: s });
      for (const pl of planes) if (!pl.hero) pl.el.style.opacity = String(1 - clamp((pl.z + s + 40) / fade));
      if (title) { const t = clamp((p - c.ti) / titleSpan); gsap.set(title, { opacity: t, y: (1 - t) * rise }); }
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom bottom", onUpdate: (s) => paint(s.progress) });
    paint(st.progress);
    return () => {
      st.kill(); if (move) removeEventListener("mousemove", move);
      gsap.set([world, ...planes.map((p) => p.el), title].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
