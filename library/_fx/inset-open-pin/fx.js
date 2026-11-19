// Opening-screen pinned section: pin the section to the screen (+=140%, scrub .6) The screen folded to 35% on all sides opens up to 13% while the four-corner frame grows from 30% → 74%.
// Background goes from a dark panel to a light panel, and at the end top and bottom bands close and lead into the next section’s darkness — Brand company video
(() => {
  kfFx.register("inset-open-pin", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const screen = el.querySelector('[data-fx-part="screen"]');
    if (!screen || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const wall = q("wall"), frame = q("frame"), head = q("head"), bar = q("progress"), ctrl = q("controls"), bands = q("band");
    const from = +(options.from ?? 35), to = +(options.to ?? 13), frameTo = options.frame || "74%";
    const shut = `inset(${to}% ${to}% ${to}% ${to}% round 6px)`;
    if (reduce) {
      gsap.set(screen, { clipPath: shut });
      if (wall.length) gsap.set(wall, { opacity: 1 });
      if (frame.length) gsap.set(frame, { width: frameTo, height: frameTo });
      return () => gsap.set([screen, ...wall, ...frame], { clearProps: "all" });
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: options.end || "+=140%", scrub: +(options.scrub ?? 0.6), pin: stage, invalidateOnRefresh: true } });
      if (wall.length) tl.fromTo(wall, { opacity: 0 }, { opacity: 1, ease: "power2.inOut", duration: 0.2 }, 0);
      tl.fromTo(screen, { clipPath: `inset(${from}% ${from}% ${from}% ${from}% round 8px)` }, { clipPath: shut, ease: "power2.inOut", duration: 0.42 }, 0.16);
      if (frame.length) tl.fromTo(frame, { width: "30%", height: "30%" }, { width: frameTo, height: frameTo, ease: "power2.inOut", duration: 0.42 }, 0.16);
      if (head.length) tl.to(head, { autoAlpha: 0, y: -28, ease: "power2.in", duration: 0.18 }, 0.22);
      if (bar.length) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
      if (ctrl.length) tl.fromTo(ctrl, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.14 }, 0.58).to(ctrl, { autoAlpha: 0, y: 10, ease: "power1.in", duration: 0.1 }, 0.78);
      if (bands.length) tl.fromTo(bands, { scaleY: 0 }, { scaleY: 1, ease: "power2.in", duration: 0.22 }, 0.78);
      if (frame.length) tl.to(frame, { autoAlpha: 0, ease: "power1.in", duration: 0.14 }, 0.8);
    }, el);
    return () => ctx.revert();
  });
})();
