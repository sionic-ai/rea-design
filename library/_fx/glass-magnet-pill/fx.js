(() => {
  // Glass pill — when the cursor touches the button box, the glass surface is pulled toward the cursor (distance from center × pull, max px) while the text is pulled only slightly.
  // After attaching, it follows within reach px outside the box, and when it leaves it snaps back elastically and stays in place. Light inside the surface gathers at the cursor.
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  kfFx.register("glass-magnet-pill", (el, { options, reduce, hover }) => {
    const surface = el.querySelector('[data-fx-part="surface"]') || el;
    const content = el.querySelector('[data-fx-part="content"]');
    const o = {
      pull: +(options.pull ?? 0.33), max: +(options.max ?? 13),
      cpull: +(options["content-pull"] ?? 0.06), cmax: +(options["content-max"] ?? 3),
      reach: +(options.reach ?? 16), scale: +(options.scale ?? 1.045),
      back: +(options.back ?? 0.9), period: +(options.period ?? 0.35),
      slower: +(options.slower ?? 1.5), lag: +(options.lag ?? 0.15),
    };
    el.style.setProperty("--fx-reach", `${o.reach}px`);
    if (reduce || !hover || !window.gsap) {
      const on = () => surface.setAttribute("data-hover", "true"), off = () => surface.setAttribute("data-hover", "false");
      el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off);
      return () => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); surface.removeAttribute("data-hover"); el.style.removeProperty("--fx-reach"); };
    }
    const st = { scale: 1 };
    let engaged = false;
    const setScale = () => surface.style.setProperty("--fx-glass-scale", st.scale.toFixed(4));
    const enter = () => {
      engaged = true;
      el.setAttribute("data-stuck", "");
      surface.setAttribute("data-hover", "true");
      gsap.to(st, { scale: o.scale, duration: 0.4, ease: "power2.out", onUpdate: setScale, overwrite: true });
    };
    const release = () => {
      engaged = false;
      el.removeAttribute("data-stuck");
      surface.setAttribute("data-hover", "false");
      const ease = `elastic.out(1, ${o.period})`;
      gsap.to(surface, { x: 0, y: 0, duration: o.back, ease, overwrite: "auto" });
      if (content) gsap.to(content, { x: 0, y: 0, duration: o.back * o.slower, ease, delay: o.lag, overwrite: "auto" });
      gsap.to(st, { scale: 1, duration: 0.3, ease: "power2.out", onUpdate: setScale, overwrite: true });
    };
    const move = (e) => {
      if (e.pointerType !== "mouse" || !el.isConnected) return;
      const x = e.clientX, y = e.clientY, r = el.getBoundingClientRect();
      const d = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
      if (!(engaged ? d <= o.reach : d === 0)) { if (engaged) release(); return; }
      if (!engaged) enter();
      const s = surface.getBoundingClientRect();
      surface.style.setProperty("--fx-spot-x", `${(x - s.left).toFixed(1)}px`);
      surface.style.setProperty("--fx-spot-y", `${(y - s.top).toFixed(1)}px`);
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      gsap.to(surface, { x: clamp(dx * o.pull, o.max), y: clamp(dy * o.pull, o.max), duration: 0.25, ease: "power2.out", overwrite: "auto" });
      if (content) gsap.to(content, { x: clamp(dx * o.cpull, o.cmax), y: clamp(dy * o.cpull, o.cmax), duration: 0.25, ease: "power2.out", overwrite: "auto" });
    };
    const leaveDoc = () => engaged && release();
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leaveDoc);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leaveDoc);
      gsap.killTweensOf([surface, st]);
      if (content) { gsap.killTweensOf(content); gsap.set(content, { clearProps: "transform" }); }
      gsap.set(surface, { clearProps: "transform" });
      ["--fx-glass-scale", "--fx-spot-x", "--fx-spot-y"].forEach((k) => surface.style.removeProperty(k));
      surface.removeAttribute("data-hover");
      el.removeAttribute("data-stuck");
      el.style.removeProperty("--fx-reach");
    };
  });
})();
