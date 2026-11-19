// Common to all pages: draws the nav, phone menu, marquee and lime footer, and hooks up smooth scroll, nav hide, logo hover (Lottie), cursor pill·
// Hooks up line reveal, marquee, footer wordmark, thumbs-up hand (Lottie), in-place video playback and page turning.
// Original values: Lenis lerp .1 wheel .5 · Curve cubic-bezier(.625,.05,0,1) · cursor follow .4s power3, pill .85 → 1 over .7s back.out(2) ·
// Row entrance .7s power3.out stagger .12 · slide .7s power1.inOut · marquee speed 15 (sec per screen width) · scroll bump 10vw ·
// Logo hover swaps the reflection over .3s then replays from the start · thumb hand 0→.35 repeating at 1.53s / on hover .35→1 at 2.84s · video plays 10% before the top and bottom of the viewport.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const coarse = matchMedia("(pointer: coarse)").matches;
  const MN = (window.MN = { lenis: null });
  const mm = (MN.mm = gsap.matchMedia());
  const MOTION = "(prefers-reduced-motion: no-preference)";
  const REDUCE = "(prefers-reduced-motion: reduce)";

  const L = window.MN_LOTTIE;
  // Logo letters — rounded single-line letters drawn on the same 985×360 board, position and weight (100 × 42%) as the Lottie variation
  const logoSvg = () => `<svg class="mn-logo__svg" viewBox="0 0 985 360" fill="none" stroke="currentColor" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${L.WORD.map((ch, i) => `<g transform="translate(${L.HOME[i].toFixed(1)} ${L.BASE_Y}) scale(${L.SCALE / 100})"><path class="mn-logo__l" d="${L.glyphD(ch)}"/></g>`).join("")}</svg>`;
  // Footer wordmark — the same text fills the original 1920×414 panel
  const markSvg = () => `<svg class="mn-footer__svg" viewBox="0 0 1920 414" fill="none" stroke="currentColor" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${L.WORD.map((ch, i) => `<g transform="translate(${((L.HOME[i] - L.HOME[0]) / (L.SCALE / 100) + L.HALF.B).toFixed(1)} 207)"><path class="mn-footer__l" d="${L.glyphD(ch)}"/></g>`).join("")}</svg>`;
  const LOGO_VARIANTS = ["diff", "squish", "letters", "bump", "scroll"];
  const chars = (text) => [...text].map((c, i) => `<span style="transition-delay:${(i * 0.01).toFixed(2)}s${c === " " ? ";white-space:pre" : ""}">${c}</span>`).join("");
  const cur = (p) => (p === page ? ' aria-current="page"' : "");

  // ── Header ──
  const head = document.querySelector('[data-slot="nav"]');
  if (head) {
    head.className = "mn-nav";
    const desk = [["works.html", "Work", "works"], ["about.html", "About", "about"], ["#contact", "Inquiry", ""]];
    const mob = [desk[1], desk[0], desk[2]];
    head.innerHTML = `
      <div class="mn-nav__bar mn-wrap">
        <div class="mn-logo" data-logo-trigger>
          <a class="mn-logo__holder" href="index.html" aria-label="Home">${logoSvg()}</a>
          <div class="mn-logo__hover" aria-hidden="true">${LOGO_VARIANTS.map((v) => `<div class="mn-logo__anim" data-logo-variant="${v}"></div>`).join("")}</div>
        </div>
        <nav class="mn-nav__links" aria-label="Main menu"><ul>
          ${desk.map(([h, t, p]) => `<li><a class="mn-roll" href="${h}"${cur(p)}><span class="mn-roll__bg"></span><span class="mn-roll__mask"><span class="mn-roll__text">${chars(t)}</span></span></a></li>`).join("")}
        </ul></nav>
        <button class="mn-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="mn-menu" data-slot="mobile-menu"><nav class="mn-menu__links">
        ${mob.map(([h, t, p]) => `<a class="mn-menu__link" href="${h}"${cur(p)}>${t}</a>`).join("")}
      </nav></div><div class="mn-menu__backdrop"></div>`
    );
  }

  // ── Footer: edge marquee + lime-green footer ──
  const arrow = '<svg class="mn-marquee__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 12h15M13 5.5 19.5 12 13 18.5"/></svg>';
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "mn-foot";
    foot.innerHTML = `
      <div data-slot="boundary-marquee">
        <div class="mn-sp-large"></div>
        <div class="mn-wrap"><div class="mn-break"></div></div>
        <div class="mn-sp-margin"></div>
        <div class="mn-marquee" data-marquee data-marquee-speed="15" data-marquee-direction="left" data-marquee-duplicate="2" data-marquee-scroll-speed="10">
          <div class="mn-marquee__scroll" data-marquee-scroll>
            <div class="mn-marquee__collection" data-marquee-collection>
              <div class="mn-marquee__item">${arrow}<p class="mn-marquee__p" data-label="Your studio’s English slogan here in two beats (uppercase)">STUDIO SLOGAN GOES HERE. A SECOND ONE TOO.</p></div>
            </div>
          </div>
        </div>
        <div class="mn-sp-margin"></div>
      </div>
      <footer class="mn-footer" id="contact" data-slot="footer-cta">
        <div class="mn-sp-small"></div>
        <div class="mn-footer__in">
          <div class="mn-footer__top">
            <div class="mn-footer__cta">
              <h2 class="t-h2" data-reveal="lines" data-label="One English line inviting conversation here">Got a project in mind?</h2>
              <a class="mn-btn" href="#" data-hand-trigger data-cursor="">Get started</a>
            </div>
            <div class="mn-footer__icon"><div class="mn-footer__thumb" data-thumb data-hand-trigger aria-hidden="true"></div></div>
          </div>
          <div class="mn-footer__bottom">
            <div class="mn-sp-small"></div>
            <div class="mn-break is-dark"></div>
            <nav class="mn-footer__nav t-small" aria-label="External Link"><ul><li><a href="#">Link 1</a></li><li><a href="#">Link 2</a></li><li><a href="#">Link 3</a></li></ul></nav>
            <div class="mn-footer__mark" role="img" aria-label="Wordmark">${markSvg()}</div>
          </div>
        </div>
        <div class="mn-sp-margin"></div>
      </footer>`;
  }

  // ── Page turn curtain ──
  document.body.insertAdjacentHTML("beforeend", '<div class="mn-curtain" aria-hidden="true"><div class="mn-curtain__panel"></div></div>');
  const curtain = document.querySelector(".mn-curtain");
  const pageWrap = document.querySelector(".mn-page");

  // ── Smooth scroll ──
  mm.add(MOTION, () => {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.5, gestureOrientation: "vertical" });
    MN.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); MN.lenis = null; };
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute("href") === "#") return e.preventDefault();
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    MN.lenis ? MN.lenis.scrollTo(target) : target.scrollIntoView();
  });

  // ── Nav: hides on scroll down, returns on scroll up ──
  const nav = document.querySelector(".mn-nav");
  if (nav) {
    let last;
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (last === self.direction) return;
        last = self.direction;
        nav.classList.toggle("is-hidden", self.direction === 1);
      },
    });
  }

  // ── Phone menu ──
  const menu = document.querySelector(".mn-menu");
  const burger = document.querySelector(".mn-burger");
  let menuSplit;
  function openMenu() {
    nav.classList.add("is-open");
    menu.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    MN.lenis && MN.lenis.stop();
    if (matchMedia(REDUCE).matches) return;
    const links = menu.querySelectorAll(".mn-menu__link");
    menuSplit = menuSplit || SplitText.create(links, { type: "lines", mask: "lines" });
    gsap.fromTo(menuSplit.lines, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out", stagger: { amount: 0.2 } });
    gsap.fromTo(".mn-menu__links", { y: "4rem", opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    MN.lenis && MN.lenis.start();
  }
  burger && burger.addEventListener("click", () => (menu.classList.contains("is-open") ? closeMenu() : openMenu()));

  // ── Logo hover: like the original, five Lottie layers are stacked, on each hover one is picked at random excluding the previous one, cross-faded in .3s, then played from the start.
  //    On load, all five are set to their end frames (the original IX3 goes 0→1 in 1ms). Touch devices don’t attach it at all, like the original ──
  const logo = document.querySelector("[data-logo-trigger]");
  const touch = navigator.maxTouchPoints > 0 || coarse;
  if (logo && window.lottie && !touch) {
    const ink = L.inkOf(logo);
    const main = logo.querySelector(".mn-logo__svg");
    const variants = {};
    logo.querySelectorAll("[data-logo-variant]").forEach((el) => {
      const name = el.dataset.logoVariant;
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: L.LOGO[name](ink) });
      anim.goToAndStop(anim.totalFrames - 1, true);
      variants[name] = { el, anim };
    });
    let active = null;
    logo.addEventListener("mouseenter", () => {
      if (matchMedia(REDUCE).matches) return;
      const pool = Object.keys(variants).filter((v) => v !== active);
      const name = pool[Math.floor(Math.random() * pool.length)];
      const v = variants[name];
      gsap.to(active ? variants[active].el : main, { opacity: 0, duration: 0.3 });
      active = name;
      gsap.to(v.el, { opacity: 1, duration: 0.3, onComplete: () => { v.anim.goToAndStop(0, true); v.anim.play(); } });
    });
  }

  // First entrance: logo letters and menu letters (on Home, index.js hooks them separately along with the hero sentence)
  mm.add(MOTION, () => {
    if (page === "home") return;
    gsap.from([...document.querySelectorAll(".mn-logo__l"), ...document.querySelectorAll(".mn-roll__text")], { opacity: 0, yPercent: 22, duration: 1.05, ease: "power2.out", stagger: 0.2, delay: 0.2 });
  });

  // ── Cursor Pill ──
  if (!coarse) {
    document.body.insertAdjacentHTML("beforeend", '<div class="mn-cursor" aria-hidden="true"><div class="mn-cursor__card"><span class="mn-cursor__text"></span></div></div>');
    root.classList.add("has-cursor");
    const cursor = document.querySelector(".mn-cursor");
    const text = cursor.querySelector(".mn-cursor__text");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });
    let lx = 0, ly = 0, active = null;
    const check = () => {
      const el = document.elementFromPoint(lx, ly);
      // As in the original, places with no text (footer ”Get started”) also expand the pill — an empty pill
      const hit = el && el.closest("[data-cursor]");
      if (hit === active) return;
      if (active) cursor.dataset.status = "not-active";
      active = null;
      if (hit) {
        gsap.fromTo(cursor, { scale: 0.85 }, { scale: 1, duration: 0.7, ease: "back.out(2)" });
        text.textContent = hit.dataset.cursor;
        cursor.dataset.status = "active";
        active = hit;
      }
    };
    addEventListener("pointermove", (e) => { lx = e.clientX; ly = e.clientY; xTo(lx); yTo(ly); check(); }, { passive: true });
    addEventListener("scroll", () => { xTo(lx); yTo(ly); check(); }, { passive: true });
    setTimeout(() => { if (!cursor.dataset.status) cursor.dataset.status = "not-active"; }, 500);
  }

  // ── Scroll-direction marquee ──
  MN.marquee = (el) => {
    const content = el.querySelector("[data-marquee-collection]");
    const scroller = el.querySelector("[data-marquee-scroll]");
    const dir = el.dataset.marqueeDirection === "right" ? 1 : -1;
    const ss = parseFloat(el.dataset.marqueeScrollSpeed);
    const mult = innerWidth < 479 ? 0.25 : innerWidth < 991 ? 0.5 : 1;
    const dur = parseFloat(el.dataset.marqueeSpeed) * (content.offsetWidth / innerWidth) * mult;
    scroller.style.marginLeft = `${-ss}%`;
    scroller.style.width = `${ss * 2 + 100}%`;
    for (let i = 0; i < parseInt(el.dataset.marqueeDuplicate || 0, 10); i++) scroller.appendChild(content.cloneNode(true));
    const items = el.querySelectorAll("[data-marquee-collection]");
    el.dataset.marqueeStatus = "normal";
    if (matchMedia(REDUCE).matches) return;
    const anim = gsap.to(items, { xPercent: -100, repeat: -1, duration: dur, ease: "none" }).totalProgress(0.5);
    gsap.set(items, { xPercent: dir === 1 ? 100 : -100 });
    anim.timeScale(dir).play();
    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const inv = self.direction === 1;
        anim.timeScale(inv ? -dir : dir);
        el.dataset.marqueeStatus = inv ? "normal" : "inverted";
      },
    });
    const from = dir === -1 ? ss : -ss;
    gsap.fromTo(scroller, { x: `${from}vw` }, { x: `${-from}vw`, ease: "none", scrollTrigger: { trigger: el, start: "0% 100%", end: "100% 0%", scrub: 0 } });
  };

  // ── Thumbs-up hand (Lottie 8fps 35 frames): when on screen it loops 0→.35 (blinking) in 1.53s, on hovering the hand or the Get started button it plays .35→1 (changing) in 2.84s once and then loops again ──
  const thumb = document.querySelector("[data-thumb]");
  if (thumb && window.lottie) {
    const anim = lottie.loadAnimation({ container: thumb, renderer: "svg", loop: false, autoplay: false, animationData: L.THUMB(L.inkOf(thumb)) });
    const head = { p: 0 };
    const show = () => anim.goToAndStop(head.p * anim.totalFrames, true);
    show();
    mm.add(MOTION, () => {
      const loop = gsap.fromTo(head, { p: 0 }, { p: 0.35, duration: 1.53, ease: "none", repeat: -1, paused: true, onUpdate: show });
      const st = ScrollTrigger.create({ trigger: thumb, start: "top bottom", once: true, onEnter: () => loop.play() });
      let big;
      const play = () => {
        loop.pause();
        big && big.kill();
        big = gsap.fromTo(head, { p: 0.35 }, { p: 1, duration: 2.84, ease: "none", onUpdate: show, onComplete: () => loop.restart() });
      };
      const triggers = document.querySelectorAll("[data-hand-trigger]");
      triggers.forEach((t) => t.addEventListener("mouseenter", play));
      return () => { triggers.forEach((t) => t.removeEventListener("mouseenter", play)); st.kill(); head.p = 0; show(); };
    });
  }

  // ── Video slot (original data-media-init autoplay): when visible within 10% above and below, the source is inserted and plays, pauses when out of view or the tab is hidden.
  //    When in play/pause state the slot image clears in .2s ──
  const medias = document.querySelectorAll("[data-media-init]");
  if (medias.length) {
    const still = matchMedia(REDUCE).matches;
    const list = [...medias].map((box) => ({ box, video: box.querySelector("video"), inView: false, loaded: false }));
    const setStatus = (m, v) => (m.box.dataset.mediaStatus = v);
    const play = (m) => {
      if (!m.inView || document.hidden || still) return;
      if (!m.loaded) { m.video.muted = true; m.video.src = m.video.dataset.mediaSrc; m.video.load(); m.loaded = true; }
      setStatus(m, m.video.readyState < 3 ? "loading" : "playing");
      m.video.play().then(() => m.inView && setStatus(m, "playing")).catch(() => {});
    };
    const pause = (m) => { if (!m.loaded) return; m.video.pause(); setStatus(m, "paused"); };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const m = list.find((x) => x.box === e.target);
      m.inView = e.isIntersecting;
      m.inView ? play(m) : pause(m);
    }), { rootMargin: "10% 0px 10% 0px", threshold: 0 });
    list.forEach((m) => { setStatus(m, "not-active"); io.observe(m.box); m.video.addEventListener("waiting", () => m.inView && setStatus(m, "loading")); m.video.addEventListener("playing", () => m.inView && setStatus(m, "playing")); });
    document.addEventListener("visibilitychange", () => list.forEach((m) => (document.hidden ? pause(m) : play(m))));
  }

  // ── Entrance ──
  const lineReveal = (el, scroll) => {
    const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "mn-line", onSplit: (self) => self.masks && self.masks.forEach((m) => m.classList.add("mn-line-mask")) });
    gsap.set(el, { visibility: "visible" });
    gsap.fromTo(split.lines, { yPercent: 100, clipPath: "inset(-10% -10% 120% -10%)" }, {
      yPercent: 0, clipPath: "inset(-10% -10% -10% -10%)", duration: 0.7, ease: "power3.out", stagger: 0.12,
      ...(scroll ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } } : { delay: 0.15 }),
    });
  };

  const reveal = () => {
    document.querySelectorAll("[data-marquee]").forEach(MN.marquee);
    mm.add(MOTION, () => {
      document.querySelectorAll('[data-reveal="load"]').forEach((el) => lineReveal(el, false));
      document.querySelectorAll('[data-reveal="lines"]').forEach((el) => lineReveal(el, true));
      document.querySelectorAll('[data-reveal="stagger"]').forEach((el) => {
        const split = SplitText.create(el.children, { type: "lines", mask: "lines" });
        gsap.set(el, { visibility: "visible" });
        gsap.from(split.lines, { opacity: 0, y: 100, duration: 0.7, ease: "power3.out", stagger: 0.18, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      document.querySelectorAll('[data-reveal="fade-bottom"]').forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 2, ease: "expo.out", delay: 0.3 });
      });
      document.querySelectorAll('[data-reveal="card"]').forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      const mark = document.querySelectorAll(".mn-footer__l");
      gsap.fromTo(mark, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.75, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".mn-footer__mark", start: "top bottom", once: true } });
    });
    ScrollTrigger.refresh();
  };
  document.fonts.ready.then(reveal);

  // ── Page Turn ──
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link || e.defaultPrevented) return;
    const url = link.href;
    if (!url || link.hostname !== location.hostname || link.getAttribute("href").startsWith("#") || url.includes("#") || link.target === "_blank") return;
    e.preventDefault();
    if (matchMedia(REDUCE).matches) { location.href = url; return; }
    gsap.timeline({ defaults: { duration: 0.7, ease: "power1.inOut" }, onComplete: () => (location.href = url) })
      .set(curtain, { display: "flex", opacity: 1 })
      .fromTo(".mn-curtain__panel", { yPercent: 100 }, { yPercent: 0 })
      .fromTo(pageWrap, { y: "0vh", opacity: 1 }, { y: "-50vh", opacity: 0 }, "<");
  });
  addEventListener("pageshow", (e) => e.persisted && location.reload());
  if (!root.classList.contains("is-first-visit")) {
    gsap.timeline().set(curtain, { display: "flex" }).fromTo(curtain, { opacity: 1 }, { opacity: 0, delay: 0.2 }).set(curtain, { display: "none" });
  }
})();
