(() => {
  // Each word pops from scale 0, 75% down, transparent into place, in shuffled order delayed by .05s steps — the line forms everywhere at once instead of left to right.
  // Highlight band inside text (data-fx-part="bar") spreads from left to right. In a screen-flip panel it must run again each time the section changes, so it receives fx:play and fx:reset
  const wrapWords = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('[data-fx-part="word"],[data-fx-part="bar"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) nodes.push(walk.currentNode);
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const piece of node.nodeValue.split(/(\s+)/)) {
        if (!piece) continue;
        if (!piece.trim()) { frag.append(piece); continue; }
        const w = document.createElement("span");
        w.setAttribute("data-fx-part", "word");
        w.textContent = piece;
        frag.append(w);
      }
      node.replaceWith(frag);
    }
  };

  kfFx.register("word-pop-shuffle", (el, { options, reduce, scroller }) => {
    const original = el.innerHTML;
    if (!el.textContent.trim()) return;
    if (!el.querySelector('[data-fx-part="word"]')) wrapWords(el);
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!words.length) { el.innerHTML = original; return; }
    const undo = () => { gsap.killTweensOf([...words, ...bars]); el.innerHTML = original; };
    const hidden = { opacity: 0, yPercent: 75, scale: 0 };
    const shown = { opacity: 1, yPercent: 0, scale: 1 };
    if (reduce) { gsap.set(words, shown); bars.length && gsap.set(bars, { scaleX: 1 }); return undo; }
    const delay = +(options.delay ?? 0), each = +(options.each ?? 0.05), dur = +(options.dur ?? 0.8);
    const barDelay = +(options["bar-delay"] ?? delay), barDur = +(options["bar-dur"] ?? 1.2);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const order = gsap.utils.shuffle(words.map((_, i) => i));
    let tl;
    const reset = () => {
      tl && tl.kill();
      gsap.set(words, hidden);
      bars.length && gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });
    };
    const play = () => {
      reset();
      tl = gsap.timeline({ defaults: { ease }, onComplete: () => el.dispatchEvent(new CustomEvent("fx:played")) });
      words.forEach((w, i) => tl.fromTo(w, hidden, { ...shown, duration: dur }, delay + each * order[i]));
      bars.forEach((b) => tl.fromTo(b, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: barDur }, barDelay));
    };
    const show = () => { tl && tl.kill(); gsap.set(words, shown); bars.length && gsap.set(bars, { scaleX: 1 }); };
    reset();
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:reset", reset);
    el.addEventListener("fx:show", show);
    let st;
    if (options.on === "event") { /* Hidden until the outside (screen transition) sends fx:play */ }
    else if (options.start && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start, once: true, onEnter: play });
    } else play();
    return () => {
      st && st.kill(); tl && tl.kill();
      el.removeEventListener("fx:play", play); el.removeEventListener("fx:reset", reset); el.removeEventListener("fx:show", show);
      undo();
    };
  });
})();
