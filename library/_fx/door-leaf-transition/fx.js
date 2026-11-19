// Door-closing page transition — closes the door at the clicked link and navigates, and on the next page draws the closed door as soon as the part file loads, then opens it.
// Run the timeline (track) directly with rAF — so the door stays fully closed even if GSAP stops right before navigation
(() => {
  const KEY = "fx-door-leaf";
  const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  const E = {
    lin: (t) => t, p1in: (t) => t * t, p2in: (t) => t * t * t, p2out: (t) => 1 - (1 - t) ** 3,
    p2io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    xin: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
    xio: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  };
  let door = null, busy = false;
  function build() {
    if (door) return door;
    const el = document.createElement("div");
    el.className = "fx-door";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="fx-door__light"></div><div class="fx-door__leaf fx-door__leaf--a"><span class="fx-door__bar"></span><i class="fx-door__rim"></i></div><div class="fx-door__leaf fx-door__leaf--b"><span class="fx-door__bar"></span><i class="fx-door__rim"></i></div><div class="fx-door__flood"></div><p class="fx-door__label"></p>';
    (document.body || document.documentElement).appendChild(el);
    const q = (s) => el.querySelector(s);
    door = { el, a: q(".fx-door__leaf--a"), b: q(".fx-door__leaf--b"), light: q(".fx-door__light"), flood: q(".fx-door__flood"), rims: el.querySelectorAll(".fx-door__rim"), label: q(".fx-door__label") };
    return door;
  }
  const run = (tracks, total) => new Promise((res) => {
    const t0 = performance.now();
    const tick = (now) => {
      const t = (now - t0) / 1000;
      for (const k of tracks) {
        if (t < k.at || k.done) continue;
        const p = k.dur > 0 ? Math.min(1, (t - k.at) / k.dur) : 1;
        k.set(k.from + (k.to - k.from) * k.ease(p));
        if (p >= 1) k.done = true;
      }
      t < total ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });
  function close(k) {
    const d = door, w = innerWidth, off = (1 - k) * (w / 2 + 2), lw = Math.max(0, w * (1 - k));
    d.a.style.transform = `translateX(${-off}px)`;
    d.b.style.transform = `translateX(${off}px)`;
    d.light.style.width = lw + "px";
    d.light.style.transform = `translateX(${-lw / 2}px)`;
  }
  const op = (el) => (v) => { el.style.opacity = v; };
  const rim = (v) => door.rims.forEach((r) => { r.style.opacity = v; });

  function leave(href, name, o) {
    if (busy) return;
    busy = true;
    const d = build();
    const go = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), open: +(o.open ?? 1) })); } catch {} location.href = href; };
    const safety = setTimeout(go, 3000 + +(o.close ?? 0.8) * 1000);
    const finish = () => { clearTimeout(safety); requestAnimationFrame(() => requestAnimationFrame(go)); };
    d.label.textContent = "";
    d.label.style.transform = "";
    const chars = [...String(name || "")].map((c) => { const s = document.createElement("span"); s.className = "fx-door__char"; s.textContent = c === " " ? " " : c; d.label.appendChild(s); return s; });
    d.el.classList.add("is-active");
    const shut = +(o.close ?? 0.8);
    if (reduceMq.matches || shut <= 0) {
      close(1); d.label.style.opacity = 1; d.el.style.opacity = 0;
      run([{ at: 0, dur: 0.2, ease: E.lin, from: 0, to: 1, set: op(d.el) }], 0.67).then(finish);
      return;
    }
    const k = shut / 0.8, each = +(o.each ?? 0.05);
    op(d.light)(0); rim(0); op(d.flood)(0); close(0); d.label.style.opacity = 1; d.el.style.opacity = "";
    chars.forEach((c) => { c.style.opacity = 0; c.style.transform = "translateY(0.25em)"; });
    const tracks = [
      { at: 0, dur: 0.8 * k, ease: E.xin, from: 0, to: 1, set: close },
      { at: 0, dur: 0.8 * k, ease: E.p2in, from: 0, to: 0.85, set: op(d.light) },
      { at: 0.3 * k, dur: 0.5 * k, ease: E.p2in, from: 0, to: 1, set: rim },
      { at: 0.8 * k, dur: 0.09 * k, ease: E.p2out, from: 1, to: 0.994, set: close },
      { at: 0.89 * k, dur: 0.16 * k, ease: E.p2in, from: 0.994, to: 1, set: close },
      { at: 0.86 * k, dur: 0.3 * k, ease: E.p1in, from: 0.85, to: 0, set: op(d.light) },
      { at: 0.86 * k, dur: 0.3 * k, ease: E.p1in, from: 1, to: 0, set: rim },
    ];
    const a0 = 0.78 * k;
    chars.forEach((c, i) => tracks.push({ at: a0 + i * each, dur: 0.28, ease: E.p2out, from: 0, to: 1, set: (v) => { c.style.opacity = v; c.style.transform = `translateY(${(1 - v) * 0.25}em)`; } }));
    const out = Math.max(1.16 * k, a0 + Math.max(0, chars.length - 1) * each + 0.28) + 0.12;
    tracks.push({ at: out, dur: 0.3, ease: E.p2in, from: 1, to: 0, set: (v) => { d.label.style.opacity = v; d.label.style.transform = `translate(-50%, calc(-50% - ${(1 - v) * 0.3}em))`; } });
    run(tracks, out + 0.42).then(finish);
  }

  function enter(openDur) {
    const d = build();
    d.label.style.opacity = 0;
    close(1); op(d.light)(0); rim(0); op(d.flood)(0);
    d.el.style.opacity = 1;
    d.el.classList.add("is-active");
    const done = () => { d.el.classList.remove("is-active"); d.el.style.opacity = ""; busy = false; };
    if (reduceMq.matches || openDur <= 0) { run([{ at: 0, dur: 0.2, ease: E.lin, from: 1, to: 0, set: op(d.el) }], 0.2).then(done); return; }
    const k = openDur;
    run([
      { at: 0, dur: 0.2, ease: E.p2out, from: 0, to: 1, set: rim },
      { at: 0.1, dur: 0.2, ease: E.lin, from: 0, to: 1, set: op(d.light) },
      { at: 0.12, dur: 1 * k, ease: E.xio, from: 1, to: 0, set: close },
      { at: 0.45 * k, dur: 0.4 * k, ease: E.lin, from: 1, to: 0, set: rim },
      { at: 0.4 * k, dur: 0.45 * k, ease: E.p1in, from: 1, to: 0, set: op(d.light) },
      { at: 0.22 * k, dur: 0.32 * k, ease: E.p2out, from: 0, to: 0.72, set: op(d.flood) },
      { at: 0.54 * k, dur: 0.75 * k, ease: E.p2io, from: 0.72, to: 0, set: op(d.flood) },
    ], 0.12 + 1.3 * k).then(done);
  }

  // Incoming page — draws a closed door as soon as the part file loads, opens when the document is fully loaded
  let arrived = null;
  try { arrived = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); } catch {}
  if (arrived && Date.now() - arrived.t < 5000) {
    const start = () => {
      build(); close(1); door.el.style.opacity = 1; door.el.classList.add("is-active");
      const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
      Promise.race([loaded, new Promise((r) => setTimeout(r, 3500))]).then(() => requestAnimationFrame(() => enter(+arrived.open || 1)));
    };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start, { once: true });
  }
  addEventListener("pageshow", (e) => { if (e.persisted && door) { door.el.classList.remove("is-active"); busy = false; } });

  kfFx.register("door-leaf-transition", (el, { options }) => {
    const onClick = (e) => {
      const a = el.closest("a[href]") || el.querySelector?.("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      leave(url.href, options.name || a.dataset.name || a.textContent.trim(), options);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  });
})();
