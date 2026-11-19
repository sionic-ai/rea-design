// Hovering one grid cell keeps only that cell sharp (.25s power3.out) and blurs the other cells (.25s quad.out after .05s).
// Hovering a ”clear” cell (such as a letter cell) makes everything sharp. Leaving the panel keeps the last state as is (with release: all, everything becomes sharp).
(() => {
  kfFx.register("tile-blur-focus", (el, { options, hover }) => {
    if (!hover || !window.gsap) return;
    const blur = +(options.blur ?? 6), dur = +(options.dur ?? 0.25), lag = +(options.lag ?? 0.05);
    const fade = +(options.fade ?? 1), sharpDur = +(options["sharp-dur"] ?? dur);
    const dimEase = kfFx.ease(options.ease || "quad.out", "sine.inOut");
    const sharpEase = kfFx.ease(options["sharp-ease"] || "power3.out", "sine.inOut");
    const clearSel = options.clear || "[data-clear]";
    const tiles = () => [...el.querySelectorAll('[data-fx-part="tile"]')];
    const face = (t) => t.querySelector('[data-fx-part="blur"]') || t;
    let current = null;
    const focus = (t) => {
      if (t === current) return;
      current = t;
      const all = t && !t.matches(clearSel);
      tiles().forEach((x) => {
        const b = face(x), sharp = !all || x === t;
        gsap.killTweensOf(b, "filter,opacity");
        const look = fade < 1 ? { opacity: sharp ? 1 : fade } : {};
        if (sharp) gsap.to(b, { filter: "blur(0px)", ...look, duration: sharpDur, ease: sharpEase });
        else gsap.to(b, { filter: `blur(${blur}px)`, ...look, duration: dur, delay: lag, ease: dimEase });
        x.classList.toggle("is-fx-dim", !sharp);
        x.classList.toggle("is-fx-focus", !!t && x === t);
      });
      el.dispatchEvent(new CustomEvent("fx:focus", { bubbles: true, detail: { tile: t } }));
    };
    const over = (e) => {
      const t = e.target.closest?.('[data-fx-part="tile"]');
      if (t && el.contains(t)) focus(t);
    };
    const leave = () => { if (options.release === "all") focus(null); };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerleave", leave);
      tiles().forEach((x) => { const b = face(x); gsap.killTweensOf(b); gsap.set(b, { clearProps: "filter,opacity" }); x.classList.remove("is-fx-dim", "is-fx-focus"); });
    };
  });
})();
