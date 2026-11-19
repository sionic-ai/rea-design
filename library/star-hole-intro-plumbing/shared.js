// Common to all pages: draws the header, drawer, intro, interview/blog/contact tail and footer in one place and wires up the motion.
// Original values: Lenis lerp .2 · intro white curtain .4s (delay .5) → star hole 1s power4.in to 20k px · letters y100%→0 stagger .03 power2.out
// · transition #page opacity 0 .6s expo.inOut (delay .3, 1 at drawer) → next page .6s power4.out (delay .1) · hover roll .6s power1.out/.4s linkhover
// · parallax scale 1.15 + yPercent 5→-5 scrub 2 · Hero scale 1→1.2 scrub 1.5 · interview 5s auto · 1.5s transition.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("linkhover", ".115,.405,.24,1");

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) root.classList.add("vp-reduced");
  const page = document.body.dataset.page || "home";
  const VP = (window.VP = { reduced, lenis: null });

  const star = (cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.9 7.4 4.6 11.1 12 12-7.4.9-11.1 4.6-12 12-.9-7.4-4.6-11.1-12-12C7.4 11.1 11.1 7.4 12 0Z"/></svg>`;
  const plus = '<svg class="vp-plus" viewBox="0 0 12 12" aria-hidden="true"><path d="M5.4 0h1.2v12H5.4zM0 5.4h12v1.2H0z"/></svg>';
  const arrow = '<svg class="vp-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M0 5.4h9.6L6.3 2.1l.85-.85L11.9 6l-4.75 4.75-.85-.85 3.3-3.3H0z"/></svg>';
  const chev = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const up = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 11V1M2 5l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  // Newly drawn placeholder instead of the original logo: orbit ring + four-point star
  const mark = `<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="15" cy="19" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 13l7 14 7-14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path fill="currentColor" d="M27 0c.5 4 2.5 6 6.5 6.5-4 .5-6 2.5-6.5 6.5-.5-4-2.5-6-6.5-6.5C24.5 6 26.5 4 27 0Z"/></svg>`;
  const logo = `<a class="vp-logo" href="index.html" aria-label="Home">${mark}<span class="vp-logo__word">WORDMARK</span></a>`;
  VP.icons = { star, plus, arrow, chev };

  const roll = (t, cls = "") => `<span class="${cls}" data-roll>${t}</span>`;
  const MENU = [
    { t: "About us", href: "about.html", p: "about" },
    { t: "Service", href: "service.html", p: "service", subs: ["Business 1", "Business 2"] },
    { t: "Company", href: "about.html#strength", p: "company" },
    { t: "Recruit", href: "recruit.html", p: "recruit", subs: ["Message", "View in numbers", "Application guidelines", "Interview", "Interview 1", "Interview 2"], subHref: ["recruit.html#message", "recruit.html#data", "recruit.html#requirements", "detail.html", "detail.html", "detail.html"] },
    { t: "Blog", href: "news.html", p: "news" },
  ];

  /* ---------- Header ---------- */
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("vp-head");
    // Pages that start with a photo or night sky (data-head="light") is white text on the Hero, and the other subpages are dark ink from the start
    if (page !== "home" && document.body.dataset.head !== "light") head.classList.add("is-lower");
    const gnav = MENU.map((m) => {
      if (!m.subs) return `<li class="vp-gnav__item"><a class="vp-gnav__link" href="${m.href}">${roll(m.t)}</a></li>`;
      const links = m.subs.map((s, i) => `<li><a href="${m.subHref ? m.subHref[i] : m.href}">${roll(s)} ${chev.replace("<svg", '<svg style="transform:rotate(-90deg)"')}</a></li>`).join("");
      return `<li class="vp-gnav__item"><button class="vp-gnav__link" type="button">${m.t} ${chev}</button>
        <nav class="vp-drop"><div class="vp-drop__bg"><div class="vp-drop__box"><ul>${links}</ul></div></div></nav></li>`;
    }).join("");
    head.innerHTML = `<div class="vp-head__bar">
        ${logo}
        <ul class="vp-gnav">${gnav}</ul>
        <a class="vp-contact" href="#contact">${roll("Contact")} ${plus}</a>
        <button class="vp-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span class="vp-burger__in"><i></i><i></i><i></i></span></button>
      </div>`;
    const big = (t, href) => `<a class="big" href="${href}">${roll(t)}</a>`;
    const col = (items) => `<ul>${items.map((m) => `<li data-item>${big(m.t, m.href)}${(m.subs || []).map((s, i) => `<a class="sub" href="${m.subHref ? m.subHref[i] : m.href}">${roll(s)}</a>`).join("")}</li>`).join("")}</ul>`;
    head.insertAdjacentHTML("afterend", `
      <div class="vp-drawer" aria-hidden="true" data-slot="menu-drawer" data-lenis-prevent>
        <div class="vp-drawer__bg"></div>
        <div class="vp-drawer__box" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="vp-drawer__top"><button class="vp-burger" type="button" aria-label="Close Menu" aria-expanded="true" style="display:flex"><span class="vp-burger__in"><i></i><i></i><i></i></span></button></div>
          <div class="vp-drawer__body"><nav class="vp-drawer__nav">
            ${col([{ t: "Home", href: "index.html" }, MENU[0], MENU[1], MENU[2]])}
            ${col([MENU[3]])}
            ${col([{ t: "News", href: "news.html" }, MENU[4], { t: "Contact", href: "#contact" }])}
          </nav></div>
          <div class="vp-drawer__foot"><a href="#" data-item>${roll("Privacy Policy")}</a><span class="vp-drawer__sns" data-item></span></div>
        </div>
      </div>`);
  }

  /* ---------- Interview · blog · contact tail, footer ---------- */
  const title = (en, ko, cls = "") => `<h2 class="${cls}" data-slideup><div><span class="vp-title__en">${en}</span></div><div><span class="vp-title__ko">${ko}</span></div></h2>`;
  VP.title = title;
  const sq = (text, label, href) => `<a class="vp-sq vp-sweep" href="${href}"><span class="vp-sq__fig"><span class="wf-img" data-label="${label}"></span></span><span class="vp-sq__in"><span class="vp-sq__text">${text}</span>${plus}</span></a>`;
  VP.sq = sq;

  document.querySelectorAll('[data-vp="interview"]').forEach((el) => {
    const people = [
      ["Person · worker in work clothes standing beside a park bench · overcast daylight · portrait 3:4", "Your one person’s pledge here<br>Set in two lines."],
      ["Person · staff member smiling in front of a work site, upper body · backlit · portrait 3:4", "The second person’s pledge here<br>Set in two lines."],
      ["Person · staff member sitting by an office window · soft window light · portrait 3:4", "Your third person’s pledge here<br>Set in two lines."],
    ];
    el.classList.add("vp-iv");
    el.dataset.slot = "interview-slider";
    el.innerHTML = `<div class="vp-wrap"><div class="vp-iv__inner">
      ${title("Interview", "Interview", "vp-iv__title")}
      <div class="vp-iv__slider" data-iv>
        <div class="splide vp-iv__main" data-iv-main aria-label="Interview"><div class="splide__track"><ul class="splide__list">
          ${people.map((p, i) => `<li class="splide__slide"><div class="vp-iv__slide">
            <a class="vp-iv__fig" href="detail.html"><span class="wf-img" data-label="${p[0]}"></span></a>
            <div class="vp-iv__body"><p class="vp-iv__catch">${p[1]}</p><p class="vp-iv__pos ko">Department name 0${i + 1}</p><span class="vp-iv__year">Joined in 0000</span>
              <div class="vp-iv__btn"><a class="vp-btn vp-sweep" href="detail.html">View more ${plus}</a></div></div>
            <a class="vp-iv__cover" href="detail.html" aria-label="Interview ${i + 1} View"></a>
          </div></li>`).join("")}
        </ul></div></div>
        <div class="splide vp-iv__side" data-iv-side aria-hidden="true"><div class="splide__track"><ul class="splide__list">
          ${[1, 2, 0].map((n) => `<li class="splide__slide vp-iv__thumb"><span class="wf-img" data-label="${people[n][0].replace("Vertical 3:4", "Small portrait 3:4")}"></span></li>`).join("")}
        </ul></div></div>
      </div>
      <div class="vp-iv__bottom">
        ${sq("Application guidelines", "Site prop · blueprints and hard hat on a desk · top view · landscape", "recruit.html#requirements")}
        ${sq("Apply", "Person · worker in uniform seen from behind · clear sky · landscape", "#contact")}
      </div>
    </div></div>`;
  });

  document.querySelectorAll('[data-vp="blog"]').forEach((el) => {
    const posts = [
      ["People · two people talking over a laptop at an office table · window light · landscape 4:3", "Put a two-line post title here. A title that runs a bit long"],
      ["Team · five staff standing side by side in a field · overcast day · landscape 4:3", "Your second post title goes here."],
      ["Site · Hands and tools during plumbing work · Natural light · Landscape 4:3", "Your third post title goes here."],
      ["Landscape · front yard of a finished house · late afternoon · landscape 4:3", "Your fourth article title here, in two lines."],
    ];
    el.classList.add("vp-blog");
    el.dataset.slot = "blog-slider";
    el.innerHTML = `<div class="vp-wrap">
      ${title("Blog", "Blog", "vp-blog__title")}
      <div class="splide vp-blog__slider" data-blog aria-label="Blog">
        <div class="splide__track"><ul class="splide__list">
          ${posts.map((p, i) => `<li class="splide__slide"><article class="vp-card"><div class="vp-card__fig"><span class="wf-img" data-label="${p[0]}"></span></div>
            <time class="vp-card__time">2026.0${8 - i}.0${i + 1}</time><h3 class="vp-card__title">${p[1]}</h3><div class="vp-card__cat"><span class="vp-pill">Category 1</span></div></article></li>`).join("")}
        </ul></div>
        <div class="vp-progress"><i></i></div>
        <div class="vp-blog__more"><a class="vp-btn vp-sweep" href="news.html">View more ${plus}</a></div>
      </div>
    </div>`;
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.insertAdjacentHTML("beforebegin", `
      <aside class="vp-ask" id="contact" data-slot="contact-cta"><div class="vp-wrap">
        <p class="vp-ask__body">Your two-line invitation to get in touch here,<br>One line inviting visitors to ask questions easily via the form.</p>
        <a class="vp-ask__link" href="#contact"><span class="vp-ask__text">Talk w<span class="vp-ask__i">ı${star("vp-ask__star")}</span>th us</span><svg class="vp-ask__arrow" viewBox="0 0 12 12"><path d="M1 6h10M7 2l4 4-4 4" fill="none" stroke="currentColor"/></svg></a>
      </div></aside>`);
    const navCol = (items) => `<ul>${items.map((m) => `<li><a class="big" href="${m.href}">${roll(m.t)}</a>${m.subs ? `<ul class="subs">${m.subs.map((s, i) => `<li><a href="${m.subHref ? m.subHref[i] : m.href}">${roll(s)}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>`;
    foot.classList.add("vp-foot");
    foot.innerHTML = `<div class="vp-foot__top"><div class="vp-foot__inner">
        <div><div class="vp-foot__logo">${logo}</div>
          <p class="vp-foot__corp">Company name slot</p>
          <address class="vp-foot__addr">〒000-0000<br>Your one-line address here 00-00<br>TEL. 0000-00-0000</address>
          <span class="vp-foot__sns" aria-label="SNS"></span></div>
        <nav class="vp-foot__nav">
          ${navCol([MENU[0], MENU[1]])}
          ${navCol([{ t: "Company", href: "about.html#strength", subs: ["Greeting", "Company overview", "History", "Directions"] }])}
          ${navCol([MENU[3]])}
          ${navCol([{ t: "News", href: "news.html" }, MENU[4], { t: "Contact", href: "#contact" }])}
        </nav>
      </div>
      <a class="vp-foot__top-btn" href="#top" aria-label="Back to top">${up}</a></div>
      <div class="vp-foot__bottom"><div class="vp-foot__bottom-in"><p class="vp-foot__copy">© WORDMARK All Rights Reserved.</p><a class="vp-foot__policy" href="#">${roll("Privacy Policy")}</a></div></div>`;
  }

  /* ---------- Smooth scroll ---------- */
  // Original: Lenis 1.0.42 · lerp .2 (.8 on one browser only) · runs on its own rAF and calls ScrollTrigger.update on each scroll
  if (!reduced && window.Lenis) {
    const ua = navigator.userAgent.toLowerCase();
    const safari = ua.includes("safari") && !ua.includes("chrome");
    const lenis = (VP.lenis = new Lenis({ lerp: safari ? 0.8 : 0.2, wheelMultiplier: 1 }));
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const goTop = () => (VP.lenis ? VP.lenis.scrollTo(0) : window.scrollTo(0, 0));
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goTop(); }));
  document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#top"])').forEach((a) =>
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      if (document.querySelector(".vp-drawer.is-open")) closeDrawer();
      VP.lenis ? VP.lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView();
    })
  );

  /* ---------- Text roll hover ---------- */
  document.querySelectorAll("[data-roll]").forEach((el) => {
    const html = el.innerHTML;
    el.innerHTML = `<span class="r1" aria-hidden="true">${html}</span><span class="r2" aria-hidden="true">${html}</span>`;
    el.setAttribute("aria-label", el.textContent.slice(0, el.textContent.length / 2));
    const host = el.closest("a, button, article") || el;
    if (reduced) return;
    // Original: the first set of curves "expo.inout"Written in lowercase, so GSAP can’t find it and it spins with the default power1.out — the spin is left as it is. Fingers get the same spin via touchstart
    const run = () => {
      gsap.fromTo(el.querySelector(".r1"), { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
      gsap.fromTo(el.querySelector(".r2"), { y: "105%" }, { y: "0%", duration: 0.4, ease: "linkhover" });
    };
    host.addEventListener("mouseenter", run);
    host.addEventListener("touchstart", run, { passive: true });
  });

  /* ---------- Once when visible ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const d = parseFloat(e.target.dataset.delay || 0) * 1000;
    setTimeout(() => e.target.classList.add("is-in"), d);
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -20% 0px" });
  document.querySelectorAll("[data-slideup], [data-reveal]").forEach((el) => io.observe(el));

  /* ---------- Text splitting (hero etc.) ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map((c) => `<span data-ch aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  const chars = document.querySelectorAll("[data-ch]");
  if (chars.length && !reduced) gsap.set(chars, { yPercent: 100 });
  // Letters of lines hidden by width (two PC·phone copy lines) must be left out of the order so the visible lines rise on time
  const riseChars = () => {
    if (!chars.length || reduced) return;
    const shown = [...chars].filter((c) => c.offsetParent !== null);
    gsap.to(shown, { yPercent: 0, ease: "power2.out", stagger: 0.03 });
    gsap.set([...chars].filter((c) => c.offsetParent === null), { yPercent: 0 });
  };

  /* ---------- Photo parallax · zoom ---------- */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-parallax]").forEach((fig) => {
      const img = fig.querySelector(".wf-img");
      gsap.set(img, { scale: 1.15, transformOrigin: "center center" });
      gsap.fromTo(img, { yPercent: 5 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 2 } });
    });
    gsap.utils.toArray("[data-expand]").forEach((fig) => {
      gsap.fromTo(fig.querySelector(".wf-img"), { scale: 1 }, { scale: 1.2, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 1.5 } });
    });
  });

  /* ---------- Header color: below the hero it is ink-dark, over dark sections it is white ---------- */
  if (head) {
    const hh = () => head.offsetHeight;
    const notTop = document.querySelector("[data-not-top]");
    if (notTop) ScrollTrigger.create({ trigger: notTop, start: () => `-${hh()}px top`, endTrigger: document.body, end: "bottom top", toggleClass: { targets: head, className: "is-scrolled" } });
    document.querySelectorAll("[data-is-dark]").forEach((s) =>
      ScrollTrigger.create({ trigger: s, start: () => `-${hh()}px top`, end: () => `bottom ${hh()}px`, toggleClass: { targets: head, className: "is-dark" } })
    );
  }

  /* ---------- Menu Drawer ---------- */
  const drawer = document.querySelector(".vp-drawer");
  let drawerTl = null;
  const burgers = document.querySelectorAll(".vp-burger");
  const setExpanded = (v) => document.querySelectorAll(".vp-head .vp-burger").forEach((b) => b.setAttribute("aria-expanded", v));
  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    VP.lenis && VP.lenis.stop();
    setTimeout(() => setExpanded(true), 200);
    drawerTl = gsap.fromTo(drawer.querySelectorAll("[data-item]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: 0.04 });
  }
  function closeDrawer(cb) {
    drawerTl && drawerTl.pause();
    gsap.fromTo(drawer.querySelectorAll("[data-item]"), { opacity: 1, y: 0 }, {
      opacity: 0, y: -20, ease: "power1.out", duration: 0.3, stagger: 0.002,
      onComplete: () => {
        drawer.setAttribute("aria-hidden", "true");
        setExpanded(false);
        setTimeout(() => { drawer.classList.remove("is-open"); VP.lenis && VP.lenis.start(); typeof cb === "function" && cb(); }, 600);
      },
    });
  }
  if (drawer) {
    drawer.querySelectorAll("li").forEach((li) => li.setAttribute("data-item", ""));
    burgers.forEach((b) => b.addEventListener("click", () => (drawer.classList.contains("is-open") ? closeDrawer() : openDrawer())));
    addEventListener("keydown", (e) => e.key === "Escape" && drawer.classList.contains("is-open") && closeDrawer());
  }

  /* ---------- Page transition: fades out the current page over .6s and navigates, turns back on when arrived ---------- */
  const pageEl = document.querySelector(".vp-page");
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || a.target === "_blank") return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || reduced) return;
      e.preventDefault();
      sessionStorage.setItem("vp-inside", "1");
      const fromDrawer = a.closest(".vp-drawer");
      gsap.to(pageEl, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: fromDrawer ? 1 : 0.3, onComplete: () => (location.href = a.href) });
      if (fromDrawer) closeDrawer();
    });
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(pageEl, { opacity: 1 }));

  /* ---------- First-visit intro (only when arriving from outside or on reload) ---------- */
  const inside = sessionStorage.getItem("vp-inside") === "1";
  sessionStorage.removeItem("vp-inside");
  const onReady = () => document.dispatchEvent(new CustomEvent("vp:ready"));
  // The original starts at window load. The letter rise is a separate gsap.to outside the timeline, so it starts right away before the curtain lifts
  // The curtain is laid over right now (so the screen doesn’t show through before load) — the original data-intro is also in the document from the start.
  // A page arriving from inside only gets a white veil covering it, lifted at .4s (original intro__overlay-bg)
  if (!reduced && inside) document.body.insertAdjacentHTML("beforeend", '<div class="vp-intro" aria-hidden="true"><div class="vp-intro__white"></div></div>');
  if (!reduced && !inside) {
    const starSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c.9 7.4 4.6 11.1 12 12-7.4.9-11.1 4.6-12 12-.9-7.4-4.6-11.1-12-12C7.4 11.1 11.1 7.4 12 0Z"/></svg>');
    // The white veil sits under the dark plate — at first it looks white only inside the star holes, then it peels away and the page shows through (original intro__overlay-bg sits before the DOM)
    document.body.insertAdjacentHTML("beforeend", `<div class="vp-intro" aria-hidden="true" style="--star:url('data:image/svg+xml,${starSvg}')">
      <div class="vp-intro__white"></div>
      <div class="vp-intro__night"><div class="vp-intro__rings">
        <div class="vp-ring" style="--d:.664;--from:180deg;--t:20s"><i class="vp-ring__line"></i><i class="vp-ring__dot"></i></div>
        <div class="vp-ring" style="--d:.465;--from:0deg;--t:15s"><i class="vp-ring__line"></i><i class="vp-ring__dot"></i></div>
        <div class="vp-ring" style="--d:.305;--from:30deg;--t:6s"><i class="vp-ring__line"></i><i class="vp-ring__dot"></i></div>
        <div class="vp-ring" style="--d:.226;--from:45deg;--t:3s"><i class="vp-ring__line"></i><i class="vp-ring__dot"></i></div>
      </div></div></div>`);
  }
  const startIntro = () => {
  if (reduced) {
    gsap.set(pageEl, { opacity: 1 });
    onReady();
  } else if (inside) {
    const veil = document.querySelector(".vp-intro");
    if (veil) gsap.to(veil.firstElementChild, { opacity: 0, duration: 0.4, ease: "power1.out", onComplete: () => veil.remove() });
    gsap.to(pageEl, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out", onComplete: onReady });
    riseChars();
  } else {
    const intro = document.querySelector(".vp-intro");
    const night = intro.querySelector(".vp-intro__night");
    // As in the original, the star sits at the lower right of the circle (diameter min(.9vh,.9vw)) — ratios to the circle size are .1135, .1786, .1102.
    const geo = () => {
      const c = Math.min(innerHeight * 0.9, innerWidth * 0.9);
      return { x: innerWidth / 2 + c / 2 - c * 0.1135, y: innerHeight / 2 + c / 2 - c * 0.1786, s: c * 0.1102 };
    };
    const paint = (s) => {
      const g = geo();
      night.style.webkitMaskSize = night.style.maskSize = `${s}px ${s}px, 100% 100%`;
      night.style.webkitMaskPosition = night.style.maskPosition = `${g.x - s / 2}px ${g.y - s / 2}px, 0 0`;
    };
    const st = { size: geo().s };
    paint(st.size);
    gsap.set(pageEl, { opacity: 1 });
    gsap.timeline()
      .to(intro.querySelector(".vp-intro__white"), { opacity: 0, duration: 0.4, delay: 0.5, ease: "power1.out" })
      .fromTo(st, { size: () => geo().s }, { size: 20000, duration: 1, ease: "power4.in", onUpdate: () => paint(st.size), onComplete: () => { intro.remove(); onReady(); } }, "+=0.2");
    riseChars();
  }
  };
  if (document.readyState === "complete") startIntro();
  else addEventListener("load", startIntro);

  /* ---------- Interview slider (Splide): PC fades 1.5s every 5s, 1024 and below loop · center aligned · arrows. The small photo row on the right moves along via sync ---------- */
  const arrowPath = "M16.2 11.2l8.8 8.8-8.8 8.8-.9-.9 7.9-7.9-7.9-7.9z";
  document.querySelectorAll("[data-iv]").forEach((box) => {
    if (!window.Splide) return;
    const mq = matchMedia("(max-width: 1024px)");
    let main, side;
    const mount = () => {
      if (main) { main.destroy(); side.destroy(); }
      const sp = mq.matches;
      main = new Splide(box.querySelector("[data-iv-main]"), {
        perPage: 1, perMove: 1, gap: 60, type: sp ? "loop" : "fade", rewind: true, autoplay: !reduced, interval: 5000, speed: 1500,
        pauseOnFocus: false, updateOnMove: true, arrows: sp, arrowPath,
        breakpoints: { 1024: { pagination: false, focus: "center" }, 767: { gap: 25, fixedWidth: "320px", focus: "center" }, 575: { perPage: 1, perMove: 1, rewind: false, fixedWidth: "80%", focus: "center" } },
      });
      side = new Splide(box.querySelector("[data-iv-side]"), {
        arrows: false, pagination: false, perPage: 2, perMove: 1, gap: 26, type: "loop", autoplay: !reduced, interval: 5000, speed: 0,
        pauseOnFocus: false, updateOnMove: true, drag: false,
      });
      main.sync(side);
      main.mount();
      side.mount();
    };
    mount();
    mq.addEventListener("change", mount);
  });

  /* ---------- Blog row (Splide): 400px card drag, progress bar = (current cell+1)/(last cell+1). On entry the whole row slides in from off-screen left over 1.7s ---------- */
  document.querySelectorAll("[data-blog]").forEach((box) => {
    if (!window.Splide) return;
    const track = box.querySelector(".splide__track");
    if (!reduced) {
      gsap.set(track, { x: "-100%" });
      gsap.to(track, { x: 0, duration: 1.7, ease: "power3.out", scrollTrigger: { trigger: box.closest(".vp-blog") || box, start: "top 75%" } });
    }
    const bar = box.querySelector(".vp-progress i");
    const sl = new Splide(box, { arrows: false, pagination: false, fixedWidth: "400px", gap: "30px", breakpoints: { 575: { fixedWidth: "300px", gap: "20px" } } });
    sl.on("mounted move", () => {
      const end = sl.Components.Controller.getEnd() + 1;
      bar.style.width = `${Math.min((sl.index + 1) / end, 1) * 100}%`;
    });
    sl.mount();
  });

  /* ---------- Side contents: lights up the cell passing through the screen center ---------- */
  const navLinks = document.querySelectorAll("[data-currentnav] a[href^='#']");
  if (navLinks.length) {
    const nio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-50% 0px" });
    navLinks.forEach((a) => { const t = document.querySelector(a.getAttribute("href")); t && nio.observe(t); });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
