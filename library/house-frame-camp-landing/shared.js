// Common to all pages: draws in the top news strip, header, corner menu panel (corner-blob-menu part), waves, booking button and footer, and hooks up the motion.
// Original values: news strip every 3s (exit y −30 .4s power2.out, enter y 30→0 .6s power2.out) · once the header’s top edge passes above the screen, the menu button and yellow blob are pinned
// · the booking button disappears when the footer’s top edge reaches the bottom of the screen (toggleActions play pause pause reverse) · movement within a section 1600ms cubic curve.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  // Colors made by rotating the accent color (oklch) transition via oklab, so curve and length differ from the original (hex, blended in sRGB) — freeze the fully read values as rgb
  (() => {
    const root = document.documentElement, cs = getComputedStyle(root);
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    for (const n of ["--site-yellow", "--site-yellow-soft", "--site-sky", "--site-leaf", "--site-peach", "--site-night", "--site-veil", "--site-ticker-hover"]) {
      const v = cs.getPropertyValue(n).trim();
      if (!v) continue;
      g.clearRect(0, 0, 1, 1); g.fillStyle = v; g.fillRect(0, 0, 1, 1);
      const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data;
      root.style.setProperty(n, `rgb(${r} ${gg} ${b} / ${+(a / 255).toFixed(3)})`);
    }
  })();
  const KC = (window.KC = {});
  const arrow = '<svg viewBox="0 0 16 12"><path d="M1 6h13M9.5 1.5 14 6l-4.5 4.5"/></svg>';
  // Placeholder symbol newly drawn in the same spot and size instead of the original logo (a frog in a tent)
  const logo = '<svg class="kc-ill" viewBox="0 0 64 44" aria-hidden="true"><path class="y" d="M32 2 4 42h56z"/><path class="g" d="M32 2 18 42h28z"/><circle class="w" cx="27" cy="30" r="4"/><circle class="w" cx="37" cy="30" r="4"/><circle class="k" cx="27" cy="30" r="1.8"/><circle class="k" cx="37" cy="30" r="1.8"/></svg>';
  // Frog — a simple frog placed in the same spot instead of the original character art
  const frog = (cls = "") => `<svg class="kc-ill ${cls}" viewBox="0 0 80 90" aria-hidden="true"><ellipse class="g" cx="40" cy="58" rx="26" ry="28"/><ellipse class="l" cx="40" cy="64" rx="15" ry="18"/><circle class="g" cx="27" cy="26" r="12"/><circle class="g" cx="53" cy="26" r="12"/><circle class="w" cx="27" cy="25" r="7"/><circle class="w" cx="53" cy="25" r="7"/><circle class="k" cx="28" cy="26" r="3.4"/><circle class="k" cx="52" cy="26" r="3.4"/><path class="ln" d="M32 44q8 6 16 0"/></svg>`;
  KC.arrow = arrow; KC.frog = frog; KC.logo = logo;
  const navItems = [["news.html", "Notices·Events"], ["page.html", "For first-time visitors"], ["#", "Campsites · Rates"], ["#", "Facilities, rentals, shop"], ["#", "How to enjoy"], ["#", "Directions · Sightseeing"]];

  const tick = document.createElement("div");
  tick.className = "kc-ticker";
  tick.setAttribute("data-slot", "ticker");
  tick.innerHTML = `<div class="kc-ticker__in">
    <a class="kc-ticker__link" href="article.html">Your first news line here — event calendar now open</a>
    <a class="kc-ticker__link" href="news.html">Second news line — staff recruitment notice</a>
    <a class="kc-ticker__link" href="news.html">Your third news line here — new sauna area opens</a></div>`;
  document.body.prepend(tick);

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("kc-head");
    head.innerHTML = `
      <div class="kc-deco kc-deco--01" aria-hidden="true"><svg viewBox="0 0 512 420"><path class="b1" d="M60 40C180-30 400 10 470 140s-20 260-160 270S40 340 20 220 -10 90 60 40z"/></svg></div>
      <div class="kc-deco kc-deco--02" aria-hidden="true"><svg viewBox="0 0 671 520"><path class="b2" d="M120 60C260-20 520 0 620 120s40 300-120 360-330 40-420-60S-20 140 120 60z"/></svg></div>
      <div class="kc-head__in">
        <a class="kc-logo" href="index.html" aria-label="First Page">${logo}<span data-label="Top line: regional name in English · bottom line: campsite name">Place Name<br>Campsite Name</span></a>
        <nav class="kc-nav" aria-label="Main menu"><ul>${navItems.map(([h, t]) => `<li><a class="kc-nav__link" href="${h}">${t}</a></li>`).join("")}</ul></nav>
      </div>
      <div class="kc-menu" data-fx="corner-blob-menu" data-fx-corner-blob-menu="dur: .5; close: .9; delay: .4">
        <button class="kc-burger" type="button" aria-label="Menu" data-fx-part="toggle"><span class="line"></span><span class="line"></span></button>
        <nav class="kc-modal" aria-label="Full menu" data-slot="menu-drawer">
          <div class="kc-modal__bg" data-fx-part="bg"><svg viewBox="0 0 1029 1016" aria-hidden="true"><path d="M1029 0v1016c-160-46-300 22-470-46S240 790 150 632 -20 294 60 136 160 0 300 0z"/></svg></div>
          <div class="kc-modal__in" data-fx-part="panel">
            <ul class="kc-modal__list">
              <li><a class="kc-modal__link" href="index.html">First Page</a></li><li><a href="about.html">About the Campsite</a></li>
              <li><a href="news.html">Notices·Events</a></li><li><a href="page.html">For first-time visitors</a></li>
              <li><a href="#">Campsites · Rates</a></li><li><a href="#">Facilities, rentals, shop</a></li>
              <li><a href="#">How to enjoy</a></li><li><a href="#">Directions · Sightseeing</a></li>
              <li><a href="#">Event calendar</a></li>
            </ul>
            <ul class="kc-modal__list02"><li><a href="#">Usage rules</a></li><li><a href="#">Frequently asked questions</a></li><li><a href="#">Inquiry</a></li></ul>
            <div class="kc-modal__banner"><a class="is-access" href="#">${frog()}Directions</a><a class="is-reserve" href="#">${frog()}Book now</a></div>
          </div>
        </nav>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("kc-foot");
    foot.innerHTML = `<svg class="kc-wave kc-foot__wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90V40C240 0 420 70 720 46S1200 -10 1440 30V90z"/></svg>
      <div class="kc-foot__body">
        <div class="kc-foot__photo"><div class="wf-img" data-label="Night campsite · tent light and car · landscape strip"></div></div>
        <div class="kc-wrap">
          <div class="kc-foot__row">
            <div>
              <p class="kc-foot__name">Your campground name here</p>
              <p class="kc-foot__info">〒000-0000 One line of your address here<br>Check-in / 00:00~00:00 (camp spot)<br>Check-out / ~00:00 (camp site)</p>
              <a class="kc-foot__tel" href="#">000-000-0000</a>
              <div class="kc-foot__btns"><a class="kc-btn" href="#"><span class="label">Directions</span>${arrow}</a><a class="kc-btn is-yellow" href="#"><span class="label">Book now</span>${arrow}</a></div>
            </div>
            <nav class="kc-foot__nav" aria-label="Bottom Menu">
              <a class="kc-foot__link" href="index.html">First Page</a><a class="kc-foot__link" href="about.html">About the Campsite</a><a class="kc-foot__link" href="news.html">Notices·Events</a><a class="kc-foot__link" href="page.html">For first-time visitors</a>
              <a class="kc-foot__link" href="#">Campsites · Rates</a><a class="kc-foot__link" href="#">Facilities, rentals, shop</a><a class="kc-foot__link" href="#">How to enjoy</a><a class="kc-foot__link" href="#">Directions · Sightseeing</a><a class="kc-foot__link" href="#">Event calendar</a>
              <p class="sub"><a class="kc-foot__sub" href="#">Usage rules</a><a class="kc-foot__sub" href="#">Frequently asked questions</a><a class="kc-foot__sub" href="#">Inquiry</a><a class="kc-foot__sub" href="#">Pricing Info</a></p>
            <div class="kc-foot__sns"><a class="kc-foot__sns-link" href="#" aria-label="Brand"><svg viewBox="0 0 24 24"><g><circle cx="12" cy="12" r="12"/><path transform="translate(2.4 2.4) scale(.8)" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></g></svg></a><a class="kc-foot__sns-link" href="#" aria-label="Social Media"><svg viewBox="0 0 24 24"><g><circle cx="12" cy="12" r="12"/><path transform="translate(2.4 2.4) scale(.8)" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></g></svg></a></div>
            </nav>
          </div>
          <div class="kc-foot__foot"><p>Operated by: Company name here | Privacy Policy</p><p data-label="Your campground English name here">© Campground Name</p></div>
        </div>
        <a class="kc-pagetop" href="#top" aria-label="Back to top">${frog()}<span>Pagetop!</span></a>
      </div>`;
    foot.insertAdjacentHTML("afterend", `<a class="kc-reserve" href="#" data-slot="reserve-button"><span class="kc-reserve__ill">${frog()}</span><span class="kc-reserve__ja">Book now</span><span class="kc-reserve__en kc-en">Reserve</span></a>`);
  }

  // News strip
  const items = [...tick.querySelectorAll("a")];
  let cur = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach((a, i) => (a.style.display = i ? "none" : "flex"));
  if (!reduce) setInterval(() => {
    const prev = items[cur]; cur = (cur + 1) % items.length; const next = items[cur];
    gsap.to(prev, { duration: 0.4, y: -30, opacity: 0, ease: "power2.out", onComplete: () => {
      prev.style.display = "none";
      gsap.set(next, { y: 30, opacity: 0 }); next.style.display = "flex";
      gsap.to(next, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" });
    } });
  }, 3000);

  if (head) ScrollTrigger.create({ trigger: head, start: "top 0", end: "bottom 0",
    onEnter: () => head.classList.add("is-scrolled"), onLeaveBack: () => head.classList.remove("is-scrolled") });

  const reserve = document.querySelector(".kc-reserve");
  if (reserve && foot && !reduce) gsap.timeline({ scrollTrigger: { trigger: foot, start: "top bottom", toggleActions: "play pause pause reverse" } })
    .fromTo(reserve, { autoAlpha: 1 }, { autoAlpha: 0 });

  // Movement within a section — original 1600ms, cubic curve at both ends
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => a.addEventListener("click", (e) => {
    const to = a.getAttribute("href") === "#top" ? document.body : document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const from = scrollY, target = to === document.body ? 0 : to.getBoundingClientRect().top + scrollY;
    if (reduce) return scrollTo(0, target);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
    const t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / 1600); scrollTo(0, from + (target - from) * ease(p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));

  // The original sets is-loaded as soon as the script runs — logo·menu·blob·booking button come in with fixed delays
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));
})();
