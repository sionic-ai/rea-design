// So that all pages use the same side panel, footer, loader and page transition, the markup is drawn in once here.
// Page transitions use the same swup 4.8.2 (+ js·head plugins) as the original, swapping only #content — page scripts are in rgPages.<Name> = (root) => If registered as Detach
// Attached and removed on first load and on every transition. As in the original, the job detail page skips swup and goes over as a full document.
(() => {
  window.rgPages = window.rgPages || {};
  const contentEl = () => document.getElementById("content");
  const pageOf = () => contentEl()?.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("no-motion");
  gsap.registerPlugin(ScrollTrigger);

  const ICON = {
    ext: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 1.5H1.5v7h7V6M6 1.5h2.5V4M8.5 1.5 4.5 5.5"/></svg>',
    globe: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="0.9"><circle cx="6" cy="6" r="5"/><path d="M1 6h10M6 1c1.6 1.4 2.3 3.1 2.3 5S7.6 9.6 6 11C4.4 9.6 3.7 7.9 3.7 6S4.4 2.4 6 1Z"/></svg>',
    search: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7.8" cy="7.8" r="5.6"/><path d="m12 12 4.2 4.2"/></svg>',
    person: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="5.8" r="3.3"/><path d="M2.8 16.2c.7-3.2 3.1-5 6.2-5s5.5 1.8 6.2 5"/></svg>',
  };
  const LOGO = '<svg viewBox="0 0 162 36" fill="currentColor" aria-label="Logo"><rect x="0" y="2" width="16" height="16" rx="2"/><rect x="4.5" y="6.5" width="7" height="7" rx="1" style="fill:var(--panel-bg)"/><text x="22" y="16.5" style="font-family:var(--kf-font-display)" font-size="18" font-weight="600" letter-spacing="-.2">BRAND</text><text x="0" y="33" style="font-family:var(--kf-font-display)" font-size="11.2" font-weight="600" letter-spacing=".1">Your Professional Brand</text></svg>';
  const roll = (t) => `<span class="roll"><span class="roll__track"><span class="roll__line">${t}</span><span class="roll__line" aria-hidden="true">${t}</span></span></span>`;
  const NAV = [
    ["home", "index.html", "Home"],
    ["why", "index.html#why", "Why people choose us"],
    ["about", "about.html", "About · Company Info"],
    ["recruit", "recruit.html", "Job listings"],
    ["news", "news.html", "News · Column"],
    ["contact", "detail.html#entry", "Inquiry"],
    ["ext", "#", "Hiring Info", true],
  ];

  // ── Side Panel ──
  const side = document.querySelector('[data-slot="side-nav"]');
  if (side) {
    const items = NAV.map(([key, href, label, ext]) => `<li><a href="${href}" data-nav="${key}"><span>${label}${ext ? ICON.ext : ""}</span><span class="rg-nav__dot"></span></a></li>`).join("");
    const cta = `<a class="rg-cta is-1 is-roll" href="recruit.html">${roll("View job info")}<span class="rg-cta__icon">${ICON.search}</span></a>
      <a class="rg-cta is-2 is-roll" href="detail.html#entry">${roll("Apply for consultation")}<span class="rg-cta__icon">${ICON.person}</span></a>`;
    side.innerHTML = `<header class="rg-head" id="site-header">
      <div class="rg-panel">
        <div class="rg-panel__top">
          <a class="rg-logo" href="index.html">${LOGO}</a>
          <button class="rg-menu-btn" type="button" aria-expanded="false" aria-controls="rg-menu"><span class="rg-menu-btn__label"><span class="rg-menu-btn__track"><span>Menu</span><span>Close</span></span></span><span class="rg-menu-btn__dots"><i></i><i></i><i></i></span></button>
        </div>
        <div class="rg-panel__body" id="rg-menu" data-lenis-prevent>
          <span class="rg-rule"></span>
          <div class="rg-panel__inner">
            <nav class="rg-nav"><ul>${items}</ul></nav>
            <a class="rg-lang" href="#">English ${ICON.globe}</a>
          </div>
        </div>
        <div class="rg-panel__cta">${cta}</div>
      </div>
      <div class="rg-side-cta">${cta}</div>
    </header>`;
  }
  const head = document.getElementById("site-header");

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const tiles = Array.from({ length: 15 }, () => '<div class="wf-img"></div>').join("");
    foot.className = "rg-foot";
    foot.dataset.header = "black";
    foot.innerHTML = `
      <div class="rg-foot__cta" data-slot="footer-cta">
        <span class="wf-note">Consultation band · tilted photo grid (office portrait shots · dark interior · several 4:3 images) with a 96° mask</span>
        <div class="rg-foot__collage" aria-hidden="true" data-label="Office people and meeting shots in two layers (15 each) · dim interior lighting · 4:3"><div class="rg-foot__layer is-1">${tiles}</div><div class="rg-foot__layer is-2">${tiles}</div></div>
        <div class="rg-foot__cta-in">
          <div>
            <h2 class="rg-foot__cta-title">Your invitation to a consultation<br>Two-line title</h2>
            <p class="rg-foot__cta-text t-bs">Add who we counsel and our promise in two lines.<br>Your one more line here.</p>
          </div>
          <div class="rg-foot__cta-btns">
            <a class="pill is-ghost is-roll" href="detail.html#entry">${roll("Job seekers, this way")}<span class="dot-btn__icon"><span class="glow"><i></i><i></i><i></i><i></i></span><span class="dot-btn__circle"></span></span></a>
            <a class="pill is-white is-roll" href="detail.html#entry">${roll("Corporate contacts, this way")}<span class="dot-btn__icon"><span class="glow"><i></i><i></i><i></i><i></i></span><span class="dot-btn__circle"></span></span></a>
          </div>
        </div>
      </div>
      <div class="rg-foot__mid" data-slot="footer-nav">
        <div><a class="rg-foot__logo" href="index.html" style="display:block">${LOGO}</a><a class="rg-foot__lang u-ltr" href="#">English ${ICON.globe}</a></div>
        <nav class="rg-foot__nav"><ul>
          <li><a class="u-ltr" href="index.html">Home</a></li><li><a class="u-ltr" href="index.html#why">Why people choose us</a></li><li><a class="u-ltr" href="about.html">About · Company Info</a></li>
          <li><a class="u-ltr" href="#">To hiring companies</a></li><li><a class="u-ltr" href="#">Get Materials</a></li><li><a class="u-ltr" href="news.html">News · Column</a></li>
          <li><a class="u-ltr" href="#">Inquiry</a></li><li><a class="u-ltr" href="recruit.html">Job listings</a></li><li><a class="u-ltr" href="detail.html#entry">Request a consultation</a></li>
          <li><a class="u-ltr" href="#">Job info ${ICON.ext.replace("<svg", '<svg style="display:inline;width:10px;height:10px"')}</a></li><li></li><li></li>
        </ul></nav>
      </div>
      <div class="rg-foot__rows" data-slot="footer-rows">
        <div class="rg-foot__row"><span class="rg-foot__row-label">Location list label here:</span><ul><li><a class="u-ltr" href="#">Hub 1</a></li><li><a class="u-ltr" href="#">Hub 2</a></li><li><a class="u-ltr" href="#">Hub 3</a></li></ul></div>
        <div class="rg-foot__row"><span class="rg-foot__row-label">Your affiliate brand label here:</span><ul><li><a class="u-ltr" href="#">Brand One</a></li><li><a class="u-ltr" href="#">Brand Two</a></li><li><a class="u-ltr" href="#">Brand Three</a></li></ul></div>
      </div>
      <div class="rg-foot__mark" data-slot="footer-wordmark">
        <div class="rg-foot__mark-text">Brand Slogan<span class="rg-foot__mark-grad" aria-hidden="true">Brand Slogan</span></div>
      </div>
      <div class="rg-foot__bottom">
        <nav class="rg-foot__legal"><a href="terms.html">Operating rules</a><a href="#">Privacy policy</a><a href="#">Terms of Service</a><a href="#">External transfer list</a></nav>
        <span class="rg-foot__copy">© Your Professional Brand</span>
      </div>`;
  }

  // ── Footer consult band — original footerCtaParallax: two photo layers while the band passes the screen (progress = (screen height − top edge) ÷ (band height + screen height), sine in-out)
  // Pushed 100px → −100px in the 110° · −70° directions, and each frame follows by 1 − e^(−3.5·sec) of the remaining distance ──
  const ctaBox = foot && foot.querySelector(".rg-foot__cta");
  const ctaLayers = ctaBox ? [...ctaBox.querySelectorAll(".rg-foot__layer")] : [];
  if (ctaLayers.length === 2 && !reduce) {
    const dirs = [110, -70].map((a) => ({ x: Math.cos((a * Math.PI) / 180), y: -Math.sin((a * Math.PI) / 180) }));
    const target = () => {
      const r = ctaBox.getBoundingClientRect(), span = innerHeight + r.height;
      const p = span <= 0 ? 0 : Math.min(Math.max((innerHeight - r.top) / span, 0), 1);
      return 100 - 200 * (-(Math.cos(Math.PI * p) - 1) / 2);
    };
    let cur = target(), near = false;
    new IntersectionObserver(([e]) => (near = e.isIntersecting), { rootMargin: "25% 0px 25% 0px" }).observe(ctaBox);
    gsap.ticker.add((t, dtMs) => {
      if (!near) return;
      const dt = Math.min(0.05, Math.max(0, dtMs) / 1000);
      cur += (target() - cur) * (1 - Math.exp(-3.5 * dt));
      ctaLayers.forEach((l, i) => gsap.set(l, { x: cur * dirs[i].x, y: cur * dirs[i].y, force3D: true }));
    });
  }

  // Button text: data-roll is replaced with two rolling lines (only inside it, each time new body text comes in)
  const decorate = (root) => {
    root.querySelectorAll("[data-roll]").forEach((el) => {
      el.innerHTML = roll(el.innerHTML);
    });
    root.querySelectorAll("[data-dot]").forEach((el) => {
      el.insertAdjacentHTML("beforeend", '<span class="dot-btn__icon" aria-hidden="true"><span class="glow"><i></i><i></i><i></i><i></i></span><span class="glow"><i></i><i></i><i></i><i></i></span><span class="dot-btn__circle"></span></span>');
    });
    root.querySelectorAll("[data-ico]").forEach((el) => {
      el.insertAdjacentHTML("beforeend", `<span class="pill__ico">${ICON[el.dataset.ico]}</span>`);
    });
  };

  // ── Smooth scroll ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.rgLenis = lenis;

  // ── Phone menu: the panel stretches down and the nav opens ──
  const panel = head && head.querySelector(".rg-panel");
  const menuBtn = head && head.querySelector(".rg-menu-btn");
  const body = head && head.querySelector(".rg-panel__body");
  const pcta = head && head.querySelector(".rg-panel__cta");
  if (menuBtn) {
    // Original Alpine menu timeline: the panel expands from the top bar (60) to screen height in .45s power1.out, and the menu body appears .12s later over .42s.
    // On close, runs the same timeline in reverse. The Menu button turning into a black circle X is done by css (.32s)
    gsap.set(pcta, { autoAlpha: 0 });
    const tl = gsap.timeline({
      paused: true, defaults: { ease: "power1.out" },
      onReverseComplete: () => { panel.classList.remove("is-open"); head.classList.remove("is-menu"); gsap.set(panel, { clearProps: "height" }); },
    });
    // Do not paint initial values on creation — on desktop (no menu button) the panel must not collapse to 60px
    tl.fromTo(panel, { height: 60 }, { height: () => innerHeight, duration: 0.45, immediateRender: false }, 0)
      .fromTo(pcta, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.42, immediateRender: false }, 0.12);
    menuBtn.addEventListener("click", () => {
      const open = !panel.classList.contains("is-open") || tl.reversed();
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        head.classList.add("is-menu");
        panel.classList.add("is-open");
        tl.invalidate();
        reduce ? tl.progress(1) : tl.play();
      } else {
        reduce ? (tl.progress(0), tl.eventCallback("onReverseComplete")()) : tl.reverse();
      }
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  // ── Over black sections the panel turns dark ──
  const setDark = () => {
    if (!head) return;
    const probe = innerWidth >= 1024 ? innerHeight * 0.5 : 60;
    const dark = [...document.querySelectorAll('[data-header="black"]')].some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    head.classList.toggle("is-dark", dark);
  };

  // ── Page transition — original swup js plugin: the curtain (#transition-item) covers in .45s power4.out, and when the new body arrives it lifts in .7s power4.out.
  // Curtain color is #1a1a1a if the header panel is over a black stretch, otherwise #fff (original GT) ──
  const trans = document.createElement("div");
  trans.className = "rg-trans";
  trans.id = "transition-item";
  document.body.append(trans);
  const transColor = () => (head && head.classList.contains("is-dark") ? "var(--site-dark-panel)" : "var(--kf-bg)");
  const cover = () => new Promise((done) => {
    trans.style.background = transColor();
    gsap.killTweensOf(trans);
    gsap.fromTo(trans, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.45, ease: "power4.out", onComplete: done });
  });
  const uncover = () => new Promise((done) => {
    gsap.killTweensOf(trans);
    gsap.to(trans, { autoAlpha: 0, duration: reduce ? 0 : 0.7, ease: "power4.out", onComplete: done });
  });
  const samePageHash = (href) => {
    const [file, hash] = href.split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file !== here || !hash) return false;
    const t = document.getElementById(hash);
    if (t) (lenis ? lenis.scrollTo(t) : t.scrollIntoView());
    return true;
  };
  // Opened as a file, fetch is blocked so swup can’t run — cover the curtain with the same values, move on as a whole document and lift it on the next page
  const fileMode = !/^https?:$/.test(location.protocol) || !window.Swup || !window.SwupJsPlugin;
  if (fileMode) {
    const pending = sessionStorage.getItem("rg-trans");
    if (pending) {
      sessionStorage.removeItem("rg-trans");
      trans.style.background = pending;
      gsap.set(trans, { autoAlpha: 1 });
      uncover();
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!/^[a-z-]+\.html/.test(href)) return;
      e.preventDefault();
      if (samePageHash(href)) return;
      sessionStorage.setItem("rg-trans", transColor());
      cover().then(() => (location.href = href));
    });
  }

  // ── Loader: once per session. Gray text rises → black layers revealed in steps → gradient wipe → text scatters ──
  const loaded = () => {
    document.dispatchEvent(new CustomEvent("rg:loaded"));
    window.rgLoaded = true;
  };
  const runLoader = () => {
    const title = "Brand Slogan";
    const chars = [...title].map((c) => `<span class="rg-loader__char"><span>${c === " " ? "&nbsp;" : c}</span></span>`).join("");
    const el = document.createElement("div");
    el.className = "rg-loader";
    el.innerHTML = `<div class="rg-loader__bg"></div><div class="rg-loader__title"><span class="rg-loader__layer is-gray">${chars}</span><span class="rg-loader__layer is-black">${chars}</span><span class="rg-loader__layer is-grad">${chars}</span></div>`;
    document.body.append(el);
    if (lenis) lenis.stop();
    const gray = el.querySelectorAll(".is-gray .rg-loader__char > span");
    const black = el.querySelector(".is-black");
    const grad = el.querySelector(".is-grad");
    gsap.set(gray, { yPercent: 120, autoAlpha: 0 });
    const step = gsap.utils.random(60, 80);
    const tl = gsap.timeline({
      onComplete: () => {
        el.classList.add("is-done");
        if (lenis) lenis.start();
      },
    });
    // The original reverses the gray letters and raises them one by one from the last letter at 25ms intervals
    tl.to(gray, { yPercent: 0, autoAlpha: 1, duration: 0.95, stagger: { each: 0.025, from: "end" }, ease: "cubic-bezier(0.22,1,0.36,1)" })
      .to(black, { clipPath: `inset(0% ${100 - step}% 0% 0%)`, duration: 0.9, ease: "power2.out" }, "-=0.3")
      .to(black, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.out" })
      .to(grad, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power1.out" }, "+=0.08")
      .to(grad, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.4, ease: "power4.out" }, "+=0.03")
      .addLabel("exit");
    // Original: exit 1.9s power3.inOut, distance grows by square up to 18% of screen width by letter order, and fades out within the 15~55% range
    const n = el.querySelectorAll(".is-gray .rg-loader__char").length;
    const maxD = innerWidth * 0.18;
    el.querySelectorAll(".rg-loader__layer").forEach((layer) => {
      layer.querySelectorAll(".rg-loader__char > span").forEach((c, i) => {
        const k = (i - (n - 1) / 2) / ((n - 1) / 2);
        tl.to(c, { x: Math.sign(k) * Math.pow(Math.abs(k), 2) * maxD, duration: 1.9, ease: "power3.inOut" }, `exit+=${i * 0.001 + Math.pow(i, 2) * 0.0005 * 0.4}`);
      });
    });
    tl.to(el.querySelector(".rg-loader__title"), { autoAlpha: 0, duration: 1.9 * 0.4, ease: "power1.out" }, `exit+=${1.9 * 0.15}`)
      .to(el.querySelector(".rg-loader__bg"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, `exit+=${1.9 * 0.5}`)
      .add(loaded, `exit+=${1.9 * 0.55}`);
  };
  if (!reduce && document.body.hasAttribute("data-loader") && !sessionStorage.getItem("rg-loaded")) {
    sessionStorage.setItem("rg-loaded", "1");
    window.rgLoaderShown = true;
    runLoader();
  } else {
    requestAnimationFrame(loaded);
  }
  window.rgOnLoaded = (fn) => (window.rgLoaded ? fn() : document.addEventListener("rg:loaded", fn, { once: true }));

  // ── Entrance · text reveal — re-bound to the body each time it changes ──
  const common = (root) => {
  const offs = [];
  const darkST = ScrollTrigger.create({ start: 0, end: "max", onUpdate: setDark, onRefresh: setDark });
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(root.querySelectorAll("[data-rise]")).forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: +(el.dataset.rise || 0), scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // Gray→black diagonal reveal — original [data-text-clip-appear]: for each line wrapped on screen, clips and overlays a faint layer and a dark layer, with .1s between lines
    // While two layers rise from 20px left in .8s sine.out, the dark layer covers on an 8% slanted diagonal in 2.6s power4.inOut. IO bottom -25% · 15%
    // Split lines after fonts have fully loaded — when the font changes, the wrap points change
    let alive = true;
    offs.push(() => (alive = false));
    document.fonts.ready.then(() => alive && root.querySelectorAll("[data-clip-text]").forEach((el) => {
      const html = el.innerHTML.trim();
      const range = document.createRange();
      range.selectNodeContents(el);
      const box = el.getBoundingClientRect();
      const lines = [...range.getClientRects()].filter((q) => q.width > 0 && q.height > 0)
        .map((q) => ({ top: q.top - box.top, right: q.right - box.left, bottom: q.bottom - box.top, left: q.left - box.left }))
        .reduce((acc, q) => { const l = acc[acc.length - 1]; if (l && Math.abs(l.top - q.top) < 2) { l.top = Math.min(l.top, q.top); l.right = Math.max(l.right, q.right); l.bottom = Math.max(l.bottom, q.bottom); l.left = Math.min(l.left, q.left); } else acc.push({ ...q }); return acc; }, []);
      range.detach();
      const line = (l) => `<span class="clip-line" style="clip-path: inset(${l.top}px ${box.width - l.right}px ${box.height - l.bottom}px ${l.left}px)"><span class="clip-line__in">${html}</span></span>`;
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = `<span class="clip-ph" aria-hidden="true">${html}</span><span class="clip-layer clip-line__from" aria-hidden="true">${lines.map(line).join("")}</span><span class="clip-layer clip-line__to" aria-hidden="true">${lines.map(line).join("")}</span>`;
      const froms = [...el.querySelectorAll(".clip-line__from > .clip-line")], tos = [...el.querySelectorAll(".clip-line__to > .clip-line")], covers = tos.map((t) => t.firstElementChild);
      const slant = 8;
      const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
      const poly = (p) => {
        const e = clamp(p * (100 + slant * 2) - slant, -slant, 100 + slant), a = clamp(e + slant, 0, 100), b = clamp(e - slant, 0, 100);
        return a <= 0 ? "polygon(0 0, 0 0, 0 100%, 0 100%)" : b >= 100 ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)" : `polygon(0 0, ${a}% 0, ${b}% 100%, 0 100%)`;
      };
      gsap.set([...froms, ...tos], { opacity: 0, x: -20 });
      covers.forEach((c) => (c.style.clipPath = poly(0)));
      const tl = gsap.timeline({ paused: true });
      covers.forEach((c, i) => {
        const o = { p: 0 };
        tl.to([froms[i], tos[i]], { opacity: 1, x: 0, duration: 0.8, ease: "sine.out" }, i * 0.1)
          .to(o, { p: 1, duration: 2.6, ease: "power4.inOut", onUpdate: () => (c.style.clipPath = poly(o.p)) }, i * 0.1);
      });
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { tl.play(0); io.disconnect(); } }), { rootMargin: "0px 0px -25% 0px", threshold: 0.15 });
      io.observe(el);
      offs.push(() => io.disconnect());
    }));
    // Dot + line heading
    root.querySelectorAll(".line-head").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("is-in") });
    });
    // One gradient over the footer wordmark — original footerLargeTextReveal: when 15% (phone 0) enters, excluding the bottom 12% of the screen, after 1.1s,
    // The gradient turns on at .3s power2.out, sweeps from off the left edge to off the right edge in 4s power3.out, and turns off with power2.in in the last .6s
    const grad = document.querySelector(".rg-foot__mark-grad");
    if (grad) {
      let timer = 0;
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => {
          gsap.timeline()
            .set(grad, { backgroundPosition: "-100% 0" })
            .to(grad, { opacity: 1, duration: 0.3, ease: "power2.out" })
            .to(grad, { backgroundPosition: "200% 0", duration: 4, ease: "power3.out" }, 0)
            .to(grad, { opacity: 0, duration: 0.6, ease: "power2.in" }, "-=0.6");
        }, 1100);
      }), { rootMargin: "0px 0px -12% 0px", threshold: innerWidth < 768 ? 0 : 0.15 });
      io.observe(grad.parentElement);
      offs.push(() => { io.disconnect(); clearTimeout(timer); });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    root.querySelectorAll(".line-head").forEach((el) => el.classList.add("is-in"));
  });
  return () => { mm.revert(); darkST.kill(); offs.forEach((fn) => fn()); };
  };

  // ── Attaching · detaching body text ──
  let cleanups = [];
  const unmountPage = () => {
    cleanups.forEach((fn) => fn?.());
    cleanups = [];
    // The original also kills all ScrollTriggers once the exit ends
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
  const mountPage = () => {
    const root = contentEl();
    if (!root) return;
    const key = pageOf();
    head?.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === key ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    decorate(root);
    cleanups.push(common(root));
    window.rgMounts = (window.rgMounts || 0) + 1;
    const fn = window.rgPages[key];
    if (fn) cleanups.push(fn(root));
    ScrollTrigger.refresh();
  };
  const bootSwup = () => {
    const swup = new Swup({
      containers: ["#content"],
      ignoreVisit: (url, { el } = {}) => !!el && (el.closest("[data-no-swup]") || /(^|\/)detail\.html/.test(url) || el.getAttribute("href") === "#"),
      plugins: [
        new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)", out: async () => { await cover(); }, in: async () => { await uncover(); } }] }),
        ...(window.SwupHeadPlugin ? [new SwupHeadPlugin({ persistAssets: false, awaitAssets: true })] : []),
      ],
    });
    swup.hooks.on("animation:out:start", () => { if (panel?.classList.contains("is-open")) menuBtn.click(); });
    swup.hooks.on("animation:out:end", unmountPage);
    swup.hooks.on("content:replace", () => {
      lenis?.resize();
      if (!location.hash) lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
      mountPage();
    });
    swup.hooks.on("animation:in:end", () => {
      ScrollTrigger.refresh();
      lenis?.resize();
      const t = location.hash && document.getElementById(location.hash.slice(1));
      if (t) lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView();
    });
  };
  // Attached after the page scripts (rgPages) have all loaded
  const start = () => {
    mountPage();
    if (!fileMode) bootSwup();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : queueMicrotask(start);
  addEventListener("load", () => ScrollTrigger.refresh());
})();
