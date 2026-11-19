(() => {
  // Two-layer curtain loader — the top curtain (ink black) lifts, and when the bottom curtain (gradient) fades, the curtain is hidden and fx:done fires.
  // lift (first page): the top curtain moves up −100% after .5s over 1s power4.out · fade (sub pages): the top curtain fades after .5s over 1s power1.inOut.
  // The bottom curtain fades in 1s expo.inOut, .4s later than the top curtain’s time (.5s) — original timeline "-=1" + delay .4
  kfFx.register("sheet-lift-intro", (el, { options, reduce }) => {
    const first = el.querySelector('[data-fx-part="first"]');
    const second = el.querySelector('[data-fx-part="second"]');
    const done = () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || (!first && !second)) { done(); return () => { el.style.display = ""; }; }
    el.style.display = "";
    const dur = +(options.dur ?? 1), delay = +(options.delay ?? 0.5), lag = +(options.lag ?? 0.4);
    const look = options.look || "lift";
    const tl = gsap.timeline({ onComplete: done });
    if (first) {
      gsap.set(first, { yPercent: 0, opacity: 1 });
      if (look === "fade") tl.to(first, { opacity: 0, duration: dur, delay, ease: options.ease ? kfFx.ease(options.ease, "power1.inOut") : "power1.inOut" });
      else tl.to(first, { yPercent: -100, duration: dur, delay, ease: options.ease ? kfFx.ease(options.ease, "power4.out") : "power4.out" });
    }
    if (second) {
      // back: lift — the underlying curtain also lifts away without fading (Brand: top curtain goes to −100% with .8s expo.inOut after .1s)
      const backDur = +(options["back-dur"] ?? dur);
      const backEase = options["back-ease"] ? kfFx.ease(options["back-ease"], "expo.inOut") : "expo.inOut";
      gsap.set(second, { opacity: 1, yPercent: 0 });
      const to = options.back === "lift" ? { yPercent: -100 } : { opacity: 0 };
      tl.to(second, { ...to, duration: backDur, delay: lag, ease: backEase }, first ? `-=${dur}` : delay);
    }
    return () => { tl.kill(); el.style.display = ""; gsap.set([first, second].filter(Boolean), { clearProps: "transform,opacity" }); };
  });
})();
