(() => {
  // Bottom-center glass dock — after the hero, section links fold to width 0 and a hamburger grows into their place at 42px (.5s power3.inOut, button .1s later).
  // Pressing the hamburger folds the header icon·CTA to 0 width and shrinks the dock to one button size, while a menu panel rises 16px from below above it and the links follow up .05s apart.
  // The icon (two lines ↔ X) disappears in .25s and pops out with back.out(2) .12s later. Clicking outside or pressing Esc closes it. Returning to the top expands it again.
  kfFx.register("dock-fold-nav", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const lead = part("lead"), links = part("links"), toggle = part("toggle"), cta = part("cta");
    const menu = options.menu ? document.querySelector(options.menu) : part("menu");
    if (!links || !toggle || !menu) return;
    const iconMenu = toggle.querySelector('[data-key="menu"]'), iconClose = toggle.querySelector('[data-key="close"]');
    const items = [...menu.querySelectorAll("a, button")];
    const at = +(options.at ?? 0.6);
    const after = options.after ? document.querySelector(options.after) : null;
    const dur = reduce ? 0 : +(options.dur ?? 0.5);
    const k = dur / 0.5;
    const gapOpen = +(options.gap ?? 50), gapFold = +(options["gap-fold"] ?? 30), pad = parseFloat(getComputedStyle(el).paddingLeft) || 20;
    const leadW = lead ? lead.offsetWidth : 0;
    const ctaPad = cta ? parseFloat(getComputedStyle(cta).paddingLeft) : 0;
    const io = "power3.inOut";
    const tw = (t, v) => t && gsap.to(t, v);
    let folded = false, open = false;
    gsap.set(menu, { autoAlpha: 0, y: 16, visibility: "hidden", pointerEvents: "none" });
    if (iconClose) gsap.set(iconClose, { autoAlpha: 0, scale: 0.5 });

    function setOpen(v) {
      if (open === v) return;
      open = v;
      toggle.setAttribute("aria-expanded", v ? "true" : "false");
      gsap.killTweensOf([menu, ...items, lead, cta, links, iconMenu, iconClose].filter(Boolean));
      if (v) {
        gsap.set(menu, { visibility: "visible", pointerEvents: "auto" });
        tw(lead, { width: 0, opacity: 0, duration: 0.4 * k, ease: io });
        tw(cta, { width: 0, paddingLeft: 0, paddingRight: 0, opacity: 0, duration: 0.4 * k, ease: io });
        tw(links, { marginRight: 0, duration: 0.4 * k, ease: io });
        tw(el, { gap: 0, paddingLeft: 5, duration: 0.4 * k, ease: io });
        tw(iconMenu, { autoAlpha: 0, scale: 0.5, duration: 0.25 * k, ease: "power2.in" });
        tw(iconClose, { autoAlpha: 1, scale: 1, duration: 0.3 * k, delay: 0.12 * k, ease: "back.out(2)" });
        gsap.fromTo(menu, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4 * k, ease: "power3.out", delay: 0.15 * k });
        if (items.length) gsap.fromTo(items, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35 * k, stagger: 0.05 * k, ease: "power2.out", delay: 0.22 * k });
      } else {
        tw(lead, { width: leadW, opacity: 1, duration: 0.4 * k, ease: io, delay: 0.1 * k });
        if (cta) { gsap.set(cta, { paddingLeft: ctaPad, paddingRight: ctaPad }); tw(cta, { width: "auto", opacity: 1, duration: 0.4 * k, ease: io, delay: 0.1 * k }); }
        tw(links, { marginRight: -gapFold, duration: 0.4 * k, ease: io });
        tw(el, { gap: gapFold, paddingLeft: pad, duration: 0.4 * k, ease: io });
        tw(iconClose, { autoAlpha: 0, scale: 0.5, duration: 0.25 * k, ease: "power2.in" });
        tw(iconMenu, { autoAlpha: 1, scale: 1, duration: 0.3 * k, delay: 0.12 * k, ease: "back.out(2)" });
        gsap.to(menu, { autoAlpha: 0, y: 16, duration: 0.28 * k, ease: "power2.in", onComplete() { if (!open) gsap.set(menu, { visibility: "hidden", pointerEvents: "none" }); } });
      }
    }
    function setFolded(v) {
      if (folded === v) return;
      folded = v;
      el.toggleAttribute("data-folded", v);
      gsap.killTweensOf([links, toggle]);
      if (v) {
        gsap.to(links, { width: 0, marginRight: -gapFold, opacity: 0, duration: dur, ease: io });
        gsap.to(toggle, { width: 42, marginRight: 0, opacity: 1, duration: dur, ease: io, delay: 0.1 * k, onStart() { toggle.style.pointerEvents = "auto"; } });
        gsap.to(el, { gap: gapFold, duration: dur, ease: io });
      } else {
        setOpen(false);
        gsap.to(toggle, { width: 0, marginRight: -gapOpen, opacity: 0, duration: 0.4 * k, ease: io, onStart() { toggle.style.pointerEvents = "none"; } });
        gsap.to(links, { width: "auto", marginRight: 0, opacity: 1, duration: dur, ease: io, delay: 0.08 * k });
        gsap.to(el, { gap: gapOpen, duration: dur, ease: io, delay: 0.08 * k });
      }
    }
    const limit = () => (after ? after.getBoundingClientRect().height * at : innerHeight * at);
    const onScroll = () => setFolded(scrollY > limit());
    const onToggle = () => setOpen(!open);
    const onDoc = (e) => { if (open && !menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape" && open) setOpen(false); };
    toggle.addEventListener("click", onToggle);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      toggle.removeEventListener("click", onToggle);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
      gsap.killTweensOf([el, menu, ...items, lead, cta, links, toggle, iconMenu, iconClose].filter(Boolean));
      gsap.set([el, menu, ...items, lead, cta, links, toggle, iconMenu, iconClose].filter(Boolean), { clearProps: "all" });
      el.removeAttribute("data-folded");
    };
  });
})();
