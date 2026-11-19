(() => {
  // Pressing the round button at bottom right slides the corner panel in from 100px to the right and turns it on (.6s expo.out), with a blur backdrop laid behind it.
  // Close by button, backdrop, Esc, or a link in the panel. Length, distance and curve are options — defaults are the original site’s values
  kfFx.register("corner-fab-menu", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const veil = el.querySelector('[data-fx-part="veil"]');
    const dur = reduce ? 0 : +(options.dur ?? 0.6), dx = +(options.x ?? 100), ease = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out");
    const HIDE = { autoAlpha: 0, x: dx, duration: dur, ease }, SHOW = { autoAlpha: 1, x: 0, duration: dur, ease };
    gsap.set(panel, { autoAlpha: 0, x: dx, transformOrigin: "right bottom" });
    if (veil) gsap.set(veil, { autoAlpha: 0 });
    let open = false;
    const mark = (v) => {
      open = v;
      [el, toggle, panel, veil].forEach((n) => n && n.classList.toggle("is-active", v));
      toggle.setAttribute("aria-expanded", String(v));
    };
    const show = () => { mark(true); gsap.to(panel, SHOW); if (veil) gsap.to(veil, { autoAlpha: 1, duration: dur, ease }); };
    const hide = () => { if (!open) return; mark(false); gsap.to(panel, HIDE); if (veil) gsap.to(veil, { autoAlpha: 0, duration: dur, ease }); };
    const onToggle = (e) => { e.preventDefault(); open ? hide() : show(); };
    const onVeil = (e) => { e.preventDefault(); hide(); };
    const onKey = (e) => { if (e.key === "Escape") hide(); };
    const onLink = (e) => { if (e.target.closest("a")) hide(); };
    toggle.addEventListener("click", onToggle);
    veil?.addEventListener("click", onVeil);
    panel.addEventListener("click", onLink);
    addEventListener("keyup", onKey);
    mark(false);
    return () => {
      toggle.removeEventListener("click", onToggle);
      veil?.removeEventListener("click", onVeil);
      panel.removeEventListener("click", onLink);
      removeEventListener("keyup", onKey);
      gsap.killTweensOf([panel, veil].filter(Boolean));
      gsap.set([panel, veil].filter(Boolean), { clearProps: "opacity,visibility,transform" });
      [el, toggle, panel, veil].forEach((n) => n && n.classList.remove("is-active"));
    };
  });
})();
