// All pages — fills in the header, menu drawer, footer and video modal, and wires up header hiding, drawer open/close, region list collapse, FAQ, show-once on visible, video play when visible, and the diagnostic banner Lottie.
// Values are the original common.js·common.css as is (header row .6s power2-inout, drawer clip .8s power3-inout + backdrop .25s, question height .4s power2-out, once when visible at top 80%).
(() => {
  const PAGE = document.body.dataset.page;
  const I = {
    menu: '<svg viewBox="0 0 16 12" fill="currentColor"><rect width="16" height="1.6"/><rect y="5.2" width="16" height="1.6"/><rect y="10.4" width="16" height="1.6"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l12 12M14 2 2 14"/></svg>',
    fav: '<svg class="mm-ico" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M3.3 1.3h9.4v13.9L8 11.7l-4.7 3.5zm1.4 1.4v9.7L8 9.9l3.3 2.5V2.7z"/></svg>',
    user: '<svg class="mm-ico" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 .7a7.3 7.3 0 1 1 0 14.6A7.3 7.3 0 0 1 8 .7zm0 1.4a5.9 5.9 0 0 0-4.3 9.9c1.1-1.5 2.6-2.3 4.3-2.3s3.2.8 4.3 2.3A5.9 5.9 0 0 0 8 2.1zm0 8.9c-1.3 0-2.4.6-3.3 1.8a5.9 5.9 0 0 0 6.6 0c-.9-1.2-2-1.8-3.3-1.8zm0-7.3a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2zm0 1.3a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/></svg>',
    globe: '<svg class="mm-ico" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 .8a7.2 7.2 0 1 1 0 14.4A7.2 7.2 0 0 1 8 .8zm0 1.3a5.9 5.9 0 1 0 0 11.8A5.9 5.9 0 0 0 8 2.1z"/><path d="M1.6 7.35h12.8v1.3H1.6z"/><path fill-rule="evenodd" d="M8 1.2c2.1 1.8 3.4 4.2 3.4 6.8S10.1 13 8 14.8C5.9 13 4.6 10.6 4.6 8S5.9 3 8 1.2zm0 1.8C6.7 4.4 5.9 6.1 5.9 8s.8 3.6 2.1 5c1.3-1.4 2.1-3.1 2.1-5S9.3 4.4 8 3z"/></svg>',
    cal: '<svg class="mm-ico" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.3 1h1.4v1.3h4.6V1h1.4v1.3h1.7c.8 0 1.5.7 1.5 1.5v9.9c0 .8-.7 1.5-1.5 1.5H2.6c-.8 0-1.5-.7-1.5-1.5V3.8c0-.8.7-1.5 1.5-1.5h1.7zM2.5 6.9v6.7h11V6.9zm0-1.4h11V3.7h-11z"/><path d="m5 10.5 1-1 1.4 1.3 2.8-2.8 1 1-3.8 3.8z"/></svg>',
    arrow: '<svg viewBox="0 0 11 10" fill="currentColor"><path d="M6.2 0 11 5l-4.8 5-1.1-1.1L8.1 5.8H0V4.2h8.1L5.1 1.1z"/></svg>',
    ig: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="16" height="16" rx="4.6"/><circle cx="10" cy="10" r="3.8"/><circle cx="14.8" cy="5.2" r=".9" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 0 0-1.4 17.9v-6.3H6.3V10h2.3V8c0-2.3 1.4-3.5 3.4-3.5 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V10h2.6l-.4 2.6h-2.2v6.3A9 9 0 0 0 10 1z"/></svg>',
    yt: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M19 6.2a2.4 2.4 0 0 0-1.7-1.7C15.8 4.1 10 4.1 10 4.1s-5.8 0-7.3.4A2.4 2.4 0 0 0 1 6.2 25 25 0 0 0 .6 10 25 25 0 0 0 1 13.8a2.4 2.4 0 0 0 1.7 1.7c1.5.4 7.3.4 7.3.4s5.8 0 7.3-.4a2.4 2.4 0 0 0 1.7-1.7 25 25 0 0 0 .4-3.8 25 25 0 0 0-.4-3.8zM8.1 12.4V7.6l4.8 2.4z"/></svg>',
    phone: '<svg viewBox="0 0 106 120" fill="none" stroke="currentColor" stroke-width="3"><rect x="22" y="6" width="62" height="112" rx="10" transform="rotate(-10 53 62)"/><path d="M40 40h28M40 56h20M40 72h24" transform="rotate(-10 53 62)"/></svg>',
  };
  window.mmIcons = I;
  const LOGO = (tone = "") => `<svg class="mm-logo ${tone}" viewBox="0 0 144 32" role="img" aria-label="Brand Logo" data-label="Brand logo — square symbol + two-line English name"><rect x="0" y="1" width="30" height="30" fill="currentColor"/><path d="M8 7v18M15 7v18M22 7v18M5 13h20" stroke="var(--mm-logo-cut, var(--kf-surface))" stroke-width="1.6"/><text x="38" y="11" font-size="7.4" letter-spacing=".9" fill="currentColor" class="mm-logo__sub">APARTMENT HOTEL</text><text x="38" y="28" font-size="16" letter-spacing="1.8" fill="currentColor" class="mm-logo__main">BRAND</text></svg>`;
  const AREAS = [["Region A", 15], ["Region B", 7], ["Region C", 7]];
  const SEARCH = [["list.html?by=list", "Search in list"], ["list.html?by=experience", "Find it in experience"], ["list.html?by=area", "Find by destination"]];
  const LANGS = ["English", "中文", "日本語", "Korean", "Deutsch", "Bahasa Indonesia"];
  const INFO = [["news.html", "News"], ["index.html#faq", "Frequently asked questions"], ["#", "Inquiry"], ["#", "Sustainability"], ["#", "Corporate · travel agency"]];

  const hotels = (cls) => AREAS.map(([name, n], a) => `<div class="mm-menu__hotels-area">
      <button class="mm-menu__hotels-ttl" type="button">${name}<span class="mm-plus mm-sp" aria-hidden="true"></span></button>
      <div class="mm-menu__hotels-body"><div class="mm-menu__hotels-mask"><ul class="mm-menu__hotels-list">${Array.from({ length: n }, (_, i) => `<li><a class="mm-menu__hotels-link" href="list.html">Lodging name ${String.fromCharCode(65 + a)}${String(i + 1).padStart(2, "0")}</a></li>`).join("")}</ul></div></div>
    </div>`).join("");
  const menuBody = (where) => `
    <div class="mm-menu__row1">
      ${where === "navi" ? `<ul class="mm-menu__lang">${I.globe}${LANGS.map((l) => `<li><a href="index.html?lang=${LANGS.indexOf(l)}" class="mm-menu__lang-link${l === "Korean" ? " is-current" : ""}">${l}</a></li>`).join("")}</ul>` : ""}
      <ul class="mm-menu__actions"><li><a class="mm-menu__actions-link" href="list.html?fav=1">${I.fav}<span>Saved places</span></a></li><li><a class="mm-menu__actions-link" href="index.html?mypage=1">${I.user}<span>My page</span></a></li></ul>
      <button class="mm-menu__reserve" type="button" data-label="Open Booking Search">${I.cal}<span>Reservation</span></button>
    </div>
    <div class="mm-menu__row2 mm-menu__row" style="margin-top:3.2rem">
      <ul class="mm-menu__navi"><li><a class="mm-menu__navi-link" href="about.html">Know the Brand</a></li><li><span class="mm-menu__navi-sub">Find a Lodging</span></li></ul>
      <ul class="mm-menu__search">${SEARCH.map(([h, t]) => `<li><a class="mm-menu__search-link" href="${h}">${t}</a></li>`).join("")}</ul>
    </div>
    <div class="mm-menu__row">${hotels(where)}</div>
    <div class="mm-menu__row4">
      <ul class="mm-menu__info">${INFO.map(([h, t]) => `<li><a class="mm-menu__info-link" href="${h}">${t}</a></li>`).join("")}</ul>
      <ul class="mm-menu__sns"><li><a class="mm-menu__sns-link" href="#" aria-label="Instagram">${I.ig}</a></li><li><a class="mm-menu__sns-link" href="#" aria-label="Facebook">${I.fb}</a></li><li><a class="mm-menu__sns-link" href="#" aria-label="YouTube">${I.yt}</a></li></ul>
      <div class="mm-menu__bnrs">
        <a href="#" class="mm-menu__pokemon"><div class="wf-img" data-label="Character collab guest room banner · light sky blue · landscape 304:80"></div></a>
        <a href="#" class="mm-tsf-mini"><p class="mm-tsf-mini__txt">For you planning a trip: a travel style quiz.</p><p class="mm-tsf-mini__ttl" data-label="Diagnostic service English name">Travel Style Finder</p><span class="mm-tsf-mini__img" aria-hidden="true">${I.phone}</span></a>
      </div>
    </div>`;

  const header = document.querySelector('[data-slot="header"]');
  header.className = "mm-header";
  header.innerHTML = `
    <a class="mm-header__logo" href="index.html">${LOGO()}</a>
    <button class="mm-header__menu" type="button" aria-label="Open Menu" aria-expanded="false">${I.menu}</button>
    <ul class="mm-header__navi">
      <li class="mm-header__navi-item"><a class="mm-header__navi-link" href="about.html">Know the Brand</a></li>
      <li class="mm-header__navi-item has-drop"><button class="mm-header__navi-btn" type="button">Find a Lodging<span class="mm-plus" aria-hidden="true"></span></button>
        <div class="mm-header__drop"><div class="mm-header__drop-mask"><ul class="mm-header__drop-list">${SEARCH.map(([h, t]) => `<li><a class="mm-header__drop-link" href="${h}">${t}</a></li>`).join("")}</ul></div></div></li>
    </ul>
    <ul class="mm-header__actions"><li><a class="mm-header__actions-link" href="list.html?fav=1">${I.fav}<span>Saved places</span></a></li><li><a class="mm-header__actions-link" href="index.html?mypage=1">${I.user}<span>My page</span></a></li></ul>
    <div class="mm-header__lang">
      <button class="mm-header__lang-btn" type="button" aria-label="Language">${I.globe}<span>Korean</span></button>
      <div class="mm-header__drop mm-header__lang-pull"><div class="mm-header__drop-mask"><ul class="mm-header__drop-list">${LANGS.map((l, i) => `<li><a href="index.html?lang=${i}" class="mm-header__lang-link${l === "Korean" ? " is-current" : ""}">${l}</a></li>`).join("")}</ul></div></div>
    </div>
    <button class="mm-reserve" type="button" data-label="Open Booking Search">${I.cal}<span>Reservation</span></button>`;

  const navi = document.querySelector('[data-slot="menu"]');
  navi.className = "mm-navi";
  navi.setAttribute("aria-label", "Full menu");
  navi.innerHTML = `<div class="mm-navi__bg"></div><div class="mm-navi__scroll"><div class="mm-navi__contents">
      <button class="mm-navi__close" type="button" aria-label="Close">${I.close}</button>
      <a class="mm-navi__logo" href="index.html">${LOGO()}</a>
      ${menuBody("navi")}
    </div></div>`;

  const footer = document.querySelector('[data-slot="footer"]');
  footer.className = "mm-footer";
  footer.innerHTML = `<div class="mm-footer__mimaru">
      ${menuBody("footer")}
      <div class="mm-footer__row5">
        <ul class="mm-footer__legal">${["Site terms of use", "Privacy policy", "Member terms", "Social Media Policy", "Cookie Policy", "Stay Terms", "Operating company", "Hiring Info"].map((t) => `<li><a class="mm-footer__legal-link" href="#">${t}</a></li>`).join("")}</ul>
        <ul class="mm-footer__lang">${LANGS.map((l, i) => `<li><a class="mm-footer__lang-link" href="index.html?lang=${i}">${l}</a></li>`).join("")}</ul>
      </div>
      <a class="mm-footer__logo" href="index.html" style="--mm-logo-cut: var(--kf-contrast-bg)"><svg viewBox="0 0 48 200" class="mm-logo" fill="currentColor" role="img" aria-label="Brand logo (vertical)"><rect x="0" y="0" width="48" height="48"/><path d="M13 9v30M24 9v30M35 9v30M8 19h32" stroke="var(--kf-contrast-bg)" stroke-width="2.4"/><text x="0" y="0" transform="translate(30 60) rotate(90)" font-size="9" letter-spacing="1.4">APARTMENT HOTEL</text><text x="0" y="0" transform="translate(6 60) rotate(90)" font-size="20" letter-spacing="3">BRAND</text></svg></a>
      <a class="mm-footer__logo-sp mm-sp" href="index.html" style="--mm-logo-cut: var(--kf-contrast-bg)">${LOGO()}</a>
    </div>
    <div class="mm-footer__chm"><div class="mm-footer__chm-logo"><div class="wf-img" data-label="Operating company logo · horizontal"></div></div><p class="mm-footer__copy">COPYRIGHT © COMPANY NAME. ALL RIGHTS RESERVED.</p></div>`;

  const modal = document.createElement("div");
  modal.className = "mm-modal";
  modal.innerHTML = `<div class="mm-modal__bg"></div><div class="mm-modal__box"><button class="mm-modal__close" type="button" aria-label="Close">${I.close}</button><video src="media/placeholder.mp4" playsinline controls preload="none" aria-label="Family trip story video slot · landscape 16:9"></video></div>`;
  document.body.append(modal);

  // Booking panel — opened by the Book button in the header, drawer and footer (the original shows a tripla vacancy search in the same panel)
  const chipsHtml = (name, list) => list.map((t, i) => `<label class="mm-chip"><input type="checkbox" name="${name}" value="${i}"><i aria-hidden="true"></i><span>${t}</span></label>`).join("");
  const peopleHtml = (label, small, v) => `<div class="mm-ctl"><span class="mm-ctl__label">${label}<small>${small}</small> <span class="mm-ctl__sep">:</span></span><div class="mm-people"><button type="button" class="mm-people__btn" data-type="decrease" aria-label="Minus One Person"></button><input class="mm-people__input" type="number" value="${v}" min="0" max="10" aria-label="${label} Number"><button type="button" class="mm-people__btn" data-type="increase" aria-label="Add one more person"></button></div></div>`;
  const resv = document.createElement("div");
  resv.className = "mm-resv";
  resv.innerHTML = `<div class="mm-resv__bg"></div><div class="mm-resv__content" role="dialog" aria-label="Find vacancies">
      <header class="mm-resv__header"><p>Find vacancies</p><button type="button" class="mm-resv__close" aria-label="Close">${I.close}</button></header>
      <div class="mm-resv__main">
        <div class="mm-resv__row"><div class="mm-ctl mm-ctl--date"><span class="mm-ctl__label">Check-in <span class="mm-ctl__sep">:</span></span><input class="mm-ctl__date" type="text" value="0000. 00. 00." readonly aria-label="Check-in day"></div><div class="mm-ctl mm-ctl--date"><span class="mm-ctl__label">Check-out <span class="mm-ctl__sep">:</span></span><input class="mm-ctl__date" type="text" value="0000. 00. 00." readonly aria-label="Check-out day"></div></div>
        <div class="mm-resv__row">${peopleHtml("Adult", "Ages 7+", 4)}${peopleHtml("Kids", "Ages 0~6", 0)}</div>
        <div class="mm-resv__row"><div class="mm-ctl mm-ctl--wide"><span class="mm-ctl__label">Area <span class="mm-ctl__sep">:</span></span><div class="mm-ctl__chips">${chipsHtml("area", ["Region A", "Region B", "Region C"])}</div></div></div>
        <div class="mm-resv__row"><div class="mm-ctl mm-ctl--wide"><span class="mm-ctl__label">Accommodation <span class="mm-ctl__sep">:</span></span><div class="mm-resv__select"><select aria-label="Accommodation"><option>Choose lodging in this area</option></select><i aria-hidden="true"></i></div></div></div>
      </div>
      <footer class="mm-resv__footer"><button type="reset" class="mm-sbox__reset" style="position:static">Clear Conditions</button><button type="button" class="mm-btn"><span class="mm-btn__txt">Find</span></button></footer>
    </div>`;
  document.body.append(resv);
  const openResv = () => { resv.classList.add("is-show"); document.documentElement.style.overflow = "hidden"; };
  const closeResv = () => { if (!resv.classList.contains("is-show")) return; resv.classList.remove("is-show"); document.documentElement.style.overflow = ""; };
  document.querySelectorAll(".mm-reserve, .mm-menu__reserve").forEach((b) => b.addEventListener("click", () => { closeNavi(); openResv(); }));
  resv.querySelector(".mm-resv__close").addEventListener("click", closeResv);
  resv.querySelector(".mm-resv__bg").addEventListener("click", closeResv);
  addEventListener("keyup", (e) => e.key === "Escape" && closeResv());

  // Cookie notice — pressing close drops it down (the original sends a request to save the cookie, then adds is-hide)
  const gdpr = document.createElement("div");
  gdpr.className = "mm-gdpr";
  gdpr.innerHTML = '<p class="mm-gdpr__txt">This site uses cookies. <a href="#">View details</a></p><button class="mm-gdpr__btn" type="button" aria-label="Close cookie notice">' + I.close + '</button>';
  document.body.append(gdpr);
  gdpr.querySelector(".mm-gdpr__btn").addEventListener("click", () => gdpr.classList.add("is-hide"));

  document.querySelectorAll('[data-icon="arrow"]').forEach((el) => { el.innerHTML = I.arrow; });

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header bar — from the very top until the footer head touches the screen bottom, hides on scroll down and shows on scroll up
  const menuBtn = header.querySelector(".mm-header__menu");
  ScrollTrigger.create({
    start: "top top", endTrigger: footer, end: "top bottom",
    onUpdate: (st) => header.classList.toggle("is-hide", st.direction !== -1 && st.scroll() > 0),
  });

  // Drawer — the panel unfolds downward from the header bar spot, and on closing folds back the same way, then the panel and curtain turn off at .7s
  const openNavi = () => {
    navi.classList.add("is-show");
    menuBtn.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  };
  const closeNavi = () => {
    if (!navi.classList.contains("is-show")) return;
    navi.classList.remove("is-show");
    menuBtn.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  };
  menuBtn.addEventListener("click", openNavi);
  navi.querySelector(".mm-navi__close").addEventListener("click", closeNavi);
  navi.querySelector(".mm-navi__bg").addEventListener("click", closeNavi);
  addEventListener("keyup", (e) => e.key === "Escape" && (closeNavi(), closeModal()));

  // Region list — folds and unfolds on phones only (grid-rows .4s power2-out)
  document.querySelectorAll(".mm-menu__hotels-ttl").forEach((b) => b.addEventListener("click", () => {
    if (matchMedia("(min-width: 768px)").matches) return;
    b.classList.toggle("is-show");
  }));

  // Video modal — the original opens an embedded player and plays from the start
  const mVideo = modal.querySelector("video");
  const openModal = () => { modal.classList.add("is-show"); mVideo.currentTime = 0; mVideo.play().catch(() => {}); document.documentElement.style.overflow = "hidden"; };
  const closeModal = () => { if (!modal.classList.contains("is-show")) return; modal.classList.remove("is-show"); mVideo.pause(); document.documentElement.style.overflow = ""; };
  modal.querySelector(".mm-modal__close").addEventListener("click", closeModal);
  modal.querySelector(".mm-modal__bg").addEventListener("click", closeModal);
  document.querySelectorAll("[data-modal-video]").forEach((b) => b.addEventListener("click", openModal));

  // Search panel — more conditions unfold in .4s, guest count button
  const more = document.querySelector(".mm-sbox__more"), detail = document.querySelector(".mm-sbox__detail");
  if (more && detail) more.addEventListener("click", () => {
    const on = detail.classList.toggle("is-show");
    more.setAttribute("aria-expanded", String(on));
  });
  document.querySelectorAll(".mm-people").forEach((box) => {
    const input = box.querySelector("input");
    box.querySelectorAll(".mm-people__btn").forEach((b) => b.addEventListener("click", () => {
      const v = +input.value + (b.dataset.type === "increase" ? 1 : -1);
      input.value = Math.min(+input.max, Math.max(+input.min, v));
    }));
  });
  // FAQ — measure the height and open in .4s, then set to auto once fully open. When closing, pin the height and fold after .1s
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const done = (el) => new Promise((r) => { const f = (e) => { if (e.target === el) { el.removeEventListener("transitionend", f); r(); } }; el.addEventListener("transitionend", f); setTimeout(r, 600); });
  document.querySelectorAll(".mm-faq-item").forEach((item) => {
    const head = item.querySelector(".mm-faq-item__header"), body = item.querySelector(".mm-faq-item__body");
    let open = false;
    head.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); head.click(); } });
    head.addEventListener("click", async () => {
      if (!open) {
        open = true; head.classList.add("is-show"); head.setAttribute("aria-expanded", "true");
        body.style.height = `${body.scrollHeight}px`;
        await done(body);
        if (open) body.style.height = "auto";
      } else {
        open = false; head.setAttribute("aria-expanded", "false");
        body.style.height = `${body.scrollHeight}px`;
        await wait(0.1);
        head.classList.remove("is-show");
        body.style.height = "";
      }
    });
  });

  // Once when visible — when the top edge passes 80% of the screen, add is-once-show
  document.querySelectorAll("[data-trigger-once]").forEach((el) => {
    if (reduce) return el.classList.add("is-once-show");
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "top 80%", onLeave: () => el.classList.add("is-once-show") });
  });

  // Video — after preloading, plays when visible and pauses when off-screen
  document.querySelectorAll("[data-trigger-video]").forEach((wrap) => {
    const v = wrap.querySelector("video");
    if (!v) return;
    const show = () => v.classList.add("is-show");
    if (v.readyState >= 1) show(); else v.addEventListener("loadedmetadata", show, { once: true });
    v.load();
    if (reduce) return;
    const play = () => v.play().catch(() => {}), pause = () => v.pause();
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onEnter: play, onEnterBack: play, onLeave: pause, onLeaveBack: pause });
  });

  // Diagnosis banner Lottie — 19 seconds of a phone rising and a finger tapping answers, rests 1 second at the end, then repeats. Runs only while visible.
  // The beat from the original data.json (30fps · 570f, phone rises 0~27f · drops 518~552f, hand taps 41 · 144 · 305 · 428 · 485f) recomposed with our shapes
  window.mmTsfLottie = (box) => {
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const rgb = (n) => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = css(n) || c.fillStyle;
      const h = c.fillStyle.replace("#", "");
      return h.length === 6 ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1) : [0, 0, 0, 1];
    };
    const ink = rgb("--kf-ink"), surf = rgb("--kf-surface"), acc = rgb("--kf-accent"), dim = rgb("--kf-dim"), line = rgb("--kf-line"), raised = rgb("--kf-raised");
    const st = (v) => ({ a: 0, k: v });
    const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.67], y: [1] } };
    const anim = (keys) => ({ a: 1, k: keys.map(([t, v], i) => (i < keys.length - 1 ? { t, s: [].concat(v), ...ease } : { t, s: [].concat(v) })) });
    const rect = (w, h, x, y, r, fill, stroke, sw = 0) => ({ ty: "gr", it: [
      { ty: "rc", d: 1, s: st([w, h]), p: st([x, y]), r: st(r) },
      ...(stroke ? [{ ty: "st", c: st(stroke), o: st(100), w: st(sw), lc: 2, lj: 2 }] : []),
      ...(fill ? [{ ty: "fl", c: st(fill), o: st(100), r: 1 }] : []),
      { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) },
    ] });
    const layer = (ind, nm, ks, shapes, parent) => ({ ddd: 0, ind, ty: 4, nm, sr: 1, ...(parent ? { parent } : {}), ks: { o: st(100), r: st(0), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks }, ao: 0, shapes, ip: 0, op: 570, st: 0, bm: 0 });
    // Four answer buttons — lit in the accent color on the frame the hand presses, then back
    const pick = (y, onAt) => ({ ty: "gr", it: [
      { ty: "rc", d: 1, s: st([300, 64]), p: st([0, y]), r: st(32) },
      { ty: "st", c: st(line), o: st(100), w: st(3), lc: 2, lj: 2 },
      { ty: "fl", c: st(surf), o: st(100), r: 1 },
      { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) },
    ] });
    // Press-spot ripple — spreads from the fingertip (35 above the hand spot) for 15f then fades
    const tap = ([at, x, y]) => layer(10 + at, `tap${at}`, { p: st([x, y - 35, 0]), s: anim([[at - 1, [0, 0, 100]], [at, [20, 20, 100]], [at + 15, [100, 100, 100]]]), o: anim([[at - 1, 0], [at, 80], [at + 15, 0]]) },
      [{ ty: "gr", it: [{ ty: "el", d: 1, s: st([90, 90]), p: st([0, 0]) }, { ty: "fl", c: st(acc), o: st(45), r: 1 }, { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) }] }]);
    const data = {
      v: "5.13.0", fr: 30, ip: 0, op: 570, w: 960, h: 560, nm: "tsf", ddd: 0, assets: [],
      layers: [
        layer(1, "hand", { p: anim([[0, [674 - 1, 417 + 330]], [7, [674 - 1, 417 + 330]], [32, [674, 425]], [41, [674, 425]], [45, [670, 442]], [50, [674, 425]], [69, [674, 425]], [77, [674, 517]], [88, [674, 357]], [98, [674, 357]], [108, [674, 457]], [114, [674, 337]], [132, [674, 337]], [144, [612, 462]], [152, [612, 462]], [164, [539, 462]], [176, [539, 462]], [194, [742, 462]], [207, [742, 462]], [224, [742, 592]], [280, [742, 592]], [305, [573, 476]], [310, [568, 480]], [314, [573, 476]], [333, [573, 476]], [343, [589, 527]], [349, [585, 462]], [360, [585, 462]], [370, [585, 517]], [376, [584, 449]], [403, [584, 449]], [428, [758, 440]], [433, [752, 447]], [437, [758, 440]], [446, [758, 440]], [470, [575, 644]], [480, [575, 644]], [485, [570, 654]], [488, [575, 644]], [505, [575, 644]], [524, [575, 742]]]),
          r: anim([[40, 0], [44, -2], [49, 0], [68, 0], [76, -8], [87, 0], [97, 0], [107, -8], [113, 0], [131, 0], [143, -3], [206, -3], [215, 0]]) },
          [{ ty: "gr", it: [
            { ty: "rc", d: 1, s: st([56, 150]), p: st([0, 40]), r: st(28) },
            { ty: "rc", d: 1, s: st([150, 170]), p: st([40, 160]), r: st(60) },
            { ty: "st", c: st(ink), o: st(100), w: st(5), lc: 2, lj: 2 },
            { ty: "fl", c: st(raised), o: st(100), r: 1 },
            { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) },
          ] }]),
        ...[[45, 670, 442], [148, 612, 462], [310, 568, 480], [433, 752, 447], [485, 570, 654]].map(tap),
        layer(2, "phone", { p: anim([[0, [480, 300 + 516]], [27, [480, 300]], [518, [480, 300]], [552, [480, 300 + 516]]]) },
          [
            rect(300, 26, -20, -150, 6, dim),
            rect(240, 10, -50, -100, 5, line),
            pick(-30), pick(50), pick(130), pick(210),
            rect(420, 760, 0, 120, 48, surf, ink, 8),
          ]),
      ],
    };
    const anim2 = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: data });
    let playing = false, timer = 0;
    anim2.addEventListener("complete", () => { timer = setTimeout(() => { if (playing) anim2.goToAndPlay(0, true); }, 1000); });
    const play = () => { if (playing) return; playing = true; anim2.goToAndPlay(0, true); };
    const stop = () => { playing = false; clearTimeout(timer); anim2.goToAndStop(0, true); };
    if (reduce) { anim2.goToAndStop(60, true); return; }
    const trig = box.closest(".mm-tsf") || box;
    ScrollTrigger.create({ trigger: trig, start: "top bottom", end: "bottom top", onEnter: play, onLeave: stop, onEnterBack: play, onLeaveBack: stop });
  };
  document.querySelectorAll("[data-tsf-motion]").forEach((b) => window.mmTsfLottie(b));
})();
