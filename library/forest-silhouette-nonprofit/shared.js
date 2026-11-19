// Common to all pages: draw the header row, left and right vertical bands, donation panel and footer in one place, and hook up the loader (Lottie) and phone drawer.
// Original values (function.js): on first visit Lottie 2s (30fps 60f) → at 1.5s logo 1s power2.out (delay 1s) 0.8x · transparent, panel 1.5s (delay 1s).
// The panel curve in the original is ease:"Linear" Written as such, but TweenMax 1.19 does not know that name and runs the default Power1.easeOut — as measured on screen, power1.out.
// Arriving from within the site, the white panel runs for 1.5s (power1.out) after a .5s delay. Phone drawer: panel .5s linear → menu .5s power2.out, both .3s on close.
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Short arrow — only the right end of a 1000px line is cropped to the cell width and shown (shrinking to fit makes the height 0)
  const arrTip = '<svg class="np-arr" viewBox="0 0 1000 9" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><use href="#np-arr"/></svg>';
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <symbol id="np-arr" viewBox="0 0 1000 9"><path d="M0 7.4h991.2L985.6 2l.8-.8L995 8.6H0z"/></symbol>
  </defs></svg>`;

  // Logo — a placeholder redrawn at the same position and size as the original mark (yellow circle + blue pattern)
  const mark = `<svg class="np-logo__mark" viewBox="0 0 48 64" aria-hidden="true">
    <circle cx="24" cy="24" r="23" fill="var(--site-yellow)"/>
    <path d="M24 5a19 19 0 0 1 17 11c-6-3-12-1-15 4s-1 11 4 13a19 19 0 0 1-22-6c5 1 10-2 11-7s-1-9-6-11a19 19 0 0 1 11-4z" fill="var(--kf-accent)"/>
    <circle cx="33" cy="12" r="3.2" fill="var(--kf-accent)"/>
    <rect x="4" y="54" width="40" height="6" rx="3" fill="var(--kf-accent)"/>
  </svg>`;

  const menu = [
    ["about", "about.html", "Menu Name 1", "Sub Menu 1"],
    ["m2", "#", "Menu Name 2", "Sub Menu 2"],
    ["m3", "#", "Menu name third"],
    ["m4", "#", "Menu 4"],
    ["m5", "#", "Menu Name 5"],
    ["news", "news.html", "Menu 6"],
    ["recruit", "recruit.html", "Menu Name 7"],
  ];
  const cur = (k) => (k === page || (page === "article" && k === "news") ? ' aria-current="page"' : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("np-head");
    head.innerHTML = `${defs}
      <a class="np-logo" href="index.html" aria-label="Home" data-label="Organization logo — round mark + legal name in two lines">${mark}
        <span class="np-logo__type"><small>Nonprofit organization name</small><b>Group name</b></span></a>
      <button class="np-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span></button>
      <div class="np-inner">
        <nav class="np-nav" aria-label="Main menu"><ul>
          ${menu.map(([k, href, label, sub]) => `<li><a href="${href}"${cur(k)}>${label}</a>${sub ? `<ul class="np-nav__sub"><li><a href="#">${sub}</a></li></ul>` : ""}</li>`).join("")}
        </ul></nav>
        <nav class="np-subnav" aria-label="Sub Menu"><ul>
          <li><a href="#"><span>Individual Donations</span></a></li>
          <li><a href="#"><span>Corporate sponsorship</span></a></li>
          <li><a href="#"><span>Contact Us</span></a></li>
        </ul></nav>
      </div>
      <div class="np-cv"><div class="np-cv__fill"></div><a href="#donate" aria-label="Donate"><svg class="np-cv__v" viewBox="0 0 21 130" aria-hidden="true"><text x="10.5" y="65" text-anchor="middle">Donate</text></svg><span class="np-cv__h">Donate</span></a></div>
      <div class="np-board"></div>`;
  }

  // Donation plate — left speech bubble + bear, person and dog illustration (original illust_kifu slot redrawn), right three methods + yellow button
  const ill = `<svg class="np-donate__ill" viewBox="0 0 450 160" aria-hidden="true">
    <g><circle cx="58" cy="22" r="13"/><circle cx="118" cy="22" r="13"/><path d="M10 160c0-50 8-86 22-104 10-14 26-24 56-24s46 10 56 24c14 18 22 54 22 104z"/>
      <g class="np-face"><circle cx="64" cy="64" r="4"/><circle cx="112" cy="64" r="4"/><ellipse cx="88" cy="78" rx="7" ry="5"/><path d="M60 98c14 14 42 14 56 0-2 18-14 26-28 26s-26-8-28-26z"/></g></g>
    <g><path d="M190 46c0-20 16-34 36-34s36 14 36 34v6h-72z"/><circle cx="226" cy="62" r="32"/><path d="M168 160c0-36 22-58 58-58s58 22 58 58z"/>
      <g class="np-face"><circle cx="214" cy="62" r="3.4"/><circle cx="238" cy="62" r="3.4"/><path d="M216 76c6 6 14 6 20 0-1 7-5 10-10 10s-9-3-10-10z"/><rect x="190" y="44" width="72" height="5"/><path d="M226 104l-14 24h6l8-14 8 14h6z"/></g></g>
    <g><path d="M322 64l6-48 22 30h30l22-30 6 48c10 18 14 50 14 96H308c0-46 4-78 14-96z"/>
      <g class="np-face"><circle cx="346" cy="74" r="3.6"/><circle cx="384" cy="74" r="3.6"/><path d="M356 92h18l-9 10z"/><path d="M332 112c20 8 46 8 66 0v10c-20 8-46 8-66 0z"/></g></g>
  </svg>`;
  document.querySelectorAll('[data-slot="donation"]').forEach((sec) => {
    sec.classList.add("contentsSection", "width-max", "np-donate");
    sec.id = "donate";
    sec.innerHTML = `
      <h2 class="title1">Your donation title here</h2>
      <div class="np-donate__box">
        <div class="np-donate__left">
          <div class="np-donate__bubble">
            <h3 class="title3">Your speech bubble title here.</h3>
            <p><span class="eng" data-label="English one-line slogan">PLACE A SHORT SLOGAN HERE</span><br>Your donation appeal body here. The original has about four lines of explanation here. Say what more can be done as support widens.<br>The last line closes with one more request.</p>
            <svg class="np-donate__tail" viewBox="0 0 50 26" aria-hidden="true"><path d="M0 0h50L28 24c-2 2-4 2-6 0z"/></svg>
          </div>
          ${ill}
        </div>
        <div class="np-donate__right">
          <div class="np-donate__panel"><div>
            <h3 class="title3 t-center">Your one-line notice here, and<br>Adds a second line</h3>
            <div class="np-donate__way"><span>Sponsorship method name 1</span><span>Ways to give 2</span><span>Ways to give 3</span></div>
          </div></div>
          <a href="#" class="cvBtn">Donate</a>
        </div>
      </div>`;
  });

  const sns = (glyph) => `<a href="#" aria-label="SNS link"><svg viewBox="0 0 50 50" aria-hidden="true"><circle class="np-sns__dot" cx="25" cy="25" r="25"/><g class="np-sns__glyph">${glyph}</g></svg></a>`;
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("np-foot");
    foot.innerHTML = `
      <nav class="np-sns" aria-label="SNS">
        ${sns('<path d="M15 17h20a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V20a3 3 0 0 1 3-3zm7 4v8l7-4z" fill-rule="evenodd"/>')}
        ${sns('<path d="M14 18l9 7-9 8h3l7-6 6 6h6l-10-9 9-6h-3l-7 5-5-5z"/>')}
        ${sns('<path d="M17 14h16a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3zm8 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill-rule="evenodd"/>')}
        ${sns('<path d="M15 21h4v13h-4zm2-6a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zm5 6h4v2c1-1.4 2.6-2.4 5-2.4 3.6 0 5 2.2 5 6V34h-4v-6.6c0-2-.6-3.2-2.4-3.2s-3.6 1.2-3.6 3.6V34h-4z"/>')}
      </nav>
      <a href="#" class="np-tour" aria-label="Sister site banner">
        <span class="np-ph wf-img" data-label="Forest walk · guide with binoculars and two guests · bright fresh greenery · landscape banner"></span>
        <span class="np-tour__title eng" data-label="Sister site English name">SISTER SITE</span>
        <span class="np-tour__sub">One-line intro to sister site</span>
        <span class="np-tour__badge" aria-hidden="true"></span>
        <span class="np-tour__more">→ View details</span>
      </a>
      <nav class="np-foot-nav"><ul><li><a href="#" class="btn-arr"><span>Privacy policy</span>${arrTip}</a></li></ul></nav>
      <p class="np-copy"><small>© Studio Name. All rights reserved.</small></p>`;
  }

  // Skin color as 0–1 RGB that Lottie accepts — oklch(from …) is resolved by the canvas too
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  const rgb = (name) => {
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  };

  // Yellow (--site-yellow) is oklch(from …) so color transitions blend in oklab and the curve drifts from the original (sRGB blend) — the value computed from the skin is unpacked to rgb and plugged back in
  {
    const [r, g, b] = rgb("--site-yellow").map((v) => Math.round(v * 255));
    root.style.setProperty("--site-yellow", `rgb(${r} ${g} ${b})`);
  }

  // ── Loader ──
  const loading = document.querySelector(".np-loading");
  const sameSite = (() => {
    try { return document.referrer && new URL(document.referrer).origin === location.origin; } catch { return false; }
  })();
  const NP = (window.NP = { loaded: false, onLoaded: [] });
  const done = () => {
    if (loading) loading.style.display = "none";
    NP.loaded = true;
    NP.onLoaded.forEach((f) => f());
    document.dispatchEvent(new CustomEvent("np:loaded"));
  };

  // Our logo mark Lottie — only the layer timing and curves of the original data.json were carried over, the shapes are redrawn (600×600, 30fps, 0~60f)
  const markData = () => {
    const Y = rgb("--site-yellow"), B = rgb("--kf-accent");
    const st = (k) => ({ a: 0, k });
    // lottie remembers shape objects by identity — unless each group is given a new tr, from the second group on it reads them as already seen elements and stops
    const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
    const fill = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
    const el = (x, y, d, c) => ({ ty: "gr", it: [{ ty: "el", d: 1, p: st([x, y]), s: st([d, d]) }, fill(c), tr()] });
    const poly = (pts, c) => ({ ty: "gr", it: [{ ty: "sh", ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true }) }, fill(c), tr()] });
    const kf = (t0, t1, s, e, ox, ix) => ({ a: 1, k: [{ t: t0, s, e, o: { x: ox, y: ox.map(() => 0) }, i: { x: ix, y: ix.map(() => 1) } }, { t: t1 }] });
    const layer = (ind, nm, ip, p, a, shapes, ks = {}) => ({
      ddd: 0, ind, ty: 4, nm, sr: 1, ip, op: 60, st: ip, bm: 0, ao: 0,
      ks: { o: st(100), r: st(0), p: st([...p, 0]), a: st([...a, 0]), s: st([100, 100, 100]), ...ks },
      shapes,
    });
    const blade = (cx, cy, r0, r1, a0, a1) => {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const a = (a0 + (a1 - a0) * (i / 8)) * Math.PI / 180; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); }
      for (let i = 8; i >= 0; i--) { const a = (a0 + (a1 - a0) * (i / 8)) * Math.PI / 180; pts.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]); }
      return pts;
    };
    return {
      v: "5.1.8", fr: 30, ip: 0, op: 60, w: 600, h: 600, nm: "mark", ddd: 0, assets: [],
      layers: [
        layer(1, "leaf-turn", 49, [390.667, 497.333], [355.667, 462.333], [poly([[300, 470], [356, 420], [412, 470], [356, 500]], Y)], { r: kf(49, 57, [-74.062], [0], [0.333], [0.329]) }),
        layer(2, "star-pop", 49, [177.333, 177.333], [142.333, 142.333], [poly([[142, 92], [156, 128], [194, 132], [164, 154], [174, 192], [142, 170], [110, 192], [120, 154], [90, 132], [128, 128]], Y)], { s: kf(49, 57, [0, 0, 100], [100, 100, 100], [0.094, 0.094, 0.167], [0.424, 0.424, 0.667]) }),
        layer(3, "dots-pop", 49, [180, 409.333], [145, 374.333], [el(120, 350, 34, Y), el(160, 340, 22, Y), el(176, 376, 26, Y), el(136, 396, 20, Y), el(110, 380, 16, Y)], { s: kf(49, 54, [0, 0, 100], [100, 100, 100], [0.06, 0.06, 0.167], [0.252, 0.252, 0.667]) }),
        layer(4, "blue-blade", 16, [300, 300], [265, 265], [poly(blade(265, 265, 150, 205, 200, 300), B)], { r: kf(16, 60, [0], [360], [0.212], [0.172]) }),
        layer(5, "bar-stretch", 49, [300, 300], [265, 265], [poly([[150, 300], [380, 300], [380, 330], [150, 330]], Y)], { s: kf(49, 54, [31.72, 100, 100], [83.123, 100, 100], [0.221, 0.221, 0.333], [0.367, 0.367, 0.833]) }),
        layer(6, "ring-spin", 16, [300, 300], [265, 265], [poly(blade(265, 265, 175, 215, 20, 160), Y), poly(blade(265, 265, 175, 215, 200, 250), Y)], { r: kf(16, 55, [0], [720], [0.444], [0.471]) }),
        layer(7, "blue-cap", 42, [300, 300], [265, 265], [el(330, 190, 70, B)]),
        layer(8, "leaves-turn", 31, [300, 300], [265, 265], [poly([[265, 120], [290, 160], [265, 200], [240, 160]], Y), poly([[380, 250], [420, 270], [380, 290], [350, 270]], Y), poly([[180, 240], [200, 270], [170, 290], [150, 262]], Y)], { r: kf(31, 42, [90], [360], [0.318], [0.667]) }),
        layer(9, "blue-disc", 16, [300, 300], [265, 265], [el(265, 265, 470, B)], { s: kf(16, 30, [0, 0, 100], [100, 100, 100], [0.227, 0.227, 0.333], [0.228, 0.228, 0.667]) }),
        layer(10, "yellow-disc", 0, [300, 300], [265, 265], [el(265, 265, 530, Y)], { s: kf(0, 16, [1, 1, 100], [100, 100, 100], [0.289, 0.289, 0.333], [0.411, 0.411, 0.667]) }),
      ],
    };
  };

  const startLoader = () => {
    if (!loading) return done();
    if (reduce) return done();
    if (!sameSite) {
      root.classList.add("is-first");
      const box = loading.querySelector(".np-loading__mark");
      setTimeout(() => {
        gsap.fromTo(box, { scale: 1 }, { opacity: 0, scale: 0.8, delay: 1, duration: 1, ease: "power2.out" });
        gsap.fromTo(loading, { opacity: 1 }, { opacity: 0, delay: 1, duration: 1.5, ease: "power1.out", onComplete: done });
      }, 1500);
      if (box && window.lottie) lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: true, animationData: markData() });
    } else {
      root.classList.add("is-second");
      gsap.fromTo(loading, { opacity: 1 }, { opacity: 0, delay: 0.5, duration: 1.5, ease: "power1.out", onComplete: done });
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startLoader);
  else startLoader();

  // ── Phone drawer ──
  const burger = document.querySelector(".np-burger");
  const board = document.querySelector(".np-board");
  const inner = document.querySelector(".np-inner");
  let open = false, busy = false;
  mm.add("(max-width: 900px)", () => {
    gsap.fromTo(burger, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    return () => {
      if (open) { root.classList.remove("is-open"); open = false; }
      gsap.set([burger, board, inner], { clearProps: "opacity" });
    };
  });
  burger?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (busy) return;
    busy = true;
    if (!open) {
      root.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      gsap.fromTo(board, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none", onComplete: () => {
        open = true;
        gsap.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", onComplete: () => (busy = false) });
      } });
    } else {
      burger.setAttribute("aria-expanded", "false");
      gsap.fromTo(inner, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(board, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "none", onComplete: () => {
        root.classList.remove("is-open");
        gsap.set(inner, { clearProps: "opacity" });
        open = false;
        busy = false;
      } });
    }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open && !busy) burger.click(); });

  // Original a[href^=#] — swings to that spot over 400ms
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : null;
    const y = target ? target.getBoundingClientRect().top + scrollY : 0;
    if (reduce) return scrollTo(0, y);
    const from = scrollY, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 400);
      scrollTo(0, from + (y - from) * (0.5 - Math.cos(p * Math.PI) / 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
