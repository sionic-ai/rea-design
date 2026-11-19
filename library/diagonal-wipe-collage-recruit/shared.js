// Shared by all pages — plugs in the header line, menu drawer, support strip and footer in one place, and hooks up the reveal (diagonal wipe), header line state and Splide strip.
(() => {
  // Arrow·new-window marks are drawn with a css ::after mask (without child elements, like the original) — so the text here is empty
  const ARROW = "";
  const EXT = '<span class="md-ext" aria-hidden="true"></span>';
  const CHEV = '<svg viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><path d="M0 0h4l5 6-5 6H0l5-6zm8 0h4l5 6-5 6H8l5-6z"/></svg>';
  window.mdIcons = { ARROW, EXT, CHEV };

  // Redraw the original collage pieces (arrow band · halftone pink · striped blue · ink-black triangle · lime circle) in the same places and proportions
  const defs = (id) => `<defs>
    <pattern id="dots-${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle class="k-dot2" cx="4" cy="4" r="2.6"/><circle class="k-dot2" cx="11" cy="11" r="1.8"/></pattern>
    <pattern id="dots-r-${id}" width="12" height="12" patternUnits="userSpaceOnUse"><circle class="k-dot" cx="6" cy="6" r="2.4"/></pattern>
    <pattern id="streak-${id}" width="40" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-62)"><rect class="k-streak" x="0" y="0" width="26" height="2"/><rect class="k-streak" x="8" y="5" width="14" height="1.2"/></pattern>
    <pattern id="grain-${id}" width="7" height="7" patternUnits="userSpaceOnUse"><rect class="k-grain" x="1" y="2" width="1" height="1"/><rect class="k-grain" x="5" y="5" width="1" height="1"/></pattern>
  </defs>`;
  const chevron = (x, y, w, h, d, cls) => `<polygon class="${cls}" points="${x},${y} ${x + w},${y} ${x + w + d},${y + h / 2} ${x + w},${y + h} ${x},${y + h} ${x + d},${y + h / 2}"/>`;
  const COLLAGE = {
    hero: (id) => `<svg class="md-collage" viewBox="0 0 1600 780" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">${defs(id)}
      <circle class="k-green" cx="300" cy="300" r="320" opacity=".75"/><circle fill="url(#grain-${id})" cx="300" cy="300" r="320"/>
      <circle class="k-arc" cx="420" cy="340" r="250"/>
      ${chevron(150, 380, 340, 400, 200, "k-pink")}<polygon fill="url(#dots-${id})" points="150,380 490,380 690,580 490,780 150,780 350,580"/>
      <polygon class="k-blue" points="690,0 900,0 600,780 390,780"/><polygon fill="url(#streak-${id})" points="690,0 900,0 600,780 390,780"/>
      ${chevron(720, 40, 400, 680, 330, "k-red")}<polygon fill="url(#grain-${id})" points="720,40 1120,40 1450,380 1120,720 720,720 1050,380"/>
      ${chevron(1260, 0, 340, 780, 300, "k-red2")}
      <polygon class="k-ink" points="470,420 760,560 470,700"/><polygon class="k-ink" points="560,0 780,0 670,110"/>
      <polygon class="k-pink" points="1180,520 1420,520 1300,640"/><polygon fill="url(#dots-r-${id})" points="1180,520 1420,520 1300,640"/>
      <circle class="k-green" cx="1430" cy="650" r="105"/><circle fill="url(#grain-${id})" cx="1430" cy="650" r="105"/>
      ${chevron(60, 690, 34, 40, 22, "k-red")}${chevron(104, 690, 34, 40, 22, "k-blue")}
    </svg>`,
    footer: (id) => `<svg class="md-collage" viewBox="0 0 1555 1077" preserveAspectRatio="xMinYMid slice" aria-hidden="true">${defs(id)}
      ${chevron(0, 120, 520, 900, 420, "k-red3")}
      <polygon class="k-blue" points="470,0 760,0 520,700 230,700"/><polygon fill="url(#streak-${id})" points="470,0 760,0 520,700 230,700"/>
      ${chevron(300, 160, 360, 780, 340, "k-green")}<polygon fill="url(#grain-${id})" points="300,160 660,160 1000,550 660,940 300,940 640,550"/>
      ${chevron(700, 120, 380, 820, 320, "k-red2")}
      <polygon class="k-pink" points="980,380 1300,380 1300,760 980,760"/><polygon fill="url(#dots-r-${id})" points="980,380 1300,380 1300,760 980,760"/>
      <polygon class="k-ink" points="720,700 1020,860 720,1077"/><polygon class="k-ink" points="1060,640 1300,640 1300,1077 1060,1077"/>
      <polygon class="k-blue" points="1200,0 1555,0 1555,300 1340,520"/><polygon fill="url(#streak-${id})" points="1200,0 1555,0 1555,300 1340,520"/>
      <circle class="k-green" cx="1390" cy="210" r="140"/><circle fill="url(#grain-${id})" cx="1390" cy="210" r="140"/>
      ${chevron(1130, 760, 300, 317, 160, "k-pink")}<polygon fill="url(#dots-${id})" points="1130,760 1430,760 1590,918 1430,1077 1130,1077 1290,918"/>
    </svg>`,
    band: (id) => `<svg class="md-collage" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs(id)}
      ${chevron(-80, 0, 420, 300, 160, "k-pink")}<polygon fill="url(#dots-${id})" points="-80,0 340,0 500,150 340,300 -80,300 80,150"/>
      <polygon class="k-blue" points="380,0 820,0 700,120 260,120"/><polygon fill="url(#streak-${id})" points="380,0 820,0 700,120 260,120"/>
      ${chevron(700, 0, 560, 140, 70, "k-red")}<polygon class="k-green" points="1200,0 1600,0 1600,180 1340,180"/>
    </svg>`,
  };
  let uid = 0;
  window.mdCollage = (kind) => COLLAGE[kind](`${kind}-${++uid}`);

  // Brush and arrow decoration pieces (hero·section corners) — slot for the original deco art
  const DECO = {
    chevrons: '<svg viewBox="0 0 220 112" aria-hidden="true"><polygon class="k-red" points="0,0 50,0 110,56 50,112 0,112 60,56"/><polygon class="k-red" points="70,0 120,0 180,56 120,112 70,112 130,56"/><polygon class="k-ink" points="150,30 190,30 220,56 190,82 150,82 180,56" opacity=".9"/></svg>',
    tri: '<svg viewBox="0 0 160 120" aria-hidden="true"><polygon class="k-ink" points="0,0 160,60 0,120"/></svg>',
    tri2: '<svg viewBox="0 0 150 140" aria-hidden="true"><polygon class="k-red" points="0,0 150,0 150,140"/><polygon class="k-pink" points="60,40 150,40 150,140"/></svg>',
    circle: '<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="k-green" cx="100" cy="100" r="100" opacity=".8"/></svg>',
    slash: '<svg viewBox="0 0 200 120" aria-hidden="true"><polygon class="k-red" points="30,0 110,0 80,40 0,40"/><polygon class="k-green" points="70,60 170,60 140,110 40,110"/></svg>',
    half: '<svg viewBox="0 0 160 90" aria-hidden="true"><path class="k-ink" d="M80 80a40 40 0 0 1 80 0z"/><rect class="k-blue" x="0" y="44" width="80" height="46"/></svg>',
  };
  const fillDeco = (root = document) => root.querySelectorAll("[data-deco]").forEach((el) => {
    if (el.firstElementChild) return;
    el.innerHTML = DECO[el.dataset.deco] || "";
    el.querySelector("svg")?.classList.add("md-collage");
  });

  const here = document.body.dataset.page;
  const NAV = [
    ["about.html", "about us", "Company About", "about"],
    ["interview.html", "interview", "Staff Interview", "interview"],
    ["crosstalk.html", "cross talk", "New hire roundtable", "crosstalk"],
    ["about.html#welfare", "welfare", "Employee benefits", "welfare"],
    ["index.html#recruit", "recruitment", "Application guidelines", "recruitment"],
  ];
  const logo = (tag) => `<a class="md-logo" href="index.html" data-label="Brand wordmark — two arrows between four English letters">
      <span class="md-logo__mark"><span class="md-logo__word">LO${CHEV}GO</span><span class="md-logo__tag">${tag}</span></span>
      <span class="md-logo__sub">recruit site</span></a>`;
  const cbtn = (jp, ext) => `<li><a class="md-cbtn" href="${ext ? "#" : "#entry"}"${ext ? ' target="_blank" rel="noopener"' : ""}><span>${jp}<span class="md-cbtn__en">entry</span></span><span class="md-ico${ext ? " is-ext" : ""}"></span></a></li>`;

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("md-header");
    header.innerHTML = `<div class="md-header__in">${logo("Company Tagline Here")}
      <button class="md-navbtn" type="button" aria-label="Open and close menu" aria-expanded="false"><span class="md-navbtn__in"><i></i><i></i></span></button>
      <nav class="md-nav" aria-label="Main menu">
        <ul class="md-nav__list"><li class="is-sp"><a href="index.html"><span class="md-ul">top</span></a></li>${NAV.map(([h, en, , key]) => `<li><a href="${h}"${key === here ? ' aria-current="page"' : ""}><span class="md-ul">${en}</span></a></li>`).join("")}</ul>
        <div class="md-nav__cv"><p class="md-nav__cvhead is-sp">entry</p><ul>${cbtn("New Grad Hiring", true)}${cbtn("Experienced hiring", false)}</ul></div>
      </nav></div>`;
    header.insertAdjacentHTML("afterend", '<div class="md-overlay"></div>');
  }

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.innerHTML = `<section class="md-cv" data-slot="entry-band"><div class="md-cv__in md-wide">
        <h2 class="md-cv__head">join us</h2>
        <div class="md-cv__sub"><p class="md-cv__sub-en">entry</p><h3 class="md-cv__sub-jp">Application Form</h3></div>
        <ul class="md-cv__list">
          <li><a class="md-cv__link" href="#" target="_blank" rel="noopener"><span>New Grad Hiring</span><span class="md-cv__btn">Recruiting site<span class="md-circ is-ext"></span></span></a></li>
          <li><a class="md-cv__link" href="#entry"><span>Experienced hiring</span><span class="md-cv__btn"><span class="md-circ"></span></span></a></li>
        </ul></div></section>
      <div class="md-footer__wrap">
        <div class="md-footer__in">${logo("Company Tagline Here")}
          <p><a class="md-footer__sub" href="#" target="_blank" rel="noopener"><span class="md-ul">Corporate site</span>${EXT}</a></p>
          <ul class="md-fnav">${NAV.map(([h, en, jp]) => `<li><a href="${h}"><span class="md-fnav__en"><span class="md-ul">${en}</span></span><span class="md-fnav__jp">${jp}</span></a></li>`).join("")}
            <li><span><span class="md-fnav__en">entry</span><span class="md-fnav__jp">Application Form</span></span><ul class="md-fnav__child"><li><a href="#"><span class="md-ul">New grad hiring (careers site)</span></a></li><li><a href="#entry"><span class="md-ul">Experienced hiring</span></a></li></ul></li></ul>
          <p class="md-footer__cr">&copy; Company Name All Rights Reserved</p>
        </div>
        <div class="md-footer__bg" data-label="Collage graphic — arrow band pointing right, halftone dots, stripes, circle">${mdCollage("footer")}</div>
      </div>
      <p class="md-pagetop"><a href="#top" aria-label="Back to top"><span class="md-circ"></span></a></p>`;
    footer.classList.add("md-footer");
  }

  // After the page script has plugged in all cards and strips (DOMContentLoaded), hook up the drawing, splitting and reveals
  const start = () => {
  document.querySelectorAll("[data-strip]:empty").forEach((ul) => {
    ul.innerHTML = `<li class="splide__slide md-strip__item is-1"><span class="md-deco" data-deco="chevrons"></span><div class="wf-img" data-label="Hands at a laptop · on a desk · circle"></div></li>
      <li class="splide__slide md-strip__item is-2"><div class="wf-img" data-label="Staff full-length · meeting room by the window · portrait 3:4"></div></li>
      <li class="splide__slide md-strip__item is-3"><span class="md-deco" data-deco="tri2"></span><div class="wf-img" data-label="Company logo sign · white wall · square"></div><div class="wf-img" data-label="Staff working with a smile · Natural light · Portrait 3:4"></div></li>
      <li class="splide__slide md-strip__item is-4"><span class="md-deco" data-deco="slash"></span><div class="wf-img" data-label="Two staff talking · outside in front of a tree · portrait 3:4"></div></li>
      <li class="splide__slide md-strip__item is-5"><div class="wf-img" data-label="Hands working on laptop · circular"></div><div class="wf-img" data-label="Two smiling coworkers · office · square"></div></li>`;
  });
  document.querySelectorAll("[data-collage]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = mdCollage(el.dataset.collage); });
  fillDeco();

  // Menu drawer (below 1100) — button, cover, links inside the drawer
  const btn = document.querySelector(".md-navbtn"), nav = document.querySelector(".md-nav"), overlay = document.querySelector(".md-overlay");
  const setNav = (open) => {
    if (!btn) return;
    btn.classList.toggle("is-open", open); nav.classList.toggle("is-open", open); overlay.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  btn?.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  overlay?.addEventListener("click", () => setNav(false));
  nav?.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", () => setNav(false)));
  addEventListener("resize", () => { if (innerWidth >= 1100) setNav(false); });

  // Header row — past 100px of scrolling a background appears and the row gets shorter
  const head = document.querySelector(".md-header"), top = document.querySelector(".md-pagetop");
  const onScroll = () => {
    head?.classList.toggle("is-scrolled", scrollY > 100);
    top?.classList.toggle("is-active", scrollY > innerHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Character splitting — words are inline-block chunks, and each character delays its diagonal wipe by 0.05s
  document.querySelectorAll(".md-pieces").forEach((el) => {
    const step = parseFloat(el.dataset.step || "0.05");
    let i = 0;
    const walk = (node, into) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { into.append(document.createTextNode(part)); return; }
          const word = document.createElement("span");
          word.className = "md-word";
          [...part].forEach((ch) => {
            const s = document.createElement("span");
            s.className = "md-slant";
            s.textContent = ch;
            s.style.setProperty("--slant-delay", `${+(i * step).toFixed(2)}s`);
            word.append(s);
            i++;
          });
          into.append(word);
        });
      } else if (node.nodeType === 1) {
        const copy = node.cloneNode(false);
        if (node.tagName !== "BR") [...node.childNodes].forEach((c) => walk(c, copy));
        into.append(copy);
      }
    };
    const kids = [...el.childNodes];
    el.textContent = "";
    kids.forEach((k) => walk(k, el));
  });

  // Appear — once, when it enters 100px above the bottom of the screen (the original attaches after load)
  const mm = gsap.matchMedia();
  mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const els = document.querySelectorAll(".js-anime, .md-pieces, .md-reveal");
    if (ctx.conditions.reduce) { els.forEach((el) => el.classList.add("is-animated")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-animated");
      io.unobserve(e.target);
    }), { rootMargin: "0% 0% -100px 0%", threshold: 0 });
    const start = () => els.forEach((el) => io.observe(el));
    document.readyState === "complete" ? start() : addEventListener("load", start, { once: true });
    return () => io.disconnect();
  });

  // Photo collage strip — Splide loop + AutoScroll speed .5, no dragging
  document.querySelectorAll(".md-strip.splide").forEach((el) => {
    new Splide(el, { type: "loop", rewind: true, arrows: false, pagination: false, pauseOnFocus: false, pauseOnHover: false, drag: false, autoWidth: true,
      autoScroll: { speed: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.5, pauseOnHover: false } })
      .mount(window.splide?.Extensions || {});
  });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start();
})();
