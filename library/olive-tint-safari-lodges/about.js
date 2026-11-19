// About — timeline: the year panel is pinned throughout the section, and while the next cell’s top edge passes from screen bottom → center (scrub .5) the current year goes up and the next year rises from below.
(() => {
  const T = window.T;
  const sec = document.querySelector(".t-tl");
  if (!sec) return;
  const counter = sec.querySelector(".t-tl__counter"), blocks = [...sec.querySelectorAll(".t-tl__block")];
  const run = () => {
    const splits = [...sec.querySelectorAll(".t-tl__year")].map((y, i) => {
      const s = SplitText.create(y, { type: "chars", charsClass: "char", aria: "none" });
      gsap.set(s.chars, { yPercent: i ? 100 : 0 });
      return s;
    });
    if (T.reduce) return;
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", pin: counter, pinSpacing: false, scrub: true });
    let k = 0;
    for (let i = 1; i < blocks.length; i++) {
      if (blocks[i - 1].dataset.year === blocks[i].dataset.year) continue;
      const a = splits[k], b = splits[k + 1];
      ScrollTrigger.create({
        trigger: blocks[i], start: "top bottom", end: "top center", scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const p = st.progress;
          gsap.set(a.chars, { yPercent: -100 * p });
          if (b) gsap.set(b.chars, { yPercent: 100 - 100 * p });
        },
      });
      k++;
    }
    ScrollTrigger.refresh();
  };
  (document.fonts?.ready || Promise.resolve()).then(run);
})();
