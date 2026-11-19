// Shared across the site — draws the header row and footer for the two branches (body.rp recruiting portal · body.co corporate) and hooks up interaction.
// Original values: dropdown and cover fade 300ms swing(= sine.inOut) · Phone menu fold 300ms · Menu underline 300ms swing (width = Item width − 50, left + 25)
//            back-to-top button from 200px down · anchor move 400ms · reveal via rootMargin "33% 0% -33% 0%"
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth < 768;
  const body = document.body;
  const page = body.dataset.page || "home";

  // A newly drawn placeholder in place of the original logo — three symbols (blue plate · green hook · yellow dot) + English wordmark + one-line tagline
  const mark = (tag = "Your one-line company tagline here") => `<svg viewBox="0 0 111 30" role="img" aria-label="Brand Logo">
      <path class="lg-b" d="M2.2 3.6 7 3.2l2 5.9-3 .3-.1 4.4h4.3l1.3 4.3c.2.8-2.6 1.4-4.6 1.6-2 .3-4.8-.3-4.8-.3-3-.8-2-1.6-1.2-5.9C1.5 9.1 2.2 3.6 2.2 3.6Z"/>
      <ellipse class="lg-y" cx="4.4" cy="1.1" rx="3.8" ry="1.1"/>
      <path class="lg-y" d="m10.7 10.2-3.2 0v2.5h3.4l1.4 6.5 3-2.8.5-2.1-1.9 1.2.1-2.8h3.5v-2.4h-3.4l.3-3.6h-4Z"/>
      <path class="lg-g" d="M24.8 4.1s-7.2-1.3-7.7-.9c-.5.3-1.7 5.2-1.7 5.2l3.8 1.6.8 3.3-1.1 2.9-.7-2.8-1.3.4-1.2 3.4 6 2.8 4.3-5-4.7-6.7-3-1 1.2-1.7 5.5 4Z"/>
      <text class="rp-logo__word" x="31" y="19">BRAND</text>
      <text class="rp-logo__tag" x="0" y="28.6">${tag}</text>
    </svg>`;
  const logoCss = `.lg-b{fill:var(--kf-accent-text)}.lg-g{fill:var(--kf-success)}.lg-y{fill:var(--kf-warning)}`;
  document.head.insertAdjacentHTML("beforeend", `<style>${logoCss}</style>`);

  const fadeTo = (el, show) => {
    if (reduce) { el.style.display = show ? "block" : "none"; el.style.opacity = ""; return; }
    gsap.killTweensOf(el);
    if (show) { el.style.display = "block"; gsap.fromTo(el, { opacity: Number(getComputedStyle(el).opacity) || 0 }, { opacity: 1, duration: 0.3, ease: "sine.inOut" }); }
    else gsap.to(el, { opacity: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; } });
  };
  const slideToggle = (el) => {
    const open = getComputedStyle(el).display === "none";
    gsap.killTweensOf(el);
    if (reduce) { el.style.display = open ? "block" : "none"; return; }
    if (open) {
      el.style.display = "block";
      gsap.fromTo(el, { height: 0, overflow: "hidden" }, { height: "auto", duration: 0.3, ease: "sine.inOut", clearProps: "height,overflow" });
    } else gsap.to(el, { height: 0, overflow: "hidden", duration: 0.3, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; gsap.set(el, { clearProps: "height,overflow" }); } });
  };

  // ───────── Careers portal ─────────
  if (body.classList.contains("rp")) {
    const head = document.querySelector('[data-slot="header"]');
    const items = (ico = "") => ["Recruiting 1", "Recruiting 2", "Recruiting 3", "Recruiting 4"].map((t) => `<li><a href="recruit.html">${t} Hiring<span class="rp-ico${ico}"></span></a></li>`).join("");
    head.innerHTML = `
      <div class="rp-head__in">
        <a class="rp-logo" href="index.html" data-label="Brand logo · symbol + English wordmark + one-line tagline"><span class="rp-logo__mark">${mark()}</span><span class="rp-logo__txt u-en" data-label="Site name in English">Recruiting Portal site</span></a>
        <button class="rp-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>
        <nav class="rp-nav" aria-label="Main menu">
          <div class="rp-nav__box"><button class="rp-nav__head" type="button">Application guidelines</button><div class="rp-nav__panel"><ul>${items()}</ul></div></div>
          <div class="rp-nav__box is-entry"><button class="rp-nav__head u-en" type="button" data-label="Apply button (English)">entry</button><div class="rp-nav__panel"><ul>${items()}</ul></div></div>
        </nav>
      </div>`;
    head.classList.add("rp-head");
    head.insertAdjacentHTML("beforebegin", '<div class="rp-nav-veil"></div>');

    const veil = document.querySelector(".rp-nav-veil"), nav = head.querySelector(".rp-nav"), burger = head.querySelector(".rp-burger");
    const heads = [...head.querySelectorAll(".rp-nav__head")];
    const closeAll = () => {
      fadeTo(veil, false);
      nav.classList.remove("is-open"); burger.classList.remove("is-open");
      if (!isSp()) heads.forEach((h) => { h.classList.remove("is-active"); h.nextElementSibling.classList.remove("is-active"); });
    };
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (nav.classList.contains("is-open")) return closeAll();
      fadeTo(veil, true); nav.classList.add("is-open"); burger.classList.add("is-open");
    });
    veil.addEventListener("click", closeAll);
    heads.forEach((h) => h.addEventListener("click", () => {
      const panel = h.nextElementSibling;
      if (isSp()) slideToggle(panel);
      else {
        heads.filter((o) => o !== h && o.classList.contains("is-active")).forEach((o) => { o.classList.remove("is-active"); o.nextElementSibling.classList.remove("is-active"); });
        fadeTo(veil, !panel.classList.contains("is-active"));
      }
      panel.classList.toggle("is-active"); h.classList.toggle("is-active");
    }));

    // Opening video loader — .2s after playback starts the video · Skip turn on over .3s, and when it ends or Skip is pressed the hole opens
    const loader = document.querySelector(".rp-loader");
    if (loader) {
      const video = loader.querySelector("video"), skip = loader.querySelector(".rp-loader__skip");
      const end = () => { loader.classList.add("is-end"); video?.pause(); document.querySelector(".rp-mv")?.classList.add("is-animated"); };
      skip?.addEventListener("click", end);
      if (reduce || !video) end();
      else {
        video.addEventListener("ended", end);
        video.play().then(() => setTimeout(() => loader.classList.add("is-start"), 200)).catch(end);
      }
    }

    const foot = document.querySelector('[data-slot="footer"]');
    if (foot) {
      foot.classList.add("rp-foot");
      foot.innerHTML = `
        <div class="rp-foot__vi js-anime" data-loop data-label="Street illustration · company tower in the center (dish antenna, ring) with surrounding buildings and trees · people walk in at the front">
          <div class="rp-foot__bg">${city()}</div>
          ${people()}
        </div>
        <div class="rp-foot__in"><div class="rp-foot__box">
          <p class="rp-foot__logo"><a class="rp-foot__logo-link" href="index.html">${mark()}</a></p>
          <ul class="rp-foot__nav">
            ${["Company Site", "Company overview", "Privacy policy", "Terms of service", "Your long policy name goes here in one line"].map((t, i) => `<li><a class="rp-foot__nav-link" href="${["page.html", "about.html", "about.html", "about.html", "about.html"][i]}">${t}<span class="rp-ico is-blank"></span></a></li>`).join("")}
          </ul>
          <p class="rp-foot__cr"><small class="u-en" data-label="Copyright English single line">© Company Name Inc. All rights reserved.</small></p>
          <p class="rp-foot__top u-en"><a class="rp-foot__top-link" href="#top"><span class="u-txt" data-label="Back to top (EN)">Page Top</span><span class="rp-ico"></span></a></p>
        </div></div>`;
    }
  }

  // Street illustration — a newly drawn flat illustration instead of the original photo. All colors come from Skin variables
  function city() {
    const bldg = (x, y, w, h, tone, rows, cols) => {
      let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="c-${tone}"/>`;
      const gw = w / cols, gh = Math.min(48, (h - 40) / rows);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect x="${(x + c * gw + gw * 0.18).toFixed(1)}" y="${(y + 24 + r * gh).toFixed(1)}" width="${(gw * 0.64).toFixed(1)}" height="${(gh * 0.55).toFixed(1)}" class="c-win"/>`;
      return s;
    };
    const tree = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" class="c-tree"/><circle cx="${x + r * 0.9}" cy="${y + r * 0.15}" r="${r * 0.85}" class="c-tree2"/><circle cx="${x + r * 1.8}" cy="${y}" r="${r * 0.9}" class="c-tree"/>`;
    const tower = (cx, top, s) => `
      <g transform="translate(${cx} ${top}) scale(${s})">
        <ellipse cx="0" cy="-110" rx="92" ry="74" class="c-dish"/><path d="M-60 -120 0 -110 60 -120M0 -180 0 -40" class="c-dish-line"/>
        <path d="M-28 -40h56l14 70h-84Z" class="c-mast"/>
        <path d="M-142 30h284v74c0 10-64 20-142 20s-142-10-142-20Z" class="c-ring"/><ellipse cx="0" cy="30" rx="142" ry="22" class="c-ring-top"/>
        <path d="M-80 140h160l84 600h-328Z" class="c-tower"/>
        <g transform="translate(-58 175) scale(4.2)" class="c-tower-mark"><path d="M2.2 3.6 7 3.2l2 5.9-3 .3-.1 4.4h4.3l1.3 4.3c.2.8-2.6 1.4-4.6 1.6-2 .3-4.8-.3-4.8-.3-3-.8-2-1.6-1.2-5.9C1.5 9.1 2.2 3.6 2.2 3.6Z"/><path d="M24.8 4.1s-7.2-1.3-7.7-.9c-.5.3-1.7 5.2-1.7 5.2l3.8 1.6.8 3.3-1.1 2.9-.7-2.8-1.3.4-1.2 3.4 6 2.8 4.3-5-4.7-6.7-3-1 1.2-1.7 5.5 4Z"/></g>
        <text x="0" y="330" text-anchor="middle" class="c-tower-word">BRAND</text>
      </g>`;
    const pc = `<svg class="is-pc" viewBox="0 0 1920 1080" aria-hidden="true">
      <rect width="1920" height="1080" class="c-sky"/>
      <path d="M1180 -20c160 260 120 640-120 900" class="c-glass"/><path d="M1205 -20c160 260 120 640-120 900" class="c-glass-hi"/>
      <path d="M560 380l40-8 8 6-40 10Z" class="c-plane"/>
      ${bldg(0, 490, 120, 600, "b2", 10, 2)}${bldg(60, 470, 230, 620, "b1", 11, 3)}${bldg(230, 620, 200, 470, "b3", 8, 4)}
      ${bldg(470, 720, 120, 380, "b1", 6, 3)}${bldg(560, 510, 150, 580, "b2", 10, 2)}${bldg(640, 790, 160, 300, "b3", 5, 3)}
      ${bldg(1250, 710, 160, 380, "b3", 6, 3)}${bldg(1310, 510, 160, 580, "b2", 10, 2)}${bldg(1490, 610, 210, 480, "b1", 8, 4)}
      ${bldg(1640, 500, 160, 590, "b2", 10, 3)}${bldg(1780, 540, 160, 550, "b1", 9, 3)}
      <path d="M1495 680l120-40v160l-120 40Z" class="c-board"/>
      ${tree(270, 610, 50)}${tree(1650, 485, 40)}${tree(1700, 900, 70)}${tree(20, 960, 60)}
      ${tower(960, 270, 1)}
      <rect x="0" y="1000" width="1920" height="80" class="c-ground"/>
    </svg>`;
    const sp = `<svg class="is-sp" viewBox="0 0 750 1318" aria-hidden="true">
      <rect width="750" height="1318" class="c-sky"/>
      <path d="M470 -20c120 300 90 640-90 980" class="c-glass"/>
      ${bldg(-20, 620, 170, 700, "b1", 12, 3)}${bldg(120, 760, 120, 560, "b3", 9, 2)}${bldg(560, 640, 190, 680, "b2", 12, 3)}${bldg(500, 820, 110, 500, "b3", 8, 2)}
      ${tree(40, 600, 40)}${tree(600, 620, 36)}
      ${tower(375, 420, 0.86)}
      <rect x="0" y="1220" width="750" height="98" class="c-ground"/>
    </svg>`;
    return pc + sp;
  }

  // Person — head·hair·torso·arms·legs as shapes. tops: top color options, back: back view
  function person(x, y, h, top = "a", o = {}) {
    const u = h / 10, w = u * 2.2;
    const hair = o.hair || "dark", leg = o.leg || "ink";
    const head = `<circle cx="${x}" cy="${y + u * 0.95}" r="${u * 0.7}" class="c-skin"/>`;
    const hr = o.back
      ? `<path d="M${x - u * 0.95} ${y + u * 1.1}a${u * 0.95} ${u * 1.05} 0 1 1 ${u * 1.9} 0v${u * 0.9}h-${u * 1.9}Z" class="c-hair-${hair}"/>`
      : `<path d="M${x - u * 0.9} ${y + u * 0.9}a${u * 0.9} ${u * 0.92} 0 0 1 ${u * 1.8} 0c-${u * 0.5}-${u * 0.25}-${u * 1.2}-${u * 0.2}-${u * 1.8} 0Z" class="c-hair-${hair}"/>`;
    const torso = `<rect x="${x - w / 2}" y="${y + u * 2}" width="${w}" height="${u * 3.6}" rx="${u * 0.9}" class="c-top-${top}"/>`;
    const arms = `<rect x="${x - w / 2 - u * 0.55}" y="${y + u * 2.3}" width="${u * 0.7}" height="${u * 3}" rx="${u * 0.35}" class="c-top-${top}" transform="rotate(${o.wave ? -30 : 6} ${x - w / 2} ${y + u * 2.4})"/><rect x="${x + w / 2 - u * 0.15}" y="${y + u * 2.3}" width="${u * 0.7}" height="${u * 3}" rx="${u * 0.35}" class="c-top-${top}" transform="rotate(-6 ${x + w / 2} ${y + u * 2.4})"/>`;
    const legs = `<rect x="${x - u * 0.95}" y="${y + u * 5.4}" width="${u * 0.85}" height="${u * 4.6}" rx="${u * 0.3}" class="c-leg-${leg}"/><rect x="${x + u * 0.1}" y="${y + u * 5.4}" width="${u * 0.85}" height="${u * 4.6}" rx="${u * 0.3}" class="c-leg-${leg}"/>`;
    const bag = o.bag ? `<rect x="${x + w / 2 - u * 0.2}" y="${y + u * 4}" width="${u * 1.2}" height="${u * 1.4}" rx="${u * 0.2}" class="c-bag"/>` : "";
    return legs + arms + torso + bag + (o.back ? head + hr : head + hr);
  }
  function people() {
    // [number, original image size (w×h), people — [x, y, height, top, styling]] — positions and sizes keep the original image cell ratios
    const set = [
      [1, 92, 300, [[46, 0, 300, "b", { leg: "ink" }]]],
      [2, 110, 334, [[55, 0, 334, "c", { hair: "red" }]]],
      [3, 150, 390, [[75, 0, 390, "d", { bag: true }]]],
      [4, 170, 296, [[85, 0, 296, "a", { hair: "red" }]]],
      [5, 690, 1036, [[220, 40, 990, "d", { hair: "dark" }], [520, 160, 870, "b", { leg: "navy" }]]],
      [6, 696, 1022, [[200, 20, 1000, "a", { wave: true, leg: "navy" }], [500, 120, 900, "c", { hair: "brown" }]]],
      [7, 690, 1116, [[240, 40, 1070, "d", { hair: "red", bag: true }], [520, 260, 850, "a", { hair: "dark" }]]],
      [8, 456, 1522, [[228, 0, 1520, "a", { back: true, hair: "red" }]]],
      [9, 1042, 1218, [[360, 0, 1218, "c", { bag: true }], [760, 140, 1070, "e", { back: true, hair: "red" }]]],
      [10, 602, 1136, [[300, 0, 1136, "e", { back: true, hair: "red" }]]],
    ];
    return set.map(([n, w, h, ps]) => `<div class="rp-foot__item is-i${String(n).padStart(2, "0")}"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${ps.map(([x, y, k, t, o]) => person(x, y, k, t, o)).join("")}</svg></div>`).join("");
  }
  const cityCss = `.c-sky{fill:var(--kf-bg)}.c-b1{fill:color-mix(in oklab,var(--kf-surface) 70%,var(--kf-raised))}.c-b2{fill:var(--kf-raised)}.c-b3{fill:color-mix(in oklab,var(--kf-line) 35%,var(--kf-surface))}
    .c-win{fill:color-mix(in oklab,var(--kf-line) 55%,var(--kf-surface))}.c-tree{fill:var(--kf-success)}.c-tree2{fill:color-mix(in oklab,var(--kf-success) 60%,var(--kf-accent))}
    .c-board{fill:var(--kf-warning)}.c-plane{fill:var(--kf-line)}.c-ground{fill:color-mix(in oklab,var(--kf-surface) 60%,var(--kf-bg))}
    .c-glass{fill:none;stroke:color-mix(in oklab,var(--kf-accent-soft) 70%,var(--kf-surface));stroke-width:70;stroke-linecap:round;opacity:.7}.c-glass-hi{fill:none;stroke:var(--kf-surface);stroke-width:8;stroke-linecap:round;opacity:.8}
    .c-dish{fill:var(--kf-surface);stroke:var(--kf-line);stroke-width:3}.c-dish-line{fill:none;stroke:var(--kf-line);stroke-width:2}.c-mast{fill:var(--kf-line)}
    .c-ring{fill:color-mix(in oklab,var(--kf-accent) 75%,var(--kf-surface))}.c-ring-top{fill:color-mix(in oklab,var(--kf-accent) 55%,var(--kf-surface))}.c-tower{fill:var(--kf-accent)}
    .c-tower-mark{fill:var(--kf-surface)}.c-tower-word{font:var(--kf-weight-display) 64px var(--kf-font-display);fill:var(--kf-surface)}
    .c-skin{fill:color-mix(in oklab,var(--kf-warning) 22%,var(--kf-surface))}.c-hair-dark{fill:var(--kf-ink)}.c-hair-red{fill:color-mix(in oklab,var(--kf-danger) 75%,var(--kf-ink))}.c-hair-brown{fill:color-mix(in oklab,var(--kf-warning) 40%,var(--kf-ink))}
    .c-top-a{fill:var(--kf-accent)}.c-top-b{fill:var(--kf-ink-soft)}.c-top-c{fill:color-mix(in oklab,var(--kf-success) 75%,var(--kf-surface))}.c-top-d{fill:var(--kf-warning)}.c-top-e{fill:color-mix(in oklab,var(--kf-danger) 45%,var(--kf-surface))}
    .c-leg-ink{fill:var(--kf-ink)}.c-leg-navy{fill:var(--kf-accent-text)}.c-bag{fill:var(--kf-ink-soft)}`;
  document.head.insertAdjacentHTML("beforeend", `<style>${cityCss}</style>`);

  // Reveal — is-animated when inside the band from 33% above the screen to 33% inside the bottom. data-loop is removed on exit (footer distance graphic)
  const watch = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.target.hasAttribute("data-loop")) e.target.classList.toggle("is-animated", e.isIntersecting);
      else if (e.isIntersecting) e.target.classList.add("is-animated");
    }), { rootMargin: "33% 0% -33% 0%", threshold: 0 });
    document.querySelectorAll(".js-anime").forEach((el) => io.observe(el));
  };
  if (document.readyState === "complete") watch(); else addEventListener("load", watch, { once: true });

  // ───────── Corporate ─────────
  if (body.classList.contains("co")) {
    const cur = (p) => (p === page ? " is-current" : "");
    const head = document.querySelector('[data-slot="header"]');
    const pin = '<svg viewBox="0 0 32 30" aria-hidden="true"><path d="M16 1a8 8 0 0 0-8 8c0 6 8 15 8 15s8-9 8-15a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/><path d="M8 26h16v2H8Z" fill="currentColor"/></svg>';
    const mail = '<svg viewBox="0 0 32 30" aria-hidden="true"><path d="M2 6h28v18H2Zm2.4 2 11.6 8.6L27.6 8Zm-.4 2.4V22h24V10.4l-12 8.8Z" fill="currentColor" fill-rule="evenodd"/></svg>';
    head.classList.add("co-head");
    head.innerHTML = `
      <p class="co-logo"><a href="page.html" data-label="Brand logo · symbol + English wordmark + tagline">${mark()}</a></p>
      <nav class="co-nav">
        <div class="co-gnav">
          <ul>
            <li class="${cur("about").trim()}"><a href="about.html"><span>Company overview</span></a><button type="button" aria-label="Submenu"></button><div class="co-gnav__sub"><ul><li><a href="about.html">Business results</a></li><li><a href="about.html">Business details</a></li></ul></div></li>
            <li><a href="about.html"><span>About us</span></a><button type="button" aria-label="Submenu"></button><div class="co-gnav__sub"><ul><li><a href="about.html">Business introduction</a></li><li><a href="about.html">Sustainability</a></li></ul></div></li>
            <li><a href="page.html#news"><span>News release</span></a></li>
            <li class="${cur("recruit").trim()}"><a href="recruit.html"><span>Hiring Info</span></a></li>
            <li><a href="page.html#topics"><span data-label="News section English name">BRAND TOPICS</span></a></li>
          </ul>
          <div class="co-gnav__line"></div>
        </div>
        <ul class="co-unav"><li><a href="about.html">${pin}Directions</a></li><li><a href="about.html">${mail}Inquiry</a></li></ul>
      </nav>
      <button class="co-burger" type="button" aria-label="Open · close menu"><span><span></span></span></button>`;
    head.insertAdjacentHTML("afterend", '<div class="co-veil"></div>');

    const nav = head.querySelector(".co-nav"), burger = head.querySelector(".co-burger"), veil = document.querySelector(".co-veil");
    const toggleMenu = () => {
      burger.classList.toggle("is-active");
      const open = burger.classList.contains("is-active");
      fadeTo(nav, open); fadeTo(veil, open);
      nav.style.maxHeight = open ? `${innerHeight - 53}px` : "none";
    };
    burger.addEventListener("click", toggleMenu);
    veil.addEventListener("click", toggleMenu);
    head.querySelectorAll(".co-gnav > ul > li > button").forEach((b) => b.addEventListener("click", () => { b.classList.toggle("is-active"); slideToggle(b.nextElementSibling); }));

    // The orange underline slides to the hovered menu with a 300ms swing, and returns to the current page item when the pointer leaves the menu
    const ul = head.querySelector(".co-gnav > ul"), line = head.querySelector(".co-gnav__line");
    const lis = [...ul.children], current = lis.find((li) => li.classList.contains("is-current"));
    const spot = (li) => ({ width: li.offsetWidth - 50, left: li.offsetLeft + 25 });
    const slide = (li) => (reduce ? gsap.set(line, spot(li)) : gsap.to(line, { ...spot(li), duration: 0.3, ease: "sine.inOut", overwrite: true }));
    if (current) { gsap.set(line, spot(current)); line.classList.add("is-active"); }
    ul.addEventListener("mouseleave", () => { if (isSp()) return; if (current) slide(current); else line.classList.remove("is-active"); });
    lis.forEach((li) => li.addEventListener("mouseenter", () => {
      if (isSp()) return;
      if (line.classList.contains("is-active")) slide(li);
      else { gsap.set(line, spot(li)); line.classList.add("is-active"); }
    }));
    addEventListener("resize", () => { if (current && !isSp()) gsap.set(line, spot(current)); });

    const foot = document.querySelector('[data-slot="footer"]');
    if (foot) {
      foot.classList.add("co-foot");
      const sub = (arr) => arr.map((t) => `<li><a href="about.html">${t}</a></li>`).join("");
      foot.innerHTML = `
        <p class="co-totop"><a class="co-totop__in" href="#top" aria-label="Back to top"><span class="co-totop__arw"></span></a></p>
        <div class="co-foot__up"><div class="co-c">
          <div class="co-foot__col"><ul class="co-foot__main"><li><a href="about.html"><span class="co-arw is-navy"></span>Company About</a></li><li><a href="about.html"><span class="co-arw is-navy"></span>Contact Us</a></li></ul></div>
          <div class="co-foot__col co-foot__col--2">
            <div class="co-foot__col"><ul class="co-foot__sub">${sub(["Privacy policy", "Information Security Policy", "Customer service policy", "Anti-social forces response", "Business Plan", "Action guidelines"])}</ul></div>
            <div class="co-foot__col"><ul class="co-foot__sub">${sub(["Fair Trade Policy", "Manage Customer Info", "Terms & pricing table", "Partner conduct standards", "Handling customer harassment", "Supplier procurement policy"])}</ul></div>
          </div>
          <ul class="co-foot__logos"><li class="wf-img" data-label="Certification mark 1 · round badge"></li><li class="wf-img" data-label="Certification mark 2 · round badge"></li><li class="wf-img" data-label="Certification mark 3 · round badge"></li></ul>
        </div></div>
        <div class="co-foot__low"><p><small class="u-en" data-label="Copyright English single line">© Company Name Inc. All rights reserved.</small></p></div>`;
      const btn = foot.querySelector(".co-totop");
      const vis = () => btn.classList.toggle("is-visible", scrollY > 200);
      addEventListener("scroll", vis, { passive: true }); vis();
    }
    // Same-page anchors scroll down with a 400ms swing
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href");
      const t = id === "#" || id === "#top" ? 0 : document.querySelector(id)?.getBoundingClientRect().top + scrollY || 0;
      if (reduce) return scrollTo(0, t);
      gsap.to(window, { scrollTo: t, duration: 0.4, ease: "sine.inOut" });
    });
  }
})();
