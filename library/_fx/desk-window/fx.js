// Desktop OS windows — each open staggers them 28px at a time from screen center, and the last window clicked comes to the front.
// Icons and menus outside the window open it, so open and close are triggered on this element with fx:open, fx:close and fx:min events
(() => {
  let topZ = 500, step = 0;
  const live = new Set();
  // Esc closes only the frontmost open window
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !live.size) return;
    const top = [...live].sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
    top.dispatchEvent(new Event("fx:close"));
  });

  kfFx.register("desk-window", (el, { options, reduce, hover }) => {
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const ac = new AbortController(), on = { signal: ac.signal }, d = reduce ? 0 : 1;
    const T = {
      open: +(options.open ?? 0.3), close: +(options.close ?? 0.2), min: +(options.min ?? 0.25),
      from: +(options.from ?? 0.94), cascade: +(options.cascade ?? 28), pad: +(options.pad ?? 12),
    };
    const steps = +options.steps || 5;
    // ox · oy: place the top-left corner at ”screen center − ox/oy” instead of the center · fade: opacity alone over its own length (fadeEase curve) · bound: none means it is not confined to the screen
    const ax = options.ox != null ? +options.ox : null, ay = options.oy != null ? +options.oy : null;
    const fade = options.fade != null ? +options.fade : null, fadeEase = kfFx.ease(options.fadeEase || "power1.inOut", "power1.inOut");
    const free = options.bound === "none";
    const openEase = kfFx.ease(options.ease || "back.out(1.5)", "back.out(1.5)");
    const shutEase = kfFx.ease(options.shut || "power2.in", "power2.in"), shutTo = +(options.to ?? 0.97);
    const bar = q("bar")[0] || el;
    let state = "closed", placed = false;

    const front = () => { el.style.zIndex = ++topZ; };
    const clamp = (v, lo, hi) => (free ? v : Math.min(Math.max(lo, v), Math.max(lo, hi)));
    const place = () => {
      gsap.set(el, { x: 0, y: 0, scale: 1 });
      const r = el.getBoundingClientRect(), off = hover ? (step++ % steps) * T.cascade : 0;
      gsap.set(el, {
        x: clamp((ax != null ? innerWidth / 2 - ax : (innerWidth - r.width) / 2) + off, T.pad, innerWidth - r.width - T.pad),
        y: clamp((ay != null ? innerHeight / 2 - ay : (innerHeight - r.height) / 2) + off, T.pad, innerHeight - r.height - T.pad),
      });
      placed = true;
    };
    const open = () => {
      if (state === "open") return front();
      const restoring = state === "min";
      state = "open"; live.add(el);
      el.classList.add("fx-open"); el.removeAttribute("inert");
      front();
      if (!restoring && !placed) place();
      if (fade == null) gsap.fromTo(el, { autoAlpha: 0, scale: T.from }, { autoAlpha: 1, scale: 1, duration: T.open * d, ease: openEase });
      else {
        gsap.fromTo(el, { scale: T.from }, { scale: 1, duration: T.open * d, ease: openEase });
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade * d, ease: fadeEase });
      }
    };
    const hide = (scale, dur, after) => {
      live.delete(el);
      gsap.to(el, {
        autoAlpha: 0, scale, duration: dur * d, ease: shutEase,
        onComplete: () => { el.classList.remove("fx-open"); el.setAttribute("inert", ""); after?.(); },
      });
    };
    const close = () => { if (state === "closed") return; state = "closed"; hide(shutTo, T.close, () => { placed = false; }); };
    const min = () => { if (state !== "open") return; state = "min"; hide(0.9, T.min); };

    // Drag the title bar to move it — the whole window stays within pad inside the screen, and if the title bar is off-screen on release, it is pushed back inside in .3s
    const IGNORE = 'a, button, input, textarea, select, label, [data-fx-part="close"], [data-fx-part="min"]';
    let pid = null, sx = 0, sy = 0, ox = 0, oy = 0;
    el.addEventListener("pointerdown", front, on);
    if (hover) {
      bar.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || e.target.closest(IGNORE)) return;
        pid = e.pointerId; sx = e.clientX; sy = e.clientY;
        ox = gsap.getProperty(el, "x"); oy = gsap.getProperty(el, "y");
        bar.setPointerCapture(pid);
        e.preventDefault();
      }, on);
      bar.addEventListener("pointermove", (e) => {
        if (e.pointerId !== pid) return;
        gsap.set(el, {
          x: clamp(ox + e.clientX - sx, T.pad, innerWidth - el.offsetWidth - T.pad),
          y: clamp(oy + e.clientY - sy, T.pad, innerHeight - el.offsetHeight - T.pad),
        });
      }, on);
      const up = (e) => {
        if (e.pointerId !== pid) return;
        pid = null;
        const r = bar.getBoundingClientRect();
        let dx = 0, dy = 0;
        if (r.right < T.pad) dx = T.pad - r.right;
        if (r.left > innerWidth - T.pad) dx = innerWidth - T.pad - r.left;
        if (r.top < T.pad) dy = T.pad - r.top;
        if (r.top > innerHeight - T.pad) dy = innerHeight - T.pad - r.top;
        if (!free && (dx || dy)) gsap.to(el, { x: `+=${dx}`, y: `+=${dy}`, duration: 0.3 * d, ease: "power2.out" });
      };
      bar.addEventListener("pointerup", up, on);
      bar.addEventListener("pointercancel", up, on);
    }

    el.addEventListener("fx:open", open, on);
    el.addEventListener("fx:close", close, on);
    el.addEventListener("fx:min", min, on);
    q("close").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); close(); }, on));
    q("min").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); min(); }, on));
    if (el.classList.contains("fx-open")) { el.classList.remove("fx-open"); open(); }
    else el.setAttribute("inert", "");

    return () => {
      ac.abort(); live.delete(el); gsap.killTweensOf(el);
      el.classList.remove("fx-open"); el.removeAttribute("inert");
      if (el.isConnected) gsap.set(el, { clearProps: "transform,opacity,visibility,zIndex" });
    };
  });
})();
