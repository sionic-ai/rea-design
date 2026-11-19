// Moving the mouse over a title squashes the letter nearest the cursor in .12s (.7× vertical, .85× horizontal, tilting away from the cursor)
// Letters on both sides of the same line move only half — then a damped spring (first overshoot 1/3 of the squash, half period .16s) spreads them out over .8s.
// Characters are split only on hover and restored to plain text once fully spread — only the wrapper span is removed, so other line splits on the heading stay intact
(() => {
  const spring = (duck, peak, rise, rest) => {
    const r = Math.log(duck / peak), z = r / Math.sqrt(Math.PI ** 2 + r ** 2), w = Math.PI / rise, a = (z * w) / Math.sqrt(1 - z ** 2);
    return (p) => (p >= 1 ? 1 : 1 - Math.exp(-a * p * rest) * (Math.cos(w * p * rest) + (a / w) * Math.sin(w * p * rest)));
  };
  const wrapChars = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walk.nextNode()) if (walk.currentNode.nodeValue.trim()) texts.push(walk.currentNode);
    const chars = [];
    for (const t of texts) {
      const frag = document.createDocumentFragment();
      for (const part of t.nodeValue.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.dataset.sqWord = "";
        w.style.cssText = "display:inline-block;white-space:nowrap";
        for (const ch of part) {
          const c = document.createElement("span");
          c.dataset.sqChar = "";
          c.style.display = "inline-block";
          c.textContent = ch;
          w.append(c);
          chars.push(c);
        }
        frag.append(w);
      }
      t.replaceWith(frag);
    }
    return chars;
  };
  const unwrap = (el) => {
    el.querySelectorAll("[data-sq-word]").forEach((w) => w.replaceWith(document.createTextNode(w.textContent)));
    el.normalize();
  };

  kfFx.register("char-squash-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !el.textContent.trim()) return;
    const duck = +(options.duck ?? 0.3), squash = +(options.squash ?? 0.15), lean = +(options.lean ?? 0.9), near = +(options.near ?? 0.5);
    const down = +(options.down ?? 0.12), rest = +(options.rest ?? 0.8);
    const back = spring(duck, +(options.peak ?? 0.1), +(options.rise ?? 0.16), rest);
    let st = null, box = null, cur = -1, inside = false, idle = null;
    const ready = () => !gsap.isTweening(el) && getComputedStyle(el).opacity === "1" && !el.querySelector("[data-sq-char]");
    const build = () => {
      const chars = wrapChars(el);
      box = el.getBoundingClientRect();
      st = {
        tweens: [],
        chars: chars.map((c) => {
          const r = c.getBoundingClientRect();
          const fs = parseFloat(getComputedStyle(c).fontSize) || r.height;
          const baseline = r.height * 0.78;
          gsap.set(c, { transformOrigin: `50% ${baseline}px` });
          return { el: c, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, half: r.width / 2, line: r.height || fs, rise: baseline, duck: 0, side: 0 };
        }),
      };
    };
    const clear = () => {
      if (!st) return;
      idle?.kill(); idle = null;
      st.tweens.forEach((t) => t?.kill());
      gsap.set(st.chars.map((c) => c.el), { clearProps: "transform,transformOrigin" });
      unwrap(el);
      st = null; cur = -1;
    };
    const draw = (c) => {
      const v = 1 - duck * c.duck;
      const b = c.duck > 0 ? 1 - (duck - squash) * c.duck : 1 / v;
      const k = Math.max(-1, Math.min(1, c.side)) * lean * ((1 - b) * c.half) / (v * Math.max(c.rise, c.line - c.rise) || 1);
      gsap.set(c.el, { scaleX: b, scaleY: v, skewX: (-Math.atan(k) * 180) / Math.PI });
    };
    const kick = (i, amount, side) => {
      const c = st.chars[i];
      st.tweens[i]?.kill();
      st.tweens[i] = gsap.timeline()
        .to(c, { duck: amount, side, duration: down, ease: "power2.out", onUpdate: () => draw(c) })
        .to(c, { duck: 0, duration: rest, ease: back, onUpdate: () => draw(c) });
    };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      if (st && !st.chars[0].el.isConnected) clear();
      if (!st) { if (!ready()) return; build(); }
      inside = true;
      box ||= el.getBoundingClientRect();
      const px = e.clientX - box.left, py = e.clientY - box.top;
      let best = -1, dist = Infinity;
      st.chars.forEach((c, i) => { const d = (c.x - px) ** 2 + (c.y - py) ** 2; if (d < dist) { dist = d; best = i; } });
      if (best === cur) return;
      cur = best;
      const c = st.chars[best];
      kick(best, 1, Math.max(-1, Math.min(1, (c.x - px) / (c.half || 1))));
      for (const [j, s] of [[best - 1, -1], [best + 1, 1]]) if (st.chars[j] && Math.abs(st.chars[j].y - c.y) < c.line / 2) kick(j, near, s);
      idle?.kill();
      idle = gsap.delayedCall(down + rest, () => { idle = null; if (!inside) clear(); });
    };
    const leave = () => { inside = false; cur = -1; if (st && !idle) clear(); };
    const scroll = () => { box = null; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", scroll);
      clear();
    };
  });
})();
