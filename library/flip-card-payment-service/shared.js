// Shared across pages: header, mega menu, left fixed button, footer, loader, page transition, section heading, fade, and the newly drawn line art.
// Page transitions use barba 2.10.3 as in the original — header, menu, fixed button and footer stay as they are, and [data-barba="container"] is the only thing swapped out.
//   Page scripts live in NP.pages[name] = (Box) => Set to detach beforehand, attach when the box enters and detach when it leaves. When opened as a file (file://) barba cannot fetch the page, so it draws the same line and navigates for real.
document.documentElement.classList.add("js");

const NP = (() => {
  const SP = matchMedia("(max-width: 768px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pages = {};
  const FILE = { home: "index", service: "service", case: "works", news: "news", caseDetail: "detail" };
  let page = document.querySelector('[data-barba="container"]')?.dataset.barbaNamespace || "home";
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const NAV = [
    ["index.html#about", "Menu First"],
    ["service.html", "Menu Two Differs"],
    ["works.html", "Adoption cases"],
    ["index.html#system", "Menu Four"],
    ["index.html#price", "Fee"],
    ["index.html#steps", "Adoption steps"],
  ];
  const here = (href) => href === `${FILE[page] || "index"}.html`;
  const swoosh = '<svg class="np-swoosh" viewBox="0 0 34 18" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M1 12c6-9 13-9 17-3"/><path d="M14 13c5 5 12 3 19-9"/></svg>';
  const logo = (tag = "a") => `<${tag} class="np-logo" ${tag === "a" ? 'href="index.html"' : ""}><span class="np-logo__mark">${swoosh}Logo slot</span><span class="np-logo__mark np-logo__anim" aria-hidden="true">${swoosh}Logo slot</span><span>Your one-line tagline here</span></${tag}>`;
  const ext = '<i class="np-ext"></i>';
  const mail = '<svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="1"/><path d="m2 4 6 5 6-5"/></svg>';
  const doc = '<svg viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M5.5 7.5h5M5.5 10h5"/></svg>';

  function shell() {
    const header = document.querySelector("[data-slot=header]");
    header.className = "np-header";
    header.innerHTML = `${logo()}
      <nav class="np-nav"><ul>${NAV.map(([h, t]) => `<li><a href="${h}"${here(h) ? ' aria-current="page"' : ""}><span class="np-nav__text">${t}</span></a></li>`).join("")}</ul></nav>
      <button class="np-menu-btn" type="button" aria-expanded="false" aria-label="Open Menu">
        <svg viewBox="0 0 32 8"><line x1="1" y1="1" x2="31" y2="1"/><line x1="1" y1="8" x2="31" y2="8"/></svg>
        <span class="np-menu-btn__label">MENU</span>
      </button>`;

    // Like the original, it must sit inside the header so the menu covers the header text and only the menu button remains above
    const mega = document.querySelector("[data-slot=mega-menu]");
    header.append(mega);
    mega.className = "np-mega";
    mega.innerHTML = `<div class="np-mega__body">
      <div class="np-mega__top">
        <div class="np-mega__left">${logo("span")}<svg class="np-mega__line" viewBox="0 0 320 300"><defs><linearGradient id="np-mega-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color: var(--site-pink)"/><stop offset="1" style="stop-color: var(--kf-accent)"/></linearGradient></defs><line x1="10" y1="290" x2="310" y2="10" stroke="url(#np-mega-g)"/></svg></div>
        <nav class="np-mega__nav">
          <ul class="np-mega__list">${[...NAV.slice(0, 2), ["index.html#wiz", "Menu Three"], ...NAV.slice(2), ["news.html", "Press Release"]].map(([h, t]) => `<li><a href="${h}">${t}<i class="np-arrow"></i></a></li>`).join("")}</ul>
          <div class="np-mega__multi">
            <dl class="np-mega__dl"><dt>Inquiry</dt>${["Resource Request Form", "Contact form", "Application Form", "Frequently asked questions"].map((t) => `<dd><a href="#">${t}${ext}</a></dd>`).join("")}</dl>
            <dl class="np-mega__dl"><dt>Related Services</dt>${["Related service name one", "Related service two name", "Related service three name"].map((t) => `<dd><a href="#">${t}${ext}</a></dd>`).join("")}</dl>
          </div>
        </nav>
      </div>
      <div class="np-mega__bottom"><ul class="np-mega__foot">${["Operating company", "Privacy policy", "Site Policy"].map((t) => `<li><a href="#">${t}${ext}</a></li>`).join("")}</ul></div>
    </div>`;

    const cta = document.querySelector("[data-slot=side-cta]");
    cta.className = "np-cta";
    cta.innerHTML = `<a class="np-cta__btn np-cta__btn--contact" href="#">${mail}<span>Contact Us</span></a><a class="np-cta__btn np-cta__btn--doc" href="#">${doc}<span>Brochure Request</span></a>`;

    const footer = document.querySelector("[data-slot=footer]");
    footer.className = "np-footer";
    const col = (head, items) => `<div class="np-footer__col"><p class="np-footer__head"><span>${head}</span></p><ul class="np-footer__list">${items.map((t) => `<li><a href="${t[1] || "#"}">${t[0]}${t[1] ? "" : ext}</a></li>`).join("")}</ul></div>`;
    footer.innerHTML = `<a class="np-footer__top" href="#top">BACK TO TOP</a>
      <div class="np-footer__inner">
        <div class="np-footer__cols">
          ${col("Service name", [["Menu First", "index.html#about"], ["Menu Two Differs", "service.html"], ["Menu Three", "index.html#wiz"], ["Adoption cases", "works.html"], ["Menu Four", "index.html#system"], ["Fee", "index.html#price"], ["Adoption steps", "index.html#steps"], ["Press Release", "news.html"]])}
          ${col("Inquiry", [["Resource Request Form"], ["Contact form"], ["Application Form"], ["Frequently asked questions"]])}
          ${col("Related Services", [["Related service name one"], ["Related service two name"], ["Related service three name"]])}
        </div>
        <ul class="np-footer__sub"><li><a href="#">Operating Company${ext}</a></li><li><a href="#">Privacy policy${ext}</a></li><li><a href="#">Site Policy${ext}</a></li></ul>
        <ul class="np-footer__marks"><li><div class="wf-img" data-label="Certification mark 1"></div></li><li><div class="wf-img" data-label="Certification mark 2"></div></li><li><div class="wf-img" data-label="Certification mark 3"></div></li></ul>
        <p class="np-footer__copy">Copyright(C) Company Name All Rights Reserved.</p>
      </div>`;
  }
  // Original updateCurrentNav — on each slide change, marks the current page in the menu
  function updateNav() {
    document.querySelectorAll(".np-nav a").forEach((a) => (here(a.getAttribute("href")) ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  }
  function band(root) {
    root.querySelectorAll("[data-slot=request-band]:not(.np-docs)").forEach((el) => {
      el.classList.add("np-docs");
      // The original slides one lettering image (PC 151rem · phone 55.2rem·44.6rem) by that width via background-position — set the cell width to the same value and shift by one cell
      const run = (t) => Array.from({ length: 4 }, () => `<span>${t}</span>`).join("");
      el.innerHTML = `<div class="np-docs__back np-docs__back--a">${run('<b class="np-docs__pc">REQUEST DOCUMENT</b><b class="np-docs__sp">DOCUMENT</b>')}</div><div class="np-docs__back np-docs__back--b">${run("REQUEST")}</div>
        <p class="np-docs__text">Request Materials</p><a class="np-docs__btn" href="#" aria-label="Brochure Request"></a>`;
    });
  }

  // ── Line drawing ─────────────────────────────────
  // The original speaks through illustrations of people, shops and charts — redrawn at the same position, size and stroke width. Colors are all classes in shared.css (skin variables)
  const P = (x, y, o = {}) => {
    const s = o.s || 1, sh = o.shirt || "kw";
    const g = (d) => `<g transform="translate(${x} ${y}) scale(${s})">${d}</g>`;
    const arms = o.raise
      ? '<path class="k" d="M-10-68-14-48M10-68 18-96"/>'
      : o.hold ? '<path class="k" d="M-10-68-6-50 6-52M10-68 6-50"/>' : '<path class="k" d="M-10-68-13-44M10-68 13-44"/>';
    return g(`<path class="ak" d="M-9-42h18l-2 40h-6l-1-28-1 28h-6z"/><path class="s" d="M-8 0h7v-3h-7zM2 0h7v-3h-7z"/>
      <rect class="${sh}" x="-10" y="-72" width="20" height="32" rx="4"/>${arms}
      <circle class="kw" cx="0" cy="-82" r="9"/><path class="s" d="M-9-83a9 9 0 0 1 18 0c-4-4-11-5-18 0z"/>`);
  };
  const monitor = (x, y, w = 60, h = 40) => `<rect class="kw" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/><rect class="a3" x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}"/><path class="k" d="M${x + w / 2} ${y + h}v8M${x + w / 2 - 12} ${y + h + 8}h24"/>`;
  const shop = (x, y) => `<g transform="translate(${x} ${y})"><rect class="kw" width="22" height="18" rx="1"/><path class="a3" d="M0 0h22v6H0z"/><path class="k" d="M0 6h22M5.5 0v6M11 0v6M16.5 0v6"/><rect class="kw" x="8" y="9" width="6" height="9"/></g>`;
  const lines = (x, y, w, n, gap = 7) => Array.from({ length: n }, (_, i) => `<path class="k" d="M${x} ${y + i * gap}h${i === n - 1 ? w * 0.6 : w}"/>`).join("");
  const T = (x, y, t, cls = "tk", size = 9, anchor = "middle") => `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${t}</text>`;
  const arc = (cx, cy, r, a0, a1) => {
    const p = (a) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}z`;
  };

  const ILL = {
    pie: ["0 0 200 160", () => {
      const segs = [[0, 151, "a"], [151, 278, "a2"], [278, 310, "a3"], [310, 335, "g"], [335, 350, "a3"], [350, 360, "g"]];
      return `<circle class="la" cx="92" cy="80" r="66"/>${segs.map(([a, b, c]) => `<path class="${c}" d="${arc(92, 80, 58, a, b)}"/>`).join("")}
        <path class="w" d="${arc(92, 80, 58, 150.5, 151.5)}"/>${T(122, 66, "Satisfaction", "tw", 8)}${T(122, 80, "00%", "tw", 12)}${T(68, 104, "Somewhat satisfied", "tw", 7)}${T(68, 118, "00%", "tw", 11)}
        <path class="k" d="M150 112l12 6h20"/>${T(166, 116, "Total", "tk", 7, "start")}${T(166, 130, "00%", "tk", 10, "start")}`;
    }],
    plans: ["0 0 200 160", () => [["A", "p", 62, 52], ["B", "p2", 132, 52], ["C", "a", 62, 112], ["D", "a2", 132, 112]]
      .map(([t, c, x, y]) => `<circle class="${c}" cx="${x}" cy="${y}" r="30"/>${T(x, y + 2, t, "tw", 16)}${T(x, y + 15, "Plan", "tw", 7)}`).join("")],
    people: ["0 0 240 120", () => Array.from({ length: 7 }, (_, i) => P(22 + i * 32, 112, { shirt: i % 3 === 1 ? "ak" : "kw", raise: i === 6 })).join("")],
    team: ["0 0 200 160", () => `<rect class="kw" x="70" y="40" width="70" height="50" rx="3"/>${lines(80, 54, 50, 4, 9)}${P(55, 140, { shirt: "ak" })}${P(155, 140, { hold: true })}
      ${Array.from({ length: 12 }, (_, i) => shop(30 + (i % 6) * 24, 142 + Math.floor(i / 6) * 22)).join("")}`],
    shops: ["0 0 200 70", () => Array.from({ length: 14 }, (_, i) => shop(6 + (i % 7) * 27, 4 + Math.floor(i / 7) * 30)).join("")],
    map: ["0 0 220 170", () => `<path class="g" d="M196 18c8 10-4 22-16 26-10 4-14 16-26 22-14 8-22 4-34 16-12 12-28 20-46 26-14 4-28 14-40 26-8 8-20 4-22-6 0-10 12-16 22-22 16-10 30-14 44-26 16-12 30-18 42-30 12-12 26-20 40-30 12-8 30-12 36-2z"/>
      <circle class="kw" cx="72" cy="40" r="24"/><g transform="translate(58 30)"><path class="lp" d="M1 12c6-9 13-9 17-3"/><path class="la" d="M14 13c5 5 12 3 19-9"/></g>${T(72, 58, "About 0,0000k people", "tk", 5)}
      ${P(78, 150, { s: 0.6, shirt: "ak" })}${P(96, 146, { s: 0.62 })}${P(114, 150, { s: 0.6, shirt: "ak" })}${P(87, 164, { s: 0.6 })}${P(106, 166, { s: 0.6, shirt: "ak" })}`],
    bubble: ["0 0 120 120", () => `<circle class="kw" cx="74" cy="46" r="34"/><path class="kw" d="M54 72l-10 14 20-8"/><rect class="kw" x="58" y="30" width="32" height="30" rx="2"/><path class="a3" d="M58 30h32v7H58z"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect class="${i === 4 ? "a" : "g"}" x="${62 + (i % 3) * 9}" y="${40 + Math.floor(i / 3) * 6}" width="6" height="4"/>`).join("")}
      <circle class="s" cx="20" cy="104" r="14"/><path class="kw" d="M6 120c0-8 6-12 14-12s14 4 14 12"/>`],
    monitor: ["0 0 160 120", () => `${monitor(30, 20, 100, 66)}<rect class="p" x="62" y="38" width="36" height="12" rx="1"/>${T(80, 47, "Button", "tw", 7)}<path class="kw" d="M92 46l14 10-6 1 4 8-3 1-4-8-5 4z"/>`],
    reviewer: ["0 0 160 140", () => `${P(80, 132, { hold: true, shirt: "kw" })}<rect class="kw" x="56" y="56" width="22" height="28" rx="1" transform="rotate(-8 67 70)"/>${lines(60, 64, 14, 3, 6)}`],
    mail: ["0 0 160 140", () => `${monitor(70, 52, 60, 42)}${P(48, 132, { shirt: "ak", hold: true })}<rect class="kw" x="94" y="16" width="26" height="18" rx="1"/><path class="k" d="M94 16l13 10 13-10"/><path class="lp" d="M124 12l8-6M126 20h8"/>`],
    start: ["0 0 160 140", () => `${monitor(78, 60, 56, 38)}${P(54, 132, { hold: true })}<path class="k" d="M30 132h120"/><circle class="a3" cx="112" cy="40" r="10"/><path class="la" d="M107 40l4 4 7-8"/>`],
    stress: ["0 0 280 150", () => `<rect class="kw" x="10" y="16" width="70" height="34" rx="2"/>${T(45, 30, "Your concern here", "tk", 8)}${T(45, 42, "One line", "tk", 8)}
      <rect class="kw" x="200" y="10" width="70" height="44" rx="2"/>${T(235, 26, "Your wish here", "tk", 8)}${T(235, 38, "Two lines", "tk", 8)}${T(235, 50, "Insert slot", "tk", 8)}
      ${monitor(150, 74, 70, 48)}<path class="kw" d="M110 140v-36c0-10 10-16 22-16s22 6 22 16v36"/><circle class="kw" cx="132" cy="70" r="13"/><path class="s" d="M119 68a13 13 0 0 1 26 0c-6-6-18-7-26 0z"/><path class="k" d="M114 104l4-26 10-6M150 104l-4-26-10-6"/><path class="k" d="M100 140h150"/>`],
    invoice: ["0 0 280 150", () => `<circle class="kw" cx="60" cy="40" r="22"/><rect class="kw" x="50" y="28" width="20" height="24"/>${lines(54, 36, 12, 3, 5)}
      ${P(96, 142, { shirt: "ak", hold: true })}<rect class="kw" x="98" y="94" width="40" height="26" rx="2" transform="skewX(-12)"/><path class="a3" d="M150 96h50l14-8-14-8h-50z"/>${P(240, 142, { hold: true })}`],
    cost: ["0 0 200 200", () => `${["Rain", "Dragon", "Temple", "Sense"].map((t, i) => `<rect class="kw" x="${108 + (i % 2) * 4}" y="${16 + i * 42}" width="44" height="40" rx="2"/>${T(130 + (i % 2) * 4, 44 + i * 42, t, "tk", 22)}`).join("")}${P(70, 186, { shirt: "ak", hold: true, s: 1.3 })}<rect class="pk" x="78" y="150" width="22" height="30" rx="4"/>`],
    chevrons: ["0 0 280 150", () => `<ellipse class="g" cx="40" cy="80" rx="24" ry="30"/><path class="a3" d="M40 50h40v60H40z"/>
      ${[["a3", 70], ["a2", 140], ["a", 210]].map(([c, x], i) => `<path class="${c}" d="M${x} 40h44l20 40-20 40h-44l20-40z"/>${T(x + 34, 28, `Step ${i + 1}`, "ta", 9)}${T(x + 34, 140, "Your description here", "tk", 7)}`).join("")}`],
    review: ["0 0 280 150", () => `<rect class="a3" x="30" y="10" width="220" height="30" rx="15"/>${T(140, 30, "Your one-line reason here", "ta", 11)}
      ${P(80, 142, { hold: true })}<circle class="la" cx="56" cy="70" r="12"/><path class="la" d="M64 79l8 8"/><rect class="kw" x="38" y="60" width="20" height="26"/>${lines(42, 66, 12, 3, 6)}
      ${monitor(170, 70, 64, 42)}${P(150, 142, { shirt: "ak", hold: true })}`],
    box: ["0 0 120 100", () => `<path class="kw" d="M20 40l40-16 40 16v44l-40 14-40-14z"/><path class="k" d="M20 40l40 16 40-16M60 56v42"/><path class="a3" d="M20 40l-10 14 40 16 10-14z"/><path class="k" d="M20 40l-10 14 40 16 10-14"/>`],
    pair: ["0 0 190 130", () => `<path class="k" d="M10 128h170"/><rect class="kw" x="60" y="80" width="70" height="8"/>${monitor(74, 46, 42, 30)}${P(44, 128, { shirt: "ak", hold: true })}${P(148, 128, { raise: true })}`],
    comment: ["0 0 125 103", () => `${P(40, 100, { shirt: "ak", raise: true })}${P(86, 100, { hold: true })}`],
    wizlist: ["0 0 120 120", () => `<circle class="kw" cx="60" cy="60" r="44"/><rect class="kw" x="40" y="34" width="40" height="52" rx="2"/><path class="a3" d="M40 34h40v10H40z"/>${lines(46, 54, 28, 4, 8)}`],
  };
  function drawIll(root = document) {
    root.querySelectorAll("[data-ill]:not([data-drawn])").forEach((el) => {
      const ill = ILL[el.dataset.ill];
      if (!ill) return;
      el.innerHTML = `<svg viewBox="${ill[0]}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${ill[1]()}</svg>`;
      el.dataset.drawn = "";
      el.classList.add("np-ill");
    });
  }

  // ── Header · mega menu ─────────────────────────────
  function header() {
    const head = document.querySelector(".np-header");
    const btn = head.querySelector(".np-menu-btn");
    const label = btn.querySelector(".np-menu-btn__label");
    const svg = btn.querySelector("svg");
    const [l1, l2] = svg.querySelectorAll("line");
    const mega = document.querySelector(".np-mega");
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const css = (v) => {
      const probe = document.createElement("i");
      probe.style.color = `var(${v})`;
      document.body.append(probe);
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = getComputedStyle(probe).color;
      probe.remove();
      cv.fillRect(0, 0, 1, 1);
      const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    let open = false, tl, mtl, scrollY0 = 0;
    addEventListener("scroll", () => head.classList.toggle("is-short", scrollY > 300), { passive: true });

    const toClose = () => {
      tl?.kill();
      tl = gsap.timeline()
        .set(svg, { attr: { viewBox: "0 0 32 26" }, height: "3.2rem" })
        .set(l2, { attr: { y1: 25, y2: 25 } })
        .to(l1, { y: 12, duration: 0.2, ease: "power2.out" })
        .to(l2, { y: -12, duration: 0.2, ease: "power2.out" }, "<")
        .to(l1, { rotate: 45, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(1.9)", stroke: css("--site-pink") }, "<0.05")
        .to(l2, { rotate: -45, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(1.9)", stroke: css("--site-pink") }, "<")
        .to(label, { color: css("--site-pink") }, "<");
    };
    const toNormal = () => {
      tl?.kill();
      tl = gsap.timeline()
        .set(svg, { attr: { viewBox: "0 0 32 8" }, height: "1.6rem" })
        .set(l2, { attr: { y1: 8, y2: 8 } })
        .to([l1, l2], { rotate: 0, duration: 0.2 }, "<")
        .to([l1, l2], { y: 0, duration: 0.4, ease: "power2.out", stroke: css("--kf-accent") }, "<0.05")
        .to(label, { color: css("--kf-accent") }, "<")
        .set([l1, l2, label], { clearProps: "stroke,color" });
    };
    const lock = (on) => {
      if (on) { scrollY0 = scrollY; Object.assign(document.body.style, { position: "fixed", top: `${-scrollY0}px`, width: "100%" }); }
      else { ["position", "top", "width"].forEach((p) => document.body.style.removeProperty(p)); scrollTo(0, scrollY0); }
    };
    const set = (v) => {
      open = v;
      btn.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", v);
      mtl?.kill();
      if (v) {
        toClose(); lock(true);
        mtl = gsap.fromTo(mega, { display: "block", autoAlpha: 0, y: "-2rem" }, { autoAlpha: 1, y: 0 });
      } else {
        toNormal(); lock(false);
        mtl = gsap.timeline().to(mega, { autoAlpha: 0, y: "-2rem" }).set(mega, { display: "none" });
      }
    };
    btn.addEventListener("click", () => set(!open));
    addEventListener("keyup", (e) => e.key === "Escape" && open && set(false));
    mega.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && set(false)));
  }

  // Pink ”View more”: underline 0→100% power3.inOut .5s, folds to the right on leave
  function moreLinks(root = document) {
    root.querySelectorAll(".np-more").forEach((a) => {
      const b = document.createElement("i");
      b.className = "np-border";
      a.append(b);
      a.addEventListener("mouseenter", () => {
        gsap.timeline().set(b, { width: 0, scaleX: 1 }).to(b, { width: "100%", ease: "power3.inOut", duration: 0.5 });
        gsap.to(a, { letterSpacing: "0.08em", duration: 0.3, ease: "none" });
      });
      a.addEventListener("mouseleave", () => {
        gsap.timeline().to(b, { scaleX: 0, transformOrigin: "100% 0%", duration: 0.5, ease: "power3.inOut" }).set(b, { width: 0, scaleX: 1 });
        gsap.to(a, { letterSpacing: "0.05em", duration: 0.3, ease: "none" });
      });
    });
  }

  // ── Section head: pink line at the label-width ratio, sky line for the rest, then the title slides out ──
  function drawBorder(div) {
    const label = div.querySelector(".np-divider__text");
    const r = label.getBoundingClientRect().width / div.getBoundingClientRect().width;
    return gsap.timeline()
      .to(div, { "--first": 1, duration: r, ease: "power2.in", delay: 0.3 })
      .to(div, { "--last": 1, duration: 1 - r, ease: "power2.out" });
  }
  function headings(root) {
    root.querySelectorAll(".np-divider").forEach((div) => {
      const sh = div.closest(".np-sh");
      if (reduce) { sh?.classList.add("is-shown"); return; }
      ScrollTrigger.create({
        trigger: sh || div, once: true, start: sh ? "top bottom" : "top 90%",
        onEnter: () => { drawBorder(div); if (sh) gsap.delayedCall(0.3, () => sh.classList.add("is-shown")); },
      });
    });
  }
  function fades(root) {
    const els = gsap.utils.toArray(root.querySelectorAll("[data-fade]"));
    if (reduce || !els.length) return;
    gsap.set(els, { autoAlpha: 0 });
    ScrollTrigger.batch(els, {
      start: "top 75%", once: true,
      onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: "3rem" }, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.15, overwrite: "auto", clearProps: "y" }),
    });
  }
  // Only background English text that passes over the gray band turns white
  function whiteText(root) {
    const offs = [];
    root.querySelectorAll(".np-bgtext[data-white]").forEach((t) => {
      const left = t.closest("[data-white-root]")?.querySelector(".np-lbox__left");
      if (!left) return;
      t.dataset.text = t.textContent;
      const upd = () => t.style.setProperty("--white-width", `${left.getBoundingClientRect().right - t.getBoundingClientRect().left}px`);
      upd(); addEventListener("resize", upd);
      offs.push(() => removeEventListener("resize", upd));
    });
    return () => offs.forEach((f) => f());
  }
  // Original swiper 8.4 loop — one-slide moves of 2s (3s at 768 and up) chained with a 1ms pause to flow without stopping (curve is .swiper-wrapper linear), and it pauses when off screen
  function logos(root) {
    const offs = [];
    root.querySelectorAll(".np-logos.swiper").forEach((el) => {
      const sw = new Swiper(el, {
        slidesPerView: "auto", speed: 2000, loop: true, allowTouchMove: false,
        autoplay: reduce ? false : { delay: 1, disableOnInteraction: false },
        breakpoints: { 768: { speed: 3000 } },
      });
      const io = new IntersectionObserver((es) => es.forEach(({ isIntersecting }) => !reduce && sw.autoplay[isIntersecting ? "start" : "stop"]()));
      io.observe(el);
      offs.push(() => { io.disconnect(); sw.destroy(); });
    });
    return () => offs.forEach((f) => f());
  }
  function modals(root) {
    root.querySelectorAll("[data-modal]").forEach((box) => {
      const modal = box.querySelector(".np-modal");
      const body = modal.querySelector(".np-modal__body");
      const show = () => {
        gsap.timeline().set("body", { overflow: "hidden" }).set(modal, { display: "grid" })
          .fromTo(modal.querySelector(".np-modal__back"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
          .fromTo(body, { y: "-2rem", autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, "<");
      };
      const hide = () => {
        gsap.timeline().to(modal.querySelector(".np-modal__back"), { autoAlpha: 0, duration: 0.3 })
          .to(body, { y: "-2rem", autoAlpha: 0 }, "<").set(modal, { display: "none" }).set("body", { overflow: "auto" });
      };
      box.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => SP.matches || show()));
      modal.querySelector(".np-modal__close").addEventListener("click", hide);
      modal.querySelector(".np-modal__back").addEventListener("click", hide);
    });
  }

  // ── Loader (first page) · page transition ──
  const headH = () => document.querySelector(".np-header")?.getBoundingClientRect().height || 0;
  // Original yo(): offset by the header height and .8s power2.out
  const scrollToY = (y, duration = 0.8) => gsap.to(window, { scrollTo: { y, offsetY: headH() }, ease: "power2.out", duration });

  // Original cover(): clears the current panel, and the line under the header extends from the center, pink (left) and sky-blue (right) halves, for .3s then retracts toward the end for .6s
  function cover(root) {
    const tr = root.querySelector(".np-trans");
    return gsap.timeline()
      .set(root.querySelector(".np-wrap"), { opacity: 0 })
      .set(tr, { display: "block", "--sx": 0, "--red-o": "top right", "--blue-o": "top left" })
      .to(tr, { "--sx": 1, duration: 0.3, ease: "power4.in" })
      .set(tr, { "--red-o": "top left", "--blue-o": "top right" })
      .to(tr, { "--sx": 0, duration: 0.6, ease: "power4.in" })
      .then();
  }
  // Original discover(): the first .wrapper·.page-transition belong to the already hidden previous page, so nothing changes on screen, and the previous page is removed 1s later
  function discover() {
    const w = document.querySelector(".np-wrap"), tr = document.querySelector(".np-trans");
    return gsap.timeline().set(w, { opacity: 0 }).set(w, { opacity: 1 }).to(tr, { opacity: 1, duration: 1, ease: "power1.out" }).set(tr, { display: "none" }).then();
  }

  function opening(root) {
    const head = document.querySelector(".np-header");
    const cta = document.querySelector(".np-cta");
    const op = root.querySelector(".np-op");
    const home = root.querySelector(".np-home");
    if (!op || reduce) {
      gsap.set([head, home], { opacity: 1 });
      op && gsap.set(op, { display: "none" });
      return Promise.resolve();
    }
    const lines = op.querySelector(".np-split");
    const xy = SP.matches ? { "--cy": "10rem" } : { "--cx": "-10rem", "--cy": "10rem" };
    return gsap.timeline()
      .add(() => op.classList.remove("is-open"))
      .set(op, { display: "block", "--back": 1 })
      .set(lines, { "--sx": 0 })
      .set(home, { opacity: 1 })
      .to(lines, { "--sx": 1, duration: 0.3, ease: "power4.in" }, "> 0.3")
      .set(lines, { "--red-o": "top left", "--blue-o": "top right" })
      .to(lines, { "--sx": 0, duration: 0.6, ease: "power4.in" })
      .add(() => op.classList.add("is-open"))
      .set(op, { display: "none" }, "+=0.5")
      .set(head, { opacity: 1 })
      .fromTo(head, { y: "-10rem", opacity: 0 }, { y: 0, autoAlpha: 1, clearProps: "y", duration: 0.6, ease: "power1.in" })
      .fromTo(cta, xy, { "--cx": 0, "--cy": 0, duration: 0.6, ease: "power2.in" }, "<")
      .then();
  }

  // ── Attach·detach boxes — original bE (common) and page modules. ScrollTrigger and tweens are collected with gsap.context and reverted all at once ──
  // Original preventReloadIfSamePageLink: a link to the current page is not refetched but scrolls to its anchor (or to the top if there is none)
  const samePath = (href) => {
    try { const u = new URL(href, location.href); return u.origin === location.origin && u.pathname === location.pathname; } catch { return false; }
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); return; }
    if (href === "#top" || !samePath(a.href)) return;
    e.preventDefault();
    const hash = new URL(a.href).hash;
    scrollToY(hash && hash !== "#top" ? hash : 0);
  });
  document.querySelector(".np-footer__top")?.addEventListener("click", (e) => { e.preventDefault(); scrollToY(0); });

  let mounted = null;
  function mount(root) {
    page = root.dataset.barbaNamespace || "home";
    updateNav();
    const offs = [];
    const ctx = gsap.context(() => {
      band(root);
      drawIll(root);
      moreLinks(root);
      modals(root);
      offs.push(logos(root), whiteText(root));
      headings(root);
      fades(root);
      const off = pages[page]?.(root);
      off && offs.push(off);
    }, root);
    mounted = { ctx, offs };
  }
  function unmount() {
    if (!mounted) return;
    mounted.offs.forEach((f) => f?.());
    mounted.ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    mounted = null;
  }

  function startBarba() {
    barba.hooks.beforeLeave((d) => { if (d && d.trigger !== "back" && d.trigger !== "forward") scrollToY(0, 0); });
    barba.hooks.afterLeave(() => unmount());
    barba.hooks.beforeEnter((d) => {
      if (!d) return;
      if (d.current.container) d.current.container.style.display = "none";
      mount(d.next.container);
      ScrollTrigger.refresh();
      if (location.hash) scrollToY(location.hash, 0);
    });
    barba.init({
      debug: false, timeout: 20000,
      prevent: ({ el, href }) => el.getAttribute("href") === "#" || samePath(href),
      transitions: [{
        name: "basic",
        to: { custom: ({ current, next }) => !(next.namespace === current.namespace || next.namespace === "home") },
        leave: (d) => (reduce ? undefined : cover(d.current.container)),
        enter: () => (reduce ? undefined : discover()),
      }],
    });
  }
  // When opened as a file: draw the same line and actually navigate. Going to the first page is immediate without a line, like the original (the loader runs again)
  function startFallback() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || samePath(a.href)) return;
      const to = Object.keys(FILE).find((k) => url.pathname.endsWith(`/${FILE[k]}.html`));
      if (reduce || to === "home" || to === page) return;
      e.preventDefault();
      scrollToY(0, 0);
      cover(document.querySelector('[data-barba="container"]')).then(() => (location.href = url.href));
    });
    addEventListener("pageshow", (e) => e.persisted && location.reload());
  }

  shell();
  header();
  // barba also calls beforeEnter on the first load, so it attaches there. Opens after the page scripts (NP.pages) are all loaded
  addEventListener("DOMContentLoaded", () => {
    if (/^https?:$/.test(location.protocol) && window.barba) startBarba();
    else { mount(document.querySelector('[data-barba="container"]')); startFallback(); }
  });
  return { SP, reduce, pages, opening, drawIll, drawBorder };
})();
