// Shared by Brand — inserts header bar, menu drawer, footer and cookie note, and wires up Lenis scroll, text reveal, card float-up, numbers, marquee and page transition.
// Values from the original motion config: curve cubic-bezier(.18,1,.32,1), title words .6s · paragraph lines .42s (stagger .07), image 2s · 48px, transition .52s.
(() => {
  const root = document.documentElement;
  root.classList.add("nk-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "index";

  const NAV = [
    { href: "index.html#stats", label: "Impact", key: "impact" },
    { href: "works.html", label: "Work", key: "works" },
    { href: "service.html", label: "Services", key: "service" },
    { href: "program.html", label: "Programs", key: "program" },
    { href: "index.html#method", label: "Approach", key: "method" },
    { href: "index.html#insights", label: "Journal", key: "insights" },
    { href: "recruit.html", label: "Studio", key: "recruit" },
  ];
  const current = { works: "works", detail: "works", service: "service", "service-detail": "service", program: "program", recruit: "recruit" }[page];
  const SLASH = '<svg class="nk-logo__slash" viewBox="0 0 12 30" aria-hidden="true"><path d="M8.2 0H12L3.8 30H0z" fill="currentColor"/></svg>';
  const ARROW = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4"/></svg>';
  const cta = (label, href, cls = "") => `<a class="nk-cta ${cls}" href="${href}"><span class="nk-cta__label">${label}</span><span class="nk-cta__arrow">${ARROW}${ARROW}</span></a>`;
  window.nkCta = cta;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("nk-header");
    header.innerHTML = `
      <div class="nk-header__in">
        <a class="nk-logo" href="index.html" aria-label="Hero" data-label="Your brand’s English wordmark here · two or three lowercase letters"><span class="nk-logo__mark">${SLASH}sn</span></a>
        <nav class="nk-nav" aria-label="Main menu"><ul>${NAV.map((n) => `<li><a href="${n.href}"${n.key === current ? ' aria-current="page"' : ""}><span class="nk-nav__mark">/</span><span class="nk-nav__ghost">${n.label}</span><span class="nk-nav__text">${n.label}</span><span class="nk-nav__bold" aria-hidden="true">${n.label}</span></a></li>`).join("")}</ul></nav>
        <div class="nk-header__right">
          <a class="nk-cta" href="#contact"><span class="nk-cta__label">Let’s chat</span></a>
          <button class="nk-cta nk-menu-btn" type="button" aria-expanded="false" aria-controls="nk-menu" aria-label="Menu"><span class="nk-menu-btn__label" aria-hidden="true"><span class="nk-menu-btn__ghost">Menu</span><span class="nk-menu-btn__ghost">Close</span><span class="nk-menu-btn__cell"><span class="nk-menu-btn__txt">Menu</span><span class="nk-menu-btn__out"></span></span></span><span class="nk-menu-btn__x" aria-hidden="true"><svg viewBox="0 0 14 13" fill="currentColor"><path d="m.949 1.511 1.06-1.06 10.96 10.96-1.06 1.06z"/><path d="m11.91.45 1.06 1.061-10.96 10.96-1.06-1.06z"/></svg></span></button>
        </div>
      </div>`;
    // Menu drawer (original structure) — numbered rows of big uppercase names (the last row is Contact) and a bottom row (mail · second menu ”(more)”). The header row stays above the board
    const ITEMS = [...NAV, { href: "#contact", label: "Let’s chat", key: "contact" }];
    const MORE = ["Awards", "Archive", "Reviews", "FAQ", "Clients", "Careers"];
    document.body.insertAdjacentHTML("beforeend", `
      <div class="nk-menu" id="nk-menu" data-slot="menu-drawer" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" inert>
        <nav class="nk-menu__nav" aria-label="Main menu">
          <ul class="nk-menu__list">${ITEMS.map((n, i) => `<li style="--i:${i}"><a class="nk-menu__link" href="${n.href}"${n.key === current ? ' aria-current="page"' : ""}><span class="nk-menu__num">(${String(i + 1).padStart(2, "0")})</span><span class="nk-menu__name"><span class="nk-menu__slash" aria-hidden="true">/</span>${n.label}</span><span class="nk-menu__line">Introduce this section in one line here.</span></a></li>`).join("")}</ul>
        </nav>
        <div class="nk-menu__foot">
          <a class="nk-menu__mail nk-menu__rail" style="--r:0" href="#contact" data-label="Main email address here">hello@studio.name</a>
          <button class="nk-menu__lang nk-menu__rail" type="button" data-label="Language switch · three English letters here">ENG</button>
          <div class="nk-menu__more"><span class="nk-mute nk-menu__rail" style="--r:1">(more)</span><ul>${MORE.map((m, e) => `<li class="nk-menu__rail" style="--r:${2 + e}"><a href="index.html">${m}</a></li>`).join("")}</ul></div>
        </div>
      </div>`);
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("nk-footer");
    footer.id = "contact";
    const col = (title, items) => `<div><h4>${title}</h4><ul>${items.map(([l, h]) => `<li><a href="${h}"${h === `${page}.html` ? ' aria-current="page"' : ""}>${l}</a></li>`).join("")}</ul></div>`;
    footer.innerHTML = `
      <div class="nk-wrap">
        <div class="nk-footer__big">
          <div class="nk-footer__mark" aria-label="Studio Name" data-label="Your brand’s English wordmark here · two or three lowercase letters">${SLASH}sn<sup>®</sup></div>
          <div><p class="nk-footer__pitch t-dsm" data-nk-para data-label="Your one-line English pledge here · two faded linked lines"><b>A short pledge.</b> <span class="nk-mute">A follow-up line on who we work with and when, set over two lines.</span></p>
          <p class="nk-footer__intro t-bxs">Your description of what the company does goes here in about 3 lines. Write how many years it has worked, where and with whom, and what keeps it connected.</p></div>
        </div>
        <div class="nk-footer__cols">
          <div class="nk-footer__news">
            <h3 class="t-h3"><span class="nk-slash">/</span>Newsletter</h3>
            <p class="t-bxs">Three lines introducing the newsletter. State how often it goes out, every few weeks, and what is sent.</p>
            <form class="nk-footer__form" onsubmit="return false"><input type="email" placeholder="Email address" aria-label="Email address"><button type="submit" aria-label="Subscription">${ARROW}</button></form>
            <p class="nk-footer__note">Add a one-line privacy notice here.</p>
          </div>
          <div class="nk-footer__links">
            ${col("Company", [["Home", "index.html"], ["Work", "works.html"], ["Approach", "index.html#method"], ["Studio", "recruit.html"], ["Contact", "#contact"]])}
            ${col("Services", [["View all", "service.html"], ["Brand", "service-detail.html"], ["Digital", "service.html"], ["Lab", "service.html"], ["Growth", "service.html"]])}
            ${col("Programs", [["View all", "program.html"], ["Foundations", "program.html"], ["Discovery", "program.html"], ["Fundraise", "program.html"], ["Go global", "program.html"]])}
            ${col("Explore", [["Impact", "index.html#stats"], ["Awards", "index.html"], ["Archive", "works.html"]])}
            ${col("Learn", [["Journal", "index.html#insights"], ["Reviews", "index.html"], ["FAQ", "index.html"], ["Clients", "index.html"], ["Careers", "recruit.html"]])}
          </div>
        </div>
        <div class="nk-footer__base">
          <span class="nk-mute">Your line here listing a few partner organization names.</span>
          <div class="nk-footer__social">${["W", "I", "L", "X"].map((k) => `<a href="#" aria-label="Social ${k}"><svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7"/></svg></a>`).join("")}</div>
        </div>
        <p class="nk-footer__copy">© 0000 Your Company Name Here. All rights reserved.</p>
      </div>`;
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="nk-cookie" data-slot="cookie-note" role="dialog" aria-label="Cookie Notice">
      <button class="nk-cookie__x" type="button" aria-label="Close"><svg viewBox="0 0 12 12" stroke="currentColor" stroke-width="1.4"><path d="M1 1l10 10M11 1 1 11"/></svg></button>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 1.5a6.5 6.5 0 1 0 6.4 7.6 2.2 2.2 0 0 1-2.9-2.3 2.2 2.2 0 0 1-2.6-2.7A2.2 2.2 0 0 1 8 1.5z"/><circle cx="5.5" cy="8" r=".6" fill="currentColor"/><circle cx="8.5" cy="10.5" r=".6" fill="currentColor"/></svg>
      <h5>Your cookie notice title here.</h5>
      <p>Your two lines here on why cookies are used. For details, see <u>Privacy policy</u>At.</p>
      <button class="nk-cta" type="button" data-cookie-ok><span class="nk-cta__label">Got it</span></button>
    </div>
    <div class="nk-veil" aria-hidden="true"></div>`);
  const cookie = document.querySelector(".nk-cookie");
  // The original note floats up in .42s from 12px below and transparent once the app is ready (already up when arriving from another section) — hide it at first and open it when fonts are ready
  const cookieWaits = sessionStorage.getItem("nk-cookie") !== "1" && !sessionStorage.getItem("nk-nav");
  if (sessionStorage.getItem("nk-cookie") === "1" || cookieWaits) cookie.classList.add("is-gone");
  cookie.addEventListener("click", (e) => {
    if (!e.target.closest(".nk-cookie__x, [data-cookie-ok]")) return;
    cookie.classList.add("is-gone");
    sessionStorage.setItem("nk-cookie", "1");
  });

  // Header menu — after the first hover, one bold text set stays on (hiding is done by position shift). Normal text turns bold immediately on hover (46.67→48.73)
  //   Leaving keeps it as is — the original leave record doesn’t capture a revert (a revert after 1.2s · 1.6s was captured in the leave record and diverged from the original)
  document.querySelectorAll(".nk-nav a").forEach((a) => {
    a.addEventListener("pointerenter", () => { a.classList.add("is-bold"); requestAnimationFrame(() => a.classList.add("was-hover")); });
  });

  // Menu drawer — the header button switches between ‹Menu› ↔ ‹Close›, and while open the header uses the text color over a dark panel. Pressing an inner link closes it
  const menu = document.getElementById("nk-menu"), menuBtn = document.querySelector(".nk-menu-btn");
  // Button text swap (original menu toggle) — outgoing characters go up 110% and right 40% inside the mask, incoming ones come into place from below 110% and left 40%.
  //   Both .52s · .03s per letter in turn, the incoming side starts .14s later
  const chars = (t) => [...t].map((c) => `<span class="nk-mch"><span>${c}</span></span>`).join("");
  const swapMenuLabel = (text) => {
    // The visible text cell rolls the incoming text while split (split text has looser tracking and is slightly wider), then reverts to unsplit text after rolling — same width change as the original SplitText.
    //   Outgoing text rolls off a layered panel above the cell
    const txt = menuBtn.querySelector(".nk-menu-btn__txt"), over = menuBtn.querySelector(".nk-menu-btn__out");
    over.innerHTML = chars(txt.textContent);
    txt.innerHTML = chars(text);
    const out = over.querySelectorAll(".nk-mch > span"), inn = txt.querySelectorAll(".nk-mch > span");
    if (reduce || !window.gsap) { txt.textContent = text; over.textContent = ""; return; }
    gsap.set(out, { yPercent: 0, xPercent: 0 });
    gsap.set(inn, { yPercent: 110, xPercent: -40 });
    gsap.timeline({ onComplete: () => { if (txt.querySelector(".nk-mch")) txt.textContent = text; } })
      .to(out, { yPercent: -110, xPercent: 40, duration: 0.52, ease: window.nkEase, stagger: 0.03, overwrite: "auto" }, 0)
      .to(inn, { yPercent: 0, xPercent: 0, duration: 0.52, ease: window.nkEase, stagger: 0.03, overwrite: "auto" }, 0.14);
  };
  // The overlapping panel hides the current text split up from the start — so the panel width doesn’t suddenly appear from 0 on the first press
  const overInit = menuBtn?.querySelector(".nk-menu-btn__out");
  if (overInit) overInit.innerHTML = chars(menuBtn.querySelector(".nk-menu-btn__txt").textContent);
  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menu.toggleAttribute("inert", !open);
    if (menuBtn && menuBtn.getAttribute("aria-expanded") !== String(open)) swapMenuLabel(open ? "Close" : "Menu");
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Close" : "Menu");
    document.querySelector(".nk-header")?.classList.toggle("is-menu", open);
    dispatchEvent(new Event("scroll"));
    if (open) window.nkLenis?.stop(); else window.nkLenis?.start();
  };
  menuBtn?.addEventListener("click", () => { const open = !menu.classList.contains("is-open"); requestAnimationFrame(() => requestAnimationFrame(() => setMenu(open))); });
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Logo — like the original, two dotLottie (dotlottie-web 0.80.0) canvases are stacked. The panel is the same as the original: 450×88 · 29.97fps · 205.28 frames (6.85s loop).
  //   Normally only the left 29.44% (diagonal + wordmark) is visible, and on hover the link clip opens instantly and the tail panel appears and spins in .3s:
  //   the dot rises from below (103px) to 59px in .57s (power 2.4 deceleration), settles down to 63px in .4s, and the word strip rolls upward with a 3.5s cubic ease-in-out (starting .5s earlier)
  //   It stops on the last word. From 3.8s to 6.77s it rewinds that path backward (the dot sinks again) and loops. On leave the tail vanishes in .3s, 300ms later the clip closes and it stops on the first frame.
  //   Letters are a drawing layer in the skin’s title font, so if the brand changes only the wordmark letters (.nk-logo__mark) and LOGO_WORDS need changing
  const LOGO_WORDS = ["studio", "design", "motion", "product", "type", "craft", "people", "prize", "team", "client", "story", "studio"];
  // Line slot of the word strip (first word = Line hidden under the board in the first frame, final word = stopping line) — word spacing of the original band
  const LOGO_ROWS = [-60, 25, 106, 197.5, 280.7, 364, 439.4, 530.5, 609.8, 697, 764.5, 869];
  const logoLottieOK = /^https?:$/.test(location.protocol) && window.DotLottieLib?.DotLottie && !reduce;
  const buildLogoLottie = (logo, inkVar, slashVar) => {
    const FR = 29.97, OP = 205.28, W = 450, H = 88, BASE = 68.8;
    const tone = (v) => { const i = document.createElement("i"); i.style.color = `var(${v})`; logo.append(i); const c = getComputedStyle(i).color; i.remove(); return c; };
    const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return [m[0] / 255, m[1] / 255, m[2] / 255]; };
    const ink = tone(inkVar), slash = tone(slashVar);
    const cs = getComputedStyle(logo);
    const family = cs.fontFamily, weight = cs.fontWeight;
    const mark = (logo.querySelector(".nk-logo__mark")?.textContent || "").trim();
    const pad = document.createElement("canvas").getContext("2d");
    // Size is set by letter height (x-height) — wordmark 42px, tail word .85x (35.7px)
    const sizeFor = (xh) => { pad.font = `${weight} 100px ${family}`; return (xh / Math.max(1, pad.measureText("x").actualBoundingBoxAscent)) * 100; };
    const image = (id, text, px, sup) => {
      pad.font = `${weight} ${px}px ${family}`;
      const m = pad.measureText(text), asc = Math.ceil(px * 0.95), desc = Math.ceil(px * 0.3);
      const supPx = px * 0.32, supW = sup ? Math.ceil(pad.measureText(" ").width * 0.2 + supPx) : 0;
      const w = Math.ceil(m.width + supW + 4), h = asc + desc;
      const c = document.createElement("canvas");
      // Plate units are already twice screen px (a 450 plate is drawn at 225px), so the art stays in plate units
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      g.fillStyle = ink;
      g.font = `${weight} ${px}px ${family}`;
      g.letterSpacing = "-0.02em";
      g.fillText(text, 0, asc);
      if (sup) { g.font = `${weight} ${supPx}px ${family}`; g.fillText(sup, m.width + 1, asc - px * 0.52); }
      return { asset: { id, w, h, u: "", p: c.toDataURL("image/png"), e: 1 }, asc, w };
    };
    const st = (k) => ({ a: 0, k });
    const ks = (p, extra = {}) => ({ o: st(100), r: st(0), p: st([...p, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...extra });
    const baked = (from, to, fn) => {
      const k = [];
      for (let f = from; f <= to; f++) k.push({ t: f, s: fn(f), i: { x: [1], y: [1] }, o: { x: [0], y: [0] } });
      k.push({ t: to + 1, s: fn(to) });
      return { a: 1, k };
    };
    const assets = [], layers = [];
    let ind = 1;
    // Diagonal — 60px from 9px above to 68.8px below, a parallelogram slanting from bottom left 13.4 to top right 38.4
    layers.push({ ddd: 0, ind: ind++, ty: 4, nm: "slash", sr: 1, ip: 0, op: OP, st: 0, bm: 0, ks: ks([0, 0]),
      shapes: [{ ty: "gr", it: [
        { ty: "sh", ks: st({ c: true, i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]], v: [[22, BASE], [38.4, 9], [29.8, 9], [13.4, BASE]] }) },
        { ty: "fl", c: st([...rgb(slash), 1]), o: st(100), r: 1 },
        { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) },
      ] }] });
    // Wordmark — fits from 43.9px to 131.2px (87px width)
    let wpx = sizeFor(42);
    pad.font = `${weight} ${wpx}px ${family}`;
    const fit = pad.measureText(mark).width;
    if (fit > 87.3) wpx *= 87.3 / fit;
    const wm = image("mark", mark, wpx);
    assets.push(wm.asset);
    layers.push({ ddd: 0, ind: ind++, ty: 2, nm: "mark", refId: "mark", sr: 1, ip: 0, op: OP, st: 0, bm: 0, ks: ks([43.9, BASE], { a: st([0, wm.asc, 0]) }) });
    // Retiming of the original top layer — frames 0→114 (3.8s) play forward as is, frames 114→203 (6.77s) rewind back to 0, and the last 2 frames stay at 0
    const inner = (f) => (f <= 114 ? f : f <= 203 ? 114 * (1 - (f - 114) / 89) : 0);
    // Dot — radius 6, 139.7px. Frames 0→17: 103.3→59.3 (1-(1-t)^2.4), frames 17→29: 59.3→63.3 (sine ease in-out).
    const dotY = (f) => (f <= 17 ? 103.3 - 44 * (1 - Math.pow(1 - f / 17, 2.4)) : f <= 29 ? 59.3 + 4 * (0.5 - 0.5 * Math.cos(((f - 17) / 12) * Math.PI)) : 63.3);
    layers.push({ ddd: 0, ind: ind++, ty: 4, nm: "dot", sr: 1, ip: 0, op: OP, st: 0, bm: 0, ks: { ...ks([139.7, 0]), p: baked(0, 205, (f) => [139.7, dotY(inner(f)), 0]) },
      shapes: [{ ty: "gr", it: [
        { ty: "el", d: 1, s: st([12, 12]), p: st([0, 0]) },
        { ty: "fl", c: st([...rgb(ink), 1]), o: st(100), r: 1 },
        { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) },
      ] }] });
    // Word strip — strip position X goes 420 → -619 over 3.5s (105 frames) with cubic ease in-out, the first frame starts at its 15th frame and stops at frame 90, and runs backward when rewound.
    //   Screen line baseline y = 47 + .85·(X + line position − 225)
    const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const reelX = (f) => 420 - 1039 * io(Math.min(1, (f + 15) / 105));
    const reel = ind++;
    layers.push({ ddd: 0, ind: reel, ty: 3, nm: "reel", sr: 1, ip: 0, op: OP, st: 0, bm: 0, ks: { ...ks([0, 0]), p: baked(0, 205, (f) => [0, 47 + 0.85 * (reelX(inner(f)) - 225), 0]) } });
    const tpx = sizeFor(35.7);
    LOGO_WORDS.forEach((word, i) => {
      const last = i === 0 || i === LOGO_WORDS.length - 1;
      const img = image(`w${i}`, word, tpx, last ? "®" : "");
      assets.push(img.asset);
      layers.push({ ddd: 0, ind: ind++, ty: 2, nm: word, refId: `w${i}`, parent: reel, sr: 1, ip: 0, op: OP, st: 0, bm: 0, ks: ks([152.9, 0.85 * LOGO_ROWS[i]], { a: st([0, img.asc, 0]) }) });
    });
    return { v: "5.7.0", fr: FR, ip: 0, op: OP, w: W, h: H, ddd: 0, assets, layers };
  };
  if (logoLottieOK) window.DotLottieLib.DotLottie.setWasmUrl(new URL("../_vendor/dotlottie-web@0.80.0/dotlottie-player.wasm", location.href).href);
  const canHover = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll(".nk-header .nk-logo").forEach((logo) => {
    if (!logoLottieOK) return;
    const players = {};
    const layer = (cls, live) => {
      const span = document.createElement("span");
      span.className = cls;
      span.setAttribute("aria-hidden", "true");
      logo.append(span);
      // One set per header skin — over dark sections the text uses --kf-contrast-ink and the diagonal uses --kf-accent, on light backgrounds the text uses --kf-ink and the diagonal uses the light-background accent.
      return [["dark", "--kf-contrast-ink", "--kf-accent"], ["light", "--kf-ink", "--nk-accent-on-light"]].map(([v, inkVar, slashVar]) => {
        // The plate stays 450×88 — drawn at double size in a 225×44 slot so it stays sharp on retina (the hidden tail plate resizes late, so it is fixed)
        const canvas = document.createElement("canvas");
        canvas.dataset.v = v;
        canvas.width = 450; canvas.height = 88;
        span.append(canvas);
        return () => {
          const player = new window.DotLottieLib.DotLottie({ canvas, data: buildLogoLottie(logo, inkVar, slashVar), autoplay: false, loop: true, renderConfig: { autoResize: false, freezeOnOffscreen: false } });
          if (live) players[v] = player;
        };
      });
    };
    // The canvas is placed from the start (the original opens with a pre-drawn canvas) — the drawing is filled in after the font loads
    const fills = [...layer("nk-logo__base", false), ...layer("nk-logo__tail", true)];
    document.fonts.ready.then(() => {
      fills.forEach((fill) => fill());
      logo.classList.add("has-lottie");
    });
    let stopT = 0;
    const play = () => { clearTimeout(stopT); Object.values(players).forEach((p) => p.play()); };
    const stop = () => { clearTimeout(stopT); stopT = setTimeout(() => Object.values(players).forEach((p) => p.stop()), 300); };
    logo.addEventListener("pointerenter", () => { if (canHover()) play(); });
    logo.addEventListener("pointerleave", stop);
    logo.addEventListener("focus", play);
    logo.addEventListener("blur", stop);
  });

  // Underline button — text stacked in two copies, rolled one character at a time (.04s stagger) over .6s (measured: not the original CSS 1.2s but .6s), the underline collapses and is redrawn fresh from the left on leave.
  const prepCta = (a) => {
    if (a.dataset.nkCta) return;
    a.dataset.nkCta = "1";
    const label = a.querySelector(".nk-cta__label");
    if (!label) return;
    const text = label.textContent;
    label.setAttribute("aria-label", text);
    label.innerHTML = [...text].map((c) => `<span class="nk-ch" aria-hidden="true"><span><span>${c}</span><span>${c}</span></span></span>`).join("");
    const inners = [...label.querySelectorAll(".nk-ch > span")];
    // The roll itself is triggered by CSS :hover — like the original, it moves on the first frame the hand is over it. Each letter’s .04s stagger is set via --d
    inners.forEach((s, i) => { s.style.setProperty("--d", `${i * 0.04}s`); s.style.setProperty("--d2", `${i * 0.02}s`); });
    a.addEventListener("pointerenter", () => {
      a.classList.remove("is-in");
      a.classList.add("is-hover", "was-hover");
    });
    a.addEventListener("pointerleave", () => {
      a.classList.remove("is-hover");
      a.classList.add("is-in");
    });
  };
  document.querySelectorAll(".nk-cta").forEach(prepCta);
  window.nkPrepCta = prepCta;

  const hasGsap = !!window.gsap;
  if (!hasGsap) return;
  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const EASE = window.CustomEase ? CustomEase.create("nk-out", "M0,0 C0.18,1 0.32,1 1,1") : "expo.out";
  window.nkEase = EASE;

  // Lenis 1.3.21 — original settings: duration 1.2 · expo curve · smooth for fingers too (syncTouch, lerp .1)
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, syncTouch: true, syncTouchLerp: 0.1, anchors: true });
    window.nkLenis = lenis;
    lenis.on("scroll", () => window.ScrollTrigger?.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header — past 80px of scrolling the center menu disappears and a Menu button stands in. Over dark sections the text is white
  const head = document.querySelector(".nk-header");
  const darks = [...document.querySelectorAll("[data-theme-dark], .nk-dark")];
  const onScroll = () => {
    if (!head) return;
    const y = scrollY;
    head.classList.toggle("is-compact", y > 80);
    const mid = 44;
    head.classList.toggle("on-dark", head.classList.contains("is-menu") || darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }));
    // Closed drawer row text color follows the header skin — opening in a dark section starts with light text, so the color doesn’t change on open (original variant)
    const drawer = document.getElementById("nk-menu");
    if (drawer && !drawer.classList.contains("is-open")) drawer.classList.toggle("from-dark", head.classList.contains("on-dark"));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Text splitting — wrap words and lines in mask boxes (spaces left as is)
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(p); return; }
            const m = document.createElement("span"); m.className = "nk-mask";
            const w = document.createElement("span"); w.className = "nk-split-word"; w.textContent = p;
            m.append(w); frag.append(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("nk-mask")) {
          if (n.matches(".nk-dot")) {
            const m = document.createElement("span"); m.className = "nk-mask";
            const w = document.createElement("span"); w.className = "nk-split-word";
            n.replaceWith(m); w.append(n); m.append(w);
          } else walk(n);
        }
      });
    };
    walk(el);
    el.classList.add("is-split");
    return [...el.querySelectorAll(".nk-split-word")];
  };
  const splitLines = (el) => {
    const words = splitWords(el);
    const lines = [];
    let top = null, line = null;
    words.forEach((w) => {
      const t = Math.round(w.getBoundingClientRect().top);
      if (top === null || Math.abs(t - top) > 4) { top = t; line = []; lines.push(line); }
      line.push(w);
    });
    return lines.map((ws) => ws);
  };

  const navFlag = sessionStorage.getItem("nk-nav");
  sessionStorage.removeItem("nk-nav");
  const arrived = navFlag === "1", skipIntro = !!navFlag;
  // Original hero entrance (HERO_ENTER) applies text and images inside the hero (including js-s-image-mask-appear) in document order, .15s apart
  const heroEls = skipIntro ? [] : [...document.querySelectorAll("[data-nk-hero], [data-nk-rise]")].filter((el) => el.hasAttribute("data-nk-hero") || el.getBoundingClientRect().top < innerHeight);
  // When arriving across sections, the original (SPA) doesn’t bring the header line in again
  if (skipIntro) root.classList.add("nk-ready", "nk-ready--now");
  if (skipIntro) document.querySelectorAll("[data-nk-hero]").forEach((el) => { el.removeAttribute("data-nk-title"); el.removeAttribute("data-nk-para"); el.removeAttribute("data-nk-fade"); });
  if (skipIntro) document.querySelectorAll("[data-nk-rise]").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.removeAttribute("data-nk-rise"); });
  const HERO_START = 0.05, HERO_GAP = 0.15;
  const startFor = (el, def = "top 80%") => ({ trigger: el, start: el.dataset.start || def, once: true });

  // The original starts the first-screen entrance after fonts are ready (s-hero-enter-pending → fonts ready, 800ms at the latest) — hold the Hero entrance still and play it then
  const heroTweens = [];
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 800))]);
  fontsReady.then(() => { root.classList.add("nk-ready"); heroTweens.forEach((t) => t.play()); if (cookieWaits) requestAnimationFrame(() => cookie.classList.remove("is-gone")); });
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const heroDelay = (el) => HERO_START + heroEls.indexOf(el) * HERO_GAP;
    document.querySelectorAll("[data-nk-title]").forEach((el) => {
      const words = splitWords(el);
      gsap.set(words, { opacity: 0, yPercent: 100, rotate: 10, transformOrigin: "0% 100%" });
      const hero = heroEls.includes(el);
      const tw = gsap.to(words, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.6, stagger: 0.07, ease: EASE, delay: hero ? heroDelay(el) : +(el.dataset.delay || 0), paused: hero, scrollTrigger: hero ? undefined : startFor(el) });
      if (hero) heroTweens.push(tw);
    });
    document.querySelectorAll("[data-nk-para]").forEach((el) => {
      const lines = splitLines(el);
      const hero = heroEls.includes(el);
      const tl = gsap.timeline({ delay: hero ? heroDelay(el) : +(el.dataset.delay || 0), paused: hero, scrollTrigger: hero ? undefined : startFor(el) });
      if (hero) heroTweens.push(tl);
      lines.forEach((ws, i) => {
        gsap.set(ws, { opacity: 0, yPercent: 100, rotate: 10, transformOrigin: "0% 100%" });
        tl.to(ws, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.42, ease: EASE }, i * 0.07);
      });
    });
    document.querySelectorAll("[data-nk-fade]").forEach((el) => {
      const hero = heroEls.includes(el);
      const tw = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: hero ? 1 : 2, ease: EASE, delay: hero ? heroDelay(el) : 0, paused: hero, scrollTrigger: hero ? undefined : startFor(el, "top 80%") });
      if (hero) heroTweens.push(tw);
    });
    // The image rises from 48px below, transparent, over 2s (original storytelling) — if it is within the Hero it appears in the Hero entrance order, if below, when it comes into view
    document.querySelectorAll("[data-nk-rise]").forEach((el) => {
      const hero = heroEls.includes(el);
      const tw = gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 2, ease: EASE, delay: hero ? heroDelay(el) : 0, paused: hero, scrollTrigger: hero ? undefined : startFor(el) });
      if (hero) heroTweens.push(tw);
    });
    // Card grid — cards on the same row stagger by .3s. Once all are up, clear the attached values so the hover recede (.7) applies.
    document.querySelectorAll("[data-nk-cards]").forEach((grid) => {
      const rows = [];
      [...grid.children].forEach((c) => {
        const top = c.offsetTop, row = rows.find((r) => Math.abs(r.top - top) <= 8);
        row ? row.items.push(c) : rows.push({ top, items: [c] });
      });
      rows.forEach((r) => gsap.fromTo(r.items, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 2, stagger: 0.3, ease: EASE, clearProps: "opacity,transform", scrollTrigger: startFor(r.items[0]) }));
    });
    document.querySelectorAll("[data-nk-list]").forEach((list) => {
      gsap.fromTo(list.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: EASE, scrollTrigger: startFor(list, "top 85%") });
    });
    document.querySelectorAll("[data-nk-divider]").forEach((el) => {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 1.2, ease: EASE, scrollTrigger: startFor(el, "top 85%") });
    });
    // Numbers — count from 0 over 1.2s, triggered at 85% of the screen
    document.querySelectorAll("[data-nk-count]").forEach((el) => {
      const raw = el.textContent, m = raw.match(/[\d,.]+/);
      if (!m) return;
      const target = parseFloat(m[0].replace(/,/g, "")), pre = raw.slice(0, m.index), post = raw.slice(m.index + m[0].length), comma = m[0].includes(",");
      const o = { v: 0 };
      const show = () => { const n = Math.round(o.v); el.textContent = pre + (comma ? n.toLocaleString("en-US") : n) + post; };
      show();
      gsap.to(o, { v: target, duration: 1.2, ease: EASE, onUpdate: show, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    // Parallax: photo scales to 1.2x and shifts -10% → 10%
    document.querySelectorAll("[data-nk-parallax]").forEach((el) => {
      gsap.fromTo(el, { yPercent: -10, scale: 1.2 }, { yPercent: 10, scale: 1.2, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // A huge row sliding sideways
    document.querySelectorAll("[data-nk-slide-x]").forEach((el) => {
      const from = +(el.dataset.from ?? 10), to = +(el.dataset.to ?? -40);
      gsap.fromTo(el, { xPercent: from }, { xPercent: to, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => {};
  });

  // Endlessly flowing line — loops back after one set width
  document.querySelectorAll("[data-nk-marquee]").forEach((track) => {
    const belt = track.querySelector(".nk-marquee__belt");
    const set = belt?.querySelector(".nk-marquee__set");
    if (!set) return;
    belt.append(set.cloneNode(true));
    belt.lastElementChild.setAttribute("aria-hidden", "true");
    if (reduce) return;
    const speed = +(track.dataset.speed || 40);
    let x = 0, w = 0, last = 0;
    const measure = () => { w = set.getBoundingClientRect().width + parseFloat(getComputedStyle(belt).columnGap || getComputedStyle(belt).gap || 0); };
    new ResizeObserver(measure).observe(set);
    measure();
    gsap.ticker.add((time) => {
      const dt = last ? Math.min(0.05, time - last) : 0;
      last = time;
      if (!w) return;
      x = (x - speed * dt) % w;
      belt.style.transform = `translate3d(${x}px,0,0)`;
    });
  });

  // Page transition — measured on the original (Next router): leaving the hero takes 317ms up to 87% and entering 150ms, while going from a subpage to the hero switches immediately with no veil (length 0).
  // So the curtain covers in .38s power2.out and lifts evenly in .16s on the next document (about 150ms when measured), links to the hero move instantly with no curtain. A section reached through a transition does not replay the hero intro (like the original SPA)
  const veil = document.querySelector(".nk-veil");
  if (!reduce && veil) {
    if (arrived) { veil.classList.toggle("is-dark", document.body.classList.contains("nk-page-dark")); gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, duration: 0.16, ease: "none" }); }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:)/.test(href)) return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      setMenu(false);
      sessionStorage.setItem("nk-nav", /\/index\.html$/.test(url.pathname) && !url.hash ? "home" : "1");
      if (sessionStorage.getItem("nk-nav") === "home") { location.href = url.href; return; }
      root.classList.add("nk-leaving");
      // The curtain takes the destination page’s background color — going to a black page (Work·Service) it uses the stage color so the screen is actually covered
      veil.classList.toggle("is-dark", /\/(works|service)\.html$/.test(url.pathname));
      gsap.to(veil, { opacity: 1, duration: 0.38, ease: "power2.out", onComplete: () => { location.href = url.href; } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { root.classList.remove("nk-leaving"); gsap.set(veil, { opacity: 0 }); } });
  }
})();
