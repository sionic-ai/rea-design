(() => {
  // Original Name bubble menu: pressing the button stands the panel upright, and big pills burst out from −10° · .8x · transparent at their own tilts in .45s power3.out (.08 apart),
  // Small pills come forward .25s at −8° with .06 stagger, then the lower group (social) comes forward another .25s. On narrow screens no tilt, 20px from below at .07 stagger power2.out.
  // The board background takes the next color (--fx-tone-0…) each time it opens and continues across the session. Closing makes the board vanish at once.
  kfFx.register("bubble-pill-menu", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel || !window.gsap) return;
    const wide = matchMedia(`(min-width: ${options.wide || 1025}px)`);
    const tones = Math.max(1, +options.tones || 4), key = "fx-bubble-tone";
    const dur = +(options.dur ?? 0.45), each = +(options.each ?? 0.08), subEach = +(options.subEach ?? 0.06), overlap = +(options.overlap ?? 0.25);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const parts = () => {
      const pills = [...panel.querySelectorAll('[data-fx-part="pill"]')], subs = [...panel.querySelectorAll('[data-fx-part="sub"]')], extra = [...panel.querySelectorAll('[data-fx-part="extra"]')];
      return { pills, subs, extra, all: [...pills, ...subs, ...extra] };
    };
    const rot = (i, n) => +(n.dataset.key || 0);
    let open = false, tl = null, tone = 0;
    try { tone = parseInt(sessionStorage.getItem(key), 10) || 0; } catch (e) {}
    const status = () => { el.classList.toggle("is-open", open); for (let i = 0; i < tones; i++) el.classList.toggle(`is-tone-${i}`, i === tone % tones); };
    const first = parts();
    if (first.all.length && !reduce) gsap.set(first.all, { scale: 0.8, opacity: 0 });
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    const set = (next) => {
      if (next === open) return;
      open = next;
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      const p = parts();
      tl?.kill();
      if (!p.all.length) { status(); return; }
      gsap.killTweensOf(p.all);
      if (!open) { gsap.set(p.all, { scale: 0.8, rotation: 0, opacity: 0, y: 0 }); status(); return; }
      if (reduce) { gsap.set(p.all, { scale: 1, opacity: 1, y: 0, rotation: (i, n) => (wide.matches ? rot(i, n) : 0) }); }
      // As in the original, burst on the frame after the board is set — if hooked on the same frame, it passes before the first cell is drawn
      else requestAnimationFrame(() => { if (!open) return; play(p); });
      status();
      tone = (tone + 1) % tones;
      try { sessionStorage.setItem(key, String(tone)); } catch (e) {}
      setTimeout(() => panel.querySelector("a[href], button")?.focus({ preventScroll: true }), 50);
    };
    const play = (p) => {
      tl?.kill();
      if (wide.matches) {
        tl = gsap.timeline();
        if (p.pills.length) tl.fromTo(p.pills, { scale: 0.8, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: rot, duration: dur, ease, stagger: each });
        if (p.subs.length) tl.fromTo(p.subs, { scale: 0.8, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: rot, duration: dur, ease, stagger: subEach }, p.pills.length ? `-=${overlap}` : 0);
        if (p.extra.length) tl.fromTo(p.extra, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: dur, ease }, tl.duration() ? `-=${overlap}` : 0);
      } else {
        tl = gsap.fromTo(p.all, { opacity: 0, y: 20, scale: 0.8, rotation: 0 }, { opacity: 1, y: 0, scale: 1, duration: dur, stagger: 0.07, ease: "power2.out" });
      }
    };
    const onToggle = () => set(!open);
    const onPanel = (e) => { if (e.target === panel) set(false); };
    const onKey = (e) => { if (e.key === "Escape" && open) { set(false); toggle.focus(); } };
    toggle.addEventListener("click", onToggle);
    panel.addEventListener("click", onPanel);
    document.addEventListener("keydown", onKey);
    status();
    return () => {
      tl?.kill();
      toggle.removeEventListener("click", onToggle);
      panel.removeEventListener("click", onPanel);
      document.removeEventListener("keydown", onKey);
      const p = parts();
      if (p.all.length) gsap.set(p.all, { clearProps: "transform,opacity" });
      panel.hidden = false;
      el.classList.remove("is-open"); for (let i = 0; i < tones; i++) el.classList.remove(`is-tone-${i}`);
    };
  });
})();
