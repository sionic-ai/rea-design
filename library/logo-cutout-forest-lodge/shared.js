// Spanning several pages — header·menu·footer·logo art, random letter reveal·blur reveal, two Swiper types.
// Values are the original main.js as is: gs_reveal 1.2s (wide screens power1.out·.32 stagger) · gs_title shuffled letters .8s back.out(2) .05 stagger · Swiper 1200ms·10s auto.
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHome = body.classList.contains("home");
  const navKey = body.dataset.nav || "";

  const NAV = [["about", "About", "about.html"], ["room", "Guest room", "room.html"], ["food", "Meal", "room.html#specialties"], ["neighbors", "Neighbor", "room.html#specialties"], ["news", "News", "news.html"], ["cafe", "Cafe", "#"], ["access", "Directions", "#"], ["contact", "Inquiry", "#"]];
  const arrow = '<svg viewBox="0 0 6 10" aria-hidden="true"><path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
  const navItems = (home) => (home ? [["home", "First", "index.html"]] : []).concat(NAV).map(([k, t, h]) => `<li><a href="${h}"${k === navKey ? ' class="active"' : ""}><span>${t}</span></a></li>`).join("");

  // Logo — the original is an SVG of a mountain ridge line (parts1) + four Chinese characters (textParts) + one English line (parts6). Redrawn anew with the same structure
  window.rkLogo = (id = "") => `<svg ${id ? `id="${id}" ` : ""}class="rk-logo" viewBox="0 0 220 132" role="img" aria-label="Business logo" data-label="Brand logo — mountain ridge · four-character name · English name">
    <path class="parts1" d="M38 40 C58 34 70 20 86 12 C96 7 104 9 112 16 C120 24 128 22 138 18 C152 12 166 22 182 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <g class="rk-logo__name" fill="currentColor">
      <text class="textParts" x="38" y="92">Prize</text><text class="textParts" x="76" y="92">Call</text><text class="textParts" x="114" y="92">This</text><text class="textParts" x="152" y="92">Reum</text>
    </g>
    <text class="parts6" x="110" y="122" text-anchor="middle" fill="currentColor">BRAND NAME</text>
  </svg>`;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("rk-header");
    header.id = "header";
    header.innerHTML = `<p class="rk-logo-wrap"><a class="rk-logo-link" href="index.html" aria-label="Back to start">${rkLogo()}</a></p>
      <p class="rk-reserve"><a href="#"><span><span class="en">Reservation</span><span class="ja">Book lodging${arrow}</span></span></a></p>`;
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "rk-menu-btn";
  btn.id = "menuBtn";
  btn.setAttribute("aria-label", "Menu");
  btn.innerHTML = '<span class="rk-menu-btn__in"><span class="bar bar1"></span><span class="bar bar2"></span><span class="bar bar3"></span></span>';
  const menu = document.createElement("div");
  menu.className = "rk-menu";
  menu.id = "menu";
  menu.setAttribute("data-slot", "menu");
  menu.innerHTML = `<div class="rk-menu__bg" aria-hidden="true"><div class="wf-img" data-label="Forest view outside window · overcast day · full-bleed landscape (darkened overlay)"></div></div>
    <nav class="rk-menu__scroll"><div class="rk-menu__in">
      <ul class="gnavi">${navItems(true)}</ul>
      <p class="cBtn cWhite cBtn1 cM0A"><a href="#">Stay booking · vacancy calendar${arrow}</a></p>
    </div></nav>`;
  (header || body.firstElementChild).after(btn, menu);

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("rk-footer");
    footer.innerHTML = `<figure class="logo"><a class="rk-logo-link" href="index.html" aria-label="Back to start">${rkLogo()}</a></figure>
      <address>〒000-0000 Address in one line goes here 0000-00</address>
      <p><a href="#">Tel. 000-0000-0000</a></p>
      <ul class="sns">
        <li><a href="#" aria-label="Brand"><svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="currentColor"/><path d="M10 15v-5h1.7l.3-2H10V6.9c0-.6.2-1 1-1h1V4.1c-.2 0-.8-.1-1.5-.1C9 4 8 5 8 6.7V8H6.3v2H8v5Z" style="fill: var(--kf-surface)"/></svg></a></li>
        <li><a href="#" aria-label="Social Media"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="1.5" width="15" height="15" rx="4.5"/><circle cx="9" cy="9" r="3.6"/><circle cx="13.3" cy="4.7" r=".6" fill="currentColor"/></svg></a></li>
      </ul>
      <ul class="gnavi">${navItems(false)}</ul>
      <p class="copyright">&copy; 0000 Brand Name</p>`;
  }

  // ── Menu — the body is fixed while open so the background doesn’t shift ──
  let opened = false, keep = 0;
  const lock = (on) => {
    if (on) { keep = scrollY; body.classList.add("fixed"); body.style.top = `${-keep}px`; }
    else { body.classList.remove("fixed"); body.style.top = ""; scrollTo({ top: keep, behavior: "instant" }); }
  };
  const setMenu = (on) => {
    opened = on;
    [btn, header, menu].forEach((el) => el?.classList.toggle("opened", on));
    btn.setAttribute("aria-expanded", String(on));
    lock(on);
  };
  btn.addEventListener("click", (e) => { e.preventDefault(); setMenu(!opened); });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    const to = new URL(a.href, location.href);
    if (to.pathname === location.pathname && opened) setMenu(false);
  }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && opened) setMenu(false); });

  // ── Phone: once scrolled down by the header height, the menu button sticks to the top (on the first page it is always stuck) ──
  const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) / 100 * innerWidth;
  const onMoved = () => {
    if (isHome) { btn.classList.add("moved"); return; }
    if (opened) return;
    btn.classList.toggle("moved", innerWidth <= 950 && scrollY >= headerH());
  };
  addEventListener("scroll", onMoved, { passive: true });
  addEventListener("resize", onMoved);
  onMoved();

  // ── Split text — keep words as chunks and split only letters (so line breaks don’t cut mid-word) ──
  const splitChars = (el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    const chars = [];
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { el.append(" "); return; }
      const word = document.createElement("span");
      word.style.whiteSpace = "nowrap";
      [...w].forEach((c) => { const s = document.createElement("span"); s.textContent = c; word.append(s); chars.push(s); });
      el.append(word);
    });
    return chars;
  };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Original rd() — the first page calls it when the splash starts to lift
  window.rkReveal = () => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    if (document.querySelector(".gs_reveal")) {
      mm.add("(max-width: 950px)", () => { ScrollTrigger.batch(".gs_reveal", { onEnter: (els) => gsap.to(els, { duration: 1.2, autoAlpha: 1 }), once: true, start: "top bottom-=20%" }); });
      mm.add("(min-width: 951px)", () => { ScrollTrigger.batch(".gs_reveal", { onEnter: (els) => gsap.to(els, { duration: 1.2, opacity: 1, ease: "power1.out", stagger: 0.32 }), once: true, start: "top bottom-=20%" }); });
    }
    document.querySelectorAll(".gs_title").forEach((t) => {
      const en = t.querySelector(".en"), ja = t.querySelector(".ja");
      if (!en || !ja) return;
      const chars = splitChars(en), order = shuffle(chars.slice());
      gsap.set(chars, { opacity: 0, y: 10 });
      gsap.set(en, { opacity: 1 });
      gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", end: "bottom 20%", once: true } })
        .to(order, { duration: 0.8, opacity: 1, y: 0, ease: "back.out(2)", stagger: 0.05 })
        .to(ja, { duration: 0.4, opacity: 0.8, ease: "linear", stagger: 0.1 }, "-=0.8");
    });
    if (isHome) {
      document.querySelectorAll(".gs_title2").forEach((t) => {
        const l1 = t.querySelector(".line1"), l2 = t.querySelector(".line2");
        if (!l1 || !l2) return;
        const a = splitChars(l1), b = splitChars(l2);
        gsap.set(a.concat(b), { opacity: 0, y: 5 });
        gsap.set([l1, l2], { opacity: 1 });
        gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", end: "bottom 20%", once: true } })
          .to(shuffle(a), { duration: 0.8, opacity: 1, y: 0, ease: "back.out(1)", stagger: 0.03 }, "start")
          .to(shuffle(b), { duration: 0.8, opacity: 1, y: 0, ease: "back.out(1)", stagger: 0.03 }, "start+=0.5");
      });
    }
  };

  // On the first page, at the very top (within window height) is isHomeTop — the header button turns into a white outline
  if (isHome) {
    const top = () => body.classList.toggle("isHomeTop", (scrollY || document.documentElement.scrollTop) < innerHeight);
    top();
    addEventListener("scroll", top, { passive: true });
  } else if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => window.rkReveal());
  else window.rkReveal();

  // ── Swiper — the original jsSlider (centered, loop, 10s autoplay) and jsSliderMB (staggered fade only at 950 and below) ──
  const SPEED = 1200, AUTO = 10000;
  const nav = (el) => ({ pagination: { el: el.querySelector(".swiper-pagination"), type: "bullets", clickable: true }, navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") } });
  addEventListener("load", () => {
    if (!window.Swiper) return;
    document.querySelectorAll(".jsSlider").forEach((el) => {
      if (el.querySelectorAll(".swiper-slide").length < 2) return;
      new Swiper(el, { speed: reduce ? 0 : SPEED, loop: true, slidesPerView: "auto", centeredSlides: true, autoplay: el.dataset.slideAuto === "true" && !reduce ? { delay: AUTO, disableOnInteraction: false } : false, autoHeight: el.dataset.slideHeight === "auto", allowTouchMove: true, ...nav(el) });
    });
    const mbs = [...document.querySelectorAll(".jsSliderMB")];
    if (!mbs.length) return;
    let inst = [], on = false;
    const make = () => { inst = mbs.map((el) => new Swiper(el, { speed: reduce ? 0 : SPEED, loop: true, effect: "fade", fadeEffect: { crossFade: true }, autoHeight: el.dataset.slideHeight === "auto", allowTouchMove: true, ...nav(el) })); on = true; };
    const kill = () => { inst.forEach((s) => s.destroy(false, true)); inst = []; on = false; };
    const fit = () => { if (innerWidth <= 950 && !on) make(); else if (innerWidth > 950 && on) kill(); };
    fit();
    addEventListener("resize", fit);
  });
})();
