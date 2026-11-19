(() => {
  const SHAPES = {
    triangle: { d: "M200 50 L400 350 L0 350 Z", cover: 3.4 },
    diamond: { d: "M200 0 L400 200 L200 400 L0 200 Z", cover: 2.1 },
    arch: { d: "M0 350 L0 250 A200 200 0 0 1 400 250 L400 350 Z", cover: 3 },
    stairs: { d: "M50 65 L150 65 L150 155 L250 155 L250 245 L350 245 L350 335 L50 335 Z", cover: 4.6 },
  };
  const NAMES = Object.keys(SHAPES), KEY = "fx-shape-portal";
  const path = (d, s, spin, cx, cy) => {
    const r = (spin * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
    const pt = (x, y) => { const u = (x - 200) * s, v = (y - 200) * s; return `${(cx + u * co - v * si).toFixed(2)} ${(cy + u * si + v * co).toFixed(2)}`; };
    return d.replace(/([ML])(\s*-?[\d.]+)\s+(-?[\d.]+)/g, (_, c, x, y) => `${c}${pt(+x, +y)}`)
      .replace(/A(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(\d)\s+(\d)\s+(-?[\d.]+)\s+(-?[\d.]+)/g, (_, rx, ry, rot, la, sw, x, y) => `A${(rx * s).toFixed(2)} ${(ry * s).toFixed(2)} ${+rot + spin} ${la} ${sw} ${pt(+x, +y)}`);
  };
  const geo = (a, b, ease) => { const e = gsap.parseEase(ease); return (p) => (a * Math.pow(b / a, e(p)) - a) / (b - a); };

  kfFx.register("shape-portal-page", (el, { options, reduce }) => {
    const speed = +(options.speed ?? 1);
    if (reduce || !speed) return;
    const backdrop = document.querySelector('[data-fx-part="backdrop"]');
    const pick = () => {
      if (options.shape && options.shape !== "cycle" && SHAPES[options.shape]) return options.shape;
      const i = (Number(sessionStorage.getItem(KEY)) + 1) % NAMES.length || 0;
      sessionStorage.setItem(KEY, String(i));
      return NAMES[i];
    };
    const geom = () => {
      const w = innerWidth, h = innerHeight, top = el.getBoundingClientRect().top;
      return { w, h, big: Math.max(w, h), small: Math.min(w, h), cx: w / 2, cy: h / 2 - top };
    };
    const paint = (name) => { if (!backdrop) return; NAMES.forEach((n) => backdrop.classList.remove(`fx-paint-${n}`)); backdrop.classList.add(`fx-paint-${name}`); };
    let tl = null;
    const draw = (shape, st, g) => { const s = (g.big * st.size * (g.small / g.big)) / 400; el.style.clipPath = `path("${path(shape.d, s, st.spin, g.cx, g.cy)}")`; };
    const finish = () => { tl?.kill(); tl = null; el.style.clipPath = ""; gsap.set(el, { clearProps: "transform,transformOrigin,willChange" }); };

    // Entering — the opened page rises from a small hole at the bottom and opens until it covers the screen
    const name = pick(), shape = SHAPES[name], g = geom();
    const cover = (shape.cover * 1.04 * g.big) / g.small;
    paint(name);
    const st = { size: 0.6, spin: -90 };
    gsap.set(el, { willChange: "transform, clip-path", y: g.h, scale: 0.9, transformOrigin: `${g.cx}px ${g.cy}px` });
    draw(shape, st, g);
    tl = gsap.timeline({ onUpdate: () => draw(shape, st, g), onComplete: finish }).timeScale(speed)
      .to(el, { y: 0, duration: 0.8, ease: "power2.inOut" }, 0.4)
      .to(el, { scale: 1, duration: 0.45, ease: "power2.inOut" }, 0.95)
      .to(st, { size: cover, duration: 0.4, ease: geo(0.6, cover, "power1.in") }, 0.95)
      .to(st, { spin: 0, duration: 1, ease: "power2.out" }, 0.4);

    // Exit — clicking a link to another page shrinks into a hole, spins up and out, then goes to that address
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      finish();
      const og = geom(), out = SHAPES[NAMES[Number(sessionStorage.getItem(KEY)) || 0]] || shape;
      const big = (out.cover * 1.04 * og.big) / og.small, s2 = { size: big, spin: 0 };
      gsap.set(el, { willChange: "transform, clip-path", transformOrigin: `${og.cx}px ${og.cy}px` });
      tl = gsap.timeline({ onUpdate: () => draw(out, s2, og), onComplete: () => location.assign(url.href) }).timeScale(speed)
        .to(el, { scale: 0.9, duration: 0.9, ease: "power2.inOut" }, 0)
        .to(s2, { size: 0.6, duration: 0.9, ease: geo(big, 0.6, "power1.out") }, 0)
        .to(s2, { spin: 90, duration: 0.8, ease: "power2.in" }, 0)
        .to(el, { y: -og.h, duration: 0.8, ease: "power2.inOut" }, 0.4);
    };
    document.addEventListener("click", onClick);
    const onShow = (e) => e.persisted && finish();
    addEventListener("pageshow", onShow);
    return () => { document.removeEventListener("click", onClick); removeEventListener("pageshow", onShow); finish(); };
  });
})();
