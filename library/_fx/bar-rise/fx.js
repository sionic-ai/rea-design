// On hover, bars of varied widths fill up separately from the cell bottom, on leave they slip out upward
(() => {
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  let uid = 0;
  kfFx.register("bar-rise", (el, { options, reduce, hover, scroller }) => {
    // touch: scroll — on touch devices, a cell stays open while its top edge is within the upper 70% of the screen (original ENTRY phone panel)
    const touchScroll = !hover && /scroll/.test(options.touch || "");
    if (!hover && !touchScroll) return;
    const count = Math.max(2, Math.round(+options.count || 8)), wide = Math.min(count, Math.round(+(options.wide ?? 2)));
    const [dMin, dMax] = String(options.dur ?? "0.2 0.45").split(/\s+/).map(Number);
    const lag = +(options.lag ?? 0.2);
    const ns = "http://www.w3.org/2000/svg", id = `fx-bar-goo-${++uid}`;
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "fx-bars"); svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    // As in the original, a sticky filter makes the bar tips blob together — removed when look: flat
    if (!/flat/.test(options.look || "")) svg.innerHTML = `<defs><filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></defs>`;
    const g = document.createElementNS(ns, "g");
    if (svg.querySelector("filter")) g.setAttribute("filter", `url(#${id})`);
    const rects = Array.from({ length: count }, () => { const r = document.createElementNS(ns, "rect"); r.setAttribute("y", 103); r.setAttribute("height", 100); g.append(r); return r; });
    svg.append(g);
    el.prepend(svg);
    const enter = () => {
      const mul = shuffle(Array.from({ length: count }, (_, i) => (i < wide ? 2 : 1)));
      const unit = 100 / mul.reduce((a, b) => a + b, 0);
      let x = 0;
      rects.forEach((r, i) => { gsap.killTweensOf(r); const w = mul[i] * unit; r.setAttribute("width", w + 0.05); r.setAttribute("x", x); x += w; });
      rects.forEach((r) => gsap.fromTo(r, { attr: { y: 103 } }, { attr: { y: 0 }, duration: reduce ? 0 : rnd(dMin, dMax), delay: reduce ? 0 : rnd(0, lag), ease: Math.random() > 0.5 ? "power4.out" : "power2.out" }));
    };
    const leave = () => rects.forEach((r) => { gsap.killTweensOf(r); gsap.to(r, { attr: { y: -103 }, duration: reduce ? 0 : rnd(dMin, dMax), ease: Math.random() > 0.5 ? "power4.inOut" : "power2.inOut" }); });
    if (touchScroll) {
      const zone = +(options.zone ?? 0.7), src = scroller || window;
      let open = false;
      const check = () => {
        const top = el.getBoundingClientRect().top, base = scroller ? scroller.getBoundingClientRect().top : 0, h = scroller ? scroller.clientHeight : innerHeight;
        const p = Math.min(1, Math.max(0, (top - base) / h)), now = p > 0 && p < zone;
        if (now !== open) { open = now; (now ? enter : leave)(); }
      };
      check();
      src.addEventListener("scroll", check, { passive: true });
      return () => { src.removeEventListener("scroll", check); gsap.killTweensOf(rects); svg.remove(); };
    }
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); gsap.killTweensOf(rects); svg.remove(); };
  });
})();
