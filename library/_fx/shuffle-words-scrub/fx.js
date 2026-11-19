// Word shuffle erase: split the text into words and shuffle their order, and as scrolling passes the range (start→end) the words switch off one by one in that shuffled order (no curve, straight with scroll).
// Scene where body words vanish here and there as a newspaper page approaches (first section of brand-brand). dir: with in they turn on in a shuffled reverse order.
(() => {
  kfFx.register("shuffle-words-scrub", (el, { options, reduce, scroller }) => {
    if (!(el.textContent || "").trim()) return;
    const src = el.innerHTML;
    // Wrap words into chunks and leave the spaces between them as is (so multi-line Korean doesn’t break mid-word)
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const parts = c.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
            else { const s = document.createElement("span"); s.className = "fx-word"; s.textContent = p; frag.appendChild(s); }
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(el);
    const words = [...el.querySelectorAll(".fx-word")];
    if (reduce || !words.length) return () => { el.innerHTML = src; };
    let seed = Math.round(+(options.seed ?? 7)) || 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const order = words.map((w) => [rnd(), w]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const inMode = options.dir === "in";
    const each = +(options.each ?? 0.05);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, scroller: scroller || undefined, start: options.start || "top 60%", end: options.end || "bottom top", scrub: options.scrub === "true" || options.scrub === undefined ? true : +options.scrub },
      });
      tl[inMode ? "from" : "to"](order, { opacity: 0, duration: each, stagger: (1 - each) / Math.max(1, order.length - 1) });
      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
    return () => { mm.revert(); el.innerHTML = src; };
  });
})();
