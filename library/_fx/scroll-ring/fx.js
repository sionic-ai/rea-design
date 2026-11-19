// pathLength instead of measuring line length=Set to 1 and cover with a single dash — an open-ended ring and a circle fill at the same ratio
(() => {
  kfFx.register("scroll-ring", (el, { options, reduce, scroller }) => {
    const SHAPES = "path, line, polyline, polygon, circle, ellipse, rect";
    const rings = el.matches(SHAPES) ? [el] : [...el.querySelectorAll('[data-fx-part="ring"]')];
    if (!rings.length) return;
    const had = rings.map((r) => r.getAttribute("pathLength"));
    rings.forEach((r) => { r.setAttribute("pathLength", "1"); r.style.strokeDasharray = "1"; });
    const from = Math.min(Math.max(+(options.from ?? 0), 0), 1), sign = options.dir === "back" ? -1 : 1;
    const set = (p) => rings.forEach((r) => { r.style.strokeDashoffset = String(sign * (1 - p)); });
    if (reduce) {
      set(1);
      return () => rings.forEach((r, i) => { r.style.strokeDasharray = r.style.strokeDashoffset = ""; had[i] == null ? r.removeAttribute("pathLength") : r.setAttribute("pathLength", had[i]); });
    }
    const box = scroller || null;
    // The original follows document top top → bottom bottom with no curve — distance scrolled ÷ (document height − viewport height)
    const draw = () => {
      const y = box ? box.scrollTop : scrollY;
      const span = box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - innerHeight;
      set(from + (1 - from) * (span > 0 ? Math.min(Math.max(y / span, 0), 1) : 0));
    };
    const target = box || window;
    target.addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    // If fonts, images, or pinned sections change the document height late, the ratio differs even at the same position
    const ro = new ResizeObserver(draw);
    ro.observe(box ? box.firstElementChild || box : document.body);
    draw();
    return () => {
      target.removeEventListener("scroll", draw);
      removeEventListener("resize", draw);
      ro.disconnect();
      rings.forEach((r, i) => { r.style.strokeDasharray = r.style.strokeDashoffset = ""; had[i] == null ? r.removeAttribute("pathLength") : r.setAttribute("pathLength", had[i]); });
    };
  });
})();
