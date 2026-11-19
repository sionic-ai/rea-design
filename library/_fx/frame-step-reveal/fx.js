// 30fps stepped reveal — it doesn’t flow smoothly like a CRT screen but lights one step per frame. The unit lit differs per type (look):
// title·type are text, lines is a mask pushed by a cursor block following the line, count is a number, dither is 4×4 Bayer in four steps.
// Items entering at the same time are delayed 70ms each (max 420ms) and lit in order from the top. If inside a hidden panel (window or tab), wait until it is visible
(() => {
  const FRAME = 1000 / 30, HOT = 2, BRAND = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const running = new Map();
  let tickT = 0;
  const tick = () => {
    tickT = 0;
    for (const [el, job] of running) if (!el.isConnected || job.step()) { job.finish(); running.delete(el); el.classList.remove("is-fx-playing"); el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true })); }
    if (running.size) tickT = setTimeout(tick, FRAME);
  };
  const play = (el, job) => { running.set(el, job); el.classList.remove("is-fx-pending"); el.classList.add("is-fx-playing"); if (!tickT) tickT = setTimeout(tick, FRAME); };

  let masks = null;
  const ditherMasks = () => {
    if (masks) return masks;
    masks = [];
    for (let lv = 1; lv < 5; lv++) {
      const c = document.createElement("canvas");
      c.width = c.height = 12;
      const g = c.getContext("2d");
      if (!g) return (masks = []);
      g.fillStyle = "#000"; /* Not skin: mask alpha — only the black cells show */
      for (let i = 0; i < 16; i++) if (BRAND[i] < (lv / 5) * 16) g.fillRect((i % 4) * 3, Math.floor(i / 4) * 3, 3, 3);
      masks.push(`url(${c.toDataURL()})`);
    }
    return masks;
  };
  const setMask = (el, img, size = "", pos = "") => {
    for (const p of ["", "-webkit-"]) {
      el.style.setProperty(`${p}mask-image`, img);
      el.style.setProperty(`${p}mask-size`, size);
      el.style.setProperty(`${p}mask-position`, pos);
      el.style.setProperty(`${p}mask-repeat`, img && size ? "no-repeat" : "");
    }
  };
  const clearMask = (el) => { for (const k of ["mask-image", "mask-size", "mask-position", "mask-repeat"]) { el.style.removeProperty(k); el.style.removeProperty(`-webkit-${k}`); } };

  // Letters go into cells inside a word chunk (inline-block) — spaces are left as they are so multi-line Korean titles don’t break mid-word
  const splitChars = (el) => {
    const nodes = [], chars = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.nodeValue.trim()) nodes.push(n);
    const undo = [];
    for (const n of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of n.nodeValue.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.className = "fx-rv-w";
        for (const ch of part) { const c = document.createElement("span"); c.className = "fx-rv-c is-off"; c.textContent = ch; chars.push(c); w.append(c); }
        frag.append(w);
      }
      const holder = document.createElement("span");
      holder.className = "fx-rv-t";
      holder.append(frag);
      n.replaceWith(holder);
      undo.push(() => holder.replaceWith(n));
    }
    return { chars, undo: () => undo.forEach((f) => f()) };
  };

  const charJob = (el, look, o) => {
    const { chars, undo } = splitChars(el);
    const per = +(o.per ?? (look === "title" ? 22 : 34)), cap = +(o.cap ?? (look === "title" ? 620 : 520));
    const total = Math.min(cap, Math.max(180, chars.length * per)), frames = Math.max(1, Math.round(total / FRAME));
    let f = 0, shown = 0, cooled = 0;
    const hist = [0];
    return {
      step() {
        f++;
        const n = Math.min(chars.length, Math.ceil((f / frames) * chars.length));
        for (let i = shown; i < n; i++) chars[i].classList.replace("is-off", "is-hot");
        shown = n;
        hist.push(n);
        const cool = hist[f - HOT] ?? 0;
        for (let i = cooled; i < cool; i++) chars[i].classList.remove("is-hot");
        cooled = Math.max(cooled, cool);
        return cooled >= chars.length;
      },
      finish: undo,
    };
  };

  const lineRects = (el) => {
    const box = el.getBoundingClientRect(), r = document.createRange(), out = [];
    r.selectNodeContents(el);
    for (const c of r.getClientRects()) {
      if (c.width < 0.5 || c.height < 0.5) continue;
      const top = c.top - box.top, row = out.find((x) => Math.abs(x.top - top) < x.height * 0.5);
      if (row) { row.left = Math.min(row.left, c.left - box.left); row.right = Math.max(row.right, c.right - box.left); row.height = Math.max(row.height, c.height); }
      else out.push({ top, height: c.height, left: c.left - box.left, right: c.right - box.left });
    }
    return out.sort((a, b) => a.top - b.top);
  };

  const linesJob = (el, o) => {
    const rows = lineRects(el);
    if (!rows.length) return { step: () => true, finish() {} };
    const width = el.getBoundingClientRect().width;
    const caret = document.createElement("span");
    caret.className = "fx-rv-caret";
    caret.setAttribute("aria-hidden", "true");
    const pos = el.style.position;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.append(caret);
    const dur = Math.min(+(o.cap ?? 720), +(o.base ?? 110) + rows.length * +(o.per ?? 95)), frames = Math.max(rows.length, Math.round(dur / FRAME));
    const len = rows.reduce((s, r) => s + (r.right - r.left), 0);
    let f = 0;
    const paint = (p) => {
      let left = p * len, i = 0;
      while (i < rows.length - 1 && left > rows[i].right - rows[i].left) { left -= rows[i].right - rows[i].left; i++; }
      const row = rows[i], cw = row.height * 0.42, x = row.left + Math.min(left, row.right - row.left);
      setMask(el, "linear-gradient(#000,#000),linear-gradient(#000,#000)", `${width + 2}px ${Math.max(0, row.top)}px, ${x + cw}px ${row.height}px`, `0 0, 0 ${row.top}px`); /* Not skin: cover alpha */
      caret.style.cssText = `left:${x}px;top:${row.top + row.height * 0.14}px;width:${cw}px;height:${row.height * 0.72}px`;
    };
    paint(0);
    return {
      step() { f++; if (f >= frames) return true; paint(f / frames); return false; },
      finish() { caret.remove(); clearMask(el); el.style.position = pos; },
    };
  };

  const countJob = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = null, m = null;
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if ((m = /\d+/.exec(n.nodeValue))) { node = n; break; }
    if (!node) return { step: () => true, finish() {} };
    const text = node.nodeValue, to = Number(m[0]), head = text.slice(0, m.index), tail = text.slice(m.index + m[0].length), w = m[0].length;
    const frames = Math.max(4, Math.min(16, to));
    let f = 0;
    const set = (v) => (node.nodeValue = `${head}${String(v).padStart(w, " ")}${tail}`);
    set(0);
    return { step() { f++; if (f >= frames) return true; set(Math.round((f / frames) * to)); return false; }, finish() { node.nodeValue = text; } };
  };

  const ditherJob = (el, o) => {
    const ms = ditherMasks();
    if (!ms.length) return { step: () => true, finish() {} };
    const hold = Math.max(1, +(o.hold || 2));
    let f = 0;
    setMask(el, ms[0]);
    return { step() { f++; const lv = Math.floor(f / hold); if (lv >= ms.length) return true; setMask(el, ms[lv]); return false; }, finish() { clearMask(el); } };
  };

  const jobFor = (el, look, o) => (look === "lines" ? linesJob(el, o) : look === "count" ? countJob(el) : look === "dither" ? ditherJob(el, o) : charJob(el, look, o));

  // Items entering the same frame are delayed 70ms each from the top (max 420ms) — the order the original assigns per IntersectionObserver batch
  let batch = [], batchT = 0;
  const flush = () => {
    batchT = 0;
    batch.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
    batch.forEach((b, i) => b.go(Math.min(i * 70, 420)));
    batch = [];
  };
  const queue = (el, go) => { batch.push({ el, go }); if (!batchT) batchT = requestAnimationFrame(flush); };

  // The element itself is visibility: hidden while waiting, so only ancestors are checked — if inside a hidden or dimmed panel (opacity multiplier under .6), it’s not ready yet
  const seen = (el) => {
    let a = 1;
    for (let p = el.parentElement; p && a > 0; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === "none" || s.visibility === "hidden") return false; a *= +s.opacity; }
    return a >= 0.6;
  };

  kfFx.register("frame-step-reveal", (el, { options, reduce }) => {
    const look = options.look || "title";
    if (reduce) return;
    const ownDelay = options.delay != null ? +options.delay * 1000 : null;
    let timer = 0, poll = 0, done = false, inView = false;
    const pend = () => { if (look === "dither") setMask(el, ditherMasks()[0] || ""); else el.classList.add("is-fx-pending"); };
    const start = (wait) => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!el.isConnected || running.has(el)) return; if (look === "dither") clearMask(el); play(el, jobFor(el, look, options)); }, ownDelay ?? wait);
    };
    const tryStart = () => {
      clearTimeout(poll);
      if (done || !inView) return;
      if (!seen(el)) { poll = setTimeout(tryStart, 100); return; }
      done = true;
      queue(el, start);
    };
    const io = new IntersectionObserver((es) => {
      for (const e of es) { inView = e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= 90); tryStart(); }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    const replay = () => {
      const job = running.get(el);
      if (job) { job.finish(); running.delete(el); }
      clearTimeout(timer); done = false; pend(); tryStart();
    };
    pend();
    if (options.on === "load") { inView = true; tryStart(); } else io.observe(el);
    el.addEventListener("fx:replay", replay);
    return () => {
      io.disconnect(); clearTimeout(timer); clearTimeout(poll);
      el.removeEventListener("fx:replay", replay);
      const job = running.get(el);
      if (job) { job.finish(); running.delete(el); }
      el.classList.remove("is-fx-pending", "is-fx-playing");
      clearMask(el);
    };
  });
})();
