/* Kids Dental Clinic — the Frame shared by all pages 
   The original uses jQuery + velocity 1.2.2 + slick + barba 2.9.7. Motion uses GSAP instead of velocity, with the same curves (bezier values of the velocity named curves, spring uses the same formula), and
   The slider (slick) and page transitions (barba) use the same library. */
(() => {
  const SK = (window.SK = window.SK || {});
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  SK.q = q; SK.qa = qa;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  SK.reduce = reduce;
  const sp = () => innerWidth <= 768;
  SK.sp = sp;

  // Named curve for velocity 1.2 — same bezier values
  const V = {
    inQuad: "0.55,0.085,0.68,0.53", outQuad: "0.25,0.46,0.45,0.94", inOutQuad: "0.455,0.03,0.515,0.955",
    inCubic: "0.55,0.055,0.675,0.19", outCubic: "0.215,0.61,0.355,1", inOutCubic: "0.645,0.045,0.355,1",
    inQuart: "0.895,0.03,0.685,0.22", outQuart: "0.165,0.84,0.44,1", inOutQuint: "0.86,0,0.07,1",
  };
  const E = {};
  for (const [k, v] of Object.entries(V)) E[k] = CustomEase.create("sk-" + k, "M0,0 C" + v + " 1,1");
  // The spring curve of velocity as is (1 - cos(4.5πp)·e^-6p) — a wobble that overshoots at the end and returns
  E.spring = (p) => 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
  E.linear = "none";
  SK.E = E;

  /* ───── Illustration sprites — SVGs newly drawn in the same place and size as the original watercolor illustrations (birds · people · seasonal scenery) ───── */
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const blobs = (n, x0, x1, y0, y1, r0, r1, cls) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0), y = y0 + Math.pow(rnd(), 0.7) * (y1 - y0), r = r0 + rnd() * (r1 - r0);
      s += `<ellipse class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.8).toFixed(1)}"/>`;
    }
    return s;
  };
  const sunflowers = () => {
    let s = "";
    for (let i = 0; i < 70; i++) {
      const x = rnd() * 1300, y = 985 + Math.pow(rnd(), 0.8) * 120, r = 15 + rnd() * 12;
      s += `<circle class="sk-f-petal" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/><circle class="sk-f-seed" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.48).toFixed(1)}"/>`;
    }
    return s;
  };
  const grass = () => {
    let s = "";
    for (let i = 0; i < 120; i++) {
      const x = rnd() * 1300, h = 70 + rnd() * 110, b = 1108, lean = 20 + rnd() * 40;
      s += `<path class="sk-f-plume" d="M${x.toFixed(1)} ${b} Q${(x + lean * 0.4).toFixed(1)} ${b - h * 0.6} ${(x + lean).toFixed(1)} ${(b - h).toFixed(1)}" />`;
    }
    return s;
  };
  const snow = () => {
    let s = "";
    for (let i = 0; i < 60; i++) s += `<circle class="sk-snow" cx="${(rnd() * 1300).toFixed(1)}" cy="${(rnd() * 760).toFixed(1)}" r="${(2 + rnd() * 3).toFixed(1)}"/>`;
    return s;
  };
  const waves = (y0, y1, n) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const y = y0 + rnd() * (y1 - y0), x = rnd() * 1300, w = 40 + rnd() * 160;
      s += `<path class="sk-wave" d="M${x.toFixed(1)} ${y.toFixed(1)} q${(w / 2).toFixed(1)} -4 ${w.toFixed(1)} 0"/>`;
    }
    return s;
  };
  const scene = (name, parts) => `<symbol id="sk-scene-${name}" viewBox="0 0 1300 1108" preserveAspectRatio="xMidYMax slice">
    <rect width="1300" height="1108" fill="url(#sk-sky-${name})"/>
    ${parts.sky || ""}
    <g filter="url(#sk-wc)">
      <path class="sk-mt sk-mt--${name}" d="M800 690 C860 660 900 610 950 575 C985 552 1010 590 1040 600 C1070 575 1110 548 1150 560 C1200 580 1250 640 1300 668 L1300 690 Z"/>
      <rect class="sk-sea sk-sea--${name}" x="0" y="688" width="1300" height="125"/>
      ${waves(700, 800, 26)}
      <path class="sk-sand sk-sand--${name}" d="M0 790 C200 780 420 812 650 800 C880 788 1100 815 1300 798 L1300 1108 L0 1108 Z"/>
      <path class="sk-foam" d="M0 794 C200 784 420 816 650 804 C880 792 1100 819 1300 802"/>
    </g>
    ${parts.people || ""}
    <g filter="url(#sk-wc)">${parts.front || ""}</g>
  </symbol>`;
  const sprite = () => {
    seed = 7;
    return `<svg class="sk-sprite" aria-hidden="true" width="0" height="0" style="position:absolute">
  <defs>
    <filter id="sk-wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
    <linearGradient id="sk-sky-spring" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-st sk-st--sky1"/><stop offset=".62" class="sk-st sk-st--sky2"/></linearGradient>
    <linearGradient id="sk-sky-summer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-st sk-st--sum1"/><stop offset=".62" class="sk-st sk-st--sum2"/></linearGradient>
    <linearGradient id="sk-sky-autumn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-st sk-st--aut1"/><stop offset=".62" class="sk-st sk-st--aut2"/></linearGradient>
    <linearGradient id="sk-sky-winter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-st sk-st--win1"/><stop offset=".62" class="sk-st sk-st--win2"/></linearGradient>
  </defs>
  <symbol id="sk-mark" viewBox="0 0 80 92"><path class="sk-mark-line" d="M6 84V30a17 17 0 0 1 34 0a17 17 0 0 1 34 0v54c-12-6-24-6-34 2c-10-8-22-8-34-2Z"/><path class="sk-mark-line" d="M40 30v50M14 76c8-4 18-4 26 2M66 76c-8-4-18-4-26 2"/></symbol>
  <symbol id="sk-person" viewBox="0 0 40 110"><ellipse class="sk-pp sk-pp--bottom" cx="14" cy="96" rx="5" ry="14"/><ellipse class="sk-pp sk-pp--bottom" cx="25" cy="96" rx="5" ry="14"/><path class="sk-pp sk-pp--top" d="M6 34c0-8 6-12 14-12s14 4 14 12l2 50H4Z"/><circle class="sk-pp sk-pp--skin" cx="20" cy="13" r="9"/><path class="sk-pp sk-pp--hair" d="M11 12c0-7 4-11 9-11s10 3 10 10c-3-3-7-4-11-3-4 0-6 2-8 4Z"/><rect class="sk-pp sk-pp--skin" x="33" y="38" width="5" height="22" rx="2.5" transform="rotate(-25 35 40)"/></symbol>
  <symbol id="sk-child" viewBox="0 0 30 64"><ellipse class="sk-pp sk-pp--bottom" cx="11" cy="54" rx="4" ry="9"/><ellipse class="sk-pp sk-pp--bottom" cx="19" cy="54" rx="4" ry="9"/><path class="sk-pp sk-pp--top" d="M5 26c0-6 4-8 10-8s10 2 10 8l1 20H4Z"/><circle class="sk-pp sk-pp--skin" cx="15" cy="10" r="7"/><path class="sk-pp sk-pp--hair" d="M8 9c0-6 3-8 7-8s8 2 8 8c-3-2-6-3-9-2-3 0-4 1-6 2Z"/><rect class="sk-pp sk-pp--skin" x="23" y="8" width="4" height="18" rx="2" transform="rotate(35 25 24)"/></symbol>
  <symbol id="sk-easel" viewBox="0 0 50 90"><path class="sk-easel" d="M12 88 24 16M38 88 26 16M25 16v74M14 70h22"/><rect class="sk-canvas" x="4" y="22" width="42" height="34" rx="2"/><path class="sk-canvas-line" d="M14 48c4-14 10-20 16-22M30 30c2 6 0 12-4 16"/></symbol>
  <symbol id="sk-chair" viewBox="0 0 50 50"><path class="sk-chair" d="M6 16h30v20H6Z"/><path class="sk-chair-leg" d="M6 36 2 50M36 36l4 14M2 50h38"/></symbol>
  <symbol id="sk-fire" viewBox="0 0 40 40"><ellipse class="sk-fire-glow" cx="20" cy="26" rx="18" ry="12"/><path class="sk-fire" d="M20 4c6 8 10 12 10 20a10 10 0 0 1-20 0c0-6 4-8 6-14 1 4 3 6 4 7 1-5 0-9 0-13Z"/><path class="sk-chair-leg" d="M8 36l24-6M8 30l24 6"/></symbol>
  <symbol id="sk-bird" viewBox="0 0 100 64"><path class="sk-bird-wing" d="M44 30C40 14 28 4 12 2c8 8 12 18 22 30Z"/><path class="sk-bird-tail" d="M30 34 2 30c8 6 16 10 28 10Z"/><path class="sk-bird-body" d="M28 36c6-10 22-14 38-12 12 1 20 6 24 10-6 8-20 14-36 13-12 0-22-4-26-11Z"/><path class="sk-bird-belly" d="M40 44c10 4 24 4 34-1-8 7-22 9-34 1Z"/><path class="sk-bird-cheek" d="M70 34c4 2 6 4 6 7-4-1-6-3-6-7Z"/><circle class="sk-bird-eye" cx="80" cy="30" r="2"/><path class="sk-bird-beak" d="M89 33l9 1-9 2Z"/><path class="sk-bird-wing" d="M52 30C58 16 70 8 84 6c-6 8-12 16-22 26Z"/></symbol>
  <symbol id="sk-perch-body" viewBox="0 0 40 66"><path class="sk-bird-body" d="M8 24c0-12 8-20 18-20 6 0 10 4 10 10 0 6-2 8-2 12 0 14-6 26-16 28-6 0-10-6-10-30Z"/><path class="sk-bird-belly" d="M12 34c2 12 6 20 10 20 6 0 10-8 12-20-6 4-14 4-22 0Z"/><path class="sk-bird-cheek" d="M24 26c4 0 8 2 10 6-4 0-8-2-10-6Z"/><circle class="sk-bird-eye" cx="26" cy="13" r="2"/><path class="sk-bird-beak" d="M35 12l5 1-5 2Z"/><path class="sk-bird-leg" d="M16 54v10M22 54v10"/></symbol>
  <symbol id="sk-perch-tail" viewBox="0 0 46 66"><path class="sk-bird-wing" d="M0 24c10-4 20 4 24 14 6 10 14 18 22 24-12 0-22-6-30-14C10 42 4 34 0 24Z"/></symbol>
  <symbol id="sk-branch" viewBox="0 0 112 40"><path class="sk-branch" d="M110 38C80 30 50 24 2 20M70 30c-6-8-14-12-24-12M40 22c4-6 10-10 18-10"/><ellipse class="sk-leaf" cx="48" cy="16" rx="7" ry="3" transform="rotate(-20 48 16)"/><ellipse class="sk-leaf" cx="60" cy="11" rx="6" ry="2.6" transform="rotate(-35 60 11)"/></symbol>
  <symbol id="sk-bird-pair" viewBox="0 0 148 104"><use href="#sk-branch" x="0" y="64" width="148" height="40"/><use href="#sk-perch-body" x="34" y="6" width="44" height="72"/><use href="#sk-perch-tail" x="4" y="22" width="40" height="56" transform="scale(-1 1) translate(-80 0)"/><g class="sk-bird--olive"><use href="#sk-perch-body" x="88" y="34" width="30" height="48"/></g></symbol>
  <symbol id="sk-pin" viewBox="0 0 24 32"><path class="sk-pin" d="M12 1C6 1 2 5.5 2 11c0 8 10 19 10 19s10-11 10-19C22 5.5 18 1 12 1Zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/></symbol>
  <symbol id="sk-ico-insta" viewBox="0 0 24 24"><rect class="sk-ico-line" x="4" y="4" width="16" height="16" rx="5"/><circle class="sk-ico-line" cx="12" cy="12" r="3.6"/><circle class="sk-ico-dot" cx="16.6" cy="7.4" r="1"/></symbol>
  <symbol id="sk-ico-chat" viewBox="0 0 24 24"><path class="sk-ico-line" d="M12 4c5 0 8.5 3 8.5 6.6 0 3.7-3.8 6.6-8.5 6.6-.8 0-1.6-.1-2.3-.3L6 19l.6-3.3C4.7 14.4 3.5 12.6 3.5 10.6 3.5 7 7 4 12 4Z"/></symbol>
  <symbol id="sk-num-1" viewBox="0 0 30 80"><path class="sk-num" d="M8 14c6-4 10-8 12-12-2 26-2 50 0 74M4 76c6-2 14-2 22 0"/></symbol>
  <symbol id="sk-num-2" viewBox="0 0 50 80"><path class="sk-num" d="M8 22C10 8 30 2 38 12c8 12-4 26-14 38L4 76c14-4 28-4 42-2"/></symbol>
  <symbol id="sk-num-3" viewBox="0 0 40 80"><path class="sk-num" d="M6 10c10-8 28-6 28 6 0 10-10 16-20 18 14 0 22 8 22 20 0 16-18 22-32 16"/></symbol>
  <symbol id="sk-season-spring" viewBox="0 0 125 127"><g filter="url(#sk-wc)"><use href="#sk-easel" x="38" y="22" width="42" height="80"/><use href="#sk-person" x="72" y="2" width="38" height="104" style="--p-top: var(--kf-surface); --p-bottom: var(--site-leaf-deep); --p-hair: var(--site-hair); --p-skin: var(--site-skin)"/><use href="#sk-child" x="10" y="62" width="26" height="56" style="--p-top: var(--site-flower); --p-bottom: var(--site-teal); --p-hair: var(--site-wood); --p-skin: var(--site-skin)"/></g></symbol>
  <symbol id="sk-season-summer" viewBox="0 0 127 114"><g filter="url(#sk-wc)"><use href="#sk-child" x="8" y="48" width="30" height="62" style="--p-top: var(--site-stripe); --p-bottom: var(--site-leaf); --p-hair: var(--site-flower); --p-skin: var(--site-skin)"/><use href="#sk-person" x="58" y="2" width="40" height="108" style="--p-top: var(--kf-surface); --p-bottom: var(--site-leaf-deep); --p-hair: var(--site-flower); --p-skin: var(--site-skin)"/></g></symbol>
  <symbol id="sk-season-autumn" viewBox="0 0 161 81"><g filter="url(#sk-wc)"><use href="#sk-chair" x="4" y="30" width="46" height="46"/><use href="#sk-person" x="14" y="2" width="26" height="62" style="--p-top: var(--site-jacket); --p-bottom: var(--site-hair); --p-hair: var(--site-hair); --p-skin: var(--site-skin)"/><use href="#sk-fire" x="62" y="34" width="36" height="36"/><use href="#sk-chair" x="110" y="30" width="46" height="46" transform="scale(-1 1) translate(-266 0)"/><use href="#sk-person" x="120" y="2" width="26" height="62" style="--p-top: var(--kf-surface); --p-bottom: var(--site-leaf-deep); --p-hair: var(--site-hair); --p-skin: var(--site-skin)"/></g></symbol>
  <symbol id="sk-season-winter" viewBox="0 0 111 131"><g filter="url(#sk-wc)"><use href="#sk-person" x="10" y="8" width="42" height="116" style="--p-top: var(--site-jacket); --p-bottom: var(--kf-line); --p-hair: var(--site-hair); --p-skin: var(--site-skin)"/><use href="#sk-person" x="60" y="4" width="42" height="120" style="--p-top: var(--kf-surface); --p-bottom: var(--site-leaf-deep); --p-hair: var(--site-hair); --p-skin: var(--site-skin)"/></g></symbol>
  ${scene("spring", { people: `<use href="#sk-season-spring" x="110" y="840" width="230" height="234"/>`, front: blobs(260, -20, 1320, 975, 1115, 10, 22, "sk-f-leaf") + blobs(520, -20, 1320, 960, 1110, 7, 16, "sk-f-rape") })}
  ${scene("summer", { sky: `<g filter="url(#sk-wc)" class="sk-cloud">${blobs(46, 860, 1260, 440, 690, 30, 70, "sk-cloud-b")}</g>`, people: `<use href="#sk-season-summer" x="150" y="840" width="190" height="170"/><path class="sk-rod" d="M380 930 460 790M470 930 560 800"/>`, front: blobs(160, -20, 1320, 1000, 1115, 14, 26, "sk-f-leaf") + sunflowers() })}
  ${scene("autumn", { people: `<use href="#sk-season-autumn" x="360" y="830" width="300" height="152"/>`, front: grass() })}
  ${scene("winter", { sky: snow(), people: `<use href="#sk-season-winter" x="380" y="760" width="170" height="200"/>`, front: blobs(240, -20, 1320, 985, 1115, 12, 22, "sk-f-leaf--deep") + blobs(140, -20, 1320, 990, 1110, 7, 12, "sk-f-camellia") })}
</svg>`;
  };

  /* ───── Frame shared across multiple pages: header bar · fixed menu · phone menu · loader · footer ───── */
  const NAV = [
    { href: "news.html", text: "Notice", key: "news" },
    { href: "index.html#lead", text: "For first-time visitors", key: "beginner" },
    { href: "index.html#doctor", text: "Doctors and staff", key: "doctor" },
    { href: "service.html", text: "Treatment Guide", key: "service", sub: [["service.html", "Treatment Guide"], ["service.html#promise", "Dental treatment · maintenance"], ["service.html#flow", "Children’s orthodontics"]] },
    { href: "service.html#faq", text: "Frequently asked questions", key: "question" },
    { href: "index.html#access", text: "Directions", key: "access" },
  ];
  const gnav = () => `<nav class="sk-gnav"><ul>${NAV.map((n) => `<li class="sk-gnav__item${n.sub ? " sk-dnav-btn" : ""}"><a href="${n.href}"><b>${n.text}</b></a>${n.sub ? `<div class="sk-dnav"><ul>${n.sub.map(([h, t]) => `<li><a href="${h}"><span class="sk-line">${t}</span></a></li>`).join("")}</ul></div>` : ""}</li>`).join("")}</ul></nav>`;
  SK.gnav = gnav;
  const logo = (cls = "") => `<span class="sk-logo ${cls}"><svg class="sk-logo__mark" aria-hidden="true"><use href="#sk-mark"/></svg><span class="sk-logo__en" data-label="Hospital English name (rounded Latin, three lines)">clinic name<br>pediatric<br>dental clinic</span><span class="sk-logo__ko" data-label="Hospital name (vertical)">Children’s dentist name</span></span>`;
  const logoWide = () => `<span class="sk-logo-wide"><svg class="sk-logo-wide__mark" aria-hidden="true"><use href="#sk-mark"/></svg><span class="sk-logo-wide__ko">Children’s dental clinic name</span><span class="sk-logo-wide__en" data-label="Hospital English name">clinic name<br>pediatric dental clinic</span></span>`;
  const logoS = () => `<span class="sk-logo-s"><svg class="sk-logo-s__mark" aria-hidden="true"><use href="#sk-mark"/></svg><span class="sk-logo-s__ko">Kids<br>Dental clinic<br>Name</span><span class="sk-logo-s__en" data-label="Hospital English name">clinic name pediatric dental clinic</span></span>`;
  SK.logo = logo; SK.logoWide = logoWide;
  // Fill the logo, menu and icon slots in the page — call again for new pages that arrive via transition
  const fill = (root) => {
    qa("[data-sk-logo]", root).forEach((el) => { el.outerHTML = `<span class="sk-wide">${logo()}</span><span class="sk-narrow">${logoS()}</span>`; });
    qa("[data-sk-gnav]", root).forEach((el) => { el.innerHTML = gnav(); });
    qa("[data-sk-sns]", root).forEach((el) => { el.innerHTML = sns(); });
  };
  const sns = (cls = "") => `<ul class="sk-sns ${cls}"><li><a href="#instagram" aria-label="Social Media"><svg><use href="#sk-ico-insta"/></svg></a></li><li><a href="#chat" aria-label="Messenger"><svg><use href="#sk-ico-chat"/></svg></a></li><li class="sk-sns__map"><a href="index.html#access" aria-label="Directions"><svg><use href="#sk-pin"/></svg></a></li></ul>`;
  SK.sns = sns;
  const CHROME = {
    header: () => `<div class="sk-header__logo"><a href="index.html" aria-label="Back to start">${logoWide()}</a></div>${gnav()}${sns("sk-header__sns")}`,
    fix: () => gnav(),
    navsp: () => `<div class="sk-navsp__inner"><div class="sk-navsp__logo"><a href="index.html">${logo("is-small")}</a></div>${gnav()}<div class="sk-navsp__btm">${sns()}<div class="sk-navsp__tel"><em>(We see patients by appointment)</em><i>TEL</i><strong><a class="sk-line" href="tel:0000000000">000-000-0000</a></strong></div></div></div>`,
    btnnav: () => `<div><span></span><span></span><span></span></div>`,
    close: () => `<div class="sk-close__tree"><svg viewBox="0 0 112 40"><use href="#sk-branch"/></svg></div><div class="sk-close__set"><span class="sk-close__x" aria-hidden="true"></span><svg class="sk-close__bird" viewBox="0 0 40 66"><use href="#sk-perch-body"/></svg></div>`,
    first: () => `<div class="sk-first__logo" data-fx-part="logo">${logoS()}</div><div class="sk-first__mask" data-fx-part="mask"><svg data-fx-part="edge" viewBox="0 0 500 596" preserveAspectRatio="none" aria-hidden="true"><path d="M500 0C430 70 360 150 345 250C335 320 300 360 220 410C140 460 60 530 0 596H500Z"/></svg><div class="sk-first__bird" data-fx-part="rider"><svg viewBox="0 0 100 64"><use href="#sk-bird"/></svg></div></div><div class="sk-first__copy" data-fx-part="copy"><p class="sk-vcopy" data-label="Hero vertical pledge text (two lines)"><span>Better</span><span>A future starting point.</span></p></div>`,
    footer: () => `<div class="sk-foot__img" data-label="Seasonal watercolor landscape · sea and island, mountain, sandy beach, flower field in front · spring rapeseed, summer sunflowers, autumn silvergrass, winter camellia · 2600×2216 wide">${["spring", "summer", "autumn", "winter"].map((s) => `<svg class="sk-foot__scene sk-foot__scene--${s}" aria-hidden="true"><use href="#sk-scene-${s}"/></svg>`).join("")}${["spring", "summer", "autumn"].map((s) => `<div class="sk-foot__bird sk-foot__bird--${s}"><svg viewBox="0 0 100 64"><use href="#sk-bird"/></svg></div>`).join("")}</div>
      <div class="sk-foot__inner"><div class="sk-foot__logo"><a href="index.html">${logoWide()}</a></div><div class="sk-foot__txt"><h2><span>Pediatric Dentistry Specialist</span><br><span>Regular maintenance dental care</span></h2><div class="sk-foot__tel"><span>(We see patients by appointment)</span><strong><a href="tel:0000000000">000-000-0000</a></strong></div><address class="sk-line"><span>000-0000</span>Add a one-line hospital address 000-0</address></div></div>${sns("sk-foot__sns")}`,
  };

  const SEASONS = ["spring", "summer", "autumn", "winter"];
  // On every page change (first open included) the original advances the season half of #wrap one step: spring → summer → autumn → winter — footer scenery, birds and text color change together
  const nextSeason = () => {
    const wrap = q(".sk-wrap");
    const cur = SEASONS.find((s) => wrap.classList.contains("is-" + s));
    wrap.classList.remove(...SEASONS.map((s) => "is-" + s));
    wrap.classList.add("is-" + (cur ? SEASONS[(SEASONS.indexOf(cur) + 1) % 4] : "spring"));
  };

  const build = () => {
    document.body.insertAdjacentHTML("afterbegin", sprite());
    for (const el of qa("[data-sk-chrome]")) el.innerHTML = CHROME[el.dataset.skChrome]();
    nextSeason();
  };

  /* ───── First-open loader — a white curtain slides out to the bottom right along an S-curve edge together with a bird, revealing the logo on a pale sky panel — part curve-sweep-loader ───── */
  const first = () => {
    const el = q(".sk-first");
    document.addEventListener("sk:first-done", () => { SK.firstDone = true; scrollTo(0, 0); }, { once: true });
    if (!el) { SK.firstDone = true; return; }
    el.setAttribute("data-fx-curve-sweep-loader", "event: sk:first-done");
    el.setAttribute("data-fx", "curve-sweep-loader");
  };

  /* ───── Fixed menu — drops down from the top after passing the hero (full screen height on home, 160px on other pages) — part appear-past-scroll (look: drop-solid) ───── */
  const fixNav = () => {
    const fix = q(".sk-gnavfix");
    if (!fix) return;
    const at = document.body.dataset.page === "index" ? "100vh" : "160";
    fix.setAttribute("data-fx-appear-past-scroll", `at: ${at}; look: drop-solid`);
    if (fix.getAttribute("data-fx") !== "appear-past-scroll") fix.setAttribute("data-fx", "appear-past-scroll");
    else { fix.removeAttribute("data-fx"); requestAnimationFrame(() => fix.setAttribute("data-fx", "appear-past-scroll")); }
  };

  /* ───── Phone menu — over a pale sky film a white panel slides in from the left, and the bird on the close button flies in and perches on a branch ───── */
  const navSp = () => {
    const btn = q(".sk-btnnav"), menu = q(".sk-navsp"), inner = q(".sk-navsp__inner"), close = q(".sk-close");
    if (!btn || !menu) return;
    const set = q(".sk-close__set", close), tree = q(".sk-close__tree", close);
    let keep = 0;
    const open = () => {
      gsap.killTweensOf([menu, inner, close, set, tree, btn]);
      btn.classList.add("is-active");
      gsap.to(btn, { opacity: 0, duration: 0.1, ease: "none" });
      menu.style.display = "block";
      gsap.to(menu, { opacity: 1, duration: 0.15, ease: "none" });
      gsap.fromTo(inner, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, delay: 0.15, ease: E.outQuart });
      keep = scrollY;
      document.body.classList.add("is-noscroll");
      document.body.style.top = -keep + "px";
      gsap.set(close, { display: "block", x: 0 });
      gsap.to(close, { opacity: 1, duration: 0.15, ease: "none" });
      gsap.timeline()
        .set(set, { x: 120, y: -60, rotation: -15 })
        .to(set, { opacity: 1, x: 0, y: 0, rotation: 15, duration: 0.15, ease: E.inQuart })
        .to(set, { y: 4, rotation: -10, duration: 0.15, ease: E.outQuart })
        .to(set, { y: 0, rotation: 0, duration: 0.6, ease: E.spring });
      gsap.timeline({ delay: 0.15 })
        .to(tree, { rotation: -6, y: 2, duration: 0.15, ease: E.outQuart })
        .to(tree, { rotation: 0, y: 0, duration: 0.6, ease: E.spring });
    };
    const shut = () => {
      btn.classList.remove("is-active");
      gsap.killTweensOf([menu, inner, close, set, tree]);
      gsap.to(btn, { opacity: 1, duration: 0.1, ease: "none" });
      gsap.to(close, { opacity: 0, x: 20, duration: 0.05, ease: "none", onComplete: () => gsap.set(close, { display: "none" }) });
      gsap.to(inner, { opacity: 0, x: -20, duration: 0.1, ease: E.outCubic, onComplete: () => { inner.scrollTop = 0; } });
      gsap.to(menu, { opacity: 0, duration: 0.3, delay: 0.15, ease: "none", onComplete: () => { menu.style.display = "none"; } });
      document.body.classList.remove("is-noscroll");
      document.body.style.top = "";
      scrollTo(0, keep);
    };
    SK.navClose = () => btn.classList.contains("is-active") && shut();
    btn.addEventListener("click", () => (btn.classList.contains("is-active") ? shut() : open()));
    close.addEventListener("click", shut);
    menu.addEventListener("click", (e) => { if (!e.target.closest(".sk-navsp__inner")) shut(); });
  };

  /* ───── Page attach — page scripts register as SK.pages[namespace] and return a detach function ───── */
  SK.pages = SK.pages || {};
  // Large clinic info photo — slick fade 1.2s · every 4s, starts rotating 1.2s after the slide
  SK.pages.service = (root) => {
    const $s = window.jQuery(q(".sk-pmain__slide", root));
    $s.slick({ fade: true, speed: 1200, autoplay: false, autoplaySpeed: 4000, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, draggable: false, accessibility: false, swipe: false, touchMove: false });
    const t = reduce ? 0 : setTimeout(() => $s.slick("slickPlay"), 1200);
    return { destroy() { clearTimeout(t); try { $s.slick("unslick"); } catch (e) {} } };
  };
  // Anchor within the same page — velocity scroll .7s easeInOutCubic
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const to = id.length > 1 ? q(id) : document.documentElement;
    if (!to) return;
    e.preventDefault();
    gsap.to(window, { scrollTo: to === document.documentElement ? 0 : to, duration: reduce ? 0 : 0.7, ease: E.inOutCubic });
  });
  let api = null;
  const mount = (root) => {
    const ns = root.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    fill(root);
    qa(".sk-gnav__item", document).forEach((li) => li.classList.toggle("is-current", (li.querySelector("a").getAttribute("href") || "").split("#")[0] === ns + ".html"));
    try { api = SK.pages[ns]?.(root) || null; } catch (e) { console.error(e); api = null; }
    fixNav();
  };
  const unmount = () => { try { api?.destroy?.(); } catch (e) {} api = null; };
  SK.mountAgain = () => { unmount(); mount(q('[data-barba="container"]')); };

  // Bring the next page’s css and js into the current document (the original shared one css, so this wasn’t needed)
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(want.filter((h) => !have.includes(h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
  };

  const fadeIn = () => {
    // Original pageReady: spinner fades out in .15s, body and footer fade in over .3s (delay .15s)
    gsap.to(".sk-loading", { opacity: 0, duration: 0.15, ease: "none", onComplete: () => gsap.set(".sk-loading", { display: "none" }) });
    gsap.fromTo([q('[data-barba="container"]'), q(".sk-foot")], { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.15, ease: "none" });
    if (sp()) gsap.to(".sk-btnnav", { opacity: 1, duration: 0.3, delay: 0.15, ease: "none" });
  };

  const start = () => {
    build();
    navSp();
    const container = q('[data-barba="container"]');
    gsap.set(".sk-header", { opacity: 0 });
    gsap.to(".sk-header", { opacity: 1, duration: 0.2, delay: 0.15, ease: "none" });
    mount(container);
    fadeIn();
    first();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    barba.init({
      timeout: 10000,
      prevent: ({ el, href }) => {
        if (!el || el.tagName !== "A") return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || raw.startsWith("tel:") || el.target === "_blank") return true;
        try { if (new URL(href, location.href).origin !== location.origin) return true; } catch (e) { return true; }
        return false;
      },
      transitions: [{
        name: "default-transition",
        leave() { SK.navClose?.(); },
        // Like the original, at afterLeave (after barba has received the next page) — body and Footer fade out in .2s easeOutQuad, the spinning indicator in .15s (delay .2s), the fixed menu disappears in .1s, then wait .6s
        async afterLeave() {
          gsap.to([q('[data-barba="container"]'), q(".sk-foot")], { opacity: 0, duration: 0.2, ease: E.outQuad, onComplete: () => scrollTo(0, 0) });
          gsap.set(".sk-loading", { display: "block", opacity: 0 });
          // Original velocity raises opacity to 100 in 150ms — reaching 1 takes just 1.5ms, so it snaps on at .2s
          gsap.to(".sk-loading", { opacity: 1, duration: 0.0015, delay: 0.2, ease: "none" });
          const fix = q(".sk-gnavfix.is-shown");
          if (fix) gsap.to(fix, { opacity: 0, duration: 0.1, ease: "none" });
          if (sp()) gsap.to(".sk-btnnav", { opacity: 0, duration: 0.1, ease: "none" });
          await new Promise((r) => setTimeout(r, 600));
          unmount();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        },
        async beforeEnter({ next }) { gsap.set(next.container, { opacity: 0 }); await bring(next.html); },
        enter({ next }) { gsap.set(next.container, { opacity: 0 }); },
        after({ next }) {
          nextSeason();
          gsap.set(".sk-gnavfix", { clearProps: "opacity" });
          scrollTo(0, 0);
          mount(next.container);
          fadeIn();
          ScrollTrigger.refresh();
          if (location.hash) {
            const a = q(location.hash);
            if (a) gsap.to(window, { scrollTo: a, duration: 0.8, delay: 0.8, ease: E.inOutQuint });
          }
        },
      }],
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
