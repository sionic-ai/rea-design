(() => {
  // The color curtain (first) starts lifting upward and .1s later the stage-color curtain (second) beneath it lifts shorter and finishes first — the two curtains pass overlapping, going dark once and then opening.
  // when: external — if arriving from within the same site, open immediately with no cover (the page-transition part steps in instead)
  kfFx.register("twin-curtain-intro", (el, { options, reduce }) => {
    const first = el.querySelector('[data-fx-part="first"]');
    const second = el.querySelector('[data-fx-part="second"]');
    const done = () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true })); };
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin && document.referrer !== location.href; } catch (e) {}
    if (!first || reduce || (options.when === "external" && same)) { done(); return () => { el.style.display = ""; }; }
    const delay = +(options.delay ?? 0.5), dur = +(options.dur ?? 1);
    const lag = +(options.lag ?? 0.1), dur2 = +(options.dur2 ?? 0.8);
    const tl = gsap.timeline({ onComplete: done });
    tl.to(first, { yPercent: -100, duration: dur, ease: kfFx.ease(options.ease || "power4.out", "power4.out") }, delay);
    if (second) tl.to(second, { yPercent: -100, duration: dur2, ease: kfFx.ease(options.ease2 || "expo.inOut", "expo.inOut") }, delay + lag);
    return () => { tl.kill(); gsap.set([first, second].filter(Boolean), { clearProps: "transform" }); el.style.display = ""; };
  });
})();
