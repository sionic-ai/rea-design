// All pages use the same header nav, phone menu, recruit band and footer — built into the placeholders [data-site-head] · [data-site-foot]
(() => {
  const page = document.body.dataset.page || "";
  const ARROW = '<svg viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 1l4 4-4 4"/></svg>';
  const EXT = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M3.5 1.5H8.5V6.5M8.5 1.5 1.5 8.5"/></svg>';
  const LINKS = [
    ["about.html", "Philosophy", "about"],
    ["service.html", "Business", "service"],
    ["index.html#story", "Project Story", ""],
    ["about.html#company", "Company", ""],
    ["about.html#team", "Team", ""],
    ["news.html", "News", "news"],
    ["recruit.html", "Recruit", "recruit", true],
  ];
  const cur = (p) => (p && p === page ? ' aria-current="page"' : "");
  const roll = (t) => `<span class="jc-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  const logo = (cls = "") => `<a class="jc-logo ${cls}" href="index.html" data-label="Brand logo · horizontal wordmark + three-line English intro"><span class="jc-logo__mark">LOGO</span><span class="jc-logo__tag">Brand Line<br>One Two And<br>Tagline Here</span></a>`;

  const headBar = (cls, attrs) => `
<header class="jc-head${cls}"${attrs}>
  ${logo()}
  <nav class="jc-head__nav" aria-label="Main menu" data-label="Your menu English name here">
    <div class="jc-head__links">
      ${LINKS.map(([h, t, p, ext]) => `<a class="jc-uline" href="${h}"${cur(p)}${ext ? ' target="_blank"' : ""}>${t}${ext ? `<span class="jc-ext">${EXT}</span>` : ""}</a>`).join("")}
    </div>
    <div class="jc-lang"><span class="jc-lang__now">KR</span><i>/</i><a class="jc-uline" href="#">EN</a></div>
    <a class="jc-contact" href="#contact">${roll("Contact")}</a>
  </nav>
</header>`;
  // Layer one more white header nav over the sub page header photo (original #fv_header)
  const fvHead = document.querySelector("[data-fv-head]");
  if (fvHead) fvHead.outerHTML = headBar(" is-fv", ' data-slot="header-over-photo"');

  const head = document.querySelector("[data-site-head]");
  if (head) {
    const hide = head.dataset.hideUntil;
    head.outerHTML = `${headBar(hide ? " is-hidden" : "", ` data-slot="header"${hide ? ` data-hide-until="${hide}"` : ""}`)}
<button class="jc-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="jc-menu" data-slot="menu-button"><span></span><span></span><span></span></button>
<div class="jc-menu" id="jc-menu" data-slot="mobile-menu">
  ${LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
  <a class="jc-contact" href="#contact">${roll("Contact")}</a>
</div>`;
  }

  const foot = document.querySelector("[data-site-foot]");
  if (foot) {
    const withRecruit = foot.dataset.recruit !== "off";
    const strip = (n) => Array.from({ length: n }, (_, i) => `<li class="wf-img" data-label="${["Team photo · people in a meeting · bright office", "Office window · Natural light · Landscape", "Two people walking and smiling · overcast day", "Working at a laptop · warm indoor scene", "Spacious office with green chairs", "Presentation in front of a whiteboard", "Colleagues chatting in the lobby"][i % 7]}"></li>`).join("");
    foot.outerHTML = `
<footer class="jc-foot${withRecruit ? "" : " is-plain"}" id="contact" data-slot="footer">
  ${withRecruit ? `<div class="jc-foot__recruit" data-slot="recruit-band">
    <div class="jc-foot__recruit-in">
      <p class="jc-foot__recruit-t jc-latin">Recruit</p>
      <div class="jc-foot__recruit-row">
        <p class="jc-mincho jc-foot__recruit-lead">Here, ”light” made beautiful.<br>We’re looking for teammates who will light up the future.</p>
        <p class="jc-foot__recruit-p">Your sentence goes here about a business that shares its appeal inside and out through technology and creativity. One line looks for like-minded colleagues to join a team that respects each other and refines its work together toward a goal.</p>
      </div>
      <a class="jc-golink jc-foot__recruit-go" href="recruit.html"><span class="jc-golink__k">Get in touch :</span><span class="jc-golink__v">View job info <span class="jc-ext">${EXT}</span></span></a>
    </div>
    <div class="jc-foot__strip" data-photo-strip aria-hidden="true"><ul>${strip(7)}</ul><ul>${strip(7)}</ul></div>
  </div>` : ""}
  <div class="jc-foot__grid">
    <a class="jc-foot__contact" href="#" data-slot="contact-card">
      <span class="jc-foot__contact-bg wf-img" data-label="Photo behind the contact card · teacup in a dark room · 9:16 portrait"></span>
      <span class="jc-foot__contact-in">
        <small>Contact</small>
        <b class="jc-mincho">Contact Us</b>
        <span class="jc-foot__contact-p">Your sentences here in about three lines asking local governments, companies and makers to send business inquiries, press requests and service questions here.</span>
        <span class="jc-foot__contact-btn">Contact us this way</span>
      </span>
    </a>
    <div class="jc-foot__side">
      <ul class="jc-foot__nav" aria-label="Sitemap">
        <li${page === "home" ? ' class="is-now"' : ""}><a href="index.html">Top</a></li>
        <li><a href="about.html">About</a><ul><li><a class="jc-uline" href="about.html#company">Company</a></li><li><a class="jc-uline" href="about.html#team">Team</a></li></ul></li>
        <li${page === "about" ? ' class="is-now"' : ""}><a href="about.html">Philosophy</a></li>
        <li${page === "service" ? ' class="is-now"' : ""}><a href="service.html">Business</a><ul><li><a class="jc-uline" href="#">Service One ${EXT}</a></li><li><a class="jc-uline" href="#">Service Two ${EXT}</a></li><li><a class="jc-uline" href="#">Service Two Plus ${EXT}</a></li><li><a class="jc-uline" href="service.html">Produce</a></li></ul></li>
        <li><a href="index.html#story">Project Story</a></li>
        <li><a href="about.html#company">Company</a></li>
        <li><a href="about.html#team">Team</a></li>
        <li${page === "news" ? ' class="is-now"' : ""}><a href="news.html">News</a></li>
        <li${page === "recruit" ? ' class="is-now"' : ""}><a href="recruit.html">Recruit</a><span class="jc-ext">${EXT}</span></li>
      </ul>
      <div class="jc-foot__base">
        <div>${logo()}<small class="jc-foot__addr">Company address in one line here · postal code here</small></div>
        <div class="jc-foot__legal"><a class="jc-uline" href="#">Privacy policy</a><a class="jc-uline" href="#">Cover · Travel Agency Terms</a><small class="jc-latin">© Company Name Inc.</small></div>
      </div>
    </div>
  </div>
</footer>`;
  }

  document.querySelectorAll("[data-arrow]").forEach((s) => { if (!s.innerHTML) s.innerHTML = ARROW + ARROW; s.classList.add("jc-arrow"); });
  document.querySelectorAll("[data-ext]").forEach((s) => { if (!s.innerHTML) s.innerHTML = s.classList.contains("jc-more__dot") ? EXT + EXT : EXT; });
  const DOWN = '<svg viewBox="0 0 9 6" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 1l3.5 4L8 1"/></svg>';
  document.querySelectorAll("[data-down]").forEach((s) => { if (!s.innerHTML) s.innerHTML = DOWN + DOWN; });

  // Home page header nav: appears in .4s once the Hero section has fully scrolled above the screen (original rootMargin 0 0 -100% 0)
  const headEl = document.querySelector(".jc-head[data-hide-until]");
  const until = headEl && document.getElementById(headEl.dataset.hideUntil);
  if (headEl && until) {
    new IntersectionObserver(([e]) => headEl.classList.toggle("is-hidden", e.isIntersecting), { rootMargin: "0px 0px -100% 0px" }).observe(until);
  }

  const burger = document.querySelector(".jc-burger");
  if (burger) {
    const set = (open) => { document.documentElement.classList.toggle("is-menu-open", open); burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); };
    burger.addEventListener("click", () => set(!document.documentElement.classList.contains("is-menu-open")));
    document.querySelectorAll(".jc-menu a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // STUDIO appear: when even one pixel enters the screen (threshold 0), the hidden state is removed and each piece settles into place with its own delay and duration — once only
  const appears = document.querySelectorAll("[data-appear]");
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && appears.length) {
    appears.forEach((el) => el.classList.add("is-pre"));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      requestAnimationFrame(() => e.target.classList.remove("is-pre"));
    }));
    appears.forEach((el) => io.observe(el));
  }

  // Photo strip: one set is extended to three sets and flows left endlessly (original slideLeft 112s linear)
  document.querySelectorAll("[data-photo-strip]").forEach((strip) => {
    const ul = strip.querySelector("ul");
    if (!ul || strip.dataset.ready) return;
    strip.dataset.ready = "1";
    if (strip.querySelectorAll("ul").length < 2) for (let k = 0; k < 2; k++) { const c = ul.cloneNode(true); c.setAttribute("aria-hidden", "true"); strip.append(c); }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    strip.querySelectorAll("ul").forEach((u) => u.classList.add("is-run"));
  });
})();
