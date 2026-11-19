(() => {
  kfFx.register("stalker-dot-hover", (el, { options, reduce, hover }) => {
    const dot = el.querySelector(":scope > [data-fx-part=dot]");
    if (!dot || !hover) return;
    const sel = options.targets || "[data-fx-part=target]";
    const dur = reduce ? 0 : +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    // Dot color reads --fx-dot from the link — in the original it is moonwhite over the header menu and jet black over the black footer
    const colorOf = (a) => getComputedStyle(a).getPropertyValue("--fx-dot").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-raised").trim();
    let on = null;
    const enter = (e) => {
      const a = e.target.closest && e.target.closest(sel);
      if (!a || a === on) return;
      on = a;
      // The dot sits at the stage’s top left (0,0), so the distance to the link center is the value to move — original formula as is
      const r = a.getBoundingClientRect(), m = el.getBoundingClientRect();
      const x = r.left + r.width / 2 - m.left - dot.offsetWidth / 2;
      const y = r.top + r.height / 2 - m.top - dot.offsetHeight / 2;
      gsap.to(dot, { x, y, backgroundColor: colorOf(a), opacity: 1, duration: dur, ease, overwrite: "auto" });
    };
    const leave = (e) => {
      const a = e.target.closest && e.target.closest(sel);
      if (!a || a !== on || (e.relatedTarget && a.contains(e.relatedTarget))) return;
      on = null;
      gsap.to(dot, { opacity: 0, duration: dur, ease, overwrite: "auto" });
    };
    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);
    return () => {
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
      gsap.killTweensOf(dot);
      gsap.set(dot, { clearProps: "transform,opacity,backgroundColor" });
    };
  });
})();
