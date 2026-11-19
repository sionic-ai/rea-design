// Common to all pages: draw once the yellow blob logo · white pill menu · expanding menu · wide drawer menu · phone menu · hand-drawn landscape footer, and
// Attaches and detaches reveal, tabs and page scripts for each Barba container.
// Original libraries as they are: page transitions barba 2.9.7 · slides slick 1.8.1 · photo strip infiniteslide 2.0.1 (jQuery 3.7.1).
// The original Velocity 1.2.2 tweens are ported with GSAP + CustomEase using the same béziers, durations and delays (Velocity’s named curves are the bézier values as they are).
// Original values: rise y 50 (phone 30) 1.5s easeOutCubic, stacking a 20ms delay each time items become visible · expanded menu drops from 20px above over .3s easeOutQuart (close .15s easeOutCubic)
//            Drawer menu .3s easeOutQuart (close .2s) · logo: scrolling past 60px scales the mark 1.22x (.8s easeOutQuart) and hides the text
// Footer: when the footer’s top edge comes 900px (phone 400) above the bottom of the screen, hill and bird 1.2s (delay .1) · plane x50 y20 1s (delay .1) · train x400 1.4s (delay .35) easeOutQuart
//            Transition: body · footer off .2s → loading circle (delay .2) → next page after .6s → loading off .15s (delay .15), body · footer · header on .45s (delay .3)
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 767;
  const page = document.body.dataset.page || "home";
  const TP = (window.TP = { reduced, isSP, pages: {} });
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const ease = (TP.ease = {
    outQuad: CustomEase.create("tpOutQuad", "0.25,0.46,0.45,0.94"),
    outCubic: CustomEase.create("tpOutCubic", "0.215,0.61,0.355,1"),
    outQuart: CustomEase.create("tpOutQuart", "0.165,0.84,0.44,1"),
    inQuart: CustomEase.create("tpInQuart", "0.895,0.03,0.685,0.22"),
    inOutQuart: CustomEase.create("tpInOutQuart", "0.76,0,0.24,1"),
    inOutCubic: CustomEase.create("tpInOutCubic", "0.645,0.045,0.355,1"),
    inOutQuint: CustomEase.create("tpInOutQuint", "0.86,0,0.07,1"),
    cssOut: CustomEase.create("tpCssOut", "0,0,0.58,1"),
    // The named curve spring from Velocity 1.2, exactly as is
    spring: (p) => 1 - Math.cos(4.5 * p * Math.PI) * Math.exp(-6 * p),
  });
  TP.page = (ns, def) => (TP.pages[ns] = def);
  // Velocity starts a called tween on the next frame (start values are also read then) — scroll appearance is opened one frame late like the original
  TP.tick = (fn) => requestAnimationFrame(fn);

  // ─── Artwork — original logo, icons and hand drawings redrawn at the same position and size ───
  const arrow = '<i class="tp-arrow"><svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="13"/><path d="M11 8.3 15.6 13 11 17.7"/></svg></i>';
  const plus = '<i class="tp-plus"><svg viewBox="0 0 19 19" aria-hidden="true"><circle cx="9.5" cy="9.5" r="9.5" fill="var(--site-yellow)"/><path d="M9.5 5.2v8.6M5.2 9.5h8.6" stroke="var(--kf-surface)" stroke-width="2" stroke-linecap="round"/></svg></i>';
  const blob = "M22 26C38 4 98-2 126 12c26 14 28 54 8 74-24 22-86 22-110 4C2 74 6 46 22 26z";
  const mark = `<svg viewBox="0 0 148 104" aria-label="Logo"><path d="${blob}" fill="var(--site-yellow)"/>
      <text x="74" y="50" text-anchor="middle" style="font-family: var(--kf-font-hand, var(--kf-font-display))" font-size="34" fill="var(--kf-surface)" transform="rotate(-8 74 50)">Name</text>
      <path d="M40 74c14-8 28 6 44-2s22-10 30-2" fill="none" stroke="var(--kf-surface)" stroke-width="2" stroke-linecap="round"/></svg>`;
  const typeSet = '<strong>Your name here</strong><small>GROUP NAME</small>';
  const wide = `<svg viewBox="0 0 266 44" aria-label="Logo"><path d="${blob}" transform="scale(.34) translate(0 18)" fill="var(--site-yellow)"/>
      <text x="62" y="34" style="font-family: var(--kf-font-round, var(--kf-font-sans))" font-size="24" letter-spacing="2" fill="var(--kf-ink)">Your name here</text>
      <text x="62" y="10" style="font-family: var(--kf-font-sans)" font-size="7" letter-spacing="2" fill="var(--kf-ink)">Your short intro here</text></svg>`;
  const blank = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="4.5" width="10" height="10" rx="1"/><path d="M5 1.5h9.5V11"/></svg>';
  TP.icons = { arrow, plus, mark, typeSet, wide };

  const cur = (...p) => (p.includes(page) ? " is-on" : "");
  const about = [
    { ko: "About us", en: "About Our Group", href: "about.html" },
    { ko: "The Path We’ve Walked", en: "Our Group's Story", href: "#" },
    { ko: "Our Table", en: "Food and Table", href: "#" },
  ];
  const groups = [
    { id: "a", name: "Your facility category 1 here", rows: 4 },
    { id: "b", name: "Your facility category 2 here", rows: 3 },
    { id: "c", name: "Your facility category 3 here", rows: 6 },
    { id: "d", name: "Your facility category 4 here", rows: 7 },
  ];
  TP.groups = groups;

  document.body.insertAdjacentHTML("afterbegin", '<div class="tp-loading" aria-hidden="true"></div>');
  const loading = document.querySelector(".tp-loading");

  const head = document.querySelector('[data-slot="header"]');
  head.classList.add("tp-head");
  head.innerHTML = `
    <div class="tp-logo">
      <a class="tp-logo__mark" href="index.html" aria-label="Home">${mark}</a>
      <a class="tp-logo__type" href="index.html">${typeSet}</a>
    </div>
    <nav class="tp-gnav" aria-label="Main menu"><ul>
      <li class="has-plus tp-gnav__drop${cur("about")}"><button type="button">About our group${plus}</button>
        <div class="tp-dnav" data-slot="drop-menu"><ul>
          ${about.map((m) => `<li><a href="${m.href}">${arrow}<strong>${m.ko}</strong><em>${m.en}</em></a></li>`).join("")}
        </ul></div></li>
      <li class="${cur("news")}"><a href="news.html">News</a></li>
      <li class="has-plus tp-gnav__mega"><button type="button">Our childcare and support${plus}</button></li>
      <li><a href="#">Admission Guide</a></li>
      <li class="${cur("recruit", "interview")}"><a href="recruit.html">Hiring Info</a></li>
      <li><a href="#">Contact Us</a></li>
    </ul></nav>
    <div class="tp-mnav" data-slot="mega-menu"><div class="tp-mnav__in">
      <div class="tp-mnav__parent"><ul>${groups.map((g) => `<li><button type="button" data-to="${g.id}">${g.name}</button></li>`).join("")}</ul></div>
      <div class="tp-mnav__child"><dl>
        ${groups
          .map(
            (g) => `<dt id="tp-mnav-${g.id}"><a href="#">${g.name}${arrow}</a></dt>
            <dd><ul>${Array.from({ length: g.rows }, (_, i) => `<li><a href="#">${arrow}<strong>Your facility name $ here{String(i + 1).padStart(2, "0")}</strong></a><address>Your neighborhood name here</address></li>`).join("")}</ul>
            <div class="tp-btn is-round"><a href="#">${arrow}${g.name}</a></div></dd>`
          )
          .join("")}
      </dl></div>
    </div></div>`;

  const footInner = `
    <h2>${wide}</h2>
    <address>〒000-0000 Your one-line address goes here 00-0</address>
    <p>For phone inquiries, please contact each facility.</p>
    <h3>Operated by: Your organization name here / Your partner organization name here</h3>
    <div class="tp-foot__link"><a href="#" target="_blank" rel="noopener">${blank}Your other division site here</a></div>`;

  head.insertAdjacentHTML(
    "afterend",
    `<button class="tp-burger" type="button" aria-label="Open Menu"><div><span></span><span></span></div></button>
    <div class="tp-spnav" data-slot="mobile-menu">
      <div class="tp-spnav__in">
        <svg class="tp-spnav__wave" viewBox="0 0 375 91" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40C60 10 120 0 190 22s120 30 185 0V91H0z"/></svg>
        <div class="tp-spnav__logo"><a href="index.html">${mark}</a></div>
        <nav><ul>
          <li><a href="news.html">News</a>
            <div class="tp-spnav__pick"><strong>(Latest posts)</strong><span>Your latest news headline scrolls by here in one line</span></div></li>
          <li><span>About us</span><ul>${about.map((m) => `<li><a href="${m.href}">${arrow}${m.ko}</a></li>`).join("")}</ul></li>
          <li><span>Our Childcare · Support</span><ul>${groups.map((g) => `<li><a href="#">${arrow}${g.name}</a></li>`).join("")}</ul></li>
          <li><a href="#">Admission Guide</a></li>
          <li><a href="recruit.html">Hiring Info</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul></nav>
        <div class="tp-foot__inner">${footInner}</div>
        <small class="tp-spnav__copy">© Group Name All Rights Reserved.</small>
      </div>
    </div>`
  );

  // The original footer picture (sky · sea · island · village · dandelion hill · bird on a branch · plane · train) newly drawn at the same ratio (4114×3025)
  const dots = (n, x0, x1, y0, y1, r, fill) => {
    let s = "", seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (y < y0 + (x - x0) * ((y1 - y0) / (x1 - x0)) * -0.2 + 40) continue;
      s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r * (0.6 + rnd() * 0.8)).toFixed(1)}" fill="${fill}"/>`;
    }
    return s;
  };
  const houses = Array.from({ length: 26 }, (_, i) => `<rect x="${880 + (i % 13) * 38 + (i > 12 ? 14 : 0)}" y="${760 + (i > 12 ? 36 : 0) + (i % 3) * 6}" width="22" height="16" rx="2" fill="var(--kf-surface)" opacity=".9"/>`).join("");
  const land = `<svg viewBox="0 0 1440 1059" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="tp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--site-sky-top)"/><stop offset="1" stop-color="var(--site-sky)"/></linearGradient></defs>
      <rect width="1440" height="1059" fill="url(#tp-sky)"/>
      <path d="M0 640c90-30 160-60 250-50s120 30 210 10 160-50 260-40 130 40 230 30 180-50 260-40 150 30 230 20V700H0z" fill="var(--site-mount-far)"/>
      <path d="M0 668c120-22 200-40 300-30s160 20 260 4 160-24 240-18 150 22 240 14 200-30 400-6V720H0z" fill="var(--site-mount)"/>
      <rect y="700" width="1440" height="359" fill="var(--site-sea)"/>
      <path d="M760 760c120-20 300-30 680-24V860c-260-10-480 0-680-40z" fill="var(--site-hill)" opacity=".55"/>
      ${houses}
      <path d="M980 832h460" stroke="var(--kf-surface)" stroke-width="6"/>
    </svg>`;
  const hill = `<svg viewBox="0 0 1440 394" aria-hidden="true">
      <path d="M0 40C220 60 520 150 820 250s420 110 620 120V394H0z" fill="var(--site-hill)"/>
      <path d="M0 90C240 110 500 190 780 280s440 90 660 100V394H0z" fill="var(--site-leaf)"/>
      ${dots(150, 0, 1100, 70, 394, 10, "var(--site-yellow)")}
      <circle cx="560" cy="230" r="26" fill="var(--kf-surface)"/><circle cx="560" cy="230" r="8" fill="var(--site-cheek)"/>
    </svg>`;
  const bird = `<svg viewBox="0 0 610 199" aria-hidden="true">
      <path d="M0 150c80-20 160-30 240-60s170-60 370-70" fill="none" stroke="var(--site-bark)" stroke-width="10" stroke-linecap="round"/>
      <path d="M250 92c20-30 40-50 70-60M400 50c10-20 30-30 50-34" fill="none" stroke="var(--site-bark)" stroke-width="6" stroke-linecap="round"/>
      <g fill="var(--site-leaf)"><ellipse cx="200" cy="70" rx="60" ry="28"/><ellipse cx="330" cy="30" rx="56" ry="24"/><ellipse cx="460" cy="20" rx="48" ry="20"/><ellipse cx="100" cy="120" rx="44" ry="20"/></g>
      <g transform="translate(500 60)"><ellipse cx="30" cy="40" rx="30" ry="36" fill="var(--kf-dim)"/><circle cx="34" cy="10" r="16" fill="var(--kf-dim)"/><circle cx="40" cy="8" r="3" fill="var(--kf-ink)"/><path d="M48 12l12 4-12 3z" fill="var(--kf-ink-soft)"/><path d="M20 70l-6 22M34 72l2 20" stroke="var(--kf-ink-soft)" stroke-width="3"/></g>
    </svg>`;
  const plane = '<svg viewBox="0 0 112 44" aria-hidden="true"><path d="M4 24c30-4 70-8 96-10 8 0 10 6 2 8-26 6-64 10-94 8zM50 18 70 2h8L64 18zM46 26l18 16h8L58 26zM8 24 2 12h6l10 10z" fill="var(--kf-surface)"/></svg>';
  const train = '<svg viewBox="0 0 238 30" aria-hidden="true"><path d="M0 4h200c20 0 36 10 38 22H0z" fill="var(--kf-surface)"/><path d="M0 18h232" stroke="var(--site-cheek)" stroke-width="3"/><g fill="var(--site-mount)">' + Array.from({ length: 12 }, (_, i) => `<rect x="${8 + i * 16}" y="8" width="9" height="5" rx="1"/>`).join("") + "</g></svg>";

  const foot = document.querySelector('[data-slot="footer"]');
  foot.classList.add("tp-foot");
  foot.innerHTML = `
    <div class="tp-foot__pic">
      ${land}
      <div class="tp-foot__hill">${hill}</div>
      <div class="tp-foot__bird">${bird}</div>
      <div class="tp-foot__plane">${plane}</div>
      <div class="tp-foot__train">${train}</div>
    </div>
    <div class="tp-foot__inner">${footInner}</div>
    <small class="tp-foot__copy">© Group Name All Rights Reserved.</small>`;

  // ─── Expanding menu (About) ───
  const dnavLi = head.querySelector(".tp-gnav__drop");
  const dnav = head.querySelector(".tp-dnav");
  const dnavOpen = () => {
    dnavLi.classList.add("is-current");
    gsap.killTweensOf(dnav);
    dnav.classList.add("is-active");
    TP.tick(() => gsap.fromTo(dnav, { display: "block", marginTop: -20 }, { opacity: 1, marginTop: 0, duration: reduced ? 0 : 0.3, ease: ease.outQuart }));
  };
  const dnavClose = () => {
    dnavLi.classList.remove("is-current");
    dnav.classList.remove("is-active");
    TP.tick(() => gsap.to(dnav, { opacity: 0, marginTop: -20, duration: reduced ? 0 : 0.15, ease: ease.outCubic, onComplete: () => gsap.set(dnav, { display: "none" }) }));
  };
  dnavLi.addEventListener("mouseenter", dnavOpen);
  dnavLi.addEventListener("mouseleave", dnavClose);

  // ─── Wide drawer menu (childcare · support) — original: opens when hovering that menu, closes when hovering the body or another menu ───
  const megaLi = head.querySelector(".tp-gnav__mega");
  const mnav = head.querySelector(".tp-mnav");
  let mnavOn = false;
  const mnavOpen = () => {
    megaLi.classList.add("is-current");
    if (mnavOn) return;
    mnavOn = true;
    gsap.killTweensOf(mnav);
    gsap.set(mnav, { display: "block", opacity: 0 });
    mnav.scrollTop = 0;
    gsap.to(mnav, { opacity: 1, duration: reduced ? 0 : 0.3, ease: ease.outQuart });
  };
  const mnavClose = () => {
    megaLi.classList.remove("is-current");
    if (!mnavOn) return;
    gsap.killTweensOf(mnav);
    gsap.to(mnav, { opacity: 0, duration: reduced ? 0 : 0.2, ease: ease.outQuart, onComplete: () => { gsap.set(mnav, { display: "none" }); mnavOn = false; } });
  };
  megaLi.addEventListener("mouseenter", mnavOpen);
  head.querySelectorAll(".tp-gnav > ul > li:not(.tp-gnav__mega)").forEach((li) => li.addEventListener("mouseenter", mnavClose));
  document.addEventListener("mouseover", (e) => { if (mnavOn && e.target.closest(".tp-contents")) mnavClose(); });
  // Original: pressing the left branch scrolls down to that group inside the panel in .6s easeOutCubic
  mnav.querySelectorAll(".tp-mnav__parent button").forEach((b) =>
    b.addEventListener("click", () => {
      const dt = mnav.querySelector(`#tp-mnav-${b.dataset.to}`);
      const max = mnav.scrollHeight - mnav.clientHeight;
      const y = Math.min(dt.offsetTop - 120 * parseFloat(getComputedStyle(document.documentElement).fontSize), max);
      const o = { y: mnav.scrollTop };
      gsap.to(o, { y, duration: reduced ? 0 : 0.6, ease: ease.outCubic, onUpdate: () => (mnav.scrollTop = o.y) });
    })
  );
  TP.closeMenus = () => { dnavClose(); mnavClose(); };

  // ─── Phone Menu ───
  const burger = document.querySelector(".tp-burger");
  const sp = document.querySelector(".tp-spnav");
  const spIn = sp.querySelector(".tp-spnav__in");
  let keepY = 0;
  const closeSP = () => {
    burger.classList.remove("is-active");
    gsap.killTweensOf([sp, spIn]);
    gsap.to(spIn, { opacity: 0, duration: reduced ? 0 : 0.15, ease: ease.outCubic, onComplete: () => (spIn.scrollTop = 0) });
    gsap.to(sp, { opacity: 0, duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.15, ease: "none", onComplete: () => sp.classList.remove("is-active") });
    document.body.classList.remove("tp-noscroll");
    document.body.style.top = "";
    scrollTo(0, keepY);
  };
  burger.addEventListener("click", () => {
    if (burger.classList.toggle("is-active")) {
      sp.classList.add("is-active");
      gsap.killTweensOf([sp, spIn]);
      gsap.to(sp, { opacity: 1, duration: reduced ? 0 : 0.15, ease: "none" });
      gsap.to(spIn, { opacity: 1, duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.15, ease: ease.outCubic });
      keepY = scrollY;
      document.body.classList.add("tp-noscroll");
      document.body.style.top = -keepY + "px";
    } else closeSP();
  });
  // Original .news-pickup: if the latest post title is longer than its cell, it scrolls at 40px per second
  const pick = sp.querySelector(".tp-spnav__pick span");
  if (pick && !reduced) {
    pick.insertAdjacentHTML("afterend", `<span aria-hidden="true">${pick.textContent}</span>`);
    const run = () => {
      const w = pick.offsetWidth + 24;
      gsap.killTweensOf(pick.parentNode.querySelectorAll("span"));
      gsap.fromTo(pick.parentNode.querySelectorAll("span"), { x: 0 }, { x: -w, duration: w / 40, ease: "none", repeat: -1 });
    };
    pick.parentNode.querySelectorAll("span").forEach((s) => (s.style.display = "inline-block", s.style.paddingRight = "24px"));
    burger.addEventListener("click", run);
  }

  // ─── Logo: after scrolling past 60px the mark grows and the text switches off (on the phone’s first page, only after passing the hero) ───
  const logo = head.querySelector(".tp-logo");
  const markEl = head.querySelector(".tp-logo__mark");
  const onScroll = () => {
    const homeSP = isSP() && box().dataset.barbaNamespace === "home";
    if (homeSP) {
      const h = head.offsetHeight, pad = parseFloat(getComputedStyle(head).paddingTop);
      const on = scrollY >= innerHeight - h - pad;
      logo.classList.toggle("is-active", on);
      markEl.classList.toggle("is-absolute", !on);
    } else {
      markEl.classList.remove("is-absolute");
      logo.classList.toggle("is-active", scrollY >= 60);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });

  // ─── Footer art ───
  const fp = {
    hill: foot.querySelector(".tp-foot__hill"),
    bird: foot.querySelector(".tp-foot__bird"),
    plane: foot.querySelector(".tp-foot__plane"),
    train: foot.querySelector(".tp-foot__train"),
  };
  let footST;
  function footReset() {
    footST && footST.kill();
    const em = (n) => `${n}em`;
    if (reduced) return gsap.set([fp.plane, fp.train], { opacity: 1 }), gsap.set(fp.hill, { bottom: 0 }), gsap.set(fp.bird, { marginTop: 0 });
    gsap.set(fp.hill, { bottom: em(-24) });
    gsap.set(fp.bird, { marginTop: em(8) });
    gsap.set([fp.plane, fp.train], { opacity: 0 });
    footST = ScrollTrigger.create({
      trigger: foot,
      start: () => `top bottom-=${isSP() ? 400 : 900}`,
      once: true,
      onEnter: () => TP.tick(() => {
        gsap.to(fp.hill, { bottom: 0, duration: 1.2, delay: 0.1, ease: ease.outQuart });
        gsap.to(fp.bird, { marginTop: 0, duration: 1.2, delay: 0.1, ease: ease.outQuart });
        gsap.fromTo(fp.plane, { x: 50, y: 20 }, { opacity: 1, x: 0, y: 0, duration: 1, delay: 0.1, ease: ease.outQuart });
        gsap.fromTo(fp.train, { x: 400 }, { opacity: 1, x: 0, duration: 1.4, delay: 0.35, ease: ease.outQuart });
      }),
    });
  }

  // ─── Per Body ───
  const box = () => document.querySelector('[data-barba="container"]');
  const run = (el, fn) => {
    const def = TP.pages[el.dataset.barbaNamespace];
    return def && def[fn] ? [def[fn](el)] : [];
  };
  let cleanups = [];

  // Original .img-fadein — once when it passes 100px below the screen, delay stacks 20ms each time one becomes visible
  function fades(el) {
    const items = gsap.utils.toArray("[data-fadein]", el);
    if (reduced) return void gsap.set(items, { opacity: 1 });
    let delay = 0;
    const sts = items.map((item) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top bottom-=100",
        once: true,
        onEnter: () => {
          const d = delay / 1000;
          delay += 20;
          TP.tick(() => gsap.fromTo(item, { opacity: 0, y: isSP() ? 30 : 50 }, { opacity: 1, y: 0, duration: 1.5, delay: d, ease: ease.outCubic }));
        },
      })
    );
    return () => sts.forEach((s) => s.kill());
  }

  // Original .tab-list: current cell off in .05s → next cell height .3s easeOutCubic · text .15s (delay .15)
  function tabs(el) {
    el.querySelectorAll(".tp-tabs").forEach((t) => {
      const lis = [...t.querySelectorAll("nav li")];
      const panes = [...t.querySelectorAll(".tp-tabs__pane")];
      const wrap = t.querySelector(".tp-tabs__list > div");
      lis[0].classList.add("is-current");
      panes[0].classList.add("is-current");
      lis.forEach((li, i) =>
        li.addEventListener("click", () => {
          lis.forEach((x) => x.classList.toggle("is-current", x === li));
          const now = panes.find((p) => p.classList.contains("is-current"));
          const next = panes[i];
          gsap.set(wrap, { height: wrap.offsetHeight });
          gsap.to(now, {
            opacity: 0, duration: reduced ? 0 : 0.05, ease: "none",
            onComplete: () => {
              gsap.set(now, { display: "none" });
              now.classList.remove("is-current");
              next.classList.add("is-current");
              // In the original, Velocity applies the zero-length call that turns on the next cell on the next frame — so pressing the same cell again turns it off for one frame and back on
              TP.tick(() => {
                gsap.set(next, { display: "block", opacity: 0, position: "absolute" });
                gsap.to(wrap, { height: next.offsetHeight, duration: reduced ? 0 : 0.3, ease: ease.outCubic });
                gsap.to(next, { opacity: 1, duration: reduced ? 0 : 0.15, delay: reduced ? 0 : 0.15, ease: "none" });
              });
            },
          });
        })
      );
    });
  }

  // Original: # links scroll to that spot with .7s easeInOutQuart
  function anchors(el) {
    el.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) =>
      a.addEventListener("click", (e) => {
        const t = document.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        scrollToY(t.getBoundingClientRect().top + scrollY, 0.7, ease.inOutQuart);
      })
    );
  }
  const scrollToY = (y, d, e) => {
    const o = { y: scrollY };
    gsap.to(o, { y, duration: reduced ? 0 : d, ease: e, onUpdate: () => scrollTo(0, o.y) });
  };
  TP.scrollToY = scrollToY;

  // Repeated News cards and facility rows of the same type are filled in here
  const newsPhotos = [
    "Children and teacher walking past the entrance · Clear daytime · Landscape 7:5",
    "Notice image with a large logo · white background · landscape 7:5",
    "Front of a donated white van · overcast day · landscape 7:5",
    "Event notice poster on a wall · indoor light · landscape 7:5",
    "Notice image with a large logo · white background · landscape 7:5",
    "Toy on a classroom windowsill · indoor light · 7:5 landscape",
  ];
  function fill(el) {
    el.querySelectorAll(".tp-arrow:empty").forEach((i) => (i.outerHTML = arrow));
    el.querySelectorAll(".tp-news-list:empty").forEach((list) => {
      const n = +(list.dataset.count || 5);
      list.innerHTML = Array.from({ length: n }, (_, i) => `<article><a href="#">
          <figure><div class="tp-ph"><div class="wf-img" data-label="${newsPhotos[i % newsPhotos.length]}"></div></div></figure>
          <div class="tp-news-list__txt"><h3>${i % 3 === 2 ? "Your news title here, a bit long so it wraps to two lines" : "Your news title here " + String(i + 1).padStart(2, "0")}</h3>
          <time>2026.00.${String(30 - i * 3).padStart(2, "0")}</time><span class="tp-cat">#Let’s Go Here</span></div></a></article>`).join("");
    });
    el.querySelectorAll(".tp-tabs").forEach((t) =>
      t.querySelectorAll(".tp-tabs__pane ul:empty").forEach((ul, gi) => {
        const g = groups[gi] || groups[0];
        ul.innerHTML = Array.from({ length: g.rows }, (_, i) => `<li><h3><a href="#">Your facility name $ here{String(i + 1).padStart(2, "0")}</a></h3>
          <address>〒000-0000 Your facility address 00-0</address><div>tel. 0000-00-0000 / fax. 0000-00-0000${i % 3 === 0 ? '<i class="tp-sns" aria-label="SNS"></i>' : ""}</div></li>`).join("");
      })
    );
  }
  TP.fill = fill;

  function build(el) {
    fill(el);
    const ns = el.dataset.barbaNamespace;
    document.body.classList.toggle("is-interview", ns === "interview");
    head.classList.toggle("is-off", ns === "interview");
    foot.classList.toggle("is-off", ns === "interview");
    head.querySelectorAll(".tp-gnav > ul > li").forEach((li) => li.classList.remove("is-on"));
    const on = { news: "news", about: "about", recruit: "recruit", interview: "recruit" }[ns];
    if (on) head.querySelector(`.tp-gnav a[href="${on}.html"]`)?.parentNode.classList.add("is-on");
    tabs(el);
    anchors(el);
    run(el, "build");
  }

  // Original pageReady: if not the first page, loading fades off in .15s (delay .15), body · footer · header in .45s (delay .3) easeOutQuad
  function ready(el) {
    const ns = el.dataset.barbaNamespace;
    const self = TP.pages[ns] && TP.pages[ns].selfReveal;
    if (reduced) {
      gsap.set([el, foot, head], { opacity: 1 });
      gsap.set(loading, { display: "none" });
    } else {
      if (!self) {
        gsap.to(loading, { opacity: 0, duration: 0.15, delay: 0.15, ease: "none", onComplete: () => gsap.set(loading, { display: "none" }) });
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, delay: 0.3, ease: ease.outQuad });
        if (ns !== "interview") gsap.to(head, { opacity: 1, duration: 0.45, delay: 0.3, ease: ease.outQuad });
      }
      gsap.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.45, delay: 0.3, ease: ease.outQuad });
    }
    footReset();
    onScroll();
    cleanups = [fades(el), ...run(el, "ready")].filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  const unmount = () => cleanups.splice(0).forEach((f) => f());
  TP.head = head;
  TP.loading = loading;

  // Original before: after body and footer fade out in .2s, if scrolled down more than 400 (phone 200)px only the logo letters turn back on and it jumps straight to the top, otherwise it goes to the top in .6s.
  let backY = 0, forwardY = 0;
  function leave(nextNs, trigger) {
    const from = box();
    const y = scrollY;
    TP.closeMenus();
    if (burger.classList.contains("is-active")) closeSP();
    if (reduced) return;
    const turn = trigger === "back" || trigger === "forward";
    if (trigger === "back") forwardY = y;
    else if (!turn) backY = y;
    const far = isSP() ? y > 200 : y > 400;
    const type = head.querySelector(".tp-logo__type");
    if (!turn && far) gsap.set(type, { opacity: 0 });
    if (nextNs === "interview" && !isSP()) gsap.to(head, { opacity: 0, duration: 0.2, ease: ease.outQuad });
    if (isSP() && (nextNs === "home" || from.dataset.barbaNamespace === "home")) gsap.to(head, { opacity: 0, duration: 0.2, ease: ease.outQuad });
    gsap.to([from, foot], {
      opacity: 0, duration: 0.2, ease: ease.outQuad,
      onComplete: () => {
        if (turn) return;
        if (far) {
          gsap.delayedCall(0.05, () => scrollTo(0, 0));
          gsap.to(type, { opacity: 1, duration: 0.3, delay: 0.1, ease: ease.outQuad });
        } else scrollToY(0, 0.6, ease.inOutCubic);
      },
    });
    gsap.set(loading, { display: "block" });
    gsap.fromTo(loading, { opacity: 0 }, { opacity: 1, duration: 0.15, delay: 0.2, ease: "none" });
  }

  // Makes Barba fetch the next page’s page css — the original has a single css so this isn’t needed
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(
      want
        .filter((h) => !have.some((l) => l.href === h))
        .map((h) => new Promise((res) => {
          const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
          l.onload = l.onerror = res;
          document.head.append(l);
        }))
    );
  };
  const nsOf = (href) => {
    const f = (href.split("/").pop() || "index.html").split("#")[0];
    return { "index.html": "home", "news.html": "news", "about.html": "about", "recruit.html": "recruit", "detail.html": "interview" }[f] || "home";
  };
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");

  function start() {
    build(box());
    const first = () => ready(box());
    if (document.readyState === "complete") first();
    else addEventListener("load", first);
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        timeout: 10000,
        prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")),
        transitions: [
          {
            name: "default-transition",
            before: ({ trigger, next }) => leave(nsOf(next.url.href), trigger),
            afterLeave: () => new Promise((res) => setTimeout(res, reduced ? 0 : 600)),
            beforeEnter: async ({ current, next }) => {
              unmount();
              current.container.style.display = "none";
              await sheets(next.html);
              document.body.dataset.page = next.container.dataset.barbaNamespace;
              build(next.container);
            },
            enter() {},
            after: ({ trigger, next }) => {
              if (trigger === "back") scrollTo(0, backY);
              else if (trigger === "forward") scrollTo(0, forwardY);
              else scrollTo(0, 0);
              ready(next.container);
              if (location.hash) {
                const t = document.querySelector(location.hash);
                if (t) gsap.delayedCall(0.6, () => scrollToY(t.getBoundingClientRect().top + scrollY, 0.8, ease.inOutQuint));
              }
            },
          },
        ],
      });
      return;
    }
    // Under file:// barba cannot fetch the next page — cover with the same values, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href)) return;
      e.preventDefault();
      if (reduced) return void (location.href = href);
      leave(nsOf(href), "click");
      setTimeout(() => (location.href = href), 800);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
