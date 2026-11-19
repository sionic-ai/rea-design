(() => {
  // The gooey look comes from one SVG blur plus alpha threshold filter — the disc inside the button and the mirror circle following the cursor are in the same filter, so they merge when near and separate when far
  const ACT = 'a[href], button, [role="button"], summary, input, select, textarea';
  const WELL = '[data-fx-part="well"]';
  let users = 0;

  const filterFor = (blur, cut) => {
    const id = `fx-goo-${blur}-${String(cut).replace(/[^0-9]/g, "")}`;
    if (document.getElementById(id)) return id;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="${blur}"/><feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 ${cut}"/></filter>`;
    document.body.append(svg);
    return id;
  };

  kfFx.register("goo-liquid-cursor", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const follow = reduce ? 1 : +(options.follow ?? 0.3);
    const lean = reduce ? 1 : +(options.mirror ?? 0.4);
    const reach = +(options.reach ?? 118);
    const push = +(options.push ?? 6);
    const size = +(options.size ?? 10);
    const near = +(options.near ?? 26);
    const blur = +(options.blur ?? 11);
    const cut = +(options.cut ?? -9);
    // Only the big button needs a wider blur so the disc and mirror circle stretch and merge — blur and cut can be set separately on a button with same-named attributes
    const own = (node) => {
      const o = {};
      for (const part of (node.getAttribute("data-fx-goo-liquid-cursor") || "").split(";")) {
        const i = part.indexOf(":");
        if (i > 0) o[part.slice(0, i).trim()] = part.slice(i + 1).trim();
      }
      return filterFor(+(o.blur ?? blur), +(o.cut ?? cut));
    };

    const cursor = document.createElement("div");
    cursor.className = "fx-goo-cursor";
    cursor.setAttribute("aria-hidden", "true");
    const dot = document.createElement("div");
    dot.className = "fx-goo-cursor__dot";
    cursor.append(dot);
    el.append(cursor);
    users++;
    document.documentElement.classList.add("fx-goo-on");

    let wells = [];
    let dirty = true;
    const drop = (w) => {
      w.goo.remove();
      w.el.classList.remove("is-liquid");
      w.el.style.removeProperty("--fx-liquid-x");
      w.el.style.removeProperty("--fx-liquid-y");
    };
    const scan = () => {
      const found = new Set(el.querySelectorAll(WELL));
      wells = wells.filter((w) => (found.has(w.el) ? true : (drop(w), false)));
      for (const node of found) {
        if (wells.some((w) => w.el === node)) continue;
        const goo = document.createElement("div");
        goo.className = "fx-goo";
        goo.style.filter = `url(#${own(node)})`;
        const disc = document.createElement("div");
        disc.className = "fx-goo__disc";
        const mirror = document.createElement("div");
        mirror.className = "fx-goo__mirror";
        goo.append(disc, mirror);
        node.prepend(goo);
        wells.push({ el: node, goo, mirror, rx: 0, ry: 0, active: false });
      }
    };
    const mo = new MutationObserver((list) => {
      if (list.some((m) => [...m.addedNodes, ...m.removedNodes].some((n) => n.nodeType === 1 && !n.classList.contains("fx-goo")))) dirty = true;
    });
    mo.observe(el, { childList: true, subtree: true });

    const aim = { x: innerWidth / 2, y: innerHeight / 2 };
    const at = { ...aim };
    let shown = false;
    const onMove = (e) => {
      aim.x = e.clientX;
      aim.y = e.clientY;
      // Over links without liquid, hide the dot and show a hand cursor — original is-pointer
      const hit = e.target instanceof Element ? e.target.closest(ACT) : null;
      cursor.classList.toggle("is-pointer", !!hit && !hit.closest(WELL) && !hit.querySelector(WELL));
      if (!shown) { shown = true; cursor.classList.add("is-shown"); }
    };
    const onLeave = () => cursor.classList.remove("is-shown");
    const onEnter = () => shown && cursor.classList.add("is-shown");
    addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const tick = () => {
      if (dirty) { dirty = false; scan(); }
      at.x += (aim.x - at.x) * follow;
      at.y += (aim.y - at.y) * follow;
      dot.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%)`;
      let any = false;
      for (const w of wells) {
        const r = w.el.getBoundingClientRect();
        // Buttons in invisible sections (transparent or hidden) don’t react even when the pointer passes over
        const seen = r.width > 0 && (w.el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true);
        const dx = aim.x - (r.left + r.width / 2);
        const dy = aim.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        const on = shown && seen && d < Math.max(r.width, r.height) / 2 + reach;
        if (on && !w.active) { w.rx = dx; w.ry = dy; }
        w.rx += (dx - w.rx) * lean;
        w.ry += (dy - w.ry) * lean;
        w.mirror.style.transform = `translate(${w.rx.toFixed(1)}px, ${w.ry.toFixed(1)}px) translate(-50%, -50%)`;
        if (on) {
          any = true;
          const n = d || 1;
          w.el.style.setProperty("--fx-liquid-x", `${((dx / n) * push).toFixed(1)}px`);
          w.el.style.setProperty("--fx-liquid-y", `${((dy / n) * push).toFixed(1)}px`);
        } else {
          w.el.style.removeProperty("--fx-liquid-x");
          w.el.style.removeProperty("--fx-liquid-y");
        }
        if (on !== w.active) { w.active = on; w.el.classList.toggle("is-liquid", on); }
      }
      cursor.classList.toggle("is-near", any);
      dot.style.width = dot.style.height = `${any ? near : size}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      wells.forEach(drop);
      cursor.remove();
      if (--users === 0) document.documentElement.classList.remove("fx-goo-on");
    };
  });
})();
