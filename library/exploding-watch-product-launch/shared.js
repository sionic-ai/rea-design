// Spanning several sections: smooth scroll · loader · header line · text shuffle · drawer · cursor · cookie bar · photo flow
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => matchMedia("(min-width: 768px) and (min-height: 500px) and (orientation: landscape)").matches;
  const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=/?";
  const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];
  const PH = (window.PH = { reduce, desktop, ready: [] });

  // Wordmark spot — the original is a wide uppercase SVG logo. Our placeholder text is stretched to fit a plate of the same ratio (216×18)
  document.querySelectorAll("[data-logo]").forEach((el) => {
    const w = +(el.dataset.logoW || 216), h = +(el.dataset.logoH || 18);
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><text x="0" y="${h * 0.97}" textLength="${w}" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 500 ${h * 1.32}px var(--kf-font-display); text-transform: uppercase">${el.dataset.logo}</text></svg>`;
  });

  // Lenis 1.3.23 — original options as they are (lerp .08 · wheel 1.2 · touch 1.2 · anchor 1.5s expo)
  const lenis = reduce ? null : new Lenis({
    lerp: 0.08, wheelMultiplier: 1.2, syncTouch: true, touchMultiplier: 1.2,
    anchors: { duration: 1.5, lerp: 0, offset: 0, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) },
  });
  PH.lenis = lenis;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  PH.stop = () => lenis && lenis.stop();
  PH.start = () => lenis && lenis.start();

  // Title line rise — original createTitleAnimation (each line from 100% below over 1s, .1 stagger, .25 delay)
  PH.titleIn = (el) => {
    const split = new SplitText(el, { type: "lines" });
    return gsap.fromTo(split.lines, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.1, delay: 0.25, ease: "power2.out" });
  };
  // Once when visible — the original starts the timeline with an IntersectionObserver threshold
  PH.onSeen = (el, threshold, fn) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fn(); io.disconnect(); } }, { threshold });
    io.observe(el);
  };

  // Letter scramble — one span per letter cell. When appearing, letters resolve from symbols at .03 intervals (1.25s, .25 delayed), and on interaction that letter goes blank and its neighbors turn into symbols
  const scrs = [];
  const mountScr = (root) => root.querySelectorAll("[data-scr]").forEach((el) => {
    if (el._scr) return;
    const label = el.textContent;
    el.classList.add("ph-scr");
    el.setAttribute("aria-label", label);
    el.style.width = `${label.length + 1}ch`;
    el.innerHTML = "";
    const letters = [...label].map((ch) => {
      const s = document.createElement("span");
      s.className = "ph-scr__l";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? " " : ch;
      el.append(s);
      return s;
    });
    const api = { el, label, letters, shown: el.hasAttribute("data-scr-on") };
    if (api.shown) el.classList.add("is-on");
    api.playIn = () => {
      if (api.played) return;
      api.played = true;
      if (reduce) { gsap.set(letters, { opacity: 1 }); return; }
      letters.forEach((s, i) => {
        if (label[i] === " ") gsap.to(s, { duration: 1.2, opacity: 1, delay: i * 0.03 });
        else gsap.to(s, { duration: 1.25, delay: 0.25, opacity: 1, scrambleText: { text: label[i], chars: CHARS, revealDelay: i * 0.03 } });
      });
    };
    if (matchMedia("(hover: hover)").matches && el.hasAttribute("data-scr-hover")) {
      letters.forEach((s, i) => {
        if (label[i] === " ") return;
        s.addEventListener("mouseenter", () => {
          gsap.to(s, { opacity: 0, duration: 0.2, overwrite: "auto" });
          [i - 1, i + 1].forEach((j) => {
            if (!letters[j]) return;
            const vars = { opacity: 0.5, duration: 0.2, overwrite: "auto" };
            if (label[j] !== " ") vars.scrambleText = { text: randChar(), chars: CHARS };
            gsap.to(letters[j], vars);
          });
        });
        s.addEventListener("mouseleave", () => {
          [i, i - 1, i + 1].forEach((j) => {
            if (!letters[j]) return;
            gsap.to(letters[j], { opacity: 1, duration: 0.2, overwrite: "auto" });
            if (label[j] !== " ") gsap.to(letters[j], { duration: 0.4, scrambleText: { text: label[j], chars: CHARS }, overwrite: "auto" });
          });
        });
      });
    }
    el._scr = api;
    scrs.push(api);
  });
  mountScr(document);
  PH.mountScr = mountScr;
  PH.scr = (el) => el && el._scr;

  // Drawer — enters from the right with 1s power2.out and leaves with .6s power2.in. The scrim is .5s
  const panels = new Map();
  document.querySelectorAll(".ph-panel").forEach((p) => {
    const box = p.querySelector(".ph-panel__box"), veil = p.querySelector(".ph-panel__veil");
    const open = async () => {
      PH.stop();
      gsap.set(p, { autoAlpha: 1 });
      p.setAttribute("aria-hidden", "false");
      gsap.timeline().to(box, { xPercent: 0, x: 0, duration: 1, ease: "power2.out" }).to(veil, { opacity: 1, duration: 0.5 }, "<");
      p.querySelectorAll("[data-scr]").forEach((el) => PH.scr(el)?.playIn());
    };
    const close = async () => {
      PH.start();
      await gsap.timeline().to(box, { xPercent: 100, duration: 0.6, ease: "power2.in" }, 0).to(veil, { opacity: 0, duration: 0.5 }, 0);
      gsap.set(p, { autoAlpha: 0 });
      p.setAttribute("aria-hidden", "true");
    };
    gsap.set(box, { xPercent: 100, x: 0 });
    p.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
    veil.addEventListener("click", close);
    panels.set(p.id, { open, close });
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]");
    if (!t) return;
    e.preventDefault();
    panels.get(t.dataset.open)?.open();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") panels.forEach((p, id) => document.getElementById(id).getAttribute("aria-hidden") === "false" && p.close());
  });

  // Cursor label — quickTo .25s power2.out
  document.querySelectorAll("[data-cursor-for]").forEach((cur) => {
    const zone = document.getElementById(cur.dataset.cursorFor);
    if (!zone || !matchMedia("(hover: hover)").matches) return;
    const qx = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power2.out" });
    const qy = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power2.out" });
    zone.addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); cur.classList.add("is-on"); });
    zone.addEventListener("mouseenter", () => cur.classList.add("is-on"));
    zone.addEventListener("mouseleave", () => cur.classList.remove("is-on"));
  });

  // Cookie strip
  const cookie = document.querySelector(".ph-cookie");
  if (cookie) {
    cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { cookie.classList.remove("is-show"); cookie.classList.add("is-hide"); }));
  }

  // Photo drift — original force 20: −10% → +10% while the photo’s top edge passes from the bottom of the screen upward
  const pars = [...document.querySelectorAll("[data-parallax]")];
  const parallax = () => {
    for (const box of pars) {
      const img = box.firstElementChild;
      if (!img) continue;
      const { top, height } = box.getBoundingClientRect();
      const p = Math.min(Math.max(1 - (top + height) / (innerHeight + height), 0), 1);
      img.style.transform = `translate3d(0, ${(p - 0.5) * 20}%, 0) scale(1.15)`;
    }
  };
  if (!reduce) { addEventListener("scroll", parallax, { passive: true }); addEventListener("resize", parallax); parallax(); }

  // Header row — current section number, the ‹Scroll› text turns off in .5s after 1/5 of the screen is passed, progress bar above, button fill below changes per section
  const head = document.querySelector(".ph-head");
  const scrollLabel = document.querySelector(".ph-bottom__scroll");
  const bar = document.querySelector(".ph-progress__in");
  const bottomBtn = document.querySelector(".ph-bottom .ph-btn");
  let labelOn = true;
  const onScroll = () => {
    const on = scrollY <= innerHeight / 5;
    if (scrollLabel && on !== labelOn) { labelOn = on; gsap.to(scrollLabel, { autoAlpha: on ? 1 : 0, duration: 0.5, ease: "power2.out" }); }
    if (bar) bar.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const links = [...document.querySelectorAll(".ph-head__list a[href^='#']")];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
  }), { rootMargin: "-50% 0px -50% 0px" });
  links.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); t && io.observe(t); });
  // Bottom button color per section — data-push="dark|light|hidden" Switches when the section’s top edge touches the bottom of the screen (.25s)
  if (bottomBtn) {
    document.querySelectorAll("[data-push]").forEach((sec) => {
      const apply = (theme) => {
        gsap.to(bottomBtn, { autoAlpha: theme === "hidden" ? 0 : 1, duration: 0.25, ease: "power2.out" });
        if (theme !== "hidden") bottomBtn.classList.toggle("ph-btn--dark", theme === "dark");
      };
      ScrollTrigger.create({
        trigger: sec, start: sec.dataset.pushStart || "top bottom", end: "bottom bottom",
        onEnter: () => apply(sec.dataset.push), onEnterBack: () => apply(sec.dataset.push),
      });
    });
  }

  // Phone menu — curtain .5s, panel opens top to bottom (clip .75s), items rise at .1 intervals, closing runs in reverse 1.5x faster
  const menuBtn = document.querySelector(".ph-head__menuBtn");
  const list = document.querySelector(".ph-head__list");
  const veil = document.querySelector(".ph-head__veil");
  if (menuBtn && list) {
    let open = false, tl = null;
    const build = () => {
      tl = gsap.timeline({ paused: true, onReverseComplete: () => head.classList.remove("is-open") })
        .to(veil, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0)
        .fromTo(list, { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" }, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power2.out" }, 0)
        .fromTo(list.children, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.1, duration: 0.75, ease: "power2.out" }, "-=0.35");
    };
    const toggle = (v) => {
      if (desktop()) return;
      open = v;
      if (!tl) build();
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector(".ph-plus").textContent = open ? "[-]" : "[+]";
      if (open) { head.classList.add("is-open"); PH.stop(); tl.timeScale(1).play(); }
      else { PH.start(); tl.timeScale(1.5).reverse(); }
    };
    menuBtn.addEventListener("click", () => toggle(!open));
    veil.addEventListener("click", () => toggle(false));
    list.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && toggle(false)));
    addEventListener("resize", () => { if (desktop() && tl) { tl.progress(0).pause(); gsap.set([list, list.children, veil], { clearProps: "all" }); head.classList.remove("is-open"); open = false; tl = null; } });
  }

  // Footer — sits below at the height of the panel, then is revealed, and the covering veil (.75) lifts with power1.in
  const foot = document.querySelector(".ph-foot");
  if (foot) {
    const wrap = foot.querySelector(".ph-foot__wrap");
    const setH = () => wrap.style.setProperty("--wrap-h", `${wrap.offsetHeight}px`);
    new ResizeObserver(setH).observe(wrap);
    setH();
    if (!reduce) gsap.timeline({ scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true, fastScrollEnd: true } })
      .fromTo(foot.querySelector(".ph-foot__shade"), { autoAlpha: 1 }, { autoAlpha: 0, ease: "power1.in" });
    else gsap.set(foot.querySelector(".ph-foot__shade"), { autoAlpha: 0 });
  }

  // Loader — blueprint clock 2s, logo .5s (.5 overlap), LOADING·MINT·LEGACY unfold in turn, and once ready it rests 1.75s then lifts away in 1s.
  const loader = document.querySelector(".ph-loader");
  const ready = (PH.whenReady = new Promise((res) => (PH.markReady = res)));
  const finish = () => {
    document.documentElement.classList.add("is-ready");
    PH.ready.forEach((fn) => fn());
    PH.start();
    // Pins created late by the part (fx-core) sit in an earlier section, so re-sort them in document order before measuring
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    cookie && setTimeout(() => cookie.classList.add("is-show"), 300);
  };
  if (loader && !reduce) {
    PH.stop();
    const q = (s) => loader.querySelector(s);
    const tl = gsap.timeline()
      .fromTo(q(".ph-loader__watch"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, ease: "power2.out" }, "<")
      .to(q(".ph-loader__logo"), { autoAlpha: 1, duration: 0.5 }, "-=0.5")
      .add(() => PH.scr(q(".ph-loader__loading"))?.playIn(), "-=0.5")
      .add(() => PH.scr(q(".ph-loader__mint"))?.playIn(), "-=0.25")
      .add(() => PH.scr(q(".ph-loader__legacy"))?.playIn());
    Promise.all([ready, tl.then()]).then(() => gsap.to(loader, { autoAlpha: 0, duration: 1, delay: 1.75, ease: "power2.out", onComplete: finish }));
  } else {
    loader && gsap.set(loader, { autoAlpha: 0 });
    ready.then(finish);
  }
  // Shuffle text outside the loader — header line and menu are visible from the start, and data-scr-seen is released when visible
  scrs.forEach((s) => {
    if (s.el.closest(".ph-loader, .ph-panel") || s.el.hasAttribute("data-scr-own")) return;
    if (s.el.hasAttribute("data-scr-seen")) PH.ready.push(() => PH.onSeen(s.el, 0.5, s.playIn));
    else if (!s.shown) PH.ready.push(s.playIn);
  });
})();
