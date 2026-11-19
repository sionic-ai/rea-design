// Shared across the site — sets up header, burger, full-screen menu, vertical button column and footer with the same markup on every page,
// Sets up Lenis (1.0.19 defaults), header hiding, button row hiding, and menu open/close
(() => {
  const NAV = [["Origin", "index.html#origin"], ["To stay", "stay.html"], ["To eat", "index.html#eat"], ["To work", "work.html"], ["Borrow", "index.html#rental"], ["Reads", "news.html"], ["Directions", "stay.html#access"]];
  // Logo — a three-peak symbol with sawtooth edges + English wordmark + small tagline (the spot of the original logo graphic)
  const LOGO = `<svg viewBox="0 0 144 109" aria-hidden="true"><path class="mt-logo__mark" d="m50 12 13 22 13-22 13 22 13-22v40H90L76 30 63 52 50 30v22H44V12Z"/><text x="72" y="84" text-anchor="middle" font-size="24" letter-spacing="3">Name</text><text x="72" y="102" text-anchor="middle" font-size="10" letter-spacing="2">guesthouse</text></svg>`;
  const ICON = {
    mail: `<svg viewBox="0 0 18 16"><rect x="1" y="2" width="16" height="12"/><path d="m1 3 8 6 8-6"/></svg>`,
    line: `<svg viewBox="0 0 18 16"><path d="M9 1.5C4.6 1.5 1 4.3 1 7.7c0 3 2.8 5.5 6.6 6.1l-.4 1.7L11 13.6c3.5-.8 6-3.1 6-5.9 0-3.4-3.6-6.2-8-6.2Z"/></svg>`,
    cal: `<svg viewBox="0 0 18 16"><rect x="1.5" y="2.5" width="15" height="12"/><path d="M1.5 6h15M5 1v3M13 1v3"/></svg>`,
    insta: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6"/><circle cx="12" cy="12" r="4.8"/><circle cx="17.6" cy="6.4" r=".6"/></svg>`,
  };

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "mt-head";
    const now = new Date();
    const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    head.innerHTML = `
      <div class="mt-head__w"><div class="mt-head__in">
        <div class="mt-head__logo-wrap">
          <a class="mt-logo mt-ro" href="index.html" aria-label="Lodging English wordmark">${LOGO}</a>
          <div class="mt-head__info">
            <p class="mt-head__date">${date}</p>
            <div class="mt-head__weather"><span>City Name</span><svg viewBox="0 0 34 24" aria-label="Weather icon slot"><path d="M9 21a6 6 0 0 1-.6-12A8 8 0 0 1 24 7.5 6.8 6.8 0 0 1 25.5 21Z"/></svg><span>00°/00°</span></div>
            <a class="mt-head__news mt-ro" href="list.html"><span>News</span><span>Your latest news title here</span></a>
          </div>
        </div>
        <nav class="mt-head__links">${NAV.map(([t, h]) => `<a class="mt-ro" href="${h}">${t}</a>`).reverse().join("")}</nav>
      </div></div>`;
  }

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="mt-burger-wrap"><button class="mt-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button></div>
    <nav class="mt-nav" data-slot="menu-overlay" aria-label="Full menu">
      <div class="mt-nav__in"><div class="mt-nav__grid">
        <div class="mt-nav__detail">
          <a class="mt-logo mt-ro" href="index.html" aria-label="Lodging English wordmark">${LOGO}</a>
          <p>Postal code 000-0000<br>Your lodging address here, on one line</p>
          <p style="padding-top:0">TEL : 000-000-0000<br>(Weekdays 00:00–00:00)</p>
          <a class="is-map mt-ro" href="#">Google map</a>
        </div>
        <div class="mt-nav__img wf-img" data-label="Courtyard beyond the veranda · soft daylight · portrait 4:5"></div>
        <div class="mt-nav__list-wrap">
          <nav class="mt-nav__list">${NAV.map(([t, h]) => `<a class="mt-ro" href="${h}">${t}</a>`).join("")}</nav>
          <div class="mt-nav__btns"><a class="mt-ro" href="#">${ICON.mail}Contact Us</a><a class="mt-ro" href="#">${ICON.cal}Book now</a></div>
        </div>
      </div></div>
    </nav>
    <div class="mt-cta" data-slot="side-cta">
      <a class="mt-ro is-contact" href="#">${ICON.mail}Contact Us</a>
      <a class="mt-ro is-line" href="#">${ICON.line}LINE</a>
      <a class="mt-ro is-reserve" href="#">${ICON.cal}Reservation</a>
    </div>`;
  // Like the original, place it right after the header line (before the body), since the document order must match so the button row is read at the same time
  (head || document.body.firstChild).after(...wrap.children);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "mt-foot";
    foot.innerHTML = `
      <div class="mt-foot__photo wf-img" data-label="Distant mountain ridge reflected in an evening rice paddy · blue glow after sunset · fills the screen (fixed)"></div>
      <div class="mt-foot__w"><div class="mt-foot__flex">
        <div class="mt-foot__left">
          <a class="mt-foot__logo mt-logo mt-ro" href="index.html" aria-label="Lodging English wordmark">${LOGO}</a>
          <nav class="mt-foot__nav"><ul>${[["Contact Us", "#"], ...NAV.slice().reverse()].map(([t, h]) => `<li><a class="mt-ro" href="${h}">${t}</a></li>`).join("")}</ul></nav>
        </div>
        <div class="mt-foot__right">
          <div>
            <p>Postal code 000-0000 Enter the lodging address here in one line 000</p>
            <p>TEL : 000-000-0000 (weekdays 00:00~00:00)</p>
            <a class="mt-foot__parking mt-ro" href="#">Parking Info</a>
            <div class="mt-foot__data"><p>Check-in</p><p>00:00~00:00<br>(Self check-in afterward)</p><p>Check-out</p><p>~00:00</p></div>
            <div class="mt-foot__unei"><p>Operations</p><a class="mt-ro" href="#">Company name</a></div>
          </div>
          <div class="mt-foot__bottom">
            <div class="mt-foot__icons"><a class="mt-ro" href="#" aria-label="Social Media">${ICON.insta}</a></div>
            <p class="mt-foot__copy">© Copyright Name all right reserved.</p>
          </div>
        </div>
      </div></div>`;
  }

  // ── Smooth scroll (original Lenis 1.0.19 defaults) ──
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const L = window.Lenis || window.lenis;
  let lenis = null;
  if (L && !reduce) {
    lenis = new L();
    window.mtLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ── Hamburger: is-menu on body, remembers the scroll position when opening and restores it on close ──
  let keepY = 0;
  document.querySelector(".mt-burger").addEventListener("click", () => {
    const open = !document.body.classList.contains("is-menu");
    if (open) { keepY = scrollY; document.body.classList.add("is-menu"); lenis?.stop(); }
    else { document.body.classList.remove("is-menu"); scrollTo(0, keepY); lenis?.start(); }
  });
  document.querySelectorAll(".mt-nav a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("is-menu"); lenis?.start(); }));

  // ── Hide header (past the hero height) · hide button row and logo (when the footer is visible) ──
  const hd = document.querySelector(".mt-head"), burger = document.querySelector(".mt-burger");
  const cta = document.querySelector(".mt-cta"), logoWrap = document.querySelector(".mt-head__logo-wrap"), ft = document.querySelector(".mt-foot");
  const onScroll = () => {
    const y = scrollY, h = innerHeight;
    if (document.body.dataset.page === "home") {
      hd.classList.toggle("is-hidden", y > h);
      burger.classList.toggle("is-ink", y > h);
    } else burger.classList.add("is-ink");
    if (ft) {
      const near = y + h >= document.documentElement.scrollHeight - ft.offsetHeight;
      cta.classList.toggle("is-hidden", near);
      logoWrap?.classList.toggle("is-hidden", near);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("load", onScroll);
  onScroll();
})();
