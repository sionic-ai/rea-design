(() => {
  // Page transition — clicking a same-site link drops the body panel 14px (.2s power2.out) then slides it up 14% of the screen (max 140px) (.4s power3.in), fading out in .22s starting .16s later, then navigates.
  // The arrived page waits .32s covered by a background-color curtain, then as the curtain clears in .2s, the body rises from 156px below and transparent in .78s
  kfFx.register("dip-lift-page", (el, { options, reduce }) => {
    // Keep the curtain outside the board — while the board moves, fixed elements inside it get pushed along with it
    const cover = options.cover ? document.querySelector(options.cover) : null;
    if (cover) Object.assign(cover.style, { position: "fixed", inset: "0", zIndex: "70", background: "var(--kf-bg)", pointerEvents: "none" });
    const ease = kfFx.ease("0.16,1,0.3,1", "expo.out");
    const hold = +(options.hold ?? 0.32), rise = +(options.rise ?? 156), inDur = +(options.in ?? 0.78);
    const tl = gsap.timeline();
    if (!reduce) {
      if (cover) gsap.set(cover, { autoAlpha: 1 });
      gsap.set(el, { y: rise, opacity: 0 });
      tl.to({}, { duration: hold });
      if (cover) tl.to(cover, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, ">");
      tl.to(el, { y: 0, opacity: 1, duration: inDur, ease, clearProps: "transform,opacity" }, "<");
    } else if (cover) gsap.set(cover, { autoAlpha: 0 });

    const same = (a) => a.origin === location.origin || (location.protocol === "file:" && a.protocol === "file:");
    const click = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw) || !same(a) || a.pathname === location.pathname) return;
      e.preventDefault();
      if (reduce) return (location.href = a.href);
      el.dispatchEvent(new CustomEvent("fx:leave", { bubbles: true }));
      const lift = Math.min(0.14 * innerHeight, +(options.lift ?? 140));
      gsap.killTweensOf(el);
      el.style.pointerEvents = "none";
      gsap.timeline({ delay: +(options.wait ?? 0), onComplete: () => (location.href = a.href) })
        .to(el, { y: 14, duration: 0.2, ease: "power2.out" })
        .to(el, { y: -lift, duration: 0.4, ease: "power3.in" }, ">")
        .to(el, { opacity: 0, duration: 0.22, ease: "power2.in" }, "<0.16");
    };
    document.addEventListener("click", click);
    const show = (e) => { if (e.persisted) { gsap.set(el, { clearProps: "transform,opacity" }); el.style.pointerEvents = ""; if (cover) gsap.set(cover, { autoAlpha: 0 }); } };
    addEventListener("pageshow", show);
    return () => { tl.kill(); document.removeEventListener("click", click); removeEventListener("pageshow", show); gsap.set(el, { clearProps: "transform,opacity" }); };
  });
})();
