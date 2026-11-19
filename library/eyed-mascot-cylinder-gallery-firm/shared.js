// Shared by all pages: loader, header band, menu laid behind (page shrinks and settles down), page transition, contact band·text band·footer, smooth scroll.
(() => {
  const SVG = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ed-eyes" viewBox="0 0 132 84"><circle cx="40" cy="46" r="33" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="7"/><circle cx="96" cy="40" r="30" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="7"/><circle class="ed-pupil" cx="50" cy="52" r="12" fill="var(--kf-ink)"/><circle class="ed-pupil" cx="104" cy="46" r="11" fill="var(--kf-ink)"/></symbol>
  <symbol id="ed-kun" viewBox="0 0 100 150"><circle cx="50" cy="52" r="34" fill="currentColor"/><circle cx="50" cy="108" r="40" fill="currentColor"/><circle cx="50" cy="52" r="11" fill="var(--kf-bg)"/><circle cx="50" cy="108" r="13" fill="var(--kf-bg)"/><circle cx="36" cy="22" r="15" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="5"/><circle cx="64" cy="20" r="14" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="5"/><circle cx="40" cy="25" r="6" fill="var(--kf-ink)"/><circle cx="67" cy="23" r="6" fill="var(--kf-ink)"/></symbol>
  <symbol id="ed-glasses" viewBox="0 0 64 64"><g transform="rotate(-28 32 32)" stroke="var(--kf-ink)" stroke-width="4"><circle cx="20" cy="34" r="15" fill="var(--site-c-gold)"/><circle cx="45" cy="34" r="15" fill="var(--site-c-gold)"/><circle cx="20" cy="34" r="6" fill="var(--kf-ink)"/><circle cx="45" cy="34" r="6" fill="var(--kf-ink)"/></g><path d="M40 8c6 2 10 6 12 12" fill="none" stroke="var(--kf-ink)" stroke-width="4" stroke-linecap="round"/></symbol>
  <symbol id="ed-cross" viewBox="0 0 64 64"><g stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><rect x="27" y="4" width="13" height="56" rx="6" fill="var(--site-c-gold)" transform="rotate(42 32 32)"/><rect x="27" y="4" width="13" height="56" rx="6" fill="var(--site-c-gold)" transform="rotate(-42 32 32)"/></g></symbol>
  <symbol id="ed-hand-point" viewBox="0 0 64 64"><g fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><rect x="3" y="24" width="13" height="24" rx="4"/><path d="M16 22h16a9 9 0 0 1 9 9v12a11 11 0 0 1-11 11H16z"/><rect x="30" y="20" width="30" height="11" rx="5.5"/><path d="M28 37h12M28 45h10" fill="none"/></g></symbol>
  <symbol id="ed-hand-thumb" viewBox="0 0 64 64"><g fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><rect x="12" y="46" width="26" height="14" rx="4"/><rect x="10" y="26" width="38" height="22" rx="9"/><rect x="14" y="4" width="13" height="28" rx="6.5"/><path d="M30 33h16M30 40h14" fill="none"/></g></symbol>
  <symbol id="ed-hand-open" viewBox="0 0 64 70"><g fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><rect x="14" y="5" width="9" height="30" rx="4.5" transform="rotate(-12 18 20)"/><rect x="25" y="2" width="9" height="32" rx="4.5"/><rect x="36" y="4" width="9" height="30" rx="4.5" transform="rotate(10 40 20)"/><rect x="45" y="14" width="9" height="24" rx="4.5" transform="rotate(24 50 26)"/><path d="M12 30h40v16a16 16 0 0 1-16 16h-8A16 16 0 0 1 12 46z"/><rect x="2" y="30" width="10" height="22" rx="5" transform="rotate(-30 7 41)"/><rect x="20" y="58" width="22" height="10" rx="3"/></g></symbol>
  <symbol id="ed-hand-grip" viewBox="0 0 87 46"><g fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><path d="M6 40c0-14 4-22 12-24M81 40c0-14-4-22-12-24" fill="none"/><rect x="18" y="6" width="14" height="34" rx="7"/><rect x="31" y="3" width="14" height="37" rx="7"/><rect x="44" y="3" width="14" height="37" rx="7"/><rect x="57" y="6" width="13" height="34" rx="6.5"/></g></symbol>
  <symbol id="ed-pen-hand" viewBox="0 0 64 64"><g fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"><path d="M14 46l30-36 6 5-30 36-8 3z"/><path d="M26 38c4-6 12-8 18-4 6 4 8 12 4 18-4 6-12 8-18 4" /><path d="M30 48h10M32 54h8" fill="none"/></g></symbol>
  <symbol id="ed-insta" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16.8" cy="7.3" r="1.1" fill="currentColor"/></symbol>
  <symbol id="ed-arrow" viewBox="0 0 31 21"><path d="M1 10.5h27M19 2l9 8.5-9 8.5" fill="none" stroke="currentColor" stroke-width="3"/></symbol>
  <symbol id="ed-blank" viewBox="0 0 12 12"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
  <symbol id="ed-caret" viewBox="0 0 12 10"><path d="M0 0h12L6 10z" fill="currentColor"/></symbol>
</svg>`;

  const NAV = [
    { head: "ABOUT", href: "about.html", items: [["About first page", "about.html"], ["Promise and values", "about.html"], ["Company and History", "about.html"], ["Group company", "about.html"], ["Local Activities", "about.html"]] },
    { head: "SERVICE", href: "service.html", items: [["Service home page", "service.html"], ["Service Site", "#", true]] },
    { head: "CAREERS", href: "recruit.html", items: [["Careers home page", "recruit.html"], ["Employee Stories", "recruit.html"], ["Event", "recruit.html"], ["New Grad Hiring", "recruit-detail.html"], ["Experienced hiring", "recruit-detail.html"], ["Part-Time Hiring", "recruit-detail.html"]] },
    { head: "JOURNAL", href: "news.html", items: [["All Posts", "news.html"], ["News", "news.html"], ["Announcement", "news.html"], ["Media", "news.html"], ["Others", "news.html"]] },
    { head: "CONTACT", href: "#", items: [["General Inquiries", "#"], ["Collaboration Inquiry", "#"]] },
  ];
  const navLink = ([label, href, blank]) =>
    `<a class="ed-nav-link" href="${href}"${blank ? ' data-blank' : ""}>${label}${blank ? '<svg class="ed-ic-blank"><use href="#ed-blank"/></svg>' : ""}</a>`;

  const LOGO = `<svg class="ed-logo__mark" viewBox="0 0 20 32"><circle cx="10" cy="9" r="7.4" fill="none" stroke="currentColor" stroke-width="4.6"/><circle cx="10" cy="23" r="8" fill="none" stroke="currentColor" stroke-width="4.6"/></svg><span class="ed-logo__word"><b>BRAND</b> NAME</span>`;

  const header = `
<header class="ed-header" data-slot="header"><div class="ed-header__in">
  <a class="ed-logo" href="index.html" aria-label="First Page">${LOGO}</a>
  <div class="ed-header__nav">
    <a class="ed-header__sns" href="#" aria-label="Social Media"><svg><use href="#ed-insta"/></svg></a>
    <button class="ed-menu-btn" type="button" aria-expanded="false"><span class="ed-menu-btn__label">MENU</span>
      <span class="ed-menu-btn__icon"><svg class="is-open"><use href="#ed-glasses"/></svg><svg class="is-close"><use href="#ed-cross"/></svg></span></button>
  </div>
</div></header>`;

  const SNS = ["Social Media", "X", "Line", "Tick-tock", "Brand", "Brand", "Video"];
  const menu = `
<div class="ed-menu" id="ed-menu" data-slot="menu">
  <div class="ed-menu__nav" id="ed-menu-nav">
    ${NAV.map((s) => `<div class="ed-menu__sec"><p class="ed-menu__head">${s.head}</p><div class="ed-menu__list">${s.items.map(navLink).join("")}</div></div>`).join("")}
    <div class="ed-menu__sec"><p class="ed-menu__head">SNS / SOCIAL MEDIA</p><div class="ed-menu__sns">${SNS.map((n) => `<a href="#" aria-label="${n}"><span>${n.slice(0, 1)}</span></a>`).join("")}</div></div>
  </div>
  <svg class="ed-menu__kun" id="ed-menu-kun"><use href="#ed-kun"/></svg>
</div>
<svg class="ed-hand-grip is-left" aria-hidden="true"><use href="#ed-hand-grip"/></svg>
<svg class="ed-hand-grip is-right" aria-hidden="true"><use href="#ed-hand-grip"/></svg>`;

  const loader = `
<div class="ed-loader" data-slot="loader"><p class="ed-loader__num"><span class="ed-odo" role="img" aria-label="0">${[2, 1, 0].map((r) => `<span class="ed-odo__digit" aria-hidden="true"><span class="ed-odo__reel">${Array.from({ length: Math.floor(100 / 10 ** r) + 1 }, (_, i) => `<span>${i % 10}</span>`).join("")}</span></span>`).join("")}</span>%</p>
  <svg class="ed-loader__kun"><use href="#ed-kun"/></svg><svg class="ed-loader__good"><use href="#ed-hand-thumb"/></svg></div>`;

  const contact = `
<section class="ed-contact" data-slot="contact">
  <div class="ed-contact__bg" aria-hidden="true">${["8 BACK", "GROUND", "WORDS"].map((w) => `<p class="ed-contact__bgItem"><span data-fx="slot-scrub-chars" data-fx-slot-scrub-chars="within: .ed-contact; end: top top">${w}</span></p>`).join("")}</div>
  <div class="ed-contact__in">
    <h2 class="ed-contact__head"><span class="ed-contact__headItem"><svg class="ed-contact__eye"><use href="#ed-eyes"/></svg><span data-fx="slot-scrub-chars" data-fx-slot-scrub-chars="on: view">CONTACT</span></span></h2>
    <p class="ed-contact__desc"><span class="ed-contact__descText">Your one line here saying you can consult about anything.<br>One more line here on the scope of inquiries.
      <svg class="ed-contact__hand"><use href="#ed-hand-open"/></svg></span></p>
    <div class="ed-contact__btnWrap"><a class="ed-flip-btn" href="#"><span class="ed-flip-btn__def">Contact Us <svg><use href="#ed-arrow"/></svg></span><span class="ed-flip-btn__hv" aria-hidden="true">Contact Us <svg><use href="#ed-arrow"/></svg></span></a></div>
  </div>
</section>`;

  const deco = `<span class="ed-deco__script">script</span><span class="ed-deco__thin">wordmark.</span><span class="ed-deco__bold">BRAND</span><svg class="ed-deco__kun"><use href="#ed-kun"/></svg>`;
  const footer = `
<div class="ed-foot" data-slot="footer">
  <div class="ed-deco" data-slot="boundary-marquee"><div class="ed-deco__track" data-loop="-1">${deco}${deco}${deco}</div></div>
  <footer class="ed-footer" id="ed-footer"><div class="ed-footer__main" id="ed-footer-main">
    <div class="ed-footer__top">
      <a class="ed-footer__logo" href="index.html" aria-label="First Page">
        <span class="ed-footer__kun"><svg class="ed-footer__eight" viewBox="0 0 172 287"><path fill="var(--kf-contrast-ink)" d="M86 0a76 76 0 1 1 0 152A76 76 0 1 1 86 0zM86 115a86 86 0 1 1 0 172A86 86 0 1 1 86 115z"/><circle cx="86" cy="76" r="30" fill="var(--kf-contrast-bg)"/><circle cx="86" cy="201" r="33" fill="var(--kf-contrast-bg)"/></svg>
          <svg class="ed-footer__eyes" viewBox="0 0 132 84"><circle cx="40" cy="46" r="33" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="7"/><circle cx="96" cy="40" r="30" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="7"/><g class="ed-footer__look"><circle class="ed-footer__pupil" cx="40" cy="46" r="12" fill="var(--kf-ink)"/><circle class="ed-footer__pupil" cx="96" cy="40" r="11" fill="var(--kf-ink)"/></g><g class="ed-footer__smile" fill="none" stroke="var(--kf-ink)" stroke-width="7" stroke-linecap="round"><path d="M26 50q14-16 28 0"/><path d="M83 44q13-15 26 0"/></g></svg>
          <svg class="ed-footer__prop" data-prop="paper" viewBox="0 0 48 60"><path d="M6 4h26l10 10v42H6z" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"/><path d="M14 24h20M14 33h20M14 42h12" stroke="var(--kf-ink)" stroke-width="4" stroke-linecap="round"/></svg>
          <svg class="ed-footer__prop" data-prop="good"><use href="#ed-hand-thumb"/></svg>
          <svg class="ed-footer__prop" data-prop="mail" viewBox="0 0 64 46"><rect x="3" y="3" width="58" height="40" rx="5" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="4"/><path d="M5 7l27 20L59 7" fill="none" stroke="var(--kf-ink)" stroke-width="4" stroke-linejoin="round"/></svg></span>
        <span class="ed-footer__word"><b>BRAND</b> NAME</span></a>
      <nav class="ed-footer__nav">${NAV.map((s, i) => `<div class="ed-footer__col"><p class="ed-footer__head">${s.head}</p><div class="ed-footer__body">${s.items.map(navLink).join("")}</div></div>`).join("")}</nav>
    </div>
    <div class="ed-strip" data-slot="photo-strip"><canvas class="ed-strip__gl" aria-hidden="true" data-label="Nine videos same as the hero (inside a shop, building front, cafe display, etc. · 16:9 landscape) flow in a bow-curved band"></canvas></div>
    <div class="ed-footer__more"><p class="ed-footer__moreHead">KEEP IN TOUCH ON…</p><div class="ed-footer__moreList">${SNS.map((n) => `<a href="#">${n}</a>`).join("")}</div></div>
    <div class="ed-footer__bottom"><small>Copyright © BRAND NAME</small><a href="#" class="ed-footer__pp">Privacy policy</a></div>
  </div></footer>
</div>`;

  document.body.insertAdjacentHTML("afterbegin", SVG + loader + header + menu);
  document.querySelector("[data-ed=contact]")?.insertAdjacentHTML("afterend", contact);
  document.querySelector("[data-ed=contact]")?.remove();
  document.querySelector("[data-ed=footer]")?.insertAdjacentHTML("afterend", footer);
  document.querySelector("[data-ed=footer]")?.remove();

  gsap.registerPlugin(ScrollTrigger);
  const html = document.documentElement;
  const layout = document.getElementById("ed-layout");
  const menuEl = document.getElementById("ed-menu");
  const menuNav = document.getElementById("ed-menu-nav");
  const kun = document.getElementById("ed-menu-kun");
  const hands = document.querySelectorAll(".ed-hand-grip");
  const btn = document.querySelector(".ed-menu-btn");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const remPx = () => parseFloat(getComputedStyle(html).fontSize);

  const lenis = reduce ? null : new Lenis({ lerp: 0.1 });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ED = { lenis, reduce, remPx };

  // 3×3 video grid — one video wound by both the original Hero cylinder and the footer band (nine 16:9 cells · 6.08s loop). The loader preloads this on every page.
  // Opened from a server, it wraps the placeholder video as is, and opened via file:// the browser blocks uploading video to WebGL, so the same cell and the same 6.08s loop are drawn on a canvas.
  const tiles = (() => {
    const served = /^https?:$/.test(location.protocol);
    let video = document.querySelector(".ed-tiles-video");
    if (!video) {
      video = document.createElement("video");
      Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "auto" });
      video.className = "ed-tiles-video";
      video.setAttribute("aria-hidden", "true");
      if (served) video.crossOrigin = "anonymous";
      video.src = "media/fv-tiles.mp4";
      document.body.append(video);
    } else if (served) { video.crossOrigin = "anonymous"; video.src = video.getAttribute("src"); }
    if (served && !reduce) video.play().catch(() => {});
    const LABELS = ["Store stairs and shelves · daytime indoor light", "Building front and waterside · clear daytime", "Cafe display shelf and window · backlit", "Shopping street · afternoon", "House living room · window light",
      "Team members at the workbench · bright interior", "Restaurant terrace · evening", "Office lounge · ceiling pipes", "Bread Display · Natural Light"];
    const sheet = served ? null : Object.assign(document.createElement("canvas"), { width: 1280, height: 720 });
    const css = getComputedStyle(html);
    let painted = -1;
    const paint = (time) => {
      if (!sheet || time === painted) return;
      painted = time;
      const g = sheet.getContext("2d"), tw = sheet.width / 3, th = sheet.height / 3, p = (time % 6.08) / 6.08;
      for (let tile = 0; tile < 9; tile++) {
        const x = (tile % 3) * tw, y = Math.floor(tile / 3) * th;
        g.save(); g.beginPath(); g.rect(x, y, tw, th); g.clip();
        g.fillStyle = css.getPropertyValue("--kf-raised"); g.fillRect(x, y, tw, th);
        g.fillStyle = css.getPropertyValue("--kf-surface"); g.globalAlpha = 0.45;
        g.fillRect(x + ((p * 2 + tile * 0.13) % 1) * (tw + 120) - 120, y, 60, th);
        g.globalAlpha = 1; g.strokeStyle = css.getPropertyValue("--kf-line"); g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + tw, y + th); g.moveTo(x + tw, y); g.lineTo(x, y + th); g.stroke();
        g.fillStyle = css.getPropertyValue("--kf-dim"); g.font = `600 18px ${css.getPropertyValue("--kf-font-sans")}`;
        g.fillText(`Video ${9 - tile} · ${LABELS[8 - tile]}`, x + 18, y + th - 22);
        g.restore();
      }
    };
    return {
      texture: () => {
        const tex = sheet ? new THREE.CanvasTexture(sheet) : new THREE.VideoTexture(video);
        tex.colorSpace = THREE.NoColorSpace;
        return tex;
      },
      frame: (time, tex) => { if (!sheet) return; paint(time); tex.needsUpdate = true; },
    };
  })();
  window.ED.tiles = tiles;

  // Page grip point — aligned to the top edge of the shrunken page
  const placeHands = (scale, top) => {
    const w = innerWidth * scale;
    const left = (innerWidth - w) / 2;
    const r = remPx();
    gsap.set(hands[0], { left: left + 16 * r, top: top - 22 * r });
    gsap.set(hands[1], { left: left + w - 16 * r - 87 * r, top: top - 22 * r });
  };

  // Menu: the page (layout) shrinks by the menu cell width and sinks down by that height. On phones it moves aside
  let open = false;
  const setMenu = (v) => {
    open = v;
    btn.setAttribute("aria-expanded", v);
    btn.querySelector(".ed-menu-btn__label").textContent = v ? "CLOSE" : "MENU";
    html.classList.toggle("is-menu-open", v);
    const mobile = matchMedia("(max-width: 960px)").matches;
    if (v) {
      gsap.set(menuEl, { display: "block", pointerEvents: "auto" });
      lenis?.stop();
    } else lenis?.start();
    const r = menuNav.getBoundingClientRect();
    const scale = mobile ? 1 : r.width / innerWidth;
    const top = mobile ? 0 : r.height;
    gsap.set(layout, { transformOrigin: `50% ${scrollY}px` });
    gsap.to(layout, {
      scale: v ? scale : 1, y: v ? top : 0,
      x: v && mobile ? -(innerWidth - 10 * remPx()) : 0,
      ease: v ? "back.out(1.0)" : "back.in(1.0)", duration: reduce ? 0 : 0.6, overwrite: "auto",
      onComplete: () => { if (!open) { gsap.set(menuEl, { display: "none", pointerEvents: "none" }); gsap.set(layout, { clearProps: "transform" }); } },
    });
    gsap.to(layout, { borderRadius: v ? 20 * remPx() : 0, duration: reduce ? 0 : 0.6, ease: "expo.inOut" });
    gsap.to(".ed-menu-btn__icon .is-open", { scale: v ? 0 : 1, rotate: v ? 0 : 4, duration: 0.5 });
    gsap.to(".ed-menu-btn__icon .is-close", { scale: v ? 1 : 0, rotate: v ? -4 : 0, duration: 0.5 });
    if (!mobile) {
      placeHands(scale, top);
      v ? gsap.fromTo(hands, { y: "-100%", opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "expo.out" })
        : gsap.to(hands, { y: "-100%", opacity: 0, duration: 0.3, delay: 0.3, ease: "expo.in" });
    }
  };
  btn.addEventListener("click", () => setMenu(!open));
  layout.addEventListener("click", (e) => { if (open) { e.preventDefault(); e.stopPropagation(); setMenu(false); } }, true);

  // Page turn: a hand grabs the page → the page slides down (sideways on phone) → the new page rises from the bottom
  const KEY = "ed-transition";
  const leave = (href) => {
    const small = matchMedia("(max-width: 560px)").matches;
    gsap.set(menuEl, { display: "block", pointerEvents: "none" });
    if (!open) { placeHands(1, 0); gsap.fromTo(hands, { y: "-100%", opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out" }); }
    lenis?.stop();
    gsap.timeline({ onComplete: () => { sessionStorage.setItem(KEY, "1"); location.href = href; } })
      .to(layout, { y: small ? 0 : innerHeight * 1.1, x: small ? -innerWidth * 1.1 : 0, scale: 1, duration: reduce ? 0 : 1.6, ease: "expo.inOut" })
      .to(hands, { y: small ? 0 : innerHeight * 1.1, x: small ? -innerWidth * 1.1 : 0, duration: reduce ? 0 : 1.6, ease: "expo.inOut" }, "<")
      .to(kun, { yPercent: 45, duration: reduce ? 0 : 1.6, ease: "expo.inOut" }, "<");
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-blank") || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (open) { setMenu(false); setTimeout(() => leave(href), 650); } else leave(href);
  });

  const loaderEl = document.querySelector(".ed-loader");
  const entering = sessionStorage.getItem(KEY) === "1";
  sessionStorage.removeItem(KEY);
  const ready = new Promise((resolve) => {
    if (entering || reduce) {
      loaderEl.remove();
      if (entering && !reduce) {
        const small = matchMedia("(max-width: 560px)").matches;
        gsap.set(menuEl, { display: "block", pointerEvents: "none" });
        gsap.set(kun, { yPercent: 45 });
        placeHands(1, 0);
        gsap.timeline({ onComplete: resolve })
          .fromTo(layout, { xPercent: small ? -100 : 0, yPercent: small ? 0 : 100 }, { xPercent: 0, yPercent: 0, duration: 1, delay: 0.2, ease: "expo.inOut", onComplete: () => gsap.set(layout, { clearProps: "transform" }) })
          .fromTo(hands, { opacity: 1, xPercent: 0, y: small ? 0 : innerHeight }, { y: 0, duration: 1, ease: "expo.inOut" }, "<")
          .to(kun, { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
          .to(hands, { y: "-100%", opacity: 0, duration: 0.3, delay: 0.2, ease: "expo.in" })
          .set(menuEl, { display: "none" });
      } else resolve();
      return;
    }
    // Loader (original values): progress = min(video received ratio, elapsed time/3s). When done, smiling face 1.2s → the thumb vanishes in .6s and the 8 goes back in .3s with back.in(1.5)
    // drops out the bottom → 2.4s after everything is done it lifts away over .4s and the Hero begins
    lenis?.stop();
    const odo = loaderEl.querySelector(".ed-odo");
    const reels = [...odo.querySelectorAll(".ed-odo__reel")];
    const show = (v) => {
      const n = Math.max(0, Math.min(Math.floor(v), 100));
      odo.setAttribute("aria-label", n);
      reels.forEach((reel, i) => (reel.style.transform = `translateY(${-Math.floor(n / 10 ** (2 - i))}em)`));
    };
    const assets = [...document.querySelectorAll("video[src]")];
    let got = assets.length ? 0 : 1, time = 0;
    assets.forEach((v) => {
      const done = () => { if (v.dataset.loaded) return; v.dataset.loaded = "1"; got += 1 / assets.length; };
      if (v.readyState >= 3) done(); else { v.addEventListener("canplaythrough", done, { once: true }); v.addEventListener("error", done, { once: true }); setTimeout(done, 15000); }
    });
    const t0 = performance.now();
    const tick = () => {
      time = Math.min((performance.now() - t0) / 3000, 1);
      show(100 * Math.min(got, time));
      if (time < 1 || got < 1) return requestAnimationFrame(tick);
      show(100);
      loaderEl.classList.add("is-complete");
      setTimeout(() => {
        gsap.to(".ed-loader__good", { opacity: 0, duration: 0.6, ease: "power2.out" });
        gsap.to(".ed-loader__kun", { translate: "-50% 150%", duration: 0.3, ease: "back.in(1.5)" });
      }, 1200);
      setTimeout(() => { loaderEl.classList.add("is-leaving"); lenis?.start(); resolve(); }, 2400);
      setTimeout(() => loaderEl.remove(), 2800);
    };
    requestAnimationFrame(tick);
  });
  window.ED.ready = ready;

  // Lines of text rising from below (original data-inview-line): stagger .2, power2.inOut, scrub from 90% to 45% at top
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-lines]").forEach((el) => {
      gsap.fromTo(el.querySelectorAll(".ed-line > span"), { yPercent: 100, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.inOut",
        scrollTrigger: { trigger: el, start: "top 90%", end: "top 45%", scrub: true },
      });
    });
    // The footer panel opens from .7 to 1
    gsap.fromTo("#ed-footer-main", { scale: 0.7 }, { scale: 1, scrollTrigger: { trigger: "#ed-footer", start: "top bottom", end: "top 50%", scrub: true } });
  });

  // Hovering the contact button, the hand grows 1.2x and wobbles twice at ±20° (four .2s power2.out), and on release returns to place with sine.out
  const cHand = document.querySelector(".ed-contact__hand");
  const cBtn = document.querySelector(".ed-contact .ed-flip-btn");
  if (cHand && cBtn && !reduce) {
    let wig = null;
    cBtn.addEventListener("mouseenter", () => {
      wig?.pause();
      wig = gsap.timeline().to(cHand, { rotate: 20, scale: 1.2, duration: 0.2, ease: "power2.out" })
        .to(cHand, { rotate: -20, duration: 0.2, ease: "power2.out" }).to(cHand, { rotate: 20, duration: 0.2, ease: "power2.out" }).to(cHand, { rotate: -20, duration: 0.2, ease: "power2.out" });
    });
    cBtn.addEventListener("mouseleave", () => { wig?.pause(); wig = gsap.timeline().to(cHand, { rotate: 0, scale: 1, ease: "sine.out" }); });
  }

  // Endlessly flowing strip — flow direction follows scroll direction (original InfinityLoop, speed ±.4)
  const loops = [...document.querySelectorAll("[data-loop]")].map((track) => ({ track, x: 0, dir: Number(track.dataset.loop) || -1 }));
  let dir = 1;
  lenis?.on("scroll", (e) => { if (e.direction) dir = e.direction; });
  if (!reduce) gsap.ticker.add((t, dt) => {
    for (const l of loops) {
      const half = l.track.scrollWidth / 3;
      if (!half) continue;
      l.x += l.dir * dir * dt * 0.06;
      if (l.x <= -half) l.x += half;
      if (l.x > 0) l.x -= half;
      l.track.style.transform = `translate3d(${l.x}px,0,0)`;
    }
  });


  // Footer photo strip (original WebGL layout in our shader): camera fov 60 · z 7.5 · pixel ratio 1. Visible width ×1.5, and a panel filling the strip height is split into 20 cells
  // The farther from center, the more it bends back by (distance)² × height .3, and 9 slides (2% gap between cells) are wound endlessly in a loop.
  // Flows .02 turns per second in the last scroll direction, and pushes an extra .5 turn from when the strip enters from the screen bottom until it passes 50vh above the screen top
  const stripCanvas = document.querySelector(".ed-strip__gl");
  if (stripCanvas && window.THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas: stripCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    const tex = tiles.texture();
    const uniforms = { uVideo: { value: tex }, uBow: { value: 0 }, uRepeat: { value: 1 }, uOffset: { value: 0 } };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      uniforms, transparent: true,
      vertexShader: `
        uniform float uBow;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float d = abs(uv.x - 0.5) * 2.0;
          p.z -= d * d * uBow;   // The closer to the edge, the further back — a bow-curved strip
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D uVideo;
        uniform float uRepeat;
        uniform float uOffset;
        varying vec2 vUv;
        void main() {
          float s = fract(vUv.x * uRepeat + uOffset);       // Slot for the endlessly continuing row of 9 sections
          float f = fract(s * 9.0);
          if (f < 0.01 || f > 0.99) discard;                // 2% gap between cells
          float img = min(floor(s * 9.0), 8.0);
          vec2 local = (vec2((f - 0.01) / 0.98, vUv.y) - 0.5) / 1.01 + 0.5;
          vec2 cell = vec2(mod(img, 3.0), 2.0 - floor(img / 3.0));
          gl_FragColor = texture2D(uVideo, (local + cell) / 3.0);
        }`,
    }));
    scene.add(mesh);
    let base = 0, flow = 0, push = 0, sdir = 1, on = false;
    const size = () => {
      const w = stripCanvas.clientWidth, h = stripCanvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(30)) * 7.5, vw = vh * (w / h);
      const width = 1.5 * vw, repeat = width / (9 * ((vh * 16 / 9) / 0.98));
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(width, vh, 20, 1);
      uniforms.uBow.value = 0.3 * vh;
      uniforms.uRepeat.value = repeat;
      base = 0.5 / 9 - 0.5 * repeat;
    };
    new ResizeObserver(size).observe(stripCanvas);
    lenis?.on("scroll", (e) => { if (Math.abs(e.velocity) >= 0.01) sdir = e.velocity > 0 ? 1 : -1; });
    ScrollTrigger.create({ trigger: stripCanvas.parentElement, start: "top-=1px bottom", end: "bottom top+=50vh", onToggle: (st) => (on = st.isActive), onUpdate: (st) => (push = 0.5 * st.progress) });
    gsap.ticker.add((t, dtMs) => {
      if (!on) return;
      if (!reduce) flow += 0.02 * sdir * (Math.max(1, dtMs) / 1000);
      uniforms.uOffset.value = base - (flow + push);
      tiles.frame(t, tex);
      renderer.render(scene, camera);
    });
  }

  // Footer 8 (original values): hovering a link makes hidden eyes pop out (32° → −4° · −13% .3s → 0 .5s back.out(1.5)) and each group looks in its assigned direction
  // (Pupil = center + 10% horizontal, 16% vertical × direction, 1.2s power4.out) holds a prop. 1 second after leaving, the eyes turn to 64° and drop 25%, and the prop is lowered
  const kunEyes = document.querySelector(".ed-footer__eyes");
  const look = document.querySelector(".ed-footer__look");
  const smile = document.querySelector(".ed-footer__smile");
  const props = Object.fromEntries([...document.querySelectorAll(".ed-footer__prop")].map((p) => [p.dataset.prop, p]));
  const GAZE = { right: [1, 0], "left-up": [-1, 1], "right-down": [1, -1], down: [0, -1], smile: [0, 0] };
  const COL = [["right", "paper"], ["left-up", "none"], ["right-down", "good"], ["smile", "paper"], ["down", "mail"]];
  let eyesOn = false, propNow = "none", leaveT = 0, gazeTl = null;
  gsap.set(kunEyes, { opacity: 0, yPercent: 25 });
  gsap.set(smile, { opacity: 0 });
  gsap.set(Object.values(props), { opacity: 0 });
  const showEyes = (v) => {
    if (v === eyesOn) return;
    eyesOn = v;
    gsap.killTweensOf(kunEyes);
    v ? gsap.timeline().set(kunEyes, { rotate: 32 }).to(kunEyes, { yPercent: -13, rotate: -4, opacity: 1, duration: 0.3, ease: "back.out(1.5)" }).to(kunEyes, { yPercent: 0, rotate: 0, duration: 0.5, ease: "back.out(1.5)" })
      : gsap.timeline().set(kunEyes, { rotate: 64 }).to(kunEyes, { yPercent: -15, rotate: -7, opacity: 1, duration: 0.2, ease: "back.out(1.5)" }).to(kunEyes, { yPercent: 25, rotate: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)" });
  };
  const setGaze = (g) => {
    const [gx, gy] = GAZE[g];
    gsap.to(look, { x: 6.6 * gx, y: -10.6 * gy, duration: 1.2, ease: "power4.out", overwrite: "auto" });
    gsap.to(look, { opacity: g === "smile" ? 0 : 1, duration: 0.1 });
    gsap.to(smile, { opacity: g === "smile" ? 1 : 0, duration: 0.1 });
    if (g === "smile") { gazeTl?.kill(); gazeTl = gsap.timeline().to(kunEyes, { yPercent: -25, rotate: -6, duration: 0.5, ease: "back.out(1.5)" }).to(kunEyes, { yPercent: 0, rotate: 0, duration: 0.5, ease: "back.out(2.0)" }); }
  };
  const setProp = (type) => {
    if (type === propNow) return;
    if (props[propNow]) gsap.to(props[propNow], { opacity: 0, yPercent: 50, duration: 0.1, ease: "back.in(1.7)", overwrite: "auto" });
    propNow = type;
    const el = props[type];
    if (!el) return;
    if (type === "good") gsap.fromTo(el, { opacity: 0, yPercent: 50, rotate: 0, xPercent: 0 }, { opacity: 1, yPercent: 0, duration: 0.5, delay: 0.2, ease: "back.out(1.7)" });
    else if (type === "mail") gsap.fromTo(el, { opacity: 0, rotate: -80, xPercent: -10, yPercent: -40 }, { opacity: 1, xPercent: -20, yPercent: 0, rotate: 12, duration: 0.5, delay: 0.2, ease: "back.out(1.7)" });
    else gsap.timeline().fromTo(el, { opacity: 0, yPercent: 10, rotate: 0, xPercent: 0 }, { opacity: 1, yPercent: 0, rotate: -20, duration: 0.2, ease: "back.out(1.7)" })
      .to(el, { rotate: 20, duration: 0.2, ease: "none" }).to(el, { rotate: -20, duration: 0.2, ease: "none" }).to(el, { rotate: 20, duration: 0.2, ease: "none" }).to(el, { rotate: 0, duration: 0.2, ease: "back.out(1.7)" });
  };
  document.querySelectorAll(".ed-footer__col").forEach((col, i) => {
    col.querySelectorAll("a").forEach((a) => {
      a.addEventListener("mouseenter", () => { clearTimeout(leaveT); showEyes(true); setGaze(COL[i][0]); setProp(COL[i][1]); });
      a.addEventListener("mouseleave", () => { clearTimeout(leaveT); leaveT = setTimeout(() => { showEyes(false); setProp("none"); }, 1000); });
    });
  });

  // Original InviewAnimation: [data-inview="pop"/  ] once the top edge reaches 90% of the screen, it pops up once from 80rem below and transparent in .8s back.out(2) (delay 0~.5 in .1 steps, random)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll('[data-inview="pop"]').forEach((el) => {
      gsap.set(el, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.fromTo(el, { y: 80 * remPx(), opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: gsap.utils.random(0, 0.5, 0.1), ease: "back.out(2.0)" }) });
    });
  });

  // Numbers, ticks etc. of repeated sections are drawn by each page. Re-measure positions after drawing
  addEventListener("load", () => ScrollTrigger.refresh());
})();
