/* Header bar·CTA·footer and their motion, shared by all pages — the header hides when scrolling down (−80px .4s outQuad) and returns when scrolling up,
   Logo wheel Lottie plays to 75% (frame 72) in 3 seconds, and [data-lottie] patterns play once every 4 seconds when visible. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => innerWidth > 991;
  const page = document.body.dataset.page || "home";
  const ARROW = '<svg class="om-btn__arrow" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.6 3.2 13.4 8l-4.8 4.8-1-1 3.1-3.1H2.6V7.3h8.1L7.6 4.2Z"/></svg>';
  const CHEV = '<svg class="om-dd__chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>';
  const SEARCH = '<svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 2a6.5 6.5 0 0 1 5.18 10.43l3.95 3.94-1.27 1.27-3.94-3.95A6.5 6.5 0 1 1 8.5 2Zm0 1.8a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Z"/></svg>';
  const here = (f) => (location.pathname.endsWith(f) ? ' aria-current="page"' : "");

  const header = document.querySelector('[data-slot="header"]');
  if (header) header.outerHTML = `
  <header class="om-nav" data-slot="header" data-nav>
    <div class="om-nav__in">
      <a class="om-logo" href="index.html" aria-label="Back to start"><span class="om-logo__mark" data-lottie-logo></span><span class="om-logo__word" data-label="Institution name (English)">Brand</span></a>
      <nav class="om-menu" data-menu aria-label="Main menu">
        <div class="om-dd" data-dd>
          <button class="om-dd__toggle" type="button" aria-expanded="false">What We Do ${CHEV}</button>
          <div class="om-dd__list"><div class="om-dd__col"><h4>Services</h4><a href="index.html#services">Research</a><a href="index.html#services">Evaluation</a><a href="index.html#services">Development</a></div><div class="om-dd__col"><h4>Focus Areas</h4><a href="index.html#focus">Area Name 01</a><a href="index.html#focus">Area Name 02</a><a href="index.html#focus">Area Name 03</a><a href="index.html#focus">Area Name 04</a><a href="index.html#focus">Area Name 05</a></div><div class="om-dd__col"><h4>Innovations</h4><a href="#">Link Name 01</a><a href="#">Link Name 02</a><a href="#">Link Name 03</a></div><a class="om-dd__feat" href="article.html"><span class="om-tag-line">Featured Work</span><strong>Project Title One That Runs Two Lines</strong><span class="om-dd__img om-ph wf-img" data-label="Report cover · orange pattern · landscape 4:3"></span></a></div>
        </div>
        <div class="om-dd" data-dd>
          <button class="om-dd__toggle" type="button" aria-expanded="false">Who We Are ${CHEV}</button>
          <div class="om-dd__list"><div class="om-dd__col"><h4>Who We Are</h4><a href="about.html"${here("about.html")}>About Us</a><a href="experts.html"${here("experts.html")}>Our Experts</a><a href="careers.html"${here("careers.html")}>Careers</a></div><div class="om-dd__col"><h4>Commitments</h4><a href="#">Link Name 01</a><a href="#">Link Name 02</a></div><a class="om-dd__feat" href="careers.html"><span class="om-tag-line">Join Us</span><strong>Your hiring notice line here</strong><span class="om-dd__img om-ph wf-img" data-label="Team photo · indoor natural light · landscape 4:3"></span></a></div>
        </div>
        <a class="om-menu__link" href="article.html"${here("article.html")}>Publications<span class="om-uline" aria-hidden="true"></span></a>
        <a class="om-menu__link" href="article.html">Insights<span class="om-uline" aria-hidden="true"></span></a>
        <a class="om-btn om-btn--line om-btn--sm om-menu__cta" href="#contact">Contact Us</a>
      </nav>
      <div class="om-nav__tools">
        <div class="om-search" data-search>
          <a class="om-search__btn" href="#" role="button" aria-label="Search">${SEARCH}</a>
          <div class="om-search__pop"><input type="search" placeholder="Your search term here" aria-label="Search term"></div>
        </div>
        <a class="om-btn om-btn--line om-btn--sm" href="#contact">Contact Us</a>
        <button class="om-burger" type="button" aria-label="Menu" aria-expanded="false" data-burger><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>`;

  const cta = document.querySelector('[data-slot="cta"]');
  if (cta) {
    const tone = cta.dataset.fixedTone || "";
    cta.outerHTML = `
  <section class="om-cta om-pad om-sec" data-slot="cta" ${tone ? `data-tone="${tone}" data-fixed-tone="${tone}"` : ""} id="contact">
    <svg class="om-cta__pattern" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<rect x="${i % 2 ? 54 : 0}" y="${i * 40}" width="46" height="34" fill="currentColor" opacity="${0.18 + (i % 3) * 0.06}"/>`).join("")}</svg>
    <div class="om-wrap om-cta__in">
      <div class="om-cta__top">
        <div><span class="om-tag-line">Contact</span><h2 class="om-h1" style="margin-top:1rem" data-label="English large title two lines">Let’s make an<br>impact together.</h2></div>
        <a class="om-btn om-btn--line" href="#contact" data-arrow>Book a short call</a>
      </div>
      <div class="om-cta__cards">
        <div class="om-cta__card" data-cta-tone="navy"><p>Your one line to the people you want to work with.</p><a class="om-btn om-btn--line om-btn--sm" href="careers.html" data-arrow>Careers</a></div>
        <div class="om-cta__card" data-cta-tone="plum"><p>One line addressed to collaborating experts goes here.</p><a class="om-btn om-btn--line om-btn--sm" href="#contact" data-arrow>Contact Us</a></div>
      </div>
    </div>
  </section>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) footer.outerHTML = `
  <footer class="om-foot om-pad" data-slot="footer">
    <div class="om-wrap">
      <div class="om-foot__rule"></div>
      <div class="om-news">
        <div class="om-news__text"><strong>Your one-line newsletter signup title here.</strong><p>Your note on what news you send and how often goes here in about two lines. It covers research results and new business news.</p></div>
        <form class="om-news__form" onsubmit="return false"><div class="om-news__row"><input type="email" placeholder="Your email address here" aria-label="Email address"><button class="om-btn om-btn--sm" type="submit">Subscribe</button></div><small>Add a one-line privacy notice here.</small></form>
      </div>
      <div class="om-foot__rule"></div>
      <div class="om-foot__grid">
        <div class="om-foot__col om-foot__col--big"><h4>Services</h4><a href="index.html#services">Research<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#services">Evaluation<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#services">Development<span class="om-uline" aria-hidden="true"></span></a></div>
        <div class="om-foot__col om-foot__col--big"><h4>Focus Areas</h4><a href="index.html#focus">Area Name 01<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#focus">Area Name 02<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#focus">Area Name 03<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#focus">Area Name 04<span class="om-uline" aria-hidden="true"></span></a><a href="index.html#focus">Area Name 05<span class="om-uline" aria-hidden="true"></span></a></div>
        <div class="om-foot__col"><h4>Learn</h4><a href="about.html">About Us</a><a href="experts.html">Experts</a><a href="article.html">Publications</a></div>
        <div class="om-foot__col"><h4>Commitments</h4><a href="#">Link Name 01</a><a href="#">Link Name 02</a><a href="#">Link Name 03</a></div>
        <div class="om-foot__col"><h4>Contact</h4><a href="#contact">Contact Us</a><a href="careers.html">Careers</a></div>
      </div>
      <div class="om-foot__rule"></div>
      <div class="om-foot__bottom">
        <div class="om-foot__brand"><span class="om-logo__mark" data-lottie-logo></span><span class="om-logo__word">Brand<br>Institute</span></div>
        <p class="om-foot__about">Your organization intro here in one paragraph. About three lines on what kind of nonprofit it is and who it works with.</p>
        <p class="om-foot__about">Your one-line address here<br>Your phone line here</p>
      </div>
      <div class="om-foot__rule"></div>
      <div class="om-foot__legal"><span>© 0000 Brand Institute</span><nav><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a></nav></div>
    </div>
  </footer>`;

  document.querySelectorAll("[data-arrow]").forEach((b) => { b.classList.add("om-btn"); b.insertAdjacentHTML("beforeend", ARROW); });

  /* Button — on hover the fill changes on the next frame (original IX tempo). The 1.05x scale and the 3px arrow shift are handled by CSS at .1s linear */
  document.querySelectorAll(".om-btn").forEach((b) => {
    b.addEventListener("pointerenter", () => requestAnimationFrame(() => b.classList.add("is-hover")));
    b.addEventListener("pointerleave", () => requestAnimationFrame(() => b.classList.remove("is-hover")));
  });

  /* Header row hide — −80px when scrolling down, 0 when scrolling up (.4s outQuad) */
  const nav = document.querySelector("[data-nav]");
  let lastY = scrollY;
  if (nav && !reduce) {
    addEventListener("scroll", () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 2) return;
      const down = y > lastY && y > 80;
      lastY = y;
      if (nav.classList.contains("is-menu")) return;
      gsap.to(nav, { y: down ? -80 : 0, duration: 0.4, ease: "quad.out", overwrite: true });
    }, { passive: true });
  }

  /* Dropdown — desktop opens on hover (list opacity .3s, arrow 180° .2s), phone toggles open and closed by tap */
  document.querySelectorAll("[data-dd]").forEach((dd) => {
    const btn = dd.querySelector("button");
    const set = (on) => { dd.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", String(on)); };
    dd.addEventListener("mouseenter", () => desktop() && set(true));
    dd.addEventListener("mouseleave", () => desktop() && set(false));
    btn.addEventListener("click", () => set(!dd.classList.contains("is-open")));
  });
  const burger = document.querySelector("[data-burger]");
  burger?.addEventListener("click", () => {
    const on = !nav.classList.contains("is-menu");
    nav.classList.toggle("is-menu", on);
    burger.setAttribute("aria-expanded", String(on));
    if (on) gsap.to(nav, { y: 0, duration: 0.4, ease: "quad.out", overwrite: true });
    document.documentElement.style.overflow = on ? "hidden" : "";
  });
  // Search — appears on press (.2s), disappears in .5s on pressing again or outside
  const search = document.querySelector("[data-search]");
  const pop = search?.querySelector(".om-search__pop");
  let open = false;
  const setSearch = (on) => {
    open = on;
    if (!pop) return;
    if (on) { pop.style.display = "block"; gsap.to(pop, { opacity: 1, duration: reduce ? 0 : 0.2, ease: "none" }); pop.querySelector("input")?.focus(); }
    else gsap.to(pop, { opacity: 0, duration: reduce ? 0 : 0.5, ease: "none", onComplete: () => { pop.style.display = "none"; } });
  };
  search?.querySelector(".om-search__btn").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setSearch(!open); });
  document.addEventListener("click", (e) => { if (open && !search.contains(e.target)) setSearch(false); });

  /* CTA — hovering the card changes the panel color (original IX is 0s) */
  document.querySelectorAll("[data-cta-tone]").forEach((card) => {
    const sec = card.closest(".om-cta");
    card.addEventListener("mouseenter", () => { sec.dataset.tone = card.dataset.ctaTone; });
    card.addEventListener("mouseleave", () => {
      if (sec.dataset.fixedTone) sec.dataset.tone = sec.dataset.fixedTone; else delete sec.dataset.tone;
    });
  });

  /* Lottie — the logo wheel runs to frame 72 (75%) in the first 3s, the pattern plays once every 4s while the panel is visible */
  const L = window.lottie, DATA = window.OM_LOTTIE || {};
  if (L) {
    document.querySelectorAll("[data-lottie-logo]").forEach((el) => {
      const a = L.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: DATA.logo });
      if (reduce) { a.goToAndStop(72, true); return; }
      a.playSegments([0, 72], true);
    });
    document.querySelectorAll("[data-lottie]").forEach((el) => {
      const a = L.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: DATA[el.dataset.lottie], rendererSettings: { preserveAspectRatio: "xMidYMid slice" } });
      if (reduce) { a.goToAndStop(a.totalFrames - 1, true); return; }
      ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => a.play() });
    });
  }

  window.omSite = { reduce, desktop, page };
})();
