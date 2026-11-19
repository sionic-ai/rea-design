// Common to all pages: draws the header, menu and footer in one place, and wires up smooth scroll, pill nav, reveal, pixel strip, numbers, FAQ and page transition.
// Original values: curve cubic-bezier(.22,1,.36,1) · pixel flicker 2~4 times × .045~.09s · pointer radius 96 · number 1.6s power2.out.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("sy", "M0,0 C0.22,1 0.36,1 1,1");
  CustomEase.create("syio", "M0,0 C0.65,0 0.35,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SY = (window.SY = { reduced, lenis: null });

  const arrowUR = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9 9 3M4 3h5v5"/></svg>';
  const arrowR = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 6h9M7 2.5 10.5 6 7 9.5"/></svg>';
  const chevron = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m2 3.5 3 3 3-3"/></svg>';
  // Placeholder symbol newly drawn in the same language as the pixel band, instead of the original symbol
  const mark = '<svg class="sy-mark" viewBox="0 0 52 52" aria-hidden="true"><circle class="bg" cx="26" cy="26" r="26" fill="var(--kf-ink)"/><g class="px" fill="var(--kf-bg)"><rect x="13" y="13" width="13" height="13"/><rect x="26" y="26" width="13" height="13"/><rect x="26" y="13" width="6.5" height="6.5"/><rect x="19.5" y="32.5" width="6.5" height="6.5"/></g></svg>';
  const word = (cls = "") => `<span class="sy-logo__w ${cls}">W</span>${mark}<span class="sy-logo__w ${cls}">RDMARK</span>`;
  SY.icons = { arrowUR, arrowR, mark };

  const cur = (p) => (p === page ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sy-head");
    head.classList.toggle("is-home", page === "home");
    head.innerHTML = `
      <div class="sy-head__pill"></div>
      <a class="sy-logo" href="index.html" aria-label="Home">${word()}</a>
      <nav class="sy-nav" aria-label="Main menu">
        <div class="sy-nav__item">
          <a class="sy-nav__link${cur("about")}" href="about.html" aria-haspopup="menu" aria-expanded="false">Company About <span class="sy-chev">${chevron}</span><i class="sy-dot"></i></a>
          <div class="sy-drop"><div class="sy-drop__clip"><div class="sy-drop__pad"><div class="sy-drop__menu" role="menu">
            <a class="${cur("about")}" data-href="about.html" role="menuitem" data-nav-option>Company</a>
            <a data-href="about.html#team" role="menuitem" data-nav-option>Team</a>
            <a class="${cur("list")}" data-href="list.html" role="menuitem" data-nav-option>Support Program</a>
          </div></div></div></div>
        </div>
        <a class="sy-nav__link${cur("method")}" href="method.html">Way of working<i class="sy-dot"></i></a>
        <a class="sy-nav__link" href="#contact">Inquiry<i class="sy-dot"></i></a>
      </nav>
      <button class="sy-cta" type="button" data-roll data-login>Customer area</button>
      <button class="sy-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="sy-menu" data-slot="mobile-menu">
        <nav data-label="Your menu English name here">
          <a class="t-hl${cur("about")}" href="about.html">About</a>
          <a class="t-hl${cur("method")}" href="method.html">Our Method</a>
          <a class="t-hl" href="#contact">Contact</a>
          <a class="sy-btn" href="#" data-login>Customer area</a>
        </nav>
        <div class="sy-menu__social"><i></i><i></i></div>
      </div>
      <div class="sy-modal" role="dialog" aria-modal="true" aria-label="Log in" data-slot="login-modal">
        <form class="sy-modal__card" onsubmit="return false">
          <button class="sy-modal__x" type="button" aria-label="Close">×</button>
          <h2 data-label="Login window greeting in English here">Welcome</h2>
          <p>One-line login guide here</p>
          <label><input type="email" placeholder=" "><span>Email address</span></label>
          <button class="sy-modal__go" type="button">Continue</button>
          <div class="sy-modal__or">Or</div>
          <button class="sy-modal__alt" type="button"><i></i>Continue with external account</button>
        </form>
      </div>`
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sy-foot");
    foot.id = "contact";
    foot.innerHTML = `
      <div class="sy-wrap">
        <div class="sy-foot__grid">
          <div class="sy-foot__mark">${word()}</div>
          <div class="sy-foot__cols t-b" data-label="Cell names are short English names">
            <dl>
              <div><dt>Email</dt><dd><a href="#">Your email address here</a></dd></div>
              <div><dt>Office Address</dt><dd><span>Your street address 00 here</span><span>00000 City</span></dd></div>
              <div><dt>Legal Address</dt><dd><span>Your street address 00 here</span><span>00000 City</span></dd></div>
            </dl>
            <dl>
              <div><dt>Company ID</dt><dd><span>000-00-00000</span></dd></div>
              <div><dt>Quick Links</dt><dd><a href="#">Terms of service</a><a href="#">Privacy policy</a><a href="#">Cookie Policy</a><a href="list.html">Public Support Program</a></dd></div>
              <div class="sy-foot__social"><a href="#" aria-label="SNS 1"><i></i></a><a href="#" aria-label="SNS 2"><i></i></a></div>
            </dl>
          </div>
        </div>
        <div class="sy-foot__bottom">
          <button class="sy-lang" type="button" role="switch" aria-checked="false" aria-label="Change language"><i class="sy-lang__knob"></i><span class="is-on">KO</span><span>EN</span></button>
          <p class="sy-foot__legal">Your company legal notice goes here, about three lines. Small-print sentences such as registration number, governing law and changes belong in this spot. One more line here.<button type="button">Cookie Settings</button></p>
        </div>
      </div>`;
    const lang = foot.querySelector(".sy-lang");
    const knob = lang.querySelector(".sy-lang__knob");
    const [ko, en] = lang.querySelectorAll("span");
    const STEP = 38;
    let at = 0;
    let wob = null;
    lang.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || reduced || wob?.isActive()) return;
      const u = at * STEP, v = at === 0 ? 1 : -1;
      wob = gsap.timeline()
        .to(knob, { x: u + v * 10, duration: 0.16, ease: "power2.out" })
        .to(knob, { x: u + v * 2, duration: 0.12, ease: "power1.in" })
        .to(knob, { x: u + v * 6, duration: 0.14, ease: "power1.out" })
        .to(knob, { x: u, duration: 0.36, ease: "power3.out" });
    });
    lang.addEventListener("click", () => {
      const from = gsap.getProperty(knob, "x");
      at = 1 - at;
      ko.classList.toggle("is-on", !at);
      en.classList.toggle("is-on", !!at);
      lang.setAttribute("aria-checked", String(!!at));
      const to = at * STEP;
      wob?.kill();
      if (reduced) return void gsap.set(knob, { x: to });
      wob = gsap.timeline()
        .fromTo(knob, { x: from }, { x: to, duration: 0.28, ease: "power2.in" })
        .to(knob, { x: to + (from < to ? -6 : 6), duration: 0.12, ease: "power1.out" })
        .to(knob, { x: to, duration: 0.28, ease: "power3.out" });
    });
  }

  // Button: like the original (ButtonLink), each letter stacks two copies in a 1.4em cell and rolls −1.4em on hover (.4s power3.inOut, .02s stagger),
  // The arrow is a strip of two joined arrows shifted half a slot (20px) after .2s — the next arrow takes the place of the leaving one. Pressing squeezes to .96 for .12s, then springs back with back.out(1.8).
  const LH = 1.4;
  document.querySelectorAll(".sy-btn, [data-roll]").forEach((btn) => {
    const text = [...btn.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    [...btn.childNodes].forEach((n) => n.nodeType === 3 && n.remove());
    const roll = document.createElement("span");
    roll.className = "sy-roll";
    roll.setAttribute("aria-hidden", "true");
    [...text].forEach((ch) => {
      const c = document.createElement("span");
      if (/\s/.test(ch)) {
        c.className = "sy-roll__sp";
        c.textContent = ch;
      } else {
        c.className = "sy-roll__ch";
        c.innerHTML = `<span data-letter-roll><span>${ch}</span><span>${ch}</span></span>`;
      }
      roll.append(c);
    });
    btn.setAttribute("aria-label", text);
    btn.prepend(roll);
    const svg = btn.querySelector("svg");
    let strip = null;
    const dir = btn.classList.contains("is-coral") ? "right" : "upRight";
    const rest = dir === "upRight" ? { xPercent: -50, yPercent: 0 } : { xPercent: -50 };
    const moved = dir === "upRight" ? { xPercent: 0, yPercent: -50 } : { xPercent: 0 };
    if (svg) {
      const box = document.createElement("span");
      box.className = "sy-arrow";
      strip = document.createElement("span");
      strip.className = "sy-arrow__strip";
      strip.dataset.dir = dir;
      // 12px icon in a 20px cell — leaves padding inside the cell like the original icon
      svg.setAttribute("viewBox", "-4 -4 20 20");
      svg.replaceWith(box);
      box.append(strip);
      strip.append(svg, svg.cloneNode(true));
      gsap.set(strip, rest);
    }
    if (reduced) return;
    const letters = roll.querySelectorAll("[data-letter-roll]");
    let lt, at;
    btn.syRoll = () => {
      lt?.kill();
      lt = gsap.fromTo(letters, { y: 0 }, { y: `-${LH}em`, duration: 0.4, ease: "power3.inOut", stagger: 0.02, overwrite: "auto", onComplete: () => gsap.set(letters, { y: 0 }) });
      if (!strip) return;
      at?.kill();
      gsap.set(strip, rest);
      at = gsap.to(strip, { ...moved, duration: 0.45, ease: "power3.inOut", delay: 0.2, overwrite: true, onComplete: () => gsap.set(strip, rest) });
    };
    btn.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && btn.syRoll());
    // Original handles the press state after release (click)
    btn.addEventListener("click", () => {
      gsap.timeline().to(btn, { scale: 0.96, duration: 0.12, ease: "power2.out" }).to(btn, { scale: 1, duration: 0.5, ease: "back.out(1.8)" });
    });
  });

  // Same Locomotive Scroll 5 as the original (Lenis 1.3.17 inside) — lerp .08, 1 on touch devices (follows instantly). It also adds is-inview to [data-scroll]
  document.querySelectorAll("[data-scroll][data-delay]").forEach((el) => el.style.setProperty("--sy-delay", `${el.dataset.delay}ms`));
  if (!reduced && window.LocomotiveScroll) {
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    SY.loco = new LocomotiveScroll({ lenisOptions: { orientation: "vertical", lerp: touch ? 1 : 0.08, wheelMultiplier: 1 } });
    SY.lenis = SY.loco.lenisInstance;
    SY.lenis?.on("scroll", ScrollTrigger.update);
  } else document.querySelectorAll("[data-scroll]").forEach((el) => el.classList.add("is-inview"));

  // ── Header: top bar ↔ center pill. Measures the shrunken spot and moves between the two in one timeline ──
  const desk = matchMedia("(min-width: 1024px)");
  let headTl = null;
  let scrolled = false;
  const buildHead = () => {
    if (!head) return;
    headTl?.kill();
    headTl = null;
    const parts = head.querySelectorAll(".sy-head__pill, .sy-logo .sy-mark, .sy-logo__w, .sy-nav, .sy-cta");
    gsap.set(parts, { clearProps: "x,y,scale,width,opacity,--pill-a,boxShadow" });
    if (!desk.matches) return;
    const vw = head.clientWidth;
    const G = 26;
    const PAD = 16;
    const MID = 54;
    const markEl = head.querySelector(".sy-logo .sy-mark");
    const nav = head.querySelector(".sy-nav");
    const cta = head.querySelector(".sy-cta");
    const m = markEl.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    const c = cta.getBoundingClientRect();
    const pillW = PAD + 52 + G + n.width + G + c.width + PAD;
    const left = (vw - pillW) / 2;
    headTl = gsap
      .timeline({ paused: true, defaults: { duration: 0.7, ease: "sy" } })
      .to(head.querySelector(".sy-head__pill"), { width: pillW, "--pill-a": 0.94, boxShadow: "0 10px 34px rgba(24,22,25,0.07)" }, 0)
      .to(head.querySelectorAll(".sy-logo__w"), { opacity: 0, duration: 0.25, ease: "none" }, 0)
      .to(markEl, { x: left + PAD + 26 - (m.left + m.width / 2), y: MID - (m.top + m.height / 2), scale: 52 / m.width }, 0)
      .to(nav, { x: left + PAD + 52 + G - n.left, y: MID - (n.top + n.height / 2) }, 0)
      .to(cta, { x: left + pillW - PAD - c.right, y: MID - (c.top + c.height / 2) }, 0);
    headTl.progress(scrolled ? 1 : 0);
  };
  const onScrollHead = () => {
    const now = scrollY > 40;
    if (now === scrolled) return;
    scrolled = now;
    head?.classList.toggle("is-scrolled", now);
    if (headTl) reduced ? headTl.progress(now ? 1 : 0) : now ? headTl.play() : headTl.reverse();
  };
  if (head) {
    scrolled = scrollY > 40;
    head.classList.toggle("is-scrolled", scrolled);
    buildHead();
    addEventListener("scroll", onScrollHead, { passive: true });
    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(buildHead, 120);
    });
    document.fonts?.ready.then(buildHead);
    const inside = sessionStorage.getItem("sy-inside");
    sessionStorage.removeItem("sy-inside");
    if (!reduced && !inside) {
      gsap.from(head.querySelectorAll(".sy-logo, .sy-nav__link, .sy-cta, .sy-burger"), { autoAlpha: 0, yPercent: -40, duration: 0.7, ease: "sy", stagger: 0.08, delay: 0.1 });
    }
    head.querySelector(".sy-burger").addEventListener("click", () => SY.menu(!document.documentElement.classList.contains("is-menu-open")));
    // Header menu: on hover the panel unfolds and items rise from 10px below at .96 scale with .045s stagger using back.out(1.8), while the chevron flips in .45s back.out(2.1).
    // On release, wait .12s before folding — so an interaction crossing from the link to the panel isn’t lost. On fold the items don’t move, only the panel closes
    head.querySelectorAll(".sy-nav__item").forEach((item) => {
      const link = item.querySelector(".sy-nav__link");
      const chev = item.querySelector(".sy-chev");
      const opts = item.querySelectorAll("[data-nav-option]");
      let shut = 0;
      let unlink = 0;
      // Items in a closed panel can’t be pressed or focused (like the original inert) — addresses are removed, put in on open, and removed again once the fold (.3s) ends
      const links = (on) => opts.forEach((a) => (on ? a.setAttribute("href", a.dataset.href) : a.removeAttribute("href")));
      const set = (open) => {
        clearTimeout(shut);
        if (open === item.classList.contains("is-open")) return;
        item.classList.toggle("is-open", open);
        link.setAttribute("aria-expanded", open);
        clearTimeout(unlink);
        if (open) links(true);
        else unlink = setTimeout(() => links(false), 300);
        if (reduced) return gsap.set(chev, { rotation: open ? 180 : 0 });
        gsap.to(chev, { rotation: open ? 180 : 0, duration: 0.45, ease: "back.out(2.1)", overwrite: true, transformOrigin: "50% 50%" });
        if (open) gsap.fromTo(opts, { opacity: 0, y: 10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.045, ease: "back.out(1.8)", overwrite: true });
      };
      item.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && set(true));
      item.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") shut = setTimeout(() => set(false), 120); });
      item.addEventListener("focusin", () => set(true));
      item.addEventListener("focusout", (e) => item.contains(e.relatedTarget) || set(false));
    });
    // A link whose bundle is the current page: on hover the selection dot squashes sideways (1.45·.58, .08s), kicks the opposite way (.82·1.28, .1s), then settles with a .26s back.out(2.4) — if it is already running, it is not triggered again
    head.querySelectorAll(".sy-nav__link.is-current").forEach((a) => {
      const dot = a.querySelector(".sy-dot");
      if (!dot || reduced) return;
      let tl = null;
      a.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || tl?.isActive()) return;
        tl = gsap.timeline()
          .to(dot, { scaleX: 1.45, scaleY: 0.58, duration: 0.08, ease: "power2.out" })
          .to(dot, { scaleX: 0.82, scaleY: 1.28, duration: 0.1, ease: "power1.inOut" })
          .to(dot, { scaleX: 1, scaleY: 1, duration: 0.26, ease: "back.out(2.4)" });
      });
    });
    // Logo: on hover the picture inside the symbol turns a further half turn about its own center with .85s back.out(2.4) — if it is already over a full turn ahead, it doesn’t stack any more.
    // On press it squashes to .9 in .12s then pops back with .5s back.out(1.8)
    const logoPx = head.querySelector(".sy-logo .sy-mark .px");
    if (logoPx && !reduced) {
      let turn = 0;
      gsap.set(logoPx, { svgOrigin: "26 26" });
      const logoLink = head.querySelector(".sy-logo");
      logoLink.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || turn - gsap.getProperty(logoPx, "rotation") >= 360) return;
        turn += 180;
        gsap.to(logoPx, { rotation: turn, duration: 0.85, ease: "back.out(2.4)", overwrite: "auto", onComplete: () => { turn %= 360; gsap.set(logoPx, { rotation: turn }); } });
      });
      logoLink.addEventListener("pointerdown", () => gsap.timeline().to(logoPx, { scale: 0.9, duration: 0.12, ease: "power2.out" }).to(logoPx, { scale: 1, duration: 0.5, ease: "back.out(1.8)" }));
    }
  }

  // ── Phone menu: expands from the header pill spot to the full screen in .78s power4.inOut, the white sheet turns ink-dark, and lines rise from 36px below at .07s intervals.
  //    When closing, the lines drop 16px starting from the end at .03s intervals (.2s) and the curtain lifts at .42s ──
  const menu = document.querySelector(".sy-menu");
  let menuTl = null;
  SY.menu = (open) => {
    const root = document.documentElement;
    if (!menu || open === root.classList.contains("is-menu-open")) return;
    const rows = menu.querySelectorAll("nav > a, .sy-menu__social");
    menuTl?.kill();
    root.classList.toggle("is-menu-open", open);
    open ? SY.lenis?.stop() : SY.lenis?.start();
    const full = { top: 0, left: 0, width: "100%", height: "100%", borderRadius: 0, "--menu-ink": 1 };
    if (reduced) {
      gsap.set(menu, { ...full, autoAlpha: open ? 1 : 0 });
      gsap.set(rows, { autoAlpha: open ? 1 : 0, y: 0 });
      return;
    }
    if (open) {
      const pill = head?.querySelector(".sy-head__pill")?.getBoundingClientRect();
      const r = pill?.width ? pill : { top: 18, left: 16, width: Math.max(innerWidth - 32, 0), height: 48 };
      gsap.set(menu, { autoAlpha: 1, top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: Math.min(r.width, r.height) / 2, "--menu-ink": 0 });
      gsap.set(rows, { autoAlpha: 0, y: 36 });
      menuTl = gsap.timeline({ defaults: { overwrite: "auto" } })
        .to(menu, { ...full, duration: 0.78, ease: "power4.inOut" })
        .to(rows, { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.07, ease: "power3.out" }, "-=0.34");
    } else {
      menuTl = gsap.timeline({ defaults: { overwrite: "auto" } })
        .to(rows, { autoAlpha: 0, y: 16, duration: 0.2, stagger: { each: 0.03, from: "end" }, ease: "power2.in" })
        .to(menu, { autoAlpha: 0, duration: 0.42, ease: "power2.inOut" }, "-=0.12");
    }
  };

  // ── Login window ──
  const modalOpen = (on) => {
    document.documentElement.classList.toggle("is-modal", on);
    on ? SY.lenis?.stop() : SY.lenis?.start();
    // The original dialog focuses the field the instant it opens (autofocus) — so the field name starts rising in the same frame as the window
    if (on) document.querySelector(".sy-modal input")?.focus({ preventScroll: true });
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-login]")) {
      e.preventDefault();
      SY.menu(false);
      modalOpen(true);
    } else if (e.target.closest(".sy-modal__x") || e.target.classList.contains("sy-modal")) modalOpen(false);
  });
  addEventListener("keydown", (e) => e.key === "Escape" && modalOpen(false));

  // ── Numbers: 1.6s power2.out once within 100px of the bottom of the screen ──
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    if (reduced) return void (el.textContent = to);
    el.textContent = "0";
    const box = el.closest("li, article") || el;
    const o = { v: 0 };
    const tw = gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", paused: true, onUpdate: () => (el.textContent = Math.round(o.v)) });
    const check = () => {
      const r = box.getBoundingClientRect();
      if (r.top <= innerHeight - 100 && r.bottom > 0) {
        tw.play();
        gsap.ticker.remove(check);
      }
    };
    gsap.ticker.add(check);
  });

  // ── Pixel strip ──
  const rand = (a, b) => a + Math.random() * (b - a);

  // Cell positions follow the original layout — 40px cell numbers (column,row). The top band fills from below (bottom) and the bottom band scatters from above (top)
  const BAND = {
    bottom: "11,3 9,3 8,1 7,0 7,2 7,3 6,3 5,2 5,3 4,1 4,2 3,0 3,3 2,2 2,3 0,1 11,4 10,4 10,5 9,5 8,4 8,5 7,5 6,4 6,5 5,4 5,5 4,4 4,5 3,4 2,4 2,5 1,5 0,4 0,5 22,2 22,3 21,3 20,1 19,0 19,2 18,3 17,0 17,3 16,1 15,3 13,2 12,2 12,3 23,4 23,5 22,5 21,4 21,5 20,4 20,5 19,4 18,4 18,5 17,5 16,4 16,5 15,4 15,5 14,4 14,5 13,4 12,4 12,5 35,3 33,1 33,2 32,2 32,3 31,1 31,3 29,1 29,3 28,0 28,2 27,2 26,3 25,2 25,3 24,1 35,4 34,5 33,4 33,5 32,5 30,5 29,4 29,5 28,4 28,5 27,4 26,5 25,4 25,5 24,4 24,5 43,3 42,2 42,3 40,3 39,1 39,2 38,1 37,0 37,3 36,2 36,3 43,5 42,4 42,5 41,5 40,4 40,5 39,4 39,5 38,5 37,5 36,4 36,5",
    top: "10,0 10,1 10,3 9,0 8,1 8,2 7,0 7,1 7,2 7,3 6,0 6,2 5,0 4,0 4,1 4,3 3,0 3,1 3,2 2,0 1,0 1,1 1,2 1,3 0,0 0,2 10,4 6,5 5,4 4,4 21,0 21,2 21,3 20,0 20,1 19,0 19,1 18,0 18,1 18,2 18,3 17,0 17,2 16,1 16,3 15,0 15,1 15,3 14,0 14,1 14,2 13,0 12,2 11,0 11,2 11,3 19,4 15,5 14,4 12,4 32,1 32,2 31,0 31,1 31,2 31,3 30,1 30,3 29,0 29,1 28,0 28,1 28,2 27,0 27,1 26,0 26,2 25,0 25,1 25,2 24,1 24,3 23,0 23,1 22,0 22,1 22,2 27,4 26,5 24,5 23,4 43,0 43,1 42,0 41,0 41,1 41,2 41,3 40,1 40,2 39,0 39,1 39,3 38,0 38,1 38,2 38,3 37,0 37,1 37,2 36,0 36,2 36,3 35,0 35,1 34,0 34,2 33,0 33,1 43,4 40,5 39,4 36,5 35,4",
  };
  const bandCells = (origin) => BAND[origin].split(" ").map((p) => {
    const [c, r] = p.split(",");
    return { x: c * 40, y: r * 40 };
  });

  SY.pixels = (el, o) => {
    const { cells, cell, w, h, tiles = 1, origin = "bottom", enterScale = 1, radius = 96, cooldown = 160, pScale = 1, flashes = 0, listen = el } = o;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${w * tiles} ${h}`);
    svg.setAttribute("width", w * tiles);
    svg.setAttribute("height", h);
    svg.setAttribute("preserveAspectRatio", origin === "bottom" ? "xMinYMax slice" : "xMinYMin slice");
    svg.setAttribute("shape-rendering", "crispEdges");
    const rects = [];
    for (let t = 0; t < tiles; t++) {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("fill", "currentColor");
      g.setAttribute("transform", `translate(${t * w} 0)`);
      cells.forEach(({ x, y }) => {
        const rc = document.createElementNS(svgNS, "rect");
        rc.setAttribute("x", x);
        rc.setAttribute("y", y);
        rc.setAttribute("width", cell + 1);
        rc.setAttribute("height", cell + 1);
        g.append(rc);
        rects.push({ el: rc, y, cx: t * w + x + cell / 2, cy: y + cell / 2, last: 0 });
      });
      svg.append(g);
    }
    el.append(svg);
    if (reduced) return;

    let ready = false;
    gsap.set(rects.map((c) => c.el), { opacity: 0 });
    const enter = () => {
      const tl = gsap.timeline({ onComplete: () => (ready = true) });
      rects.forEach((c) => {
        const n = 2 + Math.floor(Math.random() * 3);
        const p = origin === "top" ? c.y / h : (h - c.y) / h;
        const start = (rand(0, 0.42) + p * 0.28) * enterScale;
        const step = rand(0.045, 0.09) * enterScale;
        for (let d = 0; d < n; d++) tl.set(c.el, { opacity: d % 2 === 0 ? 1 : 0 }, start + d * step);
        tl.set(c.el, { opacity: 1 }, start + n * step);
      });
    };
    const wait = () => {
      const r = el.getBoundingClientRect();
      if (r.top <= innerHeight - 160 && r.bottom > 0) {
        gsap.ticker.remove(wait);
        enter();
      }
    };
    gsap.ticker.add(wait);

    let raf = 0;
    let last = null;
    // A finger blinks twice at the tapped spot (released within 12px)
    const flash = (ev, rounds = 1) => {
      if (!ready) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
      const now = performance.now();
      const hit = rects.filter((c) => {
        const dx = pt.x - c.cx;
        const dy = pt.y - c.cy;
        if (dx * dx + dy * dy > radius * radius || now - c.last < cooldown) return false;
        c.last = now;
        return true;
      });
      if (!hit.length) return;
      const tl = gsap.timeline();
      let at = 0;
      for (let r = 0; r < rounds; r++) {
        let end = at;
        hit.forEach((c) => {
          const n = flashes > 0 ? flashes : 1 + Math.floor(Math.random() * 2);
          const s = at + rand(0, 0.03) * pScale;
          const step = rand(0.04, 0.07) * pScale;
          for (let f = 0; f < n; f++) tl.set(c.el, { opacity: f % 2 === 0 ? 0 : 1 }, s + f * step);
          tl.set(c.el, { opacity: 1 }, s + n * step);
          end = Math.max(end, s + n * step);
        });
        at = end;
      }
    };
    let down = null;
    listen.addEventListener("pointerdown", (ev) => ev.pointerType !== "mouse" && (down = { id: ev.pointerId, x: ev.clientX, y: ev.clientY }), { passive: true });
    addEventListener("pointerup", (ev) => {
      if (!down || down.id !== ev.pointerId) return;
      const far = Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 12;
      down = null;
      if (!far) flash(ev, 2);
    }, { passive: true });
    addEventListener("pointercancel", () => (down = null), { passive: true });
    listen.addEventListener(
      "pointermove",
      (ev) => {
        if (ev.pointerType !== "mouse") return;
        last = ev;
        if (!raf) raf = requestAnimationFrame(() => ((raf = 0), last && flash(last)));
      },
      { passive: true }
    );
  };

  document.querySelectorAll("[data-pixels]").forEach((el) => {
    const origin = el.dataset.pixels;
    el.classList.add(origin === "bottom" ? "is-top" : "is-bottom");
    SY.pixels(el, { cells: bandCells(origin), cell: 40, w: 1760, h: 240, tiles: 4, origin });
  });

  // ── FAQ: only one open at a time ──
  document.querySelectorAll(".sy-faq__list").forEach((list) => {
    const items = [...list.querySelectorAll(".sy-faq__item")];
    // The answer is expanded by css (grid-rows .3s), and ＋ rotates 45° in .5s back.out(1.8) like the original. When the height changes, Locomotive (Lenis) re-measures by itself
    const set = (item, open) => {
      item.classList.toggle("is-open", open);
      item.querySelector(".sy-faq__q").setAttribute("aria-expanded", open);
      const plus = item.querySelector(".sy-faq__plus");
      if (reduced) return void gsap.set(plus, { rotation: open ? 45 : 0 });
      gsap.to(plus, { rotation: open ? 45 : 0, duration: 0.5, ease: "back.out(1.8)", overwrite: true });
    };
    items.forEach((item) => gsap.set(item.querySelector(".sy-faq__plus"), { transformOrigin: "50% 50%", rotation: item.classList.contains("is-open") ? 45 : 0 }));
    items.forEach((item) =>
      item.querySelector(".sy-faq__q").addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        items.forEach((o) => o !== item && o.classList.contains("is-open") && set(o, false));
        set(item, open);
      })
    );
  });

  // ── Hovering a title tints the tag and button on the same row too (support program list) ──
  document.querySelectorAll("[data-hot]").forEach((link) => {
    const row = link.parentElement;
    // As in the original (ButtonLink hoverActive), hovering a row title also rolls that row’s button text and arrow
    link.addEventListener("pointerenter", () => { row.classList.add("is-hot"); row.querySelector(".sy-btn")?.syRoll?.(); });
    link.addEventListener("pointerleave", () => row.classList.remove("is-hot"));
  });

  // ── Page transition: the original is a single-page app so header · menu stay and only the body changes — switch without a curtain, and skip the header entrance on the new page ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (/^#.+/.test(href)) {
      e.preventDefault();
      SY.menu(false);
      if (!SY.lenis) return void document.querySelector(href)?.scrollIntoView();
      SY.lenis.start();
      SY.lenis.scrollTo(href, { offset: -100 });
      return;
    }
    if (!/^[a-z]+\.html/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === location.pathname.split("/").pop() && hash) {
      e.preventDefault();
      SY.lenis ? SY.lenis.scrollTo(`#${hash}`, { offset: -100 }) : document.getElementById(hash)?.scrollIntoView();
      return;
    }
    sessionStorage.setItem("sy-inside", "1");
    // The original (React Router) keeps only the head on press and drops the old body immediately — empty it so the old body does not remain while the next document is fetched
    document.documentElement.classList.add("is-leaving");
  });
  addEventListener("pageshow", (e) => {
    document.documentElement.classList.remove("is-leaving");
    if (e.persisted) SY.menu(false);
  });
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  addEventListener("load", () => ScrollTrigger.refresh());
})();
