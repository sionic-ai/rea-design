// Common to all pages: draws in the header bar, circular menu, footer and cookie window, and hooks up Lenis, loading curtain, page transition, FAQ, CTA strip and walking mascot.
// Original values: Lenis lerp .1 · menu circle .9s power3.inOut (close .75s) · on leave the circle .7s + scale 1.12, on arrival circle .9s + 0.92→1 ·
// Curtain number 0→84 (1.3s)→100 (.45s), clears the mascot at 1.2× screen over clamp(vw/430,2.6,4.2) seconds.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("sxo", "M0,0 C0.2,0.8 0.2,1 1,1");
  // The builder’s default ease curve (.25,.1,.25,1)
  CustomEase.create("sxease", "0.25,0.1,0.25,1");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SX = (window.SX = { reduced, lenis: null, page });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const store = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { return null; } };
  // Turns skin variables and color expressions into real sRGB 0~1 — custom variables are read as pre-computation text (oklch(from …)), so read a painted pixel
  const probeCv = document.createElement("canvas");
  probeCv.width = probeCv.height = 1;
  const probeCx = probeCv.getContext("2d", { willReadFrequently: true });
  SX.color = (css) => {
    const el = document.createElement("i");
    el.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probeCx.clearRect(0, 0, 1, 1);
    probeCx.fillStyle = c;
    probeCx.fillRect(0, 0, 1, 1);
    const d = probeCx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  const cur = (p) => (p === page ? " is-current" : "");
  const roll = (t) => `<span class="sx-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  const arrow = '<svg viewBox="0 0 26 20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M1 10h22M15 2l8 8-8 8"/></svg>';
  const icons = {
    a: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    b: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46V8.4A6.5 6.5 0 1 0 17 14.5V8.8a7 7 0 0 0 4 1.2V7a4 4 0 0 1-4-4z"/></svg>',
  };
  SX.icons = { arrow, roll };

  // ---------- Header bar ----------
  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.classList.add("sx-nav");
    nav.innerHTML = `
      <div class="sx-nav__row">
        <a class="sx-brand" href="index.html" aria-label="Home"><span class="sx-logo"><i>//</i>LOGO</span></a>
        <nav class="sx-nav__links" aria-label="Main menu">
          <a class="sx-nav__link${cur("studio")}" href="studio.html"><i class="sx-nav__dot"></i>${roll("Menu 1")}</a>
          <a class="sx-nav__link" href="index.html#work"><i class="sx-nav__dot"></i>${roll("Menu 2")}</a>
          <a class="sx-nav__link${cur("about")}" href="about.html"><i class="sx-nav__dot"></i>${roll("Menu 3")}</a>
          <a class="sx-nav__link" href="#contact"><i class="sx-nav__dot"></i>${roll("Menu 5")}</a>
        </nav>
        <button class="sx-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span class="sx-burger__in"><i></i><i></i><i></i></span></button>
      </div>`;
    const sub = (n) => Array.from({ length: n }, (_, i) => `<a class="sxm__sub" href="about.html">Sub Menu ${i + 1}</a>`).join("");
    nav.insertAdjacentHTML(
      "afterend",
      `<div class="sx-menu sx-green" data-slot="menu-circle" aria-hidden="true" data-lenis-prevent>
        <div class="sxm">
          <nav class="sxm__main" aria-label="Full menu" data-label="Your English menu names · one word each here">
            <div class="sxm__item"><a class="sxm__link${cur("home")}" href="index.html"><span class="sxm__idx">01</span><span class="sxm__label">Home</span></a></div>
            <div class="sxm__item"><a class="sxm__link${cur("studio")}" href="studio.html"><span class="sxm__idx">02</span><span class="sxm__label">Menu 1</span></a></div>
            <div class="sxm__item"><a class="sxm__link" href="index.html#work"><span class="sxm__idx">03</span><span class="sxm__label">Menu 2</span></a></div>
            <div class="sxm__item"><a class="sxm__link${cur("about")}" href="about.html"><span class="sxm__idx">04</span><span class="sxm__label">Menu 3</span></a>
              <button class="sxm__toggle" type="button" aria-expanded="false" aria-label="Expand submenu"><span class="sxm__chev"></span></button></div>
            <div class="sxm__item is-after"><a class="sxm__link${cur("news")}" href="news.html"><span class="sxm__idx">05</span><span class="sxm__label">Menu 4</span></a></div>
            <div class="sxm__item is-after"><a class="sxm__link" href="#contact"><span class="sxm__idx">06</span><span class="sxm__label">Menu 5</span></a></div>
          </nav>
          <div class="sxm__aside">
            <p class="sxm__intro">Your two-line intro here, including the region name.</p>
            <div class="sxm__panel">
              <p class="sxm__head">Submenu group</p>
              <div class="sxm__groups">
                <div class="sxm__group"><p class="sxm__glabel">Bundle 1</p>${sub(6)}</div>
                <div class="sxm__group"><p class="sxm__glabel is-web">Bundle 2</p>${sub(7)}</div>
                <div class="sxm__group"><p class="sxm__glabel is-film">Bundle 3</p>${sub(4)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="sxm__bottom">
          <a class="sx-link" href="#">hello@example.com</a>
          <div class="sx-social"><span>Follow</span><i class="sx-social__line"></i><span class="sx-social__icons"><a href="#" aria-label="SNS 1">${icons.b}</a><a href="#" aria-label="SNS 2">${icons.a}</a></span></div>
          <a class="sx-link" href="#">+00 000 0000 0000</a>
        </div>
        <button class="sx-menu__close" type="button" aria-label="Close Menu"><i></i><i></i></button>
      </div>`
    );
  }

  // ---------- Footer ----------
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sx-foot", "sx-green");
    foot.id = "contact";
    const fl = (t, href = "#") => `<a href="${href}">${roll(t)}</a>`;
    const grp = (label, open, more) => `
      <div class="sx-foot__links" data-fg>
        <div class="sx-foot__ghead"><p class="sx-foot__glabel">${label}</p><button class="sx-foot__toggle" type="button" aria-expanded="false" aria-label="${label} Unfold"><span class="sx-foot__chev"></span></button></div>
        ${open.map((t) => fl(t, "about.html")).join("")}
        <div class="sx-foot__more">${more.map((t) => fl(t, "about.html")).join("")}</div>
      </div>`;
    foot.innerHTML = `
      <div class="sx-wrap"><div class="sx-container">
        <div class="sx-foot__top">
          <div class="sx-foot__cols">
            <div><p class="sx-foot__head">Contact info</p><p class="sx-foot__addr">Street address 00 · 00000 City</p>
              <div class="sx-foot__contact"><a class="sx-link" href="#">hello@example.com</a><a class="sx-link" href="#">+00 000 0000 0000</a></div></div>
            <div><p class="sx-foot__head">Page</p><div class="sx-foot__links">${fl("Home", "index.html")}${fl("Menu 1", "studio.html")}${fl("Menu 3", "about.html")}${fl("Menu 5")}</div></div>
            <div><p class="sx-foot__head">Work</p><div class="sx-foot__links">${fl("Menu 2", "index.html#work")}${fl("Menu 4", "news.html")}</div></div>
            <div><p class="sx-foot__head">Legal notice</p><div class="sx-foot__links">${fl("Notice 1")}${fl("Notice 2")}</div></div>
          </div>
          <div class="sx-foot__services">
            <p class="sx-foot__head">Service</p>
            <div class="sx-foot__sgrid">
              ${grp("Bundle 1", ["Sub Menu 1", "Sub Menu 2"], ["Sub Menu 3", "Sub Menu 4", "Sub Menu 5", "Sub Menu 6"])}
              ${grp("Bundle 2", ["Sub Menu 1", "Sub Menu 2"], ["Sub Menu 3", "Sub Menu 4", "Sub Menu 5", "Sub Menu 6", "Sub Menu 7"])}
              ${grp("Bundle 3", ["Sub Menu 1"], ["Sub Menu 2", "Sub Menu 3", "Sub Menu 4"])}
            </div>
          </div>
        </div>
        <div class="sx-foot__bottom">
          <p class="sx-foot__mark" data-slot="footer-wordmark" data-label="Your studio English wordmark · around five letters"><i>//</i>LOGO</p>
          <div class="sx-foot__legal"><p>© 0000 LOGO. Your copyright line here</p><p>Design · Development <a class="sx-link" href="index.html">LOGO</a></p></div>
        </div>
      </div></div>`;
    foot.querySelectorAll("[data-fg]").forEach((g) => {
      const btn = g.querySelector(".sx-foot__toggle"), more = g.querySelector(".sx-foot__more");
      g.querySelector(".sx-foot__ghead").addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        gsap.killTweensOf(more);
        if (reduced) { more.style.display = open ? "flex" : ""; return; }
        if (open) {
          more.style.display = "flex";
          gsap.fromTo(more, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.5, ease: "power3.out", clearProps: "height" });
          gsap.fromTo(more.children, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: "power2.out", delay: 0.08 });
        } else {
          gsap.to(more, { height: 0, autoAlpha: 0, duration: 0.4, ease: "power3.inOut", onComplete: () => gsap.set(more, { clearProps: "all" }) });
        }
        ScrollTrigger.refresh();
      });
    });
  }

  // ---------- Four review cards (shared by the home page and About page) ----------
  const star = '<svg viewBox="0 0 30 30" fill="currentColor"><path d="M15 3l3.6 7.6 8.4 1-6.2 5.8 1.6 8.3L15 21.6l-7.4 4.1 1.6-8.3L3 11.6l8.4-1z"/></svg>';
  const quotes = [
    ["Five lines of testimonial go here, in the client’s voice: how the process of working together went, whether communication was fast, and whether the result beat expectations. One more line.", "Customer face · Man with glasses · Front-facing smile"],
    ["Your review goes here, about six lines. A long space to write how carefully the idea was brought to life and what you were thankful for throughout. One last line.", "Customer face · male · bright background"],
    ["About five lines of review go here. Describe the reaction after entrusting a group or club website. One line on what members liked.", "Client face · curly-haired man · outdoors"],
    ["Your three-line short review here. A strong one-liner, like recommending it before it was even finished.", "Customer face · male · indoor lighting"],
  ];
  document.querySelectorAll("[data-tst]").forEach((box) => {
    box.innerHTML = quotes.map(([q, face], i) => `
      <article class="sx-card">
        <div class="sx-card__stars">${star.repeat(5)}</div>
        <div><p class="sx-card__text">${q}</p>
          <div class="sx-card__author"><div class="wf-img sx-card__face" data-label="${face}"></div><div class="sx-card__who"><b data-label="Your client English name here">Client Name 0${i + 1}</b><span>Title, company name</span></div></div></div>
      </article>`).join("");
  });
  document.querySelectorAll(".sx-cta__arrow").forEach((a) => (a.innerHTML = `<span>${arrow}</span>`));

  // ---------- Cookie window: notice window · settings window (toggle each type) · reopen button at the bottom left after consent ----------
  let seenCookie = null;
  try { seenCookie = localStorage.getItem("sx-cc"); } catch (e) {}
  const kinds = [["Required", "Your one-line description of the essential save goes here.", null], ["Advertisement", "Your one-line description of ad storage goes here.", "marketing"], ["Custom", "Your one-line note here about saving the settings you chose.", "personalization"], ["Analysis", "Your one-line description here of storage that measures usage.", "analytics"]];
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="sx-cookie" role="dialog" aria-label="Cookie Notice" data-slot="cookie"${seenCookie ? " hidden" : ""}>
      <span class="sx-cookie__tag">Your short pun line here</span>
      <p>Your two-line cookie notice goes here. One line saying you can choose what gets stored.</p>
      <div class="sx-cookie__btns"><button type="button" data-cc="allow">Allow all</button><button class="is-deny" type="button" data-cc="deny">Refusal</button><button class="is-set" type="button" data-cc="open">Settings</button></div>
    </div>
    <div class="sx-ccp" role="dialog" aria-modal="true" aria-label="Cookie Settings" data-slot="cookie-preferences" hidden>
      <div class="sx-ccp__box">
        <p class="sx-ccp__title">Settings</p>
        <p class="sx-ccp__p">Here, about three lines saying storage can be chosen. Everything except what is essential can be turned off, plus a line noting that turning it off may change how things work. <a href="#">See more</a></p>
        <button class="sx-ccp__btn" type="button" data-cc="allow">Accept all cookies</button>
        <button class="sx-ccp__x" type="button" data-cc="close" aria-label="Close"><i></i><i></i></button>
        ${kinds.map(([n, d, k]) => `<div class="sx-ccp__row"><div><span class="sx-cookie__tag">${n}</span><p class="sx-ccp__p">${d}</p></div>${k ? `<label class="sx-ccp__sw"><input type="checkbox" data-kind="${k}"><i></i></label>` : '<p class="sx-ccp__p is-on">Always on</p>'}</div>`).join("")}
        <button class="sx-ccp__btn is-deny" type="button" data-cc="deny">Decline all</button>
        <button class="sx-ccp__btn is-save" type="button" data-cc="save">Save</button>
      </div>
    </div>
    <button class="sx-ccm" type="button" aria-label="Open cookie settings" data-cc="open"${seenCookie ? "" : " hidden"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3z"/><circle cx="8.5" cy="11" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="15.5" cy="12.5" r="1"/></svg></button>`
  );
  const ck = document.querySelector(".sx-cookie"), ccp = document.querySelector(".sx-ccp"), ccm = document.querySelector(".sx-ccm");
  const decide = () => { ck.hidden = true; ccm.hidden = false; try { localStorage.setItem("sx-cc", "1"); } catch (e) {} };
  // The settings window fades in and out over .3s
  const showCcp = (on) => {
    if (on) { ccp.hidden = false; gsap.fromTo(ccp, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0 : 0.3 }); }
    else gsap.to(ccp, { autoAlpha: 0, duration: reduced ? 0 : 0.3, onComplete: () => (ccp.hidden = true) });
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cc]");
    if (!b) return;
    const k = b.dataset.cc, boxes = ccp.querySelectorAll("input[data-kind]");
    if (k === "open") return showCcp(true);
    if (k === "close") return showCcp(false);
    if (k === "allow") boxes.forEach((x) => (x.checked = true));
    if (k === "deny") boxes.forEach((x) => (x.checked = false));
    decide();
    if (!ccp.hidden) showCcp(false);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && !ccp.hidden && showCcp(false));

  // ---------- Smooth scroll ----------
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, anchors: true });
    SX.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- Circular menu: from the hamburger’s center a circle grows to the screen edge ----------
  const menu = document.querySelector(".sx-menu");
  const burger = document.querySelector(".sx-burger");
  if (menu && burger) {
    const labels = menu.querySelectorAll(".sxm__label"), idx = menu.querySelectorAll(".sxm__idx");
    const toggle = menu.querySelector(".sxm__toggle"), panel = menu.querySelector(".sxm__panel");
    const intro = menu.querySelector(".sxm__intro"), bottom = menu.querySelector(".sxm__bottom");
    const mob = matchMedia("(max-width: 991px)");
    const origin = () => { const r = burger.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const circ = (c, r) => `circle(${r}px at ${c[0]}px ${c[1]}px)`;
    let open = false, tl;
    const show = () => {
      open = true;
      burger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      menu.classList.add("is-open");
      SX.lenis && SX.lenis.stop();
      const c = origin(), R = Math.hypot(Math.max(c[0], innerWidth - c[0]), Math.max(c[1], innerHeight - c[1]));
      tl && tl.kill();
      if (reduced) { gsap.set(menu, { clipPath: "none" }); return; }
      tl = gsap.timeline()
        .fromTo(menu, { clipPath: circ(c, 0) }, { clipPath: circ(c, R), duration: 0.9, ease: "power3.inOut" })
        .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 0.85, stagger: 0.06, ease: "power4.out" }, 0.38)
        .fromTo(idx, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, 0.5)
        .fromTo(toggle, { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(2)" }, 0.75)
        .fromTo([intro, bottom], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.7);
    };
    const hide = () => {
      open = false;
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      SX.lenis && SX.lenis.start();
      const done = () => menu.classList.remove("is-open");
      tl && tl.kill();
      if (reduced) return done();
      const c = origin(), R = Math.hypot(Math.max(c[0], innerWidth - c[0]), Math.max(c[1], innerHeight - c[1]));
      tl = gsap.timeline({ onComplete: done })
        .to(labels, { yPercent: -110, duration: 0.45, stagger: 0.03, ease: "power3.in" }, 0)
        .to([idx, toggle, intro, bottom], { autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo(menu, { clipPath: circ(c, R) }, { clipPath: circ(c, 0), duration: 0.75, ease: "power3.inOut" }, 0.25);
      if (toggle.getAttribute("aria-expanded") === "true") sub(false, 0);
    };
    // Submenu: on wide screens a group floats up in the about text spot, on narrow screens it unfolds downward
    const sub = (on, d = 0.6) => {
      toggle.setAttribute("aria-expanded", String(on));
      const kids = panel.querySelectorAll(".sxm__glabel, .sxm__sub");
      if (on) {
        if (mob.matches) gsap.to(panel, { height: "auto", duration: reduced ? 0 : 0.6, ease: "power3.inOut" });
        else { gsap.to(intro, { autoAlpha: 0, x: -24, duration: 0.3, ease: "power2.in" }); gsap.to(panel, { autoAlpha: 1, duration: 0.2 }); }
        if (!reduced) gsap.fromTo(kids, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.018, ease: "power3.out", delay: mob.matches ? 0.12 : 0.1 });
      } else {
        if (mob.matches) gsap.to(panel, { height: 0, duration: d, ease: "power3.inOut" });
        else { gsap.to(panel, { autoAlpha: 0, duration: d * 0.6 }); gsap.to(intro, { autoAlpha: 1, x: 0, duration: d, ease: "power2.out", delay: d * 0.4 }); }
      }
    };
    burger.addEventListener("click", () => (open ? hide() : show()));
    menu.querySelector(".sx-menu__close").addEventListener("click", hide);
    toggle.addEventListener("click", () => sub(toggle.getAttribute("aria-expanded") !== "true"));
    addEventListener("keydown", (e) => e.key === "Escape" && open && hide());
    menu.querySelectorAll("a[href^='#']").forEach((a) => a.addEventListener("click", hide));
  }

  // ---------- Page turn ----------
  const KEY = "sx-pt";
  const wrap = () => document.querySelector(".sx-page") || document.body;
  const radius = () => Math.hypot(innerWidth, innerHeight) / 2 + 24;
  const origin = (w) => (w.style.transformOrigin = `50% ${Math.round(scrollY + innerHeight / 2)}px`);
  const layer = () => { const o = document.createElement("div"); o.className = "sx-pt"; document.body.append(o); return o; };
  const came = store(KEY) === "1";
  if (came) {
    store(KEY, "0");
    const o = layer(), w = wrap();
    document.documentElement.classList.remove("sx-pt-in");
    if (reduced) gsap.to(o, { opacity: 0, duration: 0.3, onComplete: () => o.remove() });
    else {
      origin(w);
      const R = radius(), p = { v: 0 };
      gsap.to(p, {
        v: 1, duration: 0.9, ease: "power2.inOut",
        onUpdate() {
          const r = p.v * R, m = /* Not skin: the masking mask reads only alpha */ `radial-gradient(circle at 50% 50%, transparent ${r.toFixed(1)}px, #000 ${(r + 1).toFixed(1)}px)`;
          o.style.webkitMaskImage = m; o.style.maskImage = m;
          w.style.transform = `scale(${(0.92 + 0.08 * p.v).toFixed(4)})`;
        },
        onComplete() { o.remove(); w.style.transform = ""; w.style.transformOrigin = ""; },
      });
    }
  }
  let leaving = false;
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    let u; try { u = new URL(a.getAttribute("href"), location.href); } catch (x) { return; }
    if (!/^(https?|file):$/.test(u.protocol) || u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    store(KEY, "1");
    SX.lenis && SX.lenis.stop();
    const o = layer(), w = wrap();
    if (reduced) { gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: 0.25, onComplete: () => (location.href = u.href) }); return; }
    origin(w);
    const R = radius(), p = { v: 0 };
    o.style.clipPath = "circle(0px at 50% 50%)";
    gsap.to(p, {
      v: 1, duration: 0.7, ease: "power2.inOut",
      onUpdate() { o.style.clipPath = `circle(${(p.v * R).toFixed(1)}px at 50% 50%)`; w.style.transform = `scale(${(1 + 0.12 * p.v).toFixed(4)})`; },
      onComplete: () => (location.href = u.href),
    });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.querySelectorAll(".sx-pt").forEach((x) => x.remove());
    const w = wrap(); w.style.transform = ""; w.style.transformOrigin = "";
    SX.lenis && SX.lenis.start();
  });

  // ---------- FAQ: the green pill expands to height auto (.5s cubic-bezier(.2,.8,.2,1)) ----------
  document.querySelectorAll(".sx-faq__item").forEach((it) => {
    const q = it.querySelector(".sx-faq__q"), a = it.querySelector(".sx-faq__a");
    q.addEventListener("click", () => {
      const on = !it.classList.contains("is-open");
      it.classList.toggle("is-open", on);
      q.setAttribute("aria-expanded", String(on));
      gsap.to(a, { height: on ? "auto" : 0, duration: reduced ? 0 : 0.5, ease: "sxo", onComplete: () => ScrollTrigger.refresh() });
    });
  });

  // ---------- Walking mascot: the original is a GLB character with a procedural pose. Here we apply the same pose formula to our character built from basic three shapes (white tee · jeans · sunglasses) ----------
  // Original values: stage height min(vh*.62, vw*1.05) · width .75x · field of view 24° · eye at .98 looks at .9 · distance max(1.05/tan12°, that×.62/aspect ratio) · height 1.8 ·
  // Hemisphere light 2.1 · key light 2.0 (-2.5,4,3.5) · golden back light 1.2 (3,2,-3) · exposure 1.05 ACES · paper grain with one color per face
  const D = Math.PI / 180;
  const sstep = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const salvo = (() => {
    const el = document.createElement("div");
    el.className = "sx-salvo";
    el.setAttribute("aria-hidden", "true");
    el.dataset.slot = "mascot";
    document.body.append(el);
    const S = { t: 0, phase: 0, walk: 0, run: 0, yaw: 0, spin: 0, relax: 0, glance: 0, hy: 0, hp: 0, reach: 0, reachA: 55, lean: 0, sit: 0, crouch: 0, fall: 0, air: 0, thumb: 0, squash: 0, jump: 0 };
    const E = { S, el, ready: false, ax: 0, ay: 0, pxm: 1, render() {}, size() {}, bonePx: () => null };
    if (!window.THREE || reduced) return E;
    const T = THREE;
    const R = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    R.toneMapping = T.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.05;
    R.outputColorSpace = T.SRGBColorSpace;
    el.append(R.domElement);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(24, 0.75, 0.1, 50);
    const col = (css) => new T.Color().setRGB(...SX.color(css), T.SRGBColorSpace);
    const sky = col("color-mix(in oklab, var(--kf-surface) 80%, var(--kf-bg))");
    scene.add(new T.HemisphereLight(sky, col("color-mix(in oklab, var(--kf-accent-soft) 65%, var(--kf-ink))"), 2.1));
    const key = new T.DirectionalLight(sky, 2.0);
    key.position.set(-2.5, 4, 3.5);
    scene.add(key);
    const rim = new T.DirectionalLight(col("var(--site-gold)"), 1.2);
    rim.position.set(3, 2, -3);
    scene.add(rim);
    // Shadow underfoot: circle fading from .34 at the center to 0 at the edge
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const scx = sc.getContext("2d"), ink = SX.color("var(--kf-ink)").map((v) => Math.round(v * 255)).join(",");
    const gr = scx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, `rgba(${ink}, 0.34)`);
    gr.addColorStop(1, `rgba(${ink}, 0)`);
    scx.fillStyle = gr;
    scx.fillRect(0, 0, 128, 128);
    const shMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false });
    const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), shMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    scene.add(shadow);

    const paper = (c) => new T.MeshStandardMaterial({ color: c, roughness: 0.86, metalness: 0, flatShading: true });
    const M = {
      skin: paper(new T.Color("#d8a47e")), /* Not skin: a person’s skin color is their appearance */
      hair: paper(new T.Color("#2a2320")), /* Not skin: a person’s hair color is their appearance */
      tee: paper(col("color-mix(in oklab, var(--kf-bg) 60%, var(--kf-surface))")),
      jeans: paper(col("var(--site-denim)")),
      shoe: paper(col("var(--kf-surface)")),
      glass: paper(col("var(--kf-ink)")),
    };
    const root = new T.Group();
    scene.add(root);
    const B = {}, BASE = {};
    const bone = (name, parent, x, y, z) => { const g = new T.Group(); g.name = name; g.position.set(x, y, z); (parent ? B[parent] : root).add(g); B[name] = g; return g; };
    // Angular cylinder: 7 faces make it look like folded paper
    const part = (name, geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); B[name].add(m); return m; };
    const cyl = (rt, rb, h) => new T.CylinderGeometry(rt, rb, h, 7, 1);
    bone("Hips", null, 0, 0.98, 0);
    bone("Spine", "Hips", 0, 0.09, 0);
    bone("Spine01", "Spine", 0, 0.12, 0);
    bone("Spine02", "Spine01", 0, 0.12, 0);
    bone("neck", "Spine02", 0, 0.17, 0);
    bone("Head", "neck", 0, 0.09, 0);
    part("Hips", cyl(0.15, 0.145, 0.17), M.jeans, 0, -0.02, 0, 1, 1, 0.7);
    part("Spine", cyl(0.152, 0.15, 0.13), M.tee, 0, 0.06, 0, 1, 1, 0.66);
    part("Spine01", cyl(0.165, 0.152, 0.13), M.tee, 0, 0.065, 0, 1, 1, 0.66);
    part("Spine02", cyl(0.175, 0.165, 0.19), M.tee, 0, 0.085, 0, 1, 1, 0.68);
    part("neck", cyl(0.045, 0.05, 0.11), M.skin, 0, 0.04, 0);
    part("Head", new T.IcosahedronGeometry(0.112, 1), M.skin, 0, 0.1, 0.005, 0.92, 1.08, 1);
    part("Head", new T.SphereGeometry(0.119, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), M.hair, 0, 0.125, -0.012, 0.95, 0.85, 1.02);
    part("Head", new T.BoxGeometry(0.2, 0.036, 0.02), M.glass, 0, 0.105, 0.105);
    [1, -1].forEach((sd) => part("Head", new T.BoxGeometry(0.008, 0.016, 0.11), M.glass, 0.1 * sd, 0.112, 0.05));
    let fist = null;
    [["Left", 1], ["Right", -1]].forEach(([sd, s]) => {
      bone(sd + "Shoulder", "Spine02", 0.06 * s, 0.13, 0);
      bone(sd + "Arm", sd + "Shoulder", 0.13 * s, -0.01, 0);
      bone(sd + "ForeArm", sd + "Arm", 0, -0.28, 0);
      bone(sd + "Hand", sd + "ForeArm", 0, -0.25, 0);
      part(sd + "Arm", cyl(0.066, 0.058, 0.13), M.tee, 0, -0.055, 0);
      part(sd + "Arm", cyl(0.042, 0.037, 0.28), M.skin, 0, -0.14, 0);
      part(sd + "ForeArm", cyl(0.037, 0.03, 0.25), M.skin, 0, -0.125, 0);
      part(sd + "Hand", new T.BoxGeometry(0.05, 0.09, 0.035), M.skin, 0, -0.045, 0);
      bone(sd + "UpLeg", "Hips", 0.095 * s, -0.06, 0);
      bone(sd + "Leg", sd + "UpLeg", 0, -0.43, 0);
      bone(sd + "Foot", sd + "Leg", 0, -0.42, 0);
      part(sd + "UpLeg", cyl(0.076, 0.06, 0.43), M.jeans, 0, -0.215, 0);
      part(sd + "Leg", cyl(0.058, 0.047, 0.42), M.jeans, 0, -0.21, 0);
      part(sd + "Foot", new T.BoxGeometry(0.095, 0.075, 0.25), M.shoe, 0, -0.035, 0.06);
      // Default pose: arms hang down, spread 8° from the body
      B[sd + "Arm"].rotation.z = 8 * D * s;
    });
    fist = part("RightHand", new T.BoxGeometry(0.024, 0.06, 0.024), M.skin, 0, 0.0, 0.03);
    Object.keys(B).forEach((k) => (BASE[k] = B[k].quaternion.clone()));

    const _p = new T.Quaternion(), _i = new T.Quaternion(), _q = new T.Quaternion(), _a = new T.Vector3(), _v = new T.Vector3();
    // Rotate on the world axis — however the parent rotated, ”forward 22°” is forward relative to the body
    const rotW = (n, x, y, z, deg) => {
      if (!deg) return;
      const b = B[n];
      b.parent.getWorldQuaternion(_p);
      _i.copy(_p).invert();
      _q.setFromAxisAngle(_a.set(x, y, z), deg * D);
      b.quaternion.premultiply(_p).premultiply(_q).premultiply(_i);
      b.updateMatrixWorld(true);
    };
    const L = lerp;
    const pose = () => {
      Object.keys(BASE).forEach((k) => B[k].quaternion.copy(BASE[k]));
      root.rotation.set(0, 0, 0); root.position.set(0, 0, 0); root.scale.set(1, 1, 1);
      root.updateMatrixWorld(true);
      const t = S.t, br = Math.sin(t * 1.25), sw = Math.sin(t * 0.42), sw2 = Math.sin(t * 0.27 + 1.3);
      const w = S.walk, r = S.run, iw = 1 - w, p = S.phase, sp = Math.sin(p), rx = S.relax;
      const hip = (3 + sw * 0.8) * iw;
      rotW("Hips", 0, 0, 1, hip + (2.5 + rx * 3) * Math.cos(p) * w * (1 - r * 0.5));
      rotW("Head", 0, 0, 1, rx * 3 * Math.cos(p) * w);
      rotW("Hips", 0, 1, 0, sw2 * 2 * iw + 6 * sp * w * (1 - r * 0.3));
      rotW("Spine02", 0, 0, 1, -hip * 0.55); rotW("Spine", 0, 0, 1, -hip * 0.45); rotW("Spine01", 1, 0, 0, -br * 0.6); rotW("Spine", 1, 0, 0, br * 0.5);
      const lean = L(3, 14, r) * w;
      rotW("Spine02", 1, 0, 0, lean * 0.55); rotW("Spine", 1, 0, 0, lean * 0.45); rotW("Spine01", 0, 1, 0, -3 * sp * w); rotW("Spine", 0, 1, 0, -2 * sp * w);
      // Legs: thigh 24°, knee 5+46°, driven by the gait phase
      const thA = L(24, 44, r), kA = L(46, 105, r), kB = L(5, 16, r), thO = L(-2, -12, r);
      const leg = (sd, ph) => {
        const s = Math.sin(ph), c = Math.cos(ph), th = -thA * s + thO, swing = Math.pow(Math.max(0, c + 0.25) / 1.25, 1.6), kn = kB + kA * swing;
        rotW(sd + "UpLeg", 1, 0, 0, th * w); rotW(sd + "Leg", 1, 0, 0, kn * w);
        rotW(sd + "Foot", 1, 0, 0, (-kn * 0.45 + Math.max(0, -th) * 0.25 + Math.max(0, th) * 0.35 * (1 - swing)) * w);
      };
      leg("Left", p); leg("Right", p + Math.PI);
      const k = (8 + sw * 1.5) * iw;
      rotW("RightUpLeg", 1, 0, 0, -k * 0.6); rotW("RightLeg", 1, 0, 0, k * 1.4); rotW("RightFoot", 1, 0, 0, -k * 0.6); rotW("RightUpLeg", 0, 0, 1, -3 * iw); rotW("LeftUpLeg", 0, 0, 1, -1.5 * iw);
      // Arms: hang down and swing out of step with the legs
      const aA = L(9, 30, r) * w * (1 - rx * 0.3), fa = L(-14, -72, r) * w, fs = L(10, 0, r) * w;
      rotW("LeftArm", 0, 0, 1, -br * 0.6 * iw); rotW("RightArm", 0, 0, 1, br * 0.6 * iw);
      rotW("LeftArm", 1, 0, 0, (-4 + sw * 1.2) * iw + aA * sp); rotW("RightArm", 1, 0, 0, (-4 - sw * 1.2) * iw - aA * sp);
      rotW("LeftForeArm", 1, 0, 0, -14 * iw + fa - fs * Math.max(0, -sp)); rotW("RightForeArm", 1, 0, 0, -10 * iw + fa - fs * Math.max(0, sp));
      // Leaning: right elbow rests on the button, legs crossed
      const ln = S.lean;
      if (ln > 0.001) {
        rotW("Spine", 0, 0, 1, -4 * ln); rotW("RightShoulder", 0, 0, 1, -4 * ln);
        rotW("RightArm", 0, 0, 1, 4 * ln); rotW("RightArm", 1, 0, 0, -6 * ln);
        rotW("RightForeArm", 1, 0, 0, -85 * ln); rotW("RightForeArm", 0, 0, 1, 6 * ln); rotW("RightHand", 1, 0, 0, 25 * ln);
        rotW("LeftUpLeg", 0, 0, 1, -24 * ln); rotW("LeftUpLeg", 1, 0, 0, -6 * ln); rotW("LeftLeg", 1, 0, 0, 18 * ln); rotW("LeftFoot", 1, 0, 0, -16 * ln); rotW("LeftFoot", 0, 0, 1, 8 * ln);
        rotW("RightUpLeg", 0, 0, 1, -3 * ln); rotW("Head", 0, 0, 1, -6 * ln);
        rotW("LeftArm", 0, 0, 1, 6 * ln); rotW("LeftForeArm", 1, 0, 0, -12 * ln);
      }
      // Sitting on the button (phone): thighs forward, shins dangle and swing alternately, hands brace at the sides
      const st = S.sit;
      if (st > 0.001) {
        const s1 = Math.sin(t * 1.5), s2 = Math.sin(t * 1.5 + 2.2);
        rotW("RightUpLeg", 1, 0, 0, -80 * st); rotW("LeftUpLeg", 1, 0, 0, -92 * st); rotW("LeftUpLeg", 0, 0, 1, 7 * st); rotW("RightUpLeg", 0, 0, 1, -4.2 * st);
        rotW("RightLeg", 1, 0, 0, (84 + 8 * s1) * st); rotW("LeftLeg", 1, 0, 0, (62 + 5.6 * s2) * st); rotW("LeftFoot", 1, 0, 0, -12 * st); rotW("RightFoot", 1, 0, 0, -4 * st);
        rotW("Spine02", 1, 0, 0, 16 * st); rotW("Spine", 0, 0, 1, -10 * st);
        rotW("RightArm", 1, 0, 0, 10 * st); rotW("RightArm", 0, 0, 1, 4 * st); rotW("RightHand", 1, 0, 0, -40 * st);
        rotW("LeftArm", 1, 0, 0, -28 * st); rotW("LeftForeArm", 1, 0, 0, -40 * st); rotW("LeftForeArm", 0, 1, 0, -6 * st); rotW("LeftHand", 1, 0, 0, 40 * st);
        rotW("Head", 0, 0, 1, 7 * st);
      }
      // Button press: the front arm (left arm when facing left) reaches toward the button
      const rc = S.reach;
      if (rc > 0.001) { rotW("LeftArm", 0, 0, 1, 12 * rc); rotW("LeftArm", 1, 0, 0, -S.reachA * rc); rotW("LeftForeArm", 1, 0, 0, 12 * rc); rotW("LeftHand", 1, 0, 0, -18 * rc); rotW("Spine", 0, 1, 0, 8 * rc); rotW("Spine02", 1, 0, 0, 4 * rc); }
      // When falling: arms up, legs loosely bent
      const fl = S.fall;
      if (fl > 0.001) {
        const fw = Math.sin(t * 7) * fl;
        rotW("LeftArm", 0, 0, 1, (118 + 8 * fw) * fl); rotW("RightArm", 0, 0, 1, (-118 + 8 * fw) * fl); rotW("LeftForeArm", 0, 0, 1, 25 * fl); rotW("RightForeArm", 0, 0, 1, -25 * fl);
        rotW("LeftUpLeg", 1, 0, 0, -28 * fl); rotW("LeftLeg", 1, 0, 0, 48 * fl); rotW("RightUpLeg", 1, 0, 0, -8 * fl); rotW("RightLeg", 1, 0, 0, 22 * fl); rotW("Spine", 1, 0, 0, -6 * fl); rotW("Head", 1, 0, 0, -10 * fl);
      }
      // Landing: crouches down as the hands move toward the knees
      const cr = S.crouch;
      if (cr > 0.001) {
        rotW("LeftUpLeg", 1, 0, 0, -62 * cr); rotW("RightUpLeg", 1, 0, 0, -56 * cr); rotW("LeftLeg", 1, 0, 0, 104 * cr); rotW("RightLeg", 1, 0, 0, 96 * cr); rotW("LeftFoot", 1, 0, 0, -40 * cr); rotW("RightFoot", 1, 0, 0, -38 * cr);
        rotW("LeftUpLeg", 0, 0, 1, 6 * cr); rotW("RightUpLeg", 0, 0, 1, -6 * cr); rotW("Spine02", 1, 0, 0, 22 * cr); rotW("Spine", 1, 0, 0, 10 * cr); rotW("Head", 1, 0, 0, -22 * cr);
        rotW("LeftArm", 1, 0, 0, -38 * cr); rotW("RightArm", 1, 0, 0, -38 * cr); rotW("LeftForeArm", 1, 0, 0, -30 * cr); rotW("RightForeArm", 1, 0, 0, -30 * cr);
      }
      // Thumbs up: upper arm forward, forearm bent, fist raised
      const tu = S.thumb;
      if (tu > 0.001) {
        rotW("RightArm", 0, 0, 1, -6 * tu); rotW("RightArm", 1, 0, 0, -22 * tu); rotW("RightForeArm", 1, 0, 0, -72 * tu); rotW("RightForeArm", 0, 0, 1, -10 * tu); rotW("RightForeArm", 0, 1, 0, 50 * tu);
        rotW("Spine", 0, 0, 1, 2 * tu); rotW("Head", 0, 0, 1, 4 * tu);
      }
      fist.visible = tu > 0.38;
      // Head: gaze · breath · tilt
      rotW("Head", 1, 0, 0, -lean * 0.7 + S.hp + br * 0.4 * iw);
      rotW("neck", 0, 1, 0, S.hy * 0.4); rotW("Head", 0, 1, 0, S.hy * 0.6); rotW("Head", 0, 0, 1, (4 + sw2 * 1.2) * iw);
      const bob = L(0.016 * (Math.abs(Math.cos(p)) - 0.55), 0.05 * (Math.abs(Math.sin(p)) - 0.35), r) * w;
      root.position.y = bob + S.jump - S.crouch * 0.3;
      root.rotation.y = S.yaw + S.spin;
      root.rotation.z = S.lean * 9 * D;
      root.scale.set(1 + S.squash * 0.06, 1 - S.squash * 0.08, 1 + S.squash * 0.06);
      root.position.x = -Math.sin(hip * D) * 0.06 * Math.cos(S.yaw);
      root.updateMatrixWorld(true);
      shadow.scale.set(1.15 - S.jump * 0.8, 1, 0.55 - S.jump * 0.3);
      shMat.opacity = Math.max(0, 1 - S.jump * 2.2) * (1 - S.air) * (1 - S.sit);
    };
    E.size = (w, h) => {
      R.setSize(w, h, false);
      cam.aspect = w / h;
      const fit = 1.05 / Math.tan((cam.fov * D) / 2), dist = Math.max(fit, (fit * 0.62) / cam.aspect);
      cam.position.set(0, 0.98, dist);
      cam.lookAt(0, 0.9, 0);
      cam.updateProjectionMatrix();
      _v.set(0, 0, 0).project(cam);
      E.ax = ((_v.x + 1) / 2) * w; E.ay = ((1 - _v.y) / 2) * h; E.w = w; E.h = h;
      _v.set(0, 1.8, 0).project(cam);
      E.pxm = (E.ay - ((1 - _v.y) / 2) * h) / 1.8;
    };
    E.render = () => { pose(); R.render(scene, cam); };
    E.bonePx = (n, out = {}) => { B[n].getWorldPosition(_v); _v.project(cam); out.x = ((_v.x + 1) / 2) * E.w; out.y = ((1 - _v.y) / 2) * E.h; return out; };
    E.ready = true;
    return E;
  })();
  SX.salvo = salvo;

  // The stage keeps the size it was first given and only the scale changes per scene — the feet (E.ax, E.ay) are the anchor point
  let vw = innerWidth, vh = innerHeight;
  const sizeStage = () => {
    vw = innerWidth; vh = innerHeight;
    const H = Math.round(Math.min(vh * 0.62, vw * 1.05)), W = Math.round(H * 0.75);
    salvo.el.style.width = W + "px"; salvo.el.style.height = H + "px";
    salvo.size(W, H);
    salvo.el.style.transformOrigin = `${salvo.ax}px ${salvo.ay}px`;
  };
  sizeStage();
  addEventListener("resize", () => Math.abs(innerWidth - vw) >= 2 && sizeStage());

  // Steps · speed · facing come from the distance actually moved: stride 1.4 units, faces that way when moving over .22/s, turns toward rest after stopping for .3 seconds
  const MV = { x: 0, y: 0, s: 0.5, o: 0, lx: null, gv: 0, still: 0, yawT: 0, force: null, yawLock: null };
  SX.drive = (dt, x, y, s, o, groundDx = 0, rest = 0) => {
    const S = salvo.S, dx = (MV.lx === null ? 0 : x - MV.lx) - groundDx;
    MV.lx = x;
    const v = dt > 0 ? dx / dt : 0;
    MV.gv = lerp(MV.gv, v, 1 - Math.exp(-dt * 9));
    const pxm = salvo.pxm * s, ms = Math.abs(MV.gv) / pxm;
    S.walk = lerp(S.walk, sstep(0.08, 0.5, ms), 1 - Math.exp(-dt * 6));
    S.run = lerp(S.run, sstep(1.9, 3.6, ms), 1 - Math.exp(-dt * 4));
    const stride = lerp(1.4, 2.5, S.run);
    if (MV.force) { S.walk = 1; S.run = 0; S.phase += dt * Math.PI * 2 * MV.force.cad; }
    else S.phase += (Math.abs(dx) / pxm / stride) * Math.PI * 2;
    if (ms > 0.22) { MV.still = 0; MV.yawT = ((MV.gv > 0 ? 1 : -1) * Math.PI) / 2; }
    else { MV.still += dt; if (MV.still > 0.3) MV.yawT = rest; }
    if (MV.yawLock != null) MV.yawT = MV.yawLock;
    S.yaw += (MV.yawT - S.yaw) * (1 - Math.exp(-dt * 5.5));
    const gT = MV.force ? MV.force.glance : S.walk * (1 - S.run) * (0.5 + 0.5 * Math.sin(S.t * 0.7) > 0.62 ? 1 : 0);
    S.glance = lerp(S.glance, gT, 1 - Math.exp(-dt * 3));
    MV.x = x; MV.y = y; MV.s = s; MV.o = o;
  };
  SX.MV = MV;
  const hp = {};
  const lookAt = (px, py, dt) => {
    const S = salvo.S;
    let ty = 0, tp = 0, rel;
    if (px != null) {
      salvo.bonePx("Head", hp);
      const hx = MV.x + (hp.x - salvo.ax) * MV.s, hyy = MV.y + (hp.y - salvo.ay) * MV.s, pm = salvo.pxm * MV.s, dx = (px - hx) / pm, dy = (hyy - py) / pm, dz = 0.9;
      rel = Math.atan2(dx, dz) - S.yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      ty = clamp(rel * 57.3, -75, 75); tp = clamp(-Math.atan2(dy, Math.hypot(dx, dz)) * 57.3, -28, 30);
    } else if (S.glance > 0.01) { rel = -S.yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel)); ty = clamp(rel * 57.3, -70, 70) * S.glance * 0.6; }
    const k = 1 - Math.exp(-dt * (px != null ? 5 : 3));
    S.hy = lerp(S.hy, ty, k); S.hp = lerp(S.hp, tp, k);
  };
  SX.screenOf = (n, out) => { salvo.bonePx(n, out); out.x = MV.x + (out.x - salvo.ax) * MV.s; out.y = MV.y + (out.y - salvo.ay) * MV.s; return out; };
  const mouse = { x: null, y: null, t: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = performance.now(); }, { passive: true });

  // Scene: cover screen > Button scene (CTA) > 2 sections (the first page fills SX.gx). The scene returns the target pose (T) plus position and scale
  SX.scenes = [];
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!salvo.ready) return;
    const S = salvo.S;
    S.t += dt;
    const T = { reach: 0, lean: 0, sit: 0, fall: 0, crouch: 0, air: 0, thumb: 0 };
    const f = { x: MV.x, y: MV.y, s: MV.s, o: 0, gd: 0, rest: 0, look: null, clip: 0, raw: false };
    const sc = SX.scenes.find((c) => c.active());
    if (sc) sc.step(dt, T, f, { mouse, now });
    else MV.lx = null;
    const kb = 1 - Math.exp(-dt * 9);
    for (const k in T) S[k] = lerp(S[k] || 0, T[k], kb);
    if (!f.raw && !S._busy) { S.squash = lerp(S.squash, 0, kb); S.jump = lerp(S.jump, 0, kb); }
    if (!T.reach) S.reachA = lerp(S.reachA, 0, kb);
    SX.drive(dt, f.x, f.y, f.s, f.o, f.gd, f.rest);
    lookAt(f.look ? f.look[0] : null, f.look ? f.look[1] : null, dt);
    salvo.el.style.opacity = f.o;
    // When seated, clip below the button’s top face (the leg hidden behind)
    salvo.el.style.clipPath = f.clip ? `inset(0 0 ${Math.max(0, salvo.h - (salvo.ay + (f.clip - f.y) / f.s)).toFixed(1)}px 0)` : "";
    if (f.o > 0.01) {
      salvo.el.style.transform = `translate(${(f.x - salvo.ax).toFixed(1)}px, ${(f.y - salvo.ay).toFixed(1)}px) scale(${f.s.toFixed(4)})`;
      salvo.render();
    }
  });

  // Pressing the mascot makes it flinch, then jump and spin once
  const onSalvo = (x, y) => {
    if (!salvo.ready || MV.o < 0.5) return false;
    const w = salvo.pxm * MV.s * 0.42, top = MV.y - salvo.pxm * MV.s * 1.85;
    return x > MV.x - w && x < MV.x + w && y > top && y < MV.y + 8;
  };
  let cur0 = false;
  addEventListener("pointermove", (e) => { const on = onSalvo(e.clientX, e.clientY); if (on !== cur0) { cur0 = on; document.documentElement.style.cursor = on ? "pointer" : ""; } }, { passive: true });
  addEventListener("click", (e) => {
    if (!onSalvo(e.clientX, e.clientY)) return;
    const S = salvo.S;
    if (S._busy) return;
    S._busy = 1;
    gsap.timeline({ onComplete: () => { S._busy = 0; S.spin = 0; } })
      .to(S, { squash: 1, duration: 0.14, ease: "power2.out" })
      .to(S, { squash: -0.6, jump: 0.11, duration: 0.28, ease: "power2.out" })
      .to(S, { spin: Math.PI * 2, duration: 0.62, ease: "power2.inOut" }, "<")
      .to(S, { jump: 0, squash: 0.8, duration: 0.26, ease: "power2.in" }, "-=.3")
      .to(S, { squash: 0, duration: 0.5, ease: "elastic.out(1,.45)" });
  });

  // ---------- Loading curtain (home page, once per session) ----------
  // The original also does not stop Lenis during lock (sx-lock) — rolling the wheel scrolls the page ahead behind the cover
  const pre = document.querySelector(".sx-pre");
  if (pre) {
    if (store("sx-pre") === "1" || reduced) pre.classList.add("is-done");
    else {
      document.documentElement.classList.add("sx-lock");
      scrollTo(0, 0);
      const ppT = pre.querySelector(".sx-pp.top"), ppB = pre.querySelector(".sx-pp.bot"), line = pre.querySelector(".sx-pre-line");
      const counts = pre.querySelectorAll(".sx-pp-count");
      const P = { x: -1e4, Xs: -1e4, y: 0, s: 0.4, open: 0, thumb: 0, nav: null, on: true };
      // Mascot: from .3m on, top and bottom spread apart along a cubic curve (width vw*.5)
      const clip = () => {
        const mid = vh / 2, Wd = vw * 0.5, mx = mid + 6, n = 48;
        const t = ["0 0", vw + "px 0"], b = ["0 " + vh + "px", vw + "px " + vh + "px"];
        for (let i = n; i >= 0; i--) {
          const x = (vw * i) / n, uu = clamp((P.Xs - x) / Wd, 0, 1), h = Math.max(mx * (1 - Math.pow(1 - uu, 3)), mx * P.open);
          t.push(`${x}px ${mid - h}px`); b.push(`${x}px ${mid + h}px`);
        }
        ppT.style.clipPath = `polygon(${t.join(",")})`;
        ppB.style.clipPath = `polygon(${b.join(",")})`;
        line.style.clipPath = `inset(0 0 0 ${Math.max(0, P.Xs)}px)`;
      };
      clip();
      gsap.set(line, { scaleX: 0 });
      const end = () => {
        P.on = false;
        pre.classList.add("is-done");
        document.documentElement.classList.remove("sx-lock");
        store("sx-pre", "1");
        ScrollTrigger.refresh();
      };
      const c = { v: 0 }, setC = () => counts.forEach((e) => (e.textContent = String(Math.round(c.v)).padStart(3, "0")));
      gsap.fromTo(pre.querySelectorAll(".sx-pp-word span"), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.05 });
      const has3D = salvo.ready;
      const dur = clamp(vw / 430, 2.6, 4.2), sp = (vw * 1.2) / dur, xb = vw * 0.4, xm = vw * 0.5;
      const d1 = (xb + vw * 0.1) / sp, d2 = (2 * (xm - xb)) / sp, PA = has3D ? 1.95 : 0, d3 = (vw * 1.1 - (xm + vw * 0.1)) / sp;
      const T0 = 1.85, tEnd = T0 + d1 + d2 + PA + d2 + d3;
      const upd = () => { if (!has3D) { P.Xs = P.x; clip(); } };
      const tl = gsap.timeline();
      tl.to(c, { v: 84, duration: 1.3, ease: "power2.out", onUpdate: setC }, 0).to(line, { scaleX: 0.84, duration: 1.3, ease: "power2.out" }, 0)
        .to(c, { v: 100, duration: 0.45, ease: "power2.inOut", onUpdate: setC }, 1.32).to(line, { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, 1.32)
        // Walks in along the line at a fixed pace (1.02 steps/s)
        .add(() => {
          if (!has3D) return;
          const S = salvo.S;
          S.walk = 1; S.run = 0; S.relax = 1; S.yaw = Math.PI / 2; MV.yawT = S.yaw; MV.lx = null; MV.force = { cad: 1.02, glance: 0 };
          P.s = (vh * (vw < 768 ? 0.26 : 0.3)) / (1.8 * salvo.pxm); P.y = vh / 2;
        }, T0)
        .fromTo(P, { x: -vw * 0.1 }, { x: xb, duration: d1, ease: "none", onUpdate: upd }, T0);
      if (PA) {
        // Slows at the center, turns this way and gives a thumbs-up, then walks off again
        tl.add(() => (MV.force = null), T0 + d1).add(() => (MV.yawLock = 0.12), T0 + d1 + d2 * 0.62).add(() => (MV.yawLock = null), T0 + d1 + d2 + PA - 0.15)
          .to(P, { x: xm, duration: d2, ease: "power2.out" }, T0 + d1)
          .to(P, { thumb: 1, duration: 0.45, ease: "back.out(1.6)" }, T0 + d1 + d2 + 0.3)
          .to(P, { thumb: 0, duration: 0.42, ease: "power2.inOut" }, T0 + d1 + d2 + 1.55)
          .to(P, { x: xm + vw * 0.1, duration: d2, ease: "power2.in" }, T0 + d1 + d2 + PA)
          .add(() => (MV.force = { cad: 1.02, glance: 0 }), T0 + d1 + d2 + PA + d2);
      } else tl.to(P, { x: xm + vw * 0.1, duration: d2, ease: "none", onUpdate: upd }, T0 + d1);
      tl.to(P, { x: vw * 1.1, duration: d3, ease: "none", onUpdate: upd }, T0 + d1 + d2 + PA + d2 - (PA ? 0 : d2))
        .to(pre.querySelectorAll(".sx-pp-meta"), { autoAlpha: 0, duration: 0.4 }, 1.9)
        .add(() => { MV.force = null; salvo.S.relax = 0; }, tEnd)
        .to(P, { open: 1, duration: 0.9, ease: "power3.inOut", onUpdate: () => !has3D && clip() }, tEnd - dur * 0.18)
        .add(end, tEnd + 0.1);
      SX.scenes.push({
        active: () => P.on,
        step(dt, T, f) {
          T.thumb = P.thumb;
          // Set the foot height so the hips sit .1m above the center line
          if (P.nav == null) { const h0 = salvo.bonePx("Hips", {}); P.nav = (salvo.ay - h0.y) / salvo.pxm + 0.1; }
          f.x = P.x; f.s = P.s; f.y = (P.y || vh / 2) + P.nav * salvo.pxm * P.s; f.o = P.x > -1e3 ? 1 : 0;
          if (f.o) P.Xs = P.x - salvo.pxm * P.s * 0.3;
          clip();
        },
      });
      setTimeout(() => P.on && (tl.progress(1), end()), 16000);
    }
  }

  // ---------- CTA: two text strips flow in opposite directions with scroll, and the mascot walks in, presses the button and leans on it (on phone it sits on the stretched button) ----------
  const press = (b) => { b.classList.add("sx-touch"); setTimeout(() => b.classList.remove("sx-touch"), 650); };
  let hoverBtn = null;
  document.querySelectorAll(".sx-cta").forEach((cta) => {
    const rows = cta.querySelectorAll(".sx-cta__row");
    const btn = cta.querySelector(".sx-cta__btn");
    const mm = gsap.matchMedia();
    // Original Webflow interaction: when the cell header reaches the bottom of the screen, it flows endlessly at 10s linear — each text line by its own width, top line to the left, outline line to the right
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ paused: true });
      rows.forEach((r, i) => tl.fromTo(r.children, { xPercent: i ? -100 : 0 }, { xPercent: i ? 0 : -100, duration: 10, ease: "none", repeat: -1 }, 0));
      ScrollTrigger.create({ trigger: cta, start: "top bottom", once: true, onEnter: () => tl.play() });
    });
    if (!btn || !salvo.ready) return;
    btn.addEventListener("pointerenter", () => (hoverBtn = btn));
    btn.addEventListener("pointerleave", () => (hoverBtn = null));
    const st = { x: 0, o: 0, on: false, reach: 0, rest: 0, lean: 0, sit: 0, ox: 0, oy: 0, seat: 0, tl: null, bx: { el: null, ext: 0, pr0: 0 } };
    const bxSet = (v) => {
      st.bx.ext = v;
      const e = st.bx.el;
      if (!e) return;
      if (v > 0.5) { e.style.paddingRight = st.bx.pr0 + v + "px"; e.style.marginRight = -v + "px"; }
      else { e.style.paddingRight = ""; e.style.marginRight = ""; }
    };
    const scene = () => {
      st.reach = st.lean = st.sit = st.ox = st.oy = 0;
      MV.lx = null;
      const mob = vw < 768, bm = btn.getBoundingClientRect(), tl = gsap.timeline(), Rr = mob ? -0.6 : -Math.PI / 2;
      let ext = 0;
      if (mob) {
        bxSet(0); st.bx.el = btn; st.bx.pr0 = parseFloat(getComputedStyle(btn).paddingRight) || 0;
        ext = Math.max(0, Math.min((vw - 16 - bm.right) / 1.08, Math.max(130, vw * 0.42)));
        st.seat = bm.width + ext * 0.56;
        tl.to(st, { x: bm.left + st.seat, duration: 2.2, ease: "power1.inOut" });
      } else {
        const pm = vh * 0.42 / 1.8;
        st.seat = 0;
        tl.to(st, { x: bm.right + (0.6 * Math.sin(Math.acos(0.47 / 0.6)) + 0.06) * pm, duration: 2.4, ease: "power1.inOut" });
      }
      st.rest = Rr;
      if (mob) tl.to(st.bx, { ext, duration: 1.15, ease: "elastic.out(1,.45)", onUpdate: () => bxSet(st.bx.ext) }, 1.15).to(st, { sit: 1, duration: 0.95, ease: "power2.inOut" }, 2.5);
      else tl.to(st, { reach: 1, duration: 0.6, ease: "power2.out" }, "+=.3").add(() => press(btn), "-=.08")
        .to(st, { reach: 0, duration: 0.55, ease: "power2.inOut" }, "+=.5").add(() => (st.rest = -0.35), "-=.2")
        .to(st, { lean: 1, duration: 1.1, ease: "power2.inOut" }, "+=.4");
      return tl;
    };
    const reset = () => {
      if (st.bx.ext > 0.5) gsap.to(st.bx, { ext: 0, duration: 0.45, ease: "power2.inOut", onUpdate: () => bxSet(st.bx.ext) });
      st.tl && st.tl.kill(); st.on = false; st.o = 0; st.reach = st.lean = st.sit = st.ox = st.oy = st.seat = 0;
    };
    // Walks in only once on the first visit, after that it is already leaning (sitting) there
    ScrollTrigger.create({
      trigger: cta, start: "top 60%", end: "bottom top",
      onEnter: () => {
        st.on = true; st.tl && st.tl.kill(); st.x = vw * 1.15;
        const seen = store("sx-cta") === "1";
        st.tl = scene().eventCallback("onComplete", () => store("sx-cta", "1"));
        if (seen) {
          st.tl.totalProgress(1, true); st.rest = vw < 768 ? -0.6 : -0.35;
          if (vw < 768) bxSet(st.bx.ext);
          const S = salvo.S; S.sit = st.sit; S.lean = st.lean; S.walk = 0; S.yaw = MV.yawT = st.rest; MV.lx = null;
          st.o = 0; gsap.to(st, { o: 1, duration: 0.5, delay: 0.15 });
        } else st.o = 1;
      },
      onLeave: () => (st.on = false),
      onEnterBack: () => { st.on = true; st.o = 1; },
      onLeaveBack: reset,
    });
    const hA = {}, hB = {};
    SX.scenes.push({
      active: () => {
        if (st.on) return true;
        if (!st.o || !st.tl) return false;
        const r = cta.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      },
      step(dt, T, f, { mouse, now }) {
        const mob = vw < 768, bb = btn.getBoundingClientRect(), s = (vh * (mob ? 0.24 : 0.42)) / (1.8 * salvo.pxm), pm = salvo.pxm * s;
        f.x = st.x + st.ox; f.s = s; f.o = st.o; f.rest = st.rest;
        f.y = (mob ? bb.bottom + 0.5 * pm : bb.top + bb.height / 2 + 0.98 * pm) + st.oy;
        T.reach = st.reach; T.lean = st.lean; T.sit = st.sit;
        // For sitting and leaning, nudge positions so hips and forearms touch the button edge
        if (st.sit > 0.02) {
          SX.screenOf("Hips", hA);
          const k = Math.min(1, dt * 7) * st.sit, ddx = (bb.left + (st.seat || bb.width * 0.84) - hA.x) * k, ddy = (bb.top - 0.2 * pm - hA.y) * k;
          st.ox += ddx; st.oy += ddy; f.x += ddx; f.y += ddy; if (MV.lx != null) MV.lx += ddx;
        }
        f.clip = st.sit > 0.5 ? bb.top : 0;
        if (st.lean > 0.02) {
          SX.screenOf("RightForeArm", hA); SX.screenOf("RightHand", hB);
          const k = Math.min(1, dt * 7) * st.lean, ddx = (bb.right - bb.width * 0.1 - hA.x) * k, ddy = (bb.top + 2 - (hA.y + hB.y) / 2) * k;
          st.ox += ddx; st.oy += ddy; f.x += ddx; f.y += ddy; if (MV.lx != null) MV.lx += ddx;
        }
        if (st.reach > 0.02) {
          SX.screenOf("LeftArm", hA);
          salvo.S.reachA = clamp(Math.acos(clamp((bb.top + bb.height / 2 - hA.y) / (pm * 0.6), -1, 1)) * 57.3, 20, 110);
          f.look = [bb.right - bb.width * 0.15, bb.top + bb.height / 2];
        } else if (hoverBtn) { const hb = hoverBtn.getBoundingClientRect(); f.look = [hb.left + hb.width / 2, hb.top + hb.height / 2]; }
        else if (mouse.x != null && now - mouse.t < 4000) f.look = [mouse.x, mouse.y];
      },
    });
  });

  // ---------- Three green cards (About, Studio): original Webflow interaction — from when the head of the 300vh block touches the top of the screen until the block end reaches 130% of the screen (scrub .8)
  // Cards standing side by side at 100% width shrink in turn (.5 gap · .5 length · linear) to 32.5% so the next cards slide in ----------
  if (document.querySelector(".s-why__track")) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-width: 992px)", () => {
      gsap.timeline({ scrollTrigger: { trigger: ".s-why__track", start: "top top", end: "bottom 130%", scrub: 0.8 } })
        .to(".s-why__item", { width: "32.5%", duration: 0.5, stagger: 0.5, ease: "none" });
    });
  }

  SX.split = (el, mask) => {
    if (el.dataset.split) return [...el.querySelectorAll(".sx-c")];
    el.dataset.split = "1";
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const word = (w) => `<span class="sx-w" aria-hidden="true">${[...w].map((c) => (mask ? `<span class="sx-m"><span class="sx-c">${c}</span></span>` : `<span class="sx-c">${c}</span>`)).join("")}</span>`;
    el.innerHTML = [...el.childNodes].map((n) => (n.nodeType === 3 ? n.textContent.split(/(\s+)/).map((w) => (!w || /^\s+$/.test(w) ? w : word(w))).join("") : n.outerHTML)).join("");
    return [...el.querySelectorAll(".sx-c")];
  };

  // ---------- Interaction (original Webflow IX3·IX2) ----------
  // Menu and footer text: restarts from the beginning on every hover, and the letters of two lines rise one step in sequence (.5s power2.out — top line over .2s, bottom line over .3s). On leave it stays as is.
  document.querySelectorAll(".sx-roll").forEach((r) => {
    const [a, b] = r.children;
    if (!a || !b) return;
    const tl = gsap.timeline({ paused: true, defaults: { yPercent: -100, duration: 0.5, ease: "power2.out" } })
      .to(SX.split(a), { stagger: { amount: 0.2 } }, 0).to(SX.split(b), { stagger: { amount: 0.3 } }, 0);
    (r.closest("a, button") || r).addEventListener("mouseenter", () => !reduced && tl.restart());
  });
  // Hamburger: when lifted, the slanted // stands upright (0°) and the two short lines grow to the long line’s length, becoming ≡ (.5s power1.out), on exit it reverses 1.15x faster
  document.querySelectorAll(".sx-burger").forEach((b) => {
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: "power1.out" } })
      .to(b.querySelectorAll(".sx-burger__in i:not(:nth-child(2))"), { width: 32 }, 0).to(b.querySelector(".sx-burger__in"), { rotation: 0 }, 0);
    b.addEventListener("mouseenter", () => !reduced && tl.timeScale(1).play());
    b.addEventListener("mouseleave", () => !reduced && tl.timeScale(1.15).reverse());
  });
  // Button: on hover the letters shift up one row at a time (.35s power4.inOut, spread over .5s), text turns to the background color (.3s), three edge gaps close at ±20px (.5s back.in),
  // Background to ink (.35s) · line 1.3x (.5s) — on exit the text goes in reverse, background and line wait .5s then return
  const IOC = "power2.inOut", IOQ = "power3.inOut";
  // GSAP cannot blend var(--…) strings and jumps at the end, so the skin colors are unpacked to rgb and passed in
  const rgbOf = (css) => `rgb(${SX.color(css).map((v) => Math.round(v * 255)).join(",")})`;
  const C = { deep: rgbOf("var(--site-ink-deep)"), surface: rgbOf("var(--kf-surface)"), clear: "transparent" };
  document.querySelectorAll(".sx-btn").forEach((btn) => {
    const txt = btn.querySelectorAll(".sx-btn__text > span"), line = btn.querySelector(".sx-btn__line"), masks = btn.querySelectorAll(".sx-btn__mask i");
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(txt[0], { color: C.deep }, { color: C.surface, duration: 0.3, ease: "power1.out" }, 0)
      .to(masks, { width: 0, x: (i) => (i ? 20 : -20), duration: 0.5, ease: "back.in(1.7)" }, 0)
      .to([...txt].flatMap((s) => SX.split(s)), { yPercent: -100, duration: 0.35, ease: "power4.inOut", stagger: { amount: 0.5 } }, 0);
    btn.addEventListener("mouseenter", () => {
      if (reduced) return;
      tl.play();
      gsap.fromTo(btn, { backgroundColor: gsap.getProperty(btn, "backgroundColor") || C.clear }, { backgroundColor: C.deep, duration: 0.35, ease: "sxease", overwrite: "auto" });
      if (line) { gsap.to(line, { backgroundColor: C.surface, duration: 0.35, ease: "sxease", overwrite: "auto" }); gsap.to(line, { scaleX: 1.3, duration: 0.5, ease: IOC }); }
    });
    btn.addEventListener("mouseleave", () => {
      if (reduced) return;
      tl.reverse();
      gsap.to(btn, { backgroundColor: C.clear, duration: 0.35, delay: 0.5, ease: "sxease", overwrite: "auto" });
      if (line) { gsap.to(line, { backgroundColor: C.deep, duration: 0.35, delay: 0.5, ease: "sxease", overwrite: "auto" }); gsap.to(line, { scaleX: 1, duration: 0.5, delay: 0.5, ease: IOQ }); }
    });
  });
  // CTA button: on hover the text steps up one slot at a time (.5s power2.out, spread over .6s), the three gaps close (.5s back.in), the button scales to .9 (.31s), and on leave it reverses 1.5x faster
  document.querySelectorAll(".sx-cta__btn").forEach((btn) => {
    const txt = btn.querySelectorAll(".sx-btn__text > span"), masks = btn.querySelectorAll(".sx-btn__mask i");
    const tl = gsap.timeline({ paused: true })
      .to([...txt].flatMap((s) => SX.split(s)), { yPercent: -100, duration: 0.5, ease: "power2.out", stagger: { amount: 0.6 } }, 0)
      .to(masks, { width: 0, x: (i) => (i ? 20 : -20), duration: 0.5, ease: "back.in(1.7)" }, 0)
      .to(btn, { scale: 0.9, duration: 0.31, ease: "power2.out" }, 0);
    btn.addEventListener("mouseenter", () => !reduced && tl.timeScale(1).play());
    btn.addEventListener("mouseleave", () => !reduced && tl.timeScale(1.5).reverse());
  });

  // ---------- Text reveal (original IX3): each letter descends from above (−100%) inside its own masked cell ----------
  // Title [data-title-anim] at 90% of screen, 1s back.inOut (spread over .5s), the sticker beside it starts 1s later from .5x and transparent with .6s back.out
  // Hero: home is image .3×.2x→1 (1.2s power1.inOut) · title .3s · subtitle .75s (.9s back.inOut) · About 1.1s (.7s power3.out) · SNS 1.45s · number 1.55s,
  // Subpage: title .15s · intro .55s · chrome object .92x · from transparent .3s (1.1s power1.out), service header title 1s at 0s

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-title-anim]").forEach((el) => {
      const tl = gsap.timeline({ paused: true }).from(SX.split(el, true), { yPercent: -100, duration: 1, ease: "back.inOut(1.7)", stagger: { amount: 0.5 } }, 0);
      const badge = el.parentElement.querySelector(".sx-sticker");
      if (badge) tl.from(badge, { opacity: 0, scale: 0.5, duration: 0.6, ease: "back.out(1.7)" }, 1);
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
    });
    const home = document.querySelector("[data-hero-title]"), tl = gsap.timeline();
    const chars = (sel, dur, ease, amount, at) => document.querySelectorAll(sel).forEach((el) => tl.from(SX.split(el, true), { yPercent: -100, duration: dur, ease, stagger: { amount } }, at));
    if (home) {
      const img = document.querySelector(".h-hero__obj");
      if (img) tl.from(img, { scaleX: 0.3, scaleY: 0.2, duration: 1.2, ease: "power1.inOut" }, 0);
      chars("[data-hero-title]", 0.9, "back.inOut(1.7)", 0.4, 0.3);
      chars("[data-hero-subtitle]", 0.9, "back.inOut(1.7)", 0.4, 0.75);
      chars("[data-hero-text]", 0.7, "power3.out", 0.3, 1.1);
      const soc = document.querySelector(".h-hero .sx-social"), stat = document.querySelector(".h-hero__stat");
      if (soc) tl.from(soc, { opacity: 0, y: 30, duration: 0.5, ease: "power1.out" }, 1.45);
      if (stat) tl.from(stat, { opacity: 0, y: 30, duration: 0.5, ease: "power1.out" }, 1.55);
    } else {
      chars("[data-title]", 1, "back.inOut(1.7)", 0.3, 0);
      chars("[data-hero-subtitle]", 0.9, "back.inOut(1.7)", 0.4, 0.15);
      chars("[data-hero-text]", 0.7, "power3.out", 0.3, 0.55);
      const obj = document.querySelector(".p-hero__obj");
      if (obj && document.querySelector("[data-hero-subtitle]")) tl.from(obj, { opacity: 0, scale: 0.92, duration: 1.1, ease: "power1.out" }, 0.3);
    }
  });

  // ---------- Four cards stacked at a slant (reviews · life photos): original interaction ----------
  // Entrance: when the bundle head touches the screen center, it comes from 100vw to the right at 40°, pivoting on the bottom-right corner with back.out 1s (in sequence across .4s of the bundle)
  // Hover: the hovered card goes 1.1x·0° in .8s outBack, neighbor cards are pushed by a set vw · on leave .6s outBack, tilt returns in .6s ease
  const REST = [-3, 5, -3, -3];
  const PUSH = {
    tst: [[0, 7, 5, 5], [-10, 0, 8, 8], [-15, -8, 0, 10], [-10, -8, -10, 0]],
    life: [[0, 7, 5, 5], [2, 0, 2, 2], [-15, -8, 0, 10], [-10, -8, -10, 0]],
  };
  [[".sx-tst__cards", ".sx-card", "tst"], [".s-life__imgs", ".s-life__item", "life"]].forEach(([wrapSel, itemSel, kind]) => {
    document.querySelectorAll(wrapSel).forEach((wrap) => {
      const cards = [...wrap.querySelectorAll(itemSel)].slice(0, 4);
      if (!cards.length) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-width: 992px)", () => {
        gsap.set(cards, { rotation: (i) => REST[i] });
        gsap.from(cards, { x: () => innerWidth, rotation: 40, transformOrigin: "100% 100%", duration: 1, ease: "back.out(1.7)", stagger: { amount: 0.4 }, scrollTrigger: { trigger: wrap, start: "top center" } });
        const offs = [];
        cards.forEach((c, i) => {
          const on = () => {
            gsap.to(c, { scale: 1.1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", transformOrigin: "50% 50%", overwrite: "auto" });
            cards.forEach((o, j) => j !== i && gsap.to(o, { x: (innerWidth * PUSH[kind][i][j]) / 100, duration: 0.8, ease: "back.out(1.7)", overwrite: "auto" }));
          };
          const out = () => {
            gsap.to(c, { scale: 1, duration: 0.6, ease: "back.out(1.7)" });
            gsap.to(c, { rotation: REST[i], duration: 0.6, ease: "sxease" });
            cards.forEach((o, j) => j !== i && gsap.to(o, { x: 0, duration: 0.6, ease: "back.out(1.7)" }));
          };
          c.addEventListener("pointerenter", on);
          c.addEventListener("pointerleave", out);
          offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", out); });
        });
        return () => { offs.forEach((f) => f()); gsap.set(cards, { clearProps: "transform" }); };
      });
    });
  });

  // If the font arrives late, the pin length ends up wrong
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
