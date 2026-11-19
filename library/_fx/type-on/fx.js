(() => {
  kfFx.register("type-on", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const was = el.innerHTML, chars = [];
    // With caret, characters not yet typed also give up their space (text grows and the cursor follows the end). Spaces are hidden as one character then too
    const caretText = options.caret ? String(options.caret) : "";
    // Wrap words as inline-block chunks and keep the spaces between as literal characters — &nbsp; Switch to it and a multi-line title can’t break between words. One run of spaces counts as one beat
    let beat = 0;
    el.replaceChildren(...el.textContent.split(/(\s+)/).filter(Boolean).map((w) => {
      if (/^\s/.test(w)) {
        if (!chars.length) return w;
        if (!caretText) { beat++; return w; }
        const gap = Object.assign(document.createElement("span"), { className: "fx-ch fx-gap", textContent: w });
        chars.push([gap, beat++]);
        return gap;
      }
      const word = Object.assign(document.createElement("span"), { className: "fx-word" });
      word.append(...[...w].map((c) => { const s = Object.assign(document.createElement("span"), { className: "fx-ch", textContent: c }); chars.push([s, beat++]); return s; }));
      return word;
    }));
    const caret = caretText ? Object.assign(document.createElement("span"), { className: "fx-caret", textContent: caretText }) : null;
    if (caret) { el.append(caret); el.classList.add("fx-grow"); }
    // When dur is given, spread the whole text evenly over that length (one-character interval = dur ÷ beat count) — long titles and short dates are all stamped in the same time
    const dur = options.dur != null ? +options.dur : 0;
    const step = dur > 0 && beat ? dur / beat : +(options.step || 0.03), mm = gsap.matchMedia();
    // when frames is given, steps one image every frame seconds like a GIF — over frames frames, the nth letter turns on at frame ceil((n+1)·frames/letter count)
    const frames = +options.frames || 0, frame = +(options.frame ?? 0.1);
    const at = (beatAt, n) => (frames ? frame * Math.ceil(((n + 1) * frames) / chars.length) : beatAt * step);
    const end = () => (frames ? frame * frames : beat * step);
    // mask — instead of hiding untyped characters, covers them with this character (e.g. *) and swaps them one by one to the real ones (like a password). Spaces stay as they are
    const maskText = options.mask ? String(options.mask) : "";
    const unmask = (c) => { if (c.dataset.fxCh != null) c.textContent = c.dataset.fxCh; };
    const remask = (c) => { if (c.dataset.fxCh != null) c.textContent = maskText; };
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("fx-typing");
      if (maskText) { el.classList.add("fx-mask"); chars.forEach(([c]) => { if (c.textContent.trim()) { c.dataset.fxCh = c.textContent; c.textContent = maskText; } }); }
      const type = (calls, onLast) => {
        caret?.classList.remove("off");
        chars.forEach(([c, i], n) => calls.push(gsap.delayedCall(+(options.delay || 0) + at(i, n), () => {
          c.classList.add("on");
          unmask(c);
          if (n === chars.length - 1) onLast?.();
        })));
        if (caret) calls.push(gsap.delayedCall(+(options.delay || 0) + end(), () => caret.classList.add("off")));
      };
      // when: shown — not on scroll but every time it becomes visible (own or ancestor opacity .1 or more, checked every 100ms) it types from the start, and erases when hidden. Fires fx:typed when done
      if (options.when === "shown") {
        const visible = () => { for (let n = el; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (+s.opacity < 0.1 || s.display === "none" || s.visibility === "hidden") return false; } return true; };
        let seen = visible(), shownCalls = [];
        const clear = () => { shownCalls.forEach((c) => c.kill()); shownCalls = []; chars.forEach(([c]) => { c.classList.remove("on"); remask(c); }); caret?.classList.remove("off"); };
        const play = () => { clear(); type(shownCalls, () => el.dispatchEvent(new CustomEvent("fx:typed", { bubbles: true }))); };
        if (seen) play();
        const id = setInterval(() => { const now = visible(); if (now && !seen) play(); else if (!now && seen) clear(); seen = now; }, 100);
        return () => { clearInterval(id); clear(); chars.forEach(([c]) => unmask(c)); el.classList.remove("fx-typing", "fx-mask"); };
      }
      const calls = [];
      let fresh = true;
      const go = () => fresh && ((fresh = false), type(calls));
      const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 90%", ...(options.end && { end: options.end }), onEnter: go, onEnterBack: go });
      return () => { st.kill(); calls.forEach((c) => c.kill()); chars.forEach(([c]) => unmask(c)); el.classList.remove("fx-typing", "fx-mask"); };
    });
    return () => { mm.revert(); el.innerHTML = was; el.classList.remove("fx-grow"); };
  });
})();
