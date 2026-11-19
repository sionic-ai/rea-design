// Each letter gets two inversion slots (one inverting the background color over the letter’s place, one carrying a symbol) laid on, and when the hand enters, the slots shrink horizontally from the first letter and vanish, and the real letter resolves again
(() => {
  const SIGNS = "##·$%&/=€|()@+09*+]}{[";
  // So the same symbol appears at each letter spot — if it changed on every open it would not be the original’s always-the-same flicker
  const sign = (key) => { let h = 0x811c9dc5; for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 0x1000193); } return SIGNS[(h >>> 0) % SIGNS.length]; };
  kfFx.register("char-flash-hover", (el, { options, reduce }) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text || !window.gsap) return;
    const step = +(options.step ?? 0.05), each = +(options.each ?? 0.4), flash = +(options.flash ?? 0.16), gap = +(options.gap ?? 0.016);
    const count = Math.max(1, Math.round(+options.count || 2));
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const keep = el.innerHTML;
    el.setAttribute("aria-label", text);
    el.innerHTML = "";
    text.split(" ").forEach((w, wi) => {
      if (wi) el.append(" ");
      const word = document.createElement("span");
      word.className = "fx-cf-word"; word.setAttribute("aria-hidden", "true");
      [...w].forEach((ch, ci) => {
        const c = document.createElement("span"); c.className = "fx-cf-char";
        for (let k = 0; k < count; k++) { const f = document.createElement("span"); f.className = "fx-cf-flash"; f.textContent = sign(`${text}:${wi}:${ci}:${k}`); c.append(f); }
        const n = document.createElement("span"); n.className = "fx-cf-glyph"; n.textContent = ch; c.append(n);
        word.append(c);
      });
      el.append(word);
    });
    if (reduce) return () => { el.innerHTML = keep; el.removeAttribute("aria-label"); };
    const tl = gsap.timeline({ paused: true });
    el.querySelectorAll(".fx-cf-char").forEach((c, i) => {
      const at = step * i;
      tl.fromTo(c.querySelector(".fx-cf-glyph"), { opacity: 0 }, { opacity: 1, duration: each, ease, immediateRender: false }, at);
      c.querySelectorAll(".fx-cf-flash").forEach((f, k) => tl.fromTo(f, { scaleX: 1, opacity: 1 }, { scaleX: 0, opacity: 0, duration: flash, ease, immediateRender: false }, at + (k + 1) * gap));
    });
    const go = () => tl.restart();
    el.addEventListener("pointerenter", go);
    el.addEventListener("focusin", go);
    return () => {
      el.removeEventListener("pointerenter", go);
      el.removeEventListener("focusin", go);
      tl.kill();
      el.innerHTML = keep;
      el.removeAttribute("aria-label");
    };
  });
})();
