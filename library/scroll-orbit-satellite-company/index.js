// First page — builds a scroll slot (spacer) per frame and switches the pinned frame on and off while that slot passes.
// The scene (scene.js) receives the sum of frame progress and moves the camera·satellite·earth. Values exactly as read from the original 60fps version.
(() => {
  const { color, reduce } = window.ES;
  const app = document.getElementById("fps-app");
  const wrapper = app.querySelector(".fps-scroll-wrapper");
  const sections = [...app.querySelectorAll("#fps-root > section")];
  const fixedBtn = app.querySelector(".fps-button.fps-fixed");
  const nav = app.querySelector(".fps-nav");
  const navItems = Object.fromEntries([...nav.querySelectorAll(".fps-nav__item")].map((el) => [el.dataset.key, { el, fill: el.querySelector("i"), progress: 0 }]));
  const navSecs = [...nav.querySelectorAll(".fps-nav__sec")];
  const lenis = window.ES.lenis;

  if (reduce) {
    // With reduced motion, frames are stacked in document flow one after another — final state only
    app.classList.add("is-static");
    app.style.opacity = "1";
    sections.forEach((s) => gsap.set(s, { opacity: 1, position: "relative" }));
    return;
  }

  // Scroll slot
  const spacers = new Map();
  sections.forEach((s) => {
    const d = document.createElement("div");
    d.className = "fps-spacer";
    // Inline min-height like the original — if set as height, the CSS min-height 100svh wins and the first row (50svh) stretches to 100svh
    d.style.minHeight = s.dataset.scrollHeight || "100svh";
    wrapper.append(d);
    spacers.set(s, d);
  });
  sections[sections.length - 1].setAttribute("data-last", "");

  // Frame on and off — frames without a hand-off switch right at the cell start and end, the rest fade in over .2 and fade out over .15 from .85
  sections.forEach((s, i) => {
    const sp = spacers.get(s);
    const tl = gsap.timeline();
    if (i === 0 || s.hasAttribute("data-no-transition")) {
      tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, 0);
      tl.to(s, { opacity: 0, duration: 0.001, ease: "none" }, 0.999);
    } else {
      tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0);
      tl.fromTo(s, { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "none", immediateRender: false }, 0.85);
    }
    tl.add(() => {}, 1);
    ScrollTrigger.create({ trigger: sp, start: i === 0 ? "top-=1px top" : "top top", end: "bottom top", scrub: true, toggleClass: { targets: s, className: "is-visible" }, animation: tl });
  });

  // Frame progress — goes 0→1 while passing the middle of the cell (second frame 0→2). The sum is the scene’s camera position
  const frames = sections.map((s, i) => ({ el: s, sp: spacers.get(s), p: 0, i }));
  frames.forEach((f, i) => {
    if (i === 0) return;
    const second = f.el.hasAttribute("data-second"), last = f.el.hasAttribute("data-last");
    const speed = parseFloat(f.el.dataset.scrollSpeed || "1");
    gsap.timeline({
      scrollTrigger: {
        trigger: f.sp, scrub: true, start: second ? "top+=50% bottom" : "top center", end: last ? "center center" : "bottom center",
        onEnter: () => setSpeed(speed), onEnterBack: () => setSpeed(speed),
      },
    }).fromTo(f, { p: 0 }, { p: second ? 2 : 1, duration: 1, ease: "linear" }, 0);
  });
  // The original changes scroll speed every frame (data-scroll-speed) — via the lenis wheel multiplier
  const setSpeed = (v) => { if (lenis) lenis.options.wheelMultiplier = v; };

  // Progress bar — fills the frame’s nav-key slot with sine.inOut 2.2 (starting at .8 of a total length of 3)
  frames.forEach((f) => {
    const key = f.el.dataset.navKey;
    const tl = gsap.timeline({ scrollTrigger: { trigger: f.sp, scrub: true } });
    if (key && navItems[key]) {
      const [a, b] = (f.el.dataset.navKeyProgress || "0;1").split(";").map(parseFloat);
      if (a === 0) tl.fromTo(navItems[key], { progress: a }, { progress: b, ease: "sine.inOut", duration: 2.2 }, 0.8);
      else tl.to(navItems[key], { progress: b, ease: "sine.inOut", duration: 2.2 }, 0.8);
    }
    tl.add(() => {}, 3);
  });
  let navPlace = 0, navGone = 0;
  const navTick = () => {
    for (const k in navItems) gsap.set(navItems[k].fill, { scaleX: navItems[k].progress });
    // Opens the section of the currently visible frame (inherits top-nav-key)
    let top = null;
    for (const f of frames) {
      if (f.el.dataset.topNavKey) top = f.el.dataset.topNavKey;
      if (f.el.classList.contains("is-visible")) { if (f.el.dataset.navKey) top = topOf(f.el); break; }
    }
    navSecs.forEach((s) => s.classList.toggle("is-active", s.dataset.key === top));
    nav.style.opacity = Math.min(navPlace, 1 - navGone);
  };
  const topOf = (el) => { const sec = nav.querySelector(`.fps-nav__item[data-key="${el.dataset.navKey}"]`)?.closest(".fps-nav__sec"); return sec?.dataset.key; };
  nav.style.opacity = 0;

  const split = (el, type, extra = {}) => new SplitText(el, { type, linesClass: "fps-line", ...extra });
  const enterTl = (sp, opts = {}) => gsap.timeline({ scrollTrigger: { trigger: sp, start: opts.start || "top top", end: "bottom top", toggleActions: "play none none reset" } });
  const scrubTl = (sp) => gsap.timeline({ scrollTrigger: { trigger: sp, start: "top top", end: "bottom top", scrub: true } });
  const unlit = color("--es-unlit"), lit = color("--kf-ink"), cOrange = color("--es-orange"), cGrey = color("--es-grey");

  const build = {
    Hero(f) {
      const pre = f.el.querySelector(".fps-pretitle"), title = f.el.querySelector(".fps-title-main");
      const sp = split(pre, "words", { wordsClass: "fps-word" }), st = split(title, "lines,words", { wordsClass: "fps-word" });
      // First open — with CSS transition, words rise from 200% below (title after 450ms at .075s steps, heading after 300ms at .025s steps)
      const open = (words, wait, step) => words.forEach((w, i) => {
        w.style.transform = "translate3d(0, 200%, 0)";
        setTimeout(() => { w.style.transition = `transform 1s cubic-bezier(0.14, 1, 0.34, 1) ${(step * i).toFixed(3)}s`; w.style.transform = "translate3d(0, 0, 0)"; }, wait);
      });
      open(st.words, 450, 0.075);
      open(sp.words, 300, 0.025);
      fixedBtn.style.opacity = "0";
      setTimeout(() => { fixedBtn.style.transition = "opacity 1s linear"; fixedBtn.style.opacity = "1"; }, 800);
      setTimeout(() => { fixedBtn.style.transition = ""; [...sp.words, ...st.words].forEach((w) => (w.style.transition = "")); }, 1800);
      const tl = scrubTl(f.sp);
      tl.fromTo(pre, { opacity: 1 }, { opacity: 0, duration: 0.7 }, 0.3);
      tl.fromTo(st.words, { y: 0 }, { y: "-150%", duration: 0.7, stagger: 0.02, ease: "power2.in" }, 0.3);
      tl.fromTo(f.el, { y: 0 }, { y: "-15%", duration: 1, ease: "power2.in" }, 0);
      tl.add(() => {}, 1);
    },
    TextReveal(f) {
      const pre = f.el.querySelector(".fps-pretitle"), sub = f.el.querySelector(".fps-subtitle"), inner = f.el.querySelector(".fps-inner");
      const a = split(pre, "lines,words"), b = split(sub, "words, chars");
      const tl = enterTl(f.sp);
      tl.fromTo(f.el, { y: 60 }, { y: 0, duration: 0.6, ease: "power3" }, 0);
      tl.fromTo(a.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0);
      tl.fromTo(b.chars, { color: unlit }, { color: lit, duration: 0.4, stagger: 0.01, ease: "power1" }, 0);
      const long = f.el.dataset.scrollHeight === "200svh", s = scrubTl(f.sp);
      s.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0);
      s.fromTo(inner, { y: 0 }, { y: -40, duration: 0.3, ease: "power2.in" }, long ? 1.7 : 0.7);
      s.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, long ? 1.7 : 0.7);
      s.add(() => {}, long ? 2 : 1);
    },
    TwoSteps(f) {
      const el = f.el, wrap = el.querySelector(".fps-title-wrapper"), small = wrap.querySelector(".fps-title-small"), big = wrap.querySelector(".fps-title-big");
      const items = el.querySelectorAll(".fps-define-receive > .fps-step-item"), numbers = el.querySelectorAll(".fps-step-number"), titles = el.querySelectorAll(".fps-define-receive .fps-step-title");
      const smalls = el.querySelectorAll(".fps-define-receive .fps-step-item .fps-title-small"), sep = el.querySelector(".fps-separator"), spacer = el.querySelector(".fps-spacer-x");
      const center = el.querySelector(".fps-item-center"), month = center.querySelector(".fps-title-big"), bar = center.querySelector(".fps-progress"), bg = center.querySelector(".fps-progress__bg"), texts = center.querySelectorAll(".fps-progress__text");
      const e = split(small, "words"), t = new SplitText(big, { type: "words", mask: "words" }), n = split(month, "lines,words");
      gsap.set(center, { opacity: 1 });
      const tl = enterTl(f.sp);
      tl.fromTo(e.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0);
      tl.fromTo(t.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0.1);
      const o = scrubTl(f.sp);
      o.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0);
      o.fromTo(t.masks, { y: 0 }, { y: "-150%", duration: 0.4, ease: "power2.in" }, 1);
      o.fromTo(small, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "none" }, 1);
      o.fromTo(big, { scale: 1 }, { scale: 0.9, duration: 0.4, ease: "power2.in" }, 1);
      o.fromTo(sep, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.2);
      o.fromTo(sep, { scaleY: 1 }, { scaleY: 0.2, duration: 0.8, ease: "power2" }, 1.2);
      o.from(spacer, { width: "100vw", duration: 1, ease: "power2" }, 1);
      o.fromTo(smalls[0], { x: 100 }, { x: 0, duration: 1, ease: "power2" }, 1);
      o.fromTo(smalls[1], { x: 100 }, { x: 0, duration: 1, ease: "power2" }, 1);
      o.fromTo(numbers, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 1.7);
      o.fromTo(items, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 1);
      o.fromTo(bg, { scaleX: 0.00196 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 2);
      o.fromTo(texts[0], { x: 300 }, { x: 0, duration: 1.2, ease: "power2.inOut" }, 2);
      o.fromTo(texts[1], { x: -300 }, { x: 0, duration: 1.2, ease: "power2.inOut" }, 2);
      o.to(spacer, { width: "100vw", duration: 1.2, ease: "power2.inOut" }, 2);
      o.to(sep, { opacity: 0, duration: 0.1 }, 2);
      o.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 2);
      o.to(el.querySelectorAll(".fps-step-number span"), { opacity: 0, duration: 0.4, ease: "none" }, 2);
      o.to(titles[0].querySelector("span"), { x: -60, duration: 1.2, ease: "power2.inOut" }, 2);
      o.to(smalls[1].querySelector("span"), { x: 60, duration: 1.2, ease: "power2.inOut" }, 2);
      o.to(items, { opacity: 0, duration: 0.3, ease: "none" }, 2.4);
      o.fromTo(n.words, { y: "150%" }, { y: "0", duration: 0.5, stagger: 0.04, ease: "power2" }, 2.4);
      o.fromTo(month, { scale: 0.7 }, { scale: 1, duration: 0.6, ease: "power2" }, "<");
      o.fromTo(texts, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 2.6);
      o.to(texts, { opacity: 0, duration: 0.1, ease: "none" }, 3.5);
      o.fromTo(n.words, { y: 0 }, { y: "-150%", duration: 0.4, stagger: 0.04, ease: "power2.in", immediateRender: false }, "<");
      o.to(bar, { opacity: 0, duration: 0.25 }, 3.5);
      o.add(() => {}, 4);
      // In the original the progress bar fill runs in the same cell — the 0→6 month bar
      o.fromTo(center.querySelector(".fps-progress__fill"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 2.2);
    },
    WeCover(f) {
      const big = f.el.querySelector(".fps-title-big");
      const e = split(big, "lines,words"), t = new SplitText(e.words, { type: "words", wordsClass: "fps-word" });
      enterTl(f.sp).fromTo(e.words, { y: "150%" }, { y: "0", duration: 0.6, stagger: 0.04, ease: "power2" }, 0);
      const i = scrubTl(f.sp);
      i.fromTo(proxy, { place: 0 }, { place: 1, ease: "none", duration: 0.5 }, 0);
      i.fromTo(t.words, { y: 0 }, { y: "-150%", duration: 0.4, stagger: 0.04, ease: "power2.in", immediateRender: false }, 0.55);
      i.add(() => {}, 1);
    },
    Playload(f) {
      const el = f.el, cats = el.querySelectorAll(".fps-payload__cat"), sliders = [...el.querySelectorAll(".fps-payload__slider")], wrap = el.querySelector(".fps-payload__sliders");
      const items = el.querySelectorAll(".fps-payload__item"), cont = el.querySelector(".fps-continue");
      const tSplit = split(el.querySelector(".fps-step-title"), "lines,words"), sSplit = split(el.querySelector(".fps-step-item .fps-title-small"), "lines,words");
      const num = el.querySelector(".fps-step-number");
      let current = sliders[0].querySelectorAll(".fps-payload__item");
      const tl = enterTl(f.sp, { start: "top top-=20%" });
      tl.fromTo(cont, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power3" }, 1);
      tl.fromTo(el, { y: 60 }, { y: 0, duration: 0.6, ease: "power3" }, 0);
      tl.fromTo(tSplit.words, { y: "150%" }, { y: "0", duration: 0.8, ease: "expo" }, 0);
      tl.fromTo(sSplit.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0.2);
      tl.fromTo(num, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.3);
      tl.from(cats, { opacity: 0, duration: 0.2, stagger: 0.08, clearProps: "all" }, 0.1);
      tl.fromTo(current, { y: 30 }, { y: 0, duration: 0.6, stagger: 0.06, ease: "power3" }, 0.2);
      tl.fromTo(current, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.06 }, 0.2);
      cats.forEach((c) => c.addEventListener("click", () => {
        if (c.classList.contains("is-active")) return;
        const k = c.dataset.category;
        cats.forEach((x) => x.classList.toggle("is-active", x === c));
        current = sliders.find((s) => s.dataset.category === k).querySelectorAll(".fps-payload__item");
        const t = gsap.timeline();
        t.to(wrap, { opacity: 0, duration: 0.2 }, 0);
        t.call(() => sliders.forEach((s) => s.classList.toggle("is-active", s.dataset.category === k)));
        t.set(wrap, { opacity: 1 }, ">");
        t.fromTo(current, { y: 30 }, { y: 0, duration: 0.6, stagger: 0.06, ease: "power3" }, "<");
        t.fromTo(current, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.06 }, "<");
      }));
      items.forEach((it) => it.addEventListener("click", () => {
        items.forEach((x) => x.classList.toggle("is-active", x === it));
        window.ESScene?.pulse();
      }));
    },
    SubSection(f) {
      const title = f.el.querySelector(".fps-t59");
      const mode = f.el.dataset.transitionHorizontal;
      const e = new SplitText(title, { type: "lines, words", linesClass: "fps-line", mask: "lines" });
      const tl = enterTl(f.sp);
      if (mode === "both" || mode === "enter") {
        tl.fromTo(mode === "enter" ? e.masks : e.lines, { x: 80 }, { x: 0, duration: 0.6, ease: "power3", stagger: 0.04 }, 0);
        tl.fromTo(e.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0);
      } else tl.fromTo(e.lines, { y: "150%" }, { y: "0", duration: 0.6, stagger: 0.04, ease: "expo" }, 0);
      const s = scrubTl(f.sp);
      if (mode === "both" || mode === "leave") {
        s.fromTo(e.masks, { x: 0 }, { x: -40, duration: 0.34, ease: "power2.in", stagger: 0.04, immediateRender: false }, 0.6);
        s.fromTo(e.masks, { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.7);
      } else {
        s.fromTo(e.lines, { y: "0" }, { y: "-150%", duration: 0.25, ease: "power2.in", stagger: 0.02 }, 0.73);
        s.fromTo(e.masks, { opacity: 1 }, { opacity: 0, duration: 0.125, stagger: 0.04, immediateRender: false }, 0.83);
      }
      s.add(() => {}, 1);
    },
    Receive(f) {
      const title = f.el.querySelector(".fps-step-title"), sub = f.el.querySelector(".fps-title-small"), num = f.el.querySelector(".fps-step-number");
      const tl = enterTl(f.sp);
      tl.fromTo(title, { x: 120 }, { x: 0, duration: 0.8, ease: "power3" }, 0);
      tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" }, 0);
      tl.fromTo(sub, { x: 160 }, { x: 0, duration: 0.7, ease: "power3" }, 0.1);
      tl.fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none" }, 0.1);
      tl.fromTo(num, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0.4);
    },
    Cloud(f) {
      const inner = f.el.querySelector(".fps-inner");
      const e = split(inner.querySelector(".fps-title-small"), "words"), t = split(inner.querySelector(".fps-title-big"), "words");
      const n = enterTl(f.sp);
      n.fromTo(e.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0);
      n.fromTo(t.words, { y: "150%" }, { y: "0", duration: 0.8, stagger: 0.06, ease: "expo" }, 0.1);
      const i = scrubTl(f.sp);
      i.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0);
      i.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "none", immediateRender: false }, 0.8);
      i.add(() => {}, 1);
    },
    TitleSubtitle(f) {
      const mode = f.el.dataset.transitionHorizontal;
      const e = new SplitText(f.el.querySelector(".fps-t135"), { type: "lines,words", mask: "words", wordsClass: "fps-words" });
      const t = new SplitText(f.el.querySelector(".fps-t27"), { type: "lines", mask: "lines" });
      const n = enterTl(f.sp);
      if (mode === "both" || mode === "enter") {
        n.fromTo(e.lines, { x: 150 }, { x: 0, duration: 0.6, ease: "power3", stagger: 0.04 }, 0);
        n.fromTo(e.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0);
        n.fromTo(t.lines, { x: 80 }, { x: 0, duration: 0.6, ease: "power3", stagger: 0.04 }, 0.1);
        n.fromTo(t.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0.1);
      } else {
        n.fromTo(e.lines, { y: "150%" }, { y: "0", duration: 0.6, stagger: 0.04, ease: "expo" }, 0);
        n.fromTo(e.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0);
        n.fromTo(t.lines, { y: "150%" }, { y: "0", duration: 0.6, stagger: 0.04, ease: "expo" }, 0.2);
        n.fromTo(t.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0.2);
      }
      const i = scrubTl(f.sp);
      if (mode === "both" || mode === "leave") {
        i.fromTo(e.masks, { x: 0 }, { x: -80, duration: 0.34, ease: "power2.in", stagger: 0.02, immediateRender: false }, 0.6);
        i.fromTo(e.masks, { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.7);
        i.fromTo(t.masks, { x: 0 }, { x: -60, duration: 0.34, ease: "power2.in", stagger: 0.04, immediateRender: false }, 0.65);
        i.fromTo(t.masks, { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.75);
      } else {
        i.fromTo(e.lines, { y: "0" }, { y: "-150%", duration: 0.25, ease: "power2.in", stagger: 0.02 }, 0.73);
        i.fromTo(e.lines, { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.7);
        i.fromTo(t.lines, { y: "0" }, { y: "-150%", duration: 0.25, ease: "power2.in", stagger: 0.02 }, 0.83);
        i.fromTo(t.lines, { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.8);
      }
    },
    Performance(f) {
      const el = f.el, panel = el.querySelector(".fps-panel"), line = el.querySelector(".fps-panel__line");
      const names = panel.querySelectorAll(".fps-info-name"), values = panel.querySelectorAll(".fps-info-value"), bar = panel.querySelector("[data-info-bar]");
      const infos = [{ min: 4.2, max: 10, unit: "A" }, { min: 30, max: 100, unit: "%" }, { min: 100, max: 2000, unit: "Mbps" }, { min: 30, max: 33, unit: "dBm" }].map((d, i) => ({ ...d, el: panel.querySelector(`[data-info="${i}"]`), p: d.min }));
      const accent = (a) => color("--kf-accent").replace("rgb(", "rgba(").replace(")", `, ${a})`);
      const bgState = { v: 0 };
      const paint = () => { const e = bgState.v; panel.style.background = `linear-gradient(90deg, ${accent(0)} ${((-1 + e * 2) * 100).toFixed(2)}%, ${accent(0.4)} ${(-0.5 + e * 2 * 100).toFixed(2)}%, ${accent(0)} ${(e * 2 * 100).toFixed(2)}%)`; };
      // Repeat where values spin and light passes over the panel — original itl (loop · 1.2x speed)
      const itl = gsap.timeline({ repeat: -1, paused: true });
      infos.forEach((d, i) => itl.fromTo(d, { p: d.min }, { p: d.max, ease: "power2.inOut", duration: 1, onUpdate: () => (d.el.textContent = `${d.p.toFixed()} ${d.unit}`) }, 1 + i * 0.1));
      itl.fromTo(bar, { scaleX: 0.3 }, { scaleX: 1, ease: "power2.inOut", duration: 1 }, 1.1);
      itl.fromTo(bgState, { v: 0 }, { v: 1, ease: "power1.inOut", duration: 1.2, onUpdate: paint }, 0.5);
      infos.forEach((d, i) => itl.to(d, { p: d.min, ease: "power2.inOut", duration: 1, onUpdate: () => (d.el.textContent = `${d.p.toFixed()} ${d.unit}`) }, 5 + i * 0.1));
      itl.to(bar, { scaleX: 0.3, ease: "power2.inOut", duration: 1 }, 5.1);
      itl.fromTo(bgState, { v: 0 }, { v: 1, ease: "power1.inOut", duration: 1.2, onUpdate: paint }, 5);
      itl.add(() => {}, 9.2);
      itl.timeScale(1.2);
      const e = new SplitText(el.querySelector(".fps-t59"), { type: "lines, words", linesClass: "fps-line", mask: "lines" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: f.sp, start: "top top", end: "bottom top", toggleActions: "play none none reset", onEnter: () => itl.seek(0).play(), onEnterBack: () => itl.seek(0).play(), onLeave: () => itl.pause(), onLeaveBack: () => itl.pause() } });
      tl.fromTo(e.lines, { x: 50 }, { x: 0, duration: 0.6, ease: "power3", stagger: 0.04 }, 0);
      tl.fromTo(e.lines, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.04 }, 0);
      tl.fromTo(panel, { x: 40 }, { x: 0, duration: 0.6, ease: "power3" }, 0.1);
      tl.fromTo(names, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.08 }, 0.1);
      tl.fromTo(values, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.08 }, 0.1);
      tl.fromTo(values, { x: 20 }, { x: 0, duration: 0.6, ease: "power3", stagger: 0.08 }, 0.1);
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3" }, 0.2);
      const s = scrubTl(f.sp);
      s.fromTo(e.masks, { x: 0 }, { x: -40, duration: 0.34, ease: "power2.in", stagger: 0.04, immediateRender: false }, 0.6);
      s.fromTo([...e.masks, panel], { opacity: 1 }, { opacity: 0, duration: 0.22, stagger: 0.04, immediateRender: false }, 0.7);
      s.add(() => {}, 1);
    },
    Cost(f) {
      const el = f.el, inner = el.querySelector(".fps-inner"), drag = el.querySelector(".fps-drag"), track = drag.querySelector(".fps-drag__track");
      const count = el.querySelector("[data-cost-count]"), total = el.querySelector("[data-cost-total]"), time = el.querySelector("[data-cost-time]");
      const descs = el.querySelectorAll(".fps-cost__desc span"), labels = el.querySelectorAll(".fps-cost__label span"), seps = el.querySelectorAll(".fps-cost__sep");
      const state = { p: 1 };
      // Drag value → count, wait, total (original formula as is) · number of data rows in the scene
      const set = () => {
        drag.style.setProperty("--p", state.p);
        const v = state.p, n = Math.round((1 - v) ** 4 * 599) + 1, t = Math.round((1 - v) ** 1.5 * 599) + 1;
        time.textContent = t > 200 ? `${Math.round((1 - (t - 200) / 400) * 59) + 1}M` : `${Math.round(((200 - t) / 200) * 47) + 1}H`;
        count.textContent = n;
        const c = n * 0.6;
        total.textContent = `${c > 10 ? c.toFixed(0) : c.toFixed(1)} M`;
        window.ESScene?.setTrails((1 - v) ** 2 * 0.75 + 0.25);
      };
      const ti = new SplitText(el.querySelector(".fps-cost__title"), { type: "lines, words", linesClass: "fps-line", mask: "lines" });
      const su = new SplitText(el.querySelector(".fps-cost__sub"), { type: "lines", linesClass: "fps-line", mask: "lines" });
      const t = gsap.timeline({ scrollTrigger: { trigger: f.sp, start: "top top", end: "bottom top", toggleActions: "play none none reset", onLeaveBack: () => { state.p = 1; set(); } } });
      t.fromTo(el, { y: 60 }, { y: 0, duration: 0.6, ease: "power3" }, 0);
      t.fromTo(ti.words, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo", stagger: 0.08 }, 0);
      t.fromTo(su.lines, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo" }, 0.3);
      t.fromTo(drag, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.4);
      t.fromTo([count, total], { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo" }, 0.6);
      t.fromTo(descs, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo" }, 0.8);
      t.fromTo(labels, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo", stagger: 0.08 }, 0.8);
      t.fromTo(state, { p: 1 }, { p: 1 - 0.535, duration: 1.5, ease: "power2.inOut", onUpdate: set }, 0.8);
      t.fromTo(seps, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power2" }, 0.9);
      const i = scrubTl(f.sp);
      i.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      i.to(inner, { opacity: 0, duration: 0.2 }, 0.8);
      i.fromTo(inner, { y: 0 }, { y: -60, duration: 0.2, ease: "power2.in" }, 0.85);
      i.add(() => {}, 1);
      // Dragging — jumps straight to the pressed spot, then moves by the amount dragged (on phones only from the handle row so touch isn’t hijacked)
      let x0 = 0, dragging = false;
      const width = () => track.getBoundingClientRect().width || 1;
      drag.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        dragging = true; drag.classList.add("is-dragging"); x0 = e.clientX;
        state.p = gsap.utils.clamp(0, 1, (e.clientX - track.getBoundingClientRect().left) / width()); set();
        drag.setPointerCapture(e.pointerId);
      });
      drag.addEventListener("pointermove", (e) => { if (!dragging) return; state.p = gsap.utils.clamp(0, 1, state.p + (e.clientX - x0) / width()); x0 = e.clientX; set(); });
      const up = () => { dragging = false; drag.classList.remove("is-dragging"); };
      drag.addEventListener("pointerup", up);
      drag.addEventListener("pointercancel", up);
      set();
    },
    TotalCost(f) {
      const el = f.el, inner = el.querySelector(".fps-inner"), digits = el.querySelector(".fps-total__digits"), one = el.querySelector(".fps-total__one");
      const pre = el.querySelector(".fps-total__pre"), unitWrap = el.querySelector(".fps-total__unit"), unit = unitWrap.querySelector("span");
      const list = el.querySelectorAll(".fps-total__side li"), bar = el.querySelector(".fps-total__bar"), prog = bar.querySelector("span");
      // Four digit strips — different lengths, so they roll differently and stop on ‹1› (original OA table)
      const COLS = [[3, 2, 1, " "], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 5, 4, 3, 2, 1, " "], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 9, 8, 7, 6, 5, 4, 3, 2, " "], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, " "]];
      const cols = COLS.map((nums) => { const c = document.createElement("div"); c.className = "fps-total__col"; c.innerHTML = nums.map((n) => `<span>${n === " " ? "&nbsp;" : n}</span>`).join(""); digits.append(c); return { el: c, count: nums.length }; });
      const h = () => cols[0].el.firstElementChild.getBoundingClientRect().height;
      const e = new SplitText(el.querySelector(".fps-total__title"), { type: "lines", mask: "lines" });
      const t = new SplitText(pre, { type: "words", mask: "words" });
      const n = new SplitText(list, { type: "lines", mask: "lines" });
      const i = enterTl(f.sp);
      i.fromTo(t.words, { y: "150%" }, { y: "0%", duration: 0.8, stagger: 0.08, ease: "expo" }, 0);
      i.fromTo(digits, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo" }, 0.2);
      i.fromTo(unit, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.6);
      cols.forEach((c, l) => i.fromTo(c.el, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2 + Math.abs(1.5 - l) * 0.05));
      i.fromTo(e.lines, { y: "150%" }, { y: "0%", duration: 0.6, stagger: 0.04, ease: "expo" }, 0.5);
      i.fromTo(n.lines, { y: "150%" }, { y: "0%", duration: 0.8, stagger: 0.06, ease: "expo" }, 0.7);
      i.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: "expo" }, 0.8);
      const s = gsap.timeline({ scrollTrigger: { trigger: f.sp, start: () => `top+=${innerHeight} top`, end: () => `top+=${innerHeight * 3} top`, scrub: true, invalidateOnRefresh: true } });
      const c = { v: 0 };
      s.fromTo(c, { v: 0 }, { v: 1, duration: 1, onUpdate: () => { const col = gsap.utils.interpolate(cOrange, lit, c.v); unitWrap.style.color = col; pre.style.color = col; prog.style.backgroundColor = col; } }, 0);
      cols.forEach((col, l) => s.fromTo(col.el, { y: 0 }, { y: () => -(col.count - 1) * h(), duration: l === 1 || l === 2 ? 1 : 0.8, ease: "power3.inOut" }, l * 0.02 + (l === 1 || l === 2 ? 0.01 : 0)));
      s.fromTo(one, { y: () => h() }, { y: 0, duration: 0.1, ease: "power1.out" }, 0.8);
      s.fromTo(list[0], { color: cOrange }, { color: cGrey, duration: 0.5 }, 0);
      s.fromTo(list[1], { color: cGrey }, { color: lit, duration: 0.5 }, 0.5);
      s.fromTo(prog, { y: 0 }, { y: () => bar.offsetHeight - prog.offsetHeight, duration: 0.8, ease: "power2.inOut" }, 0.1);
      const o = scrubTl(f.sp);
      o.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0);
      o.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 3.8);
      o.fromTo(fixedBtn, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 3.8);
      o.add(() => {}, 4);
    },
    Orbit(f) {
      const inner = f.el.querySelector(".fps-inner"), title = f.el.querySelector(".fps-t135"), btn = f.el.querySelector(".fps-last-btn");
      const e = new SplitText(title, { type: "words", mask: "words" });
      const a = enterTl(f.sp);
      a.fromTo(title, { y: 60 }, { y: 0, duration: 0.6, ease: "power3" }, 0);
      a.fromTo(e.words, { y: "150%" }, { y: "0%", duration: 0.8, ease: "expo", stagger: 0.06 }, 0);
      const s = scrubTl(f.sp);
      s.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0);
      s.to(inner, { opacity: 0, duration: 0.3 }, 0.7);
      s.to(inner, { y: "-15vh", duration: 0.4, ease: "power2.in" }, 0.6);
      s.add(() => {}, 1);
      const s2 = gsap.timeline({ scrollTrigger: { trigger: f.sp, scrub: true } });
      s2.fromTo(proxy, { gone: 0 }, { gone: 1, duration: 0.5, ease: "power2.inOut" }, 0.25);
      s2.fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.48);
      s2.add(() => {}, 1);
    },
    Basic() {},
  };
  // Values where the bar appears (first big claim frame) and disappears (last button frame)
  const proxy = { get place() { return navPlace; }, set place(v) { navPlace = v; }, get gone() { return navGone; }, set gone(v) { navGone = v; } };

  // The original turns the whole panel on with 1s linear after scene · fonts are all in, and the hero text opens then
  document.fonts.ready.then(() => {
    frames.forEach((f) => (build[f.el.dataset.frame] || build.Basic)(f));
    ScrollTrigger.refresh();
    app.style.opacity = "1";
    app.style.transition = "opacity 1s linear";
  });

  gsap.ticker.add(() => {
    let P = 0;
    for (const f of frames) P += f.p;
    window.ESScene?.setProgress(P);
    navTick();
  });

  // Clicking a progress bar cell jumps to that section’s cell
  nav.querySelectorAll(".fps-nav__item").forEach((it) => it.addEventListener("click", () => {
    const f = frames.find((x) => x.el.dataset.navKey === it.dataset.key);
    if (!f) return;
    const y = f.sp.getBoundingClientRect().top + scrollY;
    lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" });
  }));
})();
