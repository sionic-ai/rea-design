(() => {
  kfFx.register("band-unfold-flip", (el, { options, reduce }) => {
    const band = el.querySelector('[data-fx-part="band"]');
    if (!band || !window.gsap) return;
    const roller = el.querySelector('[data-fx-part="roller"]');
    const narrow = matchMedia("(max-width: 899px)").matches;
    const pick = (k, wide, small) => +(options[narrow ? `m-${k}` : k] ?? (narrow ? small : wide));
    const delay = pick("delay", 1.2, 1.1), dur = pick("dur", 1.6, 1.2), flip = pick("flip", 3.6, 3.3);
    const flipDur = +(options["flip-dur"] ?? 0.6);
    const ease = kfFx.ease(options.ease || "0.44,0.05,0.55,0.94", "sine.inOut");
    el.style.setProperty("--fx-flip-dur", `${flipDur}s`);
    const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    let tl, timers = [];
    // The circle sits at the right end of the strip — go left by the strip width to reach the left end
    const span = () => band.getBoundingClientRect().width;
    const end = () => {
      gsap.set(band, { clipPath: OPEN });
      if (roller) gsap.set(roller, { x: -span() });
      if (flipDur > 0 && flip > 0) el.classList.add("fx-flipped");
      el.dispatchEvent(new CustomEvent("fx:done"));
    };
    const play = () => {
      tl?.kill(); timers.forEach(clearTimeout); timers = [];
      el.classList.remove("fx-flipped");
      if (reduce) return end();
      tl = gsap.timeline({ delay });
      tl.to(band, { clipPath: OPEN, duration: dur, ease }, 0);
      if (roller) tl.fromTo(roller, { x: 0 }, { x: () => -span(), duration: dur, ease }, 0);
      if (flipDur > 0 && flip > 0) timers.push(setTimeout(() => el.classList.add("fx-flipped"), flip * 1000));
      timers.push(setTimeout(() => el.dispatchEvent(new CustomEvent("fx:done")), Math.max(delay + dur, flip + flipDur) * 1000));
    };
    // When the window resizes, re-place the rolled end position to fit the band width
    const ro = new ResizeObserver(() => { if (roller && (!tl || !tl.isActive())) gsap.set(roller, { x: tl || reduce ? -span() : 0 }); });
    ro.observe(band);
    el.addEventListener("fx:play", play);
    if (options.on !== "event") play();
    return () => {
      tl?.kill(); timers.forEach(clearTimeout); ro.disconnect();
      el.removeEventListener("fx:play", play);
      el.classList.remove("fx-flipped");
      el.style.removeProperty("--fx-flip-dur");
      gsap.set([band, roller].filter(Boolean), { clearProps: "clipPath,transform" });
    };
  });
})();
