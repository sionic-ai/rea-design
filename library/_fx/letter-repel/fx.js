// Original words were flipped upside down so coordinates were used inverted — parts are pushed away from the cursor based on the unflipped letters
(() => {
  kfFx.register("letter-repel", (el, { options, reduce, hover }) => {
    const was = el.innerHTML;
    // Wrap words as inline-block chunks and keep the spaces between as literal characters — &nbsp; Switching to this keeps multi-line titles from breaking between words
    if (!el.querySelector(".fx-ch")) el.replaceChildren(...el.textContent.split(/(\s+)/).filter(Boolean).map((w) => {
      if (/^\s/.test(w)) return w;
      const word = Object.assign(document.createElement("span"), { className: "fx-word" });
      word.append(...[...w].map((c) => Object.assign(document.createElement("span"), { className: "fx-ch", textContent: c })));
      return word;
    }));
    const restore = () => (el.innerHTML = was);
    if (reduce || !hover) return restore;
    const ac = new AbortController(), on = { signal: ac.signal };
    const rad = +(options.radius || 0.12), push = +(options.push || 0.012);
    const ls = [...el.querySelectorAll(".fx-ch")], st = ls.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let mx = 0, my = 0, over = false, last = 0, raf = 0;
    const tick = (t) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016; last = t;
      const w = el.clientWidth, amp = push * w, r = rad * w;
      let moving = over;
      ls.forEach((l, i) => {
        const s = st[i]; let tx = 0, ty = 0;
        if (over) { const b = l.getBoundingClientRect(), dx = b.left + b.width / 2 - s.x - mx, dy = b.top + b.height / 2 - s.y - my, d = Math.hypot(dx, dy) || 1, f = amp * Math.exp(-(d * d) / (r * r)); tx = (dx / d) * f; ty = (dy / d) * f; }
        s.vx += ((tx - s.x) * 120 - 14 * s.vx) * dt; s.vy += ((ty - s.y) * 120 - 14 * s.vy) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) > 0.02) moving = true;
        l.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      });
      // When everything stops, rest the frames — even with many words on screen, only those touched by the hand spin
      if (moving) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; over = true; wake(); }, on);
    el.addEventListener("pointerleave", () => { over = false; wake(); }, on);
    return () => { ac.abort(); cancelAnimationFrame(raf); restore(); };
  });
})();
