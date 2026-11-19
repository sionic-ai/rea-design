// Section title card over a black curtain — title letters scramble into runes and symbols, then lock from the front between 220ms and lock ms, while at the same time the letter spacing is wide and blur starts at 10px
// gathers in with 1.6s power3.out. The small heading floats up after .4s, the subtitle after 1.6s, and the progress bar fills during the hold. When the hold passes (if gate: wait, after receiving fx:open)
// Rests .25s, then the text lines blur and slide up and out (.55s · .05 stagger power2.in) and the curtain lifts in .9s — when fully lifted it sends fx:done
(() => {
  const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ✦◈⟁☉△▲";
  kfFx.register("rune-title-loader", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const title = part("title"), caption = part("caption"), sub = part("sub"), bar = part("bar");
    if (!title || !window.gsap) return;
    const hold = +(options.hold ?? 3000), lock = +(options.lock ?? 1500), from = +(options.from ?? 220);
    const spread = +(options.spread ?? (matchMedia("(min-width: 901px)").matches ? 0.33 : 0));
    const out = +(options.out ?? 0.9), chars = options.chars || RUNES;
    const text = title.textContent, html = title.innerHTML;
    title.setAttribute("aria-label", text);
    title.textContent = "";
    const glyphs = [];
    const mid = text.length / 2;
    // Words as chunks — spaces between are left as they are, so even on narrow screens it won’t break mid-word
    let i = 0;
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { title.append(w); i += w.length; return; }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach((ch) => {
        const g = document.createElement("span");
        g.dataset.fxPart = "glyph";
        g.style.setProperty("--fx-i", i - mid);
        g.textContent = ch;
        word.append(g);
        glyphs.push({ el: g, final: ch, at: from + (i / Math.max(1, text.length)) * (lock - from) });
        i++;
      });
      title.append(word);
    });
    const pick = () => chars[Math.floor(Math.random() * chars.length)];
    let raf = 0, timers = [], tweens = [], done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.hidden = true;
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce) {
      el.classList.add("is-done");
      timers.push(setTimeout(finish, 0));
      return () => { timers.forEach(clearTimeout); title.innerHTML = html; title.removeAttribute("aria-label"); };
    }
    glyphs.forEach((g) => { g.el.textContent = pick(); g.el.classList.add("is-mixed"); });
    const t0 = performance.now();
    let frame = 0;
    const tick = () => {
      frame++;
      const t = performance.now() - t0;
      let left = false;
      for (const g of glyphs) {
        if (!g.el.classList.contains("is-mixed")) continue;
        if (t >= g.at) { g.el.textContent = g.final; g.el.classList.remove("is-mixed"); }
        else { left = true; if (frame % 2 === 0) g.el.textContent = pick(); }
      }
      if (left) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    tweens.push(gsap.fromTo(title, { opacity: 0, "--fx-spread": `${spread}em`, filter: "blur(10px)" }, { opacity: 1, "--fx-spread": "0em", filter: "blur(0px)", duration: 1.6, ease: "power3.out" }));
    if (caption) tweens.push(gsap.from(caption, { opacity: 0, y: 12, duration: 0.9, delay: 0.4, ease: "power2.out" }));
    if (sub) tweens.push(gsap.from(sub, { opacity: 0, y: -8, duration: 0.9, delay: 1.6, ease: "power2.out" }));
    if (bar) tweens.push(gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: hold / 1000, ease: "power1.inOut" }));
    let held = false, open = options.gate !== "wait", leaving = false;
    const leave = () => {
      if (leaving || !held || !open) return;
      leaving = true;
      timers.push(setTimeout(() => {
        const lines = [caption, title, sub, bar].filter(Boolean);
        tweens.push(gsap.to(lines, { opacity: 0, filter: "blur(14px)", y: -10, duration: 0.55, stagger: 0.05, ease: "power2.in" }));
        tweens.push(gsap.to(el, { opacity: 0, duration: out, ease: "power2.inOut", onComplete: finish }));
      }, 250));
    };
    const onOpen = () => { open = true; leave(); };
    el.addEventListener("fx:open", onOpen);
    timers.push(setTimeout(() => { held = true; leave(); }, hold));
    // Fallback when the picture never arrives — original maxHoldMs 12s
    timers.push(setTimeout(() => { open = true; held = true; leave(); }, +(options.max ?? 12000)));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      tweens.forEach((t) => t.kill());
      el.removeEventListener("fx:open", onOpen);
      gsap.set([el, caption, title, sub, bar].filter(Boolean), { clearProps: "all" });
      title.innerHTML = html;
      title.removeAttribute("aria-label");
    };
  });
})();
