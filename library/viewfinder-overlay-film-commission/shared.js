// Common to all pages: draws in the header band, drawer, footer and viewfinder, and hooks up header band drop-down, drawer open/close, band stroke, parallax photo and link-line return.
// Original values: header bar .5s ease (once scrolling stops for 200ms after leaving the Hero) · drawer clipped face .5s · line draw .5s cubic-bezier(.86,0,.07,1) (15% before the bottom of the screen) ·
// Parallax translateY = Over the element × speed (half on phones) · the link underline returns to the left .7s after the pointer leaves.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.toggle("is-home", page === "home");

  const arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 6h9M6.5 2.5 10 6 6.5 9.5"/></svg>';
  // Original film reel mark spot, our square and circle mark of the same size
  const mark = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="6" width="26" height="6" fill="currentColor"/><rect x="12" y="6" width="6" height="30" fill="currentColor"/><circle cx="29" cy="26" r="9" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="29" cy="26" r="2.5" fill="currentColor"/></svg>';
  const word = "MYCITY<br>FILM<br>COMMISSION";
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  window.TF = { arrow, mark, reduce };
  const fill = () => document.querySelectorAll(".tf-btn__icon").forEach((n) => { if (!n.firstElementChild) n.innerHTML = `<i class="tf-btn__bg">${arrow}</i>`; });
  window.TF.fill = fill;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("tf-head");
    head.innerHTML = `
      <a class="tf-logo" href="index.html" aria-label="First Page">${mark}<span>${word}</span></a>
      <div class="tf-menu">
        <div class="tf-menu__item"><p class="tf-label is-small"><span>Dear creators</span></p><div class="tf-gnav"><a href="#"><span>Shoot support · consultation</span></a><a href="#"><span>Location search</span></a><a href="#"><span>Meals · Lodging</span></a></div></div>
        <div class="tf-menu__item"><p class="tf-label is-small"><span>Dear Citizens</span></p><div class="tf-gnav"><a href="#"><span>Location Scouting & Extras Registration</span></a></div></div>
        <div class="tf-menu__item"><div class="tf-gnav"><a href="works.html"${cur("works")}><span>Key support record</span></a></div></div>
      </div>
      <button class="tf-burger" type="button" aria-label="Open and close menu" aria-expanded="false"><i></i></button>
      <nav class="tf-drawer" aria-label="Full menu"><div class="tf-drawer__in">
        <div class="tf-drawer__group"><p class="tf-label"><span>Dear creators</span></p><ul class="tf-mlist">
          ${[["SHOOTING SUPPORT", "Shoot support · consultation", "Shoot scene with camera in hand · small square"], ["LOCATION SEARCH", "Location search", "City view · small square"], ["MEAL & STAY", "Meals · Lodging", "Restaurant dish · small square"]].map(([e, j, l]) => `<li><a class="tf-mlink" href="#"><div class="wf-img" data-label="${l}"></div><span><small>${e}</small><b>${j}</b></span></a></li>`).join("")}
        </ul></div>
        <div class="tf-drawer__group"><p class="tf-label"><span>Dear Citizens</span></p><ul class="tf-mlist">
          ${[["LOCATION REGISTRATION", "Brand registration", "Building exterior · small square"], ["EXTRAS REGISTRATION", "Extras sign-up", "People on the street · Small square"]].map(([e, j, l]) => `<li><a class="tf-mlink" href="#"><div class="wf-img" data-label="${l}"></div><span><small>${e}</small><b>${j}</b></span></a></li>`).join("")}
        </ul></div>
        <div class="tf-drawer__group tf-drawer__last"><a href="works.html">Key support record</a><a href="news.html">News</a>
          <div class="tf-cv"><a href="#"><small>FLOW</small><span>Shoot support flow</span></a><a href="#"><small>CONTACT</small><span>Book a shoot consult</span></a></div></div>
      </div></nav>`;
    const btn = head.querySelector(".tf-burger"), drawer = head.querySelector(".tf-drawer");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open);
      document.body.classList.toggle("menu-open", open);
      drawer.classList.toggle("is-open", open);
    });

    // First page only — hides while the Hero is visible, after leaving it, comes down once scrolling stops for 200ms
    const kv = document.querySelector('[data-slot="hero"]');
    if (page === "home" && kv) {
      let away = false, t;
      new IntersectionObserver(([e]) => { away = !e.isIntersecting; if (!away) head.classList.remove("is-show"); }, { threshold: 0 }).observe(kv);
      addEventListener("scroll", () => {
        if (!away || document.body.classList.contains("menu-open")) return;
        clearTimeout(t);
        t = setTimeout(() => away && head.classList.add("is-show"), 200);
      }, { passive: true });
    }
  }

  const vf = document.querySelector('[data-slot="viewfinder"]');
  if (vf) {
    vf.dataset.fx = "viewfinder-overlay";
    vf.setAttribute("data-fx-viewfinder-overlay", "top: .tf-head");
  }

  // Bands and subtitles are drawn from the left, 15% before the bottom of the screen
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.setAttribute("data-scroll", "in")), { rootMargin: "0px 0px -15%" });
  document.querySelectorAll(".js-fade").forEach((n) => (reduce ? n.setAttribute("data-scroll", "in") : io.observe(n)));

  // Parallax photo — like the original, while it spans the screen, push by element top × speed
  const floats = [...document.querySelectorAll("[data-speed]")];
  if (floats.length && !reduce) {
    const k = innerWidth < 768 ? 0.5 : 1;
    const tick = () => floats.forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) n.style.transform = `translateY(${r.top * parseFloat(n.dataset.speed) * k}px)`;
    });
    addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // Link line — when the mouse leaves, the line shrinks to the right, then returns to its left spot after .7s
  document.querySelectorAll(".js-link").forEach((n) => {
    n.addEventListener("mouseenter", () => n.classList.remove("no-hover", "is-hovered"));
    n.addEventListener("mouseleave", () => { n.classList.add("no-hover"); setTimeout(() => n.classList.add("is-hovered"), 700); });
  });

  fill();
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("tf-foot");
    const col = (label, items) => `<div class="tf-foot__col">${label ? `<p class="tf-label is-small"><span>${label}</span></p>` : ""}<ul>${items.map((it) => (Array.isArray(it) ? `<li><a href="#">${it[0]}<span>›</span></a><ul>${it[1].map((s) => `<li><a href="#">${s}</a></li>`).join("")}</ul></li>` : `<li><a href="#">${it}<span>›</span></a></li>`)).join("")}</ul></div>`;
    foot.innerHTML = `
      <div class="tf-foot__in">
        <div class="tf-foot__id">
          <a class="tf-foot__logo" href="index.html">${mark}<span>${word}</span></a>
          <p class="tf-foot__org">Your operating organization name here</p>
          <dl class="tf-foot__addr"><dt>Address</dt><dd>〒000-0000 One line of your address here<br>Your department name here</dd><dt>Tel</dt><dd>0000-00-0000</dd></dl>
        </div>
        <div class="tf-foot__side">
          <div class="tf-foot__menu">
            ${col("Dear creators", [["Shoot support · consultation", ["About the group", "Shoot support flow", "Downtown Access"]], "Location search", "Meals · Lodging"])}
            ${col("Dear Citizens", [["Location Scouting & Extras Registration", ["Brand registration", "Extras sign-up"]]])}
            ${col("", ["Key support record", "News"])}
          </div>
          <div class="tf-foot__bnr"><a href="#"><div class="wf-img" data-label="City banner"></div></a><a href="#"><div class="wf-img" data-label="Tourism Banner"></div></a><a href="#"><div class="wf-img" data-label="Association Banner"></div></a></div>
        </div>
      </div>
      <p class="tf-foot__copy">© 2026 Film Commission Promotion Council.</p>`;
  }
})();
