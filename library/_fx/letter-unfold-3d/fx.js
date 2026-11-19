(() => {
  // Split the wordmark letters into cells with staggered delays, and unfold with a css transition when visible (or when the caller adds is-in)
  kfFx.register("letter-unfold-3d", (el, { options, reduce }) => {
    let chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    let made = false;
    if (!chars.length) {
      const text = el.textContent.trim();
      if (!text) return;
      el.setAttribute("aria-label", text);
      el.textContent = "";
      // Spaces aren’t made into cells but left as blanks between letters — so line-break spots stay alive
      chars = [];
      for (const c of text) {
        if (/\s/.test(c)) { el.append(" "); continue; }
        const s = document.createElement("span");
        s.dataset.fxPart = "char";
        s.setAttribute("aria-hidden", "true");
        s.textContent = c;
        el.append(s);
        chars.push(s);
      }
      made = true;
    }
    const start = +(options.start ?? 0.58), each = +(options.each ?? 0.08);
    chars.forEach((c, i) => c.style.setProperty("--fx-delay", `${(start + i * each).toFixed(3)}s`));
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    let io = null;
    if (options.when !== "manual") {
      const at = options.at ?? "-25%";
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        if (options.again !== "on") io.disconnect();
      }), { rootMargin: `0% 0% ${at} 0%`, threshold: 0 });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      el.classList.remove("is-in");
      chars.forEach((c) => c.style.removeProperty("--fx-delay"));
      if (made) el.textContent = el.getAttribute("aria-label") || "";
    };
  });
})();
