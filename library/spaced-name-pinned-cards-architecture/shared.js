// Common to all pages: Lenis + ScrollTrigger, header collapse, menu drawer, line- and letter-level entrances, curtain page transition.
(() => {
  const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // Original curves — transitions and Hero use gl.fastInOut, exiting text uses gl.quicky. Motion with no curve given is linear like the original.
  CustomEase.create("gl.fastInOut", "M0,0 C0.094,0.026 0.125,0.096 0.158,0.259 0.186,0.396 0.239,0.777 0.303,0.866 0.387,0.984 0.476,1 1,1");
  CustomEase.create("gl.quicky", "M0,0 C0.094,0.026 0.124,0.127 0.157,0.29 0.197,0.486 0.245,0.831 0.348,0.906 0.431,0.966 0.374,1 1,1");
  CustomEase.create("gl.inOut", "M0,0 C0.2,0 0,1 1,1");
  CustomEase.create("gl.smoothInOut", "0.5, 0, 0, 1");
  gsap.defaults({ ease: "none" });
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "expo.out";

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ easing: (t) => 1 - (1 - t) ** 5, syncTouch: true, syncTouchLerp: 0.07, touchInertiaExponent: 1.7, touchMultiplier: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Over the hero photo the header text is white, after it the menu row folds and the round button comes out
  const hero = document.querySelector("[data-hero]");
  const compactAt = () => (hero ? hero.offsetHeight - 60 : 120);
  const onScroll = () => {
    const y = lenis ? lenis.animatedScroll : scrollY;
    root.classList.toggle("is-compact", y > compactAt());
    root.classList.toggle("is-over-hero", Boolean(hero) && y < hero.offsetHeight - 30);
  };
  if (lenis) lenis.on("scroll", onScroll);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu drawer: clip releases from top to bottom (0.7s ease-out) and the lines inside rise at 0.05s intervals
  const menu = document.querySelector("[data-menu]");
  const shade = document.querySelector("[data-menu-shade]");
  const toggles = document.querySelectorAll("[data-menu-toggle]");
  if (menu) {
    const items = menu.querySelectorAll(".reveal-in");
    const media = [...menu.querySelectorAll(".menu__media .wf-img")];
    let open = false;
    const set = (on) => {
      open = on;
      root.classList.toggle("is-menu-open", on);
      toggles.forEach((b) => b.setAttribute("aria-expanded", String(on)));
      if (lenis) on ? lenis.stop() : lenis.start();
      const d = reduce ? 0 : 1;
      if (on) {
        gsap.set([menu, shade], { visibility: "visible" });
        gsap.to(menu, { clipPath: "inset(0 0 0% 0)", duration: 0.7 * d, ease: "power3.out", overwrite: true });
        gsap.to(shade, { opacity: 1, duration: 0.45 * d, overwrite: true });
        gsap.fromTo(items, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 * d, ease: EASE, stagger: 0.05 * d, delay: 0.15 * d });
      } else {
        gsap.to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.5 * d, ease: "power2.in", overwrite: true, onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
        gsap.to(shade, { opacity: 0, duration: 0.45 * d, overwrite: true, onComplete: () => gsap.set(shade, { visibility: "hidden" }) });
      }
    };
    toggles.forEach((b) => b.addEventListener("click", () => set(!open)));
    shade?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && open && set(false));
    menu.querySelectorAll(".menu__nav a").forEach((a, i) =>
      a.addEventListener("mouseenter", () => media.forEach((m, k) => m.classList.toggle("is-on", k === i % media.length))),
    );
  }

  // Contact drawer: the board and shade open and close with a CSS transition (same type as the original Modal)
  const contact = document.querySelector("[data-contact]");
  const cshade = document.querySelector("[data-contact-shade]");
  if (contact) {
    let on = false;
    const set = (v) => {
      on = v;
      contact.setAttribute("aria-hidden", String(!v));
      if (lenis) v ? lenis.stop() : lenis.start();
      contact.classList.toggle("is-open", v);
      cshade.classList.toggle("is-open", v);
    };
    document.querySelectorAll("[data-contact-toggle]").forEach((b) => b.addEventListener("click", (e) => (e.preventDefault(), set(!on))));
    document.querySelector("[data-contact-close]")?.addEventListener("click", () => set(false));
    cshade.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && on && set(false));
  }

  // Line-by-line reveal: data-lines rise from 100% below, line by line, when they reach 85% of the screen
  function lines(el, opts = {}) {
    const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
    split.masks?.forEach((m) => m.classList.add("line-mask"));
    if (reduce) return split;
    gsap.from(split.lines, {
      yPercent: 105,
      duration: 1,
      ease: EASE,
      stagger: 0.06,
      delay: opts.delay || 0,
      scrollTrigger: opts.now ? undefined : { trigger: el, start: "top 85%", once: true },
    });
    return split;
  }
  // Per-character entrance: title characters rise from below at 0.02s intervals (1s expo.out)
  function chars(el, opts = {}) {
    const split = SplitText.create(el, { type: "chars,lines", mask: "lines", linesClass: "line" });
    if (reduce) return split;
    gsap.from(split.chars, {
      yPercent: 110,
      duration: 1,
      ease: EASE,
      stagger: 0.02,
      delay: opts.delay || 0,
      scrollTrigger: opts.now ? undefined : { trigger: el, start: "top 85%", once: true },
    });
    return split;
  }

  // Photo parallax: [data-parallax="Strength"] wraps the panel interior at (100 + 100/strength)% height and (-50/strength)% position, from when the panel enters from the bottom of the screen until it leaves at the top
  // Inner goes from -v/2 → v/2 downward (v = Plate height / strength × min(window width, 1440) / 1440, default strength 4 · work card 5). 1025px and up only
  function parallax(el) {
    const force = Number(el.dataset.parallax) || 4;
    const inner = document.createElement("div");
    inner.className = "parallax-in";
    inner.append(...el.childNodes);
    el.append(inner);
    el.style.setProperty("--pf", force);
    if (reduce) return;
    const v = () => (el.getBoundingClientRect().height / force) * (Math.min(innerWidth, 1440) / 1440);
    gsap.matchMedia().add("(min-width: 1025px)", () => {
      gsap.fromTo(inner, { y: () => -v() / 2 }, { y: () => v() / 2, ease: "none", scrollTrigger: { trigger: el, start: "clamp(top bottom)", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }

  // Page transition: the new page descends from the top of the screen over 2s (gl.fastInOut) covering the previous page darkened by 90%.
  // The original is an app-style transition that overlaps two pages, here it moves on the instant you press, and the new page descends already over a dark backdrop (ink 90%)
  const KEY = "pda-veil";
  try { sessionStorage.removeItem(KEY); } catch {}
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|https?):/.test(href)) return;
    e.preventDefault();
    const url = new URL(a.href, location.href);
    try { sessionStorage.setItem(KEY, url.pathname); } catch {}
    location.href = a.href;
  });
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // On open: a freshly loaded page goes over the loader plate (background color · logo) after .4s, a page navigated to goes straight over the 90% ink — both take 2s on screen (gl.fastInOut)
  // It comes down (the loader panel goes down 15% along with it). At 5% the Hero appears (appear), and once fully down it is entered. A one-line script in head adds load-in and veil-in.
  const appearFns = [], enteredFns = [];
  let appeared = false, entered = false, reached = false, started = false;
  const appear = (fn) => (appeared ? fn() : appearFns.push(fn));
  // Entrance requires both the 5% point and the font loading (scene setup) to finish — as in the original, the descent starts right away without waiting for the font
  const tryAppear = () => reached && started && !appeared && fire(appearFns, () => (appeared = true));
  const enteredFn = (fn) => (entered ? fn() : enteredFns.push(fn));
  const fire = (list, mark) => { mark(); list.splice(0).forEach((f) => f()); };
  function enter() {
    const from = root.classList.contains("veil-in") ? "veil" : root.classList.contains("load-in") ? "load" : null;
    if (!from || reduce) {
      root.classList.remove("veil-in", "load-in");
      reached = true;
      tryAppear();
      fire(enteredFns, () => (entered = true));
      return;
    }
    lenis?.stop();
    gsap.set(document.body, { y: -innerHeight });
    root.classList.replace(`${from}-in`, `${from}-enter`);
    gsap.timeline({ delay: from === "load" ? 0.4 : 0, defaults: { duration: 2, ease: "gl.fastInOut" }, onComplete: () => {
      gsap.set(document.body, { clearProps: "transform" });
      root.classList.remove(`${from}-enter`);
      root.style.removeProperty("--loader-y");
      lenis?.start();
      ScrollTrigger.refresh();
      fire(enteredFns, () => (entered = true));
    } })
      .to(document.body, { y: 0 })
      .fromTo(root, { "--loader-y": "0%" }, { "--loader-y": "15%" }, "<")
      .call(() => { reached = true; tryAppear(); }, [], "<5%");
  }

  // The page js hands the scene over via ready — after all scripts load (DOMContentLoaded) the page starts scrolling down, and once fonts arrive the scene is built all at once.
  // Even if the page js never calls ready, the descend step still always runs
  // Subpage header (original Heading transition · Separator): title lines enter from 110% below at 1.2s expo.out (.1s apart, .35s later on a first-opened page),
  // The thin line is drawn from the left over 1s with gl.quicky after .5s
  const firstLoad = root.classList.contains("load-in");
  function heroLines(el) {
    const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
    if (reduce) return split;
    gsap.set(split.lines, { yPercent: 110 });
    appear(() => gsap.to(split.lines, { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.1, delay: firstLoad ? 0.35 : 0 }));
    return split;
  }
  function ruleIn(el) {
    if (reduce) return;
    gsap.set(el, { scaleX: 0 });
    appear(() => gsap.to(el, { scaleX: 1, duration: 1, ease: "gl.quicky", delay: 0.5 }));
  }

  // Filter box (original Filters): closed width is the chosen name’s (or ‹Filter› if none) width + padding. At first, after .7s it rises from .2x scale and 200% below (1s expo.out)
  // It expands from 4rem to its full width in .8s (gl.smoothInOut). On open, group names and the picker row rise .06s apart (1.2s), and on close it folds in .5s.
  // On select the name slot slides out upward and the new name comes in from below (.4s power3.out)
  function filters(box, onChange) {
    if (!box) return null;
    const head = box.querySelector("[data-filters-head]"), btn = box.querySelector("[data-filters-btn]");
    const icon = box.querySelector("[data-filters-icon]"), iconH = box.querySelector("[data-filters-icon-hover]");
    const panel = box.querySelector("[data-filters-panel]"), main = box.querySelector(".filters__main");
    const alts = Object.fromEntries([...box.querySelectorAll(".filters__alt")].map((el) => [el.dataset.filterLabel, el]));
    const opts = [...box.querySelectorAll("[data-filter-opt]")];
    const rem = () => parseFloat(getComputedStyle(root).fontSize);
    let open = false, value = null, M = 0, w = 0, openTl, closeTl;
    const cur = () => (value ? alts[value] : null);
    const measure = () => {
      gsap.set(panel, { height: 0, width: 0 });
      gsap.set(box, { clearProps: "width" });
      gsap.set(head, { minWidth: 0 });
      M = box.offsetWidth - main.scrollWidth;
      gsap.set(panel, { clearProps: "width" });
    };
    const shut = () => (cur() || main).scrollWidth + M;
    const fit = () => { measure(); w = shut(); gsap.set(box, { width: w }); gsap.set(head, { minWidth: w - rem() * 1.6 }); };
    gsap.set(Object.values(alts), { yPercent: 100 });
    gsap.set(iconH, { yPercent: -300 });
    if (!reduce) gsap.set(box, { yPercent: 200 });
    // Width is measured after the font loads
    ready(() => {
      fit();
      addEventListener("resize", () => !open && fit());
      if (reduce) return;
      gsap.set(box, { width: "4rem" });
      gsap.set(head, { x: -head.offsetWidth + rem() * 2.4 });
      gsap.set(main, { yPercent: 100 });
      appear(() => gsap.timeline({ delay: 0.7, defaults: { duration: 1, ease: "expo.out" } })
        .fromTo(box, { scale: 0.2, yPercent: 200 }, { scale: 1, yPercent: 0 })
        .fromTo(btn, { scale: 0.2 }, { scale: 1.3 }, "<10%")
        .fromTo(icon, { yPercent: -300 }, { yPercent: 0 }, "<3%")
        .to(box, { width: () => w, duration: 0.8, ease: "gl.smoothInOut" }, 0.5)
        .to(head, { x: 0, duration: 0.8, ease: "gl.smoothInOut" }, "<")
        .to(btn, { scale: 1, duration: 0.8, ease: "gl.smoothInOut" }, "<")
        .to(main, { yPercent: 0, duration: 0.6 }, "<30%"));
    });
    const hoverTo = (on) => {
      if (open) return;
      gsap.killTweensOf([btn, icon, iconH]);
      gsap.timeline({ defaults: { duration: 0.8, ease: "gl.smoothInOut" } })
        .to(btn, { scale: on ? 1.1 : 1 }).to(icon, { yPercent: on ? 300 : 0 }, "<").to(iconH, { yPercent: on ? 0 : -300 }, "<");
    };
    head.addEventListener("mouseenter", () => hoverTo(true));
    head.addEventListener("mouseleave", () => hoverTo(false));
    head.addEventListener("pointerdown", () => !open && gsap.to(box, { scale: 0.95, duration: 0.3, ease: "expo.out" }));
    head.addEventListener("pointerup", () => !open && gsap.to(box, { scale: 1, duration: 0.8, ease: "expo.out" }));
    const swapLabel = (tl, out, inn) => tl.to(out, { yPercent: -100, duration: 0.4, ease: "power3.out" }, "<").set(inn, { yPercent: 100 }, "<").to(inn, { yPercent: 0, duration: 0.4, ease: "power3.out" }, "<");
    const doOpen = () => {
      open = true;
      box.classList.add("is-open");
      closeTl?.kill();
      const lab = [...panel.querySelectorAll(".filter-dropdown-group, .filter-option-label")], ins = [...panel.querySelectorAll(".filter-option-input")];
      gsap.set(lab, { yPercent: 100 });
      gsap.set(ins, { scale: 0 });
      gsap.to(icon, { yPercent: 0, duration: 0.8, ease: "expo.out" });
      gsap.to(iconH, { yPercent: -300, duration: 0.8, ease: "expo.out" });
      const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "expo.out" } })
        .to(btn, { scale: 1.1 }).to(box, { width: "auto" }, "<").to(panel, { height: "auto" }, "<")
        .to(lab, { yPercent: 0, duration: 1.2, stagger: 0.06 }, "<10%").to(ins, { scale: 1, duration: 0.8, stagger: 0.06 }, "<");
      if (cur()) swapLabel(tl, cur(), main);
      openTl = tl;
    };
    const doClose = () => {
      open = false;
      box.classList.remove("is-open");
      openTl?.kill();
      w = shut();
      gsap.set(head, { minWidth: w - rem() * 1.6 });
      const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "expo.out" } })
        .to(btn, { scale: 1 }).to(panel, { height: 0 }, "<").to(box, { width: w }, "<");
      if (cur()) swapLabel(tl, main, cur());
      closeTl = tl;
    };
    const show = (prev) => {
      const out = prev ? alts[prev] : main, inn = cur() || main;
      w = shut();
      gsap.set(head, { minWidth: w - rem() * 1.6 });
      swapLabel(gsap.timeline(), out, inn);
      gsap.to(box, { width: w, duration: 0.5, ease: "expo.out" });
    };
    const mark = () => opts.forEach((o) => { const on = o.dataset.filterOpt === value; o.classList.toggle("is-on", on); o.querySelector("input").checked = on; });
    const pick = (v) => {
      const prev = value;
      value = prev === v ? null : v;
      mark();
      onChange?.(value);
      if (open) doClose(); else show(prev);
    };
    opts.forEach((o) => o.querySelector("input").addEventListener("change", () => pick(o.dataset.filterOpt)));
    head.addEventListener("click", () => (open ? doClose() : doOpen()));
    document.addEventListener("click", (e) => open && !box.contains(e.target) && doClose());
    return { set(v) { if (v === value) return; const prev = value; value = v; mark(); if (!open) show(prev); } };
  }

  // Related articles · similar work (original RelatedArticles): when the selection changes, the previous article fades out over .25s and the new title rises from 100% below over 1s expo.out,
  // Description lines rise .06s apart after .15s. Below 1280px it drags and swipes with Embla (align start), and from 1280 the raised photo widens to half width (.7s).
  const xlQuery = matchMedia("(min-width: 80rem)");
  function related(sec) {
    const items = [...sec.querySelectorAll("[data-rel-item]")], slides = [...sec.querySelectorAll("[data-rel-slide]")];
    const row = sec.querySelector("[data-rel-row]"), viewport = sec.querySelector("[data-rel-viewport]"), btn = sec.querySelector(".rel__texts .button");
    const descLines = items.map((it) => SplitText.create(it.querySelector("[data-rel-desc]"), { type: "lines", mask: "lines" }).lines);
    let n = 0, embla = null;
    items.forEach((it, k) => gsap.set(it, { autoAlpha: k === 0 ? 1 : 0 }));
    slides.forEach((s, k) => s.classList.toggle("is-on", k === 0));
    const select = (s) => {
      if (s === n) return;
      const prev = items[n], next = items[s], title = next.querySelector("[data-rel-title]"), lns = descLines[s];
      gsap.killTweensOf([prev, next], "autoAlpha");
      gsap.killTweensOf([title, ...lns]);
      n = s;
      slides.forEach((x, k) => x.classList.toggle("is-on", k === s));
      if (btn) btn.href = slides[s].getAttribute("href");
      gsap.timeline({ defaults: { duration: reduce ? 0 : 1, ease: "expo.out" } })
        .to(prev, { autoAlpha: 0, duration: reduce ? 0 : 0.25, ease: "power2.out" })
        .set(next, { autoAlpha: 1 })
        .fromTo(title, { yPercent: 100 }, { yPercent: 0 })
        .fromTo(lns, { yPercent: 100 }, { yPercent: 0, stagger: reduce ? 0 : 0.06 }, "<0.15");
    };
    const setup = () => {
      embla?.destroy();
      embla = null;
      row.style.height = "";
      if (xlQuery.matches) row.style.height = `${row.offsetHeight}px`;
      else if (window.EmblaCarousel) {
        embla = window.EmblaCarousel(viewport, { align: "start" });
        embla.on("select", () => select(embla.selectedScrollSnap()));
      }
    };
    slides.forEach((s, k) => s.addEventListener("mouseenter", () => xlQuery.matches && select(k)));
    xlQuery.addEventListener("change", setup);
    setup();
  }

  const readyFns = [];
  function ready(fn) { if (started) fn?.(); else readyFns.push(fn); }
  const start = () => {
    started = true;
    document.querySelectorAll("[data-parallax]").forEach(parallax);
    document.querySelectorAll("[data-lines]").forEach((el) => lines(el));
    document.querySelectorAll("[data-chars]").forEach((el) => chars(el));
    document.querySelectorAll("[data-hero-lines]").forEach(heroLines);
    document.querySelectorAll("[data-rule-in]").forEach(ruleIn);
    document.querySelectorAll("[data-rel]").forEach(related);
    readyFns.splice(0).forEach((fn) => fn?.());
    ScrollTrigger.refresh();
    tryAppear();
  };
  const boot = () => { enter(); document.fonts.ready.then(start); };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot); else boot();



  // Category chip enter·exit (original Tag show·hide): shows after .2s, rising from 150% below at 0 scale over 1.2s expo.out, and
  // Unfolds from a circle as tall as its height to its own width in .8s (gl.smoothInOut). On exit it switches off in .25s
  const tagChip = (tag) => tag?.firstElementChild;
  function tagPrep(tag) { const c = tagChip(tag); if (c) gsap.set(c, { autoAlpha: 0, scale: 0.4 }); }
  function tagShow(tag) {
    const c = tagChip(tag), tl = gsap.timeline();
    if (!c) return tl;
    gsap.killTweensOf(c);
    gsap.set(c, { clearProps: "width" });
    const h = c.getBoundingClientRect().height;
    return tl.set(c, { autoAlpha: 1 }, 0.2)
      .fromTo(c, { scale: 0, yPercent: 150 }, { scale: 1, yPercent: 0, ease: "expo.out", duration: 1.2 }, 0)
      .fromTo(c, { width: h }, { width: "auto", ease: "gl.smoothInOut", duration: 0.8 }, "<25%");
  }
  function tagHide(tag) {
    const c = tagChip(tag);
    if (!c) return gsap.timeline();
    gsap.killTweensOf(c, "autoAlpha");
    return gsap.to(c, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
  }

  // Hovering the 「+ 1」 chip (mouse devices) drops the remaining categories 70% down · .9x at .08s each (.7s expo.out), the + exits to -150% and a thin line rises in.
  // On release, reverses in .4s
  const fine = matchMedia("(hover: hover)");
  document.querySelectorAll(".tag[data-more]").forEach((tag) => {
    const drops = tag.querySelectorAll(".tag__drop .chip"), plus = tag.querySelector(".tag__more > span"), minus = tag.querySelector(".tag__minus");
    gsap.set(drops, { autoAlpha: 0 });
    gsap.set(minus, { yPercent: 100 });
    let tl;
    tag.addEventListener("mouseenter", () => {
      if (!fine.matches) return;
      tl?.kill();
      tl = gsap.timeline({ defaults: { duration: 0.7, ease: "expo.out" } })
        .fromTo(drops, { yPercent: 70, scale: 0.9 }, { yPercent: 0, scale: 1, stagger: 0.08 }, 0)
        .to(drops, { autoAlpha: 1, ease: "power2.out", duration: 0.25, stagger: 0.06 }, "<2%")
        .to(plus, { yPercent: -150, duration: 1 }, 0)
        .to(minus, { yPercent: 0, duration: 1 }, 0);
    });
    tag.addEventListener("mouseleave", () => {
      if (!fine.matches) return;
      tl?.kill();
      tl = gsap.timeline({ defaults: { duration: 0.4, ease: "expo.out" } })
        .to(drops, { yPercent: 70, scale: 0.9, stagger: -0.04 }, 0)
        .to(drops, { autoAlpha: 0, ease: "power2.out", duration: 0.25, stagger: -0.04 }, "<")
        .to(plus, { yPercent: 0, duration: 1 }, 0)
        .to(minus, { yPercent: 100, duration: 1 }, 0);
    });
  });

  // News row (original CardArticleInline): at 1024px and up the photo stays hidden, then slides in from the side (top or bottom half) the row was entered from,
  // (outer panel ±100% · inner the opposite, .7s gl.quicky) it exits toward the side it left. The width below that always shows the photo
  const lg = matchMedia("(min-width: 64rem)");
  document.querySelectorAll("[data-arow]").forEach((row) => {
    const img = row.querySelector("[data-arow-img]"), inner = img?.firstElementChild;
    if (!img || !inner) return;
    const side = (e) => { const r = row.getBoundingClientRect(); return e.clientY - r.top < r.height / 2 ? -100 : 100; };
    const rest = () => { if (lg.matches) { gsap.set(img, { yPercent: -100 }); gsap.set(inner, { yPercent: 100 }); } else gsap.set([img, inner], { clearProps: "transform" }); };
    rest();
    lg.addEventListener("change", rest);
    const d = reduce ? 0 : 0.7;
    row.addEventListener("mouseenter", (e) => {
      if (!lg.matches) return;
      const s = side(e);
      gsap.killTweensOf([img, inner]);
      gsap.set(img, { yPercent: s });
      gsap.set(inner, { yPercent: -s });
      gsap.to([img, inner], { yPercent: 0, duration: d, ease: "gl.quicky" });
    });
    row.addEventListener("mouseleave", (e) => {
      if (!lg.matches) return;
      const s = side(e);
      gsap.killTweensOf([img, inner]);
      gsap.to(img, { yPercent: s, duration: d, ease: "gl.quicky" });
      gsap.to(inner, { yPercent: -s, duration: d, ease: "gl.quicky" });
    });
  });

  window.P = { gsap, ScrollTrigger, lenis, reduce, lines, chars, ready, appear, entered: enteredFn, EASE, tagPrep, tagShow, tagHide, filters, firstLoad };
})();
