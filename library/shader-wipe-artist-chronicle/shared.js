// Spanning several sections: smooth scroll (Lenis 1.3.26, lerp .1) · entrance door · header bar menu · notification window · sound button · section boundary shader · text splitting · parallax
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => matchMedia("(max-width: 767px)").matches;
  // Original treats anything below 991px as a touch device — pushes the entrance door up to clear it, and raises the hero title line by line
  const touchLayout = () => matchMedia("(max-width: 991px)").matches;
  const root = document.documentElement;

  // ── Smooth scroll: driven by the GSAP ticker ──
  const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true, touchMultiplier: 2 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.dyLenis = lenis;

  // Same-page anchor: rolls with quart in-out, 1.2~2.6s depending on distance (adding 9000px/s)
  const quartInOut = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
  function scrollToTarget(el, immediate) {
    if (!el) return;
    const dist = Math.abs(el.getBoundingClientRect().top);
    const duration = Math.min(2.6, Math.max(1.2, 1.2 + dist / 9000));
    if (lenis) lenis.scrollTo(el, { immediate, force: true, duration, easing: quartInOut });
    else el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
  const nav = document.querySelector("[data-nav]");
  const setNav = (open) => nav && (nav.dataset.navStatus = open ? "active" : "not-active");
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href");
    if (href === "#") { if (!a.closest("[data-gate-enter]") && !a.hasAttribute("data-modal-open")) e.preventDefault(); return; }
    const target = href === "#top" ? document.body : document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const inMenu = !!a.closest('[data-nav-status="active"]');
    setNav(false);
    requestAnimationFrame(() => scrollToTarget(target, inMenu));
  }, true);

  // ── Header bar: the menu panel descends from the top via clip-path in 1s (.9,0,.1,1), and page scroll stops while it is open ──
  if (nav) {
    const tile = nav.querySelector(".dy-nav__tile");
    nav.querySelector("[data-nav-toggle]")?.addEventListener("click", () => setNav(nav.dataset.navStatus !== "active"));
    tile.addEventListener("transitionend", (e) => { if (e.target === tile && e.propertyName === "clip-path" && nav.dataset.navStatus !== "active") tile.style.visibility = "hidden"; });
    new MutationObserver(() => {
      const open = nav.dataset.navStatus === "active";
      if (open) { tile.style.visibility = "visible"; lenis?.stop(); } else { lenis?.start(); if (reduce) tile.style.visibility = "hidden"; }
    }).observe(nav, { attributes: true, attributeFilter: ["data-nav-status"] });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

    // Header text color: dark ink over cream sections, cream over blue and red panels
    const bar = nav.querySelector(".dy-nav__bar");
    const sections = [...document.querySelectorAll(".dy-section, .dy-fb")];
    const tone = () => {
      const y = bar.getBoundingClientRect().height / 2;
      const hit = sections.find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
      const cream = hit && hit.classList.contains("is-cream");
      if (cream) nav.dataset.theme = "cream"; else delete nav.dataset.theme;
    };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: tone, onRefresh: tone });
  }

  // ── Alert window: dialog opens and the content panel rises from below ──
  const openModal = (id) => {
    const d = document.querySelector(`dialog[data-modal-id="${id}"]`);
    if (!d || d.open) return;
    setNav(false);
    d.showModal();
    lenis?.stop();
    if (!reduce) {
      gsap.fromTo(d.querySelector(".dy-modal__backdrop"), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(d.querySelector(".dy-modal__content"), { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    }
  };
  const closeModal = (d) => {
    if (!d?.open) return;
    const done = () => { d.close(); lenis?.start(); };
    if (reduce) return done();
    gsap.to(d.querySelector(".dy-modal__content"), { yPercent: 12, opacity: 0, duration: 0.35, ease: "power2.in" });
    gsap.to(d.querySelector(".dy-modal__backdrop"), { opacity: 0, duration: 0.35, ease: "power2.in", onComplete: done });
  };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-modal-open]");
    if (o) { e.preventDefault(); openModal(o.dataset.modalOpen); return; }
    const c = e.target.closest("[data-modal-close]");
    if (c) closeModal(c.closest("dialog"));
  });
  document.querySelectorAll("dialog.dy-modal").forEach((d) => d.addEventListener("cancel", (e) => { e.preventDefault(); closeModal(d); }));

  // ── Sound button: turns on at entry (placeholder, so no sound) and toggles on each press ──
  const sound = document.querySelector("[data-sound]");
  // When turned on, it tries to play a looping audio and turns off again if playback is blocked or there is no source (original qu → play().catch → vm). Putting a source in data-sound-src turns it on.
  let audio = null;
  const setSound = (on) => { if (!sound) return; sound.dataset.soundState = on ? "on" : "off"; sound.setAttribute("aria-pressed", String(on)); };
  const soundOn = () => {
    if (!sound) return;
    setSound(true);
    const src = sound.dataset.soundSrc;
    if (!src) { setSound(false); return; }
    audio ??= Object.assign(new Audio(src), { loop: true, preload: "auto" });
    audio.play().catch(() => setSound(false));
  };
  const soundOff = () => { audio?.pause(); setSound(false); };
  sound?.addEventListener("click", () => (sound.dataset.soundState === "on" ? soundOff() : soundOn()));
  window.dySound = setSound;

  // ── Text splitting: lines and words rise from 100% below (original data-split) ──
  const splitEase = "power3.out";
  function splitIn(el) {
    const kind = (el.dataset.split || "lines").split(" ")[0];
    const type = kind === "words" ? "lines,words" : kind === "chars" ? "chars" : "lines";
    const mask = kind === "words" ? "words" : kind === "chars" ? "chars" : "lines";
    const s = SplitText.create(el, { type, mask, linesClass: "dy-line", wordsClass: "dy-word", charsClass: "dy-char", aria: "auto" });
    el.classList.add("is-split-ready");
    if (reduce) return;
    const targets = s[mask];
    gsap.set(targets, { yPercent: 100 });
    const perLine = kind === "words";
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => {
        if (perLine) {
          s.lines.forEach((line, i) => gsap.to(line.querySelectorAll(".dy-word"), { yPercent: 0, duration: 0.9, ease: splitEase, stagger: 0.02, delay: i * 0.08 }));
        } else gsap.to(targets, { yPercent: 0, duration: 1.1, ease: splitEase, stagger: kind === "chars" ? 0.04 : 0.1 });
      },
    });
  }
  window.dySplitIn = splitIn;

  // ── Parallax: original data-parallax (start · end % — with basis space, the ratio of empty room inside the cell), scrub, phone ×--speed-m ──
  const MQ = { ml: "(max-width: 767px)", tablet: "(max-width: 991px)" };
  function parallax(trigger) {
    const target = trigger.querySelector('[data-parallax="target"]') ?? trigger;
    const read = (k) => target.dataset[k] ?? trigger.dataset[k];
    const dis = read("parallaxDisable");
    if (dis && MQ[dis] && matchMedia(MQ[dis]).matches) return;
    const space = read("parallaxBasis") === "space" && target !== trigger;
    const mobile = phone() && read("parallaxStartMobile") === undefined ? parseFloat(trigger.style.getPropertyValue("--speed-m")) || 1 : 1;
    const pick = (k) => (phone() ? read(`${k}Mobile`) : undefined) ?? read(k);
    const startV = pick("parallaxStart");
    const endV = pick("parallaxEnd");
    const s = startV !== undefined ? parseFloat(startV) * (space ? 1 : mobile) : space ? 0 : 20;
    const e = endV !== undefined ? parseFloat(endV) * (space ? 1 : mobile) : space ? 100 : -20;
    const val = (v) => () => {
      if (!space) return (v / 100) * trigger.offsetHeight;
      const tb = trigger.getBoundingClientRect(), eb = target.getBoundingClientRect();
      const cur = Number(gsap.getProperty(target, "y")) || 0;
      const off = eb.top - cur - (tb.top + trigger.clientTop);
      return (v / 100) * (trigger.clientHeight - target.offsetHeight) - off;
    };
    gsap.fromTo(target, { y: val(s) }, { y: val(e), ease: "none", force3D: true, scrollTrigger: { trigger, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true, invalidateOnRefresh: true } });
  }

  // ── Fade in (data-fade): 1.2s power2.out, at 75% of screen ──
  function fade(el) {
    const d = el.dataset;
    gsap.set(el, { autoAlpha: 0 });
    gsap.to(el, { autoAlpha: 1, duration: d.fadeDuration ? parseFloat(d.fadeDuration) : 1.2, delay: d.fadeDelay ? parseFloat(d.fadeDelay) : 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse", invalidateOnRefresh: true } });
  }

  function boot() {
    document.querySelectorAll('[data-parallax="trigger"]').forEach((t) => {
      if (t.matches('[data-parallax="target"]')) return;
      parallax(t);
    });
    document.querySelectorAll("[data-fade]").forEach(fade);
    document.querySelectorAll("[data-split]").forEach(splitIn);
  }

  // ── Entrance Door ──
  const GATE = { fade: 0.5, ease: "power2.inOut", count: 0.5, max: 15000, enter: 0.2, wipe: 1, duration: 1.4 };
  const HERO = { images: { from: 8, extra: 0.3, ease: "power3.out" }, title: { at: 0.45, duration: 1.1, stagger: 0.04, ease: "power3.out" }, rest: { at: 0.7, duration: 0.8, stagger: 0.15 } };
  function heroIntro(tl, len, withImages) {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const title = hero.querySelector(".dy-hero__heading"), images = hero.querySelectorAll(".dy-hero__layer"), rest = hero.querySelectorAll(".dy-hero__date, .dy-hero__cta > *");
    if (withImages) tl.fromTo(images, { yPercent: HERO.images.from }, { yPercent: 0, duration: len + HERO.images.extra, ease: HERO.images.ease, clearProps: "transform" }, 0);
    tl.fromTo(rest, { opacity: 0 }, { opacity: 1, duration: HERO.rest.duration, stagger: HERO.rest.stagger, ease: "power2.out", clearProps: "opacity" }, HERO.rest.at * len);
    const kind = touchLayout() ? "lines" : "chars";
    const s = SplitText.create(title, { type: kind, mask: kind, linesClass: "dy-line", charsClass: "dy-char", aria: "auto" });
    tl.fromTo(s[kind], { yPercent: 100 }, { yPercent: 0, duration: HERO.title.duration, stagger: HERO.title.stagger, ease: HERO.title.ease }, HERO.title.at * len);
    tl.eventCallback("onComplete", () => s.revert());
  }

  // The door panel is drawn on a 2D canvas (background, mark, figure) and uploaded as a shader texture, then eaten upward from below with a cell foam
  function rasterGate(gate, w, h, dpr) {
    return new Promise((res) => {
      const c = document.createElement("canvas");
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const g = c.getContext("2d");
      g.scale(dpr, dpr);
      g.fillStyle = getComputedStyle(gate).backgroundColor;
      g.fillRect(0, 0, w, h);
      const parts = [...gate.querySelectorAll(".dy-gate__mark, .dy-gate__img > svg")];
      let left = parts.length;
      if (!left) return res(c);
      const defs = document.querySelector(".dy-defs").innerHTML;
      parts.forEach((svg) => {
        const r = svg.getBoundingClientRect();
        const clone = svg.cloneNode(true);
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clone.setAttribute("width", r.width); clone.setAttribute("height", r.height);
        clone.setAttribute("fill", getComputedStyle(svg).fill);
        const use = clone.querySelector("use");
        const sym = document.querySelector(use.getAttribute("href"));
        clone.setAttribute("viewBox", sym.getAttribute("viewBox"));
        clone.innerHTML = sym.innerHTML;
        const img = new Image();
        img.onload = () => { g.drawImage(img, r.left, r.top, r.width, r.height); if (--left === 0) res(c); };
        img.onerror = () => { if (--left === 0) res(c); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
        void defs;
      });
    });
  }

  function gate() {
    const el = document.querySelector("[data-gate]");
    if (!el) { boot(); return; }
    el.dataset.gateState = "loading";
    lenis?.stop();
    const wrap = el.querySelector("[data-gate-enter]"), btn = wrap.querySelector("a"), text = btn.querySelector(".dy-btn__text");
    const label = text.textContent.trim();
    const share = { v: 0 };
    const show = () => (text.textContent = `${Math.round(share.v)}%`);
    gsap.set(wrap, { autoAlpha: 0 });
    document.fonts.ready.then(() => {
      const ws = [label, "100%"].map((t) => ((text.textContent = t), text.getBoundingClientRect().width));
      text.style.minWidth = `${Math.ceil(Math.max(...ws))}px`;
      text.style.textAlign = "center";
      show();
      gsap.to(wrap, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    });
    let ready = false;
    // Door images are pre-baked while downloading (original Tm(t).ready) — baking after the click is ~370ms late, so the shader panel covers the screen late
    let shotP = null;
    const bake = () => (shotP ??= rasterGate(el, innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2)));
    const finish = () => { if (ready) return; ready = true; text.textContent = label; el.dataset.gateState = "ready"; if (!touchLayout() && !reduce) bake(); };
    const step = (v, cb) => gsap.to(share, { v, duration: reduce ? 0 : GATE.count, ease: "power1.out", overwrite: true, onUpdate: show, onComplete: cb });
    const jobs = [document.fonts.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))), new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))];
    let done = 0;
    const timer = setTimeout(() => step(100, finish), GATE.max);
    jobs.forEach((p) => p.then(() => { done++; if (done === jobs.length) { clearTimeout(timer); step(100, finish); } else step(Math.round((done / jobs.length) * 100)); }));

    let left = false;
    const leave = async (e) => {
      e?.preventDefault();
      if (!ready || left) return;
      left = true;
      document.removeEventListener("keydown", onKey);
      el.dataset.gateState = "leaving";
      soundOn();
      const end = () => { lenis?.start(); el.remove(); };
      heroVideo();
      if (reduce) { end(); boot(); return; }
      const tl = gsap.timeline();
      tl.to(wrap, { autoAlpha: 0, duration: GATE.enter, ease: "power1.out" }, 0);
      if (touchLayout()) {
        tl.to(el, { yPercent: -100, duration: GATE.wipe, ease: "power3.inOut" }, 0);
        tl.call(end, [], GATE.wipe);
        heroIntro(tl, GATE.wipe, true);
        boot();
        return;
      }
      // Desktop: upload the door image as a texture and dissolve it with the same shader (1.4s power2.inOut, boundary -1.2 → .3 screen)
      const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      const ctx = window.dySeam?.makeGL(canvas);
      if (!ctx) {
        tl.fromTo(el, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: GATE.wipe, ease: "power3.inOut" }, 0);
        tl.call(end, [], GATE.wipe);
        heroIntro(tl, GATE.wipe, true);
        boot();
        return;
      }
      const shot = await bake();
      window.dySeam.setPhoto(ctx, shot);
      // The shader panel is attached over the door when the button is almost gone (.19s) and the door element beneath is hidden — Chrome takes ~90ms to recompute the element under the pointer, so like the original the button’s hover response cuts off at ≈290ms
      tl.call(() => { el.appendChild(canvas); [...el.children].forEach((c) => { if (c !== canvas) c.style.visibility = "hidden"; }); el.style.background = "transparent"; }, [], GATE.enter - 0.01);
      const col = window.dySeam.bgOf(el.querySelector("[data-gate-enter]")?.parentElement || el);
      const prog = { s: 0 };
      const paint = () => window.dySeam.draw(ctx, {
        w, h, dpr, vh: h, seam: 0, lift: -1.2 + (0.3 + 1.2) * prog.s + -prog.s * 1.6, bulge: 0.12 * Math.sin(Math.PI * prog.s),
        colorNew: col, colorOld: col, bleed: [1e6, 1e6], boil: Math.floor(performance.now() / 1000 * 24) * 0.5, seed: 7, look: "dissolve", photoMix: 1,
      });
      tl.to(prog, { s: 1, duration: GATE.duration, ease: GATE.ease, onUpdate: paint }, 0);
      tl.call(end, [], GATE.duration);
      heroIntro(tl, GATE.duration, false);
      boot();
    };
    btn.addEventListener("click", leave);
    const onKey = (e) => { if (e.key === "Enter" || e.key === " ") leave(e); };
    document.addEventListener("keydown", onKey);
  }

  // Front-layer looping video: the hero one plays on entry, the footer one loads two screens ahead and plays, pausing when offscreen (original hero_video · footer_video)
  function loopVideo(v) {
    if (!v || reduce || !v.dataset.src || v.src) return;
    v.src = v.dataset.src;
    new IntersectionObserver(([en]) => (en.isIntersecting ? v.play().catch(() => {}) : v.pause())).observe(v);
  }
  function heroVideo() {
    loopVideo(document.querySelector('[data-loop-video="hero"]'));
    const foot = document.querySelector('[data-loop-video="footer"]');
    if (foot) { const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); loopVideo(foot); } }, { rootMargin: "200% 0px" }); io.observe(foot); }
  }

  window.dyBoot = boot;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", gate, { once: true });
  else gate();
})();
