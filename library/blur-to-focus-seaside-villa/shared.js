// Inserts the header, drawer, booking band and footer with identical markup on every page, and hooks up blur-in, header color change and photo switching.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Define the gradient only once, somewhere that doesn’t hide — inside a hidden (display:none) header, other logos can’t find that fill
  const GRAD = `<svg class="hm-defs" aria-hidden="true"><defs><linearGradient id="hm-wave-grad" x1="0" x2="1"><stop offset="0" style="stop-color: var(--site-logo-a)"/><stop offset=".55" style="stop-color: var(--site-logo-b)"/><stop offset="1" style="stop-color: var(--site-logo-c)"/></linearGradient></defs></svg>`;
  const WAVE = `<svg viewBox="0 0 124 46" aria-hidden="true"><path class="wave" d="M3 38C12 24 22 12 30 14c8 2-4 26 6 26 10 0 18-34 28-34 9 0-3 30 7 30 10 0 20-30 30-30 8 0 6 14 4 22 6-8 12-14 18-14"/></svg>`;
  const LOGO = (cls = "") => `<span class="hm-logo ${cls}" aria-label="Logo slot">${WAVE}<b>Your name here</b><small>NAME HERE</small></span>`;
  const IG = '<svg viewBox="0 0 21 21" aria-hidden="true"><rect x="1.5" y="1.5" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10.5" cy="10.5" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="15.6" cy="5.4" r="1" fill="currentColor"/></svg>';
  const EXT = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4H4v12h12v-4M11 4h5v5M16 4l-7 7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const NAV = [["index.html", "Home"], ["index.html#about", "About"], ["product.html", "The Stay"], ["index.html#access", "Access"]];

  // Two headers — an always-floating ink header (laid under the hero) and a white header attached to the hero that rises with it
  const HEAD = (cls, attrs, logo) => `
  <header class="hm-head ${cls}" ${attrs}>
    <div class="hm-head__in">
      <a class="hm-head__logo" href="index.html">${LOGO(logo)}</a>
      <div class="hm-head__right">
        <a class="hm-pill" href="#">Book now</a>
        <span class="hm-lang"><span class="is-cur">JP</span>/<a href="#">EN</a></span>
        <button class="hm-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-fx="burger-pass-hover"><span data-fx-part="row"><i></i><i></i></span><span data-fx-part="row"><i></i><i></i></span></button>
      </div>
    </div>
  </header>`;
  document.body.insertAdjacentHTML("afterbegin", `${GRAD}${HEAD("is-fixed", 'data-slot="header"', "is-color")}
  <div class="hm-modal" hidden>
  <div class="hm-veil"></div>
  <div class="hm-modal__canvas">
  <aside class="hm-drawer" data-slot="drawer" aria-label="Menu">
    <button class="hm-drawer__x" type="button" aria-label="Close Menu"><i></i><i></i></button>
    <a class="hm-pill" href="#">Book now</a>
    <ul class="hm-drawer__nav">${NAV.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
    <div class="hm-drawer__map"><p>Your map name here</p><a class="hm-pill is-line" href="#">Map link ${EXT}</a><a class="hm-pill is-line" href="#">PDF ${EXT}</a></div>
    <div class="hm-drawer__meta"><span class="hm-lang"><span class="is-cur">JP</span>/<a href="#">EN</a></span><a class="hm-ig" href="#" aria-label="Social Account">${IG}</a></div>
    <div class="hm-drawer__contact"><p>Stay Inquiries<br><a href="#">Your contact desk name here</a></p><p>Press Inquiries<br>mail@example.com</p></div>
  </aside>
  </div>
  </div>`);

  $$("[data-head-white]").forEach((el) => el.insertAdjacentHTML("afterbegin", HEAD("is-white", 'aria-label="Hero heading"', "")));

  const main = $("main");
  main.insertAdjacentHTML("afterend", `
  <section class="hm-resv" data-slot="reservation-band">
    <div class="wf-img hm-plx" data-fx="center-parallax" data-fx-center-parallax="speed: -0.05; sp: -0.05; max: 10; scale: 1.1; lerp: 0.08" data-label="Exterior of a lit two-story house after sunset · blue evening sky · full-screen landscape"></div>
    <p class="hm-resv__t hm-in">Reservation</p>
    <a class="hm-pill hm-in" style="--d:.6s" href="#">Go to booking</a>
  </section>
  <footer class="hm-foot" data-slot="footer">
    <div class="hm-foot__grid">
      <div class="hm-foot__brand">
        ${LOGO("is-color")}
        <a class="hm-ig" href="#" aria-label="Social Account">${IG}</a>
        <p>Stay Inquiries<br><a href="#">Your contact desk name here</a></p>
        <p>Press Inquiries<br>mail@example.com</p>
      </div>
      <div class="hm-foot__access" id="access">
        <p class="hm-label">Access</p>
        <p>〒000-0000 Your address on one line 00-00</p>
        <div class="hm-foot__row"><span>by Car</span><span>About 0 min from “Interchange 1”<br>About 00 minutes from ”Interchange 2”</span></div>
        <div class="hm-foot__row"><span>by Train</span><span>Nearest station: Line name Station name<br>About 0 min walk from the station (about 000m)</span></div>
        <p class="hm-foot__note">‹From Area 1›<br>Your two or three lines here on transfer routes by train. Total travel time: 0 hours to 0 hours</p>
        <p class="hm-foot__note">‹From Area 2›<br>Your two or three lines here on transfer routes by train. Total travel time: 0 hours to 0 hours</p>
      </div>
      <div class="hm-foot__map" aria-label="Map slot (original is an embedded map)">
        <svg viewBox="0 0 360 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect class="m-land" width="360" height="340"/>
          <path class="m-sea" d="M210 0H360V340H300C290 280 250 250 262 190S300 90 250 40Z"/>
          <g class="m-road" stroke-width="6"><path d="M0 60H240M0 150H250M0 250H290M60 0V340M140 0V340M200 0V340"/></g>
          <g class="m-main" stroke-width="5"><path d="M20 0C30 120 40 220 30 340M0 205H270"/></g>
          <rect class="m-card" x="10" y="12" width="96" height="26" rx="3"/><rect class="m-card-t" x="18" y="21" width="70" height="8"/>
          <g transform="translate(176 172)"><path class="m-pin" d="M0 0C-10-13-15-20-15-28A15 15 0 0 1 15-28C15-20 10-13 0 0Z"/><circle class="m-pin-dot" cy="-28" r="5"/></g>
          <rect class="m-card" x="10" y="300" width="28" height="28"/><circle class="m-card" cx="336" cy="316" r="13"/>
        </svg>
      </div>
      <div class="hm-foot__links">
        <div><p class="hm-label">See a related place</p><div class="hm-rel"><span class="wf-logo">Logo</span><div><p>Your related place intro here<br>Place it in two lines</p><a href="#">Place name ↗</a></div></div></div>
        <div><p class="hm-label">Also see</p><div class="hm-rel"><span class="wf-logo">Logo</span><div><p>Your related group intro here<br>Place it in two lines</p><a href="#">Related group name ↗</a></div></div></div>
      </div>
    </div>
    <div class="hm-foot__bar"><small>©Company name</small><ul><li><a href="#">Operating company ↗</a></li><li><a href="#">Stay Terms</a></li><li><a href="#">Privacy policy</a></li></ul></div>
  </footer>`);

  // ---------- Inertia scroll: Lenis 1.0.19 added by the original — duration 1.2s · 2^(-13t) deceleration, touch uses default scroll (hand multiplier 2) ----------
  const LenisCtor = window.Lenis || window.lenis;
  let lenis = null;
  if (!reduce && LenisCtor) {
    lenis = new LenisCtor({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -13 * t)), smoothTouch: false, touchMultiplier: 2, infinite: false });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- Drawer: a full-screen panel from 100px to the right and transparent over .4s, the back 10% darker ----------
  const burgers = $$(".hm-burger");
  const modal = $(".hm-modal");
  let closing = 0;
  const setDrawer = (open) => {
    clearTimeout(closing);
    if (open) { modal.hidden = false; modal.getBoundingClientRect(); }
    else closing = setTimeout(() => { modal.hidden = true; }, reduce ? 0 : 400);
    document.body.classList.toggle("is-drawer", open);
    document.body.classList.toggle("is-locked", open);
    burgers.forEach((b) => b.setAttribute("aria-expanded", String(open)));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burgers.forEach((b) => b.addEventListener("click", () => setDrawer(true)));
  $(".hm-drawer__x").addEventListener("click", () => setDrawer(false));
  $(".hm-veil").addEventListener("click", () => setDrawer(false));
  $$(".hm-drawer a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });

  // ---------- Blur-in appearance: once when visible ----------
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.batch(".hm-in", { start: "top 90%", once: true, onEnter: (els) => els.forEach((el) => el.classList.add("is-on")) });
  });
  if (reduce) $$(".hm-in").forEach((el) => el.classList.add("is-on"));

  // ---------- Photo slider (feature card row · room photos): original carousel, pushes one slot at a time over 1s cubic-bezier(.58,.21,.41,.96),
  // When all are pushed, move the first slide to the end to loop endlessly. Auto advances to the next cell every data-autoplay seconds (pressing restarts the count) ----------
  $$("[data-carousel]").forEach((box) => {
    const track = $(".hm-car__track", box);
    if (!track || track.children.length < 2) return;
    const wrap = box.closest("[data-carousel-wrap]") || box;
    const every = Number(box.dataset.autoplay) || 0;
    // one (room photos) — like the original, the previous slide is pre-set on the left (hidden cell) and pushed 0 → ∓one cell both forward and back. Needs three or more photos
    const pre = box.dataset.carousel === "one" && track.children.length > 2;
    const EASE = "cubic-bezier(0.58, 0.21, 0.41, 0.96)";
    let busy = false, timer = 0;
    if (pre) { track.prepend(track.lastElementChild); track.style.width = "100%"; track.style.marginLeft = "-100%"; }
    const step = () => {
      const [a, b] = track.children;
      return b.getBoundingClientRect().left - a.getBoundingClientRect().left;
    };
    const settle = (dir) => {
      if (dir > 0) track.append(track.firstElementChild);
      else if (pre) track.prepend(track.lastElementChild);
      track.style.transition = "none";
      track.style.transform = "translateX(0px)";
      busy = false;
    };
    const go = (dir) => {
      if (busy) return;
      busy = true;
      const w = step();
      if (dir < 0 && !pre) {
        track.prepend(track.lastElementChild);
        track.style.transition = "none";
        track.style.transform = `translateX(${-w}px)`;
        track.getBoundingClientRect();
      }
      if (reduce) return settle(dir);
      track.style.transition = `transform 1s ${EASE}`;
      track.style.transform = `translateX(${dir > 0 ? -w : pre ? w : 0}px)`;
      const end = (e) => { if (e && e.target !== track) return; track.removeEventListener("transitionend", end); clearTimeout(safety); settle(dir); };
      const safety = setTimeout(end, 1200);
      track.addEventListener("transitionend", end);
    };
    const restart = () => { clearInterval(timer); if (every && !reduce) timer = setInterval(() => go(1), every * 1000); };
    $$("[data-dir]", wrap).forEach((b) => b.addEventListener("click", () => { go(Number(b.dataset.dir)); restart(); }));
    restart();
  });
})();
