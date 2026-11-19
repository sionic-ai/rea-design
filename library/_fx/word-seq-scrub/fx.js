// While passing through a tall section, stacked paragraphs show one per screen — words rise from below, rest half a beat, then exit upward (tied directly to scroll)
(() => {
  // Wrap only words as inline-block and leave spaces as plain text — so Korean line breaks (keep-all) break between words
  const split = (root) => {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach((n) => {
      const parts = n.textContent.split(/(\s+)/).filter(Boolean);
      if (!parts.some((s) => s.trim())) return;
      const frag = document.createDocumentFragment();
      parts.forEach((s) => {
        if (!s.trim()) return frag.appendChild(document.createTextNode(s));
        const w = document.createElement("span");
        w.setAttribute("data-fx-part", "word");
        w.textContent = s;
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
    return root.querySelectorAll('[data-fx-part="word"]');
  };

  kfFx.register("word-seq-scrub", (el, { options, reduce, scroller }) => {
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    if (!texts.length) return;
    const first = +(options.first ?? 1), each = +(options.each ?? 0.05), hold = +(options.hold ?? 0.5);
    const saved = texts.map((t) => t.innerHTML);
    const words = texts.map(split);
    const restore = () => texts.forEach((t, i) => { gsap.set(t, { clearProps: "opacity" }); t.innerHTML = saved[i]; });
    if (reduce) {
      texts.forEach((t, i) => gsap.set(t, { opacity: i === texts.length - 1 ? 1 : 0 }));
      return restore;
    }
    const screen = () => (scroller && scroller !== window ? scroller.clientHeight : innerHeight);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      texts.forEach((t, n) => {
        gsap.set(t, { opacity: 0 });
        if (!words[n].length) return;
        const i = n + first;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, scroller, start: () => `top+=${i * screen()} top`, end: () => `top+=${(i + 1) * screen()} top`, scrub: true, invalidateOnRefresh: true },
        });
        tl.set(t, { opacity: 1 }).fromTo(words[n], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: each, duration: 1, ease: "power2.out" });
        if (n !== texts.length - 1) tl.to(words[n], { yPercent: -100, opacity: 0, stagger: each, duration: 1, ease: "power2.in" }, `+=${hold}`);
      });
    });
    return () => { mm.revert(); restore(); };
  });
})();
