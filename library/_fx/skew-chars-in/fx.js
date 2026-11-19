(() => {
  // Wraps and splits text by word chunks (spaces kept as is), and straightens it right at the line break
  const split = (el) => {
    const made = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span");
            w.setAttribute("data-fx-part", "word");
            for (const ch of part) { const c = document.createElement("span"); c.setAttribute("data-fx-part", "char"); c.textContent = ch; w.append(c); made.push(c); }
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.getAttribute("data-fx-part") !== "char") walk(n);
      }
    };
    walk(el);
    return made;
  };
  kfFx.register("skew-chars-in", (el, { options, reduce }) => {
    const html = el.innerHTML;
    const chars = split(el);
    if (!chars.length) return;
    const soft = (options.look || "") === "soft";
    const from = soft ? { opacity: 0, x: -8, y: 8 } : { skewY: 32, skewX: 40, scale: 0.8, y: 32, x: -24, opacity: 0 };
    const to = soft ? { opacity: 1, x: 0, y: 0 } : { skewY: 0, skewX: 0, scale: 1, y: 0, x: 0, opacity: 1 };
    if (reduce) { gsap.set(chars, to); return () => (el.innerHTML = html); }
    const tw = gsap.fromTo(chars, from, { ...to, duration: +(options.dur ?? 0.8), ease: "power2.out", stagger: { each: +(options.each ?? (soft ? 0.02 : 0.03)) }, paused: true });
    const on = options.on || "view";
    let st = null;
    if (on === "load") tw.play();
    else if (on === "view") st = ScrollTrigger.create({ trigger: el, start: options.start || "top 85%", once: true, onEnter: () => tw.play() });
    el.fxPlay = () => tw.play();
    return () => { st?.kill(); tw.kill(); delete el.fxPlay; el.innerHTML = html; };
  });
})();
