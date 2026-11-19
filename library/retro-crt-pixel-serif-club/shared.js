// Draws the same menu, loader, transition, CRT and footer for all four pages in one place. The original uses a barba 2.10.3 sync transition, so the menu and transition curtain stay as they are and
// [data-barba="container"] only the box is swapped — the page script is registered with TDS.page(name, attach), attached when the box enters and detached when it leaves.
// Curve “osmo” 0.625,0.05,0,1 is the gsap default (0.6s), loader curve “loader” 0.65,0.01,0.05,0.99. Lenis lerp .05.
(() => {
  const plugins = [window.ScrollTrigger, window.CustomEase, window.SplitText, window.ScrambleTextPlugin, window.Draggable, window.Observer, window.InertiaPlugin].filter(Boolean);
  gsap.registerPlugin(...plugins);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const rmq = matchMedia("(prefers-reduced-motion: reduce)");
  const TDS = (window.TDS = { reduced: rmq.matches, lenis: null, pages: {} });
  rmq.addEventListener?.("change", (e) => (TDS.reduced = e.matches));
  // prep runs before shared motion (text splitting · stickers) is attached — e.g. cloning a second copy of an endlessly turning row
  TDS.page = (ns, init, prep) => (TDS.pages[ns] = Object.assign(init, { prep }));
  // The original doesn’t split hand responses by whether there is a mouse — only the pixel photo swap switches to press on touch devices
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)").matches;
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Teardown bundle — gathers listeners, tickers and tweens, and clears them all at once when the box is removed
  const kit = () => {
    const fns = [];
    return {
      add: (fn) => fns.push(fn),
      on(el, ev, fn, o) { el.addEventListener(ev, fn, o); fns.push(() => el.removeEventListener(ev, fn, o)); },
      kill() { while (fns.length) { try { fns.pop()(); } catch (e) { /* Already Removed Elements */ } } },
    };
  };
  TDS.kit = kit;

  // ── Pixel art: the original stickers and emblems replaced with our own pixel art of the same size and feel. # = Seven, o = Cotton (white inner)
  const ART = {
    heart: [".##...##.", "#oo#.#oo#", "#ooo#ooo#", "#ooooooo#", ".#ooooo#.", "..#ooo#..", "...#o#...", "....#...."],
    flame: ["....#....", "...#o#...", "..#oo#...", "..#ooo#..", ".#oo#oo#.", ".#o#.#o#.", "#oo#.#oo#", "#o#...#o#", "#o#.#.#o#", ".#o###o#.", "..#ooo#..", "...###..."],
    mug: [".#######...", "#ooooooo#..", "#########..", "#ooooooo###", "#o#o#o#o#.#", "#o#o#o#o#.#", "#o#o#o#o###", "#ooooooo#..", ".#######..."],
    star: ["....#....", "....#....", "...#o#...", "####o####", ".#ooooo#.", "..#ooo#..", ".#o#.#o#.", ".#.....#."],
    eye: ["....#....", "...#o#...", "..#ooo#..", ".#o###o#.", "#o##o##o#", ".#o###o#.", "..#ooo#..", "...#o#...", "....#...."],
    phones: ["..#####..", ".#ooooo#.", "#o#...#o#", "#.#...#.#", "#.#...#.#", "##o#.#o##", "#oo#.#oo#", "#oo#.#oo#", ".##...##."],
    spark: ["...#...", "...#...", "..#o#..", "##ooo##", "..#o#..", "...#...", "...#..."],
  };
  // Almond eye at the center of the eight-pointed star — hero top and bottom, loader and menu logo all use the same statement
  ART.emblem = (() => {
    const n = 25, c = 12, rows = [];
    for (let y = 0; y < n; y++) {
      let r = "";
      for (let x = 0; x < n; x++) {
        const dx = x - c, dy = y - c, ax = Math.abs(dx), ay = Math.abs(dy), d2 = dx * dx + dy * dy;
        let ch = ".";
        if ((ax <= 1 && ay <= 12 - ax * 4) || (ay <= 1 && ax <= 12 - ay * 4)) ch = "#";
        if (ax === ay && ax <= 9) ch = "#";
        if (Math.abs(ax - ay) === 1 && ax + ay <= 11) ch = "#";
        if (d2 <= 40) ch = "#";
        if (ax <= 5 && ay <= 2.6 - (dx * dx) / 10) ch = "o";
        if (d2 <= 2) ch = "#";
        r += ch;
      }
      rows.push(r);
    }
    return rows;
  })();
  const px = (name, cls = "") => {
    const rows = ART[name], w = Math.max(...rows.map((r) => r.length)), h = rows.length;
    let ink = "", face = "";
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      const cell = `M${x} ${y}h1v1h-1z`;
      if (ch === "#") ink += cell;
      else if (ch === "o") face += cell;
    }));
    return `<svg class="tds-px ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${face ? `<path class="px-face" d="${face}"/>` : ""}<path class="px-ink" d="${ink}"/></svg>`;
  };
  TDS.px = px;
  const ARROW = '<svg class="bb__svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l10 10M15 6v9H6"/></svg>';
  TDS.bubble = (label, href = "#", extra = "") =>
    `<a class="bb ${extra}" href="${href}"><span class="bb__arrow">${ARROW}</span><span class="bb__content"><span>${label}</span></span><span class="bb__arrow is-dup">${ARROW}</span></a>`;

  const PAGES = [["index.html", "Welcome"], ["news.html", "Gatherings"], ["about.html", "In short"], ["contact.html", "Contact"]];
  const SOCIAL = ["Photobook", "Postcard", "Product"];
  const here = (location.pathname.split("/").pop() || "index.html");
  const scr = (txt, cls) => `<span class="${cls}" data-scramble-hover="target">${txt}</span>`;

  // ── Menu: a 25em pill at the top center, opens in two stages when pressed
  const nav = document.createElement("nav");
  nav.className = "tsn";
  nav.dataset.slot = "nav";
  nav.setAttribute("data-twostep-nav", "");
  nav.dataset.navStatus = "not-active";
  nav.innerHTML = `
  <div class="tsn__bg" data-nav-toggle="close"></div>
  <div class="tsn__wrap"><div class="tsn__width"><div class="tsn__bar">
    <div class="tsn__back"><div class="tsn__back-bg"></div></div>
    <div class="tsn__top">
      <a class="tsn__logo" href="index.html" aria-label="To the first page">${px("emblem")}<span data-label="Brand English name">Society Name</span></a>
      <button class="tsn__toggle" type="button" data-nav-toggle="toggle" aria-label="Open and close menu"><span class="tsn__toggle-bar"></span><span class="tsn__toggle-bar"></span></button>
      <div class="tsn__top-line"></div>
    </div>
    <div class="tsn__bottom"><div class="tsn__bottom-overflow"><div class="tsn__bottom-inner"><div class="tsn__bottom-row">
      <div class="tsn__col"><div class="tsn__info">
        <ul class="tsn__ul">${PAGES.map(([h, t]) => `<li data-scramble-hover="link"><a class="tsn__link" href="${h}" data-nav-link${h === here ? ' aria-current="page"' : ""}>${scr(t, "tsn__link-span")}</a></li>`).join("")}</ul>
        <ul class="tsn__ul is-small">${SOCIAL.map((t) => `<li data-scramble-hover="link"><a class="tsn__link" href="#">${scr(t, "tsn__link-eyebrow")}</a></li>`).join("")}</ul>
      </div></div>
      <div class="tsn__col is-visual"><div class="tsn__visual" data-label="Menu illustration · green background with eyes that roll to follow the mouse">
        <svg viewBox="0 0 100 60" aria-hidden="true"><path d="M2 30 C22 4 78 4 98 30 C78 56 22 56 2 30Z" fill="none" stroke="currentColor" stroke-width="5"/><g data-move="iris"><rect x="38" y="18" width="24" height="24" fill="currentColor"/><rect x="46" y="26" width="8" height="8" class="px-bg"/></g></svg>
      </div></div>
    </div></div></div></div>
  </div></div></div>`;
  document.body.prepend(nav);

  const trans = document.createElement("div");
  trans.className = "tr";
  trans.setAttribute("data-transition-wrap", "");
  trans.innerHTML = '<div class="tr__panel" data-transition-panel><div class="tr__col" data-transition-col><div class="tr__pixel" data-transition-pixel></div></div></div>';
  nav.after(trans);

  // ── CRT overlay — red -.8px · blue +.8px offset via an SVG filter, the rest are five fixed films ──
  const crt = document.createElement("div");
  crt.innerHTML = `<svg class="crt-defs" aria-hidden="true"><defs><filter id="tds-chroma" x="0%" y="0%" width="100%" height="100%">
    <feOffset in="SourceGraphic" dx="-0.8" dy="0" result="r"/><feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rOnly"/>
    <feOffset in="SourceGraphic" dx="0.8" dy="0" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bOnly"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gOnly"/>
    <feBlend in="rOnly" in2="gOnly" mode="screen" result="rg"/><feBlend in="rg" in2="bOnly" mode="screen"/></filter></defs></svg>
    <div class="crt-grain"></div><div class="crt-scan"></div><div class="crt-glare"></div><div class="crt-vignette"></div><div class="crt-bezel"></div>`;
  document.body.append(...crt.childNodes);
  document.documentElement.classList.add("tds-chroma");

  // ── Footer: slot marker per box (data-slot=Drawn in footer)
  const win = (cls, label, links, select) => `
    <div class="fw ${cls}${select ? " is-soft" : ""}" data-sticker="item">
      <div class="fw__grip"><i></i><i></i></div>
      <div class="fw__head"><span class="fw__label" data-swipe>${label}</span><span class="fw__label">[+]</span></div>
      <div class="fw__body">${links}</div>
    </div>`;
  const STAR = '<span class="mq__star">' + px("spark") + "</span>";
  const footer = (root) => {
    const slot = root.querySelector('[data-slot="footer"]');
    if (!slot || slot.dataset.built) return;
    slot.dataset.built = "1";
    const item = '<div class="mq__item"><p class="mq__p" data-label="Footer marquee English one line">A long running line of mono text goes here, repeating across the footer</p>' + STAR + "</div>";
    slot.classList.add("ft-main");
    slot.innerHTML = `
    <div class="ft-wrap" data-footer-parallax>
      <footer class="ft" data-footer-parallax-inner>
        <div class="ft__stage"><div class="ft__el">
          ${win("is-site", "Website", PAGES.map(([h, t]) => `<a class="fw__link" href="${h}" data-scramble-hover="link">${scr(`[${t}]`, "")}</a>`).join(""), true)}
          <p class="ft__word" data-deform data-label="Brand English name · Two lines">Group Name<br>Society</p>
          ${win("is-social", "Social", SOCIAL.map((t) => `<a class="fw__link" href="#" data-scramble-hover="link">${scr(`[${t}]`, "")}</a>`).join(""), false)}
        </div></div>
        <div class="ft__marquee"><div class="mq" data-css-marquee><div class="mq__list" data-css-marquee-list>${item.repeat(4)}</div></div></div>
        <div class="ft__cropped" data-label="Two brand initials + ©">
          <div class="ft__letter"><p class="ft__big">S</p></div><div class="ft__letter"><p class="ft__big">N</p></div><div class="ft__letter"><p class="ft__big">©</p></div>
        </div>
      </footer>
      <div class="ft-wrap__dark" data-footer-parallax-dark></div>
    </div>`;
  };

  // ── Once globally: menu open and close · eyes · mail copy · tab renaming
  const setNav = (s) => (nav.dataset.navStatus = s);
  TDS.closeNav = () => setNav("not-active");
  nav.querySelectorAll('[data-nav-toggle="toggle"]').forEach((b) => b.addEventListener("click", () => setNav(nav.dataset.navStatus === "active" ? "not-active" : "active")));
  nav.querySelectorAll('[data-nav-toggle="close"]').forEach((b) => b.addEventListener("click", TDS.closeNav));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.dataset.navStatus === "active") TDS.closeNav(); });
  addEventListener("mousemove", (e) => {
    const r = e.clientX / innerWidth - 0.5, n = e.clientY / innerHeight - 0.5;
    document.querySelectorAll('[data-move="iris"]').forEach((t) => (t.style.transform = `translate(${r * 30}px, ${n * 30}px)`));
  });
  // Lay the alert box in advance — so its width does not change from downloading the Korean font on the first press
  const snack = Object.assign(document.createElement("div"), { className: "tds-snack", textContent: "Address copied" });
  document.body.append(snack);
  let snackT = 0;
  const say = (msg) => {
    snack.textContent = msg;
    void snack.offsetWidth;
    snack.classList.add("is-visible");
    clearTimeout(snackT);
    snackT = setTimeout(() => snack.classList.remove("is-visible"), 2200);
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-copy-email]");
    if (!t) return;
    e.preventDefault();
    const v = t.getAttribute("data-copy-email") || t.textContent.trim();
    (navigator.clipboard && isSecureContext ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => say("Address copied"), () => say("Couldn’t copy"));
  });
  const baseTitle = () => document.title;
  let keepTitle = baseTitle();
  addEventListener("blur", () => { keepTitle = baseTitle(); document.title = "Will you visit again?"; });
  addEventListener("focus", () => (document.title = keepTitle));

  // ── Letter shuffle (on hover 1.2s, returns to its own letters in 1s on release)
  const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#";
  const scramble = (scope, k) => scope.querySelectorAll('[data-scramble-hover="link"]').forEach((link) => {
    if (link.__scr) return;
    const t = link.querySelector('[data-scramble-hover="target"]');
    if (!t || !window.ScrambleTextPlugin) return;
    link.__scr = true;
    const text = t.textContent;
    // The original mono typeface keeps its width while shuffling — this is a proportional substitute font, so widths are locked to the initial width (the window sticker magnet pulls toward the link center)
    const lock = link.matches(".fw__link") ? link : t.matches(".fw__link") ? t : null;
    if (lock) lock.style.width = Math.ceil(lock.getBoundingClientRect().width) + "px";
    const on = () => gsap.to(t, { duration: 1.2, scrambleText: { text, chars: CH } });
    const off = () => gsap.to(t, { duration: 1, scrambleText: { text, speed: 1, chars: CH } });
    if (k) { k.on(link, "mouseenter", on); k.on(link, "mouseleave", off); k.add(() => (link.__scr = false)); }
    else { link.addEventListener("mouseenter", on); link.addEventListener("mouseleave", off); }
  });
  scramble(nav);

  // ── Draggable sticker: lifts at 1.05× and −1~1° when dragged, tilts with horizontal speed ×.08 (±14°), and on release is pulled up to 5px depending on its distance from the center
  const stickers = (root, k) => {
    const items = root.querySelectorAll('[data-sticker="item"]');
    if (!items.length || !window.Draggable) return;
    const bounds = root.matches('[data-sticker="wrap"]') ? root : root.querySelector('[data-sticker="wrap"]');
    let z = 100;
    const soft = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.9);
    items.forEach((el) => {
      let sx = 0, sy = 0, moved = false;
      const [d] = Draggable.create(el, {
        bounds: bounds || undefined, dragResistance: 0.1, minimumMovement: 8, allowEventDefault: true, zIndexBoost: false,
        onPress(e) { moved = false; const p = e.touches ? e.touches[0] : e; sx = p.clientX; sy = p.clientY; },
        onDragStart() { moved = true; this.target.style.zIndex = z < 990 ? ++z : 990; gsap.to(this.target, { scale: 1.05, rotation: gsap.utils.random(-1, 1), filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.12))", duration: 0.25 }); },
        onDrag() { gsap.to(this.target, { rotation: gsap.utils.clamp(-14, 14, 0.08 * this.deltaX), duration: 0.2, ease: "power3.out", overwrite: true }); },
        onRelease(e) {
          gsap.to(this.target, { scale: 1, rotation: 0, ease: "power3.out", filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))", duration: 0.25, overwrite: true });
          if (moved) return;
          const p = e.changedTouches ? e.changedTouches[0] : e;
          if (Math.hypot(p.clientX - sx, p.clientY - sy) >= 8) return;
          const hit = document.elementFromPoint(p.clientX, p.clientY);
          const target = hit && hit !== this.target && hit.closest("a, button, [data-clickable]");
          if (target) setTimeout(() => target.click(), 10);
        },
      });
      k.add(() => d.kill());
      gsap.set(el, { xPercent: 0, yPercent: 0 });
      k.on(el, "mousemove", (e) => {
        if (Draggable.get(el)?.isDragging) return;
        const r = el.getBoundingClientRect();
        const u = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), v = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const gx = Math.round(soft(gsap.utils.clamp(-1, 1, u)) * 5), gy = Math.round(soft(gsap.utils.clamp(-1, 1, v)) * 5);
        gsap.to(el, { xPercent: (gx / r.width) * 100, yPercent: (gy / r.height) * 100, duration: 0.22, ease: "power3.out", overwrite: "auto" });
      });
      k.on(el, "mouseleave", () => gsap.to(el, { xPercent: 0, yPercent: 0, duration: 0.28, ease: "power3.out", overwrite: "auto" }));
    });
  };

  // ── Highlighter band reveal: the band covering each line folds to the right edge in .9s power3.inOut (.1s between lines), once at 95% of the screen
  const markers = (root, k) => root.querySelectorAll("[data-marker]").forEach((el) => {
    const color = cssVar("--kf-accent");
    const split = SplitText.create(el, {
      type: "lines", linesClass: "hm-line", autoSplit: true,
      onSplit(self) {
        el.querySelectorAll(".hm-bar").forEach((b) => b.remove());
        el.__hm?.tl.kill(); el.__hm?.st.kill();
        const tl = gsap.timeline({ paused: true });
        self.lines.forEach((line, i) => {
          gsap.set(line, { position: "relative", overflow: "hidden" });
          const bar = Object.assign(document.createElement("div"), { className: "hm-bar" });
          Object.assign(bar.style, { backgroundColor: color, transformOrigin: "right center" });
          line.append(bar);
          tl.to(bar, { scaleX: 0, duration: 0.9, ease: "power3.inOut" }, i * 0.1);
        });
        gsap.set(el, { autoAlpha: 1 });
        const st = ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: () => tl.play() });
        el.__hm = { tl, st };
      },
    });
    k.add(() => { el.__hm?.tl.kill(); el.__hm?.st.kill(); split.revert(); });
  });

  // ── Sweep cover: block covers from the left in .5s, turns the text on, then clears to the right in .5s (power2.inOut). At 80% of the screen, reversed when scrolling back
  const swipes = (root, k) => root.querySelectorAll("[data-swipe]").forEach((el) => {
    const wrap = Object.assign(document.createElement("span"), { className: "sw-wrap" });
    el.before(wrap);
    wrap.append(el);
    const block = Object.assign(document.createElement("span"), { className: "sw-block" });
    wrap.append(block);
    gsap.set(el, { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 80%", toggleActions: "play none none reverse" } })
      .to(block, { duration: 0.5, scaleX: 1, transformOrigin: "left", ease: "power2.inOut" })
      .set(el, { autoAlpha: 1 })
      .to(block, { duration: 0.5, scaleX: 0, transformOrigin: "right", ease: "power2.inOut" });
    k.add(() => { tl.scrollTrigger?.kill(); tl.kill(); wrap.before(el); wrap.remove(); gsap.set(el, { clearProps: "all" }); });
  });

  // ── Line mask rise: each line from 110% below, 1s expo.out, .09s stagger, once at 80% of screen
  const headings = (root, k) => root.querySelectorAll('[data-split="heading"]').forEach((el) => {
    const s = SplitText.create(el, {
      type: "lines", mask: "lines", autoSplit: true, linesClass: "ln",
      onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: el, start: "clamp(top 80%)", once: true } }),
    });
    k.add(() => s.revert());
  });

  // ── Rising from beneath the footer: while the footer top goes from below the screen → up, the inside goes -55% → 0, darkness .3 → 0 (power1.in)
  const footerParallax = (root, k) => root.querySelectorAll("[data-footer-parallax]").forEach((el) => {
    const inner = el.querySelector("[data-footer-parallax-inner]"), dark = el.querySelector("[data-footer-parallax-dark]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true, invalidateOnRefresh: true } });
    if (inner) tl.fromTo(inner, { yPercent: -55 }, { yPercent: 0, ease: "power1.in" });
    if (dark) tl.fromTo(dark, { opacity: 0.3 }, { opacity: 0, ease: "power1.in" }, "<");
    k.add(() => { tl.scrollTrigger?.kill(); tl.kill(); });
  });

  // ── CSS marquee: append one more copy of the list, one loop per width / 75 seconds, paused when off screen
  const marquees = (root, k) => {
    const els = root.querySelectorAll("[data-css-marquee]");
    if (!els.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.querySelectorAll("[data-css-marquee-list]").forEach((l) => (l.style.animationPlayState = e.isIntersecting ? "running" : "paused"))), { threshold: 0 });
    els.forEach((el) => {
      if (!el.__mq) { el.__mq = true; el.querySelectorAll("[data-css-marquee-list]").forEach((l) => el.append(l.cloneNode(true))); }
      el.querySelectorAll("[data-css-marquee-list]").forEach((l) => { l.style.animationDuration = l.offsetWidth / 75 + "s"; l.style.animationPlayState = "paused"; });
      io.observe(el);
    });
    k.add(() => io.disconnect());
  };

  // ── Big text bending: scales 1.05x by cursor position · X axis ∓15° · Y axis ±15° · slant 5° (.1s ease-out), and straightens in .6s on release
  const deform = (root, k) => root.querySelectorAll("[data-deform]").forEach((el) => {
    k.on(el, "mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const o = (e.clientX - r.left - r.width / 2) / (r.width / 2), i = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = `perspective(1000px) scale(1.05) rotateX(${-15 * i}deg) rotateY(${15 * o}deg) skew(${5 * o}deg, ${5 * i}deg)`;
    });
    k.on(el, "mouseleave", () => {
      el.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
      el.style.transform = "perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg) skew(0deg, 0deg)";
    });
  });

  // ── Pixel photo swap: 8×8 cells turn on in shuffled order over .4s, at the instant everything is covered it swaps to another photo, then shuffles off again over .4s
  const pixelSwap = (root, k) => root.querySelectorAll("[data-pixel-swap]").forEach((card) => {
    const grid = card.querySelector("[data-pixel-swap-grid]"), active = card.querySelector("[data-pixel-swap-active]");
    if (!grid || !active) return;
    grid.replaceChildren();
    const N = 8, step = 100 / N;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const p = document.createElement("div");
      p.className = "pxs-cell";
      Object.assign(p.style, { width: step + "%", height: step + "%", left: c * step + "%", top: r * step + "%" });
      grid.append(p);
    }
    const cells = grid.children, each = 0.4 / cells.length;
    let on = false, call;
    const run = (to) => {
      on = to;
      gsap.killTweensOf(cells);
      call?.kill();
      gsap.set(cells, { display: "none" });
      gsap.to(cells, { display: "block", duration: 0, stagger: { each, from: "random" } });
      call = gsap.delayedCall(0.4, () => { active.style.display = to ? "block" : "none"; active.style.pointerEvents = to ? "none" : ""; });
      gsap.to(cells, { display: "none", duration: 0, delay: 0.4, stagger: { each, from: "random" } });
    };
    if (touch) k.on(card, "click", () => run(!on));
    else { k.on(card, "mouseenter", () => !on && run(true)); k.on(card, "mouseleave", () => on && run(false)); }
    k.add(() => { call?.kill(); gsap.killTweensOf(cells); });
  });

  // ── Section-end pixel cover: from when the section tail touches the screen bottom until it leaves at the top, cells turn on from the bottom row (per row 50 + 0~300 random + per column sin 30) (scrub .3)
  const pixelCover = (root, k) => {
    const wraps = root.querySelectorAll("[data-pixel-cover]");
    if (!wraps.length) return;
    const mm = gsap.matchMedia();
    mm.add({ d: "(min-width: 992px)", t: "(min-width: 768px) and (max-width: 991px)", l: "(min-width: 479px) and (max-width: 767px)", m: "(max-width: 478px)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.reduce) return;
      const made = [];
      wraps.forEach((w) => {
        const base = parseInt(w.dataset.columns, 10) || 12, rows = parseInt(w.dataset.rows, 10) || 6;
        const cols = c.conditions.m ? parseInt(w.dataset.columnsMobile, 10) || Math.max(4, Math.round(base * 0.4))
          : c.conditions.l ? Math.max(6, Math.round(base * 0.6)) : c.conditions.t ? parseInt(w.dataset.columnsTablet, 10) || Math.max(8, Math.round(base * 0.75)) : base;
        const panel = Object.assign(document.createElement("div"), { className: "pxc-panel" });
        for (let i = 0; i < cols; i++) {
          const col = Object.assign(document.createElement("div"), { className: "pxc-col" });
          for (let j = 0; j < rows; j++) col.append(Object.assign(document.createElement("div"), { className: "pxc-cell" }));
          panel.append(col);
        }
        w.append(panel);
        const order = [];
        panel.querySelectorAll(".pxc-col").forEach((col, ci) => [...col.children].forEach((cell, j) => order.push({ cell, p: 50 * (rows - 1 - j) + 300 * Math.random() + 30 * Math.sin(0.3 * ci) })));
        order.sort((a, b) => a.p - b.p);
        const cells = order.map((o) => o.cell);
        const sec = w.closest("section") || w.parentElement;
        gsap.set(cells, { autoAlpha: 0 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "clamp(bottom bottom)", end: "clamp(bottom top)", scrub: 0.3, invalidateOnRefresh: true } })
          .to(cells, { autoAlpha: 1, duration: 0.1, stagger: { amount: 1.5, from: "start" }, ease: "none" });
        made.push(() => { tl.scrollTrigger?.kill(); tl.kill(); panel.remove(); });
      });
      ScrollTrigger.refresh();
      return () => made.forEach((f) => f());
    });
    k.add(() => mm.revert());
  };

  // ── Scroll: Lenis lerp .05
  if (window.Lenis && !TDS.reduced) {
    const lenis = (TDS.lenis = new Lenis({ lerp: 0.05, wheelMultiplier: 1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Box Attach · Detach
  let mounted = null;
  const mount = (root) => {
    footer(root);
    root.querySelectorAll("[data-px]:empty").forEach((el) => (el.innerHTML = px(el.dataset.px)));
    root.querySelectorAll("[data-bubble]").forEach((el) => (el.outerHTML = TDS.bubble(el.dataset.bubble, el.dataset.href || "#", el.dataset.look || "")));
    TDS.pages[root.dataset.barbaNamespace]?.prep?.(root);
    const k = kit();
    const mm = gsap.matchMedia();
    scramble(root, k);
    stickers(root, k);
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
      const mk = kit();
      if (c.conditions.reduce) {
        gsap.set(root.querySelectorAll("[data-swipe], [data-marker]"), { autoAlpha: 1 });
        TDS.pages[root.dataset.barbaNamespace]?.(root, { k: mk, reduce: true });
        return () => mk.kill();
      }
      swipes(root, mk);
      markers(root, mk);
      headings(root, mk);
      footerParallax(root, mk);
      pixelCover(root, mk);
      TDS.pages[root.dataset.barbaNamespace]?.(root, { k: mk, reduce: false });
      return () => mk.kill();
    });
    marquees(root, k);
    deform(root, k);
    pixelSwap(root, k);
    mounted = { k, mm, root };
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.k.kill();
    mounted.mm.revert();
    mounted = null;
  };

  // ── Loader: the logo opens from the left on the 3s ‹loader› curve, and after the progress line fills, the group turns off in .5s and the curtain lifts up 101% in 1s
  // The curtain sits at the start of each html’s body (to cover from the first paint). The original loads and runs the site script after DOMContentLoaded, so this starts once fonts are ready after load
  const loader = () => {
    const wrap = document.querySelector("[data-load-wrap]");
    if (!wrap) return;
    wrap.querySelectorAll("[data-px]:empty").forEach((el) => (el.innerHTML = px(el.dataset.px)));
    if (TDS.reduced) { wrap.remove(); return; }
    const go = () => {
      const texts = [...wrap.querySelectorAll("[data-load-text]")];
      gsap.set(texts, { autoAlpha: 1 });
      const a = new SplitText(texts[0], { type: "lines,chars", mask: "lines" }), b = new SplitText(texts[1], { type: "lines,chars", mask: "lines" });
      gsap.set([a.chars, b.chars], { autoAlpha: 0, yPercent: 125 });
      const tl = gsap.timeline({ defaults: { ease: "loader", duration: 3 }, onComplete: () => wrap.remove() })
        .set(wrap, { display: "block" })
        .to(wrap.querySelector("[data-load-progress]"), { scaleX: 1 })
        .to(wrap.querySelector("[data-load-logo]"), { clipPath: "inset(0% 0% 0% 0%)" }, "<")
        .to(wrap.querySelector("[data-load-container]"), { autoAlpha: 0, duration: 0.5 })
        .to(wrap.querySelector("[data-load-progress]"), { scaleX: 0, transformOrigin: "right center", duration: 0.5 }, "<")
        .add("hideContent", "<")
        .to(wrap.querySelector("[data-load-bg]"), { yPercent: -101, duration: 1 }, "hideContent")
        .set(wrap, { display: "none" });
      tl.to(a.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, 0)
        .to(a.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, ">+=0.4")
        .to(b.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, "<")
        .to(b.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, "hideContent-=0.5");
    };
    // The original curtain stays still for about 1.2s after the first paint (time to download site scripts) and then starts — measured value as is (4.1s until the logo opens)
    const HOLD = 1200;
    const later = () => {
      const fp = performance.getEntriesByType("paint")[0]?.startTime ?? 0;
      setTimeout(go, Math.max(0, fp + HOLD - performance.now()));
    };
    const ready = () => (document.fonts?.ready ? document.fonts.ready.then(later) : later());
    document.readyState === "complete" ? ready() : addEventListener("load", ready, { once: true });
  };
  loader();

  // ── Page transition (as in the original): 12-row square cells turn on shuffled, each row .025s later, .3s power1.in, covering at .6s, and
  //    The moment it is covered, remove the old box and show the new one, then it clears in the same order with .3s power1.out. The new box goes to the top after 1.3s
  const COLS = 12, DUR = 1.2, FADE = 0.3;
  const pixelGrid = (portrait) => {
    const panel = trans.querySelector("[data-transition-panel]");
    const rect = panel.getBoundingClientRect();
    panel.style.flexDirection = portrait ? "column" : "row";
    const size = portrait ? rect.height / COLS : rect.width / COLS, count = Math.ceil((portrait ? rect.width : rect.height) / size);
    let cols = panel.querySelectorAll("[data-transition-col]");
    const first = cols[0], cell = first.querySelector("[data-transition-pixel]");
    if (cols.length !== COLS) {
      const f = document.createDocumentFragment();
      for (let i = 0; i < COLS; i++) f.append(first.cloneNode(false));
      panel.replaceChildren(f);
      cols = panel.querySelectorAll("[data-transition-col]");
    }
    cols.forEach((col) => {
      Object.assign(col.style, { flexDirection: portrait ? "row" : "column", flex: "1 1 auto", justifyContent: "center" });
      const diff = count - col.childElementCount;
      for (let i = 0; i < diff; i++) col.append(cell.cloneNode(true));
      for (let i = diff; i < 0; i++) col.lastElementChild.remove();
    });
  };
  const leave = (current, next, done) => {
    const tl = gsap.timeline();
    if (TDS.reduced) return tl.set(current, { autoAlpha: 0 }).call(done, null, 0);
    pixelGrid(innerHeight > innerWidth);
    const panel = trans.querySelector("[data-transition-panel]");
    const cols = [...panel.querySelectorAll("[data-transition-col]")], cells = panel.querySelectorAll("[data-transition-pixel]");
    const half = 0.5 * DUR, d = Math.min(FADE, 0.6 * half), gap = (half - d) / Math.max(1, cols.length);
    const stag = (n) => ({ each: (d / Math.max(1, n)) * 0.6, from: "random" });
    gsap.set(panel, { opacity: 1, willChange: "opacity" });
    gsap.set(cells, { opacity: 0, willChange: "opacity" });
    gsap.set(next, { autoAlpha: 0, position: "fixed", top: 0, left: 0, right: 0, maxHeight: "100dvh" });
    cols.forEach((col, i) => { const c = col.querySelectorAll("[data-transition-pixel]"); c.length && tl.to(c, { opacity: 1, duration: d, ease: "power1.in", stagger: stag(c.length) }, i * gap); });
    tl.add("covered", half).set(cells, { opacity: 1 }, "covered").set(next, { autoAlpha: 1 }, "covered").call(done, null, "covered");
    cols.forEach((col, i) => { const c = col.querySelectorAll("[data-transition-pixel]"); c.length && tl.to(c, { opacity: 0, duration: d, ease: "power1.out", stagger: stag(c.length) }, "covered+=" + i * gap); });
    tl.set(next, { clearProps: "position,top,left,right,maxHeight,visibility,opacity,willChange" }).set(cells, { clearProps: "willChange" }).set(panel, { clearProps: "willChange" });
    return tl;
  };
  const toTop = (next) => { scrollTo(0, 0); gsap.set(next, { clearProps: "position,top,left,right" }); TDS.lenis?.resize(); TDS.lenis?.start(); };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    mount(first);
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    barba.init({
      debug: false, timeout: 7000, preventRunning: true,
      prevent: ({ el, href }) => {
        if (!el || el.closest(".wf-ui") || el.target === "_blank") return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw === "#" || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        try { return new URL(href, location.href).origin !== location.origin; } catch { return true; }
      },
      transitions: [{
        name: "pixel", sync: true,
        leave: ({ current, next }) => new Promise((done) => leave(current.container, next.container, () => {
          unmount();
          ScrollTrigger.getAll().forEach((t) => t.kill());
          current.container.remove();
          done();
        })),
        enter: ({ next }) => new Promise((done) => {
          if (TDS.reduced) { toTop(next.container); return done(); }
          gsap.delayedCall(DUR + DUR / COLS, () => { toTop(next.container); done(); });
        }),
      }],
    });
    barba.hooks.before(() => TDS.closeNav());
    barba.hooks.beforeEnter(({ next }) => { gsap.set(next.container, { position: "fixed", top: 0, left: 0, right: 0 }); TDS.lenis?.stop(); });
    barba.hooks.enter(({ next }) => {
      const doc = new DOMParser().parseFromString(next.html, "text/html");
      if (doc.title) document.title = doc.title;
      const file = new URL(next.url.href).pathname.split("/").pop() || "index.html";
      nav.querySelectorAll("[data-nav-link]").forEach((a) => (a.getAttribute("href") === file ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    });
    barba.hooks.afterEnter(({ next }) => {
      mount(next.container);
      TDS.lenis?.resize();
      TDS.lenis?.start();
      ScrollTrigger.refresh();
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
