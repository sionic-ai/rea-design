// Work detail — the Hero photo settles from 1.2x to 1 (1.2s power3.out) and the title line rises, slogans go from smallest in order once on screen (.55s .06)
(() => {
  const TW = window.TW, { q, qa } = TW;
  TW.start(() => {
    // Original work first view settles within .35s — title line from below (.35s power3.out .05), photo 1.08 → 1
    qa(".tw-dhero .tw-split").forEach((el) => { el.dataset.twDone = "1"; TW.lines(el, { duration: 0.4, delay: 0.15, stagger: 0.05, scroll: false }); });
    if (TW.reduce) return;
    gsap.from(".tw-dhero-img .tw-media-in", { scale: 1.08, duration: 0.4, delay: 0.15, ease: "power3.out" });
    gsap.from(qa(".tw-echo-w"), { yPercent: 100, autoAlpha: 0, duration: 0.55, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: ".tw-echo", start: "top 70%", once: true } });
    gsap.from(".tw-dblue-in .tw-media", { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".tw-dblue", start: "top 70%", once: true } });
  });
})();
