// One service — obstacle cards flow staggered with scroll (70/−30/40%), and branch lines are drawn as far as the scroll goes
(() => {
  if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const mm = gsap.matchMedia();
  mm.add("(min-width: 799px)", () => {
    const cards = [...document.querySelectorAll(".d-pain__card")];
    const shift = [70, -30, 40];
    const tw = cards.map((c, i) => gsap.to(c, { yPercent: shift[i] ?? 30, ease: "none", scrollTrigger: { trigger: ".d-pain", start: "top bottom", end: "bottom top", scrub: true } }));
    return () => { tw.forEach((t) => t.scrollTrigger?.kill()); gsap.set(cards, { clearProps: "transform" }); };
  });
  // Person trail — original MotionTrail (fadeAfter 1): receives page coordinates only while the section is on screen and the cursor is inside it.
  // Each frame pulls the lagging spot toward the cursor by .3, and once it moves more than 200px from the last spawn spot, the next person is spawned —
  // From a late position and size (r − .2~.6) to cursor position and size r (.7~1.3) and −3~3° in .4s power3, stays 1s after arrival, then disappears in .2s
  mm.add("(min-width: 992px)", () => {
    const box = document.querySelector("[data-d-trail]"); if (!box) return;
    const items = [...box.children], R = gsap.utils.random;
    let shown = false, idx = 0, z = 1, raf = 0;
    let cur = null, last = { x: 0, y: 0 }, slow = { x: 0, y: 0 };
    const io = new IntersectionObserver(([e]) => (shown = e.isIntersecting), { threshold: 0 });
    io.observe(box);
    const move = (e) => {
      if (!shown) return;
      const b = box.getBoundingClientRect();
      if (e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom) cur = { x: e.clientX + scrollX, y: e.clientY + scrollY };
    };
    addEventListener("mousemove", move);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!shown || !cur) return;
      slow.x = gsap.utils.interpolate(slow.x || cur.x, cur.x, 0.3);
      slow.y = gsap.utils.interpolate(slow.y || cur.y, cur.y, 0.3);
      if (Math.hypot(last.x - cur.x, last.y - cur.y) <= 200) return;
      idx = (idx + 1) % items.length;
      const el = items[idx], b = box.getBoundingClientRect(), ox = b.left + scrollX, oy = b.top + scrollY;
      const w = el.offsetWidth / 2, h = el.offsetHeight / 2, s = R(0.7, 1.3);
      gsap.killTweensOf(el);
      gsap.timeline()
        .fromTo(el, { scale: s - R(0.2, 0.6), rotationZ: 0, opacity: 1, zIndex: ++z, x: slow.x - ox - w, y: slow.y - oy - h },
          { duration: 0.4, ease: "power3", scale: s, rotationZ: R(-3, 3), x: cur.x - ox - w, y: cur.y - oy - h }, 0)
        .to(el, { opacity: 0, duration: 0.2 }, ">1");
      last = { ...cur };
    };
    raf = requestAnimationFrame(tick);
    return () => { io.disconnect(); removeEventListener("mousemove", move); cancelAnimationFrame(raf); gsap.killTweensOf(items); gsap.set(items, { clearProps: "all" }); };
  });
  const paths = [...document.querySelectorAll("[data-branch]")];
  paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  gsap.to(paths, { strokeDashoffset: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: ".d-branch", start: "top bottom", end: "bottom+=100% top", scrub: true } });
})();
