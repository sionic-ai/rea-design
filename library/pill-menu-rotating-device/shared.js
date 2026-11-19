// Motion shared by all pages: Lenis (.8s·quart), a reveal set that plays once when visible (blurred words, line rise, line draw),
// 0→1 progress value while passing, a pill menu following the section color, dropping sub menu, search and phone drawer, a button at the top left, page transition blur.
// Page scripts add scenes with A.scene(fn) — line splitting must happen after fonts finish loading so the line count matches the original.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.remove("a-pre");
  const desk = () => innerWidth >= 834;
  const vh = () => innerHeight;

  const lenis = new Lenis({ duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Original Observer: calls as soon as even 1px enters. If once, calls one time and then detaches
  const observe = (el, fn, once = true) => {
    if (!el) return;
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      fn(e.isIntersecting);
      if (once && e.isIntersecting) io.disconnect();
    }), { threshold: 0 });
    io.observe(el);
  };
  // Original on-raf: from when the element’s top edge is at the screen bottom (0) until it has moved up out of view by the element height (1)
  const ticks = new Set();
  const progress = (el, fn) => {
    if (!el) return;
    const job = () => {
      const r = el.getBoundingClientRect();
      const p = gsap.utils.clamp(0, 1, (vh() - r.top) / (vh() + r.height));
      fn(p, r);
    };
    observe(el, (on) => (on ? ticks.add(job) : ticks.delete(job)), false);
  };
  gsap.ticker.add(() => ticks.forEach((f) => f()));

  const show = (el) => el && gsap.set(el, { autoAlpha: 1 });
  const fx = {
    // TitleReveal — per word, blur 10px for 1.3s, .1s stagger (default curve)
    title(el, opacity = 1) {
      if (!el) return;
      const s = new SplitText(el, { type: "words" });
      show(el);
      gsap.fromTo(s.words, { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: opacity, duration: 1.3, filter: "blur(0px)", stagger: 0.1 });
    },
    // CopyReveal — each line rises 40px over 1s, staggered .08s
    copy(el, opacity = 1) {
      if (!el) return;
      const s = new SplitText(el, { type: "lines" });
      show(el);
      gsap.fromTo(s.lines, { autoAlpha: 0, y: 40 }, { autoAlpha: opacity, duration: 1, stagger: 0.08, y: 0 });
    },
    // Body group — each line rises 50px from below with power3.out, staggered .05s
    lines(tl, el, at, dur = 0.6) {
      if (!el) return;
      const s = new SplitText(el.children.length ? el.children : el, { type: "lines" });
      show(el);
      tl.fromTo(s.lines, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, duration: dur, ease: "power3.out", y: 0, stagger: 0.05 }, at);
    },
    arrow(el) {
      if (!el) return;
      gsap.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, duration: 1, ease: "power3.out", y: 0 });
      hoverArrow(el);
    },
    pill(el) { el && gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }); },
    scroll(el) {
      if (!el) return;
      gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, ease: "power3.out", duration: 1, y: 0 });
      setTimeout(() => hoverScroll(el), 200);
    },
  };

  // ArrowLink hover reaction — the front arrow slides out 25px and the back arrow comes in (.5s power3.inOut), and the text blurs 1px for .4s then returns
  function hoverArrow(el) {
    const [a, b] = el.querySelectorAll(".a-arrow__icon svg");
    const label = el.querySelector(".a-arrow__label");
    if (!a || !b) return;
    const down = el.classList.contains("is-down");
    const m = { x: down ? 0 : 25, y: down ? 25 : 0 };
    gsap.fromTo(a, { x: 0, y: 0 }, { duration: 0.5, ease: "power3.inOut", ...m });
    gsap.fromTo(b, { autoAlpha: 1, x: -m.x, y: -m.y }, { duration: 0.5, ease: "power3.inOut", x: 0, y: 0 });
    if (label) requestAnimationFrame(() => {
      gsap.fromTo(label, { filter: "blur(0px)" }, { duration: 0.4, filter: "blur(1px)" });
      gsap.fromTo(label, { filter: "blur(1px)" }, { duration: 0.4, delay: 0.4, filter: "blur(0px)" });
    });
  }
  function hoverPill(el) {
    const [a, b] = el.querySelectorAll(".a-pill__label");
    if (!a || !b) return;
    gsap.fromTo(a, { y: 0 }, { duration: 0.5, ease: "power3.inOut", y: -20 });
    gsap.fromTo(b, { autoAlpha: 1, y: 20 }, { duration: 0.5, ease: "power3.inOut", y: 0 });
  }
  function hoverScroll(el) {
    const [a, b] = el.querySelectorAll("svg");
    if (!a || !b) return;
    gsap.fromTo(a, { y: 0 }, { duration: 0.6, ease: "power3.inOut", y: 35 });
    gsap.fromTo(b, { autoAlpha: 1, y: -35 }, { duration: 0.6, ease: "power3.inOut", y: 0 });
  }
  if (!reduce) {
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest(".a-arrow, .a-pill[data-hover], .a-scroll");
      if (!t || t.contains(e.relatedTarget)) return;
      if (t.classList.contains("a-arrow")) hoverArrow(t);
      else if (t.classList.contains("a-scroll")) hoverScroll(t);
      else hoverPill(t);
    });
  }
  document.addEventListener("click", (e) => {
    const s = e.target.closest(".a-scroll");
    if (s) lenis.scrollTo(lenis.scroll + vh(), { duration: 1 });
  });

  // ── Following the section color: the menu watches the 50px line at the screen top, the left button watches the line at the screen center
  const menu = document.querySelector("[data-menu]");
  const sticky = document.querySelector(".a-sticky");
  const stickyBtn = sticky && sticky.querySelector(".a-sticky__btn");
  const toneOf = (y) => {
    for (const s of document.querySelectorAll("[data-tone]:not([data-menu]):not(body)")) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y && r.height > 0) return s;
    }
    return null;
  };
  const toneVar = { paper: "--kf-bg", white: "--site-white", grey: "--kf-surface", soft: "--kf-raised", ink: "--kf-contrast-bg", night: "--site-night", accent: "--kf-accent", "accent-deep": "--site-accent-deep", key2: "--site-key2", light: "--kf-contrast-ink" };
  let stickyOn = false;
  const tail = document.querySelector(".a-tail");
  const mainEl = document.querySelector("[data-main]");
  function track() {
    const m = toneOf(50);
    if (m && menu && menu.dataset.tone !== m.dataset.tone) menu.dataset.tone = m.dataset.tone;
    if (sticky) {
      const s = toneOf(vh() / 2);
      if (s && s.dataset.logo) {
        const [bg, ink] = s.dataset.logo.split(":");
        stickyBtn.style.setProperty("--sl-bg", `var(${toneVar[bg]})`);
        stickyBtn.style.setProperty("--sl-ink", `var(${toneVar[ink]})`);
      }
      // Original StickyLogo: from after the body scrolls up by 1/3 of the screen until the bottom of the last text section touches the 4/3 line of the screen
      if (mainEl && tail) {
        const a = -vh() / 3;
        const on = mainEl.getBoundingClientRect().top <= a && tail.getBoundingClientRect().bottom - vh() + a >= 0;
        if (on !== stickyOn) {
          stickyOn = on;
          gsap.killTweensOf(stickyBtn);
          if (on) gsap.fromTo(stickyBtn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power3.out" });
          else gsap.fromTo(stickyBtn, { autoAlpha: 1 }, { autoAlpha: 0, delay: 0.1, duration: 0.5, ease: "power3.out" });
        }
      }
    }
    // Original Menu: hides when the footer top is 200px above, and shows again when the footer moves away after scrolling more than one screen down
    const foot = document.querySelector(".a-foot");
    if (menu && foot) {
      const top = foot.getBoundingClientRect().top;
      if (top <= 200) menu.classList.add("is-hidden");
      else if (menu.classList.contains("is-hidden") && scrollY > vh()) menu.classList.remove("is-hidden");
    }
  }
  gsap.ticker.add(track);
  stickyBtn && stickyBtn.addEventListener("click", () => lenis.scrollTo(0));

  // ── Menu
  if (menu) {
    const list = menu.querySelector(".a-nav__list");
    const box = menu.querySelector(".a-nav__box");
    const inner = menu.querySelector(".a-nav__inner");
    const title = menu.querySelector(".a-nav__title");
    const icons = [...menu.querySelectorAll("[data-menu-icon]")];
    let sub = "", busy = false, tl;
    const iconFor = (name) => (name === "search" ? "search" : name ? name : "home");
    function swapIcon(name) {
      const next = icons.find((i) => i.dataset.menuIcon === iconFor(name));
      const cur = icons.find((i) => !i.hidden);
      if (!next || next === cur) return;
      next.hidden = false;
      gsap.fromTo(next, { y: 40 }, { duration: 0.6, ease: "expo.inOut", y: 0 });
      if (cur) gsap.fromTo(cur, { y: 0 }, { duration: 0.6, ease: "expo.inOut", y: -40, onComplete: () => { cur.hidden = true; } });
    }
    const panel = (name) => menu.querySelector(`[data-sub-panel="${name}"]`);
    function openSub(name) {
      if (busy || sub === name) return;
      const p = panel(name);
      if (!p) return;
      if (name === "search" && desk()) return openSearch(p);
      sub = name;
      menu.classList.add("is-sub");
      p.classList.add("is-on");
      swapIcon(name);
      if (!desk() || reduce) return;
      busy = true;
      lenis.stop();
      const c = p.querySelector(".a-nav__sub-box"), i = p.querySelector(".a-nav__sub-inner");
      const items = [p.querySelector(".a-nav__sub-title"), p.querySelector(".a-nav__sub-list-title"), ...p.querySelectorAll(".a-nav__sub-item")].filter(Boolean);
      tl = gsap.timeline({ onComplete: () => { busy = false; } })
        .fromTo(list, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.7 }, 0)
        .fromTo(c, { yPercent: -100 }, { duration: 1, ease: "expo.inOut", yPercent: 0 }, 0)
        .fromTo(i, { yPercent: 100 }, { duration: 1, ease: "expo.inOut", yPercent: 0 }, 0)
        .fromTo(items, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.05, y: 0 }, 0.3);
    }
    function closeSub() {
      if (busy || !sub) return;
      const p = panel(sub);
      const done = () => {
        p.classList.remove("is-on");
        menu.classList.remove("is-sub");
        sub = "";
        busy = false;
      };
      swapIcon("");
      if (sub === "search" && desk()) return closeSearch(p, done);
      if (!desk() || reduce) { gsap.set(list, { autoAlpha: 1 }); return done(); }
      busy = true;
      lenis.start();
      const c = p.querySelector(".a-nav__sub-box"), i = p.querySelector(".a-nav__sub-inner");
      const items = [...p.querySelectorAll(".a-nav__sub-item")].reverse().concat([p.querySelector(".a-nav__sub-list-title"), p.querySelector(".a-nav__sub-title")].filter(Boolean));
      tl = gsap.timeline({ onComplete: done })
        .fromTo(items, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, duration: 0.7, ease: "power2.in", stagger: 0.05, y: 50 }, 0)
        .fromTo(c, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 0.1)
        .fromTo(i, { yPercent: 0 }, { yPercent: 100, duration: 1, ease: "expo.inOut" }, 0.1)
        .fromTo(list, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.6);
    }
    // Search: letters inside the pill switch off at .02s stagger (.3s) and the input floats up in their place over 1s
    function openSearch(p) {
      busy = true;
      lenis.stop();
      const field = p.querySelector(".a-nav__search");
      tl = gsap.timeline({ onComplete: () => { busy = false; p.querySelector("input").focus(); } })
        .fromTo(list.children, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, stagger: 0.02, onComplete: () => {
          sub = "search"; menu.classList.add("is-sub"); p.classList.add("is-on"); swapIcon("search");
        } }, 0)
        .fromTo(field, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.25);
    }
    function closeSearch(p, done) {
      lenis.start();
      const field = p.querySelector(".a-nav__search");
      gsap.fromTo(field, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5 });
      gsap.fromTo(list.children, { autoAlpha: 0 }, { autoAlpha: 1, delay: 0.5, duration: 0.6, stagger: 0.04 });
      setTimeout(done, 600);
    }
    // Phone drawer: the board from the top and the inside from the bottom interlock open with 1s expo.inOut, and the back blur turns on .7s later.
    function toggleDrawer() {
      if (busy) return;
      const open = menu.classList.contains("is-open");
      tl && tl.kill();
      if (open) {
        lenis.start();
        tl = gsap.timeline({ onComplete: () => { menu.classList.remove("is-open", "is-sub"); menu.querySelectorAll(".a-nav__sub.is-on").forEach((p) => p.classList.remove("is-on")); sub = ""; swapIcon(""); } })
          .fromTo(box, { yPercent: 0 }, { duration: 1, ease: "expo.inOut", yPercent: -100 }, 0.2)
          .fromTo(inner, { yPercent: 0 }, { duration: 1, ease: "expo.inOut", yPercent: 100 }, 0.2)
          .fromTo(box, { backdropFilter: "blur(20px)" }, { backdropFilter: "blur(0px)", duration: 0.2 }, 0);
      } else {
        lenis.stop();
        menu.classList.add("is-open");
        tl = gsap.timeline()
          .fromTo(box, { yPercent: -100 }, { duration: 1, ease: "expo.inOut", yPercent: 0 }, 0)
          .fromTo(inner, { yPercent: 100 }, { duration: 1, ease: "expo.inOut", yPercent: 0 }, 0)
          .fromTo(box, { backdropFilter: "blur(0px)" }, { backdropFilter: "blur(20px)", duration: 0.5 }, 0.7)
          .fromTo(title, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, duration: 0.6, ease: "power3.out", y: 0 }, 0.4)
          .fromTo(list.children, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.03, y: 0 }, 0.4);
      }
      menu.querySelector(".a-menu__burger").setAttribute("aria-expanded", String(!open));
    }
    menu.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sub]");
      if (b) { openSub(b.dataset.sub); return; }
      if (e.target.closest("[data-close]")) { closeSub(); return; }
      if (e.target.closest(".a-menu__burger")) toggleDrawer();
    });
    addEventListener("keyup", (e) => {
      if (e.key !== "Escape") return;
      if (sub) closeSub();
      else if (menu.classList.contains("is-open")) toggleDrawer();
    });
    // On first appearance: drops down 50px from above, .2s delay, then 1.2s power3.out
    if (!reduce) gsap.fromTo(menu, { autoAlpha: 0, y: -50 }, { autoAlpha: 1, delay: 0.2, duration: 1.2, ease: "power3.out", y: 0 });
    else gsap.set(menu, { autoAlpha: 1 });
  }

  // ── Two closing text cells: number and title as faded words, body rising line by line at .5 opacity, arrow link — the second cell .3s later
  const tailGrid = document.querySelector(".a-tail__grid");
  if (tailGrid) {
    observe(tailGrid, (on) => {
      if (!on) return;
      show(tailGrid);
      if (reduce) return;
      const tl = gsap.timeline();
      tailGrid.querySelectorAll(".a-tail__item").forEach((it, i) => {
        const d = i === 0 ? 0 : 0.3;
        tl.call(() => fx.title(it.querySelector(".a-tail__num")), [], d)
          .call(() => fx.title(it.querySelector(".a-tail__title")), [], d)
          .call(() => fx.copy(it.querySelector(".a-tail__copy"), 0.5), [], d + 0.1)
          .call(() => fx.arrow(it.querySelector(".a-arrow")), [], d + 0.6);
      });
    });
  }

  // ── Page transition: the old page blurs out (.6s), then the new document comes in with the same values
  const page = document.querySelector(".a-page");
  if (page && !reduce) {
    // Only documents arriving via our own links enter from 6px blur and transparent — a document opened first shows just the scene entrance, like the original
    if (root.classList.contains("a-pre")) requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("a-pre")));
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      if (menu && menu.classList.contains("is-open")) menu.querySelector(".a-menu__burger").click();
      try { sessionStorage.setItem("a-nav", "1"); } catch (_) {}
      page.classList.add("is-leave");
      document.body.style.setProperty("--page-bg", "var(--kf-bg)");
      setTimeout(() => { location.href = href; }, 600);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) page.classList.remove("is-leave"); });
  }

  // Build the page scene after all fonts have loaded
  const scenes = [];
  let ready = false;
  const run = (fn) => { if (reduce) document.querySelectorAll("[data-rv]").forEach(show); fn({ reduce, desk: desk(), observe, progress, fx, show, lenis }); };
  window.A = {
    lenis, observe, progress, fx, show, reduce,
    scene(fn) { ready ? run(fn) : scenes.push(fn); },
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    ready = true;
    if (reduce) document.querySelectorAll("[data-rv]").forEach(show);
    scenes.splice(0).forEach(run);
    ScrollTrigger.refresh();
  });
})();
