(() => {
  // Letter cells melt (or grow) not left to right but in a shuffled order like falling drops — each cell’s scaleY is tied to scroll
  kfFx.register("drip-melt", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    let cells = [...el.querySelectorAll('[data-fx-part="cell"]')];
    const html = el.innerHTML;
    let split = false;
    // Without cells, split the text into cells — each word is grouped as one inline-block chunk, and the spaces between are left as they are.
    if (!cells.length && !el.children.length && el.textContent.trim()) {
      const words = el.textContent.split(/(\s+)/);
      el.textContent = "";
      for (const w of words) {
        if (/^\s*$/.test(w)) { el.append(w); continue; }
        const word = el.appendChild(document.createElement("span"));
        word.dataset.fxPart = "word";
        for (const c of w) Object.assign(word.appendChild(document.createElement("span")), { textContent: c }).dataset.fxPart = "cell";
      }
      cells = [...el.querySelectorAll('[data-fx-part="cell"]')];
      split = true;
    }
    if (!cells.length) return;
    const restore = () => { if (split) el.innerHTML = html; };
    gsap.registerPlugin(ScrollTrigger);
    const order = String(options.order ?? "0 3 1 5 2 4").split(/[\s,]+/).filter(Boolean).map(Number);
    const from = +(options.from ?? 1), to = +(options.to ?? 0.42);
    const each = +(options.each ?? 0.076), dur = +(options.dur ?? 0.62);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (options.origin) gsap.set(cells, { transformOrigin: options.origin });
      gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "bottom bottom", end: options.end || "bottom 30%", scrub: true } })
        .fromTo(cells, { scaleY: from }, { scaleY: to, ease: "none", duration: dur, stagger: (i) => (order[i % order.length] || 0) * each }, 0);
    });
    return () => { mm.revert(); restore(); };
  });
})();
