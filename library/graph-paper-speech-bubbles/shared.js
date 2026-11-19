// Shared by all pages: draws the header (logo tag, one-line nav, vertical speech-bubble tabs, hamburger), left vertical news, footer and loader in one place, and
// Hooks up logo shrink, phone menu and appear (.s-op · .s-up). Original values: loader fills over 2.5s after 1s → clears at 3.4s, .8x when the logo exceeds 150px,
// Appear .s-op 1s (start 20% 95%) · .s-up .5s (start top 95%), phone menu items from .1s at .05s intervals.
(() => {
  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SK = (window.SK = { reduced, page });

  const sns = '<svg viewBox="0 0 24 20" aria-hidden="true"><path d="M2 3.5h20v11H10l-5 4v-4H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 9h10" stroke="currentColor" stroke-width="1.8"/></svg>';

  // Logo tag (gray plate + four name lines + handwriting) redrawn at the same size and position as the original
  const logoSvg = `<svg viewBox="0 0 305 291" aria-hidden="true">
    <path class="sk-logo__plate" d="M0 0h283a22 22 0 0 1 22 22v168L0 291z"/>
    <path class="sk-logo__tag" d="M88 214l242-26 8 72-242 26z"/>
    <g class="sk-logo__name" text-anchor="middle">
      <text x="152" y="63" font-size="31" font-weight="500" letter-spacing="9">Four-character name</text>
      <text x="152" y="99" font-size="25" font-weight="400" letter-spacing="10">How to Read the Name</text>
      <text x="152" y="125" font-size="16" font-weight="500" letter-spacing="3.6">ENGLISH NAME</text>
      <text x="150" y="158" font-size="25" font-weight="800" letter-spacing="3">Decorative Font Name</text>
    </g>
    <text class="sk-logo__hand" x="98" y="250" transform="rotate(-6 98 250)" font-size="40">Your handwritten subtitle here</text>
    <path class="sk-logo__rule" d="M96 258c60-8 150-16 232-27"/>
  </svg>`;

  const loaderLogo = (tone) => `<svg class="sk-loader__logo sk-loader__logo--${tone}" viewBox="0 0 242 137" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <g text-anchor="middle">
      <text x="121" y="32" font-size="31" font-weight="600" letter-spacing="10">Four-character name</text>
      <text x="121" y="70" font-size="26" font-weight="400" letter-spacing="12">How to Read the Name</text>
      <text x="121" y="98" font-size="17" font-weight="600" letter-spacing="4">ENGLISH NAME</text>
      <text x="121" y="132" font-size="27" font-weight="800" letter-spacing="3">Decorative Font Name</text>
    </g>
  </svg>`;

  // Original fukidashi.svg (52×308 vertical speech bubble) redrawn at the same size — fill and stroke are set by shared.css with skin variables
  const sidetabBg = '<svg class="sk-sidetab__bg" viewBox="0 0 52 308" aria-hidden="true"><path d="M44.4 292.2H24.6l-7.6 7.9c-.3.3-.6.2-.6-.2v-7.7H7.1V7.2h37.3z"/></svg>';

  const menu = [
    ["home", "index.html", "Home"],
    ["about", "about.html", "Profile"],
    ["list", "list.html", "What Name often says"],
    ["", "#", "Menu 4"],
    ["", "#", "Menu 5"],
    ["", "#", "Menu 6 Coach"],
    ["news", "news.html", "News"],
    ["", "#", "Glossary"],
  ];
  const cur = (k) => (k && (k === page || (k === "news" && page === "article")) ? ' aria-current="page"' : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sk-head");
    head.innerHTML = `
      <h1 class="sk-logo" id="skLogo"><a href="index.html" aria-label="Home">${logoSvg}</a></h1>
      <nav class="sk-nav" id="skNav" data-slot="menu">
        <div class="sk-nav__wrap">
          <ul class="sk-nav__list">
            ${menu.map(([k, h, t]) => `<li><a href="${h}"${cur(k)}>${t}</a></li>`).join("")}
            <li class="noline"><a href="#">Inquiry</a></li>
            <li class="noline sns"><a href="#" aria-label="SNS">${sns}<span>SNS</span></a></li>
          </ul>
          <p class="sk-sidetab" data-slot="side-tab"><a href="list.html">${sidetabBg}What Name often says</a></p>
        </div>
      </nav>
      <button class="sk-burger" id="skBurger" type="button" aria-label="Open Menu" aria-expanded="false">
        <span class="sk-burger__line"><i></i><i></i><i></i></span>
        <span class="sk-burger__text"><span><b>MENU</b><b>CLOSE</b></span></span>
      </button>`;
  }

  const side = document.querySelector('[data-slot="side-news"]');
  if (side) {
    side.classList.add("sk-sidenews");
    side.innerHTML = '<div><time>0000.00.00</time><p><a href="article.html">Your latest News headline here [0000.00-00]</a></p></div>';
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sk-foot");
    foot.innerHTML = `
      <nav class="sk-foot__nav">
        <ul><li><a href="index.html">Home</a></li><li><a href="about.html">Profile</a></li><li><a href="list.html">What Name often says</a></li></ul>
        <ul><li><a href="#">Menu 4</a></li><li><a href="#">Menu 5</a></li><li><a href="#">Menu 6 Coach</a></li></ul>
        <ul><li><a href="news.html">News</a></li><li><a href="#">Glossary</a></li></ul>
        <ul><li><a href="#">Inquiry</a></li><li><a href="#">Privacy policy</a></li><li class="sns"><a href="#" aria-label="SNS">${sns}<span>SNS</span></a></li></ul>
      </nav>
      <p class="sk-foot__copy"><small>Copyright © Your copyright notice here</small></p>`;
  }

  // Loader only on the first page — sub pages use a white curtain body.is-under::after
  if (page === "home" && !reduced) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="sk-loader" id="skLoader" data-slot="loader" aria-hidden="true">
        <div class="sk-loader__box">${loaderLogo("base")}<div class="sk-loader__fill" id="skFill">${loaderLogo("ink")}</div></div>
      </div>`
    );
    const loader = document.getElementById("skLoader");
    requestAnimationFrame(() => document.getElementById("skFill").classList.add("is-loading"));
    setTimeout(() => loader.classList.add("is-out"), 3400);
    loader.addEventListener("animationend", (e) => {
      if (e.animationName === "sk-out") loader.remove();
    });
  }
  if (page !== "home") document.body.classList.add("is-under");

  const logo = document.getElementById("skLogo");
  if (logo) {
    const onScroll = () => logo.classList.toggle("is-scroll", scrollY > 150 && innerWidth > 835);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const burger = document.getElementById("skBurger");
  const nav = document.getElementById("skNav");
  if (burger && nav) {
    nav.querySelectorAll(".sk-nav__list li").forEach((li, i) => (li.style.animationDelay = `${0.1 + i * 0.05}s`));
    const toggle = (open = !nav.classList.contains("is-open")) => {
      nav.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => toggle());
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => innerWidth <= 1080 && toggle(false)));
  }

  // Hash link — original jQuery animate (800ms, swing) to 200px above the target. The swing formula 0.5 − cos(πp)/2 is the same as GSAP sine.inOut.
  // When entering with a hash in the URL, it jumps to the top and 100ms later scrolls down the same way. Like the original, default behavior is not prevented.
  let glideTween;
  const hashTarget = (hash) => {
    if (!hash || hash.length < 2) return null;
    try { return document.querySelector(hash); } catch { return null; }
  };
  const glide = (el) => {
    glideTween?.kill();
    const pos = { y: scrollY };
    const to = Math.max(0, el.getBoundingClientRect().top + scrollY - 200);
    glideTween = gsap.to(pos, { y: to, duration: reduced ? 0 : 0.8, ease: "sine.inOut", onUpdate: () => scrollTo(0, pos.y) });
  };
  if (hashTarget(location.hash)) {
    scrollTo(0, 0);
    setTimeout(() => glide(hashTarget(location.hash)), 100);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const el = a && hashTarget(a.getAttribute("href"));
    if (el) glide(el);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".s-op").forEach((el) => {
      gsap.to(el, { opacity: 1, duration: 1, scrollTrigger: { trigger: el, start: "20% 95%", end: "center 80%" } });
    });
    gsap.utils.toArray(".s-up").forEach((el) => {
      gsap.to(el, { y: 0, duration: 0.5, scrollTrigger: { trigger: el, start: "top 95%", end: "top 90%" } });
    });
  });
  SK.mm = mm;
})();
