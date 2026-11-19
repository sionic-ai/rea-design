// First page scenes: hero → portrait entrance · chronicle year roll · spiral section · three-line title slide · decorative text stretch · letter fit · person of the year row
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => matchMedia("(max-width: 767px)").matches;
  const mm = gsap.matchMedia();

  // ── With the Hero pinned (1 screen), the cream section fills and covers along cell boundaries, and the portrait panel also pins for .6 screen while the frame·name shrink from full screen into place.
  //    Pull the portrait section up by the height left below the hero so the two overlap (original data-hero-pin · data-portrait-pin) ──
  const INTRO = { hero: 1, portrait: 0.6 };
  function portraitIntro() {
    const hero = document.querySelector("[data-hero]");
    const sec = document.querySelector(".dy-portrait");
    const layout = sec?.querySelector("[data-portrait]");
    if (!hero || !layout) return;
    const comp = layout.querySelector(".dy-portrait__composition");
    const frame = layout.querySelector("[data-portrait-frame]");
    const scene = frame.querySelector(".dy-portrait__scene");
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const pull = () => Math.max(0, hero.offsetHeight - innerHeight);
      sec.style.marginTop = `${-pull()}px`;
      sec.style.zIndex = 2;
      const pins = [
        ScrollTrigger.create({ trigger: hero, start: "top top", end: () => `+=${innerHeight * INTRO.hero}`, pin: true, pinSpacing: false, invalidateOnRefresh: true, onRefresh: () => (sec.style.marginTop = `${-pull()}px`) }),
        ScrollTrigger.create({ trigger: layout, start: "top top", end: () => `+=${innerHeight * INTRO.portrait}`, pin: true, pinSpacing: true }),
      ];
      const startScale = () => Math.max((innerHeight * 0.92) / frame.offsetHeight, (innerWidth * 0.55) / frame.offsetWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: () => `+=${innerHeight * (1 + INTRO.portrait)}`, scrub: true, invalidateOnRefresh: true } });
      tl.fromTo(comp, { scale: startScale }, { scale: 1, ease: "power1.inOut", duration: 1 }, 0)
        .fromTo(scene, { opacity: 1 }, { opacity: 0, ease: "none", duration: 0.3 }, 0.45)
        .fromTo(layout.querySelectorAll(".dy-portrait__label, .dy-portrait__era"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.04 }, 0.75);
      return () => { sec.style.zIndex = ""; sec.style.marginTop = ""; pins.forEach((p) => p.kill()); };
    });
  }

  // ── Chronicle: the left plate descends along the cell’s center line, and the year rolls per digit at each scroll position ──
  const TL = { settle: 0.6, inertia: 0.45, stagger: 0.12, inertiaEase: "power3.out", snapDelay: 0.3, snapDuration: 0.6, snapEase: "power2.inOut", eraDuration: 0.6, eraEase: "power3.inOut", fastSpeed: 12 };
  // The period name moves up and out on the changing year, and the next name rises from below
  function eraSwapper(eraEl, change) {
    let eraSwap = null;
    if (eraEl && eraEl.dataset.eraNext && eraEl.dataset.eraNext !== eraEl.textContent.trim()) {
      const cur = eraEl.textContent.trim();
      eraEl.textContent = "";
      const m = document.createElement("span"); m.className = "dy-tl__era-mask";
      const a = document.createElement("span"); a.className = "dy-tl__era-text"; a.textContent = cur;
      const b = document.createElement("span"); b.className = "dy-tl__era-text"; b.textContent = eraEl.dataset.eraNext;
      m.append(a, b); eraEl.appendChild(m);
      gsap.set(b, { yPercent: 110 });
      let on = false;
      eraSwap = (year) => {
        const want = year >= change;
        if (want === on) return;
        on = want;
        gsap.to(a, { yPercent: want ? -110 : 0, duration: reduce ? 0 : TL.eraDuration, ease: TL.eraEase, overwrite: true });
        gsap.to(b, { yPercent: want ? 0 : 110, duration: reduce ? 0 : TL.eraDuration, ease: TL.eraEase, overwrite: true });
      };
    }
    return eraSwap;
  }

  function yearRoll(layout) {
    const yearEl = layout.querySelector("[data-tl-year]");
    const mover = layout.querySelector("[data-tl-mover]");
    const eraEl = layout.querySelector("[data-tl-era]");
    const from = +layout.dataset.yearFrom, to = +layout.dataset.yearTo, change = +layout.dataset.eraChange;
    const digits = String(from).length;
    // On phone the year is written lying sideways — swap the text directly instead of a digit roller (the original phone uses a light change)
    if (phone()) {
      let shownYear = from;
      yearEl.textContent = String(from);
      const swapEra = eraSwapper(eraEl, change);
      if (reduce) return;
      ScrollTrigger.create({ trigger: layout, start: "top center", end: "bottom center", onUpdate: (st) => {
        const y = Math.round(from + (to - from) * st.progress);
        if (y === shownYear) return;
        shownYear = y;
        yearEl.textContent = String(y);
        gsap.fromTo(yearEl, { opacity: 0.4 }, { opacity: 1, duration: 0.35, ease: "power2.out", overwrite: true });
        swapEra?.(y);
      } });
      mover.style.position = "sticky";
      mover.style.top = `calc(50vh - ${mover.offsetHeight / 2}px)`;
      return;
    }
    yearEl.textContent = "";
    yearEl.setAttribute("aria-label", String(from));
    const rollers = [];
    for (let i = 0; i < digits; i++) {
      const mask = document.createElement("span");
      mask.className = "dy-tl__digit-mask";
      const ghost = document.createElement("span");
      ghost.className = "dy-tl__digit-ghost";
      ghost.textContent = "0";
      const roller = document.createElement("span");
      roller.className = "dy-tl__digit-roller";
      roller.setAttribute("aria-hidden", "true");
      for (let d = 0; d <= 10; d++) { const c = document.createElement("span"); c.className = "dy-tl__digit-cell"; c.textContent = String(d % 10); roller.appendChild(c); }
      mask.append(ghost, roller);
      yearEl.appendChild(mask);
      rollers.push(roller);
    }
    const setDigits = (v, motion) => {
      const s = String(Math.floor(v)).padStart(digits, "0");
      rollers.forEach((r, i) => {
        let pos = +s[i];
        if (i === digits - 1) pos += v - Math.floor(v);
        if (!motion) gsap.set(r, { yPercent: (-pos * 100) / 11, xPercent: -50 });
        else gsap.to(r, { yPercent: (-pos * 100) / 11, xPercent: -50, duration: motion.duration, ease: motion.ease, delay: (digits - 1 - i) * (motion.stagger ?? 0), overwrite: true });
      });
    };
    const eraSwap = eraSwapper(eraEl, change);
    setDigits(from);
    if (reduce) return;
    const settleEase = gsap.parseEase("power2.inOut");
    const settle = (v) => { const f = Math.floor(v), t = v - f, k = gsap.utils.clamp(0, 1, (t - (1 - TL.settle)) / TL.settle); return f + settleEase(k); };
    let snapTimer = 0, lastV = from, lastT = performance.now(), speed = 0, shown = from;
    const update = (p) => {
      const v = from + (to - from) * p;
      const now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
      speed += (Math.abs(v - lastV) / dt - speed) * 0.35;
      lastV = v; lastT = now;
      const fast = speed > TL.fastSpeed;
      shown = fast ? Math.round(v) : settle(v);
      setDigits(shown, fast ? { duration: 0.3, ease: "power2.out", stagger: 0.05 } : { duration: TL.inertia, ease: TL.inertiaEase, stagger: TL.stagger });
      eraSwap?.(Math.round(shown));
      yearEl.setAttribute("aria-label", String(Math.round(shown)));
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => { speed = 0; setDigits(Math.round(v), { duration: TL.snapDuration, ease: TL.snapEase, stagger: TL.stagger }); }, Math.max(TL.snapDelay, TL.inertia) * 1000);
    };
    const track = mover.parentElement;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: layout, start: "top center", end: "bottom center", scrub: true, invalidateOnRefresh: true, onUpdate: (st) => update(st.progress) } });
      if (!phone()) tl.fromTo(mover, { y: 0 }, { y: () => track.clientHeight - mover.offsetHeight }, 0);
      else {
        mover.style.position = "sticky";
        mover.style.top = `calc(50vh - ${mover.offsetHeight / 2}px)`;
      }
      return () => { mover.style.position = ""; mover.style.top = ""; };
    });
  }

  // ── Spiral section: pull the title panel up into the previous section and pin it at screen center (pulled up by the pinned length so the document length stays the same),
  //    a blue brush spiral grows from the title center and eats open the cream panel. Above the section’s top edge paints the new color, below it paints the old color where it was eaten less ──
  const SPIRAL = { pin: 0.9, spacing: 0.3, zoom: 0.25, fps: 24 };
  function spiral() {
    const sec = document.querySelector("[data-spiral]");
    const seamEl = document.querySelector('[data-seam="spiral"]');
    if (!sec || !seamEl || !window.dySeam) return;
    const top = sec.querySelector("[data-spiral-centre]");
    const title = top.querySelector(".dy-nomercy__title");
    const parts = top.querySelectorAll(".dy-nomercy__date-part");
    const prev = seamEl.previousElementSibling;
    const canvas = document.createElement("canvas");
    canvas.dataset.spiralCanvas = "";
    canvas.setAttribute("aria-hidden", "true");
    sec.appendChild(canvas);
    const ctx = window.dySeam.makeGL(canvas);
    if (!ctx) { canvas.remove(); return; }
    let colOld = window.dySeam.bgOf(prev), colNew = window.dySeam.bgOf(sec);
    const st = { p: 0, s: 0, frame: -1, drawn: -1 };
    const draw = (now) => {
      const r = top.getBoundingClientRect();
      const secTop = sec.getBoundingClientRect().top;
      const visible = r.top + r.height / 2 < innerHeight * 1.05 && st.s < 0.999 && secTop > -innerHeight;
      canvas.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      const f = Math.floor((now / 1000) * SPIRAL.fps);
      if (f === st.frame && st.drawn === st.s) return;
      st.frame = f; st.drawn = st.s;
      window.dySeam.draw(ctx, {
        w: innerWidth, h: innerHeight, dpr: Math.min(devicePixelRatio || 1, 1.25), vh: innerHeight, mode: "spiral",
        centre: [r.left + r.width / 2, innerHeight - (r.top + r.height / 2)], tip: 0.25 + st.s * 5.2, width: 0.45 + st.s * 2.6, spacing: SPIRAL.spacing,
        seam: innerHeight - secTop, colorNew: colNew, colorOld: colOld, bleed: [2, 2], boil: f * 0.5, seed: 3,
      });
    };
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      colOld = window.dySeam.bgOf(prev); colNew = window.dySeam.bgOf(sec);
      const pinLen = () => innerHeight * SPIRAL.pin;
      sec.style.setProperty("--nm-pull", `${pinLen()}px`);
      const lines = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "dy-line" });
      const pin = ScrollTrigger.create({ trigger: top, start: "center center", end: () => `+=${pinLen()}`, pin: true, pinSpacing: true, invalidateOnRefresh: true, onRefresh: () => sec.style.setProperty("--nm-pull", `${pinLen()}px`) });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: top, start: "center bottom", end: () => `+=${innerHeight / 2 + pinLen()}`, scrub: true, invalidateOnRefresh: true,
          onUpdate: (t) => { st.p = t.progress; },
          onRefresh: (t) => { st.p = t.progress; st.s = t.progress; },
        },
      });
      // The title starts small and grows to full size until it sticks, appearing (.35~.6) as it gets big enough to read
      tl.fromTo(top, { scale: SPIRAL.zoom }, { scale: 1, ease: "power1.in", duration: 1 }, 0)
        .fromTo(top, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.25 }, 0.35)
        .fromTo(lines.lines, { yPercent: 100 }, { yPercent: 0, ease: "power2.out", duration: 0.3, stagger: 0.06 }, 0.2)
        .fromTo(parts[0], { xPercent: 70 }, { xPercent: 0, ease: "power2.inOut", duration: 0.4 }, 0.3)
        .fromTo(parts[1], { xPercent: -70 }, { xPercent: 0, ease: "power2.inOut", duration: 0.4 }, 0.3);
      const tick = () => { st.s += (st.p - st.s) * 0.08; if (Math.abs(st.p - st.s) < 0.0005) st.s = st.p; draw(performance.now()); };
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); pin.kill(); lines.revert(); canvas.style.visibility = "hidden"; sec.style.removeProperty("--nm-pull"); };
    });
    top.classList.add("is-spiral-ready");
  }

  // ── Three-line big title: each line slides up from the bottom of the screen (scrub .8), and the vertical line beside the paragraph grows while the photo above it comes into focus ──
  const SPL = { scrub: 0.8, revealAt: 0.72, reveal: 0.22 };
  function textSplit(sec) {
    const h2s = [...sec.querySelectorAll(".dy-split__h2")];
    const line = sec.querySelector("[data-split-line]");
    const img = sec.querySelector(".dy-split__line-image > *");
    sec.classList.add("is-split-section-ready");
    if (reduce) return;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = h2s.map((h) => SplitText.create(h, { type: "lines", mask: "lines", linesClass: "dy-line" }));
      splits.forEach((s, i) => {
        gsap.fromTo(s.lines, { yPercent: 100 }, { yPercent: 0, ease: "power1.inOut", scrollTrigger: { trigger: h2s[i], start: "top bottom", end: `top ${SPL.revealAt * 100}%`, scrub: SPL.scrub } });
      });
      if (line) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: line.parentElement, start: "top 80%", end: "bottom 60%", scrub: SPL.scrub } });
      if (img) gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", ease: "power1.inOut", scrollTrigger: { trigger: line?.parentElement ?? img, start: "top 55%", end: "top 35%", scrub: SPL.scrub } });
      return () => splits.forEach((s) => s.revert());
    });
  }

  // ── Decorative text: letters spread to the full width between two big words (tied to scroll) ──
  function stretch(el) {
    const s = SplitText.create(el, { type: "chars", charsClass: "dy-char" });
    el.classList.add("is-stretched");
    if (reduce) return;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const spread = () => {
        const w = el.parentElement.clientWidth, chars = s.chars, n = chars.length;
        const total = chars.reduce((a, c) => a + c.offsetWidth, 0);
        const gap = (w - total) / Math.max(1, n - 1);
        let acc = 0;
        const base = el.getBoundingClientRect().left - el.parentElement.getBoundingClientRect().left;
        return chars.map((c) => { const target = acc - (c.offsetLeft); acc += c.offsetWidth + gap; return target - base; });
      };
      let xs = spread();
      const tw = gsap.fromTo(s.chars, { x: 0 }, { x: (i) => xs[i], ease: "power2.inOut", scrollTrigger: { trigger: el.closest(".dy-ww__top"), start: "top 85%", end: "center 45%", scrub: true, invalidateOnRefresh: true, onRefresh: () => (xs = spread()) } });
      return () => tw.scrollTrigger?.kill();
    });
  }

  // ── Text fit: shrink the large lines of the same group to the cell width (never enlarges) ──
  function fitGroup(els) {
    const fit = () => {
      els.forEach((el) => (el.style.fontSize = ""));
      let k = 1;
      els.forEach((el) => {
        const sub = el.closest(".dy-inf__sub");
        const box = sub ? sub.parentElement.clientWidth - (sub.querySelector(".dy-inf__by")?.offsetWidth ?? 0) - (parseFloat(getComputedStyle(sub).columnGap) || 0) : el.clientWidth;
        const ps = el.querySelectorAll("p");
        (ps.length ? [...ps] : [el]).forEach((p) => {
          const r = document.createRange(); r.selectNodeContents(p);
          const w = r.getBoundingClientRect().width;
          if (w > box && box > 0) k = Math.min(k, box / w);
        });
      });
      if (k < 1) els.forEach((el) => (el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * k}px`));
    };
    document.fonts.ready.then(fit);
    addEventListener("resize", fit);
  }

  // ── Person of the Year: right title slides in from the side line by line ──
  function poty(sec) {
    const right = sec.querySelector("[data-poty-right]");
    const s = SplitText.create(right, { type: "lines", linesClass: "dy-poty__line" });
    sec.classList.add("is-poty-ready");
    if (reduce) return;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(s.lines, { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "power2.out", stagger: 0.12, scrollTrigger: { trigger: sec, start: "top 60%", end: "center 55%", scrub: 0.8 } });
    });
  }

  function init() {
    portraitIntro();
    document.querySelectorAll("[data-year-roll]").forEach(yearRoll);
    spiral();
    document.querySelectorAll("[data-split-section]").forEach(textSplit);
    document.querySelectorAll("[data-stretch]").forEach(stretch);
    // Fit as one group per section, with the ‹by Media› name handled separately — so a wide media name doesn’t shrink the big line
    const groups = new Map();
    document.querySelectorAll("[data-fit]").forEach((el) => {
      const key = el.closest(".dy-inf__sub") ?? el.closest("section");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    groups.forEach(fitGroup);
    document.querySelectorAll("[data-poty]").forEach(poty);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
