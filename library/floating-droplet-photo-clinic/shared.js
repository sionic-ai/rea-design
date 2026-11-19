// Frame and interaction shared by all pages — fills in the header, vertical nav, phone pill and footer, and hooks up Lenis (wide screens only), phone menu panel, phone pill relocation,
// When visible: is-show, lines rising staggered, letters splitting and brightening (SplitType), parallax, smooth anchor movement
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = matchMedia("(min-width: 1025px)");
  const page = document.body.dataset.page || "home";
  const ARROW = '<svg viewBox="0 0 9 9"><path d="M4.6.6 8.4 4.5 4.6 8.4 3.6 7.4l2.2-2.2H.6V3.8h5.2L3.6 1.6z"/></svg>';
  const icon = () => `<span class="kb-icon"><span class="kb-icon__dot"><i></i></span><span class="kb-icon__arrow"><i>${ARROW}</i></span></span>`;
  // Logo — three droplets (ear, nose, and neck shapes) and a name line. On hover the droplets bounce, each .11s later than the last
  const MARKS = '<path class="kb-logo__mark" d="M14 2c9-2 16 5 16 13 0 6-4 8-5 12-1 5-5 8-9 6-4-2-3-6-2-9 1-3-5-4-5-10C9 9 9 3 14 2z"/><path class="kb-logo__mark" d="M50 2c5 0 6 9 9 17 3 7 4 13-2 14-3 0-3-3-5-3s-2 3-5 3c-6-1-5-7-2-14 3-8 1-17 5-17z"/><path class="kb-logo__mark" d="M70 5c0-5 22-5 22 0 0 10-2 27-6 27-2 0-2-8-5-8s-3 8-5 8c-4 0-6-17-6-27z"/>';
  const logo = (tag = "p") => `<${tag} class="kb-logo"><a href="index.html" aria-label="Back to start"><svg viewBox="0 0 100 56">${MARKS}<rect class="kb-logo__name" x="8" y="40" width="84" height="6" rx="3"/><rect class="kb-logo__name" x="26" y="50" width="48" height="4" rx="2"/></svg></a></${tag}>`;
  const PHONE = '<svg viewBox="0 0 16 16"><path d="M4.2 1.2 6 4.6 4.8 6.2c.8 1.8 2.2 3.2 4 4l1.6-1.2 3.4 1.8-.6 2.8c-6.4 0-12-5.6-12-12z"/></svg>';
  const RESV = '<svg viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 5v11h14V8zm2 3h4v4H7z"/></svg>';
  window.kbTpl = { icon, ARROW, logo };
  const resv = (cls = "") => `<a href="reservation.html" class="kb-resv ${cls}${page === "reservation" ? " is-current" : ""}">${RESV}<span>Web submission<small>(Intake app)</small></span></a>`;
  const navLink = (href, txt, key) => `<li><a href="${href}"${page === key ? ' class="is-current"' : ""}><span class="kb-dot"><i></i><i></i></span>${txt}</a></li>`;

  document.querySelectorAll("[data-icon]").forEach((el) => (el.outerHTML = icon()));
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => (el.innerHTML = html));
  fill('[data-slot="header"]', `${logo("h1")}
    <div class="kb-header__inner">
      <nav class="kb-header__nav" id="kb-nav">
        <ul class="kb-header__list is-md">${navLink("about.html", "About the Hospital", "about")}${navLink("#", "Treatment Guide", "")}${navLink("#", "Hospital Tour", "")}</ul>
        <ul class="kb-header__list is-sm">${navLink("#", "Frequently asked questions", "")}${navLink("news.html", "Notice", "news")}${navLink("reservation.html", "Web submission", "reservation")}${navLink("#", "Inquiry", "")}</ul>
      </nav>
      <div class="kb-header__reserve">${resv()}</div>
    </div>
    <button class="kb-switch" type="button" aria-controls="kb-nav" aria-expanded="false"><span class="kb-switch__icon"><i></i><i></i><i></i></span><span class="kb-switch__txt"><span>Menu</span><span>Close</span></span></button>`);
  fill('[data-slot="fixed-nav"]', `<div class="kb-fnav__main">
      ${[["#", "Fever outpatient", '<path d="M12 2a3 3 0 0 1 3 3v8.3a5 5 0 1 1-6 0V5a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v9.4l-.4.3a3 3 0 1 0 2.8 0l-.4-.3V5a1 1 0 0 0-1-1z"/>'], ["#schedule", "Consultation Hours", '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 3v5l4 2-1 1.7-5-2.7V7z"/>'], ["#access", "Directions", '<path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>']]
        .map(([h, t, p]) => `<div class="kb-fnav__item"><a href="${h}"><span class="kb-fnav__icon"><svg viewBox="0 0 24 24">${p}</svg></span><p class="kb-fnav__txt">${t}</p></a></div>`).join("")}
    </div>
    <div class="kb-fnav__sub"><p class="kb-fnav__copy"><small>© 0000 CLINIC</small></p>
      <ul class="kb-fnav__sns"><li><a href="#" aria-label="Photo SNS"><svg viewBox="0 0 24 24"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg></a></li><li><a href="#" aria-label="Messenger"><svg viewBox="0 0 24 24"><path d="M12 3c5 0 9 3.3 9 7.5S17 18 12 18l-1 0-4 3v-3.6C4.6 16.2 3 13.6 3 10.5 3 6.3 7 3 12 3z"/></svg></a></li></ul></div>`);
  fill('[data-slot="fixed-tel"]', `<p class="kb-tel__num"><a href="#">${PHONE}0000-00-0000</a></p>
    <p class="kb-tel__label"><a href="index.html"><svg class="kb-tel__mark" viewBox="0 0 100 36">${MARKS}</svg><span class="kb-pc">Ear, nose and throat (medical department)</span><span class="kb-sp">Consultation Hours</span></a></p>`);
  fill('[data-slot="footer"]', `<div class="kb-foot__inner"><div class="kb-foot__main">
      <div class="kb-foot__logo">${logo("div").replace('class="kb-logo"', 'class="kb-logo kb-foot__logo-in"')}</div>
      <address id="access" class="kb-foot__address">〒000-0000 One line of your address here<br>Fax: 0000-00-0000</address>
      <div class="kb-foot__flex"><section class="kb-foot__contact"><h2>Phone Inquiry</h2><p class="kb-foot__tel">${PHONE}<a href="#">0000-00-0000</a></p><p class="kb-foot__time">Reception hours : 0:00~00:00 / 00:00~00:00</p></section>
        <div class="kb-foot__resv">${resv()}</div></div>
      <div id="schedule"><table class="kb-sched"><thead><tr><th>Consultation Hours</th><th>Month</th><th>Fire</th><th>Number</th><th>Neck</th><th>Gold</th><th>Earth</th><th>Day</th><th>Rest</th></tr></thead>
        <tbody><tr><th>00:00〜00:00</th><td>●</td><td>●</td><td>●</td><td>△</td><td>●</td><td>●</td><td>-</td><td>-</td></tr><tr><th>00:00〜00:00</th><td>●</td><td>●</td><td>●</td><td>△</td><td>●</td><td>-</td><td>-</td><td>-</td></tr></tbody></table></div>
      <p class="kb-foot__note">△ : One line on timetable exceptions here</p>
      <div class="kb-foot__notes"><p>Your one-line counter hours notice here</p><p>Your Saturday reception hours here, one line</p><p>Your one-line app reception hours notice here</p></div>
    </div>
    <div class="kb-foot__map"><div class="wf-img" data-label="Map embed · hospital location pin · fills the right panel"></div></div></div>`);

  // Lenis — as in the original, only on wide screens (769px+), default lerp, touch sync
  let lenis = null;
  const lenisOn = () => {
    if (lenis || reduce || !window.Lenis) return;
    lenis = new Lenis({ smoothWheel: true, syncTouch: true });
    window.lenis = lenis;
    const raf = (t) => { if (!lenis) return; lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };
  const lenisMq = matchMedia("(min-width: 769px)");
  const lenisSet = () => { if (lenisMq.matches) lenisOn(); else if (lenis) { lenis.destroy(); lenis = null; } };
  lenisMq.addEventListener("change", lenisSet);
  lenisSet();
  new ResizeObserver(() => lenis?.resize()).observe(document.body);

  // Anchor move — .8s outer cubic curve, -80px on wide screens, -50px on phones
  const cubic = (t) => 1 - Math.pow(1 - t, 3);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute("href") === "#") { e.preventDefault(); return; }
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const off = desk.matches ? -80 : -50;
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 0.8, easing: cubic });
    else scrollTo({ top: t.getBoundingClientRect().top + scrollY + off, behavior: reduce ? "auto" : "smooth" });
    setMenu(false);
  });

  // Phone menu panel
  const sw = document.querySelector(".kb-switch");
  const setMenu = (open) => {
    document.body.classList.toggle("is-sitemap-open", open);
    sw?.setAttribute("aria-expanded", open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  sw?.addEventListener("click", () => setMenu(!document.body.classList.contains("is-sitemap-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Phone pill — past half the screen it drops out downward (.32s), then attaches at the top and enters from above, reversed when scrolling up
  const tel = document.querySelector(".kb-tel");
  if (tel) {
    let up = false, busy = false, want = false;
    const DUR = 320;
    const swap = () => {
      if (busy || want === up) return;
      busy = true;
      const to = want;
      tel.classList.remove("is-in-top", "is-in-bottom");
      tel.classList.add(to ? "is-out-bottom" : "is-out-top");
      setTimeout(() => {
        tel.classList.remove("is-out-bottom", "is-out-top");
        tel.classList.toggle("is-scrolled", to);
        tel.classList.add(to ? "is-in-top" : "is-in-bottom");
        up = to;
        setTimeout(() => { busy = false; swap(); }, DUR);
      }, reduce ? 0 : DUR);
    };
    const check = () => { if (!desk.matches) return; want = scrollY > innerHeight * 0.5; swap(); };
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // When visible, add is-show — original js-scroll-timing (once past the bottom 15%)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-show"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
  document.querySelectorAll(".js-show").forEach((el) => (reduce ? el.classList.add("is-show") : io.observe(el)));

  // Staggered line rise — data-step (seconds), data-offset (rem), .6s cubic ease-out curve
  document.querySelectorAll(".js-stagger").forEach((box) => {
    const step = +(box.dataset.step ?? 0.12), off = box.dataset.offset ?? "1.2rem", fade = box.dataset.anim === "fade";
    [...box.children].forEach((c, i) => {
      c.classList.add("kb-stg");
      c.style.setProperty("--stg-delay", `${i * step}s`);
      if (!fade) c.style.setProperty("--stg-y", off);
    });
  });

  // Split-letter fade-in — with SplitType each letter goes .3 → 1, delayed by data-split-delay seconds
  if (window.SplitType) document.querySelectorAll("[data-split]").forEach((el) => {
    const s = new SplitType(el, { types: "chars", tagName: "span" });
    const d = +(el.dataset.splitDelay ?? 0.04);
    s.chars?.forEach((c, i) => c.style.setProperty("transition-delay", `${(i * d).toFixed(2)}s`));
  });

  // Parallax — original parallax: with progress p (0~1) of the reference panel passing from screen bottom to top, shifts by -(p-.5)×2×max px, and
  // Scaled up by 1 + 2×max/board height so no gap shows. If data-rendered exists, only scenes with that class
  const para = [...document.querySelectorAll(".js-parallax")];
  if (para.length && !reduce) {
    const tick = () => {
      para.forEach((el) => {
        if (el.dataset.rendered && !el.classList.contains(el.dataset.rendered)) return;
        const box = (el.dataset.anchor && el.closest(el.dataset.anchor)) || el.parentElement;
        const r = box.getBoundingClientRect();
        const max = +(desk.matches ? el.dataset.max ?? 20 : el.dataset.maxSp ?? el.dataset.max ?? 20);
        const p = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (r.height + innerHeight)));
        const t = `translate3d(0, ${(-(p - 0.5) * max * 2).toFixed(2)}px, 0) scale(${(1 + (max * 2) / (r.height || innerHeight)).toFixed(4)})`;
        if (el.style.transform !== t) el.style.transform = t;
      });
    };
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
    addEventListener("resize", tick);
    // A newly drawn scene gets its parallax value at the moment it becomes visible — one frame late and it jumps up from the origin (0)
    addEventListener("kb:parallax", tick);
    tick();
  }

  // Pinned sequence — on wide screens, once its home position reaches 5rem from the top it sticks to the screen at the same position and width (original sticky-fix)
  document.querySelectorAll("[data-sticky]").forEach((nav) => {
    const ph = document.createElement("div");
    nav.before(ph);
    const top = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 5;
    const mt = parseFloat(getComputedStyle(nav).marginTop) || 0;
    const check = () => {
      if (!desk.matches) { nav.classList.remove("is-fixed"); nav.style.removeProperty("left"); nav.style.removeProperty("width"); ph.style.height = "0px"; return; }
      const r = ph.getBoundingClientRect();
      const fixed = r.top + mt <= top();
      if (fixed && !nav.classList.contains("is-fixed")) { ph.style.height = `${nav.offsetHeight + mt}px`; nav.style.left = `${r.left}px`; nav.style.width = `${r.width}px`; }
      nav.classList.toggle("is-fixed", fixed);
      if (!fixed) { ph.style.height = "0px"; nav.style.removeProperty("left"); nav.style.removeProperty("width"); }
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
  });
})();
