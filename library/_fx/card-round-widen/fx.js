// A card with its sides cropped and rounded (clip-path inset(0 64px round 45px)) comes in and widens into a full-width rectangle, then narrows again at the end.
// Original (Brand app) values: expands while within ± 140px of the card top (from 0 for the first card), and narrows for 300px after the card bottom touches the screen bottom — a straight line.
(() => {
  kfFx.register("card-round-widen", (el, { options, reduce, scroller }) => {
    const wide = +(options.inset ?? 64), round = +(options.round ?? 45);
    const wideN = +(options["inset-narrow"] ?? 16), roundN = +(options["round-narrow"] ?? 24), bp = +(options.bp || 750);
    // The original sets the expand and narrow lengths at 1.4× and 3× of the spot above the first card (wide screen 100px · phone 68px) — hence the separate phone value
    const openW = +(options.open ?? 140), closeW = +(options.close ?? 300);
    const openN = +(options["open-narrow"] ?? openW * 0.68), closeN = +(options["close-narrow"] ?? closeW * 0.68);
    const target = scroller || window;
    const mq = matchMedia(`(max-width: ${bp}px)`);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const set = (k) => {
      const [x, r] = mq.matches ? [wideN, roundN] : [wide, round];
      el.style.clipPath = `inset(0 ${(x * k).toFixed(2)}px round ${(r * k).toFixed(2)}px)`;
    };
    if (reduce) { set(0); return () => el.style.removeProperty("clip-path"); }
    let top = 0, bottom = 0, raf = 0;
    const y = () => (scroller ? scroller.scrollTop : scrollY);
    const measure = () => {
      const r = el.getBoundingClientRect(), off = scroller ? scroller.getBoundingClientRect().top : 0;
      const vh = scroller ? scroller.clientHeight : innerHeight;
      top = r.top - off + y();
      bottom = top + el.offsetHeight - vh;
    };
    const draw = () => {
      raf = 0;
      const s = y();
      const open = mq.matches ? openN : openW, close = mq.matches ? closeN : closeW;
      // first: on — the Hero card unfolds from the top of the document (0) to open (original hero 0 → 1.4 × position above the card)
      const a = options.first === "on" ? 0 : Math.max(0, top - open), b = options.first === "on" ? open : top + open;
      // After the bottom range passes it narrows, before that it uses the value of the expand range — between the two ranges it stays fully expanded
      const k = s >= bottom ? clamp((s - bottom) / close) : 1 - clamp((s - a) / Math.max(1, b - a));
      set(k);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onResize = () => { measure(); onScroll(); };
    target.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    measure();
    draw();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      ro.disconnect();
      el.style.removeProperty("clip-path");
    };
  });
})();
