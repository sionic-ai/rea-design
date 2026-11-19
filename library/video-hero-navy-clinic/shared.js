// Shared by all pages — Lenis (original 1.3.27, duration .6), loader, curtain transition, menu drawer, word rise, parallax, foot pearl video, clock and rest screen.
// The original (Next.js) runs the loader only on first open and moves between pages with a curtain — here, a page entered through the curtain (sessionStorage) skips the loader.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OD = (window.OD = { ready: false, onReady: [] });

  const lenis = new Lenis({ duration: 0.6, autoRaf: false });
  OD.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const whenReady = (fn) => (OD.ready ? fn() : OD.onReady.push(fn));
  OD.whenReady = whenReady;
  const finish = () => {
    OD.ready = true;
    lenis.start();
    OD.onReady.splice(0).forEach((fn) => fn());
    ScrollTrigger.refresh();
  };

  // Loader: logo · one line rise from 20px below in .7s expo.out (.1 stagger) → rest .3s, then the veil clears in 1s power2.inOut
  const pre = document.querySelector(".od-pre");
  const cameIn = root.classList.contains("od-in");
  sessionStorage.removeItem("od-in");
  lenis.stop();
  // The original loader and curtain move after hydration ends (about .8s from the first paint) — here too, .8s after the first frame,
  // If the font hasn’t arrived by then, wait up to 1.5s at most so the moment the font swaps is hidden behind the loader and curtain
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const boot = new Promise((r) => requestAnimationFrame(r))
    .then(() => Promise.all([wait(800), Promise.race([document.fonts.ready, wait(1500)])]));
  if (cameIn || !pre) {
    pre?.remove();
    const page = document.getElementById("page");
    const curtain = document.querySelector(".od-curtain");
    boot.then(() => {
      gsap.timeline({
        onComplete: () => {
          gsap.set([curtain, page], { clearProps: "all" });
          root.classList.remove("od-in");
        },
      })
        .set(curtain, { y: "0%", opacity: 1 })
        .fromTo(page, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.8, ease: "quart.out" }, 0.1)
        .fromTo(curtain, { y: "0%" }, { y: "-100%", duration: reduce ? 0 : 0.8, ease: "quart.out" }, 0.1)
        .set(curtain, { opacity: 0 });
      finish();
    });
  } else {
    const its = pre.querySelectorAll(".od-pre__it");
    boot.then(() => gsap.timeline({ onComplete: () => { pre.style.display = "none"; finish(); } })
      .to(its, { opacity: 1, y: 0, duration: reduce ? 0 : 0.7, ease: "expo.out", stagger: 0.1 })
      .to(pre, { opacity: 0, duration: reduce ? 0 : 1, ease: "power2.inOut" }, `+=${reduce ? 0 : 0.3}`));
  }

  // Curtain transition: the body rises -5% and vanishes while the curtain covers from below (.8s quart.in) → next page
  const leave = (href) => {
    lenis.stop();
    ScrollTrigger.getAll().forEach((s) => s.disable(false));
    const curtain = document.querySelector(".od-curtain");
    const page = document.getElementById("page");
    gsap.timeline({ onComplete: () => { sessionStorage.setItem("od-in", "1"); location.href = href; } })
      .set(curtain, { opacity: 1, pointerEvents: "all" })
      .fromTo(page, { y: 0, opacity: 1 }, { y: "-5%", opacity: 0, duration: reduce ? 0 : 0.8, ease: "quart.in" }, 0)
      .fromTo(curtain, { y: "100%" }, { y: "0%", duration: reduce ? 0 : 0.8, ease: "quart.in" }, 0);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    e.preventDefault();
    closeMenu();
    if (href.split("#")[0] === here) return;
    leave(href);
  });

  // Menu drawer: panel descends with 1.2s expo-out, items start after .2s from 24px below with 1.2s expo.out (.1 sequence), and fade out over .3s when closing
  const menu = document.querySelector(".od-menu");
  const links = menu ? menu.querySelectorAll("[data-menu-link]") : [];
  let menuTl;
  function openMenu() {
    if (!menu || menu.classList.contains("is-open")) return;
    menu.classList.remove("is-closing");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    lenis.stop();
    menuTl?.kill();
    menuTl = gsap.timeline().fromTo(links, { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: reduce ? 0 : 1.2, ease: "expo.out", stagger: reduce ? 0 : 0.1, clearProps: "all", delay: 0.2 });
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    menu.setAttribute("aria-hidden", "true");
    lenis.start();
    menuTl?.kill();
    menuTl = gsap.timeline().to(links, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "expo.out" });
    setTimeout(() => menu.classList.remove("is-closing"), 1200);
  }
  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); menu?.classList.contains("is-open") ? closeMenu() : openMenu(); }));
  menu?.querySelector(".od-menu__close")?.addEventListener("click", closeMenu);
  menu?.querySelector(".od-menu__veil")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  const mm = gsap.matchMedia();

  // Word rise — once at ”top 85%”, words move up from 10px below over 1s expo.out. The stagger interval comes from data-od-words (.04·.01·.1), and the following block staggers by .15
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-od-reveal]").forEach((sec) => {
      const heads = sec.querySelectorAll("[data-od-words]");
      const blocks = sec.querySelectorAll("[data-od-block]");
      const chars = sec.querySelectorAll("[data-od-chars]");
      const splits = [];
      const words = [];
      heads.forEach((h) => {
        const s = SplitText.create(h, { type: "words" });
        splits.push(s);
        words.push({ el: s.words, gap: +(h.dataset.odWords || 0.04), y: +(h.dataset.odY || 10), dur: +(h.dataset.odDur || 1) });
        gsap.set(s.words, { autoAlpha: 0, y: +(h.dataset.odY || 10) });
      });
      const charSets = [];
      chars.forEach((c) => {
        const s = SplitText.create(c, { type: "chars" });
        splits.push(s);
        charSets.push(...s.chars);
      });
      if (charSets.length) gsap.set(charSets, { autoAlpha: 0 });
      if (blocks.length) gsap.set(blocks, { autoAlpha: 0, y: 10 });
      whenReady(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", once: true } });
        words.forEach((w) => tl.to(w.el, { autoAlpha: 1, y: 0, duration: w.dur, stagger: w.gap, ease: "expo.out" }, 0));
        if (charSets.length) tl.to(charSets, { autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "expo.out" }, 0);
        if (blocks.length) tl.to(blocks, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: "expo.out" }, sec.dataset.odAt || 0.4);
      });
      return () => splits.forEach((s) => s.revert());
    });
  });

  // Parallax — a 110% panel moves from -amount% → amount% (the first hero from ”top top”). Only at 1024 and above, a few also on phone
  const par = (scope) => () => {
    document.querySelectorAll(`[data-od-par${scope}]`).forEach((box) => {
      const inner = box.querySelector(".od-par__in");
      const amt = +(box.dataset.odPar || box.dataset.odParAll || 8);
      gsap.set(inner, { yPercent: -amt });
      gsap.to(inner, { yPercent: amt, ease: "none", scrollTrigger: { trigger: box, start: box.hasAttribute("data-od-first") ? "top top" : "top bottom", end: "bottom top", scrub: true } });
    });
  };
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", par(""));
  mm.add("(prefers-reduced-motion: no-preference)", par("-all"));

  // Foot pearl video — shrinks 1.5 → 1 (scroll-bound)
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const box = document.querySelector(".od-foot__media");
    const scaler = document.querySelector(".od-foot__scale");
    if (!box || !scaler) return;
    gsap.fromTo(scaler, { scale: 1.5 }, { scale: 1, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });
  // The original also keeps a position delayed by .2 for the cursor state (last), but this text reads the undelayed position (current) — it sticks to the cursor on every tick
  const follow = document.querySelector(".od-foot__follow");
  if (follow && matchMedia("(hover: hover)").matches) {
    const m = { x: null, y: null };
    addEventListener("mousemove", (e) => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      if (m.x === null) return;
      const x = Math.min(Math.max(0, m.x), innerWidth - follow.offsetWidth);
      const y = Math.min(Math.max(0, m.y), innerHeight - follow.offsetHeight);
      follow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  // Clock and opening hours — only today’s row is bold, a red dot when closed (hover shows Closed now)
  const HOURS = [null, [10, 17], null, [10, 17], [10, 17], [10, 17], [10, 16]];
  const tick = () => {
    const now = new Date();
    const d = now.getDay();
    document.querySelectorAll(".od-foot__hours tr").forEach((tr) => tr.classList.toggle("is-today", +tr.dataset.day === d));
    const h = now.getHours() + now.getMinutes() / 60;
    const open = HOURS[d] && h > HOURS[d][0] && h < HOURS[d][1];
    document.querySelectorAll(".od-foot__clock").forEach((c) => {
      c.classList.toggle("is-closed", !open);
      const hh = now.getHours() % 12 || 12;
      c.querySelector(".od-now").textContent = `${hh}:${String(now.getMinutes()).padStart(2, "0")}${now.getHours() < 12 ? "AM" : "PM"} Area`;
    });
  };
  tick();
  setInterval(tick, 30000);

  // Rest screen — cover after 10 minutes (600s) with no interaction, press to lift it
  const idle = document.querySelector(".od-idle");
  if (idle) {
    let t;
    const arm = () => { idle.classList.remove("is-on"); clearTimeout(t); t = setTimeout(() => idle.classList.add("is-on"), 6e5); };
    ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"].forEach((ev) => addEventListener(ev, arm, { passive: true }));
    arm();
  }

  // Big photo frame unfold — section .8→1, inner 1.2→1 (‹top bottom› → ‹top center›), then the inner moves down 20%. The frame unfolds from the corner on the pinned photo side
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-od-stretch]").forEach((wrap) => {
      const col = wrap.parentElement;
      const inner = wrap.firstElementChild;
      gsap.set(inner, { scaleX: 1.2, yPercent: 0, transformOrigin: wrap.dataset.odStretch || "0%" });
      gsap.set(col, { scaleX: 0.8, xPercent: 0, transformOrigin: wrap.dataset.odStretch || "0%" });
      gsap.to(col, { xPercent: 0, scaleX: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "top center", scrub: true } });
      gsap.to(inner, { scaleX: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "top center", scrub: true } });
      gsap.to(inner, { yPercent: 20, ease: "none", scrollTrigger: { trigger: wrap, start: "top top", end: "bottom top", scrub: true } });
    });
  });

  const cap = document.querySelector(".od-method__cap");
  if (cap) {
    const fit = () => document.querySelectorAll(".od-method .od-spacer").forEach((s) => (s.style.height = `${cap.offsetHeight + 10}px`));
    new ResizeObserver(fit).observe(cap);
  }

  // Video — plays only while on screen (the original hosted video also autoplays and loops when visible)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (v.dataset.odManual) return;
    e.isIntersecting ? v.play().catch(() => {}) : v.pause();
  }));
  document.querySelectorAll("video[autoplay]").forEach((v) => io.observe(v));
})();
