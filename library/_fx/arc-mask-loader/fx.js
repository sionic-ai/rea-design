// First loader — the big title and italic word rise from 130% below at 1s expo.out (the word .3s later, resolving from scrambled letters), and the counter comes up after .9s
// Counts 86~93 for 1.5s (after holding hold seconds — the original waits until photos and video are all loaded), then reaches 100 in .5s. When the text is fully in, a round-topped curtain rises from the bottom over .9s expo.inOut to cover the screen (text flips by itself via difference blend),
// When all three are set, text lines exit to -130% in turn (.6s, the next line starts .55s before the previous ends) and the curtain, bottom still rounded, lifts away in .9s, with the body ([data-fx-part=page] selector) gets pushed upward
(() => {
  const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  kfFx.register("arc-mask-loader", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const mask = part("mask"), title = part("title"), word = part("word"), count = part("count");
    if (!mask || !window.gsap) return;
    const rise = +(options.rise ?? 1), cover = +(options.cover ?? 0.9), out = +(options.out ?? 0.6), lift = +(options.lift ?? 0.9);
    const ramp = +(options.ramp ?? 1.5), shift = +(options.shift ?? 40), hold = +(options.hold ?? 0);
    const lines = [title, word, count].filter(Boolean);
    const pages = options.page ? [...document.querySelectorAll(options.page)] : [];
    const finish = () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce) { setTimeout(finish, 0); return () => {}; }
    const tl = [];
    const final = word ? word.textContent : "";
    let raf = 0;
    gsap.set(mask, { yPercent: 100 });
    el.classList.add("is-rising");
    gsap.set(lines, { yPercent: 130 });
    if (pages.length) gsap.set(pages, { y: shift });
    let rose = false, counted = false, gone = false;
    const leave = () => {
      if (gone || !rose || !counted) return;
      gone = true;
      clearTimeout(glitchTimer);
      if (word) gsap.set(word, { x: 0, skewX: 0, clipPath: "none" });
      const t = gsap.timeline();
      lines.forEach((l, i) => t.to(l, { yPercent: -130, duration: out, ease: "expo.inOut" }, i ? `>-${out - 0.05}` : 0));
      el.classList.remove("is-rising");
      t.to(mask, { yPercent: -100, duration: lift, ease: "expo.inOut", onComplete: finish }, ">-0.2");
      if (pages.length) t.to(pages, { y: 0, duration: lift, ease: "expo.inOut", clearProps: "transform" }, "<");
      tl.push(t);
    };
    // Word band glitch — once at .45s after the text is fully set, then every 2.4s (±25%) it cuts below the words and shakes them out of alignment for two frames (original band glitch)
    let glitchTimer = 0, k = 0;
    const shatter = () => {
      if (!word || gone) return;
      // Each frame is cropped at the bottom (25~65%) and offset left and right — the last frame stays in place
      const t = gsap.timeline();
      [0.6, -0.4, 0].forEach((m, f) => t.set(word, { x: m * 10, skewX: m * -8, clipPath: m ? `inset(0 0 ${25 + ((f + k) % 3) * 20}% 0)` : "none" }, f * 0.05));
      tl.push(t);
      k += 1;
      glitchTimer = setTimeout(shatter, 2400 * (1 + 0.25 * Math.sin(47 * k)));
    };
    const enter = gsap.timeline({ delay: 0.3, onComplete: () => {
      if (options.glitch !== "off") glitchTimer = setTimeout(shatter, 450);
      tl.push(gsap.to(mask, { yPercent: 0, duration: cover, ease: "expo.inOut", onComplete: () => { rose = true; leave(); } }));
    } });
    if (title) enter.to(title, { yPercent: 0, duration: rise, ease: "expo.out" }, 0);
    if (word) {
      enter.to(word, { yPercent: 0, duration: rise, ease: "expo.out" }, 0.3);
      const t0 = performance.now() + 600;
      const tick = (now) => {
        const p = Math.min(1, Math.max(0, (now - t0) / (rise * 1000)));
        const n = Math.floor(p * final.length);
        word.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)])).join("");
        if (p < 1) raf = requestAnimationFrame(tick); else word.textContent = final;
      };
      raf = requestAnimationFrame(tick);
    }
    tl.push(enter);
    if (count) {
      const v = { n: 0 }, top = 86 + Math.floor(Math.random() * 8);
      const show = () => { count.textContent = String(Math.round(v.n)).padStart(3, "0"); };
      show();
      tl.push(gsap.to(count, { yPercent: 0, duration: rise, delay: 0.9, ease: "expo.out" }));
      tl.push(gsap.to(v, { n: top, duration: ramp, delay: 0.9, ease: "none", onUpdate: show, onComplete: () => {
        tl.push(gsap.to(v, { n: 100, duration: 0.5, delay: hold, ease: "none", onUpdate: show, onComplete: () => { counted = true; leave(); } }));
      } }));
    } else counted = true;
    return () => {
      clearTimeout(glitchTimer);
      cancelAnimationFrame(raf);
      tl.forEach((t) => t.kill());
      gsap.set([mask, ...lines, ...pages], { clearProps: "transform" });
      if (word) word.textContent = final;
      el.classList.remove("is-rising");
    };
  });
})();
