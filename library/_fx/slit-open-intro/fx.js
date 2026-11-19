(() => {
  // Puts text into masks one letter at a time — words are grouped as chunks and the spaces between are kept
  const splitChars = (el) => {
    const walk = [...el.childNodes];
    const chars = [];
    walk.forEach((n) => {
      if (n.nodeType === 1) { chars.push(...splitChars(n)); return; }
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(part);
        const w = document.createElement("span");
        w.className = "fx-slit__w";
        [...part].forEach((ch) => {
          const m = document.createElement("span"), c = document.createElement("span");
          m.className = "fx-slit__m";
          c.className = "fx-slit__c";
          c.textContent = ch;
          m.append(c);
          w.append(m);
          chars.push(c);
        });
        frag.append(w);
      });
      n.replaceWith(frag);
    });
    return chars;
  };

  kfFx.register("slit-open-intro", (el, { options, reduce }) => {
    const frame = el.querySelector('[data-fx-part="frame"]') || el;
    const scene = el.querySelector('[data-fx-part="scene"]');
    const title = el.querySelector('[data-fx-part="title"]');
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (reduce) { done(); return; }
    const [sy, sx] = String(options.slit || "48 46").split(/\s+/).map(Number);
    const peek = +(options.peek ?? 1), open = +(options.open ?? 2), zoom = +(options.zoom ?? 1.4);
    const original = title ? title.innerHTML : null;
    const chars = title ? splitChars(title) : [];
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(frame, { clipPath: "inset(100% 100% 100% 100%)" }, { clipPath: `inset(${sy}% ${sx}% ${sy}% ${sx}%)`, duration: peek, ease: "power4.out" }, 0)
      .to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: open, ease: "power4.inOut" }, peek);
    if (scene) tl.fromTo(scene, { scale: zoom }, { scale: 1 + (zoom - 1) / 2, duration: peek, ease: "power4.out" }, 0).to(scene, { scale: 1, duration: open, ease: "power4.inOut" }, peek);
    if (chars.length) tl.from(chars, { x: "1em", duration: open, ease: "power4.inOut", stagger: { each: +(options.each ?? 0.01), from: "start" } }, peek);
    return () => {
      tl.kill();
      gsap.set([frame, scene, ...chars].filter(Boolean), { clearProps: "clipPath,transform,scale" });
      if (title && original !== null) title.innerHTML = original;
    };
  });
})();
