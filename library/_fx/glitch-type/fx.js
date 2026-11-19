// Radio message typewriter — splits text into letters inside word chunks and turns them on at cps characters per second. Pauses longer after punctuation (. ! ? .28 · , .1 · ; : .12 · — .14, line break .32),
// For the first two slots not yet lit, a symbol every 55ms (!<>-_\/[]{}=+*^?#%&$@01) flow past so it looks like a signal is being locked in. Lit letters settle from bright light to their own color in .45s,
// After the last letter, the square cursor blinks at 1.05s once typing is done. Pressing (or fx:finish) stamps the remaining text all at once
(() => {
  const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@01";
  const PAUSE = { ".": 0.28, "!": 0.28, "?": 0.28, ",": 0.1, ";": 0.12, ":": 0.12, "—": 0.14, "。": 0.28, "、": 0.1 };

  kfFx.register("glitch-type", (el, { options, reduce }) => {
    // Line breaks follow the source <br> only — line breaks and spaces in html indentation collapse into a single space
    const copy = el.cloneNode(true);
    const BR = String.fromCharCode(30);
    copy.querySelectorAll("br").forEach((b) => b.replaceWith(BR));
    const text = copy.textContent.replace(/[ \t\r\n\f]+/g, " ").split(BR).map((l) => l.trim()).join("\n").trim();
    if (!text) return;
    const was = el.innerHTML;
    const n = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const cps = n("cps", 40) || 40, delay = n("delay", 0), ahead = Math.max(0, Math.round(n("ahead", 2))), tick = n("tick", 55) || 55, br = n("br", 0.32);
    const on = options.on || "load";

    el.textContent = "";
    el.classList.add("fx-gt");
    const reader = document.createElement("span");
    reader.className = "fx-gt-reader";
    reader.textContent = text;
    el.append(reader);
    const chars = [];
    let at = 0;
    text.split("\n").forEach((line, li) => {
      if (li) { el.append(document.createElement("br")); at += br; }
      line.split(" ").forEach((word, wi) => {
        if (wi) { el.append(" "); at += 1 / cps; }
        if (!word) return;
        const w = document.createElement("span");
        w.className = "fx-gt-word";
        w.setAttribute("aria-hidden", "true");
        const list = [...word];
        list.forEach((ch, i) => {
          const s = document.createElement("span");
          s.className = "fx-gt-ch";
          s.textContent = ch;
          w.append(s);
          chars.push({ s, at });
          // Periods within decimals and numbers (3.14) don’t pause
          const joined = i < list.length - 1 && /[.\d]/.test(list[i + 1]);
          at += 1 / cps + (joined ? 0 : PAUSE[ch] || 0);
        });
        el.append(w);
      });
    });

    let next = 0, raf = 0, t0 = 0, last = 0, done = false, started = false, caret = null, mo = null;
    const glitched = new Set();
    const setCaret = (s) => { caret?.classList.remove("is-caret"); caret = s; caret?.classList.add("is-caret"); };
    const clearGlitch = () => { glitched.forEach((s) => s.classList.remove("is-glitch")); glitched.clear(); };
    const light = (i) => { const { s } = chars[i]; s.classList.remove("is-glitch"); glitched.delete(s); s.classList.add("is-on"); };
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      clearGlitch();
      while (next < chars.length) light(next++);
      setCaret(chars.at(-1)?.s || null);
      el.classList.add("is-fx-typed");
      el.dispatchEvent(new CustomEvent("fx:typed", { bubbles: true }));
    };
    const frame = (now) => {
      raf = 0;
      const t = (now - t0) / 1000;
      const from = next;
      while (next < chars.length && chars[next].at <= t) light(next++);
      if (next > from) setCaret(chars[next - 1].s);
      if (next >= chars.length) { finish(); return; }
      if (now - last >= tick) {
        last = now;
        clearGlitch();
        for (let i = next; i < Math.min(chars.length, next + ahead); i++) {
          const { s } = chars[i];
          s.dataset.g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          s.classList.add("is-glitch");
          glitched.add(s);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (started) return;
      started = true;
      if (reduce) { el.classList.add("is-fx-instant"); finish(); return; }
      t0 = performance.now() + delay * 1000;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const skip = () => { if (!started) return; el.classList.add("is-fx-instant"); finish(); };
    const onClick = () => { if (started && !done) skip(); };
    el.addEventListener("fx:play", start);
    el.addEventListener("fx:finish", skip);
    el.addEventListener("click", onClick);

    if (on === "state") {
      // State type: applies when the element gets is-in, after the dialog opens
      const check = () => { if (el.classList.contains("is-in") || el.closest(".is-in")) start(); };
      mo = new MutationObserver(check);
      for (let p = el; p && p !== document.body; p = p.parentElement) mo.observe(p, { attributes: true, attributeFilter: ["class"] });
      check();
    } else if (on !== "event") start();

    return () => {
      cancelAnimationFrame(raf);
      mo?.disconnect();
      el.removeEventListener("fx:play", start);
      el.removeEventListener("fx:finish", skip);
      el.removeEventListener("click", onClick);
      el.classList.remove("fx-gt", "is-fx-typed", "is-fx-instant");
      el.innerHTML = was;
    };
  });
})();
