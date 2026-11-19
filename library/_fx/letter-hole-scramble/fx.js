// Each letter of a monospaced uppercase label reacts to the touch — a touched letter empties in .2s, and the letters on both sides turn into any symbol at .5 opacity.
// When the hand leaves, all three return in .2s and resolve from symbols to their own letters over .4s. With on: enter, letters resolve from symbols with .03s extra delay each as they appear when visible
(() => {
  const DEF = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=/?";
  kfFx.register("letter-hole-scramble", (el, { options, reduce, hover }) => {
    const text = el.textContent;
    if (!text.trim() || !window.ScrambleTextPlugin) return;
    gsap.registerPlugin(ScrambleTextPlugin);
    const chars = options.chars || DEF;
    const out = +(options.out ?? 0.2), back = +(options.back ?? 0.4), dim = +(options.dim ?? 0.5);
    const inDur = +(options.in ?? 1.25), each = +(options.each ?? 0.03), delay = +(options.delay ?? 0.25);
    const html = el.innerHTML;
    el.setAttribute("aria-label", text);
    el.innerHTML = "";
    const letters = [];
    // Each word is one inline-block chunk with the spaces between kept as is — even across several lines, no break falls mid-word
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { el.append(w); letters.push(null); return; }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach((ch) => { const s = document.createElement("span"); s.dataset.fxPart = "letter"; s.textContent = ch; s.dataset.ch = ch; word.append(s); letters.push(s); });
      el.append(word);
    });
    const real = letters.filter(Boolean);
    const rand = () => chars[Math.floor(Math.random() * chars.length)];
    const near = (i) => [letters[i - 1], letters[i + 1]].filter(Boolean);
    const offs = [];
    if (hover && !reduce) {
      letters.forEach((s, i) => {
        if (!s) return;
        const enter = () => {
          gsap.to(s, { opacity: 0, duration: out, overwrite: "auto" });
          near(i).forEach((n) => gsap.to(n, { opacity: dim, duration: out, scrambleText: { text: rand(), chars }, overwrite: "auto" }));
        };
        const leave = () => [s, ...near(i)].forEach((n) => {
          gsap.to(n, { opacity: 1, duration: out, overwrite: "auto" });
          gsap.to(n, { duration: back, scrambleText: { text: n.dataset.ch, chars }, overwrite: "auto" });
        });
        s.addEventListener("mouseenter", enter);
        s.addEventListener("mouseleave", leave);
        offs.push(() => { s.removeEventListener("mouseenter", enter); s.removeEventListener("mouseleave", leave); });
      });
    }
    let io = null;
    if (options.on === "enter" && !reduce) {
      gsap.set(real, { opacity: 0 });
      const play = () => real.forEach((s, i) => gsap.to(s, { duration: inDur, delay, opacity: 1, scrambleText: { text: s.dataset.ch, chars, revealDelay: i * each } }));
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: +(options.threshold ?? 0.5) });
      io.observe(el);
    }
    return () => {
      offs.forEach((f) => f());
      io?.disconnect();
      gsap.killTweensOf(real);
      el.innerHTML = html;
      el.removeAttribute("aria-label");
    };
  });
})();
