(() => {
  kfFx.register("sticky-dim-stack", (el, { options, reduce, scroller }) => {
    const frames = [...el.querySelectorAll(":scope > [data-fx-part=frame]")];
    const bar = el.querySelector("[data-fx-part=bar]");
    if (reduce || (!frames.length && !bar)) return;
    const scale = +(options.scale ?? 0.97), bright = +(options.bright ?? 0.75);
    // scrub 0 means scrub off in ScrollTrigger (plays on enter), so it is switched straight to true (tied to scroll)
    const lag = +(options.scrub ?? 1.75), scrub = lag > 0 ? lag : true;
    const start = options.start || "70% 0%", end = options.end || "100% 90%";
    const barEnd = options["bar-end"] || "115% 100%";
    // The original gives no curve, so the GSAP default (power1.out) also applies to scrub progress
    const ease = options.ease || "power1.out";
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // The last plate has no next plate to cover it, so it is left as is. Since the end (100% 90%) comes before the start (70% 0%), it jumps over all at once at 70% of the plate,
        // scrub follows it at 1.75s — same as the original value, so even that ”abrupt switch then slow retreat” is identical
        frames.slice(0, -1).forEach((frame) => {
          const media = frame.querySelector("[data-fx-part=media]");
          if (!media) return;
          gsap.fromTo(media, { scale: 1, "--fx-dim": 1 }, { scale, "--fx-dim": bright, ease, scrollTrigger: { scroller, trigger: frame, start, end, scrub } });
        });
        if (bar) gsap.fromTo(bar, { height: "0%" }, { height: "100%", ease, scrollTrigger: { scroller, trigger: el, start: "0% 0%", end: barEnd, scrub: true } });
      });
    }, el);
    return () => fxCtx.revert();
  });
})();
