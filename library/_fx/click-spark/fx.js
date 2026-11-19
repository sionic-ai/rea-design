// Pressing a clickable item inside the attached panel with the mouse makes a few short lines burst out in a fan from the pressed spot (WAAPI — no GSAP).
// The line comes out from 4px at .2x, reaches 8px · its full length at .45, and vanishes at .3x from 15px
(() => {
  let layer = null;
  kfFx.register("click-spark", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const angles = String(options.angles || "-150,-105,-60").split(",").map(Number).filter((n) => !Number.isNaN(n));
    const dur = +(options.dur ?? 420), ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(0.2, 0.8, 0.3, 1)";
    const reach = +(options.reach ?? 15);
    const targets = options.targets || 'button, [role="button"], a[href], summary';
    const down = (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const t = e.target.closest?.(targets);
      if (!t || !el.contains(t) || t.disabled || t.getAttribute("aria-disabled") === "true") return;
      if (!layer || !layer.isConnected) {
        layer = document.createElement("div");
        layer.className = "fx-click-spark";
        layer.setAttribute("aria-hidden", "true");
        document.body.append(layer);
      }
      for (const a of angles) {
        const i = document.createElement("i");
        layer.append(i);
        const at = `translate(${e.clientX}px, ${e.clientY}px) rotate(${a}deg)`;
        i.animate([
          { transform: `${at} translateX(${reach * 0.27}px) scaleX(0.2)`, opacity: 0.9 },
          { transform: `${at} translateX(${reach * 0.53}px) scaleX(1)`, opacity: 0.8, offset: 0.45 },
          { transform: `${at} translateX(${reach}px) scaleX(0.3)`, opacity: 0 },
        ], { duration: dur, easing: ease }).onfinish = () => i.remove();
      }
    };
    el.addEventListener("pointerdown", down, { capture: true, passive: true });
    return () => el.removeEventListener("pointerdown", down, { capture: true });
  });
})();
