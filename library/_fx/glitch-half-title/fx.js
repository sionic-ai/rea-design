(() => {
  // Each letter’s top-half and bottom-half layers shake separately, glitching and then locking together — each layer jumps twice with random x · y · tilt (.09s → .075s, the second one transparent .15) and settles in .3s power4.out
  kfFx.register("glitch-half-title", (el, { options, reduce, scroller }) => {
    const text = el.textContent.trim();
    if (!text) return;
    const orig = el.innerHTML;
    const each = +(options.each ?? 0.09), scale = +(options.scale ?? 1.5), split = +(options.split ?? 4);
    const narrow = matchMedia("(max-width: 768px)").matches;
    const amp = { x: +(options.x ?? (narrow ? 6 : 13)), y: +(options.y ?? (narrow ? 1 : 4)), skew: +(options.skew ?? (narrow ? 4 : 10)) };
    const wrap = document.createElement("span");
    wrap.className = "fx-glitch-half-title";
    // The hidden layer that holds the position is also built from the same word chunks — as plain text its width differs from the two layers and the last word is pushed to the next line and clipped
    const layer = (side) => {
      const l = document.createElement("span");
      l.className = `fx-glitch-half-title__layer fx-glitch-half-title__layer--${side}`;
      l.setAttribute("aria-hidden", "true");
      // Bundle words into chunks so multi-line Korean titles don’t break in the middle of a word
      text.split(/(\s+)/).forEach((w) => {
        if (/^\s+$/.test(w)) { l.append(w); return; }
        const word = document.createElement("span");
        word.className = "fx-glitch-half-title__word";
        [...w].forEach((c) => {
          const ch = document.createElement("span");
          ch.className = "fx-glitch-half-title__char";
          ch.textContent = c;
          word.append(ch);
        });
        l.append(word);
      });
      return l;
    };
    const ghost = layer("ghost"), top = layer("top"), bottom = layer("bottom");
    wrap.append(ghost, top, bottom);
    el.textContent = "";
    el.append(wrap);
    el.setAttribute("aria-label", text);
    if (reduce) return () => { el.innerHTML = orig; el.removeAttribute("aria-label"); };
    gsap.registerPlugin(ScrollTrigger);
    const tops = [...top.querySelectorAll(".fx-glitch-half-title__char")];
    const bottoms = [...bottom.querySelectorAll(".fx-glitch-half-title__char")];
    const mm = gsap.matchMedia();
    let live = true;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set([...tops, ...bottoms], { autoAlpha: 0, x: 0, y: 0, skewX: 0 });
      let tl = null;
      // Like the original, attach after fonts have fully loaded — if a late font changes letter widths, the sway positions go off
      const build = () => {
        if (!live) return;
      const rand = () => ({ x: gsap.utils.random(-amp.x, amp.x, 1), y: gsap.utils.random(-amp.y, amp.y, 1), skewX: gsap.utils.random(-amp.skew, amp.skew, 1) });
      tl = gsap.timeline({
        delay: +(options.delay ?? 0),
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", toggleActions: "play none none none", once: true },
      });
      tops.forEach((t, i) => {
        const b = bottoms[i], at = i * each, a = rand(), c = rand();
        tl.to(t, { autoAlpha: 1, x: a.x, y: a.y - split, skewX: a.skewX, duration: 0.06 * scale, ease: "none" }, at)
          .to(b, { autoAlpha: 1, x: a.x, y: a.y + split, skewX: a.skewX, duration: 0.06 * scale, ease: "none" }, at)
          .to(t, { autoAlpha: 0.15, x: c.x, y: c.y - split, skewX: c.skewX, duration: 0.05 * scale, ease: "none" }, at + 0.05 * scale)
          .to(b, { autoAlpha: 0.15, x: c.x, y: c.y + split, skewX: c.skewX, duration: 0.05 * scale, ease: "none" }, at + 0.05 * scale)
          .to([t, b], { autoAlpha: 1, x: 0, y: 0, skewX: 0, duration: 0.2 * scale, ease: "power4.out" }, at + 0.1 * scale);
      });
      tl.set([...tops, ...bottoms], { clearProps: "transform" }, ">");
      };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(build);
      return () => { tl?.scrollTrigger?.kill(); tl?.kill(); tl = null; };
    });
    return () => { live = false; mm.revert(); el.innerHTML = orig; el.removeAttribute("aria-label"); };
  });
})();
