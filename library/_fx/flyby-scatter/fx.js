// Scatter on pass: a scroll-tied pass line sweeps the title left to right, and letters the line passes are pushed randomly, fall, spin and vanish.
// If there is a flyer (paper plane image etc.) it flies along a wavy path following the head of that line — the pain-story section of the Brand site
(() => {
  kfFx.register("flyby-scatter", (el, { options, reduce, scroller }) => {
    const target = el.querySelector('[data-fx-part="text"]') || el;
    if (reduce || !target.textContent.trim() || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const flyer = el.querySelector('[data-fx-part="flyer"]');
    const original = target.innerHTML;
    // Words are inline-block chunks with the spaces between them kept as is — so Korean line breaks do not split mid-word
    const chars = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { walk(n); continue; }
        if (n.nodeType !== 3) continue;
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement("span");
          w.className = "fx-fs-word";
          for (const c of part) {
            const s = document.createElement("span");
            s.className = "fx-fs-ch";
            s.textContent = c;
            w.append(s);
            chars.push(s);
          }
          frag.append(w);
        }
        n.replaceWith(frag);
      }
    };
    walk(target);
    if (!chars.length) { target.innerHTML = original; return; }
    const reach = +(options.reach ?? 140), fall = +(options.fall ?? 220), spin = +(options.spin ?? 80), drift = +(options.drift ?? 50);
    const wave = +(options.wave ?? 0.75);
    const seeds = chars.map(() => ({ x: (Math.random() * 2 - 1) * drift, y: fall * (0.27 + Math.random() * 0.73), r: (Math.random() * 2 - 1) * spin }));
    let centers = [], box = null;
    const measure = () => {
      chars.forEach((c) => { c.style.transform = ""; });
      box = target.getBoundingClientRect();
      centers = chars.map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2 - box.left; });
    };
    measure();
    const paint = (p) => {
      // Line head: from outside the title’s left (-12%) to outside its right (+12%)
      const head = (-0.12 + p * 1.24) * box.width;
      chars.forEach((c, i) => {
        const k = Math.min(1, Math.max(0, (head - centers[i] + 10) / reach));
        const s = seeds[i];
        c.style.transform = k ? `translate(${s.x * k}px, ${s.y * k * k}px) rotate(${s.r * k}deg)` : "";
        c.style.opacity = String(1 - Math.min(1, Math.max(0, k * 1.15 - 0.15)));
      });
      if (flyer) {
        const y = -Math.sin(p * Math.PI * 0.85) * box.height * wave;
        const tilt = Math.cos(p * Math.PI * 0.85) * -18;
        flyer.style.transform = `translate(${head}px, ${box.height * 0.5 + y}px) rotate(${tilt}deg)`;
        flyer.style.opacity = p > 0 && p < 1 ? "1" : "0";
      }
    };
    const st = ScrollTrigger.create({
      scroller, trigger: (options.track && el.closest(options.track)) || el,
      start: options.start || "top 70%", end: options.end || "bottom 20%",
      scrub: options.scrub == null ? true : +options.scrub,
      onRefresh: (s) => { measure(); paint(s.progress); },
      onUpdate: (s) => paint(s.progress),
    });
    const ro = new ResizeObserver(() => { measure(); paint(st.progress); });
    ro.observe(target);
    paint(st.progress);
    return () => { ro.disconnect(); st.kill(); target.innerHTML = original; if (flyer) flyer.style.cssText = ""; };
  });
})();
