// Draws an alpha video clip on the canvas — loops the default clip during idle-after, plays one of the rest clips once, then returns to the default.
// Points where the image is painted (alpha > Only over alpha) the finger cursor and fx:hover apply, and on press (or Enter · Space) the press clip plays once and fx:open fires when passing the open-at share
(() => {
  kfFx.register("alpha-clip-canvas", (el, { options, reduce }) => {
    if (el.tagName !== "CANVAS" || !options.loop && !options.still) return;
    const g2d = el.getContext("2d", { willReadFrequently: true });
    const list = (v) => (v || "").split(",").map((s) => s.trim()).filter(Boolean);
    const clip = (src, preload) => {
      const v = document.createElement("video");
      Object.assign(v, { src, muted: true, defaultMuted: true, playsInline: true, preload });
      v.load();
      return v;
    };
    const after = +(options["idle-after"] ?? 17000), alpha = +(options.alpha ?? 10), openAt = +(options["open-at"] ?? 0.5), gap = +(options.gap ?? 100);
    const base = options.loop ? clip(options.loop, "auto") : null;
    const idles = list(options.idles).map((s) => clip(s, "metadata"));
    const still = options.still ? Object.assign(new Image(), { src: options.still }) : null;
    const press = options.click ? clip(options.click, "metadata") : null;
    const isVideo = (m) => m && m.tagName === "VIDEO";
    const ready = (m) => (isVideo(m) ? m.readyState >= 2 : m.complete && m.naturalWidth > 0);
    let cur = still || base, raf = 0, since = performance.now(), lastMove = 0, opened = false, waiting = false;
    const swap = (m) => {
      if (isVideo(cur)) { cur.pause(); cur.currentTime = 0; }
      cur = m;
      if (isVideo(m)) { m.currentTime = 0; m.play().catch(() => {}); }
    };
    const baseReady = () => (base && base.readyState >= 2 ? base : null);
    const pickNext = () => {
      if (cur !== base) { since = performance.now(); return baseReady(); }
      if (performance.now() - since < after) return baseReady();
      const ok = idles.filter((v) => v.readyState >= 2);
      return ok.length ? ok[Math.floor(Math.random() * ok.length)] : baseReady();
    };
    // Screen points to canvas points (cover-fill scale) — if the canvas can’t be read, as with file://, inside a board it is shown as a picture
    const onFigure = (e) => {
      if (!el.width) return false;
      const r = el.getBoundingClientRect(), k = Math.max(r.width / el.width, r.height / el.height);
      const x = Math.round((e.clientX - r.left - (r.width - el.width * k) / 2) / k), y = Math.round((e.clientY - r.top - (r.height - el.height * k) / 2) / k);
      if (x < 0 || y < 0 || x >= el.width || y >= el.height) return false;
      try { return g2d.getImageData(x, y, 1, 1).data[3] > alpha; } catch { return true; }
    };
    const fire = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    const pick = () => {
      if (!press || cur === press || waiting) return;
      if (press.readyState < 2) { press.preload = "auto"; press.load(); waiting = true; return; }
      swap(press);
      el.style.cursor = "";
      el.classList.remove("is-hit");
      fire("fx:pick");
    };
    const onClick = (e) => { if (onFigure(e)) pick(); };
    const onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } };
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastMove < gap) return;
      lastMove = now;
      const hit = !!press && onFigure(e) && cur !== press && !waiting;
      if (hit === el.classList.contains("is-hit")) return;
      el.classList.toggle("is-hit", hit);
      el.style.cursor = hit ? "pointer" : "";
      fire(hit ? "fx:hover" : "fx:leave");
    };
    const onLeave = () => { if (el.classList.contains("is-hit")) { el.classList.remove("is-hit"); el.style.cursor = ""; fire("fx:leave"); } };
    const frame = () => {
      if (ready(cur)) {
        const w = isVideo(cur) ? cur.videoWidth : cur.naturalWidth, h = isVideo(cur) ? cur.videoHeight : cur.naturalHeight;
        if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
        g2d.clearRect(0, 0, w, h);
        g2d.drawImage(cur, 0, 0, w, h);
      }
      if (cur && cur.ended && cur !== press) swap(pickNext() || cur);
      if (waiting && press.readyState >= 2) { waiting = false; pick(); }
      if (cur === press && !opened && Number.isFinite(press.duration) && press.duration > 0 && press.currentTime / press.duration >= openAt) { opened = true; fire("fx:open"); }
      if (isVideo(cur) && cur.paused && !cur.ended && !reduce) cur.play().catch(() => {});
      raf = requestAnimationFrame(frame);
    };
    if (base) base.addEventListener("playing", () => [...idles, press].filter(Boolean).forEach((v) => { v.preload = "auto"; v.load(); }), { once: true });
    if (!el.hasAttribute("tabindex") && press) el.tabIndex = 0;
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    if (isVideo(cur) && !reduce) cur.play().catch(() => {});
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.classList.remove("is-hit");
      el.style.cursor = "";
      [base, ...idles, press].filter(Boolean).forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); });
    };
  });
})();
