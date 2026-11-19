(() => {
  const split = (el) => {
    const out = [];
    const walk = (n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        for (const ch of n.textContent) {
          if (/\s/.test(ch)) f.append(document.createTextNode(ch));
          else { const s = document.createElement("span"); s.className = "fx-ch"; s.textContent = ch; f.append(s); out.push({ s, o: ch }); }
        }
        n.replaceWith(f);
      } else if (n.nodeType === 1) [...n.childNodes].forEach(walk);
    };
    [...el.childNodes].forEach(walk);
    return out;
  };
  kfFx.register("scramble-fall-text", (el, { options, reduce, scroller }) => {
    const blocks = [...el.querySelectorAll('[data-fx-part="text"]')], fin = el.querySelector('[data-fx-part="final"]');
    if (reduce || !blocks.length) return;
    const html = blocks.map((b) => b.innerHTML), finHTML = fin?.innerHTML;
    const G = options.glyphs || 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ0123456789#$()!?"§&<>@*+-';
    const rnd = () => G[Math.floor(Math.random() * G.length)];
    const groups = blocks.map(split), flat = groups.flat(), most = Math.max(1, ...groups.map((g) => g.length));
    const last = fin ? split(fin) : [];
    last.forEach(({ s }) => (s.style.opacity = "0"));
    let amt = 0, vel = 0, pos = 0, raf = 0, run = false, frame = 0, prevP = -1;
    const scramble = (g, at, a) => { const n = g.length; if (!n) return; const i0 = ((Math.floor(at) % n) + n) % n; g.forEach(({ s, o }, k) => { let c = k - i0; if (c < 0) c += n; s.textContent = c < 22 && Math.random() < a * Math.pow(1 - c / 22, 0.6) ? rnd() : o; }); };
    const write = (p) => { const t = p * last.length; last.forEach(({ s, o }, k) => { if (k < t - 4) { s.style.opacity = "1"; s.textContent = o; } else if (k < t) { s.style.opacity = "1"; s.textContent = rnd(); } else { s.style.opacity = "0"; s.textContent = o; } }); };
    const fall = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: options.end || "center 30%", scrub: +(options.scrub ?? 2) } });
    groups.forEach((g, i) => g.forEach(({ s }) => fall.to(s, { y: gsap.utils.random(40, 160), x: gsap.utils.random(-10, 10), rotation: gsap.utils.random(-20, 20), opacity: 0, ease: "power2.in", duration: gsap.utils.random(0.25, 0.7) }, i * 0.06 + gsap.utils.random(0, 0.6))));
    const tick = () => {
      if (!run) return;
      frame++; amt += (vel - amt) * 0.14; vel *= 0.9;
      if (frame % 8 === 0) {
        if (amt > 0.01) { pos = (pos + 1 + amt * 10) % most; groups.forEach((g) => scramble(g, pos, amt)); }
        else flat.forEach(({ s, o }) => (s.textContent = o));
        if (last.length) {
          const p = fall.scrollTrigger?.progress ?? 0;
          if (Math.abs(p - prevP) > 2e-4) write(p);
          else { const t = p * last.length; last.forEach(({ s, o }, k) => { s.style.opacity = k < t ? "1" : "0"; s.textContent = o; }); }
          prevP = p;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const go = () => { if (run) return; run = true; frame = 0; raf = requestAnimationFrame(tick); };
    const stop = () => { run = false; vel = amt = 0; cancelAnimationFrame(raf); flat.forEach(({ s, o }) => (s.textContent = o)); last.forEach(({ s, o }) => { s.style.opacity = "0"; s.textContent = o; }); prevP = -1; };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onEnter: go, onLeave: stop, onEnterBack: go, onLeaveBack: stop, onUpdate: (s) => (vel = Math.min(Math.abs(s.getVelocity()) / 3400, 0.45)) });
    return () => { stop(); st.kill(); fall.scrollTrigger?.kill(); fall.kill(); blocks.forEach((b, i) => (b.innerHTML = html[i])); if (fin) fin.innerHTML = finHTML; };
  });
})();
