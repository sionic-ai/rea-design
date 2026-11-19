(() => {
  /* Framer’s character appear (appear · character) — inside a word chunk, each character resolves in turn from blurred · low · transparent.
     on: load fires after the delay as soon as it attaches, scroll fires once when it enters the screen, state fires each time fx:show reaches the element (hidden again by fx:hide) */
  const splitText = (el, by) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return n.dataset.fxPart === "char" ? null : walk(n);
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const w = document.createElement("span");
          w.style.display = "inline-block";
          w.style.whiteSpace = "nowrap";
          if (by === "word") { w.dataset.fxPart = "char"; w.textContent = part; }
          else [...part].forEach((ch) => { const c = document.createElement("span"); c.dataset.fxPart = "char"; c.style.display = "inline-block"; c.textContent = ch; w.append(c); });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
  };

  kfFx.register("char-blur-rise", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    const by = options.split === "word" ? "word" : "char";
    const before = el.innerHTML;
    if (!el.querySelector('[data-fx-part="char"]')) splitText(el, by);
    const parts = [...el.querySelectorAll('[data-fx-part="char"]')];
    if (!parts.length) return;
    const undo = () => { el.innerHTML = before; };
    if (reduce) return undo;
    const blur = +(options.blur ?? 10), y = +(options.y ?? 10);
    const dur = +(options.dur ?? 0.6), each = +(options.each ?? 0.05), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.58,0,0.42,1", "power1.inOut");
    const hidden = { filter: `blur(${blur}px)`, opacity: 0, y };
    gsap.set(parts, hidden);
    const show = (d = delay) => gsap.to(parts, { filter: "blur(0px)", opacity: 1, y: 0, duration: dur, ease, stagger: each, delay: d, overwrite: true });
    const hide = () => gsap.set(parts, hidden);
    const on = options.on || "load";
    let st = null, tw = null;
    const onShow = (e) => { hide(); tw = show(e.detail && e.detail.delay != null ? +e.detail.delay : delay); };
    if (on === "state") {
      el.addEventListener("fx:show", onShow);
      el.addEventListener("fx:hide", hide);
    } else if (on === "scroll" && window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: () => { tw = show(); } });
    } else {
      tw = show();
    }
    return () => {
      el.removeEventListener("fx:show", onShow);
      el.removeEventListener("fx:hide", hide);
      st && st.kill();
      tw && tw.kill();
      gsap.killTweensOf(parts);
      undo();
    };
  });
})();
