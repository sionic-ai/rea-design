// Shared kit for the whole site — mascot illustration, header, phone menu, CTA and footer frame, menu state (band → pill → hidden), reveal
(() => {
  document.documentElement.classList.add("js");
  const page = document.body.dataset.page || "home";

  // ---------- Mascot: rounded hexagon body + two tilted eyes. The original artwork is not used, it was redrawn with the same feel ----------
  const PROPS = {
    hat: '<g transform="translate(50 6)"><ellipse cx="0" cy="18" rx="26" ry="9" fill="var(--kf-ink)"/><rect x="-15" y="-6" width="30" height="24" rx="4" fill="var(--kf-ink)"/><rect x="-15" y="8" width="30" height="5" fill="var(--site-tera-red)"/></g>',
    cap: '<g transform="translate(50 18)"><path d="M-22 6a22 18 0 0 1 44 0z" fill="var(--site-tera-yellow)"/><path d="M14 4h22a4 4 0 0 1 0 6H14z" fill="var(--site-tera-yellow)"/><circle cx="0" cy="-12" r="3" fill="var(--kf-ink)"/></g>',
    balloon: '<g transform="translate(84 -8)"><path d="M0 34c-2 10 4 18 0 30" stroke="var(--kf-ink)" stroke-width="1.6" fill="none"/><ellipse cx="0" cy="16" rx="13" ry="16" fill="var(--site-tera-pink)"/><path d="M-3 32h6l-3 4z" fill="var(--site-tera-pink)"/></g>',
    leaf: '<g transform="translate(52 10)"><path d="M0 8c0-6 2-10 5-12" stroke="var(--kf-ink)" stroke-width="2" fill="none"/><path d="M4-4c6-6 13-6 16-2-5 5-11 6-16 2z" fill="var(--site-tera-green)"/></g>',
  };
  const tera = (prop, flat) => `<svg viewBox="0 0 100 100" aria-hidden="true">${flat ? "" : '<path d="M50 83L79 67L79 33L50 49Z" transform="translate(0 4)" fill="color-mix(in oklab, var(--c) 78%, var(--kf-ink))" stroke="color-mix(in oklab, var(--c) 78%, var(--kf-ink))" stroke-width="20" stroke-linejoin="round"/>'}<path d="M50 17L79 33L79 67L50 83L21 67L21 33Z" fill="var(--c)" stroke="var(--c)" stroke-width="20" stroke-linejoin="round"/><g class="t-eyes"><ellipse class="t-eye" cx="39" cy="51" rx="4.2" ry="9.6" fill="var(--site-white)" transform="rotate(-18 39 51)"/><ellipse class="t-eye" cx="55" cy="56" rx="4.2" ry="9.6" fill="var(--site-white)" transform="rotate(-18 55 56)"/></g>${PROPS[prop] || ""}</svg>`;
  // Mascot turning toward the cursor (data-turn) — rotates the cube on its vertical axis by φ−45° to view it in the same projection as the current hexagon.
  // At φ 0 the eye is on the left front face, at 90 on the right front face, both in the current hexagon shape, and in between the front face passes frontal and the width narrows
  const PX = 20.5, PZ = 11.31, PY = 17;
  const cube = (deg) => {
    const a = ((deg - 45) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), pts = [];
    for (const X of [-1, 1]) for (const Z of [-1, 1]) for (const Y of [-1, 1]) pts.push([50 + PX * (X * c + Z * s), 50 - PY * Y + PZ * (Z * c - X * s)]);
    pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const turn = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
    const half = (list) => { const h = []; for (const p of list) { while (h.length > 1 && turn(h[h.length - 2], h[h.length - 1], p) <= 1e-6) h.pop(); h.push(p); } h.pop(); return h; };
    const hull = [...half(pts), ...half([...pts].reverse())];
    return { body: `M${hull.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("L")}Z`, face: `matrix(${[PX * c, -PZ * s, 0, -PY, 50 + PX * s, 50 + PZ * c].map((v) => v.toFixed(3)).join(" ")})` };
  };
  const turnSvg = '<svg viewBox="0 0 100 100" aria-hidden="true"><path data-body fill="var(--c)" stroke="var(--c)" stroke-width="20" stroke-linejoin="round"/><g data-face><g class="t-eyes"><ellipse class="t-eye" cx="-.42" cy=".1" rx=".24" ry=".5" fill="var(--site-white)"/><ellipse class="t-eye" cx=".42" cy=".1" rx=".24" ry=".5" fill="var(--site-white)"/></g></g></svg>';
  const drawTurn = (t, deg) => {
    const k = Math.round(deg * 100) / 100;
    if (t.tDeg === k) return;
    t.tDeg = k;
    const { body, face } = cube(k);
    t.querySelector("[data-body]").setAttribute("d", body);
    t.querySelector("[data-face]").setAttribute("transform", face);
  };

  const paintTeras = (root = document) => root.querySelectorAll(".t-tera:not([data-painted])").forEach((t, i) => {
    if (t.hasAttribute("data-turn")) { t.innerHTML = turnSvg; drawTurn(t, 0); }
    else t.innerHTML = tera(t.dataset.prop, t.hasAttribute("data-flat"));
    t.setAttribute("data-painted", "");
    t.style.setProperty("--blink", `${3.6 + ((i * 7) % 9) * 0.23}s`);
    t.style.setProperty("--blink-at", `${-((i * 13) % 17) * 0.21}s`);
  });
  window.tPaintTeras = paintTeras;

  // Eyes follow the cursor — original FlatTeraEyes: max at 600px distance along the angle, 3px horizontal and 6px vertical (.35s). Only mascots visible on screen
  const looking = new Set();
  const eyeIO = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? looking.add(e.target) : looking.delete(e.target))));
  // In the original, only the hero title mascot group (FlatTeraEyes) looks at the cursor, so only elements with data-look.
  const watchEyes = (root = document) => root.querySelectorAll("[data-look] .t-tera[data-painted], .t-tera[data-look][data-painted]").forEach((t) => eyeIO.observe(t));
  window.tWatchEyes = watchEyes;
  let lookEvt = null, lookRaf = 0;
  if (matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    lookEvt = e;
    lookRaf ||= requestAnimationFrame(() => {
      lookRaf = 0;
      looking.forEach((t) => {
        const g = t.querySelector(".t-eyes"); if (!g) return;
        const r = g.getBoundingClientRect(), dx = lookEvt.clientX - (r.left + r.width / 2), dy = lookEvt.clientY - (r.top + r.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 600), a = Math.atan2(dy, dx), flip = t.closest("[data-flip]") ? -1 : 1;
        g.style.setProperty("--look-x", (Math.cos(a) * k * flip).toFixed(3));
        g.style.setProperty("--look-y", (Math.sin(a) * k).toFixed(3));
      });
    });
  }, { passive: true });

  const ICON = {
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dot1: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    dot2: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };
  window.tIcon = ICON;
  const roll = (t) => `<span class="t-roll"><span class="t-roll-in" data-t="${t}">${t}</span></span>`;
  window.tRoll = roll;
  const os = `<span class="t-os">${ICON.dl}${ICON.grid}</span>`;

  const LINKS = [["about", "about.html", "About"], ["price", "index.html#pricing", "Fee"], ["news", "news.html", "Blog"], ["contact", "contact.html", "Contact Us"], ["move", "article.html", "Before 1.0"]];
  const FEATS = [["index.html#features", "Feature Name 1", "Your feature description here in one line."], ["index.html#wiki", "Feature Name 2", "Your feature description here in one line."], ["index.html#teammates", "Feature Name 3", "Your feature description here in one line."]];
  const cur = (k) => (k === page ? ' aria-current="page"' : "");

  const head = document.querySelector("[data-t-head]");
  if (head) head.outerHTML = `
<header class="t-nav" data-slot="header" data-top="true">
  <a class="t-nav-brand" href="index.html" aria-label="To the first page"><span class="t-logo">Logo</span></a>
  <div class="t-pill">
    <span class="t-say" data-phase="hidden" aria-hidden="true"><span class="t-say-sizer"></span><span class="t-say-vis"></span></span>
    <span class="t-pill-mascot"><span class="t-tera" data-flat data-turn="ease"></span></span>
    <nav class="t-links" aria-label="Main menu">
      <div class="t-drop"><button type="button" class="t-feat-btn" aria-expanded="false">Feature ${ICON.chev}</button>
        <div class="t-panel">${FEATS.map(([h, s, b]) => `<a href="${h}"><strong>${s}</strong><span>${b}</span></a>`).join("")}</div></div>
      ${LINKS.map(([k, h, t]) => `<a class="t-link" href="${h}"${cur(k)}>${t}</a>`).join("")}
    </nav>
    <div class="t-lang"><button type="button" class="t-lang-btn" aria-expanded="false" aria-label="Choose language">${ICON.globe}<span>Ko</span></button>
      <div class="t-panel"><a href="#" aria-current="true"><strong>Korean</strong></a><a href="#"><strong>English</strong></a></div></div>
    <a class="t-btn t-btn--dark t-nav-dl" href="contact.html">${os}${roll("Download")}</a>
  </div>
</header>
<div class="t-mnav" data-slot="mobile-menu">
  <div class="t-mhead"><a href="index.html" aria-label="To the first page"><span class="t-logo">Logo</span></a>
    <button class="t-burger" type="button" aria-expanded="false" aria-controls="t-mmenu" aria-label="Open Menu"><span class="t-bars"></span></button></div>
  <nav class="t-mmenu" id="t-mmenu" data-open="false" aria-label="Main menu">
    <div class="t-mmenu-scroll">
      <section class="t-mmenu-products"><h2 class="t-mmenu-label">Function</h2>${FEATS.map(([h, s, b]) => `<a href="${h}"><strong>${s}</strong><span>${b}</span></a>`).join("")}</section>
      <div class="t-mmenu-links">${LINKS.map(([k, h, t]) => `<a href="${h}"${cur(k)}>${t}</a>`).join("")}</div>
      <div class="t-mmenu-lang"><a href="#" aria-current="true">Korean</a><a href="#">English</a></div>
      <a class="t-mmenu-dl" href="contact.html">${os}Download</a>
    </div>
    <div class="t-mmenu-mascot"><span class="t-tera"></span><span class="t-mmenu-bubble">Your one-line greeting here</span></div>
  </nav>
</div>`;

  // CTA — six scattered mascots (original position·size·tilt·bobbing period kept as is) line up into a seat row (seat-line-up motion part)
  const FLY = [[9, 27, 150, -12, 3.2, 0, "hat", ""], [20, 84, 170, 8, 3.9, -0.9, "", "purple"], [27, 8, 64, 14, 4.6, -1.8, "", "green"], [73, 9, 84, -8, 3.2, -2.7, "", "blue"], [90, 25, 170, 10, 3.9, -3.6, "cap", "pink"], [80, 83, 156, -8, 4.6, -4.5, "balloon", "teal"]];
  const cta = document.querySelector("[data-t-cta]");
  if (cta) cta.outerHTML = `
<section class="t-cta" data-slot="cta-line-up" data-nav-ground data-fx="seat-line-up">
  <div class="t-cta-teras" aria-hidden="true">${FLY.map(([x, y, s, t, f, d, p, c]) => `<span data-fx-part="flier" style="--x:${x};--y:${y};--size:${s};--tip:${t}deg;--float:${f}s;--delay:${d}s"><span data-fx-part="body"><span class="t-tera" data-c="${c}" data-prop="${p}"></span></span></span>`).join("")}</div>
  <div class="t-cta-content">
    <h2>Your closing title, one line, here.</h2>
    <p class="t-cta-lead">Your short description here in one line.</p>
    <div class="t-cta-row" aria-hidden="true">${"<i data-fx-part=\"seat\"></i>".repeat(6)}</div>
    <div class="t-cta-actions"><a class="t-btn t-btn--cream" href="contact.html">${os}${roll("Download")}<span class="t-arrow" aria-hidden="true"></span></a><a class="t-btn t-btn--line" href="contact.html">${roll("Contact Us")}</a></div>
  </div>
</section>`;

  const foot = document.querySelector("[data-t-foot]");
  const COLS = [["Product", ["Function", "Sync", "Fee", "Download"]], ["Materials", ["Blog", "Help", "Before 1.0"]], ["Company", ["About", "Company info", "Contact Us"]], ["Terms", ["Terms of service", "Personal information", "Security"]]];
  const HREF = { Feature: "index.html#features", Pricing: "index.html#pricing", Blog: "news.html", About: "about.html", Contact: "contact.html", Download: "contact.html", "Before 1.0": "article.html" };
  if (foot) foot.outerHTML = `
<footer class="t-foot" data-slot="footer" data-nav-ground>
  <div class="t-foot-top">
    <div class="t-foot-brand"><span class="t-logo">Logo</span><p>Add your one-line intro here<br>Set in two lines.</p>
      <div class="t-foot-social"><a href="#" aria-label="SNS 1">${ICON.dot2}</a><a href="#" aria-label="SNS 2">${ICON.dot1}</a></div></div>
    <nav class="t-foot-cols" aria-label="Footer">${COLS.map(([h, l]) => `<div><p>${h}</p>${l.map((t) => `<a href="${HREF[t] || "#"}">${t}</a>`).join("")}</div>`).join("")}</nav>
    <div class="t-foot-card"><div class="t-foot-tera" aria-hidden="true"><span class="t-tera" data-flat data-turn="look"></span></div>
      <p class="t-foot-card-title">Your short invitation line here.</p><p class="t-foot-card-sub">Device 1 · Device 2 · Device 3</p>
      <a class="t-foot-action" href="contact.html">${os}${roll("Download")}</a></div>
  </div>
  <div class="t-foot-bottom"><small>© 0000 Company</small><span class="t-foot-lang">${ICON.globe}Ko</span></div>
</footer>`;

  paintTeras();
  watchEyes();

  // ---------- Mascot turns its body toward the cursor ----------
  // Original: if the cursor is more than 8px right of the body center it’s 90°, if left it’s 0°, within 8px it stays as is. Menu avatar (ease) follows exponentially with τ80ms at 30fps,
  // Out of the window it’s 0° — the footer·FAQ mascot (look) turns with 1−e^(−6t) deceleration for .3s each time left/right changes
  const turners = [...document.querySelectorAll(".t-tera[data-turn]")];
  if (turners.length && matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    const st = new Map(turners.map((t) => [t, { side: 0, from: 0, at: 0, deg: 0, last: -Infinity }]));
    const lookEase = (x) => (1 - Math.exp(-6 * x)) / (1 - Math.exp(-6));
    let mx = null, raf = 0;
    const tick = (now) => {
      raf = 0;
      let busy = false;
      st.forEach((s, t) => {
        const ease = t.dataset.turn === "ease";
        if (mx === null) { if (ease) s.side = 0; }
        else {
          const r = t.getBoundingClientRect();
          if (r.width && Math.abs(mx - (r.left + r.width / 2)) >= 8) {
            const side = mx > r.left + r.width / 2 ? 90 : 0;
            if (side !== s.side) { s.side = side; s.from = s.deg; s.at = now; }
          }
        }
        if (s.deg === s.side) return;
        busy = true;
        if (ease) {
          if (now - s.last < 1000 / 30) return;
          const dt = Math.min(100, now - s.last);
          s.last = now;
          s.deg += (s.side - s.deg) * (1 - Math.exp(-dt / 80));
          if (Math.abs(s.side - s.deg) < 0.5) s.deg = s.side;
        } else { const k = (now - s.at) / 300; s.deg = k >= 1 ? s.side : s.from + (s.side - s.from) * lookEase(k); }
        drawTurn(t, s.deg);
      });
      if (busy) raf = requestAnimationFrame(tick);
    };
    const kick = () => { raf ||= requestAnimationFrame(tick); };
    addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; mx = e.clientX; kick(); }, { passive: true });
    document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) { mx = null; kick(); } });
    addEventListener("blur", () => { mx = null; kick(); });
  }

  // ---------- Menu state ----------
  const nav = document.querySelector(".t-nav");
  const footer = document.querySelector(".t-foot");
  const bandEnd = () => { const fv = document.querySelector("[data-band-end]"); return fv ? fv.offsetTop + fv.offsetHeight - 64 : 1; };
  let lastY = scrollY, upFrom = null, sayY = scrollY;
  const say = document.querySelector(".t-say");
  const sync = () => {
    if (!nav) return;
    const y = scrollY, top = y <= bandEnd();
    nav.dataset.top = String(top);
    // Original: scrolling up past 24px reveals the pill (reveal), and scrolling back down folds it (fold)
    if (y < lastY) { upFrom ??= lastY; if (upFrom - y >= 24) nav.dataset.revealed = ""; }
    else { upFrom = null; if (y > lastY) delete nav.dataset.revealed; }
    lastY = y;
    const navBox = nav.getBoundingClientRect();
    const dark = [...document.querySelectorAll("[data-nav-ground]")].some((g) => { const r = g.getBoundingClientRect(); return r.top < navBox.bottom && r.bottom > navBox.top; });
    document.documentElement.toggleAttribute("data-nav-dark", dark);
    if (footer) document.documentElement.toggleAttribute("data-footer", footer.getBoundingClientRect().top < innerHeight * 0.2);
    // One-liner for the section passing through screen center — default line when the pointer is not over a target
    const at = [...document.querySelectorAll("[data-say]")].filter((g) => g !== document.body).filter((g) => { const r = g.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5; }).pop() || null;
    // Original: after scrolling past 32px, empty the page tagline (an empty 32px bubble) and bring it back the next time the pointer leaves the target
    let reset = false;
    if (Math.abs(y - sayY) >= 32) { sayY = y; if (hovered) { hovered = false; reset = true; } }
    if (at !== section || reset) { section = at; if (!hoverLine) show(); }
  };
  // Original speech bubble: when text changes, switches the width first with pop (transparent), then 55ms later full (.2s open · .45s wipe)
  let section = null, hoverLine = null, popTimer = 0, hovered = false;
  const show = () => {
    if (!say) return;
    // Original: until the hand has hovered over the target once and left, it stays hidden as an empty speech bubble (width is 32px inner padding)
    const base = section || (hovered && document.body.dataset.say ? document.body : null);
    const line = hoverLine || (base && { text: base.dataset.say, c: base.dataset.sayC || "" });
    clearTimeout(popTimer);
    if (!line) { say.dataset.phase = "hidden"; if (!hovered) say.firstElementChild.textContent = say.lastElementChild.textContent = ""; return; }
    say.firstElementChild.textContent = line.text;
    say.lastElementChild.textContent = "";
    say.style.setProperty("--say", `var(--site-tera${line.c ? "-" + line.c : ""})`);
    say.dataset.phase = "pop";
    popTimer = setTimeout(() => { say.lastElementChild.textContent = line.text; say.dataset.phase = "full"; }, 55);
  };
  // When the pointer is over receive · contact button · question, after 160ms (360ms on leaving, at least 700ms since the previous line) it switches to that line — the mascot hops for 420ms
  const LINES = [[".t-nav-dl, .h-dl, .t-cta .t-btn--cream", "Click here to go straight to the mascot’s office.", ""], [".h-contact", "A short contact note here.", "pink"]];
  const mascot = document.querySelector(".t-pill-mascot .t-tera");
  let want = null, shown = null, shownAt = -Infinity, lineTimer = 0;
  const apply = () => {
    lineTimer = 0;
    if (want?.text === shown?.text) return;
    if (shown && !want) hovered = true;
    shown = want; shownAt = performance.now();
    // Original: when the menu is a top bar (not a pill), there is no speech bubble or mascot bean
    if (nav?.dataset.top !== "false") return;
    hoverLine = shown; show();
    if (shown && mascot && !reduceMotion) mascot.animate([{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-4px) scale(.96, 1.05)", offset: 0.3 }, { transform: "translateY(0) scale(1.06, .92)", offset: 0.6 }, { transform: "translateY(0) scale(1)" }], { duration: 420, easing: "ease-out" });
  };
  const aim = (line) => {
    if (line?.text === want?.text) return;
    want = line; clearTimeout(lineTimer); lineTimer = 0;
    if (want?.text === shown?.text) return;
    lineTimer = setTimeout(apply, Math.max(line ? 160 : 360, shownAt + 700 - performance.now()));
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || !(e.target instanceof Element)) return;
    const hit = LINES.find(([sel]) => e.target.closest(sel));
    aim(hit ? { text: hit[1], c: hit[2] } : null);
  }, { passive: true });
  document.addEventListener("pointerout", (e) => { if (e.pointerType === "mouse" && !e.relatedTarget) aim(null); }, { passive: true });
  addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
  sync();

  // Dropdowns (features, language) — click to open, click outside to close
  document.querySelectorAll(".t-drop > button").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const box = b.parentElement, open = !box.hasAttribute("data-open");
    document.querySelectorAll(".t-drop[data-open], .t-lang[data-open]").forEach((o) => { o.removeAttribute("data-open"); o.firstElementChild.setAttribute("aria-expanded", "false"); });
    box.toggleAttribute("data-open", open);
    b.setAttribute("aria-expanded", String(open));
  }));
  // Language picker opens on hover like the original and closes when leaving
  document.querySelectorAll(".t-lang").forEach((box) => {
    box.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; box.setAttribute("data-open", ""); box.firstElementChild.setAttribute("aria-expanded", "true"); });
    box.addEventListener("pointerleave", (e) => { if (e.pointerType !== "mouse") return; box.removeAttribute("data-open"); box.firstElementChild.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".t-panel")) return;
    document.querySelectorAll(".t-drop[data-open], .t-lang[data-open]").forEach((o) => { o.removeAttribute("data-open"); o.firstElementChild.setAttribute("aria-expanded", "false"); });
  });

  // Phone menu
  const burger = document.querySelector(".t-burger"), sheet = document.querySelector(".t-mmenu");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    sheet.dataset.open = String(open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  });

  // Appear: original AppearRoot: sets data-in (once) when it enters within the bottom 15% of the screen
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
  document.querySelectorAll("[data-appear]").forEach((el) => (el.getBoundingClientRect().top < innerHeight ? el.setAttribute("data-in", "") : io.observe(el)));
})();
