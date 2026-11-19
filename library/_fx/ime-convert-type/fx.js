(() => {
  // Break a Korean syllable down into the composition state of each keystroke — 「여기」 goes ㅇ → 여 → 역 → 여기 (exactly the input method’s shape where the final consonant passes to the next vowel)
  const L = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  const T = ["", "giyeok", "ssang-giyeok", "giyeok-siot", "nieun", "nieun-jieut", "nieun-hieut", "digeut", "rieul", "rieul-giyeok", "rieul-mieum", "rieul-bieup", "rieul-siot", "rieul-tieut", "rieul-pieup", "rieul-hieut", "mieum", "bieup", "bieup-siot", "siot", "ssang-siot", "ieung", "jieut", "chieut", "kieuk", "tieut", "pieup", "hieut"];
  const syl = (l, v, t = 0) => String.fromCharCode(0xac00 + (l * 21 + v) * 28 + t);
  const split = (ch) => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return null;
    return { l: Math.floor(c / 588), v: Math.floor((c % 588) / 28), t: c % 28 };
  };
  const keys = (word) => {
    const out = [];
    let done = "";
    const chars = Array.from(word);
    chars.forEach((ch, i) => {
      const s = split(ch);
      if (!s) { out.push(done + ch); done += ch; return; }
      const prev = i > 0 ? split(chars[i - 1]) : null;
      const asFinal = T.indexOf(L[s.l]);
      // If the previous syllable has no final consonant and this initial can be a final, it looks attached as the previous syllable’s final until the vowel is typed
      if (prev && prev.t === 0 && asFinal > 0) out.push(done.slice(0, -1) + syl(prev.l, prev.v, asFinal));
      else out.push(done + L[s.l]);
      out.push(done + syl(s.l, s.v));
      if (s.t) out.push(done + syl(s.l, s.v, s.t));
      done += ch;
    });
    return out;
  };
  const hangul = (w) => /[가-힣]/.test(w);

  // One word = Reading (typed-character states) + conversion (final text). Writing ”final|reading” types the reading one character at a time, then switches to the final text
  const tokensOf = (text) => text.split(/(\s+)/).filter((w) => w.length).map((w) => {
    if (/^\s+$/.test(w)) return { states: [w], final: w, convert: false };
    const bar = w.indexOf("|");
    if (bar > 0) {
      const fin = w.slice(0, bar), read = w.slice(bar + 1);
      return { states: Array.from(read).map((_, i) => read.slice(0, i + 1)), final: fin, convert: true };
    }
    if (hangul(w)) return { states: keys(w), final: w, convert: Array.from(w).length > 1 };
    return { states: Array.from(w).map((_, i) => w.slice(0, i + 1)), final: w, convert: false };
  });

  const POST = 0.025, FLASH = 0.075;

  kfFx.register("ime-convert-type", (el, { options, reduce }) => {
    const lines = el.querySelectorAll('[data-fx-part="line"]').length ? [...el.querySelectorAll('[data-fx-part="line"]')] : [el];
    const made = lines.map((line) => {
      const text = (line.getAttribute("data-text") || line.textContent || "").trim();
      if (!text) return null;
      const finalText = text.replace(/(\S+?)\|\S+/g, "$1");
      return { line, text, finalText, html: line.innerHTML, label: line.getAttribute("aria-label") };
    }).filter(Boolean);
    if (!made.length || reduce) return;

    const charS = +(options.char ?? 29) / 1000;
    const convS = +(options.convert ?? 20) / 1000;
    const mode = options.mode || "stagger";
    const staggerS = +(options.stagger ?? 55) / 1000;
    const delayS = +(options.delay ?? 0) / 1000;
    const on = options.on || "view";

    for (const m of made) {
      const stack = document.createElement("span");
      const out = document.createElement("span");
      stack.className = "fx-ime__stack";
      stack.setAttribute("data-final", m.finalText);
      stack.setAttribute("aria-hidden", "true");
      out.className = "fx-ime__out";
      stack.append(out);
      m.line.replaceChildren(stack);
      if (m.label === null) m.line.setAttribute("aria-label", m.finalText);
      m.line.dataset.imeState = "pending";
      m.out = out;
    }

    const tl = gsap.timeline({ paused: true, onComplete: () => el.dispatchEvent(new CustomEvent("fx:typed")) });
    let serialAt = 0, end = 0;
    made.forEach((m, i) => {
      const at0 = mode === "serial" ? serialAt : mode === "stagger" ? i * staggerS : 0;
      let at = 0, shown = "";
      tl.call(() => { m.line.dataset.imeState = "playing"; }, [], at0);
      for (const tok of tokensOf(m.text)) {
        for (const s of tok.states) {
          const txt = shown + s;
          tl.call(() => { m.out.textContent = txt; }, [], at0 + at);
          at += charS;
        }
        shown += tok.final;
        if (tok.convert) {
          at += convS;
          const txt = shown;
          tl.call(() => {
            m.out.textContent = txt;
            gsap.fromTo(m.out, { autoAlpha: 0.58, filter: "blur(1.2px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: FLASH, ease: "power2.out", overwrite: true });
          }, [], at0 + at);
          at += POST;
        }
      }
      tl.call(() => { m.out.textContent = m.finalText; m.line.dataset.imeState = "complete"; }, [], at0 + at);
      if (mode === "serial") serialAt += at + POST;
      end = Math.max(end, at0 + at);
    });
    tl.to({}, { duration: 0.001 }, end);

    let started = false, dc, st;
    const play = () => {
      if (started) return;
      started = true;
      dc = gsap.delayedCall(delayS, () => tl.play(0));
    };
    const replay = () => { started = false; dc?.kill(); tl.pause(0); play(); };
    if (on === "load") play();
    else if (on === "view" && window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, start: options.start || "top 78%", once: true, onEnter: play });
    else if (on === "view") play();
    el.addEventListener("fx:play", replay);

    return () => {
      el.removeEventListener("fx:play", replay);
      st?.kill(); dc?.kill(); tl.kill();
      for (const m of made) {
        gsap.killTweensOf(m.out);
        m.line.innerHTML = m.html;
        delete m.line.dataset.imeState;
        if (m.label === null) m.line.removeAttribute("aria-label");
      }
    };
  });
})();
