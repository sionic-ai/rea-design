/* Motion shared by all pages: smooth scroll, marquee, scroll ladder, expanding dialog, logo burst */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  gsap.registerPlugin(ScrollTrigger);

  // The original uses Lenis defaults as they are (lerp .1, wheel multiplier 1)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Marquee: base 42px per second, adding .11x the scroll speed (px/s) up to 320. It follows at .24 when speeding up and .055 when slowing down (at 60fps)
  function marquee(root) {
    const track = root.querySelector(".vb-marquee__track");
    const first = track && track.firstElementChild;
    if (!track || !first || reduce) return;
    let w = first.getBoundingClientRect().width;
    new ResizeObserver(() => { w = first.getBoundingClientRect().width; }).observe(first);
    let raf = 0, last = 0, y = scrollY, x = 0, boost = 0;
    const step = (now) => {
      raf = requestAnimationFrame(step);
      const dt = last ? Math.min(64, Math.max(1, now - last)) : 1000 / 60;
      last = now;
      const sy = scrollY, speed = (1000 / dt) * Math.abs(sy - y);
      y = sy;
      const want = Math.min(320, 0.11 * speed), k = want > boost ? 0.24 : 0.055;
      boost += (want - boost) * (1 - Math.pow(1 - k, dt / (1000 / 60)));
      x += (dt / 1000) * (42 + boost);
      if (w > 0) x %= w;
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) { last = 0; y = scrollY; raf = requestAnimationFrame(step); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(root);
  }
  document.querySelectorAll(".vb-marquee").forEach(marquee);

  // Ladder: the needle goes 0→164px, and 21 ticks ripple in width 1→.45→1 across a range of progress i×5% ±15% (original scroll-timeline contain range)
  function ladder(el) {
    const section = el.closest("[data-ladder-section]");
    if (!section) return;
    const needle = el.querySelector(".vb-ladder__needle");
    const rungs = [...el.querySelectorAll("[data-i]")];
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const paint = (p) => {
      if (needle) needle.style.transform = `translateY(${164 * p}px)`;
      for (const r of rungs) {
        const i = +r.dataset.i, a = i * 0.05 - 0.15, t = clamp01((p - a) / 0.3);
        const s = t < 0.5 ? 1 - 0.55 * ease(t * 2) : 0.45 + 0.55 * ease((t - 0.5) * 2);
        r.style.transform = `scaleX(${s.toFixed(3)})`;
      }
    };
    if (reduce) return paint(0);
    ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom", onUpdate: (st) => paint(st.progress), onRefresh: (st) => paint(st.progress) });
    paint(0);
  }
  // Only browsers without CSS scroll timeline paint it with JS
  const cssTimeline = window.CSS && CSS.supports("animation-timeline: view()");
  if (!cssTimeline) document.querySelectorAll(".vb-ladder").forEach(ladder);

  // Expanding dialog: write the pressed spot’s position, size and corners into --from-*, then set data-state on the next frame=open, removed 460ms after closing
  const MORPH = 460;
  const focusable = 'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';
  function morph(template, origin, opts = {}) {
    const frag = template.content.cloneNode(true);
    const scrim = frag.querySelector(".vb-scrim"), panel = frag.querySelector(".vb-morph");
    const measure = () => {
      const r = origin.getBoundingClientRect();
      panel.style.setProperty("--from-top", `${r.top}px`);
      panel.style.setProperty("--from-right", `${document.documentElement.clientWidth - r.right}px`);
      panel.style.setProperty("--from-w", `${r.width}px`);
      panel.style.setProperty("--from-h", `${r.height}px`);
      panel.style.setProperty("--from-radius", getComputedStyle(origin).borderRadius);
    };
    measure();
    document.body.append(frag);
    if (lenis) lenis.stop(); else document.documentElement.style.overflow = "hidden";
    origin.setAttribute("aria-expanded", "true");
    opts.onOpen && opts.onOpen(panel);
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.dataset.state = panel.dataset.state = "open"; }));
    const t = setTimeout(() => { const f = panel.querySelector("input, [data-autofocus]"); f && f.focus(); }, MORPH * 0.6);
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const list = [...panel.querySelectorAll(focusable)].filter((n) => n.offsetParent !== null);
      if (!list.length) return;
      const a = list[0], b = list[list.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === a || !panel.contains(cur))) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && cur === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener("keydown", key);
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(t);
      measure();
      scrim.dataset.state = panel.dataset.state = "closed";
      document.removeEventListener("keydown", key);
      origin.setAttribute("aria-expanded", "false");
      opts.onClose && opts.onClose();
      setTimeout(() => {
        scrim.remove(); panel.remove();
        if (lenis) lenis.start(); else document.documentElement.style.overflow = "";
        origin.focus({ preventScroll: true });
      }, reduce ? 0 : MORPH);
    }
    scrim.addEventListener("click", close);
    panel.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
    return { panel, close };
  }

  // Waitlist form: don’t submit, just switch to the ”You’re on the list” step
  function waitlistForm(panel) {
    const form = panel.querySelector("form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const done = panel.querySelector("template[data-done]");
      const middle = panel.querySelector(".vb-morph__middle");
      if (done && middle) { middle.replaceChildren(done.content.cloneNode(true)); }
      panel.querySelector(".vb-morph__perks")?.remove();
      panel.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => panel.querySelector(".vb-morph__close")?.click()));
    });
  }

  // Feature list board: pressing the table of contents slides the description cell to that spot, and scrolling the description lights up the currently visible group and feature in the table of contents
  function sheetNav(panel) {
    const sc = panel.querySelector("[data-sheet-scroller]");
    if (!sc) return;
    const groups = [...panel.querySelectorAll(".vb-sheet__group")], feats = [...sc.querySelectorAll(".vb-sheet__feature")], secs = [...panel.querySelectorAll(".vb-sheet__section")];
    panel.querySelectorAll("[data-sheet-go]").forEach((b) => b.addEventListener("click", () => {
      const t = sc.querySelector(`#${b.dataset.sheetGo}`);
      if (t) sc.scrollTo({ top: t.offsetTop - 65, behavior: reduce ? "auto" : "smooth" });
    }));
    // Positions are measured relative to the scroll inside the panel — offsetTop is relative to the nearest positioned parent in the phone layout, so a feature other than the first would be switched on
    const at = (el) => el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    const mark = () => {
      const top = sc.scrollTop + 120;
      let gi = 0, fi = 0;
      [...sc.querySelectorAll(".vb-sheet__copy")].forEach((g, i) => { if (at(g) <= top) gi = i; });
      feats.forEach((f, i) => { if (at(f) <= top) fi = i; });
      groups.forEach((g, i) => (i === gi ? g.setAttribute("data-active", "") : g.removeAttribute("data-active")));
      feats.forEach((f, i) => (i === fi ? f.setAttribute("data-active", "") : f.removeAttribute("data-active")));
      secs.forEach((s, i) => (i === fi ? s.setAttribute("aria-current", "true") : s.removeAttribute("aria-current")));
    };
    sc.addEventListener("scroll", mark, { passive: true });
    mark();
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-morph]");
    if (!b) return;
    const tpl = document.getElementById(b.dataset.morph);
    if (!tpl) return;
    e.preventDefault();
    const from = b.dataset.morphFrom ? b.closest(b.dataset.morphFrom) || b : b;
    // The original hides the card only when opening the waitlist — the video keeps the card and grows from a still frame
    const card = b.hasAttribute("data-morph-hide") ? b.closest("[data-morph-host]") : null;
    if (card) card.dataset.dialogOpen = "true";
    morph(tpl, from, { onOpen: (p) => { waitlistForm(p); sheetNav(p); }, onClose: () => { if (card) delete card.dataset.dialogOpen; } });
  });

  // Logo burst: the curtain covers at 240ms → tile pieces spread out and fall over 4 seconds. When called from the form, the thank-you text appears at 3.72s and stays for 1.5s
  const T = { burst: 4000, veilIn: 240, outroDelay: 3720, outroIn: 600, outroHold: 1500, outroOut: 700 };
  function burst({ ghost, outro, onCovered, onEnd } = {}) {
    const el = document.createElement("div");
    el.className = "vb-burst" + (outro ? " vb-burst--hold" : "");
    el.dataset.phase = "burst";
    el.style.cssText = `--burst-duration:${T.burst}ms;--outro-delay:${T.outroDelay}ms;--outro-in:${T.outroIn}ms;--outro-out:${T.outroOut}ms`;
    const cv = document.createElement("canvas");
    el.append(cv);
    if (ghost) {
      const g = ghost.node;
      g.classList.add("vb-burst__ghost");
      if (ghost.early) g.classList.add("vb-burst__ghost--early");
      Object.assign(g.style, { top: `${ghost.rect.top}px`, left: `${ghost.rect.left}px`, width: `${ghost.rect.width}px`, height: `${ghost.rect.height}px` });
      el.append(g);
    }
    if (outro) {
      const o = document.createElement("div");
      o.className = "vb-burst__outro";
      o.setAttribute("role", "status");
      o.innerHTML = `<p class="vb-burst__title">${outro.title}</p><p class="vb-burst__note">${outro.note}</p>`;
      el.append(o);
    }
    document.body.append(el);
    const stop = burstCanvas(cv, ghost ? ghost.rect : null, T.burst);
    const timers = [setTimeout(() => onCovered && onCovered(), T.veilIn)];
    const end = () => { stop(); el.remove(); onEnd && onEnd(); };
    if (outro) {
      const n = T.outroDelay + T.outroIn + T.outroHold;
      timers.push(setTimeout(() => { el.dataset.phase = "leaving"; }, n), setTimeout(end, n + T.outroOut));
    } else timers.push(setTimeout(end, T.burst + 100));
  }

  // Pieces are accent and secondary color tiles — they burst outward from the center spinning, then are pulled down by gravity and fade
  function burstCanvas(cv, rect, dur) {
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const pick = ["--kf-accent", "--site-blurple", "--site-sage", "--site-ochre", "--site-rose", "--kf-bg"].map((v) => css.getPropertyValue(v).trim() || "currentColor");
    const cx = rect ? rect.left + rect.width / 2 : W / 2, cy = rect ? rect.top + rect.height / 2 : H / 2;
    const parts = Array.from({ length: 140 }, (_, i) => {
      const a = Math.random() * Math.PI * 2, sp = 260 + Math.random() * 900;
      return { x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 260, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 9, s: 8 + Math.random() * 26, c: pick[i % pick.length], d: Math.random() * 0.35 };
    });
    let raf = 0, t0 = 0, last = 0;
    const draw = (now) => {
      if (!t0) t0 = last = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (t < p.d) continue;
        p.vy += 900 * dt; p.vx *= 0.992; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        const life = clamp01(1 - (t - p.d) / (dur / 1000 - p.d));
        ctx.save(); ctx.globalAlpha = life; ctx.fillStyle = p.c; ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.beginPath(); ctx.roundRect(-p.s / 2, -p.s / 2, p.s, p.s, p.s * 0.24); ctx.fill(); ctx.restore();
      }
      if (t * 1000 < dur) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }

  window.vb = { lenis, reduce, clamp01, morph, burst, cssTimeline };
})();
