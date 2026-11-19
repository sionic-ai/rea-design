(() => {
  // Wrap each letter and attach its order (--i), then add a marker (is-fx-on) enabled on wide screens only — the motion itself is a :hover keyframe in fx.css
  // Each hover spins once from the start, on leave, the letters stopped mid-way return to their places.
  kfFx.register("char-cycle-up-hover", (el, { options, hover }) => {
    const target = el.querySelector('[data-fx-part="text"]') || el;
    const text = target.textContent;
    if (!text.trim()) return;
    const was = target.innerHTML;
    el.setAttribute("aria-label", el.getAttribute("aria-label") || text.trim());
    let i = 0;
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.append(" "); return; }
      const word = document.createElement("span");
      word.className = "fx-ccu-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = "fx-ccu-ch";
        s.textContent = ch;
        s.style.setProperty("--i", i++);
        word.append(s);
      }
      frag.append(word);
    });
    target.replaceChildren(frag);
    if (options.each != null) el.style.setProperty("--fx-each", `${+options.each}s`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    const min = +(options.min ?? 835);
    const sync = () => el.classList.toggle("is-fx-on", hover && innerWidth >= min);
    sync();
    addEventListener("resize", sync);
    return () => {
      removeEventListener("resize", sync);
      target.innerHTML = was;
      el.classList.remove("is-fx-on");
      ["--fx-each", "--fx-dur", "--fx-ease"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
