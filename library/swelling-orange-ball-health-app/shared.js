/* Common to all pages: draws the orange circle logo header · nav (underline baton) · service mega menu · phone drawer menu · download card · orange footer · bottom-left divider line · phone bottom fixed strip, and,
   The original hand-drawn spots are filled with our own line art (black lines + orange and yellow fills). Behavior of the original page.js and common.min.js —
   Scrolling past 20px shrinks the logo circle in .4s, the mega menu turns on with hover in .4s cubic-bezier(.215,.61,.355,1), the phone menu button toggles body.open,
   FAQ uses jQuery slideToggle(400ms swing = sine.inOut — part height-fold), in-page links glide with a 600ms swing. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";

  // ── Line art ── redraws the original hand drawings (person, bookshelf, speech bubble) in the same place, size and feel
  const face = (x, y, r, hair = "short") => `<g transform="translate(${x} ${y})">
      <circle class="kg-ill-skin kg-ill-line" r="${r}"/>
      ${hair === "long" ? `<path class="kg-ill-ink" d="M${-r} ${r * 0.2}c0-${r * 1.4} ${r * 2}-${r * 1.4} ${r * 2} 0 0-${r * 0.4}-${r * 0.6}-${r * 0.9}-${r}-${r * 0.9}s-${r} ${r * 0.5}-${r} ${r * 0.9}Z"/>`
        : `<path class="kg-ill-ink" d="M${-r} ${-r * 0.1}c0-${r * 1.1} ${r * 2}-${r * 1.2} ${r * 2}-${r * 0.1}-${r * 0.5}-${r * 0.3}-${r * 1.2}-${r * 0.3}-${r * 2} ${r * 0.1}Z"/>`}
      <circle class="kg-ill-ink" cx="${-r * 0.35}" cy="${r * 0.15}" r="${r * 0.08}"/><circle class="kg-ill-ink" cx="${r * 0.35}" cy="${r * 0.15}" r="${r * 0.08}"/>
      <path class="kg-ill-line" d="M${-r * 0.25} ${r * 0.45}q${r * 0.25} ${r * 0.2} ${r * 0.5} 0"/>
    </g>`;
  const person = (x, y, s, { hair = "short", shirt = "kg-ill-accent", pants = "kg-ill-navy", flip = false } = {}) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      ${face(0, -150, 22, hair)}
      <path class="${shirt} kg-ill-line" d="M-26-118h52l8 70h-68Z"/>
      <path class="kg-ill-line" d="M-26-112l-22 52M26-112l22 46"/>
      <path class="${pants} kg-ill-line" d="M-30-48h60l-4 92h-20l-6-70-6 70h-20Z"/>
      <path class="kg-ill-ink" d="M-34 44h24v8h-26ZM10 44h24l2 8H10Z"/>
    </g>`;
  const bubble = (x, y, r, hair) => `<g transform="translate(${x} ${y})">
      <circle class="kg-ill-white kg-ill-line" r="${r}"/>
      <path class="kg-ill-white kg-ill-line" d="M${-r * 0.3} ${r * 0.92}l${-r * 0.2} ${r * 0.4} ${r * 0.5}-${r * 0.3}"/>
      ${face(0, -r * 0.15, r * 0.36, hair)}
      <path class="kg-ill-accent kg-ill-line" d="M${-r * 0.55} ${r * 0.75}c${r * 0.1}-${r * 0.4} ${r * 1}-${r * 0.4} ${r * 1.1} 0"/>
      <path class="kg-ill-line" d="M${-r * 0.3} ${-r * 1.25}l-4-10M0 ${-r * 1.3}v-12M${r * 0.3} ${-r * 1.25}l4-10"/>
    </g>`;
  const shelf = `<g>
      <rect class="kg-ill-accent-soft kg-ill-line" x="150" y="40" width="180" height="330" rx="26"/>
      <rect class="kg-ill-white kg-ill-line" x="166" y="66" width="148" height="270" rx="8"/>
      ${[0, 1, 2, 3].map((r) => `<path class="kg-ill-line" d="M166 ${132 + r * 66}h148"/>${[0, 1, 2, 3, 4, 5, 6].map((c) => `<rect class="${(r + c) % 3 ? "kg-ill-accent" : (r + c) % 2 ? "kg-ill-navy" : "kg-ill-yellow"} kg-ill-line" x="${172 + c * 20}" y="${80 + r * 66 - (c % 3) * 4}" width="14" height="${52 + (c % 3) * 4}" rx="2"/>`).join("")}`).join("")}
      <rect class="kg-ill-white kg-ill-line" x="222" y="346" width="36" height="10" rx="5"/>
    </g>`;
  const ILL = {
    hero: `<svg viewBox="0 0 480 420" class="kg-ill" aria-hidden="true">
      <circle class="kg-ill-ball" cx="210" cy="64" r="62"/>
      ${shelf}
      ${person(120, 380, 1.05, { hair: "long" })}${person(370, 380, 1, { shirt: "kg-ill-white", flip: true })}
      ${bubble(70, 110, 52, "long")}${bubble(420, 100, 52)}
      <circle class="kg-ill-ball" cx="430" cy="250" r="24"/>
    </svg>`,
    worry: `<svg viewBox="0 0 420 340" class="kg-ill" aria-hidden="true">
      <circle class="kg-ill-ball" cx="300" cy="90" r="70"/>
      <rect class="kg-ill-yellow kg-ill-line" x="150" y="40" width="130" height="240" rx="18" transform="rotate(-12 215 160)"/>
      <rect class="kg-ill-white kg-ill-line" x="162" y="62" width="106" height="196" rx="6" transform="rotate(-12 215 160)"/>
      ${person(120, 320, 1, { hair: "long" })}${person(330, 320, 0.95, { shirt: "kg-ill-white", flip: true })}
      ${bubble(60, 80, 40)}${bubble(370, 200, 34, "long")}
    </svg>`,
    laptop: `<svg viewBox="0 0 300 190" class="kg-ill" aria-hidden="true">
      ${person(80, 180, 0.7)}
      <path class="kg-ill-white kg-ill-line" d="M110 110h90l-10 50h-90Z"/><path class="kg-ill-line" d="M90 160h130"/>
      ${[0, 1, 2].map((i) => `<g transform="translate(${200 + i * 32} ${40 + (i % 2) * 22})"><circle class="kg-ill-white kg-ill-line" r="16"/><path class="kg-ill-line" d="M-7 0h14M0-7v14"/></g>`).join("")}
    </svg>`,
    ask: `<svg viewBox="0 0 300 190" class="kg-ill" aria-hidden="true">
      ${person(110, 182, 0.7, { hair: "long", shirt: "kg-ill-yellow" })}
      ${bubble(200, 60, 30)}${bubble(260, 120, 26, "long")}
      <path class="kg-ill-line" d="M150 70q20-30 30-10"/>
    </svg>`,
    family: `<svg viewBox="0 0 300 190" class="kg-ill" aria-hidden="true">
      ${person(80, 182, 0.65)}${person(150, 182, 0.6, { hair: "long", shirt: "kg-ill-yellow" })}
      <rect class="kg-ill-white kg-ill-line" x="200" y="40" width="70" height="120" rx="12"/>
      <path class="kg-ill-accent kg-ill-line" d="M214 120l14-30 14 14 14-40"/>
    </svg>`,
    hand: `<svg viewBox="0 0 440 400" class="kg-ill" aria-hidden="true">
      <circle class="kg-ill-ball" cx="250" cy="200" r="150"/>
      <rect class="kg-ill-yellow kg-ill-line" x="150" y="40" width="160" height="300" rx="24" transform="rotate(8 230 190)"/>
      <rect class="kg-ill-white kg-ill-line" x="164" y="64" width="132" height="250" rx="8" transform="rotate(8 230 190)"/>
      <path class="kg-ill-skin kg-ill-line" d="M110 400c10-80 30-120 60-150 20-20 50-10 50 14 0 20-20 40-30 60l-10 76Z"/>
      ${bubble(90, 110, 40)}${bubble(380, 300, 36, "long")}
    </svg>`,
  };
  document.querySelectorAll("[data-ill]").forEach((el) => (el.innerHTML = ILL[el.dataset.ill] || ""));

  const LOGO = `<svg viewBox="0 0 120 120" aria-hidden="true" class="kg-logo-mark">
      <g class="kg-logo-rays">${Array.from({ length: 11 }, (_, i) => { const a = (-160 + i * 14) * Math.PI / 180; return `<path d="M${60 + Math.cos(a) * 30} ${44 + Math.sin(a) * 30}L${60 + Math.cos(a) * 42} ${44 + Math.sin(a) * 42}"/>`; }).join("")}</g>
      <path class="kg-logo-house" d="M40 52l12-10 8 7 8-7 12 10v8H40Z"/>
      <text x="60" y="78" text-anchor="middle" class="kg-logo-type">Brand</text>
      <text x="60" y="96" text-anchor="middle" class="kg-logo-type">Name</text>
    </svg>`;
  const ARROW = '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="7" class="kg-arrow-dot"/><path d="M5.6 4.2 8.4 7l-2.8 2.8" class="kg-arrow-line"/></svg>';
  const store = (kind) => `<a class="kg-store" href="#" aria-label="${kind === "a" ? "Download from the app store" : "Get it on the app store"}" data-label="${kind === "a" ? "App store" : "App Marketplace"} Badge (black round plate)"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${kind === "a" ? "M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8C6.9 7.3 5.4 8.2 4.6 9.7c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-4ZM14.1 5.6c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z" : "M4 2.8v18.4c0 .5.5.8.9.6l16-8.9c.5-.3.5-.9 0-1.2l-16-9C4.5 2 4 2.3 4 2.8Z"}"/></svg><span><small>${kind === "a" ? "Download on the" : "GET IT ON"}</small><b>${kind === "a" ? "App Store" : "Google Play"}</b></span></a>`;
  const NAV = [["index.html", "To the first page", "home"], ["service.html", "Service Features", "service"], ["about.html", "About us", "about"], ["#", "Terms of Use", "terms"]];
  const navLink = ([href, txt, key]) => `<a href="${href}"${(key === page || (key === "service" && page === "detail")) ? ' class="active"' : ""}>${txt}</a>`;

  const header = document.querySelector("[data-slot='header']");
  if (header) {
    header.classList.add("kg-header");
    header.innerHTML = `<a class="kg-logo" href="index.html" aria-label="Brand first page" data-label="Logo — sunburst and house shape inside an orange circle + two-line logotype">${LOGO}</a>
      <nav class="kg-nav" aria-label="Main menu"><ul>
        <li>${navLink(NAV[0])}</li>
        <li class="has-dropdown">${navLink(NAV[1])}<div class="kg-mega-bg"></div>
          <div class="kg-mega"><ul class="kg-mega__list">
            <li><a href="detail.html"><figure><div class="wf-img" data-label="Feature 1 intro image · Landscape 537:335"></div></figure><figcaption>Feature name 1, two words here</figcaption></a></li>
            <li><a href="service.html#f2"><figure><div class="wf-img" data-label="Feature 2 intro image · Landscape 537:335"></div></figure><figcaption>Feature Name 2</figcaption></a></li>
            <li><a href="service.html#f3"><figure><div class="wf-img" data-label="Feature 3 intro image · Landscape 537:335"></div></figure><figcaption>Feature Name 3</figcaption></a></li>
          </ul><div class="kg-mega__foot"><a class="kg-textlink kg-textlink--plain" href="service.html"><span class="txt">Back to Features List</span><span class="circle">${ARROW}</span></a></div></div>
        </li>
        <li>${navLink(NAV[2])}</li><li>${navLink(NAV[3])}</li>
        <li class="kg-nav__store">${store("a")}</li><li class="kg-nav__store">${store("g")}</li>
      </ul></nav>
      <button type="button" class="kg-toggle" aria-label="Open Menu" aria-expanded="false"><span></span><span></span></button>
      <div class="kg-spnav" data-slot="menu-drawer"><nav>
        <ul class="kg-spnav__list">
          <li><a href="index.html">First Page</a></li>
          <li><a href="service.html">Service features</a><ul class="kg-spnav__sub"><li><a href="detail.html">Feature name 1, two words here</a></li><li><a href="service.html#f2">Feature Name 2</a></li><li><a href="service.html#f3">Feature Name 3</a></li></ul></li>
          <li><a href="about.html">About us</a></li><li><a href="#">Terms of service</a></li>
        </ul>
        <div class="kg-spnav__dl"><p>App ‹Brand Name› (Free)</p><div class="kg-spnav__stores">${store("a")}${store("g")}</div></div>
        <ul class="kg-spnav__bottom"><li><a href="#">Contact Us</a></li><li><a href="#">Privacy policy</a></li></ul>
      </nav></div>`;
  }

  document.querySelectorAll("[data-download]").forEach((el) => {
    el.innerHTML = `<div class="kg-dl__head"><div class="kg-dl__logo">${LOGO}</div><p>The app ‹Brand Name› is<br>Free to download from the app stores.</p></div>
      <div class="kg-dl__bottom"><div class="kg-dl__col"><div class="kg-dl__in">${store("a")}<div class="kg-qr" data-label="QR Code"></div></div></div><div class="kg-dl__col"><div class="kg-dl__in">${store("g")}<div class="kg-qr" data-label="QR Code"></div></div></div></div>`;
  });
  document.querySelectorAll("[data-arrow]").forEach((el) => (el.innerHTML = ARROW));

  const footer = document.querySelector("[data-slot='footer']");
  if (footer) {
    footer.classList.add("kg-footer");
    footer.innerHTML = `<div class="kg-container">
      <p class="kg-footer__logo"><a href="index.html" aria-label="Brand first page">${LOGO}</a></p>
      <nav><ul class="kg-footer__nav">${NAV.map((n) => `<li>${navLink(n)}</li>`).join("")}</ul></nav>
      <p class="kg-footer__copy"><span class="small">Operations</span><a href="#">Company Name Inc.</a></p>
    </div>`;
    footer.insertAdjacentHTML("afterend", `<div class="kg-share"><ul><li><a href="#" aria-label="Share via messenger" class="kg-share__msg">M</a></li><li><a href="#" aria-label="Share via SNS" class="kg-share__sns">S</a></li><li>Divide</li></ul></div>
      <div class="kg-bottombar" data-slot="bottom-bar"><p><span class="orange">”Your short slogan here”</span>Of<br>Solve your health worries!</p><a class="kg-bottombar__btn" href="#">Open in the free app</a></div>`);
  }

  // Header — original page.js: scrolling past 20px adds header.scroll_active (the logo circle shrinks over .4s)
  const head = document.querySelector(".kg-header");
  const onScroll = () => head?.classList.toggle("scroll_active", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mega menu — is-open only while the pointer is over it
  document.querySelectorAll(".kg-nav .has-dropdown").forEach((li) => {
    li.addEventListener("mouseenter", () => li.classList.add("is-open"));
    li.addEventListener("mouseleave", () => li.classList.remove("is-open"));
  });

  // Phone menu — toggles body.open
  const toggle = document.querySelector(".kg-toggle");
  toggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".kg-spnav__list a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("open"); toggle?.classList.remove("is-open"); }));

  // In-page links — 600ms swing
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : document.documentElement;
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY;
    if (reduce || !window.gsap) return scrollTo(0, y);
    const s = { y: scrollY };
    gsap.to(s, { y, duration: 0.6, ease: "sine.inOut", onUpdate: () => scrollTo(0, s.y) });
  }));

  // Subpage open — original: on load #fadein_wrap_page brightens over 4.6s cubic-bezier(.19,1,.22,1) delayed .5s, title lines start rising after .2s, the text below appears after 1.2s
  if (page !== "home") {
    const go = () => {
      document.querySelector(".kg-fadein-page")?.classList.add("is_open");
      setTimeout(() => document.querySelectorAll(".kg-popout-page > *").forEach((el) => el.classList.add("is-pop")), 200);
      setTimeout(() => document.querySelectorAll(".kg-h1-bottom").forEach((el) => el.classList.add("is_open")), 1200);
    };
    document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
  }
})();
