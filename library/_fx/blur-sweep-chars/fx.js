// Blur-sweep text: split the text into letters (or words) set to 8px blur and transparent, then delay each piece by its horizontal (or vertical) screen position spread over 0 to 1,
// Clears at part seconds — sweeping in from the left within total seconds. Brand hero (total 2.5s · per letter 1.2s · .2s delay, after the typeface has fully loaded)
(() => {
  const splitText = (el, mode) => {
    const spans = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.nodeValue.split(mode === "word" ? /(\s+)/ : "").forEach((t) => {
          if (t === "") return;
          if (t.trim() === "") { frag.appendChild(document.createTextNode(t)); return; }
          const s = document.createElement("span");
          s.textContent = t;
          s.className = "fx-bsc-bit";
          spans.push(s);
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains("fx-bsc-bit")) [...node.childNodes].forEach(walk);
    };
    walk(el);
    return spans;
  };
  kfFx.register("blur-sweep-chars", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const targets = [...el.querySelectorAll('[data-fx-part="text"]')];
    const list = targets.length ? targets : [el];
    const original = list.map((t) => t.innerHTML);
    const label = el.textContent.trim();
    const parts = list.flatMap((t) => splitText(t, t.dataset.split || options.split || "char"));
    if (!parts.length) { list.forEach((t, i) => { t.innerHTML = original[i]; }); return; }
    if (!el.hasAttribute("aria-label") && !targets.length) el.setAttribute("aria-label", label);
    const blur = +(options.blur ?? 8), total = +(options.total ?? 2.5), part = +(options.part ?? 1.2), delay = +(options.delay ?? 0.2);
    const axis = options.axis === "y" ? "y" : "x";
    gsap.set(parts, { opacity: 0, filter: `blur(${blur}px)` });
    let tw = null, st = null, timer = null;
    const go = () => {
      if (tw) return;
      const pos = parts.map((s) => { const r = s.getBoundingClientRect(); return axis === "y" ? r.top : r.left; });
      const min = Math.min(...pos), span = Math.max(Math.max(...pos) - min, 1);
      tw = gsap.to(parts, { opacity: 1, filter: "blur(0px)", duration: part, ease: kfFx.ease(options.ease || "power2.out", "power2.out"), delay, stagger: (i) => (pos[i] - min) / span * Math.max(total - part, 0) });
    };
    if ((options.on || "load") === "scroll") {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 75%", once: true, onEnter: go });
    } else if (document.fonts?.ready) { document.fonts.ready.then(go); timer = setTimeout(go, 1200); } else go();
    return () => {
      clearTimeout(timer);
      st?.kill();
      tw?.kill();
      list.forEach((t, i) => { t.innerHTML = original[i]; });
    };
  });
})();
