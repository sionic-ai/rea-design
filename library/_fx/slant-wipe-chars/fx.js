(() => {
  kfFx.register("slant-wipe-chars", (el, { options, reduce, scroller }) => {
    const block = (options.look || "") === "block";
    const text = el.textContent;
    if (!block && !text.trim()) return;
    const keep = block ? null : [...el.childNodes];
    const label = el.getAttribute("aria-label");
    const each = +(options.each ?? 0.05);
    const delay = +(options.delay ?? 0);
    if (!block) {
      // Each word is wrapped as its own inline-block and the spaces between are kept as is — so multi-line Korean titles don’t break mid-word
      const frag = document.createDocumentFragment();
      let i = 0;
      const walk = (node, into) => {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) return into.append(w);
            const word = document.createElement("span");
            word.className = "fx-sw-word";
            word.setAttribute("aria-hidden", "true");
            [...w].forEach((c) => {
              const s = document.createElement("span");
              s.className = "fx-sw-char";
              s.textContent = c;
              s.style.transitionDelay = `${+(delay + i * each).toFixed(3)}s`;
              word.append(s);
              i++;
            });
            into.append(word);
          });
        } else if (node.nodeType === 1) {
          const copy = node.cloneNode(false);
          if (node.tagName !== "BR") [...node.childNodes].forEach((c) => walk(c, copy));
          into.append(copy);
        }
      };
      keep.forEach((n) => walk(n, frag));
      el.setAttribute("aria-label", text.replace(/\s+/g, " ").trim());
      el.replaceChildren(frag);
    } else if (delay) el.style.setProperty("--fx-delay", delay + "s");
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.ease) el.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    if (options.angle != null) el.style.setProperty("--fx-angle", +options.angle + "deg");
    const play = () => el.classList.add("is-fx-in");
    const reset = () => el.classList.remove("is-fx-in");
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:reset", reset);
    let io = null, onLoad = null;
    if (reduce) play();
    else if (options.on === "load") {
      onLoad = () => play();
      document.readyState === "complete" ? play() : addEventListener("load", onLoad, { once: true });
    } else if (options.on !== "manual") {
      // Original IntersectionObserver rootMargin 0 0 -100px 0 · threshold 0 — once it enters the area minus 100px at the bottom of the screen, it fires once.
      io = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          play();
          io.disconnect();
        }),
        { root: scroller && scroller !== window ? scroller : null, rootMargin: `0px 0px -${+(options.margin ?? 100)}px 0px`, threshold: 0 }
      );
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      if (onLoad) removeEventListener("load", onLoad);
      el.removeEventListener("fx:play", play);
      el.removeEventListener("fx:reset", reset);
      el.classList.remove("is-fx-in");
      ["--fx-dur", "--fx-ease", "--fx-angle", "--fx-delay"].forEach((v) => el.style.removeProperty(v));
      if (block) return;
      if (label == null) el.removeAttribute("aria-label");
      else el.setAttribute("aria-label", label);
      el.replaceChildren(...keep);
    };
  });
})();
