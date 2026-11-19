// All pages use one shared set of header, drawer, search band and footer — the placeholders (data-kz-shared) are filled in here.
// The hand feel is done with the same jQuery behavior as the original (slideToggle 300 · animate 1000 swing), magnific-popup and Lenis 1.0.18 defaults.
(() => {
  const PAGE = document.body.dataset.page || "home";
  const IS_HOME = PAGE === "home";
  const home = (hash) => (IS_HOME ? hash : "index.html" + hash);

  const icon = {
    globe: '<svg class="kz-lang__globe" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1"><circle cx="10" cy="10" r="8.5"/><ellipse cx="10" cy="10" rx="3.6" ry="8.5"/><path d="M1.5 10h17M3 5.5h14M3 14.5h14"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.3 5.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M14 2h3.2c.3 2.4 1.9 4 4.3 4.2v3.3c-1.6 0-3.1-.5-4.3-1.3V16a6 6 0 1 1-6-6h.6v3.3H11a2.7 2.7 0 1 0 2.7 2.7V2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M3 6.5C3 5 4.2 4 5.6 4h12.8C19.8 4 21 5 21 6.5v11c0 1.5-1.2 2.5-2.6 2.5H5.6C4.2 20 3 19 3 17.5v-11zM10 8.5v7l6-3.5-6-3.5z"/></svg>',
    cart: '<svg viewBox="0 0 24 20" stroke-width="1.2"><path d="M1 2h3l2.6 11h12.2L21.5 5H6"/><circle cx="8.5" cy="17" r="1.4"/><circle cx="17" cy="17" r="1.4"/></svg>',
  };
  const sns = (cls) => `<div class="${cls}"><p class="kz-sns__en">Follow Me</p><ul>
    <li><a href="#" class="kz-sns__a" aria-label="Photo SNS">${icon.ig}</a></li>
    <li><a href="#" class="kz-sns__a" aria-label="Short video SNS">${icon.note}</a></li>
    <li><a href="#" class="kz-sns__a" aria-label="Video channel">${icon.play}</a></li></ul></div>`;
  const nav = [
    ["Guest room", "stay.html", "Stay"],
    ["Meal", home("#cuisine"), "Cuisine"],
    ["Within jurisdiction", home("#facilities"), "Facilities"],
    ["Sauna", home("#sauna"), "Sauna"],
    ["Directions", home("#links"), "Access"],
    ["Frequently asked questions", home("#links"), "Faq"],
    ["News", "news.html", "News"],
    ["Inquiry", "#kz-foot", "Contact"],
  ];
  const headInner = (fixed) => `<div class="kz-head__wrp">
      <div class="kz-head__left">
        <a class="kz-logo" href="index.html" data-label="Stay wordmark · diagonal slash between two brush-written characters · white line"><span class="kz-logo__mark">Brand<i>/</i>Inn</span></a>
        ${fixed ? "" : '<h2 class="kz-head__tag">In the forest, a world for two.</h2>'}
      </div>
      <div class="kz-head__right">
        <nav class="kz-gnav kz-pc"><ul>${nav.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></nav>
        <div class="kz-lang">${icon.globe}<dl><dt class="kz-acc">Language</dt><dd><ul>
          <li><a href="#">Japanese</a></li><li><a href="#">English</a></li><li><a href="#">Korean</a></li><li><a href="#">简体中文</a></li><li><a href="#">繁體中文</a></li>
        </ul></dd></dl></div>
        <p class="kz-ptn1 kz-pc"><a class="kz-modal-open noscroll" href="#kz-usage">Before you use</a></p>
        <p class="kz-ptn1 kz-ptn1--cv kz-pc"><a href="#kz-search">Vacancy search</a></p>
        <div class="kz-menu-btn"><button type="button"><span class="kz-menu-btn__t">Menu</span><span class="kz-menu-btn__dots"><span></span><span></span><span></span></span></button></div>
      </div>
    </div>`;

  const addr = (logo) => `<div class="kz-addr">${logo ? '<a class="kz-foot__logo kz-logo" href="index.html"><span class="kz-logo__mark">Brand<i>/</i>Inn</span></a>' : ""}
      <p class="kz-addr__name">Region name hot spring inn name</p>
      <p class="kz-addr__add">〒000-0000 Your lodging address goes here on one line</p>
      <p class="kz-addr__call">TEL.<b>00-0000-0000</b><small>(Phone reception 11:00~18:00)</small></p>
    </div>`;
  const shop = `<div class="kz-shop"><a href="#">${icon.cart}Official online shop</a></div>`;
  const rec = `<ul class="kz-rec"><li><a href="#">Stay Terms</a></li><li><a href="#">Hiring Info</a></li><li><a href="#">Company overview</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Customer service policy</a></li></ul>`;

  const parts = {
    head: `<header class="kz-head" data-slot="header">${headInner(false)}</header>`,
    foot: `<p class="kz-top"><a href="#kz-page"><span class="kz-sr">Page up</span><span class="kz-top__en">Back<br>to<br>top</span></a></p>
    <div class="kz-search" id="kz-search" data-slot="search-band">
      <div class="kz-search__row">
        <h2 class="kz-vt kz-vt--20"><span class="kz-vt__jp">Vacancy search</span><span class="kz-vt__en">Search</span></h2>
        <form onsubmit="return false">
          <dl class="kz-search__date"><dt><label for="kz-date">Stay date</label></dt>
            <dd><span class="kz-search__caret" style="flex:1"><input type="text" id="kz-date" readonly></span>
              <label class="kz-search__nodate"><input type="checkbox" class="kz-nodate">Date TBD</label></dd></dl>
          <dl class="kz-search__sel"><dt><label for="kz-nights">Nights count</label></dt><dd class="kz-search__caret"><select id="kz-nights">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option>${n}Gourd</option>`).join("")}</select></dd></dl>
          <dl class="kz-search__sel"><dt><label for="kz-adult">Adult</label></dt><dd class="kz-search__caret"><select id="kz-adult"><option>1 person</option><option selected>2 people</option></select></dd></dl>
          <button type="submit">Search</button>
        </form>
        <p class="kz-search__plan"><a href="#">Lodging Plan List</a></p>
      </div>
      <div class="kz-search__links">
        <p class="kz-search__lnk"><a href="#">Check, change or cancel a booking</a></p>
        <p class="kz-search__lnk"><a href="#">Member Login</a></p>
        <p class="kz-search__lnk"><a href="#">Vacancy calendar</a></p>
        <p><a class="kz-more kz-more--bare kz-modal-open noscroll" href="#kz-usage"><span class="kz-more__jp">Before you use</span></a></p>
        <p class="kz-search__call">Reception 11:00~18:00<b>TEL.00-0000-0000</b></p>
      </div>
    </div>
    <footer class="kz-foot" id="kz-foot" data-slot="footer">
      <div class="kz-foot__bg wf-img" data-label="Forest trail photo · blue evening light, lantern glow along the path · full-width landscape"></div>
      <div class="kz-foot__wrp">
        <div class="kz-foot__in">
          <a class="kz-foot__contact" href="#"><span class="kz-vt kz-vt--20 kz-vt--center"><span class="kz-vt__jp">Contact Us</span><span class="kz-vt__en">Contact</span></span></a>
          ${addr(true)}
          ${shop}${rec}
        </div>
        ${sns("kz-sns kz-sns--foot")}
      </div>
      <p class="kz-foot__copy">© 0000–0000 Inn Name.</p>
      <ul class="kz-foot__groups">
        <li><span class="wf-img" data-label="Group logo 1"></span></li><li><span class="wf-img" data-label="Group logo 2"></span></li>
        <li><span class="wf-img" data-label="Group logo 3"></span></li><li><span class="wf-img" data-label="Group logo 4"></span></li>
      </ul>
    </footer>`,
    over: `<header class="kz-headfix" aria-hidden="true">${headInner(true)}</header>
    <div class="kz-drawer" data-slot="menu-drawer"><div class="kz-drawer__in">
      <p class="kz-drawer__close"><button type="button"><i></i><span>Close</span></button></p>
      <nav><ul>${[["First", "index.html", ""]].concat(nav.slice(0, 7)).map(([t, h, e]) => `<li><a href="${h}"><span class="kz-drawer__jp">${t}</span>${e ? `<span class="kz-drawer__en">${e}</span>` : ""}</a></li>`).join("")}</ul></nav>
      <div class="kz-sns-row"><p class="kz-sns__en" style="writing-mode:horizontal-tb">Follow Me</p><ul>
        <li><a href="#">${icon.ig}</a></li><li><a href="#">${icon.note}</a></li><li><a href="#">${icon.play}</a></li></ul></div>
      ${addr(false)}${shop}${rec}
    </div></div>
    <div class="kz-drawer-veil"></div>
    <div class="kz-spnav"><nav><ul>
      <li><a href="#kz-foot">Inquiry</a></li><li><a href="#kz-search">Vacancy search</a></li><li><a class="kz-modal-open noscroll" href="#kz-usage">Before you use</a></li>
    </ul></nav></div>
    <section id="kz-usage" class="kz-usage mfp-hide" data-slot="modal-before-usage">
      <svg class="kz-usage__tree" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" fill="currentColor" aria-hidden="true">
        <path d="M80 700c40-160 30-300 70-430 18 120 10 260 40 430zM150 270c-60-40-130-30-170 0 60-10 110 0 170 20zm0-40c-30-70-90-110-150-110 60 30 100 70 150 130zm10-30c20-70 70-120 140-140-50 40-90 90-120 160z"/>
        <path d="M980 700c30-180 20-330 60-470 14 140 6 290 36 470zm60-470c-50-60-120-80-190-60 70 0 130 30 190 80zm0-40c20-80 80-130 160-150-60 40-110 100-140 170zm-10 70c70-20 140 0 190 50-60-20-120-30-190-20z"/>
        <ellipse cx="160" cy="180" rx="150" ry="110" opacity="0.6"/><ellipse cx="1040" cy="150" rx="190" ry="130" opacity="0.6"/>
      </svg>
      <div class="kz-usage__in">
        <h2 class="kz-vt kz-vt--24"><span class="kz-vt__jp">Before you use</span><span class="kz-vt__en">Before Usage</span></h2>
        <p class="kz-usage__txt">Your usage guide goes here. Note what guests should know in advance, such as who may stay, how to reach the room and the on-site facilities.<br>
        The rooms sit on a hill a little away from the main building and are reached by a cart driven by staff. Note here any inconvenience for guests with mobility needs.<br>
        Add two more lines of body text here. Note that guests who need assistance should let us know when booking.</p>
        <p class="kz-usage__call">Reception 11:00~18:00<b>TEL.00-0000-0000</b></p>
        <p class="kz-usage__close"><a class="kz-modal-dismiss" href="#"><span class="kz-usage__x"></span>Close</a></p>
      </div>
    </section>`,
  };
  document.querySelectorAll("[data-kz-shared]").forEach((el) => { el.outerHTML = parts[el.dataset.kzShared] || ""; });
  document.querySelectorAll("[data-kz-sns]").forEach((el) => { el.outerHTML = sns("kz-sns"); });

  const $ = window.jQuery;
  const $w = $(window);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Stay-date field — fill in today’s date, and block the field if dates are undecided
  const d = new Date();
  const ymd = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  $(".kz-search__date input[type=text]").val(ymd);

  $(() => {
    // Entrance — like jquery.inview, checks every 250ms whether it is on screen and attaches once
    const rise = () => {
      const vh = innerHeight, vw = innerWidth;
      document.querySelectorAll(".kz-rise:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw) el.classList.add("is-in");
      });
    };
    if (reduce) document.querySelectorAll(".kz-rise").forEach((el) => el.classList.add("is-in"));
    else setInterval(rise, 250);

    // Fixed header / bottom strip on phones — once scrolled past 500px
    const fix = document.querySelector(".kz-headfix"), spnav = document.querySelector(".kz-spnav");
    const onScroll = () => {
      const on = window.scrollY > 500;
      fix.style.opacity = on ? "1" : "0"; fix.style.zIndex = on ? "15" : "-1";
      fix.classList.toggle("is-active", on); spnav.classList.toggle("is-active", on);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Pinned background — pins the video plate when the box top touches the screen top and its inner end is still visible
    document.querySelectorAll("[data-kz-fixbg]").forEach((box) => {
      const inner = box.querySelector("[data-kz-fixbg-in]");
      const cls = box.dataset.kzFixbg;
      let ticking = false;
      addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const a = box.getBoundingClientRect(), b = inner.getBoundingClientRect();
          box.classList.toggle(cls, a.top <= 0 && b.bottom > 0);
          ticking = false;
        });
      }, { passive: true });
    });

    // In-page links roll with a 1s swing
    $("a").not(".noscroll").on("click", function () {
      const href = $(this).attr("href") || "";
      if (href.charAt(0) !== "#" || href.length < 2) return;
      const $t = $(href);
      if (!$t.length) return;
      $("html, body").not(":animated").animate({ scrollTop: String($t.offset().top) }, reduce ? 0 : 1000, "swing");
      return false;
    });

    // Collapse — shared by the language list, facility list and archive
    $(".kz-acc").on("click", function () {
      const $n = $(this).next();
      if ($n.is(":animated")) return;
      $n.slideToggle(reduce ? 0 : 300).prev().toggleClass("is-active");
    });

    // Menu drawer
    const $drawer = $(".kz-drawer"), $veil = $(".kz-drawer-veil"), $btns = $(".kz-menu-btn");
    const closeMenu = () => {
      $veil.removeClass("is-active"); $drawer.removeClass("is-active"); $btns.removeClass("is-active");
      $("body").removeClass("is-hidden"); $(".kz-menu-btn__t").text("Menu");
    };
    $btns.on("click", function () {
      $(this).toggleClass("is-active");
      if ($(this).hasClass("is-active")) {
        $drawer.addClass("is-active"); $veil.addClass("is-active"); $("body").addClass("is-hidden"); $(".kz-menu-btn__t").text("Close");
      } else closeMenu();
    });
    $(".kz-drawer__close, .kz-drawer-veil").on("click", closeMenu);

    // Date — jQuery UI calendar (two months on PC, one on phone)
    const $date = $(".kz-search__date input[type=text]");
    $date.datepicker({
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthNamesShort: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNamesMin: ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"],
      dateFormat: "yy/mm/dd", nextText: "Next", prevText: "Previous", showOtherMonths: true, selectOtherMonths: true,
      firstDay: 0, showMonthAfterYear: true, yearSuffix: "Year", numberOfMonths: innerWidth <= 767 ? 1 : 2, minDate: "+0d",
    });
    $(".kz-nodate").on("change", function () { $date.prop("disabled", this.checked).parent().toggleClass("is-disabled"); });

    // Auto-advancing photos (fade) — original Splide 4.1.4 fade, every 3 seconds over 3 seconds
    document.querySelectorAll(".kz-fade-slider").forEach((el) => {
      new Splide(el, {
        type: "fade", rewind: true, pagination: true, autoplay: !reduce, interval: 3000, speed: 3000,
        pauseOnHover: false, pauseOnFocus: false, arrows: false,
      }).mount();
    });

    // Smooth scroll — Lenis defaults for PC·tablet only (original firstLoad hooks it 200ms after DOMContentLoaded)
    if (innerWidth > 767 && !reduce && window.Lenis) {
      setTimeout(() => {
        const lenis = new Lenis();
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }, 200);
    }
  });

  $w.on("load", () => {
    $(".kz-modal-open").magnificPopup({ type: "inline", preloader: false, mainClass: "mfp-fade", removalDelay: 300 });
    $(document).on("click", ".kz-modal-dismiss", (e) => { e.preventDefault(); $.magnificPopup.close(); });
  });
})();
