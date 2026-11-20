// Shared by the whole site — loader (word Flip)·barba transition (shrinks and blurs + opens from a center gap)·lenis·header bar hide·text rise·photo open·parallax·
// Menu text cloud, underline, magnet, menu drawer, Contact drawer, cookie, cursor-following tooltip. Values are the original durS .4 · durM .8 · durL 1.2 · stagger .1 · delay .3
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, Flip);
  CustomEase.create("InOut", "0.75,0,0.25,1");
  CustomEase.create("Out", "0.25,1,0.5,1");
  CustomEase.create("In", "0.5,0,0.75,0");
  CustomEase.create("Ease", "0.25,0.1,0.25,1");
  CustomEase.create("loaderEase", "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.79,0.904,0.86,1,1,1");
  const durS = 0.4, durM = 0.8, durL = 1.2, stagger = 0.1, delayReveal = 0.3, BP = 992;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LV = (window.LV = Object.assign(window.LV || {}, { durS, durM, durL, stagger, reduce, pages: {} }));
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.toggle("reduce", reduce);
  history.scrollRestoration = "manual";

  // ── Text, block, line and photo rise-ins (same values as the original animateTextH·P·Ctn·Line·Img)
  const split = (el) => {
    if (!el._split) {
      el._split = new SplitText(el, { type: "lines,words", tag: "span", linesClass: "split-line", wordsClass: "split-word", mask: "lines" });
    }
    return el._split;
  };
  const textH = (els, mode, delay) => {
    const tl = gsap.timeline();
    gsap.utils.toArray(els).forEach((el, i) => {
      if (!el.textContent.trim()) return;
      const s = split(el);
      gsap.set(el, { visibility: "visible" });
      if (mode === "reveal") tl.fromTo(s.words, { yPercent: 135 }, { yPercent: 0, duration: durL, delay: (delay ?? delayReveal) + i * stagger, stagger, ease: "Out", overwrite: true }, 0);
      else if (mode === "hide") tl.to(s.words, { yPercent: -135, duration: durS, delay: delay ?? 0, stagger: 0.25 * stagger, ease: "In", overwrite: true }, 0);
      else gsap.set(s.words, { yPercent: 135 });
    });
    return tl;
  };
  const textP = (els, mode, delay) => {
    const tl = gsap.timeline();
    gsap.utils.toArray(els).forEach((el, i) => {
      if (!el.textContent.trim()) return;
      const s = split(el);
      gsap.set(el, { visibility: "visible" });
      if (mode === "reveal") tl.fromTo(s.lines, { yPercent: 110 }, { yPercent: 0, duration: durL, delay: (delay ?? delayReveal) + i * stagger, stagger, ease: "Out", overwrite: true }, 0);
      else if (mode === "hide") tl.to(s.lines, { yPercent: -110, duration: durS, delay: delay ?? 0, stagger: 0.5 * stagger, ease: "In", overwrite: true }, 0);
      else gsap.set(s.lines, { yPercent: 110 });
    });
    return tl;
  };
  const ctn = (els, mode, delay) => {
    const a = gsap.utils.toArray(els);
    if (!a.length) return;
    gsap.set(a, { visibility: "visible" });
    if (mode === "reveal") return gsap.fromTo(a, { opacity: 0, y: "3.333rem" }, { opacity: 1, y: "0rem", duration: durL, delay: delay ?? delayReveal, stagger, ease: "Out", overwrite: true });
    if (mode === "hide") return gsap.to(a, { opacity: 0, y: "0rem", duration: durS, delay: delay ?? 0, stagger: 0.5 * stagger, ease: "In", overwrite: true });
    gsap.set(a, { opacity: 0, y: "3.333rem" });
  };
  const line = (els, mode, delay) => {
    const a = gsap.utils.toArray(els);
    if (!a.length) return;
    gsap.set(a, { visibility: "visible" });
    if (mode === "reveal") return gsap.fromTo(a, { clipPath: "inset(0% 100% -1px 0%)" }, { clipPath: "inset(0% 0% -1px 0%)", duration: durL, delay: delay ?? delayReveal, stagger, ease: "Out", overwrite: true });
    if (mode === "hide") return gsap.to(a, { clipPath: "inset(0% 0% -1px 100%)", duration: durS, delay: delay ?? 0, stagger: 0.5 * stagger, ease: "In", overwrite: true });
    gsap.set(a, { clipPath: "inset(0% 0% -1px 100%)" });
  };
  const slide = (els, mode, delay, dir = "next") => {
    const a = gsap.utils.toArray(els);
    if (!a.length) return;
    gsap.set(a, { visibility: "visible" });
    const inner = a.map((e) => e.firstElementChild).filter(Boolean);
    const [from, to] = { next: ["inset(0% 0% 100% 0%)", "inset(100% 0% 0% 0%)"], prev: ["inset(100% 0% 0% 0%)", "inset(0% 0% 100% 0%)"] }[dir];
    const tl = gsap.timeline({ defaults: { duration: durL, ease: "InOut", overwrite: true } });
    if (mode === "reveal") tl.delay(delay ?? delayReveal).fromTo(a, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)" }).fromTo(inner, { scale: 1.5 }, { scale: 1 }, "<");
    else if (mode === "hide") tl.delay(delay ?? 0).to(a, { clipPath: to }).to(inner, { scale: 1.5 }, "<");
    else { gsap.set(a, { clipPath: from }); gsap.set(inner, { scale: 1.5 }); }
    return tl;
  };
  const REVEAL = { h: textH, p: textP, ctn, line, slide };
  // Skin colors to paint on the canvas — variables resolved to real colors (including relative color and color-mix)
  const probe = document.createElement("i");
  probe.style.display = "none";
  LV.color = (v) => { if (!probe.isConnected) document.body.append(probe); probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
  Object.assign(LV, { textH, textP, ctn, line, slide, REVEAL });

  const showAll = (root) => qa("[data-scroll-reveal], [data-el]", root).forEach((e) => (e.style.visibility = "visible"));

  // Once when it enters the screen (original initScrollElementsReveal — group [data-scroll-reveal="w"] exists, use that unit)
  const scrollReveal = (root) => {
    if (reduce) return showAll(root);
    Object.entries(REVEAL).forEach(([k, fn]) => {
      const groups = new Map();
      qa(`[data-scroll-reveal="${k}"]`, root).forEach((el) => {
        const t = el.closest('[data-scroll-reveal="w"]') || el;
        if (!groups.has(t)) groups.set(t, []);
        groups.get(t).push(el);
      });
      groups.forEach((items, trigger) => {
        fn(items, "initial");
        ScrollTrigger.create({ trigger, start: "top bottom", once: true, onEnter: () => fn(items, "reveal", 0.2) });
      });
    });
    qa('[data-scroll-reveal="w"]', root).forEach((w) => (w.style.visibility = "visible"));
    qa('[data-scroll-reveal="card"]', root).forEach((el) => {
      el.style.visibility = "visible";
      gsap.fromTo(el, { yPercent: 35 }, { yPercent: 0, duration: durL, ease: "Out", scrollTrigger: { trigger: el, start: "top bottom" } });
    });
  };
  // Right after the turn, animate only what is visible on screen (original animateVisibleElements)
  const revealVisible = (root, mode) => {
    Object.entries(REVEAL).forEach(([k, fn]) => {
      qa(`[data-scroll-reveal="${k}"], [data-el="${k}"]`, root).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) fn(el, mode, 0);
      });
    });
  };

  // ── Parallax (original initAllParallax)
  const parallax = (root) => {
    if (reduce) return;
    const mob = innerWidth < BP;
    const ok = (w) => w && !(mob && w.dataset.mob === "off") && !(!mob && w.dataset.desk === "off");
    qa('[data-parallax="img"]', root).forEach((el) => {
      const w = el.closest('[data-parallax="w"]');
      if (ok(w)) gsap.fromTo(el, { yPercent: -15 }, { yPercent: 15, ease: "none", immediateRender: false, scrollTrigger: { trigger: w, start: "top bottom", scrub: true } });
    });
    qa("[data-parallax-s-out]", root).forEach((el) => {
      const d = innerWidth >= BP ? 50 : 30;
      gsap.to(el, { opacity: 0.3, yPercent: d, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    });
    if (!mob) {
      const f = q(".footer-w", root), main = f && q(".footer-s_main", f);
      if (main) gsap.fromTo(main, { yPercent: -50 }, { yPercent: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: f, start: "top bottom", end: "bottom bottom", scrub: true } });
    }
  };

  // ── lenis (original duration 1.2 · expo curve · syncTouch)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: true, touchMultiplier: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  LV.lenis = lenis;
  // Original lockScroll — keeps the scrollbar width as a variable, locks html, then stops lenis
  const lock = () => { const r = document.documentElement; r.style.setProperty("--scrollbar-width", `${innerWidth - r.clientWidth}px`); r.style.overflow = "hidden"; lenis?.stop(); };
  const unlock = () => { const r = document.documentElement; r.style.removeProperty("--scrollbar-width"); r.style.overflow = ""; lenis?.start(); };
  LV.lock = lock; LV.unlock = unlock;
  const toTop = () => { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); };

  // ── Header bar: hides after scrolling down 100px (yPercent −200), shows on scrolling up 40px or at the end (.8s Out)
  let headerScroll = null;
  const hideHeader = (root) => {
    const h = q("[data-header]", root);
    if (!h || reduce) return;
    let last = 0, upFrom = null;
    const onScroll = () => {
      const y = lenis ? lenis.scroll : scrollY, limit = lenis ? lenis.limit : document.documentElement.scrollHeight - innerHeight;
      const dir = y > last ? "down" : "up";
      if (dir === "up") { if (upFrom === null) upFrom = last; } else upFrom = null;
      last = y;
      if (y >= limit - 10 || (upFrom !== null && upFrom - y >= 40)) gsap.to(h, { yPercent: 0, duration: durM, ease: "Out", overwrite: true });
      else if (dir === "down" && y > 100) gsap.to(h, { yPercent: -200, duration: durM, ease: "Out", overwrite: true });
    };
    if (headerScroll) (lenis ? lenis.off("scroll", headerScroll) : removeEventListener("scroll", headerScroll));
    headerScroll = onScroll;
    lenis ? lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
  };
  // Header row text color — follows the background of the section at the header row’s center height (original initThemeChange)
  const headerTheme = (root) => {
    const h = q("[data-header]", root);
    if (!h) return;
    const mid = () => h.offsetTop + h.offsetHeight / 2 + 8;
    qa("[data-bg]", root).forEach((sec) => {
      const light = sec.dataset.bg === "light";
      const set = () => h.classList.toggle("on-light-text", light);
      ScrollTrigger.create({ trigger: sec, start: () => `top top+=${mid()}`, end: () => `bottom top+=${mid()}`, onEnter: set, onEnterBack: set });
    });
  };

  // ── Menu link letter cloud in two sets (.8s Out · .02s per letter) · underline (1.2s Out) · magnet (1.6s power4.out, elastic on release)
  const hovers = (root) => {
    if (innerWidth < BP || reduce) return;
    qa("[data-roll]", root).forEach((el) => {
      const [a, b] = qa(".roll > span", el);
      if (!a || !b || el._roll || el.getAttribute("aria-current") === "page") return;
      el._roll = true;
      const sa = new SplitText(a, { type: "chars", charsClass: "split-char" }), sb = new SplitText(b, { type: "chars", charsClass: "split-char" });
      if (el.matches(".ulink")) {
        [sa, sb].forEach((sp) => sp.chars.forEach((ch, i) => (ch.style.transitionDelay = `${(i * 0.0145).toFixed(4)}s`)));
        // The original button has a fixed width, so even if 12px on the left and 8px on the right spread apart, the panel width stays the same
        el.style.width = `${el.offsetWidth + 1.25 * parseFloat(getComputedStyle(document.documentElement).fontSize)}px`;
      }
      gsap.set(sb.chars, { yPercent: 100, opacity: 0 });
      const t = el.closest("[data-roll-trigger]") || el;
      t.addEventListener("mouseenter", () => {
        gsap.fromTo(sa.chars, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -100, duration: durM, ease: "Out", stagger: stagger / 5, overwrite: true });
        gsap.fromTo(sb.chars, { yPercent: 100, opacity: 0 }, { opacity: 1, yPercent: 0, duration: durM, ease: "Out", stagger: stagger / 5, overwrite: true });
      });
      t.addEventListener("mouseleave", () => {
        gsap.to(sa.chars, { opacity: 1, yPercent: 0, duration: durM, ease: "Out", stagger: stagger / 5, overwrite: true });
        gsap.to(sb.chars, { opacity: 0, yPercent: 100, duration: durM, ease: "Out", stagger: stagger / 5, overwrite: true });
      });
    });
    qa("[data-hover-link]", root).forEach((el) => {
      const ln = q(".u-line i", el);
      if (!ln || el._ul || el.getAttribute("aria-current") === "page") return;
      el._ul = true;
      gsap.set(ln, { xPercent: -101 });
      const t = el.closest("[data-ulink-trigger]") || el;
      t.addEventListener("mouseenter", () => gsap.fromTo(ln, { xPercent: -101 }, { xPercent: 0, duration: durL, ease: "Out", overwrite: true }));
      t.addEventListener("mouseleave", () => gsap.to(ln, { xPercent: 101, duration: durL, ease: "Out", overwrite: true }));
    });
    qa("[data-magnetic]", root).forEach((el) => {
      if (el._mag) return;
      el._mag = true;
      const k = parseFloat(el.dataset.magnetic) || 25, inner = qa("[data-magnetic-inner]", el);
      const reset = (t, now) => { gsap.killTweensOf(t); (now ? gsap.set : gsap.to)(t, { x: 0, y: 0, clearProps: "all", ...(!now && { ease: "elastic.out(1, 0.3)", duration: 1.6 }) }); };
      el.addEventListener("mouseenter", () => { reset(el, true); inner.forEach((i) => reset(i, true)); });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect(), dx = ((e.clientX - r.left) / el.offsetWidth - 0.5) * (k / 16), dy = ((e.clientY - r.top) / el.offsetHeight - 0.5) * (k / 16);
        gsap.to(el, { x: dx + "em", y: dy + "em", ease: "power4.out", duration: 1.6 });
        inner.forEach((i) => gsap.to(i, { x: dx + "em", y: dy + "em", ease: "power4.out", duration: 2 }));
      });
      el.addEventListener("mouseleave", () => { reset(el, false); inner.forEach((i) => reset(i, false)); });
    });
  };

  // ── Round guide following the mouse (original floating-tips — follows over 2.4s power3, clamped 8px inside the screen edge)
  const tips = (root) => {
    if (innerWidth < BP || reduce) return;
    const tipEls = new Map(qa("[data-tip]").map((t) => [t.dataset.tip, t]));
    const live = new Set(), pad = 8;
    const pos = (t, x, y) => {
      const r = t.getBoundingClientRect(), ox = r.left - (parseFloat(gsap.getProperty(t, "--x")) || 0), oy = r.top - (parseFloat(gsap.getProperty(t, "--y")) || 0);
      return { "--x": gsap.utils.clamp(pad - ox, innerWidth - r.width - pad - ox, x) + "px", "--y": gsap.utils.clamp(pad - oy, innerHeight - r.height - pad - oy, y) + "px" };
    };
    if (!LV._tipMove) {
      LV._tipMove = (e) => live.forEach((t) => gsap.to(t, { ...pos(t, e.clientX, e.clientY), duration: 2 * durL, ease: "power3" }));
      addEventListener("mousemove", LV._tipMove);
    }
    LV._tipLive = live;
    qa("[data-tip-trigger]", root).forEach((el) => {
      const t = tipEls.get(el.dataset.tipTrigger);
      if (!t) return;
      el.addEventListener("mouseenter", (e) => { gsap.set(t, pos(t, e.clientX, e.clientY)); t.classList.add("is-active"); LV._tipLive.add(t); });
      el.addEventListener("mouseleave", () => { t.classList.remove("is-active"); LV._tipLive.delete(t); });
    });
  };

  // ── Menu drawer (phone) — on open the curtain appears with .8s Out and the rows rise, icon rotates 90° ──
  const menu = () => {
    const btn = q("[data-menu-btn]"), m = q("[data-menu]");
    if (!btn || !m) return;
    const bg = q(".mm-bg", m), list = qa(".mm-list > *", m), ps = qa("[data-modal-p]", m), ico = q(".ico", btn);
    let open = false;
    const show = () => {
      gsap.set(m, { display: "block" }); open = true; btn.setAttribute("aria-expanded", "true");
      gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: durM, ease: "Out", overwrite: true });
      if (ico) gsap.to(ico, { rotate: 90, duration: durM, ease: "InOut" });
      ctn(list, "reveal"); textP(ps, "reveal"); lock();
    };
    const hide = () => {
      open = false; btn.setAttribute("aria-expanded", "false");
      gsap.to(bg, { opacity: 0, duration: durM, ease: "In", overwrite: true, onComplete: () => gsap.set(m, { display: "none" }) });
      if (ico) gsap.to(ico, { rotate: 0, duration: durM, ease: "InOut" });
      ctn(list, "hide"); textP(ps, "hide"); unlock();
    };
    btn.addEventListener("click", () => (open ? hide() : show()));
    qa("[data-menu-close]", m).forEach((c) => c.addEventListener("click", () => open && hide()));
    addEventListener("keydown", (e) => e.key === "Escape" && open && hide());
    LV.menuClose = () => open && hide();
  };

  // ── Contact Drawer (Let's Talk) — slides in from the right with 1.2s InOut, veil .8s
  const cta = () => {
    const m = q("[data-cta-modal]");
    if (!m) return;
    const c = q(".cm-c", m), over = q(".cm-over", m);
    let open = false;
    const show = () => {
      if (open) return; open = true; LV.menuClose?.();
      gsap.set(m, { display: "block" });
      gsap.fromTo(over, { opacity: 0 }, { opacity: 1, duration: durM, ease: "Out", overwrite: true });
      gsap.fromTo(c, { xPercent: 100 }, { xPercent: 0, duration: durL, ease: "InOut", overwrite: true });
      textH(qa("[data-cta-h]", m), "reveal", 0.4); textP(qa("[data-cta-p]", m), "reveal", 0.5); ctn(qa("[data-cta-ctn]", m), "reveal", 0.6);
      lock();
    };
    const hide = () => {
      if (!open) return; open = false;
      gsap.to(over, { opacity: 0, duration: durM, ease: "In", overwrite: true });
      gsap.to(c, { xPercent: 100, duration: durM, ease: "In", overwrite: true, onComplete: () => gsap.set(m, { display: "none" }) });
      unlock();
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-cta-open]")) { e.preventDefault(); show(); }
      else if (e.target.closest("[data-cta-close]")) hide();
    });
    addEventListener("keydown", (e) => e.key === "Escape" && hide());
    q("form", m)?.addEventListener("submit", (e) => e.preventDefault());
  };

  // ── Cookie card · City time · sun
  const cookies = () => {
    const c = q("[data-cookies]");
    if (!c) return;
    let seen = false;
    try { seen = localStorage.getItem("lv-cookies"); } catch (e) {}
    if (seen) return c.remove();
    // Original initCookies — rises from below with .8s Out (delayed .3s), and on choosing, drops by its own height with .8s In and disappears
    gsap.fromTo(c, { yPercent: 100 }, { yPercent: 0, duration: durM, delay: delayReveal, ease: "Out" });
    hovers(c);
    qa("[data-cookies-btn]", c).forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      try { localStorage.setItem("lv-cookies", b.dataset.cookiesBtn); } catch (e) {}
      gsap.to(c, { yPercent: 100, duration: durM, ease: "In", onComplete: () => c.remove() });
    }));
  };
  const clock = () => {
    const tick = () => qa("[data-time]").forEach((t) => (t.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })));
    tick(); setInterval(tick, 1000);
  };
  const years = (root) => qa("[data-year]", root).forEach((y) => (y.textContent = new Date().getFullYear()));

  // ── Credits Lottie — on hover it plays to halfway in 1s, on release it plays to the end (original 99 frames)
  const credits = (root) => {
    qa("[data-lottie-credit]", root).forEach((box) => {
      if (!window.lottie || box._anim) return;
      const host = box.closest(".credits") || box;
      const anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: LV.creditLottie() });
      box._anim = anim;
      anim.goToAndStop(0, true);
      const n = 99, tl = gsap.timeline({ paused: true }).to({ p: 0 }, { p: 1, duration: 1, ease: "none", onUpdate() { anim.goToAndStop(Math.round(this.targets()[0].p * (n - 1)), true); } });
      host.addEventListener("mouseenter", () => gsap.to(tl, { progress: 0.5, duration: 1 }));
      host.addEventListener("mouseleave", () => gsap.to(tl, { progress: 1, duration: 1 }));
    });
  };
  // Our Lottie — three bars fold and unfold to form a band (99 frames · first half open · second half closed)
  LV.creditLottie = () => {
    const ink = getComputedStyle(document.body).color.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => +v / 255);
    const bar = (i) => ({
      ty: 4, nm: "bar" + i, ind: i + 1, ip: 0, op: 99, st: 0, sr: 1, ao: 0, bm: 0, ddd: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [20 + i * 30, 12, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [100, 15, 100], o: { x: [0.75], y: [0] }, i: { x: [0.25], y: [1] } }, { t: 24 + i * 8, s: [100, 100, 100], o: { x: [0.75], y: [0] }, i: { x: [0.25], y: [1] } }, { t: 49, s: [100, 100, 100], o: { x: [0.75], y: [0] }, i: { x: [0.25], y: [1] } }, { t: 74 + i * 8, s: [100, 15, 100] }, { t: 98, s: [100, 15, 100] }] } },
      shapes: [{ ty: "rc", nm: "r", d: 1, s: { a: 0, k: [22, 20] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 } }, { ty: "fl", nm: "f", c: { a: 0, k: [...ink, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 }],
    });
    return { v: "5.12.2", fr: 60, ip: 0, op: 99, w: 100, h: 24, nm: "credit", ddd: 0, assets: [], layers: [0, 1, 2].map(bar) };
  };

  // ── Attach and detach one page (every transition)
  // During a transition, interaction response·credits are put off until after the hero is painted — the original is one bundle so transition start is fast (measured 61~133ms)
  const later = (fn) => requestAnimationFrame(() => setTimeout(fn, 0));
  const mount = (root, defer) => {
    LV.matchMedia = gsap.matchMedia();
    years(root);
    hideHeader(root);
    headerTheme(root);
    (defer ? later : (f) => f())(() => { hovers(root); tips(root); credits(root); });
    parallax(root);
    const ns = root.dataset.barbaNamespace;
    const fn = LV.pages[ns];
    const off = fn ? fn(root) : null;
    root._off = off;
  };
  const unmount = (root) => {
    root._off?.();
    LV.matchMedia?.revert();
    ScrollTrigger.getAll().forEach((t) => { if (root.contains(t.trigger)) t.kill(); });
    LV._tipLive?.forEach((t) => t.classList.remove("is-active"));
    LV._tipLive?.clear();
  };
  LV.mount = mount;

  // Load the incoming page’s css·js once up front
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    qa("link[data-page-css]", doc).forEach((l) => {
      const href = l.getAttribute("href");
      if (!q(`link[href="${href}"]`)) { const n = document.createElement("link"); n.rel = "stylesheet"; n.href = href; n.dataset.pageCss = ""; document.head.append(n); }
    });
    for (const s of qa("script[data-page-js]", doc)) {
      const src = s.getAttribute("src");
      if (q(`script[src="${src}"]`)) continue;
      await new Promise((ok) => { const n = document.createElement("script"); n.src = src; n.dataset.pageJs = ""; n.onload = n.onerror = ok; document.body.append(n); });
    }
  };

  // ── barba transition (original sync): the outgoing page is pinned at the current scroll position and shrinks to .75 while fading (1.2s InOut),
  //    the incoming page opens to full screen from the gap polygon at bottom center (1.2s InOut)
  const SHUT = "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%, 100% 100%, 100% 0%)";
  const OPEN = "polygon(0% 0%, 0% 100%, 45% 100%, 45% 50%, 55% 50%, 55% 50%, 45% 50%, 45% 100%, 100% 100%, 100% 0%)";
  LV.SHUT = SHUT; LV.OPEN = OPEN;
  const transitions = () => {
    if (!window.barba || !/^https?:$/.test(location.protocol) || reduce) return;
    // Original is one bundle, so nothing to fetch when navigating — the copy has separate css·js per page, so it prefetches when a hand nears a link
    const pre = new Set();
    document.addEventListener("pointerover", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("data-cta-open")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || pre.has(u.pathname)) return;
      pre.add(u.pathname);
      fetch(u.href).then((r) => r.text()).then(bring).catch(() => pre.delete(u.pathname));
    });
    barba.init({
      debug: false,
      preventRunning: true,
      timeout: 8000,
      prevent: ({ el }) => !!(el && (el.target === "_blank" || el.hasAttribute("data-cta-open") || (el.getAttribute("href") || "").startsWith("#"))),
      transitions: [{
        name: "default",
        sync: true,
        async beforeLeave({ current, next }) {
          // Close the incoming panel as soon as it is attached — otherwise it shows fully for one frame while the next css and js load
          if (next?.container) gsap.set(next.container, { clipPath: SHUT, zIndex: 1 });
          const y = scrollY;
          LV.menuClose?.();
          ScrollTrigger.getAll().forEach((t) => current.container.contains(t.trigger) && t.disable(false));
          current.container.style.pointerEvents = "none";
          current.container.classList.add("is-leaving");
          gsap.set(current.container, { position: "fixed", top: -y, left: 0, right: 0, zIndex: 0, transformOrigin: `center calc(${y}px + 50vh)` });
          lock();
          revealVisible(current.container, "hide");
        },
        leave({ current }) { return gsap.to(current.container, { opacity: 0, scale: 0.75, duration: durL, ease: "InOut" }); },
        afterLeave({ current }) { unmount(current.container); current.container.remove(); },
        async beforeEnter({ next }) {
          gsap.set(next.container, { clipPath: SHUT, zIndex: 1 });
          await bring(next.html);
          toTop();
          gsap.set(next.container, { zIndex: 1, height: "100vh", overflow: "hidden" });
          mount(next.container, true);
          later(() => { scrollReveal(next.container); ScrollTrigger.refresh(); });
        },
        async enter({ next }) {
          await gsap.fromTo(next.container, { clipPath: SHUT }, { clipPath: OPEN, duration: durL, ease: "InOut" });
          gsap.set(next.container, { clearProps: "clipPath,height,overflow,transform,zIndex" });
        },
        afterEnter() { lenis?.resize(); unlock(); ScrollTrigger.refresh(); },
      }],
    });
  };

  // ── Loader: first-time visitors get the word Flip loader (about 6s), returning visitors see the page appear in 1.2s
  const loaderIntro = (done) => {
    const ld = q("[data-loader]"), page = q('[data-barba="container"]');
    if (!ld || reduce) { if (ld) ld.hidden = true; return done(); }
    const words = qa(".ld-word", ld), img = q(".ld-img", ld), inner = q(".ld-img .ph", ld);
    const pct = q("[data-ld-pct]", ld), bar = q(".ld-top", ld), hs = qa('[data-el="h"]', ld), ps = qa('[data-el="p"]', ld);
    const L = LV.loaderLayout(ld);
    const place = (key) => words.forEach((w, i) => gsap.set(w, L[key][i]));
    place("p1");
    lock();
    const move = (key, opts = {}) => () => {
      const st = Flip.getState(words);
      place(key);
      Flip.from(st, { duration: durL, ease: "InOut", stagger: opts.stagger || 0, overwrite: true });
    };
    const seq = gsap.timeline()
      .add(move("p2", { stagger }))
      .to({}, { duration: durL + 4 * stagger })
      .add(move("p3"))
      .fromTo(img, { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: durL - 0.2, ease: "InOut" }, "<+=0.2")
      .fromTo(inner, { scale: 1.2 }, { scale: 1, duration: durL - 0.2, ease: "InOut" }, "<")
      .to({}, { duration: durS })
      .add(move("p2"))
      .to(img, { clipPath: "inset(50% 0% 50% 0%)", duration: durL - 0.4, ease: "InOut" }, "<")
      .to(inner, { scale: 1.2, duration: durL - 0.4, ease: "InOut" }, "<");
    gsap.timeline()
      .add(() => { textH(hs, "reveal", 0); textP(ps, "reveal", 0); })
      .to({}, { duration: durL })
      .to({ v: 0 }, { v: 100, duration: 3, ease: "loaderEase", onUpdate() { const v = this.targets()[0].v; pct.textContent = String(Math.round(v)).padStart(2, "0") + "%"; bar.style.setProperty("--progress", v / 100); } })
      .add(seq, "<")
      .fromTo(ld, { clipPath: OPEN }, { clipPath: SHUT, duration: 1.5 * durL, ease: "InOut" })
      .fromTo(page, { scale: 0.5, transformOrigin: "center 50vh" }, { scale: 1, duration: 1.5 * durL, ease: "InOut", onComplete: () => gsap.set(page, { clearProps: "scale,transform,transformOrigin" }) }, "<")
      .add(() => done(), "-=0.2")
      .add(() => { unlock(); ld.hidden = true; ScrollTrigger.refresh(); try { sessionStorage.setItem("lv-visited", "1"); } catch (e) {} });
  };
  // Three spots for four words (original grid cell p1 one row · p2 a row with photo gaps · p3 scatter) — measured by screen ratio and placed with left · top
  LV.loaderLayout = (ld) => {
    const W = innerWidth, H = innerHeight, mob = W < BP;
    const words = qa(".ld-word", ld), w = words.map((e) => e.offsetWidth), h = words[0].offsetHeight;
    const at = (fx, fy) => ({ left: fx * W, top: fy * H - h / 2 });
    const gap = 0.012 * W;
    let x = (W - (w.reduce((a, b) => a + b, 0) + gap * 3)) / 2;
    const p1 = w.map((ww) => { const o = { left: x, top: H / 2 - h / 2 }; x += ww + gap; return o; });
    const p2 = mob ? [at(0.02, 0.52), at(0.27, 0.52), at(0.63, 0.52), { left: W - w[3] - 0.02 * W, top: 0.52 * H - h / 2 }]
      : [at(0.09, 0.5), at(0.25, 0.5), at(0.59, 0.5), at(0.74, 0.5)];
    const p3 = mob ? [at(0.04, 0.36), at(0.22, 0.6), at(0.55, 0.8), { left: W - w[3] - 0.04 * W, top: 0.18 * H - h / 2 }]
      : [at(0.09, 0.38), at(0.25, 0.53), at(0.6, 0.87), at(0.74, 0.18)];
    return { p1, p2, p3 };
  };
  const loaderShort = (done) => {
    const ld = q("[data-loader]"), page = q('[data-barba="container"]');
    if (ld) ld.hidden = true;
    if (!reduce) gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: durL, ease: "Out" });
    done();
  };

  // ── Start
  const start = () => {
    const page = q('[data-barba="container"]');
    menu(); cta(); cookies(); clock();
    let visited = false;
    try { visited = sessionStorage.getItem("lv-visited"); } catch (e) {}
    if (/[?&]loader=1/.test(location.search)) visited = false;
    if (/[?&]loader=0/.test(location.search)) visited = true;
    mount(page);
    (visited ? loaderShort : loaderIntro)(() => {
      scrollReveal(page);
      if (!visited) revealVisible(page, "reveal");
      transitions();
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
