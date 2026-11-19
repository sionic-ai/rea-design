// Pieces of the SVG decoration grow out horizontally in turn, tied to scroll — once grown they don’t shrink (life-design svgGrow)
(() => {
  kfFx.register("svg-grow-sweep", (el, { options, reduce, scroller }) => {
    const svg = el.querySelector("svg");
    if (!svg) return;
    const NS = "http://www.w3.org/2000/svg";
    const picked = [...svg.querySelectorAll('[data-fx-part="piece"]')];
    const items = (picked.length ? picked : [...svg.querySelectorAll("path,rect,circle,ellipse,polygon")]).filter((n) => !n.closest("defs,clipPath,mask,symbol,pattern"));
    if (!items.length) return;
    const right = options.origin === "right";
    const follow = +(options.follow ?? 0.25), span = +(options.span || 0.18);
    const startK = +(options.start ?? 0.07), endK = +(options.end ?? 0);
    const wraps = items.map((n) => {
      const g = document.createElementNS(NS, "g");
      n.parentNode.insertBefore(g, n);
      g.appendChild(n);
      Object.assign(g.style, { transformBox: "fill-box", transformOrigin: right ? "right center" : "left center" });
      if (reduce) return g;
      Object.assign(g.style, { opacity: 0, transform: "scaleX(0)", transition: `opacity ${follow}s linear, transform ${follow}s linear` });
      g.__grow = 0;
      return g;
    });
    if (reduce) return () => wraps.forEach((g) => { g.replaceWith(...g.childNodes); });
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const update = () => {
      const r = el.getBoundingClientRect(), top = r.top - (scroller ? scroller.getBoundingClientRect().top : 0);
      const start = vh() * startK, end = -r.height * endK;
      const p = Math.max(0, Math.min(1, (start - top) / (start - end || 1)));
      wraps.forEach((g, i) => {
        const a = i / wraps.length;
        let q = Math.max(0, Math.min(1, (p - a) / span));
        q = 1 - Math.pow(1 - q, 3);
        if (q <= g.__grow) return;
        g.__grow = q;
        g.style.opacity = q;
        g.style.transform = `scaleX(${q})`;
      });
    };
    const view = scroller || window;
    view.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      view.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      wraps.forEach((g) => g.replaceWith(...g.childNodes));
    };
  });
})();
