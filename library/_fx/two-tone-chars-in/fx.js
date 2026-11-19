(() => {
  // Original brand: wraps each letter, sets it to opacity 0 with a pale color, and once it crosses the line 15% from the screen bottom,
  // ① characters light up one by one over .2s (.025s stagger) ② .05s after all are lit, in the same order they take their own text color over .1s — the text is painted twice
  // Letters are inline spans so line-break positions stay as they are (Korean keep-all isn’t broken even without grouping into word chunks)
  const split = (root, chars) => {
    [...root.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const c of n.textContent) {
          if (c === "\n" || c === "\r" || c === "\t") continue;
          if (c === " " || c === "　") { frag.append(c); continue; }
          const s = document.createElement("span");
          s.className = "fx-ttc";
          s.textContent = c;
          s.style.setProperty("--i", chars.length);
          frag.append(s);
          chars.push(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.nodeName !== "BR") split(n, chars);
    });
  };

  kfFx.register("two-tone-chars-in", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    const was = el.innerHTML;
    const chars = [];
    split(el, chars);
    if (!chars.length) { el.innerHTML = was; return; }
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    el.style.setProperty("--n", chars.length);
    set("--fx-each", options.each != null ? `${+options.each}s` : null);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    set("--fx-ink-dur", options.ink != null ? `${+options.ink}s` : null);
    set("--fx-gap", options.gap != null ? `${+options.gap}s` : null);
    const vars = ["--n", "--fx-each", "--fx-dur", "--fx-ink-dur", "--fx-gap"];
    let io = null;
    const off = () => { io?.disconnect(); el.innerHTML = was; el.classList.remove("is-fx-ready", "is-fx-in"); vars.forEach((v) => el.style.removeProperty(v)); };
    if (reduce) return off;
    el.classList.add("is-fx-ready");
    // Original start: "top bottom-=15%" — A line rising 15% from the screen bottom. You can give px instead of %
    const raw = String(options.start ?? "15%").trim();
    const line = /%$/.test(raw) ? raw : `${+raw}px`;
    io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: `0px 0px -${line} 0px` });
    io.observe(el);
    return off;
  });
})();
