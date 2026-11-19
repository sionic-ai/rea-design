// Shared by all pages: draws the intro curtain, header (text logo ↔ post-scroll logo, vertical menu, round menu button and green expanding menu), reservation pill, reservation field and footer, and
// Binds section title characters, two-line titles, text masks, decorative words, flowing Footer words and the bottom photo with gsap ScrollTrigger.
// Original figures (read from the Nuxt component, ‹h› is the stored screen height):
// section title letters y 5→0 · opacity 0→1 · stagger .05(power1.in) · circ.out · scrub 1 · text line bottom edge h → .75h, underline mask-position 100%→0 over the same range
//   Two-line title: each line y 70%→0 · scaleY 1.5→1 · length 1+.2i · delay .2i · power1.out · scrub 1 · header h → .75h
//   text paragraph y 20→0 · mask-position 0 100%→0 0 · power1.out · scrub 2 · ”20 h” → ”top .7h”
//   booking cell decorative word mask scrub 1(top h → bottom .8h), tilted photo y 50%→0 power1.out scrub(top h → center .5h)
//   Footer words move x 0→-25% endlessly at 60px per second · that panel scrubs at y 30% (top bottom → bottom bottom)
//   bottom photo cover width → 100% sine.out · photo y → -100 · scrub (top bottom → bottom bottom)
//   Intro = After document load: logo .4s fade · .3s scale .95 (ease-in) · curtain .3s (delay .2) · header = Past 30px of scroll, is-scroll is added
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => innerWidth > 768;
  const YD = (window.YD = { reduced, isPC });
  gsap.registerPlugin(ScrollTrigger);
  const h = () => innerHeight;
  const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";

  const icon = (n) => `<span class="yd-icon yd-icon--${n}"></span>`;
  const roll = (t, cls = "") => `<span class="yd-roll ${cls}" data-text="${t}"><span>${t}</span></span>`;
  YD.icon = icon; YD.roll = roll;
  YD.logo = (fillVar = "--kf-accent") =>
    `<svg class="yd-logo-svg" viewBox="0 0 180 80" aria-label="Hospital Logo" data-label="Hospital English wordmark + small subtitle"><text x="0" y="52" font-size="56" style="fill: var(${fillVar})">Logo</text><text x="2" y="72" font-size="10" letter-spacing="3" style="fill: var(${fillVar}); font-family: var(--kf-font-en)">DENTAL CLINIC</text></svg>`;

  const nav = [
    ["index.html", "Home"], ["service.html", "Treatment Guide"], ["about.html", "About the Hospital"], ["#", "Doctor Profile"], ["#", "Hours · Directions"],
    ["#", "Fees · Payment methods"], ["news.html", "News"], ["#", "Blog"], ["recruit.html", "Hiring Info"],
  ];
  const cur = (href) => (href.replace(".html", "") === page ? ' aria-current="page"' : "");

  // Intro — the curtain sits at the very start of the html so it covers from the first paint (original SSR). From the second page of a session an inline script right after the curtain removes it (the original is an SPA so it runs once at first)
  sessionStorage.setItem("yd-intro", "1");
  const introLogo = document.querySelector(".yd-intro__logo");
  if (introLogo && !introLogo.firstElementChild) introLogo.innerHTML = YD.logo("--kf-on-accent");
  YD.introDone = new Promise((res) => {
    const intro = document.querySelector(".yd-intro");
    if (!intro) return res();
    const go = () => {
      intro.classList.add("is-leave");
      setTimeout(() => { intro.classList.add("is-gone"); res(); }, 500);
    };
    document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
  });

  // Head
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("yd-head");
    head.innerHTML = `
      <div class="yd-head__lead-wrap"><a class="yd-head__lead" href="index.html"><span class="t">Logo</span><span class="l"></span><span class="c">Your one-line intro here</span></a></div>
      <div class="yd-head__logo"><a href="index.html">${YD.logo()}</a></div>
      <button type="button" class="yd-trigger" aria-label="Open Menu" aria-expanded="false">
        <span class="yd-trigger__line"></span><span class="yd-trigger__line"></span><span class="yd-trigger__line"></span>
        <span class="yd-trigger__text menu yd-roll" data-text="MENU"><span>MENU</span></span>
        <span class="yd-trigger__text close yd-roll" data-text="CLOSE"><span>CLOSE</span></span>
      </button>
      <nav class="yd-hnav" aria-label="Main menu"><ul>${nav.map(([u, t]) => `<li><a href="${u}"${cur(u)}>${t}</a></li>`).join("")}</ul></nav>
      <div class="yd-menu" data-slot="menu-drawer"><div class="yd-menu__in">
        <ul class="yd-menu__list">${nav.map(([u, t]) => `<li><a href="${u}"${cur(u)}>${t}</a></li>`).join("")}</ul>
        <div class="yd-menu__side"><p class="yd-en">Logo Dental Clinic</p><p>〒000-0000<br>Your one-line address here<br>One line here on the way from the station</p><p class="yd-en">0000-00-0000</p></div>
      </div></div>`;
    document.body.insertAdjacentHTML("beforeend", `<div class="yd-fixnav" data-slot="fixed-reserve"><ul>
        <li><a href="#">${icon("external")}<span class="tel">${roll("0000-00-0000")}</span></a></li>
        <li><a href="#">${icon("external")}<span class="line">${roll("Messenger booking")}</span></a></li></ul></div>`);
    const trigger = head.querySelector(".yd-trigger");
    let busy = false;
    trigger.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      gsap.delayedCall(0.3, () => (busy = false));
      const open = !head.classList.contains("is-open");
      head.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    ScrollTrigger.create({ trigger: head, start: "top bottom", end: "top -30", onToggle: (s) => head.classList.toggle("is-scroll", !s.isActive) });
    if (scrollY > 30) head.classList.add("is-scroll");
  }

  // Booking cell + Footer
  const sched = `<table class="yd-sched" aria-label="Clinic hours" data-label="Consultation schedule — 7 weekday columns × 2 rows (AM·PM), open is a circle, closed is a short dash">
      <thead><tr><th>Consultation Hours</th>${"Mon Tue Wed Thu Fri Sat Sun".split("").map((d) => `<th>${d}</th>`).join("")}</tr></thead>
      <tbody>${[["0:00~00:00", "Last submission 00:00"], ["00:00-00:00", "Last submission 00:00"]].map(([t, n]) => `<tr><th><p class="time">${t}</p><p class="note">${n}</p></th>${[0, 1, 1, 1, 1, 0, 1].map((o) => `<td><div class="${o ? "open" : "close"}"></div></td>`).join("")}</tr>`).join("")}</tbody>
    </table><p class="yd-sched__note">One line on Sunday and holiday hours here</p>`;
  const menuItems = ["Online medical visit", "Second opinion", "Regular Checkup", "Gum Treatment", "Correction", "One-day cavity treatment", "Pediatric Dentistry", "Whitening", "Oral medicine", "Oral surgery", "Dental Care During Pregnancy", "Aesthetic dentistry"];
  YD.appointment = () => `
    <div class="yd-appoint-wrap yd-container yd-container--lg" data-slot="appointment"><section class="yd-appoint">
      <div class="yd-appoint__deco" aria-hidden="true"><span data-yd-mask><span>Get</span></span><span>&nbsp;</span><span data-yd-mask><span>in touch</span></span></div>
      <div class="yd-appoint__inner">
        <div class="yd-appoint__img yd-appoint__img--1" data-yd-rise><div class="card yd-ph"><div class="wf-img" data-label="Hand holding a guide card with a hospital logo · green plant background · portrait 3:4"></div></div></div>
        <div class="yd-appoint__img yd-appoint__img--2" data-yd-rise><div class="card yd-ph"><div class="wf-img" data-label="Hand holding a phone showing a booking screen · light sky-blue background · vertical 3:4"></div></div></div>
        <h3 class="yd-heading yd-heading--center yd-appoint__heading" data-yd-heading><span class="yd-heading__line"><span>No worries, even same-day</span></span><span class="yd-heading__line"><span>Please book now</span></span></h3>
        <ul class="yd-appoint__list">
          <li><a class="yd-appoint__card" href="#"><span class="ttl">Phone Reservation</span><span class="lk">${icon("external")}<span class="tel">${roll("0000-00-0000")}</span></span></a></li>
          <li><a class="yd-appoint__card" href="#"><span class="ttl">Open 24 hours!</span><span class="lk">${icon("external")}<span class="line">${roll("Messenger booking")}</span></span></a></li>
        </ul>
      </div>
    </section></div>`;
  YD.footer = (isIndex) => `
    <div class="yd-container yd-container--lg"><section class="yd-info" data-slot="hours-access">
      <div class="yd-info__access"><div class="yd-info__bg yd-ph"><div class="wf-img" data-label="Hospital entrance glass door and logo sign · darkened photo · tall vertical slot"></div></div>
        <div class="yd-info__contents"><h4 class="yd-info__title">Logo Dental Clinic</h4><p class="yd-info__text">〒000-0000<br>Your one-line address here<br>Your building name 1F here<br>Your line: right from the station exit<br><a href="#">Parking Available</a></p>
          <a class="yd-tbutton yd-roll-host" href="#">${roll("Google Maps")}<span class="yd-tbutton__circle yd-tbutton__circle--external">${icon("arrow")}</span></a></div></div>
      <div class="yd-info__schedule">${sched}</div>
    </section></div>
    <div class="yd-container"><nav class="yd-fnav" aria-label="Footer Menu">
      <div class="yd-fnav__sec yd-fnav__sec--menu"><a class="yd-flink" href="service.html">Treatment Guide</a><ul class="yd-flist--menu">${menuItems.map((m, i) => `<li><a class="yd-flink yd-flink--disc" href="${i === 0 ? "detail.html" : "#"}">${m}</a></li>`).join("")}</ul></div>
      <div class="yd-fnav__sec yd-fnav__sec--page"><ul class="yd-flist">${nav.slice(1).map(([u, t]) => `<li><a class="yd-flink" href="${u}">${t}</a></li>`).join("")}</ul></div>
      <div class="yd-fnav__sec"><a class="yd-insta" href="#">${icon("insta")}${roll("Instagram")}</a><ul class="yd-flist"><li><a class="yd-flink yd-flink--sub" href="#">Contact Us</a></li><li><a class="yd-flink yd-flink--sub" href="#">Privacy policy</a></li></ul></div>
    </nav></div>
    <div class="yd-fdeco" data-slot="footer-marquee" aria-hidden="true"><div class="yd-fdeco__par"><div class="yd-fdeco__text">${Array.from({ length: 4 }, () => `<span>${isIndex ? "Care with comfort" : "Logo Dental Clinic"}</span>`).join("")}</div></div></div>
    ${isIndex ? `<div class="yd-fimage" data-slot="footer-photo"><div class="yd-fimage__mask"><div class="yd-fimage__img yd-ph"><div class="wf-img" data-label="Inside a hospital exam room · white walls and wooden partitions, bright natural light · full-bleed landscape 16:9 photo"></div></div></div></div>` : ""}`;

  // Scroll choreography
  function motion(box) {
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
      box.querySelectorAll("[data-yd-stitle]").forEach((t) => {
        const letters = t.querySelectorAll(".yd-stitle__text span");
        const border = t.querySelector(".yd-stitle__border");
        const st = { trigger: t.querySelector(".yd-stitle__text"), scrub: 1, start: () => `bottom ${h()}`, end: () => `bottom ${h() * 0.75}` };
        gsap.fromTo(letters, { y: 5, opacity: 0 }, { y: 0, opacity: 1, stagger: { each: 0.05, ease: "power1.in" }, ease: "circ.out", scrollTrigger: st });
        if (border) gsap.to(border, { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", ease: "none", scrollTrigger: { ...st } });
      });
      box.querySelectorAll("[data-yd-heading]").forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, scrub: 1, start: () => `top ${h()}`, end: () => `top ${h() * 0.75}` } });
        el.querySelectorAll(".yd-heading__line > span").forEach((l, i) => tl.fromTo(l, { y: "70%", scaleY: 1.5 }, { y: "0%", scaleY: 1, duration: 1 + 0.2 * i, delay: 0.2 * i, ease: "power1.out" }, "start"));
      });
      box.querySelectorAll(".yd-paragraph").forEach((p) => {
        const inner = p.firstElementChild;
        gsap.fromTo(inner, { y: 20 }, { y: 0, maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", ease: "power1.out", scrollTrigger: { trigger: p, scrub: 2, start: () => `20 ${h()}`, end: () => `top ${h() * 0.7}` } });
      });
      box.querySelectorAll("[data-yd-mask]").forEach((w) => {
        gsap.to(w.firstElementChild, { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", ease: "none", scrollTrigger: { trigger: w, scrub: 1, start: () => `top ${h()}`, end: () => `bottom ${h() * 0.8}` } });
      });
      box.querySelectorAll("[data-yd-rise]").forEach((w) => {
        gsap.fromTo(w.firstElementChild, { y: "50%" }, { y: "0%", ease: "power1.out", scrollTrigger: { trigger: w, scrub: true, start: () => `top ${h()}`, end: () => `center ${h() * 0.5}` } });
      });
      const deco = box.querySelector(".yd-fdeco");
      if (deco) {
        const text = deco.querySelector(".yd-fdeco__text");
        const loop = gsap.timeline({ repeat: -1 });
        loop.set(text, { x: "0%" }).to(text, { x: "-25%", duration: text.scrollWidth / 4 / 60, ease: "none" });
        gsap.from(deco.querySelector(".yd-fdeco__par"), { y: "30%", scrollTrigger: { trigger: deco, scrub: true, start: "top bottom", end: "bottom bottom" } });
      }
      const fimg = box.querySelector(".yd-fimage");
      if (fimg) {
        gsap.set(fimg.querySelector(".yd-fimage__mask"), { width: isPC() ? "80%" : "90%" });
        const tl = gsap.timeline({ scrollTrigger: { trigger: fimg, scrub: true, start: "top bottom", end: "bottom bottom" } });
        tl.to(fimg.querySelector(".yd-fimage__mask"), { width: "100%", ease: "sine.out" }, "start").to(fimg.querySelector(".yd-fimage__img"), { y: -100, ease: "none" }, "start");
      }
    });
    return () => mm.revert();
  }

  // Page turn — original Nuxt <Transition name="page" mode="out-in">: on leaving, body (including footer) fades to transparent .3s none + y 15 .3s circ.in,
  // On enter, opacity 0·y 15 → 1·0 over .3s circ.out. Since there are several pages, keep the marker on leaving and play the enter once the next page opens
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  const stage = () => [document.querySelector("main"), document.querySelector('[data-slot="footer"]')].filter(Boolean);
  function pageEnter() {
    if (reduced || !sessionStorage.getItem("yd-nav")) return;
    sessionStorage.removeItem("yd-nav");
    gsap.fromTo(stage(), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: "circ.out", clearProps: "all" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!own(href) || reduced) return;
    e.preventDefault();
    sessionStorage.setItem("yd-nav", "1");
    gsap.to(stage(), { opacity: 0, duration: 0.3, ease: "none" });
    gsap.to(stage(), { y: 15, duration: 0.3, ease: "circ.in", onComplete: () => (location.href = href) });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(stage(), { clearProps: "all" }); });

  const parts = [];
  YD.page = (ns, fn) => parts.push({ ns, fn });
  function start() {
    const box = document.querySelector("main");
    const ns = box.dataset.page || page;
    const ap = box.querySelector('[data-slot="appointment-host"]');
    if (ap) ap.outerHTML = YD.appointment();
    const foot = box.parentNode.querySelector('[data-slot="footer"]');
    if (foot && !foot.innerHTML.trim()) { foot.classList.add("yd-foot"); foot.innerHTML = YD.footer(ns === "home"); }
    parts.filter((p) => p.ns === "*" || p.ns === ns).forEach((p) => p.fn(box));
    motion(document.body);
    pageEnter();
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener("load", () => ScrollTrigger.refresh());
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
