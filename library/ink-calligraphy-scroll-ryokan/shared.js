// Shared by all pages: inserts the full menu, reservation drawer and footer, and applies the original common.js motion with the same values.
// Original was written in jQuery, but here only pages with a slider load jQuery (slick requires it) and the rest use vanilla JS for the same behavior.
(() => {
  const NAV = [
    ["index.html#stay", "Overnight · Day Visit"], ["room.html", "Guest room"], ["cuisine.html", "Cooking"], ["onsen.html", "Hot spring"],
    ["index.html#facilities", "Facility Amenities"], ["index.html#gift", "Hometown Donation"], ["index.html#family", "Together with your child"],
    ["index.html#anniversary", "Anniversaries and celebrations"], ["index.html#group", "Groups and gatherings"], ["index.html#wedding", "Wedding"],
    ["index.html#access", "Directions"], ["index.html#members", "Member points info"],
  ];
  const FOOT = [
    ["index.html#stay", "Overnight · Day Visit"], ["room.html", "Guest room"], ["cuisine.html", "Cooking"], ["onsen.html", "Hot spring"], ["index.html#facilities", "Facility Overview"],
    ["index.html#family", "Together with your child"], ["index.html#anniversary", "Anniversaries and celebrations"], ["index.html#group", "Groups and gatherings"], ["index.html#plan", "Plan"], ["index.html#access", "Directions"],
  ];
  const crest = '<svg class="kh-crest" viewBox="0 0 64 64" aria-hidden="true"><path class="is-fill" d="M12 52C8 34 20 14 46 8c-6 9-4 17 6 21-7 4-6 12 2 18-12 8-30 10-42 5z"/><path class="is-cut" d="M17 48c9-8 17-18 25-34M21 51c10-5 19-11 27-19M14 41c6-6 9-12 12-20"/></svg>';
  const vlogo = '<span class="kh-wordmark-v" data-label="Inn vertical logo — small header + brush calligraphy name, gold"><small>Your Hot Spring Here</small><b>Accommodation</b></span>';
  const hlogo = `<span class="kh-wordmark-h" data-label="Lodging horizontal logo">${crest}<b>Your Lodging Here</b></span>`;
  const links = (list) => list.map(([h, t]) => `<a href="${h}">${t}</a>`).join("");

  const footer = `
<footer class="kh-footer kh-st" data-slot="footer">
  <div class="kh-footer__bg">
    <div class="kh-footer__logo"><a href="index.html" aria-label="To the first page">${vlogo}</a></div>
    <address class="kh-footer__address">
      <p class="kh-footer__loc">〒000-0000<br>Your accommodation address here, one line</p>
      <p class="kh-footer__tel"><a href="index.html#tel">TEL：000-00-0000</a> <span class="kh-pc">/</span><br class="kh-sp"> FAX：000-00-0000</p>
    </address>
  </div>
  <nav class="kh-footer__nav">${links(FOOT)}</nav>
  <ul class="kh-footer__group">${["Annex", "Sister lodging", "Wedding", "Online store"].map((t) => `<li><a href="index.html#group" class="wf-logo" data-label="${t} Logo">${t}</a></li>`).join("")}</ul>
  <small class="kh-footer__copy">&copy; Your lodging name here</small>
</footer>`;

  const gnav = `
<nav class="kh-gnav" data-slot="menu-drawer" aria-label="Full menu">
  <div class="kh-gnav__main kh-container">
    <div class="kh-gnav__logo"><a href="index.html" aria-label="To the first page">${hlogo}${vlogo}</a></div>
    <ul class="kh-gnav__menu">${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
    <ul class="kh-gnav__sub kh-sp"><li><a href="index.html#privacy">Privacy policy</a></li></ul>
    <div class="kh-gnav__contact">
      <button type="button" class="kh-gnav__stay kh-search-btn">Book now</button>
      <a href="index.html#tel" class="kh-gnav__tel">000-00-0000</a>
      <p class="kh-gnav__hours kh-pc">Reservation hours 9:00～18:00</p>
    </div>
  </div>
  <div class="kh-gnav__aside kh-container">
    <ul class="kh-gnav__sub kh-pc"><li><a href="index.html#privacy">Privacy policy</a></li></ul>
    <div class="kh-gnav__language"><a href="index.html" class="is-active" lang="ja">日本語</a><a href="index.html#en" lang="en">English</a><a href="index.html#zh">简体中文</a><a href="index.html#tw">繁體中文</a><a href="index.html#ko">Korean</a></div>
  </div>
  <div class="kh-container" style="margin-top:.4rem">
    <hr class="kh-hr is-gold">
    <div class="kh-gnav__foot">
      <ul class="kh-gnav__sns">${["X", "Brand", "Social Media", "Tick-tock"].map((t) => `<li><a href="index.html#sns" aria-label="${t}"></a></li>`).join("")}</ul>
      <ul class="kh-gnav__group">${["Annex", "Sister lodging", "Online store"].map((t) => `<li><a href="index.html#group" class="wf-logo" data-label="${t} Logo">${t}</a></li>`).join("")}</ul>
    </div>
    <p class="kh-gnav__recruit"><a href="index.html#recruit">Lodging group careers page</a></p>
  </div>
</nav>`;

  const search = `
<div class="kh-search" data-slot="reserve-drawer" role="dialog" aria-label="Reservation">
  <div class="kh-search__in">
    <h2 class="kh-search__h"><span class="is-jp">Stay Plans</span><span class="is-en" lang="en">Stay plan</span></h2>
    <nav class="kh-search__nav"><ul><li>
      <div class="kh-search__thumb"><div class="wf-img" data-label="Rice fields and mountains from the room window · clear day · 16:10 (B&W → color)"></div></div>
      <a href="index.html#plan"><span class="is-en" lang="en">All plan</span><span class="is-jp"><em>All</em> Stay Plans</span></a>
    </li></ul></nav>
    <h2 class="kh-search__h"><span class="is-jp">Find vacancies</span><span class="is-en" lang="en">Search</span></h2>
    <div class="kh-search__bar wf-img" data-label="Booking engine search bar slot — date, guests, rooms"></div>
    <button type="button" class="kh-search__close kh-search-btn" aria-label="Close">×</button>
  </div>
</div>`;

  const slot = document.querySelector("[data-kh-chrome]");
  if (slot) slot.outerHTML = footer + gnav + search;

  // ── Menu·booking drawer: opening one closes the other. On close, it fades out in 0.3s with is-close ──
  const body = document.body;
  const icon = document.querySelector(".kh-menu-btn__icon");
  const gnavEl = document.querySelector(".kh-gnav");
  const searchEl = document.querySelector(".kh-search");
  const shut = (el) => { if (el.classList.contains("is-open")) { el.classList.remove("is-open"); el.classList.add("is-close"); } };
  const openNav = () => {
    icon.classList.add("is-open");
    if (searchEl.classList.contains("is-open")) shut(searchEl);
    gnavEl.classList.remove("is-close");
    gnavEl.classList.add("is-open");
  };
  const closeNav = () => { icon.classList.remove("is-open"); shut(gnavEl); };
  document.querySelectorAll(".kh-nav-btn").forEach((b) => b.addEventListener("click", () => {
    if (icon.classList.contains("is-open")) { closeNav(); body.style.overflowY = "visible"; }
    else { openNav(); body.style.overflowY = "hidden"; }
  }));
  let searchOpen = false;
  document.querySelectorAll(".kh-search-btn").forEach((b) => b.addEventListener("click", () => {
    if (searchOpen) {
      searchOpen = false; shut(searchEl); body.style.overflowY = "visible";
    } else {
      searchOpen = true;
      if (gnavEl.classList.contains("is-open")) { icon.classList.remove("is-open"); shut(gnavEl); }
      searchEl.classList.remove("is-close"); searchEl.classList.add("is-open"); body.style.overflowY = "hidden";
    }
  }));

  // ── Reaching the bottom edge of the screen adds is-anim (original js-ScrollTrigger → is-animation). Once attached, it is never removed
  const arrivals = [...document.querySelectorAll(".kh-st")];
  const arrive = () => {
    const h = innerHeight;
    for (const el of arrivals) if (!el.classList.contains("is-anim") && el.getBoundingClientRect().top < h) el.classList.add("is-anim");
  };

  // ── Letter by letter: each letter delayed i/5 s, starts 100px above the bottom edge of the screen. <br> Kept as a line break, character numbering continues on
  const eachEls = [...document.querySelectorAll(".kh-each")];
  const splitEach = () => eachEls.forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    let i = 0;
    const out = document.createDocumentFragment();
    for (const node of [...el.childNodes]) {
      if (node.nodeType !== 3) { out.append(node.cloneNode(true)); continue; }
      for (const ch of node.textContent) {
        if (ch === " " || ch === "\n" || ch === "\t") { if (ch === " ") out.append(" "); i++; continue; }
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.animationDelay = `${i / 5}s`;
        out.append(s);
        i++;
      }
    }
    el.replaceChildren(out);
  });
  const eachCheck = () => { for (const el of eachEls) if (el.getBoundingClientRect().top <= innerHeight + 100) el.classList.add("is-appear"); };

  addEventListener("scroll", () => { arrive(); eachCheck(); }, { passive: true });
  arrive();
  addEventListener("load", () => { splitEach(); eachCheck(); arrive(); });

  // ── Tabs: buttons and panels sharing the same data-tabs name
  document.querySelectorAll(".kh-tabs").forEach((nav) => {
    const tabs = [...nav.querySelectorAll(".kh-tab")];
    const panels = [...document.querySelectorAll(`[data-tabpanels="${nav.dataset.tabs}"] > .kh-tabpanel`)];
    tabs.forEach((tab, i) => tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      panels.forEach((p) => p.classList.remove("is-active"));
      panels[i]?.classList.add("is-active");
    }));
  });

  // ── Accordion: jQuery slideToggle default (400ms, swing = open and close the same as sine.inOut)
  document.querySelectorAll(".kh-acc__h").forEach((h) => {
    const panel = h.nextElementSibling;
    if (!panel) return;
    panel.hidden = true;
    h.addEventListener("click", () => {
      const opening = panel.hidden;
      h.classList.toggle("is-open", opening);
      if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) { panel.hidden = !opening; return; }
      gsap.killTweensOf(panel);
      if (opening) {
        panel.hidden = false;
        gsap.fromTo(panel, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { height: "auto", paddingTop: "", paddingBottom: "", duration: 0.4, ease: "sine.inOut", clearProps: "all" });
      } else {
        gsap.to(panel, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden", duration: 0.4, ease: "sine.inOut", onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: "all" }); } });
      }
    });
  });

  // ── Scroll reveal·parallax — GSAP values of the original common.js as is (default curve power1.out)
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const once = (el) => ({ trigger: el, start: "top 75%", toggleActions: "play none none complete", once: true });
    gsap.utils.toArray(".kh-fadein").forEach((el) => gsap.from(el, { scrollTrigger: once(el), duration: 3, opacity: 0 }));
    gsap.utils.toArray(".kh-ltr").forEach((el) => gsap.from(el, { scrollTrigger: once(el), duration: 2, opacity: 0, xPercent: 8 }));
    gsap.utils.toArray(".kh-rtl").forEach((el) => gsap.from(el, { scrollTrigger: once(el), duration: 2, opacity: 0, xPercent: -8 }));
    gsap.utils.toArray(".kh-parallax").forEach((el) => {
      gsap.to(el, { y: +(el.dataset.y ?? -100), scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
