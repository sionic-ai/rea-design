// Shared by every page — the same-named functions from the original base.js (initBarba·firstLoadAnimation·textEffect·glitchTextOnce·barcode*·magneticButtons·initMarquee·initImgScrollEffect·initFooterStripe) were rewritten with the numbers kept as they are.
// Page transitions use ES.page("<namespace>", init). Attach it that way. The function init returns is called on transition.
(() => {
  const ES = (window.ES = window.ES || {});
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  history.scrollRestoration = "manual";
  ES.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  ES.touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  ES.pages = {};
  ES.page = (ns, fn) => (ES.pages[ns] = fn);
  const cleanups = [];
  ES.onLeave = (fn) => cleanups.push(fn);
  ES.splits = [];

  // ---------- Lenis (original: duration 1.1, curve min(1, 1.001 − 2^(−10t))) ----------
  // lenis 1.0.10 UMD global name is lowercase (lenis)
  const LenisClass = window.Lenis || window.lenis;
  if (typeof LenisClass === "function" && !ES.reduce) {
    ES.lenis = new LenisClass({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    ES.lenis.on("scroll", () => { ScrollTrigger.update(); headerColor(); });
    gsap.ticker.add((t) => ES.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else addEventListener("scroll", () => headerColor(), { passive: true });

  // ---------- Header — text turns white over blue·dark sections ----------
  const head = document.querySelector(".es-head");
  function headerColor(c) {
    if (!head) return;
    const scope = c || document.querySelector('[data-barba="container"]:last-of-type') || document;
    const y = head.getBoundingClientRect().height / 2;
    let inv = false;
    scope.querySelectorAll("section, [data-color-detect]").forEach((s) => {
      const r = s.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom && (s.classList.contains("is-blue") || s.classList.contains("is-dark"))) inv = true;
    });
    head.classList.toggle("invert", inv);
  }
  ES.headerColor = headerColor;

  // ---------- Menu — the blue panel opens from above and the dividers extend .15 + .06×n s later ----------
  const nav = document.querySelector(".es-nav");
  const toggle = document.querySelector(".es-toggle");
  nav?.querySelectorAll(".es-nav__sep").forEach((s, i) => (s.style.transitionDelay = `${0.15 + 0.06 * i}s`));
  const setNav = (open) => {
    nav.classList.toggle("show", open);
    head.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    open ? ES.lenis?.stop() : ES.lenis?.start();
  };
  toggle?.addEventListener("click", () => setNav(!nav.classList.contains("show")));
  nav?.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => nav.classList.contains("show") && setNav(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && nav?.classList.contains("show") && setNav(false));

  // ---------- Text scramble — over 600ms, every 40ms each not-yet-matching letter is swapped for another letter of the same text ----------
  ES.glitchOnce = (el, dur = 600, step = 40) => {
    if (el.dataset.glitching === "true") return;
    el.dataset.glitching = "true";
    const text = el.dataset.text, chars = text.split(""), pool = [...new Set(text.replace(/\s/g, "").split(""))];
    const out = [...chars], n = Math.floor(dur / step);
    let k = 0;
    const id = setInterval(() => {
      for (let i = 0; i < chars.length; i++) if (chars[i] !== " ") out[i] = Math.random() < k / n ? chars[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out.join("");
      if (++k >= n) { clearInterval(id); el.textContent = text; el.dataset.glitching = "false"; }
    }, step);
  };
  function glitchLinks(scope) {
    scope.querySelectorAll(".glitch, .es-nav__social a, .es-foot__links a").forEach((el) => {
      if (el.dataset.glitchInit) return;
      el.dataset.glitchInit = "1";
      const r = el.getBoundingClientRect();
      if (r.width) { el.style.minWidth = `${r.width}px`; el.style.maxWidth = `${r.width}px`; }
      el.dataset.text ||= el.textContent.trim();
      el.addEventListener("mouseenter", () => ES.glitchOnce(el));
    });
  }

  // ---------- Section choreography ----------
  function textEffects(c, nav) {
    c.querySelectorAll(".fx-lines").forEach((box) => {
      box.querySelectorAll("h2, h3, h4, h5, p").forEach((t) => {
        if (t.closest(".fx-lines") !== box || t.dataset.split) return;
        t.dataset.split = "1";
        const s = SplitText.create(t, { type: "lines", linesClass: "line" });
        ES.splits.push(s);
        s.lines.forEach((l) => { const w = document.createElement("div"); w.className = "line-wrap"; l.before(w); w.append(l); });
        if (ES.reduce) return;
        gsap.set(s.lines, { yPercent: 240, scaleY: 2 });
        ScrollTrigger.create({ trigger: box, start: "top 80%", once: true, onEnter: () => gsap.to(s.lines, { yPercent: 0, scaleY: 1, duration: 1, ease: "power3.out", stagger: 0.12 }) });
      });
    });
    c.querySelectorAll(".fx-glitch").forEach((box) => {
      const els = box.querySelectorAll("h5, .glitch-on-enter");
      els.forEach((e) => (e.dataset.text ||= e.textContent.trim()));
      if (!ES.reduce) ScrollTrigger.create({ trigger: box, start: "top 80%", once: true, onEnter: () => els.forEach((e) => ES.glitchOnce(e)) });
    });
    c.querySelectorAll("hr.sep").forEach((hr) => {
      if (ES.reduce) return gsap.set(hr, { scaleX: 1 });
      gsap.to(hr, { scaleX: 1, duration: 1.5, ease: "power3.out", scrollTrigger: { trigger: hr, start: "top 80%" } });
    });
    // Big heading — words rise from 220% below at 2x vertical stretch, 1s power3.out, .15 stagger, 1s late
    c.querySelectorAll(".es-hero-title").forEach((h) => {
      const s = SplitText.create(h, { type: "lines,words", linesClass: "line", wordsClass: "word" });
      ES.splits.push(s);
      // The large heading of the incoming page is already standing when the cover lifts, like the original
      if (ES.reduce || nav) return gsap.set(s.words, { yPercent: 0, scaleY: 1, opacity: 1 });
      gsap.set(s.words, { yPercent: 220, scaleY: 2, transformOrigin: "bottom" });
      gsap.to(s.words, { yPercent: 0, scaleY: 1, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.15, delay: 1 });
    });
    // Barcode bars between value sentences — width 0 over .8s (.5 delay, .15 gap)
    c.querySelectorAll(".es-values__item").forEach((it) => {
      const bars = it.querySelectorAll(".value-bar");
      if (!bars.length || ES.reduce) return;
      gsap.set(bars, { width: 0 });
      ScrollTrigger.create({ trigger: it, start: "top 80%", once: true, onEnter: () => gsap.to(bars, { width: (i, b) => getComputedStyle(b).getPropertyValue("--bar-width"), duration: 0.8, delay: 0.5, ease: "power3.out", stagger: 0.15 }) });
    });
  }

  // The photo opens from the center vertical line to both sides over 1.5s expo.inOut, and the image inside shrinks from 1.5 to 1 tied to scroll.
  function imgEffect(c) {
    c.querySelectorAll(".img-effect").forEach((box) => {
      const img = box.querySelector(".img-effect__img") || box.firstElementChild;
      if (ES.reduce) return;
      gsap.set(box, { clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)" });
      gsap.to(box, { clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: box, start: "top 85%", once: true } });
      if (img) { gsap.set(img, { scale: 1.5 }); gsap.to(img, { scale: 1, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } }); }
    });
  }

  // ---------- Three barcode bars ----------
  function stripeAt(wrap, r, live, x, y, rowH, min, max, life) {
    const w = Math.random() * (max - min) + min, row = Math.floor(y / rowH), top = row * rowH;
    if (top + rowH > r.height) return;
    const left = x - w / 2;
    if (live.some((s) => s.row === row && !(s.x + s.w < left || s.x > left + w))) return;
    const d = document.createElement("div");
    d.className = "barcode-rect";
    Object.assign(d.style, { width: `${w}px`, height: `${rowH}px`, transform: `translate(${left}px, ${top}px)` });
    wrap.append(d);
    const s = { x: left, w, row };
    live.push(s);
    setTimeout(() => { d.remove(); live.splice(live.indexOf(s), 1); }, life);
  }
  const wrapOf = (el, cls) => {
    let w = el.querySelector(`:scope > .${cls}`);
    if (!w) { w = document.createElement("div"); w.className = cls; el.append(w); }
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    return w;
  };
  // Follow the hand: three line heights, width 5~100px, 2 seconds, one every 25ms — on touch a wandering point draws every 120ms
  function barcodeHover(c) {
    c.querySelectorAll(".barcode").forEach((el) => {
      const wrap = wrapOf(el, "barcode-wrapper"), live = [];
      if (ES.touch) {
        const p = { x: Math.random() * 100, y: Math.random() * 100, a: Math.random() * Math.PI * 2 };
        const id = setInterval(() => {
          const r = el.getBoundingClientRect();
          if (!r.width || r.top > innerHeight || r.bottom < 0) return;
          p.a += 1.2 * (Math.random() - 0.5); p.x += 5 * Math.cos(p.a); p.y += 5 * Math.sin(p.a);
          if (p.x < 5 || p.x > 95) p.a = Math.PI - p.a;
          if (p.y < 5 || p.y > 95) p.a = -p.a;
          stripeAt(wrap, r, live, (p.x / 100) * r.width, (p.y / 100) * r.height, r.height / 3, 5, 100, 2000);
        }, 120);
        ES.onLeave(() => clearInterval(id));
        return;
      }
      let last = 0;
      el.addEventListener("mousemove", (e) => {
        const now = performance.now();
        if (now - last < 25) return;
        last = now;
        const r = el.getBoundingClientRect();
        stripeAt(wrap, r, live, e.clientX - r.left, e.clientY - r.top, r.height / 3, 5, 100, 2000);
      });
    });
  }
  // Auto: two lines tall, every 150ms a bar 10~150px wide lights up and goes out 2 seconds later
  function barcodeAuto(c) {
    c.querySelectorAll(".barcode-auto").forEach((el) => {
      const wrap = wrapOf(el, "barcode-wrapper"), live = [];
      el.style.overflow = "hidden";
      if (ES.reduce) return;
      const id = setInterval(() => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.top > innerHeight || r.bottom < 0) return;
        const h = r.height / 2, row = Math.floor(Math.random() * 2), w = Math.random() * 140 + 10, x = Math.random() * r.width - w / 2;
        if (live.some((s) => s.row === row && !(s.x + s.w < x || s.x > x + w))) return;
        const d = document.createElement("div");
        d.className = "barcode-rect-auto";
        Object.assign(d.style, { width: `${w}px`, height: `${h}px`, transform: `translate(${x}px, ${row * h}px)`, opacity: 0 });
        wrap.append(d);
        const s = { x, w, row };
        live.push(s);
        requestAnimationFrame(() => (d.style.opacity = "1"));
        setTimeout(() => { d.style.opacity = "0"; setTimeout(() => { d.remove(); live.splice(live.indexOf(s), 1); }, 500); }, 2000);
      }, 150);
      ES.onLeave(() => clearInterval(id));
    });
  }
  // Large: every 400ms a vertical bar 20~100px wide lights up to the full board height, and turns off in .6s after 4 seconds (no more than four on when overlapping)
  function barcodeBig(c) {
    c.querySelectorAll(".barcode-big-on").forEach((el) => {
      const wrap = wrapOf(el, "barcode-big-wrapper");
      el.style.overflow = "hidden";
      if (ES.reduce) return;
      let live = [];
      const id = setInterval(() => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.top > innerHeight || r.bottom < 0) return;
        const w = Math.random() * 80 + 20, x = Math.random() * (r.width - w);
        if (live.some((s) => !(x + w < s.x || x > s.x + s.w)) && live.length >= 4) return;
        const d = document.createElement("div");
        d.className = "barcode-big";
        Object.assign(d.style, { width: `${w}px`, height: "100%", transform: `translateX(${x}px)`, opacity: 0, transition: "opacity .6s" });
        wrap.append(d);
        const s = { x, w };
        live.push(s);
        requestAnimationFrame(() => (d.style.opacity = "1"));
        setTimeout(() => { d.style.opacity = "0"; setTimeout(() => { d.remove(); live = live.filter((v) => v !== s); }, 600); }, 4000);
      }, 400);
      ES.onLeave(() => clearInterval(id));
    });
  }

  // ---------- Magnetic button — within the button width, cursor distance × .6 × (1 − distance/width), .3 per frame, ±40px ----------
  function magnetic(c) {
    if (ES.touch || ES.reduce) return;
    c.querySelectorAll(".es-btn").forEach((b) => {
      let tx = 0, ty = 0, x = 0, y = 0, on = false, r = b.getBoundingClientRect(), raf = 0;
      const measure = () => (r = b.getBoundingClientRect());
      b.addEventListener("mouseenter", () => { measure(); on = true; });
      b.addEventListener("mousemove", (e) => {
        if (!on) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const k = 1 - Math.min(Math.hypot(dx, dy) / r.width, 1);
        tx = 0.6 * dx * k; ty = 0.6 * dy * k;
      });
      b.addEventListener("mouseleave", () => { on = false; tx = ty = 0; });
      const tick = () => {
        x += 0.3 * (tx - x); y += 0.3 * (ty - y);
        b.style.transform = `translate3d(${gsap.utils.clamp(-40, 40, x).toFixed(2)}px, ${gsap.utils.clamp(-40, 40, y).toFixed(2)}px, 0)`;
        raf = requestAnimationFrame(tick);
      };
      tick();
      ES.onLeave(() => cancelAnimationFrame(raf));
    });
  }

  // ---------- Flowing band — runs on its own (2px per frame, reverses with scroll direction) · tied to scroll (±250px, scrub 1.2) ----------
  function marquees(c) {
    c.querySelectorAll(".es-marquee").forEach((m, idx) => {
      const inner = m.querySelector(".es-marquee__inner");
      if (!inner || m.dataset.init) return;
      m.dataset.init = "1";
      inner.innerHTML += inner.innerHTML;
      const half = inner.scrollWidth / 2, alt = m.classList.contains("is-alt");
      if (ES.reduce) return;
      if (m.classList.contains("is-scroll")) {
        const a = 250, off = 500 * idx;
        const [from, to] = alt ? [-a - off, -off] : [-off, -a - off];
        gsap.set(inner, { x: from });
        gsap.to(inner, { x: to, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: 1.2 } });
        return;
      }
      let dir = alt ? -1 : 1, x = 0;
      const tick = () => { x += 2 * dir; if (x <= -half) x += half; if (x >= 0) x -= half; gsap.set(inner, { x: Math.round(x) }); };
      gsap.ticker.add(tick);
      const onScroll = (e) => { const down = e.direction === 1; dir = alt ? (down ? 1 : -1) : down ? -1 : 1; };
      ES.lenis?.on("scroll", onScroll);
      ES.onLeave(() => { gsap.ticker.remove(tick); ES.lenis?.off?.("scroll", onScroll); });
    });
  }

  // ---------- Footer wordmark — band stretch up to .7 + the panel scales 2.5× vertically from its bottom (top 80% → bottom 90%) ----------
  function footerStripe(c) {
    const wrapEl = c.querySelector(".es-foot__canvas");
    if (!wrapEl || !ES.stripe) return;
    const src = document.createElement("canvas");
    src.width = 2400; src.height = 520;
    const draw = () => ES.drawWordmark(src, wrapEl.dataset.word || "Your Sales Line");
    draw();
    document.fonts?.ready.then(draw);
    const fx = ES.stripe({ canvas: wrapEl.querySelector("canvas"), source: src, fit: "contain", animate: () => {} });
    if (!fx) return;
    ES.onLeave(() => fx.destroy());
    if (ES.reduce) { fx.uniforms.uZoneEnd.value = 0.7; gsap.set(wrapEl, { scaleY: 2.5 }); return; }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      gsap.to(fx.uniforms.uZoneEnd, { value: 0.7, ease: "none", scrollTrigger: { trigger: wrapEl, start: "top 80%", end: "bottom 90%", scrub: true } });
      gsap.fromTo(wrapEl, { scaleY: 1 }, { scaleY: 2.5, transformOrigin: "bottom center", ease: "none", scrollTrigger: { trigger: wrapEl, start: "top 80%", end: "bottom 90%", scrub: true } });
    });
    mm.add("(max-width: 991px)", () => {
      gsap.timeline({ scrollTrigger: { trigger: wrapEl, start: "top 80%", once: true } })
        .to(fx.uniforms.uZoneEnd, { value: 0.7, duration: 1.5, ease: "power2.out" })
        .fromTo(wrapEl, { scaleY: 1 }, { scaleY: 2.5, transformOrigin: "bottom center", duration: 1.5, ease: "power2.out" }, 0);
    });
    ES.onLeave(() => mm.revert());
  }

  // ---------- Page on and off ----------
  let pageOff = null;
  function enter(c, nav) {
    textEffects(c, nav);
    imgEffect(c);
    barcodeHover(c);
    barcodeAuto(c);
    barcodeBig(c);
    magnetic(c);
    marquees(c);
    glitchLinks(document);
    footerStripe(c);
    c.querySelectorAll(".es-hero-img").forEach((im) => (ES.reduce ? gsap.set(im, { scale: 1, opacity: 1 }) : gsap.to(im, { scale: 1, opacity: 1, duration: 1.5, delay: 0.5, ease: "power3.out" })));
    pageOff = ES.pages[c.dataset.barbaNamespace]?.(c) || null;
    c.querySelectorAll("video").forEach((v) => v.play?.().catch(() => {}));
    requestAnimationFrame(() => { ScrollTrigger.refresh(); headerColor(c); });
  }
  function leave() {
    pageOff?.(); pageOff = null;
    cleanups.splice(0).forEach((f) => f());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    ES.splits.splice(0).forEach((s) => s.revert());
    document.querySelector(".brand-hover-preview")?.remove();
  }
  const overlay = document.querySelector(".es-overlay");
  const ready = () => { head?.classList.add("ready"); };
  // Transition — the cover rises from below in .6s (power2.inOut) to cover the page, and the current page moves −100px and fades in .5s (starting .4s before the cover ends),
  // New page comes in from 50px below and transparent in .8s power3.out, and the cover leaves to −110% in .7s at the same time
  function leaveAnim(cur) {
    head?.classList.remove("ready");
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    if (ES.reduce) return tl;
    tl.fromTo(overlay, { y: "100%" }, { y: "0%", duration: 0.6 });
    tl.to(cur, { y: -100, opacity: 0, duration: 0.5 }, "-=0.4");
    return tl;
  }
  function enterAnim(next) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => { ready(); ScrollTrigger.refresh(); headerColor(next); } });
    if (ES.reduce) { gsap.set(overlay, { y: "100%" }); return tl; }
    tl.from(next, { y: 50, opacity: 0, duration: 0.8, clearProps: "all" });
    tl.to(overlay, { y: "-110%", duration: 0.7, ease: "power2.inOut" }, "-=0.7");
    tl.set(overlay, { y: "100%" });
    return tl;
  }
  function boot() {
    const c = document.querySelector('[data-barba="container"]');
    const arrived = sessionStorage.getItem("es-arrive") === "1";
    sessionStorage.removeItem("es-arrive");
    enter(c);
    if (arrived) { gsap.set(overlay, { y: "0%" }); enterAnim(c); }
    else if (ES.reduce) { gsap.set(overlay, { y: "100%" }); ready(); }
    else {
      gsap.set(overlay, { y: "0%" });
      gsap.to(overlay, { y: "-100%", duration: 0.8, ease: "power2.inOut", delay: 0.5, onComplete: () => { gsap.set(overlay, { y: "100%" }); root.classList.add("is-loaded"); ScrollTrigger.refresh(); headerColor(c); } });
      setTimeout(ready, 1000);
    }
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.hooks.after(() => requestAnimationFrame(() => headerColor()));
      barba.init({
        preventRunning: true,
        transitions: [{
          name: "overlay-transition",
          async leave({ current }) { await leaveAnim(current.container); ES.lenis?.scrollTo(0, { immediate: true }); scrollTo(0, 0); leave(); },
          async enter({ next }) { enter(next.container, true); await enterAnim(next.container); },
        }],
      });
    } else {
      document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || a.target || e.metaKey || e.ctrlKey) return;
        const href = a.getAttribute("href");
        if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
        e.preventDefault();
        sessionStorage.setItem("es-arrive", "1");
        leaveAnim(c).then(() => (location.href = href));
      });
    }
  }
  if (document.readyState === "complete") boot();
  else addEventListener("load", boot, { once: true });
})();
