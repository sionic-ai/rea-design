// Common to all pages: draws in and wires up motion for the loader, header (logo tab, icon pill, menu drawer), side tab, back-to-top button, bottom mountains and footer in one place.
// Original values: loader retracts over .4s at .5s after load · icon pill .4s ease · drawer .5s ease · veil .5s · rise .6s (top 70%, phone 80%, once)
// · phone bottom tab .3s power1.inOut (hides on scroll down, shows on a quick scroll up) · bottom mountain is a fixed pin (pinType fixed, no spacing).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  // Colors made by rotating the accent color (oklch) transition via oklab, so curve and length differ from the original (hex, blended in sRGB) — freeze the fully read values as rgb
  (() => {
    const root = document.documentElement, cs = getComputedStyle(root);
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const names = ["--site-stay", "--site-eat", "--site-play", "--site-hl", "--site-deep", "--site-hover", "--site-load", "--site-leaf", "--site-leaf-2", "--site-snow", "--site-notice", "--site-pagetop", "--site-veil", "--site-alert", "--site-btn02", "--site-field", "--site-field-2", "--site-night", "--site-beige"];
    for (const n of names) {
      const v = cs.getPropertyValue(n).trim();
      if (!v) continue;
      g.clearRect(0, 0, 1, 1); g.fillStyle = v; g.fillRect(0, 0, 1, 1);
      const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data;
      root.style.setProperty(n, `rgb(${r} ${gg} ${b} / ${+(a / 255).toFixed(3)})`);
    }
  })();
  const GP = (window.GP = {});
  const mm = gsap.matchMedia();
  const isPc = () => innerWidth > 767;

  const ic = {
    camp: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="l" d="M5 33 19 9l15 24z"/><path class="w" d="M19 20l-5 13h10z"/><path class="s" d="M3 33h34M19 9 5 33M19 9l15 24M19 9l-2-4M19 9l2-4"/><path class="a" d="M28 8a3 3 0 1 0 0.1 0z"/></svg>',
    bbq: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="s" d="M8 34 32 6"/><rect class="r" x="12" y="19" width="7" height="7" rx="2" transform="rotate(-50 15.5 22.5)"/><rect class="y" x="17" y="13" width="7" height="7" rx="2" transform="rotate(-50 20.5 16.5)"/><rect class="l" x="22" y="8" width="6" height="6" rx="2" transform="rotate(-50 25 11)"/></svg>',
    villa: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="l" d="M6 34V18L20 8l14 10v16z"/><path class="w" d="M15 34V24h10v10z"/><path class="s" d="M3 20 20 7l17 13M6 18v16h28V18M15 34V24h10v10"/><path class="y" d="M26 20h5v4h-5z"/></svg>',
    inn: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="a" d="M3 18 20 9l17 9z"/><path class="w" d="M8 18h24v15H8z"/><path class="s" d="M3 18 20 9l17 9zM8 18v15h24V18M14 33v-9h12v9M4 33h32"/></svg>',
    onsen: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="b" d="M6 22h28a14 10 0 0 1-28 0z"/><path class="s" d="M6 22h28a14 10 0 0 1-28 0zM13 17c-2-3 2-5 0-8M20 17c-2-3 2-5 0-8M27 17c-2-3 2-5 0-8"/></svg>',
    food: '<svg class="gp-ic" viewBox="0 0 40 40"><circle class="y" cx="21" cy="22" r="10"/><path class="s" d="M21 22m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0M7 8v8a2 2 0 0 0 4 0V8M9 16v18M35 8c-3 2-3 8 0 10v16"/></svg>',
    tennis: '<svg class="gp-ic" viewBox="0 0 40 40"><ellipse class="l" cx="16" cy="15" rx="9" ry="11" transform="rotate(-35 16 15)"/><path class="s" d="M22 24l10 10M10 10l12 10M8 16l12 10"/><circle class="y" cx="31" cy="12" r="4"/></svg>',
    event: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="r" d="M10 6h20l-5 7 5 7H10z"/><path class="s" d="M10 4v32M10 6h20l-5 7 5 7H10"/><path class="l" d="M4 36h28"/></svg>',
    play: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="s" d="M3 8l34 8"/><circle class="r" cx="20" cy="17" r="4"/><path class="s" d="M20 21v7l-4 6M20 28l5 5M20 21l-6 2M20 21l6-1"/><path class="l" d="M2 38h36"/></svg>',
    calendar: '<svg class="gp-ic" viewBox="0 0 40 40"><rect class="w" x="5" y="8" width="30" height="27" rx="3"/><path class="r" d="M5 11a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v5H5z"/><path class="s" d="M12 5v6M28 5v6"/><path class="k" d="M11 20h4v4h-4zM18 20h4v4h-4zM25 20h4v4h-4zM11 27h4v4h-4zM18 27h4v4h-4z"/></svg>',
    clock: '<svg class="gp-ic" viewBox="0 0 40 40"><circle class="y" cx="20" cy="20" r="15"/><path class="s" d="M20 20m-15 0a15 15 0 1 0 30 0a15 15 0 1 0-30 0M20 11v9l6 4"/></svg>',
    access: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="w" d="M8 34V14h8v20zM24 34V8h8v26z"/><path class="r" d="M18 34V20h4v14z"/></svg>',
    group: '<svg class="gp-ic" viewBox="0 0 40 40"><circle class="r" cx="14" cy="14" r="6"/><circle class="a" cx="27" cy="16" r="5"/><path class="r" d="M3 33a11 11 0 0 1 22 0z"/><path class="a" d="M19 33a9 9 0 0 1 18 0z"/></svg>',
    map: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="l" d="M5 9l10-3 10 4 10-3v25l-10 3-10-4-10 3z"/><path class="s" d="M5 9l10-3 10 4 10-3v25l-10 3-10-4-10 3zM15 6v26M25 10v26"/></svg>',
    shop: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="r" d="M5 10h30l-2 8H7z"/><path class="w" d="M8 18h24v16H8z"/><path class="s" d="M5 10h30l-2 8H7zM8 18v16h24V18M16 34v-9h8v9"/></svg>',
    faq: '<svg class="gp-ic" viewBox="0 0 40 40"><path class="y" d="M6 6h28v20H18l-8 7v-7H6z"/><path class="s" d="M6 6h28v20H18l-8 7v-7H6zM16 13a4 4 0 1 1 5 4v2M21 22v.5"/></svg>',
  };
  const chev = '<svg viewBox="0 0 10 10"><path d="M3 1.2 6.8 5 3 8.8 2 7.8 4.8 5 2 2.2z"/></svg>';
  const ext = '<svg viewBox="0 0 14 14"><path d="M8 2h4v4M12 2 6 8M10 9v3H2V4h3"/></svg>';
  const up = '<svg class="gp-pagetop__arrow" viewBox="0 0 14 10"><path d="M1.5 8.5 7 2.5l5.5 6"/></svg>';
  const sns = {
    ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.3 5.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
  };
  // Newly drawn placeholder symbol with the same spot and ratio instead of the original logo (a tent-shaped mountain)
  const mark = '<svg class="gp-logo__mark" viewBox="0 0 108 42" aria-hidden="true"><path class="m1" d="M54 4 22 34h20l12-12 12 12h20z"/><path class="m2" d="M54 4 46 26l8-6 8 6z"/><path class="m1" d="M10 38c22-6 66-6 88 0v2c-22-5-66-5-88 0z"/></svg>';
  const logoInner = `<span class="gp-logo__in">${mark}<span class="gp-logo__word">Brand</span>Your facility name here</span>`;
  GP.ic = ic; GP.chev = chev; GP.mark = mark;

  const zones = [
    ["camp", "Camp", "stay eat play"], ["bbq", "Barbecue", "eat"], ["villa", "Forest Villa", "stay eat"], ["inn", "Inn", "stay"],
    ["onsen", "Hot spring", "stay play"], ["food", "Restaurant", "eat"], ["tennis", "Coat", "play"], ["event", "Venue", "play"], ["play", "Play", "play"],
  ];
  GP.zones = zones;

  const stateHtml = `<div class="gp-state">
    <div class="gp-state-box">
      <div class="gp-state-box__item"><p class="gp-state-box__ttl">Your facility name here</p><p class="gp-state-box__txt">OPEN</p><a class="gp-btn02" href="#">View details${chev}</a></div>
      <div class="gp-state-box__item"><p class="gp-state-box__ttl">Your hot spring name here</p><p class="gp-state-box__txt">OPEN</p><a class="gp-btn02" href="#">View details${chev}</a></div>
      <p class="gp-state__btn"><a class="gp-btn02" href="#">One line of early entry info here${chev}</a></p>
    </div>
    <a class="gp-state-link" href="#">${ic.calendar}<span>Reservation·<br>Open seat info</span></a>
    <a class="gp-state-link" href="#">${ic.group}<span>Group guests<br>Recommended Plan</span></a>
  </div>`;
  GP.stateHtml = stateHtml;

  // Loader
  const loading = document.createElement("div");
  loading.className = "gp-loading";
  loading.setAttribute("data-slot", "loader");
  loading.innerHTML = `<div class="gp-loading__in"><div class="gp-loading__img">${mark}</div><p class="gp-loading__txt gp-en">loading...</p></div>`;
  document.body.prepend(loading);

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("gp-head");
    head.innerHTML = `<div class="gp-head__in">
      <h1>${page === "home" ? `<a class="gp-logo">${logoInner}</a>` : `<a class="gp-logo" href="index.html" aria-label="First Page">${logoInner}</a>`}</h1>
      <div class="gp-links"><ul class="gp-links__list">
        ${zones.slice(0, 6).map(([k, t]) => `<li class="gp-links__item"><a class="gp-links__link" href="#">${ic[k].replace('class="gp-ic"', 'class="gp-ic gp-links__img"')}<span class="gp-links__txt">${t}</span></a></li>`).join("")}
        <li class="gp-links__item gp-links__item--sub"><a class="gp-links__mini" href="#">${ic.calendar}Booking · Availability</a><a class="gp-links__mini" href="#">${ic.clock}Hours · Pricing</a></li>
      </ul></div>
      <button class="gp-menu" type="button" aria-label="Open Menu"><span class="gp-menu__btn"><span class="gp-menu__line"></span><span class="gp-menu__line"></span><span class="gp-menu__line"></span></span></button>
      <nav class="gp-nav" aria-label="Main menu" data-slot="menu-drawer"><div class="gp-nav__in">
        <div class="gp-nav__lang"><span>Language</span><span>KO · EN · JA</span></div>
        <div class="gp-nav-reserve"><p class="gp-nav-reserve__ttl">${ic.calendar}Booking · Availability</p><a href="#">Staying guests</a><a href="#">Same-day guests</a></div>
        <div class="gp-nav-tab"><button class="gp-nav-tab__btn" type="button" data-cate="stay">To stay</button><button class="gp-nav-tab__btn" type="button" data-cate="eat">To eat</button><button class="gp-nav-tab__btn" type="button" data-cate="play">Play</button></div>
        <ul class="gp-nav-list">${zones.map(([k, t, c]) => `<li><a class="gp-nav-list__link" href="#" data-cate="${c}">${ic[k]}${t}</a></li>`).join("")}</ul>
        <ul class="gp-nav-list02">
          <li><a href="about.html">Tour the Facility${chev}</a></li><li><a href="product.html">Shop · rental${chev}</a></li>
          <li><a href="news.html">Notice${chev}</a></li><li><a href="#">Hours · Pricing${chev}</a></li>
          <li><a href="#">Directions${chev}</a></li><li><a href="#">Frequently asked questions${chev}</a></li>
        </ul>
        <div class="gp-nav-bnr"><a class="gp-ph" href="#"><div class="wf-img" data-label="Banner · family camping shot · daytime · landscape strip"></div></a><a class="gp-ph" href="#"><div class="wf-img" data-label="Banner · group BBQ shot · daytime · wide strip"></div></a></div>
        <div class="gp-nav-sns"><a href="#" aria-label="Social Media">${sns.ig}</a><a href="#" aria-label="Brand">${sns.fb}</a><a href="#" aria-label="X">${sns.x}</a></div>
        <button class="gp-nav-close" type="button">Close ×</button>
      </div></nav>
    </div>`;
    head.insertAdjacentHTML("beforebegin", '<div class="gp-overlay"></div>');
  }

  const main = document.querySelector("main");
  if (main) {
    main.insertAdjacentHTML(
      "afterend",
      `<div class="gp-pagetop__wrp"><p class="gp-pagetop" data-slot="pagetop"><a href="#top">
        <svg class="gp-pagetop__gecko" viewBox="0 0 136 136" aria-hidden="true"><g transform="translate(68 68)"><g transform="rotate(-38) translate(0 -58)"><path class="gp-gecko" d="M-30 6c8-10 22-14 36-12 10 1 18 6 24 4 5-2 8-7 12-6-2 6-8 10-14 12-10 4-22 2-32 4-10 2-18 6-26-2z"/><path class="gp-gecko" d="M34-6c6-2 10-6 12-4s-2 8-8 9z"/><path class="gp-gecko" d="M-6-2-12-14l-4 2 6 12zM-6 6l-6 12 4 2 6-12zM16-4l6-12 4 2-6 12zM16 6l6 12-4 2-6-12z"/><circle cx="38" cy="-7" r="1.6" class="gp-gecko-eye"/></g></g></svg>
        ${up}TOP</a></p></div>
      <div class="gp-side" data-slot="side-tabs">
        <a class="gp-side__link" href="#">${ic.access}<p class="gp-side__txt">Directions</p></a>
        <a class="gp-side__link gp-side__link--col" href="#">${ic.group}<p class="gp-side__txt">Recommended plan for group guests</p></a>
      </div>`,
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("gp-foot");
    foot.innerHTML = `<p class="gp-foot__en" aria-hidden="true"><span class="gp-stamp">WELCOME TO<br>GREEN PARK</span></p>
      <div class="gp-in">
        <div class="gp-foot-sbs">
          <div class="gp-foot-sbs__box">
            <a class="gp-foot-sbs__logo" href="index.html">${mark}<span class="gp-logo__word">Brand</span><strong>Your facility name here</strong></a>
            <div class="gp-foot-sbs-sns"><a class="gp-foot-sbs-sns__link" href="#" aria-label="Social Media">${sns.ig}</a><a class="gp-foot-sbs-sns__link" href="#" aria-label="Brand">${sns.fb}</a><a class="gp-foot-sbs-sns__link" href="#" aria-label="X">${sns.x}</a></div>
            <p>〒000-0000 Your one-line address goes here 00-0</p>
            <div class="gp-foot-sbs-linkarea"><a class="gp-btn02" href="#">Directions in detail${chev}</a><a class="gp-btn02" href="#">View Facility Map${chev}</a><a class="gp-btn02" href="#">Nearby sightseeing info${chev}</a></div>
          </div>
          <div class="gp-foot-sbs__map"><div class="wf-img" data-label="Map embed · facility location pin · landscape 550:398"></div></div>
        </div>
        ${stateHtml}
        <p class="gp-foot__txt">Put a long paragraph introducing the facility here. It says you can enjoy more than twenty outdoor activities such as camping and barbecue, playground equipment, a long slide, insect experiences and water play.<br>Add one more line here saying it is easy to reach from nearby cities and good for families, friends and groups.</p>
        <div class="gp-foot-btn"><a href="#">Frequently asked questions${chev}</a><a href="#">Contact us${chev}</a></div>
        <div class="gp-foot-linkarea">
          <div class="gp-foot-linkarea__box"><a class="gp-btn02" href="#">Terms of use${chev}</a><a class="gp-btn02" href="#">Usage rules${chev}</a><a class="gp-btn02" href="#">Privacy policy${chev}</a></div>
          <div class="gp-foot-linkarea__box"><a class="gp-btn02 is-border" href="#">Group site${ext}</a><a class="gp-btn02 is-border" href="#">Group careers site${ext}</a></div>
          <p class="gp-foot__copy">©GREEN PARK</p>
        </div>
      </div>`;
    // Instead of the original mountain art, a newly drawn ridge with the same height and grain (light leaves, dark leaves, water, snow)
    foot.insertAdjacentHTML(
      "afterend",
      `<div class="gp-mountain" data-slot="mountain" aria-hidden="true"><svg viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path class="t2" d="M0 140V92l90-34 70 22 110-52 90 30 80-18 120-40 110 50 90-20 110 44 90-28 120 24 100-26 120 30 120-18v136z"/>
        <path class="t1" d="M0 140v-30l120-28 100 22 140-50 90 36 140-24 130 40 120-60 140 54 110-18 120 26 130-12v84z"/>
        <path class="t5" d="M500 38l40-14 30 16-26 6zM720 30l50-18 30 22-36 4zM980 66l30-14 34 18z"/>
        <path class="t3" d="M0 140v-14l160-18 120 14 160-26 180 22 170-20 160 18 180-16 150 20 160-12v32z"/>
        <path class="t4" d="M260 140l40-16 50 10 30-6 40 12zM880 140l60-14 50 8 40-4 20 10z"/>
      </svg></div>`,
    );
  }

  // Letter split — sub-page head title (.04s) and section title (.02s). Spaces between words are left as they are
  const split = (el, cls) => {
    let i = 0;
    el.querySelectorAll("[data-split]").forEach((row) => {
      row.innerHTML = [...row.textContent].map((c) => (c === " " ? " " : `<span class="${cls}" style="--i: ${i++}">${c}</span>`)).join("");
    });
  };
  const hero02 = document.querySelector(".gp-hero02");
  if (hero02) {
    split(hero02, "gp-hero02__ch");
    const on = () => setTimeout(() => hero02.classList.add("is-load"), 600);
    if (document.readyState === "complete") on(); else addEventListener("load", on, { once: true });
  }
  document.querySelectorAll(".gp-title02").forEach((t) => split(t, "gp-title02__ch"));

  // Model plan — goes in the same form at the end of the sub-section
  document.querySelectorAll('[data-slot="model-plan"]').forEach((el) => {
    el.classList.add("gp-model");
    el.innerHTML = `<p class="gp-model__en gp-stamp">MODEL PLAN</p><p class="gp-model__sub">Introducing our recommended model plan!</p>
      <div class="gp-model__list"><a class="gp-model__bnr" href="#"><div class="gp-ph"><div class="wf-img" data-label="Banner · family camp illustration + photo · landscape"></div></div></a><a class="gp-model__bnr" href="#"><div class="gp-ph"><div class="wf-img" data-label="Banner · Friends’ barbecue photo · Landscape"></div></div></a><a class="gp-model__bnr" href="#"><div class="gp-ph"><div class="wf-img" data-label="Banner · group training photo · landscape"></div></div></a></div>`;
  });

  // Header icon pill — comes in when the bottom edge of the Hero (home: icon row) passes above the screen
  const headTrigger = document.querySelector("[data-head-trigger]");
  if (head && headTrigger) {
    ScrollTrigger.create({ trigger: headTrigger, start: "bottom top", invalidateOnRefresh: true,
      onEnter: () => head.classList.add("is-open"), onLeaveBack: () => head.classList.remove("is-open") });
  }

  // Menu drawer
  const menu = head?.querySelector(".gp-menu"), nav = head?.querySelector(".gp-nav"), overlay = document.querySelector(".gp-overlay");
  const mountainEl = document.querySelector(".gp-mountain");
  // The mountain starts attaching not before the footer but at the spot the page decides (on Home, the end of the shortcut section)
  const mountAt = document.querySelector("[data-mountain-at]");
  if (mountAt && mountainEl) mountAt.append(mountainEl);
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("is-active", open);
    menu.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    document.body.classList.toggle("gp-lock", open);
    if (open) head.classList.remove("is-open");
    if (mountainEl) mountainEl.style.opacity = open ? 0 : 1;
    if (!open) ScrollTrigger.refresh();
  };
  if (menu) {
    menu.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    overlay.addEventListener("click", () => setMenu(false));
    nav.querySelector(".gp-nav-close").addEventListener("click", () => setMenu(false));
    addEventListener("keyup", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });
    nav.querySelectorAll(".gp-nav-tab__btn").forEach((b) => b.addEventListener("click", () => {
      const cate = b.dataset.cate;
      b.classList.toggle("is-active");
      nav.querySelectorAll(`.gp-nav-list__link[data-cate*="${cate}"]`).forEach((a) => a.classList.toggle(`is-${cate}`));
    }));
  }

  // In-section navigation — like the original, scrolls short by the header height, 480ms swing
  document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#top"])').forEach((a) => a.addEventListener("click", (e) => {
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const from = scrollY, target = to.getBoundingClientRect().top + scrollY - (head?.offsetHeight || 0);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, target);
    const t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / 480); scrollTo(0, from + (target - from) * (0.5 - Math.cos(p * Math.PI) / 2)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));

  // Back-to-top button — on Home, the shortcuts section, on other sections, once the document top passes 200px
  const pagetop = document.querySelector(".gp-pagetop");
  if (pagetop) {
    ScrollTrigger.create({ trigger: document.querySelector("[data-pagetop-trigger]") || main, start: "top top-=200", invalidateOnRefresh: true,
      onEnter: () => pagetop.classList.add("is-show"), onLeaveBack: () => pagetop.classList.remove("is-show") });
    pagetop.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
  }

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Rising
    gsap.utils.toArray(".gp-title02").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: () => (isPc() ? "top 70%" : "top 80%"), invalidateOnRefresh: true, once: true, onEnter: () => el.classList.add("is-in") });
    });
    gsap.utils.toArray(".gp-fade").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: () => (isPc() ? "top 70%" : "top 80%"), invalidateOnRefresh: true, once: true, onEnter: () => el.classList.add("is-in") });
    });
    // Phone bottom tab — hides when scrolling down, comes back on a fast scroll up (over 1000px per second)
    if (!isPc()) {
      const side = document.querySelector(".gp-side"), ptA = document.querySelector(".gp-pagetop a");
      let shown = true;
      ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom",
        onUpdate: (self) => {
          if (document.body.classList.contains("gp-lock")) return;
          if (self.direction === 1 && shown) {
            shown = false;
            gsap.to(side, { y: "101%", duration: 0.3, ease: "power1.inOut" });
            gsap.to(ptA, { y: 0, duration: 0.3, ease: "power1.inOut" });
          } else if (self.direction === -1 && !shown && self.getVelocity() < -1000) {
            shown = true;
            gsap.to(side, { y: 0, duration: 0.3, ease: "power1.inOut" });
            gsap.to(ptA, { y: -55, duration: 0.3, ease: "power1.inOut" });
          }
        } });
      gsap.set(ptA, { y: -55 });
    }
    // Bottom mountain — once its lower edge reaches the bottom of the screen, it sticks and goes to the end
    if (mountainEl) {
      ScrollTrigger.create({ trigger: mountainEl, endTrigger: foot, start: "bottom bottom", end: "bottom bottom-=1000",
        pin: true, pinType: "fixed", anticipatePin: 0, pinSpacing: false, invalidateOnRefresh: true });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { document.querySelectorAll(".gp-fade, .gp-title02").forEach((el) => el.classList.add("is-in")); });

  // Loader — lifts .5s after the document is fully received. If it hasn’t lifted after 8s, it lifts anyway
  const offLoader = () => { loading.classList.add("is-off"); document.dispatchEvent(new Event("gp:loaded")); };
  GP.loaded = false;
  const onLoad = () => setTimeout(() => { GP.loaded = true; offLoader(); }, 500);
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);
  setTimeout(() => { if (!GP.loaded) offLoader(); }, 8000);
})();
