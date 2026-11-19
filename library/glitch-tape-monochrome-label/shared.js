// Shared by all pages: symbol and wordmark sprites, header and phone menu, loader, X-shaped tape, stickers, prev/next row, CONTACT and footer,
// And the original Studio’s two motions — appear, which fires once on entering the screen, and scrub, tied to the document scroll position (px).
// Put page scenes in with sl.scene(fn) and they are set up in document order after all fonts have loaded.
// The original is a STUDIO SPA, so the document stays put when changing pages — the copy also swaps only #swup using swup 4.8.3 (+js, head and preload plugins),
// Content, scenes and loaders inside are attached per page with gsap.context and detached on page transition. Header, phone menu and footer are set up only once.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const MENU = [
    { href: "about.html", en: "STATEMENT", ko: "Your about page here", key: "about" },
    { href: "release.html", en: "RELEASE", ko: "Your list page here", key: "release" },
    { href: "index.html#artists", en: "ARTISTS", ko: "Your card list here", key: "artists" },
    { href: "news.html", en: "NEWS", ko: "Your news list here", key: "news" },
    { href: "#contact", en: "CONTACT", ko: "Your inquiry here", key: "contact" },
  ];

  const roll = (text) => `<span class="sl-roll"><span>${text}</span><span aria-hidden="true">${text}</span></span>`;

  // A newly drawn symbol instead of the original logo (a wide ellipse split by an S-shaped band), and a placeholder wordmark whose width is fitted with textLength
  const SPRITE = `
<svg class="sl-sprite" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sl-holo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7b2c4"/><stop offset=".22" stop-color="#f9d08f"/><stop offset=".42" stop-color="#b8f0d0"/><!-- Not skin: holographic rainbow is a material graphic -->
      <stop offset=".62" stop-color="#8fd8f7"/><stop offset=".82" stop-color="#c9b2f7"/><stop offset="1" stop-color="#f7b2c4"/><!-- Not skin: holographic rainbow is a material graphic -->
    </linearGradient>
    <mask id="sl-mark-cut" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" style="fill:var(--kf-contrast-bg)"/>
      <path d="M.74 .2 C.62 .04 .3 .08 .3 .3 C.3 .5 .7 .44 .7 .66 C.7 .9 .38 .94 .25 .76" fill="none" stroke-width=".11" stroke-linecap="round" style="stroke:var(--kf-contrast-ink)"/>
      <path d="M.12 .52 L.22 .64 M.88 .48 L.78 .36" stroke-width=".05" stroke-linecap="round" style="stroke:var(--kf-contrast-ink)"/>
    </mask>
    <symbol id="sl-mark" viewBox="0 0 100 62.5"><ellipse cx="50" cy="31.25" rx="50" ry="31.25" fill="currentColor" mask="url(#sl-mark-cut)"/></symbol>
    <symbol id="sl-wordmark" viewBox="0 0 1000 80"><text x="0" y="74" textLength="1000" lengthAdjust="spacingAndGlyphs" font-weight="500" font-size="102" fill="currentColor" style="font-family:var(--kf-font-display)">LABEL WORDMARK</text></symbol>
    <symbol id="sl-chev" viewBox="0 0 50 34"><path d="M17 0h9L13 17l13 17h-9L4 17zM30 0h9L26 17l13 17h-9L17 17zM43 0h7L37 17l13 17h-7L30 17z" fill="currentColor"/></symbol>
  </defs>
</svg>`;
  const mark = (cls = "") => `<svg class="sl-mark ${cls}" viewBox="0 0 100 62.5" aria-hidden="true"><use href="#sl-mark"/></svg>`;
  const wordmark = (cls = "") => `<svg class="sl-wm ${cls}" viewBox="0 0 1000 80" aria-hidden="true"><use href="#sl-wordmark"/></svg>`;
  const logo = (href = "index.html") => `<a class="sl-logo" href="${href}" aria-label="Go home">${mark()}${wordmark()}</a>`;
  // Two-line glitch wordmark — the original Lottie (1360×184, 60fps) is an entrance, not a shake: bottom line → second piece → top piece at .2s intervals
  // Rises from 25.5 below 184 over .8s with cubic-bezier(0,0,0,1) while fading in linearly over .8s. The Hero one starts 3.48s later (after the loader), the Footer one immediately
  const glitch = (delay = 0) => `<span class="sl-glitch" data-glitch-delay="${delay}" aria-hidden="true">${wordmark("is-ghost")}${wordmark("is-ghost is-2")}${wordmark("is-base")}</span>`;

  const STICKERS = {
    // Square holographic sticker: a black-bordered cell on a slanted rainbow plate, with top-line copy and a center symbol
    asset: `<svg viewBox="0 0 120 120"><g transform="rotate(14 60 60)">
      <rect x="14" y="14" width="92" height="92" rx="8" fill="url(#sl-holo)" class="sl-holo-shift"/>
      <rect x="21" y="21" width="78" height="78" rx="5" fill="none" stroke-width="2.6" style="stroke:var(--kf-contrast-ink)"/>
      <path d="M21 36h78" stroke-width="2" style="stroke:var(--kf-contrast-ink)"/>
      <text x="60" y="32" text-anchor="middle" font-weight="800" font-size="8.5" letter-spacing=".3" style="font-family:var(--kf-font-display)">STICKER TEXT</text>
      <svg x="34" y="48" width="52" height="33" viewBox="0 0 100 62.5" style="color:var(--kf-contrast-ink)"><use href="#sl-mark"/></svg></g></svg>`,
    // Round globe sticker: dotted meridians and parallels inside a rainbow ring
    globe: `<svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="58" fill="url(#sl-holo)" class="sl-holo-shift"/>
      <circle cx="60" cy="60" r="58" fill="none" stroke-width="1.2" style="stroke:var(--kf-contrast-ink)"/>
      <circle cx="60" cy="60" r="47" fill="var(--globe-in, var(--kf-contrast-bg))" stroke-width="1.4" style="stroke:var(--kf-contrast-ink)"/>
      <g fill="none" stroke-width="1" style="stroke:var(--kf-contrast-ink)">
        <ellipse cx="60" cy="60" rx="20" ry="47"/><ellipse cx="60" cy="60" rx="38" ry="47" stroke-dasharray="3 2"/>
        <path d="M14 52q46 14 92 0M18 38q42 12 84 0M14 70q46-14 92 0" stroke-dasharray="3 2"/>
        <path d="M60 13v94"/></g></svg>`,
    // Diagonal band sticker: one holographic wordmark line plus one black subtitle line
    tag: `<svg viewBox="0 0 320 143"><g transform="rotate(-15 160 72)">
      <rect x="22" y="38" width="276" height="70" stroke-width="3" style="fill:var(--kf-contrast-bg);stroke:var(--kf-contrast-ink)"/>
      <text x="34" y="71" textLength="252" lengthAdjust="spacingAndGlyphs" font-weight="600" font-size="34" fill="url(#sl-holo)" stroke-width=".7" class="sl-holo-shift" style="stroke:var(--kf-contrast-ink);font-family:var(--kf-font-display)">LABEL WORDMARK</text>
      <text x="40" y="99" textLength="240" lengthAdjust="spacingAndGlyphs" font-weight="800" font-size="24" style="font-family:var(--kf-font-display)">SUB COPY LINE</text></g></svg>`,
  };

  const tape = (top, bottom, copy = "TAPE COPY GOES HERE. AT LABEL NAME,") => {
    const thin = Array.from({ length: 10 }, () => `<span>${copy}</span>`).join("");
    const band = Array.from({ length: 8 }, () => `${mark()}${wordmark()}`).join("");
    const strip = (cls) => `<div class="sl-tape__strip ${cls}">
      <div class="sl-tape__thin"><div class="sl-tape__run">${thin}${thin}</div></div>
      <div class="sl-tape__band"><div class="sl-tape__run">${band}${band}</div></div>
      <div class="sl-tape__thin"><div class="sl-tape__run">${thin}${thin}</div></div></div>`;
    return `<div class="sl-tape__cross" style="--tape-top:${top};--tape-bottom:${bottom}">${strip("is-b")}${strip("is-a")}</div>`;
  };

  const ICONS = {
    x: '<svg viewBox="0 0 16 16"><path d="M2 2h3.4l3 4.2L12 2h2l-4.6 5.4L14.4 14H11l-3.2-4.5L3.9 14H2l5-5.8z" fill="currentColor"/></svg>',
    yt: '<svg viewBox="0 0 16 16"><path d="M3.6 3.5h8.8a2.6 2.6 0 0 1 2.6 2.6v3.8a2.6 2.6 0 0 1-2.6 2.6H3.6A2.6 2.6 0 0 1 1 9.9V6.1a2.6 2.6 0 0 1 2.6-2.6zM6.6 5.9v4.2L10.2 8z" fill="currentColor" fill-rule="evenodd"/></svg>',
    ig: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="3.4"/><circle cx="8" cy="8" r="2.8"/><circle cx="11.7" cy="4.3" r=".5" fill="currentColor"/></svg>',
  };

  const header = () => `
    ${logo()}
    <nav aria-label="Main menu"><ul class="sl-nav">${MENU.map((m) => `<li><a class="sl-nav__a is-${m.key}" href="${m.href}">${roll(`${m.en} ,`)}</a></li>`).join("")}</ul></nav>
    <button class="sl-burger" type="button" aria-controls="sl-menu" aria-expanded="false"><span class="sl-burger__t">MENU</span><i></i></button>`;

  const menu = () => `
    <ul>${MENU.concat([{ href: "#", en: "PRIVACY POLICY", ko: "Your privacy notice here" }]).map((m) => `
      <li><a href="${m.href}"><span><b>${m.en}</b><small>${m.ko}</small></span><em>HTTPS://WWW.EXAMPLE.COM/${m.en.replace(" ", "")}</em></a></li>`).join("")}</ul>
    ${wordmark()}`;

  const pager = (prev, next) => `
    <div class="sl-wrap">
      <div class="sl-pager__row">
        <a class="is-prev" href="${prev.href}"><svg viewBox="0 0 50 34" aria-hidden="true"><use href="#sl-chev"/></svg>${roll(prev.en)}</a>
        <a class="is-next" href="${next.href}">${roll(next.en)}<svg viewBox="0 0 50 34" aria-hidden="true" style="scale:-1 1"><use href="#sl-chev"/></svg></a>
      </div>
      <div class="sl-pager__sub"><span>PREVIOUS PAGE</span><span>NEXT PAGE</span></div>
    </div>`;

  const contact = () => `
    <div class="sl-wrap--wide">
      <div class="sl-contact__stage">
        <a class="sl-contact__big" id="contact" href="#contact" aria-label="Contact Us">
          <svg class="sl-contact__word" viewBox="0 0 1360 283" aria-hidden="true"><text x="0" y="230" textLength="1360" lengthAdjust="spacingAndGlyphs" font-weight="600" font-size="250" style="font-family:var(--kf-font-display)">CONTACT</text></svg>
          <span class="sl-contact__btn sl-roll-host">${roll("GET IN TOUCH")}<i></i></span>
        </a>
        <span class="sl-sticker is-tag" data-sticker="tag" data-appear="pop"></span>
        <span class="sl-sticker is-asset" data-sticker="asset" data-appear="pop"></span>
        <span class="sl-sticker is-globe" data-sticker="globe" data-appear="pop" style="--globe-in:url(#sl-holo)"></span>
      </div>
      <div class="sl-contact__row">
        <h2>Your contact guidance here<br>Place it in two lines</h2>
        <p>Here goes a short English line about the label.<br>Here goes a second line describing what you offer, in about one sentence.<br>Here goes a third line with the latest news, tracks and people.<br>Reach out here and join — placeholder copy for four lines.</p>
      </div>
    </div>`;

  const footer = () => `
    <div class="sl-wrap--wide">
      <div class="sl-foot__top">
        <div class="sl-foot__brand">${logo()}<p>Here Goes A Four-Line English Description Of The Label. Each Word Is Capitalised Like The Original, And The Line Length Is Kept Close To It So The Block Keeps The Same Shape. Replace This With Your Own Statement Of Who You Are And What You Do.</p></div>
        <div class="sl-foot__side">
          <nav class="sl-foot__nav" aria-label="Footer Menu">${MENU.map((m) => `<a class="sl-foot__link is-${m.key}" href="${m.href}">${roll(m.en === "CONTACT" ? "CONTACT US" : m.en)}</a>`).join("")}</nav>
          <div class="sl-foot__follow"><span>FOLLOW US :</span><span class="sl-social"><a class="sl-social__a" href="#" aria-label="X">${ICONS.x}<b class="sl-social__on" aria-hidden="true">${ICONS.x}</b></a><a class="sl-social__a" href="#" aria-label="Video">${ICONS.yt}<b class="sl-social__on" aria-hidden="true">${ICONS.yt}</b></a><a class="sl-social__a" href="#" aria-label="Social Media">${ICONS.ig}<b class="sl-social__on" aria-hidden="true">${ICONS.ig}</b></a></span></div>
        </div>
      </div>
      <div class="sl-foot__legal"><span>© LABEL NAME</span><nav><a class="sl-legal__a" href="#">PRIVACY POLICY</a><a class="sl-legal__a" href="#">SITE MAP</a></nav></div>
      <div class="sl-foot__glitch" data-appear="up">${glitch()}</div>
    </div>`;

  // ── Once only: sprites · header text · phone menu · floor
  document.body.insertAdjacentHTML("afterbegin", SPRITE);
  const fill = (root, sel, html) => root.querySelectorAll(sel).forEach((el) => { el.innerHTML = typeof html === "function" ? html(el) : html; });
  fill(document, '[data-slot="header"]', header);
  fill(document, '[data-slot="mobile-menu"]', menu);
  fill(document, '[data-slot="footer"]', footer);
  window.sl = { mark, wordmark, roll, glitch, pages: {} };
  // Page js is loaded on every page and registers only under its own name — after the transition, the one for the new page’s name runs
  sl.onPage = (name, fn) => (sl.pages[name] = fn);

  // Phone menu: MENU ↔ CLOSE, two lines fold into an X
  const burger = document.querySelector(".sl-burger");
  const drawer = document.getElementById("sl-menu");
  const setMenu = (on) => {
    if (!burger || !drawer) return;
    drawer.classList.toggle("is-open", on);
    burger.setAttribute("aria-expanded", String(on));
    burger.querySelector(".sl-burger__t").textContent = on ? "CLOSE" : "MENU";
    document.body.classList.toggle("is-locked", on);
  };
  if (burger && drawer) {
    burger.addEventListener("click", () => setMenu(!drawer.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create("fx-0,0,0,1", "M0,0 C0,0 0,1 1,1"); }

  // ── Loader: the original STUDIO loader (tuned by measurement). On the first page a large wordmark on a dark panel flickers between .5~1.4s, settles at its own size, and lifts away over .8s starting at 3s.
  // Sub pages use a 13-line curtain — on first open it is covered first from a blank screen (data-in), each page stays covered until its images finish loading (time measured on the original, data-hold), then lifts with a different length per line.
  // If we arrived from another page, the curtain already covered things up front, so start covered
  // Per-row clearing length — the original clearing phase is set at 1.25~1.6s, so the 13-row base length (400~1000ms) is multiplied by 1.3
  const DUR = [800, 600, 400, 400, 600, 1000, 400, 600, 400, 800, 800, 600, 400].map((d) => Math.round(d * 1.3));
  const cols = DUR.map((d) => `<span style="--d:${d}ms"></span>`).join("");
  const runLoader = (loader, covered) => {
    if (!loader) return;
    if (reduced) { loader.classList.add("is-done"); return void document.dispatchEvent(new CustomEvent("sl:reveal")); }
    if (loader.classList.contains("sl-loader--cols") && !loader.children.length) loader.innerHTML = cols;
    const mark = loader.classList.contains("sl-loader--mark");
    const coverIn = mark || covered ? 0 : +(loader.dataset.in || 0);
    const hold = mark ? 0 : +(loader.dataset.hold || 0);
    if (coverIn) { loader.classList.add("is-open"); loader.style.setProperty("--in", `${coverIn}ms`); requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.remove("is-open"))); }
    setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => { loader.classList.add("is-run"); document.dispatchEvent(new CustomEvent("sl:reveal")); })), coverIn + hold);
    setTimeout(() => loader.classList.add("is-done"), mark ? 3800 : coverIn + hold + 1700);
  };
  // Curtain covering on leave — the original covers with the 13-line curtain first when going to a subpage (exit 750ms). When going to the first page, it hands straight over to that loader.
  const coverOut = () => new Promise((done) => {
    const cover = document.createElement("div");
    cover.className = "sl-loader sl-loader--cols is-cover";
    cover.setAttribute("aria-hidden", "true");
    cover.innerHTML = cols;
    document.body.append(cover);
    requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add("is-run")));
    setTimeout(done, 750);
  });
  const toHome = (url) => /(\/|index\.html)$/.test(new URL(url, location.href).pathname);

  // Tape flow speed — original Lottie (1440×274, 300 frames at .5x speed = 10s) the text line goes 367 units and the symbol strip 1485.
  // Drawn at panel width/1440 scale, so convert to px/s to set the length of one loop (half width)
  const tapeSpeed = () => document.querySelectorAll(".sl-tape__strip").forEach((strip) => {
    const k = strip.clientWidth / 1440;
    strip.querySelectorAll(".sl-tape__run").forEach((run) => {
      const pxs = (run.closest(".sl-tape__band") ? 148.5 : 36.7) * k;
      if (pxs > 0 && run.scrollWidth) run.style.animationDuration = `${run.scrollWidth / 2 / pxs}s`;
    });
  });
  addEventListener("resize", tapeSpeed);

  // Glitch wordmark appearance — original dotlottie playtype appear: once, when first seen
  const glitchIn = (el) => {
    const parts = [".is-base", ".is-ghost.is-2", ".is-ghost:not(.is-2)"].map((q) => el.querySelector(q));
    const d0 = +(el.dataset.glitchDelay || 0);
    const rise = () => (el.clientHeight * 25.5) / 184;
    parts.forEach((p, i) => {
      gsap.fromTo(p, { y: rise }, { y: 0, duration: 0.8, delay: d0 + i * 0.2, ease: "fx-0,0,0,1" });
      gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: d0 + i * 0.2, ease: "none" });
    });
  };
  const watchGlitch = (root) => {
    const seen = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      seen.unobserve(e.target);
      if (!reduced) glitchIn(e.target);
    }));
    root.querySelectorAll(".sl-glitch").forEach((el) => { if (!reduced) gsap.set(el.querySelectorAll("svg"), { opacity: 0 }); seen.observe(el); });
    return seen;
  };
  // Off-screen tape loop pauses
  const loops = new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute("data-paused", !e.isIntersecting)));

  // The original animation-timeline: scroll() is tied to whole-document progress — takes px converted to the 1440 original document height (scroll 6239px)
  const scrub = (el, frames, maxPx) => {
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    let at = 0;
    frames.forEach(([px, vars], i) => {
      if (i === 0) { gsap.set(el, vars); at = px; return; }
      tl.to(el, { ...vars, duration: px - at }, at);
      at = px;
    });
    return ScrollTrigger.create({ start: 0, end: maxPx || at, scrub: true, animation: tl });
  };
  sl.scrub = scrub;

  // Glitch and reveal of the floor (once)
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    watchGlitch(foot);
    foot.querySelectorAll("[data-appear]").forEach((el) => (reduced ? el.classList.add("is-in") : ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => el.classList.add("is-in") })));
  }

  // ── Per page: fills #swup and sets up scenes. On navigation, ctx.revert() removes everything
  let ctx = null, offs = [];
  const boot = () => {
    const main = document.getElementById("swup") || document.querySelector("main") || document.body;
    const page = main.dataset.page || "home";
    fill(main, '[data-slot="contact"]', contact);
    fill(main, "[data-tape]", (el) => tape(el.dataset.top || "transparent", el.dataset.bottom || "var(--kf-contrast-bg)"));
    fill(main, "[data-pager]", (el) => pager({ href: el.dataset.prevHref, en: el.dataset.prev }, { href: el.dataset.nextHref, en: el.dataset.next }));
    fill(main, "[data-mark]", () => mark());
    fill(main, "[data-wordmark]", () => wordmark());
    fill(main, "[data-glitch]", (el) => glitch(+(el.dataset.glitch || 0)));
    main.querySelectorAll("[data-roll]").forEach((el) => { el.innerHTML = roll(el.innerHTML.trim()); });
    main.querySelectorAll(".sl-more").forEach((el) => { el.innerHTML = `${roll(el.textContent.trim())}<i></i>`; });
    main.querySelectorAll(".newsrow.is-fill").forEach((a) => a.insertAdjacentHTML("afterbegin", '<i class="newsrow__fill" aria-hidden="true"></i>'));
    main.querySelectorAll(".track__link").forEach((a) => a.insertAdjacentHTML("beforeend", `<b class="sl-social__on" aria-hidden="true">${a.innerHTML}</b>`));
    main.querySelectorAll("[data-sticker]").forEach((el) => { el.innerHTML = STICKERS[el.dataset.sticker]; });
    main.querySelectorAll("[data-tape]").forEach((el) => loops.observe(el));
    const seen = watchGlitch(main);
    offs.push(() => { seen.disconnect(); main.querySelectorAll("[data-tape]").forEach((el) => loops.unobserve(el)); });
    const scenes = [];
    sl.scene = (fn) => scenes.push(fn);
    ctx = gsap.context(() => sl.pages[page]?.());
    document.fonts.ready.then(() => {
      tapeSpeed();
      ctx?.add(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          main.querySelectorAll("[data-appear]").forEach((el) =>
            ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => el.classList.add("is-in") }));
          scenes.forEach((fn) => fn(mm));
        });
        mm.add("(prefers-reduced-motion: reduce)", () => {
          main.querySelectorAll("[data-appear]").forEach((el) => el.classList.add("is-in"));
        });
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return main;
  };
  const teardown = () => {
    offs.forEach((f) => f());
    offs = [];
    ctx?.revert();
    ctx = null;
    setMenu(false);
  };

  // ── Transition: like the original Brand site, inside a single document. Going to a subpage, a 13-row curtain covers in .75s, then the new page’s loader stays covered, then lifts,
  // Going to the first page goes straight to the wordmark loader. When opened as a file (file:), swup can’t fetch the page, so after covering with the veil it falls back to a normal navigation
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup || !window.SwupJsPlugin) return false;
    let covered = false;
    const plugins = [new SwupJsPlugin({ animations: [{
      from: "(.*)", to: "(.*)",
      out: (done, v) => { covered = !reduced && !toHome(v.to.url); return covered ? coverOut().then(done) : done(); },
      in: (done) => done(),
    }] })];
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin());
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }));
    const swup = new Swup({ containers: ["#swup"], plugins });
    swup.hooks.on("visit:start", (v) => { v.scroll.reset = true; setMenu(false); });
    swup.hooks.before("content:replace", teardown);
    swup.hooks.on("content:replace", () => {
      scrollTo(0, 0);
      const main = boot();
      runLoader(main.querySelector(".sl-loader"), covered);
      // Lift the curtain when leaving on the frame after the new page loader covers
      requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll(".sl-loader.is-cover").forEach((c) => c.remove())));
      covered = false;
    });
    sl.swup = swup;
    return true;
  };

  // Attach the first page after all page js are registered (DOMContentLoaded)
  const first = () => {
    const main0 = boot();
    if (bootSwup() || reduced) return void runLoader(main0.querySelector(".sl-loader"), false);
    let fromCover = false;
    try { fromCover = sessionStorage.getItem("sl-covered") === "1"; sessionStorage.removeItem("sl-covered"); } catch {}
    runLoader(main0.querySelector(".sl-loader"), fromCover);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || toHome(a.href)) return;
      e.preventDefault();
      coverOut().then(() => { try { sessionStorage.setItem("sl-covered", "1"); } catch {} location.href = a.href; });
    });
    addEventListener("pageshow", () => document.querySelectorAll(".sl-loader.is-cover").forEach((c) => c.remove()));
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", first, { once: true }) : setTimeout(first);
})();
