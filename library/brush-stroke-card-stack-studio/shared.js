// Shared across many pages: menu · footer · brush-stroke transition · text reveal · cursor pill · image tail · inertia sticker · video slot.
// Motion that differs per page is EF.page(name, { scroll, hand }) to receive it. In original order, scroll runs before the new page enters (beforeEnter),
// hand attaches after the brush strokes have fully cleared (afterEnter) and is detached on the next transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, InertiaPlugin, Observer);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("move", "0.3, 0.075, 0, 1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
  history.scrollRestoration = "manual";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pages = {};
  const EF = (window.EF = { page: (ns, mods) => (pages[ns] = mods), reduce, finePointer, pointer: null });
  // Record in advance the mouse position moved before the transition brush stroke clears, so the cursor card and weight hover pick it up
  addEventListener("pointermove", (e) => (EF.pointer = { x: e.clientX, y: e.clientY }), { passive: true });
  if (reduce) document.documentElement.classList.add("no-motion");

  const ARROW = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 1.5v9M2 6.5l4 4 4-4"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';
  EF.ARROW = ARROW;

  // Handwritten wordmark spot — brush-script Studio slanted at the same size and color in place of the original logo
  const LOGO = '<svg viewBox="0 0 174 67" aria-label="Logo"><text x="4" y="50" font-size="46" fill="currentColor" font-family="Kaushan Script, cursive" transform="skewX(-8)">Studio</text><path d="M20 58c40-6 90-8 140-4" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  EF.LOGO = LOGO;

  const btn052 = (label, href, cls = "") =>
    `<a class="ef-btn ${cls}" href="${href}"><span class="ef-btn__icon is-default">${ARROW_R}</span><span class="ef-btn__text">${label}</span><span class="ef-btn__icon is-hover">${ARROW_R}</span></a>`;
  const btn093 = (label, href) =>
    `<a class="ef-btn93" href="${href}" data-btn93><span class="ef-btn93__bg"></span><span class="ef-btn93__inner"><span class="ef-btn93__dots"><span class="ef-btn93__dot"></span><span class="ef-btn93__dot is-extra" style="--i:1"></span><span class="ef-btn93__dot is-extra" style="--i:2"></span><span class="ef-btn93__dot is-extra" style="--i:3"></span></span><span class="ef-btn93__text-wrap"><span class="ef-btn93__text is-default">${label}</span><span class="ef-btn93__text is-hover">${label}</span></span></span></a>`;
  EF.btn052 = btn052;

  // Everything attached is removed at once on transition — reverted just before the new page enters (beforeEnter), like the original
  const kit = () => {
    const offs = [];
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {});
    return {
      mm,
      run: (fn) => ctx.add(fn),
      on: (t, type, fn, o) => (t.addEventListener(type, fn, o), offs.push(() => t.removeEventListener(type, fn, o))),
      add: (fn) => typeof fn === "function" && offs.push(fn),
      kill: () => (offs.splice(0).forEach((f) => f()), mm.revert(), ctx.revert()),
    };
  };

  // ── Menu · footer: inside the page box as in the original, so they change together on transitions
  const links = [
    ["about", "about.html", "Menu 1"],
    ["list", "list.html", "Menu 2"],
    ["services", "services.html", "Long Menu 3"],
  ];
  const chrome = (box) => {
    const page = box.dataset.barbaNamespace;
    const navSlot = box.querySelector('[data-slot="nav"]');
    navSlot && (navSlot.outerHTML = `<div class="ef-nav" data-slot="nav" data-nav>
    <div class="ef-nav__inner">
      <a class="ef-logo" href="index.html">${LOGO}</a>
      <div class="ef-nav__bg"></div>
      <nav class="ef-nav__links">
        ${links.map(([p, h, t]) => `<a class="ef-nav__link${p === page ? " is-current" : ""}" href="${h}" data-draw-line data-draw-line-persist><span>${t}</span><span class="ef-draw"></span></a>`).join("")}
        <div class="ef-nav__mob-contact">${btn093("Contact", "#contact")}</div>
      </nav>
      <div class="ef-nav__contact">${btn093("Contact", "#contact")}</div>
      <button class="ef-nav__menu-btn" type="button" aria-label="Menu" aria-expanded="false"><i data-nav-icon="top"></i><i data-nav-icon="bottom"></i></button>
    </div>
  </div>`);
    const footSlot = box.querySelector('[data-slot="footer"]');
    footSlot && (footSlot.outerHTML = `<footer class="ef-footer theme-dark" data-slot="footer" data-nav-theme="dark" id="contact">
    <div class="ef-wrap">
      <div class="ef-footer__cta" data-image-trail data-slot="footer-cta">
        <div class="ef-footer__cta-wrap" data-scroll-reveal-group>
          <h2 class="h-xl" data-scroll-reveal data-weight-hover data-weight-rest="700" data-weight-near="200" data-radius="400" data-label="English question headline in two lines · second line in serif · within 15 characters per line">Have a project<br><span class="h-alt" data-weight-hover data-weight-rest="300" data-weight-near="800" data-radius="400">in mind?</span></h2>
          <p class="p-m op-75" data-scroll-reveal>Your one-line invitation goes here.</p>
          <div data-scroll-reveal="element">${btn052("Start a project", "#contact", "is-pink")}</div>
        </div>
      </div>
      <div class="ef-footer__main">
        <a class="ef-footer__logo" href="index.html">${LOGO}</a>
        <div class="ef-footer__cols" data-label="Your English menu, address and social names here">
          <div class="ef-footer__col"><h3 class="h-xxs">Menu</h3><div class="ef-footer__links">
            ${links.map(([p, h, t]) => `<a class="ef-footer__link${p === page ? " is-current" : ""}" href="${h}" data-draw-line data-draw-line-persist>${t}<span class="ef-draw"></span></a>`).join("")}
            <a class="ef-footer__link" href="#contact" data-draw-line data-draw-line-persist>Contact<span class="ef-draw"></span></a>
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>FAQ<span class="ef-draw"></span></a>
          </div></div>
          <div class="ef-footer__col"><h3 class="h-xxs">Contact</h3><div class="ef-footer__links">
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>Street Name 00<br>0000 AB<br>City<span class="ef-draw"></span></a>
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>hello@example.com<span class="ef-draw"></span></a>
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>(000) 000 00 00<span class="ef-draw"></span></a>
          </div></div>
          <div class="ef-footer__col"><h3 class="h-xxs">Socials</h3><div class="ef-footer__links">
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>Social 1<span class="ef-draw"></span></a>
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>Social 2<span class="ef-draw"></span></a>
            <a class="ef-footer__link" href="#" data-draw-line data-draw-line-persist>Social 3<span class="ef-draw"></span></a>
          </div></div>
          <button class="ef-top-btn" type="button" data-scroll-top aria-label="Back to top"><svg viewBox="0 0 12 12"><path fill="currentColor" d="M5.2 11V3.6L2.3 6.5 1.2 5.4 6 .6l4.8 4.8-1.1 1.1-2.9-2.9V11z"/></svg></button>
        </div>
      </div>
      <div class="ef-footer__bottom">
        <span data-label="Your brand’s English name here">© <span data-year>2026</span> Studio Name</span>
        <div class="ef-footer__legal">
          <a href="#" data-draw-line data-draw-line-persist>Privacy Policy<span class="ef-draw"></span></a>
          <a href="#" data-draw-line data-draw-line-persist>Terms of Use<span class="ef-draw"></span></a>
        </div>
        <a href="#" data-draw-line data-draw-line-persist>© Design by Name<span class="ef-draw"></span></a>
      </div>
    </div>
  </footer>`);
    const year = box.querySelector("[data-year]");
    year && (year.textContent = new Date().getFullYear());
  };

  // Cursor pill
  document.body.insertAdjacentHTML("beforeend", '<div class="ef-cursor" data-status="not-active"><div class="ef-cursor__card"><span class="ef-cursor__text"></span><span class="ef-cursor__text"></span></div></div>');

  // ── Smooth scroll (original lerp 0.165 · wheel ×1.25)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { duration: 1.2 }) : typeof target === "number" ? window.scrollTo(0, target) : target.scrollIntoView());
  const anchors = (box, k) => {
    box.querySelectorAll("[data-scroll-top]").forEach((b) =>
      k.on(b, "click", (e) => {
        if (b.closest("a")) return;
        e.preventDefault();
        scrollTo(0);
      })
    );
    box.querySelectorAll('a[href^="#"]').forEach((a) =>
      k.on(a, "click", (e) => {
        const id = a.getAttribute("href");
        e.preventDefault();
        const t = id.length > 1 && box.querySelector(id);
        if (t) scrollTo(t);
      })
    );
  };

  // ── Nav color: logo turns white over dark surfaces
  const navTheme = (box) => {
    const nav = box.querySelector("[data-nav]");
    const navH = () => nav.offsetHeight || 64;
    box.querySelectorAll("[data-nav-theme]").forEach((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: () => `top ${navH()}px`,
        end: () => `bottom ${navH()}px`,
        invalidateOnRefresh: true,
        onToggle: (st) => (st.isActive ? (nav.dataset.themeActive = sec.dataset.navTheme) : delete nav.dataset.themeActive),
      })
    );
  };

  // ── Phone menu: a black sheet drops from the top and links rise 0.05s apart
  const mobileMenu = (box, k) => k.mm.add("(max-width: 479px)", () => {
    const nav = box.querySelector("[data-nav]");
    const toggle = nav.querySelector(".ef-nav__menu-btn");
    const menu = nav.querySelector(".ef-nav__links");
    const bg = nav.querySelector(".ef-nav__bg");
    const top = nav.querySelector('[data-nav-icon="top"]');
    const bottom = nav.querySelector('[data-nav-icon="bottom"]');
    const items = [...menu.querySelectorAll(".ef-nav__link, .ef-nav__mob-contact")];
    const g = (bottom.getBoundingClientRect().top - top.getBoundingClientRect().top) / 2;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut", duration: 0.6 } });
    tl.fromTo(bg, { yPercent: -100, y: 0 }, { yPercent: 0, y: 0 }, 0)
      .fromTo(menu, { yPercent: -100, y: 0 }, { yPercent: 0, y: 0 }, 0.05)
      .fromTo(items, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.25)
      .to(top, { y: g, rotate: 45, duration: 0.4 }, 0)
      .to(bottom, { y: -g, rotate: -45, duration: 0.4 }, 0);
    gsap.set([bg, menu], { yPercent: -100, translate: "none" });
    let open = false;
    let t = null;
    const set = (v) => {
      open = v;
      nav.dataset.status = v ? "open" : "closed";
      toggle.setAttribute("aria-expanded", String(v));
      clearTimeout(t);
      if (v) nav.dataset.logo = "light";
      else t = setTimeout(() => delete nav.dataset.logo, 350);
      lenis && (v ? lenis.stop() : lenis.start());
      tl.timeScale(v ? 1 : 1.4);
      v ? tl.play() : tl.reverse();
    };
    const onClick = (e) => (e.preventDefault(), set(!open));
    const onKey = (e) => e.key === "Escape" && open && set(false);
    const onLink = (e) => open && e.target.closest("a[href]") && set(false);
    toggle.addEventListener("click", onClick);
    menu.addEventListener("click", onLink);
    document.addEventListener("keydown", onKey);
    return () => {
      toggle.removeEventListener("click", onClick);
      menu.removeEventListener("click", onLink);
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      tl.kill();
      gsap.set([bg, menu, top, bottom, items], { clearProps: "all" });
      delete nav.dataset.status;
    };
  });

  // ── Handwritten underline: each time it enters, the next shape is drawn in 0.5s, and on exit it is erased toward the end (same cycling as the original, shapes redrawn) ──
  const SQUIGGLES = [
    "M5 22C40 14 80 12 118 19C150 25 176 27 204 20C236 12 270 14 305 18",
    "M5 26C60 18 120 8 180 8C214 8 236 14 230 22C224 30 186 32 176 24C168 16 210 10 250 10C272 10 290 12 305 14",
    "M5 28C20 18 32 16 44 24C56 32 70 30 82 20C96 10 110 12 122 22C134 32 150 30 164 20C178 10 192 12 206 22C220 32 236 30 250 20C264 10 282 14 305 22",
    "M18 32C80 32 140 32 180 30C150 26 90 18 60 10C120 8 220 10 300 14",
    "M5 21C100 17 200 14 305 14",
    "M5 30C70 26 130 18 170 16C160 22 150 30 156 33C190 26 240 12 305 6",
  ];
  let sq = Math.floor(Math.random() * SQUIGGLES.length);
  const drawInto = (box, dur = 0.5) => {
    box.innerHTML = `<svg viewBox="0 0 310 40" preserveAspectRatio="none"><path d="${SQUIGGLES[sq]}" stroke="currentColor" stroke-width="10" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke" style="stroke-width:max(2px,0.12em)"/></svg>`;
    sq = (sq + 1) % SQUIGGLES.length;
    const p = box.querySelector("path");
    gsap.set(p, { drawSVG: "0%" });
    return gsap.to(p, { duration: dur, drawSVG: "100%", ease: "power2.inOut" });
  };
  const drawLines = (root, k) => root.querySelectorAll("[data-draw-line]").forEach((el) => {
    const box = el.querySelector(".ef-draw");
    if (!box) return;
    const always = el.hasAttribute("data-draw-line-always");
    const persist = el.hasAttribute("data-draw-line-persist") && el.classList.contains("is-current");
    let inTw = null;
    let outTw = null;
    if (always || persist) inTw = drawInto(box, 0.6);
    k.on(el, "mouseenter", () => {
      if (inTw && inTw.isActive()) return;
      outTw && (outTw.kill(), (outTw = null));
      if (always || persist) return;
      inTw = drawInto(box);
    });
    k.on(el, "mouseleave", () => {
      if (always || persist) return;
      const out = () => {
        const p = box.querySelector("path");
        if (!p || (outTw && outTw.isActive())) return;
        outTw = gsap.to(p, { duration: 0.5, drawSVG: "100% 100%", ease: "power2.inOut", onComplete: () => (box.innerHTML = "") });
      };
      inTw && inTw.isActive() ? inTw.then(out) : out();
    });
  });

  // ── Split letters rise: on the first screen when the brush stroke clears, on the rest when reaching 85% of the screen (yPercent 135 → 0, 1s expo.out)
  let splits = [];
  const revealed = new WeakSet();
  const split = (el, type) => {
    const s = new SplitText(el, { type: type === "chars" ? "chars,words,lines" : "lines,words", linesClass: "line", charsClass: "char", mask: "lines" });
    splits.push({ el, s });
    return s;
  };
  const done = (el) => (revealed.add(el), el.dispatchEvent(new Event("reveal:done")));
  const revealTween = (el) => {
    const type = el.dataset.textReveal || el.dataset.scrollReveal || "lines";
    gsap.set(el, { visibility: "visible" });
    if (type === "element") return gsap.fromTo(el, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" });
    const useChars = type === "chars" || el.hasAttribute("data-weight-hover");
    const s = split(el, useChars ? "chars" : "lines");
    const targets = type === "chars" ? s.chars : s.lines;
    // Weight hover measures its position after all letters have risen (original reveal:done)
    return gsap.fromTo(targets, { yPercent: 135 }, { yPercent: 0, duration: 1, ease: "expo.out", stagger: type === "chars" ? { each: 0.07 * 0.25 } : 0.07, onComplete: () => done(el) });
  };
  const loadReveals = (box, delay) => {
    const groups = new Map();
    box.querySelectorAll("[data-text-reveal]").forEach((el) => {
      const g = el.closest("[data-text-reveal-group]");
      const n = groups.get(g) || 0;
      groups.set(g, n + 1);
      if (reduce) return gsap.set(el, { visibility: "visible" }), done(el);
      revealTween(el).delay(delay + (g ? n * 0.12 : 0));
    });
  };
  const scrollReveals = (box) => {
    const els = [...box.querySelectorAll("[data-scroll-reveal]")];
    if (reduce) return els.forEach((el) => (gsap.set(el, { visibility: "visible" }), done(el)));
    const grouped = new Map();
    els.forEach((el) => {
      const g = el.closest("[data-scroll-reveal-group]") || el;
      grouped.has(g) || grouped.set(g, []);
      grouped.get(g).push(el);
    });
    grouped.forEach((list, trigger) => {
      const tl = gsap.timeline({ paused: true, scrollTrigger: { trigger, start: "top 85%", once: true } });
      list.forEach((el, i) => tl.add(revealTween(el), i * 0.12));
    });
  };

  // ── Weight hover (original method): if the distance d between letter center and cursor is within radius, blends rest → near by 1−d/radius and follows over 0.4s power2.out.
  //    values come from the nearest [data-weight-hover] data-weight-rest·near·radius. font-variation-settings is applied directly on each character —
  //    If applied only to the parent, var(--wght) is inherited as the value already resolved at the parent, so the letter’s --wght can’t change the weight.
  const chars = [];
  const num = (el, key, d) => { const v = parseFloat(el.dataset[key]); return Number.isFinite(v) ? v : d; };
  const measure = () => chars.forEach((o) => { const r = o.c.getBoundingClientRect(); o.x = r.left + r.width / 2 + scrollX; o.y = r.top + r.height / 2 + scrollY; });
  let queued = false;
  const remeasure = () => queued || ((queued = true), requestAnimationFrame(() => ((queued = false), measure())));
  // Like the original, the cursor’s page position is written only when it moves — scrolling alone leaves that position as is
  let moved = false, mx = 0, my = 0;
  if (finePointer && !reduce) {
    addEventListener("pointermove", (e) => ((moved = true), (mx = e.pageX), (my = e.pageY)), { passive: true });
    addEventListener("resize", remeasure, { passive: true });
    gsap.ticker.add(() => {
      if (!moved) return;
      for (const o of chars) {
        const d = Math.hypot(mx - o.x, my - o.y), t = d >= o.radius ? 0 : 1 - d / o.radius;
        const w = Math.min(o.hi, Math.max(o.lo, o.rest + (o.near - o.rest) * t));
        if (Math.abs(w - o.last) < 1) continue;
        o.last = w;
        o.to(w);
      }
    });
  }
  const weightHover = (box, k) => {
    if (!finePointer || reduce) return;
    const all = [...box.querySelectorAll("[data-weight-hover]")];
    const roots = all.filter((el) => !all.some((o) => o !== el && o.contains(el)));
    if (!roots.length) return;
    const axes = (c) => {
      const s = getComputedStyle(c).fontVariationSettings;
      return !s || s === "normal" ? "'wght' var(--wght)" : ["'wght' var(--wght)", ...s.split(",").map((x) => x.trim()).filter((x) => !/^["']wght["']/i.test(x))].join(", ");
    };
    const take = (el) => {
      const s = splits.find((x) => x.el === el)?.s || split(el, "chars");
      s.chars.forEach((c) => {
        const host = c.closest("[data-weight-hover]") || c.parentElement;
        const rest = num(host, "weightRest", parseFloat(getComputedStyle(c).fontWeight) || 400), near = num(host, "weightNear", rest);
        c.style.setProperty("--wght", rest);
        c.style.fontVariationSettings = axes(c);
        chars.push({ c, rest, near, radius: num(host, "radius", 400), last: rest, lo: Math.min(rest, near), hi: Math.max(rest, near), x: 0, y: 0,
          to: gsap.quickTo(c, "--wght", { duration: 0.4, ease: "power2.out", overwrite: "auto" }) });
      });
      remeasure();
    };
    roots.forEach((el) => (el.matches("[data-text-reveal], [data-scroll-reveal]") && !revealed.has(el) ? k.on(el, "reveal:done", () => take(el), { once: true }) : take(el)));
    if (EF.pointer && !moved) (moved = true), (mx = EF.pointer.x + scrollX), (my = EF.pointer.y + scrollY);
    let width = 0;
    const ro = new ResizeObserver((en) => { const w = en[0]?.contentRect.width ?? 0; if (Math.abs(w - width) >= 2) (width = w), remeasure(); });
    roots.forEach((el) => ro.observe(el));
    document.fonts?.ready.then(remeasure);
    k.add(() => (ro.disconnect(), (chars.length = 0)));
  };

  // ── Cursor pill: on entering a card it flows at character count ÷ 5 seconds, follows with 0.4s power3
  if (finePointer) {
    const box = document.querySelector(".ef-cursor");
    const spans = [...box.querySelectorAll(".ef-cursor__text")];
    const qx = gsap.quickTo(box, "x", { duration: 0.4, ease: "power3" });
    const qy = gsap.quickTo(box, "y", { duration: 0.4, ease: "power3" });
    let cur = null, x = 0, y = 0, first = true, pause = 0;
    const on = (el) => {
      clearTimeout(pause);
      const txt = el.dataset.cursorText;
      spans.forEach((s) => { s.textContent = txt; s.style.animationPlayState = "running"; s.style.animationDuration = txt.length / 5 + "s"; });
      box.dataset.status = "active";
      cur = el;
    };
    const off = () => {
      box.dataset.status = "not-active";
      pause = setTimeout(() => spans.forEach((s) => (s.style.animationPlayState = "paused")), 400);
      cur = null;
    };
    const check = () => {
      const hit = document.elementFromPoint(x, y)?.closest("[data-cursor-text]") || null;
      if (hit !== cur) (cur && off(), hit && on(hit));
    };
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (first) (gsap.set(box, { x, y }), (first = false));
      qx(x); qy(y); check();
    }, { passive: true });
    addEventListener("scroll", () => first || check(), { passive: true });
    EF.cursorCheck = () => first || check();
  }

  // ── Image trail: each time the pointer moves by screen width ÷ 8, one sticker pops out and flies in the direction of travel while shrinking
  //    the original is handwriting·badge sticker art, so redraw stickers with a similar feel in SVG and reuse them
  const S = (body, vb = "0 0 140 110") => `<svg viewBox="${vb}">${body}</svg>`;
  const T = 'font-family="Kaushan Script, cursive" text-anchor="middle"';
  const STICKERS = [
    S(`<ellipse cx="70" cy="55" rx="64" ry="42" fill="var(--kf-surface)" stroke="var(--site-red)" stroke-width="6"/><ellipse cx="70" cy="55" rx="52" ry="32" fill="none" stroke="var(--kf-accent)" stroke-width="4"/><text x="70" y="70" ${T} font-size="40" fill="var(--site-red)">Ab</text>`),
    S(`<path d="M10 70 40 20l30 30 26-36 34 56-20 6 10 28H24z" fill="var(--site-orange)" stroke="var(--kf-surface)" stroke-width="5"/><text x="70" y="78" ${T} font-size="22" fill="var(--kf-surface)">Hot!</text>`),
    S(`<path d="M6 50 120 18l14 14-40 22 30 30-16 8-40-26-50 14z" fill="var(--site-red)" stroke="var(--kf-surface)" stroke-width="5"/><text x="64" y="58" ${T} font-size="18" fill="var(--kf-surface)" transform="rotate(-14 64 58)">Quick Club</text>`),
    S(`<path d="M70 6 84 26l24-4-4 24 22 14-22 14 4 24-24-4-14 20-14-20-24 4 4-24-22-14 22-14-4-24 24 4z" fill="var(--site-green)" stroke="var(--kf-surface)" stroke-width="5"/><text x="70" y="52" ${T} font-size="16" fill="var(--kf-surface)">Less talk</text><text x="70" y="72" ${T} font-size="16" fill="var(--kf-surface)">Big pics</text>`),
    S(`<rect x="10" y="22" width="120" height="66" rx="12" fill="var(--kf-accent)" stroke="var(--kf-surface)" stroke-width="5" transform="rotate(-6 70 55)"/><text x="70" y="66" ${T} font-size="26" fill="var(--kf-surface)" transform="rotate(-6 70 55)">No Fuss</text>`),
    S(`<text x="70" y="70" ${T} font-size="46" fill="var(--kf-surface)" stroke="var(--kf-surface)" stroke-width="10" stroke-linejoin="round">ABCD</text><text x="70" y="70" ${T} font-size="46" fill="var(--site-pink)">ABCD</text>`),
  ];
  const imageTrail = (box, k) => {
    if (!finePointer || reduce) return;
    box.querySelectorAll("[data-image-trail]").forEach((zone) => {
      let n = 0, acc = 0, lx = 0, ly = 0, started = false;
      const spacing = () => innerWidth / 8;
      const spawn = (x, y, dx, dy) => {
        const img = document.createElement("div");
        img.className = "ef-trail-img";
        img.innerHTML = STICKERS[n % STICKERS.length];
        n++;
        zone.appendChild(img);
        const tl = gsap.timeline({ onComplete: () => img.remove() });
        tl.fromTo(img, { xPercent: -50 + (Math.random() - 0.5) * 80, yPercent: -50 + (Math.random() - 0.5) * 10, scaleX: 1.3, scaleY: 1.3 }, { scaleX: 1, scaleY: 1, ease: "elastic.out(2, 0.6)", duration: 0.6 })
          .fromTo(img, { x, y, rotation: (Math.random() - 0.5) * 20 }, { x: "+=" + dx * 4, y: "+=" + dy * 4, rotation: (Math.random() - 0.5) * 20, ease: "power4.out", duration: 1.5 }, "<")
          .to(img, { scale: 0.5, duration: 0.3, delay: 0.1, ease: "back.in(1.5)" });
      };
      k.on(zone, "mousemove", (e) => {
        const r = zone.getBoundingClientRect();
        if (!started) return (started = true), (lx = e.clientX), (ly = e.clientY);
        const dx = e.clientX - lx, dy = e.clientY - ly;
        acc += Math.abs(dx) + Math.abs(dy);
        if (acc > spacing()) (acc = 0), spawn(e.clientX - r.left, e.clientY - r.top, dx, dy);
        lx = e.clientX; ly = e.clientY;
      });
      k.on(zone, "mouseleave", () => ((started = false), (acc = 0)));
    });
  };

  // ── Inertia bounce: throw x, y and rotation by the speed and direction the mouse entered, then return to place with resistance 200
  const momentum = (box, k) => {
    if (!finePointer || reduce) return;
    const clampXY = gsap.utils.clamp(-1080, 1080);
    const clampR = gsap.utils.clamp(-60, 60);
    box.querySelectorAll("[data-momentum]").forEach((root) => {
      let px = 0, py = 0, vx = 0, vy = 0, started = false, raf = 0;
      k.on(root, "mousemove", (e) => {
        if (!started) return (started = true), (px = e.clientX), (py = e.clientY);
        if (raf) return;
        const x = e.clientX, y = e.clientY;
        raf = requestAnimationFrame(() => { vx = x - px; vy = y - py; px = x; py = y; raf = 0; });
      });
      root.querySelectorAll("[data-momentum-el]").forEach((el) => {
        const t = el.querySelector("[data-momentum-target]") || el;
        k.on(el, "mouseenter", (e) => {
          const r = t.getBoundingClientRect();
          const ox = e.clientX - (r.left + r.width / 2), oy = e.clientY - (r.top + r.height / 2);
          const torque = (ox * vy - oy * vx) / (Math.hypot(ox, oy) || 1);
          gsap.to(t, { inertia: { x: { velocity: clampXY(vx * 30), end: 0 }, y: { velocity: clampXY(vy * 30), end: 0 }, rotation: { velocity: clampR(torque * 20), end: 0 }, resistance: 200 } });
        });
      });
    });
  };

  // ── Team photo parallax: odd 1 · even -0.6 times for 200px (tablet 0.5 · phone 0.3 times)
  const teamParallax = (box, k) => k.mm.add({ d: "(min-width: 992px)", t: "(min-width: 480px) and (max-width: 991px)", m: "(max-width: 479px)", r: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { d, t, m, r } = ctx.conditions;
    if (r) return;
    const f = d ? 1 : t ? 0.5 : 0.3;
    box.querySelectorAll("[data-team-parallax]").forEach((list) => {
      if (m && list.dataset.parallaxDisable === "mobile") return;
      const dist = (parseFloat(list.dataset.teamParallax) || 80) * f;
      list.querySelectorAll("[data-team-parallax-item]").forEach((it, i) =>
        gsap.to(it, { y: dist * (i % 2 === 0 ? 1 : -0.6), ease: "none", scrollTrigger: { trigger: list, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true, invalidateOnRefresh: true } })
      );
    });
  });

  // ── Contact button (original button-093): measures the growth ratio from the button width·height — so that width +12px · height +6px ──
  const btn93Scale = (box, k) => {
    const els = [...box.querySelectorAll("[data-btn93]")];
    if (!els.length) return;
    const update = () => els.forEach((el) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      el.style.setProperty("--ef-btn93-sx", (w + 12) / w);
      el.style.setProperty("--ef-btn93-sy", (h + 6) / h);
    });
    update();
    const ro = new ResizeObserver(update);
    els.forEach((el) => ro.observe(el));
    document.fonts?.ready.then(update);
    k.add(() => ro.disconnect());
  };

  // ── Video slot: placeholder video (media/<data-video>.mp4 — length and ratio measured from the original) is laid down and the original playback method is applied.
  //    data-video-bg: original bunny-bg — muted, looping autoplay, pauses when less than 10% is visible and resumes when it re-enters.
  //    Videos inside [data-video-hover]: original video-on-hover — on hover the video is loaded and played then, on leave it pauses after 0.2s and returns to the start. Not applied on touch devices.
  const videoEl = (slot, preload) => {
    const v = document.createElement("video");
    v.className = "ef-video";
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = preload;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    slot.prepend(v);
    return v;
  };
  const play = (v) => v.play()?.catch(() => {});
  const videos = (box, k) => {
    const bgs = [...box.querySelectorAll("[data-video-bg][data-video]")];
    if (bgs.length) {
      const io = new IntersectionObserver((es) => es.forEach(({ target, isIntersecting, intersectionRatio }) => {
        const v = target.querySelector(".ef-video");
        if (isIntersecting && intersectionRatio > 0) {
          if (v.paused) target.dataset.playerStatus = "loading", play(v);
        } else if (!v.paused && !v.ended) v.pause();
      }), { threshold: 0.1 });
      bgs.forEach((slot) => {
        slot.dataset.playerStatus = "idle";
        const v = videoEl(slot, "auto");
        v.addEventListener("playing", () => (slot.dataset.playerStatus = "playing"));
        v.addEventListener("pause", () => (slot.dataset.playerStatus = "paused"));
        v.addEventListener("waiting", () => (slot.dataset.playerStatus = "loading"));
        v.src = `media/${slot.dataset.video}.mp4`;
        io.observe(slot);
      });
      k.add(() => io.disconnect());
    }
    if (matchMedia("(hover: none), (pointer: coarse)").matches) return;
    box.querySelectorAll("[data-video-hover]").forEach((host) => {
      const slot = host.querySelector("[data-video]");
      if (!slot) return;
      const v = videoEl(slot, "none");
      const src = `media/${slot.dataset.video}.mp4`;
      let t = 0, p = null;
      host.dataset.videoOnHover = "not-active";
      k.on(host, "mouseenter", () => {
        clearTimeout(t);
        v.getAttribute("src") || v.setAttribute("src", src);
        host.dataset.videoOnHover = "active";
        p = v.play();
        p?.catch(() => {});
      });
      k.on(host, "mouseleave", () => {
        host.dataset.videoOnHover = "not-active";
        clearTimeout(t);
        t = setTimeout(() => Promise.resolve(p).catch(() => {}).then(() => ((v.pause(), (v.currentTime = 0)))), 200);
      });
      k.add(() => clearTimeout(t));
    });
  };

  // ── Attach: scroll before entering, hand after the brush stroke clears
  let scrollKit = null, handKit = null;
  const mountScroll = (box) => {
    const ns = box.dataset.barbaNamespace;
    const k = (scrollKit = kit());
    chrome(box);
    k.run(() => {
      navTheme(box);
      scrollReveals(box);
      teamParallax(box, k);
      k.add(pages[ns]?.scroll?.(box, k));
    });
  };
  const mountHand = (box) => {
    const ns = box.dataset.barbaNamespace;
    const k = (handKit = kit());
    k.run(() => {
      drawLines(box, k);
      weightHover(box, k);
      mobileMenu(box, k);
      anchors(box, k);
      videos(box, k);
      imageTrail(box, k);
      btn93Scale(box, k);
      momentum(box, k);
      k.add(pages[ns]?.hand?.(box, k));
    });
    EF.cursorCheck?.();
  };
  const unmount = () => {
    scrollKit?.kill();
    handKit?.kill();
    scrollKit = handKit = null;
    splits = [];
  };

  // ── Brush-stroke transition (original barba 2.10.3 — same values)
  const strokes = () => [...document.querySelectorAll(".ef-transition path")];
  const ready = (box) => (gsap.set(box, { clearProps: "opacity,visibility" }), lenis && (lenis.resize(), lenis.start()));
  // First open: the brush stroke clears over 1.25s starting at 0.4s, and the text rises 0.6s after that
  const once = (box) => {
    const p = strokes();
    const tl = gsap.timeline();
    gsap.set(box, { autoAlpha: 0 });
    // Set the cover thickness directly first, then remove is-covered — a timeline set only applies on the next tick, so in between the brush stroke would blink off to 1px and back on
    if (!reduce && p.length) gsap.set(p, { drawSVG: "0% 100%", strokeWidth: "30%" });
    document.documentElement.classList.remove("is-covered");
    if (reduce || !p.length) {
      tl.set(box, { autoAlpha: 1 }).call(() => (loadReveals(box, 0), ready(box)), null, 0);
      return tl;
    }
    return tl
      .add("reveal", 0.4)
      .call(() => loadReveals(box, 0.6), null, "reveal")
      .set(box, { autoAlpha: 1 }, "reveal")
      .to(p, { drawSVG: "100% 100%", strokeWidth: "5%", duration: 1.25, ease: "power1.inOut" }, "reveal")
      .call(ready, [box], "reveal");
  };
  // On leaving: draw the brush stroke to 85% in 1s, with thickness 5→30% from 0.25s
  const leave = (old) => {
    const p = strokes();
    const tl = gsap.timeline({ onComplete: () => old?.remove() });
    if (reduce || !p.length) return tl.set(old, { autoAlpha: 0 });
    gsap.set(p, { strokeWidth: "5%", drawSVG: "0% 0%" });
    return tl.to(p, { duration: 1, drawSVG: "0% 85%", ease: "power1.inOut", immediateRender: true }, 0)
      .to(p, { strokeWidth: "30%", duration: 0.75, ease: "power1.inOut" }, 0.25);
  };
  // On entering: turn the new page on in 1 second and pull the brush stroke away in 1.25s, and 0.4s after that (+0.3) the letters rise. Attach the interaction response at 2.25s.
  // The original starts leaving and entering at the same time — since the brush stroke began right on press (since seconds ago), advance it by that much so it joins up at 1s
  const enter = (box, since = 0) => {
    const p = strokes();
    const tl = gsap.timeline();
    if (reduce || !p.length) {
      tl.set(box, { autoAlpha: 1 }).call(() => (loadReveals(box, 0), ready(box)));
      return new Promise((r) => tl.call(r));
    }
    since = Math.min(Math.max(since, 0), 0.9);
    tl.add("startEnter", 1 - since)
      .set(box, { autoAlpha: 1 }, "startEnter")
      .set(p, { drawSVG: "0% 100%" }, "startEnter")
      .to(p, { duration: 1.25, drawSVG: "100% 100%", strokeWidth: "5%", ease: "power1.inOut" }, "startEnter")
      .call(() => loadReveals(box, 0.3), null, "startEnter+=0.4")
      .add("pageReady", 2.25 - since)
      .call(ready, [box], "pageReady");
    return new Promise((r) => tl.call(r, null, "pageReady"));
  };

  // Preloads the next page’s css and page script — the page-transition library only swaps the container <head> …and no separate script is added
  const parse = (html) => new DOMParser().parseFromString(html, "text/html");
  const abs = (h) => new URL(h, location.href).href;
  const load = (tag, attrs) => new Promise((res) => {
    const el = Object.assign(document.createElement(tag), attrs);
    el.onload = el.onerror = res;
    (tag === "link" ? document.head : document.body).append(el);
  });
  const bring = async (doc) => {
    const sheets = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const haveSheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(sheets.filter((h) => !haveSheets.includes(h)).map((href) => load("link", { rel: "stylesheet", href })));
    const haveScripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (!haveScripts.includes(src)) await load("script", { src });
    }
    return sheets;
  };
  const prune = (keep) => document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => keep.includes(l.href) || l.remove());

  // On file:// barba can’t fetch the next page — it covers with the same brush stroke, then navigates normally, and the new page uncovers like a first load
  const plainNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html$/.test(href)) return;
      e.preventDefault();
      lenis && lenis.stop();
      leave(null).eventCallback("onComplete", () => (location.href = href));
    });
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      gsap.set(strokes(), { drawSVG: "100% 100%", strokeWidth: "5%" });
      lenis && lenis.start();
    });
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!window.barba || !/^https?:$/.test(location.protocol)) {
      mountScroll(first);
      once(first).then(() => mountHand(first));
      ScrollTrigger.refresh();
      return plainNav();
    }
    let keep = null, leaving = null;
    barba.hooks.after(() => (leaving = null));
    barba.hooks.beforeEnter(({ current, next }) => {
      if (current?.container && current.container !== next.container) {
        gsap.set(current.container, { position: "fixed", top: -scrollY, left: 0, right: 0, zIndex: 2 });
        window.scrollTo(0, 0);
      }
      gsap.set(next.container, { autoAlpha: 0 });
      unmount();
      ScrollTrigger.getAll().forEach((st) => st.kill(false));
      lenis && (lenis.stop(), lenis.scrollTo(0, { immediate: true }));
      mountScroll(next.container);
    });
    // Like the original, no re-measuring of positions (ScrollTrigger.refresh) — the new section’s triggers are created after the old box is pulled out as fixed, so positions are right,
    // Calling refresh at the end of the transition makes the pinned position jump once, lengthening the transition tail
    barba.hooks.afterEnter(({ next }) => {
      mountHand(next.container);
      lenis && (lenis.resize(), lenis.start());
    });
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el }) => el.getAttribute("href")?.startsWith("#") || !!el.closest(".wf-ui"),
      transitions: [{
        name: "default",
        sync: true,
        once: ({ next }) => once(next.container),
        // The brush stroke starts drawing the moment you press — so the first frame isn’t late while the next page’s skin and script are fetched and attached (transition values are the same)
        before: ({ current }) => void (leaving = leave(current.container)),
        beforeLeave: async ({ next }) => {
          const doc = parse(next.html);
          keep = await bring(doc);
          document.title = doc.title;
        },
        leave: ({ current }) => leaving || leave(current.container),
        afterLeave: () => keep && prune(keep),
        enter: ({ next }) => enter(next.container, leaving ? leaving.time() : 0),
      }],
    });
  };
  // Text-splitting lines only align once the typeface has fully loaded
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
