// Studio — photo cylinder: N panels stand evenly in rotationY around an axis half a screen width behind, one turn in 30s.
// Dragging (Draggable + inertia) moves progress by hand, and wheel/touch speed raises timeScale up to ±60 then returns it to ±1 over 1.2s
KK.page("about", (c) => {
  const wrap = c.querySelector("[data-cyl]");
  if (!wrap) return;
  const labelsBox = c.querySelector("[data-cyl-labels]"), labels = [...c.querySelectorAll("[data-cyl-label]")];
  const panels = [...wrap.querySelectorAll("[data-cyl-panel]")], items = [...wrap.querySelectorAll("[data-cyl-item]")];
  gsap.registerPlugin(Draggable, InertiaPlugin, Observer);
  if (KK.reduce) {
    const r = innerWidth * 0.5;
    panels.forEach((p) => (p.style.transformOrigin = `50% 50% ${-r}px`));
    gsap.set(panels, { rotationY: (i) => (i * 360) / panels.length });
    gsap.set(wrap, { autoAlpha: 1, scale: 1, rotation: 5 });
    gsap.set(items, { autoAlpha: 1, clipPath: "inset(0%)" });
    if (labelsBox) gsap.set(labelsBox, { autoAlpha: 1 });
    return () => { gsap.set([...panels, wrap, ...items], { clearProps: "all" }); };
  }
  let spin, drag, intro, obs, splits = [], dead = false, lastW = innerWidth;
  const proxy = document.createElement("div");
  function build(lines) {
    const r = innerWidth * 0.5, wrapP = gsap.utils.wrap(0, 1), span = innerWidth * 3;
    let start = 0, ready = false;
    panels.forEach((p) => (p.style.transformOrigin = `50% 50% ${-r}px`));
    spin = gsap.fromTo(panels, { rotationY: (i) => (i * 360) / panels.length }, { rotationY: "-=360", duration: 30, ease: "none", repeat: -1 });
    spin.progress(1000);
    drag = Draggable.create(proxy, {
      trigger: wrap, type: "x", inertia: true, allowNativeTouchScrolling: true,
      onPress() { if (!ready) return; gsap.to(items, { clipPath: "inset(5%)", duration: 0.3, ease: "power4.out", overwrite: "auto" }); gsap.killTweensOf(spin); spin.timeScale(0); start = spin.progress(); },
      onDrag() { if (ready) spin.progress(wrapP(start + (this.startX - this.x) / span)); },
      onThrowUpdate() { if (ready) spin.progress(wrapP(start + (this.startX - this.x) / span)); },
      onRelease() { if (!ready) return; if (!this.tween?.isActive()) gsap.to(spin, { timeScale: 1, duration: 0.1 }); gsap.to(items, { clipPath: "inset(0%)", duration: 0.5, ease: "power4.out", overwrite: "auto" }); },
      onThrowComplete() { if (ready) gsap.to(spin, { timeScale: 1, duration: 0.1 }); },
    })[0];
    intro = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 80%", end: "bottom top", toggleActions: "play resume play play" }, defaults: { ease: "expo.inOut" }, onComplete: () => { ready = true; } });
    intro.fromTo(spin, { timeScale: 15 }, { timeScale: 1, duration: 2 })
      .fromTo(wrap, { autoAlpha: 0, scale: 0.5, rotation: 12 }, { autoAlpha: 1, scale: 1, rotation: 5, duration: 1.2 }, "<")
      .fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1, stagger: { amount: 0.8, from: "random" } }, "<");
    if (lines.length) intro.to(lines, { yPercent: 0, duration: 1.05, ease: "osmo", stagger: 0.075, onComplete: () => gsap.set(lines, { clearProps: "willChange,transform" }) }, "<");
    // Spins as fast as the wheel or touch speed, then settles back to 1x in its own direction over 1.2s
    obs = Observer.create({
      target: window, type: "wheel,scroll,touch",
      onChangeY: (s) => {
        if (!ready) return;
        const v = gsap.utils.clamp(-60, 60, s.velocityY * 0.005);
        spin.timeScale(v);
        gsap.fromTo({ value: v }, { value: v }, { value: v < 0 ? -1 : 1, duration: 1.2, onUpdate() { spin.timeScale(this.targets()[0].value); } });
      },
    });
  }
  function teardown() {
    spin?.kill(); drag?.kill(); obs?.kill(); obs = null;
    if (intro) { intro.scrollTrigger?.kill(); intro.kill(); intro = null; }
    gsap.set(panels, { clearProps: "transform" });
  }
  const splitLabels = (atRest) => {
    splits.forEach((s) => s.revert());
    splits = labels.map((l) => new SplitText(l, { type: "lines", mask: "lines" }));
    const lines = splits.flatMap((s) => s.lines);
    if (labelsBox) gsap.set(labelsBox, { autoAlpha: 1 });
    gsap.set(lines, { yPercent: atRest ? 0 : 115 });
    return lines;
  };
  build(splitLabels(false));
  let rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (dead || innerWidth === lastW) return; lastW = innerWidth; teardown(); build(splitLabels(true)); ScrollTrigger.refresh(); }, 200); };
  const onLeave = () => { obs?.kill(); obs = null; };
  addEventListener("resize", onResize);
  addEventListener("kk:leave", onLeave);
  return () => { dead = true; clearTimeout(rt); teardown(); splits.forEach((s) => s.revert()); removeEventListener("resize", onResize); removeEventListener("kk:leave", onLeave); if (labelsBox) gsap.set(labelsBox, { clearProps: "opacity,visibility" }); };
});
