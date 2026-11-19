// Two lines (or one hidden underline) and two arrows exit and enter like passing a baton — on release they go back the way they came
(() => {
  kfFx.register("baton-line-cta", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const under = options.look === "underline";
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const lineDur = +(options.line ?? (under ? 0.6 : 0.7)), arrowDur = +(options.arrow ?? 0.5);
    const lag = options.lag;
    // underline type: some originals differ in length · curve · distance between entering and leaving — if not given, same as entering
    const fromP = +(options.from ?? -110), toP = +(options.to ?? 110);
    const outDur = +(options.out ?? lineDur), outEase = options["out-ease"] ? kfFx.ease(options["out-ease"], "power4.inOut") : ease;
    let lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    let rail = null;
    if (!lines.length) {
      rail = document.createElement("span");
      rail.className = "fx-baton-rail";
      rail.setAttribute("aria-hidden", "true");
      rail.innerHTML = under ? '<i data-fx-part="line"></i>' : '<i data-fx-part="line"></i><i data-fx-part="line"></i>';
      el.append(rail);
      lines = [...rail.children];
    }
    const arrows = [...el.querySelectorAll('[data-fx-part="arrow"]')];
    if (under) gsap.set(lines[0], { xPercent: fromP });
    else if (lines[1]) gsap.set(lines[1], { xPercent: -110 });
    if (arrows[1]) gsap.set(arrows[1], { xPercent: -110 });
    const pair = (a, b, on, dur, gap) => {
      if (a) gsap.to(a, { xPercent: on ? 110 : 0, delay: on ? 0 : gap, duration: dur, ease, overwrite: true });
      if (b) gsap.to(b, { xPercent: on ? 0 : -110, delay: on ? gap : 0, duration: dur, ease, overwrite: true });
    };
    const go = (on) => {
      if (under) {
        if (on) gsap.fromTo(lines[0], { xPercent: fromP }, { xPercent: 0, duration: lineDur, ease, overwrite: true });
        else gsap.to(lines[0], { xPercent: toP, duration: outDur, ease: outEase, overwrite: true });
      } else pair(lines[0], lines[1], on, lineDur, +(lag ?? 0.1));
      if (arrows.length > 1) pair(arrows[0], arrows[1], on, arrowDur, +(lag ?? 0.05));
    };
    const enter = () => go(true), leave = () => go(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf([...lines, ...arrows]);
      gsap.set([...lines, ...arrows], { clearProps: "transform" });
      rail?.remove();
    };
  });
})();
