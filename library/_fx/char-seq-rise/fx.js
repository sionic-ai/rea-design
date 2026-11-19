(() => {
  // Original does it per letter <span style="animation-delay:i/10s"> Attach it and turn on once at ‹position ≥ element top − 50 − screen height› — blank cells count i too
  kfFx.register("char-seq-rise", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const was = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    // Split per text node, inside <em>·<br>·<a> Keep the same styling as is — italicized words and line breaks in the title must be preserved
    let i = 0;
    // pause: after a comma-like character, rest that much more (seconds) before showing the next chunk — the sequence skips ahead by each unit (Brand .6 after a comma 、)
    const pauseUnits = +(options.pause ?? 0) / (+(options.each ?? 0.1) || 0.1);
    const pauseOn = options["pause-on"] || "、,，";
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.nodeValue.trim()) nodes.push(n);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.append(" "); i += w.length; return; }
        const word = document.createElement("span");
        word.className = "fx-csr-word";
        word.setAttribute("aria-hidden", "true");
        for (const ch of w) {
          const sp = document.createElement("span");
          sp.className = "fx-csr-ch";
          sp.textContent = ch;
          sp.style.setProperty("--i", i++);
          if (pauseUnits && pauseOn.includes(ch)) i += pauseUnits;
          word.append(sp);
        }
        frag.append(word);
      });
      n.replaceWith(frag);
    });
    // from: center spreads outward from the middle letter (index = number of slots away from center) · if end, starts from the last character
    if (options.from === "center" || options.from === "end") {
      const chs = [...el.querySelectorAll(".fx-csr-ch")], last = i - 1;
      chs.forEach((c) => { const k = +c.style.getPropertyValue("--i"); c.style.setProperty("--i", options.from === "end" ? last - k : Math.round(Math.abs(k - last / 2))); });
    }
    if (options.each != null) el.style.setProperty("--fx-each", `${+options.each}s`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.rise != null) el.style.setProperty("--fx-rise", /px$/.test(String(options.rise).trim()) ? String(options.rise).trim() : `${+options.rise}%`);
    if (options.ease) el.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    if (options.blur != null && +options.blur > 0) { el.style.setProperty("--fx-blur", `${+options.blur}px`); el.classList.add("is-fx-blur"); }
    // fade: none — leaves opacity alone and only moves the position (used with look: clip, the text rises opaque beneath the mask, Brand site)
    if (options.fade === "none") el.style.setProperty("--fx-o0", "1");
    else if (options.fade) el.style.setProperty("--fx-fade-ease", /^[\d.,\s-]+$/.test(options.fade) ? `cubic-bezier(${options.fade})` : options.fade);
    let io = null, mo = null;
    const off = () => { io?.disconnect(); mo?.disconnect(); el.innerHTML = was; el.removeAttribute("aria-label"); el.classList.remove("is-fx-in", "is-fx-blur"); ["--fx-each", "--fx-dur", "--fx-rise", "--fx-ease", "--fx-delay", "--fx-blur", "--fx-fade-ease", "--fx-o0"].forEach((v) => el.style.removeProperty(v)); };
    if (reduce || options.on === "load") { el.classList.add("is-fx-in"); return off; }
    // on: state — when is-in is added to the element or an ancestor (hero title entering after the loader lifts, Brand)
    if (options.on === "state") {
      const check = () => { if (el.closest(".is-in")) { el.classList.add("is-fx-in"); mo.disconnect(); } };
      mo = new MutationObserver(check);
      for (let p = el; p && p !== document.body; p = p.parentElement) mo.observe(p, { attributes: true, attributeFilter: ["class"] });
      check();
      return off;
    }
    // Also accepts screen height % — brand is top bottom-=Called 25% offset: -25%
    const raw = String(options.offset ?? 50).trim();
    const offset = /%$/.test(raw) ? raw : `${+raw}px`;
    io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: `0px 0px ${offset} 0px` });
    io.observe(el);
    return off;
  });
})();
