// Motion shared by several sections — smooth scroll, text reveal, header hide, menu drawer, cursor, loader, section transitions, footer.
// Per-section motion is registered with OL.page(name, hook), and every time the transition (barba) brings in a new section, that section’s hook is called again.
(() => {
  const OL = (window.OL = window.OL || { pages: {}, cleanups: [] });
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("ol-dive", "0.85,0,0.15,1");
  CustomEase.create("ol-tide", "0.22,0.7,0.2,1");
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  OL.reduce = reduce;

  // Smooth scroll — Lenis 1.3.23, same as the original
  const lenis = reduce ? null : new Lenis({ autoRaf: false });
  OL.lenis = lenis;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  OL.stop = () => lenis && lenis.stop();
  OL.start = () => lenis && lenis.start();

  // Label characters turn on in a shuffled order over a 12-character cycle (same order as the original CSS nth-child delay table)
  const ORDER = [0, 1, 4, 3, 2, 7, 6, 5, 9, 8, 11, 10];
  const charOrder = (i) => ORDER[i % 12] + Math.floor(i / 12) * 12;

  function splitIn(scope) {
    const made = [];
    scope.querySelectorAll("[data-split]").forEach((el) => {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = "1";
      const type = el.dataset.split;
      if (el.dataset.delay) el.style.setProperty("--delay", `${el.dataset.delay}ms`);
      if (el.dataset.stagger) el.style.setProperty("--stagger", `${el.dataset.stagger}ms`);
      if (type === "chars") {
        const s = new SplitText(el, { type: "words,chars", wordsClass: "cw", charsClass: "char" });
        s.chars.forEach((c, i) => c.style.setProperty("--o", charOrder(i)));
        made.push(s);
      } else {
        const s = new SplitText(el, { type: "words", wordsClass: "word" });
        s.words.forEach((w, i) => {
          w.innerHTML = `<span class="word__in">${w.innerHTML}</span>`;
          w.style.setProperty("--i", i);
        });
        made.push(s);
      }
    });
    return made;
  }
  OL.splitIn = splitIn;

  // Once visible, add is-in one time. Places re-hooked by hand, like the hero slider, are excluded with data-inview-manual
  function watchIn(scope) {
    const els = [...scope.querySelectorAll("[data-split], [data-inview]")].filter((el) => !el.closest("[data-inview-manual]"));
    if (reduce) { els.forEach((el) => el.classList.add("is-in")); return () => {}; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }
  OL.watchIn = watchIn;

  // Header — light text over video or dark bands, hides when scrolling down and returns when scrolling up
  const header = document.querySelector(".ol-header");
  let lastY = 0;
  function headerTick(y) {
    if (!header) return;
    const dir = y - lastY;
    if (y < 10 || dir < -2) header.classList.remove("is-collapsed");
    else if (dir > 2 && y > header.offsetHeight) header.classList.add("is-collapsed");
    lastY = y;
    const probe = 40;
    if (root.classList.contains("menu-visible") || document.querySelector(".ol-dialog.is-open")) return;
    const hit = document.elementsFromPoint(innerWidth / 2, probe).find((n) => !n.closest(".ol-header, .ol-cursor, .ol-nav, .ol-nav-veil, .ol-dialog, .ol-arcfly"));
    const theme = hit && hit.closest("[data-theme]");
    header.classList.toggle("is-light", !!theme && theme.dataset.theme === "dark");
  }
  OL.headerTick = () => headerTick(lenis ? lenis.scroll : scrollY);
  if (lenis) lenis.on("scroll", ({ scroll }) => headerTick(scroll));
  else addEventListener("scroll", () => headerTick(scrollY), { passive: true });

  // When the drawer opens, four arcs of the header mark are peeled off and sent toward the screen corners after .6s (over .9s), and three of them gather again at the mark spot at the drawer’s bottom right (original logo-morph)
  let arcTl = null;
  function flyArcs(open) {
    arcTl && arcTl.kill();
    document.querySelectorAll(".ol-arcfly").forEach((n) => n.remove());
    const target = document.querySelector(".ol-nav__mark");
    if (target) gsap.set(target, { autoAlpha: 0 });
    const src = document.querySelector(".ol-header .ol-logo__mark svg");
    if (!open || !src || !target || reduce || !matchMedia("(min-width: 1024px)").matches) { if (open && target) gsap.set(target, { autoAlpha: 1 }); return; }
    const s = src.getBoundingClientRect(), t = target.getBoundingClientRect();
    const o = { x: t.left - s.left, y: t.top - s.top };
    const to = [{ x: o.x, y: 0 }, { x: o.x, y: o.y }, { x: 0, y: o.y }, { x: 0, y: 0 }];
    const arcs = [...src.querySelectorAll("path")].map((p) => {
      const box = document.createElement("span");
      box.className = "ol-arcfly";
      box.style.cssText = `left:${s.left}px;top:${s.top}px;width:${s.width}px;height:${s.height}px`;
      box.innerHTML = `<svg viewBox="${src.getAttribute("viewBox")}" fill="none"><g stroke="currentColor" stroke-width="3.2" stroke-linecap="round">${p.outerHTML}</g></svg>`;
      document.body.append(box);
      return box;
    });
    arcTl = gsap.timeline({ onComplete: () => { gsap.set(target, { autoAlpha: 1 }); arcs.forEach((a) => a.remove()); } });
    arcs.forEach((a, i) => arcTl.to(a, { x: to[i].x, y: to[i].y, duration: 0.9, ease: "ol-dive", delay: 0.6 }, 0));
    arcTl.to(arcs.filter((a, i) => i !== 1), { x: o.x, y: o.y, duration: 0.9, ease: "ol-dive" }, ">-0.1");
  }

  // Video dialog — the original is a video-player dialog. Only the placeholder video and the shape of the control bar
  // The control row pops up the instant it is pressed and hides 3 seconds later (original media-controls auto-hide)
  let barTimer = 0;
  function showBar() {
    const bar = document.querySelector(".ol-dialog__bar");
    if (!bar) return;
    bar.classList.add("is-shown");
    clearTimeout(barTimer);
    barTimer = setTimeout(() => bar.classList.remove("is-shown"), 3000);
  }
  function openDialog(open) {
    const dlg = document.querySelector(".ol-dialog");
    if (!dlg) return;
    dlg.classList.toggle("is-open", open);
    dlg.setAttribute("aria-hidden", String(!open));
    open ? OL.stop() : OL.start();
    if (open) dlg.querySelector("[data-dialog-close]")?.focus({ preventScroll: true });
  }
  addEventListener("keydown", (e) => { if (e.key === "Escape") openDialog(false); });

  // Menu drawer
  function setMenu(open) {
    flyArcs(open);
    root.classList.toggle("menu-visible", open);
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
    const nav = document.querySelector(".ol-nav");
    if (nav) nav.inert = !open;
    if (open) {
      OL.stop();
      nav && nav.querySelectorAll("[data-split]").forEach((el) => { el.classList.remove("is-in"); void el.offsetWidth; el.classList.add("is-in"); });
    } else {
      OL.start();
      nav && nav.querySelectorAll("[data-split]").forEach((el) => el.classList.remove("is-in"));
    }
  }
  OL.setMenu = setMenu;
  document.addEventListener("click", (e) => {
    if (e.target.closest(".ol-nav-veil")) { setMenu(false); return; }
    const d = e.target.closest("[data-dialog-open]");
    if (d) { showBar(); setTimeout(() => openDialog(true), 60); return; }
    if (e.target.closest("[data-dialog-close]")) { openDialog(false); return; }
    const t = e.target.closest("[data-menu-toggle]");
    // The original drawer reacts about 60ms after the press (dim layer · clip · hamburger lines are all delayed by the same amount — measured with motion-probe)
    if (t) { const open = !root.classList.contains("menu-visible"); setTimeout(() => setMenu(open), 60); return; }
    const acc = e.target.closest("[data-acc]");
    if (acc && matchMedia(acc.dataset.acc).matches) {
      const g = acc.parentElement;
      const was = g.classList.contains("is-open");
      g.parentElement.querySelectorAll(":scope > .is-open").forEach((o) => o.classList.remove("is-open"));
      g.classList.toggle("is-open", !was);
      acc.setAttribute("aria-expanded", String(!was));
    }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("menu-visible")) setMenu(false); });
  const navEl = document.querySelector(".ol-nav");
  if (navEl) { navEl.inert = true; splitIn(navEl); }

  // Cursor — over a text card a red square follows at 10% per step (original cursorDuration 1), and when leaving it catches up to within 6px (max .2s) then closes over .6s
  if (fine && !reduce) {
    const cur = document.createElement("div");
    cur.className = "ol-cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="ol-cursor__box"><svg viewBox="0 0 12 9" fill="none"><path d="M10.3 4.35H.5M6.9.9l3.4 3.45L6.9 7.8" stroke="currentColor" stroke-width="1.2"/></svg></div>';
    document.body.append(cur);
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, p = { x: m.x, y: m.y };
    let over = null, last = null, exiting = false, exitAt = 0, leaveTimer = 0;
    const setPos = () => { cur.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`; };
    gsap.ticker.add(() => {
      const k = 1 - Math.pow(1 - 1 / 10, gsap.ticker.deltaRatio());
      p.x += (m.x - p.x) * k; p.y += (m.y - p.y) * k;
      setPos();
      if (exiting) {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        const r = last && last.getBoundingClientRect();
        const away = r ? Math.hypot(Math.max(r.left - m.x, 0, m.x - r.right), Math.max(r.top - m.y, 0, m.y - r.bottom)) : Infinity;
        if (d <= 6 || performance.now() - exitAt >= 200 || away > 100) finishExit();
      }
    });
    const finishExit = () => {
      exiting = false;
      cur.classList.remove("is-on");
      cur.classList.add("is-leaving");
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => cur.classList.remove("is-leaving"), 600);
    };
    const update = () => {
      const el = document.elementFromPoint(m.x, m.y);
      const hit = el && el.closest("[data-cursor]");
      if (hit) {
        if (!over) { p.x = m.x; p.y = m.y; }
        over = hit; last = hit; exiting = false; clearTimeout(leaveTimer);
        cur.classList.remove("is-leaving");
        cur.classList.add("is-on");
      } else if (over) {
        over = null; exiting = true; exitAt = performance.now();
      }
    };
    addEventListener("mousemove", (e) => { m.x = e.clientX; m.y = e.clientY; update(); }, { passive: true });
    addEventListener("scroll", update, { passive: true });
    if (lenis) lenis.on("scroll", update);
    OL.cursorReset = () => { over = null; exiting = false; cur.classList.remove("is-on", "is-leaving"); };
  }

  // Footer back to top
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-to-top]")) return;
    if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    else scrollTo({ top: 0, behavior: "smooth" });
  });

  // Phone head symbol — the original is Lottie (60fps · 241 frames): the symbol plate turns 90° in 2.25s, four arcs switch on 5 frames apart and spread in 2s into place from a spot 59% toward the center
  function mobileMark() {
    const g = document.querySelector(".ol-header .ol-logo__mark g");
    if (!g || reduce || !matchMedia("(max-width: 519px)").matches) return;
    const arcs = [...g.children], dir = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    gsap.fromTo(g, { rotation: 0, svgOrigin: "28.5 28.5" }, { rotation: 90, duration: 2.25, ease: "power2.inOut" });
    gsap.set(arcs, { opacity: 0 });
    arcs.forEach((a, i) => gsap.fromTo(a, { x: -dir[i][0] * 5.6, y: -dir[i][1] * 5.6 }, { x: 0, y: 0, duration: 2, ease: "power2.inOut", delay: (i * 5) / 60, onStart: () => gsap.set(a, { opacity: 1 }) }));
  }

  // Section registration and hooking
  OL.page = (name, init) => { OL.pages[name] = init; };
  // Closing paragraph — each word darkens in turn with a .16 window (original --split-text-word-window .16)
  function scrubWords(container, made) {
    const mm = gsap.matchMedia();
    container.querySelectorAll("[data-scrub-words]").forEach((el) => {
      const s = new SplitText(el, { type: "words", wordsClass: "word" });
      made.push(s);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const n = s.words.length, win = 0.16, step = (1 - win) / Math.max(n - 1, 1);
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: true } });
        s.words.forEach((w, i) => tl.fromTo(w, { opacity: 0.16 }, { opacity: 1, ease: "none", duration: win }, i * step));
      });
      mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(s.words, { opacity: 1 }));
    });
    return () => mm.revert();
  }

  function mount(container) {
    const made = splitIn(container);
    const stopScrub = scrubWords(container, made);
    const stopIn = watchIn(container);
    const ns = container.dataset.barbaNamespace;
    const init = OL.pages[ns];
    const undo = init ? init(container) : null;
    ScrollTrigger.refresh();
    OL.headerTick();
    OL.cleanups = [() => { stopIn(); stopScrub(); made.forEach((s) => s.revert()); }, typeof undo === "function" ? undo : () => {}, stopIn];
  }
  // The old section leaves soon, so text splitting and word emphasis are not reverted — reverting would change the screen before the transition starts
  function unmount() {
    OL.cleanups.forEach((f, i) => i > 0 && f());
    OL.cleanups = [];
    ScrollTrigger.getAll().forEach((t) => t.kill(false));
  }

  // Loader — the symbol tile board (8s) lifts upward over 1.2s starting 2s before it ends
  function runLoader(done) {
    const el = document.querySelector(".ol-loader");
    if (!el) { done(); return; }
    if (reduce || sessionStorage.getItem("ol-loaded")) { el.remove(); done(); return; }
    sessionStorage.setItem("ol-loaded", "1");
    root.classList.add("ol-lock");
    OL.stop();
    scrollTo(0, 0);
    const stage = el.querySelector(".ol-loader__stage"), bg = el.querySelector(".ol-loader__bg");
    const intro = OL.loaderIntro ? OL.loaderIntro(el.querySelector("svg")) : gsap.timeline();
    const DUR = 8, OUTRO = 2;
    const tl = gsap.timeline({
      onComplete: () => { root.classList.remove("ol-lock"); OL.start(); el.remove(); done(); },
    });
    tl.add(intro, 0)
      .to(stage, { yPercent: -100, duration: 1.2, ease: "ol-dive" }, DUR - OUTRO)
      .to(bg, { opacity: 0, duration: 1.2, ease: "ol-dive" }, DUR - OUTRO);
    OL.loaderOutroAt = DUR - OUTRO;
  }

  // Section transition — original is barba 2.9.7 + View Transition: old section moves -12% and blurs in 1.2s (60ms late), new section rises from 10% below by clip (.1s late)
  async function ensureAssets(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const have = new Set([...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.getAttribute("href")));
    const css = [...doc.querySelectorAll("link[rel=stylesheet]")].filter((l) => !have.has(l.getAttribute("href")));
    await Promise.all(css.map((l) => new Promise((res) => {
      const n = document.createElement("link"); n.rel = "stylesheet"; n.href = l.getAttribute("href"); n.onload = n.onerror = res; document.head.append(n);
    })));
    const haveJs = new Set([...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")));
    for (const s of doc.querySelectorAll("script[src][data-page]")) {
      if (haveJs.has(s.getAttribute("src"))) continue;
      await new Promise((res) => { const n = document.createElement("script"); n.src = s.getAttribute("src"); n.dataset.page = ""; n.onload = n.onerror = res; document.body.append(n); });
    }
    document.title = doc.title;
  }

  function currentLinks(ns) {
    document.querySelectorAll(".ol-header__nav a, .ol-nav a").forEach((a) => a.classList.toggle("is-current", a.dataset.ns === ns));
  }

  function start() {
    const container = document.querySelector('[data-barba="container"]');
    currentLinks(container.dataset.barbaNamespace);
    runLoader(() => {
      mobileMark();
      mount(container);
      OL.afterLoad && OL.afterLoad(container);
    });
    if (!window.barba || location.protocol === "file:") return;
    barba.init({
      preventRunning: true,
      prevent: ({ el }) => el.closest("[data-no-barba]"),
      transitions: [{
        name: "ol-dive",
        sync: true,
        async beforeLeave({ current }) {
          if (root.classList.contains("menu-visible")) setMenu(false);
          OL.cursorReset && OL.cursorReset();
          const y = lenis ? lenis.scroll : scrollY;
          unmount();
          current.container.style.cssText = `position:fixed;inset:0;top:${-y}px;width:100%;z-index:1;`;
        },
        async beforeEnter({ next }) {
          await ensureAssets(next.html);
        },
        leave({ current }) {
          return gsap.timeline()
            .to(current.container, { yPercent: -12, opacity: 0, duration: 1.2, ease: "ol-dive", delay: 0.06 })
            .then();
        },
        enter({ next }) {
          next.container.classList.add("is-entering");
          lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
          currentLinks(next.container.dataset.barbaNamespace);
          return gsap.timeline()
            .fromTo(next.container, { yPercent: 10, clipPath: "inset(100% 0 0 0)" }, { yPercent: 0, clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "ol-dive", delay: 0.1 })
            .then();
        },
        after({ next }) {
          next.container.classList.remove("is-entering");
          gsap.set(next.container, { clearProps: "transform,clipPath" });
          lenis && lenis.resize();
          mount(next.container);
        },
      }],
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
