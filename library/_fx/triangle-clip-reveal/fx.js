(() => {
  // A triangle (or polygon) color face spreads out from a single centroid point, one vertex at a time — chaining .14s expo.out per vertex in order,
  // Vertices listed in with stretch together with the previous one. On retract they converge to one point in reverse at .7x length.
  const parse = (s) => {
    const n = String(s || "").split(",").map((v) => +v.trim());
    if (n.length < 6 || n.length % 2 || n.some((v) => !Number.isFinite(v))) return null;
    const pts = [];
    for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    return pts;
  };
  const poly = (pts) => `polygon(${pts.map((p) => `${p.x}% ${p.y}%`).join(", ")})`;

  kfFx.register("triangle-clip-reveal", (el, { options, reduce, hover }) => {
    const shape = el.querySelector('[data-fx-part="shape"]') || el;
    const target = parse(options.points || shape.dataset.points);
    if (!target) return;
    const dur = +(options.dur ?? 0.14), delay = +(options.delay ?? 100) / 1000, at = +(options.at ?? 0.24);
    const on = options.on || "view";
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const together = new Set(String(options.with || "").split(",").map((v) => v.trim()).filter(Boolean).map(Number));
    const mid = target.reduce((a, p) => [a[0] + p[0] / target.length, a[1] + p[1] / target.length], [0, 0]);
    const pts = target.map(() => ({ x: mid[0], y: mid[1] }));
    const paint = () => (shape.style.clipPath = poly(pts));
    paint();
    let tl = null;
    const show = () => {
      tl?.kill();
      tl = gsap.timeline({ onUpdate: paint });
      target.forEach((p, i) => tl.to(pts[i], { x: p[0], y: p[1], duration: dur, ease }, together.has(i) ? "<" : ">"));
      return tl;
    };
    const hide = () => {
      tl?.kill();
      tl = gsap.timeline({ onUpdate: paint });
      for (let k = 0; k < target.length; k++) {
        const i = target.length - 1 - k;
        tl.to(pts[i], { x: mid[0], y: mid[1], duration: dur * 0.7, ease }, together.has(i + 1) ? "<" : ">");
      }
      return tl;
    };
    if (reduce) {
      if (on !== "hover") { target.forEach((p, i) => Object.assign(pts[i], { x: p[0], y: p[1] })); paint(); }
      return () => { shape.style.clipPath = ""; };
    }
    if (on === "hover") {
      // If the hand leaves during expansion, don’t cut it off — if the hand has already left once fully expanded, retract then
      const hit = el.querySelector('[data-fx-part="hit"]') || el;
      let want = false, busy = false, shown = false;
      const settle = () => {
        if (busy || want === shown) return;
        busy = true; shown = want;
        (shown ? show() : hide()).eventCallback("onComplete", () => { busy = false; settle(); });
      };
      const enter = () => { want = true; settle(); };
      const leave = () => { want = false; settle(); };
      const [a, b] = hover ? ["pointerenter", "pointerleave"] : ["touchstart", "touchend"];
      hit.addEventListener(a, enter, { passive: true });
      hit.addEventListener(b, leave, { passive: true });
      if (!hover) hit.addEventListener("touchcancel", leave, { passive: true });
      hit.addEventListener("focusin", enter);
      hit.addEventListener("focusout", leave);
      return () => {
        tl?.kill();
        hit.removeEventListener(a, enter); hit.removeEventListener(b, leave); hit.removeEventListener("touchcancel", leave);
        hit.removeEventListener("focusin", enter); hit.removeEventListener("focusout", leave);
        shape.style.clipPath = "";
      };
    }
    let timer = 0;
    const go = () => { timer = setTimeout(show, delay * 1000); };
    if (on === "load") { go(); return () => { clearTimeout(timer); tl?.kill(); shape.style.clipPath = ""; }; }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { el.classList.add("is-inview"); go(); io.disconnect(); }
    }, { threshold: at, rootMargin: options.margin || "0px" });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer); tl?.kill(); shape.style.clipPath = ""; };
  });
})();
