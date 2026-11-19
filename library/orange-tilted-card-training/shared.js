// Header, phone menu, footer and character art are drawn here so every page uses the same ones.
// Original (Studio) re-renders the same header and footer wholesale on every page, but the copy edits them in one place so all five pages change together.
(() => {
  const page = document.body.dataset.page || "home";
  const arrow = (dir = "right") =>
    `<svg class="kd-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === "down" ? "M12 5v14M6 13l6 6 6-6" : dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"}"/></svg>`;
  window.kdArrow = arrow;

  // Character (round face in a water-drop hood) — the same drawing at the logo, band and page corners <use> Pull out and use with
  const sprite = `
<svg class="kd-sprite" aria-hidden="true">
  <symbol id="kd-mascot" viewBox="0 0 120 120">
    <path class="kd-art-accent kd-art-line" d="M60 8c14 10 40 22 44 52 3 26-17 46-44 46S13 86 16 60C19 34 44 22 60 8Z"/>
    <path class="kd-art-accent kd-art-line" d="M96 40c10-6 18-4 20 0-6 0-12 6-16 14"/>
    <ellipse class="kd-art-paper kd-art-line" cx="60" cy="72" rx="32" ry="26"/>
    <circle class="kd-art-ink-fill" cx="49" cy="70" r="3.4"/>
    <circle class="kd-art-ink-fill" cx="71" cy="70" r="3.4"/>
    <path class="kd-art-line" d="M55 80q5 5 10 0"/>
    <ellipse class="kd-art-cheek" cx="41" cy="79" rx="5" ry="3"/>
    <ellipse class="kd-art-cheek" cx="79" cy="79" rx="5" ry="3"/>
  </symbol>
  <symbol id="kd-buddy" viewBox="0 0 120 150">
    <path class="kd-art-accent kd-art-line" d="M40 96c-14 10-22 26-30 40 16-2 26-8 34-18Z"/>
    <path class="kd-art-paper kd-art-line" d="M38 92c-2 20 0 36 4 46h12l4-14 4 14h12c4-10 6-26 4-46Z"/>
    <circle class="kd-art-accent" cx="60" cy="108" r="9"/>
    <g class="kd-buddy__arm"><path class="kd-art-paper kd-art-line" d="M80 98c8-4 14-12 16-22"/><circle class="kd-art-paper kd-art-line" cx="97" cy="72" r="7"/></g>
    <path class="kd-art-accent kd-art-line" d="M60 6c14 10 38 20 42 46 3 24-17 42-42 42S15 76 18 52C21 28 46 18 60 6Z"/>
    <path class="kd-art-accent kd-art-line" d="M95 34c9-5 16-3 18 0-5 0-11 5-14 12"/>
    <ellipse class="kd-art-paper kd-art-line" cx="60" cy="62" rx="30" ry="24"/>
    <circle class="kd-art-ink-fill" cx="50" cy="60" r="3.2"/><circle class="kd-art-ink-fill" cx="70" cy="60" r="3.2"/>
    <path class="kd-art-accent" d="M54 68q6 8 12 0Z"/>
    <ellipse class="kd-art-cheek" cx="42" cy="69" rx="5" ry="3"/><ellipse class="kd-art-cheek" cx="78" cy="69" rx="5" ry="3"/>
  </symbol>
  <symbol id="kd-face" viewBox="0 0 56 56">
    <circle class="kd-art-tint" cx="28" cy="28" r="27"/>
    <path class="kd-art-paper kd-art-line" d="M14 56c1-10 6-15 14-15s13 5 14 15Z"/>
    <circle class="kd-art-paper kd-art-line" cx="28" cy="27" r="10"/>
    <path class="kd-art-ink-fill" d="M17 26c0-9 5-14 11-14s12 5 11 14c-3-5-8-7-11-7s-8 2-11 7Z"/>
    <circle class="kd-art-ink-fill" cx="24.5" cy="29" r="1.2"/><circle class="kd-art-ink-fill" cx="31.5" cy="29" r="1.2"/>
  </symbol>
</svg>`;

  const logo = (cls = "") =>
    `<a class="kd-logo ${cls}" href="index.html" aria-label="Your name first page here"><svg class="kd-logo__mark"><use href="#kd-mascot"/></svg><span class="kd-logo__name">Your name here</span></a>`;

  const programs = [
    ["service.html#program-1", "Program 1"],
    ["service.html#program-2", "Program 2"],
    ["service.html#program-3", "Program 3"],
  ];

  const header = `
<div class="kd-head">
  ${logo()}
  <nav class="kd-nav" aria-label="Main menu">
    <ul class="kd-nav__list">
      <li class="kd-nav__item"><a class="kd-nav__link" href="index.html#about"><span>ABOUT</span></a></li>
      <li class="kd-nav__item"><a class="kd-nav__link" href="index.html#future"><span>FUTURE</span></a></li>
      <li class="kd-nav__item has-drop"><a class="kd-nav__link" href="service.html"><span>PROGRAMS</span><i class="kd-dot">${arrow("down")}</i></a>
        <div class="kd-drop"><ul>${programs.map(([h, t]) => `<li><a class="kd-drop__link" href="${h}"><span>·${t}</span></a></li>`).join("")}</ul></div>
      </li>
      <li class="kd-nav__item"><a class="kd-nav__link" href="news.html"><span>NEWS</span></a></li>
    </ul>
    <a class="kd-btn kd-btn--head" href="index.html#contact"><span>Contact Us</span><i class="kd-dot">${arrow()}</i></a>
    <button class="kd-burger" type="button" aria-label="Open Menu" aria-haspopup="dialog"><i></i><i></i></button>
  </nav>
</div>`;

  const menu = `
<dialog class="kd-menu" data-slot="mobile-menu" aria-label="Menu">
  <div class="kd-menu__veil"></div>
  <div class="kd-menu__box">
    <button class="kd-menu__close" type="button" aria-label="Close Menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    <ul class="kd-menu__list">
      <li><a href="index.html">TOP</a></li>
      <li><a href="index.html#about">ABOUT</a></li>
      <li><a href="index.html#future">FUTURE</a></li>
      <li><a href="service.html">PROGRAMS</a><div class="kd-menu__sub">${programs.map(([h, t]) => `<a href="${h}">·${t}</a>`).join("")}</div></li>
      <li><a href="news.html">NEWS</a></li>
    </ul>
    <a class="kd-btn kd-btn--menu" href="index.html#contact"><span>Contact Us</span><i class="kd-dot">${arrow()}</i></a>
    <div class="kd-menu__band" data-fx="marquee" data-fx-marquee="rate: 20; pause: none"><span class="kd-band-unit kd-band-unit--sm"><svg class="kd-band-unit__mark"><use href="#kd-mascot"/></svg><span class="kd-band-unit__word">SAMPLE ACADEMY</span></span></div>
  </div>
</dialog>`;

  const footer = `
<div class="kd-foot__peek" data-fx="studio-appear" data-fx-studio-appear="look: grow; at: 100"><svg class="kd-bob" viewBox="0 0 120 150"><use href="#kd-buddy"/></svg></div>
<div class="kd-foot__top">
  ${logo("kd-logo--foot")}
  <ul class="kd-foot__nav">
    <li><a class="kd-fade-link" href="index.html#about">ABOUT</a></li>
    <li><a class="kd-fade-link" href="index.html#future">FUTURE</a></li>
    <li><a class="kd-fade-link" href="service.html">PROGRAMS</a><div class="kd-foot__sub">${programs.map(([h, t], i) => `<a class="kd-fade-link kd-foot__sub-${i + 1}" href="${h}">·${t}</a>`).join("")}</div></li>
    <li><a class="kd-fade-link" href="news.html">NEWS</a></li>
  </ul>
</div>
<p class="kd-foot__word">Your big pledge here, in one line.<br>Your second pledge, in one line.</p>
<div class="kd-foot__base">
  <div class="kd-foot__legal"><a class="kd-fade-link kd-legal-1" href="#">PRIVACY POLICY</a><a class="kd-fade-link kd-legal-2" href="#">Operating company</a></div>
  <small>©SAMPLE CO., LTD. All Rights Reserved.</small>
</div>`;

  document.body.insertAdjacentHTML("afterbegin", sprite);
  const head = document.querySelector('[data-slot="header"]');
  if (head) head.innerHTML = header;
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) foot.innerHTML = footer;
  document.body.insertAdjacentHTML("beforeend", menu);

  // Phone menu — the original STUDIO modal: the panel drops from 100px above and transparent over .4s cubic-bezier(.4,.4,0,1), and the backdrop darkens over the same length
  const dlg = document.querySelector(".kd-menu");
  const open = () => {
    dlg.classList.remove("is-closing");
    dlg.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add("is-ready")));
  };
  const close = () => {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    dlg.classList.remove("is-ready");
    dlg.classList.add("is-closing");
    setTimeout(() => { dlg.close(); dlg.classList.remove("is-closing"); }, 400);
  };
  document.querySelector(".kd-burger")?.addEventListener("click", open);
  dlg.querySelector(".kd-menu__close").addEventListener("click", close);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  dlg.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  // Show current page link
  document.querySelectorAll(".kd-nav__link, .kd-menu__list > li > a").forEach((a) => {
    const file = a.getAttribute("href").split("#")[0];
    if (file === `${page === "home" ? "index" : page}.html` && !a.getAttribute("href").includes("#")) a.setAttribute("aria-current", "page");
  });
})();
