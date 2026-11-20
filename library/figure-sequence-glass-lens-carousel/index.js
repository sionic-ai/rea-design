/* Hero: opening (the person panel opens from below in 1.6s and the button row 1s later), scroll-bound person sequence and panel size, star rotation, text rising in, big sentence being painted, clock */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector(".tk-head"), nav = document.querySelector(".tk-nav"), el = document.querySelector(".tk-seq__el");
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // ── Open ──
  gsap.set(head, { visibility: "visible" });
  if (reduce) { gsap.set(nav, { visibility: "visible", autoAlpha: 1 }); gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" }); }
  else {
    gsap.set(nav, { autoAlpha: 0, visibility: "visible" });
    gsap.timeline({ onComplete: () => window.tkRefresh?.() })
      .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0)
      .to(nav, { autoAlpha: 1, duration: 1, ease: "expo.inOut" }, 1);
  }

  // ── Person sequence — the original swaps dozens of photos to match the scroll position. As a photo slot, we draw a silhouette panel turning its head in the same flow ──
  const cv = document.querySelector(".tk-seq__canvas"), ctx = cv.getContext("2d"), wrap = document.querySelector(".tk-seq");
  const FRAMES = 60; let prog = 0, drawn = -1;
  const paint = () => {
    const k = Math.min(devicePixelRatio || 1, 2), w = Math.max(1, Math.round(el.clientWidth * k)), h = Math.max(1, Math.round(el.clientHeight * k));
    const idx = Math.round(prog * (FRAMES - 1)); if (cv.width === w && cv.height === h && idx === drawn) return;
    cv.width = w; cv.height = h; drawn = idx;
    const t = idx / (FRAMES - 1), acc = css("--kf-accent"), bg = css("--kf-bg"), ink = css("--kf-dim");
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, acc); g.addColorStop(1, bg); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Shoulder·neck·head silhouette — the head turns sideways each frame (the ellipse width shrinks and the nose side shifts) so the light spot changes
    const cx = w * 0.5, turn = Math.sin(t * Math.PI * 1.2 - 0.6);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(cx, h * 1.02, w * 0.55, h * 0.3, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - w * 0.09, h * 0.52, w * 0.18, h * 0.24);
    ctx.beginPath(); ctx.ellipse(cx + turn * w * 0.04, h * 0.42, w * (0.2 - Math.abs(turn) * 0.025), h * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + turn * w * 0.2, h * 0.44, w * 0.03, h * 0.025, 0, 0, Math.PI * 2); ctx.fill();
    const lg = ctx.createRadialGradient(cx - w * 0.25 + turn * w * 0.1, h * 0.3, 0, cx - w * 0.25, h * 0.3, w * 0.45);
    lg.addColorStop(0, css("--kf-accent-soft")); lg.addColorStop(1, "transparent"); ctx.globalAlpha = 0.35; ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    ctx.fillStyle = ink; ctx.font = `500 ${Math.round(12 * k)}px ${css("--kf-font-sans")}`; ctx.textAlign = "center";
    ctx.fillText(`Photo set ${String(idx + 1).padStart(3, "0")} / ${FRAMES}`, cx, h - 18 * k);
  };
  let raf = 0; const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
  new ResizeObserver(later).observe(el);
  if (!reduce) {
    ScrollTrigger.create({ trigger: wrap, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => { prog = s.progress; later(); } });
    gsap.matchMedia().add({ mobile: "(max-width: 767px)", desktop: "(min-width: 768px)" }, (c) => {
      const m = c.conditions.mobile;
      gsap.fromTo(el, { width: m ? "60vw" : "35vw", height: m ? "50vh" : "100vh" }, { width: m ? "90vw" : "25vw", height: m ? "70vh" : "65vh", ease: "none", scrollTrigger: { trigger: wrap, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }
  paint();

  // ── Star — always rotates .2° per frame, spins extra by scroll speed (max ±6), then settles by a .92 factor. Direction also follows scroll direction ──
  const star = document.querySelector(".tk-star");
  if (star && !reduce) {
    const rot = gsap.quickSetter(star, "rotation", "deg"); let a = 0, boost = 0, dir = 1;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { const v = s.getVelocity(); if (Math.abs(v) > 0.1) dir = Math.sign(v); boost = gsap.utils.clamp(-6, 6, boost + v * 0.0008); } });
    gsap.ticker.add((_, dt) => { if (document.hidden) return; const k = Math.min(dt / (1000 / 60), 3); boost *= Math.pow(0.92, k); a = (a + (0.2 * dir + boost) * k) % 360; rot(a); });
  }

  // ── Text rise — inside a line mask, characters rise from 120% below over 1s power4.out, .1s stagger. Scrolling back up hides them again ──
  if (window.SplitText && !reduce) document.querySelectorAll("[data-tk-chars]").forEach((h) => {
    // Line type goes line by line (.12s stagger), otherwise character by character (.1s stagger) — original data-stagger-char="line"
    const line = h.dataset.tkMode === "line";
    SplitText.create(h, { type: line ? "lines" : "lines, chars", mask: "lines", autoSplit: true, onSplit(self) {
      return gsap.timeline({ scrollTrigger: { trigger: h, start: "top 85%", toggleActions: "restart none none reset" } })
        .fromTo(line ? self.lines : self.chars, { yPercent: 120 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: line ? 0.12 : 0.1 }, +h.dataset.tkChars || 0);
    } });
  });

  // ── Painted large sentence — each letter starts faded, and once the scroll position passes it turns orange (.12s power2.out) → its own color (.28s power2.in). Scrolling back fades it in .2s ──
  if (window.SplitText) document.querySelectorAll(".tk-wave").forEach((h) => {
    const end = getComputedStyle(h).color, wave = css("--kf-accent"), start = `color-mix(in srgb, ${css("--kf-ink-soft")} 20%, transparent)`;
    if (reduce) return;
    let done = () => {};
    SplitText.create(h, { type: "words, chars", autoSplit: true, onRevert: () => done(), onSplit(self) {
      done();
      const chars = self.chars, p = { v: 0 }, fx = new Map(); let n = 0;
      gsap.set(chars, { color: start });
      const draw = (now) => {
        const next = Math.round(p.v * chars.length);
        if (now) { fx.forEach((a) => a.kill()); fx.clear(); chars.forEach((c, i) => gsap.set(c, { color: i < next ? end : start })); }
        else for (let i = Math.min(n, next); i < Math.max(n, next); i++) {
          fx.get(i)?.kill();
          fx.set(i, i < next ? gsap.timeline().to(chars[i], { color: wave, duration: 0.12, ease: "power2.out" }).to(chars[i], { color: end, duration: 0.28, ease: "power2.in" }) : gsap.to(chars[i], { color: start, duration: 0.2, ease: "none" }));
        }
        n = next;
      };
      done = () => { fx.forEach((a) => a.kill()); fx.clear(); };
      return gsap.to(p, { v: 1, ease: "none", onUpdate: () => draw(false), scrollTrigger: { trigger: h, start: "top 90%", end: "center 40%", scrub: 0.1, onRefresh: () => draw(true) } });
    } });
  });

  // ── Clock — every time the minute changes ──
  const clock = document.querySelector(".tk-clock");
  if (clock) {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const tick = () => { clock.textContent = `City ${f.format(new Date())}`; setTimeout(tick, 60000 - (Date.now() % 60000) + 20); };
    tick();
  }
})();
