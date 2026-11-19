(() => {
  // While scrolling down a long section, a text panel pinned to the screen swaps blocks in turn — one section-height step per block (default 160vh), with one empty step before.
  // Words in a block start at 12% of the cell, each word .04 later (or .4 divided by the word count if the block has many), and settle over .032 of the cell from 5px blur and ±7px offset,
  // [data-fx-part=/  flicker] word lights up to .28, drops to .05, then fills back up. At 78~88% of the cell, each line blurs out to 9px, .014 later per line.
  kfFx.register("word-flicker-scrub", (el, { options, reduce, hover, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const blocksEl = [...el.querySelectorAll('[data-fx-part="block"]')];
    if (!blocksEl.length || !window.gsap || !window.ScrollTrigger) return;
    const num = (k, d) => +(options[k] ?? d);
    const C = { lead: num("lead", 1), from: num("from", 0.12), step: num("step", 0.04), span: num("span", 0.4), ramp: num("ramp", 0.032), exitFrom: num("exit-from", 0.78), exitTo: num("exit-to", 0.88), lag: num("lag", 0.014), jitter: num("jitter", 7), blurIn: num("blur", 5), blurOut: num("blur-out", 9) };
    const blockVh = num("block-vh", 160), blockVhTouch = num("block-vh-touch", 240);
    const slots = blocksEl.length + C.lead;
    const saved = { height: el.style.height, stage: stage.getAttribute("style") || "" };
    const made = [];
    // Wrap words in chunks (spaces between left as is) — words already wrapped ([data-fx-part=word]·flicker) are used as is
    const blocks = blocksEl.map((b, bi) => {
      const words = [];
      const walk = (node, line) => {
        for (const ch of [...node.childNodes]) {
          if (ch.nodeType === 3) {
            const parts = ch.textContent.split(/(\s+)/);
            if (parts.every((p) => !p.trim())) continue;
            const frag = document.createDocumentFragment();
            for (const p of parts) {
              if (!p) continue;
              if (!p.trim()) { frag.append(p); continue; }
              const s = document.createElement("span");
              s.setAttribute("data-fx-part", "word"); s.textContent = p; frag.append(s); made.push(s);
            }
            ch.replaceWith(frag);
          } else if (ch.nodeType === 1 && !ch.matches('[data-fx-part="word"], [data-fx-part="flicker"]')) walk(ch, line);
        }
      };
      const lines = [...b.children].filter((c) => c.matches("p, [data-fx-part=line]"));
      (lines.length ? lines : [b]).forEach((ln, li) => {
        walk(ln, li);
        ln.querySelectorAll('[data-fx-part="word"], [data-fx-part="flicker"]').forEach((w) => {
          const n = words.length, a = 43758.5453 * Math.sin(12.9898 * (131 * bi + 7.3 * n)), c = 12345.6789 * Math.sin(78.233 * (131 * bi + 7.3 * n));
          words.push({ el: w, i: n, line: li, flicker: w.matches('[data-fx-part="flicker"]'), dx: (2 * (a - Math.floor(a)) - 1) * C.jitter, dy: (2 * (c - Math.floor(c)) - 1) * C.jitter });
        });
      });
      const step = words.length > 1 ? Math.min(C.step, C.span / (words.length - 1)) : C.step;
      return { el: b, words, step, shown: null };
    });
    const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
    const paint = (p) => {
      const t = clamp(p) * slots - C.lead;
      blocks.forEach((b, bi) => {
        const u = t - bi, on = u > C.from - 0.05 && u < C.exitTo + 0.08;
        if (on !== b.shown) { b.el.style.visibility = on ? "visible" : "hidden"; b.shown = on; }
        if (!on) return;
        for (const w of b.words) {
          const s = clamp((u - (C.from + w.i * b.step)) / C.ramp), arrive = s * s * (3 - 2 * s);
          let alpha = arrive;
          if (w.flicker && s < 1) alpha = s < 0.3 ? (s / 0.3) * 0.28 : s < 0.44 ? 0.28 + (0.05 - 0.28) * ((s - 0.3) / 0.14) : sstep(0.44, 1, s);
          const exit = sstep(C.exitFrom + w.line * C.lag, C.exitTo + w.line * C.lag, u), left = 1 - arrive;
          w.el.style.opacity = (alpha * (1 - exit)).toFixed(3);
          w.el.style.transform = left > 0.001 ? `translate3d(${(w.dx * left).toFixed(2)}px, ${(w.dy * left).toFixed(2)}px, 0)` : "none";
          if (hover) { const bl = C.blurIn * left + C.blurOut * exit; w.el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : "none"; }
        }
      });
    };
    if (reduce) {
      el.classList.add("fx-word-flicker-scrub--still");
      blocks.forEach((b) => { b.el.style.visibility = "visible"; b.words.forEach((w) => { w.el.style.opacity = "1"; }); });
      return () => { el.classList.remove("fx-word-flicker-scrub--still"); blocks.forEach((b) => { b.el.style.visibility = ""; b.words.forEach((w) => { w.el.style.opacity = ""; }); }); };
    }
    const touch = !hover;
    el.style.height = options.height === "keep" ? saved.height : `calc(${slots} * ${touch ? blockVhTouch : blockVh}vh + 100vh)`;
    paint(0);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom bottom", onUpdate: (self) => paint(self.progress) });
    ScrollTrigger.refresh();
    paint(st.progress);
    return () => {
      st.kill();
      el.style.height = saved.height;
      blocks.forEach((b) => { b.el.style.visibility = ""; b.words.forEach((w) => { w.el.style.opacity = ""; w.el.style.transform = ""; w.el.style.filter = ""; }); });
      made.forEach((s) => s.replaceWith(document.createTextNode(s.textContent)));
    };
  });
})();
