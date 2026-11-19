// Hovering one menu item blurs the other items (5px · .5s power2.out) and outside targets (background photo, screen curtain) blur along with them (13px · .5s power1.out).
// On release the menu returns to rest blur in .5s and the target in .4s. If there is no menu slot, only the target blurs when hovering over the element itself (logo → screen curtain 15px · 1.5s / .9s).
(() => {
  kfFx.register("nav-blur-focus", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const target = options.target ? document.querySelector(options.target) : null;
    if (!items.length && !target) return;
    const blur = +(options.blur ?? 5), tBlur = +(options["target-blur"] ?? 13), rest = +(options.rest ?? 0);
    const prop = options.prop === "backdrop" ? "backdropFilter" : "filter";
    const dur = reduce ? 0 : +(options.dur ?? 0.5), tIn = reduce ? 0 : +(options["target-in"] ?? 0.5), tOut = reduce ? 0 : +(options["target-out"] ?? 0.4);
    const tEase = kfFx.ease(options["target-ease"] || "power1.out", "power1.out");
    const setTarget = (v, d) => target && gsap.to(target, { [prop]: `blur(${v}px)`, ...(prop === "backdropFilter" ? { webkitBackdropFilter: `blur(${v}px)` } : {}), duration: d, ease: tEase, overwrite: true, force3D: true });
    const offs = [];
    const on = (node, fn) => { node.addEventListener("pointerenter", fn); offs.push(() => node.removeEventListener("pointerenter", fn)); };
    const off = (node, fn) => { node.addEventListener("pointerleave", fn); offs.push(() => node.removeEventListener("pointerleave", fn)); };
    if (items.length) {
      items.forEach((it) => {
        on(it, () => { items.forEach((o) => gsap.to(o, { filter: `blur(${o === it ? 0 : blur}px)`, duration: dur, ease: "power2.out", overwrite: true })); setTarget(tBlur, tIn); });
        off(it, () => { items.forEach((o) => gsap.to(o, { filter: "blur(0px)", duration: dur, ease: "power2.out", overwrite: true })); setTarget(rest, tOut); });
      });
    } else {
      on(el, () => setTarget(tBlur, tIn));
      off(el, () => setTarget(rest, tOut));
    }
    if (target && rest) gsap.set(target, { [prop]: `blur(${rest}px)` });
    return () => { offs.forEach((f) => f()); if (items.length) gsap.set(items, { clearProps: "filter" }); if (target) gsap.set(target, { clearProps: "filter,backdropFilter,webkitBackdropFilter" }); };
  });
})();
