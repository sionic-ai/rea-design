(() => {
  // The fixed (position: fixed) Hero photo, from when the from cell’s top edge reaches 70% of the screen until the center of the to cell (small cell in the text line) reaches the screen center
  // Tied to scroll, it shrinks to that slot’s size · position. Once fully shrunk it stays attached to the slot and rises with the document, and grows again on return
  kfFx.register("hero-dock-slot", (el, { options, reduce, scroller }) => {
    const target = options.to && document.querySelector(options.to);
    const from = options.from && document.querySelector(options.from);
    if (!target || !window.gsap || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const lerp = gsap.utils.interpolate;
    const sy = () => (scroller ? scroller.scrollTop : scrollY);
    let base = el.getBoundingClientRect(), docked = null, dockAt = 0;
    const dockRect = (end) => {
      const t = target.getBoundingClientRect();
      return { x: t.left - base.left, y: t.top + sy() - end - base.top, width: t.width, height: t.height };
    };
    const morph = (p) => {
      const t = target.getBoundingClientRect();
      gsap.set(el, { x: lerp(base.left, t.left, p) - base.left, y: lerp(base.top, t.top, p) - base.top, width: lerp(base.width, t.width, p), height: lerp(base.height, t.height, p) });
    };
    const follow = () => { if (docked) gsap.set(el, { x: docked.x, y: docked.y - Math.max(sy() - dockAt, 0), width: docked.width, height: docked.height }); };
    const release = () => { docked = null; gsap.set(el, { clearProps: "transform,width,height" }); };
    gsap.ticker.add(follow);
    const st = ScrollTrigger.create({
      trigger: from || el, start: from ? "top 70%" : "top top", endTrigger: target, end: "center center", scrub: true, invalidateOnRefresh: true, ...(scroller && { scroller }),
      onRefreshInit: () => { release(); base = el.getBoundingClientRect(); },
      onRefresh: (self) => { if (sy() >= self.end) { dockAt = self.end; docked = dockRect(self.end); follow(); } else { docked = null; morph(self.progress); } },
      onUpdate: (self) => { if (!docked) morph(self.progress); },
      onLeave: (self) => { dockAt = self.end; docked = dockRect(self.end); follow(); },
      onLeaveBack: release,
      onEnterBack: () => { docked = null; },
    });
    return () => { st.kill(); gsap.ticker.remove(follow); if (el.isConnected) release(); };
  });
})();
