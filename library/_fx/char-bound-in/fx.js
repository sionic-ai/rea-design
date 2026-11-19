(() => {
  // Words are wrapped in inline-block chunks and the spaces between stay as plain characters — so Korean keep-all headings don’t break mid-word
  const splitInto = (root) => {
    const chars = [];
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const text = child.textContent;
          if (!text.trim()) continue;
          const frag = document.createDocumentFragment();
          for (const piece of text.split(/(\s+)/)) {
            if (!piece) continue;
            if (/^\s+$/.test(piece)) { frag.append(piece); continue; }
            const word = document.createElement("span");
            word.className = "fx-cb-w";
            for (const ch of piece) {
              const c = document.createElement("span");
              c.className = "fx-cb-c";
              c.textContent = ch;
              word.append(c);
              chars.push(c);
            }
            frag.append(word);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.matches("br, svg, img, [data-fx-part='sub']")) {
          walk(child);
        }
      }
    };
    walk(root);
    return chars;
  };

  kfFx.register("char-bound-in", (el, { options, reduce }) => {
    const stagger = +(options.stagger ?? 0.06);
    const delay = +(options.delay ?? 0);
    const gap = +(options.gap ?? 0);
    const dur = +(options.dur ?? 0.6);
    const on = options.on || "enter";
    const whole = options.split === "none";
    const before = el.innerHTML;

    el.style.setProperty("--fx-cb-dur", `${dur}s`);
    if (whole) {
      el.style.setProperty("--fx-cb-d", `${delay}s`);
    } else {
      const lines = el.querySelectorAll("[data-fx-part='line']");
      const groups = lines.length ? [...lines] : [el];
      groups.forEach((g, gi) => {
        const extra = g.dataset.delay != null ? +g.dataset.delay : gap * gi;
        splitInto(g).forEach((c, i) => c.style.setProperty("--fx-cb-d", `${(stagger * (i + 1) + delay + extra).toFixed(3)}s`));
      });
    }
    el.classList.add("fx-cb-ready");

    const show = () => el.classList.add("is-in");
    let io = null;
    const onLoad = () => show();
    if (reduce) show();
    else if (on === "load") {
      if (document.readyState === "complete") requestAnimationFrame(show);
      else addEventListener("load", onLoad, { once: true });
    } else if (on === "enter") {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { show(); io.disconnect(); }
      }, { rootMargin: options.margin || "-10% 0px", threshold: 0 });
      io.observe(el);
    }

    return () => {
      io?.disconnect();
      removeEventListener("load", onLoad);
      el.classList.remove("is-in");
      el.classList.remove("fx-cb-ready");
      el.style.removeProperty("--fx-cb-dur");
      el.style.removeProperty("--fx-cb-d");
      if (!whole) el.innerHTML = before;
    };
  });
})();
