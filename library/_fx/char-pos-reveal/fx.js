// Each letter sets its weight by its own height — not by order (from the first letter) but by its position on screen, so the letters of one line darken together and as lines rise the lines below follow.
// Text in hidden sides (other language panels etc.) is not measured. Words are wrapped in inline-block chunks so Korean keep-all line breaks don’t split inside a word.
(() => {
  kfFx.register("char-pos-reveal", (el, { options, reduce, scroller }) => {
    const ac = new AbortController();
    const floor = +(options.floor ?? 0.08);
    const start = +(options.start ?? 0.9);
    const end = +(options.end ?? 0.55);
    el.style.setProperty("--fx-floor", floor);
    if (options.fade != null) el.style.setProperty("--fx-fade", `${+options.fade}s`);
    const original = el.innerHTML;
    const chars = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        if (!node.nodeValue.trim()) return;
        const frag = document.createDocumentFragment();
        for (const part of node.nodeValue.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); continue; }
          const word = document.createElement("span");
          word.className = "fx-cpr-w";
          for (const ch of part) {
            const s = document.createElement("span");
            s.className = "fx-cpr-c";
            s.textContent = ch;
            word.append(s);
            chars.push(s);
          }
          frag.append(word);
        }
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && node.tagName !== "BR" && !node.hasAttribute("data-fx")) {
        [...node.childNodes].forEach(walk);
      }
    };
    [...el.childNodes].forEach(walk);
    if (!chars.length) return () => { el.innerHTML = original; };
    if (reduce) {
      chars.forEach((c) => c.style.setProperty("--fx-reveal", "1"));
      return () => { el.innerHTML = original; el.style.removeProperty("--fx-floor"); el.style.removeProperty("--fx-fade"); };
    }
    const render = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const a = vh * start, b = vh * end, span = a - b || 1;
      for (const c of chars) {
        if (!c.offsetParent) continue;
        const r = c.getBoundingClientRect();
        const p = (a - (r.top - top + r.height / 2)) / span;
        c.style.setProperty("--fx-reveal", Math.max(0, Math.min(1, p)).toFixed(3));
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; render(); });
    };
    (scroller || window).addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });
    addEventListener("resize", onScroll, { signal: ac.signal });
    // Re-measure after a press that switches to another language version — hidden text becomes visible
    document.addEventListener("click", () => setTimeout(render, 50), { signal: ac.signal });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    render();
    return () => {
      ac.abort();
      ro.disconnect();
      el.innerHTML = original;
      el.style.removeProperty("--fx-floor");
      el.style.removeProperty("--fx-fade");
    };
  });
})();
