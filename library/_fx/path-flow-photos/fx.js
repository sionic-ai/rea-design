// Photo pieces above the big title flow along a hidden SVG curve — from when the section top hits the top of the screen until the section bottom reaches screen center (scrub .1):
//  ① Flow parts([data-fx-part=item]) each runs from the nearest point on the curve to one step ahead (the span ahead on the curve divided by piece count+1)
//     Slides with .8 power2.inOut (.2 stagger), shrinks 1→0, and fades from the 60% point.
//  ② Bouncing parts([data-fx-part=pop]) are spread evenly over the curve span~1 range and pop out from 0→1 beyond 15vw on the opposite side of the tangent (1 power2.out, .5 spacing).
//  ③ All are pushed 20vw further along their own tangent direction (separate timeline, ends when the section’s bottom edge touches the top of the screen).
//  With pin: true, [data-fx-part=pin] (or the element if absent) is fixed for half a screen with no spacer (original hero).
(() => {
  const sampler = (path, box) => {
    const svg = path.ownerSVGElement, vb = svg.viewBox.baseVal, L = path.getTotalLength();
    let f = null;
    const frame = () => { const r = svg.getBoundingClientRect(), b = box.getBoundingClientRect(); f = { x: r.left - b.left, y: r.top - b.top, sx: r.width / (vb.width || r.width || 1), sy: r.height / (vb.height || r.height || 1) }; };
    const at = (t) => { if (!f) frame(); const p = path.getPointAtLength(Math.min(1, Math.max(0, t)) * L); return { x: f.x + p.x * f.sx, y: f.y + p.y * f.sy }; };
    at.tangent = (t) => { const a = at(Math.max(0, t - 0.005)), b = at(Math.min(1, t + 0.005)), dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1; return { x: dx / m, y: dy / m }; };
    at.closest = (x, y, t0, t1) => { let best = t0, bd = Infinity; for (let i = 0; i <= 200; i++) { const t = t0 + (t1 - t0) * (i / 200), p = at(t), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = t; } } return best; };
    at.reframe = frame;
    return at;
  };
  kfFx.register("path-flow-photos", (el, { options, reduce, scroller }) => {
    const path = el.querySelector('[data-fx-part="path"] path, path[data-fx-part="path"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const pops = [...el.querySelectorAll('[data-fx-part="pop"]')];
    if (!path || (!items.length && !pops.length)) return;
    const box = path.ownerSVGElement.parentElement;
    const smp = sampler(path, box);
    const span = +(options.span ?? 0.6), each = +(options.each ?? 0.2), dur = +(options.dur ?? 0.8);
    const push = +(options.push ?? 0.2), from = +(options.from ?? 0.15), scrub = +(options.scrub ?? 0.1);
    const place = () => { smp.reframe(); pops.forEach((p, r) => { const t = span + (pops.length > 1 ? r / (pops.length - 1) : 0) * (1 - span), pt = smp(t); p.style.left = pt.x - p.offsetWidth / 2 + "px"; p.style.top = pt.y - p.offsetHeight / 2 + "px"; p.dataset.t = t; }); };
    place();
    if (reduce || !window.ScrollTrigger) { gsap.set(pops, { visibility: "visible" }); return () => pops.forEach((p) => { p.style.left = p.style.top = ""; }); }
    const vw = () => innerWidth;
    const made = [];
    if (options.pin === "true") made.push(ScrollTrigger.create({ trigger: el.querySelector('[data-fx-part="pin"]') || el, scroller, start: "top top", end: "bottom center", pin: true, pinSpacing: false }));
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: options.end || "bottom center", scrub, invalidateOnRefresh: true } });
    made.push(tl);
    const n = items.length, seg = span / (n + 1);
    items.forEach((it, i) => {
      const pr = { p: 0 };
      let l = 0, to = 0, base = null;
      tl.to(pr, { p: 1, duration: dur, ease: "power2.inOut", immediateRender: false, onUpdate() {
        if (!base) { const r = it.getBoundingClientRect(), b = box.getBoundingClientRect(); l = smp.closest(r.left - b.left + r.width / 2 - (gsap.getProperty(it, "x") || 0), r.top - b.top + r.height / 2 - (gsap.getProperty(it, "y") || 0), 0, span); to = Math.min(span, l + seg); base = smp(l); }
        const pt = smp(l + (to - l) * pr.p);
        gsap.set(it, { x: pt.x - base.x, y: pt.y - base.y, scale: 1 - pr.p, opacity: Math.max(0, 1 - Math.max(0, (pr.p - 0.6) / 0.4)) });
      } }, each * i);
    });
    const b = dur + (n - 1) * each - 0.3;
    pops.forEach((p, r) => {
      const at = Math.max(0, b) + 0.5 * r;
      tl.set(p, { visibility: "visible" }, at);
      tl.fromTo(p, { x: () => -smp.tangent(+p.dataset.t).x * from * vw(), y: () => -smp.tangent(+p.dataset.t).y * from * vw(), scale: 0, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out", immediateRender: false }, at);
    });
    const D = tl.duration();
    const drift = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom top", scrub, invalidateOnRefresh: true } });
    made.push(drift);
    const list = [...items.map((it, i) => ({ el: it, t: seg * (i + 1) })), ...pops.map((p) => ({ el: p, t: +p.dataset.t }))];
    const dp = { p: 0 };
    drift.to(dp, { p: 1, duration: D, ease: "none", onUpdate: () => { const d = push * vw(); list.forEach(({ el: e, t }) => { const tg = smp.tangent(t); e.style.translate = `${tg.x * d * dp.p}px ${tg.y * d * dp.p}px`; }); } });
    const onRefresh = () => place();
    ScrollTrigger.addEventListener("refreshInit", onRefresh);
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", onRefresh);
      made.forEach((m) => { m.scrollTrigger?.kill(true); m.kill(true); });
      gsap.set([...items, ...pops], { clearProps: "transform,opacity,visibility,translate" });
    };
  });
})();
