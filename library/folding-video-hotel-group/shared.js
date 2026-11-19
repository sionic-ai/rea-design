// So that all pages share the same header bar (two tiers + clock), hotel dropdown, menu backdrop and footer, they are all plugged in here at once.
// Original loads fresh without page transitions (async transition off) and scrolls smoothly with Lenis 1.0.42 (duration 1.2 · expo).
(() => {
  const isSp = matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  const I = {
    pen: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 15l1-4 8-8 3 3-8 8-4 1z"/><path d="M10.5 4.5l3 3"/><path d="M2 17h14"/></svg>',
    menu: '<svg class="-shut" viewBox="0 0 38 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 15V4a3 3 0 013-3h30a3 3 0 013 3v11"/><path d="M1 8h36M1 11.5h36M1 15h36"/></svg>',
    close: '<svg class="-open" viewBox="0 0 38 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M13 2l12 12M25 2L13 14"/></svg>',
    globe: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><circle cx="8" cy="8" r="7"/><path d="M1 8h14M8 1c-3 3.5-3 10.5 0 14M8 1c3 3.5 3 10.5 0 14"/></svg>',
    heart: '<svg viewBox="0 0 14 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 11S1 7.4 1 3.8A2.8 2.8 0 017 2.6a2.8 2.8 0 016 1.2C13 7.4 7 11 7 11z"/></svg>',
    hotel: '<svg viewBox="0 0 14 13" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 12.5V1h7v11.5M8 5h5v7.5M0 12.5h14M3 3.5h1M5 3.5h1M3 6h1M5 6h1M3 8.5h1M5 8.5h1M10 7.5h1"/></svg>',
    bag: '<svg viewBox="0 0 10 17" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="3" width="8" height="12" rx="1.5"/><path d="M3.5 3V1h3v2M3 15.5v1M7 15.5v1M3 7h4M3 10h4"/></svg>',
    guide: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="6"/><path d="M9.6 4.4L8 8 4.4 9.6 6 6z"/></svg>',
    plane: '<svg viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M16 1L1 6l5 1.5L16 1 7.5 9 6 7.5M7.5 9l1.5 2.5L16 1"/></svg>',
    glasses: '<svg viewBox="0 0 17 11" fill="none" stroke="currentColor" stroke-width="1"><circle cx="4" cy="7" r="3"/><circle cx="13" cy="7" r="3"/><path d="M7 7c.8-1 2.2-1 3 0M1 7l2-6M16 7l-2-6"/></svg>',
    key: '<svg viewBox="0 0 17 11" fill="none" stroke="currentColor" stroke-width="1"><circle cx="4" cy="7" r="3"/><path d="M6.4 5.2L15 1M12 2.4l1.2 2M14.2 1.4l.9 1.6"/></svg>',
    clock: '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.6 1.4"><circle cx="8.5" cy="8.5" r="7.5"/></svg>',
    arrow: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 6h10M6.5 1.5L11 6l-4.5 4.5"/></svg>',
    down: '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 3l3 3 3-3"/></svg>',
    plus: '<svg class="u-menu__plus" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h10M5 0v10"/></svg>',
    note: '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M1 1h6.5A3.5 3.5 0 0111 4.5V11H8.6V5a1.6 1.6 0 00-1.6-1.6H3.4V11H1z"/></svg>',
    ig: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="1" width="10" height="10" rx="3"/><circle cx="6" cy="6" r="2.3"/><circle cx="8.8" cy="3.2" r=".4" fill="currentColor"/></svg>',
    rooms: '<svg viewBox="0 0 72 48" fill="currentColor"><path d="M0 0h20v28a8 8 0 0016 0V0h10v28a18 18 0 01-36 0z"/><path d="M40 0h14a14 14 0 010 28h-2l12 20H52L40 26z"/></svg>',
  };
  const NAV = [
    { t: "Our Story", i: I.heart, h: "about.html" },
    { t: "Find a Place", i: I.hotel, h: "index.html#brand", drop: true },
    { t: "Journal", i: I.bag, h: "index.html#journal" },
    { t: "Local Notes", i: I.guide, h: "index.html#local" },
    { t: "News & Events", i: I.plane, h: "news.html" },
    { t: "Shop", i: I.glasses, h: "index.html#shop" },
    { t: "Members", i: I.key, h: "reservation.html" },
  ];
  const BRAND = Array.from({ length: 15 }, (_, i) => `Hotel Name ${String(i + 1).padStart(2, "0")}`);
  const SMALL = ["Privacy policy", "Customer service policy", "Press inquiries", "Press Release", "Hiring Info", "Operating company"];
  const ul = (s) => `<span class="u-ul">${s}</span>`;

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("u-header");
    header.innerHTML = `
      <div class="u-header__upper">
        <div class="u-header__upperInner">
          <a class="u-header__resv -en" href="reservation.html">${isSp ? "" : I.pen}<span class="u-header__resvText">${ul("Booking")}</span></a>
          <a class="u-logo" href="index.html" data-label="Brand wordmark (SVG logo slot)">BRAND BRAND</a>
          <button class="u-header__menuBtn -en" type="button" aria-expanded="false" aria-label="Open Menu">
            <span class="u-header__icon">${I.menu}${I.close}</span>
            <span class="u-header__menuText"><p data-menu-open>Menu</p><p class="-close -hidden" data-menu-close>Close</p></span>
          </button>
        </div>
      </div>
      <div class="u-header__under _pc">
        <div class="u-header__underInner">
          <p class="u-lang -en">${I.globe}<span class="u-lang__jp">Ko</span><span class="u-lang__hy">–</span><a class="u-lang__en" href="#">En</a></p>
          <nav class="u-nav -en" aria-label="Main menu"><ul>${NAV.map((n) => `<li><a href="${n.h}" ${n.drop ? "data-drop-link" : "data-not-drop"}>${n.i}${ul(n.t)}</a></li>`).join("")}</ul></nav>
          <div class="u-time -en">
            <p class="u-time__text"><span class="u-time__year"><span data-clock-y>0000</span> <span data-clock-w>Mon</span></span><span class="u-time__date"><span data-clock-m>0</span>.<span data-clock-d>0</span></span></p>
            <div class="u-clock">${I.clock}<div class="u-clock__h" data-clock-h></div><div class="u-clock__m" data-clock-mm></div></div>
          </div>
        </div>
      </div>`;
    if (!isSp) {
      header.insertAdjacentHTML("afterend", `
      <div class="u-drop -en" data-drop>
        <ul class="u-drop__list">${BRAND.map((h) => `<li><a href="index.html#brand" data-drop-item>${ul(h)}</a></li>`).join("")}</ul>
        <p class="u-drop__count">${BRAND.length}</p>
        <div class="u-drop__img">${BRAND.map((h, i) => `<div class="u-ph wf-img${i ? "" : " -selected"}" data-drop-img data-label="${h} Exterior · Day · Square"></div>`).join("")}</div>
      </div>`);
    }
  }

  const menu = document.querySelector("[data-slot=menu-modal]");
  if (menu) {
    menu.classList.add("u-menu");
    const cols = [BRAND.slice(0, 5), BRAND.slice(5, 10), BRAND.slice(10)];
    menu.innerHTML = `
      <div class="u-menu__backdrop" data-menu-backdrop></div>
      <div class="u-menu__panel" data-menu-panel>
        <div class="u-menu__inner" data-menu-inner>
          <div class="u-menu__left _pc">
            ${[1, 2, 3].map((n, i) => `<video class="u-vid${i ? "" : " -current"}" data-menu-video muted playsinline preload="auto" src="media/tall-${n}.mp4" data-label="Room window video · Morning light · Portrait 3:4 · 6s"></video>`).join("")}
          </div>
          <div class="u-menu__right" data-lenis-prevent>
            <div class="u-menu__rightInner">
              <nav class="-en" aria-label="Menu">
                <ul class="u-menu__list">${NAV.map((n) => `<li class="u-menu__item">
                  ${n.drop
                    ? `<button class="u-menu__link" type="button" data-menu-drawer><p>${n.t}</p>${isSp ? I.plus : `<span class="u-arrowBox">${I.arrow}${I.arrow.replace("<svg", '<svg class="-after"')}</span>`}</button>
                       <div class="u-menu__brand" data-menu-brand>${cols.map((c) => `<ul>${c.map((h) => `<li><a href="index.html#brand"><p class="u-ul">${h}</p></a></li>`).join("")}</ul>`).join("")}</div>`
                    : `<a class="u-menu__link" href="${n.h}"><p>${n.t}</p>${isSp ? I.plus : `<span class="u-arrowBox">${I.arrow}${I.arrow.replace("<svg", '<svg class="-after"')}</span>`}</a>`}
                </li>`).join("")}</ul>
              </nav>
              <div class="u-menu__bottom">
                <div class="u-menu__small"><ul>${SMALL.map((s) => `<li><a href="#">${ul(s)}</a></li>`).join("")}</ul></div>
                <div class="u-sns"><a href="#" aria-label="SNS 1">${I.note}${I.note.replace("<svg", '<svg class="-after"')}</a><a href="#" aria-label="SNS 2">${I.ig}${I.ig.replace("<svg", '<svg class="-after"')}</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  const footer = document.querySelector("[data-slot=footer]");
  // The News post also uses the old-style footer without a video strip, as in the original — logo · three hotel columns · one line of small links below
  if (footer && document.body.dataset.footer === "plain") {
    const fcols = [BRAND.slice(0, 5), BRAND.slice(5, 10), BRAND.slice(10)];
    footer.classList.add("u-footer", "-plain");
    footer.innerHTML = `
      <div class="u-footer__band"></div>
      <div class="u-footer__plain">
        <a class="u-footer__logo" href="index.html" data-label="Brand wordmark (SVG logo slot)">BRAND BRAND</a>
        <nav class="u-footer__right -en" aria-label="Hotel List">${fcols.map((c) => `<ul>${c.map((h) => `<li><a href="index.html#brand">${ul(h)}</a></li>`).join("")}</ul>`).join("")}</nav>
      </div>
      <div class="u-footer__plainBottom">
        <div class="u-footer__plainSns"><div class="u-footer__sns"><a href="#" aria-label="SNS 1">${I.note}${I.note.replace("<svg", '<svg class="-after"')}</a><a href="#" aria-label="SNS 2">${I.ig}${I.ig.replace("<svg", '<svg class="-after"')}</a></div><a class="u-footer__mediaLink" href="#">${ul("Local Notes Media")}</a></div>
        <ul class="u-footer__small">${["Sign up / Log in"].concat(SMALL).map((s) => `<li><a href="#">${ul(s)}</a></li>`).join("")}</ul>
      </div>`;
  } else if (footer) {
    footer.classList.add("u-footer");
    if (page !== "home") footer.classList.add("-lower");
    const fcols = [BRAND.slice(0, 5), BRAND.slice(5, 10), BRAND.slice(10)];
    footer.innerHTML = `
      <div class="u-footer__resvWrap" data-slot="footer-booking">
        <video class="u-vid" muted playsinline autoplay loop preload="auto" src="media/wide.mp4" data-label="Distant view of a seaside town at dusk, video · backlit silhouette · landscape 16:9 · 8s loop"></video>
        <a class="u-footer__resv -en" href="reservation.html">
          <span class="u-footer__resvBg"></span>
          <span class="u-footer__resvText" data-fx="line-redraw-hover" data-fx-line-redraw-hover="look: clip-half" style="--fx-redraw: 1.3s; --fx-redraw-ease: cubic-bezier(0.65, 0, 0.35, 1); --fx-weight: 0.125rem">Booking</span>
        </a>
      </div>
      <div class="u-footer__main">
        <a class="u-footer__logo" href="index.html" data-label="Brand wordmark (SVG logo slot)">BRAND BRAND</a>
        <div class="u-footer__links">
          <nav class="-en" aria-label="Footer Menu"><ul class="u-footer__left">${NAV.concat({ t: "Booking", h: "reservation.html" }).map((n) => `<li><a href="${n.h}">${ul(n.t)}${isSp ? I.plus : ""}</a></li>`).join("")}</ul></nav>
          <nav class="u-footer__right _pc -en" aria-label="Hotel List">${fcols.map((c) => `<ul>${c.map((h) => `<li><a href="index.html#brand">${ul(h)}</a></li>`).join("")}</ul>`).join("")}</nav>
        </div>
        <div class="u-footer__note">
          <div>
            <div class="u-footer__snsCopy">
              <div class="u-footer__sns"><a href="#" aria-label="SNS 1">${I.note}${I.note.replace("<svg", '<svg class="-after"')}</a><a href="#" aria-label="SNS 2">${I.ig}${I.ig.replace("<svg", '<svg class="-after"')}</a></div>
              <ul class="u-footer__small">${SMALL.map((s) => `<li><a href="#">${ul(s)}</a></li>`).join("")}</ul>
            </div>
            <p class="u-footer__copy -en">Copyright © Company Name. All rights reserved.</p>
          </div>
          <span class="u-footer__top -en" data-page-top>${ul("( Page Top )")}</span>
          <a class="u-footer__member" href="reservation.html">
            <span class="u-footer__memberMark">${I.rooms}<p class="-en">MEMBERS<br>BRAND BRAND<br>Membership</p></span>
            <span>Sign up / Log in</span>
          </a>
        </div>
      </div>`;
  }

  // ───── Smooth scroll ─────
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.5, ...opts });
    else if (typeof target === "number") window.scrollTo(0, target);
    else target.scrollIntoView();
  };
  document.querySelector("[data-page-top]")?.addEventListener("click", () => scrollTo(0));
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    scrollTo(t, { offset: -parseFloat(getComputedStyle(document.documentElement).fontSize) * (isSp ? 1.8125 : 6.25) });
  });

  // ───── Clock — like the original, today’s date and hour and minute hands update every minute ─────
  const clock = () => {
    const d = new Date(), W = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const set = (k, v) => { const el = document.querySelector(`[data-clock-${k}]`); if (el) el.textContent = v; };
    set("y", d.getFullYear()); set("w", W[d.getDay()]); set("m", d.getMonth() + 1); set("d", d.getDate());
    const h = document.querySelector("[data-clock-h]"), m = document.querySelector("[data-clock-mm]");
    if (h) h.style.rotate = `${(d.getHours() % 12) * 30 + d.getMinutes() * 0.5}deg`;
    if (m) m.style.rotate = `${d.getMinutes() * 6}deg`;
  };
  clock();
  setInterval(clock, 60000);

  // ───── Hotel dropdown ─────
  const drop = document.querySelector("[data-drop]");
  if (drop) {
    const imgs = drop.querySelectorAll("[data-drop-img]");
    let before = 0;
    document.querySelector("[data-drop-link]")?.addEventListener("mouseenter", () => drop.classList.add("-open"));
    drop.addEventListener("mouseleave", () => drop.classList.remove("-open"));
    document.querySelectorAll("[data-not-drop]").forEach((a) => {
      a.addEventListener("mouseenter", () => drop.classList.remove("-open"));
      a.addEventListener("focus", () => drop.classList.remove("-open"));
    });
    drop.querySelectorAll("[data-drop-item]").forEach((a, i) => {
      a.addEventListener("focus", () => drop.classList.add("-open"));
      a.addEventListener("blur", () => drop.classList.remove("-open"));
      a.addEventListener("mouseenter", () => {
        imgs.forEach((el) => el.classList.remove("-selected", "-before"));
        imgs[i].classList.add("-selected");
        imgs[before].classList.add("-before");
        before = i;
        gsap.fromTo(imgs[i], { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power4.out", overwrite: true });
      });
    });
  }

  // ───── Menu curtain — on PC the panel unfolds from a clip 5% inside both sides (.5s power4.out) and the inner text follows .2s later over .4s, on phones it opens top to bottom (.7s) ─────
  const btn = document.querySelector(".u-header__menuBtn");
  let open = false;
  if (menu && btn) {
    const panel = menu.querySelector("[data-menu-panel]"), inner = menu.querySelector("[data-menu-inner]"), back = menu.querySelector("[data-menu-backdrop]");
    const icon = btn.querySelector(".u-header__icon"), tOpen = btn.querySelector("[data-menu-open]"), tClose = btn.querySelector("[data-menu-close]");
    const vids = [...menu.querySelectorAll("[data-menu-video]")];
    let cur = 0, prev = null;
    const tick = () => {
      const v = vids[cur];
      if (!v || !v.duration) return;
      if (v.duration - v.currentTime < 1) {
        v.classList.remove("-current"); v.classList.add("-before"); prev = v;
        cur = (cur + 1) % vids.length;
        const n = vids[cur];
        gsap.fromTo(n, { opacity: 0 }, { opacity: 1, duration: 1, ease: "power4.out", onStart: () => { n.classList.add("-current"); n.currentTime = 0; n.play().catch(() => {}); }, onComplete: () => { prev.classList.remove("-before"); prev.style.opacity = ""; } });
      }
    };
    const show = () => {
      open = true;
      menu.classList.add("-open");
      tOpen.classList.add("-hidden"); tClose.classList.remove("-hidden"); icon.classList.add("-modalOpen");
      btn.setAttribute("aria-expanded", "true");
      lenis?.stop();
      if (isSp) {
        gsap.fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.out" });
      } else {
        vids[cur]?.play().catch(() => {});
        gsap.ticker.add(tick);
        gsap.fromTo(panel, { clipPath: "polygon(5% 0%, 95% 0%, 95% 100%, 50% 100%, 5% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)", duration: 0.5, ease: "power4.out" });
        gsap.fromTo(inner, { opacity: 0 }, { opacity: 1, delay: 0.2, duration: 0.4, ease: "power3.out" });
        gsap.to(back, { opacity: 1, duration: 0.4, ease: "power3.out" });
      }
    };
    const hide = () => {
      open = false;
      tOpen.classList.remove("-hidden"); tClose.classList.add("-hidden"); icon.classList.remove("-modalOpen");
      btn.setAttribute("aria-expanded", "false");
      lenis?.start();
      if (isSp) {
        gsap.fromTo(panel, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.out", onComplete: () => menu.classList.remove("-open") });
      } else {
        vids[cur]?.pause();
        gsap.ticker.remove(tick);
        menu.classList.remove("-open");
        gsap.to(back, { opacity: 0, duration: 0.45, ease: "power3.out" });
      }
    };
    btn.addEventListener("click", () => (open ? hide() : show()));
    back.addEventListener("click", hide);
    addEventListener("keydown", (e) => e.key === "Escape" && open && hide());
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && hide()));
    // On phones, tapping the ”Find a hotel” line expands the hotel list from height 0 → auto (.8s power4.out). On desktop it’s always expanded
    const drawer = menu.querySelector("[data-menu-drawer]"), list = menu.querySelector("[data-menu-brand]");
    let dOpen = false;
    if (isSp && drawer && list) drawer.addEventListener("click", () => {
      dOpen = !dOpen;
      gsap.to(list, { height: dOpen ? "auto" : 0, duration: 0.8, ease: "power4.out" });
    });
    if (!isSp && list) list.style.height = "auto";
  }

  window.UDS = { lenis, isSp, reduce, scrollTo };
})();
