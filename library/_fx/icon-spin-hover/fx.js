// Each time it enters, it spins one full turn again from 0° — no rewind on exit (rewinds if back: on). After spinning, transform is cleared so it doesn’t mix with other hover shapes.
(() => {
  kfFx.register("icon-spin-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const icon = el.querySelector('[data-fx-part="icon"]') || el;
    const turn = +(options.turn ?? 360), dur = +(options.dur ?? 0.7);
    const ease = kfFx.ease(options.ease || "power1.in", "power1.in");
    // Original applies only on windows 1024px or wider — min turns it off below that width
    const wide = options.min ? matchMedia(`(min-width: ${+options.min}px)`) : null;
    const back = options.back === "on" || options.back === "true";
    let tl;
    const on = () => {
      if (wide && !wide.matches) return;
      tl?.kill();
      // The rewind type stays at the fully turned position (turn) — clearing it would snap to 0° with the hand still over it
      tl = gsap.timeline();
      if (!back) tl.set(icon, { rotate: 0 });
      tl.to(icon, { rotate: turn, duration: dur, ease });
      if (!back) tl.set(icon, { clearProps: "transform" });
    };
    // back: on — like the original set with CSS transition, on release it rewinds from the current angle to 0° over the same length
    const off = () => {
      if (!back || !tl) return;
      tl.kill();
      tl = gsap.timeline().to(icon, { rotate: 0, duration: dur, ease }).set(icon, { clearProps: "transform" });
    };
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); tl?.kill(); gsap.set(icon, { clearProps: "transform" }); };
  });
})();
