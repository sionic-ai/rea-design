// Wraps text one character at a time (words are bundled as one chunk so line breaks never fall inside a word), and odd characters are hinged on the right, even characters on the left, rotated 90° on Y and blurred.
// When visible (scroll-enter) or when the caller adds the class="is-in" When set (state), characters stand up one by one as if doors were opening — when the state is released, they fold all at once after the hold seconds
(() => {
  kfFx.register("door-blur-chars", (el, { options, reduce }) => {
    if (el.querySelector(".fx-db")) return;
    const saved = el.innerHTML;
    const label = el.textContent.replace(/\s+/g, " ").trim();
    if (!label) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) texts.push(walker.currentNode);
    let i = 0;
    texts.forEach((t) => {
      const frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(document.createTextNode(word)); return; }
        const w = document.createElement("span");
        w.className = "fx-db-w";
        w.setAttribute("aria-hidden", "true");
        [...word].forEach((c) => {
          const s = document.createElement("span");
          s.className = "fx-db" + (i % 2 ? " fx-db--l" : "") + (i === 0 ? " fx-db--first" : "");
          s.style.setProperty("--fx-i", i + 1);
          s.textContent = c;
          w.append(s);
          i++;
        });
        frag.append(w);
      });
      t.replaceWith(frag);
    });
    el.setAttribute("aria-label", label);
    if (options.each != null) el.style.setProperty("--fx-each", `${+options.each}s`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.first != null) el.style.setProperty("--fx-first", `${+options.first}s`);
    if (options.hold != null) el.style.setProperty("--fx-hold", `${+options.hold}s`);
    const undo = () => {
      el.innerHTML = saved;
      el.removeAttribute("aria-label");
      ["--fx-each", "--fx-dur", "--fx-first", "--fx-hold"].forEach((p) => el.style.removeProperty(p));
    };
    if (reduce) { el.classList.add("is-in"); return () => { undo(); el.classList.remove("is-in"); }; }
    if (options.mode === "state") return undo;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      el.classList.add("is-in");
      io.disconnect();
    }, { rootMargin: options.margin || "0px 0px -10% 0px" });
    io.observe(el);
    return () => { io.disconnect(); undo(); el.classList.remove("is-in"); };
  });
})();
