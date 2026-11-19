// Shared by all pages: draws the band, header, phone menu panel and bottom wordmark, and hooks up the flowing band (30px/s), first-page fixed header, entrances and menu text swapping.
// Original values: band · wordmark 30px/s leftward · about reveal opacity .3s cubic-bezier(.4,.4,0,1) · fixed header .35s ease · menu text .2s/.9s.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("ntUi", "M0,0 C0.4,0.4 0,1 1,1");
  CustomEase.create("ntSwing", "M0,0 C0.85,-0.02 0.2,1.01 1,1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const NT = (window.NT = { reduced });

  const ic = {
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 6h9.5M7 2.5 10.5 6 7 9.5"/></svg>',
    cup: '<path d="M-14 -2h28v4c0 9-6 15-14 15S-14 11-14 2z"/><path d="M14 1c7 0 7 10 0 10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-7 -4c0-6 14-6 14 0z"/><circle cx="0" cy="-11" r="2.5"/>',
  };
  NT.ic = ic;
  document.body.insertAdjacentHTML("afterbegin", `<svg class="nt-sprite" aria-hidden="true"><symbol id="nt-cup" viewBox="-22 -22 44 44"><g fill="currentColor" transform="translate(0 2)">${ic.cup}</g></symbol></svg>`);
  // Placeholder redrawn with the same structure as the original logo (two words on the top line with a teapot circle between them + a large number below).
  const cupMark = (cx, cy, r, sw = 3) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="${sw}"/><g transform="translate(${cx} ${cy + r * 0.12}) scale(${r / 22})" fill="currentColor">${ic.cup}</g>`;
  NT.cupMark = cupMark;
  const logoSvg = `<svg viewBox="0 0 82 35" aria-hidden="true"><g fill="currentColor"><text x="1" y="12" style="font-family: var(--site-font-mark)" font-size="12" textLength="31" lengthAdjust="spacingAndGlyphs">TITLE</text><text x="50" y="12" style="font-family: var(--site-font-mark)" font-size="12" textLength="31" lengthAdjust="spacingAndGlyphs">TITLE</text><text x="41" y="34" style="font-family: var(--site-font-num)" font-weight="700" font-size="25" text-anchor="middle" textLength="54" lengthAdjust="spacingAndGlyphs">000</text></g>${cupMark(41, 7, 6, 1.2)}</svg>`;
  const logo = () => `<a class="nt-logo" href="index.html" aria-label="Home">${logoSvg}</a>`;
  NT.logo = logo;
  const NAV = [["About", "about.html"], ["Articles", "index.html#articles"], ["Tea Friends", "friends.html"], ["News", "news.html"]];
  const roll = (t) => `<span class="nt-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  const search = () => `<label class="nt-search"><input type="search" placeholder="Your search term here"><button type="button" aria-label="Search">${ic.search}</button></label>`;

  // ---------- Strip ----------
  const bandHTML = `<div class="nt-band" data-slot="band-marquee"><div class="nt-band__track">${'<span>Your short slogan here, one more line</span>'.repeat(12)}</div></div>`;

  // ---------- Head ----------
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    const here = location.pathname.split("/").pop() || "index.html";
    const bar = `<div class="nt-head${page === "home" ? " is-home" : ""}">${logo()}<nav class="nt-nav" aria-label="Main menu">${NAV.map(([t, h]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ""}>${roll(t)}</a>`).join("")}</nav>${search()}<button class="nt-menu-btn" type="button" aria-expanded="false">MENU</button></div>`;
    if (page === "home") {
      head.innerHTML = `${bandHTML}<div class="nt-info"><a class="nt-info__link" href="detail.html"><span class="nt-info__date">0000.00.00</span><span class="nt-info__t">Your latest post title in one slightly long line.</span></a>${search()}<button class="nt-menu-btn" type="button" aria-expanded="false">MENU</button></div>${bar}`;
    } else {
      head.classList.add("nt-bandwrap");
      head.innerHTML = bandHTML + bar;
    }
  }

  const menu = document.createElement("nav");
  menu.className = "nt-menu";
  menu.dataset.slot = "menu-panel";
  menu.innerHTML = NAV.map(([t, h]) => `<a href="${h}">${roll(t)}</a>`).join("") + logo();
  document.body.append(menu);
  let menuOpen = false;
  const toggleMenu = (on) => {
    menuOpen = on;
    const top = [...document.querySelectorAll(".nt-band, .nt-info, .nt-head")].reduce((m, el) => { const r = el.getBoundingClientRect(); return r.height && r.bottom > 0 && getComputedStyle(el).display !== "none" ? Math.max(m, r.bottom) : m; }, 0);
    menu.style.setProperty("--menu-top", `${Math.round(top)}px`);
    document.querySelectorAll(".nt-menu-btn").forEach((b) => { b.textContent = on ? "CLOSE" : "MENU"; b.setAttribute("aria-expanded", on); });
    // The original phone menu (STUDIO modal) opens and closes instantly without a transition
    gsap.set(menu, { visibility: on ? "visible" : "hidden", clipPath: on ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" });
  };
  document.querySelectorAll(".nt-menu-btn").forEach((b) => b.addEventListener("click", () => toggleMenu(!menuOpen)));
  addEventListener("keydown", (e) => e.key === "Escape" && menuOpen && toggleMenu(false));

  // ---------- Bottom ----------
  const markSVG = () =>
    `<svg viewBox="0 0 2016 232" aria-hidden="true"><g fill="currentColor"><text x="0" y="229" style="font-family: var(--site-font-mark)" font-size="318" textLength="520" lengthAdjust="spacingAndGlyphs">TITLE</text><text x="840" y="229" style="font-family: var(--site-font-mark)" font-size="318" textLength="1176" lengthAdjust="spacingAndGlyphs">000 TITLE</text></g>${cupMark(680, 116, 108, 10)}</svg>`;
  NT.people = (kind) => {
    // Instead of the original illustration, two flat figures of the same spot and size (head, body, legs shapes)
    const fig = (x, y, s, body, leg, hair, flip = 1, sit = false) => `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})"><path d="M-9 ${sit ? 30 : 40}l-3 ${sit ? 14 : 34}h8l3 -${sit ? 12 : 30}z M3 ${sit ? 30 : 40}l${sit ? 18 : 2} ${sit ? 6 : 34}h8l-${sit ? 14 : 2} -${sit ? 12 : 34}z" fill="${leg}"/><rect x="-13" y="6" width="26" height="${sit ? 30 : 38}" rx="10" fill="${body}"/><circle cx="0" cy="-4" r="9" fill="var(--site-skin)"/><path d="M-10 -5c0-12 20-12 20 0c-4-4-14-4-20 0z" fill="${hair}"/><path d="M12 14l14 ${sit ? 4 : 10}" stroke="${body}" stroke-width="7" stroke-linecap="round"/></g>`;
    const sets = {
      picnic: fig(42, 40, 1.4, "var(--site-green)", "var(--site-brown)", "var(--site-orange)") + fig(96, 70, 1.3, "var(--kf-ink-soft)", "var(--site-purple)", "var(--kf-ink-soft)", -1, true) + '<rect x="20" y="128" width="40" height="22" rx="3" fill="var(--site-tan)"/><path d="M24 128c0-14 32-14 32 0" stroke="var(--site-brown)" stroke-width="3" fill="none"/><ellipse cx="86" cy="146" rx="60" ry="6" fill="var(--site-olive)" opacity=".5"/>',
      table: fig(30, 46, 1.25, "var(--site-green)", "var(--site-purple)", "var(--kf-ink-soft)", 1, true) + fig(122, 46, 1.25, "var(--site-sky)", "var(--site-brown)", "var(--site-orange)", -1, true) + '<rect x="56" y="78" width="42" height="6" rx="3" fill="var(--site-tan)"/><rect x="74" y="84" width="6" height="48" fill="var(--site-brown)"/><ellipse cx="77" cy="74" rx="10" ry="5" fill="var(--site-orange)"/>',
      hand: fig(34, 40, 1.4, "var(--site-purple)", "var(--site-orange)", "var(--kf-ink-soft)") + fig(80, 40, 1.4, "var(--kf-ink-soft)", "var(--site-green)", "var(--site-brown)", -1) + '<rect x="40" y="10" width="26" height="18" rx="2" fill="var(--site-yellow)"/><circle cx="58" cy="60" r="9" fill="var(--site-sky)"/>',
    };
    return `<svg viewBox="0 0 150 150" aria-hidden="true">${sets[kind] || sets.picnic}</svg>`;
  };
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("nt-foot");
    const sns = ["IG", "FB", "YT", "X", "TT"].map((k) => `<a href="#" aria-label="${k}"><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.5" fill="currentColor"/></svg></a>`).join("");
    foot.innerHTML = `
      <div class="nt-foot__mark" data-slot="footer-wordmark"><div class="nt-foot__track">${markSVG()}${markSVG()}${markSVG()}</div></div>
      <div class="nt-foot__body"><p>Your one line here on what this site conveys.<br>An activity called “Your project name here” in one line,<br>One line: a site that continues the story of working with many people and companies.</p><div class="nt-foot__ill">${NT.people("hand")}</div></div>
      <nav class="nt-foot__nav">${NAV.map(([t, h]) => `<a href="${h}">${roll(t)}</a>`).join("")}<a class="is-r" href="#">${roll("Brand site")}</a><a class="is-r" href="#">${roll("Online shop")}</a></nav>
      <div class="nt-foot__copy"><span>Copyright(c) 0000 COMPANY NAME All Rights Reserved.</span><div class="nt-foot__sns">${sns}</div><a href="#">${roll("Privacy policy")}</a></div>`;
  }

  // ---------- Flowing things ----------
  const marquee = (track, pxPerSec) => {
    if (!track || reduced) return;
    let x = 0;
    gsap.ticker.add((t, dt) => {
      const unit = track.children[1] ? track.children[1].offsetLeft - track.children[0].offsetLeft : track.scrollWidth / 2;
      x -= (pxPerSec * dt) / 1000;
      if (-x >= unit) x += unit;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  };
  NT.marquee = marquee;
  document.querySelectorAll(".nt-band__track, .nt-foot__track").forEach((t) => marquee(t, 30));

  // Home page fixed header (original #fix-header): appears once past the bottom of the Hero while ‹scrolling down›, and hides when scrolling up above the Hero bottom −80px.
  // Always hidden above the top of the Hero. Transition is enabled only after two frames so it doesn’t flicker on first draw
  const homeHead = document.querySelector(".nt-head.is-home");
  const fv = document.querySelector(".hero");
  if (homeHead && fv) {
    requestAnimationFrame(() => requestAnimationFrame(() => homeHead.classList.add("is-ready")));
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      const y = scrollY, fvBottom = fv.offsetTop + fv.offsetHeight, down = y > lastY;
      if (y > fvBottom && down) homeHead.classList.add("is-shown");
      else if (!down && y <= fvBottom - 80) homeHead.classList.remove("is-shown");
      if (y <= fv.offsetTop) homeHead.classList.remove("is-shown");
      lastY = y;
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  }

  // ---------- Entrance ----------
  const mm = gsap.matchMedia();
  // Original Brand appear: when it enters the screen only opacity goes 0→1, default transition .3s cubic-bezier(.4,.4,0,1) (about only — the first page·list cards stand with no entrance)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-appear]").forEach((el) => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "ntUi", delay: (+el.dataset.appear || 0) / 1000, scrollTrigger: { trigger: el, start: "top bottom", once: true } });
    });
  });

  // Button arrow: the original stacks two arrow images, red and beige, and turns on the beige one on hover (the color switches instead of bleeding)
  document.querySelectorAll(".nt-go > svg").forEach((s) => { const on = s.cloneNode(true); on.classList.add("nt-go__on"); on.setAttribute("aria-hidden", "true"); s.after(on); });

  // ---------- Same-page links ----------
  // The original moves between static pages directly (no transition curtain). Only same-page # links scroll smoothly and the phone menu panel closes
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const [file, hash] = a.getAttribute("href").split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file !== here || !hash || !document.getElementById(hash)) return;
    e.preventDefault();
    if (menuOpen) toggleMenu(false);
    document.getElementById(hash).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  });
})();
