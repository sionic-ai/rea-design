// Draws the header row, phone menu, footer and cursor tag shared by all pages, and rebuilds the original Webflow IX3/IX2 motion with the same values.
// Original values: Lenis duration 2.4 · reveal fadein .8s sine.out (top 75%) · section title lines at 50%↑ .6s gap .1 · words 30→100% scrub .8 ·
// Hero −20em scrub .8 · footer −15em→0 scrub .5 · full-bleed section background −25vh→25vh · accordion .6s power2.inOut
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const page = document.body.dataset.page || "home";

  const ARROW = (c) => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
  const btn = (text, href, cls = "") =>
    `<a class="va-btn ${cls}" href="${href}"><span class="va-btn__text">${text}</span><span class="va-btn__disc"><i class="va-btn__circle"></i>${ARROW("is-first")}${ARROW("is-second")}</span></a>`;
  window.vaBtn = btn;

  // Brand monogram spot — an initial shape of two thin overlapping strokes in place of the original logo
  const MONO = `<svg viewBox="0 0 62 62" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M18 18l9 26 7-20"/><path d="M28 18l9 26 8-24"/><path d="M40 16c3 4 3 9 0 12" stroke-width=".9"/></svg>`;
  const LOGO = `<svg viewBox="0 0 180 120" fill="none" stroke="currentColor" aria-hidden="true"><path d="M58 18l20 62 16-46" stroke-width="2"/><path d="M80 18l20 62 18-56" stroke-width="2"/><path d="M110 12c8 8 8 20 0 28" stroke-width="1.4"/><text x="90" y="112" text-anchor="middle" fill="currentColor" stroke="none" font-size="13" letter-spacing="3">STUDIO NAME</text></svg>`;
  const LEAF = `<svg class="va-sec-title__icon" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><path d="M5 25C5 13 12 6 25 5c0 13-7 20-20 20Z"/><path d="M5 25 18 12"/></svg>`;
  window.vaLeaf = LEAF;

  const LINKS = [
    ["about.html", "about", "About"],
    ["index.html#approach", "approach", "Approach"],
    ["index.html#focus", "focus", "Focus Areas"],
    ["service.html", "service", "Work With Us"],
    ["news.html", "news", "Journal"],
    ["service.html#request", "contact", "Contact"],
  ];
  const cur = (k) => (k === page || (k === "news" && page === "article") ? ' aria-current="page"' : "");

  // ── Header row · phone menu ──
  const navSlot = $('[data-slot="nav"]');
  if (navSlot) {
    navSlot.className = "va-nav";
    navSlot.innerHTML = `
      <div class="va-wrap"><div class="va-nav__in">
        <a class="va-brand" href="index.html" aria-label="Home" data-label="Brand monogram">${MONO}</a>
        <div class="va-nav__links">${LINKS.map(([h, k, t], i) => `${i ? '<i class="va-nav__dot"></i>' : ""}<a class="va-nav__link" href="${h}"${cur(k)}><span>${t}</span></a>`).join("")}</div>
        <div class="va-nav__cta">${btn("Book a Session", "service.html#request", "is-glass")}</div>
        <button class="va-menu-btn" type="button" aria-expanded="false"><span>Menu</span><i></i></button>
      </div></div>
      <div class="va-menu" aria-hidden="true">
        <div class="va-menu__head"><div class="va-wrap"><div class="va-nav__in">
          <a class="va-brand" href="index.html" aria-label="Home">${MONO}</a>
          <button class="va-menu-btn" type="button" data-close><span>Close</span><i></i></button>
        </div></div></div>
        <div class="va-menu__body">
          <div class="va-menu__links"><div class="va-menu__label"><span>Discover</span></div>
            ${LINKS.map(([h, k, t]) => `<a class="va-menu__link" href="${h}"${cur(k)}><span>${t}</span></a>`).join("")}</div>
          <div class="va-menu__foot">
            <div class="va-stack"><div class="va-menu__label"><span>Direct Contact:</span></div><a href="#">hello@studio-name.com</a></div>
            <div class="va-stack"><div class="va-menu__label"><span>Social media:</span></div><a href="#">Instagram · YouTube · Facebook</a></div>
          </div>
        </div>
      </div>`;
  }

  // ── Footer ──
  const foot = $('[data-slot="footer"]');
  if (foot) {
    const d = foot.dataset;
    foot.className = "va-footer";
    foot.innerHTML = `
      <section class="va-footer__sec">
        <div class="va-footer__bg"><div class="wf-img va-dark" data-label="${d.photo || "Dark still life with rising smoke · low side light · full-width background"}"></div></div>
        <div class="va-wrap">
          <div class="va-sec-title is-light" data-a="fadein"><span class="va-label">${d.label || "Begin Your Journey"}</span><i class="va-sec-title__line"></i></div>
          <div class="va-footer__cta">
            <h2 class="va-h1 is-footer" lang="en" data-label="Closing heading (English)">${d.title || "Ready to Start?"}</h2>
            <div class="va-center">
              <p class="va-body">${d.text || "Your notice goes here in about 2 lines that the number of consultations per month is limited. That is why we give each person plenty of time."}</p>
              ${btn(d.cta || "Request a First Session", "service.html#request")}
            </div>
          </div>
          <div class="va-footer__block">
            <div class="va-footer__cols">
              <div class="va-footer__left">
                <a class="va-footer__logo" href="index.html" aria-label="Home" data-label="Brand logo (monogram + name)">${LOGO}</a>
                <p class="va-t20 va-hide-m">Your three or so lines here noting that this consultation does not replace a medical diagnosis, and what it helps with.</p>
              </div>
              <form class="va-footer__form" onsubmit="return false">
                <div class="va-stack" style="gap:.75em"><span class="va-t24 is-medium">Be the first to know</span><span class="va-t20">One-line newsletter note here.</span></div>
                <div class="va-footer__field"><input class="va-footer__input" type="email" placeholder="Email address" aria-label="Email"><button class="va-footer__ok" type="submit">Ok</button></div>
              </form>
              <div class="va-footer__right">
                <div class="va-footer__nav"><span class="va-t24 is-medium">Navigation</span><ul>
                  <li><a class="va-footer__link" href="index.html">Home</a></li>
                  ${LINKS.map(([h, , t]) => `<li><a class="va-footer__link" href="${h}">${t}</a></li>`).join("")}
                </ul></div>
                <div class="va-footer__nav"><span class="va-t24 is-medium">Social Media</span><ul>
                  <li><a class="va-footer__link" href="#">Instagram</a></li><li><a class="va-footer__link" href="#">YouTube</a></li><li><a class="va-footer__link" href="#">Facebook</a></li>
                </ul></div>
              </div>
            </div>
            <div class="va-footer__bottom">
              <span class="va-t18">©2026. STUDIO NAME. All Rights Reserved.</span>
              <div class="va-footer__legal"><a class="va-footer__link" href="#">Disclaimer</a><a class="va-footer__link" href="#">Privacy Policy</a><a class="va-footer__link" href="#">Terms of Service</a></div>
              <div class="va-footer__credit"><a class="va-footer__link" href="#">Website by Studio</a></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  // Section header icon slot
  $$("[data-leaf]").forEach((el) => el.insertAdjacentHTML("afterbegin", LEAF));
  $$("[data-btn]").forEach((el) => { el.outerHTML = btn(el.dataset.btn, el.getAttribute("href") || "#", el.className); });

  // ── Cursor tag (original .cc-fac — 5vw right of and 3vh above the cursor, smoothed over 350ms, on/off .4s ease) ──
  const tagHosts = $$("[data-cursor-tag]");
  let tag = null;
  if (tagHosts.length) {
    document.body.insertAdjacentHTML("beforeend", `<div class="va-cursor" aria-hidden="true"><div class="va-cursor__wrap"><div class="va-cursor__tag"><span>${tagHosts[0].dataset.cursorTag}</span></div></div></div>`);
    tag = $(".va-cursor__tag");
  }

  // ── Lottie icons (the original is a 10fps 23-frame image-sequence Lottie — we make a line-drawing Lottie of the same length here) ──
  const P = (pts, closed = false) => ({ ty: "sh", ks: { a: 0, k: { c: closed, v: pts.map((p) => p.slice(0, 2)), i: pts.map((p) => p[2] || [0, 0]), o: pts.map((p) => p[3] || [0, 0]) } } });
  const E = (x, y, w, h) => ({ ty: "el", p: { a: 0, k: [x, y] }, s: { a: 0, k: [w, h] } });
  const SHAPES = {
    figure: [E(41, 13, 10, 10), P([[41, 20], [41, 54]]), P([[20, 22], [41, 34], [62, 22]]), P([[41, 54], [29, 75]]), P([[41, 54], [53, 75]])],
    leaf: [P([[41, 8, [0, 0], [-22, 14]], [41, 74, [-22, -14], [22, -14]], [41, 8, [22, 14], [0, 0]]], true), P([[41, 18], [41, 74]]), P([[41, 40], [28, 30]]), P([[41, 52], [54, 42]])],
    globe: [E(41, 41, 58, 58), E(41, 41, 22, 58), P([[12, 41], [70, 41]]), P([[17, 27], [65, 27]]), P([[17, 55], [65, 55]])],
    drop: [P([[41, 8, [0, 0], [-6, 14]], [20, 50, [0, -14], [0, 13]], [41, 72, [-12, 0], [12, 0]], [62, 50, [0, 13], [0, -14]], [41, 8, [6, 14], [0, 0]]], true), P([[30, 52, [0, 0], [0, 7]], [40, 62, [-6, 0], [0, 0]]])],
    book: [P([[10, 18], [41, 24], [72, 18], [72, 64], [41, 70], [10, 64]], true), P([[41, 24], [41, 70]]), P([[18, 32], [34, 35]]), P([[48, 35], [64, 32]])],
    bowl: [P([[8, 40], [74, 40]]), P([[12, 40, [0, 0], [2, 18]], [41, 68, [-18, 0], [18, 0]], [70, 40, [-2, 18], [0, 0]]]), P([[46, 38], [64, 12]]), E(66, 10, 6, 6)],
  };
  const lottieJSON = (kind, rgb) => ({
    v: "5.7.0", fr: 10, ip: 0, op: 23, w: 82, h: 82, nm: kind, ddd: 0, assets: [],
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: kind, sr: 1, ao: 0, ip: 0, op: 23, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [41, 41, 0] }, a: { a: 0, k: [41, 41, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [
        { ty: "gr", it: [...SHAPES[kind], { ty: "st", c: { a: 0, k: [...rgb, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 1.6 }, lc: 2, lj: 2 }, { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] },
        { ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 0, s: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } }, { t: 22, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
      ],
    }],
  });
  const rgbOf = (el) => (getComputedStyle(el).color.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((v) => +v / 255);
  const lotties = new Map();
  $$("[data-lottie]").forEach((el) => {
    if (!window.lottie) return;
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: lottieJSON(el.dataset.lottie, rgbOf(el)) });
    lotties.set(el, anim);
    if (reduce) anim.goToAndStop(22, true);
  });
  const playLottie = (el, dur, to = 0.97) => {
    const anim = lotties.get(el);
    if (!anim) return null;
    const o = { f: 0 };
    return gsap.to(o, { f: 22 * to, duration: dur, ease: "none", onUpdate: () => anim.goToAndStop(o.f, true) });
  };

  // ── Same-shaped picture icons (static) ──
  $$("[data-icon]").forEach((el) => {
    const s = SHAPES[el.dataset.icon];
    if (!s) return;
    el.innerHTML = `<svg viewBox="0 0 82 82" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${s.map((sh) => {
      if (sh.ty === "el") return `<ellipse cx="${sh.p.k[0]}" cy="${sh.p.k[1]}" rx="${sh.s.k[0] / 2}" ry="${sh.s.k[1] / 2}"/>`;
      const { v, i, o, c } = sh.ks.k;
      let d = `M${v[0]}`;
      for (let k = 1; k < v.length; k++) d += ` C${v[k - 1][0] + o[k - 1][0]},${v[k - 1][1] + o[k - 1][1]} ${v[k][0] + i[k][0]},${v[k][1] + i[k][1]} ${v[k]}`;
      return `<path d="${d}${c ? "Z" : ""}"/>`;
    }).join("")}</svg>`;
  });

  // ── Video: load at two screens ahead (original custom-video top 200%) ──
  const lazyVideos = $$("video[data-src]");

  // ── Phone menu (original a-9/a-10 — from -110% above in .25s ease) ──
  const menu = $(".va-menu");
  const openBtn = $(".va-nav__in > .va-menu-btn");
  if (menu && openBtn) {
    const open = () => {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      gsap.fromTo(menu, { yPercent: -110 }, { yPercent: 0, duration: reduce ? 0 : 0.25, ease: "power1.inOut" });
    };
    const close = () => {
      openBtn.setAttribute("aria-expanded", "false");
      gsap.to(menu, { yPercent: -110, duration: reduce ? 0 : 0.25, ease: "power1.inOut", onComplete: () => { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); } });
    };
    openBtn.addEventListener("click", open);
    $("[data-close]", menu).addEventListener("click", close);
    $$("a", menu).forEach((a) => a.addEventListener("click", close));
  }

  // ── Accordion (original faq-trigger — one at a time, .6s power2.inOut, opens to a dark green panel) ──
  const faqs = $$(".va-faq__item");
  const setFaq = (item, on, dur) => {
    const body = $(".va-faq__body", item), space = $(".va-faq__space", item), vert = $(".va-faq__plus i + i", item);
    item.classList.toggle("is-open", on);
    $(".va-faq__head", item).setAttribute("aria-expanded", on);
    let h = 0;
    if (on) { gsap.set(body, { height: "auto" }); h = body.offsetHeight; gsap.set(body, { height: 0 }); }
    const ease = "power2.inOut";
    gsap.to(body, { height: h, duration: dur, ease });
    gsap.to(space, { height: on ? "2.5em" : 0, duration: dur, ease });
    gsap.to(vert, { opacity: on ? 0 : 1, duration: dur, ease });
    gsap.to(item, { backgroundColor: on ? cssVar("--site-green") : cssVar("--kf-surface"), color: on ? cssVar("--site-paper") : cssVar("--kf-ink"), duration: dur, ease });
  };
  faqs.forEach((item) => {
    $(".va-faq__head", item).addEventListener("click", () => {
      const on = !item.classList.contains("is-open");
      faqs.forEach((o) => o !== item && o.classList.contains("is-open") && setFaq(o, false, reduce ? 0 : 0.6));
      setFaq(item, on, reduce ? 0 : 0.6);
    });
  });

  // ── Journal slider (swiper 11.2.10 — original settings as is) ──
  $$(".va-slider .swiper").forEach((el) => {
    if (!window.Swiper) return;
    const host = el.closest(".va-slider");
    new Swiper(el, {
      slidesPerView: "auto", spaceBetween: 20, loop: true, speed: 900,
      autoplay: reduce ? false : { delay: 2000 },
      navigation: { nextEl: $(".va-arrow.is-next", host), prevEl: $(".va-arrow.is-prev", host) },
    });
  });

  // ── Glass panel window (original fay-mask — a blurred panel open only at the top of the right column) ──
  const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  const cutWindow = (panel) => {
    const glass = $(".va-fay__glass", panel), right = $(".va-fay__right", panel), win = $(".va-fay__window", panel);
    if (!glass || !right) return;
    const pr = panel.getBoundingClientRect(), rr2 = right.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(panel).fontSize);
    const R = em;
    if (innerWidth <= 479) { glass.style.clipPath = ""; return; }
    const pad = parseFloat(getComputedStyle(panel).paddingTop);
    const x = rr2.left - pr.left, y = pad, w = rr2.width, h = parseFloat(getComputedStyle(right).paddingTop) - .25 * em;
    glass.style.clipPath = `path(evenodd, "${rr(0, 0, pr.width, pr.height, R)} ${rr(x, y, w, h, .75 * em)}")`;
    if (win) Object.assign(win.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
  };
  const panels = $$(".va-fay__panel");
  if (panels.length) {
    const ro = new ResizeObserver(() => panels.forEach(cutWindow));
    panels.forEach((p) => ro.observe(p));
  }

  // ── Motion ──
  const start = () => {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    let lenis = null;
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ duration: 2.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 0.5, touchMultiplier: 2 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"], a[href*=".html#"]').forEach((a) => a.addEventListener("click", (e) => {
        const [file, hash] = a.getAttribute("href").split("#");
        if (!hash || (file && !location.pathname.endsWith(file))) return;
        const t = document.getElementById(hash);
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); }
      }));
    }

    lazyVideos.forEach((v) => ScrollTrigger.create({ trigger: v, start: "top 200%", once: true, onEnter: () => { v.src = v.dataset.src; v.load(); v.play().catch(() => {}); } }));

    const splitLines = (el) => new SplitText(el, { type: "lines", linesClass: "va-line" }).lines;
    const mm = gsap.matchMedia();

    // Fully visible state — reduced-motion setting
    if (reduce) {
      gsap.set("[data-a], .va-nav, .va-hero__bg, .va-hero__h1, .va-stat, .va-hero__sub > *, .va-inc__item", { autoAlpha: 1, clearProps: "transform" });
      $$(".va-hwj__step").forEach((s) => s.classList.add("is-active"));
      $$(".va-thumbs__pic")[0]?.classList.add("is-active");
      return;
    }

    // Hero opens (original t-4d8bf4fc)
    const hero = $(".va-hero");
    const tl = gsap.timeline();
    // Pages with no hero, like a single post, have no motion on load in the original either
    if (hero) tl.fromTo(".va-nav", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "sine.out" }, 0.1);
    else gsap.set(".va-nav", { opacity: 1 });
    if (hero) {
      tl.fromTo(".va-hero__bg", { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1, ease: "sine.out" }, 0);
      const h1 = $(".va-hero__h1");
      if (h1) { gsap.set(h1, { autoAlpha: 1 }); tl.from(splitLines(h1), { opacity: 0, y: "50%", duration: 0.6, stagger: 0.15 }, 0.5); }
      const rise = [...$$(".va-hero .va-stat"), ...$$(".va-hero__sub > .va-btn")];
      gsap.set(rise, { autoAlpha: 1 });
      tl.from(rise, { opacity: 0, yPercent: 50, duration: 0.7, stagger: 0.1, ease: "power3.inOut" }, 0.7);
      const subs = $$(".va-hero__sub > p");
      gsap.set(subs, { autoAlpha: 1 });
      const subLines = subs.flatMap(splitLines);
      tl.from(subLines, { opacity: 0, y: "100%", duration: 0.6, stagger: 0.05 }, 1);
      $$(".va-hero [data-lottie]").forEach((el, i) => { const t = playLottie(el, [2.23, 2.42, 2.42][i] || 2.42); if (t) tl.add(t, 0.5 + i * 0.1); });
    }

    // Reveal (original [animate=*])
    // Original IX3 changes only opacity — even while hidden, hovering still works (visibility is not hidden)
    $$('[data-a="fadein"]').forEach((el) => { gsap.set(el, { visibility: "visible" }); gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "sine.out", scrollTrigger: { trigger: el, start: "top 75%" } }); });
    // Line breaks of the lower sections are re-split even if the font arrives late (autoSplit — re-splitting also re-attaches the motion)
    const splitRise = (el, vars, start) => {
      gsap.set(el, { autoAlpha: 1 });
      SplitText.create(el, { type: "lines", linesClass: "va-line", autoSplit: true, onSplit: (self) => gsap.from(self.lines, { ...vars, scrollTrigger: { trigger: el, start } }) });
    };
    $$('[data-a="title"]').forEach((el) => splitRise(el, { opacity: 0, y: "50%", duration: 0.6, stagger: 0.1 }, "top 75%"));
    $$('[data-a="lines"]').forEach((el) => splitRise(el, { opacity: 0, y: "100%", duration: 0.9, stagger: 0.1 }, "top 80%"));
    $$('[data-a="words"]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 });
      const words = new SplitText(el, { type: "words" }).words;
      gsap.fromTo(words, { opacity: 0.3 }, { opacity: 1, duration: 1, stagger: 0.35, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: 0.8 } });
    });
    // Card groups turn on in sequence (original t-f96105f7·t-0e8f1f00 — .9s power2.out, .15 gap)
    $$('[data-a="stagger"]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(el.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%" } });
    });
    // Section head line dotted 0→100% (original t-14bfcd62 · 1s)
    $$(".va-sec-title, .va-steptitle").forEach((row) => {
      const line = $(".va-sec-title__line", row);
      if (line) gsap.fromTo(line, { width: "0%" }, { width: "100%", duration: 1, scrollTrigger: { trigger: row, start: "top 75%" } });
    });

    mm.add({ d: "(min-width: 480px)", m: "(max-width: 479px)" }, (ctx) => {
      const { d } = ctx.conditions;
      // Slides up (original slideup — large screen yPercent 50 power1.out, phone y 5em)
      $$('[data-a="slideup"]').forEach((el) => {
        const tl2 = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%" } });
        tl2.fromTo(el, d ? { autoAlpha: 0, yPercent: 50 } : { autoAlpha: 0, y: "5em" }, { autoAlpha: 1, yPercent: 0, y: 0, duration: 0.9, ease: "power1.out" });
        const bl = $$("[data-border-h]", el);
        if (bl.length) tl2.fromTo(bl, { width: "0%" }, { width: "100%", duration: 0.9 }, 0.1);
      });

      if (hero) {
        const pin = $(".va-hero-pin");
        if (d) gsap.fromTo(hero, { y: 0 }, { y: "-20em", ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: "center top", scrub: 0.8 } });
        else {
          gsap.fromTo(hero, { y: 0 }, { y: "10em", ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: "center top", scrub: 0.8 } });
          gsap.fromTo(".va-hero__sub", { y: 0 }, { y: "-5em", ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: "center top", scrub: 0.8 } });
        }
      }

      // Footer (original t-24fbc84e·t-5c7a5312 — large screens only)
      const fs = $(".va-footer__sec");
      if (fs && d) {
        gsap.fromTo(fs, { y: "-15em" }, { y: 0, ease: "none", scrollTrigger: { trigger: ".va-footer", start: "top bottom", end: "top 30%", scrub: 0.5 } });
        gsap.fromTo(".va-footer__bg > *", { y: 0 }, { y: "15em", ease: "none", scrollTrigger: { trigger: ".va-footer", start: "top bottom", end: "bottom top", scrub: 0.5 } });
      }

      // Phone header bar — hides on scroll down and shows on scroll up (original .4s power2.out)
      if (!d) {
        const nav = $(".va-nav");
        ScrollTrigger.create({ start: "top top", end: "max", onUpdate: (self) => {
          if (self.direction === 1 && self.scroll() > 50) gsap.to(nav, { yPercent: -105, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          else if (self.direction === -1) gsap.to(nav, { yPercent: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        } });
        // Trust strip (original scroll-line 10s)
        $$(".va-strip").forEach((w) => {
          const line = $(".va-strip__line", w), first = $(".va-strip__block", w);
          if (line && first) gsap.to(line, { x: () => -first.offsetWidth, duration: 10, ease: "none", repeat: -1 });
        });
      }
      // Journey steps (original t-3e01cce3 · t-7c55c4ab · t-4ac6d18e + step-switching script — large screens only)
      if (d) $$(".va-hwj").forEach((sec) => {
        const pics = $$(".va-hwj-pic", sec), steps = $$(".va-hwj__step", sec), thumbs = $$(".va-thumbs__pic", sec);
        const title = $("[data-thumb-title]", sec), index = $("[data-step-index]", sec);
        const names = (title?.dataset.titles || "").split("|");
        const labels = $$(".va-story-label", sec);
        const mark = (k) => labels.forEach((l, j) => l.classList.toggle("is-active", j === k));
        pics.forEach((pic, i) => {
          const clip = $(".va-hwj-pic__clip", pic), img = $(".va-hwj-pic__img", pic), frame = $(".va-hwj-pic__frame", pic);
          const w = clip.offsetWidth, h = clip.offsetHeight;
          const open = gsap.timeline({ scrollTrigger: { trigger: pic, start: "top 80%" } });
          open.fromTo(clip, { width: "10em", height: "10em" }, { width: w, height: h, duration: 0.8 }, 0)
            .fromTo(img, { scale: 1.1 }, { scale: 1, duration: 0.6 }, 0.2);
          if (frame) open.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "sine.out" }, 0.6);
          gsap.fromTo(img, { y: "-6.25em" }, { y: "6.25em", ease: "none", immediateRender: false, scrollTrigger: { trigger: pic, start: "top bottom", end: "bottom top", scrub: 0.8 } });
          const on = (k) => {
            steps[k]?.classList.add("is-active"); thumbs[k]?.classList.add("is-active");
            if (title && names[k]) title.textContent = names[k];
            if (index) index.textContent = k + 1;
            mark(k);
          };
          ScrollTrigger.create({ trigger: pic, start: "top 75%", end: "bottom 50%", onEnter: () => on(i), onEnterBack: () => on(i), onLeaveBack: () => {
            if (!i) return;
            steps[i]?.classList.remove("is-active"); thumbs[i]?.classList.remove("is-active");
            if (title && names[i - 1]) title.textContent = names[i - 1];
            if (index) index.textContent = i;
            mark(i - 1);
          } });
        });
        const bar = $(".va-hwj__progress", sec);
        if (bar) gsap.fromTo(bar, { height: "0%" }, { height: "100%", ease: "none", scrollTrigger: { trigger: $(".va-hwj__pics", sec), start: "top 65%", end: "bottom 90%", scrub: 0.8 } });
      });

      return () => { if (!d) gsap.set(".va-nav", { yPercent: 0 }); };
    });

    // Full-bleed parallax section (original t-f2d11443)
    $$(".va-full").forEach((sec) => gsap.fromTo($(".va-full__bg > *", sec), { y: "-25vh" }, { y: "25vh", ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.5 } }));

    // Focus card photo 1.1→1 (original t-60154e10 · .4s)
    $$(".va-fa-card").forEach((c) => gsap.fromTo($(".va-fill > .wf-img", c), { scale: 1.1 }, { scale: 1, duration: 0.4, scrollTrigger: { trigger: c, start: "top 75%" } }));

    // Cursor tag follows
    if (tag && matchMedia("(hover: hover)").matches) {
      // Original IX3 mouse-move: x -45vw→55vw · y -53vh→47vh as a share of the cursor, smoothness 350
      const xTo = gsap.quickTo(tag, "x", { duration: 0.35, ease: "power2.out" });
      const yTo = gsap.quickTo(tag, "y", { duration: 0.35, ease: "power2.out" });
      addEventListener("pointermove", (e) => {
        xTo(innerWidth * (-0.45 + e.clientX / innerWidth));
        yTo(innerHeight * (-0.53 + e.clientY / innerHeight));
      });
      tagHosts.forEach((h) => {
        h.addEventListener("pointerenter", () => { tag.style.opacity = 1; });
        h.addEventListener("pointerleave", () => { tag.style.opacity = 0; });
      });
    }

    // Four-cell About (original t-ca58c605 — from 8em below in 1s power2.out at .15 intervals, vertical dotted line 0→100% after .3s, icon 2.2s)
    $$(".va-inc").forEach((g) => {
      const items = $$(".va-inc__item", g), borders = items.map((i) => $(":scope > i", i)).filter(Boolean);
      const t3 = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 80%" } });
      t3.fromTo(items, { autoAlpha: 0, y: "8em" }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: "power2.out" }, 0);
      if (borders.length) t3.fromTo(borders, { height: "0%" }, { height: "100%", duration: 1, stagger: 0.1 }, 0.3);
      $$("[data-lottie]", g).forEach((el) => { const t = playLottie(el, 2.2, 1); if (t) t3.add(t, 0); });
    });

    document.dispatchEvent(new CustomEvent("va:ready", { detail: { mm, splitLines, playLottie, lenis } }));
    ScrollTrigger.refresh();
  };

  // Waiting for fonts delays the hero opening versus the original (IX3 starts immediately) — start immediately, and the lower section lines are re-split by autoSplit
  start();
})();
