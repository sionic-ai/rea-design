// Fills the header row, menu drawer, entry section and footer of every page in one place, and hooks up photo reveal, hero photo shrink and back to top.
// Original values: common.js — entrance at top bottom-=15% .on (once), menu toggled on and off at .3s ease, header photo from top center → during +40% inset 0 → 0 2.1% (scrub 1)
(() => {
  const page = document.body.dataset.page || "home";
  const arrow = '<svg viewBox="0 0 16 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"><path d="M4 2l8 7-8 7"/></svg>';
  const arrows = `<span class="w-arrows"><i>${arrow}</i><i>${arrow}</i><i>${arrow}</i></span>`;
  document.querySelectorAll("[data-arrows]").forEach((n) => { n.outerHTML = arrows; });
  // Drafting icon (original is an image file) — our own line drawing goes in the same spot
  const icons = {
    team: '<circle cx="12" cy="9" r="3.2"/><circle cx="5.5" cy="11" r="2.4"/><circle cx="18.5" cy="11" r="2.4"/><path d="M6.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M1.5 19c0-2.4 1.7-4.2 4-4.2M22.5 19c0-2.4-1.7-4.2-4-4.2"/>',
    talk: '<path d="M3 5h12v8H8l-4 3v-3H3z"/><path d="M17 9h4v8h-1v3l-4-3h-5v-2"/>',
    case: '<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V4h6v3M3 13h18"/>',
    flag: '<path d="M5 21V3M5 4h12l-3 4 3 4H5"/>',
    stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/><circle cx="17" cy="3" r="1.5"/>',
    pen: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
    down: '<path d="M5 9l7 7 7-7"/>',
    plane: '<path d="M2 13l20-8-6 16-4-7z"/><path d="M12 14l10-9"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    car: '<path d="M3 16v-4l2-5h14l2 5v4z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    family: '<circle cx="8" cy="6" r="2.5"/><circle cx="16" cy="6" r="2.5"/><circle cx="12" cy="13" r="2"/><path d="M4 21v-8c0-1.6 1.8-3 4-3s4 1.4 4 3M12 13c0-1.6 1.8-3 4-3s4 1.4 4 3v8M9 21v-3c0-1.4 1.3-2 3-2s3 .6 3 2v3"/>',
    house: '<path d="M3 11l9-7 9 7M5 9v11h14V9M10 20v-6h4v6"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((n) => {
    const d = icons[n.dataset.icon];
    if (d) n.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  });
  // In-page moves glide smoothly, offset by the header height (original scrollToElement — .2s after the click)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const id = a?.getAttribute("href");
    if (!id || id === "#") return;
    const to = document.querySelector(id);
    if (!to) return;
    e.preventDefault();
    const h = document.querySelector(".w-head")?.offsetHeight || 0;
    const extra = document.querySelector("[data-anchor-offset]")?.offsetHeight || 0;
    setTimeout(() => scrollTo({ top: to.getBoundingClientRect().top + scrollY - h - (innerWidth <= 896 ? extra : 0), behavior: "smooth" }), 200);
  });
  const mark = '<svg viewBox="0 0 40 34" fill="none" stroke-width="5" stroke-linecap="round" aria-hidden="true"><path d="M8 4l12 26" style="stroke:var(--kf-accent)"/><path d="M20 2v28" style="stroke:var(--site-green)"/><path d="M32 4L20 30" style="stroke:var(--site-blue)"/></svg>';
  const links = [
    ["#", "Company Thinking"], ["recruit.html", "Programs & Benefits", "recruit"], ["#", "Message from the CEO"],
    ["about.html", "The path so far", "about"], ["#", "About the department"], ["#", "Hiring Info"],
  ];
  const sitemap = `
    <div class="w-sitemap">
      <div class="w-sitemap__col">
        <div class="w-sitemap__block"><p class="w-sitemap__ttl">What kind of company is it?</p>
          <ul class="w-sitemap__list">
            <li><a class="w-sitemap__link" href="#">About the department</a>
              <div class="w-sitemap__child"><a href="#">Department 1</a><a href="#">Department 2</a><a href="#">Department 3</a><a href="#">Department 4</a></div></li>
            <li><a class="w-sitemap__link" href="#">Message from the CEO</a></li>
          </ul></div>
        <div class="w-sitemap__block"><p class="w-sitemap__ttl">Before you use…</p>
          <ul class="w-sitemap__list"><li><a class="w-sitemap__link" href="#">Company Thinking</a></li><li><a class="w-sitemap__link" href="about.html">The path so far</a></li></ul></div>
      </div>
      <div class="w-sitemap__col">
        <div class="w-sitemap__block"><p class="w-sitemap__ttl">Thorough Strategy</p>
          <ul class="w-sitemap__list"><li><a class="w-sitemap__link" href="works.html">Example of large type</a></li><li><a class="w-sitemap__link" href="recruit.html">Programs & Benefits</a></li></ul></div>
        <div class="w-sitemap__block"><p class="w-sitemap__ttl">Company highlights</p>
          <ul class="w-sitemap__list">
            <li><a class="w-sitemap__link" href="#">Staff talk</a>
              <div class="w-sitemap__child"><a href="#">TALK01 ”Your talk title in one line”</a><a href="#">TALK02 ”Your talk title in one line”</a></div></li>
            <li><a class="w-sitemap__link" href="#">Company in Numbers</a></li><li><a class="w-sitemap__link" href="#">Hiring Info</a></li><li><a class="w-sitemap__link" href="#">Entry</a></li>
          </ul></div>
      </div>
    </div>`;
  const cvs = `
    <a class="w-entry" href="#"><span class="w-entry__txt"><span class="w-entry__num w-en">30</span>Seconds entry here</span>${arrows}</a>
    <a class="w-ext" href="#" target="_blank" rel="noopener"><span class="w-ext__logo">Job Board <span class="w-en">2028</span></span>
      <span class="w-ext__icon"><svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2H2v13h13v-5M10 2h5v5M15 2L7 10"/></svg></span></a>`;
  const sublinks = '<div class="w-sublinks"><a href="#" target="_blank" rel="noopener">Company Website</a><a href="#" target="_blank" rel="noopener">Privacy policy</a></div>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "w-head";
    head.innerHTML = `
      <div class="w-head__wrap">
        <a class="w-logo" href="index.html" data-label="Logo · Mark + company name"><span class="w-logo__mark">${mark}<span class="w-logo__name">Company name Inc.</span></span><span class="w-logo__site w-en">RECRUITING SITE</span></a>
        <div class="w-head__body">
          <ul class="w-head__list">${links.map(([h, t, p]) => `<li><a href="${h}"${p === page ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul>
          <a class="w-head__entry" href="#">Entry</a>
          <button class="w-trigger" type="button" aria-label="Open Menu" aria-expanded="false">
            <svg class="w-trigger__open" viewBox="0 0 24 19" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 2h20M2 9.5h20M2 17h20"/></svg>
            <svg class="w-trigger__close" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 2l11.3 11.3M2 13.3L13.3 2"/></svg>
          </button>
        </div>
      </div>`;
  }
  const nav = document.querySelector('[data-slot="menu"]');
  if (nav) {
    nav.className = "w-nav";
    nav.innerHTML = `
      <div class="w-nav__bg" data-close></div>
      <div class="w-nav__panel">
        ${sitemap}
        <div class="w-nav__other">
          <p class="w-nav__entry-ttl"><span class="w-en">ENTRY</span><span class="w-ttl">If it were you, <span class="w-or">Company</span>Object marker<br>How will you use it?</span></p>
          <div class="w-nav__cvs">${cvs}</div>
          ${sublinks}
        </div>
      </div>`;
  }
  const cv = document.querySelector('[data-slot="cv"]');
  if (cv) {
    cv.className = "w-cv";
    cv.innerHTML = `
      <div class="w-cv__bg w-img"><div class="wf-img w-labeltop" data-label="Hero face close-up · factory yard on an overcast day · blurred background · landscape 16:7"></div></div>
      <div class="w-cv__txt">
        <h2 class="w-cv__ttl"><span class="w-en">ENTRY</span><span class="w-ttl w-dive">If it were you, <span class="w-or">Company</span>How will you use it?</span></h2>
        <div class="w-cv__cvs">${cvs}</div>
      </div>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "w-foot";
    foot.innerHTML = `
      <div class="w-foot__info">
        <a class="w-foot__logo" href="index.html">${mark}<b>Company name</b><span class="w-en">COMPANY NAME</span></a>
        <div class="w-foot__contact"><p>Postal code 000-0000<br>Your one-line address here<br>TEL 00-0000-0000<br>FAX 00-0000-0000</p></div>
      </div>
      <div class="w-foot__body">
        ${sitemap}
        <div class="w-foot__bottom">${sublinks}
          <div class="w-foot__copy"><small class="w-en">© Company Name Co.,Ltd</small>
            <button class="w-pagetop" type="button" aria-label="Back to top"><svg viewBox="0 0 30 18" fill="none" stroke="currentColor" stroke-width="3"><path d="M2 16L15 3l13 13"/></svg></button></div>
        </div>
      </div>`;
  }

  // Menu drawer — the button opens and closes it, the outside backdrop closes it. While open, it hides the header bar links and locks body scroll
  const trigger = document.querySelector(".w-trigger");
  const list = document.querySelector(".w-head__list");
  const setNav = (open) => {
    nav?.classList.toggle("is-show", open);
    trigger?.classList.toggle("is-active", open);
    trigger?.setAttribute("aria-expanded", String(open));
    list?.classList.toggle("is-hide", open);
    document.body.classList.toggle("is-nav-open", open);
  };
  trigger?.addEventListener("click", () => setNav(!nav.classList.contains("is-show")));
  nav?.querySelector("[data-close]")?.addEventListener("click", () => setNav(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  document.querySelector(".w-pagetop")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".w-img, .w-dive").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => el.classList.add("is-on") });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".w-img, .w-dive").forEach((el) => el.classList.add("is-on"));
  });
  // The subpage header photo narrows at the sides on PC only (original w > 896)
  mm.add("(min-width: 897px) and (prefers-reduced-motion: no-preference)", () => {
    const img = document.querySelector(".w-mvimg");
    if (img) gsap.to(img, { clipPath: "inset(0% 2.1% 0% 2.1%)", ease: "none", scrollTrigger: { trigger: img, start: "top center", end: "+=40%", scrub: 1 } });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
