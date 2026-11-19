(() => {
  kfFx.register("curve-sweep-loader", (el, { options, reduce }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    const copy = el.querySelector('[data-fx-part="copy"]'), logo = el.querySelector('[data-fx-part="logo"]');
    const event = options.event || "";
    const root = document.documentElement;
    const done = () => {
      root.classList.remove("fx-curve-sweep-lock");
      el.style.display = "none";
      if (event) document.dispatchEvent(new CustomEvent(event));
    };
    if (!mask || reduce) { done(); return; }
    const k = +(options.speed || 1), hold = +(options.hold ?? 0.8), fade = +(options.fade ?? 0.4);
    const lock = options.lock !== "false";
    if (lock) root.classList.add("fx-curve-sweep-lock");
    const inCubic = kfFx.ease("0.55,0.055,0.675,0.19", "power2.in"), outQuad = kfFx.ease("0.25,0.46,0.45,0.94", "power2.out");
    const w = innerWidth, h = innerHeight, wide = w > 768;
    // Path of the curtain’s top-left corner — out past the right edge of the screen (wide screen w+520, phone w+340) in four segments (phone three): only the first accelerates with easeInCubic, the rest run straight
    let pts;
    if (wide) {
      const x = w + 520, y = h + 50;
      pts = [[x * 0.25, y * 0.5, 0.72, inCubic], [x * 0.35, y * 0.65, 0.08, "none"], [x * 0.6, y * 0.85, 0.1, "none"], [x, y, 0.36, "none"]];
    } else {
      const x = w + 340, y = h * 0.85;
      pts = [[x * 0.2, y * 0.6, 0.6, inCubic], [x * 0.4, y * 0.8, 0.08, "none"], [x, y, 0.2, "none"]];
    }
    const tl = gsap.timeline();
    if (copy) {
      tl.fromTo(copy, { opacity: 0 }, { opacity: 1, duration: 0.4 * k, ease: "none" }, 0.2 * k);
      tl.to(copy, { opacity: 0, duration: (wide ? 0.2 : 0.1) * k, ease: "none" }, (hold + 0.6) * k);
    }
    let t = hold * k;
    for (const [x, y, d, ease] of pts) { tl.to(mask, { left: x, top: y, duration: d * k, ease }, t); t += d * k; }
    if (logo) { tl.to(logo, { opacity: 0, duration: 0.2 * k, ease: "none" }, t + 0.6 * k); t += 0.8 * k; }
    tl.call(() => { root.classList.remove("fx-curve-sweep-lock"); if (event) document.dispatchEvent(new CustomEvent(event)); }, null, t);
    tl.to(el, { opacity: 0, duration: fade * k, ease: outQuad, onComplete: () => { el.style.display = "none"; } }, t);
    return () => {
      tl.kill();
      root.classList.remove("fx-curve-sweep-lock");
      gsap.set([el, mask, copy, logo].filter(Boolean), { clearProps: "opacity,left,top,display" });
      el.style.display = "";
    };
  });
})();
