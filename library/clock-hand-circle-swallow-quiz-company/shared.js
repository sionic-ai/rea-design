/* Shared by the whole site — wordmark (needle circle), header MENU and menu panel, quiz banner, QUIZ tab, quiz window, footer, fixed table of contents on subpages. 
   Values from the original common.js: menu panel clip .2s, banner appears 1s after the SERVICE section reaches 50% of the screen, hides before Footer −20%, closing it goes to the QUIZ tab */
(() => {
  const PALETTE = "var(--site-yellow), var(--site-green), var(--site-red), var(--site-blue), var(--site-orange), var(--site-blue-light), var(--site-pink), var(--site-lemon), var(--site-green-light)";
  window.sqPalette = PALETTE;

  // Wordmark — English placeholder letters L·O·G·I·C stand in for the original S·Q·U·I·Z. O is a needle circle, the rest are bold geometric shapes (drawn paths like the original, so no waiting for web fonts).
  const logo = ({ cls = "", fx = true, label = "Brand English Wordmark" } = {}) => `
<svg class="sq-logo ${cls}" viewBox="0 0 1140 308" overflow="visible" role="img" aria-label="${label}" data-label="${label} — The second character is the circle the hand turns around"${fx ? ` data-fx="tick-hand-logo" data-fx-tick-hand-logo="colors: ${PALETTE}"` : ""}>
  <g class="sq-logo__l"><path class="sq-logo__glyph" d="M0 26h56v200h124v56H0Z"/></g>
  <g class="sq-logo__rest">
    <path class="sq-logo__arc" d="M734.7 83.3A100 100 0 1 0 764 154H676"/>
    <path class="sq-logo__glyph" d="M812 26h56v256h-56Z"/>
    <path class="sq-logo__arc" d="M1082.7 83.3A100 100 0 1 0 1082.7 224.7"/>
    <g class="sq-logo__q">
      <circle data-fx-part="disc" cx="354" cy="154" r="154"/>
      <g class="sq-logo__hand" data-fx-part="hand"><rect x="332" y="-34" width="44" height="150" rx="10"/></g>
    </g>
  </g>
</svg>`;
  window.sqLogo = logo;
  const icon = (fx = true) => `<svg viewBox="0 0 100 100" overflow="visible" aria-hidden="true"${fx ? ` data-fx="tick-hand-logo" data-fx-tick-hand-logo="colors: ${PALETTE}"` : ""}><circle data-fx-part="disc" cx="50" cy="50" r="50"/><g data-fx-part="hand"><rect x="43" y="-11" width="14" height="49" rx="3.5"/></g></svg>`;
  window.sqIcon = icon;
  document.querySelectorAll("[data-quiz-icon]").forEach((el) => { el.innerHTML = icon(); });
  const arrow = '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M2.4 8.6 1.4 7.6 5.9 3.1H2.8V1.7h5.5v5.5H6.9V4.1Z"/></svg>';
  window.sqArrow = arrow;

  const MENU = [["index.html", "HOME"], ["index.html#service", "SERVICE"], ["about.html", "COMPANY"], ["news.html", "NEWS"], ["recruit.html", "RECRUIT"], ["#contact", "CONTACT"]];
  const here = document.body.dataset.page;
  const cur = { index: "HOME", about: "COMPANY", news: "NEWS", recruit: "RECRUIT" }[here];

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.className = "sq-header";
    header.innerHTML = `
<div class="sq-header__sticky">
  <p class="sq-header__logo"><a href="index.html" aria-label="Go home">${logo({ label: "Small wordmark" })}</a></p>
  <button type="button" class="sq-menu" aria-controls="sq-navi" aria-expanded="false">MENU</button>
</div>
<dialog id="sq-navi" class="sq-navi" aria-label="Menu">
  <button type="button" class="sq-menu" data-close aria-expanded="true">CLOSE</button>
  <nav class="sq-navi__panel"><ul class="sq-navi__list">${MENU.map(([h, t]) => `<li><a class="sq-navi__link" href="${h}"${t === cur ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul></nav>
</dialog>`;
  }

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.className = "sq-footer";
    footer.id = "contact";
    footer.innerHTML = `
<div class="sq-footer__in">
  <ul class="sq-footer__nav">${MENU.map(([h, t]) => `<li><a class="sq-footer__link" href="${h}">${t}</a></li>`).join("")}</ul>
  <div class="sq-footer__info">
    <ul class="sq-footer__sub"><li><a href="#contact">PRIVACY POLICY</a></li></ul>
    <p class="sq-footer__logo"><a href="index.html" aria-label="Go home">${logo({ label: "Large Wordmark" })}</a></p>
  </div>
</div>`;
  }

  // Quiz banner, tab, window
  const qmarks = '<div class="sq-qmarks"><span>?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?\u2003?</span></div>';
  (document.querySelector(".sq-page") || document.body).insertAdjacentHTML("beforeend", `
<div class="sq-quiz" data-slot="quiz-banner"><div class="sq-quiz__sticky">
  <div class="sq-quiz-banner" aria-hidden="true" inert>
    <div class="sq-quiz-banner__bg" aria-hidden="true">${qmarks.repeat(5)}</div>
    <p class="sq-quiz-banner__label">This mark appears!</p>
    <span class="sq-quiz-banner__logo">${icon()}</span>
    <p class="sq-quiz-banner__txt">Solve the quiz hidden on the site,<br>Get to know the company better!</p>
    <button type="button" class="sq-quiz-banner__btn"><i class="sq-quiz-banner__x" aria-hidden="true"></i>CLOSE</button>
  </div>
  <button type="button" class="sq-quiz-tab" aria-hidden="true" inert data-quiz-open><span class="sq-quiz-tab__logo">${icon()}</span><span class="sq-quiz-tab__txt">QUIZ</span></button>
</div></div>
<dialog class="sq-qm" aria-label="Quiz" data-slot="quiz-modal">
  <div class="sq-qm__panel">
    <div class="sq-qm__bg" aria-hidden="true" style="opacity:.1">${qmarks.repeat(7)}</div>
    <div class="sq-qm__body">
      <p class="sq-qm__no">QUESTION 01</p>
      <p class="sq-qm__q">Your company-related content here<br>Enter the quiz question here?</p>
      <ul class="sq-qm__choices">
        <li><button type="button" class="sq-qm__choice" aria-pressed="false">Option 1</button></li>
        <li><button type="button" class="sq-qm__choice" aria-pressed="false" data-correct>Option 2</button></li>
        <li><button type="button" class="sq-qm__choice" aria-pressed="false">Option 3</button></li>
      </ul>
      <p class="sq-qm__result" aria-live="polite"></p>
    </div>
    <button type="button" class="sq-qm__close" aria-label="Close">CLOSE</button>
  </div>
</dialog>`);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu panel — original xa(): at the moment of pressing, both buttons turn yellow (is-transitioning), and on open, two frames later, is-open (clip from pill to panel),
  // 100ms after the panel transition ends, yellow is released and only the button under the cursor gets yellow (is-hover-proxy). Closing follows the same order, and scrolling closes it.
  const navi = document.getElementById("sq-navi");
  const openBtn = document.querySelector(".sq-header__sticky .sq-menu");
  if (navi && openBtn) {
    const closeBtn = navi.querySelector("[data-close]");
    let busy = false, px = -1, py = -1;
    const trans = (on) => [openBtn, closeBtn].forEach((b) => b.classList.toggle("is-transitioning", on));
    const proxy = () => {
      [openBtn, closeBtn].forEach((b) => b.classList.remove("is-hover-proxy"));
      if (px < 0) return;
      const btn = navi.open ? closeBtn : openBtn;
      const hit = document.elementFromPoint(px, py);
      if (hit && hit.closest("button") === btn) btn.classList.add("is-hover-proxy");
    };
    const settle = () => new Promise((res) => {
      if (reduce) return res();
      let done = false;
      const fin = () => { if (done) return; done = true; navi.removeEventListener("transitionend", on); setTimeout(res, 100); };
      const on = (e) => { if (e.target === navi) fin(); };
      navi.addEventListener("transitionend", on);
      setTimeout(fin, 500);
    });
    const open = async () => {
      if (busy || navi.open) return;
      busy = true;
      navi.showModal();
      openBtn.setAttribute("aria-expanded", "true");
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      navi.classList.add("is-open");
      await settle();
      busy = false;
      trans(false);
      requestAnimationFrame(proxy);
    };
    const close = async () => {
      if (busy || !navi.open) return;
      busy = true;
      navi.classList.remove("is-open");
      openBtn.setAttribute("aria-expanded", "false");
      await settle();
      navi.close();
      busy = false;
      trans(false);
      requestAnimationFrame(proxy);
    };
    addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; proxy(); }, { passive: true });
    [openBtn, closeBtn].forEach((b) => b.addEventListener("pointerdown", (e) => { px = e.clientX; py = e.clientY; trans(true); }));
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    navi.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    navi.addEventListener("click", (e) => { if (e.target === navi) close(); });
    navi.querySelectorAll(".sq-navi__link").forEach((a) => a.addEventListener("click", close));
    addEventListener("scroll", () => { if (navi.open) close(); }, { passive: true });
  }

  // Quiz window
  const qm = document.querySelector(".sq-qm");
  let opener = null;
  const openQuiz = (btn) => {
    opener = btn;
    qm.querySelectorAll(".sq-qm__choice").forEach((c) => c.setAttribute("aria-pressed", "false"));
    qm.querySelector(".sq-qm__result").textContent = "";
    qm.showModal();
    // Original helpers d(): blocks body scroll and leaves room for the scrollbar (scrollbar-gutter: stable)
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollbarGutter = "stable";
    requestAnimationFrame(() => requestAnimationFrame(() => qm.classList.add("is-open")));
  };
  const closeQuiz = () => {
    qm.classList.remove("is-open");
    setTimeout(() => { if (qm.open) qm.close(); document.body.style.overflow = ""; document.documentElement.style.scrollbarGutter = ""; }, reduce ? 0 : 300);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quiz-open], .sq-quiz-btn");
    if (b) openQuiz(b);
  });
  qm.querySelector(".sq-qm__close").addEventListener("click", closeQuiz);
  qm.addEventListener("cancel", (e) => { e.preventDefault(); closeQuiz(); });
  qm.querySelectorAll(".sq-qm__choice").forEach((c) => c.addEventListener("click", () => {
    qm.querySelectorAll(".sq-qm__choice").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    qm.querySelector(".sq-qm__result").textContent = c.hasAttribute("data-correct") ? "Correct!" : "Too bad, please choose again";
    if (c.hasAttribute("data-correct") && opener && opener.classList.contains("sq-quiz-btn")) opener.dataset.quizAnswered = "true";
  }));

  // Banner — original Nh(): if a SERVICE section exists, it shows when that section’s top crosses 50% of the screen, otherwise right after 1s. It hides when the footer top reaches −20% below the screen bottom
  const banner = document.querySelector(".sq-quiz-banner");
  const tab = document.querySelector(".sq-quiz-tab");
  const KEY = "sq-quiz-dismissed";
  const dismissed = () => { try { return localStorage.getItem(KEY) === "true"; } catch { return false; } };
  let timer = null, atFoot = false;
  const set = (el, on) => { el.setAttribute("aria-hidden", String(!on)); el.inert = !on; };
  const hideAll = () => { clearTimeout(timer); set(banner, false); set(tab, false); };
  const show = (now) => {
    clearTimeout(timer);
    if (atFoot) return hideAll();
    if (dismissed()) { set(banner, false); set(tab, true); return; }
    set(tab, false);
    if (now) set(banner, true);
    else timer = setTimeout(() => set(banner, true), 1000);
  };
  // Close — original Fh(): hide the banner, then 100ms after that transition ends, two frames later the QUIZ tab
  banner.querySelector(".sq-quiz-banner__btn").addEventListener("click", () => {
    try { localStorage.setItem(KEY, "true"); } catch {}
    if (banner.contains(document.activeElement)) document.activeElement.blur();
    set(banner, false);
    let done = false;
    const fin = () => {
      if (done) return;
      done = true;
      banner.removeEventListener("transitionend", on);
      setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => { if (!atFoot) set(tab, true); })), reduce ? 0 : 100);
    };
    const on = (e) => { if (e.target === banner) fin(); };
    banner.addEventListener("transitionend", on);
    setTimeout(fin, reduce ? 0 : 650);
  });

  const start = () => {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const service = document.querySelector("#service");
    const foot = document.querySelector(".sq-footer");
    if (service && window.ScrollTrigger) {
      hideAll();
      ScrollTrigger.create({ trigger: service, start: "top 50%", onEnter: () => show(true), onEnterBack: () => show(true), onLeaveBack: hideAll });
    } else show(false);
    if (foot && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: foot, start: "-20% 100%", onEnter: () => { atFoot = true; hideAll(); }, onLeaveBack: () => { atFoot = false; show(true); } });
    }

    // Pinned table of contents — the current section is active (triangle −90°), past sections are after (−180°)
    const links = [...document.querySelectorAll('.sq-localnav__link[data-link-type="anchor"]')];
    if (links.length && window.ScrollTrigger) {
      links.forEach((a) => {
        const sec = document.querySelector(a.getAttribute("href"));
        if (!sec) return;
        ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%",
          onToggle: (st) => { a.dataset.scrollState = st.isActive ? "active" : st.progress >= 1 ? "after" : "before"; } });
      });
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
