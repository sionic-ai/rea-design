// Stamped by time (interval), not distance — even while still, it keeps overlapping at the last spot and the oldest ones vanish first (as original)
(() => {
  kfFx.register("stamp-photo-trail", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || reduce || !hover || innerWidth < +(options.min ?? 992)) return;
    const every = (+(options.every ?? 0.2) || 0.2) * 1000;
    const stop = +(options.stop ?? 0.8) * 1000;
    const len = Math.max(1, Math.round(+(options.length || 8)));
    const fade = +(options.fade ?? 0.3);
    // gap — one item each time the cursor moves this far instead of by time (px, add vw for a ratio of window width). Brand: window width / 15
    const gapOf = () => (options.gap == null ? 0 : /vw$/.test(options.gap) ? (parseFloat(options.gap) * innerWidth) / 100 : +options.gap);
    // pop — from this multiple down to 1 when placed (.2s), shrink — shrinks to this multiple when vanishing (fade-ease curve). If absent, it is simply placed and only fades
    const pop = options.pop == null ? null : +options.pop;
    const popDur = +(options["pop-dur"] ?? 0.2);
    const shrink = options.shrink == null ? null : +options.shrink;
    const fadeEase = kfFx.ease(options["fade-ease"] || "power1.out", "power1.out");
    const st = { timer: 0, clean: 0, i: 0, x: 0, y: 0, lx: 0, ly: 0, on: false, moved: false, stamps: new Map() };
    const ac = new AbortController();
    const hide = (n) => {
      gsap.killTweensOf(n);
      gsap.to(n, { opacity: 0, ...(shrink == null ? {} : { scale: shrink }), duration: fade, ease: fadeEase, onComplete: () => { gsap.set(n, { display: "none", visibility: "hidden" }); st.stamps.delete(n); } });
    };
    const show = (n) => {
      gsap.killTweensOf(n);
      const r = n.getBoundingClientRect();
      // A hidden (display:none) section has size 0, so set it up and measure first for it to sit at the cursor center
      if (!r.width) gsap.set(n, { display: "block" });
      const w = n.offsetWidth || r.width, h = n.offsetHeight || r.height;
      gsap.set(n, { left: st.x - w / 2, top: st.y - h / 2, zIndex: st.i, display: "block", opacity: 1, visibility: "visible" });
      if (pop != null) gsap.fromTo(n, { autoAlpha: 0, scale: pop }, { autoAlpha: 1, scale: 1, duration: popDur, overwrite: true });
      st.stamps.set(n, Date.now());
    };
    const next = () => {
      if (!st.moved) return;
      const lead = items[st.i % items.length];
      const tail = items[(((st.i - len) % items.length) + items.length) % items.length];
      show(lead);
      if (st.i >= len && tail && tail !== lead) hide(tail);
      st.i++;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      st.x = e.clientX - r.left; st.y = e.clientY - r.top; st.moved = true;
      const g = gapOf();
      if (g && Math.hypot(st.x - st.lx, st.y - st.ly) > g) { st.lx = st.x; st.ly = st.y; next(); }
    };
    const sweep = () => { const now = Date.now(); for (const [n, t] of st.stamps) if (now - t > stop) hide(n); };
    const start = () => {
      if (st.on) return;
      st.on = true;
      el.addEventListener("mousemove", move, { signal: ac.signal });
      if (!gapOf()) st.timer = setInterval(next, every);
      st.clean = setInterval(sweep, 100);
    };
    const end = () => {
      if (!st.on) return;
      st.on = false;
      st.moved = false;
      el.removeEventListener("mousemove", move);
      clearInterval(st.timer);
      clearInterval(st.clean);
      st.stamps.forEach((_, n) => hide(n));
    };
    el.addEventListener("mouseenter", start, { signal: ac.signal });
    el.addEventListener("mouseleave", end, { signal: ac.signal });
    // live — turns on immediately on attach (for when the cursor is already inside the panel — the caller toggles data-fx on and off to switch it)
    if (options.live === "on") start();
    return () => {
      ac.abort();
      clearInterval(st.timer);
      clearInterval(st.clean);
      gsap.killTweensOf(items);
      if (el.isConnected) gsap.set(items, { clearProps: "left,top,zIndex,display,opacity,visibility,scale,transform" });
    };
  });
})();
