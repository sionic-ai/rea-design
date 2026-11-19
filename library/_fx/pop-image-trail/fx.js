(() => {
  kfFx.register("pop-image-trail", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')].map((node) => ({ node, inner: node.querySelector('[data-fx-part="inner"]') || node.firstElementChild, w: 0, h: 0 }));
    if (!items.length || reduce || !hover) return;
    const gap = +(options.gap ?? 80);
    const lerp = +(options.lerp ?? 0.1);
    const dur = +(options.dur ?? 0.4);
    const hold = +(options.hold ?? 0.45);
    const from = +(options.inner ?? 2.5);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const measure = () => items.forEach((it) => {
      gsap.set(it.node, { opacity: 0, scale: 1 });
      it.w = it.node.offsetWidth;
      it.h = it.node.offsetHeight;
    });
    measure();
    const ro = new ResizeObserver(measure);
    items.forEach((it) => ro.observe(it.node));
    const mouse = { x: 0, y: 0 }, last = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
    let idx = 0, z = 1, seen = false;
    const onMove = (e) => {
      const b = el.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (!seen) { seen = true; smooth.x = last.x = mouse.x; smooth.y = last.y = mouse.y; }
    };
    const showNext = () => {
      const it = items[idx];
      idx = (idx + 1) % items.length;
      z++;
      gsap.killTweensOf(it.node);
      const tl = gsap.timeline()
        .fromTo(it.node, { opacity: 1, scale: 0, x: smooth.x - it.w / 2, y: smooth.y - it.h / 2, zIndex: z }, { duration: dur, scale: 1, x: mouse.x - it.w / 2, y: mouse.y - it.h / 2, ease }, 0)
        .to(it.node, { opacity: 0, scale: 0.2, duration: dur }, hold);
      if (it.inner && it.inner !== it.node) tl.fromTo(it.inner, { scale: from }, { scale: 1, duration: dur }, 0);
      el.dispatchEvent(new CustomEvent("fx:drop", { detail: { el: it.node } }));
    };
    const tick = () => {
      smooth.x += (mouse.x - smooth.x) * lerp;
      smooth.y += (mouse.y - smooth.y) * lerp;
      if (seen && Math.hypot(mouse.x - last.x, mouse.y - last.y) > gap) {
        showNext();
        last.x = mouse.x;
        last.y = mouse.y;
      }
    };
    el.addEventListener("mousemove", onMove);
    gsap.ticker.add(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(tick);
      ro.disconnect();
      items.forEach((it) => { gsap.killTweensOf([it.node, it.inner].filter(Boolean)); gsap.set(it.node, { clearProps: "all" }); if (it.inner) gsap.set(it.inner, { clearProps: "transform" }); });
    };
  });
})();
