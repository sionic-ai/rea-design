// Shared by all pages: draws the header row, phone menu and footer, and attaches header row hiding, footer parallax, subpage header opening and row highlight.
// Aurora board and diagonal transition curtain are handled by parts (_fx/aurora-pillars-bg · slant-sweep-page) — the first page goes through without a curtain, like the original.
// Original values: header title clip-path 1s power1.inOut .03 stagger ·
// Header plate scroll 10rem (phone 6rem) scrub .8 · footer -50%→0 (from the last 10% of the body) · line highlight .4/.6/.6s .08 stagger.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => matchMedia("(max-width: 768px)").matches;
  const ZB = (window.ZB = { reduce, isSp, page });

  // Newly drawn round ring symbol + placeholder wordmark instead of the original logo
  const logo = '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M27.5 9.8A12.4 12.4 0 1 0 27.5 24.2" fill="none" stroke="currentColor" stroke-width="5.6" stroke-linecap="round"/><circle cx="18" cy="17" r="4.2" fill="var(--kf-accent)"/></svg><b>WORDMARK</b>';
  ZB.logo = logo;
  const links = [
    ["news.html", "News", "news"],
    ["service.html", "Service", "service"],
    ["index.html#sustainability", "Sustainable", ""],
    ["about.html", "Company", "about"],
    ["recruit.html", "Hiring", "recruit"],
  ];
  const cur = (k) => (k && k === page ? ' aria-current="page"' : "");
  const lang = '<div class="zb-lang"><button class="zb-lang__main" type="button"><i></i>Korean</button><div class="zb-lang__box"><a href="#">Korean</a><a href="#">English</a><a href="#">Language 3</a></div></div>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = `zb-head is-grad${isHome ? " is-top" : ""}`;
    head.innerHTML = `
      <a class="zb-logo" href="index.html" aria-label="Home">${logo}</a>
      <nav class="zb-nav" aria-label="Main menu">${links.map(([h, t, k]) => `<a href="${h}"${cur(k)}>${t}</a>`).join("")}</nav>
      <div class="zb-contacts"><a class="zb-pill" href="#" target="_blank">Service Site</a><a class="zb-pill is-fill" href="#contact">Contact Us</a></div>
      ${lang}`;
    if (isHome) head.style.transform = "translateY(-100%)";
    const burger = document.createElement("button");
    burger.className = "zb-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Menu");
    burger.innerHTML = "<span></span><span></span><span></span>";
    if (isHome) burger.style.transform = "translateY(-150%)";
    const menu = document.createElement("div");
    menu.className = "zb-menu";
    menu.setAttribute("data-slot", "mobile-menu");
    menu.innerHTML = `<div class="zb-menu__back"></div><div class="zb-menu__panel" data-fx="aurora-pillars-bg">
      <div class="zb-menu__head"><a class="zb-logo" href="index.html" aria-label="Home">${logo}</a>${lang}</div>
      <nav class="zb-menu__links">${links.map(([h, t, k]) => `<a href="${h}"${cur(k)}>${t}</a>`).join("")}</nav>
      <div class="zb-menu__contacts"><a class="zb-pill" href="#" target="_blank">Service Site</a><a class="zb-pill is-fill" href="#contact">Contact Us</a></div></div>`;
    head.after(burger, menu);
    ZB.burger = burger;
    const toggle = () => document.documentElement.classList.toggle("is-menu-open");
    burger.addEventListener("click", toggle);
    menu.querySelector(".zb-menu__back").addEventListener("click", toggle);
  }

  // Language picker: same duration · curve as jQuery fadeToggle (400ms swing)
  document.querySelectorAll(".zb-lang").forEach((l) => {
    const box = l.querySelector(".zb-lang__box");
    const fade = (show) => (show ? gsap.fromTo(box, { display: "block", opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.inOut" }) : gsap.to(box, { opacity: 0, duration: 0.4, ease: "sine.inOut", onComplete: () => gsap.set(box, { display: "none" }) }));
    l.querySelector(".zb-lang__main").addEventListener("click", () => fade(getComputedStyle(box).display === "none"));
    box.addEventListener("click", (e) => { e.preventDefault(); fade(false); });
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "zb-foot";
    foot.setAttribute("data-fx", "aurora-pillars-bg");
    foot.id = "contact";
    foot.innerHTML = `<div class="zb-foot__inner">
        <div class="zb-foot__cards">
          <a class="zb-foot__card" href="#"><small>Request documents</small><h3>Get Materials<br>(One-line note)</h3><p>Your one line on what the resource contains goes here.<br>One more line on what you’ll learn after receiving it.</p><span class="zb-circle"></span></a>
          <a class="zb-foot__card" href="#"><small>Contact us</small><h3>Contact Us</h3><p>Your contact type in one line here.<br>A one-line note to feel free to get in touch.</p><span class="zb-circle"></span></a>
        </div>
        <div class="zb-foot__links">
          <div><a class="zb-logo" href="index.html" aria-label="Home">${logo}</a><div class="zb-foot__sns"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="zb-foot__main">${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="#">Community</a><a href="#" target="_blank">Service Site</a></div>
          <div class="zb-foot__sub"><a href="#">Partner guide</a><a href="#">Glossary</a><a href="#">Information Security Policy</a><a href="#">Privacy policy</a><a href="#">Basic customer service policy</a><a href="#">Application Status</a></div>
        </div>
        <div class="zb-foot__bottom">
          <div class="zb-foot__cert"><div class="wf-img" data-label="Certification mark · Landscape 3:2"></div><p>Your two lines here on the scope of certification. Place the certifying body, scope and registration number.</p></div>
          <span>© 0000 WORDMARK Inc.</span>
          <button class="zb-foot__top" type="button" data-label="Back to top button text (English)">Page Top ↑</button>
        </div>
      </div>`;
    foot.querySelector(".zb-foot__top").addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  }

  // Whether we arrived from within the same site — decides whether the first page skips the first video (the original uses referrer, and when opened as a file the address is empty, so this flag is used instead)
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (a && !a.getAttribute("href").startsWith("#") && a.target !== "_blank") sessionStorage.setItem("zbInternal", "1");
  });

  // ── Header bar: past the reference point (first page: top of the News section, subpages: 100px) a small white header appears, hides on scroll down and returns on scroll up ──
  if (head) {
    let last = scrollY;
    const mark = () => {
      const t = document.querySelector('[data-slot="news"]');
      return isHome && t ? t.getBoundingClientRect().top + scrollY : 100;
    };
    const onScroll = () => {
      const y = scrollY, th = mark();
      const small = y >= th - head.offsetHeight;
      head.classList.toggle("is-small", small);
      head.classList.toggle("is-grad", !small);
      if (y > last && y > th) {
        head.style.transform = "translateY(-100%)";
        if (isSp()) ZB.burger.style.transform = "translateY(-150%)";
      } else if (y < last) {
        head.style.transform = "translateY(0)";
        if (isSp()) ZB.burger.style.transform = "translateY(0)";
      }
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
  }

  const mm = gsap.matchMedia();
  ZB.mm = mm;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Footer parallax — the original puts length 1 and an unspecified curve (default power1.out) on scrub
    const inner = document.querySelector(".zb-foot__inner");
    const main = document.querySelector("main");
    if (inner && main) gsap.fromTo(inner, { y: "-50%" }, { y: "0%", ease: "power1.out", scrollTrigger: { trigger: main, start: "bottom-=10% bottom", end: "bottom top", scrub: true } });

    // Subpage header
    const ph = document.querySelector(".zb-pagehead");
    if (ph) {
      const t = ph.querySelector(".zb-pagehead__title");
      gsap.timeline()
        .to(t.querySelectorAll("h1 > span"), { clipPath: "polygon(0 0, 110% 0, 110% 110%, 0 110%)", duration: 1, stagger: 0.03, ease: "power1.inOut" }, 0)
        .to(t.querySelectorAll("h1 > span > span"), { y: "0%", duration: 1, stagger: 0.03, ease: "power1.inOut" }, 0)
        .to(t.querySelector("p"), { opacity: 1, duration: 0.6, delay: 0.4, ease: "power1.out" }, 0);
      gsap.to(ph, { y: isSp() ? "6rem" : "10rem", ease: "power1.out", scrollTrigger: { trigger: ph, start: "top top", end: "bottom top", scrub: 0.8 } });
    }

    // Line highlight on dark panel
    document.querySelectorAll("[data-mark-rows]").forEach((box) => {
      const bgs = box.querySelectorAll(".zb-mark__bg"), txt = box.querySelectorAll(".zb-mark__text");
      gsap.timeline({ scrollTrigger: { trigger: box, start: "top 85%", once: true } })
        .to(bgs, { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power1.out" }, 0)
        .to(bgs, { scaleX: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0)
        .to(txt, { opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.3, ease: "power2.out" }, 0);
    });

    // Photo and card parallax (like the five photos in the Careers section, data-par="Start% End%")
    document.querySelectorAll("[data-par-group]").forEach((g) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      g.querySelectorAll("[data-par]").forEach((el) => {
        const [a, b] = el.dataset.par.split(" ");
        tl.fromTo(el, { y: a }, { y: b, ease: "power1.out" }, 0);
      });
    });
    return () => {};
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".zb-pagehead__title h1 > span", { clipPath: "none" });
    gsap.set(".zb-pagehead__title h1 > span > span", { y: 0 });
  });
})();
