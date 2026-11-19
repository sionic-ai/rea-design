// The header row, phone drawer, fixed booking circle, end sections (booking, notices, directions) and footer are the same on all five pages, so they are drawn once here.
(() => {
  const page = document.body.dataset.page || "index";
  const NAV = [
    ["about.html", "Care Philosophy", "about"],
    ["index.html#visit", "Home visit care", "visit"],
    ["service.html", "In-clinic treatment", "service"],
    ["recruit.html", "Hiring Info", "recruit"],
    ["news.html", "Notice", "news"],
  ];
  const tooth = (cls) => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#mt-tooth"/></svg>`;
  const arrowOut = '<svg class="mt-ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4.2 3H9v4.8" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
  const hours = `
    <table class="mt-hours">
      <tr><th></th><th>Month</th><th>Fire</th><th>Number</th><th>Neck</th><th>Gold</th><th>Earth</th><th>Day</th></tr>
      <tr><td>0:00 - 00:00</td><td>○</td><td>○</td><td>×</td><td>○</td><td>○</td><td>○</td><td>×</td></tr>
      <tr><td>00:00 - 00:00</td><td>○</td><td>○</td><td>×</td><td>○</td><td>○</td><td>△</td><td>×</td></tr>
    </table>
    <p class="mt-hours__note">Saturday afternoon consultations until 00:00 ／ Closed: Wednesdays, Sundays, public holidays</p>`;

  const sprite = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <symbol id="mt-tooth" viewBox="0 0 40 40"><path d="M9 5.5C4.6 6.6 3.2 12 3.7 18.5c.6 7 3.4 13.6 6.6 17.4 1.9 2.2 4.6 1.6 4.8-1.8.2-3.6 1.3-6.4 4.9-6.4s4.7 2.8 4.9 6.4c.2 3.4 2.9 4 4.8 1.8 3.2-3.8 6-10.4 6.6-17.4.5-6.5-.9-11.9-5.3-13-4.3-1.1-7.6 1.4-11 2.1-3.4-.7-6.7-3.2-11-2.1Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></symbol>
      <symbol id="mt-pin" viewBox="0 0 16 20"><path d="M8 0a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 8 4.4a2.6 2.6 0 0 1 0 5.2Z" fill="currentColor"/></symbol>
      <symbol id="mt-tel" viewBox="0 0 18 18"><path d="M16.6 12.7 13 11.2a1 1 0 0 0-1.1.3l-1.6 2a12 12 0 0 1-5.8-5.8l2-1.6a1 1 0 0 0 .3-1.1L5.3 1.4A1 1 0 0 0 4.2.8L.8 1.6A1 1 0 0 0 0 2.6 15.4 15.4 0 0 0 15.4 18a1 1 0 0 0 1-.8l.8-3.4a1 1 0 0 0-.6-1.1Z" fill="currentColor"/></symbol>
      <symbol id="mt-clock" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M9 4.5V9l3 2" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    </svg>`;

  const header = `
    <div class="mt-header__in">
      <p class="mt-header__logo"><a href="index.html" class="mt-logo" data-label="Hospital logo — this shape mark + one line of English name + small local-language name">${tooth("mt-logo__mark")}<span class="mt-logo__txt"><span class="mt-logo__en">YOURNAME DENTAL CLINIC</span><span class="mt-logo__ko">Your hospital name here</span></span></a></p>
      <div class="mt-reserve"><a href="#reserve"><span>WEB booking<span class="mt-pc-only">(First visit)</span></span>${arrowOut}</a></div>
      <button type="button" class="mt-burger" aria-label="Open Menu"><span class="mt-burger__lines"><span></span><span></span><span></span></span></button>
      <div class="mt-gnav-overlay"></div>
      <nav class="mt-gnav" aria-label="Main menu">
        <ul class="mt-gnav__menu">
          ${NAV.map(([href, label, key]) => `<li${key === page ? ' class="is-current"' : ""}><a class="mt-gnav__link" href="${href}">${label}</a></li>`).join("")}
          <li><a class="mt-gnav__link" href="#reserve" target="_blank" rel="noopener">WEB booking<br class="mt-sp-only">(First visit)${arrowOut}</a></li>
        </ul>
        <div class="mt-gnav__info mt-sp-only">
          <p class="mt-gnav__tel"><span>TEL：</span>000-000-0000</p>
          <p class="mt-gnav__name">Medical corporation · Your hospital name here</p>
          <div class="mt-gnav__addr"><p>〒000-0000<br>Your one-line address here</p><a href="#map">BRAND MAP</a></div>
          <h2 class="mt-gnav__h">OFFICE HOURS</h2>
          ${hours}
          <div class="mt-gnav__btm"><a href="#privacy">Privacy policy</a><small>©0000 YOURNAME DENTAL CLINIC.</small></div>
        </div>
      </nav>
    </div>`;

  const fixed = `<a href="#reserve" target="_blank" rel="noopener"><p><span class="mt-fixed__en">WEB</span>Reservation</p><span class="mt-fixed__sub">First checkup</span></a>`;

  const tail = {
    reservation: `
      <section class="mt-reserve-sec" data-slot="reservation">
        <div class="mt-inner-md">
          <h2 class="mt-reserve-sec__h" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">RESERVATION</h2>
          <p class="mt-reserve-sec__sub">Care WEB booking</p>
          <div class="mt-reserve-box">
            <h3 class="mt-reserve-box__h" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">Regular visitors, please call<br class="mt-sp-only"> Please make a reservation.</h3>
            <p class="mt-reserve-box__en" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">schedule your first appointment now</p>
            <ul class="mt-reserve-box__cta">
              <li class="mt-reserve-box__tel" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity"><a href="#tel"><span>For those attending:</span><br><span class="mt-reserve-box__num">TEL.000-000-0000</span></a></li>
              <li class="mt-btn mt-btn--ext" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity"><a href="#reserve" target="_blank" rel="noopener">Book your first visit via WEB${arrowOut}</a></li>
            </ul>
          </div>
        </div>
      </section>`,
    news: `
      <section class="mt-news-sec" data-slot="news-list">
        <div class="mt-inner-md mt-news-sec__in">
          <div class="mt-news-sec__head">
            <h2 class="mt-news-sec__h" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">NEWS</h2>
            <p class="mt-label" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">Notice</p>
            <a class="mt-arrow-link mt-pc-only" href="news.html"><span class="mt-arrow-link__c"></span><span>View list</span></a>
          </div>
          <div class="mt-news-sec__list" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">
            ${[1, 2, 3, 4, 5].map((n) => `<article class="mt-post"><p class="mt-post__date">0000.00.0${n}</p><h3 class="mt-post__ttl"><a href="news.html">Your notice title here, one line ${n}</a></h3></article>`).join("")}
          </div>
        </div>
      </section>`,
    info: `
      <section class="mt-info" data-slot="access-hours" id="access">
        <div class="mt-inner-md mt-info__in">
          <div class="mt-info__access">
            <div class="mt-info__txt">
              <h2 class="mt-info__h" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">ACCESS</h2>
              <p class="mt-label" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">Directions</p>
              <p class="mt-info__addr" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">〒000-0000<br class="mt-sp-only"> Your one-line address here<br>Tel: 000-000-0000</p>
              <div data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity"><a class="mt-arrow-link" href="#map"><span class="mt-arrow-link__c"></span><span>View in map app</span></a></div>
            </div>
            <div class="mt-info__map"><div class="wf-img" data-label="Map embed · circle-cropped neighborhood map · red pin in center"></div></div>
          </div>
          <div class="mt-info__hours">
            <h2 class="mt-info__h" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">OFFICE HOURS</h2>
            <p class="mt-label mt-label--tight" data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">Consultation Hours</p>
            <div data-fx="fade-up" data-fx-fade-up="x: 8%; y: 0; duration: 1; ease: 0,0.4,0.3,1; fade-dur: 1.4; fade-ease: 0.25,0.1,0.25,1; start: top bottom-=200; alpha: opacity">${hours}</div>
          </div>
        </div>
      </section>`,
  };

  const footer = `
    <div class="mt-footer__top">
      <div class="mt-inner-md mt-footer__row">
        <p class="mt-footer__logo"><a href="index.html" data-label="Hospital logo (white plate) — above this shape chart, two-line English name below">${tooth("mt-footer__mark")}<span>YOURNAME<br>DENTAL CLINIC</span></a></p>
        <div class="mt-finfo">
          <p class="mt-finfo__h">With high expertise,<br class="mt-sp-only"> Supports the whole function of the mouth.</p>
          <p class="mt-finfo__txt">Your hospital introduction here, about four lines. Briefly say what care is offered and what equipment is used.<br>Leave about one line for the second paragraph too. It closes by inviting people to feel free to get in touch.</p>
          <ul class="mt-finfo__cta">
            <li class="mt-finfo__tel"><a href="#tel">TEL.<span>000-000-0000</span></a></li>
            <li class="mt-finfo__web"><a href="#reserve" target="_blank" rel="noopener"><span>Book your first visit on the WEB</span>${arrowOut}</a></li>
          </ul>
        </div>
        <nav class="mt-fnav" aria-label="Footer Menu"><ul>
          ${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}
          <li><a href="#reserve" target="_blank" rel="noopener">WEB booking</a></li>
        </ul></nav>
      </div>
    </div>
    <div class="mt-footer__btm">
      <div class="mt-inner-xl mt-footer__btmrow">
        <ul class="mt-fnav-sub"><li><a href="#group">Group Site</a></li><li><a href="#sitemap">Sitemap</a></li><li><a href="#privacy">Privacy policy</a></li></ul>
        <div class="mt-footer__copy"><small>©0000 YOURNAME DENTAL CLINIC.</small><span class="mt-footer__by" data-label="Small maker credit">PRODUCED BY Studio</span></div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("afterbegin", sprite);
  const h = document.querySelector("[data-mt-chrome=header]");
  if (h) h.innerHTML = header;
  document.querySelectorAll("[data-mt-tail]").forEach((el) => {
    el.outerHTML = el.dataset.mtTail.split(/\s+/).map((k) => tail[k] || "").join("");
  });
  const f = document.querySelector("[data-mt-chrome=footer]");
  if (f) f.innerHTML = footer;
  const fx = document.querySelector("[data-mt-chrome=fixed]");
  if (fx) fx.innerHTML = fixed;

  // Original: only below 1081px does the burger open and close the drawer and cover together
  const header$ = document.querySelector(".mt-header");
  const toggle = () => header$.classList.toggle("is-open");
  header$?.querySelector(".mt-burger").addEventListener("click", toggle);
  header$?.querySelector(".mt-gnav-overlay").addEventListener("click", toggle);

  // Original: past the header height (142px) it becomes header-sm — on the first page the background panel expands from half width and the logo appears
  const sm = () => header$?.classList.toggle("is-sm", scrollY > header$.offsetHeight);
  addEventListener("scroll", sm, { passive: true });
  sm();

  // Original: the fixed booking circle slips out to the right once past the point 128px above the footer
  const fixedEl = document.querySelector(".mt-fixed");
  const foot = document.querySelector(".mt-footer");
  const hide = () => {
    if (!fixedEl || !foot) return;
    const at = document.documentElement.scrollHeight - innerHeight - foot.offsetHeight + 128;
    fixedEl.classList.toggle("is-hide", scrollY > at);
  };
  addEventListener("scroll", hide, { passive: true });
  hide();

  // Original: in-page links scroll with jQuery animate 400ms swing, stopping short by the header height (PC 80 · phone 64)
  const gap = innerWidth > 1080 ? 80 : 64;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + scrollY - gap;
    if (window.jQuery && !matchMedia("(prefers-reduced-motion: reduce)").matches) jQuery("html, body").animate({ scrollTop: y }, 400, "swing");
    else scrollTo(0, y);
  });
})();
