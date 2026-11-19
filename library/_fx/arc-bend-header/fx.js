// Once the scrolled distance passes at (80px), is-fx-scrolled applies — the arch plate appears in .45s and the items tilt into place on the arch in .8s.
// From item horizontal share i (0~1 of header width) downward 1.12·h·i(1−i) − 1.12·h/8, tilt atan(1.12·h(1−2i)/width). h = Head height / .72.
// After passing, it hides when scrolled down over 6px (is-fx-hidden, .65s) and shows when scrolled up over 6px.
(() => {
  kfFx.register("arc-bend-header", (el, { options, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const at = +(options.at ?? 80);
    const hide = options.hide !== "false";
    const k = +(options.bend ?? 1.12);
    const NS = "http://www.w3.org/2000/svg";
    const arc = document.createElementNS(NS, "svg");
    arc.setAttribute("class", "fx-arc");
    arc.setAttribute("viewBox", "0 0 100 100");
    arc.setAttribute("preserveAspectRatio", "none");
    arc.setAttribute("aria-hidden", "true");
    arc.innerHTML = '<path class="fx-arc__fill" d="M0,0 H100 V72 Q50,128 0,72 Z"/><path class="fx-arc__line" d="M100,72 Q50,128 0,72"/>';
    el.prepend(arc);
    const box = () => el.querySelector('[data-fx-part="bar"]') || el;
    const place = () => {
      const bar = box(), w = bar.clientWidth, h = bar.clientHeight / 0.72;
      el.style.setProperty("--fx-h", `${bar.clientHeight}px`);
      if (!w) return;
      const br = bar.getBoundingClientRect();
      items.forEach((it) => {
        // Measured at the position without transform — so re-measuring while tilted gives the same value
        const r = it.getBoundingClientRect(), cur = new DOMMatrixReadOnly(getComputedStyle(it).transform);
        const cx = r.left - br.left + r.width / 2 - cur.m41;
        const i = Math.min(1, Math.max(0, cx / w));
        it.style.setProperty("--fx-arc-y", `${(k * h * i * (1 - i) - k * h * 0.125).toFixed(1)}px`);
        it.style.setProperty("--fx-arc-r", `${((180 * Math.atan((k * h * (1 - 2 * i)) / w)) / Math.PI).toFixed(2)}deg`);
      });
    };
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let last = Math.max(0, pos()), raf = 0;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, pos()), down = y > at;
      el.classList.toggle("is-fx-scrolled", down);
      if (!down) el.classList.remove("is-fx-hidden");
      else if (hide && y > last + 6) el.classList.add("is-fx-hidden");
      else if (y < last - 6) el.classList.remove("is-fx-hidden");
      else return;
      last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    src.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(place);
    ro.observe(el);
    document.fonts?.ready.then(place);
    place();
    tick();
    return () => {
      src.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      ro.disconnect();
      arc.remove();
      el.classList.remove("is-fx-scrolled", "is-fx-hidden");
      el.style.removeProperty("--fx-h");
      items.forEach((it) => { it.style.removeProperty("--fx-arc-y"); it.style.removeProperty("--fx-arc-r"); });
    };
  });
})();
