(() => {
  // Title words lie tilted back 45° and hidden half their height below. Once on screen, each word stands up at .937s, .05s later per word (original curve 0.19,1,0.22,1)
  kfFx.register("word-tilt-rise", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim()) return;
    const dur = +(options.dur ?? 0.937), each = +(options.each ?? 0.05), delay = +(options.delay ?? 0.3);
    const tilt = +(options.tilt ?? -45), rise = +(options.rise ?? 50);
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");

    // Wrap words only as inline-block chunks and leave spaces between as is — so multi-line Korean titles don’t break in the middle of a word
    const made = [];
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          if (parts.every((p) => !p.trim())) continue;
          const frag = document.createDocumentFragment();
          for (const p of parts) {
            if (!p) continue;
            if (!p.trim()) { frag.append(p); continue; }
            const w = document.createElement("span");
            w.setAttribute("data-fx-part", "word");
            w.textContent = p;
            frag.append(w);
            made.push(w);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.getAttribute("data-fx-part") !== "word") walk(child);
      }
    };
    const original = el.innerHTML;
    walk(el);
    if (!made.length) return;
    gsap.set(made, { opacity: 0, rotationX: tilt, yPercent: rise, transformPerspective: 600, transformOrigin: "50% 50%" });
    const tw = gsap.to(made, {
      opacity: 1, rotationX: 0, yPercent: 0, duration: dur, ease, delay,
      stagger: each, paused: true,
    });
    let st = null;
    if (options.on === "load") tw.play();
    else if (window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top bottom", once: true, onEnter: () => tw.play() });
    else tw.play();
    return () => { st && st.kill(); tw.kill(); el.innerHTML = original; };
  });
})();
