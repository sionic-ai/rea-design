// Things spanning several pages (header row, mega menu, drawer, booking pill, three closing sections, footer) are built once here and pages only leave a slot.
(() => {
  const icon = {
    cal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></svg>',
    tel: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M4.2 2.2 6 4.4 4.9 6.1a8 8 0 0 0 5 5l1.7-1.1 2.2 1.8-1 1.9C8 13.6 2.4 8 2.3 3.2z"/></svg>',
    baby: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="8" cy="8.5" r="5.5"/><path d="M8 3c-.8-1-.2-1.8.8-1.6M6 8h.01M10 8h.01M6.3 10.3c1 .8 2.4.8 3.4 0"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="8" cy="8" r="6"/><path d="M8 7v4.2M8 4.8v.01"/></svg>',
    ig: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.8"/><path d="M11.6 4.4h.01"/></svg>',
  };

  // Original logo (a curved symbol that looks like a single bird) redrawn as a curve of the same size and color
  const mark = '<svg viewBox="0 0 52 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 8c6-5 15-3 15 5 0 6-7 7-9 3"/><path d="M12 16c5 8 15 11 22 7 6-3 7-10 2-12-4-2-8 2-6 6 2 5 10 6 15 2"/><path d="M20 26c-4 4-3 10 3 10 4 0 6-4 4-7"/></svg>';
  const logo = `<a class="sz-logo" href="index.html" aria-label="First Page">${mark}<span><b>Your hospital name here</b><small>CLINIC NAME</small></span></a>`;

  const svc = [
    { name: "Consultation 1", en: "Section One", subs: ["Treatment detail 1", "Treatment detail 2", "Treatment detail 3", "Treatment detail 4"] },
    { name: "Consultation 2", en: "Section Two", subs: ["Treatment detail 1", "Treatment detail 2", "Treatment detail 3", "Treatment detail 4", "Treatment detail 5"] },
    { name: "Consultation 3", en: "Section Three", subs: ["Treatment detail 1", "Treatment detail 2", "Treatment detail 3", "Treatment detail 4"] },
  ];
  const r = (t) => `<span class="sz-roll">${t}</span>`;
  const svcText = () => `<ul class="sz-svc is-text">${svc.map((s) => `
    <li class="sz-svc__item">
      <a class="sz-svc__card" href="service.html"><span class="sz-svc__name"><h3>${s.name}</h3><small>${s.en}</small></span><span class="sz-svc__go"><span class="sz-arrow"></span></span></a>
      <div class="sz-svc__sub">${s.subs.map((x) => `<a href="service.html">${x}</a>`).join("")}</div>
    </li>`).join("")}</ul>`;

  const actions = (drawer) => `
    <li><a href="#reserve">${icon.cal}<span class="sz-roll">Internet reservation</span></a></li>
    <li class="${drawer ? "" : "is-sp"}"><a href="#reserve">${icon.tel}<span class="sz-roll">Phone</span></a></li>
    <li><a href="#schedule">${icon.baby}<span class="sz-roll">Delivery Booking</span></a></li>
    <li><a href="#info">${icon.info}<span class="sz-roll">Consultation Hours</span></a></li>`;

  let gid = 0;
  const gnav = () => `
    <ul class="sz-gnav">
      <li><a href="index.html">${r("Home")}</a></li>
      <li><a href="about.html">${r("About the Hospital")}</a></li>
      <li><a href="service.html">${r("Facilities and Services")}</a></li>
      <li><a href="#">${r("Frequently asked questions")}</a></li>
      <li class="is-child">
        <a href="service.html">${r("Treatment Guide")}</a>
        <div class="sz-gnav__cols">${svc.map((s) => {
          const id = `gnav-${++gid}`;
          return `<div class="sz-gnav__col">
            <div class="sz-gnav__label"><a href="service.html">${r(s.name)}</a><button type="button" aria-expanded="false" aria-controls="${id}" aria-label="${s.name} Unfold"></button></div>
            <div class="sz-gnav__grand" id="${id}"><div><ul>${s.subs.map((x) => `<li><a href="service.html">${r(x)}</a></li>`).join("")}</ul></div></div>
          </div>`;
        }).join("")}</div>
      </li>
      <li class="is-util"><ul class="sz-gnav__util">
        <li><a href="news.html">${r("News")}</a></li>
        <li><a href="recruit.html">${r("Hiring guide")}</a></li>
        <li><a href="#reserve">${r("Inquiry")}</a></li>
      </ul></li>
    </ul>`;

  const addr = `
    <p>Postal code 000-0000</p>
    <p>Your one-line address here 00-00 (<u>View map</u>)</p>
    <p class="tel">Tel. <b>000-000-0000</b></p>
    <p class="park">Your parking info goes here on one line</p>`;

  const header = `
    <header class="sz-header" data-slot="header" data-scroll="top">
      <div class="sz-header__in">
        ${logo}
        <nav class="sz-nav" aria-label="Main menu"><ul>
          <li><a href="about.html">${r("About the Hospital")}</a></li>
          <li><button type="button" aria-expanded="false" aria-controls="sz-mega">${r("Treatment Guide")}</button></li>
          <li><a href="service.html">${r("Facilities and Services")}</a></li>
          <li><a href="#">${r("Frequently asked questions")}</a></li>
        </ul></nav>
        <div class="sz-util">
          <ul>
            <li><a href="news.html">${r("News")}</a></li>
            <li><a href="recruit.html">${r("Hiring guide")}</a></li>
            <li><a href="#reserve">${r("Inquiry")}</a></li>
          </ul>
          <a class="sz-tel" href="#reserve"><small>Tel</small>000-000-0000</a>
        </div>
      </div>
      <div class="sz-mega" id="sz-mega" data-slot="mega-menu">
        <div class="sz-mega__in">
          <div class="sz-mega__head"><p class="sz-label">Treatment Guide</p><a class="sz-more" href="service.html">${r("View care guide")}<span class="sz-arrow"></span></a></div>
          <span class="sz-mega__ghost" aria-hidden="true">Our Services</span>
          ${svcText()}
        </div>
      </div>
      <div class="sz-mega-overlay"></div>
    </header>
    <nav class="sz-action" data-slot="action-bar" aria-label="Reservation"><ul>${actions(false)}</ul></nav>
    <button class="sz-drawer-btn" type="button" aria-expanded="false" aria-label="Open Menu">Menu</button>
    <div class="sz-drawer-overlay"></div>
    <aside class="sz-drawer" data-slot="drawer" aria-label="Menu">
      <div class="sz-drawer__action"><ul>${actions(true)}</ul></div>
      ${gnav()}
      <div class="sz-drawer__logo">${logo}</div>
      <address class="sz-drawer__info">${addr}</address>
    </aside>`;

  const rows = [["0000, month 00", "×", "×", "×"], ["0000, month 00", "×", "×", "×"], ["0000, month 00", "×", "×", "×"], ["0000, month 00", "×", "×", "×"],
    ["0000, month 00", "×", "×", "×"], ["0000, month 00", "×", "×", "×"], ["0000, month 00", "△", "△", "△"], ["0000, month 00", "○", "○", "○"], ["0000, month 00", "－", "－", "－"]];
  const schedule = `
    <section class="sz-sched" id="schedule" data-slot="birth-schedule">
      <div class="sz-wrap is-l"><div class="sz-panel sz-sched__block">
        <div class="sz-sched__in">
          <div class="sz-sched__title sz-title"><p class="sz-label">Delivery reservation status</p><h2 class="sz-display">Booking<br>Calendar</h2></div>
          <figure class="sz-sched__img"><div class="wf-img" data-label="Newborn baby · sleeping face wrapped in a white swaddle · soft window light · portrait 216:259"></div></figure>
          <table class="sz-sched__table">
            <thead><tr><th>Moon</th><th>Early month</th><th>Mid-month</th><th>Late month</th></tr></thead>
            <tbody>${rows.map((x) => `<tr>${x.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
          <div class="sz-sched__legend">
            <div><dl><dt>○</dt><dd>Your symbol meaning here</dd><dt>△</dt><dd>Your symbol meaning here</dd><dt>×</dt><dd>Your symbol meaning in one line</dd><dt>－</dt><dd>Your symbol meaning here</dd><dt>☆</dt><dd>Your slightly longer explanation of the symbol’s meaning here, one line</dd></dl></div>
            <ul class="sz-note">
              <li>Your two-line notice here. A spot for booking timing and how to confirm.</li>
              <li>Your two lines of cautions go here. This is where you note cases in which a booking may change.</li>
              <li>Your notice here, in one line.</li>
            </ul>
          </div>
        </div>
      </div></div>
    </section>`;

  const days = ["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Sun·Holiday"];
  const info = `
    <section class="sz-info" id="info" data-slot="clinic-info">
      <div class="sz-wrap is-l"><div class="sz-info__block">
        <div class="sz-info__in">
          <div class="sz-info__title sz-title"><p class="sz-label">Hours · Directions</p><h2 class="sz-display">Visit Info</h2></div>
          <address class="sz-info__addr">${addr.replace(' class="park"', "").replace(' class="tel"', "")}</address>
          <div class="sz-info__time">
            <table>
              <thead><tr><th>Consultation Hours</th>${days.map((d) => `<th>${d}</th>`).join("")}</tr></thead>
              <tbody>
                <tr><td>00:00~00:00</td><td>○</td><td>○</td><td>○</td><td>○</td><td>○</td><td>○</td><td>-</td></tr>
                <tr><td>00:00~00:00</td><td>○</td><td>○</td><td>○</td><td>-</td><td>○</td><td>-</td><td>-</td></tr>
              </tbody>
            </table>
            <ul class="sz-note"><li>Your application hours notice, one line here</li><li>Your application deadline notice, one line here</li></ul>
          </div>
          <figure class="sz-info__map"><div class="wf-img" data-label="Map embed · clinic location pin · landscape 117:59"></div></figure>
        </div>
        <div class="sz-info__bg"><div class="wf-img sz-video" data-label="Waiting room video · dark wooden ceiling and sofa · evening indoor lights · 16:9 landscape · 15s loop"><video src="media/concept.mp4" autoplay loop muted playsinline preload="none" aria-hidden="true"></video></div></div>
      </div></div>
    </section>`;

  const reserve = `
    <section class="sz-reserve" id="reserve" data-slot="reserve-contact">
      <div class="sz-wrap is-l"><div class="sz-panel is-clear sz-reserve__block">
        <div class="sz-reserve__in">
          <figure class="sz-reserve__img"><div class="wf-img" data-label="Exam room shelf · bookcase lit by indirect light and pink chair · warm indoor light · portrait 3:4"></div></figure>
          <div class="sz-reserve__title sz-title"><p class="sz-label">Booking · Consultation</p><h2 class="sz-display">Book &amp; Contact</h2></div>
          <div class="sz-reserve__desc"><p>One line inviting inquiries.</p><p>Your line here on who you can consult.</p></div>
          <ul class="sz-reserve__list">
            <li class="sz-reserve__item"><a class="sz-reserve__link" href="#"><span class="sz-reserve__copy"><small>Your application guide here</small><b>Book online</b></span><span class="sz-reserve__icon">${icon.cal}</span>
              <ul class="sz-note"><li>Your booking info line</li></ul></a></li>
            <li class="sz-reserve__item"><a class="sz-reserve__link" href="#"><span class="sz-reserve__copy"><small>Your phone hours notice here</small><b class="is-tel">Tel.000-000-0000</b></span><span class="sz-reserve__icon">${icon.tel}</span>
              <ul class="sz-note"><li>Your two lines of phone guidance here. Where to say what to do in urgent cases.</li></ul></a></li>
          </ul>
        </div>
      </div></div>
    </section>`;

  const footer = `
    <footer class="sz-footer" data-slot="footer">
      <div class="sz-wrap is-l"><div class="sz-footer__block">
        <div class="sz-footer__in">
          <div class="sz-footer__logo">${logo}</div>
          <address class="sz-footer__info">${addr}<a class="ig" href="#">${icon.ig}Instagram</a></address>
          <figure class="sz-footer__film"><div class="wf-img sz-video" data-label="Hospital corridor video · green trees through floor-to-ceiling glass · daytime · 16:9 landscape · 15s loop"><video src="media/concept.mp4" autoplay loop muted playsinline preload="none" aria-hidden="true"></video></div></figure>
          <nav class="sz-footer__nav" aria-label="Sitemap">${gnav()}</nav>
          <div class="sz-footer__copy"><a href="#">Privacy policy</a><a href="#">Your guide document link here</a><span>© 0000 CLINIC NAME</span></div>
        </div>
        <div class="sz-footer__bg"><div class="sz-mist is-footer"><video src="media/shadow.mp4" autoplay loop muted playsinline preload="none" aria-hidden="true"></video></div></div>
        <svg class="sz-footer__mark sz-mark" viewBox="0 0 1386 143" aria-hidden="true" data-label="Hospital English name here · one line in caps"><defs><linearGradient id="sz-mark-foot" x1="0" y1="0" x2="0" y2="143" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color: currentColor; stop-opacity: 1"/><stop offset="1" style="stop-color: currentColor; stop-opacity: 0"/></linearGradient></defs><text fill="url(#sz-mark-foot)" x="10" y="120" font-size="144" textLength="1366" lengthAdjust="spacing">YOUR CLINIC NAME</text></svg>
      </div></div>
    </footer>`;

  const mount = () => {
    document.body.insertAdjacentHTML("afterbegin", header);
    const end = document.querySelector("[data-include='end']");
    if (end) end.outerHTML = (end.dataset.parts || "schedule info reserve").split(" ").map((k) => ({ schedule, info, reserve })[k]).join("");
    document.querySelector("main").insertAdjacentHTML("afterend", footer);
  };

  const html = document.documentElement;
  const pc = matchMedia("(min-width: 769px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  const smooth = () => {
    if (reduce.matches || !window.Lenis) return null;
    const lenis = new Lenis({ lerp: 0.1, duration: 0.5 });
    window.szLenis = lenis;
    if (window.gsap) {
      if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    return lenis;
  };

  // Original: 5px threshold — hides on scroll down, returns with a background on scroll up (PC only)
  const headerState = (lenis) => {
    const el = document.querySelector(".sz-header");
    let last = scrollY;
    const set = (v) => { if (el.dataset.scroll !== v) el.dataset.scroll = v; };
    const on = (y) => {
      if (!pc.matches) { set("top"); return; }
      if (y <= 5) { set("top"); last = y; return; }
      const d = y - last;
      if (Math.abs(d) < 5) return;
      set(d > 0 && !html.classList.contains("is-mega") ? "hidden" : "fixed");
      last = y;
    };
    if (lenis) lenis.on("scroll", ({ scroll }) => on(scroll));
    else addEventListener("scroll", () => on(scrollY), { passive: true });
    set(scrollY <= 5 ? "top" : "fixed");
  };

  const mega = () => {
    const btn = document.querySelector(".sz-nav button[aria-controls='sz-mega']");
    const close = () => { html.classList.remove("is-mega"); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", () => {
      const open = !html.classList.contains("is-mega");
      html.classList.toggle("is-mega", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    document.querySelector(".sz-mega-overlay").addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  };

  const drawer = () => {
    const btn = document.querySelector(".sz-drawer-btn");
    const set = (open) => {
      html.classList.toggle("is-drawer", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      btn.textContent = open ? "Close" : "Menu";
      if (window.szLenis) open ? szLenis.stop() : szLenis.start();
    };
    btn.addEventListener("click", () => set(!html.classList.contains("is-drawer")));
    document.querySelector(".sz-drawer-overlay").addEventListener("click", () => set(false));
    document.querySelectorAll(".sz-drawer a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  };

  const accordion = () => {
    document.querySelectorAll(".sz-gnav__label button").forEach((b) => {
      b.addEventListener("click", () => {
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        document.getElementById(b.getAttribute("aria-controls")).classList.toggle("is-open", open);
      });
    });
  };

  const tabs = () => {
    document.querySelectorAll("[data-tabs]").forEach((box) => {
      const list = box.querySelectorAll("[role='tab']");
      list.forEach((t) => t.addEventListener("click", () => {
        list.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
        box.querySelectorAll("[role='tabpanel']").forEach((p) => { p.hidden = p.id !== t.getAttribute("aria-controls"); });
      }));
    });
  };

  // In-page anchor — scrolls down less by the header bar height
  const anchors = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href^='#']");
      if (!a || a.getAttribute("href").length < 2) return;
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      const off = -document.querySelector(".sz-header").offsetHeight;
      if (window.szLenis) szLenis.scrollTo(t, { offset: off });
      else scrollTo({ top: t.getBoundingClientRect().top + scrollY + off, behavior: reduce.matches ? "auto" : "smooth" });
    });
  };

  mount();
  const lenis = smooth();
  headerState(lenis);
  mega();
  drawer();
  accordion();
  tabs();
  anchors();
})();
