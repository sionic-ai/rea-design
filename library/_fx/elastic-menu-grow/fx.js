// Pressing the three-dot button stretches the panel, folded to button size, into a menu with elastic easing. The top and bottom dots lengthen and cross into an X while the middle dot disappears.
// Menu rows float up from 8px below after .22s at .05s intervals. On close the rows turn off first, then the panel and dots return with power3.inOut
(() => {
  kfFx.register("elastic-menu-grow", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const dots = [...toggle.querySelectorAll('[data-fx-part="dot"]')];
    const items = [...panel.querySelectorAll('[data-fx-part="item"]')];
    const W = +(options.w || 212), H = +(options.h || 398), S = +(options.size || 56);
    const off = +(options.off ?? 10), cw = +(options["cross-w"] || 24), ch = +(options["cross-h"] || 3), dot = +(options.dot || 6);
    const dur = reduce ? 0 : +(options.dur ?? 0.9), close = reduce ? 0 : +(options.close ?? 0.45);
    const E = kfFx.ease(options.ease || "elastic.out(1, 0.62)", "elastic.out(1, 0.62)");
    const ac = new AbortController(), on = { signal: ac.signal };
    let open = false, tl = null;
    const fresh = () => (tl && tl.kill(), (tl = gsap.timeline()));
    gsap.set(panel, { width: S, height: S });
    if (items.length) gsap.set(items, { autoAlpha: 0 });
    const show = () => {
      if (open) return;
      open = true;
      toggle.setAttribute("aria-expanded", "true");
      panel.removeAttribute("inert");
      gsap.set(panel, { pointerEvents: "auto" });
      const t = fresh();
      t.to(panel, { width: W, height: H, duration: dur, ease: E }, 0);
      if (dots[0]) t.to(dots[0], { y: off, rotate: 45, width: cw, height: ch, duration: dur, ease: E }, 0);
      if (dots[2]) t.to(dots[2], { y: -off, rotate: -45, width: cw, height: ch, duration: dur, ease: E }, 0);
      if (dots[1]) t.to(dots[1], { autoAlpha: 0, scale: 0, duration: reduce ? 0 : 0.2, ease: "power2.in" }, 0);
      if (items.length) t.fromTo(items, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.5, ease: "power2.out", stagger: reduce ? 0 : 0.05 }, reduce ? 0 : 0.22);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      toggle.setAttribute("aria-expanded", "false");
      if (panel.contains(document.activeElement)) toggle.focus();
      panel.setAttribute("inert", "");
      gsap.set(panel, { pointerEvents: "none" });
      const t = fresh(), at = reduce ? 0 : 0.2;
      if (items.length) t.to(items, { autoAlpha: 0, y: 8, duration: reduce ? 0 : 0.2, ease: "power2.in" }, 0);
      t.to(panel, { width: S, height: S, duration: close, ease: "power3.inOut" }, at);
      const ends = [dots[0], dots[2]].filter(Boolean);
      if (ends.length) t.to(ends, { y: 0, rotate: 0, width: dot, height: dot, duration: close, ease: "power3.inOut" }, at);
      if (dots[1]) t.to(dots[1], { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 0.25, ease: "power2.out" }, reduce ? 0 : 0.4);
    };
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("inert", "");
    toggle.addEventListener("click", () => (open ? hide() : show()), on);
    document.addEventListener("click", (e) => { if (open && !el.contains(e.target)) hide(); }, on);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); }, on);
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) hide(); }, on);
    addEventListener("resize", () => { if (open) gsap.set(panel, { width: W, height: H }); }, on);
    return () => {
      ac.abort();
      if (tl) tl.kill();
      gsap.set([panel, ...dots, ...items], { clearProps: "all" });
      toggle.removeAttribute("aria-expanded");
      panel.removeAttribute("inert");
    };
  });
})();
