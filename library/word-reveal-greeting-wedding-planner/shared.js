// Common to all pages: draws in the opening curtain, header logo, menu button and drawer (MicroModal), footer and specks, and inner # links glide smoothly.
// The original uses scrollIntoView / scrollTo( without a smooth-scroll library{ behavior: smooth })
(() => {
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HP = (window.HP = { reduced });

  // Newly built placeholder lettering logo instead of the original thin handwriting-like English logo
  const wordmark = `<svg class="hp-wordmark" viewBox="0 0 300 30" fill="currentColor" aria-hidden="true"><text x="150" y="24" text-anchor="middle" font-size="27" letter-spacing="3.2">BRAND WEDDING</text></svg>`;
  const badge = `<svg class="hp-wordmark" viewBox="0 0 210 150" fill="currentColor" aria-hidden="true"><text x="105" y="58" text-anchor="middle" font-size="34" letter-spacing="4">BRAND</text><text x="105" y="98" text-anchor="middle" font-size="34" letter-spacing="4">WEDDING</text><text x="105" y="132" text-anchor="middle" font-size="13" font-style="italic" letter-spacing="1">Since 20XX</text></svg>`;
  // Slot for the original regional map silhouette — redrawn as land with rough edges stretching in two branches around a bay
  const island = (cls) => `<svg class="${cls}" viewBox="0 0 1300 700" fill="currentColor" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <defs><filter id="hp-rough-${cls}"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="26"/></filter></defs>
    <path filter="url(#hp-rough-${cls})" d="M200 120c60-40 140-30 160 30 20 70-60 120-40 200 30 110 210 170 360 160 170-10 300-90 330-210 20-90-30-160 30-220 70-60 190-30 210 60 30 130-10 260-80 360-110 150-330 200-520 190-210-10-390-90-450-230-50-120 20-250 0-340z"/>
  </svg>`;
  HP.icons = { wordmark, badge, island };

  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="hp-opening" data-slot="opening" aria-hidden="true"><div class="hp-opening__logo">${wordmark}</div></div>`,
  );

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("hp-header");
    head.innerHTML = `
      <div class="hp-header__wrap">
        <a class="hp-header__logo" href="index.html" data-label="Brand English text logo">${wordmark}</a>
      </div>
      ${page === "home" ? `
      <button class="hp-nav-btn" id="hp-nav-btn" type="button" aria-expanded="false" aria-controls="hp-nav"><span class="hp-nav-btn__text">Menu</span></button>
      <div class="hp-nav-overlay" id="hp-nav" aria-hidden="true" data-slot="menu-drawer">
        <nav class="hp-nav" aria-label="Main menu">
          <ul class="hp-nav__list">
            <li><a href="#message" data-fx="gradient-slide-hover">Greeting</a></li>
            <li><a href="#future" data-fx="gradient-slide-hover">What We Cherish</a></li>
            <li><a href="#planning" data-fx="gradient-slide-hover">Wedding preparation steps</a></li>
            <li><a href="#access" data-fx="gradient-slide-hover">Directions</a></li>
          </ul>
          <div class="hp-nav__contact"><a class="hp-arrow" href="contact.html" data-fx="gradient-slide-hover">Contact us this way</a></div>
          <div class="hp-nav__insta"><a class="hp-arrow" href="#" data-label="Photo account English name">Instagram</a></div>
        </nav>
      </div>` : ""}`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("hp-footer");
    foot.innerHTML = `<div class="hp-footer__area">${island("hp-footer__island")}<div class="hp-footer__logo" data-label="Round brand logo (white)">${badge}</div><p class="hp-footer__copy" data-label="English copyright, one line">© 2026 Brand Wedding</p></div>`;
  }

  // Noise — the grain-film-overlay part fixed to the screen (original: screen-size canvas · half dots · ten frames · 15 frames per second · .05 opacity)
  if (!reduced) {
    const grain = document.createElement("div");
    grain.className = "hp-noise";
    grain.setAttribute("data-fx", "grain-film-overlay");
    grain.setAttribute("data-fx-grain-film-overlay", `frames: 10; fps: 15; density: .5; res: ${Math.min(1600, innerWidth)}; ratio: ${(innerHeight / innerWidth).toFixed(3)}`);
    grain.setAttribute("aria-hidden", "true");
    document.body.append(grain);
  }

  // Inner # link — smooth scroll to that spot
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href.length < 2) return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }),
  );

  // Menu drawer — opened and closed with MicroModal(0.4.10). Scrolling down past 700px makes the button appear in .3s
  const btn = document.getElementById("hp-nav-btn");
  if (btn && window.MicroModal) {
    MicroModal.init({ awaitCloseAnimation: true, disableScroll: true, awaitOpenAnimation: true });
    const overlay = document.getElementById("hp-nav");
    const close = () => { MicroModal.close("hp-nav"); document.body.style.overflow = ""; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", () => {
      if (btn.getAttribute("aria-expanded") === "true") close();
      else { MicroModal.show("hp-nav", { disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true }); document.body.style.overflow = "hidden"; btn.setAttribute("aria-expanded", "true"); }
    });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelectorAll(".hp-nav__list a").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const t = document.querySelector(a.getAttribute("href"));
        if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - document.documentElement.clientTop, behavior: reduced ? "auto" : "smooth" });
        close();
      }),
    );
    const onScroll = () => btn.classList.toggle("active", scrollY > 700);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
