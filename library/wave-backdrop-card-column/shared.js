// Frame and motion shared by all pages. Original values were read from the School site bundle (SectionReveal3D·RollingNumber·RevealBand·ThumbnailCornerEffect·GsapCarousel).
(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => matchMedia("(min-width: 1024px)").matches;
  const page = document.body.dataset.page || "home";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  // Resolve skin variables (including oklch relative colors) into the 0 to 1 rgb that canvas and shaders use — paint computed-style text onto a 1-cell canvas and read it back
  const probeEl = document.createElement("i");
  probeEl.hidden = true;
  document.documentElement.append(probeEl);
  const probeCtx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  function cssRGB(name) {
    probeEl.style.color = `var(${name})`;
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = getComputedStyle(probeEl).color;
    probeCtx.fillRect(0, 0, 1, 1);
    const d = probeCtx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  const ICON = {
    arrow: '<svg class="ic-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    ext: '<svg class="ic-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="4" width="11" height="11" rx="1"/><path d="M15 15v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h4"/></svg>',
    chev: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l16 16M20 4 4 20"/></svg>',
  };

  // Only the layout of the original symbol (three big letters at top left, top right, bottom left + four English lines at bottom right) is carried over as a placeholder symbol. The letters are ours.
  // The pieces follow the original Lottie’s layer split (top letters split in two · a column growing vertically · a body sliding in from the side · four-line wipe). Coordinates are the Lottie 800 board × 457/800.
  const glyph = (x, y, len, ch) => `<text class="sym-glyph" x="${x}" y="${y}" textLength="${len}" lengthAdjust="spacingAndGlyphs">${ch}</text>`;
  const symbolSVG = (id) => {
    const clip = (n, x, y, w, h) => `<clipPath id="${id}-${n}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
    const A = glyph(59, 226, 125, "A"), B = glyph(204, 226, 132, "B"), C = glyph(69, 393, 115, "C");
    const part = (key, c, body) => `<g class="sym-part" data-part="${key}" clip-path="url(#${id}-${c})"><g class="sym-move">${body}</g></g>`;
    const flash = (x, y, s, f0, f1) => `<rect class="sym-flash" data-f="${f0} ${f1}" x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}"/>`;
    return `
    <svg viewBox="0 0 457 457" aria-hidden="true">
      <defs>${clip("at", 40, 40, 160, 104)}${clip("ab", 40, 144, 160, 100)}${clip("bl", 196, 40, 58, 200)}${clip("br", 254, 40, 110, 200)}
        ${clip("cl", 50, 220, 52, 190)}${clip("cr", 102, 220, 110, 190)}</defs>
      ${part("a-top", "at", A)}${part("a-bottom", "ab", A)}${part("b-stem", "bl", B)}${part("b-bowl", "br", B)}${part("c-stem", "cl", C)}${part("c-bowl", "cr", C)}
      ${["School Name", "Faculty of", "Placeholder Data", "and Subject"].map((t, i) => `<clipPath id="${id}-w${i}"><rect class="sym-wipe-r" x="200" y="${264 + i * 26}" width="260" height="26"/></clipPath><g class="sym-wipe" clip-path="url(#${id}-w${i})"><text class="sym-word" x="202" y="${284 + i * 26}">${t}</text></g>`).join("")}
      ${flash(71, 81, 32, 0.6, 3.6)}${flash(71, 81, 32, 4, 8)}${flash(165, 217, 39, 9.8, 12.8)}${flash(216, 217, 39, 16, 19)}${flash(165, 248, 39, 24.2, 27)}${flash(85, 384, 32, 25.4, 28.4)}
    </svg>`;
  };

  const tagsHTML = (cls) => `
    <div class="${cls}">
      <div class="${cls}__group">
        <p class="tag tag--grad"><span class="bg"></span><span class="ghost">Opened 0/0000</span><span class="solid">Opened 0/0000</span></p>
        <p class="tag" data-delay="1"><span class="bg"></span><span class="ghost">Your faculty name here</span><span class="solid">Your faculty name here</span></p>
      </div>
      <p class="tag" data-delay="2"><span class="bg"></span><span class="ghost">Your department name here</span><span class="solid">Your department name here</span></p>
    </div>`;

  const NAV = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "about.html", label: "Your faculty intro here", key: "about" },
    { href: "index.html#features", label: "Department highlights" },
    { href: "news.html", label: "News", key: "news" },
    { href: "index.html#overview", label: "Faculty Overview" },
    { href: "index.html#guide", label: "Guide booklet" },
    { href: "index.html#faq", label: "Frequently asked questions" },
  ];

  const socialHTML = (itemCls = "") => `
    <div class="social">
      <a class="social-link ${itemCls}" href="#" style="--i:1"><span class="social-ic">${ICON.cam}</span><span class="social-text">Department name · Official photo account</span></a>
      <a class="social-link ${itemCls}" href="#" style="--i:1"><span class="social-ic">${ICON.x}</span><span class="social-text">Department name · Official short-post account</span></a>
    </div>`;

  function buildChrome() {
    const bg = $('[data-slot="bg"]');
    if (bg) bg.innerHTML = '<canvas class="bgfx__canvas"></canvas><div class="bgfx__overlay"></div>';

    const hero = $('[data-slot="pc-hero"]');
    if (hero) hero.innerHTML = `<span class="wf-note">PC fixed symbol · Lottie 3s after 1s · tag peels off at 2.1s in .3/.4/.4s</span>
      <div class="symbol">${symbolSVG("pcs")}</div>${tagsHTML("tags")}
      <a class="cta-pill" href="${page === "home" ? "#news" : "news.html"}">Latest News ${ICON.down}</a>`;

    $$(".symbol:empty").forEach((el, i) => (el.innerHTML = symbolSVG("sym" + i)));
    $$(".hero-info:empty").forEach((el) => (el.outerHTML = tagsHTML("hero-info")));

    const header = $('[data-slot="header"]');
    if (header) {
      header.className = "header";
      header.innerHTML = `<a class="header__logo" href="index.html" aria-label="Home"><small>Your slogan here</small>
        <b><svg viewBox="0 0 34 18"><ellipse cx="17" cy="9" rx="15" ry="7" fill="none" style="stroke: var(--kf-accent)" stroke-width="3.2"/></svg>School Logo</b></a>
        <button class="menu-btn" type="button" aria-label="Open Menu" aria-expanded="false"><span class="ham"><i></i><i></i><i></i><i></i></span></button>`;
    }

    const menu = $('[data-slot="app-menu"]');
    if (menu) {
      menu.className = "app-menu";
      let i = 0;
      menu.innerHTML = `<div class="app-menu__content">
        <nav class="app-menu__nav">${NAV.map((n) => `<a class="menu-link menu-item" style="--i:${i++}" href="${n.href}"${n.key === page ? ' aria-current="page"' : ""}><span>${n.label}</span>${ICON.chev}</a>`).join("")}</nav>
        <div class="app-menu__ext">
          <a class="ext-link ext-link--primary menu-item" style="--i:${i++}" href="#"><span>Admissions Info</span>${ICON.ext}</a>
          <a class="ext-link menu-item" style="--i:${i++}" href="#"><span>Your university official site here</span>${ICON.ext}</a>
        </div>
        <div class="social">${socialHTML("menu-item").match(/<a [\s\S]*?<\/a>/g).map((a) => a.replace('style="--i:1"', `style="--i:${i++}"`)).join("")}</div>
      </div>`;
    }

    const rail = $('[data-slot="rail"]');
    if (rail) {
      rail.className = "rail";
      rail.innerHTML = `<div class="rail__nav"></div><button class="page-top is-hidden" type="button" aria-label="Back to top">${ICON.up}</button>`;
      const nav = $(".rail__nav", rail);
      // Original subpages have no table-of-contents ticks, only a back-to-top button
      $$(page === "home" ? "[data-rail]" : "[data-rail-none]").forEach((sec, n) => {
        const b = document.createElement("button");
        b.className = "indicator";
        b.type = "button";
        b.dataset.title = sec.dataset.rail;
        b.setAttribute("aria-label", sec.dataset.rail);
        b.innerHTML = "<i></i>";
        b.addEventListener("click", () => scrollToEl(sec));
        nav.append(b);
        ScrollTrigger.create({
          trigger: sec, start: "top 50%", end: "bottom 50%",
          onToggle: (st) => { if (st.isActive) { $$(".indicator", nav).forEach((x) => x.classList.remove("is-current")); b.classList.add("is-current"); } },
        });
        if (n === 0) b.classList.add("is-current");
      });
    }

    const footer = $('[data-slot="footer"]');
    if (footer) {
      footer.className = "footer";
      footer.innerHTML = `<div class="footer__main"><div class="footer__container">
          ${socialHTML("f-item").replace(/style="--i:1"/g, 'style="--i:1"')}
          <p class="footer__copy f-item" style="--i:2">Copyright © Your copyright notice here. All Rights Reserved.</p>
        </div>
        <div class="footer__deco f-item" style="--i:3"><svg viewBox="0 0 560 210" aria-hidden="true">
          <text x="0" y="200">A</text><text x="188" y="200">B</text><text x="380" y="200">C</text></svg></div>
      </div>`;
    }
  }

  // ── Scroll · back to top · hide header band ──
  let lenis = null;
  function scrollToEl(el) {
    const y = typeof el === "number" ? el : el.getBoundingClientRect().top + scrollY - (isPC() ? 8 : 88);
    if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  function initScroll() {
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    const header = $(".header");
    const tops = $$(".page-top");
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      const past = y > innerHeight;
      tops.forEach((t) => t.classList.toggle("is-hidden", !past));
      if (header) header.classList.toggle("is-hide", y > last && y > 120 && !$(".app-menu.is-open"));
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    tops.forEach((t) => t.addEventListener("click", () => scrollToEl(0)));
    $$('a[href^="#"], a[href^="index.html#"]').forEach((a) => {
      const hash = a.getAttribute("href").split("#")[1];
      if (!hash || (a.getAttribute("href").startsWith("index.html") && page !== "home")) return;
      a.addEventListener("click", (e) => {
        const t = document.getElementById(hash);
        if (!t) return;
        e.preventDefault();
        closeMenu();
        scrollToEl(t);
      });
    });
  }

  // ── Menu Drawer ──
  function closeMenu() {
    const m = $(".app-menu"), b = $(".menu-btn");
    if (!m || !m.classList.contains("is-open")) return;
    m.classList.remove("is-open"); b.classList.remove("is-open"); b.setAttribute("aria-expanded", "false");
    lenis?.start();
  }
  function initMenu() {
    const m = $(".app-menu"), b = $(".menu-btn");
    if (!m || !b) return;
    b.addEventListener("click", () => {
      if (m.classList.contains("is-open")) return closeMenu();
      m.classList.add("is-open"); b.classList.add("is-open"); b.setAttribute("aria-expanded", "true");
      if (!isPC()) lenis?.stop();
    });
    addEventListener("keydown", (e) => e.key === "Escape" && (closeMenu(), closeModals()));
  }

  // ── Symbol: original Lottie (30fps·90 frames = 3s) plays after 1s, the tag comes off at 70% of the length (2.1s), and when it ends it switches to the logo.
  // Frames and curves were read from the Lottie layer’s ip and keyframes (o/i) ──
  const cb = (name, d) => CustomEase.create(name, d);
  const F = (f) => f / 30;
  function playSymbol(s) {
    const tl = gsap.timeline({ onComplete: () => s.classList.add("is-completed") });
    const part = (k) => $(`[data-part="${k}"]`, s), move = (k) => $(`[data-part="${k}"] .sym-move`, s);
    const show = (k, f) => tl.set(part(k), { visibility: "visible" }, F(f));
    $$(".sym-flash", s).forEach((r) => {
      const [a, b] = r.dataset.f.split(" ").map(Number);
      tl.set(r, { opacity: 1 }, F(a)).set(r, { opacity: 0 }, F(b));
    });
    show("a-top", 11); show("a-bottom", 14);
    tl.fromTo(move("a-top"), { x: -10.85 }, { x: 0, duration: F(37), ease: cb("sdbSlide", "0.167,0,0.34,1") }, F(23));
    show("b-stem", 21);
    tl.fromTo(move("b-stem"), { scaleY: 0.3 }, { scaleY: 1, transformOrigin: "50% 50%", duration: F(18), ease: cb("sdbStem", "0.14,1,0.34,1") }, F(21));
    show("b-bowl", 24);
    tl.fromTo(move("b-bowl"), { x: 17.1 }, { x: 0, duration: F(16), ease: cb("sdbBowl", "0.14,0.667,0.34,1") }, F(24));
    show("c-stem", 27);
    tl.fromTo(move("c-stem"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 50%", duration: F(14.4), ease: cb("sdbSnap", "0.9,0,0.1,1") }, F(27));
    show("c-bowl", 29);
    tl.fromTo(move("c-bowl"), { x: -11.4, y: -11.4 }, { x: 0, y: 0, duration: F(10.8), ease: "sdbSnap" }, F(30.5));
    tl.set($$(".sym-wipe", s), { visibility: "visible" }, F(52));
    tl.fromTo($$(".sym-wipe-r", s), { attr: { width: 0 } }, { attr: { width: 260 }, duration: F(12.6), ease: "sdbStem" }, F(52));
    tl.set({}, {}, F(90) + 0.05);
    return tl;
  }
  function initSymbols() {
    const syms = $$(".symbol"), tags = $$(".tags, .hero-info");
    if (reduce || !window.CustomEase) {
      syms.forEach((s) => s.classList.add("is-completed"));
      tags.forEach((t) => t.classList.add("is-animating"));
      return;
    }
    gsap.registerPlugin(CustomEase);
    setTimeout(() => {
      syms.forEach(playSymbol);
      setTimeout(() => {
        tags.forEach((t) => t.classList.add("is-animating"));
        doc.classList.add("hero-info-started");
        document.dispatchEvent(new CustomEvent("sdb:hero-info"));
      }, F(90) * 0.7 * 1000);
    }, 1000);
  }

  // ── Card 3D tilt: the farther out of the 40~60% band of the screen, up to y150·rotX(-2~8)·rotY(-5~-7.5) ──
  const arrived = sessionStorage.getItem("sdb:nav") === "1";
  sessionStorage.removeItem("sdb:nav");
  function initReveal3D() {
    const C = { centerStart: 0.4, centerEnd: 0.6, durMin: 0.1, durMax: 0.6, y: 150 };
    const rnd = (a, b) => Math.random() * (b - a) + a;
    const prog = (top, bottom) => {
      if (top > C.centerEnd) return Math.min(1, (top - C.centerEnd) / (1 - C.centerEnd));
      if (top <= C.centerEnd && bottom >= C.centerStart) return 0;
      if (bottom < C.centerStart) return -Math.min(1, (C.centerStart - bottom) / C.centerStart);
      return 0;
    };
    $$(".r3d").forEach((wrap) => {
      const content = $(".r3d__content", wrap);
      if (!content || reduce) return;
      const rx = rnd(-2, 8), ry = rnd(10, 15);
      let active = false, tw = null;
      const update = () => {
        if (!active) return;
        const r = wrap.getBoundingClientRect();
        const o = prog(r.top / innerHeight, r.bottom / innerHeight);
        tw?.kill();
        tw = gsap.to(content, { y: o * C.y, rotateX: o * rx, rotateY: -o * ry * 0.5, duration: C.durMin + (1 - Math.abs(o)) * (C.durMax - C.durMin), ease: "power2.out" });
      };
      const start = () => {
        const st = ScrollTrigger.create({ trigger: wrap, start: "top bottom+=300", end: "bottom top-=300",
          onUpdate: update, onEnter: () => { active = true; update(); }, onLeave: () => (active = false),
          onEnterBack: () => { active = true; update(); }, onLeaveBack: () => (active = false) });
        active = st.isActive;
        update();
      };
      // In the original, on first load the cards stand in place, and only when coming from another page do the on-screen cards rise .5s late, from below and tilted
      const r = wrap.getBoundingClientRect();
      if (arrived && r.top < innerHeight && r.bottom > 0) {
        gsap.set(content, { y: C.y, rotateX: rx, rotateY: -ry * 0.5, opacity: 0 });
        gsap.to(content, { y: 0, rotateX: 0, rotateY: 0, opacity: 1, duration: C.durMax, ease: "power2.out", delay: 0.5, onComplete: start });
      } else start();
    });
  }

  // ── Rolling number + gray→dark English title: once when the title line is 10% visible ──
  // Original RollingNumber: normal .8s · .1s per digit, fast (News date) .35s · .02s. Non-digit characters (dots) light up late by the number of preceding digits, over .15s
  const ROLL = { normal: [0.8, 0.1], fast: [0.35, 0.02] };
  function buildRolling(el) {
    const val = el.textContent.trim();
    el.textContent = "";
    el.classList.add("rolling");
    el.setAttribute("aria-label", val);
    [...val].forEach((d) => {
      const s = document.createElement("span");
      if (/\d/.test(d)) {
        s.className = "rolling-digit";
        s.innerHTML = `<span class="rolling-digit-inner">${Array.from({ length: 11 }, (_, k) => `<span>${k % 10}</span>`).join("")}</span>`;
        s.dataset.d = d;
      } else {
        s.className = "rolling-sep";
        s.textContent = d;
      }
      el.append(s);
    });
  }
  function playRolling(el, speed = "normal") {
    const [dur, gap] = ROLL[speed];
    let n = 0;
    [...el.children].forEach((s) => {
      if (s.classList.contains("rolling-sep")) return gsap.to(s, { opacity: 1, duration: 0.15, delay: n * gap });
      gsap.to(s, { opacity: 1, duration: 0.15, delay: n * gap });
      gsap.to($(".rolling-digit-inner", s), { yPercent: -parseInt(s.dataset.d, 10) * (100 / 11), duration: dur, ease: "expo.out", delay: n * gap });
      n++;
    });
  }
  function buildBand(el) {
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map((t) => { const d = document.createElement("div"); d.innerHTML = t; return d.textContent; });
    el.setAttribute("aria-label", lines.join(" "));
    el.classList.add("reveal-band");
    const chars = (t) => [...t].map((c) => `<span class="ch">${c}</span>`).join("");
    el.innerHTML = lines.map((t) => `<span class="line" aria-hidden="true"><span class="gray">${chars(t)}</span><span class="over">${chars(t)}</span></span>`).join("");
  }
  function playBand(el, delay) {
    const tl = gsap.timeline({ delay });
    $$(".line", el).forEach((line, g) => {
      const l = g * 0.1;
      $$(".gray .ch", line).forEach((c, s) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "expo.out" }, l + s * 0.03));
      $$(".over .ch", line).forEach((c, s) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "expo.out" }, l + 0.12 + s * 0.03));
    });
  }
  function initTitles() {
    $$(".cs__title2").forEach((t2) => {
      const num = $(".cs__num", t2), en = $(".cs__en", t2);
      if (num) buildRolling(num);
      if (en) buildBand(en);
      if (reduce) { num && $$(".rolling-digit", num).forEach((s) => gsap.set($(".rolling-digit-inner", s), { yPercent: -parseInt(s.dataset.d, 10) * (100 / 11) })); return; }
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        num && playRolling(num);
        en && playBand(en, num ? 0.5 : 0);
      }, { threshold: 0.1 });
      io.observe(t2);
    });
  }

  // ── White block at photo corner: block=Short side 10% · threshold 1→0 · corner 0→0.5 · 1s power2.out · time .016/frame × speed .3 ──
  // The original shader draws 3D simplex noise from cell coordinates (integers) and time, then compares it to a threshold. Each cell holds one value, so painting the same formula per cell on a canvas gives the same screen
  const G3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  const perm = new Uint8Array(512);
  { const p = Array.from({ length: 256 }, (_, i) => i); for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
  function noise3(x, y, z) {
    const F = 1 / 3, Gs = 1 / 6, s = (x + y + z) * F;
    const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s), t = (i + j + k) * Gs;
    const x0 = x - i + t, y0 = y - j + t, z0 = z - k + t;
    const [i1, j1, k1, i2, j2, k2] = x0 >= y0
      ? (y0 >= z0 ? [1, 0, 0, 1, 1, 0] : x0 >= z0 ? [1, 0, 0, 1, 0, 1] : [0, 0, 1, 1, 0, 1])
      : (y0 < z0 ? [0, 0, 1, 0, 1, 1] : x0 < z0 ? [0, 1, 0, 0, 1, 1] : [0, 1, 0, 1, 1, 0]);
    const pts = [[x0, y0, z0, 0, 0, 0], [x0 - i1 + Gs, y0 - j1 + Gs, z0 - k1 + Gs, i1, j1, k1], [x0 - i2 + 2 * Gs, y0 - j2 + 2 * Gs, z0 - k2 + 2 * Gs, i2, j2, k2], [x0 - 1 + 3 * Gs, y0 - 1 + 3 * Gs, z0 - 1 + 3 * Gs, 1, 1, 1]];
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0;
    for (const [a, b, c, di, dj, dk] of pts) {
      let q = 0.6 - a * a - b * b - c * c;
      if (q < 0) continue;
      const g = G3[perm[ii + di + perm[jj + dj + perm[kk + dk]]] % 12];
      q *= q;
      n += q * q * (g[0] * a + g[1] * b + g[2] * c);
    }
    return 32 * n;
  }
  const corners = [];
  function initCorners() {
    $$(".ph").forEach((ph) => {
      const box = document.createElement("div");
      box.className = "corner-fx";
      const cv = document.createElement("canvas");
      box.append(cv);
      ph.append(box);
      const st = { el: ph, cv, ctx: cv.getContext("2d"), threshold: reduce ? 0 : 1, corner: reduce ? 0.5 : 0, seed: Math.random() * 100 - 50, on: false, played: reduce };
      corners.push(st);
      new IntersectionObserver((es) => {
        st.on = es[0].isIntersecting;
        if (st.on && !st.played) {
          st.played = true;
          setTimeout(() => gsap.to(st, { threshold: 0, corner: 0.5, duration: 1, ease: "power2.out" }), 200);
        }
      }, { threshold: 0.1 }).observe(ph);
    });
    let t = 0, lastDraw = 0;
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (now - lastDraw < 32) return;
      lastDraw = now;
      t += 0.016 * 2;
      corners.forEach((s) => {
        if (!s.on) return;
        const w = s.cv.clientWidth, h = s.cv.clientHeight;
        if (!w || !h) return;
        if (s.cv.width !== w || s.cv.height !== h) { s.cv.width = w; s.cv.height = h; }
        const ctx = s.ctx;
        ctx.clearRect(0, 0, w, h);
        const short = Math.min(w, h), base = short * 0.1;
        const nShort = Math.ceil(short / base);
        const cell = short / nShort;
        const nx = Math.ceil(w / cell), ny = Math.ceil(h / cell);
        const gw = w / nx, gh = h / ny, aspect = w / h;
        let cs = s.corner;
        if (aspect > 1) cs *= Math.sqrt(aspect); else if (aspect < 1) cs /= Math.sqrt(aspect);
        ctx.fillStyle = s.ink || (s.ink = `rgb(${cssRGB("--kf-surface").map((v) => Math.round(v * 255)).join(",")})`);
        for (let gx = 0; gx < nx; gx++) for (let gy = 0; gy < ny; gy++) {
          let minD = 1e9;
          for (const [cx, cy] of [[gx, gy], [gx + 1, gy], [gx, gy + 1], [gx + 1, gy + 1]]) {
            let ox = (cx * gw) / w - 0.5, oy = (cy * gh) / h - 0.5;
            if (aspect > 1) ox *= aspect; else if (aspect < 1) oy /= aspect;
            minD = Math.min(minD, Math.hypot(ox, oy));
          }
          if (minD < cs) continue;
          const n = noise3(gx, gy, (t + s.seed) * 0.3);
          if (n < s.threshold) ctx.fillRect(Math.floor(gx * gw), Math.floor(gy * gh), Math.ceil(gw), Math.ceil(gh));
        }
      });
    };
    requestAnimationFrame(draw);
  }

  // ── Carousel (original GsapCarousel): cells 268/407px center-aligned, drag 50px. Career path is a finite board (no loop · starts at 1 · gap 8/16 · .3s),
  //    The campus is a finite panel (gap 16/24 · .4s). At the end slot the matching button locks. When the panel fits entirely it stops center-aligned ──
  function initCarousels() {
    $$("[data-carousel]").forEach((root) => {
      const o = Object.fromEntries((root.dataset.carousel || "").split(";").map((kv) => kv.split(":").map((x) => x.trim())).filter((kv) => kv[0]));
      const loop = o.loop === "true", dur = +(o.dur ?? 0.4), start = +(o.start ?? 0);
      const gaps = [+(o.gap ?? 16), +(o.gapPc ?? 24)];
      const vp = $(".carousel__vp", root), track = $(".carousel__track", root);
      const orig = $$(".carousel__slide", track);
      const count = orig.length;
      if (loop) { track.prepend(...orig.map((s) => s.cloneNode(true))); track.append(...orig.map((s) => s.cloneNode(true))); }
      const all = () => $$(".carousel__slide", track);
      const prev = $(".is-prev", root), next = $(".is-next", root);
      const off = loop ? count : 0;
      let idx = start, sw = 268, gap = 16, busy = false, fits = false;
      const measure = () => {
        sw = isPC() ? 407 : 268; gap = isPC() ? gaps[1] : gaps[0];
        all().forEach((s) => { s.style.width = sw + "px"; s.style.marginRight = gap + "px"; });
        fits = (sw + gap) * count - gap <= vp.offsetWidth;
        root.classList.toggle("is-static", fits);
      };
      const x = (i) => (fits ? (vp.offsetWidth - ((sw + gap) * count - gap)) / 2 : (vp.offsetWidth - sw) / 2 - (i + off) * (sw + gap));
      const mark = () => {
        all().forEach((s, k) => $(".career-card", s)?.classList.toggle("is-active", (k - off) % count === idx));
        if (prev) prev.disabled = !loop && idx === 0;
        if (next) next.disabled = !loop && idx === count - 1;
      };
      const go = (i, anim = true) => {
        if (busy) return;
        let j = i;
        if (loop) j = i < 0 ? count - 1 : i >= count ? 0 : i; else j = Math.max(0, Math.min(i, count - 1));
        if (!anim) { gsap.set(track, { x: x(j) }); idx = j; mark(); return; }
        busy = true;
        // In a ring panel, going past the end starts from a slot one set outside and arrives at the first and last slots
        if (loop && i !== j) gsap.set(track, { x: x(i < 0 ? -1 : count) });
        gsap.to(track, { x: x(j), duration: dur, ease: "power2.out", onComplete: () => { busy = false; idx = j; mark(); } });
      };
      measure(); go(fits ? 0 : idx, false);
      addEventListener("resize", () => { measure(); go(fits ? 0 : idx, false); });
      prev?.addEventListener("click", () => go(idx - 1));
      next?.addEventListener("click", () => go(idx + 1));
      let sx = null, base = 0;
      vp.addEventListener("pointerdown", (e) => { if (fits || busy) return; sx = e.clientX; base = gsap.getProperty(track, "x"); gsap.killTweensOf(track); vp.classList.add("is-drag"); vp.setPointerCapture(e.pointerId); });
      vp.addEventListener("pointermove", (e) => { if (sx !== null) gsap.set(track, { x: base + (e.clientX - sx) }); });
      const end = (e) => {
        if (sx === null) return;
        const dx = e.clientX - sx;
        sx = null; vp.classList.remove("is-drag");
        if (dx < -50) go(idx + 1); else if (dx > 50) go(idx - 1); else go(idx);
      };
      vp.addEventListener("pointerup", end); vp.addEventListener("pointercancel", end);
    });
  }

  // ── Modal (people story · video): backdrop .9 black, box .95→1 over .3s ──
  function closeModals() { $$(".modal.is-open").forEach((m) => m.classList.remove("is-open")); $$(".video.is-playing").forEach((v) => v.classList.remove("is-playing")); lenis?.start(); }
  function initModals() {
    $$("[data-modal-open]").forEach((b) => b.addEventListener("click", () => {
      const m = document.getElementById(b.dataset.modalOpen);
      if (!m) return;
      const name = b.dataset.name;
      if (name && $("[data-modal-name]", m)) $("[data-modal-name]", m).textContent = name;
      // Original: as the dialog covers the screen, hover on the video plate is released, so the gradient overlay drops at the same moment
      b.closest(".video")?.classList.add("is-playing");
      m.classList.add("is-open");
      lenis?.stop();
    }));
    $$(".modal").forEach((m) => {
      m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".modal__close")) closeModals(); });
    });
  }

  // ── Footer · page transition ──
  function initFooter() {
    const f = $(".footer");
    if (!f) return;
    if (reduce) return f.classList.add("is-visible");
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { f.classList.add("is-visible"); io.disconnect(); } }, { threshold: 0.05 }).observe(f);
  }
  function initPager() {
    const nums = $$(".pager__num"), prev = $(".pager .is-prev"), next = $(".pager .is-next");
    if (!nums.length) return;
    let cur = 0;
    const set = (i) => {
      cur = Math.max(0, Math.min(nums.length - 1, i));
      nums.forEach((n, k) => n.classList.toggle("is-active", k === cur));
      prev.disabled = cur === 0; next.disabled = cur === nums.length - 1;
    };
    nums.forEach((n, k) => n.addEventListener("click", () => set(k)));
    prev?.addEventListener("click", () => set(cur - 1));
    next?.addEventListener("click", () => set(cur + 1));
  }
  function initPageLinks() {
    if (page !== "home") $$('a[href^="index.html"]').forEach((a) => a.addEventListener("click", () => sessionStorage.setItem("sdb:return", "1")));
    $$("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!/^[a-z]+\.html$/.test(href) || reduce) return;
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        closeMenu();
        doc.classList.add("page-leave");
        sessionStorage.setItem("sdb:nav", "1");
        setTimeout(() => (location.href = href), 300);
      });
    });
    addEventListener("pageshow", (e) => e.persisted && doc.classList.remove("page-leave"));
  }

  // ── Halftone overlay: recreate the original 6px repeating noise image with a canvas ──
  function makeDots() {
    const c = document.createElement("canvas");
    c.width = c.height = 12;
    const x = c.getContext("2d");
    x.fillStyle = "#808080"; x.fillRect(0, 0, 12, 12); // Not skin: halftone texture overlaid with overlay — uses only brightness difference above a gray base
    x.fillStyle = "#000"; // Not skin: brightness of the halftone texture
    [[3, 3], [9, 9]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.6, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = "#fff"; // Not skin: brightness of the halftone texture
    [[9, 3], [3, 9]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.2, 0, Math.PI * 2); x.fill(); });
    const o = $(".bgfx__overlay");
    if (o) o.style.backgroundImage = `url(${c.toDataURL()})`;
  }

  // ── Wave background: the original feeds a white winged wave video (720 square, .9x speed) into a shader at 30fps, with a red→blue-violet gradient turning by the clock’s minute hand angle and
  //    combined with overlay, hard light, soft light, average and lighten. Instead of a video, thousands of thin plates (instances) draw white waves into the same composite.
  //    Pressing s, d, b on the keyboard switches the blend mode between two options (sharp light, subtract) like the original ──
  function initBackground() {
    const canvas = $(".bgfx__canvas");
    if (!canvas) return;
    // In the original the canvas stays blank black until the video is ready — the fallback gradient is laid only when WebGL is unavailable
    const fallback = () => { canvas.remove(); $(".bgfx")?.insertAdjacentHTML("afterbegin", '<div class="bgfx__fallback"></div>'); };
    if (!window.THREE) return fallback();
    const T = window.THREE;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" }); }
    catch (e) { return fallback(); }
    renderer.setPixelRatio(1);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    const rt = new T.WebGLRenderTarget(1, 1, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true });
    const angle = () => { const d = new Date(); return ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) % 3600) / 3600 * Math.PI * 2; };
    const uni = { uTime: { value: 0 }, uFade: { value: 0 } };
    // The original video (34.667s, .9x speed) starts black for .2s and brightens over a little more than 1s (average brightness 0→11→28→43→47→52→57), and the last .2s cuts to black and repeats — the same brightness curve is applied to the plate wave that stands in for the video
    const ENV = [[0, 0], [0.2, 0], [0.3, 0.19], [0.5, 0.49], [0.8, 0.75], [1.2, 0.82], [2, 0.91], [4, 1], [34.45, 1], [34.46, 0]];
    const envelope = (tv) => {
      const t = tv % 34.667;
      for (let i = 1; i < ENV.length; i++) if (t <= ENV[i][0]) { const [a, va] = ENV[i - 1], [b, vb] = ENV[i]; return va + ((t - a) / (b - a)) * (vb - va); }
      return 0;
    };

    const COLS = 130, ROWS = 30;
    const box = new T.BoxGeometry(1, 1, 1);
    box.translate(0, 0.5, 0);
    const geo = new T.InstancedBufferGeometry();
    geo.index = box.index;
    geo.setAttribute("position", box.getAttribute("position"));
    geo.setAttribute("normal", box.getAttribute("normal"));
    const cells = new Float32Array(COLS * ROWS * 3);
    let k = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      cells[k++] = (c - COLS / 2) * 0.19 + (r % 2) * 0.09;
      cells[k++] = -r * 0.42 + 2.4;
      cells[k++] = Math.random();
    }
    geo.setAttribute("aCell", new T.InstancedBufferAttribute(cells, 3));
    geo.instanceCount = COLS * ROWS;
    // It is a video slot, so only brightness is output — white wings on a black background
    const finMat = new T.ShaderMaterial({
      uniforms: uni,
      vertexShader: `
        attribute vec3 aCell;
        uniform float uTime;
        varying vec3 vN; varying float vY;
        float hgt(vec2 p, float t) {
          float a = sin(p.x * 0.38 + t * 0.30 + sin(p.y * 0.55 + t * 0.17) * 1.8);
          float b = sin(p.x * 0.12 - p.y * 0.30 + t * 0.21);
          float c = sin(p.x * 1.9 + p.y * 1.3 + t * 0.6) * 0.18;
          return max(0.04, 1.0 + 1.3 * a * b + 1.0 * b + c);
        }
        void main() {
          float h = hgt(aCell.xy, uTime) * (0.8 + 0.4 * aCell.z);
          float lean = sin(aCell.x * 0.23 + aCell.y * 0.45 + uTime * 0.25) * 0.7;
          vec3 s = vec3(0.045, h, 0.9);
          vec3 p = position * s;
          p.x += p.y * lean;
          p.z += p.y * 0.35;
          p += vec3(aCell.x, -1.2, aCell.y);
          vec3 n = normalize(normal / s);
          vN = normalize(vec3(n.x, n.y - n.x * lean - n.z * 0.35, n.z));
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform float uFade;
        varying vec3 vN; varying float vY;
        void main() {
          vec3 L = normalize(vec3(-0.45, 0.75, 0.55));
          float shade = clamp(0.18 + max(dot(vN, L), 0.0) * 0.9 + vY * 0.35 * abs(vN.x), 0.0, 1.3);
          float sh = min(shade, 1.0);
          float lum = 0.08 + 0.34 * sh + pow(sh, 6.0) * 0.16;
          lum = mix(lum, lum * 0.3, (1.0 - vY) * 0.6) * uFade;
          gl_FragColor = vec4(vec3(lum), 1.0);
        }`,
    });
    const fins = new T.Mesh(geo, finMat);
    fins.frustumCulled = false;
    scene.add(fins);

    const comp = {
      uSrc: { value: rt.texture }, uTime: { value: 0 }, uAngle: { value: angle() }, uMode: { value: 0 },
      uA: { value: new T.Vector3(...cssRGB("--site-wave-a")) }, uB: { value: new T.Vector3(...cssRGB("--site-wave-b")) },
    };
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
      uniforms: comp, depthTest: false, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform sampler2D uSrc; uniform float uTime; uniform float uAngle; uniform int uMode; uniform vec3 uA; uniform vec3 uB;
        varying vec2 vUv;
        vec3 over(vec3 b, vec3 s) { return mix(2.0 * b * s, 1.0 - 2.0 * (1.0 - b) * (1.0 - s), step(0.5, b)); }
        vec3 soft(vec3 b, vec3 s) { return mix(2.0 * b * s + b * b * (1.0 - 2.0 * s), sqrt(b) * (2.0 * s - 1.0) + 2.0 * b * (1.0 - s), step(0.5, s)); }
        float vivid1(float b, float s) { return s < 0.5 ? (s == 0.0 ? 0.0 : max(1.0 - (1.0 - b) / s, 0.0)) : (s == 1.0 ? 1.0 : min(b / (1.0 - s), 1.0)); }
        vec3 vivid(vec3 b, vec3 s) { return vec3(vivid1(b.r, s.r), vivid1(b.g, s.g), vivid1(b.b, s.b)); }
        vec3 grain(vec2 uv) { vec2 c = floor(fract(uv * 11.0) * 256.0); return fract(sin(vec3(dot(c, vec2(12.9898, 78.233)), dot(c, vec2(39.346, 11.135)), dot(c, vec2(73.156, 52.235)))) * 43758.5453); }
        void main() {
          vec2 dir = vec2(cos(uAngle + 1.5707963), sin(uAngle + 1.5707963));
          vec3 bg = mix(uA, uB, smoothstep(0.0, 1.0, dot(vUv - 0.5, dir) + 0.5));
          bg = bg * bg * (bg + 0.8) * 1.3;
          vec3 n = grain(vUv) * 1.5;
          vec3 src = texture2D(uSrc, vUv).rgb;
          vec3 add = mix(src, soft(src, mix(over(src, bg), over(bg, src), 0.3)), 0.5);
          if (length(src) < 0.2) { bg = mix(bg, min(bg, n), 0.15); bg = mix(bg, (bg + n) * 0.5, 0.2); }
          vec3 avg = (add + bg) * 0.5, lit = max(add, bg), col;
          if (uMode == 1) col = vivid(avg, lit * 2.0 * abs(sin(uTime * 0.1) + 2.0));
          else if (uMode == 2) col = max(avg + lit * abs(sin(uTime * 0.1) + 3.0) - 1.0, 0.0);
          else col = mix(avg, lit, 0.5);
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
    quad.frustumCulled = false;
    const quadScene = new T.Scene();
    quadScene.add(quad);
    const quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const resize = () => {
      const w = innerWidth, h = Math.max(innerHeight, document.documentElement.clientHeight);
      renderer.setSize(w, h, false);
      rt.setSize(w, h);
      camera.aspect = w / h;
      const portrait = w / h < 1;
      camera.fov = portrait ? 62 : 40;
      camera.position.set(portrait ? -1.5 : 0, 6.2, 8.6);
      camera.lookAt(portrait ? -1.5 : 0, 0.2, -2.5);
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener("resize", resize);
    let typed = "";
    addEventListener("keypress", (e) => {
      typed = (typed + e.key.toLowerCase()).slice(-3);
      if (typed === "sdb") { comp.uMode.value = Math.random() < 0.5 ? 1 : 2; typed = ""; }
    });
    const draw = () => {
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 1); // Not skin: black backdrop for the video slot — the composite shader reads it by brightness only
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCam);
    };
    // Original: bundled at 30fps and video at .9x speed
    let last = 0, tt = 7, tv = 0;
    const loop = (now) => {
      if (!reduce) requestAnimationFrame(loop);
      if (reduce) { uni.uTime.value = tt; uni.uFade.value = 1; draw(); return; }
      if (now - last < 1000 / 30 || document.hidden) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 30;
      last = now;
      tt += dt * 0.9;
      tv += dt * 0.9;
      uni.uTime.value = tt;
      uni.uFade.value = envelope(tv);
      comp.uTime.value = now * 0.001;
      comp.uAngle.value = angle();
      draw();
    };
    requestAnimationFrame(loop);
  }

  buildChrome();
  makeDots();
  initBackground();
  initScroll();
  initMenu();
  initSymbols();
  initTitles();
  initReveal3D();
  initCarousels();
  initCorners();
  initModals();
  initFooter();
  initPager();
  initPageLinks();
  window.SDB = { gsap, scrollToEl, isPC, reduce, ICON, cssRGB, buildRolling, playRolling };
})();
