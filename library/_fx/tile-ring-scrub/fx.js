(() => {
  // Stick customer logo tiles facing outward onto several overlapping concentric circles (the tile’s long side lies along the circumference),
  // While the panel passes through the screen (top bottom → bottom top), each ring rotates without a curve by its preset angle — the original uses 8, 16 and 20 pieces, 180°, -135° and 90°
  kfFx.register("tile-ring-scrub", (el, { options, reduce, scroller }) => {
    const tiles = [...el.children].filter((c) => c.getAttribute("data-fx-part") === "tile");
    if (!tiles.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const counts = String(options.rings ?? "8,16,20").split(",").map((n) => Math.round(+n)).filter((n) => n > 0);
    const turns = String(options.turn ?? "180,-135,90").split(",").map((n) => +n);
    const made = [], tweens = [];
    counts.forEach((count, r) => {
      const ring = document.createElement("div");
      ring.setAttribute("data-fx-part", "ring");
      ring.dataset.ring = String(r + 1);
      ring.setAttribute("aria-hidden", "true");
      ring.style.setProperty("--fx-ring-r", `var(--fx-r${r + 1}, ${12 + r * 14}vw)`);
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("div");
        dot.setAttribute("data-fx-part", "orbit");
        dot.style.setProperty("--fx-angle", `${(i * 360) / count}deg`);
        // Each ring pulls from a different spot so the same logo is never adjacent
        dot.appendChild(tiles[(i * 7 + count) % tiles.length].cloneNode(true));
        ring.appendChild(dot);
      }
      el.prepend(ring);
      made.push(ring);
      const turn = turns[r] ?? 0;
      if (reduce || !turn) return;
      const p = { r: 0 };
      tweens.push(gsap.to(p, {
        r: turn,
        ease: "none",
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "bottom top", scrub: true },
        onUpdate: () => ring.style.setProperty("--fx-turn", `${p.r}deg`),
      }));
    });
    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      made.forEach((m) => m.remove());
    };
  });
})();
