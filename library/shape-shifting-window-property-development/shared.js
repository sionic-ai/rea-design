// Shared by all pages — floating pill menu, footer, Lenis (1.3.23 · duration 2), title and body rise, footer appearance
(() => {
  document.documentElement.classList.add("js");
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ARROW = '<svg viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h23M18.5 .5 23 5l-4.5 4.5"/></svg>';
  const LOGO = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20 36V14M20 20c-4-3-8-3-11-1M20 24c4-3 9-3 12 0M20 16c-3-4-3-8 0-11 3 3 3 7 0 11Z"/><path d="M6 36h28M9 36v-9h5v9M26 36v-11h5v11"/></svg>';
  window.BA = { ARROW, LOGO, reduce };

  const btn = (label, cls, href, extra = "") =>
    `<a class="btn ${cls}" href="${href}"${extra}><span class="btn__in"><span class="btn__row">${label} ${ARROW}</span><span class="btn__row" aria-hidden="true">${label} ${ARROW}</span></span></a>`;
  BA.btn = btn;

  const links = [
    ["index.html", "Home", "home"], ["index.html#intro", "3D Tour"], ["index.html#residences", "Housing"],
    ["service.html", "Business space", "service"], ["index.html#business-options", "Shopping arcade"], ["index.html#location", "Location"],
    ["index.html#amenities", "Amenities"], ["contact.html", "Inquiry", "contact"], ["about.html", "About the Investor", "about"],
  ];

  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.className = "nav";
    nav.innerHTML = `
      <div class="nav__box">
        <div class="nav__bar">
          <div class="nav__side"><button class="nav__menu t-menu" type="button" aria-expanded="false" aria-label="Open Menu"><span class="nav__lines"><i></i><i></i></span><span>Menu</span></button></div>
          <a class="nav__logo" href="index.html" aria-label="Home">${LOGO}</a>
          <div class="nav__side is-end"><a class="nav__cta-link" href="contact.html"><button class="btn is-dark nav__cta" type="button" tabindex="-1"><span class="btn__in"><span class="btn__row">Contact ${ARROW}</span><span class="btn__row" aria-hidden="true">Contact ${ARROW}</span></span></button></a></div>
        </div>
        <div class="nav__drop"><div class="nav__drop-in">
          <a class="nav__drop-logo" href="index.html" aria-label="Home">${LOGO}</a>
          <nav class="nav__links t-h3">${links.map(([h, t, p], i) => `<a class="nav__link" href="${h}"${p === page ? ' aria-current="page"' : ""} data-i="${i}"><span>${t}</span><span aria-hidden="true">${t}</span></a>`).join("")}</nav>
          <div class="nav__lang"><a href="#">KOR</a><a href="#">ENG</a></div>
          ${btn("Inquiry", "is-dark nav__cta-m", "contact.html")}
        </div></div>
      </div>`;
    const toggle = nav.querySelector(".nav__menu");
    const set = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      // Original: on open, links light up in turn delayed by (i+1)×70ms, and on close they all switch off together
      nav.querySelectorAll(".nav__link").forEach((a) => (a.style.transitionDelay = open ? `${(+a.dataset.i + 1) * 70}ms` : "0ms"));
      if (matchMedia("(max-width: 1120px)").matches) open ? BA.lenis?.stop() : BA.lenis?.start();
    };
    toggle.addEventListener("click", () => set(!nav.classList.contains("is-open")));
    document.addEventListener("pointerdown", (e) => { if (nav.classList.contains("is-open") && !nav.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    document.addEventListener("fx:leave", () => set(false));
    BA.closeMenu = () => set(false);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "foot";
    foot.innerHTML = `
      <div class="wrapper foot__in">
        <div class="foot__cols">
          <div class="foot__form-col">
            <p class="foot__title" data-rise="paragraph" data-label="English news signup title here · two lines">Sign up for<br>project news</p>
            <p class="t-p" style="margin-top:1.5rem" data-rise="paragraph">Your one line here on what the news tells people first when they receive it.</p>
            <form class="foot__form" onsubmit="return false">
              <div class="foot__row fade-el"><div class="field"><input id="f-first" name="first" autocomplete="given-name"><label for="f-first">Name*</label></div><div class="field"><input id="f-last" name="last" autocomplete="family-name"><label for="f-last">Name*</label></div></div>
              <div class="field fade-el"><input id="f-mail" name="mail" type="email" autocomplete="email"><label for="f-mail">Email*</label></div>
              <label class="check fade-el"><i></i><span>Your personal information consent sentence here in about two lines — spot for the policy link.</span></label>
              <button class="foot__send t-link fade-el" type="submit">Send</button>
            </form>
          </div>
          <div class="foot__gap"></div>
          <div class="foot__menu"><ul class="foot__list t-p">${links.map(([h, t]) => `<li class="fade-el"><a href="${h}">${t}</a></li>`).join("")}</ul><a class="foot__priv t-p fade-el" href="#">Privacy Policy</a></div>
          <div class="foot__social"><ul class="foot__list t-p"><li class="fade-el"><a href="#">Social Media</a></li><li class="fade-el"><a href="#">Professional network</a></li><li class="fade-el"><a href="#">Brand</a></li></ul></div>
          <div class="foot__gap"></div>
          <div class="foot__legal"><p class="t-small" data-rise="paragraph">Your notice paragraph goes here — a note that the exterior and details after completion may differ slightly from the renderings, and the unit numbering criteria, in four or five lines. Keep it close to the original length.</p>
            <div class="foot__contact t-small"><span>Sales Contact</span><a href="#">+00 00 000 00 00</a></div></div>
        </div>
      </div>
      <div class="foot__pic" data-slot="footer-building">
        <div class="ph no-label foot__sky"></div>
        <div class="foot__front"><div class="ph" data-label="Full view of the completed building · lights on in every window at dusk · row of trees in front, wide-angle landscape shot from below"></div></div>
      </div>
      <div class="foot__base"><div class="wrapper"><p class="t-small">0000<br>All rights reserved.</p><p class="t-h1" data-rise="paragraph" data-label="Your complex name in English here">Project Name</p></div></div>`;
  }

  // A link to the current page (same address, no hash) does not reload — like the original Next Link, only the menu closes
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    if (a.origin === location.origin && a.pathname === location.pathname && !a.hash) { e.preventDefault(); BA.closeMenu?.(); }
  }, true);

  const veil = document.querySelector('[data-slot="cursor"]');
  if (veil) veil.className = "cursor-threads";

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Lenis 1.3.23 — original settings (smoothWheel · duration 2 · touch uses default scroll)
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ smoothWheel: true, duration: 2 });
    BA.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"], a[href^="index.html#"]');
      if (!a) return;
      const id = a.getAttribute("href").split("#")[1];
      const to = id && document.getElementById(id);
      if (!to) return;
      e.preventDefault();
      BA.closeMenu?.();
      lenis.scrollTo(to, { offset: 0 });
    });
  }

  // Below 1120px, the pill hides upward on scroll down and shows on scroll up (the inner 80px is always visible)
  if (nav) {
    let last = scrollY;
    const onScroll = () => {
      const y = BA.lenis ? BA.lenis.scroll : scrollY;
      if (nav.classList.contains("is-open")) return;
      nav.classList.toggle("is-hidden", y >= 80 && y > last);
      last = y;
    };
    BA.lenis ? BA.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
  }

  const mm = gsap.matchMedia();
  // Title rise — original AnimatedText: titles by character (2rem · .025 · .5s late), body by word (1rem · .06), .9s power3.out, when the section reaches the bottom of the screen
  const rise = () => {
    document.querySelectorAll("[data-rise]").forEach((el) => {
      const heading = el.dataset.rise !== "paragraph";
      const split = new SplitText(el, { type: heading ? "chars,words" : "words", wordsClass: "word-wrap", charsClass: "char-wrap" });
      el.classList.add("is-split");
      if (reduce) return;
      gsap.from(heading ? split.chars : split.words, {
        opacity: 0, x: 0, y: heading ? "2rem" : "1rem", delay: heading ? +(el.dataset.delay ?? 0.5) : +(el.dataset.delay ?? 0),
        duration: 0.9, ease: "power3.out", stagger: heading ? 0.025 : 0.06,
        scrollTrigger: { trigger: el, start: "top bottom", toggleActions: "play none none none" },
      });
    });
  };
  BA.rise = rise;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (foot) {
      gsap.from(foot.querySelectorAll(".fade-el"), { opacity: 0, y: "2rem", x: "-2rem", duration: 1, stagger: 0.1, ease: "power1.out", scrollTrigger: { trigger: foot.querySelector(".foot__in"), start: "top bottom" } });
      gsap.to(foot.querySelector(".foot__front"), { y: "10rem", ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true } });
    }
  });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // About 900vh stage (Home · Business space) — the shape of the two windows is changed by the morph-clip-scrub part, and here the window size · position · text screen · progress line are carried over with original values
  BA.intro = (root, o = {}) => {
    if (!root || reduce) return;
    // About — original values: window group appears 0~.1, type·size·position .15~.48, disappears .68~.78, text at screen 0~22%·33~60%·75%~end
    const scroller = $(".ba-intro__scroller", root);
    const wrap = $(".ba-intro__wrap", root);
    const W = innerWidth;
    const sizes = o.sizes || {
      tablet: { w1: "30vh", h1: "35vh", r1: "0", t1: "5vh", w2: "42vh", h2: "42vh", l2: "-2vh", b2: "55vh" },
      laptop: { w1: "15rem", h1: "20rem", r1: "16.66%", t1: "14%", w2: "26.375rem", h2: "26.188rem", l2: "0", b2: "20%" },
      desktop: { w1: "20rem", h1: "27rem", r1: "16.66%", t1: "14%", w2: "35rem", h2: "35rem", l2: "0", b2: "20%" },
    };
    const size = sizes[W <= 1120 ? "tablet" : W <= 1440 ? "laptop" : "desktop"];
    const bands = o.bands || [[0, 0.22], [0.33, 0.6], [0.75]];
    const show = { opacity: 1, y: 0, x: 0, filter: "blur(0px)", ease: "power1.inOut", pointerEvents: "auto", overwrite: "auto" };
    const hide = { opacity: 0, y: "2rem", filter: "blur(4px)", ease: "power1.inOut", pointerEvents: "none", overwrite: "auto" };
    const s1 = $(".ba-screen--1", root), s2 = $(".ba-screen--2", root), s3 = $(".ba-screen--3", root);
    const pre = new SplitText($('[data-split="chars"]', s1), { type: "chars,words" });
    const h1w = new SplitText($('[data-split="words"]', s1), { type: "words" });
    const h2w = new SplitText($$('[data-split="words"]', s2), { type: "words" });
    const h3c = new SplitText($('[data-split="chars"]', s3), { type: "chars,words" });
    const p3 = new SplitText($('[data-split="words"]', s3), { type: "words" });
    const b1 = $$('[data-split="block"]', s1), b2 = $$('[data-split="block"]', s2), l3 = $$('[data-split="block"]', s3);
    gsap.set([...pre.chars, ...h1w.words, ...h2w.words, ...h3c.chars, ...p3.words, ...b1, ...b2, ...l3], hide);
    gsap.set(wrap, { scale: 1.1, filter: "blur(4px)", opacity: 0 });
    const at = (k) => `${100 * k}% top`;
    const T = 0.33, M = 0.15;
    const tl = gsap.timeline({ scrollTrigger: { trigger: scroller, start: "top top", end: "bottom bottom", scrub: true } });
    tl.to(wrap, { scale: 1, filter: "blur(0px)", opacity: 1, ease: "power1.inOut", duration: 0.1 }, 0)
      .to($(".ba-frame--1", root), { width: size.w1, right: size.r1, top: size.t1, height: size.h1, ease: "power1.inOut", duration: T }, M)
      .to($(".ba-frame--2", root), { width: size.w2, left: size.l2, bottom: size.b2, height: size.h2, ease: "power1.inOut", duration: T }, M)
      .to(wrap, { xPercent: W <= 1120 ? 0 : (o.shift ?? -100), ease: "power1.inOut", duration: T }, M)
      .to(wrap, { scale: 1.1, filter: "blur(4px)", opacity: 0, ease: "power1.inOut", duration: 0.1 }, 0.68)
      .to({}, { duration: 1 - 0.68 - 0.1 });
    const st = o.stagger || {};
    const t1 = gsap.timeline({ paused: true })
      .to(pre.chars, { ...show, duration: 0.7, stagger: st.pre ?? 0.1 }, 0).to(h1w.words, { ...show, duration: 0.7, stagger: 0.05 }, 0);
    if (b1.length) t1.to(b1, { ...show, duration: 0.7 }, 0);
    const t2 = gsap.timeline({ paused: true }).to(h2w.words, { ...show, duration: 0.7, stagger: st.two ?? 0.05 }, 0);
    if (b2.length) t2.to(b2, { ...show, duration: 0.7 }, 0);
    const t3 = gsap.timeline({ paused: true })
      .to(h3c.chars, { ...show, duration: 0.7, stagger: st.three ?? 0.05 }, 0).to(p3.words, { ...show, duration: st.para ?? 0.9, stagger: st.three ?? 0.05 }, 0);
    if (l3.length) t3.to(l3, { ...show, duration: 0.9 }, 0);
    const band = (t, start, end) => {
      const st = ScrollTrigger.create({ trigger: scroller, start, end, onEnter: () => t.play(), onLeave: () => t.reverse(), onEnterBack: () => t.play(), onLeaveBack: () => t.reverse() });
      if (st.isActive) t.play();
    };
    band(t1, at(bands[0][0]), at(bands[0][1]));
    band(t2, at(bands[1][0]), at(bands[1][1]));
    band(t3, at(bands[2][0]), "bottom top");
    const nums = $$(".ba-progress__nums span", root);
    gsap.set(nums[0], { y: 0, opacity: 1, filter: "blur(0px)" });
    gsap.set(nums.slice(1), { y: "1rem", opacity: 0, filter: "blur(4px)" });
    const out = { y: "-1rem", opacity: 0, filter: "blur(4px)", ease: "power1.inOut", duration: 0.14 };
    const inn = { y: 0, opacity: 1, filter: "blur(0px)", ease: "power1.inOut", duration: 0.14 };
    gsap.timeline({ scrollTrigger: { trigger: scroller, start: "top top", end: "bottom bottom", scrub: true } })
      .to($(".ba-progress__fill", root), { width: "100%", ease: "none", duration: 1 }, 0)
      .to(nums[0], out, 0.33).to(nums[1], inn, 0.33)
      .to(nums[1], out, 0.75).to(nums[2], inn, 0.75);
    gsap.to($(".ba-intro__leafs", root), { repeat: -1, yoyo: true, duration: 4, ease: "power1.inOut", rotate: 5 });
    gsap.to($(".ba-intro__parallax", root), { y: "10rem", ease: "power1.inOut", scrollTrigger: { trigger: scroller, start: () => `bottom-=${innerHeight} top`, end: "bottom top", scrub: true } });

  };

  // Subpage hero — while the background passes the screen, +20rem (applied after .5s), and the down arrow repeatedly drops in from above and exits below
  BA.subHero = (root) => {
    if (!root || reduce) return;
    setTimeout(() => gsap.to(root.querySelector(".sub-hero__bg"), { top: "+=20rem", ease: "power1.inOut", scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } }), 500);
    const arrow = root.querySelector(".arrow-icon");
    if (arrow) gsap.timeline({ repeat: -1 }).fromTo(arrow, { y: "-0.5rem", opacity: 0 }, { y: 0, opacity: 1 }).to(arrow, { y: "0.5rem", opacity: 0 });
  };

  // List — hovering a row attaches a bar at 80% of the row height (.3s), pressing leaves the chosen row standing tilted and swaps detail and photo .3s later
  BA.lists = () => {
  $$("[data-list]").forEach((list) => {
    const bar = $(".ba-list__bar", list), items = $$(".ba-list__item", list);
    const sec = list.closest("section");
    const details = $$(".ba-detail", sec), slides = $$(".ba-slide", $("[data-slides]", sec) || sec);
    const pins = list.dataset.list === "around" ? $$(".ba-pin:not(.is-home)", sec) : [];
    let cur = items.findIndex((i) => i.classList.contains("is-active"));
    const place = (it) => {
      const h = it.offsetHeight, hh = 0.8 * h;
      bar.style.height = `${hh}px`;
      bar.style.transform = `translateY(${it.offsetTop + (h - hh) / 2}px)`;
      bar.style.opacity = "1";
    };
    const pick = (i) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      details.forEach((d, k) => d.classList.toggle("is-on", k === i));
      slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
    };
    items.forEach((it, i) => {
      it.addEventListener("pointerenter", () => {
        place(it);
        if (pins.length) pins.forEach((p, k) => p.classList.toggle("is-active", k === i));
      });
      it.addEventListener("focus", () => place(it));
      it.addEventListener("click", () => pick(i));
    });
    list.addEventListener("pointerleave", () => {
      bar.style.opacity = "0";
      pins.forEach((p) => p.classList.remove("is-active"));
    });
  });

  // Photo slide arrows — move along with the selected row
  $$("[data-slides]").forEach((box) => {
    const sec = box.closest("section"), items = $$(".ba-list__item", sec);
    const go = (d) => {
      const n = items.length, cur = items.findIndex((i) => i.classList.contains("is-active"));
      items[(cur + d + n) % n]?.click();
    };
    $(".is-prev", box)?.addEventListener("click", () => go(-1));
    $(".is-next", box)?.addEventListener("click", () => go(1));
  });

  };

  document.fonts?.ready.then(rise) ?? rise();
})();
