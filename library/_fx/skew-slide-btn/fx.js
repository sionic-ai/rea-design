(() => {
  // Split letters into two overlapping layers — the motion is handled by the transition in fx.css, and here only a per-letter sequence index (--fx-i) is attached
  kfFx.register("skew-slide-btn", (el, { options }) => {
    const label = el.querySelector('[data-fx-part="text"]') || el;
    const text = label.textContent.trim();
    if (!text) return;
    const was = label.innerHTML;
    const each = +(options.each ?? 0.018);
    el.style.setProperty("--fx-each", `${each}s`);
    const row = (hover) => {
      const r = document.createElement("span");
      r.className = "fx-ssb-row" + (hover ? " is-hover" : "");
      if (hover) r.setAttribute("aria-hidden", "true");
      [...text].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "fx-ssb-ch";
        s.style.setProperty("--fx-i", i);
        s.textContent = ch === " " ? " " : ch;
        r.append(s);
      });
      return r;
    };
    const wrap = document.createElement("span");
    wrap.className = "fx-ssb-wrap";
    wrap.append(row(false), row(true));
    label.replaceChildren(wrap);
    label.setAttribute("aria-label", text);
    return () => { label.innerHTML = was; label.removeAttribute("aria-label"); el.style.removeProperty("--fx-each"); };
  });
})();
