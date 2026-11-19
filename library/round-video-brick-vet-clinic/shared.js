// Common to all pages: draws in the header, phone menu panel, booking notice panel, breadcrumb and footer, and moves with original values.
// Original values: header exit 1s power2.out (y −header height, transparent) · return .05s stagger over .8s power2.out — only when moving past the header height by more than 10px at once
// menu panel clip-path 1s power3.out (opens top to bottom) · items .04s apart after .1s, .8s back.out(1.7) · close .8s power3.inOut (retracts downward)
// · Same-page navigation 1.2s power2.out · The booking notice panel appears after scrolling down more than 10px and hides when the footer touches the bottom of the screen (.6s transition)
(() => {
  gsap.registerPlugin(ScrollToPlugin);
  const KW = (window.KW = {});
  const page = document.body.dataset.page || "home";
  const pcMode = () => innerWidth > 1199;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ic = {
    paw: '<svg viewBox="0 0 75 64" fill="currentColor" aria-hidden="true"><ellipse cx="37.5" cy="44" rx="17" ry="15"/><ellipse cx="14" cy="26" rx="7" ry="9"/><ellipse cx="27" cy="12" rx="7" ry="9"/><ellipse cx="48" cy="12" rx="7" ry="9"/><ellipse cx="61" cy="26" rx="7" ry="9"/><path d="M34.5 36h6v5.5H46v6h-5.5V53h-6v-5.5H29v-6h5.5Z" style="fill:var(--kf-bg)"/></svg>',
    arrow: '<svg viewBox="0 0 13 11" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5.5h12M7.5 1l4.5 4.5L7.5 10"/></svg>',
    cal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5 1.5v3m6-3v3"/></svg>',
    tel: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 1.5h2l1.2 3.2-1.4 1a7.5 7.5 0 0 0 3.5 3.5l1-1.4 3.2 1.2v2a1.5 1.5 0 0 1-1.5 1.5A11 11 0 0 1 2.5 3 1.5 1.5 0 0 1 4 1.5Z"/></svg>',
    insta: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.8"/><circle cx="11.6" cy="4.4" r=".6" fill="currentColor"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 2.5c-3.6 0-6 2.1-6 4.8 0 2.4 2 4.3 4.8 4.7L6.5 14l3-2c3-.4 4.5-2.4 4.5-4.7 0-2.7-2.4-4.8-6-4.8Z"/></svg>',
    clinic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2 14V6l6-4 6 4v8Z"/><path d="M8 7v4M6 9h4"/></svg>',
    // Solid icons filled with fill like the original — the header reservation circle and footer button change fill over .6s
    calF: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M4 1.5h1.5V3h5V1.5H12V3h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 3 3h1ZM3 6.5v6h10v-6Z"/></svg>',
    instaF: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M5 1.5h6A3.5 3.5 0 0 1 14.5 5v6a3.5 3.5 0 0 1-3.5 3.5H5A3.5 3.5 0 0 1 1.5 11V5A3.5 3.5 0 0 1 5 1.5Zm0 1.3A2.2 2.2 0 0 0 2.8 5v6A2.2 2.2 0 0 0 5 13.2h6a2.2 2.2 0 0 0 2.2-2.2V5A2.2 2.2 0 0 0 11 2.8Zm3 2.4a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Zm0 1.3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm3.6-2.6a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Z"/></svg>',
    chatF: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2C4.1 2 1.5 4.3 1.5 7.2c0 2.5 2 4.5 4.8 5L6 14.5l3.4-2.2c3-.5 5.1-2.5 5.1-5.1C14.5 4.3 11.9 2 8 2Z"/></svg>',
    down: '<svg viewBox="0 0 10 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M5 0v13M1 9l4 4 4-4"/></svg>',
  };
  KW.ic = ic;
  const btn = (label, href = "#", white = false) =>
    `<a class="kw-btn${white ? " kw-btn--white" : ""}" href="${href}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31.5"/><circle cx="32" cy="32" r="31.5"/></svg><i>${ic.arrow}</i><span>${label}</span></a>`;
  KW.btn = btn;
  document.querySelectorAll("[data-kw-btn]").forEach((el) => (el.outerHTML = btn(el.dataset.kwBtn, el.getAttribute("href") || "#", el.hasAttribute("data-white"))));
  document.querySelectorAll("[data-ic]").forEach((el) => el.insertAdjacentHTML("afterbegin", ic[el.dataset.ic] || ""));

  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const care = ["Dental clinic", "Dermatology", "Gastroenterology", "Oncology Dept", "General Care", "Online consultation"];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "kw-head";
    head.innerHTML = `
      <div class="kw-head__logo" data-head-part><a class="kw-logo" href="index.html">${ic.paw}<b>WORDMARK</b><small>Your hospital name here</small></a></div>
      <button class="kw-toggle" type="button" aria-label="Open Menu" data-head-part><span></span><span></span><span></span></button>
      <div class="kw-head__help" data-head-part><ul><li><a href="#" aria-label="Book now">${ic.calF}</a><span>Reservation</span></li></ul></div>
      <nav class="kw-navi" data-slot="menu">
        <div class="kw-navi__layer"></div>
        <div class="kw-navi__outer">
          <div class="kw-navi__main" data-navi-main>
            <ul class="kw-navi__list">
              <li class="kw-navi__item"><a href="about.html"${cur("about")}><span>Our Heart</span></a></li>
              <li class="kw-navi__item"><a href="service.html"${cur("service")}><span>Treatment Guide</span><i></i></a>
                <ul class="kw-navi__sub">${care.map((t, i) => `<li><a href="service.html">${t}<span class="pic"><span class="wf-img" data-label="${["Puppy mouth exam", "Skin exam", "Endoscopy exam", "Large Dog Checkup", "Reception desk", "Laptop consultation"][i]} · Square"></span></span></a></li>`).join("")}</ul></li>
              <li class="kw-navi__item is-clinic"><a href="#"><span>About the Hospital</span><i></i></a>
                <ul class="kw-navi__sub"><li><a href="index.html#clinic">WORDMARK<br>Main institute<span class="pic"><span class="wf-img" data-label="Main branch reception desk · Orange wall · Square"></span></span></a></li><li><a href="index.html#clinic">WORDMARK<br>Branch campus<span class="pic"><span class="wf-img" data-label="Branch exterior · tree · square"></span></span></a></li></ul></li>
              <li class="kw-navi__item"><a href="works.html"${cur("works")}><span>Case study</span></a></li>
              <li class="kw-navi__item"><a href="news.html"${cur("news")}><span>Medical Records</span></a></li>
              <li class="kw-navi__item"><a href="index.html#access" data-scroll><span>Directions</span></a></li>
              <li class="kw-navi__item"><a href="#"><span>Hiring Info</span></a></li>
              <li class="kw-navi__item"><a href="#"><span>To the veterinarian</span></a></li>
              <li class="kw-navi__item"><a href="product.html"${cur("product")}><span>Online shop</span></a></li>
            </ul>
          </div>
          <div class="kw-navi__help" data-navi-help><p>FOLLOW US</p><ul><li><a href="#" aria-label="Photo account">${ic.insta}</a></li><li><a href="#" aria-label="Messenger">${ic.chat}</a></li></ul></div>
          <div class="kw-navi__btns" data-navi-help><a href="#">${ic.cal}Book now</a></div>
        </div>
      </nav>`;
  }

  // Booking info panel at bottom right
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="kw-follow" data-slot="follow-cta"><a class="kw-follow__cta" href="#"><span class="kw-follow__icon">${ic.cal}</span><span class="kw-follow__text"><small>Your booking info line</small><b>View Booking Steps</b></span></a><a class="kw-follow__tel" href="#">${ic.tel}<span>Phone Reservation</span><b>00-0000-0000</b></a></div>`
  );

  const crumbs = document.querySelector('[data-slot="breadcrumbs"]');
  if (crumbs) {
    const trail = (crumbs.dataset.trail || "").split("|").filter(Boolean);
    crumbs.className = "kw-crumbs";
    crumbs.innerHTML = `<ol><li><a href="index.html">WORDMARK Animal Hospital</a></li>${trail.map((t) => `<li>${t}</li>`).join("")}</ol>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "kw-foot";
    foot.id = "footer";
    foot.innerHTML = `<div class="kw-foot__inner">
      <p class="kw-foot__lead">Your one-line sentence describing the hospital here,<br>Second line.</p>
      <div class="kw-foot__icon">${ic.paw}</div>
      <div class="kw-foot__body">
        <div class="kw-foot__navi">
          <ul><li><a href="about.html">Our Heart</a></li><li><a href="service.html">Treatment Guide</a></li><li><a href="index.html#clinic">About the Hospital</a></li><li><a href="works.html">Case study</a></li><li><a href="news.html">Medical Records</a></li><li><a href="#">Hiring Info</a></li><li><a href="product.html">Online shop</a></li></ul>
          <ul>${care.map((t) => `<li><a href="service.html">${t}</a></li>`).join("")}</ul>
          <ul class="is-small"><li><a href="#">WORDMARK Animal hospital main branch</a></li><li><a href="#">WORDMARK Animal hospital branch</a></li></ul>
        </div>
        <div class="kw-foot__help"><a href="#">Privacy policy</a><div class="kw-foot__btns"><a href="#" aria-label="Photo account">${ic.instaF}</a><a href="#" aria-label="Messenger">${ic.chatF}</a><a class="is-cal" href="#">${ic.calF}<span>Book now</span></a></div></div>
      </div>
      <p class="kw-foot__copy">Copyright © 0000 WORDMARK All rights reserved.</p>
    </div>`;
  }

  // ───── Header hides and returns ─────
  const H = document.querySelector(".kw-head");
  const navi = document.querySelector(".kw-navi");
  const parts = H ? [H.querySelector(".kw-head__logo"), H.querySelector("[data-navi-main]"), H.querySelector(".kw-toggle"), H.querySelector(".kw-head__help")] : [];
  const hh = () => (H ? H.querySelector(".kw-head__logo").offsetHeight : 97);
  let old = scrollY;
  const slideIn = () => gsap.to(parts, { stagger: 0.05, duration: 0.8, ease: "power2.out", opacity: 1, y: 0 });
  const slideOut = () => gsap.to(parts, { duration: 1, ease: "power2.out", opacity: 0, y: -hh() });
  const footer = document.querySelector("#footer");
  const follow = document.querySelector(".kw-follow");
  const onScroll = () => {
    const y = scrollY, d = y - old;
    if (H) {
      if (pcMode()) H.classList.toggle("is-hidden", y > 0);
      if (!navi.classList.contains("is-active") && y > hh()) {
        if (y > old && d > 10) slideOut();
        else if (y < old && d < -10) slideIn();
      }
      if (y <= 0) H.classList.remove("is-view");
      else if (y < old && d < -10) H.classList.add("is-view");
    }
    if (follow && footer) follow.classList.toggle("is-active", !(y < 10 || y + innerHeight > footer.getBoundingClientRect().top + y));
    old = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  // ───── Phone menu panel ─────
  const toggle = H && H.querySelector(".kw-toggle");
  const layer = navi && navi.querySelector(".kw-navi__layer");
  const links = navi ? [...navi.querySelectorAll("[data-navi-main] a")] : [];
  const help = navi ? [...navi.querySelectorAll("[data-navi-help]")] : [];
  let busy = false;
  const open = () => {
    toggle.classList.add("is-active");
    navi.classList.add("is-active");
    gsap.fromTo(layer, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }, { duration: 1, ease: "power3.out", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", onComplete: () => (busy = false) });
    gsap.fromTo(links, { y: 10, opacity: 0 }, { delay: 0.1, stagger: 0.04, duration: 0.8, ease: "back.out(1.7)", y: 0, opacity: 1 });
    gsap.fromTo(help, { y: 10, opacity: 0 }, { delay: 0.4, duration: 0.8, ease: "back.out(1.7)", y: 0, opacity: 1 });
  };
  const close = () => {
    toggle.classList.remove("is-active");
    gsap.to(layer, { duration: 0.8, ease: "power3.inOut", clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", onComplete: () => { navi.classList.remove("is-active"); busy = false; } });
    gsap.to(links, { duration: 0.4, ease: "power2.out", y: -10, opacity: 0 });
    gsap.to(help, { duration: 0.6, ease: "power2.out", y: -10, opacity: 0 });
  };
  toggle && toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    navi.classList.contains("is-active") ? close() : open();
  });
  let mode = pcMode();
  addEventListener("resize", () => {
    if (mode === pcMode()) return;
    mode = pcMode();
    navi.classList.remove("is-active");
    toggle.classList.remove("is-active");
    gsap.set(layer, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });
    gsap.set([...links, ...help], { y: 0, opacity: 1 });
  });

  // ───── Same-page navigation — 1.2s power2.out ─────
  document.querySelectorAll("[data-scroll]").forEach((a) =>
    a.addEventListener("click", (e) => {
      const hash = (a.getAttribute("href") || "").split("#")[1];
      const t = hash && document.getElementById(hash);
      if (!t) return;
      e.preventDefault();
      if (!pcMode() && navi.classList.contains("is-active")) close();
      gsap.to(window, { duration: reduce ? 0 : 1.2, ease: "power2.out", scrollTo: { y: t.getBoundingClientRect().top + scrollY, autoKill: false } });
    })
  );

  // The original opens after images have fully loaded (imagesLoaded), so announce ‹opened› after load
  addEventListener("load", () => {
    onScroll();
    document.dispatchEvent(new CustomEvent("kw:opened"));
  });
})();
