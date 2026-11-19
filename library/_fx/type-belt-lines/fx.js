// Quote line (data-fx-part="line") types out one character at a time — .05s gaps on wide screens, .03s on narrow, each line starts later by the previous line’s character count, and
// A caret sticks to the head of a line and follows it, then leaves when that line ends (the last line keeps it, blinking at 1s). .2s before the last character, is-complete is added to the element and fx:done fires.
// fit: bytes — set the line font size by dividing by the byte count of the longest line (Latin 2 · others 3) — the longest line always fills the same width.
(() => {
  kfFx.register("type-belt-lines", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) return;
    const narrow = +options.narrow || 1024;
    const each = () => (innerWidth > narrow ? +(options.each ?? 0.05) : +(options["each-m"] ?? 0.03));
    const fit = options.fit === "bytes";
    const k = +(options.k ?? 200), kM = +(options["k-m"] ?? 300), max = +options.max || 1800;
    const start = options.start || "load", delay = +(options.delay ?? 0);
    const texts = lines.map((l) => l.textContent.trim());
    const bytes = (s) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) <= 2047 ? 2 : 3), 0);
    const most = Math.max(...texts.map(bytes));
    const ac = new AbortController(), signal = ac.signal;
    const calls = [];

    const size = () => {
      if (!fit) return;
      const ratio = Math.min(innerWidth, max) / innerWidth;
      const kk = innerWidth > narrow ? k : kM;
      lines.forEach((l) => (l.style.fontSize = `${(kk * ratio) / most}vw`));
    };
    size();
    if (fit) addEventListener("resize", size, { signal });

    const finish = () => {
      el.classList.add("is-complete");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    const slots = lines.map((l) => {
      const text = document.createElement("span");
      text.className = "fx-type__in";
      const caret = document.createElement("span");
      caret.className = "fx-type__caret";
      caret.setAttribute("aria-hidden", "true");
      l.setAttribute("aria-label", l.textContent.trim());
      l.textContent = "";
      return { l, text, caret };
    });

    if (reduce) {
      slots.forEach((s, i) => { s.text.textContent = texts[i]; s.l.append(s.text); });
      slots.at(-1).l.append(slots.at(-1).caret);
      finish();
      return () => { ac.abort(); lines.forEach((l, i) => { l.textContent = texts[i]; l.style.fontSize = ""; l.removeAttribute("aria-label"); }); el.classList.remove("is-complete"); };
    }

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      const step = each();
      let before = 0;
      slots.forEach((s, i) => {
        const chars = [...texts[i]];
        const lineDelay = before;
        before += chars.length * step;
        const extra = +(lines[i].dataset.delay ?? 0.5);
        calls.push(gsap.delayedCall(extra, () => {
          calls.push(gsap.delayedCall(lineDelay, () => s.l.append(s.text, s.caret)));
          chars.forEach((ch, j) => calls.push(gsap.delayedCall(j * step + lineDelay, () => s.text.append(ch))));
          const end = chars.length * step + lineDelay;
          calls.push(i < slots.length - 1 ? gsap.delayedCall(end, () => s.caret.remove()) : gsap.delayedCall(Math.max(0, end - 0.2), finish));
        }));
      });
    };
    if (start === "event") el.addEventListener("fx:play", play, { signal });
    else calls.push(gsap.delayedCall(delay, play));

    return () => {
      ac.abort();
      calls.forEach((c) => c.kill());
      lines.forEach((l, i) => { l.textContent = texts[i]; l.style.fontSize = ""; l.removeAttribute("aria-label"); });
      el.classList.remove("is-complete");
    };
  });
})();
