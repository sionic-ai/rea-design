// Ties the veil over the pasted photo to scroll — from when the section’s top edge has risen above the screen top by start, for screen height × span
// The curtain opacity goes 0→1 and the back blur goes 0→blur px. Scrolling back above the start line clears the curtain entirely (original onLeaveBack)
(() => {
  kfFx.register("pin-blur-veil", (el, { options, reduce, scroller }) => {
    const veil = el.querySelector('[data-fx-part="veil"]');
    if (!veil) return;
    const blur = +(options.blur ?? 10), span = +(options.span ?? 0.6);
    const set = (p) => {
      veil.style.opacity = p;
      veil.style.backdropFilter = veil.style.webkitBackdropFilter = `blur(${p * blur}px)`;
    };
    const clear = () => { veil.style.opacity = ""; veil.style.backdropFilter = veil.style.webkitBackdropFilter = ""; };
    if (reduce) { set(1); return clear; }
    gsap.registerPlugin(ScrollTrigger);
    const at = String(options.start ?? "-10%");
    const st = ScrollTrigger.create({
      trigger: el,
      ...(scroller && { scroller }),
      start: `top ${at.includes("%") || at.includes("px") ? at : `${at}px`}`,
      end: () => `+=${(scroller ? scroller.clientHeight : innerHeight) * span}`,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => set(self.progress),
      onLeaveBack: () => set(0),
    });
    return () => { st.kill(); clear(); };
  });
})();
