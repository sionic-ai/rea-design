(() => {
  // The original puts the title graphic (SVG letter paths) in one sheet and drops each path — here the letters are split and use the same numbers.
  // Inner elements like line span·br are left as is, only text nodes become word chunks > Wraps by letter (so Korean keep-all line breaks don’t split in the middle of a word)
  const wrap = (root, chars) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.append(w); return; }
        const word = document.createElement("span");
        word.className = "fx-edc-word";
        for (const ch of w) {
          const s = document.createElement("span");
          s.className = "fx-edc-ch";
          s.textContent = ch;
          word.append(s);
          chars.push(s);
        }
        frag.append(word);
      });
      node.replaceWith(frag);
    });
  };

  kfFx.register("elastic-drop-chars", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    const was = el.innerHTML;
    const label = el.getAttribute("aria-label");
    if (!label) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const chars = [];
    wrap(el, chars);
    chars.forEach((c) => c.parentNode.setAttribute("aria-hidden", "true"));
    let tw = null;
    const off = () => { tw?.scrollTrigger?.kill(); tw?.kill(); el.innerHTML = was; if (!label) el.removeAttribute("aria-label"); };
    if (reduce) return off;
    gsap.registerPlugin(ScrollTrigger);
    // drop takes the unit as-is — the original uses rem (html font size that scales with window width)
    const raw = String(options.drop ?? "-1rem").trim(), drop = /[a-z%]$/i.test(raw) ? raw : `${+raw}px`;
    const curve = String(options.ease || "elastic.out(1, 0.6)");
    tw = gsap.fromTo(chars, { y: drop, opacity: 0, scaleY: +(options.squash ?? 0.7) }, {
      y: 0, opacity: 1, scaleY: 1,
      duration: +(options.dur ?? 1.35),
      // GSAP names kept as is, commas inside the parentheses (kfFx.ease reads commas as four Bézier numbers)
      ease: /[a-z]/i.test(curve) ? curve : kfFx.ease(curve, "elastic.out(1, 0.6)"),
      // A curve is applied to the stagger itself too — the middle letters fall slightly closer together so a wave seems to pass through
      stagger: { each: +(options.each ?? 0.05), from: "start", ease: options["order-ease"] || "sine.inOut" },
      delay: +(options.delay ?? 0),
      scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top center", once: true },
    });
    return off;
  });
})();
