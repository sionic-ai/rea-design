// Draws the header · menu · footer shared by all pages, and the original app.js shared handles with the same values — online store expand · menu round panel (closes on press · Esc · press outside the panel) ·
// Reveal on view (.js-inview: is-inview is added once it enters above the bottom 15% of the screen, immediately if already passed) · text splitting (.js-split-text: .04s per letter in sequence)
(() => {
  const body = document.body;
  const arrow = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.1 1.6 11.5 6l-4.4 4.4-.9-.9L9.1 6.6H.5V5.4h8.6L6.2 2.5Z"/></svg>';
  const more = (href, label = "VIEW MORE") => `<a class="vl-more" href="${href}"><span class="vl-more__item"><span class="vl-more__text">${label}</span><span class="vl-more__icon"><span class="vl-more__box">${arrow}</span></span></span></a>`;
  // VIEW MORE button and arrow: just note the slot and it gets filled in here — <a class="vl-more" href="…" data-vl-more></a> · <span data-vl-arrow></span>
  document.querySelectorAll("[data-vl-more]").forEach((a) => { a.outerHTML = more(a.getAttribute("href"), a.textContent.trim() || undefined); });
  document.querySelectorAll("[data-vl-arrow]").forEach((s) => { s.outerHTML = arrow; });
  const logo = '<a class="vl-logo" href="index.html" aria-label="Home" data-label="Brand logo — dog silhouette + two-line wordmark"><svg viewBox="0 0 34 46"><circle cx="20" cy="9" r="6.5"/><path d="M9 44V30c0-7 4.6-12.5 11-12.5S31 23 31 30v14h-5V31c0-4-2.6-7-6-7s-6 3-6 7v13Z"/><path d="M1 44c1-6 3-10 7-12l1.5 4C7 37.5 6 40.5 6 44Z"/></svg><b>Brand<i>+</i><br>Labo</b></a>';
  const sns = `<ul class="vl-sns">${["Social 1", "Social 2", "Social 3"].map((l, i) => `<li><a href="#" aria-label="${l}"><svg viewBox="0 0 20 20">${[
    '<path d="M10 1a9 9 0 0 0-1.4 17.9v-6.3H6.3V10h2.3V8c0-2.3 1.4-3.5 3.4-3.5l2 .1v2.3h-1.1c-1.1 0-1.5.7-1.5 1.4V10h2.5l-.4 2.6h-2.1v6.3A9 9 0 0 0 10 1Z"/>',
    '<path d="M15.3 2h2.8l-6.1 7 7.2 9h-5.6l-4.4-5.7L4.1 18H1.3L7.8 10.5 1 2h5.7l4 5.2Zm-1 14.4h1.6L5.8 3.5H4.1Z"/>',
    '<path d="M10 2.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1C4 17.2 2.8 16 2.7 13.6 2.6 12.7 2.6 12.4 2.6 10s0-2.7.1-3.6C2.8 4 4 2.8 6.4 2.7c.9-.1 1.2-.1 3.6-.1ZM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm4.2-7.6a.9.9 0 1 0 0 1.9.9.9 0 0 0 0-1.9Z"/>',
  ][i]}</svg></a></li>`).join("")}</ul>`;
  const nav = [["about.html", "About the Brand", "ABOUT"], ["index.html#lineup", "Lineup", "LINEUP"], ["product.html", "Find products", "SEARCH"], ["news.html", "Reads", "JOURNAL"], ["index.html#news", "Notice", "NEWS"]];

  const head = document.querySelector('[data-vl="header"]');
  if (head) head.outerHTML = `
    <header class="vl-head" id="header" data-slot="header">
      <div class="vl-head__in">
        <div class="vl-head__left">
          ${logo}
          <nav class="vl-nav" aria-label="Main menu">${nav.map(([h, t]) => `<a href="${h}"><span>${t}</span></a>`).join("")}</nav>
        </div>
        <div class="vl-head__right">
          <div class="vl-online" data-slot="online-store">
            <button class="vl-online__btn" type="button" aria-expanded="false"><svg viewBox="0 0 20 20"><path d="M1.5 2.5h2.6l2.2 10.2h10l1.8-7.4H5"/><circle cx="7.6" cy="16.3" r="1.2"/><circle cx="15" cy="16.3" r="1.2"/></svg><span>ONLINE STORE</span></button>
            <div class="vl-online__menu"><a href="#">Brand Online Store</a></div>
          </div>
          <div class="vl-burger-wrap">
            <button class="vl-burger" type="button" aria-label="Menu" aria-expanded="false"><span class="vl-burger__lines"><span class="vl-burger__line"></span><span class="vl-burger__line"></span></span></button>
            <div class="vl-menu" data-slot="menu-card">
              <ul class="vl-menu__main">${nav.map(([h, t, en]) => `<li><a href="${h}"><span class="vl-menu__en">${en}</span><span class="vl-menu__ja">${t}</span></a></li>`).join("")}</ul>
              <ul class="vl-menu__online"><li><a href="#">Brand Online Store</a></li></ul>
              ${sns}
            </div>
          </div>
        </div>
      </div>
    </header>`;

  const foot = document.querySelector('[data-vl="footer"]');
  if (foot) foot.outerHTML = `
    <footer class="vl-foot" data-slot="footer">
      <div class="vl-wrap">
        ${foot.dataset.crumb ? `<ol class="vl-crumb" aria-label="Current location"><li><a href="index.html">Home</a></li>${foot.dataset.crumb.split("/").map((c) => `<li>${c}</li>`).join("")}</ol>` : ""}
        <div class="vl-foot__top" style="${foot.dataset.crumb ? "margin-top:60px" : ""}">
          <div class="vl-foot__logo">${logo}</div>
          <ul class="vl-foot__nav">${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="#">Inquiry</a></li></ul>
        </div>
        <div class="vl-foot__bottom">
          ${sns}
          <ul class="vl-foot__sub"><li><a href="#">Privacy policy</a></li><li><a href="#">Sitemap</a></li></ul>
          <p class="vl-foot__copy">© Company Name. All rights reserved.</p>
        </div>
      </div>
    </footer>`;

  // ── Online shop expand — is-open toggles on each press ──
  const online = document.querySelector(".vl-online");
  online?.querySelector(".vl-online__btn").addEventListener("click", () => {
    const v = online.classList.toggle("is-open");
    online.querySelector(".vl-online__btn").setAttribute("aria-expanded", String(v));
  });

  // ── Menu round panel — is-menu-opened on the header. Closes when clicking outside the panel or pressing Esc ──
  const header = document.getElementById("header");
  const burger = header?.querySelector(".vl-burger");
  let opened = false;
  const outside = (e) => { if (!e.target.closest(".vl-menu")) setMenu(false); };
  function setMenu(v) {
    opened = v;
    header.classList.toggle("is-menu-opened", v);
    burger.setAttribute("aria-expanded", String(v));
    if (v) body.addEventListener("click", outside); else body.removeEventListener("click", outside);
  }
  burger?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setMenu(!opened); });
  addEventListener("keydown", (e) => { if (opened && e.key === "Escape") setMenu(false); });

  // ── Video window — original class W: pressing [data-vl-modal] takes the window autoAlpha 0 → 1 in .4s power2.out, and close·backdrop·Esc hide it in the same .4s.
  //    while open, body gets is-modal-opened (the original pauses looping videos meanwhile) ──
  const modal = document.querySelector(".vl-modal");
  if (modal) {
    const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.4;
    const open = (e) => {
      // In the original, the moment the window covers the page, the hover on the button behind it is released and the cursor dot shrinks (re-checked) — tell the button the pointer left, and button hover css is turned off while is-modal-opened is set.
      e?.currentTarget?.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: modal }));
      // Like original class W, it starts hidden with autoAlpha 0 applied first, then is made visible on the next frame (tween start) — on that frame the window is set from 100% to screen size.
      gsap.set(modal, { autoAlpha: 0 });
      body.classList.add("is-modal-opened");
      // Like the original MicroModal (disableScroll), locks background scroll — that change makes the browser re-measure under the cursor, so the hover on the button behind is released
      body.style.overflow = "hidden";
      gsap.to(modal, { autoAlpha: 1, duration: dur, ease: "power2.out", overwrite: true, onStart: () => { modal.hidden = false; } });
    };
    const close = () => {
      body.classList.remove("is-modal-opened");
      body.style.overflow = "";
      gsap.to(modal, { autoAlpha: 0, duration: dur, ease: "power2.out", overwrite: true, onComplete: () => { modal.hidden = true; gsap.set(modal, { clearProps: "opacity,visibility" }); } });
    };
    document.querySelectorAll("[data-vl-modal]").forEach((t) => t.addEventListener("click", open));
    modal.querySelector(".vl-modal__close").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  // ── Letter splitting — per letter transition·animation delay .04 × index + data-delay ──
  document.querySelectorAll(".js-split-text").forEach((el) => {
    const delay = Number(el.dataset.delay || 0), text = el.textContent;
    el.innerHTML = [...text].map((ch, i) => `<span style="transition-delay:${0.04 * i + delay}s;animation-delay:${0.04 * i + delay}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  });

  // ── Float up when visible — when it crosses the line at data-root-margin% (default −15) from the screen bottom it gets is-inview, if already scrolled past upward, immediately ──
  const show = (el) => el.classList.add("is-inview");
  document.querySelectorAll(".js-inview").forEach((el) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return show(el);
    if (scrollY > el.getBoundingClientRect().top + scrollY) return show(el);
    const m = el.dataset.rootMargin ? Number(el.dataset.rootMargin) : -15;
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { show(el); io.disconnect(); } }), { rootMargin: `0px 0px ${m}% 0px`, threshold: [0] });
    io.observe(el);
  });
})();
