// Under the menu (look: side → on the left) a small dot slides to the hovered item — by default it travels over 1s power1.inOut, shrinking to .6x (.5s) and growing back (.5s) in the meantime.
// When released, returns to the current page item (aria-current·is-current), and if there is no current item the dot turns off. Re-measures when the position shifts from fonts or window size.
(() => {
  kfFx.register("nav-dot-slide", (el, { options, reduce, hover }) => {
    const dot = el.querySelector(':scope > [data-fx-part="dot"]');
    if (!dot) return;
    const side = options.look === "side";
    const dur = +(options.dur ?? (side ? 0.6 : 1));
    const ease = options.ease ? kfFx.ease(options.ease, "power1.inOut") : "power1.inOut";
    const squeeze = +(options.squeeze ?? (side ? 1 : 0.6));
    const gap = +(options.gap ?? (side ? 7 : 11));
    const links = () => [...el.querySelectorAll('[data-fx-part="link"]')];
    const current = () => links().find((l) => l.matches('[aria-current="page"], .is-current') || l.closest('[aria-current="page"]'));
    const spot = (l) => {
      if (!l) return null;
      const r = l.getBoundingClientRect(), b = el.getBoundingClientRect(), s = dot.offsetWidth;
      return side ? { x: r.left - b.left - gap - s, y: r.top - b.top + r.height / 2 - s / 2 } : { x: r.left - b.left + r.width / 2 - s / 2, y: r.bottom - b.top + gap };
    };
    let on = null, shown = false;
    const go = (l, now) => {
      const p = spot(l);
      on = l;
      gsap.killTweensOf(dot);
      if (!p) { gsap[now || reduce ? "set" : "to"](dot, { opacity: 0, scale: 0, duration: dur / 2 }); shown = false; return; }
      if (now || reduce || !shown) { gsap.set(dot, { ...p, opacity: 1, scale: 1 }); shown = true; return; }
      gsap.to(dot, { ...p, duration: dur, ease });
      if (squeeze !== 1) gsap.timeline().to(dot, { scale: squeeze, duration: dur / 2, ease: "power1.out" }).to(dot, { scale: 1, duration: dur / 2, ease: "power1.out" });
    };
    gsap.set(dot, { opacity: 0, scale: 0 });
    go(current(), true);
    const ac = new AbortController();
    if (hover) {
      el.addEventListener("mouseover", (e) => { const l = e.target.closest('[data-fx-part="link"]'); if (l && l !== on && el.contains(l)) go(l); }, { signal: ac.signal });
      el.addEventListener("mouseleave", () => { if (on !== current()) go(current()); }, { signal: ac.signal });
    }
    const ro = new ResizeObserver(() => go(on, true));
    ro.observe(el);
    document.fonts?.ready.then(() => el.isConnected && go(on, true));
    return () => { ac.abort(); ro.disconnect(); gsap.killTweensOf(dot); gsap.set(dot, { clearProps: "transform,opacity" }); };
  });
})();
