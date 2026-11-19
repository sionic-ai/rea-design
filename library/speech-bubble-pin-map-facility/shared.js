// Shared by all pages: draws the pillar labels, header band, menu drawer, phone bottom bar, business calendar and footer, and hooks up header band shrink, drawer open/close, calendar paging and the event window.
// Original values: headband .7s cubic-bezier(.26,.63,0,.99) · drawer curtain .7s / list .7s later at 1s · burger lines .5s · calendar flip .3s · event window .5s ease-in-out.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const icon = {
    lock: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="9" width="12" height="9" rx="1.5"/><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9M10 12.5v2.5"/></svg>',
    pin: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10 18s-5.5-5.6-5.5-9.5a5.5 5.5 0 0 1 11 0C15.5 12.4 10 18 10 18z"/><circle cx="10" cy="8.5" r="2"/></svg>',
    cal: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4.5" width="14" height="13" rx="1"/><path d="M3 8.5h14M6.5 2.5v4M13.5 2.5v4"/></svg>',
    cart: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h2.4l2 10h9.2l1.8-7H5.4"/><circle cx="8" cy="16.5" r="1.2"/><circle cx="14.5" cy="16.5" r="1.2"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.8-6.3L5.4 21H2.3l7.2-8.3L2 3h6.3l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
  };
  // Placeholder for the original bubble-cluster mark — our own circle cluster of the same size and a small line of text
  const mark = (sub = true) => `<svg class="ks-mark" viewBox="0 0 120 ${sub ? 118 : 100}" aria-label="Logo slot"><g fill="none" stroke="currentColor" stroke-width="9"><circle cx="60" cy="50" r="14"/><circle cx="34" cy="34" r="12"/><circle cx="62" cy="18" r="11"/><circle cx="88" cy="32" r="12"/><circle cx="92" cy="62" r="11"/><circle cx="66" cy="82" r="12"/><circle cx="34" cy="70" r="13"/></g><circle cx="102" cy="14" r="6" fill="currentColor"/><circle cx="14" cy="52" r="5" fill="currentColor"/>${sub ? '<text x="60" y="114" text-anchor="middle">LOGO 00 GARDEN</text>' : ""}</svg>`;
  const brand = '<span class="ks-brand" aria-label="Parent company logo slot">Logo</span>';
  const cur = (p) => (p === page ? ' class="is-current"' : "");

  const NAV = [
    ["index.html#tour", "Menu 1", "Menu One", "Your two facility names here"],
    ["index.html#kissa", "Menu 2", "Cafe"],
    ["product.html", "Menu 3", "Shop", "", "product"],
    ["index.html#event", "Menu 4", "Events"],
    ["index.html#sake", "Menu 5", "Special"],
    ["news.html", "Menu 6", "News", "", "news"],
    ["about.html", "Menu 7", "About", "", "about"],
  ];

  const side = document.querySelector('[data-slot="side-label"]');
  if (side) {
    side.classList.add("ks-side");
    side.classList.toggle("is-sticky", page !== "home");
    side.innerHTML = `<a href="index.html" aria-label="First Page">${mark()}<span class="ks-side__copy"><span>Your one-liner here,</span><span>Vertical slogan.</span></span></a>`;
  }

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ks-head");
    head.innerHTML = `
      <a class="ks-head__id" href="index.html" aria-label="First Page">${mark(false)}<span class="ks-head__copy">Your one-line slogan here.</span></a>
      <nav class="ks-nav" aria-label="Main menu"><ul>${NAV.map(([h, t, , sub, p]) => `<li><a href="${h}"${cur(p)}>${t}${sub ? ` <small>${sub}</small>` : ""}</a></li>`).join("")}</ul></nav>
      <div class="ks-head__brand">${brand}</div>
      <div class="ks-util"><ul>
        <li class="is-wide"><a class="ks-util__link" href="#">${icon.lock}Log in</a></li>
        <li class="is-wide"><a class="ks-util__link" href="#">${icon.pin}Directions</a></li>
        <li class="is-wide"><a class="ks-util__link" href="#">${icon.cal}Reservation</a></li>
        <li class="is-wide"><a class="ks-cart" href="#" aria-label="Cart">${icon.cart}</a></li>
        <li class="is-burger"><div class="ks-burger" role="button" tabindex="0" aria-label="Menu" aria-expanded="false"><span><i></i><i></i><i></i></span></div></li>
      </ul></div>`;
    // Only at tablet width the header band shrinks from 130 to 80 (on wide screens the band flows, on phone it stays at 60)
    const onScroll = () => head.classList.toggle("is-scrolled", scrollY > 10);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const drawer = document.querySelector('[data-slot="menu-drawer"]');
  if (drawer) {
    drawer.classList.add("ks-drawer");
    drawer.innerHTML = `<div class="ks-drawer__in">
      <nav aria-label="Full menu"><ul>
        <li><a href="index.html">First Page<small>TOP</small></a></li>
        ${NAV.map(([h, t, en, sub]) => `<li><a href="${h}"><span>${t}${sub ? `<em>${sub}</em>` : ""}</span><small>${en}</small></a></li>`).join("")}
      </ul></nav>
      <div class="ks-drawer__sub">
        <svg class="ks-drawer__illust" viewBox="0 0 240 240" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-label="Line illustration slot — Person holding a teacup"><circle cx="150" cy="70" r="20"/><path d="M134 92c-14 10-20 34-18 70M166 92c12 12 16 34 14 70M118 128l-26 18M96 140h-30v18c0 12 10 20 22 20s22-8 22-20v-18M110 146h8"/><path d="M60 196h130M140 108c6 4 14 4 20 0"/><path d="M40 60c8-10 22-10 30 0M44 40c4-6 12-6 16 0"/></svg>
        <ul>${["Usage guide", "Inquiry", "Member terms", "Sale label", "Transaction Legal Notice", "Privacy policy", "Parent company site"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
        <div class="ks-social"><a href="#" aria-label="Social Media">${icon.insta}</a><a href="#" aria-label="X">${icon.x}</a></div>
      </div></div>`;
    const btn = head?.querySelector(".ks-burger");
    const toggle = () => {
      const open = document.body.classList.toggle("is-menu-open");
      btn.setAttribute("aria-expanded", open);
    };
    btn?.addEventListener("click", toggle);
    btn?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  }

  const bar = document.querySelector('[data-slot="mobile-bar"]');
  if (bar) {
    bar.classList.add("ks-bar");
    bar.innerHTML = `<ul>${[[icon.lock, "Log in"], [icon.pin, "Directions"], [icon.cal, "Reservation"], [icon.cart, "Cart"]].map(([i, t]) => `<li><a href="#">${i}${t}</a></li>`).join("")}</ul>`;
  }

  // Business calendar — like the original, can only be paged forward from this month. Marks whole-facility closure (Mon), cafe closure and event days with circles
  const cal = document.querySelector('[data-slot="calendar"]');
  if (cal) {
    cal.classList.add("ks-cal");
    const award = '<span class="ks-award"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="4"><path d="M24 8.5A12 12 0 1 0 27 15H15"/></svg><span>Your award name here<b>Awarded 0000</b></span></span>';
    cal.innerHTML = `
      <div class="ks-cal__info">
        <div class="ks-cal__logos"><a href="index.html">${mark()}</a>${award}</div>
        <div class="ks-hours">
          <dl><dt>Facility 1 · Facility 2</dt><dd><span>Business hours</span> / 9:30 - 16:30<br><span>Regular holiday</span> / Monday (open on public holidays)</dd></dl>
          <dl><dt>Cafe</dt><dd><span>Business hours</span> / Weekdays 11:00 - 16:00 (L.O.15:30) Weekends 10:00 - 16:00 (L.O.15:30)<br><span>Regular holiday</span> / Mondays (open if a public holiday), one Tuesday a month</dd></dl>
          <dl class="is-wide"><dd>〒000-0000 One line of your address here　<a href="#">Directions</a></dd></dl>
        </div>
      </div>
      <div class="ks-cal__board">
        <div class="ks-cal__top"><div class="ks-cal__month"><b>10</b><span>OCT</span></div>
          <div class="ks-cal__btns"><a class="ks-arrow is-prev" href="#" role="button" aria-label="Previous month" aria-disabled="true"></a><a class="ks-arrow is-next" href="#" role="button" aria-label="Next month"></a></div></div>
        <div class="ks-cal__grid">
          <div class="ks-cal__week">${["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => `<span>${d}</span>`).join("")}</div>
          <div class="ks-cal__days"></div>
        </div>
        <div class="ks-cal__legend"><span><i class="is-all-off"></i>All facilities closed</span><span><i class="is-cafe-off"></i>Café closed days</span><span><i class="is-event"></i>Event date</span></div>
      </div>
      <aside class="ks-evwin" aria-label="Event of the Day"><button class="ks-evwin__close" type="button" aria-label="Close"></button><h3></h3><ul>
        <li><div class="wf-img wf-r-3x2 ks-ph" data-label="Event photo · Indoor · 3:2"></div><div><b>Workshop</b><br>Your one-line event name here<br>10:00〜12:00</div></li>
        <li><div class="wf-img wf-r-3x2 ks-ph" data-label="Event photo · Indoor · 3:2"></div><div><b>Event</b><br>Your one-line event name here<br>13:00〜15:00</div></li>
      </ul></aside>`;
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const days = cal.querySelector(".ks-cal__days"), grid = cal.querySelector(".ks-cal__grid");
    const prev = cal.querySelector(".is-prev"), next = cal.querySelector(".is-next");
    const win = cal.querySelector(".ks-evwin");
    const base = { y: 2026, m: 9 };
    let shift = 0;
    const draw = () => {
      const d0 = new Date(base.y, base.m + shift, 1), y = d0.getFullYear(), m = d0.getMonth();
      const lead = (d0.getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < lead; i++) cells.push('<button class="is-out" type="button" tabindex="-1"></button>');
      for (let d = 1; d <= n; d++) {
        const wd = (lead + d - 1) % 7;
        const cls = shift === 0
          ? ([5, 13, 19, 26].includes(d) ? "is-all-off" : d === 20 ? "is-cafe-off" : [3, 24, 31].includes(d) ? "is-event" : "")
          : wd === 0 ? "is-all-off" : wd === 1 && d > 14 && d < 22 ? "is-cafe-off" : wd === 5 && d % 2 ? "is-event" : "";
        cells.push(`<button type="button" class="${cls}" data-day="${d}"><abbr>${d}</abbr></button>`);
      }
      while (cells.length % 7) cells.push('<button class="is-out" type="button" tabindex="-1"></button>');
      days.innerHTML = cells.join("");
      cal.querySelector(".ks-cal__month b").textContent = m + 1;
      cal.querySelector(".ks-cal__month span").textContent = MONTHS[m];
      prev.setAttribute("aria-disabled", shift === 0);
    };
    const go = (dir) => {
      if (shift + dir < 0) return;
      if (reduce) { shift += dir; draw(); return; }
      grid.classList.add("is-fading");
      // The original wipes at .3s, then fetches next month’s data (about .7s) and shows it again at .3s
      setTimeout(() => { shift += dir; draw(); grid.classList.remove("is-fading"); }, 740);
    };
    prev.addEventListener("click", (e) => { e.preventDefault(); go(-1); });
    next.addEventListener("click", (e) => { e.preventDefault(); go(1); });
    days.addEventListener("click", (e) => {
      const b = e.target.closest(".is-event");
      if (!b) return;
      win.querySelector("h3").textContent = `${cal.querySelector(".ks-cal__month b").textContent}Month ${b.dataset.day}Work Events`;
      // The original pushes the window after fetching that day’s events (about .3s)
      setTimeout(() => win.classList.add("is-open"), reduce ? 0 : 310);
    });
    win.querySelector(".ks-evwin__close").addEventListener("click", () => win.classList.remove("is-open"));
    draw();
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ks-foot");
    foot.innerHTML = `
      <div class="ks-foot__in">
        <a href="#">${brand}</a>
        <div class="ks-foot__row">
          <div>
            <p class="ks-foot__warn">One line of legally required notice text goes here.<br>Add one more line of the same notice here.</p>
            <p class="ks-foot__note">Your caution line goes here.<br>Your slightly longer caution line here to fill two lines.<br>Your final notice line here.</p>
            <p class="ks-foot__addr">Your company name 〒000-0000 Your address in one line here</p>
          </div>
          <div class="ks-foot__links">
            <ul><li><a href="#">Parent company site</a></li><li><a href="#">Usage guide</a></li><li><a href="#">Inquiry</a></li></ul>
            <ul><li><a href="#">Member terms</a></li><li><a href="#">Sale label</a></li><li><a href="#">Transaction Legal Notice</a></li><li><a href="#">Privacy policy</a></li></ul>
          </div>
        </div>
      </div>
      <div class="ks-foot__bottom">
        <div class="ks-foot__follow"><p>New menus, new products, events, workshops<br>News lives here</p><div class="ks-social"><a href="#" aria-label="Social Media">${icon.insta}</a><a href="#" aria-label="X">${icon.x}</a></div></div>
        <p class="ks-foot__copy">© 2026 COMPANY NAME CO., LTD. All rights reserved.</p>
      </div>`;
  }

  // Page transition — like the original (Next route change), pressing soon shows a loading circle, and after .52s the body blurs over .9s and the new screen appears all at once.
  // Pressing in the phone drawer, after 90ms the drawer list fades away over .7s and the new screen loads. The incoming page doesn’t fade out and in again.
  const spin = document.createElement("div");
  spin.className = "ks-navspin";
  spin.setAttribute("aria-hidden", "true");
  spin.innerHTML = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="80 40" stroke-linecap="round"/></svg>';
  document.body.append(spin);
  if (sessionStorage.getItem("ks-nav")) { sessionStorage.removeItem("ks-nav"); document.body.classList.add("is-arrived", "is-loaded"); }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.pathname === location.pathname) {
      if (a.closest(".ks-drawer")) document.body.classList.remove("is-menu-open");
      return;
    }
    e.preventDefault();
    if (reduce) { location.href = url.href; return; }
    sessionStorage.setItem("ks-nav", "1");
    if (a.closest(".ks-drawer")) {
      setTimeout(() => document.body.classList.remove("is-menu-open"), 90);
      setTimeout(() => (location.href = url.href), 790);
      return;
    }
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = url.href), 1650);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("is-leaving"); });

  window.KS = { reduce, icon, mark };
})();
