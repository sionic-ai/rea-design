// Common to all pages — inserts the header menu and footer as a set, and uses Lenis smooth scroll only on wide screens (768px and up),
// On phone, opening the hamburger menu pins the body in place.
// Page transition veil (page-veil), underline, photo zoom, text rise and parallax are attached by the _fx motion part via data-fx
(() => {
  const MONO = '<svg class="ab-mono" viewBox="0 0 66 38" fill="none" stroke="currentColor" stroke-width="1" aria-label="Monogram slot"><circle cx="24" cy="19" r="15"/><circle cx="42" cy="19" r="15"/><path d="M33 3v32"/></svg>';
  const LINKS = [["list.html", "Works"], ["about.html", "About"], ["news.html", "News"], ["#ab-contact", "Contact"]];
  const slot = document.querySelector('[data-slot="header"]');
  if (slot) {
    const dark = slot.dataset.nav === "dark";
    slot.classList.add("ab-navsec");
    if (dark) slot.classList.add("is-flow");
    slot.innerHTML = `<nav class="ab-nav${dark ? " is-dark" : ""}" data-menu-status="closed" aria-label="Main menu">
      <div class="ab-nav__container">
        <div class="ab-nav__bg"></div>
        <div class="ab-nav__inner">
          <a class="ab-nav__logo" href="index.html" aria-label="First Page" data-label="Your workshop English name here"><span class="ab-word">Studio Name</span></a>
          <div class="ab-nav__items">
            <div class="ab-nav__center"><ul class="ab-nav__list" data-label="Your English menu name here">${LINKS.map(([h, t]) => `<li><a class="ab-nav__link" href="${h}"><span class="ab-nav__label" data-fx="sweep-through-hover" data-fx-sweep-through-hover="look: line" style="--fx-dur: .6s; --fx-ease: cubic-bezier(.525,0,0,1); --fx-line-y: -1px; --fx-line-h: 1px">${t}</span></a></li>`).join("")}</ul></div>
            <div class="ab-nav__end"><button class="ab-burger" type="button" data-menu-button aria-label="Open Menu"><span class="ab-burger__line"></span><span class="ab-burger__line"></span></button></div>
          </div>
        </div>
      </div>
    </nav>`;
  }
  const page = document.querySelector(".ab-page");
  if (page && !document.querySelector(".ab-footer")) {
    const f = document.createElement("footer");
    f.className = "ab-footer";
    f.dataset.slot = "footer";
    const link = (h, t) => `<a class="ab-flink" href="${h}"><span class="ab-ftxt">${t}</span></a>`;
    f.innerHTML = `<div class="ab-footer__wrap"><div class="ab-footer__grid">
      <div class="ab-footer__cell is-logo"><a class="ab-footer__logo" href="index.html" aria-label="First Page" data-label="Your workshop English name here"><span class="ab-word">Studio Name</span></a></div>
      <div class="ab-footer__cell is-contact" id="ab-contact"><div class="ab-footer__contact">
        <div class="ab-footer__col" data-label="Your three-line English address"><span class="ab-ftxt">Address Line 1</span><span class="ab-ftxt">Address Line 2</span><span class="ab-ftxt">City 00000</span></div>
        <div class="ab-footer__col">${link("tel:+0000000000", "+00 (0)0000 000 000")}${link("mailto:hello@example.com", "hello@example.com")}</div>
        <div class="ab-footer__col" data-label="Your two English social link names here">${link("#", "Link 1")}${link("#", "Link 2")}</div>
      </div></div>
      <div class="ab-footer__cell is-nav"><div class="ab-footer__col" data-label="Your English menu name here">${LINKS.map(([h, t]) => link(h, t)).join("")}${link("#", "Privacy Policy")}</div></div>
      <div class="ab-footer__cell is-mono">${MONO}</div>
      <div class="ab-footer__cell is-copy is-mid"><span class="ab-ftxt" data-label="Your studio’s English name and year here">© Studio Name 0000.</span></div>
      <div class="ab-footer__cell is-by is-mid"><div class="ab-footer__by" data-label="Studio name in English here"><span class="ab-ftxt">Design:</span>${link("#", "Designer Name")}</div></div>
    </div></div>`;
    page.after(f);
  }
  let lenis = null;
  const narrow = () => innerWidth < 768;
  const initLenis = () => {
    if (!narrow()) {
      if (!lenis && window.Lenis) lenis = new Lenis({ autoRaf: true });
    } else if (lenis) {
      lenis.destroy();
      lenis = null;
      document.documentElement.classList.remove("lenis");
    }
  };
  initLenis();
  let resizeTimer = 0;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(initLenis, 250); });

  const lock = () => {
    if (!narrow()) return;
    const b = document.body;
    b.style.top = `-${scrollY}px`;
    b.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.width = "100%";
  };
  const unlock = () => {
    if (narrow() || document.body.style.position === "fixed") {
      const b = document.body, y = parseInt(b.style.top || "0", 10) * -1;
      b.style.overflow = b.style.position = b.style.width = b.style.top = "";
      scrollTo(0, y);
    }
    lenis?.start();
  };
  addEventListener("pageshow", unlock);

  const nav = document.querySelector("[data-menu-status]");
  const btn = document.querySelector("[data-menu-button]");
  if (nav && btn) {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const open = nav.dataset.menuStatus === "open";
      nav.dataset.menuStatus = open ? "closed" : "open";
      btn.setAttribute("aria-expanded", String(!open));
      open ? unlock() : lock();
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", unlock));
  }

  // Current-page link marker within the same page — menu links connect our own pages to each other
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".ab-nav__link, .ab-flink").forEach((a) => {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  document.fonts?.ready.then(() => window.ScrollTrigger?.refresh());
})();
