// Common to all pages: draws the header, drawer and footer, and hooks up header pinning (100px), dropdown, drawer, tabs, current table-of-contents cell and people illustrations.
// Original values: header is-fixed 100px · drawer 0.5s fade · tab 0.7s · current item in the table of contents = Screen 1/3 point.
(() => {
  const page = document.body.dataset.page || "home";
  const HH = (window.HH = {});

  // Original character illustration spot: redraw flat people with round heads and orange/green clothes, one per pose. The color is painted by .hh-person in shared.css
  HH.person = (shirt = "orange", pose = "stand") => {
    const arm = {
      wave: `<path class="ar" d="M38 56 24 40"/><circle class="sk" cx="22" cy="37" r="5"/><path class="ar" d="M62 56l8 22"/><circle class="sk" cx="71" cy="81" r="5"/>`,
      walk: `<path class="ar" d="M38 57l-10 18"/><circle class="sk" cx="27" cy="78" r="5"/><path class="ar" d="M62 57l10 16"/><circle class="sk" cx="73" cy="76" r="5"/>`,
      jump: `<path class="ar" d="M38 56 26 36"/><circle class="sk" cx="24" cy="33" r="5"/><path class="ar" d="M62 56l12-20"/><circle class="sk" cx="76" cy="33" r="5"/>`,
      stand: `<path class="ar" d="M38 57l-4 22"/><circle class="sk" cx="33" cy="82" r="5"/><path class="ar" d="M62 57l4 22"/><circle class="sk" cx="67" cy="82" r="5"/>`,
    }[pose];
    const legs = pose === "walk"
      ? `<path class="lg" d="M44 94 36 124M56 94l10 28"/><path class="sh" d="M30 127h10M62 125h11"/>`
      : `<path class="lg" d="M44 94v30M56 94v30"/><path class="sh" d="M38 127h9M53 127h9"/>`;
    return `<svg class="hh-person is-${shirt}" viewBox="0 0 100 140" aria-hidden="true">${legs}<path class="bd" d="M36 50h28l4 46H32z"/>${arm}<circle class="sk" cx="50" cy="30" r="15"/><path class="hr" d="M35 30a15 15 0 0 1 30-3c-6 1-14-2-18-7-2 5-7 9-12 10z"/></svg>`;
  };
  const drawIllust = (root = document) => root.querySelectorAll("[data-illust]").forEach((el) => {
    const [shirt, pose] = el.dataset.illust.split(" ");
    el.classList.add("hh-illust");
    el.innerHTML = HH.person(shirt, pose);
  });
  HH.drawIllust = drawIllust;

  const logo = `<a class="hh-logo" href="index.html" aria-label="Home">
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle class="mk-bg" cx="24" cy="24" r="22" stroke-width="2"/><path class="mk-cross" d="M20 12h8v8h8v8h-8v8h-8v-8h-8v-8h8z"/><path class="mk-leaf" d="M24 33c-4-3-7-7-6-11 4 0 7 4 6 11z"/></svg>
      <span><small>Medical corporation placeholder</small><b>Your clinic name here</b></span></a>`;
  const groups = [
    ["About the Hospital", [["About the Hospital", "about.html"], ["Hospital strengths", "about.html#anc02"], ["Facility Standards", "about.html#anc07"], ["Floor Guide", "about.html#anc10"], ["Staff Introduction", "about.html#anc01"]]],
    ["Guide", [["Hospitalization Guide", "index.html#guide"], ["Outpatient Guide", "index.html#guide"], ["Psychiatry outpatient", "index.html#guide"], ["Adolescent Outpatient Clinic", "index.html#guide"], ["Memory loss clinic", "index.html#guide"]]],
    ["Related Facilities", [["Center name 1", "index.html#facilities"], ["Café name", "index.html#facilities"], ["Day care name", "index.html#facilities"], ["Group Home Name", "index.html#facilities"]]],
    ["Group facilities", [["Group facility 1", "service.html#anc01"], ["Group facility 2", "service.html#anc01"], ["Group facility 3", "service.html#anc02"], ["Group facility 4", "service.html#anc03"], ["All business areas", "service.html"]]],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "hh-head";
    head.innerHTML = `
      <h1 class="hh-head__logo">${logo}</h1>
      <div class="hh-util">
        <nav class="hh-gnav" aria-label="Main menu"><ul class="hh-gnav__list">
          <li><a href="index.html">HOME</a></li>
          ${groups.map(([t, l]) => `<li class="hh-drop"><p>${t}</p><ul class="hh-drop__menu">${l.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join("")}</ul></li>`).join("")}
          <li><a href="about.html#anc09">Directions</a></li>
        </ul></nav>
        <a class="hh-btn" href="#contact">Contact Us</a>
        <button class="hh-menu-btn" aria-label="Menu" aria-expanded="false"><span class="hh-menu-btn__line"><span></span><span></span><span></span></span></button>
      </div>`;
    const drawer = document.createElement("nav");
    drawer.className = "hh-drawer";
    drawer.setAttribute("data-slot", "menu-drawer");
    drawer.innerHTML = `
      <div class="hh-drawer__in"><div class="hh-drawer__wrap">
        <div class="hh-drawer__right">
          <ul class="hh-dlinks"><li><a href="index.html">HOME</a></li><li><a href="index.html#guide">Outpatient Guide</a><ul class="sub"><li><a href="index.html#guide">Psychiatry outpatient</a></li><li><a href="index.html#guide">Adolescent Outpatient Clinic</a></li><li><a href="index.html#guide">Memory loss clinic</a></li></ul></li><li><a href="index.html#guide">Hospitalization Guide</a></li><li><a href="" class="no-link">About the Hospital</a><ul class="sub"><li><a href="about.html">View hospital intro</a></li><li><a href="about.html#anc02">Hospital strengths</a></li><li><a href="about.html#anc07">Facility Standards</a></li><li><a href="about.html#anc10">Floor Guide</a></li><li><a href="about.html#anc01">Staff Introduction</a></li></ul></li></ul>
          <ul class="hh-dlinks"><li><a href="index.html#recruit">Hiring Info</a><ul class="sub"><li><a href="index.html#recruit">Nursing department</a></li></ul></li><li><a href="" class="no-link">Business introduction</a><ul class="sub"><li><a href="index.html#facilities">Café name</a></li><li><a href="index.html#facilities">Center name 1</a></li><li><a href="index.html#facilities">Day care name</a></li><li><a href="index.html#facilities">Group Home Name</a></li><li><a href="service.html">Expansion business</a></li></ul></li></ul>
          <ul class="hh-dlinks"><li><a href="news.html">Latest news</a><ul class="sub"><li><a href="news.html">Notice</a></li><li><a href="news.html">Hiring</a></li><li><a href="news.html">Event</a></li></ul></li><li><a href="index.html#blog">Blog</a><ul class="sub"><li><a href="index.html#blog">Newsletter</a></li><li><a href="index.html#blog">Center News</a></li><li><a href="index.html#blog">Medical Column</a></li></ul></li></ul>
        </div>
        <div class="hh-drawer__left">${logo}<p class="hh-drawer__addr mbS">Postal 000-0000 Your address line here<br>tel.<a href="#">0000-00-0000</a><br>fax.0000-00-0000</p><p><a class="hh-btn" href="#contact">Contact Us</a></p></div>
        <ul class="hh-drawer__other"><li><a class="hh-ul" href="#">Medical information provision · personal data protection</a></li><li><a class="hh-ul" href="#">Privacy policy</a></li></ul>
      </div></div>`;
    head.appendChild(drawer);

    const fix = () => head.classList.toggle("is-fixed", scrollY >= 100);
    addEventListener("scroll", fix, { passive: true });
    fix();
    head.querySelectorAll(".hh-drop").forEach((d) => {
      const on = () => d.classList.add("is-open"), off = () => d.classList.remove("is-open");
      d.addEventListener("mouseenter", on); d.addEventListener("focusin", on);
      d.addEventListener("mouseleave", off); d.addEventListener("focusout", off);
    });
    const btn = head.querySelector(".hh-menu-btn");
    const toggle = () => {
      const open = !btn.classList.contains("is-open");
      [btn, drawer, document.documentElement].forEach((el) => el.classList.toggle("is-open", open));
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", toggle);
    drawer.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", () => btn.classList.contains("is-open") && toggle()));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "hh-foot";
    foot.id = "contact";
    foot.innerHTML = `
      <div class="hh-foot__contents">
        <div class="col">
          <div class="hh-foot__logo">${logo}</div>
          <p class="hh-foot__info">Postal 000-0000 Your address line here<br>tel.<a href="#">0000-00-0000</a><br>fax.0000-00-0000</p>
          <div class="hh-foot__sns"><a class="hh-btn hh-fbtn" href="#">Contact Us</a>
            <a href="#" aria-label="SNS 1"><svg class="sns-1" viewBox="0 0 35 35" fill="none" stroke-width="2.4"><rect x="5" y="5" width="25" height="25" rx="7"/><circle cx="17.5" cy="17.5" r="5.5"/><circle class="dot" cx="24.5" cy="10.5" r="1"/></svg></a>
            <a href="#" aria-label="SNS 2"><svg class="sns-2" viewBox="0 0 35 35"><rect x="3" y="3" width="29" height="29" rx="6"/><path d="M19.5 30V19h3.5l.5-4h-4v-2.5c0-1.2.4-2 2-2h2.2V7a28 28 0 0 0-3.2-.2c-3.2 0-5 2-5 5.4V15H12v4h3.5v11z"/></svg></a></div>
          <ul class="hh-foot__bnrs" aria-label="Certification label slot">
            <li data-label="Certifying body abbreviation badge here"><svg class="hh-badge is-blue" viewBox="0 0 101 71"><rect class="pl" x="1" y="1" width="99" height="69" rx="6"/><circle class="ln" cx="34" cy="35" r="20" stroke-width="3"/><path class="ln" d="M26 35l6 6 11-12" stroke-width="3"/><text x="62" y="40" font-size="12">ABC</text></svg></li>
            <li><svg class="hh-badge is-gold" viewBox="0 0 63 71"><circle class="pl" cx="31.5" cy="35.5" r="29" stroke-width="2"/><circle class="ln" cx="31.5" cy="35.5" r="21" stroke-dasharray="2 3"/><text x="31.5" y="40" font-size="11" text-anchor="middle">Certification 2</text></svg></li>
          </ul>
        </div>
        <div class="hh-sitemap">
          <ul class="hh-flinks"><li><a href="index.html#guide">Outpatient Guide</a><ul class="sub"><li><a href="index.html#guide">Psychiatry outpatient</a></li><li><a href="index.html#guide">Adolescent Outpatient Clinic</a></li><li><a href="index.html#guide">Memory loss clinic</a></li></ul></li><li><a href="index.html#guide">Hospitalization Guide</a></li><li><a href="about.html">About the Hospital</a><ul class="sub"><li><a href="about.html#anc01">Hospital director’s greeting</a></li><li><a href="about.html#anc02">Hospital Philosophy</a></li><li><a href="about.html#anc05">Hospital Overview</a></li><li><a href="about.html#anc08">History</a></li><li><a href="about.html#anc10">Floor Guide</a></li></ul></li></ul>
          <ul class="hh-flinks"><li><a href="index.html#recruit">Hiring Info</a><ul class="sub"><li><a href="index.html#recruit">Nursing department</a></li></ul></li><li><a href="index.html#facilities">Business introduction</a><ul class="sub"><li><a href="index.html#facilities">Café name</a></li><li><a href="index.html#facilities">Center name 1</a></li><li><a href="index.html#facilities">Day care name</a></li><li><a href="index.html#facilities">Group Home Name</a></li><li><a href="service.html">Expansion business</a></li></ul></li></ul>
          <ul class="hh-flinks"><li><a href="news.html">Latest news</a><ul class="sub"><li><a href="news.html">Notice</a></li><li><a href="news.html">Hiring</a></li><li><a href="news.html">Event</a></li></ul></li><li><a href="index.html#blog">Blog</a><ul class="sub"><li><a href="index.html#blog">Newsletter</a></li><li><a href="index.html#blog">Center News</a></li><li><a href="index.html#blog">Medical Column</a></li></ul></li></ul>
        </div>
      </div>
      <div class="hh-copy"><small>© 0000 Your Clinic Name</small><ul><li><a class="hh-ul" href="#">Medical information provision · personal data protection</a></li><li><a class="hh-ul" href="#">Privacy policy</a></li></ul></div>
      <a class="hh-pagetop" href="#top" aria-label="Back to top"><svg viewBox="0 0 9 30" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4.5 30V1M1 5l3.5-4L8 5"/></svg><span>Page top</span></a>`;
  }

  drawIllust();

  // Tabs: pressing button i shows only content i
  document.querySelectorAll("[data-tabs]").forEach((tab) => {
    const btns = tab.querySelectorAll("[data-tab]");
    const panes = tab.querySelectorAll("[data-tab-content]");
    btns.forEach((b, i) => b.addEventListener("click", (e) => {
      e.preventDefault();
      btns.forEach((x, k) => { x.classList.toggle("is-active", k === i); panes[k]?.classList.toggle("is-active", k === i); });
    }));
  });

  // TOC: the link of the section containing the screen’s top 1/3 point becomes the current cell
  const toc = [...document.querySelectorAll(".hh-toc__links a")];
  if (toc.length) {
    const secs = toc.map((a) => document.querySelector(a.getAttribute("href")));
    const mark = () => {
      const y = scrollY + innerHeight / 3;
      let cur = -1;
      secs.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
      toc.forEach((a, i) => a.classList.toggle("is-current", i === cur));
    };
    addEventListener("scroll", mark, { passive: true });
    addEventListener("resize", mark);
    mark();
  }
})();
