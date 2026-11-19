(() => {
  // Curtain with the bottom edge tilted left — the right side comes down first and the left end follows from one and a half screens above, so the panel unfolds diagonally
  const SHUT = "polygon(0% 0%, 100% 0%, 100% 0%, 0% -50%)";
  const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const LEAVE_FROM = "polygon(0% 0%, 100% 0%, 100% 150%, 0% 100%)";
  const GONE = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";

  kfFx.register("slant-clip-reveal", (el, { options, reduce }) => {
    const on = options.on || "load";
    const dur = +(options.dur ?? 1.4);
    const delay = +(options.delay ?? 0);
    const outDur = +(options["out-dur"] ?? 1);
    const ease = kfFx.ease(options.ease || "0.496,0.004,0,1", "expo.inOut");
    const outEase = kfFx.ease(options["out-ease"] || "0.87,0,0.13,1", "expo.inOut");
    let tw = null;

    const open = () => {
      tw?.kill();
      el.dispatchEvent(new CustomEvent("fx:opening", { bubbles: true }));
      if (reduce) { gsap.set(el, { clipPath: OPEN, visibility: "visible" }); return; }
      tw = gsap.fromTo(el, { clipPath: SHUT, visibility: "visible" }, {
        clipPath: OPEN, duration: dur, delay: on === "load" ? delay : 0, ease,
        onComplete: () => el.dispatchEvent(new CustomEvent("fx:opened", { bubbles: true })),
      });
    };
    const close = () => {
      tw?.kill();
      if (reduce) { gsap.set(el, { clipPath: GONE, visibility: "hidden" }); return; }
      tw = gsap.fromTo(el, { clipPath: LEAVE_FROM }, {
        clipPath: GONE, duration: outDur, ease: outEase,
        onComplete: () => { gsap.set(el, { visibility: "hidden" }); el.dispatchEvent(new CustomEvent("fx:closed", { bubbles: true })); },
      });
    };

    if (on === "load") { open(); return () => { tw?.kill(); gsap.set(el, { clearProps: "clipPath,visibility" }); }; }

    // on: open — the consuming side sets data-open "true"/"false" Switching to it opens and retracts (menu drawer, page-turn curtain)
    gsap.set(el, { clipPath: el.dataset.open === "true" ? OPEN : GONE, visibility: el.dataset.open === "true" ? "visible" : "hidden" });
    let was = el.dataset.open === "true";
    const mo = new MutationObserver(() => {
      const now = el.dataset.open === "true";
      if (now === was) return;
      was = now;
      now ? open() : close();
    });
    mo.observe(el, { attributes: true, attributeFilter: ["data-open"] });
    return () => { mo.disconnect(); tw?.kill(); gsap.set(el, { clearProps: "clipPath,visibility" }); };
  });
})();
