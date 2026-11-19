// Shared by all pages: dark cloud and logo art, diamond hamburger and black full menu, round booking button, footer, cloud curtain, loader, Lenis.
(() => {
  // Fills go through Skin variables — var() doesn’t work in SVG fill attributes, so fill, stroke and font-family that use var values are moved into style within the same tag
  const PAPER = "var(--kf-bg)";
  const INK = "var(--site-brush)";
  const paint = (s) => s.replace(/<[a-z][^>]*>/gi, (tag) => {
    const props = [];
    const t = tag.replace(/\s(fill|stroke|font-family)="(var\([^"]*\))"/g, (_, k, v) => { props.push(`${k}:${v}`); return ""; });
    return props.length ? t.replace(/^<([a-z]+)/i, `<$1 style="${props.join(";")}"`) : tag;
  });

  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const f = (n) => Math.round(n * 10) / 10;

  const spiral = (cx, cy, r, turns, dir = 1) => {
    const steps = Math.round(turns * 36);
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = dir * t * turns * Math.PI * 2 + Math.PI * 0.9;
      const rr = r * (1 - t * 0.88);
      d += (i ? "L" : "M") + f(cx + Math.cos(a) * rr) + " " + f(cy + Math.sin(a) * rr);
    }
    return d;
  };

  // Auspicious-cloud-shaped storm clouds: round lumps drawn once in ink color, then once slightly smaller in paper color, overlaid so only the merged outline remains, with a swirl and faint ink bleed inside.
  const cloud = ({ w = 400, h = 240, seed = 1, lobes = 7, curls = 3, stroke = 2.4, tail = 0, wash = true, fill = PAPER, ink = INK } = {}) => {
    const R = rng(seed);
    const base = h * 0.8;
    const L = [];
    for (let i = 0; i < lobes; i++) {
      const t = lobes === 1 ? 0.5 : i / (lobes - 1);
      const hump = Math.sin(Math.PI * t);
      const r = h * (0.13 + 0.2 * hump) * (0.82 + R() * 0.36);
      L.push({ x: w * (0.14 + 0.72 * t) + (R() - 0.5) * w * 0.04, y: base - r * 0.55 - hump * h * 0.14 * R(), r });
    }
    const nb = Math.max(3, Math.round(lobes * 0.8));
    for (let j = 0; j < nb; j++) {
      const t = (j + 0.5) / nb;
      L.push({ x: w * (0.12 + 0.76 * t), y: base + h * 0.02, r: h * (0.08 + R() * 0.05) });
    }
    const outer = L.map((l) => `<circle cx="${f(l.x)}" cy="${f(l.y)}" r="${f(l.r + stroke)}"/>`).join("");
    const inner = L.map((l) => `<circle cx="${f(l.x)}" cy="${f(l.y)}" r="${f(l.r)}"/>`).join("");
    let washes = "";
    if (wash) {
      washes = L.slice(0, lobes).filter(() => R() > 0.35)
        .map((l) => `<circle cx="${f(l.x + l.r * 0.18)}" cy="${f(l.y + l.r * 0.22)}" r="${f(l.r * 0.62)}"/>`).join("");
      washes = `<g fill="var(--site-wash)" opacity=".2">${washes}</g>`;
    }
    const ridges = L.slice(0, lobes).map((l) => {
      const a0 = Math.PI * 1.08, a1 = Math.PI * 1.62, rr = l.r * 0.8;
      return `<path d="M${f(l.x + Math.cos(a0) * rr)} ${f(l.y + Math.sin(a0) * rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(l.x + Math.cos(a1) * rr)} ${f(l.y + Math.sin(a1) * rr)}"/>`;
    }).join("");
    const picks = L.slice(0, lobes).map((l, i) => [l, R()]).sort((a, b) => b[1] - a[1]).slice(0, curls).map(([l]) => l);
    const sp = picks.map((l, i) => `<path d="${spiral(l.x + l.r * 0.08, l.y + l.r * 0.06, l.r * 0.58, 1.55, i % 2 ? -1 : 1)}"/>`).join("");
    let tails = "";
    for (let k = 0; k < tail; k++) {
      const y0 = base - h * 0.04 - k * h * 0.07;
      tails += `<path d="M${f(w * 0.12)} ${f(y0)}C${f(-w * 0.05)} ${f(y0 - h * 0.02)} ${f(-w * 0.1)} ${f(y0 - h * 0.18 - k * 4)} ${f(-w * 0.22)} ${f(y0 - h * 0.3 - k * 6)}"/>`;
    }
    const pad = h * 0.08;
    return paint(`<svg viewBox="${f(-w * (tail ? 0.24 : 0.02))} ${f(-pad)} ${f(w * (tail ? 1.26 : 1.04))} ${f(h + pad * 1.3)}" fill="none" aria-hidden="true">` +
      (tails ? `<g stroke="${ink}" stroke-width="${f(stroke * 0.7)}" stroke-linecap="round">${tails}</g>` : "") +
      `<g fill="${ink}">${outer}</g><g fill="${fill}">${inner}</g>${washes}` +
      `<g stroke="${ink}" stroke-width="${f(stroke * 0.55)}" stroke-linecap="round" opacity=".7">${ridges}</g>` +
      `<g stroke="${ink}" stroke-width="${f(stroke * 0.8)}" stroke-linecap="round" stroke-linejoin="round">${sp}</g></svg>`);
  };

  // Ripple grain — a bundle of thin parallel lines flowing between the clouds
  const streaks = ({ w = 600, h = 120, n = 9, seed = 3, ink = INK, sw = 1 } = {}) => {
    const R = rng(seed);
    const bend = h * (0.4 + R() * 0.3);
    let d = "";
    for (let i = 0; i < n; i++) {
      const o = (i / n) * h * 0.55;
      d += `<path d="M0 ${f(h * 0.2 + o)}C${f(w * 0.3)} ${f(h * 0.2 + o - bend)} ${f(w * 0.6)} ${f(h * 0.75 + o)} ${f(w)} ${f(h * 0.35 + o)}"/>`;
    }
    return paint(`<svg viewBox="0 0 ${w} ${h}" fill="none" stroke="${ink}" stroke-width="${sw}" aria-hidden="true">${d}</svg>`);
  };

  // Original crest under the roof — the original logo (roof + a single glyph) spot replaced with a placeholder mark of the same silhouette
  const mark = (color = "currentColor") =>
    `<svg viewBox="0 0 140 92" aria-hidden="true" fill="none" style="stroke:${color}">` +
    `<path d="M6 50 70 8l64 42" stroke-width="9" stroke-linecap="square" stroke-linejoin="miter"/>` +
    `<path d="M26 50 70 22l44 28" stroke-width="2"/>` +
    `<circle cx="70" cy="62" r="20" stroke-width="3"/>` +
    `<path d="M57 58h26M55 64h30M59 70h22" stroke-width="2.4"/></svg>`;

  // Full logo with vertical brand name (footer, menu, hero)
  const logo = (color = "currentColor", name = "Your business name here") =>
    `<span class="t-logo" aria-label="Logo slot">${mark(color)}` +
    `<span style="display:flex;justify-content:center;gap:.4em;margin-top:.5em;color:${color}">` +
    `<span style="writing-mode:vertical-rl;font-size:.7em;letter-spacing:.3em;opacity:.8">Your region here</span>` +
    `<span style="writing-mode:vertical-rl;font-size:1.9em;font-weight:700;letter-spacing:.12em;line-height:1">${name}</span>` +
    `<span style="writing-mode:vertical-rl;font-family:var(--kf-font-sans);font-size:.42em;letter-spacing:.1em;align-self:flex-end">LOGO NAME</span></span></span>`;

  // Diamond arrow — on paper, a white arrow on an ink diamond, "w" …is a white diamond with a black arrow on a black band
  const diamond = (variant) => {
    const [fill, arrow] = variant === "w" ? ["var(--kf-contrast-ink)", "var(--kf-contrast-bg)"] : ["var(--kf-ink)", "var(--site-paper-hi)"];
    return paint(`<svg viewBox="0 0 51 34.91" aria-hidden="true"><path d="M25.5 0 51 17.45 25.5 34.91 0 17.45Z" fill="${fill}"/><path d="M23 13.5l4.4 3.95L23 21.4" fill="none" stroke="${arrow}" stroke-width="1.6"/></svg>`);
  };

  const hbgIcon = paint(`<svg viewBox="0 0 125 86" aria-hidden="true"><path d="M62.5 0 125 43 62.5 86 0 43Z" fill="var(--kf-ink)"/><path d="M44 37.5h37M44 48.5h37" stroke="var(--site-paper-hi)" stroke-width="2.6"/></svg>`);
  const closeIcon = paint(`<svg viewBox="0 0 125 86" aria-hidden="true"><path d="M62.5 0 125 43 62.5 86 0 43Z" fill="var(--kf-contrast-ink)"/><path d="M51 32l23 22M74 32 51 54" stroke="var(--kf-contrast-bg)" stroke-width="2.6"/></svg>`);

  const NAV = [
    ["First", "top", "index.html"],
    ["News", "news", "news.html"],
    ["Store guide", "store", "index.html#store"],
    ["Inquiry", "contact", "#"],
    ["SNS", "link", "index.html#instagram"],
  ];
  const page = document.body.dataset.page || "index";

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "t-header";
    header.innerHTML =
      `<button class="t-hbg${page === "index" ? " is-hidden" : ""}" type="button" aria-label="Open Menu">${hbgIcon}</button>` +
      `<nav class="t-nav" data-slot="global-nav" aria-label="Full menu" data-lenis-prevent>` +
      `<div class="t-nav__bg"></div>` +
      `<button class="t-close" type="button" aria-label="Close Menu">${closeIcon}</button>` +
      `<div class="t-nav__menu"><ul class="t-nav__list">` +
      NAV.slice(1).map(([ko, en, href]) => `<li data-en="${en}"><a href="${href}">${ko}</a></li>`).join("") +
      `</ul></div>` +
      `<p class="t-nav__copy">LINE ONE,<br>LINE TWO<br>SHOP NAME</p>` +
      `<div class="t-nav__logo">${mark()}</div>` +
      `<p class="t-nav__copyright">© Your Company 0000</p></nav>`;
    const bg = header.querySelector(".t-nav__bg");
    [[-6, 58, 46, 11], [62, -8, 44, 12], [70, 66, 38, 13]].forEach(([x, y, w, s]) => {
      bg.insertAdjacentHTML("beforeend", cloud({ w: 600, h: 360, seed: s, lobes: 8, curls: 4, fill: "var(--site-band)", ink: "var(--kf-contrast-ink)", wash: false }));
      Object.assign(bg.lastElementChild.style, { left: x + "%", top: y + "%", width: w + "vw" });
    });
  }

  const book = document.querySelector('[data-slot="book-here"]');
  if (book) {
    book.className = "t-book";
    book.innerHTML =
      `<a href="#" aria-label="Book now"><span class="t-book__in"><span class="t-book__mark">${mark()}</span>` +
      `<span class="t-book__ja">Book here</span><span class="t-book__en">Book Here</span>` +
      `<svg class="t-book__arrow" viewBox="0 0 16 8" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 4h15M11.5.5 15 4l-3.5 3.5"/></svg></span></a>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "t-footer";
    footer.innerHTML =
      `<div class="t-footer__inner"><a class="t-footer__logo" href="index.html">${logo()}</a>` +
      `<nav class="t-footer__menu" aria-label="Bottom Menu"><ul class="t-footer__list">` +
      NAV.map(([ko, en, href]) => `<li data-en="${en}"><a href="${href}">${ko}</a></li>`).join("") +
      `</ul></nav><p class="t-footer__copy">© Your Company 0000</p></div>`;
  }

  // Cloud mask — size, position and entry direction of the nine cloud_mask_obj blobs in the original (based on 1280×800)
  const MASK = [
    { w: 842, top: -105.4, left: 219, from: "translate(-129%,0)", seed: 21 },
    { w: 786, top: 99, right: -120, from: "translate(119%,0)", seed: 22 },
    { w: 651, top: 193, left: -225, from: "translate(-80%,0)", seed: 23 },
    { w: 540, bottom: -25, right: -27, from: "translate(100%,0)", seed: 24 },
    { w: 1279, bottom: -307, left: -70, from: "translate(-100%,0)", seed: 25 },
    { w: 1536, bottom: -338.5, left: 156, from: "translate(70%,0)", seed: 26 },
    { w: 1536, top: -538.9, left: -140, from: "translate(100%,0) rotate(-5deg)", seed: 27 },
    { w: 503, top: -17, right: -503, from: "translate(103%,0)", seed: 28 },
    { w: 261, bottom: 0, left: 0, from: "translate(-100%,0)", seed: 29 },
  ];
  const maskEl = document.querySelector('[data-slot="cloud-mask"]');
  // On phone the original also scales the blob larger than the screen width to cover it
  const placeClouds = (host, list, cls) => {
    const k = innerWidth <= 768 ? 2.2 : 1;
    list.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = cls;
      el.style.width = (c.w / 1280) * 100 * k + "vw";
      if (c.top != null) el.style.top = (c.top / 800) * 100 + "%";
      if (c.bottom != null) el.style.bottom = (c.bottom / 800) * 100 + "%";
      if (c.left != null) el.style.left = (c.left / 1280) * 100 + "%";
      if (c.right != null) el.style.right = (c.right / 1280) * 100 + "%";
      el.style.transform = c.from;
      el.style.zIndex = 10 - i;
      el.innerHTML = cloud({ w: 640, h: 440, seed: c.seed, lobes: 9, curls: 4, tail: i % 3 === 0 ? 3 : 0 });
      host.append(el);
    });
  };
  if (maskEl) {
    maskEl.className = "t-cloudmask";
    placeClouds(maskEl, MASK, "t-cloudmask__obj");
  }
  const cloudCover = (mid) => {
    const wrap = document.getElementById("wrap");
    wrap && wrap.classList.add("opacity0");
    maskEl && maskEl.classList.add("on");
    setTimeout(mid, 1000);
    setTimeout(() => {
      wrap && wrap.classList.remove("opacity0");
      maskEl && maskEl.classList.remove("on");
    }, 1600);
  };

  // Menu: the original is jQuery fadeIn/fadeOut 400ms (swing = 0.5 − cos(πp)/2), the link closes after 450ms when clicked
  const nav = document.querySelector(".t-nav");
  const fade = (el, show, ms = 400) => {
    if (!el) return;
    if (show) el.style.display = "block";
    const a = el.animate([{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }], { duration: ms, easing: "cubic-bezier(0.37, 0, 0.63, 1)", fill: "forwards" });
    a.onfinish = () => { el.style.opacity = show ? 1 : 0; if (!show) el.style.display = "none"; a.cancel(); };
  };
  document.querySelector(".t-hbg")?.addEventListener("click", () => fade(nav, true));
  document.querySelector(".t-close")?.addEventListener("click", () => fade(nav, false));
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setTimeout(() => fade(nav, false), 450)));

  // The same Lenis 1.1.9 as the original — PC only, 2.7 seconds after window load (2.2 seconds if the address has a #), turned on with lerp 1 (effectively follows immediately) · duration 1.2 · easeOutQuart, and
  // Run on a separate rAF like the original (ScrollTrigger follows via the window scroll event)
  let lenis = null;
  const startLenis = () => {
    if (!window.Lenis || innerWidth <= 768 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 1, duration: 1.2, easing: (x) => 1 - Math.pow(1 - x, 4) });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };

  // Fade in: .run when the element’s top edge reaches the 90% point of the screen
  const anime = () => {
    const line = scrollY + innerHeight * 0.9;
    document.querySelectorAll(".t-anime:not(.run)").forEach((el) => {
      if (el.getBoundingClientRect().top + scrollY <= line) el.classList.add("run");
    });
  };
  addEventListener("scroll", anime, { passive: true });

  const loading = document.querySelector('[data-slot="loading"]');
  if (loading) {
    loading.className = "t-loading";
    loading.innerHTML = `<div class="t-loading__logo">${mark()}` +
      `<svg class="t-loading__steam _l" viewBox="0 0 30 60" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 58c-12-10 10-18 0-30S18 8 12 2"/></svg>` +
      `<svg class="t-loading__steam _r" viewBox="0 0 30 60" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 58c12-10-10-18 0-30S12 8 18 2"/></svg></div>`;
  }

  addEventListener("load", () => {
    anime();
    setTimeout(() => loading && loading.classList.add("is-loaded"), 800);
    setTimeout(startLenis, location.hash ? 2200 : 2700);
  });

  window.TNM = { cloud, streaks, mark, logo, diamond, paint, rng, spiral, cloudCover, placeClouds, MASK, fade, get lenis() { return lenis; } };
})();
