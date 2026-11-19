// Motion shared by all pages — smooth scroll (Lenis 1.1.20, inside the .tw-page panel like the original · only Work detail uses the window),
// After the loader: Hero opening, pill link brush hover, black button fill circle and arrow nudge, hamburger drawer, Contact curtain, section-head shadow title, line rise and pill bounce, Work card open, Footer.
// Loader, brush-stroke hover, text wiggle, magnetic pull, review pile and service path are handled by the library/_fx motion parts.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const html = document.documentElement;
  const page = document.querySelector(".tw-page");
  const inner = html.classList.contains("tw-inner");
  const scroller = inner ? page : window;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(pointer: coarse)").matches;
  const desktop = () => innerWidth >= 992;
  const TW = (window.TW = { scroller, reduce });

  // ── Smooth scroll ──────────────────────────────
  let lenis = null;
  if (!reduce && window.Lenis) {
    const ease = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
    lenis = inner
      ? new Lenis({
          wrapper: page, content: page, orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true,
          duration: touch ? 1.1 : 1.7, wheelMultiplier: 0.9, touchMultiplier: touch ? 1.6 : 2.6, touchInertiaMultiplier: touch ? 18 : 50,
          syncTouch: true, syncTouchLerp: touch ? 0.09 : 0.35, touchInertiaExponent: 2, easing: ease,
        })
      : new Lenis({ smoothWheel: true, duration: touch ? 1 : 1.5, wheelMultiplier: 0.85, touchMultiplier: 1.2, syncTouch: false, easing: ease });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    TW.lenis = lenis;
  }
  if (inner) ScrollTrigger.defaults({ scroller: page });
  addEventListener("load", () => { lenis?.resize(); ScrollTrigger.refresh(); });

  // After the loader (brush-sweep-loader) clears — same path even when entering via internal navigation and skipping the loader
  TW.ready = (fn) => {
    if (window.__fxLoaderDone || !document.querySelector(".tw-loader")) return fn();
    let fired = false;
    const go = () => { if (!fired) { fired = true; ScrollTrigger.refresh(); fn(); } };
    document.addEventListener("fx:done", go, { once: true });
    setTimeout(go, 8000);
  };

  // ── Text splitting ──
  // Each line gets a mask that clips overflow and is set 115% down — original hero-line-mask
  TW.lines = (el, cls = "tw-line") => {
    if (!el) return [];
    const split = new SplitText(el, { type: "lines", linesClass: cls });
    split.lines.forEach((line) => {
      const m = document.createElement("span");
      m.className = "tw-mask";
      line.before(m);
      m.append(line);
    });
    gsap.set(el, { opacity: 1 });
    gsap.set(split.lines, { yPercent: 115, opacity: 0, display: "block" });
    return split.lines;
  };
  // Pill label — pops in from 0.4× and 20px below with back.out(2.5), and the inner text rises inside a mask
  TW.pillsSet = (pills) => pills.forEach((p) => {
    gsap.set(p, { opacity: 0, scale: 0.4, y: 20, transformOrigin: "50% 50%" });
    const t = p.querySelector(".tw-tag__text, .tw-cta__in");
    if (t && !t.closest(".tw-mask")) {
      const m = document.createElement("span");
      m.className = "tw-mask";
      t.before(m);
      m.append(t);
    }
    if (t) gsap.set(t, { yPercent: 105, opacity: 0 });
  });
  TW.pillTo = (tl, p, at) => {
    tl.to(p, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(2.5)" }, at);
    const t = p.querySelector(".tw-tag__text, .tw-cta__in");
    if (t) tl.to(t, { yPercent: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, at + 0.15);
  };
  // Brush-stroke drawing — thickness swells from 0 to the original thickness together
  TW.drawSet = (paths) => paths.map((p) => {
    const L = p.getTotalLength(), w = parseFloat(p.getAttribute("stroke-width")) || 12;
    gsap.set(p, { strokeDasharray: `${L} ${L * 2}`, strokeDashoffset: L, strokeWidth: 0 });
    return { p, w };
  });
  TW.drawTo = (tl, items, at, gap = 0.15) => items.forEach(({ p, w }, i) =>
    tl.to(p, { strokeDashoffset: 0, strokeWidth: w, duration: 0.9, ease: "power2.out" }, at + i * gap));

  // Section opening screen (title lines → pill → brush stroke → image → paragraph) — all the original heroes run at .75x speed
  TW.hero = (root, { pillAt = null, pathAt = 0.4, art = null, artAt = 0.45, paraAt = 0.5 } = {}) => {
    if (!root || reduce) return;
    const lines = [...root.querySelectorAll("[data-hero-line]")].flatMap((h) => TW.lines(h));
    const pills = [...root.querySelectorAll("[data-hero-pill]")];
    const paths = TW.drawSet([...root.querySelectorAll("[data-hero-path] path")]);
    const paras = [...root.querySelectorAll("[data-hero-para]")].flatMap((p) => TW.lines(p, "tw-line"));
    const artEl = art && root.querySelector(art);
    TW.pillsSet(pills);
    if (artEl) gsap.set(artEl, { opacity: 0, scale: 0.65, rotation: -6, transformOrigin: "50% 50%" });
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } }).timeScale(0.75);
    tl.to(lines, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: "back.out(1.4)" }, 0);
    const T = lines.length ? lines.length * 0.12 + 0.5 : 1.2;
    pills.forEach((p, i) => TW.pillTo(tl, p, pillAt ? T * (pillAt[i] ?? (i + 1) * 0.25) : 0.2 + (i / Math.max(1, pills.length)) * T * 0.7));
    TW.drawTo(tl, paths, T * pathAt);
    if (artEl) tl.to(artEl, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: "back.out(2.2)" }, T * artAt);
    if (paras.length) tl.to(paras, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "back.out(1.4)" }, T * paraAt);
    TW.ready(() => tl.play());
  };

  // ── Pill link: a brush stroke fills the pill ─────────────────
  document.querySelectorAll(".tw-pill-link").forEach((a) => {
    const p = a.querySelector(".tw-pill-link__stroke path");
    if (!p || reduce) return;
    const L = p.getTotalLength(), w = parseFloat(p.getAttribute("stroke-width")) || 36;
    gsap.set(p, { strokeDasharray: `${L} ${L * 2}`, strokeDashoffset: L, strokeWidth: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } }).to(p, { strokeDashoffset: 0, strokeWidth: w, duration: 0.5 });
    a.addEventListener("mouseenter", () => tl.timeScale(1).play());
    a.addEventListener("mouseleave", () => tl.timeScale(1.4).reverse());
  });

  // ── Black button: fill circle 10x + arrow nudge (the pull is magnet-pull) ───
  document.querySelectorAll(".tw-cta").forEach((b) => {
    const fill = b.querySelector(".tw-cta__fill"), arrow = b.querySelector(".tw-cta__arrow");
    let loop = null;
    b.addEventListener("mouseenter", () => {
      if (fill) gsap.to(fill, { scale: 10, duration: 0.55, ease: "power2.out", overwrite: "auto" });
      if (!arrow) return;
      loop?.kill();
      loop = gsap.timeline({ repeat: -1, repeatDelay: 0.2 })
        .to(arrow, { rotation: -25, duration: 0.22, ease: "power2.out", transformOrigin: "50% 50%" })
        .to(arrow, { rotation: 0, duration: 0.4, ease: "back.out(2.5)" });
    });
    b.addEventListener("mouseleave", () => {
      loop?.kill();
      loop = null;
      if (arrow) gsap.to(arrow, { rotation: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
      if (fill) gsap.to(fill, { scale: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" });
    });
  });

  // ── Hamburger: the horseshoe line shrinks to a stem, rotates 45° and a cross stroke is drawn ───
  (() => {
    const btn = document.querySelector(".tw-ham"), drawer = document.querySelector(".tw-drawer");
    if (!btn || !drawer) return;
    const bend = btn.querySelector(".tw-ham__bend"), cross = btn.querySelector(".tw-ham__cross"), svg = btn.querySelector("svg");
    const total = bend.getTotalLength(), stem = 20, shoe = total - stem, crossL = cross.getTotalLength();
    const dash = { len: shoe, off: 0 };
    const paint = () => { bend.style.strokeDasharray = `${dash.len} ${total}`; bend.style.strokeDashoffset = `${dash.off}`; };
    paint();
    gsap.set(cross, { strokeDasharray: `${crossL} ${crossL}`, strokeDashoffset: crossL, strokeWidth: 0 });
    gsap.set(svg, { rotation: 0, transformOrigin: "50% 50%" });
    const icon = gsap.timeline({ paused: true })
      .to(dash, { len: stem, off: -(total - stem), duration: 0.85, ease: "power2.inOut", onUpdate: paint }, 0)
      .to(cross, { strokeWidth: 4, duration: 0.12, ease: "back.out(2)" }, 0.1)
      .to(cross, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, 0.2)
      .to(svg, { rotation: 45, duration: 0.85, ease: "power3.inOut" }, 0);
    const items = [...drawer.querySelector(".tw-drawer__links").children];
    let open = false, tl = null;
    const show = () => {
      open = true;
      icon.play();
      btn.setAttribute("aria-expanded", "true");
      drawer.style.display = "flex";
      tl?.kill();
      tl = gsap.timeline().fromTo(drawer, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0);
      items.forEach((it, i) => tl.fromTo(it, { opacity: 0, x: -35, y: 50, scale: 0.4, rotation: gsap.utils.random(-10, 10) },
        { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.75, ease: "back.out(2.2)" }, 0.15 + i * 0.09));
      lenis?.stop();
    };
    const hide = () => {
      icon.reverse();
      btn.setAttribute("aria-expanded", "false");
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { drawer.style.display = "none"; open = false; lenis?.start(); } })
        .to(items, { opacity: 0, y: 20, scale: 0.8, duration: 0.25, stagger: 0.04, ease: "power2.in" }, 0)
        .to(drawer, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0.1);
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); open ? hide() : show(); });
    items.forEach((it) => it.addEventListener("click", () => open && hide()));
  })();

  // ── Contact cover ─────────────────────────────────
  (() => {
    const box = document.querySelector(".tw-contact");
    if (!box) return;
    const covers = [...box.querySelectorAll(".tw-contact__cover path")];
    const logo = box.querySelector(".tw-contact__logo"), close = box.querySelector(".tw-contact__close"), closeText = close?.querySelector(".tw-pill-link__text");
    const body = box.querySelector(".tw-contact__body");
    const heads = [...box.querySelectorAll(".tw-contact__h")];
    const chars = heads.flatMap((h) => new SplitText(h, { type: "chars,words", charsClass: "tw-char", wordsClass: "tw-chars-word" }).chars);
    const paraLines = [...box.querySelectorAll(".tw-contact__para")].flatMap((p) => {
      const s = new SplitText(p, { type: "lines" });
      s.lines.forEach((l) => { const m = document.createElement("span"); m.className = "tw-mask"; l.before(m); m.append(l); });
      return s.lines;
    });
    const mailHeads = [...box.querySelectorAll(".tw-contact__mail-h")].flatMap((h) => {
      const s = new SplitText(h, { type: "words" });
      s.words.forEach((w) => { const m = document.createElement("span"); m.className = "tw-mask"; m.style.display = "inline-block"; w.before(m); m.append(w); });
      return s.words;
    });
    const mails = [...box.querySelectorAll(".tw-contact__mail a")];
    const socials = [...box.querySelectorAll(".tw-contact__social")];
    const art = box.querySelector(".tw-contact__art");
    const RIM = "0.4px 0.4px 0 currentColor, -0.4px -0.4px 0 currentColor, 0.4px -0.4px 0 currentColor, -0.4px 0.4px 0 currentColor";
    const NONE = "0px 0px 0px transparent";
    let isOpen = false, tl = null;
    const reset = () => {
      tl?.kill();
      gsap.set([body, box.querySelector(".tw-contact__bar")], { opacity: 1, y: 0 });
      if (logo) gsap.set(logo, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      if (close) gsap.set(close, { opacity: 0, scale: 0.4, y: 20 });
      if (closeText) gsap.set(closeText, { opacity: 0, y: 15 });
      covers.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, strokeWidth: 0 }); });
      gsap.set(chars, { opacity: 0, scale: 0.5, rotation: 0, textShadow: NONE });
      gsap.set(paraLines, { yPercent: 115, opacity: 0 });
      gsap.set(mailHeads, { yPercent: 105, opacity: 0 });
      gsap.set(mails, { opacity: 0, y: 15 });
      gsap.set(socials, { opacity: 0, scale: 0.4, y: 20 });
      if (art) gsap.set(art, { opacity: 0, scale: 0.8, rotation: gsap.utils.random(-3, 3), transformOrigin: "50% 100%" });
    };
    reset();
    const openIt = () => {
      if (isOpen) return;
      isOpen = true;
      reset();
      box.style.display = "flex";
      lenis?.stop();
      tl = gsap.timeline();
      covers.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, strokeWidth: 1600, duration: 0.9, ease: "power2.inOut" }, i * 0.1));
      const c0 = covers.length ? 0.45 : 0;
      if (logo) tl.to(logo, { scale: 1, opacity: 1, duration: 0.65, ease: "back.out(2.2)" }, c0);
      if (close) tl.to(close, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(2.5)" }, c0 + 0.1);
      if (closeText) tl.to(closeText, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, c0 + 0.22);
      chars.forEach((ch, i) => {
        const at = c0 + 0.15 + i * 0.022;
        tl.to(ch, { opacity: 1, scale: 1.1, rotation: gsap.utils.random(-6, 6), textShadow: RIM, duration: 0.45, ease: "back.out(2.5)" }, at)
          .to(ch, { scale: 1, rotation: 0, textShadow: NONE, duration: 0.6, ease: "power2.out" }, at + 0.45);
      });
      tl.to(paraLines, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "back.out(1.4)" }, c0 + 0.3)
        .to(mailHeads, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "back.out(1.5)" }, c0 + 0.25)
        .to(mails, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.5)" }, c0 + 0.35);
      socials.forEach((s, i) => tl.to(s, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(2.5)" }, c0 + 0.45 + i * 0.12));
      if (art) tl.to(art, { opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: "back.out(1.8)" }, c0 + 0.4);
    };
    const closeIt = () => {
      if (!isOpen) return;
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { box.style.display = "none"; isOpen = false; reset(); lenis?.start(); } })
        .to([close, body, ...socials].filter(Boolean), { opacity: 0, y: -15, duration: 0.3, ease: "power2.in" }, 0);
      if (logo) tl.to(logo, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }, 0);
      if (art) tl.to(art, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }, 0);
      covers.forEach((p) => tl.to(p, { strokeDashoffset: p.getTotalLength(), strokeWidth: 0, duration: 0.45, ease: "power2.in" }, 0.1));
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest(".tw-contact__close")) { e.preventDefault(); return closeIt(); }
      const t = e.target.closest("[data-contact]");
      if (t && !t.closest(".tw-contact")) { e.preventDefault(); openIt(); }
    });
    addEventListener("keydown", (e) => e.key === "Escape" && closeIt());
  })();

  // ── Section head: orange shadow title moves up to 4px toward the cursor ───
  document.querySelectorAll(".tw-sec-head").forEach((head) => {
    const wrap = head.querySelector(".tw-sec-head__title"), ghost = wrap?.querySelector(".is-ghost");
    if (!ghost || reduce) return;
    head.addEventListener("pointermove", (e) => {
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const k = Math.min(1, Math.max(0.25, Math.hypot(dx, dy) / (Math.max(r.width, r.height) / 2 || 100))), a = Math.atan2(dy, dx);
      gsap.to(ghost, { x: Math.cos(a) * k * 4, y: Math.sin(a) * k * 4, duration: 0.2, ease: "power1.out", overwrite: "auto" });
    }, { passive: true });
    head.addEventListener("pointerleave", () => gsap.to(ghost, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1.1, 0.4)", overwrite: "auto" }));
  });

  // ── Work card: opens from the center 42.5% hole as the 3D tilt unwinds ───
  TW.cards = (root) => {
    if (!root || reduce) return;
    root.querySelectorAll(".tw-card").forEach((card, i) => {
      const clip = card.closest(".tw-card-clip");
      if (!clip) return;
      gsap.set(clip, { clipPath: "inset(42.5% 42.5% 42.5% 42.5%)", borderRadius: 36 });
      gsap.set(card, { scale: 1.45, rotationX: 25, rotationY: i % 2 ? 16 : -16, rotation: i % 2 ? 4 : -4, transformPerspective: 800, transformOrigin: "50% 50%" });
      gsap.timeline({ scrollTrigger: { trigger: clip, start: "top 85%", toggleActions: "play none none reverse", invalidateOnRefresh: true } })
        .to(clip, { clipPath: "inset(0% 0% 0% 0%)", borderRadius: 0, duration: 1.25, ease: "power3.out" }, 0)
        .to(card, { scale: 1, rotationX: 0, rotationY: 0, rotation: 0, duration: 1.25, ease: "power3.out" }, 0);
    });
  };
  // “There’s more” finish — lines · pills · buttons at .75x speed
  TW.ending = (root) => {
    if (!root || reduce) return;
    const lines = TW.lines(root.querySelector("[data-end-para]"));
    const pills = [...root.querySelectorAll("[data-end-pill]")], btn = root.querySelector("[data-end-btn]");
    TW.pillsSet(pills.concat(btn ? [btn] : []));
    const tl = gsap.timeline({ paused: true }).timeScale(0.75);
    tl.to(lines, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: "back.out(1.4)" }, 0);
    const T = lines.length * 0.12 + 0.5;
    pills.forEach((p, i) => TW.pillTo(tl, p, 0.2 + (i / Math.max(1, pills.length)) * T * 0.7));
    if (btn) TW.pillTo(tl, btn, T + 0.15);
    ScrollTrigger.create({ trigger: root, start: "top 80%", once: true, onEnter: () => tl.play() });
  };

  // ── Footer ───────────────────────────────────
  (() => {
    const foot = document.querySelector(".tw-footer");
    if (!foot || reduce) return;
    const lines = TW.lines(foot.querySelector(".tw-footer__h"));
    gsap.to(lines, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.6)", scrollTrigger: { trigger: foot, start: "top 80%", toggleActions: "play none none none" } });
    const mark = foot.querySelector(".tw-footer__btm");
    if (!mark) return;
    gsap.set(mark, { scaleY: 0.15, transformOrigin: "50% 100%" });
    let settled = false;
    const settle = () => { if (settled) return; settled = true; gsap.killTweensOf(mark); gsap.to(mark, { scaleY: 1, duration: 1.4, ease: "elastic.out(1.2, 0.35)", overwrite: "auto" }); };
    ScrollTrigger.create({
      trigger: foot, start: "top bottom", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (s) => {
        if (s.progress >= 0.9) return settle();
        settled = false;
        const v = Math.min(Math.abs(s.getVelocity() || 0) / 1500, 0.25);
        const want = s.direction === 1 ? 0.15 + s.progress * 1.15 + v : 0.15 + s.progress * 0.95;
        gsap.to(mark, { scaleY: Math.max(0.15, Math.min(want, 1.4)), duration: 0.1, ease: "power1.out", overwrite: "auto" });
      },
      onLeave: settle,
      onLeaveBack: () => { settled = false; gsap.killTweensOf(mark); gsap.to(mark, { scaleY: 0.15, duration: 0.25, ease: "power2.out", overwrite: "auto" }); },
    });
  })();
})();
