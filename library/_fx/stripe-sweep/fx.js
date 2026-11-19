// n slanted bands sweep from off-screen at bottom right to top left — the scene is switched at the moment everything is covered (the midpoint), and the bands clear in the remaining half.
// Each strip gets a random size, position, color (one of --fx-line-1~4) and start order, so the cover looks different every time
(() => {
  kfFx.register("stripe-sweep", (el, { options, reduce }) => {
    const n = +options.count || 200, dur = +(options.dur ?? 0.5), each = +(options.each ?? 0.0015), hold = +(options.hold ?? 0.05);
    const angle = +(options.angle ?? -70), easeIn = kfFx.ease(options["ease-in"] || "", "power2.in"), easeOut = kfFx.ease(options["ease-out"] || "", "power2.out");
    const rand = (a, b) => Math.random() * (b - a) + a;
    const box = document.createElement("div");
    box.className = "fx-stripes";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.style.cssText = `width:${rand(2, 12)}vw;height:${rand(40, 120)}vh;right:${rand(-60, 10)}%;top:${rand(-50, 100)}%;background:var(--fx-line-${1 + Math.floor(Math.random() * 4)})`;
      box.append(s);
    }
    // Must sit inside the attached element so it inherits that element’s --fx-line-* (a site variable that changes per panel)
    el.append(box);
    const lines = box.children;
    gsap.set(lines, { x: "120vw", y: "50vh", rotation: angle });
    let tl = null;
    // Anything to be called at the midpoint is received as detail.midway, and at the same moment fx:midway is sent to el — the app switches screens on this event
    const sweep = (midway) => {
      const mid = () => { midway?.(); el.dispatchEvent(new CustomEvent("fx:midway")); };
      if (reduce) { mid(); return; }
      tl?.progress(1);
      gsap.set(box, { visibility: "visible" });
      tl = gsap.timeline({ onComplete: () => gsap.set(box, { visibility: "hidden" }) })
        .fromTo(lines, { x: "120vw", y: "50vh" }, { x: "0vw", y: "0vh", duration: dur, ease: easeIn, stagger: { each, from: "random" } })
        .add(mid)
        .to(lines, { x: "-120vw", y: "-50vh", duration: dur, ease: easeOut, stagger: { each, from: "random" } }, `+=${hold}`);
    };
    const onEvent = (e) => sweep(e.detail?.midway);
    const onClick = (e) => { if (e.target.closest?.('[data-fx-part="trigger"]')) sweep(); };
    el.addEventListener("fx:sweep", onEvent);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("fx:sweep", onEvent);
      el.removeEventListener("click", onClick);
      tl?.kill();
      box.remove();
    };
  });
})();
