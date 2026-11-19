// First page — work stage: above 1024 wide and 600 tall it stays attached to the screen (number of works × 1.6 screens, scrub) and each work plays a timeline worth 4 cells —
// blueprint lines .75s power2.inOut → labels .45s → dimensions fade at .2 → make lines·cutter·fill·labels·typing → at 2s the real screen sweeps in from the left (.9s power3.inOut, with a sweeping line) → ends at 3.
// Between works: previous text up 24px·.6s power2.in, previous image .97x·.7s, new text 32px below .8s power3.out (after .45), new image 1.03x .9s (after .35). The number is pushed up and swapped (.2s/.45s),
// The Plot·Build·Live bars fill up, and each picture’s interaction reaction (flip · rename · ridge drag · visit) turns on with the cursor label once past 2.85. The width below is scrubbed when visible in each work.
(() => {
  const PG = (window.PG = window.PG || {});
  PG.pages = PG.pages || {};
  const STEP = 4, LIVE = 2.85, GLYPHS = "01<>/_#*+=-xyz";

  const plot = (item) => {
    const q = (s) => [...item.querySelectorAll(s)];
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } });
    const per = (n, total) => total / Math.max(n, 1);
    const moves = q("[data-b-move]"), off = moves.length ? 0.5 : 0, k = moves.length ? 0.6 : 1;
    const draw = q("[data-p-draw]");
    if (draw.length) tl.fromTo(draw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, stagger: per(draw.length, 0.3), ease: "power2.inOut" }, 0);
    const ins = q("[data-p-in]");
    if (ins.length) tl.fromTo(ins, { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: per(ins.length, 0.5) }, 0.1);
    const dims = q("[data-b-dim]");
    if (dims.length) tl.fromTo(dims, { opacity: 1 }, { opacity: 0.2, duration: 0.6, immediateRender: false }, 0.9);
    const bd = q("[data-b-draw]");
    if (bd.length) tl.fromTo(bd, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: "power2.inOut" }, 0.95);
    q("[data-b-clip]").forEach((r) => tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: r.getAttribute("width") || 0 }, duration: 0.9 * k, ease: "power2.inOut" }, 1 + off));
    const wipes = q("[data-b-wipe]");
    if (wipes.length) tl.fromTo(wipes, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.6 * k, stagger: per(wipes.length, 0.35 * k), ease: "power2.inOut" }, 1.05 + off);
    const bin = q("[data-b-in]");
    if (bin.length) tl.fromTo(bin, { opacity: 0 }, { opacity: 1, duration: 0.5 * k, stagger: per(bin.length, 0.4 * k) }, 1.15 + off);
    q("[data-b-type]").forEach((t, i) => {
      const text = t.dataset.bType || "", s = { v: 0 };
      t.textContent = "";
      tl.to(s, { v: 1, duration: 0.6, ease: "none", onUpdate: () => { const n = Math.floor(s.v * text.length); t.textContent = s.v >= 1 ? text : text.slice(0, n) + (s.v > 0 ? "▌" : ""); } }, 1.3 + off + i * 0.12);
    });
    q("[data-live-img]").forEach((e) => tl.fromTo(e, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power3.inOut" }, 2));
    q("[data-live-clip]").forEach((e) => tl.fromTo(e, { attr: { width: 0 } }, { attr: { width: 800 }, duration: 0.9, ease: "power3.inOut" }, 2));
    q("[data-live-scan]").forEach((e) => tl.fromTo(e, { x: 0 }, { x: 800, duration: 0.9, ease: "power3.inOut" }, 2).fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, 2).to(e, { opacity: 0, duration: 0.15 }, 2.8));
    tl.set({}, {}, 3);
    return tl;
  };
  const scramble = (node, text) => {
    const s = { v: 0 };
    return gsap.to(s, { v: 1, duration: 0.45, ease: "none", onUpdate: () => { const n = Math.floor(s.v * text.length); let tail = ""; for (let i = 0; i < Math.min(3, text.length - n); i++) tail += GLYPHS[(Math.random() * GLYPHS.length) | 0]; node.textContent = text.slice(0, n) + tail; }, onComplete: () => { node.textContent = text; } });
  };
  // Interaction response per work item
  const slider = (item) => {
    const track = item.querySelector("[data-ws-track]"), bar = item.querySelector("[data-ws-progress]"), counter = item.querySelector("[data-ws-counter]"), btn = item.querySelector("[data-ws-try]"), art = item.querySelector(".ws__art");
    if (!track || !btn || !art) return () => {};
    let i = 0, x0 = null;
    const step = (d) => {
      i = (i + d + 3) % 3;
      gsap.to(track, { x: -800 * i, duration: 1, ease: "expo.inOut", overwrite: true });
      if (bar) gsap.to(bar, { attr: { width: 73.3 * (i + 1) }, duration: 0.6, ease: "power3.out" });
      if (counter) counter.textContent = `0${i + 1} / 03`;
    };
    const down = (e) => { x0 = e.clientX; };
    const up = (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; step(dx > 30 ? -1 : 1); };
    const next = () => step(1);
    btn.addEventListener("click", next); art.addEventListener("pointerdown", down); art.addEventListener("pointerup", up);
    return () => { btn.removeEventListener("click", next); art.removeEventListener("pointerdown", down); art.removeEventListener("pointerup", up); };
  };
  const SHOTS = [["front", "Product from the front,", "on a light backdrop", "1"], ["detail", "Close-up of the finish,", "as the page describes it", "2"], ["in-use", "The product in use,", "in its real context", "3"]];
  const rename = (item) => {
    const btn = item.querySelector("[data-ws-try]"), art = item.querySelector(".ws__art"), photo = item.querySelector("[data-ws-photo]");
    const f = (k) => item.querySelector(`[data-ws-f="${k}"]`);
    if (!btn || !art || !photo) return () => {};
    let i = 0;
    const go = () => {
      i = (i + 1) % SHOTS.length;
      const [view, a0, a1, tint] = SHOTS[i];
      gsap.timeline().to(photo, { opacity: 0, duration: 0.2 }).add(() => photo.setAttribute("class", `tint-${tint}`)).to(photo, { opacity: 1, duration: 0.35 });
      [["was", `IMG_04${12 + i}.jpg`], ["name", `keyword-product-${view}.jpg`], ["alt0", a0], ["alt1", a1]].forEach(([k, v], n) => { const el = f(k); if (el) gsap.delayedCall(n * 0.12, () => scramble(el, v)); });
    };
    btn.addEventListener("click", go); art.addEventListener("click", go);
    return () => { btn.removeEventListener("click", go); art.removeEventListener("click", go); };
  };
  // Nine ridge layers — peaks shift toward the cursor’s horizontal position and rise with its vertical position (.8s power3.out)
  const ridges = (peak = 560, lift = 1) => Array.from({ length: 9 }, (_, r) => {
    let d = "";
    for (let x = 0; x <= 800; x += 20) {
      const y = 330 + r * 16 - Math.exp(-((x - peak) ** 2) / 9000) * (90 - r * 6) * lift + Math.sin(x / 60 + r) * 4;
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    return d;
  });
  const hill = (item) => {
    const art = item.querySelector(".ws__art"), paths = [...item.querySelectorAll("[data-ws-hill]")];
    if (!art || !paths.length) return () => {};
    const s = { x: 560, lift: 1 };
    const paint = () => ridges(s.x, s.lift).forEach((d, i) => paths[i]?.setAttribute("d", d));
    paint();
    if (!matchMedia("(pointer: fine)").matches) return () => {};
    const tx = gsap.quickTo(s, "x", { duration: 0.8, ease: "power3.out", onUpdate: paint }), tl = gsap.quickTo(s, "lift", { duration: 0.8, ease: "power3.out", onUpdate: paint });
    const mv = (e) => { const r = art.getBoundingClientRect(); tx(((e.clientX - r.left) / r.width) * 800); tl(1.6 - ((e.clientY - r.top) / r.height) * 0.8); };
    const lv = () => { tx(560); tl(1); };
    art.addEventListener("pointermove", mv); art.addEventListener("pointerleave", lv);
    return () => { art.removeEventListener("pointermove", mv); art.removeEventListener("pointerleave", lv); };
  };
  const visit = (item) => {
    const art = item.querySelector(".ws__art"), url = item.dataset.wsUrl;
    if (!art || !url || !matchMedia("(pointer: fine)").matches) return () => {};
    const go = () => { if (art.dataset.cursor) PG.go(url); };
    art.addEventListener("click", go);
    return () => art.removeEventListener("click", go);
  };
  const KIND = { slider: { run: slider, cursor: "drag ↔" }, rename: { run: rename, cursor: "rename ↻" }, hill: { run: hill, cursor: "move the hill" } };
  const kindOf = (item) => (item.dataset.wsUrl ? { run: visit, cursor: "visit ↗" } : KIND[item.dataset.wsItem]);

  const stage = (scope) => {
    const ws = scope.querySelector("[data-work-stage]");
    if (!ws) return () => {};
    const items = [...ws.querySelectorAll("[data-ws-item]")], arts = items.map((i) => i.querySelector(".ws__art"));
    const label = (i, on) => { const a = arts[i], c = kindOf(items[i])?.cursor; if (!a || !c) return; on ? (a.dataset.cursor = c) : delete a.dataset.cursor; };
    const offs = items.map((it) => kindOf(it)?.run(it) || (() => {}));
    ws.querySelectorAll("[data-ws-try]").forEach((b) => { b.hidden = false; });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((it) => plot(it).progress(1)); return () => offs.forEach((f) => f()); }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (min-height: 600px)", () => {
      ws.classList.add("is-pinned");
      const n = items.length, num = ws.querySelector("[data-ws-n]"), stages = [...ws.querySelectorAll("[data-ws-stage]")], dots = [...ws.querySelectorAll("[data-ws-dot]")];
      const pairs = items.map((it) => [it.querySelector(".ws__text"), it.querySelector(".ws__art")]);
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 88;
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      items.forEach((it, i) => {
        const p = plot(it);
        p.paused(false);
        tl.add(p, i * STEP);
        if (i > 0) {
          const [t0, a0] = pairs[i - 1], [t1, a1] = pairs[i], at = i * STEP - 0.8;
          tl.fromTo(t0, { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.6, ease: "power2.in", immediateRender: false }, at)
            .fromTo(a0, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.97, duration: 0.7, ease: "power2.inOut", immediateRender: false }, at)
            .fromTo(t1, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, at + 0.45)
            .fromTo(a1, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, at + 0.35);
        }
      });
      tl.set({}, {}, (n - 1) * STEP + 3.6);
      const total = tl.duration();
      let cur = -1, stageOn = -1;
      const update = (t) => {
        const idx = Math.min(n - 1, Math.max(0, Math.floor((t + 0.3) / STEP))), a = gsap.utils.clamp(0, 3, t - idx * STEP);
        if (idx !== cur) {
          items.forEach((it, i) => it.toggleAttribute("data-current", i === idx));
          dots.forEach((d, i) => d.toggleAttribute("data-on", i <= idx));
          if (num && cur >= 0) {
            const dir = idx > cur ? 1 : -1;
            gsap.timeline().to(num, { yPercent: -40 * dir, opacity: 0, duration: 0.2, ease: "power2.in", overwrite: true }).add(() => { num.textContent = String(idx + 1).padStart(2, "0"); }).fromTo(num, { yPercent: 40 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
          }
          cur = idx;
        }
        const s = Math.min(2, Math.floor(a));
        stages.forEach((st, i) => st.style.setProperty("--p", String(gsap.utils.clamp(0, 1, a - i))));
        if (s !== stageOn) { stages.forEach((st, i) => st.toggleAttribute("data-on", i === s)); stageOn = s; }
        items.forEach((_, i) => label(i, i === idx && a >= LIVE));
      };
      const st = ScrollTrigger.create({ trigger: ws, start: `top top+=${pad}`, end: () => `+=${innerHeight * 1.6 * n}`, pin: true, scrub: true, animation: tl, onUpdate: (self) => update(self.progress * total) });
      update(0);
      const focus = (e) => { const i = items.findIndex((it) => it.contains(e.target)); if (i < 0 || i === cur) return; const y = st.start + ((i * STEP + 3) / total) * (st.end - st.start); PG.lenis ? PG.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); };
      ws.addEventListener("focusin", focus);
      return () => { ws.removeEventListener("focusin", focus); ws.classList.remove("is-pinned"); items.forEach((it, i) => { it.removeAttribute("data-current"); label(i, false); }); };
    });
    mm.add("(max-width: 1023.98px), (max-height: 599.98px)", () => {
      items.forEach((it, i) => ScrollTrigger.create({ trigger: arts[i] || it, start: "top 85%", end: "bottom 30%", scrub: true, animation: plot(it), onUpdate: (self) => label(i, self.progress > 0.95) }));
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => { mm.revert(); offs.forEach((f) => f()); ws.querySelectorAll("[data-ws-try]").forEach((b) => { b.hidden = true; }); };
  };

  PG.pages.home = { mount: (scope) => {
    let off = () => {}, dead = false;
    const go = () => { if (!dead) off = stage(scope); };
    // Like the original, builds the stage in idle time (requestIdleCallback) — measures positions after the fonts have settled
    document.fonts.ready.then(() => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 200)));
    return () => { dead = true; off(); };
  } };
})();
