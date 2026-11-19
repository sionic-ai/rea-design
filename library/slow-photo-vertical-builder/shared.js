// Inserted here in one go so every page uses the same header, cover menu, contact strip and footer.
// Motion values are the original contents.js and top.js as is — lenis lerp .05, wheel 1.2x, header turns gray once past (screen height − 80px), case-study row swiper 1.455 slides · .6s.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LOGO = (cls) => `<svg class="${cls || ""}" viewBox="0 0 100 132" aria-hidden="true"><rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="currentColor" stroke-width="1"/><path d="M0.5 0.5 99.5 99.5" stroke="currentColor" stroke-width="1"/><text class="sm-logo__word" x="50" y="128" text-anchor="middle" fill="currentColor" textLength="98" lengthAdjust="spacing">NAME CO</text></svg>`;
  const ARROW = '<svg viewBox="0 0 6 8" aria-hidden="true"><path d="M1 0.8 4.6 4 1 7.2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const SNS = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1.5" y="1.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="15" cy="5" r="1" fill="currentColor"/></svg>';
  window.SM_ARROW = ARROW;

  // Original two menu rows and three footer rows — linked between our own pages
  const L = {
    CONCEPT: "about.html", EVENT: "event.html", INFO: "article.html", DESIGN: "about.html#design", SPEC: "about.html#three",
    SUPPORT: "about.html#design", WORKS: "works.html", VOICE: "detail.html", SHOWROOM: "index.html#model", RECRUIT: "about.html",
    COMPANY: "about.html", CONTACT: "event.html#reserve",
  };
  const li = (names, cls) => names.map((n) => `<li><a href="${L[n]}" class="${cls} e-font">${n}</a></li>`).join("");
  const ADDR = '<p class="sm-addr">(Postal) 00000 Put the address on one line here, 00 Building<br>TEL <a href="#">000-00-0000</a>／FAX <a>000-00-0000</a></p>';
  const ADDR_EN = '<p class="sm-addr-en">Building Name<br>0-00-00 Street Name, City Name, Region 000-0000<br>Country</p>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "sm-head" + (page === "home" ? "" : " is-page");
    head.innerHTML = `
      <a href="index.html" class="sm-logo" aria-label="First Page">${LOGO()}</a>
      <a href="event.html#reserve" class="sm-cta">Your contact button here</a>
      <div class="sm-menu" data-slot="menu" aria-hidden="true">
        <div class="sm-menu__wrap">
          <div class="sm-menu__in">
            <a href="index.html" class="sm-menu__logo" aria-label="First Page">${LOGO()}</a>
            <a href="event.html#reserve" class="sm-menu__cta">Your contact button here</a>
            <div class="sm-menu__block">
              <div class="sm-menu__u1">
                <div class="sm-menu__list"><ul>${li(["CONCEPT", "EVENT", "INFO", "DESIGN", "SPEC", "SUPPORT"], "sm-menu__item")}</ul><ul>${li(["WORKS", "VOICE", "SHOWROOM", "RECRUIT", "COMPANY", "CONTACT"], "sm-menu__item")}</ul></div>
                <div class="sm-menu__policy-pc"><a href="#" class="sm-policy e-font">PRIVACY POLICY</a></div>
              </div>
              <div class="sm-menu__u2">
                <div class="sm-menu__u2in">${ADDR}${ADDR_EN}<a href="#" class="sm-sns" aria-label="SNS">${SNS}</a></div>
                <div class="sm-copyrow"><div class="sm-menu__policy-sp"><a href="#" class="sm-policy e-font">PRIVACY POLICY</a></div><p class="sm-copy e-font">©NAME CO</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sm-toggle" role="button" tabindex="0" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "sm-foot is-dark";
    foot.innerHTML = `
      <div class="sm-contact" data-slot="contact-band">
        <div class="sm-contact__item">
          <div class="sm-contact__u1 wf-img" data-label="Close-up of a chair back · warm indoor light · landscape 16:9"></div>
          <div class="sm-contact__u2"><div class="sm-contact__u2in">
            <div class="sm-contact__tw"><p class="sm-contact__title"><span class="e-font">CONTACT</span>Contact Us</p></div>
            <p class="sm-contact__txt">Your note here saying you accept requests for materials and inquiries.<br>Your second line goes here.</p>
            <a href="event.html#reserve" class="sm-contact__btn">Your contact button here</a>
          </div></div>
        </div>
      </div>
      <div class="sm-fblock">
        <div class="sm-fblock__u1">
          <nav class="sm-flist"><ul>
            <li><ul>${li(["CONCEPT", "DESIGN", "SPEC", "SUPPORT"], "sm-flink")}</ul></li>
            <li><ul>${li(["WORKS", "VOICE", "SHOWROOM", "RECRUIT"], "sm-flink")}</ul></li>
            <li><ul>${li(["EVENT", "INFO", "CONTACT", "COMPANY"], "sm-flink")}</ul></li>
          </ul></nav>
          ${ADDR}${ADDR_EN}
          <div><div class="sm-fpolicy-sp"><a href="#" class="sm-policy e-font">PRIVACY POLICY</a></div>
            <div class="sm-copyrow"><p class="sm-copy e-font">©NAME CO</p><div class="sm-fsns-sp"><a href="#" class="sm-sns" aria-label="SNS">${SNS}</a></div></div></div>
        </div>
        <div class="sm-fblock__u2">
          <div class="sm-fsns"><a href="#" class="sm-sns" aria-label="SNS">${SNS}</a><div class="sm-fpolicy-pc"><a href="#" class="sm-policy e-font">PRIVACY POLICY</a></div></div>
          <a href="index.html" class="sm-flogo" aria-label="First Page">${LOGO()}</a>
        </div>
      </div>`;
    const fm = document.createElement("ul");
    fm.className = "sm-fmenu";
    fm.dataset.slot = "sp-fixed-menu";
    fm.innerHTML = '<li><a href="event.html#reserve"><span class="e-font">Pamphlet</span>Material Request</a></li><li><a href="index.html#model"><span class="e-font">Model House</span>Model home</a></li>';
    foot.after(fm);
  }

  // Button arrow · prev/next circles as one shape
  document.querySelectorAll(".sm-arrow, .sm-next__circle").forEach((el) => { if (!el.firstChild) el.innerHTML = ARROW; });

  // Smooth scroll — the original new Lenis({ lerp: .05, wheelMultiplier: 1.2 }) + raf
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.05, wheelMultiplier: 1.2 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.SM = { lenis };

  // First page header: past (screen height − 80px) it turns gray (is-late), and returning above that it turns white again (is-return)
  if (head && page === "home") {
    const trig = innerHeight - 80;
    let late = false;
    const onScroll = () => {
      const y = scrollY;
      if (y > trig && !late) { head.classList.add("is-late"); late = true; }
      head.classList.toggle("is-return", y < trig && late);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Menu: on press the panel covers with a .4s fade and three lines become an X. The document is pinned in place (original body.fixed + top)
  const toggle = head && head.querySelector(".sm-toggle");
  const menu = head && head.querySelector(".sm-menu");
  if (toggle && menu) {
    let open = false, y = 0;
    const set = (v) => {
      open = v;
      toggle.classList.toggle("is-open", v);
      menu.classList.toggle("is-open", v);
      toggle.setAttribute("aria-expanded", v);
      menu.setAttribute("aria-hidden", !v);
      if (v) {
        y = scrollY;
        lenis && lenis.stop();
        body.classList.add("is-menu");
        body.style.top = -y + "px";
      } else {
        body.classList.remove("is-menu");
        body.style.top = "";
        scrollTo(0, y);
        lenis && lenis.start();
      }
    };
    // The original is also a div button, so keep the same form and let the keyboard open and close it too
    toggle.addEventListener("click", () => set(!open));
    toggle.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(!open); } });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && set(false)));
    menu.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
  }

  // Case row photos — original works_slider (Swiper 8.4.7)
  if (window.Swiper) {
    document.querySelectorAll(".sm-works .swiper").forEach((el) => new Swiper(el, {
      loop: false, speed: 600, grabCursor: true, allowTouchMove: true,
      slidesPerView: 1.435, spaceBetween: 5,
      breakpoints: { 768: { slidesPerView: 1.44 }, 992: { slidesPerView: 1.455, spaceBetween: 20 } },
    }));
  }

  // In-page # links scroll down by less than the header height (original .5s swing)
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + scrollY - (head ? head.offsetHeight : 0);
    if (lenis) lenis.scrollTo(top, { duration: 0.5 }); else scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }));
})();
