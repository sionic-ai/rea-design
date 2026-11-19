// One cover is made per page and shared. Just before navigating, a mark is left in sessionStorage so the destination page opens already covered
(() => {
  const KEY = "fx-disc-warp";
  const narrow = () => matchMedia("(max-width: 1023px)").matches;
  const cover = () => (2.5 * Math.hypot(Math.max(screen.width, innerWidth), Math.max(screen.height, innerHeight))) / 32;
  const inView = (q) => q && q.x > 24 && q.x < innerWidth - 24 && q.y > 24 && q.y < innerHeight - 24;
  const sample = (p) => {
    const m = p?.getScreenCTM?.();
    if (!m || !p.getTotalLength) return [];
    const n = p.getTotalLength();
    return Array.from({ length: 41 }, (_, i) => p.getPointAtLength((n * i) / 40).matrixTransform(m));
  };
  let shell = null;
  const overlay = () => {
    if (shell?.isConnected) return shell;
    shell = document.createElement("div");
    shell.className = "fx-disc-warp";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = '<svg class="fx-disc-warp__route"><path pathLength="1" d=""/><circle r="7"/></svg><div class="fx-disc-warp__disc"></div><div class="fx-disc-warp__field"></div>';
    document.body.append(shell);
    return shell;
  };

  kfFx.register("disc-warp", (el, { options, reduce }) => {
    const ac = new AbortController();
    const tweens = [];
    const time = (k, wide, small) => +(options[k] ?? (narrow() ? small : wide));
    if (options.land === "true") {
      if (sessionStorage.getItem(KEY) !== "1" || reduce) { sessionStorage.removeItem(KEY); return; }
      sessionStorage.removeItem(KEY);
      const o = overlay(), disc = o.querySelector(".fx-disc-warp__disc");
      gsap.set(o, { visibility: "visible" });
      gsap.set(o.querySelector("svg"), { opacity: 0 });
      gsap.set(disc, { x: innerWidth * 0.75, y: innerHeight * 0.6, scale: cover() });
      document.fonts.ready.then(() => requestAnimationFrame(() => {
        if (ac.signal.aborted) return;
        const r = el.getBoundingClientRect();
        const x = Math.max(24, Math.min(innerWidth - 24, r.left + r.width / 2)), y = Math.max(24, Math.min(innerHeight - 24, r.top + r.height / 2));
        gsap.set(disc, { x, y });
        tweens.push(gsap.to(disc, { scale: 0, duration: time("shrink", 0.4, 0.3), ease: "power3.inOut", onComplete: () => gsap.set(o, { visibility: "hidden" }) }));
      }));
      return () => { ac.abort(); tweens.forEach((t) => t.kill()); shell?.remove(); };
    }
    el.addEventListener("click", (e) => {
      const href = el.getAttribute("href");
      if (reduce || !href || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      let pts = [];
      if (options.route) for (const p of document.querySelectorAll(options.route)) { const s = sample(p); if (inView(s[0]) && inView(s.at(-1))) { pts = s; break; } }
      if (!pts.length) pts = sample(el.querySelector("path"));
      const r = el.getBoundingClientRect(), end = pts.at(-1) ?? { x: r.right - 12, y: r.top + r.height / 2 };
      const x = Math.max(0, Math.min(innerWidth, end.x)), y = Math.max(0, Math.min(innerHeight, end.y));
      const o = overlay(), path = o.querySelector("path"), puck = o.querySelector("circle"), disc = o.querySelector(".fx-disc-warp__disc"), field = o.querySelector(".fx-disc-warp__field");
      const draw = time("draw", 0.3, 0.18), p = { v: 0 };
      path.setAttribute("d", pts.map((q, i) => `${i ? "L" : "M"}${q.x} ${q.y}`).join(" "));
      puck.setAttribute("cx", pts[0]?.x ?? x);
      puck.setAttribute("cy", pts[0]?.y ?? y);
      gsap.set(o, { visibility: "visible" });
      gsap.set(o.querySelector("svg"), { opacity: 1 });
      gsap.set(field, { opacity: 0 });
      gsap.set(disc, { x, y, scale: 0 });
      gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline();
      tweens.push(tl);
      const fade = options.fade ? document.querySelectorAll(options.fade) : [];
      if (fade.length) tl.to(fade, { opacity: 0.2, duration: 0.16 }, 0);
      if (pts.length) {
        tl.to(path, { strokeDashoffset: 0, duration: draw, ease: "power1.inOut" }, 0)
          .to(p, { v: 1, duration: draw, ease: "power1.inOut", onUpdate: () => { const q = pts[Math.round(p.v * (pts.length - 1))]; puck.setAttribute("cx", q.x); puck.setAttribute("cy", q.y); } }, 0);
      }
      tl.to(disc, { scale: cover(), duration: time("grow", 0.38, 0.28), ease: "power3.in" }, draw)
        .set(field, { opacity: 1 })
        .set(o.querySelector("svg"), { opacity: 0 })
        .call(() => { sessionStorage.setItem(KEY, "1"); location.href = href; });
    }, { signal: ac.signal });
    return () => { ac.abort(); tweens.forEach((t) => t.kill()); };
  });
})();
