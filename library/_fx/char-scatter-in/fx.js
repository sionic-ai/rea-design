// Splits text into letters and turns them on with a fixed scattered delay table — looks random but the order is the same every time, so it can be measured side by side with the original
(() => {
  const TABLES = {
    // Section title: scatter 0.03~0.3s over a 30-character cycle
    scatter: [0.21, 0.24, 0.09, 0.15, 0.27, 0.06, 0.18, 0.3, 0.12, 0.03, 0.24, 0.15, 0.09, 0.27, 0.06, 0.21, 0.3, 0.12, 0.18, 0.03, 0.15, 0.24, 0.09, 0.27, 0.06, 0.21, 0.12, 0.18, 0.3, 0.03],
    // One-line copy: spread wider from 0.03 to 0.47s over a 25-character cycle
    wide: [0.28, 0.06, 0.41, 0.17, 0.33, 0.09, 0.47, 0.21, 0.13, 0.36, 0.03, 0.25, 0.44, 0.15, 0.31, 0.08, 0.45, 0.19, 0.37, 0.05, 0.24, 0.42, 0.11, 0.29, 0.16],
  };
  kfFx.register("char-scatter-in", (el, { options, reduce }) => {
    if (!el.textContent.trim()) return;
    const original = el.innerHTML;
    const table = TABLES[options.look === "wide" ? "wide" : "scatter"];
    const labelled = !el.hasAttribute("aria-label");
    if (labelled) el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    let n = 0;
    // Words are wrapped as chunks with the spaces between left intact, so multi-line Korean titles don’t break in the middle of a word
    const split = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const part of child.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.append(part); continue; }
            const word = document.createElement("span");
            word.setAttribute("data-fx-part", "word");
            word.setAttribute("aria-hidden", "true");
            for (const c of part) {
              const s = document.createElement("span");
              s.setAttribute("data-fx-part", "char");
              s.textContent = c;
              s.style.setProperty("--fx-d", `${table[n++ % table.length]}s`);
              word.append(s);
            }
            frag.append(word);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") split(child);
      }
    };
    split(el);
    // Turn on only after the initial look (transparent) has been drawn once, so the transition runs
    const show = () => requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-fx-on")));
    const wait = +(options.delay ?? 0);
    let io = null, timer = 0;
    if (reduce) el.classList.add("is-fx-on");
    else if (options.start === "view") {
      let seen = false, ready = wait <= 0;
      const go = () => seen && ready && show();
      if (!ready) timer = setTimeout(() => { ready = true; go(); }, wait);
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { seen = true; io.disconnect(); go(); } }, { rootMargin: options.margin || "0px" });
      io.observe(el);
    } else timer = setTimeout(show, wait);
    return () => {
      clearTimeout(timer);
      io && io.disconnect();
      el.classList.remove("is-fx-on");
      if (labelled) el.removeAttribute("aria-label");
      el.innerHTML = original;
    };
  });
})();
