(() => {
  // Original CustomEase lowerTextEasing — a curve that overshoots by 6% at the end then settles
  const LOWER = "M0,0 C0,0 0.069,0.257 0.095,0.336 0.116,0.402 0.16,0.524 0.185,0.581 0.208,0.635 0.257,0.736 0.285,0.78 0.31,0.821 0.388,0.991 0.417,1.02 0.442,1.045 0.508,1.04 0.536,1.054 0.565,1.06 0.66,1.04 0.78,1.015 0.92,1.003 1,1 1,1";
  kfFx.register("spell-rise-heading", (el, { options, reduce, scroller }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    if (!title || !title.textContent.trim()) return;
    const bar = el.querySelector('[data-fx-part="bar"]');
    const fades = [...el.querySelectorAll('[data-fx-part="sub"], [data-fx-part="desc"], [data-fx-part="after"]')];
    const was = title.innerHTML;
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    const chars = [];
    const frag = document.createDocumentFragment();
    // Words are wrapped as chunks with the spaces between left intact, so multi-line Korean titles don’t break in the middle of a word
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.append(" "); return; }
      const word = document.createElement("span");
      word.className = "fx-srh-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = "fx-srh-ch";
        s.textContent = ch;
        word.append(s);
        chars.push(s);
      }
      frag.append(word);
    });
    title.replaceChildren(frag);
    const restore = () => { title.innerHTML = was; title.removeAttribute("aria-label"); };
    if (reduce) return restore;
    const each = +(options.each ?? 0.08), dur = +(options.dur ?? 0.5), delay = +(options.delay ?? 0);
    const rise = +(options.rise ?? 100), shift = +(options.shift ?? 30);
    const ease = kfFx.ease(options.ease || LOWER, "back.out(1.4)");
    const after = [bar, ...fades].filter(Boolean);
    // fade: none — the text cell hides overflow (overflow hidden), so the text only rises without opacity (the English title of Brand)
    const fade = options.fade !== "none";
    gsap.set(chars, { yPercent: rise, ...(fade ? { opacity: 0 } : {}) });
    if (after.length) gsap.set(after, { opacity: 0, y: shift });
    const tl = gsap.timeline({ paused: true, delay });
    tl.to(chars, { yPercent: 0, ...(fade ? { opacity: 1 } : {}), duration: dur, ease, stagger: each }, 0);
    // Underline .2s, subtitle .3s, description .4s — from 30px below in 1s power2.out (original fadeInYProps)
    if (bar) tl.to(bar, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.2);
    fades.forEach((f, i) => tl.to(f, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.3 + i * 0.1));
    let st = null;
    if (options.on === "load") tl.play();
    else st = ScrollTrigger.create({ trigger: el, start: options.start || "top 75%", once: true, scroller, onEnter: () => tl.play() });
    return () => {
      st?.kill();
      tl.kill();
      gsap.set([...chars, ...after], { clearProps: "transform,opacity" });
      restore();
    };
  });
})();
