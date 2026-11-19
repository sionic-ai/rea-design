// Draws two thin lines on a screen-fixed SVG, from the label’s (the attached element) bottom-left and bottom-right corners to the other element’s (to) top-left and top-right corners,
// Redrawn every time the position changes from scroll · window size · font so two elements stay connected — a line that pulls the eye from the Hero label down to the photo just below.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("corner-link-lines", (el, { options, scroller }) => {
    const to = options.to && document.querySelector(options.to);
    if (!to) return;
    const min = +(options.min ?? 651);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fx-cll");
    svg.setAttribute("aria-hidden", "true");
    const a = document.createElementNS(NS, "line"), b = document.createElementNS(NS, "line");
    svg.append(a, b);
    document.body.append(svg);
    const mq = matchMedia(`(min-width: ${min}px)`);
    let raf = 0;
    const draw = () => {
      raf = 0;
      svg.style.display = mq.matches ? "" : "none";
      if (!mq.matches) return;
      const f = el.getBoundingClientRect(), t = to.getBoundingClientRect();
      a.setAttribute("x1", f.left); a.setAttribute("y1", f.bottom); a.setAttribute("x2", t.left); a.setAttribute("y2", t.top);
      b.setAttribute("x1", f.right); b.setAttribute("y1", f.bottom); b.setAttribute("x2", t.right); b.setAttribute("y2", t.top);
    };
    const soon = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const target = scroller || window;
    target.addEventListener("scroll", soon, { passive: true });
    addEventListener("resize", soon);
    mq.addEventListener("change", soon);
    const ro = new ResizeObserver(soon);
    ro.observe(el);
    ro.observe(to);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", soon);
      removeEventListener("resize", soon);
      mq.removeEventListener("change", soon);
      ro.disconnect();
      svg.remove();
    };
  });
})();
