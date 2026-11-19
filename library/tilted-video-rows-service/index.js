// First page scenes — like the original, scroll scenes compute progress (section top − screen height ~ + section height) every frame from Lenis animatedScroll and use the value directly.
// Loader order: preload (prepare first screen) → reveal (video rows settle from 3x to 1x) → header·fv (when the panels split) → enter (scroll scene starts)
AM.page(({ E, rem, pc, clamp, reduce, touch, onScroll, watch }) => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const top = (el) => el.getBoundingClientRect().top + (AM.lenis ? AM.lenis.animatedScroll : scrollY);
  const prog = (el, offset = innerHeight) => {
    const start = top(el) - offset, range = el.getBoundingClientRect().height;
    return () => clamp((AM.scroll.y - start) / range, 0, 1);
  };
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  // Flicker-on (Ct) · text swap (Vt): switched on and back by progress inside the pinned section
  const ct = (items, on) => items.forEach((e) => {
    gsap.killTweensOf(e);
    if (!on) return gsap.set(e, { opacity: 0 });
    const d = Math.random() * 0.4;
    gsap.to(e, { opacity: 1, duration: 0.04, delay: d, ease: "expo.out" });
    gsap.to(e, { opacity: 0, duration: 0.08, delay: d + 0.12, ease: "expo.out" });
    gsap.to(e, { opacity: 1, duration: 0.12, delay: d + 0.2, ease: "expo.out" });
  });
  const vt = (els, on) => els.forEach((el) => el.dispatchEvent(new CustomEvent(on ? "fx:play" : "fx:reset")));

  // ── Hero
  const fv = $("[data-fv]");
  const stageRows = $$(".am-fv .am-stage__row");
  const rows = stageRows.filter((r) => getComputedStyle(r).display !== "none");
  const stage = $(".am-fv .am-stage__rows");
  let moveRows = null;
  const words = $$(".am-fv__word[data-fx]");
  const header = { logo: $(".am-header__logo"), menu: $(".am-header__menu"), texts: $$(".am-header__menu .am-pill__texts > span") };
  const ctaLinks = $$(".am-cta__link"), ctaTexts = $$(".am-cta [data-swap-text]"), ctaArrows = $$(".am-cta [data-swap-arrow]");
  const scrollArrow = $$("[data-fv='scroll-arrow'] > span"), scrollCircle = $("[data-fv='scroll-circle']");

  const preload = () => {
    moveRows = AM.rows(rows);
    gsap.set(stage, { scale: 2 });
    gsap.set($("[data-fv='copy-line']"), { scaleX: 0, transformOrigin: "left" });
    gsap.set($("[data-fv='copy-text']"), { yPercent: 100 });
    gsap.set($$("[data-fv='badge']"), { opacity: 0, scale: 1.1 });
    gsap.set(header.logo, { opacity: 0 });
    gsap.set(header.menu, { yPercent: 100 });
    gsap.set(header.texts[0], { yPercent: 100 });
    gsap.set(header.texts[1], { yPercent: 200 });
    gsap.set($(".am-cta"), { yPercent: pc() ? -150 : 150 });
    gsap.set(scrollArrow[1], { yPercent: -100 });
    gsap.set(scrollCircle, { scale: 0.8 });
  };
  const reveal = () => {
    gsap.to(stage, { scale: 1, duration: 3, ease: E.oi });
    moveRows?.(3, E.oi);
  };
  const headerIn = () => {
    gsap.delayedCall(1.45, () => gsap.set(header.logo, { opacity: 1 }));
    gsap.to(header.menu, { yPercent: 0, duration: 1.2, delay: 0.5, ease: "expo.out" });
    gsap.to(header.texts[0], { yPercent: 0, duration: 1.2, delay: 0.8, ease: "expo.out" });
    gsap.to(header.texts[1], { yPercent: 100, duration: 1.2, delay: 0.8, ease: "expo.out" });
  };
  const fvIn = () => {
    gsap.delayedCall(0.8, () => words.forEach((w) => w.dispatchEvent(new CustomEvent("fx:play"))));
    gsap.to($("[data-fv='copy-line']"), { scaleX: 1, duration: 1.2, delay: 0.8, ease: "expo.out" });
    gsap.to($("[data-fv='copy-text']"), { yPercent: 0, duration: 1.2, delay: 0.8, ease: "expo.out" });
    gsap.to($$("[data-fv='badge']"), { opacity: 1, scale: 1, duration: 1.2, delay: 1.7, stagger: 0.1, ease: "expo.out" });
    gsap.to($(".am-cta"), { yPercent: 0, duration: 1.2, delay: 0.5, ease: "expo.out" });
    gsap.fromTo([ctaTexts[0], ctaTexts[2], ctaArrows[0], ctaArrows[2]], { yPercent: 100 }, { yPercent: 0, duration: 1.2, delay: 0.8, ease: "expo.out" });
    gsap.to(scrollArrow[1], { yPercent: 0, duration: 1.2, delay: 0.6, ease: "expo.out" });
    gsap.to(scrollCircle, { scale: 1, duration: 1.2, delay: 0.5, ease: "expo.out", onComplete: scrollSign });
  };
  // Scroll indicator — the circle turns 450° in 1s circ.inOut then rests 1s, repeating, the arrow comes down from above and the previous one exits below (only while visible)
  const scrollSign = () => {
    if (reduce) return;
    const spin = gsap.to(scrollCircle, { rotation: 450, duration: 1, ease: "circ.inOut", repeat: -1, repeatDelay: 1, paused: true });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true })
      .fromTo(scrollArrow[1], { yPercent: -110 }, { yPercent: 0, duration: 1, ease: "expo.out" }, 0)
      .fromTo(scrollArrow[0], { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: 110, duration: 1, ease: "expo.out" }, 0);
    watch(fv, () => { spin.play(); tl.play(); }, () => { spin.pause(); tl.pause(); });
  };
  // Hero video parallax — while passing the hero, the board descends late by half the screen height
  const fvPar = $("[data-fv='parallax']");
  const fvParallax = () => {
    const p = clamp((AM.scroll.y - top(fv)) / fv.offsetHeight, 0, 1);
    fvPar.style.transform = `translate3d(0, ${p * innerHeight * 0.5}px, 0)`;
  };

  // ── weDo
  const wedo = (() => {
    const target = $("[data-wedo='target']");
    if (!target) return null;
    const grid = $("[data-wedo='grid']"), overlay = $("[data-wedo='overlay']"), imgs = $$("[data-wedo='img']");
    const slides = $$("[data-wedo='slide']"), titles = $$("[data-wedo='phase-title']"), cur = $("[data-wedo='current']"), line = $("[data-wedo='line']"), num = $("[data-wedo='number']");
    const title2 = $("[data-wedo='title2']");
    const items = $$(".am-wedo [data-flick-item]");
    let targetScale = 1, p = prog(target), on = false, phase = null;
    const measure = () => {
      const gap = 4 * rem();
      const cw = (grid.offsetWidth - gap) / 3, ch = (grid.offsetHeight - gap) / 3;
      targetScale = Math.max(innerWidth / cw, innerHeight / ch);
      p = prog(target);
    };
    gsap.set(num, { yPercent: -100 });
    gsap.set(line, { scaleX: 0, transformOrigin: "left" });
    titles.forEach((t, i) => gsap.set(t, { yPercent: i === 0 ? 100 : 100 }));
    // The number strip stacks three cells vertically — one cell = 1/3 of band height
    gsap.set(cur, { yPercent: 100 / 3 });
    gsap.set(slides[1], { scale: 2, rotate: 15 });
    const go = (k) => {
      // When the section changes, it advances one slot with a 1.4s nt and pauses scrolling meanwhile — in the original, the first slot pauses only when scrolling up, the middle slot always, the last slot only when scrolling down
      const dir = AM.lenis?.direction ?? 1;
      const lock = k === 1 || (k === 0 && dir === -1) || (k === 2 && dir === 1);
      if (!reduce && lock) { AM.wait(true); gsap.delayedCall(1.4, () => AM.wait(false)); }
      const d = reduce ? 0 : 1.4;
      gsap.killTweensOf([cur, ...titles, ...slides]);
      gsap.to(cur, { yPercent: (-100 * k) / 3, duration: d, ease: E.nt });
      titles.forEach((t, i) => gsap.to(t, { yPercent: i < k ? -100 : i === k ? 0 : 100, duration: d, ease: E.nt }));
      slides.forEach((s, i) => {
        if (i < k) gsap.to(s, { clipPath: "inset(0% 0% 100% 0%)", duration: d, ease: E.nt });
        else if (i === k) gsap.to(s, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, rotate: 0, duration: d, ease: E.nt });
        else gsap.to(s, { clipPath: "inset(0% 0% 0% 0%)", scale: 2, rotate: 15, duration: d, ease: E.nt });
      });
    };
    measure();
    addEventListener("resize", measure);
    return () => {
      const t = p();
      if (t >= 0.25 && !on) { on = true; ct(items, true); vt([title2], true); gsap.to(num, { yPercent: 0, duration: 1.2, ease: "expo.out" }); gsap.to(line, { scaleX: 1, duration: 1.2, ease: "expo.out" }); }
      if (t < 0.01 && on) { on = false; ct(items, false); vt([title2], false); gsap.set(num, { yPercent: -100 }); gsap.set(line, { scaleX: 0 }); }
      const n = seg(t, 0, 0.2), h = seg(t, 0.2, 0.4);
      overlay.style.opacity = 0.8 * (1 - n);
      grid.style.transform = `translate3d(0, ${-15 * (1 - n)}%, 0)`;
      grid.style.scale = 1 + h * (targetScale - 1);
      imgs.forEach((im) => (im.style.scale = 1.5 - 0.5 * h));
      const k = t >= 0.8 ? 2 : t >= 0.6 ? 1 : t >= 0.4 ? 0 : -1;
      if (k !== phase) { phase = k; if (k >= 0) go(k); }
    };
  })();

  // ── Project card — when visible the panel opens from top to bottom (1s cubic.inOut, even columns .05s later), then the circle, text, arrow and photo follow in turn
  $$("[data-panel]").filter((el) => el.matches("article")).forEach((card, i) => {
    const q = (s) => card.querySelector(`[data-panel='${s}']`);
    const e = pc() ? (i % 2) * 0.05 : 0;
    gsap.set(card, { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(q("issue"), { clipPath: "ellipse(0% 0% at 50% 50%)" });
    gsap.set([q("issue-text"), q("issue-number")], { yPercent: -100 });
    gsap.set(q("arrow"), { clipPath: "ellipse(0% 0% at 50% 50%)" });
    gsap.set(card.querySelector(".am-sol__img"), { scale: 1.2 });
    const io = watch(card, () => {
      io.disconnect();
      gsap.to(card, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, delay: e, ease: "cubic.inOut" });
      gsap.to(q("issue"), { clipPath: "ellipse(50% 50% at 50% 50%)", duration: 1, delay: e + 0.2, ease: "expo.out" });
      gsap.to([q("issue-text"), q("issue-number")], { yPercent: 0, duration: 1, delay: e + 0.25, ease: "expo.out" });
      gsap.to(q("arrow"), { clipPath: "ellipse(50% 50% at 50% 50%)", duration: 1, delay: e + 0.45, ease: "expo.out" });
      gsap.to(card.querySelector(".am-sol__img"), { scale: 1, duration: 1, delay: e + 0.6, ease: "expo.out" });
    });
  });

  // ── Reel + Work
  const reel = (() => {
    const target = $("[data-reel='target']");
    if (!target) return null;
    const mask = $("[data-reel='mask']"), marquee = $("[data-reel='marquee']"), title = $("[data-reel='title']"), leads = $$("[data-reel='lead']"), video = $("[data-reel='video']");
    const cases = $("[data-reel='cases']"), content = $("[data-reel='cases-content']");
    const articles = $$("[data-case='article']"), count = $("[data-case='count']"), countText = $("[data-case='count-text']"), badge = $("[data-case='badge']");
    const items = $$(".am-cases .am-cases__head [data-fx-part='item']");
    let p = prog(target), base = 16, end = 16, on = false;
    const measure = () => { p = prog(target); const cross = 3.6 * rem(); end = base * (innerHeight / cross); };
    measure();
    addEventListener("resize", measure);
    gsap.set(count, { clipPath: "ellipse(0% 0% at 50% 50%)" });
    gsap.set(countText, { yPercent: 100 });
    articles.forEach((a) => gsap.set(a, { clipPath: "inset(0% 0% 100% 0%)" }));
    if (badge) gsap.set(badge, { opacity: 0, scale: 1.1 });
    const casesIn = (v) => {
      ct(items, v);
      if (!v) {
        gsap.set(count, { clipPath: "ellipse(0% 0% at 50% 50%)" }); gsap.set(countText, { yPercent: 100 });
        articles.forEach((a) => { gsap.killTweensOf(a); gsap.set(a, { clipPath: "inset(0% 0% 100% 0%)" }); vt([a.querySelector("[data-fx~='wipe-swap-title']")], false); });
        if (badge) gsap.set(badge, { opacity: 0, scale: 1.1 });
        return;
      }
      gsap.to(count, { clipPath: "ellipse(50% 50% at 50% 50%)", duration: 0.8, delay: 0.8, ease: "expo.out" });
      gsap.to(countText, { yPercent: 0, duration: 0.8, delay: 0.88, ease: "expo.out" });
      articles.forEach((a, i) => {
        gsap.to(a, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, delay: 0.08 * i, ease: "cubic.inOut" });
        gsap.delayedCall(0.08 * i + 0.4, () => vt([a.querySelector("[data-fx~='wipe-swap-title']")], true));
      });
      if (badge) gsap.to(badge, { opacity: 1, scale: 1, duration: 0.8, delay: 0.8, ease: "expo.out" });
    };
    return () => {
      const t = p();
      if (t >= 0.95 && !on) { on = true; casesIn(true); }
      if (t < 0.8 && on) { on = false; casesIn(false); }
      if (pc()) {
        const s = seg(t, 0, 0.25), o = seg(t, 0.25, 0.5), g = seg(t, 0.4, 0.65), c = seg(t, 0.75, 1), w = seg(t, 0.95, 1);
        mask.style.translate = `0 ${100 - 100 * s}%`;
        marquee.style.translate = `0 ${25 - 25 * s}%`;
        const size = base + (end - base) * o;
        mask.style.maskSize = mask.style.webkitMaskSize = `100% 100%, ${size}rem ${size}rem`;
        title.style.opacity = g;
        leads.forEach((l, i) => { const z = (i + 1) * (0.03 * leads.length); l.style.opacity = seg(g, z, 1); });
        video.style.scale = 2 - o;
        cases.style.clipPath = `inset(${50 - 50 * c}% ${50 - 50 * c}% ${50 - 50 * c}% ${50 - 50 * c}%)`;
        content.style.opacity = w;
        content.style.translate = `0 ${10 - 10 * w}%`;
      } else {
        const s = seg(t, 0.5, 1), o = seg(t, 0.95, 1), l = 50 - 50 * s;
        mask.style.translate = "0 0";
        title.style.opacity = 1;
        leads.forEach((x) => (x.style.opacity = 1));
        cases.style.clipPath = `inset(${l}% ${l}% ${l}% ${l}%)`;
        content.style.opacity = o;
        content.style.translate = `0 ${10 - 10 * o}%`;
      }
    };
  })();

  // ── Apply — six pc ranges (original formula as is)
  const support = (() => {
    const target = $("[data-support='target']");
    if (!target) return null;
    const column = $("[data-support='column']"), block = $("[data-support='block']"), imgs = $$("[data-support='img']"), cur = $("[data-support='current']");
    const mask = $("[data-support='mask']"), sections = $$("[data-support='section']"), slides = $$("[data-support='slide']"), wrap = $("[data-support='sections']"), line = $("[data-support='line']");
    const items = $$(".am-support__head [data-fx-part='item']");
    let p = prog(target), targetScale = 1, on = false;
    const measure = () => { p = prog(target); const c = imgs[1]; targetScale = Math.max(innerWidth / c.offsetWidth, innerHeight / c.offsetHeight); };
    measure();
    addEventListener("resize", measure);
    gsap.set(line, { scaleX: 0, transformOrigin: "left" });
    if (pc()) gsap.set(wrap, { scaleY: 0, transformOrigin: "top" });
    return () => {
      const t = p();
      if (t >= 1 / 3 && !on) { on = true; ct(items, true); gsap.to(line, { scaleX: 1, duration: 1.2, ease: "expo.out" }); if (pc()) gsap.to(wrap, { scaleY: 1, duration: 1.2, ease: "expo.out" }); }
      if (t < 1 / 6 && on) { on = false; ct(items, false); gsap.set(line, { scaleX: 0 }); if (pc()) gsap.set(wrap, { scaleY: 0 }); }
      if (pc()) {
        const s = seg(t, 0, 1 / 6), o = seg(t, 1 / 6, 2 / 6), c = seg(t, 3 / 6, 4 / 6), g = seg(t, 4 / 6, 5 / 6), w = seg(t, 5 / 6, 1), S = seg(t, 0.2333, 0.3333);
        const all = c + g + w;
        column.style.translate = `0 ${97.5 * (1 - s)}rem`;
        block.style.opacity = S;
        imgs[0].style.transform = `translate3d(0, ${-50 * o}rem, 0)`;
        imgs[1].style.scale = 1 + o * (targetScale - 1);
        imgs[2].style.transform = `translate3d(0, ${50 * o}rem, 0)`;
        cur.style.transform = `translate3d(0, ${(-100 * all) / 4}%, 0)`;
        const I = 0.5 * c + 0.5 * w, R = 1 - 0.5 * c - 0.5 * w;
        mask.style.clipPath = `inset(calc(${25 * all}% + ${I}rem) 0% calc(${75 - 25 * all}% + ${R}rem) 0% round 1.5rem)`;
        sections.forEach((x) => (x.style.transform = `translate3d(0, ${2 * all}rem, 0)`));
        slides.forEach((x, i) => {
          x.style.transform = `translate3d(0, ${-50 * all}%, 0)`;
          if (i < 3) x.style.clipPath = `inset(0px 0px ${50 * [c, g, w][i]}%)`;
        });
      } else {
        const s = seg(t, 2 / 5, 3 / 5), o = seg(t, 3 / 5, 4 / 5), c = seg(t, 4 / 5, 1);
        column.style.translate = "0 0";
        block.style.opacity = 1;
        cur.style.transform = `translate3d(0, ${(-100 * (s + o + c)) / 4}%, 0)`;
        slides.forEach((x, i) => { x.style.transform = `translate3d(0, ${-50 * (s + o + c)}%, 0)`; if (i < 3) x.style.clipPath = `inset(0px 0px ${50 * [s, o, c][i]}%)`; });
      }
    };
  })();

  // ── Steps — section height = Sum of card widths + (screen − position) + 12rem. Pin the card row to the screen center and shift it by sum of widths × −.7714 × progress
  const flow = (() => {
    const target = $("[data-flow='target']"), secs = $("[data-flow='sections']");
    if (!target || !pc()) return null;
    let start = 0, range = 1, width = 0;
    const measure = () => {
      const cards = $$("[data-flow='section']");
      width = cards.reduce((n, c) => n + c.offsetWidth, 0);
      const half = cards[0].offsetHeight / 2, topPx = innerHeight / 2 - half;
      secs.style.top = `${topPx}px`;
      target.style.height = `calc(${width + (innerHeight - topPx)}px + 12rem)`;
      start = top(target);
      range = width + innerHeight * 0;
    };
    measure();
    addEventListener("resize", measure);
    return () => {
      const t = clamp((AM.scroll.y - start) / range, 0, 1);
      secs.style.transform = `translate3d(${width * -0.7714285714 * t}px, 0, 0)`;
    };
  })();

  // ── Customers — three phases: the photo row comes to center (s), photos gather to center (o), only the center photo shrinks into a rounded window (c)
  const clients = (() => {
    const target = $("[data-clients='target']");
    if (!target || !pc()) return null;
    const imgsBox = $("[data-clients='imgs']"), img = $$("[data-clients='img']"), inner = $$("[data-clients='img-inner']"), bg = $("[data-clients='bg']");
    const items = $$(".am-clients__back [data-fx-part='item']");
    const X = [300, 200, 100, 0, -100, -200, -300];
    let p = prog(target), tx = 0, ts = 1, on = false;
    const measure = () => {
      p = prog(target);
      const w = img.reduce((n, el) => n + el.offsetWidth, 0);
      tx = innerWidth / 2 - w / 2;
      ts = (22.5 * rem()) / img[3].offsetWidth;
    };
    measure();
    addEventListener("resize", measure);
    return () => {
      const t = p();
      if (t >= 0.75 && !on) { on = true; ct(items, true); }
      if (t < 0.65 && on) { on = false; ct(items, false); }
      const s = seg(t, 0, 1 / 3), o = seg(t, 1 / 3, 2 / 3), c = seg(t, 2 / 3, 1), m = 25 - 25 * s;
      imgsBox.style.transform = `translate3d(${s * tx}px, ${m}%, 0)`;
      imgsBox.style.translate = "none";
      img.forEach((el, i) => {
        el.style.transform = `translate3d(${X[i] * o}%, 0, 0)`;
        if (i === 3) {
          const k = 1 - c * (1 - ts), P = c * 17, O = c * 3;
          el.style.scale = k;
          el.style.clipPath = `inset(${P}% ${O}% ${P}% ${O}% round ${O}%)`;
        } else { el.style.opacity = t >= 2 / 3 ? 0 : 1; el.style.visibility = t >= 2 / 3 ? "hidden" : "visible"; }
      });
      inner.forEach((el) => (el.style.scale = 2 - s));
      bg.style.transform = `translate3d(0, ${m}%, 0)`;
      bg.style.opacity = 1 - o;
    };
  })();

  // Company — past 1/3 the front panel lifts up over 1.2s ei and the photo column rises −7.5% (spreading .12s from the end), while scrolling is paused
  const company = (() => {
    const target = $("[data-company='target']");
    if (!target || !pc()) return null;
    const front = $("[data-company='front']"), cols = $$("[data-company='marquee']"), text = $("[data-company='text']"), overlay = $("[data-company='overlay']");
    let p = prog(target), on = false;
    addEventListener("resize", () => (p = prog(target)));
    const move = (v) => {
      if (!reduce) { AM.wait(true); }
      gsap.killTweensOf([front, ...cols]);
      gsap.to(front, { yPercent: v ? -100 : 0, duration: 1.2, ease: E.ei });
      gsap.to(cols, { yPercent: v ? -7.5 : 0, duration: 1.2, ease: E.ei, stagger: { amount: v ? 0.12 : 0.1, from: "end" }, onComplete: () => AM.wait(false) });
    };
    return () => {
      const t = p();
      if (t >= 1 / 3 && !on) { on = true; move(true); }
      if (t < 1 / 3 && on) { on = false; move(false); }
      const s = seg(t, 2 / 3, 1);
      text.style.transform = `translate3d(0, ${-100 * s}%, 0)`;
      overlay.style.opacity = 0.8 * s;
    };
  })();

  // ── Contact panel background parallax — while passing the panel, ± half the panel height difference
  const conv = $$("[data-parallax]");
  const convPar = () => conv.forEach((el) => {
    const wrap = el.parentElement, r = el.getBoundingClientRect(), range = el.offsetHeight - wrap.offsetHeight;
    const pr = clamp((innerHeight - r.top) / ((innerHeight + r.height) / 100), 0, 100);
    el.style.transform = `translate3d(0, ${((pr / 100) * range - range / 2).toFixed(0)}px, 0)`;
  });

  // ── FAQ — on press, the vertical line goes 0→90° and the horizontal line 0→180° (.4s circ.out), and the answer opens via css row height (.8s).
  //    On hover, each line swaps in two layers (original icon-hover: clipped 45% up/down for vertical and 120% left/right for horizontal, 1s expo.out, .05·.1·.1·.2s)
  $$(".am-faq__item").forEach((item) => {
    const q = item.querySelector(".am-faq__q"), a = item.querySelector(".am-faq__a");
    const before = item.querySelector("[data-faq='before']"), after = item.querySelector("[data-faq='after']");
    const lb = item.querySelectorAll("[data-icon-line='b']"), la = item.querySelectorAll("[data-icon-line='a']");
    let open = false;
    q.addEventListener("click", () => {
      open = !open;
      q.setAttribute("aria-expanded", String(open));
      a.setAttribute("aria-hidden", String(!open));
      const d = reduce ? 0 : 0.4;
      gsap.to(before, { rotate: open ? 90 : 0, duration: d, ease: "circ.out" });
      gsap.to(after, { rotate: open ? 180 : 0, duration: d, ease: "circ.out" });
    });
    if (touch || reduce) return;
    const rest = () => {
      gsap.killTweensOf([...lb, ...la]);
      gsap.set(lb[0], { y: "0%", clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(lb[1], { y: "-45%", clipPath: "inset(0% 0% 105% 0%)" });
      gsap.set(la[0], { x: "0%", clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(la[1], { x: "-120%", clipPath: "inset(0% 0% 0% 105%)" });
    };
    rest();
    let busy = false, over = false;
    const enter = () => {
      busy = true;
      gsap.to(lb[0], { y: "45%", clipPath: "inset(105% 0% 0% 0%)", duration: 1, delay: 0.05, ease: "expo.out" });
      gsap.to(lb[1], { y: "0%", clipPath: "inset(0% 0% 0% 0%)", duration: 1, delay: 0.1, ease: "expo.out" });
      gsap.to(la[0], { x: "120%", clipPath: "inset(0% 105% 0% 0%)", duration: 1, delay: 0.1, ease: "expo.out" });
      gsap.to(la[1], { x: "0%", clipPath: "inset(0% 0% 0% 0%)", duration: 1, delay: 0.2, ease: "expo.out", onComplete: () => { busy = false; if (!over) rest(); } });
    };
    q.addEventListener("mouseenter", () => { over = true; if (!busy) enter(); });
    q.addEventListener("mouseleave", () => { over = false; if (!busy) rest(); });
  });

  // ── Icon circle reveal — when visible the background circle scales 0→1x and the arrow enters from below (or lower left) (1s expo.out, .1s later)
  $$(".am-icon").forEach((ic) => {
    const bg = ic.querySelector(".am-icon__bg"), arr = ic.querySelectorAll("[data-swap-arrow]"), diag = ic.dataset.icon === "diagonal";
    gsap.set(bg, { scale: 0 });
    gsap.set(arr, diag ? { xPercent: -100, yPercent: 100 } : { yPercent: 100 });
    const io = watch(ic, () => {
      io.disconnect();
      gsap.to(bg, { scale: 1, duration: 1, ease: "expo.out" });
      gsap.fromTo(arr[0], diag ? { xPercent: -100, yPercent: 100 } : { yPercent: 100 }, { xPercent: 0, yPercent: 0, duration: 1, delay: 0.1, ease: "expo.out" });
    });
  });

  const scenes = [wedo, reel, support, flow, clients, company].filter(Boolean);
  const tick = () => { fvParallax(); scenes.forEach((f) => f()); convPar(); };
  return {
    preload,
    reveal,
    header: headerIn,
    fv: fvIn,
    enter() {
      AM.onScroll.push(tick);
      tick();
      gsap.ticker.add(tick);
    },
  };
});
