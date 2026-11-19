// Shared by all pages: fills the header, menu and footer into slots (data-slot), Lenis smooth scroll, background fog (three shader),
// Menu open/close (original open/close timeline), scrambled text unscrambling (ScrambleText), transition cover, clock.
// Original values: menu panel scaleY·clip 1s expo.inOut · video inset 50%→0 1s power4.inOut (+.1) · item line 1.5s power2.inOut stagger .07 ·
// Random letter turn-on .22s (.15 later per item, .3 later overall) · button dot ±2px .3s power2.inOut · link hover letter roll .7s.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = () => matchMedia("(max-width: 768px)").matches;
  if (window.gsap) {
    gsap.registerPlugin(...[window.ScrollTrigger, window.ScrambleTextPlugin, window.SplitText, window.CustomEase].filter(Boolean));
  }
  const SCR_SYM = "0123456789!@#$%^&*()-_=+[]{};:<>/?,.";
  const SCR_UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%=+<>/?";

  const LOGO = `<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M24 4c11 0 20 8.5 20 19.5S35.5 44 24 44 4 35 4 23.5c0-4 1.2-7.7 3.3-10.8L5 7.5l7 2.4C15.3 6.2 19.4 4 24 4Zm-7 15a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm14.5 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM15 33c2.6 3 5.6 4.5 9 4.5S30.4 36 33 33c-2.8 1.3-5.8 2-9 2s-6.2-.7-9-2Z"/><circle cx="17" cy="24" r="1.8"/></svg>`;
  const PLUS = `<svg viewBox="0 0 7 7" stroke="currentColor" fill="none"><path d="M3.5 0v7M0 3.5h7"/></svg>`;
  const DOTS = `<svg class="ps-mnav__icon" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="3"/><circle cx="11" cy="3" r="3"/><circle cx="3" cy="11" r="3"/><circle cx="11" cy="11" r="3"/></svg>`;
  const PLAY = `<svg viewBox="0 0 12 14" fill="currentColor" aria-hidden="true"><path d="M0 0l12 7-12 7z"/></svg>`;
  const MENU = [
    ["about.html", "About"],
    ["list.html", "Work"],
    ["service.html", "Services"],
    ["detail.html", "Content", "Hub"],
  ];
  const FOOT = [["about.html", "About"], ["list.html", "Work"], ["index.html", "Clients"], ["service.html", "Services"], ["detail.html", "Content"], ["#", "Contact"]];

  // ── Text splitting: words are wrapped in inline-block chunks so Korean line breaks never cut through the middle of a word ──
  function split(el, cls = "ch") {
    if (!el || el.dataset.split) return [...(el?.querySelectorAll("." + cls) || [])];
    el.dataset.split = "1";
    // keep <br> as a line-separator mark (\u2028) so lines still break in the same place after splitting
    const text = [...el.childNodes].map((n) => (n.nodeName === "BR" ? "\u2028" : n.textContent)).join("");
    el.setAttribute("aria-label", text.replace(/\u2028/g, " ").trim());
    el.textContent = "";
    const out = [];
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.append(part.includes("\u2028") ? document.createElement("br") : document.createTextNode(" ")); return; }
      const w = document.createElement("span");
      w.style.display = "inline-block";
      w.setAttribute("aria-hidden", "true");
      [...part].forEach((c) => {
        const s = document.createElement("span");
        s.className = cls;
        s.textContent = c;
        w.append(s);
        out.push(s);
      });
      el.append(w);
    });
    return out;
  }

  // The original’s entrance grammar — letters light up in random order (.01s each, overall amount) and resolve from symbols into their own letters
  function scrambleIn(chars, { dur = 2.3, amount = 0.9, set = "upperCase", tl, at = 0 } = {}) {
    chars = [].concat(chars).filter(Boolean);
    if (!chars.length || !window.gsap) return tl;
    const t = tl || gsap.timeline();
    t.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount, from: "random" } }, at);
    if (window.ScrambleTextPlugin) {
      t.to(chars, { duration: dur, ease: "none", scrambleText: { text: "{original}", chars: set, tweenLength: false } }, at);
    }
    return t;
  }

  // Link hover — letters scramble into symbols for .7s, then settle back (original LinkWithHover)
  function hoverScramble(el) {
    if (!el || reduce || !window.ScrambleTextPlugin) return;
    el.addEventListener("mouseenter", () => {
      if (gsap.isTweening(el)) return;
      const r = el.getBoundingClientRect();
      gsap.set(el, { width: r.width, display: "inline-block", overflowX: "clip" });
      gsap.to(el, { duration: 0.7, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false }, overwrite: true, onComplete: () => gsap.set(el, { clearProps: "width,display,overflowX" }) });
    });
  }

  // Logo transition frames (original logo Lottie 12fps 15 frames) — each frame the body presses and stretches like breathing and tilts its head slightly (15 frames of our logo). Loader · phone menu logo share it
  const logoPose = (svg, frame) => { const a = (frame / 15) * Math.PI * 2; svg.style.transform = `rotate(${(Math.sin(a) * 6).toFixed(2)}deg) scale(${(1 + Math.sin(a * 2) * 0.04).toFixed(3)}, ${(1 - Math.sin(a * 2) * 0.05).toFixed(3)})`; };

  // ── Loader (original Loader) — a 48px logo centered over the fog loops through 15 frames at 12fps (1.25s per loop), and when a loop ends, if all resources have arrived
  // After .3s it shrinks to 0 over .5s power3.out and clears at .3s (then page entrance and mist rise). On desktop the ‹Sound on› cursor is at 75% screen height
  // Appears (.2s power2.in) and follows the cursor in .3s power3. On phone the first page doesn’t wait a full lap and shrinks after 1.6s (original HeroMobile).
  const loader = (() => {
    const after = [], waits = [];
    let finished = false;
    const finish = () => { if (finished) return; finished = true; html.classList.remove("ps-loading"); after.splice(0).forEach((f) => f()); };
    const api = { after: (f) => (finished ? f() : after.push(f)), waitFor: (p) => waits.push(p), start: finish };
    if (reduce || !window.gsap) return api;
    html.classList.add("ps-loading");
    const el = document.createElement("div");
    el.className = "ps-loader";
    el.innerHTML = `<span class="ps-loader__logo" role="img" aria-label="Loading">${LOGO}</span>`;
    document.body.append(el);
    const logo = el.firstElementChild, art = logo.firstElementChild;
    let cursor = null;
    if (!isPhone()) {
      cursor = document.createElement("div");
      cursor.className = "ps-scursor";
      cursor.innerHTML = `<span class="ps-scursor__icon">${"<i></i>".repeat(6)}</span><span class="ps-scursor__text ps-sub-sm">Click to enable sound</span>`;
      el.append(cursor);
      el.classList.add("has-cursor");
      gsap.set(cursor, { visibility: "visible", xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight * 0.75 });
      gsap.timeline().from(".ps-scursor__icon", { scale: 0, duration: 0.2, ease: "power2.in" }).from(".ps-scursor__text", { opacity: 0, duration: 0.2, ease: "power2.in" }, "<+=0.1");
      const qx = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3" }), qy = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3" });
      const follow = (e) => { qx(e.clientX); qy(e.clientY); };
      addEventListener("mousemove", follow);
      api.after(() => removeEventListener("mousemove", follow));
      el.addEventListener("click", () => gsap.timeline().to(".ps-scursor__icon", { scale: 0, duration: 0.2, ease: "power2.in" }).to(".ps-scursor__text", { opacity: 0, duration: 0.2, ease: "power2.in" }, "<+=0.1").add(() => el.classList.remove("has-cursor")));
    }
    let frame = 0, ready = false, leaving = false;
    const draw = () => logoPose(art, frame);
    const leave = (delay) => {
      leaving = true;
      gsap.timeline({ delay }).to(logo, { scale: 0, duration: 0.5, ease: "power3.out" }).add(() => { clearInterval(timer); el.remove(); finish(); }, 0.3);
      if (cursor) gsap.timeline().to(".ps-scursor__icon", { scale: 0, duration: 0.2, ease: "power2.in" }).to(".ps-scursor__text", { opacity: 0, duration: 0.2, ease: "power2.in" }, "<+=0.1");
    };
    const timer = setInterval(() => { frame = (frame + 1) % 15; draw(); if (frame === 0 && ready && !leaving) leave(0.3); }, 1000 / 12);
    draw();
    document.addEventListener("DOMContentLoaded", () => {
      if (isPhone() && document.body.dataset.page === "home") { leave(1.6); return; }
      const cap = (p) => Promise.race([p, new Promise((r) => setTimeout(r, 4000))]);
      cap(Promise.all([new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))), document.fonts ? document.fonts.ready : 0, ...waits])).then(() => (ready = true));
    });
    return api;
  })();

  // ── Fill in header · menu · footer ──
  function buildHeader() {
    const slot = document.querySelector('[data-slot="header"]');
    if (!slot) return;
    slot.innerHTML = `
      <a class="ps-logo" href="index.html" aria-label="To the first page">${LOGO}</a>
      <button class="ps-menu-btn" type="button" aria-label="Open Menu" aria-expanded="false">
        <span class="dot dot-1"></span><span class="dot dot-2"></span><span class="dot dot-3"></span><span class="dot dot-4"></span>
        <span class="line line-1"></span><span class="line line-2"></span>
        <span class="ps-close-label ps-sub-sm" aria-hidden="true">Close</span>
      </button>
      <button class="ps-sound" type="button" aria-label="Sound Off" data-spark="circle" data-spark-click><span></span><span></span><span></span><span></span><span></span><span></span></button>`;
    // Phone — a nav where the bottom pill grows upward into a panel (original NavigationMobile). Inside the panel: a ‹Let’s talk› button · first page + menu rows
    const nav = document.createElement("nav");
    nav.className = "ps-mnav";
    nav.setAttribute("aria-label", "Main menu");
    nav.innerHTML = `
      <button class="ps-mnav__btn" type="button" aria-expanded="false" aria-controls="ps-mnav-panel"><span class="ps-mnav__text" data-label="Your brand’s English name here">Studio®</span><span class="ps-mnav__icons"><span class="ps-mnav__icon-text">Menu</span>${DOTS}</span></button>
      <div class="ps-mnav__bg"><a class="ps-mnav__logo" href="index.html" aria-label="To the first page">${LOGO}</a></div>
      <div class="ps-mnav__wrap" id="ps-mnav-panel" inert>
        <div class="ps-mnav__talk"><a class="ps-mnav__talk-btn" href="#">Let’s talk</a></div>
        <ul class="ps-mnav__list">${[["index.html", "Home"], ...MENU].map(([h, t, sup]) => `<li class="ps-mnav__item"><a href="${h}"${sup ? ` data-sup="${sup}"` : ""}>${t}</a><div class="ps-mnav__item-line"><span class="ps-line"></span></div></li>`).join("")}</ul>
      </div>`;
    slot.after(nav);
  }
  function buildMenu() {
    const slot = document.querySelector('[data-slot="menu"]');
    if (!slot) return;
    slot.className = "ps-nav is-shut";
    slot.setAttribute("aria-label", "Main menu");
    slot.setAttribute("inert", "");
    slot.innerHTML = `
      <div class="ps-nav__bg"></div>
      <div class="ps-nav__wrap"><div class="ps-nav__grid">
        <div class="ps-nav__video"><div class="player__container" data-flip-id="reel-menu">
          <div class="player__wrapper" data-flip-id="reel-menu"><div class="player__preview">
            <video class="player__preview_video" src="reel-preview-a.mp4" muted loop playsinline preload="metadata" data-label="Showreel preview video · close-up of a human eye, red and green light in the iris · 16:9 loop (plays when the menu opens)"></video>
            <div class="player__preview_overlay"></div></div>
            <div class="ps-nav__vctl ps-sub-sm"><i class="plus">${PLUS}</i><i class="plus">${PLUS}</i><span class="ps-scr">Play reel</span><button class="play-btn" type="button" aria-label="Play Reel" tabindex="-1">${PLAY}</button><span class="ps-scr">01:07 sec</span><i class="plus">${PLUS}</i><i class="plus">${PLUS}</i></div>
          </div></div></div>
        <ul class="ps-nav__list">${MENU.map(([h, t, sup]) => `<li class="ps-nav__item"><a href="${h}"${sup ? ` data-sup="${sup}"` : ""}>${t}</a><div class="ps-nav__item-line"><span class="ps-line" style="display:block"></span></div></li>`).join("")}</ul>
        <div class="ps-nav__talk"><div class="ps-nav__talk-line"><span class="ps-line" style="display:block"></span></div><a class="ps-nav__talk-btn" href="#">Contact</a><div class="ps-nav__talk-line"><span class="ps-line" style="display:block"></span></div></div>
      </div></div>`;
  }
  function buildFooter() {
    const slot = document.querySelector('[data-slot="footer"]');
    if (!slot) return;
    slot.classList.add("ps-footer");
    const zones = [["WLG", 13], ["CITY", 11], ["SING", 8], ["CALI", -8]];
    slot.innerHTML = `
      <ul class="ps-footer__links ps-btn-text">${FOOT.map(([h, t], i) => `${i ? '<li class="sep"><span class="ps-line"></span></li>' : ""}<li><a class="ps-scr" data-hover-scr href="${h}">${t}</a></li>`).join("")}</ul>
      <section class="ps-brief" data-slot="brief">
        <div class="ps-brief__idea ps-sub"><span class="ps-brief__plus">${PLUS}${PLUS}</span><span class="ps-brief__idea-text" data-scr-in>Preparing something big?</span><span class="ps-brief__plus">${PLUS}${PLUS}</span></div>
        <a class="ps-brief__title" href="#" data-brief-title data-label="Your large one-line English heading calling for contact here"><span class="ps-brief__base">Say hello</span><span class="ps-brief__mask" aria-hidden="true">Say hello</span><span class="ps-brief__dots" aria-hidden="true"><i class="dl"></i><i class="dc"></i><i class="dr"></i></span></a>
        <p class="ps-brief__email">Or email us: <a class="ps-scr" data-hover-scr href="#">hello@example.com</a></p>
      </section>
      <div class="ps-footer__bottom">
        <ul class="ps-footer__awards">${["Award 1", "Award 2", "Award 3", "Award 4", "Award 5", "Award 6"].map((t) => `<li><a href="#"><span class="wf-logo">${t}</span></a></li>`).join("")}</ul>
        <div class="ps-footer__clocks">${zones.map(([c, off]) => `<div class="ps-tz" data-off="${off}"><span>${c}</span><svg viewBox="0 0 14 14" fill="none"><circle class="c" cx="7" cy="7" r="6.5"/><line class="h" x1="7" y1="7" x2="7" y2="3.5"/><line class="m" x1="7" y1="7" x2="7" y2="1.8"/></svg><span class="t">0:00</span></div>`).join("")}</div>
        <span class="ps-badge">Partner Badge <b>Tier</b></span>
      </div>`;
  }

  // Clock — each city’s hands turn every second with a time offset
  function clocks() {
    const tz = document.querySelectorAll(".ps-tz");
    if (!tz.length) return;
    const tick = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      tz.forEach((el) => {
        const d = new Date(utc + Number(el.dataset.off) * 3600000);
        const h = d.getHours(), m = d.getMinutes();
        el.querySelector(".h").setAttribute("transform", `rotate(${((h % 12) + m / 60) * 30} 7 7)`);
        el.querySelector(".m").setAttribute("transform", `rotate(${m * 6} 7 7)`);
        el.querySelector(".t").textContent = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  // ── Menu: button’s four dots + panel open and close ──
  function menu() {
    const btn = document.querySelector(".ps-menu-btn");
    const nav = document.querySelector(".ps-nav");
    if (!btn || !nav || !window.gsap) return;
    const dots = [...btn.querySelectorAll(".dot")];
    const [d1, d2, d3, d4] = dots;
    const lines = btn.querySelectorAll(".line");
    const bg = nav.querySelector(".ps-nav__bg");
    const wrap = nav.querySelector(".ps-nav__wrap");
    const video = nav.querySelector(".ps-nav__video .player__preview");
    const clip = nav.querySelector(".ps-nav__video .player__preview_video");
    const items = [...nav.querySelectorAll(".ps-nav__item")];
    const itemLines = nav.querySelectorAll(".ps-nav__item-line .ps-line");
    const vctl = [...nav.querySelectorAll(".ps-nav__vctl .ps-scr")].flatMap((el) => split(el));
    const talk = nav.querySelector(".ps-nav__talk");
    const talkBtn = nav.querySelector(".ps-nav__talk-btn");
    const talkLines = nav.querySelectorAll(".ps-nav__talk-line .ps-line");
    items.forEach((li) => split(li.querySelector("a")));
    gsap.set(lines[0], { xPercent: -50, yPercent: -50, rotation: 45, scaleX: 0 });
    gsap.set(lines[1], { xPercent: -50, yPercent: -50, rotation: -45, scaleX: 0 });
    const pi = "power2.inOut";
    let open = false;
    let busy = false;
    const gather = () => gsap.timeline()
      .to(dots, { opacity: 0, duration: 0.001, stagger: { amount: 0.15, from: "random" }, overwrite: "auto" })
      .set(d1, { x: 5, y: 5 }).set(d2, { x: -5, y: 5 }).set(d3, { x: 5, y: -5 }).set(d4, { x: -5, y: -5 })
      .to(dots, { opacity: 1, duration: 0.001 }, "+=0.1");
    const scatter = () => gsap.timeline()
      .to(dots, { opacity: 0, duration: 0.001 }, "+=0.1")
      .set(dots, { x: 0, y: 0 })
      .to(dots, { opacity: 1, duration: 0.001, stagger: { amount: 0.15, from: "random" }, overwrite: "auto" }, "+=0.1");
    let hov = null;
    const shut = () => !open && !window.PS.reel?.isOpen();
    btn.addEventListener("mouseenter", () => { if (busy) return; hov?.kill(); hov = shut() ? gather() : gsap.to(lines, { scaleX: 1.4, duration: 0.3, ease: pi }); });
    btn.addEventListener("mouseleave", () => { if (!busy && shut()) { hov?.kill(); hov = scatter(); } });

    const openTl = () => {
      const tl = gsap.timeline({ onComplete: () => (busy = false) });
      tl.set([items, talk], { clearProps: "opacity" })
        .to(bg, { scaleY: 1, duration: 1, ease: "expo.inOut" }, "step1")
        .to(wrap, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, ease: "expo.inOut" }, "step1")
        .fromTo(video, { clipPath: "inset(50% 0% round 20px)" }, { clipPath: "inset(0% 0% round 20px)", duration: 1, ease: "power4.inOut" }, "step1+=0.1")
        .fromTo(itemLines, { width: "0%" }, { width: "100%", duration: 1.5, ease: "power2.inOut", stagger: 0.07 }, "step1")
        .fromTo(vctl, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: 0.3, from: "random" } }, "step1+=0.6")
        .fromTo(talkBtn, { scale: 0 }, { scale: 1, duration: 0.5, ease: "power2.in" }, "step1+=0.25")
        .fromTo(talkBtn, { clipPath: "inset(0% 35% round 64px)" }, { clipPath: "inset(0% 0% round 64px)", duration: 1, ease: "power2.out" }, ">")
        .fromTo(talkLines, { width: "0%" }, { width: "100%", duration: 1, ease: "power3.inOut" }, "<");
      if (window.ScrambleTextPlugin) tl.to(talkBtn, { duration: 1, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false } }, "<");
      tl.add(() => clip?.play().catch(() => {}));
      // Text reveal — original line timeline (delay .3, each item starts .15 after the previous)
      const chars = gsap.timeline({ delay: 0.3 });
      items.forEach((li) => chars.add(gsap.fromTo(li.querySelectorAll(".ch"), { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: 0.22, from: "random" } }), "<+=0.15"));
      return tl;
    };
    const closeTl = () => gsap.timeline({ onComplete: () => { busy = false; nav.classList.add("is-shut"); } })
      .add(() => clip?.pause())
      .to(talk, { opacity: 0, duration: 0.3, ease: "power2.out" }, "init")
      .to(items, { opacity: 0, duration: 0.2, ease: "power2.out", stagger: { amount: 0.2, from: "end" } }, "init+=0.1")
      .fromTo(video, { clipPath: "inset(0% 0% round 20px)" }, { clipPath: "inset(50% 0% round 20px)", duration: 1, ease: "power4.inOut" }, "init")
      .to(bg, { scaleY: 0, duration: 1, ease: "expo.inOut" }, "init")
      .to(wrap, { clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)", duration: 1, ease: "expo.inOut" }, "init");

    const toggle = () => {
      // While the showreel window is open this button is Close (original HeaderNavigationButton)
      if (window.PS.reel?.isOpen()) { window.PS.reel.close(); return; }
      if (busy || window.PS.reel?.isBusy()) return;
      hov?.kill(); hov = null;
      busy = true;
      open = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      nav.classList.toggle("is-open", open);
      if (open) nav.classList.remove("is-shut");
      open ? nav.removeAttribute("inert") : nav.setAttribute("inert", "");
      window.psLenis && (open ? window.psLenis.stop() : !window.PS.reel?.isOpen() && window.psLenis.start());
      if (open) {
        gsap.timeline()
          .to(d1, { x: -2, y: -2, duration: 0.3, ease: pi }, 0).to(d2, { x: 2, y: -2, duration: 0.3, ease: pi }, 0)
          .to(d3, { x: -2, y: 2, duration: 0.3, ease: pi }, 0).to(d4, { x: 2, y: 2, duration: 0.3, ease: pi }, 0)
          .to(lines, { scaleX: 1.4, duration: 0.3, ease: pi }, 0);
        openTl();
      } else {
        gsap.timeline()
          .to(d1, { x: 5, y: 5, duration: 0.3, ease: pi }, 0).to(d2, { x: -5, y: 5, duration: 0.3, ease: pi }, 0)
          .to(d3, { x: 5, y: -5, duration: 0.3, ease: pi }, 0).to(d4, { x: -5, y: -5, duration: 0.3, ease: pi }, 0)
          .to(lines, { scaleX: 0, duration: 0.3, ease: pi }, 0)
          .to(dots, { opacity: 0, duration: 0.001 }, "+=0.1").set(dots, { x: 0, y: 0 })
          .to(dots, { opacity: 1, duration: 0.001, stagger: { amount: 0.15, from: "random" } }, "+=0.1");
        closeTl();
      }
    };
    btn.addEventListener("click", toggle);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open && !window.PS.reel?.isOpen()) toggle(); });
    window.PS.menuOpen = () => open;
    // Contact button inside the panel: on hover the text rolls over in .5s
    if (talkBtn && window.ScrambleTextPlugin) {
      talkBtn.addEventListener("mouseenter", () => { if (!gsap.isTweening(talkBtn)) gsap.to(talkBtn, { duration: 0.5, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false } }); });
    }
  }

  // Six sound-button bars — when on, each rises and falls randomly 1 to 7x in height over (.2~.6)/1.5 s power1.inOut, and when off returns to 1x over .3s power2.out (original SoundButton)
  function soundLines(b, speed = 1.5) {
    const lines = [...b.querySelectorAll(":scope > span")];
    const wave = (el) => gsap.to(el, { scaleY: 1 + Math.random() * 6, duration: (0.2 + Math.random() * 0.4) / speed, ease: "power1.inOut", onComplete: () => wave(el) });
    return (muted) => {
      if (!window.gsap) return;
      lines.forEach((el) => { gsap.killTweensOf(el); muted || reduce ? gsap.to(el, { scaleY: 1, duration: 0.3, ease: "power2.out" }) : wave(el); });
    };
  }
  function sound() {
    const b = document.querySelector(".ps-sound");
    if (!b) return;
    const set = soundLines(b);
    set(false);
    b.addEventListener("click", () => {
      const off = b.classList.toggle("is-muted");
      b.setAttribute("aria-label", off ? "Sound On" : "Sound Off");
      set(off);
    });
  }

  // Phone pill nav (original NavigationMobile) — open: background 48px → board height 1s expo.inOut, logo spot 16·16 scale 1 (1.1s), button text MENU→CLOSE roll 1s,
  // Icon 45° 1s, clip inside the panel from bottom to top 1s expo.inOut, name erased at .3s (+.3), lines .5s apart .07 from the end (+.4), line 1s power2.inOut (+.1), story button clip .7s (+.5).
  // Closing is reversed: button clip .5s power3.inOut, lines .5s gap .04, logo 4·10 scale .72 (.9s), clip 1s, background 48px 1s, name .3s (+.4)
  function mobileNav() {
    const nav = document.querySelector(".ps-mnav");
    if (!nav || !window.gsap) return;
    const btn = nav.querySelector(".ps-mnav__btn"), wrap = nav.querySelector(".ps-mnav__wrap"), bg = nav.querySelector(".ps-mnav__bg");
    const logo = nav.querySelector(".ps-mnav__logo"), icon = nav.querySelector(".ps-mnav__icon"), iconText = nav.querySelector(".ps-mnav__icon-text");
    const text = nav.querySelector(".ps-mnav__text"), talkBtn = nav.querySelector(".ps-mnav__talk-btn");
    const items = [...nav.querySelectorAll(".ps-mnav__item")], lines = [...nav.querySelectorAll(".ps-mnav__item-line .ps-line")];
    const E = "expo.inOut";
    // Logo lottie at 1.25x — 15 frames in 1s, forward on open, backward on close
    const art = logo.querySelector("svg"), lf = { f: 0 };
    const flip = (to) => gsap.to(lf, { f: to, duration: reduce ? 0 : Math.abs(to - lf.f) / 15, ease: "none", overwrite: true, onUpdate: () => logoPose(art, Math.round(lf.f)) });
    let open = false, tl = null;
    const toggle = () => {
      tl?.kill();
      flip(open ? 0 : 15);
      tl = gsap.timeline();
      if (open) {
        tl.fromTo(talkBtn, { clipPath: "inset(0% 0% round 36px)" }, { clipPath: "inset(50% 0% round 36px)", duration: 0.5, ease: "power3.inOut" }, "open")
          .to(items, { opacity: 0, duration: 0.5, stagger: { each: 0.04, from: "start" } }, "open")
          .to(logo, { top: 4, left: 10, scale: 0.72, duration: 0.9, ease: E }, "open")
          .fromTo(wrap, { clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)" }, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0 100%)", duration: 1, ease: E }, "open")
          .to(bg, { height: 48, duration: 1, ease: E }, "open")
          .to(iconText, { duration: 1, scrambleText: { text: "Menu", chars: SCR_UP, tweenLength: false } }, "open")
          .to(icon, { rotate: 0, duration: 1, ease: E }, "open")
          .to(text, { opacity: 1, duration: 0.3 }, "open+=0.4");
      } else {
        tl.to(bg, { height: "100%", duration: 1, ease: E }, "open")
          .to(logo, { top: 16, left: 16, scale: 1, duration: 1.1, ease: E }, "open")
          .to(iconText, { duration: 1, scrambleText: { text: "Close", chars: SCR_UP, tweenLength: false } }, "open")
          .to(icon, { rotate: 45, duration: 1, ease: E }, "open")
          .to(wrap, { clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)", duration: 1, ease: E }, "open")
          .to(text, { opacity: 0, duration: 0.3 }, "open+=0.3")
          .fromTo(items, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: { each: 0.07, from: "end" } }, "open+=0.4")
          .fromTo(lines, { width: "0%" }, { width: "100%", duration: 1, ease: "power2.inOut", stagger: { each: 0.07, from: "end" } }, "open+=0.1")
          .fromTo(talkBtn, { clipPath: "inset(50% 0% round 36px)" }, { clipPath: "inset(0% 0% round 36px)", duration: 0.7, ease: "power2.inOut" }, "open+=0.5");
      }
      open = !open;
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      open ? wrap.removeAttribute("inert") : wrap.setAttribute("inert", "");
      window.psLenis && (open ? window.psLenis.stop() : window.psLenis.start());
    };
    btn.addEventListener("click", toggle);
    nav.querySelectorAll(".ps-mnav__wrap a, .ps-mnav__logo").forEach((a) => a.addEventListener("click", () => { if (open) toggle(); }));
  }


  // Border spark — original useBtnSpark: two streaks, each 5% of the perimeter, start at top center and bottom center and travel half a turn in the same direction (clockwise) over .5s power1.out (brightness up to .4 in .09s sine.out, fading out over .125s from .425s),
  // The whole border floats up to .05 over .125s, then fades out from .35s over .175s. The pill follows a rounded-rectangle path, the sound button a circle path
  function sparks() {
    const NS = "http://www.w3.org/2000/svg";
    document.querySelectorAll("[data-spark]").forEach((el) => {
      if (el.querySelector(".ps-spark")) return;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "ps-spark");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("aria-hidden", "true");
      const mk = (c) => { const p = document.createElementNS(NS, "path"); p.setAttribute("class", c); svg.append(p); return p; };
      const outline = mk("ps-spark__outline"), a = mk("ps-spark__s"), b = mk("ps-spark__s");
      el.append(svg);
      let len = 0, offs = [0, 0];
      const build = () => {
        const w = el.offsetWidth, h = el.offsetHeight;
        if (!w || !h) return;
        let d;
        if (el.dataset.spark === "circle") { const n = w / 2, r = h / 2, i = Math.min(w, h) / 2; d = `M ${n} ${r - i} A ${i} ${i} 0 0 1 ${n} ${r + i} A ${i} ${i} 0 0 1 ${n} ${r - i} Z`; offs = [0, -Math.PI * i]; }
        else { const rad = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24, h / 2), s = w - 2 * rad; d = `M ${rad} 0 H ${w - rad} A ${rad} ${rad} 0 0 1 ${w - rad} ${h} H ${rad} A ${rad} ${rad} 0 0 1 ${rad} 0 Z`; offs = [-s / 2, -(s + Math.PI * rad + s / 2)]; }
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        [outline, a, b].forEach((p) => p.setAttribute("d", d));
        len = outline.getTotalLength();
        [a, b].forEach((p, k) => { p.style.strokeDasharray = `1 ${len - 1}`; p.style.strokeDashoffset = String(offs[k]); p.style.opacity = "0"; });
        outline.style.opacity = "0";
      };
      build();
      new ResizeObserver(build).observe(el);
      let tl = null;
      const play = () => {
        if (reduce || !len) return;
        tl?.kill();
        const seg = len * 0.05, half = len / 2, st = { v: 0 };
        tl = gsap.timeline();
        [a, b].forEach((p, k) => { tl.set(p, { strokeDasharray: `1 ${len - 1}`, strokeDashoffset: offs[k], opacity: 0 }, 0); tl.to(p, { opacity: 0.4, duration: 0.09, ease: "sine.out" }, 0).to(p, { opacity: 0, duration: 0.125, ease: "sine.in" }, 0.425); });
        tl.to(st, { v: 1, duration: 0.5, ease: "power1.out", onUpdate: () => {
          const g = 1 + (seg - 1) * Math.sin(st.v * Math.PI);
          a.style.strokeDasharray = `${g} ${len - g}`; b.style.strokeDasharray = `${g} ${len - g}`;
          a.style.strokeDashoffset = String(offs[0] - st.v * half); b.style.strokeDashoffset = String(offs[1] - st.v * half);
        } }, 0);
        tl.fromTo(outline, { opacity: 0 }, { opacity: 0.05, duration: 0.125, ease: "sine.out" }, 0).to(outline, { opacity: 0, duration: 0.175, ease: "sine.in" }, 0.35);
      };
      // As in the original, plays one frame later (requestAnimationFrame)
      el.addEventListener("mouseenter", () => requestAnimationFrame(play));
      if (el.dataset.sparkClick !== undefined) el.addEventListener("pointerdown", () => requestAnimationFrame(play));
    });
    // Button text — on hover rolls into symbols in .5s and back to place (original btn__visible scramble)
    if (!reduce && window.ScrambleTextPlugin) document.querySelectorAll("[data-btn-scr]").forEach((el) => {
      const t = el.querySelector(".ps-scr") || el;
      el.addEventListener("mouseenter", () => { if (!gsap.isTweening(t)) gsap.to(t, { duration: 0.5, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false } }); });
    });
  }

  // ── Smooth scroll ──
  function smooth() {
    if (reduce || !window.Lenis) return;
    const lenis = new Lenis({ lerp: 0.1 });
    window.psLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Pass CSS variable colors to shaders and canvas as 0..1 RGB ──
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function cssColor(name, el = html) {
    const span = document.createElement("span");
    span.style.color = `var(${name})`;
    span.style.display = "none";
    el.append(span);
    const c = getComputedStyle(span).color;
    span.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  const cssHex = (name) => "#" + cssColor(name).map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

  // ── Back mist (three) — original MistField: resolution .5·max 520k pixels·speed .35·tint #2f9bb5·accent .45·five palette colors ──
  // Original is a cloud ray-marched through 3D noise in 52 steps, while the copy layers two domain-warp fbm passes like depth to get the same texture.
  // What the page passes in: setWindow (glow bleed at the video spot) · setCards (glow around images) · setForm (center bead gathering) · setFx (footer inhale · vortex) · uFig… (service head shape, service.js)
  const FRAG = `
    precision highp float;
    #define FIG_GAIN 0.45
    uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec2 uVel; uniform vec2 uPar; uniform float uWakeK; uniform float uTravel;
    uniform vec3 uBg; uniform vec3 uTint; uniform vec3 uPal[5]; uniform float uAccent; uniform float uForm; uniform float uLight;
    uniform vec4 uWin; uniform float uWinOn; uniform vec4 uCard[6]; uniform vec3 uCardCol[6]; uniform float uCardN;
    uniform vec3 uFx; uniform float uEnd; uniform float uDim; uniform float uShafts;
    uniform float uFig; uniform vec2 uFigN; uniform float uFigMix; uniform float uFigTurn; uniform float uFigTwist; uniform float uFigPhase;
    uniform float uFigWild; uniform vec2 uFigNote; uniform vec2 uFigHue; uniform float uFigColour; uniform float uFigWeb;
    varying vec2 vUv;
    vec3 palC(float x){ x = clamp(x, 0.0, 1.0) * 4.0;
      return x < 1.0 ? mix(uPal[0], uPal[1], x) : x < 2.0 ? mix(uPal[1], uPal[2], x - 1.0) : x < 3.0 ? mix(uPal[2], uPal[3], x - 2.0) : mix(uPal[3], uPal[4], x - 3.0); }
    // Shape cross-section — multiplier fitting the distance to the edge in direction a to circle 1. n sides (vertex up, square has a side up) · 0 circle · negative is a rounded-square window
    float figEdge(float a, float n, out float w){
      w = 6.2831853 / (n < 0.5 ? 8.0 : n);
      float b = a - 1.5707963 + (abs(n - 4.0) < 0.5 ? w * 0.5 : 0.0);
      return b - (floor(b / w) + 0.5) * w;
    }
    float figK(float a, float n){
      if (n < -0.5) { vec2 q = abs(vec2(cos(a), sin(a))) / vec2(1.25, 0.95); return pow(dot(pow(q, vec2(7.0)), vec2(1.0)), 1.0 / 7.0); }
      if (n < 0.5) return 1.0;
      float w; float l = figEdge(a, n, w);
      return 0.82 * cos(l) / cos(w * 0.5);
    }
    // Threads running along the depth — strong at the corners, faint at the middle of the sides. Each distance × tunnel radius so the thickness stays the same throughout the depth
    float figWeb(float a, float n, float rr){
      float c, s;
      if (n < -0.5) { float aq = atan(abs(sin(a)), abs(cos(a))); c = abs(aq - 0.6496); s = min(aq, 1.5707963 - aq); }
      else { float w; float l = figEdge(a, n, w); s = abs(l); c = w * 0.5 - s; }
      vec2 e = vec2(c / 0.045, s / 0.032) * rr;
      return exp(-e.x * e.x) + 0.4 * exp(-e.y * e.y);
    }
    // Kaleidoscope — folds the vibrating plate’s nodal lines (Chladni) toward a mirror with double the side count
    float figPlate(float a, float fr, float n){
      float w = 6.2831853 / (n < -0.5 ? 4.0 : (n < 0.5 ? 10.0 : n * 2.0));
      float fa = abs(mod(a, w) - w * 0.5);
      vec2 q = fr * 1.5707963 * vec2(cos(fa), sin(fa));
      vec2 nx = uFigNote * q.x, ny = uFigNote * q.y;
      float f = cos(nx.x) * cos(ny.y) - cos(nx.y) * cos(ny.x);
      return exp(-f * f / 0.045);
    }
    float h31(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vnoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
    float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    void main(){
      vec2 px = vUv * uRes;
      float asp = uRes.x / uRes.y;
      vec2 uv = (vUv - 0.5) * vec2(asp, 1.0);
      vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
      float t = uTime;
      // Swirl (Footer) — winds around the center as an axis
      float sw = uFx.y * 1.6 * exp(-dot(uv, uv) * 1.4);
      uv = mat2(cos(sw), -sin(sw), sin(sw), cos(sw)) * uv;
      // Inhale — pulled into the center
      uv *= 1.0 + uFx.x * 0.35 * exp(-dot(uv, uv));
      vec3 p = vec3(uv * 1.35 + uPar, t * 0.06);
      p.y -= uTravel * 0.35;
      // Fog bends away only while the cursor moves (original wake 1 · radius .1) — a push plus a slight twist, no light trail. When it stops the velocity settles and fades.
      vec2 dm = uv - m;
      float cf = exp(-dot(dm, dm) / 0.1);
      vec2 wake = (uVel * 0.55 + vec2(-dm.y, dm.x) * length(uVel) * 1.4) * cf;
      p.xy -= wake * uWakeK;
      vec3 q = vec3(fbm(p + vec3(0.0, 0.0, t * 0.05)), fbm(p + vec3(5.2, 1.3, -t * 0.04)), 0.0);
      float d1 = fbm(p * 1.0 + vec3(q.xy * 1.8, 0.0));
      float d2 = fbm(p * 0.55 + vec3(q.yx * 1.2, 3.7) + vec3(0.0, 0.0, t * 0.03));
      float dens = smoothstep(0.32, 0.92, d1 * 0.62 + d2 * 0.55);
      // Orb (original shape orb) — gathers like a large iris in the screen center. uForm goes to 0 as it passes the hero
      float r = length(uv * vec2(1.0, 1.08));
      float orb = smoothstep(0.62, 0.12, r) * (0.55 + 0.45 * smoothstep(0.05, 0.3, r));
      float ring = exp(-pow((r - 0.33) / 0.07, 2.0));
      dens = mix(dens, max(dens, orb * (0.6 + 0.6 * d1) + ring * 0.35 * d2), uForm);
      // Light beams (original shafts .85) — stage lights striking down from beyond the top center of the screen, visible only where the fog is thick
      if (uShafts > 0.0) {
        vec2 o = uv - vec2(0.0, 0.95);
        float ang = atan(o.x, -o.y);
        float rays = pow(abs(sin(ang * 5.0 + 0.6 + sin(t * 0.07) * 0.3)), 18.0) + 0.6 * pow(abs(sin(ang * 3.0 - 0.4)), 26.0);
        dens += rays * smoothstep(1.9, 0.2, length(o)) * uShafts * (0.35 + d2 * 0.9);
      }
      // Kaleidoscope figure (the original service’s header figure) — peers into a polygonal tunnel of radius 1.25 with focal length 1.4. The original paints inside the ray march, but
      // The copy solves the depth D at which each pixel hits the tunnel wall directly, and paints the wireframe (approaching the camera) · corner threads · joints · signals · pattern at every 1/0.6 depth
      float fgk = 0.0; float fgHue = 0.0;
      if (uFig > 0.001) {
        vec2 fu = (vUv - 0.5) * vec2(asp, 1.0);
        float rs = max(length(fu), 1e-3);
        float a0 = atan(fu.y, fu.x) + uFigTurn;
        float D = 1.75 / (rs * mix(figK(a0, uFigN.x), figK(a0, uFigN.y), uFigMix));
        float az = a0 + uFigTwist * (7.0 - D);
        D = 1.75 / (rs * mix(figK(az, uFigN.x), figK(az, uFigN.y), uFigMix));
        float fz = 7.0 - D, rr = rs * D / 1.4;
        float fzv = fz * 0.6 - uFigPhase;
        float fi = floor(fzv + 0.5), ff = fzv - fi;
        // In deep areas the frame gets thinner than one pixel and flickers — widen it to the on-screen thickness
        float aw = fwidth(fzv);
        float frame = exp(-ff * ff / (0.016 + aw * aw));
        float node = exp(-ff * ff / (0.03 + aw * aw));
        float sg = (fract(fz * 0.11 + t * 0.2 + floor(az * 1.9) * 0.37) - 0.5) / 0.03;
        float th = mix(figWeb(az, uFigN.x, rr), figWeb(az, uFigN.y, rr), uFigMix) * uFigWeb;
        // Like the original ray progression, fog in front piles up and hides deep walls (transmission attenuation) — near walls (screen edges) show mostly and the deep center fades.
        // Near and far ones fade out like the original progress window (.5~2.2 · 8.5~13)
        float wgt = smoothstep(0.6, 2.2, D) * smoothstep(13.0, 8.5, D) * exp(-max(D - 2.0, 0.0) * 0.3);
        float fg = wgt * (0.1 + frame + th * (0.75 + node * 1.2 + exp(-sg * sg) * 1.6));
        if (uFigWild > 0.01) {
          float fr = rs * 5.0;
          float fill = mix(figPlate(a0, fr, uFigN.x), figPlate(a0, fr, uFigN.y), uFigMix) * smoothstep(3.6, 2.0, fr) * smoothstep(0.15, 0.6, fr);
          fg += fill * uFigWild * 0.55;
        }
        fg *= mix(1.0, smoothstep(0.2, 0.7, d1 + 0.3), 0.35 + 0.3 * uFigWild) * uFig * FIG_GAIN;
        dens = dens * (1.0 - 0.5 * uFig * exp(-dot(fu, fu) * 1.8)) + fg;
        fgk = clamp(fg * 1.4, 0.0, 1.0) * uFigColour;
        fgHue = uFigHue.x + fi * uFigHue.y;
      }
      // Color: tint clouds over the background, spreading only where the palette color chosen by another noise is dark
      float sel = fbm(vec3(uv * 0.6 + 7.0, t * 0.02)) * 4.999;
      int k = int(floor(sel));
      vec3 pc = uPal[0];
      if (k == 1) pc = uPal[1]; else if (k == 2) pc = uPal[2]; else if (k == 3) pc = uPal[3]; else if (k == 4) pc = uPal[4];
      vec3 pc2 = mix(uPal[4], uPal[0], smoothstep(-0.4, 0.6, uv.x));
      vec3 cloud = mix(uTint, pc, uAccent * smoothstep(0.35, 0.95, d2) * 0.8);
      // Footer section — red and magenta fill in and brighten
      cloud = mix(cloud, mix(uPal[1], uPal[0], d1), uEnd * 0.55 * smoothstep(0.2, 0.8, d2));
      cloud = mix(cloud, pc2, uFx.z * 0.3);
      // Each frame has its own shape color — the rougher it gets, the more color rises and the colors split per frame
      cloud = mix(cloud, palC(1.0 - abs(fract(fgHue * 0.5) * 2.0 - 1.0)) * 1.3, fgk);
      vec3 col = uBg + cloud * pow(dens, 1.6) * (0.42 + uEnd * 0.25 + uFx.z * 0.2) * uLight;
      // Light bleed around the video slot — red on the left, green on the right, blue on top (original bleed: the showreel colors leak out as fog)
      if (uWinOn > 0.001) {
        vec2 c = (uWin.xy + uWin.zw) * 0.5; vec2 b = (uWin.zw - uWin.xy) * 0.5;
        float sd = sdBox(px - c, b, 20.0);
        float reach = 0.12 * uRes.y;
        float glow = exp(-max(sd, 0.0) / reach);
        float gx = clamp((px.x - uWin.x) / max(1.0, uWin.z - uWin.x), 0.0, 1.0);
        vec3 gc = mix(uPal[1], uPal[2], smoothstep(0.35, 0.75, gx));
        gc = mix(gc, uPal[4], smoothstep(0.6, 1.0, (px.y - uWin.y) / max(1.0, uWin.w - uWin.y)) * 0.5);
        col += gc * glow * uWinOn * (0.35 + 0.45 * d1) * 0.8;
      }
      // Glow around the image (original MistCard) — the image’s own color lights the mist outside its area
      for (int i = 0; i < 6; i++) {
        if (float(i) >= uCardN) break;
        vec4 R = uCard[i];
        vec2 c = (R.xy + R.zw) * 0.5; vec2 b = (R.zw - R.xy) * 0.5;
        float sd = sdBox(px - c, b, 10.0);
        float g = exp(-max(sd, 0.0) / (0.12 * uRes.y));
        col += uCardCol[i] * g * 0.22 * (0.4 + dens);
      }
      // Darken edges
      col *= mix(1.0, smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(asp * 0.8, 1.0))), 0.6);
      col = mix(uBg, col, uDim);
      gl_FragColor = vec4(col, 1.0);
    }`;

  // The original is world 1 at depth 7 (camera rd.z 1.4) = Screen height 1/5, duplicate noise is screen height 1 = 1.35 — world values are scaled by ×0.27.
  // Original wake bend is wake × (0.5 + 1.2·closeness) → ×0.92 at depth 7, parallax is parallax .25 × 2 × 0.5
  const WAKE_K = 0.92 * 0.27, PAR_K = 0.25 * 2 * 0.5 * 0.27;
  function mist() {
    const host = document.querySelector("[data-mist]");
    if (!host || !window.THREE) return null;
    const THREE = window.THREE;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { return null; }
    host.classList.add("ps-mist");
    host.prepend(renderer.domElement);
    const scan = document.createElement("div");
    scan.className = "ps-mist__scan";
    host.append(scan);
    const pal = ["--site-magenta", "--site-red", "--site-green", "--site-cyan", "--site-electric"].map((n) => new THREE.Vector3(...cssColor(n)));
    const U = {
      uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uVel: { value: new THREE.Vector2() },
      uPar: { value: new THREE.Vector2() }, uWakeK: { value: WAKE_K },
      uTravel: { value: 0 }, uBg: { value: new THREE.Vector3(...cssColor("--kf-bg")) }, uTint: { value: new THREE.Vector3(...cssColor("--site-tint")) },
      uPal: { value: pal }, uAccent: { value: 0.45 }, uForm: { value: Number(host.dataset.form ?? 1) }, uLight: { value: 1 },
      uWin: { value: new THREE.Vector4() }, uWinOn: { value: 0 },
      uCard: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) }, uCardCol: { value: Array.from({ length: 6 }, () => new THREE.Vector3()) }, uCardN: { value: 0 },
      uFx: { value: new THREE.Vector3() }, uEnd: { value: 0 }, uDim: { value: 0 }, uShafts: { value: Number(host.dataset.shafts ?? 0) * 0.85 },
      uFig: { value: 0 }, uFigN: { value: new THREE.Vector2(3, 3) }, uFigMix: { value: 1 }, uFigTurn: { value: 0 }, uFigTwist: { value: 0.03 }, uFigPhase: { value: 0 },
      uFigWild: { value: 0 }, uFigNote: { value: new THREE.Vector2(2, 3.5) }, uFigHue: { value: new THREE.Vector2() }, uFigColour: { value: 0 }, uFigWeb: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv; void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: FRAG, depthTest: false });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    renderer.compile(scene, cam);
    let pr = 0.5;
    const size = () => {
      const w = innerWidth, h = innerHeight;
      pr = Math.min(0.5, Math.sqrt(520000 / (w * h)));
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      U.uRes.value.set(w * pr, h * pr);
    };
    size();
    addEventListener("resize", size);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, seen: false };
    // The original also listens only to mousemove — on phones it bends once at the tapped spot and doesn’t react to dragging
    addEventListener("mousemove", (e) => {
      mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight;
      if (!mouse.seen) { mouse.seen = true; mouse.px = mouse.tx; mouse.py = mouse.ty; }
    }, { passive: true });
    const api = {
      el: host,
      setWindow(rect, on) {
        if (!rect) { U.uWinOn.value = 0; return; }
        const H = innerHeight;
        U.uWin.value.set(rect.left * pr, (H - rect.bottom) * pr, rect.right * pr, (H - rect.top) * pr);
        U.uWinOn.value = on;
      },
      setCards(list) {
        const H = innerHeight;
        const n = Math.min(6, list.length);
        U.uCardN.value = n;
        for (let i = 0; i < n; i++) {
          const { rect: r, color } = list[i];
          U.uCard.value[i].set(r.left * pr, (H - r.bottom) * pr, r.right * pr, (H - r.top) * pr);
          U.uCardCol.value[i].set(...color);
        }
      },
      set(key, v) { if (U[key]) U[key].value = v; },
      get(key) { return U[key]?.value; },
      setFx(o) { gsap.to(U.uFx.value, { x: o.inhale ?? 0, y: o.swirl ?? 0, z: o.lift ?? 0, duration: 0.8, ease: "power2.out", overwrite: true }); },
      palette: pal.map((v) => [v.x, v.y, v.z]),
    };
    // Once the loader clears, rises from the background over 2s
    if (window.gsap) loader.after(() => gsap.to(U.uDim, { value: 1, duration: reduce ? 0 : 2, ease: "power1.out" }));
    else U.uDim.value = 1;
    const t0 = performance.now();
    let last = 0;
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      const dt = Math.max(1 / 240, Math.min(0.05, t - last));
      last = t;
      if (!reduce) {
        U.uTime.value += dt * 0.35 * 2.2;
        // Original values: speed is screen ratio per second clamped to ±1.2 and followed at 2.2/s, position followed at 4/s. Parallax stays at its spawn position
        const clamp = (v) => Math.max(-1.2, Math.min(1.2, v));
        const kv = 1 - Math.exp(-dt * 2.2), kp = 1 - Math.exp(-dt * 4);
        mouse.vx += (clamp((mouse.tx - mouse.px) / dt) - mouse.vx) * kv;
        mouse.vy += (clamp((mouse.ty - mouse.py) / dt) - mouse.vy) * kv;
        mouse.x += (mouse.tx - mouse.x) * kp; mouse.y += (mouse.ty - mouse.y) * kp;
        mouse.px = mouse.tx; mouse.py = mouse.ty;
        U.uMouse.value.set(mouse.x, mouse.y);
        U.uVel.value.set(mouse.vx, mouse.vy);
        U.uPar.value.set(-(mouse.tx - 0.5) * PAR_K, -(mouse.ty - 0.5) * PAR_K);
        U.uTravel.value += ((scrollY / innerHeight) - U.uTravel.value) * 0.08;
      }
      if (typeof api.onFrame === "function") api.onFrame(dt);
      renderer.render(scene, cam);
      if (!reduce) requestAnimationFrame(loop);
    };
    loop();
    if (reduce) addEventListener("scroll", () => renderer.render(scene, cam), { passive: true });
    return api;
  }

  // Near the footer the fog does inhale, swirl and lift (original inhale .5 · swirl .3 · lift .4, smoothstep over the last 0.9 screen)
  function footerMist(m) {
    if (!m || !document.querySelector(".ps-footer")) return;
    let last = -1;
    const upd = () => {
      const rest = document.documentElement.scrollHeight - innerHeight - scrollY;
      const n = Math.min(Math.max(1 - rest / (innerHeight * 0.9), 0), 1);
      const s = n * n * (3 - 2 * n);
      m.set("uEnd", s);
      if (Math.abs(s - last) < 0.01 && !(s === 0 && last > 0)) return;
      last = s;
      m.setFx({ inhale: 0.5 * s, swirl: 0.3 * s, lift: 0.4 * s });
    };
    addEventListener("scroll", upd, { passive: true });
    upd();
  }

  // When it enters the screen the text lights up in random order and resolves — [data-scr-in]
  function scrIn() {
    const els = document.querySelectorAll("[data-scr-in]");
    if (!els.length || reduce || !window.ScrollTrigger) return;
    els.forEach((el) => {
      const chars = split(el);
      gsap.set(chars, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => scrambleIn(chars, { dur: Number(el.dataset.dur || 1.4), amount: Number(el.dataset.amount || 0.6) }) });
    });
  }

  // Big brief title: original Brief. The white cover text opens outward from the 55% vertical line over .8s power3.out (and closes over the same length on release),
  // The dotted left and right lines below shrink to 0 over .8s power1.in, then grow back from the center over .8s power1.out, repeating while hovered
  function brief() {
    const t = document.querySelector("[data-brief-title]");
    if (!t) return;
    const mask = t.querySelector(".ps-brief__mask"), dl = t.querySelector(".dl"), dr = t.querySelector(".dr");
    const chars = split(t.querySelector(".ps-brief__base"));
    if (reduce || !window.ScrollTrigger) return;
    gsap.set(chars, { opacity: 0 });
    ScrollTrigger.create({ trigger: t, start: "top 85%", once: true, onEnter: () => gsap.to(chars, { opacity: 1, duration: 0.01, stagger: { amount: 0.6, from: "random" } }) });
    const N = gsap.timeline({ paused: true })
      .to([dl, dr], { duration: 0.8, width: "0%", ease: "power1.in", overwrite: "auto" })
      .set(dl, { left: "50%" }).set(dr, { right: "50%" })
      .to([dl, dr], { duration: 0.8, width: "50%", ease: "power1.out", overwrite: "auto" });
    t.addEventListener("mouseenter", () => { gsap.to(mask, { duration: 0.8, clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)", ease: "power3.out", overwrite: "auto" }); N.repeat(-1).restart(); });
    t.addEventListener("mouseleave", () => { gsap.to(mask, { duration: 0.8, clipPath: "polygon(55% 0, 55% 0, 55% 100%, 55% 100%)", ease: "power3.out", overwrite: "auto" }); N.repeat(0).reverse(); });
  }

  function reveals() {
    const els = document.querySelectorAll(".ps-reveal");
    html.classList.add("ps-ready");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    els.forEach((e) => io.observe(e));
  }

  // Three dots at the card corner: as in the original, on hover all three blink for .5s (delays 0, .2, .3)
  function dotFlicker() {
    document.querySelectorAll("[data-flick]").forEach((card) => {
      const dots = card.querySelectorAll(".ps-dots3 span");
      card.addEventListener("mouseenter", () => dots.forEach((d, i) => { d.style.animation = "none"; void d.offsetWidth; d.style.animation = `ps-flicker-3 .5s ${[0, 0.2, 0.3][i]}s forwards`; }));
    });
  }

  buildHeader();
  buildMenu();
  buildFooter();
  window.PS = { split, scrambleIn, hoverScramble, cssColor, cssHex, soundLines, reduce, isPhone, SCR_SYM, SCR_UP, PLUS, PLAY, loader };
  document.addEventListener("DOMContentLoaded", () => {
    smooth();
    menu();
    mobileNav();
    sound();
    clocks();
    const m = mist();
    window.PS.mist = m;
    footerMist(m);
    document.querySelectorAll("[data-hover-scr]").forEach(hoverScramble);
    scrIn();
    brief();
    reveals();
    dotFlicker();
    sparks();
    // Page entrance starts after the loader lifts. Subpages: three heads rise from 0x over .75s power3.out (original page head timeline +.2). The first page is set up by the hero timeline
    loader.after(() => {
      if (!html.classList.contains("ps-intro-wait") && window.gsap && !reduce) gsap.from([".ps-logo", ".ps-menu-btn", ".ps-sound"], { scale: 0, opacity: 0, duration: 0.75, ease: "power3.out", delay: 0.5 });
      document.dispatchEvent(new CustomEvent("ps:ready"));
      // The automatic re-measure on window load passed before the loader — re-measure the trigger positions the page created once more.
      window.ScrollTrigger?.refresh();
    });
    if (reduce || !window.gsap) loader.start();
  });
})();
