// Changes weight per character by the distance between cursor and character. Sets font-variation-settings directly on each character —
// If applied only to the parent, var(--wght) is inherited as the value resolved at the parent, so the glyph’s --wght can’t change the weight (the Brand nl copy didn’t move because of this).
(() => {
  kfFx.register("weight-proximity", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
    const rest = num(options.rest, parseFloat(getComputedStyle(el).fontWeight) || 400);
    const near = num(options.near, rest), dur = +(options.dur ?? 0.4);
    // reach: reach distance as a multiple of element width (Brand menu .9) — on short menu words a px radius would reach the neighboring menu
    const reach = num(options.reach, 0);
    let radius = num(options.radius, 400) || 400;
    // curve: smooth — strength via smoothstep (the middle fills faster) · follow — instead of a 0.4s tween, each frame closes a fixed fraction of the remaining gap (Blog .13)
    // axes: "opsz 12 144, SOFT 0 40" — Besides weight, variable axes that change together at the same strength (resting value · near value)
    const smooth = options.curve === "smooth";
    const follow = options.follow != null && options.follow !== "" ? Math.min(1, Math.max(0.01, +options.follow)) : 0;
    const extra = String(options.axes || "").split(",").map((x) => x.trim().split(/\s+/)).filter((a) => a.length === 3 && /^[A-Za-z]{4}$/.test(a[0]))
      .map(([tag, r, n]) => ({ tag, rest: +r, near: +n, prop: `--fx-wp-${tag.toLowerCase()}` }));
    const html = el.innerHTML;
    // Words are wrapped in inline-block chunks and the spaces between are kept — so multi-line Korean titles do not break mid-word
    const wrap = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { wrap(n); continue; }
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement("span");
          w.className = "fx-wp-word";
          for (const ch of part) w.append(Object.assign(document.createElement("span"), { className: "fx-wp-char", textContent: ch }));
          frag.append(w);
        }
        n.replaceWith(frag);
      }
    };
    wrap(el);
    const axes = (c) => {
      const s = getComputedStyle(c).fontVariationSettings;
      const own = ["'wght' var(--wght)", ...extra.map((a) => `'${a.tag}' var(${a.prop})`)];
      const taken = new Set(["wght", ...extra.map((a) => a.tag)]);
      return !s || s === "normal" ? own.join(", ") : [...own, ...s.split(",").map((x) => x.trim()).filter((x) => !taken.has(x.replace(/^["']|["'].*$/g, "").slice(0, 4)))].join(", ");
    };
    const chars = [...el.querySelectorAll(".fx-wp-char")].map((c) => {
      const alt = c.closest('[data-fx-part="alt"]');
      const r = alt ? num(alt.dataset.rest, rest) : rest, n = alt ? num(alt.dataset.near, near) : near;
      c.style.setProperty("--wght", r);
      extra.forEach((a) => c.style.setProperty(a.prop, a.rest));
      c.style.fontVariationSettings = axes(c);
      const quick = (prop) => gsap.quickTo(c, prop, { duration: dur, ease: "power2.out", overwrite: "auto" });
      return { c, rest: r, near: n, last: r, mix: 0, lo: Math.min(r, n), hi: Math.max(r, n), x: 0, y: 0, to: follow ? null : quick("--wght"), ax: follow ? [] : extra.map((a) => quick(a.prop)) };
    });
    if (!chars.length) { el.innerHTML = html; return; }
    const measure = () => {
      if (reach > 0) radius = Math.max(1, el.offsetWidth * reach);
      chars.forEach((o) => { const r = o.c.getBoundingClientRect(); o.x = r.left + r.width / 2 + scrollX; o.y = r.top + r.height / 2 + scrollY; });
    };
    let queued = false;
    const remeasure = () => queued || ((queued = true), requestAnimationFrame(() => ((queued = false), measure())));
    measure();
    // The cursor’s page position is recorded only when it moves — as in the original, scrolling alone leaves that position as is
    let moved = false, mx = 0, my = 0;
    // trusted: true ignores fake pointers fired by script (demo cursor) — so letters don’t thicken on their own during the demo
    const trusted = options.trusted === "true";
    const onMove = (e) => { if (trusted && !e.isTrusted) return; moved = true; mx = e.pageX; my = e.pageY; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("resize", remeasure, { passive: true });
    let width = 0;
    const ro = new ResizeObserver((en) => { const w = en[0]?.contentRect.width ?? 0; if (Math.abs(w - width) >= 2) (width = w), remeasure(); });
    ro.observe(el);
    document.fonts?.ready.then(remeasure);
    const tick = () => {
      if (!moved) return;
      for (const o of chars) {
        const d = Math.hypot(mx - o.x, my - o.y);
        let t = d >= radius ? 0 : 1 - d / radius;
        if (smooth) t = t * t * (3 - 2 * t);
        if (follow) {
          const m = o.mix + (t - o.mix) * follow;
          if (Math.abs(m - o.mix) < 0.0005 && Math.abs(t - o.mix) < 0.001) continue;
          o.mix = m;
          // If the rounded weight is unchanged, it is not written again — writing the same value every frame piles up style changes as many as the letters
          const wv = (o.rest + (o.near - o.rest) * m).toFixed(0);
          if (wv === o.wv && !extra.length) continue;
          o.wv = wv;
          o.c.style.setProperty("--wght", wv);
          extra.forEach((a) => o.c.style.setProperty(a.prop, (a.rest + (a.near - a.rest) * m).toFixed(0)));
          continue;
        }
        const w = Math.min(o.hi, Math.max(o.lo, o.rest + (o.near - o.rest) * t));
        if (Math.abs(w - o.last) < 1) continue;
        o.last = w;
        o.to(w);
        extra.forEach((a, i) => o.ax[i](a.rest + (a.near - a.rest) * t));
      }
    };
    // steps: "1 .7 .4 .15" — Instead of distance, it counts how many letters away from the letter nearest the cursor (Brand first title: three letters on each side, .2s on enter · out .4s on return)
    const steps = String(options.steps || "").split(/[\s,]+/).filter(Boolean).map(Number).filter(Number.isFinite);
    if (steps.length) {
      const inDur = dur, outDur = +(options.out ?? dur), ease = kfFx.ease(options.ease || "0.8,0.1,0.21,0.72", "power2.inOut");
      let lastIdx = -1;
      const set = (o, w, d) => { if (Math.round(o.last) === Math.round(w)) return; o.last = w; gsap.to(o.c, { "--wght": w, duration: d, ease, overwrite: true }); };
      const onHover = (e) => {
        let idx = -1, best = Infinity;
        chars.forEach((o, i) => { const r = o.c.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); if (d < best) (best = d), (idx = i); });
        if (idx === lastIdx) return;
        lastIdx = idx;
        chars.forEach((o, i) => { const k = Math.abs(i - idx); k < steps.length ? set(o, o.rest + (o.near - o.rest) * steps[k], inDur) : set(o, o.rest, outDur); });
      };
      const onOut = () => { lastIdx = -1; chars.forEach((o) => set(o, o.rest, outDur)); };
      el.addEventListener("pointermove", onHover, { passive: true });
      el.addEventListener("pointerleave", onOut, { passive: true });
      removeEventListener("pointermove", onMove);
      return () => {
        el.removeEventListener("pointermove", onHover);
        el.removeEventListener("pointerleave", onOut);
        removeEventListener("resize", remeasure);
        ro.disconnect();
        chars.forEach((o) => gsap.killTweensOf(o.c));
        el.innerHTML = html;
      };
    }
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", remeasure);
      ro.disconnect();
      chars.forEach((o) => gsap.killTweensOf(o.c));
      el.innerHTML = html;
    };
  });
})();
