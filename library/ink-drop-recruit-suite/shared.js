// Header bar, menu drawer, closing strip and footer are identical across the four pages, so they are drawn in once here.
(() => {
  const page = document.body.dataset.page || "home";
  const O = '<span class="sr-pick">O</span>';
  const NAV = [
    { href: "about.html", en: `AB${O}UT`, plain: "ABOUT", ja: "Know the Company" },
    { href: "works.html", en: `W${O}RKS`, plain: "WORKS", ja: "Know the Work" },
    { href: "index.html#project", en: `PR${O}JECT STORY`, plain: "PROJECT STORY", ja: "Project story" },
    { href: "recruit.html", en: `PE${O}PLE`, plain: "PEOPLE", ja: "Get to know colleagues" },
    { href: "index.html#environment", en: `ENVIR${O}NMENT`, plain: "ENVIRONMENT", ja: "Workplace environment · benefits" },
  ];
  const DRAWER = [
    [{ href: "index.html", en: "TOP", ja: "First Page" }, ...NAV.slice(0, 3)],
    [NAV[3], NAV[4], { href: "index.html#question", en: "FAQ", ja: "Frequently asked questions" }, { href: "#entry", en: "ENTRY", ja: "Apply" }],
  ];
  const LINK_ICON = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 1H1v6h6V5M4.5 1H7v2.5M7 1 3.5 4.5"/></svg>';
  const X_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h5.2l4.3 6 5-6h2.2l-6.2 7.4L21 21h-5.2l-4.7-6.5L5.5 21H3.3l6.9-8.1Z"/></svg>';
  const IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor"/></svg>';
  const LOGO = '<span class="sr-logo__mark" data-label="Company English wordmark (logo SVG) · 108px wide">BRAND</span><span class="sr-logo__text">RECRUITING 0000</span>';

  const header = document.querySelector("[data-slot='header']");
  if (header) {
    header.innerHTML = `
      <a href="index.html" class="sr-logo">${LOGO}</a>
      <nav class="sr-pcnav" aria-label="Main menu" data-label="Menu English name — the letter O pops to that section’s color on hover">${NAV.map((n) => `<a href="${n.href}" class="sr-nav__link">${n.en}</a>`).join("")}</nav>
      <div class="sr-header__right">
        <a href="#entry" class="sr-entry"><span>ENTRY</span></a>
        <button class="sr-dots" type="button" aria-label="Open Menu" aria-expanded="false"><span class="sr-dots__in"><span class="sr-dot"></span><span class="sr-dot"></span><span class="sr-dot"></span></span></button>
      </div>
      <nav class="sr-nav" aria-label="Full menu">
        <div class="sr-nav__inner">${DRAWER.map((col) => `<ul class="sr-nav__list">${col.map((n) => `<li class="sr-nav__item"><a href="${n.href}" class="sr-nav__link"><span class="en">${n.plain || n.en}</span><span class="ja">${n.ja}</span></a></li>`).join("")}</ul>`).join("")}</div>
        <div class="sr-nav__info"><a href="#" class="sr-nav__corp">Company site${LINK_ICON}</a><a href="#" class="sr-nav__x" aria-label="X">${X_ICON}</a></div>
      </nav>`;
    header.classList.add("sr-header");
    header.id = "js-header";
  }

  const entry = document.querySelector("[data-slot='entry']");
  if (entry) {
    entry.id = "entry";
    entry.innerHTML = `
      <div class="sr-inner">
        <h3 class="ja">Application guidelines</h3>
        <div class="sr-entrysec__catch iv"><span class="en-catch" lang="en" data-label="Closing English slogan — three lines, only the letter O in accent color">SHAPE<br>THE<br>NEW T${O}NE.</span></div>
        <a href="#entry" class="sr-btn"><span class="sr-btn__text">ENTRY</span><span class="sr-btn__arrow"></span></a>
      </div>`;
  }

  const footer = document.querySelector("[data-slot='footer']");
  if (footer) {
    const links = [DRAWER[0][0], ...NAV, DRAWER[1][2], DRAWER[1][3]];
    footer.innerHTML = `
      <div class="sr-inner">
        <div class="sr-footer__wrap">
          <div class="sr-footer__col">
            <nav class="sr-footer__nav" aria-label="Footer Menu">${links.map((n) => `<a href="${n.href}"><span class="en">${n.plain || n.en}</span><span class="ja">${n.ja}</span></a>`).join("")}</nav>
            <a href="index.html" class="sr-footer__logo">${LOGO}</a>
          </div>
          <div class="sr-footer__col">
            <div class="sr-footer__sns"><a href="#" aria-label="X">${X_ICON}</a><a href="#" aria-label="Instagram">${IG_ICON}</a></div>
            <a href="#" class="sr-footer__corp">Company site${LINK_ICON}</a>
            <span class="sr-footer__text">RECRUITING 0000</span>
            <small class="sr-footer__copy">© BRAND COMPANY LIMITED. ALL RIGHTS RESERVED.</small>
          </div>
        </div>
      </div>`;
  }

  // Header row: past the height of the hero (#js-mv) it turns into a white band with tighter margins. On people pages the hero is dark, so white text is used only over it
  const mv = document.getElementById("js-mv");
  if (header && mv) {
    const white = page === "recruit";
    const onScroll = () => {
      const past = scrollY >= mv.clientHeight;
      header.classList.toggle("js-active", past);
      header.classList.toggle("is-white", white && !past);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const dots = header && header.querySelector(".sr-dots");
  if (dots) {
    const set = (open) => {
      header.classList.toggle("is-navOpen", open);
      dots.classList.toggle("is-active", open);
      dots.setAttribute("aria-expanded", String(open));
    };
    dots.addEventListener("click", () => set(!header.classList.contains("is-navOpen")));
    header.querySelector(".sr-nav").addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // Seven person cards: first page slider (data-cards="slide") and the people list (data-cards="item") use the same card
  const CARDS = [
    ["Joined in 0000<br>#Your division name · department · team here", "A.A", "Your nickname line here"],
    ["Joined in 0000<br>#Your division name · Department here", "B.B", "Your nickname line here"],
    ["Joined in 0000<br>#Your division name here · Business unit · A slightly longer team name", "C.C", "Your nickname line here"],
    ["Joined in 0000<br>#Your division name · Business unit<br>Your team name here", "D.D", "Your nickname here"],
    ["Joined in 0000<br>#Your division name · department · team here", "E.E", "Your nickname line here"],
    ["Joined in 0000<br>#Your division · business unit · team name here", "F.F", "Your nickname line here"],
    ["Joined in 0000<br>#Your division name · department · team here", "G.G", "Your nickname line here"],
  ];
  document.querySelectorAll("[data-cards]").forEach((list) => {
    const slide = list.dataset.cards === "slide";
    list.innerHTML = CARDS.map(([info, name, catchText], i) => `
      <li class="sr-card is-c${i + 1} iv${slide ? " splide__slide" : ""}">
        <a href="recruit.html" class="sr-card__link">
          <div class="sr-card__shapes"><span class="shape"></span><span class="shape"></span><span class="shape"></span></div>
          <div class="sr-card__desc"><span class="sr-card__info">${info}</span><span class="sr-card__name" lang="en" data-label="Employee name initials in English">${name}</span></div>
          <div class="sr-card__catch"><span>${catchText}</span></div>
          <div class="sr-card__thumb">
            <div class="sr-card__img"><div class="wf-img sr-ph" data-label="Work scene · B&W portrait"></div></div>
            <div class="sr-card__img"><div class="wf-img sr-ph" data-label="Staff face and upper body · office · black and white landscape 4:3"></div></div>
            <div class="sr-card__img"><div class="wf-img sr-ph" data-label="Desk and hand close-up · black and white landscape"></div></div>
            <div class="sr-card__img"><div class="wf-img sr-ph" data-label="Chatting with a colleague · B&W landscape"></div></div>
          </div>
          <div class="sr-card__human"><div class="wf-img sr-ph" data-label="Employee full-body cutout · white background · portrait"></div></div>
          <button class="sr-card__more" type="button" tabindex="-1"><span class="text" lang="en">VIEW MORE</span><span class="arrow"><span class="circle"></span></span></button>
        </a>
      </li>`).join("");
  });

  // Original .iv — add .view when half visible (intersection .5). Slider clone cards are created later so, as in the original, scan once more .8s after load.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const watch = () => {
    const ivs = document.querySelectorAll(".iv:not(.view)");
    if (reduce || !("IntersectionObserver" in window)) { ivs.forEach((el) => el.classList.add("view")); return; }
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("view");
      io.unobserve(en.target);
    }), { threshold: [0.5] });
    ivs.forEach((el) => io.observe(el));
  };
  watch();
  addEventListener("load", () => setTimeout(watch, 800));

  // Big letter pattern behind the people section — scattered with a fixed seed so the placement is always the same
  document.querySelectorAll(".sr-texture").forEach((box) => {
    const words = ["Here", "Large text", "Pattern", "Value", "Makes", "Moves", "The world", "What Shows", "Next", "To the End"];
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const n = Math.round(box.clientHeight / 70) + 12;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      const kind = rnd();
      s.textContent = words[Math.floor(rnd() * words.length)];
      if (kind < 0.45) s.className = "is-v";
      else if (kind < 0.75) s.className = "is-box";
      s.style.left = `${(rnd() * 104 - 4).toFixed(1)}%`;
      s.style.top = `${(rnd() * 100).toFixed(1)}%`;
      s.style.fontSize = `${Math.round(kind < 0.45 ? 56 + rnd() * 50 : 30 + rnd() * 26)}px`;
      box.append(s);
    }
  });

  // Original simpleParallax (upward · 1.2x · delay .6 · cubic-bezier(0,0,0,1)) — same library
  addEventListener("DOMContentLoaded", () => {
    const els = document.querySelectorAll(".js-parallax");
    if (els.length && window.simpleParallax && !reduce) {
      new simpleParallax(els, { orientation: "up", scale: 1.2, delay: 0.6, overflow: false, transition: "cubic-bezier(0,0,0,1)" });
    }
  });

  addEventListener("load", () => document.body.classList.add("is-loaded"));
  if (document.readyState === "complete") document.body.classList.add("is-loaded");
})();
