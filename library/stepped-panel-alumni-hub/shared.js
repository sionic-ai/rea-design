// Header and footer are drawn once here so every page uses the same markup.
// The original is plain navigation without page-turn transitions or a loader, so no transition effect is added.
(() => {
  const arrow = '<i class="ic"></i>';
  const LOGO = `<svg viewBox="0 0 386 168" role="img" aria-label="Organization logo here">
    <text x="0" y="70" font-family="Montserrat, sans-serif" font-weight="800" font-size="84" letter-spacing="2" fill="currentColor">LOGO</text>
    <rect style="fill:var(--site-emblem)" x="258" y="10" width="20" height="20"/>
    <text x="0" y="160" font-family="Montserrat, sans-serif" font-weight="800" font-size="84" fill="currentColor">HUB</text>
    <text x="214" y="114" font-family="Noto Sans KR, sans-serif" font-weight="700" font-size="21" fill="currentColor">Here</text>
    <text x="214" y="139" font-family="Noto Sans KR, sans-serif" font-weight="700" font-size="21" fill="currentColor">Group name</text>
    <text x="214" y="164" font-family="Noto Sans KR, sans-serif" font-weight="700" font-size="21" fill="currentColor">Two lines</text>
  </svg>`;
  const SOCIAL = `<div class="social-wrap">
      <a href="#" aria-label="Photo SNS"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="3" width="26" height="26" rx="8"/><circle cx="16" cy="16" r="6"/><circle cx="23.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/></svg></a>
      <a href="#" aria-label="Messenger group chat"><svg viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor"/><path d="M16 8c-5.5 0-9.5 3.4-9.5 7.6 0 3.7 3.2 6.8 7.6 7.4l-.6 3.2 4.2-3.1c4.4-.6 7.8-3.7 7.8-7.5C25.5 11.4 21.5 8 16 8z" fill="var(--kf-bg)"/></svg></a>
    </div>`;
  const DEPTS = ["Common to departments", "Department Name 1", "Department Name 2", "Department Name 3", "Four department names, long", "Department Name 5", "Department Name 6", "Department Name 7"];

  const header = () => `
  <div class="header__wrap">
    <div class="header__logo"><a href="index.html" class="logo-mark">${LOGO}</a></div>
    <div class="header__content">
      <button class="header__hamburger" id="js-hamburger" type="button" aria-label="Menu">
        <svg class="plate" viewBox="0 0 59 47" preserveAspectRatio="none"><path style="fill:var(--kf-ink-soft)" d="M0 6h8V0h51v41h-9v6H0z"/></svg>
        <span class="burger-lines"></span>
      </button>
      <div class="header__menu" id="js-menu">
        <nav class="header__nav">
          <ul>
            <li class="js-hover">
              <div class="text-link"><a href="list.html">Menu 1 Activities and news</a><span class="pm show_sp"></span></div>
              <div class="sub-menu">
                <div class="title"><p>Menu 1 Activity</p><a class="link" href="list.html">ALL${arrow}</a></div>
                <ul class="grid-col-3">
                  <li class="show_sp"><a href="list.html">ALL${arrow}</a></li>
                  ${DEPTS.map((d) => `<li><a href="list.html">${d}${arrow}</a></li>`).join("")}
                </ul>
              </div>
            </li>
            <li class="js-hover">
              <div class="text-link">Menu 2 Magazine<span class="pm show_sp"></span></div>
              <div class="sub-menu">
                <div class="title"><p>Menu 2</p></div>
                <ul>
                  <li><a href="#">Submenu 1${arrow}</a></li>
                  <li><a href="#">Submenu 2${arrow}</a></li>
                  <li><a href="#">Submenu 3${arrow}</a></li>
                  <li><a href="#">Submenu 4${arrow}</a></li>
                </ul>
              </div>
            </li>
            <li><div class="text-link"><a href="award.html">Menu 3 Chairman’s Award${arrow.replace("ic", "ic show_sp")}</a></div></li>
            <li class="js-hover">
              <div class="text-link">Menu 4 Alumni<span class="pm show_sp"></span></div>
              <div class="sub-menu">
                <div class="title"><p>Menu 4</p></div>
                <ul>
                  <li><a href="about.html">About${arrow}</a></li>
                  <li><a href="#">Basic info${arrow}</a></li>
                  <li><a href="#">Newsletter ${arrow}</a></li>
                  <li><a href="#">Notice${arrow}</a></li>
                </ul>
              </div>
            </li>
            <li class="js-hover">
              <div class="text-link">Menu 5 Sign-up<span class="pm show_sp"></span></div>
              <div class="sub-menu">
                <div class="title"><p>Menu 5</p></div>
                <ul>
                  <li><a href="#">Application 1${arrow}</a></li>
                  <li><a href="#">Application 2${arrow}</a></li>
                </ul>
              </div>
            </li>
            <li class="search js-hover">
              <div class="text-link show_pc"><i class="ic icon-search"></i></div>
              <form class="header-search" action="#" onsubmit="return false">
                <p class="show_pc">Keyword Search</p>
                <div class="input"><i class="ic icon-search"></i><input type="text" placeholder="Your search term goes here"></div>
              </form>
            </li>
            <li class="show_pc"><a class="link" href="#">Community${arrow}</a></li>
          </ul>
          <div class="social show_sp">${SOCIAL}<a class="link-btn" href="#">Go to community</a></div>
        </nav>
      </div>
    </div>
  </div>`;

  const footer = () => `
  <div class="footer-wrap">
    <ul><li class="txt-main"><a href="list.html">Menu 1 Activities${arrow}</a>
      <ul class="sub">${DEPTS.map((d) => `<li><a href="list.html">${d}</a></li>`).join("")}</ul></li></ul>
    <ul><li class="txt-main"><span>Menu 2</span>
      <ul class="sub"><li><a href="#">Sub Menu 1</a></li><li><a href="#">Sub Menu 2</a></li><li><a href="#">Sub Menu 3</a></li><li><a href="#">Sub Menu 4</a></li></ul></li></ul>
    <ul><li class="txt-main"><span>Menu 4</span>
      <ul class="sub"><li><a href="about.html">About</a></li><li><a href="#">Basic information</a></li><li><a href="#">Newsletter</a></li><li><a href="#">Notice</a></li></ul></li></ul>
    <ul><li class="txt-main"><a href="award.html">Menu 3 Item ${arrow}</a></li></ul>
    <ul><li class="txt-main"><a href="#">Menu 5${arrow}</a>
      <ul class="sub"><li><a href="#">Application 1</a></li><li><a href="#">Application 2</a></li></ul></li></ul>
  </div>
  <div class="footer-action">
    <a class="footer-button" href="#">Go to community${arrow}</a>
    <p class="copyright">© ALUMNI ASSOCIATION OF<br>PLACEHOLDER UNIVERSITY<br>ALL RIGHTS RESERVED.</p>
  </div>
  <div class="footer-other">
    <div class="social">${SOCIAL}<a href="#">Privacy policy</a></div>
    <div class="link-other">
      <p>Related Links</p>
      <ul>
        <li><a href="#">Related organization name 1<i class="ic"></i></a></li>
        <li><a href="#">Related organization name 2 alumni association<i class="ic"></i></a></li>
        <li><a href="#">Related organization name 3 <br class="show_sp">Alumni nickname<i class="ic"></i></a></li>
      </ul>
    </div>
  </div>
  <p class="footer-notes">※ Put a one-line small credit for photo sources here. Reporting photos and photos from organization brochures and newsletters are used together.</p>`;

  const headerEl = document.querySelector('[data-slot="header"]');
  const footerEl = document.querySelector('[data-slot="footer"]');
  if (headerEl) { headerEl.id = "header"; headerEl.className = "header"; headerEl.innerHTML = header(); }
  if (footerEl) { footerEl.className = "footer"; footerEl.innerHTML = footer(); }

  const root = document.querySelector(".root");
  const hamburger = document.getElementById("js-hamburger");
  const menu = document.getElementById("js-menu");
  const isSP = () => innerWidth < 768;

  // Original: with even a slight scroll the header shrinks from 138px→81px (at 1440) and the logo scales by .665
  const sticky = () => headerEl && headerEl.classList.toggle("is-fixed", scrollY > 0 || document.body.dataset.lock === "1");
  addEventListener("scroll", sticky, { passive: true });
  sticky();

  // Hovering over the submenu·search cell, as in the original, puts active on the header·header inner·body cover — the body darkens, the header’s search icon turns gray
  const headContent = headerEl?.querySelector(".header__content");
  const setActive = (on) => [headerEl, headContent, root].forEach((el) => el?.classList.toggle("active", on));
  headerEl?.querySelectorAll(".js-hover").forEach((li) => {
    li.addEventListener("mouseenter", () => { if (!isSP()) setActive(true); });
    li.addEventListener("mouseleave", () => setActive(false));
  });

  // Phone menu: height grows from 0 to the screen height, linear, with a duration of 0.22 times the screen height (ms)
  let open = false, lockTop = 0;
  const lock = (on) => {
    if (on) {
      lockTop = scrollY;
      document.body.dataset.lock = "1";
      Object.assign(document.body.style, { position: "fixed", left: "0", top: `${-lockTop}px`, width: "100%" });
    } else {
      delete document.body.dataset.lock;
      document.body.removeAttribute("style");
      scrollTo(0, lockTop);
    }
  };
  hamburger?.addEventListener("click", () => {
    if (!isSP() || !menu) return;
    const t = 0.22 * innerHeight;
    open = !open;
    hamburger.classList.toggle("is-active", open);
    headerEl.classList.toggle("is-active", open);
    if (open) {
      lock(true);
      setTimeout(() => {
        menu.style.transition = `height ${t}ms linear`;
        menu.style.height = `${innerHeight - headerEl.offsetHeight}px`;
        menu.style.overflow = "auto";
      }, 100);
    } else {
      menu.style.transition = `height ${t}ms linear`;
      menu.style.height = "";
      menu.style.overflow = "";
      lock(false);
    }
    sticky();
  });

  // Cells in the phone menu are accordions toggled by tap (.3s ease)
  headerEl?.querySelectorAll("li.js-hover").forEach((li) => {
    const head = li.querySelector(".text-link");
    const sub = li.querySelector(".sub-menu");
    if (!head || !sub) return;
    head.addEventListener("click", (e) => {
      if (!isSP()) return;
      if (e.target.closest("a")) e.preventDefault();
      const on = li.classList.toggle("is-open");
      sub.style.height = on ? `${sub.scrollHeight}px` : "0px";
    });
  });
  addEventListener("resize", () => {
    if (!isSP()) headerEl?.querySelectorAll(".sub-menu").forEach((s) => (s.style.height = ""));
  });

  // Becomes .active when entering the strip excluding 18% at the top and bottom of the screen — the original IntersectionObserver value as is. data-delay is in seconds
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      setTimeout(() => el.classList.add("active"), reduce ? 0 : Number(el.dataset.delay || 0) * 1000);
    });
  }, { rootMargin: "-18% 0% -18% 0%" });
  window.kgObserve = (scope = document) => scope.querySelectorAll(".intersect-elem:not(.standby)").forEach((el) => {
    el.classList.add("standby");
    io.observe(el);
  });
  window.kgObserve();
})();
