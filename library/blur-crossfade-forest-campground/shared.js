// Spanning multiple pages — hamburger · drawer · right sticky (booking tab · nature sound) · footer · constellation pattern · video window · same-page anchor move.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BAR = '<span class="fc-bar"><span></span><span></span><span></span><span></span></span>';
  const WAVE = '<span class="fc-wave"><i></i><i></i><i></i><i></i></span>';
  // Constellation — decoration of a few dots joined by thin lines (in place of the original star.svg). Same shape for each seed
  const star = (seed, n = 9) => {
    let s = seed;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pts = Array.from({ length: n }, () => [10 + r() * 280, 10 + r() * 180]);
    const lines = pts.slice(1).map((p, i) => `<line x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}"/>`).join("");
    const dots = pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i % 3 ? 1.6 : 3}"/>`).join("");
    return `<svg viewBox="0 0 300 200" aria-hidden="true"><g stroke="currentColor" stroke-width=".6" fill="none">${lines}</g><g fill="currentColor">${dots}</g></svg>`;
  };
  window.fcStar = star;
  document.querySelectorAll("[data-fc-star]").forEach((el) => { el.innerHTML = star(+el.dataset.fcStar || 7); });

  const LOGO = (cls = "") => `<div class="fc-logo ${cls}" data-label="Vertical logo (three-line Japanese name + English facility name)"><span class="ja">In the forest</span><span class="ja">Camp</span><span class="no">Of</span><span class="ja">Site</span><span class="en">FOREST BASE NAME</span></div>`;
  document.querySelectorAll("[data-fc-logo]").forEach((el) => { el.innerHTML = LOGO(); });
  const NAV = `<div class="wrap">
      <ul class="list">
        <li class="fc-fade"><a href="index.html">Home</a></li>
        <li class="fc-fade"><a href="facility.html">About the Facility</a></li>
        <ul class="list-child">
          <li class="fc-fade"><a href="facility.html#genkan">Forest Entrance (Reception)</a></li><li class="fc-fade"><a href="facility.html#manabiya">The forest classroom</a></li><li class="fc-fade"><a href="facility.html#daidoko">Forest Kitchen</a></li><li class="fc-fade"><a href="facility.html#stay">Stay · Rates</a></li><li class="fc-fade"><a href="facility.html#fieldmap">Field map</a></li><li class="fc-fade"><a href="facility.html#rental">Items to borrow</a></li>
        </ul>
      </ul>
      <ul class="list">
        <li class="fc-fade"><a href="#">Nearby Sightseeing</a></li><li class="fc-fade"><a href="#">Directions</a></li><li class="fc-fade"><a href="news.html">Latest news</a></li><li class="fc-fade"><a href="#">Frequently asked questions</a></li><li class="fc-fade"><a href="#">Inquiry</a></li>
      </ul>
    </div>`;
  const INFO = `<a class="fc-btn fc-hov is-gold is-medium" href="#"><span>Book camping · BBQ</span>${BAR}</a>
      <a class="fc-btn fc-hov is-gold is-medium" href="#"><span>Book the thatched house · cottage</span>${BAR}</a>
      <a class="fc-btn fc-hov is-ghost is-small" href="#"><span>Group booking form is here</span>${BAR}</a>
      <div class="tel-block"><p class="tel-lead">Book by phone here</p><div class="tel"><b><span>TEL</span><a class="fc-tellink" href="#">0000-00-0000</a></b><small>FAX 0000-00-0000</small></div>
      <ul class="hours"><li>Business hours : 9:30~17:00</li><li>Phone support: 9:00~17:00 Online booking 24 hours</li></ul></div>
      <div class="address"><p>Facility Name</p><p>〒000-0000 Area name Town name 00-0</p></div>
      <div class="social"><a class="fc-fade" href="#">Official Instagram</a><a class="fc-fade" href="#">Google Maps</a></div>`;
  const NAV02 = '<a class="fc-fade" href="about.html">Company overview</a><a class="fc-fade" href="#">Terms of service</a><a class="fc-fade" href="#">Privacy policy</a><a class="fc-fade" href="#">Operating company name</a>';

  // ── Hamburger · drawer ──
  const burger = document.createElement("button");
  burger.className = "fc-burger";
  burger.type = "button";
  burger.setAttribute("aria-label", "Menu");
  burger.innerHTML = '<span class="bar"></span>';
  const drawer = document.createElement("nav");
  drawer.className = "fc-drawer";
  drawer.setAttribute("data-slot", "menu-drawer");
  drawer.innerHTML = `<div class="fc-drawer__container">
      <div class="fc-drawer__sub"><div class="wf-img" data-label="Forest tent site photo · dusk · full portrait"></div></div>
      <div class="fc-drawer__main">
        <figure class="fc-star">${star(11)}</figure>
        <a class="fc-drawer__logo" href="index.html" style="font-size:44px">${LOGO()}</a>
        <div class="fc-drawer__body">
          <div class="fc-nav01">${NAV}<div class="fc-nav02">${NAV02}</div></div>
          <div class="fc-info">${INFO}</div>
        </div>
        <div class="fc-drawer__bottom"><small>© 0000 FOREST BASE NAME facility name</small></div>
      </div>
    </div>`;
  body.append(drawer, burger);
  const toggle = (open) => { burger.classList.toggle("open", open); drawer.classList.toggle("is-act", open); };
  burger.addEventListener("click", () => toggle(!drawer.classList.contains("is-act")));

  // ── Right pinned ──
  const fixed = document.createElement("div");
  fixed.className = "fc-fixed";
  fixed.innerHTML = `<a class="fc-reserve-tab" href="index.html#reserve">Reservation</a>
    <button class="fc-nature fc-hov fc-en" type="button" data-fc-sound="nature"><span class="text" data-fc-sound-text>Nature sound OFF</span><span class="snd" data-fc-sound-bar>${BAR}</span></button>`;
  body.append(fixed);

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("fc-foot");
    foot.innerHTML = `<div class="fc-foot__container">
      <div class="fc-foot__body">
        <a class="fc-foot__logo" href="index.html">${LOGO()}</a>
        <div class="fc-foot__nav fc-nav01">${NAV}
          <ul class="fc-foot__links"><li class="fc-fade"><a href="#"><div class="wf-img" data-label="Parent company banner · logo on white background · landscape 240:72"></div></a></li><li class="fc-fade"><a href="#"><div class="wf-img" data-label="Sister campground banner · logo over photo · wide 240:72"></div></a></li></ul>
        </div>
        <div class="fc-info">${INFO}</div>
      </div>
      <div class="fc-foot__bottom"><div class="fc-foot__nav02">${NAV02}</div><small>© 0000 FOREST BASE NAME facility name</small></div>
    </div>`;
  }

  // ── Sound button — pressing switches the label to ON/OFF and the bars to a wave (the original raises and lowers video and forest sound over .5s) ──
  const sounds = {};
  const setSound = (key, on) => {
    sounds[key] = on;
    document.querySelectorAll(`[data-fc-sound="${key}"]`).forEach((b) => {
      const t = b.querySelector("[data-fc-sound-text]");
      if (t) t.textContent = t.textContent.replace(/ (ON|OFF)$/, on ? " ON" : " OFF");
      const bar = b.querySelector("[data-fc-sound-bar]");
      if (bar) bar.innerHTML = on ? WAVE : BAR;
    });
    const media = document.querySelector(`[data-fc-media="${key}"]`);
    if (media) media.muted = !on;
    if (key === "nature") localStorage.setItem("fc-nature-on", on ? "true" : "false");
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fc-sound]");
    if (b) setSound(b.dataset.fcSound, !sounds[b.dataset.fcSound]);
  });
  if (localStorage.getItem("fc-nature-on") === "true") setSound("nature", true);

  // ── Same-page anchors — 400ms swing (jQuery default curve .5 − cos(πp)/2) ──
  const swingTo = (y) => {
    if (reduce) return scrollTo(0, y);
    const y0 = scrollY, t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / 400); scrollTo(0, y0 + (y - y0) * (0.5 - Math.cos(p * Math.PI) / 2)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  window.fcSwingTo = swingTo;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = url.hash === "#" ? document.documentElement : document.querySelector(url.hash);
    if (!t) return;
    e.preventDefault();
    const inDrawer = a.closest(".fc-drawer");
    swingTo(t.getBoundingClientRect().top + scrollY);
    if (inDrawer) setTimeout(() => toggle(false), 400);
  });

  // ── View video · photo larger ──
  const lb = document.createElement("div");
  lb.className = "fc-lightbox";
  lb.setAttribute("data-slot", "lightbox");
  lb.innerHTML = '<button class="fc-lightbox__close" type="button" aria-label="Close">×</button><div class="fc-lightbox__box"><div class="wf-img wf-video" data-label=""></div></div>';
  body.append(lb);
  const close = () => lb.classList.remove("is-open");
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-fc-lightbox]");
    if (t) {
      e.preventDefault();
      lb.classList.toggle("is-tall", t.dataset.ratio === "9:16");
      lb.querySelector(".wf-img").dataset.label = t.dataset.fcLightbox;
      lb.querySelector(".wf-img").classList.toggle("wf-video", t.dataset.kind !== "image");
      lb.classList.add("is-open");
    } else if (e.target === lb || e.target.closest(".fc-lightbox__close")) close();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { close(); toggle(false); } });
})();
