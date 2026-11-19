// Shared by all pages: glass header bar, mega menu, phone menu, loader, smooth scroll, cursor text trail, footer (square mascot, stone pillar 3D), work card cursor.
// Original values: Lenis lerp .1 · loader targets dom 30 / font 20 / hero 50, follow .08 (.14 when all done), minimum .9s, after finishing it lifts away in 1.1s following .25s ·
// Card cursor quickTo .35 power3 · entrance y30 .9s power3.out top 88% · footer lines 110ms apart · square speech bubble every 6.5s
(() => {
  gsap.registerPlugin(ScrollTrigger, ...(window.CustomEase ? [CustomEase] : []));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  const SQ = (window.SQ = { reduced, fine, page });

  const chev = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 3.5 3 3 3-3"/></svg>';
  const arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 6h9M7 2.5 10.5 6 7 9.5"/></svg>';
  // A symbol redrawn in the same shape (two diagonals) instead of the original logo
  const mark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3h3.6L6.6 21H3z"/><path d="M15.6 3h3.6L15 21h-3.6z"/></svg>';
  SQ.icons = { chev, arrow, mark };
  const logo = (word = "Studio") => `<span class="sq-logo">${mark}<span data-label="Brand English name">${word.toUpperCase()}</span></span>`;
  SQ.logo = logo;

  // Square mascot — redrawn in the same shape as the original concrete square character spot (stone square head, glowing two eyes, orange scarf, black body)
  SQ.square = (pose = "idle") => `
    <svg class="sq-square" viewBox="0 0 120 160" data-pose="${pose}" aria-hidden="true">
      <defs><linearGradient id="sqs-stone-${pose}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--site-stone-hi)"/><stop offset="1" stop-color="var(--site-stone)"/></linearGradient></defs>
      <path d="M38 104h44l6 38H32z" fill="var(--site-body)"/>
      <path d="M44 142v16M76 142v16" stroke="var(--site-body)" stroke-width="7" stroke-linecap="round"/>
      ${pose === "wave"
        ? '<path class="sq-square__arm" d="M84 112q16-10 20-34" stroke="var(--site-body)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M36 112q-10 10-12 26" stroke="var(--site-body)" stroke-width="7" fill="none" stroke-linecap="round"/>'
        : '<path d="M84 112q10 10 12 26M36 112q-10 10-12 26" stroke="var(--site-body)" stroke-width="7" fill="none" stroke-linecap="round"/>'}
      <path d="M36 98h48v12H36z" fill="var(--kf-accent)"/><path d="M70 104l10 22-10-2z" fill="var(--kf-accent)"/>
      <rect x="22" y="22" width="76" height="78" rx="9" fill="url(#sqs-stone-${pose})"/>
      <path d="M30 34l8 4M80 82l8-3M70 30l6 6" stroke="var(--site-stone-lo)" stroke-width="1.5"/>
      <circle cx="46" cy="62" r="5" fill="var(--site-eye)"/><circle cx="74" cy="62" r="5" fill="var(--site-eye)"/>
    </svg>`;

  /* ---------- Header · mega menu · phone menu ---------- */
  const cur = (p) => (p === page ? " is-current" : "");
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "sq-head";
    head.innerHTML = `
      <a href="index.html" aria-label="Home">${logo("Squared")}</a>
      <nav class="sq-nav" aria-label="Main menu" data-label="Your menu English name here">
        <button type="button" class="sq-nav__item" data-mega>Services ${chev}</button>
        <button type="button" class="sq-nav__item${cur("list")}${cur("detail")}" data-mega>Work ${chev}</button>
        <button type="button" class="sq-nav__item" data-mega>Tools ${chev}</button>
        <button type="button" class="sq-nav__item" data-mega>Studio ${chev}</button>
        <a class="sq-nav__item" href="index.html#pricing">Pricing</a>
      </nav>
      <div class="sq-head__end">
        <span class="sq-lang"><b>KO</b> / EN</span>
        <a class="sq-btn is-small" href="service.html" data-fx="circle-follow-button">Plan your call</a>
        <button class="sq-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>
      </div>`;
    head.insertAdjacentHTML("afterend", `
      <div class="sq-mega" data-slot="mega-menu"><div class="sq-mega__in">
        <div class="sq-mega__col"><p class="sq-mono">Menu Group 1</p><a href="list.html">Web design</a><a href="list.html">Branding</a><a href="list.html">Motion</a><a href="list.html">Websites</a></div>
        <div class="sq-mega__col"><p class="sq-mono">Menu Group 2</p><a href="list.html">Apps</a><a href="list.html">AI tools</a><a href="list.html">3D configurators</a><a href="list.html">Hosting</a></div>
        <div class="sq-mega__col"><p class="sq-mono">Menu Group 3</p><a href="detail.html">Brand films</a><a href="detail.html">Event films</a><a href="detail.html">Photography</a><a href="detail.html">Campaigns</a></div>
        <a class="sq-mega__card" href="service.html"><div class="sq-ph wf-img" data-label="On-set scene · warm indoor lighting · horizontal 4:3"></div><span class="sq-mono">Recommended</span><h4 data-label="Your featured English title here">Free 30-minute check</h4><span class="sq-btn is-small" style="align-self:flex-start">Details ${arrow}</span></a>
      </div></div>
      <div class="sq-menu" data-slot="mobile-menu">
        <a class="big" href="index.html" data-label="Your menu English name here">Home</a>
        <a class="big" href="list.html">Work</a>
        <a class="big" href="detail.html">Case</a>
        <a class="big" href="service.html">Check</a>
        <a class="big" href="index.html#pricing">Pricing</a>
        <a class="sq-btn" href="service.html" data-fx="circle-follow-button">Book a call ${arrow}</a>
      </div>`);
    const mega = document.querySelector(".sq-mega");
    // Original tempo: .15s after hover the panel opens (height .217s · chevron .167s · cell y8→0 .1s later at .183s) /
    // On leave, after .21s the line folds to −4px and transparent in .1s, the panel closes in .167s at .3s, and the cell background and chevron return at .48s
    let tOpen = 0, tFold = 0, tShut = 0, tItem = 0;
    const clear = () => [tOpen, tFold, tShut, tItem].forEach(clearTimeout);
    const enter = (n) => {
      clear();
      // When reopened, restore the folded rows without a transition (the original has no row opacity change on opening)
      if (mega.classList.contains("is-folding")) { mega.classList.add("is-snap"); mega.classList.remove("is-folding"); void mega.offsetWidth; mega.classList.remove("is-snap"); }
      if (mega.classList.contains("is-open")) { head.querySelectorAll(".sq-nav__item").forEach((m) => m.classList.toggle("is-open", m === n)); return; }
      tOpen = setTimeout(() => { head.querySelectorAll(".sq-nav__item").forEach((m) => m.classList.toggle("is-open", m === n)); mega.style.setProperty("--mh", mega.firstElementChild.scrollHeight + "px"); mega.classList.add("is-open"); }, 150);
    };
    const leave = () => {
      clear();
      tFold = setTimeout(() => mega.classList.add("is-folding"), 214);
      tShut = setTimeout(() => mega.classList.remove("is-open"), 298);
      tItem = setTimeout(() => head.querySelectorAll(".sq-nav__item.is-open").forEach((m) => m.classList.remove("is-open")), 481);
    };
    head.querySelectorAll("[data-mega]").forEach((n) => n.addEventListener("mouseenter", () => enter(n)));
    head.querySelector(".sq-nav").addEventListener("mouseleave", leave);
    mega.addEventListener("mouseenter", () => { clear(); if (mega.classList.contains("is-folding")) { mega.classList.add("is-snap"); mega.classList.remove("is-folding"); void mega.offsetWidth; mega.classList.remove("is-snap"); } });
    mega.addEventListener("mouseleave", leave);
    head.querySelector(".sq-burger").addEventListener("click", () => {
      const on = document.documentElement.classList.toggle("sq-menu-open");
      SQ.lenis?.[on ? "stop" : "start"]();
    });
  }

  /* ---------- Smooth scroll ---------- */
  if (!reduced && window.Lenis && !document.body.hasAttribute("data-no-lenis")) {
    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    SQ.lenis = lenis;
  }

  /* ---------- Cursor letter trail (glyph-heat-trail part) ---------- */
  document.body.insertAdjacentHTML("afterbegin", '<canvas class="sq-trail" data-fx="glyph-heat-trail" aria-hidden="true"></canvas>');

  /* ---------- Loader (once on first visit) ---------- */
  const intro = () => { document.documentElement.classList.add("is-ready"); window.dispatchEvent(new Event("sq:intro-done")); SQ.introDone = true; };
  const seen = sessionStorage.getItem("sq-loaded") === "1";
  if (reduced || seen || page !== "home") {
    requestAnimationFrame(intro);
  } else {
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="sq-loader" aria-hidden="true" data-slot="loader"><div class="sq-loader__inner">
        <div class="sq-loader__mid"><p class="sq-loader__eyebrow sq-mono">Your greeting here</p>${logo("Squared")}</div>
        <div class="sq-loader__progress"><div class="sq-loader__track"><div class="sq-loader__bar"></div></div><span class="sq-loader__count">0</span></div>
      </div></div>`);
    const el = document.querySelector(".sq-loader"), bar = el.querySelector(".sq-loader__bar"), num = el.querySelector(".sq-loader__count");
    const W = { dom: 30, fonts: 20, hero: 50 }, got = new Set();
    document.documentElement.style.overflow = "hidden";
    SQ.lenis?.stop();
    if (document.readyState === "complete") got.add("dom"); else addEventListener("load", () => got.add("dom"), { once: true });
    document.fonts.ready.then(() => got.add("fonts"));
    addEventListener("sq:hero-ready", () => got.add("hero"), { once: true });
    if (!document.querySelector("[data-hero-scene]")) got.add("hero");
    let force = false, y = 0;
    setTimeout(() => (force = true), 6000);
    const t0 = performance.now();
    const step = (now) => {
      const n = now - t0, all = force || got.size === 3;
      const sum = [...got].reduce((a, k) => a + W[k], 0);
      const soft = (100 - sum) * 0.6 * (1 - Math.exp(-n / 2200)), floor = (n / 900) * 100;
      const goal = Math.min(all ? 100 : Math.min(99, sum + soft), floor);
      y += (goal - y) * (all ? 0.14 : 0.08);
      if (all && floor >= 100 && y > 99.6) y = 100;
      bar.style.transform = `scaleX(${y / 100})`;
      num.textContent = Math.floor(y);
      if (y >= 100) {
        setTimeout(() => {
          el.classList.add("is-leave");
          sessionStorage.setItem("sq-loaded", "1");
          document.documentElement.style.overflow = "";
          SQ.lenis?.start();
          intro();
          setTimeout(() => el.remove(), 1100);
        }, 250);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Footer ---------- */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "sq-foot is-cream";
    foot.id = "contact";
    foot.innerHTML = `
      <div class="sq-foot__ask">
        <h2 class="sq-display sq-foot__big" data-lines-in data-label="Big English closing words, two lines"><span class="sq-line"><span>Let's</span></span><span class="sq-line"><span>talk?</span></span></h2>
        <span class="sq-foot__hole" data-slot="footer-square"><span class="sq-foot__disc"></span><span class="sq-foot__clip"><span class="sq-foot__square" data-square-wave>${SQ.square("idle")}</span></span><span class="sq-foot__bubble"></span></span>
        <p class="sq-foot__lead">Your sentence here in about three lines inviting a no-pressure first call. Together we look at what is needed and pick the right path.</p>
        <div class="sq-foot__ctas"><a class="sq-btn" href="service.html">Book an intro ${arrow}</a><a class="sq-btn is-outline is-small" href="#">hello@studio.name</a></div>
      </div>
      <div class="sq-foot__grid">
        <div class="sq-foot__col"><p class="sq-mono">Page</p><span data-footer-line><a href="index.html">Work</a><a href="index.html#process">Process</a><a href="list.html">Cases</a><a href="index.html#team">Team</a><a href="index.html#pricing">Pricing</a><a href="service.html">Free check</a></span></div>
        <div class="sq-foot__col"><p class="sq-mono">Follow</p><span data-footer-line><a href="#">Instagram</a><a href="#">LinkedIn</a></span></div>
        <div class="sq-foot__col"><p class="sq-mono">Contact</p><span data-footer-line><a href="#">hello@studio.name</a><a href="#">+00 0 00 00 00 00</a></span></div>
        <div class="sq-foot__slashes" data-slot="footer-slashes"><span class="sq-foot__hint sq-mono"><svg viewBox="0 0 80 56"><path d="M76 6C54 6 30 14 14 40"/><path d="M28 41l-14 0-1-14"/></svg>Hover me</span><canvas data-island="footer" aria-hidden="true"></canvas></div>
      </div>
      <div class="sq-foot__legal"><span>© 2026 Studio Name</span><nav><a href="#">Privacy policy</a><a href="#">Terms of service</a><span class="sq-lang"><b>KO</b> / EN</span></nav></div>`;
    const big = foot.querySelector(".sq-foot__big"), hole = foot.querySelector(".sq-foot__hole"), bubble = foot.querySelector(".sq-foot__bubble"), sq = foot.querySelector(".sq-foot__square");
    const lines = ["Your one-line greeting here", "Your second phrase here", "Your third word here", "Your fourth phrase here"];
    let timers = [], every = 0;
    const say = (t, wave) => {
      bubble.textContent = t; bubble.classList.add("is-on");
      if (wave) sq.innerHTML = SQ.square("wave");
      timers.push(setTimeout(() => { sq.innerHTML = SQ.square("idle"); }, 1600), setTimeout(() => bubble.classList.remove("is-on"), 3200));
    };
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      big.classList.add("is-in"); hole.classList.add("is-in");
      if (reduced) { say(lines[0], true); return; }
      let i = 0;
      timers.push(setTimeout(() => say(lines[0], true), 900));
      every = setInterval(() => { i = (i + 1) % lines.length; say(lines[i], i % 2 === 0); }, 6500);
    }, { threshold: 0.6 }).observe(hole);
    sq.addEventListener("pointerenter", () => { timers.forEach(clearTimeout); timers = []; sq.innerHTML = SQ.square("wave"); bubble.textContent = "Your welcome line here"; bubble.classList.add("is-on"); });
    sq.addEventListener("pointerleave", () => { sq.innerHTML = SQ.square("idle"); timers.push(setTimeout(() => bubble.classList.remove("is-on"), 1200)); });
    if (fine && !reduced) {
      let r = 0;
      foot.addEventListener("pointermove", (e) => {
        cancelAnimationFrame(r);
        r = requestAnimationFrame(() => { const b = sq.getBoundingClientRect(); sq.style.setProperty("--lean", gsap.utils.clamp(-1, 1, (2.2 * (e.clientX - (b.left + b.width / 2))) / innerWidth).toFixed(3)); });
      });
      foot.addEventListener("pointerleave", () => sq.style.setProperty("--lean", "0"));
    }
    const fl = [...foot.querySelectorAll("[data-footer-line]")];
    new IntersectionObserver((es, io) => {
      if (!es.some((e) => e.isIntersecting)) return;
      fl.forEach((n, i) => { n.style.transitionDelay = `${110 * i}ms`; n.classList.add("sq-foot__line", "is-in"); });
      io.disconnect();
    }, { threshold: 0.4 }).observe(foot.querySelector(".sq-foot__grid"));
    fl.forEach((n) => n.classList.add("sq-foot__line"));
    // The ”Hover me” label disappears after hovering over the stone pillar for .7s
    const slashes = foot.querySelector(".sq-foot__slashes"), hint = foot.querySelector(".sq-foot__hint");
    let ht = 0;
    slashes.addEventListener("pointerenter", () => { ht = setTimeout(() => hint.classList.add("is-done"), 700); });
    slashes.addEventListener("pointerleave", () => clearTimeout(ht));
  }

  /* ---------- Big uppercase heading: only letters near the cursor get bolder (part weight-proximity — original 400→700, 420px, .12 share per frame) ---------- */
  document.querySelectorAll(".sq-display:not([data-fx])").forEach((h) => {
    if (h.closest(".sq-reel")) return;
    h.setAttribute("data-fx", "weight-proximity");
    h.setAttribute("data-fx-weight-proximity", "rest: 400; near: 748; radius: 420; follow: .12; trusted: true");
  });

  /* ---------- Buttons (after everything through the footer is drawn) ---------- */
  document.querySelectorAll(".sq-btn:not([data-fx])").forEach((b) => b.setAttribute("data-fx", "circle-follow-button"));

  /* ---------- Large heading of lower sections rises line by line (when visible) ---------- */
  document.querySelectorAll("[data-lines-in]").forEach((n) => new IntersectionObserver(([e], io) => { if (e.isIntersecting) { n.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 }).observe(n));

  /* ---------- Reveal (original FadeIn: y30 → 0 .9s power3.out, once at top 88%) ---------- */
  if (!reduced) {
    gsap.utils.toArray("[data-rise]").forEach((n) => {
      gsap.fromTo(n, { autoAlpha: 0, y: +n.dataset.rise || 30 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: +n.dataset.delay || 0, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 88%", once: true } });
    });
  }

  /* ---------- Work card: the cursor pill follows in .35s power3, and once visible the pill row switches on ---------- */
  document.querySelectorAll(".sq-case").forEach((card) => {
    const media = card.querySelector(".sq-case__media"), pin = card.querySelector(".sq-case__cursor");
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { card.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.25 }).observe(card);
    if (!fine || !pin) return;
    const qx = gsap.quickTo(pin, "x", { duration: 0.35, ease: "power3" }), qy = gsap.quickTo(pin, "y", { duration: 0.35, ease: "power3" });
    media.addEventListener("mousemove", (e) => { const r = media.getBoundingClientRect(); qx(e.clientX - r.left); qy(e.clientY - r.top); });
  });

  // Links within the same site navigate after .22s and the new page fades up in .45s (except the first-visit home where the loader runs)
  if (!reduced) {
    // Rises only when arriving via a link — a freshly opened page stays as is
    if (sessionStorage.getItem("sq-nav") === "1" && !document.querySelector(".sq-loader")) document.documentElement.classList.add("sq-enter");
    sessionStorage.removeItem("sq-nav");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html/.test(href)) return;
      e.preventDefault();
      sessionStorage.setItem("sq-nav", "1");
      setTimeout(() => { location.href = href; }, 220);
    });
  }

  // Pressing a work card leaves its spot in place, and the detail page unfolds from that spot into the hero image (original case flip)
  document.addEventListener("click", (e) => {
    const m = e.target.closest(".sq-case__media, .sq-grid__card");
    if (!m) return;
    const r = m.getBoundingClientRect();
    sessionStorage.setItem("sq-flip", JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height }));
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
