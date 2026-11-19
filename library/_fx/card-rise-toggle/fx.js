// When the card group’s head touches the bottom edge of the screen, the cards float up from below one after another, and when the group leaves the screen (above or below) they sink back in reverse —
// Plays again every time it re-enters (toggleActions play reverse play reverse). One timeline per group, so the stagger is counted only within a group
(() => {
  kfFx.register("card-rise-toggle", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const parts = el.querySelectorAll('[data-fx-part="item"]');
    const items = parts.length ? [...parts] : [...el.children];
    if (!items.length || reduce) return;
    const y = options.y ?? "60", dist = /[a-z%]$/i.test(y) ? y : +y;
    const tween = gsap.fromTo(items, { opacity: 0, y: dist }, {
      opacity: 1, y: 0, duration: +(options.dur ?? 0.5), stagger: +(options.stagger ?? 0.5),
      ease: kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power3.out"),
      scrollTrigger: { trigger: el, start: options.start || "top 100%", toggleActions: options.actions || "play reverse play reverse", ...(scroller && { scroller }) },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); const left = items.filter((n) => n.isConnected); if (left.length) gsap.set(left, { clearProps: "opacity,transform" }); };
  });
})();
