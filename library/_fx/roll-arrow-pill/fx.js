(() => {
  kfFx.register("roll-arrow-pill", (el, { options, reduce, hover }) => {
    const roll = el.querySelector('[data-fx-part="roll"]');
    if (!roll || !roll.firstElementChild) return;
    const made = [];
    if (roll.children.length < 2) {
      const twin = roll.firstElementChild.cloneNode(true);
      twin.setAttribute("aria-hidden", "true");
      roll.append(twin);
      made.push(twin);
    }
    const arrow = el.querySelector('[data-fx-part="arrow"]');
    let svgs = arrow ? [...arrow.querySelectorAll(":scope > svg")] : [];
    if (svgs.length === 1) {
      const twin = svgs[0].cloneNode(true);
      arrow.prepend(twin);
      made.push(twin);
      svgs = [twin, svgs[0]];
    }
    // Place the two arrows one and a half cells to the left and the second sits at the circle’s center — on hover the first moves to the center
    if (svgs.length) gsap.set(svgs, { x: 0, xPercent: -50 });
    const lines = [...roll.children];
    if (reduce || !hover) return () => { made.forEach((n) => n.remove()); if (svgs.length) gsap.set(svgs, { clearProps: "transform" }); };
    const dur = +(options.dur ?? 0.3), line = +(options.line ?? 0.5), fade = +(options.fade ?? 0.4);
    const ease = kfFx.ease("0.25,0.46,0.45,0.94", "power1.out");
    const go = (inn) => {
      gsap.to(lines, { yPercent: inn ? -100 : 0, duration: dur, ease, overwrite: "auto" });
      if (svgs.length) gsap.to(svgs, { xPercent: inn ? 100 : -50, duration: dur, ease, overwrite: "auto" });
      if (line > 0) gsap.to(el, { "--fx-bd": inn ? fade : 1, duration: line, ease: "none", overwrite: "auto" });
    };
    const on = () => go(true), off = () => go(false);
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      gsap.killTweensOf([el, ...lines, ...svgs]);
      gsap.set(lines, { clearProps: "transform" });
      if (svgs.length) gsap.set(svgs, { clearProps: "transform" });
      el.style.removeProperty("--fx-bd");
      made.forEach((n) => n.remove());
    };
  });
})();
