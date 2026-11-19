// Frame and motion for all pages — the original relies on jQuery and CSS animation, so ScrollTrigger only adds a class as a marker.
(() => {
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ───────── Graphic pieces ───────── */
  const MARK = '<svg class="sg-mark" viewBox="0 0 88 88" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="44" cy="40" rx="30" ry="34"/><path d="M44 18c-7 0-10 8-10 16s3 12 3 18-4 10-4 14 5 6 11 6 11-2 11-6-4-8-4-14 3-10 3-18-3-16-10-16Z"/><path d="M14 64c8 10 18 16 30 16s22-6 30-16" stroke-linecap="round"/><path d="M38 30h12M38 36h12M40 42h8" stroke-linecap="round"/></svg>';
  const ICON = {
    line: '<svg viewBox="0 0 12 12"><path d="M6 2C3.2 2 1.5 3.6 1.5 5.6c0 1.8 1.4 3.2 3.4 3.5l-.3 1.4L7 9.2c2-.4 3.5-1.8 3.5-3.6C10.5 3.6 8.8 2 6 2Z" fill="currentColor"/></svg>',
    cal: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1.5" y="2.5" width="9" height="8" rx="1"/><path d="M1.5 5h9M4 1.5v2M8 1.5v2"/></svg>',
    cam: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1.5" y="1.5" width="9" height="9" rx="2.5"/><circle cx="6" cy="6" r="2"/></svg>',
  };
  const NAV = [["index.html", "First"], ["about.html", "Hospital Guide"], ["about.html#flow", "For first-time visitors"], ["service.html", "Menu · Prices"], ["index.html#access", "Hours · Directions"]];
  const menuList = () => `<ul class="sg-menu-list">${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
  const sns = '<div class="sg-sns"><a href="#" aria-label="LINE">' + ICON.line + '</a><a class="is-sq" href="#" aria-label="Social Media">' + ICON.cam + "</a></div>";
  const rich = (sub, ico, main) => `<a class="sg-rich" href="#"><small>${sub}</small><b><span class="sg-ico">${ico}</span>${main}</b></a>`;
  const btn = (ico, t) => `<a class="sg-btn" href="#"><span class="sg-ico">${ico}</span>${t}</a>`;

  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.childElementCount) el.innerHTML = html; });
  const build = () => {
    fill(".sg-header", `<div class="sg-header__inner"><div class="sg-hlogo">
        <p class="sg-hlogo__copy">Your hospital name here<i></i>One line here on what you do in the region</p>
        <a class="sg-hlogo__body" href="index.html" aria-label="Back to start">${MARK}<small>Clinic Name Brand-in</small></a></div></div>`);
    fill(".sg-ham-slot", `<button class="sg-ham" type="button" aria-label="Menu" data-ham><svg viewBox="0 0 32 22"><path d="M2 5 30 1"/><path d="M2 12 30 8"/><path d="M2 19 30 15"/><path class="is-x" d="M5 2 27 20"/><path class="is-x" d="M27 2 5 20"/></svg></button>`);
    fill(".sg-side", menuList() + sns);
    fill(".sg-drawer", `<div class="sg-drawer__bg" data-ham-close></div><div class="sg-drawer__inner">${menuList()}${sns}
      <ul class="sg-drawer__btns"><li>${rich("Quick booking via Messenger", ICON.line, "Add Friend")}</li><li>${rich("Open for submissions 24 hours", ICON.cal, "WEB booking")}</li></ul>
      <div class="sg-drawer__foot">${MARK}<div><p>Your hospital name here<br>〒000-0000 One line of your address here</p><p class="sg-tel">tel<b>000-000-0000</b></p><p>00:00~00:00 / 00:00~00:00<i>(Closed 00·00)</i></p></div></div></div>`);
    fill(".sg-cta", `<li><a href="#"><span class="sg-ico">${ICON.line}</span>Add LINE as a friend</a></li><li><a href="#"><span class="sg-ico">${ICON.cal}</span>WEB booking</a></li>`);
    const days = ["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Day", "Public holiday"];
    const row = (t, marks) => `<tr><td>${t}</td>${marks.map((m) => `<td>${m ? "●" : "／"}</td>`).join("")}</tr>`;
    fill(".sg-contact", `<p class="sg-contact__h">Your line here encouraging same-day booking or inquiries</p>
      <ul class="sg-contact__list"><li>${rich("Quick booking via Messenger", ICON.line, "Add Friend")}</li><li>${rich("Open for submissions 24 hours", ICON.cal, "Book on the web")}</li></ul>
      <div class="sg-contact__panel" id="access" data-slot="access-panel">
        <div class="sg-contact__left"><div class="wf-img" data-label="Map embed · hospital location pin · full width (green 80% overlay on top)"></div>
          <div class="sg-contact__company"><b>Your hospital name here</b><p>〒000-0000<br>Your one-line address here<br>(Parking: 0 spaces)</p><a href="#">View in map app</a></div></div>
        <div class="sg-contact__right"><table class="sg-hours"><tr><th>Consultation Hours</th>${days.map((d) => `<th>${d.length > 1 ? "Rest" : d}</th>`).join("")}</tr>
          ${row("00:00~00:00", [1, 1, 0, 1, 1, 1, 0, 0])}${row("00:00~00:00", [1, 1, 0, 1, 1, 0, 0, 0])}</table>
          <a class="sg-more is-white" href="about.html">Read more</a></div>
      </div>`);
    fill(".sg-footer", `<div class="sg-footer__inner">
        <div class="sg-fcompany">${MARK}<div class="sg-fcompany__detail"><p>〒000-0000<br>Your one-line address here</p><p class="sg-tel">tel<b>000-000-0000</b></p><p>00:00~00:00 / 00:00~00:00<i>(Closed 00·00)</i></p>${sns}</div></div>
        ${menuList()}
        <div class="sg-fbtns">${btn(ICON.line, "LINE Booking")}${btn(ICON.cal, "WEB booking")}</div>
        <small>© 0000. clinic name</small></div>`);
  };

  /* ───────── Interaction Response ───────── */
  const toggleMenu = (open) => {
    const ham = document.querySelector("[data-ham]"), drawer = document.querySelector(".sg-drawer");
    const on = open ?? !ham.classList.contains("is-active");
    ham.classList.toggle("is-active", on);
    drawer.classList.toggle("is-active", on);
  };
  // In-page link — original jQuery animate 500ms (swing = sine.inOut)
  const glide = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;
    const y = target.getBoundingClientRect().top + scrollY;
    reduced ? scrollTo(0, y) : gsap.to(window, { scrollTo: { y, autoKill: true }, duration: 0.5, ease: "sine.inOut" });
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-ham]")) return toggleMenu();
    if (e.target.closest("[data-ham-close]")) return toggleMenu(false);
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    e.preventDefault();
    toggleMenu(false);
    glide(url.hash);
  });

  const start = () => {
    build();
    setTimeout(() => body.classList.remove("c-preload"), 100);
    if (location.hash) { scrollTo(0, 0); setTimeout(() => glide(location.hash), 50); }

    const kv = document.querySelector(".sg-kv__slider");
    if (kv && window.Swiper) {
      new Swiper(kv, { centeredSlides: true, slidesPerView: "auto", speed: 2000, loop: true, effect: "fade", autoplay: reduced ? false : { delay: 4500, disableOnInteraction: false } });
    }

    // Hover a menu row to swap the right photo to that row’s photo (.8s overlap), release to return to the first photo
    const shots = [...document.querySelectorAll("[data-menu-photo] .wf-img")];
    document.querySelectorAll("[data-menu-link]").forEach((link, i) => {
      const show = (n) => shots.forEach((s, k) => s.classList.toggle("is-active", k === n));
      link.addEventListener("mouseover", () => show(i + 1));
      link.addEventListener("mouseout", () => show(0));
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".a-mask-photo, .a-fadein").forEach((item) => ScrollTrigger.create({ trigger: item, start: "top 85%", onEnter: () => item.classList.add("is-animated") }));
      const side = document.querySelector(".sg-side"), first = document.querySelector("[data-first-view]");
      if (side && first) ScrollTrigger.create({ trigger: first, start: "top top", onEnter: () => side.classList.add("is-hide"), onLeaveBack: () => side.classList.remove("is-hide") });
      const cta = document.querySelector(".sg-cta"), foot = document.querySelector(".sg-footer");
      if (cta && foot) ScrollTrigger.create({ trigger: foot, start: "top-=150 bottom", onEnter: () => cta.classList.add("is-hide"), onLeaveBack: () => cta.classList.remove("is-hide") });
    });
    addEventListener("load", () => ScrollTrigger.refresh());
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
