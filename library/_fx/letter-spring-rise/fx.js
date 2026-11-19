(() => {
  // Text line (data-fx-part="letters", or the whole text of the attached element if none) is split into characters inside word chunks. Each character gets an index number (--fx-i),
  // Delay calculation and keyframes are handled by fx.css — the original is CSS keyframes (ease per segment), so the same curve results. Empty cells also consume one turn slot like the original.
  kfFx.register("letter-spring-rise", (el, { options, reduce }) => {
    let parts = [...el.querySelectorAll('[data-fx-part="letters"]')];
    if (!parts.length && el.textContent.trim() && !el.querySelector("*")) parts = [el];
    if (!parts.length) return;
    const vars = { each: "--fx-each", dur: "--fx-dur", delay: "--fx-delay" };
    for (const [k, v] of Object.entries(vars)) if (options[k] != null) el.style.setProperty(v, `${+options[k]}s`);
    if (options.over != null) el.style.setProperty("--fx-over", options.over);
    const saved = parts.map((p) => p.innerHTML);
    for (const p of parts) {
      let i = 0;
      const words = p.textContent.split(/(\s+)/);
      p.textContent = "";
      for (const w of words) {
        if (!w) continue;
        if (/^\s+$/.test(w)) { p.append(w); i++; continue; }
        const word = document.createElement("span");
        word.className = "fx-lsr-word";
        for (const ch of w) {
          const c = document.createElement("span");
          c.className = "fx-lsr-ch";
          c.textContent = ch;
          c.style.setProperty("--fx-i", i++);
          word.append(c);
        }
        p.append(word);
      }
    }
    if (reduce) el.classList.add("fx-lsr-still");
    return () => {
      parts.forEach((p, k) => { p.innerHTML = saved[k]; });
      el.classList.remove("fx-lsr-still");
      for (const v of ["--fx-each", "--fx-dur", "--fx-delay", "--fx-over"]) el.style.removeProperty(v);
    };
  });
})();
