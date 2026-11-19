// Each letter sits on a faint accent color, and as scroll progresses a 7-letter wide wave front passes and turns each letter into its own text color —
// Letters near the leading edge rise slightly, tilt, and glow with blur. Progress is rounded per letter so only changed letters are touched (original Brand ”Even over ons”)
(() => {
  const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const css = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(3)})`;
  kfFx.register("char-wave-ink", (el, { options, reduce, scroller }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text || !text.textContent.trim() || !window.gsap || !window.SplitText) return;
    gsap.registerPlugin(SplitText);
    const n = (k, d) => +(options[k] ?? d);
    const from = n("from", 0.02), span = n("span", 0.6) || 0.6, tagFrom = n("tags-from", 0.66), tagSpan = n("tags-span", 0.24) || 0.24;
    const W = n("width", 7) || 7, lift = n("lift", 0.07), tilt = n("tilt", 3.6), grow = n("grow", 0.12), glow = n("glow", 14), fade = n("fade", 0.45);
    const tags = [...el.querySelectorAll('[data-fx-part="tag"]')];
    let split = null, chars = [], live = true, raf = 0, last = -1, acc = [255, 85, 0], ink = [11, 20, 35];
    const clamp = (x) => Math.min(1, Math.max(0, x));
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    const progress = () => {
      const r = el.getBoundingClientRect(), v = view(), h = r.height - v.height;
      return h > 0 ? clamp(-(r.top - v.top) / h) : clamp((v.height - (r.top - v.top)) / (v.height + r.height));
    };
    function paint() {
      raf = 0;
      if (!live || !chars.length) return;
      const p = reduce ? 1 : progress(), N = chars.length;
      const e = clamp((p - from) / span), t = clamp((p - tagFrom) / tagSpan);
      const front = reduce ? N + 21 : e * (N + 2 * W);
      const key = front + 1000 * t;
      if (Math.abs(key - last) < 0.05) return;
      last = key;
      for (let o = 0; o < N; o++) {
        const c = chars[o], l = front - o;
        const u = l <= -W ? -2 * W : l >= W ? 2 * W : Math.round((l / W) * 2 * W);
        if (c._q === u) continue;
        c._q = u;
        if (u >= 2 * W) { c.style.color = ""; c.style.transform = ""; c.style.textShadow = ""; continue; }
        const m = u / (2 * W);
        let y, col;
        if (m < 0) { y = 1 + m; col = css(acc, fade + (1 - fade) * y); }
        else { y = 1 - m; const k = y * y; col = css(ink.map((v, i) => v + (acc[i] - v) * k), 1); }
        c.style.color = col;
        if (y <= 0.02) { c.style.transform = ""; c.style.textShadow = ""; continue; }
        const f = Math.sin((y * Math.PI) / 2), px = (0.6 * f).toFixed(2);
        c.style.transform = `translateY(${(-lift * f).toFixed(3)}em) rotate(${(tilt * c._rnd * f).toFixed(2)}deg) scale(${(1 + grow * f).toFixed(3)})`;
        c.style.textShadow = `${px}px ${px}px 0 ${col},-${px}px 0 0 ${col},0 0 ${(glow * f).toFixed(1)}px ${css(acc, 0.35 * f)}`;
      }
      const on = reduce ? tags.length : Math.ceil(t * tags.length - 0.001);
      tags.forEach((g, i) => g.classList.toggle("is-on", i < on));
    }
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      if (!live) return;
      split = SplitText.create(text, { type: "words,chars", wordsClass: "fx-cw-w", charsClass: "fx-cw-c" });
      chars = split.chars;
      ink = rgb(getComputedStyle(text).color);
      const probe = document.createElement("i");
      probe.style.color = "var(--kf-accent)";
      el.append(probe);
      acc = rgb(getComputedStyle(probe).color);
      probe.remove();
      chars.forEach((c, i) => { const r = 43758.5453 * Math.sin(12.9898 * i + 78.233); c._rnd = 2 * (r - Math.floor(r)) - 1; });
      paint();
    });
    const src = scroller || window;
    src.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      src.removeEventListener("scroll", ask);
      removeEventListener("resize", ask);
      split && split.revert();
      tags.forEach((g) => g.classList.remove("is-on"));
    };
  });
})();
