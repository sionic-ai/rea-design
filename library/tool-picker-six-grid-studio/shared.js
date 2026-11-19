// Skeleton and motion shared by all pages. Nav, phone menu, footer, under-development strip and transition curtain are plugged in here so every page keeps the same shape.
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add("js");

  const MARK = `<svg viewBox="0 0 32 40" aria-hidden="true" focusable="false"><path fill="currentColor" d="M1.4 0H20a6 6 0 0 1 0 12H1.4A1.4 1.4 0 0 1 0 10.6V1.4A1.4 1.4 0 0 1 1.4 0Z"/><path fill="currentColor" d="M4.6 14H26a6 6 0 0 1 0 12H4.6a1.4 1.4 0 0 1-1.4-1.4v-9.2A1.4 1.4 0 0 1 4.6 14Z"/><path fill="currentColor" d="M7.8 28H22a6 6 0 0 1 0 12H7.8a1.4 1.4 0 0 1-1.4-1.4v-9.2A1.4 1.4 0 0 1 7.8 28Z"/></svg>`;
  const ARROW = {
    right: '<path d="M1 6h11.2M8.4 3.2 11.4 6l-3 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
    left: '<path d="M13 6H1.8M5.6 3.2 2.6 6l3 2.8" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="M6 1v11.2M3.2 8.4 6 11.4l2.8-3" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
    out: '<path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const BOX = { right: "0 0 14 12", left: "0 0 14 12", down: "0 0 12 14", out: "0 0 12 12" };
  const arrow = (dir, enter) => {
    const svg = `<svg viewBox="${BOX[dir]}" aria-hidden="true">${ARROW[dir]}</svg>`;
    return `<span class="dz-arrow" data-dir="${dir}"${enter ? " data-enter" : ""}>${svg}${svg}</span>`;
  };
  const roll = (text) => `<span class="dz-roll"><span class="dz-roll__inner">${text}<span class="dz-roll__ghost" aria-hidden="true">${text}</span></span></span>`;
  window.DZ = { MARK, arrow, roll };

  // ── Skeleton insertion ──────────────────
  const nav = document.querySelector('header[data-slot="nav"]');
  if (nav) {
    nav.className = "dz-nav";
    const cur = (p) => (p === page ? ' aria-current="page"' : "");
    nav.innerHTML = `
      <div class="dz-nav__inner dz-shell">
        <a class="dz-nav__brand" href="index.html" aria-label="Studio Name — Home">${MARK}<strong data-label="Your studio English name here">Studio Name</strong></a>
        <div class="dz-nav__right">
          <nav class="dz-nav__links" aria-label="Main menu" data-label="Your three English menu names here">
            <a class="dz-nav__link" href="list.html"${cur("list")}>${roll("Menu 1")}<sup><span data-count-to="4" data-count-digits="2" data-count-once="nav">04</span></sup></a>
            <a class="dz-nav__link" href="index.html#studio">${roll("Menu 2")}</a>
            <a class="dz-nav__link" href="index.html#services">${roll("Menu 3")}</a>
          </nav>
          <button class="dz-theme" type="button" aria-pressed="false" aria-label="On an ink-black background"><span class="dz-theme__disc" aria-hidden="true"></span></button>
          <a class="dz-cta" href="contact.html" data-label="Your English contact button text here">${roll("Contact")}${arrow("out")}</a>
          <button class="dz-menu-btn" type="button" aria-expanded="false" aria-controls="dz-index">Menu</button>
        </div>
      </div>`;
    const idx = document.createElement("nav");
    idx.className = "dz-index";
    idx.id = "dz-index";
    idx.setAttribute("aria-label", "Menu");
    idx.dataset.slot = "mobile-menu";
    idx.setAttribute("data-lenis-prevent", "");
    const items = [["list.html", "Menu 1", "list"], ["index.html#studio", "Menu 2"], ["index.html#services", "Menu 3"], ["contact.html", "Contact", "contact"]];
    idx.innerHTML = `<ul class="dz-index__list" data-label="Your English menu name here (same as the header menu)">${items.map(([href, label, p], i) => `
        <li style="--i:${i}"><a href="${href}"${p ? cur(p) : ""}><span class="dz-index__no t-label">${String(i + 1).padStart(2, "0")}</span><span class="dz-index__label"><span>${label}</span></span>${arrow("right")}</a></li>`).join("")}
      </ul>
      <div class="dz-index__foot t-label"><a href="mailto:hello@example.com">Email address</a><a href="tel:+00000000000">Messenger</a><a href="https://example.com/" target="_blank" rel="noopener">Link 1</a></div>`;
    nav.after(idx);
  }

  const reelSec = document.querySelector('section[data-slot="dev-reel"]');
  if (reelSec) {
    reelSec.classList.add("dz-reel-sec");
    const subjects = [
      "Laptop screen mockup · light gray background · front view", "Multiple screens bundled · deep blue light · angled", "Laptop mockup · on orange props · 45° from above",
      "Laptop on a black stand · dark studio · front view", "Three mobile screens · white background · angled", "Tablet mockup · warm wooden desk · top view", "Desktop monitor · window natural light · side view",
    ];
    const item = (s, i, deco) => `<li class="dz-reel__item"${deco ? ' aria-hidden="true"' : ""}><div class="dz-frame">
        <div class="wf-img" data-label="Work in progress ${String(i + 1).padStart(2, "0")} · ${s} · 4:3"></div>
        <div class="dz-reel__tags"><span class="t-label">Work name ${String(i + 1).padStart(2, "0")}</span><span class="t-label">Launching soon</span></div></div></li>`;
    reelSec.innerHTML = `
      <div class="dz-shell"><div class="dz-cg">
        <div class="dz-cell is-empty is-gap c6"></div>
        <div class="dz-cell is-s is-strong c6"><div class="dz-shead"><h2 class="t-label"><span class="dz-glyph"></span>${reelSec.dataset.title || "Your band title here"}</h2>
          <div class="dz-reel-ctl"><button class="dz-reel-btn" type="button" data-nudge="1" aria-label="Previous" data-layer="Previous">${arrow("left")}</button><button class="dz-reel-btn" type="button" data-nudge="-1" aria-label="Next" data-layer="Next">${arrow("right")}</button></div></div></div>
      </div></div>
      <div class="dz-reel-wrap" data-layer="In-development banner" data-no-select>
        <div class="dz-reel" tabindex="0" role="region" aria-label="Work in development"><ul class="dz-reel__track"><li class="dz-reel__spacer" aria-hidden="true"></li>
          ${subjects.map((s, i) => item(s, i, false)).join("")}${subjects.map((s, i) => item(s, i, true)).join("")}</ul></div>
        <div class="dz-reel__cursor" aria-hidden="true"><div class="dz-reel__dot t-label">Drag</div></div>
      </div>
      <div class="dz-shell"><div class="dz-cg"><div class="dz-cell is-empty is-gap c6"></div></div></div>`;
  }

  const foot = document.querySelector('footer[data-slot="contact-footer"]');
  if (foot) {
    const link = (href, text, dir, accent) => `<li data-reveal><a class="dz-foot-link"${accent ? ' style="color:var(--kf-accent-text)"' : ""} href="${href}">${roll(text)}${arrow(dir, true)}</a></li>`;
    foot.id = "contact";
    foot.innerHTML = `<div class="dz-shell"><div class="dz-cg">
      <div class="dz-cell is-s is-strong c6"><h2 class="t-label"><span class="dz-glyph"></span>Inquiry</h2></div>
      <div class="dz-cell is-center c3 r2 m-keep"><p class="t-h2" data-layer="Contact sentence" data-mask data-label="Your English closing sentence (second clause in italic serif)">A closing question<br>goes here? <span class="t-em">Then a line</span><br><span class="t-em">set in italics.</span></p></div>
      <div class="dz-cell is-empty c1 r2"></div>
      <div class="dz-cell is-center c2 r2"><nav aria-label="Footer" data-layer="Footer Links"><ul data-stagger>
        ${link("contact.html", "Get in touch", "right", true)}${link("list.html", "Menu 1", "right")}${link("index.html#studio", "Menu 2", "right")}${link("index.html#services", "Menu 3", "right")}${link("https://example.com/", "Link 1", "out")}
      </ul></nav></div>
      <div class="dz-cell is-center c3"><div class="dz-foot-contact" data-layer="Contact info" data-stagger>
        <a class="t-h3" href="mailto:hello@example.com" data-reveal>${roll("hello@example.com")}${arrow("right")}</a>
        <a class="t-h3" href="tel:+00000000000" data-reveal style="word-spacing:.18em">${roll("+00 0 0000 0000")}${arrow("right")}</a>
      </div></div>
      <div class="dz-cell is-empty c3"></div>
      <div class="dz-cell is-s is-strong m-half c2"><span class="t-label">© 0000 Your name here</span></div>
      <div class="dz-cell is-s is-empty is-strong c2"></div>
      <div class="dz-cell is-s is-strong is-right m-half c2"><span class="t-label">Your region here</span></div>
      <div class="dz-cell is-end c6"><div class="dz-signoff" data-layer="Closing name">${MARK}<span class="t-display" data-label="Your studio English name here">Studio Name</span></div></div>
    </div></div>`;
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="dz-edge dz-edge--top" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="dz-edge dz-edge--bottom" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
    <div class="dz-sel-guides" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="dz-sel-root" aria-hidden="true">
      <div class="dz-sel-hover"><span class="dz-sel-tag t-label"></span></div>
      <div class="dz-sel-frame"><span class="dz-sel-tag t-label"></span><span class="dz-sel-dim t-label"></span><i data-h="nw"></i><i data-h="n"></i><i data-h="ne"></i><i data-h="e"></i><i data-h="se"></i><i data-h="s"></i><i data-h="sw"></i><i data-h="w"></i></div>
    </div>
    <div class="dz-pt" aria-hidden="true" data-slot="page-transition">
      <svg class="dz-pt__defs" focusable="false"><filter id="dz-distort" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.05" numOctaves="2" seed="4" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
      <div class="dz-pt__slats"><span></span><span></span><span></span></div>
      <div class="dz-pt__mark">${MARK}</div>
    </div>`);

  root.setAttribute("data-pt-live", "");

  // Grid line background
  const backdrop = document.createElement("div");
  backdrop.className = "dz-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = `<div class="dz-backdrop__rows"></div><div class="dz-backdrop__cols dz-shell"><div class="dz-backdrop__inner">${Array.from({ length: 7 }, (_, i) => `<span style="left:${(i / 6) * 100}%"></span>`).join("")}</div></div>`;
  document.body.prepend(backdrop);
  if (!reduce.matches) {
    const cols = backdrop.querySelectorAll(".dz-backdrop__inner > span");
    gsap.set(cols, { scaleY: 0, transformOrigin: "50% 0%" });
    addEventListener("dz:ready", () => gsap.to(cols, { scaleY: 1, duration: 1.4, ease: "power3.inOut", stagger: 0.06, overwrite: true }), { once: true });
  }
  document.body.style.position = "relative";
  const rowsEl = backdrop.firstElementChild;
  let rowIO;
  const drawRows = () => {
    const ys = new Map();
    const base = document.body.getBoundingClientRect().top;
    document.querySelectorAll(".dz-cg > .dz-cell, .dz-cell.is-sub > .dz-cell").forEach((c) => {
      if (!c.offsetParent) return;
      const r = c.getBoundingClientRect();
      const strong = c.classList.contains("is-strong");
      for (const y of [r.top - base, r.bottom - base]) {
        const k = Math.round(y);
        const near = [...ys.keys()].find((v) => Math.abs(v - k) < 3);
        const key = near ?? k;
        ys.set(key, (ys.get(key) || false) || strong);
      }
    });
    rowIO?.disconnect();
    const on = new Set([...rowsEl.children].filter((s) => s.hasAttribute("data-on")).map((s) => s.style.top));
    rowsEl.innerHTML = [...ys.entries()].filter(([y]) => y > 2).sort((a, b) => a[0] - b[0])
      .map(([y, s]) => `<span style="top:${y}px"${s ? " data-strong" : ""}${on.has(`${y}px`) || reduce.matches ? " data-on" : ""}></span>`).join("");
    rowIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-on", ""); rowIO.unobserve(e.target); } }), { rootMargin: "0px 0px 4% 0px" });
    rowsEl.querySelectorAll("span:not([data-on])").forEach((s) => rowIO.observe(s));
  };
  let rowTimer;
  const queueRows = () => { clearTimeout(rowTimer); rowTimer = setTimeout(drawRows, 160); };
  new ResizeObserver(queueRows).observe(document.body);
  setTimeout(() => {
    const lim = scrollY + 1.5 * innerHeight;
    rowsEl.querySelectorAll("span:not([data-on])").forEach((s) => parseFloat(s.style.top) <= lim && s.setAttribute("data-on", ""));
  }, 2500);

  // ── Smooth scroll ───────────────────
  let lenis = null;
  if (!reduce.matches && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.DZ.lenis = lenis;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = document.querySelector(url.hash);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    lenis ? lenis.scrollTo(t, { offset: 0 }) : t.scrollIntoView();
  });
  if (location.hash) addEventListener("load", () => { const t = document.querySelector(location.hash); t && (lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView()); });

  // ── Sun · moon (paper ↔ ink) ─────────────────
  const themeBtn = document.querySelector(".dz-theme");
  const syncTheme = () => {
    const ink = root.dataset.theme === "ink";
    themeBtn?.setAttribute("aria-pressed", String(ink));
    themeBtn?.setAttribute("aria-label", ink ? "On a paper base" : "On an ink-black background");
  };
  syncTheme();
  themeBtn?.addEventListener("click", () => {
    const flip = () => {
      root.dataset.theme = root.dataset.theme === "ink" ? "paper" : "ink";
      try { localStorage.setItem("dz-theme", root.dataset.theme); } catch {}
      syncTheme();
    };
    if (!document.startViewTransition || reduce.matches) return flip();
    const r = themeBtn.getBoundingClientRect();
    root.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
    root.setAttribute("data-theme-switch", "");
    document.startViewTransition(flip).finished.finally(() => root.removeAttribute("data-theme-switch"));
  });

  // ── Phone menu ─────────────────────────
  const menuBtn = document.querySelector(".dz-menu-btn");
  const index = document.getElementById("dz-index");
  function closeMenu() {
    if (!index?.hasAttribute("data-open")) return;
    index.removeAttribute("data-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "Menu";
    lenis?.start();
  }
  menuBtn?.addEventListener("click", () => {
    if (index.hasAttribute("data-open")) return closeMenu();
    index.setAttribute("data-open", "");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.textContent = "Close";
    lenis?.stop();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // ── Number roll ───────────────────────
  const odometer = (el) => {
    const to = el.dataset.countTo;
    const roll = el.hasAttribute("data-count-roll");
    const text = el.textContent.trim();
    const suffix = el.dataset.countSuffix || "";
    const cols = [];
    if (to !== undefined) {
      const n = Number(to);
      const digits = Math.max(String(n).length, Number(el.dataset.countDigits) || 0);
      for (let p = digits - 1; p >= 0; p--) {
        const d = Math.floor(n / 10 ** p);
        cols.push(Array.from({ length: d + 1 }, (_, i) => String(i % 10)));
      }
    } else if (roll) cols.push([" ", text]);
    el.setAttribute("aria-label", text);
    el.innerHTML = cols.map((c) => `<span class="dz-odo" aria-hidden="true"><span class="dz-odo__sizer">${c[c.length - 1]}</span><span class="dz-odo__strip">${c.map((v) => `<span>${v}</span>`).join("")}</span></span>`).join("") + (suffix ? `<span aria-hidden="true">${suffix}</span>` : "");
    return [...el.querySelectorAll(".dz-odo__strip")].map((s) => ({ s, n: s.children.length }));
  };

  // ── Reveal motion ─────────────────────
  const mm = gsap.matchMedia();
  const onEnter = (el, pct, fn) => ScrollTrigger.create({ trigger: el, start: `top ${pct}%`, once: true, onEnter: fn });
  const startReveals = () => mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { motion } = ctx.conditions;
    document.querySelectorAll("[data-count-to], [data-count-roll]").forEach((el) => {
      const once = el.dataset.countOnce;
      let seen = false;
      try { seen = once && sessionStorage.getItem(`dz-count-${once}`); } catch {}
      if (!motion || seen) return;
      const strips = odometer(el);
      gsap.set(strips.map((x) => x.s), { yPercent: 0 });
      onEnter(el, 92, () => {
        strips.forEach(({ s, n }, i) => gsap.to(s, { yPercent: (-100 * (n - 1)) / n, duration: 1.3, ease: "power3.inOut", delay: i * 0.08 }));
        try { once && sessionStorage.setItem(`dz-count-${once}`, "1"); } catch {}
      });
    });
    if (!motion) {
      document.querySelectorAll("[data-clip]").forEach((e) => e.setAttribute("data-clip-done", ""));
      return;
    }
    document.querySelectorAll("[data-mask]").forEach((el) => {
      let lines = [];
      let tw;
      const play = (delay) => gsap.fromTo(lines, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.085, delay });
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "dz-line", autoSplit: true, aria: "auto",
        onSplit(self) {
          lines = self.lines;
          self.masks.forEach((m) => m.classList.add("dz-line-mask"));
          if (tw) { const p = tw.progress(); tw.kill(); tw = play(0).progress(p); } else gsap.set(lines, { yPercent: 115, opacity: 0 });
        },
      });
      gsap.set(el, { opacity: 1 });
      onEnter(el, 88, () => { tw = play(Number(el.dataset.delay || 0)); });
    });
    const staggered = new Set();
    document.querySelectorAll("[data-stagger]").forEach((box) => {
      const kids = [...box.querySelectorAll("[data-reveal]")];
      if (!kids.length) return;
      kids.forEach((k) => staggered.add(k));
      gsap.set(kids, { opacity: 0, x: (i, t) => (t.dataset.from === "left" ? -40 : 0), y: (i, t) => (t.dataset.from === "left" ? 0 : 28) });
      onEnter(box, 88, () => gsap.to(kids, { opacity: 1, x: 0, y: 0, duration: 0.9, ease: "power4.out", stagger: 0.075, delay: Number(box.dataset.delay || 0) }));
    });
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (staggered.has(el)) return;
      gsap.set(el, { opacity: 0, y: 28 });
      onEnter(el, 90, () => gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power4.out", delay: Number(el.dataset.delay || 0) }));
    });
    document.querySelectorAll("[data-clip]").forEach((el) => {
      onEnter(el, 90, () => gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut", delay: Number(el.dataset.delay || 0), onComplete: () => { el.setAttribute("data-clip-done", ""); gsap.set(el, { clearProps: "clipPath" }); } }));
    });
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const f = Number(el.dataset.parallax || 0.12);
      gsap.fromTo(el, { yPercent: -100 * f }, { yPercent: 100 * f, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    document.querySelectorAll("[data-media-in]").forEach((el) => {
      gsap.set(el, { scale: 1.08 });
      onEnter(el, 92, () => gsap.to(el, { scale: 1, duration: 1.6, ease: "power3.out" }));
    });
    document.querySelectorAll("[data-drift]").forEach((el) => {
      const d = Number(el.dataset.drift || 32);
      gsap.fromTo(el, { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // ── Editor — clicking a layer attaches a selection box (label, handles, actual size), drag to move and use the handles to resize ──
  // Changed values persist in localStorage per page and can be undone up to 60 times with ⌘Z
  const selRoot = document.querySelector(".dz-sel-root");
  const hoverBox = selRoot.querySelector(".dz-sel-hover");
  const frame = selRoot.querySelector(".dz-sel-frame");
  const handles = [...frame.querySelectorAll("[data-h]")];
  const guides = document.querySelector(".dz-sel-guides");
  const [gTop, gBot, gL, gR] = guides.children;
  const KEY = `dz-canvas-${page}`;
  const layers = () => [...document.querySelectorAll("[data-layer]:not([data-no-select])")].filter((el) => !el.closest("[data-no-select]") && el.getClientRects().length);
  const byName = (n) => layers().find((el) => el.dataset.layer === n) || null;
  let selected = null, hovered = null, dragging = null;
  let overrides = {};
  try { overrides = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  const past = [], future = [];
  const navH = () => document.querySelector(".dz-nav")?.offsetHeight || 0;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(overrides)); } catch {} toolbar.toggleAttribute("data-on", Object.keys(overrides).length > 0); };
  const paintLayer = (el) => {
    const o = overrides[el.dataset.layer] || {};
    el.style.translate = o.x || o.y ? `${o.x || 0}px ${o.y || 0}px` : "";
    el.style.width = o.w ? `${o.w}px` : "";
    el.style.maxWidth = o.w ? "none" : "";
    el.style.height = o.h ? `${o.h}px` : "";
    if (o.s) { el.dataset.baseFs ||= parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = `${el.dataset.baseFs * o.s}px`; } else el.style.fontSize = "";
    if (o.html != null && el.innerHTML !== o.html) el.innerHTML = o.html;
  };
  const checkpoint = () => { past.push(JSON.stringify(overrides)); if (past.length > 60) past.shift(); future.length = 0; };
  const setOverride = (name, patch) => {
    const next = { ...(overrides[name] || {}), ...patch };
    Object.keys(next).forEach((k) => (next[k] == null || next[k] === 0) && k !== "html" && delete next[k]);
    if (Object.keys(next).length) overrides[name] = next; else delete overrides[name];
    const el = byName(name);
    el && paintLayer(el);
    save();
  };
  const restore = (json) => {
    const before = Object.keys(overrides);
    overrides = JSON.parse(json);
    new Set([...before, ...Object.keys(overrides)]).forEach((n) => { const el = byName(n); if (el) { if (!overrides[n]) el.removeAttribute("data-base-fs"); paintLayer(el); } });
    save();
  };
  const undo = () => { if (!past.length) return; future.push(JSON.stringify(overrides)); restore(past.pop()); };
  const redo = () => { if (!future.length) return; past.push(JSON.stringify(overrides)); restore(future.pop()); };

  document.body.insertAdjacentHTML("beforeend", `
    <div class="dz-rulers" aria-hidden="true"><canvas class="dz-ruler dz-ruler--top"></canvas><canvas class="dz-ruler dz-ruler--left"></canvas><span class="dz-ruler__corner"></span></div>
    <div class="dz-toolbar dz-chrome" role="toolbar" aria-label="Layout" data-lenis-prevent><button type="button" class="dz-toolbar__reset t-small"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77M2.75 2.5v2.75H5.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Reset layout</button></div>
    <div class="dz-help" role="dialog" aria-modal="true" aria-label="Shortcut key" data-lenis-prevent hidden><div class="dz-help__panel dz-chrome">
      <header class="dz-help__head"><span class="t-label">Shortcut key</span><button type="button" class="dz-help__close" aria-label="Close">×</button></header>
      <dl class="dz-help__list">${[["Drag", "Move layer · Snaps to 8px grid (⌥ for free move)"], ["Handle", "Resize · ⇧ keep ratio"], ["← → ↑ ↓", "Nudge 1px · ⇧ 8px"], ["] [", "Next · previous layer"], ["⌫", "Revert selected layer"], ["↵", "Edit post"], ["⌘Z / ⇧⌘Z", "Undo · Redo"], ["G", "Toggle grid"], ["⇧R", "Ruler"], ["?", "This window"], ["Esc", "Clear Selection"]].map(([k, v]) => `<div><dt><kbd>${k}</kbd></dt><dd>${v}</dd></div>`).join("")}</dl>
    </div></div>`);
  const toolbar = document.querySelector(".dz-toolbar");
  const help = document.querySelector(".dz-help");
  const rulers = document.querySelector(".dz-rulers");
  toolbar.querySelector("button").addEventListener("click", () => { checkpoint(); restore("{}"); layers().forEach((el) => el.removeAttribute("data-base-fs")); });
  const toggleHelp = (on = help.hidden) => { help.hidden = !on; on ? lenis?.stop() : lenis?.start(); };
  help.addEventListener("click", (e) => (e.target === help || e.target.closest(".dz-help__close")) && toggleHelp(false));
  layers().forEach((el) => overrides[el.dataset.layer] && paintLayer(el));
  save();

  // Box slot: when the selection changes it moves from the previous layer’s position with .45s expo.out, and on first attach the handle pops out
  const fly = { p: 1, from: null };
  const place = (box, r, withDim) => {
    box.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
    box.style.width = `${r.w}px`;
    box.style.height = `${r.h}px`;
    box.dataset.top = r.y < navH() + 30 ? "in" : "out";
    if (!withDim) return;
    gTop.style.transform = `translate3d(0, ${r.y}px, 0)`;
    gBot.style.transform = `translate3d(0, ${r.y + r.h}px, 0)`;
    gL.style.transform = `translate3d(${r.x}px, 0, 0)`;
    gR.style.transform = `translate3d(${r.x + r.w}px, 0, 0)`;
  };
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const select = (el) => {
    if (el === selected) return;
    const prevEl = selected;
    selected = el;
    if (!el) { frame.removeAttribute("data-on"); guides.removeAttribute("data-on"); return; }
    frame.querySelector(".dz-sel-tag").textContent = el.dataset.layer;
    frame.setAttribute("data-on", "");
    guides.setAttribute("data-on", "");
    if (prevEl && prevEl.isConnected) {
      fly.from = rectOf(prevEl);
      fly.p = 0;
      gsap.to(fly, { p: 1, duration: 0.45, ease: "expo.out", overwrite: true });
    } else if (!reduce.matches) gsap.fromTo(handles, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.02 });
  };
  const clearHover = () => { hovered = null; hoverBox.removeAttribute("data-on"); };
  document.addEventListener("pointerover", (e) => {
    if (dragging) return;
    const el = e.target.closest("[data-layer]");
    if (el && el.closest("[data-no-select]") && !el.matches("[data-no-select]")) return;
    hovered = el && el !== selected && !el.hasAttribute("data-no-select") ? el : null;
    if (hovered) { hoverBox.querySelector(".dz-sel-tag").textContent = hovered.dataset.layer; hoverBox.setAttribute("data-on", ""); } else hoverBox.removeAttribute("data-on");
  });

  // Drag: dragging a chosen layer past 3px moves it, dragging a handle resizes — snaps to the 8px grid, ⌥ makes it free, handle ⇧ keeps the ratio
  const snap = (v, free) => (free ? v : 8 * Math.round(v / 8));
  const startDrag = (e, el, h) => {
    const name = el.dataset.layer;
    const o = { ...(overrides[name] || {}) };
    const x0 = e.clientX, y0 = e.clientY;
    const w0 = el.offsetWidth, h0 = el.offsetHeight;
    const r0 = el.getBoundingClientRect();
    const fs0 = el.dataset.baseFs ? el.dataset.baseFs * (o.s || 1) : parseFloat(getComputedStyle(el).fontSize);
    let moved = false;
    const move = (ev) => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!moved) {
        if (!h && Math.hypot(dx, dy) < 3) return;
        moved = true;
        checkpoint();
        dragging = el;
        clearHover();
        lenis?.stop();
        document.body.classList.add("is-dragging");
      }
      if (!h) return setOverride(name, { x: snap((o.x || 0) + dx, ev.altKey), y: snap((o.y || 0) + dy, ev.altKey) });
      if (ev.shiftKey) {
        const sx = h.includes("e") ? (w0 + dx) / w0 : h.includes("w") ? (w0 - dx) / w0 : null;
        const sy = h.includes("s") ? (h0 + dy) / h0 : h.includes("n") ? (h0 - dy) / h0 : null;
        let k = sx != null && sy != null ? (Math.abs(sx - 1) >= Math.abs(sy - 1) ? sx : sy) : sx ?? sy ?? 1;
        k = Math.min(5, Math.max(Math.max(0.2, 40 / Math.min(w0, h0)), k));
        el.dataset.baseFs ||= fs0 / (o.s || 1);
        setOverride(name, { w: Math.round(w0 * k), s: Math.round((fs0 * k / el.dataset.baseFs) * 100) / 100 });
        const r = el.getBoundingClientRect();
        const ax = h.includes("w") ? r0.right - r.width : h.includes("e") ? r0.left : r0.left + (r0.width - r.width) / 2;
        const ay = h.includes("n") ? r0.bottom - r.height : h.includes("s") ? r0.top : r0.top + (r0.height - r.height) / 2;
        return setOverride(name, { x: Math.round((o.x || 0) + ax - r0.left), y: Math.round((o.y || 0) + ay - r0.top) });
      }
      const next = { x: o.x, y: o.y, w: o.w, h: o.h };
      if (h.includes("e")) next.w = Math.max(40, snap(w0 + dx, ev.altKey));
      if (h.includes("s")) next.h = Math.max(40, snap(h0 + dy, ev.altKey));
      if (h.includes("w")) { next.w = Math.max(40, snap(w0 - dx, ev.altKey)); next.x = (o.x || 0) + (w0 - next.w); }
      if (h.includes("n")) { next.h = Math.max(40, snap(h0 - dy, ev.altKey)); next.y = (o.y || 0) + (h0 - next.h); }
      setOverride(name, next);
    };
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      if (!moved) return;
      dragging = null;
      lenis?.start();
      document.body.classList.remove("is-dragging");
      // After dragging, swallow the single click right after so it doesn’t navigate even if the drop spot is a link
      const swallow = (c) => { c.preventDefault(); c.stopPropagation(); };
      addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", swallow, true), 0);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
  };
  handles.forEach((hd) => hd.addEventListener("pointerdown", (e) => {
    if (!selected || e.button !== 0 || e.pointerType === "touch") return;
    e.preventDefault();
    e.stopPropagation();
    startDrag(e, selected, hd.dataset.h);
  }));
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    if (e.target.closest(".dz-chrome, .dz-help")) return;
    const el = e.target.closest("[data-layer]");
    if (el?.hasAttribute("data-no-select") || el?.closest("[data-no-select]")) return;
    if (!el && e.target.closest(".dz-nav, .dz-index, a, button, input, textarea, select, label")) return;
    if (el?.isContentEditable) return;
    if (el && el === selected) startDrag(e, el, null);
    select(el);
    clearHover();
  });

  // Text edit: edit the selected layer text directly with ↵, click outside or press Esc to keep it
  const editable = (el) => el && el.textContent.trim() && !el.querySelector("img, svg, canvas, .wf-img, a, button, input, textarea");
  const editText = (el) => {
    el.contentEditable = "true";
    el.focus();
    getSelection()?.selectAllChildren(el);
    const done = () => {
      el.removeAttribute("contenteditable");
      el.removeEventListener("blur", done);
      if ((overrides[el.dataset.layer]?.html ?? null) !== el.innerHTML) { checkpoint(); setOverride(el.dataset.layer, { html: el.innerHTML }); }
    };
    el.addEventListener("blur", done);
  };

  const sibling = (d) => {
    const list = layers();
    const i = list.indexOf(selected);
    const el = list[(i + d + list.length) % list.length];
    if (!el) return;
    select(el);
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) lenis ? lenis.scrollTo(el, { offset: -innerHeight / 3 }) : el.scrollIntoView({ block: "center" });
  };
  addEventListener("keydown", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && (t.closest("input, textarea, select") || t.isContentEditable)) {
      if (e.key === "Escape" && t.isContentEditable) t.blur();
      return;
    }
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (cmd && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
    if (cmd || e.altKey) return;
    switch (e.key) {
      case "Escape": help.hidden ? select(null) : toggleHelp(false); break;
      case "Enter": if (selected && editable(selected)) { e.preventDefault(); editText(selected); } break;
      case "g": case "G": root.toggleAttribute("data-grid-off"); break;
      case "r": case "R": if (e.shiftKey) { root.toggleAttribute("data-rulers"); drawRulers(); } break;
      case "?": toggleHelp(); break;
      case "]": sibling(1); break;
      case "[": sibling(-1); break;
      case "Backspace": case "Delete":
        if (selected && overrides[selected.dataset.layer]) { e.preventDefault(); checkpoint(); setOverride(selected.dataset.layer, { x: null, y: null, w: null, h: null, s: null, html: null }); selected.removeAttribute("data-base-fs"); }
        break;
      case "ArrowLeft": case "ArrowRight": case "ArrowUp": case "ArrowDown": {
        if (!selected) return;
        e.preventDefault();
        const step = e.shiftKey ? 8 : 1;
        const o = overrides[selected.dataset.layer] || {};
        checkpoint();
        setOverride(selected.dataset.layer, {
          x: (o.x || 0) + (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0),
          y: (o.y || 0) + (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0),
        });
      }
    }
  });

  // Ruler (⇧R): ticks every 50px, numbers every 100px, and one accent-colored line at the cursor. The vertical ruler counts document position
  const rTop = rulers.querySelector(".dz-ruler--top");
  const rLeft = rulers.querySelector(".dz-ruler--left");
  const pointer = { x: -9, y: -9 };
  let rulerRaf = 0;
  const sizeCanvas = (c, w, h) => {
    const d = Math.min(devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); c.style.width = `${w}px`; c.style.height = `${h}px`; }
    const g = c.getContext("2d");
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, w, h);
    return g;
  };
  const drawRulers = () => {
    rulerRaf = 0;
    if (!root.hasAttribute("data-rulers")) return;
    const cs = getComputedStyle(root);
    const ink = cs.getPropertyValue("--kf-ink"), accent = cs.getPropertyValue("--kf-accent");
    const font = `9px ${cs.getPropertyValue("--kf-font-mono")}`;
    const w = innerWidth, h = innerHeight, sy = scrollY;
    const top = sizeCanvas(rTop, w, 20);
    top.strokeStyle = top.fillStyle = ink;
    top.font = font;
    top.textBaseline = "top";
    for (let x = 0; x < w; x += 50) {
      const major = x % 100 === 0;
      top.beginPath(); top.moveTo(x + 0.5, major ? 11 : 15); top.lineTo(x + 0.5, 20);
      top.globalAlpha = major ? 0.55 : 0.3; top.stroke();
      if (major) { top.globalAlpha = 0.6; top.fillText(String(x), x + 3, 2); }
    }
    top.globalAlpha = 0.9; top.fillStyle = accent; top.fillRect(pointer.x, 0, 1, 20);
    const left = sizeCanvas(rLeft, 20, h);
    left.strokeStyle = left.fillStyle = ink;
    left.font = font;
    left.textBaseline = "top";
    for (let y = -(sy % 50); y < h; y += 50) {
      const n = Math.round(y + sy), major = n % 100 === 0;
      left.beginPath(); left.moveTo(major ? 11 : 15, y + 0.5); left.lineTo(20, y + 0.5);
      left.globalAlpha = major ? 0.55 : 0.3; left.stroke();
      if (major) { left.save(); left.translate(2, y + 3); left.rotate(Math.PI / 2); left.globalAlpha = 0.6; left.fillText(String(n), 0, -9); left.restore(); }
    }
    left.globalAlpha = 0.9; left.fillStyle = accent; left.fillRect(0, pointer.y, 20, 1);
  };
  const queueRulers = () => { if (!rulerRaf && root.hasAttribute("data-rulers")) rulerRaf = requestAnimationFrame(drawRulers); };
  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; queueRulers(); }, { passive: true });
  addEventListener("scroll", queueRulers, { passive: true });
  addEventListener("resize", queueRulers);
  new MutationObserver(queueRulers).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  // Interaction screens pick a representative layer (the hero title) by themselves .5s after ready
  const autoPick = () => setTimeout(() => {
    if (selected || !fine.matches) return;
    const el = document.querySelector("[data-layer][data-selected]");
    el && select(el);
  }, 500);
  root.hasAttribute("data-ready") ? autoPick() : addEventListener("dz:ready", autoPick, { once: true });
  gsap.ticker.add(() => {
    if (selected) {
      if (!selected.isConnected) return select(null);
      let r = rectOf(selected);
      if (fly.from && fly.p < 1) r = { x: fly.from.x + (r.x - fly.from.x) * fly.p, y: fly.from.y + (r.y - fly.from.y) * fly.p, w: fly.from.w + (r.w - fly.from.w) * fly.p, h: fly.from.h + (r.h - fly.from.h) * fly.p };
      place(frame, r, true);
      const real = selected.getBoundingClientRect();
      frame.querySelector(".dz-sel-dim").textContent = `${Math.round(real.width)} × ${Math.round(real.height)}`;
    }
    if (hovered) place(hoverBox, rectOf(hovered), false);
  });

  // ── In-development strip — flows at 36px per second, dragging gives inertia (0.03^sec), an arrow moves one slot in .7s ──
  const reel = document.querySelector(".dz-reel");
  if (reel) {
    const track = reel.querySelector(".dz-reel__track");
    const wrap = reel.parentElement;
    const cursor = wrap.querySelector(".dz-reel__cursor");
    const dot = wrap.querySelector(".dz-reel__dot");
    let x = 0, vel = 0, dragging = false, hover = false, focus = false, lastX = 0, lastT = 0, offset = 0, loop = 0, step = 0;
    const measure = () => {
      const items = [...track.children].filter((c) => !c.classList.contains("dz-reel__spacer"));
      const half = Math.floor(items.length / 2);
      if (!half) return;
      const first = items[0].getBoundingClientRect().left;
      offset = first - track.getBoundingClientRect().left;
      loop = items[half].getBoundingClientRect().left - first;
      step = items[1].getBoundingClientRect().left - first;
    };
    new ResizeObserver(measure).observe(track);
    measure();
    const apply = () => {
      if (loop > 0) x = (((x + offset) % loop) + loop) % loop - loop - offset;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    };
    gsap.ticker.add((t, dt) => {
      const s = Math.min(dt, 64) / 1000;
      if (!dragging) {
        x += vel * s;
        vel *= Math.pow(0.03, s);
        if (Math.abs(vel) < 1) vel = 0;
        if (!hover && !focus && !reduce.matches) x -= 36 * s;
      }
      apply();
    });
    const tweens = new Set();
    const nudge = (dir) => {
      vel = 0;
      const dist = (step || 320) * dir;
      const o = { p: 0 };
      let prev = 0;
      const tw = gsap.to(o, { p: 1, duration: 0.7, ease: "power3.out", onUpdate: () => { const v = o.p * dist; x += v - prev; prev = v; }, onComplete: () => tweens.delete(tw) });
      tweens.add(tw);
    };
    document.querySelectorAll("[data-nudge]").forEach((b) => b.addEventListener("click", () => {
      nudge(Number(b.dataset.nudge));
      b.classList.add("is-active");
      setTimeout(() => b.classList.remove("is-active"), 280);
    }));
    const qx = fine.matches ? gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" }) : null;
    const qy = fine.matches ? gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" }) : null;
    reel.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      hover = true;
      const r = wrap.getBoundingClientRect();
      gsap.set(cursor, { x: e.clientX - r.left, y: e.clientY - r.top });
      dot.setAttribute("data-on", "");
    });
    reel.addEventListener("pointerleave", () => { if (!dragging) { hover = false; dot.removeAttribute("data-on"); } });
    reel.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true; vel = 0;
      tweens.forEach((t) => t.kill()); tweens.clear();
      lastX = e.clientX; lastT = performance.now();
      reel.setPointerCapture(e.pointerId);
      reel.dataset.dragging = "true";
      dot.setAttribute("data-drag", "");
    });
    reel.addEventListener("pointermove", (e) => {
      if (qx) { const r = wrap.getBoundingClientRect(); qx(e.clientX - r.left); qy(e.clientY - r.top); }
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      x += dx;
      vel = (dx / (Math.max(now - lastT, 1) / 1000)) * 0.85;
      lastX = e.clientX; lastT = now;
    });
    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      delete reel.dataset.dragging;
      dot.removeAttribute("data-drag");
      const r = reel.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { hover = false; dot.removeAttribute("data-on"); }
    };
    reel.addEventListener("pointerup", up);
    reel.addEventListener("pointercancel", up);
    reel.addEventListener("focus", () => (focus = reel.matches(":focus-visible")));
    reel.addEventListener("blur", () => (focus = false));
    reel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { focus = true; nudge(-1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { focus = true; nudge(1); e.preventDefault(); }
    });
  }

  // ── Page turn — three paper strips ─────────
  const pt = document.querySelector(".dz-pt");
  const slats = [...pt.querySelectorAll(".dz-pt__slats > span")];
  const ptMark = pt.querySelector(".dz-pt__mark");
  const disp = pt.querySelector("feDisplacementMap");
  const main = document.getElementById("main");
  const ready = () => { root.setAttribute("data-ready", ""); window.dispatchEvent(new Event("dz:ready")); };
  const playIn = () => {
    gsap.set(pt, { visibility: "visible" });
    gsap.set(slats, { xPercent: 0 });
    gsap.set(disp, { attr: { scale: 70 } });
    if (main) gsap.set(main, { scale: 1.015, opacity: 0.86 });
    const tl = gsap.timeline({
      onComplete: () => {
        root.removeAttribute("data-pt");
        gsap.set(pt, { clearProps: "visibility" });
        gsap.set([slats, ptMark], { clearProps: "transform,opacity" });
        main && gsap.set(main, { clearProps: "transform,opacity" });
      },
    });
    tl.to(ptMark, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" }, 0)
      .add(ready, 0.2)
      .to(slats, { xPercent: 106, duration: 0.9, stagger: 0.08, ease: "power3.inOut" }, 0.08)
      .to(disp, { attr: { scale: 0 }, duration: 0.95, ease: "power2.out" }, 0.08);
    if (main) tl.to(main, { scale: 1, opacity: 1, duration: 0.95, ease: "power2.out" }, 0.12);
  };
  if (root.dataset.pt === "in" && !reduce.matches) playIn();
  else { root.removeAttribute("data-pt"); ready(); }
  try { sessionStorage.removeItem("dz-pt"); } catch {}

  const vtOK = "startViewTransition" in document && CSS.supports("view-transition-name: root");
  let leaving = false;
  document.addEventListener("click", (e) => {
    if (leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduce.matches) return;
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    // The original’s internal links are router transitions, so they use a view transition (old .4s · new .72s) — the paper-strip curtain only for browsers where that doesn’t work
    if (vtOK) return;
    e.preventDefault();
    leaving = true;
    try { sessionStorage.setItem("dz-pt", "1"); } catch {}
    gsap.set(pt, { visibility: "visible" });
    gsap.set(slats, { xPercent: -106 });
    gsap.set(ptMark, { opacity: 0, scale: 0.9 });
    gsap.set(disp, { attr: { scale: 0 } });
    const tl = gsap.timeline({ onComplete: () => location.assign(url.href) });
    tl.to(slats, { xPercent: 0, duration: 0.7, stagger: 0.07, ease: "power3.inOut" }, 0)
      .to(disp, { attr: { scale: 70 }, duration: 0.7, ease: "power2.in" }, 0)
      .to(ptMark, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, 0.5);
    if (main) tl.to(main, { y: -48, scale: 1.015, opacity: 0.86, duration: 0.8, ease: "power2.in" }, 0);
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set(pt, { visibility: "hidden" });
    gsap.set([slats, ptMark], { clearProps: "transform,opacity" });
    main && gsap.set(main, { clearProps: "transform,opacity" });
  });

  const boot = () => { startReveals(); drawRows(); ScrollTrigger.refresh(); };
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(boot));
})();
