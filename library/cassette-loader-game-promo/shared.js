// Motion shared by all pages — carries over the order and values of the original settings and Common as they are.
// Transition curtain (three layers .05 apart) · menu drawer (skewX curtain + scattered lines gather + steps aside when hand hovers) · number shuffle letters · sequentially lit scroll effect · footer frame.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => innerWidth > 768;
  const mode = isPc() ? "pc" : "sp";
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // The original ShuffleText is a plate that shuffles only digits and leaves blank characters empty — give the same library the same values
  const shuffle = (target, ms) => {
    const els = typeof target === "string" ? $$(target) : target instanceof Element ? [target] : [...target];
    els.forEach((el) => {
      if (reduce || !window.ShuffleText) return;
      const st = new ShuffleText(el);
      st.sourceRandomCharacter = "1234567890";
      st.emptyCharacter = "";
      st.duration = ms;
      st.start();
    });
  };

  let lenis = null;
  const smooth = () => {
    if (lenis || reduce || mode !== "pc" || !window.Lenis) return;
    lenis = new Lenis();
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  // The original blocks only wheel and touch movement (it cuts the events, not lenis)
  const block = (e) => e.preventDefault();
  const stopScroll = () => { addEventListener("wheel", block, { passive: false }); addEventListener("touchmove", block, { passive: false }); };
  const startScroll = () => { removeEventListener("wheel", block); removeEventListener("touchmove", block); };

  const scrollToY = (y, dur = 1.2) => {
    if (reduce) return scrollTo(0, y);
    gsap.to(window, { duration: dur, scrollTo: { y, autoKill: false }, ease: "power2.inOut" });
  };

  // ===== Flip bar =====
  const blind = $(".et-blind");
  const bars = blind ? [1, 2, 3].map((n) => $(".et-blind__bg.is-" + n, blind)) : [];
  const axis = mode === "pc" ? "scaleX" : "scaleY";
  const leave = (href) => {
    if (!blind || reduce) { location.href = href; return; }
    blind.classList.add("is-active");
    const d = mode === "pc" ? [0.1, 0.05, 0] : [0.2, 0.1, 0];
    gsap.fromTo(bars[2], { [axis]: 0 }, { [axis]: 1, duration: 0.6, delay: d[2], ease: "power3.inOut" });
    gsap.fromTo(bars[1], { [axis]: 0 }, { [axis]: 1, duration: 0.6, delay: d[1], ease: "power3.inOut" });
    gsap.fromTo(bars[0], { [axis]: 0 }, { [axis]: 1, duration: 0.6, delay: d[0], ease: "power3.inOut", onComplete: () => { location.href = href; } });
  };
  const arrive = (done) => {
    if (!blind || !html.classList.contains("et-arrive")) return done();
    gsap.set(bars, { [axis]: 1 });
    html.classList.remove("et-arrive");
    if (reduce) { gsap.set(bars, { [axis]: 0 }); return done(); }
    gsap.fromTo(bars[0], { [axis]: 1 }, { [axis]: 0, duration: 0.6, delay: 0, ease: "power3.inOut" });
    gsap.fromTo(bars[1], { [axis]: 1 }, { [axis]: 0, duration: 0.6, delay: 0.05, ease: "power3.inOut" });
    gsap.fromTo(bars[2], { [axis]: 1 }, { [axis]: 0, duration: 0.6, delay: 0.1, ease: "power3.inOut", onComplete: done });
  };
  // When opened from cache via the back button, the curtain stays covering — so it reloads like the original
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.et-insite");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    e.preventDefault();
    leave(href);
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.et-anchor");
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href");
    const el = id === "#top" ? null : $(id);
    const off = Number(a.dataset[mode === "pc" ? "offsetPc" : "offsetSp"] || 0);
    scrollToY(el ? Math.floor(el.getBoundingClientRect().top + scrollY) + off : 0);
  });

  // ===== Menu Drawer =====
  const header = $(".et-header");
  const ham = $(".et-ham");
  const menu = $(".et-menu");
  const list = $(".et-menu__list");
  let busy = false;
  const openMenu = () => {
    header.classList.add("is-open");
    ham.querySelector("a").setAttribute("aria-expanded", "true");
    stopScroll();
    lenis?.stop();
    gsap.fromTo(".et-header__bg", { scaleX: 0, skewX: 20 }, { scaleX: 1, skewX: 0, duration: 0.6, ease: "circ.inOut", onComplete: () => {
      menu.hidden = false;
      menu.style.display = "block";
      list.classList.add("is-busy");
      shuffle(".et-menu__title", 800);
      $$(".et-menu .et-items > p").forEach((p) => {
        gsap.fromTo(p, { opacity: 0, y: 50 }, { delay: Math.floor(5 * Math.random()) / 10 + 0.3, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
      });
      $$("li", list).forEach((li) => {
        const m = Math.floor(3 * Math.random()) / 10;
        gsap.fromTo(li, { opacity: 0 }, { delay: m, opacity: 1, duration: 0.2, ease: "circ.out" });
        gsap.fromTo(li, { x: rand(-300, 300), y: rand(-100, 100), rotate: rand(-20, 20) }, { delay: m, x: 0, y: 0, rotate: 0, duration: 1, ease: "circ.out" });
      });
      gsap.fromTo(".et-menu__logo, .et-menu__text", { opacity: 0, y: 30 }, { delay: 0.8, opacity: 1, y: 0, duration: 0.4, ease: "circ.out", onComplete: () => {
        list.classList.remove("is-busy");
        busy = false;
      } });
    } });
  };
  const closeMenu = () => {
    header.classList.remove("is-open");
    ham.querySelector("a").setAttribute("aria-expanded", "false");
    list.classList.add("is-busy");
    startScroll();
    lenis?.start();
    gsap.to(menu, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => {
      list.classList.remove("is-busy");
      menu.removeAttribute("style");
      menu.hidden = true;
      gsap.to(".et-header__bg", { scaleX: 0, skewX: 20, duration: 0.4, ease: "circ.inOut", onComplete: () => { busy = false; } });
    } });
  };
  if (ham && menu) {
    ham.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (reduce) {
        const open = !header.classList.contains("is-open");
        header.classList.toggle("is-open", open);
        menu.hidden = !open;
        menu.style.display = open ? "block" : "";
        gsap.set(".et-header__bg", { scaleX: open ? 1 : 0, skewX: 0 });
        busy = false;
        return;
      }
      header.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open") && !busy) { busy = true; closeMenu(); } });
    $$("a", list).forEach((a) => a.addEventListener("click", () => { if (a.classList.contains("et-anchor") && !busy) { busy = true; closeMenu(); } }));
    // When hovering one row, the other rows shift up and down by (45 + 5 × cells away)px and sway ±5°
    if (mode === "pc" && !reduce) {
      const items = $$("li", list);
      items.forEach((li, i) => {
        li.querySelector("a").addEventListener("mouseenter", () => {
          const e = i + 1;
          gsap.to(li, { y: 0, rotate: 0, duration: 1, ease: "circ.out" });
          items.forEach((o, j) => {
            const t = j + 1;
            if (t === e) return;
            const dist = 45 + 5 * Math.abs(e - t);
            gsap.to(o, { y: t < e ? -dist : dist, rotate: rand(-5, 5), duration: 1, ease: "circ.out" });
          });
        });
      });
      list.addEventListener("mouseleave", () => gsap.to(items, { y: 0, duration: 1, ease: "circ.out" }));
    }
  }

  // ===== Scroll effect — original ScrollEvent: in document order, each item turns on one by one once it crosses the line 30% (phone 10%) up from the bottom of the screen =====
  const effects = {};
  const registerEffect = (name, fn) => { effects[name] = fn; };
  registerEffect("fade", (el, delay, dur) => gsap.fromTo(el, { opacity: 0, y: 0 }, { delay, opacity: 1, y: 0, duration: dur, ease: "power2.out", clearProps: "all" }));
  registerEffect("slideFade", (el, delay, dur) => gsap.fromTo(el, { opacity: 0, y: 100 }, { delay, opacity: 1, y: 0, duration: dur, ease: "circ.out", clearProps: "all" }));
  registerEffect("rotationSlide", (el, delay, dur) => {
    gsap.fromTo(el, { opacity: 0 }, { delay, opacity: 1, duration: dur / 2, ease: "power2.out" });
    gsap.fromTo(el, { x: rand(-400, 400), y: rand(-100, 100), rotate: rand(-10, 10) }, { delay, x: 0, y: 0, rotate: 0, duration: dur, ease: "circ.out", clearProps: "transform" });
  });
  registerEffect("shuffle", (el, delay, dur) => { el.style.opacity = ""; shuffle(el, 1000 * dur); });
  // Document line mask: an ink-colored bar is drawn with scaleX 0 to 1 (.6 circ.inOut), then the cover slides off to the right
  registerEffect("barReveal", (el, delay) => {
    const head = $$("[data-bar-head]", el), wrap = $$(".et-bar", el), cover = $$(".et-bar__cover", el);
    el.style.opacity = "";
    if (head.length) gsap.fromTo(head, { opacity: 0, y: 100 }, { delay, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    gsap.fromTo(wrap, { scaleX: 0 }, { delay: delay + 0.6, scaleX: 1, duration: 0.6, ease: "circ.inOut", onComplete: () => {
      gsap.set(wrap, { clearProps: "transform" });
      gsap.fromTo(cover, { scaleX: 1 }, { scaleX: 0, duration: 0.6, ease: "circ.inOut" });
    } });
  });
  // Cards flying in: from random spots·angles into place with 1s circ.out, .1s stagger · then props float up at 1+.2n seconds
  registerEffect("flyIn", (el) => {
    el.style.opacity = "";
    // Original link: cards x ±300, y ±50, ±20°, table stack (wide) x ±500, y ±300, ±20° (phone: vertical only)
    const pc = mode === "pc";
    $$("[data-fly]", el).forEach((c, i) => {
      const rx = c.dataset.fly === "wide" ? (pc ? rand(-500, 500) : 0) : rand(-300, 300);
      const ry = c.dataset.fly === "wide" ? rand(-300, 300) : rand(-50, 50);
      const rr = c.dataset.fly === "wide" ? (pc ? rand(-20, 20) : 0) : rand(-20, 20);
      gsap.fromTo(c, { opacity: 0 }, { delay: 0.1 * (i + 1), opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(c, { x: rx, y: ry, rotate: rr }, { delay: 0.1 * (i + 1), x: 0, y: 0, rotate: 0, duration: 1, ease: "circ.out" });
    });
    $$(".et-items > p", el).forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: 1 + 0.2 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
  });

  let groups = [], gi = 0;
  const runEffects = () => {
    const H = innerHeight, bottom = scrollY + H, start = H * (mode === "pc" ? 0.3 : 0.1);
    while (gi < groups.length) {
      const el = groups[gi];
      if (!(bottom - start > el.getBoundingClientRect().top + scrollY)) break;
      gi++;
      const fn = effects[el.dataset.eff];
      if (fn && !reduce) fn(el, Number(el.dataset.delay || 0), Number(el.dataset.time || 0));
      else el.style.opacity = "";
    }
  };
  const setEffects = () => {
    groups = $$("[data-eff]").filter((el) => mode === "pc" || !el.classList.contains("et-pc-only-eff"));
    gi = 0;
    const H = innerHeight;
    if (!reduce) gsap.set("[data-eff=flyIn] [data-fly], [data-eff=flyIn] .et-items > p", { opacity: 0 });
    groups.forEach((el) => {
      if (!reduce && el.dataset.alpha != null && el.getBoundingClientRect().top + scrollY >= H - 200) el.style.opacity = el.dataset.alpha;
    });
    runEffects();
  };

  // ===== Floating props (original showItems) — rise from 50px below after 1 + 0~.4s =====
  const showItems = () => {
    $$(".et-page-items > p").forEach((p) => {
      if (reduce) return;
      gsap.fromTo(p, { opacity: 0, y: 50 }, { delay: 1 + Math.floor(5 * Math.random()) / 10, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    });
  };

  // ===== Footer frame · side menu steps aside =====
  const footer = $(".et-footer");
  const limitEls = [$(".et-footer__frame"), $(".et-sidenav")].filter(Boolean);
  const onScroll = () => {
    if (footer) {
      const hit = scrollY + innerHeight >= footer.getBoundingClientRect().top + scrollY;
      limitEls.forEach((el) => el.classList.toggle("is-limit", hit));
    }
    runEffects();
    window.ET?.onScroll?.();
  };
  addEventListener("scroll", onScroll, { passive: true });

  // ===== SNS band — top row moves right, bottom row moves left, one cell per 10 seconds =====
  const linkMarquee = () => {
    const top = $(".et-link__text.is-top span"), bot = $(".et-link__text.is-bottom span"), sp = $(".et-link__text.is-sp span");
    if (!top || !bot) return;
    const m = top.getBoundingClientRect().width, p = bot.getBoundingClientRect().width;
    for (let d = 0; d < 4; d++) {
      top.parentNode.append(top.cloneNode(true));
      bot.parentNode.append(bot.cloneNode(true));
      if (sp) sp.parentNode.append(sp.cloneNode(true));
    }
    if (reduce) return;
    const loop = () => {
      gsap.fromTo(".et-link__text.is-top", { x: -m }, { x: 0, duration: 10, ease: "none" });
      if (mode === "sp" && sp) gsap.fromTo(".et-link__text.is-sp", { x: -m }, { x: 0, duration: 10, ease: "none" });
      gsap.fromTo(".et-link__text.is-bottom", { x: 0 }, { x: -p, duration: 10, ease: "none", onComplete: loop });
    };
    loop();
  };

  const showSubHeadline = () => {
    const name = $(".et-headline__title .is-name"), spacer = $(".et-headline__title .is-spacer");
    if (!name || !spacer) return;
    name.textContent = spacer.textContent;
    name.style.display = "";
    shuffle(name, 800);
    gsap.fromTo(".et-headline__text, .et-headline__icon", { opacity: 0, y: 10 }, { delay: 0.8, opacity: 1, y: 0, duration: 0.4, ease: "circ.out" });
  };

  // Common start for subpages (original settings.showContent) — when the curtain lifts the title mixes in and the guide text appears
  const startSub = () => {
    const name = $(".et-headline__title .is-name");
    if (name) name.style.display = "none";
    if (!reduce) gsap.set(".et-headline__text, .et-headline__icon", { opacity: 0 });
    $$(".et-ham, .et-pagetop, .et-backtotop").forEach((el) => el.classList.add("is-show"));
    smooth();
    arrive(showSubHeadline);
    setEffects();
    showItems();
  };

  window.ET = Object.assign(window.ET || {}, { mode, reduce, rand, shuffle, smooth, stopScroll, startScroll, scrollToY, setEffects, runEffects, registerEffect, showItems, linkMarquee, startSub, get lenis() { return lenis; } });
  addEventListener("load", () => ScrollTrigger?.refresh?.());
})();
