// Entering is a CSS transition (runs when fx-in is added), leaving sets the GSAP timeline progress from the scroll value
(() => {
  kfFx.register("swing-tilt-in", (el, { options, reduce }) => {
    const ac = new AbortController(), on = { signal: ac.signal };
    let raf = 0;
    const show = () => (raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => el.classList.add("fx-in")))));
    if (options.wait === "ready" && !document.documentElement.classList.contains("kf-ready")) document.addEventListener("kf-ready", show, { once: true, signal: ac.signal });
    else show();
    let tl = null;
    const out = +(options.out ?? 0);
    if (out > 0 && !reduce) {
      const lag = +(options.lag ?? 0), span = +(options.span ?? 0.7 + lag);
      const IN = { opacity: 1, xPercent: 0, x: 0, y: 0, rotateY: 0, rotateX: 0, transformPerspective: 1000 };
      tl = gsap.timeline({ paused: true });
      tl.fromTo(el, IN, { opacity: 0, xPercent: -50, x: 222.2, y: +(options.y ?? -120), rotateY: -60, rotateX: -35, transformPerspective: 1000, ease: "sine.in", duration: 0.7, immediateRender: false }, lag);
      if (span > tl.duration()) tl.set({}, {}, span);
      let live = false, queued = false;
      const tick = () => {
        queued = false;
        if (!el.classList.contains("fx-in")) return;
        // Turn off the transition on the first scroll so it doesn’t fight the scrub
        if (!live) (el.style.transition = "none"), (live = true);
        tl.progress(Math.min(1, Math.max(0, scrollY / (innerHeight * out))));
      };
      addEventListener("scroll", () => queued || ((queued = true), requestAnimationFrame(tick)), { passive: true, signal: ac.signal });
    }
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      tl?.kill();
      gsap.set(el, { clearProps: "all" });
      el.classList.remove("fx-in");
    };
  });
})();
