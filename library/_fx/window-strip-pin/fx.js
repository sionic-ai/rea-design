(() => {
  // Pinned landscape window — pins the panel row (track) at top px of the screen, and while the panels (item) inside scroll by the row width they flow left without a curve (each panel xPercent −100×(panel count−1)).
  // When a blank panel (window) is placed between panels, a full-width photo (window) stacked behind the strip shows through that window. The top photo is clipped from the right according to how far the panel has pushed (clip-path inset right %)
  // The next photo is revealed, and each time the clip passes step %, the next photo is clipped in turn (the last photo remains) — clip % = |pushed distance| ÷ (panel width/100) ÷ 2 − lead.
  // If a head exists, pin it at head-top px for the same distance without a placeholder gap. On narrow screens and below, panels stack vertically and flow upward while photos are clipped from the bottom.
  kfFx.register("window-strip-pin", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const items = [...track.querySelectorAll('[data-fx-part="item"]')];
    const wins = [...track.querySelectorAll('[data-fx-part="window"]')];
    const head = el.querySelector('[data-fx-part="head"]');
    // Overlapping photos: the earlier one sits on top — the last photo lies at the bottom and stays to the end
    wins.forEach((w, k) => (w.style.zIndex = wins.length - k));
    const unstack = () => wins.forEach((w) => { w.style.zIndex = ""; w.style.clipPath = ""; });
    if (items.length < 2 || reduce || !window.ScrollTrigger) return unstack;
    gsap.registerPlugin(ScrollTrigger);
    const num = (k, d) => +(options[k] ?? d);
    const narrow = num("narrow", 767);
    // The original row width is the sum of panel widths plus the first panel’s left margin — scroll by that minus the screen width (even for vertical panels the original measures by the sum of horizontal widths)
    const span = () => items.reduce((s, it) => s + it.offsetWidth, 0) + (parseFloat(getComputedStyle(items[0]).marginLeft) || 0) - innerWidth;
    const mm = gsap.matchMedia();
    const build = (wide) => {
      const top = wide ? num("top", 375) : num("narrow-top", 380);
      const headTop = wide ? num("head-top", 75) : num("narrow-head-top", 45);
      const lead = wide ? num("lead", 5) : num("narrow-lead", 10);
      const step = wide ? num("step", 100) : num("narrow-step", 110);
      const axis = wide ? "xPercent" : "yPercent";
      const clip = (v) => (wide ? `inset(0% ${v}% 0% 0%)` : `inset(0% 0% ${v}% 0%)`);
      const paint = () => {
        const size = wide ? items[0].offsetWidth : items[0].offsetHeight;
        const moved = Math.abs((+gsap.getProperty(items[0], axis) || 0) * size / 100);
        const p = moved / (items[0].offsetWidth / 100) / 2 - lead;
        wins.forEach((w, k) => {
          if (k === wins.length - 1 && k > 0) { w.style.clipPath = clip(0); return; }
          w.style.clipPath = k === 0 ? clip(p) : clip(p > step * k ? p - step * k : 0);
        });
      };
      const st = { ...(scroller && { scroller }), start: `top top+=${top}`, end: () => "+=" + span(), invalidateOnRefresh: true, anticipatePin: 1 };
      gsap.to(items, { [axis]: -100 * (items.length - 1), ease: "none", onUpdate: paint, scrollTrigger: { trigger: track, pin: true, pinSpacing: true, scrub: true, ...st } });
      if (head) ScrollTrigger.create({ trigger: head, pin: true, pinSpacing: false, ...st, start: `top top+=${headTop}` });
      paint();
      return () => wins.forEach((w) => (w.style.clipPath = ""));
    };
    mm.add(`(min-width: ${narrow + 1}px)`, () => build(true));
    mm.add(`(max-width: ${narrow}px)`, () => build(false));
    return () => { mm.revert(); unstack(); };
  });
})();
