// Devices shared by all pages: header (clock, drop-down, narrow-screen menu), section color change, photo parallax, side-panel widget stacking, big titles sliding left and right·
// Work card row (swiper) · footer · page transition curtain. In the original (Nuxt) the header and curtain persist across page changes, so here the same ones are set up on every page.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const page = document.body.dataset.page;

  const ICON = {
    logo: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11.2" fill="currentColor"/><g style="stroke: var(--t-bg)" stroke-width="1.3" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2"/></g><circle cx="12" cy="12" r="2.6" fill="currentColor" style="stroke: var(--t-bg)" stroke-width="1.3"/></svg>',
    arrow: '<svg viewBox="0 0 12 12" fill="none"><path d="M3 9l6-6M4 3h5v5" stroke="currentColor" stroke-width="1.2"/></svg>',
    eye: '<svg viewBox="0 0 12 12" fill="none"><path d="M1 6s2-3.5 5-3.5S11 6 11 6 9 9.5 6 9.5 1 6 1 6z" stroke="currentColor" stroke-width="1"/><circle cx="6" cy="6" r="1.6" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 12 12" fill="none"><rect x="1.5" y="2.5" width="9" height="7" rx=".8" stroke="currentColor"/><path d="M2 3.2l4 3 4-3" stroke="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 12 12" fill="none"><rect x="3.2" y="1.2" width="5.6" height="9.6" rx="1" stroke="currentColor"/><path d="M5.3 9h1.4" stroke="currentColor"/></svg>',
    globe: '<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.6" stroke="currentColor"/><path d="M1.4 6h9.2M6 1.4c-2.4 2.6-2.4 6.6 0 9.2M6 1.4c2.4 2.6 2.4 6.6 0 9.2" stroke="currentColor" stroke-width=".8"/></svg>',
    send: '<svg viewBox="0 0 12 12" fill="none"><path d="M1.5 6.2l9-4-3.4 8.6-1.6-3.4z" stroke="currentColor"/></svg>',
    clock: '<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor"/><path d="M6 3v3.2l2 1.3" stroke="currentColor"/></svg>',
    left: '<svg viewBox="0 0 12 12" fill="none"><path d="M10 6H2m3.5-3.5L2 6l3.5 3.5" stroke="currentColor" stroke-width="1.1"/></svg>',
    right: '<svg viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 2.5L10 6 6.5 9.5" stroke="currentColor" stroke-width="1.1"/></svg>',
  };
  window.ssIcon = ICON;
  const link = (href, text, icon = "arrow", cls = "ff-mono ts-body-s") => `<div class="ss-link"><span class="ss-icon">${ICON[icon]}</span><div><a href="${href}" class="${cls}"><span class="ss-line">${text}</span></a></div></div>`;
  window.ssLink = link;

  // ── Fill repeated parts: widget cards · arrow links · logo panels · loader icon · card row arrows ──
  $$("[data-wlink]").forEach((el) => {
    const [href, title, text, icon] = el.dataset.wlink.split("|");
    el.innerHTML = `<p>${title}</p>${link(href, text, icon || "arrow", "ts-cta")}`;
  });
  $$("[data-wnews]").forEach((el) => {
    el.innerHTML = `<p>${el.dataset.wnews}</p><p class="ts-cta">Subscribe to our newsletter. We send new updates and stories to you first.</p><form class="ss-signup" onsubmit="return false"><input type="email" placeholder="Email address" aria-label="Email address"><button type="button" class="ss-icon" aria-label="Receive">${ICON.send}</button></form>`;
  });
  $$("[data-arrow]").forEach((el) => {
    const [href, text, icon] = el.dataset.arrow.split("|");
    el.innerHTML = link(href, text, icon || "arrow");
  });
  // Client logos — a text plate of the same panel size instead of the original logo art
  const MARKS = [
    (n) => `<circle cx="12" cy="20" r="8" fill="currentColor"/><text x="26" y="25" style="font: 600 14px var(--kf-font-sans)" fill="currentColor">Logo ${n}</text>`,
    (n) => `<text x="60" y="27" text-anchor="middle" style="font: 400 20px var(--kf-font-display)" fill="currentColor">LOGO ${n}</text>`,
    (n) => `<path d="M6 30L16 10l10 20z" fill="currentColor"/><text x="32" y="26" style="font: 300 13px var(--kf-font-mono)" fill="currentColor">mark_${n}</text>`,
    (n) => `<rect x="4" y="11" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="28" y="26" style="font: 500 13px var(--kf-font-sans); letter-spacing: .12em" fill="currentColor">Trademark${n}</text>`,
    (n) => `<text x="60" y="26" text-anchor="middle" style="font: italic 400 16px var(--kf-font-sans)" fill="currentColor">Brand ${n}</text>`,
    (n) => `<path d="M8 20a8 8 0 1016 0 8 8 0 10-16 0M16 12v16" fill="none" stroke="currentColor" stroke-width="2"/><text x="32" y="26" style="font: 600 13px var(--kf-font-sans)" fill="currentColor">Company ${n}</text>`,
  ];
  $$("[data-logos]").forEach((grid) => {
    const n = +grid.dataset.logos;
    grid.innerHTML = Array.from({ length: n }, (_, i) => `<a class="ss-logo" href="works.html" aria-label="Client case ${i + 1}"><svg viewBox="0 0 120 40">${MARKS[i % MARKS.length](String(i + 1).padStart(2, "0"))}</svg></a>`).join("");
  });
  $$(".ss-loader .ss-icon").forEach((el, i) => { el.innerHTML = [ICON.globe, ICON.eye, ICON.logo, ICON.phone, ICON.send, ICON.arrow, ICON.clock, ICON.mail, ICON.globe][i % 9]; });
  $$("[data-prev]").forEach((b) => { b.innerHTML = ICON.left; });
  $$("[data-next]").forEach((b) => { b.innerHTML = ICON.right; });
  // As in the original, the card set is repeated twice to fill an endless row
  $$(".ss-carousel .swiper-wrapper").forEach((w) => [...w.children].forEach((s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); w.append(c); }));

  // ── Header: logo · Services/Work/Company dropdown · clock ──
  const drop = (cols) => `<div class="ss-drop ts-body-s"><div class="ss-drop-grid">${cols}</div></div>`;
  const col = (title, items, big) => `<div class="ss-drop-col"><h3 class="ts-label-s">${title}</h3><ul>${items.map(([t, h]) => `<li class="${big ? "ts-body-menu" : "ts-body-l"}"><a href="${h}">${t}</a></li>`).join("")}</ul></div>`;
  const featured = (label) => `<div class="ss-drop-col is-wide"><h3 class="ts-label-s">Have you seen this too?</h3><a class="ss-case is-drop" href="works.html"><span class="bg"><span class="ph-box"></span></span><span class="ph-label ts-label-s">${label}</span><span class="box"><span class="t"><span class="ts-body-s">Case name</span><span class="ts-label-s">One-line case intro</span></span></span></a></div>`;
  const header = document.createElement("header");
  header.className = "ss-header ts-body-s";
  header.dataset.slot = "header";
  header.innerHTML = `
    <div class="ss-header-fg">
      <a class="ss-home" href="index.html" aria-label="To the first page">${ICON.logo}<span>Spring/Summer™</span></a>
      <nav class="ss-nav" aria-label="Main menu"><ul>
        <li class="${["service"].includes(page) ? "is-active " : ""}dropdown-menu" tabindex="0" role="menuitem" aria-haspopup="true" aria-expanded="false"><button class="ss-menu-link ts-body-s" aria-expanded="false">What we do</button>${drop(col("Field", [["E-commerce", "service.html"], ["Website", "service.html"], ["Brand identity", "service.html"], ["Apps and products", "service.html"]], true) + col("Technology", [["Shopping platform", "works.html"], ["Content Management", "works.html"], ["App development", "works.html"]]) + featured("Work lead photo · product display screen · landscape 16:7"))}</li>
        <li class="${["list", "works"].includes(page) ? "is-active " : ""}dropdown-menu" tabindex="0" role="menuitem" aria-haspopup="true" aria-expanded="false"><button class="ss-menu-link ts-body-s" aria-expanded="false">Work</button>${drop(col("Supporting industries", [["All Work", "list.html"], ["Professional service", "works.html"], ["Fashion · Lifestyle", "list.html"], ["Culture · Arts", "list.html"]], true) + col("Field", [["E-commerce", "list.html"], ["Website", "list.html"], ["App", "list.html"]]) + featured("Work key photo · forest and mist · landscape 16:7"))}</li>
        <li class="${page === "recruit" ? "is-active " : ""}dropdown-menu" tabindex="0" role="menuitem" aria-haspopup="true" aria-expanded="false"><button class="ss-menu-link ts-body-s" aria-expanded="false">Company</button>${drop(col("Our", [["Where We Work", "recruit.html"], ["Working together", "recruit.html"], ["Inquiry", "#contact"]], true) + col("News", [["Newsletter", "#newsletter"], ["Award", "service.html"]]) + featured("Team photo · office natural light · landscape 16:7"))}</li>
      </ul></nav>
      <button class="ss-burger ts-cta" aria-expanded="false" aria-controls="ss-mnav">Menu</button>
      <aside class="ss-aside"><span class="ss-clock ts-label-m" aria-label="Current time">${ICON.clock}<span data-clock>00:00:00</span></span><span>City</span></aside>
    </div>
    <div class="ss-header-line" aria-hidden="true"></div>
    <div class="ss-header-blur" aria-hidden="true"></div>`;
  document.body.prepend(header);
  const mnav = document.createElement("div");
  mnav.className = "ss-mnav";
  mnav.id = "ss-mnav";
  mnav.dataset.slot = "mobile-menu";
  mnav.innerHTML = `<div>${["What we do", "Work", "Company"].map((t, i) => `<button class="ss-acc-btn ts-body-xl" aria-expanded="false">${t}<span class="arrow">⌄</span></button><div class="ss-acc-body"><div><ul class="ts-body-l"><li><a href="${["service.html", "list.html", "recruit.html"][i]}">${t} Sub Menu 1</a></li><li><a href="${["service.html", "works.html", "recruit.html"][i]}">${t} Sub Menu 2</a></li></ul></div></div>`).join("")}</div>
    <div class="ts-body-s">${link("mailto:hello@example.com", "Write mail", "mail")}</div>`;
  header.after(mnav);

  // Clock — digits change one at a time like the original
  const clock = $("[data-clock]");
  const tick = () => {
    const d = new Date();
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
  };
  tick();
  setInterval(tick, 1000);

  // Drop-down: opens on hover above 1200, pinned on click
  $$(".ss-nav > ul > li").forEach((li) => {
    const btn = $("button", li);
    let shut = 0, hide = 0;
    const panel = $(".ss-drop", li);
    // Original v-show + slide-down: when closed it is display none, on open it goes from -10px and transparent over .4s ease-out, on close display none after .4s
    const open = (v) => {
      clearTimeout(shut);
      if (v === li.classList.contains("is-open")) return;
      li.setAttribute("aria-expanded", String(v));
      btn.setAttribute("aria-expanded", String(v));
      clearTimeout(hide);
      // Same sequence as a Vue v-show toggle: the hidden panel stays as is (opaque), on open the ”before enter” state (transparent·-10px) is applied once and released over .4s, on close it goes to the ”after leave” state over .45s and then hides
      if (v) {
        panel.classList.remove("is-leave");
        panel.style.display = "block";
        panel.classList.add("is-enter-from");
        panel.getBoundingClientRect();
        li.classList.add("is-open");
        panel.classList.remove("is-enter-from");
      } else {
        li.classList.remove("is-open");
        panel.classList.add("is-leave");
        hide = setTimeout(() => { panel.style.display = ""; panel.classList.remove("is-leave"); }, 400);
      }
    };
    li.addEventListener("mouseenter", () => open(true));
    // The original closes a short moment (about .2s) after the pointer leaves — so it doesn’t close on the way to the menu cell
    li.addEventListener("mouseleave", () => { clearTimeout(shut); shut = setTimeout(() => open(false), 170); });
    // With a mouse the hand is already hovering and open, so a press only opens — open and close by finger or keyboard only
    btn.addEventListener("click", () => open(matchMedia("(hover: hover)").matches ? true : !li.classList.contains("is-open")));
  });
  const burger = $(".ss-burger");
  burger.addEventListener("click", () => {
    const v = !mnav.classList.contains("is-open");
    mnav.classList.toggle("is-open", v);
    burger.setAttribute("aria-expanded", String(v));
    burger.textContent = v ? "Close" : "Menu";
  });
  $$(".ss-acc-btn", mnav).forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"))));

  // ── Footer ──
  const footer = document.createElement("footer");
  footer.className = "ss-footer ts-body-s";
  footer.dataset.tone = "night";
  footer.dataset.slot = "footer";
  footer.id = "contact";
  footer.innerHTML = `
    <div class="ss-wbar" style="--wtop: 0"><div class="ss-widget"><div class="ss-wcard ts-body-s"><p>Office Address</p>${link("#map", "Your one-line address here<br>City name, Country", "globe", "ts-cta")}</div></div></div>
    <div class="ss-footer-top">
      <div class="media"><div class="ph"><div class="wf-img" data-label="Office dog · front view · 1:1"></div></div></div>
      <div class="content">
        <div class="ss-rich"><h2 class="ts-label-m">Inquiry</h2><p class="ts-body-l" style="margin-top: 1em">Tell us what you want to make.<br>Let’s make something great together.</p></div>
        <div class="links">${link("mailto:hello@example.com", "Write mail", "mail")}${link("tel:+820000000000", "+82 00 0000 0000", "phone")}</div>
      </div>
    </div>
    <div class="ss-footer-heading" data-label="Your big English footer sentence in one line"><h2 class="ts-h1"><span class="ss-sweep">A Footer Headline</span></h2></div>
    <div class="ss-footer-row"><div class="label">© Spring/Summer - 2026</div><ul class="social"><li><a href="#social-1">Social One</a></li><li><a href="#social-2">Social two</a></li><li><a href="#social-3">Social three</a></li><li><a href="recruit.html">Working together</a></li><li><a href="#privacy">Personal information</a></li><li><a href="#cookies">Cookie</a></li></ul></div>
    <div class="ss-footer-bottom"><div class="border"></div><div class="byline">${ICON.clock.replace("<svg", '<svg width="12" height="12"')}<p>Outside working hours, please email us.</p></div></div>`;
  ($("main") || document.body).append(footer);

  // ── Section color: tone of the last section crossing the screen center line, first section at the top ──
  const tones = $$("[data-tone]");
  const setTheme = () => {
    const mid = innerHeight / 2;
    let pick = null;
    for (const el of tones) {
      const r = el.getBoundingClientRect();
      if ((scrollY === 0 && el === tones[0] && r.top <= 0) || (Math.max(r.top, 0) <= mid && r.bottom >= mid)) pick = el;
    }
    if (pick && document.body.dataset.theme !== pick.dataset.tone) document.body.dataset.theme = pick.dataset.tone;
  };

  // ── Photo parallax: ratio away from screen center (±2) × amount × 25vmin. For the Hero photo it is scroll ÷ screen height. Scroll follows with lerp .05 ──
  const para = $$("[data-parallax]").map((el) => ({ el, amount: +el.dataset.parallax, top: el.hasAttribute("data-parallax-top"), rot: el.dataset.rotate }));
  let smooth = scrollY;
  const placePara = () => {
    const vmin = Math.min(innerWidth, innerHeight) / 100;
    for (const p of para) {
      const r = p.el.getBoundingClientRect();
      const base = r.top - (p.el._ty || 0);
      let n = (base + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
      n = Math.max(-2, Math.min(2, p.top ? -smooth / innerHeight : n));
      p.el._ty = n * p.amount * 25 * vmin;
      p.el.style.transform = `translateY(${p.el._ty}px)${p.rot ? ` rotate(${p.rot}deg)` : ""}`;
    }
  };

  // ── Side-panel widgets: when its home position rises above the stacking line under the header it sticks there, and the next one stacks below the stuck one ──
  const widgets = $$(".ss-widget");
  // The widget sits inside the row as absolute and pushes down only as much as it is attached — with fixed, focus on an off-screen widget link wouldn’t scroll the page to it
  const placeWidgets = () => {
    if (innerWidth < 900) return;
    let stack = header.offsetHeight + 0.75 * parseFloat(getComputedStyle(root).fontSize);
    const gap = 0.5 * parseFloat(getComputedStyle(root).fontSize);
    const offsets = new Map();
    for (const w of widgets) {
      const bar = w.parentElement;
      const before = offsets.get(bar) || 0;
      const nat = bar.getBoundingClientRect().top + before;
      offsets.set(bar, before + w.offsetHeight + gap);
      const y = Math.max(nat, stack);
      if (nat <= stack) stack += w.offsetHeight + gap;
      w.style.transform = `translateY(${before + y - nat}px)`;
    }
  };
  addEventListener("scroll", placeWidgets, { passive: true });

  // ── Large title moving left and right: text width px as --width, container width as --box ──
  const sweeps = $$(".ss-sweep");
  const sizeSweeps = () => sweeps.forEach((s) => {
    s.style.setProperty("--width", Math.round(s.scrollWidth));
    s.style.setProperty("--box", `${s.parentElement.clientWidth - (innerWidth >= 900 ? 0 : 0)}px`);
  });
  sizeSweeps();
  addEventListener("resize", sizeSweeps);
  document.fonts?.ready.then(sizeSweeps);

  const frame = () => {
    smooth += (scrollY - smooth) * (reduce ? 1 : 0.05);
    setTheme();
    if (!reduce) placePara();
    placeWidgets();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ── Case card row: original swiper 11 — auto width · infinite · transition 1.3s · 3s autoplay (stops on touch) · wheel scrolls horizontally only ──
  if (window.Swiper) {
    $$(".ss-carousel").forEach((c) => {
      const sw = new Swiper($(".swiper", c), {
        slidesPerView: "auto",
        loop: true,
        speed: reduce ? 0 : 1300,
        autoplay: reduce ? false : { delay: 3000, disableOnInteraction: true },
        mousewheel: { forceToAxis: true },
      });
      $("[data-prev]", c)?.addEventListener("click", () => sw.slidePrev());
      $("[data-next]", c)?.addEventListener("click", () => sw.slideNext());
    });
  }

  // ── Cursor follow: original LoadingCursor — the box always follows the mouse, and the icon column hops around within 40px of it in .2s steps only while the page is loading ──
  const cursor = document.createElement("div");
  cursor.className = "ss-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = ["globe", "eye", "logo", "phone", "send", "arrow", "clock", "mail", "globe", "eye"].map((k) => `<span class="ss-icon">${ICON[k]}</span>`).join("");
  document.body.append(cursor);
  let burst = null;
  if (window.gsap && !("ontouchstart" in window)) {
    addEventListener("mousemove", (e) => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.7, ease: "power2", opacity: 1 }));
    document.addEventListener("mouseleave", () => gsap.to(cursor, { duration: 0.7, opacity: 0 }));
    burst = gsap.timeline({ repeat: -1, paused: true });
    $$(".ss-icon", cursor).forEach((p) => {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 40;
      burst.to(p, { opacity: 1, scale: 1, x: Math.cos(a) * r, y: Math.sin(a) * r, duration: 0.2, ease: "power2.inOut" })
        .to(p, { opacity: 0, scale: 0, duration: 0.2, ease: "power2.inOut", onComplete: () => gsap.set(p, { x: 0, y: 0 }) }, "+=0.15");
    });
    gsap.set($$(".ss-icon", cursor), { opacity: 0, scale: 0 });
  }

  // ── Page transition curtain: a white panel drops from the top to cover (.75s · .5s under 1200, power3.inOut) → on the next page it takes on that section’s color, then slides out downward ──
  const wipe = document.createElement("div");
  wipe.className = "ss-wipe";
  wipe.setAttribute("aria-hidden", "true");
  document.body.append(wipe);
  const dur = () => (innerWidth < 1200 ? 0.5 : 0.75);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href) || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    sessionStorage.setItem("ss-nav", "1");
    if (reduce || !window.gsap) { location.href = href; return; }
    burst?.play();
    gsap.fromTo(wipe, { y: "-100vh" }, { y: 0, duration: dur(), ease: "power3.inOut", onComplete: () => { location.href = href; } });
  });
  if (root.classList.contains("ss-arriving")) {
    sessionStorage.removeItem("ss-nav");
    setTheme();
    if (window.gsap && !reduce) {
      gsap.set(wipe, { y: 0 });
      gsap.to(wipe, { backgroundColor: getComputedStyle(document.body).backgroundColor, duration: dur() / 1.5, ease: "power3.inOut" });
      gsap.to(wipe, { y: "100vh", delay: dur() / 2, duration: dur(), ease: "power3.inOut", onComplete: () => { root.classList.remove("ss-arriving"); gsap.set(wipe, { clearProps: "all" }); } });
    } else root.classList.remove("ss-arriving");
  }
  addEventListener("pageshow", (e) => { if (e.persisted && window.gsap) gsap.set(wipe, { clearProps: "all" }); });

  // Header big heading — original AnimatedHeadlineSimple: each letter drops in from above (-50%) in 400ms with a random 0~250ms delay
  window.ssAnimHead = () => document.querySelectorAll("[data-anim-head]").forEach((h) => {
    const host = h.querySelector(".ss-sweep") || h;
    const text = host.textContent;
    host.textContent = "";
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) return host.append(w);
      const word = document.createElement("span");
      word.style.display = "inline-block";
      [...w].forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        s.style.animationDelay = `${Math.round(Math.random() * 250)}ms`;
        word.append(s);
      });
      host.append(word);
    });
  });

  window.ss = { reduce, ICON, link, setTheme };
})();
