// Text is split into letters inside word chunks, and when it reaches 85% of the screen each letter resolves in random order from 8px blur and transparent over .4s power2.out (total spread .2s).
// on: load runs as soon as it attaches (Hero title — original 1.2s · spread .8s), on: state runs when the element gets is-in. Once it has settled it never hides again.
(() => {
  const split = (el) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) { if (!n.matches("br, svg, img")) walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.append(document.createTextNode(w)); return; }
          const wd = document.createElement("span");
          wd.className = "fx-bcr-w";
          [...w].forEach((c) => {
            const ch = document.createElement("span");
            ch.className = "fx-bcr-c";
            ch.textContent = c;
            wd.append(ch);
            chars.push(ch);
          });
          frag.append(wd);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
    return chars;
  };

  kfFx.register("blur-chars-random", (el, { options, reduce, scroller }) => {
    const on = options.on || "scroll";
    const dur = +(options.dur ?? (on === "load" ? 1.2 : 0.4)), spread = +(options.spread ?? (on === "load" ? 0.8 : 0.2));
    const blur = +(options.blur ?? 8), delay = +(options.delay ?? 0), start = options.start || "top 85%";
    const ease = options.ease ? kfFx.ease(options.ease, "power2.out") : "power2.out";
    const before = el.innerHTML;
    const chars = split(el);
    if (!chars.length) { el.innerHTML = before; return; }
    el.classList.add("fx-bcr-on");
    if (reduce) return () => { el.innerHTML = before; el.classList.remove("fx-bcr-on"); };
    gsap.set(chars, { opacity: 0, filter: `blur(${blur}px)` });
    let tween = null, st = null, mo = null;
    const play = () => {
      if (tween) return;
      tween = gsap.to(chars, { opacity: 1, filter: "blur(0px)", clearProps: "filter", duration: dur, delay, ease, stagger: { amount: spread, from: "random" } });
      el.dispatchEvent(new CustomEvent("fx:play", { bubbles: true }));
    };
    if (on === "load") play();
    else if (on === "state") {
      const check = () => el.classList.contains("is-in") && play();
      mo = new MutationObserver(check);
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
      check();
    } else if (window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, scroller, start, end: "bottom 20%", onEnter: (s) => s.progress < 1 && play(), onEnterBack: play });
      if (st.progress > 0 && st.progress < 1) play();
    } else play();
    return () => { tween?.kill(); st?.kill(); mo?.disconnect(); el.innerHTML = before; el.classList.remove("fx-bcr-on"); };
  });
})();
