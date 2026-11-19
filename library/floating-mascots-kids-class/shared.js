// Draw once here so all four sections share the same header, menu, sticky tab, directions and footer.
// Behavior of original script.js (hamburger nav-open/nav-close, .fix after passing the hero, random tab tilt, inview → .move, accordion) carried over with the same values.
(() => {
  const page = document.body.dataset.page || "home";

  // Five characters — same silhouettes as the original dolls and illustrations. Color only via classes like .ch-p (currentColor)
  const eye = (x, y, r = 9, dx = 2) => `<ellipse class="e" cx="${x}" cy="${y}" rx="${r * 0.82}" ry="${r}"/><circle class="p" cx="${x + dx}" cy="${y + 1}" r="${r * 0.52}"/>`;
  const CH = {
    p: `<path class="b" d="M8 100V46a42 42 0 0 1 84 0v54H63V74a13 13 0 0 0-26 0v26Z"/>${eye(37, 38)}${eye(63, 38)}`,
    y: `<path class="b" d="M6 34Q6 8 32 8h40q24 0 24 26v32q0 26-26 26H32Q6 92 6 66Z"/><circle class="a3" cx="50" cy="48" r="29"/><circle class="e" cx="50" cy="48" r="21"/><circle class="p" cx="53" cy="49" r="10"/><rect class="a2" x="10" y="74" width="26" height="10" rx="5" transform="rotate(-40 23 79)"/>`,
    o: `<path class="b" d="M50 14c26 0 44 18 44 42S76 96 50 96 6 82 6 56 24 14 50 14Z"/><path class="a4" d="M48 16q-4-12 8-14 2 10-8 14Z"/>${eye(36, 52)}${eye(62, 52)}`,
    g: `<rect class="b" x="8" y="30" width="84" height="66" rx="10"/><path class="a2" d="M66 30l8-24 8 24Z"/>${eye(38, 62)}${eye(62, 62)}`,
    b: `<path class="b" d="M8 62q0-28 26-28 10-20 32-12 28-2 28 28 6 32-24 32H32Q8 82 8 62Z"/>${eye(42, 54)}${eye(64, 54)}`,
  };
  const paint = (root = document) => {
    root.querySelectorAll("[data-ch]:not([data-ch-done])").forEach((el) => {
      const k = el.dataset.ch;
      if (!CH[k]) return;
      el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${CH[k]}</svg>`;
      el.setAttribute("data-ch-done", "");
    });
  };

  const svc = [["GYM", "service.html#gym"], ["NEM", "service.html#nem"], ["MOG", "service.html#mog"], ["Academy", "service.html#academy"], ["LABO", "service.html#labo"]];
  const blogCats = ["All Posts", "Help info", "Kids’ recipe book", "Event details", "Notice", "Staff Introduction", "About Media", "Testimonial", "Hiring Info"];

  const headHTML = () => `
    <a class="logo" href="index.html" data-label="Brand logo — small Korean subtitle above + English wordmark"><small>Kids Wellness Gym</small><b>BRAND</b><i>produced by Company</i></a>
    <div class="links">
      <ul class="g-nav">
        <li><a class="text-link" href="about.html">BRAND Field</a></li>
        <li><a class="text-link" href="service.html">About the service</a>
          <div class="g-panel">${svc.map(([n, h]) => `<a href="${h}">${n}</a>`).join("")}</div></li>
        <li><a class="text-link" href="#">Pricing Info</a></li>
        <li><a class="text-link" href="#">Facility Guide</a></li>
        <li><a class="text-link" href="#">Frequently asked questions</a></li>
      </ul>
      <a class="link-world" href="index.html#world" aria-label="World"><i class="ch ch-y" data-ch="y"></i></a>
      <a class="link-friends" href="index.html#friends" aria-label="Friends"><i class="ch ch-o" data-ch="o"></i></a>
    </div>`;

  const gnavHTML = `
    <div class="nav_inr">
      <div class="menu-logo"><div class="chars"><i class="ch ch-o" data-ch="o"></i><i class="ch ch-b" data-ch="b"></i><i class="ch ch-p" data-ch="p"></i><i class="ch ch-y" data-ch="y"></i></div></div>
      <div class="copy uk-pc"><small>Kids Wellness Gym</small><b>BRAND</b><span class="en">© 2025 BRAND All rights reserved.</span></div>
      <div class="c_area">
        <ul>
          <li><a class="b_link" href="index.html">First Page</a></li>
          <li><a class="b_link" href="about.html">BRAND Field</a></li>
          <li class="wide"><a class="b_link" href="service.html">About the service</a></li>
          <li class="wide"><div class="s_links">${svc.map(([n, h]) => `<a class="s_link uk-en" href="${h}">${n}</a>`).join("")}</div></li>
          <li><a class="b_link" href="#">Pricing Info</a></li>
          <li><a class="b_link" href="#">Facility Guide</a></li>
          <li><a class="b_link" href="#">Frequently asked questions</a></li>
          <li><a class="b_link" href="#">Experience Sign-up</a></li>
        </ul>
        <ul>
          <li class="wide"><a class="b_link" href="news.html">Blog &amp; News</a></li>
          <li class="wide"><div class="s_links">${blogCats.slice(1).map((c) => `<a class="s_link" href="news.html">${c}</a>`).join("")}</div></li>
          <li><a class="b_link" href="#">Member Page</a></li>
          <li><a class="b_link" href="#">Inquiry</a></li>
        </ul>
        <div class="bnr_area">
          <a href="#"><div class="wf-img" data-label="Banner — free trial notice · group photo of children · horizontal strip"></div></a>
          <a href="#"><div class="wf-img" data-label="Banner — Recruitment info · Smiling staff · Horizontal strip"></div></a>
          <a href="#"><div class="wf-img" data-label="Banner — Video channel · Character on stage · Horizontal strip"></div></a>
        </div>
        <div class="sns_area">${snsHTML()}</div>
      </div>
    </div>`;

  function snsHTML() {
    const ic = {
      line: `<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 4 3.5 7.3 8.3 7.9.3.1.8.2.9.5l-.2 1.7c0 .3.2.9.9.4 1-.6 5.3-3.2 7.2-5.4C20.4 14.6 22 12.9 22 11c0-4.4-4.5-8-10-8Z"/></svg>`,
      insta: `<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>`,
      yt: `<svg viewBox="0 0 24 24"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10 15V9l5.2 3Z"/></svg>`,
    };
    return `<a class="uk-sns -line" href="#">${ic.line}BRAND Official LINE</a><a class="uk-sns -insta" href="#">${ic.insta}BRAND Instagram</a><a class="uk-sns -yt" href="#">${ic.yt}BRAND Channel</a>`;
  }

  const mapSVG = `<svg viewBox="0 0 760 380" preserveAspectRatio="none" aria-hidden="true">
    <path class="road -thick" d="M0 112H760"/><path class="road" d="M0 230H760M0 330H760"/>
    <path class="road" d="M110 0V380M330 0V380"/><path class="road -sub" d="M450 230V330H560V230M180 230V330"/>
    <path class="road -sub" d="M500 60V112"/>
    <text x="240" y="62">Path name 00</text><text class="g" x="350" y="62">Path name 01</text>
    <text x="300" y="148">Station 00</text><text x="210" y="216">Mart 00 ●</text><text x="340" y="216">● Shop 00</text>
    <text x="250" y="256">Shop 01 ●</text><text class="g" x="140" y="256">Path name 02</text>
    <text x="40" y="306">Shop 02</text><text x="250" y="306">Shop 03</text>
    <text class="g" x="180" y="352">Path name 03</text><text x="10" y="372">National Route 00</text>
    <rect class="pin" x="350" y="168" width="64" height="34" rx="6"/><text class="pin-t" x="362" y="190">3F here</text>
    <rect class="pin2" x="340" y="206" width="66" height="30" rx="4"/><text x="348" y="226">Building Name</text>
    <rect class="park" x="470" y="262" width="80" height="26" rx="3"/><text class="pin-t" x="480" y="280">Park 00</text>
  </svg>`;

  const footHTML = `
    <div class="uk-access" data-slot="access">
      <section class="acc">
        <h2>ACCESS</h2><p>Directions</p>
        <div class="map" data-label="Neighborhood map — two main roads, small streets, shop dots, pink flag at the shop location">${mapSVG}</div>
        <div class="addr">
          <div><p>〒000-0000 City, District, Neighborhood 0-00-00<br>Building name, 3rd floor · inside the shop name</p><a class="uk-btn -v3 -beige" href="#"><span class="t uk-en">Product</span><span class="uk-arrow"></span></a></div>
          <div class="wf-img" data-label="Shop entrance · Rainbow balloon arch · Square"></div>
        </div>
      </section>
      <a class="insta" href="#">
        <div class="wf-img" data-label="Children in an outdoor class · green lawn · darkened portrait photo"></div>
        <p class="cap">A glimpse of the class<br>Check it out on Instagram!</p>
        <svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>
        <b>BRAND</b><span>Instagram</span><i class="go"></i>
      </a>
    </div>
    <div class="uk-foot" data-slot="footer-links">
      <div class="brand">
        <div class="chars"><i class="ch ch-o" data-ch="o"></i><i class="ch ch-b" data-ch="b"></i><i class="ch ch-g" data-ch="g"></i><i class="ch ch-y" data-ch="y"></i><i class="ch ch-p" data-ch="p"></i></div>
        <small>Kids Wellness Gym</small><b>BRAND</b><i>produced by Company</i>
        <p>〒000-0000 City, District, Neighborhood 0-00-00<br>Building name, 3rd floor · inside the shop name</p>
        <p class="tel">tel.0000-000-000</p><p class="mail">brand@example.com</p>
        <p class="copy">© 2025 BRAND All rights reserved.</p>
      </div>
      <div class="cols">
        <div><a href="index.html">First Page</a><a href="about.html">BRAND Field</a><a href="service.html">About the service</a><a href="#">Pricing Info</a><a href="#">Facility Guide</a><a href="#">Frequently asked questions</a><a href="#">Experience Sign-up</a></div>
        <div><a href="news.html">Blog &amp; News</a><div class="s">${blogCats.slice(1).map((c) => `<a href="news.html">${c}</a>`).join("")}</div></div>
      </div>
      <a class="form" href="#"><b>Get in touch via the contact form</b><span>MAIL FORM</span><i class="uk-arrow"></i><i class="ch ch-y" data-ch="y"></i></a>
      <div class="sns">${snsHTML()}</div>
      <div class="kids"><div class="wf-img" data-label="Two children lying down hugging dolls · White background cutout · Landscape"></div><i class="ch ch-g" data-ch="g"></i><i class="ch ch-y" data-ch="y"></i><i class="ch ch-p" data-ch="p"></i></div>
    </div>`;

  const fixHTML = `
    <a class="-member" href="#">Member Page</a>
    <a class="-trial" href="#">Experience Sign-up</a>
    <a class="-contact" href="#">Contact Us</a>`;

  const mount = () => {
    const head = document.querySelector('[data-slot="header"]');
    if (head) {
      head.classList.add("uk-head");
      if (head.dataset.tone === "ink") head.classList.add("-ink");
      head.innerHTML = page === "home" ? "" : headHTML();
    }
    const burger = Object.assign(document.createElement("button"), { className: "uk-burger", type: "button", id: "js-hamburger" });
    burger.setAttribute("aria-label", "Menu");
    burger.setAttribute("data-slot", "hamburger");
    burger.innerHTML = '<span class="lines"><span></span><span></span><span></span></span><p></p>';
    const gnav = Object.assign(document.createElement("nav"), { className: "uk-gnav", innerHTML: gnavHTML });
    gnav.setAttribute("data-slot", "global-nav");
    const fix = Object.assign(document.createElement("div"), { className: `uk-fix${page === "home" ? " -index" : ""}`, innerHTML: fixHTML });
    fix.setAttribute("data-slot", "fix-tabs");
    document.body.prepend(burger, gnav);
    document.body.append(fix);
    const foot = document.querySelector('[data-slot="footer"]');
    if (foot) foot.innerHTML = footHTML;
    paint();

    // Original #js-hamburger — alternately attaches open·close classes so the three lines fold with .4s keyframes
    burger.addEventListener("click", () => {
      const open = document.body.classList.contains("nav-open");
      document.body.classList.toggle("nav-open", !open);
      document.body.classList.toggle("nav-close", open);
    });
    gnav.addEventListener("click", (e) => { if (e.target === gnav) burger.click(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) burger.click(); });

    // Original .random-tilt — each time the pointer enters, it tilts 4° to either left or right
    fix.querySelectorAll("a").forEach((a) => {
      a.addEventListener("mouseenter", () => {
        a.classList.remove("tilt-left", "tilt-right");
        a.classList.add(Math.random() < 0.5 ? "tilt-left" : "tilt-right");
      });
      a.addEventListener("mouseleave", () => a.classList.remove("tilt-left", "tilt-right"));
    });

    // Original checkScroll — after scrolling down one screen height, add .fix to the header
    const headEl = document.querySelector(".uk-head");
    const check = () => headEl && headEl.classList.toggle("fix", scrollY > innerHeight);
    addEventListener("scroll", check, { passive: true });
    check();

    // Original jquery.inview — once even slightly visible, adds .move (here .is-in) one time
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }), { threshold: 0 });
    document.querySelectorAll(".iv-bt, .iv-one, .iv").forEach((el) => io.observe(el));

    // Original .sp-toggle (slideToggle 300) · .cate_toggle (slideToggle default 400) — folds or unfolds the next cell opposite to its current visible state.
    // data-acc="sp" Folds only at phone width. Set the length in ms with data-dur
    document.querySelectorAll("[data-acc]").forEach((btn) => {
      const panel = btn.nextElementSibling;
      btn.addEventListener("click", () => {
        if (btn.dataset.acc === "sp" && innerWidth > 800) return;
        const wasOpen = panel.offsetHeight > 0;
        btn.classList.toggle("active");
        btn.setAttribute("aria-expanded", !wasOpen);
        panel.style.overflow = "hidden";
        const h = panel.scrollHeight;
        panel.animate(wasOpen ? [{ height: h + "px" }, { height: "0px" }] : [{ height: "0px" }, { height: h + "px" }], { duration: +(btn.dataset.dur || 300), easing: "cubic-bezier(.37, 0, .63, 1)" }).onfinish = () => {
          panel.style.height = wasOpen ? "0px" : "auto";
        };
      });
    });

    // Spot for the original magnificPopup (iframe) — the play button opens a video window
    const modal = document.getElementById("video");
    if (modal) {
      const close = () => { modal.classList.remove("is-open"); setTimeout(() => (modal.hidden = true), 300); };
      document.querySelectorAll('[data-open="video"]').forEach((b) => b.addEventListener("click", () => {
        modal.hidden = false;
        requestAnimationFrame(() => modal.classList.add("is-open"));
      }));
      modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".x")) close(); });
      addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
    }

    requestAnimationFrame(() => document.body.classList.add("loaded"));
    if (document.readyState === "complete") document.body.classList.add("load");
    else addEventListener("load", () => document.body.classList.add("load"));
  };

  window.ukPaint = paint;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
