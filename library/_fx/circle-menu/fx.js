// Pressing the menu button spreads a circle from the button’s center to the screen edge to open the panel, and the items stand up from below in sequence. On close the items retract first and the circle shrinks back into the button.
(() => {
  kfFx.register("circle-menu", (el, { options, reduce }) => {
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const trigger = q("trigger")[0], panel = q("panel")[0];
    if (!trigger || !panel) return;
    const items = q("item"), shut = q("close");
    const T = { open: +(options.open ?? 0.8), close: +(options.close ?? 0.6), each: +(options.each ?? 0.06), items: +(options.items ?? 0.32), itemDur: +(options["item-dur"] ?? 0.7) };
    const ease = options.ease ? kfFx.ease(options.ease, "power3.inOut") : "power3.inOut", itemEase = options["item-ease"] ? kfFx.ease(options["item-ease"], "power3.out") : "power3.out";
    const rise = String(options.rise ?? "50"), from = rise.endsWith("%") ? { yPercent: parseFloat(rise) } : { y: +rise };
    let open = false, tl = null;
    const origin = () => {
      const r = trigger.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      return { x, y, R: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20 };
    };
    const set = (on) => {
      open = on;
      el.classList.toggle("is-open", on);
      trigger.setAttribute("aria-expanded", String(on));
      panel.setAttribute("aria-hidden", String(!on));
    };
    const show = () => {
      if (open) return;
      set(true);
      tl?.kill();
      gsap.set(panel, { visibility: "visible" });
      if (reduce) return gsap.set(panel, { clipPath: "none" });
      const { x, y, R } = origin();
      if (items.length) gsap.set(items, { clearProps: "transform,opacity,visibility" });
      tl = gsap.timeline().fromTo(panel, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: T.open, ease });
      if (items.length) tl.from(items, { ...from, autoAlpha: rise.endsWith("%") ? 1 : 0, stagger: T.each, duration: T.itemDur, ease: itemEase }, T.items);
    };
    const hide = () => {
      if (!open) return;
      set(false);
      tl?.kill();
      if (reduce) return gsap.set(panel, { visibility: "hidden" });
      const { x, y } = origin();
      tl = gsap.timeline({ onComplete: () => gsap.set(panel, { visibility: "hidden" }) });
      if (items.length) tl.to(items, { autoAlpha: 0, duration: 0.2 }, 0);
      tl.to(panel, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: T.close, ease }, 0.05);
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    trigger.addEventListener("click", () => (open ? hide() : show()), on);
    shut.forEach((b) => b.addEventListener("click", hide, on));
    addEventListener("keydown", (e) => e.key === "Escape" && hide(), on);
    el.addEventListener("fx:close", hide, on);
    set(false);
    return () => { ac.abort(); tl?.kill(); gsap.set([panel, ...items], { clearProps: "all" }); el.classList.remove("is-open"); };
  });
})();
