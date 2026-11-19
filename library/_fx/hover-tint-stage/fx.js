// Hovering a menu row tints the section background with that row’s color (--fx-tint) and shows its paired panel (photo, video). On leave it returns to the original background and all panels switch off.
// Colors in forms GSAP can’t read, like oklch(from …), are painted into a hidden cell and read back as rgb
(() => {
  kfFx.register("hover-tint-stage", (el, { options, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!items.length || !hover) return;
    const dur = +(options.dur ?? 0.3), panelDur = +(options["panel-dur"] ?? 0.4), ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const probe = document.createElement("span");
    probe.hidden = true;
    el.append(probe);
    // Even if the computed color arrives as oklch() or color(), GSAP can blend it by painting it on a 1×1 canvas and reading it back as rgb
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (c) => {
      probe.style.color = ""; probe.style.color = c;
      const css = getComputedStyle(probe).color;
      if (!ctx || css.startsWith("rgb")) return css;
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
    };
    const tintOf = (it) => rgb(getComputedStyle(it).getPropertyValue("--fx-tint").trim());
    const ac = new AbortController();
    items.forEach((it, i) => {
      it.addEventListener("pointerenter", () => {
        const c = tintOf(it);
        if (c) gsap.to(el, { backgroundColor: c, duration: dur, ease, overwrite: true });
        panels.forEach((p, j) => gsap.to(p, { opacity: j === i ? 1 : 0, duration: panelDur, ease, overwrite: true }));
      }, { signal: ac.signal });
      it.addEventListener("pointerleave", () => {
        gsap.set(el, { clearProps: "backgroundColor" });
        const base = rgb(getComputedStyle(el).backgroundColor);
        gsap.fromTo(el, { backgroundColor: tintOf(it) }, { backgroundColor: base, duration: dur, ease, overwrite: true, onComplete: () => gsap.set(el, { clearProps: "backgroundColor" }) });
        if (panels.length) gsap.to(panels, { opacity: 0, duration: panelDur, ease, overwrite: true });
      }, { signal: ac.signal });
    });
    return () => { ac.abort(); probe.remove(); gsap.killTweensOf([el, ...panels]); gsap.set([el, ...panels], { clearProps: "backgroundColor,opacity" }); };
  });
})();
