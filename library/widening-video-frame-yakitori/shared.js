// Common to all pages: draws the header, drawer, menu button and footer in one place, and hooks up drawer opening, entrance, stagger (paroller 1.4.6 as in the original), big photo zoom parallax (simpleParallax 5.6.2), and back to top.
// Original values: reveal threshold 60px below the screen · fade-in threshold +300px below the screen · parallax (position - screen/2 + height - scroll) × 0.1, transform .1s ease
//            · under the big photo scale 1.3 (only above 834px) · back-to-top .5s swing
(() => {
  gsap.registerPlugin(ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const HB = (window.HB = { reduced });

  // Instead of the original brush-script logo, a brush stroke of the same place and size plus placeholder text
  const logo = `<svg viewBox="0 0 235 90" aria-label="Store Logo Slot">
    <path d="M2 64c40-6 92-16 150-30 30-7 58-16 82-26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M10 40c-6 10-8 24 2 32 7 6 18 4 24-2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <text class="sm" x="12" y="26" font-size="12" letter-spacing="1">Your modifier here</text>
    <text x="58" y="78" font-size="50" letter-spacing="2">Shop Name</text>
  </svg>`;
  HB.logo = logo;

  const links = [
    ["index.html", "Hero", "home"],
    ["about.html", "Shop About", "about"],
    ["about.html#commitment", "Our Conviction", ""],
    ["product.html", "Menu", "product"],
    ["index.html#info", "Shop Guide", ""],
    ["#footer", "Store info", ""],
    ["recruit.html", "Hiring Info", "recruit"],
  ];
  // The header’s two-row menu is paired row by row, not in the original’s left column → right column order
  const headOrder = [0, 4, 1, 5, 2, 6, 3];
  const li = (i) => `<li><a href="${links[i][0]}"${links[i][2] === page ? ' aria-current="page"' : ""}>${links[i][1]}</a></li>`;
  const btn = (label, href = "#", cls = "") =>
    `<a class="hb-btn ${cls}" href="${href}"><span class="hb-btn__box"><span>${label}</span><span>${label}</span></span></a>`;
  HB.btn = btn;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hb-head");
    head.innerHTML = `
      <div class="hb-head__in">
        <a class="hb-logo" href="index.html">${logo}</a>
        <ul class="hb-menu">${headOrder.map(li).join("")}</ul>
      </div>
      <nav class="hb-drawer" data-slot="menu-drawer" aria-label="Menu">
        <a class="hb-drawer__logo" href="index.html">${logo}</a>
        <div class="hb-drawer__note"><strong>Your slogan here,<br>Two lines.</strong><p>Introduce your shop in one line here.</p></div>
        <ul class="hb-drawer__menu">${links.map((_, i) => li(i)).join("")}</ul>
        ${btn("Your booking button here", "#")}
      </nav>
      <button class="hb-burger" type="button" aria-label="Open Menu">
        <span class="hb-burger__line"></span>
        <span class="hb-burger__txt"><span class="hb-burger__open">Menu</span><span class="hb-burger__close">Close</span></span>
      </button>`;
    const burger = head.querySelector(".hb-burger");
    const drawer = head.querySelector(".hb-drawer");
    burger.addEventListener("click", () => {
      burger.classList.toggle("is-open");
      drawer.classList.toggle("is-open");
      document.documentElement.classList.toggle("is-locked");
    });
    drawer.addEventListener("click", (e) => {
      if (!e.target.closest("a")) return;
      burger.classList.remove("is-open");
      drawer.classList.remove("is-open");
      document.documentElement.classList.remove("is-locked");
    });
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.id = "footer";
    foot.classList.add("hb-foot");
    if (page !== "home") foot.classList.add("hb-foot--under");
    foot.innerHTML = `
      ${page !== "home" ? '<div class="hb-foot__video"><div class="wf-img wf-video" data-label="Skewers over charcoal video · close-up of a smoking grill grate · warm light on a dark background · full width · 34.5s loop"><video src="media/mv.mp4" autoplay muted loop playsinline aria-hidden="true"></video></div></div>' : ""}
      <div class="hb-foot__in">
        <div class="hb-foot__logo"><span class="hb-foot__slogan">Your slogan here,<br>Two lines.</span><p>Introduce your shop in one line here.</p></div>
        <ul class="hb-foot__menu">${links.map((_, i) => li(i)).join("")}</ul>
        <div class="hb-foot__copy">© Store Name. All Rights Reserved.</div>
        <a class="hb-backtop" href="#top"><span class="hb-backtop__line"></span><span class="hb-backtop__txt">Back to top</span></a>
      </div>`;
    foot.querySelector(".hb-backtop").addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, { scrollTo: 0, duration: reduced ? 0 : 0.5, ease: "sine.inOut" });
    });
  }

  // Appear — the original adds a class on every scroll and load to elements within 60px below the screen (only once)
  const fades = [...document.querySelectorAll(".hb-fade")];
  const shows = [...document.querySelectorAll(".hb-show")];
  const reveal = () => {
    const top = scrollY;
    const bottom = top + innerHeight - 60;
    for (const el of fades) {
      if (el.classList.contains("is-in")) continue;
      const r = el.getBoundingClientRect();
      const t = r.top + top;
      if (t + r.height >= top && t <= bottom) el.classList.add("is-in");
    }
    // The original measures with offsetTop (value within the nearest positioned ancestor), so the group at the top of a section turns on at the first scroll
    for (const el of shows) if (top + innerHeight + 300 > el.offsetTop) el.classList.add("is-in");
  };
  if (reduced) {
    fades.concat(shows).forEach((el) => el.classList.add("is-in"));
  } else {
    addEventListener("scroll", reveal, { passive: true });
    addEventListener("load", reveal);
    reveal();
  }

  // Parallax — the same jquery.paroller 1.4.6 as the original (foreground, per-width multipliers xs .05 · sm -.05 · md .05 · above that .1)
  if (window.jQuery && jQuery.fn.paroller && !reduced) jQuery("[data-paroller-factor]").paroller();

  // Large photo zoom parallax — same simpleParallax 5.6.2 as the original { scale: 1.3, orientation: "down" }, not applied at 834px or below
  const zooms = document.getElementsByClassName("parallax");
  if (zooms.length && window.simpleParallax && !reduced) {
    if (innerWidth > 834) new simpleParallax(zooms, { scale: 1.3, orientation: "down" });
    else [...zooms].forEach((el) => { el.style.transform = "none"; el.style.transition = "none"; });
  }
})();
