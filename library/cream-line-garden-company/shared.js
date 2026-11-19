// Shared by all pages: first-visit intro, header band (first page is white text, turning into a cream band on scroll), phone drawer, bottom fixed consultation bar,
// Dot-following cursor, link letter roll, scroll reveal, shared tail for sub pages (breadcrumbs·flow/question rows·three cases·contact) and footer.
(() => {
  const page = document.body.dataset.page;
  const ARROW = '<span class="gg-arrow" aria-hidden="true"><svg viewBox="0 0 20 16"><path d="M0 8h18M11 1l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg><svg viewBox="0 0 20 16"><path d="M0 8h18M11 1l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></span>';
  const roll = (t) => `<span class="gg-roll"><span data-roll-a>${t}</span><span data-roll-b aria-hidden="true">${t}</span></span>`;
  const more = (t = "View more", href = "#") => `<a class="gg-more" href="${href}">${roll(t)}${ARROW}</a>`;
  window.GG = { ARROW, roll, more };

  const NAV = [["About", "about.html"], ["Works", "works.html"], ["Service", "service.html", [["Service one", "service.html"], ["Service Two", "service.html"], ["Service Three", "service.html"], ["Shop (café)", "service.html"]]],
    ["Company", "about.html", [["Greeting", "about.html"], ["Mission", "about.html"], ["Vision", "about.html"], ["Company overview", "about.html"], ["Directions", "about.html"], ["Member", "about.html"]]], ["Recruit", "recruit.html"], ["Contact", "#"]];
  const LOGO = `<a class="gg-logo" href="index.html" aria-label="First Page"><svg viewBox="0 0 154 30"><text x="0" y="17" font-family="Inter Tight, sans-serif" font-size="17" letter-spacing="1.5" fill="currentColor">BRAND2 NAME</text><text x="22" y="28" font-family="Inter Tight, sans-serif" font-size="6.5" letter-spacing="2.4" fill="currentColor">LOGO · SUBMARK</text></svg></a>`;

  const header = `
<header class="gg-header" data-slot="header"><div class="gg-header__in">
  ${LOGO}
  <nav class="gg-gnav">${NAV.map(([n, h, sub]) => sub
    ? `<div class="gg-gnav__item has-sub"><button type="button" class="gg-gnav__button"><a class="gg-gnav__str gg-gnav__link" href="${h}">${n}<span class="gg-plus" aria-hidden="true"><i></i><i></i></span></a><div class="gg-gnav__sub"><div class="gg-gnav__subBg">${sub.map(([s, sh]) => `<a href="${sh}">${roll(s)}</a>`).join("")}</div></div></button></div>`
    : `<div class="gg-gnav__item"><a class="gg-gnav__link" href="${h}">${roll(n)}</a></div>`).join("")}
    <a class="gg-gnav__sns" href="#" aria-label="Social Media"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16.6" cy="7.4" r=".9" fill="currentColor"/></svg></a>
  </nav>
  <a class="gg-tel" href="#"><svg viewBox="0 0 12 16"><rect x="1.5" y="1" width="9" height="14" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>0120-000-000</a>
  <button class="gg-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
</div></header>
<div class="gg-drawer" data-slot="drawer"><div class="gg-drawer__bg wf-img" data-label="Drawer background · dark green foliage photo · full vertical"></div>
  <nav class="gg-drawer__nav">${NAV.map(([n, h, sub]) => `<a class="gg-drawer__link" href="${h}"><span>${n}</span>${sub ? `<small>${sub.map((s) => s[0]).join(" · ")}</small>` : ""}</a>`).join("")}</nav>
  <div class="gg-drawer__foot"><a href="#">Consult by email or messenger</a><a href="#">0120-000-000</a></div>
</div>
<div class="gg-cta" data-slot="mobile-cta"><a href="#">Consult by email or messenger</a><a href="#">Consult by phone</a></div>
<div class="gg-stalker" aria-hidden="true"><i class="gg-stalker__cursor"></i><i class="gg-stalker__follower"></i></div>
<div class="gg-intro" data-slot="intro"><i class="gg-intro__ov is-2"></i><i class="gg-intro__ov is-1"></i>
  <p class="gg-intro__copy"><span class="ja">Your one-line motto here.</span><span class="en">Headline, the scenery of word</span></p></div>`;

  const works = (n = 3) => Array.from({ length: n }, (_, i) => `
      <a class="gg-work${i % 3 === 1 ? " is-tall" : ""}" href="works.html" data-reveal="fade">
        <div class="gg-work__img wf-img" data-label="${["Two-story house front exterior · clear daytime · portrait", "Garage roof and two cars · clear daytime · landscape", "Front steps and garden · daytime · landscape", "Brick gate pillar and mailbox · overcast day · landscape", "Stairway garden beside a house · blue sky · portrait", "Wooden deck terrace · day · vertical"][i % 6]}"></div>
        <p class="gg-work__area">Area Name</p>
        <p class="gg-work__title">Your project case title here, about two lines<br>Adding it</p>
        <p class="gg-work__tags">Category One / Category Two / Category Three</p>
        <p class="gg-work__hash">#TagOne #TagTwo</p>
      </a>`).join("");
  window.GG.works = works;

  const bottom = `
<div class="gg-bottom">
  ${page === "home" ? "" : `<p class="gg-crumb" data-slot="breadcrumb"><a href="index.html">Home</a><span>/</span><span>${document.title.split(" · ")[0]}</span></p>
  <section class="gg-links2" data-slot="flow-faq">
    <a class="gg-links2__cell" href="#"><p class="gg-ttl is-v"><span class="en">Flow</span><span class="ja">Process Order</span></p><span class="gg-more">${roll("View more")}${ARROW}</span></a>
    <a class="gg-links2__cell" href="#"><p class="gg-ttl is-v"><span class="en">FAQ</span><span class="ja">Frequently asked questions</span></p><span class="gg-more">${roll("View more")}${ARROW}</span></a>
  </section>
  ${page === "works" ? "" : `<section class="gg-works-sec" data-slot="works-teaser"><p class="gg-ttl gg-works-sec__ttl"><span class="en">Works</span><span class="ja">Installation Cases</span></p><div class="gg-works">${works(3)}</div><div class="gg-works-sec__more">${more("View more", "works.html")}</div></section>`}`}
  <section class="gg-contact" data-slot="contact">
    <i class="gg-dot"></i>
    <p class="gg-ttl is-v" data-reveal="top"><span class="en">Contact us</span><span class="ja">Inquiry</span></p>
    <p class="gg-contact__p" data-reveal="top">Your one-line contact note here, feel free to ask.</p>
    <div class="gg-contact__links" data-reveal="top"><a class="gg-contact__mail" href="#">${roll("Contact by email or messenger")}${ARROW}</a><a class="gg-contact__tel" href="#"><small>Phone Inquiry</small>0120-000-000</a></div>
  </section>
  <footer class="gg-footer" data-slot="footer">
    <div class="gg-footer__photos">
      <div class="wf-img" data-label="Sea and a big bridge · overcast day · portrait"></div><div class="wf-img" data-label="Entrance stairs exterior · Daytime · Vertical"></div>
      <div class="wf-img" data-label="Gloved hand and plant pot · daytime · landscape"></div><div class="wf-img" data-label="Sunlit leaves · backlit · portrait"></div>
      <div class="wf-img" data-label="Foliage plant leaves · shade · landscape"></div><div class="wf-img" data-label="Soil and hands · close-up · portrait"></div>
    </div>
    <div class="gg-footer__content">
      <div class="gg-footer__info">${LOGO}<p>〒000-0000<br>Your one-line address here<br>Hours 00:00–00:00 (closed Sundays)</p></div>
      <nav class="gg-footer__nav">${[["About", "about.html"], ["Works", "works.html"], ["Service", "service.html"], ["News", "news.html"], ["Flow", "#"], ["Column", "#"], ["FAQ", "#"], ["Contact", "#"], ["Company", "about.html"], ["", ""], ["Recruit", "recruit.html"]].map(([n, h]) => n ? `<a href="${h}">${roll(n)}</a>` : "<span></span>").join("")}</nav>
    </div>
    <p class="gg-footer__copy"><small>© BRAND2 NAME</small><a href="#">Privacy policy</a></p>
  </footer>
</div>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.querySelector("main").insertAdjacentHTML("afterend", bottom);
  if (page !== "home") document.querySelector(".gg-header").classList.add("is-lower");

  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reduce ? null : new Lenis({ lerp: 0.1 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.GG.lenis = lenis;

  // Headband: past the top, it gets a cream background + an ink line below
  const hd = document.querySelector(".gg-header");
  const onScroll = () => hd.classList.toggle("is-not-top", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Link text roll: the top text exits at -105% (.6 expo.inOut) and the bottom text rises in from 105% (.6 linkhover)
  const linkEase = "M0,0 C0.115,0.405 0.24,1 1,1";
  const ease = window.CustomEase ? CustomEase.create("linkhover", linkEase) : "power3.out";
  document.addEventListener("mouseover", (e) => {
    const host = e.target.closest("a, button");
    if (!host || host.contains(e.relatedTarget) || reduce) return;
    host.querySelectorAll(".gg-roll").forEach((r) => {
      gsap.fromTo(r.querySelector("[data-roll-a]"), { yPercent: 0, opacity: 1 }, { yPercent: -105, opacity: 0, duration: 0.6, ease: "power1.out", overwrite: true }); // The original is "expo.inout"(lowercase) so GSAP can’t find it and falls back to the default power1.out
      gsap.fromTo(r.querySelector("[data-roll-b]"), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease, overwrite: true });
    });
  });

  // Drawer (phone)
  const burger = document.querySelector(".gg-burger");
  burger.addEventListener("click", () => {
    const open = !document.documentElement.classList.contains("is-drawer");
    document.documentElement.classList.toggle("is-drawer", open);
    burger.setAttribute("aria-expanded", open);
    open ? lenis?.stop() : lenis?.start();
  });

  // Follower dot: 10px dot, 40px·.2 over links, [data-stalker=click|scroll] text in a blurred 146px circle above
  const st = document.querySelector(".gg-stalker");
  if (matchMedia("(hover: hover)").matches) {
    const parts = st.querySelectorAll(".gg-stalker__cursor, .gg-stalker__follower");
    addEventListener("mousemove", (e) => { st.style.opacity = 1; parts.forEach((p) => (p.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`)); });
    document.addEventListener("mouseleave", () => (st.style.opacity = 0));
    document.addEventListener("mouseenter", () => (st.style.opacity = 1));
    document.addEventListener("mouseover", (e) => {
      const zone = e.target.closest("[data-stalker]");
      st.classList.toggle("is-click", zone?.dataset.stalker === "click");
      st.classList.toggle("is-scroll", zone?.dataset.stalker === "scroll");
      st.classList.toggle("is-hover", !!e.target.closest("a, button, input[type=submit]"));
    });
  }

  // Scroll reveal (original data-scroll-trigger): top=Rises 8% over 1s, fade=1.8s, blur=Blur · bright 1.3s, text=Letters rise from below at .03 intervals
  document.querySelectorAll('[data-reveal="text"]').forEach((el) => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map((c) => `<span class="gg-ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  const show = (el) => {
    if (el.dataset.reveal === "text") gsap.fromTo(el.querySelectorAll(".gg-ch"), { yPercent: 100, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power1.inOut", stagger: 0.03 });
    el.classList.add("is-visible");
  };
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }), { rootMargin: "0px 0px -20% 0px" });
  const watch = () => document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-visible") : io.observe(el)));

  // Parallax (original scrub 1.2): flows upward by data-speed
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-speed]").forEach((el) =>
      gsap.fromTo(el, { yPercent: 0 }, { yPercent: -Number(el.dataset.speed), ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 1.2 } }));
  });

  // Intro: only for the first visit from outside — logo letters light up at .035 intervals, and two white curtains lift upward
  const intro = document.querySelector(".gg-intro");
  const ready = new Promise((resolve) => {
    // Hero video plays after the intro’s second curtain has fully cleared (immediately if there is no intro) — original playHeroMovie
    const playHero = () => { if (!reduce) document.querySelectorAll("[data-hero-movie]").forEach((v) => v.offsetParent && v.play().catch(() => {})); };
    // Original check: if arriving from outside (previous page elsewhere or none) show the intro. Browsers don’t report the previous page for file://, so it shows only on the first visit in the same tab
    const ref = document.referrer ? new URL(document.referrer) : null;
    const inside = ref ? ref.origin === location.origin && ref.protocol === location.protocol : location.protocol === "file:" && sessionStorage.getItem("gg-visited");
    if (reduce || inside) { intro.remove(); playHero(); return resolve(); }
    sessionStorage.setItem("gg-visited", "1");
    const copy = intro.querySelector(".gg-intro__copy");
    copy.querySelectorAll(".ja, .en").forEach((el) => { el.innerHTML = [...el.textContent].map((c) => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`).join(""); });
    lenis?.stop();
    // As in the original, starts after the window has fully loaded (load) and fonts are ready — the tagline has the same character count as the original (11 + 29) so the .035 stagger has the same length
    const go = () => (document.fonts?.ready || Promise.resolve()).then(() => {
    gsap.set(copy, { opacity: 1 });
    gsap.timeline({ onComplete: () => { intro.remove(); lenis?.start(); } })
      .to(copy.querySelectorAll(".char"), { delay: 0.5, opacity: 1, duration: 0.9, stagger: 0.035, ease: "power2.out" })
      .to(copy, { opacity: 0, duration: 0.5, delay: 1.2, ease: "expo.out" }, "-=.2")
      .to(".gg-intro__ov.is-1", { yPercent: -100, duration: 1, delay: 0.5, ease: "power4.out" }, "-=1")
      .to(".gg-intro__ov.is-2", { yPercent: -100, duration: 1, delay: 0.5, ease: "power2.inOut", onStart: resolve, onComplete: playHero }, "-=1.8");
    });
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  });
  window.GG.ready = ready;
  document.documentElement.classList.add("gg-js");

  // Page transition (original values): clicking an inner link makes the page vanish with .6s expo.inOut after .3s (1s for drawer links), then navigates. The next page stands immediately (the original #page is visible from the start)
  const pageEls = () => [...document.body.children].filter((el) => !el.matches(".gg-intro, .gg-stalker, script, template"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    gsap.to(pageEls(), { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: a.closest(".gg-drawer") ? 1 : 0.3, onComplete: () => (location.href = a.href) });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(pageEls(), { opacity: 1 }); });
  // Turn on the reveal when the intro curtain starts lifting, so the hero letters do not finish early behind the curtain
  ready.then(watch);

  addEventListener("load", () => ScrollTrigger.refresh());
})();
