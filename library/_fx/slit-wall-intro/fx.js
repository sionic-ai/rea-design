// Hero where four white walls open a vertical gap in the center and then move outward — the original changes state with setTimeout 200·1300ms and moves each wall with framer-motion
(() => {
  kfFx.register("slit-wall-intro", (el, { options, reduce }) => {
    const done = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const skipKey = options.skip;
    let skipped = false;
    // As in the original, read and clear immediately — if left, the wall won’t rise again after a refresh
    try { skipped = !!skipKey && sessionStorage.getItem(skipKey) === "1"; if (skipped) sessionStorage.removeItem(skipKey); } catch (e) { skipped = false; }
    if (reduce || skipped) { queueMicrotask(done); return () => el.classList.remove("is-done"); }

    const open = +(options.open ?? 0.2), exit = +(options.exit ?? 1.3), dur = +(options.dur ?? 0.7), gap = +(options.gap ?? 50);
    if (options.window != null) el.style.setProperty("--fx-win", `${+options.window}rem`);
    const ease = kfFx.ease("0.76,0,0.24,1", "power3.inOut");
    const made = ["top", "bot", "left", "right"].map((k) => {
      const w = document.createElement("i");
      w.className = `fx-wall is-${k}`;
      el.prepend(w);
      return w;
    });
    const [top, bot, left, right] = made;
    const lead = el.querySelector('[data-fx-part="lead"]');
    const lock = options.lock !== "off";
    const root = document.documentElement;
    const was = root.style.overflow;
    if (lock) root.style.overflow = "hidden";
    const unlock = () => { if (lock) root.style.overflow = was; window.lenis?.start?.(); };
    if (lock) window.lenis?.stop?.();

    const tl = gsap.timeline({ onComplete: () => { unlock(); done(); } });
    tl.set([left, right], { clipPath: "inset(0px 0px 0px 0px)" }, 0)
      .to(left, { clipPath: `inset(0px ${gap}px 0px 0px)`, duration: 1, ease }, open)
      .to(right, { clipPath: `inset(0px 0px 0px ${gap}px)`, duration: 1, ease }, open);
    if (lead) tl.to(lead, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, open);
    tl.to(top, { yPercent: -100, duration: dur, ease }, exit)
      .to(bot, { yPercent: 100, duration: dur, ease }, exit)
      .to(left, { xPercent: -100, duration: dur, ease }, exit)
      .to(right, { xPercent: 100, duration: dur, ease }, exit);

    return () => {
      tl.kill();
      made.forEach((w) => w.remove());
      if (lead) gsap.set(lead, { clearProps: "opacity,visibility" });
      unlock();
      el.classList.remove("is-done");
    };
  });
})();
