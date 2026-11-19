// Lying ring: N cards stand around a circle laid flat on the floor (rotateX 90°), each card counter-rotated to face front, making one turn in dur seconds.
// The ring tilts with the cursor X 70~110° · Y ±25° · Z ±5° (.8s power3), and rolling the wheel turns it further while the ring and perspective spread apart then return — Hero of a template showcase site
(() => {
  kfFx.register("tilt-wheel-ring", (el, { options, reduce, hover }) => {
    const ring = el.querySelector('[data-fx-part="ring"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!ring || !items.length) return;
    if (reduce) {
      el.classList.add("is-fx-still");
      return () => el.classList.remove("is-fx-still");
    }
    const dur = +(options.dur ?? 12), tiltDur = +(options.tilt ?? 0.8);
    const narrowAt = +(options.narrow ?? 768);
    const phase = items.map((_, i) => (i / items.length) * Math.PI * 2);
    const area = el.closest("[data-slot], section") || el;
    let narrow = innerWidth <= narrowAt;
    const lift = () => +(options.lift ?? (innerWidth >= 1024 ? 6.2 : 4.5));
    const T = { rx: narrow ? 80 : 90, ry: 0, rz: 0 };
    const spin = { v: 0 }, push = { v: 0 }, grow = { v: 0 };
    const k = () => (narrow ? 30 : 12) / 12;

    const place = () => {
      ring.style.transform = `translate3d(0, ${lift()}vw, ${-26 * k()}vw) rotateX(${T.rx}deg) rotateY(${T.ry}deg) rotateZ(${T.rz}deg)`;
      for (const it of items) gsap.set(it, { rotationX: -T.rx, rotationY: -T.ry, rotation: -T.rz });
    };
    const arrange = () => {
      const a = k();
      el.style.perspective = `${100 + 30 * grow.v}vw`;
      const r = innerWidth / Math.max(2.2 / a, 3.5 / a - grow.v * (0.12 / a));
      const ang = spin.v + push.v;
      items.forEach((it, i) => {
        const t = ang + phase[i];
        gsap.set(it, { x: Math.sin(t) * r, y: Math.cos(t) * r });
      });
    };
    const ease = kfFx.ease(options.ease || "power3", "power3");
    const qx = gsap.quickTo(T, "rx", { duration: tiltDur, ease, onUpdate: place });
    const qy = gsap.quickTo(T, "ry", { duration: tiltDur, ease, onUpdate: place });
    const qz = gsap.quickTo(T, "rz", { duration: tiltDur, ease, onUpdate: place });
    const qg = gsap.quickTo(grow, "v", { duration: 1.3, ease: "power2.out", onUpdate: arrange });
    const qp = gsap.quickTo(push, "v", { duration: 0.5, ease: "power2", onUpdate: arrange });
    const loop = gsap.to(spin, { v: Math.PI * 2, duration: dur, repeat: -1, ease: "none", onUpdate: arrange, paused: true });

    let seen = false, wheelSum = 0, calm = 0;
    const run = () => (seen && !document.hidden ? loop.play() : loop.pause());
    const io = new IntersectionObserver((es) => { seen = es.some((e) => e.isIntersecting); run(); }, { rootMargin: "120px 0px" });
    io.observe(el);
    const aim = (x, y) => {
      if (narrow) return;
      qy((x / innerWidth) * 50 - 25);
      qx((y / innerHeight) * 40 - 20 + 90);
      qz(-((x / innerWidth) * 10) + 5);
    };
    // Over places where the cursor should stay, like buttons, the ring does not tilt (the original filters out the hit area around buttons)
    const skip = (e) => options.ignore && e.target.closest?.(options.ignore);
    const move = (e) => { if (!skip(e)) aim(e.clientX, e.clientY); };
    const wheel = (e) => {
      wheelSum += e.deltaY / 20;
      qp(0.017 * wheelSum);
      qg(Math.abs(e.deltaY) / 12);
      clearTimeout(calm);
      calm = setTimeout(() => qg(0), 120);
    };
    const fit = () => {
      const was = narrow;
      narrow = innerWidth <= narrowAt;
      if (was !== narrow) { gsap.killTweensOf(T); T.rx = narrow ? 80 : 90; T.ry = 0; T.rz = 0; }
      place(); arrange();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    if (hover) area.addEventListener("mousemove", move, { passive: true });
    area.addEventListener("wheel", wheel, { passive: true });
    document.addEventListener("visibilitychange", run);
    place(); arrange();
    return () => {
      io.disconnect(); ro.disconnect(); clearTimeout(calm); loop.kill();
      gsap.killTweensOf([T, spin, push, grow]);
      area.removeEventListener("mousemove", move);
      area.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", run);
      ring.style.transform = ""; el.style.perspective = "";
      gsap.set(items, { clearProps: "transform" });
    };
  });
})();
