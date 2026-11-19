// Shared by every page: photo crop frame, header (logo, right-side links, floating pill nav, menu drawer), footer, page turn, typing text, table-of-contents indicator.
// Page changes use swup 4.8.2 (+ preload, head, body-class, js, scroll 3.x plugins) like the original, so only the main body is swapped —
// Page scripts register with M.page(name, init), and on each navigation are detached (gsap.context revert + the cleanup init returns) and reattached to the new body.
(() => {
  const M = (window.M = {});
  const pages = {};
  M.page = (name, init) => (pages[name] = init);
  const EASE = "0.22,0.61,0.35,1";
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  M.ease = CustomEase.create("m-out", `M0,0 C${EASE} 1,1`);

  /* Logo shape — placeholder mark built only from arches, semicircles and bars (not the original logo) */
  M.logo = (cls = "") => `
    <svg class="${cls}" viewBox="0 0 73 91" fill="currentColor" aria-hidden="true">
      <path d="M0 18A17.5 18 0 0 1 35 18Z"/><path d="M38 18A17.5 18 0 0 1 73 18Z"/>
      <path d="M0 21h4a10 12.5 0 0 1 0 25H0Z"/><rect x="17" y="21" width="10" height="25"/>
      <path d="M30 46V33.5a8 12.5 0 0 1 16 0V46Z"/><path d="M49 21h24v12.5a12 12.5 0 0 1-24 0Z"/>
      <path d="M0 67A17.5 18 0 0 1 35 67Z"/><path d="M38 67A17.5 18 0 0 1 73 67Z"/>
      <text x="36.5" y="89" text-anchor="middle" textLength="72" lengthAdjust="spacingAndGlyphs"
        style="font-family: var(--kf-font-display)" font-weight="800" font-size="21">LOGO</text>
    </svg>`;

  /* Hand-drawn guide map — gray roads and blocks, black diamonds (buildings) and landmarks, station strip below. Redrawn in the same spirit as the original map */
  M.map = () => `
    <svg class="m-map" viewBox="0 0 800 760" aria-label="Guide map slot">
      <rect class="m-map__bg" width="800" height="760"/>
      <g class="m-map__road" fill="none" stroke-linecap="square">
        <path d="M-40 560 L420 -40" stroke-width="46"/><path d="M120 800 L640 -40" stroke-width="22"/>
        <path d="M-40 330 L840 700" stroke-width="18"/><path d="M300 800 L840 160" stroke-width="16"/>
        <path d="M-40 140 L460 430" stroke-width="12"/><path d="M560 800 L840 400" stroke-width="12"/>
      </g>
      <g class="m-map__block">
        <rect x="420" y="330" width="26" height="26" transform="rotate(30 433 343)"/>
        <rect x="580" y="450" width="22" height="22" transform="rotate(30 591 461)"/>
        <rect x="170" y="520" width="20" height="20" transform="rotate(30 180 530)"/>
        <rect x="640" y="220" width="24" height="24" transform="rotate(30 652 232)"/>
      </g>
      <rect class="m-map__band" x="0" y="650" width="800" height="40"/>
      <rect class="m-map__ink" x="330" y="640" width="220" height="60"/>
      <text class="m-map__onink" x="440" y="676" font-size="16" font-weight="700" text-anchor="middle">Station name</text>
      <text class="m-map__ink" x="100" y="676" font-size="13" text-anchor="middle">Your path name here</text>
      <rect class="m-map__ink" x="420" y="400" width="86" height="86" transform="rotate(-36 463 443)"/>
      <g class="m-map__ink" transform="translate(480 190) scale(.95)">${M.logo().replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, "")}</g>
      <g class="m-map__ink" font-size="13">
        <text x="330" y="400" text-anchor="end">Your building name here</text>
        <text x="570" y="480">Your facility name here</text>
        <text x="40" y="250">◂ Direction here</text>
        <text x="300" y="70">Your area ▸ here</text>
        <text x="620" y="590">Your shop here</text>
      </g>
      <circle class="m-map__pin" cx="740" cy="720" r="18" stroke-width="2"/>
      <rect class="m-map__ink" x="734" y="709" width="12" height="22" rx="3"/>
    </svg>`;

  /* Five frames for cropping photos plus one semicircle. 0–1 box coordinates so they fit any size */
  const defs = `
    <svg class="m-clipdefs" aria-hidden="true"><defs>
      <clipPath id="m-clip-d" clipPathUnits="objectBoundingBox"><path d="M0 0H.7A.3 .5 0 0 1 .7 1H0Z"/></clipPath>
      <clipPath id="m-clip-dl" clipPathUnits="objectBoundingBox"><path d="M1 0H.3A.3 .5 0 0 0 .3 1H1Z"/></clipPath>
      <clipPath id="m-clip-arch" clipPathUnits="objectBoundingBox"><path d="M0 1V.83A.5 .83 0 0 1 1 .83V1Z"/></clipPath>
      <clipPath id="m-clip-cup" clipPathUnits="objectBoundingBox"><path d="M0 0H1V.17A.5 .83 0 0 1 0 .17Z"/></clipPath>
      <clipPath id="m-clip-twin" clipPathUnits="objectBoundingBox"><path d="M0 1V.43A.263 .43 0 0 1 .5 .25A.263 .43 0 0 1 1 .43V1Z"/></clipPath>
      <clipPath id="m-clip-dome" clipPathUnits="objectBoundingBox"><path d="M0 1A.5 1 0 0 1 1 1Z"/></clipPath>
    </defs></svg>`;

  const links = [
    ["Home", "index.html"], ["About", "about.html"], ["How to use", "index.html#h2u"],
    ["Article", "detail.html"], ["Access", "access.html"], ["Contact", "#contact"],
  ];
  const ulink = (t, href, cls = "") => `<div class="m-link ${cls}"><a href="${href}"><p>${t}</p></a></div>`;
  const ext = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M5 1H1v10h10V7"/><path d="M7 1h4v4M11 1 5.5 6.5"/></svg>`;
  const xlink = (t, cls = "") => `<div class="m-link ${cls}"><a href="#"><p>${t}</p>${ext}</a></div>`;

  const head = `
    <div class="m-logo"><a href="index.html" aria-label="Go home">${M.logo()}</a></div>
    <nav class="m-hright">
      ${ulink("Access", "access.html")}
      <div class="m-btn is-short"><a href="#contact"><p>Contact</p><span class="m-arrow"></span></a></div>
    </nav>
    <div class="m-bar">
      <div class="m-bar__btns">
        <div class="m-bar__btn">${ulink("Home", "index.html", "is-invert")}</div>
        <div class="m-bar__btn">${ulink("Access", "access.html", "is-invert")}</div>
        <div class="m-bar__btn">${ulink("Contact", "#contact", "is-invert")}</div>
        <div class="m-drawer"><div class="m-drawer__inner"><div class="m-drawer__links">
          ${links.map(([t, h]) => ulink(t, h)).join("")}
        </div></div></div>
      </div>
      <button class="m-bar__menu" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>`;

  /* Large shape pieces forming the floor — lined up and cropped by the bottom of the screen */
  const shapes = (() => {
    const kinds = ["dome", "bar", "dr", "twin", "bar", "cup", "dl", "dome", "bar", "circle", "dr", "twin", "bar", "dome", "cup", "bar", "dl"];
    const W = { dome: 150, bar: 52, dr: 96, dl: 96, twin: 190, cup: 130, circle: 140 };
    let x = 0, out = "";
    const gap = (1681 - kinds.reduce((s, k) => s + W[k], 0)) / (kinds.length - 1);
    kinds.forEach((k, i) => {
      const w = W[k], y = [8, 40, 22, 0, 60, 30, 14, 46, 18, 4, 36, 10, 52, 26, 6, 44, 20][i], b = 230;
      const r = w / 2;
      if (k === "dome") out += `<path d="M${x} ${b}V${y + r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${b}Z"/>`;
      if (k === "bar") out += `<rect x="${x}" y="${y}" width="${w}" height="${b - y}"/>`;
      if (k === "dr") out += `<path d="M${x} ${y}H${x + w * .2}A${w * .8} ${(b - y) / 2.4} 0 0 1 ${x + w * .2} ${y + (b - y) / 1.2}H${x}Z"/>`;
      if (k === "dl") out += `<path d="M${x + w} ${y}H${x + w * .8}A${w * .8} ${(b - y) / 2.4} 0 0 0 ${x + w * .8} ${y + (b - y) / 1.2}H${x + w}Z"/>`;
      if (k === "twin") out += `<path d="M${x} ${b}V${y + w / 4}A${w / 4} ${w / 4} 0 0 1 ${x + w / 2} ${y + w / 4}A${w / 4} ${w / 4} 0 0 1 ${x + w} ${y + w / 4}V${b}Z"/>`;
      if (k === "cup") out += `<path d="M${x} ${y}H${x + w}V${y + 40}A${r} ${r} 0 0 1 ${x} ${y + 40}Z"/>`;
      if (k === "circle") out += `<circle cx="${x + r}" cy="${y + r}" r="${r}"/>`;
      x += w + gap;
    });
    return `<svg class="m-foot__shapes" viewBox="0 0 1681 148" fill="currentColor" aria-hidden="true">${out}</svg>`;
  })();

  const foot = `
    <div class="m-foot__contact" id="contact">
      <div class="m-foot__contactIn">
        <div>
          <p class="m-en-big">Contact</p>
          <p class="m-ttl-ja">Your contact title here</p>
        </div>
        <div class="m-foot__contactR">
          <p>Your one line for receiving inquiries here.</p>
          <div class="m-btn is-big"><a href="#contact"><p>Contact Us</p><span class="m-arrow"></span></a></div>
        </div>
      </div>
    </div>
    <div class="m-foot__btm">
      <div class="m-foot__logo"><a href="index.html" aria-label="Go home">${M.logo()}</a></div>
      <div class="m-foot__r">
        <div class="m-foot__links">${links.map(([t, h]) => ulink(t, h)).join("")}</div>
        <div class="m-foot__info">
          <div>
            <p class="m-foot__addrTtl">Address</p>
            <div class="m-foot__addr">
              <p>〒000-0000<br>Your address line here 0-0</p>
              ${xlink("Google Map")}
            </div>
          </div>
          <div class="m-foot__more">
            <div>${xlink("SNS 1")}${xlink("SNS 2")}</div>
            <div>${xlink("Privacy Policy")}${xlink("Operating company", "is-ja")}</div>
          </div>
        </div>
        <p class="m-foot__copy">© 0000 LOGO.</p>
      </div>
    </div>
    ${shapes}`;

  document.body.insertAdjacentHTML("afterbegin", defs);
  const headEl = document.querySelector("[data-slot='header']");
  const footEl = document.querySelector("[data-slot='footer']");
  headEl.classList.add("m-head");
  headEl.innerHTML = head;
  footEl.classList.add("m-foot");
  footEl.innerHTML = foot;

  /* Menu Drawer */
  const menuBtn = headEl.querySelector(".m-bar__menu");
  const setMenu = (on) => {
    headEl.classList.toggle("is-on", on);
    menuBtn.setAttribute("aria-expanded", on);
    menuBtn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!headEl.classList.contains("is-on")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  document.addEventListener("click", (e) => {
    if (headEl.classList.contains("is-on") && !e.target.closest(".m-bar")) setMenu(false);
  });

  /* Whether at the top or at the bottom: decides the logo size and hiding of the pill nav */
  const ws = () => {
    document.body.classList.toggle("ws-top", scrollY === 0);
    document.body.classList.toggle("ws-in-footer", footEl.getBoundingClientRect().top < innerHeight);
  };
  addEventListener("scroll", ws, { passive: true });
  ws();

  /* Typing text: letters switch on one at a time, and the cursor (|) turns off once all are typed */
  M.split = (el) => {
    if (el.dataset.split) return el;
    el.dataset.split = 1;
    const txt = el.textContent;
    el.textContent = "";
    for (const c of txt) {
      const s = document.createElement("span");
      s.className = "m-ch";
      s.textContent = c;
      el.append(s);
    }
    const bar = document.createElement("span");
    bar.className = "m-caret";
    bar.textContent = "|";
    el.append(bar);
    el.classList.add("m-type");
    return el;
  };
  // As in the original, letters are hidden by CSS (display: none) and switched on one by one with a zero-length to — rewinding (seek 0) returns to CSS and hides them again
  M.type = (el, dur) => {
    const chars = el.querySelectorAll(".m-ch");
    const tl = gsap.timeline({ paused: true });
    let t = 0;
    chars.forEach((c) => { tl.to(c, { duration: 0, display: "inline" }, t); t += dur / chars.length; });
    tl.to(el.querySelector(".m-caret"), { duration: 0, display: "none" }, t);
    return tl.play(0);
  };

  /* Section title typing: when 90% of the section box reaches 90% of the screen it types in .5 seconds (built .4 seconds late, like the original) */
  const typeTitles = (main) => {
    const off = [];
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      main.querySelectorAll("[data-type-ttl]").forEach((box) => {
        const parts = [...box.querySelectorAll("p, h1, h2")].map(M.split);
        if (ctx.conditions.reduce) return parts.forEach((p) => p.classList.add("is-done"));
        let fresh = true;
        const play = () => fresh && ((fresh = false), parts.forEach((p) => M.type(p, 0.5)));
        const id = setTimeout(() => ctx.add(() => ScrollTrigger.create({ trigger: box, start: "90% 90%", end: "95% 95%", onEnter: play, onEnterBack: play })), 400);
        off.push(() => clearTimeout(id));
      });
    });
    return () => { off.forEach((f) => f()); mm.revert(); };
  };

  /* TOC: filled with body section titles, half-circle marker on the section being read */
  const toc = (main) => {
    const tocHtml = [...main.querySelectorAll(".m-sec[id]")].map((s) =>
      `<div class="m-toc"><a href="#${s.id}"><div class="m-sqbtn__txt"><p>${s.querySelector("h2").textContent}</p></div><span class="m-sq"><span class="m-arrow"></span></span></a></div>`).join("");
    main.querySelectorAll("[data-toc]").forEach((el) => (el.innerHTML = tocHtml));
    const tocs = main.querySelectorAll(".m-toc");
    const secs = [...new Set([...tocs].map((t) => t.querySelector("a").getAttribute("href")))];
    secs.forEach((id) => {
      const sec = main.querySelector(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 40%", end: "bottom 40%",
        onToggle: (st) => st.isActive && tocs.forEach((t) => t.classList.toggle("is-crnt", t.querySelector("a").getAttribute("href") === id)),
      });
    });
  };

  let scope = null;
  const mount = () => {
    const main = document.querySelector("main");
    scope = { off: [] };
    scope.ctx = gsap.context(() => {
      scope.off.push(typeTitles(main));
      toc(main);
      const off = pages[main.dataset.page]?.(main);
      if (typeof off === "function") scope.off.push(off);
    });
    document.documentElement.classList.remove("m-splash-wait");
    ws();
  };
  const unmount = () => {
    if (!scope) return;
    scope.off.forEach((f) => f());
    scope.ctx.revert();
    scope = null;
  };

  /* Page transition, original: on exit it hides in .45s (if the menu was open, .6s later, waiting 1050ms), on enter it waits 650ms, then
     .15s pause then revealed in .5s. Same-page # links roll via the scroll plugin (acceleration .04). Addresses containing contact stay outside swup as in the original */
  const root = document.documentElement;
  const here = new URL(".", location.href).pathname;
  const ours = (url) => { const u = new URL(url, location.href); return u.origin === location.origin && u.pathname.startsWith(here); };
  const http = /^https?:$/.test(location.protocol) && window.Swup && window.SwupJsPlugin;
  if (http) {
    history.scrollRestoration = "manual";
    const st = { wasHeaderOn: false, popstate: false };
    const swup = (M.swup = new Swup({
      animateHistoryBrowsing: true,
      containers: ["main"],
      ignoreVisit: (url, { el } = {}) => url.includes("contact") || el?.getAttribute("href") === "#" || !ours(url),
      plugins: [
        new SwupPreloadPlugin(),
        new SwupHeadPlugin({ awaitAssets: true }),
        new SwupBodyClassPlugin(),
        new SwupJsPlugin({ animations: [{
          from: "(.*)", to: "(.*)",
          out: (done) => setTimeout(done, st.wasHeaderOn ? 1050 : 450),
          in: (done) => { setTimeout(done, 650); st.wasHeaderOn = false; root.classList.remove("was-menu"); },
        }] }),
        new SwupScrollPlugin({
          animateScroll: { betweenPages: false, samePageWithHash: true, samePage: true },
          scrollAcceleration: 0.04,
          offset: (el) => parseFloat(getComputedStyle(el).scrollMarginTop) || 0,
        }),
      ],
    }));
    swup.hooks.on("link:click", () => {
      if (headEl.classList.contains("is-on")) { st.wasHeaderOn = true; root.classList.add("was-menu"); }
      setMenu(false);
    });
    swup.hooks.before("content:replace", unmount);
    swup.hooks.on("page:view", () => { mount(); ScrollTrigger.refresh(); });
    swup.hooks.on("animation:in:start", (visit) => {
      if (st.popstate) { st.popstate = false; return; }
      const t = visit.to.hash && document.querySelector(visit.to.hash);
      swup.scrollTo(t ? t.getBoundingClientRect().top + scrollY - (parseInt(getComputedStyle(t).scrollMarginTop, 10) || 0) : 0, false);
    });
    swup.hooks.on("history:popstate", (visit) => {
      st.popstate = true;
      if (visit.to.url.includes("contact")) location.href = visit.to.url;
    });
  } else {
    /* Opened as a file, fetch is blocked and swup cannot run — hide with the same values, then move, and only reveal on the new page */
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html/.test(href)) return;
      const [file, hash] = href.split("#");
      if (file === (location.pathname.split("/").pop() || "index.html") && hash) return;
      e.preventDefault();
      const was = headEl.classList.contains("is-on");
      setMenu(false);
      root.classList.add("is-changing");
      root.classList.toggle("was-menu", was);
      sessionStorage.setItem("m-enter", 1);
      setTimeout(() => (location.href = href), was ? 1050 : 450);
    });
    if (sessionStorage.getItem("m-enter")) {
      sessionStorage.removeItem("m-enter");
      root.classList.add("is-rendering");
      setTimeout(() => root.classList.remove("is-rendering"), 1700);
    }
    addEventListener("pageshow", (e) => e.persisted && root.classList.remove("is-changing", "was-menu"));
  }

  addEventListener("DOMContentLoaded", () => {
    mount();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => ScrollTrigger.refresh());
  });
})();
