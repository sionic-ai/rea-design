// Fills the shared header bar · fixed header bar · phone menu · footer, and ports the interaction from the original common.js (hamburger · dropdown · accordion · anchors).
// Pictures (people, dogs, cats, icons) are kept in one SVG sprite of ours and <use> Call it by name, the coloring is handled by .il-* in shared.css using skin variables.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";

  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="il-person" viewBox="0 0 60 150">
    <rect class="il-bottom" x="18" y="80" width="11" height="58" rx="5"/><rect class="il-bottom" x="31" y="80" width="11" height="58" rx="5"/>
    <path class="il-k" d="M15 137h14v6H13c0-3 1-6 2-6zM31 137h14c1 0 2 3 2 6H31z"/>
    <rect class="il-top" x="14" y="31" width="32" height="56" rx="13"/>
    <rect class="il-top" x="7" y="35" width="10" height="40" rx="5" transform="rotate(12 12 35)"/><rect class="il-top" x="43" y="35" width="10" height="40" rx="5" transform="rotate(-12 48 35)"/>
    <circle class="il-skin" cx="8" cy="76" r="4.5"/><circle class="il-skin" cx="52" cy="76" r="4.5"/>
    <rect class="il-skin" x="26" y="25" width="8" height="9" rx="3"/><circle class="il-skin" cx="30" cy="17" r="11"/>
    <path class="il-hair" d="M18.6 17.5C18 9 23 5 30 5s12.5 4 11.4 12.5c-3-5-8-6.5-11.4-6.5S21.5 12.5 18.6 17.5z"/>
  </symbol>
  <symbol id="il-walker" viewBox="0 0 70 150">
    <rect class="il-bottom" x="27" y="78" width="11" height="60" rx="5" transform="rotate(18 32 80)"/><rect class="il-bottom" x="31" y="78" width="11" height="60" rx="5" transform="rotate(-20 36 80)"/>
    <path class="il-k" d="M2 134l12 3-1 6-13-3c0-3 1-6 2-6zM55 134l12-2c1 2 1 5 0 6l-13 2z"/>
    <rect class="il-top" x="20" y="31" width="30" height="54" rx="13"/>
    <rect class="il-top" x="12" y="35" width="10" height="40" rx="5" transform="rotate(25 17 35)"/><rect class="il-top" x="47" y="35" width="10" height="38" rx="5" transform="rotate(-30 52 35)"/>
    <circle class="il-skin" cx="4" cy="70" r="4.5"/><circle class="il-skin" cx="68" cy="65" r="4.5"/>
    <rect class="il-skin" x="31" y="25" width="8" height="9" rx="3"/><circle class="il-skin" cx="36" cy="17" r="11"/>
    <path class="il-hair" d="M24.6 17.5C24 9 29 5 36 5s12.5 4 11.4 12.5c-3-5-8-6.5-11.4-6.5S27.5 12.5 24.6 17.5z"/>
  </symbol>
  <symbol id="il-dog-sit" viewBox="0 0 80 90">
    <path class="il-fur" d="M18 86c-4-20 2-42 18-50l14-6c8 10 12 28 10 56z"/>
    <path class="il-fur" d="M58 74c10-2 16 4 18 12H58z"/>
    <ellipse class="il-fur2" cx="40" cy="62" rx="9" ry="16"/>
    <circle class="il-fur" cx="44" cy="24" r="16"/><path class="il-fur" d="M30 16 26 0l14 10zM50 10l12-8-2 18z"/>
    <ellipse class="il-fur2" cx="50" cy="31" rx="10" ry="7"/><circle class="il-k" cx="57" cy="28" r="2.6"/><circle class="il-k" cx="44" cy="21" r="1.8"/>
    <rect class="il-fur" x="26" y="74" width="9" height="14" rx="4"/><rect class="il-fur" x="44" y="74" width="9" height="14" rx="4"/>
  </symbol>
  <symbol id="il-dog-run" viewBox="0 0 192 105">
    <path class="il-fur" d="M40 58c-2-16 12-26 34-28l52-2c14 0 22 6 24 16 2 14-10 22-28 22l-56 2C52 68 42 66 40 58z"/>
    <path class="il-fur" d="M140 30c4-14 18-20 32-14l14 8-4 10c-8 4-18 6-24 12z"/><path class="il-fur" d="M150 14l2-14 12 12z"/>
    <path class="il-fur2" d="M170 26l18 2-4 8-14 0zM112 64c10 0 22-4 26-12 4 6 2 12-6 16l-20 2z"/><circle class="il-k" cx="186" cy="27" r="2.6"/><circle class="il-k" cx="164" cy="20" r="1.8"/>
    <path class="il-fur" d="M44 56 6 76l-6-6 34-22zM60 62 30 98l-8-4 26-38zM118 60l26 34 8-4-22-36zM128 54l44 22 4-8-40-24z"/>
    <path class="il-fur" d="M42 44c-14-2-24-12-22-26 2-8 10-10 14-4-6 2-6 10 0 14 4 4 10 6 14 6z"/>
  </symbol>
  <symbol id="il-cat-sit" viewBox="0 0 64 80">
    <path class="il-w" d="M14 78c-4-18 0-34 12-42h16c10 8 14 24 10 42z"/>
    <path class="il-o" d="M18 50c4-8 12-10 16-6-6 2-10 8-10 14z"/>
    <path class="il-ln" d="M52 74c8 2 10-8 6-14"/>
    <circle class="il-w" cx="34" cy="26" r="14"/><path class="il-w" d="M22 20 20 4l12 10zM46 20l2-16-12 10z"/>
    <path class="il-o" d="M40 14l8-10-1 14z"/><path class="il-k" d="M22 20 20 6l7 8z"/>
    <circle class="il-k" cx="29" cy="27" r="1.8"/><circle class="il-k" cx="40" cy="27" r="1.8"/>
  </symbol>
  <symbol id="il-cat-jump" viewBox="0 0 150 75">
    <path class="il-w" d="M28 44c4-12 18-20 40-20l40 2c14 2 20 10 18 18-2 10-14 14-28 12l-50-2C34 54 26 52 28 44z"/>
    <path class="il-o" d="M70 28c10-2 20 0 24 6-10 0-18 4-22 10z"/><path class="il-k" d="M100 26c8-2 14 2 16 8-6-2-12 0-16 4z"/>
    <circle class="il-w" cx="22" cy="40" r="14"/><path class="il-w" d="M12 30 10 16l12 10zM26 26l8-12 2 16z"/><path class="il-k" d="M12 30 10 18l6 7z"/>
    <circle class="il-k" cx="16" cy="42" r="1.8"/>
    <path class="il-w" d="M40 50 18 66l-4-6 20-14zM104 52l22 14 4-6-20-14z"/>
    <path class="il-ln" d="M124 34c10-8 18-10 24-20" style="stroke-width:5"/>
  </symbol>
  <symbol id="il-rabbit" viewBox="0 0 60 70">
    <ellipse class="il-w" cx="30" cy="50" rx="22" ry="18"/><circle class="il-w" cx="30" cy="26" r="13"/>
    <rect class="il-w" x="19" y="0" width="8" height="24" rx="4" transform="rotate(-8 23 12)"/><rect class="il-w" x="33" y="0" width="8" height="24" rx="4" transform="rotate(8 37 12)"/>
    <circle class="il-k" cx="25" cy="26" r="1.6"/><circle class="il-k" cx="35" cy="26" r="1.6"/>
  </symbol>
  <symbol id="il-clipboard" viewBox="0 0 70 90">
    <rect class="il-a" x="0" y="8" width="70" height="82" rx="6"/><rect class="il-w" x="8" y="18" width="54" height="64" rx="3"/>
    <rect class="il-o" x="22" y="2" width="26" height="14" rx="4"/>
    <path class="il-ln" d="M18 34h4M28 34h24M18 48h4M28 48h24M18 62h4M28 62h18"/>
  </symbol>
  <symbol id="ic-bowl" viewBox="0 0 32 28"><path class="il-ln" d="M2 14h28c-1 7-6 12-14 12S3 21 2 14z"/><path class="il-ln" d="M8 14c0-4 3-7 8-7s8 3 8 7" style="stroke:var(--site-orange)"/><path class="il-ln" d="M20 3l4 4" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-cal" viewBox="0 0 24 26"><rect class="il-ln" x="2" y="4" width="20" height="20" rx="3"/><path class="il-ln" d="M2 10h20M7 1v5M17 1v5"/><path class="il-ln" d="M7 15h1M12 15h1M17 15h1M7 19h1M12 19h1" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-tel" viewBox="0 0 24 24"><path class="il-ln" d="M5 2h4l2 5-3 2c1 3 4 6 7 7l2-3 5 2v4c0 2-2 3-4 3C9 21 3 15 2 6c0-2 1-4 3-4z"/><path class="il-ln" d="M15 2c3 1 6 4 7 7" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-pin" viewBox="0 0 16 20"><path class="il-ln" d="M8 19s6-6 6-11A6 6 0 0 0 2 8c0 5 6 11 6 11z" style="stroke:var(--site-orange)"/><circle class="il-ln" cx="8" cy="8" r="2" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-x" viewBox="0 0 22 22"><path class="il-ln" d="M3 3l16 16M19 3 3 19" style="stroke:var(--kf-on-accent)"/></symbol>
  <symbol id="ic-chat" viewBox="0 0 22 22"><path class="il-ln" d="M3 4h16v11H9l-5 4v-4H3z" style="stroke:var(--kf-on-accent)"/></symbol>
  <symbol id="ic-cam" viewBox="0 0 22 22"><rect class="il-ln" x="2" y="2" width="18" height="18" rx="5" style="stroke:var(--site-orange)"/><circle class="il-ln" cx="11" cy="11" r="4" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-steth" viewBox="0 0 40 40"><path class="il-ln" d="M12 8v10a8 8 0 0 0 16 0V8M20 26v4a6 6 0 0 0 12 0v-4"/><circle class="il-ln" cx="32" cy="23" r="3" style="stroke:var(--site-orange)"/></symbol>
  <symbol id="ic-logo" viewBox="0 0 72 63"><circle class="il-ln" cx="31" cy="31.5" r="27" style="stroke-width:5"/><path class="il-a" d="M18 46c0-12 6-20 16-22l6-10 4 10c6 4 8 12 6 22z"/><path class="il-w" d="M30 40c2-6 8-8 12-4-2 4-6 6-12 4z"/><path class="il-ln" d="M58 31c6 0 10 4 10 9s-4 8-8 8" style="stroke-width:4"/></symbol>
  </defs></svg>`;
  body.insertAdjacentHTML("afterbegin", SPRITE);

  const logo = `<span class="az-logo" data-label="Hospital logo — dog and cat mark in a circle + name + English name"><svg class="az-logo__mark" viewBox="0 0 72 63"><use href="#ic-logo"/></svg>
    <span class="az-logo__txt"><span class="az-logo__name">Your hospital name here</span><span class="az-logo__sub">CLINIC NAME HOSPITAL</span></span></span>`;
  const subMenu = (en, items, deco) => `<div class="az-sub"><div class="az-sub__box">
      ${deco}<ul>${items.map((t) => `<li><a href="service.html">${t}</a></li>`).join("")}</ul>
      <p class="az-sub__en"><span>${en}</span></p></div></div>`;
  const deco1 = `<svg class="az-sub__deco1 il" viewBox="0 0 70 92"><use href="#il-person" class="il--orange" x="8" y="0" width="38" height="92"/><use href="#il-dog-sit" class="il--sand" x="34" y="52" width="36" height="40"/></svg>`;
  const deco2 = `<svg class="az-sub__deco2 il" viewBox="0 0 92 76"><use href="#il-cat-sit" x="0" y="10" width="52" height="66"/></svg>`;
  const hbtns = `<div class="az-hbtns">
      <a class="az-hbtn is-two" href="article.html"><span class="az-hbtn__in"><svg class="az-hbtn__ico" viewBox="0 0 32 28"><use href="#ic-bowl"/></svg><span><b>Therapy diet</b> Buying<br>Get guide</span></span></a>
      <a class="az-hbtn" href="#reserve"><span class="az-hbtn__in"><svg class="az-hbtn__ico" viewBox="0 0 24 26"><use href="#ic-cal"/></svg><span><b>Reservation</b>is this way</span></span></a>
      <a class="az-hbtn is-tel" href="tel:0000000000"><span class="az-hbtn__in"><small>Appointments · Urgent care etc.</small><strong><svg class="az-hbtn__ico" viewBox="0 0 24 24"><use href="#ic-tel"/></svg>0000-00-0000</strong></span></a>
    </div>`;
  const gnav = (withDeco) => `<nav class="az-gnav"><ul>
      <li class="has-sub"><a>Hospital Guide</a>${subMenu("Clinic", ["Clinic info · Directions", "Hospital features", "Submenu 03", "Submenu 04"], withDeco ? deco1 + deco2 : "")}</li>
      <li class="has-sub"><a>Treatment Details</a>${subMenu("Medical", ["General Care", "Surgery", "Small animal care", "Preventive care", "Grooming · Pet hotel", "Submenu 06"], withDeco ? deco1 : "")}</li>
      <li><a href="service.html">Grooming · Pet hotel</a></li>
    </ul></nav>`;
  const cal = (white) => `<div class="az-cal${white ? " is-white" : ""}"><dl><dt>Registration hours</dt><dd>Month</dd><dd>Fire</dd><dd>Number</dd><dd>Neck</dd><dd>Gold</dd><dd>Earth</dd><dd>Sun·Public holiday</dd></dl>
    <dl><dt>00:00-00:00</dt><dd class="is-o"></dd><dd class="is-x"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-o"></dd></dl>
    <dl><dt>00:00-00:00</dt><dd class="is-o"></dd><dd class="is-x"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-o"></dd><dd class="is-x"></dd></dl></div>`;
  const calTxt = `<div class="az-cal-txt"><p>Booking priority</p><p>First-time visitors, please arrive 30 minutes before closing time</p></div>`;
  const spBtns = `<div class="az-spbtns"><a href="tel:0000000000"><svg viewBox="0 0 24 24"><use href="#ic-tel"/></svg>Phone</a><a href="#reserve"><svg viewBox="0 0 24 26"><use href="#ic-cal"/></svg>Reservation</a></div>`;
  const burger = `<button class="az-burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>`;
  window.AZ = { cal, calTxt };

  // Hero top header — original .header (absolute, height 180)
  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.classList.add("az-hd");
    // The phone menu panel sits inside the header row (z 99) like the original .layerMenu — the hamburger (z 1000) in the same row stays above the panel as an X
    hd.innerHTML = `<div class="az-hd__in">
      <div class="az-hd__left"><p class="az-hd__tag">One line here for region · animals treated · clinic name.</p><p class="az-hd__logo"><a href="index.html">${logo}</a></p></div>
      <div class="az-hd__right">${hbtns}${gnav(true)}</div>
    </div>
    <div class="az-layer" data-slot="menu-layer"><div class="az-layer__in">
      <p><a href="index.html">${logo}</a></p>${hbtns}
      <nav class="az-spnav"><a href="index.html">Home</a><a href="service.html">Clinic info · Directions</a><a href="service.html">Hospital features</a><a href="service.html">General care · Surgery</a><a href="service.html">Preventive care</a><a href="service.html">Grooming · Pet hotel</a><a href="news.html">News · Job openings</a><a href="recruit.html">Hiring Info</a></nav>
      ${cal(true)}${calTxt}
    </div></div>${burger}${spBtns}`;
    // Fixed header — the original adds a second copy of the same header and turns it on in 1s after scrolling past 180px (phone 142px)
    const at = matchMedia("(max-width: 767px)").matches ? 142 : 180;
    hd.insertAdjacentHTML("afterend", `<div class="az-fhd" data-slot="header-fixed" data-fx="appear-past-scroll" data-fx-appear-past-scroll="at: ${at}"><div class="az-hd__in">
      <div class="az-hd__left"><p class="az-hd__logo"><a href="index.html">${logo}</a></p></div>
      <div class="az-hd__right">${hbtns}${gnav(false)}</div>
    </div>${burger}${spBtns}</div>`);
  }

  // Footer — a dog running and a cat jumping over the wave strip, two door buttons·map, white card (logo·address·clinic hours·payment·menu·careers).
  const ft = document.querySelector('[data-slot="footer"]');
  if (ft) {
    ft.classList.add("az-ft");
    ft.id = "contact";
    ft.innerHTML = `
    <span class="az-ft__wave" aria-hidden="true"></span>
    <svg class="az-ft__deco1 il" viewBox="0 0 192 105" aria-hidden="true"><use href="#il-dog-run" class="il--sand" width="192" height="105"/></svg>
    <svg class="az-ft__deco2 il" viewBox="0 0 150 75" aria-hidden="true"><use href="#il-cat-jump" width="150" height="75"/></svg>
    <div class="az-ft__b1"><div class="az-in1080"><div class="az-ft__grid">
      <h2 class="az-ttl01"><span class="az-en is-orange">Contact</span><span class="az-jp">Comfortably<br>Please contact us.</span></h2>
      <div class="az-ft__info">
        <a class="az-ft__cbtn is-web" href="#reserve"><span><i class="az-ft__cicon"><svg viewBox="0 0 24 26"><use href="#ic-cal"/></svg></i><span class="az-ft__ctxt">Online<br>Reservations are <span>This side</span></span></span></a>
        <a class="az-ft__cbtn is-tel" href="tel:0000000000"><span><i class="az-ft__cicon"><svg viewBox="0 0 24 24"><use href="#ic-tel"/></svg></i><span class="az-ft__ctxt">Appointments · Urgent care etc.<br><span>0000-00-0000</span></span></span></a>
      </div></div>
      <div class="az-ft__map"><div class="wf-img" data-label="Map slot — clinic location map (Google Maps embed) · 1080×300"></div></div>
    </div></div>
    <div class="az-ft__b2"><div class="az-ft__card"><div class="az-ft__cols">
      <div class="az-ft__left">
        <div class="az-ft__social">${logo}<p class="az-ft__sns"><a href="#" aria-label="Social 1"><svg viewBox="0 0 22 22"><use href="#ic-x"/></svg></a><a href="#" aria-label="Social 2"><svg viewBox="0 0 22 22"><use href="#ic-chat"/></svg></a><a href="#" aria-label="Social 3"><svg viewBox="0 0 22 22"><use href="#ic-cam"/></svg></a></p></div>
        <div class="az-ft__info2"><p class="az-ft__name">Your hospital name here</p><p class="az-ft__addr"><svg viewBox="0 0 16 20"><use href="#ic-pin"/></svg>Postal code 000-0000 Your address line here</p>${calTxt}</div>
        <div class="az-ft__calbox">${cal(false)}</div>
        <div class="az-ft__paycard"><p class="az-ft__paytxt">You can pay by card or mobile pay as well as cash.</p><p class="az-ft__paylogos" data-label="Payment method logo row"><span></span><span></span><span></span><span></span><span></span><span></span><span class="is-wide"></span></p></div>
      </div>
      <div class="az-ft__right">
        <ul class="az-ft__navi"><li><a href="index.html">Home</a></li><li><a href="service.html">Clinic info · Directions</a></li><li><a href="service.html">Hospital features</a></li><li><a href="service.html">General care · Surgery</a></li><li><a href="service.html">Preventive care</a></li><li><a href="service.html">Grooming · Pet hotel</a></li><li><a href="#contact">Booking · Contact</a></li><li><a href="news.html">News · Job openings</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Sitemap</a></li></ul>
        <a class="az-ft__first" href="service.html"><b>First-time visitors</b>If you bring a completed intake form,<br>Waiting time gets shorter.</a>
        <div class="az-ft__row"><a class="az-ft__recruit" href="recruit.html"><i><svg viewBox="0 0 40 40"><use href="#ic-steth"/></svg></i>Hiring Info</a><div class="az-ft__badges"><a href="https://example.com/insurance-1" target="_blank" rel="noopener"><div class="wf-img" data-label="Partner insurance badge 1"></div></a><a href="https://example.com/insurance-2" target="_blank" rel="noopener"><div class="wf-img" data-label="Partner insurance badge 2"></div></a></div></div>
      </div>
    </div></div>
    <svg class="az-ft__deco3 il" viewBox="0 0 112 115" aria-hidden="true"><use href="#il-person" class="il--hair-o" x="0" y="40" width="44" height="75" style="--il-top:color-mix(in oklab, var(--site-orange) 50%, var(--kf-surface))"/><use href="#il-dog-sit" class="il--orange" x="30" y="10" width="82" height="105"/></svg>
    </div>
    <p class="az-ft__copy">© All Rights Reserved. Clinic name here</p>`;
  }

  // Current page position — the original has no indicator, so only the links are connected
  document.querySelectorAll(".az-gnav a, .az-spnav a").forEach((a) => a.getAttribute("href") === `${page}.html` && a.setAttribute("aria-current", "page"));

  // Original $(window).on("scroll load") → body.loaded — the hero photo, vertical text and clinic schedule turn on with this mark
  // Original $(window).on("scroll load") as is — theme.css loads fonts without blocking render, so load fires right after the first paint
  const markLoaded = () => body.classList.add("loaded");
  if (document.readyState === "complete") markLoaded(); else addEventListener("load", markLoaded, { once: true });
  addEventListener("scroll", markLoaded, { once: true, passive: true });

  // Hamburger — original .hamberger: body.layerOn turns the panel on in .5s, and on phone tapping a link in the panel closes it, then navigates after .7s
  const toggle = () => {
    const on = !body.classList.contains("is-layer");
    body.classList.toggle("is-layer", on);
    document.querySelectorAll(".az-burger").forEach((b) => b.classList.toggle("is-on", on));
  };
  document.querySelectorAll(".az-burger").forEach((b) => b.addEventListener("click", toggle));
  document.querySelectorAll(".az-layer a").forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || innerWidth >= 768) return;
    e.preventDefault();
    toggle();
    setTimeout(() => { location.href = href; }, 700);
  }));

  // Dropdown — devices without a mouse (tablet) open it by tapping
  if (!matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".az-gnav .has-sub > a").forEach((a) => a.addEventListener("click", () => {
      const li = a.parentElement, on = !li.classList.contains("is-open");
      document.querySelectorAll(".az-gnav .has-sub.is-open").forEach((x) => x.classList.remove("is-open"));
      li.classList.toggle("is-open", on);
    }));
  }

  // Accordion — original slideToggle(300) (jQuery swing)
  document.querySelectorAll("[data-acc]").forEach((box) => {
    const head = box.querySelector("[data-acc-head]"), panel = box.querySelector("[data-acc-panel]");
    if (!head || !panel) return;
    head.addEventListener("click", () => {
      const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { panel.style.height = open ? "auto" : "0px"; return; }
      gsap.fromTo(panel, { height: open ? 0 : panel.offsetHeight }, { height: open ? "auto" : 0, duration: 0.3, ease: "sine.inOut" });
    });
  });

  // Same-page anchor — original animate({scrollTop}, 800) swing, travels less by the header line height
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const y = to.getBoundingClientRect().top + scrollY - (innerWidth < 768 ? 120 : 150);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, y);
    const from = scrollY, t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 800); scrollTo(0, from + (y - from) * (0.5 - Math.cos(p * Math.PI) / 2)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
})();
