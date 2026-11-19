(() => {
  // Text line (data-fx-part="letters", or the whole text of the attached element if none) is split into characters inside each word chunk, with a per-character delay (each sec × index).
  // Bouncy keyframes are applied by fx.css when the interaction is raised — with multiple text lines, each line counts from 0 again
  kfFx.register("char-hop-hover", (el, { options }) => {
    const smooth = /smooth/.test(options.look || "");
    const each = +(options.each ?? 0.05);
    let parts = [...el.querySelectorAll('[data-fx-part="letters"]')];
    if (!parts.length && el.textContent.trim() && !el.querySelector("*")) parts = [el];
    if (!parts.length) return;
    if (options.dur != null) el.style.setProperty("--fx-hop-dur", `${+options.dur}s`);
    if (options.hop != null) el.style.setProperty("--fx-hop", options.hop);
    const saved = parts.map((p) => p.innerHTML);
    for (const p of parts) {
      let i = 0;
      const words = p.textContent.split(/(\s+)/);
      p.textContent = "";
      for (const w of words) {
        if (!w) continue;
        if (/^\s+$/.test(w)) { p.append(w); continue; }
        const word = document.createElement("span");
        word.className = "fx-hop-word";
        for (const ch of w) {
          const c = document.createElement("span");
          c.className = "fx-hop-ch";
          c.textContent = ch;
          c.style.animationDelay = `${(i++ * each).toFixed(3)}s`;
          word.append(c);
        }
        p.append(word);
      }
    }
    if (smooth) el.classList.add("fx-hop-smooth");
    return () => {
      parts.forEach((p, k) => { p.innerHTML = saved[k]; });
      el.classList.remove("fx-hop-smooth");
      el.style.removeProperty("--fx-hop-dur");
      el.style.removeProperty("--fx-hop");
    };
  });
})();
