// Product bags stand around each ring fourteen at a time, and three rings staggered by 1/3 approach from .85 to 2.05x every 12s as the blur clears (tunnel).
// The ring turns once backward in 120s and the bags turn the opposite way to stay upright, each bag swaying ±10° over 15s. Scrolling or hovering the button adds approach speed.
(() => {
  kfFx.register("ring-tunnel-zoom", (el, { options, reduce, hover, scroller }) => {
    const rings = [...el.querySelectorAll("[data-fx-part=ring]")];
    if (!rings.length) return;
    const count = parseInt(options.count, 10) || 14;
    const zoom = +options.zoom || 12;
    const turn = +options.turn || 120;
    const from = +(options.from ?? 0.85), to = +(options.to ?? 2.05);
    const sway = +(options.sway ?? 10);
    const made = [];
    rings.forEach((ring, r) => {
      if (ring.querySelector("[data-fx-part=pack]")) return;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.setAttribute("data-fx-part", "pack");
        s.style.setProperty("--n", String((i + r * 3) % 7));
        s.innerHTML = "<i></i>";
        ring.append(s);
        made.push(s);
      }
    });
    const packsOf = (ring) => [...ring.querySelectorAll("[data-fx-part=pack]")];
    const place = () => rings.forEach((ring) => {
      const packs = packsOf(ring), R = ring.offsetWidth / 2;
      packs.forEach((p, i) => { const a = (i / packs.length) * Math.PI * 2; gsap.set(p, { x: Math.cos(a) * R, y: Math.sin(a) * R }); });
    });
    place();
    const inners = rings.flatMap((ring) => packsOf(ring).map((p) => p.firstElementChild || p));
    const cleanup = () => {
      made.forEach((m) => m.remove());
      gsap.set([...rings, ...el.querySelectorAll("[data-fx-part=pack]"), ...inners], { clearProps: "transform,filter,opacity" });
    };
    if (reduce) {
      rings.forEach((ring, r) => gsap.set(ring, { scale: from + ((to - from) * (r + 0.5)) / rings.length }));
      return cleanup;
    }

    const tls = [];
    const zooms = rings.map((ring, r) => {
      const ins = packsOf(ring).map((p) => p.firstElementChild || p);
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(ring, { scale: from }, { scale: to, duration: zoom, ease: "none" }, 0)
        .fromTo(ins, { y: "2.5vw" }, { y: "-7.5vw", duration: zoom, ease: "power1.in" }, 0)
        .fromTo(ins, { filter: "blur(4px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: zoom / 6, ease: "power1.in" }, 0);
      tl.progress(r / rings.length);
      const spin = gsap.timeline({ repeat: -1 });
      spin.to(ring, { rotation: -360, duration: turn, ease: "none" }, 0).to(packsOf(ring), { rotation: 360, duration: turn, ease: "none" }, 0);
      spin.progress(r / rings.length);
      tls.push(spin);
      packsOf(ring).forEach((p, i) => {
        const inner = p.firstElementChild || p;
        const s = gsap.timeline({ repeat: -1 });
        const d = r % 2 ? -1 : 1;
        s.to(inner, { rotation: sway * d, duration: turn / 8, ease: "none" })
          .to(inner, { rotation: 0, duration: turn / 8, ease: "none" })
          .to(inner, { rotation: -sway * d, duration: turn / 8, ease: "none" })
          .to(inner, { rotation: 0, duration: turn / 8, ease: "none" });
        s.progress((1 - ((i * 360) / packsOf(ring).length % 180) / 180 + r * 0.33) % 1);
        tls.push(s);
      });
      return tl;
    });

    // Bonus speed: rings farther away (less progressed) receive more — 1 + bonus × (1 − progress)²
    const st = { scroll: 0, hover: 0 };
    const apply = () => zooms.forEach((tl) => { const k = 1 - (tl.progress() || 0); tl.timeScale(1 + (st.scroll + st.hover) * k * k); });
    gsap.ticker.add(apply);
    const trig = window.ScrollTrigger && ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top",
      onUpdate: (s) => {
        const v = Math.min(6, Math.abs(s.getVelocity()) / 60 * 0.08);
        gsap.to(st, { scroll: Math.max(st.scroll, v), duration: 0.3, overwrite: "auto" });
        gsap.to(st, { scroll: 0, duration: 1.2, delay: 0.3, ease: "power2.out", overwrite: "auto" });
      },
    });
    const btn = el.querySelector("[data-fx-part=boost]");
    const kick = () => gsap.timeline().to(st, { hover: 3, duration: 0.925, ease: "none" }).to(st, { hover: 0, duration: 0.925, ease: "none" });
    if (btn && hover) btn.addEventListener("mouseenter", kick);

    const all = [...zooms, ...tls];
    const io = new IntersectionObserver(([e]) => all.forEach((t) => (e.isIntersecting ? t.resume() : t.pause())));
    io.observe(el);
    const ro = new ResizeObserver(place);
    rings.forEach((r) => ro.observe(r));

    return () => {
      gsap.ticker.remove(apply); trig?.kill(); io.disconnect(); ro.disconnect();
      btn?.removeEventListener("mouseenter", kick);
      all.forEach((t) => t.kill());
      gsap.killTweensOf(st);
      cleanup();
    };
  });
})();
