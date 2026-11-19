// Home page scenes: contents rise in the order the loader floor panels pass → lecture cells (open from all sides, parallax) → fixed 4-column grid story
// → giant word interlude (a box drops and knocks the words away, pushes the line, jumps and sits, then becomes the next band) → about table → end screen.
(() => {
  const G = window.G;
  if (!G) return;
  const { Y, px, reduce } = G;
  const clamp = gsap.utils.clamp;
  const range = (a, b, v) => clamp(0, 1, (v - a) / (b - a));
  const ease = (name) => gsap.parseEase(name);
  const lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;

  if (G.isStub()) {
    G.showStub(true);
    addEventListener("resize", () => !G.isStub() && location.reload());
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  ScrollTrigger.clearScrollMemory?.("manual");
  scrollTo(0, 0);
  G.startLenis();

  const fontOf = (el) => getComputedStyle(el).font;
  const ctx = document.createElement("canvas").getContext("2d");
  const metrics = (el, text) => { ctx.font = fontOf(el); return ctx.measureText(text); };

  const splitMasks = (el, cls) => {
    const text = el.textContent;
    el.textContent = "";
    return [...text].map((ch) => {
      const m = document.createElement("span");
      m.className = cls;
      const i = document.createElement("i");
      i.textContent = ch === " " ? " " : ch;
      m.append(i);
      el.append(m);
      return i;
    });
  };

  // ── Contents hero ──
  function intro() {
    const sec = document.querySelector(".g-intro");
    const rulesHost = sec.querySelector(".g-intro__rules");
    const count = Math.ceil((128 + 18 * 56 - 143) / 14) + 8;
    const rules = Array.from({ length: count }, () => rulesHost.appendChild(document.createElement("i")));
    const hint = sec.querySelector(".g-intro__hint");
    const hintLetters = splitMasks(hint, "g-hm");
    const layout = () => {
      const pitch = Math.max(1, Math.round(14 * Y.scale));
      rules.forEach((r, i) => (r.style.top = `${i * pitch}px`));
      const h = hint.getBoundingClientRect().height, m = metrics(hint, hint.textContent);
      const fix = (h - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxDescent - m.actualBoundingBoxDescent;
      hint.style.top = `${Math.round(Y.height - px(10) - h + fix)}px`;
    };
    layout();
    G.onResize(layout);
    const at = (el) => G.groundPass(el.getBoundingClientRect().top) + 0.1;
    const tl = gsap.timeline({ paused: true });
    const t0 = at(G.title);
    G.titleLetters.forEach((l, i) => tl.fromTo(l, { yPercent: 90 }, { yPercent: 0, duration: 0.86, ease: "power3.out" }, t0 + i * 0.05));
    rules.forEach((r) => tl.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power2.out" }, at(r)));
    const from = { yPercent: 100, y: 0 };
    sec.querySelectorAll(".g-intro__entry").forEach((row) => {
      const t = at(row);
      row.querySelectorAll(".g-ml > i").forEach((p, j) => tl.fromTo(p, from, { yPercent: 0, duration: 0.8, ease: "power3.out" }, t + j * 0.04));
    });
    const series = sec.querySelector(".g-intro__series .g-ml > i");
    tl.fromTo(series, from, { yPercent: 0, duration: 0.8, ease: "power3.out" }, at(series));
    const about = sec.querySelector(".g-intro__about");
    about.querySelectorAll(".g-ml > i").forEach((p, j) => tl.fromTo(p, from, { yPercent: 0, duration: 0.8, ease: "power3.out" }, at(about) + j * 0.04));
    tl.fromTo(hint, { opacity: 0 }, { opacity: 0.3, duration: 0.8, ease: "power3.out" }, at(hint));
    tl.call(() => {
      // The ‹Scroll down› letters drop out one by one and re-enter from above — rests 3.4s and repeats. Once scrolling starts, it fades out over .15 of the screen height
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 3.4 });
      loop.to(hintLetters, { yPercent: 100, duration: 0.42, ease: "power2.in", stagger: 0.028 })
        .set(hintLetters, { yPercent: -100 })
        .to(hintLetters, { yPercent: 0, duration: 0.62, ease: "power3.out", stagger: 0.028 });
      gsap.to(hint, { opacity: 0, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: () => `+=${Math.round(Y.height * 0.15)}`, scrub: true } });
    }, null, ">");
    return tl;
  }

  // ── Lecture cell: when the photo cell touches 97% of the screen bottom, a 22% mask on all sides opens in 2.2s expo.out, and the inner photo drifts up and down by 7% of the cell height (scrub .6) ──
  function blocks() {
    document.querySelectorAll(".g-entry__frame").forEach((frame) => {
      const pic = frame.querySelector(".g-entry__picture");
      const state = { at: 22 };
      const draw = () => { frame.style.clipPath = `inset(${state.at}% ${state.at}% ${state.at}% ${state.at}%)`; frame.dataset.open = state.at; };
      if (reduce) { state.at = 0; draw(); return; }
      draw();
      gsap.to(state, { at: 0, duration: 2.2, ease: "expo.out", onUpdate: draw, scrollTrigger: { trigger: frame, start: "top 97%", once: true } });
      const shift = () => Math.round(frame.offsetHeight * 0.14 * 0.5);
      gsap.fromTo(pic, { y: shift }, { y: () => -shift(), ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
    });
  }

  // ── 4-column grid story ──
  function story() {
    const sec = document.querySelector(".g-story"), stage = sec.querySelector(".g-story__stage");
    const cols = [...stage.querySelectorAll(".g-story__col")].map((col) => ({ col, fill: col.firstElementChild }));
    const gutters = [...stage.querySelectorAll('.g-story__band[data-kind="gutter"]')], margins = [...stage.querySelectorAll('.g-story__band[data-kind="margin"]')];
    const nums = (k) => [...stage.querySelectorAll(`.g-story__num[data-kind="${k}"]`)].map((mask) => ({ mask, inner: mask.firstElementChild }));
    const colNums = nums("col"), gutNums = nums("gutter"), marNums = nums("margin");
    const steps = stage.querySelector(".g-story__steps"), dot = steps.querySelector(".g-story__dot");
    const stepLines = [...steps.querySelectorAll(".g-story__step")].map((line) => ({ line, inner: line.firstElementChild }));
    const capEls = [...stage.querySelectorAll(".g-story__caption")];
    const caps = [0, 1, 2].map((i) => [...splitMasks(capEls[i * 2], "g-mk"), ...splitMasks(capEls[i * 2 + 1], "g-mk")]);
    const color = () => ({ ink: getComputedStyle(root).getPropertyValue("--kf-ink").trim(), ground: getComputedStyle(root).getPropertyValue("--site-ground").trim() });
    let pitch = 14;
    const geo = () => ({
      left: [0, 1, 2, 3].map((i) => px(110 + i * 330)), right: [0, 1, 2, 3].map((i) => px(110 + i * 330 + 320)),
      frameLeft: px(90), frameRight: px(1440),
      together: [0, 1, 2, 3].map((i) => px(110 + (i * 1310) / 4)), togetherEnd: [0, 1, 2, 3].map((i) => px(110 + ((i + 1) * 1310) / 4)),
    });
    const layout = () => {
      const line = Math.ceil(px(12) * 1.2);
      pitch = 12 * Y.scale * 1.2;
      [...colNums, ...gutNums, ...marNums].forEach(({ mask }) => (mask.style.height = `${line}px`));
      const cap = Math.ceil(90 * Y.scale * 1.2);
      stage.querySelectorAll(".g-story__caption .g-mk").forEach((m) => (m.style.height = `${cap}px`));
      const mc = metrics(capEls[0], "GRIDCOLUMN"), base = (cap - (mc.fontBoundingBoxAscent + mc.fontBoundingBoxDescent)) / 2 + mc.fontBoundingBoxAscent + mc.actualBoundingBoxDescent;
      capEls.forEach((c) => (c.style.bottom = `${Math.round(px(10) - (cap - base))}px`));
      const ms = metrics(stepLines[0].inner, "Set Up Columns"), lead = (line - (ms.fontBoundingBoxAscent + ms.fontBoundingBoxDescent)) / 2;
      steps.style.top = `${Math.round(px(10) - (lead + ms.fontBoundingBoxAscent - ms.actualBoundingBoxAscent))}px`;
      steps.style.left = `${geo().left[2]}px`;
      const capH = metrics(stepLines[0].inner, "H").actualBoundingBoxAscent;
      dot.style.top = `${lead + ms.fontBoundingBoxAscent - capH / 2 - px(7) / 2 + 0.5}px`;
    };
    const columns = (split, grow, fillColor) => {
      const g = geo(), base = px(20), seen = Y.height - Math.max(0, stage.getBoundingClientRect().top);
      cols.forEach(({ col, fill }, i) => {
        const h = Math.round(base + (seen - base) * grow[i]);
        const a = Math.round(g.together[i] + (g.left[i] - g.together[i]) * split[i]), b = Math.round(g.togetherEnd[i] + (g.right[i] - g.togetherEnd[i]) * split[i]);
        fill.style.background = fillColor;
        Object.assign(col.style, { left: `${a}px`, width: `${b - a}px`, top: "0px", height: `${h}px` });
      });
    };
    // Entering: from 80% of the screen to the top edge — four attached black bands open the gaps between steps within 12%, and each step grows to screen height .07 later than the last, going black → floor color.
    const opening = (p) => {
      const { ink, ground } = color();
      const split = cols.map(() => ease("power1.inOut")(clamp(0, 1, p / 0.12)));
      const grow = cols.map((_, i) => ease("power2.inOut")(range(0.06 + i * 0.07, 1, p)));
      columns(split, grow, gsap.utils.interpolate(ink, ground, ease("power1.inOut")(range(0.2, 0.55, p))));
    };
    let dotAt = 0, dotGoal = 0;
    const drawSteps = () => {
      stepLines.forEach(({ line, inner }, i) => {
        const near = clamp(0, 1, 1 - Math.abs(i - dotAt));
        line.style.opacity = `${0.3 + 0.7 * near}`;
        gsap.set(inner, { x: px(10) * near });
      });
      gsap.set(dot, { y: dotAt * pitch });
    };
    const stepTo = (n) => {
      if (n === dotGoal) return;
      dotGoal = n;
      const s = { at: dotAt };
      gsap.to(s, { at: n, duration: reduce ? 0 : 0.7, ease: "power2.inOut", overwrite: true, onUpdate: () => { dotAt = s.at; drawSteps(); }, onComplete: () => { dotAt = s.at; drawSteps(); } });
    };
    const letters = (list, enter, leave) => list.forEach((l, i) => {
      const off = (i * 0.05) / (list.length * 0.05 + 1), part = (v) => clamp(0, 1, (v - off) / (1 - off));
      gsap.set(l, { yPercent: (1 - ease("power3.out")(part(enter))) * 100 - ease("power2.in")(part(leave)) * 100 });
    });
    // Pinned for 4.35 screens: column → home → margin, three beats (1.6 · 1.6 · 1.15 ratio)
    const telling = (p) => {
      const g = geo(), H = Y.height;
      const one = range(0, 1.6 / 4.35, p), two = range(1.6 / 4.35, 3.2 / 4.35, p), three = range(3.2 / 4.35, 1, p) * (1.15 / 1.6);
      columns([1, 1, 1, 1], [1, 1, 1, 1], color().ground);
      const wiped = cols.map(({ fill }, i) => {
        const v = ease("power2.inOut")(clamp(0, 1, (one - (0.16 + i * 0.05)) / (0.61 - 0.16 - 3 * 0.05)));
        fill.style.clipPath = `inset(0 0 0 ${v * 100}%)`;
        return v;
      });
      steps.style.opacity = `${ease("power3.out")(range(0.43, 0.7, one))}`;
      const bands = (els, t, span, closes) => els.forEach((el, i) => {
        const o = i * 0.06, grow = ease("power2.inOut")(range(0 + o, 0.26, t)), gone = closes ? ease("power2.inOut")(range(0.62 + o, 0.88, t)) : 0;
        const top = Math.round(H * gone), bottom = Math.round(H * grow), [a, b] = span(i);
        Object.assign(el.style, { left: `${a}px`, width: `${b - a}px`, top: `${top}px`, height: `${Math.max(0, bottom - top)}px` });
      });
      bands(gutters, two, (i) => [g.right[i], g.left[i + 1]], true);
      bands(margins, three, (i) => (i === 0 ? [g.frameLeft, g.left[0]] : [g.right[3], g.frameRight]), false);
      const out = range(0.06, 0.26, two);
      colNums.forEach(({ mask, inner }, i) => {
        mask.style.left = `${Math.round((g.left[i] + g.right[i]) / 2)}px`;
        mask.style.opacity = `${0.3 * wiped[i]}`;
        gsap.set(inner, { yPercent: -ease("power2.in")(out) * 100 });
      });
      const gIn = ease("power3.out")(range(0.24, 0.54, two)), gOut = ease("power2.in")(range(0.06, 0.26, three));
      gutNums.forEach(({ mask, inner }, i) => {
        mask.style.left = `${Math.round((g.right[i] + g.left[i + 1]) / 2)}px`;
        mask.style.opacity = "0.3";
        gsap.set(inner, { yPercent: (1 - gIn) * 100 - gOut * 100 });
      });
      const mIn = ease("power3.out")(range(0.24, 0.54, three));
      marNums.forEach(({ mask, inner }, i) => {
        if (i === 0) { mask.style.left = "auto"; mask.style.right = `${Y.width - (g.left[0] + 1)}px`; } else mask.style.left = `${g.right[3] - 1}px`;
        mask.style.opacity = "0.3";
        gsap.set(inner, { yPercent: (1 - mIn) * 100 });
      });
      stepTo(three >= 0.3 ? 2 : two >= 0.3 ? 1 : 0);
      letters(caps[0], range(0.49, 0.85, one), range(0.06, 0.26, two));
      letters(caps[1], range(0.24, 0.54, two), range(0.06, 0.26, three));
      letters(caps[2], range(0.24, 0.54, three), 0);
    };
    layout();
    drawSteps();
    if (reduce) { telling(1); return { section: sec }; }
    telling(0);
    opening(0);
    G.onResize(() => { layout(); ScrollTrigger.refresh(); });
    ScrollTrigger.create({ trigger: sec, start: "top 80%", end: "top top", scrub: true, invalidateOnRefresh: true, onUpdate: (st) => opening(st.progress) });
    ScrollTrigger.create({ trigger: sec, start: "top top", end: () => `+=${Math.round(Y.height * 4.35)}`, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (st) => telling(st.progress) });
    return { section: sec };
  }

  // ── Giant word interlude ──
  // 1440 panel values: center 765 · word 378px (letter spacing −.06em) · bottom 10 · box 266 · lines start from 1470 off screen
  const THROW_FIRST = [{ vx: -760, vy: 200, spin: -95, at: 2 }, { vx: -900, vy: -1250, spin: -58, at: 1 }, { vx: -80, vy: 240, spin: 36, at: 0 }, { vx: 930, vy: -1200, spin: 72, at: 1 }, { vx: 810, vy: 160, spin: 120, at: 2 }];
  const DROP_TOOLS = [{ vx: -140, vy: 560, spin: -40, at: 3.2 }, { vx: -90, vy: 640, spin: 34, at: 2.2 }, { vx: -40, vy: 700, spin: -28, at: 1.2 }, { vx: 60, vy: 780, spin: 38, at: 0 }, { vx: 120, vy: 860, spin: -46, at: 0 }];
  const ARE_SPIN = [85, 92, 88];
  function interlude() {
    const sec = document.querySelector(".g-inter"), stage = sec.querySelector(".g-inter__stage");
    const word = (name) => {
      const el = stage.querySelector(`[data-word="${name}"]`);
      const text = el.textContent.trim();
      el.textContent = "";
      const letters = [...text].map((glyph) => {
        const flight = document.createElement("span");
        flight.className = "g-il";
        const ink = document.createElement("i");
        ink.textContent = glyph;
        flight.append(ink);
        el.append(flight);
        return { glyph, flight, ink };
      });
      return { el, letters };
    };
    const first = word("first"), are = word("are"), just = word("just"), tools = word("tools"), power = word("power");
    const rule = stage.querySelector(".g-inter__rule"), band = stage.querySelector(".g-inter__band"), block = stage.querySelector(".g-inter__block");
    const bandTexts = [...band.querySelectorAll("span")];
    for (let i = 0; i < 21; i++) band.insertBefore(document.createElement("i"), bandTexts[0]);
    const bandRules = [...band.querySelectorAll("i")];
    const BAND_AT = [{ x: 0, rule: 1 }, { x: 297, rule: 10 }, { right: 0, rule: 19 }];
    const $ = {};
    const measure = (list, size) => {
      ctx.font = fontOf(list[0].ink);
      const gap = -0.06 * size;
      let x = 0;
      const pens = list.map(({ glyph }) => { const p = x; x += ctx.measureText(glyph).width + gap; return p; });
      const inks = list.map(({ glyph }, i) => pens[i] - ctx.measureText(glyph).actualBoundingBoxLeft);
      const a = ctx.measureText(list[0].glyph), b = ctx.measureText(list[list.length - 1].glyph), h = ctx.measureText("H");
      return { pens, inks, inkLeft: pens[0] - a.actualBoundingBoxLeft, inkRight: pens[pens.length - 1] + b.actualBoundingBoxRight, baseline: (size - (h.fontBoundingBoxAscent + h.fontBoundingBoxDescent)) / 2 + h.fontBoundingBoxAscent };
    };
    const layout = () => {
      const H = Y.height, size = 378 * Y.scale, n = px(10), r = px(306), extra = px(40), s = Y.scale;
      stage.style.setProperty("--size", `${size}px`);
      Object.assign(first.el.style, { top: `${H - r}px`, height: `${r + extra}px` });
      $.box = r + extra;
      const mf = measure(first.letters, size), l = Math.round(765 * s - (mf.inkLeft + mf.inkRight) / 2), u = Math.round(r - n - mf.baseline);
      first.letters.forEach(({ flight }, i) => Object.assign(flight.style, { left: `${Math.round(l + mf.pens[i])}px`, top: `${u}px` }));
      const row = (w, at) => {
        const m = measure(w.letters, size);
        Object.assign(w.el.style, { top: `${H - r}px`, height: `${r}px` });
        w.letters.forEach(({ flight }, i) => Object.assign(flight.style, { left: `${Math.round((1470 + at) * s - m.inkLeft + m.pens[i])}px`, top: `${u}px` }));
        return { wide: (m.inkRight - m.inkLeft) / s, inks: m.inks.map((v) => (v - m.inkLeft) / s) };
      };
      const ra = row(are, 0);
      $.areInk = ra.inks;
      $.ruleAt = ra.wide + 100;
      const p = $.ruleAt + 266 + 30, h = p + row(just, p).wide + 80, g = h + row(tools, h).wide + 80;
      const bandLeft = Math.round((1470 + g) * s);
      Object.assign(band.style, { left: `${bandLeft}px`, top: `${H - n - px(266)}px`, width: `${Math.round((1470 + g + 659) * s) - bandLeft}px`, height: `${px(280)}px` });
      bandRules.forEach((e, i) => (e.style.top = `${px(i * 14)}px`));
      const mb = metrics(bandTexts[0], "H"), lh = parseFloat(getComputedStyle(bandTexts[0]).lineHeight), lift = (lh - (mb.fontBoundingBoxAscent + mb.fontBoundingBoxDescent)) / 2 + mb.fontBoundingBoxAscent;
      bandTexts.forEach((el, i) => {
        const at = BAND_AT[i];
        Object.assign(el.style, { left: at.right === undefined ? `${px(at.x)}px` : "auto", right: at.right === undefined ? "auto" : `${px(at.right)}px`, top: `${Math.round(px(at.rule * 14 - 2) - lift)}px` });
      });
      $.powerAt = g + 659 + 326;
      $.powerInk = row(power, $.powerAt).inks;
      $.landAt = g - 30 - 266;
      $.restAt = g + 659 + 30;
      $.bandTop = px(266);
      const ruleLeft = Math.round((1470 + $.ruleAt) * s);
      $.ruleFoot = H - n;
      Object.assign(rule.style, { left: `${ruleLeft}px`, width: `${Math.round((1470 + $.ruleAt + 266) * s) - ruleLeft}px` });
      $.side = px(266); $.line = px(20); $.floor = H - n; $.capTop = $.floor - $.side;
      $.pin = Math.max(n, Math.min(px(10), $.capTop - px(40) - $.side));
      $.waitBottom = $.pin + $.side;
      sec.style.height = `${Math.round(H * 8.95)}px`;
      sec.style.marginTop = `${-$.pin}px`;
      $.catchFrom = H;
      const fallBy = $.floor - $.waitBottom;
      $.contact = 0.65;
      for (let i = 0; i <= 400; i++) {
        const t = (0.65 * i) / 400;
        if ($.waitBottom + fallBy * ease("sine.inOut")(range(0, 0.65, t)) >= $.capTop) { $.contact = t; break; }
      }
      $.throwSpan = clamp(0.19, 0.43, 1 - $.contact - 2 * 0.06);
      $.spellTo = Math.max(0.16, $.contact - 0.1);
      $.areSpan = 1470 - (110 - $.ruleAt);
      $.landTwo = (1470 + $.landAt - 900) / $.areSpan;
      $.riseTwo = (1470 + $.landAt - 200) / $.areSpan;
      $.stopTwo = (1470 + $.restAt - 110) / $.areSpan;
      $.dropTwo = (1470 + $.restAt - 400) / $.areSpan;
      const span = $.powerInk[$.powerInk.length - 1] - $.powerInk[0], w = 1044;
      $.growTwo = Math.max($.stopTwo + 0.06, (1470 + $.powerAt + $.powerInk[0] - 110 - 266) / $.areSpan);
      $.pushFor = Math.max(0.2, (span - 0.8 * w) / ($.areSpan * 0.8));
      $.powerHit = $.powerInk.map((v) => (1470 + $.powerAt + v - 110 - 266 + (w * $.growTwo) / $.pushFor) / (w / $.pushFor + $.areSpan));
      const arc = $.floor + px(140);
      $.touchTwo = $.landTwo;
      for (let i = 500; i >= 250; i--) {
        const t = i / 500;
        if (arc * Math.sin(t * Math.PI) >= $.side + px(30)) { $.touchTwo = 1 + t * ($.landTwo - 1); break; }
      }
      $.areStruck = $.areInk.map((v) => (1470 - (376 - v)) / $.areSpan);
      const lead = (1 - 0.516) * ($.catchFrom - $.pin), rest = $.spellTo * H * 1.15;
      $.spellLead = lead / Math.max(1, lead + rest);
    };
    const drawBlock = (half, height, top, ty, tx, turn) => {
      const a = Math.round((765 - half) * Y.scale), b = Math.round((765 + half) * Y.scale);
      Object.assign(block.style, { left: `${a}px`, width: `${b - a}px`, top: `${Math.round(top)}px`, height: `${Math.round(height)}px`, transform: `translate(${px(tx)}px, ${ty}px) rotate(${turn.toFixed(2)}deg)` });
    };
    // The first word rises one character at a time (.16 stagger) inside the mask
    const spell = (v) => {
      const lag = 0.16, len = 1 - lag * (first.letters.length - 1);
      first.letters.forEach(({ ink }, i) => (ink.style.transform = `translateY(${(1 - clamp(0, 1, (v - i * lag) / len)) * $.box}px)`));
      first.el.classList.toggle("is-open", v >= 1);
    };
    const toss = (flight, v, a) => {
      const x = v.vx * (1 - (1 - Math.min(1, a)) ** 1.6), y = v.vy * a + 1440 * a * a * 0.5;
      flight.style.transform = `translate(${(x * Y.scale).toFixed(2)}px, ${(y * Y.scale).toFixed(2)}px) rotate(${(v.spin * a).toFixed(2)}deg)`;
    };
    // Push the word rows (second to last, small band, line) to the left. Letters of the second word bounce up one by one as they hit the box (left wall 376)
    const slide = (n, origin, bump) => {
      are.letters.forEach(({ flight }, i) => {
        const k = Math.max(0, (n - $.areStruck[i]) / 0.42), from = k > 0 ? 1470 - $.areSpan * $.areStruck[i] : origin;
        flight.style.transform = `translate(${((from - 1470 + 640 * k) * Y.scale).toFixed(2)}px, ${(-1350 * k * Y.scale).toFixed(2)}px) rotate(${(ARE_SPIN[i % 3] * k).toFixed(2)}deg)`;
      });
      const shift = `translateX(${((origin - 1470) * Y.scale).toFixed(2)}px)`, thick = Math.max(1, Math.round((1 + 25 * bump) * Y.scale));
      rule.style.height = `${thick}px`;
      rule.style.top = `${$.ruleFoot - thick}px`;
      [rule, just.el, tools.el, band, power.el].forEach((el) => (el.style.transform = shift));
    };
    // Grab: while the interlude top edge (black band) rises from the screen bottom to its fixed spot — the first word sticks to the screen bottom and rises
    const catching = (e) => {
      const t = lerp($.catchFrom, $.pin, e), stageTop = t - $.pin;
      drawBlock(655, $.line, t - stageTop, 0, 0, 0);
      first.el.style.transform = `translateY(${-stageTop}px)`;
      spell($.spellLead * range(0.516, 1, e));
      first.letters.forEach(({ flight }) => (flight.style.transform = "translate(0px, 0px) rotate(0deg)"));
      slide(0, 1470, 0);
    };
    const holding = (e) => {
      const t = range(0, 1.15 / 7.95, e), lo = (1.15 / 7.95) * 0.65, n = Math.max(0, (e - lo) / (2.95 / 7.95 - lo));
      const shrink = ease("power1.inOut")(range(0, 0.243, t)), fall = ease("sine.inOut")(range(0, 0.65, t));
      const origin = 1470 - $.areSpan * n, bump = Math.sin(clamp(0, 1, (n - 1) / 0.07) * Math.PI), hop = clamp(0, 1, (n - 1) / ($.landTwo - 1));
      const pushed = Math.max(110, Math.min(632, 632 - (928 - origin)));
      const up = range($.riseTwo, $.riseTwo + 0.06, n), down = range($.dropTwo, $.dropTwo + 0.05, n);
      const x = n <= 1 ? pushed : n < $.landTwo ? lerp(110, 900, hop) : n < $.riseTwo ? origin + $.landAt : n < $.dropTwo ? lerp(200, 400, range($.riseTwo, $.dropTwo, n)) : Math.max(110, origin + $.restAt);
      const lift = $.bandTop * (up - down);
      const grow = range($.growTwo, $.growTwo + $.pushFor, n), flat = range($.growTwo + $.pushFor, $.growTwo + $.pushFor + 0.12, n);
      const wide = lerp(266, 1310, grow), tall = lerp($.side, $.line, flat), reach = x + wide;
      const jump = ($.floor + px(140)) * Math.sin(hop * Math.PI), anchored = n >= $.stopTwo;
      const height = anchored ? tall : lerp($.line, $.side, shrink);
      drawBlock(anchored ? wide / 2 : lerp(655, 133, shrink), height, $.pin, anchored ? $.floor - $.pin - height : ($.floor - $.waitBottom) * fall - jump - lift, anchored ? x + wide / 2 - 765 : x - 632, 180 * hop + 90 * (up + down));
      power.letters.forEach(({ flight }, i) => {
        const at = origin + $.powerAt + $.powerInk[i], k = Math.max(0, (reach - at) / 430), ride = k > 0 ? $.areSpan * (n - $.powerHit[i]) : 0;
        flight.style.transform = `translate(${((ride + 520 * k) * Y.scale).toFixed(2)}px, ${(-1150 * k * Y.scale).toFixed(2)}px) rotate(${(80 * k).toFixed(2)}deg)`;
      });
      tools.letters.forEach(({ flight }, i) => {
        const v = DROP_TOOLS[i] ?? DROP_TOOLS[DROP_TOOLS.length - 1];
        toss(flight, v, Math.max(0, (n - ($.touchTwo + v.at * 0.04)) / 0.3));
      });
      first.el.style.transform = "translateY(0px)";
      spell($.spellLead + (1 - $.spellLead) * range(0, $.spellTo, t));
      first.letters.forEach(({ flight }, i) => {
        const v = THROW_FIRST[i] ?? THROW_FIRST[THROW_FIRST.length - 1], from = $.contact + v.at * 0.06;
        toss(flight, v, range(from, from + $.throwSpan, t));
      });
      slide(n, origin, bump);
    };
    layout();
    if (reduce) { holding(1); return { section: sec }; }
    catching(0);
    G.onResize(() => { layout(); catching(0); ScrollTrigger.refresh(); });
    ScrollTrigger.create({ trigger: sec, start: () => `top bottom-=${$.pin}`, end: "top top", scrub: true, invalidateOnRefresh: true, onUpdate: (st) => catching(st.progress) });
    ScrollTrigger.create({ trigger: sec, start: "top top", end: () => `+=${Math.round(Y.height * 7.95)}`, scrub: true, invalidateOnRefresh: true, onUpdate: (st) => holding(st.progress), onRefresh: (st) => st.progress > 0 && holding(st.progress) });
    return { section: sec };
  }

  // ── About table: when it reaches 92% of the screen, rows spring up staggered .035 with .7s power3.out, and ”About ” opens out in front of the pinned title over .55s ──
  function about() {
    const sec = document.querySelector(".g-about"), stage = sec.querySelector(".g-about__stage");
    const rulesHost = stage.querySelector(".g-about__rules");
    for (let i = 0; i < 15; i++) rulesHost.appendChild(document.createElement("i")).style.top = `calc(${i * 14} * var(--s))`;
    const climbers = [...stage.querySelectorAll(".g-al > i")];
    const prefix = document.querySelector(".g-title__about"), prefixLetters = prefix?.letters || [];
    const widthOf = () => { const w = prefix.style.width; prefix.style.width = "auto"; const v = prefix.getBoundingClientRect().width; prefix.style.width = w || "0px"; return v; };
    stage.querySelectorAll(".g-about__row").forEach((row) => {
      const hit = row.querySelector(".g-about__hit");
      hit.addEventListener("mouseenter", () => (stage.dataset.lit = row.dataset.n));
      hit.addEventListener("mouseleave", () => delete stage.dataset.lit);
    });
    if (reduce) {
      gsap.set(climbers, { yPercent: 0 });
      return { section: sec };
    }
    gsap.set(climbers, { yPercent: 100 });
    if (prefix) gsap.set(prefixLetters, { yPercent: 100 });
    let tl = null;
    const make = () => {
      const t = gsap.timeline({ paused: true });
      t.fromTo(climbers, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 }, 0);
      if (prefix) {
        t.fromTo(prefix, { width: 0, marginRight: 0 }, { width: () => widthOf(), marginRight: "-0.06em", duration: 0.55, ease: "power2.inOut" }, 0)
          .fromTo(prefixLetters, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 }, 0.55);
      }
      return t;
    };
    const play = () => { tl ||= make(); tl.play(); };
    const copy = stage.querySelector(".g-about__copy");
    ScrollTrigger.create({ trigger: copy, start: "top 92%", invalidateOnRefresh: true, onEnter: play });
    ScrollTrigger.create({ trigger: copy, start: "top 85%", invalidateOnRefresh: true, onEnter: play, onLeaveBack: () => tl && tl.reverse() });
    // When the footer screen starts, the fixed title is pushed up along with the page
    ScrollTrigger.create({
      trigger: sec, start: () => `bottom bottom-=${px(150)}`, end: "max", invalidateOnRefresh: true,
      onUpdate: (st) => gsap.set(G.title, { y: Math.min(0, st.start - st.scroll()) }), onLeaveBack: () => gsap.set(G.title, { y: 0 }),
    });
    G.onResize(() => { if (tl) { const p = tl.progress(); tl.invalidate(); tl.progress(p); } });
    return { section: sec };
  }

  // ── Vertical rules: turn on when the grid story gets pinned, and vanish while the bottom edge of the second lecture group passes the screen ──
  function lines(from, until) {
    const host = document.querySelector(".g-lines"), bars = [...host.children];
    const edges = [1, 2, 3, 4].flatMap((i) => [[[0, 110, 440, 770, 1100][i], 0], [[0, 430, 760, 1090, 1420][i], -1]]);
    const place = () => bars.forEach((b, i) => (b.style.left = `${px(edges[i][0]) + edges[i][1]}px`));
    place();
    G.onResize(place);
    const toggle = (st) => host.classList.toggle("is-on", st.scroll() >= st.start);
    ScrollTrigger.create({ trigger: from, start: "top top", end: "max", onToggle: toggle, onUpdate: toggle, onRefresh: toggle });
    gsap.to(host, { opacity: 0, ease: "none", scrollTrigger: { trigger: until, start: "bottom bottom", end: "bottom top", scrub: true } });
  }

  function build() {
    scrollTo(0, 0);
    G.scroll.lenis?.scrollTo(0, { immediate: true });
    G.stopScroll();
    G.layoutTitle();
    const pre = reduce ? null : G.preloader();
    const show = intro();
    if (pre) pre.add(show.paused(false), G.groundStart() + 0.125);
    else { G.showGroundAsBand(); show.progress(1); }
    root.classList.add("is-up");
    blocks();
    const s = story();
    const groups = document.querySelectorAll(".g-block");
    interlude();
    about();
    G.finale(document.querySelector(".g-finale"));
    lines(s.section, groups[1]);
    G.trailer();
    ScrollTrigger.refresh();
    const go = () => {
      G.startMorph();
      G.startScroll();
      addEventListener("resize", () => G.showStub(G.isStub()));
    };
    pre ? pre.then(go) : go();
  }
  document.fonts.ready.then(build);
})();
