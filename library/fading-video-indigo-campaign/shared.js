/* Header, menu, about section, footer, join band and appear, shared by all pages */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;

  const arrow = '<span class="rt-pill__arrow"><svg viewBox="0 0 16 12"><path d="M0 5.3h13.3L9.2 1.2l1-1L16 6l-5.8 5.8-1-1 4.1-4.1H0Z"/></svg><svg viewBox="0 0 16 12"><path d="M0 5.3h13.3L9.2 1.2l1-1L16 6l-5.8 5.8-1-1 4.1-4.1H0Z"/></svg></span>';
  /* Brush-stroke logo — in place of the original logo image. Redrawn with our own shapes */
  const sprite = document.createElement("div");
  sprite.hidden = true;
  sprite.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><symbol id="rt-brush" viewBox="0 0 224 98">
    <path d="M12 44C40 16 92 8 134 18c24 6 44 4 62-6 12-7 22-2 20 10-3 22-26 40-58 44-30 4-56 0-86 12-22 9-46 10-60-2-10-9-10-22 0-32Z"/>
    <path d="M60 70c34-10 76-14 118-12M74 60c30-8 64-10 98-6M150 74c14-2 26-6 36-12" fill="none" style="stroke: var(--kf-bg)" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
  </symbol></svg>`;
  document.body.prepend(sprite);

  const brand = `<a class="rt-brand" href="index.html" aria-label="Brand Home"><svg viewBox="0 0 224 98"><use href="#rt-brush"/></svg><span data-label="Brand English name">Brand Name</span></a>`;
  const mark = `<a class="rt-mark" href="index.html" data-label="Operator logo (four Chinese characters in brush calligraphy)">Organization logo</a>`;
  const logos = `<div class="rt-logos">${mark}${brand}</div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `${logos}
      <button class="rt-menu-btn" type="button" aria-label="Open Menu" data-menu-open>
        <span class="rt-menu-btn__mask"><span class="rt-menu-btn__in"><span class="rt-menu-btn__label">Menu</span><span class="rt-burger"><i></i><i></i><i></i></span></span></span>
      </button>`;
  }

  const items = [
    ["About us", "About us", "index.html#about"],
    ["Perspective", "What does writing produce today?", "interviews.html"],
    ["Moment", "Moment of writing", "moment.html"],
    ["Activity", "Activity log", "news.html"],
    ["Project", "About the project", "index.html#project"],
    ["News", "News", "news.html"],
  ];
  const menu = document.createElement("div");
  menu.className = "rt-menu";
  menu.dataset.slot = "menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-label", "Menu");
  menu.innerHTML = `<div class="rt-menu__panel">
      <div class="rt-menu__head"><button class="rt-close" type="button" data-menu-close>Close<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15.5"/><path d="M11 11l10 10M21 11 11 21"/></svg></button></div>
      <nav class="rt-menu__nav">${items.map(([en, ja, href]) => `<a href="${href}"><span class="rt-menu__en">${en}</span><span class="rt-menu__ja">${ja}</span></a>`).join("")}</nav>
    </div>`;
  document.body.append(menu);

  const openMenu = () => {
    document.body.classList.add("is-locked");
    const rows = [...menu.querySelectorAll(".rt-menu__nav a")];
    rows.forEach((a) => a.querySelectorAll("span").forEach((s) => s.classList.remove("is-in")));
    /* Original STUDIO modal starts turning on the curtain about .14s after the press (modal-ready), and the line checks every 50ms whether the modal has attached, 
       After two rAF (about .24s after the press), per line at 100ms intervals up to 0.5 for English and 1 for Korean over 0.9s */
    setTimeout(() => menu.classList.add("is-open"), reduce ? 0 : 10);
    setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      rows.forEach((a, i) => setTimeout(() => a.querySelectorAll("span").forEach((s) => s.classList.add("is-in")), reduce ? 0 : i * 100));
    })), reduce ? 0 : 58);
  };
  const closeMenu = () => {
    menu.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu-open]")) openMenu();
    else if (e.target.closest("[data-menu-close]")) closeMenu();
    else if (e.target.closest(".rt-menu__nav a") || e.target === menu) closeMenu();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.outerHTML = `<section class="rt-about" id="about" data-slot="about"${page === "home" ? "" : ' data-appear="0.6,1.6,ease"'}>
        <p class="rt-about__label" data-label="Section name in English">About</p>
        <p class="rt-about__head">Your line on learning and meeting here<br>Two lines about a lifelong asset.</p>
        <p class="rt-about__text">Your eight or so lines here introducing the operating organization.<br>Gives children a chance to learn with materials suited to their age and skill level,<br>The story of helping run classrooms across the country,<br>A story about creating an environment where you can learn up close,<br>The story of how learning communities across the country polish their busy daily lives,<br>A story about a place where you face yourself,<br>Whether you’re new or picking up the brush again,<br>Closing line saying you can start at your own pace.</p>
        <a class="rt-pill" href="index.html#about">Your organization intro link here${arrow}</a>
      </section>
      <footer class="rt-foot" data-slot="footer">
        <div class="rt-foot__links">
          <div class="rt-foot__link"><a href="#"><svg viewBox="0 0 16 16"><path d="M1 3h14v10H1Zm5 2.5v5l4.5-2.5Z" fill-rule="evenodd"/></svg>Official Video Channel</a><p>Your one-line note on watching the event in video here</p></div>
          <div class="rt-foot__link"><a href="#"><svg viewBox="0 0 16 16"><path d="M4 1h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Zm4 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4.2-1.7a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" fill-rule="evenodd"/></svg>Brand Name photo channel</a><p>Your one line pointing to the photo channel for the latest news.</p></div>
        </div>
        <div class="rt-foot__meta"><a href="#">Privacy policy</a><p>© Your organization name here. All rights reserved.</p></div>
      </footer>${page === "home" ? `
      <aside class="rt-float" data-slot="join-banner">
        <div class="rt-float__body"><div class="wf-img" data-label="Hand writing with a brush · from above · landscape"></div>
        <a class="rt-float__text" href="moment.html"><small>Free to join · first come, first served, 200 people</small><strong>Your note on how you can join in by writing too here<br>Experience program info, one line</strong></a></div>
        <button class="rt-float__close" type="button" aria-label="Close" data-float-close><svg viewBox="0 0 10 10"><path d="M1 1l8 8M9 1 1 9"/></svg></button>
      </aside>` : ""}`;
  }

  /* Join band (first page only): the original pops in at 94%→95% of a scroll() timeline */
  const float = document.querySelector(".rt-float");
  if (float) {
    let closed = false;
    const tick = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 1;
      float.classList.toggle("is-hidden", !closed && p < 0.95);
    };
    /* When folding finishes (original toggle-closing released) the content box returns to the folded width */
    float.querySelector("[data-float-close]").addEventListener("click", () => { closed = true; setTimeout(() => float.classList.add("is-closed"), 40); setTimeout(() => float.classList.add("is-shut"), 350); });
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    tick();
  }

  /* STUDIO appear: once visible (threshold 0), opacity goes 0 → 1 by the given delay, duration and curve */
  const eases = { ease: "ease", ui: "cubic-bezier(0.4,0.4,0,1)", rise: "cubic-bezier(0.22,1,0.36,1)", linear: "linear" };
  const appear = [...document.querySelectorAll("[data-appear]")];
  appear.forEach((el) => {
    const [d, t, e] = el.dataset.appear.split(",");
    el.style.transition = `opacity ${t}s ${eases[e] || "ease"} ${d}s`;
  });
  /* The original runtime starts observing only after the document has fully loaded (load) — measured on film, the rise-in starts about .45s after load */
  const whenLoaded = (fn) => (document.readyState === "complete" ? fn() : addEventListener("load", fn, { once: true }));
  if (reduce || !("IntersectionObserver" in window)) appear.forEach((el) => el.classList.add("is-in"));
  else whenLoaded(() => {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }));
    appear.forEach((el) => io.observe(el));
  });

  /* Subpages only change the header color to follow the background — the home page is handled by index.js */
  window.rtHead = document.querySelector(".rt-head");
  if (page !== "home") whenLoaded(() => document.body.classList.add("is-loaded"));
})();
