// Motion attached per section type — via Taxi, finds and hooks only the sections on whichever screen is entered (same approach as the original app.js)
(() => {
  const { reduce, mqMobile } = window.CO;

  /* Racket picker — original: title words light up in turn by .1 from 0 while the card section moves from 40% of its bottom → above the screen,
     From when the card section’s bottom touches −100px above the screen until the card panel’s top edge touches the screen top, the top row scatters −20% and the bottom row 20% (.33)
     Photo box goes from below 75vh at .5x to its place at 1x, inner photo from 1.8x to 1x (1) */
  CO.onMount((view) => {
    const cfg = view.querySelector(".co-config");
    const before = view.querySelector(".co-rgrid");
    if (!cfg || !before || reduce) return;
    const title = cfg.querySelector(".co-config__title");
    const split = SplitText.create(title, {
      type: "words", autoSplit: true,
      onSplit: (s) => gsap.timeline({ scrollTrigger: { scrub: true, trigger: before, start: "bottom 40%", end: "bottom top" } }).from(s.words, { autoAlpha: 0, stagger: 0.1 }),
    });
    gsap.timeline({ scrollTrigger: { trigger: before, start: "bottom top-=100px", endTrigger: cfg.querySelector(".co-config__main"), end: "top top", scrub: true } })
      .to(cfg.querySelector(".top-line"), { autoAlpha: 0, xPercent: -20, duration: 0.33, ease: "none" })
      .to(cfg.querySelector(".bottom-line"), { autoAlpha: 0, xPercent: 20, duration: 0.33, ease: "none" }, "<")
      .from(cfg.querySelector(".co-config__bgimg"), { y: "75vh", scale: 0.5, ease: "none", duration: 1 }, "<")
      .from(cfg.querySelector(".co-config__bgimg > *"), { scale: 1.8, ease: "none", duration: 1 }, "<");
    return () => split.revert();
  });

  /* Pinned feature — the progress bar fills as it passes the list on the right (original values unreadable, so scrub from list top to bottom). On phone the video darkens to .2 */
  CO.onMount((view) => {
    const feat = view.querySelector(".co-feat");
    if (!feat || reduce) return;
    const list = feat.querySelector(".co-feat__scroll");
    gsap.fromTo(feat.querySelector(".co-feat__fill"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: list, start: "top top", end: "bottom bottom", scrub: true } });
    const mm = gsap.matchMedia();
    mm.add("(max-width: 959px)", () => {
      gsap.to(feat.querySelector(".co-feat__video"), { opacity: 0.2, scrollTrigger: { trigger: list, start: "top bottom", end: "top 50%", scrub: true } });
    });
    return () => mm.revert();
  });

  /* News signup form — doesn’t send, just says thanks */
  CO.onMount((view) => {
    const f = view.querySelector(".co-form");
    if (!f) return;
    f.addEventListener("submit", (e) => { e.preventDefault(); f.classList.add("is-sent"); });
  });

  void mqMobile;
})();
