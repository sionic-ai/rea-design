(() => {
  // Splits letters within word chunks — spaces are left as they are so Korean line breaks don’t cut in the middle of a word
  const splitLetters = (node) => {
    const out = [];
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) return frag.append(tok);
          const word = document.createElement("span");
          word.setAttribute("data-fx-part", "word");
          [...tok].forEach((c) => {
            const s = document.createElement("span");
            s.setAttribute("data-fx-part", "letter");
            s.textContent = c;
            word.append(s);
            out.push(s);
          });
          frag.append(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches("svg, img")) {
        out.push(...splitLetters(n));
      }
    });
    return out;
  };

  kfFx.register("letter-jolt-hover", (el, { options, reduce, hover }) => {
    const target = el.querySelector('[data-fx-part="text"]') || el;
    if (!target.textContent.trim()) return;
    const saved = target.innerHTML;
    const letters = splitLetters(target);
    if (!letters.length) return () => { target.innerHTML = saved; };
    if (reduce) return () => { target.innerHTML = saved; };
    const dur = +(options.dur ?? 0.25);
    const rot = +(options.rot ?? 15);
    const min = +(options.min ?? 1.15), max = +(options.max ?? 1.4);
    const weight = options.weight ?? 600;
    const rest = getComputedStyle(target).fontWeight;
    const spread = options.amount != null ? { amount: +options.amount } : +(options.each ?? 0.05);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const back = options.back || "elastic.out(1, 0.8)";
    const tl = gsap.timeline({ paused: true });
    tl.to(letters, { rotation: () => gsap.utils.random(-rot, rot), scale: () => gsap.utils.random(min, max), fontWeight: weight, duration: dur, ease, stagger: spread })
      .to(letters, { rotation: 0, scale: 1, fontWeight: rest, duration: dur, ease: back, stagger: spread });
    const play = () => tl.restart();
    const evt = hover ? "mouseenter" : "pointerdown";
    el.addEventListener(evt, play);
    el.addEventListener("focus", play);
    return () => {
      el.removeEventListener(evt, play);
      el.removeEventListener("focus", play);
      tl.kill();
      target.innerHTML = saved;
    };
  });
})();
