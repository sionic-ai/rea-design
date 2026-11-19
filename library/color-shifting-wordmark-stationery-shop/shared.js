// Header · phone menu · footer · loading bar · wordmark shared by all sections, plus shared motion (text splitting · photo zoom entrance · picker buttons).
// The original opens a new document when turning chapters and the loading bar restarts — there is no page-transition library.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";

  // Wordmark — five letters newly drawn with the same ratio (1000:210 wide, two lines 800:585) and the same stroke contrast instead of the original logo.
  // Leave a gap of 10 between the thick vertical stem and the thin horizontal curve to give a clipped-letter feel
  const r = (n) => +n.toFixed(1);
  const rect = (x, y, w, h) => `M${r(x)},${r(y)}h${r(w)}v${r(h)}h${r(-w)}Z`;
  const poly = (pts) => "M" + pts.map((p) => `${r(p[0])},${r(p[1])}`).join("L") + "Z";
  const half = (cx, cy, rxo, ryo, rxi, ryi) =>
    `M${r(cx)},${r(cy - ryo)}A${r(rxo)},${r(ryo)} 0 0 1 ${r(cx)},${r(cy + ryo)}L${r(cx)},${r(cy + ryi)}A${r(rxi)},${r(ryi)} 0 0 0 ${r(cx)},${r(cy - ryi)}Z`;
  const GLYPHS = [
    { w: 158, d: (x, y, s) => rect(x, y, 44 * s, 210 * s) + half(x + 54 * s, y + 52 * s, 92 * s, 52 * s, 52 * s, 36 * s) + half(x + 54 * s, y + 157 * s, 104 * s, 53 * s, 62 * s, 37 * s) },
    { w: 168, d: (x, y, s) => rect(x, y, 44 * s, 210 * s) + half(x + 54 * s, y + 55 * s, 92 * s, 55 * s, 50 * s, 39 * s) + poly([[70, 112], [112, 112], [168, 210], [126, 210]].map(([a, b]) => [x + a * s, y + b * s])) },
    { w: 178, d: (x, y, s) => poly([[78, 0], [96, 0], [34, 210], [16, 210]].map(([a, b]) => [x + a * s, y + b * s])) + poly([[78, 0], [120, 0], [178, 210], [136, 210]].map(([a, b]) => [x + a * s, y + b * s])) + rect(x + 50 * s, y + 134 * s, 72 * s, 16 * s) },
    { w: 160, d: (x, y, s) => rect(x, y, 16 * s, 210 * s) + poly([[0, 0], [46, 0], [160, 210], [114, 210]].map(([a, b]) => [x + a * s, y + b * s])) + rect(x + 144 * s, y, 16 * s, 210 * s) },
    { w: 200, d: (x, y, s) => rect(x, y, 44 * s, 210 * s) + half(x + 54 * s, y + 105 * s, 146 * s, 105 * s, 100 * s, 89 * s) },
  ];
  const LAYOUT = {
    A: { vb: "0 0 1000 210", s: 1, at: [[0, 0], [192, 0], [394, 0], [606, 0], [800, 0]] },
    B: { vb: "0 0 800 585", s: 1.36, at: [[0, 0], [272, 0], [557, 0], [0, 299], [275, 299]] },
  };
  let markId = 0;
  function markSVG(kind, anim) {
    const L = LAYOUT[kind], id = `szm${++markId}`;
    const clips = L.at.map(([x, y], i) => `<clipPath id="${id}-${i}"><rect x="${x - 4}" y="${y}" width="${GLYPHS[i].w * L.s + 8}" height="${210 * L.s}"/></clipPath>`).join("");
    const chars = L.at.map(([x, y], i) => `<g clip-path="url(#${id}-${i})"><path class="char char-${i + 1}" d="${GLYPHS[i].d(x, y, L.s)}"/></g>`).join("");
    const cls = anim ? ` class="sz-mark-anim sz-mark-anim--${kind}${anim.cls ? " " + anim.cls : ""}" style="--initial-delay:${anim.delay}s"` : "";
    return `<svg${cls} viewBox="${L.vb}" aria-hidden="true"><defs>${clips}</defs>${chars}</svg>`;
  }
  window.szMark = markSVG;
  document.querySelectorAll("[data-mark]").forEach((el) => {
    const [kind, delay, cls] = el.dataset.mark.split(" ");
    el.innerHTML = markSVG(kind, delay === undefined ? null : { delay: +delay, cls: cls || "" });
  });

  const ICON = {
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.2 3.4-7.2 7.5-7.2s7.5 3 7.5 7.2"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 13H6.2Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    insta: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/></svg>',
  };
  const MENU = [["Home", "index.html", "home"], ["About", "about.html", "about"], ["Product", "product.html", "product"], ["Journal", "news.html", "news"], ["News", "news.html", ""]];
  const SUB = ["Guide 1 · How to use", "Notice 2 · Terms", "Notice 3 · Privacy", "Guide 4 · Notices", "Info 5 · Contact", "Notice 6 · Contact"];
  const navLinks = (cls) => MENU.map(([t, h, p]) => `<li><a class="${cls}" href="${h}"${p === page ? ' aria-current="page"' : ""}>${t}</a></li>`).join("");
  const subLinks = SUB.map((t) => `<li><a class="sz-press" href="#">${t}</a></li>`).join("");

  const head = document.querySelector("[data-slot=header]");
  head.outerHTML = `<header class="h-header${page === "home" ? " is-transparent" : ""}" data-slot="header">
    <div class="h-announcement"><a href="product.html">Your one-line alert goes here — a collaboration notebook and a new item are out, on sale now!</a></div>
    <div class="h-header__inner">
      <div class="h-logo"><a href="index.html" class="sz-mark sz-mark--A" aria-label="Home">${markSVG("A")}</a></div>
      <nav class="h-nav">
        <ul class="h-nav__main">${navLinks("sz-ul")}</ul>
        <ul class="h-nav__sub">
          <li><a class="sz-press" href="#" aria-label="Log in"><span class="h-icon">${ICON.user}</span></a></li>
          <li><a class="sz-press" href="#" aria-label="Cart"><span class="h-icon">${ICON.cart}</span></a></li>
        </ul>
        <button class="h-spnav__trigger" type="button" aria-label="Menu" aria-expanded="false"></button>
      </nav>
    </div>
  </header>`;

  const foot = document.querySelector("[data-slot=footer]");
  foot.outerHTML = `<footer class="f-footer l-container" data-slot="footer">
    <div class="f-logo"><a href="index.html" class="sz-mark sz-mark--B" aria-label="Home">${markSVG("B")}</a></div>
    <div class="f-nav"><ul class="f-nav__main">${navLinks("sz-ul")}</ul><ul class="f-nav__sub">${subLinks}</ul></div>
    <div class="f-newsletter"><dl><dt>NEWS LETTER</dt><dd>Your newsletter sign-up note here, one line</dd>
      <dd class="f-newsletter__input"><form onsubmit="return false"><input type="email" placeholder="Please write your email address" aria-label="Email address"><button type="submit" aria-label="Register"></button></form></dd></dl></div>
    <div class="f-bottom">
      <div class="f-bottom__logo"><span class="wf-logo">COMPANY</span></div>
      <p class="f-bottom__copyright"><small>© Company Name</small></p>
      <ul class="f-bottom__sns"><li><a class="sz-press" href="#" aria-label="SNS"><span class="sz-sns-icon">${ICON.insta}</span></a></li></ul>
    </div>
  </footer>`;

  body.insertAdjacentHTML("afterbegin", '<div class="c-splash" aria-hidden="true"><div class="c-splash__bar"><span class="c-splash__fill"></span></div></div>');
  body.insertAdjacentHTML("beforeend", `<div class="h-spnav" id="sz-spnav" data-slot="mobile-menu">
    <div class="h-spnav__inner l-container"><ul class="h-spnav__main">${navLinks("")}</ul><ul class="h-spnav__sub">${subLinks}</ul>
    <ul class="h-spnav__sns"><li><a href="#" aria-label="SNS"><span class="sz-sns-icon">${ICON.insta}</span></a></li></ul></div>
    <div class="h-spnav__bcg"></div></div>`);

  // Text splitting — words are grouped as chunks and the spaces between are left as they are (so Korean line breaks don’t split mid-word). Delay is letter index × .04s
  document.querySelectorAll(".c-anim-text").forEach((el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span");
            w.className = "word";
            [...part].forEach((ch) => {
              const i = document.createElement("i");
              i.className = "char";
              i.textContent = ch;
              i.style.transitionDelay = `${(n++ * 0.04).toFixed(2)}s`;
              w.append(i);
            });
            frag.append(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
      });
    };
    walk(el);
  });

  // Loading bar — every 200ms it fills a random 10% of the remainder (up to 90%), and never runs more than 10% ahead of the actual share of images loaded
  const fill = document.querySelector(".c-splash__fill");
  let fake = 0, actual = 0;
  const assets = [...document.images, ...document.querySelectorAll("video")];
  if (!assets.length) actual = 100;
  else {
    let got = 0;
    const tick = () => { got++; actual = (got / assets.length) * 100; };
    assets.forEach((a) => (a.complete ? tick() : (a.addEventListener("load", tick), a.addEventListener("error", tick))));
  }
  const timer = setInterval(() => {
    if (fake > actual + 10) { fill.style.inlineSize = `${fake}%`; return; }
    fake = Math.min(Math.max(fake + (90 - fake) * 0.1 * Math.random(), actual), 90);
    fill.style.inlineSize = `${fake}%`;
  }, 200);
  const vh = () => document.documentElement.style.setProperty("--vh", `${innerHeight * 0.01}px`);
  vh();
  addEventListener("resize", vh);

  // Keeps the original two stages _loaded (DOMContentLoaded) and _allloaded (load) under the same names — each section script listens to sz:ready and hooks up its motion
  const start = () => {
    clearInterval(timer);
    fill.style.inlineSize = "100%";
    // If the first paint comes late (font loading), the hidden-state style doesn’t exist yet and the fade gets skipped, so force one style calculation before adding the class
    document.querySelectorAll(".l-wrapper, .h-header").forEach((el) => getComputedStyle(el).opacity);
    body.classList.add("_allloaded");
    common();
    document.dispatchEvent(new CustomEvent("sz:ready"));
  };
  // The original fills a bar while downloading some twenty photos (first one about .9s) and then opens the section. The copy is a placeholder with nothing to download, so
  // Since load fires immediately, we don’t open earlier than the load wait the original measured per section (body data-min-load, ms) — with real photos load comes later so this value goes unused
  const minLoad = +(body.dataset.minLoad || 0);
  const ready = () => {
    body.classList.add("_loaded");
    const go = () => setTimeout(start, Math.max(0, minLoad - performance.now()));
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();

  function common() {
    const header = document.querySelector(".h-header");
    const announce = header.querySelector(".h-announcement");
    const setAnnounce = () => document.documentElement.style.setProperty("--sz-announce", `${announce.getBoundingClientRect().height}px`);
    setAnnounce();
    addEventListener("resize", setAnnounce);
    const onScroll = () => header.classList.toggle("is-small", scrollY > 100);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // On wide screens, hides the header upward when the footer shows (.3s)
    const mqMd = matchMedia("(min-width: 1000px)");
    const footer = document.querySelector(".f-footer");
    let fo;
    const footWatch = () => {
      fo && fo.disconnect();
      if (mqMd.matches) {
        fo = new IntersectionObserver(([e]) => header.classList.toggle("is-hidden", e.isIntersecting && scrollY > 0), { threshold: 0 });
        fo.observe(footer);
      } else header.classList.remove("is-hidden");
    };
    footWatch();
    mqMd.addEventListener("change", footWatch);
    const hero = document.querySelector("[data-hero-transparent]");
    if (hero) new IntersectionObserver(([e]) => header.classList.toggle("is-transparent", e.isIntersecting), { threshold: 0.1 }).observe(hero);

    // Phone menu — when opened, the body is pinned in place (fixed) so the back doesn’t shift, and when closed it returns to the original scroll after the background has fully cleared
    const nav = document.getElementById("sz-spnav"), trig = header.querySelector(".h-spnav__trigger"), bcg = nav.querySelector(".h-spnav__bcg");
    const wrap = document.querySelector(".l-wrapper");
    let open = false, keep = 0;
    trig.addEventListener("click", () => {
      if (!open) {
        open = true;
        keep = scrollY;
        body.classList.add("is-spnav-open");
        wrap.style.position = "fixed";
        wrap.style.top = `${-keep}px`;
        scrollTo(0, 0);
      } else {
        body.classList.remove("is-spnav-open");
        bcg.addEventListener("transitionend", function done(e) {
          if (e.propertyName !== "transform") return;
          bcg.removeEventListener("transitionend", done);
          open = false;
          wrap.style.position = "relative";
          wrap.style.top = "0px";
          scrollTo(0, keep);
        });
      }
      trig.setAttribute("aria-expanded", String(!open || body.classList.contains("is-spnav-open")));
    });

    // Turns on once when visible and off when scrolled back up (text splitting, text blocks, wordmark)
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".js-scroll-animate").forEach((el) => {
      if (reduce) { el.classList.add("is-animated"); return; }
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => { el.classList.remove("is-leaving"); el.classList.add("is-animated"); },
        onLeaveBack: () => { el.classList.remove("is-animated"); el.classList.add("is-leaving"); },
      });
    });

    // Product photos — from 1.1 scale and transparent, .7s power4.out, three at a time staggered .2s, once
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const pics = gsap.utils.toArray(".c-zoomin > *");
      if (!pics.length) return;
      gsap.set(pics, { scale: 1.15, opacity: 0 });
      ScrollTrigger.batch(".c-zoomin", {
        start: "top 70%",
        batchMax: 3,
        once: true,
        onEnter: (batch) => gsap.fromTo(batch.map((el) => el.firstElementChild), { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.2 }),
      });
    });

    // Select button — height 0 up to the list height (.3s), closes when pressed outside
    document.querySelectorAll(".c-filter-button").forEach((b) => {
      const t = b.querySelector(".c-filter-button__trigger"), outer = b.querySelector(".c-filter-button__select-outer"), sel = b.querySelector(".c-filter-button__select");
      const full = () => sel.offsetHeight + parseFloat(getComputedStyle(sel).marginBlockStart || 0) + "px";
      const show = () => { outer.style.blockSize = "0"; requestAnimationFrame(() => { outer.style.blockSize = full(); b.classList.add("is-open"); }); };
      const hide = () => { outer.style.blockSize = outer.offsetHeight + "px"; requestAnimationFrame(() => { outer.style.blockSize = "0"; b.classList.remove("is-open"); }); };
      t.addEventListener("click", () => (b.classList.contains("is-open") ? hide() : show()));
      document.addEventListener("click", (e) => { if (!b.contains(e.target) && b.classList.contains("is-open")) hide(); });
    });
  }
})();
