// Covers the name with mask characters (X), and when resolved (is-resolved on the element) goes letter by letter from the front over 2.2s power2.inOut (each letter starts across a .78 span, lasting .22)
// Resolves into its own letters through scrambled letters — scrambled letters change every 55ms. While hidden, if the cursor comes within 8px, energy charges at 9/s (and drains at 2.6/s when it leaves)
// Some letters flicker between their own and scrambled characters. On the fx:swap event (detail.text) the text scrambles for .5s and swaps to the new copy.
(() => {
  const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

  kfFx.register("glyph-redact-resolve", (el, { options, reduce, hover }) => {
    const word = options.word || el.getAttribute("data-word") || "";
    if (!word && !el.textContent.trim()) return;
    const mask = (options.mask || "X").slice(0, 1);
    const pool = Array.from(new Set(Array.from(options.pool || word.replace(/\s/g, "") + "#/+×")));
    const tickMs = +(options.tick ?? 55), spread = +(options.spread ?? 0.78), width = +(options.width ?? 0.22);
    const dur = +(options.dur ?? 2.2), swapDur = +(options["swap-dur"] ?? 0.5);
    const before = el.textContent;
    const chars = Array.from(word);
    const n = chars.length;
    const scrambled = (c, k) => (Math.random() < k * 0.55 ? c : pick(pool));
    const write = (t) => { if (el.textContent !== t) el.textContent = t; };
    let resolve = 0, hoverTarget = 0, energy = 0, lastTick = 0, lastFrame = 0, raf = 0, tween = null, stopSwap = null;
    const glyphs = chars.map(() => mask);
    if (n) write(mask.repeat(n));

    const render = (now) => {
      raf = 0;
      const dt = lastFrame ? Math.min(0.1, Math.max(0.001, (now - lastFrame) / 1000)) : 1 / 60;
      lastFrame = now;
      const rate = hoverTarget > energy ? 9 : 2.6;
      energy += (hoverTarget - energy) * (1 - Math.exp(-rate * dt));
      if (energy < 0.002) energy = 0;
      const step = now - lastTick >= tickMs;
      if (step) lastTick = now;
      let busy = energy > 0 || hoverTarget > 0;
      for (let i = 0; i < n; i++) {
        const k = (resolve - (i / n) * spread) / width;
        if (k >= 1) { glyphs[i] = chars[i]; continue; }
        if (k > 0) { busy = true; if (step) glyphs[i] = scrambled(chars[i], k); continue; }
        if (energy > 0) {
          if (step) { const r = Math.random(); glyphs[i] = r < energy * 0.08 ? chars[i] : r < energy * 0.42 ? scrambled(chars[i], 0) : mask; }
          continue;
        }
        glyphs[i] = mask;
      }
      write(glyphs.join(""));
      if (busy) wake();
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(render); };

    const setResolve = (v) => {
      resolve = Math.min(1, Math.max(0, v));
      if (reduce) { const c = Math.floor(resolve * n + 1e-4); write(word.slice(0, c) + mask.repeat(n - c)); return; }
      wake();
    };

    const onMove = (e) => {
      const cs = getComputedStyle(el);
      let on = 0;
      if (parseFloat(cs.opacity) >= 0.2 && cs.visibility !== "hidden") {
        const r = el.getBoundingClientRect();
        on = +(e.clientX >= r.left - 8 && e.clientX <= r.right + 8 && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8);
      }
      if (on !== hoverTarget) { hoverTarget = on; wake(); }
    };
    if (n && hover && !reduce) window.addEventListener("pointermove", onMove, { passive: true });

    const sync = () => {
      if (!n) return;
      const want = el.classList.contains("is-resolved") ? 1 : 0;
      if (tween && tween.vars.data === want) return;
      tween?.kill();
      if (reduce) { setResolve(want); return; }
      const o = { v: resolve };
      tween = gsap.to(o, { v: want, duration: dur, ease: "power2.inOut", data: want, onUpdate: () => setResolve(o.v) });
    };
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    if (options.on === "load") el.classList.add("is-resolved");
    sync();

    // When switching to other text — each character settles at (i/length)·.78+.22
    const onSwap = (ev) => {
      const text = String(ev.detail?.text ?? "");
      stopSwap?.();
      if (reduce) { el.textContent = text; return; }
      const to = Array.from(text), t0 = performance.now();
      let last = 0, id = 0;
      const frame = (now) => {
        const r = Math.min(1, (now - t0) / (swapDur * 1000));
        if (now - last >= tickMs || r === 1) {
          last = now;
          el.textContent = to.map((c, i) => { const at = (i / to.length) * spread + width; return c === " " || r >= at ? c : scrambled(c, Math.max(0, (r - at + width) / width)); }).join("");
        }
        if (r < 1) id = requestAnimationFrame(frame);
      };
      id = requestAnimationFrame(frame);
      stopSwap = () => cancelAnimationFrame(id);
    };
    el.addEventListener("fx:swap", onSwap);

    return () => {
      cancelAnimationFrame(raf);
      stopSwap?.();
      tween?.kill();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("fx:swap", onSwap);
      el.textContent = before;
    };
  });
})();
