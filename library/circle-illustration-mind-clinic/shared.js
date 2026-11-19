// Loading curtain, left menu column, reservation circle, phone bottom band, footer and the redrawn illustration set shared by all pages. Motion uses the original CSS·jQuery values as is.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Illustration: speech-bubble mark · person · icon — navy lines plus fills from skin variables ──
  // If seat, sits on a round stool facing forward (+x) — turned with flip to face each other
  const person = ({ x = 0, y = 0, s = 1, flip = false, seat = false, top = "k-c1", low = "k-c2", hair = "k-h", arms = "" }) => `
    <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      ${seat
        ? `<path class="k-ln" d="M-36 236l-8 84M22 236l6 84M-40 290h64"/><rect class="k-w k-ln" x="-48" y="222" width="84" height="14" rx="7"/>
      <path class="k-w k-ln" d="M34 300q-2 14 10 16h26q6-8 0-16z"/>
      <path class="${low} k-ln" d="M-34 186h70q26 0 26 26v90h-26v-62h-70z"/>`
        : `<path class="k-w k-ln" d="M-30 300q-2 16 10 18h14q4-8 2-18zM8 300q-2 10 2 18h14q12-2 10-18z"/>
      <path class="${low} k-ln" d="M-34 192h68l-2 110h-26l-6-74-6 74h-26z"/>`}
      <path class="${top} k-ln" d="M-42 126q0-26 26-28h32q26 2 26 28l2 72h-88z"/>
      ${arms || `<path class="${top} k-ln" d="M-42 128q-14 30-10 74h14l4-58M42 128q14 30 10 74h-14l-4-58"/>`}
      <circle class="k-w k-ln" cx="0" cy="58" r="36"/>
      <path class="${hair} k-ln" d="M-37 58q-2-44 37-44 38 0 37 42-14-16-42-16-14 0-32 18z"/>
      <circle class="k-k" cx="-12" cy="64" r="3.4"/><circle class="k-k" cx="12" cy="64" r="3.4"/>
      <path class="k-ln" d="M-6 80q6 5 12 0"/>
    </g>`;
  const bubble = (dots = true) => `<path class="k-w k-ln" d="M18 30q0-12 12-12h4q4-15 16 0h28q12-15 16 0h4q12 0 12 12v34q0 12-12 12H46l-14 14 2-14h-4q-12 0-12-12z"/>${dots ? '<circle class="k-k" cx="46" cy="48" r="4.5"/><circle class="k-k" cx="60" cy="48" r="4.5"/><circle class="k-k" cx="74" cy="48" r="4.5"/>' : ""}`;
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <symbol id="mk-logo" viewBox="10 0 100 96"><circle class="k-a" cx="34" cy="26" r="9" opacity=".55"/>${bubble()}</symbol>
    <symbol id="mk-talk-a" viewBox="-80 0 160 330">${person({ seat: true, top: "k-c1", low: "k-c2", hair: "k-h2", arms: `<path class="k-c1 k-ln" d="M-42 128q-10 30 4 66h40l-2-16h-26l2-46M42 128q8 24 4 50h-12l-2-40"/>` })}</symbol>
    <symbol id="mk-talk-b" viewBox="-115 0 230 330">${person({ s: 1, seat: true, flip: true, top: "k-w", low: "k-c2", hair: "k-h", arms: '<path class="k-w k-ln" d="M-42 128q-22 20-30 52l14 8 18-34M42 128q14 30 10 74h-14l-4-58"/><path class="k-ln" d="M-10 98v60M10 98v60"/>' })}</symbol>
    <symbol id="mk-say-1" viewBox="0 0 152 128"><path class="k-w k-ln" d="M10 20q0-12 12-12h108q12 0 12 12v62q0 12-12 12H60l-26 24 4-24H22q-12 0-12-12z"/><circle class="k-k" cx="56" cy="51" r="5"/><circle class="k-k" cx="76" cy="51" r="5"/><circle class="k-k" cx="96" cy="51" r="5"/></symbol>
    <symbol id="mk-say-2" viewBox="0 0 128 91"><path class="k-a k-ln" d="M8 16q0-10 10-10h92q10 0 10 10v42q0 10-10 10H92l18 18-34-18H18q-10 0-10-10z"/><path class="k-ln" d="M54 28q0-8 10-8t10 8q0 6-10 9v5M64 52v1"/></symbol>
    <symbol id="mk-sleep" viewBox="0 0 249 448"><rect class="k-c2 k-ln" x="28" y="40" width="194" height="392" rx="40"/><rect class="k-w k-ln" x="48" y="58" width="154" height="92" rx="30"/><circle class="k-w k-ln" cx="125" cy="128" r="52"/><path class="k-h k-ln" d="M73 126q0-56 52-56t52 54q-22-22-52-20-28 0-52 22z"/><path class="k-ln" d="M104 140q8 5 14 0M134 140q8 5 14 0M118 160q7-4 14 0"/><path class="k-c1 k-ln" d="M40 186q85-24 170 0v212q0 22-22 22H62q-22 0-22-22z"/><path class="k-ln" d="M70 250h110M70 310h110M70 370h110"/><g transform="translate(150 6)"><circle class="k-w k-ln" cx="40" cy="40" r="32"/><path class="k-ln" d="M28 30h24l-24 22h24"/></g></symbol>
    <symbol id="mk-body" viewBox="-160 -10 395 369"><path class="k-c2 k-ln" d="M-150 330h300"/>${person({ x: 0, y: 0, s: 1, top: "k-c1", low: "k-c2", hair: "k-h", arms: '<path class="k-c1 k-ln" d="M-42 128q-26 10-18 40l50-22q4-10-4-18M42 128q14 30 10 74h-14l-4-58"/><circle class="k-w k-ln" cx="-14" cy="140" r="12"/>' })}<g class="k-ln"><path d="M60 40l14-10M66 62h18M60 84l14 10"/></g><path class="k-a k-ln" d="M-120 160q20-26 40 0t40 0" fill="none"/></symbol>
    <symbol id="mk-family" viewBox="-170 0 345 422">${person({ x: -55, y: 80, s: 1, top: "k-c1", low: "k-c2", hair: "k-w", arms: '<path class="k-c1 k-ln" d="M-42 128q-20 0-24 30l20 10 22-26M42 128q20 0 24 30l-20 10-22-26"/>' })}${person({ x: 70, y: 70, s: 1.02, top: "k-c3", low: "k-w", hair: "k-h2", arms: '<path class="k-c3 k-ln" d="M-42 128q-30 6-50 30l6 14 44-20M42 128q14 30 10 74h-14l-4-58"/>' })}<path class="k-ln" d="M-58 20q20-16 8-24-14-8-24 6 0 18 18 20 12 0 10 14-4 10-14 8"/></symbol>
    <symbol id="mk-talk" viewBox="-180 -10 364 348"><path class="k-c2 k-ln" d="M-150 230h70v100M-150 230v100M80 230h70v100M150 230v100"/>${person({ x: -110, y: 30, s: .78, seat: true, top: "k-w", low: "k-c2", hair: "k-h2" })}${person({ x: 110, y: 30, s: .78, seat: true, flip: true, top: "k-w", low: "k-c2", hair: "k-h", arms: '<path class="k-w k-ln" d="M-42 128q-26 0-40 -30l12-10 30 20M42 128q14 30 10 74h-14l-4-58"/>' })}<g transform="translate(-26 -6) scale(.7)">${bubble()}</g></symbol>
    <symbol id="mk-c1" viewBox="0 0 143 141"><rect class="k-c2 k-ln" x="14" y="44" width="114" height="90" rx="22"/><circle class="k-w k-ln" cx="66" cy="70" r="34"/><path class="k-h k-ln" d="M32 70q0-36 34-36t34 34q-14-14-34-12-18 0-34 14z"/><path class="k-ln" d="M50 78q6 4 10 0M72 78q6 4 10 0M60 94q6-3 12 0"/><path class="k-c1 k-ln" d="M18 104q50-14 106 0v26H18z"/><g transform="translate(96 4)"><circle class="k-w k-ln" cx="20" cy="20" r="18"/><path class="k-ln" d="M13 14h14l-14 13h14"/></g></symbol>
    <symbol id="mk-c2" viewBox="0 0 117 134"><path class="k-c1 k-ln" d="M10 128q2-38 48-38t50 38z"/><circle class="k-w k-ln" cx="58" cy="62" r="34"/><path class="k-h2 k-ln" d="M24 62q0-38 34-38t34 36q-16-16-34-14-18 0-34 16z"/><path class="k-ln" d="M42 66l10 4M74 66l-10 4M50 86q8-6 16 0M20 18l10 10M30 8l4 12M86 10l-6 12M100 22l-12 6"/></symbol>
    <symbol id="mk-c3" viewBox="0 0 108 146"><path class="k-c1 k-ln" d="M6 140q2-46 48-46t48 46z"/><circle class="k-w k-ln" cx="54" cy="60" r="34"/><path class="k-h k-ln" d="M20 60q0-38 34-38t34 36q-16-16-34-14-18 0-34 16z"/><path class="k-ln" d="M40 66h10M60 66h10M48 84q6-4 12 0"/><path class="k-c1 k-ln" d="M78 100q16 10 6 30l-24-12q-4-12 6-20z"/><circle class="k-w k-ln" cx="74" cy="104" r="9"/></symbol>
    <symbol id="mk-c4" viewBox="0 0 136 172"><path class="k-ln" d="M84 6v40M70 46h28v18H70z"/><path class="k-c3 k-ln" d="M16 166q2-50 52-50t52 50z"/><path class="k-c3 k-ln" d="M98 124q6-30-8-60l12-4q20 30 10 70z"/><circle class="k-w k-ln" cx="62" cy="80" r="32"/><path class="k-h2 k-ln" d="M30 80q0-36 32-36t32 34q-14-14-32-12-16 0-32 14z"/><path class="k-ln" d="M48 86q5 3 9 0M68 86q5 3 9 0M56 102q6-3 12 0"/></symbol>
    <symbol id="mk-train" viewBox="0 0 40 40"><rect class="k-wf" x="9" y="5" width="22" height="26" rx="5"/><rect class="k-ink-f" x="12" y="9" width="16" height="8" rx="2"/><circle class="k-ink-f" cx="15" cy="23" r="2"/><circle class="k-ink-f" cx="25" cy="23" r="2"/><path class="k-ws" d="M13 31l-4 6M27 31l4 6"/></symbol>
    <symbol id="mk-cal" viewBox="0 0 38 36"><rect class="k-ln" x="3" y="6" width="32" height="27" rx="3"/><path class="k-ln" d="M3 13h32M11 2v8M27 2v8M10 19h3M17 19h3M24 19h3M10 26h3M17 26h3"/></symbol>
  </defs></svg>`;
  body.insertAdjacentHTML("afterbegin", sprite);

  const NAV = [["home", "index.html", "TOP"], ["about", "about.html", "About the Hospital"], ["service", "service.html", "Treatment Guide"], ["disease", "#", "Conditions and Treatment"], ["news", "news.html", "Column"], ["access", "#", "Directions"], ["reserve", "#", "Booking info"]];
  const isHome = page === "home";
  const logo = `<a href="index.html" class="mk-logo" data-label="Speech-bubble logo mark + two-line clinic name + English name">
      <span class="mk-logo__mark"><svg viewBox="0 0 100 96" aria-hidden="true"><use href="#mk-logo"/></svg></span>
      <span class="mk-logo__name"><span class="mk-logo__l">Your neighborhood name here</span><span class="mk-logo__l">Mind Clinic Name</span><span class="mk-logo__en">Clinic Name In English</span></span>
    </a>`;
  const head = `<header class="mk-h ${isHome ? "is-home" : body.dataset.head === "top" ? "is-top" : "is-basic"}" data-slot="header">
    <div class="mk-h__in">
      ${logo}
      <button class="mk-openbtn" type="button" aria-label="Menu"><span></span><span></span></button>
      <nav class="mk-nav" id="mk-nav" data-slot="mobile-menu"><ul class="mk-nav__list">${NAV.map(([k, href, t]) => `<li><a href="${href}"${k === page ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul></nav>
      <dl class="mk-tel"><dt>Phone Booking / Inquiries</dt><dd><a class="mk-tel__num" href="#">tel.00-0000-0000</a><span class="mk-tel__note">Reservation only</span></dd></dl>
    </div>
  </header>`;
  const reserve = `<a href="#" class="mk-reserve"><svg viewBox="0 0 38 36" aria-hidden="true"><use href="#mk-cal"/></svg><span>WEB booking</span><span class="en">Reserve</span></a>`;
  const banner = `<div class="mk-banner" data-slot="contact-bar"><dl class="mk-tel"><dt>Phone Booking / Inquiries</dt><dd><a class="mk-tel__num" href="#">tel.00-0000-0000</a><span class="mk-tel__note">Complete<br>By reservation</span></dd></dl>${reserve}</div>`;
  const loader = `<div id="mk-loading" class="mk-loading" data-slot="loader"><div class="mk-loading__box"><div class="mk-loading__cat"><svg viewBox="0 0 100 96" aria-hidden="true"><use href="#mk-logo"/></svg></div><div class="mk-loading__text">${[..."Loading.."].map((c) => `<span>${c}</span>`).join("")}</div></div></div>`;
  const foot = `<footer class="mk-f" data-slot="footer"><div class="mk-f__in">
      <div class="mk-f__box">
        <div class="mk-f__logo"><svg viewBox="0 0 100 96" aria-hidden="true"><use href="#mk-logo"/></svg></div>
        <div class="mk-f__info">
          <a href="index.html" class="mk-f__title" data-label="Hospital name on one line + English name"><span>Your neighborhood mental clinic name here</span><span class="en">Clinic Name In English</span></a>
          <p class="mk-f__addr">〒000-0000 Your one-line address here · Building Name, 0F</p>
          <p class="mk-f__telfax"><a class="tel" href="#">tel.00-0000-0000</a><span class="fax">fax.00-0000-0000</span></p>
          <ul class="mk-f__nav">${NAV.map(([, href, t]) => `<li><a href="${href}">${t}</a></li>`).join("")}</ul>
        </div>
      </div>
      <p class="mk-f__copy">© Clinic Name In English. All Rights Reserved.</p>
    </div></footer>`;

  // The loading curtain must cover from the first paint, so it goes at the very start of the html — only the missing one (the one pulled out) is attached here
  body.insertAdjacentHTML("afterbegin", (document.getElementById("mk-loading") ? "" : loader) + head);
  const main = document.querySelector("main");
  main.insertAdjacentHTML("afterend", foot + banner + (isHome ? "" : `<div class="mk-reserve-fixed">${reserve}</div>`));

  // Logo name letters: the original fades each stroke group of the name image over 1.5s, .5s each with .06s spacing
  let n = 0;
  document.querySelectorAll(".mk-h .mk-logo__l, .mk-h .mk-logo__en").forEach((line) => {
    line.innerHTML = [...line.textContent].map((c) => (c.trim() ? `<span style="animation-delay:${n < 10 ? (0.5 + 0.06 * n).toFixed(2) : 0}s" data-n="${n++}">${c}</span>` : " ")).join("");
  });

  // Loading curtain — original base.js: after window load, jQuery fadeOut() (400ms swing)
  const $ = window.jQuery;
  addEventListener("load", () => {
    if (reduce) { document.getElementById("mk-loading").style.display = "none"; return; }
    $("#mk-loading").fadeOut();
  });

  // Phone menu — original basic.js: button active toggle + panel fadeToggle(400ms)
  $(".mk-openbtn").on("click", function () {
    $("#mk-nav").fadeToggle(reduce ? 0 : 400);
    $(this).toggleClass("active");
    $("body").toggleClass("nav-open");
  });

  // Scroll reveal — original idx.js: adds the class when the point 50px above the element enters the bottom of the screen, and removes it when it leaves (runs again when scrolling back down)
  const anim = () => {
    const sy = scrollY, wh = innerHeight;
    const each = (sel, cls) => document.querySelectorAll(sel).forEach((el) => {
      const top = el.getBoundingClientRect().top + sy - 50;
      el.classList.toggle(cls, sy >= top - wh);
    });
    each(".smoothTextTrigger", "smoothTextAppear");
    each(".fadeInTrigger", "fadeIn");
    each(".fadeUpTrigger", "fadeUp");
  };
  if (reduce) document.querySelectorAll(".fadeInTrigger,.fadeUpTrigger").forEach((el) => el.classList.add("is-still"));
  else {
    addEventListener("scroll", anim, { passive: true });
    addEventListener("load", anim);
  }

  window.kfMk = { reduce, page };
})();
