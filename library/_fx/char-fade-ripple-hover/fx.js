// The farther a letter is from where the interaction entered, the later (.5 × distance) and fainter (.8 × distance) it blinks, then returns in .75s — distance is a ratio to the element width (height for vertical text).
// Return curve: the original code is "Expo.out"(a name not in GSAP 3) so it runs with the default power1.out — power1.out is the default as measured
// Original (Brand Hover) splits each letter into a span and builds one timeline on a single pointerenter. Re-entering cuts the earlier wave and builds a new one
(() => {
  kfFx.register("char-fade-ripple-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const axis = options.axis || (getComputedStyle(el).writingMode.startsWith("vertical") ? "y" : "x");
    const depth = +(options.depth ?? 0.8), lag = +(options.lag ?? 0.5), dip = +(options.dip ?? 0.2), back = +(options.back ?? 0.75);
    const backEase = kfFx.ease(options.ease || "power1.out", "power1.out");
    const kept = [...el.childNodes].map((n) => n.cloneNode(true));
    const chars = [];
    // Each word is wrapped in an inline-block chunk and the spaces between are kept as is — so multi-line Korean doesn’t break mid-word
    const split = (node) =>
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) return frag.append(word);
            const w = document.createElement("span");
            w.style.display = "inline-block";
            [...word].forEach((ch) => {
              const c = document.createElement("span");
              c.textContent = ch;
              w.append(c);
              chars.push(c);
            });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("svg, img, video, canvas")) split(n);
      });
    split(el);
    if (!chars.length) return;
    let tls = [];
    const on = (e) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tls.forEach((t) => t.kill());
      tls = chars.map((c) => {
        const b = c.getBoundingClientRect();
        const dx = e.clientX - b.left, dy = e.clientY - b.top;
        const l = Math.min(1, axis === "y" ? Math.abs(dy) / r.height : axis === "xy" ? Math.hypot(dx / r.width, dy / r.height) : Math.abs(dx) / r.width);
        return gsap.timeline()
          .to(c, { opacity: depth * l, duration: dip, ease: "sine.out", delay: lag * l })
          .to(c, { opacity: 1, duration: back, ease: backEase });
      });
    };
    el.addEventListener("pointerenter", on);
    return () => {
      el.removeEventListener("pointerenter", on);
      tls.forEach((t) => t.kill());
      el.replaceChildren(...kept);
    };
  });
})();
