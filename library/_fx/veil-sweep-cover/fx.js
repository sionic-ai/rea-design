(() => {
  // On open the background-color curtain lifts and the gradient curtain slides down and out a little later. Clicking a same-site link brings the gradient down to cover, the background-color curtain fills up, then it navigates.
  kfFx.register("veil-sweep-cover", (el, { options, reduce }) => {
    const veil = el.querySelector("[data-fx-part='veil']"), sweep = el.querySelector("[data-fx-part='sweep']");
    if (!veil || !sweep) return;
    if (reduce) { el.style.display = "none"; return () => el.style.removeProperty("display"); }
    const hold = +(options.hold ?? 0.3), out = +(options.out ?? 0.6), slide = +(options.slide ?? 0.7), lag = +(options.lag ?? 0.3);
    const wait = +(options.wait ?? 0.5), cover = +(options.cover ?? 0.4), fill = +(options.fill ?? 0.7);
    const tws = [];
    const open = () => {
      el.style.display = "";
      tws.push(gsap.to(veil, { autoAlpha: 0, duration: out, ease: "sine.out", delay: hold }),
        gsap.to(sweep, { backgroundPosition: "100% 100%", duration: slide, ease: "sine.out", delay: hold + lag, onComplete: () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); } }));
    };
    const close = (href) => {
      el.style.display = "";
      tws.push(gsap.fromTo(sweep, { backgroundPosition: "100% 100%" }, { backgroundPosition: "100% 0%", duration: cover, ease: "sine.out", delay: wait }),
        gsap.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: fill, ease: "sine.out", delay: wait + 0.2, onComplete: () => { if (href) location.href = href; } }));
    };
    el.fxCover = close;
    if (options.on !== "manual") open();
    else { gsap.set(veil, { autoAlpha: 0 }); el.style.display = "none"; }
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/.test(raw)) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      e.preventDefault();
      close(u.href);
    };
    if (options.nav !== "off") document.addEventListener("click", onClick);
    const onShow = (e) => { if (e.persisted) { tws.forEach((t) => t.kill()); gsap.set(veil, { autoAlpha: 0 }); el.style.display = "none"; } };
    addEventListener("pageshow", onShow);
    return () => { document.removeEventListener("click", onClick); removeEventListener("pageshow", onShow); tws.forEach((t) => t.kill()); delete el.fxCover; gsap.set([veil, sweep], { clearProps: "all" }); el.style.removeProperty("display"); };
  });
})();
