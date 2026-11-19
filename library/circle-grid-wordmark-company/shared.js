// Shared by all pages: inserts the header, menu panel, hiring block and footer, Lenis, drawing the circle-grid wordmark (including building it for the first page loader),
// Three-row staggered push for recruiting, slogan strip flow, and the page transition curtain. Page scenes are added with mSite.scene(fn).
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = () => innerWidth < 810;
  const EASE = CustomEase.create("m-ease", "0.44,0,0.56,1");
  const EASE_OUT = CustomEase.create("m-ease-out", "0,0,0,1");

  // Converts a Framer spring (bounce · duration, or stiffness · damping · mass) into a GSAP curve and length — finding the frequency where the damping envelope reaches 0.001 works the same as in Motion
  // rest·speed: like Motion, snaps to the end value at the first moment when the gap to it (distance ratio) is under rest and the speed (per second) is under speed — .005 · .01 for scale and opacity.
  // If speed is not given, draws until the car no longer rises back above rest
  // If until is given, it sticks to the end value at that time
  const spring = ({ bounce, duration, stiffness, damping, mass = 1, rest = 0.0005, speed, until }) => {
    let k = stiffness, c = damping;
    if (k == null) {
      const z = Math.min(1, Math.max(0.05, 1 - bounce));
      const env = (w) => 0.001 - (z / Math.sqrt(1 - z * z)) * Math.exp(-w * z * duration);
      let w = 5 / duration;
      for (let i = 0; i < 12; i++) w -= env(w) / ((env(w + 1e-4) - env(w - 1e-4)) / 2e-4);
      k = w * w;
      c = z * 2 * w;
    }
    const w0 = Math.sqrt(k / mass), z = c / (2 * Math.sqrt(k * mass));
    let f;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      f = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    } else {
      const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
      f = r1 === r2 ? (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t) : (t) => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
    }
    let T = 0.05;
    if (until != null) T = until;
    else if (speed != null) {
      for (let t = 0.001; t < 5; t += 0.001) if (Math.abs(1 - f(t)) < rest && Math.abs(f(t + 0.0005) - f(t - 0.0005)) / 0.001 < speed) { T = t; break; }
    } else for (let t = 0; t < 5; t += 0.002) if (Math.abs(1 - f(t)) > rest) T = t + 0.002;
    return { ease: (p) => (p >= 1 ? 1 : f(p * T)), duration: T };
  };

  // ── Circle grid wordmark: instead of the original logo, builds ”LOGO” from rounded bars on a 3-row grid, with a primary-color dot in each hole ──
  const P = 73;
  const GAP = 10;
  const LETTERS = [
    { w: 2, bars: [[0, 0, 0, 2], [0, 2, 1, 2]], dots: [["blue", 0, 0], ["blue", 1, 1.15]] },
    { w: 3, block: true, dots: [["red", 1, 1], ["green", 0, 0]] },
    { w: 3, bars: [[0, 0, 0, 2], [0, 0, 2, 0], [0, 2, 2, 2], [2, 1, 2, 2], [1, 1, 1, 1]], dots: [["yellow", 2, -0.1], ["pink", 1, 1], ["yellow", 1.35, 0.1]] },
    { w: 3, block: true, dots: [["sky", 1, 1], ["sky", 2, -0.25], ["pink", 0, 0.05]] },
  ];
  // Original wordmark’s 14 dots: scroll speed (%), drop height (px) and bounce time (s), attached in order to our dots.
  const DOT_MOTION = [[110, 190, 0.8], [110, 370, 0.95], [115, 370, 0.8], [105, 540, 1], [113, 480, 1.05], [125, 160, 0.7], [105, 280, 0.6], [100, 200, 0.85], [120, 370, 0.9], [110, 560, 0.9], [125, 160, 0.7], [105, 270, 0.8], [120, 291, 0.95], [110, 310, 0.9]];
  const COLORS = { blue: "var(--site-dot-blue)", red: "var(--site-dot-red)", green: "var(--site-dot-green)", yellow: "var(--site-dot-yellow)", pink: "var(--site-dot-pink)", sky: "var(--site-dot-sky)" };
  const buildMark = (svg) => {
    let x = 0;
    const cells = [], bars = [], dots = [];
    LETTERS.forEach((L) => {
      for (let c = 0; c < L.w; c++) for (let r = 0; r < 3; r++) cells.push(`<circle class="cell" cx="${x + c * P + P / 2}" cy="${r * P + P / 2}" r="${P / 2 - 1}"/>`);
      const list = L.block ? [[0, 0, L.w - 1, 2]] : L.bars;
      list.forEach(([c0, r0, c1, r1]) => {
        const rx = L.block ? P * 0.62 : P / 2;
        bars.push(`<rect class="bar" data-x="${x + c0 * P}" data-y="${r0 * P}" x="${x + c0 * P}" y="${r0 * P}" width="${(c1 - c0 + 1) * P}" height="${(r1 - r0 + 1) * P}" rx="${rx}" ry="${rx}"/>`);
      });
      L.dots.forEach(([col, c, r]) => dots.push(`<g class="dot-wrap"><circle class="dot" cx="${x + c * P + P / 2}" cy="${r * P + P / 2}" r="${P / 2}" fill="${COLORS[col]}"/></g>`));
      x += L.w * P + GAP;
    });
    const W = x - GAP;
    svg.setAttribute("viewBox", `0 -${P * 0.4} ${W} ${P * 3.4}`);
    svg.classList.add("m-mark");
    svg.innerHTML = `<g class="cells">${cells.join("")}</g><g class="bars">${bars.join("")}</g><g class="dots">${dots.join("")}</g>`;
    return { svg, W, cells: [...svg.querySelectorAll(".cell")], bars: [...svg.querySelectorAll(".bar")], dots: [...svg.querySelectorAll(".dot")], wraps: [...svg.querySelectorAll(".dot-wrap")] };
  };
  // Original timing (from when the page appears): 3.5s empty circle grid → 4.3s letters rise from 30px below over 1s (0,0,0,1) → 4.8s dots fall from their own heights, bounce and settle (appear over .4s)
  // at is time already elapsed (negative, seconds) — advanced by the time spent waiting for the font
  const playMark = (m, at = 0) => {
    const tl = gsap.timeline();
    gsap.set(m.cells, { opacity: 0 });
    gsap.set(m.bars, { opacity: 0, y: 30 });
    tl.to(m.cells, { opacity: 1, duration: 0.6, ease: EASE, stagger: { each: 0.01, from: "start" } }, 3.5);
    tl.to(m.bars, { opacity: 1, y: 0, duration: 1, ease: EASE_OUT }, 4.3);
    tl.to(m.cells, { opacity: 0, duration: 1, ease: EASE_OUT }, 4.3);
    // Dot size is in SVG units, so the original height measured in screen px is converted to SVG units
    const unit = m.W / Math.max(1, m.svg.getBoundingClientRect().width);
    m.dots.forEach((d, i) => {
      const [, drop, dur] = DOT_MOTION[i % DOT_MOTION.length];
      d.setAttribute("data-fx-bounce-ball", `drop: ${Math.round(drop * unit)}; dur: ${dur}; bounciness: .5; squash: .2; delay: ${4.8 + at}; opacity: 0; fade: .4; loop: false`);
      d.setAttribute("data-fx", "bounce-ball");
    });
    if (at < 0) tl.seek(-at);
    return tl;
  };
  // Each dot has a different scroll speed (105~125%) so on scroll they scatter, exiting upward faster than the text — Framer scroll speed: y = −(speed − 1) × scroll
  const dotSpeed = (m) => {
    const ks = m.wraps.map((w, i) => (DOT_MOTION[i % DOT_MOTION.length][0] - 100) / 100);
    const unit = () => m.W / Math.max(1, m.svg.getBoundingClientRect().width);
    const move = () => { const u = unit(), y = scrollY; m.wraps.forEach((w, i) => w.setAttribute("transform", `translate(0 ${-ks[i] * y * u})`)); };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: move, onRefresh: move });
    move();
  };

  // ── Markup to insert ──
  // A color line drawn when hovering each menu row — the primary colors of the original wordmark dots (red·green·yellow·blue)
  const NAV = [["about.html", "Company", "Company info", "red"], ["index.html#product", "Our Product", "Service", "green"], ["index.html#news", "News", "News", "yellow"], ["index.html#careers", "Careers", "Hiring", "blue"]];
  const head = document.querySelector('[data-slot="header"]');
  // Like the original, a div button — an icon on the folded plate that leaves the document when opened, and the × inside the plate takes the same spot
  const btn = document.createElement("div");
  btn.className = "m-menu-btn";
  btn.setAttribute("role", "button");
  btn.tabIndex = 0;
  btn.setAttribute("aria-label", "Open Menu");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = `<svg viewBox="0 0 16 11" fill="none" stroke="currentColor" stroke-width="1.67"><path d="M0 .8h16M0 5.5h16M0 10.2h16"/></svg>`;
  if (head) {
    head.className = "m-header";
    head.innerHTML = `<a class="m-logo" href="index.html" aria-label="Back to start">LOGOTYPE</a><div class="m-header__r"></div>`;
    head.lastChild.append(btn);
  }
  const menu = document.createElement("div");
  menu.className = "m-menu";
  menu.dataset.slot = "menu";
  menu.innerHTML = `<i class="m-menu__bg" aria-hidden="true"></i>
    <div class="m-menu__in" role="dialog" aria-label="Menu">
      <div class="m-menu__top"><p class="m-lang"><span aria-current="true">JA</span><span>EN</span></p><div class="m-menu__close" role="button" tabindex="0" aria-label="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.67"><path d="M2 2l12 12M14 2 2 14"/></svg></div></div>
      <nav>${NAV.map(([h, en, ko, c]) => `<a href="${h}"><span class="m-menu__t"><b>${en}</b><small>${ko}</small></span><span class="m-menu__line" style="--line: var(--site-dot-${c})"><i></i><i></i></span></a>`).join("")}</nav>
      <a class="m-menu__privacy" href="#">Privacy Policy</a>
    </div>`;
  body.append(menu);

  const careers = document.querySelector('[data-slot="careers"]');
  if (careers) {
    careers.classList.add("m-careers", "m-wrap");
    careers.id = careers.id || "careers";
    careers.innerHTML = `<p class="m-label">Careers</p>
      <div class="m-careers__pic"><div class="wf-img" data-label="Silhouettes of people sitting around in a dark room · black and white · single spotlight · near-portrait square"></div></div>
      <div class="m-careers__lines" data-careers-lines><p>Big Line Number One.</p><p>Second Line Goes Here.</p><p>Third Line Closes With Us.</p></div>
      <a class="m-careers__card" href="#">
        <h3>Your one line inviting people to build together here.</h3>
        <p>Your two lines here on what field of people you are looking for.<br>End the last line short.</p>
        <p class="m-touch">Get In Touch<span class="m-touch__sw"></span></p>
      </a>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "m-foot";
    const phrase = "Headline Goes Here.";
    foot.innerHTML = `<div class="m-band" aria-hidden="true"><div data-band>${Array.from({ length: 24 }, () => `<span>${phrase}</span>`).join("")}</div></div>
      <div class="m-foot__mark m-wrap"><svg data-foot-mark aria-hidden="true"></svg></div>
      <div class="m-foot__row m-wrap">
        <a class="m-foot__logo" href="index.html">LOGOTYPE</a>
        <nav class="m-foot__nav">${NAV.map(([h, en, ko], i) => `<a class="m-foot__link m-foot__link--${i + 1}" href="${h}">${en}<small>${ko}</small></a>`).join("")}</nav>
        <p class="m-foot__copy">© Company, Inc.</p>
        <a class="m-foot__privacy" href="#">Privacy Policy</a>
      </div>`;
    buildMark(foot.querySelector("[data-foot-mark]"));
  }

  const veil = document.createElement("div");
  veil.className = "m-veil";
  body.append(veil);

  // ── Lenis ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Menu panel: the original’s three Framer variants — collapsed (40px circle) → pill (width only) → panel 200ms later (height too) ──
  // On every change, measure the panel’s front and back boxes, restore the panel placed in the new box to its front face, and release it over .3s to (0,0,0,1) (center-axis translate·scale).
  // Corners are divided by the stretched scale so they still look 20px while expanding
  const bg = menu.querySelector(".m-menu__bg"), close = menu.querySelector(".m-menu__close");
  const items = [...menu.querySelectorAll("nav a")], logo = head?.querySelector(".m-logo");
  const RADIUS = 20;
  let boxTw = null;
  const box = (state) => {
    const a = bg.getBoundingClientRect();
    boxTw?.kill();
    bg.style.transform = bg.style.borderRadius = "";
    if (state) menu.dataset.box = state; else delete menu.dataset.box;
    if (reduce) return;
    const b = bg.getBoundingClientRect();
    const s = { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), sx: a.width / b.width, sy: a.height / b.height };
    const draw = () => {
      bg.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.sx}, ${s.sy})`;
      bg.style.borderRadius = `${RADIUS / s.sx}px / ${RADIUS / s.sy}px`;
    };
    draw();
    boxTw = gsap.to(s, { x: 0, y: 0, sx: 1, sy: 1, duration: 0.3, ease: EASE_OUT, onUpdate: draw, onComplete: () => (bg.style.transform = bg.style.borderRadius = "") });
  };
  // Sequence after the board is fully up (original values): the × turns on at .3s (0,0,0,1), and the menu rows slide in from 120px to the right, delayed .2·.3·.4·.5s, over .4s (0,0,0,1).
  // The language button and Privacy are placed immediately with the panel
  let step = null;
  const compact = () => innerWidth < 1200;
  const setMenu = (on) => {
    if (on === (menu.classList.contains("is-open") || !!step)) return;
    step?.kill();
    step = null;
    btn.setAttribute("aria-expanded", String(on));
    gsap.killTweensOf([close, ...items, logo].filter(Boolean));
    if (on) {
      const focused = document.activeElement === btn;
      btn.remove();
      box("pill");
      // Narrow width: the logo becomes white text inside the panel and a 16px left margin appears — like the original layout animation, it moves from its old position at .3s
      if (compact() && logo) {
        head.classList.add("is-menu");
        if (!reduce) gsap.fromTo(logo, { x: -16 }, { x: 0, duration: 0.3, ease: EASE_OUT, clearProps: "transform" });
      }
      const full = () => {
        step = null;
        box("open");
        menu.classList.add("is-open");
        if (reduce) { gsap.set(close, { opacity: 1 }); gsap.set(items, { opacity: 1, x: 0 }); }
        else {
          gsap.fromTo(close, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE_OUT });
          gsap.set(items, { opacity: 0, x: 120 });
          items.forEach((a, i) => gsap.to(a, { opacity: 1, x: 0, duration: 0.4, ease: EASE_OUT, delay: 0.2 + i * 0.1 }));
        }
        if (focused) close.focus({ preventScroll: true });
      };
      if (reduce) full(); else step = gsap.delayedCall(0.2, full);
    } else {
      const focused = menu.contains(document.activeElement);
      menu.classList.remove("is-open");
      gsap.set(close, { clearProps: "opacity" });
      gsap.set(items, { clearProps: "opacity,transform" });
      box("");
      head?.lastChild.append(btn);
      if (head?.classList.contains("is-menu")) {
        head.classList.remove("is-menu");
        if (!reduce) gsap.fromTo(logo, { x: 16 }, { x: 0, duration: 0.3, ease: EASE_OUT, clearProps: "transform" });
      }
      if (focused) btn.focus({ preventScroll: true });
    }
  };
  const press = (el, fn) => {
    el.addEventListener("click", fn);
    el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), fn()));
  };
  press(btn, () => setMenu(true));
  press(close, () => setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  document.addEventListener("click", (e) => { if (menu.classList.contains("is-open") && !menu.contains(e.target)) setMenu(false); });
  // Menu row hover reaction (original values): text with .5 bounce .2 · .4s spring, color row from 0 → 100% with stiffness 500 · damping 60 (the gray row shrinks by that much)
  const lineSpring = spring({ stiffness: 500, damping: 60 }), textSpring = spring({ bounce: 0.2, duration: 0.4 });
  items.forEach((a) => {
    const t = a.querySelector(".m-menu__t"), [c, g] = a.querySelectorAll(".m-menu__line i");
    const go = (on) => {
      if (reduce) return;
      gsap.to(t, { opacity: on ? 0.5 : 1, duration: textSpring.duration, ease: textSpring.ease, overwrite: "auto" });
      gsap.to(c, { width: on ? "100%" : "0%", duration: lineSpring.duration, ease: lineSpring.ease, overwrite: "auto" });
      gsap.to(g, { width: on ? "0%" : "100%", duration: lineSpring.duration, ease: lineSpring.ease, overwrite: "auto" });
    };
    a.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && go(true));
    a.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && go(false));
  });

  // ── Page Turn ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === (location.pathname.split("/").pop() || "index.html")) {
      if (!hash) return;
      e.preventDefault();
      setMenu(false);
      const t = document.getElementById(hash);
      if (t) (lenis ? lenis.scrollTo(t, { offset: -40 }) : t.scrollIntoView());
      return;
    }
    e.preventDefault();
    body.classList.add("is-leaving");
    setTimeout(() => (location.href = href), reduce ? 0 : 400);
  });
  addEventListener("pageshow", (e) => e.persisted && body.classList.remove("is-leaving"));

  // ── Learn More: original ‹Right Arrow Reveal› — on hover the left circle shrinks and the right circle grows, and the left cell folds so the text shifts left by that much.
  // The text and growing circle use a layout spring (stiffness 300 · damping 20 · mass 1.25). The shrinking circle overshoots and flips twice, then snaps in at the start of the third flip,
  // Matched to the flip window measured on the original (first half-cycle 250ms, window 550ms), set to the same damping ratio (.516) with mass 1.3 · .677s (the 483ms scale length is kept too)
  // The arrow fades to .13 and back (.32s), exactly as measured from the original
  const loose = spring({ stiffness: 300, damping: 20, mass: 1.25 }), looseScale = spring({ stiffness: 300, damping: 20.4, mass: 1.3, until: 0.677 });
  const DIM = [0, 0.04, 0.16, 0.33, 0.52, 0.69, 0.82, 0.94, 1, 0.92, 0.78, 0.62, 0.47, 0.34, 0.23, 0.14, 0.09, 0.04, 0.02, 0];
  const FRAME = 1 / 60;
  document.querySelectorAll(".m-more").forEach((a) => {
    const t = a.querySelector(".m-more__t"), dot = a.querySelector(".m-more__c i"), arrow = dot?.querySelector("b");
    if (!t || !dot || reduce) return;
    const right = document.createElement("i");
    right.className = "m-more__r";
    right.innerHTML = "<b></b>";
    a.append(right);
    gsap.set(right, { scale: 0 });
    const flip = (on) => {
      if (!a.style.width) a.style.width = `${a.offsetWidth}px`;
      const seen = t.getBoundingClientRect().left;
      a.classList.toggle("is-hover", on);
      const from = seen - (t.getBoundingClientRect().left - gsap.getProperty(t, "x"));
      gsap.fromTo(t, { x: from }, { x: 0, duration: loose.duration, ease: loose.ease, overwrite: true });
      const shrink = { scale: 0, duration: looseScale.duration, ease: looseScale.ease };
      const grow = { scale: 1, duration: loose.duration, ease: loose.ease };
      gsap.to(dot, { ...(on ? shrink : grow), overwrite: true });
      gsap.to(right, { ...(on ? grow : shrink), overwrite: true });
      if (arrow) gsap.to(arrow, { keyframes: DIM.map((d) => ({ opacity: 1 - d * 0.87, duration: FRAME, ease: "none" })), overwrite: true });
    };
    // Framer moves position in the picture after changing state — flip one frame later so the text snaps out from its own spot
    a.addEventListener("pointerenter", () => requestAnimationFrame(() => flip(true)));
    a.addEventListener("pointerleave", () => requestAnimationFrame(() => flip(false)));
  });

  // Interaction opacity: the original (Framer) is a JS animation that starts counting time from the moment of the event, so it moves about two frames earlier than a CSS transition (which counts from the next style recalculation) — we use GSAP to start right at the event
  const S4 = spring({ bounce: 0.2, duration: 0.4 }), S6 = spring({ bounce: 0.2, duration: 0.6 });
  const fade = (el, enter, leave) => {
    if (!el) return;
    const go = (v) => gsap.to(el, { ...v, ...(reduce && { duration: 0 }), overwrite: "auto" });
    el.addEventListener("pointerenter", () => go(enter));
    el.addEventListener("pointerleave", () => go(leave));
  };
  // Scroll Down enters with bounce .2 · .4s and exits in .6s · logo springs to .3 over .4s · menu links go to .4 over .4s (0,0,0,1), spring on exit
  fade(document.querySelector(".hm-hero__down"), { opacity: 0.2, duration: S4.duration, ease: S4.ease }, { opacity: 1, duration: S6.duration, ease: S6.ease });
  fade(document.querySelector(".m-foot__logo"), { opacity: 0.3, duration: S4.duration, ease: S4.ease }, { opacity: 1, duration: S4.duration, ease: S4.ease });
  document.querySelectorAll(".m-foot__link, .m-foot__privacy").forEach((el) => fade(el, { opacity: 0.4, duration: 0.4, ease: EASE_OUT }, { opacity: 1, duration: S4.duration, ease: S4.ease }));

  // ── Background color: data-bg="dark" While the section passes the center of the screen, ink-black ──
  const bgZones = () => {
    // When sections touch, the exit and enter callback order can cross, so decide by whether any section is on at all
    const zones = [];
    const paint = () => body.classList.toggle("is-dark", zones.some((z) => z.isActive));
    document.querySelectorAll('[data-bg="dark"]').forEach((el) => zones.push(ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: paint })));
    paint();
  };

  const scenes = [];
  window.mSite = { reduce, isPhone, lenis, buildMark, playMark, dotSpeed, spring, fade, scene: (fn) => scenes.push(fn), EASE, EASE_OUT };

  const start = () => {
    bgZones();
    // Three recruiting lines: while entering, lines 1 and 3 come from the right and line 2 from the left into place
    const lines = document.querySelectorAll("[data-careers-lines] p");
    if (lines.length && !reduce) {
      gsap.timeline({ scrollTrigger: { trigger: "[data-careers-lines]", start: "top bottom", end: "bottom 55%", scrub: true } })
        .fromTo(lines[0], { x: 330 }, { x: 0, ease: "none" }, 0)
        .fromTo(lines[1], { x: -160 }, { x: 0, ease: "none" }, 0)
        .fromTo(lines[2], { x: 330 }, { x: 0, ease: "none" }, 0);
    }
    const band = document.querySelector("[data-band]");
    if (band && !reduce) gsap.to(band, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    scenes.forEach((fn) => fn(window.mSite));
    ScrollTrigger.refresh();
  };
  const boot = () => (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(start));
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
})();
