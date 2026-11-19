// Emphasis text: title letters laid down faint (.2), tied to scroll from when the title top is at 90% of the screen until the title center reaches 40% of the screen
// Darken letters in order from the first (.1 between letters, no easing curve) — brand (Osmo Highlight Text on Scroll)
(() => {
  kfFx.register("char-highlight-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim() || !window.SplitText) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    let tl;
    // If tint is given, instead of fading, the text color changes from --fx-tint-from (default --kf-dim) to the element’s text color — briefly attached so color-mix inside variables is also read, then the computed color is measured
    let tintFrom = null;
    if (options.tint != null) {
      const probe = document.createElement("i");
      probe.style.color = "var(--fx-tint-from, var(--kf-dim))";
      el.append(probe);
      tintFrom = getComputedStyle(probe).color;
      probe.remove();
    }
    // With line, each line starts later by that amount (Brand: .4 between lines) — if absent, the whole sentence runs in sequence like one line
    const line = options.line == null ? null : +options.line;
    const split = new SplitText(el, {
      type: line == null ? "words,chars" : "lines,words,chars", wordsClass: "fx-chs-word", autoSplit: true,
      onSplit(self) {
        tl?.scrollTrigger?.kill(); tl?.kill();
        const scrub = options.scrub == null ? true : +options.scrub;
        const parts = options.unit === "words" ? self.words : self.chars;
        const from = tintFrom
          ? { color: tintFrom, stagger: +(options.each ?? 0.1), ease: "none" }
          : { autoAlpha: +(options.fade ?? 0.2), stagger: +(options.each ?? 0.1), ease: "none" };
        // dur: time for one letter to darken (GSAP default .5) · lead: empty share before the first letter · span: the front ratio of the start→end range used for darkening — brand (Framer Animated Text: letter 1 · stagger .1 · delay 2 · scroll 0~.6)
        if (options.dur != null) from.duration = +options.dur;
        const lead = +(options.lead ?? 0);
        // track — if the text is inside a screen-fixed panel, it measures the long outer range (nearest ancestor) instead of the fixed spot (Brand 200svh range)
        const trigger = (options.track && el.closest(options.track)) || el;
        tl = gsap.timeline({ scrollTrigger: { scroller, trigger, scrub, start: options.start || "top 90%", end: options.end || "center 40%" } });
        if (line == null) tl.from(parts, from, lead);
        else self.lines.forEach((l, i) => { const row = parts.filter((c) => l.contains(c)); if (row.length) tl.from(row, from, lead + i * line); });
        const span = options.span == null ? 1 : +options.span;
        if (span > 0 && span < 1) tl.to({}, { duration: tl.duration() * (1 / span - 1) }, tl.duration());
        return tl;
      },
    });
    return () => { tl?.scrollTrigger?.kill(); tl?.kill(); split.revert(); };
  });
})();
