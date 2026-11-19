// Shared by all pages: header (logo, vertical-text menu, dropdown, CONTACT, MENU), menu drawer, contact band, footer insertion,
// First-visit loader (skipped from the second time in the same window), scroll reveal (.on), two kinds of parallax, flowing big text, FAQ fold, in-page navigation, line-shape icon playback.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const page = body.dataset.page;

  const SERVICES = ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Service 6", "Service 7"];
  const PROJECT = ["Progress guide 1", "Progress guide 2"];
  const NAV = [
    { href: "about.html", ko: "About", en: "ABOUT", key: "about" },
    { href: "list.html", ko: "Service", en: "SERVICE", key: "list", sub: true },
    { href: "index.html#approach", ko: "Work style", en: "APPROACH" },
    { href: "index.html#works", ko: "Track record", en: "WORKS" },
    { href: "index.html#news", ko: "News", en: "NEWS" },
    { href: "contact.html", ko: "Inquiry", en: "CONTACT", key: "contact" },
  ];
  const current = (n) => n.key === page || (n.key === "list" && page === "detail");
  const subList = (cls = "") =>
    `<ul${cls}>${SERVICES.map((s) => `<li><a href="detail.html">${s}</a></li>`).join("")}</ul>`;
  const projList = (cls = "") => `<ul${cls}>${PROJECT.map((s) => `<li><a href="list.html#project">${s}</a></li>`).join("")}</ul>`;
  const SNS = `<a class="lw-sns" href="#" aria-label="SNS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r=".9" fill="currentColor" stroke="none"/></svg></a>`;
  const MARK = `<span class="lw-mark">STUDIO NAME</span>`;

  const header = document.querySelector(".lw-header");
  if (header) {
    header.innerHTML = `
      <p class="lw-header__logo"><a href="index.html" aria-label="To the first page">${MARK}</a></p>
      <p class="lw-contact en"><a href="contact.html">CONTACT</a></p>
      <button class="lw-trigger" type="button" aria-label="Open Menu"><span class="bar"></span><span class="bar"></span><span class="lw-trigger__txt">MENU</span></button>
      <nav class="lw-gnav min" aria-label="Main menu"><ul>
        ${NAV.map((n) => n.sub
          ? `<li class="lw-gnav__item is-dd${current(n) ? " is-current" : ""}"><a href="${n.href}"><span>${n.ko}</span></a>
              <div class="lw-gnav__sub"><p class="en">SERVICE</p>${subList()}<p class="en">PROJECT INFORMATION</p>${projList()}</div></li>`
          : `<li class="lw-gnav__item${current(n) ? " is-current" : ""}"><a href="${n.href}">${n.ko}</a></li>`).join("")}
      </ul></nav>
      <div class="lw-drawer" data-slot="menu-drawer"><div class="lw-drawer__in"><nav aria-label="Full menu">
        <div class="lw-drawer__main"><ul class="min">
          <li class="lw-drawer__item"><a href="index.html">First Page<span class="en">TOP</span></a></li>
          ${NAV.map((n) => `<li class="lw-drawer__item"><a href="${n.href}">${n.ko}<span class="en">${n.en}</span></a>${n.sub ? `
            <div class="lw-drawer__sub">
              <div class="lw-drawer__subrow"><p class="en">SERVICE</p>${subList()}</div>
              <div class="lw-drawer__subrow"><p class="en">PROJECT<br class="lw-pc">INFORMATION</p>${projList()}</div>
            </div>` : ""}</li>`).join("")}
        </ul></div>
        <div class="lw-drawer__side"><ul class="min"><li>${SNS}</li><li><a href="#">Privacy policy</a></li></ul></div>
      </nav></div></div>`;
  }

  const cta = document.querySelector("[data-cta]");
  if (cta) {
    cta.innerHTML = `<div class="lw-wrap">
      <div><p class="en-ttl en">CONTACT</p><h2 class="ttl min r-blur">Your invitation to build together here<br class="lw-sp"> A one-line title,<br>Set in two lines.</h2></div>
      <div><p class="lw-cta__lead">Your one line goes here on what you offer consultation for. List cases such as new builds, fixes, company profiles, branding and recruiting pages.<br class="lw-pc">
        Your one line here asking people to share only what’s set, such as budget and release timing.</p>
        <p class="lw-pill"><a href="contact.html"><span class="lw-roll">Your contact button text here</span><span class="lw-arrow"></span></a></p>
        <ul>${SERVICES.slice(0, 5).map((s) => `<li><a href="detail.html">${s}</a></li>`).join("")}</ul>
      </div></div>`;
  }

  const footer = document.querySelector(".lw-footer");
  if (footer) {
    footer.innerHTML = `<div class="lw-wrap"><div class="lw-footer__col">
      <ul class="lw-footer__nav">
        <li><a href="index.html">First Page</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="list.html">Service</a>
          <dl><dt>SERVICE</dt><dd>${subList()}</dd></dl>
          <dl><dt>PROJECT<br>INFORMATION</dt><dd>${projList()}</dd></dl></li>
        <li><a href="index.html#approach">Work style</a></li>
        <li><a href="index.html#works">Track record</a></li>
        <li><a href="index.html#news">News</a></li>
        <li><a href="contact.html">Inquiry</a></li>
      </ul>
      <div class="lw-footer__info">
        <p class="lw-footer__logo"><a href="index.html" aria-label="To the first page">${MARK}</a></p>
        <p class="lw-footer__txt">Your where and what you do here<br>Set in two lines: is it a studio?</p>
        <p class="lw-btn is-wht"><a href="contact.html"><span class="lw-roll en">CONTACT</span><span class="lw-arrow"></span></a></p>
        <p class="lw-footer__addr">〒000-0000 One line of your address here<br>TEL：00-0000-0000</p>
        <ul class="lw-footer__btm"><li>${SNS}</li><li><a href="#">Privacy policy</a></li></ul>
        <p class="lw-copy en">© STUDIO NAME.</p>
      </div>
    </div></div>`;
  }

  // Loader: on the first visit the logo rises at .2s, and after everything is loaded the curtain and logo spread and lift at .5s, with the body turning on 1.2s later
  const loader = document.querySelector(".lw-loader");
  const KEY = "lw-access";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = () => body.classList.add("is-motion");
  if (reduce || sessionStorage.getItem(KEY)) {
    loader?.classList.add("is-off");
    setTimeout(start, 50);
  } else {
    sessionStorage.setItem(KEY, "1");
    const logo = loader?.querySelector(".lw-loader__logo");
    setTimeout(() => logo?.classList.add("is-on"), 200);
    const off = () => setTimeout(() => {
      loader?.querySelector(".lw-loader__bg").classList.add("is-off");
      logo?.classList.add("is-off");
      setTimeout(start, 1200);
      setTimeout(() => loader?.classList.add("is-off"), 2000);
    }, 500);
    if (document.readyState === "complete") off(); else addEventListener("load", off);
  }
  addEventListener("pageshow", (e) => { if (e.persisted) { loader?.classList.add("is-off"); start(); } });

  const trigger = document.querySelector(".lw-trigger");
  trigger?.addEventListener("click", () => {
    const open = body.classList.toggle("is-open");
    trigger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  });
  document.querySelectorAll(".lw-drawer a").forEach((a) => a.addEventListener("click", () => body.classList.remove("is-open")));
  const dd = document.querySelector(".lw-gnav__item.is-dd");
  dd?.addEventListener("mouseenter", () => body.classList.add("is-dd"));
  dd?.addEventListener("mouseleave", () => body.classList.remove("is-dd"));

  // FAQ: same jQuery slideToggle as the original (default .4s swing)
  $(".lw-faq__q").on("click", function () {
    const open = $(this).toggleClass("is-ac").hasClass("is-ac");
    this.setAttribute("aria-expanded", open);
    $(this).next().stop(true, true).slideToggle(reduce ? 0 : 400);
  });

  // In-page move: same as the original jQuery animate .8s easeInOutCubic (jquery.easing 1.3)
  const scrollToEl = (t) => $("html, body").stop().animate({ scrollTop: $(t).offset().top }, reduce ? 0 : 800, "easeInOutCubic");
  $('a[href^="#"]').on("click", function (e) {
    const id = this.getAttribute("href").slice(1);
    // Placeholder links (#) are blocked so they don’t jump to the top
    if (!id) return e.preventDefault();
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    scrollToEl(t);
  });
  // When entering via # from elsewhere, wait .8s after everything loads, then go to that spot
  if (location.hash.length > 1) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) $(window).on("load", () => setTimeout(() => scrollToEl(t), 800));
  }

  // Line-shape icons spin only when at least 18% is visible on screen
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-inview", e.isIntersecting)), { threshold: 0.18 });
  document.querySelectorAll(".lw-icon").forEach((el) => io.observe(el));

  ScrollTrigger.create({ start: 150, end: "max", toggleClass: { targets: body, className: "is-scrolled" } });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.documentElement.classList.add("lw-reduced");
    document.querySelectorAll(".r-fade, .r-blur, .r-up, .r-list, .r-lines, .lw-sec-ttl, .lw-line").forEach((el) => el.classList.add("on"));
    return () => document.documentElement.classList.remove("lw-reduced");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Entrance: the original turns it on once scroll position passes (element top - screen height + screen/8) = When the element top touches the 87.5% line of the screen. Line and title at 95%.
    const reveal = (sel, start) => gsap.utils.toArray(sel).forEach((el) => ScrollTrigger.create({
      trigger: el, start: `top ${start}%`, once: true, onEnter: () => el.classList.add("on"),
    }));
    reveal(".r-fade, .r-blur, .r-up, .r-list", 87.5);
    reveal(".r-lines, .lw-sec-ttl, .lw-line", 95);

    // Parallax 1 (.lw-px): the photo cell moves up an extra (element top - viewport height) × .10
    // Parallax 2 (.lw-pximg): the photo inside the cell is ((element top - screen height) + screen × .8) × -.15 (phone -.08)
    const pxs = gsap.utils.toArray(".lw-px");
    const pximgs = gsap.utils.toArray(".lw-pximg");
    const parallax = () => {
      const wh = innerHeight;
      const k = innerWidth <= 767 ? -0.08 : -0.15;
      pxs.forEach((el) => gsap.set(el.firstElementChild, { y: (el.getBoundingClientRect().top - wh) * 0.1 }));
      pximgs.forEach((el) => gsap.set(el.firstElementChild, { y: (el.getBoundingClientRect().top - wh + wh * 0.8) * k }));
    };
    parallax();
    addEventListener("scroll", parallax, { passive: true });
    addEventListener("resize", parallax);

    // Flowing big text: target x from the ratio p of the cell passing the screen = 100 - p × 600, follows at 8% per frame
    const marquees = gsap.utils.toArray(".lw-flow").map((wrap) => ({ wrap, text: wrap.firstElementChild, cur: 100 }));
    const flow = () => {
      const wh = innerHeight;
      marquees.forEach((m) => {
        const r = m.wrap.getBoundingClientRect();
        const p = gsap.utils.clamp(0, 1, (wh - r.top) / (wh + r.height));
        m.cur += (100 - p * 600 - m.cur) * 0.08;
        m.text.style.transform = `translate3d(${m.cur}px,0,0)`;
      });
    };
    if (marquees.length) gsap.ticker.add(flow);

    return () => {
      removeEventListener("scroll", parallax);
      removeEventListener("resize", parallax);
      gsap.ticker.remove(flow);
    };
  });

  // Fonts change the height after loading, so re-measure the reveal lines
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.lwMotion = { mm, reduce };
})();
