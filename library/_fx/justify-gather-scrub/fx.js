// Gathering spread-out words: split the text into lines and words, spread each line’s words evenly to the full panel width (justified) and hold them, until the line’s top edge reaches 60% from the bottom of the screen
// Gathers into place following scroll (power2.out, scrub .2) — the Brand ”How we score” paragraph.
(() => {
  kfFx.register("justify-gather-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger || !window.SplitText) return;
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    if (!texts.length) texts.push(el);
    if (!texts.some((t) => t.textContent.trim())) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const start = options.start || "top bottom", end = options.end || "top 60%", scrub = +(options.scrub ?? 0.2);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    let ctx = null, splits = [], dead = false, timer = 0, lastW = -1;
    const undo = () => { ctx?.revert(); ctx = null; splits.forEach((s) => s.revert()); splits = []; };
    const build = () => {
      if (dead) return;
      const w = el.clientWidth;
      if (w === lastW && ctx) return;
      lastW = w;
      undo();
      ctx = gsap.context(() => {
        for (const t of texts) splits.push(SplitText.create(t, { type: "lines, words", linesClass: "fx-jg-line", wordsClass: "fx-jg-word" }));
        const box = el.getBoundingClientRect();
        el.querySelectorAll(".fx-jg-line").forEach((line) => {
          const words = [...line.querySelectorAll(".fx-jg-word")];
          if (!words.length) return;
          const sum = words.reduce((a, b) => a + b.getBoundingClientRect().width, 0);
          const gap = words.length > 1 ? Math.max(box.width - sum, 0) / (words.length - 1) : 0;
          let at = 0;
          words.forEach((wd, i) => {
            const r = wd.getBoundingClientRect();
            gsap.set(wd, { x: at - (r.left - box.left), force3D: true });
            at += r.width + (i < words.length - 1 ? gap : 0);
          });
          gsap.to(words, { x: 0, ease, scrollTrigger: { trigger: line, scroller, start, end, scrub, invalidateOnRefresh: true } });
        });
      }, el);
      ScrollTrigger.refresh();
    };
    const soon = () => { clearTimeout(timer); timer = setTimeout(build, 120); };
    const ro = new ResizeObserver(soon);
    ro.observe(el);
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(build));
    return () => { dead = true; clearTimeout(timer); ro.disconnect(); undo(); };
  });
})();
