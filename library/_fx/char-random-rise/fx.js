(() => {
  // Give each letter a random delay (0 to spread seconds, in step units) via a CSS variable, and add is-in when the reference element’s top crosses the line.
  // With the delay set as transition-delay, hiding back down scatters with the same delay (exactly how the original removes the class).
  kfFx.register("char-random-rise", (el, { options, reduce, scroller }) => {
    let original = null;
    let chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    if (!chars.length) {
      if (!el.textContent.trim()) return;
      original = el.innerHTML;
      const split = (node) => {
        for (const child of [...node.childNodes]) {
          if (child.nodeType === 1) { split(child); continue; }
          if (child.nodeType !== 3 || !child.textContent.trim()) continue;
          const frag = document.createDocumentFragment();
          for (const piece of child.textContent.split(/(\s+)/)) {
            if (!piece) continue;
            if (/^\s+$/.test(piece)) { frag.append(piece); continue; }
            const word = document.createElement("span");
            word.style.display = "inline-block";
            word.style.whiteSpace = "nowrap";
            for (const ch of piece) {
              const cell = document.createElement("span");
              cell.dataset.fxPart = "cell";
              const inner = document.createElement("span");
              inner.dataset.fxPart = "char";
              inner.textContent = ch;
              cell.append(inner);
              word.append(cell);
            }
            frag.append(word);
          }
          child.replaceWith(frag);
        }
      };
      split(el);
      chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    }
    const restore = () => {
      el.classList.remove("is-in");
      if (original !== null) el.innerHTML = original;
      else chars.forEach((c) => c.style.removeProperty("--fx-d"));
    };
    if (reduce) { el.classList.add("is-in"); return restore; }

    const spread = +(options.spread ?? 1);
    const step = +(options.step ?? 0.005) || 0.005;
    const slots = Math.floor(spread / step);
    for (const c of chars) c.style.setProperty("--fx-d", `${(Math.floor(Math.random() * (slots + 1)) * step).toFixed(3)}s`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.fade != null) el.style.setProperty("--fx-fade", `${+options.fade}s`);
    if (options.lag != null) el.style.setProperty("--fx-lag", `${+options.lag}s`);
    if (options.y != null) el.style.setProperty("--fx-y", options.y);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);

    const on = () => el.classList.add("is-in");
    const off = () => el.classList.remove("is-in");
    if (options.on === "state") return restore;
    if (options.on === "load" || !window.ScrollTrigger) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(on));
      return () => { cancelAnimationFrame(raf); restore(); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const by = options.by ? el.closest(options.by) || el : el;
    const keep = options.toggle === "once";
    const st = ScrollTrigger.create({
      trigger: by,
      start: options.start || "top 50%",
      end: "max",
      scroller: scroller || undefined,
      onEnter: on,
      onLeaveBack: keep ? undefined : off,
    });
    if (st.isActive || st.progress > 0) on();
    return () => { st.kill(); restore(); };
  });
})();
