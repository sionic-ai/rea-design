// Letters of a big sentence sit scattered, transparent, .6x and randomly tilted −20 to 20°, then settle from when the sentence top touches the screen bottom until its bottom edge reaches 30% of the screen
// One character at a time (.03 stagger, power4) settles into place with the scroll — the original Brand first-page intro sentence (SplitText chars·words, scrub true).
// Inner styling like italics (em) and bold is left as is, and only the letters inside are split. A word is an inline-block chunk, so lines never break in the middle of a word.
(() => {
  const splitInto = (root) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const w = document.createElement("span");
          w.className = "fx-ssw";
          [...part].forEach((ch) => {
            const c = document.createElement("span");
            c.className = "fx-ssc";
            c.textContent = ch;
            w.append(c);
            chars.push(c);
          });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(root);
    return chars;
  };

  kfFx.register("scatter-settle-scrub", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim()) return;
    const original = el.innerHTML;
    const label = el.getAttribute("aria-label");
    if (!label) el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    const chars = splitInto(el);
    chars.forEach((c) => c.setAttribute("aria-hidden", "true"));
    gsap.registerPlugin(ScrollTrigger);
    const rot = +(options.rot ?? 20);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(chars,
        { willChange: "opacity, transform", opacity: 0, scale: +(options.scale ?? 0.6), rotationZ: () => gsap.utils.random(-rot, rot) },
        {
          ease: kfFx.ease(options.ease || "", "power4"), opacity: 1, scale: 1, rotation: 0, stagger: +(options.each ?? 0.03),
          scrollTrigger: { trigger: el, scroller, start: options.start || "top bottom", end: options.end || "bottom 30%", scrub: options.scrub != null ? +options.scrub || true : true },
        });
    });
    return () => {
      mm.revert();
      el.innerHTML = original;
      if (!label) el.removeAttribute("aria-label");
    };
  });
})();
