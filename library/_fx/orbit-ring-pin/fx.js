// When the section center reaches the screen center, pin the panel for 3 screens (scrub .1) and small photos and color pieces gather around a circle and scatter:
//  Pieces enter 0→1 from .3 radians ahead of their own angle and settle in place (1 power2.out, .5 stagger), meanwhile the circle turns 180° and the pieces turn backward −180° (.5×piece count+1, power1.out).
//  The moment the circle passes 180° it fires fx:orbit-half on the element (the original changes the page background to yellowed paper here). At the end the pieces grow 1.4x with doubled radius and fade (2 power2.in).
//  Slot angles mix a fixed 5% jitter into evenly divided angles, and neighbors closer than .2 radians are spread apart.
(() => {
  const angles = (n, jitter, gap) => {
    const step = (2 * Math.PI) / n, out = [];
    const rnd = (k) => { const s = 1e4 * Math.sin(k); return s - Math.floor(s); };
    for (let i = 0; i < n; i++) { const even = i * step; out.push(even + (2 * rnd(5 + i) * Math.PI - even) * jitter); }
    out.sort((a, b) => a - b);
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < n - 1; i++) { const g = out[i + 1] - out[i]; if (g < gap) { const d = (gap - g) / 2; out[i] -= d; out[i + 1] += d; } }
    return out.map((a) => 2 * Math.PI + a);
  };
  kfFx.register("orbit-ring-pin", (el, { options, reduce, scroller }) => {
    const ring = el.querySelector('[data-fx-part="ring"]');
    const items = ring ? [...ring.querySelectorAll('[data-fx-part="item"]')] : [];
    if (!ring || !items.length) return;
    const R = +(options.radius ?? 0.42), lead = +(options.lead ?? 0.3), out = +(options.out ?? 2), grow = +(options.grow ?? 1.4);
    const screens = +(options.screens ?? 3), turn = +(options.turn ?? 180);
    const ang = angles(items.length, +(options.jitter ?? 0.05), 0.2);
    const geo = () => ({ cx: ring.offsetWidth / 2, cy: ring.offsetHeight / 2, r: R * Math.min(ring.offsetWidth, ring.offsetHeight) });
    const spot = (it, a, k = 1, off = 0) => { const { cx, cy, r } = geo(), w = it.offsetWidth; return { x: cx + Math.cos(a - off) * r * k - w / 2, y: cy + Math.sin(a - off) * r * k - w / 2 }; };
    if (reduce || !window.ScrollTrigger) { items.forEach((it, i) => { const p = spot(it, ang[i]); gsap.set(it, { x: p.x, y: p.y, scale: 1, opacity: 1 }); }); return () => gsap.set(items, { clearProps: "all" }); }
    const pin = el.querySelector('[data-fx-part="pin"]') || ring.parentElement;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "center center", end: `+=${screens * 100}%`, pin, scrub: +(options.scrub ?? 0.1), invalidateOnRefresh: true } });
    const m = 0.5 * items.length + 1;
    let half = false;
    items.forEach((it, i) => {
      tl.set(it, { x: () => spot(it, ang[i], 1, lead).x, y: () => spot(it, ang[i], 1, lead).y, scale: 0, opacity: 0, rotation: 0, zIndex: items.length - i }, 0);
      tl.to(it, { x: () => spot(it, ang[i]).x, y: () => spot(it, ang[i]).y, scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, 0.5 * i);
      tl.to(it, { rotation: -turn, duration: m, ease: "power1.out" }, 0);
    });
    tl.to(ring, { rotation: turn, duration: m, ease: "power1.out", onUpdate: () => { const now = gsap.getProperty(ring, "rotation") >= turn; if (now !== half) { half = now; el.dispatchEvent(new CustomEvent("fx:orbit-half", { detail: { past: now } })); } } }, 0);
    items.forEach((it, i) => tl.to(it, { x: () => spot(it, ang[i], out).x, y: () => spot(it, ang[i], out).y, scale: grow, opacity: 0, duration: 2, ease: "power2.in" }, m));
    return () => { tl.scrollTrigger?.kill(true); tl.kill(); gsap.set([ring, ...items], { clearProps: "transform,opacity,zIndex" }); };
  });
})();
