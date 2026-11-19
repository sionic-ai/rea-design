// Cycle several large uppercase sentences in one line slot — each letter springs up from 190% below, tilted ±2.4°, over .75~1.3s (0.17,1,0.32,1),
// For each sentence, a paired sticker image pops out with back.out(2.2) at a spot pushed 70% along, right after the nearest letter rises, nudging nearby letters by up to 12% of the letter size
// Pressed, it springs back with elastic. Once enough time to read has passed (character count × .034 + 3.03s), the characters drop back down 190% one by one at .014s intervals (Studio hero)
(() => {
  const bezier = (x1, y1, x2, y2) => {
    const f = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    const d = (t, a, b) => 3 * a * (1 - t) * (1 - 3 * t) + 3 * b * t * (2 - 3 * t) + 3 * t * t;
    return (x) => {
      if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const s = d(t, x1, x2); if (Math.abs(s) < 1e-6) break; t = Math.min(1, Math.max(0, t - (f(t, x1, x2) - x) / s)); }
      return f(t, y1, y2);
    };
  };
  // Pseudo-random determined by letter position and letter count so the same shake appears every time it opens
  const hash = (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rnd = (i, n, k) => hash(i * 3.7 + n * 0.31 + k * 17.3);
  const lerp = ([a, b], t) => a + (b - a) * t;
  const delays = (n, step, jitter) => Array.from({ length: n }, (_, i) => i * step + rnd(i, n, 1) * jitter);

  kfFx.register("char-pop-cycle", (el, { options, reduce }) => {
    const line = el.querySelector('[data-fx-part="line"]');
    const phrases = [...el.querySelectorAll('[data-fx-part="phrase"]')];
    const icons = el.querySelector('[data-fx-part="icons"]');
    if (!line || !phrases.length) return;
    const list = phrases.map((p) => {
      const [x, y] = (p.dataset.spot || "0,0").split(",").map(Number);
      return { text: p.textContent.trim(), key: p.dataset.key || "", x, y, width: p.dataset.width || "" };
    });
    const before = line.textContent;
    const setIcon = (key) => icons?.querySelectorAll('[data-fx-part="icon"]').forEach((i) => i.toggleAttribute("data-active", i.dataset.key === key));
    const setSpot = (p) => { icons?.style.setProperty("--fx-x", String(p.x)); icons?.style.setProperty("--fx-y", String(p.y)); };
    const setWidth = (w) => { if (w) line.style.setProperty("--fx-w", w); };
    const restore = () => { line.textContent = before; setIcon(""); };
    if (reduce || list.length === 1) {
      line.textContent = list[0].text; setIcon(list[0].key); setSpot(list[0]); setWidth(list[0].width);
      return restore;
    }

    const rise = +(options.rise ?? 190), tilt = +(options.tilt ?? 2.4);
    const stepIn = +(options.stagger ?? 0.034), jitIn = +(options.jitter ?? 0.128), durIn = [+(options.min ?? 0.75), +(options.max ?? 1.3)];
    const read = +(options.read ?? 2.9);
    const stepOut = 0.014, jitOut = 0.052, durOut = [0.22, 0.4], gap = 0.18;
    const easeIn = bezier(0.17, 1, 0.32, 1), easeOut = bezier(0.55, 0, 0.95, 0.38);
    const press = +(options.press ?? 0.12), reach = 1.3, wobble = 1.6;

    // Words are grouped into inline-block chunks so lines don’t break mid-word, and letters sit in a clipping box sized to the space they drop into
    const split = (text) => {
      line.textContent = "";
      const chars = [];
      text.split(" ").forEach((word, wi, words) => {
        const w = document.createElement("span");
        w.style.cssText = "display:inline-block;white-space:nowrap";
        for (const ch of word) {
          const clip = document.createElement("span");
          clip.style.cssText = "display:inline-block;clip-path:inset(-0.15em -0.5em -0.37em);vertical-align:top;padding-bottom:0.16em;margin-bottom:-0.16em";
          const c = document.createElement("span");
          c.style.cssText = "display:inline-block;transform-origin:50% 100%;will-change:transform";
          c.textContent = ch;
          clip.append(c); w.append(clip); chars.push(c);
        }
        line.append(w);
        if (wi < words.length - 1) line.append(" ");
      });
      return chars;
    };

    let chars = [], near = 0, side = 1;
    const pop = (cs, ds) => {
      if (!icons) return;
      gsap.killTweensOf(icons);
      gsap.set(icons, { clearProps: "transform" });
      const r = icons.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width * reach;
      let best = Infinity;
      const weight = cs.map((c, i) => {
        const b = (c.parentElement || c).getBoundingClientRect();
        const dist = Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy);
        if (dist < best) { best = dist; near = i; }
        return Math.max(0, 1 - dist / R);
      });
      const lr = line.getBoundingClientRect();
      side = cy > lr.top + lr.height / 2 ? 1 : -1;
      const at = (ds[near] ?? 0) + 0.12;
      gsap.fromTo(icons, { yPercent: side * 70, rotation: side * 14, scale: 0.7 }, { yPercent: 0, rotation: 0, scale: 1, duration: 0.7, ease: "back.out(2.2)", delay: at });
      gsap.fromTo(icons, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "none", delay: at });
      gsap.to(icons, { rotation: wobble, duration: 1.1, ease: "sine.inOut", delay: at + 0.7, onComplete: () => {
        gsap.fromTo(icons, { rotation: wobble }, { rotation: -wobble, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true });
      } });
      const size = parseFloat(getComputedStyle(line).fontSize) || 0, t = at + 0.2;
      cs.forEach((c, i) => {
        const y = weight[i] * press * size;
        if (y < 0.5) return;
        gsap.to(c, { y, duration: 0.1, ease: "power2.out", delay: t });
        gsap.to(c, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)", delay: t + 0.1 });
      });
    };

    const tl = gsap.timeline({ repeat: -1, paused: true });
    list.forEach((p) => {
      const n = p.text.replace(/\s/g, "").length;
      tl.call(() => {
        setSpot(p); setIcon(p.key); setWidth(p.width);
        const cs = split(p.text);
        chars = cs;
        const ds = delays(cs.length, stepIn, jitIn);
        cs.forEach((c, i) => {
          gsap.fromTo(c, { yPercent: rise, rotation: (rnd(i, cs.length, 2) * 2 - 1) * tilt }, { yPercent: 0, rotation: 0, duration: lerp(durIn, rnd(i, cs.length, 3)), ease: easeIn, delay: ds[i] });
        });
        pop(cs, ds);
      });
      tl.to({}, { duration: n * stepIn + jitIn + read });
      tl.call(() => {
        const cs = chars, ds = delays(cs.length, stepOut, jitOut);
        if (icons) gsap.to(icons, { yPercent: side * 70 * 0.6, rotation: -side * 14 * 0.5, scale: 0.7, opacity: 0, duration: 0.32, ease: easeOut, delay: ds[near] ?? 0, overwrite: true });
        cs.forEach((c, i) => gsap.to(c, { yPercent: rise, duration: lerp(durOut, rnd(i, cs.length, 4)), ease: easeOut, delay: ds[i], overwrite: true }));
      });
      tl.to({}, { duration: n * stepOut + jitOut + durOut[1] + gap });
    });

    // If the first-visit loader is running (html[data-fx-loader=on]) starts when the curtain lifts (fx:done) — if it doesn’t arrive within 4s, it just starts
    let started = false, t4 = 0;
    const start = () => { if (started) return; started = true; clearTimeout(t4); document.removeEventListener("fx:done", start); tl.play(); };
    if (document.documentElement.dataset.fxLoader === "on") { document.addEventListener("fx:done", start); t4 = setTimeout(start, 4000); }
    else start();

    return () => {
      clearTimeout(t4);
      document.removeEventListener("fx:done", start);
      tl.kill();
      gsap.killTweensOf([icons, ...chars].filter(Boolean));
      if (icons) gsap.set(icons, { clearProps: "transform,opacity" });
      restore();
    };
  });
})();
