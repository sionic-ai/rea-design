/* Shared across pages — header bar, full menu, contact band, footer, hiring badge, Lenis, reveal motion */
(() => {
  const ARROW = '<svg viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 7h20M14 1l6 6-6 6"/></svg>';
  const BLANK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4.5 1.5H10.5V7.5M10.5 1.5 3 9"/><path d="M8.5 10.5h-7v-7"/></svg>';
  const LOGO = '<svg viewBox="0 0 148 22" aria-label="Logo slot"><path class="lg-a" d="M0 21 14 1h8L8 21z"/><path class="lg-b" d="M0 21 14 9v12z"/><text class="lg-t" x="26" y="19" font-size="22">LOGO</text></svg>';
  const page = document.body.dataset.page || "home";
  const NAV = [["TOP", "First Page", "index.html", "home"], ["SERVICES", "Business guide", "service.html", "service"], ["RECRUIT", "Hiring Info", "recruit.html", "recruit"], ["COMPANY", "Company info", "about.html", "about"], ["NEWS", "Notice", "news.html", "news"]];
  window.miBtn = (label, href = "#", cls = "") => '<a class="mi-btn ' + cls + '" href="' + href + '"><span class="mi-btn__label"><span data-txt="' + label + '">' + label + '</span></span><span class="mi-btn__arrow">' + BLANK + "</span></a>";

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "mi-header";
    header.innerHTML = '<div class="mi-header__bar"><a class="mi-logo" href="index.html">' + LOGO + '<span>Your company name here</span></a><nav class="mi-nav">' +
      NAV.map(([en, ja, h, k]) => '<a href="' + h + '"' + (k === page ? ' aria-current="page"' : "") + '><span class="en">' + en + '</span><span class="ja">' + ja + "</span></a>").join("") + "</nav></div>" +
      '<button class="mi-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>';
  }
  const gnav = document.createElement("div");
  gnav.className = "mi-gnav";
  gnav.setAttribute("data-slot", "menu-overlay");
  const SUB = { SERVICES: ["On-site security", "Station operations · Infrastructure support", "Cash transport", "Facility Management", "Security solution", "Disaster prevention solution"], RECRUIT: ["Hiring process · Job requirements", "Senior staff interview", "Employee benefits"], COMPANY: ["Company overview", "Message from the CEO", "History"] };
  const svcList = ["On-site security", "Station operations · Infrastructure support", "Cash transport", "Facility Management", "Security solution", "Disaster prevention solution", "Queue management · Crowd security", "Wildlife control service"];
  const recList = ["Hiring process · Job requirements", "Benefits · Work environment", "Voices of senior employees", "A Day in the Life"];
  const ico = '<i class="mi-gnav__ico" aria-hidden="true"></i>';
  gnav.innerHTML = '<div class="mi-gnav__bar"><a class="mi-logo" href="index.html">' + LOGO + '<span>Your company name here</span></a></div>' +
    '<div class="mi-gnav__in"><div class="mi-gnav__col mi-gnav__item"><p class="mi-gnav__ttl"><span class="en">OUR SERVICES</span><span class="ja">Business and service details</span></p>' +
    '<div class="mi-gnav__btns">' + window.miBtn("To the business · service top page", "service.html") + window.miBtn("Path to adopting security", "service.html") + "</div>" +
    '<ol class="mi-gnav__list is-2col">' + svcList.map((t, k) => '<li><a href="service.html">' + ico + '<b class="en">0' + (k + 1) + "</b>" + t + "</a></li>").join("") + "</ol></div>" +
    '<div class="mi-gnav__col mi-gnav__item"><p class="mi-gnav__ttl"><span class="en">RECRUIT</span><span class="ja">Hiring Info</span></p>' +
    '<div class="mi-gnav__btns">' + window.miBtn("To the careers info page", "recruit.html") + window.miBtn("Hiring entry", "detail.html") + "</div>" +
    '<ul class="mi-gnav__list">' + recList.map((t, k) => '<li><a href="' + (k ? "recruit.html" : "detail.html") + '">' + ico + t + "</a></li>").join("") + "</ul></div>" +
    '<ul class="mi-gnav__sub mi-gnav__item">' + [["COMPANY", "Company info", "about.html"], ["SUBSIDIARY", "Subsidiary", "#"], ["NEWS", "Notice", "news.html"], ["CONTACT US", "Inquiry", "#contact"]].map(([en, ja, h]) => '<li><a href="' + h + '"><span class="en">' + en + "</span>" + ja + "</a></li>").join("") + "</ul>" +
    '<p class="mi-gnav__legal mi-gnav__item"><a href="#">Privacy policy</a><a href="#">Information Security Policy</a><a href="#">Site usage guide</a><a href="#">Sitemap</a><span>© 0000 Your copyright notice here</span></p></div>';
  document.body.append(gnav);

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.className = "mi-contact";
    contact.id = "contact";
    contact.innerHTML = '<a class="mi-contact__box" href="#" data-contact-box><span class="mi-contact__ico" aria-hidden="true"><i></i></span><div><span class="en" data-contact-item>CONTACT US</span><span class="ja" data-contact-item>Contact Us</span><p data-contact-item>We take inquiries of all kinds.<br>Feel free to reach out.</p></div><span class="mi-contact__circle" data-contact-item>' + ARROW + "</span></a>";
  }
  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "mi-footer";
    const col = (en, ja, h, items) => '<div><span class="en">' + en + '</span><h4><a href="' + h + '">' + ja + "</a></h4>" + (items ? "<ul>" + items.map((s) => "<li>" + s + "</li>").join("") + "</ul>" : "") + "</div>";
    footer.innerHTML = '<div class="mi-footer__top"><div class="mi-footer__info"><a class="mi-logo" href="index.html">' + LOGO + '<span>Your company name here</span></a>' +
      '<h3>ACCESS</h3><p>Postal code 000-0000<br>Your company address, one line</p><h3>CONTACT</h3><p>Main phone inquiries</p><p class="mi-footer__tel">TEL 000-000-0000</p><p>Reception hours 00:00~00:00 (weekdays)</p></div>' +
      '<div class="mi-footer__map">' + col("SERVICE", "Business/service landing page", "service.html", SUB.SERVICES) + col("RECRUIT", "Careers info first page", "recruit.html", ["Hiring process · Job requirements", "Senior staff interview", "Employee benefits"]) +
      '<div>' + col("COMPANY", "Company info", "about.html") + col("NEWS", "Notice", "news.html") + col("CONTACT", "Inquiry", "#contact") + "</div></div></div>" +
      '<div class="mi-footer__bottom"><a href="#">Privacy policy</a><a href="#">Information Security Policy</a><a href="#">Site usage guide</a><a href="#">Sitemap</a><span>© 0000 Your copyright notice here</span><button class="mi-totop" type="button">BACK TO TOP <i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 7l4-4 4 4"/></svg></i></button></div>';
  }
  if (document.body.dataset.badge !== "none") {
    const badge = document.createElement("a");
    badge.className = "mi-recbadge";
    badge.href = "recruit.html";
    badge.setAttribute("data-slot", "recruit-badge");
    badge.innerHTML = '<span><span class="en">REC</span><br><span class="ja">Hiring</span></span>';
    document.body.append(badge);
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("(max-width: 767px)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Lenis 1.3.20 lerp .1 — turned off on phones (under 767)
  let lenis = null;
  if (!reduce && !sp() && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -100 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.miLenis = lenis;
  window.miLock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); };

  // Past 4px down, hide the bar, scrolling up brings it back (always visible within the top 60px)
  let last = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, dy = y - last;
    if (Math.abs(dy) < 4) return;
    document.body.classList.toggle("is-header-hidden", y > 60 && dy > 0);
    last = y;
  }, { passive: true });

  const burger = document.querySelector(".mi-burger");
  const items = gnav.querySelectorAll(".mi-gnav__item");
  const open = () => {
    document.body.classList.add("is-navOpen");
    window.miLock(true);
    gsap.set(gnav, { visibility: "visible", opacity: 0 });
    gsap.to(gnav, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(items, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.1 });
  };
  const close = () => {
    document.body.classList.remove("is-navOpen");
    window.miLock(false);
    gsap.to(gnav, { opacity: 0, duration: 0.4, ease: "power2.out", onComplete: () => gsap.set(gnav, { visibility: "hidden" }) });
  };
  burger && burger.addEventListener("click", () => (document.body.classList.contains("is-navOpen") ? close() : open()));
  gnav.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-navOpen")) close(); });

  document.querySelectorAll(".mi-totop").forEach((b) => b.addEventListener("click", () => (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }))));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Reveal: when reaching 85% of the screen, one group at a time at .15s intervals
    ScrollTrigger.batch("[data-reveal]", { start: "top 85%", once: true, onEnter: (els) => els.forEach((el, i) => { el.style.setProperty("--d", i * 0.15 + "s"); el.classList.add("is-in"); }) });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-active"); io.unobserve(en.target); } }), { threshold: sp() ? 0.4 : 0.2, rootMargin: sp() ? "0px 0px -18% 0px" : "0px" });
    document.querySelectorAll(".mi-slide, .mi-bgtext").forEach((el) => io.observe(el));
    const box = document.querySelector("[data-contact-box]");
    if (box) {
      const its = box.querySelectorAll("[data-contact-item]");
      gsap.set(box, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(its, { autoAlpha: 0, y: 36 });
      ScrollTrigger.create({ trigger: box, start: "top 75%", once: true, onEnter: () => {
        gsap.to(box, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "power2.out" });
        gsap.to(its, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out", delay: 0.2 });
      } });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in")); });
})();
