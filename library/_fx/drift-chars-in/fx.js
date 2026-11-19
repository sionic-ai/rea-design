(() => {
  // A text block (or its child pieces) is shifted aside to the right and transparent, then once visible, from the front in .1s steps, it slides in with opacity .5s linear · position 1.4s slow deceleration
  kfFx.register("drift-chars-in", (el, { options, reduce, scroller }) => {
    let parts = [...el.querySelectorAll("[data-fx-part='char']")], html = null;
    if (!parts.length) {
      if (!el.textContent.trim()) return;
      html = el.innerHTML;
      el.textContent = "";
      [...html.replace(/<[^>]+>/g, "")].forEach((ch) => { const s = document.createElement("span"); s.dataset.fxPart = "char"; s.style.display = "inline-block"; if (ch === " ") s.style.whiteSpace = "pre"; s.textContent = ch; el.append(s); parts.push(s); });
    }
    const restore = () => { if (html != null) el.innerHTML = html; };
    if (reduce) return restore;
    const x = +(options.x ?? 25.6), y = +(options.y ?? 0), each = +(options.each ?? 0.1), fade = +(options.fade ?? 0.5), move = +(options.move ?? 1.4), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.11,0.51,0.13,1", "expo.out");
    // blur — initial blur (px), clears with the same length and curve as the position (Brand 3). fade-ease — opacity curve, default none (straight)
    const blur = +(options.blur ?? 0), fadeEase = options["fade-ease"] ? kfFx.ease(options["fade-ease"], "none") : "none";
    gsap.set(parts, { opacity: 0, x, y, ...(blur && { filter: `blur(${blur}px)` }) });
    const play = () => parts.forEach((p, i) => {
      gsap.to(p, { opacity: 1, duration: fade, ease: fadeEase, delay: delay + i * each });
      gsap.to(p, { x: 0, y: 0, ...(blur && { filter: "blur(0px)" }), duration: move, ease, delay: delay + i * each });
    });
    let st = null;
    if (options.on === "load") play();
    else st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", once: true, onEnter: play });
    return () => { st && st.kill(); gsap.killTweensOf(parts); gsap.set(parts, { clearProps: "opacity,transform,filter" }); restore(); };
  });
})();
