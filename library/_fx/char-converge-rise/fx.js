(() => {
  // Original table: delay, length and curve of the i-th letter. Beyond the table it extends by the same rule (delay = step/2·i·(i+3), end is total − 50)
  const X1 = [0, 0.02, 0.04, 0.07, 0.1, 0.13, 0.16], X2 = [0.1, 0.12, 0.15, 0.19, 0.24, 0.3, 0.37];
  const DUR = [1200, 1180, 1150, 1110, 1060, 1000, 930, 850, 710, 610, 500];
  kfFx.register("char-converge-rise", (el, { options, reduce }) => {
    let chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    const made = !chars.length;
    const html = el.innerHTML;
    if (made) {
      const text = el.textContent;
      if (!text.trim()) return;
      el.setAttribute("aria-label", text.trim());
      el.textContent = "";
      text.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { el.append(document.createTextNode(w)); return; }
        const word = document.createElement("span");
        word.className = "fx-ccr-word";
        word.setAttribute("aria-hidden", "true");
        [...w].forEach((c) => {
          const box = document.createElement("span");
          box.setAttribute("data-fx-part", "char");
          const inner = document.createElement("span");
          inner.textContent = c;
          box.append(inner);
          word.append(box);
        });
        el.append(word);
      });
      chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    }
    const inners = chars.map((c) => c.firstElementChild || c);
    const total = +(options.total ?? 1200), step = +(options.step ?? 10);
    const depth = () => {
      const w = innerWidth;
      if (w <= 840) return +(options["y-phone"] ?? 38);
      if (w <= 1140) return +(options["y-tablet"] ?? 64);
      return +(options.y ?? 70);
    };
    const restore = () => {
      if (made) { el.innerHTML = html; el.removeAttribute("aria-label"); }
      else inners.forEach((s) => { s.style.transition = ""; s.style.translate = ""; });
    };
    if (reduce) return restore;
    const y = depth();
    inners.forEach((s) => { s.style.transition = "none"; s.style.translate = `0 ${y}px`; });
    let io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect(); io = null;
      inners.forEach((s, i) => {
        const delay = (step / 2) * i * (i + 3);
        const dur = i < DUR.length ? DUR[i] * (total / 1200) : Math.max(200, total - 50 - delay);
        const k = Math.min(i, X1.length - 1);
        s.offsetHeight;
        s.style.transition = `translate ${dur}ms cubic-bezier(${X1[k]}, 1, ${X2[k]}, 1) ${delay}ms`;
        s.style.translate = "0 0";
      });
    });
    io.observe(el);
    return () => { io?.disconnect(); restore(); };
  });
})();
