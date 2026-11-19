// First page motion — values read from the original bundle (curves, lengths and gaps are in the comments). The path-following calculation was rewritten as our own.
(() => {
  const { reduce, mobile, motion } = OW;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vh = () => innerHeight;
  const vw = () => innerWidth;

  // Reads an SVG path as pixel coordinates relative to its box — t(0~1) → point · tangent, and the nearest t to a point
  const sampler = (path, box) => {
    const svg = path.ownerSVGElement, vb = svg.viewBox.baseVal, L = path.getTotalLength();
    const frame = () => { const r = svg.getBoundingClientRect(), b = box.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, sx: r.width / vb.width, sy: r.height / vb.height }; };
    let f = frame();
    const at = (t) => { const p = path.getPointAtLength(gsap.utils.clamp(0, 1, t) * L); return { x: f.x + p.x * f.sx, y: f.y + p.y * f.sy }; };
    at.tangent = (t) => { const a = at(Math.max(0, t - 0.005)), b = at(Math.min(1, t + 0.005)), dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1; return { x: dx / m, y: dy / m }; };
    at.closest = (x, y, t0 = 0, t1 = 1) => { let best = t0, bd = Infinity; for (let i = 0; i <= 240; i++) { const t = t0 + (t1 - t0) * (i / 240), p = at(t), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = t; } } return best; };
    at.reframe = () => { f = frame(); };
    return at;
  };
  const centerIn = (el, box) => { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }; };
  // Original getPhaseOneArcSegment: the i-th segment when [0, span] is divided into n segments
  const arcSeg = (i, n, span) => ({ startT: (span / n) * i, endT: (span / n) * (i + 1) });

  // ── Hero title size: the longest line is 85% of the screen width, and the total height stays within 85% of the screen (same fitting rule as the original) ──
  const title = $(".ow-hero__title");
  const lines = $$(".ow-hero__line > span");
  const fitTitle = () => {
    title.style.fontSize = "100px";
    const w = Math.max(...lines.map((l) => { l.style.display = "inline-block"; const x = l.offsetWidth; l.style.display = ""; return x; }));
    let size = (100 * vw() * 0.85) / w;
    title.style.fontSize = size + "px";
    const cap = 0.85 * vh();
    if (title.scrollHeight > cap) { size *= cap / title.scrollHeight; title.style.fontSize = size + "px"; }
  };
  fitTitle();
  addEventListener("resize", fitTitle);
  document.addEventListener("ow:fonts", fitTitle);

  const p1 = $$(".ow-hero__p1 > *"), p2 = $$(".ow-hero__p2 > *"), p3 = $$(".ow-hero__p3 > *");
  const pin = $(".ow-hero__pin"), runway = $(".ow-hero__runway");
  const path1 = sampler($(".ow-hero__path--1 path"), pin);
  const path2 = sampler($(".ow-hero__path--2 path"), runway);
  // Second and third groups sit at spots on the curve (second: curve .6~1, third: the whole second curve)
  const placeOn = (items, smp, t0, t1) => items.forEach((el, r) => { const t = t0 + (items.length > 1 ? r / (items.length - 1) : 0) * (t1 - t0), p = smp(t); gsap.set(el, { left: p.x - el.offsetWidth / 2, top: p.y - el.offsetHeight / 2 }); el.dataset.t = t; });
  const layout = () => { path1.reframe(); path2.reframe(); placeOn(p2, path1, 0.6, 1); placeOn(p3, path2, 0, 1); };
  layout();
  ScrollTrigger.addEventListener("refreshInit", () => { gsap.set([...p1, ...p2, ...p3], { clearProps: "translate" }); });

  // ── Photo Scatter ──
  const scatter = $(".ow-scatter__inner");
  const sItems = $$(".ow-scatter__item", scatter);
  const sPath = sampler($(".ow-scatter__path path"), scatter);

  // ── Circular orbit angles: evenly split angles mixed with fixed jitter, and neighbors that sit too close are spread apart ──
  const ringAngles = (n, jitter = 0.05, minGap = 0.2, seed = 5) => {
    const step = (2 * Math.PI) / n, out = [];
    const rnd = (k) => { const s = 1e4 * Math.sin(k); return s - Math.floor(s); };
    for (let i = 0; i < n; i++) { const even = i * step, wild = 2 * rnd(seed + i) * Math.PI; out.push(even + (wild - even) * jitter); }
    out.sort((a, b) => a - b);
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < n - 1; i++) { const g = out[i + 1] - out[i]; if (g < minGap) { const d = (minGap - g) / 2; out[i] -= d; out[i + 1] += d; } }
    return out.map((a) => 2 * Math.PI + a);
  };

  const mm = gsap.matchMedia();

  const start = () => {
    // Lottie in the photo stage, cards and photo rows stands as a still image even when motion is reduced
    if (reduce) {
      $$(".ow-lottie").forEach((h) => { const c = OW.chart(h); c?.set(1); });
      gsap.set(lines, { opacity: 1 });
      gsap.set([...p1, ...p2, ...p3, ...sItems], { autoAlpha: 1, scale: 1 });
      $$(".ow-circle__item").forEach((el) => gsap.set(el, { opacity: 1, scale: 1 }));
      gsap.set(".ow-feature__image", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".ow-feature__item", { autoAlpha: 1 });
      return;
    }

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const isMobile = mobile();

      // ── 01 Hero ──
      // Entrance (after loader): lines go from yPercent 50 · 5° at .15 intervals .5 power1.out, photo pieces from the cell above the curve into place .7 power3.out (stagger total .7)
      gsap.set(lines, { yPercent: 50, opacity: 0, rotation: 5, transformOrigin: "0% 100%" });
      gsap.set(p1, { scale: 0, opacity: 0 });
      const enter = () => {
        const n = p1.length, tl = gsap.timeline();
        p1.forEach((el, i) => { const { startT, endT } = arcSeg(i, n, 0.5), a = path1(startT), b = path1(endT); gsap.set(el, { x: a.x - b.x, y: a.y - b.y }); });
        tl.to(lines, { yPercent: 0, opacity: 1, rotation: 0, stagger: 0.15, duration: 0.5, ease: "power1.out" })
          .to(p1, { stagger: { amount: 0.7 }, x: 0, y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" });
      };
      OW.ready ? enter() : document.addEventListener("ow:ready", enter, { once: true });

      // The title shrinks to .75 and fades while the Hero center goes from 90% of the screen to the top (scrub .5)
      gsap.fromTo(title, { scale: 1, opacity: 1 }, { scale: 0.75, opacity: 0, ease: "none", transformOrigin: "50% 50%", force3D: true, scrollTrigger: { trigger: ".ow-hero", start: "center 90%", end: "center top", scrub: 0.5 } });
      // Hero board is pinned only for half a screen (no spacer)
      ScrollTrigger.create({ trigger: pin, start: "top top", end: "bottom center", pin: true, pinSpacing: false, onToggle: (s) => { OW.heroPinned = s.isActive; } });
      // Flow: the first group slides along the curve to the next cell while shrinking (.8 power2.inOut, .2 stagger), the second and third groups pop out 15vw away along the tangent (1 power2.out, .5 stagger)
      const flow = gsap.timeline({ scrollTrigger: { trigger: ".ow-hero", start: "top top", end: () => (isMobile ? "bottom 25%" : "bottom center"), scrub: 0.1, invalidateOnRefresh: true } });
      const n = p1.length;
      p1.forEach((el, i) => {
        const proxy = { p: 0 };
        let l = 0, end = 0, base = null;
        flow.to(proxy, {
          p: 1, duration: 0.8, ease: "power2.inOut", immediateRender: false,
          onUpdate() {
            if (!base) { const c = centerIn(el, pin); l = path1.closest(c.x - (gsap.getProperty(el, "x") || 0), c.y - (gsap.getProperty(el, "y") || 0), 0, 0.6); const { startT, endT } = arcSeg(i, n + 1, 0.6); end = Math.min(0.6, l + (endT - startT)); base = path1(l); }
            const pt = path1(l + (end - l) * proxy.p);
            gsap.set(el, { x: pt.x - base.x, y: pt.y - base.y, scale: 1 - proxy.p, opacity: Math.max(0, 1 - Math.max(0, (proxy.p - 0.6) / 0.4)) });
          },
        }, 0.2 * i);
      });
      const pops = (at, smp, items) => items.forEach((el, r) => {
        const t = +el.dataset.t, tg = smp.tangent(t), d = 0.15 * vw();
        flow.set(el, { visibility: "visible" }, at + 0.5 * r);
        flow.fromTo(el, { x: () => -tg.x * d, y: () => -tg.y * d, scale: 0, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out", immediateRender: false }, at + 0.5 * r);
      });
      const b = 0.8 + (n - 1) * 0.2 - 0.3;
      p1.forEach((el, i) => flow.set(el, { zIndex: -(i + 1) }, b));
      pops(b, path1, p2);
      const y3 = b + (p2.length - 1) * 0.5 + 1 + 1.5;
      pops(y3, path2, p3);
      // Everything is pushed another 20vw along its own tangent (separate timeline, ends with the hero’s bottom edge at the very top)
      const drift = gsap.timeline({ scrollTrigger: { trigger: ".ow-hero", start: "top top", end: "bottom top", scrub: 0.1, invalidateOnRefresh: true } });
      const dur = flow.duration();
      const push = (list, at) => { if (!list.length) return; const pr = { p: 0 }; drift.to(pr, { p: 1, duration: dur, ease: "none", onUpdate: () => { const d = 0.2 * vw(); list.forEach(({ el, tg }) => { el.style.translate = `${tg.x * d * pr.p}px ${tg.y * d * pr.p}px`; }); } }, at); };
      push(p1.map((el, i) => ({ el, tg: path1.tangent(arcSeg(i, n, 0.6).endT) })), 0);
      push(p2.map((el) => ({ el, tg: path1.tangent(+el.dataset.t) })), b);
      push(p3.map((el) => ({ el, tg: path2.tangent(+el.dataset.t) })), y3);

      // ── 02 Circular trajectory: circle fixed at center for 3 screens (scrub .1) — pieces enter from .3 radians ahead of their own angle (1 power2.out, .5 spacing) and spin opposite to the circle,
      //    Past 180° of the circle the background turns to yellowed paper, and at the end it scatters, growing 1.4x with double the radius (2 power2.in) ──
      const circle = $(".ow-circle"), ring = $(".ow-circle__ring"), items = $$(".ow-circle__item");
      const ang = ringAngles(items.length);
      const geo = () => ({ cx: ring.offsetWidth / 2, cy: ring.offsetHeight / 2, r: 0.42 * Math.min(ring.offsetWidth, ring.offsetHeight) });
      const ctl = gsap.timeline({ scrollTrigger: { trigger: circle, start: "center center", end: "+=300%", pin: ".ow-circle__inner", scrub: 0.1, invalidateOnRefresh: true } });
      const m = 0.5 * items.length + 1;
      const pos = (el, a) => { const { cx, cy, r } = geo(), w = el.offsetWidth; return { fx: cx + Math.cos(a) * r - w / 2, fy: cy + Math.sin(a) * r - w / 2, sx: cx + Math.cos(a - 0.3) * r - w / 2, sy: cy + Math.sin(a - 0.3) * r - w / 2 }; };
      let theme = "white";
      items.forEach((el, i) => {
        const a = ang[i];
        ctl.set(el, { x: () => pos(el, a).sx, y: () => pos(el, a).sy, scale: 0, opacity: 0, rotation: 0, zIndex: items.length - i }, 0);
        ctl.to(el, { x: () => pos(el, a).fx, y: () => pos(el, a).fy, scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, 0.5 * i);
        ctl.to(el, { rotation: -180, duration: m, ease: "power1.out" }, 0);
      });
      ctl.to(ring, { rotation: 180, duration: m, ease: "power1.out", onUpdate: () => { const r = gsap.getProperty(ring, "rotation"), next = r >= 180 ? "yellow" : "white"; if (next !== theme) { theme = next; OW.setTheme(next); } } }, 0);
      items.forEach((el, i) => {
        const a = ang[i], out = () => { const { cx, cy, r } = geo(), w = el.offsetWidth; return { x: cx + Math.cos(a) * 2 * r - w / 2, y: cy + Math.sin(a) * 2 * r - w / 2 }; };
        ctl.to(el, { x: () => out().x, y: () => out().y, scale: 1.4, opacity: 0, duration: 2, ease: "power2.in" }, m);
      });
      // Text (0~.2) → section title (.3~.9): set up on entering, erased on leaving. Number letters in random order at .1 intervals, 1s back
      const cText = $(".ow-circle__text"), cHead = $(".ow-circle__heading");
      const tLines = OW.splitLines(cText.querySelector("p")).lines;
      const hWords = OW.splitWords(cHead.querySelector("h2")).words;
      const cap = SplitText.create(cHead.querySelector(".t-caption"), { type: "chars" }).chars;
      gsap.set([...tLines, ...hWords, ...cap], { opacity: 0 });
      gsap.set(cText, { yPercent: -250 });
      const on = { text: false, head: false };
      const textIn = () => { gsap.killTweensOf(tLines); gsap.set(tLines, motion.TEXT_FROM); gsap.to(tLines, motion.TEXT_TO); };
      const headIn = () => { gsap.killTweensOf([...hWords, ...cap]); gsap.set(cap, { opacity: 0 }); gsap.to(cap, { opacity: 1, stagger: { each: 0.1, from: "random" }, duration: 1, ease: "back" }); gsap.set(hWords, motion.HEAD_FROM); gsap.to(hWords, motion.HEAD_TO); };
      const out = (els) => { gsap.killTweensOf(els); gsap.to(els, motion.EXIT); };
      const words = gsap.timeline({ scrollTrigger: { trigger: circle, start: "top 40%", end: "bottom bottom", scrub: 0.1 } });
      words.to(cText, { yPercent: 0, duration: 0.1, ease: "none" }, 0).to({}, { duration: 0.8 }, 0.1);
      words.eventCallback("onUpdate", () => {
        const t = words.time(), tOn = t >= 0 && t < 0.2, hOn = t >= 0.3 && t < 0.9;
        if (tOn !== on.text) { on.text = tOn; tOn ? textIn() : out(tLines); }
        if (hOn !== on.head) { on.head = hOn; hOn ? headIn() : out([...hWords, ...cap]); }
      });

      // ── Scatter: pieces pop out 15vw beyond the curve tangent at .5 spacing (1 power2.out, scrub .1), and while the whole panel passes it is pushed 30vw along the tangent.
      //    The center key photo stops before passing the middle of the screen ──
      sPath.reframe();
      const sTl = gsap.timeline({ scrollTrigger: { trigger: scatter, start: "top 80%", end: "bottom 60%", scrub: 0.1, invalidateOnRefresh: true } });
      const sTan = sItems.map((el, i) => sPath.tangent(sItems.length > 1 ? i / (sItems.length - 1) : 0));
      sItems.forEach((el, i) => {
        const d = () => 0.15 * vw();
        sTl.set(el, { visibility: "visible" }, 0.5 * i);
        sTl.fromTo(el, { x: () => -sTan[i].x * d(), y: () => -sTan[i].y * d(), scale: 0, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out", immediateRender: false }, 0.5 * i);
      });
      const key = sItems.findIndex((el) => el.classList.contains("is-key"));
      const keyGap = () => { const el = sItems[key]; if (!el) return null; const r = el.getBoundingClientRect(); return vw() / 2 - (r.left + r.width / 2 - (gsap.getProperty(el, "x") || 0)); };
      const sDrift = { p: 0 };
      gsap.timeline({ scrollTrigger: { trigger: ".ow-scatter", start: "top bottom", end: "bottom top", scrub: 0.1, invalidateOnRefresh: true } })
        .to(sDrift, { p: 1, duration: sTl.duration(), ease: "none", onUpdate: () => {
          const D = 0.3 * vw();
          sItems.forEach((el, i) => {
            let x = sTan[i].x * D * sDrift.p, y = sTan[i].y * D * sDrift.p;
            if (i === key) { const g = keyGap(); if (g !== null && x && Math.sign(x) === Math.sign(g) && Math.abs(x) > Math.abs(g)) { y *= g / x; x = g; } }
            el.style.translate = `${x}px ${y}px`;
          });
        } });

      // ── Photo stage: shared.js OW.cinematic (original cinematic-scroll values). It is a panel with a single beat, so it does not grow on entry (as in the original) ──
      OW.cinematic($(".ow-cine"));

      // ── Photo rows · card chart: drawn while entering ──
      $$(".ow-imgscroll__fig").forEach((fig) => { const h = fig.querySelector(".ow-lottie"); if (h) OW.scrubChart(h, { trigger: fig, start: "top 75%", end: "top 15%" }); });
      $$(".ow-card").forEach((card) => { const h = card.querySelector(".ow-lottie"); if (h) OW.scrubChart(h, { trigger: card, start: "top 80%", end: "top 20%" }); });

      // ── Small floating photos and color pieces: each scrub is .8 / 1.1 / 1.4 for different speeds ──
      $$(".ow-floater").forEach((el, i) => {
        const depth = 0.6 + (i % 3) * 0.35;
        gsap.fromTo(el, { y: () => vh() * 0.18 * depth }, { y: () => -vh() * 0.18 * depth, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.8 + (i % 3) * 0.3, invalidateOnRefresh: true } });
      });

      // ── 06 black band: .8→1 on enter, 1→.8 on exit (scrub .1), pinned for item count × 100%, and the left text changes per cell.
      //    The right photo column rises from below 100vh, and each photo’s border, clipped 25%, opens as it passes the bottom 40% of the screen ──
      const feat = $(".ow-feature"), band = $(".ow-feature__band"), fItems = $$(".ow-feature__item"), fImgs = $$(".ow-feature__image"), col = $(".ow-feature__images");
      gsap.fromTo(band, { scale: 0.8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: feat, start: "top bottom", end: "top center", scrub: 0.1 } });
      let cur = 0;
      const showItem = (i) => { if (i === cur) return; const a = fItems[cur], b2 = fItems[i]; cur = i; gsap.to(a, { autoAlpha: 0, duration: 0.5, ease: "power2.out", overwrite: true }); gsap.to(b2, { autoAlpha: 1, duration: 0.5, ease: "power2.out", overwrite: true }); const ls = b2.querySelectorAll("p, dt, dd, .ow-btn"); gsap.fromTo(ls, motion.TEXT_FROM, { ...motion.TEXT_TO, stagger: 0.06 }); };
      const N = fItems.length;
      ScrollTrigger.create({ trigger: feat, start: "top top", end: `+=${100 * N}%`, pin: true, invalidateOnRefresh: true, onUpdate: (s) => showItem(Math.min(Math.floor(s.progress * N), N - 1)) });
      gsap.fromTo(band, { scale: 1 }, { scale: 0.8, ease: "none", immediateRender: false, scrollTrigger: { trigger: feat, start: "center top", end: "bottom top", scrub: 0.1 } });
      if (!isMobile) {
        gsap.set(fImgs, { clipPath: "inset(25% 25% 25% 25%)" });
        gsap.timeline({ scrollTrigger: { trigger: feat, start: "top 75%", end: `+=${100 * N + 150}%`, scrub: 0.1, invalidateOnRefresh: true, onUpdate: () => { const h = vh(); fImgs.forEach((im) => { const k = (1 - Math.min(1, Math.max(0, (h - im.getBoundingClientRect().top) / (0.4 * h)))) * 25; im.style.clipPath = `inset(${k}% ${k}% ${k}% ${k}%)`; }); } } })
          .fromTo(col, { y: () => vh() }, { y: () => -(col.offsetHeight - vh() * 0.7), ease: "none" });
      }

      // ── 07 Photos above the quote: pop out at .5 intervals from outside the curve tangent (1 power2.out, scrub .1) ──
      const qItems = $$(".ow-quote__item");
      const qTl = gsap.timeline({ scrollTrigger: { trigger: ".ow-quote__imgs", start: "top 80%", end: "bottom 60%", scrub: 0.1 } });
      qItems.forEach((el, i) => qTl.fromTo(el, { x: () => -0.15 * vw() * 0.6, y: () => -0.15 * vw() * 0.8, scale: 0, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, 0.5 * i));
    });
  };

  OW.boot(() => { fitTitle(); layout(); start(); });
})();
