(() => {
  // Title with each letter in its own cell (overflow hidden) — letters in the cell rise from y px below at each interval in seconds.
  // Cell children ([data-fx-part=char]) is absent, each character gets its own cell, and detaching restores the original markup.
  kfFx.register("cell-char-rise", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    let chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    let original = null;
    if (!chars.length) {
      const text = el.textContent.trim();
      if (!text) return;
      original = el.innerHTML;
      el.textContent = "";
      for (const ch of text) {
        if (!ch.trim()) { el.append(" "); continue; }
        const cell = document.createElement("span");
        cell.className = "cell-char-rise__cell";
        const inner = document.createElement("span");
        inner.dataset.fxPart = "char";
        inner.textContent = ch;
        cell.append(inner);
        el.append(cell);
      }
      chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    }
    const restore = () => { if (original !== null) el.innerHTML = original; };
    if (reduce) return restore;

    const y = +(options.y ?? 40);
    const dur = +(options.dur ?? 0.5);
    const each = +(options.each ?? 0.1);
    const delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    const onLoad = options.on === "load";
    const vars = { y, duration: dur, ease, stagger: each, delay };
    if (window.ScrollTrigger && !onLoad) {
      gsap.registerPlugin(ScrollTrigger);
      vars.scrollTrigger = { trigger: el, start: options.start || "top 95%", scroller: scroller || undefined };
    }
    const tw = gsap.from(chars, vars);
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
      gsap.set(chars, { clearProps: "transform" });
      restore();
    };
  });
})();
