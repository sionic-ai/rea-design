// Inserts the shared frame of the two layers, landing (body.kw-landing) and corporate site (body.kw-corp), in one place.
// Landing: window-light background · gold strings (revealed from the top with scroll scrub 2) · pill nav up/down transition · stand when visible · modal · store locator footer. Lenis lerp .1 (pc).
// Company: red-line header, mega dropdown, PICK UP (bxSlider), six-column footer, back to top — built with jQuery 1.7.2 like the original.
(() => {
  const body = document.body;
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrow = '<svg viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h11M7 1l4 4-4 4"/></svg>';
  window.kwArrow = arrow;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });

  const tryHTML = (cls) => `<a class="kw-try ${cls}" href="product.html"><span class="kw-try__in kw-hover"><span class="kw-try__s">Find Nearest Store/</span><span class="kw-try__l">Demo</span><svg class="kw-try__arr" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 6h15M10 1l5 5-5 5"/></svg></span></a>`;
  window.kwTry = tryHTML;

  const reveal = () => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains("kw-items")) {
        [...e.target.children].forEach((c, i) => setTimeout(() => c.classList.add("is-in"), i * 150));
      } else e.target.classList.add("is-in");
      io.unobserve(e.target);
    }), { rootMargin: "-200px 0px", threshold: 0 });
    document.querySelectorAll(".kw-in, .kw-items").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));
    if (reduce) document.querySelectorAll(".kw-items > *").forEach((c) => c.classList.add("is-in"));
  };

  const modals = () => {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-modal]");
      if (t) {
        e.preventDefault();
        const m = document.getElementById(t.dataset.modal);
        if (!m) return;
        m.classList.add("is-active");
        window.kwLenis && window.kwLenis.stop();
        return;
      }
      const c = e.target.closest(".kw-modal__close, .kw-modal__overlay");
      if (c) {
        c.closest(".kw-modal").classList.remove("is-active");
        window.kwLenis && window.kwLenis.start();
      }
    });
    addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".kw-modal.is-active").forEach((m) => m.classList.remove("is-active"));
      window.kwLenis && window.kwLenis.start();
    });
  };

  // ─────────── Landing ───────────
  if (body.classList.contains("kw-landing")) {
    const pill = (pos) => `<div class="kw-cv__bar kw-cv__bar--${pos}"><p class="kw-cv__links"><a href="#series-1">Series One</a><a href="#series-2">Series Two</a><a href="#series-3">Series Three</a></p><a class="kw-cv__try kw-hover" href="product.html">Demo</a></div>`;
    // Golden string bundle: four curves traced exactly along the original artwork’s path (page coordinates, 1440 wide) plus a sparkle dotted line
    const melodyPath = "M330 560 C120 800 40 1000 90 1300 S500 2200 900 2450 S1390 2700 1330 3000 S700 3600 320 3850 S40 4300 70 4800 S150 5300 230 5460";
    const strings = [0, 7, 15, 26].map((dx, i) =>
      `<path d="${melodyPath}" transform="translate(${dx} ${i * 4})" stroke-width="${[1.6, 1.1, .9, 1.3][i]}" stroke-opacity="${[.9, .7, .55, .45][i]}" fill="none"/>`).join("") +
      `<path d="${melodyPath}" transform="translate(34 14)" class="is-spark" stroke-width="2.2" stroke-dasharray="1 4" stroke-linecap="round" stroke-opacity=".7" fill="none"/>`;

    body.insertAdjacentHTML("afterbegin", `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="kw-ghost-grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".5"/></filter></svg>
      <div class="kw-melody" data-slot="gold-strings" aria-hidden="true"><svg viewBox="23 564 1371 4896" preserveAspectRatio="none">${strings}</svg></div>
      <div class="kw-cv" data-slot="pill-nav">${pill("top")}${pill("bottom")}</div>
      <div class="kw-light" aria-hidden="true"><div class="kw-light__a"></div><div class="kw-light__b"></div></div>
      <div class="kw-grain" aria-hidden="true"></div>`);

    const foot = document.querySelector('footer[data-slot="footer"]');
    if (foot) {
      foot.classList.add("kw-foot");
      foot.innerHTML = `
      <div class="kw-foot__bg kw-cap-low"><div class="wf-img kw-dark-img" data-label="Keyboard diagonal close-up · almost black on top, white keys emerge blurred in front toward the bottom · whole footer background · generous height"></div></div>
      <svg class="kw-foot__strings" viewBox="0 0 4429 2566" fill="none" aria-hidden="true"><path d="M0 1900 C900 1500 1300 1050 1500 900 S2000 330 2200 200 S2900 -20 4429 -40" stroke-width="5" stroke-opacity=".85"/><path d="M0 1930 C900 1530 1320 1080 1520 930 S2020 360 2220 230 S2920 10 4429 -10" stroke-width="3" stroke-opacity=".6"/><path d="M0 1970 C900 1570 1340 1120 1540 970 S2040 400 2240 270 S2940 50 4429 30" class="is-spark" stroke-width="7" stroke-dasharray="2 9" stroke-linecap="round" stroke-opacity=".7"/></svg>
      <section class="kw-store" data-slot="store-search">
        <div class="kw-store__inner kw-in">
          <div style="position:relative"><span class="kw-ghost kw-ghost--dark kw-store__ghost">store</span><h2 class="kw-store__ttl kw-ttl">Find a store</h2></div>
          <p class="kw-store__desc">You can try it in person at a nearby showroom.<br>Staff also guide you step by step through any worries or questions before you buy.<br>Feel the ”expression of sound” that a catalog can’t convey, with your fingertips.</p>
          <a class="kw-store__try" href="product.html"><span class="kw-try__s">Find Nearest Store/</span><span class="kw-try__l">Demo</span><svg class="kw-try__arr" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 6h15M10 1l5 5-5 5"/></svg></a>
          <div class="kw-store__links">
            <a class="kw-btn kw-store__link" href="#"><span>Phone inquiries (000-000-0000)<small>Your company name, department name here<br>Reception hours 0:00～0:00 (excluding weekends and holidays)</small></span></a>
            <a class="kw-btn kw-store__link" href="#"><span>Catalog request · web inquiry</span><span class="kw-btn__arrow">${arrow}</span></a>
          </div>
          <p class="kw-store__company"><a href="product.html">Company info</a> | <a href="article.html">Product · Service site</a></p>
        </div>
      </section>
      <div class="kw-foot__end kw-in" data-slot="end-copy">
        <div class="kw-foot__txt kw-ttl"><span>This piano</span><span>It becomes your voice.</span></div>
        <div class="kw-foot__logo">LOGO</div>
        <p class="kw-foot__cr">© Your company name here. All Rights Reserved.</p>
      </div>`;
    }

    const lineupBoxes = [...document.querySelectorAll("[data-cv-top]")];
    const cvOpen = document.querySelector("[data-cv-open]");
    const cvClose = document.querySelector("[data-cv-close]");
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    let openY = 0, closeY = 0, ranges = [];
    const measure = () => {
      openY = cvOpen ? top(cvOpen) : 0;
      closeY = cvClose ? top(cvClose) : Infinity;
      ranges = lineupBoxes.map((b) => [top(b), top(b) + b.offsetHeight]);
    };
    const update = () => {
      const bottom = scrollY + innerHeight, center = scrollY + innerHeight / 2;
      root.classList.toggle("is-cv", bottom >= openY && bottom < closeY);
      root.classList.toggle("is-cv-top", ranges.some(([a, b]) => a <= center && center < b));
    };
    let raf = 0;
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { update(); raf = 0; }); }, { passive: true });
    addEventListener("resize", () => { measure(); update(); });
    addEventListener("load", () => { measure(); update(); ScrollTrigger.refresh(); });
    measure(); update();

    const mm = gsap.matchMedia();
    mm.add({ pc: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { pc, motion } = ctx.conditions;
      // Same Lenis 1.3.3 as the original, same settings — runs its own rAF (autoRaf) and ScrollTrigger follows via window scroll events
      if (pc && motion && window.Lenis) {
        const lenis = new Lenis({ lerp: 0.1, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: true });
        window.kwLenis = lenis;
        ctx.add(() => () => { lenis.destroy(); window.kwLenis = null; });
      }
      if (!motion) return;
      const mel = document.querySelector(".kw-melody");
      gsap.fromTo(mel, { maskSize: "100% 0%", webkitMaskSize: "100% 0%" }, { maskSize: "100% 100%", webkitMaskSize: "100% 100%", ease: "none", scrollTrigger: { trigger: mel, start: "top center", end: "bottom center", scrub: pc ? 2 : 4 } });
      // Original uses ease: "ease" — Not a GSAP name, so it runs on the default curve power1.out
      const fs = document.querySelector(".kw-foot__strings");
      if (fs) gsap.fromTo(fs, { "--mask": "100%" }, { "--mask": "0%", duration: pc ? 5 : 2, ease: "power1.out", scrollTrigger: { trigger: fs, start: "top bottom" } });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      document.querySelector(".kw-melody").style.maskSize = "100% 100%";
    });

    // Same-page anchors use 700ms swing (jQuery default) — with Lenis, the same length on top of it
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + scrollY;
      if (window.kwLenis) window.kwLenis.scrollTo(y, { duration: 0.7, easing: (p) => 0.5 - Math.cos(p * Math.PI) / 2 });
      else if (reduce) scrollTo(0, y);
      else animateTo(y);
    });
    const animateTo = (y) => {
      const from = scrollY, t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 700);
        scrollTo(0, from + (y - from) * (0.5 - Math.cos(p * Math.PI) / 2));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    reveal();
    modals();
  }

  // ─────────── Company site ───────────
  if (body.classList.contains("kw-corp")) {
    const NAV = [
      ["Product Info", ["Grand Piano", "Upright piano", "Digital piano", "Mini Piano", "App", "Church Organ", "Music software"]],
      ["Store Info", ["Find a Directly Operated Store", "Display store", "Demo Booking"], "product"],
      ["Music classroom", ["About the Classroom", "Course guide", "Experience Sign-up"]],
      ["PE Classroom", ["Course guide", "Find a Class", "Member guide"]],
      ["Event details", ["Concert Info", "Seminars · Courses", "Competition"]],
      ["Customer support", ["Piano purchase guide", "Tuning · Repair", "Apply for catalog", "Frequently asked questions"]],
      ["Articles & Videos", [], "article"],
    ];
    const page = body.dataset.page;
    const header = document.createElement("header");
    header.className = "kc-header";
    header.dataset.slot = "corp-header";
    header.innerHTML = `
      <div class="kc-header__top"><a class="kc-logo" href="index.html">LOGO</a><button class="kc-menu-btn" type="button" aria-label="Menu"><i></i></button></div>
      <div class="kc-header__bottom">
        <div class="kc-util"><a href="index.html">Company Site</a><a href="#">Corporate clients</a><span class="kc-search">Enter search term<svg viewBox="0 0 14 14" fill="none" stroke-width="1.6"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/></svg></span><span class="kc-sns">SNS <i></i></span></div>
        <nav class="kc-nav"><ul>${NAV.map(([t, items, key], i) => `
          <li class="kc-nav__t"><a href="${key ? key + ".html" : "index.html"}"${key === page ? ' class="is-here"' : ""}>${t}</a>${items.length ? `
            <div class="kc-nav__wp" style="--tip:${47 + i * 137}px"><div class="kc-nav__panel"><div class="kc-nav__ph"><div class="wf-img kw-mid-img" data-label="Category cover photo · Landscape"></div></div>${items.map((x) => `<a href="${key === "product" ? "product.html" : "index.html"}">${x}</a>`).join("")}</div></div>` : ""}</li>`).join("")}
        </ul></nav>
      </div>`;
    body.prepend(header);

    const foot = document.querySelector('footer[data-slot="footer"]');
    const pick = ["Special site for the new upright Product", "Soundproof room experience showroom", "Stories of study and piano", "Factory Tour Guide", "New digital piano", "Tuner interview"];
    const cols = [["Product Info", 13], ["Store Info", 5], ["Music classroom", 9], ["PE Classroom", 8], ["Event details", 6], ["Customer support", 12]];
    if (foot) foot.innerHTML = `
      <div class="kc-foot">
        <h2 class="kc-pick__ttl">PICK UP</h2>
        <div class="kc-pick" data-slot="pickup-slider">
          <ul class="kc-pick__track">${pick.map((p, i) => `<li class="kc-pick__item"><a href="#"><div class="wf-img ${["kw-warm-img", "kw-mid-img", "kw-cool-img"][i % 3]}" data-label="Banner ${i + 1} · Bold title text over product·event photo · width 303×214"></div><span class="kc-pick__t">${p}</span><span class="kc-pick__txt">Your two-line banner description here.</span></a></li>`).join("")}</ul>
        </div>
        <div class="kc-links"><div class="kc-links__in">${cols.map(([t, n]) => `<div class="kc-links__col"><b>${t}</b><ul>${Array.from({ length: n }, (_, k) => `<li><a href="#">Menu ${k + 1}</a></li>`).join("")}</ul></div>`).join("")}</div></div>
        <div class="kc-bottom"><div class="kc-bottom__in"><span>Privacy Policy ｜ Sitemap</span><small>© Your company name here. All Rights Reserved.</small></div></div>
      </div>`;
    body.insertAdjacentHTML("beforeend", '<a class="kc-pagetop" href="#" aria-label="Back to top"></a>');

    // The original company site uses jQuery 1.7.2 fadeIn·fadeOut·slideDown·slideUp (default 400ms swing) and bxSlider — load the same builds to get the same feel
    const $ = window.jQuery;
    if ($) {
      $.fx.off = reduce;
      // The original also ships jQuery UI 1.6, which turns swing into easeOutQuad (easing.def). 1.6 is not on npm, so only that one behaviour is ported.
      $.easing.swing = (p) => 1 - (1 - p) * (1 - p);
      $(header).find(".kc-nav__t").hover(
        function () { if ($(window).width() > 900) $(this).find(".kc-nav__wp").stop(true, true).fadeIn(); },
        function () { if ($(window).width() > 900) $(this).find(".kc-nav__wp").stop(true, true).fadeOut(); },
      );
      $(header).find(".kc-menu-btn").on("click", () => {
        if ($(window).width() >= 900) return;
        const open = !header.classList.contains("is-open");
        header.classList.toggle("is-open", open);
        $(header).find(".kc-header__bottom")[open ? "slideDown" : "slideUp"]();
      });
      $(".kc-links__col b").on("click", function () {
        if ($(window).width() >= 900) return;
        const col = $(this).parent(), ul = col.find("ul");
        if (ul.css("display") === "none") { ul.slideDown(); col.addClass("is-open"); }
        else { ul.slideUp(); col.removeClass("is-open"); }
      });
      // PICK UP: on pc it advances one slot at a time only when there are more than 3 items (li fixed at 303px), on phone 1 item — original 4.1.2 is not on npm, so this is the last 4.2 build.
      // 4.2 also accepts mouse drag (pointer) but 4.1.2 only took touch — enabled only on touch devices so it does not drag on desktop
      const w = $(window).width(), $pick = $(".kc-pick__track");
      if ($.fn.bxSlider && ((w > 900 && $pick.children().length > 3) || (w <= 900 && $pick.children().length > 1))) {
        $pick.bxSlider({ displaySlideQty: 6, moveSlideQty: 1, maxSlides: w > 900 ? 6 : 1, auto: false, pager: false, touchEnabled: "ontouchstart" in window, speed: reduce ? 0 : 500 });
      }
    }

    // Back to top: fadeIn after 150px, and it stops above the footer when touching it. On click, every 16ms it covers 1/9 of the remaining distance (original page-scroller style)
    const pt = document.querySelector(".kc-pagetop");
    const footBox = document.querySelector(".kc-foot");
    const place = () => {
      const st = scrollY, h = innerHeight, op = footBox.getBoundingClientRect().top + st - h;
      if (st > 150) {
        $ ? $(pt).fadeIn() : (pt.style.display = "flex");
        if (innerWidth > 900) { pt.style.position = "fixed"; pt.style.bottom = ""; pt.style.top = (st > op + 440 ? h + 290 - (st - op) : h - 152) + "px"; }
        else if (st - 280 > op) { pt.style.position = "absolute"; pt.style.top = "200px"; }
        else { pt.style.position = "fixed"; pt.style.top = "auto"; pt.style.bottom = "50px"; }
      } else $ ? $(pt).fadeOut() : (pt.style.display = "none");
    };
    addEventListener("scroll", place, { passive: true });
    addEventListener("resize", place);
    place();
    let timer = 0;
    pt.addEventListener("click", (e) => {
      e.preventDefault();
      clearTimeout(timer);
      if (reduce) return scrollTo(0, 0);
      let y = scrollY;
      const step = () => {
        const cur = scrollY;
        y += (0 - cur) / 9;
        if (y < 0) y = 0;
        if (Math.abs(cur) < 1) return scrollTo(0, 0);
        scrollTo(0, Math.ceil(y));
        timer = setTimeout(step, 16);
      };
      step();
    });
    reveal();
    modals();
  }
})();
