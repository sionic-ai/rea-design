HR.page("about", (box) => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero H — after the loader lifts, scattered orange pieces gather into place, lines are drawn, then the pieces drop out
    const logo = box.querySelector(".ha-hero__logo");
    if (!logo) return;
    const paths = logo.querySelectorAll("path");
    paths.forEach((p) => { const n = p.getTotalLength(); gsap.set(p, { strokeDasharray: n, strokeDashoffset: n }); });
    const blks = logo.querySelectorAll(".ha-hero__blk");
    gsap.set(blks, { opacity: 0, x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(-60, 60), scale: 1.4 });
    const tl = gsap.timeline({ paused: true });
    tl.to(blks, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1, ease: "expo.out", stagger: 0.08 }, 0)
      .to(paths, { strokeDashoffset: 0, duration: 1.3, ease: "power1.out", stagger: { amount: 0.6 } }, 0.2)
      .to(blks, { opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }, 1.6);
    const go = () => gsap.delayedCall(0.3, () => tl.play());
    document.querySelector(".hr-loader.is-done") && HR.booted ? go() : HR.loaderDone.then(go);
    return () => tl.kill();
  });
  HR.booted = true;
  return () => mm.revert();
});
