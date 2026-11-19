// Split text into words and letters and switch each letter on and off in random order (.15s, overall spread .3s) — on-screen text forms and scatters like pixels.
// Re-split each time it turns on and restore when all are off (original PixelText). With flicker, on hover each letter turns off for .07s and back on .14s later over .07s (random start 0~.32s)
(() => {
  kfFx.register("pixel-chars", (el, { options, reduce, hover }) => {
    if (!window.gsap || !window.SplitText) return;
    const dur = +(options.dur ?? 0.15), amount = +(options.amount ?? 0.3), delay = +(options.delay ?? 0);
    const mode = options.show || "load";
    let split = null, tw = null, flick = null, shown = null, timer = 0;
    const make = () => { split?.revert(); split = SplitText.create(el, { type: "words,chars", charsClass: "char", wordsClass: "word" }); return split; };
    const set = (on) => {
      if (on === shown) return;
      const first = shown === null;
      shown = on;
      tw?.kill(); flick?.kill(); flick = null;
      if (first && on && mode !== "load") { el.style.opacity = "1"; make(); return; }
      if (reduce) { split?.revert(); split = null; el.style.opacity = on ? "1" : "0"; return; }
      el.style.opacity = "1";
      const s = make();
      if (!s.chars.length) { el.style.opacity = on ? "1" : "0"; return; }
      gsap.set(s.chars, { opacity: on ? 0 : 1 });
      tw = gsap.to(s.chars, {
        opacity: on ? 1 : 0, duration: dur, stagger: { amount, from: "random" },
        onComplete: () => {
          tw = null;
          if (!on) { split?.revert(); split = null; el.style.opacity = "0"; }
          el.dispatchEvent(new CustomEvent(on ? "fx:shown" : "fx:hidden", { bubbles: true }));
        },
      });
    };
    el.fxPixelChars = { show: () => set(true), hide: () => set(false) };
    const ac = new AbortController();
    if (mode === "load") { el.style.opacity = "0"; timer = setTimeout(() => set(true), delay * 1000); }
    else if (mode === "view") {
      el.style.opacity = "0";
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); timer = setTimeout(() => set(true), delay * 1000); } });
      io.observe(el);
      ac.signal.addEventListener("abort", () => io.disconnect());
    } else if (mode === "on") set(true);
    else el.style.opacity = "0";
    if (options.flicker === "on" && hover && !reduce) {
      el.addEventListener("mouseenter", () => {
        if (flick || tw || !shown || !split?.chars.length) return;
        const span = 0.6 - (0.07 + 0.14 + 0.07);
        flick = gsap.timeline({ onComplete: () => { flick = null; } });
        for (const c of split.chars) { const t = Math.random() * span; flick.to(c, { opacity: 0, duration: 0.07, ease: "none" }, t).to(c, { opacity: 1, duration: 0.07, ease: "none" }, t + 0.21); }
      }, { signal: ac.signal });
    }
    return () => { ac.abort(); clearTimeout(timer); tw?.kill(); flick?.kill(); split?.revert(); el.style.opacity = ""; delete el.fxPixelChars; };
  });
})();
