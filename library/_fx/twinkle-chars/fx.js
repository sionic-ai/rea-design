// Splits text into one span per character and turns each on when it crosses the line at screen height ÷ at (default 1.15) — original jQuery fadeText() and fadeTextInner()
(() => {
  kfFx.register("twinkle-chars", (el, { options, reduce, scroller }) => {
    const at = Math.max(1, +(options.at || 1.15));
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.d2 != null) el.style.setProperty("--fx-d2", +options.d2 + "s");
    if (options.d3 != null) el.style.setProperty("--fx-d3", +options.d3 + "s");
    // Splitting is per character inside the element — as in the original, spaces are not wrapped so line breaks and spacing stay intact
    const made = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            [...part].forEach((ch) => { const s = document.createElement("span"); s.className = "fx-twc"; s.textContent = ch; frag.append(s); made.push(s); });
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("fx-twc")) walk(n);
      });
    };
    const before = el.innerHTML;
    walk(el);
    if (!made.length) return;
    if (reduce) { made.forEach((s) => s.classList.add("is-in")); return () => { el.innerHTML = before; }; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }), { root: scroller || null, rootMargin: `0px 0px ${(-(1 - 1 / at) * 100).toFixed(2)}% 0px` });
    made.forEach((s) => io.observe(s));
    // Turn on directly from outside — like the Hero text when the loader lifts
    const show = () => made.forEach((s) => s.classList.add("is-in"));
    el.addEventListener("fx:show", show);
    return () => { io.disconnect(); el.removeEventListener("fx:show", show); el.innerHTML = before; ["--fx-dur", "--fx-d2", "--fx-d3"].forEach((k) => el.style.removeProperty(k)); };
  });
})();
