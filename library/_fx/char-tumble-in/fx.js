(() => {
  // Splits the text into characters inside word chunks and pre-tumbles them in 3D (rotated 10°, tilted 120° on Y and −30° on X, 1.1x, transparent), then stands them upright in sequence.
  // The original page changes the GSAP default curve to none, so it is a .5s linear — the caller can change it with ease
  const split = (el) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.nodeValue.replace(/\s*\n\s*/g, " ").split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(document.createTextNode(" ")); return; }
            const word = document.createElement("span");
            word.className = "fx-ct-word";
            [...w].forEach((c) => {
              const s = document.createElement("span");
              s.className = "fx-ct-char";
              s.textContent = c;
              word.append(s);
              chars.push(s);
            });
            frag.append(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return chars;
  };
  kfFx.register("char-tumble-in", (el, { options, reduce, scroller }) => {
    if (el.querySelector(".fx-ct-char")) return;
    const saved = el.innerHTML;
    const label = el.textContent.replace(/\s+/g, " ").trim();
    const chars = split(el);
    if (!chars.length) { el.innerHTML = saved; return; }
    el.setAttribute("aria-label", label);
    const restore = () => { el.innerHTML = saved; el.removeAttribute("aria-label"); };
    if (reduce || !window.gsap) return restore;
    const from = {
      opacity: 0,
      rotation: +(options.rot ?? 10),
      rotationY: +(options.ry ?? 120),
      rotationX: +(options.rx ?? -30),
      scale: +(options.scale ?? 1.1),
    };
    const ease = !options.ease ? "none" : /,/.test(options.ease) ? kfFx.ease(options.ease, "power2.out") : options.ease;
    const to = { opacity: 1, rotation: 0, rotationY: 0, rotationX: 0, scale: 1, duration: +(options.dur ?? 0.5), stagger: +(options.stagger ?? 0.03), delay: +(options.delay ?? 0.5), ease };
    gsap.set(chars, from);
    let tw = null, st = null, mo = null;
    const play = () => { if (!tw) tw = gsap.to(chars, to); };
    if (options.on === "scroll" && window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", once: true, onEnter: play });
    else if (options.on === "state") {
      const check = () => { if (!el.classList.contains(options.state || "is-active")) return; mo.disconnect(); play(); };
      mo = new MutationObserver(check);
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
      check();
    } else play();
    return () => { st && st.kill(); mo && mo.disconnect(); tw && tw.kill(); gsap.killTweensOf(chars); restore(); };
  });
})();
