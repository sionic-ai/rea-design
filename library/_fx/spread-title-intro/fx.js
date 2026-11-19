(() => {
  // Letters of the big title words light up in random order, then the title line widens from a narrow width to full width while the hero panel that filled the screen folds down to its own height
  const splitChars = (root) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const word = document.createElement("span");
            word.className = "fx-sti-word";
            [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "fx-sti-char"; c.textContent = ch; word.append(c); out.push(c); });
            frag.append(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
    return out;
  };
  kfFx.register("spread-title-intro", (el, { options, reduce }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    if (!title || !window.gsap) return;
    const subs = [...el.querySelectorAll('[data-fx-part="sub"]')];
    const min = +(options.min ?? 768);
    if (reduce || innerWidth < min) return;
    const html = new Map([title, ...subs].map((n) => [n, n.innerHTML]));
    const ease = kfFx.ease(options.ease || "0.075,0.82,0.165,1", "circ.out");
    const at = +(options.delay ?? 1.25), dur = +(options.dur ?? 0.8), from = +(options.from ?? 86), amount = +(options.amount ?? 0.5);
    const chars = splitChars(title);
    const subChars = subs.flatMap((s) => splitChars(s));
    const tl = gsap.timeline();
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease }, 0);
    tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none", stagger: { amount, from: "random" } }, 0);
    tl.fromTo(title, { width: from + "%" }, { width: "100%", duration: dur, ease }, at);
    if (options.height !== "none") {
      const h = el.offsetHeight;
      tl.fromTo(el, { height: options.height || "90vh" }, { height: h, duration: dur, ease, clearProps: "height" }, at + 0.02);
    }
    if (subChars.length) tl.fromTo(subChars, { opacity: 0 }, { opacity: 1, duration: +(options.sub ?? 0.41), ease, stagger: { amount, from: "random" } }, at + 0.5);
    return () => {
      tl.kill();
      gsap.set([el, title], { clearProps: "opacity,width,height" });
      html.forEach((v, n) => { n.innerHTML = v; });
    };
  });
})();
