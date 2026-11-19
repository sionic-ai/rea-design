// The small box in the heading goes to the big slot of the next section — tied to scroll (scrub .25) from when the box center reaches screen center until the target center reaches screen center
// Grows to fit the target size and position with Flip.fit. During the first 1/3 the tilt (−5°) and mouse tilt (max 20°) ease to 0
(() => {
  kfFx.register("flip-to-target", (el, { options, reduce, hover, scroller }) => {
    const target = options.target && document.querySelector(options.target);
    if (!target || !window.gsap || !window.ScrollTrigger || !window.Flip) return;
    const tilt = el.querySelector('[data-fx-part="tilt"]') || el;
    const rest = +(options.tilt ?? -5), maxRot = +(options.rotate ?? 20), scrub = +(options.scrub ?? 0.25);
    const angle = { rx: 0, ry: 0 };
    let full = 0, tl = null;
    const paint = () => { const k = 1 - full; gsap.set(tilt, { transformPerspective: 900, rotationZ: rest * k, rotationX: angle.rx * k, rotationY: angle.ry * k }); };
    const build = () => {
      if (tl) { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(el, { clearProps: "x,y,width,height,transform" }); }
      if (reduce) { paint(); return; }
      tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "clamp(center center)", endTrigger: target, end: "center center", scrub } });
      tl.add(Flip.fit(el, target, { duration: 1, ease: "none" }));
      tl.eventCallback("onUpdate", () => { full = Math.min(1, tl.progress() * 3); paint(); el.dispatchEvent(new CustomEvent("fx:grow", { detail: full })); });
    };
    paint();
    const raf = requestAnimationFrame(build);
    let w = innerWidth;
    const onResize = () => { if (innerWidth !== w) { w = innerWidth; build(); } };
    addEventListener("resize", onResize);
    const ac = new AbortController();
    if (hover && !reduce) {
      let px = 0, py = 0, q = false;
      const apply = () => {
        q = false;
        const r = el.getBoundingClientRect(), nx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (r.width / 2 || 1))), ny = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (r.height / 2 || 1)));
        gsap.to(angle, { rx: -ny * maxRot * (1 - full), ry: nx * maxRot * (1 - full), duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: paint });
      };
      document.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; if (!q) { q = true; requestAnimationFrame(apply); } }, { signal: ac.signal });
    }
    return () => { cancelAnimationFrame(raf); ac.abort(); removeEventListener("resize", onResize); tl?.scrollTrigger?.kill(); tl?.kill(); gsap.killTweensOf(angle); gsap.set([el, tilt], { clearProps: "all" }); };
  });
})();
