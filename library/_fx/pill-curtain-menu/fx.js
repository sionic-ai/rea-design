(() => {
  // Pressing a pill menu cell lowers a sub panel stacked in the same spot like a curtain — the panel from top -100% and the inside from bottom 100% mesh together (1s expo.inOut)
  // The pill row turns off in .7s and the items in the panel stand up from 60px below after .3s at .05s stagger. Closing: items go back down in reverse and turn off, then the panel retracts upward again
  kfFx.register("pill-curtain-menu", (el, { options, reduce }) => {
    const bar = el.querySelector('[data-fx-part="bar"]');
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!bar || !panels.length) return;
    const dur = +(options.dur ?? 1), each = +(options.each ?? 0.7), stagger = +(options.stagger ?? 0.05), rise = +(options.rise ?? 60);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    let open = null, busy = false, tl;
    const partsOf = (p) => [...p.querySelectorAll('[data-fx-part="item"]')];
    function show(p) {
      if (busy || open === p) return;
      if (open) return hide(() => show(p));
      open = p;
      p.classList.add("is-open");
      el.classList.add("is-sub");
      if (reduce) { gsap.set(bar, { autoAlpha: 0 }); return; }
      busy = true;
      const inner = p.firstElementChild, items = partsOf(p);
      tl = gsap.timeline({ onComplete: () => { busy = false; } })
        .fromTo(bar, { autoAlpha: 1 }, { autoAlpha: 0, duration: each }, 0)
        .fromTo(p, { yPercent: -100 }, { yPercent: 0, duration: dur, ease }, 0);
      if (inner) tl.fromTo(inner, { yPercent: 100 }, { yPercent: 0, duration: dur, ease }, 0);
      if (items.length) tl.fromTo(items, { autoAlpha: 0, y: rise }, { autoAlpha: 1, y: 0, duration: each, ease: "power3.out", stagger }, 0.3 * dur);
    }
    function hide(next) {
      if (busy || !open) return;
      const p = open;
      const done = () => { p.classList.remove("is-open"); el.classList.remove("is-sub"); open = null; busy = false; gsap.set([p, p.firstElementChild, ...partsOf(p)].filter(Boolean), { clearProps: "transform,opacity,visibility" }); if (typeof next === "function") next(); };
      if (reduce) { gsap.set(bar, { autoAlpha: 1 }); return done(); }
      busy = true;
      const inner = p.firstElementChild, items = partsOf(p).reverse();
      tl = gsap.timeline({ onComplete: done });
      if (items.length) tl.fromTo(items, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: rise * 5 / 6, duration: each, ease: "power2.in", stagger }, 0);
      tl.fromTo(p, { yPercent: 0 }, { yPercent: -100, duration: dur, ease }, 0.1 * dur);
      if (inner) tl.fromTo(inner, { yPercent: 0 }, { yPercent: 100, duration: dur, ease }, 0.1 * dur);
      tl.fromTo(bar, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur }, 0.6 * dur);
    }
    const onClick = (e) => {
      const o = e.target.closest('[data-fx-part="open"]');
      if (o && el.contains(o)) { const p = panels.find((x) => x.dataset.key === o.dataset.key); if (p) { e.preventDefault(); show(p); } return; }
      if (e.target.closest('[data-fx-part="close"]')) hide();
    };
    const onKey = (e) => { if (e.key === "Escape") hide(); };
    el.addEventListener("click", onClick);
    addEventListener("keyup", onKey);
    return () => {
      el.removeEventListener("click", onClick);
      removeEventListener("keyup", onKey);
      tl && tl.kill();
      panels.forEach((p) => p.classList.remove("is-open"));
      el.classList.remove("is-sub");
      gsap.set([bar, ...panels], { clearProps: "transform,opacity,visibility" });
    };
  });
})();
