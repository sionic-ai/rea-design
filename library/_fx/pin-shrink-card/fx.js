// Ties the full-bleed panel attached to the screen directly to scroll (no curve) and shrinks it to a tilted card size — width and height are changed directly so only where the photo in the panel is cropped shrinks
// Letters don’t grow or shrink (shrinking by scale would shrink the text inside the postcard too). The text chunk on the panel is pushed off screen at the same progress (original Brand Choose → postcard)
(() => {
  kfFx.register("pin-shrink-card", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const marker = el.querySelector('[data-fx-part="marker"]');
    if (reduce || !frame || !marker) return;
    const away = [...el.querySelectorAll('[data-fx-part="away"]')];
    const n = (k, d) => +(options[k] ?? d);
    const tilt = n("tilt", -5), push = n("away", 120);
    const size = {
      lg: [n("w", 32.8125), n("h", 29.0625), n("lift", -10)],
      md: [n("w-md", 22.40625), n("h-md", 25.3125), n("lift-md", 0)],
      sm: [n("w-sm", 13.5), n("h-sm", 15.1875), n("lift-sm", 5)],
    };
    const sm = matchMedia("(max-width: 767px)"), md = matchMedia("(max-width: 991px)");
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, width: innerWidth, height: innerHeight });

    function update() {
      const v = view();
      const vw = v.width, vh = v.height;
      const p = Math.min(1, Math.max(0, (vh - (marker.getBoundingClientRect().top - v.top)) / vh));
      const [wr, hr, lift] = sm.matches ? size.sm : md.matches ? size.md : size.lg;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const w = vw - (vw - wr * rem) * p, h = vh - (vh - hr * rem) * p;
      frame.style.width = `${w}px`;
      frame.style.height = `${h}px`;
      frame.style.transform = `translateY(${(vh - h) / 2 + (lift / 100) * vh * p}px) rotate(${tilt * p}deg)`;
      const wide = !md.matches;
      away.forEach((a) => {
        const dir = +(a.dataset.dir || 1);
        a.style.transform = wide ? `translateX(${dir * push * p}vw)` : `translateY(${100 * p}vh)`;
      });
      el.style.setProperty("--fx-p", p.toFixed(4));
    }

    const src = scroller || window;
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => {
      src.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      ro.disconnect();
      frame.style.removeProperty("width");
      frame.style.removeProperty("height");
      frame.style.removeProperty("transform");
      away.forEach((a) => a.style.removeProperty("transform"));
      el.style.removeProperty("--fx-p");
    };
  });
})();
