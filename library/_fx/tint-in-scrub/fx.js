// A transparent section background is tied to scroll and fills with a single color, and once past halfway the text flips — the expert About section turning blue
(() => {
  kfFx.register("tint-in-scrub", (el, { options, reduce, scroller }) => {
    const color = options.color || "var(--kf-accent)";
    const room = +(options.room ?? 450), roomSp = +(options["room-sp"] ?? 200), flip = +(options.flip ?? 0.5);
    const box = scroller || window;
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    const paint = (op) => {
      el.style.backgroundColor = `color-mix(in srgb, ${color} ${(op * 100).toFixed(2)}%, transparent)`;
      el.classList.toggle("is-deep", op > flip);
    };
    if (reduce) { paint(1); return () => { el.style.backgroundColor = ""; el.classList.remove("is-deep"); }; }
    const head = options.head ? document.querySelector(options.head) : null;
    const tick = () => {
      const top = el.getBoundingClientRect().top + pos() - (scroller ? scroller.getBoundingClientRect().top : 0);
      const start = top - view();
      if (pos() <= start) { paint(0); return; }
      const wide = (scroller ? scroller.clientWidth : innerWidth) >= 1008;
      let op = (pos() - start) / Math.max(1, view() - (head ? head.offsetHeight : 0) + (wide ? room : roomSp));
      if (matchMedia("(hover: none)").matches) op *= 0.8;
      paint(Math.min(op, 1));
    };
    box.addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    tick();
    return () => { box.removeEventListener("scroll", tick); removeEventListener("resize", tick); el.style.backgroundColor = ""; el.classList.remove("is-deep"); };
  });
})();
