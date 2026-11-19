// Letter reel — each cell holds two copies of the letter stacked vertically, and when the text changes each cell rolls 3±1 turns and lands on the new letter (1.6s expo.out).
// Each cell starts .2s + row index × .08s + random order × .04s late, so they snap into place out of step like a slot machine. During rest, every idle seconds it rolls once more with the same text.
(() => {
  const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  kfFx.register("char-reel-swap", (el, { options, reduce }) => {
    const first = el.textContent.trim();
    if (!first) return;
    const dur = +(options.dur ?? 1.6), turns = +(options.turns ?? 3), each = +(options.each ?? 0.04);
    const delay = +(options.delay ?? 0.2), line = +(options.line ?? 0) * +(options.gap ?? 0.08), idle = +(options.idle ?? 0);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const html = el.innerHTML;
    const sr = document.createElement("span");
    sr.dataset.fxPart = "sr";
    let cells = [], text = first, tl = null, timer = 0;
    const cell = (ch) => {
      const c = document.createElement("span");
      c.dataset.fxPart = "cell";
      c.setAttribute("aria-hidden", "true");
      const a = document.createElement("span"), b = document.createElement("span");
      a.textContent = ch; b.textContent = ch;
      c.append(a, b);
      return c;
    };
    // Words are grouped as a single chunk and spaces kept as is — lines never break in the middle of a word
    const build = (t) => {
      el.textContent = "";
      sr.textContent = t;
      el.append(sr);
      cells = [];
      t.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { el.append(w); return; }
        const word = document.createElement("span");
        word.dataset.fxPart = "word";
        [...w].forEach((ch) => { const c = cell(ch); word.append(c); cells.push(c); });
        el.append(word);
      });
    };
    build(first);
    const roll = (next) => {
      tl?.kill();
      if (next !== text) build(next);
      text = next;
      if (reduce) return;
      const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
      tl = gsap.timeline();
      cells.forEach((c, i) => {
        const [a, b] = c.children, target = a.textContent;
        const n = Math.max(1, Math.round(turns + (Math.random() * 2 - 1)));
        const seq = Array.from({ length: n }, () => POOL[Math.floor(Math.random() * POOL.length)]);
        seq[n - 1] = target;
        const st = { r: 0 };
        let shown = -1;
        a.textContent = POOL[Math.floor(Math.random() * POOL.length)];
        tl.to(st, {
          r: n, duration: dur, ease, delay: delay + line + order[i] * each,
          onUpdate: () => {
            const k = Math.floor(st.r);
            if (k !== shown) { shown = k; a.textContent = k === 0 ? a.textContent : seq[k - 1]; b.textContent = seq[Math.min(k, n - 1)]; }
            c.style.setProperty("--r", String(st.r - k));
          },
          onComplete: () => { a.textContent = target; b.textContent = target; c.style.setProperty("--r", "0"); },
        }, 0);
      });
    };
    const onText = (e) => { if (typeof e.detail === "string") roll(e.detail); };
    el.addEventListener("fx:text", onText);
    if (idle > 0 && !reduce) timer = setInterval(() => { if (!tl || !tl.isActive()) roll(text); }, idle * 1000);
    return () => {
      tl?.kill();
      clearInterval(timer);
      el.removeEventListener("fx:text", onText);
      el.innerHTML = html;
    };
  });
})();
