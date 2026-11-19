// The system cursor stays as is, and four corner brackets (10px) follow around the cursor (−12·+2px). Over links, buttons and list rows they snap 6px outside that box.
// .16s when following, .36s when attaching, using only CSS transitions (original curve .16,1,.3,1). The brackets blend with difference so they show on any background
(() => {
  const KEYS = ["tl", "tr", "bl", "br"];
  kfFx.register("bracket-snap-cursor", (root, { options, reduce, hover }) => {
    if (!hover || reduce) return;
    const gap = +(options.gap ?? 6), size = +options.size || 10;
    const targets = (options.targets || '[data-fx-part="row"], a, button:not([aria-disabled="true"])').split(",").map((s) => s.trim());
    const box = document.createElement("div");
    box.className = "fx-bracket-snap";
    box.setAttribute("aria-hidden", "true");
    box.style.setProperty("--fx-size", `${size}px`);
    if (options.dur != null) box.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.snap != null) box.style.setProperty("--fx-snap", `${+options.snap}s`);
    if (options.idle != null) box.style.setProperty("--fx-idle", String(+options.idle));
    box.innerHTML = KEYS.map((k) => `<span data-corner="${k}"></span>`).join("");
    document.body.append(box);
    const marks = [...box.children];
    let x = -100, y = -100, raf = 0, target = null, inside = false;
    const paint = () => {
      raf = 0;
      const r = target?.isConnected ? target.getBoundingClientRect() : null;
      marks.forEach((m, i) => {
        const left = KEYS[i][1] === "l", top = KEYS[i][0] === "t";
        const px = r ? (left ? r.left - gap : r.right + gap - size) : x + (left ? -12 : 2);
        const py = r ? (top ? r.top - gap : r.bottom + gap - size) : y + (top ? -12 : 2);
        m.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        m.dataset.state = inside ? (r ? "snap" : "idle") : "";
      });
    };
    const ask = () => { raf ||= requestAnimationFrame(paint); };
    const move = (e) => {
      x = e.clientX; y = e.clientY; inside = true;
      const t = e.target instanceof Element ? e.target : null;
      target = null;
      for (const s of targets) { const hit = t?.closest(s); if (hit && root.contains(hit)) { target = hit; break; } }
      ask();
    };
    const out = () => { inside = false; target = null; ask(); };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", out);
    addEventListener("scroll", ask, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", out);
      removeEventListener("scroll", ask);
      box.remove();
    };
  });
})();
