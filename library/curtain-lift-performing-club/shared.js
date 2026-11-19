// Shared fixed header (wordmark · two-line button) · bottom-right triangle ”Show Info” button · yellow spotlight contact panel · copyright line · and the rough-edge filter
// Draws into the placeholder (data-nm). The part (fx-core) scans [data-fx] after DOMContentLoaded, so this plain script at the end of the body draws first.
(() => {
  const page = document.body.dataset.page || "home";
  const home = page === "home";
  const fill = (key, html) => document.querySelectorAll(`[data-nm="${key}"]`).forEach((el) => { el.outerHTML = html; });

  // Rough spray-like edges of the yellow light and photo circle — scatters edge pixels with fine noise (in the original it is the edge of an image file)
  document.body.insertAdjacentHTML("afterbegin", `
<svg class="nm-defs" aria-hidden="true" focusable="false">
  <filter id="nm-grain" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="nm-paper" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="4" result="t"/>
    <feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 0.62" result="sp"/>
    <feComposite in="sp" in2="SourceGraphic" operator="in" result="c"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="c"/></feMerge>
  </filter>
</svg>`);

  // Two lighting Lottie files — circles with the same panel size, frames and keyframes (curves .167/.833) as the original scene. The fill color is covered by the skin (look: tint).
  // Inline in the document instead of a JSON file so it runs even when opened as a file <script type="application/json"> Baked into
  const ease = { o: { x: [0.167], y: [0.167] }, i: { x: [0.833], y: [0.833] } };
  const st = (k) => ({ a: 0, k });
  const kf = (pairs) => ({ a: 1, k: pairs.map(([t, s], n) => ({ t, s: [].concat(s), ...(n < pairs.length - 1 ? ease : {}) })) });
  const disc = (ind, p, s, o) => ({
    ddd: 0, ind, ty: 4, sr: 1, ao: 0, bm: 0, ip: 0, op: 150, st: 0, ks: { a: st([0, 0]), p, s, r: st(0), o },
    shapes: [{ ty: "gr", it: [{ ty: "el", d: 1, p: st([0, 0]), s: st([1000, 1000]) }, { ty: "fl", c: st([0.5, 0.5, 0.5, 1]), o: st(100), r: 1 }, { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100) }] }],
  });
  const comp = (w, h, op, layers) => ({ v: "5.7.0", fr: 30, ip: 0, op, w, h, ddd: 0, assets: [], layers });
  const SPOTS = {
    "nm-spot-intro": comp(1000, 1000, 60, [disc(1, st([500, 500]), kf([[9, [0, 0, 100]], [34, [100, 100, 100]]]), st(100))]),
    "nm-spot-contact": comp(1900, 1050, 150, [
      disc(1, kf([[29, [2355, 310, 0]], [59, [1165, 510, 0]]]), st([80.37, 80.37, 100]), kf([[29, 0], [59, 100]])),
      disc(2, kf([[29, [-395, 710, 0]], [59, [745, 550, 0]]]), st([80.78, 80.78, 100]), kf([[29, 0], [59, 100]])),
    ]),
  };
  Object.entries(SPOTS).forEach(([id, data]) => document.body.insertAdjacentHTML("beforeend", `<script type="application/json" id="${id}">${JSON.stringify(data)}</script>`));

  // Header — the original is a wordmark image (three thin geometric italic lines + one school name line). Letters are spread to fit the original line width (textLength)
  const logo = `<svg class="nm-logo" viewBox="0 0 249 150" role="img" aria-label="Your organization English wordmark in three lines and the organization name in one line" data-label="Group English wordmark — three lines, each line stretched to the original width">
    <text class="nm-logo__word" x="4" y="16.5" textLength="86" lengthAdjust="spacing">THE</text>
    <text class="nm-logo__word" x="3" y="65" textLength="246" lengthAdjust="spacing">ENSEMBLE</text>
    <text class="nm-logo__word" x="4" y="113.5" textLength="120" lengthAdjust="spacing">CLUB</text>
    <text class="nm-logo__sub" x="0" y="148" textLength="208" lengthAdjust="spacing">Your school and department name in one line</text>
  </svg>`;
  const MENU = [["index.html#about", "About"], ["index.html#schedule", "Schedule"], ["news.html", "News"], ["#contact", "Contact"]];
  fill("chrome", `
<header class="nm-head fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="at: 100" data-slot="header">
  <a class="nm-head__logo" href="index.html" aria-label="First Page">${logo}</a>
  <div class="nm-menu" data-fx="fade-slide-drawer" data-fx-fade-slide-drawer="shift: 0; delay: 0; wait: 0; fade: 0.4; dur: 0.4" data-slot="menu-modal">
    <button class="nm-head__burger" data-fx-part="toggle" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button>
    <div data-fx-part="layer">
      <nav class="nm-menu__panel" data-fx-part="panel" aria-label="Menu">
        <a class="nm-head__logo nm-menu__logo" href="index.html" aria-label="First Page">${logo}</a>
        <button class="nm-menu__close" data-fx-part="close" aria-label="Close Menu"><svg viewBox="0 0 51 51" aria-hidden="true"><path d="M25.5 0v51M0 25.5h51"/></svg></button>
        <ul class="nm-menu__list" data-label="Menu English name — thin slanted italic">${MENU.map(([h, t]) => `<li><a class="nm-script" href="${h}">${t}</a></li>`).join("")}</ul>
      </nav>
    </div>
  </div>
</header>
<a class="nm-tri fx-studio-appear-wait" href="news.html" data-fx="studio-appear" data-fx-studio-appear="at: 100" data-slot="schedule-badge" aria-label="Performance Info">
  <svg viewBox="0 0 141 140" aria-hidden="true"><path class="nm-tri__edge" d="M2 138.5 139.5 1.5v137Z"/><text class="nm-tri__txt" x="76" y="88">Performance</text><text class="nm-tri__txt" x="76" y="121">Info</text></svg>
</a>`);

  // Contact board — two lights come in from both sides and brighten as they overlap (scroll-bound Lottie), and the phone uses a single overlapped light image
  fill("contact", `
<footer class="nm-foot" data-slot="footer">
  <section class="nm-contact" id="contact" data-slot="contact-spotlights">
    <div class="nm-contact__spots" data-fx="lottie-scroll-seek" data-fx-lottie-scroll-seek="src: #nm-spot-contact; look: tint" aria-hidden="true"></div>
    <div class="nm-contact__still" aria-hidden="true"><i></i><i></i></div>
    <div class="nm-contact__body">
      <div class="nm-contact__head">
        <h2 class="nm-script nm-contact__title" data-label="Section name in English — slanted thin italic">Contact</h2>
        <p class="nm-contact__text">For performance or parade requests,<br>Club visits, consultations, and more<br>Feel free to contact us.</p>
      </div>
      <a class="nm-pill" href="#contact"><svg viewBox="0 0 274 77" aria-hidden="true"><path d="M10 4C70 9 204 9 264 4c-12 22-12 47 0 69-60-5-194-5-254 0 12-22 12-47 0-69Z"/></svg><span>To the contact form</span></a>
    </div>
  </section>
  <p class="nm-copy">© 0000-0000 Organization Name all rights reserved.</p>
</footer>`);

  // Hand-drawn ”MORE” frame — a thin white line rectangle with concave sides (original art)
  document.querySelectorAll("[data-nm-more]").forEach((a) => a.insertAdjacentHTML("afterbegin",
    '<svg class="nm-more__frame" viewBox="0 0 164 61" aria-hidden="true" preserveAspectRatio="none"><path d="M3 3.5C40 1.5 124 1.5 161 3.5c-9 17-9 37 0 54-37 2-121 2-158 0 9-17 9-37 0-54Z"/><path d="M1 5.5c45-3 117-3 162 0M1 55.5c45 3 117 3 162 0"/></svg>'));
  // News list row — date · vertical tick · title (sometimes two lines)
  document.querySelectorAll("[data-nm-rows]").forEach((box) => {
    const n = +box.dataset.nmRows || 8;
    box.innerHTML = Array.from({ length: n }, (_, k) => `<a class="nm-row" href="article.html"><span class="nm-row__in"><span class="nm-row__cell nm-row__date">0000/00/00</span><i class="nm-row__bar"></i><span class="nm-row__cell nm-row__title">${k % 7 === 5 ? "Your slightly long news title here, written long enough to wrap onto two lines." : k % 3 === 1 ? "Your news title here" : "Your news title in a single line goes here"}</span></span><i class="nm-row__rule"></i></a>`).join("") + '<i class="nm-list__mask"></i>';
  });
  // Thin cross ornament
  document.querySelectorAll("[data-nm-cross]").forEach((c) => {
    c.innerHTML = c.dataset.nmCross === "tall"
      ? '<svg viewBox="0 0 36 65" aria-hidden="true"><path d="M18 0v65M0 32.5h36"/></svg>'
      : '<svg viewBox="0 0 51 51" aria-hidden="true"><path d="M25.5 0v51M0 25.5h51"/></svg>';
  });

  // Header and triangle button reveal — first page 3 seconds after the loading curtain lifts (3.5 on phone), subpages after 1 second, brightening over 1 second (brand symbol .appear)
  const head = document.querySelector(".nm-head"), tri = document.querySelector(".nm-tri");
  const narrow = matchMedia("(max-width: 690px)").matches;
  head?.style.setProperty("--fx-delay", home ? (narrow ? "3.5s" : "3s") : "1s");
  tri?.style.setProperty("--fx-delay", narrow ? "3.5s" : "3s");
  tri?.style.setProperty("--fx-dur", narrow ? ".5s" : ".3s");

  // Page transition — section change: 95ms after the press the body goes transparent over .3s (header and triangle buttons stay) and the new section body turns on over .3s
  const root = document.documentElement;
  if (sessionStorage.getItem("nm-nav")) { sessionStorage.removeItem("nm-nav"); root.classList.add("nm-enter"); }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.origin !== location.origin || a.pathname === location.pathname) return;
    e.preventDefault();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { location.href = a.href; return; }
    sessionStorage.setItem("nm-nav", "1");
    setTimeout(() => root.classList.add("nm-leave"), 95);
    setTimeout(() => { location.href = a.href; }, 395);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("nm-leave"); });
})();
