// Interactions shared across pages — MENU pill, menu panel open/close, pill and official-site strip that hide on scroll down and return on scroll up, handwritten logo drawing, moving within the same section.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("(min-width: 768px)");

  // The original logo is an image, so it is drawn as a handwritten SVG of the same position and size. Hero uses a gradient, footer and menu use white text
  let n = 0;
  const logoSVG = (mono) => {
    const id = `eno-lg-${++n}`;
    const paint = mono ? "currentColor" : `url(#${id})`;
    return `<svg viewBox="0 0 660 300" role="img" aria-label="Your logo here">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0" class="eno-stop-a"/><stop offset="0.62" class="eno-stop-b"/><stop offset="1" class="eno-stop-c"/>
      </linearGradient></defs>
      <g transform="rotate(-9 330 150)" fill="${paint}">
        <text class="eno-logo__hand" x="150" y="118" font-size="150">Here</text>
        <text class="eno-logo__hand" x="30" y="262" textLength="560" lengthAdjust="spacingAndGlyphs" font-size="250">LOGO</text>
      </g>
      <path d="M18 292 C 160 270 300 236 430 196 S 600 120 646 96" fill="none" stroke="${paint}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M560 70 c 14 -18 34 -16 40 -2 c 6 14 -14 26 -28 18" fill="none" stroke="${paint}" stroke-width="3" stroke-linecap="round"/>
      <text class="eno-logo__latin" x="430" y="262" font-size="17" fill="${mono ? "currentColor" : "var(--kf-accent)"}">SITE NAME</text>
      <text class="eno-logo__latin" x="520" y="290" font-size="22" fill="${mono ? "currentColor" : "var(--site-pink)"}">Logo</text>
    </svg>`;
  };
  document.querySelectorAll("[data-eno-logo]").forEach((el) => { el.innerHTML = logoSVG(el.dataset.enoLogo === "mono"); });

  // ───────── Menu panel: the original uses jQuery animate 300ms easeInOutQuad, display:flex first and then opacity only ─────────
  const menu = document.querySelector(".eno-menu");
  const btn = document.querySelector(".eno-menu-btn");
  const close = document.querySelector(".eno-menu__close");
  let open = false;
  const lock = (on) => {
    // The original locks background scroll only below 768
    if (md.matches) return;
    const bar = innerWidth - document.body.clientWidth;
    document.body.style.paddingRight = on ? `${bar}px` : "";
    document.documentElement.style.overflow = on ? "hidden" : "";
  };
  const show = () => {
    open = true;
    lock(true);
    menu.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    gsap.killTweensOf(menu);
    gsap.to(menu, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power1.inOut" });
  };
  const hide = () => {
    open = false;
    lock(false);
    btn.setAttribute("aria-expanded", "false");
    gsap.killTweensOf(menu);
    gsap.to(menu, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power1.inOut", onComplete: () => menu.classList.remove("is-open") });
  };
  if (menu && btn) {
    btn.addEventListener("click", (e) => { e.preventDefault(); open ? hide() : show(); });
    close?.addEventListener("click", (e) => { e.preventDefault(); hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) hide(); });
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a[href*='#']");
      if (a && new URL(a.href).pathname === location.pathname) hide();
    });
  }

  // ───────── Hides after scrolling down 500px, shows again .1s after scrolling up — always visible at the very bottom ─────────
  const floaters = [...document.querySelectorAll(".eno-menu-btn, .eno-float")];
  const FIX = 500;
  let last = 0;
  const state = new Map(floaters.map((el) => [el, { up: false, waiting: false, timer: 0 }]));
  const set = (el, on) => { el.classList.toggle("is-show", on); el.classList.toggle("is-hide", !on); };
  const onScroll = () => {
    const y = scrollY;
    floaters.forEach((el) => {
      const s = state.get(el);
      if (y > last) {
        s.up = false;
        clearTimeout(s.timer);
        s.waiting = false;
        if (y > FIX) el.classList.add("is-fix");
        if (document.documentElement.scrollHeight <= innerHeight + y) set(el, true);
        else if (el.classList.contains("is-show")) set(el, false);
      } else {
        s.up = true;
        if (y <= 0) el.classList.remove("is-fix", "is-show", "is-hide");
        else if (!s.waiting) {
          s.waiting = true;
          s.timer = setTimeout(() => { if (s.up && el.classList.contains("is-fix")) set(el, true); }, 100);
        }
      }
    });
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  // The original applies ”Visible” once to the pills and bands 8s after opening
  setTimeout(() => floaters.forEach((el) => { el.classList.remove("is-hide"); el.classList.add("is-show"); }), 8000);

  // ───────── Move within the same section: the original is jQuery 600ms swing ─────────
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']:not([href='#'])");
    if (!a) return;
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const from = scrollY, to = target.getBoundingClientRect().top + scrollY;
    const o = { y: from };
    gsap.to(o, { y: to, duration: reduce ? 0 : 0.6, ease: "sine.inOut", onUpdate: () => scrollTo(0, o.y) });
  });
})();

// Hashtag grid More — as in the original widget, pressing adds two rows of cells and the panel grows in .33s (starting .28s after the press), and the panel around More disappears in .28s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-eno-more]").forEach((btn) => {
    const wrap = btn.parentElement, grid = wrap.parentElement.querySelector(".eno-insta__grid, .gd-insta__grid");
    if (!grid) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const from = grid.offsetHeight;
      grid.append(...[...grid.children].slice(0, 12).map((li) => li.cloneNode(true)));
      const to = grid.offsetHeight;
      gsap.fromTo(grid, { height: from }, { height: to, delay: reduce ? 0 : 0.14, duration: reduce ? 0 : 0.33, ease: "none", onComplete: () => gsap.set(grid, { clearProps: "height" }) });
      gsap.to(wrap, { autoAlpha: 0, delay: reduce ? 0 : 0.16, duration: reduce ? 0 : 0.28, ease: "none" });
    });
  });
})();
