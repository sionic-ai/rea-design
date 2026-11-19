// Clock wheel menu (brand) — n items placed on an ellipse (radii 22% of panel width and 29% of height, center at 80% of panel height; Below 720px 28%·34%·82%) above
// Front slot n and back (shadow) slot n are both placed at slot 2n. Each slot has an angle and opacity, and the current page item lands on the anchor slot.
// Moving to another item, every item hops across the slots by that difference, the angle turns by joining the angles between slots (1.18s power4.inOut), and the clock-hand plate makes one turn (−360°).
(() => {
  const mod = (a, n) => ((a % n) + n) % n;
  kfFx.register("clock-dial-nav", (el, { options, reduce }) => {
    const view = el.querySelector('[data-fx-part="viewport"]');
    const real = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!view || !real.length) return;
    const clock = el.querySelector('[data-fx-part="clock"]');
    const n = real.length;
    const links = real.map((it) => it.getAttribute("data-link") || "");
    const anchorAt = Math.max(0, Math.min(n - 1, +(options.anchor ?? Math.min(3, n - 1))));
    const stopsIn = (options.stops || ".4,.4,.4,1,.4,.1,.05,0,.05,.1").split(",").map(Number);
    const dur = reduce ? 0.01 : +(options.dur ?? 1.18), ease = reduce ? "none" : options.ease || "power4.inOut";
    // Shadow item — the same name circling the rear slot (not clickable)
    const ghosts = real.map((it) => { const g = it.cloneNode(true); g.setAttribute("aria-hidden", "true"); g.dataset.dialCopy = ""; g.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1")); return g; });
    const host = real[0].parentElement;
    ghosts.forEach((g) => host.append(g));
    const nodes = [...real, ...ghosts];
    const J = [...real.map((it) => +it.getAttribute("data-angle") || 0), ...real.map((it) => +it.getAttribute("data-ghost") || 0)];
    const N = J.length;
    const stops = Array.from({ length: N }, (_, i) => ({ slot: i, opacity: stopsIn[i] ?? 0.4 })).concat({ slot: N, opacity: stopsIn[0] ?? 0.4 });
    const items = nodes.map((node, i) => ({ node, label: links[i % n], slot: i, target: i, angle: J[i] }));
    let geo = { cx: 0, cy: 0, rx: 0, ry: 0 };
    const measure = () => {
      const w = view.offsetWidth, h = view.offsetHeight, small = innerWidth <= 720;
      geo = { cx: w / 2, cy: h * (small ? 0.82 : 0.8), rx: w * (small ? 0.28 : 0.22), ry: h * (small ? 0.34 : 0.29) };
    };
    const opacityAt = (s) => {
      let p = s;
      while (p < 0) p += N;
      while (p > N) p -= N;
      for (let k = 0; k < stops.length - 1; k++) if (p >= stops[k].slot && p <= stops[k + 1].slot) return gsap.utils.interpolate(stops[k].opacity, stops[k + 1].opacity, (p - stops[k].slot) / (stops[k + 1].slot - stops[k].slot || 1));
      return 0.4;
    };
    let current = options.current || links[anchorAt];
    const paint = () => {
      for (const it of items) {
        const s = mod(it.slot, N), a = (it.angle * Math.PI) / 180;
        const x = geo.cx + geo.rx * Math.cos(a), y = geo.cy + geo.ry * Math.sin(a);
        const front = s <= n - 1;
        const on = front && Math.abs(it.slot - anchorAt) < 0.55 && it.label === current;
        const o = on ? 1 : opacityAt(it.slot);
        it.node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${on ? 1 : 0.97})`;
        it.node.style.opacity = String(o);
        it.node.style.zIndex = on ? "3" : front ? "2" : "1";
        it.node.dataset.active = String(on);
        it.node.dataset.visible = String(front || o > 0);
        const a2 = it.node.querySelector("a");
        if (a2) { if (on) a2.setAttribute("aria-current", "page"); else a2.removeAttribute("aria-current"); if (!("dialCopy" in it.node.dataset)) a2.tabIndex = front ? 0 : -1; }
      }
    };
    const shortest = (d) => { const t = mod(d, n); return t > n / 2 ? t - n : t; };
    const place = (link) => {
      const shift = shortest(links.indexOf(link) - anchorAt);
      items.forEach((it, i) => { it.slot = mod(i - shift, N); it.target = it.slot; it.angle = J[it.slot]; });
      current = link;
      paint();
    };
    // Rotation amount built by chaining the angles between the spots passed while crossing steps cells (continuing with ±360 when it goes over a full turn)
    const sweep = (from, steps) => {
      let sum = 0, s = mod(from, N);
      const dir = Math.sign(steps);
      for (let k = 0; k < Math.abs(steps); k++) {
        const t = mod(s + dir, N);
        let d = J[t] - J[s];
        if (dir > 0 && d < 0) d += 360;
        if (dir < 0 && d > 0) d -= 360;
        sum += d; s = t;
      }
      return sum;
    };
    let tl = null;
    const animateTo = (link, d = dur, e = ease) => {
      if (link === current || !links.includes(link)) return;
      const l = shortest(links.indexOf(link) - links.indexOf(current));
      current = link;
      if (!l) { paint(); return; }
      tl?.progress(1).kill();
      tl = gsap.timeline({
        defaults: { duration: reduce ? 0.01 : d, ease: e },
        onUpdate: paint,
        onComplete: () => { for (const it of items) { it.slot = mod(it.target, N); it.angle = J[it.slot]; } paint(); if (clock) gsap.set(clock, { rotation: 0 }); el.dispatchEvent(new CustomEvent("fx:clock-dial-nav", { detail: { current } })); },
      });
      if (clock) tl.fromTo(clock, { rotation: 0 }, { rotation: -360 * Math.sign(l || 1) }, 0);
      for (const it of items) {
        it.target = mod(it.slot - l, N);
        const e2 = it.target - it.slot, t = Math.abs(e2) > N / 2 ? e2 - Math.sign(e2) * N : e2;
        tl.to(it, { angle: it.angle + sweep(it.slot, t), slot: it.target }, 0);
      }
    };
    const zoom = { scale: 1 };
    const setZoom = () => gsap.set(view, { scale: innerWidth <= 767 ? Math.min(zoom.scale, 1) : zoom.scale, transformOrigin: "50% 100%" });
    measure();
    // If arriving from the previous page, start from that spot and turn to the current page (the original is a single-page app so the menu stays and turns)
    const from = options.from && links.includes(options.from) ? options.from : null;
    place(from || current);
    if (from && options.current && from !== options.current) requestAnimationFrame(() => animateTo(options.current));
    const ac = new AbortController();
    el.addEventListener("fx:dial", (e) => {
      const d = e.detail || {};
      if (d.to) animateTo(d.to, d.dur ?? dur, d.ease || ease);
      if (d.zoom != null) gsap.to(zoom, { scale: d.zoom, duration: reduce ? 0 : d.dur ?? 0.8, ease: d.ease || "power2.out", onUpdate: setZoom, overwrite: "auto" });
      if (d.reset) { tl?.kill(); gsap.killTweensOf(zoom); zoom.scale = 1; setZoom(); place(d.reset); }
    }, { signal: ac.signal });
    const ro = new ResizeObserver(() => { measure(); setZoom(); paint(); });
    ro.observe(view);
    return () => { ac.abort(); ro.disconnect(); tl?.kill(); gsap.killTweensOf(zoom); ghosts.forEach((g) => g.remove()); real.forEach((it) => { it.style.cssText = ""; delete it.dataset.active; delete it.dataset.visible; }); if (clock) gsap.set(clock, { clearProps: "transform" }); gsap.set(view, { clearProps: "transform" }); };
  });
})();
