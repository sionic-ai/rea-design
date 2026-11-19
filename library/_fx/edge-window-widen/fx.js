// A narrow vertical window (photo) straddling the left outside of the section is bound to scroll and widens to full screen — the image inside returns from its offset position to place (0 0).
(() => {
  kfFx.register("edge-window-widen", (el, { options, reduce, scroller }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    if (!mask || !window.ScrollTrigger) return;
    const imgs = [...mask.querySelectorAll('[data-fx-part="img"]')];
    const full = { width: () => `${innerWidth}px`, height: () => `${innerHeight}px`, left: "0px", top: "0px" };
    if (reduce) { gsap.set(mask, full); if (imgs.length) gsap.set(imgs, { objectPosition: "0px 0px", backgroundPosition: "0px 0px" }); return () => gsap.set([mask, ...imgs], { clearProps: "all" }); }
    const trigger = options.trigger ? document.querySelector(options.trigger) || el : el;
    const st = {
      trigger, endTrigger: trigger, scroller,
      start: options.start || "200% top",
      end: options.end || "400% bottom",
      scrub: +(options.scrub ?? 1),
      invalidateOnRefresh: true,
    };
    const tweens = [gsap.fromTo(mask, {}, { ...full, ease: "none", scrollTrigger: { ...st } })];
    if (imgs.length) tweens.push(gsap.fromTo(imgs, {}, { objectPosition: "0px 0px", backgroundPosition: "0px 0px", ease: "none", scrollTrigger: { ...st } }));
    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      gsap.set([mask, ...imgs], { clearProps: "width,height,left,top,objectPosition,backgroundPosition" });
    };
  });
})();
