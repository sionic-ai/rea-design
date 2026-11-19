// Common to all pages: draws in the header (black nav band, menu button, vertical booking tab), menu drawer, loader and footer (marquee, credit roll), and hooks up the reveal motion.
// Original values: intro 2s expo.inOut · drawer clip-path .8s expo.inOut · nav hover band .6s cubic-bezier(.08,.82,.17,1)
// · marquee 100px/s (phone 50) · credit scrub 4 · title letters expo.out (length by letter count).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const FT = (window.FT = { reduced, page, lenis: null, ready: [] });
  FT.onReady = (fn) => (FT.isReady ? fn() : FT.ready.push(fn));
  const fireReady = () => {
    FT.isReady = true;
    FT.ready.splice(0).forEach((fn) => fn());
  };

  // Placeholder logo newly drawn at the same position and ratio without using the original logo: round star + double-outline wordmark + navy band
  let uid = 0;
  const logo = (cls = "") => {
    const id = `ftg${uid++}`;
    return `<svg class="ft-logo ${cls}" viewBox="0 0 440 98" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--site-pink-hi)"/><stop offset=".55" style="stop-color: var(--kf-accent)"/><stop offset="1" style="stop-color: var(--site-violet-3)"/></linearGradient></defs>
      <path d="M44 6c4 0 6 3 8 8l7 15 16 3c6 1 9 4 9 8 0 3-2 5-5 8L67 60l3 17c1 6-1 10-6 10-2 0-4-1-7-3l-13-8-14 8c-3 2-5 3-7 3-5 0-7-4-6-10l3-17-12-12c-3-3-5-5-5-8 0-4 3-7 9-8l16-3 7-15c2-5 5-8 9-8Z" fill="var(--site-blue-2)" transform="translate(6 4)"/>
      <path d="M44 6c4 0 6 3 8 8l7 15 16 3c6 1 9 4 9 8 0 3-2 5-5 8L67 60l3 17c1 6-1 10-6 10-2 0-4-1-7-3l-13-8-14 8c-3 2-5 3-7 3-5 0-7-4-6-10l3-17-12-12c-3-3-5-5-5-8 0-4 3-7 9-8l16-3 7-15c2-5 5-8 9-8Z" fill="url(#${id})"/>
      <text x="104" y="58" class="ft-logo__w" fill="none" stroke="url(#${id})" stroke-width="6" stroke-linejoin="round">WORDMARK</text>
      <text x="104" y="58" class="ft-logo__w" fill="none" stroke="var(--kf-ink)" stroke-width="1.6">WORDMARK</text>
      <rect x="150" y="68" width="250" height="18" fill="var(--site-blue-2)"/>
      <text x="275" y="82" class="ft-logo__s" fill="var(--kf-ink)" text-anchor="middle" data-label="Your one English line under the logo here">TAGLINE HERE · 00</text>
    </svg>`;
  };
  FT.logo = logo;
  document.querySelectorAll("[data-ft-logo]").forEach((el) => (el.innerHTML = logo()));

  // Credits fixed emblem on screen — a newly drawn crest of five petals and a horizontal stroke instead of the original Chinese-character sentence
  const crest = (fill = "var(--site-crest)") => `<svg class="ft-crest" viewBox="0 0 466 300" aria-hidden="true" fill="${fill}">
      <g transform="translate(233 92)">
        <circle cx="0" cy="-44" r="34"/><circle cx="42" cy="-14" r="34"/><circle cx="26" cy="36" r="34"/><circle cx="-26" cy="36" r="34"/><circle cx="-42" cy="-14" r="34"/>
        <circle r="18" fill="none" stroke="var(--kf-surface)" stroke-opacity=".5" stroke-width="5"/>
      </g>
      <rect x="20" y="70" width="96" height="22" rx="4" transform="skewX(-10)"/><rect x="60" y="40" width="22" height="110" rx="4" transform="skewX(-10)"/>
      <rect x="40" y="180" width="110" height="22" rx="4" transform="skewX(-10)"/><rect x="88" y="150" width="22" height="130" rx="4" transform="skewX(-10)"/>
      <rect x="250" y="168" width="200" height="18" rx="4"/><rect x="270" y="206" width="150" height="18" rx="4"/><rect x="276" y="168" width="18" height="118" rx="4"/>
    </svg>`;

  const ico = {
    reserve: '<svg viewBox="0 0 32 24" fill="currentColor"><path fill-rule="evenodd" d="M4 3h24a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 6v10h24V9Zm6.3 4.6 1.4-1.4 2.3 2.3 5.3-5.3 1.4 1.4-6.7 6.7Z"/></svg>',
    mail: '<svg viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1" y="1" width="22" height="16" rx="1.5"/><path d="m1 2 11 8 11-8"/></svg>',
    globe: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="9" cy="9" r="7.6"/><path d="M1.4 9h15.2M9 1.4c2.4 2.2 3.4 4.6 3.4 7.6s-1 5.4-3.4 7.6C6.6 14.4 5.6 12 5.6 9s1-5.4 3.4-7.6Z"/></svg>',
    insta: '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="22" height="22" rx="6"/><circle cx="13" cy="13" r="5"/><circle cx="19.4" cy="6.6" r="1" fill="currentColor"/></svg>',
    ur: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 8 8 2M3 2h5v5"/></svg>',
    up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 15V2M2.5 7.5 8 2l5.5 5.5"/></svg>',
    chev: '<svg viewBox="0 0 33 24" fill="var(--kf-accent)"><path d="M33 11.2 16.5 23.3 0 11.2V0l16.5 12L33 0Z"/></svg>',
  };
  FT.ico = ico;

  // The original menu uses a Latin title typeface, so placeholder English text — section names match the titles in index
  const primary = [
    ["index.html", "Home", "home"],
    ["news.html", "News", "news"],
    ["index.html#guide", "Menu", "menu"],
    ["index.html#access", "Access", "access"],
    ["contact.html", "Contact", "contact"],
  ];
  const secondary = [
    ["index.html#station-map", "Floor Plan"],
    ["index.html#guide", "Guest Guide"],
    ["index.html#space", "Space"],
    ["index.html#credit", "Creator"],
    ["index.html#faq", "FAQ"],
  ];
  const BOOK = "Book a Table";
  const navLis = primary
    .map(([h, t, p]) => `<li${p === page && !isHome ? ' aria-disabled="true"' : ""}><a href="${h}"><span>${t}</span></a></li>`)
    .join("");

  /* ---------- Header ---------- */
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ft-head");
    head.innerHTML = `
      <a class="ft-sitelogo" href="index.html" aria-label="Back to start">${logo()}</a>
      <div class="ft-nav">
        <div class="ft-nav__bg" aria-hidden="true"></div>
        <nav class="ft-nav__list" aria-label="Main menu" data-label="Your menu English name here">
          <ul class="ft-nav__ul">${navLis}</ul>
          <ul class="ft-nav__ul ft-nav__hl" aria-hidden="true">${navLis}</ul>
        </nav>
        <div class="ft-lang">
          <button class="ft-lang__btn" type="button" aria-expanded="false">${ico.globe}<span>KO</span></button>
          <div class="ft-lang__menu"><div class="ft-lang__item"><button type="button"><span>EN</span></button></div></div>
        </div>
      </div>
      <button class="ft-menubtn" type="button" aria-label="Open Menu" aria-expanded="false">
        <span class="ft-menubtn__x" aria-hidden="true"><i></i><i></i></span>
        <span class="ft-menubtn__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
      <a class="ft-tab" href="contact.html" data-label="Your English booking button text here"><span class="ft-tab__bg" aria-hidden="true"></span><span class="ft-tab__ico">${ico.reserve}</span><span class="ft-tab__t"><span>${BOOK}</span></span></a>
      <a class="ft-bar" href="contact.html">${ico.reserve}<span>${BOOK}</span>${ico.ur}</a>`;

    head.insertAdjacentHTML(
      "afterend",
      `<div class="ft-veil" aria-hidden="true"></div>
      <aside class="ft-drawer" data-slot="menu-drawer" aria-label="Menu" data-lenis-prevent>
        <a class="ft-drawer__logo" href="index.html">${logo()}</a>
        <div class="ft-drawer__nav" data-label="Your menu English name here">
          <ul class="ft-drawer__p">${primary.map(([h, t]) => `<li data-in><a href="${h}">${t}</a></li>`).join("")}</ul>
          <ul class="ft-drawer__s">${secondary.map(([h, t]) => `<li data-in><a href="${h}">${t}</a></li>`).join("")}</ul>
        </div>
        <a class="ft-drawer__cta" href="contact.html" data-in>${ico.reserve}<span>${BOOK}</span></a>
        <div class="ft-drawer__lang" data-in>${ico.globe}<button type="button" class="is-on">KO</button><button type="button">EN</button></div>
        <div class="ft-drawer__sns"><a href="#" data-in aria-label="SNS">${ico.insta}</a><a href="#" data-in>Privacy policy</a></div>
      </aside>`
    );
  }

  /* ---------- Loader (first page only) ---------- */
  if (isHome && !reduced) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="ft-loader" aria-hidden="true"><div class="ft-loader__logo">
        <svg class="ft-loader__w" viewBox="0 0 532 118"><text x="266" y="86" text-anchor="middle" fill="none" stroke="var(--kf-ink)" stroke-width="1.6">WORDMARK</text></svg>
        <svg class="ft-loader__w ft-loader__fill" viewBox="0 0 532 118"><text x="266" y="86" text-anchor="middle" fill="var(--kf-ink)">WORDMARK</text></svg>
      </div></div>`
    );
  }

  /* ---------- Footer ---------- */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ft-footwrap");
    foot.innerHTML = `
      <div class="ft-footwrap__marquee" data-slot="boundary-marquee"><div class="ft-marquee" data-marquee></div></div>
      <footer class="ft-foot">
        <a class="ft-foot__logo" href="index.html" aria-label="Back to start">${logo()}</a>
        <nav class="ft-foot__nav" aria-label="Footer Menu" data-label="Your menu English name here">
          <ul class="ft-foot__p">${primary.map(([h, t]) => `<li><a class="ft-uline" href="${h}">${t}</a></li>`).join("")}</ul>
          <ul class="ft-foot__s">${secondary.map(([h, t]) => `<li><a class="ft-uline" href="${h}">${t}</a></li>`).join("")}</ul>
        </nav>
        <a class="ft-foot__cta" href="contact.html">${ico.reserve}<span>${BOOK}</span></a>
        <div class="ft-foot__sns"><a href="#" aria-label="SNS">${ico.insta}</a><a href="#">Privacy policy</a></div>
      </footer>
      <div class="ft-chev" aria-hidden="true"><i>${ico.chev}</i><i>${ico.chev}</i><i>${ico.chev}</i></div>
      <section class="ft-credits" data-slot="end-credits">
        <div class="ft-credits__stage">
          <div class="ft-credits__crest">${crest()}</div>
          <h2 class="ft-credits__head" data-label="Your Thanks section English title here">Partners &amp;<br class="ft-sp"> Supporters</h2>
        </div>
        <dl class="ft-credits__list" data-label="Your role title in English and person’s name here">
          <div><dt>Role Name 01</dt><dd class="ft-credits__name">Person Name</dd></div>
          <div><dt>Role Name 02</dt><dd class="ft-credits__logos"><span class="wf-img" data-label="Partner logo · Square"></span><span class="wf-img wf-img--wide" data-label="Partner logo · 2:1 landscape"></span></dd></div>
          <div><dt>Role Name 03</dt><dd class="ft-credits__logos"><span class="wf-img" data-label="Sponsor logo · square"></span><span class="wf-img" data-label="Sponsor logo · square"></span></dd></div>
        </dl>
        <div class="ft-credits__end">
          <p class="ft-credits__thanks" data-label="Your English thank-you line">A line of thanks<br class="ft-sp"> for all of you.</p>
          <div class="ft-credits__logo">${logo()}</div>
          <a class="ft-totop" href="#top"><span class="ft-totop__a"><i>${ico.up}</i><i>${ico.up}</i></span><span>Back to top</span></a>
          <small class="ft-copy">© Brand Name All Rights Reserved.</small>
        </div>
      </section>`;
  }

  /* ---------- Smooth scroll — original Lenis lerp 1 · duration 1.5 · anchors ---------- */
  if (window.Lenis && !reduced) {
    const lenis = (FT.lenis = new Lenis({ lerp: 1, duration: 1.5, anchors: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Header Motion ---------- */
  if (head) {
    const nav = head.querySelector(".ft-nav__list");
    const hl = head.querySelector(".ft-nav__hl");
    head.querySelectorAll(".ft-nav__ul:not(.ft-nav__hl) li").forEach((li) => {
      li.addEventListener("mouseover", () => {
        const r = li.getBoundingClientRect();
        const n = nav.getBoundingClientRect();
        hl.style.opacity = "1";
        hl.style.clipPath = `inset(0% ${n.right - r.right}px 0% ${r.left - n.left}px)`;
      });
    });
    nav.addEventListener("mouseleave", () => (hl.style.opacity = "0"));

    // Original language button: pressing it unfolds the list panel from the top over .5s power4.inOut, and items overlap by .2s, slide in from 1rem to the side and float up (1s/.8s power4.out).
    // Clicking again collapses at the same .5s. While it runs chained on a single timeline, no new input is accepted
    const lang = head.querySelector(".ft-lang");
    const langBtn = lang.querySelector(".ft-lang__btn");
    const langMenu = lang.querySelector(".ft-lang__menu");
    const langItems = lang.querySelectorAll(".ft-lang__item");
    const langTl = gsap.timeline();
    let langOpen = false, langBusy = false;
    const toggleLang = (v = !langOpen) => {
      if (langBusy || v === langOpen) return;
      langBusy = true;
      const d = reduced ? 0 : 1;
      if (v) {
        langTl
          .set(langItems, { opacity: 0 })
          .to(langMenu, { clipPath: "inset(0% 0% 0% 0%)", ease: "power4.inOut", duration: 0.5 * d })
          .to(langItems, { opacity: 1, ease: "power4.out", stagger: { amount: 0.2 * d }, duration: d }, "-=0.2")
          .from(langItems, { x: "1rem", ease: "power4.out", stagger: { amount: 0.2 * d }, duration: 0.8 * d }, "<")
          .call(() => (langBusy = false));
      } else {
        langTl.to(langMenu, { clipPath: "inset(0% 0% 100% 0%)", ease: "power4.inOut", duration: 0.5 * d }).call(() => (langBusy = false));
      }
      langOpen = v;
      langBtn.setAttribute("aria-expanded", v);
    };
    langBtn.addEventListener("click", () => toggleLang());
    lang.querySelector(".ft-lang__menu button").addEventListener("click", (e) => {
      const a = langBtn.querySelector("span");
      const b = e.currentTarget.querySelector("span");
      [a.textContent, b.textContent] = [b.textContent, a.textContent];
      langBusy = false;
      toggleLang(false);
    });

    const btn = head.querySelector(".ft-menubtn");
    const dots = btn.querySelectorAll(".ft-menubtn__dots i");
    const outer = [dots[0], dots[2]];
    // Original values as is — top dot moves down, bottom dot moves up by 6px (GSAP overrides the css position)
    const spread = (i) => (i === 0 ? "0.375rem" : "-0.375rem");
    gsap.set(outer, { y: spread });
    btn.addEventListener("mouseenter", () => {
      if (matchMedia("(hover: none)").matches) return;
      gsap.to(outer, { y: 0, duration: 0.2, onComplete: () => gsap.to(outer, { scale: 1.4, duration: 0.2 }) });
    });
    btn.addEventListener("mouseleave", () => gsap.to(outer, { scale: 1, y: spread, duration: 0.2 }));

    const veil = document.querySelector(".ft-veil");
    const drawer = document.querySelector(".ft-drawer");
    const xBox = btn.querySelector(".ft-menubtn__x");
    const xBars = xBox.querySelectorAll("i");
    let open = false;
    const setMenu = (v) => {
      open = v;
      btn.setAttribute("aria-expanded", v);
      btn.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      document.documentElement.classList.toggle("is-menu", v);
      v ? FT.lenis?.stop() : FT.lenis?.start();
      gsap.to(veil, { autoAlpha: +v });
      gsap.to(xBox, { autoAlpha: +v });
      gsap.from(xBars, { scaleX: +!v, stagger: { amount: 0.2 } });
      if (v) {
        gsap.set(drawer, { visibility: "visible" });
        gsap.to(drawer, { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0 : 0.8, ease: "expo.inOut" });
        if (!reduced) gsap.from(drawer.querySelectorAll("[data-in]"), { opacity: 0, x: "3rem", duration: 0.8, delay: 0.3, ease: "power3.out", stagger: { amount: 0.4 } });
      } else {
        gsap.to(drawer, { clipPath: "inset(0% 0% 0% 100%)", duration: reduced ? 0 : 0.8, ease: "expo.inOut", onComplete: () => gsap.set(drawer, { visibility: "hidden" }) });
      }
    };
    btn.addEventListener("click", () => setMenu(!open));
    veil.addEventListener("click", () => setMenu(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && setMenu(false)));
    drawer.querySelectorAll(".ft-drawer__lang button").forEach((b, i, all) =>
      b.addEventListener("click", () => all.forEach((o) => o.classList.toggle("is-on", o === b)))
    );
    addEventListener("keydown", (e) => e.key === "Escape" && open && setMenu(false));

    // On the home page the top-left logo appears only after passing about half of the hero (original is-show-siteLogo)
    if (!isHome) document.body.classList.add("is-logo");

    FT.onReady(() => {
      if (!isHome || reduced) return;
      const tab = head.querySelector(".ft-tab");
      gsap.from(tab.querySelector(".ft-tab__bg"), { scaleY: 0, duration: 2, ease: "expo.inOut" });
      gsap.from([tab.querySelector(".ft-tab__ico"), tab.querySelector(".ft-tab__t")], { y: "-2rem", delay: 0.1, opacity: 0, duration: 2, ease: "expo.inOut" });
      const items = gsap.utils.toArray(head.querySelectorAll(".ft-nav__ul:not(.ft-nav__hl) li"));
      gsap.from(head.querySelector(".ft-nav__bg"), { scaleX: 0, duration: 2, ease: "expo.inOut" });
      gsap.from(items, { xPercent: (i) => 70 * (items.length - i + 1), duration: 2, ease: "expo.inOut", stagger: { amount: 0.2, from: "end" } });
      gsap.from(items, { opacity: 0, duration: 2, ease: "expo.inOut", stagger: { each: 0.2, from: "end" } });
      gsap.from(head.querySelector(".ft-lang"), { opacity: 0, x: "6rem", ease: "power4.inOut", duration: 2 });
      gsap.from(btn, { scale: 0, duration: 2, ease: "expo.inOut" });
      gsap.from(outer, { y: 0, duration: 1, delay: 1.5, ease: "power2.out" });
    });
  }

  /* ---------- Loader sequence: filled logo rises from the bottom over 2.4s (after 1s) → logo disappears → curtain lifts over 2s ---------- */
  const loader = document.querySelector(".ft-loader");
  if (loader) {
    FT.lenis?.stop();
    gsap.to(loader.querySelector(".ft-loader__fill"), {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 2.4,
      delay: 1,
      onComplete: () => {
        fireReady();
        gsap.to(loader.querySelector(".ft-loader__logo"), {
          opacity: 0,
          onComplete: () => {
            FT.lenis?.start();
            gsap.to(loader, { autoAlpha: 0, duration: 2 });
          },
        });
      },
    });
  } else {
    requestAnimationFrame(fireReady);
  }

  /* ---------- Marquee: three rows, only the middle row reversed, speeds up by scroll speed/200 then returns to 1 ---------- */
  FT.marquee = (box, text = "Your Slogan Goes Here! ") => {
    box.innerHTML = [0, 1, 2]
      .map((i) => `<div class="ft-marquee__row${i === 1 ? " is-fill" : ""}"><span>${text.repeat(6)}</span><span>${text.repeat(6)}</span></div>`)
      .join("");
    if (reduced) return;
    const rows = box.querySelectorAll(".ft-marquee__row");
    const speed = matchMedia("(min-width: 768px)").matches ? 100 : 50;
    rows.forEach((row, i) => {
      const w = row.firstElementChild.offsetWidth;
      const rev = i === 1;
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(row, { x: rev ? -w : 0 }, { x: rev ? 0 : -w, duration: w / speed, ease: "none" });
      ScrollTrigger.create({
        trigger: row,
        start: "top bottom",
        onUpdate: (st) => gsap.timeline().fromTo(tl, { timeScale: st.getVelocity() / 200 }, { timeScale: 1 }, 0),
      });
    });
  };
  document.querySelectorAll("[data-marquee]").forEach((m) => FT.marquee(m));

  /* ---------- Entrance ---------- */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Title: characters rise from half a cell below — duration depends on character count (under 3 chars .8s, up to 18 chars .8→1s, up to 24 chars 1→1.5s)
    document.querySelectorAll("[data-ft-title]").forEach((el) => {
      const split = SplitText.create(el, { type: "words, chars" });
      const t = split.chars.length;
      const n = t < 3 ? 0.8 : t <= 18 ? 0.8 + (0.2 / 15) * (t - 3) : t <= 24 ? 1 + 0.1 * (t - 19) : 1;
      gsap.set(split.chars, { yPercent: 50, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "center bottom",
        once: true,
        onEnter: () => gsap.to(split.chars, { duration: n, yPercent: 0, opacity: 1, stagger: { amount: n - 0.55 }, ease: "expo.out" }),
      });
    });
    // Paragraph: rises from below inside a line mask
    document.querySelectorAll("[data-ft-lines]").forEach((el) => {
      const split = SplitText.create(el, { type: "words, lines", linesClass: "ft-line", mask: "lines", autoSplit: true });
      gsap.set(split.lines, { yPercent: 100, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "center bottom",
        once: true,
        onEnter: () => gsap.to(split.lines, { duration: 1, yPercent: 0, opacity: 1, stagger: { amount: 0.2 }, ease: "power2.inOut", delay: +(el.dataset.ftLines || 0) }),
      });
    });
    document.querySelectorAll("[data-ft-fade]").forEach((el) => {
      gsap.set(el, { yPercent: 20, opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => gsap.to(el, { duration: 0.6, yPercent: 0, opacity: 1 }) });
    });
    // Photo parallax: the inner panel is larger than the cell so it shifts down while passing, with data-ft-clip it expands from inset(20%)
    document.querySelectorAll("[data-ft-parallax]").forEach((box) => {
      const img = box.firstElementChild;
      gsap.to(img, {
        y: () => img.offsetHeight - box.offsetHeight,
        ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
      if (box.hasAttribute("data-ft-clip")) {
        gsap.from(box, { clipPath: "inset(20% 20%)", ease: "power4.out", duration: 1.5, scrollTrigger: { trigger: box, start: "top+=20% bottom" } });
        gsap.from(img, { scale: 1.2, ease: "power4.out", duration: 1.5, scrollTrigger: { trigger: box, start: "top+=20% bottom" } });
      }
    });
  });

  /* ---------- Footer: chevron mark blink · credit roll ---------- */
  if (foot) {
    const chev = foot.querySelectorAll(".ft-chev i");
    if (!reduced) {
      const tl = gsap.timeline({ repeat: -1 });
      chev.forEach((c) => tl.to(c, { duration: 0.3, opacity: 1 }));
      chev.forEach((c) => tl.to(c, { duration: 0.3, opacity: 0 }));
    } else gsap.set(chev, { opacity: 1 });

    const credits = foot.querySelector(".ft-credits");
    const crestBox = foot.querySelector(".ft-credits__crest");
    const headEl = foot.querySelector(".ft-credits__head");
    mm.add(
      { mobile: "(max-width: 768px) and (prefers-reduced-motion: no-preference)", desktop: "(min-width: 769px) and (prefers-reduced-motion: no-preference)" },
      (ctx) => {
        gsap.set([crestBox, headEl], { opacity: 0, yPercent: 30 });
        gsap
          .timeline({
            scrollTrigger: { trigger: credits, start: "top+=100 center", end: ctx.conditions.mobile ? "top+=400 top" : "top+=600 top", scrub: 4 },
          })
          .to(crestBox, { opacity: 1, yPercent: 0, duration: 0.3, ease: "power2.inOut" })
          .to(headEl, { opacity: 1, yPercent: 0, duration: 0.3, ease: "power2.inOut" })
          .to(foot, { backgroundColor: () => getComputedStyle(document.documentElement).getPropertyValue("--kf-surface").trim(), duration: 0.5, ease: "power2.inOut" })
          .to(crestBox, { opacity: 0.1, duration: 0.5, ease: "power2.inOut" }, "<")
          .to(headEl, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "<");
      }
    );
    if (reduced) gsap.set(crestBox, { opacity: 0.1 });

    foot.querySelector(".ft-totop").addEventListener("click", (e) => {
      e.preventDefault();
      FT.lenis ? FT.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- SNS post modal — original: black 40% veil + centered 500×700 (phone 325×530) panel over blur. On open veil .3s → panel .4s (.15s overlap) power2.out,
     On close, panel .3s → curtain .25s (.1s overlap) power2.in. Inside the panel is a spot for an embedded social post ---------- */
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="ft-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="SNS Post">
      <div class="ft-modal__box" data-lenis-prevent>
        <div class="ft-modal__post">
          <div class="ft-modal__who"><span class="ft-modal__ava"></span><b>account.name</b></div>
          <div class="wf-img ft-modal__img" data-label="SNS post photo · same scene as the card · square"></div>
          <p class="ft-modal__cap">Your social post body here in three or four lines. The name and price of the limited-time menu,<br>Enter how long it takes to appear.<br>#YourTag #YourTag</p>
        </div>
      </div>
      <button class="ft-modal__x" type="button" aria-label="Close"><i></i><i></i></button>
    </div>`
  );
  const modal = document.querySelector(".ft-modal");
  const mBox = modal.querySelector(".ft-modal__box");
  let mOpen = false;
  const closeModal = () => {
    if (!mOpen) return;
    mOpen = false;
    modal.setAttribute("aria-hidden", "true");
    gsap
      .timeline()
      .to(mBox, { opacity: 0, duration: reduced ? 0 : 0.3, ease: "power2.in" })
      .to(modal, {
        opacity: 0,
        duration: reduced ? 0 : 0.25,
        ease: "power2.in",
        onComplete: () => {
          gsap.set([modal, mBox], { display: "none" });
          document.documentElement.classList.remove("is-modal");
          FT.lenis?.start();
        },
      }, "-=0.1");
  };
  const openModal = (label) => {
    mOpen = true;
    if (label) mBox.querySelector(".ft-modal__img").dataset.label = label;
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("is-modal");
    FT.lenis?.stop();
    gsap
      .timeline()
      .to(modal, { display: "block", opacity: 1, duration: reduced ? 0 : 0.3, ease: "power2.out" })
      .to(mBox, { display: "block", opacity: 1, duration: reduced ? 0 : 0.4, ease: "power2.out" }, "-=0.15");
  };
  modal.addEventListener("click", (e) => !mBox.contains(e.target) && closeModal());
  addEventListener("keydown", (e) => e.key === "Escape" && closeModal());
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-ft-modal]");
    if (!card || e.defaultPrevented) return;
    e.preventDefault();
    openModal(card.querySelector(".wf-img")?.dataset.label);
  });
  document.addEventListener("keydown", (e) => {
    const card = e.target.closest?.("[data-ft-modal]");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      card.click();
    }
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
