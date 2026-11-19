// Letters of a giant word fly in one by one (.1) from past the right edge of the screen (100vw) over 1.7s and settle in place — Brand roots section YOUR ROOTS
(() => {
  const split = (node) => {
    if (window.SplitText) return new SplitText(node, { type: "words,chars" }).chars;
    const out = [], text = node.textContent;
    node.textContent = "";
    text.split(/(\s+)/).forEach((w) => {
      if (/^\s+$/.test(w)) { node.append(w); return; }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      [...w].forEach((ch) => { const c = document.createElement("span"); c.style.display = "inline-block"; c.textContent = ch; word.append(c); out.push(c); });
      node.append(word);
    });
    return out;
  };
  kfFx.register("edge-fly-chars", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim()) return;
    gsap.registerPlugin(ScrollTrigger);
    const text = el.textContent;
    const chars = split(el);
    const from = options.from === "left" ? "-100vw" : "100vw";
    const tw = gsap.from(chars, {
      x: from, stagger: +(options.each ?? 0.1), duration: +(options.dur ?? 1.7), ease: kfFx.ease(options.ease || "power2.inOut", "power2.inOut"),
      scrollTrigger: { scroller, trigger: (options.trigger && el.closest(options.trigger)) || el, start: options.start || "top bottom" },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); el.textContent = text; };
  });
})();
