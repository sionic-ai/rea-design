(() => {
  // Splits letters within word chunks, hides them slanted aside and upward (skewX), then stands them upright from the first letter while holding blur, and lifts the blur .3s later
  const wrap = (root) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) { if (n.tagName !== "BR") walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.style.cssText = "display:inline-block;white-space:nowrap";
          [...part].forEach((ch) => { const c = document.createElement("span"); c.dataset.fxPart = "char"; c.style.display = "inline-block"; c.textContent = ch; w.append(c); out.push(c); });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(root);
    return out;
  };
  kfFx.register("skew-blur-chars", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    const html = el.innerHTML;
    const chars = wrap(el);
    el.classList.add("fx-split");
    if (reduce || !chars.length) return () => { el.innerHTML = html; el.classList.remove("fx-split"); };
    const skew = +(options.skew ?? -10), y = +(options.y ?? -10), blur = +(options.blur ?? 5);
    const dur = +(options.dur ?? 2.4), clear = +(options.clear ?? dur), gap = +(options.gap ?? 0.3), delay = +(options.delay ?? 0);
    const ease = !options.ease ? "power3.out" : /^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power3.out") : options.ease;
    // If each is given, that interval is used per character, otherwise the whole is divided within amount (default .6)
    const stagger = options.each != null ? { from: "start", each: +options.each } : { from: "start", amount: +(options.amount ?? 0.6) };
    gsap.set(chars, { y, skewX: `${skew}deg`, autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true, delay })
      .to(chars, { ease, autoAlpha: 1, y: 0, filter: `blur(${blur}px)`, skewX: "0deg", duration: dur, stagger })
      .to(chars, { ease, filter: "blur(0px)", duration: clear, stagger }, `<+${gap}`);
    let st = null;
    if (options.on === "load") tl.play();
    else if (options.on === "manual") el.fxPlay = () => tl.play();
    else st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", once: true, onEnter: () => tl.play() });
    return () => { st && st.kill(); tl.kill(); delete el.fxPlay; el.innerHTML = html; el.classList.remove("fx-split"); };
  });
})();
