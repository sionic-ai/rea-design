// Shared by all pages — inserts the header, drawer, contact band and footer, and attaches the first-entry cover, smooth scroll (Lenis), scroll reveal, parallax photos and header color over dark sections.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const page = document.body.dataset.page || "";
  const swap = 'data-fx="link-swap-hover" data-fx-link-swap-hover="dur: .6; ease: .115,.405,.24,1; out: .8; out-ease: 0.333,0.667,0.667,1; shift: 105; rest: 150; keep: 1; look: solid; focus: off"';
  const nav = [
    ["index.html#about", "Company About", "about"],
    ["index.html#service", "Business details", "service"],
    ["index.html#company", "Company info", "company"],
    ["index.html#recruit", "Hiring Info", "recruit"],
    ["works.html", "Management Record", "works"],
    ["news.html", "News", "news"],
  ];
  const here = (key) => (key === page || (page === "article" && key === "news") ? ' aria-current="page"' : "");
  const logo = (tag = "a") => `<${tag} class="gh-logo" href="index.html" aria-label="First Page" data-label="Logo slot · thin-line two-letter monogram + small English company name below">
      <svg class="gh-logo__mark" viewBox="0 0 66 40" aria-hidden="true"><path d="M27 9.5A15 15 0 1 0 28 30.5V21H17"/><path d="M38 4V36M60 4V36"/><path class="gh-logo__accent" d="M38 20H60"/></svg>
      <span class="gh-logo__name">Brand Name</span></${tag}>`;

  const header = document.createElement("header");
  header.className = "gh-header";
  header.dataset.slot = "header";
  header.innerHTML = `<div class="gh-header__wrap">
    ${logo()}
    <nav class="gh-gnav" aria-label="Main menu"><ul class="gh-gnav__ul">
      ${nav.map(([href, label, key]) => `<li><a class="gh-gnav__link" href="${href}" ${swap}${here(key)}>${label}</a></li>`).join("")}
      <li><a class="gh-gnav__contact" href="contact.html" ${swap}${here("contact")}>Contact Us</a></li>
    </ul></nav>
    <div class="gh-header__ham"><button class="gh-ham" type="button" aria-expanded="false" aria-controls="gh-drawer" data-ham><span class="gh-sr">Open and close menu</span><span class="gh-ham__box"><span class="gh-ham__bar"></span><span class="gh-ham__bar"></span></span></button></div>
  </div>`;

  const drawer = document.createElement("dialog");
  drawer.className = "gh-drawer";
  drawer.id = "gh-drawer";
  drawer.dataset.slot = "drawer-menu";
  drawer.setAttribute("aria-label", "Menu");
  drawer.innerHTML = `<div class="gh-drawer__in">
    <div class="gh-drawer__head"><button class="gh-ham" type="button" aria-expanded="true" data-ham><span class="gh-sr">Close Menu</span><span class="gh-ham__box"><span class="gh-ham__bar"></span><span class="gh-ham__bar"></span></span></button></div>
    <nav class="gh-drawer__nav"><ul>
      ${[["index.html", "First Page", "home"], ...nav, ["contact.html", "Contact Us", "contact"]].map(([href, label, key]) => `<li class="gh-drawer__item"><a class="gh-drawer__link" href="${href}" data-drawer-item data-drawer-close ${swap}${here(key)}>${label}</a></li>`).join("")}
    </ul></nav>
  </div>`;

  const intro = document.createElement("div");
  intro.className = "gh-intro";
  intro.dataset.slot = "loader";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML = `<div class="gh-intro__scene">
    <video class="gh-intro__video" src="media/about.mp4" muted loop playsinline autoplay preload="auto" aria-label="Video slot · macro of a forest with sunlight flickering through leaves · portrait 9:16 · 5.5s loop"></video>
    <div class="gh-intro__blur"></div><div class="gh-intro__shade"></div>
    <p class="gh-intro__catch" data-intro-catch>Your one-line hero text here.</p>
  </div>`;

  const discs = `<svg viewBox="0 0 232 295" aria-hidden="true">
      <path d="M40 200A136 136 0 0 1 232 8Z" fill="currentColor"/><path class="gh-shape__grain" d="M40 200A136 136 0 0 1 232 8Z" fill="url(#gh-grain-fill)"/><path class="gh-shape__shade" d="M40 200A136 136 0 0 1 232 8Z" fill="url(#gh-shade-fill)"/>
      <path d="M192 62A136 136 0 0 1 0 255Z" fill="currentColor"/><path class="gh-shape__grain" d="M192 62A136 136 0 0 1 0 255Z" fill="url(#gh-grain-fill)"/><path class="gh-shape__shade" d="M192 62A136 136 0 0 1 0 255Z" fill="url(#gh-shade-fill)"/>
    </svg>`;

  const aside = document.createElement("aside");
  aside.className = "gh-aside";
  aside.id = "contact";
  aside.dataset.slot = "contact-band";
  aside.innerHTML = `<div class="gh-aside__wrap">
    <div class="gh-aside__card"></div>
    <h2 class="gh-label gh-aside__label">Contact Us</h2>
    <div class="gh-aside__visual"><div class="gh-aside__paper"></div><div class="gh-shape gh-aside__shape">${discs}</div></div>
    <p class="gh-aside__lead">Your one line inviting people to ask anything here.<br>Your second line, inviting people to get in touch.</p>
    <a class="gh-aside__btn" href="contact.html" ${swap}>Contact Us</a>
  </div>`;

  const footer = document.createElement("footer");
  footer.className = "gh-footer";
  footer.dataset.slot = "footer";
  footer.dataset.dark = "";
  footer.innerHTML = `<div class="gh-footer__wrap">
    <div class="gh-footer__company">${logo()}
      <address class="gh-footer__address"><span>Your company name here</span><span>Postal code 00000<br>Your address line here 00-00</span></address>
    </div>
    <nav class="gh-footer__nav" aria-label="Footer Menu">
      <ul class="gh-footer__ul">
        <li><a class="gh-footer__link" href="index.html" ${swap}>First Page</a></li>
        <li><a class="gh-footer__link" href="index.html#about" ${swap}>Company About</a></li>
        <li><a class="gh-footer__link" href="index.html#service" ${swap}>Business details</a></li>
        <li><a class="gh-footer__link is-sub" href="index.html#service-a" ${swap}>Business one name</a></li>
        <li><a class="gh-footer__link is-sub" href="index.html#service-b" ${swap}>Business Two Name</a></li>
      </ul>
      <ul class="gh-footer__ul">
        <li><a class="gh-footer__link" href="index.html#company" ${swap}>Company info</a></li>
        <li><a class="gh-footer__link" href="index.html#recruit" ${swap}>Hiring Info</a></li>
        <li><a class="gh-footer__link" href="works.html" ${swap}>Management Record</a></li>
        <li><a class="gh-footer__link" href="news.html" ${swap}>News</a></li>
        <li><a class="gh-footer__link" href="contact.html" ${swap}>Contact Us</a></li>
      </ul>
    </nav>
    <div class="gh-footer__bottom"><p class="gh-footer__copy">© Company Name Co.,Ltd. All Rights Reserved.</p><a class="gh-footer__privacy" href="#">Privacy policy</a></div>
  </div>`;

  // Speckle and shade fill of the sage-green shape — shared by all shape svgs (color comes from the skin variables)
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("aria-hidden", "true");
  defs.setAttribute("style", "position:absolute;width:0;height:0");
  defs.innerHTML = `<defs>
    <filter id="gh-grain-noise"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .7 0"/></filter>
    <pattern id="gh-grain-fill" width="160" height="160" patternUnits="userSpaceOnUse"><rect width="160" height="160" filter="url(#gh-grain-noise)"/></pattern>
    <linearGradient id="gh-shade-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="gh-stop-hi"/><stop offset="1" class="gh-stop-lo"/></linearGradient>
  </defs>`;

  const pageEl = document.querySelector(".gh-page");
  if (pageEl) {
    pageEl.prepend(drawer, header);
    pageEl.append(aside, footer);
  }
  document.body.prepend(defs, intro);

  // ---------- Smooth scroll — original Lenis 1.3.26 lerp .06 · wheel 1x ----------
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 1 });
    window.ghLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Like the original, the window scrollbar uses OverlayScrollbars — a thin bar that shows only while scrolling (window scroll itself is unchanged, so Lenis and ScrollTrigger still watch the window)
  const os = window.OverlayScrollbarsGlobal?.OverlayScrollbars;
  if (os) {
    try {
      os(document.body, { showNativeOverlaidScrollbars: /iP(hone|ad|od)/.test(navigator.userAgent), scrollbars: { autoHide: "scroll", clickScroll: true }, cancel: { nativeScrollbarsOverlaid: true, body: null } }, {
        updated(_, { updateHints: h }) { if (h.sizeChanged && !h.contentMutation && !h.directionChanged && !h.heightIntrinsicChanged && !h.hostMutation && !h.overflowAmountChanged && !h.overflowEdgeChanged && !h.overflowStyleChanged) ScrollTrigger.refresh(); },
      });
    } catch (e) { /* Even if the bar can’t be hooked, it scrolls with the default scrollbar */ }
  }
  // Same-page anchors go through Lenis in 1s
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const to = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!to) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(to, { duration: 1 }); else to.scrollIntoView();
  });

  // ---------- Drawer — original Drawer: panel grows .4s, items y 20 → 0 .6s (after .3s, .04 stagger) · closing items y −20 .3s (.002 stagger) then close ----------
  const hams = [...document.querySelectorAll("[data-ham]")];
  let opened = false, closing = false, itemsIn = null;
  const items = () => drawer.querySelectorAll("[data-drawer-item]");
  const expanded = (v) => hams.forEach((h) => h.setAttribute("aria-expanded", String(v)));
  const open = () => {
    if (opened) return;
    drawer.classList.remove("is-closing");
    drawer.showModal();
    opened = true;
    expanded(true);
    lenis?.stop();
    itemsIn = gsap.fromTo(items(), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
  };
  const close = () => {
    if (!opened || closing) return;
    closing = true;
    drawer.classList.add("is-closing");
    expanded(false);
    lenis?.start();
    itemsIn?.pause();
    gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -20, ease: "power1.out", duration: 0.3, stagger: { each: 0.002 }, onComplete: () => drawer.close() });
  };
  drawer.addEventListener("close", () => { opened = false; closing = false; drawer.classList.remove("is-closing"); expanded(false); lenis?.start(); });
  drawer.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  drawer.addEventListener("click", (e) => { if (e.target === drawer) close(); });
  hams.forEach((h) => h.addEventListener("click", () => (drawer.open ? close() : open())));
  drawer.querySelectorAll("[data-drawer-close]").forEach((a) => a.addEventListener("click", () => opened && close(), true));

  // ---------- Over dark sections, invert header text and buttons (original data-is-dark, from the section’s --dark-from screen share) ----------
  const darkWatch = () => {
    document.querySelectorAll("[data-dark]").forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: () => `${Math.round((parseFloat(getComputedStyle(sec).getPropertyValue("--dark-from")) || 0) * innerHeight) - header.clientHeight}px top`,
        end: () => `bottom ${header.clientHeight}px`,
        invalidateOnRefresh: true,
        onToggle: (st) => header.classList.toggle("is-dark", st.isActive),
      });
    });
  };

  // ---------- Scroll reveal — original ScrollTrigger classes (IntersectionObserver, anything on the first screen comes 1s later if there is no delay, or after the curtain if there is one) ----------
  const reveal = () => {
    let ready = false;
    const done = new Set();
    const waitIntro = (fn) => (!ready && root.classList.contains("is-intro") ? addEventListener("gh:intro-end", fn, { once: true }) : fn());
    const show = (el) => {
      if (root.classList.contains("is-anchor-scrolling") || done.has(el)) return;
      done.add(el);
      let d = el.dataset.delay != null ? +el.dataset.delay : 0;
      if (!ready && el.dataset.delay == null) d = 1;
      waitIntro(() => { el._ghT = setTimeout(() => el.classList.add("is-visible"), d * 1000); });
    };
    const hide = (el) => { clearTimeout(el._ghT); el.classList.remove("is-visible"); done.delete(el); };
    const cb = (es) => es.forEach((e) => (e.isIntersecting ? show(e.target) : e.target.hasAttribute("data-repeat") && hide(e.target)));
    const io = new IntersectionObserver(cb, { threshold: 0 });
    const ioLate = new IntersectionObserver(cb, { rootMargin: "0px 0px -40% 0px", threshold: 0 });
    document.querySelectorAll("[data-reveal], .gh-zoom").forEach((el) => (el.dataset.reveal === "stagger" ? ioLate : io).observe(el));
    setTimeout(() => { ready = true; }, 400);
  };

  // ---------- Parallax photo — original Parallax: cell clip 1.2s · inner 1.2 → 1 over 1.6s (power3.out, top 85%, once), ±8% while passing (±4% at 1023px and below) ----------
  const parallax = () => {
    if (reduce) return;
    const amp = () => (matchMedia("(max-width: 1023.98px)").matches ? 4 : 8);
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const media = box.querySelector(".gh-media");
      if (!media) return;
      if (!box.closest("[data-hero]") && box.dataset.parallax !== "no-reveal") {
        const st = { trigger: box, start: "top 85%", once: true, invalidateOnRefresh: true };
        gsap.fromTo(box, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.out", scrollTrigger: st });
        gsap.fromTo(media, { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "power3.out", scrollTrigger: st });
      }
      gsap.fromTo(media, { yPercent: () => -amp() }, { yPercent: () => amp(), ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  };

  // ---------- First-entry curtain — original Transition: text blur 8 → 0 (1s, after .3s) · stays .5s after load, text blurs out at .5s and the curtain lifts over 1.2s, end signaled at 1.1s ----------
  const catchEl = intro.querySelector("[data-intro-catch]");
  const catchIn = root.classList.contains("is-intro") && !reduce
    ? gsap.fromTo(catchEl, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 1, delay: 0.3, ease: "power2.out" })
    : null;
  const introEnd = () => {
    if (!root.classList.contains("is-intro")) return;
    root.classList.remove("is-intro");
    lenis?.start();
    dispatchEvent(new CustomEvent("gh:intro-end"));
  };
  const onLoad = () => {
    root.classList.add("gh-ready");
    if (root.classList.contains("is-intro") && !reduce) {
      lenis?.stop();
      const rest = catchIn ? Math.max(0, catchIn.endTime() - gsap.globalTimeline.time()) : 0;
      const tl = gsap.timeline({ delay: rest + 0.5 });
      tl.to(catchEl, { opacity: 0, filter: "blur(8px)", duration: 0.5, ease: "sine.inOut" }, 0);
      tl.to(intro, { opacity: 0, duration: 1.2, ease: "power2.inOut", onComplete: () => { gsap.set(intro, { display: "none" }); intro.querySelector("video")?.pause(); } }, 0.5);
      tl.call(introEnd, null, 1.1);
      setTimeout(() => { introEnd(); gsap.set(intro, { display: "none" }); }, 6000);
    } else {
      root.classList.remove("is-intro");
      intro.querySelector("video")?.pause();
    }
    darkWatch();
    parallax();
    reveal();
    ScrollTrigger.refresh();
    if (location.hash) {
      const to = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (to) setTimeout(() => (lenis ? lenis.scrollTo(to, { duration: 1 }) : to.scrollIntoView()), 200);
    }
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });
})();
