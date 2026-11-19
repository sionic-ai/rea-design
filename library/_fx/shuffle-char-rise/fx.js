(() => {
  kfFx.register("shuffle-char-rise", (el, { options, reduce }) => {
    if (el.classList.contains("is-fx-split")) return;
    const each = +(options.each ?? 0.015), delay = +(options.delay ?? 0);
    const original = el.innerHTML;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    const chars = [];
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      // Bind each word as one chunk so lines don’t break mid-word, keeping the spaces between as they are
      node.nodeValue.replace(/\r?\n/g, "").split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(word); return; }
        const w = document.createElement("span");
        w.setAttribute("data-fx-part", "word");
        [...word].forEach((ch) => {
          const c = document.createElement("span");
          c.setAttribute("data-fx-part", "char");
          c.textContent = ch;
          w.append(c); chars.push(c);
        });
        frag.append(w);
      });
      node.replaceWith(frag);
    });
    if (!chars.length) { el.innerHTML = original; return; }
    // line — mix each direct child (line) separately and add line index × line seconds (Brand copy: .2s per line · .04s per letter)
    const line = options.line != null ? +options.line : null;
    const groups = line != null && el.children.length ? [...el.children].map((k) => chars.filter((c) => k.contains(c))) : [chars];
    const shuffle = () => groups.forEach((g, k) => {
      const order = g.map((_, i) => i).sort(() => Math.random() - 0.5);
      g.forEach((c, i) => { c.style.transitionDelay = (each * order[i] + (line ?? 0) * k + delay).toFixed(3) + "s"; });
    });
    shuffle();
    el.classList.add("is-fx-split");
    let io;
    // back: on — when it scrolls back below the screen out of view it hides, and the next time it enters the order is reshuffled (Brand item re-forms on every entry)
    const back = options.back === "on";
    if (reduce) el.classList.add("is-in");
    else if (options.on !== "state") {
      io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting && (!back || e.boundingClientRect.top > 0)) { if (back && !el.classList.contains("is-in")) shuffle(); el.classList.add("is-in"); if (!back) io.disconnect(); }
        else if (back && !e.isIntersecting && e.boundingClientRect.top > 0) el.classList.remove("is-in");
      }), { rootMargin: options.margin || "0% 10% -25% 10%", threshold: 0 });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.innerHTML = original; el.classList.remove("is-in"); el.classList.remove("is-fx-split"); };
  });
})();
