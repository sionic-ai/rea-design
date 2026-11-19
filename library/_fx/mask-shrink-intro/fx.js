(() => {
  // Inside a curtain covering the screen, the image (video) appears larger than the screen along with its shape mask, then after a few seconds the mask shrinks to a small window size and the curtain lifts.
  // For video, start after receiving loadeddata (as in the original) — so the first scene doesn’t look empty
  kfFx.register("mask-shrink-intro", (el, { options, reduce }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    const media = el.querySelector('[data-fx-part="media"]') || mask?.firstElementChild;
    if (!mask || !media) return;
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const clear = () => { gsap.set([el, mask, media, ...frames], { clearProps: "all" }); };
    if (reduce) { gsap.set(el, { autoAlpha: 0 }); done(); return clear; }
    const from = +(options.from ?? 120), to = +(options.to ?? 279), delay = +(options.delay ?? 1);
    const hold = +(options.hold ?? 4), dur = +(options.dur ?? 3), fade = +(options.fade ?? 2), shrink = +(options.shrink ?? 0.5);
    const big = (document.documentElement.clientWidth / 100) * from;
    const k = big / to;
    gsap.set(mask, { maskSize: `${big}px`, webkitMaskSize: `${big}px` });
    if (frames.length) gsap.set(frames, { scale: k });
    gsap.set(media, { opacity: 0 });
    const tl = gsap.timeline({ paused: true, onComplete: done });
    tl.to(media, { opacity: 1, duration: 0.5, delay, ease: "power3.out" })
      .call(() => media.play?.()?.catch?.(() => {}), null, ">0.2")
      .fromTo(mask, { maskSize: `${big}px`, webkitMaskSize: `${big}px` }, { maskSize: `${to}px`, webkitMaskSize: `${to}px`, duration: dur, ease: "power2.out" }, `<${hold}`);
    if (frames.length) tl.fromTo(frames, { scale: k }, { scale: 1, duration: dur, ease: "power2.out" }, "<");
    tl.to(media, { scale: shrink, duration: dur, ease: "power2.inOut" }, "<0.6")
      .to(el, { autoAlpha: 0, duration: fade, ease: "power2.inOut" }, "<");
    let wait = null;
    if (media.tagName === "VIDEO" && media.readyState < 2) {
      wait = () => tl.play();
      media.addEventListener("loadeddata", wait, { once: true });
    } else tl.play();
    return () => { tl.kill(); if (wait) media.removeEventListener("loadeddata", wait); clear(); };
  });
})();
