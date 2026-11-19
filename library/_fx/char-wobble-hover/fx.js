// Hovering a link tilts letters from the front at .035s intervals, 1.14x · ±7° randomly, with a thin outline (text color .4px) (.38s back.out(1.8)),
// Fully popped letters settle back in place in .5s. On release the rest return in .35s at .018s stagger — a playful reaction on mail · footer links
(() => {
  const RIM = "0.4px 0.4px 0 currentColor, -0.4px -0.4px 0 currentColor, 0.4px -0.4px 0 currentColor, -0.4px 0.4px 0 currentColor";
  const NONE = "0px 0px 0px transparent";
  // Each word is wrapped in an inline-block chunk and the spaces between are kept as is — so multi-line Korean doesn’t break mid-word
  const split = (root) => {
    const chars = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { if (!n.matches("svg, img, [data-fx-part]")) walk(n); continue; }
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return frag.append(document.createTextNode(w));
          const word = document.createElement("span");
          word.className = "fx-wobble-word";
          for (const c of w) {
            const s = document.createElement("span");
            s.className = "fx-wobble-char";
            s.textContent = c;
            word.append(s);
            chars.push(s);
          }
          frag.append(word);
        });
        n.replaceWith(frag);
      }
    };
    walk(root);
    return chars;
  };

  kfFx.register("char-wobble-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const target = el.querySelector('[data-fx-part="text"]') || el;
    const before = target.innerHTML;
    const chars = split(target);
    if (!chars.length) return () => (target.innerHTML = before);
    const scale = +(options.scale ?? 1.14), tilt = +(options.tilt ?? 7), each = +(options.each ?? 0.035), dur = +(options.dur ?? 0.38);
    const rim = options.rim === "off" ? NONE : RIM;
    gsap.set(chars, { display: "inline-block", transformOrigin: "50% 50%" });
    const on = () => chars.forEach((c, i) => gsap.to(c, {
      scale, rotation: gsap.utils.random(-tilt, tilt), textShadow: rim, duration: dur, delay: i * each, ease: "back.out(1.8)", overwrite: "auto",
      onComplete: () => gsap.to(c, { scale: 1, rotation: 0, textShadow: NONE, duration: 0.5, ease: "power2.out", overwrite: "auto" }),
    }));
    const off = () => gsap.to(chars, { scale: 1, rotation: 0, textShadow: NONE, duration: 0.35, stagger: 0.018, ease: "power2.out", overwrite: "auto" });
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      gsap.killTweensOf(chars);
      target.innerHTML = before;
    };
  });
})();
