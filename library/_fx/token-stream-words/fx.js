// Text forms word by word as if an AI were generating it — each word settles from 8px blur, transparent, 20% below over .5s expo.out, and the next word follows after a random .03~.12s (plus .22s after commas and periods),
// An accent-color cursor bar follows just behind the word that just landed, and when done it blinks four times at a 1.1s tempo. Given tokens·ms, that element also counts word count × 1.33 tokens and elapsed ms.
// Original Brand Hero subtitle (data-hero-generate).
(() => {
  kfFx.register("token-stream-words", (el, { options, reduce }) => {
    if (!el.textContent.trim()) return;
    const original = el.innerHTML;
    const label = el.getAttribute("aria-label");
    if (!label) el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    const words = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1) return walk(n);
      if (n.nodeType !== 3 || !n.textContent) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
        const w = document.createElement("span");
        w.className = "fx-tsw";
        w.setAttribute("aria-hidden", "true");
        w.textContent = part;
        frag.append(w);
        words.push(w);
      });
      n.replaceWith(frag);
    });
    walk(el);
    const caret = document.createElement("span");
    caret.className = "fx-tsw-caret";
    caret.setAttribute("aria-hidden", "true");
    el.append(caret);
    const tokens = options.tokens ? document.querySelector(options.tokens) : null;
    const ms = options.ms ? document.querySelector(options.ms) : null;
    const restore = () => { el.innerHTML = original; if (!label) el.removeAttribute("aria-label"); };
    if (reduce) {
      caret.classList.add("is-idle");
      if (tokens) tokens.textContent = String(Math.round(words.length * 1.33));
      return restore;
    }
    gsap.set(words, { opacity: 0, filter: "blur(8px)", yPercent: 20 });
    let tl = null;
    const play = (delay = +(options.delay ?? 0)) => {
      if (tl) return;
      tl = gsap.timeline({ delay });
      let at = 0, lastStart = 0;
      const lo = +(options.min ?? 0.03), hi = +(options.max ?? 0.12), pause = +(options.pause ?? 0.22);
      words.forEach((w, i) => {
        tl.to(w, {
          opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.5, ease: "expo.out",
          onStart: () => { w.after(caret); if (tokens) tokens.textContent = String(Math.round((i + 1) * 1.33)); },
        }, at);
        lastStart = at;
        at += gsap.utils.random(lo, hi) + (/[.,:;]$/.test(w.textContent) ? pause : 0);
      });
      // Report the total length so the caller can time follow-up motion to the end
      el.dispatchEvent(new CustomEvent("fx:start", { detail: { duration: delay + Math.max(at, lastStart + 0.5) } }));
      const clock = { v: 0 };
      tl.to(clock, { v: Math.round(at * 1000), duration: at, ease: "none", onUpdate: () => { if (ms) ms.textContent = String(Math.round(clock.v)); } }, 0);
      tl.add(() => caret.classList.add("is-idle"));
    };
    const onPlay = (e) => play(e.detail?.delay ?? +(options.delay ?? 0));
    if (options.start === "event") el.addEventListener("fx:play", onPlay);
    else play();
    return () => { el.removeEventListener("fx:play", onPlay); tl?.kill(); restore(); };
  });
})();
