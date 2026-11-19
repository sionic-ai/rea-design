// Sets up the same nav · badge · pixel curtain · footer on every page in one place. In the page HTML <header data-slot="nav"> Wow <footer data-slot="footer"> Just a placeholder.
window.DK = window.DK || {};
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;

  const MARK = '<svg viewBox="0 0 34 40" aria-hidden="true"><path d="M2 2h7l10 13L9 28H2l10-13Z" fill="currentColor"/><path d="M32 12h-7L15 25l10 13h7L22 25Z" fill="currentColor"/></svg>';
  DK.MARK = MARK;
  const EXT = '<svg viewBox="0 0 12 12"><path d="M5 2H2v8h8V7M7 2h3v3M10 2 5.5 6.5"/></svg>';
  const BACK = '<svg viewBox="0 0 12 12"><path d="M9 9 3 3M3 7V3h4"/></svg>';
  // AI assistant icon slot — not a trademark, just a geometric shape matching color and size
  const AI = [
    // The two AI service slots hold other brands’ own logo colors, so they don’t change with the skin, and the remaining line icons follow the text color (currentColor)
    '<svg viewBox="0 0 20 20"><g stroke="#d97757" stroke-width="2.2" stroke-linecap="round"><path d="M10 2v16M2 10h16M4.3 4.3l11.4 11.4M15.7 4.3 4.3 15.7"/></g></svg>', // Not skin: a third-party AI service’s own color in its slot
    '<svg viewBox="0 0 20 20"><path d="M10 1c.6 4.6 4.4 8.4 9 9-4.6.6-8.4 4.4-9 9-.6-4.6-4.4-8.4-9-9 4.6-.6 8.4-4.4 9-9Z" fill="#5b8def"/><path d="M10 1c.6 4.6 4.4 8.4 9 9h-9Z" fill="#e8584f"/><path d="M1 10c4.6.6 8.4 4.4 9 9v-9Z" fill="#f2b632"/></svg>', // Not skin: a third-party AI service’s own color in its slot
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7"/><path d="M10 3v14M4 6.5l12 7M16 6.5l-12 7"/></svg>',
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6.5"/><path d="M4 16 16 4"/></svg>',
    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2v16M3 6l14 8M17 6 3 14M5 3l10 14M15 3 5 17"/></svg>',
  ];
  const GLOBE = '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5"/><path d="M1 6h10M6 1c2 2.5 2 7.5 0 10M6 1c-2 2.5-2 7.5 0 10"/></svg>';
  const LINKS = [
    ["index.html", "Menu 1"],
    ["works.html", "Menu 2"],
    ["studio.html", "Menu 3"],
    ["detail.html", "Menu 4"],
    ["news.html", "Menu 5"],
  ];

  // ── Nav ──
  const header = document.querySelector('[data-slot="nav"]');
  if (header) {
    header.innerHTML = `
      <div class="dk-nav">
        <div class="dk-nav__box">
          <div class="dk-nav__bar">
            <a class="dk-nav__home" href="index.html" aria-label="Back to start">${MARK}<span data-label="Your brand’s English name here">Studio Name</span></a>
            <button class="dk-nav__btn" type="button" aria-expanded="false" aria-label="Open Menu">
              <span>Menu</span>
              <svg viewBox="0 0 18 12" aria-hidden="true"><line class="b b1" x1="0" y1="1.5" x2="18" y2="1.5"/><line class="b b2" x1="0" y1="6" x2="18" y2="6"/><line class="b b3" x1="0" y1="10.5" x2="18" y2="10.5"/><line class="x x1" x1="0" y1="0" x2="18" y2="12"/><line class="x x2" x1="18" y1="0" x2="0" y2="12"/></svg>
            </button>
          </div>
          <div class="dk-nav__panel">
            <nav class="dk-nav__links" data-label="Your English menu name here">${LINKS.map(([h, t]) => `<div><a class="dk-nav__item" href="${h}">${t}</a></div>`).join("")}</nav>
            <div class="dk-nav__rule"></div>
            <div class="dk-nav__row"><span>Ask the AI here</span><span class="dk-nav__icons">${AI.map((s) => `<a href="#" aria-label="AI assistant">${s}</a>`).join("")}</span></div>
            <div class="dk-nav__rule"></div>
            <div class="dk-nav__row">
              <span class="dk-nav__contact"><a href="#">+00 00 0000 0000</a><a href="#">hello@example.com</a></span>
              <span class="dk-nav__side"><a class="dk-lang" href="#">${GLOBE}Other language</a><span class="dk-nav__icons"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="11" height="11" rx="3"/><circle cx="7.5" cy="7.5" r="2.6"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 15 15" fill="currentColor"><rect x="2" y="5.5" width="2.4" height="7.5"/><circle cx="3.2" cy="3.2" r="1.4"/><path d="M6.3 5.5h2.3v1.1c.5-.8 1.4-1.3 2.5-1.3 1.9 0 2.6 1.2 2.6 3.3V13h-2.4V9c0-1-.3-1.6-1.2-1.6-1 0-1.4.7-1.4 1.7V13H6.3Z"/></svg></a></span></span>
            </div>
          </div>
        </div>
      </div>`;
    const nav = header.querySelector(".dk-nav");
    const box = nav.querySelector(".dk-nav__box");
    const btn = nav.querySelector(".dk-nav__btn");
    const label = btn.querySelector("span");
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      label.textContent = open ? "Close" : "Menu";
      // Original: expanded height 479 + row 44 + 5 (403 + 38 + 5 when screen height is under 620), not exceeding screen height − 56
      const tall = matchMedia("(max-height: 620px)").matches ? 446 : 528;
      box.style.height = open ? `${Math.min(tall, innerHeight - 56)}px` : "46px";
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) nav.classList.add("is-shown");
    else setTimeout(() => nav.classList.add("is-shown"), 600);
    addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
    document.addEventListener("pointerdown", (e) => { if (!nav.contains(e.target)) setOpen(false); });
  }

  // ── Side Badge ──
  const badge = document.createElement("a");
  badge.className = "dk-badge";
  badge.href = "#";
  badge.setAttribute("aria-label", "Award nominee badge");
  badge.innerHTML = "<b>A.</b><span>Candidate</span>";
  document.body.append(badge);

  // ── Drag Chips ──
  const chip = document.createElement("span");
  chip.className = "dk-drag";
  chip.textContent = "Drag to View";
  document.body.append(chip);
  DK.chip = (on, x, y) => {
    chip.classList.toggle("is-on", on);
    if (x != null) chip.style.transform = `translate(${x}px, ${y}px)`;
  };

  // ── Footer ──
  const footer = document.querySelector('[data-slot="footer"]');
  if (footer && footer.dataset.kind !== "plain") {
    footer.classList.add("dk-footer");
    footer.innerHTML = `
      <canvas class="dk-footer__sky" aria-hidden="true"></canvas>
      <canvas class="dk-footer__logo" aria-hidden="true"></canvas>
      <div class="dk-footer__in">
        <nav class="dk-footer__nav" data-label="Your English menu name here">${LINKS.slice(0, 4).map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
        <div class="dk-footer__cols">
          <div><p class="dk-footer__label">Your contact info here</p><div class="dk-footer__links"><a href="#">${BACK}hello@example.com</a><a href="#">${BACK}+00 00 0000 0000</a></div></div>
          <div><p class="dk-footer__label">Your SNS here</p><div class="dk-footer__links"><a href="#">SNS 1${EXT}</a><a href="#">SNS 2${EXT}</a></div></div>
          <div><p class="dk-footer__label">Ask the AI here</p><div class="dk-footer__ai">${AI.map((s) => `<a href="#" aria-label="AI assistant">${s}</a>`).join("")}</div><a class="dk-lang" href="#">${GLOBE}Other language</a></div>
        </div>
        <div class="dk-footer__bottom"><span>Your city, country here</span><button type="button" data-top>Back to top ↑</button><span>©0000 Company Name</span></div>
      </div>`;
    footer.querySelector("[data-top]").addEventListener("click", () => (DK.lenis ? DK.lenis.scrollTo(0, { duration: 1.4 }) : scrollTo({ top: 0, behavior: "smooth" })));
    if (DK.night) DK.night(footer.querySelector(".dk-footer__sky"), { aurora: false, mountains: true });
    if (DK.logo3d) {
      const L = DK.logo3d(footer.querySelector(".dk-footer__logo"), { drag: true, size: 0.5 });
      // The original footer stands the logo slightly above center, tilted toward the waterside
      L.pose({ x: 0, y: 0.08, s: 1, rx: 0.12, ry: -0.35, rz: 0, split: 0 });
    }
  }

  // ── Lenis ──
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    DK.lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Yellow pixel curtain ── big cells (three layers of 32·16·8px) switch on and off as they cross a dither threshold. 1.1s easeInOutQuad
  const cover = document.createElement("div");
  cover.className = "dk-cover";
  cover.innerHTML = `<canvas></canvas><span class="dk-cover__mark">${MARK}</span><span class="dk-cover__bar"><i></i></span><span class="dk-cover__label">Your loading text here<i>.</i><i>.</i><i>.</i></span>`;
  document.body.append(cover);
  const cv = cover.querySelector("canvas");
  const cx = cv.getContext("2d");
  const LAYERS = [{ size: 32, share: 0.4 }, { size: 16, share: 0.5 }, { size: 8, share: 1 }];
  const hash = (n) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
  const bayer = (a, b) => (2 * a + 3 * b) % 4;
  let img, starts, dither, level = 1, ready = false;
  // Film color is the skin’s accent color — the canvas can’t read variables, so paint one dot and take it
  const accentRGB = () => {
    const c = getComputedStyle(cover).getPropertyValue("--kf-accent").trim();
    const p = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
    p.fillStyle = c; p.fillRect(0, 0, 1, 1);
    return p.getImageData(0, 0, 1, 1).data;
  };
  const build = (seed) => {
    const [cr, cg, cb] = accentRGB();
    cv.height = 256;
    cv.width = Math.max(1, Math.ceil((256 * innerWidth) / innerHeight));
    const n = cv.width * cv.height;
    img = cx.createImageData(cv.width, cv.height);
    starts = new Float32Array(n * 3);
    dither = new Float32Array(n);
    for (let y = 0; y < cv.height; y++) {
      for (let x = 0; x < cv.width; x++) {
        const i = y * cv.width + x;
        dither[i] = (4 * bayer(x % 2, y % 2) + bayer((x >> 1) % 2, (y >> 1) % 2) + 0.5) / 16;
        LAYERS.forEach(({ size, share }, k) => {
          const s = Math.floor(x / size) + 997 * Math.floor(y / size) + 7919 * k + seed;
          starts[i * 3 + k] = hash(s) <= share ? 0.48 * hash(s + 50021) + 0.16 * k : 2;
        });
        img.data[i * 4] = cr; img.data[i * 4 + 1] = cg; img.data[i * 4 + 2] = cb;
      }
    }
  };
  const draw = (e) => {
    for (let i = 0; i < dither.length; i++) {
      let a = 0;
      for (let k = 0; k < 3; k++) a = Math.max(a, Math.min(1, Math.max(0, (e - starts[i * 3 + k]) / 0.2)));
      img.data[i * 4 + 3] = e === 1 || (e > 0 && a >= dither[i]) ? 255 : 0;
    }
    cx.putImageData(img, 0, 0);
  };
  const tweenCover = (to, ms = 1100) => new Promise((done) => {
    const from = level, t0 = performance.now();
    if (reduce) { level = to; draw(to); return done(); }
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const q = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      level = from + (to - from) * q;
      draw(level);
      t < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  });

  const viaLink = sessionStorage.getItem("dk-nav") === "1";
  sessionStorage.removeItem("dk-nav");
  build(0);
  draw(1);
  cover.classList.add("is-blocking", viaLink ? "is-leaving" : "is-loading");
  document.documentElement.classList.remove("dk-boot");
  const bar = cover.querySelector(".dk-cover__bar i");
  bar.style.width = "35%";
  const reveal = () => {
    bar.style.width = "100%";
    setTimeout(() => {
      cover.classList.remove("is-loading", "is-leaving");
      build(104729);
      draw(1);
      // Precompute the plate (seed 0) to use when leaving after the clear — computing at press time would delay the cover by that much
      tweenCover(0).then(() => { cover.classList.remove("is-blocking"); build(0); ready = true; document.dispatchEvent(new Event("dk:revealed")); });
      document.dispatchEvent(new Event("dk:reveal"));
    }, viaLink ? 120 : 380);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => (document.readyState === "complete" ? reveal() : addEventListener("load", reveal, { once: true })));

  // Links within the same site go through after the curtain covers
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    cover.classList.add("is-blocking");
    if (!ready) build(0);
    level = 0;
    tweenCover(1).then(() => {
      cover.classList.add("is-leaving");
      sessionStorage.setItem("dk-nav", "1");
      setTimeout(() => (location.href = href), 220);
    });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { level = 0; draw(0); cover.classList.remove("is-blocking", "is-leaving"); } });
  addEventListener("resize", () => { build(level > 0.5 || ready ? 0 : 104729); draw(level); });
})();
