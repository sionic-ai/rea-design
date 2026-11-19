// Ink bleed text: the text panel is duplicated five times and layered on a screen-fixed film, and each film gets an SVG dilate filter (.06 · .25 · .5 · .75 · 1px + blur).
// The curtain shows only through stamps left where the cursor passed (circles of radius 303·90·48·25·13px, blur 8) — the nearer the cursor, the thicker the curtains that overlap, so the text bleeds like ink.
// A stamp is placed each time movement exceeds 18px, up to 35 per layer (oldest erased first). While scrolling the layer is hidden, and when scrolling stops it is put back in place.
// On touch screens each layer has one stamp following a Lissajous path (horizontal .5±.3 · vertical .45±.22, per-frame t += .008) it spins on its own — Name’s intro text
(() => {
  let uid = 0;
  const NS = "http://www.w3.org/2000/svg";
  const RINGS = [
    { r: 303, dilate: 0.06, blur: 0.06 },
    { r: 90, dilate: 0.25, blur: 0.13 },
    { r: 48, dilate: 0.5, blur: 0.2 },
    { r: 25, dilate: 0.75, blur: 0.25 },
    { r: 13, dilate: 1, blur: 0.33 },
  ];
  kfFx.register("ink-bleed-text", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const id = `fx-ibt-${++uid}`;
    const gap = +(options.gap || 18), most = +(options.max || 35), soft = +(options.soft ?? 8);
    const scale = +(options.scale || 1);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "fx-ibt-defs");
    const defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);
    const softF = document.createElementNS(NS, "filter");
    softF.id = `${id}-soft`;
    ["x", "y"].forEach((k) => softF.setAttribute(k, "-20%"));
    ["width", "height"].forEach((k) => softF.setAttribute(k, "140%"));
    softF.innerHTML = `<feGaussianBlur stdDeviation="${soft}"/>`;
    defs.appendChild(softF);
    const layers = RINGS.map((ring, i) => {
      const f = document.createElementNS(NS, "filter");
      f.id = `${id}-f${i}`;
      f.setAttribute("color-interpolation-filters", "sRGB");
      ["x", "y"].forEach((k) => f.setAttribute(k, "-30%"));
      ["width", "height"].forEach((k) => f.setAttribute(k, "160%"));
      f.innerHTML = `<feMorphology operator="dilate" radius="${ring.dilate * scale}" in="SourceGraphic" result="m"/><feGaussianBlur stdDeviation="${ring.blur * scale}" in="m"/>`;
      const m = document.createElementNS(NS, "mask");
      m.id = `${id}-m${i}`;
      m.setAttribute("maskUnits", "userSpaceOnUse");
      ["x", "y"].forEach((k) => m.setAttribute(k, "0"));
      ["width", "height"].forEach((k) => m.setAttribute(k, "9999"));
      const g = document.createElementNS(NS, "g");
      g.setAttribute("filter", `url(#${id}-soft)`);
      m.appendChild(g);
      defs.append(f, m);
      const veil = document.createElement("div");
      veil.className = "fx-ibt-veil";
      veil.setAttribute("aria-hidden", "true");
      veil.style.zIndex = String(i + 1);
      veil.style.filter = `url(#${id}-f${i})`;
      veil.style.mask = veil.style.webkitMask = `url(#${id}-m${i})`;
      return { ring, veil, stamps: g, clone: null };
    });
    document.body.append(svg, ...layers.map((l) => l.veil));

    const build = () => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      for (const l of layers) {
        l.clone?.remove();
        const c = el.cloneNode(true);
        c.removeAttribute("data-fx");
        c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        c.querySelectorAll("a, button, time, input, [data-fx-part='skip']").forEach((n) => { n.style.visibility = "hidden"; });
        Object.assign(c.style, { position: "absolute", top: "0", left: "0", margin: "0", width: `${r.width}px`, transform: `translate(${r.left}px, ${r.top}px)`, color: cs.color, font: cs.font, letterSpacing: cs.letterSpacing });
        l.clone = c;
        l.veil.appendChild(c);
      }
    };
    const place = () => {
      const r = el.getBoundingClientRect();
      for (const l of layers) if (l.clone) l.clone.style.transform = `translate(${r.left}px, ${r.top}px)`;
    };

    let lx = -9999, ly = -9999, on = true;
    const stamp = (x, y) => {
      if (Math.hypot(x - lx, y - ly) < gap) return;
      lx = x; ly = y;
      for (const l of layers) {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", `translate(${x},${y})`);
        const e = document.createElementNS(NS, "ellipse");
        e.setAttribute("rx", l.ring.r);
        e.setAttribute("ry", l.ring.r);
        e.setAttribute("fill", "white"); /* Not skin: mask’s ‹visible› fill */
        g.appendChild(e);
        l.stamps.appendChild(g);
        if (l.stamps.children.length > most) l.stamps.firstChild.remove();
      }
    };
    const clear = () => { layers.forEach((l) => { l.stamps.innerHTML = ""; }); lx = ly = -9999; };

    let hidden = false, settle = 0;
    const hide = () => {
      if (!hidden) { hidden = true; layers.forEach((l) => { l.veil.style.visibility = "hidden"; }); }
      clearTimeout(settle);
      if (!("onscrollend" in window)) settle = setTimeout(show, 150);
    };
    const show = () => {
      if (!hidden) return;
      hidden = false;
      place();
      layers.forEach((l) => { l.veil.style.visibility = ""; });
    };
    let rt = 0;
    const resize = () => { clearTimeout(rt); rt = setTimeout(build, 100); };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    build();
    document.fonts?.ready.then(build);
    addEventListener("scroll", hide, { passive: true });
    addEventListener("scrollend", show, { passive: true });
    addEventListener("resize", resize, { passive: true });

    let raf = 0;
    const move = (e) => { if (on) stamp(e.clientX, e.clientY); };
    const pause = () => { on = false; clear(); };
    const resume = () => { on = true; };
    if (hover) addEventListener("pointermove", move, { passive: true });
    else {
      const drift = layers.map((l) => {
        const g = document.createElementNS(NS, "g");
        const e = document.createElementNS(NS, "ellipse");
        e.setAttribute("rx", l.ring.r);
        e.setAttribute("ry", l.ring.r);
        e.setAttribute("fill", "white"); /* Not skin: mask’s ‹visible› fill */
        g.appendChild(e);
        l.stamps.appendChild(g);
        return g;
      });
      let t = 0;
      const tick = () => {
        t += 0.008;
        const cx = innerWidth * (0.5 + 0.3 * Math.sin(t)), cy = innerHeight * (0.45 + 0.22 * Math.cos(t * 0.7));
        drift.forEach((g) => g.setAttribute("transform", `translate(${cx},${cy})`));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    el.addEventListener("fx:pause", pause);
    el.addEventListener("fx:resume", resume);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt); clearTimeout(settle);
      ro.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("scroll", hide);
      removeEventListener("scrollend", show);
      removeEventListener("resize", resize);
      el.removeEventListener("fx:pause", pause);
      el.removeEventListener("fx:resume", resume);
      layers.forEach((l) => l.veil.remove());
      svg.remove();
    };
  });
})();
