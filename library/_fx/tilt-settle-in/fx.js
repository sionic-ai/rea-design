(() => {
  // The original adds is-active once when it passes 85% of the screen to play a CSS keyframe — with split: chars it’s the same keyframe with a different delay per character
  kfFx.register("tilt-settle-in", (el, { options, reduce, scroller }) => {
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.dur != null) put("--fx-dur", +options.dur + "s");
    if (options.ease) put("--fx-ease", `cubic-bezier(${options.ease})`);
    let saved = null;
    if (options.split === "chars") {
      const text = el.textContent;
      if (!text.trim()) return;
      saved = [...el.childNodes];
      const each = +(options.each ?? 0.1);
      const words = text.trim().split(/(\s+)/);
      let i = 0;
      const frag = document.createDocumentFragment();
      words.forEach((w) => {
        if (/^\s+$/.test(w)) { frag.append(" "); i += w.length; return; }
        const word = document.createElement("span");
        word.className = "fx-tsi-word";
        [...w].forEach((c) => {
          const s = document.createElement("span");
          s.setAttribute("data-fx-part", "char");
          s.style.setProperty("--fx-i", i++);
          s.textContent = c;
          word.append(s);
        });
        frag.append(word);
      });
      el.setAttribute("aria-label", text.trim());
      el.replaceChildren(frag);
      put("--fx-each", each + "s");
      el.classList.add("fx-tsi-chars");
    }
    const show = () => el.classList.add("is-fx-in");
    let io = null;
    if (reduce || options.on === "load") show();
    else {
      const line = +(options.line ?? 0.85);
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }), { root: scroller || null, rootMargin: `0px 0px ${-(1 - line) * 100}% 0px` });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      el.classList.remove("is-fx-in", "fx-tsi-chars");
      if (saved) { el.replaceChildren(...saved); el.removeAttribute("aria-label"); }
      set.forEach((k) => el.style.removeProperty(k));
    };
  });
})();
