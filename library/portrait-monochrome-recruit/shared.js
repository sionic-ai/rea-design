// Shared by all pages: draws the header band, phone menu, loader, cursor and footer into placeholders (data-ct), and runs Lenis, clock and header band color change.
// The chest-gap figure art (ct.figure) and the city background (ct.city) are shared by the first page, the interview list and the footer.
(() => {
  const LINKS = [
    ["list.html", "Interview", "Interview"],
    ["about.html", "About us", "Company About"],
    ["about.html#philosophy", "Business", "Business introduction"],
    ["recruit.html", "Benefits", "Employee benefits"],
    ["recruit.html#benefits", "Requirements", "Job type"],
    ["recruit.html#system", "FAQ", "Frequently asked questions"],
  ];
  // Since the original links to an English page, the placeholder text is English: [text, what to insert]
  const SUBLINKS = [
    ["Company Site", "English name for company site link"],
    ["Privacy Policy", "Privacy policy link, English name"],
    ["Policy Link Name, a Long One", "English name of the anti-social forces policy link"],
    ["Information Handling", "English name for the privacy notice link"],
  ];
  const subLinks = () => SUBLINKS.map(([t, label], i) => `<li><a href="#" class="ct-link" data-label="${label}">${t}${i === 0 ? EXT : ""}</a></li>`).join("");
  const isHome = document.body.dataset.page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MARK = `<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M20 1 39 20 20 39 1 20Zm0 9.5L10.5 20 20 29.5 29.5 20Z"/><path fill="currentColor" d="M20 15.5 24.5 20 20 24.5 15.5 20Z"/></svg>`;
  const logo = (cls = "") => `<a href="index.html" class="ct-logo ct-link ${cls}" aria-label="Logo">${MARK}<b>Brand Name</b></a>`;
  const ICONS = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h3c.3 2 1.6 3.4 4 3.6v3.2c-1.5 0-2.8-.4-4-1.1V15a6 6 0 1 1-6-6v3.2a2.8 2.8 0 1 0 3 2.8Z"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2c-.2-1.5-1-2.6-2.6-2.8C17 5 12 5 12 5s-5 0-7.4.4C3 5.6 2.2 6.7 2 8.2 1.8 9.5 1.8 12 1.8 12s0 2.5.2 3.8c.2 1.5 1 2.6 2.6 2.8C7 19 12 19 12 19s5 0 7.4-.4c1.6-.2 2.4-1.3 2.6-2.8.2-1.3.2-3.8.2-3.8s0-2.5-.2-3.8ZM10 15V9l5.2 3Z"/></svg>`,
  ];
  const EXT = `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor"><path d="M4 1.5H1.5v7h7V6M6 1.5h2.5V4M8.5 1.5 4.5 5.5"/></svg>`;

  // As in the original, a large English sentence (two typefaces) and a single line — shared by the footer and the phone menu
  const cta = (cls) => `
    <div class="ct-cta ${cls}">
      <div class="ct-cta__words"><p class="ct-barlow">Our own</p><p class="ct-serif">Words?</p></div>
      <p class="ct-cta__tag">Your one line here.</p>
      <div class="ct-cta__btn"><a href="recruit.html" class="ct-btn" data-cursor-hide><span>ENTRY</span><i class="ct-btn__fix" data-cursor-fixed></i></a></div>
    </div>`;

  /* ── Figure in chest gap ── */
  // Dream photo (color) slot — instead of a photo, two colors for sky and ground just show ”what scene it is”
  const DREAMS = [
    ["#cfd8dc", "#5d8a3a", "Playground Soccer"], ["#e6c97f", "#a47a38", "Autumn Forest Path"], ["#c8d5de", "#b38a5c", "Ballpark dirt"], // not Skin: scene color for the dream photo slot (photo content)
    ["#b6d19a", "#4e7d35", "Tree in the field"], ["#d9584a", "#7d9a5a", "Red House"], ["#d2b48a", "#7a5a3c", "Wooden room"], // not Skin: scene color for the dream photo slot (photo content)
    ["#c0a676", "#5a4630", "Kendo hall"], ["#9ab9cf", "#707070", "City Hero"], // not Skin: scene color for the dream photo slot (photo content)
  ];
  const dreamStyle = (i) => {
    const [sky, ground] = DREAMS[i % DREAMS.length];
    return `--dream: radial-gradient(60% 40% at 70% 22%, rgba(255,255,255,.45), transparent 70%), linear-gradient(180deg, ${sky} 0 44%, ${ground} 44% 100%)`; // Not skin: sunlight within the dream photo (photo content)
  };
  let uid = 0;
  const HOLE_KEEP = "#fff", HOLE_CUT = "#000"; // Not skin: the mask uses only brightness and isn’t painted on screen
  // Upper body of a black-and-white suited figure pulling their shirt open with both hands. The chest gap is cut with a mask so the dream photo behind shows through
  const human = (i) => {
    const id = `ct-hole-${++uid}`;
    const long = i % 2 === 1;
    const hairBack = long ? `<path fill="var(--site-fig-hair)" d="M446 248Q438 360 450 400H550Q562 360 554 248Z"/>` : "";
    const hair = long
      ? `<path fill="var(--site-fig-hair)" d="M454 260Q448 182 500 176Q556 182 548 262L562 398H536L532 276Q527 222 500 220Q473 222 468 276L464 398H438Z"/>`
      : `<path fill="var(--site-fig-hair)" d="M456 250Q450 184 500 178Q554 182 546 252Q538 216 500 212Q462 216 456 250Z"/>`;
    const tie = i % 3 === 0 ? `<path fill="var(--site-fig-tie)" d="M491 404h18l-4 14 22 104-14 9-21-100Z"/>` : "";
    return `<svg class="ct-fig__human" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs><mask id="${id}"><rect width="1000" height="1000" fill="${HOLE_KEEP}"/><path fill="${HOLE_CUT}" d="M470 432 534 434 570 506 540 586 462 583 430 507Z"/></mask></defs>
      ${hairBack}
      <g transform="matrix(.8 0 0 1 100 0)">
      <rect x="474" y="300" width="52" height="80" fill="var(--site-fig-neck)"/>
      <g mask="url(#${id})">
        <path fill="var(--site-fig-suit)" d="M290 410Q370 370 462 368L500 440 538 368Q630 370 710 410Q760 440 768 570L780 1000H220L232 570Q240 440 290 410Z"/>
        <path fill="var(--site-fig-shirt)" d="M462 370H538L610 455 598 640 556 712H444L402 640 390 455Z"/>
        <path fill="none" stroke="var(--site-fig-fold)" stroke-width="4" d="M410 520 436 630M590 520 564 630M452 690 476 708M548 690 524 708"/>
        ${tie}
        <path fill="var(--site-fig-collar)" d="M462 370 500 405 474 428 452 382Z"/><path fill="var(--site-fig-collar)" d="M538 370 500 405 526 428 548 382Z"/>
        <path fill="none" stroke="var(--site-fig-tie)" stroke-width="5" d="M464 368 500 440 536 368"/>
      </g>
      <path fill="none" stroke="var(--site-fig-arm)" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" d="M300 430Q252 540 290 620L400 540"/>
      <path fill="none" stroke="var(--site-fig-arm)" stroke-width="84" stroke-linecap="round" stroke-linejoin="round" d="M700 430Q748 540 710 620L600 540"/>
      <rect x="380" y="470" width="64" height="92" rx="22" fill="var(--site-fig-skin)"/><path fill="none" stroke="var(--site-fig-shade)" stroke-width="4" d="M428 486v58M412 484v62"/>
      <rect x="556" y="470" width="64" height="92" rx="22" fill="var(--site-fig-skin)"/><path fill="none" stroke="var(--site-fig-shade)" stroke-width="4" d="M572 486v58M588 484v62"/>
      </g>
      <ellipse cx="455" cy="262" rx="8" ry="14" fill="var(--site-fig-skin)"/><ellipse cx="545" cy="262" rx="8" ry="14" fill="var(--site-fig-skin)"/>
      <ellipse cx="500" cy="255" rx="46" ry="60" fill="var(--site-fig-face)"/>
      <path fill="none" stroke="var(--site-fig-shade)" stroke-width="4" d="M487 290Q500 296 513 290"/>
      ${hair}
    </svg>`;
  };
  const figure = (i, { label = "", dreamLabel = "" } = {}) => `
    <div class="ct-fig">
      <div class="ct-fig__dream"><div class="ct-dream" style="${dreamStyle(i)}"></div>${dreamLabel ? `<span class="ct-chip" style="left:4px;top:4px">${dreamLabel}</span>` : ""}</div>
      ${human(i)}
      ${label ? `<span class="ct-chip ct-fig__label">${label}</span>` : ""}
    </div>`;

  /* ── City background (B&W photo slot) — both ends left empty so seams are less visible when tiled horizontally ── */
  // A data URI image cannot read CSS variables — decode the skin’s face and text colors to rgb via canvas and paint gray steps blended from the white face toward the black text
  const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (v) => {
    const probe = document.createElement("i");
    probe.style.color = v;
    document.documentElement.append(probe);
    paint.clearRect(0, 0, 1, 1);
    paint.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    paint.fillRect(0, 0, 1, 1);
    return [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  // gray(230) — for a black-and-white skin, rgb(230 230 230) as is, for other skins, the same position between that surface color and the text color
  const grayOf = () => {
    const face = rgbOf("var(--kf-surface)"), ink = rgbOf("var(--kf-ink)");
    return (g) => `rgb(${face.map((x, i) => Math.round(x + (ink[i] - x) * (1 - g / 255))).join(" ")})`;
  };
  const city = ({ light = false } = {}) => {
    const gray = grayOf();
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const W = 2000, base = 640;
    let far = "", near = "", refl = "";
    for (let x = 20; x < W - 40; x += 26 + rnd() * 40) {
      const w = 30 + rnd() * 50, h = 110 + rnd() * 200;
      far += `<rect x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`;
    }
    for (let x = 40; x < W - 60; x += 40 + rnd() * 70) {
      const w = 40 + rnd() * 60, h = 140 + rnd() * (rnd() > 0.8 ? 360 : 220);
      near += `<rect x="${x.toFixed(0)}" y="${(base + 8 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`;
      refl += `<rect x="${x.toFixed(0)}" y="${base + 8}" width="${w.toFixed(0)}" height="${(h * 0.5).toFixed(0)}"/>`;
    }
    const [skyA, skyB, farC, nearC] = (light ? [230, 207, 181, 154] : [210, 159, 138, 86]).map(gray);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 900" preserveAspectRatio="none">
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyA}"/><stop offset=".7" stop-color="${skyB}"/></linearGradient>
      <linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${gray(125)}"/><stop offset="1" stop-color="${gray(62)}"/></linearGradient></defs>
      <rect width="${W}" height="900" fill="url(#s)"/>
      <g fill="${farC}" opacity=".75">${far}</g><g fill="${nearC}">${near}</g>
      <rect y="${base + 8}" width="${W}" height="${900 - base}" fill="url(#w)"/>
      <g fill="${nearC}" opacity=".35">${refl}</g></svg>`;
    return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
  };

  window.ct = { figure, human, dreamStyle, city, LINKS, isHome, reduce };

  /* ── Drawing into placeholders ── */
  const here = location.pathname.split("/").pop() || "index.html";
  const navItems = LINKS.map(([h, en, ja]) => `<li><a href="${h}" class="ct-navlink ct-link"><span class="is-ja">${ja}</span><span class="is-en">${en}</span></a></li>`).join("");
  const parts = {
    loader: !isHome ? `<div class="ct-loader is-blank" data-slot="loader"></div>` : `<div class="ct-loader" data-slot="loader">
        <div class="ct-loader__mid">
          <div class="ct-loader__pct"><p class="ct-serif is-sm">Loading</p><p class="ct-serif is-lg"><span data-ct-pct>0</span><small>%</small></p></div>
          <div class="ct-loader__mark">${MARK}</div>
          <div class="ct-loader__word"><b>Brand Name</b></div>
        </div>
        <div class="ct-loader__bar"><div class="ct-loader__track"><p class="ct-loader__num" data-ct-num>00</p></div></div>
      </div>`,
    cursor: `<div class="ct-cursor" data-slot="cursor"><div class="ct-cursor__circle"></div><p class="ct-cursor__label"><span>SCROLL</span></p></div>`,
    header: `<header class="ct-head" data-slot="header">
        <div class="ct-head__bar">
          <div class="ct-head__left">${logo()}<nav class="ct-head__nav"><ul>${navItems}</ul></nav></div>
          <div class="ct-head__right">
            <p class="ct-clock" data-ct-clock>00:00:00 KST, City</p>
            <div class="ct-entry-box"><a href="recruit.html" class="ct-entry"><span class="ct-entry__dot is-before"><i></i></span><span class="ct-entry__label">Entry</span><span class="ct-entry__dot is-after"><i></i></span></a></div>
            <button type="button" class="ct-burger" aria-label="Menu"><i></i><i></i></button>
          </div>
        </div>
      </header>
      <div class="ct-menu" data-slot="mobile-menu" data-lenis-prevent>
        <div class="ct-menu__scroll">
          <nav class="ct-menu__nav">
            <ul>${LINKS.slice(0, 5).map(([h, en, ja]) => `<li><a href="${h}" class="ct-link"><span class="is-en">${en}</span><span class="is-ja">${ja}</span></a></li>`).join("")}</ul>
            <div class="ct-menu__sub">
              <ul class="ct-links">${subLinks()}</ul>
              <ul class="ct-social">${ICONS.map((s) => `<li><a href="#" class="ct-link" aria-label="SNS">${s}</a></li>`).join("")}</ul>
            </div>
          </nav>
          ${cta("ct-menu__cta")}
        </div>
      </div>`,
    footer: `<footer class="ct-foot" data-slot="footer">
        ${cta("ct-foot__cta")}
        <div class="ct-foot__row">
          <div class="ct-foot__left">
            <div class="ct-foot__brand">${logo()}<p>Recruit Site</p></div>
            <nav class="ct-foot__nav"><ul>${LINKS.map(([h, en]) => `<li><a href="${h}" class="ct-link">${en}</a></li>`).join("")}</ul></nav>
          </div>
          <div class="ct-foot__right">
            <div class="ct-foot__info">
              <ul class="ct-links">${subLinks()}</ul>
              <ul class="ct-social">${ICONS.map((s) => `<li><a href="#" class="ct-link" aria-label="SNS">${s}</a></li>`).join("")}</ul>
            </div>
            <a href="#" class="ct-foot__award ct-link wf-img ct-shot" data-label="Award badge · 1:1" aria-label="Award Badge"></a>
          </div>
        </div>
        <div class="ct-foot__people" data-slot="people-strip">
          <div class="ct-foot__bg" style="--city:${city({ light: true })}"></div>
          <span class="ct-chip">Eight cut-out people · black-and-white suits · color showing in the chest gap · city background below</span>
          <div class="ct-foot__scroll" data-lenis-prevent>
            <ul class="ct-foot__list">${Array.from({ length: 8 }, (_, i) => `<li style="--index:${7 - i}"><a href="list.html">${figure(i)}<p class="ct-foot__num">0${i + 1}</p></a></li>`).join("")}</ul>
          </div>
          <p class="ct-foot__copy">Company Name Co.,Ltd. All rights reserved.</p>
        </div>
      </footer>`,
  };
  document.querySelectorAll("[data-ct]").forEach((el) => {
    const html = parts[el.dataset.ct];
    if (html) el.outerHTML = html;
  });
  document.querySelectorAll(".ct-head__nav a, .ct-foot__nav a").forEach((a) => {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  /* ── Clock ── */
  const clock = document.querySelector("[data-ct-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-US", { hour12: false, timeZone: "Asia/City", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => (clock.textContent = `${fmt.format(new Date())} KST, City`);
    tick();
    setInterval(tick, 1000);
  }

  /* ── Phone Menu ── */
  // Like the original x-dialog — the open state (hamburger, ENTRY dimmed) applies the instant it is pressed, the panel gets its opening flag first (still hidden) then turns on next frame and fades in over .2s
  const burger = document.querySelector(".ct-burger");
  const menu = document.querySelector(".ct-menu");
  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("is-menu-open");
    document.querySelector(".ct-entry-box")?.classList.toggle("is-hidden", open);
    menu?.classList.toggle("is-entering", open);
    requestAnimationFrame(() => menu?.classList.toggle("is-open", open));
    if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
  });

  /* Lenis 1.0.42 (same version and options as the original) — runs on its own requestAnimationFrame like the original */
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  if (!isHome) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = (window.lenis = new Lenis({
        duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, wheelMultiplier: 1, infinite: false,
      }));
      lenis.on("scroll", ScrollTrigger.update);
      let rafId = 0;
      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
      return () => { cancelAnimationFrame(rafId); lenis.destroy(); window.lenis = null; };
    });
  }

  /* ── Header white text — while a black block ([data-header-white]) passes the header’s bottom line ── */
  const head = document.querySelector(".ct-head");
  const bar = head?.querySelector(".ct-head__bar");
  const whites = [...document.querySelectorAll("[data-header-white]")];
  const checkWhite = () => {
    const line = bar.offsetHeight;
    const on = whites.some((el) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom >= line; });
    head.classList.toggle("is-white", on);
    document.body.classList.toggle("is-header-white", on);
  };
  if (head) { checkWhite(); addEventListener("scroll", checkWhite, { passive: true }); addEventListener("resize", checkWhite); }
  window.ct.checkWhite = () => head && checkWhite();

  /* ── Loader — original loading: each frame it approaches by 0.12 toward the larger of the time share (up to 0.8 over 1.6s) and the loaded share, and on the home page it rises to 100 at the end with .6s cubic out ── */
  // The sub page loader is an invisible wait screen (cursor: wait) — there is nothing to wait for, so it ends right away and lifts after .3s
  const loader = document.querySelector(".ct-loader");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const done = () => {
    document.body.classList.add("is-loaded");
    dispatchEvent(new Event("ct:loaded"));
  };
  if (!loader || reduce) {
    loader?.remove();
    requestAnimationFrame(done);
  } else {
    let progress = 0, real = 0, cap = 0.92, rafId = 0;
    const pct = loader.querySelector("[data-ct-pct]");
    const num = loader.querySelector("[data-ct-num]");
    const draw = () => {
      if (!pct) return;
      const p = Math.round(progress * 100);
      pct.textContent = p;
      num.textContent = p < 10 ? "0" + p : p;
      loader.style.setProperty("--p", progress);
    };
    const start = performance.now();
    const step = () => {
      const o = Math.min(1, (performance.now() - start) / 1600) * 0.8;
      progress += (Math.min(cap, Math.max(real, o)) - progress) * 0.12;
      draw();
      rafId = requestAnimationFrame(step);
    };
    const easeTo = (to, ms) => new Promise((res) => {
      const from = progress, t0 = performance.now();
      const tick = () => {
        const c = Math.min(1, (performance.now() - t0) / ms);
        progress = from + (to - from) * (1 - Math.pow(1 - c, 3));
        draw();
        c < 1 ? requestAnimationFrame(tick) : res();
      };
      requestAnimationFrame(tick);
    });
    rafId = requestAnimationFrame(step);
    (async () => {
      // The original first page counts up as it receives sixteen photos — as a placeholder, ours counts up by the share of fonts to load instead of photos
      if (isHome) await document.fonts.ready;
      real = 1;
      cap = 1;
      if (isHome) await easeTo(1, 600);
      loader.classList.add("is-ended");
      dispatchEvent(new Event("ct:ended"));
      await wait(isHome ? 1600 : 300);
      loader.classList.add("is-complete");
      done();
      if (isHome) await wait(1200);
      cancelAnimationFrame(rafId);
      loader.remove();
    })();
  }

  /* ── Cursor (first page only) — follows with damping 0.1, stretches and squashes in the direction of movement ── */
  // Like the original, turn off only when ‹touch and under 1024›. Under /recruit/ it is on from the start and turns off when leaving the window
  const cursor = document.querySelector(".ct-cursor");
  const touch = navigator.maxTouchPoints || "ontouchstart" in document.documentElement;
  if (cursor && !(touch && innerWidth < 1024)) {
    const circle = cursor.querySelector(".ct-cursor__circle");
    const st = (window.ct.cursor = { active: true, hover: false, isScroll: true });
    let x = 0, y = 0, dx = 0, dy = 0;
    const paint = () => {
      cursor.classList.toggle("is-ring", st.active && !st.hover && st.isScroll);
      cursor.classList.toggle("is-dot", st.active && !st.hover && !st.isScroll);
    };
    st.paint = paint;
    paint();
    addEventListener("ct:loaded", async () => { await wait(900); st.active = true; paint(); });
    document.body.addEventListener("mouseleave", () => { st.active = false; paint(); });
    document.body.addEventListener("mouseenter", () => { st.active = true; paint(); });
    // Over the ENTRY button, like the original fixedStalker, it snaps to the center of the circle at the button end (data-cursor-fixed) with damping .3, and ignores the mouse while attached
    let k = 0.1, fixed = false;
    addEventListener("mousemove", (e) => { if (!fixed) { x = e.clientX; y = e.clientY; k = 0.1; } });
    document.addEventListener("mouseover", (e) => { st.hover = !!e.target.closest("a, button, .hs__nav li"); paint(); });
    document.querySelectorAll(".ct-btn").forEach((btn) => {
      const spot = btn.querySelector("[data-cursor-fixed]");
      if (!spot) return;
      btn.addEventListener("mouseenter", () => {
        if (!st.active) return;
        const r = spot.getBoundingClientRect();
        x = r.x + r.width * 0.5; y = r.y + r.height * 0.5; k = 0.3; fixed = true;
        st.hover = true; paint();
      });
      btn.addEventListener("mouseleave", (e) => { x = e.clientX; y = e.clientY; k = 0.1; fixed = false; st.hover = false; paint(); });
    });
    const loop = () => {
      const mx = Math.round(x - dx), my = Math.round(y - dy);
      dx += mx * k;
      dy += my * k;
      const sq = Math.min(Math.hypot(mx, my) * 0.001, 0.55);
      const ang = (Math.atan2(my, mx) * 180) / Math.PI;
      cursor.style.setProperty("--x", dx.toFixed(1));
      cursor.style.setProperty("--y", dy.toFixed(1));
      circle.style.transform = `rotate(${ang}deg) scale(${1 + sq}, ${1 - sq})`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
