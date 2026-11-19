(() => {
  // Split the title into letters (words kept as one chunk, spaces between left as is) to resolve from blur and transparency, and after fully resolved rest for rest seconds then
  // A blur wave passes each line, delayed by step seconds starting from the leftmost letter (each letter takes letter seconds: it blurs over the first 28% with sine.in and clears over the remaining 72% with power1.out).
  // One wave cycle takes loop seconds — pauses when offscreen
  kfFx.register("blur-wave-title", (el, { options, reduce, scroller }) => {
    if (!el.textContent.trim()) return;
    gsap.registerPlugin(ScrollTrigger);
    const blurIn = +(options["blur-in"] ?? 20), dur = +(options.dur ?? 0.8), each = +(options.each ?? 0.02), delay = +(options.delay ?? 0);
    const wave = +(options.blur ?? 5), letter = +(options.letter ?? 2.1), step = +(options.step ?? 0.12), loop = +(options.loop ?? 5), rest = +(options.rest ?? 3);
    const keep = el.innerHTML;
    // With line children, per line, otherwise as one whole line
    const lines = el.querySelectorAll('[data-fx-part="line"]').length ? [...el.querySelectorAll('[data-fx-part="line"]')] : [el];
    const rows = lines.map((line) => {
      const chars = [];
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((w) => {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.append(w); return; }
              const word = document.createElement("span");
              word.className = "fx-blur-wave-title__word";
              [...w].forEach((c) => { const s = document.createElement("span"); s.className = "fx-blur-wave-title__char"; s.textContent = c; word.append(s); chars.push(s); });
              frag.append(word);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.getAttribute("data-fx-part") !== "line") walk(n);
        });
      };
      walk(line);
      return chars;
    }).filter((r) => r.length);
    const all = rows.flat();
    if (!all.length) return;
    if (reduce) return () => { el.innerHTML = keep; };
    let tl = null, waveTl = null, waveDelay = null, seen = true, revealed = false;
    gsap.set(all, { opacity: 0, "--fx-b": blurIn });
    const startWave = () => {
      if (!revealed || !seen || waveTl) return;
      const longest = Math.max(...rows.map((r) => r.length));
      waveTl = gsap.timeline({ repeat: -1 });
      rows.forEach((r) => r.forEach((c, i) => {
        const at = i * step;
        waveTl.to(c, { "--fx-b": wave, duration: letter * 0.28, ease: "sine.in" }, at).to(c, { "--fx-b": 0, duration: letter * 0.72, ease: "power1.out" }, at + letter * 0.28);
      }));
      const used = Math.max(longest - 1, 0) * step + letter;
      waveTl.to({}, { duration: Math.max(0.4, loop - used) });
    };
    const stopWave = () => { waveDelay?.kill(); waveDelay = null; waveTl?.kill(); waveTl = null; gsap.set(all, { "--fx-b": 0 }); };
    const play = () => {
      tl = gsap.to(all, { opacity: 1, "--fx-b": 0, duration: dur, stagger: each, delay, ease: "power2.out", onComplete: () => { revealed = true; waveDelay = gsap.delayedCall(rest, startWave); } });
    };
    const st = options.on === "load" ? null : ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", once: true, onEnter: play });
    if (!st) play();
    const view = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top",
      onToggle: (s) => { seen = s.isActive; if (seen) { if (revealed && !waveDelay?.isActive()) startWave(); } else stopWave(); },
    });
    return () => { st?.kill(); view.kill(); tl?.kill(); stopWave(); el.innerHTML = keep; };
  });
})();
