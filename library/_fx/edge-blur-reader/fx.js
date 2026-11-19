// Inside a reading window pinned to the screen, long text rises from below and exits upward, and lines within the window’s top and bottom edge bands turn transparent and blur —
// Only the line at the window’s center is sharp — the Reading Spot. Blur is re-measured per line every frame so the band stays proportional to window height even when text length or window height changes
(() => {
  kfFx.register("edge-blur-reader", (el, { options, reduce, scroller }) => {
    const win = el.querySelector('[data-fx-part="window"]');
    const body = win && win.querySelector('[data-fx-part="body"]');
    if (!win || !body || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const band = +(options.band ?? 0.22), blur = +(options.blur ?? 8), fadeTail = +(options.fade ?? 0.35);
    const min = +(options.min ?? 768);
    // The title to fade out (optional) is inside the panel or the next sibling — for when the title sits beside the reading panel like the original
    const fadeEl = el.querySelector('[data-fx-part="fade"]') || el.parentElement?.querySelector(':scope > [data-fx-part="fade"], :scope > * > [data-fx-part="fade"]');
    const linesOf = () => body.querySelectorAll('[data-fx-part="line"]');
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px)`, () => {
      const winTop = () => parseFloat(getComputedStyle(win).top) || 0;
      const travel = () => win.clientHeight + body.offsetHeight;
      const size = () => { el.style.height = `${win.clientHeight + travel()}px`; };
      size();
      ScrollTrigger.addEventListener("refreshInit", size);
      const move = gsap.fromTo(body, { y: () => win.clientHeight }, {
        y: () => -body.offsetHeight, ease: "none",
        scrollTrigger: { trigger: win, ...(scroller && { scroller }), start: () => `top ${winTop()}px`, end: () => `+=${travel()}`, scrub: true, invalidateOnRefresh: true },
      });
      const fade = fadeEl ? gsap.fromTo(fadeEl, { opacity: 1 }, {
        opacity: 0, ease: "none", immediateRender: false,
        scrollTrigger: { trigger: win, ...(scroller && { scroller }), start: () => move.scrollTrigger.end - innerHeight * fadeTail, end: () => move.scrollTrigger.end, scrub: true, invalidateOnRefresh: true },
      }) : null;
      const paint = () => {
        const r = win.getBoundingClientRect(), edge = (r.bottom - r.top) * band;
        if (edge <= 0) return;
        for (const line of linesOf()) {
          const b = line.getBoundingClientRect(), mid = (b.top + b.bottom) / 2;
          let k = 0;
          if (mid < r.top + edge) k = (r.top + edge - mid) / edge;
          else if (mid > r.bottom - edge) k = (mid - (r.bottom - edge)) / edge;
          k = Math.min(Math.max(k, 0), 1);
          line.style.opacity = String(1 - k);
          line.style.filter = k > 0.01 ? `blur(${(k * blur).toFixed(1)}px)` : "";
        }
      };
      const watch = ScrollTrigger.create({
        trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top",
        onToggle: (st) => (st.isActive ? gsap.ticker.add(paint) : gsap.ticker.remove(paint)),
      });
      paint();
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(body);
      return () => {
        ro.disconnect();
        gsap.ticker.remove(paint);
        watch.kill();
        ScrollTrigger.removeEventListener("refreshInit", size);
        move.scrollTrigger?.kill(); move.kill();
        if (fade) { fade.scrollTrigger?.kill(); fade.kill(); gsap.set(fadeEl, { clearProps: "opacity" }); }
        gsap.set(body, { clearProps: "transform" });
        linesOf().forEach((l) => { l.style.opacity = ""; l.style.filter = ""; });
        el.style.height = "";
      };
    });
    return () => mm.revert();
  });
})();
