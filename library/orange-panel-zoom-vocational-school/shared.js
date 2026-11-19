// Plugs the header · drawer · CTA · footer into every page and, as in the original, attaches state classes (is-nav·is-orange·is-hide·is-fix) to html so CSS transitions do the moving
(() => {
  const html = document.documentElement;
  const page = document.body.dataset.page;
  const ARW = '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M0.6 4.1h6.2L4.4 1.7 5.6 0.5 10 5 5.6 9.5 4.4 8.3 6.8 5.9H0.6Z"/></svg>';
  const arrow = `<span class="ma-arrow">${ARW}${ARW}</span>`;
  window.maArrow = arrow;
  const MARK = '<svg class="ma-logo__mark" viewBox="0 0 26 24" fill="currentColor" aria-hidden="true"><path d="M0 24V9l5-3v18Zm7 0V5l5-3v22Zm7 0V2l5-2v24Zm7 0V3l5 3v18Z"/></svg>';
  const CAL = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M1 3h10v8H1Zm2-2h1v2H3Zm5 0h1v2H8Z"/></svg>';
  const DOC = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2 1h6l2 2v8H2Z"/></svg>';
  const pill = (cls, href, icon, label) => `<a class="ma-pill ${cls}" href="${href}"><span class="ma-pill__icon">${icon}</span><span class="ma-pill__labels"><span>${label}</span><span>${label}</span></span></a>`;

  const head = document.querySelector('[data-slot="header"]');
  // In the original order: header at the start of the document, then the cover, drawer (tab hangs at the drawer’s bottom end) and fixed button at the end of the document after the footer.
  if (head) {
    head.outerHTML = `<header class="ma-header" data-slot="header"><a class="ma-logo" href="index.html" data-label="School logo · Symbol + school name">${MARK}<span class="ma-logo__text">School Name (school name)</span></a></header>`;
    document.body.insertAdjacentHTML("beforeend", `<div class="ma-overlay"></div>
      <div class="ma-drawer" data-slot="drawer"><div class="ma-drawer__inner"><div class="ma-drawer__body">
        <nav class="ma-drawer__main"><ul>
          <li><a href="index.html">Home ${arrow}</a></li><li><a href="news.html">News ${arrow}</a></li>
          <li data-acdn><button type="button">School Guide <span class="ma-plus"></span></button><div class="ma-acdn"><div><a href="about.html">About the School</a><a href="service.html">School Features</a></div></div></li>
          <li data-acdn><button type="button">About the department <span class="ma-plus"></span></button><div class="ma-acdn"><div><a href="about.html">Department One</a><a href="about.html">Two departments</a><a href="about.html">Three departments</a></div></div></li>
          <li><a href="works.html">Student work ${arrow}</a></li></ul></nav>
        <div class="ma-drawer__cta"><a class="is-oc" href="service.html">Open Campus</a><a class="is-app" href="recruit.html">Brochure Request</a><a class="is-pin" href="about.html">Getting here</a></div>
        <nav class="ma-drawer__visitor"><p class="ma-drawer__title">Guide by Visitor</p><ul><li><a href="about.html">For high school students</a></li><li><a href="about.html">To the guardian</a></li><li><a href="about.html">Working adults · Re-enrollment</a></li><li><a href="recruit.html">To the hiring manager</a></li></ul></nav>
        <div class="ma-drawer__box"><p>Your contact guide in one line here</p><p class="ma-tel">Tel.000-000-0000</p><a class="ma-btn is-solid" href="recruit.html" data-ma-hover="slot"><span class="ma-btn__labels"><span>Contact via Web</span><span>Contact Us</span></span>${arrow}</a></div></div>
        <button class="ma-tab" type="button" aria-label="Menu" aria-expanded="false" data-slot="menu-tab"><svg class="ma-tab__shape" viewBox="0 0 80 36" fill="currentColor" aria-hidden="true"><path d="M0 0h80c-6 0-8 4-8 8v20c0 4-4 8-8 8H16c-4 0-8-4-8-8V8c0-4-2-8-8-8Z"/></svg><span class="ma-tab__bar"></span><svg class="ma-tab__cross" viewBox="0 0 18 18" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m2 2 14 14M16 2 2 16"/></svg></button>
      </div></div>
      <nav class="ma-fix" data-slot="fix-nav">${pill("is-oc", "service.html", CAL, "Open Campus")}${pill("is-app", "recruit.html", DOC, "Brochure Request")}</nav>`);
  }

  const cta = document.querySelector('[data-slot="cta"]');
  if (cta) {
    cta.classList.add("ma-cta");
    cta.innerHTML = `<div class="ma-container ma-cta__grid">
      <a class="ma-cta__card" href="service.html" data-ma-hover="color"><p class="ma-cta__lead">Let’s go to Open Campus</p><h2><span data-ma-split>Open Campus</span> ${arrow}</h2><p>Your text inviting people to an open campus here<br>Roughly three lines go here.</p><span class="ma-cta__mat"><span class="ma-ph wf-img" data-label="School building illustration · line art with light purple · landscape 4:3"></span></span></a>
      <a class="ma-cta__card" href="recruit.html" data-ma-hover="color"><p class="ma-cta__lead">We’ll send materials for free</p><h2><span data-ma-split>School Guide</span> ${arrow}</h2><p>Your text recommending the school brochure here<br>Add about two lines.</p><span class="ma-cta__mat"><span class="ma-ph wf-img" data-label="Open school guide booklet · from above · landscape 4:3"></span></span></a>
    </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ma-footer");
    const circ = `<span class="ma-circle">${ARW}</span>`;
    const acdn = (t, items) => `<li data-acdn><button type="button">${t} <span class="ma-plus"></span></button><div class="ma-acdn"><div>${items.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div></div></li>`;
    foot.innerHTML = `<div class="ma-footer__top">
        <nav class="ma-footer__nav"><ul><li><a href="index.html">Home ${circ}</a></li><li><a href="news.html">News ${circ}</a></li><li><a href="about.html">Getting here ${circ}</a></li><li><a href="service.html">Open campus ${circ}</a></li><li><a href="works.html">Student work ${circ}</a></li><li><a href="about.html">Disclosure ${circ}</a></li></ul></nav>
        <nav class="ma-footer__nav"><ul>${acdn("School Guide", [["about.html", "About the School"], ["service.html", "School Features"], ["about.html", "Instructor Intro"], ["about.html", "Industry-academia partnership"], ["about.html", "Consultation Advisor"], ["about.html", "Admissions Guide"], ["about.html", "Recommended Enrollment"], ["about.html", "Tuition Guide"], ["about.html", "Tuition Aid"], ["about.html", "About the Facility"], ["about.html", "Information disclosure"]])}${acdn("About the department", [["about.html", "Department One"], ["about.html", "Two departments"], ["about.html", "Three departments"]])}</ul></nav>
        <nav class="ma-footer__nav"><ul>${acdn("Employment", [["service.html", "Job Placement Support"], ["recruit.html", "To the hiring manager"]])}${acdn("By Visitor", [["about.html", "For high school students"], ["about.html", "To the guardian"], ["recruit.html", "To the hiring manager"]])}</ul></nav>
        <div class="ma-footer__school"><p>School foundation name<br>School Name (school name)<br>Postal code · Address line here</p><p style="margin-top:2rem">School official social media</p><div class="ma-sns"><a href="#"><i></i>Instagram</a><a href="#"><i></i>X</a><a href="#"><i></i>Facebook</a><a href="#"><i></i>LINE</a><a href="#"><i></i>YouTube</a></div></div>
      </div>
      <div class="ma-footer__contact">
        <div class="ma-footer__box"><p>Your text guiding inquiries goes here<br>Place it in two lines</p><a class="ma-tel" href="#">Tel.000-000-0000</a><a class="ma-btn is-solid" href="recruit.html" data-ma-hover="slot"><span class="ma-btn__labels"><span>Contact via Web</span><span>Contact Us</span></span>${arrow}</a></div>
        <div class="ma-footer__box"><p>To request materials<br>From here</p><a class="ma-btn is-solid is-app" href="recruit.html" data-ma-hover="slot"><span class="ma-btn__labels"><span>Request a brochure</span><span>Get materials here</span></span>${arrow}</a></div>
      </div>
      <div class="ma-footer__logo" data-label="Large school logo · Symbol + school name">${MARK.replace('class="ma-logo__mark"', "")}<span>School Name (school name)</span></div>
      <div class="ma-footer__bottom"><a href="#">Privacy policy</a><p class="ma-en">© SCHOOL NAME. ALL RIGHTS RESERVED.</p></div>`;
  }

  // Drawer — pressing the tab sets html[data-state=Like navOpen], is-nav
  const tab = document.querySelector(".ma-tab");
  document.querySelector(".ma-overlay")?.addEventListener("click", () => tab?.click());
  tab?.addEventListener("click", () => {
    const open = !html.classList.contains("is-nav");
    setTimeout(() => html.classList.toggle("is-nav", open), 25);
    tab.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-acdn] > button");
    if (b) b.parentElement.classList.toggle("is-open");
  });

  // Header text color — orange board below the header (data-tone="orange") arrives, turn the logo white. When scrolling down hide the header and buttons, and show them again on scroll up
  const tones = [...document.querySelectorAll('[data-tone="orange"]')];
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const probe = 40;
    html.classList.toggle("is-orange", tones.some((t) => { const r = t.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
    if (!html.classList.contains("is-nav")) html.classList.toggle("is-hide", y > 200 && y > lastY + 2 ? true : y < lastY - 2 ? false : html.classList.contains("is-hide"));
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Flowing strips pause when off-screen (original animationPlayState toggled with ScrollTrigger)
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting)));
  document.querySelectorAll(".ma-flow").forEach((f) => io.observe(f));

  // Original data-hover (js-split) — spans split one per character move in order from the first character. The stagger totals .1s regardless of character count (GSAP stagger amount)
  const STAGGER = 0.1;
  const split = (el) => {
    const chars = [...el.textContent];
    el.setAttribute("aria-label", el.textContent);
    el.textContent = "";
    chars.forEach((ch, i) => {
      const t = document.createElement("span");
      t.className = "ma-t";
      t.setAttribute("aria-hidden", "true");
      t.textContent = ch === " " ? " " : ch;
      t.style.setProperty("--ma-d", `${((i * STAGGER) / Math.max(1, chars.length - 1)).toFixed(3)}s`);
      el.append(t);
    });
    return [...el.children];
  };
  document.querySelectorAll("[data-ma-split]").forEach(split);
  window.maSplit = split;

  // slot — three copies of the text (front, back, front) are stacked. On enter, the first copy exits upward and the second rises from below (.4s expo.out),
  // On exit the second set slides up and the third one rises — the roll always continues upward. Not applied on touch devices (original ontouchstart)
  if (!("ontouchstart" in document) && window.gsap) {
    document.querySelectorAll('[data-ma-hover="slot"]').forEach((a) => {
      const wrap = a.querySelector(".ma-btn__labels");
      a.classList.add("is-slot");
      wrap.append(wrap.firstElementChild.cloneNode(true));
      const [s1, s2, s3] = [...wrap.children].map(split);
      const roll = (t, y) => gsap.to(t, { yPercent: y, duration: 0.4, ease: "expo.out", stagger: { amount: STAGGER }, overwrite: "auto" });
      gsap.set([...s2, ...s3], { yPercent: 100 });
      a.addEventListener("mouseenter", () => {
        gsap.set(s1, { yPercent: 0, overwrite: "auto" });
        gsap.set([...s2, ...s3], { yPercent: 100, overwrite: "auto" });
        roll(s1, -100);
        roll(s2, 0);
      });
      a.addEventListener("mouseleave", () => { roll(s2, -100); roll(s3, 0); });
    });
  }
})();
