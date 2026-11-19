// Dot + lagging ring cursor: dot stays in place, ring follows by 1 − lag^(dt/16.667) each step. 52px over links, pill over data-cursor-label — cursor values from the original site
(() => {
  let users = 0;
  kfFx.register("ring-lag-cursor", (root, { options, reduce, hover }) => {
    if (!hover) return;
    users++;
    const made = [];
    const mk = (part, parent, tag = "i") => {
      let n = root.querySelector(`[data-fx-part="${part}"]`);
      if (!n) { n = document.createElement(tag); n.setAttribute("data-fx-part", part); parent.append(n); made.push(n); }
      return n;
    };
    const ring = mk("ring", root), shell = mk("shell", ring), label = mk("label", shell, "span"), dot = mk("dot", root);
    const lag = +(options.lag ?? 0.84);
    const sel = options.hover || "a, button, [role=button], label, select, summary, [data-cursor=hover]";
    const html = document.documentElement;
    let tx = -100, ty = -100, rx = -100, ry = -100, seen = false, hot = false, text = false, extHot = false, extLabel = null, raf = 0, last = performance.now();
    const tog = (c, on) => root.classList.toggle(c, on);
    const setLabel = (t) => {
      if (t) { label.textContent = t; root.style.setProperty("--fx-label-w", `${label.scrollWidth + 24}px`); }
      tog("is-label", !!t);
    };
    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; rx = tx; ry = ty; tog("is-on", true); }
      const t = e.target instanceof Element ? e.target : null;
      hot = !!t?.closest(sel);
      text = !!t?.matches("input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable=true]");
      tog("is-text", text);
      setLabel(t?.closest("[data-cursor-label]")?.getAttribute("data-cursor-label") || extLabel);
    };
    const leave = () => { seen = false; tog("is-on", false); };
    const down = () => tog("is-down", true), up = () => tog("is-down", false);
    const ext = (e) => { extHot = !!e.detail?.hot; extLabel = e.detail?.label || null; setLabel(extLabel); };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.max(1, Math.min(now - last, 50));
      last = now;
      const k = reduce ? 1 : 1 - Math.pow(lag, dt / 16.667);
      rx += (tx - rx) * k; ry += (ty - ry) * k;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      tog("is-hover", (hot || extHot) && !text);
    };
    html.classList.add("fx-ring-cursor");
    document.addEventListener("mousemove", move, { passive: true });
    html.addEventListener("mouseleave", leave);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    root.addEventListener("fx:cursor", ext);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", move);
      html.removeEventListener("mouseleave", leave);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
      root.removeEventListener("fx:cursor", ext);
      if (--users === 0) html.classList.remove("fx-ring-cursor");
      made.forEach((n) => n.remove());
      root.classList.remove("is-on", "is-hover", "is-down", "is-text", "is-label");
    };
  });
})();
