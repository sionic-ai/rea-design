(() => {
  // Split text into letters inside word chunks, and while the cursor is inside the plate perimeter (a box widened by the radius), add is-near each frame to letters within the radius
  const wrap = (root) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.className = "fx-nd-w";
          [...part].forEach((c) => {
            const ch = document.createElement("span");
            ch.className = "fx-nd-ch";
            ch.textContent = c;
            w.append(ch);
            chars.push(ch);
          });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(root);
    return chars;
  };
  kfFx.register("char-near-dim", (el, { options, reduce, hover }) => {
    if (!el.textContent.trim()) return;
    const saved = el.innerHTML;
    const chars = wrap(el);
    if (!chars.length) return;
    const r = +(options.radius ?? 100);
    if (options.look === "light") el.classList.add("fx-nd-light");
    if (reduce || !hover) return () => { el.innerHTML = saved; el.classList.remove("fx-nd-light"); };
    let x = -1e4, y = -1e4, raf = 0, on = false;
    const clear = () => { chars.forEach((c) => c.classList.remove("is-near")); on = false; };
    const tick = () => {
      raf = 0;
      const b = el.getBoundingClientRect();
      const sel = document.getSelection();
      const inside = x > b.left - r && x < b.right + r && y > b.top - r && y < b.bottom + r;
      if (!inside || (sel && !sel.isCollapsed && sel.containsNode(el, true))) { if (on) clear(); return; }
      on = true;
      const near = chars.map((c) => { const q = c.getBoundingClientRect(), dx = x - (q.left + q.width / 2), dy = y - (q.top + q.height / 2); return dx * dx + dy * dy < r * r; });
      chars.forEach((c, i) => c.classList.toggle("is-near", near[i]));
    };
    const move = (e) => { if (e.pointerType !== "mouse") return; x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(tick); };
    const out = () => { cancelAnimationFrame(raf); raf = 0; x = y = -1e4; clear(); };
    const scroll = () => { if (on && !raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", scroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("scroll", scroll);
      document.documentElement.removeEventListener("pointerleave", out);
      el.innerHTML = saved;
      el.classList.remove("fx-nd-light");
    };
  });
})();
