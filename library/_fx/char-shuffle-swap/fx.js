(() => {
  // Original (Brand series name) toggles only the opacity of each letter — positions stay, so old text is erased with random holes and new text is stamped randomly onto the empty line
  const shuffled = (n) => {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Wrap words in inline-block chunks and leave the spaces between them as characters — with only letter spans in a row, Korean titles break in the middle of a word.
  const paint = (el, text, off) => {
    el.textContent = "";
    const chars = [];
    for (const token of String(text).split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) { el.append(token); continue; }
      const word = document.createElement("span");
      word.setAttribute("data-fx-part", "word");
      for (const ch of token) {
        const c = document.createElement("span");
        c.setAttribute("data-fx-part", "char");
        c.textContent = ch;
        if (off) c.classList.add("is-off");
        word.append(c);
        chars.push(c);
      }
      el.append(word);
    }
    return chars;
  };

  kfFx.register("char-shuffle-swap", (el, { options, reduce }) => {
    const step = +(options.step ?? 60);
    const gap = +(options.gap ?? 100);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
    };
    const clear = () => { timers.forEach(clearTimeout); timers.clear(); };
    const done = (text) => el.dispatchEvent(new CustomEvent("fx:swapped", { detail: { text } }));

    let current = el.textContent.trim();
    if (!current && options.in !== "true") return () => {};
    let chars = paint(el, current, options.in === "true" && !reduce);

    const show = (list) => shuffled(list.length).forEach((i, k) => later(() => list[i].classList.remove("is-off"), step * k));
    if (options.in === "true" && !reduce) show(chars);

    const swap = (e) => {
      const next = String(e.detail?.text ?? "");
      clear();
      if (reduce) { chars = paint(el, next, false); current = next; done(next); return; }
      const old = chars;
      shuffled(old.length).forEach((i, k) => later(() => old[i].classList.add("is-off"), step * k));
      later(() => {
        chars = paint(el, next, true);
        current = next;
        show(chars);
        later(() => done(next), step * Math.max(0, chars.length - 1) + 1);
      }, step * old.length + gap);
    };
    el.addEventListener("fx:swap", swap);
    return () => {
      clear();
      el.removeEventListener("fx:swap", swap);
      el.textContent = current;
    };
  });
})();
