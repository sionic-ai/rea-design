(() => {
  // Original TextShuffle: on hover the text width is pinned in place, and the same characters are shuffled randomly and shown twice at 50ms intervals before returning to the real text.
  // Letters swap only among themselves without pulling in other letters, so the width stays almost the same and only the flash feel remains. Spaces stay in place.
  const shuffle = (s) => {
    const keep = [...s].map((c) => (/\s/.test(c) ? c : null));
    const pool = [...s].filter((c) => !/\s/.test(c));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return keep.map((c) => c ?? pool.shift()).join("");
  };
  kfFx.register("char-swap-hover", (el, { options, reduce, hover }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const targets = (parts.length ? parts : [el]).filter((t) => t.children.length === 0 && t.textContent.trim());
    if (!targets.length || reduce || !hover) return;
    const times = +(options.times || 2), every = +(options.every || 50);
    const saved = targets.map((t) => t.textContent);
    let timer = 0, n = 0;
    const stop = () => {
      clearTimeout(timer); n = 0;
      targets.forEach((t, i) => { t.textContent = saved[i]; t.style.width = ""; t.classList.remove("fx-csh-on"); });
    };
    const step = () => {
      if (n < times) { targets.forEach((t, i) => (t.textContent = shuffle(saved[i]))); n += 1; timer = setTimeout(step, every); }
      else stop();
    };
    const go = () => {
      stop();
      targets.forEach((t) => { t.style.width = `${t.getBoundingClientRect().width}px`; t.classList.add("fx-csh-on"); });
      step();
    };
    el.addEventListener("pointerenter", go);
    return () => { el.removeEventListener("pointerenter", go); stop(); };
  });
})();
