(() => {
  kfFx.register("marker-shuffle-chars", (el, { options, reduce, scroller }) => {
    if (el.dataset.fxSplit) return;
    const original = el.innerHTML;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    const chars = [];
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      // Bind each word as one chunk so lines don’t break mid-word, keeping the spaces between as they are
      node.nodeValue.replace(/\r?\n/g, " ").split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(word); return; }
        const w = document.createElement("span");
        w.setAttribute("data-fx-part", "word");
        [...word].forEach((ch) => {
          const c = document.createElement("span");
          c.setAttribute("data-fx-part", "char");
          c.textContent = ch;
          w.append(c); chars.push(c);
        });
        frag.append(w);
      });
      node.replaceWith(frag);
    });
    if (!chars.length) { el.innerHTML = original; return; }
    el.dataset.fxSplit = "1";
    const cs = getComputedStyle(el);
    const color = (n, fb) => cs.getPropertyValue(n).trim() || getComputedStyle(document.documentElement).getPropertyValue(fb).trim();
    const from = color("--fx-from", "--kf-surface"), to = color("--fx-to", "--kf-accent");
    const undo = () => { el.innerHTML = original; delete el.dataset.fxSplit; gsap.set(el, { clearProps: "maskImage,webkitMaskImage,maskSize,webkitMaskSize,maskPosition,webkitMaskPosition,maskRepeat,webkitMaskRepeat" }); };
    if (reduce) { gsap.set(chars, { color: to }); return undo; }
    const dur = +(options.dur ?? 1.4), delay = +(options.delay ?? 0.2), each = +(options.each ?? 0.02), hold = +(options.hold ?? 0.15);
    const mask = "linear-gradient(to right, black, black)";
    gsap.set(el, { maskImage: mask, webkitMaskImage: mask, maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat", maskPosition: "left 100%", webkitMaskPosition: "left 100%", maskSize: "0% 100%", webkitMaskSize: "0% 100%" });
    gsap.set(chars, { visibility: "hidden", color: from });
    const tl = gsap.timeline({ paused: true })
      .to(el, { maskSize: "100% 100%", webkitMaskSize: "100% 100%", duration: dur, ease: kfFx.ease("0.16,1,0.3,1", "expo.out") }, 0)
      .to(gsap.utils.shuffle([...chars]), { keyframes: [{ visibility: "visible", duration: 0.1 }, { color: to, ease: "power1.out", duration: 0.1, delay: hold }], stagger: each }, delay);
    let st, io;
    const on = options.on || "view";
    if (on === "load") tl.play();
    else if (on === "state") {
      const check = () => el.classList.contains("is-in") && tl.play();
      io = new MutationObserver(check);
      io.observe(el, { attributes: true, attributeFilter: ["class"] });
      check();
    } else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top center+=25%", once: true, onEnter: () => tl.play() });
    return () => { st?.kill(); io?.disconnect(); tl.kill(); undo(); };
  });
})();
