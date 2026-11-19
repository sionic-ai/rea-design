(() => {
  // Wraps the title one letter at a time and gives each letter a delay — the weight back-and-forth itself is handled by keyframes in fx.css (variable font wght axis).
  // Words are grouped into inline-block chunks with the spaces between left as is (so multi-line Korean titles don’t break mid-word). <br> …is left as it is.
  kfFx.register("weight-wave-title", (el, { options, reduce }) => {
    if (!el.textContent.trim()) return;
    const keep = el.innerHTML;
    const start = +(options.start ?? 0.34);
    const step = +(options.step ?? 0.24);
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const word = document.createElement("span");
            word.style.display = "inline-block";
            [...w].forEach((ch) => {
              const c = document.createElement("span");
              c.setAttribute("data-fx-part", "char");
              c.textContent = ch;
              c.style.animationDelay = `${(start + step * i++).toFixed(2)}s`;
              word.append(c);
            });
            frag.append(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.hasAttribute("data-fx-part")) wrap(n);
      });
    };
    if (!reduce) wrap(el);
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    return () => { el.innerHTML = keep; };
  });
})();
