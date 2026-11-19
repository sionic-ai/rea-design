// Shared by every page: draws the header (fixed button at top right, bar below on phones), expanding menu, paper texture and footer, and attaches or detaches scroll reveal, side table of contents, collapse and page scripts for each body (Barba container).
// Original libraries as is: page transitions barba 2.9.7 (+ transition curve anime.js 3.2.1) · smooth scroll Lenis 1.0.19 (default lerp .1) · scroll reveal ScrollMagic 2.0.8.
// Original values: entrance = Scene triggerHook onEnter · offset 200 · reverse false → is-fire (1s ease), is-end after 1.5s
//            Transition = sync transition: the leaving plate fades opacity 1→0 over 500ms cubicBezier(.17,.67,.48,.92) and then goes to the top, the entering plate 0→1 (delay 500ms) 500ms on the same curve
//            Menu = header.is-on toggle, is-animating 1s · while open, Lenis is removed and body overflow is hidden
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => innerWidth > 1024;
  const MK = (window.MK = { reduced, isPC, lenis: null, move: 0 });
  const LenisCtor = window.Lenis || window.lenis;

  const arrowSvg = '<svg viewBox="0 0 16 12" aria-hidden="true"><path d="M0 6h14.6M9.6 1l5 5-5 5"/></svg>';
  const arr = (MK.arr = `<span class="mk-arr">${arrowSvg}${arrowSvg}</span>`);
  const page = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
  const cur = (...p) => (p.includes(page) ? ' aria-current="page"' : "");

  // Wordmark slot — the original is a logo graphic of six bold geometric lowercase letters spread across a 1248×199 box
  MK.wordmark = (cls = "") =>
    `<svg class="${cls}" viewBox="0 0 1248 199" aria-label="Brand English Wordmark" data-label="Brand English wordmark — six bold geometric lowercase letters, widely spaced"><g class="inner"><text x="8" y="192" textLength="1232" lengthAdjust="spacing" font-size="262" font-weight="600" letter-spacing="0" style="font-family: var(--kf-font-display)">clinic</text></g></svg>`;

  const snsIcons = [
    '<svg viewBox="0 0 25 25" aria-hidden="true"><circle cx="12.5" cy="12.5" r="12.5"/><path d="M13.6 20v-6.1h2.1l.3-2.4h-2.4v-1.6c0-.7.2-1.2 1.2-1.2H16V6.6a17 17 0 0 0-1.9-.1c-1.9 0-3.1 1.1-3.1 3.2v1.8H8.9v2.4H11V20z" style="fill: var(--kf-bg)"/></svg>',
    '<svg viewBox="0 0 25 25" aria-hidden="true"><rect x="1" y="1" width="23" height="23" rx="7"/><rect x="4" y="4" width="17" height="17" rx="5" style="fill: var(--kf-bg)"/><circle cx="12.5" cy="12.5" r="4.6"/><circle cx="12.5" cy="12.5" r="2.8" style="fill: var(--kf-bg)"/><circle cx="17.6" cy="7.4" r="1.2"/></svg>',
    '<svg viewBox="0 0 25 25" aria-hidden="true"><path d="M2 2h6.5l5.2 7.3L20 2h2.5l-7.6 8.8L23 23h-6.5l-5.6-7.8L4 23H1.5l8.2-9.4z"/><path d="M5.6 3.8h2l11.8 17.4h-2z" style="fill: var(--kf-bg)"/></svg>',
    '<svg viewBox="0 0 25 25" aria-hidden="true"><circle cx="12.5" cy="12.5" r="12.5"/><ellipse cx="12.5" cy="11.6" rx="7.4" ry="5.8" style="fill: var(--kf-bg)"/><path d="M9.8 16.2 9 19.6l4.3-3.1z" style="fill: var(--kf-bg)"/></svg>',
  ];
  const sns = `<div class="mk-sns">${snsIcons.map((s, i) => `<a href="#" aria-label="SNS ${i + 1}">${s}</a>`).join("")}</div>`;
  const tel = '<div class="mk-tel"><p>TEL</p><p>000-000-0000</p></div>';
  const ten = (t) => `<div class="mk-ten is-small" data-rv><p>${t}</p></div>`;

  const aboutSub = [["#greet", "Message from the CEO"], ["#iden", "Ideology"], ["#access", "Directions"], ["#medinfo", "Facility standards notice"]];
  const treatSub = [["#", "Rehabilitation Medicine"], ["#", "Neurosurgery"], ["#", "Internal medicine"]];
  const others = [
    ["#", "Care insurance guide", "CARE INSURANCE"],
    ["#", "Brain screening · health checkup", "BRAIN DOCK"],
    ["list.html", "News", "NEWS"],
    ["works.html", "Academic Record", "ACHIEVEMENTS"],
    ["#", "Blog", "BLOG"],
    ["#", "Contact Us", "CONTACT"],
  ];
  const menuTtl = (href, ja, en) => `<div class="mk-menu__ttl"><a href="${href}"${cur(href.replace(".html", ""))}><p>${ja}</p><p>${en}</p></a></div>`;
  const subList = (base, list) => `<ul>${list.map(([h, t]) => `<li><a href="${h === "#" ? "#" : base + h}">${ten(t)}</a></li>`).join("")}</ul>`;

  // Header: the original header sits outside the Barba panel, so it stays as is after navigation
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("mk-head");
    const glyph = `<svg viewBox="0 0 1248 199" aria-hidden="true"><text x="8" y="192" textLength="1232" lengthAdjust="spacing" font-size="262" font-weight="600" style="font-family: var(--kf-font-display)">clinic</text></svg>`;
    head.innerHTML = `
      <div class="mk-logo"><a href="index.html" data-label="Hospital logo text — department on the top line, hospital name below"><span class="sub">Rehabilitation medicine · Neurosurgery · Internal medicine</span><span class="name">Your hospital name here</span></a></div>
      <nav class="mk-ctrl" aria-label="Header Menu">
        <div class="mk-ctrl__links">
          <div class="mk-pc"><a href="list.html">News</a></div>
          <div class="mk-sp"><a href="#"><span>Online booking</span></a></div>
          <div><a href="#"><span>Contact Us</span></a></div>
        </div>
        <button type="button" class="mk-burger" aria-label="Open Menu" aria-expanded="false">
          <span class="mk-burger__lines"><span></span><span></span><span></span></span>
          <span class="mk-burger__txt"><span>MENU</span><span>CLOSE</span></span>
        </button>
      </nav>
      <div class="mk-menu" data-slot="menu-drawer">
        ${glyph}${glyph}
        <div class="mk-menu__in">
          <div class="mk-menu__block">
            <div class="mk-menu__links">
              <div class="mk-menu__each">
                ${menuTtl("index.html", "Home", "HOME")}
                <div class="mk-menu__link">${menuTtl("about.html", "About the Hospital", "ABOUT")}${subList("about.html", aboutSub)}</div>
                <div class="mk-menu__link">${menuTtl("#", "Treatment Guide", "TREATMENT")}${subList("", treatSub)}</div>
              </div>
              <div class="mk-menu__each">${others.map((o) => menuTtl(...o)).join("")}</div>
            </div>
            <div class="mk-menu__info">
              <div class="mk-menu__row"><div>${tel}</div><div>${sns}</div></div>
              <div class="mk-menu__row"><div><a class="pp mk-soft" href="#">Privacy policy</a></div><div><p class="copy">© 2023 clinic.</p></div></div>
            </div>
          </div>
        </div>
      </div>`;
  }
  // The labels inside the header (dropdown menu) are also switched on by ScrollMagic right at the document top in the original — since it is a fixed plate, they are simply on from the start instead of a scroll scene
  if (head) head.querySelectorAll("[data-rv]").forEach((el) => el.classList.add("is-fire", "is-end"));
  // Paper grain — the original zarazara (2000×1293 photo) overlaid at multiply .18. The same grain is redrawn anew with a noise filter
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div class="mk-grain" aria-hidden="true"><svg><filter id="mk-grain-f"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="1"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#mk-grain-f)"/></svg></div>'
  );

  // Footer — in the original it sits inside the Barba container, so it transitions along with each page
  const cell = (n, en, ko, href = "#") =>
    `<div class="mk-cell" data-rv><a href="${href}"><div class="top"><p>${n}</p><p>${en}</p></div><div class="bottom"><p>${ko}</p>${arr}</div></a></div>`;
  MK.cell = cell;
  const timetable = `<table class="mk-tt" aria-label="Clinic hours" data-label="Clinic schedule — 7 weekday columns × 3 time-slot rows, dot for open · dash for closed">
      <tr><th>Consultation Hours</th><th>Month</th><th>Fire</th><th>Number</th><th>Neck</th><th>Gold</th><th>Earth</th><th>Sun·Public holiday</th></tr>
      ${[
        ["00:00–00:00", "d--dddd-"],
        ["00:00–00:00", "-d-dd-d-"],
        ["00:00–00:00", "d-dddd--"],
      ]
        .map(([t, s]) => `<tr><td>${t}</td>${[...s.slice(0, 7)].map((c) => `<td class="${c === "d" ? "dot" : "dash"}"></td>`).join("")}</tr>`)
        .join("")}
    </table>`;
  const map = `<svg class="mk-map" viewBox="0 0 672 490" aria-label="Sketch map" data-label="Map — two main roads and an alley, the hospital building as a dark filled block, three nearby facility names">
      <path class="road" d="M0 33 C120 40 260 58 400 80 C520 98 600 104 672 108"/><path class="road" d="M0 48 C120 55 260 72 400 94 C520 112 600 118 672 122"/>
      <path class="road" d="M318 0 L300 160 L282 490"/><path class="road" d="M334 0 L316 160 L298 490"/>
      <path class="road thin" d="M300 230 C380 236 470 250 672 262"/><path class="road thin" d="M0 300 C90 296 200 300 290 306"/>
      <path class="road thin dash" d="M440 120 L430 260 L425 420"/><path class="road thin" d="M90 120 L80 300 L70 490"/>
      <rect class="bldg" x="150" y="150" width="110" height="60"/><rect class="bldg" x="350" y="150" width="60" height="58"/><rect class="here" x="226" y="214" width="46" height="46"/>
      <rect class="bldg" x="470" y="160" width="120" height="70"/><rect class="bldg" x="360" y="300" width="50" height="80"/>
      <circle class="pin" cx="470" cy="300" r="4"/><circle class="pin" cx="160" cy="250" r="4"/><circle class="pin" cx="520" cy="140" r="4"/>
      <text x="480" y="304">PLACE 01</text><text x="170" y="254">PLACE 02</text><text x="530" y="144">PLACE 03</text>
      <path class="road thin" d="M250 400 h-40 M210 400 l8 -5 M210 400 l8 5"/><text x="260" y="404">N</text>
    </svg>`;
  const mark = `<svg viewBox="0 0 121 120" aria-label="Logo symbol" data-label="Logo mark — small English wordmark inside a square border"><rect x="1" y="1" width="119" height="118" fill="none" style="stroke: var(--kf-ink)" stroke-width="2"/><rect x="9" y="9" width="103" height="102" fill="none" style="stroke: var(--kf-ink)" stroke-width="1"/><text x="60.5" y="68" text-anchor="middle" font-size="22" font-weight="600" letter-spacing="2" style="font-family: var(--kf-font-display); fill: var(--kf-ink)">clinic</text></svg>`;
  const footCol = (title, href, list, cls = "acc") =>
    `<div class="mk-foot__col ${cls}" data-rv><div class="acc__txt sponly"><a href="${href}">${title}</a><span></span></div>
      <div class="acc__cnt"><ul><li class="mk-sp"><a href="${href}">${ten(title + " First")}</a></li>${list.map(([h, t]) => `<li><a class="mk-soft" href="${h}">${ten(t)}</a></li>`).join("")}</ul></div></div>`;
  MK.footer = () => `
    <div class="mk-foot__rese">${cell("01", "RESERVATIONS", "Online booking")}${cell("02", "CONTACT", "Contact Us")}</div>
    <div class="mk-foot__addr">
      <div class="mk-foot__logo" data-rv><div class="mark">${mark}</div><div class="words" data-label="Hospital logo text"><span class="sub">Rehabilitation medicine · Neurosurgery · Internal medicine</span><span class="name">Your hospital name here</span></div></div>
      <div class="mk-foot__info">
        <div class="mk-foot__txt">
          <div class="mk-foot__cells">
            <div data-rv>
              <div class="mk-foot__row"><div><p>Address</p></div><div><p>〒000-0000<br>Add your address in one line here</p><a href="#" class="mk-ext"><p>Google Map</p></a></div></div>
              <div class="mk-foot__row mk-sp"><div><p>TEL</p></div><div><p>000-000-0000</p></div></div>
              <div class="mk-foot__row mk-sp"><div><p>FAX</p></div><div><p>000-000-0000</p></div></div>
              <div class="mk-foot__row"><div><p>Parking Lot</p></div><div><p>Equipped with 00 units</p><p>For detailed guidance, <a class="normal mk-soft" href="about.html#access">Here</a>From</p></div></div>
            </div>
            <div data-rv>
              <div class="mk-foot__row"><div><p>TEL</p></div><div><p>000-000-0000</p></div></div>
              <div class="mk-foot__row"><div><p>FAX</p></div><div><p>000-000-0000</p></div></div>
            </div>
          </div>
          <div class="mk-foot__time" data-rv>${timetable}</div>
          <div class="mk-foot__notice" data-rv><p>※ Add a one-line notice here about when applications open.<br>※ Add one line of application deadline notice here<br>※ Add one line of temporary closure notice here</p></div>
        </div>
        <figure class="mk-foot__map" data-rv>${map}</figure>
      </div>
    </div>
    <div class="mk-foot__main">
      <div class="mk-foot__left">
        <div class="mk-foot__links">
          ${footCol("About the Hospital", "about.html", aboutSub.map(([h, t]) => ["about.html" + h, t]))}
          ${footCol("Treatment Guide", "#", treatSub)}
          <div class="mk-foot__col each"><ul>${others.map(([h, t]) => `<li data-rv><a class="mk-soft" href="${h}">${t}</a></li>`).join("")}</ul></div>
        </div>
        <a class="mk-soft" href="#">Privacy policy</a>
      </div>
      <div class="mk-foot__right">
        <div data-rv>${tel}</div>
        <div class="mk-foot__bottom">${sns}<a class="mk-soft" href="#">Privacy policy</a><p>© 2023 clinic.</p></div>
      </div>
    </div>`;

  // Smooth scroll — runs the original new Lenis() (1.0.19 defaults) on rAF. Destroyed when the menu opens, created anew when it closes
  const makeLenis = () => {
    if (reduced || !LenisCtor) return;
    MK.lenis = new LenisCtor();
  };
  const killLenis = () => {
    if (MK.lenis) MK.lenis.destroy();
    MK.lenis = null;
  };
  makeLenis();
  const loop = (t) => {
    if (MK.lenis) MK.lenis.raf(t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  MK.scrollTo = (y, opts = {}) => {
    if (MK.lenis) MK.lenis.scrollTo(y, opts);
    else scrollTo(0, typeof y === "number" ? y : y.getBoundingClientRect().top + scrollY + (opts.offset || 0));
  };

  // Menu
  const burger = head && head.querySelector(".mk-burger");
  const setMenu = (on) => {
    head.classList.toggle("is-on", on);
    burger.setAttribute("aria-expanded", on ? "true" : "false");
    burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    if (on) { document.body.style.overflow = "hidden"; killLenis(); }
    else { document.body.style.overflow = ""; if (!MK.lenis) makeLenis(); }
  };
  if (burger) {
    burger.addEventListener("click", () => {
      head.classList.add("is-animating");
      burger.classList.add("is-animating");
      setMenu(!head.classList.contains("is-on"));
      setTimeout(() => { head.classList.remove("is-animating"); burger.classList.remove("is-animating"); }, 1000);
    });
    head.querySelectorAll(".mk-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // Scroll reveal — one ScrollMagic scene per element (once triggered, the scene is removed)
  let smc = null;
  function reveal(box) {
    const els = box.querySelectorAll("[data-rv]:not(.is-fire)");
    if (reduced || !window.ScrollMagic) {
      els.forEach((el) => el.classList.add("is-fire", "is-end"));
      return () => {};
    }
    smc = smc || new ScrollMagic.Controller();
    const timers = [];
    const scenes = [...els].map((el) => {
      const s = new ScrollMagic.Scene({ triggerElement: el, triggerHook: "onEnter", reverse: false, offset: 200 }).addTo(smc);
      s.on("enter", () => {
        el.classList.add("is-fire");
        timers.push(setTimeout(() => el.classList.add("is-end"), 1500));
      });
      return s;
    });
    return () => { scenes.forEach((s) => s.destroy(true)); timers.forEach(clearTimeout); };
  }

  // Fold — original acc: measure content height as (height+1)/window width in vw and animate 0vw ↔ that value (.35s ease). .sponly is phone only
  function accordions(box) {
    const offs = [];
    box.querySelectorAll(".acc__txt").forEach((t) => {
      if (isPC() && t.classList.contains("sponly")) return;
      const cnt = t.previousElementSibling || t.nextElementSibling;
      if (!cnt) return;
      const h = cnt.clientHeight;
      const vw = ((h + 1) / innerWidth) * 100;
      cnt.style.height = "0vw";
      const on = () => {
        const p = t.parentNode;
        p.classList.toggle("is-on");
        cnt.style.height = p.classList.contains("is-on") ? `${vw}vw` : "0vw";
      };
      t.addEventListener("click", on);
      offs.push(() => t.removeEventListener("click", on));
    });
    return () => offs.forEach((f) => f());
  }

  // Side contents — original MoveTo(tolerance = Window height 34.47%, phone 30px, 300ms) and the current section dot
  const pe = () => innerHeight * 0.344673231871;
  function side(box, move) {
    const nav = box.querySelector(".mk-side__nav");
    if (!nav) return () => {};
    const easeOutQuart = (t) => 1 - --t * t * t * t;
    const links = [...box.querySelectorAll('.mk-side a[href^="#"]')];
    const go = (e) => {
      const id = e.currentTarget.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      MK.scrollTo(target, { offset: -(isPC() ? pe() : 30), duration: reduced ? 0 : 0.3, easing: easeOutQuart, immediate: reduced });
    };
    links.forEach((a) => a.addEventListener("click", go));
    const items = nav.querySelectorAll("ul li");
    const secs = box.querySelectorAll(".mk-side__cnt > [id]");
    const spy = () => {
      if (MK.move !== move || !isPC()) return;
      let hit = false;
      secs.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const ok = r.top <= pe() + 1 && r.bottom >= pe() && !hit;
        if (ok) hit = true;
        if (items[i]) items[i].classList.toggle("crnt", ok);
      });
    };
    const t = setTimeout(spy, 500);
    addEventListener("scroll", spy);
    return () => { clearTimeout(t); removeEventListener("scroll", spy); links.forEach((a) => a.removeEventListener("click", go)); };
  }

  // Attached and detached per page body — page scripts register with MK.page(namespace, fn) and fn returns a detach function
  const parts = [];
  MK.page = (ns, fn) => parts.push({ ns, fn });
  let cleanups = [];
  const box = () => document.querySelector('[data-barba="container"]');
  function mount(el) {
    MK.move++;
    const ns = el.dataset.barbaNamespace;
    const foot = el.querySelector('[data-slot="footer"]');
    if (foot && !foot.innerHTML.trim()) { foot.classList.add("mk-foot"); foot.innerHTML = MK.footer(); }
    document.body.dataset.page = ns;
    el.querySelectorAll(".mk-arr:empty").forEach((a) => (a.innerHTML = arrowSvg + arrowSvg));
    el.querySelectorAll("[data-tt]:empty").forEach((a) => (a.innerHTML = timetable));
    const mm = gsap.matchMedia();
    const run = [];
    run.push(accordions(el), side(el, MK.move));
    parts.filter((p) => p.ns === "*" || p.ns === ns).forEach((p) => run.push(p.fn(el, MK.move, mm)));
    run.push(reveal(el));
    cleanups = [...run.filter((f) => typeof f === "function"), () => mm.revert()];
    if (location.hash && location.hash.length > 1) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) scrollTo(0, t.getBoundingClientRect().top + scrollY - (isPC() ? pe() : 30));
    }
  }
  const unmount = () => cleanups.splice(0).forEach((f) => f());

  // Makes Barba fetch the next page’s page css — the original has a single css so this isn’t needed
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    return Promise.all(
      want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
        const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
        l.onload = l.onerror = res;
        document.head.append(l);
      }))
    );
  };
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  const DUR = reduced ? 0 : 500;
  const EASE = "cubicBezier(.17,.67,.48,.92)";
  const wrap = document.querySelector(".mk-wrap");
  const fade = (el, from, to, delay, done, begin) => {
    if (!window.anime || reduced) { el.style.opacity = to; begin && begin(); done && done(); return; }
    anime.timeline().add({ targets: [el], opacity: [from, to], easing: EASE, duration: DUR, delay, begin, complete: done });
  };
  function start() {
    mount(box());
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        timeout: 5000,
        prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")),
        transitions: [
          {
            name: "page-transition",
            sync: true,
            leave(data) {
              const done = this.async();
              data.current.container.classList.add("js-barba__leave");
              wrap.classList.add("js-barba__leave");
              fade(data.current.container, 1, 0, 0, () => {
                data.current.container.classList.remove("js-barba__leave");
                wrap.classList.remove("js-barba__leave");
                done();
                if (data.trigger !== "back" && data.trigger !== "forward") scrollTo(0, 0);
              });
            },
            enter(data) {
              const done = this.async();
              data.next.container.classList.add("js-barba__enter");
              wrap.classList.add("js-barba__enter");
              data.next.container.style.opacity = 0;
              // The original enter tells Barba it’s done at anime’s begin (when the 500ms delay ends)
              fade(data.next.container, 0, 1, DUR, () => {
                data.next.container.classList.remove("js-barba__enter");
                wrap.classList.remove("js-barba__enter");
              }, done);
            },
          },
        ],
      });
      barba.hooks.before(() => unmount());
      barba.hooks.beforeEnter(({ next }) => sheets(next.html));
      barba.hooks.after(({ next }) => mount(next.container));
      return;
    }
    // On file:// barba can’t fetch the next page — wipe the board away with the same curve, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href)) return;
      e.preventDefault();
      fade(box(), 1, 0, 0, () => (location.href = href));
    });
    addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
