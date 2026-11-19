// The two strips are made by the part and laid over the film — when it splits, the film spreads to full screen (is-reveal) and shows beyond the strips
(() => {
  kfFx.register("curtain-split", (el, { options, reduce }) => {
    const bar = (k) => { const b = document.createElement("div"); b.className = `fx-bar is-${k}`; el.append(b); return b; };
    const top = bar("top"), bot = bar("bot"), film = el.querySelector('[data-fx-part="film"]');
    let tl;
    const done = () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const off = () => { tl?.kill(); top.remove(); bot.remove(); el.classList.remove("is-reveal"); if (film) gsap.set(film, { clearProps: "opacity" }); };
    if (reduce) { done(); return off; }
    // Defaults are the original values. For screens opened often like an app, use shorter ones — fx:done only fires once the strips have all exited, so the screen is covered for delay + dur. The film follows at the same ratio as the strips and ends with them
    // Curve and exit distance are also options — open-rise makes the strip exit to 150% off-screen in 1.4s expo.inOut
    const delay = +(options.delay ?? 1.1), dur = +(options.dur ?? 0.9), ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "power4.out"), travel = +(options.travel ?? 100);
    // Before splitting apart as in the reference, the strips first step back pinch px to open a gap in the middle (stretching horizontally by pinchScale), and when leaving the inner edge rounds to round %
    const pinch = +(options.pinch ?? 0), pinchAt = +(options.pinchAt ?? 0), pinchDur = +(options.pinchDur ?? 0.2), pinchScale = +(options.pinchScale ?? 2), round = +(options.round ?? 0);
    const pinchEase = kfFx.ease(options.pinchEase || "power4.in", "power4.in");
    tl = gsap.timeline({ onComplete: done });
    if (pinch) tl.to(top, { y: -pinch, scaleX: pinchScale, duration: pinchDur, ease: pinchEase }, pinchAt).to(bot, { y: pinch, scaleX: pinchScale, duration: pinchDur, ease: pinchEase }, pinchAt);
    const out = (k) => (round ? { scaleX: 1, borderRadius: k === "top" ? `0 0 ${round}% ${round}%` : `${round}% ${round}% 0 0` } : {});
    tl.add(() => el.classList.add("is-reveal"), delay)
      .to(top, { yPercent: -travel, duration: dur, ease, ...out("top") }, delay)
      .to(bot, { yPercent: travel, duration: dur, ease, ...out("bot") }, delay);
    if (film) tl.to(film, { opacity: 0, duration: (dur * 4) / 9, ease: "none" }, delay + (dur * 5) / 9);
    return off;
  });
})();
