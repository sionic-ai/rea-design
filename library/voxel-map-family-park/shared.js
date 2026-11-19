// Shared by the whole site — isometric voxel art, left sidebar·drawer menu, hamburger sitemap, member·recruit strips, footer, shared slider
(() => {
  /* ───────── Isometric voxel art ─────────
     Redraw the original 3D-rendered character and diorama spots as boxes and balls from the same viewpoint (isometric 30°).
     Surface color is in the css .vx-<Color> Built from this skin variable — change the skin and the picture changes with it */
  const CO = 0.8660254, SI = 0.5;
  const proj = (x, y, z, u) => [(x - y) * CO * u, (x + y) * SI * u - z * u];
  const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const box = (x, y, z, w, d, h, c) => ({ t: "box", x, y, z, w, d, h, c });
  const ball = (x, y, z, r, c) => ({ t: "ball", x, y, z, r, c });
  const flat = (poly, c, z = 0) => ({ t: "flat", poly, c, z });

  // One child — legs, body, arms, head, hair (hat). pose: hop (body lift) · arm (raise 0~1) · face (+1 means the face turns front-left)
  function kid(x, y, z, o = {}) {
    const s = o.s ?? 1, hop = o.hop ?? 0, arm = o.arm ?? 0;
    const zz = z + hop;
    const shirt = o.shirt || "orange", pants = o.pants || "navy", hair = o.hair || "yellow";
    const k = (dx, dy, dz, w, d, h, c) => box(x + dx * s, y + dy * s, zz + dz * s, w * s, d * s, h * s, c);
    const out = [
      k(.12, .18, 0, .3, .3, .45, pants),
      k(.52, .18, 0, .3, .3, .45, pants),
      k(0, .05, .42, .94, .62, .62, shirt),
      k(-.22, .2, .58 + arm * .5, .22, .3, .36, "skin"),
      k(.94, .2, .58 + arm * .5, .22, .3, .36, "skin"),
      k(-.06, -.06, 1.04, 1.06, .8, .82, "skin"),
      k(.18, .74, 1.36, .14, .04, .22, "navy"),
      k(.66, .74, 1.36, .14, .04, .22, "navy"),
      k(.42, .74, 1.24, .14, .06, .08, "yellow"),
    ];
    if (o.cap) out.push(k(-.1, -.12, 1.84, 1.14, .9, .3, o.cap), k(.1, .55, 1.86, .8, .45, .1, o.cap));
    else out.push(k(-.1, -.12, 1.8, 1.14, .9, .26, hair), k(-.1, -.12, 1.2, .22, .9, .6, hair));
    return out;
  }
  const tree = (x, y, z = 0, r = .9, c = "teal") => [box(x - .12, y - .12, z, .24, .24, r * 1.2, "deep"), ball(x, y, z + r * 1.5, r, c)];
  const pine = (x, y, z = 0, h = 1.6) => [{ t: "cone", x, y, z, h, r: h * .38, c: "teal" }];
  function house(x, y, z, w, d, h, o = {}) {
    const out = [box(x, y, z, w, d, h, o.c || "orange")];
    const n = Math.max(2, Math.floor(d / .7));
    for (let i = 0; i < n; i++) out.push(box(x + w, y + .3 + i * (d - .5) / n, z + h * .35, .04, (d - .6) / n * .6, h * .3, "white"));
    out.push(box(x - .1, y - .1, z + h, w + .2, d + .2, .18, o.roof || "deep"));
    if (o.sign) out.push(box(x + w + .02, y + d * .25, z + h * .7, .04, d * .5, h * .18, "white"));
    return out;
  }
  const tent = (x, y, z, r, c = "wood") => [{ t: "dome", x, y, z, r, c }];

  function render(items, u = 20) {
    // A wide floor plate sorted by its center value would cover what stands above it — draw it first, along with the floor stains
    const floor = (it) => it.t === "box" && it.w * it.d > 40;
    const key = (it) => it.t === "flat" || floor(it) ? -1e6 + it.z : (it.x + (it.w || 0) / 2) + (it.y + (it.d || 0) / 2) + (it.z + (it.h || 0) / 2) * .02;
    const sorted = [...items].sort((a, b) => key(a) - key(b));
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    const grow = (p) => { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); };
    const parts = sorted.map((it) => {
      if (it.t === "box") {
        const { x, y, z, w, d, h } = it, P = (a, b, c) => proj(a, b, c, u);
        const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
        const rgt = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
        const lft = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
        [...top, ...rgt, ...lft].forEach(grow);
        return `<g class="vx-${it.c}"><polygon class="l" points="${pts(lft)}"/><polygon class="r" points="${pts(rgt)}"/><polygon class="t" points="${pts(top)}"/></g>`;
      }
      if (it.t === "ball") {
        const [cx, cy] = proj(it.x, it.y, it.z, u), r = it.r * u;
        grow([cx - r, cy - r]); grow([cx + r, cy + r]);
        return `<g class="vx-${it.c}"><circle class="r" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/><circle class="l" cx="${(cx - r * .12).toFixed(1)}" cy="${(cy - r * .1).toFixed(1)}" r="${(r * .86).toFixed(1)}"/><circle class="t" cx="${(cx - r * .3).toFixed(1)}" cy="${(cy - r * .32).toFixed(1)}" r="${(r * .42).toFixed(1)}"/></g>`;
      }
      if (it.t === "cone") {
        const [bx, by] = proj(it.x, it.y, it.z, u), [tx, ty] = proj(it.x, it.y, it.z + it.h, u), r = it.r * u;
        grow([bx - r, ty]); grow([bx + r, by + r * .5]);
        return `<g class="vx-${it.c}"><path class="l" d="M${(bx - r).toFixed(1)} ${by.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${bx.toFixed(1)} ${(by + r * .5).toFixed(1)}Z"/><path class="r" d="M${bx.toFixed(1)} ${(by + r * .5).toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${(bx + r).toFixed(1)} ${by.toFixed(1)}Z"/></g>`;
      }
      if (it.t === "dome") {
        const [cx, cy] = proj(it.x, it.y, it.z, u), r = it.r * u;
        grow([cx - r, cy - r]); grow([cx + r, cy + r * .5]);
        return `<g class="vx-${it.c}"><path class="r" d="M${(cx - r).toFixed(1)} ${cy.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(cx + r).toFixed(1)} ${cy.toFixed(1)}Q${cx.toFixed(1)} ${(cy + r * .55).toFixed(1)} ${(cx - r).toFixed(1)} ${cy.toFixed(1)}Z"/><path class="t" d="M${(cx - r * .7).toFixed(1)} ${(cy - r * .2).toFixed(1)}A${(r * .8).toFixed(1)} ${(r * .8).toFixed(1)} 0 0 1 ${cx.toFixed(1)} ${(cy - r).toFixed(1)}L${cx.toFixed(1)} ${(cy + r * .3).toFixed(1)}Z"/><path class="ln" d="M${cx.toFixed(1)} ${(cy - r).toFixed(1)}L${cx.toFixed(1)} ${(cy + r * .28).toFixed(1)}M${(cx - r * .9).toFixed(1)} ${(cy - r * .2).toFixed(1)}Q${cx.toFixed(1)} ${(cy - r * .1).toFixed(1)} ${(cx + r * .9).toFixed(1)} ${(cy - r * .2).toFixed(1)}"/></g>`;
      }
      const poly = it.poly.map(([a, b]) => proj(a, b, it.z, u));
      poly.forEach(grow);
      return `<g class="vx-${it.c}"><path class="t" d="${smooth(poly)}"/></g>`;
    });
    return { svg: parts.join(""), box: [minx, miny, maxx - minx, maxy - miny] };
  }
  // Ground blotches (snow hill · pond) use a rounded curve joined through points — they become round isometric flattened discs
  function smooth(p) {
    const n = p.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(p[n - 1], p[0]).map((v) => v.toFixed(1)).join(" ")}`;
    for (let i = 0; i < n; i++) { const m = mid(p[i], p[(i + 1) % n]); d += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }
    return d + "Z";
  }
  const blobPoly = (cx, cy, rx, ry, k = [1, .86, 1.08, .92, 1.04, .9, 1.1, .95]) => k.map((f, i) => { const a = (i / k.length) * Math.PI * 2; return [cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]; });

  // One drawing as an svg — fit: meet (fully visible inside the cell), slice (covers the cell). pad is the margin around the drawing (px in u units)
  function svgOf(items, o = {}) {
    const u = o.u || 20, pad = o.pad ?? 6;
    const { svg, box: b } = render(items, u);
    const vb = o.viewBox || [b[0] - pad, b[1] - pad, b[2] + pad * 2, b[3] + pad * 2];
    return `<svg class="vx" viewBox="${vb.map((v) => v.toFixed(1)).join(" ")}" preserveAspectRatio="${o.par || "xMidYMid meet"}" aria-hidden="true" focusable="false">${svg}</svg>`;
  }
  // Sprite strip — pictures drawn on same-size sheets per cell, joined sideways. aspect is the cell’s width/height
  function stripOf(frames, aspect, o = {}) {
    const u = o.u || 20;
    const rs = frames.map((f) => render(f, u));
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    rs.forEach(({ box: b }) => { minx = Math.min(minx, b[0]); miny = Math.min(miny, b[1]); maxx = Math.max(maxx, b[0] + b[2]); maxy = Math.max(maxy, b[1] + b[3]); });
    let cw = maxx - minx + 8, ch = maxy - miny + 8;
    let bw = cw, bh = ch;
    if (cw / ch < aspect) bw = ch * aspect; else bh = cw / aspect;
    const ox = minx - 4 - (bw - cw) / 2, oy = miny - 4 - (bh - ch);
    const g = rs.map((r, i) => `<g transform="translate(${(i * bw - ox).toFixed(1)} ${(-oy).toFixed(1)})">${r.svg}</g>`).join("");
    return `<svg class="vx" viewBox="0 0 ${(bw * frames.length).toFixed(1)} ${bh.toFixed(1)}" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" focusable="false">${g}</svg>`;
  }

  window.LLVox = { box, ball, flat, kid, tree, pine, house, tent, render, svgOf, stripOf, blobPoly };

  /* ───────── Shared graphics ───────── */
  const leaf = `<svg class="ll-mark" viewBox="0 0 100 110" aria-hidden="true"><path d="M50 4 58 22 72 16 68 36 86 32 76 50 94 58 70 66 74 78 54 72 53 106 47 106 46 72 26 78 30 66 6 58 24 50 14 32 32 36 28 16 42 22Z"/></svg>`;
  const markOf = (cls = "") => `<span class="ll-logo ${cls}" data-label="Logo · leaf mark + two-line English name">${leaf}<span class="ll-logo__word" data-label="Brand English name · Two lines">PARK <br>NAME</span></span>`;
  window.LLMark = markOf;
  const V = LLVox;
  const bear = (s = 1) => V.svgOf([V.box(0, 0, 0, 1, .8, .9, "orange"), V.box(-.05, -.05, .9, 1.1, .9, .9, "orange"), V.box(.05, -.05, 1.8, .25, .2, .25, "orange"), V.box(.75, -.05, 1.8, .25, .2, .25, "orange"), V.box(.3, .82, 1.1, .45, .1, .35, "skin"), V.box(.18, .82, 1.5, .1, .05, .15, "navy"), V.box(.7, .82, 1.5, .1, .05, .15, "navy")], { u: 14 * s, pad: 2 });
  const calendar = V.svgOf([V.box(0, 0, 0, 1.4, .3, 1.2, "white"), V.box(0, 0, 1.2, 1.4, .3, .3, "orange"), V.box(.2, .3, .3, .25, .02, .2, "orange"), V.box(.6, .3, .3, .25, .02, .2, "orange"), V.box(1, .3, .3, .25, .02, .2, "orange"), V.box(.2, .3, .7, .25, .02, .2, "orange"), V.box(.6, .3, .7, .25, .02, .2, "orange")], { u: 22, pad: 2 });
  const mail = V.svgOf([V.box(0, 0, 0, 1.5, .2, 1, "white"), { t: "flat", c: "orange", z: 1.0, poly: [[0, .2], [1.5, .2], [.75, .2]] }, V.box(.05, .2, .45, 1.4, .02, .55, "orange")], { u: 22, pad: 2 });

  /* ───────── Sidebar · drawer menu ───────── */
  const NAV = [
    { main: "DINE", sub: "Eating", items: [["Menu First", ["One submenu", "Sub Menu Two"]], ["Menu Two", ["Sub Menu Three", "Sub Menu Four"]], ["Menu Three", []]] },
    { main: "PLAY", sub: "Playing", items: [["Playground", []], ["Experience Workshop", []], ["Shop and café", []], ["Dog yard", []], ["Campfire lounge", []], ["Large Bathhouse", []]] },
    { main: "REST", sub: "Staying", items: [["One Lodging", []], ["Lodging two", []]] },
    { main: "GEAR", sub: "Borrowing", items: [["Items to borrow", []], ["Training room", []]] },
  ];
  const page = document.body.dataset.page || "home";
  const sidebar = document.querySelector('[data-slot="sidebar"]');
  if (sidebar) {
    sidebar.className = "ll-header";
    sidebar.innerHTML = `
      <div class="ll-header__inner">
        <h1 class="ll-header__logo"><a href="index.html" aria-label="First Page">${markOf()}</a></h1>
        <nav class="ll-gnav" aria-label="Site Menu">
          <ul class="ll-gnav__list">
            ${NAV.map((n, i) => `
            <li class="ll-gnav__item" data-gnav>
              <button type="button" class="ll-gnav__btn" aria-expanded="false" aria-controls="ll-drawer-${i}"><span class="ll-gnav__main" data-label="Menu English name">${n.main}</span><span class="ll-gnav__sub">${n.sub}</span></button>
              <div class="ll-gnav__drawer" id="ll-drawer-${i}" aria-hidden="true"><div class="ll-drawer"><ul class="ll-drawer__list">
                ${n.items.map(([t, kids]) => `<li><a class="ll-drawer__link" href="${i === 1 && t === "Experience Workshop" ? "service.html" : "about.html"}">${t}</a>${kids.length ? `<ul class="ll-drawer__kids">${kids.map((k) => `<li><a href="about.html">${k}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}
              </ul></div></div>
            </li>`).join("")}
          </ul>
          <div class="ll-gsub">
            <div class="ll-gsub__item"><span class="ll-gsub__icon">${calendar}</span><ul><li><a href="#">Book now</a></li><li><a href="#">Booking basket</a></li></ul></div>
            <div class="ll-gsub__item"><span class="ll-gsub__icon">${mail}</span><ul><li><a href="#">Contact Us</a></li></ul></div>
          </div>
        </nav>
        <a class="ll-aside-tab" href="#family">
          <span class="ll-aside-tab__bear">${bear()}</span>
          <span class="ll-aside-tab__mark" data-label="Member app logo"><span class="ll-loop" aria-hidden="true"></span><span>Club</span></span>
          <span class="ll-aside-tab__text">Member News<br>Get it first!</span>
        </a>
      </div>
      <button type="button" class="ll-burger" aria-expanded="false" aria-controls="ll-sitemap" aria-label="Open Sitemap"><span class="ll-burger__dots"></span></button>
      <div class="ll-sitemap" id="ll-sitemap" aria-hidden="true">
        <div class="ll-sitemap__inner">
          <p class="ll-sitemap__logo"><a href="index.html">${markOf("is-row")}</a></p>
          <ul class="ll-sitemap__main">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About the Park</a></li>
            ${NAV.map((n, i) => `<li class="ll-acc"><button type="button" class="ll-acc__btn" aria-expanded="false">${n.sub}<span lang="en">(${n.main})</span></button><div class="ll-acc__body" aria-hidden="true"><ul>${n.items.map(([t]) => `<li><a href="${i === 1 && t === "Experience Workshop" ? "service.html" : "about.html"}">${t}</a></li>`).join("")}</ul></div></li>`).join("")}
            <li><a href="news.html">News</a></li>
            <li><a href="#">Frequently asked questions</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
          <ul class="ll-sitemap__other">${["Sitemap", "Privacy policy", "Transaction Display", "Member terms", "Terms of service"].map((t) => `<li><a href="${t === "Terms of service" ? "terms.html" : "#"}">${t}</a></li>`).join("")}</ul>
          <div class="ll-sitemap__app"><span class="ll-loop" aria-hidden="true"></span><div><p>Member app</p><a href="#">▶ App Store</a> <a href="#">▶ Google Play</a></div></div>
        </div>
      </div>`;

    // The sidebar menu drawer is open only while hovering (original mouseover and mouseleave)
    sidebar.querySelectorAll("[data-gnav]").forEach((li) => {
      const btn = li.querySelector(".ll-gnav__btn"), dr = li.querySelector(".ll-gnav__drawer");
      const set = (v) => { btn.setAttribute("aria-expanded", String(v)); dr.setAttribute("aria-hidden", String(!v)); };
      li.addEventListener("mouseover", () => set(true));
      li.addEventListener("mouseleave", () => set(false));
      btn.addEventListener("click", () => set(true));
      li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) set(false); });
    });

    const burger = sidebar.querySelector(".ll-burger"), map = sidebar.querySelector(".ll-sitemap");
    const setMap = (v) => {
      burger.setAttribute("aria-expanded", String(v));
      burger.setAttribute("aria-label", v ? "Close Sitemap" : "Open Sitemap");
      map.setAttribute("aria-hidden", String(!v));
      sidebar.classList.toggle("is-overlay", v);
      document.documentElement.classList.toggle("ll-lock", v);
    };
    burger.addEventListener("click", () => setMap(burger.getAttribute("aria-expanded") !== "true"));
    // As in the original, clicking anywhere outside the drawer or button closes it
    document.addEventListener("click", (e) => { if (burger.getAttribute("aria-expanded") === "true" && !e.target.closest(".ll-sitemap, .ll-burger")) setMap(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMap(false); });
    sidebar.querySelectorAll(".ll-acc").forEach((acc) => {
      const b = acc.querySelector(".ll-acc__btn"), body = acc.querySelector(".ll-acc__body");
      b.addEventListener("click", () => {
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        body.setAttribute("aria-hidden", String(!open));
        // The original measures the height and moves between 0 ↔ content height, then releases it to auto
        const h = body.scrollHeight;
        body.style.height = open ? "0px" : `${h}px`;
        body.offsetHeight;
        body.style.height = open ? `${h}px` : "0px";
        if (open) body.addEventListener("transitionend", () => { if (b.getAttribute("aria-expanded") === "true") body.style.height = "auto"; }, { once: true });
      });
    });
  }

  /* Member · hiring band */
  const fr = document.querySelector('[data-slot="family-recruit"]');
  if (fr) {
    fr.innerHTML = `
      <aside class="ll-family" id="family" data-slot="family-band">
        <div class="ll-family__bears" data-fx="char-bound-in" data-fx-char-bound-in="split: none; look: small">${bear(1.6)}<span class="ll-family__q" aria-hidden="true">?</span></div>
        <div class="ll-family__body">
          <div class="ll-family__text">
            <h2 class="ll-family__title"><span lang="en" data-label="Membership program English name">MEMBER CLUB</span><small>What is it?</small></h2>
            <p class="ll-family__lead">Add a three-line sentence introducing the membership program here.<br>A story of people who cherish the product, connected like family.<br>The ”Member Club” grew out of that feeling.</p>
            <p class="ll-family__note">Add a short two or three line note on member benefits here. Write about perks like lodging and barbecue booking, shop points, event sign-ups, and app notifications.</p>
            <a class="ll-btn is-white is-aside" href="#">View details</a>
          </div>
          <div class="ll-family__mark" data-label="Member app logo · ring mark + two lines of English"><span class="ll-loop is-big" aria-hidden="true"></span><span class="ll-family__word">MEMBER<br><em>Club</em></span></div>
        </div>
        <footer class="ll-family__foot"><p>Get the smartphone app here</p><a href="#">▶ App Store</a><span aria-hidden="true">|</span><a href="#">▶ Google Play</a></footer>
      </aside>
      <aside class="ll-recruit" data-slot="recruit-band">
        <figure class="ll-recruit__art" data-vx="park-mini" data-label="Whole-park diorama miniature image"></figure>
        <div class="ll-recruit__card">
          <h2 class="ll-recruit__title" lang="en" data-label="Careers English title">RECRUIT</h2>
          <p class="ll-recruit__lead">Looking for people to work with</p>
          <p class="ll-recruit__text">Your text here saying we are looking for people to work with.<br>If you’re curious, feel free to contact us anytime.</p>
          <a class="ll-btn is-orange is-aside" href="#">View details</a>
        </div>
      </aside>`;
  }

  /* ───────── Footer ───────── */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ll-footer";
    foot.innerHTML = `
      <div class="ll-footer__inner">
        <div class="ll-footer__main">
          <p class="ll-footer__logo"><a href="index.html">${markOf("is-row is-dark")}</a></p>
          <address class="ll-footer__addr">Postal code 000-0000<br>Your address line here 00-0</address>
          <ul class="ll-footer__nav">${[["Home", "index.html"], ["About the Park", "about.html"], ["How to enjoy", "about.html"], ["News", "news.html"], ["Info · Directions", "about.html"], ["Booking basket", "#"], ["Frequently asked questions", "#"], ["Contact Us", "#"], ["Log in", "#"]].map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
          <ul class="ll-footer__small">${["Sitemap", "Privacy policy", "Transaction Display", "Member terms", "Terms of service"].map((t) => `<li><a href="${t === "Terms of service" ? "terms.html" : "#"}">${t}</a></li>`).join("")}</ul>
          <p class="ll-footer__btns"><a class="ll-btn is-arrow" href="#">BBQ Booking</a><a class="ll-btn is-arrow" href="#">Stay Booking</a></p>
        </div>
        <div class="ll-footer__rel">
          <p class="ll-footer__relhead">Related Sites</p>
          <ul class="ll-footer__rellist">${["One related site", "Online shop", "Reads", "Monthly Newsletter", "Find a Campsite", "Event schedule", "Radio", "Brand site", "Operating company", "Camp cooking", "Play teacher"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
          <div class="ll-footer__app"><span class="ll-footer__appmark" data-label="Member app logo"><span class="ll-loop" aria-hidden="true"></span><span lang="en">MEMBER<br><em>Club</em></span></span><div><p>Smartphone app</p><a href="#">▶ App Store</a> <a href="#">▶ Google Play</a><a class="ll-footer__applink" href="#family">What is the member club?</a></div></div>
        </div>
        <p class="ll-footer__copy" lang="en">COPYRIGHT © 2026 COMPANY NAME. ALL RIGHTS RESERVED</p>
        <div class="ll-footer__sns"><p lang="en">OFFICIAL SNS</p><ul>${["Photo SNS", "Short-text SNS", "Group SNS", "Video SNS", "Short video SNS"].map((t, i) => `<li><a href="#" aria-label="${t}"><span class="ll-snsicon ll-snsicon--${i}"></span></a></li>`).join("")}</ul></div>
      </div>`;
  }

  /* ───────── Shared slider — original swiper 7.4.1 settings as they are ───────── */
  window.LLSwipers = (root = document) => {
    if (!window.Swiper) return;
    root.querySelectorAll("[data-ll-swiper='space']").forEach((el) => new Swiper(el, { slidesPerView: 1, speed: 600, spaceBetween: 20, loop: true, autoplay: { delay: 6000, disableOnInteraction: false }, navigation: { nextEl: el.querySelector(".ll-nav__next"), prevEl: el.querySelector(".ll-nav__prev") } }));
    root.querySelectorAll("[data-ll-swiper='hero-fade']").forEach((el) => new Swiper(el, { slidesPerView: 1, speed: 1000, spaceBetween: 0, loop: true, effect: "fade", fadeEffect: { crossFade: true }, autoplay: { delay: 6000, disableOnInteraction: false } }));
    root.querySelectorAll("[data-ll-swiper='others']").forEach((el) => new Swiper(el, { slidesPerView: 1, speed: 600, spaceBetween: 20, loop: true, loopedSlides: el.querySelectorAll(".swiper-slide").length, autoplay: { delay: 3000, disableOnInteraction: false }, breakpoints: { 768: { slidesPerView: 2, spaceBetween: 40 } }, navigation: { nextEl: el.parentElement.querySelector(".ll-nav__next"), prevEl: el.parentElement.querySelector(".ll-nav__prev") } }));
  };

  // Subpage body rises from 40px below in .8s cubic-bezier(.22,1,.36,1) after loading (.2s late)
  addEventListener("load", () => document.querySelectorAll(".ll-loaded, .ll-onload").forEach((n) => n.classList.add("is-loaded")));

  // Filling picture slots — put in pictures decided in advance by data-vx labels
  window.LLFill = (root = document) => root.querySelectorAll("[data-vx]").forEach((n) => {
    const f = window.LLArt?.[n.dataset.vx];
    if (f && !n.firstElementChild) n.innerHTML = f();
  });
})();
