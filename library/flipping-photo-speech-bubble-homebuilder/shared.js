// Shared by all pages: draws the header (submenu panel), phone bottom row, right shortcuts, contact bar and footer in one place, and attaches reveal (popfade), handwritten line and folding.
// Original numbers: transition .4s ease-out · popfade .45s cubic-bezier(.175,.885,.32,1.275) at 65% of the screen · shortcut appears after scrolling past 2000px · Vivus 60 frames/delay 40 frames.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SW = (window.SW = { reduced });

  // A newly drawn house-shaped mark instead of the original logo (four secondary-color pieces)
  const mark = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="var(--kf-surface)" stroke="var(--site-faint)"/><path d="M24 9 9 21v4l15-12 15 12v-4z" fill="var(--kf-accent)"/><path d="M12 24v14h11V27z" fill="var(--site-mustard)"/><path d="M25 27v11h11V24z" fill="var(--site-teal)"/><path d="M20 31h8v7h-8z" fill="var(--site-blue)"/></svg>`;
  // The logo link has no class, like the original — it groups with classless links (sub-menu rows), so measuring and keyboard order match the original
  const logo = (tag = true) => `<a href="index.html" aria-label="Home" data-logo>${mark}<span class="s-logo__word">LOGO</span>${tag ? '<span class="s-logo__tag">Your one-line company intro here</span>' : ""}</a>`;
  const arrow = (cls = "") => `<span class="s-arrow ${cls}"><i></i></span>`;
  const mail = `<svg viewBox="0 0 40 34" aria-hidden="true"><rect x="1" y="2" width="30" height="22" rx="2" fill="var(--kf-on-accent)"/><path d="m2 4 14 11L30 4" fill="none" stroke="var(--kf-accent)" stroke-width="2.4"/><path d="M26 28h11m-4-4 4 4-4 4" fill="none" stroke="var(--kf-on-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ico = {
    search: `<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="15" cy="15" r="9" fill="none" stroke="var(--kf-on-accent)" stroke-width="4"/><path d="m22 22 8 8" stroke="var(--kf-on-accent)" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    town: `<svg viewBox="0 0 36 36" aria-hidden="true" fill="var(--kf-on-accent)"><path d="M18 4 11 10v7h14v-7z"/><path d="M8 18 2 23v8h12v-8zM28 18l-6 5v8h12v-8z"/></svg>`,
    house: `<svg viewBox="0 0 36 36" aria-hidden="true" fill="var(--kf-on-accent)"><path d="M18 5 4 16v3h3v12h22V19h3v-3z"/><rect x="15" y="22" width="6" height="9" fill="var(--site-sky)"/></svg>`,
  };
  SW.icons = { mark, arrow, mail, ico };

  // Repeating images (wavy underline, white arrow over photo) can’t be painted with a mask, so the skin color is read and the image URL is baked in
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (v) => {
    const el = document.createElement("i");
    el.style.color = `var(${v})`;
    document.body.append(el);
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(el).color;
    el.remove();
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r},${g},${b})`;
  };
  const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  const wave = (c) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 6"><path d="M0 3c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2" fill="none" stroke="${c}" stroke-width="1.6"/></svg>`);
  const root = document.documentElement.style;
  root.setProperty("--s-wave-accent", wave(rgb("--kf-accent")));
  root.setProperty("--s-wave-sky", wave(rgb("--site-sky")));
  root.setProperty("--s-arrow-on", uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${rgb("--kf-contrast-ink")}" d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z"/></svg>`));

  // Menu links connect our own pages, and unbuilt spots use #. The current-page marker is only on items without a submenu (the original link is javascript:void(0), so group items are not painted).
  const NAV = [
    { t: "Menu 1", en: "CONCEPT", jp: "Menu 1 Group", href: "about.html", key: "about",
      links: [["Sub Menu 1", "about.html"], ["Sub Menu 2", "#"], ["Sub Menu 3", "#"], ["Sub Menu 4", "#"]],
      cards: [["Card 1", "about.html", "Family consultation scene · Dining table · Window natural light · Landscape 3:2"], ["Card 2", "#", "Close-up of hands doing insulation work · indoor light · landscape 3:2"]] },
    { t: "Menu 2", en: "LINE UP", jp: "Menu 2 Group", href: "#",
      links: [["Sub Menu 1", "#"], ["Sub Menu 2", "#"], ["Sub Menu 3", "#"]],
      cards: [["Card 1", "#", "Wood-ceiling living room · daytime natural light · landscape 3:2"], ["Card 2", "#", "Dark-walled single-story house exterior · clear daytime · landscape 3:2"]] },
    { t: "Menu 3", en: "SEARCH", jp: "Menu 3 Group", href: "#",
      links: [["Sub Menu 1", "#"], ["Sub Menu 2", "#"], ["Sub Menu 3", "#"]],
      cards: [["Card 1", "#", "Housing development street · clear daytime · landscape 3:2"], ["Card 2", "#", "Vacant lot · mountain backdrop · landscape 3:2"]] },
    { t: "Menu 4", en: "WORKS", jp: "Menu 4 Group", href: "works.html", key: "works",
      links: [["Sub Menu 1", "works.html"], ["Sub Menu 2", "#"], ["Sub Menu 3", "#"], ["Sub Menu 4", "#"]],
      cards: [["Card 1", "works.html", "Finished house living room · large window · landscape 3:2"], ["Card 2", "#", "Homeowner family group photo · in front of the house · 3:2 landscape"]] },
    { t: "Menu 5", href: "event.html", key: "event" },
    { t: "Menu 6", en: "ABOUT US", jp: "Menu 6 Group", href: "#", key: "news",
      links: [["Sub Menu 1", "#"], ["Sub Menu 2", "#"], ["Sub Menu 3", "news.html"], ["Sub Menu 4", "#"], ["Sub Menu 5", "#"], ["Sub Menu 6", "#"]],
      cards: [["Card 1", "#", "Staff group photo · office · landscape 3:2"], ["Card 2", "news.html", "Blueprint and hands on a desk · from above · landscape 3:2"]] },
  ];

  const sub = (n) => !n.links ? "" : `
    <button class="s-gnav__toggle" type="button" aria-label="${n.t} Unfold"></button>
    <div class="s-sub"><div><div class="s-sub__panel">
      <div class="s-sub__head">
        <p class="s-ttl s-ttl--boxed"><span class="s-ttl__inner"><span class="s-ttl__en s-en" style="font-size:2rem">${n.en}</span><span class="s-ttl__jp" style="font-size:.8rem">${n.jp}</span></span></p>
        <ul class="s-sub__links">${n.links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      </div>
      <ul class="s-sub__cards">${n.cards.map(([t, h, l]) => `<li><a class="s-hvr" href="${h}"><div class="wf-img" data-label="${l}"></div><span class="s-sub__cap">${t}${arrow("s-arrow--sm")}</span></a></li>`).join("")}</ul>
    </div></div></div>`;

  const reserve = `<a class="s-reserve" href="#contact"><span class="s-reserve__bubble">Your short line here!</span><span class="s-reserve__txt">Booking button</span>${mail}</a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "s-header";
    head.innerHTML = `
      <div class="s-header__bar">
        ${logo()}
        <a class="s-sp-reserve" href="#contact">${mail}Booking button</a>
        <nav class="s-gnav" id="s-gnav" aria-label="Main menu">
          <ul class="s-gnav__menu">${NAV.map((n) => `<li class="s-gnav__item${n.links ? " has-sub" : ""}${n.key === page && !n.links ? " is-current" : ""}"><a class="s-gnav__link" href="${n.href}"><span>${n.t}</span></a>${sub(n)}</li>`).join("")}</ul>
          ${reserve}
        </nav>
      </div>`;
    // As in the original, right after the header sit the phone’s lower row and the right-side shortcuts (same document order so keyboard order and measuring pairs match too)
    head.insertAdjacentHTML("afterend", `
      <div class="s-spbar" data-slot="sp-menu-bar">
        <ul><li><a href="index.html">Home</a></li><li><a href="#">Menu 2</a></li><li><a href="#">Menu 3</a></li><li><a href="works.html">Menu 4</a></li></ul>
        <button class="s-burger" type="button" aria-label="Open Menu" aria-controls="s-gnav" aria-expanded="false"><span><i></i><i></i><i></i></span></button>
      </div>
      <aside class="s-side-cta" data-slot="side-shortcuts" aria-label="Shortcut">
        <p class="s-side-cta__ttl s-script">Check it!</p>
        <ul>
          <li><a class="s-side-cta__link is-1" href="#" style="background:var(--site-mustard)">${ico.search}<span>Shortcut 1${arrow()}</span></a></li>
          <li><a class="s-side-cta__link is-2" href="#" style="background:var(--site-teal)">${ico.town}<span>Shortcut 2${arrow()}</span></a></li>
          <li><a class="s-side-cta__link is-3" href="works.html" style="background:var(--site-sky)">${ico.house}<span>Shortcut 3${arrow()}</span></a></li>
        </ul>
      </aside>`);
  }

  // Scalloped circle badge — redrawn at the same position and size as the original sticker
  SW.badge = (cls = "", fill = "var(--kf-ink)") => {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, r = i % 2 ? 46 : 50;
      pts.push(`${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`);
    }
    return `<span class="s-badge ${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="${pts.join(" ")}" fill="${fill}"/></svg><span><b class="s-script">Welcome!</b>Here<small>A short word for!</small></span></span>`;
  };
  // Round See details button over the Work card photo (redrawn from the original button_round art) — the same on every card, so it is attached here
  const roundBtn = (i) => `<span class="l-hov__btn" aria-hidden="true"><svg viewBox="0 0 220 194"><defs><path id="l-hov-arc-${i}" d="M40 92a70 70 0 0 1 140 0"/></defs><text><textPath href="#l-hov-arc-${i}" startOffset="50%" text-anchor="middle">View details</textPath></text><circle cx="110" cy="130" r="58"/><path d="M92 130h36m-13-13 13 13-13 13"/></svg></span>`;
  document.querySelectorAll(".l-hov").forEach((el, i) => el.insertAdjacentHTML("beforeend", roundBtn(i)));
  document.querySelectorAll("[data-badge]").forEach((el) => (el.outerHTML = SW.badge(el.className, el.dataset.badge || undefined)));

  document.querySelectorAll('[data-slot="contact-cta"]').forEach((cta, n) => {
    cta.classList.add("s-cta");
    if (n === 0) cta.id = "contact";
    cta.innerHTML = `
      <div class="s-cta__top">
        ${SW.badge("s-cta__badge")}
        <div class="s-cta__person wf-img" data-label="Staff upper body cutout · smiling face · portrait 2:3"></div>
        <div><p class="s-cta__title s-en">CONTACT</p><p class="s-cta__sub s-bracket">Your short notice here</p></div>
        <p class="s-cta__lead">Your one sentence inviting people to get in touch goes here.<br>Add your second line here.</p>
      </div>
      <div class="s-cta__btm">
        <div class="s-cta__col"><p class="s-cta__label s-lead-slash" style="color:var(--kf-ink);font-size:1.1rem"><span><b class="s-orange">Phone</b>Contact via</span></p><p class="s-cta__tel">0000-00-0000</p><p class="s-cta__hours">Hours: weekdays 0:00~00:00 (excluding weekends and holidays)</p></div>
        <div class="s-cta__col"><p class="s-cta__label s-lead-slash" style="color:var(--kf-ink);font-size:1.1rem"><span><b>Mail</b>Ask via</span></p><a class="s-cta__btn s-hvr" href="#">Book a Consultation${arrow()}</a></div>
        <div class="s-cta__col"><p class="s-cta__label teal s-lead-slash" style="color:var(--kf-ink);font-size:1.1rem"><span><b>Material Request</b>is here</span></p><a class="s-cta__btn s-cta__btn--teal s-hvr" href="#">Get materials${arrow()}</a></div>
      </div>`;
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "s-footer";
    const col = (n) => `<div><h3>${n.t}</h3><ul>${(n.links || [["Sub Menu 1", n.href]]).map(([t, h]) => `<li><a class="s-fnav__link" href="${h}">${t}</a></li>`).join("")}</ul></div>`;
    foot.innerHTML = `
      <div class="s-footer__top">
        <div class="s-footer__co">${logo(false)}<p>Company name spot · legal entity name spot</p><p>Postal code 000-0000<br>Your address line goes here</p><p>TEL 0000-00-0000 FAX 0000-00-0000</p></div>
        <div class="s-footer__nav">${NAV.filter((n) => n.links).map(col).join("")}
          <div class="s-footer__extra"><ul><li><a href="event.html">Menu 5</a></li><li><a href="#">Menu 7</a></li><li><a href="#">Menu 8</a></li></ul></div>
        </div>
      </div>
      <div class="s-footer__btm">
        <nav><a href="#">Privacy policy</a><a href="#">Sitemap</a><a href="#" aria-label="SNS"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a></nav>
        <p>© 0000 COMPANY NAME All Rights Reserved.</p>
      </div>`;
  }

  // Phone menu: hamburger opens the full-screen menu with a fade, the + on each item folds and unfolds its sublinks
  const burger = document.querySelector(".s-burger");
  const gnav = document.querySelector(".s-gnav");
  burger?.addEventListener("click", () => {
    const open = !gnav.classList.contains("is-open");
    gnav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".s-gnav__toggle").forEach((b) =>
    b.addEventListener("click", () => b.closest(".s-gnav__item").classList.toggle("is-open"))
  );
  document.querySelectorAll(".s-side__ttl").forEach((b) =>
    b.addEventListener("click", () => b.closest(".s-side__sec").classList.toggle("is-open"))
  );

  const sideCta = document.querySelector(".s-side-cta");
  const onScroll = () => sideCta?.classList.toggle("is-on", scrollY > 2000 && innerWidth > 1080);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Handwriting lines use the same Vivus 0.4.6 oneByOne as the original — length in frames (60fps), data-frames per line (original 60 · 50), all drawn at once as the group’s first element passes its spot
  const drawAt = (el) => el.closest("[data-draw-at]") || el;
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) {
      document.querySelectorAll(".s-pop").forEach((el) => el.classList.add("is-in"));
      return;
    }
    document.querySelectorAll(".s-pop").forEach((el) =>
      ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => el.classList.add("is-in") })
    );
    const groups = new Map();
    if (window.Vivus) document.querySelectorAll(".s-draw").forEach((svg) => {
      const at = drawAt(svg);
      const v = new Vivus(svg, { type: "oneByOne", duration: +(svg.dataset.frames ?? 60), delay: 40, animTimingFunction: Vivus.EASE_OUT, start: "manual" });
      groups.set(at, [...(groups.get(at) || []), v]);
    });
    groups.forEach((list, at) =>
      ScrollTrigger.create({ trigger: at, start: at.dataset.drawAt || "top 70%", once: true, onEnter: () => list.forEach((v) => v.play()) })
    );
    return () => groups.forEach((list) => list.forEach((v) => v.destroy()));
  });
})();
