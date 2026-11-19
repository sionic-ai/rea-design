// Hero splash — exactly the original Wc() timeline. The total length is fit to 9 seconds with totalDuration(9) (originally 11 seconds → 1.22x faster).
// On a white curtain (lighten) a black logo: a photo scaled 5x only at the letter area shows through and shrinks to 2.8x, then at 5s the curtain lifts and the photo settles 1.3→1.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const a1 = document.querySelector("#heroLogo"), a2 = document.querySelector("#heroLogo2");
  if (a1) a1.innerHTML = window.rkLogo();
  if (a2) a2.innerHTML = window.rkLogo();
  const done = () => { document.body.classList.remove("isInSplash"); window.rkReveal(); };
  if (reduce || !a1) { done(); return; }

  // The original waits for imagesLoaded(#wrapper) — the placeholder has no images, so it starts once fonts are ready
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    const tl = gsap.timeline();
    tl.fromTo("#heroLogo .textParts", { opacity: 0, y: 10 }, { duration: 3.6, opacity: 1, y: 0, ease: "back(2)", stagger: 0.5 }, "mountain")
      .fromTo("#bg", { scale: 5 }, { duration: 4, scale: 2.8, ease: "none" }, "mountain")
      .to("#heroLogo .parts1", { duration: 2, clipPath: "inset(0 0% 0 0)", ease: "power1.out" }, "mountain+=.5")
      .to("#heroLogo .parts6", { duration: 1, opacity: 1 }, "mountain+=1.5")
      .fromTo("#bg", { scale: 1.3 }, { duration: 6, scale: 1, ease: "power4.out", onStart: done }, "mountain+=5")
      .to("#heroLogoArea1", { duration: 1, autoAlpha: 0, ease: "power1.out" }, "mountain+=5")
      .to("#heroLogoArea2", { duration: 2, y: 0, autoAlpha: 1, ease: "power1.out" }, "mountain+=5.3");
    tl.totalDuration(9);
    tl.play();
  });
})();
