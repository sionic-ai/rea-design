// Each manifesto line is covered with a background-color veil (transparent .68), from when the line’s top edge touches the screen center until its bottom edge touches it
// The curtain lifts from the left (clip-path inset 0 → left 100%, scrub 1) — only the line being read is sharp. Scrolling back up covers it again.
(() => {
  kfFx.register("line-veil-scrub", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const veils = lines.map((line) => {
      let v = line.querySelector('[data-fx-part="veil"]');
      const made = !v;
      if (made) { v = document.createElement("span"); v.setAttribute("data-fx-part", "veil"); v.setAttribute("aria-hidden", "true"); line.append(v); }
      return { v, made };
    });
    if (reduce) { veils.forEach(({ v }) => gsap.set(v, { clipPath: "inset(0 0 0 100%)" })); return () => veils.forEach(({ v, made }) => (made ? v.remove() : gsap.set(v, { clearProps: "clipPath" }))); }
    const lag = +(options.lag ?? 1);
    const tls = veils.map(({ v }, i) => gsap.timeline({
      scrollTrigger: { trigger: v, start: options.start || "top center", end: options.end || "bottom center", scrub: lag || true },
    }).fromTo(v, { clipPath: "inset(0 0 0 0%)" }, { clipPath: "inset(0 0 0 100%)", duration: 1, ease: "none" }));
    return () => {
      tls.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      veils.forEach(({ v, made }) => (made ? v.remove() : gsap.set(v, { clearProps: "clipPath" })));
    };
  });
})();
