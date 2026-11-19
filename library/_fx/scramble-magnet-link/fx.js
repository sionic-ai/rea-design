// Hovering a menu link scrambles its text into rune characters, then it locks into another word (to) one character at a time from the front, and the whole link is pulled toward the cursor.
// Shuffled letters use a fixed cell width so the line doesn’t wobble when word length changes — on leaving, it locks back to the original word and bounces back into place
(() => {
  const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
  kfFx.register("scramble-magnet-link", (el, { options, reduce, hover }) => {
    const base = el.textContent.trim();
    if (!base) return;
    const chars = options.chars || RUNES;
    const ms = +(options.ms ?? 700), lead = +(options.lead ?? 80), magnet = +(options.magnet ?? 0.35);
    const to = options.to || base;
    const html = el.innerHTML;
    el.setAttribute("aria-label", base);
    const box = document.createElement("span");
    box.setAttribute("aria-hidden", "true");
    el.innerHTML = "";
    el.append(box);
    let raf = 0, cells = [];
    const pick = () => chars[Math.floor(Math.random() * chars.length)];
    // Words are inline-block chunks with the spaces between left as is — a multi-line Korean heading doesn’t break mid-word
    const lay = (text) => {
      box.textContent = "";
      cells = [];
      text.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { box.append(w); return; }
        const word = document.createElement("span");
        word.style.display = "inline-block";
        word.style.whiteSpace = "nowrap";
        [...w].forEach((ch) => {
          const c = document.createElement("span");
          c.dataset.fxPart = "char";
          c.textContent = ch;
          word.append(c);
          cells.push({ el: c, final: ch });
        });
        box.append(word);
      });
    };
    // When each letter locks in = lead + each item’s share × (ms − 120), from the original ScrambleLink. Scrambled characters change every two frames
    const run = (text) => {
      cancelAnimationFrame(raf);
      lay(text);
      if (reduce) return;
      const span = Math.max(0, ms - 120), n = Math.max(1, cells.length - 1), t0 = performance.now();
      cells.forEach((c, i) => { c.at = lead + (i / n) * span; c.el.textContent = pick(); c.el.classList.add("is-mixed"); });
      let frame = 0;
      const tick = () => {
        frame++;
        const t = performance.now() - t0;
        let left = false;
        for (const c of cells) {
          if (!c.el.classList.contains("is-mixed")) continue;
          if (t >= c.at) { c.el.textContent = c.final; c.el.classList.remove("is-mixed"); }
          else { left = true; if (frame % 2 === 0) c.el.textContent = pick(); }
        }
        if (left) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    lay(base);
    if (!hover) return () => { el.innerHTML = html; el.removeAttribute("aria-label"); };
    let rect = null;
    const enter = () => { rect = el.getBoundingClientRect(); el.classList.add("is-magnetic"); run(to); };
    const move = (e) => {
      if (reduce || !magnet) return;
      const r = rect || el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * magnet}px, ${(e.clientY - (r.top + r.height / 2)) * magnet}px)`;
    };
    const leave = () => { rect = null; el.classList.remove("is-magnetic"); el.style.transform = ""; if (to !== base) run(base); else { cancelAnimationFrame(raf); lay(base); } };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("is-magnetic");
      el.style.transform = "";
      el.innerHTML = html;
      el.removeAttribute("aria-label");
    };
  });
})();
