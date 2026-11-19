// Several photo rings turn −360° in turn on a screen-pinned stage while passing from below (70vh) to above (−100vh), and when the ring changes, the step (data-fx-part="step") changes.
// Original values (case study): radius 350×clamp(.55,1,width/1200) · vertical arc 85× same factor · card 10vw (phone 22vw · radius 150 · arc 28) · ring tilt sin(2θ)×−3°
// · card tilt −angle×.15 · size .6+(front degree)×.52 · one ring 3 beats · overlap .15 · ring travel 1.7 screens · scrub .8 · pin end = Scroll end − 50%.
(() => {
  kfFx.register("ring-rise-carousel", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!rings.length) return;
    const DUR = 3, OVERLAP = +(options.overlap ?? 0.15), TILT = +(options.tilt ?? 3), START = options.start || "70vh";
    const BASE_R = +(options.radius ?? 350), BASE_ARC = +(options.arc ?? 85), SIZE = +(options.size ?? 10), SCRUB = +(options.scrub ?? 0.8);
    let radius = BASE_R, arc = BASE_ARC;
    const geometry = () => {
      const vw = innerWidth;
      if (vw < 768) { radius = 150; arc = 28; el.style.setProperty("--fx-card", vw * 0.22 + "px"); return; }
      const k = gsap.utils.clamp(0.55, 1, vw / 1200);
      radius = BASE_R * k; arc = BASE_ARC * k;
      el.style.setProperty("--fx-card", (vw * SIZE) / 100 + "px");
    };
    geometry();
    const parts = rings.map((ring) => ({
      ring,
      items: [...ring.querySelectorAll('[data-fx-part="card"]')].map((c) => ({ c, face: c.firstElementChild || c, z: null })),
    }));
    const draw = (p, deg) => {
      const n = p.items.length;
      if (!n) return;
      const rad = (deg * Math.PI) / 180;
      gsap.set(p.ring, { rotation: Math.sin(rad * 2) * -TILT });
      p.items.forEach((it, i) => {
        const norm = (((i * 360) / n + deg) % 360 + 360) % 360, s = norm > 180 ? norm - 360 : norm, a = (s * Math.PI) / 180, face = Math.cos(a);
        const x = Math.sin(a) * radius, z = Math.cos(a) * radius, y = face * arc, zi = Math.round((z + radius) * 10);
        if (it.z !== zi) { it.z = zi; it.c.style.zIndex = zi; }
        it.face.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-s * 0.15}deg) scale(${0.6 + ((face + 1) / 2) * 0.52})`;
      });
    };

    let active = -1;
    const show = (i) => {
      if (i === active) return;
      const prev = active;
      active = i;
      el.dataset.step = String(i);
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      if (steps.length && !reduce) {
        if (steps[prev]) gsap.to(steps[prev], { autoAlpha: 0, duration: 0.25, ease: "power2.inOut", overwrite: "auto" });
        if (steps[i]) gsap.to(steps[i], { autoAlpha: 1, duration: 0.25, ease: "power2.inOut", delay: prev >= 0 ? 0.08 : 0, overwrite: "auto" });
      }
      el.dispatchEvent(new CustomEvent("fx:step", { detail: { index: i, prev } }));
    };

    if (reduce) {
      parts.forEach((p) => draw(p, 0));
      gsap.set(rings, { y: 0 });
      gsap.set(rings.slice(1), { autoAlpha: 0 });
      show(0);
      return () => { gsap.set(rings, { clearProps: "all" }); steps.forEach((s) => s.classList.remove("is-active")); };
    }

    parts.forEach((p) => { draw(p, 0); gsap.set(p.ring, { y: START, opacity: 1, force3D: true }); });
    gsap.set(steps, { autoAlpha: 0 });

    // Exclude the part of the ring that is off-screen (start, end) and raise the next ring — measured by the actual position of the first ring’s cards, like the original
    const top0 = el.getBoundingClientRect().top, H = el.offsetHeight, travel = 1.7 * H;
    let lo = Infinity, hi = -Infinity;
    parts[0].items.forEach((it) => { const r = it.face.getBoundingClientRect(); lo = Math.min(lo, r.top - top0); hi = Math.max(hi, r.bottom - top0); });
    if (!Number.isFinite(lo)) { lo = H; hi = H; }
    const hidStart = Math.max(0, (DUR * (lo - H)) / travel), hidEnd = Math.max(0, (DUR * (travel - hi)) / travel);
    const STEP = Math.max(0.5, DUR - hidStart - hidEnd - OVERLAP), TOTAL = (rings.length - 1) * STEP + DUR;
    const at = rings.map((_, k) => (k === 0 ? 0 : ((k - 1) * STEP + DUR - hidEnd) / TOTAL));

    const sc = scroller ? { scroller } : {};
    const enter = ScrollTrigger.create({ trigger: el, ...sc, start: "top 65%", onEnter: () => { if (active === -1) show(0); }, onLeaveBack: () => { gsap.to(steps, { autoAlpha: 0, duration: 0.3, overwrite: "auto" }); active = -1; el.dataset.step = "-1"; el.dispatchEvent(new CustomEvent("fx:step", { detail: { index: -1 } })); } });
    const pin = ScrollTrigger.create({ trigger: el, ...sc, start: "top top", end: `+=${(500 * TOTAL) / 9 - 50}%`, pin: options.pin === "off" ? false : true, anticipatePin: 1, refreshPriority: 2 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el, ...sc, start: "top top", end: `+=${(500 * TOTAL) / 9}%`, scrub: SCRUB, refreshPriority: 2,
        onUpdate: (st) => { let k = 0; at.forEach((v, i) => { if (st.progress >= v) k = i; }); show(k); },
      },
    });
    parts.forEach((p, k) => {
      const rot = { d: 0 }, t = k * STEP;
      tl.fromTo(p.ring, { y: START }, { y: "-100vh", duration: DUR, ease: "none", immediateRender: false }, t)
        .to(rot, { d: -360, duration: DUR, ease: "none", onUpdate: () => draw(p, rot.d) }, t);
    });
    const onResize = () => { geometry(); parts.forEach((p) => draw(p, 0)); };
    ScrollTrigger.addEventListener("refreshInit", onResize);
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", onResize);
      tl.scrollTrigger?.kill(); tl.kill(); pin.kill(); enter.kill();
      gsap.set(rings, { clearProps: "all" }); gsap.set(steps, { clearProps: "all" });
      parts.forEach((p) => p.items.forEach((it) => { it.face.style.transform = ""; it.c.style.zIndex = ""; }));
    };
  });
})();
