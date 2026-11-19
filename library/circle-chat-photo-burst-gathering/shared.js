// Build everything all pages share — menu, header, footer, logo, chunk shapes — in one place.
(() => {
  const SVG = "http://www.w3.org/2000/svg";
  const page = document.body.dataset.page;
  const home = page === "home";
  const link = (hash) => (home ? hash : `index.html${hash}`);

  // The original’s hand-drawn texture blob — drawn on a 0 to 100 grid and stretched for each placement
  const BLOBS = {
    a: "M10 6C30 0 52 10 74 4 94 0 100 20 92 36 84 50 98 66 88 80 76 96 56 86 40 94 20 100 4 90 6 70 8 52 0 38 4 22 6 12 6 8 10 6Z",
    b: "M14 12C34 2 52 18 72 8 92 0 100 24 90 40 80 56 98 74 84 88 68 100 50 84 32 92 14 98 2 80 8 62 14 46 0 32 6 20 8 14 10 14 14 12Z",
    c: "M20 2C46 6 70-2 90 10 102 20 94 40 98 58 102 80 84 98 62 94 42 90 26 102 10 90-2 80 6 60 2 42-2 22 4 0 20 2Z",
    d: "M30 6C58-4 96 6 98 34 100 58 76 62 70 80 64 98 36 104 18 88 2 74 10 52 4 34 0 18 12 10 30 6Z",
    strip: "M0 18C10 4 22 30 36 16 50 2 62 34 78 18 88 8 96 22 100 14V86C90 98 78 74 64 88 50 100 38 70 24 86 12 98 4 80 0 90Z",
  };
  const blob = (el) => {
    if (el.querySelector("svg")) return;
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("d", BLOBS[el.dataset.blob] || BLOBS.a);
    svg.append(p);
    el.append(svg);
  };

  // Logo spot — round arch Latin text + two large handwritten characters + a small line
  const LOGO = `<svg viewBox="0 0 256 245" role="img" aria-label="Logo"><defs><path id="sr-arc" d="M40 92C70 30 186 30 216 92"/></defs>
    <text class="sr-logo__arc" font-size="40"><textPath href="#sr-arc" startOffset="50%" text-anchor="middle">LOGO</textPath></text>
    <text class="sr-logo__small" x="128" y="112" text-anchor="middle" font-size="20">Of</text>
    <text class="sr-logo__big" x="128" y="186" text-anchor="middle" font-size="74">Gathering</text>
    <text class="sr-logo__by" x="128" y="228" text-anchor="middle" font-size="20">by Brand</text></svg>`;

  // Hand-drawn circle — an ellipse drawn with two overlapping laps (perimeter under 600 so the line redraw runs all the way)
  const OVAL = `<svg viewBox="0 0 233 90" aria-hidden="true"><path class="sr-draw__path" d="M30 18C70 4 170 2 208 22 236 38 226 70 180 80 120 92 50 88 20 70-6 54 6 30 40 16"/></svg>`;
  // Header and footer buttons have separate ovals for wide and narrow screens (two-line text), like the original
  const OVAL_SP = `<svg class="sp-only" viewBox="0 0 89 59" aria-hidden="true"><path class="sr-draw__path" d="M18 10C40 0 76 4 85 22 92 40 70 56 42 57 14 58 0 44 4 28 8 14 30 6 52 6"/></svg>`;
  const draw = (el) => {
    if (el.querySelector("svg")) return;
    el.insertAdjacentHTML("afterbegin", el.dataset.draw === "pair" ? OVAL.replace("<svg ", '<svg class="pc-only" ') + OVAL_SP : OVAL);
  };

  const header = document.querySelector('[data-slot="header"]');
  if (header && header.dataset.head === "logo") {
    header.classList.add("sr-header", "is-static");
    header.innerHTML = `<a class="sr-header__logo" href="index.html"><span class="sr-logo" data-logo></span></a>`;
  } else if (header) {
    header.classList.add("sr-header");
    header.innerHTML = `
      <div class="sr-burger${home ? " js-final" : ""}" role="button" tabindex="0" aria-label="Menu" data-menu-btn><span data-lottie></span></div>
      <a class="sr-header__logo${home ? " js-final" : ""}" href="index.html"><span class="sr-logo" data-logo></span></a>
      <div class="sr-header__inq${home ? " js-final" : ""}"><a class="sr-draw" href="consults.html" data-draw="pair"><span class="sr-draw__txt">In detail<br class="sp-only"> Listen in</span></a></div>`;
  }

  const nav = document.querySelector('[data-slot="menu"]');
  if (nav) {
    nav.classList.add("sr-nav");
    const line = `<span class="sr-nav__line"><svg viewBox="0 0 100 4" preserveAspectRatio="none"><line x1="0" y1="2" x2="100" y2="2" pathLength="1"/></svg></span>`;
    const item = (hash, en, ja) => `<li><a href="${link(hash)}" data-nav-link><span class="sr-en">${en}${line}</span><span class="ja">${ja}</span></a></li>`;
    nav.innerHTML = `<div class="sr-nav__inner">
      <div class="sr-nav__bg" aria-hidden="true"><svg viewBox="0 0 852 1200" preserveAspectRatio="none"><path d="M0 0H820C800 120 846 220 830 340 812 460 852 560 836 700 820 840 850 960 828 1080 818 1140 830 1180 834 1200H0Z"/></svg></div>
      <div class="sr-nav__item"><ul class="sr-nav__main">${item("#", "TOP", "First")}${item("#concept", "Concept", "What is your group?")}${item("#about", "About", "Your capabilities here")}${item("#location", "Location", "Your place name here")}</ul></div>
      <div class="sr-nav__item"><ul class="sr-nav__main">${item("#idea", "Idea", "Your fun idea here")}${item("#plan", "Plan", "Service guide")}${item("#access", "Access", "Directions")}${item("#faq", "FAQ", "Frequently asked questions")}</ul></div>
    </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    const full = footer.dataset.foot === "full";
    footer.classList.add("section");
    footer.dataset.theme = "light";
    footer.innerHTML = `${full ? `<div class="sr-foot-inq">
        <div class="sr-foot-inq__bg" aria-hidden="true"><svg viewBox="0 0 1440 920" preserveAspectRatio="none"><path class="tone-main" d="M0 60C180 0 360 70 520 40 700 6 860 80 1040 40 1220 0 1340 50 1440 30V920H0Z"/><path class="tone-teal" d="M300 260C420 180 560 240 640 200 760 140 900 220 960 320 1020 420 920 500 980 600 1040 700 900 780 760 740 620 700 520 800 400 740 280 680 340 560 280 480 220 400 220 320 300 260Z"/><path class="tone-moss" d="M560 360C640 320 720 380 700 440 680 500 600 480 580 540 560 600 480 580 470 520 460 460 500 390 560 360Z"/><path class="tone-bright" d="M1100 200C1220 150 1380 190 1440 260V560C1380 600 1300 540 1240 580 1170 620 1080 560 1080 480 1080 400 1020 260 1100 200Z"/><path class="tone-bright" d="M0 640C80 600 180 650 240 720 300 800 220 880 120 900 60 910 20 880 0 860Z"/></svg></div>
        <span class="sr-logo" data-logo></span>
        <p class="read">Your questions and inquiries about the group here<br class="sp-only">A line about receiving from below.<br>Line inviting people to feel free to get in touch.</p>
        <div class="sr-btns"><a class="sr-draw is-thin" href="consults.html#online" data-draw="pair"><span class="sr-draw__txt">Online<br class="sp-only"> Listen in</span></a><a class="sr-draw is-thin" href="consults.html#karuizawa" data-draw="pair"><span class="sr-draw__txt">The local area<br class="sp-only"> Take a tour</span></a></div>
        <div class="sr-tel">Call us here<div class="num sr-en">000-0000-0000</div>( Receiving time 00:00 - 00:00 )</div>
      </div>` : ""}
      <div class="sr-foot-nav"><div class="sr-foot-nav__inner"><div class="links"><a href="#">Company overview</a><a href="#">Privacy policy</a><a href="access.html">Directions</a></div><div class="copy">&copy; Your Company name here. All Rights Reserved.</div></div></div>`;
  }

  document.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = LOGO; });
  document.querySelectorAll("[data-draw]").forEach(draw);
  document.querySelectorAll("[data-blob]").forEach(blob);

  // The hamburger is Lottie like the original — 0~15 three lines grow from the left, 16~45 morph into an X (vertex move), 45~60 the X shrinks to the center.
  // Like the original, change the shape (path) itself, not a transform. The artwork is newly made by us
  const R = (pts) => ({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true });
  const bar = (y) => [[15, y - 1.3], [45, y - 1.3], [45, y + 1.3], [15, y + 1.3]];
  const dot = (x, y) => [[x, y], [x, y], [x, y], [x, y]];
  const X1 = [[20.31, 18.47], [41.53, 39.69], [39.69, 41.53], [18.47, 20.31]];
  const X2 = [[18.47, 39.69], [39.69, 18.47], [41.53, 20.31], [20.31, 41.53]];
  const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.25], y: [1] } };
  const key = (frames) => frames.map(([t, pts], n) => ({ t, s: [R(pts)], ...(n < frames.length - 1 ? ease : {}) }));
  const SHAPES = [
    key([[0, dot(15, 22)], [10, bar(22)], [16, bar(22)], [45, X1], [60, dot(30, 30)]]),
    key([[0, dot(15, 30)], [3, dot(15, 30)], [13, bar(30)], [16, bar(30)], [30, dot(30, 30)], [60, dot(30, 30)]]),
    key([[0, dot(15, 38)], [5, dot(15, 38)], [15, bar(38)], [16, bar(38)], [45, X2], [60, dot(30, 30)]]),
  ];
  const MENU_ICON = { v: "5.9.0", fr: 30, ip: 0, op: 70, w: 60, h: 60, nm: "menu", ddd: 0, assets: [], markers: [],
    layers: [{ ddd: 0, ind: 1, ty: 4, nm: "bars", sr: 1, ip: 0, op: 70, st: 0, bm: 0, ao: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "gr", nm: "bars", it: [
        ...SHAPES.map((k, n) => ({ ty: "sh", nm: "bar" + n, ks: { a: 1, k } })),
        { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
      ] }] }] };

  const btn = document.querySelector("[data-menu-btn]");
  let icon = null;
  if (btn && window.lottie) {
    icon = lottie.loadAnimation({ container: btn.querySelector("[data-lottie]"), renderer: "svg", loop: false, autoplay: false, animationData: MENU_ICON });
    icon.setSubframe(false);
    icon.addEventListener("DOMLoaded", () => icon.goToAndStop(15, true));
    icon.addEventListener("complete", () => { if (!document.body.classList.contains("open")) icon.goToAndStop(15, true); });
  }
  let wasOpen = false;
  const sync = () => {
    const now = document.body.classList.contains("open");
    if (now === wasOpen) return;
    wasOpen = now;
    if (!icon) return;
    if (now) icon.playSegments([16, 45], true);
    else icon.playSegments([[45, 60], [0, 15]], true);
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  btn?.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.toggle("open"); });
  btn?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); } });

  // Same-page link inside the menu — closes, then 600ms swing(=moves down with sine.inOut)
  document.querySelectorAll("[data-nav-link]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href.startsWith("#")) return;
      e.preventDefault();
      document.body.classList.remove("open");
      const target = href === "#" ? 0 : document.querySelector(href);
      const lenis = window.srLenis;
      if (lenis) lenis.scrollTo(target, { duration: 0.6, easing: (t) => 0.5 - Math.cos(t * Math.PI) / 2 });
      else window.scrollTo({ top: target ? target.getBoundingClientRect().top + scrollY : 0, behavior: "smooth" });
    });
  });

  // Header text color: switches between green and white by the data-theme of the section crossing the top of the screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const dark = en.target.dataset.theme === "dark";
      document.body.classList.toggle("is-dark", dark);
      document.body.classList.toggle("is-light", !dark);
    });
  }, { rootMargin: "0px 0px -100% 0px", threshold: 0 });
  document.querySelectorAll(".section[data-theme]").forEach((s) => io.observe(s));

  // Expand question — original jQuery slideToggle(400ms swing = sine.inOut, height and top/bottom margins together)
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".q-row").forEach((q) => {
    const a = q.nextElementSibling;
    const toggle = () => {
      const open = q.classList.toggle("active");
      gsap.killTweensOf(a);
      // gsap.set writes duration: 0 into the vars you pass — so a new object is made every time
      const clear = "height,paddingTop,paddingBottom,overflow";
      if (open) {
        gsap.set(a, { clearProps: clear });
        a.style.display = "block";
        const cs = getComputedStyle(a);
        gsap.fromTo(a, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { height: a.offsetHeight, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, duration: still ? 0 : 0.4, ease: "sine.inOut", clearProps: clear });
      } else {
        gsap.to(a, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden", duration: still ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { a.style.display = "none"; gsap.set(a, { clearProps: clear }); } });
      }
    };
    q.addEventListener("click", toggle);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

})();
