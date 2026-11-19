// Small uppercase labels are typed like a typewriter — each letter is on, blinks, on again over 140ms (stepped), and alphanumerics shuffle through random letters twice (34ms) before settling on their own letter,
// A thin cursor hops along the end of each letter, blinks twice and vanishes, then the whole line blinks once more. Letter spacing = clamp(300/char count, 9, 22)ms
(() => {
  const STEP = "steps(1, end)", POOL = "ABCDEFGHJKMNPQRSTUVWXYZ0123456789/#+*";
  kfFx.register("type-flicker-label", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim()) return;
    const orig = el.innerHTML, list = [], vis = document.createElement("span"), sr = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    sr.className = "fx-tfl-sr"; sr.textContent = el.textContent.replace(/\s+/g, " ").trim();
    const walk = (from, into) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) for (const ch of n.textContent) { if (/\s/.test(ch)) { into.append(" "); continue; } const g = document.createElement("span"); g.className = "fx-tfl-g"; g.textContent = ch; list.push(g); into.append(g); }
      else if (n.nodeName === "BR") into.append(document.createElement("br"));
      else if (n.nodeType === 1) { const c = n.cloneNode(false); into.append(c); walk(n, c); }
    });
    walk(el, vis);
    el.textContent = "";
    el.append(sr, vis);
    el.classList.add("is-fx-armed");
    const timers = [], anims = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const shuffle = (g, d) => later(() => {
      const real = g.textContent;
      g.style.cssText = `display:inline-block;text-align:center;width:${g.getBoundingClientRect().width}px`;
      let k = 0;
      const tick = () => { if (k++ < 2) { g.textContent = POOL[(Math.random() * POOL.length) | 0]; later(tick, 34); } else { g.textContent = real; g.removeAttribute("style"); } };
      tick();
    }, d);
    const play = (at) => {
      el.classList.remove("is-fx-armed");
      const n = list.length, each = Math.min(22, Math.max(9, +(options.each ?? 300 / n))), all = n * each;
      list.forEach((g, i) => {
        const d = at + i * each;
        anims.push(g.animate([{ opacity: 0, easing: STEP }, { opacity: 1, offset: 0.25, easing: STEP }, { opacity: 0.2, offset: 0.5, easing: STEP }, { opacity: 1, offset: 0.75 }, { opacity: 1 }], { duration: 140, delay: d, fill: "backwards" }));
        if (options.scramble !== "none" && /[A-Za-z0-9]/.test(g.textContent)) shuffle(g, d);
      });
      if (options.caret !== "none") {
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        const box = el.getBoundingClientRect(), pts = list.map((g) => { const r = g.getBoundingClientRect(); return { x: r.right - box.left, y: r.top - box.top, h: r.height }; });
        const caret = document.createElement("span");
        caret.className = "fx-tfl-caret";
        caret.style.height = `${Math.max(...pts.map((p) => p.h))}px`;
        el.append(caret);
        const total = all + 300, k = all / total;
        anims.push(caret.animate([...pts.map((p, i) => ({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`, offset: (i * each) / total, easing: STEP })), { transform: `translate(${pts.at(-1).x.toFixed(1)}px, ${pts.at(-1).y.toFixed(1)}px)`, offset: 1 }], { duration: total, delay: at, fill: "forwards" }));
        anims.push(caret.animate([{ opacity: 1, easing: STEP }, { opacity: 1, offset: k, easing: STEP }, { opacity: 0, offset: k + (1 - k) * 0.2, easing: STEP }, { opacity: 1, offset: k + (1 - k) * 0.4, easing: STEP }, { opacity: 0, offset: k + (1 - k) * 0.65 }, { opacity: 0 }], { duration: total, delay: at, fill: "forwards" }));
        later(() => caret.remove(), at + total + 40);
      }
      anims.push(vis.animate([{ opacity: 1, easing: STEP }, { opacity: 0.12, offset: 0.16, easing: STEP }, { opacity: 1, offset: 0.32, easing: STEP }, { opacity: 0.4, offset: 0.56, easing: STEP }, { opacity: 1, offset: 0.74 }, { opacity: 1 }], { duration: 260, delay: at + all + 60 }));
    };
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); play(+(options.delay ?? 0) * 1000); }, { root: scroller || null, rootMargin: options.margin || "0px 0px -2% 0px" });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); anims.forEach((a) => a.cancel()); el.innerHTML = orig; el.classList.remove("is-fx-armed"); el.style.removeProperty("position"); };
  });
})();
