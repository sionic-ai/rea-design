// Common to all pages: draws the header, menu panel, two modals, cookie strip and footer, and hooks up Lenis, header hide/brightness, text entrance, photo blur and slider.
// Original values: Lenis lerp .1 · header hides after scrolling down past 5vh · menu close delay .45s · cookie notice after 6s · text entrance at the line 20% from the screen bottom
//   (caption .3s · body .45s · big-body .6s · head-two per letter 1.5s/.03s stagger yPercent 20 · head-three 1.25s) power2.out
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const ST = (window.ST = { reduced, lenis: null });
  // GSAP can’t tween color-mix or var — skin variables are resolved to computed rgb values and passed in
  ST.cssColor = (value, alpha) => {
    const probe = document.createElement("i");
    probe.style.color = value;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return alpha == null ? c : c.replace(/^rgba?\(([^,]+),([^,]+),([^,)]+).*$/, `rgba($1,$2,$3, ${alpha})`);
  };

  const icon = {
    left: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10.5 6h-9M5 2.5 1.5 6 5 9.5"/></svg>',
    right: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1.5 6h9M7 2.5 10.5 6 7 9.5"/></svg>',
    close: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m2 2 8 8M10 2l-8 8"/></svg>',
    chevron: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1"><path d="m2.5 7.5 3.5-3.5 3.5 3.5"/></svg>',
    // Newly drawn placeholder symbol instead of the original: a knot of two loops joined top and bottom
    mark: '<svg viewBox="0 0 20 28" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 2h12L4 14h12L4 26h12"/><circle cx="10" cy="8" r="3.2"/><circle cx="10" cy="20" r="3.2"/></svg>',
    ig: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.8"/></svg>',
    li: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M5 7v4M5 5v.2M8 11V7m0 1.6c0-1 3-1.6 3 .4V11"/></svg>',
    be: '<svg viewBox="0 0 16 16" fill="currentColor"><text x="1" y="12" font-size="10" font-family="Arial" font-weight="700">Be</text></svg>',
    link: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M7 9l2-2M6 6.5 4.5 8a2 2 0 0 0 3 3L9 9.5M10 9.5 11.5 8a2 2 0 0 0-3-3L7 6.5"/></svg>',
  };
  ST.icon = icon;
  const logo = (cls = "") => `<a class="st-logo ${cls}" href="index.html" aria-label="Home">${icon.mark}<span>WORDMARK</span></a>`;
  const slogan = '<p class="st-head__slogan t-script" data-label="Your three fields in English script">Field One × Field Two × Field Three</p>';
  ST.logo = logo;

  /* ── Header + menu panel ── */
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("st-head");
    head.innerHTML = `
      <div class="st-head__side">
        <button class="st-btn is-glass" type="button" data-menu-btn>Menu <span class="st-btn__dots"><i></i><i></i><i></i><i></i></span></button>
        <div class="st-menu" data-slot="menu-panel">
          <div class="st-menu__card"><div class="st-menu__main">
            <nav class="st-menu__links">
              <a class="st-link" href="index.html#about">Menu 1</a>
              <a class="st-link" href="works.html">Menu 2</a>
              <a class="st-link" href="index.html#approach">Menu 3</a>
              <a class="st-link" href="news.html">Menu 4</a>
              <a class="st-link" href="#" data-open="form">Menu 5</a>
            </nav>
            <div class="st-menu__sep"></div>
            <address class="st-menu__addr">
              <div class="st-menu__line"><p class="t-cap">Address:</p><a class="st-link" href="#">Street 00, postal code, city here</a></div>
              <div class="st-menu__line"><p class="t-cap">Phone:</p><a class="st-link" href="#">+00 000 000 000</a></div>
            </address>
          </div></div>
        </div>
      </div>
      <div class="st-head__mid">${logo()}${slogan}</div>
      <div class="st-head__side is-right">
        <button class="st-btn-link is-ghost" type="button" data-open="call">Call Booking</button>
      </div>`;

    const btn = head.querySelector("[data-menu-btn]");
    const side = btn.parentElement;
    // Same order as the original Webflow dropdown — on hover it adds the open indicator (is-open) first and expands the height over .45s ease-out, while the list width goes 0 → content width on the next frame.
    // On leaving, fold up at once and reset width to 0 after 600ms
    const menu = head.querySelector(".st-menu"), card = head.querySelector(".st-menu__card");
    let hideT;
    const open = () => {
      clearTimeout(hideT);
      menu.classList.add("is-open");
      head.classList.add("is-menu");
      card.style.height = card.scrollHeight + "px";
      requestAnimationFrame(() => { if (menu.classList.contains("is-open")) menu.style.width = "auto"; });
    };
    const close = () => {
      menu.classList.remove("is-open");
      head.classList.remove("is-menu");
      card.style.height = "0px";
      clearTimeout(hideT);
      hideT = setTimeout(() => { if (!menu.classList.contains("is-open")) menu.style.width = "0px"; }, 600);
    };
    ST.closeMenu = close;
    if (matchMedia("(hover: hover)").matches) {
      side.addEventListener("pointerenter", open);
      side.addEventListener("pointerleave", close);
    }
    btn.addEventListener("click", () => (head.classList.contains("is-menu") ? close() : open()));
    head.querySelectorAll(".st-menu a").forEach((a) => a.addEventListener("click", close));
  }

  /* ── Footer ── */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("st-foot");
    foot.innerHTML = `
      <div class="st-foot__pillars" aria-hidden="true"></div>
      <div class="st-foot__top">
        <p class="st-cap" data-text="caption">Contact</p>
        <h2 class="t-h2" data-text="head-two" data-label="One English line leading to a conversation here">Begin with a short line.</h2>
        <p class="t-body" data-text="body">What to write and send in<br>Explained in two lines.</p>
        <button class="st-btn-link" type="button" data-open="form">Start Project</button>
      </div>
      <div class="st-foot__mid">
        <div class="st-foot__main">
          <nav class="st-foot__menu">
            <a class="st-link" href="index.html#about">Menu 1</a><a class="st-link" href="works.html">Menu 2</a><a class="st-link" href="index.html#approach">Menu 3</a><a class="st-link" href="news.html">Menu 4</a><a class="st-link" href="#" data-open="form">Menu 5</a>
          </nav>
          <div class="st-foot__logo">${logo()}<p class="t-body">© Your company name here 0000</p></div>
          <nav class="st-foot__menu is-right">
            <a class="st-link" href="#">Social 1</a><a class="st-link" href="#">Social 2</a><a class="st-link" href="#">Social 3</a><a class="st-link" href="#">Social 4</a>
          </nav>
        </div>
        <div class="st-foot__second">
          <address class="st-foot__call" style="font-style:normal"><span>Phone</span><a class="st-link" href="#">+00 000 000 000</a></address>
          <a class="t-cap st-link" href="#top" data-top>Back to top</a>
          <div class="st-foot__docs"><a class="st-link" href="#">Privacy policy</a><a class="st-link" href="#">Terms of service</a><a class="st-link" href="#">Cookie Settings</a></div>
        </div>
      </div>
      <div class="st-foot__bottom" data-slot="footer-sketch"><video class="st-foot__video" muted playsinline loop preload="metadata" data-autoplay src="media/footer-sketch.mp4" data-label="Line sketch video of hand-drawn low glass buildings · trees · people · 4:1 · loop"></video></div>`;
    foot.querySelector(".st-foot__pillars").innerHTML = pillarsSVG();
  }

  /* ── Two modals + cookie bar ── */
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="st-modal" data-modal="call" role="dialog" aria-modal="true" aria-label="Call Booking" data-slot="call-modal">
      <div class="st-modal__veil" data-close></div>
      <div class="st-modal__win st-call">
        <button class="st-modal__x" type="button" data-close aria-label="Close">${icon.close}</button>
        <div class="st-call__avatar">K</div>
        <p class="t-body">Your contact person’s name · 30-min consultation</p>
        <p class="t-big">0000, month 00</p>
        <div class="st-call__month">${["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Day"].map((d) => `<b>${d}</b>`).join("")}${Array.from({ length: 30 }, (_, i) => `<span class="${[8, 9, 15, 16, 22, 23].includes(i) ? "is-on" : ""}">${String(i + 1).padStart(2, "0")}</span>`).join("")}</div>
        <p class="t-cap">Your time slot info here</p>
      </div>
    </div>
    <div class="st-modal" data-modal="form" role="dialog" aria-modal="true" aria-label="Project Contact" data-slot="inquiry-modal">
      <div class="st-modal__veil" data-close></div>
      <form class="st-modal__win st-form" onsubmit="return false">
        <div class="st-form__left">
          <div class="wf-img" data-label="Living room interior · daylight through the window · dining table and chairs · portrait composition"></div>
          <div class="st-form__head"><p class="t-h2" data-label="English contact window title here">Send an inquiry</p><p class="t-body">One line saying it starts with conversation here.<br>One line: send this and we will share the next step.</p></div>
        </div>
        <div class="st-form__right">
          <label class="st-field"><span class="t-body">Name*</span><input class="st-input" placeholder="Your name here"></label>
          <label class="st-field"><span class="t-body">Email*</span><input class="st-input" placeholder="Your email here"></label>
          <label class="st-field"><span class="t-body">Message</span><textarea class="st-input" placeholder="Your project story here"></textarea></label>
          <p class="st-check t-cap"><i></i>By sending, you agree to the privacy policy</p>
          <button class="st-btn-link" type="submit">Send</button>
        </div>
        <button class="st-modal__x" type="button" data-close aria-label="Close">${icon.close}</button>
      </form>
    </div>
    <div class="st-cookie" data-slot="cookie-bar"><p>If you keep using the site <a href="#">Privacy policy and cookie use</a>I agree to this.</p><button class="st-btn-link" type="button" data-cookie-ok>Consent</button></div>`
  );

  // Fills icons into empty arrow and social buttons (to keep the page HTML short)
  ST.fillIcons = (root = document) => {
    root.querySelectorAll(".st-arrow.is-left:empty").forEach((b) => (b.innerHTML = icon.left));
    root.querySelectorAll(".st-arrow.is-right:empty").forEach((b) => (b.innerHTML = icon.right));
    root.querySelectorAll(".st-socials").forEach((g) => g.querySelectorAll(".st-social:empty").forEach((b, i) => (b.innerHTML = [icon.ig, icon.li, icon.be, icon.link][i % 4])));
  };
  ST.fillIcons();

  /* ── Smooth scroll ── */
  if (!reduced) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    ST.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (y) => (ST.lenis ? ST.lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" }));

  /* ── Open and close modal: scrolling stops while open ── */
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) {
      e.preventDefault();
      document.querySelector(`[data-modal="${o.dataset.open}"]`)?.classList.add("is-open");
      ST.lenis?.stop();
      ST.closeMenu?.();
      return;
    }
    const c = e.target.closest("[data-close]");
    if (c) {
      c.closest(".st-modal").classList.remove("is-open");
      ST.lenis?.start();
    }
    if (e.target.closest("[data-top]")) { e.preventDefault(); scrollTo(0); }
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".st-modal.is-open").forEach((m) => m.classList.remove("is-open"));
    ST.lenis?.start();
  });

  /* ── Cookie Strip ── */
  const cookie = document.querySelector(".st-cookie");
  if (!localStorage.getItem("st-cookie-closed")) setTimeout(() => cookie.classList.add("is-on"), 6000);
  cookie.querySelector("[data-cookie-ok]").addEventListener("click", () => {
    localStorage.setItem("st-cookie-closed", "1");
    cookie.classList.remove("is-on");
  });

  /* ── Header: hides on scroll down, returns on scroll up · ink-dark over light sections ── */
  if (head) {
    let last = 0;
    const lightSections = () => document.querySelectorAll('[data-head="dark"]');
    const update = () => {
      const y = scrollY;
      if (!head.classList.contains("is-menu")) head.classList.toggle("is-hide", y > innerHeight * 0.05 && y > last);
      last = Math.max(0, y);
      const b = head.getBoundingClientRect().bottom;
      head.classList.toggle("is-dark", page !== "home" || [...lightSections()].some((s) => { const r = s.getBoundingClientRect(); return b >= r.top && b <= r.bottom; }));
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ── Photo blur reveal ── */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.01 });
  document.querySelectorAll(".st-blur").forEach((el) => (reduced ? el.classList.add("is-in") : io.observe(el)));

  /* ── Text reveal ── */
  const settings = {
    caption: { d: 0.3 }, body: { d: 0.45 }, "big-body": { d: 0.6 }, "head-three": { d: 1.25 }, "head-four": { d: 1 },
    "head-two": { d: 1.5, chars: true, stagger: 0.03 },
  };
  const play = (el) => {
    const s = settings[el.dataset.text];
    if (!s) return;
    if (s.chars) gsap.to(el._chars, { opacity: 1, yPercent: 0, duration: s.d, stagger: s.stagger, ease: "power2.out" });
    else gsap.to(el, { opacity: 1, duration: s.d, ease: "power2.out", onComplete: () => el.classList.add("is-shown") });
  };
  const textIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(e.target); textIO.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px" });
  ST.watchText = (root = document) => {
    root.querySelectorAll("[data-text]").forEach((el) => {
      if (el._watched) return;
      el._watched = true;
      if (reduced) { el.classList.add("is-shown", "is-split"); return; }
      if (settings[el.dataset.text]?.chars) {
        const sp = new SplitText(el, { type: "words,chars", wordsClass: "word-wrap", charsClass: "char-wrap" });
        el._chars = sp.chars;
        gsap.set(sp.chars, { opacity: 0, yPercent: 20 });
        el.classList.add("is-split");
      }
      textIO.observe(el);
    });
  };
  (document.fonts?.ready || Promise.resolve()).then(() => ST.watchText());

  /* ── Slider: same Swiper 11.2.10 as the original ──
     data-slider="page" is the first-page green panel (one sheet at a time 600ms · drag interaction · loops back to the start at the end), "free" Project list photo strip (auto width · freeMode).
     If later, as in the original the panel starts 5 seconds after it enters the screen — until then it just stands in the same layout */
  ST.slider = (root, { later = false } = {}) => {
    const view = root.querySelector("[data-view]");
    const n = root.querySelectorAll("[data-track] > *").length;
    const opts = root.dataset.slider === "page"
      ? { slidesPerView: 1, spaceBetween: 0, speed: 600, grabCursor: true, loop: n > 1, loopAdditionalSlides: n > 1 ? 2 : 0 }
      : { slidesPerView: "auto", spaceBetween: 0, freeMode: true };
    const make = () => new Swiper(view, {
      ...opts,
      navigation: { prevEl: root.querySelector("[data-prev]"), nextEl: root.querySelector("[data-next]") },
      scrollbar: { el: root.querySelector("[data-bar]"), draggable: true, hide: false },
    });
    if (!later) return make();
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      setTimeout(make, 5000);
    });
    io.observe(root);
  };
  document.querySelectorAll("[data-slider]:not([data-slider-later])").forEach((s) => ST.slider(s));

  /* ── Autoplay video: like the original, plays when on screen and pauses when off — a play-once video stops where it ends ── */
  const autoplayIO = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting && !v.ended && !reduced) v.play().catch(() => {});
    else if (!isIntersecting) v.pause();
  }), { threshold: 0 });
  document.querySelectorAll("video[data-autoplay]").forEach((v) => { v.muted = true; autoplayIO.observe(v); });

  function pillarsSVG() {
    // Original background pattern (rows of vertical pillars with rounded ends) newly drawn with the same spacing and feel
    const w = 1440, cols = 12, step = w / cols;
    let s = `<svg viewBox="0 0 ${w} 900" preserveAspectRatio="none" width="100%" height="100%">`;
    for (let i = 0; i < cols; i++) {
      const x = i * step + step * 0.12, cw = step * 0.48;
      s += `<path d="M${x} 0h${cw}v18c-6 4-8 10-8 22v800c0 12 2 18 8 22v38h-${cw}v-38c6-4 8-10 8-22V40c0-12-2-18-8-22z" style="fill: color-mix(in srgb, var(--site-on-photo) 22%, transparent)"/>`;
    }
    return s + "</svg>";
  }

})();
