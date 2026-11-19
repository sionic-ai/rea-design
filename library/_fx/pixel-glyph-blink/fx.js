// Each letter stacks a normal glyph (b) and a bitmap glyph (i), and one random letter swaps to bitmap for a few frames, then back
(() => {
  kfFx.register("pixel-glyph-blink", (el, { options, reduce, hover }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const targets = parts.length ? parts : [el];
    if (!targets.some((t) => t.textContent.trim())) return;
    const narrow = matchMedia("(max-width: 899px)").matches;
    const min = +(narrow ? options["sp-min"] ?? 0.15 : options.min ?? 1.5);
    const max = +(narrow ? options["sp-max"] ?? 1.3 : options.max ?? 3.5);
    const step = 1 / (+options.fps || 45);
    const saved = targets.map((t) => [t, t.innerHTML]);
    const chars = [];
    const ac = new AbortController();
    targets.forEach((t) => {
      const text = t.textContent;
      t.textContent = "";
      text.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { t.append(word); return; }
        const w = document.createElement("span");
        w.className = "fx-pgb__word";
        [...word].forEach((c) => {
          const ch = document.createElement("span"), b = document.createElement("b"), i = document.createElement("i");
          ch.className = "fx-pgb__ch";
          b.textContent = c; i.textContent = c;
          i.setAttribute("aria-hidden", "true");
          ch.append(b, i);
          w.append(ch);
          chars.push(ch);
          if (hover && !reduce) ch.addEventListener("mouseenter", () => flick(ch), { signal: ac.signal });
        });
        t.append(w);
      });
    });
    const calls = [];
    const flick = (ch) => {
      const b = ch.firstChild.style, i = ch.lastChild.style;
      let t = 0;
      for (let k = 0, n = 2 + Math.floor(Math.random() * 5); k < n; k++) {
        calls.push(gsap.delayedCall(t, () => { b.visibility = "hidden"; i.visibility = "visible"; }));
        t += step;
        calls.push(gsap.delayedCall(t, () => { b.visibility = "visible"; i.visibility = "hidden"; }));
        t += step;
      }
    };
    let loopCall = null;
    const loop = () => {
      flick(chars[Math.floor(Math.random() * chars.length)]);
      loopCall = gsap.delayedCall(min + Math.random() * (max - min), loop);
    };
    if (!reduce && chars.length) loop();
    return () => {
      ac.abort();
      loopCall?.kill();
      calls.forEach((c) => c.kill());
      saved.forEach(([t, html]) => { t.innerHTML = html; });
    };
  });
})();
