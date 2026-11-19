// Common to all pages: draw the header, expanding menu, phone menu and footer once, and attach and detach the contact box, scroll reveals and page script for each body (Barba container).
// Original libraries as is: page transitions barba 2.9.7 · smooth scroll Lenis 1.0.18 (lerp .2) · Hero slider slick 1.8.1. Original Velocity curves use the same Béziers via CustomEase.
// Original values: entrance y 50 (phone 20) 1s easeOutQuart (delays 0/.1/.2) · contact box x -60 (phone y 40) 1s easeOutQuint delay .2
//            Transition: body off .2s → loading circle (delay .2) → next page after .6s, on entry loading off .15s (delay .15) and body on .45s (delay .3).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 1023;
  const page = document.body.dataset.page || "home";
  const EC = (window.EC = { reduced, isSP, lenis: null });

  const arrow = (mod = "") => `<i class="ec-arrow ${mod}"><span class="bg"></span><span class="ar"></span></i>`;
  // Instead of the original icon: a placeholder icon with a lime wedge overlapping a green square
  const mark = '<g><rect x="0" y="4" width="22" height="18" fill="var(--kf-accent)"/><path d="M8 22 22 4v18z" fill="var(--kf-accent-soft)"/></g>';
  const logo = `<svg viewBox="0 0 100 26" aria-label="Logo">${mark}<text x="30" y="21" style="font-family: var(--kf-font-display)" font-size="19" letter-spacing="1.5" fill="var(--kf-ink)">LOGO</text></svg>`;
  const logoSet = `<svg viewBox="0 0 163 66" aria-label="Logo">
      <g transform="scale(1.6)">${mark}</g>
      <text x="48" y="33" style="font-family: var(--kf-font-display)" font-size="30" letter-spacing="2" fill="var(--kf-ink)">LOGO</text>
      <text x="0" y="52" style="font-family: var(--kf-font-en, var(--kf-font-display))" font-size="8.5" letter-spacing="1" fill="var(--kf-accent)">YOUR ORGANIZATION</text>
      <text x="0" y="63" style="font-family: var(--kf-font-en, var(--kf-font-display))" font-size="8.5" letter-spacing="1" fill="var(--kf-accent)">NAME IN ENGLISH</text>
    </svg>`;
  const downDot = '<svg viewBox="0 0 22 22" aria-hidden="true"><rect width="22" height="22" rx="9" fill="var(--kf-accent)"/><path d="M11 13.4 8.5 9.1h5z" fill="var(--site-highlight)"/></svg>';
  const qaIcon = '<svg viewBox="0 0 37 27" fill="none" aria-hidden="true"><ellipse cx="15.6" cy="12.5" rx="14.4" ry="11.9" fill="var(--kf-accent)"/><path d="M8 21.5 5.5 26l7-3.2z" fill="var(--kf-accent)"/><ellipse cx="27" cy="16.6" rx="9.2" ry="7.4" fill="var(--kf-surface)" stroke="var(--kf-accent-soft)" stroke-width="1.2"/><circle cx="11" cy="12.5" r="1.3" fill="var(--kf-surface)"/><circle cx="15.6" cy="12.5" r="1.3" fill="var(--kf-surface)"/><circle cx="20.2" cy="12.5" r="1.3" fill="var(--kf-surface)"/></svg>';
  const mailIcon = '<svg viewBox="0 0 28 19" aria-hidden="true"><path d="M0 0 17 15c1.4 1.2.5 3.5-1.3 3.5H2a2 2 0 0 1-2-2z" fill="var(--kf-accent)"/><path d="M28 0 6.9 18.5H26a2 2 0 0 0 2-2z" fill="var(--site-highlight)"/><path d="M14 12.3 28 0H0z" fill="var(--kf-accent-soft)"/></svg>';
  const snsIcon = '<svg viewBox="0 0 34 34" aria-hidden="true"><circle class="ring" cx="17" cy="17" r="17"/><path d="M18.6 27V18.2h2.9l.4-3.4h-3.3v-2.2c0-1 .3-1.6 1.7-1.6H22V8a24 24 0 0 0-2.6-.1c-2.6 0-4.3 1.6-4.3 4.4v2.5h-2.9v3.4h2.9V27z" fill="var(--kf-surface)"/></svg>';
  EC.icons = { arrow, logo, logoSet };

  const cur = (...p) => (p.includes(page) ? " is-current" : "");
  const menu = [
    { id: "news", label: "News", href: "list.html", cur: cur("list", "detail") },
    { id: "about", label: "About us", href: "about.html", cur: cur("about") },
    { id: "service", label: "What we do", drop: true },
    { id: "partner", label: "To Partner Organizations", href: "#" },
    { id: "recruit", label: "Hiring guide", href: "#" },
    { id: "company", label: "Corporate overview", href: "#" },
  ];
  const services = [
    { pre: "Your short intro line here", title: "Your service here<br>Name, two lines", photo: "Home nursing scene · close-up of fitting a device on a hand · soft indoor light · 4:3 landscape" },
    { pre: "Your short line here<br>Two-line About", title: "Your service name here", photo: "Scene of sitting face to face and listening · back view and side profile · window natural light · wide 4:3" },
  ];

  document.body.insertAdjacentHTML("afterbegin", '<div class="ec-loading" aria-hidden="true"></div>');

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ec-head");
    head.innerHTML = `
      <div class="ec-head__in">
        <div class="ec-logo"><a href="index.html" aria-label="Home">${logo}</a></div>
        <nav class="ec-gnav" aria-label="Main menu"><ul>
          ${menu
            .map((m) =>
              m.drop
                ? `<li class="has-drop${cur()}"><button type="button">${m.label}${downDot}</button>
                    <div class="ec-drop" data-slot="mega-menu"><div class="ec-drop__row">
                      <div class="ec-drop__txt"><div><h2>${m.label}</h2><p>Your two-line description here: three kinds of work done in one place.</p></div></div>
                      <nav>${services
                        .map(
                          (s) => `<a href="#"><figure class="ec-ph"><div class="wf-img" data-label="${s.photo}"></div></figure>
                            <div><p>${s.pre}</p><h3><span>${s.title}</span>${arrow("ec-arrow--s")}</h3></div></a>`
                        )
                        .join("")}</nav>
                    </div></div></li>`
                : `<li class="${m.cur || ""}"><a href="${m.href}">${m.label}</a></li>`
            )
            .join("")}
        </ul></nav>
        <div class="ec-navbtn ec-navbtn--qa"><a href="#">${qaIcon}<span>Q&amp;A</span></a></div>
        <div class="ec-navbtn ec-navbtn--mail"><a href="#contact">${mailIcon}<span>Contact Us</span></a></div>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<button class="ec-burger" type="button" aria-label="Open Menu"><div><i></i><i></i><i></i></div></button>
      <div class="ec-spnav" data-slot="mobile-menu">
        <div class="ec-spnav__in">
          <div class="ec-spnav__body">
            <div class="ec-spnav__home"><a href="index.html">TOP</a></div>
            <nav><ul>
              ${menu
                .map((m) =>
                  m.drop
                    ? `<li><span>${m.label}</span><div class="sub">${services.map((s) => `<div><a href="#">${s.title.replace("<br>", " ")}</a></div>`).join("")}</div></li>`
                    : `<li><a href="${m.href}">${m.label}</a></li>`
                )
                .join("")}
            </ul></nav>
            <nav><ul><li><a href="#">Frequently asked questions</a></li><li><a href="#contact">Contact Us</a></li></ul></nav>
          </div>
          <div class="ec-sns"><a href="#" aria-label="SNS">${snsIcon}</a></div>
          <small class="ec-spnav__copy">© LOGO All Rights Reserved.</small>
        </div>
      </div>`
    );
  }

  const buildContact = (box) => {
    const contact = box.querySelector('[data-slot="contact"]');
    if (!contact || contact.childElementCount) return;
    contact.classList.add("ec-contact");
    contact.id = "contact";
    contact.innerHTML = `
      <figure class="ec-ph"><div class="wf-img" data-label="Meeting of four staff seated around a table · bright office natural light · 3:2 landscape"></div></figure>
      <div class="txt">
        <h2 class="ec-vert">Contact · Consultation</h2>
        <h3>Your one line inviting inquiries here</h3>
        <p>Your one line on who can make inquiries goes here.<br>A one-liner here telling family and partner organizations that anyone can reach out comfortably.</p>
        <div class="btm">
          <div class="ec-btn"><a href="#"><span>Contact us via website${arrow("ec-arrow--btn")}</span></a></div>
          <div class="ec-tel"><b>〈Phone〉</b><strong>000-000-0000</strong><em>9:00-18:00 (Mon-Fri)</em></div>
        </div>
      </div>`;
  };

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ec-foot");
    foot.innerHTML = `
      <div class="ec-foot__top">
        <div class="ec-foot__logo"><a href="index.html" aria-label="Home">${logoSet}</a></div>
        <h2>Your region name, home visit nursing here<span class="ec-only-pc">｜</span><br class="ec-only-sp">Your office name here</h2>
        <address>〒000-0000 One line of your address here<br>Tel. 000-000-0000 (9:00 - 18:00) / Fax. 000-000-0000</address>
        <ul class="ec-links"><li><a href="#contact">Contact us via website${arrow()}</a></li></ul>
      </div>
      <div class="ec-foot__inner">
        <div class="ec-sns"><a href="#" aria-label="SNS">${snsIcon}</a></div>
        <div class="ec-fnav">
          <nav class="main"><ul>
            <li><a href="list.html">News</a></li>
            <li><a href="about.html">About us</a></li>
            <li class="ec-only-pc"><a href="#">To Partner Organizations</a></li>
            <li><a href="#">Hiring guide</a></li>
            <li><a href="#">Corporate overview</a></li>
            <li><a href="#">Frequently asked questions</a></li>
            <li class="ec-only-sp"><a href="#contact">Contact Us</a></li>
          </ul></nav>
          <nav class="sub"><h3>(What we do)</h3><ul>
            <li><a href="#">Your service · here<br>Name, two lines</a></li>
            <li><a href="#">Your service name here</a></li>
            <li class="ec-only-sp"><a href="#">To Partner Organizations</a></li>
          </ul></nav>
        </div>
      </div>
      <div class="ec-foot__motto ec-vert">Your vertically written text here<br>Two-line slogan<i>,</i> Briefly</div>
      <small class="ec-foot__copy">© LOGO All Rights Reserved.</small>`;
  }

  // Dropdown menu: on hover it opens from top to bottom with clip-path
  document.querySelectorAll(".ec-gnav .has-drop").forEach((li) => {
    const drop = li.querySelector(".ec-drop");
    li.addEventListener("mouseenter", () => drop.classList.add("is-open"));
    li.addEventListener("mouseleave", () => drop.classList.remove("is-open"));
  });

  // Velocity 1.2’s named curves are Béziers — their shape differs from GSAP’s power curves, so they are built from the same values
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const ease = (EC.ease = {});
  Object.entries({
    outQuad: "0.25,0.46,0.45,0.94",
    inOutQuad: "0.455,0.03,0.515,0.955",
    outCubic: "0.215,0.61,0.355,1",
    inOutCubic: "0.645,0.045,0.355,1",
    outQuart: "0.165,0.84,0.44,1",
    inOutQuart: "0.77,0,0.175,1",
    outQuint: "0.23,1,0.32,1",
    outSine: "0.39,0.575,0.565,1",
  }).forEach(([k, v]) => (ease[k] = CustomEase.create(`ec-${k}`, v)));

  // Smooth scroll (original new Lenis({ lerp: .2, duration: .6 }) — if lerp is set, duration is not used)
  if (!reduced && window.Lenis) {
    EC.lenis = new Lenis({ lerp: 0.2, duration: 0.6 });
    EC.lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((t) => EC.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTop = (duration, easing) => {
    if (EC.lenis) EC.lenis.scrollTo(0, duration ? { duration, easing } : { immediate: true });
    else scrollTo(0, 0);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : 0;
    if (target === null) return;
    if (EC.spOpen) closeSP();
    if (EC.lenis) EC.lenis.scrollTo(target || 0, { duration: 0.7, easing: ease.inOutQuart });
    else (target || document.documentElement).scrollIntoView();
  });

  // Phone menu: panel turns on in .1s and the inside settles down from 22px above in .6s (delay .1). On close, inside .1s, panel .3s (delay .1)
  const burger = document.querySelector(".ec-burger");
  const sp = document.querySelector(".ec-spnav");
  let savedY = 0;
  const spInner = sp ? sp.querySelectorAll(".ec-spnav__body, .ec-sns, .ec-spnav__copy") : [];
  function openSP() {
    EC.spOpen = true;
    burger.classList.add("is-open");
    burger.setAttribute("aria-label", "Close Menu");
    sp.classList.add("is-shown");
    gsap.killTweensOf([sp, ...spInner]);
    gsap.to(sp, { opacity: 1, duration: 0.1, ease: "none" });
    gsap.fromTo(spInner, { opacity: 0, marginTop: 22 }, { opacity: 1, marginTop: 0, duration: 0.6, delay: 0.1, ease: ease.outCubic });
    savedY = scrollY;
    EC.lenis && EC.lenis.stop();
    document.body.classList.add("is-locked");
    document.body.style.top = -savedY + "px";
  }
  function closeSP() {
    EC.spOpen = false;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-label", "Open Menu");
    gsap.killTweensOf([sp, ...spInner]);
    gsap.to(spInner, { opacity: 0, duration: 0.1, ease: ease.outCubic });
    gsap.to(sp, { opacity: 0, duration: 0.3, delay: 0.1, ease: "none", onComplete: () => { sp.classList.remove("is-shown"); sp.scrollTop = 0; } });
    document.body.classList.remove("is-locked");
    document.body.style.top = "";
    scrollTo(0, savedY);
    EC.lenis && EC.lenis.start();
  }
  if (burger) burger.addEventListener("click", () => (EC.spOpen ? closeSP() : openSP()));

  // Attach and detach per body — page scripts use EC.page(namespace, { build, ready }) — register it this way.
  // build draws things in (as soon as the document stands), ready is the motion (original pageReady·pageTopLoad slot — on load for the first page, after for transitions). The function ready returns is called on leaving
  const loading = document.querySelector(".ec-loading");
  const headEls = [head, burger].filter(Boolean);
  const parts = [];
  let cleanups = [];
  EC.page = (ns, part) => parts.push({ ns, ...part });
  const run = (box, k) => parts.filter((p) => p[k] && (p.ns === "*" || p.ns === box.dataset.barbaNamespace)).map((p) => p[k](box));
  const box = () => document.querySelector('[data-barba="container"]');
  const nsOf = (href) => ({ "": "home", index: "home" })[href.split(/[?#]/)[0].split("/").pop().replace(".html", "")] ?? href.split(/[?#]/)[0].split("/").pop().replace(".html", "");
  const navOf = { list: "news", detail: "news", about: "about" };
  const setCurrent = (ns) => {
    if (!navOf[ns]) return;
    document.querySelectorAll(".ec-gnav > ul > li").forEach((li, i) => li.classList.toggle("is-current", menu[i].id === navOf[ns]));
  };

  function build(el) {
    document.body.dataset.page = el.dataset.barbaNamespace;
    buildContact(el);
    run(el, "build");
  }
  // Scroll reveal
  function fades(el) {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", pc: "(min-width: 1024px)" },
      (ctx) => {
        const { reduce, pc } = ctx.conditions;
        const items = gsap.utils.toArray("[data-fade]", el);
        const contact = el.querySelector(".ec-contact");
        if (reduce) {
          gsap.set([...items, contact].filter(Boolean), { opacity: 1, x: 0, y: 0 });
          return;
        }
        items.forEach((item) => {
          const delay = { 1: 0.1, 2: 0.2 }[item.dataset.fade] || 0;
          gsap.set(item, { opacity: 0, y: pc ? 50 : 20 });
          ScrollTrigger.create({
            trigger: item,
            start: "top bottom-=100",
            once: true,
            onEnter: () => gsap.to(item, { opacity: 1, y: 0, duration: 1, delay, ease: ease.outQuart }),
          });
        });
        if (contact) {
          gsap.set(contact, pc ? { opacity: 0, x: -60 } : { opacity: 0, y: 40 });
          ScrollTrigger.create({
            trigger: contact,
            start: "top bottom-=200",
            once: true,
            onEnter: () => gsap.to(contact, { opacity: 1, x: 0, y: 0, duration: 1, delay: 0.2, ease: ease.outQuint }),
          });
        }
      }
    );
    return () => mm.revert();
  }
  // Original pageReady: the loading circle fades out in .15s (delay .15), and if it is not the first page, body and footer in .45s (delay .3)
  function ready(el, first) {
    const ns = el.dataset.barbaNamespace;
    const contents = [el, foot].filter(Boolean);
    setCurrent(ns);
    if (reduced) {
      gsap.set([...contents, ...headEls], { opacity: 1 });
      gsap.set(loading, { display: "none" });
    } else {
      gsap.set(contents, { opacity: 0 });
      gsap.fromTo(loading, { opacity: 1 }, { opacity: 0, duration: 0.15, delay: 0.15, ease: "none", onComplete: () => gsap.set(loading, { display: "none" }) });
      if (ns !== "home") gsap.to(contents, { opacity: 1, duration: 0.45, delay: 0.3, ease: ease.outQuad });
      if (first && ns !== "home") {
        if (el.querySelector(".ec-mainimg")) gsap.fromTo(headEls, { opacity: 0, marginTop: -25 }, { opacity: 1, marginTop: 0, duration: 0.6, delay: 0.8, ease: ease.outQuart });
        else gsap.to(headEls, { opacity: 1, duration: 0.45, delay: 0.3, ease: ease.outQuad });
      }
    }
    cleanups = [fades(el), ...run(el, "ready")].filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  const unmount = () => cleanups.splice(0).forEach((f) => f());
  EC.revealHead = (vars) => gsap.to(headEls, { opacity: 1, ...vars });

  // Original before: when leaving or going to the first page, header off .2s, body · footer off .2s then immediately if scrolled down past 400 (phone 200)px, otherwise to the top in .6s.
  // The loading circle: Velocity runs opacity 0 to 100 in .15s (delay .2), so it is fully on in 1.5ms
  let backY = 0, forwardY = 0;
  function leave(nextNs, trigger) {
    const from = box();
    const y = scrollY;
    setCurrent(nextNs);
    document.querySelectorAll(".ec-drop.is-open").forEach((d) => d.classList.remove("is-open"));
    if (reduced) return;
    if (from.dataset.barbaNamespace === "home" || nextNs === "home") gsap.to(head, { opacity: 0, duration: 0.2, ease: ease.outQuad });
    const turn = trigger === "back" || trigger === "forward";
    if (trigger === "back") forwardY = y;
    else if (!turn) backY = y;
    gsap.to([from, foot], {
      opacity: 0,
      duration: 0.2,
      ease: ease.outQuad,
      onComplete: () => {
        if (turn) return;
        if (isSP() ? y > 200 : y > 400) gsap.delayedCall(0.05, () => scrollTop(0));
        else scrollTop(0.6, ease.inOutCubic);
      },
    });
    gsap.set(loading, { display: "block" });
    gsap.fromTo(loading, { opacity: 0 }, { opacity: 100, duration: 0.15, delay: 0.2, ease: "none" });
    if (EC.spOpen) closeSP();
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

  // Only pages of this site set (*.html in the same folder) are treated as transitions — things like ../../index.html in the list bar normally just navigate
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  function start() {
    build(box());
    const first = () => ready(box(), true);
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
              build(next.container);
            },
            // Barba does not count a transition without leave and enter as a page transition (the original also keeps an empty enter)
            enter() {},
            after: ({ trigger, next }) => {
              if (trigger === "back") scrollTo(0, backY);
              else if (trigger === "forward") scrollTo(0, forwardY);
              if (next.container.dataset.barbaNamespace !== "home") gsap.to(head, { opacity: 1, duration: reduced ? 0 : 0.2, ease: ease.outQuad });
              ready(next.container, false);
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
    addEventListener("pageshow", (e) => {
      if (e.persisted) location.reload();
    });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
