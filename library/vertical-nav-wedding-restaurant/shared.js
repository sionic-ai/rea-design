// Mounts the header, menu drawer, floating buttons and footer shared by the four pages in one place, and handles the loader, page transition, smooth scroll ·
// Attach photo parallax and the band that flows with the mouse. Values are exactly as read from the original main.js.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => body.clientWidth >= 767;

  const setVW = () => root.style.setProperty("--vw", body.clientWidth + "px");
  setVW();
  addEventListener("resize", setVW);

  const NAV = [
    { label: "Your bundle name here", items: [["About the service", "service.html", "service"], ["About the Space", "service.html"], ["Cooking", "service.html"]] },
    { label: "Story", items: [["Review Collection", "news.html"], ["Photo collection", "lookbook.html", "lookbook"], ["Blog", "news.html", "news"]] },
    { label: "People involved", href: "index.html#episode" },
    { label: "Consultation · Booking", items: [["Consultation schedule", "index.html#fair"], ["Benefit", "index.html#fair"], ["Pricing Info", "index.html#plan"]] },
    { label: "Frequently asked questions", href: "index.html#about" },
    { label: "Notice", href: "news.html" },
    { label: "Contact Us", href: "#contact" },
    { label: "Restaurant site", href: "#", ext: true },
  ];
  const MENU = [
    { label: "Your bundle name here", title: ["FIRST", "CATEGORY"], links: NAV[0].items },
    { label: "Story", title: ["STORIES"], links: NAV[1].items },
    { label: "People involved", title: ["PEOPLE"], links: [["Your six types of people here<br>Split into three lines<br>We write it down", "index.html#episode"]] },
    { label: "Consultation · Booking", title: ["BOOKING"], links: NAV[3].items },
  ];

  const roll = (txt) => `<span class="nl-roll__text"><span>${txt}</span></span>`;
  const cur = (key) => (key && key === page ? " is-current" : "");

  const headerHTML = `
    <a class="nl-header__mark" href="index.html" aria-label="Back to start"></a>
    <p class="nl-header__tag">Your region and neighborhood name here<br>Your shop type in one line</p>
    <nav class="nl-nav"><ul class="nl-nav__list">${NAV.map((n) =>
      n.items
        ? `<li class="nl-nav__item"><button class="nl-nav__toggle" type="button"><span>${n.label}</span></button>
             <div class="nl-nav__inner"><ul class="nl-nav__list">${n.items.map(([t, h, k]) =>
               `<li class="nl-nav__item"><a class="nl-nav__link${cur(k)}" href="${h}"><span>${t}</span></a></li>`).join("")}</ul></div></li>`
        : `<li class="nl-nav__item"><a class="nl-nav__link${n.ext ? " nl-nav__link--ext" : ""}" href="${n.href}"><span>${n.label}</span></a></li>`
    ).join("")}</ul></nav>`;

  const menuHTML = `
    <button class="nl-menu__btn nl-roll" type="button" aria-label="Menu">
      <span class="nl-roll__text is-menu"><span>MENU</span></span><span class="nl-roll__text is-close"><span>CLOSE</span></span>
    </button>
    <div class="nl-menu__body">
      <div class="wf-img nl-photo-dark nl-cap-low nl-menu__bg" data-label="Menu background · dark hall interior · only chandelier light · full screen · darkened so white text sits on top"></div>
      <div class="nl-menu__container">
        <a class="nl-menu__mark" href="index.html" aria-label="Back to start"></a>
        <div class="nl-menu__main">${MENU.map((c, i) => `
          <div class="nl-menu__cat" style="--d:${(i + 1) / 10}s">
            <div class="nl-menu__head">
              <div class="nl-menu__label">${c.label}</div>
              <div class="nl-menu__title nl-en">${c.title.map((t) => `<span><span>${t}</span></span>`).join("")}</div>
              <div class="nl-menu__line"></div>
            </div>
            <div class="nl-menu__links">${c.links.map(([t, h, k]) =>
              `<a class="nl-menu__link${cur(k)}" href="${h}"><span><span>${t}</span></span></a>`).join("")}</div>
          </div>`).join("")}
        </div>
        <div class="nl-menu__sub">
          <a class="nl-menu__sublink" href="index.html#about">Frequently asked questions</a>
          <a class="nl-menu__sublink" href="news.html">Notice</a>
          <a class="nl-menu__topic" href="news.html">
            <div class="wf-img nl-photo-mid" data-label="Latest news thumbnail · 1:1"></div>
            <div class="nl-menu__topic-date">2026.00.00</div>
            <div class="nl-menu__topic-title">Your latest news title in one line here</div>
          </a>
          <a class="nl-menu__sublink" href="#contact">Contact Us</a>
          <a class="nl-menu__sublink" href="#">Restaurant site</a>
        </div>
      </div>
    </div>`;

  const floatHTML = `
    <div class="nl-float__btn"><a class="nl-btn nl-btn--white" href="index.html#fair"><span class="nl-btn__text">Book a consultation</span></a></div>
    <div class="nl-float__btn"><a class="nl-btn nl-btn--white" href="#"><span class="nl-btn__text">Dining · Banquet</span></a></div>`;

  const mapSVG = `<div class="nl-map" aria-hidden="true"><svg viewBox="0 0 560 373" preserveAspectRatio="xMidYMid slice">
      <rect class="nl-map__ground" width="560" height="373"/>
      <path class="nl-map__river" d="M-10 92C90 70 160 118 260 96S430 60 570 84" stroke-width="22" fill="none"/>
      <g class="nl-map__road" stroke-width="7" fill="none"><path d="M0 170H560M0 262H560M0 330H560M84 0V373M196 0V373M300 0V373M412 0V373M500 0V373"/></g>
      <g class="nl-map__road" stroke-width="2.5" fill="none"><path d="M0 200H560M0 230H560M0 298H560M140 120V373M248 120V373M356 120V373M456 120V373M30 120V373"/></g>
      <path class="nl-map__rail" d="M-20 300L590 140" stroke-width="10"/>
      <g class="nl-map__block"><rect x="98" y="182" width="84" height="64"/><rect x="314" y="274" width="84" height="44"/><rect x="210" y="132" width="76" height="24"/></g>
      <path class="nl-map__pin" d="M300 222c-12 0-20-9-20-20 0-15 20-36 20-36s20 21 20 36c0 11-8 20-20 20z"/><circle class="nl-map__ground" cx="300" cy="201" r="6"/>
    </svg></div>`;

  const footerHTML = `
    <div class="nl-info" id="access">
      <div class="nl-info__col" data-slot="access">
        <div class="nl-info__label nl-label">( ACCESS )</div>
        <div class="nl-info__heading">Directions</div>
        <div class="nl-info__body">
          <div class="nl-info__media">${mapSVG}</div>
          <dl class="nl-info__dl">
            <dt>Address</dt><dd>Postal code 000-0000<br>Your address goes here in two lines<br>Your building name here</dd>
            <dt>Transport</dt><dd>Your route name here<br>”Station” Exit 0, 0 min on foot<br>Your route name here<br>”Station” Exit 0, 0 min on foot</dd>
            <dt>Consultation salon</dt><dd>Postal code 000-0000<br>Your salon address in two lines here<br>Your building name, Room 000 here<span class="nl-info__note">Your two lines here on when guests are directed to the salon.<br>A spot to note that only guided visitors should come.</span></dd>
          </dl>
          <div class="nl-info__btns">
            <a class="nl-btn" href="#"><span class="nl-btn__text">Open map (Place)</span></a>
            <a class="nl-btn" href="#"><span class="nl-btn__text">Open map (Salon)</span></a>
          </div>
        </div>
      </div>
      <div class="nl-info__col" id="contact" data-slot="contact">
        <div class="nl-info__label nl-label">( CONTACT )</div>
        <div class="nl-info__heading">Inquiry</div>
        <div class="nl-info__body">
          <div class="nl-info__media"><div class="wf-img nl-photo-warm" data-label="Bride and groom at the stone gate of a red brick building · overcast daylight · blurred figures · landscape 3:2"></div></div>
          <dl class="nl-info__dl">
            <dt>Consultations and Tours<br>For Those Interested</dt><dd><div class="nl-info__phone">TEL: 0000-00-0000</div><div class="nl-info__hour">Weekdays 00:00～00:00／Weekends 00:00～00:00／Open every day</div></dd>
            <dt>Ceremony,<br>Other inquiries</dt><dd><div class="nl-info__phone">TEL: 00-0000-0000</div><div class="nl-info__hour">Weekdays 00:00～00:00／Weekends 00:00～00:00／Closed Tue and Wed</div></dd>
            <dt>Restaurant reservations,<br>Banquet inquiry</dt><dd><div class="nl-info__phone">TEL: 00-0000-0000</div><div class="nl-info__hour">Daily 00:00～00:00 / Closed every Monday</div></dd>
          </dl>
          <div class="nl-info__btns">
            <a class="nl-btn" href="#contact"><span class="nl-btn__text">Contact Us</span></a>
            <a class="nl-btn" href="#"><span class="nl-btn__text">Restaurant site</span></a>
          </div>
        </div>
      </div>
    </div>
    <div class="nl-foot" data-slot="footer-photo">
      <div class="nl-foot__bg"><div class="wf-img nl-photo-dark nl-cap-low" data-label="Red brick Western-style house with stone gate and flower decorations on both sides · bride and groom at the gate · daytime natural light · full screen, generously tall"></div></div>
      <div class="nl-foot__in">
        <div class="nl-foot__lead">＼Your consultation info in one line／</div>
        <div class="nl-foot__catch nl-en">ENGLISH<br>CATCH COPY HERE</div>
        <div class="nl-foot__link"><a class="nl-btn nl-btn--white nl-btn--medium" href="#contact"><span class="nl-btn__text">Book a consultation</span></a></div>
        <div class="nl-foot__body">
          <div class="nl-foot__logo" role="img" aria-label="Logo slot"><span>Place name</span></div>
          <div class="nl-foot__sns">
            <a class="nl-roll" href="#"><svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="16" height="16" rx="4.5"/><circle cx="11" cy="11" r="3.8"/><circle cx="15.6" cy="6.4" r=".8" fill="currentColor"/></svg>${roll("Instagram")}</a>
            <a class="nl-roll" href="#"><svg viewBox="0 0 22 22" fill="currentColor"><path d="M12.2 3h2.6c.2 2 1.5 3.4 3.6 3.6v2.6c-1.4 0-2.6-.4-3.6-1.1v5.6a5 5 0 1 1-5-5h.6v2.7h-.6a2.3 2.3 0 1 0 2.4 2.3z"/></svg>${roll("TikTok")}</a>
          </div>
          <div class="nl-foot__badge" aria-label="Award badge slot">Award<b>BADGE</b>0000</div>
          <a class="nl-foot__top" href="#top">Back to top</a>
          <nav class="nl-foot__nav"><a class="nl-roll" href="#">${roll("Operating company")}</a><a class="nl-roll" href="#">${roll("Privacy policy")}</a></nav>
          <div class="nl-foot__small">© Your shop name here  Your company name here. all rights reserved.</div>
        </div>
      </div>
      <div class="nl-foot__related" data-slot="related-marquee"><div class="nl-foot__track">${Array.from({ length: 8 }, (_, i) =>
        `<div class="nl-foot__rel"><span>BRAND ${String(i + 1).padStart(2, "0")}</span></div>`).join("")}</div></div>
    </div>`;

  const content = document.querySelector("#smooth-content");
  const header = document.createElement("header");
  header.className = "nl-header";
  header.dataset.slot = "header";
  header.innerHTML = headerHTML;
  content.prepend(header);

  const footer = document.querySelector('footer[data-slot="footer"]');
  if (footer) footer.innerHTML = footerHTML;

  const menu = document.createElement("div");
  menu.className = "nl-menu";
  menu.dataset.slot = "menu-drawer";
  menu.innerHTML = menuHTML;
  const float = document.createElement("div");
  float.className = "nl-float";
  float.dataset.slot = "float-buttons";
  float.innerHTML = floatHTML;
  const intro = document.createElement("div");
  intro.className = "nl-intro";
  intro.dataset.slot = "loader";
  intro.innerHTML = `<div class="nl-intro__bg">${"<i></i>".repeat(5)}</div><div class="nl-intro__grid"></div>
    <div class="nl-logo nl-intro__logo"><div class="nl-logo__word"><span class="nl-logo__half is-top"></span><span class="nl-logo__half is-bottom"></span></div><div class="nl-logo__place"><span>PLACE NAME</span></div></div>`;
  body.prepend(menu);
  body.append(float, intro);

  // ── Letter roll: attach one more of the same letter, roll it up one line, then detach when done ──
  document.querySelectorAll(".nl-roll").forEach((el) => {
    const parts = [...el.querySelectorAll(".nl-roll__text")].map((label) => {
      const span = label.querySelector("span");
      return { label, span, copy: span.cloneNode(true) };
    });
    const reset = () => { parts.forEach((p) => p.copy.remove()); el.classList.remove("is-roll"); };
    parts.forEach((p) => p.span.addEventListener("animationend", reset));
    el.addEventListener("mouseenter", () => {
      if (el.classList.contains("is-roll") || matchMedia("(hover: none)").matches) return;
      parts.forEach((p) => p.label.append(p.copy));
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-roll")));
    });
  });

  // ── Vertical-writing nav expand: width 0 → inner list width, auto once fully open. As in the original, the group containing the current page starts expanded ──
  document.querySelectorAll(".nl-nav__toggle").forEach((btn) => {
    const item = btn.closest(".nl-nav__item");
    const inner = item.querySelector(".nl-nav__inner");
    const list = inner.querySelector(".nl-nav__list");
    if (inner.querySelector(".is-current")) { item.classList.add("is-open"); inner.style.width = "auto"; }
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      inner.style.transition = "none";
      inner.style.width = open ? "0px" : list.offsetWidth + "px";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        inner.style.transition = "";
        inner.style.width = open ? list.offsetWidth + "px" : "0px";
      }));
    });
    inner.addEventListener("transitionend", () => { inner.style.width = item.classList.contains("is-open") ? "auto" : ""; });
  });

  menu.querySelector(".nl-menu__btn").addEventListener("click", () => menu.classList.toggle("is-open"));

  // ── Loader: only the session’s first page gets grid + logo, after that only a white band lifts ──
  const buildGrid = () => {
    const grid = intro.querySelector(".nl-intro__grid");
    const pc = isPC();
    const cols = pc ? 15 : 7;
    const cell = (pc ? 96 : 58) * body.clientWidth / (pc ? 1440 : 375);
    const rows = Math.max(1, Math.ceil(innerHeight / cell));
    const cy = (rows - 1) / 2, cx = (cols - 1) / 2, max = Math.hypot(cx, cy);
    let html = "";
    for (let y = 0; y < rows; y++) {
      html += '<div class="nl-intro__line">';
      for (let x = 0; x < cols; x++) {
        const t = Math.max(1, Math.ceil(4 * Math.random()));
        html += `<div class="nl-intro__cell t${t}" style="--d:${(Math.hypot(cx - x, cy - y) / max).toFixed(3)}s"><i></i><i></i><i></i><i></i></div>`;
      }
      html += "</div>";
    }
    grid.innerHTML = html;
  };

  // The original remembers “already seen” with a session cookie shared between tabs. Cookies do not work on file://, so it leaves a 30-minute marker in localStorage.
  let seen = false;
  try {
    seen = Date.now() - Number(localStorage.getItem("nl-intro-seen") || 0) < 30 * 60 * 1000;
    localStorage.setItem("nl-intro-seen", String(Date.now()));
  } catch (e) {}
  const later = (fn, ms) => setTimeout(fn, ms);
  const open = (hideMs) => {
    root.classList.add("intro-open");
    window.dispatchEvent(new CustomEvent("nl:open", { detail: { firstVisit: !seen } }));
    later(() => root.classList.add("intro-hide"), hideMs);
  };
  const ready = () => {
    if (body.classList.contains("nl-ready")) return;
    body.classList.add("nl-ready");
    window.dispatchEvent(new Event("nl:ready"));
    if (reduce) { root.classList.add("intro-open", "intro-hide"); return; }
    if (!seen) {
      later(() => {
        root.classList.add("intro-active");
        later(() => root.classList.add("intro-disappear"), 3800);
        later(() => open(isPC() ? 1400 : 1300), 4200);
      }, 10);
    } else {
      intro.querySelector(".nl-intro__grid").style.display = "none";
      later(() => open(1400), 100);
    }
  };
  if (!seen && !reduce) buildGrid();
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(ready);

  // ── Page transition: five white strips cover at .05s intervals and navigate after 450ms ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href.startsWith("#")) {
      if (href.length > 1 && document.querySelector(href)) {
        e.preventDefault();
        menu.classList.remove("is-open");
        const target = document.querySelector(href);
        if (window.nlSmoother) window.nlSmoother.scrollTo(target, true, "top top");
        else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      } else if (href === "#") e.preventDefault();
      return;
    }
    if (/^(https?:|mailto:|tel:)/.test(href)) return;
    const [file, hash] = href.split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file === here && hash && document.getElementById(hash)) {
      e.preventDefault();
      menu.classList.remove("is-open");
      const target = document.getElementById(hash);
      if (window.nlSmoother) window.nlSmoother.scrollTo(target, true, "top top");
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      return;
    }
    if (reduce) return;
    e.preventDefault();
    root.classList.add("transit-ready");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("transit")));
    later(() => { location.href = href; }, isPC() ? 450 : 400);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("transit-ready", "transit"); });

  // ── Strip flowing with the mouse (shared by social feed · partner logos · gallery thumbnails) ──
  // Original: flows at the default speed, with a target speed k·e³ based on the mouse horizontal position e (-1..1), and the actual speed follows by 1/10 per step.
  // Touch devices (phone width) drag by finger instead of mouse: it follows .1rem per 1px, and on release keeps flowing at the last step ÷ 8.5 speed, then settles to the default speed.
  // The original blocks touchmove once the gesture is decided to be horizontal, but here touch-action: pan-y takes only horizontal, so vertical pushes still scroll the page down.
  const touchUI = matchMedia("(hover: none), (pointer: coarse)").matches;
  window.nlDrift = (track, { base, gain, loopRem, zone = track.parentElement, basis = window, clone = 2 }) => {
    const originals = [...track.children];
    for (let c = 0; c < clone; c++) originals.forEach((n) => track.append(n.cloneNode(true)));
    if (reduce) return;
    let target = base, speed = base, pos = 0, right = true, raf = 0;
    // Calling getComputedStyle for every frame recomputes styles as many times as there are bands and makes the screen stutter — the text scale is measured only when the size changes
    let remPx = parseFloat(getComputedStyle(root).fontSize);
    addEventListener("resize", () => { remPx = parseFloat(getComputedStyle(root).fontSize); });
    const rem = () => remPx;
    const loopLen = () => (typeof loopRem === "function" ? loopRem() : loopRem);
    const wrap = (x, loop) => { if (x >= loop) x -= loop; if (x <= -loop) x += loop; return x; };
    const place = (x, loop) => { track.style.transform = `translate3d(${-(x > 0 ? x : x + loop) * rem()}px,0,0)`; };
    const tick = () => {
      const loop = loopLen();
      speed += (target - speed) / 10;
      pos = wrap(pos + speed, loop);
      place(pos, loop);
      raf = requestAnimationFrame(tick);
    };
    tick();
    if (touchUI) {
      track.style.touchAction = "pan-y";
      let id = null, x0 = 0, xPrev = 0, xLast = 0, pos0 = 0, moved = false;
      track.addEventListener("pointerdown", (ev) => {
        if (ev.pointerType === "mouse" || isPC()) return;
        cancelAnimationFrame(raf);
        id = ev.pointerId; x0 = xPrev = xLast = ev.clientX; pos0 = pos; moved = false;
        track.classList.add("is-dragging");
      });
      track.addEventListener("pointermove", (ev) => {
        if (ev.pointerId !== id) return;
        const loop = loopLen();
        xPrev = xLast; xLast = ev.clientX; moved = true;
        pos = wrap((xLast - x0) / -10 + pos0, loop);
        place(pos, loop);
      });
      const end = (ev) => {
        if (ev.pointerId !== id) return;
        id = null;
        track.classList.remove("is-dragging");
        if (moved) speed = (xPrev - xLast) / 8.5;
        cancelAnimationFrame(raf);
        tick();
      };
      track.addEventListener("pointerup", end);
      track.addEventListener("pointercancel", end);
      return;
    }
    // The original listens only over the strip, and measures the center against window width (social·affiliates) or section width (gallery thumbnails)
    zone.addEventListener("mousemove", (ev) => {
      const r = basis === window ? null : basis.getBoundingClientRect();
      const w = r ? r.width : innerWidth;
      const x = r ? ev.clientX - r.left : ev.clientX;
      const e = (Math.max(0, Math.min(w, x)) - w / 2) / (w / 2);
      right = e > 0;
      target = gain * e * Math.abs(e * e);
    });
    zone.addEventListener("mouseleave", () => { target = right ? base : -base; });
  };

  gsap.registerPlugin(ScrollTrigger, ...(window.ScrollSmoother ? [ScrollSmoother] : []));
  window.addEventListener("load", () => ScrollTrigger.refresh());

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { pc, motion } = ctx.conditions;
    if (pc && motion && window.ScrollSmoother) {
      window.nlSmoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.5, speed: 1, effects: true, normalizeScroll: true });
      ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
    }
    if (motion) {
      document.querySelectorAll(".nl-prlx").forEach((frame) => {
        const img = frame.querySelector(":scope > .wf-img");
        const mag = Number(frame.dataset.mag || 1.4);
        const from = frame.dataset.mag === "2" ? -((mag - 1) / mag) * 50 : 0;
        const to = frame.dataset.mag === "2" ? ((mag - 1) / mag) * 50 : ((mag - 1) / mag) * 100;
        gsap.fromTo(img, { yPercent: from }, { yPercent: to, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      });
      const foot = document.querySelector(".nl-foot");
      if (foot) gsap.fromTo(foot.querySelector(".nl-foot__bg"), { yPercent: -25 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    }
    const stop = document.querySelector("[data-float-stop]") || document.querySelector(".nl-topics") || document.querySelector("footer");
    if (stop) ScrollTrigger.create({ trigger: stop, start: "top bottom", onEnter: () => float.classList.add("is-stuck"), onLeaveBack: () => float.classList.remove("is-stuck") });
    return () => { if (window.nlSmoother) { window.nlSmoother.kill(); window.nlSmoother = null; ScrollTrigger.normalizeScroll(false); } };
  });

  const track = document.querySelector(".nl-foot__track");
  if (track) window.nlDrift(track, { base: 0.05, gain: 0.3, loopRem: () => (isPC() ? 192 : 111.3) });
})();
