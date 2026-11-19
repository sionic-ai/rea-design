// Hero turns on in sequence — the background (photo) fades in first, a bit later the center logo fades in, then the top headline lowers from above and the bottom line rises from below.
// The default for the fade-in curve is jQuery fadeIn’s swing(= sine.inOut), the sliding curve defaults to the CSS default ease.
(() => {
  kfFx.register("hero-cue-intro", (el, { options, reduce }) => {
    const pick = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const bg = pick("bg"), logo = pick("logo"), top = pick("top"), bottom = pick("bottom");
    const all = [...bg, ...logo, ...top, ...bottom];
    if (!all.length) return;
    const clear = () => gsap.set(all, { clearProps: "opacity,visibility,transform" });
    if (reduce) { clear(); return clear; }
    const fade = kfFx.ease(options.fade || "0.37,0,0.63,1", "sine.inOut");
    const slide = kfFx.ease(options.slide || "0.25,0.1,0.25,1", "power1.inOut");
    const tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })) });
    if (bg.length) tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: +(options["bg-dur"] ?? 1), ease: fade }, 0);
    if (logo.length) tl.fromTo(logo, { opacity: 0 }, { opacity: 1, duration: +(options["logo-dur"] ?? 0.8), ease: fade }, +(options["logo-at"] ?? 0.8));
    const at = +(options["bar-at"] ?? 0.9);
    // top-hold: show — keeps the header line visible from the start, moves it up at bar-at and brings it back down (original: the visible header line gets keyframes applied again)
    const holdTop = options["top-hold"] === "show";
    // Visibility turns on the moment sliding starts — mixing the visibility property into the tween makes it change only at the end
    if (top.length) {
      gsap.set(top, { visibility: holdTop ? "visible" : "hidden" });
      tl.set(top, { visibility: "visible" }, at).fromTo(top, { yPercent: -100 }, { yPercent: 0, duration: +(options["top-dur"] ?? 0.5), ease: slide, immediateRender: false }, at);
    }
    if (bottom.length) {
      gsap.set(bottom, { visibility: "hidden", yPercent: 100 });
      tl.set(bottom, { visibility: "visible" }, at).fromTo(bottom, { yPercent: 100 }, { yPercent: 0, duration: +(options["bottom-dur"] ?? 0.4), ease: slide, immediateRender: false }, at);
    }
    return () => { tl.kill(); clear(); };
  });
})();
