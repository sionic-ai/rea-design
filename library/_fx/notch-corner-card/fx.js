(() => {
  // Original (Framer work card variant Start X → X, X = No TR · No BL · Diagonal · None): background-colored notch pieces sit at the four corners of the photo card,
  // When a card first becomes visible, a piece of that shape grows from 0 → 1 around the outer corner in .6s cubic-bezier(.6,0,.05,1), cutting a groove.
  // On hover all pieces shrink to 0 into a whole rectangle (.4s, CSS), and return on release. With every set, it cycles to the next type every that many seconds
  const LOOKS = { "no-tr": ["tl", "br", "bl"], "no-bl": ["tl", "tr", "br"], diagonal: ["tr", "bl"], none: [] };
  kfFx.register("notch-corner-card", (el, { options, reduce, scroller }) => {
    const corners = [...el.querySelectorAll('[data-fx-part="corner"]')];
    if (!corners.length) return;
    const order = (options.cycle || options.look || "no-tr").split(",").map((s) => s.trim()).filter((s) => LOOKS[s]);
    if (!order.length) return;
    let k = 0;
    const every = +(options.every ?? 0);
    const set = (look) => {
      const on = LOOKS[look];
      corners.forEach((c) => c.classList.toggle("is-fx-on", on.includes(c.dataset.key)));
      el.dataset.fxLook = look;
    };
    const off = () => { corners.forEach((c) => c.classList.remove("is-fx-on")); delete el.dataset.fxLook; };
    if (reduce || options.appear === "off") { set(order[0]); return off; }
    let iv = 0, rt = 0, seen = false;
    const io = new IntersectionObserver((e) => {
      const vis = e.some((x) => x.isIntersecting);
      if (vis && !seen) { seen = true; set(order[0]); rt = setTimeout(() => el.classList.add("is-fx-ready"), 650); }
      clearInterval(iv);
      if (vis && every > 0 && order.length > 1) iv = setInterval(() => { k = (k + 1) % order.length; set(order[k]); }, every * 1000);
    }, { root: scroller || null, threshold: +(options.amount ?? 0.2) });
    io.observe(el);
    return () => { clearInterval(iv); clearTimeout(rt); io.disconnect(); off(); el.classList.remove("is-fx-ready"); };
  });
})();
